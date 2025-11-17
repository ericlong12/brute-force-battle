import { useMemo } from 'react'
import { HASH_PRESETS } from '../lib/hashPresets'
import { keyspace, tForTargetBruteforce, formatNumber } from '../lib/models'

type Scenario = {
  title: string
  alphabet: number
  length: number
  presetId: string
}

const scenarios: Scenario[] = [
  { title: 'Short mixed-char + fast hashing', alphabet: 62, length: 8, presetId: 'fast-md5' },
  { title: 'Long passphrase + salted slow hashing', alphabet: 26 + 1 + 10, length: 16, presetId: 'argon2' },
  { title: 'Online with slow hashing (conceptual)', alphabet: 62, length: 10, presetId: 'bcrypt-12' },
]

export default function Scenarios() {
  return (
    <section>
      <h2 style={{ marginTop: 0 }}>Scenarios</h2>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {scenarios.map((s) => (
          <ScenarioCard key={s.title} scenario={s} />
        ))}
      </div>
      <p style={{ color: '#666', marginTop: 12 }}>
        Times are rough, educational estimates using N = A^L and demo guesses/sec from presets.
      </p>
    </section>
  )
}

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const preset = HASH_PRESETS.find((p) => p.id === scenario.presetId)!
  const N = useMemo(() => keyspace(scenario.alphabet, scenario.length), [scenario])
  const t50 = useMemo(() => tForTargetBruteforce(0.5, N, preset.guessesPerSec), [N, preset])
  const t95 = useMemo(() => tForTargetBruteforce(0.95, N, preset.guessesPerSec), [N, preset])

  return (
    <div style={card}>
      <h3 style={{ margin: '0 0 6px' }}>{scenario.title}</h3>
      <div style={{ color: '#555' }}>Alphabet: {scenario.alphabet} • Length: {scenario.length}</div>
      <div style={{ color: '#555', marginBottom: 6 }}>Preset: {preset.label}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={statBox}>N = {formatNumber(N)}</div>
        <div style={statBox}>T50 = {t50 ? `${formatNumber(t50)} s` : 'N/A'}</div>
        <div style={statBox}>T95 = {t95 ? `${formatNumber(t95)} s` : 'N/A'}</div>
      </div>
    </div>
  )
}

const card = { border: '1px solid #eee', borderRadius: 10, padding: 12, background: '#fff' } as const
const statBox = { padding: '6px 10px', border: '1px solid #eee', borderRadius: 8, background: '#f8f9fa' } as const
