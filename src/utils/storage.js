const KEY = 'nvc-sessions'

export function loadSessions() {
  try {
    const data = localStorage.getItem(KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveSessions(sessions) {
  localStorage.setItem(KEY, JSON.stringify(sessions))
}

export function addSession(session) {
  const sessions = loadSessions()
  sessions.push(session)
  saveSessions(sessions)
  return sessions
}

export function deleteSession(id) {
  const sessions = loadSessions().filter(s => s.id !== id)
  saveSessions(sessions)
  return sessions
}
