# Sitio web SIR

Sitio estático, sin build: se sube la carpeta tal cual (publicado en GitHub Pages, repo `sir-web`).

```
sitio/
├── index.html              landing
├── chequeo.html            chequeo gratis (semáforo + informe PDF, todo en el navegador)
├── og.png                  vista previa al compartir el link (1200×630)
├── favicon.png · apple-touch-icon.png
├── .nojekyll               para que GitHub Pages publique .well-known/
├── .well-known/
│   └── security.txt        contacto de seguridad (RFC 9116) — subir cuando exista security@ en el dominio
└── assets/
    ├── fonts/              Unbounded + JetBrains Mono alojadas acá (sin Google Fonts)
    └── js/
        ├── landing.js · chequeo.js · js-flag.js
        └── three.r128.min.js   copia local verificada con SRI (sha512 = el publicado por cdnjs)
```

## Seguridad del propio sitio
- **CSP** en `<meta>` de cada página: solo recursos del mismo sitio (`'self'`), sin scripts en línea.
  Si agregás un script, va en `assets/js/` como archivo; un `<script>` en línea queda bloqueado.
- **Sin terceros:** ni fuentes, ni scripts, ni analítica externa. Mantenerlo así.
- Con el dominio en Cloudflare, sumar como encabezados HTTP (no se pueden poner en `<meta>`):
  `Content-Security-Policy` (la misma + `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

## Publicarlo
Subir el contenido de `sitio/` al repo, incluida la carpeta `assets/` y el archivo `.nojekyll`. En la
subida web de GitHub se arrastran las carpetas enteras. `.well-known/` se sube recién cuando el mail
`security@sirseguridad.com.ar` funcione: publicar un contacto de seguridad que no responde es peor que no tenerlo.

## Al tener dominio
- Cambiar en `index.html` y `chequeo.html` el `og:image`, `og:url` y `canonical` a `https://sirseguridad.com.ar/`.
- Crear el archivo `CNAME` con `sirseguridad.com.ar`.

## Datos a mantener
- WhatsApp: `5493413490705` (links `wa.me` en la landing; constantes `WHATSAPP` en `assets/js/chequeo.js`).
- Precios en la web: Express "Desde USD 40", Pyme "Desde USD 150", Integral "Desde USD 260" (fuente: `PAQUETE-COMERCIAL.md`).
- Contadores de controles (21 Windows · 11 red · 12 Linux · 8 nube = 52): tienen que coincidir con el toolkit.
  Nunca publicar un número que la herramienta no tenga.
- Chequeo: `Metodología SIR v1.0`. Si cambian preguntas, pesos o umbrales, subir la versión.
