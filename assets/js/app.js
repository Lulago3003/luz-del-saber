/* =========================================================
   Centro Educativo Luz del Saber — interacciones
   Lee contenido.json y llena la página con esos datos.
   Si el archivo no carga, se queda lo que ya trae el HTML.
   ========================================================= */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var html = document.documentElement;

  var datos = null;

  /* ---------- Utilidades ---------- */
  function leer(obj, ruta) {
    return ruta.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }
  function esc(txt) {
    return String(txt).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function soloDigitos(txt) { return String(txt || '').replace(/\D/g, ''); }

  function numeroWa() { return soloDigitos(datos && datos.contacto && datos.contacto.whatsapp); }
  function enlaceWa(msg) {
    var n = numeroWa();
    if (!n) return '';
    return 'https://wa.me/' + n + (msg ? '?text=' + encodeURIComponent(msg) : '');
  }

  /* ---------- Temporada (patria / navidad / ninguna) ---------- */
  function temaActual() {
    return html.classList.contains('tema-patria') ? 'patria' : html.classList.contains('tema-navidad') ? 'navidad' : '';
  }
  function ponerTema(t) {
    html.classList.remove('tema-patria', 'tema-navidad');
    if (t === 'patria' || t === 'navidad') html.classList.add('tema-' + t);
  }

  /* ---------- Año escolar al que se inscribe (en Panamá empieza en marzo) ---------- */
  var hoy = new Date();
  var anioEscolar = hoy.getFullYear() + (hoy.getMonth() >= 8 ? 1 : 0);
  $$('[data-anio-escolar]').forEach(function (el) { el.textContent = anioEscolar; });

  /* ---------- Ubicación: mapa, Google Maps y Waze ---------- */
  function ubicacion() {
    var u = (datos && datos.ubicacion) || { lat: 8.9392252, lng: -79.642147, zona: 'Arraiján, Panamá Oeste' };
    var lat = parseFloat(u.lat), lng = parseFloat(u.lng);
    var hayPunto = isFinite(lat) && isFinite(lng);
    var texto = [u.direccion, u.zona, 'Panamá'].filter(Boolean).join(', ');
    return {
      exacta: hayPunto || !!u.direccion,
      embed: 'https://maps.google.com/maps?q=' + encodeURIComponent(hayPunto ? lat + ',' + lng : texto) +
        '&z=' + (hayPunto ? 17 : (u.direccion ? 15 : 10)) + '&hl=es&output=embed',
      maps: hayPunto
        ? 'https://www.google.com/maps/dir/?api=1&destination=' + lat + ',' + lng
        : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(texto),
      waze: hayPunto
        ? 'https://waze.com/ul?ll=' + lat + ',' + lng + '&navigate=yes'
        : 'https://waze.com/ul?q=' + encodeURIComponent(texto),
      texto: texto
    };
  }

  /* ---------- Aplicar contenido.json ---------- */
  function aplicar() {
    var c = datos.contacto || {};

    // Temporada: la dirección (?tema=) manda; si no, lo que diga el archivo
    var temporada = datos.temporada || 'auto';
    if (!html.hasAttribute('data-tema-fijo') && temporada !== 'auto') ponerTema(temporada);

    // Textos sueltos. Si el dato está vacío, se oculta su fila (o se lee "Por confirmar")
    $$('[data-c]').forEach(function (el) {
      var v = leer(datos, el.getAttribute('data-c'));
      var vacio = v == null || String(v).trim() === '';
      var fila = el.closest('[data-fila]');
      if (fila) fila.hidden = vacio;
      el.textContent = vacio ? (fila ? '' : 'Por confirmar') : v;
    });

    // Botones de WhatsApp: sin número, llevan al formulario
    var hayWa = !!numeroWa();
    $$('[data-wa]').forEach(function (a) {
      if (hayWa) {
        a.href = enlaceWa(a.getAttribute('data-wa-msg') || '¡Hola! 👋 Quisiera información sobre la escuela.');
        a.target = '_blank';
        a.rel = 'noopener';
      } else {
        a.href = '#contacto';
        a.removeAttribute('target');
      }
    });
    $('#waFloat').hidden = !hayWa;

    // Teléfono
    var tel = soloDigitos(c.telefono);
    $$('[data-tel]').forEach(function (a) { a.href = tel ? 'tel:+' + tel : '#contacto'; });

    // Mapa y botones
    var u = ubicacion();
    var mapa = $('#mapa');
    if (mapa.getAttribute('src') !== u.embed) mapa.src = u.embed;
    $('#btnMaps').href = u.maps;
    $('#btnWaze').href = u.waze;
    $('#mapaAviso').hidden = u.exacta;

    var refs = (datos.ubicacion && datos.ubicacion.referencias) || [];
    $('#refsBox').hidden = !refs.length;
    $('#refs').innerHTML = refs.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('');

    // Avisos: los que no dicen "tema" salen siempre; los demás, solo en su temporada
    if (Array.isArray(datos.avisos)) {
      var box = $('#avisos');
      box.innerHTML = datos.avisos.map(function (a) {
        return '<article class="aviso"' + (a.tema ? ' data-tema="' + esc(a.tema) + '"' : '') + '>' +
          (a.etiqueta ? '<p class="chip">' + esc(a.etiqueta) + '</p>' : '') +
          '<h3>' + esc(a.titulo || '') + '</h3>' +
          (a.texto ? '<p>' + esc(a.texto) + '</p>' : '') +
          '</article>';
      }).join('');
    }
    revisarAvisos();
  }

  function revisarAvisos() {
    var t = temaActual();
    var visibles = $$('#avisos .aviso').filter(function (a) {
      var tema = a.getAttribute('data-tema');
      return !tema || tema === t;
    });
    $('#avisos').closest('section').hidden = !visibles.length;
  }
  revisarAvisos();

  fetch('contenido.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (json) { datos = json; aplicar(); })
    .catch(function () { /* sin archivo: se queda el contenido del HTML */ });

  /* ---------- Fechas: marcar la de hoy y la próxima ---------- */
  $$('.fechas[data-mes]').forEach(function (lista) {
    var mes = +lista.getAttribute('data-mes');
    var items = $$('li', lista);
    var d = hoy.getDate(), proxima = null;
    if (hoy.getMonth() === mes) {
      items.forEach(function (li) {
        var dia = +li.getAttribute('data-dia');
        if (dia < d) li.classList.add('is-pasada');
        else if (dia === d) marcar(li, 'is-hoy', '¡Hoy!');
        else if (!proxima) proxima = li;
      });
      if (proxima && !$('.is-hoy', lista)) marcar(proxima, 'is-proxima', 'Próxima');
    } else if ((hoy.getMonth() + 1) % 12 === mes && items[0]) {
      marcar(items[0], 'is-proxima', 'Ya viene');
    }
  });
  function marcar(li, clase, txt) {
    li.classList.add(clase);
    var s = document.createElement('span');
    s.className = 'etiqueta-fecha';
    s.textContent = txt;
    li.appendChild(s);
  }

  /* ---------- Letras que brincan ---------- */
  $$('.letras i').forEach(function (el, i) { el.style.setProperty('--n', i); });

  /* ---------- Menú en el celular ---------- */
  var burger = $('#burger'), nav = $('#nav');
  function cerrarMenu() {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menú');
  }
  burger.addEventListener('click', function () {
    var abierto = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(abierto));
    burger.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', cerrarMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarMenu(); });

  /* ---------- Encabezado con sombra al bajar ---------- */
  var top = $('#top');
  function alBajar() { top.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', alBajar, { passive: true });
  alBajar();

  /* ---------- Sección activa en el menú y aparición al bajar ---------- */
  if ('IntersectionObserver' in window) {
    var links = $$('.nav ul a');
    var vigia = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { vigia.observe(s); });

    var aparece = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); aparece.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(function (el) { aparece.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Compartir ubicación ---------- */
  $('#btnCompartir').addEventListener('click', function () {
    var label = $('span', this);
    var u = ubicacion();
    var texto = 'Centro Educativo Luz del Saber — ' + u.texto;
    function aviso(t) {
      var antes = label.textContent;
      label.textContent = t;
      setTimeout(function () { label.textContent = antes; }, 2200);
    }
    if (navigator.share) {
      navigator.share({ title: 'Centro Educativo Luz del Saber', text: texto, url: u.maps }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(texto + '\n' + u.maps)
        .then(function () { aviso('¡Enlace copiado!'); })
        .catch(function () { window.open(u.maps, '_blank', 'noopener'); });
    } else {
      window.open(u.maps, '_blank', 'noopener');
    }
  });

  /* ---------- Formulario → WhatsApp ---------- */
  var form = $('#form'), msg = $('#formMsg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var faltan = ['acudiente', 'nino', 'grado'].filter(function (n) {
      var el = form.elements[n];
      var vacio = !el.value.trim();
      el.setAttribute('aria-invalid', String(vacio));
      return vacio;
    });
    msg.classList.remove('es-info');
    if (faltan.length) {
      msg.textContent = 'Completa tu nombre, el del niño o niña y el grado.';
      msg.hidden = false;
      form.elements[faltan[0]].focus();
      return;
    }
    if (!numeroWa()) {
      msg.textContent = '¡Gracias! Muy pronto podrás enviarnos tu mensaje por WhatsApp desde aquí. Mientras tanto, te esperamos en la escuela.';
      msg.classList.add('es-info');
      msg.hidden = false;
      return;
    }
    msg.hidden = true;
    var f = form.elements;
    var texto = '¡Hola! 👋 Me interesa que mi hijo/a estudie en Luz del Saber.\n\n' +
      '• Acudiente: ' + f.acudiente.value.trim() + '\n' +
      '• Niño o niña: ' + f.nino.value.trim() + '\n' +
      '• Grado: ' + f.grado.value +
      (f.mensaje.value.trim() ? '\n\n' + f.mensaje.value.trim() : '');
    window.open(enlaceWa(texto), '_blank', 'noopener');
  });
  $$('input, select, textarea', form).forEach(function (el) {
    el.addEventListener('input', function () { el.removeAttribute('aria-invalid'); });
  });

  /* ---------- Año en el pie ---------- */
  $('#anio').textContent = hoy.getFullYear();
})();
