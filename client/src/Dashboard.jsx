import { useEffect, useRef, useState } from 'react'
import { apiFetch } from './api'
import './Dashboard.css'

const CHART_WIDTH = 640
const CHART_HEIGHT = 220
const CHART_PAD = { top: 16, right: 16, bottom: 28, left: 16 }

function formatCompact(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`
  return String(n)
}

function formatShortDate(isoDate) {
  const d = new Date(`${isoDate}T00:00:00`)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function StatTile({ label, value, delta }) {
  const showDelta = typeof delta === 'number'
  const deltaUp = delta > 0
  return (
    <div className="stat-tile">
      <span className="stat-tile-label">{label}</span>
      <span className="stat-tile-value">{formatCompact(value)}</span>
      {showDelta && (
        <span className={`stat-tile-delta ${deltaUp ? 'up' : delta < 0 ? 'down' : ''}`}>
          {delta > 0 ? '▲' : delta < 0 ? '▼' : '–'} {Math.abs(delta)} vs prior 7 days
        </span>
      )}
    </div>
  )
}

function Meter({ label, value, total }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="card meter-card viz-root">
      <div className="meter-head">
        <span className="meter-label">{label}</span>
        <span className="meter-value">{pct}%</span>
      </div>
      <div
        className="meter-track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="meter-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="meter-caption">
        {value.toLocaleString()} of {total.toLocaleString()} users active
      </span>
    </div>
  )
}

function SignupsChart({ data }) {
  const [showTable, setShowTable] = useState(false)
  const [hoverIndex, setHoverIndex] = useState(null)
  const svgRef = useRef(null)

  const innerW = CHART_WIDTH - CHART_PAD.left - CHART_PAD.right
  const innerH = CHART_HEIGHT - CHART_PAD.top - CHART_PAD.bottom
  const maxCount = Math.max(1, ...data.map((d) => d.count))
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0

  const points = data.map((d, i) => {
    const x = CHART_PAD.left + i * stepX
    const y = CHART_PAD.top + innerH - (d.count / maxCount) * innerH
    return { x, y, ...d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${points[points.length - 1]?.x.toFixed(1)},${CHART_PAD.top + innerH} L${points[0]?.x.toFixed(1)},${CHART_PAD.top + innerH} Z`

  function handleMove(e) {
    if (!svgRef.current || points.length === 0) return
    const rect = svgRef.current.getBoundingClientRect()
    const scaleX = CHART_WIDTH / rect.width
    const localX = (e.clientX - rect.left) * scaleX
    let nearest = 0
    let best = Infinity
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - localX)
      if (dist < best) {
        best = dist
        nearest = i
      }
    })
    setHoverIndex(nearest)
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null
  const tickEvery = Math.ceil(data.length / 6)

  return (
    <div className="card chart-card viz-root">
      <div className="chart-card-head">
        <h2>New users — last 30 days</h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowTable((s) => !s)}>
          {showTable ? 'Show chart' : 'View as table'}
        </button>
      </div>

      {showTable ? (
        <div className="chart-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>New users</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.date}>
                  <td>{formatShortDate(d.date)}</td>
                  <td>{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="chart-svg-wrap">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="chart-svg"
            onPointerMove={handleMove}
            onPointerLeave={() => setHoverIndex(null)}
          >
            <line
              className="chart-baseline"
              x1={CHART_PAD.left}
              y1={CHART_PAD.top + innerH}
              x2={CHART_WIDTH - CHART_PAD.right}
              y2={CHART_PAD.top + innerH}
            />
            <path className="chart-area" d={areaPath} />
            <path className="chart-line" d={linePath} />

            {points.map((p, i) =>
              i % tickEvery === 0 ? (
                <text key={p.date} className="chart-axis-label" x={p.x} y={CHART_HEIGHT - 8} textAnchor="middle">
                  {formatShortDate(p.date)}
                </text>
              ) : null
            )}

            {hovered && (
              <>
                <line
                  className="chart-crosshair"
                  x1={hovered.x}
                  y1={CHART_PAD.top}
                  x2={hovered.x}
                  y2={CHART_PAD.top + innerH}
                />
                <circle className="chart-dot" cx={hovered.x} cy={hovered.y} r="4" />
              </>
            )}
          </svg>

          {hovered && (
            <div
              className="chart-tooltip"
              style={{
                left: `${(hovered.x / CHART_WIDTH) * 100}%`,
                top: `${(hovered.y / CHART_HEIGHT) * 100}%`,
              }}
            >
              <span className="chart-tooltip-value">{hovered.count}</span>
              <span className="chart-tooltip-label">{formatShortDate(hovered.date)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Dashboard({ account, onLogout }) {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await apiFetch('/api/analytics/summary', {}, onLogout)
        if (!res.ok) throw new Error('Failed to load analytics')
        const data = await res.json()
        if (!cancelled) setSummary(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [onLogout])

  if (loading) {
    return (
      <div className="page-loader module-loader">
        <div className="gif-loader">
          <span className="gif-loader-dot" />
          <span className="gif-loader-dot" />
          <span className="gif-loader-dot" />
        </div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <section className="card module-placeholder">
        <h2>Welcome{account ? `, ${account.name}` : ''}</h2>
        <p className="error">{error}</p>
      </section>
    )
  }

  const { totals, newUsers, dailySignups } = summary
  const delta = newUsers.last7Days - newUsers.previous7Days

  return (
    <>
      <section className="card welcome-card">
        <h2>Welcome{account ? `, ${account.name}` : ''}</h2>
        <p className="empty">Here's what's happening across your workspace.</p>
      </section>

      <div className="stat-row">
        <StatTile label="Total users" value={totals.totalUsers} delta={delta} />
        <StatTile label="Active users" value={totals.activeUsers} />
        <StatTile label="Deleted users" value={totals.deletedUsers} />
        <StatTile label="Accounts" value={totals.accounts} />
      </div>

      <SignupsChart data={dailySignups} />

      <Meter label="Active user ratio" value={totals.activeUsers} total={totals.totalUsers} />
    </>
  )
}

export default Dashboard
