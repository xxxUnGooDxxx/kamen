/* ============================================================
   КАМЕНЪ — Dark Luxury · скрипт
   Lenis (плавный скролл) + GSAP ScrollTrigger + формы/галерея
   ============================================================ */
(function () {
  'use strict';

  // ID счётчика Яндекс.Метрики — нужен, чтобы при отправке форм засчитывались цели
  window.YM_ID = window.YM_ID || 110157989;

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
  var WEB3FORMS_KEY = '29946204-51c2-465b-acde-07738ed68806'; // Web3Forms → andreimg2@mail.ru
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
      if (data.get('botcheck')) return;
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
            var goal = form.id === 'calc-form'        ? 'lead_calc'      // калькулятор
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
