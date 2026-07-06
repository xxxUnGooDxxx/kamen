/* ============================================================
   КАМЕНЪ — Dark Luxury · скрипт
   Lenis (плавный скролл) + GSAP ScrollTrigger + формы/галерея
   ============================================================ */
(function () {
  'use strict';

  // ID счётчика Яндекс.Метрики — нужен, чтобы при отправке форм засчитывались цели
  window.YM_ID = window.YM_ID || 110157989;

  /* ============================================================
     КВИЗ-КАЛЬКУЛЯТОР (акрил) — встраивается на каждую страницу
     Внедряется целиком из JS: стили + модалка + кнопки в шапке.
     Форма помечена data-lead → уходит в общий поток заявок ниже.
     Цены — из рабочей таблицы «акрил.xlsx» (собственный расчёт,
     намеренно отличается от витринных цен сайта).
     ============================================================ */
  (function buildQuiz () {
    if (document.getElementById('quiz-modal')) return;

    // ---- Стили (на токенах сайта, работают в обеих темах) ----
    var css = ''
      + '.modal--quiz .modal__box{max-width:560px;padding:30px 28px;max-height:90vh;overflow-y:auto;overscroll-behavior:contain}'
      + '.modal--quiz .modal__close{position:sticky;top:-6px;float:right;margin:-8px -6px 0 0;z-index:2}'
      + '.quiz__head h3{font-size:26px;margin-bottom:14px}'
      + '.quiz__bar{height:5px;background:var(--bg-3);border-radius:5px;overflow:hidden;margin-bottom:22px}'
      + '.quiz__bar>i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--gold-deep),var(--gold-2));transition:width .35s}'
      + '.quiz__step{display:none}.quiz__step.on{display:block;animation:qfade .25s ease}'
      + '@keyframes qfade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}'
      + '.quiz__q{font-size:19px;font-weight:500;margin:0 0 4px;font-family:var(--font-head)}'
      + '.quiz__hint{color:var(--muted);font-size:13px;margin:0 0 16px}'
      + '.quiz__opts{display:grid;gap:10px}.quiz__opts.two{grid-template-columns:1fr 1fr}'
      + '.quiz__opt{border:1px solid var(--line);background:var(--bg-3);border-radius:12px;padding:13px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:10px;transition:var(--t);user-select:none}'
      + '.quiz__opt:hover{border-color:var(--gold)}'
      + '.quiz__opt.sel{border-color:var(--gold-2);background:linear-gradient(180deg,rgba(255,255,255,.05),var(--bg-3))}'
      + '.quiz__opt .t{font-size:14.5px;font-weight:500;color:var(--ink)}'
      + '.quiz__opt .d{font-size:12px;color:var(--muted);margin-top:2px}'
      + '.quiz__opt .p{font-size:12.5px;color:var(--gold-2);white-space:nowrap}'
      + '.quiz__chk{width:20px;height:20px;border-radius:6px;border:1px solid var(--line);flex:none;display:grid;place-items:center;font-size:12px;color:var(--btn-ink);background:transparent}'
      + '.quiz__opt.sel .quiz__chk{background:var(--gold-2);border-color:var(--gold-2)}'
      + '.quiz__lenval{font-size:32px;font-weight:500;text-align:center;margin:6px 0;font-family:var(--font-head);color:var(--gold-2)}'
      + '.quiz__lenval small{font-size:14px;color:var(--muted)}'
      + '.quiz input[type=range]{width:100%;accent-color:var(--gold)}'
      + '.quiz__nav{display:flex;gap:10px;margin-top:20px}.quiz__nav .btn{flex:1}'
      + '.quiz__est{margin-top:16px;padding-top:14px;border-top:1px solid var(--line-2);display:flex;justify-content:space-between;align-items:center}'
      + '.quiz__est-lbl{font-size:12px;color:var(--muted)}'
      + '.quiz__est-val{font-family:var(--font-head);font-size:22px;color:var(--gold-2);white-space:nowrap}'
      + '.quiz__price{font-family:var(--font-head);font-size:42px;color:var(--gold-2);text-align:center;margin:4px 0;line-height:1}'
      + '.quiz__from{text-align:center;color:var(--muted);font-size:13px}'
      + '.quiz__bd{font-size:13px;color:var(--ink-soft);margin:16px 0}'
      + '.quiz__bd div{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dashed var(--line-2)}'
      + '.quiz__disc{font-size:12px;color:var(--muted);background:var(--bg-3);border-radius:10px;padding:12px 14px;margin:14px 0}'
      // пункт «Рассчитать стоимость» в меню — только на мобильных (на десктопе есть кнопка в шапке)
      + '.nav a.quiz-open{display:none}'
      + '@media(max-width:720px){.nav a.quiz-open{display:block}}';
    var st = document.createElement('style'); st.id = 'quiz-css'; st.textContent = css;
    document.head.appendChild(st);

    // ---- Разметка модалки ----
    var html = ''
      + '<div class="modal__overlay"></div>'
      + '<div class="modal__box quiz">'
      +   '<button class="modal__close" type="button" aria-label="Закрыть">×</button>'
      +   '<div class="quiz__head"><h3>Расчёт стоимости</h3><div class="quiz__bar"><i></i></div></div>'
      +   '<form data-lead id="quiz-form">'
      +     '<input type="hidden" name="access_key" value="">'
      +     '<input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off">'
      +     '<input type="hidden" name="product" value="Квиз-калькулятор (акрил)">'
      +     '<input type="hidden" name="comment" value="">'
      // step 0 — тип
      +     '<div class="quiz__step on" data-step="0"><p class="quiz__q">Что нужно изготовить?</p><p class="quiz__hint">Выберите тип изделия</p>'
      +       '<div class="quiz__opts" data-single="type">'
      +         '<div class="quiz__opt" data-val="counter"><div><div class="t">Кухонная столешница</div><div class="d">Прямая или угловая</div></div><div class="p">от 6 500 ₽/м.п.</div></div>'
      +         '<div class="quiz__opt" data-val="island"><div><div class="t">Остров / барная стойка</div></div><div class="p">от 10 500 ₽/м.п.</div></div>'
      +         '<div class="quiz__opt" data-val="sill"><div><div class="t">Подоконник</div></div><div class="p">от 4 000 ₽/м.п.</div></div>'
      +         '<div class="quiz__opt" data-val="basin"><div><div class="t">Раковина в санузел</div></div><div class="p">от 16 000 ₽</div></div>'
      +       '</div></div>'
      // step 1 — длина
      +     '<div class="quiz__step" data-step="1"><p class="quiz__q" data-len-title>Длина изделия</p><p class="quiz__hint">Ориентировочно, в метрах погонных</p>'
      +       '<div class="quiz__lenval"><span data-len-num>2.0</span> <small>м.п.</small></div>'
      +       '<input type="range" data-len min="0.5" max="6" step="0.1" value="2"></div>'
      // step 2 — толщина
      +     '<div class="quiz__step" data-step="2"><p class="quiz__q">Толщина столешницы</p><p class="quiz__hint">Толстая выглядит массивнее</p>'
      +       '<div class="quiz__opts" data-single="thick">'
      +         '<div class="quiz__opt sel" data-val="12"><div><div class="t">12 мм (тонкая)</div></div><div class="p">базовая</div></div>'
      +         '<div class="quiz__opt" data-val="24"><div><div class="t">24–60 мм (толстая)</div></div><div class="p">+ к цене</div></div>'
      +       '</div></div>'
      // step 3 — мойка
      +     '<div class="quiz__step" data-step="3"><p class="quiz__q">Мойка</p><p class="quiz__hint">Как будет установлена мойка</p>'
      +       '<div class="quiz__opts" data-single="sink">'
      +         '<div class="quiz__opt sel" data-val="none"><div><div class="t">Без мойки / своя врезная</div></div><div class="p">0 ₽</div></div>'
      +         '<div class="quiz__opt" data-val="cut"><div><div class="t">Врезка мойки заказчика</div></div><div class="p">+5 000 ₽</div></div>'
      +         '<div class="quiz__opt" data-val="stone"><div><div class="t">Мойка из камня до 500 мм</div></div><div class="p">+21 000 ₽</div></div>'
      +         '<div class="quiz__opt" data-val="stonebig"><div><div class="t">Мойка из камня увеличенная</div></div><div class="p">+25 000 ₽</div></div>'
      +       '</div></div>'
      // step 4 — фартук
      +     '<div class="quiz__step" data-step="4"><p class="quiz__q">Фартук / стеновая панель</p><p class="quiz__hint">Панель из камня по стене</p>'
      +       '<div class="quiz__opts" data-single="apron">'
      +         '<div class="quiz__opt sel" data-val="none"><div><div class="t">Не нужен</div></div><div class="p">0 ₽</div></div>'
      +         '<div class="quiz__opt" data-val="low"><div><div class="t">До 300 мм высотой</div></div><div class="p">+2 000 ₽/м.п.</div></div>'
      +         '<div class="quiz__opt" data-val="high"><div><div class="t">От 300 до 760 мм</div></div><div class="p">+4 500 ₽/м.п.</div></div>'
      +       '</div></div>'
      // step 5 — доп
      +     '<div class="quiz__step" data-step="5"><p class="quiz__q">Дополнительно</p><p class="quiz__hint">Можно выбрать несколько</p>'
      +       '<div class="quiz__opts" data-multi="extras">'
      +         '<div class="quiz__opt" data-val="plinth"><div><div class="t">Пристеночный плинтус (бортик)</div></div><div class="quiz__chk">✓</div></div>'
      +         '<div class="quiz__opt" data-val="radius"><div><div class="t">Скруглённые углы (радиус)</div></div><div class="quiz__chk">✓</div></div>'
      +         '<div class="quiz__opt" data-val="hob"><div><div class="t">Вырез под варочную панель</div></div><div class="quiz__chk">✓</div></div>'
      +       '</div></div>'
      // step 6 — коллекция
      +     '<div class="quiz__step" data-step="6"><p class="quiz__q">Коллекция камня</p><p class="quiz__hint">Влияет на стоимость материала. Цвет подберём на замере</p>'
      +       '<div class="quiz__opts" data-single="coll">'
      +         '<div class="quiz__opt sel" data-val="1"><div><div class="t">Базовая</div><div class="d">Однотонные и светлые</div></div><div class="p">базовая цена</div></div>'
      +         '<div class="quiz__opt" data-val="1.15"><div><div class="t">Средняя</div><div class="d">С прожилками</div></div><div class="p">+15%</div></div>'
      +         '<div class="quiz__opt" data-val="1.3"><div><div class="t">Премиум</div><div class="d">Мрамор, крупная крошка</div></div><div class="p">+30%</div></div>'
      +       '</div></div>'
      // step 7 — итог + контакты
      +     '<div class="quiz__step" data-step="7"><p class="quiz__q" style="text-align:center">Ориентировочная стоимость</p>'
      +       '<div class="quiz__from">примерно</div><div class="quiz__price" data-price>— ₽</div>'
      +       '<div class="quiz__bd" data-bd></div>'
      +       '<div class="quiz__disc">Это предварительный расчёт. Итоговая цена зависит от конфигурации и результатов замера. Оставьте контакты — мастер свяжется и уточнит детали.</div>'
      +       '<div class="field"><input type="text" name="name" placeholder="Ваше имя" required></div>'
      +       '<div class="field"><input type="tel" name="phone" placeholder="Телефон" required></div>'
      +       '<button class="btn btn--gold btn--block" type="submit"><span>Получить расчёт</span></button></div>'
      +     '<div class="quiz__nav">'
      +       '<button class="btn btn--outline" type="button" data-back style="display:none"><span>Назад</span></button>'
      +       '<button class="btn btn--gold" type="button" data-next disabled><span>Далее</span></button>'
      +     '</div>'
      +     '<div class="form-msg"></div>'
      +   '</form>'
      +   '<div class="quiz__est"><span class="quiz__est-lbl">Примерно</span><span class="quiz__est-val" data-est>от — ₽</span></div>'
      + '</div>';
    var qm = document.createElement('div');
    qm.className = 'modal modal--quiz'; qm.id = 'quiz-modal'; qm.innerHTML = html;
    document.body.appendChild(qm);

    // ---- Цены (акрил.xlsx, колонка «Цена») ----
    var P = {
      base:   { counter:6500, island:10500, sill:4000, basin:16000 },
      thick24:2000,
      sink:   { none:0, cut:5000, stone:21000, stonebig:25000 },
      apron:  { none:0, low:2000, high:4500 },
      extras: { plinth:1000, radius:1500, hob:5000, measure:2000, delivery:4000 },
      install:{ counter:1500, apron:1000, plinth:500, sill:2500 }
    };
    var LBL = {
      type:{counter:'Кухонная столешница',island:'Остров',sill:'Подоконник',basin:'Раковина в санузел'},
      thick:{'12':'12 мм','24':'24–60 мм'},
      sink:{none:'без мойки',cut:'врезка мойки',stone:'мойка из камня',stonebig:'мойка увеличенная'},
      apron:{none:'нет',low:'до 300',high:'300–760'},
      extras:{plinth:'плинтус',radius:'радиусы',hob:'вырез варочной'},
      coll:{'1':'базовая','1.15':'средняя','1.3':'премиум'}
    };
    var A = { type:null, len:2, thick:'12', sink:'none', apron:'none', extras:[], coll:'1' };
    var step = 0;

    var money = function (n) { n = Math.round(n / 100) * 100; return n.toLocaleString('ru-RU'); };

    function activeSteps () {
      if (A.type === 'basin') return [0, 6, 7];
      if (A.type === 'sill')  return [0, 1, 5, 6, 7];
      return [0, 1, 2, 3, 4, 5, 6, 7];
    }

    function calc () {
      var t = 0, bd = [];
      if (A.type === 'basin') {
        t = P.base.basin; bd.push(['Раковина из камня', P.base.basin]);
      } else if (A.type) {
        var mp = A.len, bt = (P.base[A.type] || 0) * mp;
        if (A.type !== 'sill' && A.thick === '24') bt += P.thick24 * mp;
        t += bt; bd.push([LBL.type[A.type] + ' ' + mp.toFixed(1) + ' м.п.', bt]);
        if (A.type !== 'sill' && P.sink[A.sink]) { t += P.sink[A.sink]; bd.push(['Мойка', P.sink[A.sink]]); }
        if (A.type !== 'sill' && P.apron[A.apron]) { var a = P.apron[A.apron] * mp; t += a; bd.push(['Фартук', a]); }
        var inst = 0;
        if (A.type === 'counter' || A.type === 'island') inst += P.install.counter * mp;
        if (A.type === 'sill') inst += P.install.sill;
        if (A.type !== 'sill' && A.apron !== 'none') inst += P.install.apron * mp;
        if (A.extras.indexOf('plinth') > -1) inst += P.install.plinth * A.len;
        if (inst) { t += inst; bd.push(['Монтаж', inst]); }
      }
      A.extras.forEach(function (e) {
        var v = P.extras[e]; if (e === 'plinth') v = v * A.len;
        if (v) { t += v; bd.push([LBL.extras[e], v]); }
      });
      var k = parseFloat(A.coll);
      if (k > 1) { var add = t * (k - 1); t += add; bd.push(['Коллекция +' + Math.round((k - 1) * 100) + '%', add]); }
      var svc = P.extras.measure + P.extras.delivery; t += svc; bd.push(['Замер и доставка', svc]);
      return { total: t, bd: bd };
    }

    var $ = function (s) { return qm.querySelector(s); };
    var nextBtn = $('[data-next]'), backBtn = $('[data-back]'), estWrap = $('.quiz__est');

    function stepFilled (real) {
      if (real === 0) return !!A.type;
      return true;
    }
    function render () {
      var seq = activeSteps(), real = seq[step];
      qm.querySelectorAll('.quiz__step').forEach(function (s) { s.classList.toggle('on', +s.dataset.step === real); });
      $('.quiz__bar > i').style.width = (step / (seq.length - 1) * 100) + '%';
      backBtn.style.display = step > 0 ? '' : 'none';
      var last = real === 7;
      nextBtn.style.display = last ? 'none' : '';
      estWrap.style.display = last ? 'none' : 'flex';
      nextBtn.disabled = !stepFilled(real);
      if (last) renderResult();
      $('[data-est]').textContent = A.type ? 'от ' + money(calc().total) + ' ₽' : 'от — ₽';
    }
    function renderResult () {
      var r = calc();
      $('[data-price]').textContent = 'от ' + money(r.total) + ' ₽';
      $('[data-bd]').innerHTML = r.bd.map(function (x) { return '<div><span>' + x[0] + '</span><span>' + money(x[1]) + ' ₽</span></div>'; }).join('');
    }
    function summary () {
      var r = calc(), parts = ['Тип: ' + (LBL.type[A.type] || '—')];
      if (A.type !== 'basin') parts.push('Длина: ' + A.len.toFixed(1) + ' м.п.');
      if (A.type === 'counter' || A.type === 'island') parts.push('Толщина: ' + LBL.thick[A.thick]);
      if (A.type !== 'sill' && A.type !== 'basin') { parts.push('Мойка: ' + LBL.sink[A.sink]); parts.push('Фартук: ' + LBL.apron[A.apron]); }
      if (A.extras.length) parts.push('Доп: ' + A.extras.map(function (e) { return LBL.extras[e]; }).join(', '));
      parts.push('Коллекция: ' + LBL.coll[A.coll]);
      parts.push('Ориентировочно: от ' + money(r.total) + ' ₽');
      return parts.join('; ');
    }

    // ---- Обработчики выбора ----
    qm.querySelectorAll('[data-single]').forEach(function (g) {
      var key = g.dataset.single;
      g.querySelectorAll('.quiz__opt').forEach(function (o) {
        o.addEventListener('click', function () {
          g.querySelectorAll('.quiz__opt').forEach(function (x) { x.classList.remove('sel'); });
          o.classList.add('sel'); A[key] = o.dataset.val;
          if (key === 'type') { var tt = $('[data-len-title]'); if (tt) tt.textContent = o.dataset.val === 'island' ? 'Длина острова' : o.dataset.val === 'sill' ? 'Длина подоконника' : 'Длина столешницы'; }
          render();
        });
      });
    });
    qm.querySelectorAll('[data-multi]').forEach(function (g) {
      var key = g.dataset.multi;
      g.querySelectorAll('.quiz__opt').forEach(function (o) {
        o.addEventListener('click', function () {
          o.classList.toggle('sel');
          var v = o.dataset.val, i = A[key].indexOf(v);
          if (o.classList.contains('sel')) { if (i < 0) A[key].push(v); } else if (i > -1) A[key].splice(i, 1);
          render();
        });
      });
    });
    var lenEl = $('[data-len]');
    lenEl.addEventListener('input', function () { A.len = parseFloat(lenEl.value); $('[data-len-num]').textContent = A.len.toFixed(1); render(); });

    nextBtn.addEventListener('click', function () { var seq = activeSteps(); if (step < seq.length - 1) { step++; render(); } });
    backBtn.addEventListener('click', function () { if (step > 0) { step--; render(); } });
    // Перед отправкой: сводка в comment (уйдёт с заявкой) + печать расчёта в PDF
    $('#quiz-form').addEventListener('submit', function () {
      $('#quiz-form [name="comment"]').value = summary();
      printEstimate();
    });

    // Формирует «Предварительный расчёт» и открывает диалог печати (Сохранить в PDF).
    // Печатаем из скрытого iframe — не уводим со страницы и не блокируем отправку заявки.
    function printEstimate () {
      var r = calc();
      var nameEl = $('#quiz-form [name="name"]');
      var nm = nameEl ? nameEl.value : '';
      var esc = function (s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); };
      var rows = [['Изделие', LBL.type[A.type] || '—']];
      if (A.type !== 'basin') rows.push(['Длина', A.len.toFixed(1) + ' м.п.']);
      if (A.type === 'counter' || A.type === 'island') rows.push(['Толщина', LBL.thick[A.thick]]);
      if (A.type !== 'sill' && A.type !== 'basin') { rows.push(['Мойка', LBL.sink[A.sink]]); rows.push(['Фартук', LBL.apron[A.apron]]); }
      if (A.extras.length) rows.push(['Доп. опции', A.extras.map(function (e) { return LBL.extras[e]; }).join(', ')]);
      rows.push(['Коллекция камня', LBL.coll[A.coll]]);
      var conf = rows.map(function (x) { return '<tr><td class="k">' + esc(x[0]) + '</td><td>' + esc(x[1]) + '</td></tr>'; }).join('');
      var bd = r.bd.map(function (x) { return '<tr><td>' + esc(x[0]) + '</td><td class="num">' + money(x[1]) + ' ₽</td></tr>'; }).join('');
      var doc = '<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>Расчёт столешницы — КАМЕНЪ</title><style>'
        + '*{box-sizing:border-box}body{font-family:Georgia,"Times New Roman",serif;color:#1a1a1a;margin:0;padding:40px;max-width:720px}'
        + 'h1{font-size:24px;margin:0 0 2px}.muted{color:#777;font-size:13px}'
        + '.brand{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #1a1a1a;padding-bottom:12px;margin-bottom:22px}'
        + '.brand .logo{font-size:22px;font-weight:bold;letter-spacing:.08em}'
        + 'table{width:100%;border-collapse:collapse;margin:10px 0}'
        + 'td{padding:8px 4px;border-bottom:1px solid #e2e2e2;font-size:14px;vertical-align:top}'
        + 'td.k{color:#777;width:42%}td.num{text-align:right;white-space:nowrap}'
        + 'h2{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#555;margin:24px 0 2px}'
        + '.total{margin:22px 0;padding:16px 22px;background:#f4f1ea;border-radius:8px;display:flex;justify-content:space-between;align-items:center}'
        + '.total .big{font-size:28px;font-weight:bold;white-space:nowrap}'
        + '.disc{font-size:12px;color:#777;line-height:1.5}'
        + '.foot{margin-top:28px;border-top:1px solid #e2e2e2;padding-top:14px;font-size:13px;color:#555;line-height:1.6}'
        + '@page{margin:16mm}'
        + '</style></head><body>'
        + '<div class="brand"><div><div class="logo">КАМЕНЪ</div><div class="muted">Столешницы и изделия из искусственного камня · Иркутск</div></div>'
        + '<div class="muted">Расчёт от ' + new Date().toLocaleDateString('ru-RU') + '</div></div>'
        + '<h1>Предварительный расчёт</h1>'
        + (nm ? '<div class="muted">Подготовлено для: ' + esc(nm) + '</div>' : '')
        + '<h2>Конфигурация</h2><table>' + conf + '</table>'
        + '<h2>Состав расчёта</h2><table>' + bd + '</table>'
        + '<div class="total"><span>Ориентировочная стоимость</span><span class="big">от ' + money(r.total) + ' ₽</span></div>'
        + '<p class="disc">Расчёт предварительный и не является офертой. Итоговая стоимость зависит от точных размеров, конфигурации и выбранного цвета камня, определяется после бесплатного замера и фиксируется в договоре.</p>'
        + '<div class="foot"><b>КАМЕНЪ</b> · Иркутск и область · lithos-irk.ru<br>Мы свяжемся с вами в течение 15 минут после заявки.</div>'
        + '</body></html>';
      var url = URL.createObjectURL(new Blob([doc], { type: 'text/html' }));
      var ifr = document.createElement('iframe');
      ifr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
      ifr.onload = function () {
        try { ifr.contentWindow.focus(); ifr.contentWindow.print(); } catch (e) {}
        setTimeout(function () { if (ifr.parentNode) ifr.parentNode.removeChild(ifr); URL.revokeObjectURL(url); }, 60000);
      };
      ifr.src = url;
      document.body.appendChild(ifr);
    }

    // ---- Открытие/закрытие ----
    function openQuiz () { qm.classList.add('open'); document.body.style.overflow = 'hidden'; step = 0; render(); }
    function closeQuiz () { qm.classList.remove('open'); document.body.style.overflow = ''; }
    qm.querySelector('.modal__overlay').addEventListener('click', closeQuiz);
    qm.querySelector('.modal__close').addEventListener('click', closeQuiz);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && qm.classList.contains('open')) closeQuiz(); });

    // ---- Кнопки-триггеры: шапка (десктоп) + бургер-меню (мобайл) ----
    var cta = document.querySelector('.header__cta');
    if (cta) {
      var existing = cta.querySelector('button[data-modal]');
      if (existing) { existing.classList.remove('btn--gold'); existing.classList.add('btn--outline'); }
      var hb = document.createElement('button');
      hb.type = 'button'; hb.className = 'btn btn--gold quiz-open'; hb.innerHTML = '<span>Рассчитать</span>';
      cta.insertBefore(hb, cta.firstChild);
    }
    var navEl = document.querySelector('.nav');
    if (navEl) {
      var na = document.createElement('a');
      na.href = '#'; na.className = 'quiz-open'; na.textContent = 'Рассчитать стоимость';
      navEl.appendChild(na);
    }
    document.querySelectorAll('.quiz-open').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); openQuiz(); });
    });

    render();
  })();

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var hasGSAP = window.gsap && window.ScrollTrigger;
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Скролл: нативный (без перехвата колеса) ---------- */
  // Lenis намеренно отключён — пользователь предпочитает обычный скролл браузера.
  var lenis = null;

  /* ---------- GSAP-анимации ---------- */
  if (hasGSAP) {
    if (!reduce) {
      // Появление блоков
      gsap.utils.toArray('[data-reveal]').forEach(function (el) {
        var d = (parseFloat(el.getAttribute('data-reveal-delay')) || 0) * 0.08;
        gsap.from(el, {
          y: 48, opacity: 0, duration: 1, delay: d, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' }
        });
      });

      // Мелкие элементы hero
      gsap.from('[data-rise]', { y: 30, opacity: 0, duration: 1, stagger: 0.12, delay: 0.5, ease: 'power3.out' });

      // Заголовок hero — построчное проявление
      gsap.from('[data-hero] .ln > span', {
        yPercent: 110, duration: 1.2, stagger: 0.12, delay: 0.2, ease: 'power4.out'
      });

      // Параллакс фона hero (мягкий scrub с инерцией)
      gsap.to('#heroImg', {
        yPercent: 14, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
      });

      // Параллакс изображений в split-блоках
      gsap.utils.toArray('.split__media img, .cta__bg img').forEach(function (img) {
        gsap.fromTo(img, { yPercent: -6 }, {
          yPercent: 6, ease: 'none',
          scrollTrigger: { trigger: img.closest('section'), start: 'top bottom', end: 'bottom top', scrub: 1 }
        });
      });

      // Счётчики
      gsap.utils.toArray('[data-count]').forEach(function (el) {
        var end = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var obj = { v: 0 };
        ScrollTrigger.create({
          trigger: el, start: 'top 88%', once: true,
          onEnter: function () {
            gsap.to(obj, {
              v: end, duration: 1.6, ease: 'power2.out',
              onUpdate: function () { el.textContent = Math.round(obj.v).toLocaleString('ru-RU') + suffix; }
            });
          }
        });
      });
    }
    // Пересчёт позиций после полной загрузки картинок — блоки не «прыгают»
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* ---------- Хедер: фон при скролле ---------- */
  var header = document.querySelector('.header');
  var setHdr = function () { header.classList.toggle('scrolled', window.scrollY > 30); };
  setHdr(); window.addEventListener('scroll', setHdr, { passive: true });

  /* ---------- Бургер ---------- */
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  if (burger) {
    burger.addEventListener('click', function () { nav.classList.toggle('open'); });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); }); });
  }

  /* ---------- Якорные ссылки через Lenis ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -80 }); else t.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- FAQ ---------- */
  document.querySelectorAll('.faq__q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.faq__item');
      var a = item.querySelector('.faq__a');
      var open = item.classList.toggle('open');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : 0;
    });
  });

  /* ---------- Модалка ---------- */
  var modal = document.querySelector('#modal');
  var openModal = function () { modal.classList.add('open'); document.body.style.overflow = 'hidden'; if (lenis) lenis.stop(); };
  var closeModal = function () { modal.classList.remove('open'); document.body.style.overflow = ''; if (lenis) lenis.start(); };
  document.querySelectorAll('[data-modal]').forEach(function (b) { b.addEventListener('click', openModal); });
  if (modal) {
    modal.querySelector('.modal__overlay').addEventListener('click', closeModal);
    modal.querySelector('.modal__close').addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  }

  /* ---------- Калькулятор ---------- */
  var calc = document.querySelector('#calc-form');
  if (calc) {
    var out = calc.querySelector('.price-out');
    var PRICE = { acryl: 16000, quartz: 24000, marble: 14000 }; // ₽ за пог. метр
    var recalc = function () {
      var mat = calc.querySelector('[name="material"]').value;
      var len = parseFloat(calc.querySelector('[name="length"]').value) || 0;
      var total = Math.round((PRICE[mat] || 0) * len);
      out.textContent = total ? 'от ' + total.toLocaleString('ru-RU') + ' ₽' : 'от — ₽';
    };
    calc.querySelectorAll('select, input[name="length"]').forEach(function (el) {
      el.addEventListener('input', recalc); el.addEventListener('change', recalc);
    });
    recalc();
  }

  /* ---------- Отправка форм (Web3Forms) ---------- */
  var WEB3FORMS_KEY = '29946204-51c2-465b-acde-07738ed68806'; // Web3Forms access key — доставка заявок на почту владельца
  document.querySelectorAll('form[data-lead]').forEach(function (form) {
    // Согласие на обработку персональных данных (152-ФЗ) — добавляем во все формы
    if (!form.querySelector('input[name="consent"]')) {
      var subBtn = form.querySelector('button[type="submit"]');
      if (subBtn) {
        var lab = document.createElement('label');
        lab.className = 'consent';
        lab.innerHTML = '<input type="checkbox" name="consent" value="yes" required>' +
          '<span>Я&nbsp;согласен на&nbsp;обработку персональных данных и&nbsp;принимаю ' +
          '<a href="/politika-konfidencialnosti.html" target="_blank" rel="noopener">политику конфиденциальности</a></span>';
        subBtn.parentNode.insertBefore(lab, subBtn);
      }
    }
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var msg = form.querySelector('.form-msg');
      var btn = form.querySelector('button[type="submit"]');
      var data = new FormData(form);
      if (!data.get('access_key')) data.set('access_key', WEB3FORMS_KEY);
      data.set('subject', 'Новая заявка с сайта столешниц (Иркутск)');
      data.set('from_name', 'Сайт столешниц — Иркутск');
      data.set('Страница', location.href); // с какой страницы отправлена заявка — попадёт и в письмо
      if (data.get('botcheck')) return;
      // Дублируем заявку в Telegram через вебхук Make (фоново, не мешает основной отправке)
      try {
        fetch('https://hook.eu1.make.com/flysic3p78p5nh2f1pwr334s9fgqvjcd', {
          method: 'POST',
          body: new URLSearchParams({
            name: data.get('name') || '',
            phone: data.get('phone') || '',
            product: data.get('product') || '',
            comment: data.get('comment') || '',
            page: location.href
          })
        });
      } catch (e) {}
      if (btn) { btn.disabled = true; btn.dataset.txt = btn.innerHTML; btn.innerHTML = '<span>Отправляем…</span>'; }
      try {
        var res = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: data });
        var json = await res.json();
        if (json.success) {
          if (msg) { msg.className = 'form-msg ok'; msg.textContent = 'Спасибо! Заявка отправлена — перезвоним в течение 15 минут.'; }
          form.reset();
          if (calc && form === calc) calc.querySelector('.price-out').textContent = 'от — ₽';
          if (form.closest('.modal')) setTimeout(closeModal, 2500);
          if (window.ym && window.YM_ID) {
            // отдельная цель по типу формы — видно, откуда пришла заявка
            var goal = (form.id === 'calc-form' || form.id === 'quiz-form') ? 'lead_calc' // калькулятор / квиз
                     : form.closest('.modal')          ? 'lead_modal'     // всплывающая форма
                     : form.closest('.aside-cta')       ? 'lead_product'   // форма на странице изделия
                     :                                    'lead_form';     // прочие формы
            window.ym(window.YM_ID, 'reachGoal', 'lead'); // общая цель — все заявки вместе
            window.ym(window.YM_ID, 'reachGoal', goal);
          }
          if (window.gtag) window.gtag('event', 'generate_lead');
        } else { throw new Error(json.message || 'error'); }
      } catch (err) {
        if (msg) { msg.className = 'form-msg err'; msg.textContent = 'Не удалось отправить. Позвоните нам напрямую или попробуйте ещё раз.'; }
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = btn.dataset.txt; }
      }
    });
  });

  /* ---------- Swiper галерея ---------- */
  if (window.Swiper && document.querySelector('.gallery .swiper')) {
    new Swiper('.gallery .swiper', {
      slidesPerView: 1.15, spaceBetween: 20, grabCursor: true,
      navigation: { nextEl: '.g-next', prevEl: '.g-prev' },
      pagination: { el: '.gallery .swiper-pagination', clickable: true },
      breakpoints: { 640: { slidesPerView: 2 }, 980: { slidesPerView: 3 } }
    });
  }

  /* ---------- GLightbox: листание ←/→, без прокрутки фона ---------- */
  if (window.GLightbox) {
    var lb = GLightbox({ selector: '.glightbox', loop: true, zoomable: false, touchNavigation: true, openEffect: 'fade', closeEffect: 'fade' });
    lb.on('open', function () { if (lenis) lenis.stop(); });
    lb.on('close', function () { if (lenis) lenis.start(); });
  }

  /* ---------- Переключатель темы (тёмная / светлая) ---------- */
  var toggles = document.querySelectorAll('.theme-toggle');
  toggles.forEach(function (b) {
    if (!b.querySelector('.ts-knob')) {
      b.innerHTML = '<span class="ts-ico ts-moon">☾</span><span class="ts-ico ts-sun">☀</span><span class="ts-knob"></span>';
    }
    b.setAttribute('role', 'switch');
    b.setAttribute('aria-label', 'Сменить тему');
  });
  function applyTheme(t) {
    var light = (t === 'light');
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('theme', t); } catch (e) {}
    toggles.forEach(function (b) {
      b.classList.toggle('is-light', light);
      b.setAttribute('aria-checked', light ? 'true' : 'false');
      var k = b.querySelector('.ts-knob');
      if (k) k.textContent = light ? '☀' : '☾';
    });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  toggles.forEach(function (b) {
    b.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(cur);
    });
  });
  applyTheme(document.documentElement.getAttribute('data-theme') || 'light');

  /* ---------- Год ---------- */
  var y = document.querySelector('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
