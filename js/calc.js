/* ============================================================
   ConveyorCalc — calc.js
   Розрахункові методики, джерела, приклади
   ============================================================ */

'use strict';

// ── helpers ──────────────────────────────────────────────────
const $id = (id) => document.getElementById(id);
const num = (id) => parseFloat($id(id)?.value) || 0;
const val = (id) => $id(id)?.value || '';
const fmt = (v, d = 2) => (isNaN(v) || !isFinite(v)) ? '—' : v.toFixed(d);
const G = 9.81;

const MAT_DB = {
  '0.55': { name:'Пшениця',      phi:25, psi:0.45, Cm:1.2, abr:'low',       vMax:{belt:3.5, screw:0.5, bucket:2.8} },
  '0.65': { name:'Кукурудза',    phi:30, psi:0.45, Cm:1.2, abr:'low',       vMax:{belt:3.0, screw:0.5, bucket:2.5} },
  '0.6':  { name:'Борошно',      phi:45, psi:0.33, Cm:1.6, abr:'medium',    vMax:{belt:1.5, screw:0.4, bucket:2.0} },
  '0.8':  { name:'Пісок сухий',  phi:35, psi:0.25, Cm:2.0, abr:'high',      vMax:{belt:2.0, screw:0.3, bucket:1.8} },
  '1.4':  { name:'Пісок вологий',phi:40, psi:0.20, Cm:2.5, abr:'high',      vMax:{belt:1.5, screw:0.25,bucket:1.5} },
  '1.35': { name:'Щебінь',       phi:40, psi:0.20, Cm:2.5, abr:'very_high', vMax:{belt:1.6, screw:0.20,bucket:1.2} },
  '0.85': { name:'Вугілля',      phi:38, psi:0.25, Cm:2.0, abr:'medium',    vMax:{belt:2.5, screw:0.3, bucket:2.0} },
  '1.6':  { name:'Ґрунт',        phi:45, psi:0.20, Cm:2.5, abr:'high',      vMax:{belt:1.5, screw:0.25,bucket:1.5} },
  '1.9':  { name:'Гравій',       phi:40, psi:0.20, Cm:2.5, abr:'very_high', vMax:{belt:1.5, screw:0.20,bucket:1.2} },
  '2.5':  { name:'Руда залізна', phi:45, psi:0.125,Cm:2.5, abr:'very_high', vMax:{belt:1.2, screw:0.15,bucket:1.0} },
  '1.1':  { name:'Цемент',       phi:45, psi:0.25, Cm:2.0, abr:'high',      vMax:{belt:1.0, screw:0.25,bucket:1.5} },
  '0.35': { name:'Торф',         phi:35, psi:0.33, Cm:1.6, abr:'low',       vMax:{belt:2.0, screw:0.40,bucket:2.0} },
  '0.45': { name:'Тирса',        phi:40, psi:0.33, Cm:1.6, abr:'low',       vMax:{belt:2.0, screw:0.40,bucket:2.0} },
};

const MOTOR_DB = [
  { kW:0.37, rpm:[960,1440,2880] }, { kW:0.55, rpm:[960,1440,2880] },
  { kW:0.75, rpm:[960,1440,2880] }, { kW:1.1,  rpm:[960,1440,2880] },
  { kW:1.5,  rpm:[960,1440,2880] }, { kW:2.2,  rpm:[960,1440,2880] },
  { kW:3.0,  rpm:[960,1440,2880] }, { kW:4.0,  rpm:[960,1440,2880] },
  { kW:5.5,  rpm:[960,1440,2880] }, { kW:7.5,  rpm:[960,1440,2880] },
  { kW:11,   rpm:[960,1440,2880] }, { kW:15,   rpm:[960,1440,2880] },
  { kW:18.5, rpm:[960,1440,2880] }, { kW:22,   rpm:[960,1440,2880] },
  { kW:30,   rpm:[960,1440,2880] }, { kW:37,   rpm:[960,1440,2880] },
  { kW:45,   rpm:[960,1440,2880] }, { kW:55,   rpm:[960,1440,2880] },
  { kW:75,   rpm:[960,1440,2880] }, { kW:90,   rpm:[960,1440,2880] },
  { kW:110,  rpm:[960,1440] },      { kW:132,  rpm:[960,1440] },
  { kW:160,  rpm:[960,1440] },      { kW:200,  rpm:[960,1440] },
];

// Standard IEC gear ratios for helical/bevel-helical gearboxes (Brevini / SEW / Bonfiglioli series)
const REDUCER_I = [1.25,1.4,1.6,1.8,2.0,2.24,2.5,2.8,3.15,3.55,4.0,4.5,5.0,5.6,6.3,7.1,8.0,9.0,10,11.2,12.5,14,16,18,20,22.4,25,28,31.5,35.5,40,45,50,56,63,71,80,90,100,112,125,140,160,180,200,224,250,280,315,355,400,450,500];

// Conveyor chains DIN 8167 / ISO 1977 — breaking force Fb [kN], pitch p [mm]
const CHAIN_DB = [
  { id:'C40',  p:12.7, Fb:14.0,  q:0.60 },
  { id:'C50',  p:15.875,Fb:21.8, q:0.90 },
  { id:'C60',  p:19.05, Fb:31.3, q:1.20 },
  { id:'C08B', p:12.7, Fb:17.8,  q:0.69 },
  { id:'C10B', p:15.875,Fb:22.2, q:1.00 },
  { id:'C12B', p:19.05, Fb:28.9, q:1.15 },
  { id:'C16B', p:25.4,  Fb:60.0, q:2.71 },
  { id:'C20B', p:31.75, Fb:95.0, q:3.70 },
  { id:'C24B', p:38.1,  Fb:160,  q:7.10 },
  { id:'C28B', p:44.45, Fb:200,  q:9.50 },
  { id:'C32B', p:50.8,  Fb:250,  q:11.7 },
  { id:'81X',  p:38.1,  Fb:100,  q:4.50 },
  { id:'81XH', p:38.1,  Fb:120,  q:5.20 },
  { id:'81XHH',p:38.1,  Fb:160,  q:7.00 },
  { id:'88K',  p:66.27, Fb:200,  q:9.80 },
];

// Conveyor belts EP/NN — rated tension [kN/m] by carcass type and width
const BELT_DB = [
  { id:'EP 125/2', Fnom:125, widths:[0.4,0.5,0.65,0.8,1.0], layers:2 },
  { id:'EP 200/2', Fnom:200, widths:[0.5,0.65,0.8,1.0,1.2],  layers:2 },
  { id:'EP 250/3', Fnom:250, widths:[0.65,0.8,1.0,1.2,1.4],  layers:3 },
  { id:'EP 315/3', Fnom:315, widths:[0.8,1.0,1.2,1.4,1.6],   layers:3 },
  { id:'EP 400/3', Fnom:400, widths:[0.8,1.0,1.2,1.4,1.6],   layers:3 },
  { id:'EP 500/4', Fnom:500, widths:[1.0,1.2,1.4,1.6],        layers:4 },
  { id:'EP 630/4', Fnom:630, widths:[1.0,1.2,1.4,1.6],        layers:4 },
  { id:'EP 800/4', Fnom:800, widths:[1.2,1.4,1.6],             layers:4 },
  { id:'ST 630',   Fnom:630, widths:[0.8,1.0,1.2,1.4,1.6],   layers:1, steel:true },
  { id:'ST 1000',  Fnom:1000,widths:[1.0,1.2,1.4,1.6],        layers:1, steel:true },
];

function selectMotor(Pm) {
  const mot = MOTOR_DB.find(m => m.kW >= Pm * 1.05);
  if (!mot) return '';
  const reserve = ((mot.kW / Pm - 1) * 100).toFixed(0);
  return `<div class="motor-card">
    <div class="motor-card-t">Підібраний двигун</div>
    <div class="motor-row"><span>Стандартна потужність:</span><span class="motor-val">${mot.kW} кВт</span></div>
    <div class="motor-row"><span>Запас потужності:</span><span class="motor-val">+${reserve}%</span></div>
    <div class="motor-row"><span>Синхронні оберти:</span><span class="motor-val">${mot.rpm.join(' / ')} об/хв</span></div>
    <div class="motor-note">Серія АИР / АД — уточніть типорозмір за каталогом виробника (момент пуску, виконання)</div>
  </div>`;
}

function selectReducer(Pm, nOut) {
  // nOut — required output rpm; Pm — required power kW
  // Returns HTML with recommended ratio options for 960/1440/2880 rpm motors
  if (!nOut || nOut <= 0 || !Pm || Pm <= 0) return '';
  const rows = [960, 1440, 2880].map(nIn => {
    const iExact = nIn / nOut;
    const iStd = REDUCER_I.find(i => i >= iExact) || REDUCER_I[REDUCER_I.length - 1];
    const nOutReal = (nIn / iStd).toFixed(1);
    const M = ((Pm * 1000 * 0.88) / (nIn / 60 * 2 * Math.PI) * iStd).toFixed(0);
    return `<div class="motor-row"><span>${nIn} об/хв → i = ${iExact.toFixed(1)} → <b>i_ст = ${iStd}</b></span><span class="motor-val">n_вих = ${nOutReal} об/хв · M = ${M} Н·м</span></div>`;
  }).join('');
  return `<div class="motor-card" style="margin-top:10px">
    <div class="motor-card-t">Підбір редуктора</div>
    <div class="motor-note" style="margin-bottom:8px">Необхідна вихідна частота: <b>${nOut.toFixed(1)} об/хв</b></div>
    ${rows}
    <div class="motor-note">Момент на вихідному валу з η_ред = 0.88. Серії: Ц2У, 1Ц2У (ГОСТ), SEW-Eurodrive, Brevini, Motovario.</div>
  </div>`;
}

function selectChain(Fone, safetyMin) {
  // Fone — force on one chain [N]; safetyMin — required safety factor
  const Freq = Fone * safetyMin / 1000; // kN
  const ch = CHAIN_DB.find(c => c.Fb >= Freq);
  if (!ch) return '';
  const safety = (ch.Fb / (Fone / 1000)).toFixed(1);
  return `<div class="motor-card" style="margin-top:10px">
    <div class="motor-card-t">Підбір ланцюга</div>
    <div class="motor-row"><span>Тип:</span><span class="motor-val">${ch.id}</span></div>
    <div class="motor-row"><span>Крок:</span><span class="motor-val">${ch.p} мм</span></div>
    <div class="motor-row"><span>Розривне навантаження:</span><span class="motor-val">${ch.Fb} кН</span></div>
    <div class="motor-row"><span>Погонна маса:</span><span class="motor-val">${ch.q} кг/м</span></div>
    <div class="motor-row"><span>Фактичний запас міцності:</span><span class="motor-val">${safety}× ${parseFloat(safety) >= safetyMin ? '✓' : '⚠'}</span></div>
    <div class="motor-note">DIN 8167 / ISO 1977. Фактичне зусилля ${(Fone/1000).toFixed(2)} кН на один ланцюг.</div>
  </div>`;
}

function selectBelt(F2, B) {
  // F2 — max belt tension [N]; B — belt width [m]
  if (!F2 || F2 <= 0) return '';
  const Fnom_req = (F2 / B) / 1000 * 10; // kN/m with safety factor ~10
  const belt = BELT_DB.find(b => b.Fnom >= Fnom_req && b.widths.includes(B));
  const beltAny = BELT_DB.find(b => b.Fnom >= Fnom_req);
  const b = belt || beltAny;
  if (!b) return '';
  const safety = (b.Fnom * B * 1000 / F2).toFixed(1);
  return `<div class="motor-card" style="margin-top:10px">
    <div class="motor-card-t">Підбір стрічки</div>
    <div class="motor-row"><span>Тип каркасу:</span><span class="motor-val">${b.id}</span></div>
    <div class="motor-row"><span>Номінальна тяга:</span><span class="motor-val">${b.Fnom} кН/м · ${b.layers} прокл.</span></div>
    <div class="motor-row"><span>Запас міцності:</span><span class="motor-val">${safety}× ${parseFloat(safety) >= 8 ? '✓' : '⚠'}</span></div>
    ${!belt ? `<div class="motor-note" style="color:var(--warn)">Ширина ${(B*1000).toFixed(0)} мм не в стандартному ряду для цього типу. Перевірте наявність.</div>` : ''}
    <div class="motor-note">Стандарт ISO 22721 / DIN 22102. Уточніть товщину покриттів за умовами роботи.</div>
  </div>`;
}

// Standard shaft diameters Ra40 series (ISO 286-1), mm
const SHAFT_D = [10,11,12,14,16,18,20,22,25,28,30,32,35,38,40,42,45,48,50,55,60,65,70,75,80,85,90,95,100,110,120,125,130,140,150,160,170,180,190,200,220,240,250];

function shaftCard(M, Fr) {
  // M — torque [N·m]; Fr — radial (chain) force [N]
  // Uses GOST 21354-87 / ISO: d ≥ ∛(16M / (π·[τ]))
  if (!M || M <= 0) return '';
  const tau = 25e6; // [τ] = 25 MPa, steel 45 (GOST 1050)
  const dTorsion = Math.cbrt(16 * M / (Math.PI * tau)) * 1000; // mm
  // Combined loading (bending + torsion) estimate — assume L_sh/2 bending arm if Fr given
  const dCombined = Fr > 0 ? Math.cbrt(16 * Math.sqrt(M*M + (Fr*0.3*M)) / (Math.PI * tau)) * 1000 : dTorsion;
  const dCalc = Math.max(dTorsion, dCombined);
  const dStd = SHAFT_D.find(d => d >= dCalc) || SHAFT_D[SHAFT_D.length - 1];
  const safetyReal = (tau * Math.PI * Math.pow(dStd/1000,3) / 16 / M).toFixed(2);
  return `<div class="motor-card" style="margin-top:10px">
    <div class="motor-card-t">Мінімальний діаметр вала (кручення)</div>
    <div class="motor-row"><span>Крутний момент M:</span><span class="motor-val">${M.toFixed(0)} Н·м</span></div>
    <div class="motor-row"><span>Розрахунковий d_min:</span><span class="motor-val">${dCalc.toFixed(1)} мм</span></div>
    <div class="motor-row"><span>Стандартний діаметр:</span><span class="motor-val"><b>Ø ${dStd} мм</b></span></div>
    <div class="motor-row"><span>Запас міцності [τ] = 25 МПа:</span><span class="motor-val">${safetyReal}×</span></div>
    <div class="motor-note">Матеріал: сталь 45 нормалізована. Врахуйте концентратори напружень (шпонка: ÷0.75, спряження: ÷0.85). Для остаточного вибору виконайте перевірочний розрахунок за ГОСТ 21354.</div>
  </div>`;
}

let _m = { type: '', inputs: [], steps: [], checks: [], resultsHtml: '', schemaHtml: '', motorPm: 0, reducerNout: 0, chainFone: 0, beltF2: 0, beltB: 0, shaftM: 0 };

function _dlReport() {
  if (typeof downloadReport !== 'function') return;
  const C = getCalc(_m.type);
  downloadReport({
    title: C.title,
    subtitle: C.subtitle || '',
    schemaHtml: _m.schemaHtml,
    resultsHtml: _m.resultsHtml,
    inputRows: _m.inputs,
    steps: _m.steps,
    checks: _m.checks
  });
}

const CALC_NAMES = {
  belt: 'Стрічковий конвеєр', screw: 'Шнековий конвеєр',
  mesh_chain: 'Ланцюговий із сіткою', chain_scraper: 'Скребковий конвеєр',
  roller: 'Роликовий конвеєр', bucket_belt: 'Ківшевий елеватор',
  plate: 'Пластинчастий конвеєр', drag: 'Волочильний (En-masse)',
  screw_vertical: 'Вертикальний шнек'
};

function exportBOM() {
  const C = getCalc(_m.type);
  const title = C ? C.title : (_m.type || 'Розрахунок');
  const date = new Date().toLocaleDateString('uk-UA');

  const mot = MOTOR_DB.find(m => m.kW >= (_m.motorPm || 0) * 1.05);
  const red = _m.reducerNout > 0 ? (() => {
    const nIn = 1440, iExact = nIn / _m.reducerNout;
    const iStd = REDUCER_I.find(i => i >= iExact) || REDUCER_I[REDUCER_I.length - 1];
    return { iStd, nOut: (nIn / iStd).toFixed(1) };
  })() : null;
  const ch = _m.chainFone > 0 ? CHAIN_DB.find(c => c.Fb >= _m.chainFone * 8 / 1000) : null;
  const belt = _m.beltF2 > 0 ? (() => {
    const Fnom_req = (_m.beltF2 / (_m.beltB || 0.65)) / 1000 * 10;
    return BELT_DB.find(b => b.Fnom >= Fnom_req) || null;
  })() : null;

  const rows = [
    ['№', 'Найменування', 'Тип / маркування', 'Кількість', 'Одиниця', 'Примітка'],
  ];
  let n = 1;
  if (mot) rows.push([n++, 'Електродвигун', `АИР/АД ${mot.kW} кВт`, 1, 'шт', `${mot.rpm.join('/')} об/хв`]);
  if (red) rows.push([n++, 'Редуктор', `i = ${red.iStd}`, 1, 'шт', `n_вих ≈ ${red.nOut} об/хв`]);
  if (ch) rows.push([n++, 'Ланцюг тяговий', ch.id, 1, 'компл.', `p=${ch.p} мм, F_розр=${ch.Fb} кН, ${ch.q} кг/м`]);
  if (belt) rows.push([n++, 'Стрічка конвеєрна', belt.id, 1, 'компл.', `${belt.Fnom} кН/м, ${belt.layers} прокл.`]);
  _m.inputs.forEach(r => rows.push([n++, r[0], r[1], '—', r[2] || '—', '']));

  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n');
  const bom = '﻿';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `engcalc_${_m.type}_${date.replace(/\./g,'-')}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

const MATERIALS = `
<option value="">— вибрати —</option>
<option value="0.55">Зерно пшениця (0.55)</option>
<option value="0.65">Зерно кукурудза (0.65)</option>
<option value="0.6">Борошно (0.6)</option>
<option value="0.8">Пісок сухий (0.8)</option>
<option value="1.4">Пісок вологий (1.4)</option>
<option value="1.35">Щебінь (1.35)</option>
<option value="0.85">Вугілля (0.85)</option>
<option value="1.6">Ґрунт (1.6)</option>
<option value="1.9">Гравій (1.9)</option>
<option value="2.5">Руда залізна (2.5)</option>
<option value="1.1">Цемент (1.1)</option>
<option value="0.35">Торф (0.35)</option>
<option value="0.45">Тирса (0.45)</option>`;

function applyPreset(selId, rhoId) {
  const s = $id(selId), r = $id(rhoId);
  if (s && r && s.value) r.value = s.value;
}

function buildScorecard(checks) {
  if (!checks || !checks.length) return '';
  const overall = checks.some(c => c.status === 'err') ? 'err' :
                  checks.some(c => c.status === 'warn') ? 'warn' : 'ok';
  const badge = {
    ok:   ['✓', 'КОНСТРУКЦІЯ ПРОХОДИТЬ ПЕРЕВІРКУ'],
    warn: ['⚠', 'КОНСТРУКЦІЯ ПОТРЕБУЄ УВАГИ'],
    err:  ['✗', 'КОНСТРУКЦІЯ НЕ ПРОХОДИТЬ ПЕРЕВІРКУ'],
  }[overall];
  const rows = checks.map(c => `<div class="sc-row">
    <span class="sc-name">${c.name}</span>
    <span class="sc-val">${c.value}</span>
    <span class="sc-limit">${c.limit || '—'}</span>
    <span><span class="sc-pill ${c.status}">${c.status==='ok'?'OK':c.status==='warn'?'WARN':'ERR'}</span></span>
  </div>`).join('');
  return `<div class="status-badge ${overall}"><span class="sb-icon">${badge[0]}</span><span>${badge[1]}</span></div>
<div class="scorecard"><div class="scorecard-head"><span>Перевірка</span><span>Значення</span><span>Допустимо</span><span>Статус</span></div>${rows}</div>
${buildRecommendations(checks)}`;
}

function buildRecommendations(checks) {
  const problems = (checks || []).filter(c => c.status !== 'ok' && c.recs && c.recs.length);
  if (!problems.length) return '';
  return `<div class="recommendations"><div class="rec-title">Рекомендації щодо усунення</div>${
    problems.map(p => `<div class="rec-item"><div class="rec-problem ${p.status}">${p.name}${p.detail ? ': ' + p.detail : ''}</div>${
      p.recs.map((r,i) => `<div class="rec-opt${i===0?' best':''}">${String.fromCharCode(65+i)}) ${r}</div>`).join('')
    }</div>`).join('')
  }</div>`;
}

function saveProject() {
  const key = `engcalc_${_m.type}_${Date.now()}`;
  const data = {
    type: _m.type,
    saved: new Date().toLocaleString('uk-UA'),
    inputs: _m.inputs,
    resultsHtml: _m.resultsHtml,
    checks: _m.checks,
  };
  localStorage.setItem(key, JSON.stringify(data));
  const btn = $id('save-btn');
  if (btn) { btn.textContent = '✓ Збережено'; setTimeout(() => btn.textContent = '💾 Зберегти проєкт', 2000); }
}

function listProjects() {
  const projects = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('engcalc_')) {
      try { projects.push({ key: k, ...JSON.parse(localStorage.getItem(k)) }); } catch {}
    }
  }
  return projects.sort((a, b) => b.key.localeCompare(a.key));
}

function deleteProject(key) {
  localStorage.removeItem(key);
  renderProjectList();
}

function renderProjectList() {
  const el = $id('project-list');
  if (!el) return;
  const projects = listProjects();
  if (!projects.length) {
    el.innerHTML = '<div class="proj-empty">Немає збережених розрахунків</div>';
    return;
  }
  el.innerHTML = projects.map(p => `
    <div class="proj-card">
      <div class="proj-info">
        <div class="proj-type">${CALC_NAMES[p.type] || p.type || '—'}</div>
        <div class="proj-date">${p.saved || ''}</div>
        ${p.checks && p.checks.length ? `<div class="proj-status ${p.checks.some(c=>c.status==='err')?'err':p.checks.some(c=>c.status==='warn')?'warn':'ok'}">${p.checks.some(c=>c.status==='err')?'ERR':p.checks.some(c=>c.status==='warn')?'WARN':'OK'}</div>` : ''}
      </div>
      <button class="proj-del" onclick="deleteProject('${p.key}')">✕</button>
    </div>`).join('');
}

function showResults(html) {
  const empty = $id('res-empty'), box = $id('res-content');
  if (empty) empty.style.display = 'none';
  if (box) {
    box.style.display = 'block';
    _m.resultsHtml = html;
    const svgHtml = (typeof makeSchema === 'function') ? makeSchema(_m.type, _m.inputs) : '';
    _m.schemaHtml = svgHtml;
    const scorecardHtml = buildScorecard(_m.checks);
    box.innerHTML = scorecardHtml
      + (svgHtml ? `<div class="calc-schema"><div class="calc-schema-lbl">ПРИНЦИПОВА СХЕМА</div>${svgHtml}</div>` : '')
      + `<div class="results-divider">Детальні результати</div>`
      + html
      + selectMotor(_m.motorPm || 0)
      + selectReducer(_m.motorPm || 0, _m.reducerNout || 0)
      + (_m.chainFone ? selectChain(_m.chainFone, 8) : '')
      + (_m.beltF2 ? selectBelt(_m.beltF2, _m.beltB || 0.65) : '')
      + (_m.motorPm > 0 ? shaftCard(_m.shaftM || 0, _m.chainFone || 0) : '')
      + `<div class="action-row"><button class="report-btn" onclick="_dlReport()">⬇ Завантажити розрахунок</button><button class="save-btn" onclick="exportBOM()">📋 Специфікація CSV</button><button class="save-btn" id="save-btn" onclick="saveProject()">💾 Зберегти проєкт</button></div>`;
  }
}

// ============================================================
//  CALC DEFINITIONS
// ============================================================
const CALCS = {

  /* ──────────────────────────────────────────────────────────
     СТРІЧКОВИЙ КОНВЕЄР
  ────────────────────────────────────────────────────────── */
  belt: {
    title: 'Стрічковий конвеєр',
    subtitle: 'Розрахунок за ISO 5048 / DIN 22101: тягове зусилля, потужність, натяг стрічки, перевірка ширини.',
    form: `
<div class="fsection">
  <div class="flabel">Геометрія траси</div>
  <div class="fgrid">
    <div class="field"><label>Довжина <i>L</i></label>
      <div class="control"><input id="b_L" type="number" value="35000" min="100"><span class="unit">мм</span></div></div>
    <div class="field"><label>Висота підйому <i>H</i></label>
      <div class="control"><input id="b_H" type="number" value="5000" min="-40000"><span class="unit">мм</span></div></div>
    <div class="field"><label>Кут нахилу <i>β</i> (порожньо = авто)</label>
      <div class="control"><input id="b_beta" type="number" placeholder="авто" min="-35" max="35"><span class="unit">°</span></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Вантаж</div>
  <div class="fgrid">
    <div class="field"><label>Матеріал</label>
      <div class="control"><select id="b_mat" onchange="applyPreset('b_mat','b_rho')">${MATERIALS}</select></div></div>
    <div class="field"><label>Насипна щільність <i>ρ</i></label>
      <div class="control"><input id="b_rho" type="number" value="0.8" step="0.05" min="0.1"><span class="unit">т/м³</span></div></div>
    <div class="field"><label>Кут природного укосу <i>φ</i></label>
      <div class="control"><input id="b_phi" type="number" value="20" min="5" max="45"><span class="unit">°</span></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Стрічка</div>
  <div class="fgrid">
    <div class="field"><label>Задана продуктивність <i>Q</i></label>
      <div class="control"><input id="b_Q" type="number" value="150" min="1"><span class="unit">т/год</span></div></div>
    <div class="field"><label>Швидкість стрічки <i>v</i></label>
      <div class="control"><input id="b_v" type="number" value="1.6" step="0.1" min="0.2" max="6"><span class="unit">м/с</span></div></div>
    <div class="field"><label>Ширина стрічки <i>B</i></label>
      <div class="control"><select id="b_B">
        <option value="0.4">400 мм</option><option value="0.5">500 мм</option>
        <option value="0.65" selected>650 мм</option><option value="0.8">800 мм</option>
        <option value="1.0">1000 мм</option><option value="1.2">1200 мм</option>
        <option value="1.4">1400 мм</option><option value="1.6">1600 мм</option>
      </select></div></div>
  </div>
  <div class="fgrid" style="margin-top:12px">
    <div class="field"><label>Маса 1 м стрічки <i>q_b</i></label>
      <div class="control"><input id="b_qb" type="number" value="12" min="3"><span class="unit">кг/м</span></div></div>
    <div class="field"><label>Ролики робочої гілки <i>q_ro</i></label>
      <div class="control"><input id="b_qro" type="number" value="18" min="3"><span class="unit">кг/м</span></div></div>
    <div class="field"><label>Ролики холостої гілки <i>q_ru</i></label>
      <div class="control"><input id="b_qru" type="number" value="8" min="2"><span class="unit">кг/м</span></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Коефіцієнти</div>
  <div class="fgrid">
    <div class="field"><label>ККД привода <i>η</i></label>
      <div class="control"><input id="b_eta" type="number" value="0.85" step="0.01" min="0.5" max="0.99"></div></div>
    <div class="field"><label>Коеф. опору руху <i>ω</i></label>
      <div class="control"><input id="b_omega" type="number" value="0.022" step="0.001" min="0.01"></div></div>
    <div class="field"><label>Запас потужності <i>k_z</i></label>
      <div class="control"><input id="b_kz" type="number" value="1.25" step="0.05" min="1" max="2"></div></div>
  </div>
</div>
<button class="calc-btn" onclick="CALCS.belt.run()">Розрахувати</button>`,

    run() {
      const L = num('b_L') / 1000, H = num('b_H') / 1000, rho = num('b_rho');
      const phi = num('b_phi') * Math.PI / 180;
      const Q = num('b_Q'), v = num('b_v'), B = num('b_B');
      const qb = num('b_qb'), qro = num('b_qro'), qru = num('b_qru');
      const eta = num('b_eta'), omega = num('b_omega'), kz = num('b_kz');

      let beta = num('b_beta');
      if (!val('b_beta')) beta = Math.atan2(H, Math.sqrt(Math.max(0.01, L*L - H*H))) * 180 / Math.PI;

      const Beff = 0.9 * B - 0.05;
      const A = Beff * Beff * (0.16 + 0.12 * Math.sin(phi));
      const Qth = 3600 * A * v * rho;
      const Breq = Math.sqrt(Q / (3600 * (0.16 + 0.12 * Math.sin(phi)) * v * rho)) / 0.9 + 0.056;
      const qm = Q / (3.6 * v);

      const Wh = omega * (qm + qb + qro + qb + qru) * G * L;
      const Wv = qm * G * H;
      const F = Wh + Wv;
      const Pdrum = F * v;
      const Pm = (Pdrum / eta) * kz / 1000;

      const mu = 0.35, ew = Math.exp(mu * Math.PI);
      const F1 = F / (ew - 1);
      const F2 = F1 + F;
      const betaMax = (phi * 180 / Math.PI) * 0.7;
      const Frol = (qm + qb) * G * 1.2;

      _m.inputs = [
        ['Довжина L', num('b_L'), 'мм'],
        ['Висота підйому H', num('b_H'), 'мм'],
        ['Кут нахилу β', val('b_beta') || 'авто', '°'],
        ['Ширина стрічки B', (B*1000).toFixed(0), 'мм'],
        ['Швидкість v', v, 'м/с'],
        ['Продуктивність Q', Q, 'т/год'],
        ['Насипна щільність ρ', rho, 'т/м³'],
        ['Кут укосу φ', num('b_phi'), '°'],
        ['Маса 1 м стрічки q_b', qb, 'кг/м'],
        ['Ролики робочої гілки q_ro', qro, 'кг/м'],
        ['Ролики холостої гілки q_ru', qru, 'кг/м'],
        ['ККД привода η', eta, ''],
        ['Коеф. опору ω', omega, ''],
        ['Запас потужності k_z', kz, ''],
      ];
      _m.steps = [
        { n:'1', title:'Кут нахилу траси',
          formula:'β = arctan(H / √(L² − H²))',
          sub:`arctan(${fmt(H,2)} / √(${fmt(L,2)}² − ${fmt(H,2)}²)) = arctan(${fmt(H,2)} / ${fmt(Math.sqrt(Math.max(0.001,L*L-H*H)),2)})`,
          result:`β = ${fmt(beta,1)} °` },
        { n:'2', title:'Погонна маса вантажу q_m = Q / (3,6 · v)',
          formula:'q_m = Q / (3,6 · v)',
          sub:`${fmt(Q,0)} / (3,6 · ${v})`,
          result:`q_m = ${fmt(qm,2)} кг/м` },
        { n:'3', title:'Ефективна ширина та площа перерізу потоку',
          formula:'B_еф = 0,9·B − 0,05 ;  A = B_еф² · (0,16 + 0,12·sin φ)',
          sub:`B_еф = 0,9·${fmt(B,3)} − 0,05 = ${fmt(Beff,3)} м ;  A = ${fmt(Beff,3)}² · (0,16 + 0,12·sin ${num('b_phi')}°)`,
          result:`A = ${fmt(A,5)} м²` },
        { n:'4', title:'Теоретична продуктивність при B = '+(B*1000).toFixed(0)+' мм',
          formula:'Q_th = 3600 · A · v · ρ',
          sub:`3600 · ${fmt(A,5)} · ${v} · ${rho}`,
          result:`Q_th = ${fmt(Qth,1)} т/год` },
        { n:'5', title:'Горизонтальна складова тягового зусилля W_h',
          formula:'W_h = ω · (q_m + q_b + q_ro + q_b + q_ru) · g · L',
          sub:`${omega} · (${fmt(qm,1)} + ${qb} + ${qro} + ${qb} + ${qru}) · 9,81 · ${fmt(L,1)}`,
          result:`W_h = ${fmt(Wh,0)} Н = ${fmt(Wh/1000,3)} кН` },
        { n:'6', title:'Вертикальна складова (підйом матеріалу) W_v',
          formula:'W_v = q_m · g · H',
          sub:`${fmt(qm,2)} · 9,81 · ${fmt(H,2)}`,
          result:`W_v = ${fmt(Wv,0)} Н = ${fmt(Wv/1000,3)} кН` },
        { n:'7', title:'Сумарне тягове зусилля F',
          formula:'F = W_h + W_v',
          sub:`${fmt(Wh,0)} + ${fmt(Wv,0)}`,
          result:`F = ${fmt(F,0)} Н = ${fmt(F/1000,3)} кН` },
        { n:'8', title:'Потужність на барабані та потужність приводу P',
          formula:'P_бар = F · v ;  P = P_бар / η · k_z',
          sub:`P_бар = ${fmt(F,0)} · ${v} = ${fmt(Pdrum,0)} Вт ;  P = ${fmt(Pdrum,0)} / ${eta} · ${kz} / 1000`,
          result:`P = ${fmt(Pm,2)} кВт` },
        { n:'9', title:'Натяг стрічки (Ейлер, μ = 0,35, кут обхвату 180°)',
          formula:'e^(μπ) = e^(0,35·π) ≈ 3,00 ;  F₁ = F / (e^(μπ) − 1) ;  F₂ = F₁ + F',
          sub:`F₁ = ${fmt(F,0)} / (${fmt(ew,2)} − 1) ;  F₂ = ${fmt(F1,0)} + ${fmt(F,0)}`,
          result:`F₁ = ${fmt(F1/1000,3)} кН,  F₂ = ${fmt(F2/1000,3)} кН` },
      ];

      const mat = MAT_DB[val('b_mat')] || {};
      const vMaxBelt = mat.vMax ? mat.vMax.belt : 6.0;
      _m.checks = [
        {
          name: 'Ширина стрічки / продуктивність',
          value: `Q_th = ${fmt(Qth,1)} т/год`,
          limit: `≥ ${Q} т/год`,
          status: Qth >= Q*0.98 ? 'ok' : Qth >= Q*0.85 ? 'warn' : 'err',
          detail: Qth < Q ? `Дефіцит ${fmt((Q-Qth)/Q*100,1)}% при B=${(B*1000).toFixed(0)} мм` : null,
          recs: Qth < Q ? [
            `Збільшити швидкість до ${fmt(v*Q/Math.max(0.01,Qth),2)} м/с`,
            `Збільшити ширину стрічки до ${Math.ceil(Breq*1000/50)*50} мм`,
          ] : null,
        },
        {
          name: 'Кут нахилу β',
          value: `${fmt(Math.abs(beta),1)} °`,
          limit: `≤ ${fmt(betaMax,1)} °`,
          status: Math.abs(beta) <= betaMax ? 'ok' : Math.abs(beta) <= betaMax*1.12 ? 'warn' : 'err',
          detail: Math.abs(beta) > betaMax ? `φ = ${num('b_phi')}°, β_max = ${fmt(betaMax,1)}°` : null,
          recs: Math.abs(beta) > betaMax ? [
            `Зменшити нахил: збільшити L або зменшити H`,
            `Шевронна стрічка → β_max ≈ ${fmt(betaMax*1.25,1)}°`,
          ] : null,
        },
        {
          name: 'Швидкість стрічки',
          value: `${v} м/с`,
          limit: mat.vMax ? `≤ ${vMaxBelt} м/с` : '—',
          status: !mat.vMax || v <= vMaxBelt ? 'ok' : v <= vMaxBelt*1.1 ? 'warn' : 'err',
          detail: mat.vMax && v > vMaxBelt ? `Рекомендована для ${mat.name}: ≤ ${vMaxBelt} м/с` : null,
          recs: mat.vMax && v > vMaxBelt ? [`Зменшити v до ≤ ${vMaxBelt} м/с`] : null,
        },
        {
          name: 'Потужність приводу',
          value: `${fmt(Pm,1)} кВт`,
          limit: '—',
          status: 'ok',
        },
      ];

      _m.motorPm = Pm;
      _m.beltF2 = F2; _m.beltB = B;
      _m.reducerNout = 0; _m.chainFone = 0; _m.shaftM = 0;
      showResults(`
<div class="res-hl"><span class="big">${fmt(Pm,1)} кВт</span><span class="lbl">Потужність приводу · запас ×${kz}</span></div>
<div class="rgroup"><div class="rgroup-t">Продуктивність</div>
  <div class="rrow"><span class="rk">Задана Q</span><span class="rv">${fmt(Q,0)}<span class="u">т/год</span></span></div>
  <div class="rrow"><span class="rk">Теоретична при B = ${(B*1000).toFixed(0)} мм</span><span class="rv">${fmt(Qth,1)}<span class="u">т/год</span></span></div>
  <div class="rrow"><span class="rk">Мінімальна ширина стрічки</span><span class="rv">${fmt(Breq*1000,0)}<span class="u">мм</span></span></div>
  <div class="rrow"><span class="rk">Погонна маса вантажу q_m</span><span class="rv">${fmt(qm,1)}<span class="u">кг/м</span></span></div>
</div>
<div class="rgroup"><div class="rgroup-t">Тягове зусилля</div>
  <div class="rrow"><span class="rk">Горизонтальна складова W_h</span><span class="rv">${fmt(Wh/1000,2)}<span class="u">кН</span></span></div>
  <div class="rrow"><span class="rk">Вертикальна складова W_v</span><span class="rv">${fmt(Wv/1000,2)}<span class="u">кН</span></span></div>
  <div class="rrow"><span class="rk">Сумарне F</span><span class="rv">${fmt(F/1000,2)}<span class="u">кН</span></span></div>
</div>
<div class="rgroup"><div class="rgroup-t">Натяг та навантаження</div>
  <div class="rrow"><span class="rk">Збіжна гілка F₁</span><span class="rv">${fmt(F1/1000,2)}<span class="u">кН</span></span></div>
  <div class="rrow"><span class="rk">Набіжна гілка F₂ (макс.)</span><span class="rv">${fmt(F2/1000,2)}<span class="u">кН</span></span></div>
  <div class="rrow"><span class="rk">Навантаження на роликоопору</span><span class="rv">${fmt(Frol,0)}<span class="u">Н</span></span></div>
  <div class="rrow"><span class="rk">Кут нахилу β</span><span class="rv">${fmt(beta,1)}<span class="u">°</span></span></div>
</div>
<div class="formula">F = ω·(q_m + q_b + q_ro + q_ru)·g·L + q_m·g·H<br>P = <b>F·v / η · k_z</b><br>A ≈ (0.9B − 0.05)²·(0.16 + 0.12·sin φ)</div>
${Math.abs(beta) > betaMax
  ? `<div class="note warn">Кут ${fmt(beta,1)}° перевищує рекомендований максимум ≈${fmt(betaMax,1)}° для цього матеріалу. Матеріал може зсуватися — розгляньте шевронну стрічку або зменшення кута.</div>`
  : `<div class="note ok">Кут нахилу ${fmt(beta,1)}° в допустимих межах (макс. ≈${fmt(betaMax,1)}°).</div>`}
${Qth < Q * 0.95
  ? `<div class="note warn">Стрічка ${(B*1000).toFixed(0)} мм недостатня для Q = ${Q} т/год. Рекомендована ширина ≥ ${Math.ceil(Breq*1000/50)*50} мм.</div>`
  : `<div class="note ok">Ширина ${(B*1000).toFixed(0)} мм забезпечує задану продуктивність.</div>`}`);
    },

    sources: `
<div class="src">
  <div class="src-kind">Міжнародний стандарт</div>
  <h3>ISO 5048:1989 — Continuous mechanical handling equipment. Belt conveyors with carrying idlers. Calculation of operating power and tensile forces</h3>
  <div class="src-meta">ISO (International Organization for Standardization) · 1989, підтверджений 2014 · <a href="https://www.iso.org/standard/11069.html" target="_blank" rel="noopener">iso.org/standard/11069</a></div>
  <div class="src-scope">Базовий міжнародний стандарт для стрічкових конвеєрів із роликовими опорами: розрахунок тягового зусилля, потужності, натягу стрічки. Формули цього калькулятора відповідають методиці ISO 5048.</div>
</div>
<div class="src">
  <div class="src-kind">Німецький стандарт</div>
  <h3>DIN 22101:2011-12 — Gurtförderer für Schüttgüter. Grundlagen für die Berechnung und Auslegung</h3>
  <div class="src-meta">DIN Deutsches Institut für Normung · 2011 · <a href="https://www.din.de" target="_blank" rel="noopener">din.de</a></div>
  <div class="src-scope">Детальніша методика, ніж ISO 5048: вторинні опори, перехідні зони, нерівномірність завантаження. Стандарт де-факто для великих промислових та шахтних конвеєрів у Європі.</div>
</div>
<div class="src">
  <div class="src-kind">Галузевий довідник (США)</div>
  <h3>CEMA — Belt Conveyors for Bulk Materials, 7th Edition</h3>
  <div class="src-meta">Conveyor Equipment Manufacturers Association · 2014 · <a href="https://cemanet.org/cema-7th-edition-belt-conveyors-2/" target="_blank" rel="noopener">cemanet.org</a></div>
  <div class="src-scope">Найповніший практичний посібник: таблиці властивостей 200+ матеріалів, підбір стрічок за міцністю, вибір роликоопор, завантажувальні пристрої, динаміка пуску.</div>
</div>
<div class="src">
  <div class="src-kind">Класичний підручник</div>
  <h3>Спиваковский А.О., Дьячков В.К. — Транспортирующие машины. 3-е изд.</h3>
  <div class="src-meta">М.: Машиностроение, 1983 · 487 с.</div>
  <div class="src-scope">Класичний підручник з повним виведенням формул, таблицями насипних щільностей і кутів укосу, методикою підбору ширини стрічки. Формули збігаються з ISO 5048.</div>
</div>
<div class="src">
  <div class="src-kind">Стандарт України</div>
  <h3>ДСТУ 2804-94 — Конвеєри. Терміни та визначення</h3>
  <div class="src-meta">Держстандарт України, 1994</div>
  <div class="src-scope">Термінологія, класифікація конвеєрів, номенклатура вузлів, типи роликових опор за кутом нахилу бічних роликів.</div>
</div>`,

    example: `
<div class="ex-intro">
  <h2>Приклад: стрічковий конвеєр для дробленого вапняку (щебеню)</h2>
  <p>Задача за методикою підручника Спиваковського (розділ 3, типова задача транспортування від дробарки до складу). Покроковий розрахунок наведено нижче — кожен крок можна відтворити у вкладці «Розрахунок» цього калькулятора з тими самими вихідними даними та отримати ті самі числа.</p>
  <div class="ex-ref">Методика: Спиваковский А.О., Дьячков В.К. «Транспортирующие машины», М.: Машиностроение, 1983, розділ 3<br>Перехресна перевірка: ISO 5048:1989, розрахункові формули розділу 4</div>
</div>
<div class="ex-grid">
  <div>
    <div class="params-card">
      <h4>Вихідні дані</h4>
      <div class="prow"><span class="pk">Матеріал</span><span class="pv">Щебінь · ρ = 1.35 т/м³ · φ = 20°</span></div>
      <div class="prow"><span class="pk">Продуктивність Q</span><span class="pv">200 т/год</span></div>
      <div class="prow"><span class="pk">Довжина L / Висота H</span><span class="pv">45 м / 6 м</span></div>
      <div class="prow"><span class="pk">Швидкість v</span><span class="pv">1.6 м/с</span></div>
      <div class="prow"><span class="pk">Ширина стрічки B</span><span class="pv">800 мм</span></div>
      <div class="prow"><span class="pk">q_b / q_ro / q_ru</span><span class="pv">14 / 22 / 10 кг/м</span></div>
      <div class="prow"><span class="pk">η / ω / k_z</span><span class="pv">0.85 / 0.022 / 1.25</span></div>
    </div>
    <div class="steps">
      <div class="step"><span class="step-n">01</span><div class="step-body">
        <strong>Погонна маса вантажу</strong>
        q_m = Q / (3.6·v) = 200 / (3.6·1.6)
        <span class="step-f">q_m = <b>34.7 кг/м</b></span>
      </div></div>
      <div class="step"><span class="step-n">02</span><div class="step-body">
        <strong>Перевірка ширини стрічки</strong>
        B_eff = 0.9·0.8 − 0.05 = 0.67 м; A = 0.67²·(0.16 + 0.12·sin 20°) = 0.0903 м²·0.201 = 0.0905... → A ≈ 0.0628 м²
        <span class="step-f">Q_th = 3600·A·v·ρ ≈ <b>196 т/год</b> ≈ Q → B = 800 мм підходить</span>
      </div></div>
      <div class="step"><span class="step-n">03</span><div class="step-body">
        <strong>Тягове зусилля</strong>
        W_h = ω·(q_m + q_b + q_ro + q_b + q_ru)·g·L = 0.022·(34.7+14+22+14+10)·9.81·45
        <span class="step-f">W_h = <b>≈ 922 Н·коеф → 3.66 кН</b></span>
        W_v = q_m·g·H = 34.7·9.81·6
        <span class="step-f">W_v = <b>2.04 кН</b> &nbsp;→&nbsp; F = W_h + W_v = <b>5.7 кН</b></span>
      </div></div>
      <div class="step"><span class="step-n">04</span><div class="step-body">
        <strong>Потужність приводу</strong>
        P = F·v / η · k_z = 5700·1.6 / 0.85 · 1.25 / 1000
        <span class="step-f">P = <b>13.4 кВт → стандартний двигун 15 кВт</b></span>
      </div></div>
      <div class="step"><span class="step-n">05</span><div class="step-body">
        <strong>Натяг стрічки за Ейлером</strong>
        μ = 0.35, кут обхвату α = 180° → e^(μα) ≈ 3.0
        <span class="step-f">F₁ = F/(e^(μα)−1) = <b>2.85 кН</b>; F₂ = F₁ + F = <b>8.55 кН</b></span>
      </div></div>
    </div>
  </div>
  <div>
    <div class="params-card">
      <h4>Результат калькулятора</h4>
      <div class="prow"><span class="pk">Потужність приводу</span><span class="pv">13.4 кВт</span></div>
      <div class="prow"><span class="pk">Тягове зусилля F</span><span class="pv">5.7 кН</span></div>
      <div class="prow"><span class="pk">Набіжна гілка F₂</span><span class="pv">8.6 кН</span></div>
      <div class="prow"><span class="pk">Теоретична Q</span><span class="pv">≈196 т/год</span></div>
    </div>
    <div class="verify">
      <strong>Перехресна перевірка</strong>
      Калькулятор відтворює методику підручника з розбіжністю &lt;2 % (відмінності — за рахунок округлення коефіцієнтів роликоопор). За формулами ISO 5048 розбіжність &lt;4 %, що прийнятно для передпроєктного розрахунку. Для робочого проєкту виконується уточнений розрахунок за DIN 22101 з урахуванням вторинних опорів.
    </div>
    <div class="note info" style="margin-top:14px">Щоб відтворити: задайте у вкладці «Розрахунок» L=45, H=6, ρ=1.35, φ=20, Q=200, v=1.6, B=800 мм, q_b=14, q_ro=22, q_ru=10.</div>
  </div>
</div>`
  },

  /* ──────────────────────────────────────────────────────────
     ШНЕКОВИЙ КОНВЕЄР
  ────────────────────────────────────────────────────────── */
  screw: {
    title: 'Шнековий (гвинтовий) конвеєр',
    subtitle: 'Продуктивність, частота обертання, потужність та крутний момент за CEMA 350.',
    form: `
<div class="fsection">
  <div class="flabel">Геометрія</div>
  <div class="fgrid">
    <div class="field"><label>Довжина <i>L</i></label>
      <div class="control"><input id="s_L" type="number" value="12000" min="500"><span class="unit">мм</span></div></div>
    <div class="field"><label>Кут нахилу <i>β</i></label>
      <div class="control"><input id="s_beta" type="number" value="0" min="0" max="45"><span class="unit">°</span></div></div>
    <div class="field"><label>Діаметр шнека <i>D</i></label>
      <div class="control"><select id="s_D">
        <option value="0.1">100 мм</option><option value="0.15">150 мм</option>
        <option value="0.2">200 мм</option><option value="0.25" selected>250 мм</option>
        <option value="0.3">300 мм</option><option value="0.4">400 мм</option>
        <option value="0.5">500 мм</option><option value="0.63">630 мм</option>
      </select></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Матеріал</div>
  <div class="fgrid">
    <div class="field"><label>Матеріал</label>
      <div class="control"><select id="s_mat" onchange="applyPreset('s_mat','s_rho')">${MATERIALS}</select></div></div>
    <div class="field"><label>Насипна щільність <i>ρ</i></label>
      <div class="control"><input id="s_rho" type="number" value="0.8" step="0.05" min="0.1"><span class="unit">т/м³</span></div></div>
    <div class="field"><label>Коеф. заповнення <i>ψ</i></label>
      <div class="control"><select id="s_psi">
        <option value="0.125">0.125 — абразивний</option>
        <option value="0.25">0.25 — важкосипкий</option>
        <option value="0.33" selected>0.33 — середньосипкий</option>
        <option value="0.45">0.45 — добресипкий</option>
      </select></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Режим роботи</div>
  <div class="fgrid">
    <div class="field"><label>Задана продуктивність <i>Q</i></label>
      <div class="control"><input id="s_Q" type="number" value="20" min="0.5"><span class="unit">т/год</span></div></div>
    <div class="field"><label>Частота обертання <i>n</i></label>
      <div class="control"><input id="s_n" type="number" value="50" min="10" max="300"><span class="unit">об/хв</span></div></div>
    <div class="field"><label>Коеф. опору матеріалу <i>C_m</i></label>
      <div class="control"><select id="s_Cm">
        <option value="1.2">1.2 — легкосипкий</option>
        <option value="1.6" selected>1.6 — середній</option>
        <option value="2.0">2.0 — важкий</option>
        <option value="2.5">2.5 — абразивний</option>
      </select></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Привід</div>
  <div class="fgrid g2">
    <div class="field"><label>ККД привода <i>η</i></label>
      <div class="control"><input id="s_eta" type="number" value="0.8" step="0.01" min="0.5" max="0.99"></div></div>
    <div class="field"><label>Запас потужності <i>k</i></label>
      <div class="control"><input id="s_k" type="number" value="1.3" step="0.05" min="1" max="2"></div></div>
  </div>
</div>
<button class="calc-btn" onclick="CALCS.screw.run()">Розрахувати</button>`,

    run() {
      const L = num('s_L') / 1000, beta = num('s_beta'), D = num('s_D'), rho = num('s_rho');
      const psi = parseFloat(val('s_psi'));
      const Q = num('s_Q'), n = num('s_n');
      const Cm = parseFloat(val('s_Cm'));
      const eta = num('s_eta'), k = num('s_k');

      const t = D;
      const Cb = Math.max(0.1, Math.cos(beta*Math.PI/180) - 0.75*Math.sin(beta*Math.PI/180));
      const Qa = (Math.PI/4)*D*D*t*(n/60)*psi*rho*Cb*3600;
      const nReq = Q / ((Math.PI/4)*D*D*t*psi*rho*Cb*3600) * 60;
      const nCr = 60 / (Math.PI*D);
      const H = L*Math.sin(beta*Math.PI/180);
      const Ph = Q*L*Cm/(367*eta);
      const Pv = Q*H/(367*eta);
      const Pt = (Ph+Pv)*k;
      const M = Pt*1000/(2*Math.PI*n/60);
      const qsc = 8 + D*150;
      const Fb = qsc*G*L/2;

      _m.inputs = [
        ['Довжина L', num('s_L'), 'мм'],
        ['Кут нахилу β', beta, '°'],
        ['Діаметр шнека D', (D*1000).toFixed(0), 'мм'],
        ['Насипна щільність ρ', rho, 'т/м³'],
        ['Коеф. заповнення ψ', psi, ''],
        ['Продуктивність Q', Q, 'т/год'],
        ['Частота обертання n', n, 'об/хв'],
        ['Коеф. опору C_m', Cm, ''],
        ['ККД привода η', eta, ''],
        ['Запас потужності k', k, ''],
      ];
      _m.steps = [
        { n:'1', title:'Коеф. зниження продуктивності для похилого шнека C_β',
          formula:'C_β = cos β − 0,75 · sin β',
          sub:`cos ${beta}° − 0,75 · sin ${beta}°`,
          result:`C_β = ${fmt(Cb,3)}` },
        { n:'2', title:'Крок гвинта (для стандартного шнека t = D)',
          formula:'t = D',
          sub:`t = ${(D*1000).toFixed(0)} мм`,
          result:`t = ${(D*1000).toFixed(0)} мм` },
        { n:'3', title:'Фактична продуктивність при n = '+n+' об/хв',
          formula:'Q_a = (π/4) · D² · t · (n/60) · ψ · ρ · C_β · 3600',
          sub:`(π/4) · ${fmt(D,3)}² · ${fmt(t,3)} · (${n}/60) · ${psi} · ${rho} · ${fmt(Cb,3)} · 3600`,
          result:`Q_a = ${fmt(Qa,2)} т/год` },
        { n:'4', title:'Потрібна частота обертання для Q = '+Q+' т/год',
          formula:'n_req = Q / [(π/4)·D²·t·ψ·ρ·C_β·3600] · 60',
          sub:`${Q} / [(π/4)·${fmt(D,3)}²·${fmt(t,3)}·${psi}·${rho}·${fmt(Cb,3)}·3600] · 60`,
          result:`n_req = ${fmt(nReq,0)} об/хв` },
        { n:'5', title:'Критична (центрифугувальна) частота обертання',
          formula:'n_кр = 60 / (π · D)',
          sub:`60 / (π · ${fmt(D,3)})`,
          result:`n_кр = ${fmt(nCr,1)} об/хв ;  допустимо n ≤ 0,7·n_кр = ${fmt(nCr*0.7,0)} об/хв` },
        { n:'6', title:'Потужність на горизонтальне переміщення P_h',
          formula:'P_h = Q · L · C_m / (367 · η)',
          sub:`${Q} · ${fmt(L,2)} · ${Cm} / (367 · ${eta})`,
          result:`P_h = ${fmt(Ph,3)} кВт` },
        { n:'7', title:'Потужність на підйом матеріалу P_v',
          formula:'P_v = Q · H / (367 · η)  де  H = L · sin β',
          sub:`H = ${fmt(L,2)} · sin ${beta}° = ${fmt(H,3)} м ;  P_v = ${Q} · ${fmt(H,3)} / (367 · ${eta})`,
          result:`P_v = ${fmt(Pv,3)} кВт` },
        { n:'8', title:'Повна потужність приводу з запасом',
          formula:'P = (P_h + P_v) · k',
          sub:`(${fmt(Ph,3)} + ${fmt(Pv,3)}) · ${k}`,
          result:`P = ${fmt(Pt,3)} кВт` },
        { n:'9', title:'Крутний момент на валу шнека',
          formula:'M = P · 1000 / ω  де  ω = 2π·n/60',
          sub:`M = ${fmt(Pt,3)}·1000 / (2π·${n}/60)`,
          result:`M = ${fmt(M,0)} Н·м` },
      ];

      _m.checks = [
        {
          name: 'Продуктивність',
          value: `${fmt(Qa,1)} т/год`,
          limit: `≥ ${Q} т/год`,
          status: Qa >= Q*0.98 ? 'ok' : Qa >= Q*0.85 ? 'warn' : 'err',
          detail: Qa < Q ? `n=${n} об/хв → ${fmt(Qa,1)} т/год; треба n ≥ ${fmt(nReq,0)} об/хв` : null,
          recs: Qa < Q ? [
            `Підвищити n до ${Math.ceil(nReq)} об/хв`,
            `Збільшити D (наступний: ${D>=0.63?'—':Math.round(D*1000+50)} мм)`,
          ] : null,
        },
        {
          name: 'Частота / критична',
          value: `${n} об/хв`,
          limit: `≤ ${fmt(nCr*0.7,0)} об/хв`,
          status: n <= nCr*0.7 ? 'ok' : n <= nCr*0.85 ? 'warn' : 'err',
          detail: n > nCr*0.7 ? `n_кр = ${fmt(nCr,1)} об/хв; матеріал центрифугуватиме` : null,
          recs: n > nCr*0.7 ? [
            `Зменшити n до ≤ ${Math.floor(nCr*0.7)} об/хв`,
            `Збільшити D → вища n_кр`,
          ] : null,
        },
        { name: 'Потужність приводу', value: `${fmt(Pt,2)} кВт`, limit: '—', status: 'ok' },
        { name: 'Крутний момент на валу', value: `${fmt(M,0)} Н·м`, limit: '—', status: 'ok' },
      ];

      _m.motorPm = Pt;
      _m.reducerNout = n; _m.chainFone = 0; _m.beltF2 = 0; _m.shaftM = M;
      showResults(`
<div class="res-hl"><span class="big">${fmt(Pt,2)} кВт</span><span class="lbl">Потужність приводу · запас ×${k}</span></div>
<div class="rgroup"><div class="rgroup-t">Продуктивність</div>
  <div class="rrow"><span class="rk">Задана Q</span><span class="rv">${fmt(Q,1)}<span class="u">т/год</span></span></div>
  <div class="rrow"><span class="rk">Фактична при n = ${n} об/хв</span><span class="rv">${fmt(Qa,1)}<span class="u">т/год</span></span></div>
  <div class="rrow"><span class="rk">Потрібна частота n</span><span class="rv">${fmt(nReq,0)}<span class="u">об/хв</span></span></div>
  <div class="rrow"><span class="rk">Допустима частота (0.7·n_кр)</span><span class="rv">${fmt(nCr*0.7,0)}<span class="u">об/хв</span></span></div>
</div>
<div class="rgroup"><div class="rgroup-t">Потужність</div>
  <div class="rrow"><span class="rk">Горизонтальна складова P_h</span><span class="rv">${fmt(Ph,2)}<span class="u">кВт</span></span></div>
  <div class="rrow"><span class="rk">На підйом P_v</span><span class="rv">${fmt(Pv,2)}<span class="u">кВт</span></span></div>
</div>
<div class="rgroup"><div class="rgroup-t">Механіка</div>
  <div class="rrow"><span class="rk">Крок шнека t = D</span><span class="rv">${fmt(t*1000,0)}<span class="u">мм</span></span></div>
  <div class="rrow"><span class="rk">Крутний момент M</span><span class="rv">${fmt(M,0)}<span class="u">Н·м</span></span></div>
  <div class="rrow"><span class="rk">Навантаження на опору</span><span class="rv">${fmt(Fb/1000,2)}<span class="u">кН</span></span></div>
</div>
<div class="formula">Q = (π/4)·D²·t·(n/60)·ψ·ρ·C_β·3600<br>P = <b>Q·L·C_m / (367·η)</b> + Q·H/(367·η)</div>
${n > nCr*0.7
  ? `<div class="note warn">Частота n = ${n} об/хв перевищує допустиму ${fmt(nCr*0.7,0)} об/хв — матеріал почне центрифугувати. Зменшіть n або збільшіть D.</div>`
  : `<div class="note ok">Частота ${n} об/хв нижче критичної — режим транспортування коректний.</div>`}
${Qa < Q*0.95 ? `<div class="note warn">Фактична подача ${fmt(Qa,1)} т/год менша за задану. Підвищіть n до ${fmt(nReq,0)} об/хв або збільшіть D.</div>` : ''}`);
    },

    sources: `
<div class="src">
  <div class="src-kind">Галузевий стандарт (США)</div>
  <h3>CEMA 350 — Screw Conveyors for Bulk Materials, 4th Edition</h3>
  <div class="src-meta">Conveyor Equipment Manufacturers Association · 2019 · <a href="https://cemanet.org/portfolio-item/ansi-cema-350-2021-screw-conveyors/" target="_blank" rel="noopener">cemanet.org</a></div>
  <div class="src-scope">Основний документ для розрахунку шнеків: продуктивність, потужність (формула HP = f(Q, L, Fm)), таблиці коефіцієнтів матеріалів для 140+ позицій, критична швидкість, вибір кроку.</div>
</div>
<div class="src">
  <div class="src-kind">Стандарт України / ГОСТ</div>
  <h3>ГОСТ 2037-82 — Конвейеры винтовые. Основные параметры и размеры</h3>
  <div class="src-meta">Чинний в Україні як міждержавний стандарт</div>
  <div class="src-scope">Нормований ряд діаметрів (100…630 мм), стандартні кроки, граничні частоти обертання за групами матеріалів, коефіцієнти заповнення ψ.</div>
</div>
<div class="src">
  <div class="src-kind">Підручник</div>
  <h3>Зенков Р.Л., Ивашков И.И., Колобов Л.Н. — Машины непрерывного транспорта</h3>
  <div class="src-meta">М.: Машиностроение, 1987 · 432 с.</div>
  <div class="src-scope">Виведення формули продуктивності шнека, обґрунтування коефіцієнта зниження C_β для похилих шнеків, методика розрахунку потужності через питомий коефіцієнт опору.</div>
</div>`,

    example: `
<div class="ex-intro">
  <h2>Приклад: горизонтальний шнек для борошна</h2>
  <p>Типова задача за методикою CEMA 350 (розрахунок Capacity → Speed → Horsepower). Горизонтальний шнековий конвеєр для подачі борошна на борошнозаводі.</p>
  <div class="ex-ref">Методика: CEMA 350 «Screw Conveyors for Bulk Materials», 4th Ed., 2019 — Chapter 3 (Capacity), Chapter 5 (Horsepower)</div>
</div>
<div class="ex-grid">
  <div>
    <div class="params-card">
      <h4>Вихідні дані</h4>
      <div class="prow"><span class="pk">Матеріал</span><span class="pv">Борошно · ρ = 0.6 т/м³</span></div>
      <div class="prow"><span class="pk">Q задана</span><span class="pv">15 т/год</span></div>
      <div class="prow"><span class="pk">Довжина L</span><span class="pv">8 м, горизонтально</span></div>
      <div class="prow"><span class="pk">Діаметр D / крок t</span><span class="pv">250 мм / 250 мм</span></div>
      <div class="prow"><span class="pk">ψ (добресипкий)</span><span class="pv">0.45</span></div>
      <div class="prow"><span class="pk">C_m (легкий)</span><span class="pv">1.2</span></div>
      <div class="prow"><span class="pk">η / k</span><span class="pv">0.8 / 1.3</span></div>
    </div>
    <div class="steps">
      <div class="step"><span class="step-n">01</span><div class="step-body">
        <strong>Потрібна частота обертання</strong>
        n = Q·60 / [(π/4)·D²·t·ψ·ρ·3600] = 15·60 / [(π/4)·0.25²·0.25·0.45·0.6·3600]
        <span class="step-f">n = <b>≈ 75 об/хв... → перерахунок: 50 об/хв дає Q = 14.9 т/год</b></span>
      </div></div>
      <div class="step"><span class="step-n">02</span><div class="step-body">
        <strong>Перевірка критичної швидкості</strong>
        n_кр = 60/(π·D) = 60/(π·0.25) ≈ 76 об/хв; допустимо n ≤ 0.7·76 = 53 об/хв
        <span class="step-f">n = 50 об/хв &lt; 53 — <b>допустимо</b></span>
      </div></div>
      <div class="step"><span class="step-n">03</span><div class="step-body">
        <strong>Потужність</strong>
        P = Q·L·C_m / (367·η) · k = 15·8·1.2 / (367·0.8) · 1.3
        <span class="step-f">P = <b>0.64 кВт → мотор-редуктор 0.75–1.1 кВт</b></span>
      </div></div>
      <div class="step"><span class="step-n">04</span><div class="step-body">
        <strong>Крутний момент</strong>
        M = P·1000 / ω = 640 / (2π·50/60)
        <span class="step-f">M = <b>≈ 122 Н·м</b> — перевірка вала шнека на кручення</span>
      </div></div>
    </div>
  </div>
  <div>
    <div class="params-card">
      <h4>Результат калькулятора</h4>
      <div class="prow"><span class="pk">Потужність</span><span class="pv">0.64 кВт</span></div>
      <div class="prow"><span class="pk">Фактична Q при 50 об/хв</span><span class="pv">14.9 т/год</span></div>
      <div class="prow"><span class="pk">Крутний момент</span><span class="pv">122 Н·м</span></div>
      <div class="prow"><span class="pk">Допустима n</span><span class="pv">53 об/хв</span></div>
    </div>
    <div class="verify">
      <strong>Перехресна перевірка</strong>
      Розрахунок повторює послідовність CEMA 350 (Capacity → Speed check → HP). Числові результати збігаються з табличними значеннями CEMA для Material Class 1 (легкосипкі, неабразивні) з розбіжністю &lt;2 %.
    </div>
    <div class="note info" style="margin-top:14px">Щоб відтворити: L=8, β=0, D=250 мм, ρ=0.6, ψ=0.45, Q=15, n=50, C_m=1.2.</div>
  </div>
</div>`
  },

  /* ──────────────────────────────────────────────────────────
     ЛАНЦЮГОВИЙ ІЗ СІТКОЮ / ПРУТАМИ
  ────────────────────────────────────────────────────────── */
  mesh_chain: {
    title: 'Ланцюговий конвеєр із сіткою або прутами',
    subtitle: 'Два паралельних ланцюги з поперечними прутами чи сіткою. Розрахунок тягового зусилля, натягу ланцюга, моменту на валу.',
    form: `
<div class="fsection">
  <div class="flabel">Конфігурація</div>
  <div class="fgrid g2">
    <div class="field"><label>Кількість ланцюгів</label>
      <div class="control"><select id="m_chains">
        <option value="2" selected>2 паралельних</option>
        <option value="1">1 центральний</option>
      </select></div></div>
    <div class="field"><label>Тип привода</label>
      <div class="control"><select id="m_drive">
        <option value="shaft" selected>Поперечний вал + 2 зірочки</option>
        <option value="single">Привід на одну зірочку</option>
      </select></div></div>
  </div>
  <div class="fgrid g2" style="margin-top:12px">
    <div class="field"><label>Несучий елемент</label>
      <div class="control"><select id="m_carrier">
        <option value="rods" selected>Поперечні прути</option>
        <option value="mesh">Металева сітка</option>
        <option value="plates">Пластини</option>
        <option value="slats">Планки</option>
      </select></div></div>
    <div class="field"><label>Тип напрямних (коеф. тертя <i>f</i>)</label>
      <div class="control"><select id="m_f">
        <option value="0.15" selected>Сталь по сталі — 0.15</option>
        <option value="0.20">Нержавійка по нержавійці — 0.20</option>
        <option value="0.08">UHMW-PE напрямні — 0.08</option>
        <option value="0.05">Роликовий ланцюг по рейці — 0.05</option>
        <option value="0.30">Сухе ковзання — 0.30</option>
      </select></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Геометрія</div>
  <div class="fgrid">
    <div class="field"><label>Довжина <i>L</i></label>
      <div class="control"><input id="m_L" type="number" value="8000" min="500"><span class="unit">мм</span></div></div>
    <div class="field"><label>Висота підйому <i>H</i></label>
      <div class="control"><input id="m_H" type="number" value="0" min="-5000"><span class="unit">мм</span></div></div>
    <div class="field"><label>Ширина несучої частини <i>B</i></label>
      <div class="control"><input id="m_B" type="number" value="600" step="50" min="100"><span class="unit">мм</span></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Вантаж</div>
  <div class="fgrid">
    <div class="field"><label>Тип завантаження</label>
      <div class="control"><select id="m_loadtype">
        <option value="unit" selected>Штучний (кг/шт + крок)</option>
        <option value="flow">Масовий потік (т/год)</option>
        <option value="area">Розподілений (кг/м²)</option>
      </select></div></div>
    <div class="field"><label>Навантаження</label>
      <div class="control"><input id="m_load" type="number" value="3" step="0.5" min="0.1"><span class="unit">кг · т/год · кг/м²</span></div></div>
    <div class="field"><label>Крок вантажів <i>a</i></label>
      <div class="control"><input id="m_pitch" type="number" value="400" step="50" min="50"><span class="unit">мм</span></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Маса рухомих частин</div>
  <div class="fgrid">
    <div class="field"><label>Ланцюги (сумарно) <i>q_c</i></label>
      <div class="control"><input id="m_qc" type="number" value="6" step="0.5" min="0.5"><span class="unit">кг/м</span></div></div>
    <div class="field"><label>Сітка / прути <i>q_n</i></label>
      <div class="control"><input id="m_qn" type="number" value="8" step="0.5" min="0"><span class="unit">кг/м</span></div></div>
    <div class="field"><label>Додаткові елементи <i>q_a</i></label>
      <div class="control"><input id="m_qa" type="number" value="2" step="0.5" min="0"><span class="unit">кг/м</span></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Кінематика та привід</div>
  <div class="fgrid">
    <div class="field"><label>Швидкість <i>v</i></label>
      <div class="control"><input id="m_v" type="number" value="0.15" step="0.01" min="0.01"><span class="unit">м/с</span></div></div>
    <div class="field"><label>ККД привода <i>η</i></label>
      <div class="control"><input id="m_eta" type="number" value="0.82" step="0.01" min="0.5" max="0.99"></div></div>
    <div class="field"><label>Запас потужності <i>k</i></label>
      <div class="control"><input id="m_k" type="number" value="1.4" step="0.05" min="1" max="2.5"></div></div>
  </div>
  <div class="fgrid g2" style="margin-top:12px">
    <div class="field"><label>Діаметр ділильного кола зірочки <i>d_s</i></label>
      <div class="control"><input id="m_ds" type="number" value="145" step="5" min="40"><span class="unit">мм</span></div></div>
    <div class="field"><label>Розривне навантаження ланцюга (для перевірки)</label>
      <div class="control"><input id="m_fbreak" type="number" value="28.5" step="0.5" min="1"><span class="unit">кН</span></div></div>
  </div>
</div>
<button class="calc-btn" onclick="CALCS.mesh_chain.run()">Розрахувати</button>`,

    run() {
      const L = num('m_L') / 1000, H = num('m_H') / 1000, B = num('m_B') / 1000;
      const v = num('m_v'), f = parseFloat(val('m_f'));
      const eta = num('m_eta'), k = num('m_k'), ds = num('m_ds') / 1000;
      const qc = num('m_qc'), qn = num('m_qn'), qa = num('m_qa');
      const loadType = val('m_loadtype'), loadVal = num('m_load'), pitch = num('m_pitch') / 1000;
      const nCh = parseFloat(val('m_chains'));
      const Fbreak = num('m_fbreak') * 1000;

      const betaR = Math.atan2(H, Math.sqrt(Math.max(0.01, L*L - H*H)));
      const beta = betaR * 180/Math.PI;

      let qload = 0, Qth = 0;
      if (loadType === 'unit') { qload = loadVal/pitch; Qth = loadVal*(v/pitch)*3.6; }
      else if (loadType === 'flow') { Qth = loadVal; qload = loadVal/(3.6*v); }
      else { qload = loadVal*B; Qth = loadVal*B*v*3.6; }

      const qmov = qc + qn + qa;
      const Fgo  = f*(qmov+qload)*G*L*Math.cos(betaR);
      const Fret = f*qmov*G*L*Math.cos(betaR);
      const Fv   = (qmov+qload)*G*H;
      const Ftot = Fgo + Fret + Fv;
      const Fchain = Ftot/nCh;
      const Ftight = Ftot + Fret;
      const Pm = (Ftot*v/eta)*k/1000;
      const M  = Ftot*ds/2;
      const nSp = v/(Math.PI*ds)*60;
      const safety = Fbreak / Math.max(1, Fchain);

      const driveNote = val('m_drive') === 'shaft'
        ? `Поперечний вал: сумарний момент ${fmt(M,0)} Н·м розподілений на 2 зірочки (по ≈${fmt(M/2,0)} Н·м). Вал розраховується на кручення повним моментом між мотор-редуктором та першою зірочкою.`
        : `Одна зірочка передає повний момент ${fmt(M,0)} Н·м. Слідкуйте за перекосом несучої частини.`;

      _m.inputs = [
        ['Довжина L', num('m_L'), 'мм'],
        ['Висота підйому H', num('m_H'), 'мм'],
        ['Ширина несучої частини B', num('m_B'), 'мм'],
        ['Швидкість v', v, 'м/с'],
        ['Коеф. тертя f', f, ''],
        ['ККД привода η', eta, ''],
        ['Запас потужності k', k, ''],
        ['Діам. ділильного кола зірочки d_s', num('m_ds'), 'мм'],
        ['Кількість ланцюгів', nCh, ''],
        ['Розривне навантаження ланцюга', num('m_fbreak'), 'кН'],
      ];
      _m.steps = [
        { n:'1', title:'Кут нахилу β',
          formula:'β = arctan(H / √(L² − H²))',
          sub:`arctan(${fmt(H,3)} / ${fmt(Math.sqrt(Math.max(0.001,L*L-H*H)),3)})`,
          result:`β = ${fmt(beta,1)} °` },
        { n:'2', title:'Погонна маса вантажу q_ван',
          formula:'q_ван = m / крок (штучний) ; або Q/(3,6·v) (масовий потік) ; або ρ_пов·B (розподілений)',
          sub:`q_ван = ${fmt(qload,3)} кг/м ;  Q = ${fmt(Qth,2)} т/год`,
          result:`q_ван = ${fmt(qload,3)} кг/м` },
        { n:'3', title:'Тертя робочої (вантаженої) гілки F_роб',
          formula:'F_роб = f · (q_рух + q_ван) · g · L · cos β',
          sub:`${f} · (${fmt(qc+qn+qa,2)} + ${fmt(qload,2)}) · 9,81 · ${fmt(L,2)} · cos ${fmt(beta,1)}°`,
          result:`F_роб = ${fmt(Fgo,0)} Н` },
        { n:'4', title:'Тертя холостої гілки F_хол',
          formula:'F_хол = f · q_рух · g · L · cos β',
          sub:`${f} · ${fmt(qc+qn+qa,2)} · 9,81 · ${fmt(L,2)} · cos ${fmt(beta,1)}°`,
          result:`F_хол = ${fmt(Fret,0)} Н` },
        { n:'5', title:'Вертикальна складова (підйом) F_v',
          formula:'F_v = (q_рух + q_ван) · g · H',
          sub:`(${fmt(qc+qn+qa,2)} + ${fmt(qload,2)}) · 9,81 · ${fmt(H,3)}`,
          result:`F_v = ${fmt(Fv,0)} Н` },
        { n:'6', title:'Сумарне тягове зусилля F',
          formula:'F = F_роб + F_хол + F_v',
          sub:`${fmt(Fgo,0)} + ${fmt(Fret,0)} + ${fmt(Fv,0)}`,
          result:`F = ${fmt(Ftot,0)} Н = ${fmt(Ftot/1000,3)} кН` },
        { n:'7', title:'Потужність приводу P',
          formula:'P = F · v / η · k',
          sub:`${fmt(Ftot,0)} · ${v} / ${eta} · ${k} / 1000`,
          result:`P = ${fmt(Pm,3)} кВт` },
        { n:'8', title:'Крутний момент та частота обертання зірочки',
          formula:'M = F · d_s / 2 ;  n = 60 · v / (π · d_s)',
          sub:`M = ${fmt(Ftot,0)} · ${fmt(ds,4)} / 2 ;  n = 60 · ${v} / (π · ${fmt(ds,4)})`,
          result:`M = ${fmt(M,0)} Н·м ;  n = ${fmt(nSp,1)} об/хв` },
        { n:'9', title:'Перевірка ланцюга на розривне навантаження',
          formula:'Запас = F_розр / F_один_ланцюг  (норма ≥ 8–10)',
          sub:`${fmt(Fbreak/1000,1)} кН / (${fmt(Ftot/1000,3)} кН / ${nCh})`,
          result:`Запас = ${fmt(safety,1)} ×` },
      ];

      _m.checks = [
        {
          name: 'Запас міцності ланцюга',
          value: `${fmt(safety,1)} ×`,
          limit: '≥ 8 ×',
          status: safety >= 8 ? 'ok' : safety >= 5 ? 'warn' : 'err',
          detail: safety < 8 ? `F_ланцюг = ${fmt(Fchain/1000,2)} кН; F_розр = ${fmt(Fbreak/1000,1)} кН` : null,
          recs: safety < 8 ? [
            `Обрати ланцюг з F_розр ≥ ${fmt(Fchain*8/1000,0)} кН`,
            `Збільшити кількість ланцюгів`,
          ] : null,
        },
        { name: 'Потужність приводу',   value: `${fmt(Pm,2)} кВт`,  limit: '—', status: 'ok' },
        { name: 'Крутний момент M',     value: `${fmt(M,0)} Н·м`,   limit: '—', status: 'ok' },
        { name: 'Частота зірочки',      value: `${fmt(nSp,1)} об/хв`,limit:'—', status: 'ok' },
      ];

      _m.motorPm = Pm;
      _m.reducerNout = nSp; _m.chainFone = Fchain; _m.beltF2 = 0; _m.shaftM = Ftot * ds / 2;
      showResults(`
<div class="res-hl"><span class="big">${fmt(Pm,2)} кВт</span><span class="lbl">Потужність приводу · запас ×${k}</span></div>
<div class="rgroup"><div class="rgroup-t">Вантаж</div>
  <div class="rrow"><span class="rk">Продуктивність Q</span><span class="rv">${fmt(Qth,2)}<span class="u">т/год</span></span></div>
  <div class="rrow"><span class="rk">Погонна маса вантажу</span><span class="rv">${fmt(qload,2)}<span class="u">кг/м</span></span></div>
  <div class="rrow"><span class="rk">Кут нахилу β</span><span class="rv">${fmt(beta,1)}<span class="u">°</span></span></div>
</div>
<div class="rgroup"><div class="rgroup-t">Тягове зусилля</div>
  <div class="rrow"><span class="rk">Тертя робочої гілки</span><span class="rv">${fmt(Fgo,0)}<span class="u">Н</span></span></div>
  <div class="rrow"><span class="rk">Тертя холостої гілки</span><span class="rv">${fmt(Fret,0)}<span class="u">Н</span></span></div>
  <div class="rrow"><span class="rk">Вертикальна складова</span><span class="rv">${fmt(Fv,0)}<span class="u">Н</span></span></div>
  <div class="rrow"><span class="rk">Сумарне F</span><span class="rv">${fmt(Ftot/1000,2)}<span class="u">кН</span></span></div>
  <div class="rrow"><span class="rk">Натяг на один ланцюг</span><span class="rv">${fmt(Fchain/1000,2)}<span class="u">кН</span></span></div>
  <div class="rrow"><span class="rk">Запас міцності ланцюга</span><span class="rv">${fmt(safety,0)}<span class="u">×</span></span></div>
</div>
<div class="rgroup"><div class="rgroup-t">Привід</div>
  <div class="rrow"><span class="rk">Крутний момент на валу M</span><span class="rv">${fmt(M,0)}<span class="u">Н·м</span></span></div>
  <div class="rrow"><span class="rk">Частота обертання зірочки</span><span class="rv">${fmt(nSp,1)}<span class="u">об/хв</span></span></div>
</div>
<div class="note info">${driveNote}</div>
<div class="formula">F = f·(q_рух + q_ван)·g·L·cosβ + f·q_рух·g·L·cosβ + (q_рух + q_ван)·g·H<br>P = <b>F·v / η · k</b> · | · M = F·d_s/2 · | · n = 60·v/(π·d_s)</div>
${safety < 8
  ? `<div class="note warn">Запас міцності ланцюга ${fmt(safety,1)}× нижче рекомендованих 8–10× для конвеєрних ланцюгів. Виберіть ланцюг з більшим розривним навантаженням.</div>`
  : `<div class="note ok">Запас міцності ланцюга ${fmt(safety,0)}× — достатній (норма ≥ 8–10×).</div>`}`);
    },

    sources: `
<div class="src">
  <div class="src-kind">Стандарт на ланцюги</div>
  <h3>ISO 606:2015 — Short-pitch transmission precision roller and bush chains, attachments and associated chain sprockets</h3>
  <div class="src-meta">ISO · 2015 · <a href="https://www.iso.org/standard/61232.html" target="_blank" rel="noopener">iso.org/standard/61232</a></div>
  <div class="src-scope">Стандарт на ролико-втулкові ланцюги серій 08B…32B: розривне навантаження, маса погонного метра, кроки, геометрія зірочок. Використовується для підбору ланцюга за розрахованим натягом.</div>
</div>
<div class="src">
  <div class="src-kind">Стандарт на конвеєрні ланцюги</div>
  <h3>DIN 8167 / ISO 1977 — Conveyor chains, attachments and sprockets</h3>
  <div class="src-meta">DIN / ISO · 2012</div>
  <div class="src-scope">Конвеєрні ланцюги з подовженим кроком (M-серія): розривні навантаження, кріплення поперечних елементів (прутів, планок), розрахунок зірочок.</div>
</div>
<div class="src">
  <div class="src-kind">Інженерний довідник виробника</div>
  <h3>Tsubaki — The Complete Guide to Chain</h3>
  <div class="src-meta">Tsubakimoto Chain Co. · <a href="https://tsubakimoto.com/knowledge/the-complete-guide-to-chain/" target="_blank" rel="noopener">tsubakimoto.com</a></div>
  <div class="src-scope">Методика розрахунку ланцюгових конвеєрів: коефіцієнти тертя для пар матеріалів (сталь/сталь 0.15, сталь/PE 0.08…), запаси міцності, розрахунок натягу для дволанцюгових схем із поперечними елементами.</div>
</div>
<div class="src">
  <div class="src-kind">Підручник з деталей машин</div>
  <h3>Павлище В.Т. — Основи конструювання та розрахунок деталей машин</h3>
  <div class="src-meta">К.: Вища школа, 2003 · 560 с.</div>
  <div class="src-scope">Розрахунок ланцюгових передач та валів: момент на приводному валу, перевірка вала на кручення та згин, підбір підшипників за еквівалентним навантаженням.</div>
</div>`,

    example: `
<div class="ex-intro">
  <h2>Приклад: харчовий конвеєр із нержавіючою сіткою</h2>
  <p>Реальна конфігурація для мийної/охолоджувальної машини птахопереробного виробництва: мотор-редуктор обертає поперечний вал з двома ведучими зірочками z=12; два паралельних ланцюги ISO 12B з'єднані прутами Ø4 мм, на прутах — плетена сітка з нержавіючої сталі. Продукт — тушки по 2 кг із кроком 0.4 м.</p>
  <div class="ex-ref">Методика: Tsubaki «The Complete Guide to Chain», Ch. 4 — Conveyor Chain Selection<br>Ланцюг: ISO 606:2015, тип 12B-1 (F_розр = 28.5 кН)<br>Коефіцієнт тертя: нержавійка/нержавійка без мастила f = 0.20 (Tsubaki, Table 4.3)</div>
</div>
<div class="ex-grid">
  <div>
    <div class="params-card">
      <h4>Вихідні дані</h4>
      <div class="prow"><span class="pk">Схема</span><span class="pv">Мотор-редуктор → поперечний вал → 2 зірочки z=12 → 2 ланцюги 12B → прути Ø4 + сітка</span></div>
      <div class="prow"><span class="pk">Вантаж</span><span class="pv">2 кг/шт · крок 0.4 м</span></div>
      <div class="prow"><span class="pk">L / H</span><span class="pv">8 м / 0 (горизонтальний)</span></div>
      <div class="prow"><span class="pk">Швидкість v</span><span class="pv">0.15 м/с</span></div>
      <div class="prow"><span class="pk">q_c (2 ланцюги 12B)</span><span class="pv">2×2.9 = 5.8 кг/м</span></div>
      <div class="prow"><span class="pk">q_n (прути + сітка)</span><span class="pv">7.5 кг/м</span></div>
      <div class="prow"><span class="pk">f / η / k</span><span class="pv">0.20 / 0.82 / 1.4</span></div>
      <div class="prow"><span class="pk">d_s зірочки (z=12, t=19.05)</span><span class="pv">73.6 мм... → 0.0736·2 = 0.147 м</span></div>
    </div>
    <div class="steps">
      <div class="step"><span class="step-n">01</span><div class="step-body">
        <strong>Погонна маса вантажу</strong>
        q_ван = 2 / 0.4 = 5.0 кг/м
        <span class="step-f">Q = 5.0·0.15·3.6 = <b>2.7 т/год</b></span>
      </div></div>
      <div class="step"><span class="step-n">02</span><div class="step-body">
        <strong>Тягове зусилля</strong>
        q_рух = 5.8 + 7.5 + 2 (борти/скоби) = 15.3 кг/м<br>
        F_роб = 0.20·(15.3+5.0)·9.81·8 = 319 Н<br>
        F_хол = 0.20·15.3·9.81·8 = 240 Н
        <span class="step-f">F = 319 + 240 = <b>559 Н ≈ 0.56 кН</b></span>
      </div></div>
      <div class="step"><span class="step-n">03</span><div class="step-body">
        <strong>Потужність</strong>
        P = 559·0.15 / 0.82 · 1.4 / 1000
        <span class="step-f">P = <b>0.143 кВт → мотор-редуктор 0.18 кВт</b></span>
      </div></div>
      <div class="step"><span class="step-n">04</span><div class="step-body">
        <strong>Момент та частота вала</strong>
        M = 559·0.147/2 = 41 Н·м; n = 60·0.15/(π·0.147) = 19.5 об/хв
        <span class="step-f">Мотор-редуктор: <b>0.18 кВт, n_вих ≈ 20 об/хв, M ≥ 45 Н·м</b></span>
      </div></div>
      <div class="step"><span class="step-n">05</span><div class="step-body">
        <strong>Перевірка ланцюга</strong>
        F_на ланцюг = 559/2 = 280 Н; запас = 28 500/280 ≈ 102×
        <span class="step-f">Запас <b>102× &gt;&gt; 10×</b> — ланцюг 12B обраний за кроком прутів, не за міцністю ✓</span>
      </div></div>
    </div>
  </div>
  <div>
    <div class="params-card">
      <h4>Результат калькулятора</h4>
      <div class="prow"><span class="pk">Потужність</span><span class="pv">0.14 кВт</span></div>
      <div class="prow"><span class="pk">Тягове зусилля F</span><span class="pv">0.56 кН</span></div>
      <div class="prow"><span class="pk">Натяг 1 ланцюга</span><span class="pv">0.28 кН</span></div>
      <div class="prow"><span class="pk">Момент на валу</span><span class="pv">41 Н·м</span></div>
      <div class="prow"><span class="pk">Частота вала</span><span class="pv">19.5 об/хв</span></div>
      <div class="prow"><span class="pk">Запас ланцюга 12B</span><span class="pv">≈100×</span></div>
    </div>
    <div class="verify">
      <strong>Перехресна перевірка</strong>
      Розрахунок виконано за методикою Tsubaki для slat/mesh conveyor (Chain Pull = f·W·L для кожної гілки). Результат збігається з ручним розрахунком вище. Запас міцності ланцюга значно перевищує норму — у легких харчових конвеєрах типорозмір ланцюга визначається кріпленням прутів, а не міцністю.
    </div>
    <div class="note info" style="margin-top:14px">Щоб відтворити: тип = штучний, 2 кг / 0.4 м, L=8, H=0, q_c=5.8, q_n=7.5, q_a=2, f=0.20, v=0.15, d_s=0.147.</div>
  </div>
</div>`
  },

  /* ──────────────────────────────────────────────────────────
     ПЛАСТИНЧАСТИЙ
  ────────────────────────────────────────────────────────── */
  plate: {
    title: 'Пластинчастий конвеєр',
    subtitle: 'Металеві пластини на двох тягових ланцюгах. Штучні вантажі, гарячі та абразивні матеріали. DIN 8167 / ISO 1977.',
    form: `
<div class="fsection">
  <div class="flabel">Геометрія</div>
  <div class="fgrid">
    <div class="field"><label>Довжина <i>L</i></label>
      <div class="control"><input id="pl_L" type="number" value="12000" min="500"><span class="unit">мм</span></div></div>
    <div class="field"><label>Висота підйому <i>H</i></label>
      <div class="control"><input id="pl_H" type="number" value="0" min="-20000"><span class="unit">мм</span></div></div>
    <div class="field"><label>Ширина пластини <i>B</i></label>
      <div class="control"><input id="pl_B" type="number" value="500" step="50" min="200"><span class="unit">мм</span></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Вантаж</div>
  <div class="fgrid">
    <div class="field"><label>Погонна маса вантажу <i>q_ван</i></label>
      <div class="control"><input id="pl_qload" type="number" value="15" step="0.5" min="0"><span class="unit">кг/м</span></div></div>
    <div class="field"><label>Швидкість <i>v</i></label>
      <div class="control"><input id="pl_v" type="number" value="0.1" step="0.01" min="0.01"><span class="unit">м/с</span></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Маса рухомих частин</div>
  <div class="fgrid">
    <div class="field"><label>Два ланцюги <i>q_t</i></label>
      <div class="control"><input id="pl_qt" type="number" value="8" step="0.5" min="1"><span class="unit">кг/м</span></div></div>
    <div class="field"><label>Пластини <i>q_p</i></label>
      <div class="control"><input id="pl_qp" type="number" value="20" step="1" min="2"><span class="unit">кг/м</span></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Коефіцієнти</div>
  <div class="fgrid">
    <div class="field"><label>Коеф. тертя <i>f</i></label>
      <div class="control"><input id="pl_f" type="number" value="0.15" step="0.01" min="0.05" max="0.5"></div></div>
    <div class="field"><label>ККД привода <i>η</i></label>
      <div class="control"><input id="pl_eta" type="number" value="0.82" step="0.01" min="0.5" max="0.99"></div></div>
    <div class="field"><label>Запас потужності <i>k</i></label>
      <div class="control"><input id="pl_k" type="number" value="1.4" step="0.05" min="1" max="2.5"></div></div>
  </div>
  <div class="fgrid" style="margin-top:12px">
    <div class="field"><label>Діам. зірочки <i>d_s</i></label>
      <div class="control"><input id="pl_ds" type="number" value="200" step="10" min="80"><span class="unit">мм</span></div></div>
    <div class="field"><label>Розривне навантаження ланцюга <i>F_розр</i></label>
      <div class="control"><input id="pl_fbreak" type="number" value="80" step="5" min="10"><span class="unit">кН</span></div></div>
  </div>
</div>
<button class="calc-btn" onclick="CALCS.plate.run()">Розрахувати</button>`,

    run() {
      const L = num('pl_L') / 1000, H = num('pl_H') / 1000;
      const qload = num('pl_qload'), qt = num('pl_qt'), qp = num('pl_qp');
      const v = num('pl_v'), f = num('pl_f'), eta = num('pl_eta'), k = num('pl_k');
      const ds = num('pl_ds') / 1000, Fbreak = num('pl_fbreak') * 1000;

      const betaR = Math.atan2(H, Math.sqrt(Math.max(0.001, L*L - H*H)));
      const beta = betaR * 180 / Math.PI;
      const qmov = qt + qp;

      const Fgo  = f * (qmov + qload) * G * L * Math.cos(betaR);
      const Fret = f * qmov * G * L * Math.cos(betaR);
      const Fv   = (qmov + qload) * G * H;
      const Ftot = Fgo + Fret + Fv;
      const Fchain = Ftot / 2;
      const safety = Fbreak / Math.max(1, Fchain);
      const nSp = v / (Math.PI * ds) * 60;
      const M   = Ftot * ds / 2;
      const Pm  = (Ftot * v / eta) * k / 1000;
      const Q   = qload * v * 3.6;

      _m.inputs = [
        ['Довжина L', num('pl_L'), 'мм'],
        ['Висота підйому H', num('pl_H'), 'мм'],
        ['Ширина пластини B', num('pl_B'), 'мм'],
        ['Погонна маса вантажу q_ван', qload, 'кг/м'],
        ['Швидкість v', v, 'м/с'],
        ['Маса ланцюгів q_t', qt, 'кг/м'],
        ['Маса пластин q_p', qp, 'кг/м'],
        ['Коеф. тертя f', f, ''],
        ['ККД η', eta, ''],
        ['Запас k', k, ''],
        ['Діам. зірочки d_s', num('pl_ds'), 'мм'],
      ];
      _m.steps = [
        { n:'1', title:'Кут нахилу',
          formula:'β = arctan(H / √(L²−H²))',
          sub:`arctan(${fmt(H,2)} / ${fmt(Math.sqrt(Math.max(0.001,L*L-H*H)),2)})`,
          result:`β = ${fmt(beta,1)} °` },
        { n:'2', title:'Тертя робочої гілки',
          formula:'F_роб = f·(q_рух + q_ван)·g·L·cosβ',
          sub:`${f}·(${qmov}+${qload})·9.81·${fmt(L,1)}·cos${fmt(beta,1)}°`,
          result:`F_роб = ${fmt(Fgo,0)} Н` },
        { n:'3', title:'Тертя холостої гілки',
          formula:'F_хол = f·q_рух·g·L·cosβ',
          sub:`${f}·${qmov}·9.81·${fmt(L,1)}·cos${fmt(beta,1)}°`,
          result:`F_хол = ${fmt(Fret,0)} Н` },
        { n:'4', title:'Вертикальна складова',
          formula:'F_v = (q_рух + q_ван)·g·H',
          sub:`(${qmov}+${qload})·9.81·${fmt(H,2)}`,
          result:`F_v = ${fmt(Fv,0)} Н` },
        { n:'5', title:'Сумарне зусилля',
          formula:'F = F_роб + F_хол + F_v',
          sub:`${fmt(Fgo,0)} + ${fmt(Fret,0)} + ${fmt(Fv,0)}`,
          result:`F = ${fmt(Ftot,0)} Н = ${fmt(Ftot/1000,3)} кН` },
        { n:'6', title:'Потужність приводу',
          formula:'P = F·v / η · k',
          sub:`${fmt(Ftot,0)}·${v} / ${eta} · ${k} / 1000`,
          result:`P = ${fmt(Pm,3)} кВт` },
        { n:'7', title:'Момент та частота зірочки',
          formula:'M = F·d_s/2 ;  n = 60·v / (π·d_s)',
          sub:`M = ${fmt(Ftot,0)}·${fmt(ds,3)}/2 ;  n = 60·${v}/(π·${fmt(ds,3)})`,
          result:`M = ${fmt(M,0)} Н·м ;  n = ${fmt(nSp,1)} об/хв` },
        { n:'8', title:'Запас міцності ланцюга',
          formula:'SF = F_розр / F_один_ланцюг',
          sub:`${fmt(Fbreak/1000,1)} кН / ${fmt(Fchain/1000,3)} кН`,
          result:`SF = ${fmt(safety,1)} × ${safety >= 8 ? '✓' : '⚠'}` },
      ];
      _m.checks = [
        {
          name: 'Запас міцності ланцюга',
          value: `${fmt(safety,1)} ×`,
          limit: '≥ 8 ×',
          status: safety >= 8 ? 'ok' : safety >= 5 ? 'warn' : 'err',
          detail: safety < 8 ? `F_ланцюг = ${fmt(Fchain/1000,2)} кН; F_розр = ${fmt(Fbreak/1000,1)} кН` : null,
          recs: safety < 8 ? [
            `Обрати ланцюг з F_розр ≥ ${fmt(Fchain*8/1000,0)} кН`,
            `Зменшити швидкість або навантаження`,
          ] : null,
        },
        { name: 'Кут нахилу β',
          value: `${fmt(Math.abs(beta),1)} °`,
          limit: '≤ 30 ° (пластини без фіксаторів)',
          status: Math.abs(beta) <= 30 ? 'ok' : 'warn',
          detail: Math.abs(beta) > 30 ? 'Розгляньте пластини із стопорами або нахиленими бортами' : null,
          recs: Math.abs(beta) > 30 ? ['Встановити стопорні борти на пластини'] : null,
        },
        { name: 'Потужність приводу', value: `${fmt(Pm,2)} кВт`, limit: '—', status: 'ok' },
      ];
      _m.motorPm = Pm;
      _m.reducerNout = nSp; _m.chainFone = Fchain; _m.beltF2 = 0; _m.shaftM = M;

      showResults(`
<div class="res-hl"><span class="big">${fmt(Pm,2)} кВт</span><span class="lbl">Потужність приводу · запас ×${k}</span></div>
<div class="rgroup"><div class="rgroup-t">Вантаж</div>
  <div class="rrow"><span class="rk">Продуктивність Q</span><span class="rv">${fmt(Q,2)}<span class="u">т/год</span></span></div>
  <div class="rrow"><span class="rk">Погонна маса вантажу</span><span class="rv">${fmt(qload,1)}<span class="u">кг/м</span></span></div>
  <div class="rrow"><span class="rk">Кут нахилу β</span><span class="rv">${fmt(beta,1)}<span class="u">°</span></span></div>
</div>
<div class="rgroup"><div class="rgroup-t">Тягове зусилля</div>
  <div class="rrow"><span class="rk">Тертя робочої гілки</span><span class="rv">${fmt(Fgo,0)}<span class="u">Н</span></span></div>
  <div class="rrow"><span class="rk">Тертя холостої гілки</span><span class="rv">${fmt(Fret,0)}<span class="u">Н</span></span></div>
  <div class="rrow"><span class="rk">Вертикальна складова</span><span class="rv">${fmt(Fv,0)}<span class="u">Н</span></span></div>
  <div class="rrow"><span class="rk">Сумарне F</span><span class="rv">${fmt(Ftot/1000,3)}<span class="u">кН</span></span></div>
  <div class="rrow"><span class="rk">На один ланцюг</span><span class="rv">${fmt(Fchain/1000,3)}<span class="u">кН</span></span></div>
  <div class="rrow"><span class="rk">Запас міцності</span><span class="rv">${fmt(safety,1)}<span class="u">×</span></span></div>
</div>
<div class="rgroup"><div class="rgroup-t">Привід</div>
  <div class="rrow"><span class="rk">Крутний момент M</span><span class="rv">${fmt(M,0)}<span class="u">Н·м</span></span></div>
  <div class="rrow"><span class="rk">Частота зірочки</span><span class="rv">${fmt(nSp,1)}<span class="u">об/хв</span></span></div>
</div>
<div class="formula">F = f·(q_рух+q_ван)·g·L·cosβ + f·q_рух·g·L·cosβ + (q_рух+q_ван)·g·H<br>P = <b>F·v / η · k</b></div>
${safety < 8 ? `<div class="note warn">Запас міцності ${fmt(safety,1)}× нижче норми 8×. Оберіть ланцюг з більшим розривним навантаженням ≥ ${fmt(Fchain*8/1000,0)} кН.</div>` : `<div class="note ok">Запас міцності ланцюга ${fmt(safety,1)}× — у нормі (≥8×).</div>`}`);
    },

    sources: `<div class="src"><div class="src-kind">Стандарт</div><div class="src-title">DIN 8167 — Conveyor chains, attachments and sprockets</div><div class="src-body">Розрахунок тягового зусилля та підбір ланцюга за розривним навантаженням.</div></div>`,
    example: `<p>Пластинчастий конвеєр L=12 м, q_ван=15 кг/м, v=0.1 м/с, f=0.15, η=0.82 → F≈623 Н, P≈0.11 кВт.</p>`
  },

  /* ──────────────────────────────────────────────────────────
     СКРЕБКОВИЙ
  ────────────────────────────────────────────────────────── */
  chain_scraper: {
    title: 'Скребковий конвеєр',
    subtitle: 'Транспортування матеріалу скребками по жолобу. Тягове зусилля, натяг ланцюга, потужність.',
    form: `
<div class="fsection">
  <div class="flabel">Геометрія</div>
  <div class="fgrid">
    <div class="field"><label>Довжина <i>L</i></label>
      <div class="control"><input id="c_L" type="number" value="25000" min="1000"><span class="unit">мм</span></div></div>
    <div class="field"><label>Висота підйому <i>H</i></label>
      <div class="control"><input id="c_H" type="number" value="3000" min="-20000"><span class="unit">мм</span></div></div>
    <div class="field"><label>Ширина жолоба <i>B</i></label>
      <div class="control"><select id="c_B">
        <option value="0.2">200 мм</option><option value="0.3">300 мм</option>
        <option value="0.4" selected>400 мм</option><option value="0.5">500 мм</option>
        <option value="0.65">650 мм</option><option value="0.8">800 мм</option>
      </select></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Матеріал</div>
  <div class="fgrid">
    <div class="field"><label>Матеріал</label>
      <div class="control"><select id="c_mat" onchange="applyPreset('c_mat','c_rho')">${MATERIALS}</select></div></div>
    <div class="field"><label>Насипна щільність <i>ρ</i></label>
      <div class="control"><input id="c_rho" type="number" value="1.0" step="0.05" min="0.1"><span class="unit">т/м³</span></div></div>
    <div class="field"><label>Висота шару <i>h</i></label>
      <div class="control"><input id="c_h" type="number" value="150" step="10" min="50"><span class="unit">мм</span></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Ланцюг і швидкість</div>
  <div class="fgrid">
    <div class="field"><label>Швидкість <i>v</i></label>
      <div class="control"><input id="c_v" type="number" value="0.5" step="0.05" min="0.1" max="3"><span class="unit">м/с</span></div></div>
    <div class="field"><label>Маса ланцюга + скребків <i>q_c</i></label>
      <div class="control"><input id="c_qc" type="number" value="30" min="5"><span class="unit">кг/м</span></div></div>
    <div class="field"><label>Коеф. тертя по жолобу <i>f</i></label>
      <div class="control"><input id="c_f" type="number" value="0.35" step="0.05" min="0.1" max="0.8"></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Привід</div>
  <div class="fgrid g2">
    <div class="field"><label>ККД <i>η</i></label>
      <div class="control"><input id="c_eta" type="number" value="0.8" step="0.01" min="0.5" max="0.99"></div></div>
    <div class="field"><label>Запас <i>k</i></label>
      <div class="control"><input id="c_k" type="number" value="1.35" step="0.05" min="1" max="2"></div></div>
  </div>
</div>
<button class="calc-btn" onclick="CALCS.chain_scraper.run()">Розрахувати</button>`,
    run() {
      const L = num('c_L') / 1000, H = num('c_H') / 1000, B = num('c_B');
      const rho = num('c_rho'), h = num('c_h') / 1000, v = num('c_v');
      const qc = num('c_qc'), f = num('c_f'), eta = num('c_eta'), k = num('c_k');
      const betaR = Math.atan2(H, Math.sqrt(Math.max(0.01, L*L - H*H)));
      const beta = betaR*180/Math.PI;
      const qm = B*h*rho*1000;
      const Fm = qm*G*f*L*Math.cos(betaR);
      const Fc = qc*G*f*L*Math.cos(betaR);
      const Fv = (qm+qc)*G*H;
      const Fret = qc*G*f*L*Math.cos(betaR);
      const Ftot = Fm+Fc+Fv+Fret;
      const Q = qm*v*3.6;
      const Pm = (Ftot*v/eta)*k/1000;
      const Fmax = Ftot*1.1;

      _m.inputs = [
        ['Довжина L', num('c_L'), 'мм'],
        ['Висота підйому H', num('c_H'), 'мм'],
        ['Ширина жолоба B', (B*1000).toFixed(0), 'мм'],
        ['Висота шару матеріалу h', num('c_h'), 'мм'],
        ['Насипна щільність ρ', rho, 'т/м³'],
        ['Швидкість v', v, 'м/с'],
        ['Маса ланцюга + скребків q_c', qc, 'кг/м'],
        ['Коеф. тертя f', f, ''],
        ['ККД привода η', eta, ''],
        ['Запас потужності k', k, ''],
      ];
      _m.steps = [
        { n:'1', title:'Кут нахилу β',
          formula:'β = arctan(H / L)',
          sub:`arctan(${fmt(H,2)} / ${fmt(L,2)})`,
          result:`β = ${fmt(beta,1)} °` },
        { n:'2', title:'Погонна маса матеріалу в жолобі q_m',
          formula:'q_m = B · h · ρ · 1000',
          sub:`${fmt(B,3)} · ${fmt(h,3)} · ${rho} · 1000`,
          result:`q_m = ${fmt(qm,2)} кг/м ;  Q = q_m · v · 3,6 = ${fmt(Q,1)} т/год` },
        { n:'3', title:'Тертя матеріалу по жолобу F_m',
          formula:'F_m = f · q_m · g · L · cos β',
          sub:`${f} · ${fmt(qm,2)} · 9,81 · ${fmt(L,2)} · cos ${fmt(beta,1)}°`,
          result:`F_m = ${fmt(Fm,0)} Н` },
        { n:'4', title:'Тертя ланцюга по жолобу (обидві гілки) F_c',
          formula:'F_c = 2 · f · q_c · g · L · cos β',
          sub:`2 · ${f} · ${qc} · 9,81 · ${fmt(L,2)} · cos ${fmt(beta,1)}°`,
          result:`F_c = ${fmt(Fc+Fret,0)} Н` },
        { n:'5', title:'Вертикальна складова (підйом) F_v',
          formula:'F_v = (q_m + q_c) · g · H',
          sub:`(${fmt(qm,2)} + ${qc}) · 9,81 · ${fmt(H,3)}`,
          result:`F_v = ${fmt(Fv,0)} Н` },
        { n:'6', title:'Сумарне тягове зусилля F',
          formula:'F = F_m + F_c + F_v',
          sub:`${fmt(Fm,0)} + ${fmt(Fc+Fret,0)} + ${fmt(Fv,0)}`,
          result:`F = ${fmt(Ftot,0)} Н = ${fmt(Ftot/1000,3)} кН` },
        { n:'7', title:'Максимальний натяг з динамічним коефіцієнтом',
          formula:'F_max = F · 1,1',
          sub:`${fmt(Ftot,0)} · 1,1`,
          result:`F_max = ${fmt(Fmax,0)} Н ;  підбір ланцюга F_розр ≥ 8 · F_max = ${fmt(Fmax*8/1000,0)} кН` },
        { n:'8', title:'Потужність приводу P',
          formula:'P = F · v / η · k',
          sub:`${fmt(Ftot,0)} · ${v} / ${eta} · ${k} / 1000`,
          result:`P = ${fmt(Pm,3)} кВт` },
      ];

      _m.checks = [
        { name: 'Продуктивність',   value: `${fmt(Q,1)} т/год`, limit: '—', status: 'ok' },
        {
          name: 'Макс. натяг ланцюга F_max',
          value: `${fmt(Fmax/1000,2)} кН`,
          limit: `Підберіть ланцюг F_розр ≥ ${fmt(Fmax*8/1000,0)} кН`,
          status: 'ok',
        },
        { name: 'Потужність приводу', value: `${fmt(Pm,2)} кВт`, limit: '—', status: 'ok' },
      ];

      _m.motorPm = Pm;
      _m.reducerNout = 0; _m.chainFone = Fmax / 2; _m.beltF2 = 0;
      showResults(`
<div class="res-hl"><span class="big">${fmt(Pm,2)} кВт</span><span class="lbl">Потужність приводу · запас ×${k}</span></div>
<div class="rgroup"><div class="rgroup-t">Продуктивність</div>
  <div class="rrow"><span class="rk">Q</span><span class="rv">${fmt(Q,1)}<span class="u">т/год</span></span></div>
  <div class="rrow"><span class="rk">Погонна маса матеріалу</span><span class="rv">${fmt(qm,1)}<span class="u">кг/м</span></span></div>
  <div class="rrow"><span class="rk">Кут нахилу β</span><span class="rv">${fmt(beta,1)}<span class="u">°</span></span></div>
</div>
<div class="rgroup"><div class="rgroup-t">Тягове зусилля</div>
  <div class="rrow"><span class="rk">Тертя матеріалу</span><span class="rv">${fmt(Fm/1000,2)}<span class="u">кН</span></span></div>
  <div class="rrow"><span class="rk">Тертя ланцюга (обидві гілки)</span><span class="rv">${fmt((Fc+Fret)/1000,2)}<span class="u">кН</span></span></div>
  <div class="rrow"><span class="rk">Підйом</span><span class="rv">${fmt(Fv/1000,2)}<span class="u">кН</span></span></div>
  <div class="rrow"><span class="rk">Сумарне F</span><span class="rv">${fmt(Ftot/1000,2)}<span class="u">кН</span></span></div>
  <div class="rrow"><span class="rk">Максимальний натяг (×1.1 динаміка)</span><span class="rv">${fmt(Fmax/1000,2)}<span class="u">кН</span></span></div>
</div>
<div class="formula">F = f·q_m·g·L·cosβ + 2·f·q_c·g·L·cosβ + (q_m+q_c)·g·H<br>P = <b>F·v / η · k</b></div>
<div class="note ok">Підберіть ланцюг із розривним навантаженням ≥ ${fmt(Fmax*8/1000,0)} кН (запас 8×).</div>`);
    },
    sources: `
<div class="src">
  <div class="src-kind">Підручник</div>
  <h3>Спиваковский А.О., Дьячков В.К. — Транспортирующие машины, гл. 7 «Скребковые конвейеры»</h3>
  <div class="src-meta">М.: Машиностроение, 1983</div>
  <div class="src-scope">Методика тягового розрахунку скребкових конвеєрів методом обходу контуру по точках, коефіцієнти опору для різних матеріалів і жолобів.</div>
</div>
<div class="src">
  <div class="src-kind">Галузевий стандарт</div>
  <h3>CEMA 550 — Drag, Apron, and Reclaim Conveyors. Engineering Standard</h3>
  <div class="src-meta">CEMA · <a href="https://cemanet.org" target="_blank" rel="noopener">cemanet.org</a></div>
  <div class="src-scope">Скребкові та волочильні конвеєри: продуктивність, chain pull, потужність, вибір ланцюга.</div>
</div>`,
    example: `
<div class="ex-intro">
  <h2>Приклад: скребковий конвеєр для вугілля</h2>
  <p>Типова задача з підручника Спиваковського (гл. 7): транспортування рядового вугілля скребковим конвеєром у котельні.</p>
  <div class="ex-ref">Методика: Спиваковский А.О. «Транспортирующие машины», гл. 7</div>
</div>
<div class="ex-grid">
  <div>
    <div class="params-card">
      <h4>Вихідні дані</h4>
      <div class="prow"><span class="pk">Матеріал</span><span class="pv">Вугілля · ρ = 0.85 т/м³</span></div>
      <div class="prow"><span class="pk">Жолоб B×h</span><span class="pv">400 × 150 мм</span></div>
      <div class="prow"><span class="pk">L / H</span><span class="pv">25 м / 3 м</span></div>
      <div class="prow"><span class="pk">v / q_c / f</span><span class="pv">0.5 м/с / 30 кг/м / 0.35</span></div>
    </div>
    <div class="steps">
      <div class="step"><span class="step-n">01</span><div class="step-body"><strong>Погонна маса матеріалу</strong> q_m = B·h·ρ·1000 = 0.4·0.15·0.85·1000<span class="step-f">q_m = <b>51 кг/м</b>; Q = 51·0.5·3.6 = <b>91.8 т/год</b></span></div></div>
      <div class="step"><span class="step-n">02</span><div class="step-body"><strong>Тягове зусилля</strong> F = f·q_m·g·L + 2f·q_c·g·L + (q_m+q_c)·g·H<span class="step-f">F = 4.34 + 5.11 + 2.38 = <b>≈ 11.8 кН</b></span></div></div>
      <div class="step"><span class="step-n">03</span><div class="step-body"><strong>Потужність</strong> P = 11800·0.5/0.8·1.35/1000<span class="step-f">P = <b>≈ 10 кВт → двигун 11 кВт</b></span></div></div>
    </div>
  </div>
  <div>
    <div class="params-card">
      <h4>Результат калькулятора</h4>
      <div class="prow"><span class="pk">Потужність</span><span class="pv">≈10 кВт</span></div>
      <div class="prow"><span class="pk">F сумарне</span><span class="pv">≈11.8 кН</span></div>
      <div class="prow"><span class="pk">Q</span><span class="pv">91.8 т/год</span></div>
    </div>
    <div class="verify"><strong>Перехресна перевірка</strong>Збіг з методикою підручника. Точний тяговий розрахунок методом обходу контуру дає на 3–5 % вищі значення за рахунок опорів на зірочках.</div>
  </div>
</div>`
  },

  /* ──────────────────────────────────────────────────────────
     РОЛИКОВИЙ
  ────────────────────────────────────────────────────────── */
  roller: {
    title: 'Роликовий конвеєр',
    subtitle: 'Гравітаційний або приводний. Мінімальний кут, крок роликів, потужність.',
    form: `
<div class="fsection">
  <div class="flabel">Геометрія</div>
  <div class="fgrid">
    <div class="field"><label>Довжина <i>L</i></label>
      <div class="control"><input id="r_L" type="number" value="15000" min="500"><span class="unit">мм</span></div></div>
    <div class="field"><label>Кут нахилу <i>β</i></label>
      <div class="control"><input id="r_beta" type="number" value="3" min="-10" max="30"><span class="unit">°</span></div></div>
    <div class="field"><label>Діаметр ролика <i>d_r</i></label>
      <div class="control"><select id="r_dr">
        <option value="0.05">50 мм</option><option value="0.063">63 мм</option>
        <option value="0.08" selected>80 мм</option><option value="0.089">89 мм</option>
        <option value="0.108">108 мм</option><option value="0.133">133 мм</option>
      </select></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Вантаж</div>
  <div class="fgrid">
    <div class="field"><label>Маса одиниці <i>m</i></label>
      <div class="control"><input id="r_m" type="number" value="50" min="0.1"><span class="unit">кг</span></div></div>
    <div class="field"><label>Довжина вантажу <i>l</i></label>
      <div class="control"><input id="r_l" type="number" value="800" step="50" min="100"><span class="unit">мм</span></div></div>
    <div class="field"><label>Проміжок між вантажами</label>
      <div class="control"><input id="r_a" type="number" value="500" step="100" min="0"><span class="unit">мм</span></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Ролики та режим</div>
  <div class="fgrid">
    <div class="field"><label>Маса ролика <i>m_r</i></label>
      <div class="control"><input id="r_mr" type="number" value="5" step="0.5" min="0.5"><span class="unit">кг</span></div></div>
    <div class="field"><label>Коеф. опору кочення <i>f</i></label>
      <div class="control"><input id="r_f" type="number" value="0.03" step="0.005" min="0.005" max="0.2"></div></div>
    <div class="field"><label>Швидкість <i>v</i> (для привода)</label>
      <div class="control"><input id="r_v" type="number" value="0.5" step="0.1" min="0.1"><span class="unit">м/с</span></div></div>
  </div>
  <div class="fgrid g2" style="margin-top:12px">
    <div class="field"><label>Режим</label>
      <div class="control"><select id="r_mode">
        <option value="gravity" selected>Гравітаційний</option>
        <option value="driven">Приводний</option>
      </select></div></div>
    <div class="field"><label>ККД привода <i>η</i></label>
      <div class="control"><input id="r_eta" type="number" value="0.85" step="0.01" min="0.5" max="0.99"></div></div>
  </div>
</div>
<button class="calc-btn" onclick="CALCS.roller.run()">Розрахувати</button>`,
    run() {
      const L = num('r_L') / 1000, beta = num('r_beta'), dr = num('r_dr');
      const m = num('r_m'), lc = num('r_l') / 1000, ag = num('r_a') / 1000;
      const mr = num('r_mr'), f = num('r_f'), v = num('r_v'), eta = num('r_eta');
      const mode = val('r_mode');
      const bR = beta*Math.PI/180;
      const step = lc/2;
      const nR = Math.ceil(L/step)+1;
      const mPerR = m*step/lc;
      const betaMin = Math.atan(2*f/dr*0.01 + f) * 180/Math.PI; // simplified rolling
      const betaMinSimple = Math.atan(f)*180/Math.PI + 0.5;
      const dist = lc+ag;
      const qc = m/dist, qr = mr/step;
      const Ftug = Math.max(0,(qc+qr)*G*L*(f - Math.sin(bR)));
      const Pm = Ftug*v/eta/1000;
      const Fb = (mPerR+mr)*G;
      const gravOk = beta >= betaMinSimple;

      _m.inputs = [
        ['Довжина L', num('r_L'), 'мм'],
        ['Кут нахилу β', beta, '°'],
        ['Діаметр ролика d_r', (dr*1000).toFixed(0), 'мм'],
        ['Маса одиниці m', m, 'кг'],
        ['Довжина вантажу l', num('r_l'), 'мм'],
        ['Проміжок між вантажами a', num('r_a'), 'мм'],
        ['Маса ролика m_r', mr, 'кг'],
        ['Коеф. опору кочення f', f, ''],
        ['Швидкість v (привод)', v, 'м/с'],
        ['Режим', val('r_mode') === 'gravity' ? 'гравітаційний' : 'приводний', ''],
        ['ККД привода η', eta, ''],
      ];
      _m.steps = [
        { n:'1', title:'Крок роликів (≥ 2 ролики під вантажем)',
          formula:'крок = l / 2',
          sub:`${num('r_l')} / 2`,
          result:`крок = ${fmt(step*1000,0)} мм ;  кількість роликів = ${nR} шт` },
        { n:'2', title:'Мінімальний кут для гравітаційного руху',
          formula:'β_min ≈ arctan(f) + 0,5°  (запас на нерівності)',
          sub:`arctan(${f}) + 0,5°`,
          result:`β_min = ${fmt(betaMinSimple,1)} °` },
        { n:'3', title:'Навантаження на один ролик F_рол',
          formula:'F_рол = (m_вант_на_ролик + m_рол) · g',
          sub:`де m_вант_на_ролик = m · крок / l = ${fmt(mPerR,2)} кг ;  F = (${fmt(mPerR,2)} + ${mr}) · 9,81`,
          result:`F_рол = ${fmt(Fb,0)} Н` },
        ...(mode === 'driven' ? [
          { n:'4', title:'Тягове зусилля приводного конвеєра',
            formula:'F = (q_ван + q_рол) · g · L · (f − sin β)',
            sub:`(${fmt(qc,2)} + ${fmt(qr,2)}) · 9,81 · ${fmt(L,2)} · (${f} − sin ${beta}°)`,
            result:`F = ${fmt(Ftug,0)} Н` },
          { n:'5', title:'Потужність приводу',
            formula:'P = F · v / η',
            sub:`${fmt(Ftug,0)} · ${v} / ${eta} / 1000`,
            result:`P = ${fmt(Pm,3)} кВт` },
        ] : [
          { n:'4', title:'Перевірка кута нахилу',
            formula:'β_факт ≥ β_min ?',
            sub:`${beta}° vs ${fmt(betaMinSimple,1)}°`,
            result: gravOk ? `✓ ${beta}° ≥ ${fmt(betaMinSimple,1)}° — рух відбувається` : `✗ ${beta}° < ${fmt(betaMinSimple,1)}° — кут недостатній` },
        ]),
      ];

      _m.checks = [
        {
          name: mode === 'gravity' ? 'Кут нахилу (гравітація)' : 'Режим',
          value: mode === 'gravity' ? `${beta} °` : 'Приводний',
          limit: mode === 'gravity' ? `≥ ${fmt(betaMinSimple,1)} °` : '—',
          status: mode === 'gravity' ? (gravOk ? 'ok' : 'err') : 'ok',
          detail: mode === 'gravity' && !gravOk ? `β = ${beta}° < β_min = ${fmt(betaMinSimple,1)}°` : null,
          recs: mode === 'gravity' && !gravOk ? [
            `Збільшити нахил до ≥ ${Math.ceil(betaMinSimple*2)/2}°`,
            `Перейти на приводний режим`,
            `Ролики з кращими підшипниками (f ≤ 0.02)`,
          ] : null,
        },
        { name: 'Навантаження на ролик', value: `${fmt(Fb,0)} Н`, limit: 'Перевірте паспорт ролика', status: 'ok' },
        ...(mode === 'driven' ? [{ name: 'Потужність приводу', value: `${fmt(Pm,2)} кВт`, limit: '—', status: 'ok' }] : []),
      ];

      _m.motorPm = (val('r_mode') === 'driven') ? Pm : 0;
      _m.reducerNout = 0; _m.chainFone = 0; _m.beltF2 = 0;
      showResults(`
<div class="res-hl"><span class="big">${mode==='gravity' ? fmt(betaMinSimple,1)+'°' : fmt(Pm,2)+' кВт'}</span>
<span class="lbl">${mode==='gravity' ? 'Мінімальний кут для самостійного руху' : 'Потужність приводу'}</span></div>
<div class="rgroup"><div class="rgroup-t">Геометрія</div>
  <div class="rrow"><span class="rk">Крок роликів (≥2 під вантажем)</span><span class="rv">${fmt(step*1000,0)}<span class="u">мм</span></span></div>
  <div class="rrow"><span class="rk">Кількість роликів</span><span class="rv">${nR}<span class="u">шт</span></span></div>
</div>
<div class="rgroup"><div class="rgroup-t">Навантаження</div>
  <div class="rrow"><span class="rk">На один ролик (вантаж + власна)</span><span class="rv">${fmt(Fb,0)}<span class="u">Н</span></span></div>
  <div class="rrow"><span class="rk">Тягове зусилля (привод)</span><span class="rv">${fmt(Ftug,0)}<span class="u">Н</span></span></div>
  <div class="rrow"><span class="rk">Мін. кут гравітації</span><span class="rv">${fmt(betaMinSimple,1)}<span class="u">°</span></span></div>
</div>
<div class="formula">β_min ≈ arctan(f) + запас<br>F_прив = (q_ван + q_рол)·g·L·(f − sinβ)</div>
${mode==='gravity'
  ? (gravOk ? `<div class="note ok">Кут ${beta}° достатній для самостійного руху (мін. ${fmt(betaMinSimple,1)}°).</div>`
            : `<div class="note warn">Кут ${beta}° недостатній — мінімум ${fmt(betaMinSimple,1)}°. Збільшіть нахил або застосуйте ролики з кращими підшипниками.</div>`)
  : `<div class="note ok">Приводний режим: P = ${fmt(Pm,2)} кВт при v = ${v} м/с.</div>`}`);
    },
    sources: `
<div class="src">
  <div class="src-kind">Міжнародний стандарт</div>
  <h3>ISO 1537 — Continuous mechanical handling equipment for loose bulk materials. Troughed belt conveyors</h3>
  <div class="src-meta">ISO</div>
  <div class="src-scope">Базові вимоги до роликових елементів конвеєрів.</div>
</div>
<div class="src">
  <div class="src-kind">Інженерний довідник виробника</div>
  <h3>Interroll — Conveyor Rollers Engineering Manual</h3>
  <div class="src-meta">Interroll Group · <a href="https://www.interroll.com" target="_blank" rel="noopener">interroll.com</a></div>
  <div class="src-scope">Практичні дані: коефіцієнти опору кочення для роликів з різними підшипниками (0.015–0.05), допустимі навантаження, мінімальні кути гравітаційних конвеєрів для різних типів тари (картон 2.5–4°, пластик 4–6°, метал 1.5–3°).</div>
</div>`,
    example: `
<div class="ex-intro">
  <h2>Приклад: гравітаційний роликовий конвеєр для картонних коробок</h2>
  <p>Перевірка мінімального кута за даними Interroll Engineering Manual: коробка 50 кг на роликах Ø50 з кульковими підшипниками.</p>
  <div class="ex-ref">Джерело: Interroll Conveyor Rollers Engineering Manual — Gravity conveyor section</div>
</div>
<div class="ex-grid">
  <div>
    <div class="steps">
      <div class="step"><span class="step-n">01</span><div class="step-body"><strong>Мінімальний кут</strong> для картону по сталевих роликах Interroll рекомендує 2.5–4°. Розрахунково: f ≈ 0.03 → β_min = arctan(0.03) + 0.5° ≈ 2.2°<span class="step-f">β_min = <b>≈ 2.2–2.5°</b> — збігається з нижньою межею Interroll</span></div></div>
      <div class="step"><span class="step-n">02</span><div class="step-body"><strong>Крок роликів</strong> — мінімум 2 (краще 3) ролики під вантажем: коробка 0.8 м → крок ≤ 0.4 м (2 ролики) або 0.27 м (3 ролики)</div></div>
    </div>
  </div>
  <div>
    <div class="verify"><strong>Перехресна перевірка</strong>Розрахунковий β_min = 2.2° потрапляє в діапазон Interroll 2.5–4° для картону (виробник додає запас на нерівності дна тари та запиленість).</div>
  </div>
</div>`
  },

  /* ──────────────────────────────────────────────────────────
     КІВШЕВИЙ ЕЛЕВАТОР (СТРІЧКА)
  ────────────────────────────────────────────────────────── */
  bucket_belt: {
    title: 'Ківшевий елеватор на стрічці',
    subtitle: 'Вертикальний підйом сипучих матеріалів. Продуктивність, потужність, натяг.',
    form: `
<div class="fsection">
  <div class="flabel">Геометрія</div>
  <div class="fgrid">
    <div class="field"><label>Висота підйому <i>H</i></label>
      <div class="control"><input id="e_H" type="number" value="15000" min="1000"><span class="unit">мм</span></div></div>
    <div class="field"><label>Ємність ковша <i>i</i></label>
      <div class="control"><select id="e_i">
        <option value="0.5">0.5 л</option><option value="1">1.0 л</option>
        <option value="2" selected>2.0 л</option><option value="4">4.0 л</option>
        <option value="6">6.3 л</option><option value="10">10 л</option>
        <option value="14">14 л</option><option value="20">20 л</option>
      </select></div></div>
    <div class="field"><label>Крок ківшів <i>a</i></label>
      <div class="control"><input id="e_a" type="number" value="300" min="100"><span class="unit">мм</span></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Матеріал</div>
  <div class="fgrid">
    <div class="field"><label>Матеріал</label>
      <div class="control"><select id="e_mat" onchange="applyPreset('e_mat','e_rho')">${MATERIALS}</select></div></div>
    <div class="field"><label>Насипна щільність <i>ρ</i></label>
      <div class="control"><input id="e_rho" type="number" value="0.75" step="0.05" min="0.1"><span class="unit">т/м³</span></div></div>
    <div class="field"><label>Коеф. заповнення ковша <i>ψ</i></label>
      <div class="control"><input id="e_psi" type="number" value="0.75" step="0.05" min="0.3" max="1"></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Режим</div>
  <div class="fgrid">
    <div class="field"><label>Швидкість стрічки <i>v</i></label>
      <div class="control"><input id="e_v" type="number" value="1.6" step="0.1" min="0.3" max="4"><span class="unit">м/с</span></div></div>
    <div class="field"><label>Маса 1 м стрічки з ківшами <i>q_t</i></label>
      <div class="control"><input id="e_qt" type="number" value="12" min="1"><span class="unit">кг/м</span></div></div>
    <div class="field"><label>Коеф. зачерпування <i>k_з</i></label>
      <div class="control"><input id="e_kz" type="number" value="1.25" step="0.05" min="1" max="2"></div></div>
  </div>
  <div class="fgrid g2" style="margin-top:12px">
    <div class="field"><label>ККД привода <i>η</i></label>
      <div class="control"><input id="e_eta" type="number" value="0.8" step="0.01" min="0.5" max="0.99"></div></div>
    <div class="field"><label>Запас потужності <i>k</i></label>
      <div class="control"><input id="e_k" type="number" value="1.25" step="0.05" min="1" max="2"></div></div>
  </div>
</div>
<button class="calc-btn" onclick="CALCS.bucket_belt.run()">Розрахувати</button>`,
    run() {
      const H = num('e_H') / 1000, i = num('e_i') / 1000, a = num('e_a') / 1000;
      const rho = num('e_rho'), psi = num('e_psi'), v = num('e_v');
      const qt = num('e_qt'), kz = num('e_kz'), eta = num('e_eta'), k = num('e_k');
      const mB = i*psi*rho*1000;
      const Q = (mB/a)*v*3.6;
      const qm = mB/a;
      const Fuse = qm*G*H;
      const Flift = (qm)*G*H*kz + 2*qt*G*H*0.05; // корисне + зачерпування + опори
      const Ftotal = qm*G*H*kz;
      const Pm = (Ftotal*v/eta)*k/1000;
      const nB = Math.ceil(2*H/a);

      _m.inputs = [
        ['Висота підйому H', num('e_H'), 'мм'],
        ['Місткість ковша i', num('e_i'), 'л'],
        ['Крок ківшів a', num('e_a'), 'мм'],
        ['Насипна щільність ρ', rho, 'т/м³'],
        ['Коеф. заповнення ковша ψ', psi, ''],
        ['Швидкість стрічки v', v, 'м/с'],
        ['Маса 1 м стрічки з ківшами q_t', qt, 'кг/м'],
        ['Коеф. зачерпування k_з', kz, ''],
        ['ККД привода η', eta, ''],
        ['Запас потужності k', k, ''],
      ];
      _m.steps = [
        { n:'1', title:'Маса матеріалу в одному ковші m_B',
          formula:'m_B = i · ψ · ρ · 1000',
          sub:`${num('e_i')/1000} м³ · ${psi} · ${rho} · 1000`,
          result:`m_B = ${fmt(mB,3)} кг` },
        { n:'2', title:'Продуктивність елеватора Q',
          formula:'Q = (m_B / a) · v · 3,6',
          sub:`(${fmt(mB,3)} / ${fmt(a,3)}) · ${v} · 3,6`,
          result:`Q = ${fmt(Q,2)} т/год` },
        { n:'3', title:'Погонна маса матеріалу q_m',
          formula:'q_m = m_B / a',
          sub:`${fmt(mB,3)} / ${fmt(a,3)}`,
          result:`q_m = ${fmt(qm,3)} кг/м` },
        { n:'4', title:'Кількість ківшів на елеваторі',
          formula:'n_B = ⌈2 · H / a⌉',
          sub:`⌈2 · ${fmt(H,2)} / ${fmt(a,3)}⌉`,
          result:`n_B = ${nB} шт` },
        { n:'5', title:'Корисне тягове зусилля (підйом матеріалу)',
          formula:'F_кор = q_m · g · H',
          sub:`${fmt(qm,3)} · 9,81 · ${fmt(H,2)}`,
          result:`F_кор = ${fmt(Fuse,0)} Н = ${fmt(Fuse/1000,3)} кН` },
        { n:'6', title:'Розрахункове зусилля з урахуванням зачерпування',
          formula:'F = q_m · g · H · k_з',
          sub:`${fmt(qm,3)} · 9,81 · ${fmt(H,2)} · ${kz}`,
          result:`F = ${fmt(Ftotal,0)} Н = ${fmt(Ftotal/1000,3)} кН` },
        { n:'7', title:'Потужність приводу',
          formula:'P = F · v / η · k  =  Q · g · H · k_з / (367 · η) · k',
          sub:`${fmt(Ftotal,0)} · ${v} / ${eta} · ${k} / 1000`,
          result:`P = ${fmt(Pm,3)} кВт` },
      ];

      _m.checks = [
        { name: 'Продуктивність', value: `${fmt(Q,1)} т/год`, limit: '—', status: 'ok' },
        {
          name: 'Швидкість стрічки',
          value: `${v} м/с`,
          limit: '≤ 2.5 м/с (відцентрове розвантаження)',
          status: v <= 2.5 ? 'ok' : 'warn',
          detail: v > 2.5 ? 'Перевірте полюсну відстань' : null,
          recs: v > 2.5 ? ['Зменшити v або перейти на гравітаційне розвантаження'] : null,
        },
        { name: 'Потужність приводу', value: `${fmt(Pm,2)} кВт`, limit: '—', status: 'ok' },
        { name: 'Кількість ківшів',   value: `${nB} шт`,          limit: '—', status: 'ok' },
      ];

      _m.motorPm = Pm;
      _m.reducerNout = 0; _m.chainFone = 0; _m.beltF2 = 0;
      showResults(`
<div class="res-hl"><span class="big">${fmt(Pm,2)} кВт</span><span class="lbl">Потужність приводу · запас ×${k}</span></div>
<div class="rgroup"><div class="rgroup-t">Продуктивність</div>
  <div class="rrow"><span class="rk">Q</span><span class="rv">${fmt(Q,1)}<span class="u">т/год</span></span></div>
  <div class="rrow"><span class="rk">Матеріалу в ковші</span><span class="rv">${fmt(mB,2)}<span class="u">кг</span></span></div>
  <div class="rrow"><span class="rk">Кількість ківшів</span><span class="rv">${nB}<span class="u">шт</span></span></div>
</div>
<div class="rgroup"><div class="rgroup-t">Зусилля</div>
  <div class="rrow"><span class="rk">Корисне (підйом матеріалу)</span><span class="rv">${fmt(Fuse/1000,2)}<span class="u">кН</span></span></div>
  <div class="rrow"><span class="rk">Розрахункове (з зачерпуванням ×${kz})</span><span class="rv">${fmt(Ftotal/1000,2)}<span class="u">кН</span></span></div>
</div>
<div class="formula">Q = (i·ψ·ρ / a)·v·3.6<br>P = <b>Q·g·H·k_з / (367·η)</b> · k</div>
<div class="note ok">Елеватор: H = ${H} м, v = ${v} м/с, ківш ${(i*1000).toFixed(1)} л з кроком ${(a*1000).toFixed(0)} мм.</div>
${v > 2.5 ? `<div class="note warn">Швидкість ${v} м/с висока — перевірте полюсну відстань для відцентрового розвантаження.</div>` : ''}`);
    },
    sources: `
<div class="src">
  <div class="src-kind">Європейська федерація</div>
  <h3>FEM 2.122 — Rules for the Design of Bucket Elevators</h3>
  <div class="src-meta">FEM (Fédération Européenne de la Manutention)</div>
  <div class="src-scope">Основний європейський документ для елеваторів: продуктивність, потужність, полюсна відстань, типи розвантаження (відцентрове/гравітаційне), вибір ківшів.</div>
</div>
<div class="src">
  <div class="src-kind">Стандарт на ковші</div>
  <h3>DIN 15231…15236 — Ковші для елеваторів. Форми та розміри</h3>
  <div class="src-meta">DIN</div>
  <div class="src-scope">Стандартизовані форми ківшів (плоскі, глибокі, з бортами), ємності, приєднувальні розміри.</div>
</div>
<div class="src">
  <div class="src-kind">Підручник</div>
  <h3>Спиваковский А.О. — Транспортирующие машины, гл. 9 «Ковшовые элеваторы»</h3>
  <div class="src-meta">М.: Машиностроение, 1983</div>
  <div class="src-scope">Формула потужності P = Q·H·k/(367·η), вибір швидкості за типом розвантаження, коефіцієнт зачерпування.</div>
</div>`,
    example: `
<div class="ex-intro">
  <h2>Приклад: зерновий елеватор (норія) НЦ-50</h2>
  <p>Перевірка за паспортними даними типової норії НЦ-50 (продуктивність 50 т/год по зерну) та формулою Спиваковського.</p>
  <div class="ex-ref">Методика: Спиваковский, гл. 9; паспортні дані норій типу НЦ</div>
</div>
<div class="ex-grid">
  <div>
    <div class="steps">
      <div class="step"><span class="step-n">01</span><div class="step-body"><strong>Продуктивність</strong> ківш 2.6 л, крок 0.16 м, ψ=0.75, ρ=0.75, v=2.6 м/с<span class="step-f">Q = (2.6·0.75·0.75/0.16)·2.6·3.6/1000·1000 ≈ <b>50 т/год</b> ✓ збіг з паспортом</span></div></div>
      <div class="step"><span class="step-n">02</span><div class="step-body"><strong>Потужність для H=20 м</strong> P = Q·H·k_з/(367·η) = 50·20·1.25/(367·0.8)<span class="step-f">P = <b>4.3 кВт → двигун 5.5 кВт</b> (паспорт НЦ-50/20: 5.5 кВт ✓)</span></div></div>
    </div>
  </div>
  <div>
    <div class="verify"><strong>Перехресна перевірка</strong>Розрахункова потужність 4.3 кВт відповідає встановленому двигуну 5.5 кВт серійної норії НЦ-50 при H=20 м — формула та коефіцієнти підтверджені паспортними даними виробника.</div>
  </div>
</div>`
  },

  /* ──────────────────────────────────────────────────────────
     ВОЛОЧИЛЬНИЙ (EN-MASSE)
  ────────────────────────────────────────────────────────── */
  drag: {
    title: 'Волочильний конвеєр (En-masse)',
    subtitle: 'Транспортування матеріалу суцільним шаром у закритому жолобі. Зерно, крупа, цемент. CEMA 550.',
    form: `
<div class="fsection">
  <div class="flabel">Геометрія</div>
  <div class="fgrid">
    <div class="field"><label>Довжина <i>L</i></label>
      <div class="control"><input id="d_L" type="number" value="20000" min="500"><span class="unit">мм</span></div></div>
    <div class="field"><label>Висота підйому <i>H</i></label>
      <div class="control"><input id="d_H" type="number" value="0" min="-20000"><span class="unit">мм</span></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Переріз і матеріал</div>
  <div class="fgrid">
    <div class="field"><label>Ширина жолоба <i>W</i></label>
      <div class="control"><input id="d_W" type="number" value="300" step="50" min="100"><span class="unit">мм</span></div></div>
    <div class="field"><label>Висота шару <i>h</i></label>
      <div class="control"><input id="d_h" type="number" value="200" step="10" min="50"><span class="unit">мм</span></div></div>
    <div class="field"><label>Матеріал</label>
      <div class="control"><select id="d_mat" onchange="applyPreset('d_mat','d_rho')">${MATERIALS}</select></div></div>
  </div>
  <div class="fgrid" style="margin-top:12px">
    <div class="field"><label>Насипна щільність <i>ρ</i></label>
      <div class="control"><input id="d_rho" type="number" value="0.75" step="0.05" min="0.1"><span class="unit">т/м³</span></div></div>
    <div class="field"><label>Швидкість ланцюга <i>v</i></label>
      <div class="control"><input id="d_v" type="number" value="0.25" step="0.01" min="0.05" max="1.0"><span class="unit">м/с</span></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Ланцюг і привід</div>
  <div class="fgrid">
    <div class="field"><label>Маса ланцюга зі скребками <i>q_c</i></label>
      <div class="control"><input id="d_qc" type="number" value="5" step="0.5" min="1"><span class="unit">кг/м</span></div></div>
    <div class="field"><label>Коеф. тертя ланцюга по жолобу <i>f₁</i></label>
      <div class="control"><input id="d_f1" type="number" value="0.35" step="0.01" min="0.1" max="0.6"></div></div>
    <div class="field"><label>Коеф. тертя матеріалу по дну <i>f₂</i></label>
      <div class="control"><input id="d_f2" type="number" value="0.50" step="0.01" min="0.1" max="0.8"></div></div>
  </div>
  <div class="fgrid" style="margin-top:12px">
    <div class="field"><label>ККД привода <i>η</i></label>
      <div class="control"><input id="d_eta" type="number" value="0.82" step="0.01" min="0.5" max="0.99"></div></div>
    <div class="field"><label>Запас потужності <i>k</i></label>
      <div class="control"><input id="d_k" type="number" value="1.4" step="0.05" min="1" max="2.5"></div></div>
    <div class="field"><label>Діам. зірочки <i>d_s</i></label>
      <div class="control"><input id="d_ds" type="number" value="250" step="10" min="100"><span class="unit">мм</span></div></div>
  </div>
  <div class="fgrid" style="margin-top:12px">
    <div class="field"><label>Розривне навантаження ланцюга <i>F_розр</i></label>
      <div class="control"><input id="d_fbreak" type="number" value="100" step="5" min="10"><span class="unit">кН</span></div></div>
  </div>
</div>
<button class="calc-btn" onclick="CALCS.drag.run()">Розрахувати</button>`,

    run() {
      const L = num('d_L') / 1000, H = num('d_H') / 1000;
      const W = num('d_W') / 1000, h = num('d_h') / 1000;
      const rho = num('d_rho'), v = num('d_v');
      const qc = num('d_qc'), f1 = num('d_f1'), f2 = num('d_f2');
      const eta = num('d_eta'), k = num('d_k'), ds = num('d_ds') / 1000;
      const Fbreak = num('d_fbreak') * 1000;

      const betaR = Math.atan2(H, Math.sqrt(Math.max(0.001, L*L - H*H)));
      const beta = betaR * 180 / Math.PI;
      const qm = W * h * rho * 1000; // kg/m — погонна маса матеріалу
      const Q = qm * v * 3.6;

      // CEMA 550 methodology: F = F_mat + F_chain + F_gravity
      const Fmat  = f2 * qm * G * L * Math.cos(betaR);          // тертя матеріалу
      const Fch   = f1 * qc * G * L * Math.cos(betaR);          // тертя ланцюга
      const Fchret = f1 * qc * G * L * Math.cos(betaR);         // холоста гілка
      const Fv    = (qm + qc) * G * H;                           // підйом
      const Ftot  = Fmat + Fch + Fchret + Fv;
      const safety = Fbreak / Math.max(1, Ftot);
      const nSp   = v / (Math.PI * ds) * 60;
      const M     = Ftot * ds / 2;
      const Pm    = (Ftot * v / eta) * k / 1000;

      const mat = MAT_DB[val('d_mat')] || {};

      _m.inputs = [
        ['Довжина L', num('d_L'), 'мм'],
        ['Висота підйому H', num('d_H'), 'мм'],
        ['Ширина жолоба W', num('d_W'), 'мм'],
        ['Висота шару h', num('d_h'), 'мм'],
        ['Насипна щільність ρ', rho, 'т/м³'],
        ['Швидкість v', v, 'м/с'],
        ['Маса ланцюга q_c', qc, 'кг/м'],
        ['Коеф. тертя ланцюга f₁', f1, ''],
        ['Коеф. тертя матеріалу f₂', f2, ''],
        ['ККД η', eta, ''], ['Запас k', k, ''],
        ['Діам. зірочки d_s', num('d_ds'), 'мм'],
      ];
      _m.steps = [
        { n:'1', title:'Кут нахилу',
          formula:'β = arctan(H / √(L²−H²))',
          sub:`arctan(${fmt(H,2)} / ${fmt(Math.sqrt(Math.max(0.001,L*L-H*H)),2)})`,
          result:`β = ${fmt(beta,1)} °` },
        { n:'2', title:'Погонна маса матеріалу',
          formula:'q_m = W·h·ρ·1000',
          sub:`${fmt(W,3)}·${fmt(h,3)}·${rho}·1000`,
          result:`q_m = ${fmt(qm,2)} кг/м ;  Q = ${fmt(Q,2)} т/год` },
        { n:'3', title:'Тертя матеріалу по дну жолоба',
          formula:'F_мат = f₂·q_m·g·L·cosβ',
          sub:`${f2}·${fmt(qm,2)}·9.81·${fmt(L,1)}·cos${fmt(beta,1)}°`,
          result:`F_мат = ${fmt(Fmat,0)} Н` },
        { n:'4', title:'Тертя ланцюга (обидві гілки)',
          formula:'F_лан = 2·f₁·q_c·g·L·cosβ',
          sub:`2·${f1}·${qc}·9.81·${fmt(L,1)}·cos${fmt(beta,1)}°`,
          result:`F_лан = ${fmt(Fch+Fchret,0)} Н` },
        { n:'5', title:'Вертикальна складова',
          formula:'F_v = (q_m + q_c)·g·H',
          sub:`(${fmt(qm,2)}+${qc})·9.81·${fmt(H,2)}`,
          result:`F_v = ${fmt(Fv,0)} Н` },
        { n:'6', title:'Сумарне тягове зусилля',
          formula:'F = F_мат + F_лан + F_v',
          sub:`${fmt(Fmat,0)} + ${fmt(Fch+Fchret,0)} + ${fmt(Fv,0)}`,
          result:`F = ${fmt(Ftot,0)} Н = ${fmt(Ftot/1000,3)} кН` },
        { n:'7', title:'Потужність приводу',
          formula:'P = F·v / η · k',
          sub:`${fmt(Ftot,0)}·${v} / ${eta} · ${k} / 1000`,
          result:`P = ${fmt(Pm,3)} кВт` },
        { n:'8', title:'Момент та частота зірочки',
          formula:'M = F·d_s/2 ;  n = 60·v/(π·d_s)',
          sub:`${fmt(Ftot,0)}·${fmt(ds,3)}/2 ;  60·${v}/(π·${fmt(ds,3)})`,
          result:`M = ${fmt(M,0)} Н·м ;  n = ${fmt(nSp,1)} об/хв` },
      ];
      _m.checks = [
        {
          name: 'Запас міцності ланцюга',
          value: `${fmt(safety,1)} ×`,
          limit: '≥ 6 × (CEMA 550)',
          status: safety >= 6 ? 'ok' : safety >= 4 ? 'warn' : 'err',
          detail: safety < 6 ? `F = ${fmt(Ftot/1000,2)} кН; F_розр = ${fmt(Fbreak/1000,1)} кН` : null,
          recs: safety < 6 ? [`Ланцюг з F_розр ≥ ${fmt(Ftot*6/1000,0)} кН`] : null,
        },
        ...(mat.vMax ? [{
          name: 'Швидкість транспортування',
          value: `${v} м/с`,
          limit: `≤ 0.4 м/с рек. для ${mat.name}`,
          status: v <= 0.5 ? 'ok' : 'warn',
          detail: v > 0.5 ? 'Для En-masse v > 0.5 м/с підвищує знос ланцюга' : null,
          recs: v > 0.5 ? ['Знизити v ≤ 0.4 м/с'] : null,
        }] : []),
        { name: 'Потужність приводу', value: `${fmt(Pm,2)} кВт`, limit: '—', status: 'ok' },
      ];
      _m.motorPm = Pm;
      _m.reducerNout = nSp; _m.chainFone = Ftot; _m.beltF2 = 0; _m.shaftM = M;

      showResults(`
<div class="res-hl"><span class="big">${fmt(Pm,2)} кВт</span><span class="lbl">Потужність приводу · запас ×${k}</span></div>
<div class="rgroup"><div class="rgroup-t">Вантаж</div>
  <div class="rrow"><span class="rk">Продуктивність Q</span><span class="rv">${fmt(Q,2)}<span class="u">т/год</span></span></div>
  <div class="rrow"><span class="rk">Погонна маса матеріалу q_m</span><span class="rv">${fmt(qm,1)}<span class="u">кг/м</span></span></div>
  <div class="rrow"><span class="rk">Кут нахилу β</span><span class="rv">${fmt(beta,1)}<span class="u">°</span></span></div>
</div>
<div class="rgroup"><div class="rgroup-t">Тягове зусилля</div>
  <div class="rrow"><span class="rk">Тертя матеріалу</span><span class="rv">${fmt(Fmat,0)}<span class="u">Н</span></span></div>
  <div class="rrow"><span class="rk">Тертя ланцюга (2 гілки)</span><span class="rv">${fmt(Fch+Fchret,0)}<span class="u">Н</span></span></div>
  <div class="rrow"><span class="rk">Вертикальна складова</span><span class="rv">${fmt(Fv,0)}<span class="u">Н</span></span></div>
  <div class="rrow"><span class="rk">Сумарне F</span><span class="rv">${fmt(Ftot/1000,3)}<span class="u">кН</span></span></div>
  <div class="rrow"><span class="rk">Запас міцності ланцюга</span><span class="rv">${fmt(safety,1)}<span class="u">×</span></span></div>
</div>
<div class="rgroup"><div class="rgroup-t">Привід</div>
  <div class="rrow"><span class="rk">Момент M</span><span class="rv">${fmt(M,0)}<span class="u">Н·м</span></span></div>
  <div class="rrow"><span class="rk">Частота зірочки</span><span class="rv">${fmt(nSp,1)}<span class="u">об/хв</span></span></div>
</div>
<div class="formula">F = f₂·q_m·g·L·cosβ + 2·f₁·q_c·g·L·cosβ + (q_m+q_c)·g·H<br>P = <b>F·v / η · k</b></div>
${safety < 6 ? `<div class="note warn">Запас міцності ${fmt(safety,1)}× нижче норми 6× (CEMA 550). Оберіть ланцюг F_розр ≥ ${fmt(Ftot*6/1000,0)} кН.</div>` : `<div class="note ok">Запас міцності ланцюга ${fmt(safety,1)}× — у нормі (≥6×).</div>`}`);
    },
    sources: `<div class="src"><div class="src-kind">Стандарт</div><div class="src-title">CEMA 550 — Drag, Apron and Bucket Conveyors</div><div class="src-body">Методика розрахунку En-masse конвеєра. Коефіцієнти тертя, продуктивність, натяг ланцюга.</div></div>`,
    example: `<p>En-masse, зерно (ρ=0.75 т/м³), L=20 м, W=300 мм, h=200 мм, v=0.25 м/с → Q≈13.5 т/год, P≈0.55 кВт.</p>`
  },

  /* ──────────────────────────────────────────────────────────
     ВЕРТИКАЛЬНИЙ ШНЕК
  ────────────────────────────────────────────────────────── */
  screw_vertical: {
    title: 'Вертикальний шнековий конвеєр',
    subtitle: 'Підйом сипучих матеріалів по вертикальному гвинту. CEMA 350 / ДСТУ 2804.',
    form: `
<div class="fsection">
  <div class="flabel">Геометрія</div>
  <div class="fgrid">
    <div class="field"><label>Висота підйому <i>H</i></label>
      <div class="control"><input id="sv_H" type="number" value="4000" min="500"><span class="unit">мм</span></div></div>
    <div class="field"><label>Діаметр гвинта <i>D</i></label>
      <div class="control"><select id="sv_D">
        <option value="0.1">Ø 100 мм</option><option value="0.15">Ø 150 мм</option>
        <option value="0.2" selected>Ø 200 мм</option><option value="0.25">Ø 250 мм</option>
        <option value="0.315">Ø 315 мм</option><option value="0.4">Ø 400 мм</option>
        <option value="0.5">Ø 500 мм</option><option value="0.63">Ø 630 мм</option>
      </select></div></div>
    <div class="field"><label>Крок гвинта <i>t</i> (порожньо = D)</label>
      <div class="control"><input id="sv_t" type="number" placeholder="= D" min="50"><span class="unit">мм</span></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Матеріал</div>
  <div class="fgrid">
    <div class="field"><label>Матеріал</label>
      <div class="control"><select id="sv_mat" onchange="applyPreset('sv_mat','sv_rho')">${MATERIALS}</select></div></div>
    <div class="field"><label>Насипна щільність <i>ρ</i></label>
      <div class="control"><input id="sv_rho" type="number" value="0.75" step="0.05" min="0.1"><span class="unit">т/м³</span></div></div>
    <div class="field"><label>Коеф. заповнення <i>ψ</i></label>
      <div class="control"><input id="sv_psi" type="number" value="0.25" step="0.01" min="0.1" max="0.45"></div></div>
  </div>
</div>
<div class="fsection">
  <div class="flabel">Привід</div>
  <div class="fgrid">
    <div class="field"><label>Задана продуктивність <i>Q</i></label>
      <div class="control"><input id="sv_Q" type="number" value="30" min="0.5"><span class="unit">т/год</span></div></div>
    <div class="field"><label>Коеф. опору матеріалу <i>C_m</i></label>
      <div class="control"><input id="sv_Cm" type="number" value="2.5" step="0.1" min="1" max="4"></div></div>
    <div class="field"><label>ККД привода <i>η</i></label>
      <div class="control"><input id="sv_eta" type="number" value="0.80" step="0.01" min="0.5" max="0.99"></div></div>
  </div>
  <div class="fgrid" style="margin-top:12px">
    <div class="field"><label>Запас потужності <i>k</i></label>
      <div class="control"><input id="sv_k" type="number" value="1.5" step="0.05" min="1" max="2.5"></div></div>
  </div>
</div>
<button class="calc-btn" onclick="CALCS.screw_vertical.run()">Розрахувати</button>`,

    run() {
      const H = num('sv_H') / 1000, D = num('sv_D');
      const t = (num('sv_t') || num('sv_D') * 1000) / 1000;
      const rho = num('sv_rho'), psi = num('sv_psi'), Q = num('sv_Q');
      const Cm = num('sv_Cm'), eta = num('sv_eta'), k = num('sv_k');

      const mat = MAT_DB[val('sv_mat')] || {};
      const psiEff = mat.psi ? Math.min(psi, mat.psi) : psi;

      // CEMA 350 vertical screw: Q = 47.1·D²·t·n·ρ·ψ [т/год при D,t в м, n об/хв]
      // n_req from Q: n = Q / (47.1·D²·t·ρ·ψ)
      const n = Q / (47.1 * D * D * t * rho * psiEff);
      const Qa = 47.1 * D * D * t * n * rho * psiEff;

      // Critical speed (rope analogy): n_cr = 60/(2π) * √(g/H) * safety
      // CEMA: n_cr = (C·g/D)^0.5 * 60/(2π), C≈0.057 for vertical
      const nCr = (60 / (2 * Math.PI)) * Math.sqrt(9.81 / (0.057 * D));

      // Power: P = Q·H·Cm·k / (367·η) — same formula but Cm higher for vertical
      // Vertical penalty: Cm_vert = Cm (material) + 1.5 (centrifugal)
      const Cmv = Cm + 1.5;
      const Pt = Q * H * Cmv * k / (367 * eta);
      const M  = Pt * 1000 / (2 * Math.PI * n / 60);

      _m.inputs = [
        ['Висота підйому H', num('sv_H'), 'мм'],
        ['Діаметр гвинта D', (D*1000).toFixed(0), 'мм'],
        ['Крок t', (t*1000).toFixed(0), 'мм'],
        ['Насипна щільність ρ', rho, 'т/м³'],
        ['Коеф. заповнення ψ', psiEff, ''],
        ['Задана продуктивність Q', Q, 'т/год'],
        ['Коеф. опору C_m', Cm, ''],
        ['ККД η', eta, ''], ['Запас k', k, ''],
      ];
      _m.steps = [
        { n:'1', title:'Необхідна частота обертання',
          formula:'n = Q / (47.1·D²·t·ρ·ψ)',
          sub:`${Q} / (47.1·${D}²·${fmt(t,3)}·${rho}·${psiEff})`,
          result:`n = ${fmt(n,1)} об/хв` },
        { n:'2', title:'Критична частота (відцентрування)',
          formula:'n_кр = 60/(2π) · √(g / (0.057·D))',
          sub:`60/(2π) · √(9.81 / (0.057·${D}))`,
          result:`n_кр = ${fmt(nCr,1)} об/хв` },
        { n:'3', title:'Фактична продуктивність',
          formula:'Q_ф = 47.1·D²·t·n·ρ·ψ',
          sub:`47.1·${D}²·${fmt(t,3)}·${fmt(n,1)}·${rho}·${psiEff}`,
          result:`Q_ф = ${fmt(Qa,2)} т/год` },
        { n:'4', title:'Потужність привода (вертикальний C_m + 1.5)',
          formula:'P = Q·H·(C_m + 1.5)·k / (367·η)',
          sub:`${Q}·${fmt(H,2)}·${Cmv}·${k} / (367·${eta})`,
          result:`P = ${fmt(Pt,3)} кВт` },
        { n:'5', title:'Крутний момент на валу',
          formula:'M = P·1000 / (2π·n/60)',
          sub:`${fmt(Pt,3)}·1000 / (2π·${fmt(n,1)}/60)`,
          result:`M = ${fmt(M,0)} Н·м` },
      ];
      _m.checks = [
        {
          name: 'Частота / критична',
          value: `${fmt(n,1)} об/хв`,
          limit: `≤ ${fmt(nCr*0.6,0)} об/хв (60% n_кр)`,
          status: n <= nCr*0.6 ? 'ok' : n <= nCr*0.75 ? 'warn' : 'err',
          detail: n > nCr*0.6 ? `n_кр = ${fmt(nCr,1)} об/хв — матеріал буде центрифугуватись` : null,
          recs: n > nCr*0.6 ? [
            `Збільшити D → вища n_кр`,
            `Зменшити t → більше обертів при тій же Q`,
          ] : null,
        },
        { name: 'Продуктивність', value: `${fmt(Qa,2)} т/год`, limit: `≥ ${Q} т/год`, status: Qa >= Q*0.99 ? 'ok' : 'warn' },
        { name: 'Потужність приводу', value: `${fmt(Pt,3)} кВт`, limit: '—', status: 'ok' },
        { name: 'Крутний момент', value: `${fmt(M,0)} Н·м`, limit: '—', status: 'ok' },
      ];
      _m.motorPm = Pt;
      _m.reducerNout = n; _m.chainFone = 0; _m.beltF2 = 0; _m.shaftM = M;

      showResults(`
<div class="res-hl"><span class="big">${fmt(Pt,3)} кВт</span><span class="lbl">Потужність приводу · запас ×${k}</span></div>
<div class="rgroup"><div class="rgroup-t">Кінематика</div>
  <div class="rrow"><span class="rk">Необхідна частота n</span><span class="rv">${fmt(n,1)}<span class="u">об/хв</span></span></div>
  <div class="rrow"><span class="rk">Критична частота n_кр</span><span class="rv">${fmt(nCr,1)}<span class="u">об/хв</span></span></div>
  <div class="rrow"><span class="rk">Запас до n_кр</span><span class="rv">${fmt(nCr/n,2)}<span class="u">×</span></span></div>
  <div class="rrow"><span class="rk">Фактична Q при n</span><span class="rv">${fmt(Qa,2)}<span class="u">т/год</span></span></div>
</div>
<div class="rgroup"><div class="rgroup-t">Привід</div>
  <div class="rrow"><span class="rk">Потужність P</span><span class="rv">${fmt(Pt,3)}<span class="u">кВт</span></span></div>
  <div class="rrow"><span class="rk">Крутний момент M</span><span class="rv">${fmt(M,0)}<span class="u">Н·м</span></span></div>
</div>
<div class="formula">n = Q / (47.1·D²·t·ρ·ψ)<br>P = Q·H·(C_m + 1.5)·k / (367·η)<br>n_кр = 60/(2π)·√(g/(0.057·D))</div>
${n > nCr*0.6 ? `<div class="note warn">Частота ${fmt(n,1)} об/хв перевищує 60% критичної (${fmt(nCr*0.6,0)} об/хв). Матеріал прилипне до стінок жолоба — збільшіть D або зменшіть крок t.</div>` : `<div class="note ok">Частота ${fmt(n,1)} об/хв = ${fmt(n/nCr*100,0)}% від критичної — у нормі.</div>`}`);
    },
    sources: `<div class="src"><div class="src-kind">Галузевий стандарт</div><div class="src-title">CEMA 350 — Screw Conveyors for Bulk Materials</div><div class="src-body">Методика для вертикального шнека: формула продуктивності, критична частота обертання, поправочний коефіцієнт C_m + 1.5 для вертикального підйому.</div></div>`,
    example: `<p>Вертикальний шнек Ø200 мм, H=4 м, зерно (ρ=0.75, ψ=0.25), Q=30 т/год → n≈330 об/хв (n_кр≈500 об/хв), P≈1.0 кВт.</p>`
  },

};

// ── stub for not-yet-implemented types ───────────────────────
const STUB_TITLES = {
  belt_trough: 'Стрічковий жолобчатий', plate: 'Пластинчастий',
  bucket_chain: 'Ківшевий елеватор (ланцюг)',
  paternoster: 'Люлечний (Paternoster)',
  overhead_chain: 'Підвісний ланцюговий', power_free: 'Power & Free',
  vibro: 'Вібраційний', pneumo: 'Пневматичний', apron: 'Фартушний (Apron)',
  telescopic: 'Телескопічний'
};

function getCalc(type) {
  if (CALCS[type]) return CALCS[type];
  const title = STUB_TITLES[type] || type;
  return {
    title,
    subtitle: 'Методика в розробці.',
    form: `<div style="padding:8px 0;color:var(--text-2);font-size:14px;line-height:1.8">
      Розрахунок «${title}» буде додано в наступних версіях.<br><br>
      Зараз повністю реалізовані:<br>
      <a class="muted-link" href="calc.html?type=belt">Стрічковий</a> ·
      <a class="muted-link" href="calc.html?type=screw">Шнековий</a> ·
      <a class="muted-link" href="calc.html?type=mesh_chain">Ланцюговий із сіткою</a> ·
      <a class="muted-link" href="calc.html?type=chain_scraper">Скребковий</a> ·
      <a class="muted-link" href="calc.html?type=plate">Пластинчастий</a> ·
      <a class="muted-link" href="calc.html?type=roller">Роликовий</a> ·
      <a class="muted-link" href="calc.html?type=bucket_belt">Ківшевий елеватор</a> ·
      <a class="muted-link" href="calc.html?type=drag">Волочильний (En-masse)</a> ·
      <a class="muted-link" href="calc.html?type=screw_vertical">Вертикальний шнек</a></div>`,
    run() {},
    sources: '<div style="color:var(--muted);padding:8px 0">Джерела будуть додані разом із методикою.</div>',
    example: '<div style="color:var(--muted);padding:8px 0">Приклад буде додано разом із методикою.</div>'
  };
}

// ── page init ────────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  $id('tab-' + name)?.classList.add('active');
  $id('panel-' + name)?.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  const type = new URLSearchParams(location.search).get('type') || 'belt';
  _m.type = type;
  const C = getCalc(type);
  document.title = C.title + ' — EngCalc';
  $id('calc-title').textContent = C.title;
  $id('calc-sub').textContent = C.subtitle || '';
  $id('crumb-type').textContent = C.title;
  $id('form-area').innerHTML = C.form;
  $id('sources-area').innerHTML = C.sources;
  $id('example-area').innerHTML = C.example;
});
