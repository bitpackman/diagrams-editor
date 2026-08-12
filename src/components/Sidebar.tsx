import { useMemo, useState } from 'react';
import { CATEGORY_LABELS, PALETTE, type PaletteCategory, type PaletteKind } from '../palette';
import { TEMPLATES } from '../templates';
import { Icon } from './Icon';

const CATEGORIES: PaletteCategory[] = ['basic', 'logic', 'data', 'integration'];

interface SidebarProps {
  onAddNode: (kind: PaletteKind) => void;
  onLoadTemplate: (key: string) => void;
}

export function Sidebar({ onAddNode, onLoadTemplate }: SidebarProps) {
  const [tab, setTab] = useState<'library' | 'templates'>('library');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PALETTE;
    return PALETTE.filter(
      (k) =>
        k.label.toLowerCase().includes(q) ||
        k.title.toLowerCase().includes(q) ||
        k.key.includes(q),
    );
  }, [query]);

  return (
    <aside className="sidebar">
      <div className="sidebar-tabs">
        <button
          type="button"
          className={`sidebar-tab${tab === 'library' ? ' active' : ''}`}
          onClick={() => setTab('library')}
        >
          ライブラリ
        </button>
        <button
          type="button"
          className={`sidebar-tab${tab === 'templates' ? ' active' : ''}`}
          onClick={() => setTab('templates')}
        >
          テンプレート
        </button>
      </div>

      {tab === 'library' ? (
        <>
          <div className="sidebar-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ノードを検索"
              spellCheck={false}
            />
          </div>
          <div className="sidebar-scroll">
            {CATEGORIES.map((cat) => {
              const items = filtered.filter((k) => k.category === cat);
              if (!items.length) return null;
              return (
                <section key={cat} className="palette-section">
                  <div className="palette-heading">{CATEGORY_LABELS[cat]}</div>
                  <div className="palette-grid">
                    {items.map((kind) => (
                      <button
                        key={kind.key}
                        type="button"
                        className="palette-item"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/diagrams-kind', kind.key);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onClick={() => onAddNode(kind)}
                        title={`${kind.label}を追加(ドラッグでも配置できます)`}
                      >
                        <span className={`pal-tile pc-${kind.color}`}>
                          <Icon name={kind.icon} size={18} />
                        </span>
                        <span className="pal-label">{kind.label}</span>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
            {!filtered.length && <div className="palette-empty">該当するノードがありません</div>}
          </div>
        </>
      ) : (
        <div className="sidebar-scroll">
          <div className="template-list">
            {TEMPLATES.map((t) => (
              <button
                key={t.key}
                type="button"
                className="template-item"
                onClick={() => onLoadTemplate(t.key)}
              >
                <span className="template-name">{t.name}</span>
                <span className="template-desc">{t.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
