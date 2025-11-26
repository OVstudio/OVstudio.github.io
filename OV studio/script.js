'use strict';

/* Пороги */
const SCROLL_THRESHOLD = 150;      // перша маска (Фото 2)
const SCROLL_THRESHOLD_2 = 800;    // друга маска (Фото 3)
const SCROLL_THRESHOLD_3 = 1200;   // третя маска (Фото 4) — базовий поріг
const SCROLL_THRESHOLD_4 = 1500;   // "четвертий рівень" (додатковий ефект)

/* затемнення (можуть дорівнювати порогам вище) */
const DARKEN_THRESHOLD = 150;
const DARKEN_THRESHOLD_2 = 800;
const DARKEN_THRESHOLD_3 = 1200;
const DARKEN_THRESHOLD_4 = 1500;

/* ==========================
   Основна логіка керування класами за скролом/тачем/клавішами
   ========================== */
(function () {
  const body = document.body;

  // Нумерація масок у тебе така:
  // mask--one  => Фото 2
  // mask--two  => Фото 3
  // mask--three=> Фото 4
  const maskOne = document.querySelector('.mask--one') || document.querySelector('.mask');
  const maskTwo = document.querySelector('.mask--two');
  const maskThree = document.querySelector('.mask--three');

  let ticking = false;
  let startTouchY = null;

  function updateByScroll() {
    const y = window.scrollY || window.pageYOffset || 0;

    // --- Перша маска (Фото 2) ---
    if (y >= SCROLL_THRESHOLD) {
      body.classList.add('reveal-active');
    } else {
      body.classList.remove('reveal-active');
    }
    if (y >= DARKEN_THRESHOLD) {
      body.classList.add('darken-active');
    } else {
      body.classList.remove('darken-active');
    }

    // --- Друга маска (Фото 3) ---
    if (maskTwo) {
      // reveal-2-active вмикаємо тільки після першої (послідовно)
      if (y >= SCROLL_THRESHOLD_2 && body.classList.contains('reveal-active')) {
        body.classList.add('reveal-2-active');
      } else {
        body.classList.remove('reveal-2-active');
      }

      // darken-2-active теж прив'язане до reveal-2-active
      if (y >= DARKEN_THRESHOLD_2 && body.classList.contains('reveal-2-active')) {
        body.classList.add('darken-2-active');
      } else {
        body.classList.remove('darken-2-active');
      }
    }

    // --- Третя маска (Фото 4) ---
    if (maskThree) {
      // reveal-3-active вмикаємо тільки після reveal-2-active (послідовно)
      if (y >= SCROLL_THRESHOLD_3 && body.classList.contains('reveal-2-active')) {
        body.classList.add('reveal-3-active');
      } else {
        body.classList.remove('reveal-3-active');
      }

      // darken-3-active також тільки коли reveal-3-active (щоб точно знати контекст)
      if (y >= DARKEN_THRESHOLD_3 && body.classList.contains('reveal-3-active')) {
        body.classList.add('darken-3-active');
      } else {
        body.classList.remove('darken-3-active');
      }
    }

    // --- Четвертий рівень (додаткові ефекти при ще глибшому скролі) ---
    // Включається лише коли вже є reveal-3-active
    if (maskThree) {
      if (y >= SCROLL_THRESHOLD_4 && body.classList.contains('reveal-3-active')) {
        body.classList.add('reveal-4-active');
      } else {
        body.classList.remove('reveal-4-active');
      }

      if (y >= DARKEN_THRESHOLD_4 && body.classList.contains('reveal-3-active')) {
        body.classList.add('darken-4-active');
      } else {
        body.classList.remove('darken-4-active');
      }
    }

    ticking = false;
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateByScroll);
    }
  }

  // Події
  function onScroll() { requestUpdate(); }
  function onWheel() { requestUpdate(); }

  function onTouchStart(e) {
    startTouchY = (e.touches && e.touches[0]) ? e.touches[0].clientY : null;
  }

  function onTouchMove(e) {
    if (startTouchY == null) return;
    const currentY = (e.touches && e.touches[0]) ? e.touches[0].clientY : null;
    if (currentY == null) return;
    const diff = startTouchY - currentY; // позитивно коли свайп вгору

    // UX-хак: швидкі свайпи можуть активувати відразу кілька рівнів
    if (diff > SCROLL_THRESHOLD_4) {
      body.classList.add(
        'reveal-active','reveal-2-active','reveal-3-active','reveal-4-active',
        'darken-active','darken-2-active','darken-3-active','darken-4-active'
      );
    } else if (diff > SCROLL_THRESHOLD_3) {
      body.classList.add(
        'reveal-active','reveal-2-active','reveal-3-active',
        'darken-active','darken-2-active','darken-3-active'
      );
    } else if (diff > SCROLL_THRESHOLD_2) {
      body.classList.add('reveal-active','reveal-2-active','darken-active','darken-2-active');
    } else if (diff > SCROLL_THRESHOLD) {
      body.classList.add('reveal-active','darken-active');
    } else if (diff < -SCROLL_THRESHOLD_4) {
      // сильний свайп вниз — скидаємо все
      body.classList.remove(
        'reveal-active','reveal-2-active','reveal-3-active','reveal-4-active',
        'darken-active','darken-2-active','darken-3-active','darken-4-active'
      );
    } else {
      requestUpdate();
    }
  }

  function onTouchEnd() {
    startTouchY = null;
    requestUpdate();
  }

  function onKeyDown(e) {
    const key = e.key;
    const code = e.keyCode;
    if (['PageDown','ArrowDown',' ','Spacebar'].includes(key) || code === 34 || code === 40) {
      body.classList.add('reveal-active');
      setTimeout(requestUpdate, 20);
    } else if (['PageUp','ArrowUp'].includes(key) || code === 33 || code === 38) {
      body.classList.remove(
        'reveal-active','reveal-2-active','reveal-3-active','reveal-4-active',
        'darken-active','darken-2-active','darken-3-active','darken-4-active'
      );
      setTimeout(requestUpdate, 20);
    }
  }

  // Ініціалізація — застосувати стани відповідно до поточного прокручування (якщо сторінка не на початку)
  updateByScroll();

  // Реєстрація слухачів
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('wheel', onWheel, { passive: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('keydown', onKeyDown, { passive: true });

  // Reduced motion fallback
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    body.classList.add('reveal-active','darken-active');
    if (maskTwo) body.classList.add('reveal-2-active','darken-2-active');
    if (maskThree) body.classList.add('reveal-3-active','darken-3-active');
  }
})();

/* ==========================
   Кастомний курсор — LERP
   ========================== */
(function () {
  const cursor = document.querySelector('.cursor-circle');
  if (!cursor) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let x = mouseX;
  let y = mouseY;
  const LERP_FACTOR = 0.40;
  cursor.style.opacity = '0';

  window.addEventListener('mouseenter', (e) => {
    mouseX = e.clientX; mouseY = e.clientY; x = mouseX; y = mouseY;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    cursor.style.opacity = '1';
  }, { passive: true });

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY; cursor.style.opacity = '1';
  }, { passive: true });

  window.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });

  let rafId;
  function animate() {
    x += (mouseX - x) * LERP_FACTOR;
    y += (mouseY - y) * LERP_FACTOR;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    rafId = requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    mouseX = window.innerWidth / 2; mouseY = window.innerHeight / 2;
  }, { passive: true });

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    cancelAnimationFrame(rafId);
    window.addEventListener('mousemove', (e) => {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      cursor.style.opacity = '1';
    }, { passive: true });
  }
})();

/* ==========================
   Overlay text injection (як було)
   ========================== */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('blend-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'blend-overlay';

  const sourceP = document.querySelector('.text p');
  const html = (sourceP && sourceP.innerHTML && sourceP.innerHTML.trim().length)
    ? sourceP.innerHTML.trim()
    : 'Where space meets<br>your mind';

  const p = document.createElement('p');
  p.innerHTML = html;

  overlay.appendChild(p);
  document.body.appendChild(overlay);

  const orig = document.querySelector('.text');
  if (orig) orig.setAttribute('aria-hidden', 'true');

  requestAnimationFrame(() => {
    console.log('blend-overlay inserted; mixBlend=', getComputedStyle(overlay).mixBlendMode);
  });
});





