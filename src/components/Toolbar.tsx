import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReactFlow, useViewport } from '@xyflow/react';
import type { Direction } from '../types';

export type CanvasTool = 'select' | 'pan';

interface ToolbarProps {
  tool: CanvasTool;
  onToolChange: (tool: CanvasTool) => void;
  direction: Direction;
  onDirectionChange: (dir: Direction) => void;
  onAutoLayout: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onImportMermaid: () => void;
  onImportJson: () => void;
  onExportMermaid: () => void;
  onExportJson: () => void;
  onExportPng: () => void;
  onClear: () => void;
}

function Dropdown({ label, icon, items }: {
  label: string;
  icon: ReactNode;
  items: Array<{ label: string; onClick: () => void }>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div className="dropdown" ref={ref}>
      <button type="button" className={`tb-btn${open ? ' active' : ''}`} onClick={() => setOpen(!open)}>
        {icon}
        <span>{label}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="dropdown-menu">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              className="dropdown-item"
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();
  return (
    <div className="zoom-group">
      <button type="button" className="tb-icon" onClick={() => zoomOut({ duration: 150 })} title="縮小">
        −
      </button>
      <button
        type="button"
        className="zoom-value"
        onClick={() => fitView({ padding: 0.2, duration: 300 })}
        title="全体を表示"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button type="button" className="tb-icon" onClick={() => zoomIn({ duration: 150 })} title="拡大">
        +
      </button>
    </div>
  );
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export function Toolbar(props: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="tb-group">
        <button
          type="button"
          className={`tb-icon${props.tool === 'select' ? ' active' : ''}`}
          onClick={() => props.onToolChange('select')}
          title="選択ツール (ドラッグで範囲選択)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}>
            <path d="M5 3l7 17 2.2-6.8L21 11z" />
          </svg>
        </button>
        <button
          type="button"
          className={`tb-icon${props.tool === 'pan' ? ' active' : ''}`}
          onClick={() => props.onToolChange('pan')}
          title="手のひらツール (ドラッグで移動)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}>
            <path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11m0-5.5v-1a1.5 1.5 0 0 1 3 0V11m0-4.5a1.5 1.5 0 0 1 3 0V13" />
            <path d="M17 12.5a1.5 1.5 0 0 1 3 1L18.5 18a6 6 0 0 1-5.8 4.5c-2.5 0-4-1-5.4-3L4.5 15c-1-1.5 1-3 2.3-1.8L8 14.5" />
          </svg>
        </button>
      </div>

      <div className="tb-sep" />

      <div className="tb-group">
        <button type="button" className="tb-icon" disabled={!props.canUndo} onClick={props.onUndo} title="元に戻す (⌘Z)">
          <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}>
            <path d="M9 14L4 9l5-5" />
            <path d="M4 9h9a7 7 0 0 1 7 7v4" />
          </svg>
        </button>
        <button type="button" className="tb-icon" disabled={!props.canRedo} onClick={props.onRedo} title="やり直す (⇧⌘Z)">
          <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}>
            <path d="M15 14l5-5-5-5" />
            <path d="M20 9h-9a7 7 0 0 0-7 7v4" />
          </svg>
        </button>
      </div>

      <div className="tb-sep" />

      <div className="tb-group">
        <button type="button" className="tb-btn" onClick={props.onAutoLayout}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden>
            <path d="M12 2l2 6.5L20.5 10 14 12l-2 6.5L10 12 3.5 10 10 8.5z" />
          </svg>
          <span>自動レイアウト</span>
        </button>
        <div className="seg">
          <button
            type="button"
            className={`seg-btn${props.direction === 'TB' ? ' active' : ''}`}
            onClick={() => props.onDirectionChange('TB')}
            title="上から下へ"
          >
            縦
          </button>
          <button
            type="button"
            className={`seg-btn${props.direction === 'LR' ? ' active' : ''}`}
            onClick={() => props.onDirectionChange('LR')}
            title="左から右へ"
          >
            横
          </button>
        </div>
      </div>

      <div className="tb-spacer" />

      <ZoomControls />

      <div className="tb-sep" />

      <div className="tb-group">
        <Dropdown
          label="インポート"
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
              <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
          }
          items={[
            { label: 'Mermaid記法を貼り付け…', onClick: props.onImportMermaid },
            { label: 'JSONファイルを開く…', onClick: props.onImportJson },
          ]}
        />
        <Dropdown
          label="エクスポート"
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
              <path d="M12 15V3m0 0L8 7m4-4l4 4" />
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
          }
          items={[
            { label: 'PNG画像', onClick: props.onExportPng },
            { label: 'Mermaid記法', onClick: props.onExportMermaid },
            { label: 'JSONファイル', onClick: props.onExportJson },
          ]}
        />
        <button type="button" className="tb-btn danger" onClick={props.onClear} title="すべてのノードを削除">
          クリア
        </button>
      </div>
    </div>
  );
}
