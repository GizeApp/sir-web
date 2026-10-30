/* ---------------- Movimiento: scroll, aparición, interruptor y detalles ---------------- */
(function(){
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(id){ return document.getElementById(id); };

  // Interruptor Sin revisar / Con SIR (también funciona con "reducir movimiento")
  var sw = $('sw'), risks = $('risks'), out = $('riskOut'), tocado = false, base = out ? out.textContent : '';
  function pone(on){
    sw.setAttribute('aria-checked', on ? 'true' : 'false'); risks.classList.toggle('on', on);
    out.textContent = on ? 'Con la lista de SIR, cada descuido tiene su solución y sabés por cuál empezar.' : base;
  }
  if (sw) sw.addEventListener('click', function(){ tocado = true; pone(sw.getAttribute('aria-checked') !== 'true'); });

  // Qué revisamos: elegir a mano sigue funcionando
  var lis = [].slice.call(document.querySelectorAll('#showList li')), panels = [].slice.call(document.querySelectorAll('#showStage .panel')),
      dots = [].slice.call(document.querySelectorAll('#showDots i')), show = $('revisamos'), actual = 0;
  function elige(i){
    if (i === actual) return; actual = i;
    [lis, panels, dots].forEach(function(g){ g.forEach(function(el, j){ el.classList.toggle('on', j === i); }); });
  }
  lis.forEach(function(li, i){ li.addEventListener('click', function(){
    if (reduce) return elige(i);
    var r = show.getBoundingClientRect(), tramo = show.offsetHeight - innerHeight;
    scrollTo({ top: scrollY + r.top + tramo * (i + .5) / lis.length, behavior:'smooth' });
  }); });
  if (reduce) return;

  // Aparición al entrar en pantalla
  var els = [].slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){
      if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target);
    }); }, { threshold:.12, rootMargin:'0px 0px -6% 0px' });
    els.forEach(function(el){ io.observe(el); });
    // El interruptor no cambia solo: da una pista una vez, la primera vez que se ve
    if (sw) { var iop = new IntersectionObserver(function(es){ if (!es[0].isIntersecting) return; iop.disconnect();
      setTimeout(function(){ if (!tocado) sw.classList.add('pista'); }, 1200); }, { threshold:1 }); iop.observe(sw); }
    // Lo que se repite se frena cuando la portada sale de pantalla
    var hero = document.querySelector('.hero');
    new IntersectionObserver(function(es){ hero.classList.toggle('quieto', !es[0].isIntersecting); }).observe(hero);
  } else els.forEach(function(el){ el.classList.add('in'); });

  // Todo lo que depende del scroll, en un solo cuadro
  var root = document.documentElement, prog = $('progress'), sheetW = $('sheetW'), steps = $('steps'), pend = false;
  function cuadro(){
    pend = false;
    var y = scrollY, H = innerHeight;
    prog.style.setProperty('--p', Math.min(1, y / Math.max(1, root.scrollHeight - H)).toFixed(4));
    sheetW.style.setProperty('--s', Math.min(1, y / 600).toFixed(3));
    var r = show.getBoundingClientRect(), tramo = show.offsetHeight - H;
    if (tramo > 0) elige(Math.max(0, Math.min(lis.length - 1, Math.floor(-r.top / tramo * lis.length))));
    var s = steps.getBoundingClientRect();
    steps.style.setProperty('--l', Math.max(0, Math.min(1, (H * .85 - s.top) / (H * .55))).toFixed(3));
  }
  function pide(){ if (!pend) { pend = true; requestAnimationFrame(cuadro); } }
  addEventListener('scroll', pide, { passive:true }); addEventListener('resize', pide); cuadro();

  // Con mouse: la hoja se inclina y el resplandor sigue al puntero en los planes
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    var sheet = $('sheet');
    sheet.addEventListener('pointermove', function(e){
      var r = sheet.getBoundingClientRect();
      sheet.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 8).toFixed(2) + 'deg');
      sheet.style.setProperty('--rx', ((.5 - (e.clientY - r.top) / r.height) * 8).toFixed(2) + 'deg');
    });
    sheet.addEventListener('pointerleave', function(){ sheet.style.setProperty('--rx', '0deg'); sheet.style.setProperty('--ry', '0deg'); });
    [].forEach.call(document.querySelectorAll('.plan'), function(pl){
      pl.addEventListener('pointermove', function(e){
        var r = pl.getBoundingClientRect();
        pl.style.setProperty('--mx', (e.clientX - r.left) + 'px'); pl.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }
})();

/* ---------------- WhatsApp flotante: mensaje una vez por visita ---------------- */
(function(){
  'use strict';
  var bubble = document.getElementById('waBubble'), close = document.getElementById('waClose');
  if (!bubble) return;
  var seen = false;
  try { seen = sessionStorage.getItem('sir-wa') === '1'; } catch(e) {}
  var dismissed = false;
  function hide(){ dismissed = true; bubble.hidden = true; try { sessionStorage.setItem('sir-wa', '1'); } catch(e) {} }
  close.addEventListener('click', hide);
  bubble.querySelector('a').addEventListener('click', hide);
  document.querySelector('.wa-btn').addEventListener('click', hide);
  if (!seen) setTimeout(function(){ if (!dismissed) bubble.hidden = false; }, 7000);
})();

/* ---------------- Pedido rápido: arma el mensaje y abre WhatsApp (no se guarda ni se envía nada a otro lado) ---------------- */
(function(){
  'use strict';
  var WA = 'https://wa.me/5493413490705?text=';
  [].forEach.call(document.querySelectorAll('form[data-ask]'), function(f){
    var nota = f.querySelector('.ask-n'), notaBase = nota.textContent;
    [].forEach.call(f.querySelectorAll('select'), function(s){
      var pinta = function(){ s.classList.toggle('empty', !s.value); };
      s.addEventListener('change', pinta); pinta();
    });
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var v = function(n){ return f.elements[n].value.trim(); };
      var nombre = v('nombre'), empresa = v('empresa'), equipos = v('equipos'), interes = v('interes');
      if (!nombre) {
        f.elements.nombre.setAttribute('aria-invalid', 'true'); f.elements.nombre.focus();
        nota.textContent = 'Poné tu nombre así sabemos con quién hablamos.'; nota.classList.add('err');
        return;
      }
      f.elements.nombre.removeAttribute('aria-invalid'); nota.textContent = notaBase; nota.classList.remove('err');
      var msg = 'Hola SIR! Soy ' + nombre + (empresa ? ', de ' + empresa : '') + '.';
      if (equipos) msg += ' Tenemos ' + equipos + ' computadoras.';
      msg += ' Quiero asesoramiento sobre ' + (interes || 'qué me conviene') + '.';
      window.open(WA + encodeURIComponent(msg), '_blank', 'noopener');
    });
  });
})();
