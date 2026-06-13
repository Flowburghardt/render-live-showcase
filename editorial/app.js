/* ===================================================================
   Stage 1 — Editorial Scroll
   Nur EIN JS-Effekt: der IntersectionObserver-Reveal. Marquee und
   Hover-Reveal sind reines CSS — JS toggelt hier ausschließlich die
   .is-in-Klasse, sobald ein [data-reveal]-Element in den Viewport tritt.

   A11y: Bei prefers-reduced-motion macht CSS die Elemente ohnehin sofort
   sichtbar — wir überspringen den Observer dann komplett.
   =================================================================== */

(function () {
  "use strict";

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const items = document.querySelectorAll("[data-reveal]");

  // Reduced-Motion oder fehlender Observer-Support → alles sichtbar lassen.
  if (prefersReduced || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target); // einmal rein = bleibt drin
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );

  items.forEach((el) => io.observe(el));
})();
