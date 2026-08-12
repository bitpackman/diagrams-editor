import type { AppEdge, AppNode, Direction, NodeShape } from '../types';

const SHAPE_BRACKETS: Record<NodeShape, [string, string]> = {
  rect: ['[', ']'],
  rounded: ['(', ')'],
  stadium: ['([', '])'],
  circle: ['((', '))'],
  diamond: ['{', '}'],
  hexagon: ['{{', '}}'],
  parallelogram: ['[/', '/]'],
  cylinder: ['[(', ')]'],
  subroutine: ['[[', ']]'],
  note: ['[', ']'],
};

function safeId(id: string): string {
  return id.replace(/[\s[\](){}|"'<>=&;%-]/g, '_');
}

function escapeLabel(label: string): string {
  let s = label.replace(/\r?\n/g, '<br/>');
  if (!s) return ' ';
  if (/[[\](){}|"<>&;%]|^\s|\s$|--|=>|\.-/.test(s)) {
    s = `"${s.replace(/"/g, '#quot;')}"`;
  }
  return s;
}

function nodeLabel(node: AppNode): string {
  const desc = node.data.description?.trim();
  return desc ? `${node.data.title}\n${desc}` : node.data.title;
}

function connectorFor(edge: AppEdge): string {
  const variant = edge.data?.variant ?? 'solid';
  const arrow = edge.data?.arrow ?? true;
  const bidir = edge.data?.bidir ?? false;
  let conn: string;
  switch (variant) {
    case 'dotted':
      conn = arrow ? '-.->' : '-.-';
      break;
    case 'thick':
      conn = arrow ? '==>' : '===';
      break;
    default:
      conn = arrow ? '-->' : '---';
  }
  if (bidir && arrow) conn = `<${conn}`;
  return conn;
}

export function toMermaid(nodes: AppNode[], edges: AppEdge[], direction: Direction): string {
  const lines: string[] = [`flowchart ${direction === 'LR' ? 'LR' : 'TD'}`];

  for (const node of nodes) {
    const [open, close] = SHAPE_BRACKETS[node.data.shape] ?? SHAPE_BRACKETS.rect;
    lines.push(`  ${safeId(node.id)}${open}${escapeLabel(nodeLabel(node))}${close}`);
  }

  for (const edge of edges) {
    const conn = connectorFor(edge);
    const label =
      typeof edge.label === 'string' && edge.label.trim() !== ''
        ? `|${escapeLabel(edge.label)}|`
        : '';
    lines.push(`  ${safeId(edge.source)} ${conn}${label} ${safeId(edge.target)}`);
  }

  return lines.join('\n');
}
