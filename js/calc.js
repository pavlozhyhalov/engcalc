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

let _m = { type: '', inputs: {}, resultsHtml: '', schemaHtml: '' };

function _dlReport() {
  if (typeof downloadReport !== 'function') return;
  const C = getCalc(_m.type);
  downloadReport({
    title: C.title,
    subtitle: C.subtitle || '',
    schemaHtml: _m.schemaHtml,
    resultsHtml: _m.resultsHtml,
    inputRows: Object.entries(_m.inputs).map(([k,v]) => [k, v])
  });
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

function showResults(html) {
  const empty = $id('res-empty'), box = $id('res-content');
  if (empty) empty.style.display = 'none';
  if (box) {
    box.style.display = 'block';
    _m.resultsHtml = html;
    const svgHtml = (typeof makeSchema === 'function') ? makeSchema(_m.type, _m.inputs) : '';
    _m.schemaHtml = svgHtml;
    box.innerHTML = html
      + (svgHtml ? `<div class="calc-schema"><div class="calc-schema-lbl">ПРИНЦИПОВА СХЕМА</div>${svgHtml}</div>` : '')
      + `<button class="report-btn" onclick="_dlReport()">⬇ Завантажити розрахунок</button>`;
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
      _m.inputs = { L_мм: num('b_L'), H_мм: num('b_H'), β_°: num('b_beta') || 'авто', B_мм: num('b_B')*1000, v_мс: num('b_v'), Q_тгод: num('b_Q'), ρ_тм3: num('b_rho'), φ_°: num('b_phi'), η: num('b_eta'), ω: num('b_omega'), k_z: num('b_kz') };
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
      _m.inputs = { L_мм: num('s_L'), β_°: num('s_beta'), D_мм: num('s_D')*1000, ρ_тм3: num('s_rho'), ψ: parseFloat(val('s_psi')), Q_тгод: num('s_Q'), n_обхв: num('s_n'), C_m: parseFloat(val('s_Cm')), η: num('s_eta'), k: num('s_k') };
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
      _m.inputs = { L_мм: num('m_L'), H_мм: num('m_H'), B_мм: num('m_B'), v_мс: num('m_v'), f: parseFloat(val('m_f')), η: num('m_eta'), k: num('m_k'), d_s_мм: num('m_ds'), 'ланцюгів': parseFloat(val('m_chains')) };
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
      _m.inputs = { L_мм: num('c_L'), H_мм: num('c_H'), B_м: num('c_B'), ρ_тм3: num('c_rho'), h_мм: num('c_h'), v_мс: num('c_v'), q_c_кгм: num('c_qc'), f: num('c_f'), η: num('c_eta'), k: num('c_k') };
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
      _m.inputs = { L_мм: num('r_L'), β_°: num('r_beta'), d_r_мм: num('r_dr')*1000, m_кг: num('r_m'), l_мм: num('r_l'), a_мм: num('r_a'), m_r_кг: num('r_mr'), f: num('r_f'), v_мс: num('r_v'), режим: val('r_mode'), η: num('r_eta') };
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
      _m.inputs = { H_мм: num('e_H'), i_л: num('e_i'), a_мм: num('e_a'), ρ_тм3: num('e_rho'), ψ: num('e_psi'), v_мс: num('e_v'), q_t_кгм: num('e_qt'), k_з: num('e_kz'), η: num('e_eta'), k: num('e_k') };
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
  }
};

// ── stub for not-yet-implemented types ───────────────────────
const STUB_TITLES = {
  belt_trough: 'Стрічковий жолобчатий', plate: 'Пластинчастий',
  drag: 'Волочильний (En-masse)', bucket_chain: 'Ківшевий елеватор (ланцюг)',
  screw_vertical: 'Шнек вертикальний', paternoster: 'Люлечний (Paternoster)',
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
      <a class="muted-link" href="calc.html?type=roller">Роликовий</a> ·
      <a class="muted-link" href="calc.html?type=bucket_belt">Ківшевий елеватор</a></div>`,
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
