# Transporte Bilbao

App de auxiliares de transporte escolar del Colegio Bilbao.

## Archivos

- `index.html` — app que usan las auxiliares. Lee los datos de Firebase o de `datos.json`.
- `admin.html` — panel de coordinación (captura de alumnos, rutas, cambios del día y mapa de lugares).
- `demo.html` — versión de demostración con datos inventados, no necesita conexión.
- `datos.json` — datos de muestra. **No subir aquí datos reales de alumnos.**

## Importante sobre privacidad

GitHub Pages publica el sitio en internet abierto aunque el repositorio sea privado.
Los nombres, direcciones, teléfonos y coordenadas de los alumnos **no deben estar en este repositorio**.
Los datos reales van en Firebase Realtime Database con reglas de acceso restringidas.

## Cómo probar

1. Abrir `demo.html` y entrar con `ruta1`.
2. Para la versión real: abrir `admin.html`, capturar, y publicar a Firebase.
