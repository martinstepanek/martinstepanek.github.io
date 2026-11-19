/* Interactive charts for the articles. Plain SVG, no dependencies.
   A <figure class="chart" data-chart="NAME"> with an <img> fallback is replaced
   with the live chart; hover, tap or focus a bar or point for the numbers. */
(function () {
  "use strict";

  // ---------- data (verified figures, same as the article) ----------
  const D = {
    months: ['Oct 2025','Nov','Dec','Jan 2026','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'],
    lines: [57719,38984,63990,57986,56606,56202,63649,119137,99051,143934,163353,455728],
    devs: [4,4,4,4,4,4,4,5,5,2,2,2],
    prs: { labels: ['Apr','May','Jun','Jul','Aug','Sep'], values: [45,206,143,283,311,803], devs: [4,5,5,2,2,2] },
    wk: { labels: ['2 Jul','9 Jul','16 Jul','23 Jul','30 Jul','6 Aug','13 Aug','20 Aug','27 Aug','3 Sep','10 Sep','17 Sep','24 Sep'],
          events: [1531,3137,1513,1892,2025,555,327,735,989,439,906,469,1294],
          bugs: [18,30,28,13,30,27,41,35,40,12,29,10,25],
          code: [32282,20678,35095,37902,24906,62064,29619,48209,24386,82975,55384,92089,213659] },
    sonar: { dates: ['2026-07-04','2026-07-06','2026-07-17','2026-07-25','2026-08-01','2026-08-08','2026-08-15','2026-08-21','2026-08-28','2026-09-06','2026-09-13','2026-09-20','2026-09-27','2026-09-30'],
             debt: [140,139,129,127,125,122,113,113,93,91,88,85,75,28],
             dup: [15.9,15.8,15.1,14.8,11.0,10.7,8.6,8.5,8.1,7.6,7.2,6.5,5.0,2.8],
             ticks: ['2026-07-04','2026-07-17','2026-08-01','2026-08-15','2026-08-28','2026-09-13','2026-09-30'] },
    gen: { labels: ['Jan 2026','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'], values: [1.00,1.31,1.51,2.04,2.31,2.87,4.64,5.28,9.94] },
    surf: { labels: ['Apr','May','Jun','Jul','Aug','Sep'], series: [
      { key: 'MCP', values: [0,0,0,20.7,27.5,38.0] },
      { key: 'Public API', values: [0,0,0,3.7,1.0,11.0] },
      { key: 'Flows', values: [0,2.8,11.4,15.4,11.9,11.7] },
      { key: 'Web app', values: [100,97.2,88.6,60.1,59.6,39.3] }] },
  };
  const baseline = D.lines.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
  const wkRate = D.wk.bugs.map((b, i) => b / D.wk.code[i] * 1e4);

  const fmtK = v => v >= 1000 ? Math.round(v / 1000) + 'k' : String(Math.round(v));
  const fmtC = v => Math.round(v).toLocaleString('en-US');
  const fmtX = v => (Number.isInteger(v) ? v : v.toFixed(1)) + '×';
  const fmtP = v => (Number.isInteger(v) ? v : v.toFixed(1)) + '%';
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dl = d => { const x = new Date(d + 'T00:00:00'); return x.getDate() + ' ' + MON[x.getMonth()]; };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  // ---------- theme ----------
  const T = { surface: '#161615', ink1: '#ffffff', ink2: '#c3c2b7', muted: '#898781', grid: '#2c2c2a', base: '#383835',
    before: '#55544f', after: '#3987e5', s: ['#3987e5','#d95926','#199e70'], gray: '#3b3b38',
    barMax: 18, grid_on: false, yaxis: false, wash: true };

  // ---------- primitives ----------
  const PERSON = (x, y, fill) => `<g transform="translate(${x},${y})" fill="${fill}"><circle cx="0" cy="-5.2" r="2.6"/><path d="M-4.2 6.5c0-3.6 1.9-5.6 4.2-5.6s4.2 2 4.2 5.6z"/></g>`;
  function roundTop(x, y, w, h, r) { if (h <= r) r = Math.max(0, h - 0.5); return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`; }
  // invisible hit area carrying the tooltip text; keyboard reachable
  function hit(x, y, w, h, html, label) {
    return `<rect class="hit" x="${x}" y="${y}" width="${w}" height="${h}" fill="transparent" tabindex="0" role="img" aria-label="${esc(label)}" data-tip="${esc(html)}"/>`;
  }
  const plain = html => html.replace(/<br>/g, ', ').replace(/<[^>]+>/g, '');

  function colChart(t, o) {
    const { labels, values, afterFrom = 0, yMax, valFn = fmtK, keyIdx = [], plotH = 180, tipFn, W = 640, devs = null } = o;
    const padL = 12, padR = 12, padT = 26;
    const n = labels.length, band = (W - padL - padR) / n, bw = Math.min(t.barMax, band * 0.6);
    const padB = (devs && band >= 34) ? 58 : 34, H = padT + plotH + padB;
    const y = v => padT + plotH - (v / yMax) * plotH;
    const labelStep = Math.max(1, Math.ceil(50 / band));
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">`;
    values.forEach((v, i) => {
      const after = i >= afterFrom, fill = after ? t.after : t.before, cx = padL + band * i + band / 2, x = cx - bw / 2, top = y(v), h = padT + plotH - top;
      s += `<g class="col">`;
      s += `<path d="${roundTop(x, top, bw, h, 4)}" fill="${fill}"/>`;
      const showVal = band >= 40 || keyIdx.includes(i);
      if (showVal) {
        const lv = valFn(v, i);
        if (Array.isArray(lv)) s += `<text x="${cx}" y="${top - 22}" text-anchor="middle" font-size="12.5" font-weight="600" fill="${t.ink1}">${lv[0]}</text><text x="${cx}" y="${top - 8}" text-anchor="middle" font-size="11.5" fill="${t.ink2}">${lv[1]}</text>`;
        else s += `<text x="${cx}" y="${top - 8}" text-anchor="middle" font-size="12.5" font-weight="600" fill="${t.ink1}">${lv}</text>`;
      }
      if ((n - 1 - i) % labelStep === 0) s += `<text x="${cx}" y="${padT + plotH + 20}" text-anchor="middle" font-size="12.5" fill="${t.ink2}">${labels[i]}</text>`;
      if (devs && band >= 34) { const k = devs[i], gw = Math.min(11, (band - 16) / Math.max(...devs)), sc = Math.min(1, gw / 11), x0 = cx - (k - 1) * gw / 2; for (let j = 0; j < k; j++) s += `<g transform="translate(${x0 + j * gw},${padT + plotH + 44}) scale(${sc.toFixed(2)})">${PERSON(0, 0, fill)}</g>`; }
      const tipHtml = tipFn ? tipFn(v, i) : `<b>${labels[i]}</b><br>${valFn(v, i)}`;
      s += hit(padL + band * i, padT - 26, band, plotH + 26 + padB, tipHtml, plain(tipHtml));
      s += `</g>`;
    });
    s += `<line x1="${padL}" x2="${W - padR}" y1="${y(0)}" y2="${y(0)}" stroke="${t.base}" stroke-width="1"/></svg>`;
    return s;
  }

  function lineChart(t, o) {
    const { dates, values, yMax, yStep, fmt, ticks, color, plotH = 170, unit = '', W = 640 } = o;
    const padL = 60, padR = 64, padT = 30, padB = 34, H = padT + plotH + padB;
    const t0 = Date.parse(dates[0]), t1 = Date.parse(dates[dates.length - 1]);
    const x = d => padL + (Date.parse(d) - t0) / (t1 - t0) * (W - padL - padR), y = v => padT + plotH - (v / yMax) * plotH;
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">`;
    for (let v = yStep; v <= yMax + 1e-9; v += yStep) s += `<line x1="${padL}" x2="${W - padR}" y1="${y(v)}" y2="${y(v)}" stroke="${t.grid}" stroke-width="1"/>`;
    for (let v = 0; v <= yMax + 1e-9; v += yStep) s += `<text class="tick" x="${padL - 10}" y="${y(v) + 4}" text-anchor="end" font-size="12" fill="${t.muted}">${fmt(v)}</text>`;
    let lastTick = -1e9;
    ticks.forEach(d => { const tx = x(d); if (tx - lastTick >= 54) { s += `<text x="${tx}" y="${padT + plotH + 22}" text-anchor="middle" font-size="12.5" fill="${t.ink2}">${dl(d)}</text>`; lastTick = tx; } });
    const pts = dates.map((d, i) => [x(d), y(values[i])]);
    s += `<path d="M${pts[0][0]},${y(0)} ${pts.map(p => 'L' + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')} L${pts[pts.length - 1][0]},${y(0)} Z" fill="${color}" fill-opacity="0.10"/>`;
    s += `<path d="${pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    const n = pts.length - 1;
    const lab = new Set(); let lastX = -1e9;
    for (let i = 0; i < n; i++) { if (pts[i][0] - lastX >= 30 && pts[n][0] - pts[i][0] >= 30) { lab.add(i); lastX = pts[i][0]; } }
    lab.forEach(i => s += `<text x="${pts[i][0] + (i ? 0 : 2)}" y="${pts[i][1] - 12}" text-anchor="${i ? 'middle' : 'start'}" font-size="12.5" font-weight="600" fill="${t.ink1}">${fmt(values[i])}</text>`);
    s += `<text x="${pts[n][0] + 12}" y="${pts[n][1] + 4}" font-size="12.5" font-weight="600" fill="${t.ink1}">${fmt(values[n])}</text>`;
    s += `<line x1="${padL}" x2="${W - padR}" y1="${y(0)}" y2="${y(0)}" stroke="${t.base}" stroke-width="1"/>`;
    dates.forEach((d, i) => {
      const x0 = i ? (pts[i - 1][0] + pts[i][0]) / 2 : padL, x1 = i < n ? (pts[i][0] + pts[i + 1][0]) / 2 : W - padR;
      const tipHtml = `<b>${dl(d)}</b><br>${fmt(values[i])}${unit}`;
      s += `<g class="pt"><circle cx="${pts[i][0]}" cy="${pts[i][1]}" r="4" fill="${color}" stroke="${t.surface}" stroke-width="2"/>${hit(x0, padT - 20, x1 - x0, plotH + 20 + padB, tipHtml, plain(tipHtml))}</g>`;
    });
    s += `</svg>`; return s;
  }

  function stackChart(t, o) {
    const { labels, series, plotH = 180, W = 640 } = o;
    const padL = 12, padR = 12, padT = 26, padB = 34, H = padT + plotH + padB;
    const n = labels.length, band = (W - padL - padR) / n, bw = Math.min(t.barMax * 2.4, band * 0.6);
    const y = v => padT + plotH - (v / 100) * plotH;
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">`;
    labels.forEach((lab, i) => {
      const cx = padL + band * i + band / 2, x = cx - bw / 2; let acc = 0;
      const vis = series.filter(sr => sr.values[i] > 0);
      s += `<g class="col">`;
      vis.forEach((sr, k) => {
        const v = sr.values[i], top = y(acc + v), h = Math.max(0.5, y(acc) - top - (k < vis.length - 1 ? 2 : 0)), last = k === vis.length - 1;
        s += `<path d="${roundTop(x, top, bw, h, last ? 4 : 0)}" fill="${sr.color}"/>`;
        if (v >= 8 && bw >= 36) { const dark = sr.key === 'Web app'; s += `<text x="${cx}" y="${top + h / 2 + 4.5}" text-anchor="middle" font-size="12.5" font-weight="${sr.key === 'MCP' ? 700 : 500}" fill="${dark ? t.ink1 : '#fff'}">${Math.round(v)}%</text>`; }
        acc += v;
      });
      s += `<text x="${cx}" y="${padT + plotH + 20}" text-anchor="middle" font-size="12.5" fill="${t.ink2}">${lab}</text>`;
      const tipHtml = `<b>${lab}</b><br>` + series.map(sr => `${sr.key}: ${fmtP(sr.values[i])}`).join('<br>');
      s += hit(padL + band * i, padT - 26, band, plotH + 26 + padB, tipHtml, plain(tipHtml));
      s += `</g>`;
    });
    s += `<line x1="${padL}" x2="${W - padR}" y1="${y(0)}" y2="${y(0)}" stroke="${t.base}" stroke-width="1"/></svg>`;
    return s;
  }

  function legend(items) {
    return `<div class="legend">${items.map(i => `<span><i class="sw" style="background:${i.color}"></i>${i.label}</span>`).join('')}</div>`;
  }
  function tile(lbl, val) {
    const fs = val.length > 9 ? 38 : val.length > 6 ? 46 : 52;
    return `<div class="tile"><p class="lbl">${lbl}</p><p class="val" style="font-size:${fs}px">${val.replace(' → ', '<span class="arr">→</span>')}</p></div>`;
  }

  // ---------- the charts, by name ----------
  const CHARTS = {
    'lines-monthly': { title: 'Code lines changed per month', lbl: 'September against the average before May', val: '8×',
      svg: W => colChart(T, { labels: D.months, values: D.lines, afterFrom: 7, yMax: 500000, keyIdx: [6, 11], devs: D.devs, plotH: 180, W,
        valFn: (x, i) => i >= 7 ? [(x / baseline).toFixed(1) + '×', fmtK(x)] : fmtK(x),
        tipFn: (x, i) => `<b>${D.months[i]}</b><br>${fmtC(x)} lines changed<br>${D.devs[i]} developers · ${fmtK(x / D.devs[i])} per developer${i >= 7 ? '<br>' + (x / baseline).toFixed(1) + '× the average before May' : ''}` }) },
    'prs-monthly': { title: 'Merged pull requests per month', lbl: 'September', val: '803',
      svg: W => colChart(T, { labels: D.prs.labels, values: D.prs.values, afterFrom: 1, yMax: 1000, valFn: String, keyIdx: [0, 5], devs: D.prs.devs, plotH: 150, W,
        tipFn: (x, i) => `<b>${D.prs.labels[i]}</b><br>${x} merged pull requests<br>${D.prs.devs[i]} developers` }) },
    'error-events-weekly': { title: 'Production error events per week', lbl: 'Per paid generation, September against July', val: '5× fewer',
      svg: W => colChart(T, { labels: D.wk.labels, values: D.wk.events, yMax: 3500, valFn: fmtC, keyIdx: [1, 12], plotH: 170, W,
        tipFn: (x, i) => `<b>Week of ${D.wk.labels[i]}</b><br>${fmtC(x)} error events` }) },
    'code-bugs-weekly': { title: 'New code bugs per 10,000 lines of code changed', lbl: 'Per line changed, September against August', val: '5× fewer',
      svg: W => colChart(T, { labels: D.wk.labels, values: wkRate, yMax: 20, valFn: x => x.toFixed(1), keyIdx: [6, 12], plotH: 150, W,
        tipFn: (x, i) => `<b>Week of ${D.wk.labels[i]}</b><br>${x.toFixed(1)} bugs per 10,000 lines<br>${D.wk.bugs[i]} bugs · ${fmtC(D.wk.code[i])} lines changed` }) },
    'tech-debt': { title: 'Minutes of technical debt per 1,000 lines of code', lbl: '4 July to 30 September', val: '140 → 28',
      svg: W => lineChart(T, { dates: D.sonar.dates, values: D.sonar.debt, yMax: 160, yStep: 40, fmt: x => String(Math.round(x)), ticks: D.sonar.ticks, color: T.s[0], plotH: 170, W, unit: ' min per 1,000 lines' }) },
    'duplicated-lines': { title: 'Share of duplicated lines', lbl: '4 July to 30 September', val: '15.9% → 2.8%',
      svg: W => lineChart(T, { dates: D.sonar.dates, values: D.sonar.dup, yMax: 20, yStep: 5, fmt: fmtP, ticks: D.sonar.ticks, color: T.s[1], plotH: 170, W, unit: ' duplicated' }) },
    'paid-generations-monthly': { title: 'Paid generations per month, January 2026 = 1×', lbl: 'September against January', val: '9.9×',
      svg: W => colChart(T, { labels: D.gen.labels, values: D.gen.values, afterFrom: 4, yMax: 12, valFn: x => x.toFixed(1) + '×', keyIdx: [0, 3, 8], plotH: 180, W,
        tipFn: (x, i) => `<b>${D.gen.labels[i]}</b><br>${x.toFixed(2)}× January's paid generations` }) },
    'generation-surfaces': { title: 'Where each paid generation was started', lbl: 'Through MCP in September', val: '38%',
      legend: () => legend(D.surf.series.map((sr, k) => ({ color: k < 3 ? T.s[k] : T.gray, label: sr.key }))),
      svg: W => stackChart(T, { labels: D.surf.labels, series: D.surf.series.map((sr, k) => ({ ...sr, color: k < 3 ? T.s[k] : T.gray })), plotH: 180, W }) },
  };

  // ---------- mount ----------
  function mount(fig) {
    const c = CHARTS[fig.dataset.chart];
    if (!c) return;
    fig.classList.add('live');
    const alt = (fig.querySelector('img') || {}).alt || c.title;  // the image's description labels the live chart too
    fig.innerHTML = `<div class="titlerow"><p class="chart-title">${c.title}</p>${c.legend ? c.legend() : ''}</div><div class="hero">${tile(c.lbl, c.val)}<div class="plot"></div></div>`;
    const plot = fig.querySelector('.plot');
    let lastW = 0;
    const draw = () => {
      const W = Math.max(280, Math.round(plot.getBoundingClientRect().width));
      if (Math.abs(W - lastW) < 8) return;
      lastW = W;
      plot.innerHTML = c.svg(W);
      const svg = plot.querySelector('svg');
      svg.setAttribute('role', 'group');  // a labelled group: its data points stay reachable by keyboard and screen reader
      svg.setAttribute('aria-label', alt);
    };
    draw();
    fig._draw = draw;
  }

  // ---------- tooltip ----------
  const tipEl = document.createElement('div');
  tipEl.id = 'tip';
  document.body.appendChild(tipEl);
  let pinned = null;
  let touching = false;
  function show(el, x, y) {
    tipEl.innerHTML = el.dataset.tip;
    tipEl.style.display = 'block';
    const r = tipEl.getBoundingClientRect();
    let left = x + 14, top = y + 16;
    if (left + r.width > window.innerWidth - 8) left = x - r.width - 14;
    if (top + r.height > window.innerHeight - 8) top = y - r.height - 12;
    tipEl.style.left = Math.max(8, left) + 'px';
    tipEl.style.top = Math.max(8, top) + 'px';
  }
  function hideAll() { pinned = null; tipEl.style.display = 'none'; }
  const hitOf = e => e.target && e.target.closest ? e.target.closest('.hit') : null;
  // mouse: follow the pointer
  document.addEventListener('mousemove', e => {
    if (touching) return;
    const h = hitOf(e);
    if (h) show(h, e.clientX, e.clientY); else if (!pinned) tipEl.style.display = 'none';
  });
  // touch: tap pins, tap again or tap elsewhere unpins
  document.addEventListener('touchstart', e => {
    touching = true;
    const h = hitOf(e);
    if (!h) { hideAll(); return; }
    if (pinned === h) { hideAll(); return; }
    const t = e.touches[0];
    pinned = h; show(h, t.clientX, t.clientY);
  }, { passive: true });
  document.addEventListener('touchend', () => { setTimeout(() => { touching = false; }, 500); }, { passive: true });
  // keyboard
  document.addEventListener('focusin', e => {
    const h = hitOf(e);
    if (h) { const r = h.getBoundingClientRect(); pinned = h; show(h, r.left + r.width / 2, r.top + 20); }
  });
  document.addEventListener('focusout', e => { if (hitOf(e)) hideAll(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hideAll(); });
  document.addEventListener('scroll', () => { if (pinned) { const r = pinned.getBoundingClientRect(); show(pinned, r.left + r.width / 2, r.top + 20); } }, { passive: true });

  // also called by nav.js after it brings in an article with charts
  let figs = [];
  window.mountCharts = function () {
    hideAll();
    figs = [...document.querySelectorAll('figure.chart[data-chart]')];
    figs.filter(f => !f.classList.contains('live')).forEach(mount);
  };
  window.mountCharts();
  let raf = 0;
  window.addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => figs.forEach(f => f._draw && f._draw())); });
})();
