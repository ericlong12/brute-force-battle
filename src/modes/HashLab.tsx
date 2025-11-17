import { useMemo, useState } from 'react'
import { HASH_PRESETS } from '../lib/hashPresets'
import { keyspace, tForTargetBruteforce, formatNumber } from '../lib/models'

export default function HashLab() {
  const [alphabet, setAlphabet] = useState(62)
  const [length, setLength] = useState(10)
  const [presetId, setPresetId] = useState(HASH_PRESETS[0].id)
  const preset = HASH_PRESETS.find((p) => p.id === presetId)!

  const N = useMemo(() => keyspace(alphabet, length), [alphabet, length])
  const t50 = useMemo(() => tForTargetBruteforce(0.5, N, preset.guessesPerSec), [N, preset])
  const t95 = useMemo(() => tForTargetBruteforce(0.95, N, preset.guessesPerSec), [N, preset])

  return (
    <section>
      <h2 style={{ marginTop: 0 }}>Hash Lab</h2>
      <div style={row}>
        <label>
          Preset:
          <select value={presetId} onChange={(e) => setPresetId(e.target.value)} style={select}>
            {HASH_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <div style={statBox}>Demo guesses/sec: {formatNumber(preset.guessesPerSec)}</div>
      </div>

      {preset.notes && <p style={{ color: '#666' }}>{preset.notes}</p>}

      <div style={row}>
        <label>
          Alphabet size:
          <input type="number" value={alphabet} onChange={(e) => setAlphabet(Number(e.target.value) || 0)} style={input} />
        </label>
        <label>
          Length:
          <input type="number" value={length} onChange={(e) => setLength(Number(e.target.value) || 0)} style={input} />
        </label>
        <div style={statBox}>Keyspace N = {formatNumber(N)}</div>
      </div>

      <div style={{ ...row, marginTop: 12 }}>
        <div style={statBox}>T50: {t50 ? `${formatNumber(t50)} s` : 'N/A'}</div>
        <div style={statBox}>T95: {t95 ? `${formatNumber(t95)} s` : 'N/A'}</div>
      </div>
    </section>
  )
}

const row = { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 } as const
const input = { padding: '6px 8px', width: 140 } as const
const select = { padding: '6px 8px' } as const
const statBox = { padding: '6px 10px', border: '1px solid #eee', borderRadius: 8, background: '#f8f9fa' } as const
