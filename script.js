(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Theme switch (Vellum / Blueprint)
  var themeBtn = document.querySelector(".theme-switch");
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  function applyTheme(theme) {
    root.dataset.theme = theme;
    themeBtn.setAttribute("aria-checked", theme === "dark" ? "true" : "false");
    if (themeMeta) themeMeta.content = theme === "dark" ? "#0b1a2e" : "#f3f0e8";
  }
  applyTheme(root.dataset.theme || "light");
  themeBtn.addEventListener("click", function () {
    var next = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  // Mobile menu
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("site-nav");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  // Header state and scroll progress
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".progress");
  var scrollQueued = false;
  function onScroll() {
    scrollQueued = false;
    var y = window.scrollY;
    var max = root.scrollHeight - window.innerHeight;
    header.classList.toggle("scrolled", y > 8);
    progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
  }
  window.addEventListener("scroll", function () {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // Copy email
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var label = btn.textContent;
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      function done() {
        btn.textContent = "Copied";
        btn.classList.add("done");
        setTimeout(function () { btn.textContent = label; btn.classList.remove("done"); }, 1800);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { window.location.href = "mailto:" + text; });
      } else {
        window.location.href = "mailto:" + text;
      }
    });
  });

  // Footer year
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Hero: CAD crosshair with sheet coordinates (A3, 420 x 297) and a slight figure parallax
  var sheet = document.querySelector(".sheet-inner");
  var crosshair = document.querySelector(".crosshair");
  var readout = document.querySelector(".xh-read");
  var figure = document.querySelector(".hero-figure");
  if (sheet && !reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var rect = null, px = 0, py = 0, frame = 0;
    sheet.addEventListener("pointerenter", function () { rect = sheet.getBoundingClientRect(); });
    sheet.addEventListener("pointermove", function (e) {
      if (!rect) rect = sheet.getBoundingClientRect();
      px = e.clientX - rect.left;
      py = e.clientY - rect.top;
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = 0;
        crosshair.style.setProperty("--cx", px + "px");
        crosshair.style.setProperty("--cy", py + "px");
        readout.textContent = "X " + (px / rect.width * 420).toFixed(1) + "  Y " + ((1 - py / rect.height) * 297).toFixed(1);
        figure.style.setProperty("--mx", (px / rect.width - 0.5).toFixed(3));
        figure.style.setProperty("--my", (py / rect.height - 0.5).toFixed(3));
      });
    });
    sheet.addEventListener("pointerleave", function () {
      rect = null;
      figure.style.setProperty("--mx", 0);
      figure.style.setProperty("--my", 0);
    });
    window.addEventListener("scroll", function () { rect = null; }, { passive: true });
  }

  var reveals = document.querySelectorAll(".reveal");
  var counters = document.querySelectorAll("[data-count]");

  if (!("IntersectionObserver" in window) || reduce) {
    reveals.forEach(function (el) { el.classList.add("in"); });
    if (!("IntersectionObserver" in window)) return;
  }

  // Active nav link for the section in view
  var links = {};
  nav.querySelectorAll("a[href^='#']").forEach(function (a) { links[a.hash.slice(1)] = a; });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      Object.keys(links).forEach(function (id) { links[id].classList.toggle("active", id === entry.target.id); });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach(function (s) { spy.observe(s); });

  // Reveal on scroll; elements entering together are staggered
  if (!reduce) {
    var revealer = new IntersectionObserver(function (entries) {
      var batch = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty("--i", Math.min(batch++, 6));
        entry.target.classList.add("in");
        revealer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { revealer.observe(el); });
  }

  // Count-up numbers
  var counter = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      counter.unobserve(entry.target);
      var el = entry.target;
      var end = parseInt(el.getAttribute("data-count"), 10);
      if (reduce) { el.textContent = end; return; }
      var start = 0;
      function step(ts) {
        if (!start) start = ts;
        var t = Math.min((ts - start) / 1400, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(step);
      }
      el.textContent = "0";
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  counters.forEach(function (c) { counter.observe(c); });
})();
