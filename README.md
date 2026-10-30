# Centro Educativo Luz del Saber — sitio web

Página informativa del **Centro Educativo Luz del Saber**: pre-kínder, kínder y primer grado
en Arraiján, Panamá Oeste. Sirve para que las familias conozcan la escuela, sepan **cómo
llegar** y escriban si les interesa inscribir a sus hijos.

Es un sitio estático: solo HTML, CSS y JavaScript. No necesita servidor ni base de datos.
Se publica gratis en GitHub Pages.

| Versión | Enlace |
|---|---|
| Normal (cambia sola según la fecha) | https://lulago3003.github.io/luz-del-saber/ |
| Fiestas patrias | https://lulago3003.github.io/luz-del-saber/?tema=patria |
| Navidad | https://lulago3003.github.io/luz-del-saber/?tema=navidad |
| Sin decoración | https://lulago3003.github.io/luz-del-saber/?tema=ninguna |

```
index.html               → la página
contenido.json           → WhatsApp, teléfono, horario, ubicación, avisos y temporada
404.html                 → página de "no encontrada"
assets/css/style.css     → estilos (colores sacados del mural de la entrada)
assets/js/app.js         → lee contenido.json, temporadas, mapa, formulario a WhatsApp
assets/img/escuela.jpg   → foto de la entrada (FALTA SUBIRLA, ver abajo)
assets/img/compartir.png → imagen que sale al compartir el enlace por WhatsApp
```

---

## 1. Temporadas: fiestas patrias y Navidad

En `contenido.json`, `"temporada": "auto"` hace que la página se decore sola:

| Fechas | Qué se ve |
|---|---|
| 20 de octubre – 30 de noviembre | Banderines, cinta azul, sección *Mes de la patria* con las fechas de noviembre y los símbolos patrios |
| 1 de diciembre – 6 de enero | Luces de colores, nieve en la portada, gorrito en el trencito, sección *Navidad* con fechas de diciembre y "separa tu cupo" |
| El resto del año | Sin decoración |

Para fijar una sola: `"patria"`, `"navidad"` o `"ninguna"`. Para enseñar una versión sin
cambiar nada, se agrega `?tema=patria` o `?tema=navidad` al final del enlace.

## 2. Lo que falta para que quede completa

Todo esto se llena en **`contenido.json`**. Lo que esté vacío (`""`) simplemente no aparece.

- [ ] **WhatsApp** de la escuela → `contacto.whatsapp` (formato `5076XXXXXXX`, sin `+` ni
      espacios) y `contacto.whatsappVisible` (como se lee: `+507 6XXX-XXXX`).
      **Es lo más importante:** sin el número, los botones "Escríbenos", "Quiero información"
      y el formulario no pueden mandar el mensaje (llevan al formulario y dan las gracias).
      Con el número, todo abre WhatsApp con el mensaje listo y aparece el botón verde flotante.
- [ ] **Teléfono** → `contacto.telefono` y `contacto.telefonoVisible`.
- [ ] **Horario de atención** → `contacto.horario` (por ejemplo `Lunes a viernes, 7:00 a.m. – 12:00 m.`).
- [ ] **Dirección escrita** → `ubicacion.direccion` (barriada, calle). Opcional: el mapa ya
      lleva al punto exacto.
- [ ] **Referencias** → `ubicacion.referencias`, una por línea:
      ```json
      "referencias": ["Frente a la tienda ...", "A dos casas de la iglesia ..."]
      ```
- [ ] **Foto de la entrada** → subir `assets/img/escuela.jpg` (ver punto 4).
- [ ] **Confirmar los textos** de *Grados* y *Nosotros* con la escuela (edades, lo que
      aprenden, "un lugar seguro", "cerca de casa"). Se escribieron a partir de la foto; si
      algo no aplica, se cambia en `index.html`.

La ubicación ya está puesta: `8.9392252, -79.6421470`. Si algún día cambia, en Google Maps se
mantiene presionado sobre la escuela, se copian los dos números y se pegan en
`ubicacion.lat` y `ubicacion.lng` (sin comillas).

## 3. Avisos

En `contenido.json` → `avisos`. Cada aviso tiene `etiqueta`, `titulo` y `texto`. Si además
tiene `"tema": "patria"` o `"tema": "navidad"`, solo sale en esa temporada. Si no hay
avisos para mostrar, la sección se oculta sola.

## 4. Subir la foto de la entrada

La página trae un dibujo de la entrada, pero con la foto real queda mejor.

1. En GitHub, entrar a la carpeta `assets/img/`.
2. *Add file* → *Upload files*.
3. Subir la foto con el nombre exacto **`escuela.jpg`** (en minúsculas).

Apenas exista ese archivo, la foto reemplaza al dibujo sola. Conviene que sea horizontal
y que pese menos de 500 KB.

## 5. Ver la página en la computadora

```bash
python3 -m http.server 4321
```

Y abrir <http://localhost:4321> (o `http://localhost:4321/?tema=navidad`).

## 6. Publicar

Una sola vez: en GitHub → *Settings* → *Pages* → *Source: Deploy from a branch* →
rama `main`, carpeta `/ (root)` → *Save*. En uno o dos minutos queda en línea.

Después, cada cambio que se suba a `main` se publica solo.

## Notas

- Se ve bien en celular, tablet y computadora; funciona sin JavaScript (sin decoración de
  temporada) y respeta la preferencia de "reducir movimiento" del sistema.
- Las fechas patrias, los símbolos patrios y las fechas de diciembre son datos generales;
  no dependen de la escuela.
- El nombre y los colores salen del mural pintado en la entrada de la escuela.
