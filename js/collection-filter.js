// Collection page category filter
(function () {
  var tabs = document.querySelectorAll("[data-filter]");
  var cards = document.querySelectorAll("[data-category]");
  var empty = document.querySelector("[data-empty-state]");
  if (!tabs.length || !cards.length) return;

  function apply(category) {
    var visibleCount = 0;
    cards.forEach(function (card) {
      var match = category === "all" || card.dataset.category === category;
      card.classList.toggle("is-visible", match);
      if (match) visibleCount++;
    });
    if (empty) empty.classList.toggle("is-visible", visibleCount === 0);
    tabs.forEach(function (tab) {
      tab.classList.toggle("is-active", tab.dataset.filter === category);
      tab.setAttribute("aria-selected", tab.dataset.filter === category ? "true" : "false");
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      apply(tab.dataset.filter);
    });
  });

  apply("all");
})();
