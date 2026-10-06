# Vendored — provenance & credit

- `vendor/pattern-forge/*.mjs` — the sovereign pattern-forge kernels (`pattern.mjs`, `breed.mjs`,
  `book.mjs`, `mint.mjs`) of **pattern-forge** (https://sjgant80-hub.github.io/pattern-forge/,
  AI-Native Solutions / Simon Gant), copied **unchanged** from `sjgant80-hub/pattern-forge` at pinned
  commit `0f6efb1`. Their mutation proof (witness score 1.0) and fuzz proof live in that repo; here they
  are vendored, credited, pinned, and re-fuzzed in CI. churn-forge's **own** new code is `load.mjs` (the
  real-CSV reader) — that is the kernel this repo mutation-witnesses.

- `vendor/fallforgemint/kernel.mjs` — the mint kernel of **FallForge Mint**
  (https://sjgant80-hub.github.io/fallforgemint/, AI-Native Solutions / Simon Gant), copied **unchanged**
  from `sjgant80-hub/fallforgemint` at pinned commit `2db5257bd79562679a908573f4489d2ccc580aa8`. `mint.mjs`
  uses its real `mintVerdict` (a node mints only on a certified BEATS receipt) and `ownVsRent` (the honest
  own-vs-rent economics). fallforgemint is a self-contained product and is **not modified** by this repo.

- `data/telco-churn.csv` — IBM's public sample **Telco Customer Churn** dataset (7,043 real telecom
  customers, 21 columns). Redistributed here **frozen and unchanged**, sealed by sha256
  `16320c9c1ec72448db59aa0a26a0b95401046bef5d02fd3aeb906448e3055e91` (CI verifies the bytes on every run).
  It is a widely-mirrored public teaching dataset; credit to IBM for the sample. No proprietary or personal
  customer data of any real company is used.
