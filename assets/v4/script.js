(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile menu
  var nav = document.getElementById("site-nav");
  var menuBtn = document.querySelector(".menu-btn");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });

  // Layout grid overlay: button or the G key
  var gridBtn = document.querySelector(".grid-toggle");
  function toggleGrid() {
    var on = root.classList.toggle("show-grid");
    gridBtn.setAttribute("aria-pressed", on ? "true" : "false");
  }
  gridBtn.addEventListener("click", toggleGrid);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
    if ((e.key === "g" || e.key === "G") && !e.ctrlKey && !e.metaKey && !e.altKey &&
        !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
      toggleGrid();
    }
  });

  // Header rule once the page scrolls
  var header = document.querySelector(".site-header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
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

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  var reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || reduce) {
    reveals.forEach(function (el) { el.classList.add("in"); });
    if (!("IntersectionObserver" in window)) return;
  }

  // Active section in the nav
  var links = {};
  nav.querySelectorAll("a[href^='#']").forEach(function (a) { links[a.hash.slice(1)] = a; });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      Object.keys(links).forEach(function (id) { links[id].classList.toggle("active", id === entry.target.id); });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach(function (s) { spy.observe(s); });

  // Scroll reveals; elements entering together are staggered
  if (!reduce) {
    var revealer = new IntersectionObserver(function (entries) {
      var batch = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty("--i", Math.min(batch++, 6));
        entry.target.classList.add("in");
        revealer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
    reveals.forEach(function (el) { revealer.observe(el); });
  }

  // Show everything before printing
  window.addEventListener("beforeprint", function () {
    reveals.forEach(function (el) { el.classList.add("in"); });
  });
})();
