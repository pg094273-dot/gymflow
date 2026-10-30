export interface PostureGuide {
  postureInitial: string[];
  movementPhase: string[];
  breathing: {
    inhale: string;
    exhale: string;
  };
  tempo: string;
  proTip: string;
}

export const PATTERN_POSTURE_GUIDES: Record<string, PostureGuide> = {
  'bench-press': {
    postureInitial: [
      'Pies firmemente plantados en el suelo para generar impulso desde las piernas (leg drive).',
      'Escápulas completamente retraídas y deprimidas contra el banco (creando base sólida).',
      'Arco lumbar natural (nunca exagerado ni despegando los glúteos del banco).',
      'Agarre seguro con muñecas neutras (la barra apoyada sobre el talón de la mano).'
    ],
    movementPhase: [
      'Baja la barra de forma controlada (2-3 s) hasta rozar la parte media-baja del esternón.',
      'Codos a unos 45-60° respecto al torso (evita abrirlos en cruz a 90° para proteger el hombro).',
      'Empuja verticalmente hasta extender los brazos sin desclavar las escápulas del banco.'
    ],
    breathing: {
      inhale: 'Inhala hondo y bloquea el abdomen (maniobra de Valsalva) antes de bajar.',
      exhale: 'Exhala con fuerza al superar el punto más difícil de la subida.'
    },
    tempo: '3-0-1-0 (3s bajada · 0s pausa · 1s empuje)',
    proTip: 'Imagina que doblas la barra en forma de "U" con las manos para activar el dorsal y fijar el hombro.'
  },
  'incline-press': {
    postureInitial: [
      'Banco inclinado a 30° o máximo 45° (mayor inclinación desvía la carga al deltoides anterior).',
      'Espalda alta bien clavada en el respaldo y pies anclados al suelo.',
      'Muñecas alineadas verticalmente sobre los codos.'
    ],
    movementPhase: [
      'Desciende el peso hacia la parte alta del pecho (clavículas) con codos orientados hacia dentro.',
      'Empuja en una trayectoria ligeramente curvada hacia arriba sobre la línea visual.'
    ],
    breathing: {
      inhale: 'Inhala en la bajada ensanchando la caja torácica.',
      exhale: 'Exhala al empujar hacia la extensión.'
    },
    tempo: '2-1-1-0 (2s descenso · 1s pausa · 1s subida)',
    proTip: 'Mantén la mirada arriba y el esternón elevado para maximizar el reclutamiento del haz clavicular.'
  },
  'fly': {
    postureInitial: [
      'Codos semiflexionados con ángulo fijo (unos 15-20°); mantén ese ángulo congelado todo el set.',
      'Hombros deprimidos y espalda con ligero arco fisiológico.'
    ],
    movementPhase: [
      'Abre los brazos en un arco amplio lateral hasta sentir un estiramiento profundo pero cómodo en el pectoral.',
      'Cierra los brazos imaginando que rodeas un tronco grueso, apretando el pecho al encontrarse arriba.'
    ],
    breathing: {
      inhale: 'Inhala durante la apertura para expandir el pecho.',
      exhale: 'Exhala al juntar las mancuernas arriba.'
    },
    tempo: '3-1-1-1 (3s apertura · 1s estiramiento · 1s cierre · 1s contracción pico)',
    proTip: 'Concéntrate en acercar los bíceps entre sí, no solo en chocar las mancuernas.'
  },
  'pushup': {
    postureInitial: [
      'Manos ligeramente más anchas que los hombros, dedos extendidos para repartir el peso.',
      'Cuerpo en plancha rígida perfecta desde la coronilla hasta los talones.',
      'Glúteos y core activados para evitar que la pelvis caiga hacia el suelo.'
    ],
    movementPhase: [
      'Baja flexionando los codos hacia atrás en flecha (45°), no hacia los lados.',
      'Lleva el pecho a 2 cm del suelo manteniendo el cuello neutro alineado con la columna.',
      'Empuja el suelo con fuerza hasta volver a la posición inicial sin encorvar la espalda alta.'
    ],
    breathing: {
      inhale: 'Inhala al descender manteniendo el core firme.',
      exhale: 'Exhala al empujar alejándote del suelo.'
    },
    tempo: '2-0-1-0 (2s descenso controlado · 1s subida)',
    proTip: 'Empuja el suelo "hacia fuera" con las palmas para generar rotación externa en el hombro.'
  },
  'squat': {
    postureInitial: [
      'Pies a la anchura de los hombros o ligeramente más, con las puntas giradas hacia fuera unos 15-30°.',
      'Columna completamente neutra: pecho erguido, mirada al frente-abajo (2 metros adelante).',
      'Barra apoyada sólidamente sobre los trapecios (barra alta) o deltoides posterior (barra baja).'
    ],
    movementPhase: [
      'Inicia el movimiento flexionando caderas y rodillas simultáneamente como si te sentaras.',
      'Las rodillas deben seguir exactamente la línea trazada por las puntas de los pies.',
      'Desciende hasta que el pliegue de la cadera quede al menos paralelo a la parte superior de las rodillas.',
      'Sube empujando el suelo con el mediopié, manteniendo el torso estable.'
    ],
    breathing: {
      inhale: 'Inhala hondo inflando el vientre en 360° antes de bajar; mantén la presión intraabdominal.',
      exhale: 'Exhala tras pasar la mitad del ascenso.'
    },
    tempo: '3-1-1-0 (3s bajada controlada · 1s profundidad · 1s subida explosiva)',
    proTip: 'Imagina "abrir el suelo con los pies" para activar los glúteos y evitar que las rodillas colapsen hacia dentro.'
  },
  'leg-press': {
    postureInitial: [
      'Glúteos y espalda baja completamente pegados al asiento; jamás despegues la lumbar.',
      'Pies en el centro de la plataforma a la anchura de los hombros.',
      'Agarra firmemente las asas laterales de la máquina.'
    ],
    movementPhase: [
      'Desciende la plataforma de forma lenta y controlada hasta unos 90° en las rodillas.',
      'Empuja a través de los talones y mediopié hasta extender casi por completo (nunca bloquees las rodillas).'
    ],
    breathing: {
      inhale: 'Inhala durante la flexión mientras la plataforma baja.',
      exhale: 'Exhala al extender las piernas empujando la carga.'
    },
    tempo: '3-0-1-0 (3s bajada · 1s empuje)',
    proTip: 'No bloquees bruscamente las rodillas arriba para evitar transferir toda la tensión articular a los meniscos.'
  },
  'lunge': {
    postureInitial: [
      'Torso vertical con una ligerísima inclinación hacia delante para focalizar el glúteo.',
      'Paso largo: la distancia debe permitir que ambas rodillas formen un ángulo de 90° abajo.',
      'Core apretado para mantener el equilibrio pélvico.'
    ],
    movementPhase: [
      'Desciende verticalmente bajando la rodilla trasera hacia el suelo (a 2 cm de tocar).',
      'La rodilla delantera no debe sobrepasar excesivamente la punta del pie ni colapsar hacia el interior.',
      'Empuja con el talón de la pierna delantera para regresar arriba.'
    ],
    breathing: {
      inhale: 'Inhala en el descenso.',
      exhale: 'Exhala al incorporarte.'
    },
    tempo: '2-0-1-0',
    proTip: 'Piensa en bajar en vertical como un ascensor, no en desplazarte hacia delante como un tobogán.'
  },
  'deadlift': {
    postureInitial: [
      'Barra pegada a las espinillas (sobre el mediopié, a unos 2 cm de las tibias).',
      'Pies a la anchura de las caderas, puntas ligeramente abiertas.',
      'Agarre firme justo por fuera de las rodillas.',
      'Hombros ligeramente por delante de la barra, cadera entre las rodillas y los hombros, espalda neutra.'
    ],
    movementPhase: [
      'Tira de la holgura de la barra ("slack") y crea tensión antes de despegar el peso.',
      'Empuja el suelo con las piernas manteniendo el ángulo del torso hasta que la barra pase las rodillas.',
      'Extiende la cadera hacia delante para bloquear verticalmente apretando los glúteos (sin hiperextender la espalda).'
    ],
    breathing: {
      inhale: 'Inhala con diafragma en el suelo y bloquea el abdomen con fuerza.',
      exhale: 'Exhala en el bloqueo o al volver a apoyar la barra en el suelo.'
    },
    tempo: '1-0-2-0 (1s despegue · 0s pausa arriba · 2s bajada por las piernas)',
    proTip: 'No pienses en tirar con los brazos ni la espalda: piensa en empujar la tierra lejos de ti con los pies.'
  },
  'rdl': {
    postureInitial: [
      'De pie con la barra pegada a los muslos, rodillas con ligera flexión fija (15°).',
      'Escápulas retraídas y mirada neutral hacia el suelo (no mires al espejo hacia arriba).'
    ],
    movementPhase: [
      'Inicia empujando las caderas hacia atrás como si quisieras tocar una pared detrás de ti.',
      'La barra desciende rozando muslos y espinillas; las rodillas no se doblan más.',
      'Desciende solo hasta donde la flexibilidad de tus isquios permita sin redondear la zona lumbar.',
      'Contrae isquiotibiales y glúteos para empujar la pelvis de vuelta al frente.'
    ],
    breathing: {
      inhale: 'Inhala al echar la cadera hacia atrás.',
      exhale: 'Exhala al adelantar la cadera y bloquear los glúteos.'
    },
    tempo: '3-1-1-0',
    proTip: 'El movimiento es una bisagra de cadera hacia atrás (horizontal), no una bajada hacia el suelo (vertical).'
  },
  'pulldown': {
    postureInitial: [
      'Muslos fijados firmemente bajo los rodillos para evitar que el peso te levante.',
      'Agarre algo más ancho que los hombros; pecho elevado apuntando al techo.',
      'Ligera inclinación del torso hacia atrás (10-15°), columna neutra.'
    ],
    movementPhase: [
      'Inicia el movimiento bajando los omóplatos (depresión escapular) antes de doblar los codos.',
      'Tracciona llevando los codos hacia abajo y hacia las costillas hasta que la barra toque la parte alta del pecho.',
      'Extiende los brazos controlando el peso hasta notar un estiramiento completo en los dorsales.'
    ],
    breathing: {
      inhale: 'Inhala mientras los brazos suben y los dorsales se estiran.',
      exhale: 'Exhala mientras tiras de la barra hacia el pecho.'
    },
    tempo: '2-1-2-0 (2s bajada · 1s contracción · 2s subida)',
    proTip: 'Imagina que tienes ganchos en los codos y que tiras desde ellos, no con los dedos ni con los bíceps.'
  },
  'pullup': {
    postureInitial: [
      'Agarre prono (palmas al frente) algo más ancho que los hombros.',
      'Inicio desde "dead hang" activo: hombros deprimidos, core activo y piernas ligeramente juntas.'
    ],
    movementPhase: [
      'Conduce los codos hacia abajo y hacia las costillas llevando el esternón hacia la barra.',
      'Pasa la barbilla por encima de la barra sin estirar el cuello hacia delante.',
      'Desciende de forma controlada hasta la extensión casi completa.'
    ],
    breathing: {
      inhale: 'Inhala en la posición baja.',
      exhale: 'Exhala con potencia durante la subida.'
    },
    tempo: '2-0-1-1',
    proTip: 'No balancees las piernas ni hagas "kipping"; mantén el cuerpo como un bloque sólido de acero.'
  },
  'row-bent': {
    postureInitial: [
      'Torso inclinado a unos 45° con la cadera atrás y las rodillas semiflexionadas.',
      'Espalda recta y paralela o semi-paralela al suelo; cuello alineado con la columna.',
      'Barra colgada con brazos extendidos frente a las espinillas.'
    ],
    movementPhase: [
      'Tira de la barra hacia el abdomen bajo (ombligo), dirigiendo los codos hacia el techo y atrás.',
      'Junta los omóplatos en el punto más alto durante 1 segundo.',
      'Baja la barra de forma controlada sin perder la postura del torso.'
    ],
    breathing: {
      inhale: 'Inhala antes de iniciar o al bajar.',
      exhale: 'Exhala al traccionar hacia el ombligo.'
    },
    tempo: '2-1-1-0',
    proTip: 'Mantén el ángulo del torso inalterado durante todo el set; si te incorporas al subir, llevas demasiado peso.'
  },
  'ohp': {
    postureInitial: [
      'De pie con los pies a la anchura de las caderas, glúteos y abdomen apretados para crear un pilar sólido.',
      'Barra apoyada sobre las clavículas/deltoides anterior con codos ligeramente adelantados a la barra.',
      'Muñecas rectas sobre los antebrazos.'
    ],
    movementPhase: [
      'Retrae la barbilla para que la barra pase limpia frente a la cara.',
      'Empuja la barra en línea recta vertical hacia el techo.',
      'Una vez la barra pasa la frente, mete la cabeza bajo la barra y bloquea con los hombros arriba ("shrug" activo).'
    ],
    breathing: {
      inhale: 'Inhala en el pecho antes de empujar.',
      exhale: 'Exhala al superar la cabeza hacia el bloqueo.'
    },
    tempo: '2-0-1-1',
    proTip: 'Aprieta los glúteos al máximo: si relajas la pelvis, arquearás la zona lumbar y lesionarás la espalda.'
  },
  'curl': {
    postureInitial: [
      'De pie o sentado con la espalda recta, pecho alto y codos pegados a los costados.',
      'Hombros fijados atrás; las muñecas deben permanecer rígidas o ligeramente en flexión.'
    ],
    movementPhase: [
      'Flexiona los codos subiendo la carga sin adelantar los codos hacia el frente.',
      'Aprieta los bíceps con fuerza arriba en contracción máxima.',
      'Desciende en 2-3 segundos hasta la extensión completa del codo sin balancear el torso.'
    ],
    breathing: {
      inhale: 'Inhala mientras bajas la carga controlando.',
      exhale: 'Exhala al subir flexionando los bíceps.'
    },
    tempo: '3-0-1-1 (3s bajada · 1s subida · 1s pico)',
    proTip: 'Mantén los codos como bisagras clavadas a tu cintura; cualquier vaivén de codos le roba tensión al bíceps.'
  },
  'triceps-pushdown': {
    postureInitial: [
      'De pie frente a la polea con el torso ligeramente inclinado hacia delante (5-10°).',
      'Codos pegados a los costados y fijos en el espacio durante todo el ejercicio.',
      'Hombros deprimidos y espalda firme.'
    ],
    movementPhase: [
      'Extiende los codos hacia abajo hasta el bloqueo completo del tríceps.',
      'Si usas cuerda, abre las manos hacia los lados al final para acentuar la contracción lateral.',
      'Sube los antebrazos hasta que formen un ángulo de unos 90° con el brazo sin que los codos se desplacen.'
    ],
    breathing: {
      inhale: 'Inhala al dejar subir la cuerda o barra.',
      exhale: 'Exhala al empujar hacia abajo.'
    },
    tempo: '2-0-1-1',
    proTip: 'No uses el peso corporal para aplastar la polea; el movimiento debe nacer exclusivamente del codo.'
  },
  'hip-thrust': {
    postureInitial: [
      'Espalda alta (borde inferior de las escápulas) apoyada contra el borde del banco.',
      'Pies plantados en el suelo a la anchura de hombros; al subir, las espinillas deben quedar verticales a 90°.',
      'Barra acolchada colocada directamente sobre el pliegue de la cadera.'
    ],
    movementPhase: [
      'Empuja a través de los talones extendiendo la cadera hacia el techo.',
      'Mantén la barbilla pegada al pecho (mirando hacia tus rodillas, no al techo) para proteger la lumbar.',
      'Aprieta los glúteos con máxima fuerza 1-2 segundos arriba (el torso y los muslos forman una línea recta).'
    ],
    breathing: {
      inhale: 'Inhala en el fondo antes de empujar.',
      exhale: 'Exhala con potencia al elevar la cadera.'
    },
    tempo: '2-2-1-0 (2s contracción estática arriba)',
    proTip: 'Mantén la pelvis en retroversión pélvica arriba ("meter el coxis hacia adentro") para máxima tensión en glúteo.'
  },
  'plank': {
    postureInitial: [
      'Antebrazos apoyados en el suelo paralelos, codos directamente bajo los hombros.',
      'Puntas de los pies en el suelo a la anchura de las caderas.',
      'Columna completamente alineada: cabeza, escápulas, glúteos y talones forman una tabla recta.'
    ],
    movementPhase: [
      'Tensa activamente cuádriceps, glúteos y abdomen como si te fueran a dar un golpe.',
      'Empuja el suelo con los codos para separar los omóplatos ("protracción escapular").',
      'Mantén la posición estática sin permitir que la cadera se hunda ni suba en pico.'
    ],
    breathing: {
      inhale: 'Inhalaciones y exhalaciones diafragmáticas cortas y controladas.',
      exhale: 'Nunca contengas la respiración (evita picos de presión arterial).'
    },
    tempo: 'Tensión isométrica continua',
    proTip: 'Imagina que tiras de tus codos hacia las puntas de los pies para crear una contracción abdominal 3x más intensa.'
  }
};

export function getPostureGuideForExercise(patternId: string, groupName?: string): PostureGuide {
  if (PATTERN_POSTURE_GUIDES[patternId]) {
    return PATTERN_POSTURE_GUIDES[patternId];
  }

  // Fallback genérico inteligente según patrón
  if (patternId.includes('press') || patternId.includes('push')) {
    return PATTERN_POSTURE_GUIDES['bench-press'];
  }
  if (patternId.includes('squat') || patternId.includes('leg')) {
    return PATTERN_POSTURE_GUIDES['squat'];
  }
  if (patternId.includes('row') || patternId.includes('pull')) {
    return PATTERN_POSTURE_GUIDES['pulldown'];
  }
  if (patternId.includes('curl')) {
    return PATTERN_POSTURE_GUIDES['curl'];
  }
  if (patternId.includes('ext') || patternId.includes('pushdown')) {
    return PATTERN_POSTURE_GUIDES['triceps-pushdown'];
  }
  if (patternId.includes('thrust') || patternId.includes('bridge') || patternId.includes('glute')) {
    return PATTERN_POSTURE_GUIDES['hip-thrust'];
  }
  if (patternId.includes('plank') || patternId.includes('crunch') || patternId.includes('core')) {
    return PATTERN_POSTURE_GUIDES['plank'];
  }

  return PATTERN_POSTURE_GUIDES['bench-press'];
}
