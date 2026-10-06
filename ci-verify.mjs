// ci-verify.mjs — re-derive, on GitHub's runner, what the forge finds in the REAL Telco churn data and
// prove it matches the sealed predictions.json. The dataset is frozen (data/telco-churn.csv, sha-pinned);
// the kernels are vendored from pattern-forge; nothing here is typed — every number comes from the run.
import { readFileSync } from 'node:fs';
import { loadChurn, churnRate, FEATURES } from './load.mjs';
import { forge } from './vendor/pattern-forge/pattern.mjs';
import { breed } from './vendor/pattern-forge/breed.mjs';
import { mint, verifyMint, economics } from './vendor/pattern-forge/mint.mjs';

const r3 = (x) => Math.round(x * 1000) / 1000;

export function derive() {
  const csv = readFileSync(new URL('./data/telco-churn.csv', import.meta.url), 'utf8');
  const cases = loadChurn(csv);
  const r = forge(cases, { holdoutFrac: 1 / 3, bar: 0.6 });
  const ranked = r.proposed.slice().sort((a, b) => b.testBA - a.testBA);
  const best = ranked[0];
  const b = breed(cases, { generations: 3, keep: 8, maxTerms: 3 });
  // mint the single best generalising pattern as an owned model; base = balanced-chance (0.5)
  const mm = mint({ kind: 'stump', feature: best.feature, threshold: best.threshold, dir: best.dir }, best.testBA, 0.5);
  const econ = economics({ callsPerMonth: 100000, tokensPerCall: 60, rentPerMillion: 3, setupCost: 0, runPerMonth: 0 });
  return {
    cases: cases.length,
    churnRate: churnRate(cases),
    bestFeature: FEATURES[best.feature],
    bestTestBA: r3(best.testBA),
    survivors: r.survivors.length,
    breedImproved: b.improvedHeldOut,
    breedChampionTerms: b.champion ? b.champion.terms : 0,
    mintMinted: mm.minted === true,
    mintBytes: mm.bytes,
    mintFingerprintOk: verifyMint(mm),
    mintEconVerdict: econ.verdict,
  };
}

if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].endsWith('ci-verify.mjs')) {
  const preds = JSON.parse(readFileSync(new URL('./predictions.json', import.meta.url), 'utf8'));
  const m = derive();
  let fail = 0;
  for (const [k, v] of Object.entries(preds.expected)) if (m[k] !== v) { console.error(`MISMATCH ${k}: expected ${v}, got ${m[k]}`); fail++; }
  const holds = (e) => { const { cases, churnRate, bestFeature, bestTestBA, survivors, breedImproved, breedChampionTerms, mintMinted, mintBytes, mintFingerprintOk, mintEconVerdict } = m; try { return !!eval(e); } catch { return false; } };
  for (const c of preds.claims) if (!holds(c.check)) { console.error(`CLAIM FAIL ${c.id}: ${c.check}`); fail++; }
  if (fail) { console.error(`\n${fail} mismatch(es).`); process.exit(1); }
  console.log('✓ re-derived from the real data; all', preds.claims.length, 'claims hold.');
  console.log(JSON.stringify(m));
}
