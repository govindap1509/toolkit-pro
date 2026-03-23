// ============================================================
//  HOME SOLAR PLANNER — JS ENGINE
//  All state-wise rates, calculations, chart, download
// ============================================================

// ── STATE ELECTRICITY RATES ($/kWh, 2024 EIA data) ──────────
const SOLAR_STATE_DATA = {
  "Alabama":        { rate: 0.13, sunlight: "high",   production: 1500 },
  "Alaska":         { rate: 0.24, sunlight: "low",    production: 1100 },
  "Arizona":        { rate: 0.14, sunlight: "high",   production: 1700 },
  "Arkansas":       { rate: 0.12, sunlight: "medium", production: 1400 },
  "California":     { rate: 0.30, sunlight: "high",   production: 1600 },
  "Colorado":       { rate: 0.14, sunlight: "high",   production: 1550 },
  "Connecticut":    { rate: 0.27, sunlight: "medium", production: 1350 },
  "Delaware":       { rate: 0.15, sunlight: "medium", production: 1400 },
  "Florida":        { rate: 0.13, sunlight: "high",   production: 1550 },
  "Georgia":        { rate: 0.13, sunlight: "high",   production: 1500 },
  "Hawaii":         { rate: 0.40, sunlight: "high",   production: 1700 },
  "Idaho":          { rate: 0.11, sunlight: "medium", production: 1400 },
  "Illinois":       { rate: 0.15, sunlight: "medium", production: 1350 },
  "Indiana":        { rate: 0.14, sunlight: "medium", production: 1350 },
  "Iowa":           { rate: 0.13, sunlight: "medium", production: 1400 },
  "Kansas":         { rate: 0.13, sunlight: "high",   production: 1500 },
  "Kentucky":       { rate: 0.12, sunlight: "medium", production: 1350 },
  "Louisiana":      { rate: 0.12, sunlight: "high",   production: 1500 },
  "Maine":          { rate: 0.24, sunlight: "low",    production: 1250 },
  "Maryland":       { rate: 0.16, sunlight: "medium", production: 1400 },
  "Massachusetts":  { rate: 0.29, sunlight: "medium", production: 1350 },
  "Michigan":       { rate: 0.17, sunlight: "low",    production: 1300 },
  "Minnesota":      { rate: 0.15, sunlight: "low",    production: 1300 },
  "Mississippi":    { rate: 0.12, sunlight: "high",   production: 1500 },
  "Missouri":       { rate: 0.13, sunlight: "medium", production: 1400 },
  "Montana":        { rate: 0.12, sunlight: "medium", production: 1400 },
  "Nebraska":       { rate: 0.12, sunlight: "high",   production: 1500 },
  "Nevada":         { rate: 0.15, sunlight: "high",   production: 1700 },
  "New Hampshire":  { rate: 0.26, sunlight: "low",    production: 1300 },
  "New Jersey":     { rate: 0.18, sunlight: "medium", production: 1350 },
  "New Mexico":     { rate: 0.14, sunlight: "high",   production: 1700 },
  "New York":       { rate: 0.25, sunlight: "medium", production: 1350 },
  "North Carolina": { rate: 0.13, sunlight: "high",   production: 1450 },
  "North Dakota":   { rate: 0.12, sunlight: "medium", production: 1400 },
  "Ohio":           { rate: 0.15, sunlight: "medium", production: 1350 },
  "Oklahoma":       { rate: 0.13, sunlight: "high",   production: 1500 },
  "Oregon":         { rate: 0.14, sunlight: "low",    production: 1250 },
  "Pennsylvania":   { rate: 0.16, sunlight: "medium", production: 1350 },
  "Rhode Island":   { rate: 0.27, sunlight: "medium", production: 1350 },
  "South Carolina": { rate: 0.14, sunlight: "high",   production: 1500 },
  "South Dakota":   { rate: 0.13, sunlight: "medium", production: 1450 },
  "Tennessee":      { rate: 0.13, sunlight: "medium", production: 1400 },
  "Texas":          { rate: 0.14, sunlight: "high",   production: 1600 },
  "Utah":           { rate: 0.13, sunlight: "high",   production: 1600 },
  "Vermont":        { rate: 0.24, sunlight: "low",    production: 1300 },
  "Virginia":       { rate: 0.14, sunlight: "medium", production: 1400 },
  "Washington":     { rate: 0.12, sunlight: "low",    production: 1200 },
  "West Virginia":  { rate: 0.13, sunlight: "medium", production: 1350 },
  "Wisconsin":      { rate: 0.15, sunlight: "low",    production: 1300 },
  "Wyoming":        { rate: 0.12, sunlight: "high",   production: 1500 }
};

const SOLAR_STATE_CODES = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",
  CO:"Colorado",CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",
  HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",
  KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",
  MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",
  MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",
  NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",
  ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",
  RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",
  TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",
  WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming"
};
const SOLAR_NAME_TO_CODE = Object.fromEntries(Object.entries(SOLAR_STATE_CODES).map(([c,n]) => [n,c]));

// ── SOLAR CONSTANTS ──────────────────────────────────────────
const SOLAR = {
  panelW:       400,
  efficiency:   0.80,
  costPerWatt:  3.00,
  taxCredit:    0.30,
  rateGrowth:   0.03,
  maintPct:     0.01,
  systemLife:   25,
  co2PerKwh:    0.40,
  treesPerTon:  40,
  carKgPerYear: 4600,
  sunlight: { low: 1200, medium: 1400, high: 1600 }
};

// ── POPULATE STATE DROPDOWN ──────────────────────────────────
function solarPopulateStates() {
  const sel = document.getElementById('sol-state');
  if (!sel) return;
  const names = Object.keys(SOLAR_STATE_DATA).sort((a,b) => a.localeCompare(b));
  names.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  });
}

function solarStateChange() {
  const name = document.getElementById('sol-state').value;
  const data = SOLAR_STATE_DATA[name];
  if (data) {
    document.getElementById('sol-rate').value = data.rate.toFixed(2);
    const sunEl = document.getElementById('sol-sun');
    if (sunEl) sunEl.value = data.sunlight;
  }
  solarCalc();
}

// ── SLIDER / PANEL VISUALISER ────────────────────────────────
function solarSlider(val) {
  val = parseInt(val);
  document.getElementById('sol-panel-count-pill').textContent = val + ' panels';
  solarRenderViz(val);
  solarCalc();
}

function solarRenderViz(count) {
  const wrap = document.getElementById('sol-panel-viz');
  if (!wrap) return;
  wrap.innerHTML = '';
  for (let i = 0; i < Math.min(count, 50); i++) {
    const cell = document.createElement('div');
    cell.className = 'sol-panel-cell';
    cell.title = `Panel ${i+1}: 400W`;
    wrap.appendChild(cell);
  }
}

// ── CORE CALCULATION ─────────────────────────────────────────
function solarRunCalc(panels, monthlyKwh, rate, sunLevel, costPerW, stateProduction) {
  const productionFactor = stateProduction || SOLAR.sunlight[sunLevel] || 1400;
  const systemKw      = panels * SOLAR.panelW / 1000;
  const annualKwh     = systemKw * productionFactor * SOLAR.efficiency;
  const coverage      = monthlyKwh > 0 ? (annualKwh / (monthlyKwh * 12) * 100) : 0;

  const grossCost     = systemKw * 1000 * costPerW;
  const taxCredit     = grossCost * SOLAR.taxCredit;
  const netCost       = grossCost - taxCredit;
  const annualMaint   = grossCost * SOLAR.maintPct;

  const annualSavings1 = annualKwh * rate;

  let cumCashFlow = -netCost;
  const cashFlows = [-netCost];
  let paybackYear = null;
  let totalSavings = 0;

  for (let yr = 1; yr <= SOLAR.systemLife; yr++) {
    const rateThisYear = rate * Math.pow(1 + SOLAR.rateGrowth, yr - 1);
    const savings = annualKwh * rateThisYear;
    const net = savings - annualMaint;
    totalSavings += savings;
    cumCashFlow += net;
    cashFlows.push(cumCashFlow);
    if (paybackYear === null && cumCashFlow >= 0) paybackYear = yr;
  }
  const netSavings25 = totalSavings - annualMaint * SOLAR.systemLife - netCost;

  function npv(rate, flows) {
    return flows.reduce((sum, cf, i) => sum + cf / Math.pow(1 + rate, i), 0);
  }
  let irr = 0.10, step = 0.01;
  for (let i = 0; i < 1000; i++) {
    const n = npv(irr, cashFlows);
    if (Math.abs(n) < 0.01) break;
    irr += n > 0 ? step : -step;
    step *= 0.99;
  }

  const co2PerYear  = annualKwh * SOLAR.co2PerKwh;
  const co2_25      = co2PerYear * SOLAR.systemLife;
  const treesEquiv  = Math.round(co2_25 / 1000 * SOLAR.treesPerTon);
  const carsEquiv   = (co2PerYear / SOLAR.carKgPerYear).toFixed(1);

  const stockReturn = netCost * (Math.pow(1.08, SOLAR.systemLife) - 1);
  const fdReturn    = netCost * (Math.pow(1.05, SOLAR.systemLife) - 1);
  const solarReturn = Math.max(0, netSavings25);

  return {
    systemKw, annualKwh, coverage,
    grossCost, taxCredit, netCost, annualMaint,
    annualSavings: annualSavings1, monthlySavings: annualSavings1 / 12,
    netSavings25, paybackYear,
    irr, cashFlows,
    co2PerYear, co2_25, treesEquiv, carsEquiv,
    solarReturn, stockReturn, fdReturn
  };
}

// ── MAIN CALC + RENDER ───────────────────────────────────────
let solarLastResult = null;
let solarChartInstance = null;

function solarCalc() {
  const panels    = parseInt(document.getElementById('sol-panels')?.value || 12);
  const monthlyKwh= parseFloat(document.getElementById('sol-kwh')?.value || 900);
  const rate      = parseFloat(document.getElementById('sol-rate')?.value || 0.14);
  const sunLevel  = document.getElementById('sol-sun')?.value || 'medium';
  const stateName = document.getElementById('sol-state')?.value || '';

  if (!panels || !monthlyKwh || !rate) return;

  const stateData = SOLAR_STATE_DATA[stateName];
  const stateProduction = stateData ? stateData.production : null;

  const r = solarRunCalc(panels, monthlyKwh, rate, sunLevel, SOLAR.costPerWatt, stateProduction);
  solarLastResult = { panels, monthlyKwh, rate, sunLevel, stateName, stateData, r };

  solarRenderSky(r, monthlyKwh);
  solarRenderGround(r);
  solarRenderFinCards(r);
  solarRenderEnv(r);
  solarRenderSystemPills(r, panels);
  solarRenderChart(r);
  solarRenderComparison(r);
}

// ── HELPERS ──────────────────────────────────────────────────
const $s = id => document.getElementById(id);
const fmtS = n => '$' + Math.round(n).toLocaleString('en-US');
const solFmtD = n => '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const pctS = n => (n * 100).toFixed(1) + '%';
function setS(id, val) { const el = $s(id); if (el) el.textContent = val; }
function setSolarBar(id, pct) { const el = $s(id); if (el) el.style.width = Math.min(100, Math.max(0, pct)).toFixed(1) + '%'; }
function popEl(id) {
  const el = $s(id); if (!el) return;
  el.classList.remove('sol-pop'); void el.offsetWidth; el.classList.add('sol-pop');
}

// ── SKY ZONE ─────────────────────────────────────────────────
function solarRenderSky(r, monthlyKwh) {
  const el = $s('sol-savings-num');
  if (el) { el.textContent = fmtS(r.netSavings25); popEl('sol-savings-num'); }
  setS('sol-savings-lbl', '25-Year Net Savings');
  setS('sol-savings-mo', `~${fmtS(r.monthlySavings)}/month  ·  ${fmtS(r.annualSavings)}/year (Year 1)`);

  const total = Math.max(r.netSavings25 + r.netCost, r.netCost);
  const gainPct = Math.max(3, Math.min(90, r.netSavings25 / total * 100));
  const costPct = 100 - gainPct;
  const pg = $s('sol-prop-gain'); if (pg) pg.style.width = gainPct.toFixed(1) + '%';
  const pc = $s('sol-prop-cost'); if (pc) pc.style.width = costPct.toFixed(1) + '%';
  setS('sol-prop-gain-lbl', `Gain ${gainPct.toFixed(0)}%`);
  setS('sol-prop-cost-lbl', `Investment ${costPct.toFixed(0)}%`);

  const badge = $s('sol-payback-badge');
  const txt   = $s('sol-payback-txt');
  const ico   = $s('sol-payback-icon');
  if (badge && txt && ico) {
    if (r.paybackYear) {
      badge.className = r.paybackYear <= 10 ? 'ice-refund-badge green' : 'ice-refund-badge green warn';
      ico.textContent = '⚡';
      txt.textContent = `Break-even in ${r.paybackYear} years — ${25 - r.paybackYear} years of pure savings after`;
    } else {
      badge.className = 'ice-refund-badge red';
      ico.textContent = '⚠️';
      txt.textContent = 'Payback period exceeds 25 years — consider more panels';
    }
  }

  setS('sol-irr-pill',   (r.irr * 100).toFixed(1) + '%');
  setS('sol-co2-pill',   (r.co2PerYear / 1000).toFixed(1) + 't');
  setS('sol-trees-pill', r.treesEquiv.toLocaleString());
}

// ── GROUND ZONE ──────────────────────────────────────────────
function solarRenderGround(r) {
  setS('scr-install', fmtS(r.grossCost));
  const prodLabel = solarLastResult?.stateData ? `${solarLastResult.stateData.production} kWh/kW/yr · $${SOLAR.costPerWatt}/W` : `$${SOLAR.costPerWatt}/W`;
  setS('scr-install-sub', `Before 30% federal tax credit · ${prodLabel}`);
  setS('scr-credit',  '-' + fmtS(r.taxCredit));
  setS('scr-net',     fmtS(r.netCost));
  setS('scr-net-sub', `Your out-of-pocket investment`);
  setS('scr-net-pct', pctS(r.netCost / r.grossCost));
  setS('scr-maint',   fmtS(r.annualMaint) + '/yr');
  setS('scr-maint-pct', pctS(r.annualMaint / r.grossCost));

  setSolarBar('scr-install-bar', 100);
  setSolarBar('scr-credit-bar',  30);
  setSolarBar('scr-net-bar',     70);
  setSolarBar('scr-maint-bar',   r.annualMaint / r.grossCost * 100);

  const ctx = $s('sol-context-txt');
  const prodDisplay = solarLastResult?.stateData ? ` (${solarLastResult.stateData.production} kWh/kW/yr — ${solarLastResult.stateData.sunlight} sunlight state)` : '';
  if (ctx && r.netCost > 0) {
    ctx.innerHTML = `You invest <strong>${fmtS(r.netCost)}</strong> after the tax credit${prodDisplay}. Saves <strong>${fmtS(r.annualSavings)}</strong> in year 1. Break-even in <strong>${r.paybackYear || '25+'} years</strong>. Net gain over 25 years: <strong>${fmtS(r.netSavings25)}</strong>.`;
  }

  setS('sgp-panels', document.getElementById('sol-panels')?.value + ' × 400W');
  setS('sgp-system', (document.getElementById('sol-panels')?.value * 0.4).toFixed(1) + ' kW');
  setS('sgp-cpw', `$${SOLAR.costPerWatt.toFixed(2)}/W`);
}

// ── SYSTEM PILLS ─────────────────────────────────────────────
function solarRenderSystemPills(r, panels) {
  setS('sol-sys-kw',   r.systemKw.toFixed(1) + ' kW');
  setS('sol-sys-kwh',  Math.round(r.annualKwh).toLocaleString() + ' kWh/yr');
  const covEl = $s('sol-coverage');
  if (covEl) {
    const pct = Math.round(r.coverage);
    covEl.textContent = pct + '%';
    covEl.style.color = pct >= 90 ? 'var(--gp)' : pct >= 60 ? 'var(--sol-amber-dark)' : 'var(--red)';
  }

  const badge = $s('sol-panel-badge');
  if (badge) {
    const monthly = parseFloat(document.getElementById('sol-kwh')?.value || 0);
    const stateName2 = document.getElementById('sol-state')?.value || '';
    const stateData2  = SOLAR_STATE_DATA[stateName2];
    const prodFactor  = stateData2 ? stateData2.production : (SOLAR.sunlight[document.getElementById('sol-sun')?.value || 'medium'] || 1400);
    const rec = Math.ceil((monthly * 12) / (prodFactor * SOLAR.efficiency * (SOLAR.panelW / 1000)));
    badge.textContent = panels === rec ? '✓ Recommended' : panels < rec ? '↑ Add more' : '✓ Extra capacity';
    badge.className = 'sol-badge ' + (panels === rec ? 'sol-badge-green' : 'sol-badge-amber');
  }
}

// ── FINANCIAL CARDS ──────────────────────────────────────────
function solarRenderFinCards(r) {
  setS('sfc-annual',     fmtS(r.annualSavings));
  setS('sfc-annual-sub', `${fmtS(r.netSavings25)} over 25 yrs`);
  setS('sfc-monthly',    fmtS(r.monthlySavings));
  setS('sfc-payback',    r.paybackYear ? r.paybackYear + ' yrs' : '25+ yrs');
  setS('sfc-irr',        (r.irr * 100).toFixed(1) + '%');
}

// ── ENVIRONMENTAL ─────────────────────────────────────────────
function solarRenderEnv(r) {
  const co2Tons = r.co2PerYear / 1000;
  setS('senv-co2yr',   co2Tons.toFixed(2) + ' tons');
  setS('senv-co225',   (r.co2_25 / 1000).toFixed(1) + ' tons');
  setS('senv-trees',   r.treesEquiv.toLocaleString() + ' trees');
  setS('senv-cars',    r.carsEquiv + ' cars');
}

// ── COMPARISON ───────────────────────────────────────────────
function solarRenderComparison(r) {
  const maxVal = Math.max(r.solarReturn, r.stockReturn, r.fdReturn, 1);
  setS('sc-solar', fmtS(r.solarReturn));
  setS('sc-stock', fmtS(r.stockReturn));
  setS('sc-fd',    fmtS(r.fdReturn));
  setS('sc-solar-irr', (r.irr * 100).toFixed(1) + '%');
  setSolarBar('sc-solar-bar', 100);
  setSolarBar('sc-stock-bar', r.stockReturn / maxVal * 100);
  setSolarBar('sc-fd-bar',    r.fdReturn    / maxVal * 100);
}

// ── 25-YEAR CHART ─────────────────────────────────────────────
function solarRenderChart(r) {
  const canvas = $s('sol-chart');
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const W = canvas.parentElement.clientWidth - 32;
  const H = 200;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const flows = r.cashFlows;
  const PAD = { top: 20, right: 16, bottom: 36, left: 64 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top  - PAD.bottom;

  const minV = Math.min(...flows);
  const maxV = Math.max(...flows);
  const range = maxV - minV || 1;

  function xOf(i) { return PAD.left + (i / (flows.length - 1)) * cW; }
  function yOf(v) { return PAD.top + (1 - (v - minV) / range) * cH; }

  const zeroY = yOf(0);

  ctx.strokeStyle = '#E8EAED';
  ctx.lineWidth = 1;
  const ySteps = 5;
  for (let s = 0; s <= ySteps; s++) {
    const v = minV + (s / ySteps) * range;
    const y = yOf(v);
    ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke();
    ctx.fillStyle = '#80868B'; ctx.font = '10px DM Sans, sans-serif';
    ctx.textAlign = 'right';
    const label = v >= 1000 ? '$' + (v/1000).toFixed(0) + 'k' : v <= -1000 ? '-$' + (Math.abs(v)/1000).toFixed(0) + 'k' : '$' + Math.round(v);
    ctx.fillText(label, PAD.left - 6, y + 3.5);
  }

  if (zeroY >= PAD.top && zeroY <= PAD.top + cH) {
    ctx.strokeStyle = '#DADCE0'; ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(PAD.left, zeroY); ctx.lineTo(W - PAD.right, zeroY); ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(xOf(0), Math.min(zeroY, yOf(flows[0])));
  flows.forEach((v, i) => { if (i > 0) ctx.lineTo(xOf(i), yOf(v)); });
  ctx.lineTo(xOf(flows.length - 1), zeroY);
  ctx.lineTo(xOf(0), zeroY);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, PAD.top, 0, zeroY);
  grad.addColorStop(0, 'rgba(184,77,198,0.25)');
  grad.addColorStop(1, 'rgba(184,77,198,0.02)');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(xOf(0), Math.max(zeroY, yOf(flows[0])));
  flows.forEach((v, i) => { if (i > 0) ctx.lineTo(xOf(i), yOf(v)); });
  ctx.lineTo(xOf(flows.length - 1), zeroY);
  ctx.lineTo(xOf(0), zeroY);
  ctx.closePath();
  const gradN = ctx.createLinearGradient(0, zeroY, 0, PAD.top + cH);
  gradN.addColorStop(0, 'rgba(249,171,0,0.12)');
  gradN.addColorStop(1, 'rgba(249,171,0,0.04)');
  ctx.fillStyle = gradN;
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.strokeStyle = '#b84dc6'; ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  flows.forEach((v, i) => {
    i === 0 ? ctx.moveTo(xOf(i), yOf(v)) : ctx.lineTo(xOf(i), yOf(v));
  });
  ctx.stroke();

  if (r.paybackYear && r.paybackYear <= 25) {
    const bx = xOf(r.paybackYear);
    const by = zeroY;
    ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#b84dc6'; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();

    const beLabel = $s('sol-chart-be-label');
    if (beLabel) {
      beLabel.textContent = `Break-even: Year ${r.paybackYear}`;
      beLabel.style.display = 'inline-block';
    }

    ctx.fillStyle = '#b84dc6'; ctx.font = 'bold 10px DM Sans, sans-serif';
    ctx.textAlign = bx < W/2 ? 'left' : 'right';
    ctx.fillText(`Yr ${r.paybackYear}`, bx + (bx < W/2 ? 8 : -8), by - 8);
  }

  ctx.fillStyle = '#80868B'; ctx.font = '10px DM Sans, sans-serif'; ctx.textAlign = 'center';
  [0,5,10,15,20,25].forEach(yr => {
    ctx.fillText('Yr ' + yr, xOf(yr), H - PAD.bottom + 14);
  });

  ctx.strokeStyle = '#DADCE0'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + cH); ctx.stroke();
}

// ── DOWNLOAD REPORT ──────────────────────────────────────────
function solarDownload(btn) {
  const card = $s('sol-dl-el');
  if (card) { card.classList.add('sol-dl-flash'); setTimeout(() => card.classList.remove('sol-dl-flash'), 800); }
  const orig = btn.innerHTML;
  btn.textContent = '⏳ Generating…'; btn.disabled = true;

  setTimeout(() => {
    if (!solarLastResult) { btn.innerHTML = orig; btn.disabled = false; alert('Run a calculation first.'); return; }
    const { panels, monthlyKwh, rate, sunLevel, stateName, stateData, r } = solarLastResult;
    const stName = stateName || 'Not selected';
    const roofType = document.getElementById('sol-roof')?.value || 'N/A';
    const prodFactor2 = stateData ? stateData.production : 'N/A';
    const sun = { low:'Low (1,200 kWh/kW)', medium:'Medium (1,400 kWh/kW)', high:'High (1,600 kWh/kW)' };

    const txt = `
HOME SOLAR PLANNER — REPORT
ToolKit Pro · Generated ${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
${'='.repeat(60)}

SYSTEM CONFIGURATION
${'─'.repeat(40)}
Number of Panels:    ${panels} × 400W
System Size:         ${r.systemKw.toFixed(2)} kW
State:               ${stName}
Roof Type:           ${roofType}
Sunlight Level:      ${sun[sunLevel]}
State Production:    ${prodFactor2} kWh/kW/yr
Monthly Usage:       ${monthlyKwh} kWh
Electricity Rate:    $${rate}/kWh
Annual Coverage:     ${Math.round(r.coverage)}% of your usage

ANNUAL OUTPUT
${'─'.repeat(40)}
Annual Production:   ${Math.round(r.annualKwh).toLocaleString()} kWh
Energy Coverage:     ${Math.round(r.coverage)}%

FINANCIAL BREAKDOWN
${'─'.repeat(40)}
Gross System Cost:   ${fmtS(r.grossCost)}
Federal Tax Credit:  -${fmtS(r.taxCredit)} (30% ITC)
Your Net Investment: ${fmtS(r.netCost)}
Annual Maintenance:  ${fmtS(r.annualMaint)}/yr (~1%)

SAVINGS PROJECTIONS
${'─'.repeat(40)}
Year 1 Savings:      ${fmtS(r.annualSavings)}
Monthly Savings:     ${fmtS(r.monthlySavings)}
Payback Period:      ${r.paybackYear ? r.paybackYear + ' years' : '25+ years'}
25-Year Net Savings: ${fmtS(r.netSavings25)}
IRR:                 ${(r.irr*100).toFixed(1)}%

INVESTMENT COMPARISON (25 Years on ${fmtS(r.netCost)})
${'─'.repeat(40)}
Solar Return:        ${fmtS(r.solarReturn)}  (IRR ${(r.irr*100).toFixed(1)}%)
Stock Market (8%):   ${fmtS(r.stockReturn)}
Fixed Deposit (5%):  ${fmtS(r.fdReturn)}

ENVIRONMENTAL IMPACT
${'─'.repeat(40)}
CO₂ Avoided / Year:  ${(r.co2PerYear/1000).toFixed(2)} tons
CO₂ over 25 Years:   ${(r.co2_25/1000).toFixed(1)} tons
Tree Equivalent:     ${r.treesEquiv.toLocaleString()} trees
Cars Off Road:       ${r.carsEquiv} cars/year

25-YEAR CASH FLOW
${'─'.repeat(40)}
${r.cashFlows.map((v,i) => `Year ${String(i).padStart(2)}: ${v >= 0 ? '+' : ''}${fmtS(v)}${r.paybackYear === i ? '  ← BREAK-EVEN' : ''}`).join('\n')}

${'='.repeat(60)}
ASSUMPTIONS
• Panel size: 400W, efficiency factor: 0.80
• Cost: $${SOLAR.costPerWatt}/W (national avg 2024; ±30% by location)
• Federal ITC: 30% (valid through 2032)
• Electricity rate growth: 3%/year
• Maintenance: 1% of gross cost/year
• CO₂ factor: 0.4 kg/kWh avoided

DISCLAIMER: All figures are estimates for planning purposes.
Actual results depend on roof specifics, shading, local utility
tariffs and installer pricing. Get quotes from licensed installers.

ToolKit Pro · Not affiliated with any government agency
${'='.repeat(60)}
`.trim();

    const blob = new Blob([txt], {type:'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `SolarReport-${new Date().toISOString().split('T')[0]}.txt`;
    a.click(); URL.revokeObjectURL(url);

    btn.innerHTML = orig; btn.disabled = false;
  }, 700);
}

// ── INIT SOLAR ────────────────────────────────────────────────
function solarInit() {
  solarPopulateStates();
  solarRenderViz(12);
  const stateEl = document.getElementById('sol-state');
  if (stateEl) { stateEl.value = 'California'; }
  const defaultData = SOLAR_STATE_DATA['California'];
  const rateEl = document.getElementById('sol-rate');
  if (rateEl && defaultData) rateEl.value = defaultData.rate.toFixed(2);
  const sunEl = document.getElementById('sol-sun');
  if (sunEl && defaultData) sunEl.value = defaultData.sunlight;
  solarCalc();
}

// ── DOMContentLoaded ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  solarInit();
  updateAuthUI();
});
