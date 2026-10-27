(function () {
  var root = document.documentElement;
  root.classList.add("js");

  // Theme toggle
  var toggle = document.querySelector(".theme-toggle");
  toggle.addEventListener("click", function () {
    var next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem("theme", next);
  });

  // Footer year
  document.getElementById("year").textContent = new Date().getFullYear();

  if (!("IntersectionObserver" in window)) return;

  // Highlight the nav link for the section in view
  var links = {};
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    links[a.getAttribute("href").slice(1)] = a;
  });
  var navObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      Object.keys(links).forEach(function (id) { links[id].classList.remove("active"); });
      if (links[entry.target.id]) links[entry.target.id].classList.add("active");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach(function (s) { navObserver.observe(s); });

  // Fade sections in as they scroll into view
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll(".job, .card, .skill-box, .edu, .contact-card, .profile-card, .stats > div").forEach(function (el) {
    el.classList.add("reveal");
    revealObserver.observe(el);
  });
})();
