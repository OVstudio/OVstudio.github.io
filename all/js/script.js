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









  

// ---------- END HALF-CIRCLE (bottom) — FIXED ----------
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

  const endCircle = overlay.querySelector('#end-circle');

  // helpers
  function getCssVarRaw(name, fallback = '') {
    return getComputedStyle(document.documentElement).getPropertyValue(name) || fallback;
  }
  function parseCssMs(val, fallback) {
    if (!val) return fallback;
    val = String(val).trim();
    if (val.endsWith('ms')) return parseFloat(val);
    if (val.endsWith('s')) return parseFloat(val) * 1000;
    const n = parseFloat(val);
    return isFinite(n) ? n : fallback;
  }

  endCircle.style.transformOrigin = '50% 50%';
  endCircle.style.transformBox = 'fill-box';
  endCircle.style.willChange = 'transform';
  endCircle.style.transform = 'scale(0)';

  // compute how big circle must be to cover viewport
  function computeEndScale(overshootFactorOverride) {
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
    const neededPx = Math.max(...dists);
    const cssOvershoot = parseFloat(getCssVarRaw('--end-circle-overshoot', String(CONFIG.end.overshootFactor))) || CONFIG.end.overshootFactor;
    const overshoot = (typeof overshootFactorOverride === 'number') ? overshootFactorOverride : cssOvershoot;
    const neededPxWithOvershoot = neededPx * overshoot;
    const pxPerUnit = scale;
    const neededUnits = neededPxWithOvershoot / pxPerUnit;
    const baseR = CONFIG.end.circleR;
    const scaleFactor = Math.max(neededUnits / baseR, 0.001);
    return { scaleFactor, neededPx, neededPxWithOvershoot, overshoot };
  }

  // read css timing
  function readTiming() {
    const dur = getCssVarRaw('--end-circle-duration','900ms');
    const ease = getCssVarRaw('--end-circle-easing','cubic-bezier(.19,1,.22,1)');
    return { durationMs: parseCssMs(dur,900), ease };
  }

  // apply transition helpers
  function applyTransition(durationMs, easing) {
    endCircle.style.transition = `transform ${durationMs}ms ${easing}`;
  }
  function clearTransition() {
    // small timeout to ensure browser applied the final computed transform
    requestAnimationFrame(() => {
      endCircle.style.transition = 'none';
    });
  }

  let active = false;
  let lastToggleAt = 0;

  function growEnd() {
    if (active) return;
    active = true;
    lastToggleAt = now();

    const { durationMs, ease } = readTiming();
    const { scaleFactor, overshoot } = computeEndScale();

    // If overshoot factor equals 1 (or very close), we want to **stop exactly** when circle covers screen,
    // therefore we animate to that exact scale and then remove transition to prevent any overshoot/back-ease.
    if (overshoot <= 1.0001) {
      // animate normally but ensure no further "overshoot" can occur afterwards
      applyTransition(durationMs, ease);
      requestAnimationFrame(() => {
        endCircle.style.transform = `scale(${scaleFactor})`;
      });
      // when finished — lock final transform (remove transition) to prevent further visual changes
      const onEnd = (ev) => {
        if (ev.propertyName !== 'transform') return;
        endCircle.removeEventListener('transitionend', onEnd);
        clearTransition();
      };
      endCircle.addEventListener('transitionend', onEnd);
      return;
    }

    // Otherwise allow slight overshoot (original behavior)
    applyTransition(durationMs, ease);
    const fullScale = scaleFactor;
    requestAnimationFrame(() => { endCircle.style.transform = `scale(${fullScale})`; });
  }

  function shrinkEnd() {
    if (!active) return;
    active = false;
    lastToggleAt = now();
    const { durationMs, ease } = readTiming();
    // shrink back faster than grow for snappy UX
    applyTransition(Math.max(120, Math.round(durationMs * 0.6)), ease);
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
      // grow (will respect --end-circle-overshoot; set that to 1 to stop exactly at edges)
      end.grow();
      return;
    }

    const aboveThreshold = (winH + y) < (docH - (CONFIG.end.growThresholdPxFromBottom + CONFIG.end.hysteresis));
    if (aboveThreshold && !directionDown && end.isActive()) {
      end.shrink();
      return;
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(onScrollTick); }
  }

  // keep responsive to resize (recompute scale and lock transform if active)
  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    const fullScale = end.computeScale().scaleFactor;
    const circle = end.circleEl;
    circle.style.transition = 'none';
    if (end.isActive()) circle.style.transform = `scale(${fullScale})`;
    void circle.offsetWidth;
    resizeTimer = setTimeout(() => {
      const { durationMs, ease } = (function() {
        const dur = getComputedStyle(document.documentElement).getPropertyValue('--end-circle-duration') || '900ms';
        const ease = getComputedStyle(document.documentElement).getPropertyValue('--end-circle-easing') || 'cubic-bezier(.19,1,.22,1)';
        return { durationMs: (dur.endsWith('ms')? parseFloat(dur) : parseFloat(dur)*1000), ease: ease };
      })();
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









/* word-reveal-configurable.js
   Керування через CSS-перемінні + JS-API window.wordReveal
   Вставити в /all/js/script.js або перед </body>.
*/
(function () {
  'use strict';

  // --- Utility: парсинг duration/number з CSS var ---
  function parseTimeToMs(val, fallback) {
    if (!val) return fallback;
    val = String(val).trim();
    if (val.endsWith('ms')) return parseFloat(val);
    if (val.endsWith('s')) return parseFloat(val) * 1000;
    // якщо число без одиниці — припускаємо ms
    const n = parseFloat(val);
    return isFinite(n) ? n : fallback;
  }
  function readCssVar(name, fallback = '') {
    const s = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (s === null || s === undefined || s.trim() === '') ? fallback : s.trim();
  }

  // --- Стан / посилання на анімації ---
  let activeAnimations = [];
  let overlayEl = null;

  // --- Створюємо overlay з збереженням переносів рядків ---
  function buildOverlayFromSource_preserveLines() {
    // видаляємо попередній якщо був
    if (overlayEl) {
      // cancel running animations
      activeAnimations.forEach(a => { try { a.cancel(); } catch(e){} });
      activeAnimations = [];
      overlayEl.remove();
      overlayEl = null;
    }

    const sourceP = document.querySelector('.text p');
    let text = sourceP ? sourceP.innerText.trim() : '';
    if (!text) text = 'Where Space Meets\nYour Mind';

    const lines = text.split(/\r?\n/);

    const overlay = document.createElement('div');
    overlay.id = 'blend-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    const p = document.createElement('p');

    let idx = 0;
    lines.forEach((line, lineIndex) => {
      const words = line.split(/\s+/).filter(Boolean);
      words.forEach(word => {
        const spanWord = document.createElement('span');
        spanWord.className = 'word';
        spanWord.style.setProperty('--i', String(idx));

        const inner = document.createElement('span');
        inner.className = 'word-inner';
        inner.textContent = word;

        // встановлюємо початкові inline-стилі, щоб уникнути миготіння
        inner.style.transform = `translateY(${readCssVar('--word-translate','140%')})`;
        inner.style.opacity = '0';
        inner.style.willChange = 'transform, opacity';

        spanWord.appendChild(inner);
        p.appendChild(spanWord);
        idx++;
      });

      if (lineIndex < lines.length - 1) p.appendChild(document.createElement('br'));
    });

    overlay.appendChild(p);
    document.body.appendChild(overlay);

    // сховаємо оригінал в DOM (для доступності)
    if (sourceP && sourceP.parentNode) sourceP.parentNode.setAttribute('aria-hidden', 'true');

    overlayEl = overlay;
    return overlay;
  }

  // --- Запускаємо анімації згідно з CSS-перемінними ---
  function runAnimationsOnOverlay() {
    if (!overlayEl) return;
    // очистимо попередні анімації
    activeAnimations.forEach(a => { try { a.cancel(); } catch(e){} });
    activeAnimations = [];

    const inners = Array.from(overlayEl.querySelectorAll('.word-inner'));
    if (!inners.length) return;

    // Читаємо змінні
    const prefersReduced = (readCssVar('--reduced-motion','0') === '1') ||
                           (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    if (prefersReduced) {
      inners.forEach(inner => {
        inner.style.transition = 'none';
        inner.style.transform = 'translateY(0%)';
        inner.style.opacity = '1';
      });
      return;
    }

    const delayMs = parseTimeToMs(readCssVar('--word-delay','110ms'), 110);
    const durMs   = parseTimeToMs(readCssVar('--word-duration','900ms'), 900);
    const easing  = readCssVar('--word-easing','cubic-bezier(.19,1,.22,1)');

    inners.forEach((inner, i) => {
      const startDelay = i * delayMs;
      const keyframes = [
        { transform: `translateY(${readCssVar('--word-translate','140%')})`, opacity: 0 },
        { transform: 'translateY(0%)', opacity: 1 }
      ];
      const timing = {
        duration: durMs,
        delay: startDelay,
        easing: easing,
        fill: 'forwards'
      };

      if (inner.animate) {
        try {
          const anim = inner.animate(keyframes, timing);
          activeAnimations.push(anim);
        } catch (e) {
          // fall back to CSS transition if animate fails
          inner.style.transition = `transform ${durMs}ms ${easing} ${startDelay}ms, opacity ${Math.min(600,durMs)}ms ${easing} ${startDelay}ms`;
          void inner.offsetWidth;
          inner.style.transform = 'translateY(0%)';
          inner.style.opacity = '1';
        }
      } else {
        inner.style.transition = `transform ${durMs}ms ${easing} ${startDelay}ms, opacity ${Math.min(600,durMs)}ms ${easing} ${startDelay}ms`;
        void inner.offsetWidth;
        inner.style.transform = 'translateY(0%)';
        inner.style.opacity = '1';
      }
    });
  }

  // --- Triggers: onload | onscroll | manual ---
  function startByCssConfig() {
    const startMode = readCssVar('--start-mode','onload').toLowerCase();
    const initDelay = parseTimeToMs(readCssVar('--init-delay','250ms'), 250);

    if (startMode === 'manual') {
      // нічого не робимо — чекаємо виклику wordReveal.play()
      return;
    }

    if (startMode === 'onscroll') {
      const thresholdVh = parseFloat(readCssVar('--scroll-threshold-vh','10')) || 10;
      const thresholdPx = window.innerHeight * (thresholdVh / 100);

      function onScrollCheck() {
        const y = window.scrollY || window.pageYOffset || 0;
        if (y >= thresholdPx) {
          window.removeEventListener('scroll', onScrollCheck, { passive: true });
          setTimeout(runAnimationsOnOverlay, initDelay);
        }
      }
      window.addEventListener('scroll', onScrollCheck, { passive: true });
      // на випадок якщо сторінка вже прокручена:
      onScrollCheck();
      return;
    }

    // default: onload-ish — запускаємо після DOMContentLoaded + initDelay
    // якщо DOM вже готовий — запустимо одразу; інакше - підписка
    const startFn = () => setTimeout(runAnimationsOnOverlay, initDelay);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startFn);
    } else {
      startFn();
    }
  }

  // --- Public API для динамічних змін ---
  window.wordReveal = {
    rebuild: function () {
      buildOverlayFromSource_preserveLines();
    },
    play: function () {
      // якщо overlay ще не створений — створимо
      if (!overlayEl) buildOverlayFromSource_preserveLines();
      runAnimationsOnOverlay();
    },
    stop: function () {
      activeAnimations.forEach(a => { try { a.cancel(); } catch(e){} });
      activeAnimations = [];
    },
    updateFromCss: function () {
      // ре-будуємо і застосовуємо нові значення
      const currentScrollMode = readCssVar('--start-mode','onload').toLowerCase();
      // якщо режим manual — нічого не робимо самі, але rebuild корисний
      this.rebuild();
      if (currentScrollMode === 'onload') {
        // автоматично запустимо (коротка затримка, щоб DOM оновився)
        setTimeout(() => runAnimationsOnOverlay(), 60);
      }
    },
    setCssVar: function (name, value) {
      if (!name.startsWith('--')) name = '--' + name;
      document.documentElement.style.setProperty(name, value);
    },
    getCssVar: function (name) {
      if (!name.startsWith('--')) name = '--' + name;
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    },
    _internal: {
      // допоміжні функції (для відладки)
      getOverlayElement: function () { return overlayEl; },
      getActiveAnimations: function () { return activeAnimations.slice(); }
    }
  };

  // --- Ініціалізація: будуємо overlay і підключаємо тригер ---
  (function init() {
    buildOverlayFromSource_preserveLines();
    startByCssConfig();
  })();

})();
