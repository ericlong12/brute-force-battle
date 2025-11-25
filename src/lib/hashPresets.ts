import type { HashPreset } from './models';

export const hashPresets: HashPreset[] = [
  {
    id: 'md5',
    name: 'MD5 (fast, unsalted)',
    hashPerSecond: 5e10,
    description: 'Legacy fast hash. Enables huge offline throughput & rainbow tables.',
    salt: false,
    memoryHard: false,
  },
  {
    id: 'sha256',
    name: 'SHA-256 (fast, salted)',
    hashPerSecond: 2e10,
    description: 'Fast cryptographic hash with per-user salt (still high speed).',
    salt: true,
    memoryHard: false,
  },
  {
    id: 'bcrypt10',
    name: 'bcrypt cost=10',
    hashPerSecond: 5e3,
    description: 'Adaptive password hash. Salted & intentionally slow.',
    salt: true,
    memoryHard: false,
    kdfCostNote: 'Cost factor 10 ~ 5k hashes/sec on single GPU (approx).',
  },
  {
    id: 'argon2id_mod',
    name: 'Argon2id (moderate)',
    hashPerSecond: 1e4,
    description: 'Memory-hard KDF with salt, moderate parameters.',
    salt: true,
    memoryHard: true,
    kdfCostNote: '~10k H/s depending on memory (illustrative).',
  },
  {
    id: 'argon2id_strong',
    name: 'Argon2id (strong)',
    hashPerSecond: 2e3,
    description: 'Stronger memory/time params drastically slow attackers.',
    salt: true,
    memoryHard: true,
    kdfCostNote: '~2k H/s strong params (illustrative).',
  },
];

export function getPreset(id: string): HashPreset | undefined {
  return hashPresets.find(p => p.id === id);
}
