;(function () {
  // Tag filter for projects.html. The tags themselves live in the HTML (the
  // .project-tag items on each card), so adding a project only means writing
  // its card; the filter buttons are built from whatever tags the cards carry.
  var bar = document.getElementById('project-filter')
  var list = document.querySelector('.project-card-list')
  if (!bar || !list) return

  // Tags that go in a pulldown instead of getting their own button. The key is
  // the pulldown's name; picking its "All" entry filters by that tag itself.
  var GROUPS = {
    Software: ['Python', 'HTML/JS', 'C++', 'React', 'TypeScript']
  }

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
  function byUse(a, b) {
    return counts[b] - counts[a] || order.indexOf(a) - order.indexOf(b)
  }

  var groupOf = {}
  Object.keys(GROUPS).forEach(function (group) {
    GROUPS[group].forEach(function (tag) {
      groupOf[tag] = group
    })
  })

  var active = ''
  var filterButtons = [] // every button that selects a tag, pulldown entries included
  var pulldowns = []

  function makeButton(label, tag, count, className) {
    var btn = document.createElement('button')
    btn.type = 'button'
    btn.className = className
    btn.dataset.tag = tag
    btn.textContent = label
    var n = document.createElement('span')
    n.className = 'project-filter-count'
    n.textContent = count
    btn.appendChild(n)
    btn.addEventListener('click', function () {
      closePulldowns()
      apply(tag === active ? '' : tag, true)
    })
    filterButtons.push(btn)
    return btn
  }

  function makePulldown(group) {
    var members = GROUPS[group].filter(function (tag) {
      return counts[tag]
    }).sort(byUse)

    var wrap = document.createElement('div')
    wrap.className = 'project-filter-group'

    var toggle = document.createElement('button')
    toggle.type = 'button'
    toggle.className = 'project-filter-btn project-filter-toggle'
    toggle.setAttribute('aria-expanded', 'false')
    var label = document.createElement('span')
    var caret = document.createElement('span')
    caret.className = 'project-filter-caret'
    caret.setAttribute('aria-hidden', 'true')
    toggle.appendChild(label)
    toggle.appendChild(caret)

    var menu = document.createElement('div')
    menu.className = 'project-filter-menu'
    menu.id = 'project-filter-menu-' + pulldowns.length
    menu.hidden = true
    toggle.setAttribute('aria-controls', menu.id)
    if (counts[group]) {
      menu.appendChild(makeButton('All ' + group.toLowerCase(), group, counts[group], 'project-filter-item'))
    }
    members.forEach(function (tag) {
      menu.appendChild(makeButton(tag, tag, counts[tag], 'project-filter-item'))
    })

    toggle.addEventListener('click', function () {
      var open = menu.hidden
      closePulldowns()
      if (open) {
        menu.hidden = false
        toggle.setAttribute('aria-expanded', 'true')
        var current = menu.querySelector('[aria-pressed="true"]') || menu.firstChild
        if (current) current.focus()
      }
    })

    wrap.appendChild(toggle)
    wrap.appendChild(menu)
    var pd = { group: group, members: members, wrap: wrap, toggle: toggle, label: label, menu: menu }
    pulldowns.push(pd)
    return wrap
  }

  function closePulldowns() {
    pulldowns.forEach(function (pd) {
      pd.menu.hidden = true
      pd.toggle.setAttribute('aria-expanded', 'false')
    })
  }

  document.addEventListener('click', function (e) {
    if (!pulldowns.some(function (pd) { return pd.wrap.contains(e.target) })) closePulldowns()
  })
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return
    pulldowns.forEach(function (pd) {
      if (!pd.menu.hidden) {
        closePulldowns()
        pd.toggle.focus()
      }
    })
  })

  // A pulldown takes the place its busiest tag (itself or a member) would have had.
  var entries = order.filter(function (tag) {
    return !groupOf[tag] && !GROUPS[tag]
  })
  Object.keys(GROUPS).forEach(function (group) {
    var used = [group].concat(GROUPS[group]).filter(function (tag) {
      return counts[tag]
    })
    if (used.length) entries.push({ group: group, rank: used.sort(byUse)[0] })
  })
  entries.sort(function (a, b) {
    return byUse(a.rank || a, b.rank || b)
  })

  bar.appendChild(makeButton('All', '', cards.length, 'project-filter-btn'))
  entries.forEach(function (entry) {
    if (entry.group) bar.appendChild(makePulldown(entry.group))
    else bar.appendChild(makeButton(entry, entry, counts[entry], 'project-filter-btn'))
  })
  bar.hidden = false

  function apply(tag, updateUrl) {
    if (tag && !counts[tag]) tag = ''
    active = tag
    filterButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.tag === tag))
    })
    pulldowns.forEach(function (pd) {
      var inside = tag === pd.group || pd.members.indexOf(tag) !== -1
      pd.toggle.classList.toggle('is-active', inside)
      pd.label.textContent = inside && tag !== pd.group ? pd.group + ': ' + tag : pd.group
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
