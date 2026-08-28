import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

interface Claim { id: string; claim: string; where: string; test: string; sandbox: string }

const claims = JSON.parse(readFileSync(resolve('.factory/claims.json'), 'utf8')) as Claim[];
const claimTests = readFileSync(resolve('tests/e2e/claims.spec.ts'), 'utf8');

describe('claim registry', () => {
  it('maps every unique claim to exactly one tagged test', () => {
    expect(new Set(claims.map((claim) => claim.id)).size).toBe(claims.length);
    for (const claim of claims) {
      expect(claim.claim).toBeTruthy();
      expect(claim.where).toBeTruthy();
      expect(claim.sandbox).toBeTruthy();
      expect(claim.test).toBe(`npm run test:claims -- --grep @claim:${claim.id}`);
      expect(claimTests.match(new RegExp(`@claim:${claim.id}(?![a-z0-9-])`, 'g'))).toHaveLength(1);
    }
    const tags = [...claimTests.matchAll(/@claim:([a-z0-9-]+)/g)].map((match) => match[1]);
    expect(tags.sort()).toEqual(claims.map((claim) => claim.id).sort());
  });

  it('keeps the catalog sentence short and verb-first', () => {
    const description = readFileSync(resolve('.factory/catalog-description.txt'), 'utf8').trim();
    expect(description.length).toBeLessThanOrEqual(120);
    expect(description).toMatch(/^Log\b/);
    expect(description.split(/\s+/)).toHaveLength(14);
  });

  it('keeps banned marketing words out of shipped copy', () => {
    const shippedCopy = ['index.html', 'README.md', 'public/privacy/index.html', 'public/terms/index.html', 'public/404/index.html', 'src/main.ts']
      .map((path) => readFileSync(resolve(path), 'utf8'))
      .join('\n');
    expect(shippedCopy).not.toMatch(/\b(?:leverage|seamless|effortless|robust|powerful|intuitive|reimagine|supercharge|unlock|delightful|journey|ecosystem|AI-powered)\b/i);
  });
});
