# Vino Nuevo · Formulario de registro

Formulario de la Semana Juvenil **Vino Nuevo** (Jóvenes FDL). Las respuestas se guardan en una hoja de Google Sheets.

- `index.html`: la página del formulario
- `css/vino-nuevo.css`: estilos (colores del arte del evento)
- `js/formulario.js`: validación y envío
- `js/config.js`: aquí va la URL de la base de datos
- `apps-script/Code.gs`: el código que guarda en Google Sheets

## 1. Conectar la base de datos (Google Sheets, ~5 minutos)

1. Crea una hoja nueva en <https://sheets.new> y ponle de nombre "Registros Vino Nuevo".
2. Menú **Extensiones → Apps Script**. Borra lo que aparezca y pega todo el contenido de `apps-script/Code.gs`. Guarda.
3. Botón **Implementar → Nueva implementación** → tipo **Aplicación web**:
   - *Ejecutar como*: **Yo**
   - *Quién tiene acceso*: **Cualquier usuario**
4. Autoriza los permisos (Google avisa que la app no está verificada: *Configuración avanzada → Ir a…*).
5. Copia la URL que termina en `/exec` y pégala en `js/config.js`:

   ```js
   window.VINO_NUEVO_CONFIG = { endpoint: "https://script.google.com/macros/s/XXXX/exec" };
   ```

La hoja crea sola la pestaña **Registros** con encabezados la primera vez que alguien envía el formulario.

## 2. Publicar (GitHub Pages)

En GitHub: **Settings → Pages → Source: Deploy from a branch**, elige la rama y la carpeta `/ (root)`.
El enlace queda como `https://valeriano-g.github.io/formulario-con-estilo/`.
