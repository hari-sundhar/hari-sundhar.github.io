(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasIO = "IntersectionObserver" in window;

  // Only hide reveal targets once we know this script is running
  if (hasIO && !reduce) root.classList.add("js");

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
  document.addEventListener("click", function (e) {
    if (nav.classList.contains("open") && !e.target.closest(".header-inner")) setMenu(false);
  });

  // Header state
  var header = document.querySelector(".site-header");
  var queued = false;
  function onScroll() {
    queued = false;
    header.classList.toggle("scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", function () {
    if (!queued) { queued = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // Spotlight that follows the pointer on cards
  if (finePointer) {
    document.querySelectorAll(".spot").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  // Copy email
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var label = btn.querySelector("span");
    var original = label.textContent;
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      function done() {
        label.textContent = "Copied";
        btn.classList.add("done");
        setTimeout(function () { label.textContent = original; btn.classList.remove("done"); }, 1800);
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

  if (!hasIO) return;

  // Pause the hero wireframe while it is off screen
  var wire = document.querySelector(".wire");
  var hero = document.querySelector(".hero");
  if (wire && hero && !reduce) {
    new IntersectionObserver(function (entries) {
      wire.style.animationPlayState = entries[0].isIntersecting ? "running" : "paused";
    }).observe(hero);
  }

  // Active nav link
  var links = {};
  nav.querySelectorAll("a[href^='#']").forEach(function (a) { links[a.hash.slice(1)] = a; });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      Object.keys(links).forEach(function (id) { links[id].classList.toggle("active", id === entry.target.id); });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach(function (s) { spy.observe(s); });

  // Reveal on scroll; items entering together are staggered
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
    document.querySelectorAll(".reveal").forEach(function (el) { revealer.observe(el); });
  }

  // Count-up numbers
  var counter = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      counter.unobserve(entry.target);
      if (reduce) return;
      var el = entry.target;
      var end = parseInt(el.getAttribute("data-count"), 10);
      var start = 0;
      el.textContent = "0";
      function step(ts) {
        if (!start) start = ts;
        var t = Math.min((ts - start) / 1300, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach(function (c) { counter.observe(c); });
})();
