import type { Direction, EdgeVariant, NodeShape } from '../types';

export interface ParsedNode {
  id: string;
  label: string;
  shape: NodeShape;
}

export interface ParsedEdge {
  source: string;
  target: string;
  label?: string;
  variant: EdgeVariant;
  arrow: boolean;
  bidir: boolean;
}

export interface ParsedGraph {
  direction: Direction;
  nodes: ParsedNode[];
  edges: ParsedEdge[];
}

export class MermaidParseError extends Error {
  line: number;
  constructor(message: string, line: number) {
    super(message);
    this.name = 'MermaidParseError';
    this.line = line;
  }
}

// 行頭がこれらのキーワードの行は読み飛ばす(スタイル定義・サブグラフ境界など)
const SKIP_LINE = /^(subgraph\b|end\b|classDef\b|class\b|style\b|linkStyle\b|click\b|direction\b|accTitle\b|accDescr\b)/;

// 接続記号。長いパターンを先に置く(-.->, ==>, -->, --- など)
const CONNECTOR =
  /\s*(<-{2,}>|-{2,}>|-{3,}|-\.+->|-\.+-|<={2,}>|={2,}>|={3,}|--[xo])\s*(?:\|([^|]*)\|)?\s*/g;

// ノード形状の括弧。開き括弧が長いものを先に判定する
const SHAPE_PAIRS: Array<[string, string, NodeShape]> = [
  ['((', '))', 'circle'],
  ['([', '])', 'stadium'],
  ['[[', ']]', 'subroutine'],
  ['[(', ')]', 'cylinder'],
  ['{{', '}}', 'hexagon'],
  ['[/', '/]', 'parallelogram'],
  ['[/', '\\]', 'parallelogram'],
  ['[\\', '\\]', 'parallelogram'],
  ['[\\', '/]', 'parallelogram'],
  ['[', ']', 'rect'],
  ['(', ')', 'rounded'],
  ['{', '}', 'diamond'],
];

export function parseMermaid(source: string): ParsedGraph {
  // コードフェンス(```mermaid)ごと貼り付けられても読めるようにする
  let text = source.replace(/^\s*```(?:mermaid)?\s*$/gim, '');

  // クォート内文字列を退避し、記号を含むラベルが構文解析を壊さないようにする
  const strings: string[] = [];
  text = text.replace(/"([^"]*)"/g, (_m, s: string) => `\u0000${strings.push(s) - 1}\u0000`);
  const restore = (s: string) =>
    s.replace(/\u0000(\d+)\u0000/g, (_m, i: string) => strings[Number(i)] ?? '');

  const nodesMap = new Map<string, ParsedNode>();
  const edges: ParsedEdge[] = [];
  let direction: Direction = 'TB';

  const cleanLabel = (raw: string): string =>
    restore(raw)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/#quot;/g, '"')
      .replace(/#amp;/g, '&')
      .trim();

  const registerNode = (id: string, label?: string, shape?: NodeShape) => {
    const existing = nodesMap.get(id);
    if (existing) {
      if (label !== undefined) {
        existing.label = label || id;
        if (shape) existing.shape = shape;
      }
      return;
    }
    nodesMap.set(id, {
      id,
      label: label !== undefined && label !== '' ? label : id,
      shape: shape ?? 'rect',
    });
  };

  const parseNodeToken = (token: string, lineNo: number): string => {
    const tok = token.trim();
    const m = /^([^\s[\](){}|"'<>=&]+)([\s\S]*)$/.exec(tok);
    if (!m) {
      throw new MermaidParseError(
        `${lineNo}行目: ノード定義を解析できません: 「${restore(tok)}」`,
        lineNo,
      );
    }
    const id = restore(m[1]);
    const rest = m[2].trim();
    if (!rest) {
      registerNode(id);
      return id;
    }
    for (const [open, close, shape] of SHAPE_PAIRS) {
      if (
        rest.startsWith(open) &&
        rest.endsWith(close) &&
        rest.length >= open.length + close.length
      ) {
        const label = cleanLabel(rest.slice(open.length, rest.length - close.length));
        registerNode(id, label, shape);
        return id;
      }
    }
    throw new MermaidParseError(
      `${lineNo}行目: ノードの形状を解析できません: 「${restore(rest)}」`,
      lineNo,
    );
  };

  const parseNodeGroup = (segment: string, lineNo: number): string[] => {
    const tokens = segment
      .split('&')
      .map((t) => t.trim())
      .filter(Boolean);
    if (!tokens.length) {
      throw new MermaidParseError(
        `${lineNo}行目: 接続の前後にノードがありません`,
        lineNo,
      );
    }
    return tokens.map((t) => parseNodeToken(t, lineNo));
  };

  const connInfo = (conn: string): { variant: EdgeVariant; arrow: boolean; bidir: boolean } => {
    let c = conn;
    let bidir = false;
    if (c.startsWith('<')) {
      bidir = true;
      c = c.slice(1);
    }
    if (/^-\.+->$/.test(c)) return { variant: 'dotted', arrow: true, bidir };
    if (/^-\.+-$/.test(c)) return { variant: 'dotted', arrow: false, bidir };
    if (/^={2,}>$/.test(c)) return { variant: 'thick', arrow: true, bidir };
    if (/^={3,}$/.test(c)) return { variant: 'thick', arrow: false, bidir };
    if (/^-{2,}>$/.test(c) || /^--[xo]$/.test(c)) return { variant: 'solid', arrow: true, bidir };
    return { variant: 'solid', arrow: false, bidir };
  };

  const parseStatement = (stmt: string, lineNo: number) => {
    // 「A -- ラベル --> B」形式を「A -->|ラベル| B」形式に正規化する
    const s = stmt
      .replace(/--\s+([^-<>|][^-]*?)\s+-->/g, '-->|$1|')
      .replace(/-\.\s+([^.]+?)\s+\.->/g, '-.->|$1|')
      .replace(/==\s+([^=]+?)\s+==>/g, '==>|$1|');

    const segments: string[] = [];
    const connectors: Array<{ conn: string; label?: string }> = [];
    let last = 0;
    let m: RegExpExecArray | null;
    CONNECTOR.lastIndex = 0;
    while ((m = CONNECTOR.exec(s))) {
      segments.push(s.slice(last, m.index));
      connectors.push({ conn: m[1], label: m[2] });
      last = CONNECTOR.lastIndex;
    }
    segments.push(s.slice(last));

    if (!connectors.length) {
      parseNodeGroup(segments[0], lineNo);
      return;
    }

    let prevIds = parseNodeGroup(segments[0], lineNo);
    connectors.forEach(({ conn, label }, i) => {
      const nextIds = parseNodeGroup(segments[i + 1], lineNo);
      const info = connInfo(conn);
      const edgeLabel = label !== undefined ? cleanLabel(label) : undefined;
      for (const src of prevIds) {
        for (const dst of nextIds) {
          edges.push({
            source: src,
            target: dst,
            label: edgeLabel || undefined,
            ...info,
          });
        }
      }
      prevIds = nextIds;
    });
  };

  text.split(/\r?\n/).forEach((rawLine, index) => {
    const lineNo = index + 1;
    const line = rawLine.replace(/%%.*$/, '').trim();
    if (!line) return;

    const header = /^(?:flowchart|graph)\b\s*(TB|TD|BT|LR|RL)?\s*$/i.exec(line);
    if (header) {
      const d = (header[1] ?? 'TB').toUpperCase();
      direction = d === 'LR' || d === 'RL' ? 'LR' : 'TB';
      return;
    }
    if (SKIP_LINE.test(line)) return;

    for (const stmt of line.split(';')) {
      const trimmed = stmt.trim();
      if (trimmed) parseStatement(trimmed, lineNo);
    }
  });

  if (!nodesMap.size) {
    throw new MermaidParseError(
      'ノードが見つかりませんでした。Mermaidのフローチャート記法(flowchart TD / graph LR など)を入力してください。',
      0,
    );
  }

  return { direction, nodes: [...nodesMap.values()], edges };
}
