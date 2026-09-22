;(function () {
  // Tag filter for projects.html. The tags themselves live in the HTML (the
  // .project-tag items on each card), so adding a project only means writing
  // its card; the filter buttons are built from whatever tags the cards carry.
  var bar = document.getElementById('project-filter')
  var list = document.querySelector('.project-card-list')
  if (!bar || !list) return

  var cards = [].slice.call(list.children).filter(function (li) {
    return li.tagName === 'LI'
  })

  function tagsOf(card) {
    return [].slice.call(card.querySelectorAll('.project-tag')).map(function (t) {
      return t.textContent.trim()
    })
  }

  // Most-used tags first; ties keep the order they first appear on the page.
  var counts = {}
  var order = []
  cards.forEach(function (card) {
    tagsOf(card).forEach(function (tag) {
      if (!counts[tag]) {
        counts[tag] = 0
        order.push(tag)
      }
      counts[tag]++
    })
  })
  var tags = order.slice().sort(function (a, b) {
    return counts[b] - counts[a] || order.indexOf(a) - order.indexOf(b)
  })

  function makeButton(label, tag, count) {
    var btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'project-filter-btn'
    btn.dataset.tag = tag
    btn.textContent = label
    var n = document.createElement('span')
    n.className = 'project-filter-count'
    n.textContent = count
    btn.appendChild(n)
    btn.addEventListener('click', function () {
      apply(tag === active ? '' : tag, true)
    })
    return btn
  }

  bar.appendChild(makeButton('All', '', cards.length))
  tags.forEach(function (tag) {
    bar.appendChild(makeButton(tag, tag, counts[tag]))
  })
  bar.hidden = false

  var active = ''

  function apply(tag, updateUrl) {
    if (tag && !counts[tag]) tag = ''
    active = tag
    ;[].forEach.call(bar.children, function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.tag === tag))
    })
    cards.forEach(function (card) {
      var match = false
      ;[].forEach.call(card.querySelectorAll('.project-tag'), function (t) {
        var hit = !!tag && t.textContent.trim() === tag
        t.classList.toggle('is-match', hit)
        if (hit) match = true
      })
      card.hidden = !!tag && !match
    })
    // Keep the choice in the address so a filtered view can be linked to.
    if (updateUrl && window.history && history.replaceState) {
      var url = new URL(location.href)
      if (tag) url.searchParams.set('tag', tag)
      else url.searchParams.delete('tag')
      history.replaceState(null, '', url)
    }
  }

  apply(new URLSearchParams(location.search).get('tag') || '', false)
})()
