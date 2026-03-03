/**
 * 1099 vs W-2 Take-Home (US Federal Only) — Core Logic
 * Deterministic, browser-only.
 * Scope: 2025 federal brackets (IRS), standard deduction only, no state taxes, no QBI, no AMT.
 */

export const TAX_YEAR = 2025;

// Sources (for copy/FAQ; logic is hardcoded for determinism):
// - IRS tax brackets (2025): https://www.irs.gov/filing/federal-income-tax-rates-and-brackets
// - SSA contribution & benefit base (2025): https://www.ssa.gov/oact/cola/cbb.html

export const CONFIG_2025 = {
  standardDeductionSingle: 15750, // IRS newsroom notes TY2025 under current law adjustments.
  // Federal income tax brackets — Single filer — taxable income thresholds.
  // Each bracket: [cap, rate] where cap is upper bound (inclusive) for that bracket.
  incomeBracketsSingle: [
    [11925, 0.10],
    [48475, 0.12],
    [103350, 0.22],
    [197300, 0.24],
    [250525, 0.32],
    [626350, 0.35],
    [Infinity, 0.37],
  ],
  // Payroll taxes (employee share) / Self-employment taxes:
  ssRateEmployee: 0.062,
  ssRateSelfEmployed: 0.124,
  medicareRateEmployee: 0.0145,
  medicareRateSelfEmployed: 0.029,
  // Social Security wage base (2025):
  ssWageBase: 176100,
  // SE tax applies to 92.35% of net earnings:
  seEarningsFactor: 0.9235,
};

/** Clamp to >= 0 */
export function nonNeg(x) {
  return Math.max(0, Number.isFinite(x) ? x : 0);
}

/**
 * Compute progressive tax for given taxable income (>=0) using brackets.
 * brackets = [[cap, rate], ...] caps ascending; final cap may be Infinity.
 */
export function progressiveTax(taxableIncome, brackets) {
  const ti = nonNeg(taxableIncome);
  let tax = 0;
  let prevCap = 0;

  for (const [cap, rate] of brackets) {
    const upper = cap;
    const amountInBracket = Math.max(0, Math.min(ti, upper) - prevCap);
    tax += amountInBracket * rate;
    prevCap = upper;
    if (ti <= upper) break;
  }
  return tax;
}

/** Employee payroll (FICA) taxes for W-2 wages */
export function ficaEmployee(wages, cfg = CONFIG_2025) {
  const w = nonNeg(wages);
  const ssTax = Math.min(w, cfg.ssWageBase) * cfg.ssRateEmployee;
  const medicareTax = w * cfg.medicareRateEmployee;
  return { ssTax, medicareTax, ficaTax: ssTax + medicareTax };
}

/**
 * Self-employment tax for 1099 net earnings (no expenses modeled; net = gross in v1)
 * - Apply 92.35% factor
 * - SS portion capped at wage base
 * - Medicare portion uncapped
 * - 50% deduction of SE tax for income tax purposes
 */
export function selfEmploymentTax(netEarnings, cfg = CONFIG_2025) {
  const net = nonNeg(netEarnings);
  const seBase = net * cfg.seEarningsFactor;
  const ssPortion = Math.min(seBase, cfg.ssWageBase) * cfg.ssRateSelfEmployed;
  const medicarePortion = seBase * cfg.medicareRateSelfEmployed;
  const seTax = ssPortion + medicarePortion;
  const seDeduction = seTax * 0.5;
  return { seBase, ssPortion, medicarePortion, seTax, seDeduction };
}

/** W-2 scenario (single filer, standard deduction only) */
export function w2TakeHome(grossWages, cfg = CONFIG_2025) {
  const gross = nonNeg(grossWages);
  const taxable = nonNeg(gross - cfg.standardDeductionSingle);
  const incomeTax = progressiveTax(taxable, cfg.incomeBracketsSingle);
  const fica = ficaEmployee(gross, cfg);
  const totalTax = incomeTax + fica.ficaTax;
  const takeHome = gross - totalTax;

  return {
    type: "W2",
    gross,
    taxableIncome: taxable,
    incomeTax,
    payrollTax: fica.ficaTax,
    payrollTaxBreakdown: fica,
    totalTax,
    takeHome,
    effectiveTaxRate: gross > 0 ? totalTax / gross : 0,
  };
}

/** 1099 scenario (single filer, standard deduction only, SE tax modeled) */
export function contractorTakeHome(gross1099, cfg = CONFIG_2025) {
  const gross = nonNeg(gross1099);
  // v1: no expenses modeling, so net = gross
  const se = selfEmploymentTax(gross, cfg);

  // Income tax deduction: 50% of SE tax, then standard deduction.
  const adjustedGross = nonNeg(gross - se.seDeduction);
  const taxable = nonNeg(adjustedGross - cfg.standardDeductionSingle);
  const incomeTax = progressiveTax(taxable, cfg.incomeBracketsSingle);

  const totalTax = incomeTax + se.seTax;
  const takeHome = gross - totalTax;

  return {
    type: "1099",
    gross,
    netEarnings: gross,
    seTax: se.seTax,
    seTaxBreakdown: se,
    adjustedGross,
    taxableIncome: taxable,
    incomeTax,
    totalTax,
    takeHome,
    effectiveTaxRate: gross > 0 ? totalTax / gross : 0,
  };
}

/** Compare W-2 vs 1099 for same gross input */
export function compare(grossAnnual, cfg = CONFIG_2025) {
  const w2 = w2TakeHome(grossAnnual, cfg);
  const c = contractorTakeHome(grossAnnual, cfg);
  const diff = c.takeHome - w2.takeHome;

  return {
    gross: nonNeg(grossAnnual),
    w2,
    contractor: c,
    takeHomeDifference: diff,
    winner: diff > 0 ? "1099" : diff < 0 ? "W2" : "Tie",
    differencePctOfGross: (nonNeg(grossAnnual) > 0) ? (Math.abs(diff) / nonNeg(grossAnnual)) : 0,
  };
}