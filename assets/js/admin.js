/* =========================================================
   Centro Educativo Luz del Saber — panel de administración
   ---------------------------------------------------------
   Se abre agregando #admin al final de la dirección:
   .../luz-del-saber/#admin

   Cómo funciona:
   1. La escuela escribe avisos (no hay clases, reuniones,
      actividades, novedades) y cambia sus datos. Los cambios
      se ven al instante en la página (borrador guardado en su
      propio navegador).
   2. "Publicar" sube contenido.json a GitHub con un token que
      se guarda una sola vez. Ahí lo ve todo el mundo.
   3. Sin token, "Descargar archivo" genera el contenido.json
      para mandárselo a quien administra la web.

   OJO: la clave de abajo solo evita que alguien entre por
   curiosidad — no es seguridad real, porque el código de una
   web estática siempre se puede leer. Lo que de verdad
   protege la publicación es el token de GitHub.
   ========================================================= */

const PANEL = {
  // SHA-256 de la clave. Por defecto: luzdelsaber2026
  claveHash: '7ce96ad97130bec82199de4eeee5f1ee4ae9fc10c6377cdf748809c4a898b514',
  repoDueno: 'Lulago3003',
  repoNombre: 'luz-del-saber',
  archivo: 'contenido.json'
};

(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clon = o => JSON.parse(JSON.stringify(o));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sha256 = async txt => {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  };
  const guardar = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } };
  const leerLS = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };

  /* ---------- Fechas ---------- */
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const iso = f => `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
  const aFecha = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
  const largo = f => `${DIAS[f.getDay()]} ${f.getDate()} de ${MESES[f.getMonth()]}`;
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy); manana.setDate(hoy.getDate() + 1);
  const yaPaso = a => { const fin = aFecha(a.hasta) || aFecha(a.fecha); return !!fin && fin < hoy; };

  const TIPOS = (window.LDS && window.LDS.tipos) || {};
  const nombreTipo = t => (TIPOS[t] || TIPOS.novedad || { nombre: t }).nombre;
  const colorTipo = t => (TIPOS[t] || TIPOS.novedad || { color: 'morado' }).color;

  /* ---------- Atajos para escribir avisos rápido ---------- */
  const ATAJOS = [
    { id: 'manana', txt: 'No hay clases mañana', aviso: () => ({ tipo: 'sin-clases', titulo: 'No hay clases', texto: `Mañana ${largo(manana)} no habrá clases.`, fecha: iso(manana), destacado: true }) },
    { id: 'dia', txt: 'No hay clases un día', aviso: () => ({ tipo: 'sin-clases', titulo: 'No hay clases', texto: 'Ese día no habrá clases.', fecha: '', destacado: true }) },
    { id: 'reunion', txt: 'Reunión de padres', aviso: () => ({ tipo: 'reunion', titulo: 'Reunión de padres de familia', texto: 'Los esperamos en la escuela a las ___. Es importante su asistencia.', fecha: '', destacado: false }) },
    { id: 'actividad', txt: 'Actividad', aviso: () => ({ tipo: 'actividad', titulo: '', texto: '', fecha: '', destacado: false }) },
    { id: 'novedad', txt: 'Novedad', aviso: () => ({ tipo: 'novedad', titulo: '', texto: '', fecha: '', destacado: false }) }
  ];

  let panel = null;
  let datos = null;
  let editando = null; // id del aviso que se está editando, o 'nuevo'

  /* ---------- Abrir / cerrar ---------- */
  const esRutaAdmin = () => location.hash.toLowerCase() === '#admin';

  function abrir() {
    if (!panel) construir();
    panel.hidden = false;
    document.body.classList.add('adm-abierto');
  }
  function cerrar() {
    if (panel) panel.hidden = true;
    document.body.classList.remove('adm-abierto');
    if (esRutaAdmin()) history.replaceState(null, '', location.pathname + location.search);
  }
  addEventListener('hashchange', () => (esRutaAdmin() ? abrir() : cerrar()));

  function construir() {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'assets/css/admin.css?v=1';
    document.head.appendChild(css);

    panel = document.createElement('div');
    panel.className = 'adm';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Panel de la escuela');
    panel.hidden = true;
    document.body.appendChild(panel);
    pintarCandado();
  }

  /* ---------- Clave ---------- */
  function pintarCandado() {
    panel.innerHTML = `
      <div class="adm__candado">
        <svg class="adm__buho" viewBox="0 0 120 130" aria-hidden="true"><use href="#buho"/></svg>
        <h2>Panel de Luz del Saber</h2>
        <p>Escribe la clave para publicar avisos y cambiar los datos de la página.</p>
        <form id="admLogin">
          <label class="adm__campo">Clave
            <input type="password" id="admClave" autocomplete="current-password" required>
          </label>
          <p class="adm__error" id="admError" role="alert"></p>
          <button class="btn btn--rojo btn--full" type="submit">Entrar</button>
          <button class="btn btn--linea btn--full" type="button" id="admSalir">Volver a la página</button>
        </form>
      </div>`;
    $('#admSalir', panel).addEventListener('click', cerrar);
    $('#admLogin', panel).addEventListener('submit', async e => {
      e.preventDefault();
      if (await sha256($('#admClave', panel).value) === PANEL.claveHash) {
        pintarEditor();
      } else {
        $('#admError', panel).textContent = 'Esa clave no es. Intenta de nuevo.';
        $('#admClave', panel).select();
      }
    });
    setTimeout(() => $('#admClave', panel)?.focus(), 50);
  }

  /* ---------- Editor ---------- */
  function pintarEditor() {
    let borrador = null;
    try { borrador = JSON.parse(leerLS('lds_borrador') || 'null'); } catch (e) { /* borrador dañado */ }
    datos = clon(borrador || window.LDS.publicado || {});
    datos.contacto = datos.contacto || {};
    datos.ubicacion = datos.ubicacion || {};
    datos.avisos = datos.avisos || [];
    datos.temporada = datos.temporada || 'auto';
    if (borrador) window.LDS.aplicar(clon(datos));

    const c = datos.contacto, u = datos.ubicacion;
    const local = n => String(n || '').replace(/\D/g, '').replace(/^507/, '');

    panel.innerHTML = `
      <div class="adm__barra">
        <div class="adm__barra-in">
          <p class="adm__titulo">Panel · Luz del Saber</p>
          <button class="btn btn--linea adm__btn-sm" id="admVer" type="button">Ver la página</button>
        </div>
        <p class="adm__estado" id="admEstado" role="status">${borrador ? 'Tienes cambios sin publicar' : ''}</p>
      </div>

      <div class="adm__cuerpo">
        <section class="adm__caja">
          <h3>Avisos</h3>
          <p class="adm__ayuda">Lo que escribas aquí sale en la sección «Avisos y novedades». Los avisos con fecha se quitan solos cuando pasa el día.</p>
          <p class="adm__sub">Escribir uno rápido:</p>
          <div class="adm__atajos">
            ${ATAJOS.map(a => `<button class="adm__atajo" type="button" data-atajo="${a.id}">${esc(a.txt)}</button>`).join('')}
          </div>
          <div id="admFormAviso"></div>
          <ul class="adm__lista" id="admLista"></ul>
        </section>

        <section class="adm__caja">
          <h3>Datos de contacto</h3>
          <div class="adm__fila2">
            <label class="adm__campo">WhatsApp de la escuela
              <input id="admWa" inputmode="numeric" placeholder="6000-0000" value="${esc(local(c.whatsapp))}">
              <small>Solo los 8 números. Con esto se activan todos los botones de WhatsApp.</small>
            </label>
            <label class="adm__campo">Teléfono fijo <span class="adm__opc">(opcional)</span>
              <input id="admTel" inputmode="numeric" placeholder="200-0000" value="${esc(local(c.telefono))}">
            </label>
          </div>
          <label class="adm__campo">Horario de atención
            <input id="admHorario" placeholder="Lunes a viernes, 7:00 a.m. – 12:00 m." value="${esc(c.horario)}">
          </label>
          <label class="adm__campo">Dirección <span class="adm__opc">(opcional)</span>
            <input id="admDir" placeholder="Barriada, calle" value="${esc(u.direccion)}">
          </label>
          <label class="adm__campo">Referencias para llegar <span class="adm__opc">(una por línea)</span>
            <textarea id="admRefs" rows="3" placeholder="Frente a la tienda…">${esc((u.referencias || []).join('\n'))}</textarea>
          </label>
        </section>

        <section class="adm__caja">
          <h3>Decoración de temporada</h3>
          <div class="adm__opciones" role="radiogroup" aria-label="Decoración de temporada">
            ${[['auto', 'Automática', 'Fiestas patrias en noviembre y Navidad en diciembre'], ['patria', 'Fiestas patrias', 'Banderines y sección de noviembre'], ['navidad', 'Navidad', 'Luces, nieve y sección de diciembre'], ['ninguna', 'Sin decoración', 'La página normal']]
              .map(([v, t, d]) => `<label class="adm__opcion"><input type="radio" name="admTemp" value="${v}" ${datos.temporada === v ? 'checked' : ''}><span><b>${t}</b><small>${d}</small></span></label>`).join('')}
          </div>
        </section>

        <section class="adm__caja adm__caja--publicar">
          <h3>Publicar</h3>
          <p class="adm__ayuda">Los cambios ya se ven en esta pantalla, pero para que los vea todo el mundo hay que publicarlos.</p>
          <label class="adm__campo">Token de GitHub
            <input id="admToken" type="password" autocomplete="off" value="${esc(leerLS('lds_gh_token') || '')}">
            <small>Se guarda solo en este celular o computadora. Lo da quien administra la página.</small>
          </label>
          <button class="btn btn--verde btn--full" id="admPublicar" type="button">Publicar en la página</button>
          <div class="adm__fila2">
            <button class="btn btn--linea btn--full" id="admDescargar" type="button">Descargar archivo</button>
            <button class="btn btn--linea btn--full" id="admDescartar" type="button">Descartar cambios</button>
          </div>
          <button class="adm__link" id="admOlvidar" type="button">Borrar el token de este aparato</button>
        </section>
      </div>`;

    pintarLista();

    $('#admVer', panel).addEventListener('click', cerrar);

    $$('[data-atajo]', panel).forEach(b => b.addEventListener('click', () => {
      const a = ATAJOS.find(x => x.id === b.dataset.atajo);
      formAviso(a.aviso(), 'nuevo');
    }));

    // Contacto
    const tel8 = d => d.length === 8 ? `${d.slice(0, 4)}-${d.slice(4)}` : d.length === 7 ? `${d.slice(0, 3)}-${d.slice(3)}` : d;
    $('#admWa', panel).addEventListener('input', e => {
      const d = e.target.value.replace(/\D/g, '').replace(/^507/, '');
      datos.contacto.whatsapp = d ? '507' + d : '';
      datos.contacto.whatsappVisible = d ? '+507 ' + tel8(d) : '';
      cambio();
    });
    $('#admTel', panel).addEventListener('input', e => {
      const d = e.target.value.replace(/\D/g, '').replace(/^507/, '');
      datos.contacto.telefono = d ? '507' + d : '';
      datos.contacto.telefonoVisible = d ? '+507 ' + tel8(d) : '';
      cambio();
    });
    $('#admHorario', panel).addEventListener('input', e => { datos.contacto.horario = e.target.value; cambio(); });
    $('#admDir', panel).addEventListener('input', e => { datos.ubicacion.direccion = e.target.value; cambio(); });
    $('#admRefs', panel).addEventListener('input', e => {
      datos.ubicacion.referencias = e.target.value.split('\n').map(x => x.trim()).filter(Boolean);
      cambio();
    });

    // Temporada
    $$('input[name="admTemp"]', panel).forEach(r => r.addEventListener('change', () => { datos.temporada = r.value; cambio(); }));

    // Publicar
    $('#admPublicar', panel).addEventListener('click', publicar);
    $('#admDescargar', panel).addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(limpio(), null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'contenido.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      estado('Archivo descargado', 'ok');
    });
    $('#admDescartar', panel).addEventListener('click', () => {
      if (!confirm('¿Seguro? Se pierden los cambios que no hayas publicado.')) return;
      guardar('lds_borrador', null);
      if (window.LDS.publicado) window.LDS.aplicar(clon(window.LDS.publicado));
      pintarEditor();
      estado('Cambios descartados', 'ok');
    });
    $('#admOlvidar', panel).addEventListener('click', () => {
      guardar('lds_gh_token', null);
      $('#admToken', panel).value = '';
      estado('Token borrado de este aparato', 'ok');
    });
  }

  /* ---------- Lista de avisos ---------- */
  function pintarLista() {
    const ul = $('#admLista', panel);
    if (!datos.avisos.length) {
      ul.innerHTML = '<li class="adm__vacio">Todavía no hay avisos.</li>';
      return;
    }
    ul.innerHTML = datos.avisos.map((a, i) => {
      const f = aFecha(a.fecha), h = aFecha(a.hasta);
      const fecha = f ? (h && h > f ? `${DIAS[f.getDay()]} ${f.getDate()} al ${largo(h)}` : largo(f)) : '';
      const extras = [
        yaPaso(a) ? '<span class="adm__tag adm__tag--gris">Ya pasó</span>' : '',
        a.destacado ? '<span class="adm__tag">Arriba</span>' : '',
        a.tema === 'navidad' ? '<span class="adm__tag adm__tag--gris">Solo en Navidad</span>' : '',
        a.tema === 'patria' ? '<span class="adm__tag adm__tag--gris">Solo en fiestas patrias</span>' : ''
      ].join('');
      return `<li class="adm__aviso c-${colorTipo(a.tipo)}${yaPaso(a) ? ' es-pasado' : ''}">
        <div>
          <p class="adm__aviso-meta"><span class="chip">${esc(nombreTipo(a.tipo))}</span>${fecha ? `<span>${esc(fecha)}</span>` : ''}${extras}</p>
          <p class="adm__aviso-t">${esc(a.titulo || '(sin título)')}</p>
        </div>
        <div class="adm__aviso-btns">
          <button type="button" data-editar="${i}">Editar</button>
          <button type="button" data-borrar="${i}" class="adm__borrar">Borrar</button>
        </div>
      </li>`;
    }).join('');

    $$('[data-editar]', ul).forEach(b => b.addEventListener('click', () => {
      const a = datos.avisos[+b.dataset.editar];
      formAviso(clon(a), a.id || +b.dataset.editar);
    }));
    $$('[data-borrar]', ul).forEach(b => b.addEventListener('click', () => {
      const a = datos.avisos[+b.dataset.borrar];
      if (!confirm(`¿Borrar el aviso «${a.titulo}»?`)) return;
      datos.avisos.splice(+b.dataset.borrar, 1);
      pintarLista();
      cambio();
    }));
  }

  /* ---------- Formulario de un aviso ---------- */
  function formAviso(a, id) {
    editando = id;
    const box = $('#admFormAviso', panel);
    box.innerHTML = `
      <form class="adm__form-aviso" id="admAviso">
        <p class="adm__form-t">${id === 'nuevo' ? 'Nuevo aviso' : 'Editar aviso'}</p>
        <label class="adm__campo">Tipo
          <select id="avTipo">
            ${Object.keys(TIPOS).map(k => `<option value="${k}" ${a.tipo === k ? 'selected' : ''}>${esc(TIPOS[k].nombre)}</option>`).join('')}
          </select>
        </label>
        <label class="adm__campo">Título
          <input id="avTitulo" required value="${esc(a.titulo)}" placeholder="Ej.: No hay clases">
        </label>
        <label class="adm__campo">Mensaje
          <textarea id="avTexto" rows="3" placeholder="Ej.: Mañana 12 de julio no habrá clases.">${esc(a.texto)}</textarea>
        </label>
        <div class="adm__fila2">
          <label class="adm__campo">¿Para qué día? <span class="adm__opc">(opcional)</span>
            <input id="avFecha" type="date" value="${esc(a.fecha)}">
          </label>
          <label class="adm__campo">Hasta <span class="adm__opc">(si dura varios días)</span>
            <input id="avHasta" type="date" value="${esc(a.hasta)}">
          </label>
        </div>
        <label class="adm__check"><input type="checkbox" id="avDestacado" ${a.destacado ? 'checked' : ''}> Mostrarlo también arriba de la página, como aviso importante</label>
        <p class="adm__error" id="avError" role="alert"></p>
        <div class="adm__fila2">
          <button class="btn btn--rojo btn--full" type="submit">Guardar aviso</button>
          <button class="btn btn--linea btn--full" type="button" id="avCancelar">Cancelar</button>
        </div>
      </form>`;

    const f = $('#admAviso', box);
    f.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => $('#avTitulo', f).focus({ preventScroll: true }), 300);

    $('#avCancelar', f).addEventListener('click', () => { box.innerHTML = ''; editando = null; });
    f.addEventListener('submit', e => {
      e.preventDefault();
      const nuevo = {
        id: a.id || 'a' + Date.now(),
        tipo: $('#avTipo', f).value,
        titulo: $('#avTitulo', f).value.trim(),
        texto: $('#avTexto', f).value.trim()
      };
      if (!nuevo.titulo) {
        $('#avError', f).textContent = 'Ponle un título al aviso.';
        $('#avTitulo', f).focus();
        return;
      }
      const fecha = $('#avFecha', f).value, hasta = $('#avHasta', f).value;
      if (fecha) nuevo.fecha = fecha;
      if (hasta && (!fecha || hasta > fecha)) nuevo.hasta = hasta;
      if ($('#avDestacado', f).checked) nuevo.destacado = true;
      if (a.tema) nuevo.tema = a.tema;

      if (editando === 'nuevo') datos.avisos.unshift(nuevo);
      else {
        const i = datos.avisos.findIndex((x, n) => (x.id || n) === editando);
        if (i >= 0) datos.avisos[i] = nuevo; else datos.avisos.unshift(nuevo);
      }
      box.innerHTML = '';
      editando = null;
      pintarLista();
      cambio();
      estado('Aviso guardado. Falta publicarlo.', '');
    });
  }

  /* ---------- Borrador y vista previa ---------- */
  function limpio() {
    const d = clon(datos);
    delete d._ayuda;
    return d;
  }
  function cambio() {
    const d = limpio();
    guardar('lds_borrador', JSON.stringify(d));
    window.LDS.aplicar(clon(d));
    estado('Tienes cambios sin publicar');
  }
  function estado(txt, tipo = '') {
    const el = $('#admEstado', panel);
    if (!el) return;
    el.textContent = txt;
    el.className = `adm__estado ${tipo}`;
  }

  /* ---------- Publicar en GitHub ---------- */
  async function publicar() {
    const token = $('#admToken', panel).value.trim();
    if (!token) {
      estado('Falta el token de GitHub para publicar', 'err');
      $('#admToken', panel).focus();
      return;
    }
    const boton = $('#admPublicar', panel);
    boton.disabled = true;
    estado('Publicando…');

    const base = `https://api.github.com/repos/${PANEL.repoDueno}/${PANEL.repoNombre}/contents/${PANEL.archivo}`;
    const cab = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };

    try {
      let sha;
      const actual = await fetch(`${base}?ref=main`, { headers: cab });
      if (actual.ok) sha = (await actual.json()).sha;
      else if (actual.status === 401) throw new Error('El token no es válido o ya venció.');
      else if (actual.status === 403) throw new Error('El token no tiene permiso sobre esta página.');
      else if (actual.status !== 404) throw new Error(`GitHub respondió ${actual.status}.`);

      // Al publicar se limpian los avisos que ya pasaron
      const d = limpio();
      d.avisos = d.avisos.filter(a => !yaPaso(a));
      const texto = JSON.stringify(d, null, 2) + '\n';
      const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(texto)));

      const res = await fetch(base, {
        method: 'PUT',
        headers: { ...cab, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Actualizo avisos y datos desde el panel', content: b64, branch: 'main', ...(sha ? { sha } : {}) })
      });
      if (!res.ok) {
        const cuerpo = await res.json().catch(() => ({}));
        throw new Error(cuerpo.message || `GitHub respondió ${res.status}.`);
      }

      guardar('lds_gh_token', token);
      guardar('lds_borrador', null);
      datos = d;
      window.LDS.publicado = clon(d);
      pintarLista();
      estado('¡Publicado! En un minuto lo ve todo el mundo.', 'ok');
    } catch (e) {
      estado(e.message || 'No se pudo publicar.', 'err');
    } finally {
      boton.disabled = false;
    }
  }

  /* ---------- Arranque ---------- */
  // El panel se carga cuando ya está #admin en la dirección
  if (window.LDS.publicado) abrir();
  else document.addEventListener('lds:listo', abrir, { once: true });
})();
