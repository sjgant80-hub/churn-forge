// load.mjs — turn the REAL Telco Customer Churn CSV (7,043 real telecom customers) into labelled cases
// the pattern forge can work on. Source: IBM sample "Telco-Customer-Churn.csv" (frozen in data/, sealed
// by sha256). Target y = did the customer CHURN (leave). Six features the forge reads as numbers:
//   tenure, MonthlyCharges, TotalCharges, SeniorCitizen (0/1), contractMonthly (1 if month-to-month),
//   fiberOptic (1 if fibre internet) — the last two encode the two categoricals known to drive churn.
// Pure, deterministic, never throws on garbage.

export const FEATURES = ['tenure', 'MonthlyCharges', 'TotalCharges', 'seniorCitizen', 'contractMonthly', 'fiberOptic'];

const numOr0 = (s) => { const v = parseFloat(s); return Number.isFinite(v) ? v : 0; };

/** parse the churn CSV text → [{ x:[6 numbers], y:0|1 }]. Header dropped; short/garbage rows skipped. */
export function loadChurn(csv) {
  if (typeof csv !== 'string') return [];
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const cases = [];
  for (let i = 1; i < lines.length; i++) {        // skip the header row
    const c = lines[i].split(',');
    if (c.length < 21) continue;                   // a real row has 21 columns
    cases.push({
      x: [numOr0(c[5]), numOr0(c[18]), numOr0(c[19]), numOr0(c[2]),
        c[15] === 'Month-to-month' ? 1 : 0,
        c[8] === 'Fiber optic' ? 1 : 0],
      y: c[20] === 'Yes' ? 1 : 0,
    });
  }
  return cases;
}

/** the churn rate (share of y===1) — the base rate a model has to beat to be worth anything. */
export function churnRate(cases) {
  if (!Array.isArray(cases) || cases.length === 0) return 0;
  const pos = cases.reduce((n, c) => n + (c && c.y === 1 ? 1 : 0), 0);
  return Math.round((pos / cases.length) * 1000) / 1000;
}
