import { useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import './PracticeCharts.css'

function PracticeCharts({ entries, stats }) {
  if (!entries || !stats?.practice) return null

  // Prepare data for practice trends over time
  const practiceTrends = useMemo(() => {
    const dates = Object.keys(entries).sort()
    return dates.map(date => {
      const entry = entries[date]
      const practice = entry?.practice || {}
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        LeetCode: practice.leetcode?.length || 0,
        SQL: practice.sql?.length || 0,
        'System Design': practice.system_design?.length || 0,
        ML: practice.ml?.length || 0
      }
    })
  }, [entries])

  // Prepare data for category totals
  const categoryData = [
    {
      name: 'LeetCode',
      total: stats.practice.leetcode?.total || 0,
      easy: stats.practice.leetcode?.easy || 0,
      medium: stats.practice.leetcode?.medium || 0,
      hard: stats.practice.leetcode?.hard || 0
    },
    {
      name: 'SQL',
      total: stats.practice.sql?.total || 0
    },
    {
      name: 'System Design',
      total: stats.practice.system_design?.total || 0,
      hld: stats.practice.system_design?.hld || 0,
      lld: stats.practice.system_design?.lld || 0
    },
    {
      name: 'ML',
      total: stats.practice.ml?.total || 0
    }
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-item" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="practice-charts">
      <h2>Practice Analytics</h2>
      
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Daily Practice Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={practiceTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--text-muted)"
                style={{ fontSize: '0.75rem' }}
              />
              <YAxis 
                stroke="var(--text-muted)"
                style={{ fontSize: '0.75rem' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="LeetCode" 
                stroke="var(--accent)" 
                strokeWidth={2}
                dot={{ fill: 'var(--accent)', r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="SQL" 
                stroke="#5eead4" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#5eead4', r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="System Design" 
                stroke="#2dd4bf" 
                strokeWidth={2}
                dot={{ fill: '#2dd4bf', r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="ML" 
                stroke="#71717a" 
                strokeWidth={2}
                dot={{ fill: '#71717a', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Total by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="name" 
                stroke="var(--text-muted)"
                style={{ fontSize: '0.75rem' }}
              />
              <YAxis 
                stroke="var(--text-muted)"
                style={{ fontSize: '0.75rem' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" fill="var(--accent)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {stats.practice.leetcode && (
          <div className="chart-card">
            <h3>LeetCode by Difficulty</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[stats.practice.leetcode]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--text-muted)"
                  style={{ fontSize: '0.75rem' }}
                />
                <YAxis 
                  stroke="var(--text-muted)"
                  style={{ fontSize: '0.75rem' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="easy" fill="#5eead4" radius={[8, 8, 0, 0]} />
                <Bar dataKey="medium" fill="var(--accent)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="hard" fill="#f44336" radius={[8, 8, 0, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

export default PracticeCharts

