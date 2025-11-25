import { useState } from 'react';
import { simulate, formatNumber, formatSeconds } from '../lib/models';
import type { SimulationResult } from '../lib/models';
import { hashPresets } from '../lib/hashPresets';
import { ProbabilityChart } from '../components/ProbabilityChart';

interface ScenarioDef {
  id: string;
  name: string;
  description: string;
  params: {
    context: 'offline' | 'online';
    length: number;
    alphabetSize: number;
    presetId: string;
    defender?: { rateLimitPerMinute: number; lockoutThreshold: number; lockoutSeconds: number; mfaEnabled: boolean; mfaBypassProbability: number; };
    parallelism: number;
    seconds: number;
  };
}

const scenarios: ScenarioDef[] = [
  { id: 'short-fast', name: 'Short + Fast Hash (Offline)', description: '8-char mixed-case/digits with unsalted fast hash shows rapid compromise.', params: { context: 'offline', length: 8, alphabetSize: 62, presetId: 'md5', parallelism: 8, seconds: 30 } },
  { id: 'long-slow', name: 'Long + Strong Argon2id', description: '14-char with memory-hard Argon2id strong settings greatly slows attack.', params: { context: 'offline', length: 14, alphabetSize: 62, presetId: 'argon2id_strong', parallelism: 8, seconds: 120 } },
  { id: 'online-defended', name: 'Online with Rate Limit + MFA', description: '10-char password behind rate limits, lockouts & MFA reduces success dramatically.', params: { context: 'online', length: 10, alphabetSize: 62, presetId: 'bcrypt10', parallelism: 1, seconds: 3600, defender: { rateLimitPerMinute: 30, lockoutThreshold: 6, lockoutSeconds: 600, mfaEnabled: true, mfaBypassProbability: 0.005 } } },
  { id: 'passphrase', name: '4-Word Passphrase vs Fast Hash', description: '2048-word list, 4 words. Keyspace 2048^4 exceeds short complex passwords.', params: { context: 'offline', length: 4, alphabetSize: 2048, presetId: 'sha256', parallelism: 4, seconds: 300 } },
];

export function Scenarios() {
  const [selected, setSelected] = useState<ScenarioDef>(scenarios[0]);
  const preset = hashPresets.find(p => p.id === selected.params.presetId)!;
  const sim: SimulationResult = simulate({
    context: selected.params.context,
    password: { mode: 'length', length: selected.params.length, alphabetSize: selected.params.alphabetSize },
    hashPreset: preset,
    defender: selected.params.defender ?? { rateLimitPerMinute: 0, lockoutThreshold: 0, lockoutSeconds: 0, mfaEnabled: false, mfaBypassProbability: 1 },
    maxSeconds: selected.params.seconds,
    points: 150,
    attackerParallelism: selected.params.parallelism,
  });

  return (
    <div className="fade-in">
      <h2>Scenarios</h2>
      <div className="header-desc">Preset situations demonstrating design choices and their impact on crack probability.</div>
      <div className="card-grid" style={{ marginBottom: 16 }}>
        {scenarios.map(s => (
          <button key={s.id} className={`card mode-btn ${selected.id === s.id ? 'active' : ''}`} onClick={() => setSelected(s)}>{s.name}</button>
        ))}
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>{selected.name}</h3>
        <div style={{ fontSize: '.8rem', color: 'var(--text-light)' }}>{selected.description}</div>
        <div className="inline-stats">
          <div className="stat-box"><strong>Keyspace</strong><span>{formatNumber(sim.keyspace)}</span></div>
          <div className="stat-box"><strong>T50</strong><span>{formatSeconds(sim.t50)}</span></div>
          <div className="stat-box"><strong>T95</strong><span>{formatSeconds(sim.t95)}</span></div>
          <div className="stat-box"><strong>G/sec</strong><span>{formatNumber(sim.effectiveGuessesPerSecond)}</span></div>
        </div>
        <ProbabilityChart result={sim} />
        <div className="note">{sim.notes.join(' ')} Expected trials (no replacement) ≈ N/2; replacement model T50 ≈ N ln2 / G.</div>
      </div>
      <div className="card">
        <h3>Rainbow Tables vs Unique Salts</h3>
        <p style={{ fontSize: '.8rem', lineHeight: 1.4 }}>Rainbow tables precompute hashes for large password sets, enabling quick inversion of fast unsalted hashes. Unique per-user salts invalidate reuse: each account needs separate computation, exploding attacker cost. Slow or memory-hard KDFs (bcrypt, Argon2id) further reduce feasible guesses/sec, neutralizing rainbow advantages and forcing much slower brute-force or dictionary search.</p>
      </div>
    </div>
  );
}
