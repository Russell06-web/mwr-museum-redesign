// Photos load fully desaturated and slowly bloom into color — on page load
// for anything already in view (hero, etc.), and as each photo scrolls
// into view further down the page.
(function () {
  var targets = document.querySelectorAll(".photo, .artifact-photo, .hero-bg");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach(function (t) {
      t.classList.add("is-revealed");
    });
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
  );

  targets.forEach(function (t) {
    io.observe(t);
  });
})();
