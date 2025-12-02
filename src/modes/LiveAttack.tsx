import { useState, useEffect } from 'react';
import { simulate, formatNumber, formatSeconds } from '../lib/models';
import type { SimulationResult } from '../lib/models';
import { hashPresets } from '../lib/hashPresets';
import { ProbabilityChart } from '../components/ProbabilityChart';

export function LiveAttack() {
  const [length, setLength] = useState(8);
  const [alphabetChoice, setAlphabetChoice] = useState('lower+digits');
  const [presetId, setPresetId] = useState('sha256');
  const [parallelism, setParallelism] = useState(4);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [elapsed, setElapsed] = useState(0); 
  

  const alphabetSizes: Record<string, number> = {
    lower: 26,
    digits: 10,
    'lower+digits': 36,
    'upper+lower+digits': 62,
    printable: 94,
    words_2048: 2048,
  };

  useEffect(() => {
  const id = setInterval(() => {
    setResult((prev) => {
      if (prev?.successBoolean) {
        clearInterval(id); // stop the timer
        return prev;       // do not change
      }
      setElapsed((t) => t + 1);
      return prev;
    });
  }, 1000);

  return () => clearInterval(id);
  }, [result]);


  useEffect(() => {
    const preset = hashPresets.find((p) => p.id === presetId)!;
    const passwordModel =
      alphabetChoice.startsWith('words_')
        ? { mode: 'passphrase', alphabetSize: alphabetSizes[alphabetChoice], words: 4 }
        : { mode: 'length', alphabetSize: alphabetSizes[alphabetChoice], length };
    const sim = simulate({
      context: 'offline',
      password: passwordModel as any,
      hashPreset: preset,
      defender: { rateLimitPerMinute: 0, lockoutThreshold: 0, lockoutSeconds: 0, mfaEnabled: false, mfaBypassProbability: 1 },
      maxSeconds: elapsed,
      points: 120,
      attackerParallelism: parallelism,
    });
    setResult(sim);
  }, [length, alphabetChoice, presetId, parallelism, elapsed]);

  return (
    <div className="fade-in">
      <h2>Live Attack (Offline)</h2>
      <div className="header-desc">Adjust length, alphabet, hash/KDF & parallel rigs to see how probability shifts. Advanced stats optional.</div>
      <div className="controls-row">
        {!alphabetChoice.startsWith('words_') && (
          <div className="field">
            <label>Password Length</label>
            <input type="number" min={1} value={length} onChange={(e) => setLength(Number(e.target.value))} />
          </div>
        )}
        <div className="field">
          <label>Alphabet / Model</label>
          <select value={alphabetChoice} onChange={(e) => setAlphabetChoice(e.target.value)}>
            {Object.keys(alphabetSizes).map((k) => (
              <option key={k} value={k}>
                {k} ({alphabetSizes[k]})
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Hash/KDF</label>
          <select value={presetId} onChange={(e) => setPresetId(e.target.value)}>
            {hashPresets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Parallel GPU Rigs</label>
          <input type="number" min={1} value={parallelism} onChange={(e) => setParallelism(Number(e.target.value))} />
        </div>
        <div className="field" style={{ alignSelf: 'flex-start' }}>
          <label style={{ visibility: 'hidden' }}>Advanced</label>
          <button className="toggle-btn" onClick={() => setShowAdvanced((a) => !a)}>
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </button>
        </div>
      </div>
      {result && (
        <>
          <div className="simple-stats">
            <div className="stat-box">
              <strong>Keyspace</strong>
              <span>{formatNumber(result.keyspace)}</span>
            </div>
            <div className="stat-box">
              <strong>T50</strong>
              <span>{formatSeconds(result.t50)}</span>
            </div>
            <div className="stat-box">
              <strong>T95</strong>
              <span>{formatSeconds(result.t95)}</span>
            </div>
            <div className="stat-box">
              <strong>G/s</strong>
              <span>{formatNumber(result.effectiveGuessesPerSecond)}</span>
            </div>
            <div className="stat-box">
              <strong>Current Guesses</strong>
              <span>{formatNumber(result.currentGuesses)}</span>
            </div>
            <div className="stat-box">
              <strong>Success</strong>
              <span>{(result.successBoolean.toString())}</span>
            </div>
            <div className="field" style={{ alignSelf: 'flex-start' }}>
                <label style={{ visibility: 'hidden' }}>Reset</label>
                <button className="toggle-btn" onClick={() => setElapsed(0)}>
                  Reset Timer
                </button>
              </div>
          </div>
          {showAdvanced && (
            <div className="inline-stats" style={{ marginTop: 4 }}>
              <div className="stat-box">
                <strong>Exp Trials (N/2)</strong>
                <span>{formatNumber(result.expectedTrialsNoReplacement)}</span>
              </div>
              <div className="stat-box">
                <strong>Exp Trials (N ln2)</strong>
                <span>{formatNumber(result.expectedTrialsReplacement)}</span>
              </div>
            </div>
            
          )}
          <ProbabilityChart result={result} />
          <div className="inline-help">{result.notes.join(' ')} Offline brute force assumes full-speed guessing on extracted verifier.</div>
        </>
      )}
    </div>
  );
}
