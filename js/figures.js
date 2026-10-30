/* ==========================================================================
   FIGURES — ilustraciones vectoriales de ejecución (2 fotogramas + flecha)
   Estilo: pictograma de línea, vista lateral/frontal, equipo simplificado.
   Todas las poses se definen en un lienzo de 120 x 120.
   ========================================================================== */
(function (global) {
  'use strict';

  var R = {
    torso: 'var(--fg)',
    limb: 'var(--fg)',
    far: 'var(--fg-far)',
    accent: 'var(--accent)',
    prop: 'var(--prop)',
    propSoft: 'var(--prop-soft)'
  };

  // --- utilidades geométricas ---------------------------------------------
  function P(x, y) { return { x: x, y: y }; }
  function from(base, ang, len) {
    var r = ang * Math.PI / 180;
    return P(base.x + Math.sin(r) * len, base.y + Math.cos(r) * len);
  }
  function mid(a, b) { return P((a.x + b.x) / 2, (a.y + b.y) / 2); }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function line(a, b, w, color, extra) {
    return '<line x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x.toFixed(1) +
      '" y2="' + b.y.toFixed(1) + '" stroke="' + color + '" stroke-width="' + (w || 5) +
      '" stroke-linecap="round"' + (extra || '') + '/>';
  }
  function poly(points, w, color, fill) {
    var d = points.map(function (p, i) { return (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); }).join(' ');
    return '<path d="' + d + '" fill="' + (fill || 'none') + '" stroke="' + (fill ? 'none' : color) +
      '" stroke-width="' + (w || 4) + '" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function circle(c, r, fill, stroke, sw) {
    return '<circle cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) + '" r="' + r + '" fill="' +
      (fill || 'none') + '" stroke="' + (stroke || 'none') + '" stroke-width="' + (sw || 2) + '"/>';
  }

  // --- construcción de poses ----------------------------------------------
  // Pose: { x, y (cadera), lean (inclinación torso), head, armN, armF, legN, legF }
  // Cada miembro: { elbow, hand } / { knee, ankle, foot } (puntos absolutos)
  // Se permiten atajos angulares con from().
  function pose(o) {
    o = o || {};
    var hip = o.hip || P(58, 74);
    var lean = o.lean === undefined ? 0 : o.lean;       // grados, + = hacia delante (derecha)
    var torso = o.torso || 30;
    var ang = 180 - lean;
    var shoulder = from(hip, ang, torso);
    var head = from(shoulder, ang, o.neck || 8);
    var p = {
      hip: hip,
      shoulder: shoulder,
      head: head,
      lean: lean,
      armN: o.armN || null,
      armF: o.armF || null,
      legN: o.legN || null,
      legF: o.legF || null,
      headR: o.headR || 7
    };
    return p;
  }

  // espejo ligero para el miembro lejano (mismo miembro, desplazado)
  function shift(pt, dx, dy) { return pt ? P(pt.x + (dx || -2.5), pt.y + (dy || 0)) : null; }

  function limbPath(root, joint, end, color, w) {
    if (!joint || !end) return '';
    return line(root, joint, w || 5, color) + line(joint, end, (w || 5) - 0.6, color);
  }

  // --- equipo --------------------------------------------------------------
  function dumbbell(c, ang, color) {
    // mancuerna: barra corta + dos discos, orientada según el ángulo dado
    var r = ang * Math.PI / 180;
    var ux = Math.sin(r), uy = Math.cos(r);   // eje de la barra (perpendicular al antebrazo)
    var half = 5.5;
    var a = P(c.x - ux * half, c.y - uy * half);
    var b = P(c.x + ux * half, c.y + uy * half);
    return line(a, b, 2, color) +
      circle(P(a.x - ux * 1.2, a.y - uy * 1.2), 3.2, color) +
      circle(P(b.x + ux * 1.2, b.y + uy * 1.2), 3.2, color);
  }

  function barbell(c, color) {
    // vista lateral: disco
    return circle(c, 7.5, 'none', color, 2.6) + circle(c, 2.2, color);
  }

  function kettlebell(c, color) {
    return '<path d="M' + (c.x - 4).toFixed(1) + ' ' + (c.y - 4).toFixed(1) +
      ' q4 -6 8 0" fill="none" stroke="' + color + '" stroke-width="2.4" stroke-linecap="round"/>' +
      circle(P(c.x, c.y + 2), 6, 'none', color, 2.6);
  }

  function band(c, color) {
    return '<path d="M' + (c.x - 14).toFixed(1) + ' ' + (c.y + 2).toFixed(1) +
      ' q7 -5 14 0 q7 5 14 0" fill="none" stroke="' + color + '" stroke-width="2.4" stroke-linecap="round"/>';
  }

  function bench(x, y, w, ang, soft) {
    var a = (ang || 0) * Math.PI / 180;
    var hx = Math.cos(a) * w / 2, hy = Math.sin(a) * w / 2;
    var x1 = x - hx, y1 = y - hy, x2 = x + hx, y2 = y + hy;
    return '<g><line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) +
      '" y2="' + y2.toFixed(1) + '" stroke="' + R.prop + '" stroke-width="4.5" stroke-linecap="round"/>' +
      (soft ? '' : '<line x1="' + (x1 + 4).toFixed(1) + '" y1="' + (y1 + 6).toFixed(1) + '" x2="' + (x1 + 4).toFixed(1) +
        '" y2="' + (y1 + 22).toFixed(1) + '" stroke="' + R.prop + '" stroke-width="2" opacity=".55"/>' +
        '<line x1="' + (x2 - 4).toFixed(1) + '" y1="' + (y2 + 6).toFixed(1) + '" x2="' + (x2 - 4).toFixed(1) +
        '" y2="' + (y2 + 22).toFixed(1) + '" stroke="' + R.prop + '" stroke-width="2" opacity=".55"/>') +
      '</g>';
  }

  function frame(x, y, w, h) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" fill="none" stroke="' +
      R.prop + '" stroke-width="2.4"/>';
  }

  function stack(x, y, plates) {
    var s = '<rect x="' + x + '" y="' + y + '" width="14" height="' + (plates * 3.4 + 6) +
      '" rx="2" fill="none" stroke="' + R.prop + '" stroke-width="2" opacity=".8"/>';
    for (var i = 0; i < plates; i++) {
      s += '<line x1="' + (x + 3) + '" y1="' + (y + 5 + i * 3.4) + '" x2="' + (x + 11) + '" y2="' +
        (y + 5 + i * 3.4) + '" stroke="' + R.prop + '" stroke-width="1.6" opacity=".55"/>';
    }
    return s;
  }

  function pulley(c, color) {
    return circle(c, 4.2, 'var(--bg)', color, 2.2) + circle(c, 1.2, color);
  }

  function cable(fromPt, toPt, color, op) {
    var mx = fromPt.x + 6;
    return '<path d="M' + fromPt.x.toFixed(1) + ' ' + fromPt.y.toFixed(1) + ' Q' + mx.toFixed(1) + ' ' +
      ((fromPt.y + toPt.y) / 2).toFixed(1) + ' ' + toPt.x.toFixed(1) + ' ' + toPt.y.toFixed(1) +
      '" fill="none" stroke="' + color + '" stroke-width="1.8" opacity="' + (op || .85) + '"/>';
  }

  function ground(y) {
    return '<line x1="8" y1="' + y + '" x2="112" y2="' + y + '" stroke="' + R.prop +
      '" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>';
  }

  // --- dibujo de una pose --------------------------------------------------
  function drawPose(p, opts) {
    opts = opts || {};
    var far = opts.far !== false;
    var s = '';
    // piernas lejanas primero
    if (far && p.legF) s += limbPath(p.hip, p.legF.knee, p.legF.ankle, R.far, 4.4) +
      (p.legF.foot ? line(p.legF.ankle, p.legF.foot, 4, R.far) : '');
    if (far && p.armF) s += limbPath(p.shoulder, p.armF.elbow, p.armF.hand, R.far, 4.4);
    // torso
    s += line(p.hip, p.shoulder, 5.6, R.torso);
    s += line(p.shoulder, P(p.head.x, p.head.y), 4, R.torso);
    s += circle(p.head, p.headR, R.torso);
    // pierna cercana
    if (p.legN) s += limbPath(p.hip, p.legN.knee, p.legN.ankle, R.limb, 5.2) +
      (p.legN.foot ? line(p.legN.ankle, p.legN.foot, 4.6, R.limb) : '');
    // brazo cercano
    if (p.armN) s += limbPath(p.shoulder, p.armN.elbow, p.armN.hand, R.limb, 5.2);
    return s;
  }

  function handPoint(p, near) {
    var a = near === false ? p.armF : p.armN;
    return a ? a.hand : p.shoulder;
  }

  function arrow(a, b, color, bend) {
    if (!a || !b) return '';
    var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    var dx = b.x - a.x, dy = b.y - a.y;
    var len = Math.hypot(dx, dy) || 1;
    var nx = -dy / len, ny = dx / len;
    var off = bend === undefined ? 10 : bend;
    var cx = mx + nx * off, cy = my + ny * off;
    var ang = Math.atan2(b.y - cy, b.x - cx) * 180 / Math.PI;
    var hx1 = b.x - 5 * Math.cos((ang - 22) * Math.PI / 180);
    var hy1 = b.y - 5 * Math.sin((ang - 22) * Math.PI / 180);
    var hx2 = b.x - 5 * Math.cos((ang + 22) * Math.PI / 180);
    var hy2 = b.y - 5 * Math.sin((ang + 22) * Math.PI / 180);
    return '<path d="M' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) + ' Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) +
      ' ' + b.x.toFixed(1) + ' ' + b.y.toFixed(1) + '" fill="none" stroke="' + color +
      '" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="3 3" opacity=".85"/>' +
      '<path d="M' + hx1.toFixed(1) + ' ' + hy1.toFixed(1) + ' L' + b.x.toFixed(1) + ' ' + b.y.toFixed(1) +
      ' L' + hx2.toFixed(1) + ' ' + hy2.toFixed(1) + '" fill="none" stroke="' + color +
      '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
  }

  // =======================================================================
  //  PATRONES
  //  Cada patrón: { equip, frames:[poseA, poseB], props(fn), hideArrow }
  //  poseB es la posición final (se dibuja sólida); poseA la inicial (fantasma)
  // =======================================================================
  var PAT = {};

  // --- PECHO --------------------------------------------------------------
  PAT['bench-press'] = {
    equip: 'bar',
    frames: [
      pose({
        hip: P(78, 78), torso: 30, lean: 88,
        head: null,
        armN: { elbow: P(52, 66), hand: P(46, 58) },
        legN: { knee: P(92, 92), ankle: P(104, 104), foot: P(111, 104) },
        legF: { knee: P(90, 94), ankle: P(101, 106), foot: P(108, 106) }
      }),
      pose({
        hip: P(78, 78), torso: 30, lean: 88,
        armN: { elbow: P(46, 60), hand: P(44, 40) },
        legN: { knee: P(92, 92), ankle: P(104, 104), foot: P(111, 104) },
        legF: { knee: P(90, 94), ankle: P(101, 106), foot: P(108, 106) }
      })
    ],
    props: function () { return bench(62, 84, 40, 0) + ground(116); }
  };

  PAT['incline-press'] = {
    equip: 'bar',
    frames: [
      pose({
        hip: P(74, 92), torso: 30, lean: 45,
        armN: { elbow: P(52, 74), hand: P(46, 66) },
        legN: { knee: P(90, 100), ankle: P(100, 112), foot: P(107, 112) },
        legF: { knee: P(88, 102), ankle: P(97, 112), foot: P(104, 112) }
      }),
      pose({
        hip: P(74, 92), torso: 30, lean: 45,
        armN: { elbow: P(44, 66), hand: P(41, 46) },
        legN: { knee: P(90, 100), ankle: P(100, 112), foot: P(107, 112) },
        legF: { knee: P(88, 102), ankle: P(97, 112), foot: P(104, 112) }
      })
    ],
    props: function () { return bench(58, 90, 36, -40) + ground(116); }
  };

  PAT['fly'] = {
    equip: 'db',
    frames: [
      pose({
        hip: P(76, 80), torso: 28, lean: 88,
        armN: { elbow: P(50, 74), hand: P(38, 68) },
        legN: { knee: P(92, 94), ankle: P(104, 106), foot: P(111, 106) },
        legF: { knee: P(90, 96), ankle: P(101, 108), foot: P(108, 108) }
      }),
      pose({
        hip: P(76, 80), torso: 28, lean: 88,
        armN: { elbow: P(54, 60), hand: P(52, 42) },
        legN: { knee: P(92, 94), ankle: P(104, 106), foot: P(111, 106) },
        legF: { knee: P(90, 96), ankle: P(101, 108), foot: P(108, 108) }
      })
    ],
    props: function () { return bench(58, 86, 40, 0) + ground(116); }
  };

  PAT['pushup'] = {
    equip: 'body',
    frames: [
      pose({
        hip: P(66, 86), torso: 26, lean: 74,
        armN: { elbow: P(74, 96), hand: P(80, 106) },
        legN: { knee: P(82, 100), ankle: P(98, 110), foot: P(104, 106) },
        legF: { knee: P(80, 102), ankle: P(95, 112), foot: P(101, 108) }
      }),
      pose({
        hip: P(64, 74), torso: 26, lean: 74,
        armN: { elbow: P(56, 86), hand: P(60, 106) },
        legN: { knee: P(80, 92), ankle: P(98, 110), foot: P(104, 106) },
        legF: { knee: P(78, 94), ankle: P(95, 112), foot: P(101, 108) }
      })
    ],
    props: function () { return ground(116); }
  };

  PAT['dip'] = {
    equip: 'body',
    frames: [
      pose({
        hip: P(58, 90), torso: 27, lean: 8,
        armN: { elbow: P(62, 76), hand: P(74, 64) },
        armF: { elbow: P(60, 78), hand: P(72, 66) },
        legN: { knee: P(48, 102), ankle: P(52, 112), foot: P(46, 110) },
        legF: { knee: P(46, 104), ankle: P(50, 114), foot: P(44, 112) }
      }),
      pose({
        hip: P(58, 74), torso: 27, lean: 8,
        armN: { elbow: P(64, 60), hand: P(74, 64) },
        armF: { elbow: P(62, 62), hand: P(72, 66) },
        legN: { knee: P(48, 86), ankle: P(52, 96), foot: P(46, 94) },
        legF: { knee: P(46, 88), ankle: P(50, 98), foot: P(44, 96) }
      })
    ],
    props: function () {
      return '<line x1="66" y1="62" x2="92" y2="62" stroke="' + R.prop + '" stroke-width="4" stroke-linecap="round"/>' +
        '<line x1="86" y1="62" x2="86" y2="112" stroke="' + R.prop + '" stroke-width="2.4" opacity=".7"/>' +
        '<line x1="66" y1="62" x2="66" y2="112" stroke="' + R.prop + '" stroke-width="2.4" opacity=".7"/>';
    }
  };

  PAT['cable-fly'] = {
    equip: 'cable',
    cableFrom: P(24, 34),
    frames: [
      pose({
        hip: P(58, 82), torso: 30, lean: 6,
        armN: { elbow: P(42, 62), hand: P(30, 56) },
        legN: { knee: P(61, 98), ankle: P(62, 114), foot: P(69, 114) },
        legF: { knee: P(56, 100), ankle: P(56, 116), foot: P(63, 116) }
      }),
      pose({
        hip: P(58, 82), torso: 30, lean: 6,
        armN: { elbow: P(64, 64), hand: P(78, 66) },
        legN: { knee: P(61, 98), ankle: P(62, 114), foot: P(69, 114) },
        legF: { knee: P(56, 100), ankle: P(56, 116), foot: P(63, 116) }
      })
    ],
    props: function () {
      return '<line x1="24" y1="20" x2="24" y2="30" stroke="' + R.prop + '" stroke-width="2.4"/>' +
        pulley(P(24, 34)) + stack(104, 58, 4) + ground(120);
    }
  };

  PAT['glute-kickback'] = {
    equip: 'band',
    frames: [
      pose({
        hip: P(58, 74), torso: 28, lean: 34,
        armN: { elbow: P(46, 84), hand: P(42, 96) },
        armF: { elbow: P(50, 86), hand: P(46, 98) },
        legN: { knee: P(72, 84), ankle: P(74, 100), foot: P(71, 104) },
        legF: { knee: P(72, 88), ankle: P(74, 104), foot: P(71, 108) }
      }),
      pose({
        hip: P(58, 74), torso: 28, lean: 34,
        armN: { elbow: P(46, 84), hand: P(42, 96) },
        armF: { elbow: P(50, 86), hand: P(46, 98) },
        legN: { knee: P(76, 74), ankle: P(94, 68), foot: P(99, 74) },
        legF: { knee: P(76, 78), ankle: P(94, 72), foot: P(99, 78) }
      })
    ],
    props: function () { return ground(112); }
  };

  // --- ESPALDA ------------------------------------------------------------
  PAT['pulldown'] = {
    equip: 'cable',
    frames: [
      pose({
        hip: P(58, 100), torso: 30, lean: -6,
        armN: { elbow: P(48, 78), hand: P(44, 58) },
        legN: { knee: P(70, 106), ankle: P(72, 114), foot: P(79, 114) },
        legF: { knee: P(67, 108), ankle: P(68, 116), foot: P(75, 116) }
      }),
      pose({
        hip: P(58, 100), torso: 30, lean: -6,
        armN: { elbow: P(66, 80), hand: P(70, 62) },
        legN: { knee: P(70, 106), ankle: P(72, 114), foot: P(79, 114) },
        legF: { knee: P(67, 108), ankle: P(68, 116), foot: P(75, 116) }
      })
    ],
    props: function () {
      return '<rect x="56" y="40" width="56" height="8" rx="2" fill="none" stroke="' + R.prop + '" stroke-width="2"/>' +
        stack(104, 54, 6) + pulley(P(100, 44)) + ground(118);
    }
  };

  PAT['pullup'] = {
    equip: 'body',
    frames: [
      pose({
        hip: P(58, 90), torso: 28, lean: 4,
        armN: { elbow: P(48, 70), hand: P(44, 46) },
        legN: { knee: P(54, 104), ankle: P(52, 114), foot: P(46, 112) },
        legF: { knee: P(56, 106), ankle: P(55, 116), foot: P(49, 114) }
      }),
      pose({
        hip: P(58, 74), torso: 28, lean: 4,
        armN: { elbow: P(66, 62), hand: P(44, 46) },
        legN: { knee: P(54, 88), ankle: P(52, 98), foot: P(46, 96) },
        legF: { knee: P(56, 90), ankle: P(55, 100), foot: P(49, 98) }
      })
    ],
    props: function () {
      return '<line x1="36" y1="44" x2="76" y2="44" stroke="' + R.prop + '" stroke-width="4" stroke-linecap="round"/>' +
        '<line x1="40" y1="44" x2="40" y2="30" stroke="' + R.prop + '" stroke-width="2.4"/>' +
        '<line x1="72" y1="44" x2="72" y2="30" stroke="' + R.prop + '" stroke-width="2.4"/>';
    }
  };

  PAT['row-bent'] = {
    equip: 'bar',
    frames: [
      pose({
        hip: P(66, 62), torso: 32, lean: 76,
        armN: { elbow: P(58, 76), hand: P(56, 90) },
        legN: { knee: P(78, 78), ankle: P(78, 96), foot: P(85, 96) },
        legF: { knee: P(75, 80), ankle: P(74, 98), foot: P(81, 98) }
      }),
      pose({
        hip: P(66, 62), torso: 32, lean: 76,
        armN: { elbow: P(50, 68), hand: P(52, 74) },
        legN: { knee: P(78, 78), ankle: P(78, 96), foot: P(85, 96) },
        legF: { knee: P(75, 80), ankle: P(74, 98), foot: P(81, 98) }
      })
    ],
    props: function () { return ground(116); }
  };

  PAT['row-seated'] = {
    equip: 'cable',
    frames: [
      pose({
        hip: P(64, 98), torso: 30, lean: -4,
        armN: { elbow: P(52, 86), hand: P(40, 80) },
        legN: { knee: P(76, 96), ankle: P(88, 100), foot: P(88, 108) },
        legF: { knee: P(74, 98), ankle: P(85, 102), foot: P(85, 110) }
      }),
      pose({
        hip: P(64, 98), torso: 30, lean: -8,
        armN: { elbow: P(54, 92), hand: P(64, 92) },
        legN: { knee: P(76, 96), ankle: P(88, 100), foot: P(88, 108) },
        legF: { knee: P(74, 98), ankle: P(85, 102), foot: P(85, 110) }
      })
    ],
    props: function () {
      return '<rect x="52" y="100" width="26" height="5" rx="2" fill="none" stroke="' + R.prop + '" stroke-width="2.2"/>' +
        stack(8, 92, 3) + pulley(P(16, 88)) + ground(116);
    }
  };

  PAT['row-single'] = {
    equip: 'db',
    frames: [
      pose({
        hip: P(64, 66), torso: 32, lean: 72,
        armN: { elbow: P(56, 80), hand: P(56, 94) },
        armF: { elbow: P(70, 74), hand: P(78, 84) },
        legN: { knee: P(76, 82), ankle: P(76, 100), foot: P(83, 100) },
        legF: { knee: P(72, 84), ankle: P(70, 102), foot: P(77, 102) }
      }),
      pose({
        hip: P(64, 66), torso: 32, lean: 72,
        armN: { elbow: P(48, 74), hand: P(52, 80) },
        armF: { elbow: P(70, 74), hand: P(78, 84) },
        legN: { knee: P(76, 82), ankle: P(76, 100), foot: P(83, 100) },
        legF: { knee: P(72, 84), ankle: P(70, 102), foot: P(77, 102) }
      })
    ],
    props: function () { return bench(78, 86, 26, 0) + ground(110); }
  };

  PAT['deadlift'] = {
    equip: 'bar',
    frames: [
      pose({
        hip: P(70, 74), torso: 34, lean: 52,
        armN: { elbow: P(78, 92), hand: P(80, 100) },
        legN: { knee: P(64, 88), ankle: P(66, 108), foot: P(73, 108) },
        legF: { knee: P(60, 90), ankle: P(60, 110), foot: P(67, 110) }
      }),
      pose({
        hip: P(64, 66), torso: 34, lean: 4,
        armN: { elbow: P(64, 84), hand: P(64, 98) },
        legN: { knee: P(66, 86), ankle: P(68, 110), foot: P(75, 110) },
        legF: { knee: P(62, 88), ankle: P(62, 112), foot: P(69, 112) }
      })
    ],
    props: function () { return ground(118); }
  };

  PAT['rdl'] = {
    equip: 'bar',
    frames: [
      pose({
        hip: P(66, 62), torso: 32, lean: 70,
        armN: { elbow: P(72, 82), hand: P(72, 100) },
        legN: { knee: P(66, 82), ankle: P(68, 106), foot: P(75, 106) },
        legF: { knee: P(62, 84), ankle: P(62, 108), foot: P(69, 108) }
      }),
      pose({
        hip: P(62, 64), torso: 32, lean: 4,
        armN: { elbow: P(64, 84), hand: P(64, 102) },
        legN: { knee: P(64, 84), ankle: P(66, 108), foot: P(73, 108) },
        legF: { knee: P(60, 86), ankle: P(60, 110), foot: P(67, 110) }
      })
    ],
    props: function () { return ground(118); }
  };

  PAT['back-extension'] = {
    equip: 'body',
    frames: [
      pose({
        hip: P(58, 82), torso: 28, lean: 68,
        armN: { elbow: P(46, 78), hand: P(40, 72) },
        legN: { knee: P(74, 92), ankle: P(86, 100), foot: P(86, 106) },
        legF: { knee: P(72, 94), ankle: P(83, 102), foot: P(83, 108) }
      }),
      pose({
        hip: P(58, 82), torso: 28, lean: 14,
        armN: { elbow: P(44, 72), hand: P(40, 64) },
        legN: { knee: P(74, 92), ankle: P(86, 100), foot: P(86, 106) },
        legF: { knee: P(72, 94), ankle: P(83, 102), foot: P(83, 108) }
      })
    ],
    props: function () { return bench(64, 94, 30, 0) + ground(112); }
  };

  PAT['shrug'] = {
    equip: 'bar',
    frames: [
      pose({
        hip: P(58, 76), torso: 30, lean: 0,
        armN: { elbow: P(61, 90), hand: P(62, 104) },
        legN: { knee: P(61, 95), ankle: P(62, 112), foot: P(69, 112) },
        legF: { knee: P(56, 97), ankle: P(56, 114), foot: P(63, 114) }
      }),
      pose({
        hip: P(58, 76), torso: 30, lean: 0,
        armN: { elbow: P(60, 88), hand: P(61, 100) },
        legN: { knee: P(61, 95), ankle: P(62, 112), foot: P(69, 112) },
        legF: { knee: P(56, 97), ankle: P(56, 114), foot: P(63, 114) }
      })
    ],
    props: function () { return ground(116); },
    arrowAt: 'shoulder'
  };

  // --- HOMBROS ------------------------------------------------------------
  PAT['ohp'] = {
    equip: 'bar',
    frames: [
      pose({
        hip: P(58, 78), torso: 30, lean: 0,
        armN: { elbow: P(66, 66), hand: P(64, 56) },
        legN: { knee: P(61, 96), ankle: P(62, 112), foot: P(69, 112) },
        legF: { knee: P(56, 98), ankle: P(56, 114), foot: P(63, 114) }
      }),
      pose({
        hip: P(58, 78), torso: 30, lean: 0,
        armN: { elbow: P(62, 56), hand: P(62, 38) },
        legN: { knee: P(61, 96), ankle: P(62, 112), foot: P(69, 112) },
        legF: { knee: P(56, 98), ankle: P(56, 114), foot: P(63, 114) }
      })
    ],
    props: function () { return ground(116); }
  };

  PAT['shoulder-press'] = {
    equip: 'db',
    frames: [
      pose({
        hip: P(58, 96), torso: 30, lean: 0,
        armN: { elbow: P(68, 80), hand: P(70, 70) },
        legN: { knee: P(76, 98), ankle: P(88, 100), foot: P(88, 108) },
        legF: { knee: P(74, 100), ankle: P(85, 102), foot: P(85, 110) }
      }),
      pose({
        hip: P(58, 96), torso: 30, lean: 0,
        armN: { elbow: P(64, 70), hand: P(64, 54) },
        legN: { knee: P(76, 98), ankle: P(88, 100), foot: P(88, 108) },
        legF: { knee: P(74, 100), ankle: P(85, 102), foot: P(85, 110) }
      })
    ],
    props: function () {
      return '<rect x="46" y="98" width="26" height="5" rx="2" fill="none" stroke="' + R.prop + '" stroke-width="2.2"/>' +
        '<line x1="59" y1="103" x2="59" y2="116" stroke="' + R.prop + '" stroke-width="2.2"/>' + ground(116);
    }
  };

  PAT['lateral-raise'] = {
    equip: 'db',
    frames: [
      pose({
        hip: P(58, 76), torso: 30, lean: 0,
        armN: { elbow: P(60, 90), hand: P(61, 102) },
        armF: { elbow: P(56, 90), hand: P(55, 102) },
        legN: { knee: P(61, 95), ankle: P(62, 112), foot: P(69, 112) },
        legF: { knee: P(56, 97), ankle: P(56, 114), foot: P(63, 114) }
      }),
      pose({
        hip: P(58, 76), torso: 30, lean: 0,
        armN: { elbow: P(76, 80), hand: P(90, 78) },
        armF: { elbow: P(40, 80), hand: P(26, 78) },
        legN: { knee: P(61, 95), ankle: P(62, 112), foot: P(69, 112) },
        legF: { knee: P(56, 97), ankle: P(56, 114), foot: P(63, 114) }
      })
    ],
    props: function () { return ground(116); },
    arrowAt: 'handL'
  };

  PAT['rear-delt'] = {
    equip: 'db',
    frames: [
      pose({
        hip: P(66, 64), torso: 32, lean: 74,
        armN: { elbow: P(58, 76), hand: P(58, 88) },
        legN: { knee: P(78, 80), ankle: P(78, 100), foot: P(85, 100) },
        legF: { knee: P(75, 82), ankle: P(74, 102), foot: P(81, 102) }
      }),
      pose({
        hip: P(66, 64), torso: 32, lean: 74,
        armN: { elbow: P(48, 68), hand: P(38, 62) },
        legN: { knee: P(78, 80), ankle: P(78, 100), foot: P(85, 100) },
        legF: { knee: P(75, 82), ankle: P(74, 102), foot: P(81, 102) }
      })
    ],
    props: function () { return ground(116); }
  };

  PAT['face-pull'] = {
    equip: 'cable',
    frames: [
      pose({
        hip: P(58, 82), torso: 30, lean: 0,
        armN: { elbow: P(52, 68), hand: P(46, 60) },
        legN: { knee: P(61, 98), ankle: P(62, 114), foot: P(69, 114) },
        legF: { knee: P(56, 100), ankle: P(56, 116), foot: P(63, 116) }
      }),
      pose({
        hip: P(58, 82), torso: 30, lean: 0,
        armN: { elbow: P(68, 70), hand: P(60, 58) },
        legN: { knee: P(61, 98), ankle: P(62, 114), foot: P(69, 114) },
        legF: { knee: P(56, 100), ankle: P(56, 116), foot: P(63, 116) }
      })
    ],
    props: function () {
      return stack(100, 52, 4) + pulley(P(96, 50)) + ground(120);
    }
  };

  PAT['front-raise'] = {
    equip: 'db',
    frames: [
      pose({
        hip: P(58, 76), torso: 30, lean: 0,
        armN: { elbow: P(60, 90), hand: P(61, 102) },
        legN: { knee: P(61, 95), ankle: P(62, 112), foot: P(69, 112) },
        legF: { knee: P(56, 97), ankle: P(56, 114), foot: P(63, 114) }
      }),
      pose({
        hip: P(58, 76), torso: 30, lean: 0,
        armN: { elbow: P(72, 74), hand: P(84, 72) },
        legN: { knee: P(61, 95), ankle: P(62, 112), foot: P(69, 112) },
        legF: { knee: P(56, 97), ankle: P(56, 114), foot: P(63, 114) }
      })
    ],
    props: function () { return ground(116); }
  };

  // --- BRAZOS -------------------------------------------------------------
  PAT['curl'] = {
    equip: 'db',
    frames: [
      pose({
        hip: P(58, 76), torso: 30, lean: 0,
        armN: { elbow: P(60, 90), hand: P(62, 104) },
        legN: { knee: P(61, 95), ankle: P(62, 112), foot: P(69, 112) },
        legF: { knee: P(56, 97), ankle: P(56, 114), foot: P(63, 114) }
      }),
      pose({
        hip: P(58, 76), torso: 30, lean: 0,
        armN: { elbow: P(60, 90), hand: P(62, 78) },
        legN: { knee: P(61, 95), ankle: P(62, 112), foot: P(69, 112) },
        legF: { knee: P(56, 97), ankle: P(56, 114), foot: P(63, 114) }
      })
    ],
    props: function () { return ground(116); }
  };

  PAT['preacher-curl'] = {
    equip: 'bar',
    frames: [
      pose({
        hip: P(56, 96), torso: 30, lean: 6,
        armN: { elbow: P(58, 84), hand: P(48, 90) },
        legN: { knee: P(66, 100), ankle: P(76, 104), foot: P(76, 110) },
        legF: { knee: P(64, 102), ankle: P(73, 106), foot: P(73, 112) }
      }),
      pose({
        hip: P(56, 96), torso: 30, lean: 6,
        armN: { elbow: P(58, 84), hand: P(52, 70) },
        legN: { knee: P(66, 100), ankle: P(76, 104), foot: P(76, 110) },
        legF: { knee: P(64, 102), ankle: P(73, 106), foot: P(73, 112) }
      })
    ],
    props: function () {
      return '<path d="M40 96 L62 96 L58 86" fill="none" stroke="' + R.prop + '" stroke-width="3" stroke-linecap="round"/>' +
        ground(112);
    }
  };

  PAT['triceps-pushdown'] = {
    equip: 'cable',
    frames: [
      pose({
        hip: P(58, 80), torso: 30, lean: 4,
        armN: { elbow: P(58, 66), hand: P(50, 62) },
        legN: { knee: P(61, 96), ankle: P(62, 112), foot: P(69, 112) },
        legF: { knee: P(56, 98), ankle: P(56, 114), foot: P(63, 114) }
      }),
      pose({
        hip: P(58, 80), torso: 30, lean: 4,
        armN: { elbow: P(58, 66), hand: P(58, 84) },
        legN: { knee: P(61, 96), ankle: P(62, 112), foot: P(69, 112) },
        legF: { knee: P(56, 98), ankle: P(56, 114), foot: P(63, 114) }
      })
    ],
    props: function () {
      return '<line x1="34" y1="26" x2="34" y2="40" stroke="' + R.prop + '" stroke-width="2.4"/>' +
        pulley(P(34, 44)) + stack(100, 60, 5) + ground(120);
    },
    arrowAt: 'hand'
  };

  PAT['overhead-extension'] = {
    equip: 'db',
    frames: [
      pose({
        hip: P(58, 80), torso: 30, lean: 0,
        armN: { elbow: P(62, 60), hand: P(50, 56) },
        legN: { knee: P(61, 98), ankle: P(62, 114), foot: P(69, 114) },
        legF: { knee: P(56, 100), ankle: P(56, 116), foot: P(63, 116) }
      }),
      pose({
        hip: P(58, 80), torso: 30, lean: 0,
        armN: { elbow: P(64, 58), hand: P(66, 42) },
        legN: { knee: P(61, 98), ankle: P(62, 114), foot: P(69, 114) },
        legF: { knee: P(56, 100), ankle: P(56, 116), foot: P(63, 116) }
      })
    ],
    props: function () { return ground(120); }
  };

  PAT['skull-crusher'] = {
    equip: 'bar',
    frames: [
      pose({
        hip: P(76, 80), torso: 28, lean: 88,
        armN: { elbow: P(52, 62), hand: P(40, 66) },
        legN: { knee: P(92, 94), ankle: P(104, 106), foot: P(111, 106) },
        legF: { knee: P(90, 96), ankle: P(101, 108), foot: P(108, 108) }
      }),
      pose({
        hip: P(76, 80), torso: 28, lean: 88,
        armN: { elbow: P(52, 62), hand: P(42, 46) },
        legN: { knee: P(92, 94), ankle: P(104, 106), foot: P(111, 106) },
        legF: { knee: P(90, 96), ankle: P(101, 108), foot: P(108, 108) }
      })
    ],
    props: function () { return bench(58, 86, 40, 0) + ground(116); }
  };

  PAT['kickback'] = {
    equip: 'db',
    frames: [
      pose({
        hip: P(66, 64), torso: 32, lean: 74,
        armN: { elbow: P(60, 78), hand: P(58, 90) },
        legN: { knee: P(78, 80), ankle: P(78, 100), foot: P(85, 100) },
        legF: { knee: P(75, 82), ankle: P(74, 102), foot: P(81, 102) }
      }),
      pose({
        hip: P(66, 64), torso: 32, lean: 74,
        armN: { elbow: P(54, 68), hand: P(38, 78) },
        legN: { knee: P(78, 80), ankle: P(78, 100), foot: P(85, 100) },
        legF: { knee: P(75, 82), ankle: P(74, 102), foot: P(81, 102) }
      })
    ],
    props: function () { return ground(116); }
  };

  PAT['wrist-curl'] = {
    equip: 'bar',
    frames: [
      pose({
        hip: P(58, 96), torso: 30, lean: 8,
        armN: { elbow: P(60, 82), hand: P(66, 92) },
        legN: { knee: P(66, 100), ankle: P(78, 102), foot: P(78, 110) },
        legF: { knee: P(64, 102), ankle: P(75, 104), foot: P(75, 112) }
      }),
      pose({
        hip: P(58, 96), torso: 30, lean: 8,
        armN: { elbow: P(60, 82), hand: P(66, 88) },
        legN: { knee: P(66, 100), ankle: P(78, 102), foot: P(78, 110) },
        legF: { knee: P(64, 102), ankle: P(75, 104), foot: P(75, 112) }
      })
    ],
    props: function () {
      return '<rect x="50" y="102" width="24" height="5" rx="2" fill="none" stroke="' + R.prop + '" stroke-width="2.2"/>' +
        ground(114);
    }
  };

  PAT['farmers'] = {
    equip: 'db',
    frames: [
      pose({
        hip: P(58, 78), torso: 30, lean: 2,
        armN: { elbow: P(60, 92), hand: P(62, 106) },
        armF: { elbow: P(54, 92), hand: P(52, 106) },
        legN: { knee: P(64, 94), ankle: P(74, 104), foot: P(81, 104) },
        legF: { knee: P(54, 96), ankle: P(52, 108), foot: P(59, 108) }
      }),
      pose({
        hip: P(60, 78), torso: 30, lean: 2,
        armN: { elbow: P(62, 92), hand: P(64, 106) },
        armF: { elbow: P(56, 92), hand: P(54, 106) },
        legN: { knee: P(62, 96), ankle: P(58, 106), foot: P(65, 106) },
        legF: { knee: P(58, 94), ankle: P(68, 104), foot: P(75, 104) }
      })
    ],
    props: function () { return ground(116); },
    arrowAt: 'hip'
  };

  // --- PIERNA -------------------------------------------------------------
  PAT['squat'] = {
    equip: 'bar',
    frames: [
      pose({
        hip: P(58, 78), torso: 30, lean: 4,
        armN: { elbow: P(66, 66), hand: P(52, 52) },
        legN: { knee: P(61, 96), ankle: P(62, 112), foot: P(69, 112) },
        legF: { knee: P(56, 98), ankle: P(56, 114), foot: P(63, 114) }
      }),
      pose({
        hip: P(50, 96), torso: 30, lean: 26,
        armN: { elbow: P(62, 82), hand: P(48, 72) },
        legN: { knee: P(64, 96), ankle: P(62, 112), foot: P(69, 112) },
        legF: { knee: P(58, 98), ankle: P(56, 114), foot: P(63, 114) }
      })
    ],
    props: function () { return ground(116); },
    equipAt: 'shoulder'
  };

  PAT['leg-press'] = {
    equip: 'machine',
    frames: [
      pose({
        hip: P(54, 96), torso: 30, lean: -34,
        armN: { elbow: P(44, 88), hand: P(36, 94) },
        legN: { knee: P(72, 78), ankle: P(86, 84), foot: P(84, 74) },
        legF: { knee: P(70, 80), ankle: P(84, 86), foot: P(82, 76) }
      }),
      pose({
        hip: P(54, 96), torso: 30, lean: -34,
        armN: { elbow: P(44, 88), hand: P(36, 94) },
        legN: { knee: P(62, 88), ankle: P(92, 96), foot: P(90, 86) },
        legF: { knee: P(60, 90), ankle: P(90, 98), foot: P(88, 88) }
      })
    ],
    props: function () {
      return '<path d="M32 100 L32 72" stroke="' + R.prop + '" stroke-width="3" stroke-linecap="round"/>' +
        '<rect x="86" y="64" width="10" height="34" rx="2" fill="none" stroke="' + R.prop +
        '" stroke-width="2.4" transform="rotate(14 91 81)"/>' +
        '<rect x="40" y="98" width="26" height="5" rx="2" fill="none" stroke="' + R.prop + '" stroke-width="2.2"/>';
    }
  };

  PAT['lunge'] = {
    equip: 'db',
    frames: [
      pose({
        hip: P(58, 76), torso: 30, lean: 2,
        armN: { elbow: P(60, 90), hand: P(61, 104) },
        legN: { knee: P(62, 94), ankle: P(63, 112), foot: P(70, 112) },
        legF: { knee: P(54, 96), ankle: P(54, 114), foot: P(61, 114) }
      }),
      pose({
        hip: P(58, 88), torso: 30, lean: 6,
        armN: { elbow: P(60, 102), hand: P(61, 116) },
        legN: { knee: P(72, 98), ankle: P(76, 114), foot: P(83, 114) },
        legF: { knee: P(46, 104), ankle: P(38, 116), foot: P(45, 116) }
      })
    ],
    props: function () { return ground(118); }
  };

  PAT['leg-extension'] = {
    equip: 'machine',
    frames: [
      pose({
        hip: P(52, 90), torso: 30, lean: -6,
        armN: { elbow: P(44, 96), hand: P(38, 102) },
        legN: { knee: P(76, 94), ankle: P(84, 112), foot: P(91, 110) },
        legF: { knee: P(74, 96), ankle: P(82, 114), foot: P(89, 112) }
      }),
      pose({
        hip: P(52, 90), torso: 30, lean: -6,
        armN: { elbow: P(44, 96), hand: P(38, 102) },
        legN: { knee: P(76, 94), ankle: P(96, 90), foot: P(100, 97) },
        legF: { knee: P(74, 96), ankle: P(94, 92), foot: P(98, 99) }
      })
    ],
    props: function () {
      return '<rect x="40" y="92" width="26" height="5" rx="2" fill="none" stroke="' + R.prop + '" stroke-width="2.2"/>' +
        '<rect x="34" y="92" width="6" height="24" rx="2" fill="none" stroke="' + R.prop + '" stroke-width="2"/>';
    }
  };

  PAT['leg-curl'] = {
    equip: 'machine',
    frames: [
      pose({
        hip: P(58, 84), torso: 30, lean: 86,
        armN: { elbow: P(40, 78), hand: P(34, 84) },
        legN: { knee: P(78, 88), ankle: P(94, 88), foot: P(96, 82) },
        legF: { knee: P(76, 90), ankle: P(92, 90), foot: P(94, 84) }
      }),
      pose({
        hip: P(58, 84), torso: 30, lean: 86,
        armN: { elbow: P(40, 78), hand: P(34, 84) },
        legN: { knee: P(78, 88), ankle: P(86, 104), foot: P(92, 104) },
        legF: { knee: P(76, 90), ankle: P(84, 106), foot: P(90, 106) }
      })
    ],
    props: function () { return bench(56, 90, 40, 0) + ground(112); }
  };

  PAT['nordic'] = {
    equip: 'body',
    frames: [
      pose({
        hip: P(60, 86), torso: 28, lean: 4,
        armN: { elbow: P(56, 104), hand: P(52, 116) },
        legN: { knee: P(76, 96), ankle: P(84, 112), foot: P(84, 118) },
        legF: { knee: P(74, 98), ankle: P(82, 114), foot: P(82, 120) }
      }),
      pose({
        hip: P(60, 86), torso: 28, lean: 66,
        armN: { elbow: P(44, 96), hand: P(36, 104) },
        legN: { knee: P(76, 96), ankle: P(84, 112), foot: P(84, 118) },
        legF: { knee: P(74, 98), ankle: P(82, 114), foot: P(82, 120) }
      })
    ],
    props: function () { return ground(120); }
  };

  PAT['hip-thrust'] = {
    equip: 'bar',
    frames: [
      pose({
        hip: P(60, 100), torso: 28, lean: 50,
        armN: { elbow: P(70, 96), hand: P(74, 86) },
        legN: { knee: P(76, 88), ankle: P(80, 108), foot: P(87, 108) },
        legF: { knee: P(74, 90), ankle: P(77, 110), foot: P(84, 110) }
      }),
      pose({
        hip: P(60, 84), torso: 28, lean: 74,
        armN: { elbow: P(72, 92), hand: P(76, 82) },
        legN: { knee: P(78, 90), ankle: P(80, 108), foot: P(87, 108) },
        legF: { knee: P(76, 92), ankle: P(77, 110), foot: P(84, 110) }
      })
    ],
    props: function () { return bench(50, 94, 30, 0) + ground(116); },
    equipAt: 'hip'
  };

  PAT['glute-bridge'] = {
    equip: 'body',
    frames: [
      pose({
        hip: P(56, 106), torso: 26, lean: 78,
        armN: { elbow: P(70, 108), hand: P(82, 110) },
        legN: { knee: P(74, 92), ankle: P(78, 110), foot: P(85, 110) },
        legF: { knee: P(72, 94), ankle: P(75, 112), foot: P(82, 112) }
      }),
      pose({
        hip: P(56, 92), torso: 26, lean: 82,
        armN: { elbow: P(70, 108), hand: P(82, 110) },
        legN: { knee: P(74, 90), ankle: P(78, 110), foot: P(85, 110) },
        legF: { knee: P(72, 92), ankle: P(75, 112), foot: P(82, 112) }
      })
    ],
    props: function () { return ground(114); }
  };

  PAT['hip-abduction'] = {
    equip: 'machine',
    frames: [
      pose({
        hip: P(58, 96), torso: 30, lean: -4,
        armN: { elbow: P(48, 96), hand: P(42, 104) },
        legN: { knee: P(64, 106), ankle: P(64, 118), foot: P(71, 118) },
        legF: { knee: P(62, 108), ankle: P(62, 120), foot: P(69, 120) }
      }),
      pose({
        hip: P(58, 96), torso: 30, lean: -4,
        armN: { elbow: P(48, 96), hand: P(42, 104) },
        legN: { knee: P(80, 104), ankle: P(94, 110), foot: P(101, 110) },
        legF: { knee: P(78, 106), ankle: P(92, 112), foot: P(99, 112) }
      })
    ],
    props: function () {
      return '<rect x="44" y="98" width="24" height="5" rx="2" fill="none" stroke="' + R.prop + '" stroke-width="2.2"/>' +
        '<line x1="56" y1="103" x2="56" y2="116" stroke="' + R.prop + '" stroke-width="2.2"/>' + ground(120);
    }
  };

  PAT['calf-raise'] = {
    equip: 'machine',
    frames: [
      pose({
        hip: P(58, 72), torso: 30, lean: 0,
        armN: { elbow: P(54, 54), hand: P(60, 42) },
        legN: { knee: P(61, 92), ankle: P(62, 108), foot: P(69, 108) },
        legF: { knee: P(56, 94), ankle: P(56, 110), foot: P(63, 110) }
      }),
      pose({
        hip: P(58, 66), torso: 30, lean: 0,
        armN: { elbow: P(54, 54), hand: P(60, 42) },
        legN: { knee: P(61, 86), ankle: P(62, 100), foot: P(69, 104) },
        legF: { knee: P(56, 88), ankle: P(56, 102), foot: P(63, 106) }
      })
    ],
    props: function () { return bench(50, 36, 24, 0, true) + '<line x1="40" y1="34" x2="40" y2="118" stroke="' + R.prop + '" stroke-width="2.4"/>' + ground(118); },
    arrowAt: 'hip'
  };

  // --- CORE ---------------------------------------------------------------
  PAT['plank'] = {
    equip: 'body',
    frames: [
      pose({
        hip: P(60, 94), torso: 26, lean: 74,
        armN: { elbow: P(82, 86), hand: P(86, 100) },
        legN: { knee: P(48, 100), ankle: P(34, 108), foot: P(28, 104) },
        legF: { knee: P(50, 102), ankle: P(36, 110), foot: P(30, 106) }
      })
    ],
    props: function () { return ground(112); },
    hideArrow: true
  };

  PAT['crunch'] = {
    equip: 'body',
    frames: [
      pose({
        hip: P(56, 104), torso: 24, lean: 82,
        armN: { elbow: P(40, 98), hand: P(34, 92) },
        legN: { knee: P(74, 94), ankle: P(78, 112), foot: P(85, 112) },
        legF: { knee: P(72, 96), ankle: P(75, 114), foot: P(82, 114) }
      }),
      pose({
        hip: P(56, 104), torso: 24, lean: 56,
        armN: { elbow: P(38, 92), hand: P(30, 88) },
        legN: { knee: P(74, 94), ankle: P(78, 112), foot: P(85, 112) },
        legF: { knee: P(72, 96), ankle: P(75, 114), foot: P(82, 114) }
      })
    ],
    props: function () { return ground(116); }
  };

  PAT['leg-raise'] = {
    equip: 'body',
    frames: [
      pose({
        hip: P(58, 88), torso: 28, lean: 2,
        armN: { elbow: P(52, 70), hand: P(46, 44) },
        legN: { knee: P(60, 104), ankle: P(62, 118), foot: P(69, 118) },
        legF: { knee: P(56, 106), ankle: P(57, 120), foot: P(64, 120) }
      }),
      pose({
        hip: P(58, 88), torso: 28, lean: 2,
        armN: { elbow: P(52, 70), hand: P(46, 44) },
        legN: { knee: P(76, 82), ankle: P(92, 78), foot: P(97, 84) },
        legF: { knee: P(74, 84), ankle: P(90, 80), foot: P(95, 86) }
      })
    ],
    props: function () {
      return '<line x1="36" y1="42" x2="76" y2="42" stroke="' + R.prop + '" stroke-width="4" stroke-linecap="round"/>' +
        '<line x1="40" y1="42" x2="40" y2="28" stroke="' + R.prop + '" stroke-width="2.4"/>';
    }
  };

  PAT['russian-twist'] = {
    equip: 'db',
    frames: [
      pose({
        hip: P(54, 106), torso: 26, lean: -40,
        armN: { elbow: P(62, 98), hand: P(70, 94) },
        legN: { knee: P(68, 96), ankle: P(82, 108), foot: P(82, 114) },
        legF: { knee: P(66, 98), ankle: P(79, 110), foot: P(79, 116) }
      }),
      pose({
        hip: P(54, 106), torso: 26, lean: -46,
        armN: { elbow: P(56, 96), hand: P(46, 100) },
        legN: { knee: P(68, 96), ankle: P(82, 108), foot: P(82, 114) },
        legF: { knee: P(66, 98), ankle: P(79, 110), foot: P(79, 116) }
      })
    ],
    props: function () { return ground(118); }
  };

  PAT['pallof'] = {
    equip: 'cable',
    frames: [
      pose({
        hip: P(58, 82), torso: 30, lean: 0,
        armN: { elbow: P(60, 74), hand: P(70, 72) },
        armF: { elbow: P(56, 74), hand: P(64, 70) },
        legN: { knee: P(61, 98), ankle: P(62, 114), foot: P(69, 114) },
        legF: { knee: P(56, 100), ankle: P(56, 116), foot: P(63, 116) }
      })
    ],
    props: function () {
      return stack(98, 50, 4) + pulley(P(94, 48)) + ground(120);
    },
    hideArrow: true
  };

  PAT['wheel'] = {
    equip: 'body',
    frames: [
      pose({
        hip: P(52, 96), torso: 26, lean: 40,
        armN: { elbow: P(62, 100), hand: P(72, 108) },
        legN: { knee: P(40, 100), ankle: P(30, 110), foot: P(24, 106) },
        legF: { knee: P(42, 102), ankle: P(32, 112), foot: P(26, 108) }
      }),
      pose({
        hip: P(56, 88), torso: 26, lean: 72,
        armN: { elbow: P(76, 94), hand: P(94, 104) },
        legN: { knee: P(44, 94), ankle: P(32, 106), foot: P(26, 102) },
        legF: { knee: P(46, 96), ankle: P(34, 108), foot: P(28, 104) }
      })
    ],
    props: function () { return ground(110); }
  };

  // --- OTROS --------------------------------------------------------------
  PAT['swing'] = {
    equip: 'kb',
    frames: [
      pose({
        hip: P(58, 82), torso: 30, lean: 24,
        armN: { elbow: P(64, 96), hand: P(68, 108) },
        legN: { knee: P(64, 98), ankle: P(66, 114), foot: P(73, 114) },
        legF: { knee: P(60, 100), ankle: P(60, 116), foot: P(67, 116) }
      }),
      pose({
        hip: P(58, 82), torso: 30, lean: 2,
        armN: { elbow: P(74, 74), hand: P(78, 58) },
        legN: { knee: P(64, 98), ankle: P(66, 114), foot: P(73, 114) },
        legF: { knee: P(60, 100), ankle: P(60, 116), foot: P(67, 116) }
      })
    ],
    props: function () { return ground(118); }
  };

  PAT['good-morning'] = {
    equip: 'bar',
    frames: [
      pose({
        hip: P(58, 76), torso: 30, lean: 4,
        armN: { elbow: P(64, 64), hand: P(52, 52) },
        legN: { knee: P(61, 94), ankle: P(62, 112), foot: P(69, 112) },
        legF: { knee: P(56, 96), ankle: P(56, 114), foot: P(63, 114) }
      }),
      pose({
        hip: P(64, 76), torso: 30, lean: 62,
        armN: { elbow: P(66, 62), hand: P(54, 56) },
        legN: { knee: P(64, 94), ankle: P(64, 112), foot: P(71, 112) },
        legF: { knee: P(59, 96), ankle: P(58, 114), foot: P(65, 114) }
      })
    ],
    props: function () { return ground(116); },
    equipAt: 'shoulder'
  };

  // =======================================================================
  //  RENDER
  // =======================================================================
  function equipSVG(pat, frameIdx, p, ghost) {
    var eq = pat.equip;
    if (!eq || eq === 'body' || eq === 'machine') return '';
    var at = pat.equipAt || 'hand';
    var pts = [];
    if (at === 'hand') {
      pts.push(handPoint(p, true));
      if (p.armF) pts.push(handPoint(p, false));
    } else if (at === 'shoulder') {
      pts.push(P(p.shoulder.x, p.shoulder.y - 2));
    } else if (at === 'hip') {
      pts.push(P(p.hip.x, p.hip.y - 4));
    }
    var c = pts[0];
    var color = R.accent;
    var out = '';
    if (eq === 'bar') out += barbell(c, color);
    if (eq === 'db') {
      // una mancuerna por mano cuando el ejercicio es bilateral con las dos manos
      pts.forEach(function (pt) { out += dumbbell(pt, 90, color); });
    }
    if (eq === 'kb') out += kettlebell(c, color);
    if (eq === 'cable') {
      var anchor = pat.cableFrom || P(96, 50);
      out += cable(anchor, c, color);
    }
    if (eq === 'band') out += band(c, color);
    return out;
  }

  // Equipo estático que depende del patrón (máquinas/poleas)
  function staticEquip(pat) {
    if (pat.equip === 'cable' && pat._cableStatic) return pat._cableStatic;
    return '';
  }

  function render(id, opts) {
    opts = opts || {};
    var pat = PAT[id];
    if (!pat) pat = PAT['squat'];
    var frames = pat.frames;
    var a = frames[0], b = frames[frames.length - 1];
    var s = '<svg viewBox="0 0 120 120" class="fig" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">';
    s += pat.props ? pat.props() : '';
    // fantasma (inicio)
    s += '<g opacity=".38">' + drawPose(a, {}) + equipSVG(pat, 0, a, true) + '</g>';
    // pose final
    s += '<g>' + drawPose(b, {}) + equipSVG(pat, 1, b, false) + '</g>';
    // flecha de movimiento
    if (!pat.hideArrow && frames.length > 1) {
      var pa = pat.arrowAt === 'hip' ? a.hip : pat.arrowAt === 'shoulder' ? a.shoulder : handPoint(a, true);
      var pb = pat.arrowAt === 'hip' ? b.hip : pat.arrowAt === 'shoulder' ? b.shoulder : handPoint(b, true);
      if (dist(pa, pb) > 6) s += arrow(pa, pb, R.accent, 9);
    }
    s += '</svg>';
    return s;
  }

  global.FIG = {
    ids: Object.keys(PAT),
    render: render,
    has: function (id) { return !!PAT[id]; },
    pose: pose,
    P: P,
    from: from
  };
})(window);
