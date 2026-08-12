import type { ColorName, IconName, NodeShape } from './types';

export type PaletteCategory = 'basic' | 'logic' | 'data' | 'integration';

export interface PaletteKind {
  key: string;
  category: PaletteCategory;
  label: string;
  shape: NodeShape;
  icon: IconName;
  color: ColorName;
  title: string;
  description?: string;
}

export const CATEGORY_LABELS: Record<PaletteCategory, string> = {
  basic: '基本',
  logic: 'ロジック',
  data: 'データ',
  integration: '連携',
};

export const PALETTE: PaletteKind[] = [
  { key: 'rect', category: 'basic', label: '長方形', shape: 'rect', icon: 'box', color: 'indigo', title: '処理' },
  { key: 'rounded', category: 'basic', label: '角丸', shape: 'rounded', icon: 'box', color: 'blue', title: '処理' },
  { key: 'terminal', category: 'basic', label: '開始/終了', shape: 'stadium', icon: 'play', color: 'green', title: '開始' },
  { key: 'circle', category: 'basic', label: '円', shape: 'circle', icon: 'merge', color: 'gray', title: 'ノード' },
  { key: 'note', category: 'basic', label: 'ノート', shape: 'note', icon: 'note', color: 'yellow', title: 'メモ' },
  { key: 'io', category: 'basic', label: '入出力', shape: 'parallelogram', icon: 'document', color: 'teal', title: '入出力' },
  { key: 'decision', category: 'logic', label: '条件分岐', shape: 'diamond', icon: 'help', color: 'orange', title: '条件?' },
  { key: 'yesno', category: 'logic', label: 'はい/いいえ', shape: 'diamond', icon: 'help', color: 'orange', title: 'OK?' },
  { key: 'merge', category: 'logic', label: '合流', shape: 'circle', icon: 'merge', color: 'gray', title: '合流' },
  { key: 'subroutine', category: 'logic', label: 'サブ処理', shape: 'subroutine', icon: 'refresh', color: 'blue', title: 'サブ処理' },
  { key: 'database', category: 'data', label: 'データベース', shape: 'cylinder', icon: 'database', color: 'purple', title: 'データベース' },
  { key: 'table', category: 'data', label: 'テーブル', shape: 'rect', icon: 'table', color: 'blue', title: 'テーブル' },
  { key: 'document', category: 'data', label: 'ドキュメント', shape: 'rect', icon: 'document', color: 'gray', title: 'ドキュメント' },
  { key: 'api', category: 'integration', label: 'API', shape: 'rounded', icon: 'cloud', color: 'blue', title: 'API呼び出し' },
  { key: 'agent', category: 'integration', label: 'エージェント', shape: 'rounded', icon: 'bot', color: 'purple', title: 'AIエージェント' },
  { key: 'webhook', category: 'integration', label: 'Webhook', shape: 'rounded', icon: 'webhook', color: 'pink', title: 'Webhook' },
];

export function kindByKey(key: string): PaletteKind | undefined {
  return PALETTE.find((k) => k.key === key);
}

// Mermaidインポート時、形状からアイコンと色の初期値を決める
export const SHAPE_DEFAULTS: Record<NodeShape, { icon: IconName; color: ColorName }> = {
  rect: { icon: 'box', color: 'indigo' },
  rounded: { icon: 'box', color: 'blue' },
  stadium: { icon: 'play', color: 'green' },
  circle: { icon: 'merge', color: 'gray' },
  diamond: { icon: 'help', color: 'orange' },
  hexagon: { icon: 'refresh', color: 'teal' },
  parallelogram: { icon: 'document', color: 'teal' },
  cylinder: { icon: 'database', color: 'purple' },
  subroutine: { icon: 'refresh', color: 'blue' },
  note: { icon: 'note', color: 'yellow' },
};

const END_WORDS = /終了|完了|成功|end|done|success|finish/i;

export function defaultsForShape(shape: NodeShape, title: string): { icon: IconName; color: ColorName } {
  const base = SHAPE_DEFAULTS[shape] ?? SHAPE_DEFAULTS.rect;
  if (shape === 'stadium' && END_WORDS.test(title)) {
    return { ...base, icon: 'check' };
  }
  return base;
}
