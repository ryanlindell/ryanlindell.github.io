;(function () {
  // Background for the projects page: the contour lines of a slowly shifting
  // height field, like a topographic map. The pointer raises a small hill the
  // lines bend around, and the map slides a little as the page scrolls.
  var canvas = document.getElementById('projects-contours')
  if (!canvas || !canvas.getContext) return
  var ctx = canvas.getContext('2d')

  var CELL = 22 // px between samples of the height field
  var STEP = 0.42 // height between neighbouring contour lines
  var INDEX_EVERY = 4 // every 4th line is drawn stronger, like a map's index contours
  var COLOR = '96, 165, 250' // --primary-color
  var LINE_ALPHA = 0.12
  var INDEX_ALPHA = 0.24
  var DRIFT = 0.00014 // how fast the terrain shifts, per ms
  var PARALLAX = 0.3 // share of the scroll distance the map moves by
  var HILL = 1.3 // height of the hill under the pointer
  var HILL_RADIUS = 150 // px

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  var width = 0
  var height = 0
  var cols = 0
  var rows = 0
  var field = new Float32Array(0)
  var time = Math.random() * 1000
  var lastFrame = 0
  var running = false
  var pointer = { x: 0, y: 0, strength: 0, target: 0 }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2)
    if (canvas.clientWidth === width && canvas.clientHeight === height) return
    width = canvas.clientWidth
    height = canvas.clientHeight
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    cols = Math.ceil(width / CELL) + 1
    rows = Math.ceil(height / CELL) + 1
    field = new Float32Array(cols * rows)
    if (!running) draw()
  }

  // A few overlapping waves make rolling terrain without needing a noise library.
  function heightAt(x, y) {
    var h =
      Math.sin(x * 0.0046 + time * 1.0) +
      Math.sin(y * 0.0061 - time * 0.8) +
      0.9 * Math.sin((x * 0.6 + y * 0.8) * 0.0052 + time * 0.6) +
      0.8 * Math.sin(Math.sqrt((x - 900) * (x - 900) + (y - 250) * (y - 250)) * 0.0058 - time * 0.7)
    return h
  }

  function sample() {
    var shift = window.scrollY * PARALLAX
    var r2 = 2 * HILL_RADIUS * HILL_RADIUS
    for (var j = 0; j < rows; j++) {
      for (var i = 0; i < cols; i++) {
        var x = i * CELL
        var y = j * CELL
        var h = heightAt(x, y + shift)
        if (pointer.strength > 0.01) {
          var dx = x - pointer.x
          var dy = y - pointer.y
          h += HILL * pointer.strength * Math.exp(-(dx * dx + dy * dy) / r2)
        }
        field[j * cols + i] = h
      }
    }
  }

  // Marching squares: for one contour level, add the line segments that cross
  // each grid cell to the current path.
  function traceLevel(level) {
    for (var j = 0; j < rows - 1; j++) {
      for (var i = 0; i < cols - 1; i++) {
        var a = field[j * cols + i] - level // top left
        var b = field[j * cols + i + 1] - level // top right
        var c = field[(j + 1) * cols + i + 1] - level // bottom right
        var d = field[(j + 1) * cols + i] - level // bottom left
        var code = (a > 0 ? 8 : 0) | (b > 0 ? 4 : 0) | (c > 0 ? 2 : 0) | (d > 0 ? 1 : 0)
        if (code === 0 || code === 15) continue
        var x = i * CELL
        var y = j * CELL
        // Where the level crosses each edge of the cell.
        var top = [x + CELL * (a / (a - b)), y]
        var right = [x + CELL, y + CELL * (b / (b - c))]
        var bottom = [x + CELL * (d / (d - c)), y + CELL]
        var left = [x, y + CELL * (a / (a - d))]
        switch (code) {
          case 1: case 14: seg(left, bottom); break
          case 2: case 13: seg(bottom, right); break
          case 3: case 12: seg(left, right); break
          case 4: case 11: seg(top, right); break
          case 6: case 9: seg(top, bottom); break
          case 7: case 8: seg(left, top); break
          case 5: seg(left, top); seg(bottom, right); break
          case 10: seg(left, bottom); seg(top, right); break
        }
      }
    }
  }

  function seg(p, q) {
    ctx.moveTo(p[0], p[1])
    ctx.lineTo(q[0], q[1])
  }

  function draw() {
    if (!cols) return
    sample()
    ctx.clearRect(0, 0, width, height)
    ctx.lineWidth = 1
    for (var n = -10; n <= 10; n++) {
      var index = n % INDEX_EVERY === 0
      ctx.strokeStyle = 'rgba(' + COLOR + ', ' + (index ? INDEX_ALPHA : LINE_ALPHA) + ')'
      ctx.beginPath()
      traceLevel(n * STEP)
      ctx.stroke()
    }
  }

  function frame(now) {
    if (!running) return
    if (reduceMotion.matches) return update()
    var dt = Math.min(now - lastFrame, 50)
    lastFrame = now
    time += dt * DRIFT
    pointer.strength += (pointer.target - pointer.strength) * Math.min(1, dt / 250)
    draw()
    requestAnimationFrame(frame)
  }

  // Animate only while the tab is in front and the visitor hasn't asked for
  // reduced motion (they get a still map).
  function update() {
    var shouldRun = !document.hidden && !reduceMotion.matches
    if (shouldRun && !running) {
      running = true
      lastFrame = performance.now()
      requestAnimationFrame(frame)
    } else if (!shouldRun && running) {
      running = false
      pointer.strength = 0
      draw()
    }
  }

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return
    var rect = canvas.getBoundingClientRect()
    pointer.x = e.clientX - rect.left
    pointer.y = e.clientY - rect.top
    pointer.target = 1
  })
  document.addEventListener('pointerleave', function () {
    pointer.target = 0
  })
  // With motion reduced the map is still, but it should still follow the page.
  window.addEventListener('scroll', function () {
    if (!running) draw()
  }, { passive: true })

  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas)
  else window.addEventListener('resize', resize)
  document.addEventListener('visibilitychange', update)
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', update)

  resize()
  update()
})()
