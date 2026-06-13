/* ============================================================
   EngCalc — schema.js
   Принципові схеми та PDF-звіти
   ============================================================ */
'use strict';

// ── SVG helpers ───────────────────────────────────────────────
function _svgOpen(w, h) {
  return `<svg viewBox="0 0 ${w} ${h}" class="schema-svg" xmlns="http://www.w3.org/2000/svg">`
    + `<defs><marker id="ar" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">`
    + `<polyline points="0,1 6,4 0,7" fill="none" stroke="#5c6270" stroke-width="1.2"/></marker></defs>`;
}

function _dimH(x0, x1, y, label) {
  return `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="#5c6270" stroke-width="1" marker-end="url(#ar)"/>`
    + `<line x1="${x1}" y1="${y}" x2="${x0}" y2="${y}" stroke="#5c6270" stroke-width="1" marker-end="url(#ar)"/>`
    + `<text x="${(x0+x1)/2}" y="${y+11}" text-anchor="middle" fill="#9aa0ae" font-size="10" font-family="monospace">${label}</text>`;
}

function _dimV(x, y0, y1, label) {
  return `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="#5c6270" stroke-width="1" marker-end="url(#ar)"/>`
    + `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y0}" stroke="#5c6270" stroke-width="1" marker-end="url(#ar)"/>`
    + `<text x="${x+12}" y="${(y0+y1)/2+4}" fill="#9aa0ae" font-size="10" font-family="monospace">${label}</text>`;
}

// ── Belt conveyor ─────────────────────────────────────────────
function schemaBelt(p) {
  const beta = parseFloat(p.beta) || 0;
  const bR = beta * Math.PI / 180;
  const x0 = 60, x1 = 500;
  const yt = 92, yd = Math.max(24, Math.round(yt - (x1-x0) * Math.tan(bR) * 0.55));
  const yt0 = yt - 18, yd0 = yd - 18;
  const yt1 = yt + 18, yd1 = yd + 18;
  const mx = (x0+x1)/2;
  const rs = [0.25, 0.5, 0.75].map(t => ({
    x: Math.round(x0 + t*(x1-x0)),
    y: Math.round(yt0 + t*(yd0-yt0)) + 8
  }));
  const Lm = ((p.L||0)/1000).toFixed(1);
  const Hm = ((p.H||0)/1000).toFixed(1);

  return _svgOpen(560, 138)
    + `<circle cx="${x1}" cy="${yd}" r="20" fill="#1a1d22" stroke="#e8a317" stroke-width="2"/>`
    + `<circle cx="${x0}" cy="${yt}" r="20" fill="#1a1d22" stroke="#9aa0ae" stroke-width="1.5"/>`
    + `<line x1="${x0}" y1="${yt0}" x2="${x1}" y2="${yd0}" stroke="#e8a317" stroke-width="3"/>`
    + `<line x1="${x0}" y1="${yt1}" x2="${x1}" y2="${yd1}" stroke="#5c6270" stroke-width="1.5" stroke-dasharray="8,4"/>`
    + rs.map(r => `<circle cx="${r.x}" cy="${r.y}" r="5" fill="#14161a" stroke="#5c6270" stroke-width="1.5"/>`).join('')
    + `<rect x="${x0+70}" y="${yt0-7}" width="${(x1-x0-140)*0.55}" height="6" rx="2" fill="rgba(232,163,23,0.2)" stroke="#e8a317" stroke-width="0.5"/>`
    + `<text x="${mx}" y="${Math.round((yt0+yd0)/2)-4}" text-anchor="middle" fill="#e8a317" font-size="15">→</text>`
    + _dimH(x0, x1, 126, `L = ${Lm} м`)
    + (beta > 1 ? _dimV(524, yd, yt, `H=${Hm}м`) : '')
    + (beta > 1 ? `<text x="${mx}" y="13" text-anchor="middle" fill="#9aa0ae" font-size="10" font-family="monospace">β ≈ ${beta.toFixed(1)}°</text>` : '')
    + `<text x="${x1}" y="${yd-26}" text-anchor="middle" fill="#9aa0ae" font-size="9" font-family="monospace">ПРИВІД</text>`
    + `<text x="${x0}" y="${yt-26}" text-anchor="middle" fill="#9aa0ae" font-size="9" font-family="monospace">ХВІСТ</text>`
    + `</svg>`;
}

// ── Screw conveyor ────────────────────────────────────────────
function schemaScrew(p) {
  const D = parseFloat(p.D || 0.25) * 1000;
  const L = ((p.L||0)/1000).toFixed(1);
  const r = Math.min(36, Math.max(12, Math.round(D / 3.5)));
  const x0 = 50, x1 = 510, ym = 62;
  const segs = 14;
  const pts = Array.from({length: segs+1}, (_, i) => {
    const x = x0 + (x1-x0)*i/segs;
    const y = ym + (i%2===0 ? -1 : 1)*r;
    return `${x},${y}`;
  }).join(' ');

  return _svgOpen(560, 128)
    + `<rect x="${x0}" y="${ym-r-5}" width="${x1-x0}" height="${(r+5)*2}" rx="3" fill="#1a1d22" stroke="#9aa0ae" stroke-width="1.5"/>`
    + `<line x1="${x0}" y1="${ym}" x2="${x1}" y2="${ym}" stroke="#5c6270" stroke-width="1.5" stroke-dasharray="5,3"/>`
    + `<polyline points="${pts}" fill="none" stroke="#e8a317" stroke-width="2"/>`
    + `<text x="${(x0+x1)/2}" y="${ym-r-10}" text-anchor="middle" fill="#9aa0ae" font-size="9" font-family="monospace">Ø D = ${D.toFixed(0)} мм</text>`
    + `<text x="${(x0+x1)/2}" y="${ym+5}" text-anchor="middle" fill="#e8a317" font-size="13">→</text>`
    + _dimH(x0, x1, 116, `L = ${L} м`)
    + `</svg>`;
}

// ── Mesh chain conveyor ───────────────────────────────────────
function schemaMeshChain(p) {
  const x0 = 60, x1 = 500, y1 = 40, y2 = 92;
  const mx = (x0+x1)/2;
  const L = ((p.L||0)/1000).toFixed(1);
  const B = (p.B || 600);
  const n = 9;
  const rods = Array.from({length: n}, (_, i) => {
    const x = x0+30 + i*(x1-x0-60)/(n-1);
    return `<line x1="${x}" y1="${y1+5}" x2="${x}" y2="${y2-5}" stroke="#9aa0ae" stroke-width="1" opacity="0.5"/>`;
  }).join('');

  return _svgOpen(560, 128)
    + `<line x1="${x0}" y1="${y1}" x2="${x1}" y2="${y1}" stroke="#e8a317" stroke-width="2.5"/>`
    + `<line x1="${x0}" y1="${y2}" x2="${x1}" y2="${y2}" stroke="#e8a317" stroke-width="2.5"/>`
    + `<circle cx="${x0}" cy="${y1}" r="13" fill="#1a1d22" stroke="#e8a317" stroke-width="2"/>`
    + `<circle cx="${x0}" cy="${y2}" r="13" fill="#1a1d22" stroke="#e8a317" stroke-width="2"/>`
    + `<circle cx="${x1}" cy="${y1}" r="13" fill="#1a1d22" stroke="#9aa0ae" stroke-width="1.5"/>`
    + `<circle cx="${x1}" cy="${y2}" r="13" fill="#1a1d22" stroke="#9aa0ae" stroke-width="1.5"/>`
    + `<line x1="${x0}" y1="${y1}" x2="${x0}" y2="${y2}" stroke="#5c6270" stroke-width="1"/>`
    + `<line x1="${x1}" y1="${y1}" x2="${x1}" y2="${y2}" stroke="#5c6270" stroke-width="1"/>`
    + rods
    + `<text x="${mx}" y="${y1-10}" text-anchor="middle" fill="#e8a317" font-size="14">→</text>`
    + `<text x="${x0-18}" y="${(y1+y2)/2+4}" text-anchor="middle" fill="#9aa0ae" font-size="9" font-family="monospace">B=${B}</text>`
    + _dimH(x0, x1, 116, `L = ${L} м`)
    + `<text x="${x0}" y="${y1-20}" text-anchor="middle" fill="#9aa0ae" font-size="9" font-family="monospace">ПРИВІД</text>`
    + `<text x="${x1}" y="${y1-20}" text-anchor="middle" fill="#9aa0ae" font-size="9" font-family="monospace">ХВІСТ</text>`
    + `</svg>`;
}

// ── Scraper conveyor ──────────────────────────────────────────
function schemaScraper(p) {
  const x0 = 50, x1 = 510, ym = 60;
  const L = ((p.L||0)/1000).toFixed(1);
  const trH = 40;
  const scrapers = [0.2, 0.4, 0.6, 0.8].map(t => {
    const x = Math.round(x0 + t*(x1-x0));
    return `<rect x="${x-5}" y="${ym-trH/2}" width="10" height="${trH}" rx="1" fill="#1a1d22" stroke="#e8a317" stroke-width="1.5"/>`;
  }).join('');

  return _svgOpen(560, 128)
    + `<rect x="${x0}" y="${ym-trH/2-2}" width="${x1-x0}" height="${trH+4}" rx="3" fill="#1a1d22" stroke="#9aa0ae" stroke-width="1.5"/>`
    + `<rect x="${x0+2}" y="${ym}" width="${x1-x0-4}" height="${trH/2}" rx="1" fill="rgba(232,163,23,0.1)"/>`
    + `<line x1="${x0}" y1="${ym}" x2="${x1}" y2="${ym}" stroke="#e8a317" stroke-width="2" stroke-dasharray="10,5"/>`
    + scrapers
    + `<circle cx="${x0}" cy="${ym}" r="14" fill="#1a1d22" stroke="#e8a317" stroke-width="2"/>`
    + `<circle cx="${x1}" cy="${ym}" r="14" fill="#1a1d22" stroke="#9aa0ae" stroke-width="1.5"/>`
    + `<text x="${(x0+x1)/2}" y="${ym-trH/2-8}" text-anchor="middle" fill="#e8a317" font-size="14">→</text>`
    + _dimH(x0, x1, 114, `L = ${L} м`)
    + `<text x="${x0}" y="${ym-trH/2-16}" text-anchor="middle" fill="#9aa0ae" font-size="9" font-family="monospace">ПРИВІД</text>`
    + `</svg>`;
}

// ── Roller conveyor ───────────────────────────────────────────
function schemaRoller(p) {
  const beta = parseFloat(p.beta || 0);
  const bR = beta * Math.PI / 180;
  const x0 = 50, x1 = 510;
  const L = ((p.L||0)/1000).toFixed(1);
  const yt = 82, yd = Math.max(20, Math.round(yt - (x1-x0)*Math.tan(bR)*0.5));
  const n = 10;
  const rollers = Array.from({length: n}, (_, i) => {
    const t = (i+0.5)/n;
    const x = Math.round(x0 + t*(x1-x0));
    const y = Math.round(yt + t*(yd-yt));
    return `<circle cx="${x}" cy="${y}" r="7" fill="#14161a" stroke="#9aa0ae" stroke-width="1.5"/>`;
  }).join('');
  const lx = Math.round(x0 + (x1-x0)*0.35);
  const ly = Math.round(yt + (yd-yt)*0.35);

  return _svgOpen(560, 128)
    + `<line x1="${x0}" y1="${yt}" x2="${x1}" y2="${yd}" stroke="#5c6270" stroke-width="1.5"/>`
    + rollers
    + `<rect x="${lx-45}" y="${ly-36}" width="90" height="24" rx="3" fill="rgba(232,163,23,0.15)" stroke="#e8a317" stroke-width="1.5"/>`
    + `<text x="${lx}" y="${ly-20}" text-anchor="middle" fill="#e8a317" font-size="10" font-family="monospace">${p.m||'—'} кг</text>`
    + _dimH(x0, x1, 116, `L = ${L} м${beta > 0 ? ' · β = '+beta+'°' : ''}`)
    + `</svg>`;
}

// ── Bucket elevator ───────────────────────────────────────────
function schemaBucket(p) {
  const H = ((p.H||0)/1000).toFixed(1);
  const xt = 120, xb = 440, ytop = 12, ybot = 118;
  const bH = ybot - ytop, mx = (xt+xb)/2;
  const bkts = [0.15, 0.43, 0.71].map(t => {
    const y = Math.round(ytop + t*bH);
    return `<rect x="${xt+10}" y="${y-7}" width="24" height="14" rx="2" fill="#1a1d22" stroke="#e8a317" stroke-width="1.5"/>`;
  }).join('');

  return _svgOpen(560, 135)
    + `<rect x="${xt}" y="${ytop}" width="${xb-xt}" height="${bH}" rx="4" fill="#0f1114" stroke="#9aa0ae" stroke-width="1.5"/>`
    + `<line x1="${xt+24}" y1="${ytop+12}" x2="${xt+24}" y2="${ybot-12}" stroke="#e8a317" stroke-width="2"/>`
    + `<line x1="${xb-24}" y1="${ytop+12}" x2="${xb-24}" y2="${ybot-12}" stroke="#5c6270" stroke-width="1.5" stroke-dasharray="6,4"/>`
    + `<ellipse cx="${mx}" cy="${ytop+10}" rx="40" ry="10" fill="#1a1d22" stroke="#e8a317" stroke-width="2"/>`
    + `<ellipse cx="${mx}" cy="${ybot-10}" rx="40" ry="10" fill="#1a1d22" stroke="#9aa0ae" stroke-width="1.5"/>`
    + bkts
    + _dimV(xb+20, ytop, ybot, `H=${H}м`)
    + `<text x="${mx}" y="${ytop-2}" text-anchor="middle" fill="#9aa0ae" font-size="9" font-family="monospace">ГОЛОВА / РОЗВАНТАЖЕННЯ</text>`
    + `<text x="${mx}" y="${ybot+14}" text-anchor="middle" fill="#9aa0ae" font-size="9" font-family="monospace">ЗАВАНТАЖЕННЯ</text>`
    + `<text x="${xt+30}" y="${ytop+42}" fill="#e8a317" font-size="14">↑</text>`
    + `</svg>`;
}

// ── Builder block diagram ─────────────────────────────────────
function schemaBuilder(state, labels) {
  const blocks = [
    { x:14,  y:44, w:108, label: labels.drive[state.drive] || state.drive,     color:'#e8a317' },
    { x:148, y:44, w:120, label: labels.shaft[state.shaft] || state.shaft,     color:'#9aa0ae' },
    { x:300, y:44, w:110, label: labels.traction[state.traction] || state.traction, color:'#9aa0ae' },
    { x:440, y:44, w:108, label: labels.carrier[state.carrier] || state.carrier, color:'#9aa0ae' },
  ];
  const H = 48;
  const blockSvg = blocks.map(b => {
    const lines = _wrap(b.label, 13);
    const ty = b.y + H/2 - (lines.length-1)*6.5 + 4;
    return `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${H}" rx="5" fill="#1a1d22" stroke="${b.color}" stroke-width="${b.color==='#e8a317'?2:1.5}"/>`
      + lines.map((l,i) => `<text x="${b.x+b.w/2}" y="${ty+i*13}" text-anchor="middle" fill="${b.color}" font-size="9.5" font-family="sans-serif">${l}</text>`).join('');
  }).join('');

  const arrows = [[122,68,148,68],[268,68,300,68],[410,68,440,68]]
    .map(([x1,y1,x2,y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#5c6270" stroke-width="1.5" marker-end="url(#ar)"/>`).join('');

  const guideLabel = labels.guide[state.guide] || state.guide;
  const gx=300, gy=108, gw=110, gh=38;
  const gl = _wrap(guideLabel, 14);
  const guideSvg = `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" rx="5" fill="#1a1d22" stroke="#5c6270" stroke-width="1.5"/>`
    + gl.map((l,i) => `<text x="${gx+gw/2}" y="${gy+gh/2-(gl.length-1)*6+i*12+4}" text-anchor="middle" fill="#5c6270" font-size="9" font-family="sans-serif">${l}</text>`).join('')
    + `<line x1="${gx+gw/2}" y1="${gy}" x2="${gx+gw/2}" y2="${gy-9}" stroke="#5c6270" stroke-width="1.5" marker-end="url(#ar)"/>`;

  return _svgOpen(562, 158)
    + blockSvg + arrows + guideSvg
    + `<text x="355" y="154" text-anchor="middle" fill="#5c6270" font-size="9" font-family="monospace">НАПРЯМНІ</text>`
    + `</svg>`;
}

function _wrap(text, maxLen) {
  const words = text.split(/\s+/), lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur+' '+w).trim().length > maxLen) { if (cur) lines.push(cur); cur = w; }
    else cur = (cur+' '+w).trim();
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [text];
}

// ── Main dispatch ─────────────────────────────────────────────
function makeSchema(type, inputs) {
  const map = { belt: schemaBelt, screw: schemaScrew, mesh_chain: schemaMeshChain, chain_scraper: schemaScraper, roller: schemaRoller, bucket_belt: schemaBucket, plate: schemaMeshChain, drag: schemaScraper, screw_vertical: schemaScrew };
  if (type === 'builder' && inputs && inputs.state) return schemaBuilder(inputs.state, inputs.labels);
  return (map[type] || (() => ''))(inputs);
}

// ── Report download ───────────────────────────────────────────
function downloadReport(opts) {
  const { title, subtitle, schemaHtml, resultsHtml, inputRows, steps, checks } = opts;
  const date = new Date().toLocaleDateString('uk-UA');

  const css = `
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;font-size:12px;color:#111;background:#fff;padding:22px 34px}
h1{font-size:17px;font-weight:700;margin-bottom:2px}
h2{font-size:11.5px;color:#555;font-weight:400}
.hdr{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #e8a317;padding-bottom:11px;margin-bottom:16px}
.brand{font-family:monospace;font-size:20px;font-weight:700}.brand span{color:#e8a317}
.meta{font-size:10px;color:#777;text-align:right;line-height:1.6}
.sec{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#c87a00;border-bottom:1px solid #e8a317;padding-bottom:3px;margin:15px 0 9px}
table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:10px}
td,th{border:1px solid #ddd;padding:4px 8px}
th{background:#f5f5f5;font-weight:600;text-align:left}
.v{font-family:monospace;font-weight:700}
.schema-box{background:#f8f8f8;border:1px solid #ddd;border-radius:5px;padding:10px;text-align:center;margin:6px 0}
.schema-box svg{width:100%;max-width:510px;filter:invert(1) hue-rotate(180deg) contrast(0.82)}
.step{display:flex;gap:10px;margin-bottom:7px;padding:8px 10px;background:#fafafa;border:1px solid #eee;border-radius:4px}
.step-n{font-family:monospace;font-weight:700;color:#fff;background:#e8a317;border-radius:3px;padding:2px 7px;font-size:11px;min-width:24px;text-align:center;height:fit-content;margin-top:1px;white-space:nowrap}
.step-body{flex:1;min-width:0}
.step-body strong{font-size:11px;color:#222;display:block;margin-bottom:4px}
.step-formula{font-family:monospace;font-size:11px;color:#333;background:#f0f0f0;padding:3px 7px;border-left:3px solid #e8a317;margin:3px 0;word-break:break-all}
.step-sub{font-family:monospace;font-size:10.5px;color:#666;padding:2px 7px 2px 10px;margin:2px 0;word-break:break-all}
.step-result{font-family:monospace;font-size:12px;font-weight:700;color:#c87a00;margin-top:4px}
.rgroup-t{font-family:monospace;font-size:9.5px;letter-spacing:1px;text-transform:uppercase;color:#c87a00;border-bottom:1px solid #f0c060;padding-bottom:3px;margin:10px 0 5px}
.rrow{display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #eee;font-size:11px}
.rrow:last-child{border-bottom:none}.rk{color:#555;flex:1}
.rv{font-family:monospace;font-weight:700;white-space:nowrap}
.rv .u{font-size:9.5px;color:#999;font-weight:400;margin-left:2px}
.res-hl{background:#fff8e1;border:1px solid #f0c060;border-radius:4px;padding:10px;text-align:center;margin-bottom:10px}
.res-hl .big{font-family:monospace;font-size:22px;font-weight:700;color:#c87a00;display:block}
.res-hl .lbl{font-size:10px;color:#888}
.note{padding:5px 9px;border-radius:3px;font-size:10.5px;margin-top:5px;line-height:1.5}
.note.ok{background:#f0fdf4;border:1px solid #86efac;color:#166534}
.note.warn{background:#fef2f2;border:1px solid #fca5a5;color:#991b1b}
.note.info{background:#eff6ff;border:1px solid #93c5fd;color:#1e40af}
.formula{background:#f5f5f5;border-left:3px solid #e8a317;padding:7px 10px;font-family:monospace;font-size:10px;line-height:1.9;margin:7px 0;overflow-x:auto}
.formula b{color:#c87a00;font-weight:600}
.bres-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.schema{background:#f5f5f5;border:1px solid #ddd;border-radius:4px;padding:10px 14px;font-family:monospace;font-size:10px;color:#555;margin-bottom:10px}
.ft{margin-top:18px;border-top:1px solid #ddd;padding-top:8px;font-size:9.5px;color:#aaa;text-align:center}
@media print{body{padding:8px 20px}}
.sc-pdf{margin:8px 0}
.sc-head{display:grid;grid-template-columns:1fr 140px 140px 70px;gap:4px;background:#f5f5f5;padding:4px 8px;font-size:9.5px;font-weight:700;border-bottom:2px solid #e8a317}
.sc-row-pdf{display:grid;grid-template-columns:1fr 140px 140px 70px;gap:4px;padding:4px 8px;border-bottom:1px solid #eee;font-size:10.5px}
.pill{display:inline-block;padding:1px 6px;border-radius:3px;font-size:9px;font-weight:700;font-family:monospace}
.pill.ok{background:#dcfce7;color:#166534}.pill.warn{background:#fef9c3;color:#854d0e}.pill.err{background:#fee2e2;color:#991b1b}
.sb-pdf{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:4px;margin:8px 0;font-weight:700;font-size:12px}
.sb-pdf.ok{background:#dcfce7;border:1px solid #86efac;color:#166534}
.sb-pdf.warn{background:#fef9c3;border:1px solid #fde047;color:#854d0e}
.sb-pdf.err{background:#fee2e2;border:1px solid #fca5a5;color:#991b1b}`;

  const scorecardPdfHtml = (checks && checks.length) ? (() => {
    const overall = checks.some(c => c.status === 'err') ? 'err' : checks.some(c => c.status === 'warn') ? 'warn' : 'ok';
    const badgeText = { ok: '✓ КОНСТРУКЦІЯ ПРОХОДИТЬ ПЕРЕВІРКУ', warn: '⚠ КОНСТРУКЦІЯ ПОТРЕБУЄ УВАГИ', err: '✗ КОНСТРУКЦІЯ НЕ ПРОХОДИТЬ ПЕРЕВІРКУ' }[overall];
    const rows = checks.map(c => `<div class="sc-row-pdf"><span>${c.name}</span><span class="v">${c.value}</span><span>${c.limit||'—'}</span><span><span class="pill ${c.status}">${c.status==='ok'?'OK':c.status==='warn'?'WARN':'ERR'}</span></span></div>`).join('');
    return `<div class="sb-pdf ${overall}">${badgeText}</div><div class="sc-pdf"><div class="sc-head"><span>Перевірка</span><span>Значення</span><span>Допустимо</span><span>Статус</span></div>${rows}</div>`;
  })() : '';

  const stepsHtml = (steps && steps.length) ? `
<div class="sec">Хід розрахунку</div>
${steps.map(s => `<div class="step">
  <div class="step-n">${s.n}</div>
  <div class="step-body">
    <strong>${s.title}</strong>
    <div class="step-formula">${s.formula}</div>
    <div class="step-sub">= ${s.sub}</div>
    <div class="step-result">→ ${s.result}</div>
  </div>
</div>`).join('')}` : '';

  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html lang="uk"><head>
<meta charset="UTF-8"><title>${title} — Розрахунок EngCalc</title>
<style>${css}</style></head><body>
<div class="hdr">
  <div><div class="brand"><span>Eng</span>Calc</div><h1>${title}</h1><h2>${subtitle||''}</h2></div>
  <div class="meta">Дата: ${date}<br>Передпроєктний розрахунок</div>
</div>
<div class="sec">Вхідні дані</div>
<table><tr><th>Параметр</th><th>Значення</th><th>Одиниця</th></tr>
${(inputRows||[]).map(r=>`<tr><td>${r[0]}</td><td class="v">${r[1]}</td><td>${r[2]||''}</td></tr>`).join('')}
</table>
<div class="sec">Принципова схема</div>
<div class="schema-box">${schemaHtml||'<p style="color:#aaa;padding:16px">—</p>'}</div>
${scorecardPdfHtml ? `<div class="sec">Перевірка конструкції</div>${scorecardPdfHtml}` : ''}
${stepsHtml}
<div class="sec">Підсумкові результати</div>
${resultsHtml||''}
<div class="ft">EngCalc · Результати є передпроєктними. Для робочого проєкту виконуйте перевірочний розрахунок за чинними стандартами ISO / DIN / ДСТУ.</div>
<script>window.onload=()=>window.print()<\/script>
</body></html>`);
  w.document.close();
}
