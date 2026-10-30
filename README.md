# GYMFLOW — Planificador de entrenamientos de musculación (React + TypeScript)

Aplicación web React + TypeScript construida con Vite para organizar y registrar entrenamientos de musculación en el gimnasio.
Diseñada para dispositivos móviles y escritorio, con persistencia local, ilustraciones vectoriales de ejecución de ejercicios, temporizador de descanso interactivo y exportación a PDF en tamaño A4 lista para imprimir.

## Funcionalidades principales

- **Base de datos completa de ejercicios**: clasificados por 11 grupos musculares (pecho, espalda, hombros, bíceps, tríceps, antebrazo, cuádriceps, isquios, glúteos, gemelos, core), con animaciones e ilustraciones vectoriales SVG, pautas de ejecución, errores habituales y repeticiones recomendadas.
- **Generación automática de rutinas equilibradas**: optimizadas por días (1-5), tiempo por sesión (30/45/60/90 min), nivel y equipamiento disponible (gimnasio completo, peso libre y poleas, mancuernas y banco, solo peso corporal). Distribución de volumen semanal (10-20 series por grupo) respetando descansos y tiempos reales.
- **Énfasis muscular personalizable**: añade énfasis a grupos musculares objetivo con diferentes intensidades (ligero, medio, fuerte).
- **Editor manual de rutinas**: personalización total de días, ejercicios, series, repeticiones y descansos, con reordenación y sugerencias inteligentes por grupo muscular.
- **Registro de sesiones en vivo**: seguimiento de series con pesos y repeticiones, marcas de completado, temporizador de descanso automático con señal sonora (beep) y notas de sesión.
- **Panel de progreso y analíticas**: gráfico de volumen semanal levantado (en kg o lb), control de series semanales frente a objetivos por grupo muscular, récords personales (PRs), evolución del peso corporal e historial de entrenamientos.
- **Exportación a PDF A4**: generación de hojas imprimibles con portada, reparto de volumen semanal y hojas de registro diario con espacio para apuntar series y pesos.
- **Ajustes y copia de seguridad**: selección de unidades (kg/lb), nivel, días de entrenamiento, importación/exportación de copias en JSON y borrado seguro de datos.

## Estructura del proyecto

```
src/
├── components/          # Componentes reutilizables (Topbar, Tabbar, RestBar, ExerciseSheet, Modals, PrintArea, Figure)
├── context/             # StoreContext para estado reactivo y persistencia en localStorage
├── data/
│   ├── exercises.ts     # Base de datos tipada de ejercicios, grupos musculares y perfiles
│   └── figures.ts       # Generador vectorial de poses y figuras animadas de ejercicios
├── services/
│   └── generator.ts     # Algoritmo de generación y balance de volumen de rutinas
├── views/               # Vistas principales (Hoy, Rutinas, Detalle, Ejercicios, Progreso, Ajustes, Sesión, Editor)
├── types.ts             # Tipos e interfaces TypeScript
├── App.tsx              # Componente raíz con enrutamiento por hash
└── main.tsx             # Punto de entrada de React
css/
└── styles.css           # Estilos visuales de la aplicación
```

## Desarrollo

```bash
# Iniciar servidor de desarrollo en puerto 3000
npm run dev

# Compilar para producción
npm run build
```
