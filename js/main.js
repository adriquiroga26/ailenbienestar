// Menú mobile: abre/cierra y sincroniza aria-expanded para accesibilidad
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');

  if (!toggle || !menu) return;

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
  }

  function openMenu() {
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú');
  }

  toggle.addEventListener('click', function () {
    var isOpen = menu.classList.contains('is-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Cerrar el menú al elegir una sección (mejor experiencia en mobile)
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Cerrar con la tecla Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  // Animaciones al hacer scroll (respeta prefers-reduced-motion vía CSS)
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    // Sin soporte de IntersectionObserver: mostrar todo directamente
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Modal "Saber más" de cada servicio
  var overlay = document.getElementById('modalOverlay');
  var modalBody = document.getElementById('modalBody');
  var modalClose = document.getElementById('modalClose');
  var lastFocusedEl = null;

  function openModal(serviceId) {
    var template = document.getElementById('tpl-' + serviceId);
    if (!template || !overlay || !modalBody) return;

    modalBody.innerHTML = '';
    modalBody.appendChild(template.content.cloneNode(true));

    lastFocusedEl = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeModal() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  document.querySelectorAll('.card-link').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openModal(btn.getAttribute('data-service'));
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);

  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay && !overlay.hidden) closeModal();
  });

  // Foto del hero: se muestra solo si existe assets/img/hero.jpg
  var hero = document.querySelector('.hero');
  if (hero) {
    var heroImg = new Image();
    heroImg.onload = function () {
      var photo = document.createElement('div');
      photo.className = 'hero-photo';
      photo.setAttribute('aria-hidden', 'true');
      photo.style.backgroundImage = 'url(assets/img/hero.jpg)';
      hero.appendChild(photo);
      hero.classList.add('has-photo');
    };
    heroImg.src = 'assets/img/hero.jpg';
  }

  // Calendario de actividades (datos en js/actividades.js)
  var calEl = document.getElementById('calendar');
  var panelEl = document.getElementById('activityPanel');
  if (calEl && panelEl) {
    var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
      'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    var DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
    var DIAS_LARGO = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function keyOf(y, m, d) { return y + '-' + pad(m + 1) + '-' + pad(d); }
    function esc(t) {
      var d = document.createElement('div');
      d.textContent = t == null ? '' : String(t);
      return d.innerHTML;
    }

    // Agrupa las actividades por fecha (ignora entradas sin fecha o sin título)
    var byDate = {};
    (window.ACTIVIDADES || []).forEach(function (a) {
      if (!a || !/^\d{4}-\d{2}-\d{2}$/.test(a.fecha || '') || !a.titulo) return;
      (byDate[a.fecha] = byDate[a.fecha] || []).push(a);
    });

    var now = new Date();
    var todayKey = keyOf(now.getFullYear(), now.getMonth(), now.getDate());
    var upcoming = Object.keys(byDate).filter(function (k) { return k >= todayKey; }).sort();

    var selected = upcoming.length ? upcoming[0] : null;
    var viewYear = now.getFullYear();
    var viewMonth = now.getMonth();
    if (selected) {
      viewYear = parseInt(selected.slice(0, 4), 10);
      viewMonth = parseInt(selected.slice(5, 7), 10) - 1;
    }

    function prettyDate(key) {
      var y = parseInt(key.slice(0, 4), 10);
      var m = parseInt(key.slice(5, 7), 10) - 1;
      var d = parseInt(key.slice(8, 10), 10);
      var wd = new Date(y, m, d).getDay();
      return DIAS_LARGO[wd] + ' ' + d + ' de ' + MESES[m].charAt(0).toUpperCase() + MESES[m].slice(1) + ' de ' + y;
    }

    function renderPanel() {
      if (!selected || !byDate[selected]) {
        panelEl.innerHTML = '<p class="act-empty"><strong>Pronto sumaremos nuevas fechas</strong>' +
          'Escribime por WhatsApp y te aviso de las próximas actividades.</p>' +
          '<a class="btn btn-primary act-cta" href="https://wa.me/5493516767010" target="_blank" rel="noopener">Consultar por WhatsApp</a>';
        return;
      }
      panelEl.innerHTML = byDate[selected].map(function (a) {
        var msg = encodeURIComponent('Hola! Quiero más información y reservar para: ' + a.titulo + ' (' + prettyDate(selected) + ')');
        var html = '<h3 class="act-title"><svg class="lotus" aria-hidden="true"><use href="#i-lotus"/></svg>' + esc(a.titulo) + '</h3>' +
          '<ul class="act-meta"><li><span class="m-ico" aria-hidden="true">📅</span>' + esc(prettyDate(selected)) + '</li>';
        if (a.horario) html += '<li><span class="m-ico" aria-hidden="true">🕒</span>' + esc(a.horario) + '</li>';
        if (a.modalidad) html += '<li><span class="m-ico" aria-hidden="true">✦</span>Modalidad: ' + esc(a.modalidad) + '</li>';
        if (a.lugar) html += '<li><span class="m-ico" aria-hidden="true">📍</span>' + esc(a.lugar) + '</li>';
        html += '</ul><a class="btn btn-primary act-cta" href="https://wa.me/5493516767010?text=' + msg +
          '" target="_blank" rel="noopener">Más Información y Reservas <span aria-hidden="true">→</span></a>';
        return html;
      }).join('<hr class="act-sep">');
    }

    function renderCalendar() {
      var first = new Date(viewYear, viewMonth, 1);
      var offset = (first.getDay() + 6) % 7; // semana empieza en lunes
      var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      var html = '<div class="cal-head">' +
        '<button type="button" class="cal-nav" data-dir="-1" aria-label="Mes anterior">‹</button>' +
        '<strong>' + MESES[viewMonth] + ' ' + viewYear + '</strong>' +
        '<button type="button" class="cal-nav" data-dir="1" aria-label="Mes siguiente">›</button></div>' +
        '<div class="cal-grid">';
      DIAS.forEach(function (d) { html += '<span class="cal-dow">' + d + '</span>'; });

      var total = Math.ceil((offset + daysInMonth) / 7) * 7;
      for (var i = 0; i < total; i++) {
        var dt = new Date(viewYear, viewMonth, i - offset + 1);
        var inMonth = dt.getMonth() === viewMonth;
        var k = keyOf(dt.getFullYear(), dt.getMonth(), dt.getDate());
        var cls = 'cal-day';
        if (!inMonth) cls += ' is-out';
        if (k === todayKey) cls += ' is-today';
        if (inMonth && byDate[k]) {
          cls += ' has-event' + (k === selected ? ' is-selected' : '');
          html += '<button type="button" class="' + cls + '" data-date="' + k + '" aria-label="' +
            esc(prettyDate(k)) + ': ' + esc(byDate[k][0].titulo) + '">' + dt.getDate() + '</button>';
        } else {
          html += '<span class="' + cls + '">' + dt.getDate() + '</span>';
        }
      }
      html += '</div>';
      calEl.innerHTML = html;
    }

    calEl.addEventListener('click', function (e) {
      var nav = e.target.closest('.cal-nav');
      if (nav) {
        viewMonth += parseInt(nav.getAttribute('data-dir'), 10);
        if (viewMonth < 0) { viewMonth = 11; viewYear--; }
        if (viewMonth > 11) { viewMonth = 0; viewYear++; }
        renderCalendar();
        return;
      }
      var day = e.target.closest('.cal-day[data-date]');
      if (day) {
        selected = day.getAttribute('data-date');
        renderCalendar();
        renderPanel();
      }
    });

    renderCalendar();
    renderPanel();
  }

  // Año dinámico en el footer
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Botón volver arriba: aparece después de scrollear, y sube suave al hacer click
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('is-visible', window.scrollY > 500);
    });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Copiar el número de WhatsApp al portapapeles
  var copyBtn = document.querySelector('.copy-phone');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var phone = copyBtn.getAttribute('data-phone');
      var originalText = copyBtn.textContent;

      function showCopied() {
        copyBtn.textContent = '¡Copiado!';
        setTimeout(function () { copyBtn.textContent = originalText; }, 2000);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(phone).then(showCopied);
      } else {
        // Alternativa para navegadores muy viejos sin Clipboard API
        var tempInput = document.createElement('input');
        tempInput.value = phone;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showCopied();
      }
    });
  }

  // Scroll spy: marca el link del menú correspondiente a la sección visible
  var navLinks = document.querySelectorAll('#navMenu a[href^="#"]');
  var sections = [];
  navLinks.forEach(function (link) {
    var section = document.querySelector(link.getAttribute('href'));
    if (section) sections.push({ link: link, section: section });
  });

  if (sections.length && 'IntersectionObserver' in window) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var match = sections.find(function (s) { return s.section === entry.target; });
        if (!match) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          match.link.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(function (s) { spyObserver.observe(s.section); });
  }
});