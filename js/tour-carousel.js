// Drag-to-scroll horizontal carousel (mouse + touch via pointer events),
// plus keyboard-operable prev/next buttons and a live position indicator.
// Listens on window rather than relying on setPointerCapture, since capture
// can be dropped mid-gesture in some environments — window-level listening
// keeps tracking the drag even if the pointer leaves the track's bounds.
(function () {
  var track = document.querySelector("[data-tour-track]");
  if (!track) return;

  var slides = Array.prototype.slice.call(track.querySelectorAll("[data-tour-slide]"));
  var prevBtn = document.querySelector("[data-tour-prev]");
  var nextBtn = document.querySelector("[data-tour-next]");
  var currentEl = document.querySelector("[data-tour-current]");
  var totalEl = document.querySelector("[data-tour-total]");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (totalEl) totalEl.textContent = String(slides.length);

  var isDown = false;
  var startX = 0;
  var startScroll = 0;
  var moved = false;

  track.addEventListener("pointerdown", function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    isDown = true;
    moved = false;
    track.classList.add("is-dragging");
    startX = e.clientX;
    startScroll = track.scrollLeft;
  });

  window.addEventListener("pointermove", function (e) {
    if (!isDown) return;
    var dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    track.scrollLeft = startScroll - dx;
  });

  function endDrag() {
    if (!isDown) return;
    isDown = false;
    track.classList.remove("is-dragging");
    updateActive();
  }
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  // Prevent the trailing click-through to a card link after an actual drag
  track.addEventListener(
    "click",
    function (e) {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

  function maxScroll() {
    return Math.max(0, track.scrollWidth - track.clientWidth);
  }
  // With scroll-snap-type: x mandatory, the browser's natural resting
  // position for "fully scrolled left" is the first card's own offsetLeft
  // (nonzero, since the track has left padding for the section gutter) —
  // not 0. Comparing atStart() against a hardcoded near-zero threshold
  // would never be true, permanently leaving the Prev button enabled.
  function minScroll() {
    return slides.length ? Math.min(slides[0].offsetLeft, maxScroll()) : 0;
  }
  function atStart() {
    return track.scrollLeft <= minScroll() + 1;
  }
  function atEnd() {
    return track.scrollLeft >= maxScroll() - 1;
  }

  // Nearest slide to the track's current left edge, used only for the
  // progress number — clamps each candidate offset to the real scrollable
  // range first, since at wide viewports the browser can't scroll far
  // enough to ever reach a mid-list card's raw offsetLeft (several cards
  // already fit on screen at once near the end of the list).
  function activeIndex() {
    var pos = track.scrollLeft;
    var max = maxScroll();
    var closest = 0;
    var closestDist = Infinity;
    slides.forEach(function (slide, i) {
      var dist = Math.abs(Math.min(slide.offsetLeft, max) - pos);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    return closest;
  }

  function updateActive() {
    var index = atEnd() ? slides.length - 1 : activeIndex();
    if (currentEl) currentEl.textContent = String(index + 1);
    if (prevBtn) prevBtn.disabled = atStart();
    if (nextBtn) nextBtn.disabled = atEnd();
  }

  // One "step" is the gap between two consecutive slides' left edges. Moving
  // by scrollLeft deltas (rather than aiming at a specific slide's fixed
  // offsetLeft) means the browser's own clamping/scroll-snap always resolves
  // to a real, reachable position — it can never request a coordinate that
  // silently fails to move the track at all.
  function cardStep() {
    if (slides.length > 1) return slides[1].offsetLeft - slides[0].offsetLeft;
    return slides[0] ? slides[0].offsetWidth : 0;
  }

  function scrollByCards(delta) {
    track.scrollTo({
      left: track.scrollLeft + delta * cardStep(),
      behavior: reduceMotion ? "auto" : "smooth"
    });
    updateActive();
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      scrollByCards(-1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      scrollByCards(1);
    });
  }

  // Keyboard support: left/right arrow moves one full slide when the track
  // (or a card inside it) has focus
  track.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollByCards(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollByCards(-1);
    }
  });

  track.addEventListener(
    "scroll",
    function () {
      window.clearTimeout(track._scrollSettle);
      track._scrollSettle = window.setTimeout(updateActive, 100);
    },
    { passive: true }
  );

  updateActive();
})();
