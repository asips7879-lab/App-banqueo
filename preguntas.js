// =====================================================================
//  BANCO DE PREGUNTAS — Banqueo JorG
//
//  Las marcadas con ejemplo:true son de demostración: bórralas cuando
//  empiecen a llegar las tuyas.
//
//  PARA AGREGAR UNA PREGUNTA: copia la plantilla de abajo (sin las //),
//  pégala justo antes del "];" del final del archivo y rellénala.
//  Cada pregunta va entre { } y termina con una coma.
//
//  {
//    id: "ped-001",                  // único. Sugerencia: 3 letras del curso + número
//    examen: ["ENAM", "RM", "Preinternado"],   // deja solo los que apliquen
//    curso: "Pediatría",             // escríbelo siempre igual, con tildes
//    tema: "Exantemas virales",
//    dificultad: "Media",            // "Fácil" | "Media" | "Difícil" (con tilde)
//    enunciado: "Texto de la pregunta",
//    opciones: {
//      A: "…",
//      B: "…",
//      C: "…",
//      D: "…",
//      E: "…"                        // opcional: borra esta línea si no hay E
//    },
//    correcta: "B",                  // la clave, en mayúscula
//    explicacion: "",                // si la dejas vacía, Claude la redacta
//    perla: "",                      // opcional
//    fuente: ""                      // opcional, p. ej. "ENAM 2024"
//  },
//
//  Después de editar, revisa el formato con:   npm run validar
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
