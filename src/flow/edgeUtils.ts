import { MarkerType } from '@xyflow/react';
import type { CSSProperties } from 'react';
import type { AppEdge, Direction, EdgeData } from '../types';
import type { ParsedEdge } from '../mermaid/parseMermaid';

const ARROW = {
  type: MarkerType.ArrowClosed,
  width: 17,
  height: 17,
  color: '#6b7280',
} as const;

export function edgeVisuals(data: EdgeData): Pick<AppEdge, 'style' | 'markerEnd' | 'markerStart'> {
  const style: CSSProperties = {
    stroke: '#6b7280',
    strokeWidth: data.variant === 'thick' ? 3 : 1.6,
  };
  if (data.variant === 'dotted') {
    style.strokeDasharray = '7 5';
  }
  return {
    style,
    markerEnd: data.arrow ? { ...ARROW } : undefined,
    markerStart: data.arrow && data.bidir ? { ...ARROW } : undefined,
  };
}

export function handlesFor(direction: Direction): { sourceHandle: string; targetHandle: string } {
  return direction === 'LR'
    ? { sourceHandle: 's-right', targetHandle: 't-left' }
    : { sourceHandle: 's-bottom', targetHandle: 't-top' };
}

export function buildEdge(parsed: ParsedEdge, direction: Direction, id: string): AppEdge {
  const data: EdgeData = {
    variant: parsed.variant,
    arrow: parsed.arrow,
    bidir: parsed.bidir,
  };
  return {
    id,
    source: parsed.source,
    target: parsed.target,
    label: parsed.label,
    type: 'smoothstep',
    data,
    ...handlesFor(direction),
    ...edgeVisuals(data),
  };
}
