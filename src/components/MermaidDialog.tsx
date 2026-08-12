import { useEffect, useState } from 'react';

const SAMPLE = `flowchart TD
  A([開始]) --> B[データ読み込み]
  B --> C{データは正常?}
  C -->|はい| D[集計処理]
  C -->|いいえ| E[/エラー出力/]
  D --> F[(結果を保存)]
  E -.-> B
  F ==> G([終了])`;

interface MermaidDialogProps {
  mode: 'import' | 'export';
  exportText?: string;
  onImport: (text: string) => void;
  onClose: () => void;
}

export function MermaidDialog({ mode, exportText, onImport, onClose }: MermaidDialogProps) {
  const [text, setText] = useState(mode === 'export' ? (exportText ?? '') : '');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleImport = () => {
    try {
      onImport(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('クリップボードへのコピーに失敗しました');
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span>{mode === 'import' ? 'Mermaidをインポート' : 'Mermaidにエクスポート'}</span>
          <button type="button" className="modal-close" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>
        <textarea
          className="modal-textarea"
          value={text}
          readOnly={mode === 'export'}
          spellCheck={false}
          placeholder={'flowchart TD\n  A[開始] --> B{条件}\n  B -->|はい| C[処理]'}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
        />
        {error && <div className="modal-error">{error}</div>}
        <div className="modal-footer">
          {mode === 'import' ? (
            <>
              <button type="button" className="btn" onClick={() => { setText(SAMPLE); setError(null); }}>
                サンプルを挿入
              </button>
              <div className="modal-spacer" />
              <button type="button" className="btn" onClick={onClose}>
                キャンセル
              </button>
              <button type="button" className="btn btn-primary" onClick={handleImport}>
                インポート
              </button>
            </>
          ) : (
            <>
              <div className="modal-spacer" />
              <button type="button" className="btn btn-primary" onClick={handleCopy}>
                {copied ? 'コピーしました ✓' : 'コピー'}
              </button>
              <button type="button" className="btn" onClick={onClose}>
                閉じる
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
