import { useState } from 'react';
import type {
  AppEdge,
  AppNode,
  ColorName,
  EdgeData,
  EdgeVariant,
  IconName,
  NodeShape,
  ShapeNodeData,
} from '../types';
import { COLOR_ORDER, ICON_ORDER, SHAPE_LABELS } from '../types';
import { Icon } from './Icon';

const SHAPES = Object.keys(SHAPE_LABELS) as NodeShape[];

const VARIANT_LABELS: Record<EdgeVariant, string> = {
  solid: '実線',
  dotted: '点線',
  thick: '太線',
};

interface PropertiesPanelProps {
  node: AppNode | null;
  edge: AppEdge | null;
  nodes: AppNode[];
  edges: AppEdge[];
  onNodeChange: (id: string, patch: Partial<ShapeNodeData>) => void;
  onEdgeChange: (id: string, patch: { label?: string; data?: Partial<EdgeData> }) => void;
  onSelectEdge: (id: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function PropertiesPanel({
  node,
  edge,
  nodes,
  edges,
  onNodeChange,
  onEdgeChange,
  onSelectEdge,
  onDelete,
  onClose,
}: PropertiesPanelProps) {
  const [tab, setTab] = useState<'props' | 'connections'>('props');

  if (!node && !edge) return null;

  const connections = node
    ? edges.filter((e) => e.source === node.id || e.target === node.id)
    : [];
  const titleOf = (id: string) => nodes.find((n) => n.id === id)?.data.title ?? id;

  return (
    <aside className="props-panel">
      <div className="props-header">
        {node && (
          <span className={`props-header-icon pc-${node.data.color}`}>
            <Icon name={node.data.icon} size={15} />
          </span>
        )}
        <span className="props-header-title">
          {node ? node.data.title : '接続線'}
        </span>
        <button type="button" className="props-close" onClick={onClose} aria-label="閉じる">
          ×
        </button>
      </div>

      {node && (
        <div className="props-tabs">
          <button
            type="button"
            className={`props-tab${tab === 'props' ? ' active' : ''}`}
            onClick={() => setTab('props')}
          >
            プロパティ
          </button>
          <button
            type="button"
            className={`props-tab${tab === 'connections' ? ' active' : ''}`}
            onClick={() => setTab('connections')}
          >
            接続 ({connections.length})
          </button>
        </div>
      )}

      <div className="props-scroll">
        {node && tab === 'props' && (
          <>
            <div className="props-section">一般</div>
            <label className="props-field">
              <span>タイトル</span>
              <input
                type="text"
                value={node.data.title}
                onChange={(e) => onNodeChange(node.id, { title: e.target.value })}
              />
            </label>
            <label className="props-field">
              <span>説明</span>
              <textarea
                value={node.data.description ?? ''}
                rows={2}
                placeholder="(なし)"
                onChange={(e) => onNodeChange(node.id, { description: e.target.value })}
              />
            </label>
            <label className="props-field">
              <span>形状</span>
              <select
                value={node.data.shape}
                onChange={(e) => onNodeChange(node.id, { shape: e.target.value as NodeShape })}
              >
                {SHAPES.map((s) => (
                  <option key={s} value={s}>
                    {SHAPE_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>

            <div className="props-section">スタイル</div>
            <div className="props-field">
              <span>カラー</span>
              <div className="color-row">
                {COLOR_ORDER.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`color-swatch sw-${c}${node.data.color === c ? ' active' : ''}`}
                    onClick={() => onNodeChange(node.id, { color: c as ColorName })}
                    aria-label={c}
                  />
                ))}
              </div>
            </div>
            <div className="props-field">
              <span>アイコン</span>
              <div className="icon-grid">
                {ICON_ORDER.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    className={`icon-cell${node.data.icon === ic ? ' active' : ''}`}
                    onClick={() => onNodeChange(node.id, { icon: ic as IconName })}
                    aria-label={ic}
                  >
                    <Icon name={ic} size={15} />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {node && tab === 'connections' && (
          <div className="conn-list">
            {connections.length === 0 && <div className="conn-empty">接続はありません</div>}
            {connections.map((e) => {
              const outgoing = e.source === node.id;
              const other = outgoing ? e.target : e.source;
              return (
                <button
                  key={e.id}
                  type="button"
                  className="conn-item"
                  onClick={() => onSelectEdge(e.id)}
                  title="クリックして接続線を選択"
                >
                  <span className={`conn-dir ${outgoing ? 'out' : 'in'}`}>
                    {outgoing ? '→' : '←'}
                  </span>
                  <span className="conn-text">
                    <span className="conn-title">{titleOf(other)}</span>
                    {typeof e.label === 'string' && e.label && (
                      <span className="conn-label">{e.label}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {edge && (
          <>
            <div className="props-section">接続線</div>
            <label className="props-field">
              <span>ラベル</span>
              <input
                type="text"
                value={typeof edge.label === 'string' ? edge.label : ''}
                placeholder="(なし)"
                onChange={(e) => onEdgeChange(edge.id, { label: e.target.value })}
              />
            </label>
            <label className="props-field">
              <span>線種</span>
              <select
                value={edge.data?.variant ?? 'solid'}
                onChange={(e) =>
                  onEdgeChange(edge.id, { data: { variant: e.target.value as EdgeVariant } })
                }
              >
                {(Object.keys(VARIANT_LABELS) as EdgeVariant[]).map((v) => (
                  <option key={v} value={v}>
                    {VARIANT_LABELS[v]}
                  </option>
                ))}
              </select>
            </label>
            <label className="props-check">
              <input
                type="checkbox"
                checked={edge.data?.arrow ?? true}
                onChange={(e) => onEdgeChange(edge.id, { data: { arrow: e.target.checked } })}
              />
              <span>矢印を表示</span>
            </label>
          </>
        )}
      </div>

      <div className="props-footer">
        <button type="button" className="btn btn-danger" onClick={onDelete}>
          削除
        </button>
      </div>
    </aside>
  );
}
