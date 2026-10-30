# Sitio web SIR
nDiseño (desde 2026-10-30): pensado para el dueño de una pyme, no para gente de sistemas. Fondo papel, Figtree, texto grande, colores de siempre (negro #0B0B0C, papel #F4F2EE, lima #C6FF3D; el lima va de relleno con texto negro, nunca como texto sobre claro) y el logo como único recurso visual. Movimiento con una sola idea, "las cosas encajan": las piezas del logo se juntan una vez, la portada entra en 1,2 s, y solo el fondo y el símbolo se mueven de forma continua (se frenan fuera de pantalla). Hecho con CSS y `landing.js`. Los `loop-*`, `three.r128.min.js` y las fuentes viejas ya no se usan.

Sitio estático, sin build: se sube la carpeta tal cual (publicado en GitHub Pages, repo `sir-web`).

```
sitio/
├── index.html              landing
├── chequeo.html            chequeo gratis (nivel de riesgo + informe PDF, todo en el navegador)
├── og.png                  vista previa al compartir el link (1200×630)
├── robots.txt · sitemap.xml para buscadores (los datos estructurados JSON-LD van en el <head> de index.html)
├── loop-*.mp4 · loop-*.jpg  loops 4:5 de los reels 05 y 06 (544×680, sin sonido, ~200 KB) y su imagen fija
│                           se rehacen con ffmpeg: recorte crop=1080:1350:0:110 + fundidos de 0,35 s (ver git log)
├── favicon.png · apple-touch-icon.png
├── fonts.css · figtree-*.woff2  Figtree alojada acá (sin Google Fonts)
├── logo-sir.svg            logo Encastre (lockup recortado de marca/logo-nuevo/kit)
├── landing.js · chequeo.js   burbuja y formulario de WhatsApp · chequeo
├── three.r128.min.js       copia local verificada con SRI (sha512 = el publicado por cdnjs)
├── .nojekyll               para que GitHub Pages publique .well-known/
└── .well-known/
    └── security.txt        contacto de seguridad (RFC 9116) — subir cuando exista security@ en el dominio
```

Todo va **plano en la raíz** (sin subcarpetas), porque la subida web de GitHub no conserva carpetas
al elegir archivos. La única carpeta es `.well-known/`, que se crea a mano (ver abajo).

## Seguridad del propio sitio
- **CSP** en `<meta>` de cada página: solo recursos del mismo sitio (`'self'`), sin scripts en línea.
  Si agregás un script, va en `assets/js/` como archivo; un `<script>` en línea queda bloqueado.
- **Sin terceros:** ni fuentes, ni scripts, ni analítica externa. Mantenerlo así.
- Con el dominio en Cloudflare, sumar como encabezados HTTP (no se pueden poner en `<meta>`):
  `Content-Security-Policy` (la misma + `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

## Publicarlo
Subir los archivos de `sitio/` a la raíz del repo. `security.txt` se publica recién cuando el mail
`security@sirseguridad.com.ar` funcione (publicar un contacto de seguridad que no responde es peor que
no tenerlo), y en `.well-known/security.txt`: en GitHub, *Add file → Create new file*, nombre
`.well-known/security.txt` (la barra crea la carpeta) y pegar el contenido.

## Al tener dominio
- Hecho (2026-10-28): `og:image`, `og:url` y `canonical` apuntan a `https://sirseguridad.com.ar/`.
- Hecho: archivo `CNAME`. Subirlo recién cuando el DNS ya apunte a GitHub (si no, el sitio queda caído).



## Datos a mantener
- WhatsApp: `5493413490705` (links `wa.me` en la landing; constantes `WHATSAPP` en `assets/js/chequeo.js`).
- Precios en la web: Express "Desde USD 40", Pyme "Desde USD 150", Integral "Desde USD 260" (fuente: `PAQUETE-COMERCIAL.md`).
- **Promo activa desde el 28/10/2026: 50% off en todo** (USD 20 / 75 / 130), con el precio anterior tachado, aviso en el inicio y en Planes, y "con 50% off" en los mensajes de WhatsApp de cada plan. Dura hasta que Jerónimo diga. Para sacarla: volver a `<b>USD 40</b>` etc. y borrar `.promo`, `.promo-chip`, `<s>` y `.off`; `priceRange` del JSON-LD a "USD 40 - USD 260".
- Contadores de controles (21 Windows · 11 red · 12 Linux · 8 nube = 52): tienen que coincidir con el toolkit.
  Nunca publicar un número que la herramienta no tenga.
- Chequeo: `Metodología SIR v1.0`. Si cambian preguntas, pesos o umbrales, subir la versión.
