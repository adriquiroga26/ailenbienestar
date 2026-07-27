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