;(function () {
  // Background for the home page hero: points drift slowly, any two that come
  // close are joined by a line that brightens as they near each other, and the
  // pointer joins in as one more point. Now and then a pulse runs along a line
  // from point to point, like a signal on a network.
  var canvas = document.getElementById('hero-network')
  var hero = document.getElementById('hero')
  if (!canvas || !hero || !canvas.getContext) return
  var ctx = canvas.getContext('2d')

  var LINK = 150 // px: points closer than this are joined
  var POINTER_LINK = 190
  var LINE_ALPHA = 0.32 // a line's opacity when its two points touch
  var BLUE = '96, 165, 250' // --primary-color
  var RED = '248, 113, 113' // --accent-color
  var PULSE_EVERY = 700 // ms between new pulses
  var PULSE_SPEED = 0.16 // px per ms
  var MAX_HOPS = 4

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  var width = 0
  var height = 0
  var points = []
  var pulses = []
  var pointer = null // {x, y} while the pointer is over the hero
  var running = false
  var onScreen = true
  var lastTime = 0
  var sincePulse = 0

  function rand(min, max) {
    return min + Math.random() * (max - min)
  }

  function makePoint() {
    var angle = rand(0, Math.PI * 2)
    var speed = rand(0.008, 0.028) // px per ms
    return {
      x: rand(0, width),
      y: rand(0, height),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: rand(1, 2.2)
    }
  }

  function resize() {
    var rect = hero.getBoundingClientRect()
    var dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = rect.width
    height = rect.height
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Density scales with area, so phones get fewer points than wide screens.
    var target = Math.max(24, Math.min(110, Math.round((width * height) / 11000)))
    while (points.length < target) points.push(makePoint())
    points.length = target
    points.forEach(function (p) {
      if (p.x > width) p.x = rand(0, width)
      if (p.y > height) p.y = rand(0, height)
    })
    pulses = []
    if (!running) draw()
  }

  function dist(a, b) {
    var dx = a.x - b.x
    var dy = a.y - b.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  // A point within reach of `from` for a pulse to travel to (not the one it came from).
  function neighborOf(from, except) {
    var options = points.filter(function (p) {
      return p !== from && p !== except && dist(p, from) < LINK * 0.9
    })
    return options.length ? options[Math.floor(Math.random() * options.length)] : null
  }

  function spawnPulse() {
    var from = points[Math.floor(Math.random() * points.length)]
    var to = from && neighborOf(from, null)
    if (!to) return
    pulses.push({ from: from, to: to, t: 0, hops: 0, color: Math.random() < 0.2 ? RED : BLUE })
  }

  function step(dt) {
    points.forEach(function (p) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      if (p.x < 0 || p.x > width) p.vx = -p.vx
      if (p.y < 0 || p.y > height) p.vy = -p.vy
      p.x = Math.max(0, Math.min(width, p.x))
      p.y = Math.max(0, Math.min(height, p.y))
    })

    sincePulse += dt
    if (sincePulse > PULSE_EVERY) {
      sincePulse = 0
      spawnPulse()
    }

    pulses = pulses.filter(function (pulse) {
      var d = dist(pulse.from, pulse.to)
      if (d > LINK) return false // the line it was riding has broken
      pulse.t += (PULSE_SPEED * dt) / Math.max(d, 1)
      if (pulse.t < 1) return true
      // Arrived: hop on to another neighbour, or fade out here.
      var next = pulse.hops < MAX_HOPS ? neighborOf(pulse.to, pulse.from) : null
      if (!next) return false
      pulse.from = pulse.to
      pulse.to = next
      pulse.t = 0
      pulse.hops++
      return true
    })
  }

  function line(a, b, alpha, color) {
    ctx.strokeStyle = 'rgba(' + color + ', ' + alpha.toFixed(3) + ')'
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }

  function draw() {
    ctx.clearRect(0, 0, width, height)
    ctx.lineWidth = 1

    for (var i = 0; i < points.length; i++) {
      for (var j = i + 1; j < points.length; j++) {
        var d = dist(points[i], points[j])
        if (d < LINK) line(points[i], points[j], (1 - d / LINK) * LINE_ALPHA, BLUE)
      }
      if (pointer) {
        var dp = dist(points[i], pointer)
        if (dp < POINTER_LINK) line(points[i], pointer, (1 - dp / POINTER_LINK) * 0.55, BLUE)
      }
    }

    ctx.fillStyle = 'rgba(' + BLUE + ', 0.55)'
    points.forEach(function (p) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
    })

    pulses.forEach(function (pulse) {
      var x = pulse.from.x + (pulse.to.x - pulse.from.x) * pulse.t
      var y = pulse.from.y + (pulse.to.y - pulse.from.y) * pulse.t
      ctx.shadowColor = 'rgba(' + pulse.color + ', 0.9)'
      ctx.shadowBlur = 10
      ctx.fillStyle = 'rgba(' + pulse.color + ', 0.95)'
      ctx.beginPath()
      ctx.arc(x, y, 2.2, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.shadowBlur = 0
  }

  function frame(now) {
    if (!running) return
    // Checked every frame as well as on the media query's change event, which
    // doesn't always fire.
    if (reduceMotion.matches) return update()
    // Cap the step so a background tab coming back doesn't jump everything.
    var dt = Math.min(now - lastTime, 50)
    lastTime = now
    step(dt)
    draw()
    requestAnimationFrame(frame)
  }

  // Animate only while the hero is visible, the tab is in front, and the
  // visitor hasn't asked for reduced motion (they get a still frame instead).
  function update() {
    var shouldRun = onScreen && !document.hidden && !reduceMotion.matches
    if (shouldRun && !running) {
      running = true
      lastTime = performance.now()
      requestAnimationFrame(frame)
    } else if (!shouldRun && running) {
      running = false
      if (reduceMotion.matches) {
        pulses = []
        draw()
      }
    }
  }

  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return
    var rect = hero.getBoundingClientRect()
    pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  })
  hero.addEventListener('pointerleave', function () {
    pointer = null
  })

  if (window.ResizeObserver) new ResizeObserver(resize).observe(hero)
  else window.addEventListener('resize', resize)
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting
      update()
    }).observe(hero)
  }
  document.addEventListener('visibilitychange', update)
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', update)

  resize()
  update()
})()
