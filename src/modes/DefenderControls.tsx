import { useState, useEffect } from 'react';
import { simulate, formatNumber, formatSeconds } from '../lib/models';
import type { SimulationResult } from '../lib/models';
import { hashPresets } from '../lib/hashPresets';
import { ProbabilityChart } from '../components/ProbabilityChart';

export function DefenderControls() {
  const [length, setLength] = useState(10);
  const [alphabetSize, setAlphabetSize] = useState(62);
  const [presetId, setPresetId] = useState('bcrypt10');
  const [rateLimit, setRateLimit] = useState(30);
  const [lockoutThreshold, setLockoutThreshold] = useState(8);
  const [lockoutSeconds, setLockoutSeconds] = useState(300);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [mfaBypass, setMfaBypass] = useState(0.01);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const preset = hashPresets.find(p => p.id === presetId)!;
    const sim = simulate({
      context: 'online',
      password: { mode: 'length', length, alphabetSize },
      hashPreset: preset,
      defender: { rateLimitPerMinute: rateLimit, lockoutThreshold, lockoutSeconds, mfaEnabled, mfaBypassProbability: mfaBypass },
      maxSeconds: 3600,
      points: 180,
      attackerParallelism: 1,
    });
    setResult(sim);
  }, [length, alphabetSize, presetId, rateLimit, lockoutThreshold, lockoutSeconds, mfaEnabled, mfaBypass]);

  return (
    <div className="fade-in">
      <h2>Defender Controls (Online)</h2>
      <div className="header-desc">Tune rate limits, lockouts & MFA to see probability impact. Advanced metrics optional.</div>
      <div className="controls-row">
        <div className="field"><label>Length</label><input type="number" min={1} value={length} onChange={e => setLength(Number(e.target.value))} /></div>
        <div className="field"><label>Alphabet Size</label><input type="number" min={2} value={alphabetSize} onChange={e => setAlphabetSize(Number(e.target.value))} /></div>
        <div className="field"><label>Hash/KDF</label><select value={presetId} onChange={e => setPresetId(e.target.value)}>{hashPresets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <div className="field"><label>Rate Limit / min</label><input type="number" min={1} value={rateLimit} onChange={e => setRateLimit(Number(e.target.value))} /></div>
        <div className="field"><label>Lockout Threshold</label><input type="number" min={0} value={lockoutThreshold} onChange={e => setLockoutThreshold(Number(e.target.value))} /></div>
        <div className="field"><label>Lockout Seconds</label><input type="number" min={0} value={lockoutSeconds} onChange={e => setLockoutSeconds(Number(e.target.value))} /></div>
        <div className="field"><label>MFA Enabled</label><select value={mfaEnabled ? 'yes' : 'no'} onChange={e => setMfaEnabled(e.target.value === 'yes')}><option value="yes">Yes</option><option value="no">No</option></select></div>
        <div className="field"><label>MFA Bypass Prob</label><input type="number" step={0.001} min={0} max={1} value={mfaBypass} onChange={e => setMfaBypass(Number(e.target.value))} /></div>
        <div className="field" style={{ alignSelf:'flex-start' }}><label style={{ visibility:'hidden' }}>Advanced</label><button className="toggle-btn" onClick={() => setShowAdvanced(a => !a)}>{showAdvanced ? 'Hide Advanced' : 'Show Advanced'}</button></div>
      </div>
      {result && (
        <>
          <div className="simple-stats">
            <div className="stat-box"><strong>Keyspace</strong><span>{formatNumber(result.keyspace)}</span></div>
            <div className="stat-box"><strong>T50</strong><span>{formatSeconds(result.t50)}</span></div>
            <div className="stat-box"><strong>T95</strong><span>{formatSeconds(result.t95)}</span></div>
            <div className="stat-box"><strong>Eff G/s</strong><span>{formatNumber(result.effectiveGuessesPerSecond)}</span></div>
            <div className="stat-box"><strong>MFA</strong><span>{mfaEnabled ? `${(mfaBypass*100).toFixed(2)}% bypass` : 'Off'}</span></div>
          </div>
          {showAdvanced && (
            <div className="inline-stats" style={{ marginTop:4 }}>
              <div className="stat-box"><strong>Exp Trials (N/2)</strong><span>{formatNumber(result.expectedTrialsNoReplacement)}</span></div>
              <div className="stat-box"><strong>Exp Trials (N ln2)</strong><span>{formatNumber(result.expectedTrialsReplacement)}</span></div>
            </div>
          )}
          <ProbabilityChart result={result} />
          <div className="inline-help">Online defenses reduce attacker rate; MFA multiplies probability by its bypass chance.</div>
        </>
      )}
    </div>
  );
}
