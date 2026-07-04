export function calculateLayout(sessions) {
  const nodes = []
  const edges = []

  nodes.push({
    id: 'center',
    type: 'centerNode',
    position: { x: 0, y: 0 },
    data: { label: '私の\n内なる地図' },
  })

  if (sessions.length === 0) return { nodes, edges }

  const seenNeeds = new Map()

  sessions.forEach((session, si) => {
    const angle =
      sessions.length === 1
        ? -Math.PI / 2
        : (si / sessions.length) * 2 * Math.PI - Math.PI / 2

    const situR = 210
    const situId = `situ-${session.id}`
    nodes.push({
      id: situId,
      type: 'situationNode',
      position: {
        x: Math.cos(angle) * situR - 70,
        y: Math.sin(angle) * situR - 30,
      },
      data: {
        label: session.situation,
        date: session.date,
        insight: session.insight,
      },
    })
    edges.push({
      id: `c-${situId}`,
      source: 'center',
      target: situId,
      type: 'smoothstep',
      style: { stroke: '#b0a090', strokeWidth: 1.5 },
    })

    const feelings = session.feelings || []
    feelings.forEach((feeling, fi) => {
      const spread =
        feelings.length <= 1 ? 0 : (fi / (feelings.length - 1) - 0.5) * 0.7
      const fAngle = angle + spread
      const fR = 400
      const feelId = `feel-${session.id}-${fi}`
      nodes.push({
        id: feelId,
        type: 'feelingNode',
        position: {
          x: Math.cos(fAngle) * fR - 40,
          y: Math.sin(fAngle) * fR - 16,
        },
        data: { label: feeling },
      })
      edges.push({
        id: `${situId}-${feelId}`,
        source: situId,
        target: feelId,
        type: 'smoothstep',
        style: { stroke: '#d97b50', strokeWidth: 1.5 },
      })
    })

    const needs = session.needs || []
    needs.forEach((need, ni) => {
      const spread =
        needs.length <= 1 ? 0 : (ni / (needs.length - 1) - 0.5) * 0.5
      const nAngle = angle + spread
      const nR = 590

      const existingId = seenNeeds.get(need)
      if (existingId) {
        edges.push({
          id: `${situId}-${existingId}-x${ni}`,
          source: situId,
          target: existingId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#4ade80', strokeWidth: 1.5, strokeDasharray: '5 3' },
        })
      } else {
        const needId = `need-${session.id}-${ni}`
        seenNeeds.set(need, needId)
        nodes.push({
          id: needId,
          type: 'needNode',
          position: {
            x: Math.cos(nAngle) * nR - 50,
            y: Math.sin(nAngle) * nR - 16,
          },
          data: { label: need },
        })
        edges.push({
          id: `${situId}-${needId}`,
          source: situId,
          target: needId,
          type: 'smoothstep',
          style: { stroke: '#4a9068', strokeWidth: 1.5 },
        })
      }
    })
  })

  return { nodes, edges }
}
