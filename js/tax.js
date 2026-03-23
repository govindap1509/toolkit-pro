// ============================================================
// TAX DATA 2024
// ============================================================
const TAX_DATA = {
  federal: {
    single: { stdDed: 14600, brackets: [
      {min:0,     max:12400,  rate:.10},
      {min:12400, max:50400,  rate:.12},
      {min:50400, max:105700, rate:.22},
      {min:105700,max:201775, rate:.24},
      {min:201775,max:256225, rate:.32},
      {min:256225,max:640600, rate:.35},
      {min:640600,max:Infinity,rate:.37}
    ]},
    mfj: { stdDed: 29200, brackets: [
      {min:0,     max:24800,  rate:.10},
      {min:24800, max:100800, rate:.12},
      {min:100800,max:211400, rate:.22},
      {min:211400,max:403550, rate:.24},
      {min:403550,max:512450, rate:.32},
      {min:512450,max:768700, rate:.35},
      {min:768700,max:Infinity,rate:.37}
    ]},
    hoh: { stdDed: 21900, brackets: [
      {min:0,     max:17700,  rate:.10},
      {min:17700, max:67450,  rate:.12},
      {min:67450, max:105700, rate:.22},
      {min:105700,max:201775, rate:.24},
      {min:201775,max:256200, rate:.32},
      {min:256200,max:640600, rate:.35},
      {min:640600,max:Infinity,rate:.37}
    ]}
  },
  fica: {
    ss:  { rate:.062, wageBase: 168600 },
    med: { rate:.0145, addlRate:.009, threshold:{ single:200000, mfj:250000, hoh:200000 } }
  },
  states: {
    "AK":{name:"Alaska",           type:"none"},
    "FL":{name:"Florida",          type:"none"},
    "NV":{name:"Nevada",           type:"none"},
    "NH":{name:"New Hampshire",    type:"none"},
    "SD":{name:"South Dakota",     type:"none"},
    "TN":{name:"Tennessee",        type:"none"},
    "TX":{name:"Texas",            type:"none"},
    "WA":{name:"Washington",       type:"none"},
    "WY":{name:"Wyoming",          type:"none"},
    "AZ":{name:"Arizona",          type:"flat", rate:.025},
    "CO":{name:"Colorado",         type:"flat", rate:.044},
    "GA":{name:"Georgia",          type:"flat", rate:.0519},
    "ID":{name:"Idaho",            type:"flat", rate:.053},
    "IL":{name:"Illinois",         type:"flat", rate:.0495},
    "IN":{name:"Indiana",          type:"flat", rate:.0295},
    "IA":{name:"Iowa",             type:"flat", rate:.038},
    "KY":{name:"Kentucky",         type:"flat", rate:.035},
    "LA":{name:"Louisiana",        type:"flat", rate:.03},
    "MA":{name:"Massachusetts",    type:"flat", rate:.05},
    "MI":{name:"Michigan",         type:"flat", rate:.0425},
    "MS":{name:"Mississippi",      type:"flat", rate:.04},
    "NC":{name:"North Carolina",   type:"flat", rate:.0399},
    "OH":{name:"Ohio",             type:"flat", rate:.0275},
    "PA":{name:"Pennsylvania",     type:"flat", rate:.0307},
    "UT":{name:"Utah",             type:"flat", rate:.045},
    "AL":{name:"Alabama", type:"brackets", brackets:[
      {min:0,   max:500,  rate:.02},{min:500, max:3000, rate:.04},{min:3000,max:Infinity,rate:.05}
    ]},
    "AR":{name:"Arkansas", type:"brackets", brackets:[
      {min:0,max:4600,rate:.02},{min:4600,max:10000,rate:.039},{min:10000,max:50000,rate:.049},{min:50000,max:Infinity,rate:.059}
    ]},
    "CA":{name:"California", type:"brackets", brackets:[
      {min:0,max:10000,rate:.01},{min:10000,max:50000,rate:.02},{min:50000,max:100000,rate:.04},{min:100000,max:300000,rate:.06},{min:300000,max:600000,rate:.08},{min:600000,max:Infinity,rate:.093}
    ]},
    "CT":{name:"Connecticut", type:"brackets", brackets:[
      {min:0,max:10000,rate:.03},{min:10000,max:50000,rate:.05},{min:50000,max:100000,rate:.055},{min:100000,max:Infinity,rate:.0699}
    ]},
    "DE":{name:"Delaware", type:"brackets", brackets:[
      {min:0,max:20000,rate:.02},{min:20000,max:50000,rate:.04},{min:50000,max:Infinity,rate:.066}
    ]},
    "HI":{name:"Hawaii", type:"brackets", brackets:[
      {min:0,max:28000,rate:.014},{min:28000,max:54000,rate:.032},{min:54000,max:106000,rate:.068},{min:106000,max:Infinity,rate:.11}
    ]},
    "KS":{name:"Kansas", type:"brackets", brackets:[
      {min:0,max:15000,rate:.031},{min:15000,max:30000,rate:.05},{min:30000,max:Infinity,rate:.057}
    ]},
    "ME":{name:"Maine", type:"brackets", brackets:[
      {min:0,max:25000,rate:.058},{min:25000,max:66000,rate:.0675},{min:66000,max:Infinity,rate:.0715}
    ]},
    "MD":{name:"Maryland", type:"brackets", brackets:[
      {min:0,max:1000,rate:.02},{min:1000,max:2000,rate:.03},{min:2000,max:3000,rate:.04},{min:3000,max:100000,rate:.0475},{min:100000,max:Infinity,rate:.0575}
    ]},
    "MN":{name:"Minnesota", type:"brackets", brackets:[
      {min:0,max:28000,rate:.0535},{min:28000,max:88000,rate:.07},{min:88000,max:164400,rate:.0785},{min:164400,max:Infinity,rate:.0985}
    ]},
    "MO":{name:"Missouri", type:"brackets", brackets:[
      {min:0,max:3000,rate:.015},{min:3000,max:6000,rate:.025},{min:6000,max:Infinity,rate:.0495}
    ]},
    "MT":{name:"Montana", type:"brackets", brackets:[
      {min:0,max:40000,rate:.015},{min:40000,max:100000,rate:.06},{min:100000,max:Infinity,rate:.0665}
    ]},
    "NE":{name:"Nebraska", type:"brackets", brackets:[
      {min:0,max:35000,rate:.0246},{min:35000,max:60000,rate:.0514},{min:60000,max:Infinity,rate:.0655}
    ]},
    "NJ":{name:"New Jersey", type:"brackets", brackets:[
      {min:0,max:20000,rate:.014},{min:20000,max:50000,rate:.0175},{min:50000,max:70000,rate:.035},{min:70000,max:140000,rate:.05525},{min:140000,max:Infinity,rate:.1075}
    ]},
    "NM":{name:"New Mexico", type:"brackets", brackets:[
      {min:0,max:5500,rate:.017},{min:5500,max:16000,rate:.032},{min:16000,max:32000,rate:.047},{min:32000,max:Infinity,rate:.059}
    ]},
    "NY":{name:"New York", type:"brackets", brackets:[
      {min:0,max:8500,rate:.04},{min:8500,max:11700,rate:.045},{min:11700,max:13900,rate:.0525},{min:13900,max:21500,rate:.059},{min:21500,max:80000,rate:.0621},{min:80000,max:Infinity,rate:.0685}
    ]},
    "ND":{name:"North Dakota", type:"brackets", brackets:[
      {min:0,max:40000,rate:.011},{min:40000,max:100000,rate:.02},{min:100000,max:Infinity,rate:.025}
    ]},
    "OK":{name:"Oklahoma", type:"brackets", brackets:[
      {min:0,max:1000,rate:.0025},{min:1000,max:2500,rate:.0075},{min:2500,max:3500,rate:.03},{min:3500,max:5500,rate:.05},{min:5500,max:Infinity,rate:.0475}
    ]},
    "OR":{name:"Oregon", type:"brackets", brackets:[
      {min:0,max:3700,rate:.0475},{min:3700,max:9300,rate:.075},{min:9300,max:125000,rate:.09},{min:125000,max:Infinity,rate:.099}
    ]},
    "RI":{name:"Rhode Island", type:"brackets", brackets:[
      {min:0,max:70000,rate:.0375},{min:70000,max:150000,rate:.0475},{min:150000,max:Infinity,rate:.0599}
    ]},
    "SC":{name:"South Carolina", type:"brackets", brackets:[
      {min:0,max:3300,rate:0},{min:3300,max:16040,rate:.03},{min:16040,max:Infinity,rate:.06}
    ]},
    "VT":{name:"Vermont", type:"brackets", brackets:[
      {min:0,max:40000,rate:.0335},{min:40000,max:96000,rate:.066},{min:96000,max:Infinity,rate:.0875}
    ]},
    "VA":{name:"Virginia", type:"brackets", brackets:[
      {min:0,max:3000,rate:.02},{min:3000,max:5000,rate:.03},{min:5000,max:17000,rate:.05},{min:17000,max:Infinity,rate:.0575}
    ]},
    "WV":{name:"West Virginia", type:"brackets", brackets:[
      {min:0,max:10000,rate:.0236},{min:10000,max:25000,rate:.035},{min:25000,max:40000,rate:.04},{min:40000,max:Infinity,rate:.0512}
    ]},
    "WI":{name:"Wisconsin", type:"brackets", brackets:[
      {min:0,max:12000,rate:.0354},{min:12000,max:25000,rate:.0465},{min:25000,max:30000,rate:.0627},{min:30000,max:Infinity,rate:.0765}
    ]},
    "DC":{name:"Washington D.C.", type:"brackets", brackets:[
      {min:0,max:10000,rate:.04},{min:10000,max:40000,rate:.06},{min:40000,max:60000,rate:.065},{min:60000,max:250000,rate:.085},{min:250000,max:500000,rate:.0925},{min:500000,max:1000000,rate:.0975},{min:1000000,max:Infinity,rate:.1075}
    ]}
  }
};

// ============================================================
// CALCULATION ENGINE
// ============================================================
function applyBrackets(taxable, brackets) {
  let total = 0, margRate = 0;
  for (const b of brackets) {
    if (taxable <= b.min) break;
    const slice = Math.min(taxable, b.max === Infinity ? taxable : b.max) - b.min;
    if (slice <= 0) continue;
    total += slice * b.rate;
    margRate = b.rate;
  }
  return { total, margRate };
}

function calcFederal(agi, status, itemized) {
  const cfg = TAX_DATA.federal[status];
  const ded = Math.max(cfg.stdDed, itemized || 0);
  const taxable = Math.max(0, agi - ded);
  const { total, margRate } = applyBrackets(taxable, cfg.brackets);
  return { tax: total, taxable, ded, eff: agi > 0 ? total / agi : 0, marg: margRate, usedItemized: (itemized || 0) > cfg.stdDed };
}

function calcState(agi, code) {
  if (!code) return { tax: 0, rate: 0, name: 'N/A', noTax: true };
  const s = TAX_DATA.states[code];
  if (!s) return { tax: 0, rate: 0, name: code, noTax: true };
  if (s.type === 'none') return { tax: 0, rate: 0, name: s.name, noTax: true };
  if (s.type === 'flat') return { tax: agi * s.rate, rate: s.rate, name: s.name, noTax: false };
  const { total } = applyBrackets(agi, s.brackets);
  return { tax: total, rate: agi > 0 ? total / agi : 0, name: s.name, noTax: false };
}

function calcFICA(salary, status) {
  const ss = Math.min(salary, TAX_DATA.fica.ss.wageBase) * TAX_DATA.fica.ss.rate;
  const medBase = salary * TAX_DATA.fica.med.rate;
  const thresh = TAX_DATA.fica.med.threshold[status] || 200000;
  const medAddl = Math.max(0, salary - thresh) * TAX_DATA.fica.med.addlRate;
  return { ss, medicare: medBase + medAddl, total: ss + medBase + medAddl };
}

function runCalc(inputs) {
  const { salary, status, stateCode, pretax, itemized, withholding, sliderPct } = inputs;
  const adj = salary * (1 + (sliderPct || 0) / 100);
  const agi = Math.max(0, adj - (pretax || 0));
  const fed = calcFederal(agi, status || 'single', itemized || 0);
  const sta = calcState(agi, stateCode);
  const fica = calcFICA(adj, status || 'single');
  const total = fed.tax + sta.tax + fica.total;
  const refund = (withholding || 0) - total;
  return {
    salary: adj, agi,
    fed: { ...fed, tax: fed.tax },
    sta, fica,
    total, withholding: withholding || 0,
    refund, netIncome: adj - total,
    effTotal: adj > 0 ? total / adj : 0
  };
}

// ============================================================
// APP STATE
// ============================================================
let state = {
  mode: 'yearly',
  period: 'annual',
  compareMode: false,
  activeScenario: 'A',
  scenarios: { A: {}, B: {} },
  savedScenarios: JSON.parse(localStorage.getItem('qte-scenarios') || '[]'),
  lastResult: null,
  forumPosts: JSON.parse(localStorage.getItem('qte-forum') || 'null') || getDefaultPosts(),
  likeCounts: JSON.parse(localStorage.getItem('qte-likes') || '{}')
};

function getDefaultPosts() {
  return [
    { id: 1, user: 'TaxNovice92', q: 'Should I always take the standard deduction or is itemizing ever worth it?', time: '2h ago', likes: 14, color: '#1A73E8' },
    { id: 2, user: 'FreelancerMike', q: 'How do self-employment taxes work if I have both a W-2 job and freelance income?', time: '5h ago', likes: 8, color: '#E67E22' },
    { id: 3, user: 'RetireSoon', q: 'At what point does contributing to a Traditional IRA make more sense than Roth?', time: '1d ago', likes: 22, color: '#27AE60' },
  ];
}

// ============================================================
// POPULATE STATES DROPDOWN
// ============================================================
function populateStates() {
  const sel = document.getElementById('inp-state');
  const sorted = Object.entries(TAX_DATA.states).sort((a,b) => a[1].name.localeCompare(b[1].name));
  sorted.forEach(([code, data]) => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = `${data.name}${data.type === 'none' ? ' (No Income Tax)' : ''}`;
    sel.appendChild(opt);
  });
}

// ============================================================
// INPUT HANDLING
// ============================================================
function getInputs() {
  let salary = parseFloat(document.getElementById('inp-salary').value) || 0;
  if (state.mode === 'monthly') salary *= 12;
  return {
    salary,
    status: document.getElementById('inp-status').value,
    stateCode: document.getElementById('inp-state').value,
    pretax: parseFloat(document.getElementById('inp-pretax').value) || 0,
    itemized: parseFloat(document.getElementById('inp-itemized').value) || 0,
    withholding: parseFloat(document.getElementById('inp-withhold').value) || 0,
    sliderPct: parseInt(document.getElementById('inp-slider').value) || 0
  };
}

function onInput() {
  const inputs = getInputs();
  if (state.compareMode) {
    state.scenarios[state.activeScenario] = inputs;
  }
  const result = runCalc(inputs);
  state.lastResult = { inputs, result };
  renderResults(result, inputs);
  renderTips(inputs, result);
  if (state.compareMode) renderCompare();
}

function setMode(m) {
  state.mode = m;
  document.getElementById('tog-yr').classList.toggle('active', m === 'yearly');
  document.getElementById('tog-mo').classList.toggle('active', m === 'monthly');
  document.getElementById('salary-label').textContent = m === 'yearly' ? 'Annual Salary' : 'Monthly Salary';
  onInput();
}

function togglePeriod() {
  state.period = state.period === 'annual' ? 'monthly' : 'annual';
  document.getElementById('period-tog-btn').textContent = state.period === 'annual' ? 'Annual →' : 'Monthly →';
  if (state.lastResult) renderResults(state.lastResult.result, state.lastResult.inputs);
}

function onSlider(val) {
  const pct = parseInt(val);
  const display = pct === 0 ? '0%' : (pct > 0 ? `+${pct}%` : `${pct}%`);
  document.getElementById('slider-display').textContent = display;
  const baseSalary = parseFloat(document.getElementById('inp-salary').value) || 0;
  const adjSalary = state.mode === 'monthly'
    ? baseSalary * 12 * (1 + pct / 100)
    : baseSalary * (1 + pct / 100);
  const adjEl = document.getElementById('adj-salary-display');
  const adjValEl = document.getElementById('adj-salary-val');
  if (pct !== 0 && baseSalary > 0) {
    adjEl.style.display = 'block';
    adjValEl.textContent = fmt(adjSalary);
  } else {
    adjEl.style.display = 'none';
  }
  onInput();
}

// ============================================================
// RENDER RESULTS
// ============================================================
const fmt = n => '$' + Math.round(n).toLocaleString('en-US');
const fmtD = n => '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const pct = n => (n * 100).toFixed(1) + '%';

function val(r, annual) {
  return state.period === 'monthly' ? Math.round(annual / 12) : Math.round(annual);
}
function fmtV(r, annual) { return fmt(val(r, annual)); }

function renderResults(r, inputs) {
  const isM = state.period === 'monthly';
  set('r-eff', pct(r.effTotal));
  set('r-marg', pct(r.fed.marg));
  set('r-taxable', fmt(r.agi));
  const maxBar = r.salary > 0 ? r.salary : 1;
  setBar('bc-fed-bar', (r.fed.tax / maxBar * 100).toFixed(1));
  set('bc-fed-pct', (r.fed.tax / maxBar * 100).toFixed(1) + '%');
  setBar('bc-sta-bar', (r.sta.tax / maxBar * 100).toFixed(1));
  set('bc-sta-pct', (r.sta.tax / maxBar * 100).toFixed(1) + '%');
  setBar('bc-fic-bar', (r.fica.total / maxBar * 100).toFixed(1));
  set('bc-fic-pct', (r.fica.total / maxBar * 100).toFixed(1) + '%');
  set('bd-fed', fmt(r.fed.tax));
  set('bd-fed-sub', `${pct(r.fed.eff)} effective · ${pct(r.fed.marg)} marginal`);
  set('bd-sta', fmt(r.sta.tax));
  set('bd-sta-sub', r.sta.noTax ? 'No state income tax' : `${r.sta.name} · ${pct(r.sta.rate)} eff.`);
  set('bd-ss', fmt(r.fica.ss));
  set('bd-med', fmt(r.fica.medicare));
  const dedBadge = document.getElementById('deduction-badge');
  if (dedBadge) dedBadge.textContent = r.fed.usedItemized
    ? `✓ Using itemized deduction (${fmt(r.fed.ded)})`
    : `✓ Standard deduction: ${fmt(r.fed.ded)}`;
  renderIceberg(r, inputs);
}

// ──────────────────────────────────────────────────────────
//  ICEBERG RENDERER
// ──────────────────────────────────────────────────────────
function renderIceberg(r, inputs) {
  const isM = state.period === 'monthly';
  const div = isM ? 12 : 1;
  const netDisplay = fmt(Math.round(r.netIncome / div));
  animateEl('ice-net', netDisplay);
  set('ice-net-mo', isM ? '/ month' : `~${fmt(Math.round(r.netIncome/12))} / month`);
  const gross = r.salary > 0 ? r.salary : 1;
  const netPct  = Math.max(3, Math.min(97, r.netIncome / gross * 100));
  const taxPct  = 100 - netPct;
  if (r.salary > 0) {
    const wHalfW = 130;
    const wL = 450 - wHalfW; const wR = 450 + wHalfW;
    const tipTopY  = Math.round(Math.max(10, 120 - (netPct / 100) * 100));
    const tipHalfW = Math.round(Math.max(20, (netPct / 100) * 80));
    const tL = 450 - tipHalfW; const tR = 450 + tipHalfW;
    const tipEl = document.getElementById('ice-tip-poly');
    if (tipEl) tipEl.setAttribute('points', `${tL},${tipTopY} ${tR},${tipTopY} ${wR},120 ${wL},120`);
    const bodyDepthY = Math.round(Math.min(255, 120 + (taxPct / 100) * 128));
    const bodySpread = Math.round((taxPct / 100) * 80);
    const bL = wL - bodySpread; const bR = wR + bodySpread;
    const bodyEl = document.getElementById('ice-body-poly');
    if (bodyEl) bodyEl.setAttribute('points', `${wL},120 ${wR},120 ${bR},${bodyDepthY} ${bL},${bodyDepthY}`);
  }
  set('ice-ov-net', fmt(Math.round(r.netIncome / div)));
  set('ice-ov-net-pct', '(' + netPct.toFixed(0) + '%)');
  set('ice-ov-tax', fmt(Math.round(r.total      / div)));
  set('ice-ov-tax-pct', '(' + taxPct.toFixed(0) + '%)');
  set('ice-eff',  pct(r.effTotal));
  set('ice-marg', pct(r.fed.marg));
  set('ice-agi',  fmt(r.agi));
  const pill = document.getElementById('ice-refund-pill');
  const ico  = document.getElementById('ice-refund-icon');
  const lbl  = document.getElementById('ice-refund-label');
  if (r.withholding === 0) {
    pill.className = 'ice-refund-badge green';
    ico.textContent = '📊';
    lbl.textContent = `Est. Tax: ${fmt(Math.round(r.total / div))}`;
  } else if (r.refund >= 0) {
    pill.className = 'ice-refund-badge green';
    ico.textContent = '💚';
    lbl.textContent = `Estimated Refund: ${fmt(r.refund)}`;
  } else {
    pill.className = 'ice-refund-badge red';
    ico.textContent = '⚠️';
    lbl.textContent = `Est. Amount Owed: ${fmt(Math.abs(r.refund))}`;
  }
  const fedAmt  = Math.round(r.fed.tax    / div);
  const staAmt  = Math.round(r.sta.tax    / div);
  const ficaAmt = Math.round(r.fica.total / div);
  const totAmt  = Math.round(r.total      / div);
  animateEl('ice-fed',  fmt(fedAmt));
  animateEl('ice-sta',  fmt(staAmt));
  animateEl('ice-fica', fmt(ficaAmt));
  animateEl('ice-total',fmt(totAmt));
  set('ice-fed-sub',  `${pct(r.fed.eff)} effective · ${pct(r.fed.marg)} marginal bracket`);
  set('ice-sta-sub',  r.sta.noTax ? `${r.sta.name} — no state income tax` : `${r.sta.name} · ${pct(r.sta.rate)} effective`);
  set('ice-fica-sub', `SS: ${fmt(r.fica.ss)} · Medicare: ${fmt(r.fica.medicare)}`);
  set('ice-total-sub',`${pct(r.effTotal)} of gross salary · ${pct(1 - r.effTotal)} you keep`);
  const maxSeg = gross;
  setBar('ice-fed-bar',  (r.fed.tax    / maxSeg * 100).toFixed(1));
  setBar('ice-sta-bar',  (r.sta.tax    / maxSeg * 100).toFixed(1));
  setBar('ice-fica-bar', (r.fica.total / maxSeg * 100).toFixed(1));
  setBar('ice-total-bar',(r.total      / maxSeg * 100).toFixed(1));
  set('ice-fed-pct',  (r.fed.tax    / maxSeg * 100).toFixed(1) + '%');
  set('ice-sta-pct',  (r.sta.tax    / maxSeg * 100).toFixed(1) + '%');
  set('ice-fica-pct', (r.fica.total / maxSeg * 100).toFixed(1) + '%');
  set('ice-total-pct',(r.total      / maxSeg * 100).toFixed(1) + '%');
  const ctxEl = document.getElementById('ice-context-text');
  if (ctxEl && r.salary > 0) {
    const keepDollars = Math.round(r.netIncome);
    const taxDollars  = Math.round(r.total);
    const perHour     = (keepDollars / 2080).toFixed(2);
    const perDollar   = r.salary > 0 ? (r.total / r.salary * 100).toFixed(1) : 0;
    ctxEl.innerHTML = `For every <strong>$100</strong> you earn, <strong style="color:#4ade80">$${(100 - parseFloat(perDollar)).toFixed(1)}</strong> stays in your pocket and <strong style="color:#f87171">$${perDollar}</strong> goes to taxes. Your take-home is <strong>${fmt(keepDollars)}/yr</strong> — roughly <strong>$${perHour}/hr</strong>.`;
  } else if (ctxEl) {
    ctxEl.innerHTML = '⚓ Enter your salary above to reveal your tax iceberg.';
  }
  set('ice-salary-pill', fmt(r.salary));
  set('ice-ss-pill',     fmt(r.fica.ss));
  set('ice-med-pill',    fmt(r.fica.medicare));
}

function set(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function setBar(id, pct) { const el = document.getElementById(id); if (el) el.style.width = Math.min(100, pct) + '%'; }
function animateEl(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = val;
  el.classList.remove('pop-anim');
  void el.offsetWidth;
  el.classList.add('pop-anim');
}

// ============================================================
// TIPS
// ============================================================
function renderTips(inputs, results) {
  const tipsEl = document.getElementById('tips-list');
  const count = document.getElementById('tips-count');
  if (!inputs.salary || inputs.salary === 0) {
    tipsEl.innerHTML = '<div class="empty-msg">Enter your salary above to get personalized tips.</div>';
    count.textContent = '';
    return;
  }
  const tips = generateTips(inputs, results);
  count.textContent = `${tips.length} tip${tips.length !== 1 ? 's' : ''}`;
  tipsEl.innerHTML = tips.map(t => `
    <div class="tip-item">
      <div class="tip-ico">${t.icon}</div>
      <div>
        <div class="tip-t">${t.title}</div>
        <div class="tip-b">${t.body}</div>
        <span class="tip-tag tt-${t.priority}">${t.priority} priority</span>
      </div>
    </div>
  `).join('');
}

function generateTips(inputs, r) {
  const tips = [];
  const { salary, pretax, itemized, status } = inputs;
  const stdDed = TAX_DATA.federal[status || 'single'].stdDed;
  const annualSalary = salary;
  if ((pretax || 0) < 23000) {
    const room = 23000 - (pretax || 0);
    tips.push({ icon: '📈', title: 'Maximize 401(k) Contributions', body: `You can contribute up to $23,000/yr pre-tax. Adding $${Math.min(room, 5000).toLocaleString()} more could save ~$${Math.round(Math.min(room, 5000) * r.fed.eff).toLocaleString()} in federal tax.`, priority: room > 10000 ? 'high' : 'medium' });
  }
  if (annualSalary > 30000) {
    tips.push({ icon: '🏥', title: 'Open an HSA Account', body: 'Health Savings Accounts allow pre-tax contributions ($4,150 single / $8,300 family in 2024). Triple tax advantage — contributions, growth, and withdrawals for medical expenses are all tax-free.', priority: 'medium' });
  }
  if ((itemized || 0) < stdDed && annualSalary > 60000) {
    tips.push({ icon: '📋', title: 'Bundle Deductions to Exceed Standard Threshold', body: `Your itemized deductions (${fmt(itemized||0)}) are below the ${fmt(stdDed)} standard deduction. Consider bunching charitable donations or prepaying deductible expenses to exceed the standard deduction in alternating years.`, priority: 'medium' });
  }
  if (annualSalary > 100000) {
    tips.push({ icon: '💰', title: 'Backdoor Roth IRA', body: `High earners above Roth IRA income limits can use the backdoor strategy: contribute to a Traditional IRA (up to $7,000) then convert to Roth for tax-free growth.`, priority: annualSalary > 150000 ? 'high' : 'medium' });
  }
  if (annualSalary > 150000) {
    tips.push({ icon: '📉', title: 'Tax-Loss Harvesting', body: 'Offset capital gains by strategically selling investments at a loss before year-end. Up to $3,000 in net losses can be deducted against ordinary income annually.', priority: 'low' });
  }
  if (status === 'mfj' || status === 'hoh') {
    tips.push({ icon: '👨‍👩‍👧', title: 'Claim All Dependent Credits', body: 'Check eligibility for the Child Tax Credit ($2,000/child), Dependent Care Credit, and the Earned Income Tax Credit. These directly reduce your tax bill, not just taxable income.', priority: 'high' });
  }
  if (annualSalary > 200000) {
    tips.push({ icon: '🏦', title: 'Qualified Opportunity Zone Investment', body: 'Investing capital gains into a Qualified Opportunity Fund can defer and potentially reduce capital gains taxes while supporting community development projects.', priority: 'low' });
  }
  const order = { high: 0, medium: 1, low: 2 };
  return tips.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 5);
}

// ============================================================
// SAVED SCENARIOS
// ============================================================
function saveScenario() {
  const inputs = getInputs();
  if (!inputs.salary) { alert('Please enter a salary first.'); return; }
  const name = prompt('Name this scenario (e.g., "Current Job", "New Offer"):', `Scenario ${state.savedScenarios.length + 1}`);
  if (!name) return;
  const result = runCalc(inputs);
  state.savedScenarios.push({ name, inputs, totalTax: result.total, netIncome: result.netIncome, ts: Date.now() });
  localStorage.setItem('qte-scenarios', JSON.stringify(state.savedScenarios));
  renderSavedList();
}

function loadScenario(idx) {
  const s = state.savedScenarios[idx];
  if (!s) return;
  const i = s.inputs;
  const salary = state.mode === 'monthly' ? i.salary / 12 : i.salary;
  document.getElementById('inp-salary').value = salary || '';
  document.getElementById('inp-status').value = i.status || 'single';
  document.getElementById('inp-state').value = i.stateCode || '';
  document.getElementById('inp-pretax').value = i.pretax || '';
  document.getElementById('inp-itemized').value = i.itemized || '';
  document.getElementById('inp-withhold').value = i.withholding || '';
  document.getElementById('inp-slider').value = i.sliderPct || 0;
  onSlider(i.sliderPct || 0);
  onInput();
}

function deleteScenario(idx, e) {
  e.stopPropagation();
  if (!confirm('Delete this scenario?')) return;
  state.savedScenarios.splice(idx, 1);
  localStorage.setItem('qte-scenarios', JSON.stringify(state.savedScenarios));
  renderSavedList();
}

function renderSavedList() {
  const el = document.getElementById('saved-list');
  if (!state.savedScenarios.length) {
    el.innerHTML = '<div class="empty-msg">No saved scenarios yet.</div>';
    return;
  }
  el.innerHTML = state.savedScenarios.map((s, i) => `
    <div class="saved-item" onclick="loadScenario(${i})">
      <span class="si-name">${s.name}</span>
      <span class="si-val">${fmt(s.totalTax)} tax · ${fmt(s.netIncome)} net</span>
      <span class="si-del" onclick="deleteScenario(${i}, event)">×</span>
    </div>
  `).join('');
}

// ============================================================
// COMPARE MODE
// ============================================================
let compareActive = false;

function toggleCompare() {
  compareActive = !compareActive;
  document.getElementById('compare-tabs').style.display = compareActive ? 'flex' : 'none';
  document.getElementById('compare-panel').style.display = compareActive ? 'block' : 'none';
  document.getElementById('compare-btn-text').textContent = compareActive ? 'Exit Compare' : 'Compare Mode';
  if (compareActive) {
    state.scenarios.A = getInputs();
    setScenario('A');
  }
}

function setScenario(s) {
  state.activeScenario = s;
  document.getElementById('tab-a').classList.toggle('active', s === 'A');
  document.getElementById('tab-b').classList.toggle('active', s === 'B');
  const saved = state.scenarios[s];
  if (saved && saved.salary !== undefined) {
    const salary = state.mode === 'monthly' ? saved.salary / 12 : saved.salary;
    document.getElementById('inp-salary').value = salary || '';
    document.getElementById('inp-status').value = saved.status || 'single';
    document.getElementById('inp-state').value = saved.stateCode || '';
    document.getElementById('inp-pretax').value = saved.pretax || '';
    document.getElementById('inp-withhold').value = saved.withholding || '';
    document.getElementById('inp-slider').value = saved.sliderPct || 0;
    onSlider(saved.sliderPct || 0);
    onInput();
  }
}

function renderCompare() {
  const tbl = document.getElementById('compare-table');
  const a = state.scenarios.A, b = state.scenarios.B;
  if (!a?.salary || !b?.salary) {
    tbl.innerHTML = '<div class="empty-msg">Fill in both Scenario A and B to compare.</div>';
    return;
  }
  const ra = runCalc(a), rb = runCalc(b);
  const rows = [
    ['Gross Salary', ra.salary, rb.salary],
    ['Federal Tax', ra.fed.tax, rb.fed.tax],
    ['State Tax', ra.sta.tax, rb.sta.tax],
    ['FICA', ra.fica.total, rb.fica.total],
    ['Total Tax', ra.total, rb.total],
    ['Take-Home', ra.netIncome, rb.netIncome],
    ['Effective Rate', ra.effTotal, rb.effTotal, true],
  ];
  tbl.innerHTML = `
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr style="border-bottom:1px solid var(--border2)">
        <th style="text-align:left;padding:6px 0;color:var(--muted);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.04em"></th>
        <th style="text-align:right;padding:6px 0;color:var(--blue);font-weight:700">Scenario A</th>
        <th style="text-align:right;padding:6px 0;color:var(--gp);font-weight:700">Scenario B</th>
        <th style="text-align:right;padding:6px 0;color:var(--muted);font-weight:600;font-size:11px">Diff</th>
      </tr></thead>
      <tbody>
        ${rows.map(([label, va, vb, isPct]) => {
          const diff = vb - va;
          const diffStr = isPct ? (diff >= 0 ? '+' : '') + (diff * 100).toFixed(1) + '%' : (diff >= 0 ? '+' : '') + fmt(diff);
          const diffColor = label === 'Take-Home'
            ? (diff > 0 ? 'var(--green)' : diff < 0 ? 'var(--red)' : 'var(--faint)')
            : (diff > 0 ? 'var(--red)' : diff < 0 ? 'var(--green)' : 'var(--faint)');
          return `<tr style="border-bottom:1px solid var(--border2)">
            <td style="padding:8px 0;color:var(--body);font-weight:500">${label}</td>
            <td style="text-align:right;padding:8px 0;font-weight:600;color:var(--text)">${isPct ? pct(va) : fmt(va)}</td>
            <td style="text-align:right;padding:8px 0;font-weight:600;color:var(--text)">${isPct ? pct(vb) : fmt(vb)}</td>
            <td style="text-align:right;padding:8px 0;font-weight:700;color:${diffColor}">${diff !== 0 ? diffStr : '—'}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

// ============================================================
// DOWNLOAD / PRINT / SHARE
// ============================================================
function downloadPDF() {
  const r = state.lastResult;
  if (!r) { alert('Please calculate your taxes first.'); return; }
  const { inputs, result } = r;
  const tips = generateTips(inputs, result).map(t => `  • ${t.title}: ${t.body}`).join('\n\n');
  const stateInfo = TAX_DATA.states[inputs.stateCode];
  const content = `
QUICK TAX ESTIMATOR — 2024 TAX YEAR REPORT
Generated: ${new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
${'='.repeat(60)}

INPUT SUMMARY
${'─'.repeat(40)}
Gross Annual Salary:     ${fmt(result.salary)}
Adjusted Gross Income:   ${fmt(result.agi)}
Filing Status:           ${{ single:'Single', mfj:'Married Filing Jointly', hoh:'Head of Household' }[inputs.status]}
State:                   ${stateInfo?.name || 'N/A'}
Pre-tax Contributions:   ${fmt(inputs.pretax)}
Itemized Deductions:     ${fmt(inputs.itemized)} (${result.fed.usedItemized ? 'Used' : 'Standard deduction used: ' + fmt(result.fed.ded)})
Tax Withholding:         ${fmt(inputs.withholding)}

TAX BREAKDOWN
${'─'.repeat(40)}
Federal Income Tax:      ${fmt(result.fed.tax)}
  Effective Rate:        ${pct(result.fed.eff)}
  Marginal Bracket:      ${pct(result.fed.marg)}
  Deduction Used:        ${fmt(result.fed.ded)}
State Income Tax:        ${fmt(result.sta.tax)}
  State:                 ${result.sta.name}
  Rate:                  ${pct(result.sta.rate)}
FICA Taxes:              ${fmt(result.fica.total)}
  Social Security:       ${fmt(result.fica.ss)} (6.2% on first $168,600)
  Medicare:              ${fmt(result.fica.medicare)} (1.45% + 0.9% above threshold)
${'─'.repeat(40)}
TOTAL TAX:               ${fmt(result.total)}
EFFECTIVE TOTAL RATE:    ${pct(result.effTotal)}

WITHHOLDING ANALYSIS
${'─'.repeat(40)}
Estimated Total Tax:     ${fmt(result.total)}
Total Withholding:       ${fmt(inputs.withholding)}
${result.refund >= 0 ? 'Estimated REFUND:' : 'Estimated OWED:  '}        ${fmt(Math.abs(result.refund))}

ESTIMATED TAKE-HOME PAY
${'─'.repeat(40)}
Annual Take-Home:        ${fmt(result.netIncome)}
Monthly Take-Home:       ${fmt(result.netIncome / 12)}
Biweekly Take-Home:      ${fmt(result.netIncome / 26)}

PERSONALIZED TAX-SAVING TIPS
${'─'.repeat(40)}
${tips}

${'='.repeat(60)}
DISCLAIMER: This report is for estimation purposes only.
Not affiliated with the IRS or any government agency.
ToolKit Pro
${'='.repeat(60)}
`.trim();
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `QuickTax-Report-${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function shareResultsFab(btn) {
  const r = state.lastResult;
  if (!r) { alert('Calculate your taxes first!'); return; }
  const text = `My 2024 US tax estimate:\n💰 Total Tax: ${fmt(r.result.total)}\n📊 Effective Rate: ${pct(r.result.effTotal)}\n🏠 Take-Home: ${fmt(r.result.netIncome)}\n\nCalculated with ToolKit Pro`;
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    btn.querySelector('svg').outerHTML = '';
    btn.textContent = '✓ Copied!';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="3" r="2"/><circle cx="5" cy="8" r="2"/><circle cx="11" cy="13" r="2"/><line x1="7" y1="6.5" x2="9.5" y2="4.5"/><line x1="7" y1="9.5" x2="9.5" y2="11.5"/></svg>Share`;
    }, 2500);
  }).catch(() => {
    if (navigator.share) navigator.share({ title: 'My Tax Estimate', text }).catch(()=>{});
  });
}

function downloadPDFStyled(btn) {
  const card = document.getElementById('download-card-el');
  if (card) { card.classList.add('dl-success'); setTimeout(() => card.classList.remove('dl-success'), 800); }
  const orig = btn.textContent;
  btn.textContent = '⏳ Generating…'; btn.disabled = true;
  setTimeout(() => { downloadPDF(); btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12v2h12v-2M8 2v8M5 7l3 3 3-3"/></svg>Download'; btn.disabled = false; }, 600);
}

function printReport(btn) {
  const r = state.lastResult;
  if (!r) { alert('Please calculate your taxes first.'); return; }
  const card = document.getElementById('download-card-el');
  if (card) { card.classList.add('dl-success'); setTimeout(() => card.classList.remove('dl-success'), 800); }
  const orig = btn.innerHTML;
  btn.textContent = '⏳ Preparing…'; btn.disabled = true;
  setTimeout(() => { window.print(); btn.innerHTML = orig; btn.disabled = false; }, 400);
}

function clearInputs() {
  ['inp-salary','inp-pretax','inp-withhold','inp-itemized'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('inp-status').value = 'single';
  document.getElementById('inp-state').value = '';
  document.getElementById('inp-slider').value = 0;
  onSlider(0);
  onInput();
}

// ============================================================
// COMMUNITY FORUM
// ============================================================
function renderForum() {
  const list = document.getElementById('forum-list');
  if (!list) return;
  const colors = ['#1A73E8','#E67E22','#27AE60','#9B59B6','#E74C3C','#2980B9','#F39C12'];
  list.innerHTML = state.forumPosts.map(p => {
    const initials = p.user.slice(0,2).toUpperCase();
    const color = p.color || colors[p.id % colors.length];
    const likes = state.likeCounts[p.id] !== undefined ? state.likeCounts[p.id] : p.likes;
    return `
      <div class="fp">
        <div class="fp-hd">
          <div class="fp-av" style="background:${color}">${initials}</div>
          <span class="fp-nm">${p.user}</span>
          <span class="fp-tm">${p.time}</span>
        </div>
        <div class="fp-q">${p.q}</div>
        <div class="fp-lk" onclick="likePost(${p.id}, this)">
          👍 ${likes} ${likes === 1 ? 'like' : 'likes'} · Click to upvote
        </div>
      </div>`;
  }).join('');
}

function postQuestion() {
  if (!currentUser) { openModal('auth'); return; }
  const inp = document.getElementById('forum-input');
  const q = inp.value.trim();
  if (!q) return;
  const colors = ['#1A73E8','#E67E22','#27AE60','#9B59B6','#E74C3C'];
  const newPost = { id: Date.now(), user: currentUser.name, q, time: 'just now', likes: 0, color: colors[Math.floor(Math.random() * colors.length)] };
  state.forumPosts.unshift(newPost);
  localStorage.setItem('qte-forum', JSON.stringify(state.forumPosts.slice(0, 20)));
  inp.value = '';
  renderForum();
}

function likePost(id) {
  const current = state.likeCounts[id] !== undefined
    ? state.likeCounts[id]
    : (state.forumPosts.find(p => p.id === id)?.likes || 0);
  state.likeCounts[id] = current + 1;
  localStorage.setItem('qte-likes', JSON.stringify(state.likeCounts));
  renderForum();
}

// ============================================================
// FAQ
// ============================================================
const FAQ_DATA = [
  { q: 'How much tax will I pay on my salary in the US?', a: 'The amount of tax you pay depends on your total annual income, filing status, and the state you live in. The US uses a progressive tax system, meaning different portions of your income are taxed at different rates. In addition to federal income tax, you may also pay state income tax and payroll taxes (Social Security and Medicare). This tool combines all these factors to give you an instant estimate of your total tax liability and expected refund or amount owed.' },
  { q: 'How do I calculate my federal income tax quickly?', a: 'Federal income tax is calculated using tax brackets set by the IRS. Each portion of your income falls into a specific bracket and is taxed at a corresponding rate — the first portion at a lower rate, and higher income portions at higher rates. Manually calculating this can be confusing, especially when deductions are involved. This estimator automatically applies the correct brackets and deductions to give you an accurate result instantly.' },
  { q: 'How much state tax do I pay based on where I live?', a: 'State income tax varies significantly across the US. Some states like Texas and Florida charge no state income tax, while others like California and New York have multiple brackets with higher rates. Your state tax depends on your taxable income and your state\'s specific rules. This tool uses your selected state to apply the correct tax structure, helping you understand how location impacts your total tax burden.' },
  { q: 'How can I reduce my taxable income legally in the US?', a: 'There are several legal ways to reduce your taxable income. Contributing to pre-tax accounts such as a 401(k), IRA, or Health Savings Account (HSA) reduces your taxable income before taxes are calculated. You can also benefit from the standard deduction or itemized deductions like mortgage interest and charitable donations. Tax credits like the Child Tax Credit directly reduce your tax owed. Use the what-if slider in this tool to test different contribution scenarios.' },
  { q: 'What is the difference between taxable income and gross income?', a: 'Gross income is the total amount you earn before any deductions or taxes — including salary, bonuses, and additional income. Taxable income is what remains after subtracting deductions and adjustments such as retirement contributions or the standard deduction. Taxes are calculated only on your taxable (reduced) amount. Lowering your taxable income is one of the most effective ways to reduce your overall taxes.' },
  { q: 'Why is my tax refund or amount owed changing?', a: 'Your refund or amount owed is the difference between the total tax you owe and the amount already withheld from your paycheck throughout the year. If your income increases, deductions change, or withholding is adjusted, your final tax outcome changes too. Even small changes in salary or contributions can affect your refund. This estimator updates results instantly so you can see how different decisions impact your tax position.' },
  { q: 'How accurate is an online tax calculator?', a: 'Online tax calculators provide a close estimate based on standard federal and state tax rules. They are very useful for planning and understanding your tax situation. However, actual results may vary depending on additional factors such as specific tax credits, exemptions, investments, or unique financial situations. For final filing, always use certified tax software or consult a qualified CPA or tax professional.' },
  { q: 'Do I need to pay state tax if I work remotely in another state?', a: 'State tax rules for remote work can be complex. In many cases you pay taxes in the state where you live (your state of residence). However, some states may also require taxes based on where your employer is located. Certain states have reciprocity agreements to avoid double taxation, but this is not universal. If you work remotely across state lines, consult a tax expert for your specific filing requirements.' }
];

function renderFAQ() {
  const container = document.getElementById('faq-section');
  if (!container) return;
  container.innerHTML = FAQ_DATA.map((item, i) => `
    <div class="faq-item" id="faq-${i}" onclick="toggleFAQ(${i})">
      <div class="faq-q">
        <span class="faq-q-text">${item.q}</span>
        <span class="faq-chevron">&#9660;</span>
      </div>
      <div class="faq-a">${item.a}</div>
    </div>
  `).join('');
}

function toggleFAQ(i) {
  const item = document.getElementById('faq-' + i);
  if (item) item.classList.toggle('open');
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  populateStates();
  renderSavedList();
  renderForum();
  renderFAQ();
  updateAuthUI();
  document.getElementById('inp-salary').value = 85000;
  document.getElementById('inp-state').value = 'CA';
  document.getElementById('inp-withhold').value = 18000;
  onInput();
});
