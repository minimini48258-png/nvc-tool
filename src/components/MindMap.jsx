import { useEffect, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { calculateLayout } from '../utils/layout'
import { deleteSession } from '../utils/storage'

function CenterNode({ data }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
      color: 'white',
      width: 110,
      height: 110,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontSize: 13,
      fontWeight: 600,
      lineHeight: 1.5,
      boxShadow: '0 4px 24px rgba(124,58,237,0.35)',
      whiteSpace: 'pre-line',
    }}>
      {data.label}
    </div>
  )
}

function SituationNode({ data }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      color: 'white',
      padding: '10px 14px',
      borderRadius: 10,
      maxWidth: 140,
      fontSize: 13,
      fontWeight: 500,
      boxShadow: '0 2px 12px rgba(37,99,235,0.3)',
      lineHeight: 1.5,
    }}>
      {data.date && (
        <div style={{ fontSize: 10, opacity: 0.75, marginBottom: 3 }}>{data.date}</div>
      )}
      <div>{data.label}</div>
      {data.insight && (
        <div style={{
          fontSize: 11,
          opacity: 0.85,
          marginTop: 6,
          paddingTop: 6,
          borderTop: '1px solid rgba(255,255,255,0.25)',
          fontStyle: 'italic',
          lineHeight: 1.4,
        }}>
          {data.insight}
        </div>
      )}
    </div>
  )
}

function FeelingNode({ data }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #ea580c, #c2410c)',
      color: 'white',
      padding: '6px 14px',
      borderRadius: 20,
      fontSize: 13,
      fontWeight: 500,
      boxShadow: '0 2px 10px rgba(234,88,12,0.3)',
      whiteSpace: 'nowrap',
    }}>
      {data.label}
    </div>
  )
}

function NeedNode({ data }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #16a34a, #15803d)',
      color: 'white',
      padding: '6px 14px',
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 600,
      boxShadow: '0 2px 10px rgba(22,163,74,0.3)',
      whiteSpace: 'nowrap',
      border: '2px solid rgba(255,255,255,0.2)',
    }}>
      🌱 {data.label}
    </div>
  )
}

const nodeTypes = {
  centerNode: CenterNode,
  situationNode: SituationNode,
  feelingNode: FeelingNode,
  needNode: NeedNode,
}

export default function MindMap({ sessions, onSessionsChange }) {
  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
    () => calculateLayout(sessions),
    [sessions]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges)

  useEffect(() => {
    const { nodes: n, edges: e } = calculateLayout(sessions)
    setNodes(n)
    setEdges(e)
  }, [sessions, setNodes, setEdges])

  return (
    <div className="mindmap-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.15}
        maxZoom={2}
        nodesConnectable={false}
      >
        <Background color="#c8c0b4" gap={24} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const colors = {
              centerNode: '#7c3aed',
              situationNode: '#2563eb',
              feelingNode: '#ea580c',
              needNode: '#16a34a',
            }
            return colors[node.type] || '#999'
          }}
          style={{ background: '#e8e2da', border: '1px solid #c8bfb5' }}
        />
      </ReactFlow>

      {sessions.length > 0 && (
        <div className="session-list">
          <div className="session-list-title">セッション一覧</div>
          {sessions.map(s => (
            <div key={s.id} className="session-item">
              <span className="session-item-label">{s.date} {s.situation}</span>
              <button
                className="session-delete"
                onClick={() => {
                  const updated = deleteSession(s.id)
                  onSessionsChange(updated)
                }}
                title="削除"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {sessions.length === 0 && (
        <div className="mindmap-empty">
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: '#7a6a58' }}>
            まだセッションがありません
          </div>
          <div style={{ fontSize: 13, marginTop: 8, color: '#a09080' }}>
            対話を通じて気づきをマップに追加しましょう
          </div>
        </div>
      )}
    </div>
  )
}
