/*
 * Hidden layout switcher (preview only).
 * Open with Ctrl + Shift + L, or add ?layouts to the URL (handy on phones).
 * "Make default" opens the "Set default layout" GitHub Actions workflow;
 * only the repo owner can run it, and it copies vN.html over index.html.
 */
(function () {
  var WORKFLOW_URL = "https://github.com/hari-sundhar/hari-sundhar.github.io/actions/workflows/set-layout.yml";
  var VERSIONS = [
    { id: "v1", name: "Drawing Sheet" },
    { id: "v2", name: "Executive Sidebar" },
    { id: "v3", name: "Dark Product" },
    { id: "v4", name: "Swiss Résumé" }
  ];

  var meta = document.querySelector('meta[name="layout-version"]');
  var viewing = meta ? meta.content : "v1";
  var host = null, ui = {};

  function label(id) {
    for (var i = 0; i < VERSIONS.length; i++) {
      if (VERSIONS[i].id === id) return id.toUpperCase() + " · " + VERSIONS[i].name;
    }
    return id.toUpperCase();
  }

  function showDefault(id) {
    ui.def.textContent = "Default for everyone: " + (id ? label(id) : "unknown");
    ui.list.querySelectorAll(".item").forEach(function (el) {
      el.classList.toggle("is-default", el.getAttribute("data-id") === id);
    });
  }

  // The published index.html carries the layout-version meta of the layout it was copied from.
  function refreshDefault() {
    fetch("index.html", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.text() : ""; })
      .then(function (html) {
        var m = /<meta name="layout-version" content="(v\d+)"/.exec(html);
        showDefault(m ? m[1] : null);
      })
      .catch(function () { showDefault(null); });
  }

  function build() {
    host = document.createElement("div");
    host.hidden = true;
    var root = host.attachShadow({ mode: "open" });

    var items = VERSIONS.map(function (v) {
      return '<li class="item' + (v.id === viewing ? " is-viewing" : "") + '" data-id="' + v.id + '">' +
        '<span class="id">' + v.id.toUpperCase() + "</span>" +
        '<span class="nm">' + v.name + '<em class="b-view">Viewing</em><em class="b-def">Default</em></span>' +
        '<a class="btn ghost" href="' + v.id + '.html?layouts">Preview</a>' +
        '<button class="btn" type="button" data-set="' + v.id + '">Make default</button>' +
        "</li>";
    }).join("");

    root.innerHTML =
      "<style>" +
      ":host{all:initial}:host([hidden]){display:none}" +
      ".bar{position:fixed;left:50%;bottom:16px;z-index:2147483000;width:min(720px,calc(100vw - 24px));transform:translateX(-50%);" +
      "background:#14171c;color:#eef1f5;border:1px solid #2a3038;border-radius:14px;box-shadow:0 24px 60px -20px rgba(0,0,0,.6);" +
      "font:14px/1.45 'Segoe UI',system-ui,-apple-system,sans-serif;padding:14px 16px 12px;animation:up .35s cubic-bezier(.2,.7,.2,1)}" +
      "@keyframes up{from{opacity:0;transform:translate(-50%,16px)}to{opacity:1;transform:translate(-50%,0)}}" +
      ".head{display:flex;align-items:center;gap:12px;margin-bottom:10px}" +
      ".title{font-weight:650;letter-spacing:.02em}" +
      ".def{color:#9aa5b4;font-size:12.5px}" +
      ".hint{margin-left:auto;font:11px Consolas,monospace;color:#6b7684}" +
      ".x{background:none;border:0;color:#9aa5b4;font-size:20px;line-height:1;cursor:pointer;padding:2px 6px;border-radius:6px}" +
      ".x:hover{color:#fff;background:#232931}" +
      "ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}" +
      ".item{display:grid;grid-template-columns:34px 1fr auto auto;align-items:center;gap:10px;padding:8px 10px;border:1px solid #262c34;border-radius:10px}" +
      ".item.is-viewing{border-color:#4b5563}" +
      ".item.is-default{border-color:#e0531f}" +
      ".id{font:600 12px Consolas,monospace;color:#9aa5b4}" +
      ".nm em{display:none;margin-left:8px;padding:1px 7px;border-radius:999px;font:600 10.5px Consolas,monospace;letter-spacing:.06em;text-transform:uppercase;vertical-align:1px}" +
      ".is-viewing .b-view{display:inline-block;background:#2a3038;color:#cfd6df}" +
      ".is-default .b-def{display:inline-block;background:#e0531f;color:#fff}" +
      ".btn{appearance:none;font:600 12.5px 'Segoe UI',system-ui,sans-serif;padding:6px 12px;border-radius:8px;border:1px solid #e0531f;background:#e0531f;color:#fff;cursor:pointer;text-decoration:none;white-space:nowrap}" +
      ".btn:hover{filter:brightness(1.1)}" +
      ".btn.ghost{background:transparent;border-color:#3a414b;color:#eef1f5}" +
      ".btn.ghost:hover{border-color:#9aa5b4}" +
      ".is-default .btn[data-set]{opacity:.4;pointer-events:none}" +
      ".note{margin:10px 0 0;padding-top:10px;border-top:1px solid #262c34;font-size:12.5px;color:#9aa5b4}" +
      ".note b{color:#eef1f5;font-weight:600}" +
      ":focus-visible{outline:2px solid #e0531f;outline-offset:2px}" +
      "@media (max-width:560px){.item{grid-template-columns:30px 1fr 1fr}.nm{grid-column:2/4}.item .ghost{grid-column:2}.hint{display:none}}" +
      "@media (prefers-reduced-motion:reduce){.bar{animation:none}}" +
      "</style>" +
      '<div class="bar" role="dialog" aria-label="Layout switcher">' +
        '<div class="head"><span class="title">Layouts</span><span class="def">Default for everyone: checking…</span>' +
        '<span class="hint">Ctrl+Shift+L</span><button class="x" type="button" aria-label="Close layout switcher">×</button></div>' +
        "<ul>" + items + "</ul>" +
        '<p class="note" aria-live="polite">Preview is just for you. <b>Make default</b> opens GitHub: click <b>Run workflow</b>, ' +
        "choose the layout, then <b>Run</b>. Everyone sees it within a few minutes.</p>" +
      "</div>";

    ui.def = root.querySelector(".def");
    ui.list = root.querySelector("ul");
    ui.note = root.querySelector(".note");

    root.querySelector(".x").addEventListener("click", close);
    ui.list.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-set]");
      if (!btn) return;
      var id = btn.getAttribute("data-set");
      ui.note.innerHTML = "On GitHub: <b>Run workflow</b> → choose <b>" + id + "</b> → <b>Run workflow</b>. " +
        "The site switches to " + label(id) + " for everyone within a few minutes.";
      window.open(WORKFLOW_URL, "_blank", "noopener");
    });

    document.body.appendChild(host);
  }

  function open() {
    if (!host) build();
    host.hidden = false;
    refreshDefault();
  }
  function close() { if (host) host.hidden = true; }

  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey && (e.key === "L" || e.key === "l")) {
      e.preventDefault();
      if (host && !host.hidden) close(); else open();
    } else if (e.key === "Escape" && host && !host.hidden) {
      close();
    }
  });

  if (/[?&]layouts\b/.test(window.location.search)) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", open);
    else open();
  }
})();
