import crypto from 'crypto';
import { writeFileSync } from 'fs';

function createSeededRng(seed: string) {
  let state = crypto.createHash('sha256').update(seed).digest();

  return () => {
    state = crypto.createHash('sha256').update(state).digest();
    return state.readUInt32BE(0) / 0xffffffff;
  };
}

function generateList(seed: string, count: number): string[] {
  const rng = createSeededRng(seed);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const result = new Set<string>();

  while (result.size < count) {
    let str = '';
    for (let i = 0; i < 6; i++) {
      const idx = Math.floor(rng() * chars.length);
      str += chars[idx];
    }
    result.add(str);
  }

  return [ ...result ] as string[];
}

const list = generateList('my-seed', 100);

writeFileSync('./codes.json', JSON.stringify(list, null, 2), 'utf-8');
