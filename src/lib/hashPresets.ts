export type HashPreset = {
  id: string
  label: string
  guessesPerSec: number
  notes?: string
}

// Educational, order-of-magnitude demo values ONLY
export const HASH_PRESETS: HashPreset[] = [
  {
    id: 'fast-md5',
    label: 'Fast Hash (MD5/SHA1-like)',
    guessesPerSec: 1e9,
    notes: 'Fast unsalted hashing on capable hardware; demo-only speed.',
  },
  {
    id: 'bcrypt-12',
    label: 'bcrypt (cost 12)',
    guessesPerSec: 5e4,
    notes: 'Slower, CPU-bound; ballpark demo value.',
  },
  {
    id: 'argon2',
    label: 'Argon2 (mem-hard)',
    guessesPerSec: 2e3,
    notes: 'Memory-hard KDF; demo value depends on memory/time params.',
  },
  {
    id: 'pbkdf2-310k',
    label: 'PBKDF2 ~310k iters',
    guessesPerSec: 2e4,
    notes: 'Typical PBKDF2 with high iterations; demo-only.',
  },
]
