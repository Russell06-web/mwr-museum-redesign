// Header goes from transparent to a blurred solid bar once the page scrolls
(function () {
  var header = document.querySelector(".site-header");
  if (!header) return;
  function update() {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", update, { passive: true });
  update();
})();

// Shared behavior: nav overlay open/close, submenu swap, focus handling
(function () {
  // Every entry below points at a real page or a real in-page section — no
  // two labels within a group resolve to the exact same destination, and
  // items that had no distinct target of their own (e.g. "研究典藏",
  // "數位館藏", "新聞媒體") were removed rather than pointed at a duplicate.
  var SUBMENUS = {
    zh: {
      visit: {
        title: "參觀",
        items: [
          ["開放時間", "visit-hours.html"],
          ["票價資訊", "visit-tickets.html"],
          ["交通指引", "visit-transport.html"],
          ["團體預約", "visit-group.html"],
          ["無障礙服務", "visit-accessibility.html"]
        ]
      },
      exhibitions: {
        title: "展覽",
        items: [
          ["當期展覽", "exhibitions.html#current"],
          ["即將開展", "exhibitions.html#upcoming"],
          ["歷年展覽", "exhibitions.html#past"],
          ["虛擬導覽", "index.html#tour"],
          ["講座活動", "index.html#events"]
        ]
      },
      collection: {
        title: "館藏",
        items: [
          ["館藏瀏覽", "collection.html"]
        ]
      },
      about: {
        title: "關於",
        items: [
          ["博物館理念與歷史", "about.html#mission"],
          ["館務團隊", "about.html#team"],
          ["聯絡我們", "about.html#contact"]
        ]
      }
    },
    en: {
      visit: {
        title: "Visit",
        items: [
          ["Opening Hours", "visit-hours.html"],
          ["Tickets & Pricing", "visit-tickets.html"],
          ["Directions", "visit-transport.html"],
          ["Group Bookings", "visit-group.html"],
          ["Accessibility", "visit-accessibility.html"]
        ]
      },
      exhibitions: {
        title: "Exhibitions",
        items: [
          ["Current", "exhibitions.html#current"],
          ["Upcoming", "exhibitions.html#upcoming"],
          ["Past", "exhibitions.html#past"],
          ["Virtual Tour", "index.html#tour"],
          ["Lectures & Events", "index.html#events"]
        ]
      },
      collection: {
        title: "Collection",
        items: [
          ["Browse Collection", "collection.html"]
        ]
      },
      about: {
        title: "About",
        items: [
          ["Philosophy & History", "about.html#mission"],
          ["Leadership Team", "about.html#team"],
          ["Contact Us", "about.html#contact"]
        ]
      }
    }
  };

  var toggle = document.querySelector("[data-menu-toggle]");
  var overlay = document.querySelector("[data-nav-overlay]");
  var closeBtn = document.querySelector("[data-nav-close]");
  var subPanel = document.querySelector("[data-sub-panel]");
  var mainLinks = overlay ? overlay.querySelectorAll("[data-sub]") : [];
  var lastRenderedKey = null;

  function currentLang() {
    var lang = document.documentElement.getAttribute("data-lang");
    return lang === "en" ? "en" : "zh";
  }

  function renderSub(key) {
    var section = SUBMENUS[currentLang()][key];
    if (!section || !subPanel) return;
    lastRenderedKey = key;
    var unit = currentLang() === "en" ? " items" : " 項目";
    var html = '<div class="sub-heading">' + section.title + " · " + section.items.length + unit + "</div>";
    section.items.forEach(function (item) {
      html += '<a href="' + item[1] + '">' + item[0] + "</a>";
    });
    subPanel.innerHTML = html;
    mainLinks.forEach(function (link) {
      link.classList.toggle("is-active", link.dataset.sub === key);
    });
    // retrigger the fade-in animation on every swap, not just first render
    subPanel.classList.remove("is-swapping");
    void subPanel.offsetWidth;
    subPanel.classList.add("is-swapping");
  }

  if (mainLinks.length) {
    mainLinks.forEach(function (link) {
      link.addEventListener("mouseenter", function () {
        renderSub(link.dataset.sub);
      });
      link.addEventListener("focus", function () {
        renderSub(link.dataset.sub);
      });
    });
    var initial = document.body.getAttribute("data-nav-section") || "visit";
    renderSub(initial);
    // re-render the currently shown submenu (in its new language) whenever
    // the language toggle fires, so text swaps even if the overlay is open
    document.addEventListener("mwr:langchange", function () {
      renderSub(lastRenderedKey || initial);
    });
  }

  if (!toggle || !overlay) return;

  var lastFocused = null;

  // Background content (everything the overlay covers) is made inert and
  // hidden from assistive tech while the overlay is open, so Tab and
  // screen-reader virtual-cursor navigation both stay trapped inside it.
  var backgroundEls = document.querySelectorAll(
    "main, .site-footer, .site-header .brand, .site-header .lang-toggle"
  );

  function setBackgroundInert(isInert) {
    backgroundEls.forEach(function (el) {
      if (isInert) {
        el.setAttribute("inert", "");
        el.setAttribute("aria-hidden", "true");
      } else {
        el.removeAttribute("inert");
        el.removeAttribute("aria-hidden");
      }
    });
  }

  function openMenu() {
    lastFocused = document.activeElement;
    overlay.classList.add("is-open");
    document.body.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    setBackgroundInert(true);
    // deferred: the browser's own default focus-follows-click behavior on
    // the toggle button runs after this handler and steals focus back —
    // requestAnimationFrame isn't a long enough delay to reliably lose that
    // race, so this uses a short timeout instead (imperceptible to users)
    setTimeout(function () {
      var active = overlay.querySelector(".nav-overlay-main a.is-active") || overlay.querySelector(".nav-overlay-main a");
      if (active) active.focus();
    }, 50);
  }

  function closeMenu() {
    overlay.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    setBackgroundInert(false);
    if (lastFocused) lastFocused.focus();
  }

  function isOpen() {
    return overlay.classList.contains("is-open");
  }

  toggle.addEventListener("click", function () {
    isOpen() ? closeMenu() : openMenu();
  });

  if (closeBtn) closeBtn.addEventListener("click", closeMenu);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) closeMenu();
  });

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeMenu();
  });

  overlay.addEventListener("keydown", function (e) {
    if (e.key !== "Tab" || !isOpen()) return;
    var focusable = overlay.querySelectorAll("a[href], button:not([disabled])");
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();


// Language toggle: EN / 中, persisted in localStorage, no page reload
(function () {
  var root = document.documentElement;
  var langToggle = document.querySelector(".lang-toggle");
  if (!langToggle) return;

  function syncLabel() {
    var isEn = root.getAttribute("data-lang") === "en";
    langToggle.textContent = isEn ? "中" : "EN";
    // the action label always describes what clicking will do, read in the
    // language the visitor currently sees, not the language being offered
    var dict = (window.I18N && window.I18N[isEn ? "en" : "zh"]) || {};
    var actionLabel = dict[isEn ? "lang.toChinese" : "lang.toEnglish"];
    if (actionLabel) {
      langToggle.setAttribute("aria-label", actionLabel);
      langToggle.setAttribute("title", actionLabel);
    }
  }
  syncLabel();

  langToggle.addEventListener("click", function (e) {
    e.preventDefault();
    var next = root.getAttribute("data-lang") === "en" ? "zh" : "en";
    root.setAttribute("data-lang", next);
    localStorage.setItem("mwr-lang", next);
    if (window.applyTranslations) window.applyTranslations(next);
    syncLabel();
    document.dispatchEvent(new CustomEvent("mwr:langchange", { detail: next }));
  });
})();
