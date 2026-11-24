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
git clone https://github.com/asips7879-lab/app-banqueo.git D:\app-banqueo
```

También puedes usar [GitHub Desktop](https://desktop.github.com): *File → Clone repository*.

Para traer los cambios nuevos:

```bash
git pull
```

La carpeta antigua `D:\App de banqueo JorG\` tiene la misma versión 1. Puedes guardarla como respaldo.

## Estructura

```
index.html          app completa: HTML + CSS + JS
preguntas.js        banco de preguntas (window.PREGUNTAS = [...])
SPEC.md             especificación y plan de trabajo
scripts/servidor.js servidor local para `npm run dev`
package.json        scripts de desarrollo (la app no tiene dependencias)
```

En la fase 2 del plan, `index.html` se separará en `css/` y `js/`. Lo hará con scripts clásicos para que siga funcionando con doble clic.

## Agregar preguntas

Las preguntas oficiales se agregan en `preguntas.js` con el formato de la sección 3.1 de `SPEC.md`. La dificultad tiene que ser exactamente `"Fácil"`, `"Media"` o `"Difícil"`, y la clave tiene que ser una de las opciones.

Las preguntas propias que agregues desde **Ajustes** se quedan en tu navegador. Para pasarlas al banco oficial, usa el botón **Copiar para enviar a Claude**.
