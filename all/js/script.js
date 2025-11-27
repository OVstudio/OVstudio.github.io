'use strict';

const SCROLL_THRESHOLD   = window.innerHeight * 0.10;
const SCROLL_THRESHOLD_2 = window.innerHeight * 0.45;
const SCROLL_THRESHOLD_3 = window.innerHeight * 0.75;
const SCROLL_THRESHOLD_4 = window.innerHeight * 1.00;


/* затемнення (можуть дорівнювати порогам вище) */
const DARKEN_THRESHOLD   = window.innerHeight * 0.10;
const DARKEN_THRESHOLD_2 = window.innerHeight * 0.45;
const DARKEN_THRESHOLD_3 = window.innerHeight * 0.75;
const DARKEN_THRESHOLD_4 = window.innerHeight * 1.00;

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





// circle-overlays-fixed.js — intro + end-half-circle (виправлений повний файл)
(function () {
  'use strict';


  const CONFIG = {
    intro: {
      baseRadiusUnits: 12,
      initialDelay: 0,
      fadeOutDelay: 120,
      removeAfterFade: true
    },

    // === ВАЖЛИВО: конфіг для end-півкулі (додаємо його, раніше його не було) ===
    end: {
      viewBoxWidth: 100,
      viewBoxHeight: 140,
      circleCx: 50,
      circleCy: 120,
      circleR: 60,
      bottomOffsetPx: 0,
      growThresholdPxFromBottom: 120,
      hysteresis: 60,
      minToggleInterval: 120,
      overshootFactor: 1.03
    },

    debug: false
  };

  // ---------- HELPERS ----------
  function now() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function parseCSSDurationToMs(str, fallback = 900) {
    if (!str) return fallback;
    str = String(str).trim();
    if (str.endsWith('ms')) return parseFloat(str);
    if (str.endsWith('s')) return parseFloat(str) * 1000;
    const n = parseFloat(str);
    return isFinite(n) ? n : fallback;
  }
  function getCSSVar(name, fallback = '') {
    return getComputedStyle(document.documentElement).getPropertyValue(name) || fallback;
  }

  // ---------- INTRO HOLE ----------
  function createIntroOverlayIfNeeded() {
    if (document.getElementById('intro-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'intro-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.pointerEvents = 'none';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '2147483648';
    overlay.innerHTML = `
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
           xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" style="width:100%;height:100%;display:block;">
        <defs>
          <mask id="intro-holeMask" maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width="100%" height="100%" fill="white"/>
            <circle id="intro-hole-circle" cx="50" cy="50" r="${CONFIG.intro.baseRadiusUnits}" fill="black" />
          </mask>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="#000" mask="url(#intro-holeMask)"></rect>
      </svg>
    `;
    document.body.appendChild(overlay);

    const hole = overlay.querySelector('#intro-hole-circle');

    function computeIntroScale() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const neededPx = Math.hypot(w/2, h/2) * 1.08;
      const pxPerUnit = Math.max(w / 100, h / 100);
      const neededUnits = neededPx / pxPerUnit;
      return Math.max(neededUnits / CONFIG.intro.baseRadiusUnits, 1);
    }

    const cssDur = getCSSVar('--circle-speed', '') || getCSSVar('--intro-circle-speed', '');
    const cssEase = getCSSVar('--circle-easing', '') || getCSSVar('--intro-circle-easing', 'cubic-bezier(.25,.9,.2,1)');
    const durationMs = parseCSSDurationToMs(cssDur || '1800ms', 1800);

    hole.style.transformOrigin = '50% 50%';
    hole.style.transformBox = 'fill-box';
    hole.style.willChange = 'transform';
    hole.style.transition = 'none';
    hole.style.transform = 'scale(0)';

    const startGrow = () => {
      const fullScale = computeIntroScale();
      void hole.offsetWidth;
      hole.style.transition = `transform ${durationMs}ms ${cssEase}`;
      hole.style.transform = `scale(${fullScale})`;
    };

    if (CONFIG.intro.initialDelay && CONFIG.intro.initialDelay > 0) {
      setTimeout(startGrow, CONFIG.intro.initialDelay);
    } else {
      requestAnimationFrame(() => requestAnimationFrame(startGrow));
    }

    function onHoleTransitionEnd(e) {
      if (e.propertyName !== 'transform') return;
      hole.removeEventListener('transitionend', onHoleTransitionEnd);
      setTimeout(() => {
        overlay.style.transition = 'opacity 420ms ease-out';
        overlay.style.opacity = '0';
        overlay.addEventListener('transitionend', function onFade(ev) {
          if (ev.propertyName !== 'opacity') return;
          overlay.removeEventListener('transitionend', onFade);
          if (CONFIG.intro.removeAfterFade && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        });
      }, CONFIG.intro.fadeOutDelay);
    }
    hole.addEventListener('transitionend', onHoleTransitionEnd);

    let resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      const fullScale = computeIntroScale();
      hole.style.transition = 'none';
      hole.style.transform = `scale(${fullScale})`;
      void hole.offsetWidth;
      resizeTimer = setTimeout(() => {
        hole.style.transition = `transform ${durationMs}ms ${cssEase}`;
      }, 120);
    }
    window.addEventListener('resize', onResize, { passive: true });
  }//









  

  // ---------- END HALF-CIRCLE (bottom) ----------
  function createEndOverlayIfNeeded() {
    if (document.getElementById('end-overlay')) return null;
    const overlay = document.createElement('div');
    overlay.id = 'end-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '2147483647';
    overlay.style.background = 'transparent';
    overlay.style.display = 'block';

    overlay.innerHTML = `
      <svg viewBox="0 0 ${CONFIG.end.viewBoxWidth} ${CONFIG.end.viewBoxHeight}" preserveAspectRatio="xMidYMid slice"
           xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"
           style="width:100%;height:100%;display:block;">
        <circle id="end-circle" cx="${CONFIG.end.circleCx}" cy="${CONFIG.end.circleCy}" r="${CONFIG.end.circleR}" fill="var(--end-circle-color, #000)"/>
      </svg>
    `;
    document.body.appendChild(overlay);

    const svg = overlay.querySelector('svg');
    const endCircle = overlay.querySelector('#end-circle');

    endCircle.style.transformOrigin = '50% 50%';
    endCircle.style.transformBox = 'fill-box';
    const initialDur = parseCSSDurationToMs(getCSSVar('--end-circle-duration','900ms'));
    const initialEase = getCSSVar('--end-circle-easing','cubic-bezier(.19,1,.22,1)');
    endCircle.style.transition = `transform ${initialDur}ms ${initialEase}`;
    endCircle.style.willChange = 'transform';
    endCircle.style.transform = 'scale(0)';

    function computeEndScale() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const vw = CONFIG.end.viewBoxWidth;
      const vh = CONFIG.end.viewBoxHeight;
      const scale = Math.max(w / vw, h / vh);
      const renderedWidth = vw * scale;
      const renderedHeight = vh * scale;
      const offsetX = (w - renderedWidth) / 2;
      const offsetY = (h - renderedHeight) / 2;
      const cx_px = offsetX + (CONFIG.end.circleCx * scale);
      const cy_px = offsetY + (CONFIG.end.circleCy * scale);
      const dists = [
        Math.hypot(cx_px - 0, cy_px - 0),
        Math.hypot(cx_px - w, cy_px - 0),
        Math.hypot(cx_px - 0, cy_px - h),
        Math.hypot(cx_px - w, cy_px - h)
      ];
      const neededPx = Math.max(...dists) * CONFIG.end.overshootFactor;
      const pxPerUnit = scale;
      const neededUnits = neededPx / pxPerUnit;
      const baseR = CONFIG.end.circleR;
      const scaleFactor = Math.max(neededUnits / baseR, 0.001);
      if (CONFIG.debug) console.log('computeEndScale:', { w,h,vw,vh,scale,offsetX,offsetY,cx_px,cy_px,neededPx,neededUnits,scaleFactor });
      return scaleFactor;
    }

    let active = false;
    let lastToggleAt = 0;

    function readTiming() {
      const dur = getCSSVar('--end-circle-duration','900ms');
      const ease = getCSSVar('--end-circle-easing','cubic-bezier(.19,1,.22,1)');
      return { durationMs: parseCSSDurationToMs(dur,900), ease };
    }

    function applyTransition(durationMs, easing) {
      endCircle.style.transition = `transform ${durationMs}ms ${easing}`;
    }

    function growEnd() {
      if (active) return;
      active = true;
      lastToggleAt = now();
      const { durationMs, ease } = readTiming();
      applyTransition(durationMs, ease);
      const fullScale = computeEndScale();
      requestAnimationFrame(() => { endCircle.style.transform = `scale(${fullScale})`; });
    }

    function shrinkEnd() {
      if (!active) return;
      active = false;
      lastToggleAt = now();
      const { durationMs, ease } = readTiming();
      applyTransition(Math.max(120, durationMs * 0.75), ease);
      requestAnimationFrame(() => { endCircle.style.transform = 'scale(0)'; });
    }

    return {
      element: overlay,
      circleEl: endCircle,
      computeScale: computeEndScale,
      grow: growEnd,
      shrink: shrinkEnd,
      isActive: () => active,
      lastToggleAt: () => lastToggleAt
    };
  }

  // ---------- SCROLL WATCHER ----------
  function initEndScrollWatcher() {
    const end = createEndOverlayIfNeeded();
    if (!end) return;

    let ticking = false;
    let lastY = window.scrollY || window.pageYOffset || 0;

    function onScrollTick() {
      ticking = false;
      const y = window.scrollY || window.pageYOffset || 0;
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      const nearBottom = (winH + y) >= (docH - CONFIG.end.growThresholdPxFromBottom);
      const directionDown = (y > lastY);
      lastY = y;

      const nowTs = now();
      const lastToggle = end.lastToggleAt();
      if (nowTs - lastToggle < CONFIG.end.minToggleInterval) return;

      if (nearBottom && directionDown && !end.isActive()) {
        if (CONFIG.debug) console.log('END: grow (near bottom & down)');
        end.grow();
        return;
      }

      const aboveThreshold = (winH + y) < (docH - (CONFIG.end.growThresholdPxFromBottom + CONFIG.end.hysteresis));
      if (aboveThreshold && !directionDown && end.isActive()) {
        if (CONFIG.debug) console.log('END: shrink (scrolled up above threshold)');
        end.shrink();
        return;
      }
    }

    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(onScrollTick); }
    }

    function readTimingFallback() {
      const dur = getCSSVar('--end-circle-duration','900ms');
      const ease = getCSSVar('--end-circle-easing','cubic-bezier(.19,1,.22,1)');
      return { durationMs: parseCSSDurationToMs(dur,900), ease };
    }

    let resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      const fullScale = end.computeScale();
      const circle = end.circleEl;
      circle.style.transition = 'none';
      if (end.isActive()) circle.style.transform = `scale(${fullScale})`;
      void circle.offsetWidth;
      resizeTimer = setTimeout(() => {
        const { durationMs, ease } = readTimingFallback();
        circle.style.transition = `transform ${durationMs}ms ${ease}`;
      }, 120);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onScroll, { passive: true });
    window.addEventListener('touchmove', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    requestAnimationFrame(onScrollTick);
  }

  // ---------- INIT ----------
  document.addEventListener('DOMContentLoaded', () => {
    try {
      createIntroOverlayIfNeeded();
      initEndScrollWatcher();
      if (CONFIG.debug) console.log('[circle-overlays-fixed] initialised');
    } catch (err) {
      console.error('circle-overlays-fixed error:', err);
    }
  });

})();
