// ─── SCROLL HELPER ───────────────────────────────────────────
function navScrollTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const navH = 64;
  const top = el.getBoundingClientRect().top + window.pageYOffset - navH - 8;
  window.scrollTo({ top, behavior: 'smooth' });
}

// ─── STATE ───────────────────────────────────────────────────
let taxOn = true;
let chart = null;

const BENCHMARKS = [
  { name: "High Yield Savings", return: 4.5 },
  { name: "US Treasury Bonds", return: 4.0 },
  { name: "Corporate Bonds", return: 5.5 },
  { name: "S&P 500", return: 10 },
  { name: "REITs", return: 8 },
  { name: "Real Estate Avg", return: 7 },
  { name: "Crypto", return: 15 }
];

// ─── HELPERS ─────────────────────────────────────────────────
const fmt = (n, decimals = 0) => {
  if (n === null || isNaN(n)) return '—';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= 1000000) return sign + '$' + (abs / 1000000).toFixed(2) + 'M';
  if (abs >= 1000) return sign + '$' + abs.toLocaleString('en-US', { maximumFractionDigits: decimals });
  return sign + '$' + abs.toFixed(decimals);
};
const fmtPct = (n, d = 1) => isNaN(n) ? '—' : n.toFixed(d) + '%';
const v = id => parseFloat(document.getElementById(id).value) || 0;
function colorClass(n) { return n > 0 ? 'green' : n < 0 ? 'red' : ''; }

// ─── SYNC SLIDERS ────────────────────────────────────────────
function syncSlider(inputId, sliderId) {
  document.getElementById(inputId).value = document.getElementById(sliderId).value;
}
function syncInput(inputId, sliderId) {
  document.getElementById(sliderId).value = document.getElementById(inputId).value;
}

// ─── TAX TOGGLE ──────────────────────────────────────────────
function toggleTax() {
  taxOn = !taxOn;
  const tog = document.getElementById('tax-toggle');
  const badge = document.getElementById('tax-badge');
  const taxInputs = document.getElementById('tax-inputs');
  tog.classList.toggle('on', taxOn);
  badge.textContent = taxOn ? 'Tax Benefits ON' : 'Tax Benefits OFF';
  badge.classList.toggle('on', taxOn);
  taxInputs.style.opacity = taxOn ? '1' : '0.4';
  taxInputs.style.pointerEvents = taxOn ? '' : 'none';
  recalc();
}

// ─── CORE CALCULATIONS ───────────────────────────────────────
function calc() {
  const price = v('price');
  const down = v('down');
  const rate = v('rate');
  const term = v('term');
  const rent = v('rent');
  const vac = v('vac');
  const ptax = v('ptax');
  const ins = v('ins');
  const maint = v('maint');
  const mgmt = v('mgmt');
  const hoa = v('hoa');
  const appr = v('appr');
  const taxrate = v('taxrate');

  // Loan
  const loan = Math.max(0, price - down);
  const monthlyRate = rate / 12 / 100;
  const n = term * 12;
  let emi = 0;
  if (monthlyRate > 0 && n > 0) {
    const pow = Math.pow(1 + monthlyRate, n);
    emi = loan * monthlyRate * pow / (pow - 1);
  } else if (n > 0) {
    emi = loan / n;
  }
  const annualMort = emi * 12;

  // Rental income
  const grossRent = rent * 12;
  const vacancyLoss = grossRent * (vac / 100);
  const effectiveRent = grossRent - vacancyLoss;

  // Expenses
  const expPtax = price * (ptax / 100);
  const expMaint = grossRent * (maint / 100);
  const expMgmt = grossRent * (mgmt / 100);
  const expHoa = hoa * 12;
  const totalExp = expPtax + ins + expMaint + expMgmt + expHoa;

  // NOI
  const noi = effectiveRent - totalExp;

  // Cash flow
  const cf = noi - annualMort;

  // Rates
  const capRate = price > 0 ? (noi / price) * 100 : 0;
  const coc = down > 0 ? (cf / down) * 100 : 0;

  // Tax
  const interestYear1 = loan * (rate / 100);
  const depreciableVal = price * 0.8;
  const depreciation = depreciableVal / 27.5;
  const taxBenefit = taxOn ? (interestYear1 + depreciation) * (taxrate / 100) : 0;

  const adjCf = cf + taxBenefit;
  const taxCoc = down > 0 ? (adjCf / down) * 100 : 0;

  // Total return
  const apprValue = price * (appr / 100);
  const totalReturn = adjCf + apprValue;

  // ── Advanced Metrics ──────────────────────────────────────
  // DSCR
  const dscr = annualMort > 0 ? noi / annualMort : 0;

  // Break-even Occupancy = (Total Expenses + Annual Mortgage) / Gross Rent
  const beo = grossRent > 0 ? ((totalExp + annualMort) / grossRent) * 100 : 0;

  // Gross Rent Multiplier
  const grm = grossRent > 0 ? price / grossRent : 0;

  // IRR (5-year) — Newton-Raphson approximation
  const rg    = v('rentgrowth') / 100;
  const apprR = v('appr') / 100;
  const exitPrice5  = price * Math.pow(1 + apprR, 5);
  const loanBal5    = (() => {
    const r5 = v('rate') / 12 / 100;
    const n5 = v('term') * 12;
    if (r5 === 0) return Math.max(0, loan - emi * 60);
    return loan * (Math.pow(1 + r5, n5) - Math.pow(1 + r5, 60)) / (Math.pow(1 + r5, n5) - 1);
  })();
  const exitEquity  = exitPrice5 - loanBal5;
  const cashFlows   = [-down];
  for (let yr = 1; yr <= 5; yr++) {
    const rentGrown = effectiveRent * Math.pow(1 + rg, yr - 1);
    const opExpGrown = totalExp * Math.pow(1 + 0.02, yr - 1);
    const noiYr     = rentGrown - opExpGrown;
    const cfYr      = noiYr - annualMort;
    const taxBenYr  = taxBenefit;
    const adjCfYr   = cfYr + taxBenYr;
    cashFlows.push(yr === 5 ? adjCfYr + exitEquity : adjCfYr);
  }
  // Newton-Raphson IRR solver
  const calcNPV = (rate, cfs) => cfs.reduce((sum, cf, i) => sum + cf / Math.pow(1 + rate, i), 0);
  let irr = 0.10;
  for (let i = 0; i < 100; i++) {
    const npv  = calcNPV(irr, cashFlows);
    const dNpv = cashFlows.reduce((sum, cf, i) => sum - i * cf / Math.pow(1 + irr, i + 1), 0);
    if (Math.abs(dNpv) < 1e-10) break;
    const newIrr = irr - npv / dNpv;
    if (Math.abs(newIrr - irr) < 1e-8) { irr = newIrr; break; }
    irr = newIrr;
  }
  const irrPct = isFinite(irr) ? irr * 100 : null;

  return {
    price, down, loan, emi, annualMort,
    grossRent, vacancyLoss, effectiveRent,
    expPtax, ins, expMaint, expMgmt, expHoa, totalExp,
    noi, cf, capRate, coc,
    interestYear1, depreciation, taxBenefit,
    adjCf, taxCoc, apprValue, totalReturn,
    taxrate, dscr, beo, grm, irrPct
  };
}

// ─── UPDATE UI ───────────────────────────────────────────────
function recalc() {
  const r = calc();

  // EMI Confirmation Box
  const emiDisp = document.getElementById('emi-display');
  const emiBreak = document.getElementById('emi-breakdown');
  const emiPill = document.getElementById('emi-status-pill');
  const emiBar  = document.getElementById('emi-bar');
  const emiAnn  = document.getElementById('emi-annual-label');
  const emiLtv  = document.getElementById('emi-ltv-label');
  const emiDsr  = document.getElementById('emi-dsr-label');

  emiDisp.textContent = fmt(r.emi);
  const loanK = r.loan >= 1000 ? (r.loan/1000).toFixed(0)+'k' : fmt(r.loan);
  emiBreak.textContent = `${loanK} loan · ${v('rate')}% · ${v('term')} yr`;
  emiAnn.textContent = 'Annual: ' + fmt(r.annualMort);
  const ltv = r.price > 0 ? ((r.loan / r.price) * 100).toFixed(0) : 0;
  emiLtv.textContent = 'LTV: ' + ltv + '%';
  const dsr = v('rent') > 0 ? ((r.emi / v('rent')) * 100).toFixed(0) : 0;
  emiDsr.textContent = 'Debt-to-Rent: ' + dsr + '%';

  const barPct = Math.min(100, (r.emi / Math.max(1, v('rent'))) * 100 * (100/150));
  emiBar.style.width = barPct + '%';

  const dsrNum = r.emi / Math.max(1, v('rent'));
  emiPill.className = 'emi-confirm-pill';
  if (dsrNum < 0.7) {
    emiPill.classList.add('low');
    emiPill.textContent = '✓ Rent covers mortgage';
  } else if (dsrNum < 1.0) {
    emiPill.classList.add('mid');
    emiPill.textContent = '⚠ Tight coverage';
  } else {
    emiPill.classList.add('high');
    emiPill.textContent = '✗ Rent doesn\'t cover EMI';
  }

  // Hero stats
  document.getElementById('stat-coc').textContent  = fmtPct(r.taxCoc);
  document.getElementById('stat-cap').textContent  = fmtPct(r.capRate);

  const annualInterestH = r.loan * (v('rate') / 100);
  const principalH      = Math.max(0, r.annualMort - annualInterestH);
  const totalReturnH    = r.adjCf + r.apprValue + principalH;
  const roiH            = r.down > 0 ? (totalReturnH / r.down) * 100 : 0;
  document.getElementById('stat-roi').textContent   = fmtPct(roiH);
  document.getElementById('stat-total').textContent = fmt(totalReturnH);

  // Metrics
  document.getElementById('m-emi').textContent = fmt(r.emi);
  document.getElementById('m-noi').textContent = fmt(r.noi);

  const cfEl = document.getElementById('m-cf');
  cfEl.textContent = fmt(r.cf);
  cfEl.className = 'metric-value ' + colorClass(r.cf);

  const capEl = document.getElementById('m-cap');
  capEl.textContent = fmtPct(r.capRate);
  capEl.className = 'metric-value ' + (r.capRate >= 7 ? 'green' : r.capRate >= 5 ? 'amber' : 'red');

  const cocEl = document.getElementById('m-coc');
  cocEl.textContent = fmtPct(r.coc);
  cocEl.className = 'metric-value ' + colorClass(r.coc);

  document.getElementById('m-taxsav').textContent = taxOn ? fmt(r.taxBenefit) : '$0';
  document.getElementById('m-taxsav').className = 'metric-value ' + (taxOn ? 'green' : '');

  const acfEl = document.getElementById('m-acf');
  acfEl.textContent = fmt(r.adjCf);
  acfEl.className = 'metric-value ' + colorClass(r.adjCf);

  document.getElementById('m-tcoc').textContent = fmtPct(r.taxCoc);

  // Breakdown tables
  document.getElementById('t-gross').textContent = fmt(r.grossRent);
  document.getElementById('t-vac').textContent = '-' + fmt(r.vacancyLoss);
  document.getElementById('t-eff').textContent = fmt(r.effectiveRent);
  document.getElementById('t-ptax').textContent = '-' + fmt(r.expPtax);
  document.getElementById('t-ins').textContent = '-' + fmt(r.ins);
  document.getElementById('t-maint').textContent = '-' + fmt(r.expMaint);
  document.getElementById('t-mgmt').textContent = '-' + fmt(r.expMgmt);
  document.getElementById('t-hoa').textContent = r.expHoa > 0 ? '-' + fmt(r.expHoa) : '$0';
  const noiEl = document.getElementById('t-noi');
  noiEl.textContent = fmt(r.noi);
  noiEl.style.color = r.noi > 0 ? 'var(--green)' : 'var(--red)';

  document.getElementById('t2-noi').textContent = fmt(r.noi);
  document.getElementById('t2-mort').textContent = '-' + fmt(r.annualMort);
  const cf2El = document.getElementById('t2-cf');
  cf2El.textContent = fmt(r.cf);
  cf2El.style.color = r.cf > 0 ? 'var(--green)' : 'var(--red)';
  document.getElementById('t2-int').textContent = taxOn ? fmt(r.interestYear1) : '—';
  document.getElementById('t2-dep').textContent = taxOn ? fmt(r.depreciation) : '—';
  document.getElementById('t2-taxsav').textContent = taxOn ? fmt(r.taxBenefit) : '$0';
  const acf2El = document.getElementById('t2-acf');
  acf2El.textContent = fmt(r.adjCf);
  acf2El.style.color = r.adjCf > 0 ? 'var(--green)' : 'var(--red)';
  document.getElementById('t2-invested').textContent = fmt(r.down);
  document.getElementById('t2-coc').textContent = fmtPct(r.coc);
  document.getElementById('t2-tcoc').textContent = fmtPct(r.taxCoc);

  // Advanced metrics
  const irrEl = document.getElementById('m-irr');
  if (r.irrPct !== null && isFinite(r.irrPct) && r.irrPct > -100) {
    irrEl.textContent = r.irrPct.toFixed(1) + '%';
    irrEl.className = 'metric-value gradient-text';
  } else {
    irrEl.textContent = '—';
    irrEl.className = 'metric-value';
  }

  const dscrEl = document.getElementById('m-dscr');
  dscrEl.textContent = r.dscr.toFixed(2) + 'x';
  dscrEl.className = 'metric-value ' + (r.dscr >= 1.25 ? 'green' : r.dscr >= 1.0 ? 'amber' : 'red');
  document.getElementById('m-dscr-sub').textContent =
    r.dscr >= 1.25 ? 'Lender-approved ✓' : r.dscr >= 1.0 ? 'Borderline' : 'Below lender min';

  const beoEl = document.getElementById('m-beo');
  beoEl.textContent = r.beo.toFixed(1) + '%';
  beoEl.className = 'metric-value ' + (r.beo <= 80 ? 'green' : r.beo <= 92 ? 'amber' : 'red');
  document.getElementById('m-beo-sub').textContent =
    r.beo <= 80 ? 'Comfortable buffer' : r.beo <= 92 ? 'Moderate risk' : 'High risk';

  const grmEl = document.getElementById('m-grm');
  grmEl.textContent = r.grm.toFixed(1) + 'x';
  grmEl.className = 'metric-value ' + (r.grm <= 10 ? 'green' : r.grm <= 15 ? 'amber' : 'red');
  document.getElementById('m-grm-sub').textContent =
    r.grm <= 10 ? 'Strong value' : r.grm <= 15 ? 'Average value' : 'Expensive';

  // Decision engine
  updateDecision(r);

  // New panels
  updateInsights(r);
  updateRoiWaterfall(r);
  updateCfFlip(r);

  // Chart
  updateChart(r);

  // Save state
  rentalSaveState();
}

// ─── DECISION ENGINE ─────────────────────────────────────────
function updateDecision(r) {
  const container = document.getElementById('decision-container');
  const decisions = [];
  const suggestions = [];

  if (r.capRate < 5) {
    decisions.push({ type: 'bad', title: 'Overpriced Deal ❌', sub: `Cap Rate of ${fmtPct(r.capRate)} is below the 5% threshold. Market value may be too high relative to income.` });
    suggestions.push('Negotiate the purchase price down by 10–15%');
    suggestions.push('Target higher-rent properties in the same area');
  } else if (r.capRate < 7) {
    decisions.push({ type: 'warn', title: 'Average Deal ⚠️', sub: `Cap Rate of ${fmtPct(r.capRate)} is acceptable but not exceptional. Acceptable for low-risk markets.` });
    suggestions.push('Look for ways to increase NOI through rent optimization');
  } else {
    decisions.push({ type: 'good', title: 'Strong Cap Rate 👍', sub: `Cap Rate of ${fmtPct(r.capRate)} exceeds 7% — this is a well-priced deal relative to income.` });
  }

  const usedCoc = r.taxCoc;
  if (usedCoc < 5) {
    decisions.push({ type: 'bad', title: `Worse than a Savings Account`, sub: `Tax-adjusted CoC of ${fmtPct(usedCoc)} is below the 4.5% you'd earn risk-free in a high-yield savings account.` });
    suggestions.push('Increase monthly rent by $200–$300 if market allows');
    suggestions.push('Increase down payment to reduce mortgage burden');
    suggestions.push('Reduce management expenses or self-manage');
  } else if (usedCoc < 12) {
    decisions.push({ type: 'warn', title: 'Solid Investment 📊', sub: `Tax-adjusted CoC of ${fmtPct(usedCoc)} beats bonds and savings. Comparable to REIT returns.` });
  } else {
    decisions.push({ type: 'good', title: 'Excellent Investment 🔥', sub: `Tax-adjusted CoC of ${fmtPct(usedCoc)} is exceptional — well above average market returns.` });
  }

  if (r.cf < 0 && r.adjCf > 0) {
    decisions.push({ type: 'warn', title: 'Tax-Efficient Strategy 🧮', sub: `Cash flow is negative before taxes, but tax benefits flip it positive. This is a valid depreciation-driven strategy common in high-cost markets.` });
  }

  container.innerHTML = decisions.map(d => `
    <div class="decision-block ${d.type}" style="margin-bottom:12px">
      <div class="decision-title">${d.title}</div>
      <div class="decision-sub">${d.sub}</div>
    </div>
  `).join('');

  const suggWrap = document.getElementById('suggestions-wrap');
  const suggList = document.getElementById('suggestions-list');
  if (suggestions.length > 0) {
    suggWrap.style.display = 'block';
    suggList.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
  } else {
    suggWrap.style.display = 'none';
  }
}

// ─── KEY INSIGHTS ────────────────────────────────────────────
function updateInsights(r) {
  const panel = document.getElementById('insights-panel');
  const insights = [];

  const rentRatio = r.price > 0 ? (v('rent') / r.price) * 100 : 0;
  if (rentRatio >= 1) {
    insights.push({ type: 'good', icon: '✅', text: `<strong>1% rule satisfied.</strong> Monthly rent is ${fmtPct(rentRatio, 2)} of purchase price — strong income-to-price ratio.` });
  } else if (rentRatio >= 0.7) {
    insights.push({ type: 'warn', icon: '⚠️', text: `<strong>Below 1% rule (${fmtPct(rentRatio, 2)}).</strong> Rent-to-price ratio is thin. Acceptable in appreciation-driven markets; tight in cash-flow markets.` });
  } else {
    insights.push({ type: 'bad', icon: '🔴', text: `<strong>Well below 1% rule (${fmtPct(rentRatio, 2)}).</strong> Rent is low relative to price. This deal relies heavily on appreciation to generate returns.` });
  }

  const ltv = r.price > 0 ? (r.loan / r.price) * 100 : 0;
  if (ltv <= 70) {
    insights.push({ type: 'good', icon: '🏦', text: `<strong>Strong equity position.</strong> LTV of ${fmtPct(ltv, 0)} means you own ${fmtPct(100 - ltv, 0)} of the property from day one — lower lender risk.` });
  } else if (ltv <= 80) {
    insights.push({ type: 'info', icon: '🏦', text: `<strong>Standard LTV at ${fmtPct(ltv, 0)}.</strong> You're putting down ${fmtPct(100 - ltv, 0)}. This is typical for investment properties and keeps your PMI risk low.` });
  } else {
    insights.push({ type: 'warn', icon: '⚠️', text: `<strong>High leverage (LTV ${fmtPct(ltv, 0)}).</strong> A smaller down payment increases cash flow strain. Consider whether the extra leverage is worth the increased mortgage cost.` });
  }

  const expRatio = r.grossRent > 0 ? (r.totalExp / r.grossRent) * 100 : 0;
  if (expRatio < 35) {
    insights.push({ type: 'good', icon: '💸', text: `<strong>Low expense ratio (${fmtPct(expRatio, 0)} of gross rent).</strong> Operating costs are well-controlled — strong NOI margin.` });
  } else if (expRatio < 50) {
    insights.push({ type: 'info', icon: '💸', text: `<strong>Moderate expense ratio (${fmtPct(expRatio, 0)} of gross rent).</strong> Within normal range. The 50% rule of thumb suggests expenses ≈ half of rent — you're under that.` });
  } else {
    insights.push({ type: 'warn', icon: '💸', text: `<strong>High expense ratio (${fmtPct(expRatio, 0)} of gross rent).</strong> Expenses are consuming over half your gross rent. Explore self-management or lower-tax alternatives.` });
  }

  if (taxOn && r.taxBenefit > 0) {
    const boostPct = r.cf < 0 && r.adjCf > 0
      ? 'flips negative to positive'
      : `adds ${fmt(r.taxBenefit)}/yr`;
    insights.push({ type: 'info', icon: '🧾', text: `<strong>Tax benefits ${boostPct}.</strong> Depreciation (${fmt(r.depreciation)}) + interest deduction (${fmt(r.interestYear1)}) save you ${fmt(r.taxBenefit)} annually at a ${v('taxrate')}% rate.` });
  } else if (!taxOn) {
    insights.push({ type: 'info', icon: '🧾', text: `<strong>Tax benefits are off.</strong> Enable the tax toggle to see how depreciation and interest deductions could improve your after-tax returns.` });
  }

  const dscr = r.annualMort > 0 ? r.noi / r.annualMort : 0;
  if (dscr >= 1.25) {
    insights.push({ type: 'good', icon: '📊', text: `<strong>Healthy DSCR of ${dscr.toFixed(2)}.</strong> NOI covers your mortgage ${dscr.toFixed(2)}x — lenders typically require 1.20–1.25x minimum. This deal would likely qualify easily.` });
  } else if (dscr >= 1.0) {
    insights.push({ type: 'warn', icon: '📊', text: `<strong>Tight DSCR of ${dscr.toFixed(2)}.</strong> NOI barely covers the mortgage. Lenders may require reserves or a larger down payment to approve this loan.` });
  } else {
    insights.push({ type: 'bad', icon: '📊', text: `<strong>DSCR below 1.0 (${dscr.toFixed(2)}).</strong> NOI does not cover the mortgage payment — some lenders will flag this. Consider increasing rent or down payment.` });
  }

  panel.innerHTML = insights.map(i => `
    <div class="insight-row ${i.type}">
      <div class="insight-icon-wrap" style="background:${i.type==='good'?'var(--green-bg)':i.type==='bad'?'var(--red-bg)':i.type==='warn'?'var(--amber-bg)':'var(--blue-tint)'}">
        ${i.icon}
      </div>
      <div class="insight-text">${i.text}</div>
    </div>
  `).join('');
}

// ─── ROI WATERFALL ────────────────────────────────────────────
function updateRoiWaterfall(r) {
  const annualInterest = r.loan * (v('rate') / 100);
  const principalPaydown = Math.max(0, r.annualMort - annualInterest);

  const totalReturn = r.adjCf + r.apprValue + principalPaydown;
  const roi = r.down > 0 ? (totalReturn / r.down) * 100 : 0;

  const cfColor  = r.adjCf >= 0 ? 'var(--green)' : 'var(--red)';
  document.getElementById('roi-cf-val').textContent    = fmt(r.adjCf);
  document.getElementById('roi-cf-val').style.color    = cfColor;
  document.getElementById('roi-cf-sub').textContent    = `Pre-tax ${fmt(r.cf)} + tax savings ${fmt(r.taxBenefit)}`;

  document.getElementById('roi-appr-val').textContent  = fmt(r.apprValue);
  document.getElementById('roi-appr-val').style.color  = 'var(--blue)';
  document.getElementById('roi-appr-sub').textContent  = `${fmtPct(v('appr'))} on ${fmt(r.price)} full value`;

  document.getElementById('roi-paydown-val').textContent = fmt(principalPaydown);
  document.getElementById('roi-paydown-val').style.color  = '#7C3AED';
  document.getElementById('roi-paydown-sub').textContent  = `Year 1 principal reduction`;

  document.getElementById('roi-total-val').textContent  = fmt(totalReturn);
  document.getElementById('roi-pct-val').textContent     = fmtPct(roi);
  document.getElementById('roi-down-val').textContent    = fmt(r.down);

  if (totalReturn > 0) {
    const cfShare     = Math.max(0, r.adjCf)    / totalReturn * 100;
    const apprShare   = r.apprValue              / totalReturn * 100;
    const paydownShare= principalPaydown          / totalReturn * 100;
    document.getElementById('bar-cf').style.width       = cfShare + '%';
    document.getElementById('bar-appr').style.width     = apprShare + '%';
    document.getElementById('bar-paydown').style.width  = paydownShare + '%';
    document.getElementById('bar-cf-pct').textContent      = fmtPct(cfShare, 0);
    document.getElementById('bar-appr-pct').textContent    = fmtPct(apprShare, 0);
    document.getElementById('bar-paydown-pct').textContent = fmtPct(paydownShare, 0);
  }
}

// ─── CF FLIP PANEL ────────────────────────────────────────────
function updateCfFlip(r) {
  const intBenefit = taxOn ? r.interestYear1 * (v('taxrate') / 100) : 0;
  const depBenefit = taxOn ? r.depreciation  * (v('taxrate') / 100) : 0;

  const maxVal = Math.max(Math.abs(r.cf), intBenefit, depBenefit, Math.abs(r.adjCf), 1);
  const pct = n => Math.min(100, (Math.abs(n) / maxVal) * 100);

  document.getElementById('cfv-pretax').textContent = fmt(r.cf);
  document.getElementById('cfv-pretax').style.color = r.cf >= 0 ? 'var(--green)' : 'var(--red)';
  document.getElementById('cfb-pretax').style.width = pct(r.cf) + '%';
  document.getElementById('cfb-pretax').style.background = r.cf >= 0 ? 'var(--green)' : 'var(--red)';

  document.getElementById('cfv-int').textContent = taxOn ? '+' + fmt(intBenefit) : 'Tax off';
  document.getElementById('cfb-int').style.width = taxOn ? pct(intBenefit) + '%' : '0%';

  document.getElementById('cfv-dep').textContent = taxOn ? '+' + fmt(depBenefit) : 'Tax off';
  document.getElementById('cfb-dep').style.width = taxOn ? pct(depBenefit) + '%' : '0%';

  document.getElementById('cfv-aftertax').textContent = fmt(r.adjCf);
  document.getElementById('cfv-aftertax').style.color = r.adjCf >= 0 ? 'var(--green)' : 'var(--red)';
  document.getElementById('cfb-aftertax').style.width = pct(r.adjCf) + '%';
  document.getElementById('cfb-aftertax').style.background = r.adjCf >= 0
    ? 'linear-gradient(90deg, #b84dc6, #479ef5)'
    : 'var(--red)';

  const verdictEl = document.getElementById('cf-verdict');
  if (!taxOn) {
    verdictEl.innerHTML = `<div class="insight-row info"><div class="insight-icon-wrap" style="background:var(--blue-tint)">💡</div><div class="insight-text">Enable <strong>Tax Benefits</strong> using the toggle in the inputs panel to see how deductions shift this chart.</div></div>`;
  } else if (r.cf < 0 && r.adjCf > 0) {
    verdictEl.innerHTML = `<div class="insight-row good"><div class="insight-icon-wrap" style="background:var(--green-bg)">✅</div><div class="insight-text"><strong>Tax benefits flip this deal.</strong> A ${fmt(Math.abs(r.cf))} pre-tax loss becomes a <span style="color:var(--green);font-weight:600">${fmt(r.adjCf)} after-tax gain</span>. Tax deductions add ${fmt(r.taxBenefit)} — turning a losing cash flow into a winning one.</div></div>`;
  } else if (r.cf >= 0 && r.adjCf > r.cf) {
    verdictEl.innerHTML = `<div class="insight-row good"><div class="insight-icon-wrap" style="background:var(--green-bg)">🚀</div><div class="insight-text"><strong>Tax benefits amplify a positive deal.</strong> Already positive at ${fmt(r.cf)}, tax savings push it to <span style="color:var(--green);font-weight:600">${fmt(r.adjCf)}</span> — a ${fmtPct(((r.adjCf - r.cf) / Math.abs(r.cf)) * 100, 0)} boost.</div></div>`;
  } else if (r.adjCf <= 0) {
    verdictEl.innerHTML = `<div class="insight-row bad"><div class="insight-icon-wrap" style="background:var(--red-bg)">⚠️</div><div class="insight-text"><strong>Still negative after tax.</strong> Tax benefits add ${fmt(r.taxBenefit)} but the deal remains at ${fmt(r.adjCf)}. Appreciation and loan paydown must carry the full return.</div></div>`;
  } else {
    verdictEl.innerHTML = '';
  }
}

// ─── CHART ───────────────────────────────────────────────────
function updateChart(r) {
  const apprOnCapital   = r.down > 0 ? (r.apprValue / r.down) * 100 : 0;
  const totalPropReturn = r.taxCoc + apprOnCapital;

  const allLabels = ['This Property', ...BENCHMARKS.map(b => b.name)];
  const cocData   = [r.taxCoc,      ...BENCHMARKS.map(b => b.return)];
  const apprData  = [apprOnCapital, ...BENCHMARKS.map(() => 0)];

  const COLOURS = [
    null,
    '#34A853',
    '#1A73E8',
    '#F9AB00',
    '#EA4335',
    '#7C3AED',
    '#0D9488',
    '#F97316',
  ];

  const baseBg     = allLabels.map((_, i) => i === 0 ? 'rgba(184,77,198,0.82)' : COLOURS[i]);
  const baseBorder = allLabels.map((_, i) => i === 0 ? '#b84dc6' : COLOURS[i]);
  const apprBg     = allLabels.map((_, i) => i === 0 ? 'rgba(71,158,245,0.35)' : 'transparent');
  const apprBorder = allLabels.map((_, i) => i === 0 ? '#479ef5' : 'transparent');

  const labelPlugin = {
    id: 'barLabels',
    afterDatasetsDraw(ch) {
      const ctx = ch.ctx;
      const meta0 = ch.getDatasetMeta(0);
      const meta1 = ch.getDatasetMeta(1);
      meta0.data.forEach((bar, i) => {
        const total  = i === 0 ? totalPropReturn : cocData[i];
        const topY   = (apprData[i] > 0 && meta1.data[i]) ? meta1.data[i].y : bar.y;
        const label  = total.toFixed(1) + '%';
        ctx.save();
        ctx.font         = '600 11px "DM Sans", sans-serif';
        ctx.fillStyle    = '#202124';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(label, bar.x, topY - 5);
        ctx.restore();
      });
    }
  };

  if (chart) chart.destroy();
  const ctx = document.getElementById('compare-chart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    plugins: [labelPlugin],
    data: {
      labels: allLabels,
      datasets: [
        {
          label: 'Cash Yield / Asset Return',
          data: cocData,
          backgroundColor: baseBg,
          borderColor: baseBorder,
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: false,
          stack: 'total',
        },
        {
          label: 'Appreciation on Capital',
          data: apprData,
          backgroundColor: apprBg,
          borderColor: apprBorder,
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: 'bottom',
          stack: 'total',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      layout: { padding: { top: 28 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#202124',
          titleFont: { family: 'DM Sans', size: 13, weight: '600' },
          bodyFont:  { family: 'DM Sans', size: 12 },
          padding: 12,
          callbacks: {
            title: items => items[0].label,
            label: item => {
              if (item.datasetIndex === 1 && item.raw === 0) return null;
              if (item.datasetIndex === 0) {
                const lbl = item.dataIndex === 0 ? 'Cash Yield (Tax-Adj. CoC)' : 'Annual Return';
                return '  ' + lbl + ': ' + item.raw.toFixed(1) + '%';
              }
              return '  Appreciation on Capital: +' + item.raw.toFixed(1) + '%';
            },
            afterBody: items => {
              if (items[0].dataIndex === 0) {
                return ['  ─────────────────────', '  Total Return: ' + totalPropReturn.toFixed(1) + '%'];
              }
              return [];
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { font: { family: 'DM Sans', size: 11 }, color: '#5F6368', maxRotation: 30 }
        },
        y: {
          stacked: true,
          grid: { color: '#F1F3F4' },
          ticks: {
            font: { family: 'DM Sans', size: 12 }, color: '#5F6368',
            callback: val => val + '%'
          },
          beginAtZero: true
        }
      }
    }
  });

  // Summary row
  document.getElementById('cs-total').textContent = fmtPct(totalPropReturn);
  const spDiff = totalPropReturn - 10;
  const vspEl  = document.getElementById('cs-vsp');
  vspEl.textContent = (spDiff >= 0 ? '+' : '') + fmtPct(spDiff);
  vspEl.className   = 'metric-value ' + (spDiff >= 0 ? 'green' : 'red');
  document.getElementById('cs-vsp-sub').textContent = spDiff >= 0 ? 'above S&P 500' : 'below S&P 500';
  const levEl  = document.getElementById('cs-lev');
  levEl.textContent = fmtPct(apprOnCapital);
  levEl.className   = 'metric-value ' + (apprOnCapital > 0 ? 'green' : '');
  const downPct = r.price > 0 ? ((r.down / r.price) * 100).toFixed(0) : 0;
  document.getElementById('cs-lev-sub').innerHTML =
    `appreciation on full asset, paid by <strong>${downPct}%</strong> down`;
}


// ─── SHARE / COPY ────────────────────────────────────────────
function copyLink(btn) {
  const url = buildShareUrl();
  navigator.clipboard.writeText(url).then(() => {
    btn.textContent = '✓';
    setTimeout(() => { btn.textContent = '🔗'; }, 2000);
  });
}

function shareLinkedIn() {
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(location.href)}`, '_blank');
}
function shareTwitter() {
  const r = calc();
  const text = `Just analyzed a rental property: ${fmtPct(r.taxCoc)} tax-adjusted CoC, ${fmtPct(r.capRate)} cap rate. Try the US Rental Property Investment Analyzer:`;
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(location.href)}`, '_blank');
}

function buildShareUrl() {
  const params = new URLSearchParams({
    price: v('price'), down: v('down'), rate: v('rate'), term: v('term'),
    rent: v('rent'), vac: v('vac'), ptax: v('ptax'), ins: v('ins'),
    maint: v('maint'), mgmt: v('mgmt'), hoa: v('hoa'),
    appr: v('appr'), taxrate: v('taxrate'), taxon: taxOn ? 1 : 0
  });
  return location.origin + location.pathname + '?' + params.toString();
}

// ─── LOCAL STORAGE ───────────────────────────────────────────
function rentalSaveState() {
  try {
    const state = {
      price: v('price'), down: v('down'), rate: v('rate'), term: v('term'),
      rent: v('rent'), vac: v('vac'), ptax: v('ptax'), ins: v('ins'),
      maint: v('maint'), mgmt: v('mgmt'), hoa: v('hoa'),
      appr: v('appr'), rentgrowth: v('rentgrowth'),
      income: v('income'), taxrate: v('taxrate'), taxon: taxOn
    };
    localStorage.setItem('pra_state', JSON.stringify(state));
  } catch(e) {}
}

function rentalLoadState() {
  try {
    const params = new URLSearchParams(location.search);
    if (params.has('price')) {
      ['price','down','rate','term','rent','vac','ptax','ins','maint','mgmt','hoa','appr','taxrate'].forEach(k => {
        const el = document.getElementById(k);
        if (el && params.has(k)) el.value = params.get(k);
      });
      taxOn = params.get('taxon') !== '0';
      const tog = document.getElementById('tax-toggle');
      if (tog) tog.classList.toggle('on', taxOn);
      return;
    }

    const raw = localStorage.getItem('pra_state');
    if (!raw) return;
    const state = JSON.parse(raw);
    Object.keys(state).forEach(k => {
      if (k === 'taxon') { taxOn = !!state[k]; const tog = document.getElementById('tax-toggle'); if (tog) tog.classList.toggle('on', taxOn); return; }
      const el = document.getElementById(k);
      if (el) el.value = state[k];
    });
    ['rate','rent','vac'].forEach(k => {
      const slider = document.getElementById(k + '-slider');
      const inp = document.getElementById(k);
      if (slider && inp) slider.value = inp.value;
    });
  } catch(e) {}
}

// ─── DOWNLOAD REPORT ─────────────────────────────────────────
function downloadReport() {
  const r    = calc();
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const annualInterest  = r.loan * (v('rate') / 100);
  const principalPaydown = Math.max(0, r.annualMort - annualInterest);
  const totalReturn     = r.adjCf + r.apprValue + principalPaydown;
  const roi             = r.down > 0 ? (totalReturn / r.down) * 100 : 0;
  const ltv             = r.price > 0 ? (r.loan / r.price) * 100 : 0;
  const rentRatio       = r.price > 0 ? (v('rent') / r.price) * 100 : 0;
  const dscr            = r.annualMort > 0 ? r.noi / r.annualMort : 0;
  const expRatio        = r.grossRent > 0 ? (r.totalExp / r.grossRent) * 100 : 0;

  const conclusions = [];

  if (roi >= 20 && r.capRate >= 7) {
    conclusions.push('OVERALL VERDICT: STRONG BUY ✅');
    conclusions.push('This property demonstrates strong fundamentals across all key metrics. The combination of solid cap rate, healthy cash-on-cash return, and total ROI exceeding 20% makes this an attractive investment opportunity. Proceed with due diligence on the property condition and local market comparables.');
  } else if (roi >= 12 && r.capRate >= 5) {
    conclusions.push('OVERALL VERDICT: VIABLE INVESTMENT ✅');
    conclusions.push('This property shows acceptable returns with room for improvement. The deal is viable, particularly if you plan to hold long-term and benefit from appreciation. Consider negotiating the purchase price or increasing rent to strengthen pre-tax cash flow.');
  } else if (roi >= 0) {
    conclusions.push('OVERALL VERDICT: MARGINAL — PROCEED WITH CAUTION ⚠️');
    conclusions.push('This deal generates a modest positive total return, but the margin of safety is thin. Any unexpected vacancy, maintenance cost, or interest rate increase could push it negative. This may work as a long-term appreciation play in a high-growth market, but cash flow discipline is critical.');
  } else {
    conclusions.push('OVERALL VERDICT: NOT RECOMMENDED IN CURRENT FORM ❌');
    conclusions.push('At current inputs, this property generates a negative total return. The deal would need material improvements — lower purchase price, higher rent, or significantly better tax position — to become viable. Do not proceed without renegotiating terms.');
  }
  conclusions.push('');

  if (r.cf < 0 && r.adjCf > 0) {
    conclusions.push('CASH FLOW NOTE: This is a tax-benefit-dependent deal. Pre-tax cash flow is negative (' + fmt(r.cf) + '/yr) but tax deductions generate ' + fmt(r.taxBenefit) + ' in annual savings, flipping the after-tax position to ' + fmt(r.adjCf) + '/yr. This strategy works best for investors in the ' + v('taxrate') + '%+ tax bracket who can reliably claim these deductions.');
  } else if (r.cf >= 0) {
    conclusions.push('CASH FLOW NOTE: This property generates positive pre-tax cash flow of ' + fmt(r.cf) + '/yr (' + fmt(r.cf / 12) + '/month). Tax benefits add a further ' + fmt(r.taxBenefit) + '/yr, improving the after-tax position to ' + fmt(r.adjCf) + '/yr. This is a healthy cash-flowing asset.');
  } else {
    conclusions.push('CASH FLOW NOTE: Both pre-tax (' + fmt(r.cf) + '/yr) and after-tax (' + fmt(r.adjCf) + '/yr) cash flows are negative. The total return relies entirely on appreciation and loan paydown. This is a speculative position and should only be considered in demonstrably high-growth markets.');
  }
  conclusions.push('');

  conclusions.push('RECOMMENDED NEXT STEPS:');
  if (r.capRate < 5)   conclusions.push('  → Negotiate purchase price to at least ' + fmt(r.noi / 0.05) + ' to achieve 5% cap rate');
  if (rentRatio < 0.7) conclusions.push('  → Verify rent potential — current ratio (' + fmtPct(rentRatio, 2) + ') is well below the 1% rule');
  if (dscr < 1.2)      conclusions.push('  → DSCR of ' + dscr.toFixed(2) + ' may challenge lender approval — consider a larger down payment');
  if (expRatio > 45)   conclusions.push('  → Expense ratio (' + fmtPct(expRatio, 0) + ') is high — explore self-management or lower-tax jurisdictions');
  conclusions.push('  → Conduct physical inspection and verify all expense estimates with local contractors');
  conclusions.push('  → Pull rent comps from Zillow/Rentometer to confirm rent assumption of ' + fmt(v('rent')) + '/month');
  conclusions.push('  → Consult a CPA to confirm tax benefit eligibility based on your income and filing status');

  const W = 56;
  const hr  = '─'.repeat(W);
  const dhr = '═'.repeat(W);

  const lines = [
    dhr,
    '  US RENTAL PROPERTY INVESTMENT REPORT',
    `  Generated: ${date}`,
    dhr,
    '',
    '  SECTION 1 — PROPERTY & LOAN INPUTS',
    hr,
    `  Purchase Price          ${fmt(r.price).padStart(20)}`,
    `  Down Payment            ${fmt(r.down).padStart(20)}   (${fmtPct((r.down/r.price)*100, 0)})`,
    `  Loan Amount             ${fmt(r.loan).padStart(20)}`,
    `  Loan-to-Value (LTV)     ${fmtPct(ltv, 1).padStart(20)}`,
    `  Interest Rate           ${fmtPct(v('rate')).padStart(20)}`,
    `  Loan Term               ${ (v('term') + ' years').padStart(20)}`,
    `  Monthly Mortgage (EMI)  ${fmt(r.emi).padStart(20)}`,
    `  Annual Mortgage Cost    ${fmt(r.annualMort).padStart(20)}`,
    '',
    '  SECTION 2 — RENTAL INCOME',
    hr,
    `  Monthly Rent            ${fmt(v('rent')).padStart(20)}`,
    `  Vacancy Rate            ${fmtPct(v('vac')).padStart(20)}`,
    `  Gross Annual Rent       ${fmt(r.grossRent).padStart(20)}`,
    `  Vacancy Loss            ${fmt(r.vacancyLoss).padStart(20)}`,
    `  Effective Annual Income ${fmt(r.effectiveRent).padStart(20)}`,
    `  Rent-to-Price Ratio     ${fmtPct(rentRatio, 2).padStart(20)}   (1% rule: ${rentRatio >= 1 ? '✓ MET' : '✗ NOT MET'})`,
    '',
    '  SECTION 3 — ANNUAL EXPENSES',
    hr,
    `  Property Tax            ${fmt(r.expPtax).padStart(20)}   (${fmtPct(v('ptax'))} of price)`,
    `  Insurance               ${fmt(r.ins).padStart(20)}`,
    `  Maintenance             ${fmt(r.expMaint).padStart(20)}   (${fmtPct(v('maint'))} of rent)`,
    `  Property Management     ${fmt(r.expMgmt).padStart(20)}   (${fmtPct(v('mgmt'))} of rent)`,
    `  HOA                     ${fmt(r.expHoa).padStart(20)}`,
    `  Total Expenses          ${fmt(r.totalExp).padStart(20)}`,
    `  Expense Ratio           ${fmtPct(expRatio, 0).padStart(20)}   (of gross rent)`,
    '',
    '  SECTION 4 — NET OPERATING INCOME',
    hr,
    `  Effective Income        ${fmt(r.effectiveRent).padStart(20)}`,
    `  Less: Total Expenses    ${('−' + fmt(r.totalExp).replace('$','')).padStart(20)}`,
    `  Net Operating Income    ${fmt(r.noi).padStart(20)}`,
    `  Cap Rate                ${fmtPct(r.capRate).padStart(20)}   ${r.capRate >= 7 ? '✓ STRONG (≥7%)' : r.capRate >= 5 ? '~ AVERAGE (5–7%)' : '✗ WEAK (<5%)'}`,
    `  Debt Svc Coverage (DSCR)${dscr.toFixed(2).padStart(20)}   ${dscr >= 1.25 ? '✓ HEALTHY' : dscr >= 1.0 ? '~ BORDERLINE' : '✗ BELOW 1.0'}`,
    '',
    '  SECTION 5 — CASH FLOW ANALYSIS',
    hr,
    `  Net Operating Income    ${fmt(r.noi).padStart(20)}`,
    `  Less: Annual Mortgage   ${('−' + fmt(r.annualMort).replace('$','')).padStart(20)}`,
    `  Pre-Tax Cash Flow       ${fmt(r.cf).padStart(20)}   (${fmt(r.cf/12)}/month)`,
    '',
    taxOn ? `  Mortgage Interest Ded.  ${fmt(r.interestYear1).padStart(20)}` : '',
    taxOn ? `  Depreciation Deduction  ${fmt(r.depreciation).padStart(20)}   (${fmt(r.price * 0.8)}/27.5 yrs)` : '',
    taxOn ? `  Tax Rate Applied        ${fmtPct(v('taxrate')).padStart(20)}` : '',
    taxOn ? `  Annual Tax Savings      ${fmt(r.taxBenefit).padStart(20)}` : '  Tax Benefits: OFF',
    taxOn ? `  After-Tax Cash Flow     ${fmt(r.adjCf).padStart(20)}   (${fmt(r.adjCf/12)}/month)` : '',
    `  Pre-Tax CoC Return      ${fmtPct(r.coc).padStart(20)}`,
    `  Tax-Adjusted CoC        ${fmtPct(r.taxCoc).padStart(20)}`,
    '',
    '  SECTION 6 — TOTAL RETURN (YEAR 1)',
    hr,
    `  After-Tax Cash Flow     ${fmt(r.adjCf).padStart(20)}`,
    `  Appreciation (${fmtPct(v('appr'))})    ${fmt(r.apprValue).padStart(20)}   (on full ${fmt(r.price)} value)`,
    `  Loan Paydown (est.)     ${fmt(principalPaydown).padStart(20)}`,
    `  ${'─'.repeat(38)}`,
    `  Total Year 1 Return     ${fmt(totalReturn).padStart(20)}`,
    `  Capital Invested        ${fmt(r.down).padStart(20)}`,
    `  TOTAL ROI               ${fmtPct(roi).padStart(20)}   ← KEY METRIC`,
    '',
    '  SECTION 7 — BENCHMARK COMPARISON',
    hr,
    ...BENCHMARKS.map(b => `  ${b.name.padEnd(26)} ${b.return.toFixed(1).padStart(6)}%`),
    `  ${'This Property (Total ROI)'.padEnd(26)} ${roi.toFixed(1).padStart(6)}%   ← YOUR DEAL`,
    '',
    '  SECTION 8 — INVESTMENT ANALYSIS & CONCLUSION',
    hr,
    ...conclusions.map(l => l ? `  ${l}` : ''),
    '',
    dhr,
    '  DISCLAIMER: This report is for informational purposes only.',
    '  It does not constitute financial, tax, or legal advice.',
    '  Verify all figures with licensed professionals before investing.',
    dhr,
  ].filter(l => l !== null && l !== undefined);

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `rental-analysis-${new Date().toISOString().slice(0,10)}.txt`;
  a.click();
}

// ─── FEEDBACK ────────────────────────────────────────────────
function feedbackClick(btn, emoji) {
  const widget = btn.closest('.feedback-widget');
  widget.querySelectorAll('.feedback-btn').forEach(b => b.style.display = 'none');
  widget.querySelector('.feedback-thanks').style.display = 'inline';
}

// ─── LEAD GENERATION ─────────────────────────────────────────
function rentalOpenModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function rentalCloseModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}
function closeModalOutside(e, id) {
  if (e.target.id === id) rentalCloseModal(id);
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['modal-expert','modal-properties','modal-loan'].forEach(rentalCloseModal);
  }
});

function submitLead(type) {
  const email = document.getElementById('lead-email-report').value.trim();
  if (!email || !email.includes('@')) {
    document.getElementById('lead-email-report').style.borderColor = 'var(--red)';
    document.getElementById('lead-email-report').placeholder = 'Please enter a valid email';
    return;
  }
  document.getElementById('lead-email-report').style.borderColor = '';
  downloadReport();
  const btn = document.querySelector(`[onclick="submitLead('report')"]`);
  btn.textContent = '✅ Report sent to your inbox!';
  btn.style.background = 'var(--green)';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = '📄 Send My Report';
    btn.style.background = '';
    btn.disabled = false;
  }, 4000);
}

function submitModal(type) {
  const fieldMap = {
    expert:     { name: 'exp-name',   email: 'exp-email'  },
    properties: { name: 'prop-name',  email: 'prop-email' },
    loan:       { name: 'loan-name',  email: 'loan-email' },
  };
  const fields = fieldMap[type];
  const name  = document.getElementById(fields.name).value.trim();
  const email = document.getElementById(fields.email).value.trim();

  let valid = true;
  if (!name) { document.getElementById(fields.name).style.borderColor  = 'var(--red)'; valid = false; }
  else          document.getElementById(fields.name).style.borderColor  = '';
  if (!email || !email.includes('@')) { document.getElementById(fields.email).style.borderColor = 'var(--red)'; valid = false; }
  else          document.getElementById(fields.email).style.borderColor = '';
  if (!valid) return;

  const formData = { type, name, email, timestamp: new Date().toISOString() };

  if (type !== 'properties') {
    const r = calc();
    formData.dealContext = {
      price: r.price, down: r.down, rent: v('rent'),
      capRate: r.capRate.toFixed(2), coc: r.taxCoc.toFixed(2),
      dscr: r.dscr ? r.dscr.toFixed(2) : null
    };
  }

  console.log('Lead captured:', formData);

  document.getElementById(`form-${type}`).style.display = 'none';
  document.getElementById(`success-${type}`).style.display = 'block';

  setTimeout(() => {
    rentalCloseModal(`modal-${type}`);
    setTimeout(() => {
      document.getElementById(`form-${type}`).style.display = 'flex';
      document.getElementById(`success-${type}`).style.display = 'none';
    }, 400);
  }, 5000);
}

// ─── CASE STUDY ACCORDION ────────────────────────────────────
function toggleCsAcc(btn) {
  const isOpen = btn.getAttribute('aria-expanded') === 'true';
  document.querySelectorAll('.cs-acc-header').forEach(b => b.setAttribute('aria-expanded', 'false'));
  if (!isOpen) {
    btn.setAttribute('aria-expanded', 'true');
    setTimeout(() => btn.closest('.cs-accordion').scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }
}

// ─── FAQ TOGGLE ──────────────────────────────────────────────
function toggleFaq(btn) {
  const item   = btn.closest('.faq-item');
  const body   = item.querySelector('.faq-body');
  const isOpen = btn.getAttribute('aria-expanded') === 'true';

  document.querySelectorAll('.faq-item').forEach(el => {
    if (el !== item) {
      el.querySelector('.faq-header').setAttribute('aria-expanded', 'false');
      el.querySelector('.faq-body').style.display = 'none';
    }
  });

  if (isOpen) {
    btn.setAttribute('aria-expanded', 'false');
    body.style.display = 'none';
  } else {
    btn.setAttribute('aria-expanded', 'true');
    body.style.display = 'block';
    setTimeout(() => item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }
}

// ─── INIT ────────────────────────────────────────────────────
rentalLoadState();
recalc();
