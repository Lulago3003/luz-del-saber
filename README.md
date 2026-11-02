# Centro Educativo Luz del Saber — sitio web

Página informativa del **Centro Educativo Luz del Saber**: pre-kínder, kínder y primer grado
en Arraiján, Panamá Oeste. Sirve para que las familias vean los **avisos de la escuela**
(días sin clases, reuniones, actividades, novedades), sepan **cómo llegar** y escriban si les
interesa inscribir a sus hijos.

Es un sitio estático: solo HTML, CSS y JavaScript. No necesita servidor ni base de datos.
Se publica gratis en GitHub Pages.

| Versión | Enlace |
|---|---|
| Normal (la que se ve siempre) | https://lulago3003.github.io/luz-del-saber/ |
| Navidad (para mostrarla antes de diciembre) | https://lulago3003.github.io/luz-del-saber/?tema=navidad |
| Fiestas patrias | https://lulago3003.github.io/luz-del-saber/?tema=patria |
| Sin decoración | https://lulago3003.github.io/luz-del-saber/?tema=ninguna |
| Panel de la escuela | https://lulago3003.github.io/luz-del-saber/#admin |

```
index.html               → la página
contenido.json           → avisos, WhatsApp, horario, ubicación y temporada
404.html                 → página de "no encontrada"
assets/css/style.css     → estilos (colores sacados del mural de la entrada)
assets/css/admin.css     → estilos del panel (solo se cargan al abrirlo)
assets/js/app.js         → lee contenido.json, avisos, temporadas, mapa, formulario
assets/js/admin.js       → panel para publicar avisos (solo se carga con #admin)
assets/img/escuela.jpg   → foto de la entrada (FALTA SUBIRLA, ver abajo)
assets/img/compartir.png → imagen que sale al compartir el enlace por WhatsApp
```

---

## 1. El panel de la escuela (avisos desde el celular)

Se entra agregando **`#admin`** al final de la dirección. **Clave por defecto:** `luzdelsaber2026`.

Desde ahí la escuela puede:

- **Escribir avisos** con un toque: *No hay clases mañana* (pone la fecha de mañana y el
  texto «Mañana martes 12 de julio no habrá clases.»), *No hay clases un día*, *Reunión de
  padres*, *Actividad* o *Novedad*. Se puede cambiar todo antes de guardar.
- Marcar un aviso para que salga **arriba de la página** como aviso importante (barra de
  color con botón para cerrarla).
- **Editar o borrar** avisos.
- Cambiar el **WhatsApp**, el teléfono, el horario, la dirección y las referencias.
- Escoger la **decoración**: automática, fiestas patrias, Navidad o ninguna.

Los cambios se ven al instante en ese aparato. Para que los vea todo el mundo hay que tocar
**Publicar en la página**.

### Para que pueda publicar: el token (una sola vez)

1. Entrar a <https://github.com/settings/personal-access-tokens> con la cuenta dueña del sitio.
2. *Generate new token* → **Fine-grained token**.
3. *Repository access* → **Only select repositories** → `luz-del-saber`.
4. *Permissions* → *Repository permissions* → **Contents: Read and write**.
5. Copiar el token y pegarlo en el panel, en el campo «Token de GitHub», en el celular de
   quien va a publicar. Queda guardado en ese aparato; hay un botón para borrarlo.

Sin token se puede usar **Descargar archivo**: genera el `contenido.json` nuevo para
mandárselo a quien administra la web.

La clave solo evita que alguien entre por curiosidad (en una web estática el código se puede
leer). Lo que de verdad protege es el token. Para cambiar la clave, genera el SHA-256 de la
nueva y pégalo en `assets/js/admin.js` (`claveHash`):

```bash
node -e "console.log(require('crypto').createHash('sha256').update('CLAVE-NUEVA').digest('hex'))"
```

## 2. Cómo funcionan los avisos

Cada aviso en `contenido.json` → `avisos` tiene:

| Campo | Qué es |
|---|---|
| `tipo` | `sin-clases`, `reunion`, `actividad`, `novedad`, `inscripciones` o `importante` (cambia el color y la etiqueta) |
| `titulo`, `texto` | Lo que se lee |
| `fecha` | Opcional. El día del aviso (`2027-07-12`). La página escribe sola «Hoy», «Mañana», «martes 12 de julio»… |
| `hasta` | Opcional. Si dura varios días (`2026-11-05`) |
| `destacado` | `true` para que salga también en la barra de arriba |
| `tema` | Opcional. `patria` o `navidad`: solo sale en esa temporada |

**Los avisos con fecha se quitan solos** al día siguiente de su fecha (o de `hasta`). Los que
no tienen fecha se quedan hasta que se borren. En la computadora se ven hasta 6 y en el celular
3, con un botón «Ver más avisos».

Los avisos que trae ahora son los feriados de noviembre y diciembre (fechas nacionales), más
«¡Estrenamos página web!» y uno de inscripciones. Se pueden borrar desde el panel.

## 3. Temporadas: fiestas patrias y Navidad

Con `"temporada": "auto"` la página se decora sola:

| Fechas | Qué se ve |
|---|---|
| 20 de octubre – 30 de noviembre | Banderines, cinta azul, banderita en el trencito y sección *Mes de la patria* |
| 1 de diciembre – 6 de enero | **Toda la página en Navidad:** portada de noche con luna, estrellas y nieve, letras que brillan como luces, luces de colores, gorrito en el trencito, el logo y el búho, lazo en la foto, colores rojo y verde, franja de bastón de caramelo y sección *Navidad* |
| El resto del año | Sin decoración |

Para fijar una: `"patria"`, `"navidad"` o `"ninguna"` (o desde el panel). Para enseñar una
versión sin cambiar nada se agrega `?tema=navidad` o `?tema=patria` al enlace.

## 4. Lo que falta para que quede completa

Se llena desde el panel (o en `contenido.json`). Lo que esté vacío no aparece.

- [ ] **WhatsApp** de la escuela. **Es lo más importante:** sin el número, los botones
      «Escríbenos», «Quiero información» y el formulario llevan al formulario y dan las
      gracias, pero no mandan el mensaje. Con el número, todo abre WhatsApp con el mensaje
      listo y aparece el botón verde flotante.
- [ ] **Horario de atención** y **teléfono**.
- [ ] **Dirección** y **referencias** (opcional: el mapa ya lleva al punto exacto,
      `8.9392252, -79.6421470`).
- [ ] **Foto de la entrada** → subir `assets/img/escuela.jpg` (ver punto 5).
- [ ] **Confirmar los textos** de *Grados* y *Nosotros* con la escuela. Se escribieron a partir
      de la foto; si algo no aplica, se cambia en `index.html`.

## 5. Subir la foto de la entrada

1. En GitHub, entrar a la carpeta `assets/img/`.
2. *Add file* → *Upload files*.
3. Subir la foto con el nombre exacto **`escuela.jpg`** (en minúsculas).

Apenas exista ese archivo, la foto reemplaza al dibujo sola. Mejor horizontal y de menos de 500 KB.

## 6. Ver la página en la computadora

```bash
python3 -m http.server 4321
```

Y abrir <http://localhost:4321> (o `http://localhost:4321/?tema=navidad`, o `/#admin`).

## 7. Publicar

Una sola vez: en GitHub → *Settings* → *Pages* → *Source: Deploy from a branch* →
rama `main`, carpeta `/ (root)` → *Save*. En uno o dos minutos queda en línea.

Después, cada cambio que se suba a `main` (también los del panel) se publica solo.

## Notas

- Se ve bien en celular, tablet y computadora; funciona sin JavaScript (sin avisos nuevos ni
  decoración de temporada) y respeta la preferencia de "reducir movimiento" del sistema.
- Las fechas patrias, los símbolos patrios y los feriados son datos generales de Panamá.
- El nombre y los colores salen del mural pintado en la entrada de la escuela.
