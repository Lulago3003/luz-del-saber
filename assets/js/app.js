/* =========================================================
   Centro Educativo Luz del Saber — interacciones
   Lee contenido.json y llena la página con esos datos.
   Si el archivo no carga, se queda lo que ya trae el HTML.
   El panel para editar se abre con #admin (assets/js/admin.js).
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
    return String(txt == null ? '' : txt).replace(/[&<>"']/g, function (c) {
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

  /* ---------- Fechas ---------- */
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  function aFecha(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function diasDesdeHoy(f) { return Math.round((f - hoy) / 86400000); }
  function largo(f, conAnio) {
    return DIAS[f.getDay()] + ' ' + f.getDate() + ' de ' + MESES[f.getMonth()] + (conAnio ? ' de ' + f.getFullYear() : '');
  }

  $('#avisosHoy').textContent = 'Hoy es ' + largo(hoy);

  /* ---------- Temporada (patria / navidad / ninguna) ---------- */
  function temaActual() {
    return html.classList.contains('tema-patria') ? 'patria' : html.classList.contains('tema-navidad') ? 'navidad' : '';
  }
  function ponerTema(t) {
    html.classList.remove('tema-patria', 'tema-navidad');
    if (t === 'patria' || t === 'navidad') html.classList.add('tema-' + t);
    var color = $('meta[name="theme-color"]');
    if (color) color.content = t === 'navidad' ? '#0D2440' : '#CDEBFB';
  }
  ponerTema(temaActual());

  /* ---------- Año escolar al que se inscribe (en Panamá empieza en marzo) ---------- */
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

  /* ---------- Avisos y novedades ---------- */
  var TIPOS = {
    'sin-clases':    { nombre: 'No hay clases', color: 'rojo',     ico: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4M9.5 13l5 5M14.5 13l-5 5"/>' },
    'reunion':       { nombre: 'Reunión',       color: 'azul',     ico: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.9.2 5 2.5 5 5.8"/>' },
    'actividad':     { nombre: 'Actividad',     color: 'verde',    ico: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>' },
    'novedad':       { nombre: 'Novedad',       color: 'morado',   ico: '<path d="M3 10v4h3l6 4V6L6 10z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>' },
    'inscripciones': { nombre: 'Inscripciones', color: 'amarillo', ico: '<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4M10 12h6M10 16h6"/>' },
    'importante':    { nombre: 'Importante',    color: 'naranja',  ico: '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4.5M12 17.5v.01"/>' }
  };
  function tipoDe(a) { return TIPOS[a.tipo] || TIPOS.novedad; }
  function idDe(a) { return String(a.id || (a.titulo + '|' + (a.fecha || ''))); }

  // Un aviso con fecha se quita solo cuando pasa ("hasta", o la misma fecha si no hay "hasta")
  function vigente(a) {
    if (a.tema && a.tema !== temaActual()) return false;
    var fin = aFecha(a.hasta) || aFecha(a.fecha);
    return !fin || diasDesdeHoy(fin) >= 0;
  }

  // "Mañana · martes 3 de noviembre", "Hoy · hasta el jueves 5 de noviembre"…
  function cuando(a) {
    var ini = aFecha(a.fecha), fin = aFecha(a.hasta);
    if (!ini) return '';
    if (fin && diasDesdeHoy(fin) <= diasDesdeHoy(ini)) fin = null;
    var di = diasDesdeHoy(ini);
    var rel = di === 0 ? 'Hoy' : di === 1 ? 'Mañana' : di === 2 ? 'Pasado mañana' : '';
    var conAnio = ini.getFullYear() !== hoy.getFullYear();
    if (fin) {
      if (di <= 0) return 'Hoy · hasta el ' + largo(fin, conAnio);
      var mismoMes = ini.getMonth() === fin.getMonth();
      var rango = 'Del ' + DIAS[ini.getDay()] + ' ' + ini.getDate() + (mismoMes ? '' : ' de ' + MESES[ini.getMonth()]) + ' al ' + largo(fin, conAnio);
      return rel ? rel + ' · ' + rango.charAt(0).toLowerCase() + rango.slice(1) : rango;
    }
    var dia = largo(ini, conAnio);
    return rel ? rel + ' · ' + dia : dia.charAt(0).toUpperCase() + dia.slice(1);
  }

  function hojaHTML(a) {
    var ini = aFecha(a.fecha), fin = aFecha(a.hasta);
    if (!ini) return '<span class="aviso__ico" aria-hidden="true"><svg viewBox="0 0 24 24">' + tipoDe(a).ico + '</svg></span>';
    var dias = ini.getDate() + (fin && fin > ini && fin.getMonth() === ini.getMonth() ? '–' + fin.getDate() : '');
    return '<span class="aviso__hoja" aria-hidden="true"><small>' + MESES[ini.getMonth()].slice(0, 3) + '</small><b>' + dias + '</b></span>';
  }

  function ordenar(lista) {
    return lista.slice().sort(function (a, b) {
      if (!!b.destacado !== !!a.destacado) return b.destacado ? 1 : -1;
      var fa = aFecha(a.fecha), fb = aFecha(b.fecha);
      if (fa && fb) return fa - fb;
      if (fa) return -1;
      if (fb) return 1;
      return 0;
    });
  }

  // En el celular se muestran menos para no hacer la página tan larga
  var MAX_AVISOS = window.matchMedia('(max-width: 700px)').matches ? 3 : 6;
  function pintarAvisos() {
    if (!datos || !Array.isArray(datos.avisos)) return;
    var lista = ordenar(datos.avisos.filter(vigente));
    var box = $('#avisosLista');
    box.innerHTML = lista.map(function (a, i) {
      var t = tipoDe(a), q = cuando(a);
      return '<article class="aviso c-' + t.color + (a.destacado ? ' aviso--destacado' : '') + '"' + (i >= MAX_AVISOS ? ' data-extra hidden' : '') + '>' +
        hojaHTML(a) +
        '<div class="aviso__cuerpo">' +
          '<p class="aviso__meta"><span class="chip">' + esc(t.nombre) + '</span>' + (q ? '<span class="aviso__cuando">' + esc(q) + '</span>' : '') + '</p>' +
          '<h3>' + esc(a.titulo) + '</h3>' +
          (a.texto ? '<p>' + esc(a.texto) + '</p>' : '') +
        '</div>' +
      '</article>';
    }).join('');
    $('#avisosVacio').hidden = lista.length > 0;
    $('#avisosMas').hidden = lista.length <= MAX_AVISOS;
    pintarAlerta(lista.filter(function (a) { return a.destacado; }));
  }
  $('#avisosMas').addEventListener('click', function () {
    $$('#avisosLista [data-extra]').forEach(function (el) { el.hidden = false; });
    this.hidden = true;
  });

  // Barra de arriba con el aviso destacado más próximo. Se puede cerrar.
  var alerta = $('#alerta');
  function cerrados() {
    try { return JSON.parse(localStorage.getItem('lds_alertas_cerradas') || '[]'); } catch (e) { return []; }
  }
  function pintarAlerta(destacados) {
    var lista = cerrados();
    var a = destacados.filter(function (x) { return lista.indexOf(idDe(x)) < 0; })[0];
    alerta.hidden = !a;
    if (!a) return;
    var t = tipoDe(a), q = cuando(a);
    alerta.className = 'alerta c-' + t.color;
    alerta.setAttribute('data-id', idDe(a));
    $('#alertaTxt').innerHTML = (q ? '<b>' + esc(q.split(' · ')[0]) + ':</b> ' : '<b>' + esc(t.nombre) + ':</b> ') + esc(a.titulo) +
      (q.indexOf(' · ') > 0 ? ' <span class="alerta__fecha">(' + esc(q.split(' · ')[1]) + ')</span>' : '');
  }
  $('#alertaX').addEventListener('click', function () {
    var lista = cerrados();
    lista.push(alerta.getAttribute('data-id'));
    try { localStorage.setItem('lds_alertas_cerradas', JSON.stringify(lista.slice(-30))); } catch (e) { /* sin almacenamiento */ }
    alerta.hidden = true;
  });

  /* ---------- Aplicar contenido.json (también lo usa el panel para la vista previa) ---------- */
  function aplicar(json) {
    datos = json;
    var c = datos.contacto || {};

    // Temporada: la dirección (?tema=) manda; si no, lo que diga el archivo o la fecha
    if (!html.hasAttribute('data-tema-fijo')) {
      var temporada = datos.temporada || 'auto';
      ponerTema(temporada === 'auto' ? html.getAttribute('data-tema-auto') : temporada);
    }

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

    pintarAvisos();
  }

  window.LDS = { aplicar: aplicar, publicado: null, tipos: TIPOS };

  fetch('contenido.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (json) {
      window.LDS.publicado = json;
      aplicar(json);
      document.dispatchEvent(new Event('lds:listo'));
    })
    .catch(function () { /* sin archivo: se queda el contenido del HTML */ });

  /* ---------- Panel de administración (#admin) ---------- */
  function cargarPanel() {
    if (location.hash.toLowerCase() !== '#admin' || window.LDS.panel) return;
    window.LDS.panel = true;
    var s = document.createElement('script');
    s.src = 'assets/js/admin.js?v=1';
    document.body.appendChild(s);
  }
  window.addEventListener('hashchange', cargarPanel);
  cargarPanel();

  /* ---------- Fechas patrias y de diciembre: marcar la de hoy y la próxima ---------- */
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
