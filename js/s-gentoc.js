(function () {
  if (true) {
    // console.log('initSubHeaders?')
    initSubHeaders()
  }

/**
 * Sub headers in sidebar
 */

function initSubHeaders () {
  // console.log('initSubHeaders...')
  var each = [].forEach
  // var main = document.getElementById('main')
  var header = document.getElementById('header')
  var the_sidebar = document.querySelector('.l-side')
  var the_content = document.querySelector('#post-content')

  // build sidebar
  var currentPageAnchor = the_sidebar.querySelector('.u-navitem.z-current')
  var contentClasses = document.querySelector('#post-content').classList
  if (currentPageAnchor) {
    // console.log('currentPageAnchor!')
    var allHeaders = []
    var sectionContainer

    sectionContainer = document.createElement('ul')
    sectionContainer.className = 'u-toctree'
    currentPageAnchor.appendChild(sectionContainer)

    var headers = the_content.querySelectorAll('h2')
    if (headers.length) {
      each.call(headers, function (h) {
        // console.log('find h2')
        sectionContainer.appendChild(makeLink(h))
        var h3s = collectH3s(h)
        allHeaders.push(h)
        allHeaders.push.apply(allHeaders, h3s)
        if (h3s.length) {
          sectionContainer.appendChild(makeSubLinks(h3s, false))
        }
      })
    } else {
      headers = the_content.querySelectorAll('h3')
      each.call(headers, function (h) {
        sectionContainer.appendChild(makeLink(h))
        allHeaders.push(h)
      })
    }

    var animating = false
    sectionContainer.addEventListener('click', function (e) {

      // Not prevent hashchange for smooth-scroll
      // e.preventDefault()

      if (e.target.parentNode.classList.contains('u-tocitem')) {
        // the_sidebar.classList.remove('open')
        setActive(e.target)
        animating = true
        setTimeout(function () {
          animating = false
        }, 400)
      }
    }, true)

    // make links clickable
    allHeaders
      .filter(function(el) {
        if (!el.querySelector('a')) {
          return false
        }
        var demos = [].slice.call(document.querySelectorAll('demo'))
        return !demos.some(function(demoEl) {
          return demoEl.contains(el)
        })
      })
      .forEach(makeHeaderClickable)

    // smoothScroll.init({
    //   speed: 400,
    //   offset: 0
    // })
  }

  var hoveredOverSidebar = false
  the_sidebar.addEventListener('mouseover', function () {
    hoveredOverSidebar = true
  })
  the_sidebar.addEventListener('mouseleave', function () {
    hoveredOverSidebar = false
  })

  // listen for scroll event to do positioning & highlights
  document.querySelector('.l-pagewrap').addEventListener('scroll', updateSidebar)
  window.addEventListener('resize', updateSidebar)

  function updateSidebar () {
    var doc = document.querySelector('.l-pagewrap') // document.documentElement
    var top = doc && doc.scrollTop || document.body.scrollTop
    if (animating || !allHeaders) return
    var last
    for (var i = 0; i < allHeaders.length; i++) {
      var link = allHeaders[i]
      if (link.offsetTop > top) {
        if (!last) last = link
        break
      } else {
        last = link
      }
    }
    if (last)
      // console.log(last)
      setActive(last.childNodes[0].id, !hoveredOverSidebar)
  }

  function makeLink (h) {
    var link = document.createElement('li')
    window.arst = h
    var text = [].slice.call(h.childNodes).map(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.nodeValue
      } else if (['CODE', 'SPAN'].indexOf(node.tagName) !== -1) {
        return node.textContent
      } else {
        return ''
      }
    }).join('').replace(/\(.*\)$/, '')
    link.classList.add('u-tocitem')
    link.innerHTML =
      '<a data-scroll href="#' + h.childNodes[0].id + '">' +
        htmlEscape(text) +
      '</a>'
    return link
  }

  function htmlEscape (text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  function collectH3s (h) {
    var h3s = []
    var next = h.nextSibling
    while (next && next.tagName !== 'H2') {
      if (next.tagName === 'H3') {
        h3s.push(next)
      }
      next = next.nextSibling
    }
    return h3s
  }

  function makeSubLinks (h3s, small) {
    var container = document.createElement('ul')
    if (small) {
      container.className = 'u-toctree'
    }
    h3s.forEach(function (h) {
      container.appendChild(makeLink(h))
    })
    return container
  }

  function setActive (id, shouldScrollIntoView) {
    var previousActive
    if (null != the_sidebar.querySelector('.u-tocitem.z-current')) {
      previousActive = the_sidebar.querySelector('.u-tocitem.z-current').querySelector('a')
    }
    else {
      previousActive = the_sidebar.querySelector('.u-tocitem').querySelector('a')
    }
    var currentActive = typeof id === 'string'
      ? the_sidebar.querySelector('a[href="#' + id + '"]')
      : id
    if (currentActive !== previousActive) {
      if (previousActive) previousActive.parentNode.classList.remove('z-current')
      currentActive.parentNode.classList.add('z-current')
      if (shouldScrollIntoView) {
        var currentPageOffset = currentPageAnchor
          ? currentPageAnchor.offsetTop - 8
          : 0
        var currentActiveOffset = currentActive.offsetTop + currentActive.parentNode.clientHeight
        var sidebarHeight = the_sidebar.clientHeight
        // console.log('currentActive.offsetTop == '+currentActive.offsetTop)
        // console.log('the_sidebar.scrollTop   == '+the_sidebar.scrollTop)
        // console.log('currentActiveOffset     == '+currentActiveOffset)
        // console.log('sidebarHeight           == '+sidebarHeight)
        var currentActiveIsInView = (
          currentActive.offsetTop >= the_sidebar.scrollTop &&
          currentActiveOffset <= the_sidebar.scrollTop + sidebarHeight
        )
        var linkNotFurtherThanSidebarHeight = currentActiveOffset - currentPageOffset < sidebarHeight
        var newScrollTop = currentActiveIsInView
          ? the_sidebar.scrollTop
          : linkNotFurtherThanSidebarHeight
            ? currentPageOffset
            : currentActiveOffset - sidebarHeight
        the_sidebar.scrollTop = newScrollTop
      }
    }
  }

  function makeHeaderClickable (header) {
    var link = header.querySelector('a')
    link.setAttribute('data-scroll', '')

    // transform DOM structure from
    // `<h2><a></a>Header</a>` to <h2><a>Header</a></h2>`
    // to make the header clickable
    var nodes = Array.prototype.slice.call(header.childNodes)
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i]
      if (node !== link) {
        link.appendChild(node)
      }
    }
  }

  // console.log('initSubHeaders!')
}

})()