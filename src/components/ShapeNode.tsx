import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import type { AppNode } from '../types';
import { Icon } from './Icon';

// アイコンを色付き円チップで表示する形状(それ以外は色付きグリフのみ)
const CHIP_SHAPES = new Set(['stadium', 'diamond', 'circle']);

function ShapeNodeComponent({ id, data, selected }: NodeProps<AppNode>) {
  const { updateNodeData } = useReactFlow();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEditing = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setDraft(data.title);
      setEditing(true);
    },
    [data.title],
  );

  const commit = useCallback(() => {
    const next = draft.trim();
    if (next) {
      updateNodeData(id, { title: next });
    }
    setEditing(false);
  }, [draft, id, updateNodeData]);

  const desc = data.description?.trim();

  return (
    <div
      className={`sn sn-${data.shape} c-${data.color}${selected ? ' selected' : ''}`}
      onDoubleClick={startEditing}
    >
      {selected && (
        <>
          <span className="sn-corner tl" />
          <span className="sn-corner tr" />
          <span className="sn-corner bl" />
          <span className="sn-corner br" />
        </>
      )}
      <div className="sn-shell">
        <div className="sn-body">
          <span className={`sn-icon${CHIP_SHAPES.has(data.shape) ? ' chip' : ''}`}>
            <Icon name={data.icon} size={CHIP_SHAPES.has(data.shape) ? 14 : 17} />
          </span>
          <div className="sn-text">
            {editing ? (
              <input
                ref={inputRef}
                className="sn-edit nodrag"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commit();
                  } else if (e.key === 'Escape') {
                    setEditing(false);
                  }
                }}
              />
            ) : (
              <span className="sn-title">{data.title}</span>
            )}
            {desc && !editing && <span className="sn-desc">{desc}</span>}
          </div>
        </div>
      </div>
      <Handle type="target" position={Position.Top} id="t-top" />
      <Handle type="target" position={Position.Left} id="t-left" />
      <Handle type="source" position={Position.Bottom} id="s-bottom" />
      <Handle type="source" position={Position.Right} id="s-right" />
    </div>
  );
}

export const ShapeNode = memo(ShapeNodeComponent);
