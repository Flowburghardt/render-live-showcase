/* ===================================================================
   Stage 0 — Lenis Smooth-Scroll
   Quelle: Hero-Studios/DESIGN.md (Lenis 1.1.14 via unpkg-CDN, html.lenis).

   Lehrpunkt: Lenis ist die EINZIGE externe Abhängigkeit. Der lesbare
   Header über Hell/Dunkel kommt allein aus CSS (mix-blend-mode) — kein
   Scroll-Listener, kein nav-flip-State. JS macht hier nur das Scroll-Feel.
   =================================================================== */

(function () {
  "use strict";

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // A11y-PFLICHT: Bei reduced-motion KEIN Momentum-Scroll aufzwingen.
  // Native Navigation (scroll-behavior:auto via CSS) bleibt.
  if (prefersReduced || typeof Lenis === "undefined") {
    enableAnchorScroll(false);
    return;
  }

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Anker-Links durch Lenis statt nativ scrollen (sonst springt es hart).
  enableAnchorScroll(true, lenis);

  function enableAnchorScroll(useLenis, instance) {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const id = link.getAttribute("href");
        if (id === "#" || id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (useLenis && instance) {
          instance.scrollTo(target, { offset: 0, duration: 1.2 });
        } else {
          target.scrollIntoView();
        }
      });
    });
  }
})();
