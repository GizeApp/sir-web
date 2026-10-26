# Sitio web SIR

Sitio estático, sin build: se sube la carpeta tal cual.

```
sitio/
├── index.html          landing
├── chequeo/index.html  chequeo gratis (semáforo, todo en el navegador)
├── og.png              vista previa al compartir el link (1200×630)
└── favicon.png         ícono de la pestaña
```

## Publicarlo

**Opción A — Netlify Drop (la más rápida):** entrar a app.netlify.com/drop y arrastrar la carpeta `sitio/`.
Queda en `algo.netlify.app`; el nombre se cambia en *Site configuration → Change site name*.

**Opción B — GitHub Pages (igual que GIZE):** repo nuevo (ej. `sir-web`), subir el contenido de `sitio/`
a `main`, *Settings → Pages → Deploy from branch → main / root*. Con dominio propio: archivo `CNAME`
con el dominio (como `gize.ar` en GIZE) y los registros DNS que indica GitHub.

## Al tener dominio
- Cambiar en `index.html` y `chequeo/index.html` el `og:image` a la URL completa
  (`https://<dominio>/og.png`): WhatsApp e Instagram no leen rutas relativas.
- Agregar `<link rel="canonical" href="https://<dominio>/">` en la landing.

## Datos a mantener
- WhatsApp: `5493413490705` (links `wa.me` en la landing; constantes `WHATSAPP` en el chequeo).
- Sin precios en la web (decisión comercial): los planes dicen "Consultar".
