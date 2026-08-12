interface HeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
}

export function Header({ title, onTitleChange }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <span className="logo-mark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3" y="3" width="8" height="8" rx="2" fill="#fff" opacity="0.95" />
            <rect x="13" y="13" width="8" height="8" rx="2" fill="#fff" opacity="0.95" />
            <path d="M11 7h4a2 2 0 0 1 2 2v4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <span className="logo-text">Diagrams</span>
      </div>
      <div className="header-center">
        <input
          className="doc-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="無題の図"
          spellCheck={false}
        />
      </div>
      <div className="header-right">
        <span className="saved-badge">
          <span className="dot dot-green" />
          変更を保存済み
        </span>
        <span className="avatar" title="ローカル編集中">
          K
        </span>
      </div>
    </header>
  );
}
