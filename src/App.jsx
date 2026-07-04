import { useState } from 'react'
import Chat from './components/Chat'
import MindMap from './components/MindMap'
import ApiKeyModal from './components/ApiKeyModal'
import { loadSessions } from './utils/storage'
import './App.css'

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('nvc-api-key') || '')
  const [showModal, setShowModal] = useState(() => !localStorage.getItem('nvc-api-key'))
  const [sessions, setSessions] = useState(() => loadSessions())
  const [activeTab, setActiveTab] = useState('chat')

  const handleApiKeySave = (key) => {
    localStorage.setItem('nvc-api-key', key)
    setApiKey(key)
    setShowModal(false)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <span className="header-icon">🌿</span>
          <h1>NVC 感情マップ</h1>
        </div>
        <div className="header-right">
          <div className="tab-switcher">
            <button
              className={activeTab === 'chat' ? 'active' : ''}
              onClick={() => setActiveTab('chat')}
            >
              対話
            </button>
            <button
              className={activeTab === 'map' ? 'active' : ''}
              onClick={() => setActiveTab('map')}
            >
              マップ
            </button>
          </div>
          <button
            className="key-btn"
            onClick={() => setShowModal(true)}
            title="APIキーを設定"
          >
            🔑
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className={`panel chat-panel ${activeTab === 'chat' ? 'tab-active' : ''}`}>
          {apiKey ? (
            <Chat
              apiKey={apiKey}
              onSessionAdded={setSessions}
            />
          ) : (
            <div className="no-key">
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
              <p>APIキーを設定してください</p>
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                設定する
              </button>
            </div>
          )}
        </div>

        <div className={`panel map-panel ${activeTab === 'map' ? 'tab-active' : ''}`}>
          <MindMap sessions={sessions} onSessionsChange={setSessions} />
        </div>
      </main>

      {showModal && (
        <ApiKeyModal
          currentKey={apiKey}
          onSave={handleApiKeySave}
          onClose={() => setShowModal(false)}
          canClose={!!apiKey}
        />
      )}
    </div>
  )
}
