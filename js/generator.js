/* ==========================================================================
   GENERATOR — rutina equilibrada y aleatoria según días, nivel y tiempo
   Basado en reparto de volumen semanal por grupo muscular (10-20 series),
   prioridad de ejercicios compuestos y ajuste al tiempo disponible.
   ========================================================================== */
(function (global) {
  'use strict';

  var DB = global.DB;

  // Reparto de grupos por día según los días disponibles
  var SPLITS = {
    1: [
      { name: 'Cuerpo completo', focus: ['cuadriceps', 'pecho', 'espalda', 'hombros', 'isquios', 'core'] }
    ],
    2: [
      { name: 'Cuerpo completo A', focus: ['cuadriceps', 'pecho', 'espalda', 'core'] },
      { name: 'Cuerpo completo B', focus: ['isquios', 'gluteos', 'hombros', 'espalda', 'biceps', 'triceps'] }
    ],
    3: [
      { name: 'Empuje', focus: ['pecho', 'hombros', 'triceps'] },
      { name: 'Tirón', focus: ['espalda', 'biceps', 'core'] },
      { name: 'Pierna', focus: ['cuadriceps', 'isquios', 'gluteos', 'core', 'gemelos'] }
    ],
    4: [
      { name: 'Torso A', focus: ['pecho', 'espalda', 'hombros', 'triceps', 'core'] },
      { name: 'Pierna A', focus: ['cuadriceps', 'gluteos', 'isquios', 'gemelos', 'core'] },
      { name: 'Torso B', focus: ['espalda', 'pecho', 'hombros', 'biceps', 'core'] },
      { name: 'Pierna B', focus: ['isquios', 'gluteos', 'cuadriceps', 'core', 'gemelos'] }
    ],
    5: [
      { name: 'Empuje', focus: ['pecho', 'hombros', 'triceps'] },
      { name: 'Tirón', focus: ['espalda', 'biceps', 'core'] },
      { name: 'Pierna', focus: ['cuadriceps', 'isquios', 'gluteos', 'core'] },
      { name: 'Torso', focus: ['pecho', 'espalda', 'hombros', 'biceps', 'triceps'] },
      { name: 'Pierna 2', focus: ['gluteos', 'isquios', 'cuadriceps', 'gemelos', 'core'] }
    ]
  };

  var SPLIT_LABEL = {
    1: 'Full body', 2: 'Full body A/B', 3: 'Empuje · Tirón · Pierna',
    4: 'Torso · Pierna (x2)', 5: 'PPL + Torso · Pierna'
  };

  // Familias musculares afines: para poder añadir un grupo enfatizado a un día compatible
  var FAMILIES = {
    pecho: ['pecho', 'hombros', 'triceps'],
    espalda: ['espalda', 'biceps'],
    cuadriceps: ['cuadriceps', 'gluteos', 'isquios'],
    isquios: ['isquios', 'gluteos', 'cuadriceps'],
    gluteos: ['gluteos', 'isquios', 'cuadriceps'],
    hombros: ['hombros', 'pecho', 'triceps'],
    biceps: ['biceps', 'espalda'],
    triceps: ['triceps', 'pecho', 'hombros'],
    core: ['core', 'pecho', 'espalda', 'cuadriceps'],
    gemelos: ['gemelos', 'cuadriceps', 'isquios'],
    antebrazo: ['antebrazo', 'biceps']
  };

  var PRIORITY = ['cuadriceps', 'espalda', 'pecho', 'gluteos', 'isquios', 'hombros', 'biceps', 'triceps', 'core', 'gemelos', 'antebrazo'];

  function rnd(n) { return Math.floor(Math.random() * n); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function allowedEquip(profileId) {
    for (var i = 0; i < DB.profiles.length; i++) {
      if (DB.profiles[i].id === profileId) return DB.profiles[i].equip;
    }
    return DB.profiles[0].equip;
  }

  function fitEquipment(ex, allowed) {
    for (var i = 0; i < ex.e.length; i++) {
      if (ex.e[i] === 'corporal') return true;
      if (allowed.indexOf(ex.e[i]) >= 0) return true;
    }
    return false;
  }

  function fitsLevel(ex, level) {
    return ex.l <= level + 1;
  }

  // coste en segundos de un ejercicio (trabajo + descanso entre series)
  function exerciseSeconds(ex, sets) {
    var work = (ex.r && ex.r.indexOf('s') > 0) ? Number(ex.r) || 40 : 40; // series por tiempo
    return sets * (work + ex.rest);
  }

  function estimateMinutes(day) {
    var s = 5 * 60; // calentamiento
    day.exercises.forEach(function (e) { s += exerciseSeconds(DB.byId[e.exId] || { rest: 90, r: '10' }, e.sets); });
    return Math.round(s / 60);
  }

  function generate(opts) {
    opts = opts || {};
    var days = clamp(opts.days || 3, 1, 5);
    var level = clamp(opts.level || 2, 1, 3);
    var profile = opts.profile || 'completo';
    var duration = clamp(opts.duration || 45, 20, 120);
    var emphasis = (opts.emphasis || []).slice();
    var emphasisLevel = clamp(opts.emphasisLevel || 2, 1, 3);
    var emphasisSet = {};
    emphasis.forEach(function (g) { emphasisSet[g] = true; });
    var allowed = allowedEquip(profile);

    var split = SPLITS[days];
    var usedWeek = {};   // exId -> true (variedad semanal)
    var plan = split.map(function (d) {
      return { name: d.name, focus: d.focus.slice(), exercises: [] };
    });

    // Añade los grupos enfatizados a los días compatibles (para no descuidarlos ni
    // dejarlos sin entrenar). Un grupo solo se añade si no está ya en ese día.
    emphasis.forEach(function (g) {
      if (!DB.byGroup[g] || !DB.byGroup[g].length) return;
      // si el grupo ya aparece en algún día, no hace falta añadirlo a más
      var present = plan.some(function (d) { return d.focus.indexOf(g) >= 0; });
      if (present) return;
      // busca el día con más solapamiento de familia
      var fam = FAMILIES[g] || [g];
      var best = -1, bestScore = -1;
      plan.forEach(function (d, i) {
        var sc = d.focus.filter(function (x) { return fam.indexOf(x) >= 0; }).length;
        if (sc > bestScore) { bestScore = sc; best = i; }
      });
      if (best < 0) best = 0;
      plan[best].focus.push(g);
    });

    // nº de ejercicios que caben en el tiempo disponible
    var maxEx = clamp(Math.round((duration - 5) / 6.2), 3, 12);

    plan.forEach(function (day, dayIdx) {
      var focus = day.focus.filter(function (g) { return DB.byGroup[g] && DB.byGroup[g].length; });
      var slots = [];

      // 1 ejercicio por grupo, en orden de prioridad
      focus.forEach(function (g) { slots.push({ g: g, order: 0 }); });

      // extras: los grupos enfatizados primero, luego el resto por prioridad
      var extraOrder = [];
      emphasis.forEach(function (g) { if (focus.indexOf(g) >= 0 && extraOrder.indexOf(g) < 0) extraOrder.push(g); });
      PRIORITY.forEach(function (g) { if (focus.indexOf(g) >= 0 && extraOrder.indexOf(g) < 0) extraOrder.push(g); });

      var guard = 0;
      while (slots.length < maxEx && guard++ < 60) {
        var added = false;
        for (var i = 0; i < extraOrder.length && slots.length < maxEx; i++) {
          var g = extraOrder[i];
          var count = slots.filter(function (s) { return s.g === g; }).length;
          var isEmph = !!emphasisSet[g];
          var cap;
          if (g === 'core' || g === 'gemelos' || g === 'antebrazo') cap = isEmph ? 3 : (g === 'core' ? 2 : 1);
          else cap = isEmph ? 4 : 3;
          if (count > 0 && count < cap) { slots.push({ g: g, order: count }); added = true; break; }
        }
        if (!added) break;
      }

      // orden final: compuestos/grandes primero, core al final
      slots.sort(function (a, b) {
        return (PRIORITY.indexOf(a.g) - PRIORITY.indexOf(b.g)) || (a.order - b.order);
      });

      var usedToday = {};
      var patterns = {};

      slots.forEach(function (slot, idx) {
        var cands = DB.byGroup[slot.g] || [];
        var best = null, bestScore = -1e9;
        cands.forEach(function (ex) {
          if (!fitEquipment(ex, allowed)) return;
          if (!fitsLevel(ex, level)) return;
          if (usedToday[ex.id]) return;
          var score = Math.random() * 4;
          if (!usedWeek[ex.id]) score += 5;
          if (slot.order === 0) score += (ex.t === 'c' ? 7 : -1);
          else score += (ex.t === 'a' ? 3 : 0.5);
          if (!patterns[ex.p]) score += 2;
          if (ex.l > level) score -= 1.5;
          if (idx === 0 && ex.t === 'c') score += 3;
          if (best === null || score > bestScore) { best = ex; bestScore = score; }
        });
        if (!best) {
          // sin candidatos: relaja el nivel
          (DB.byGroup[slot.g] || []).some(function (ex) {
            if (fitEquipment(ex, allowed) && !usedToday[ex.id]) { best = ex; return true; }
            return false;
          });
        }
        if (!best) return;
        usedToday[best.id] = true;
        usedWeek[best.id] = true;
        patterns[best.p] = true;
        day.exercises.push({
          exId: best.id,
          sets: 3,
          reps: best.r,
          rest: best.rest,
          note: ''
        });
      });

      // --- ajuste de series al tiempo objetivo ---
      var budget = duration * 60;
      var total = 5 * 60 + day.exercises.reduce(function (a, e) {
        return a + exerciseSeconds(DB.byId[e.exId] || { rest: 90, r: '10' }, e.sets);
      }, 0);

      // si sobra tiempo, los compuestos de grupos enfatizados ganan una serie (más estímulo)
      day.exercises.forEach(function (e, idx) {
        var ex = DB.byId[e.exId];
        if (!ex || ex.t !== 'c') return;
        if (!emphasisSet[ex.g]) return;
        if (idx > 1) return; // solo los dos primeros ejercicios del grupo
        if (e.sets >= 5) return;
        var cost = exerciseSeconds(ex, 1);
        if (total + cost <= budget - 45) {
          e.sets += 1;
          total += cost;
        }
      });

      // si sobra tiempo, el primer compuesto gana una serie (más estímulo)
      var first = day.exercises[0];
      if (first && total + (exerciseSeconds(DB.byId[first.exId] || { rest: 120 }, 1)) <= budget - 60) {
        if ((DB.byId[first.exId] || {}).t === 'c' && level >= 2) {
          first.sets += 1;
          total = 5 * 60 + day.exercises.reduce(function (a, e) {
            return a + exerciseSeconds(DB.byId[e.exId] || { rest: 90, r: '10' }, e.sets);
          }, 0);
        }
      }

      // si se pasa, recorta series y luego ejercicios
      var i = day.exercises.length - 1;
      while (total > budget + 45 && i >= 0) {
        var e = day.exercises[i];
        if (e.sets > 2) {
          e.sets -= 1;
          total = 5 * 60 + day.exercises.reduce(function (a, x) {
            return a + exerciseSeconds(DB.byId[x.exId] || { rest: 90, r: '10' }, x.sets);
          }, 0);
        } else { i--; }
      }
      if (total > budget + 45) {
        while (total > budget + 45 && day.exercises.length > 3) {
          var last = day.exercises.pop();
          usedWeek[last.exId] = false;
          total = 5 * 60 + day.exercises.reduce(function (a, x) {
            return a + exerciseSeconds(DB.byId[x.exId] || { rest: 90, r: '10' }, x.sets);
          }, 0);
        }
      }

      day.estimated = Math.round(total / 60);
    });

    // volumen semanal resultante (series efectivas por grupo)
    var weekly = {};
    plan.forEach(function (d) {
      d.exercises.forEach(function (e) {
        var ex = DB.byId[e.exId];
        if (!ex) return;
        weekly[ex.g] = (weekly[ex.g] || 0) + e.sets;
        (ex.sec || []).forEach(function (g) { weekly[g] = (weekly[g] || 0) + e.sets * 0.5; });
      });
    });

    var routine = {
      id: global.Store ? global.Store.uid('rt') : 'rt_' + Date.now(),
      name: (opts.name || ('Rutina ' + days + ' días')),
      generated: true,
      createdAt: Date.now(),
      meta: {
        days: days, level: level, profile: profile, duration: duration,
        split: SPLIT_LABEL[days],
        emphasis: emphasis,
        emphasisLevel: emphasisLevel,
        volume: weekly
      },
      days: plan.map(function (d, i) {
        return {
          id: 'd' + (i + 1),
          name: d.name,
          focus: d.focus,
          estimated: d.estimated,
          exercises: d.exercises
        };
      })
    };
    return routine;
  }

  // Comprobación de equilibrio: devuelve avisos legibles
  function balanceReport(routine) {
    var weekly = {};
    routine.days.forEach(function (d) {
      d.exercises.forEach(function (e) {
        var ex = DB.byId[e.exId];
        if (!ex) return;
        weekly[ex.g] = (weekly[ex.g] || 0) + e.sets;
        (ex.sec || []).forEach(function (g) { weekly[g] = (weekly[g] || 0) + e.sets * 0.5; });
      });
    });
    var emph = (routine.meta && routine.meta.emphasis) || [];
    var emphSet = {};
    emph.forEach(function (g) { emphSet[g] = true; });
    var out = [];
    DB.groups.forEach(function (g) {
      var n = Math.round(weekly[g.id] || 0);
      if (!n) return;
      var target = DB.volumeTarget[g.id] || 8;
      var status = n < target * 0.6 ? 'bajo' : (n > target * 1.8 ? 'alto' : 'ok');
      out.push({ group: g, sets: n, target: target, status: status, emphasized: !!emphSet[g.id] });
    });
    out.sort(function (a, b) { return b.sets - a.sets; });
    return out;
  }

  global.Generator = {
    generate: generate,
    balanceReport: balanceReport,
    estimateMinutes: estimateMinutes,
    splitLabel: SPLIT_LABEL
  };
})(window);
