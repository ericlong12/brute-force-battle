import { useMemo, useState } from 'react'
import ProbabilityChart from '../components/ProbabilityChart'
import { HASH_PRESETS } from '../lib/hashPresets'
import type { ModelKind } from '../lib/models'
import {
  keyspace,
  computeCurve,
  tForTargetBruteforce,
  tForTargetDictionary,
  effectiveOnlineRate,
  formatNumber,
} from '../lib/models'

export default function DefenderControls() {
  const [model, setModel] = useState<ModelKind>('bruteforce')
  const [alphabet, setAlphabet] = useState(62)
  const [length, setLength] = useState(10)

  // Dictionary
  const [D, setD] = useState(10_000_000)
  const [coverage, setCoverage] = useState(0.3)

  // Base hashing preset
  const [presetId, setPresetId] = useState(HASH_PRESETS[1].id)
  const [rBase, setRBase] = useState(HASH_PRESETS[1].guessesPerSec)

  // Online controls
  const [rateLimit, setRateLimit] = useState(5) // attempts/sec
  const [lockoutThreshold, setLockoutThreshold] = useState(10)
  const [lockoutSec, setLockoutSec] = useState(60)
  const [mfaBypass, setMfaBypass] = useState(0.01)

  const [duration, setDuration] = useState(600)

  function onPresetChange(id: string) {
    setPresetId(id)
    const p = HASH_PRESETS.find((x) => x.id === id)
    if (p) setRBase(p.guessesPerSec)
  }

  const N = useMemo(() => (model === 'bruteforce' ? keyspace(alphabet, length) : 0), [model, alphabet, length])

  const rEff = useMemo(() => effectiveOnlineRate(rBase, rateLimit, lockoutThreshold, lockoutSec), [rBase, rateLimit, lockoutThreshold, lockoutSec])

  const series = useMemo(() => {
    if (model === 'bruteforce') {
      const a = computeCurve({ model, durationSec: duration, r: rBase, N })
      const b = computeCurve({ model, durationSec: duration, r: rEff, N })
      // Apply MFA to probabilities for online curve
      const onlineP = b.p.map((v) => Math.min(1, v * Math.max(0, Math.min(1, mfaBypass))))
      return [
        { label: 'Offline (no controls)', t: a.t, p: a.p, color: '#0d6efd' },
        { label: 'Online (controls + MFA)', t: b.t, p: onlineP, color: '#e5536b' },
      ]
    }
    const a = computeCurve({ model, durationSec: duration, r: rBase, D, coverage })
    const b = computeCurve({ model, durationSec: duration, r: rEff, D, coverage })
    const onlineP = b.p.map((v) => Math.min(1, v * Math.max(0, Math.min(1, mfaBypass))))
    return [
      { label: 'Offline (no controls)', t: a.t, p: a.p, color: '#0d6efd' },
      { label: 'Online (controls + MFA)', t: b.t, p: onlineP, color: '#e5536b' },
    ]
  }, [model, duration, rBase, rEff, N, D, coverage, mfaBypass])

  const metrics = useMemo(() => {
    if (model === 'bruteforce') {
      const t50_off = tForTargetBruteforce(0.5, N, rBase)
      const t95_off = tForTargetBruteforce(0.95, N, rBase)
      const t50_on_raw = tForTargetBruteforce(0.5 / Math.max(0.000001, mfaBypass), N, rEff)
      const t95_on_raw = tForTargetBruteforce(0.95 / Math.max(0.000001, mfaBypass), N, rEff)
      const t50_on = isFinite(t50_on_raw ?? NaN) ? t50_on_raw : null
      const t95_on = isFinite(t95_on_raw ?? NaN) ? t95_on_raw : null
      return { t50_off, t95_off, t50_on, t95_on }
    }
    const t50_off = tForTargetDictionary(0.5, D, coverage, rBase)
    const t95_off = tForTargetDictionary(0.95, D, coverage, rBase)
    const adj50 = 0.5 / Math.max(0.000001, mfaBypass)
    const adj95 = 0.95 / Math.max(0.000001, mfaBypass)
    const t50_on = adj50 <= coverage ? tForTargetDictionary(adj50, D, coverage, rEff) : null
    const t95_on = adj95 <= coverage ? tForTargetDictionary(adj95, D, coverage, rEff) : null
    return { t50_off, t95_off, t50_on, t95_on }
  }, [model, N, D, coverage, rBase, rEff, mfaBypass])

  return (
    <section>
      <h2 style={{ marginTop: 0 }}>Defender Controls</h2>

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
          Base guesses/sec:
          <input type="number" value={rBase} onChange={(e) => setRBase(Number(e.target.value) || 0)} style={input} />
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

      <div style={{ ...row, marginTop: 6 }}>
        <strong>Online controls</strong>
        <label>
          Rate limit (attempts/s):
          <input type="number" value={rateLimit} onChange={(e) => setRateLimit(Number(e.target.value) || 0)} style={input} />
        </label>
        <label>
          Lockout after N failures:
          <input type="number" value={lockoutThreshold} onChange={(e) => setLockoutThreshold(Number(e.target.value) || 0)} style={input} />
        </label>
        <label>
          Lockout duration (s):
          <input type="number" value={lockoutSec} onChange={(e) => setLockoutSec(Number(e.target.value) || 0)} style={input} />
        </label>
        <label>
          MFA bypass probability:
          <input type="number" step="0.001" min={0} max={1} value={mfaBypass} onChange={(e) => setMfaBypass(Number(e.target.value) || 0)} style={input} />
        </label>
        <div style={statBox}>Effective online rate ≈ {formatNumber(rEff)} guesses/s</div>
      </div>

      <ProbabilityChart series={series as any} />

      <div style={{ ...row, marginTop: 12 }}>
        <div style={statBox}>T50 offline: {metrics.t50_off ? `${formatNumber(metrics.t50_off)} s` : 'N/A'}</div>
        <div style={statBox}>T95 offline: {metrics.t95_off ? `${formatNumber(metrics.t95_off)} s` : 'N/A'}</div>
        <div style={statBox}>T50 online: {metrics.t50_on ? `${formatNumber(metrics.t50_on)} s` : 'N/A'}</div>
        <div style={statBox}>T95 online: {metrics.t95_on ? `${formatNumber(metrics.t95_on)} s` : 'N/A'}</div>
      </div>

      <p style={{ color: '#666', marginTop: 10 }}>
        Online curves use an effective throughput from rate limits and lockouts, and multiply success probability by MFA bypass probability.
      </p>
    </section>
  )
}

const row = { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 } as const
const input = { padding: '6px 8px', width: 140 } as const
const select = { padding: '6px 8px' } as const
const statBox = { padding: '6px 10px', border: '1px solid #eee', borderRadius: 8, background: '#f8f9fa' } as const
