;(function () {
  // "Focus & tools" on the home page as an oscilloscope: a waveform runs edge to
  // edge across the section, and every skill has a signal of its own. Hovering,
  // focusing or tapping a skill puts its signal on the scope; left alone, the
  // scope steps through the skills by itself.
  var canvas = document.getElementById('skills-scope')
  var section = document.getElementById('about')
  if (!canvas || !section || !canvas.getContext) return
  var ctx = canvas.getContext('2d')
  var readoutName = document.querySelector('.skills-scope-name')
  var readoutDesc = document.querySelector('.skills-scope-desc')
  var chips = [].slice.call(section.querySelectorAll('.skill-chip'))
  if (!chips.length) return

  var DIV = 64 // px per horizontal division
  var SPEED = 0.55 // divisions the trace scrolls per second
  var DWELL = 4000 // ms each skill stays up while the scope cycles by itself
  var FADE = 280 // ms to cross-fade from one signal to the next
  var TAU = Math.PI * 2
  var COLORS = { focus: '248, 113, 113', hardware: '251, 191, 36', software: '96, 165, 250' }
  var CHANNEL_ALPHA = [1, 0.5, 0.32]

  function frac(x) { return x - Math.floor(x) }
  function square(x, duty) { return frac(x) < duty ? 1 : -1 }
  // Repeatable pseudo-random 0..1 for an integer, so "random" bits don't flicker.
  function hash(n) { return frac(Math.sin(n * 127.1 + 311.7) * 43758.5453) }
  function bit(n) { return hash(n) > 0.5 ? 1 : -1 }

  // Each signal maps a position u (in divisions) and the time t (seconds) to one
  // value per channel, each between -1 and 1.
  var SIGNALS = {
    'Mechatronics': {
      desc: 'PWM motor drive, duty cycle sweeping',
      at: function (u, t) { return [0.75 * square(u * 1.4, 0.5 + 0.38 * Math.sin(t * 0.9))] }
    },
    'Power systems': {
      desc: 'three-phase AC, 120° apart',
      at: function (u) {
        var a = TAU * u / 2.6
        return [0.8 * Math.sin(a), 0.8 * Math.sin(a - TAU / 3), 0.8 * Math.sin(a + TAU / 3)]
      }
    },
    'Cybersecurity': {
      desc: 'encrypted traffic: indistinguishable from noise',
      at: function (u) { return [0.7 * bit(Math.floor(u * 3))] }
    },
    'ESP32': {
      desc: 'Wi-Fi bursts on a 2.4 GHz carrier (slowed down a lot)',
      at: function (u) {
        var envelope = Math.pow(Math.max(0, Math.sin(TAU * u / 3)), 2)
        return [0.85 * envelope * Math.sin(TAU * u * 5)]
      }
    },
    'Arduino': {
      desc: 'Blink: HIGH, delay(1000), LOW, delay(1000)',
      at: function (u) { return [0.7 * square(u / 2.4, 0.5)] }
    },
    'Raspberry Pi': {
      desc: 'UART serial, 8N1: sending "Hi!"',
      at: function (u) {
        // Idle high, a low start bit, eight data bits LSB first, a high stop bit.
        var message = 'Hi!'
        var n = Math.floor(u * 2.5)
        var pos = ((n % 12) + 12) % 12
        var code = message.charCodeAt((((Math.floor(n / 12)) % 3) + 3) % 3)
        var level = pos === 0 ? 0 : pos <= 8 ? (code >> (pos - 1)) & 1 : 1
        return [level ? 0.7 : -0.7]
      }
    },
    '3D printing': {
      desc: 'stepper motor: one layer at a time',
      at: function (u) { return [-0.8 + 1.6 * Math.floor(frac(u / 5) * 10) / 9] }
    },
    'C': {
      desc: 'clock and data: bits on a bus',
      at: function (u) { return [0.45 + 0.28 * square(u * 2, 0.5), -0.45 + 0.28 * bit(Math.floor(u))] }
    },
    'Python': {
      desc: 'numpy.sin(2πft): one clean sine',
      at: function (u) { return [0.75 * Math.sin(TAU * u / 3)] }
    },
    'MATLAB': {
      desc: 'step response of an underdamped system',
      at: function (u) {
        // The setpoint (second channel) steps up, then down; the output rings
        // past it and settles each time.
        var p = frac(u / 9)
        var target = p < 0.5 ? 1 : -1
        var x = (p < 0.5 ? p : p - 0.5) * 9
        var y = target * (1 - 2 * Math.exp(-0.75 * x) * Math.cos(TAU * x / 1.2))
        return [0.48 * y, 0.48 * target]
      }
    },
    'LTspice': {
      desc: 'RC circuit charging and discharging',
      at: function (u) {
        var p = frac(u / 4)
        var x = (p < 0.5 ? p : p - 0.5) * 4
        var y = (p < 0.5 ? 1 : -1) * (1 - 2 * Math.exp(-x / 0.45))
        return [0.7 * y, 0.7 * (p < 0.5 ? 1 : -1)]
      }
    },
    'PowerWorld': {
      desc: '60 Hz grid voltage with harmonic distortion',
      at: function (u) {
        var a = TAU * u / 3
        return [0.62 * (Math.sin(a) + 0.28 * Math.sin(3 * a) + 0.16 * Math.sin(5 * a))]
      }
    },
    'KiCad': {
      desc: 'differential pair: D+ and D−, routed together',
      at: function (u) {
        var v = u * 1.5
        var cell = Math.floor(v)
        var edge = Math.min(1, frac(v) / 0.18)
        var s = bit(cell - 1) + (bit(cell) - bit(cell - 1)) * edge
        return [0.55 * s, -0.55 * s]
      }
    }
  }
  var FALLBACK = { desc: '', at: function (u) { return [0.7 * Math.sin(TAU * u / 3)] } }

  function signalOf(chip) {
    return SIGNALS[chip.textContent.trim()] || FALLBACK
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  var width = 0
  var height = 0
  var time = 0 // seconds of animation so far
  var lastFrame = 0
  var running = false
  var onScreen = false

  var current = chips[0] // the skill on the scope now
  var previous = null // the one it is fading from
  var changedAt = -Infinity
  var pinned = null // set by a click or tap
  var hovered = null
  var autoIndex = 0
  var autoSince = 0

  function show(chip) {
    if (chip === current) return
    previous = current
    current = chip
    changedAt = performance.now()
    chips.forEach(function (c) { c.classList.toggle('is-hot', c === chip) })
    var signal = signalOf(chip)
    if (readoutName) {
      readoutName.textContent = chip.textContent.trim()
      readoutName.setAttribute('data-group', chip.getAttribute('data-group') || '')
    }
    if (readoutDesc) readoutDesc.textContent = signal.desc
    if (!running) draw(performance.now())
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2)
    // Setting a canvas's size clears it and can re-notify the observer, so do
    // nothing unless the size on the page really changed.
    if (canvas.clientWidth === width && canvas.clientHeight === height) return
    width = canvas.clientWidth
    height = canvas.clientHeight
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (!running) draw(performance.now())
  }

  function drawGrid() {
    var mid = height / 2
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.07)'
    ctx.beginPath()
    // Vertical divisions, counted out from the centre so the grid stays symmetric.
    for (var x = (width / 2) % DIV; x < width; x += DIV) {
      ctx.moveTo(Math.round(x) + 0.5, 0)
      ctx.lineTo(Math.round(x) + 0.5, height)
    }
    for (var k = -1; k <= 1; k += 2) {
      ctx.moveTo(0, Math.round(mid + k * height * 0.25) + 0.5)
      ctx.lineTo(width, Math.round(mid + k * height * 0.25) + 0.5)
    }
    ctx.stroke()
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)'
    ctx.beginPath()
    ctx.moveTo(0, Math.round(mid) + 0.5)
    ctx.lineTo(width, Math.round(mid) + 0.5)
    ctx.stroke()
  }

  function drawSignal(chip, alpha) {
    if (!chip || alpha <= 0) return
    var signal = signalOf(chip)
    var color = COLORS[chip.getAttribute('data-group')] || COLORS.software
    var mid = height / 2
    var amp = height * 0.4
    var offset = time * SPEED
    var channels = signal.at(0, time).length

    ctx.lineJoin = 'round'
    ctx.lineWidth = 2
    ctx.shadowColor = 'rgba(' + color + ', 0.9)'
    // Back channels first so the main one is drawn on top.
    for (var c = channels - 1; c >= 0; c--) {
      ctx.strokeStyle = 'rgba(' + color + ', ' + (alpha * (CHANNEL_ALPHA[c] || 0.3)).toFixed(3) + ')'
      ctx.shadowBlur = c === 0 ? 10 : 0
      ctx.beginPath()
      for (var x = 0; x <= width; x += 2) {
        var y = mid - amp * signal.at(x / DIV + offset, time)[c]
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    ctx.shadowBlur = 0
  }

  function draw(now) {
    ctx.clearRect(0, 0, width, height)
    drawGrid()
    var k = reduceMotion.matches ? 1 : Math.min(1, (now - changedAt) / FADE)
    if (k < 1) drawSignal(previous, 1 - k)
    drawSignal(current, k)
  }

  function frame(now) {
    if (!running) return
    // Checked every frame as well as on the media query's change event, which
    // doesn't always fire.
    if (reduceMotion.matches) return update()
    time += Math.min(now - lastFrame, 50) / 1000
    lastFrame = now
    // Nobody is pointing at a skill: step on to the next one every few seconds.
    if (!pinned && !hovered && now - autoSince > DWELL) {
      autoSince = now
      autoIndex = (chips.indexOf(current) + 1) % chips.length
      show(chips[autoIndex])
    }
    draw(now)
    requestAnimationFrame(frame)
  }

  // Animate only while the section is visible, the tab is in front, and the
  // visitor hasn't asked for reduced motion (they get a still trace that
  // changes only when they pick a skill).
  function update() {
    var shouldRun = onScreen && !document.hidden && !reduceMotion.matches
    if (shouldRun && !running) {
      running = true
      lastFrame = performance.now()
      autoSince = lastFrame
      requestAnimationFrame(frame)
    } else if (!shouldRun && running) {
      running = false
      draw(performance.now())
    }
  }

  function choose() {
    autoSince = performance.now()
    show(pinned || hovered || current)
  }

  chips.forEach(function (chip) {
    chip.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'touch') return
      hovered = chip
      choose()
    })
    chip.addEventListener('pointerleave', function () {
      if (hovered === chip) hovered = null
      choose()
    })
    chip.addEventListener('focus', function () {
      hovered = chip
      choose()
    })
    chip.addEventListener('blur', function () {
      if (hovered === chip) hovered = null
      choose()
    })
    // A click or tap pins the skill; clicking it again lets the scope cycle on.
    chip.addEventListener('click', function () {
      pinned = pinned === chip ? null : chip
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === pinned)) })
      choose()
    })
  })

  // Start on the first skill.
  current = null
  show(chips[0])
  changedAt = -Infinity

  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas)
  else window.addEventListener('resize', resize)
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting
      update()
    }).observe(canvas)
  } else {
    onScreen = true
  }
  document.addEventListener('visibilitychange', update)
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', update)

  resize()
  update()
})()
