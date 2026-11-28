# Banqueo JorG

App web para banquear preguntas médicas tipo examen (**ENAM**, **Residentado Médico** y **Preinternado EsSalud**), con mecánicas de juego para mantener el estudio diario: Hemi, una mascota glóbulo rojo que crece contigo, monedas, misiones diarias, logros, racha de días, repaso espaciado y una tienda de premios.

La especificación completa (reglas, formato de preguntas, decisiones y plan de trabajo) está en [`SPEC.md`](SPEC.md).

## Cómo abrirla

- **Con doble clic.** Abre `index.html` en el navegador. No necesita internet salvo para la tipografía.
- **En línea.** Usa el [artifact de claude.ai](https://claude.ai/artifact/TzeajyYpZ1y7GojFfmJZYL), que es privado para el dueño.
- **Con servidor local** (necesita [Node.js](https://nodejs.org) 18 o superior):

  ```bash
  npm run dev
  ```

  Después abre http://localhost:8080.

El progreso se guarda en el navegador (`localStorage`). Cada navegador, y también el artifact, lleva su propio progreso. Para pasarlo de uno a otro, usa **Ajustes → Copia de seguridad**.

## Tenerla en tu PC

Clona el repositorio en una carpeta nueva, por ejemplo `D:\app-banqueo`:

```bash
git clone https://github.com/asips7879-lab/App-banqueo.git D:\app-banqueo
```

También puedes usar [GitHub Desktop](https://desktop.github.com): *File → Clone repository*.

Para traer los cambios nuevos:

```bash
git pull
```

La carpeta antigua `D:\App de banqueo JorG\` tiene la misma versión 1. Puedes guardarla como respaldo.

## Estructura

```
index.html            estructura de la página y lista de scripts
css/estilos.css       estilos
js/                   código de la app (reglas, estado, mascota, vistas…)
preguntas.js          banco de preguntas (window.PREGUNTAS = [...]), con plantilla al inicio
SPEC.md               especificación y plan de trabajo
scripts/servidor.js   servidor local para `npm run dev`
scripts/validar.js    validador del banco (`npm run validar`)
tests/                pruebas automáticas (Playwright)
package.json          scripts de desarrollo (la app no tiene dependencias)
```

El detalle de cada archivo de `js/` está en la sección 4 de `SPEC.md`.

## Agregar preguntas

Las preguntas oficiales van en `preguntas.js`. Al inicio del archivo hay una **plantilla**: cópiala, pégala justo antes del `];` final y rellénala. Cada pregunta va entre `{ }` y termina con una coma.

- `dificultad`: exactamente `"Fácil"`, `"Media"` o `"Difícil"`, con tilde.
- `curso`: escríbelo siempre igual (por ejemplo, siempre `"Pediatría"` con tilde). El filtro agrupa por el texto exacto.
- `correcta`: la letra de la clave, en mayúscula. Tiene que ser una de las opciones.
- `explicacion`: puedes dejarla vacía (`""`) y pedirle a Claude que la redacte.

Después de editar, revisa el formato:

```bash
npm run validar
```

El validador muestra cuántas preguntas hay por curso y dificultad. También avisa de los errores típicos y dice dónde están: una tilde faltante, una coma olvidada, una clave que no existe, un id repetido o un curso escrito de dos formas.

Solo el moderador agrega preguntas al banco. Los estudiantes tienen su **Cuaderno de errores** (en **Ajustes**). Ahí guardan preguntas del banco, desde la revisión al terminar un banqueo, o preguntas externas, siempre con su propia explicación, y las repasan junto con las que fallaron. Esas preguntas nunca entran al banco oficial.

## Pruebas

Las pruebas recorren la app en un navegador real, tanto con servidor local (`http://`) como abriendo el archivo directamente (`file://`). Revisan las reglas del juego (monedas, XP, misiones, racha, repaso, logros, tienda y ajustes) y responden **todas** las preguntas de `preguntas.js`.

La primera vez en tu PC:

```bash
npm install
```

```bash
npx playwright install chromium
```

Para correrlas:

```bash
npm test
```

Las marcadas como `ERROR CONOCIDO` aparecen con ✘, pero cuentan como correctas. Documentan fallas que ya conocemos y que se corregirán en la fase 3. El resultado final debe decir `passed` sin ningún `failed`.

Para revisar el diseño a ojo:

```bash
npm run capturas
```

Las imágenes se guardan en `tests/capturas/`: cada vista a 390 px y a 1280 px, el modo oscuro y las etapas de la mascota.
