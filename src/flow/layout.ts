import dagre from '@dagrejs/dagre';
import type { AppEdge, AppNode, Direction } from '../types';

function textUnits(line: string): number {
  let units = 0;
  for (const ch of line) {
    units += (ch.codePointAt(0) ?? 0) > 0x2e7f ? 2 : 1;
  }
  return units;
}

// 実測サイズがあればそれを使い、なければカードの内容量から推定する
export function nodeSize(node: AppNode): { width: number; height: number } {
  if (node.measured?.width && node.measured?.height) {
    return { width: node.measured.width, height: node.measured.height };
  }
  const titleUnits = Math.max(4, ...node.data.title.split('\n').map(textUnits));
  const desc = node.data.description?.trim();
  const descUnits = desc ? Math.max(...desc.split('\n').map(textUnits)) : 0;
  const contentUnits = Math.max(titleUnits * 7.5, descUnits * 6);

  let width = Math.min(320, Math.max(150, contentUnits + 78));
  let height = desc ? 66 : 48;

  switch (node.data.shape) {
    case 'diamond':
      width = Math.min(340, Math.max(170, contentUnits + 120));
      height = desc ? 120 : 96;
      break;
    case 'circle': {
      const d = Math.max(96, Math.min(200, titleUnits * 7.5 + 56));
      width = d;
      height = d;
      break;
    }
    case 'stadium':
      height = desc ? 64 : 52;
      break;
    case 'hexagon':
    case 'parallelogram':
      width += 28;
      break;
  }
  return { width, height };
}

export function autoLayout(nodes: AppNode[], edges: AppEdge[], direction: Direction): AppNode[] {
  if (!nodes.length) return nodes;

  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80, marginx: 24, marginy: 24 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    g.setNode(node.id, nodeSize(node));
  }
  for (const edge of edges) {
    if (edge.source !== edge.target && g.hasNode(edge.source) && g.hasNode(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    const { width, height } = nodeSize(node);
    return {
      ...node,
      position: { x: pos.x - width / 2, y: pos.y - height / 2 },
    };
  });
}
