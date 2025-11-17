import { useState } from 'react'
import LiveAttack from './modes/LiveAttack'
import DefenderControls from './modes/DefenderControls'
import HashLab from './modes/HashLab'
import Scenarios from './modes/Scenarios'

type Mode = 'Live Attack' | 'Defender Controls' | 'Hash Lab' | 'Scenarios'

export default function App() {
  const [mode, setMode] = useState<Mode>('Live Attack')

  return (
    <div style={containerStyles}>
      <header style={headerStyles}>
        <h1 style={{ margin: 0 }}>Brute Force Battle</h1>
        <p style={{ margin: '4px 0 10px' }}>A Real-Time Password Cracking Visualization</p>
        <div style={{ color: '#5a5a5a', fontSize: '0.95rem' }}>
          <div>CS 166 Information Security • Department of Computer Science • Instructor: Chao-Li Tarng</div>
          <div>Team 3: Eric Long, Akanksha Bodkhe, Kenmin Ho • Date: Oct 22, 2025</div>
        </div>
      </header>

      <nav style={navStyles}>
        {(['Live Attack', 'Defender Controls', 'Hash Lab', 'Scenarios'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{ ...btnBase, ...(mode === m ? btnActive : {}) }}
            aria-pressed={mode === m}
          >
            {m}
          </button>
        ))}
      </nav>

      <main style={mainStyles}>
        {mode === 'Live Attack' && <LiveAttack />}
        {mode === 'Defender Controls' && <DefenderControls />}
        {mode === 'Hash Lab' && <HashLab />}
        {mode === 'Scenarios' && <Scenarios />}
      </main>

      <footer style={footerStyles}>
        <p style={{ margin: 0 }}>
          This app simulates password guessing mathematically: keyspace size, expected trials, success
          probability over time, T50/T95, and the effects of salts, slow KDFs, rate limits, lockouts, and MFA.
        </p>
      </footer>
    </div>
  )
}

const containerStyles = {
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Arial, sans-serif',
  color: '#0b0b0b',
  lineHeight: 1.45,
  padding: '24px',
  maxWidth: '1100px',
  margin: '0 auto',
  background: '#fafafa',
} as const

const headerStyles = { marginBottom: '10px' } as const

const navStyles = { display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '12px 0 16px' } as const

const btnBase = {
  padding: '8px 12px',
  border: '1px solid #d0d7de',
  borderRadius: 8,
  background: '#ffffff',
  cursor: 'pointer',
} as const

const btnActive = { background: '#0d6efd', color: '#ffffff', borderColor: '#0d6efd' } as const

const mainStyles = { padding: '16px', border: '1px solid #eee', borderRadius: 12, background: '#ffffff' } as const

const footerStyles = { marginTop: '16px', color: '#555', fontSize: '0.95rem' } as const
