import { parseMermaid } from '../mermaid/parseMermaid';
import { defaultsForShape } from '../palette';
import { buildEdge } from './edgeUtils';
import { autoLayout } from './layout';
import type { AppEdge, AppNode, Direction } from '../types';

export interface FlowContent {
  direction: Direction;
  nodes: AppNode[];
  edges: AppEdge[];
}

// Mermaidテキスト → React Flowのノード/エッジ(自動レイアウト済み)
export function mermaidToFlow(text: string): FlowContent {
  const graph = parseMermaid(text);

  const nodes: AppNode[] = graph.nodes.map((pn) => {
    const [title, ...rest] = pn.label.split('\n');
    const description = rest.join('\n').trim() || undefined;
    const defaults = defaultsForShape(pn.shape, title);
    return {
      id: pn.id,
      type: 'shape',
      position: { x: 0, y: 0 },
      data: {
        title: title || pn.id,
        description,
        shape: pn.shape,
        icon: defaults.icon,
        color: defaults.color,
      },
    };
  });

  const edges: AppEdge[] = graph.edges.map((pe, i) =>
    buildEdge(pe, graph.direction, `e${i + 1}_${pe.source}_${pe.target}`),
  );

  return {
    direction: graph.direction,
    nodes: autoLayout(nodes, edges, graph.direction),
    edges,
  };
}
