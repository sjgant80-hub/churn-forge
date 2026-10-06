# churn-forge

**▶ Live: https://sjgant80-hub.github.io/churn-forge/**

The sovereign [pattern forge](https://sjgant80-hub.github.io/pattern-forge/) pointed at a **real company
dataset** — 7,043 real telecom customers (IBM's public *Telco Customer Churn* set). It finds the churn
patterns that genuinely **generalise** to customers it never saw, reports honestly where a fancier model
does **not** help, and mints the winner as a tiny **owned** model. Every number on the live page is
re-derived in your browser from the gated kernel, and re-checked on GitHub's own runner in CI.

## What it proves (sealed before measurement, in `predictions.json`)

Run live on all 7,043 customers:

| # | Claim | Result |
|---|-------|--------|
| P1 | A churn pattern **generalises** on held-out customers, well above coin-flip | held-out BA **0.726** |
| P2 | The strongest driver is a real, nameable one | **month-to-month contract** |
| P3 | Several patterns clear the held-out bar | **4** survivors |
| P4 | **Honest:** breeding compound rules did **NOT** beat the single best pattern here | reported, not overclaimed |
| P5 | The classifier mints as a tiny **owned** model, and owning beats renting an LLM | **20 bytes**, `OWN_WINS` |

P4 is the point as much as P1: the forge is allowed to say "a fancier model didn't help" instead of
inventing an improvement. One clear rule already captures the signal.

## Why this is the alternative to RAG-on-your-CSV

The usual way to "ask AI about your churn" is to embed every row and **rent** an LLM to read them back —
a per-call bill, your customer data leaving the building, and an answer you can't re-check. churn-forge
does the opposite: it keeps only the rules that survive data they never saw, hands you a 20-byte model you
run yourself for nothing, and the whole derivation is re-runnable. **Bring your own CSV** (same 21-column
shape) and the same pipeline runs on it.

## Proof-of-play

- `load.mjs` — churn-forge's own kernel (the real-CSV reader): **mutation-witnessed, score 1.0** + fuzzed.
- `data/telco-churn.csv` — the real data, **frozen + sha256-sealed**; CI verifies the exact bytes.
- `ci-verify.mjs` — re-derives every sealed fact from the real data on GitHub's runner and checks it
  against `predictions.json`. The live page runs the identical kernels and self-checks the same claims.
- Forge / breed / mint kernels are **vendored and pinned** from
  [pattern-forge](https://sjgant80-hub.github.io/pattern-forge/) and
  [fallforgemint](https://sjgant80-hub.github.io/fallforgemint/) — see [VENDOR.md](VENDOR.md).

```bash
node --test                                        # unit tests
node tools/witness.mjs mutate load.mjs --test node --test   # the own kernel is CLEAN
node ci-verify.mjs                                 # re-derive the sealed facts from the real data
```

Data: IBM sample *Telco Customer Churn* (public). Built by **Kar · AI-Native Solutions**. Credit for the
pattern-forge and mint kernels: AI-Native Solutions / Simon Gant.
