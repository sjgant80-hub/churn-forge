import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadChurn, churnRate, FEATURES } from './load.mjs';

// inline sample rows in the exact Telco-Customer-Churn column order (21 columns). The full 7,043-row
// dataset is exercised by ci-verify.mjs on the runner; these pin the PARSING logic for the mutation gate.
const HEADER = 'customerID,gender,SeniorCitizen,Partner,Dependents,tenure,PhoneService,MultipleLines,InternetService,OnlineSecurity,OnlineBackup,DeviceProtection,TechSupport,StreamingTV,StreamingMovies,Contract,PaperlessBilling,PaymentMethod,MonthlyCharges,TotalCharges,Churn';
const CSV = [
  HEADER,
  '7590-VHVEG,Female,0,Yes,No,1,No,No phone service,DSL,No,Yes,No,No,No,No,Month-to-month,Yes,Electronic check,29.85,29.85,No',   // the real first row
  'X1,Male,1,No,No,5,Yes,No,Fiber optic,No,No,No,No,No,No,Month-to-month,Yes,Electronic check,80.0,400.0,Yes',                      // fibre + senior + month-to-month, churned
  'X2,Female,0,Yes,Yes,0,Yes,No,DSL,Yes,Yes,Yes,Yes,No,No,Two year,No,Mailed check,20.0, ,No',                                       // blank TotalCharges, two-year, stayed
].join('\n');

test('FEATURES: the six numeric features the forge reads', () => {
  assert.deepEqual(FEATURES, ['tenure', 'MonthlyCharges', 'TotalCharges', 'seniorCitizen', 'contractMonthly', 'fiberOptic']);
});

test('loadChurn: header dropped, each row → 6 finite features + a 0/1 label', () => {
  const cases = loadChurn(CSV);
  assert.equal(cases.length, 3);
  for (const c of cases) { assert.equal(c.x.length, 6); assert.ok(c.x.every(Number.isFinite)); assert.ok(c.y === 0 || c.y === 1); }
});

test('loadChurn: the real first row is parsed exactly', () => {
  const [a] = loadChurn(CSV);
  assert.deepEqual(a.x, [1, 29.85, 29.85, 0, 1, 0]);  // tenure, monthly, total, senior, month-to-month, fibre
  assert.equal(a.y, 0);                                // Churn = No
});

test('loadChurn: encodes the churn drivers — fibre=1, senior=1, month-to-month=1, churn=1', () => {
  const b = loadChurn(CSV)[1];
  assert.equal(b.x[3], 1);   // SeniorCitizen
  assert.equal(b.x[4], 1);   // contractMonthly
  assert.equal(b.x[5], 1);   // fiberOptic
  assert.equal(b.y, 1);      // churned
});

test('loadChurn: blank TotalCharges → 0; two-year contract → 0; never NaN or a throw', () => {
  const c = loadChurn(CSV)[2];
  assert.equal(c.x[2], 0);   // blank TotalCharges
  assert.equal(c.x[4], 0);   // Two year (not month-to-month)
  assert.ok(c.x.every(Number.isFinite));
});

test('loadChurn: a leading blank line does not shift the header into the data', () => {
  // without the blank-line drop, a leading '' keeps the header at index 1 and it gets parsed as a case.
  assert.deepEqual(loadChurn('\n' + CSV), loadChurn(CSV));  // same 3 cases; header still dropped
});

test('churnRate + garbage: totals are safe, never throw', () => {
  assert.equal(churnRate(loadChurn(CSV)), Math.round((1 / 3) * 1000) / 1000);  // 1 of 3 churned
  assert.equal(churnRate([]), 0);
  for (const g of [null, undefined, 5, 'x', 42]) { assert.doesNotThrow(() => loadChurn(g)); assert.doesNotThrow(() => churnRate(g)); }
  assert.deepEqual(loadChurn(42), []);
  assert.deepEqual(loadChurn('header only,no,data'), []);  // header, no rows → []
});
