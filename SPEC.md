# SPEC.md — Banqueo JorG

Especificación técnica de la aplicación de banqueo de preguntas médicas. Reúne todo lo construido hasta el **23 de noviembre de 2026** (versión 1) para seguir el desarrollo en Claude Code sobre los archivos locales.

- **Repositorio (fuente de verdad desde el 24 de noviembre de 2026):** https://github.com/asips7879-lab/App-banqueo (privado). El plan de trabajo está en la sección 7.
- **Carpeta local original:** `D:\App de banqueo JorG\` (versión 1; queda como respaldo)
- **Versión en línea (artifact de claude.ai, privada para el dueño):** https://claude.ai/artifact/TzeajyYpZ1y7GojFfmJZYL — slug `da9a291e-67a1-4bf3-a534-d386af43f941`, versión `1795458517-5907`
- **Doc de estado en el Project de claude.ai:** `claude/app-banqueo-estado.md`
- **Archivos de código:** `index.html` (toda la app) y `preguntas.js` (banco de preguntas). En la versión 1, los archivos locales y los del artifact eran idénticos (md5 `e3fbe363386b3c298a28096e6e39418c` para index.html y `a5d6ed970665e509ccca83cf2c9d43a5` para preguntas.js; commit `9d895bd` del repositorio).

---

## 1. Resumen y objetivo de la aplicación

**Qué es.** Una aplicación web para banquear (practicar con banco de preguntas) preguntas médicas tipo examen, con mecánicas de juego para mantener el estudio diario: una mascota que crece, monedas virtuales, misiones diarias, logros, racha de días y una tienda donde se canjean premios.

**Público objetivo.** Personas que van a postular a:
- el examen de **internado de EsSalud** (preinternado),
- el **ENAM** (Examen Nacional de Medicina),
- el **Residentado Médico (RM)**.

**Problema que resuelve.**
- Banquear todos los días cuesta. La app convierte el estudio en hábito con misiones diarias, racha y una mascota cuyo ánimo depende de que estudies.
- No basta con acertar; hay que entender. Cada pregunta trae una explicación de por qué la clave es correcta y por qué las demás no, más una "perla" clínica.
- Las preguntas falladas se olvidan. Un sistema de repaso espaciado las hace volver.
- Responder de memoria sin saber si de verdad uno domina el tema. El botón de confianza "Seguro / Dudo" premia la seguridad bien fundada y señala los **errores peligrosos** (fallar estando seguro).

**Origen de las preguntas (regla del proyecto).**
- Jorge colecciona las preguntas que le parecen interesantes y se las pasa a Claude.
- Jorge indica la **dificultad** y la **clave** de cada pregunta. Claude guarda la pregunta con su respuesta y claves tal como Jorge las dio, y redacta la explicación.
- Las preguntas se acumulan en `preguntas.js`.

**Requisito de plataforma.** Debe poder usarse en celular, navegador y computadora. Es una web adaptable a cualquier pantalla; al final se publica en una dirección pública y como app instalable.

**Quién la usa (decidido el 24 de noviembre de 2026).**
- **Estudiantes:** cualquier persona con el enlace (o que instale la app) puede usarla, pero primero debe **crear una cuenta** (usuario, correo y contraseña) e iniciar sesión. Su progreso se guarda en su cuenta y se **comparte entre su celular y su PC**.
- **Moderador (Jorge):** es el **único** que agrega, quita, clasifica y edita preguntas del banco oficial. Otra persona solo puede hacerlo si Jorge le da permiso de forma manual (como colaborador del repositorio en GitHub).

---

## 2. Stack tecnológico definido

| Capa | Elección | Detalle |
|---|---|---|
| Lenguajes | HTML5, CSS3, JavaScript (ES2020+, sin transpilar) | Todo el CSS y el JS van dentro de `index.html`. |
| Framework | Ninguno | JS "vanilla". Las vistas se renderizan con plantillas de texto (`innerHTML` con template literals y `map().join('')`). |
| Librerías | Ninguna | No hay dependencias de npm ni CDN de scripts. |
| Datos de preguntas | `preguntas.js` | Script que define `window.PREGUNTAS = [...]`. Se carga con `<script src="preguntas.js">` antes del script de la app. Funciona abriendo el archivo directamente (`file://`). |
| Persistencia | `localStorage` del navegador | Clave `banqueo-jorg-v1`. Todo el progreso es un solo objeto JSON. Lectura y escritura dentro de `try/catch`. No hay base de datos ni backend. |
| Respaldo | Texto JSON copiable | En Ajustes: botón Copiar y caja para pegar y restaurar. |
| Tipografía | Google Fonts **Nunito** (400, 600, 800, 900) | Fallback `system-ui, sans-serif`. Es lo único que se carga desde fuera. |
| Gráficos | SVG en línea generado por JS | Mascota, íconos de navegación y logo. Sin imágenes externas. |
| Estilos | CSS propio con variables y `light-dark()` | Soporta tema claro y oscuro (también `data-theme="light"`/`"dark"` en `<html>`). |
| Navegación | Rutas por hash | `#inicio`, `#banquear`, `#repaso`, `#tienda`, `#progreso`, `#ajustes`. |
| Hosting en línea | Artifact de claude.ai | Publicado desde los dos archivos (`index.html` + `preguntas.js`). Corre en un iframe con CSP: no permite `alert/confirm/prompt`, descargas, ni `fetch` a otros dominios. Por eso los diálogos están construidos dentro de la página y el respaldo es por texto copiable. |
| Pruebas | Playwright (`@playwright/test` 1.63.0, solo para desarrollo) | Suite en `tests/` (`npm test`): ~190 pruebas por `http://` y por `file://`, con banco de prueba propio, fecha simulada y 0 errores de consola exigidos. Más capturas para revisión visual (`npm run capturas`). Ver sección 7. |
| Validador del banco | `scripts/validar.js` (Node, sin dependencias) | `npm run validar`: resumen por curso y dificultad, errores (formato, tildes, clave, ids) y avisos (sin explicación, cursos escritos de dos formas). |

**Paleta (variables CSS):**

| Variable | Claro | Oscuro | Uso |
|---|---|---|---|
| `--bg` | `#f3f7f7` | `#0b1416` | Fondo |
| `--card` | `#ffffff` | `#13201f` | Tarjetas |
| `--ink` | `#10232a` | `#e4f0f0` | Texto |
| `--mute` | `#5b6f74` | `#93a9ac` | Texto secundario |
| `--line` | `#dbe6e7` | `#24393a` | Bordes |
| `--teal` | `#0b6f78` | `#2bb0ba` | Color principal (verde quirófano) |
| `--teal2` | `#0e8a95` | `#1d8790` | Degradado del hero |
| `--red` | `#e11d48` | `#e11d48` | Rojo hemoglobina (mascota, botón peligroso) |
| `--gold` | `#e9a400` | `#e9a400` | Monedas, botones de recompensa |
| `--ok` / `--okbg` | `#0f8a4a` / `#e3f6ec` | `#38c47c` / `#123224` | Acierto |
| `--bad` / `--badbg` | `#c62828` / `#fde8e8` | `#ff6b6b` / `#3a1717` | Error |

**Diseño responsive.**
- En móvil la barra de navegación está fija abajo, con íconos.
- Desde 900 px pasa a la parte superior derecha del encabezado, solo texto, y el encabezado reserva espacio a la derecha.
- Bajo 640 px el hero se apila en una columna, con la mascota primero.
- Las animaciones se desactivan con `prefers-reduced-motion`.

---

## 3. Funcionalidades y reglas de negocio

### 3.1 Formato de una pregunta

```js
{
  id: "ej-001",              // único. Ejemplos: "ej-NNN". Propias del navegador: "u" + timestamp
  ejemplo: true,             // opcional. Marca preguntas de demostración
  examen: ["ENAM", "RM", "Preinternado"],   // una o varias
  curso: "Pediatría",
  tema: "Exantemas virales",
  dificultad: "Fácil",       // "Fácil" | "Media" | "Difícil" (con tilde, exacto)
  enunciado: "...",
  opciones: { A: "...", B: "...", C: "...", D: "...", E: "..." },  // A–D obligatorias, E opcional
  correcta: "B",
  explicacion: "...",
  perla: "...",              // opcional
  fuente: "..."              // opcional (p. ej. "ENAM 2024")
}
```

Al inicio de `preguntas.js` hay una plantilla comentada lista para copiar. El formato se revisa con `npm run validar`.

El banco completo en uso es `allQ() = [...window.PREGUNTAS, ...S.custom]`. Es decir, las preguntas de `preguntas.js` más las que el usuario agregó desde Ajustes, que se guardan en su navegador.

### 3.2 Estado guardado (`localStorage['banqueo-jorg-v1']`)

```js
{
  xp: 0, coins: 0, name: 'Hemi',
  ans: { [id]: { n, ok, last } },             // historial por pregunta
  srs: { [id]: { box, due: 'YYYY-MM-DD', danger } },   // repaso espaciado
  daily: { date, n, ok, run, courses: [], rev, claimed: [] },  // contadores del día
  run: 0, bestRun: 0,                          // aciertos seguidos (actual y récord)
  streak: 0, lastDay: '', lastAct: '',         // racha de días y última actividad
  owned: [], equip: [],                        // accesorios comprados y puestos
  premios: [{ id, nombre, costo }],            // premios personales
  canjes: [{ nombre, costo, fecha }],
  custom: [],                                  // preguntas propias
  logros: [],                                  // ids de logros obtenidos
  total: 0, ok: 0, hardOk: 0,                  // totales
  course: { [curso]: { n, ok } }               // estadística por curso
}
```

- Al cargar se fusiona con el estado por defecto (`Object.assign(def(), guardado)`), así los campos nuevos no rompen datos viejos.
- Las fechas son locales del dispositivo, en formato `YYYY-MM-DD`.
- `daily` se reinicia cuando cambia la fecha (`ensureDaily()`). Esto se ejecuta en cada cambio de vista y en cada respuesta.

### 3.3 Mascota "Hemi"

- Es un glóbulo rojo dibujado en SVG (viewBox 200×200). El nombre se puede editar en Ajustes (máximo 20 caracteres; si queda vacío, vuelve a "Hemi").
- **Etapas según nivel:**

| Nivel mínimo | Etapa | Aspecto |
|---|---|---|
| 1 | Célula madre | Círculo lila (`#b57edc`) con núcleo |
| 3 | Reticulocito | Disco rojo con puntitos (restos de ribosomas) |
| 6 | Interno | Lleva bata blanca con bolsillo |
| 10 | Residente | Además, estetoscopio |
| 15 | Especialista | Además, birrete de graduación (si no lleva el gorro quirúrgico) |

- **Ánimo (`mood()`):**
  - `feliz` si hubo actividad hoy, o si nunca hubo actividad.
  - `normal` si la última actividad fue ayer.
  - `triste` si fue antes de ayer. En ese caso cambia la boca y aparece una lágrima.
- **Mensajes del hero según el ánimo:**
  - feliz: "¡Listo para seguir sumando! Cada pregunta me hace crecer."
  - normal: "Ayer no banqueamos… ¿empezamos con unas cuantas?"
  - triste: "Te extrañé. Diez preguntas hoy y vuelvo a sonreír."
- Al subir a una etapa nueva aparece el aviso "¡{nombre} evolucionó a {etapa}!".

### 3.4 Nivel y experiencia

- Para pasar del nivel 1 al 2 se necesitan 100 XP. Cada nivel siguiente pide 25 XP más: `need = 100 + (nivel-1)*25`.
  - XP acumulada aproximada: nivel 3 ≈ 225, nivel 6 ≈ 750, nivel 10 ≈ 1800, nivel 15 ≈ 3675.
- **XP por acierto:** Fácil 8, Media 12, Difícil 18 (12 si la dificultad no está definida).
- **XP por error:** +3 ("aprendes del error").
- **XP por reclamar una misión o el cofre:** +10.
- Al subir de nivel aparece el aviso "¡Subiste a nivel N!".

### 3.5 Monedas

- **Por acierto:** Fácil 3, Media 5, Difícil 8 (5 si la dificultad no está definida).
- **Bono de confianza:** si se marcó "Seguro" y se acierta, las monedas se multiplican por 1.5, redondeado.
- **Bono de racha de aciertos:** cada vez que los aciertos seguidos llegan a un múltiplo de 5, +10 monedas con el aviso "N aciertos seguidos · +10".
- **Por logro:** +50 monedas al desbloquearlo.
- **Por misiones:** según cada misión (ver 3.8); el cofre del día da +60.
- **Gasto:** en premios personales y accesorios. No se puede gastar más de lo que se tiene; los botones se desactivan.

### 3.6 Banqueo (vista `#banquear`)

**Filtros de la pantalla "Arma tu banqueo":**
- Examen: Todos, ENAM, RM o Preinternado.
- Curso: lista generada desde el banco.
- Dificultad: Todas, Fácil, Media o Difícil.
- Estado: Todas, No vistas (sin historial) o Falladas alguna vez (`ans.ok < ans.n`).
- Cantidad: 10, 20, 50 o Todas.
- Modo: Práctica o Simulacro.

El texto "N preguntas coinciden" se actualiza al cambiar filtros. El botón Empezar se desactiva si no hay coincidencias. Las preguntas se barajan con Fisher–Yates.

**Pantalla de pregunta:**
- Muestra el modo y la posición (n/total), una barra de progreso y etiquetas de curso, dificultad (coloreada), exámenes y "Error peligroso" si aplica.
- Debajo van el enunciado y las opciones A–E.
- El selector de confianza ("Dudo" por defecto, o "Seguro") está junto al botón Confirmar, que queda desactivado hasta elegir una opción.
- El botón **Terminar** cierra la sesión y lleva a los resultados.

**Modo práctica:**
- Al confirmar se marca en verde la clave y en rojo la opción elegida si era incorrecta.
- Aparece la explicación, la perla (si existe) y la fuente.
- El encabezado indica "¡Correcto!" o "Incorrecto · la respuesta es X", y si aplica, el bono de seguridad o el error peligroso.
- El selector de confianza se oculta y el botón cambia a "Siguiente" o "Ver resultados".

**Modo simulacro:**
- Tiempo total = 72 segundos × número de preguntas, con cuenta regresiva visible. Al llegar a 0 se termina solo.
- No hay explicación inmediata: al responder pasa a la siguiente.
- Las recompensas se calculan igual en cada respuesta.

**Modo repaso:** se entra desde `#repaso` y usa la misma pantalla que práctica.

**Atajos de teclado** (solo con una pregunta en pantalla y sin foco en un campo de texto):
- A–E o 1–5: elegir opción.
- S: alternar Seguro/Dudo.
- Enter: confirmar o pasar a la siguiente.

**Resultados:**
- Muestra la mascota (feliz si ≥70 %, normal si ≥40 %, triste si es menos), "X/N correctas · %", las monedas y XP ganadas en la sesión, y cuántas preguntas pasan al repaso.
- Debajo hay una revisión pregunta por pregunta en elementos plegables, con la respuesta propia, la correcta y la explicación completa. En simulacro, las falladas aparecen abiertas.
- Botones: "Nuevo banqueo" y "Ver misiones".

### 3.7 Repaso espaciado (vista `#repaso`)

- Una pregunta fallada fuera del repaso se agrega con `box: 0`, vence **hoy** y lleva `danger` si se marcó "Seguro". Si ya estaba en seguimiento, se sobrescribe.
- La lista de pendientes son las que tienen `due <= hoy`. Los errores peligrosos van primero.
- **Al responder en modo repaso:**
  - Suma 1 a `daily.rev`, que cuenta para la misión m5.
  - Si acierta: `box++`. Con `box >= 4` sale del repaso. Si no, `due = hoy + [1,3,7,15][box]` y se quita `danger`.
  - Si falla: `box = 0`, vence mañana y `danger` se mantiene (o se activa si marcó "Seguro").
- Acertar una pregunta en seguimiento desde práctica o simulacro **no** cambia su estado de repaso.
- La vista muestra tres contadores (pendientes para hoy, errores peligrosos y total en seguimiento), el botón "Repasar ahora" y la lista de pendientes.

### 3.8 Misiones diarias, cofre y racha

| id | Misión | Meta | Contador | Recompensa |
|---|---|---|---|---|
| m1 | Responde 10 preguntas | 10 | `daily.n` | +30 |
| m2 | Acierta 7 preguntas | 7 | `daily.ok` | +40 |
| m3 | Encadena 5 aciertos seguidos | 5 | `daily.run` (mejor racha de aciertos del día) | +30 |
| m4 | Banquea 2 cursos distintos | 2 | `daily.courses.length` | +20 |
| m5 | Repasa 3 preguntas pendientes | 3 | `daily.rev` | +30 |
| all | Cofre del día (con todas reclamadas) | — | — | +60 |

- La recompensa se **reclama** con un botón; no se entrega sola.
- Cada misión y el cofre se reclaman una vez por día (`daily.claimed`).
- **Racha de días:** al llegar exactamente a 10 respuestas en el día:
  - si `lastDay` fue ayer, `streak++`;
  - si no fue hoy, `streak = 1`;
  - luego `lastDay = hoy` y aparece el aviso "Racha: N días".
- La racha mostrada es 0 si `lastDay` no es hoy ni ayer.

### 3.9 Logros (+50 monedas cada uno)

| id | Nombre | Condición |
|---|---|---|
| l1 | Primera pregunta | `total >= 1` |
| l2 | Banqueador | `total >= 100` |
| l3 | Maratonista | `total >= 500` |
| l4 | Constancia | `streak >= 7` |
| l5 | Imparable | `bestRun >= 15` |
| l6 | Nivel 5 | nivel ≥ 5 |
| l7 | Cazador de difíciles | `hardOk >= 10` |
| l8 | Ojo clínico | `total >= 50` y aciertos ≥ 80 % |

Se revisan después de cada respuesta y de cada reclamo de misión.

### 3.10 Tienda (vista `#tienda`)

**Mis premios** (premios reales que define Jorge):
- Cada premio muestra nombre, costo y los botones Canjear y Quitar.
- El formulario "Nuevo premio" pide nombre (obligatorio) y costo (entero ≥ 1, por defecto 200).
- Al canjear aparece un cuadro de confirmación dentro de la página ("¿Canjear '…' por N monedas?" con "Sí, canjear" y "Cancelar"). Al confirmar se descuentan las monedas, se registra en `canjes` y aparece el aviso "¡Disfruta: …!".
- Historial: últimos 10 canjes.
- Premios de ejemplo por defecto: "Un episodio de mi serie" (150) y "Mi postre favorito" (300).

**Accesorios para la mascota** (solo cosméticos; cada tarjeta muestra la mascota con el accesorio puesto):

| id | Nombre | Precio |
|---|---|---|
| lentes | Lentes de lectura | 60 |
| mascarilla | Mascarilla N95 (tapa la boca) | 80 |
| gorro | Gorro quirúrgico (reemplaza al birrete) | 120 |
| medalla | Medalla al mérito | 200 |
| corona | Corona del primer puesto | 500 |

Al comprar se equipa automáticamente. Después el botón alterna entre "Puesto" y "Ponérselo".

### 3.11 Progreso (vista `#progreso`)

- Cinco tarjetas: respondidas, % de aciertos totales, mejor racha de aciertos, días de racha y premios canjeados.
- **Aciertos por curso:** barras horizontales ordenadas por número de respuestas. Verde si es ≥70 %, dorado si es ≥50 % y rojo si es menos. Si no hay datos, muestra un mensaje.
- **Logros:** lista con estrella si está obtenido.

### 3.12 Ajustes (vista `#ajustes`)

- **Nombre de la mascota.**
- **Copia de seguridad:** caja de solo lectura con el JSON del estado y botón Copiar (`navigator.clipboard`; si falla, avisa "Selecciona y copia manualmente"). Para restaurar se pega el texto; es válido solo si es un objeto con `xp`. Si no, avisa "Ese texto no es una copia válida".
- **Agregar pregunta propia** *(se reemplaza en la fase 3 por el **Cuaderno de errores**, sección 3.14; también desaparece el botón "Copiar para enviar a Claude")*:
  - Campos: exámenes (casillas, las tres marcadas por defecto), curso (obligatorio, con sugerencias de cursos existentes), tema, dificultad (por defecto Media), enunciado (obligatorio), opciones A–D (obligatorias) y E (opcional), clave, fuente (por defecto "Propia"), explicación (obligatoria) y perla.
  - Validación: la clave elegida debe tener texto.
  - Se guarda en `S.custom` con id `u{timestamp}`.
  - Si hay preguntas propias aparece el botón "Copiar para enviar a Claude", que copia su JSON para incorporarlas al banco oficial.
- **Zona peligrosa:** "Borrar todo mi progreso" pide una segunda confirmación dentro de la página. Reinicia el estado pero **conserva las preguntas propias**.

### 3.13 Avisos (toasts)

Aparecen arriba a la derecha (`aria-live="polite"`) y desaparecen a los 3.2 s. Se usan para subida de nivel, evolución, logros, bonos, racha, canjes, guardado y errores de validación.

### 3.14 Cuaderno de errores *(propuesta, por confirmar; se construye en la fase 3)*

Reemplaza a "Agregar pregunta propia". Es un espacio **personal** del estudiante, distinto de lo que hace el moderador: el estudiante **no** agrega preguntas a la app.

- **Registro automático.** Cada pregunta del banco que el estudiante falla entra a su cuaderno con la fecha, su respuesta, la clave y la explicación. Si la vuelve a fallar, se suma al contador de veces fallada.
- **Nota personal.** Cada entrada tiene un campo libre ("por qué me equivoqué", "qué debo recordar").
- **Anotaciones manuales (privadas).** El estudiante puede anotar errores de otras fuentes, como un simulacro externo o un examen pasado. Anota el enunciado, su respuesta, la correcta, el curso y una nota. **Solo las ve él**: nunca entran al banco oficial ni las ven otros usuarios.
- **Organización.** Filtro por curso, búsqueda por texto y la opción "Ya lo domino" para archivar.
- **Práctica.** El botón "Practicar mis errores" arma un banqueo con las preguntas del banco que están en el cuaderno.
- **Diferencia con Repaso.** El repaso programa cuándo volver a ver una pregunta y la saca cuando la domina. El cuaderno es un registro permanente con las notas del estudiante.
- **Dónde va.** Hay que decidirlo en el diseño, porque en el celular la barra ya tiene 6 íconos: puede ser una pestaña dentro de Repaso o una séptima sección.
- **Cuentas.** A partir de la fase 5 se guarda en la cuenta del estudiante y se sincroniza entre sus dispositivos.

---

## 4. Arquitectura y estructura de carpetas

**Estructura actual (real, repositorio `app-banqueo`):**

```
app-banqueo/
├── index.html          ← app completa: HTML + CSS + JS (397 líneas)
├── preguntas.js        ← banco: window.PREGUNTAS = [...] (111 líneas)
├── SPEC.md             ← este documento
├── README.md           ← cómo abrir, clonar y agregar preguntas
├── package.json        ← scripts de desarrollo (dev, test, capturas, validar); la app no tiene dependencias
├── playwright.config.js ← proyectos de prueba: http, file y capturas
├── scripts/
│   ├── servidor.js     ← servidor local sin dependencias (`npm run dev`, puerto 8080)
│   └── validar.js      ← validador del banco de preguntas (`npm run validar`)
├── tests/
│   ├── ayudantes.js    ← abrir la app con estado, fecha y banco dados; responder; vigilar la consola
│   ├── banco-prueba.js ← 12 preguntas solo para pruebas (3 cursos × 4, 4 por dificultad)
│   ├── *.spec.js       ← navegacion, banqueo, reglas, repaso, tienda, ajustes, banco-real, validar
│   └── capturas.spec.js ← capturas para revisar a ojo (salen en tests/capturas/, no se suben)
├── .gitattributes      ← fuerza saltos de línea LF (también en Windows)
├── .editorconfig       ← UTF-8, LF, 2 espacios
└── .gitignore
```

**Arquitectura de `index.html`:**
- `<head>`: metadatos, Google Fonts y todo el CSS. El CSS empieza con un comentario de dirección de diseño (VOICE / IDEA / PICTURE / COLOUR and TYPE / LAYOUT).
- `<body>`: `header` (logo, nivel, monedas), `nav#nav`, `main#view` (contenedor de la vista actual) y `#toasts`.
- `<script src="preguntas.js">` y después el script de la app, envuelto en un bloque `{ … }` para no contaminar el ámbito global. Sus secciones, en orden:
  1. Utilidades: `$`, `esc` (escapa HTML), fechas (`today`, `addDays`, `fmt`) y `shuffle`.
  2. Estado: `def()`, carga desde `localStorage`, `save()` y `allQ()`.
  3. Tablas de reglas: `REW`, `XPR`, `STAGES`, `ACC`, `MIS`, `LOG` y `levelInfo`/`stageOf`.
  4. Lógica: `ensureDaily`, `mood`, `streakNow`, `dueList`, `toast`, `gain`, `checkLog`.
  5. `mascot(stage, equip, mood, cls)`, que devuelve el SVG como texto.
  6. Navegación: `IC` (íconos SVG), `TABS`, `renderNav`, `header`, `route`.
  7. Vistas: `vInicio`, `vBanquear` (+ `startQuiz`, `renderQuiz`, `pick`, `setConf`, `doConfirm`, `fbHtml`, `next`, `finishQuiz`, `renderResults`), `record`, `vRepaso`, `vTienda`, `vProgreso`, `vAjustes`.
  8. `VIEWS`, escucha de `hashchange`, atajos de teclado y `route()` inicial.
- **Flujo de render:** `route()` lee el hash, asegura el día, pinta la navegación y el encabezado, y llama a la vista. Cada vista reemplaza `#view.innerHTML` y engancha sus eventos.
- **Sesión activa:** variable `Q = { list, mode, i, sel, conf, shown, res, coins0, xp0, finished, end?, tick? }`. Si existe y no terminó, `#banquear` muestra la pregunta en curso. Si terminó, muestra los resultados.
- **Escritura:** toda mutación de estado pasa por `save()`. Las respuestas pasan por `record()`, que actualiza contadores, recompensas, repaso, racha y logros.

**Estructura decidida** (se aplica en la fase 2, después de tener pruebas):

```
app-banqueo/
├── index.html            ← solo la estructura HTML
├── css/estilos.css
├── js/
│   ├── utilidades.js     ($, esc, fechas, shuffle)
│   ├── estado.js         (def, carga y guardado, allQ)
│   ├── reglas.js         (REW, XPR, STAGES, ACC, MIS, LOG: todos los valores ajustables)
│   ├── mascota.js        (mascot)
│   ├── vistas/*.js       (inicio, banquear, repaso, tienda, progreso, ajustes)
│   └── app.js            (router, teclado)
├── preguntas.js
├── tests/                (pruebas con Playwright)
└── scripts/
    ├── servidor.js
    └── validar.js        (validador del banco de preguntas)
```

- Se usan `<script src>` **clásicos, no módulos ES**: los módulos (`import`/`export`) no cargan al abrir el archivo con `file://`, y ese uso es un requisito.
- Sin framework ni empaquetador: obligarían a compilar antes de abrir la app y añadirían dependencias.

---

## 5. Estado actual del avance

### Hecho y probado (v1)

- Las seis vistas funcionando: Inicio, Banquear, Repaso, Tienda, Progreso y Ajustes.
- Mascota con 5 etapas, 3 ánimos y 5 accesorios. Se revisaron visualmente las etapas 0–3; la etapa 4 (birrete) no se revisó en captura.
- Modos práctica, simulacro y repaso; botón de confianza; repaso espaciado; misiones con cofre; racha; 8 logros; tienda con premios personales y accesorios; agregar preguntas propias; respaldo y restauración; reinicio.
- Diseño responsive (probado a 1280×900 y 390×844) y tema claro/oscuro. Sin errores de consola en la prueba automatizada.
- Publicada como artifact y guardada en `D:\App de banqueo JorG\`.
- 6 preguntas de ejemplo (`ej-001` a `ej-006`): Pediatría, Ginecología y Obstetricia, Medicina Interna, Cirugía General, Salud Pública e Infectología.

### Pendiente

1. **Cargar las preguntas reales de Jorge** (con su dificultad y clave) y borrar las de ejemplo.
2. **Definir los premios reales** en la tienda. Los dos actuales son de ejemplo.
3. Cada vez que cambie `preguntas.js`, actualizarlo en la carpeta local y republicar el artifact. En el artifact: `publish_files` con slug `da9a291e-67a1-4bf3-a534-d386af43f941`, `base_version` vigente y modo `patch`.

### Errores y detalles conocidos (no corregidos)

- **Texto del repaso vs. lógica.** La vista dice que las preguntas vuelven "a los 1, 3, 7 y 15 días", pero el código, al acertar en repaso, hace `box++` antes de indexar `[1,3,7,15][box]`. Los intervalos reales tras cada acierto son **3, 7 y 15 días**, y sale del repaso al 4.º acierto; el valor de 1 día solo se usa tras fallar en repaso. Hay que corregir el texto o el índice.
- **Fallar en práctica una pregunta que ya está en repaso** reinicia su registro y puede **borrar la marca `danger`** anterior si esta vez se marcó "Dudo".
- **`daily.run` arrastra la racha de ayer.** La misión m3 usa la racha de aciertos del día, pero `S.run` no se reinicia al cambiar de día. Una racha que empezó ayer puede completar m3 hoy.
- **Monedas de logros en resultados.** Las monedas de logros y del bono de 5 seguidos se suman a "+N monedas" de la sesión. Las de logros no pasan por `gain()`, así que no disparan el aviso de subida de nivel.
- **Resultados que se quedan.** Al volver a `#banquear` después de una sesión terminada siguen apareciendo los resultados hasta pulsar "Nuevo banqueo".
- **Repaso con otra sesión abierta.** Empezar un repaso mientras hay una sesión de práctica a medias la descarta sin aviso.
- **Animación sin usar en la pregunta.** La clase `.hop` (salto de la mascota) solo se usa en la pantalla de resultados. Se quitó una función `bounce()` vacía y la mascota no aparece durante las preguntas.
- **Premio con nombre de solo espacios.** *(Detectado en la fase 1.)* El campo es obligatorio, pero `"   "` pasa la validación del navegador y el premio se guarda con nombre vacío.
- **Detalle visual del reticulocito.** Los puntitos se superponen un poco con la boca.
- **Navegación de escritorio apretada.** Cerca de 900–1000 px los enlaces quedan muy juntos.

Los errores que se pueden comprobar automáticamente tienen una prueba marcada con `test.fail` ("ERROR CONOCIDO"): describe el comportamiento correcto y hoy falla a propósito. Al corregir cada uno, se quita el `.fail` y la prueba debe pasar.

### Decisiones tomadas (24 de noviembre de 2026)

- **Dónde vive el código:** repositorio privado de GitHub `asips7879-lab/App-banqueo`. Cada fase se guarda con commits.
- **Arquitectura:** separar en varios archivos con scripts clásicos (ver la sección 4). Se hace en la fase 2, después de las pruebas.
- **Pruebas y validador:** se agregan pruebas con Playwright y un validador del banco de preguntas. Son solo herramientas de desarrollo; la app sigue sin dependencias. El validador se adelantó a la fase 1 porque Jorge irá agregando preguntas (con su curso y dificultad) directamente en `preguntas.js`.
- **Uso público con cuentas:** cualquiera con el enlace puede usar la app, pero tiene que crear una cuenta e iniciar sesión.
- **Sincronización:** el progreso de cada estudiante se guarda en la nube y se comparte entre su celular y su PC.
- **Moderación del banco:** solo Jorge edita las preguntas. Siguen en `preguntas.js`, dentro del repositorio privado. Para dar permiso a otra persona se la invita en GitHub (*Settings → Collaborators*), sin compartir la contraseña. Separar preguntas (en el repositorio) y progreso (en la nube) cumple esta regla sin necesidad de un panel de administración.
- **Cuaderno de errores:** reemplaza a "Agregar pregunta propia" (ver la sección 3.14).
- **Mascota:** se mantiene el nombre **Hemi**. Su aspecto y su progresión (etapas, logros, mejoras) los define Jorge en una fase propia.
- **Publicación al final:** dirección pública (Cloudflare Pages o Netlify, conectados al repositorio privado) y app instalable, cuando la app esté terminada.

### Decisiones abiertas

- **Proveedor de cuentas y base de datos.** Se recomienda **Supabase**: registro con correo y contraseña, recuperación de contraseña, base de datos con reglas para que cada usuario solo vea y cambie lo suyo, y plan gratuito. La alternativa es Firebase. Se confirma al empezar la fase 5, revisando las condiciones vigentes del plan gratuito.
- **Detalles del Cuaderno de errores.** Hay que confirmar la propuesta de la sección 3.14 (en especial, las anotaciones manuales y dónde va en la navegación).
- **Diseño de Hemi y su progresión.** Pendiente de lo que defina Jorge.
- **Aviso de privacidad.** Al guardar correos y progreso de personas en Perú aplica la Ley 29733 de Protección de Datos Personales. Antes de publicar hay que preparar un aviso de privacidad y términos de uso.
- **Valores numéricos.** Los precios de accesorios, las recompensas por dificultad, el tiempo del simulacro (72 s por pregunta), los umbrales de etapas y los logros los propuso Claude; **Jorge no los ha confirmado**.
- **Duración real de los exámenes.** No se verificó contra ENAM, RM ni EsSalud para calibrar el simulacro.

---

## 6. Código generado hasta ahora

Los dos archivos están completos y sin cambios respecto a lo publicado.

### 6.1 `D:\App de banqueo JorG\index.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Banqueo JorG</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;800;900&display=swap" rel="stylesheet">
<style>
/* VOICE: compañero de estudio cálido y clínico, motivador sin infantilizar
   IDEA: una libreta de guardia con un glóbulo rojo que crece contigo
   PICTURE: Hemi, la mascota glóbulo rojo, grande en la portada
   COLOUR and TYPE: verde quirófano + rojo hemoglobina + oro de monedas; Nunito
   LAYOUT: portada con mascota, misiones debajo; banqueo a pantalla limpia */
:root{color-scheme:light dark;
 --bg:light-dark(#f3f7f7,#0b1416);--card:light-dark(#ffffff,#13201f);--ink:light-dark(#10232a,#e4f0f0);
 --mute:light-dark(#5b6f74,#93a9ac);--line:light-dark(#dbe6e7,#24393a);--teal:light-dark(#0b6f78,#2bb0ba);
 --teal2:light-dark(#0e8a95,#1d8790);--red:#e11d48;--gold:#e9a400;--ok:light-dark(#0f8a4a,#38c47c);
 --okbg:light-dark(#e3f6ec,#123224);--bad:light-dark(#c62828,#ff6b6b);--badbg:light-dark(#fde8e8,#3a1717)}
:root[data-theme=light]{color-scheme:light}:root[data-theme=dark]{color-scheme:dark}
*{box-sizing:border-box;min-width:0}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 Nunito,system-ui,sans-serif;overflow-x:clip;padding-bottom:84px}
h1,h2,h3{line-height:1.1;margin:0 0 .4em;text-wrap:balance}
h1{font-size:clamp(28px,4vw,40px);font-weight:900}h2{font-size:22px;font-weight:900}h3{font-size:17px;font-weight:800}
button,input,select,textarea{font:inherit;font-size:16px;color:inherit}
button{cursor:pointer}
:focus-visible{outline:3px solid var(--gold);outline-offset:2px}
header{display:flex;align-items:center;gap:12px;padding:10px max(4vw,14px);background:var(--teal);color:#fff;position:sticky;top:0;z-index:5}
.logo{font-weight:900;font-size:19px;margin-right:auto;display:flex;align-items:center;gap:8px}
.pill{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.16);border-radius:99px;padding:5px 12px;font-weight:800;white-space:nowrap}
.coin{width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#ffe27a,var(--gold) 60%,#a87400);display:inline-block;flex:none}
nav{position:fixed;bottom:0;left:0;right:0;display:flex;background:var(--card);border-top:1px solid var(--line);z-index:6}
nav a{flex:1;text-align:center;padding:10px 4px 12px;color:var(--mute);text-decoration:none;font-weight:800;font-size:13px;min-height:56px;display:flex;flex-direction:column;align-items:center;gap:2px}
nav a svg{width:22px;height:22px}
nav a.on{color:var(--teal)}
main{max-width:1100px;margin:0 auto;padding:18px max(4vw,14px)}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px}
.grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))}
.hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:20px;align-items:center;background:linear-gradient(160deg,var(--teal),var(--teal2));color:#fff;border-radius:24px;padding:clamp(18px,3vw,32px);margin-bottom:18px}
.hero .mascot{aspect-ratio:1;max-width:340px;width:100%;justify-self:center}
.hero p{margin:.2em 0 .8em;opacity:.92}
.bar{height:12px;background:rgba(0,0,0,.18);border-radius:99px;overflow:hidden}
.bar i{display:block;height:100%;background:var(--gold);border-radius:99px;transition:width .5s}
.card .bar{background:var(--line)}.card .bar i{background:var(--teal)}
.btn{border:0;border-radius:14px;padding:12px 18px;min-height:46px;font-weight:900;background:var(--teal);color:#fff}
.btn.alt{background:transparent;color:inherit;border:2px solid currentColor}
.btn.gold{background:var(--gold);color:#2b1d00}
.btn.red{background:var(--red)}
.btn:disabled{opacity:.45;cursor:not-allowed}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.mute{color:var(--mute)}.small{font-size:14px}
.mission{display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--line)}
.mission:last-child{border:0}
.mission .t{flex:1}
.tag{display:inline-block;font-size:13px;font-weight:800;border-radius:99px;padding:2px 10px;background:var(--line);margin:0 4px 4px 0}
.tag.F{background:var(--okbg);color:var(--ok)}.tag.M{background:#fff1cc;color:#7a5600}.tag.D{background:var(--badbg);color:var(--bad)}
label{font-weight:800;font-size:14px;display:block;margin-bottom:4px}
select,input,textarea{width:100%;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--bg);min-height:44px}
textarea{min-height:90px;resize:vertical}
.q{font-size:18px;font-weight:600;margin:10px 0 16px}
.opt{display:flex;gap:12px;width:100%;text-align:left;background:var(--bg);border:2px solid var(--line);border-radius:14px;padding:12px 14px;margin-bottom:10px;align-items:flex-start;min-height:52px}
.opt b{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--line);font-size:14px}
.opt.sel{border-color:var(--teal)}.opt.sel b{background:var(--teal);color:#fff}
.opt.ok{border-color:var(--ok);background:var(--okbg)}.opt.ok b{background:var(--ok);color:#fff}
.opt.bad{border-color:var(--bad);background:var(--badbg)}.opt.bad b{background:var(--bad);color:#fff}
.conf{display:flex;border:2px solid var(--line);border-radius:14px;overflow:hidden}
.conf button{border:0;background:transparent;padding:10px 14px;font-weight:800;min-height:44px}
.conf button.on{background:var(--teal);color:#fff}
.fb{border-radius:16px;padding:16px;margin-top:14px}
.fb.ok{background:var(--okbg)}.fb.bad{background:var(--badbg)}
.fb .perla{margin-top:10px;padding:10px 12px;border-radius:12px;background:var(--card);font-weight:600}
.shop{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(min(100%,170px),1fr))}
.item{text-align:center}
.item svg{width:110px;height:110px}
.stat{font-size:30px;font-weight:900;line-height:1}
.hbar{display:grid;grid-template-columns:minmax(0,9em) minmax(0,1fr) 3.5em;gap:10px;align-items:center;margin:8px 0}
.hbar span:last-child{text-align:right;font-weight:800}
.logro{display:flex;gap:10px;align-items:center;padding:8px 0}
.logro .ic{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:var(--line);flex:none;font-weight:900}
.logro.got .ic{background:var(--gold);color:#2b1d00}
#toasts{position:fixed;top:66px;right:14px;left:14px;display:flex;flex-direction:column;align-items:flex-end;gap:8px;z-index:9;pointer-events:none}
.toast{background:var(--ink);color:var(--bg);padding:10px 16px;border-radius:14px;font-weight:800;box-shadow:0 6px 20px rgba(0,0,0,.25);animation:tin .3s}
@keyframes tin{from{transform:translateY(-10px);opacity:0}}
svg.mascot{width:100%;height:auto;display:block}
.hop{animation:hop .6s}
@keyframes hop{30%{transform:translateY(-14px) scale(1.04)}60%{transform:translateY(0) scale(.98)}}
@media(prefers-reduced-motion:reduce){.hop,.toast{animation:none}.bar i{transition:none}}
.sec{margin:22px 0 10px}
.kbd{font-size:13px;color:var(--mute)}
@media(min-width:900px){nav{position:fixed;top:0;bottom:auto;left:auto;right:max(calc((100vw - 1100px)/2),14px);background:transparent;border:0;height:54px}
 nav a{color:#fff;opacity:.75;flex-direction:row;align-items:center;font-size:15px;min-height:54px;padding:0 9px;flex:none}nav a.on{color:#fff;opacity:1;text-decoration:underline;text-underline-offset:6px}
 nav a svg{display:none}body{padding-bottom:20px}header{min-height:54px;padding-right:max(calc((100vw - 1100px)/2 + 580px),20px)}}
@media(max-width:640px){.hero{grid-template-columns:1fr;text-align:center}.hero .row{justify-content:center}.hero .mascot{max-width:230px;order:-1}.hide-s{display:none}}
</style>
</head>
<body>
<header>
 <div class="logo"><svg width="26" height="26" viewBox="0 0 200 200"><ellipse cx="100" cy="100" rx="90" ry="78" fill="#e11d48"/><ellipse cx="100" cy="100" rx="48" ry="36" fill="#f43f5e"/></svg>Banqueo JorG</div>
 <span class="pill" id="h-lvl">Nv 1</span>
 <span class="pill"><i class="coin"></i><span id="h-coins">0</span></span>
</header>
<nav id="nav"></nav>
<main id="view"></main>
<div id="toasts" aria-live="polite"></div>
<script src="preguntas.js"></script>
<script>
{
const KEY='banqueo-jorg-v1';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const fmt=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const today=()=>fmt(new Date());
const addDays=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return fmt(d)};
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const LET=['A','B','C','D','E'];

const def=()=>({xp:0,coins:0,name:'Hemi',ans:{},srs:{},daily:{},run:0,bestRun:0,streak:0,lastDay:'',lastAct:'',
 owned:[],equip:[],premios:[{id:'p1',nombre:'Un episodio de mi serie',costo:150},{id:'p2',nombre:'Mi postre favorito',costo:300}],
 canjes:[],custom:[],logros:[],total:0,ok:0,hardOk:0,course:{}});
let S=def();
try{const raw=localStorage.getItem(KEY);if(raw)S=Object.assign(def(),JSON.parse(raw))}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const allQ=()=>[...(window.PREGUNTAS||[]),...S.custom];

const REW={'Fácil':3,'Media':5,'Difícil':8},XPR={'Fácil':8,'Media':12,'Difícil':18};
const STAGES=[{min:1,n:'Célula madre'},{min:3,n:'Reticulocito'},{min:6,n:'Interno'},{min:10,n:'Residente'},{min:15,n:'Especialista'}];
const ACC=[{id:'lentes',n:'Lentes de lectura',c:60},{id:'mascarilla',n:'Mascarilla N95',c:80},{id:'gorro',n:'Gorro quirúrgico',c:120},{id:'medalla',n:'Medalla al mérito',c:200},{id:'corona',n:'Corona del primer puesto',c:500}];
const MIS=[
 {id:'m1',t:'Responde 10 preguntas',g:10,v:d=>d.n,r:30},
 {id:'m2',t:'Acierta 7 preguntas',g:7,v:d=>d.ok,r:40},
 {id:'m3',t:'Encadena 5 aciertos seguidos',g:5,v:d=>d.run,r:30},
 {id:'m4',t:'Banquea 2 cursos distintos',g:2,v:d=>d.courses.length,r:20},
 {id:'m5',t:'Repasa 3 preguntas pendientes',g:3,v:d=>d.rev,r:30}];
const levelInfo=xp=>{let l=1,need=100,r=xp;while(r>=need){r-=need;l++;need=100+(l-1)*25}return{l,r,need}};
const stageOf=l=>{let i=0;STAGES.forEach((s,k)=>{if(l>=s.min)i=k});return i};
const LOG=[
 {id:'l1',n:'Primera pregunta',d:'Responde tu primera pregunta',f:()=>S.total>=1},
 {id:'l2',n:'Banqueador',d:'100 preguntas respondidas',f:()=>S.total>=100},
 {id:'l3',n:'Maratonista',d:'500 preguntas respondidas',f:()=>S.total>=500},
 {id:'l4',n:'Constancia',d:'Racha de 7 días',f:()=>S.streak>=7},
 {id:'l5',n:'Imparable',d:'15 aciertos seguidos',f:()=>S.bestRun>=15},
 {id:'l6',n:'Nivel 5',d:'Llega al nivel 5',f:()=>levelInfo(S.xp).l>=5},
 {id:'l7',n:'Cazador de difíciles',d:'Acierta 10 preguntas difíciles',f:()=>S.hardOk>=10},
 {id:'l8',n:'Ojo clínico',d:'80% de aciertos con 50+ respondidas',f:()=>S.total>=50&&S.ok/S.total>=.8}];

function ensureDaily(){if(S.daily.date!==today())S.daily={date:today(),n:0,ok:0,run:0,courses:[],rev:0,claimed:[]}}
function mood(){if(!S.lastAct||S.lastAct===today())return 'feliz';if(S.lastAct===addDays(today(),-1))return 'normal';return 'triste'}
function streakNow(){return(S.lastDay===today()||S.lastDay===addDays(today(),-1))?S.streak:0}
function dueList(){const t=today();return allQ().filter(q=>S.srs[q.id]&&S.srs[q.id].due<=t).sort((a,b)=>(S.srs[b.id].danger?1:0)-(S.srs[a.id].danger?1:0))}

function toast(m){const d=document.createElement('div');d.className='toast';d.textContent=m;$('#toasts').appendChild(d);setTimeout(()=>d.remove(),3200)}
function gain(c,x){const before=levelInfo(S.xp).l;S.coins+=c;S.xp+=x;const after=levelInfo(S.xp).l;
 if(after>before){toast('¡Subiste a nivel '+after+'!');if(stageOf(after)>stageOf(before))toast('¡'+S.name+' evolucionó a '+STAGES[stageOf(after)].n+'!')}}
function checkLog(){LOG.forEach(l=>{if(!S.logros.includes(l.id)&&l.f()){S.logros.push(l.id);S.coins+=50;toast('Logro: '+l.n+' (+50)')}})}

/* ---------- Mascota ---------- */
function mascot(stage,equip,md,cls){
 const body=stage===0?'#b57edc':'#e11d48',inner=stage===0?'#8f56c4':'#f43f5e';
 const mouth=md==='feliz'?'<path d="M84 120 Q100 136 116 120" stroke="#3b0a14" stroke-width="5" fill="none" stroke-linecap="round"/>':
  md==='triste'?'<path d="M86 130 Q100 118 114 130" stroke="#3b0a14" stroke-width="5" fill="none" stroke-linecap="round"/>':
  '<path d="M88 125 H112" stroke="#3b0a14" stroke-width="5" stroke-linecap="round"/>';
 const has=id=>equip.includes(id);
 let s=`<svg class="mascot ${cls||''}" viewBox="0 0 200 200" role="img" aria-label="Mascota ${esc(S.name)}">
 <ellipse cx="100" cy="188" rx="58" ry="7" fill="rgba(0,0,0,.18)"/>
 <ellipse cx="74" cy="176" rx="14" ry="9" fill="${body}"/><ellipse cx="126" cy="176" rx="14" ry="9" fill="${body}"/>
 <ellipse cx="38" cy="118" rx="10" ry="16" fill="${body}" transform="rotate(25 38 118)"/><ellipse cx="162" cy="118" rx="10" ry="16" fill="${body}" transform="rotate(-25 162 118)"/>
 ${stage===0?`<circle cx="100" cy="108" r="60" fill="${body}"/><circle cx="100" cy="112" r="28" fill="${inner}" opacity=".55"/>`:
 `<ellipse cx="100" cy="108" rx="66" ry="60" fill="${body}"/><ellipse cx="100" cy="112" rx="36" ry="28" fill="${inner}"/>`}
 <ellipse cx="78" cy="78" rx="18" ry="8" fill="#fff" opacity=".25" transform="rotate(-25 78 78)"/>`;
 if(stage===1)s+='<circle cx="92" cy="112" r="3" fill="#9f1239"/><circle cx="108" cy="106" r="3" fill="#9f1239"/><circle cx="104" cy="120" r="3" fill="#9f1239"/>';
 if(stage>=2)s+=`<path d="M50 140 Q100 156 150 140 L160 186 H40 Z" fill="#fff" stroke="#c8d6d8" stroke-width="2"/><path d="M100 152 L86 186 M100 152 L114 186" stroke="#c8d6d8" stroke-width="3"/><rect x="122" y="160" width="18" height="12" rx="3" fill="#bae6fd"/>`;
 if(stage>=3)s+=`<path d="M70 142 Q72 176 100 176 Q128 176 130 142" stroke="#334155" stroke-width="4" fill="none"/><circle cx="100" cy="178" r="7" fill="#94a3b8" stroke="#334155" stroke-width="3"/>`;
 s+=`<circle cx="80" cy="98" r="8" fill="#1f0a10"/><circle cx="120" cy="98" r="8" fill="#1f0a10"/><circle cx="83" cy="95" r="3" fill="#fff"/><circle cx="123" cy="95" r="3" fill="#fff"/>
 <ellipse cx="66" cy="114" rx="8" ry="5" fill="#ff8fab" opacity=".7"/><ellipse cx="134" cy="114" rx="8" ry="5" fill="#ff8fab" opacity=".7"/>`;
 s+=has('mascarilla')?'<path d="M74 110 H126 Q126 136 100 138 Q74 136 74 110Z" fill="#e0f2fe" stroke="#7dd3fc" stroke-width="2"/><path d="M74 114 L52 104 M126 114 L148 104" stroke="#7dd3fc" stroke-width="2"/>':mouth;
 if(md==='triste'&&!has('mascarilla'))s+='<path d="M126 106 q4 10 0 14 q-4 -4 0 -14z" fill="#7dd3fc"/>';
 if(has('lentes'))s+='<circle cx="80" cy="98" r="15" fill="rgba(255,255,255,.15)" stroke="#111827" stroke-width="4"/><circle cx="120" cy="98" r="15" fill="rgba(255,255,255,.15)" stroke="#111827" stroke-width="4"/><path d="M95 98 H105" stroke="#111827" stroke-width="4"/>';
 if(has('medalla'))s+='<path d="M92 150 L100 162 L108 150" stroke="#2563eb" stroke-width="5" fill="none"/><circle cx="100" cy="168" r="9" fill="#f5c542" stroke="#a87400" stroke-width="2"/>';
 if(has('gorro'))s+='<path d="M46 74 Q100 8 154 74 Q100 60 46 74Z" fill="#38bdf8"/><path d="M60 64 Q100 50 140 64" stroke="#0284c7" stroke-width="2" fill="none" stroke-dasharray="4 4"/>';
 else if(stage>=4)s+='<path d="M100 58 L82 66 V78 H118 V66Z" fill="#111827"/><path d="M58 52 L100 36 L142 52 L100 68Z" fill="#1f2937"/><path d="M142 52 L146 78" stroke="#f5c542" stroke-width="3"/><circle cx="146" cy="80" r="4" fill="#f5c542"/>';
 if(has('corona'))s+='<path d="M72 50 L76 24 L90 40 L100 18 L110 40 L124 24 L128 50Z" fill="#f5c542" stroke="#a87400" stroke-width="2"/><circle cx="100" cy="40" r="4" fill="#e11d48"/>';
 return s+'</svg>';
}

/* ---------- Navegación ---------- */
const IC={inicio:'M3 11l9-8 9 8v10h-6v-6H9v6H3z',banquear:'M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4z M8 9h8 M8 13h6',repaso:'M4 12a8 8 0 0114-5l2-2v6h-6l2-2a5 5 0 10.9 6',tienda:'M4 8h16l-1 12H5z M8 8a4 4 0 018 0',progreso:'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',ajustes:'M12 8a4 4 0 100 8 4 4 0 000-8z M12 2v3 M12 19v3 M2 12h3 M19 12h3'};
const TABS=[['inicio','Inicio'],['banquear','Banquear'],['repaso','Repaso'],['tienda','Tienda'],['progreso','Progreso'],['ajustes','Ajustes']];
function renderNav(v){$('#nav').innerHTML=TABS.map(([id,n])=>`<a href="#${id}" class="${v===id?'on':''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${IC[id]}"/></svg>${n}</a>`).join('')}
function header(){const li=levelInfo(S.xp);$('#h-lvl').textContent='Nv '+li.l;$('#h-coins').textContent=S.coins}

let Q=null; // sesión de preguntas activa
function route(){const v=(location.hash||'#inicio').slice(1);const view=VIEWS[v]?v:'inicio';ensureDaily();renderNav(view);header();
 VIEWS[view]();window.scrollTo(0,0)}

/* ---------- Inicio ---------- */
function vInicio(){
 const li=levelInfo(S.xp),st=stageOf(li.l),md=mood(),d=S.daily,due=dueList().length;
 const msg={feliz:'¡Listo para seguir sumando! Cada pregunta me hace crecer.',normal:'Ayer no banqueamos… ¿empezamos con unas cuantas?',triste:'Te extrañé. Diez preguntas hoy y vuelvo a sonreír.'}[md];
 const allDone=MIS.every(m=>d.claimed.includes(m.id));
 $('#view').innerHTML=`
 <section class="hero">
  <div><div class="small" style="opacity:.85;font-weight:800">${STAGES[st].n} · Nivel ${li.l}</div>
   <h1>${esc(S.name)}</h1><p>${msg}</p>
   <div class="bar" aria-label="Experiencia"><i style="width:${li.r/li.need*100}%"></i></div>
   <p class="small">${li.r} / ${li.need} XP para el nivel ${li.l+1}${st<4?' · evoluciona en el nivel '+STAGES[st+1].min:''}</p>
   <div class="row"><a class="btn gold" href="#banquear" style="text-decoration:none">Banquear ahora</a>
   <a class="btn alt" href="#repaso" style="text-decoration:none;color:#fff">Repaso (${due})</a></div></div>
  ${mascot(st,S.equip,md)}
 </section>
 <div class="grid">
  <div class="card"><h2>Misiones de hoy</h2>
   ${MIS.map(m=>{const v=Math.min(m.v(d),m.g),done=v>=m.g,cl=d.claimed.includes(m.id);
    return `<div class="mission"><div class="t"><b>${m.t}</b><div class="bar" style="margin-top:6px"><i style="width:${v/m.g*100}%"></i></div><span class="small mute">${v}/${m.g} · +${m.r} monedas</span></div>
    <button class="btn ${cl?'alt':'gold'}" data-claim="${m.id}" ${!done||cl?'disabled':''}>${cl?'Hecho':'Reclamar'}</button></div>`}).join('')}
   <div class="mission"><div class="t"><b>Cofre del día</b><br><span class="small mute">Completa todas las misiones · +60 monedas</span></div>
   <button class="btn gold" data-claim="all" ${!allDone||d.claimed.includes('all')?'disabled':''}>${d.claimed.includes('all')?'Abierto':'Abrir'}</button></div>
  </div>
  <div class="card"><h2>Tu día</h2>
   <div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;text-align:center">
    <div><div class="stat">${d.n}</div><span class="small mute">respondidas</span></div>
    <div><div class="stat">${d.n?Math.round(d.ok/d.n*100):0}%</div><span class="small mute">aciertos</span></div>
    <div><div class="stat">${streakNow()}</div><span class="small mute">días de racha</span></div></div>
   <p class="small mute" style="margin-top:14px">La racha suma un día cuando respondes 10 preguntas. Pendientes de repaso: <b>${due}</b>. Banco disponible: <b>${allQ().length}</b> preguntas.</p>
   <h3 class="sec">Cómo ganas</h3>
   <p class="small">Acierto fácil +3, media +5, difícil +8 monedas. Si marcas <b>“Seguro”</b> y aciertas, ganas ×1.5; si fallas estando seguro, la pregunta va primero a tu repaso como <b>error peligroso</b>. Cada 5 aciertos seguidos: +10.</p>
  </div>
 </div>`;
 document.querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>{const id=b.dataset.claim;if(S.daily.claimed.includes(id))return;
  S.daily.claimed.push(id);const r=id==='all'?60:MIS.find(m=>m.id===id).r;gain(r,10);toast('+'+r+' monedas');checkLog();save();route()});
}

/* ---------- Banquear ---------- */
function vBanquear(){if(Q&&!Q.finished)return renderQuiz();if(Q&&Q.finished)return renderResults();
 const qs=allQ(),cursos=[...new Set(qs.map(q=>q.curso))].sort();
 $('#view').innerHTML=`<div class="card" style="max-width:720px;margin:auto"><h1>Arma tu banqueo</h1>
 <p class="mute">Elige qué quieres practicar. ${qs.length} preguntas en el banco.</p>
 <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))">
  <div><label for="f-ex">Examen</label><select id="f-ex"><option value="">Todos</option><option>ENAM</option><option>RM</option><option>Preinternado</option></select></div>
  <div><label for="f-cu">Curso</label><select id="f-cu"><option value="">Todos</option>${cursos.map(c=>`<option>${esc(c)}</option>`).join('')}</select></div>
  <div><label for="f-di">Dificultad</label><select id="f-di"><option value="">Todas</option><option>Fácil</option><option>Media</option><option>Difícil</option></select></div>
  <div><label for="f-st">Estado</label><select id="f-st"><option value="">Todas</option><option value="new">No vistas</option><option value="bad">Falladas alguna vez</option></select></div>
  <div><label for="f-n">Cantidad</label><select id="f-n"><option>10</option><option>20</option><option>50</option><option value="9999">Todas</option></select></div>
  <div><label for="f-mo">Modo</label><select id="f-mo"><option value="practica">Práctica (explicación al instante)</option><option value="simulacro">Simulacro (cronometrado)</option></select></div>
 </div>
 <p class="small mute" id="f-count"></p>
 <button class="btn" id="go" style="width:100%">Empezar</button></div>`;
 const pool=()=>{const ex=$('#f-ex').value,cu=$('#f-cu').value,di=$('#f-di').value,st=$('#f-st').value;
  return qs.filter(q=>(!ex||(q.examen||[]).includes(ex))&&(!cu||q.curso===cu)&&(!di||q.dificultad===di)&&
   (!st||(st==='new'?!S.ans[q.id]:(S.ans[q.id]&&S.ans[q.id].ok<S.ans[q.id].n))))};
 const upd=()=>{const n=pool().length;$('#f-count').textContent=n+' preguntas coinciden';$('#go').disabled=!n};
 ['f-ex','f-cu','f-di','f-st'].forEach(id=>$('#'+id).onchange=upd);upd();
 $('#go').onclick=()=>startQuiz(shuffle(pool()).slice(0,+$('#f-n').value),$('#f-mo').value);
}
function startQuiz(list,mode){if(!list.length)return;if(Q)clearInterval(Q.tick);Q={list,mode,i:0,sel:null,conf:'dudo',shown:false,res:[],coins0:S.coins,xp0:S.xp,finished:false};
 if(mode==='simulacro'){Q.end=Date.now()+list.length*72000;Q.tick=setInterval(()=>{const t=$('#timer');if(!t)return;const left=Q.end-Date.now();if(left<=0){finishQuiz()}else t.textContent=clock(left)},1000)}
 location.hash='#banquear';route()}
const clock=ms=>{const s=Math.ceil(ms/1000);return Math.floor(s/60)+':'+pad(s%60)};
function renderQuiz(){const q=Q.list[Q.i],sim=Q.mode==='simulacro',dc=(q.dificultad||'M')[0];
 $('#view').innerHTML=`<div class="card" style="max-width:780px;margin:auto">
 <div class="row" style="justify-content:space-between"><b>${Q.mode==='repaso'?'Repaso':sim?'Simulacro':'Práctica'} · ${Q.i+1}/${Q.list.length}</b>
 ${sim?`<span class="pill" style="background:var(--line)" id="timer">${clock(Q.end-Date.now())}</span>`:''}
 <button class="btn alt" id="quit" style="min-height:38px;padding:6px 12px">Terminar</button></div>
 <div class="bar" style="margin:10px 0"><i style="width:${Q.i/Q.list.length*100}%"></i></div>
 <span class="tag">${esc(q.curso)}</span><span class="tag ${dc}">${esc(q.dificultad)}</span>${(q.examen||[]).map(e=>`<span class="tag">${esc(e)}</span>`).join('')}${S.srs[q.id]&&S.srs[q.id].danger?'<span class="tag D">Error peligroso</span>':''}
 <div class="q">${esc(q.enunciado)}</div>
 <div id="opts">${LET.filter(l=>q.opciones[l]).map(l=>`<button class="opt" data-l="${l}"><b>${l}</b><span>${esc(q.opciones[l])}</span></button>`).join('')}</div>
 <div class="row" style="justify-content:space-between;margin-top:6px" id="ctl">
  <div class="conf" role="group" aria-label="Confianza"><button data-c="dudo" class="on">Dudo</button><button data-c="seguro">Seguro</button></div>
  <button class="btn" id="ok" disabled>${sim?'Responder':'Confirmar'}</button></div>
 <div id="fb"></div><p class="kbd hide-s">Atajos: A–E o 1–5 para elegir · S para “Seguro” · Enter para confirmar / siguiente</p></div>`;
 Q.sel=null;Q.conf='dudo';Q.shown=false;
 document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>pick(b.dataset.l));
 document.querySelectorAll('.conf button').forEach(b=>b.onclick=()=>setConf(b.dataset.c));
 $('#ok').onclick=doConfirm;$('#quit').onclick=finishQuiz;
}
function pick(l){if(Q.shown||!Q.list[Q.i].opciones[l])return;Q.sel=l;document.querySelectorAll('.opt').forEach(b=>b.classList.toggle('sel',b.dataset.l===l));$('#ok').disabled=false}
function setConf(c){if(Q.shown)return;Q.conf=c;document.querySelectorAll('.conf button').forEach(b=>b.classList.toggle('on',b.dataset.c===c))}
function doConfirm(){if(!Q.sel)return;if(Q.shown)return next();const q=Q.list[Q.i],ok=Q.sel===q.correcta;
 record(q,Q.sel,Q.conf,Q.mode);Q.res.push({q,sel:Q.sel,ok,conf:Q.conf});
 if(Q.mode==='simulacro')return next();
 Q.shown=true;document.querySelectorAll('.opt').forEach(b=>{if(b.dataset.l===q.correcta)b.classList.add('ok');else if(b.dataset.l===Q.sel)b.classList.add('bad')});
 $('#fb').innerHTML=fbHtml(q,ok,Q.conf);$('#ok').textContent=Q.i+1<Q.list.length?'Siguiente':'Ver resultados';
 document.querySelector('.conf').style.visibility='hidden';header();$('#fb').scrollIntoView({behavior:'smooth',block:'nearest'})}
function fbHtml(q,ok,conf){return `<div class="fb ${ok?'ok':'bad'}"><h3>${ok?'¡Correcto!':'Incorrecto · la respuesta es '+q.correcta}${ok&&conf==='seguro'?' · bono de seguridad ×1.5':''}${!ok&&conf==='seguro'?' · error peligroso, irá primero a tu repaso':''}</h3>
 <div>${esc(q.explicacion)}</div>${q.perla?`<div class="perla">Perla: ${esc(q.perla)}</div>`:''}${q.fuente?`<p class="small mute" style="margin:8px 0 0">Fuente: ${esc(q.fuente)}</p>`:''}</div>`}
function next(){if(Q.i+1<Q.list.length){Q.i++;renderQuiz()}else finishQuiz()}
function finishQuiz(){if(!Q)return;clearInterval(Q.tick);if(!Q.res.length){Q=null;return route()}Q.finished=true;save();location.hash='#banquear';route()}
function renderResults(){const n=Q.res.length,ok=Q.res.filter(r=>r.ok).length,pct=Math.round(ok/n*100),md=pct>=70?'feliz':pct>=40?'normal':'triste';
 $('#view').innerHTML=`<div class="card" style="max-width:780px;margin:auto">
 <div class="row" style="gap:18px"><div style="width:140px">${mascot(stageOf(levelInfo(S.xp).l),S.equip,md,'hop')}</div>
 <div><h1>${ok}/${n} correctas · ${pct}%</h1><p class="mute">+${S.coins-Q.coins0} monedas · +${S.xp-Q.xp0} XP${n-ok?' · '+(n-ok)+' preguntas pasan a tu repaso':''}</p>
 <div class="row"><button class="btn" id="again">Nuevo banqueo</button><a class="btn alt" href="#inicio" style="text-decoration:none">Ver misiones</a></div></div></div>
 <h2 class="sec">Revisión</h2>${Q.res.map((r,i)=>`<details ${!r.ok&&Q.mode==='simulacro'?'open':''} style="border-top:1px solid var(--line);padding:10px 0"><summary><b style="color:${r.ok?'var(--ok)':'var(--bad)'}">${r.ok?'✓':'✗'}</b> ${i+1}. ${esc(r.q.enunciado.slice(0,90))}${r.q.enunciado.length>90?'…':''}</summary>
 <p class="small">Tu respuesta: <b>${r.sel}</b> · Correcta: <b>${r.q.correcta}) ${esc(r.q.opciones[r.q.correcta])}</b></p>${fbHtml(r.q,r.ok,r.conf)}</details>`).join('')}</div>`;
 $('#again').onclick=()=>{Q=null;route()}}

function record(q,sel,conf,mode){ensureDaily();const d=S.daily,ok=sel===q.correcta,t=today();
 S.total++;d.n++;const c=S.course[q.curso]||(S.course[q.curso]={n:0,ok:0});c.n++;
 if(!d.courses.includes(q.curso))d.courses.push(q.curso);
 const a=S.ans[q.id]||{n:0,ok:0};a.n++;a.last=ok;S.ans[q.id]=a;
 if(ok){S.ok++;d.ok++;c.ok++;a.ok++;S.run++;S.bestRun=Math.max(S.bestRun,S.run);d.run=Math.max(d.run,S.run);if(q.dificultad==='Difícil')S.hardOk++;
  let coins=REW[q.dificultad]||5;if(conf==='seguro')coins=Math.round(coins*1.5);gain(coins,XPR[q.dificultad]||12);
  if(S.run%5===0){S.coins+=10;toast(S.run+' aciertos seguidos · +10')}}
 else{S.run=0;gain(0,3)}
 const s=S.srs[q.id];
 if(mode==='repaso'&&s){d.rev++;if(ok){s.box++;if(s.box>=4)delete S.srs[q.id];else{s.due=addDays(t,[1,3,7,15][s.box]);s.danger=false}}else{s.box=0;s.due=addDays(t,1);s.danger=s.danger||conf==='seguro'}}
 else if(!ok)S.srs[q.id]={box:0,due:t,danger:conf==='seguro'};
 if(d.n===10){if(S.lastDay===addDays(t,-1))S.streak++;else if(S.lastDay!==t)S.streak=1;S.lastDay=t;toast('Racha: '+S.streak+' día'+(S.streak>1?'s':''))}
 S.lastAct=t;checkLog();save()}

/* ---------- Repaso ---------- */
function vRepaso(){if(Q&&Q.mode==='repaso'&&!Q.finished){location.hash='#banquear';return}
 const due=dueList(),all=Object.keys(S.srs).length,danger=due.filter(q=>S.srs[q.id].danger).length;
 $('#view').innerHTML=`<div class="card" style="max-width:720px;margin:auto"><h1>Repaso espaciado</h1>
 <p>Las preguntas que fallas vuelven hoy, y luego a los 1, 3, 7 y 15 días cada vez que las aciertas. Al acertarlas 4 veces seguidas, salen del repaso.</p>
 <div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr));text-align:center;margin:16px 0">
  <div><div class="stat">${due.length}</div><span class="small mute">para hoy</span></div>
  <div><div class="stat" style="color:var(--bad)">${danger}</div><span class="small mute">errores peligrosos</span></div>
  <div><div class="stat">${all}</div><span class="small mute">en seguimiento</span></div></div>
 <button class="btn" id="rgo" style="width:100%" ${due.length?'':'disabled'}>${due.length?'Repasar ahora':'Nada pendiente por hoy'}</button>
 ${due.length?`<h3 class="sec">Pendientes</h3>${due.map(q=>`<div class="mission"><div class="t">${esc(q.enunciado.slice(0,100))}…<br><span class="tag">${esc(q.curso)}</span>${S.srs[q.id].danger?'<span class="tag D">Peligroso</span>':''}</div></div>`).join('')}`:''}</div>`;
 $('#rgo').onclick=()=>startQuiz(due,'repaso')}

/* ---------- Tienda ---------- */
function vTienda(){const li=levelInfo(S.xp),st=stageOf(li.l);
 $('#view').innerHTML=`<h1>Tienda</h1><p class="mute">Tienes <b><i class="coin"></i> ${S.coins}</b> monedas.</p>
 <h2 class="sec">Mis premios</h2><p class="small mute">Premios reales que tú defines y te das al canjearlos.</p>
 <div class="grid">${S.premios.map(p=>`<div class="card"><h3>${esc(p.nombre)}</h3><p class="row"><i class="coin"></i><b>${p.costo}</b></p>
  <div class="row"><button class="btn gold" data-buy="${p.id}" ${S.coins<p.costo?'disabled':''}>Canjear</button><button class="btn alt" data-del="${p.id}">Quitar</button></div></div>`).join('')}
  <form class="card" id="padd"><h3>Nuevo premio</h3><label for="pn">Nombre</label><input id="pn" required placeholder="Ej.: Salida al cine">
  <label for="pc" style="margin-top:8px">Costo en monedas</label><input id="pc" type="number" min="1" required value="200"><button class="btn" style="margin-top:10px">Agregar</button></form></div>
 ${S.canjes.length?`<h3 class="sec">Historial de canjes</h3>${S.canjes.slice(-10).reverse().map(c=>`<div class="small">${c.fecha} · ${esc(c.nombre)} · ${c.costo}</div>`).join('')}`:''}
 <h2 class="sec">Accesorios para ${esc(S.name)}</h2>
 <div class="shop">${ACC.map(a=>{const own=S.owned.includes(a.id),on=S.equip.includes(a.id);
  return `<div class="card item">${mascot(st,[a.id],'feliz')}<h3>${a.n}</h3>${own?`<button class="btn ${on?'':'alt'}" data-eq="${a.id}">${on?'Puesto':'Ponérselo'}</button>`:
  `<button class="btn gold" data-acc="${a.id}" ${S.coins<a.c?'disabled':''}><i class="coin"></i> ${a.c}</button>`}</div>`}).join('')}</div>
 <div id="confirmBox"></div>`;
 document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{const p=S.premios.find(x=>x.id===b.dataset.buy);
  $('#confirmBox').innerHTML=`<div class="card" style="position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);z-index:10;width:min(92vw,380px);box-shadow:0 20px 60px rgba(0,0,0,.35)"><h3>¿Canjear “${esc(p.nombre)}” por ${p.costo} monedas?</h3><div class="row"><button class="btn gold" id="cy">Sí, canjear</button><button class="btn alt" id="cn">Cancelar</button></div></div>`;
  $('#cn').onclick=()=>$('#confirmBox').innerHTML='';$('#cy').onclick=()=>{S.coins-=p.costo;S.canjes.push({nombre:p.nombre,costo:p.costo,fecha:today()});save();toast('¡Disfruta: '+p.nombre+'!');route()}});
 document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{S.premios=S.premios.filter(x=>x.id!==b.dataset.del);save();route()});
 $('#padd').onsubmit=e=>{e.preventDefault();S.premios.push({id:'p'+Date.now(),nombre:$('#pn').value.trim(),costo:Math.max(1,+$('#pc').value)});save();route()};
 document.querySelectorAll('[data-acc]').forEach(b=>b.onclick=()=>{const a=ACC.find(x=>x.id===b.dataset.acc);if(S.coins<a.c)return;S.coins-=a.c;S.owned.push(a.id);S.equip.push(a.id);save();toast(S.name+' estrena '+a.n.toLowerCase());route()});
 document.querySelectorAll('[data-eq]').forEach(b=>b.onclick=()=>{const id=b.dataset.eq;S.equip=S.equip.includes(id)?S.equip.filter(x=>x!==id):[...S.equip,id];save();route()});
}

/* ---------- Progreso ---------- */
function vProgreso(){const cs=Object.entries(S.course).sort((a,b)=>b[1].n-a[1].n);
 $('#view').innerHTML=`<h1>Progreso</h1><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr))">
 ${[[S.total,'respondidas'],[S.total?Math.round(S.ok/S.total*100)+'%':'—','aciertos totales'],[S.bestRun,'mejor racha de aciertos'],[streakNow(),'días de racha'],[S.canjes.length,'premios canjeados']].map(([v,l])=>`<div class="card"><div class="stat">${v}</div><span class="small mute">${l}</span></div>`).join('')}</div>
 <div class="grid" style="margin-top:14px"><div class="card"><h2>Aciertos por curso</h2>${cs.length?cs.map(([c,v])=>{const p=Math.round(v.ok/v.n*100);
  return `<div class="hbar"><span class="small"><b>${esc(c)}</b><br><span class="mute">${v.n} resp.</span></span><div class="bar"><i style="width:${p}%;background:${p>=70?'var(--ok)':p>=50?'var(--gold)':'var(--bad)'}"></i></div><span>${p}%</span></div>`}).join(''):'<p class="mute">Aún no hay datos. Banquea unas preguntas y aquí verás tus fortalezas y debilidades.</p>'}</div>
 <div class="card"><h2>Logros</h2>${LOG.map(l=>{const g=S.logros.includes(l.id);return `<div class="logro ${g?'got':''}"><div class="ic">${g?'★':'·'}</div><div><b>${l.n}</b><br><span class="small mute">${l.d}${g?'':' · +50 monedas'}</span></div></div>`}).join('')}</div></div>`}

/* ---------- Ajustes ---------- */
function vAjustes(){
 $('#view').innerHTML=`<h1>Ajustes</h1><div class="grid">
 <form class="card" id="fname"><h2>Tu mascota</h2><label for="mn">Nombre</label><input id="mn" value="${esc(S.name)}" maxlength="20"><button class="btn" style="margin-top:10px">Guardar</button></form>
 <div class="card"><h2>Copia de seguridad</h2><p class="small mute">Tu progreso vive en este navegador. Copia este texto para guardarlo o pasarlo a otro dispositivo, y pégalo abajo para restaurarlo.</p>
  <textarea id="bk" readonly>${esc(JSON.stringify(S))}</textarea><button class="btn alt" id="cp" style="margin-top:8px">Copiar</button>
  <label for="imp" style="margin-top:12px">Restaurar</label><textarea id="imp" placeholder="Pega aquí tu copia"></textarea><button class="btn" id="doimp" style="margin-top:8px">Restaurar progreso</button></div></div>
 <form class="card" id="fq" style="margin-top:14px"><h2>Agregar pregunta propia</h2><p class="small mute">Se guarda en este navegador. Para que quede en el banco oficial, pásamela en el chat.</p>
 <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))">
  <div><label>Examen</label><div class="row">${['ENAM','RM','Preinternado'].map(e=>`<label style="font-weight:600;display:flex;gap:6px;align-items:center"><input type="checkbox" name="ex" value="${e}" style="width:20px;min-height:20px" checked>${e}</label>`).join('')}</div></div>
  <div><label for="qc">Curso</label><input id="qc" required list="cursos"><datalist id="cursos">${[...new Set(allQ().map(q=>q.curso))].map(c=>`<option value="${esc(c)}">`).join('')}</datalist></div>
  <div><label for="qt">Tema</label><input id="qt"></div>
  <div><label for="qd">Dificultad</label><select id="qd"><option>Fácil</option><option selected>Media</option><option>Difícil</option></select></div></div>
 <label for="qe" style="margin-top:10px">Enunciado</label><textarea id="qe" required></textarea>
 ${LET.map(l=>`<label for="q${l}" style="margin-top:8px">Opción ${l}</label><input id="q${l}" ${l<'E'?'required':''}>`).join('')}
 <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));margin-top:8px"><div><label for="qk">Clave correcta</label><select id="qk">${LET.map(l=>`<option>${l}</option>`).join('')}</select></div><div><label for="qf">Fuente</label><input id="qf" placeholder="Ej.: ENAM 2024"></div></div>
 <label for="qx" style="margin-top:8px">Explicación</label><textarea id="qx" required></textarea>
 <label for="qp" style="margin-top:8px">Perla (opcional)</label><input id="qp">
 <button class="btn" style="margin-top:12px">Guardar pregunta</button>
 ${S.custom.length?`<p class="small mute" style="margin-top:12px">Tienes ${S.custom.length} pregunta(s) propias. <button type="button" class="btn alt" id="cpq" style="min-height:36px;padding:4px 10px">Copiar para enviar a Claude</button></p>`:''}</form>
 <div class="card" style="margin-top:14px"><h2>Zona peligrosa</h2><button class="btn red" id="rst">Borrar todo mi progreso</button><div id="rstc"></div></div>`;
 $('#fname').onsubmit=e=>{e.preventDefault();S.name=$('#mn').value.trim()||'Hemi';save();toast('Ahora se llama '+S.name)};
 const copy=(txt)=>{try{navigator.clipboard.writeText(txt).then(()=>toast('Copiado'),()=>toast('Selecciona y copia manualmente'))}catch(e){toast('Selecciona y copia manualmente')}};
 $('#cp').onclick=()=>copy($('#bk').value);
 $('#doimp').onclick=()=>{try{const o=JSON.parse($('#imp').value);if(typeof o!=='object'||o.xp===undefined)throw 0;S=Object.assign(def(),o);save();toast('Progreso restaurado');route()}catch(e){toast('Ese texto no es una copia válida')}};
 $('#fq').onsubmit=e=>{e.preventDefault();const op={};LET.forEach(l=>{const v=$('#q'+l).value.trim();if(v)op[l]=v});
  if(!op[$('#qk').value]){toast('La clave elegida no tiene texto');return}
  S.custom.push({id:'u'+Date.now(),examen:[...document.querySelectorAll('input[name=ex]:checked')].map(x=>x.value),curso:$('#qc').value.trim(),tema:$('#qt').value.trim(),dificultad:$('#qd').value,
   enunciado:$('#qe').value.trim(),opciones:op,correcta:$('#qk').value,explicacion:$('#qx').value.trim(),perla:$('#qp').value.trim(),fuente:$('#qf').value.trim()||'Propia'});save();toast('Pregunta guardada');route()};
 if($('#cpq'))$('#cpq').onclick=()=>copy(JSON.stringify(S.custom,null,1));
 $('#rst').onclick=()=>{$('#rstc').innerHTML='<p>Se perderán nivel, monedas, misiones y repaso. ¿Seguro?</p><button class="btn red" id="rsy">Sí, borrar</button>';$('#rsy').onclick=()=>{const keep=S.custom;S=def();S.custom=keep;save();toast('Progreso reiniciado');location.hash='#inicio';route()}};
}

const VIEWS={inicio:vInicio,banquear:vBanquear,repaso:vRepaso,tienda:vTienda,progreso:vProgreso,ajustes:vAjustes};
window.addEventListener('hashchange',route);
document.addEventListener('keydown',e=>{if(!Q||Q.finished||!$('#opts')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const k=e.key.toUpperCase();
 if(LET.includes(k))pick(k);else if('12345'.includes(k)&&k)pick(LET[+k-1]);else if(k==='S')setConf(Q.conf==='seguro'?'dudo':'seguro');else if(e.key==='Enter'){e.preventDefault();if(Q.sel)doConfirm()}});
route();
}
</script>
</body>
</html>
```

### 6.2 `D:\App de banqueo JorG\preguntas.js`

```js
// =====================================================================
//  BANCO DE PREGUNTAS — Banqueo JorG
//  Cada pregunta sigue este formato. Las marcadas con ejemplo:true son
//  de demostración y se pueden borrar cuando empiecen a llegar las tuyas.
//  examen: cualquier combinación de "ENAM", "RM", "Preinternado"
//  dificultad: "Fácil" | "Media" | "Difícil"
// =====================================================================
window.PREGUNTAS = [
  {
    id: "ej-001", ejemplo: true,
    examen: ["ENAM", "Preinternado"], curso: "Pediatría", tema: "Exantemas virales",
    dificultad: "Fácil",
    enunciado: "Lactante de 10 meses con fiebre de 39.5 °C durante 3 días, en buen estado general. Al desaparecer la fiebre aparece un exantema maculopapular rosado que inicia en el tronco. ¿Cuál es el agente etiológico más probable?",
    opciones: {
      A: "Parvovirus B19",
      B: "Herpesvirus humano 6",
      C: "Virus del sarampión",
      D: "Streptococcus pyogenes",
      E: "Virus de la rubéola"
    },
    correcta: "B",
    explicacion: "Es el exantema súbito (roséola infantum), típico entre los 6 meses y 2 años. La clave es la secuencia: fiebre alta por 3–5 días con buen estado general y, cuando cae la fiebre, aparece el exantema en tronco que se extiende a cuello y extremidades. Parvovirus B19 da 'mejillas abofeteadas'; el sarampión tiene exantema CON fiebre, pródromo catarral y manchas de Koplik; la escarlatina da exantema en 'lija' con líneas de Pastia; la rubéola, adenopatías retroauriculares y occipitales.",
    perla: "La complicación más frecuente del exantema súbito es la convulsión febril.",
    fuente: "Pregunta de ejemplo"
  },
  {
    id: "ej-002", ejemplo: true,
    examen: ["ENAM", "RM", "Preinternado"], curso: "Ginecología y Obstetricia", tema: "Preeclampsia",
    dificultad: "Fácil",
    enunciado: "Gestante de 34 semanas con PA 165/110 mmHg, cefalea intensa y proteinuria. ¿Cuál es el fármaco de elección para prevenir las convulsiones?",
    opciones: {
      A: "Diazepam",
      B: "Fenitoína",
      C: "Sulfato de magnesio",
      D: "Nifedipino",
      E: "Labetalol"
    },
    correcta: "C",
    explicacion: "En preeclampsia con signos de severidad, el sulfato de magnesio es el fármaco de elección para prevenir y tratar la eclampsia; ha demostrado ser superior al diazepam y a la fenitoína. El nifedipino y el labetalol sirven para controlar la presión arterial, pero no previenen las convulsiones.",
    perla: "El primer signo de toxicidad por magnesio es la pérdida del reflejo rotuliano; el antídoto es el gluconato de calcio.",
    fuente: "Pregunta de ejemplo"
  },
  {
    id: "ej-003", ejemplo: true,
    examen: ["ENAM", "RM"], curso: "Medicina Interna", tema: "Trastornos del potasio",
    dificultad: "Media",
    enunciado: "Paciente con enfermedad renal crónica, potasio sérico de 7.2 mEq/L y ECG con ondas T picudas y QRS ensanchado. ¿Cuál es la primera medida terapéutica?",
    opciones: {
      A: "Insulina regular más dextrosa",
      B: "Gluconato de calcio endovenoso",
      C: "Salbutamol nebulizado",
      D: "Bicarbonato de sodio",
      E: "Furosemida endovenosa"
    },
    correcta: "B",
    explicacion: "Con cambios en el ECG, lo primero es estabilizar la membrana del miocardio con gluconato de calcio EV: actúa en minutos aunque NO baja el potasio. Después se redistribuye el potasio hacia la célula (insulina con glucosa, β2 agonistas) y finalmente se elimina del cuerpo (diuréticos, resinas, diálisis).",
    perla: "Orden mental: Estabilizar → Redistribuir → Eliminar.",
    fuente: "Pregunta de ejemplo"
  },
  {
    id: "ej-004", ejemplo: true,
    examen: ["ENAM", "Preinternado"], curso: "Cirugía General", tema: "Patología biliar",
    dificultad: "Fácil",
    enunciado: "Mujer de 45 años con dolor en hipocondrio derecho de 12 horas, fiebre y signo de Murphy positivo. ¿Cuál es el examen de imagen inicial?",
    opciones: {
      A: "Tomografía abdominal",
      B: "Ecografía abdominal",
      C: "CPRE",
      D: "Colangiorresonancia",
      E: "Gammagrafía HIDA"
    },
    correcta: "B",
    explicacion: "La ecografía es el examen de primera línea ante sospecha de colecistitis aguda: muestra cálculos, engrosamiento de la pared (>4 mm), líquido perivesicular y Murphy ecográfico. La gammagrafía HIDA es la más sensible y específica, pero no es el examen inicial. La CPRE es diagnóstica y terapéutica para coledocolitiasis, no para colecistitis.",
    perla: "Dolor en HCD + fiebre + Murphy = colecistitis hasta demostrar lo contrario.",
    fuente: "Pregunta de ejemplo"
  },
  {
    id: "ej-005", ejemplo: true,
    examen: ["ENAM", "RM", "Preinternado"], curso: "Salud Pública", tema: "Pruebas diagnósticas",
    dificultad: "Fácil",
    enunciado: "La sensibilidad de una prueba diagnóstica se define como:",
    opciones: {
      A: "La proporción de sanos que tienen una prueba negativa",
      B: "La proporción de enfermos que tienen una prueba positiva",
      C: "La probabilidad de estar enfermo si la prueba es positiva",
      D: "La probabilidad de estar sano si la prueba es negativa",
      E: "La proporción de resultados correctos entre todos los evaluados"
    },
    correcta: "B",
    explicacion: "Sensibilidad = verdaderos positivos / total de enfermos. La opción A es la especificidad, la C el valor predictivo positivo, la D el valor predictivo negativo y la E la exactitud.",
    perla: "SnNout: una prueba muy sensible con resultado negativo descarta. SpPin: una muy específica con resultado positivo confirma.",
    fuente: "Pregunta de ejemplo"
  },
  {
    id: "ej-006", ejemplo: true,
    examen: ["ENAM", "RM"], curso: "Infectología", tema: "ITS",
    dificultad: "Media",
    enunciado: "Adulto con chancro indoloro en el surco balanoprepucial y VDRL reactivo, sin alergias. ¿Cuál es el tratamiento de elección?",
    opciones: {
      A: "Penicilina G benzatínica 2.4 millones UI IM, dosis única",
      B: "Ceftriaxona 250 mg IM, dosis única",
      C: "Doxiciclina 100 mg VO cada 12 h por 7 días",
      D: "Azitromicina 1 g VO, dosis única",
      E: "Penicilina G cristalina EV por 14 días"
    },
    correcta: "A",
    explicacion: "En la sífilis temprana (primaria, secundaria y latente precoz) el tratamiento es penicilina G benzatínica 2.4 millones UI IM en dosis única. La sífilis latente tardía requiere 3 dosis semanales; la neurosífilis, penicilina G cristalina EV por 10–14 días. La doxiciclina es alternativa en alérgicos (14 días). La ceftriaxona IM es tratamiento de gonorrea.",
    perla: "Si a las horas del tratamiento aparecen fiebre, malestar y mialgias, piensa en la reacción de Jarisch-Herxheimer.",
    fuente: "Pregunta de ejemplo"
  }
];
```

---

## 7. Plan de trabajo en Claude Code

Acordado el 24 de noviembre de 2026. Se marca cada fase al terminarla.

- [x] **Fase 0: estructura base y entorno.** Repositorio, versión 1 exacta (md5 verificado), `.gitattributes` (LF), `.editorconfig`, `.gitignore`, `package.json` con `npm run dev` (servidor sin dependencias) y `README.md`.
- [x] **Fase 1: pruebas y validador.** 191 pruebas con Playwright por `http://` y por `file://`: las 6 vistas, teclado, filtros, simulacro con reloj simulado, reglas (XP, monedas, confianza, repaso, racha, misiones y logros), tienda, ajustes, y el banco real completo. 3 errores conocidos marcados con `test.fail`. Capturas a 390 y 1280 px, modo oscuro y las 5 etapas (la etapa 4 se revisó y se ve bien). Validador `npm run validar` y plantilla en `preguntas.js` (adelantados de la fase 4).
- [ ] **Fase 2: reestructura.** Separar en `css/` y `js/` con scripts clásicos y formato legible, sin cambiar el comportamiento: las pruebas de la fase 1 deben seguir pasando. El guardado queda aislado en `js/estado.js` para poder llevarlo a la nube en la fase 5.
- [ ] **Fase 3: errores conocidos y Cuaderno de errores.** Corregir los 10 errores de la sección 5, cada uno con su prueba. Reemplazar "Agregar pregunta propia" por el Cuaderno de errores (sección 3.14).
- [ ] **Fase 4: diseño de Hemi y progresión.** Aspecto por etapa, número y nombres de las etapas, curva de XP, logros, accesorios y desbloqueos, según el diseño de Jorge. Calibrar los valores numéricos.
- [ ] **Fase 5: cuentas y sincronización.** Registro e inicio de sesión (usuario, correo, contraseña y recuperación de contraseña). Progreso, premios y cuaderno guardados por usuario en la nube, con reglas que impiden ver o cambiar datos ajenos. Que funcione sin conexión y sincronice al volver la conexión. Pasar el progreso local existente a la cuenta. Las preguntas siguen en el repositorio. Consecuencias técnicas: la librería del proveedor se incluye como archivo local (sin CDN), y el artifact de claude.ai, que bloquea conexiones a otros dominios, queda solo como vista previa sin cuentas.
- [ ] **Fase 6: contenido real.** Preguntas de Jorge (pueden cargarse en paralelo desde ya), premios por defecto, borrar las preguntas de ejemplo y calibrar el simulacro con la duración real de los exámenes.
- [ ] **Fase 7: publicación.** Dirección pública (Cloudflare Pages o Netlify desde el repositorio privado), app instalable (ícono, pantalla completa, uso sin conexión), aviso de privacidad y términos, y dominio propio opcional.
