import { useState, useRef, useEffect } from 'react'
import { sendMessageStream, extractNVC } from '../utils/claudeApi'
import { addSession } from '../utils/storage'

const GREETING = 'こんにちは。今日はどんな状況のことを話してみたいですか？どんなことでも、自由に話してください。'

export default function Chat({ apiKey, onSessionAdded }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING }])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedNVC, setExtractedNVC] = useState(null)
  const [error, setError] = useState('')
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getApiMessages = (msgs) =>
    msgs
      .filter((m, i) => !(i === 0 && m.role === 'assistant'))
      .map(m => ({ role: m.role, content: m.content }))

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMsg = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)
    setError('')

    const streamingMsg = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, streamingMsg])

    try {
      const apiMessages = getApiMessages(newMessages)
      await sendMessageStream(apiMessages, apiKey, (token) => {
        setMessages(prev => {
          const last = { ...prev[prev.length - 1] }
          last.content += token
          return [...prev.slice(0, -1), last]
        })
      })
    } catch (err) {
      setMessages(prev => prev.slice(0, -1))
      setError(err.message || 'エラーが発生しました。APIキーを確認してください。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExtract = async () => {
    setIsExtracting(true)
    setError('')
    try {
      const apiMessages = getApiMessages(messages)
      const nvc = await extractNVC(apiMessages, apiKey)
      setExtractedNVC(nvc)
    } catch (err) {
      setError('気づきの抽出に失敗しました: ' + (err.message || ''))
    } finally {
      setIsExtracting(false)
    }
  }

  const handleAddToMap = () => {
    if (!extractedNVC) return
    const session = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('ja-JP'),
      ...extractedNVC,
    }
    const newSessions = addSession(session)
    onSessionAdded(newSessions)
    startNew()
  }

  const startNew = () => {
    setMessages([{ role: 'assistant', content: GREETING }])
    setExtractedNVC(null)
    setError('')
    setInput('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const userCount = messages.filter(m => m.role === 'user').length

  return (
    <div className="chat">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="message-bubble">
              {msg.content || (msg.role === 'assistant' && isLoading && i === messages.length - 1
                ? <span className="loading"><span /><span /><span /></span>
                : msg.content
              )}
            </div>
          </div>
        ))}
        {error && <div className="error-msg">{error}</div>}
        <div ref={endRef} />
      </div>

      {extractedNVC && (
        <div className="nvc-extract">
          <h3>✨ 今日の気づき</h3>
          <div className="nvc-card">
            <div className="nvc-row">
              <span className="nvc-label">状況</span>
              <span className="nvc-value">{extractedNVC.situation}</span>
            </div>
            <div className="nvc-row">
              <span className="nvc-label">感情</span>
              <span className="nvc-value">{extractedNVC.feelings?.join('　')}</span>
            </div>
            <div className="nvc-row">
              <span className="nvc-label">ニーズ</span>
              <span className="nvc-value">{extractedNVC.needs?.join('　')}</span>
            </div>
            <div className="nvc-insight">{extractedNVC.insight}</div>
          </div>
          <div className="extract-actions">
            <button className="btn-primary" onClick={handleAddToMap}>
              🗺️ マップに追加
            </button>
            <button className="btn-secondary" onClick={() => setExtractedNVC(null)}>
              続ける
            </button>
          </div>
        </div>
      )}

      <div className="chat-input-area">
        <div className="chat-actions">
          <button className="btn-sm" onClick={startNew}>
            ＋ 新しいセッション
          </button>
          {userCount >= 3 && !extractedNVC && (
            <button
              className="btn-sm btn-extract"
              onClick={handleExtract}
              disabled={isExtracting}
            >
              {isExtracting ? '抽出中...' : '✨ 気づきをまとめる'}
            </button>
          )}
        </div>
        <div className="input-row">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="自由に話してください… (Enter で送信、Shift+Enter で改行)"
            disabled={isLoading}
            rows={2}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            送信
          </button>
        </div>
      </div>
    </div>
  )
}
