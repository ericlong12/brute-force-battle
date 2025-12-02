import { useState, useEffect } from 'react';
import { simulate, formatNumber, formatSeconds } from '../lib/models';
import type { SimulationResult } from '../lib/models';
import { hashPresets } from '../lib/hashPresets';

interface Row { p: typeof hashPresets[number]; sim: SimulationResult; }

export function HashLab() {
  const [length, setLength] = useState(10);
  const [alphabetSize, setAlphabetSize] = useState(62);
  const [parallelism, setParallelism] = useState(8);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const model = { mode: 'length', length, alphabetSize } as any;
    const r = hashPresets.map(p => {
      const sim = simulate({ context: 'offline', password: model, hashPreset: p, defender: { rateLimitPerMinute: 0, lockoutThreshold: 0, lockoutSeconds: 0, mfaEnabled: false, mfaBypassProbability: 1 }, maxSeconds: 5, points: 5, attackerParallelism: parallelism });
      return { p, sim };
    });
    setRows(r);
  }, [length, alphabetSize, parallelism]);

  return (
    <div className="fade-in">
      <h2>Hash Lab</h2>
      <div className="header-desc">Compare different hash/KDF presets side-by-side for the same password model.</div>
      <div className="controls-row">
        <div className="field"><label>Length</label><input type="number" value={length} min={1} onChange={e => setLength(Number(e.target.value))} /></div>
        <div className="field"><label>Alphabet Size</label><input type="number" value={alphabetSize} min={2} onChange={e => setAlphabetSize(Number(e.target.value))} /></div>
        <div className="field"><label>Parallel Rigs</label><input type="number" value={parallelism} min={1} onChange={e => setParallelism(Number(e.target.value))} /></div>
      </div>
      <div className="card-grid">
        {rows.map(r => (
          <div className="card" key={r.p.id}>
            <h3>{r.p.name}</h3>
            <div style={{ fontSize: '.75rem', color: 'var(--text-light)' }}>{r.p.description}</div>
            {r.p.kdfCostNote && <div className="note">{r.p.kdfCostNote}</div>}
            <div className="inline-stats">
              <div className="stat-box"><strong>G/s</strong><span>{formatNumber(r.sim.effectiveGuessesPerSecond)}</span></div>
              <div className="stat-box"><strong>T50</strong><span>{formatSeconds(r.sim.t50)}</span></div>
              <div className="stat-box"><strong>T95</strong><span>{formatSeconds(r.sim.t95)}</span></div>
              <div className="stat-box"><strong>Keyspace</strong><span>{formatNumber(r.sim.keyspace)}</span></div>
            </div>
          </div>
        ))}
      </div>
      <div className="note">Slower & memory-hard functions reduce guesses/sec, increasing T50/T95.</div>
    </div>
  );
}
