// Drag-to-scroll horizontal carousel (mouse + touch via pointer events).
// Listens on window rather than relying on setPointerCapture, since capture
// can be dropped mid-gesture in some environments — window-level listening
// keeps tracking the drag even if the pointer leaves the track's bounds.
(function () {
  var track = document.querySelector("[data-drag-scroll]");
  if (!track) return;

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

  // Keyboard support: left/right arrow scroll when the track is focused
  track.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") {
      track.scrollBy({ left: 340, behavior: "smooth" });
    } else if (e.key === "ArrowLeft") {
      track.scrollBy({ left: -340, behavior: "smooth" });
    }
  });
})();
