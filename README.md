# Centro Educativo Luz del Saber — sitio web

Página informativa del **Centro Educativo Luz del Saber** (pre-kínder, kínder y primer grado,
Panamá Oeste). Sirve para que las familias vean los grados, sepan **cómo llegar** y escriban
por WhatsApp.

Es un sitio estático: solo HTML, CSS y JavaScript. No necesita servidor ni base de datos.
Se publica gratis en GitHub Pages.

**En vivo (cuando se active Pages):** https://lulago3003.github.io/luz-del-saber/

```
index.html             → la página
contenido.json         → teléfono, horario, ubicación y avisos (lo que más cambia)
404.html               → página de "no encontrada"
assets/css/style.css   → estilos (colores sacados del mural de la entrada)
assets/js/app.js       → lee contenido.json, menú, mapa, formulario a WhatsApp
assets/img/escuela.jpg → foto de la entrada (FALTA SUBIRLA, ver abajo)
assets/img/compartir.png → imagen que sale al compartir el enlace por WhatsApp
```

---

## 1. Lo que falta para que quede lista

Todo esto se llena en **`contenido.json`**. Lo que esté vacío (`""`) sale en la página
como *Por confirmar*.

- [ ] **WhatsApp** de la escuela → `contacto.whatsapp` (formato `5076XXXXXXX`, sin `+` ni
      espacios) y `contacto.whatsappVisible` (como se lee: `+507 6XXX-XXXX`).
      Mientras esté vacío, los botones de WhatsApp llevan a la sección de contacto y el
      botón verde flotante no aparece.
- [ ] **Teléfono** → `contacto.telefono` y `contacto.telefonoVisible`.
- [ ] **Horario de atención** → `contacto.horario` (por ejemplo `Lunes a viernes, 7:00 a.m. – 12:00 m.`).
- [ ] **Ubicación exacta** → `ubicacion.lat` y `ubicacion.lng` (ver punto 2). Es lo más
      importante: con eso el mapa, Google Maps y Waze llevan directo a la puerta.
- [ ] **Dirección escrita** → `ubicacion.direccion` (barriada, calle, corregimiento).
- [ ] **Referencias** → `ubicacion.referencias`, una por línea:
      ```json
      "referencias": ["Frente a la tienda ...", "A dos casas de la iglesia ..."]
      ```
- [ ] **Foto de la entrada** → subir `assets/img/escuela.jpg` (ver punto 3).
- [ ] Cuando esté todo, poner `"enPreparacion": false` para quitar la franja amarilla.
- [ ] **Confirmar los textos** de las secciones *Grados* y *Nosotros* con la escuela
      (edades, lo que aprenden, "un lugar seguro", "cerca de casa"). Se escribieron a partir
      de la foto y de lo que se sabe; si algo no aplica, se cambia en `index.html`.

## 2. Cómo sacar la ubicación exacta

1. Abrir Google Maps en el celular, parado frente a la escuela (o buscarla en el mapa).
2. **Mantener presionado** sobre el punto exacto hasta que salga un pin rojo.
3. Arriba aparecen dos números, por ejemplo `8.9123, -79.7456`.
4. Pegarlos en `contenido.json`:

```json
"lat": 8.9123,
"lng": -79.7456
```

Sin comillas, y el segundo número con el signo menos.

## 3. Subir la foto de la entrada

La página ya tiene un dibujo de la entrada, pero con la foto real es mejor.

1. En GitHub, entrar a la carpeta `assets/img/`.
2. *Add file* → *Upload files*.
3. Subir la foto con el nombre exacto **`escuela.jpg`** (en minúsculas).

Apenas exista ese archivo, la foto reemplaza al dibujo sola. Conviene que sea horizontal
y que pese menos de 500 KB.

## 4. Avisos y fiestas patrias

- **Avisos:** en `contenido.json` → `avisos`. Cada aviso tiene `etiqueta`, `titulo` y
  `texto`. Se pueden agregar, quitar o dejar la lista vacía (`[]`) para ocultar la sección.
- **Mes de la patria:** con `"mesPatrio": true` salen los banderines, la cinta azul de
  arriba y la sección de noviembre (fechas patrias y símbolos). En diciembre, cambiar a
  `false` y todo eso desaparece. La fecha más próxima se marca sola según el día.

## 5. Ver la página en la computadora

```bash
python3 -m http.server 4321
```

Y abrir <http://localhost:4321>. (Abriendo `index.html` con doble clic también se ve, pero
sin los datos de `contenido.json`.)

## 6. Publicar

Una sola vez: en GitHub → *Settings* → *Pages* → *Source: Deploy from a branch* →
rama `main`, carpeta `/ (root)` → *Save*. En uno o dos minutos queda en línea.

Después, cada cambio que se suba a `main` se publica solo.

## Notas

- La página funciona sin JavaScript (se ve todo, con los datos que trae el HTML) y respeta
  la preferencia de "reducir movimiento" del sistema.
- Los datos de las fechas patrias y de los símbolos son históricos y generales; no dependen
  de la escuela.
- El nombre y los colores salen del mural pintado en la entrada de la escuela.
