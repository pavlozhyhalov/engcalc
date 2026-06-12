'use strict';

function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -32px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

function initTouch() {
  const add = (selector) => {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('touchstart', () => el.classList.add('touch-active'), { passive: true });
      ['touchend', 'touchcancel'].forEach(ev =>
        el.addEventListener(ev, () => setTimeout(() => el.classList.remove('touch-active'), 220), { passive: true })
      );
    });
  };
  add('.tile');
  add('.cat-card');
  add('.builder-banner');
  add('.opt');
  add('.btn');
}

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initTouch();
});
