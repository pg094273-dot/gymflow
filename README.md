# GYMFLOW — Planificador de entrenamientos de musculación

Aplicación web progresiva (PWA) para organizar entrenamientos de musculación en el gimnasio.
Funciona en iPhone (Safari → Añadir a pantalla de inicio) y Android (Chrome → Instalar app),
sin conexión una vez instalada, y se puede imprimir/exportar a PDF en tamaño A4.

## Funcionalidades

- **122 ejercicios** clasificados por 11 grupos musculares, con dibujo de ejecución, técnica, errores habituales y repeticiones recomendadas.
- **Generación automática de rutinas** según los días disponibles (1-5), tiempo por sesión (30/45/60/90 min), nivel y equipamiento disponible. El reparto de volumen es equilibrado (10-20 series por grupo a la semana) y respeta el tiempo real de cada serie.
- **Énfasis por grupo muscular**: puedes marcar uno o varios grupos en los que quieres incidir más (pecho, hombros, etc.). La rutina aumenta su volumen y series sin descuidar el resto, y lo muestra con ★ en el informe de volumen.
- **Sugerencias en el editor manual**: al crear tu propia rutina, pulsa un grupo muscular para añadir automáticamente un ejercicio sugerido (compuesto primero, luego aislado).
- **Creación manual de rutinas**: días, ejercicios, series, repeticiones y descanso editables.
- **Registro de entrenamientos**: pesos, repeticiones y notas por serie, con temporizador de descanso.
- **Progreso**: volumen por semana, series por grupo frente al objetivo, récords personales, historial y peso corporal.
- **Exportación a PDF A4** con una hoja por día y espacio para anotar pesos.
- **Ajustes**: unidades (kg/lb), nivel, equipamiento, días, tiempo, descanso automático. Copia de seguridad (JSON) e importación.

## Estructura

```
index.html
manifest.webmanifest
sw.js
css/styles.css
js/figures.js      # ilustraciones vectoriales de ejecución
js/data.js         # base de datos de ejercicios
js/store.js        # persistencia (localStorage)
js/generator.js    # generador de rutinas equilibradas
js/app.js          # interfaz y lógica
icons/             # iconos PWA
```

## Uso en local

Sirve la carpeta con cualquier servidor estático (el service worker requiere HTTPS o localhost):

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

## Instalar en el móvil

- **iPhone**: abre la URL en Safari → botón Compartir → «Añadir a pantalla de inicio».
- **Android**: abre la URL en Chrome → menú ⋮ → «Instalar aplicación».

## Convertir a app nativa (opcional)

Para publicar en App Store / Google Play, envuelve la web con Capacitor:

```bash
npm init -y
npm i @capacitor/core @capacitor/cli
npx cap init GYMFLOW com.gymflow.app --web-dir .
npx cap add ios
npx cap add android
npx cap open ios   # requiere Xcode
```

## Licencia

Uso personal. Ejercicios y recomendaciones de volumen basados en guías de entrenamiento de fuerza de uso común.
