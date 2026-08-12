import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  getNodesBounds,
  getViewportForBounds,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  SelectionMode,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type XYPosition,
} from '@xyflow/react';
import { toPng } from 'html-to-image';
import '@xyflow/react/dist/style.css';
import './App.css';

import type {
  AppEdge,
  AppNode,
  ColorName,
  Direction,
  EdgeData,
  ShapeNodeData,
} from './types';
import { kindByKey, type PaletteKind } from './palette';
import { TEMPLATES } from './templates';
import { mermaidToFlow, type FlowContent } from './flow/convert';
import { autoLayout } from './flow/layout';
import { edgeVisuals, handlesFor } from './flow/edgeUtils';
import { toMermaid } from './mermaid/toMermaid';
import { ShapeNode } from './components/ShapeNode';
import { Header } from './components/Header';
import { Toolbar, type CanvasTool } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { StatusBar } from './components/StatusBar';
import { MermaidDialog } from './components/MermaidDialog';

const nodeTypes = { shape: ShapeNode };

const STORAGE_KEY = 'diagrams-editor:v2';

const COLOR_ACCENT: Record<ColorName, string> = {
  indigo: '#6366f1',
  blue: '#3b82f6',
  green: '#22a06b',
  orange: '#f59e0b',
  purple: '#8b5cf6',
  teal: '#14b8a6',
  yellow: '#eab308',
  pink: '#ec4899',
  gray: '#6b7280',
  red: '#ef4444',
};

interface Saved {
  title: string;
  direction: Direction;
  nodes: AppNode[];
  edges: AppEdge[];
}

interface Snapshot {
  nodes: AppNode[];
  edges: AppEdge[];
  direction: Direction;
}

function loadInitial(): Saved {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<Saved>;
      if (Array.isArray(saved.nodes) && Array.isArray(saved.edges)) {
        return {
          title: typeof saved.title === 'string' ? saved.title : '無題の図',
          direction: saved.direction === 'LR' ? 'LR' : 'TB',
          nodes: saved.nodes,
          edges: saved.edges,
        };
      }
    }
  } catch {
    // 壊れた保存データは無視して初期テンプレートを使う
  }
  const template = TEMPLATES[0];
  const flow = mermaidToFlow(template.mermaid);
  return { title: template.name, direction: flow.direction, nodes: flow.nodes, edges: flow.edges };
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

function EditorInner() {
  const initialRef = useRef<Saved | null>(null);
  if (!initialRef.current) initialRef.current = loadInitial();
  const initial = initialRef.current;

  const [title, setTitle] = useState(initial.title);
  const [direction, setDirection] = useState<Direction>(initial.direction);
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>(initial.edges);
  const [tool, setTool] = useState<CanvasTool>('select');
  const [dialog, setDialog] = useState<'import' | 'export' | null>(null);
  const [hist, setHist] = useState({ canUndo: false, canRedo: false });

  const { screenToFlowPosition, fitView, deleteElements, getNodes } = useReactFlow<
    AppNode,
    AppEdge
  >();

  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const edgesRef = useRef(edges);
  edgesRef.current = edges;
  const directionRef = useRef(direction);
  directionRef.current = direction;

  const past = useRef<Snapshot[]>([]);
  const future = useRef<Snapshot[]>([]);
  const propGuard = useRef({ key: '', t: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });
  const idCounter = useRef(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const syncHist = useCallback(() => {
    setHist({ canUndo: past.current.length > 0, canRedo: future.current.length > 0 });
  }, []);

  const takeSnapshot = useCallback(() => {
    past.current.push({
      nodes: nodesRef.current,
      edges: edgesRef.current,
      direction: directionRef.current,
    });
    if (past.current.length > 100) past.current.shift();
    future.current = [];
    propGuard.current = { key: '', t: 0 };
    syncHist();
  }, [syncHist]);

  // テキスト入力の連続変更で履歴が1文字ごとに積まれないよう間引く
  const guardedSnapshot = useCallback(
    (key: string) => {
      const now = Date.now();
      if (propGuard.current.key !== key || now - propGuard.current.t > 800) {
        takeSnapshot();
      }
      propGuard.current = { key, t: now };
    },
    [takeSnapshot],
  );

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push({
      nodes: nodesRef.current,
      edges: edgesRef.current,
      direction: directionRef.current,
    });
    setNodes(prev.nodes);
    setEdges(prev.edges);
    setDirection(prev.direction);
    syncHist();
  }, [setEdges, setNodes, syncHist]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push({
      nodes: nodesRef.current,
      edges: edgesRef.current,
      direction: directionRef.current,
    });
    setNodes(next.nodes);
    setEdges(next.edges);
    setDirection(next.direction);
    syncHist();
  }, [setEdges, setNodes, syncHist]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [redo, undo]);

  // 自動保存(ローカルストレージ)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ title, direction, nodes, edges }));
      } catch {
        // 保存失敗(容量超過など)は無視
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [title, direction, nodes, edges]);

  const genId = useCallback(() => {
    let id = `n${idCounter.current}`;
    while (nodesRef.current.some((n) => n.id === id)) {
      idCounter.current += 1;
      id = `n${idCounter.current}`;
    }
    idCounter.current += 1;
    return id;
  }, []);

  const addNodeFromKind = useCallback(
    (kind: PaletteKind, position?: XYPosition) => {
      takeSnapshot();
      const pos =
        position ??
        screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      const node: AppNode = {
        id: genId(),
        type: 'shape',
        position: { x: pos.x - 80, y: pos.y - 24 },
        selected: true,
        data: {
          title: kind.title,
          description: kind.description,
          shape: kind.shape,
          icon: kind.icon,
          color: kind.color,
        },
      };
      setNodes((ns) => [...ns.map((n) => ({ ...n, selected: false })), node]);
      setEdges((es) => es.map((e) => (e.selected ? { ...e, selected: false } : e)));
    },
    [genId, screenToFlowPosition, setEdges, setNodes, takeSnapshot],
  );

  const onConnect = useCallback(
    (c: Connection) => {
      takeSnapshot();
      const data: EdgeData = { variant: 'solid', arrow: true };
      const edge: AppEdge = {
        id: `e_${crypto.randomUUID().slice(0, 8)}`,
        source: c.source,
        target: c.target,
        sourceHandle: c.sourceHandle,
        targetHandle: c.targetHandle,
        type: 'smoothstep',
        data,
        ...edgeVisuals(data),
      };
      setEdges((es) => addEdge(edge, es));
    },
    [setEdges, takeSnapshot],
  );

  const onNodeDataChange = useCallback(
    (id: string, patch: Partial<ShapeNodeData>) => {
      guardedSnapshot(`node:${id}`);
      setNodes((ns) => (ns.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n))));
    },
    [guardedSnapshot, setNodes],
  );

  const onEdgePatch = useCallback(
    (id: string, patch: { label?: string; data?: Partial<EdgeData> }) => {
      guardedSnapshot(`edge:${id}`);
      setEdges((es) =>
        es.map((e) => {
          if (e.id !== id) return e;
          const data: EdgeData = { variant: 'solid', arrow: true, ...e.data, ...patch.data };
          return {
            ...e,
            data,
            label: patch.label !== undefined ? patch.label || undefined : e.label,
            ...edgeVisuals(data),
          };
        }),
      );
    },
    [guardedSnapshot, setEdges],
  );

  const selectEdgeById = useCallback(
    (id: string) => {
      setEdges((es) => es.map((e) => ({ ...e, selected: e.id === id })));
      setNodes((ns) => ns.map((n) => (n.selected ? { ...n, selected: false } : n)));
    },
    [setEdges, setNodes],
  );

  const clearSelection = useCallback(() => {
    setNodes((ns) => ns.map((n) => (n.selected ? { ...n, selected: false } : n)));
    setEdges((es) => es.map((e) => (e.selected ? { ...e, selected: false } : e)));
  }, [setEdges, setNodes]);

  const deleteSelected = useCallback(() => {
    void deleteElements({
      nodes: nodesRef.current.filter((n) => n.selected),
      edges: edgesRef.current.filter((e) => e.selected),
    });
  }, [deleteElements]);

  const onBeforeDelete = useCallback(async () => {
    takeSnapshot();
    return true;
  }, [takeSnapshot]);

  const applyLayout = useCallback(
    (dir: Direction) => {
      takeSnapshot();
      setDirection(dir);
      setNodes(autoLayout(nodesRef.current, edgesRef.current, dir));
      setEdges((es) => es.map((e) => ({ ...e, ...handlesFor(dir) })));
      window.setTimeout(() => fitView({ padding: 0.15, duration: 300 }), 50);
    },
    [fitView, setEdges, setNodes, takeSnapshot],
  );

  const applyFlow = useCallback(
    (flow: FlowContent, newTitle?: string): boolean => {
      if (
        nodesRef.current.length &&
        !window.confirm('現在の図を置き換えます。よろしいですか?')
      ) {
        return false;
      }
      takeSnapshot();
      setDirection(flow.direction);
      setNodes(flow.nodes);
      setEdges(flow.edges);
      if (newTitle) setTitle(newTitle);
      setDialog(null);
      window.setTimeout(() => fitView({ padding: 0.15, duration: 300 }), 60);
      return true;
    },
    [fitView, setEdges, setNodes, takeSnapshot],
  );

  // MermaidDialogから呼ばれる。構文エラーはthrowしてダイアログ側で表示する
  const handleMermaidImport = useCallback(
    (text: string) => {
      const flow = mermaidToFlow(text);
      applyFlow(flow);
    },
    [applyFlow],
  );

  const loadTemplate = useCallback(
    (key: string) => {
      const template = TEMPLATES.find((t) => t.key === key);
      if (!template) return;
      const flow = mermaidToFlow(template.mermaid);
      applyFlow(flow, template.name);
    },
    [applyFlow],
  );

  const clearAll = useCallback(() => {
    if (!nodesRef.current.length) return;
    if (!window.confirm('すべてのノードと接続線を削除しますか?')) return;
    takeSnapshot();
    setNodes([]);
    setEdges([]);
  }, [setEdges, setNodes, takeSnapshot]);

  const exportPng = useCallback(async () => {
    const ns = getNodes();
    if (!ns.length) {
      window.alert('エクスポートするノードがありません');
      return;
    }
    const bounds = getNodesBounds(ns);
    const width = Math.max(360, Math.min(3200, Math.round(bounds.width * 1.5 + 120)));
    const height = Math.max(280, Math.min(3200, Math.round(bounds.height * 1.5 + 120)));
    const viewport = getViewportForBounds(bounds, width, height, 0.2, 3, 0.07);
    const el = document.querySelector<HTMLElement>('.react-flow__viewport');
    if (!el) return;
    try {
      const url = await toPng(el, {
        backgroundColor: '#f7f8fb',
        width,
        height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
      });
      triggerDownload(url, `${title.trim() || 'diagram'}.png`);
    } catch (e) {
      window.alert(`PNGの書き出しに失敗しました: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, [getNodes, title]);

  const exportJson = useCallback(() => {
    const payload = { app: 'diagrams-editor', version: 1, title, direction, nodes, edges };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${title.trim() || 'diagram'}.json`);
    window.setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, [direction, edges, nodes, title]);

  const onJsonFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      try {
        const parsed = JSON.parse(await file.text()) as Partial<Saved>;
        if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
          throw new Error('nodes / edges が含まれていません');
        }
        const importedNodes = parsed.nodes.map((n) => ({ ...n, type: 'shape' as const }));
        applyFlow(
          {
            direction: parsed.direction === 'LR' ? 'LR' : 'TB',
            nodes: importedNodes,
            edges: parsed.edges,
          },
          typeof parsed.title === 'string' ? parsed.title : undefined,
        );
      } catch (err) {
        window.alert(
          `JSONの読み込みに失敗しました: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
    [applyFlow],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/diagrams-kind')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      const kind = kindByKey(e.dataTransfer.getData('application/diagrams-kind'));
      if (!kind) return;
      e.preventDefault();
      addNodeFromKind(kind, screenToFlowPosition({ x: e.clientX, y: e.clientY }));
    },
    [addNodeFromKind, screenToFlowPosition],
  );

  const onCanvasDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains('react-flow__pane')) return;
      const kind = kindByKey('rect');
      if (kind) {
        addNodeFromKind(kind, screenToFlowPosition({ x: e.clientX, y: e.clientY }));
      }
    },
    [addNodeFromKind, screenToFlowPosition],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      cursorRef.current = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    },
    [screenToFlowPosition],
  );

  const selectedNodes = nodes.filter((n) => n.selected);
  const selectedEdges = edges.filter((e) => e.selected);
  const singleNode =
    selectedNodes.length === 1 && selectedEdges.length === 0 ? selectedNodes[0] : null;
  const singleEdge =
    selectedEdges.length === 1 && selectedNodes.length === 0 ? selectedEdges[0] : null;

  return (
    <div className="app">
      <Header title={title} onTitleChange={setTitle} />
      <Toolbar
        tool={tool}
        onToolChange={setTool}
        direction={direction}
        onDirectionChange={applyLayout}
        onAutoLayout={() => applyLayout(direction)}
        canUndo={hist.canUndo}
        canRedo={hist.canRedo}
        onUndo={undo}
        onRedo={redo}
        onImportMermaid={() => setDialog('import')}
        onImportJson={() => fileInputRef.current?.click()}
        onExportMermaid={() => setDialog('export')}
        onExportJson={exportJson}
        onExportPng={exportPng}
        onClear={clearAll}
      />
      <div className="main">
        <Sidebar onAddNode={addNodeFromKind} onLoadTemplate={loadTemplate} />
        <div
          className="canvas-wrap"
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDoubleClick={onCanvasDoubleClick}
          onPointerMove={onPointerMove}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onBeforeDelete={onBeforeDelete}
            onNodeDragStart={takeSnapshot}
            onSelectionDragStart={takeSnapshot}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.15}
            maxZoom={2.5}
            deleteKeyCode={['Backspace', 'Delete']}
            zoomOnDoubleClick={false}
            panOnDrag={tool === 'pan' ? true : [1, 2]}
            selectionOnDrag={tool === 'select'}
            selectionMode={SelectionMode.Partial}
            connectionRadius={30}
            defaultEdgeOptions={{ type: 'smoothstep' }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1.4} color="#d5d9e2" />
            <MiniMap
              position="bottom-left"
              pannable
              zoomable
              nodeColor={(n) => COLOR_ACCENT[(n as AppNode).data.color] ?? '#94a3b8'}
              nodeStrokeWidth={0}
            />
            <Controls position="bottom-left" showInteractive={false} />
          </ReactFlow>
        </div>
        {(singleNode || singleEdge) && (
          <PropertiesPanel
            node={singleNode}
            edge={singleEdge}
            nodes={nodes}
            edges={edges}
            onNodeChange={onNodeDataChange}
            onEdgeChange={onEdgePatch}
            onSelectEdge={selectEdgeById}
            onDelete={deleteSelected}
            onClose={clearSelection}
          />
        )}
      </div>
      <StatusBar nodes={nodes} cursorRef={cursorRef} />
      {dialog && (
        <MermaidDialog
          mode={dialog}
          exportText={dialog === 'export' ? toMermaid(nodes, edges, direction) : undefined}
          onImport={handleMermaidImport}
          onClose={() => setDialog(null)}
        />
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={onJsonFile}
      />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <EditorInner />
    </ReactFlowProvider>
  );
}
