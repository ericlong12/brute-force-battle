// Simulation models and math helpers
export type AttackContext = 'offline' | 'online';
export interface HashPreset {
  id: string;
  name: string;
  hashPerSecond: number; // baseline guesses/sec achievable with this verifier offline
  description: string;
  salt: boolean;
  memoryHard: boolean;
  kdfCostNote?: string;
}
export interface DefenderControls {
  rateLimitPerMinute: number; // online max attempts/minute before lock/slowdown
  lockoutThreshold: number; // attempts before temporary lockout
  lockoutSeconds: number; // lockout duration
  mfaEnabled: boolean; // second factor active
  mfaBypassProbability: number; // probability attacker succeeds second factor
}
export interface PasswordModel {
  mode: 'length' | 'passphrase' | 'dictionary';
  length?: number; // for length mode
  alphabetSize: number; // characters in alphabet OR wordlist size for passphrase/dictionary
  words?: number; // number of words in a passphrase
  dictionarySize?: number; // for dictionary attack scenario size
}
export interface SimulationParams {
  context: AttackContext;
  password: PasswordModel;
  hashPreset: HashPreset;
  defender: DefenderControls;
  maxSeconds: number;
  points: number; // granularity
  attackerParallelism: number; // # of GPUs/rigs scaling offline speed
}
export interface SimulationPoint {
  t: number; // seconds
  guesses: number; // cumulative guesses attempted
  pSuccess: number; // probability cracked by time t
}
export interface SimulationResult {
  keyspace: number;
  expectedTrialsNoReplacement: number; // N/2 average position in permutation (no replacement)
  expectedTrialsReplacement: number; // k50 replacement model: guesses to reach 50% success ≈ N ln2 (mean geometric trials is N)
  t50: number;
  t95: number;
  curve: SimulationPoint[];
  effectiveGuessesPerSecond: number;
  currentGuesses: number;
  successBoolean: boolean;
  notes: string[];
}



// Safe big power using exponentiation by squaring returning number (may overflow for huge N)
function powInt(base: number, exp: number): number {
  if (exp <= 0) return 1;
  let r = 1, b = base, e = exp;
  while (e > 0) { if (e & 1) r *= b; b *= b; e >>= 1; }
  return r;
}

export function computeKeyspace(pw: PasswordModel): number {
  if (pw.mode === 'length') return powInt(pw.alphabetSize, pw.length ?? 0);
  if (pw.mode === 'passphrase') return powInt(pw.alphabetSize, pw.words ?? 0); // alphabetSize used as wordlist size
  if (pw.mode === 'dictionary') return pw.dictionarySize ?? pw.alphabetSize;
  return 0;
}

function offlineSpeed(params: SimulationParams): number {
  const base = params.hashPreset.hashPerSecond * params.attackerParallelism;
  return base;
}

function onlineSpeed(params: SimulationParams): number {
  const { defender } = params;
  const perMinute = defender.rateLimitPerMinute;
  // Simple model: if lockout threshold exceeded, pause for lockoutSeconds then resume.
  // We approximate average effective rate: attemptsPerCycle / cycleSeconds.
  const threshold = defender.lockoutThreshold;
  const lockSeconds = defender.lockoutSeconds;
  if (threshold <= 0) return perMinute / 60;
  const attemptsPerCycle = threshold;
  const cycleSeconds = (threshold * 60) / perMinute + lockSeconds;
  return attemptsPerCycle / cycleSeconds;
}

function applyMfaProbability(pSuccess: number, params: SimulationParams): number {
  if (!params.defender.mfaEnabled) return pSuccess;
  // Attacker must both guess password and bypass MFA.
  return pSuccess * params.defender.mfaBypassProbability;
}

export function simulate(params: SimulationParams): SimulationResult {
  const keyspace = computeKeyspace(params.password);
  const notes: string[] = [];
  if (keyspace === 0) return { keyspace, expectedTrialsNoReplacement: 0, expectedTrialsReplacement: 0, t50: 0, t95: 0, curve: [], effectiveGuessesPerSecond: 0, currentGuesses: 0, successBoolean: false, notes: ['Invalid keyspace'] };

  const gPerSecBase = params.context === 'offline' ? offlineSpeed(params) : onlineSpeed(params);
  const gPerSec = applyMfaProbability(gPerSecBase, params);
  if (!params.hashPreset.salt) notes.push('No salt: same hash across users enables rainbow tables (if hash is fast).');
  else notes.push('Salted: unique per-user salts defeat precomputed rainbow tables.');
  if (params.hashPreset.memoryHard) notes.push('Memory-hard KDF slows parallel GPUs/ASICs.');
  else notes.push('Fast hash allows high parallel guess rate.');

  const expectedTrialsNoReplacement = keyspace / 2; // average position in random permutation
  const expectedTrialsReplacement = keyspace * Math.log(2); // k50: guesses to reach 50% under replacement model

  // Time for 50% & 95% using Poisson approximation (replacement model)
  const g50 = keyspace * Math.log(2); // N ln2
  const g95 = keyspace * Math.log(20); // N ln20 ~ 2.9957N

  const t50 = g50 / gPerSec;
  const t95 = g95 / gPerSec;

  const curve: SimulationPoint[] = [];
  const dt = params.maxSeconds / params.points;
  for (let i = 0; i <= params.points; i++) {
    const t = i * dt;
    const guesses = gPerSec * t;
    // Probability (replacement model): p = 1 - (1 - 1/N)^guesses ≈ 1 - e^{-guesses/N}
    const pApprox = 1 - Math.exp(-guesses / keyspace);
    const pAdj = applyMfaProbability(pApprox, params);
    curve.push({ t, guesses, pSuccess: pAdj });
  }

  const current = gPerSec * params.maxSeconds;
  const pSuccess = 1 - Math.exp(-current / keyspace);
  let success = Math.random() < pSuccess/2;


  
  if (current >= keyspace)  {
    success = true; 
  }
  

  notes.push(`50% success without replacement ~ N/2; with replacement k50 ~ N ln2 ≈ ${(Math.log(2)).toFixed(3)}N; mean geometric trials is N.`);
  return {
    keyspace,
    expectedTrialsNoReplacement,
    expectedTrialsReplacement,
    t50,
    t95,
    curve,
    effectiveGuessesPerSecond: gPerSec,
    notes,
    currentGuesses: current,
    successBoolean: success,
  };
}

export function formatNumber(n: number): string {
  if (!isFinite(n)) return '∞';
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return n.toFixed(2);
}

export function formatSeconds(sec: number): string {
  if (sec < 1) return sec.toFixed(2) + 's';
  const units: [number, string][] = [
    [60 * 60 * 24 * 365, 'y'],
    [60 * 60 * 24 * 30, 'mo'],
    [60 * 60 * 24, 'd'],
    [60 * 60, 'h'],
    [60, 'm'],
    [1, 's'],
  ];
  for (const [u, label] of units) {
    if (sec >= u) return (sec / u).toFixed(2) + label;
  }
  return sec.toFixed(2) + 's';
}
