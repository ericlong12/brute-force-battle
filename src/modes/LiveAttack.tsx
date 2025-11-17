import { useMemo, useState } from 'react'
import ProbabilityChart from '../components/ProbabilityChart'
import { HASH_PRESETS } from '../lib/hashPresets'
import type { ModelKind } from '../lib/models'
import {
  keyspace,
  computeCurve,
  expectedTrialsBruteforce,
  tForTargetBruteforce,
  tForTargetDictionary,
  formatNumber,
} from '../lib/models'

export default function LiveAttack() {
  const [model, setModel] = useState<ModelKind>('bruteforce')
  const [alphabet, setAlphabet] = useState(62) // 0-9 A-Z a-z
  const [length, setLength] = useState(10)
  const [presetId, setPresetId] = useState(HASH_PRESETS[0].id)
  const [r, setR] = useState(HASH_PRESETS[0].guessesPerSec)
  const [duration, setDuration] = useState(60)

  // Dictionary params
  const [D, setD] = useState(10_000_000)
  const [coverage, setCoverage] = useState(0.3)

  // Sync guesses/sec when changing preset
  function onPresetChange(id: string) {
    setPresetId(id)
    const p = HASH_PRESETS.find((x) => x.id === id)
    if (p) setR(p.guessesPerSec)
  }

  const N = useMemo(() => (model === 'bruteforce' ? keyspace(alphabet, length) : 0), [model, alphabet, length])

  // Suggest a helpful duration if too small/large
  useMemo(() => {
    if (model === 'bruteforce') {
      const t50 = tForTargetBruteforce(0.5, N, r)
      if (t50 && !Number.isNaN(t50)) {
        const suggested = Math.min(Math.max(10, t50 * 3), 3600 * 24)
        if (duration < suggested / 5) setDuration(Math.round(suggested))
      }
    } else {
      const t50 = tForTargetDictionary(0.5, D, coverage, r)
      if (t50 && !Number.isNaN(t50)) {
        const suggested = Math.min(Math.max(10, t50 * 2), 3600 * 24)
        if (duration < suggested / 5) setDuration(Math.round(suggested))
      }
    }
  }, [model, N, r, D, coverage])

  const series = useMemo(() => {
    if (model === 'bruteforce') {
      const { t, p } = computeCurve({ model, durationSec: duration, r, N })
      return [{ label: 'Brute Force', t, p, color: '#0d6efd' }]
    } else {
      const { t, p } = computeCurve({ model, durationSec: duration, r, D, coverage })
      return [{ label: 'Dictionary', t, p, color: '#e5536b' }]
    }
  }, [model, duration, r, N, D, coverage])

  const metrics = useMemo(() => {
    if (model === 'bruteforce') {
      const expTrials = expectedTrialsBruteforce(N)
      const t50 = tForTargetBruteforce(0.5, N, r)
      const t95 = tForTargetBruteforce(0.95, N, r)
      return { N, expTrials, t50, t95 }
    }
    const t50 = tForTargetDictionary(0.5, D, coverage, r)
    const t95 = tForTargetDictionary(0.95, D, coverage, r)
    return { N: undefined, expTrials: undefined, t50, t95 }
  }, [model, N, r, D, coverage])

  return (
    <section>
      <h2 style={{ marginTop: 0 }}>Live Attack</h2>
      <div style={row}>
        <label>
          Model:
          <select value={model} onChange={(e) => setModel(e.target.value as ModelKind)} style={select}>
            <option value="bruteforce">Brute Force</option>
            <option value="dictionary">Dictionary</option>
          </select>
        </label>
        <label>
          Hash preset:
          <select value={presetId} onChange={(e) => onPresetChange(e.target.value)} style={select}>
            {HASH_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Guesses/sec:
          <input type="number" value={r} onChange={(e) => setR(Number(e.target.value) || 0)} style={input} />
        </label>
        <label>
          Duration (s):
          <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value) || 0)} style={input} />
        </label>
      </div>

      {model === 'bruteforce' ? (
        <div style={row}>
          <label>
            Alphabet size:
            <input type="number" value={alphabet} onChange={(e) => setAlphabet(Number(e.target.value) || 0)} style={input} />
          </label>
          <label>
            Length:
            <input type="number" value={length} onChange={(e) => setLength(Number(e.target.value) || 0)} style={input} />
          </label>
          <div style={statBox}>
            <div>Keyspace N = {formatNumber(N)}</div>
            <div>Expected trials (≈ N/2) = {formatNumber((metrics.expTrials ?? 0))}</div>
          </div>
        </div>
      ) : (
        <div style={row}>
          <label>
            Dictionary size D:
            <input type="number" value={D} onChange={(e) => setD(Number(e.target.value) || 0)} style={input} />
          </label>
          <label>
            Coverage (0..1):
            <input type="number" step="0.01" min={0} max={1} value={coverage} onChange={(e) => setCoverage(Number(e.target.value) || 0)} style={input} />
          </label>
        </div>
      )}

      <ProbabilityChart series={series as any} />

      <div style={{ ...row, marginTop: 12 }}>
        <div style={statBox}>T50: {metrics.t50 ? `${formatNumber(metrics.t50)} s` : 'N/A'}</div>
        <div style={statBox}>T95: {metrics.t95 ? `${formatNumber(metrics.t95)} s` : 'N/A'}</div>
      </div>

      <p style={{ color: '#666', marginTop: 10 }}>
        This simulation is mathematical and educational. For brute force, P(t) ≈ 1 - exp(-g/N) with g = r·t and keyspace N.
        For dictionary, P(t) = coverage · min(1, g/D) with dictionary size D and coverage fraction.
      </p>
    </section>
  )
}

const row = { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 } as const
const input = { padding: '6px 8px', width: 140 } as const
const select = { padding: '6px 8px' } as const
const statBox = { padding: '6px 10px', border: '1px solid #eee', borderRadius: 8, background: '#f8f9fa' } as const
