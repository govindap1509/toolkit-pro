// ─── DESIGN SYSTEM TOKENS ────────────────────────────────────
const CHART_COLOURS = ['#b84dc6','#1A73E8','#34A853','#F9AB00','#EA4335','#0D9488','#F97316','#7C3AED'];

// ─── TYPE DEFAULTS ───────────────────────────────────────────
const TYPE_DEFAULTS = {
  multifamily: { vacLabel:'🏘️ Multifamily Analysis', unitsLabel:'Number of Units', rentLabel:'Monthly Rent / Unit ($)', vac:6, ptax:1.1, ins:0.65, maint:10, utils:0, mgmt:8, capex:5, term:25, rate:7.25, icon:'🏘️' },
  office:      { vacLabel:'🏢 Office Analysis',       unitsLabel:'Sq Ft (leasable)', rentLabel:'Monthly Rent Total ($)', vac:10, ptax:1.8, ins:0.7, maint:6, utils:5, mgmt:5, capex:3, term:20, rate:7.5, icon:'🏢' },
  retail:      { vacLabel:'🏪 Retail Analysis',       unitsLabel:'Sq Ft (leasable)', rentLabel:'Monthly Rent Total ($)', vac:9,  ptax:1.6, ins:0.6, maint:5, utils:0, mgmt:5, capex:3, term:20, rate:7.25,icon:'🏪' },
  industrial:  { vacLabel:'🏭 Industrial Analysis',   unitsLabel:'Sq Ft (leasable)', rentLabel:'Monthly Rent Total ($)', vac:4,  ptax:1.2, ins:0.5, maint:4, utils:0, mgmt:4, capex:3, term:20, rate:6.75,icon:'🏭' },
  mixeduse:    { vacLabel:'🏙️ Mixed-Use Analysis',   unitsLabel:'Units + Sq Ft', rentLabel:'Monthly Rent Total ($)', vac:8,  ptax:1.6, ins:0.65,maint:7, utils:2, mgmt:6, capex:4, term:25, rate:7.25,icon:'🏙️' },
};

let currentType = 'multifamily';
let charts = {};

// ─── HELPERS ─────────────────────────────────────────────────
const fmt = (n, d=0) => {
  if (n === null || isNaN(n)) return '—';
  const s = n<0?'-':''; const a = Math.abs(n);
  if (a >= 1e6) return s+'$'+(a/1e6).toFixed(2)+'M';
  if (a >= 1e3) return s+'$'+a.toLocaleString('en-US',{maximumFractionDigits:d});
  return s+'$'+a.toFixed(d);
};
const fmtPct = (n,d=1) => isNaN(n)||n===null?'—':n.toFixed(d)+'%';
const fmtX   = (n,d=2) => isNaN(n)||n===null?'—':n.toFixed(d)+'x';
const v      = id => parseFloat(document.getElementById(id).value)||0;
const el     = id => document.getElementById(id);
const cc     = (n) => n>0?'green':n<0?'red':'';
const tableRow = (label, val, cls='', border=true) =>
  `<tr><td style="padding:8px 0;color:var(--text-muted);${border?'border-bottom:1px solid var(--border-mid)':''}">${label}</td><td style="text-align:right;font-weight:500;padding:8px 0;${border?'border-bottom:1px solid var(--border-mid)':''}${cls?' color:'+cls:''}">${val}</td></tr>`;

// ─── SYNC SLIDERS ────────────────────────────────────────────
function syncS(inp, slider) { el(inp).value = el(slider).value; }
function syncI(inp, slider) { el(slider).value = el(inp).value; }

// ─── TYPE SWITCHER ───────────────────────────────────────────
function setType(type, btn) {
  currentType = type;
  document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  el('prop-type').value = type;
  const d = TYPE_DEFAULTS[type];
  el('vac').value = d.vac; el('vac-slider').value = d.vac;
  el('ptax').value = d.ptax; el('ins-pct').value = d.ins;
  el('maint').value = d.maint; el('utils').value = d.utils;
  el('mgmt').value = d.mgmt; el('capex').value = d.capex;
  el('term').value = d.term; el('rate').value = d.rate;
  el('units-label').textContent = d.unitsLabel + ' ℹ';
  el('rent-label').textContent = d.rentLabel + ' ℹ';
  el('type-badge').textContent = d.vacLabel;
  recalc();
}
function setTypeFromSelect(type) {
  currentType = type;
  document.querySelectorAll('.type-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.type === type);
  });
  setType(type, null);
}

// ─── CORE CALC ───────────────────────────────────────────────
function calc() {
  const price    = v('price');
  const units    = v('units');
  const rent     = v('rent');
  const parking  = v('parking');
  const otherInc = v('other-income');
  const vacRate  = v('vac');
  const ptax     = v('ptax');
  const insPct   = v('ins-pct');
  const maint    = v('maint');
  const utils    = v('utils');
  const mgmt     = v('mgmt');
  const capex    = v('capex');
  const down     = v('down');
  const rate     = v('rate');
  const term     = v('term');
  const appr     = v('appr');
  const incGrow  = v('inc-growth');
  const discRate = v('disc-rate');
  const exitCap  = v('exit-cap');

  const loan = Math.max(0, price - down);
  const mr   = rate / 12 / 100;
  const n    = term * 12;
  let emi    = 0;
  if (mr > 0 && n > 0) {
    const pow = Math.pow(1+mr, n);
    emi = loan * mr * pow / (pow - 1);
  } else if (n > 0) { emi = loan / n; }
  const annDebt = emi * 12;

  // Income
  const isMulti    = currentType === 'multifamily';
  const grossRent  = isMulti ? rent * units * 12 : rent * 12;
  const otherAnn   = (parking + otherInc) * 12;
  const grossInc   = grossRent + otherAnn;
  const egi        = grossInc * (1 - vacRate / 100);

  // Expenses
  const expTax     = price * (ptax / 100);
  const expIns     = price * (insPct / 100);
  const expMaint   = grossInc * (maint / 100);
  const expUtils   = grossInc * (utils / 100);
  const expMgmt    = egi * (mgmt / 100);
  const expCapex   = grossInc * (capex / 100);
  const totalExp   = expTax + expIns + expMaint + expUtils + expMgmt + expCapex;

  // NOI & CF
  const noi  = egi - totalExp;
  const cf   = noi - annDebt;
  const coc  = down > 0 ? (cf / down) * 100 : 0;
  const capR = price > 0 ? (noi / price) * 100 : 0;
  const dscr = annDebt > 0 ? noi / annDebt : 0;
  const grm  = grossRent > 0 ? price / grossRent : 0;
  const beo  = grossInc > 0 ? ((totalExp + annDebt) / grossInc) * 100 : 0;
  const oer  = egi > 0 ? (totalExp / egi) * 100 : 0;

  // IRR & NPV (5-year)
  const annIntY1   = loan * (rate / 100);
  const cashFlows  = [-down];
  let cumPrincipal = 0;
  for (let yr = 1; yr <= 5; yr++) {
    const grow    = Math.pow(1 + incGrow / 100, yr - 1);
    const egiYr   = egi * grow;
    const expYr   = totalExp * Math.pow(1.02, yr - 1);
    const noiYr   = egiYr - expYr;
    const cfYr    = noiYr - annDebt;
    cashFlows.push(yr < 5 ? cfYr : cfYr + getExitEquity(loan, mr, n, exitCap, noiYr, yr, emi));
  }
  const irr = calcIRR(cashFlows);
  const npv = calcNPV(discRate / 100, cashFlows);

  // 5-yr totals for waterfall
  const ann1Int = loan * (rate / 100);
  const prin5   = Math.max(0, annDebt * 5 - ann1Int * 5);
  const apprVal = price * Math.pow(1 + appr / 100, 5) - price;
  const cf5     = cashFlows.slice(1, 5).reduce((a, b) => a + b, 0);
  const total5  = cf5 + apprVal + prin5;
  const em5     = down > 0 ? (down + total5) / down : 0;

  // ── Tax Benefits ──────────────────────────────────────────────
  const depLife       = (currentType === 'multifamily') ? 27.5 : 39;
  const depreciableV  = price * 0.8;
  const annualDeprec  = depreciableV / depLife;
  const interestYr1   = loan * (rate / 100);
  const taxRateInp    = parseFloat((document.getElementById('tax-rate-inp')||{value:28}).value) || 28;
  const taxToggle     = parseInt((document.getElementById('tax-toggle')||{value:1}).value);
  const taxBenefit    = taxToggle
    ? (annualDeprec + interestYr1) * (taxRateInp / 100)
    : 0;
  const adjCf         = cf + taxBenefit;
  const adjCoc        = down > 0 ? (adjCf / down) * 100 : 0;

  // ── Appreciation (Year 1) ─────────────────────────────────────
  const apprValueYr1  = price * (appr / 100);
  const apprOnCapital = down > 0 ? (apprValueYr1 / down) * 100 : 0;

  // ── Total Year-1 Return ───────────────────────────────────────
  const annIntY1_pay = loan * (rate / 100);
  const principalYr1 = Math.max(0, annDebt - annIntY1_pay);
  const totalReturn  = adjCf + apprValueYr1 + principalYr1;
  const totalROI     = down > 0 ? (totalReturn / down) * 100 : 0;

  return {
    price, down, loan, emi, annDebt,
    grossRent, otherAnn, grossInc, egi,
    expTax, expIns, expMaint, expUtils, expMgmt, expCapex, totalExp,
    noi, cf, adjCf, adjCoc, coc, capR, dscr, grm, beo, oer,
    irr, npv, discRate,
    cf5, apprVal, prin5, total5, em5,
    cashFlows, incGrow, appr, rate, vacRate,
    annualDeprec, interestYr1, taxBenefit, taxRateInp, taxToggle, depLife,
    apprValueYr1, apprOnCapital, principalYr1, totalReturn, totalROI,
  };
}

function getExitEquity(loan, mr, n, exitCap, noiExit, yr, emi) {
  const months = yr * 12;
  let bal = loan;
  if (mr > 0) {
    const pow = Math.pow(1 + mr, months);
    const powN = Math.pow(1 + mr, n);
    bal = loan * (powN - pow) / (powN - 1);
  } else { bal = Math.max(0, loan - emi * months); }
  const exitPrice = exitCap > 0 ? (noiExit / (exitCap / 100)) : 0;
  return Math.max(0, exitPrice - bal);
}

function calcIRR(cfs) {
  const hasPositive = cfs.slice(1).some(c => c > 0);
  const hasNegativeFirst = cfs[0] < 0;
  if (!hasPositive || !hasNegativeFirst) return null;

  const npvFn = (rate) => cfs.reduce((s, c, i) => s + c / Math.pow(1 + rate, i), 0);

  let lo = -0.9, hi = 3.0;
  const npvLo = npvFn(lo);
  const npvHi = npvFn(hi);
  if (npvLo * npvHi > 0) return null;

  let mid = 0;
  for (let i = 0; i < 200; i++) {
    mid = (lo + hi) / 2;
    const npvMid = npvFn(mid);
    if (Math.abs(npvMid) < 0.01 || (hi - lo) < 1e-8) break;
    if (npvMid * npvLo < 0) hi = mid;
    else                    lo = mid;
  }

  if (!isFinite(mid) || mid < -0.9 || mid > 3.0) return null;
  return mid * 100;
}

function calcNPV(rate, cfs) {
  return cfs.reduce((s, c, i) => s + c / Math.pow(1 + rate, i), 0);
}

// ─── RECALC ──────────────────────────────────────────────────
function recalc() {
  const r = calc();

  // Hero stats
  el('stat-cap').textContent  = fmtPct(r.capR);
  el('stat-coc').textContent  = fmtPct(r.coc);
  el('stat-dscr').textContent = fmtX(r.dscr);
  el('stat-noi').textContent  = fmt(r.noi);
  el('stat-irr').textContent  = (r.irr !== null && r.irr > -90 && r.irr < 300) ? fmtPct(r.irr) : '—';

  // Metric cards
  el('m-emi').textContent  = fmt(r.emi);
  el('m-noi').textContent  = fmt(r.noi);
  const capEl = el('m-cap'); capEl.textContent = fmtPct(r.capR);
  capEl.className = 'metric-value ' + (r.capR >= 7 ? 'green' : r.capR >= 5 ? 'amber' : 'red');
  const cfEl = el('m-cf');  cfEl.textContent  = fmt(r.cf);
  cfEl.className  = 'metric-value ' + cc(r.cf);
  el('m-cf-mo').textContent  = fmt(r.cf / 12) + '/month';
  const cocEl = el('m-coc'); cocEl.textContent = fmtPct(r.coc);
  cocEl.className = 'metric-value ' + cc(r.coc);
  const dscrEl = el('m-dscr'); dscrEl.textContent = fmtX(r.dscr);
  dscrEl.className = 'metric-value ' + (r.dscr >= 1.25 ? 'green' : r.dscr >= 1.0 ? 'amber' : 'red');
  el('m-dscr-sub').textContent = r.dscr >= 1.25 ? 'Lender-approved ✓' : r.dscr >= 1.0 ? 'Borderline' : 'Below lender minimum';
  const irrEl = el('m-irr');
  if (r.irr === null) {
    irrEl.textContent = 'N/A';
    irrEl.className = 'metric-value';
    irrEl.nextElementSibling.textContent = 'No sign change in cash flows';
  } else if (!isFinite(r.irr) || r.irr <= -90 || r.irr >= 300) {
    irrEl.textContent = '—';
    irrEl.className = 'metric-value';
  } else {
    irrEl.textContent = fmtPct(r.irr);
    irrEl.className = 'metric-value ' + (r.irr >= 10 ? 'gradient-text' : r.irr >= 0 ? 'amber' : 'red');
    irrEl.nextElementSibling.textContent = r.irr < 0
      ? 'Negative — exit doesn\'t recover capital'
      : 'Annualised total return (5-yr exit)';
  }
  const npvEl = el('m-npv'); npvEl.textContent = fmt(r.npv);
  npvEl.className = 'metric-value ' + cc(r.npv);
  el('m-npv-sub').textContent = `at ${fmtPct(r.discRate, 0)} discount rate`;
  el('m-egi').textContent = fmt(r.egi);
  const grmEl = el('m-grm'); grmEl.textContent = fmtX(r.grm);
  grmEl.className = 'metric-value ' + (r.grm <= 10 ? 'green' : r.grm <= 15 ? 'amber' : 'red');
  el('m-grm-sub').textContent = r.grm <= 10 ? 'Strong value' : r.grm <= 15 ? 'Average value' : 'Expensive';
  const beoEl = el('m-beo'); beoEl.textContent = fmtPct(r.beo);
  beoEl.className = 'metric-value ' + (r.beo <= 75 ? 'green' : r.beo <= 90 ? 'amber' : 'red');
  el('m-beo-sub').textContent = r.beo <= 75 ? 'Comfortable buffer' : r.beo <= 90 ? 'Moderate risk' : 'High risk';
  const oerEl = el('m-oer'); oerEl.textContent = fmtPct(r.oer);
  oerEl.className = 'metric-value ' + (r.oer <= 40 ? 'green' : r.oer <= 55 ? 'amber' : 'red');
  el('m-oer-sub').textContent = r.oer <= 40 ? 'Excellent' : r.oer <= 55 ? 'Normal' : 'High expenses';

  // Deal verdict badge
  const badge = el('deal-verdict-badge');
  if (r.capR >= 7 && r.dscr >= 1.25 && r.coc >= 8) {
    badge.textContent = '✅ Strong Deal'; badge.className = 'badge badge-green';
  } else if (r.capR >= 5 && r.dscr >= 1.0) {
    badge.textContent = '⚠️ Viable Deal'; badge.className = 'badge badge-amber';
  } else {
    badge.textContent = '❌ Weak Deal'; badge.className = 'badge badge-red';
  }

  // After-tax & total return section
  const adjCfEl = el('m-adj-cf');
  adjCfEl.textContent = fmt(r.adjCf);
  adjCfEl.className = 'metric-value ' + cc(r.adjCf);

  el('m-tax-sav').textContent = r.taxToggle ? fmt(r.taxBenefit) : '$0';
  el('m-tax-sav-sub').textContent = r.taxToggle
    ? `Depreciation ${fmt(r.annualDeprec)} + Interest ${fmt(r.interestYr1)} × ${r.taxRateInp}%`
    : 'Tax benefits disabled';

  el('m-adj-coc').textContent = fmtPct(r.adjCoc);
  el('m-appr-val').textContent = fmt(r.apprValueYr1);
  el('m-appr-sub').textContent = `${fmt(r.price)} × ${v('appr')}% appreciation`;
  el('m-appr-coc').textContent = fmtPct(r.apprOnCapital);
  el('m-total-roi').textContent = fmtPct(r.totalROI);

  // Tax toggle note bar
  const toggleBar   = el('tax-toggle-bar');
  const toggleIcon  = el('tax-toggle-icon');
  const toggleLabel = el('tax-toggle-label');
  if (r.taxToggle) {
    toggleBar.style.background  = 'var(--green-bg)';
    toggleIcon.textContent  = '✅';
    toggleLabel.textContent = `Tax benefits included: depreciation ($${Math.round(r.annualDeprec).toLocaleString()}/yr over ${r.depLife} yrs) + interest deduction saves ${fmt(r.taxBenefit)}/yr at ${r.taxRateInp}% rate`;
  } else {
    toggleBar.style.background  = 'var(--bg-alt)';
    toggleIcon.textContent  = '❌';
    toggleLabel.textContent = 'Tax benefits excluded — toggle on in Growth Assumptions to see impact';
  }

  // Update breakdown summary line
  el('breakdown-summary').textContent =
    `EGI ${fmt(r.egi)} → NOI ${fmt(r.noi)} → Cash Flow ${fmt(r.cf)}/yr`;

  // Decision engine
  updateDecision(r);
  // Recommendation
  updateRecommendation(r);
  // Waterfall
  updateWaterfall(r);
  // Tables
  updateTables(r);
  // Charts
  updateCharts(r);
  // Sensitivity
  updateSensitivity(r);
}

// ─── DECISION ENGINE ─────────────────────────────────────────
function updateDecision(r) {
  const blocks = [];
  if (r.capR < 5)      blocks.push({t:'bad', title:'Below-Market Cap Rate ❌', sub:`Cap rate of ${fmtPct(r.capR)} is below 5%. The market is pricing this asset expensively relative to its income. Consider negotiating price or finding higher-income alternatives.`});
  else if (r.capR < 7) blocks.push({t:'warn',title:'Average Cap Rate ⚠️', sub:`Cap rate of ${fmtPct(r.capR)} is acceptable for low-risk markets (coastal cities, trophy assets). In secondary markets, target 7%+.`});
  else                  blocks.push({t:'good',title:'Strong Cap Rate 👍', sub:`Cap rate of ${fmtPct(r.capR)} exceeds 7% — well-priced relative to income for most US commercial markets.`});

  if (r.dscr < 1.0)    blocks.push({t:'bad', title:'DSCR Below 1.0 ❌', sub:`NOI does not cover debt service (DSCR ${fmtX(r.dscr)}). Lenders will not approve this loan without significant additional cash reserves or a larger down payment.`});
  else if (r.dscr < 1.25) blocks.push({t:'warn',title:'Tight DSCR ⚠️', sub:`DSCR of ${fmtX(r.dscr)} is below the typical lender minimum of 1.25x. Approval may require additional collateral or better terms.`});
  else                  blocks.push({t:'good',title:'Healthy DSCR ✓', sub:`DSCR of ${fmtX(r.dscr)} gives comfortable coverage. Most commercial lenders require ≥1.25x — you're clear.`});

  if (r.coc < 5)       blocks.push({t:'bad', title:'Poor Cash-on-Cash Return', sub:`CoC of ${fmtPct(r.coc)} is below what risk-free savings accounts offer. This deal needs appreciation to justify the risk.`});
  else if (r.coc < 10) blocks.push({t:'warn',title:'Moderate Cash Yield', sub:`CoC of ${fmtPct(r.coc)} is acceptable. Total return including appreciation may still be compelling depending on market growth assumptions.`});
  else                  blocks.push({t:'good',title:'Strong Cash Yield 💵', sub:`Cash-on-cash return of ${fmtPct(r.coc)} is excellent for commercial real estate.`});

  if (r.npv > 0)        blocks.push({t:'good',title:'Positive NPV 📈', sub:`NPV of ${fmt(r.npv)} at your ${fmtPct(r.discRate,0)} discount rate means this deal creates value above your minimum required return.`});
  else                  blocks.push({t:'bad', title:'Negative NPV', sub:`NPV of ${fmt(r.npv)} at ${fmtPct(r.discRate,0)} discount rate means returns are below your required rate. Consider raising rent, reducing price, or lowering expenses.`});

  el('decision-container').innerHTML = blocks.map(b =>
    `<div class="decision-block ${b.t}"><div class="decision-title">${b.title}</div><div class="decision-sub">${b.sub}</div></div>`
  ).join('');
}

// ─── PRICE RECOMMENDATION ENGINE ─────────────────────────────
function updateRecommendation(r) {
  const askPrice = r.price;
  const noi      = r.noi;
  const rate     = r.rate;
  const term     = v('term');
  const downPct  = askPrice > 0 ? r.down / askPrice : 0.25;

  function calcAtPrice(targetPrice) {
    const expTaxP  = targetPrice * (v('ptax') / 100);
    const expInsP  = targetPrice * (v('ins-pct') / 100);
    const fixedExp = r.expMaint + r.expUtils + r.expMgmt + r.expCapex;
    const noiP     = r.egi - expTaxP - expInsP - fixedExp;
    const capP     = targetPrice > 0 ? (noiP / targetPrice) * 100 : 0;
    const downP    = targetPrice * downPct;
    const loanP    = targetPrice - downP;
    const mr       = rate / 12 / 100;
    const n        = term * 12;
    let emiP       = 0;
    if (mr > 0 && n > 0) { const pw = Math.pow(1+mr,n); emiP = loanP * mr * pw / (pw-1); }
    else if (n > 0) { emiP = loanP / n; }
    const debtP   = emiP * 12;
    const cfP     = noiP - debtP;
    const cocP    = downP > 0 ? (cfP / downP) * 100 : 0;
    const dscrP   = debtP > 0 ? noiP / debtP : 0;
    return { price: targetPrice, noi: noiP, cap: capP, cf: cfP, coc: cocP, dscr: dscrP, down: downP };
  }

  function solveForCapRate(targetCap, lo=100000, hi=5000000) {
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2;
      const c   = calcAtPrice(mid);
      if (Math.abs(c.cap - targetCap) < 0.001) return mid;
      if (c.cap < targetCap) hi = mid; else lo = mid;
    }
    return (lo + hi) / 2;
  }

  function solveForDSCR(targetDSCR, lo=100000, hi=5000000) {
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2;
      const c   = calcAtPrice(mid);
      if (Math.abs(c.dscr - targetDSCR) < 0.001) return mid;
      if (c.dscr < targetDSCR) hi = mid; else lo = mid;
    }
    return (lo + hi) / 2;
  }

  const priceDSCR125  = Math.round(solveForDSCR(1.25)  / 5000) * 5000;
  const priceGood     = Math.round(solveForCapRate(7.0) / 5000) * 5000;
  const priceViable   = Math.round(solveForCapRate(5.5) / 5000) * 5000;
  const priceFair     = Math.round(solveForCapRate(6.0) / 5000) * 5000;

  const curData   = calcAtPrice(askPrice);
  const goodData  = calcAtPrice(priceGood);
  const fairData  = calcAtPrice(priceFair);
  const dscrData  = calcAtPrice(priceDSCR125);

  let statusClass, statusIcon, statusText, statusSub;
  if (curData.cap >= 7 && curData.dscr >= 1.25) {
    statusClass = 'good'; statusIcon = '✅';
    statusText  = 'Well Priced — Strong Investment at Ask';
    statusSub   = `At $${(askPrice/1000).toFixed(0)}k, this property delivers a ${fmtPct(curData.cap)} cap rate and ${fmtX(curData.dscr)} DSCR. No price negotiation needed for a solid deal.`;
  } else if (curData.cap >= 5.5 && curData.dscr >= 1.0) {
    statusClass = 'fair'; statusIcon = '⚠️';
    statusText  = 'Overpriced — Room to Negotiate';
    statusSub   = `At ask price, cap rate is only ${fmtPct(curData.cap)} with ${fmtX(curData.dscr)} DSCR. Viable, but you're leaving money on the table.`;
  } else {
    statusClass = 'overpriced'; statusIcon = '❌';
    statusText  = 'Significantly Overpriced at Current Ask';
    statusSub   = `Cap rate of ${fmtPct(curData.cap)} and DSCR of ${fmtX(curData.dscr)} are both below acceptable thresholds. Substantial price reduction required.`;
  }

  const pricePts = [
    { label: '📍 Ask Price',      isAsk: true,   d: curData,  color: '#b84dc6' },
    { label: '⚖️ Fair Entry',     isAsk: false,  d: fairData, color: '#F9AB00', target: 'Cap 6.0%' },
    { label: '✅ Good Deal',       isAsk: false,  d: goodData, color: '#34A853', target: 'Cap 7.0%' },
    { label: '🏦 Lender Min.',    isAsk: false,  d: dscrData, color: '#1A73E8', target: 'DSCR 1.25×' },
  ].sort((a, b) => b.d.price - a.d.price);

  const maxP = Math.max(askPrice, priceGood, priceFair, priceDSCR125) * 1.05;

  const askPct   = (askPrice    / maxP) * 100;
  const fairPct  = (priceFair   / maxP) * 100;
  const goodPct  = (priceGood   / maxP) * 100;
  const dscrPct  = (priceDSCR125 / maxP) * 100;

  const discount     = askPrice - priceGood;
  const discountPct  = (discount / askPrice) * 100;
  const rentNeeded   = noi > 0 ? Math.ceil((noi / (askPrice * 0.07) * r.grossInc / r.egi + r.totalExp - r.egi * 0.07) / 12 / v('units')) : 0;
  const rentToViable = r.grossRent > 0 ? Math.ceil((r.grossInc / r.egi * r.egi * 1.015 - r.grossInc) / 12 / v('units')) : 0;

  const actions = [];
  if (askPrice > priceGood) {
    actions.push(`Offer <strong>${fmt(priceGood)}</strong> — a ${fmtPct(discountPct, 1)} discount from ask. This is the minimum price where this deal pencils at 7% cap with your expense assumptions.`);
  }
  if (askPrice > priceFair) {
    actions.push(`If seller won't go below ${fmt(priceFair)}, negotiate a <strong>seller credit</strong> for deferred maintenance or closing costs to bridge the gap.`);
  }
  actions.push(`Increase down payment to <strong>${fmt(dscrData.down)}</strong> (${fmtPct(dscrData.down/askPrice*100,0)} of ask) to hit DSCR 1.25× at the current ask price without reducing price.`);
  if (curData.dscr < 1.0) {
    actions.push(`At current ask and expenses, NOI does NOT cover debt service. Do not proceed without either a ${fmtPct(discountPct, 0)} price reduction or a ${fmtPct((dscrData.down/r.down - 1)*100, 0)} larger down payment.`);
  }

  el('rec-container').innerHTML = `
    <div class="rec-panel">
      <div class="rec-status-bar ${statusClass}">
        <div class="rec-status-icon">${statusIcon}</div>
        <div>
          <div class="rec-status-text ${statusClass}">${statusText}</div>
          <div class="rec-status-sub">${statusSub}</div>
        </div>
      </div>
      <div class="rec-ladder">
        <div class="rec-ladder-title">Price Targets — What Each Price Achieves</div>
        <div class="rec-col-header">
          <span>Threshold</span>
          <span>Target Price</span>
          <span>Cap Rate</span>
          <span>CoC</span>
          <span>DSCR</span>
        </div>
        ${pricePts.map(pt => {
          const diff    = pt.d.price - askPrice;
          const diffPct = (diff / askPrice) * 100;
          const diffStr = diff === 0 ? '<span style="font-size:11px;color:var(--text-muted)">Ask price</span>'
            : diff < 0
              ? `<span class="rec-row-discount" style="background:var(--green-bg);color:var(--green)">−${fmtPct(Math.abs(diffPct),1)} from ask</span>`
              : `<span class="rec-row-discount" style="background:var(--red-bg);color:var(--red)">+${fmtPct(diffPct,1)} above ask</span>`;
          const priceEl = pt.isAsk
            ? `<div class="rec-row-price gradient-text">${fmt(pt.d.price)}</div>`
            : `<div class="rec-row-price" style="color:${pt.color}">${fmt(pt.d.price)}</div>`;
          const rowBg = pt.isAsk ? 'current-row' : '';
          return `
          <div class="rec-price-row ${rowBg}">
            <div><div class="rec-row-label">${pt.label}</div><div style="font-size:10px;color:var(--text-faint);margin-top:2px">${pt.target || ''}</div></div>
            <div style="display:flex;align-items:center;gap:8px">${priceEl}${diffStr}</div>
            <div style="font-size:13px;font-weight:600;color:${pt.d.cap>=7?'var(--green)':pt.d.cap>=5.5?'var(--amber)':'var(--red)'};text-align:right">${fmtPct(pt.d.cap)}</div>
            <div style="font-size:13px;font-weight:600;color:${pt.d.coc>=8?'var(--green)':pt.d.coc>=5?'var(--amber)':'var(--red)'};text-align:right">${fmtPct(pt.d.coc)}</div>
            <div style="font-size:13px;font-weight:600;color:${pt.d.dscr>=1.25?'var(--green)':pt.d.dscr>=1.0?'var(--amber)':'var(--red)'};text-align:right">${fmtX(pt.d.dscr)}</div>
          </div>`;
        }).join('')}
      </div>

      <div class="rec-bar-section">
        <div class="rec-bar-label">Price Range Visualisation</div>
        <div class="rec-bar-track" style="height:14px;margin-top:28px;margin-bottom:28px">
          <div class="rec-bar-segment" style="left:0;width:${goodPct}%;background:linear-gradient(90deg,rgba(19,115,51,0.15),rgba(19,115,51,0.25));border-radius:100px 0 0 100px"></div>
          ${askPrice > priceGood ? `<div class="rec-bar-segment" style="left:${goodPct}%;width:${Math.max(0,askPct-goodPct)}%;background:rgba(180,83,9,0.2)"></div>` : ''}
          <div class="rec-bar-marker-line" style="left:${goodPct}%;background:var(--green);height:22px;top:-4px"></div>
          <div class="rec-bar-marker" style="left:${goodPct}%;color:var(--green);top:-28px">${fmt(priceGood)}</div>
          <div class="rec-bar-marker" style="left:${goodPct}%;color:var(--green);top:18px;font-size:9px">7% cap</div>
          ${Math.abs(fairPct - goodPct) > 4 ? `
          <div class="rec-bar-marker-line" style="left:${fairPct}%;background:var(--amber);height:22px;top:-4px"></div>
          <div class="rec-bar-marker" style="left:${fairPct}%;color:var(--amber);top:-28px">${fmt(priceFair)}</div>
          <div class="rec-bar-marker" style="left:${fairPct}%;color:var(--amber);top:18px;font-size:9px">6% cap</div>` : ''}
          <div class="rec-bar-marker-line" style="left:${Math.min(askPct,97)}%;background:var(--ms-purple);height:22px;top:-4px;width:2.5px"></div>
          <div class="rec-bar-marker" style="left:${Math.min(askPct,97)}%;color:var(--ms-purple);top:-28px;font-weight:800">${fmt(askPrice)}</div>
          <div class="rec-bar-marker" style="left:${Math.min(askPct,97)}%;color:var(--ms-purple);top:18px;font-size:9px">ASK</div>
        </div>
        <div class="rec-bar-legend">
          <div class="rec-bar-legend-item"><div class="rec-bar-legend-dot" style="background:var(--green)"></div>Strong deal zone (≥7% cap)</div>
          <div class="rec-bar-legend-item"><div class="rec-bar-legend-dot" style="background:var(--amber)"></div>Fair entry zone (6–7% cap)</div>
          <div class="rec-bar-legend-item"><div class="rec-bar-legend-dot" style="background:var(--ms-purple)"></div>Current ask price</div>
          <div class="rec-bar-legend-item"><div class="rec-bar-legend-dot" style="background:var(--blue)"></div>DSCR lender floor</div>
        </div>
      </div>

      <div class="rec-action-box" style="margin:0 24px 20px">
        <div class="rec-action-title">💡 Specific Actions for This Property</div>
        <ul class="rec-action-list">
          ${actions.map(a => `<li>${a}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

// ─── WATERFALL ───────────────────────────────────────────────
function updateWaterfall(r) {
  const rows = [
    { icon:'💵', bg:'var(--green-bg)',  label:'Cumulative Cash Flow (Yrs 1–4)', sub:'NOI minus debt service × 4 years', val: fmt(r.cf5),    col: r.cf5 >= 0 ? 'var(--green)' : 'var(--red)' },
    { icon:'📈', bg:'var(--blue-tint)', label:'Appreciation (5-Year)',           sub:`${fmtPct(r.appr)}%/yr on full asset`, val: fmt(r.apprVal), col:'var(--blue)' },
    { icon:'🏦', bg:'#F3E8FF',          label:'Loan Paydown (Equity Built)',      sub:'Principal reduction over 5 years',   val: fmt(r.prin5),   col:'#7C3AED'  },
  ];
  el('waterfall-container').innerHTML = rows.map(row =>
    `<div class="waterfall-row">
      <div class="waterfall-left">
        <div class="waterfall-icon" style="background:${row.bg}">${row.icon}</div>
        <div><div class="waterfall-label">${row.label}</div><div class="waterfall-sub">${row.sub}</div></div>
      </div>
      <div class="waterfall-val" style="color:${row.col}">${row.val}</div>
    </div>`
  ).join('');
  el('wf-total').textContent   = fmt(r.total5);
  el('wf-capital').textContent = fmt(r.down);
  el('wf-em').textContent      = fmtX(r.em5);
}

// ─── INCOME / EXPENSE TABLES ──────────────────────────────────
function updateTables(r) {
  el('income-table').innerHTML = [
    tableRow('Gross Rental Income', fmt(r.grossRent)),
    tableRow('Other Income (parking + misc)', fmt(r.otherAnn)),
    tableRow('<strong>Gross Income</strong>', `<strong>${fmt(r.grossInc)}</strong>`),
    tableRow('Less: Vacancy Loss', `<span style="color:var(--red)">− ${fmt(r.grossInc - r.egi)}</span>`),
    tableRow('<strong>Effective Gross Income (EGI)</strong>', `<strong>${fmt(r.egi)}</strong>`),
    tableRow('Less: Total Operating Expenses', `<span style="color:var(--red)">− ${fmt(r.totalExp)}</span>`),
    tableRow('<strong style="color:var(--text)">Net Operating Income (NOI)</strong>', `<strong style="color:${r.noi>=0?'var(--green)':'var(--red)'}">${fmt(r.noi)}</strong>`, '', false),
  ].join('');

  el('expense-table').innerHTML = [
    tableRow(`Property Tax (${v('ptax')}% of value)`, `<span style="color:var(--red)">− ${fmt(r.expTax)}</span>`),
    tableRow(`Insurance (${v('ins-pct')}% of value)`, `<span style="color:var(--red)">− ${fmt(r.expIns)}</span>`),
    tableRow(`Maintenance (${v('maint')}% of income)`, `<span style="color:var(--red)">− ${fmt(r.expMaint)}</span>`),
    tableRow(`Utilities (${v('utils')}% of income)`, `<span style="color:var(--red)">− ${fmt(r.expUtils)}</span>`),
    tableRow(`Property Mgmt (${v('mgmt')}% of EGI)`, `<span style="color:var(--red)">− ${fmt(r.expMgmt)}</span>`),
    tableRow(`CapEx Reserve (${v('capex')}% of income)`, `<span style="color:var(--red)">− ${fmt(r.expCapex)}</span>`),
    tableRow('<strong>Total Operating Expenses</strong>', `<strong style="color:var(--red)">− ${fmt(r.totalExp)}</strong>`, '', false),
  ].join('');
  el('t-oer-val').textContent = fmtPct(r.oer);
  el('t-exp-egi').textContent = `${fmt(r.totalExp)} ÷ ${fmt(r.egi)}`;
}

// ─── CHARTS ──────────────────────────────────────────────────
function updateCharts(r) {
  if (charts.income) charts.income.destroy();
  charts.income = new Chart(el('chart-income').getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['EGI', 'Operating Exp', 'NOI', 'Debt Service', 'Cash Flow'],
      datasets: [{ data: [r.egi, r.totalExp, r.noi, r.annDebt, r.cf],
        backgroundColor: [CHART_COLOURS[1], CHART_COLOURS[4], CHART_COLOURS[2], CHART_COLOURS[3], r.cf>=0?CHART_COLOURS[2]:CHART_COLOURS[4]],
        borderRadius: 6, borderSkipped: false }]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{
      x:{grid:{display:false},ticks:{font:{family:'DM Sans',size:10},color:'#5F6368'}},
      y:{grid:{color:'#F1F3F4'},ticks:{font:{family:'DM Sans',size:11},color:'#5F6368',callback:v=>v>=1000?'$'+(v/1000).toFixed(0)+'k':'$'+v}}
    }}
  });

  const cfYears = [];
  for (let yr = 1; yr <= 5; yr++) {
    const grow  = Math.pow(1 + r.incGrow / 100, yr - 1);
    const egiYr = r.egi * grow;
    const expYr = r.totalExp * Math.pow(1.02, yr - 1);
    cfYears.push(egiYr - expYr - r.annDebt);
  }
  if (charts.cashflow) charts.cashflow.destroy();
  charts.cashflow = new Chart(el('chart-cashflow').getContext('2d'), {
    type: 'line',
    data: {
      labels: ['Year 1','Year 2','Year 3','Year 4','Year 5'],
      datasets: [{
        data: cfYears, borderColor: '#b84dc6', backgroundColor: 'rgba(184,77,198,0.08)',
        borderWidth: 2.5, pointBackgroundColor: '#b84dc6', pointRadius: 5, fill: true, tension: 0.3
      }]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{
      x:{grid:{display:false},ticks:{font:{family:'DM Sans',size:11},color:'#5F6368'}},
      y:{grid:{color:'#F1F3F4'},ticks:{font:{family:'DM Sans',size:11},color:'#5F6368',callback:v=>v>=1000?'$'+(v/1000).toFixed(0)+'k':'$'+v}}
    }}
  });

  const expLabels = ['Property Tax','Insurance','Maintenance','Utilities','Mgmt','CapEx'];
  const expVals   = [r.expTax, r.expIns, r.expMaint, r.expUtils, r.expMgmt, r.expCapex].filter((_,i)=>[r.expTax,r.expIns,r.expMaint,r.expUtils,r.expMgmt,r.expCapex][i]>0);
  const expLabF   = expLabels.filter((_,i)=>[r.expTax,r.expIns,r.expMaint,r.expUtils,r.expMgmt,r.expCapex][i]>0);
  if (charts.expenses) charts.expenses.destroy();
  charts.expenses = new Chart(el('chart-expenses').getContext('2d'), {
    type: 'doughnut',
    data: { labels: expLabF, datasets: [{ data: expVals, backgroundColor: CHART_COLOURS.slice(0,expVals.length), borderWidth: 2, borderColor: 'white', hoverOffset: 6 }] },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'right',labels:{font:{family:'DM Sans',size:11},color:'#5F6368',boxWidth:12,padding:12}}} }
  });
}

// ─── SENSITIVITY ─────────────────────────────────────────────
function updateSensitivity(r) {
  const vacRates  = [0, 3, 5, 7, 10, 15, 20];
  const intRates  = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];
  const curVac    = r.vacRate;
  const curRate   = r.rate;

  function calcOverride(vacOvr, rateOvr) {
    const price = v('price'); const down = v('down');
    const grossInc = r.grossInc;
    const egi  = grossInc * (1 - vacOvr / 100);
    const exp  = r.totalExp * (egi / r.egi);
    const noi  = egi - exp;
    const loan = price - down;
    const mr2  = rateOvr / 12 / 100; const n2 = v('term') * 12;
    let emi2   = 0;
    if (mr2 > 0 && n2 > 0) { const p = Math.pow(1+mr2,n2); emi2 = loan * mr2 * p / (p-1); }
    const debt2 = emi2 * 12;
    return { noi, cap: price>0?(noi/price)*100:0, dscr: debt2>0?noi/debt2:0, cf: noi - debt2 };
  }

  let capHTML = '<thead><tr><th>Vacancy %</th>' + vacRates.map(v=>`<th>${v}%</th>`).join('') + '</tr></thead><tbody>';
  capHTML += '<tr><td>Cap Rate</td>' + vacRates.map(vr => {
    const res = calcOverride(vr, curRate);
    const isBase = Math.abs(vr - curVac) < 0.1;
    const cls = isBase ? 'sens-cell-base' : res.cap >= 7 ? 'sens-cell-green' : res.cap >= 5 ? 'sens-cell-amber' : 'sens-cell-red';
    return `<td class="${cls}">${fmtPct(res.cap)}</td>`;
  }).join('') + '</tr></tbody>';
  el('sens-cap').innerHTML = capHTML;

  let dscrHTML = '<thead><tr><th>Rate</th>' + intRates.map(r=>`<th>${r}%</th>`).join('') + '</tr></thead><tbody>';
  dscrHTML += '<tr><td>DSCR</td>' + intRates.map(ir => {
    const res = calcOverride(curVac, ir);
    const isBase = Math.abs(ir - curRate) < 0.05;
    const cls = isBase ? 'sens-cell-base' : res.dscr >= 1.25 ? 'sens-cell-green' : res.dscr >= 1.0 ? 'sens-cell-amber' : 'sens-cell-red';
    return `<td class="${cls}">${fmtX(res.dscr)}</td>`;
  }).join('') + '</tr></tbody>';
  el('sens-dscr').innerHTML = dscrHTML;

  const vacRows  = [0, 3, 5, 7, 10, 15];
  const ratesCols = [5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];
  let cfHTML = '<thead><tr><th>Vac \\ Rate</th>' + ratesCols.map(r=>`<th>${r}%</th>`).join('') + '</tr></thead><tbody>';
  vacRows.forEach(vr => {
    cfHTML += `<tr><td>${vr}% vac</td>`;
    ratesCols.forEach(ir => {
      const res    = calcOverride(vr, ir);
      const isBase = Math.abs(vr - curVac) < 0.1 && Math.abs(ir - curRate) < 0.05;
      const cls    = isBase ? 'sens-cell-base' : res.cf >= 0 ? 'sens-cell-green' : Math.abs(res.cf) < 20000 ? 'sens-cell-amber' : 'sens-cell-red';
      const display = res.cf >= 1000 ? '$'+(res.cf/1000).toFixed(0)+'k' : res.cf <= -1000 ? '−$'+(Math.abs(res.cf)/1000).toFixed(0)+'k' : '$'+Math.round(res.cf);
      cfHTML += `<td class="${cls}">${display}</td>`;
    });
    cfHTML += '</tr>';
  });
  cfHTML += '</tbody>';
  el('sens-cf').innerHTML = cfHTML;
}

// ─── DOWNLOAD REPORT ─────────────────────────────────────────
function downloadReport() {
  const r = calc();
  const date = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  const W = 54;
  const hr = '─'.repeat(W);
  const lines = [
    '═'.repeat(W),
    '  COMMERCIAL PROPERTY INVESTMENT REPORT',
    `  Generated: ${date}`,
    `  Property Type: ${currentType.toUpperCase()}`,
    `  Market: ${el('market').value || 'Not specified'}`,
    '═'.repeat(W), '',
    '  SECTION 1 — PROPERTY INPUTS',
    hr,
    `  Purchase Price         ${fmt(r.price).padStart(18)}`,
    `  Down Payment           ${fmt(r.down).padStart(18)}   (${fmtPct((r.down/r.price)*100,0)})`,
    `  Loan Amount            ${fmt(r.loan).padStart(18)}`,
    `  Interest Rate          ${fmtPct(v('rate')).padStart(18)}`,
    `  Loan Term              ${(v('term')+' years').padStart(18)}`,
    `  Monthly Mortgage       ${fmt(r.emi).padStart(18)}`, '',
    '  SECTION 2 — INCOME',
    hr,
    `  Gross Rental Income    ${fmt(r.grossRent).padStart(18)}`,
    `  Other Income           ${fmt(r.otherAnn).padStart(18)}`,
    `  Gross Income           ${fmt(r.grossInc).padStart(18)}`,
    `  Vacancy Rate           ${fmtPct(r.vacRate).padStart(18)}`,
    `  Effective Gross Income ${fmt(r.egi).padStart(18)}`, '',
    '  SECTION 3 — EXPENSES',
    hr,
    `  Property Tax           ${fmt(r.expTax).padStart(18)}`,
    `  Insurance              ${fmt(r.expIns).padStart(18)}`,
    `  Maintenance            ${fmt(r.expMaint).padStart(18)}`,
    `  Utilities              ${fmt(r.expUtils).padStart(18)}`,
    `  Property Management    ${fmt(r.expMgmt).padStart(18)}`,
    `  CapEx Reserve          ${fmt(r.expCapex).padStart(18)}`,
    `  Total Expenses         ${fmt(r.totalExp).padStart(18)}`,
    `  Operating Exp Ratio    ${fmtPct(r.oer).padStart(18)}`, '',
    '  SECTION 4 — RETURNS',
    hr,
    `  Net Operating Income   ${fmt(r.noi).padStart(18)}`,
    `  Annual Debt Service    ${fmt(r.annDebt).padStart(18)}`,
    `  Annual Cash Flow       ${fmt(r.cf).padStart(18)}`,
    `  Monthly Cash Flow      ${fmt(r.cf/12).padStart(18)}`,
    `  Cap Rate               ${fmtPct(r.capR).padStart(18)}   ${r.capR>=7?'✓ STRONG':r.capR>=5?'~ AVERAGE':'✗ WEAK'}`,
    `  Cash-on-Cash Return    ${fmtPct(r.coc).padStart(18)}`,
    `  DSCR                   ${fmtX(r.dscr).padStart(18)}   ${r.dscr>=1.25?'✓ LENDER APPROVED':r.dscr>=1.0?'~ BORDERLINE':'✗ BELOW MIN'}`,
    `  GRM                    ${fmtX(r.grm).padStart(18)}`,
    `  Break-even Occupancy   ${fmtPct(r.beo).padStart(18)}`,
    `  IRR (5-Year)           ${r.irr!==null?fmtPct(r.irr):'N/A'.padStart(18)}`,
    `  NPV                    ${fmt(r.npv).padStart(18)}   at ${fmtPct(r.discRate,0)} discount`, '',
    '  SECTION 5 — 5-YEAR PROJECTION',
    hr,
    `  Cumulative Cash Flow   ${fmt(r.cf5).padStart(18)}`,
    `  Appreciation           ${fmt(r.apprVal).padStart(18)}`,
    `  Loan Paydown           ${fmt(r.prin5).padStart(18)}`,
    `  Total 5-Year Return    ${fmt(r.total5).padStart(18)}`,
    `  Equity Multiple (EM)   ${fmtX(r.em5).padStart(18)}`, '',
    '═'.repeat(W),
    '  DISCLAIMER: For informational purposes only.',
    '  Not financial, legal, or tax advice.',
    '═'.repeat(W),
  ];
  const blob = new Blob([lines.join('\n')], {type:'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `commercial-analysis-${currentType}-${new Date().toISOString().slice(0,10)}.txt`;
  a.click();
}

// ─── MODAL ───────────────────────────────────────────────────
function commercialOpenModal(id)  { el(id).classList.add('open'); document.body.style.overflow='hidden'; }
function commercialCloseModal(id) { el(id).classList.remove('open'); document.body.style.overflow=''; }
document.addEventListener('keydown', e => { if (e.key==='Escape') commercialCloseModal('modal-expert'); });

function commercialSubmitExpert() {
  const name  = el('exp-name').value.trim();
  const email = el('exp-email').value.trim();
  let ok = true;
  if (!name)  { el('exp-name').style.borderColor='var(--red)'; ok=false; } else el('exp-name').style.borderColor='';
  if (!email||!email.includes('@')) { el('exp-email').style.borderColor='var(--red)'; ok=false; } else el('exp-email').style.borderColor='';
  if (!ok) return;
  console.log('Lead:', {name,email,type:currentType,price:v('price'),capRate:calc().capR.toFixed(2)});
  el('modal-form-expert').style.display='none';
  el('modal-success-expert').style.display='block';
  setTimeout(()=>{ commercialCloseModal('modal-expert'); setTimeout(()=>{ el('modal-form-expert').style.display=''; el('modal-success-expert').style.display='none'; },400); },5000);
}

// ─── COLLAPSE TOGGLE ─────────────────────────────────────────
function toggleCollapse(bodyId, chevronId) {
  const body    = el(bodyId);
  const chevron = el(chevronId);
  const isOpen  = body.style.display !== 'none';
  body.style.display    = isOpen ? 'none' : 'block';
  if (isOpen) chevron.classList.remove('open');
  else        chevron.classList.add('open');
}

// ─── INIT ────────────────────────────────────────────────────
recalc();
