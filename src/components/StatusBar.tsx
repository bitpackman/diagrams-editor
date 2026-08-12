import { useEffect, useState, type RefObject } from 'react';
import { getNodesBounds, useViewport } from '@xyflow/react';
import type { AppNode } from '../types';

interface StatusBarProps {
  nodes: AppNode[];
  cursorRef: RefObject<{ x: number; y: number }>;
}

export function StatusBar({ nodes, cursorRef }: StatusBarProps) {
  const { zoom } = useViewport();
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = window.setInterval(() => {
      const c = cursorRef.current;
      if (c) {
        setCursor((prev) => (prev.x === c.x && prev.y === c.y ? prev : { x: c.x, y: c.y }));
      }
    }, 120);
    return () => window.clearInterval(timer);
  }, [cursorRef]);

  const bounds = nodes.length ? getNodesBounds(nodes) : null;

  return (
    <footer className="statusbar">
      <span className="status-ready">
        <span className="dot dot-green" />
        準備完了
      </span>
      <span className="status-center">
        <span>
          キャンバス: {bounds ? `${Math.round(bounds.width)} × ${Math.round(bounds.height)}` : '—'}
        </span>
        <span>
          カーソル: ({Math.round(cursor.x)}, {Math.round(cursor.y)})
        </span>
        <span>グリッド: 20px</span>
        <span>ノード: {nodes.length}</span>
      </span>
      <span className="status-zoom">{Math.round(zoom * 100)}%</span>
    </footer>
  );
}
