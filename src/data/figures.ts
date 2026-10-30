// @ts-nocheck
/* ==========================================================================
   FIGURES — ilustraciones vectoriales de ejecución (2 fotogramas + flecha)
   Estilo: pictograma de línea, vista lateral/frontal, equipo simplificado.
   Todas las poses se definen en un lienzo de 120 x 120.
   ========================================================================== */

  'use strict';

  var R = {
    torso: '#f4f8fd',
    limb: '#ffffff',
    far: '#62758c',
    accent: 'var(--accent, #c6f24e)',
    prop: '#36495d',
    propSoft: '#1e2936',
    joint: '#4ec8ff'
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

  function shadow(x, y, w) {
    return '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + (w || 16).toFixed(1) + '" ry="2.8" fill="#000000" opacity=".35"/>';
  }

  // --- construcción de poses ----------------------------------------------
  function pose(o) {
    o = o || {};
    var hip = o.hip || P(58, 74);
    var lean = o.lean === undefined ? 0 : o.lean;
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

  function shift(pt, dx, dy) { return pt ? P(pt.x + (dx || -2.5), pt.y + (dy || 0)) : null; }

  function limbPath(root, joint, end, color, w) {
    if (!joint || !end) return '';
    return line(root, joint, w || 5.2, color) + line(joint, end, (w || 5.2) - 0.6, color);
  }

  // --- equipo --------------------------------------------------------------
  function dumbbell(c, ang, color) {
    var r = (ang || 90) * Math.PI / 180;
    var ux = Math.sin(r), uy = Math.cos(r);
    var half = 5.5;
    var a = P(c.x - ux * half, c.y - uy * half);
    var b = P(c.x + ux * half, c.y + uy * half);
    return '<g>' +
      line(a, b, 2.6, '#e2edfa') +
      '<rect x="' + (a.x - 3).toFixed(1) + '" y="' + (a.y - 3.8).toFixed(1) + '" width="6" height="7.6" rx="1.8" fill="' + (color || R.accent) + '" stroke="#141c26" stroke-width="1"/>' +
      '<rect x="' + (b.x - 3).toFixed(1) + '" y="' + (b.y - 3.8).toFixed(1) + '" width="6" height="7.6" rx="1.8" fill="' + (color || R.accent) + '" stroke="#141c26" stroke-width="1"/>' +
    '</g>';
  }

  function barbell(c, color) {
    var col = color || R.accent;
    return '<g>' +
      '<circle cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) + '" r="8.8" fill="#141c26" stroke="' + col + '" stroke-width="2.6"/>' +
      '<circle cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) + '" r="5.2" fill="none" stroke="' + col + '" stroke-width="1.2" stroke-dasharray="2.5 2" opacity=".75"/>' +
      '<circle cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) + '" r="2.6" fill="' + col + '"/>' +
    '</g>';
  }

  function kettlebell(c, color) {
    var col = color || R.accent;
    return '<path d="M' + (c.x - 4).toFixed(1) + ' ' + (c.y - 4).toFixed(1) +
      ' q4 -6 8 0" fill="none" stroke="' + col + '" stroke-width="2.6" stroke-linecap="round"/>' +
      circle(P(c.x, c.y + 2), 6.2, '#141c26', col, 2.6);
  }

  function band(c, color) {
    return '<path d="M' + (c.x - 14).toFixed(1) + ' ' + (c.y + 2).toFixed(1) +
      ' q7 -5 14 0 q7 5 14 0" fill="none" stroke="' + (color || R.accent) + '" stroke-width="2.6" stroke-linecap="round"/>';
  }

  function bench(x, y, w, ang, soft) {
    var a = (ang || 0) * Math.PI / 180;
    var hx = Math.cos(a) * w / 2, hy = Math.sin(a) * w / 2;
    var x1 = x - hx, y1 = y - hy, x2 = x + hx, y2 = y + hy;
    return '<g>' +
      shadow((x1 + x2) / 2, Math.max(y1, y2) + 24, w / 2 + 6) +
      '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#2f3e50" stroke-width="6.8" stroke-linecap="round"/>' +
      '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#5cc8ff" stroke-width="1.8" stroke-linecap="round" opacity=".4"/>' +
      (soft ? '' : '<line x1="' + (x1 + 4).toFixed(1) + '" y1="' + (y1 + 5).toFixed(1) + '" x2="' + (x1 + 4).toFixed(1) + '" y2="' + (y1 + 24).toFixed(1) + '" stroke="#24303f" stroke-width="2.8"/>' +
        '<line x1="' + (x2 - 4).toFixed(1) + '" y1="' + (y2 + 5).toFixed(1) + '" x2="' + (x2 - 4).toFixed(1) + '" y2="' + (y2 + 24).toFixed(1) + '" stroke="#24303f" stroke-width="2.8"/>' +
        '<line x1="' + (x1 - 3).toFixed(1) + '" y1="' + (y1 + 24).toFixed(1) + '" x2="' + (x1 + 11).toFixed(1) + '" y2="' + (y1 + 24).toFixed(1) + '" stroke="#24303f" stroke-width="3.2" stroke-linecap="round"/>' +
        '<line x1="' + (x2 - 11).toFixed(1) + '" y1="' + (y2 + 24).toFixed(1) + '" x2="' + (x2 + 3).toFixed(1) + '" y2="' + (y2 + 24).toFixed(1) + '" stroke="#24303f" stroke-width="3.2" stroke-linecap="round"/>') +
    '</g>';
  }

  function frame(x, y, w, h) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" fill="none" stroke="' +
      R.prop + '" stroke-width="2.4"/>';
  }

  function stack(x, y, plates) {
    var s = '<rect x="' + x + '" y="' + y + '" width="14" height="' + (plates * 3.4 + 6) +
      '" rx="2" fill="#141c26" stroke="' + R.prop + '" stroke-width="2" opacity=".9"/>';
    for (var i = 0; i < plates; i++) {
      s += '<line x1="' + (x + 3) + '" y1="' + (y + 5 + i * 3.4) + '" x2="' + (x + 11) + '" y2="' +
        (y + 5 + i * 3.4) + '" stroke="' + R.prop + '" stroke-width="1.6" opacity=".55"/>';
    }
    return s;
  }

  function pulley(c, color) {
    return circle(c, 4.6, '#0f1620', color || R.accent, 2.2) + circle(c, 1.4, color || R.accent);
  }

  function cable(fromPt, toPt, color, op) {
    var mx = fromPt.x + 6;
    return '<path d="M' + fromPt.x.toFixed(1) + ' ' + fromPt.y.toFixed(1) + ' Q' + mx.toFixed(1) + ' ' +
      ((fromPt.y + toPt.y) / 2).toFixed(1) + ' ' + toPt.x.toFixed(1) + ' ' + toPt.y.toFixed(1) +
      '" fill="none" stroke="' + (color || R.accent) + '" stroke-width="2" opacity="' + (op || .9) + '"/>';
  }

  function ground(y) {
    return '<g>' +
      shadow(60, y, 48) +
      '<line x1="8" y1="' + y + '" x2="112" y2="' + y + '" stroke="' + R.prop +
      '" stroke-width="2.4" stroke-linecap="round" opacity=".65"/>' +
    '</g>';
  }

  // --- dibujo de una pose --------------------------------------------------
  function drawPose(p, opts) {
    opts = opts || {};
    var far = opts.far !== false;
    var pColor = opts.color || R.torso;
    var limbColor = opts.color || R.limb;
    var farColor = opts.ghost ? '#435368' : R.far;
    var s = '';

    // Piernas lejanas
    if (far && p.legF) {
      s += limbPath(p.hip, p.legF.knee, p.legF.ankle, farColor, 4.6) +
        (p.legF.foot ? line(p.legF.ankle, p.legF.foot, 4.2, farColor) : '');
      if (p.legF.knee) s += circle(p.legF.knee, 2, '#0f1620', farColor, 1);
    }

    // Brazo lejano
    if (far && p.armF) {
      s += limbPath(p.shoulder, p.armF.elbow, p.armF.hand, farColor, 4.6);
      if (p.armF.elbow) s += circle(p.armF.elbow, 2, '#0f1620', farColor, 1);
    }

    // Torso con grosor atlético
    s += line(p.hip, p.shoulder, 6.6, pColor);
    // Cuello
    s += line(p.shoulder, P(p.head.x, p.head.y), 4.4, pColor);

    // Cabeza con dirección de mirada para postura de columna cervical
    s += circle(p.head, p.headR || 7, pColor, 'none');
    var gazeDx = p.lean > 45 ? 2.8 : (p.lean < -20 ? -2.8 : 2.4);
    var gazeDy = p.lean > 70 ? 2 : -0.6;
    s += circle(P(p.head.x + gazeDx, p.head.y + gazeDy), 1.6, '#0a0e13');

    // Articulaciones axiales (cadera y hombro)
    s += circle(p.hip, 2.5, '#0a0e13', pColor, 1.4);
    s += circle(p.shoulder, 2.5, '#0a0e13', pColor, 1.4);

    // Pierna cercana
    if (p.legN) {
      s += limbPath(p.hip, p.legN.knee, p.legN.ankle, limbColor, 5.6) +
        (p.legN.foot ? line(p.legN.ankle, p.legN.foot, 5, limbColor) : '');
      if (p.legN.knee) s += circle(p.legN.knee, 2.6, '#0a0e13', R.accent, 1.4);
      if (p.legN.ankle) s += circle(p.legN.ankle, 2, '#0a0e13', limbColor, 1.2);
    }

    // Brazo cercano
    if (p.armN) {
      s += limbPath(p.shoulder, p.armN.elbow, p.armN.hand, limbColor, 5.4);
      if (p.armN.elbow) s += circle(p.armN.elbow, 2.6, '#0a0e13', R.accent, 1.4);
      if (p.armN.hand) s += circle(p.armN.hand, 2.2, R.accent);
    }

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
    var hx1 = b.x - 6 * Math.cos((ang - 24) * Math.PI / 180);
    var hy1 = b.y - 6 * Math.sin((ang - 24) * Math.PI / 180);
    var hx2 = b.x - 6 * Math.cos((ang + 24) * Math.PI / 180);
    var hy2 = b.y - 6 * Math.sin((ang + 24) * Math.PI / 180);
    var c = color || R.accent;
    return '<g class="fig-arrow-group">' +
      '<path d="M' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) + ' Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) +
      ' ' + b.x.toFixed(1) + ' ' + b.y.toFixed(1) + '" fill="none" stroke="' + c +
      '" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="3.5 2.5" opacity=".95"/>' +
      '<path d="M' + hx1.toFixed(1) + ' ' + hy1.toFixed(1) + ' L' + b.x.toFixed(1) + ' ' + b.y.toFixed(1) +
      ' L' + hx2.toFixed(1) + ' ' + hy2.toFixed(1) + '" fill="' + c + '" stroke="' + c +
      '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</g>';
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
    var accentCol = opts.accentColor || R.accent;

    // Fase 1 únicamente (Posición Inicial / Postura)
    if (opts.frame === 0) {
      var s0 = '<svg viewBox="0 0 120 120" class="fig" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">';
      s0 += pat.props ? pat.props() : '';
      s0 += '<g>' + drawPose(a, { color: '#ffffff' }) + equipSVG(pat, 0, a, false) + '</g>';
      s0 += '</svg>';
      return s0;
    }

    // Fase 2 únicamente (Punto de Contracción)
    if (opts.frame === 1) {
      var s1 = '<svg viewBox="0 0 120 120" class="fig" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">';
      s1 += pat.props ? pat.props() : '';
      s1 += '<g>' + drawPose(b, { color: '#ffffff' }) + equipSVG(pat, 1, b, false) + '</g>';
      s1 += '</svg>';
      return s1;
    }

    // Modo Comparativo lado a lado
    if (opts.mode === 'sideBySide') {
      var sSide = '<svg viewBox="0 0 240 120" class="fig fig-side" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">';
      sSide += '<line x1="120" y1="14" x2="120" y2="106" stroke="#24303f" stroke-width="1.2" stroke-dasharray="3 3"/>';
      // Lado 1 (Inicio)
      sSide += '<g transform="translate(0, 0)">';
      sSide += pat.props ? pat.props() : '';
      sSide += drawPose(a, { color: '#ffffff' }) + equipSVG(pat, 0, a, false);
      sSide += '<rect x="8" y="8" width="56" height="18" rx="6" fill="#141c26" stroke="#2a3848" stroke-width="1"/>';
      sSide += '<text x="36" y="20.5" fill="#8b9ab0" font-size="8.5" font-weight="700" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif">1. INICIO</text>';
      sSide += '</g>';
      // Lado 2 (Contracción)
      sSide += '<g transform="translate(120, 0)">';
      sSide += pat.props ? pat.props() : '';
      sSide += drawPose(b, { color: '#ffffff' }) + equipSVG(pat, 1, b, false);
      sSide += '<rect x="8" y="8" width="86" height="18" rx="6" fill="rgba(198,242,78,0.14)" stroke="' + accentCol + '" stroke-width="1"/>';
      sSide += '<text x="51" y="20.5" fill="' + accentCol + '" font-size="8.5" font-weight="700" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif">2. CONTRACCIÓN</text>';
      sSide += '</g>';
      sSide += '</svg>';
      return sSide;
    }

    // Modo estático clásico si se desactiva la animación
    if (opts.animated === false) {
      var sStat = '<svg viewBox="0 0 120 120" class="fig" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">';
      sStat += pat.props ? pat.props() : '';
      sStat += '<g opacity=".35">' + drawPose(a, { ghost: true }) + equipSVG(pat, 0, a, true) + '</g>';
      sStat += '<g>' + drawPose(b, { color: '#ffffff' }) + equipSVG(pat, 1, b, false) + '</g>';
      if (!pat.hideArrow && frames.length > 1) {
        var paStat = pat.arrowAt === 'hip' ? a.hip : pat.arrowAt === 'shoulder' ? a.shoulder : handPoint(a, true);
        var pbStat = pat.arrowAt === 'hip' ? b.hip : pat.arrowAt === 'shoulder' ? b.shoulder : handPoint(b, true);
        if (dist(paStat, pbStat) > 6) sStat += arrow(paStat, pbStat, accentCol, 9);
      }
      sStat += '</svg>';
      return sStat;
    }

    // Modo Animado en bucle continuo de repetición (comprensión instantánea de postura y movimiento)
    var animUid = 'anim_' + id.replace(/[^a-z0-9]/gi, '_');
    var s = '<svg viewBox="0 0 120 120" class="fig fig-animated" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">';
    s += '<style>' +
      '@keyframes fA_' + animUid + ' { 0%, 36% { opacity: 1; } 48%, 86% { opacity: 0; } 96%, 100% { opacity: 1; } } ' +
      '@keyframes fB_' + animUid + ' { 0%, 36% { opacity: 0; } 48%, 86% { opacity: 1; } 96%, 100% { opacity: 0; } } ' +
      '@keyframes fArr_' + animUid + ' { 0%, 36% { opacity: 0.2; stroke-dashoffset: 14; } 48%, 82% { opacity: 1; stroke-dashoffset: 0; } 94%, 100% { opacity: 0.2; stroke-dashoffset: -14; } } ' +
      '.f-frameA-' + animUid + ' { animation: fA_' + animUid + ' 2.6s ease-in-out infinite; } ' +
      '.f-frameB-' + animUid + ' { animation: fB_' + animUid + ' 2.6s ease-in-out infinite; } ' +
      '.f-arrow-' + animUid + ' { animation: fArr_' + animUid + ' 2.6s ease-in-out infinite; } ' +
      '</style>';

    s += pat.props ? pat.props() : '';

    // Pose A (Fase 1: Preparación/Inicio)
    s += '<g class="f-frameA-' + animUid + '">' + drawPose(a, { color: '#ffffff' }) + equipSVG(pat, 0, a, false) + '</g>';

    // Pose B (Fase 2: Contracción)
    s += '<g class="f-frameB-' + animUid + '">' + drawPose(b, { color: '#ffffff' }) + equipSVG(pat, 1, b, false) + '</g>';

    // Flecha de trayectoria animada
    if (!pat.hideArrow && frames.length > 1) {
      var pa = pat.arrowAt === 'hip' ? a.hip : pat.arrowAt === 'shoulder' ? a.shoulder : handPoint(a, true);
      var pb = pat.arrowAt === 'hip' ? b.hip : pat.arrowAt === 'shoulder' ? b.shoulder : handPoint(b, true);
      if (dist(pa, pb) > 6) {
        s += '<g class="f-arrow-' + animUid + '">' + arrow(pa, pb, accentCol, 9) + '</g>';
      }
    }

    s += '</svg>';
    return s;
  }

  export const FIG: any = {
    ids: Object.keys(PAT),
    render: render,
    has: function (id) { return !!PAT[id]; },
    getPattern: function (id) { return PAT[id] || PAT['squat']; },
    pose: pose,
    P: P,
    from: from
  };
