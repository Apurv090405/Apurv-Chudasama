/*
 * Motion layer
 * ------------
 * Scroll reveals, hero line-masking, counting metrics, a pointer glow, and
 * wiring for the section-preview cards and footer links.
 *
 * Principles: nothing here is required for the page to work. The .js-anim
 * class is what activates the hidden-then-revealed states in anim.css, and it
 * is only added when this script runs AND the visitor has not asked for
 * reduced motion — so a failed script or a motion-sensitive visitor gets a
 * fully visible, fully usable page.
 */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------------------------------------------------- navigation wiring */
  // Preview cards and footer links open the matching window by delegating to
  // the sidebar link, which already owns section switching.
  function openSection(section) {
    const link = document.querySelector(
      `.sidebar-link[data-section="${section}"]`
    );
    if (link) {
      link.click();
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    }
  }

  document.addEventListener("click", function (event) {
    const trigger = event.target.closest(
      ".preview-card[data-section], .soul-footer-link[data-section], .soul-btn[data-section]"
    );
    if (!trigger) return;
    event.preventDefault();
    openSection(trigger.getAttribute("data-section"));
  });

  // Footer year, so it never goes stale.
  const year = document.getElementById("footer-year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------------- menu clock */
  // The menu bar is missing the one thing every Mac menu bar has.
  const menuBar = document.querySelector(".mac-menu-bar");
  if (menuBar && !menuBar.querySelector(".menu-clock")) {
    const clock = document.createElement("span");
    clock.className = "menu-clock";
    menuBar.appendChild(clock);

    function tick() {
      clock.textContent = new Date().toLocaleTimeString([], {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      });
    }

    tick();
    setInterval(tick, 30000);
  }
  if (reduceMotion) return;
  document.documentElement.classList.add("js-anim");

  /* --------------------------------------------------------- hero headline */
  // Wrap each line of the hero title so it can rise from behind a mask.
  // Done in JS to keep the markup readable and the copy editable in one place.
  const heroTitle = document.querySelector(".soul-hero-title");
  if (heroTitle) {
    heroTitle.classList.add("reveal-line");
    heroTitle.innerHTML = `<span>${heroTitle.innerHTML}</span>`;
    requestAnimationFrame(() => heroTitle.classList.add("is-in"));
  }

  /* ------------------------------------------------------- scroll reveals */
  const revealTargets = document.querySelectorAll(".reveal, .soul-card, .soul-post, .soul-proof-item");

  if (!("IntersectionObserver" in window)) {
    revealTargets.forEach((el) => el.classList.add("is-in"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target); // reveal once, never re-hide
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.1 }
    );

    revealTargets.forEach((el, index) => {
      el.classList.add("reveal");
      // Stagger within a group, but cap it so late items never feel stalled.
      el.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------ counting metrics */
  // Animates only the numeric part, so "<700ms" and "99.5%" keep their shape.
  function countUp(el) {
    const raw = el.textContent;
    const match = raw.match(/([\d.]+)/);
    if (!match) return;

    const target = parseFloat(match[1]);
    const decimals = (match[1].split(".")[1] || "").length;
    const start = performance.now();
    const duration = 1100;

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic — fast then settling, so the final value feels arrived at
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = (target * eased).toFixed(decimals);
      el.textContent = raw.replace(match[1], value);
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  const metrics = document.querySelectorAll(".soul-proof-value");
  if (metrics.length && "IntersectionObserver" in window) {
    const metricObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          countUp(entry.target);
          metricObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    metrics.forEach((el) => metricObserver.observe(el));
  }

  /* -------------------------------------------------------- pointer glow */
  // Fine pointers only. Position is written on a rAF tick rather than on every
  // mousemove, so a fast cursor cannot flood the compositor.
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const glow = document.createElement("div");
    glow.className = "soul-cursor";
    glow.setAttribute("aria-hidden", "true");
    document.body.appendChild(glow);

    let x = 0;
    let y = 0;
    let queued = false;

    window.addEventListener(
      "mousemove",
      function (event) {
        x = event.clientX;
        y = event.clientY;
        glow.classList.add("is-live");
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          queued = false;
        });
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", () =>
      glow.classList.remove("is-live")
    );
  }

  /* ------------------------------------------------------ scroll progress */
  // A hairline under the menu bar showing how far down the page you are.
  // Written on a rAF tick and only when the value actually changes.
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);

  let ticking = false;
  let lastRatio = -1;

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    if (Math.abs(ratio - lastRatio) > 0.001) {
      progress.style.setProperty("--scroll", ratio.toFixed(4));
      lastRatio = ratio;
    }
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateProgress);
    },
    { passive: true }
  );

  updateProgress();


  /* ------------------------------------------------------ footer wordmark */
  // Deliberately NOT split into per-letter spans. The gradient is painted with
  // background-clip: text, and that stops clipping to the glyphs once they sit
  // inside inline-block children — the letters render fully transparent. The
  // whole mark animates as one element instead, which keeps the gradient.
  const wordmark = document.querySelector(".footer-wordmark");

  if (wordmark && "IntersectionObserver" in window) {
    const wmObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          wmObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px 25% 0px" }
    );
    wmObserver.observe(wordmark);
  }

})();
