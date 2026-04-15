;(function () {
  var observed = new WeakSet()
  // threshold 0 — any visible pixel counts. Using 0.2 breaks tall blocks (e.g. long project
  // write-ups): the viewport may show less than 20% of the element height, so it never "intersects".
  var scrollObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
          entry.target.classList.remove('animate-out')
        }
      })
    },
    { threshold: 0, rootMargin: '0px 0px -40px 0px' }
  )

  function setupScrollAnimations(root) {
    var scope = root || document
    var nodes = scope.querySelectorAll('.animate-on-scroll')
    nodes.forEach(function (el) {
      if (observed.has(el)) return
      observed.add(el)
      scrollObserver.observe(el)
    })
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupScrollAnimations(document.body)
  })
})()
