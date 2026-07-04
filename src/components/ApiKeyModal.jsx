import { useState } from 'react'

export default function ApiKeyModal({ currentKey, onSave, onClose, canClose }) {
  const [key, setKey] = useState(currentKey)

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Gemini API キーの設定</h2>
        <p className="modal-desc">
          Google AI Studio の APIキーを入力してください。<br />
          キーはこのブラウザにのみ保存され、外部には送信されません。
        </p>
        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && key.trim() && onSave(key.trim())}
          placeholder="AIzaSy..."
          className="key-input"
          autoFocus
        />
        <div className="modal-actions">
          <button
            className="btn-primary"
            onClick={() => onSave(key.trim())}
            disabled={!key.trim()}
          >
            保存
          </button>
          {canClose && (
            <button className="btn-secondary" onClick={onClose}>
              キャンセル
            </button>
          )}
        </div>
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="api-key-link"
        >
          APIキーを取得する →
        </a>
      </div>
    </div>
  )
}
