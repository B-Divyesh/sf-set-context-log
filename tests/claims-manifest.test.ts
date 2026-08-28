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

  it('removes unavailable billing and unsupported setup claims', () => {
    const productFiles = ['index.html', 'README.md', 'public/privacy/index.html', 'public/terms/index.html', 'src/main.ts']
      .map((path) => readFileSync(resolve(path), 'utf8'))
      .join('\n');
    expect(productFiles).not.toMatch(/\$9|checkout|merchant of record|license token|Node\.js 20|Playwright suite is pinned|payment-provider credential/i);
    expect(productFiles).not.toMatch(/openai\.azure\.com|sbk_[A-Za-z0-9_-]+|VITE_BILLING_API_BASE/i);
  });

  it('uses result-naming controls and actionable recovery messages', () => {
    const interfaceCopy = `${readFileSync(resolve('index.html'), 'utf8')}\n${readFileSync(resolve('src/main.ts'), 'utf8')}`;
    for (const label of ['Change settings', 'Install app', 'Keep set', 'Reload app']) expect(interfaceCopy).toContain(label);
    expect(interfaceCopy).not.toContain('That action could not be completed.');
    expect(interfaceCopy).not.toContain('That backup could not be imported.');
    expect(interfaceCopy).not.toContain('Offline setup was unavailable.');
    expect(interfaceCopy).toContain('because browser storage is unavailable');
    expect(interfaceCopy).toContain('reload while online');
  });
});
