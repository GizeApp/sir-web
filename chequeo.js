  // Reemplazar por el número real de WhatsApp (formato internacional, sin + ni espacios)
  const WHATSAPP = '5493413490705';
  const WHATSAPP_VISIBLE = '+54 9 341 349-0705';

  const Q = [
    { tema:'Copias de seguridad', crit:true, cis:'11',
      q:'¿Tienen copia de la información importante (facturación, clientes, archivos)?',
      o:{ A:'Sí, automática, guardada fuera de la oficina o desconectada, y alguna vez probamos recuperarla',
          B:'Sí, pero manual, en un disco que queda enchufado, o nunca la probamos',
          C:'No, o no estoy seguro de que exista' },
      h:'Backup débil o inexistente',
      why:'Un ransomware o un disco roto y se pierde la facturación de años. Si el backup queda enchufado, se cifra junto con todo.',
      fix:'Copia automática a la nube más una copia desconectada. Probá recuperar un archivo una vez por mes.' },
    { tema:'Correo', crit:true, cis:'6.3',
      q:'¿Las cuentas de mail de la empresa (Gmail, Outlook) piden un código al celular para entrar?',
      o:{ A:'Sí, todas', B:'Algunas', C:'No' },
      h:'Mail sin verificación en dos pasos',
      why:'Con una contraseña filtrada pueden leer tu mail, pedirle pagos a tus clientes en tu nombre o cambiar un CBU.',
      fix:'Activá la verificación en dos pasos en todas las cuentas. Lleva unos 15 minutos.' },
    { tema:'Usuarios y contraseñas', cis:'5.2',
      q:'¿Cada persona tiene su propio usuario y contraseña?',
      o:{ A:'Sí, cada uno el suyo', B:'Algunos se comparten (la PC de mostrador, el mail de ventas)', C:'Usamos una misma contraseña para casi todo' },
      h:'Usuarios o contraseñas compartidas',
      why:'Si pasa algo no se sabe quién fue, y una sola contraseña filtrada abre todo.',
      fix:'Un usuario por persona. Para las cuentas que sí o sí se comparten, un gestor de contraseñas.' },
    { tema:'Instalar programas', cis:'5.4',
      q:'¿Cualquier empleado puede instalar programas en su computadora?',
      o:{ A:'No, solo el técnico o el responsable', B:'Algunos sí', C:'Sí, todos' },
      h:'Todos pueden instalar programas',
      why:'Un programa "gratis" o un adjunto infecta la PC con permisos totales.',
      fix:'Usuario estándar para el trabajo diario. Permisos de administrador solo para el responsable.' },
    { tema:'Actualizaciones', cis:'7.3',
      q:'¿Las computadoras están actualizadas?',
      o:{ A:'Sí, Windows 10/11 y se actualizan solas', B:'La mayoría; algunas las posponemos o no sé si se actualizan', C:'Hay alguna con Windows 7 u 8, o las actualizaciones están desactivadas' },
      h:'Equipos desactualizados',
      why:'Las fallas conocidas están publicadas y cualquiera puede aprovecharlas.',
      fix:'Activá las actualizaciones automáticas y planificá el reemplazo de equipos sin soporte.' },
    { tema:'Antivirus', cis:'10.1',
      q:'¿Todas las computadoras tienen antivirus activo?',
      o:{ A:'Sí, todas, y alguien lo controla', B:'Creo que sí, o solo algunas', C:'No' },
      h:'Antivirus sin control',
      why:'Sin protección o con la licencia vencida, nadie se entera de una infección.',
      fix:'Microsoft Defender activo en todas las PCs y una revisión del estado una vez por semana.' },
    { tema:'Wi-Fi', cis:'12',
      q:'¿Los clientes o visitas se conectan a la misma Wi-Fi que las computadoras de trabajo?',
      o:{ A:'No, hay una Wi-Fi aparte para invitados', B:'Sí, pero cambiamos la contraseña de fábrica del router', C:'Sí, y el router tiene la configuración de fábrica' },
      h:'Wi-Fi compartida con visitas',
      why:'Un celular infectado de una visita queda en la misma red que la facturación.',
      fix:'Armá una red de invitados separada y cambiá la clave de administración del router.' },
    { tema:'Cuando alguien se va', cis:'6.2',
      q:'Cuando un empleado deja la empresa, ¿se le cortan los accesos (mail, sistemas, Wi-Fi)?',
      o:{ A:'Sí, el mismo día', B:'A veces, o tarda', C:'No hay un procedimiento' },
      h:'Bajas de personal sin procedimiento',
      why:'Un ex empleado puede seguir entrando al mail o al sistema meses después.',
      fix:'Una lista de baja (mail, sistemas, Wi-Fi, accesos remotos) que se completa el mismo día.' },
    { tema:'Notebooks y celulares', cis:'3.6',
      q:'Si se pierde o roban una notebook o celular de trabajo, ¿la información está protegida?',
      o:{ A:'Sí, tienen contraseña y el disco está cifrado', B:'Tienen contraseña, pero no sé si están cifrados', C:'No, o algunos no tienen ni contraseña' },
      h:'Equipos portátiles sin cifrar',
      why:'Una notebook robada deja expuestos los datos de tus clientes, con consecuencias bajo la Ley 25.326.',
      fix:'Activá BitLocker (Windows) o FileVault (Mac) y PIN en los celulares.' },
    { tema:'Acceso remoto', cis:'6.4',
      q:'¿Alguien externo (técnico, proveedor del sistema) se conecta a distancia (AnyDesk, TeamViewer, etc.)?',
      o:{ A:'No, o solo cuando nosotros lo habilitamos en el momento', B:'Sí, y no sé bien cuándo ni cómo se conecta', C:'Sí, tiene acceso permanente con contraseña fija' },
      h:'Acceso remoto sin control',
      why:'Un acceso permanente con clave fija es una de las puertas más usadas en ataques a pymes.',
      fix:'Acceso solo a pedido, con clave que cambia y verificación en dos pasos. Registrá quién entra.' },
  ];
  const PRIORIDAD = [0, 1, 8, 9, 7, 4, 2, 5, 3, 6];   // orden de desempate (preguntas 1,2,9,10,8,5,3,6,4,7)
  const PUNTOS = { A:0, B:1, '?':1, C:2 };

  let state = { step:'intro', ans:{}, info:{} };
  const $ = id => document.getElementById(id);

  // --- Cálculo (función pura) -------------------------------------------
  function evaluar(ans) {
    let score = 0, unsure = 0;
    Q.forEach((q, i) => {
      const a = ans[i]; if (!a) return;
      score += PUNTOS[a] * (q.crit ? 2 : 1);
      if (a === '?') unsure++;
    });
    let lvl = score <= 5 ? 0 : score <= 12 ? 1 : 2;           // 0 bajo, 1 medio, 2 alto
    if (ans[0] === 'C' || ans[1] === 'C') lvl = Math.max(lvl, 1);
    if (ans[0] === 'C' && ans[1] === 'C') lvl = 2;
    if (unsure >= 4) lvl = Math.max(lvl, 1);
    const sev = { C:3, '?':2, B:1, A:0 };
    const top = PRIORIDAD.filter(i => sev[ans[i]] > 0)
      .sort((x, y) => sev[ans[y]] - sev[ans[x]] || PRIORIDAD.indexOf(x) - PRIORIDAD.indexOf(y))
      .slice(0, 3);
    return { score, max:24, lvl, unsure, top };
  }

  // --- Vistas ------------------------------------------------------------
  function show(step) {
    state.step = step;
    $('intro').hidden = step !== 'intro';
    $('quiz').hidden = typeof step !== 'number';
    $('result').hidden = step !== 'result';
    if (typeof step === 'number') renderQ(step);
    if (step === 'result') renderResult();
    window.scrollTo(0, 0);
  }

  function renderQ(i) {
    const q = Q[i];
    $('progress').innerHTML = Q.map((_, j) => `<i class="${j < i ? 'done' : j === i ? 'now' : ''}"></i>`).join('');
    $('count').textContent = `${String(i + 1).padStart(2, '0')} / 10`;
    $('back').style.visibility = 'visible';
    const opts = [...Object.entries(q.o), ['?', 'No sé']];
    $('qForm').innerHTML = `
      <fieldset>
        <legend><span class="eyebrow qtema"><b>${String(i + 1).padStart(2, '0')}</b> / ${q.tema}</span><h2>${q.q}</h2></legend>
        <div class="opts">${opts.map(([k, t]) => `
          <label class="opt${k === '?' ? ' unsure' : ''}" for="q${i}-${k === '?' ? 'u' : k}">
            <input type="radio" name="q" id="q${i}-${k === '?' ? 'u' : k}" value="${k}" ${state.ans[i] === k ? 'checked' : ''}>
            <span class="k">${k}</span><span class="t">${t}</span>
          </label>`).join('')}
        </div>
      </fieldset>`;
  }

  // --- Identificación del informe ---------------------------------------
  const METODO = 'Metodología SIR v1.0 · CIS Controls v8 (IG1)';
  function nuevoInforme() {
    const d = new Date(), p = n => String(n).padStart(2, '0');
    const rnd = crypto.getRandomValues(new Uint16Array(1))[0].toString(16).toUpperCase().padStart(4, '0');
    return {
      id: `CHK-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${rnd}`,
      fecha: `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`,
    };
  }
  const RESP = { A:'A', B:'B', C:'C', '?':'No sé' };

  function renderResult() {
    const r = evaluar(state.ans);
    if (!state.informe) state.informe = nuevoInforme();
    const inf = state.informe;
    const L = [
      { name:'Riesgo bajo', cls:'g', txt:'Tienen buenas bases. Lo que sigue es confirmar que lo que declaraste es así en todos los equipos.' },
      { name:'Riesgo medio', cls:'a', txt:'Nada para alarmarse, pero hay puntos concretos que conviene resolver pronto. La mayoría tiene solución simple.' },
      { name:'Riesgo alto', cls:'r', txt:'Hay riesgos que hoy podrían frenar la empresa si pasa algo. La buena noticia: se resuelven rápido una vez que sabés dónde están.' },
    ][r.lvl];
    const sevTag = a => a === 'C' ? '<span class="tag sev-C">Urgente</span>' : a === '?' ? '<span class="tag sev-u">No sabés</span>' : '<span class="tag sev-B">A mejorar</span>';
    const prios = r.top.map(i => {
      const q = Q[i], a = state.ans[i];
      return `<li class="prio"><div>
        <h3>${q.h}</h3>
        <p>${a === '?' ? 'No sabés cómo está esto, y eso también es un riesgo. ' : ''}${q.why}</p>
        <p class="fix"><b>Qué hacer:</b> ${q.fix}</p>
        <div class="tags">${sevTag(a)}<span class="tag">CIS v8 · ${q.cis}</span></div>
      </div></li>`;
    }).join('');
    const filas = Q.map((q, i) => {
      const a = state.ans[i] || '?';
      return `<tr><td>${String(i + 1).padStart(2, '0')}</td><td>${q.tema}</td><td>CIS ${q.cis}</td>
        <td class="ans ans-${a === '?' ? 'u' : a}">${RESP[a]}${a === '?' ? '' : ' · ' + esc(q.o[a])}</td></tr>`;
    }).join('');
    $('result').innerHTML = `
      <div class="print-head" aria-hidden="true">Autoevaluación de ciberseguridad · SIR · Seguridad Informática Rosario</div>
      <span class="eyebrow"><b>Resultado</b> / ${esc(state.info.empresa || 'Tu empresa')}</span>
      <dl class="ident">
        <div><dt>Informe</dt><dd>${inf.id}</dd></div>
        <div><dt>Fecha</dt><dd>${inf.fecha}</dd></div>
        <div><dt>Equipos</dt><dd>${esc(state.info.pcs)}</dd></div>
        ${state.info.rubro ? `<div><dt>Rubro</dt><dd>${esc(state.info.rubro)}</dd></div>` : ''}
      </dl>
      <div class="verdict">
        <div>
          <h1 class="lvl-${L.cls}">${L.name}</h1>
          <div class="score">PUNTAJE DE RIESGO ${r.score} / ${r.max}${r.unsure ? ` · ${r.unsure} "NO SÉ"` : ''}</div>
          <p class="reading">${L.txt}</p>
        </div>
      </div>
      ${r.top.length ? `<h2>Tus ${r.top.length === 1 ? 'prioridad' : r.top.length + ' prioridades'}</h2><ol class="prios">${prios}</ol>`
                     : `<p class="lead">No marcaste ningún punto débil. Excelente punto de partida.</p>`}
      <details class="method" id="method">
        <summary>Tus respuestas y cómo se calcula el resultado</summary>
        <table class="answers">
          <thead><tr><th>#</th><th>Tema</th><th>Control</th><th>Tu respuesta</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
        <h3>Cálculo</h3>
        <ul>
          <li>Cada respuesta suma puntos de riesgo: <b>A = 0</b>, <b>B o "No sé" = 1</b>, <b>C = 2</b>.</li>
          <li>Copias de seguridad y correo son <b>críticos</b> y valen el doble. Máximo posible: 24.</li>
          <li><b>Riesgo bajo</b> 0 a 5 · <b>Riesgo medio</b> 6 a 12 · <b>Riesgo alto</b> 13 o más.</li>
          <li>Si copias de seguridad o correo están en C, el resultado es al menos riesgo medio; si están las dos, es riesgo alto. Con 4 o más "No sé", al menos riesgo medio.</li>
          <li>Las prioridades se ordenan por gravedad de la respuesta y, a igual gravedad, por el impacto del control.</li>
        </ul>
        <p class="note">Cada pregunta corresponde a una salvaguarda de los CIS Controls v8, grupo de implementación 1 (higiene básica para organizaciones chicas). ${METODO}.</p>
      </details>
      <div class="actions">
        <button class="btn btn-line" type="button" id="pdf">Descargar informe en PDF</button>
      </div>
      <div class="cta">
        <h2>¿Querés ver el estado real de cada equipo?</h2>
        <p>Esto es lo que vos nos contaste. La Auditoría Pyme lo verifica en el lugar: medio día en tu empresa, solo lectura, sin frenar nada, e informe en 72 hs con un plan priorizado.</p>
        <div class="row">
          <a class="btn btn-ink" id="wa" href="${waLink(r)}" target="_blank" rel="noopener">Enviar resultado por WhatsApp <span aria-hidden="true">→</span></a>
          <button class="btn btn-ghost" type="button" id="copy">Copiar resultado</button>
          <span class="copied" id="copied" role="status"></span>
        </div>
        <div class="num">WhatsApp: ${WHATSAPP_VISIBLE} · o por DM en Instagram</div>
      </div>
      <p class="note disclaimer">Este chequeo es una autoevaluación orientativa basada en tus respuestas: no verifica los equipos, no reemplaza una auditoría ni garantiza la seguridad de tus sistemas. Tus respuestas no se envían a ningún servidor. ${inf.id} · ${METODO}.</p>
      <button class="btn btn-ghost" type="button" id="restart">↺ Hacer el chequeo de nuevo</button>`;
  }

  function resumen(r) {
    const L = ['RIESGO BAJO', 'RIESGO MEDIO', 'RIESGO ALTO'][r.lvl];
    const resp = Q.map((_, i) => `${i + 1}${state.ans[i]}`).join(' ');
    const i = state.info;
    return `Hola SIR! Hice el chequeo inicial (${state.informe ? state.informe.id : 'sin ID'}).\n` +
      `Empresa: ${i.empresa || '-'} (${i.rubro || 'rubro sin indicar'}, ${i.pcs} PCs)\n` +
      `Resultado: ${L} (${r.score}/24)\n` +
      `Respuestas: ${resp}\n` +
      `Me interesa saber más sobre la auditoría.`;
  }
  const waLink = r => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(resumen(r))}`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

  // --- Eventos -------------------------------------------------------------
  $('introForm').addEventListener('submit', e => {
    e.preventDefault();
    state.info = { empresa:$('empresa').value.trim(), rubro:$('rubro').value.trim(), pcs:$('pcs').value };
    show(0);
  });
  $('qForm').addEventListener('change', e => {
    if (e.target.name !== 'q') return;
    const i = state.step;
    state.ans[i] = e.target.value;
    setTimeout(() => show(i < Q.length - 1 ? i + 1 : 'result'), 220);
  });
  $('back').addEventListener('click', () => show(state.step > 0 ? state.step - 1 : 'intro'));
  $('result').addEventListener('click', e => {
    if (e.target.closest('#restart')) { state.ans = {}; state.informe = null; show('intro'); }
    if (e.target.closest('#pdf')) {
      const m = $('method'), abierto = m.open;
      const prev = document.title;
      document.title = `SIR ${state.informe.id}`;   // nombre sugerido del PDF
      m.open = true;
      window.print();
      m.open = abierto;
      document.title = prev;
    }
    if (e.target.closest('#copy')) {
      const txt = resumen(evaluar(state.ans));
      const ok = () => { $('copied').textContent = 'Copiado'; };
      try {
        navigator.clipboard.writeText(txt).then(ok, () => { $('copied').textContent = 'Copiá el texto: ' + txt; });
      } catch { $('copied').textContent = 'Copiá el texto: ' + txt; }
    }
  });

  // Conserva el progreso si la página se actualiza mientras alguien la está usando
  window.claude?.hot?.snapshot?.(() => state);
  const start = data => {
    if (data && data.step !== undefined) { state = data; }
    show(state.step);
  };
  window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});
