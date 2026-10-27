(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  // Hide reveal targets only when JS runs and can show them again
  if (hasIO && !reduce) root.classList.add("js");

  // Compact menu (small screens)
  var sidebar = document.getElementById("sidebar");
  var menuBtn = document.querySelector(".menu-btn");
  function setMenu(open) {
    sidebar.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  menuBtn.addEventListener("click", function () { setMenu(!sidebar.classList.contains("open")); });
  sidebar.addEventListener("click", function (e) {
    if (e.target.closest(".side-nav a, .monogram")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

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

  if (!hasIO) return;

  // Active section indicator in the sidebar nav
  var links = {};
  document.querySelectorAll(".side-nav a").forEach(function (a) { links[a.hash.slice(1)] = a; });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      Object.keys(links).forEach(function (id) {
        var on = id === entry.target.id;
        links[id].classList.toggle("active", on);
        if (on) links[id].setAttribute("aria-current", "true");
        else links[id].removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  document.querySelectorAll("main section[id]").forEach(function (s) { spy.observe(s); });

  // Scroll reveals; items entering together are staggered
  if (!reduce) {
    var revealer = new IntersectionObserver(function (entries) {
      var batch = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty("--i", Math.min(batch++, 6));
        entry.target.classList.add("in");
        revealer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { revealer.observe(el); });
  }
})();
