/* ==========================================================================
   STORE — estado persistente (localStorage) y utilidades de datos
   ========================================================================== */
(function (global) {
  'use strict';

  var KEY = 'gymflow.v1';

  function todayISO(d) {
    var t = d ? new Date(d) : new Date();
    return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  }

  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  var DEFAULT = {
    v: 1,
    settings: {
      units: 'kg',
      level: 2,                 // 1 principiante, 2 intermedio, 3 avanzado
      profile: 'completo',      // perfil de equipamiento
      days: 3,
      weekdays: [1, 3, 5],      // 1=lunes ... 7=domingo
      duration: 45,             // minutos
      autoRest: true,
      name: ''
    },
    routines: [],
    activeRoutineId: null,
    logs: [],
    weights: [],                // peso corporal [{date, kg}]
    ui: { lastTab: 'hoy', seenIntro: false }
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  var state = null;

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) { state = clone(DEFAULT); return state; }
      var s = JSON.parse(raw);
      // merge defensivo
      var base = clone(DEFAULT);
      s.settings = Object.assign(base.settings, s.settings || {});
      s.ui = Object.assign(base.ui, s.ui || {});
      s.routines = s.routines || [];
      s.logs = s.logs || [];
      s.weights = s.weights || [];
      if (!s.v) s.v = 1;
      state = s;
      return state;
    } catch (e) {
      state = clone(DEFAULT);
      return state;
    }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* cuota llena */ }
  }

  var store = {
    get state() { return state; },
    init: function () { if (!state) load(); return state; },
    save: save,
    todayISO: todayISO,
    uid: uid,
    reset: function () { state = clone(DEFAULT); save(); },

    // --- ajustes ---
    settings: function () { return state.settings; },
    updateSettings: function (patch) { Object.assign(state.settings, patch); save(); },

    // --- rutinas ---
    routines: function () { return state.routines; },
    routine: function (id) {
      for (var i = 0; i < state.routines.length; i++) if (state.routines[i].id === id) return state.routines[i];
      return null;
    },
    activeRoutine: function () {
      var r = store.routine(state.activeRoutineId);
      if (r) return r;
      return state.routines[0] || null;
    },
    setActive: function (id) { state.activeRoutineId = id; save(); },
    addRoutine: function (r) {
      r.id = r.id || uid('rt');
      r.createdAt = r.createdAt || Date.now();
      state.routines.unshift(r);
      if (!state.activeRoutineId) state.activeRoutineId = r.id;
      save();
      return r;
    },
    updateRoutine: function (r) {
      for (var i = 0; i < state.routines.length; i++) {
        if (state.routines[i].id === r.id) { state.routines[i] = r; break; }
      }
      save();
      return r;
    },
    deleteRoutine: function (id) {
      state.routines = state.routines.filter(function (r) { return r.id !== id; });
      if (state.activeRoutineId === id) state.activeRoutineId = state.routines[0] ? state.routines[0].id : null;
      save();
    },
    duplicateRoutine: function (id) {
      var r = store.routine(id);
      if (!r) return null;
      var c = clone(r);
      c.id = uid('rt');
      c.name = r.name + ' (copia)';
      c.createdAt = Date.now();
      state.routines.unshift(c);
      save();
      return c;
    },

    // --- registro de entrenamientos ---
    logs: function () { return state.logs; },
    logsSorted: function () { return state.logs.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }); },
    addLog: function (log) {
      log.id = log.id || uid('log');
      state.logs.unshift(log);
      save();
      return log;
    },
    updateLog: function (log) {
      for (var i = 0; i < state.logs.length; i++) if (state.logs[i].id === log.id) { state.logs[i] = log; break; }
      save();
    },
    deleteLog: function (id) {
      state.logs = state.logs.filter(function (l) { return l.id !== id; });
      save();
    },
    logFor: function (date, routineId, dayId) {
      for (var i = 0; i < state.logs.length; i++) {
        var l = state.logs[i];
        if (l.date === date && l.dayId === dayId && (!routineId || l.routineId === routineId)) return l;
      }
      return null;
    },
    lastLogForExercise: function (exId, beforeDate) {
      var best = null;
      state.logs.forEach(function (l) {
        if (beforeDate && l.date >= beforeDate) return;
        (l.entries || []).forEach(function (en) {
          if (en.exId !== exId) return;
          if (!best || l.date > best.date) best = { date: l.date, entry: en };
        });
      });
      return best;
    },
    bestForExercise: function (exId) {
      var max = 0, repsAtMax = 0;
      state.logs.forEach(function (l) {
        (l.entries || []).forEach(function (en) {
          if (en.exId !== exId) return;
          (en.sets || []).forEach(function (s) {
            var w = Number(s.w) || 0;
            if (w > max) { max = w; repsAtMax = Number(s.r) || 0; }
          });
        });
      });
      return max ? { w: max, r: repsAtMax } : null;
    },
    // volumen (kg) por semana ISO
    weeklyVolume: function (weeks) {
      var out = {};
      state.logs.forEach(function (l) {
        var v = 0;
        (l.entries || []).forEach(function (en) {
          var mult = en.uni ? 2 : 1;
          (en.sets || []).forEach(function (s) {
            if (s.done === false) return;
            v += (Number(s.w) || 0) * (Number(s.r) || 0) * mult;
          });
        });
        var d = new Date(l.date + 'T00:00:00');
        var monday = new Date(d);
        var dow = (d.getDay() + 6) % 7;
        monday.setDate(d.getDate() - dow);
        var k = todayISO(monday);
        out[k] = (out[k] || 0) + v;
      });
      var keys = Object.keys(out).sort();
      if (weeks) keys = keys.slice(-weeks);
      return keys.map(function (k) { return { week: k, volume: Math.round(out[k]) }; });
    },
    // series semanales por grupo muscular (últimos 7 días de registros)
    weeklySets: function (sinceDate) {
      var sets = {};
      var since = sinceDate || todayISO(new Date(Date.now() - 7 * 864e5));
      state.logs.forEach(function (l) {
        if (l.date < since) return;
        (l.entries || []).forEach(function (en) {
          var ex = global.DB.byId[en.exId];
          if (!ex) return;
          var n = (en.sets || []).filter(function (s) { return s.done !== false; }).length;
          sets[ex.g] = (sets[ex.g] || 0) + n;
          (ex.sec || []).forEach(function (g) { sets[g] = (sets[g] || 0) + n * 0.5; });
        });
      });
      return sets;
    },
    weights: function () { return state.weights; },
    addWeight: function (kg, date) {
      var d = date || todayISO();
      state.weights = state.weights.filter(function (w) { return w.date !== d; });
      state.weights.push({ date: d, kg: Number(kg) });
      state.weights.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
      save();
    },

    // --- backup ---
    exportJSON: function () { return JSON.stringify(state, null, 2); },
    importJSON: function (txt) {
      var s = JSON.parse(txt);
      if (!s || !s.settings) throw new Error('Archivo no válido');
      state = s;
      save();
    }
  };

  global.Store = store;
})(window);
