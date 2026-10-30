/* ==========================================================================
   APP — interfaz, navegación y lógica de pantallas
   ========================================================================== */
(function () {
  'use strict';

  var S = window.Store;
  var DB = window.DB;
  var FIG = window.FIG;

  S.init();

  var DOW = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  var DOW_LONG = ['', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  var MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  var ui = {
    route: { name: 'hoy' },
    session: null,
    editor: null,
    picker: null,
    exSheet: null
  };

  // ------------------------------------------------------------------ utils
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function todayDOW() { return ((new Date().getDay() + 6) % 7) + 1; }
  function fmtDate(iso) {
    var d = new Date(iso + 'T00:00:00');
    return d.getDate() + ' ' + MONTHS[d.getMonth()];
  }
  function fmtRest(sec) { var m = Math.floor(sec / 60), s = sec % 60; return m + ':' + String(s).padStart(2, '0'); }
  function units() { return S.state.settings.units === 'lb' ? 'lb' : 'kg'; }
  function uid(p) { return S.uid(p); }

  var toastTimer = null;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  function go(hash) {
    if (location.hash === hash) { render(); return; }
    location.hash = hash;
  }

  function ico(name) {
    var paths = {
      hoy: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>',
      rutinas: '<path d="M4 6h16M4 12h16M4 18h10"/>',
      ejercicios: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
      progreso: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
      ajustes: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
      back: '<path d="M15 18l-6-6 6-6"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      pdf: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>',
      play: '<path d="M6 4l14 8-14 8z"/>',
      more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
      check: '<path d="M20 6 9 17l-5-5"/>',
      search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || '') + '</svg>';
  }

  function iconBtn(act, id, name, label) {
    return '<button class="icon-btn" data-act="' + act + '"' + (id ? ' data-id="' + esc(id) + '"' : '') +
      ' aria-label="' + esc(label || name) + '">' + ico(name) + '</button>';
  }

  // ---------------------------------------------------------------- router
  function parseHash() {
    var h = location.hash.replace(/^#\/?/, '');
    var parts = h.split('/').filter(Boolean);
    if (!parts.length) return { name: 'hoy' };
    if (parts[0] === 'rutinas' && parts[1]) return { name: 'rutina', id: parts[1] };
    if (parts[0] === 'sesion' && parts[1]) return { name: 'sesion', rid: parts[1], dayId: parts[2] };
    if (parts[0] === 'editar') return { name: 'editar', rid: parts[1] || null };
    if (['hoy', 'rutinas', 'ejercicios', 'progreso', 'ajustes'].indexOf(parts[0]) >= 0) return { name: parts[0] };
    return { name: 'hoy' };
  }

  function isTabRoute(name) { return ['hoy', 'rutinas', 'ejercicios', 'progreso', 'ajustes'].indexOf(name) >= 0; }

  function currentTab() {
    var r = ui.route;
    if (r.name === 'rutina' || r.name === 'editar') return 'rutinas';
    if (r.name === 'sesion') return 'hoy';
    return r.name;
  }

  function render() {
    if (ui.route && ui.route.name !== 'sesion') {
      if (typeof clockTimer !== 'undefined') clearInterval(clockTimer);
      if (typeof restTimer !== 'undefined') clearInterval(restTimer);
      var rb = $('#rest-bar'); if (rb) rb.remove();
    }
    ui.route = parseHash();
    var r = ui.route;
    var html = '', title = '', back = false;

    if (r.name === 'hoy') { html = viewHoy(); title = ''; }
    else if (r.name === 'rutinas') { html = viewRutinas(); title = 'Rutinas'; }
    else if (r.name === 'rutina') { html = viewRoutineDetail(r.id); back = true; }
    else if (r.name === 'ejercicios') { html = viewEjercicios(); title = 'Ejercicios'; }
    else if (r.name === 'progreso') { html = viewProgreso(); title = 'Progreso'; }
    else if (r.name === 'ajustes') { html = viewAjustes(); title = 'Ajustes'; }
    else if (r.name === 'sesion') { html = viewSesion(r.rid, r.dayId); back = true; }
    else if (r.name === 'editar') { html = viewEditor(r.rid); back = true; }

    var tb = $('#topbar');
    if (back) {
      tb.innerHTML = '<button class="icon-btn" data-act="back" aria-label="Atrás">' + ico('back') + '</button>' +
        '<div style="flex:1"><h1 id="page-title">' + esc(title || '') + '</h1></div>';
    } else if (title) {
      tb.innerHTML = '<h1 id="page-title">' + esc(title) + '</h1>' +
        (title === 'Rutinas' ? '<button class="icon-btn" data-act="gen" aria-label="Generar rutina">' + ico('plus') + '</button>' : '');
    } else {
      tb.innerHTML = '<div style="flex:1"><div class="sub" id="greet">' + greeting() + '</div>' +
        '<h1 id="page-title">GYMFLOW</h1></div>' +
        '<button class="icon-btn" data-act="go-ajustes" aria-label="Ajustes">' + ico('ajustes') + '</button>';
    }

    $('#view').innerHTML = html;
    renderTabbar();
    bind();
    window.scrollTo(0, 0);
  }

  function greeting() {
    var h = new Date().getHours();
    var name = S.state.settings.name ? ', ' + S.state.settings.name : '';
    if (h < 6) return 'Buenas noches' + name;
    if (h < 13) return 'Buenos días' + name;
    if (h < 20) return 'Buenas tardes' + name;
    return 'Buenas noches' + name;
  }

  function renderTabbar() {
    var tab = currentTab();
    var items = [['hoy', 'Hoy'], ['rutinas', 'Rutinas'], ['ejercicios', 'Ejercicios'], ['progreso', 'Progreso'], ['ajustes', 'Ajustes']];
    $('#tabbar').innerHTML = items.map(function (it) {
      return '<button data-act="tab" data-tab="' + it[0] + '" class="' + (tab === it[0] ? 'on' : '') + '">' +
        ico(it[0]) + '<span>' + it[1] + '</span></button>';
    }).join('');
  }

  // ------------------------------------------------------------------ HOME
  function plannedDays() {
    var st = S.state.settings;
    return st.weekdays.slice(0, st.days);
  }

  function sessionFor(dateISO) {
    var r = S.activeRoutine();
    if (!r) return null;
    var dow = todayDOW();
    var idx = plannedDays().indexOf(dow);
    if (idx < 0 || idx >= r.days.length) return null;
    return { routine: r, day: r.days[idx], index: idx };
  }

  function viewHoy() {
    var r = S.activeRoutine();
    var st = S.state.settings;

    if (!r) {
      return introCard();
    }

    var today = todayDOW();
    var plan = plannedDays();
    var idx = plan.indexOf(today);
    var day = idx >= 0 ? r.days[idx] : null;
    var doneToday = day ? S.logFor(S.todayISO(), r.id, day.id) : null;

    var weekHTML = '<div class="week">' + [1, 2, 3, 4, 5, 6, 7].map(function (d) {
      var i = plan.indexOf(d);
      var isTrain = i >= 0 && i < r.days.length;
      var dISO = isoOfWeekday(d);
      var done = isTrain && S.logs().some(function (l) { return l.date === dISO; });
      return '<div class="d ' + (isTrain ? 'train ' : '') + (d === today ? 'today ' : '') + (done ? 'done' : '') + '">' +
        DOW[d] + '<b>' + new Date(dISO + 'T00:00:00').getDate() + '</b></div>';
    }).join('') + '</div>';

    var hero = '';
    if (day) {
      var prev = S.lastLogForExercise(day.exercises[0] ? day.exercises[0].exId : '');
      hero =
        '<div class="card" style="background:linear-gradient(160deg, rgba(198,242,78,.12), rgba(20,27,36,1) 55%);border-color:rgba(198,242,78,.28)">' +
          '<div class="row-between">' +
            '<div><div class="tiny" style="letter-spacing:.12em;text-transform:uppercase;color:var(--accent);font-weight:700">' +
              (doneToday ? 'Entrenamiento hecho' : 'Hoy toca') + '</div>' +
              '<h2 style="font-size:26px;margin-top:4px">' + esc(day.name) + '</h2></div>' +
            '<div class="badge grey">Día ' + (idx + 1) + '</div>' +
          '</div>' +
          '<div class="small muted" style="margin-top:6px">' + day.exercises.length + ' ejercicios · ~' + (day.estimated || 45) + ' min · ' + esc(r.name) + '</div>' +
          '<div style="margin-top:14px;display:grid;gap:6px">' +
            day.exercises.slice(0, 4).map(function (e) {
              var ex = DB.byId[e.exId]; if (!ex) return '';
              return '<div class="row small" style="gap:8px;color:#c3d0df"><span style="width:6px;height:6px;border-radius:50%;background:' +
                (DB.groupById(ex.g) || {}).color + '"></span>' + esc(ex.n) +
                '<span class="muted tiny" style="margin-left:auto">' + e.sets + '×' + esc(e.reps) + '</span></div>';
            }).join('') +
            (day.exercises.length > 4 ? '<div class="tiny muted">+ ' + (day.exercises.length - 4) + ' más</div>' : '') +
          '</div>' +
          '<div class="btn-row" style="margin-top:16px">' +
            '<button class="btn primary" data-act="start" data-rid="' + r.id + '" data-day="' + day.id + '">' +
              ico('play') + (doneToday ? 'Repetir o editar' : 'Empezar') + '</button>' +
            '<button class="btn" data-act="go-routine" data-id="' + r.id + '">Ver rutina</button>' +
          '</div>' +
        '</div>';
    } else {
      var nextIdx = nextTrainingIndex();
      hero =
        '<div class="card">' +
          '<div class="tiny" style="letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:700">Hoy</div>' +
          '<h2 style="font-size:24px;margin-top:4px">Día de descanso</h2>' +
          '<p class="small muted" style="margin-top:6px">Descansa, come bien y duerme. El músculo crece cuando no entrenas.</p>' +
          (nextIdx ? '<div style="margin-top:14px" class="row-between"><div class="small">Siguiente: <b>' + esc(r.days[nextIdx.i].name) +
            '</b> · ' + DOW_LONG[nextIdx.dow] + '</div><button class="btn sm" data-act="start" data-rid="' + r.id + '" data-day="' +
            r.days[nextIdx.i].id + '">Adelantar</button></div>' : '') +
          '<div class="btn-row" style="margin-top:14px"><button class="btn" data-act="pick-day" data-rid="' + r.id + '">Entrenar otro día</button></div>' +
        '</div>';
    }

    // estadísticas rápidas
    var week = S.logs().filter(function (l) { return l.date >= isoOfWeekday(1); });
    var vol = 0;
    week.forEach(function (l) { (l.entries || []).forEach(function (en) { (en.sets || []).forEach(function (s) { if (s.done !== false) vol += (Number(s.w) || 0) * (Number(s.r) || 0); }); }); });
    var stats =
      '<div class="stat-grid">' +
        '<div class="stat"><div class="v">' + week.length + '<small>/' + plan.length + '</small></div><div class="l">Entrenos esta semana</div></div>' +
        '<div class="stat"><div class="v">' + (vol >= 1000 ? (vol / 1000).toFixed(1) + '<small>t</small>' : Math.round(vol) + '<small>' + units() + '</small>') + '</div><div class="l">Volumen semanal</div></div>' +
      '</div>';

    var recent = S.logsSorted().slice(0, 3);
    var recentHTML = recent.length ? '<div class="card"><div class="h-row"><h3>Últimos entrenos</h3><button class="btn sm ghost" data-act="tab" data-tab="progreso">Ver todo</button></div>' +
      recent.map(function (l) {
        var n = (l.entries || []).reduce(function (a, e) { return a + (e.sets || []).filter(function (s) { return s.done !== false; }).length; }, 0);
        return '<div class="row-between" style="padding:10px 0;border-top:1px solid var(--line);margin-top:4px">' +
          '<div><div style="font-weight:600;font-size:14px">' + esc(l.dayName || 'Entreno') + '</div>' +
          '<div class="tiny muted">' + fmtDate(l.date) + ' · ' + n + ' series' + (l.routineName ? ' · ' + esc(l.routineName) : '') + '</div></div>' +
          '<button class="btn sm ghost" data-act="open-log" data-id="' + l.id + '">Ver</button></div>';
      }).join('') + '</div>' : '';

    return '<div>' + hero + '<div class="card tight" style="margin-top:14px">' + weekHTML +
      '<div class="tiny muted center" style="margin-top:10px">' + plan.length + ' días/semana · ' + esc(r.name) + '</div></div>' +
      stats + recentHTML + '</div>';
  }

  function isoOfWeekday(dow) {
    var d = new Date();
    var cur = todayDOW();
    d.setDate(d.getDate() + (dow - cur));
    return S.todayISO(d);
  }

  function nextTrainingIndex() {
    var r = S.activeRoutine();
    if (!r) return null;
    var plan = plannedDays();
    for (var k = 1; k <= 7; k++) {
      var dow = ((todayDOW() - 1 + k) % 7) + 1;
      var i = plan.indexOf(dow);
      if (i >= 0 && i < r.days.length) return { dow: dow, i: i };
    }
    return null;
  }

  function introCard() {
    return '<div class="card" style="background:linear-gradient(160deg, rgba(198,242,78,.14), rgba(20,27,36,1) 60%);border-color:rgba(198,242,78,.3)">' +
      '<div class="tiny" style="letter-spacing:.12em;text-transform:uppercase;color:var(--accent);font-weight:700">Bienvenido</div>' +
      '<h2 style="font-size:25px;margin-top:6px;line-height:1.15">Tu entrenamiento,<br>organizado y equilibrado</h2>' +
      '<p class="small muted" style="margin-top:10px">Elige cuántos días entrenas y la app crea una rutina equilibrada para 45 minutos, con ejercicios de gimnasio clasificados por músculo.</p>' +
      '<button class="btn primary block" style="margin-top:16px" data-act="gen">Generar mi rutina</button>' +
      '<button class="btn block ghost" style="margin-top:10px" data-act="new-routine">Crear rutina manualmente</button>' +
      '</div>' +
      '<div class="card"><h3>Qué incluye</h3>' +
      '<div class="small muted" style="margin-top:8px;display:grid;gap:8px">' +
      '<div>🏋️ ' + DB.exercises.length + ' ejercicios con dibujo de ejecución</div>' +
      '<div>🎯 Reparto de volumen equilibrado por grupo muscular</div>' +
      '<div>⏱️ Rutinas ajustadas a 30, 45, 60 o 90 minutos</div>' +
      '<div>📝 Registro de pesos, series y progreso</div>' +
      '<div>📄 Exportación a PDF A4 lista para imprimir</div>' +
      '</div></div>';
  }

  // --------------------------------------------------------------- RUTINAS
  function viewRutinas() {
    var routines = S.routines();
    var active = S.activeRoutine();
    var head =
      '<div class="btn-row">' +
        '<button class="btn primary" data-act="gen">' + ico('plus') + 'Generar rutina</button>' +
        '<button class="btn" data-act="new-routine">' + ico('plus') + 'Crear a mano</button>' +
      '</div>';

    if (!routines.length) {
      return head + '<div class="empty"><div class="ico">🗂️</div><h3>Sin rutinas todavía</h3>' +
        '<p>Genera una automática según tus días y tu tiempo, o crea la tuya eligiendo ejercicios.</p></div>';
    }

    return head + routines.map(function (r) {
      var totalEx = r.days.reduce(function (a, d) { return a + d.exercises.length; }, 0);
      var isActive = active && active.id === r.id;
      return '<div class="card rt-card" data-act="go-routine" data-id="' + r.id + '">' +
        (isActive ? '<div class="badge">Activa</div>' : '') +
        '<div class="name">' + esc(r.name) + '</div>' +
        '<div class="meta">' + r.days.length + ' días/semana · ' + totalEx + ' ejercicios' +
          (r.meta && r.meta.split ? ' · ' + esc(r.meta.split) : '') + '</div>' +
        '<div class="row" style="margin-top:14px;gap:8px">' +
          '<button class="btn sm" data-act="go-routine" data-id="' + r.id + '">Ver</button>' +
          '<button class="btn sm" data-act="pdf" data-id="' + r.id + '">' + ico('pdf') + 'PDF</button>' +
          (isActive ? '' : '<button class="btn sm ghost" data-act="activate" data-id="' + r.id + '">Activar</button>') +
        '</div>' +
      '</div>';
    }).join('');
  }

  function viewRoutineDetail(id) {
    var r = S.routine(id);
    if (!r) return '<div class="empty"><h3>Rutina no encontrada</h3></div>';
    $('#page-title') && ($('#page-title').textContent = r.name);

    var totalEx = r.days.reduce(function (a, d) { return a + d.exercises.length; }, 0);
    var isActive = S.activeRoutine() && S.activeRoutine().id === r.id;

    var days = r.days.map(function (d, i) {
      var mins = d.estimated || 45;
      return '<div class="card tight" style="margin-top:10px">' +
        '<div class="row-between">' +
          '<div><div class="tiny muted">DÍA ' + (i + 1) + '</div><div style="font-weight:700;font-size:16px">' + esc(d.name) + '</div></div>' +
          '<div class="tiny muted">' + d.exercises.length + ' ej · ~' + mins + ' min</div>' +
        '</div>' +
        '<div style="margin-top:6px">' + d.exercises.map(function (e) {
          var ex = DB.byId[e.exId];
          if (!ex) return '';
          var g = DB.groupById(ex.g);
          return '<div class="ex-row" data-act="ex" data-id="' + ex.id + '">' +
            '<div class="ex-thumb">' + FIG.render(ex.p) + '</div>' +
            '<div class="ex-name"><div class="n">' + esc(ex.n) + '</div>' +
              '<div class="m"><span style="color:' + g.color + '">' + esc(g.short) + '</span>' +
              (e.note ? ' · ' + esc(e.note) : '') + '</div></div>' +
            '<div class="ex-sets"><b>' + e.sets + '×' + esc(e.reps) + '</b><br><span class="tiny">' + fmtRest(e.rest) + '</span></div>' +
          '</div>';
        }).join('') + '</div>' +
        '<button class="btn sm block ghost" style="margin-top:10px" data-act="start" data-rid="' + r.id + '" data-day="' + d.id + '">Entrenar este día</button>' +
      '</div>';
    }).join('');

    var balance = Generator.balanceReport(r);
    var maxSets = Math.max.apply(null, balance.map(function (b) { return b.sets; }).concat([12]));
    var balanceHTML = balance.map(function (b) {
      var pct = Math.round(b.sets / maxSets * 100);
      var col = b.status === 'ok' ? '#c6f24e' : (b.status === 'bajo' ? '#f5c26b' : '#ff8f6b');
      return '<div class="vol-row"><div class="g">' + esc(b.group.short) + '</div>' +
        '<div class="track"><div class="fill" style="width:' + pct + '%;background:' + col + '"></div></div>' +
        '<div class="n">' + b.sets + ' ser.</div></div>';
    }).join('');

    return '<div class="card">' +
        '<div class="row-between"><div>' +
          '<div class="tiny muted" style="letter-spacing:.1em;text-transform:uppercase">' +
            (r.generated ? 'Generada automáticamente' : 'Personalizada') + '</div>' +
          '<h2 style="font-size:22px;margin-top:2px">' + esc(r.name) + '</h2>' +
        '</div>' + '<div class="badge ' + (isActive ? '' : 'grey') + '">' + (isActive ? 'Activa' : 'Inactiva') + '</div></div>' +
        '<div class="kv">' +
          '<div class="k"><b>' + r.days.length + '</b> días</div>' +
          '<div class="k"><b>' + totalEx + '</b> ejercicios</div>' +
          (r.meta && r.meta.split ? '<div class="k">' + esc(r.meta.split) + '</div>' : '') +
          (r.meta && r.meta.duration ? '<div class="k"><b>' + r.meta.duration + '</b> min/día</div>' : '') +
        '</div>' +
        '<div class="btn-row" style="margin-top:14px">' +
          (isActive ? '' : '<button class="btn primary" data-act="activate" data-id="' + r.id + '">Activar</button>') +
          '<button class="btn" data-act="pdf" data-id="' + r.id + '">' + ico('pdf') + 'PDF A4</button>' +
          '<button class="btn ghost" data-act="edit" data-id="' + r.id + '">Editar</button>' +
        '</div>' +
        '<div class="btn-row" style="margin-top:10px">' +
          '<button class="btn ghost sm" data-act="dup" data-id="' + r.id + '">Duplicar</button>' +
          '<button class="btn danger sm" data-act="del" data-id="' + r.id + '">Eliminar</button>' +
        '</div>' +
      '</div>' +
      '<div class="card"><div class="h-row"><h3>Volumen semanal</h3><span class="tiny muted">series por grupo</span></div>' +
        '<p class="tiny muted" style="margin-top:4px">Objetivo orientativo: 10-20 series por grupo a la semana. En verde, dentro de un rango razonable.</p>' +
        balanceHTML + '</div>' +
      days;
  }

  // ------------------------------------------------------------- EJERCICIOS
  function viewEjercicios() {
    var groups = DB.groups;
    var chips = '<div class="chips">' +
      '<button class="chip on" data-act="filter-group" data-g="all">Todos</button>' +
      groups.map(function (g) { return '<button class="chip" data-act="filter-group" data-g="' + g.id + '"><span class="dot" style="color:' + g.color + '"></span>' + esc(g.short) + '</button>'; }).join('') +
      '</div>';
    return '<div class="row" style="gap:8px"><div style="flex:1;position:relative">' +
      '<input id="ex-search" class="input" placeholder="Buscar ejercicio o músculo" autocomplete="off" style="padding-left:40px">' +
      '<span style="position:absolute;left:12px;top:13px;width:20px;height:20px;color:var(--muted)">' + ico('search') + '</span>' +
      '</div></div>' + chips +
      '<div id="ex-list">' + exerciseList('all', '') + '</div>' +
      '<div class="tiny muted center" style="margin-top:16px">' + DB.exercises.length + ' ejercicios · toca uno para ver la técnica</div>';
  }

  function exerciseList(group, query) {
    var q = (query || '').toLowerCase().trim();
    var out = '';
    DB.groups.forEach(function (g) {
      if (group !== 'all' && group !== g.id) return;
      var list = DB.byGroup[g.id].filter(function (ex) {
        if (!q) return true;
        return (ex.n + ' ' + ex.s + ' ' + g.name + ' ' + (ex.d || '')).toLowerCase().indexOf(q) >= 0;
      });
      if (!list.length) return;
      out += '<div class="group-head"><span class="gname">' + esc(g.name) + '</span><span class="bar"></span><span class="count">' + list.length + '</span></div>';
      out += list.map(function (ex) {
        return '<div class="ex-row" data-act="ex" data-id="' + ex.id + '">' +
          '<div class="ex-thumb">' + FIG.render(ex.p) + '</div>' +
          '<div class="ex-name"><div class="n">' + esc(ex.n) + '</div>' +
            '<div class="m">' + esc(ex.s) + ' · ' + ex.e.map(function (e) { return DB.equip[e] || e; }).join(', ') + '</div></div>' +
          '<div class="ex-sets">' + esc(ex.r) + '</div></div>';
      }).join('');
    });
    return out || '<div class="empty"><p>Nada encontrado con «' + esc(query) + '»</p></div>';
  }

  // --------------------------------------------------------------- PROGRESO
  function viewProgreso() {
    var logs = S.logsSorted();
    var week = S.weeklyVolume(8);
    var maxV = Math.max.apply(null, week.map(function (w) { return w.volume; }).concat([1]));
    var chart = week.length ?
      '<div class="bars">' + week.map(function (w) {
        var h = Math.max(4, Math.round(w.volume / maxV * 100));
        return '<div class="b ' + (w === week[week.length - 1] ? 'hi' : '') + '" style="height:' + h + '%" title="' + w.volume + ' ' + units() + '"></div>';
      }).join('') + '</div>' +
      '<div class="bars-x">' + week.map(function (w) { return '<div>' + fmtDate(w.week).split(' ')[0] + '</div>'; }).join('') + '</div>' : '<p class="small muted">Aún no hay datos. Registra tu primer entrenamiento.</p>';

    var totalVol = week.reduce(function (a, b) { return a + b.volume; }, 0);
    var totalSets = 0, totalLogs = logs.length;
    logs.forEach(function (l) { (l.entries || []).forEach(function (e) { totalSets += (e.sets || []).filter(function (s) { return s.done !== false; }).length; }); });

    var sets7 = S.weeklySets();
    var volHTML = DB.groups.map(function (g) {
      var n = Math.round(sets7[g.id] || 0);
      var t = DB.volumeTarget[g.id] || 8;
      var pct = Math.min(100, Math.round(n / (t * 1.6) * 100));
      var col = n === 0 ? '#38465a' : (n < t * 0.6 ? '#f5c26b' : (n > t * 1.8 ? '#ff8f6b' : '#c6f24e'));
      return '<div class="vol-row"><div class="g">' + esc(g.short) + '</div>' +
        '<div class="track"><div class="fill" style="width:' + pct + '%;background:' + col + '"></div></div>' +
        '<div class="n">' + n + '/' + t + '</div></div>';
    }).join('');

    var prs = [];
    DB.exercises.forEach(function (ex) {
      var b = S.bestForExercise(ex.id);
      if (b) prs.push({ ex: ex, w: b.w, r: b.r });
    });
    prs.sort(function (a, b) { return b.w - a.w; });
    var prHTML = prs.length ? prs.slice(0, 8).map(function (p) {
      return '<div class="row-between" style="padding:10px 0;border-top:1px solid var(--line)">' +
        '<div><div style="font-weight:600;font-size:14px">' + esc(p.ex.n) + '</div>' +
        '<div class="tiny muted">' + esc(DB.groupById(p.ex.g).short) + ' · mejor serie</div></div>' +
        '<div class="mono" style="font-weight:700">' + p.w + ' ' + units() + ' <span class="tiny muted">× ' + p.r + '</span></div></div>';
    }).join('') : '<p class="small muted" style="margin-top:8px">Tus récords aparecerán al registrar pesos.</p>';

    var weights = S.weights().slice(-6);
    var wHTML = weights.length ? weights.map(function (w) {
      return '<div class="row-between" style="padding:8px 0;border-top:1px solid var(--line)"><span class="small muted">' + fmtDate(w.date) + '</span><b class="mono">' + w.kg + ' ' + units() + '</b></div>';
    }).join('') : '<p class="small muted" style="margin-top:8px">Sin registros de peso corporal.</p>';

    return '<div class="stat-grid">' +
        '<div class="stat"><div class="v">' + totalLogs + '</div><div class="l">Entrenos totales</div></div>' +
        '<div class="stat"><div class="v">' + totalSets + '</div><div class="l">Series registradas</div></div>' +
        '<div class="stat"><div class="v">' + (totalVol >= 1000 ? (totalVol / 1000).toFixed(1) + '<small>t</small>' : totalVol + '<small>' + units() + '</small>') + '</div><div class="l">Volumen (8 sem.)</div></div>' +
        '<div class="stat"><div class="v">' + (logs[0] ? fmtDate(logs[0].date) : '—') + '</div><div class="l">Último entreno</div></div>' +
      '</div>' +
      '<div class="card"><div class="h-row"><h3>Volumen por semana</h3><span class="tiny muted">kg levantados</span></div>' + chart + '</div>' +
      '<div class="card"><div class="h-row"><h3>Series últimos 7 días</h3><span class="tiny muted">real / objetivo</span></div>' + volHTML + '</div>' +
      '<div class="card"><div class="h-row"><h3>Récords personales</h3></div>' + prHTML + '</div>' +
      '<div class="card"><div class="h-row"><h3>Peso corporal</h3><span class="tiny muted">' + units() + '</span></div>' +
        '<div class="row" style="margin-top:10px"><input id="bw-input" class="input sm" type="number" inputmode="decimal" step="0.1" placeholder="Peso de hoy" style="flex:1">' +
        '<button class="btn sm" data-act="add-weight">Añadir</button></div>' + wHTML + '</div>' +
      '<div class="card"><div class="h-row"><h3>Historial</h3><span class="tiny muted">' + logs.length + ' sesiones</span></div>' +
        (logs.length ? logs.slice(0, 20).map(function (l) {
          var sets = (l.entries || []).reduce(function (a, e) { return a + (e.sets || []).length; }, 0);
          return '<div class="row-between" style="padding:10px 0;border-top:1px solid var(--line)" data-act="open-log" data-id="' + l.id + '">' +
            '<div><div style="font-weight:600;font-size:14px">' + esc(l.dayName) + '</div>' +
            '<div class="tiny muted">' + fmtDate(l.date) + ' · ' + sets + ' series · ' + (l.routineName || '') + '</div></div>' +
            '<span class="tiny muted">›</span></div>';
        }).join('') : '<p class="small muted" style="margin-top:8px">Todavía no hay entrenos registrados.</p>') +
      '</div>';
  }

  // ---------------------------------------------------------------- AJUSTES
  function viewAjustes() {
    var st = S.state.settings;
    var weekdaysPicker = [1, 2, 3, 4, 5, 6, 7].map(function (d) {
      var on = st.weekdays.indexOf(d) >= 0;
      return '<button class="chip ' + (on ? 'on' : '') + '" data-act="toggle-day" data-d="' + d + '" style="flex:1;justify-content:center">' + DOW[d] + '</button>';
    }).join('');

    return '<div class="card">' +
        '<div class="field" style="margin-top:0"><div class="lbl">Tu nombre</div>' +
          '<input id="set-name" class="input" placeholder="Opcional" value="' + esc(st.name) + '"></div>' +
        '<div class="field"><div class="lbl">Unidades</div>' +
          '<div class="seg" data-seg="units"><button data-act="set-units" data-v="kg" class="' + (st.units === 'kg' ? 'on' : '') + '">kg</button>' +
          '<button data-act="set-units" data-v="lb" class="' + (st.units === 'lb' ? 'on' : '') + '">lb</button></div></div>' +
        '<div class="field"><div class="lbl">Experiencia</div>' +
          '<div class="seg">' + [[1, 'Principiante'], [2, 'Intermedio'], [3, 'Avanzado']].map(function (l) {
            return '<button data-act="set-level" data-v="' + l[0] + '" class="' + (st.level === l[0] ? 'on' : '') + '">' + l[1] + '</button>';
          }).join('') + '</div></div>' +
        '<div class="field"><div class="lbl">Equipamiento disponible</div>' +
          '<select id="set-profile" class="select">' + DB.profiles.map(function (p) {
            return '<option value="' + p.id + '"' + (st.profile === p.id ? ' selected' : '') + '>' + esc(p.name) + ' — ' + esc(p.desc) + '</option>';
          }).join('') + '</select></div>' +
        '<div class="field"><div class="lbl">Días por semana</div>' +
          '<div class="stepper"><button data-act="days-minus">−</button><div class="val" id="days-val">' + st.days + '</div><button data-act="days-plus">+</button></div></div>' +
        '<div class="field"><div class="lbl">Días de entrenamiento</div><div class="row" style="gap:6px">' + weekdaysPicker + '</div>' +
          '<p class="tiny muted" style="margin-top:6px">Elige ' + st.days + ' días: los que marques se usarán en orden.</p></div>' +
        '<div class="field"><div class="lbl">Tiempo por sesión</div>' +
          '<div class="seg">' + [30, 45, 60, 90].map(function (m) {
            return '<button data-act="set-duration" data-v="' + m + '" class="' + (st.duration === m ? 'on' : '') + '">' + m + '\'</button>';
          }).join('') + '</div></div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="set-row" style="padding-top:0"><div><div class="t">Temporizador de descanso</div><div class="s">Avisa al terminar cada serie</div></div>' +
          '<div class="switch ' + (st.autoRest ? 'on' : '') + '" data-act="toggle-rest"></div></div>' +
        '<div class="set-row"><div><div class="t">Recomendaciones</div><div class="s">Cómo se generan las rutinas</div></div>' +
          '<button class="btn sm ghost" data-act="info-gen">Ver</button></div>' +
      '</div>' +
      '<div class="card">' +
        '<h3>Datos</h3>' +
        '<p class="small muted" style="margin-top:6px">Tus datos se guardan solo en este dispositivo.</p>' +
        '<div class="btn-row" style="margin-top:12px">' +
          '<button class="btn sm" data-act="backup">Exportar copia</button>' +
          '<button class="btn sm" data-act="restore">Importar copia</button>' +
        '</div>' +
        '<input type="file" id="file-restore" accept="application/json,.json" class="hidden">' +
        '<button class="btn sm danger block" style="margin-top:10px" data-act="reset">Borrar todos los datos</button>' +
      '</div>' +
      '<div class="card"><h3>Instalar en el móvil</h3>' +
        '<p class="small muted" style="margin-top:6px"><b>iPhone:</b> abre esta página en Safari → Compartir → «Añadir a pantalla de inicio».<br><br>' +
        '<b>Android:</b> abre en Chrome → menú ⋮ → «Instalar aplicación».</p>' +
        '<p class="tiny muted" style="margin-top:10px">GYMFLOW · v1.0 · funciona sin conexión</p>' +
      '</div>';
  }

  // ---------------------------------------------------------------- SESIÓN
  function viewSesion(rid, dayId) {
    var r = S.routine(rid);
    if (!r) return '<div class="empty"><h3>Rutina no encontrada</h3></div>';
    var day = null;
    for (var i = 0; i < r.days.length; i++) if (r.days[i].id === dayId) day = r.days[i];
    if (!day) day = r.days[0];

    if (!ui.session || ui.session.routineId !== r.id || ui.session.dayId !== day.id) {
      ui.session = startSession(r, day);
    }
    var ss = ui.session;

    var body = ss.entries.map(function (en, i) {
      var ex = DB.byId[en.exId];
      if (!ex) return '';
      var g = DB.groupById(ex.g);
      var prev = S.lastLogForExercise(ex.id);
      return '<div class="card tight" style="margin-top:12px" data-ex="' + i + '">' +
        '<div class="row" style="gap:12px">' +
          '<div class="ex-thumb" data-act="ex" data-id="' + ex.id + '">' + FIG.render(ex.p) + '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-weight:700;font-size:15px;line-height:1.25">' + esc(ex.n) + '</div>' +
            '<div class="tiny muted" style="margin-top:2px">' + en.sets.length + ' × ' + esc(en.reps) + ' · <span style="color:' + g.color + '">' + esc(g.short) + '</span>' +
              (prev ? ' · última: ' + prev.entry.sets.map(function (s) { return s.w; }).filter(Boolean)[0] + ' ' + units() : '') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="set-head"><div>Serie</div><div>Peso (' + units() + ')</div><div>Reps</div><div></div></div>' +
        en.sets.map(function (s, j) {
          return '<div class="session-set">' +
            '<div class="idx">' + (j + 1) + '</div>' +
            '<input type="number" inputmode="decimal" step="0.5" value="' + (s.w === '' || s.w == null ? '' : s.w) + '" data-set="' + i + ':' + j + ':w" placeholder="—">' +
            '<input type="number" inputmode="numeric" step="1" value="' + (s.r === '' || s.r == null ? '' : s.r) + '" data-set="' + i + ':' + j + ':r" placeholder="—">' +
            '<button class="ok ' + (s.done ? 'on' : '') + '" data-act="toggle-set" data-i="' + i + '" data-j="' + j + '">' + ico('check') + '</button>' +
          '</div>';
        }).join('') +
        (en.uni ? '<div class="tiny muted" style="margin-top:8px">Unilateral: cuenta las dos piernas/brazos.</div>' : '') +
      '</div>';
    }).join('');

    var done = ss.entries.reduce(function (a, e) { return a + e.sets.filter(function (s) { return s.done; }).length; }, 0);
    var totalSets = ss.entries.reduce(function (a, e) { return a + e.sets.length; }, 0);

    return '<div class="card tight">' +
        '<div class="row-between"><div>' +
          '<div class="tiny muted">' + esc(r.name) + '</div>' +
          '<div style="font-size:19px;font-weight:750">' + esc(day.name) + '</div></div>' +
          '<div class="mono" id="session-clock" style="font-weight:700">0:00</div></div>' +
        '<div class="small muted" style="margin-top:4px">' + done + ' / ' + totalSets + ' series completadas</div>' +
      '</div>' +
      body +
      '<div class="card" style="margin-top:14px"><div class="lbl" style="font-size:12.5px;font-weight:600;color:var(--muted);text-transform:uppercase">Notas del entreno</div>' +
        '<textarea id="session-notes" class="input" placeholder="Sensaciones, molestias, cambios de peso..." style="margin-top:6px">' + esc(ss.notes || '') + '</textarea></div>' +
      '<div class="sticky-cta" style="margin-top:14px">' +
        '<button class="btn primary block" data-act="finish-session">Terminar entrenamiento</button>' +
      '</div>';
  }

  function startSession(r, day) {
    var existing = S.logFor(S.todayISO(), r.id, day.id);
    var ss = {
      routineId: r.id, routineName: r.name, dayId: day.id, dayName: day.name,
      date: S.todayISO(), startedAt: Date.now(), notes: existing ? existing.notes : '',
      entries: day.exercises.map(function (e) {
        var ex = DB.byId[e.exId] || {};
        var last = S.lastLogForExercise(e.exId);
        var sets = [];
        for (var i = 0; i < e.sets; i++) {
          var lw = '', lr = '';
          if (last && last.entry.sets && last.entry.sets[i]) {
            lw = last.entry.sets[i].w === undefined || last.entry.sets[i].w === null ? '' : last.entry.sets[i].w;
            lr = last.entry.sets[i].r === undefined || last.entry.sets[i].r === null ? '' : last.entry.sets[i].r;
          }
          sets.push({ w: lw, r: lr, done: false });
        }
        return { exId: e.exId, uni: !!ex.u, reps: e.reps, rest: e.rest, sets: sets };
      })
    };
    if (existing) {
      // reanudar registro del día
      existing.entries.forEach(function (ee, i) {
        if (ss.entries[i]) ss.entries[i].sets = ee.sets;
      });
    }
    startClock();
    return ss;
  }

  var clockTimer = null;
  function startClock() {
    clearInterval(clockTimer);
    clockTimer = setInterval(function () {
      var el = $('#session-clock');
      if (!el || !ui.session) { return; }
      var s = Math.floor((Date.now() - ui.session.startedAt) / 1000);
      el.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    }, 1000);
  }

  // temporizador de descanso
  var restTimer = null, restLeft = 0;
  function startRest(seconds) {
    if (!S.state.settings.autoRest) return;
    restLeft = seconds;
    clearInterval(restTimer);
    renderRest();
    restTimer = setInterval(function () {
      restLeft--;
      if (restLeft <= 0) {
        clearInterval(restTimer);
        beep();
        var b = $('#rest-bar'); if (b) b.remove();
        return;
      }
      renderRest();
    }, 1000);
  }
  function renderRest() {
    var b = $('#rest-bar');
    if (!b) {
      b = document.createElement('div');
      b.id = 'rest-bar';
      b.className = 'rest-bar';
      document.body.appendChild(b);
    }
    b.innerHTML = '<span>Descanso</span><span class="t">' + Math.floor(restLeft / 60) + ':' + String(restLeft % 60).padStart(2, '0') +
      '</span><span style="margin-left:auto"></span><button data-act="rest-skip">Saltar</button><button data-act="rest-plus">+30s</button>';
  }
  function beep() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx();
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880; g.gain.value = 0.12;
      o.start();
      setTimeout(function () { o.stop(); ctx.close(); }, 220);
    } catch (e) { /* silencio */ }
  }

  // ----------------------------------------------------------------- EDITOR
  function viewEditor(rid) {
    if (!ui.editor || (rid && ui.editor.id !== rid) || (!rid && ui.editor.id)) {
      var src = rid ? S.routine(rid) : null;
      ui.editor = src ? JSON.parse(JSON.stringify(src)) : {
        id: null, name: 'Mi rutina', days: [{ id: 'd1', name: 'Día 1', exercises: [], estimated: 45 }], generated: false
      };
    }
    var ed = ui.editor;

    var daysHTML = ed.days.map(function (d, di) {
      return '<div class="card" data-day="' + di + '">' +
        '<div class="row-between"><input class="input sm" style="flex:1;font-weight:700" data-dayname="' + di + '" value="' + esc(d.name) + '">' +
          (ed.days.length > 1 ? '<button class="icon-btn" data-act="del-day" data-d="' + di + '" aria-label="Eliminar día">✕</button>' : '') +
        '</div>' +
        '<div style="margin-top:8px">' + (d.exercises.length ? d.exercises.map(function (e, ei) {
          var ex = DB.byId[e.exId]; if (!ex) return '';
          var g = DB.groupById(ex.g);
          return '<div class="ex-row" style="gap:8px">' +
            '<div class="ex-thumb" style="width:46px;height:46px" data-act="ex" data-id="' + ex.id + '">' + FIG.render(ex.p) + '</div>' +
            '<div class="ex-name"><div class="n" style="font-size:13.5px">' + esc(ex.n) + '</div>' +
              '<div class="m" style="color:' + g.color + '">' + esc(g.short) + '</div></div>' +
            '<div class="row" style="gap:4px">' +
              '<input class="input sm" style="width:44px;padding:0 4px;text-align:center" type="number" inputmode="numeric" value="' + e.sets + '" data-fld="sets" data-d="' + di + '" data-e="' + ei + '">' +
              '<span class="tiny muted">×</span>' +
              '<input class="input sm" style="width:56px;padding:0 4px;text-align:center" value="' + esc(e.reps) + '" data-fld="reps" data-d="' + di + '" data-e="' + ei + '">' +
            '</div>' +
            '<div style="display:grid;gap:2px">' +
              '<button class="tiny muted" data-act="move-up" data-d="' + di + '" data-e="' + ei + '" aria-label="Subir">▲</button>' +
              '<button class="tiny muted" data-act="move-down" data-d="' + di + '" data-e="' + ei + '" aria-label="Bajar">▼</button>' +
            '</div>' +
            '<button class="tiny" style="color:var(--danger);padding:4px" data-act="del-ex" data-d="' + di + '" data-e="' + ei + '" aria-label="Quitar">✕</button>' +
          '</div>';
        }).join('') : '<p class="tiny muted" style="padding:10px 0">Sin ejercicios todavía.</p>') + '</div>' +
        '<button class="btn sm block ghost" style="margin-top:8px" data-act="add-ex" data-d="' + di + '">+ Añadir ejercicio</button>' +
      '</div>';
    }).join('');

    return '<div class="card"><div class="field" style="margin-top:0"><div class="lbl">Nombre de la rutina</div>' +
        '<input id="ed-name" class="input" value="' + esc(ed.name) + '"></div></div>' +
      daysHTML +
      (ed.days.length < 5 ? '<button class="btn block" data-act="add-day" style="margin-top:12px">+ Añadir día</button>' : '') +
      '<div class="sticky-cta" style="margin-top:16px">' +
        '<button class="btn primary block" data-act="save-editor">Guardar rutina</button>' +
      '</div>';
  }

  // -------------------------------------------------------------- HOJA (ex)
  function openExerciseSheet(id) {
    var ex = DB.byId[id];
    if (!ex) return;
    var g = DB.groupById(ex.g);
    var best = S.bestForExercise(id);
    var last = S.lastLogForExercise(id);
    var sheet = document.createElement('div');
    sheet.className = 'sheet';
    sheet.id = 'sheet';
    sheet.innerHTML = '<div class="panel" role="dialog">' +
      '<div class="handle"></div>' +
      '<div class="fig-hero">' + FIG.render(ex.p) + '</div>' +
      '<div class="row-between" style="margin-top:14px"><h2 style="font-size:21px;line-height:1.15;flex:1">' + esc(ex.n) + '</h2></div>' +
      '<div class="small" style="color:' + g.color + ';font-weight:600;margin-top:2px">' + esc(g.name) + ' · ' + esc(ex.s) + '</div>' +
      '<div class="kv">' +
        '<div class="k"><b>' + esc(ex.r) + '</b> reps</div>' +
        '<div class="k"><b>' + fmtRest(ex.rest) + '</b> descanso</div>' +
        '<div class="k">' + (ex.t === 'c' ? 'Compuesto' : ex.t === 'a' ? 'Aislado' : 'Core') + '</div>' +
        '<div class="k">' + (ex.u ? 'Unilateral' : 'Bilateral') + '</div>' +
        ex.e.map(function (e) { return '<div class="k">' + esc(DB.equip[e] || e) + '</div>'; }).join('') +
        '<div class="k">Nivel ' + ['', 'principiante', 'intermedio', 'avanzado'][ex.l] + '</div>' +
      '</div>' +
      '<p class="small" style="margin-top:14px;color:#cfdae8">' + esc(ex.d) + '</p>' +
      '<h3 style="margin-top:16px;font-size:14px">Ejecución</h3>' +
      '<ul class="steps" style="margin-top:8px">' + (ex.k || []).map(function (k) { return '<li>' + esc(k) + '</li>'; }).join('') + '</ul>' +
      '<h3 style="margin-top:16px;font-size:14px">Errores habituales</h3>' +
      '<ul class="steps mistakes" style="margin-top:8px">' + (ex.m || []).map(function (k) { return '<li>' + esc(k) + '</li>'; }).join('') + '</ul>' +
      (best || last ? '<div class="card flat" style="margin-top:16px"><div class="row-between"><span class="small muted">Tu mejor marca</span>' +
        '<b class="mono">' + (best ? best.w + ' ' + units() + ' × ' + best.r : '—') + '</b></div>' +
        (last ? '<div class="row-between" style="margin-top:6px"><span class="small muted">Última vez</span><span class="small mono">' + fmtDate(last.date) + ' · ' +
          (last.entry.sets || []).map(function (s) { return s.w + '×' + s.r; }).filter(function (s) { return s !== '×'; }).join('  ') + '</span></div>' : '') +
        '</div>' : '') +
      '<button class="btn block" style="margin-top:16px" data-act="close-sheet">Cerrar</button>' +
      '</div>';
    document.body.appendChild(sheet);
    requestAnimationFrame(function () { sheet.classList.add('open'); });
    sheet.addEventListener('click', function (e) {
      if (e.target === sheet) closeSheet();
    });
  }

  function closeSheet() {
    var s = $('#sheet');
    if (!s) return;
    s.classList.remove('open');
    setTimeout(function () { s.remove(); }, 220);
  }

  // ------------------------------------------------------------- GENERADOR
  function openGenerator() {
    var st = S.state.settings;
    var sheet = document.createElement('div');
    sheet.className = 'sheet';
    sheet.id = 'sheet';
    sheet.innerHTML = '<div class="panel" role="dialog">' +
      '<div class="handle"></div>' +
      '<h2 style="font-size:22px">Nueva rutina automática</h2>' +
      '<p class="small muted" style="margin-top:4px">Se ajusta a tus días y a tu tiempo, repartiendo el volumen entre todos los grupos musculares.</p>' +
      '<div class="field"><div class="lbl">Días por semana</div><div class="seg" id="gen-days">' +
        [1, 2, 3, 4, 5].map(function (n) { return '<button data-v="' + n + '" class="' + (st.days === n ? 'on' : '') + '">' + n + '</button>'; }).join('') + '</div></div>' +
      '<div class="field"><div class="lbl">Tiempo por sesión</div><div class="seg" id="gen-dur">' +
        [30, 45, 60, 90].map(function (n) { return '<button data-v="' + n + '" class="' + (st.duration === n ? 'on' : '') + '">' + n + '\'</button>'; }).join('') + '</div></div>' +
      '<div class="field"><div class="lbl">Experiencia</div><div class="seg" id="gen-level">' +
        [[1, 'Principiante'], [2, 'Intermedio'], [3, 'Avanzado']].map(function (l) { return '<button data-v="' + l[0] + '" class="' + (st.level === l[0] ? 'on' : '') + '">' + l[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="field"><div class="lbl">Equipamiento</div><select id="gen-profile" class="select">' +
        DB.profiles.map(function (p) { return '<option value="' + p.id + '"' + (st.profile === p.id ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('') + '</select></div>' +
      '<button class="btn primary block" style="margin-top:20px" data-act="do-generate">Generar rutina</button>' +
      '<p class="tiny muted center" style="margin-top:10px">Podrás editarla después ejercicio a ejercicio.</p>' +
      '</div>';
    document.body.appendChild(sheet);
    requestAnimationFrame(function () { sheet.classList.add('open'); });
    sheet.addEventListener('click', function (e) {
      if (e.target === sheet) closeSheet();
      var b = e.target.closest('[data-v]');
      if (b) {
        var seg = b.parentElement;
        $$('button', seg).forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
      }
    });
  }

  function doGenerate() {
    var days = Number($('#gen-days .on').dataset.v);
    var duration = Number($('#gen-dur .on').dataset.v);
    var level = Number($('#gen-level .on').dataset.v);
    var profile = $('#gen-profile').value;
    S.updateSettings({ days: days, duration: duration, level: level, profile: profile });
    var routine = Generator.generate({ days: days, duration: duration, level: level, profile: profile });
    S.addRoutine(routine);
    S.setActive(routine.id);
    closeSheet();
    go('#/rutinas/' + routine.id);
    toast('Rutina creada · ' + days + ' días');
  }

  // -------------------------------------------------------------------- PDF
  function buildPrint(routine, opts) {
    opts = opts || {};
    var st = S.state.settings;
    var totalEx = routine.days.reduce(function (a, d) { return a + d.exercises.length; }, 0);
    var dateStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

    var cover =
      '<section class="pdf-page">' +
        '<div class="pdf-head"><div>' +
          '<div class="pdf-brand">GYMFLOW · Plan de entrenamiento</div>' +
          '<div class="pdf-title">' + esc(routine.name) + '</div>' +
          '<div class="pdf-sub">' + routine.days.length + ' días/semana · ' + totalEx + ' ejercicios' +
            (routine.meta && routine.meta.split ? ' · ' + esc(routine.meta.split) : '') + '</div>' +
        '</div><div style="text-align:right"><div class="pdf-brand">' + esc(dateStr) + '</div>' +
          '<div class="pdf-sub">' + (st.name ? esc(st.name) : '') + '</div></div></div>' +
        '<div style="display:flex;gap:6mm;flex-wrap:wrap;margin-bottom:5mm">' +
          routine.days.map(function (d, i) {
            return '<div style="flex:1 1 45%;border:1px solid #e2e2e2;border-radius:3mm;padding:3mm 4mm">' +
              '<div style="font-size:7.5pt;text-transform:uppercase;letter-spacing:.08em;color:#888">Día ' + (i + 1) + '</div>' +
              '<div style="font-weight:800;font-size:11pt">' + esc(d.name) + '</div>' +
              '<div style="font-size:8pt;color:#666">' + d.exercises.length + ' ejercicios · ~' + (d.estimated || 45) + ' min</div>' +
            '</div>';
          }).join('') +
        '</div>' +
        '<div class="pdf-tip"><b>Cómo usar esta hoja:</b> respeta el orden de los ejercicios (compuestos primero), descansa lo indicado entre series y anota el peso que uses. Si completas todas las repeticiones del rango con buena técnica en las 2 últimas series, sube el peso en la próxima sesión.</div>' +
        '<table class="pdf-table" style="margin-top:6mm"><thead><tr><th style="width:22mm">Grupo</th><th>Series semanales</th></tr></thead><tbody>' +
          Generator.balanceReport(routine).map(function (b) {
            return '<tr><td style="font-weight:700">' + esc(b.group.short) + '</td><td>' + b.sets + ' series</td></tr>';
          }).join('') +
        '</tbody></table>' +
        '<div class="pdf-foot">' + esc(routine.name) + ' · generado con GYMFLOW · ' + esc(dateStr) + '</div>' +
      '</section>';

    var pages = routine.days.map(function (d, di) {
      var rows = d.exercises.map(function (e, i) {
        var ex = DB.byId[e.exId];
        if (!ex) return '';
        var g = DB.groupById(ex.g);
        return '<tr>' +
          '<td style="width:8mm;font-weight:800;color:#999">' + (i + 1) + '</td>' +
          '<td><div class="pdf-ex"><div>' + FIG.render(ex.p) + '</div><div>' +
            '<div class="n">' + esc(ex.n) + '</div>' +
            '<div class="m">' + esc(g.short) + ' · ' + esc(ex.s) + '</div></div></div></td>' +
          '<td class="pdf-sets">' + e.sets + ' × ' + esc(e.reps) + '</td>' +
          '<td class="pdf-rest">' + fmtRest(e.rest) + '</td>' +
          '<td class="pdf-log" style="width:34mm">' + (opts.log ? '___ × ___' : '') + '</td>' +
        '</tr>';
      }).join('');
      return '<section class="pdf-page">' +
        '<div class="pdf-head" style="padding-bottom:3mm;margin-bottom:4mm">' +
          '<div><div class="pdf-brand">' + esc(routine.name) + '</div>' +
          '<div class="pdf-day">Día ' + (di + 1) + ' · ' + esc(d.name) + '</div>' +
          '<div class="pdf-day-meta">' + d.exercises.length + ' ejercicios · descanso estimado ' + (d.estimated || 45) + ' min · ' +
            (st.duration || 45) + ' min disponibles</div></div>' +
          '<div class="pdf-brand" style="text-align:right">' + esc(dateStr) + '</div></div>' +
        '<table class="pdf-table"><thead><tr><th></th><th>Ejercicio</th><th>Series × reps</th><th>Descanso</th><th>Peso × reps</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table>' +
        '<div class="pdf-legend">Calentamiento: 5-8 min de movilidad y 2 series de aproximación con cargas ligeras en el primer ejercicio.</div>' +
        '<div class="pdf-foot">Hoja de registro · apunta el peso y las repeticiones de cada serie</div>' +
      '</section>';
    }).join('');

    return cover + pages;
  }

  function exportPDF(id, opts) {
    var r = S.routine(id) || S.activeRoutine();
    if (!r) { toast('Crea una rutina primero'); return; }
    var area = $('#print-area');
    area.innerHTML = buildPrint(r, opts || { log: true });
    setTimeout(function () { window.print(); }, 60);
  }

  // ------------------------------------------------------------------ bind
  function bind() {
    var nameInput = $('#set-name');
    if (nameInput) {
      nameInput.addEventListener('input', function () { S.updateSettings({ name: this.value }); });
    }
    var edName = $('#ed-name');
    if (edName) {
      edName.addEventListener('input', function () { ui.editor.name = this.value; });
    }
    var search = $('#ex-search');
    if (search) {
      var group = 'all';
      search.addEventListener('input', function () {
        var list = $('#ex-list');
        if (list) list.innerHTML = exerciseList(group || 'all', this.value);
      });
    }
    var restore = $('#file-restore');
    if (restore) {
      restore.addEventListener('change', function () {
        var f = this.files && this.files[0];
        if (!f) return;
        var rd = new FileReader();
        rd.onload = function () {
          try {
            S.importJSON(rd.result);
            toast('Copia restaurada');
            go('#/hoy');
            render();
          } catch (e) { toast('Archivo no válido'); }
        };
        rd.readAsText(f);
      });
    }
    var notes = $('#session-notes');
    if (notes) {
      notes.addEventListener('input', function () { if (ui.session) ui.session.notes = this.value; });
    }
  }

  // --------------------------------------------------------------- acciones
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el) return;
    var act = el.dataset.act;

    // acciones globales
    if (act === 'tab') { go('#/' + el.dataset.tab); return; }
    if (act === 'back') { history.length > 1 ? history.back() : go('#/hoy'); return; }
    if (act === 'go-ajustes') { go('#/ajustes'); return; }
    if (act === 'go-routine') { go('#/rutinas/' + el.dataset.id); return; }
    if (act === 'ex') { openExerciseSheet(el.dataset.id); return; }
    if (act === 'close-sheet') { closeSheet(); return; }
    if (act === 'gen') { openGenerator(); return; }
    if (act === 'do-generate') { doGenerate(); return; }
    if (act === 'new-routine') { ui.editor = null; go('#/editar'); return; }
    if (act === 'edit') { ui.editor = null; go('#/editar/' + el.dataset.id); return; }
    if (act === 'activate') {
      S.setActive(el.dataset.id);
      toast('Rutina activada');
      render();
      return;
    }
    if (act === 'dup') {
      var d = S.duplicateRoutine(el.dataset.id);
      if (d) { toast('Rutina duplicada'); go('#/rutinas/' + d.id); }
      return;
    }
    if (act === 'del') {
      var r = S.routine(el.dataset.id);
      if (r && confirm('¿Eliminar «' + r.name + '»? No se puede deshacer.')) {
        S.deleteRoutine(r.id);
        toast('Rutina eliminada');
        go('#/rutinas');
        render();
      }
      return;
    }
    if (act === 'pdf') { exportPDF(el.dataset.id, { log: true }); return; }
    if (act === 'start') {
      ui.session = null;
      go('#/sesion/' + el.dataset.rid + '/' + el.dataset.day);
      return;
    }
    if (act === 'pick-day') {
      var rr = S.routine(el.dataset.rid);
      var sheet = document.createElement('div');
      sheet.className = 'sheet'; sheet.id = 'sheet';
      sheet.innerHTML = '<div class="panel"><div class="handle"></div><h2 style="font-size:20px">¿Qué día entrenas?</h2>' +
        rr.days.map(function (d, i) {
          return '<button class="btn block" style="margin-top:10px;justify-content:space-between" data-act="start" data-rid="' + rr.id + '" data-day="' + d.id + '">' +
            '<span>' + esc(d.name) + '</span><span class="tiny muted">' + d.exercises.length + ' ej</span></button>';
        }).join('') + '<button class="btn block ghost" style="margin-top:14px" data-act="close-sheet">Cancelar</button></div>';
      document.body.appendChild(sheet);
      requestAnimationFrame(function () { sheet.classList.add('open'); });
      sheet.addEventListener('click', function (ev) { if (ev.target === sheet) closeSheet(); });
      return;
    }
    if (act === 'filter-group') {
      $$('.chip[data-act="filter-group"]').forEach(function (c) { c.classList.remove('on'); });
      el.classList.add('on');
      var s = $('#ex-search');
      var l = $('#ex-list');
      if (l) l.innerHTML = exerciseList(el.dataset.g, s ? s.value : '');
      return;
    }
    if (act === 'open-log') {
      var log = S.logs().filter(function (l) { return l.id === el.dataset.id; })[0];
      if (!log) return;
      var sh = document.createElement('div');
      sh.className = 'sheet'; sh.id = 'sheet';
      sh.innerHTML = '<div class="panel"><div class="handle"></div><h2 style="font-size:20px">' + esc(log.dayName) + '</h2>' +
        '<div class="small muted">' + fmtDate(log.date) + ' · ' + esc(log.routineName || '') + '</div>' +
        (log.entries || []).map(function (en) {
          var ex = DB.byId[en.exId]; if (!ex) return '';
          return '<div style="margin-top:14px"><div style="font-weight:600">' + esc(ex.n) + '</div>' +
            (en.sets || []).map(function (s, i) {
              return '<div class="small muted mono">Serie ' + (i + 1) + ': ' + (s.w || '—') + ' ' + units() + ' × ' + (s.r || '—') + (s.done === false ? ' (no hecha)' : '') + '</div>';
            }).join('') + '</div>';
        }).join('') +
        (log.notes ? '<div class="card flat" style="margin-top:14px"><div class="tiny muted">NOTAS</div><div class="small">' + esc(log.notes) + '</div></div>' : '') +
        '<button class="btn block danger" style="margin-top:18px" data-act="del-log" data-id="' + log.id + '">Borrar registro</button>' +
        '<button class="btn block ghost" style="margin-top:8px" data-act="close-sheet">Cerrar</button></div>';
      document.body.appendChild(sh);
      requestAnimationFrame(function () { sh.classList.add('open'); });
      sh.addEventListener('click', function (ev) { if (ev.target === sh) closeSheet(); });
      return;
    }
    if (act === 'del-log') {
      S.deleteLog(el.dataset.id);
      closeSheet();
      toast('Registro borrado');
      render();
      return;
    }
    if (act === 'add-weight') {
      var v = parseFloat($('#bw-input').value);
      if (!v || v <= 0) { toast('Introduce un peso válido'); return; }
      S.addWeight(v);
      toast('Peso guardado');
      render();
      return;
    }
    if (act === 'set-units') { S.updateSettings({ units: el.dataset.v }); render(); return; }
    if (act === 'set-level') { S.updateSettings({ level: Number(el.dataset.v) }); render(); return; }
    if (act === 'set-duration') { S.updateSettings({ duration: Number(el.dataset.v) }); render(); return; }
    if (act === 'days-plus' || act === 'days-minus') {
      var st = S.state.settings;
      var n = Math.max(1, Math.min(5, st.days + (act === 'days-plus' ? 1 : -1)));
      var wd = st.weekdays.slice();
      while (wd.length < n) {
        for (var d = 1; d <= 7 && wd.length < n; d++) if (wd.indexOf(d) < 0) wd.push(d);
      }
      wd.sort();
      S.updateSettings({ days: n, weekdays: wd.slice(0, n) });
      render();
      return;
    }
    if (act === 'toggle-day') {
      var dd = Number(el.dataset.d);
      var wds = S.state.settings.weekdays.slice();
      var idx = wds.indexOf(dd);
      if (idx >= 0) { if (wds.length > 1) wds.splice(idx, 1); }
      else {
        wds.push(dd);
        wds.sort();
        if (wds.length > S.state.settings.days) wds = wds.slice(0, S.state.settings.days);
      }
      S.updateSettings({ weekdays: wds });
      render();
      return;
    }
    if (act === 'toggle-rest') { S.updateSettings({ autoRest: !S.state.settings.autoRest }); render(); return; }
    if (act === 'info-gen') { openInfoGen(); return; }
    if (act === 'backup') {
      var txt = S.exportJSON();
      var blob = new Blob([txt], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'gymflow-backup-' + S.todayISO() + '.json';
      a.click();
      toast('Copia exportada');
      return;
    }
    if (act === 'restore') { $('#file-restore').click(); return; }
    if (act === 'reset') {
      if (confirm('¿Borrar TODOS los datos (rutinas, registros y ajustes)?')) {
        S.reset(); ui.session = null; ui.editor = null;
        toast('Datos borrados'); go('#/hoy'); render();
      }
      return;
    }
    if (act === 'rest-skip') { clearInterval(restTimer); var b = $('#rest-bar'); if (b) b.remove(); return; }
    if (act === 'rest-plus') { restLeft += 30; renderRest(); return; }

    // --- sesión ---
    if (act === 'toggle-set') {
      var i = Number(el.dataset.i), j = Number(el.dataset.j);
      var set = ui.session.entries[i].sets[j];
      set.done = !set.done;
      el.classList.toggle('on', set.done);
      if (set.done) {
        var row = el.parentElement;
        var w = row.querySelector('[data-set$=":w"]');
        var rp = row.querySelector('[data-set$=":r"]');
        if (!set.w && w && w.value) set.w = w.value;
        if (!set.r && rp && rp.value) set.r = rp.value;
        startRest(ui.session.entries[i].rest || 90);
      }
      return;
    }
    if (act === 'finish-session') {
      finishSession();
      return;
    }

    // --- editor ---
    if (act === 'add-day') {
      if (ui.editor.days.length >= 5) return;
      ui.editor.days.push({ id: 'd' + (ui.editor.days.length + 1), name: 'Día ' + (ui.editor.days.length + 1), exercises: [], estimated: 45 });
      render();
      return;
    }
    if (act === 'del-day') {
      var di = Number(el.dataset.d);
      if (ui.editor.days.length <= 1) return;
      if (confirm('¿Quitar este día?')) { ui.editor.days.splice(di, 1); render(); }
      return;
    }
    if (act === 'add-ex') { openPicker(Number(el.dataset.d)); return; }
    if (act === 'del-ex') {
      var d1 = Number(el.dataset.d), e1 = Number(el.dataset.e);
      ui.editor.days[d1].exercises.splice(e1, 1);
      render();
      return;
    }
    if (act === 'move-up' || act === 'move-down') {
      var dd1 = Number(el.dataset.d), ee = Number(el.dataset.e);
      var arr = ui.editor.days[dd1].exercises;
      var to = act === 'move-up' ? ee - 1 : ee + 1;
      if (to < 0 || to >= arr.length) return;
      var tmp = arr[ee]; arr[ee] = arr[to]; arr[to] = tmp;
      render();
      return;
    }
    if (act === 'save-editor') { saveEditor(); return; }
    if (act === 'pick-ex') {
      var dayIdx = ui.picker.day;
      var ex = DB.byId[el.dataset.id];
      ui.editor.days[dayIdx].exercises.push({ exId: ex.id, sets: 3, reps: ex.r, rest: ex.rest, note: '' });
      closeSheet();
      render();
      toast('Ejercicio añadido');
      return;
    }
  });

  // cambios en inputs del editor y sesión
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.dataset && t.dataset.set) {
      var p = t.dataset.set.split(':');
      var en = ui.session && ui.session.entries[Number(p[0])];
      if (en) en.sets[Number(p[1])][p[2]] = t.value;
      return;
    }
    if (t.dataset && t.dataset.dayname !== undefined && ui.editor) {
      ui.editor.days[Number(t.dataset.dayname)].name = t.value;
      return;
    }
    if (t.dataset && t.dataset.fld && ui.editor) {
      var d = Number(t.dataset.d), i = Number(t.dataset.e);
      var fld = t.dataset.fld;
      ui.editor.days[d].exercises[i][fld] = fld === 'sets' ? Number(t.value) || 1 : t.value;
      return;
    }
    if (t.id === 'bw-input') return;
  });

  function finishSession() {
    var ss = ui.session;
    if (!ss) return;
    var entries = ss.entries.map(function (en) {
      return {
        exId: en.exId, uni: en.uni,
        sets: en.sets.map(function (s) {
          return { w: s.w === '' ? null : Number(s.w), r: s.r === '' ? null : Number(s.r), done: !!s.done };
        })
      };
    });
    var anyDone = entries.some(function (e) {
      return e.sets.some(function (s) { return s.done || s.w || s.r; });
    });
    if (!anyDone && !confirm('No has marcado ninguna serie. ¿Guardar de todas formas?')) return;

    var existing = S.logFor(ss.date, ss.routineId, ss.dayId);
    var log = {
      id: existing ? existing.id : S.uid('log'),
      date: ss.date,
      routineId: ss.routineId,
      routineName: ss.routineName,
      dayId: ss.dayId,
      dayName: ss.dayName,
      entries: entries,
      notes: ss.notes || '',
      duration: Math.round((Date.now() - ss.startedAt) / 60000)
    };
    if (existing) S.updateLog(log); else S.addLog(log);
    clearInterval(clockTimer);
    clearInterval(restTimer);
    var rb = $('#rest-bar'); if (rb) rb.remove();
    ui.session = null;
    toast('Entreno guardado 💪');
    go('#/hoy');
    render();
  }

  function saveEditor() {
    var ed = ui.editor;
    if (!ed) return;
    var empty = ed.days.every(function (d) { return !d.exercises.length; });
    if (empty) { toast('Añade al menos un ejercicio'); return; }
    ed.name = ed.name || 'Mi rutina';
    ed.days.forEach(function (d, i) {
      d.id = d.id || 'd' + (i + 1);
      d.exercises = d.exercises.filter(function (e) { return DB.byId[e.exId]; });
      var mins = 5 + d.exercises.reduce(function (a, e) {
        var ex = DB.byId[e.exId];
        return a + (e.sets || 3) * (40 + (ex.rest || 90));
      }, 0) / 60;
      d.estimated = Math.round(mins);
    });
    if (ed.id) {
      S.updateRoutine(ed);
      toast('Rutina actualizada');
      var id = ed.id;
      ui.editor = null;
      go('#/rutinas/' + id);
    } else {
      var r = S.addRoutine(ed);
      S.setActive(r.id);
      ui.editor = null;
      toast('Rutina creada');
      go('#/rutinas/' + r.id);
    }
  }

  function openPicker(dayIndex) {
    ui.picker = { day: dayIndex };
    var sheet = document.createElement('div');
    sheet.className = 'sheet'; sheet.id = 'sheet';
    sheet.innerHTML = '<div class="panel"><div class="handle"></div>' +
      '<h2 style="font-size:20px">Añadir ejercicio</h2>' +
      '<input id="pick-search" class="input" placeholder="Buscar..." style="margin-top:10px" autocomplete="off">' +
      '<div class="chips" style="margin-top:10px">' + DB.groups.map(function (g) {
        return '<button class="chip" data-pickg="' + g.id + '"><span class="dot" style="color:' + g.color + '"></span>' + esc(g.short) + '</button>';
      }).join('') + '</div>' +
      '<div id="pick-list" style="margin-top:8px">' + pickerList('') + '</div></div>';
    document.body.appendChild(sheet);
    requestAnimationFrame(function () { sheet.classList.add('open'); });

    var search = $('#pick-search');
    search.addEventListener('input', function () { $('#pick-list').innerHTML = pickerList(this.value); });
    sheet.addEventListener('click', function (ev) {
      if (ev.target === sheet) { closeSheet(); return; }
      var g = ev.target.closest('[data-pickg]');
      if (g) {
        $$('[data-pickg]', sheet).forEach(function (c) { c.classList.remove('on'); });
        g.classList.add('on');
        $('#pick-list').innerHTML = pickerList(search.value, g.dataset.pickg);
      }
    });
  }

  function pickerList(query, group) {
    var q = (query || '').toLowerCase().trim();
    var out = '';
    DB.groups.forEach(function (g) {
      if (group && group !== g.id) return;
      var list = DB.byGroup[g.id].filter(function (ex) {
        return !q || (ex.n + ' ' + ex.s).toLowerCase().indexOf(q) >= 0;
      });
      if (!list.length) return;
      out += '<div class="group-head"><span class="gname">' + esc(g.name) + '</span><span class="bar"></span></div>';
      out += list.map(function (ex) {
        return '<div class="ex-row" data-act="pick-ex" data-id="' + ex.id + '">' +
          '<div class="ex-thumb" style="width:44px;height:44px">' + FIG.render(ex.p) + '</div>' +
          '<div class="ex-name"><div class="n" style="font-size:13.5px">' + esc(ex.n) + '</div><div class="m">' + esc(ex.s) + '</div></div>' +
          '<span class="muted">+</span></div>';
      }).join('');
    });
    return out || '<p class="small muted">Sin resultados</p>';
  }

  function openInfoGen() {
    var sheet = document.createElement('div');
    sheet.className = 'sheet'; sheet.id = 'sheet';
    sheet.innerHTML = '<div class="panel"><div class="handle"></div><h2 style="font-size:20px">Cómo se generan las rutinas</h2>' +
      '<div class="small" style="margin-top:12px;color:#cfdae8;line-height:1.55">' +
      '<p><b>1. Reparto de grupos.</b> Según los días elegidos se usa un split eficiente: cuerpo completo (1-2 días), empuje/tirón/pierna (3), torso/pierna doble (4) y PPL + torso/pierna (5).</p>' +
      '<p style="margin-top:10px"><b>2. Volumen equilibrado.</b> Se busca un reparto de 10-20 series semanales por grupo muscular, priorizando los grupos grandes y sin abandonar ninguno.</p>' +
      '<p style="margin-top:10px"><b>3. Compuestos primero.</b> En cada sesión el primer ejercicio de cada grupo es un movimiento compuesto (más estímulo y menos tiempo).</p>' +
      '<p style="margin-top:10px"><b>4. Tiempo real.</b> Cada serie se estima con su descanso (2-3 min en básicos, 1-1,5 min en aislados) + 5 min de calentamiento. Si no cabe, se recortan series antes que ejercicios.</p>' +
      '<p style="margin-top:10px"><b>5. Variedad.</b> Se evitan repetir ejercicios dentro de la semana y se sortean alternativas equivalentes cada vez que generas.</p>' +
      '<p style="margin-top:10px"><b>6. Progresión.</b> Cuando completes el rango alto de repeticiones en todas las series con buena técnica, sube un 2,5-5 % el peso.</p>' +
      '</div><button class="btn block" style="margin-top:18px" data-act="close-sheet">Entendido</button></div>';
    document.body.appendChild(sheet);
    requestAnimationFrame(function () { sheet.classList.add('open'); });
    sheet.addEventListener('click', function (ev) { if (ev.target === sheet) closeSheet(); });
  }

  // ------------------------------------------------------------------ init
  window.addEventListener('hashchange', render);
  render();
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    navigator.serviceWorker.register('sw.js').catch(function () { });
  }
})();
