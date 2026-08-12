import type { Edge, Node } from '@xyflow/react';

export type NodeShape =
  | 'rect'
  | 'rounded'
  | 'stadium'
  | 'circle'
  | 'diamond'
  | 'hexagon'
  | 'parallelogram'
  | 'cylinder'
  | 'subroutine'
  | 'note';

export type EdgeVariant = 'solid' | 'dotted' | 'thick';

export type Direction = 'TB' | 'LR';

export type ColorName =
  | 'indigo'
  | 'blue'
  | 'green'
  | 'orange'
  | 'purple'
  | 'teal'
  | 'yellow'
  | 'pink'
  | 'gray'
  | 'red';

export type IconName =
  | 'play'
  | 'check'
  | 'user'
  | 'mail'
  | 'send'
  | 'help'
  | 'database'
  | 'table'
  | 'document'
  | 'cloud'
  | 'bot'
  | 'webhook'
  | 'note'
  | 'merge'
  | 'box'
  | 'refresh'
  | 'flag'
  | 'image';

export type ShapeNodeData = {
  title: string;
  description?: string;
  shape: NodeShape;
  icon: IconName;
  color: ColorName;
  [key: string]: unknown;
};

export type EdgeData = {
  variant: EdgeVariant;
  arrow: boolean;
  bidir?: boolean;
  [key: string]: unknown;
};

export type AppNode = Node<ShapeNodeData, 'shape'>;
export type AppEdge = Edge<EdgeData>;

export const SHAPE_LABELS: Record<NodeShape, string> = {
  rect: '長方形',
  rounded: '角丸',
  stadium: '開始 / 終了',
  circle: '円',
  diamond: 'ひし形',
  hexagon: '六角形',
  parallelogram: '平行四辺形',
  cylinder: '円柱 (DB)',
  subroutine: 'サブルーチン',
  note: 'ノート',
};

export const COLOR_ORDER: ColorName[] = [
  'indigo',
  'blue',
  'teal',
  'green',
  'yellow',
  'orange',
  'red',
  'pink',
  'purple',
  'gray',
];

export const ICON_ORDER: IconName[] = [
  'box',
  'play',
  'check',
  'flag',
  'help',
  'user',
  'mail',
  'send',
  'database',
  'table',
  'document',
  'cloud',
  'bot',
  'webhook',
  'note',
  'merge',
  'refresh',
  'image',
];
