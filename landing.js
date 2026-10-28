(function(){
'use strict';
var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
var $ = function(s, r){ return (r||document).querySelector(s); };
var $$ = function(s, r){ return [].slice.call((r||document).querySelectorAll(s)); };

/* ---------------- Arranque (una vez por sesión) ---------------- */
(function boot(){
  var el = $('#boot'), seen = false;
  try { seen = sessionStorage.getItem('sir-boot') === '1'; sessionStorage.setItem('sir-boot', '1'); } catch(e) {}
  if (reduce || seen) { el.remove(); return; }
  var lines = [
    ['sir@auditoria:~$ ./iniciar --modo solo-lectura', ''],
    ['[ok] autorización firmada', 'ok'],
    ['[ok] seudonimización activa', 'ok'],
    ['[ok] cargando módulos: windows · red · linux · nube', 'ok'],
    ['> listo.', 'ok']
  ];
  var log = $('#bootlog');
  lines.forEach(function(l, i){
    var d = document.createElement('div'); d.className = 'l ' + l[1]; d.textContent = l[0];
    d.style.animationDelay = (i * 180) + 'ms'; log.appendChild(d);
  });
  setTimeout(function(){ el.classList.add('out'); }, 1150);
  setTimeout(function(){ el.remove(); }, 1900);
})();

/* ---------------- Texto que se "descifra" ---------------- */
var GLYPHS = "ABCDEFGHKLMNPRSTUVXYZ0123456789#%&$";
function resetDec(el){ if (el._dec) cancelAnimationFrame(el._dec); el._nodes = null; }
function textNodes(el){ var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n, out = []; while ((n = w.nextNode())) if (n.nodeValue.trim()) out.push(n); return out; }
function decrypt(el, dur){
  if (reduce || !el) return;
  dur = dur || 900;
  if (el._dec) cancelAnimationFrame(el._dec);
  if (!el._nodes) { el._nodes = textNodes(el); el._finals = el._nodes.map(function(n){ return n.nodeValue; }); }
  var nodes = el._nodes, finals = el._finals, t0 = performance.now();
  (function f(t){
    var p = Math.min(1, (t - t0) / dur);
    nodes.forEach(function(n, k){
      var s = finals[k], rev = Math.floor(p * s.length), o = s.slice(0, rev);
      for (var i = rev; i < s.length; i++) o += (s[i] === ' ' || i > rev + 3) ? s[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      n.nodeValue = o;
    });
    if (p < 1) el._dec = requestAnimationFrame(f); else nodes.forEach(function(n, k){ n.nodeValue = finals[k]; });
  })(t0);
}

/* ---------------- Barra de progreso + retícula ---------------- */
var prog = $('#progress');
addEventListener('scroll', function(){
  var h = document.documentElement.scrollHeight - innerHeight;
  prog.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
}, { passive: true });

if (finePointer && !reduce) {
  var ret = $('.reticle'), rx = -100, ry = -100, tx = -100, ty = -100;
  addEventListener('pointermove', function(e){ tx = e.clientX; ty = e.clientY; ret.style.opacity = 1; });
  document.addEventListener('pointerleave', function(){ ret.style.opacity = 0; });
  document.addEventListener('pointerover', function(e){ ret.classList.toggle('big', !!e.target.closest('a,button,summary,.nd')); });
  (function loop(){ rx += (tx - rx) * .22; ry += (ty - ry) * .22; ret.style.transform = 'translate(' + rx + 'px,' + ry + 'px)'; requestAnimationFrame(loop); })();
}

/* ---------------- Revelado + contadores + descifrado al entrar ---------------- */
function countUp(el){
  var target = +el.dataset.count, small = el.querySelector('small'), t0 = performance.now(), d = 1400;
  if (reduce) return;
  (function f(t){ var p = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - p, 3);
    el.firstChild.nodeValue = String(Math.round(target * e)); if (p < 1) requestAnimationFrame(f); })(t0);
  void small;
}
if ('IntersectionObserver' in window) {
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (!e.isIntersecting) return;
      var el = e.target; io.unobserve(el);
      el.classList.add('in');
      if (el.hasAttribute('data-decrypt')) decrypt(el, 1000);
      if (el.dataset.count) countUp(el);
    });
  }, { threshold: .25 });
  $$('.rv,[data-decrypt],[data-count]').forEach(function(el){ if (!el.closest('.hud,.hero')) io.observe(el); });
} else { $$('.rv').forEach(function(el){ el.classList.add('in'); }); }

/* =====================================================================
   HERO 3D: carrusel de equipos con su vulnerabilidad
   ===================================================================== */
var VULNS = [
  { dev:'Notebook de administración', kind:'laptop', title:'Disco sin cifrar', sev:'high', sevTxt:'Alta', cis:'3.6', fix:'Activar BitLocker',
    text:'Si se pierde o la roban, cualquiera puede leer la información de tus clientes.',
    term:['> scan NB-0003', 'BitLocker C:  OFF', 'datos clientes: 14 GB', 'robo = fuga de datos', 'riesgo: ALTO'] },
  { dev:'PC de mostrador', kind:'desktop', title:'Usuario administrador compartido', sev:'high', sevTxt:'Alta', cis:'5.4', fix:'Usuario estándar por persona',
    text:'Todos usan la misma cuenta con permisos totales: un adjunto infectado controla la PC entera.',
    term:['> scan PC-0012', 'usuario: "caja"', 'grupo: Administradores', 'clave compartida: sí', 'riesgo: ALTO'] },
  { dev:'Servidor de archivos', kind:'server', title:'Backup conectado a la red', sev:'crit', sevTxt:'Crítica', cis:'11', fix:'Copia desconectada y probada',
    text:'Un ransomware cifra los archivos y también la copia. No queda nada para recuperar.',
    term:['> scan SRV-01', 'backup: \\\\NAS\\copias', 'montado: siempre', 'última prueba: nunca', 'riesgo: CRÍTICO'] },
  { dev:'Router de la oficina', kind:'router', title:'Administración expuesta a internet', sev:'crit', sevTxt:'Crítica', cis:'4.7', fix:'Cerrar acceso externo y cambiar clave',
    text:'El panel del router responde desde internet y tiene la clave de fábrica.',
    term:['> scan FW-01', 'winbox: 0.0.0.0/0', 'admin: clave fábrica', 'firmware: 2019', 'riesgo: CRÍTICO'] },
  { dev:'Celular del dueño', kind:'phone', title:'Mail sin doble factor', sev:'high', sevTxt:'Alta', cis:'6.3', fix:'Activar verificación en dos pasos',
    text:'Con una clave filtrada pueden leer tu mail y pedirle pagos a tus clientes en tu nombre.',
    term:['> scan USR-0001', 'cuenta: M365', 'MFA: no registrado', 'reenvío externo: 1', 'riesgo: ALTO'] }
];

var hud = { scan:$('#hudScan'), dev:$('#hudDev'), title:$('#hudTitle'), text:$('#hudText'), sev:$('#hudSev'), cis:$('#hudCis'), fix:$('#hudFix') };
var pager = $('#pager'), active = 0, jumpTo = null;
VULNS.forEach(function(v, i){
  var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', v.dev + ': ' + v.title);
  b.addEventListener('click', function(){ if (jumpTo) jumpTo(i); else setHud(i); });
  pager.appendChild(b);
});
function setHud(i){
  var v = VULNS[i]; active = i;
  resetDec(hud.title);
  hud.scan.textContent = '■ Escaneando ' + String(i + 1).padStart(2, '0') + '/' + String(VULNS.length).padStart(2, '0');
  hud.dev.textContent = v.dev; hud.title.textContent = v.title; hud.text.textContent = v.text;
  hud.sev.textContent = v.sevTxt; hud.sev.className = 'pill ' + v.sev;
  hud.cis.textContent = 'CIS v8 · ' + v.cis; hud.fix.textContent = 'Fix: ' + v.fix;
  $$('button', pager).forEach(function(b, k){ b.setAttribute('aria-current', String(k === i)); });
  decrypt(hud.title, 650);
}
setHud(0);

function initThree(){
  var canvas = $('#three'), stage = $('#stage');
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); }
  catch (e) { stage.classList.add('nogl'); canvas.remove(); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0B0B0C, 9, 17);
  var camera = new THREE.PerspectiveCamera(32, 1, .1, 60);
  camera.position.set(0, 1.9, 10);
  camera.lookAt(0, -1.35, 0);

  scene.add(new THREE.AmbientLight(0xffffff, .35));
  var key = new THREE.DirectionalLight(0xffffff, .9); key.position.set(4, 6, 6); scene.add(key);
  var limeLight = new THREE.PointLight(0xC6FF3D, 2.2, 9); limeLight.position.set(0, 1.5, 5.5); scene.add(limeLight);
  var redLight = new THREE.PointLight(0xFF4D42, 0, 6); redLight.position.set(0, 2.2, 4.2); scene.add(redLight);

  var LIME = 0xC6FF3D;
  var body = new THREE.MeshStandardMaterial({ color: 0x1a1a1f, metalness: .65, roughness: .32 });
  var bodyDark = new THREE.MeshStandardMaterial({ color: 0x0f0f12, metalness: .5, roughness: .5 });
  function edges(mesh, op){ var l = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: LIME, transparent: true, opacity: op || .28 })); mesh.add(l); return mesh; }
  function box(w, h, d, m){ return edges(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m || body)); }

  // Pantallas con textura dibujada en canvas
  function makeScreen(w, h, pw, ph){
    var c = document.createElement('canvas'); c.width = pw; c.height = ph;
    var tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
    return { mesh: mesh, c: c, g: c.getContext('2d'), tex: tex };
  }

  function buildLaptop(){
    var g = new THREE.Group();
    var base = box(2.0, .09, 1.35); base.position.y = .045; g.add(base);
    var kb = new THREE.Mesh(new THREE.PlaneGeometry(1.7, .7), new THREE.MeshStandardMaterial({ color: 0x0b0b0d, roughness: .9 }));
    kb.rotation.x = -Math.PI / 2; kb.position.set(0, .092, -.1); g.add(kb);
    var hinge = new THREE.Group(); hinge.position.set(0, .09, -.66); g.add(hinge);
    var lid = box(2.0, 1.3, .06); lid.position.set(0, .65, 0); hinge.add(lid);
    var s = makeScreen(1.84, 1.14, 512, 320); s.mesh.position.set(0, .65, .032); hinge.add(s.mesh);
    hinge.rotation.x = -.18;
    return { g: g, s: s };
  }
  function buildDesktop(){
    var g = new THREE.Group();
    var foot = box(.9, .05, .55); foot.position.y = .025; g.add(foot);
    var neck = box(.14, .55, .14); neck.position.y = .3; g.add(neck);
    var mon = box(2.3, 1.42, .09); mon.position.y = 1.18; g.add(mon);
    var s = makeScreen(2.14, 1.26, 512, 300); s.mesh.position.set(0, 1.18, .047); g.add(s.mesh);
    var tower = box(.55, 1.25, 1.1, bodyDark); tower.position.set(1.65, .625, -.1); g.add(tower);
    return { g: g, s: s };
  }
  function buildServer(){
    var g = new THREE.Group();
    var rack = box(1.25, 2.3, 1.1); rack.position.y = 1.15; g.add(rack);
    var s = makeScreen(1.08, 2.1, 256, 500); s.mesh.position.set(0, 1.15, .552); g.add(s.mesh);
    return { g: g, s: s, tall: true };
  }
  function buildRouter(){
    var g = new THREE.Group();
    var r = box(1.9, .36, 1.15); r.position.y = .18; g.add(r);
    [-.65, 0, .65].forEach(function(x, i){
      var a = edges(new THREE.Mesh(new THREE.CylinderGeometry(.04, .05, 1.15, 10), bodyDark), .35);
      a.position.set(x, .85, -.45); a.rotation.z = (i - 1) * .22; g.add(a);
    });
    // Panel holográfico sobre el router
    var s = makeScreen(2.0, 1.18, 512, 300); s.mesh.position.set(0, 1.75, .1);
    s.mesh.material.transparent = true; s.mesh.material.opacity = .92; g.add(s.mesh);
    var frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(2.04, 1.22)), new THREE.LineBasicMaterial({ color: LIME, transparent: true, opacity: .6 }));
    frame.position.copy(s.mesh.position); g.add(frame);
    return { g: g, s: s, holo: true };
  }
  function buildPhone(){
    var g = new THREE.Group();
    var p = box(.92, 1.85, .09); p.position.y = 1.0; g.add(p);
    var s = makeScreen(.82, 1.72, 220, 460); s.mesh.position.set(0, 1.0, .047); g.add(s.mesh);
    g.rotation.z = -.06;
    return { g: g, s: s, tall: true };
  }
  var builders = { laptop: buildLaptop, desktop: buildDesktop, server: buildServer, router: buildRouter, phone: buildPhone };

  var ring = new THREE.Group(); ring.position.y = -1.05; scene.add(ring);
  var N = VULNS.length, R = 3.6, devices = [];
  VULNS.forEach(function(v, i){
    var d = builders[v.kind](), a = i / N * Math.PI * 2;
    var holder = new THREE.Group();
    holder.position.set(Math.sin(a) * R, 0, Math.cos(a) * R); holder.rotation.y = a;
    holder.add(d.g); ring.add(holder);
    d.holder = holder; d.v = v; devices.push(d);
  });

  // Piso: grilla polar + barrido de radar
  var polar = new THREE.PolarGridHelper(6.2, 16, 6, 64, 0x2c3a12, 0x1a2209);
  polar.position.y = -1.06; scene.add(polar);
  var sweep = new THREE.Mesh(new THREE.CircleGeometry(6.2, 48, 0, .7), new THREE.MeshBasicMaterial({ color: LIME, transparent: true, opacity: .07, side: THREE.DoubleSide, depthWrite: false }));
  sweep.rotation.x = -Math.PI / 2; sweep.position.y = -1.04; scene.add(sweep);

  // Partículas de datos
  var P = 420, pos = new Float32Array(P * 3), spd = new Float32Array(P);
  for (var i = 0; i < P; i++) { pos[i*3] = (Math.random() - .5) * 16; pos[i*3+1] = Math.random() * 7 - 1.5; pos[i*3+2] = (Math.random() - .5) * 12 - 2; spd[i] = .004 + Math.random() * .012; }
  var pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var points = new THREE.Points(pg, new THREE.PointsMaterial({ color: LIME, size: .035, transparent: true, opacity: .55, depthWrite: false }));
  scene.add(points);

  // Haz de escaneo (plano horizontal que barre el equipo del frente)
  var beam = new THREE.Mesh(new THREE.PlaneGeometry(2.8, .03), new THREE.MeshBasicMaterial({ color: LIME, transparent: true, opacity: .95, blending: THREE.AdditiveBlending, depthWrite: false }));
  var beamGlow = new THREE.Mesh(new THREE.PlaneGeometry(2.8, .5), new THREE.MeshBasicMaterial({ color: LIME, transparent: true, opacity: .12, blending: THREE.AdditiveBlending, depthWrite: false }));
  beam.add(beamGlow); scene.add(beam);

  // Dibujo de pantallas
  var COLS = { crit: '#FF4D42', high: '#FFB72B', lime: '#C6FF3D' };
  function drawScreen(d, t, isFront, phase){
    var g = d.s.g, W = d.s.c.width, H = d.s.c.height, v = d.v, sc = W / 512;
    g.fillStyle = '#060607'; g.fillRect(0, 0, W, H);
    // barra superior
    g.fillStyle = isFront ? (phase < 2 ? COLS[v.sev] : COLS.lime) : '#26262a';
    g.fillRect(0, 0, W, 34 * sc);
    g.fillStyle = '#0B0B0C'; g.font = '700 ' + Math.round(17 * sc) + 'px "JetBrains Mono", monospace'; g.textBaseline = 'middle';
    g.fillText(isFront ? (phase < 2 ? '⚠ VULNERABLE' : '✓ PRIORIZADO · CIS ' + v.cis) : 'SIR · EN ESPERA', 12 * sc, 17 * sc);
    // líneas tipo consola
    var fs = Math.round((d.tall ? 22 : 24) * sc), lh = fs * 1.55, y0 = 34 * sc + lh;
    g.font = '500 ' + fs + 'px "JetBrains Mono", monospace'; g.textBaseline = 'alphabetic';
    var lines = v.term, shown = isFront ? Math.min(lines.length, Math.floor(t / .32) + 1) : lines.length;
    for (var k = 0; k < shown; k++) {
      var ln = lines[k]; if (isFront && k === shown - 1 && phase === 0) ln = ln.slice(0, Math.floor((t % .32) / .32 * ln.length) + 1);
      g.fillStyle = !isFront ? '#3a3a40' : (k === 0 ? COLS.lime : (k === lines.length - 1 ? COLS[v.sev] : '#D9D8D3'));
      if (d.tall) { // texto en dos renglones si es angosto
        g.fillText(ln.slice(0, 15), 14 * sc, y0 + k * lh * 1.0);
      } else g.fillText(ln, 16 * sc, y0 + k * lh);
    }
    if (isFront && (t * 2 % 1) < .5) { g.fillStyle = COLS.lime; g.fillRect(16 * sc, y0 + shown * lh - fs, fs * .55, fs); }
    // ruido de líneas
    g.fillStyle = 'rgba(255,255,255,.03)'; for (var yy = 0; yy < H; yy += 4) g.fillRect(0, yy, W, 1);
    if (isFront && phase === 0 && Math.random() < .08) { g.fillStyle = 'rgba(255,77,66,.25)'; g.fillRect(0, Math.random() * H, W, 6 * sc); }
    d.s.tex.needsUpdate = true;
  }

  var current = 0, ringRot = 0, cycleStart = performance.now(), CYCLE = 4600;
  devices.forEach(function(d){ drawScreen(d, 0, false, 0); });
  jumpTo = function(i){ current = i; cycleStart = performance.now(); setHud(i); };

  var mx = 0, my = 0, smx = 0, smy = 0;
  stage.addEventListener('pointermove', function(e){ var b = stage.getBoundingClientRect(); mx = (e.clientX - b.left) / b.width - .5; my = (e.clientY - b.top) / b.height - .5; });
  stage.addEventListener('pointerleave', function(){ mx = my = 0; });

  function size(){
    var b = canvas.getBoundingClientRect(), w = Math.max(1, b.width), h = Math.max(1, b.height);
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.position.z = w < 600 ? 11 : 8.8;
    camera.updateProjectionMatrix();
  }
  size(); addEventListener('resize', size);

  var visible = true, raf = 0, lastT = performance.now();
  function frame(now){
    raf = 0;
    var dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
    var el = now - cycleStart;
    if (!reduce && el > CYCLE) { current = (current + 1) % N; cycleStart = now; el = 0; setHud(current); }
    var t = el / 1000, phase = t < 1.9 ? 0 : (t < 3.0 ? 1 : 2);

    // giro del anillo hacia el equipo actual (camino más corto)
    var target = -current / N * Math.PI * 2, diff = target - ringRot;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    ringRot += diff * Math.min(1, dt * 3.2);
    ring.rotation.y = ringRot;

    smx += (mx - smx) * .06; smy += (my - smy) * .06;
    scene.rotation.y = smx * .35; scene.rotation.x = smy * .12;

    devices.forEach(function(d, i){
      var front = i === current;
      d.g.position.y = front ? Math.sin(now * .002) * .08 + .12 : 0;
      d.g.rotation.y = front ? Math.sin(now * .0011) * .18 : 0;
      if (front || d._wasFront) drawScreen(d, t, front, phase);
      d._wasFront = front;
    });

    // haz de escaneo durante la fase 1
    var fd = devices[current], top = fd.tall ? 2.4 : (fd.holo ? 2.4 : 1.6);
    beam.visible = phase === 1 && !reduce;
    if (beam.visible) {
      var p = (t - 1.9) / 1.1;
      var wp = new THREE.Vector3(); fd.holder.getWorldPosition(wp);
      beam.position.set(wp.x, ring.position.y + top * (1 - p) + .05, wp.z + .75);
      beam.rotation.y = 0;
    }
    redLight.intensity = phase === 0 ? 1.2 + Math.sin(now * .012) * .8 : 0;
    limeLight.intensity = phase === 0 ? 1.0 : 2.6;

    sweep.rotation.z = -now * .0009;
    var arr = pg.attributes.position.array;
    for (var i = 0; i < P; i++) { arr[i*3+1] += spd[i]; if (arr[i*3+1] > 5.5) arr[i*3+1] = -1.5; }
    pg.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    if (visible && !document.hidden && !reduce) raf = requestAnimationFrame(frame);
  }
  function start(){ if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }
  if ('IntersectionObserver' in window) new IntersectionObserver(function(es){ visible = es[0].isIntersecting; start(); }).observe(stage);
  document.addEventListener('visibilitychange', start);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function(){ devices.forEach(function(d){ drawScreen(d, 0, false, 0); }); start(); });
  if (reduce) { // una imagen fija con el primer equipo
    requestAnimationFrame(function(n){ frame(n); });
  }
}
if (window.THREE) initThree(); else $('#stage').classList.add('nogl');

/* =====================================================================
   CADENA DE ATAQUE: el paquete recorre los pasos; con SIR se frena
   ===================================================================== */
(function(){
  var chain = $('#chain'), nodes = $$('.c-node', chain), bars = $$('.barrier', chain), pk = $('#packet'), sw = $('#sw'), out = $('#chainOut');
  var protectedOn = false, pts = [], t0 = performance.now(), visible = false;
  function measure(){
    var cb = chain.getBoundingClientRect();
    pts = nodes.map(function(n){ var b = n.getBoundingClientRect(); return { x: b.left - cb.left + b.width / 2, y: b.top - cb.top + b.height / 2, b: b }; });
    // barreras entre nodos
    bars.forEach(function(br, i){
      var a = nodes[i].getBoundingClientRect(), c = nodes[i + 1].getBoundingClientRect(), vertical = Math.abs(c.top - a.top) > 10;
      if (vertical) { br.style.left = '50%'; br.style.top = ((a.bottom + c.top) / 2 - cb.top) + 'px'; }
      else { br.style.left = ((a.right + c.left) / 2 - cb.left) + 'px'; br.style.top = '50%'; }
    });
  }
  function setState(i, hitUpTo){
    nodes.forEach(function(n, k){
      n.classList.toggle('hit', k <= hitUpTo);
      n.classList.toggle('safe', protectedOn && k > hitUpTo);
      n.querySelector('.st').textContent = protectedOn && k > hitUpTo ? 'Protegido' : 'Comprometido';
    });
  }
  sw.addEventListener('click', function(){
    protectedOn = !protectedOn; sw.setAttribute('aria-checked', String(protectedOn));
    chain.parentElement.classList.toggle('on', protectedOn); chain.classList.toggle('on', protectedOn);
    out.textContent = protectedOn ? '› Con SIR, el ataque se frena en el primer paso: el doble factor deja la clave robada sin uso.' : '› Sin controles, el ataque recorre los 5 pasos.';
    t0 = performance.now();
  });
  function lerp(a, b, p){ return a + (b - a) * p; }
  function tick(now){
    if (!pts.length) measure();
    var seg = 900, pause = 1100, lastIdx = protectedOn ? 0 : 4;
    var total = (protectedOn ? seg * .5 : seg * 4) + pause, e = (now - t0) % total, x, y, reached;
    if (protectedOn) {
      var p = Math.min(1, e / (seg * .5)), a = pts[0], b = pts[1];
      var stop = .5, q = p * stop;
      x = lerp(a.x, b.x, q); y = lerp(a.y, b.y, q); reached = 0;
      pk.style.opacity = p >= 1 ? (Math.sin(now * .02) > 0 ? 1 : .2) : 1;
    } else {
      var travel = Math.min(e, seg * 4) / seg, i = Math.min(3, Math.floor(travel)), f = travel - i;
      if (travel >= 4) { i = 3; f = 1; }
      x = lerp(pts[i].x, pts[i + 1].x, f); y = lerp(pts[i].y, pts[i + 1].y, f);
      reached = travel >= 4 ? 4 : Math.floor(travel + .02); pk.style.opacity = 1;
    }
    pk.style.left = x + 'px'; pk.style.top = y + 'px';
    setState(0, reached);
    if (visible && !reduce) requestAnimationFrame(tick);
  }
  addEventListener('resize', measure);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(measure);
  if ('IntersectionObserver' in window) new IntersectionObserver(function(es){ var was = visible; visible = es[0].isIntersecting; if (visible && !was) { measure(); requestAnimationFrame(tick); } }).observe(chain);
  measure(); setState(0, 4); if (pts.length) { pk.style.left = pts[4].x + 'px'; pk.style.top = pts[4].y + 'px'; }
})();

/* =====================================================================
   MAPA DE RED interactivo
   ===================================================================== */
(function(){
  var NS = 'http://www.w3.org/2000/svg';
  var N = {
    www:   { x:450, y:60,  t:'WWW',  l:'Internet' },
    cloud: { x:770, y:80,  t:'M365', l:'Correo y nube', g:'cloud' },
    fw:    { x:450, y:185, t:'FW',   l:'Router / firewall', g:'fw' },
    sw:    { x:450, y:310, t:'SW',   l:'Red interna', g:'fw' },
    wifi:  { x:210, y:250, t:'WiFi', l:'Wi-Fi', g:'wifi' },
    guest: { x:90,  y:360, t:'INV',   l:'Invitados', g:'wifi' },
    pc1:   { x:230, y:440, t:'PC',   l:'Administración', g:'pc' },
    pc2:   { x:350, y:470, t:'PC',   l:'Mostrador', g:'pc' },
    pc3:   { x:470, y:470, t:'NB',   l:'Notebook', g:'pc' },
    srv:   { x:610, y:450, t:'SRV',  l:'Servidor', g:'srv' },
    nas:   { x:760, y:380, t:'NAS',  l:'Backup', g:'nas' }
  };
  var LINKS = [['www','fw'],['www','cloud'],['fw','sw'],['fw','wifi'],['wifi','guest'],['sw','pc1'],['sw','pc2'],['sw','pc3'],['sw','srv'],['sw','nas']];
  var INFO = {
    fw:   { title:'Router y firewall', tag:'FW', foot:'MikroTik · FortiGate · configuración exportada', items:[
      ['NET', 'Administración expuesta a internet'], ['NET', 'Clave de fábrica o débil'], ['NET', 'Puertos abiertos innecesarios (RDP, Winbox)'], ['NET', 'Firmware desactualizado'], ['NET', 'Registros y hora sincronizada']] },
    pc:   { title:'Computadoras', tag:'PC', foot:'Windows 10 / 11 · Active Directory · 21 controles', items:[
      ['WIN', 'Actualizaciones y versión con soporte'], ['WIN', 'Antivirus activo y al día'], ['WIN', 'Cifrado de disco (BitLocker)'], ['WIN', 'Usuarios con permisos de administrador'], ['WIN', 'Firewall de Windows y escritorio remoto']] },
    srv:  { title:'Servidores', tag:'SRV', foot:'Linux · 12 controles', items:[
      ['LNX', 'Acceso SSH como root'], ['LNX', 'Sudo sin contraseña'], ['LNX', 'Usuarios sin clave o con UID 0'], ['LNX', 'Firewall del servidor'], ['LNX', 'Auditoría y registros']] },
    nas:  { title:'Backups', tag:'NAS', foot:'Lo que más pesa ante un ransomware', items:[
      ['BAK', 'Copia desconectada de la red'], ['BAK', 'Prueba de recuperación reciente'], ['BAK', 'Copia fuera de la oficina'], ['BAK', 'Quién puede borrar las copias']] },
    wifi: { title:'Wi-Fi', tag:'WIFI', foot:'Red de oficina e invitados', items:[
      ['NET', 'Red de invitados separada'], ['NET', 'Cifrado WPA2 / WPA3'], ['NET', 'Clave del equipo cambiada'], ['NET', 'Equipos desconocidos conectados']] },
    cloud:{ title:'Correo y nube', tag:'M365', foot:'Microsoft 365 · Google Workspace · 8 controles', items:[
      ['CLD', 'Doble factor en todas las cuentas'], ['CLD', 'Reenvíos automáticos a mails externos'], ['CLD', 'Archivos compartidos con cualquiera'], ['CLD', 'Cantidad de administradores'], ['CLD', 'Inicio de sesión con protocolos viejos']] }
  };
  var gL = document.getElementById('links'), gN = document.getElementById('nodes');
  LINKS.forEach(function(l){
    var a = N[l[0]], b = N[l[1]];
    ['lk','flow'].forEach(function(cls, k){
      var ln = document.createElementNS(NS, 'line'); ln.setAttribute('x1', a.x); ln.setAttribute('y1', a.y); ln.setAttribute('x2', b.x); ln.setAttribute('y2', b.y);
      ln.setAttribute('class', cls); if (k) ln.style.animationDelay = (-Math.random() * 1.6) + 's'; gL.appendChild(ln);
    });
  });
  var groups = {};
  Object.keys(N).forEach(function(id){
    var n = N[id], g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'nd'); g.setAttribute('transform', 'translate(' + n.x + ' ' + n.y + ')');
    if (n.g) { g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', n.l); }
    g.innerHTML = '<circle class="halo" r="34"></circle><circle class="c" r="34"></circle><text>' + n.t + '</text><text class="lbl" y="54">' + n.l.toUpperCase() + '</text>';
    if (n.g) {
      (groups[n.g] = groups[n.g] || []).push(g);
      g.addEventListener('click', function(){ select(n.g); });
      g.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(n.g); } });
    } else g.style.cursor = 'default';
    gN.appendChild(g);
  });
  var chips = document.getElementById('chips');
  Object.keys(INFO).forEach(function(k){
    var b = document.createElement('button'); b.type = 'button'; b.textContent = INFO[k].title; b.dataset.k = k;
    b.addEventListener('click', function(){ select(k); }); chips.appendChild(b);
  });
  function select(k){
    var inf = INFO[k];
    $$('.nd').forEach(function(g){ g.classList.remove('sel'); });
    (groups[k] || []).forEach(function(g){ g.classList.add('sel'); });
    $$('button', chips).forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.k === k)); });
    $('#pTag').textContent = 'Nodo · ' + inf.tag;
    resetDec($('#pTitle')); $('#pTitle').textContent = inf.title;
    $('#pFoot').textContent = inf.foot;
    $('#pList').innerHTML = inf.items.map(function(it, i){ return '<li><code>' + it[0] + '-' + String(i + 1).padStart(3, '0') + '</code><span>' + it[1] + '</span></li>'; }).join('');
    decrypt($('#pTitle'), 500);
  }
  select('fw');
})();

/* =====================================================================
   CONSOLA que escribe + indicador
   ===================================================================== */
(function(){
  var L = [
    ['p', 'sir@auditoria:~$ ', '', './Audit.ps1 -Task express -AuthorizationId SIR-2026-014'],
    ['ok','[✓] ', '', 'Autorización verificada · modo solo lectura'],
    ['d', '[•] ', '', 'Windows: 14 equipos · 21 controles'],
    ['w', '[!] ', '', 'WIN-021  BitLocker desactivado en 3 notebooks'],
    ['w', '[!] ', '', 'WIN-008  Administrador local compartido'],
    ['d', '[•] ', '', 'Red: RouterOS · 10 controles'],
    ['x', '[X] ', '', 'NET-004  Winbox abierto a internet'],
    ['d', '[•] ', '', 'Nube: Microsoft 365 · 8 controles'],
    ['x', '[X] ', '', 'CLD-002  8 cuentas sin doble factor'],
    ['ok','[✓] ', '', 'Evidencia sellada · sha256 7f3a…c91e'],
    ['ok','[✓] ', '', 'Seudónimos aplicados · 0 nombres reales en la salida'],
    ['p', '> ',   '', 'Informe generado: informe-SIR-2026-014.pdf']
  ];
  var pre = $('#termOut'), ops = $('#ops'), started = false;
  function full(){ pre.innerHTML = L.map(function(l){ return '<span class="' + l[0] + '">' + l[1] + '</span>' + l[3]; }).join('\n') + '\n<span class="caret"></span>'; }
  full();
  function run(){
    if (started) return; started = true; ops.classList.add('run');
    $$('.sev [data-count]').forEach(function(){});
    if (reduce) return;
    var li = 0, ci = 0, html = '';
    (function step(){
      if (li >= L.length) { pre.innerHTML = html + '<span class="caret"></span>'; return; }
      var l = L[li];
      if (ci === 0) html += '<span class="' + l[0] + '">' + l[1] + '</span>';
      var chunk = li === 0 ? 2 : 4;
      html += l[3].slice(ci, ci + chunk); ci += chunk;
      pre.innerHTML = html + '<span class="caret"></span>';
      if (ci >= l[3].length) { html += '\n'; li++; ci = 0; setTimeout(step, li === 1 ? 380 : 140); }
      else setTimeout(step, li === 0 ? 28 : 12);
    })();
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function(es){ if (es[0].isIntersecting) run(); }, { threshold: .35 }).observe(ops);
  else run();
})();

/* ---------------- Planes con inclinación 3D ---------------- */
if (finePointer && !reduce) {
  $$('.tilt').forEach(function(c){
    c.addEventListener('pointermove', function(e){ var b = c.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
      c.style.transform = 'rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg) translateZ(0)'; });
    c.addEventListener('pointerleave', function(){ c.style.transform = ''; });
  });
}

/* ---------------- Candado: se abre al entrar en pantalla (táctil) ---------------- */
if ('IntersectionObserver' in window) new IntersectionObserver(function(es){ $('#unlock').classList.toggle('open', es[0].isIntersecting && !finePointer); }, { threshold: .6 }).observe($('#unlock'));

/* Descifrar el título del hero al cargar */
setTimeout(function(){ decrypt($('.hero h1'), 1100); }, reduce ? 0 : 900);
})();
