export type ModelKind = 'bruteforce' | 'dictionary'

export function keyspace(alphabetSize: number, length: number): number {
  if (alphabetSize <= 0 || length <= 0) return 0
  // Use Number pow; for huge values this is approximate but fine for viz
  return Math.pow(alphabetSize, length)
}

export function pSuccessBruteforce(guesses: number, N: number): number {
  if (!isFinite(N) || N <= 0) return 0
  if (guesses <= 0) return 0
  // Numerically stable approx: 1 - exp(-g/N)
  return 1 - Math.exp(-guesses / N)
}

export function pSuccessDictionary(guesses: number, D: number, coverage: number): number {
  if (D <= 0 || coverage <= 0) return 0
  const p = (coverage * guesses) / D
  return Math.max(0, Math.min(coverage, p))
}

export function expectedTrialsBruteforce(N: number) {
  return N / 2
}

export function tForTargetBruteforce(target: number, N: number, r: number): number | null {
  if (r <= 0 || N <= 0) return null
  if (target <= 0) return 0
  if (target >= 1) target = 0.999999
  return (-Math.log(1 - target) * N) / r
}

export function tForTargetDictionary(target: number, D: number, coverage: number, r: number): number | null {
  if (r <= 0 || D <= 0 || coverage <= 0) return null
  if (target > coverage) return null
  if (target <= 0) return 0
  const requiredGuesses = (target / coverage) * D
  return requiredGuesses / r
}

export function computeCurve(params: {
  model: ModelKind
  durationSec: number
  steps?: number
  r: number
  // Brute force params
  N?: number
  // Dictionary params
  D?: number
  coverage?: number
}): { t: number[]; p: number[] } {
  const { model, durationSec, r } = params
  const steps = Math.max(10, params.steps ?? 150)
  const dt = durationSec / steps
  const t: number[] = []
  const p: number[] = []
  for (let i = 0; i <= steps; i++) {
    const ti = i * dt
    const g = Math.max(0, r) * ti
    let pi = 0
    if (model === 'bruteforce') {
      pi = pSuccessBruteforce(g, params.N ?? 0)
    } else {
      pi = pSuccessDictionary(g, params.D ?? 0, params.coverage ?? 0)
    }
    t.push(ti)
    p.push(Math.max(0, Math.min(1, pi)))
  }
  return { t, p }
}

export function effectiveOnlineRate(baseR: number, rateLimitR: number, lockoutThreshold: number, lockoutDurationSec: number): number {
  if (baseR <= 0) return 0
  const r0 = Math.max(0, Math.min(baseR, Math.max(0, rateLimitR)))
  if (lockoutThreshold <= 0 || lockoutDurationSec <= 0) return r0
  const timeToThreshold = lockoutThreshold / r0
  const cycleTime = timeToThreshold + lockoutDurationSec
  return lockoutThreshold / cycleTime
}

export function formatNumber(n: number): string {
  if (!isFinite(n)) return '∞'
  if (n === 0) return '0'
  const abs = Math.abs(n)
  if (abs >= 1e6 || abs < 1e-2) return n.toExponential(3)
  return n.toLocaleString(undefined, { maximumFractionDigits: 3 })
}
