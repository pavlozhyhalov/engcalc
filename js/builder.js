/* ============================================================
   ConveyorCalc — builder.js
   Конфігуратор нестандартного конвеєра
   ============================================================ */

'use strict';

const $id = (id) => document.getElementById(id);
const num = (id) => parseFloat($id(id)?.value) || 0;
const val = (id) => $id(id)?.value || '';
const fmt = (v, d = 2) => (isNaN(v) || !isFinite(v)) ? '—' : v.toFixed(d);
const G = 9.81;

const state = {
  drive: 'motred',
  shaft: 'cross_shaft',
  traction: 'conveyor_chain',
  carrier: 'rods',
  guide: 'slide_steel'
};

const LABELS = {
  drive: {
    motred: 'Мотор-редуктор',
    motor_reducer: 'Двигун + окремий редуктор',
    hydraulic: 'Гідромотор',
    vfd: 'Двигун + частотний перетворювач'
  },
  shaft: {
    cross_shaft: 'Поперечний вал + 2 зірочки',
    single_sprocket: 'Одна центральна зірочка',
    drum: 'Приводний барабан',
    two_drives: 'Два синхронізованих приводи'
  },
  traction: {
    roller_chain: 'Роликовий ланцюг ISO 606',
    conveyor_chain: 'Конвеєрний ланцюг DIN 8167',
    belt: 'Стрічка',
    rope: 'Сталевий канат'
  },
  carrier: {
    rods: 'Поперечні прути',
    mesh: 'Металева сітка',
    plates: 'Пластини',
    slats: 'Планки',
    buckets: 'Ковші',
    scrapers: 'Скребки'
  },
  guide: {
    slide_steel: 'Ковзання по сталі (f≈0.15)',
    slide_ss: 'Нержавійка по нержавійці (f≈0.20)',
    slide_pe: 'UHMW-PE напрямні (f≈0.08)',
    roller_track: 'Роликовий ланцюг по рейці (f≈0.05)'
  }
};

// ── option selection ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.opts').forEach(group => {
    const key = group.dataset.group;
    group.querySelectorAll('.opt').forEach(opt => {
      opt.addEventListener('click', () => {
        group.querySelectorAll('.opt').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        state[key] = opt.dataset.val;
        if (key === 'guide' && opt.dataset.f) {
          $id('p_f').value = opt.dataset.f;
        }
        renderSummary();
      });
    });
  });
  renderSummary();
});

function renderSummary() {
  $id('summary').innerHTML = `
    <h3>Поточна конфігурація</h3>
    <div class="srow"><span class="sk">Привід</span><span class="sv">${LABELS.drive[state.drive]}</span></div>
    <div class="srow"><span class="sk">Вал</span><span class="sv">${LABELS.shaft[state.shaft]}</span></div>
    <div class="srow"><span class="sk">Тяговий орган</span><span class="sv">${LABELS.traction[state.traction]}</span></div>
    <div class="srow"><span class="sk">Несучий елемент</span><span class="sv">${LABELS.carrier[state.carrier]}</span></div>
    <div class="srow"><span class="sk">Напрямні</span><span class="sv">${LABELS.guide[state.guide]}</span></div>`;
}

// ── calculation ──────────────────────────────────────────────
function runBuilder() {
  const L = num('p_L'), H = num('p_H'), B = num('p_B');
  const v = num('p_v'), f = num('p_f'), eta = num('p_eta');
  const k = num('p_k'), ds = num('p_ds');
  const qt = num('p_qt'), qn = num('p_qn'), qa = num('p_qa');
  const loadType = val('p_loadtype'), loadVal = num('p_load'), pitch = num('p_pitch');
  const Fbreak = num('p_fbreak') * 1000;

  const betaR = Math.atan2(H, Math.sqrt(Math.max(0.01, L * L - H * H)));
  const beta = betaR * 180 / Math.PI;

  let qload = 0, Q = 0;
  if (loadType === 'unit') { qload = loadVal / pitch; Q = loadVal * (v / pitch) * 3.6; }
  else if (loadType === 'flow') { Q = loadVal; qload = loadVal / (3.6 * v); }
  else { qload = loadVal * B; Q = loadVal * B * v * 3.6; }

  const qmov = qt + qn + qa;
  const Fgo = f * (qmov + qload) * G * L * Math.cos(betaR);
  const Fret = f * qmov * G * L * Math.cos(betaR);
  const Fv = (qmov + qload) * G * H;
  const Ftot = Fgo + Fret + Fv;

  const nTraction = (state.shaft === 'cross_shaft' || state.shaft === 'two_drives') ? 2 : 1;
  const Fone = Ftot / nTraction;
  const safety = Fbreak / Math.max(1, Fone);

  const Pm = (Ftot * v / eta) * k / 1000;
  const M = Ftot * ds / 2;
  const nSp = v / (Math.PI * ds) * 60;

  // shaft check (for cross shaft): torsion between gearbox and far sprocket
  const shaftNote = state.shaft === 'cross_shaft'
    ? `Поперечний вал передає повний момент ${fmt(M, 0)} Н·м від мотор-редуктора до зірочок. Перевірте вал на кручення: для сталі 45 допустиме [τ] ≈ 25 МПа → мінімальний діаметр d ≥ ∛(M·16/(π·[τ])) = ${fmt(Math.cbrt(M * 16 / (Math.PI * 25e6)) * 1000, 0)} мм.`
    : state.shaft === 'drum'
      ? `Барабанний привід: перевірте зчеплення стрічки за Ейлером (μ ≈ 0.3–0.4, кут обхвату ≥ 180°).`
      : state.shaft === 'two_drives'
        ? `Два приводи: обов'язкова електрична синхронізація (енкодери + ЧП) або механічний синхровал.`
        : `Одна зірочка передає повний момент ${fmt(M, 0)} Н·м. Слідкуйте за перекосом несучої частини при позацентровому навантаженні.`;

  const driveNote = {
    motred: `Мотор-редуктор: підберіть за P ≥ ${fmt(Pm, 2)} кВт, M ≥ ${fmt(M * 1.2, 0)} Н·м, n_вих ≈ ${fmt(nSp, 0)} об/хв (сервіс-фактор ≥ 1.2).`,
    motor_reducer: `Двигун ≥ ${fmt(Pm, 2)} кВт + редуктор з i = ${fmt(1450 / Math.max(1, nSp), 0)} (від 1450 об/хв) та M_вих ≥ ${fmt(M * 1.2, 0)} Н·м.`,
    hydraulic: `Гідромотор: робочий об'єм за M = ${fmt(M, 0)} Н·м і тиском станції; перевагою є плавний пуск.`,
    vfd: `Двигун ≥ ${fmt(Pm * 1.1, 2)} кВт з ЧП: врахуйте зниження охолодження на низьких частотах (нижче 25 Гц — примусова вентиляція).`
  }[state.drive];

  const schema = `${LABELS.drive[state.drive]} → ${LABELS.shaft[state.shaft]} → ${nTraction} × ${LABELS.traction[state.traction]} → ${LABELS.carrier[state.carrier]}`;

  $id('bres-content').innerHTML = `
<div class="schema">${schema.replaceAll('→', '<b>→</b>')}</div>
<div class="bres-grid">
  <div>
    <div class="res-hl"><span class="big">${fmt(Pm, 2)} кВт</span><span class="lbl">Потужність приводу · запас ×${k}</span></div>
    <div class="panel" style="padding:20px">
      <div class="rgroup-t">Вантаж і геометрія</div>
      <div class="rrow"><span class="rk">Продуктивність Q</span><span class="rv">${fmt(Q, 2)}<span class="u">т/год</span></span></div>
      <div class="rrow"><span class="rk">Погонна маса вантажу</span><span class="rv">${fmt(qload, 2)}<span class="u">кг/м</span></span></div>
      <div class="rrow"><span class="rk">Маса рухомих частин</span><span class="rv">${fmt(qmov, 1)}<span class="u">кг/м</span></span></div>
      <div class="rrow"><span class="rk">Кут нахилу β</span><span class="rv">${fmt(beta, 1)}<span class="u">°</span></span></div>
    </div>
  </div>
  <div>
    <div class="panel" style="padding:20px">
      <div class="rgroup-t">Тягове зусилля</div>
      <div class="rrow"><span class="rk">Тертя робочої гілки</span><span class="rv">${fmt(Fgo, 0)}<span class="u">Н</span></span></div>
      <div class="rrow"><span class="rk">Тертя холостої гілки</span><span class="rv">${fmt(Fret, 0)}<span class="u">Н</span></span></div>
      <div class="rrow"><span class="rk">Вертикальна складова</span><span class="rv">${fmt(Fv, 0)}<span class="u">Н</span></span></div>
      <div class="rrow"><span class="rk">Сумарне F</span><span class="rv">${fmt(Ftot / 1000, 2)}<span class="u">кН</span></span></div>
      <div class="rrow"><span class="rk">На один тяговий орган</span><span class="rv">${fmt(Fone / 1000, 2)}<span class="u">кН</span></span></div>
      <div class="rrow"><span class="rk">Запас міцності</span><span class="rv">${fmt(safety, 0)}<span class="u">×</span></span></div>
    </div>
    <div class="panel" style="padding:20px;margin-top:14px">
      <div class="rgroup-t">Привід</div>
      <div class="rrow"><span class="rk">Крутний момент M</span><span class="rv">${fmt(M, 0)}<span class="u">Н·м</span></span></div>
      <div class="rrow"><span class="rk">Частота обертання</span><span class="rv">${fmt(nSp, 1)}<span class="u">об/хв</span></span></div>
    </div>
  </div>
</div>
<div class="formula">F = f·(q_рух + q_ван)·g·L·cosβ + f·q_рух·g·L·cosβ + (q_рух + q_ван)·g·H<br>P = <b>F·v / η · k</b> · | · M = F·d_s/2 · | · n = 60·v/(π·d_s)</div>
<div class="note info">${driveNote}</div>
<div class="note info">${shaftNote}</div>
${safety < 8
  ? `<div class="note warn">Запас міцності ${fmt(safety, 1)}× нижче норми 8–10× для конвеєрних ланцюгів. Виберіть тяговий орган з більшим розривним навантаженням.</div>`
  : `<div class="note ok">Запас міцності тягового органу ${fmt(safety, 0)}× — достатній (норма ≥ 8–10×).</div>`}`;

  $id('bres').classList.add('visible');
  $id('bres').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
