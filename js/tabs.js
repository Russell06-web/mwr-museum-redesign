// Generic tab-panel switcher: [data-tab] buttons control #panel-<value> visibility
(function () {
  var tabs = document.querySelectorAll("[data-tab]");
  if (!tabs.length) return;

  function activate(key, updateHash) {
    tabs.forEach(function (tab) {
      var isActive = tab.dataset.tab === key;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    document.querySelectorAll(".exhibit-panel").forEach(function (panel) {
      var show = panel.id === "panel-" + key;
      panel.hidden = !show;
      if (show) {
        panel.classList.remove("is-entering");
        void panel.offsetWidth;
        panel.classList.add("is-entering");
      }
    });
    if (updateHash && history.replaceState) {
      history.replaceState(null, "", "#" + key);
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activate(tab.dataset.tab, true);
    });
  });

  var hash = window.location.hash.replace("#", "");
  var valid = Array.prototype.some.call(tabs, function (t) {
    return t.dataset.tab === hash;
  });
  if (valid) activate(hash, false);
})();
