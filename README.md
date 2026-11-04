# GYMFLOW — Planificador de entrenamientos de musculación (React + TypeScript)

Aplicación web React + TypeScript construida con Vite para organizar y registrar entrenamientos de musculación en el gimnasio.
Diseñada para dispositivos móviles y escritorio, con persistencia local, fotografías reales de la posición inicial y final de cada ejercicio, ejecución paso a paso, temporizador de descanso interactivo y exportación a PDF en tamaño A4 lista para imprimir.

## Funcionalidades principales

- **Base de datos completa de ejercicios**: clasificados por 11 grupos musculares (pecho, espalda, hombros, bíceps, tríceps, antebrazo, cuádriceps, isquios, glúteos, gemelos, core), con dos fotografías reales por ejercicio (inicio y final), animación del movimiento, ejecución paso a paso, pautas de postura y respiración, errores habituales y repeticiones recomendadas.
- **Generación automática de rutinas equilibradas**: optimizadas por días (1-5), tiempo por sesión (30/45/60/90 min), nivel y equipamiento disponible (gimnasio completo, peso libre y poleas, mancuernas y banco, solo peso corporal). Distribución de volumen semanal (10-20 series por grupo) respetando descansos y tiempos reales.
- **Énfasis muscular personalizable**: añade énfasis a grupos musculares objetivo con diferentes intensidades (ligero, medio, fuerte).
- **Editor manual de rutinas**: personalización total de días, ejercicios, series, repeticiones y descansos, con reordenación y sugerencias inteligentes por grupo muscular.
- **Registro de sesiones en vivo**: seguimiento de series con pesos y repeticiones, marcas de completado, temporizador de descanso automático con señal sonora (beep) y notas de sesión.
- **Panel de progreso y analíticas**: gráfico de volumen semanal levantado (en kg o lb), control de series semanales frente a objetivos por grupo muscular, récords personales (PRs), evolución del peso corporal e historial de entrenamientos.
- **Exportación a PDF A4**: generación de hojas imprimibles con portada, reparto de volumen semanal, fotografía de cada ejercicio y hojas de registro diario con espacio para apuntar series y pesos.
- **Ajustes y copia de seguridad**: selección de unidades (kg/lb), nivel, días de entrenamiento, importación/exportación de copias en JSON y borrado seguro de datos.

## Estructura del proyecto

```
src/
├── components/          # Componentes reutilizables (Topbar, Tabbar, RestBar, ExerciseSheet, ExercisePhoto, Modals, PrintArea, Figure)
├── context/             # StoreContext para estado reactivo y persistencia en localStorage
├── data/
│   ├── exercises.ts     # Base de datos tipada de ejercicios, grupos musculares y perfiles
│   ├── technique.ts     # Ejecución paso a paso de cada ejercicio
│   ├── postureGuides.ts # Postura, respiración, tempo y consejos por patrón de movimiento
│   └── figures.ts       # Pictogramas vectoriales (respaldo si falta una fotografía)
├── services/
│   └── generator.ts     # Algoritmo de generación y balance de volumen de rutinas
├── views/               # Vistas principales (Hoy, Rutinas, Detalle, Ejercicios, Progreso, Ajustes, Sesión, Editor)
├── types.ts             # Tipos e interfaces TypeScript
├── App.tsx              # Componente raíz con enrutamiento por hash
└── main.tsx             # Punto de entrada de React
public/
├── img/ex/              # 244 fotografías WebP (2 por ejercicio: inicio y final)
├── icons/               # Iconos PWA (incluye el icono de inicio de iPhone, 180×180)
├── manifest.webmanifest # Manifest de instalación
└── sw.js                # Service worker para uso sin conexión
css/
└── styles.css           # Estilos visuales de la aplicación
```

## Desarrollo

```bash
# Iniciar servidor de desarrollo en puerto 3000
npm run dev

# Compilar para producción (genera la carpeta dist/)
npm run build
```

## Publicación en GitHub Pages (Solución a pantalla en blanco)

Para que el enlace de GitHub Pages funcione y no se quede en blanco:

1. Ve a tu repositorio en GitHub y haz clic en la pestaña **Settings** (Ajustes).
2. En el menú lateral izquierdo, haz clic en **Pages**.
3. En la sección **Build and deployment**:
   - En **Source**, selecciona **GitHub Actions**.
4. ¡Listo! Al hacer push al repositorio en la rama `main`, la GitHub Action `.github/workflows/deploy.yml` compilará automáticamente los archivos TypeScript con Vite usando rutas relativas (`./assets/`) y publicará el sitio web en funcionamiento.

## Créditos

Las fotografías de ejecución proceden de [free-exercise-db](https://github.com/yuhonas/free-exercise-db),
publicado bajo licencia **Unlicense** (dominio público). Se han redimensionado a 640 px y convertido
a WebP para reducir el peso de la aplicación.


