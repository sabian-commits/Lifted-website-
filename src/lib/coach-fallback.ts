// No-AI fallback for the Lifted Coach. When ANTHROPIC_API_KEY is absent, the
// Coach still answers — from the playbook — with scripted, bilingual responses
// instead of a live Claude conversation. Keyword-matched, best-topic-wins.
//
// This is intentionally simple and grounded only in the lifted_ministry_playbook;
// it does not invent doctrine. The crisis/pastoral-care boundary is preserved.

type Lang = "en" | "es";

interface Topic {
  id: string;
  keys: string[]; // lowercase keywords (EN + ES) that signal this topic
  en: string;
  es: string;
}

// Checked before everything else — safety first (playbook pastoral-care boundary).
const CRISIS_KEYS = [
  "suicide", "suicidal", "kill myself", "kill my self", "end my life", "want to die",
  "self-harm", "self harm", "hurt myself", "harm myself", "abuse", "abused", "hopeless",
  "suicidio", "suicidarme", "matarme", "quitarme la vida", "no quiero vivir", "morir",
  "hacerme daño", "lastimarme", "abuso", "sin esperanza",
];

const CRISIS = {
  en: "I'm really glad you told me, and I don't want you to carry this alone. I'm a companion, not a counselor — so please reach out right now to a Lifted pastor or leader. If you might be in danger, call or text 988 (the Suicide & Crisis Lifeline) or your local emergency number. You matter, and people here want to walk with you through this.",
  es: "Me alegra mucho que me lo hayas contado, y no quiero que cargues con esto solo. Soy un acompañante, no un consejero — por favor comunícate ahora mismo con un pastor o líder de Lifted. Si podrías estar en peligro, llama o envía un mensaje al 988 (Línea de Crisis y Suicidio) o a tu número de emergencias local. Importas, y aquí hay personas que quieren caminar contigo en esto.",
};

const TOPICS: Topic[] = [
  {
    id: "framework",
    keys: ["see grow multiply", "see, grow", "framework", "pathway", "journey", "see grow", "grow multiply", "marco", "camino", "recorrido", "ver crecer multiplicar"],
    en: "Everything at Lifted moves along one pathway: See · Grow · Multiply.\n\n• SEE — First Impressions. The welcome; being seen and known. Everyone starts here.\n• GROW — \"Ready to Rescue\": the moment you're rescued, you join the rescue team. You grow through DNA, then First Principles, then a Life Group.\n• MULTIPLY — leaders who create leaders; systems that outlive their builders.\n\nWherever you are on that map, your next step is to go one stage deeper. Want me to point you to DNA, the star ladder, or serving?",
    es: "Todo en Lifted avanza por un solo camino: Ver · Crecer · Multiplicar.\n\n• VER — Primeras Impresiones. La bienvenida; ser visto y conocido. Todos empiezan aquí.\n• CRECER — \"Listo para Rescatar\": en el momento en que te rescatan, te unes al equipo de rescate. Creces a través de DNA, luego Primeros Principios, y un Grupo Pequeño.\n• MULTIPLICAR — líderes que crean líderes; sistemas que perduran más que quienes los construyen.\n\nDondequiera que estés en ese mapa, tu próximo paso es ir una etapa más profundo. ¿Te muestro DNA, la escalera de estrellas, o cómo servir?",
  },
  {
    id: "dna",
    keys: ["dna", "get connected", "connected", "next step", "first step", "new here", "where do i start", "como empiezo", "cómo empiezo", "conectarme", "nuevo", "primer paso", "próximo paso"],
    en: "DNA is the first real step for getting connected and growing at Lifted — it's foundational discipleship, the baseline for every volunteer. If you're wondering \"what's next?\", DNA is almost always the answer. Ask a leader how to join the next DNA, or check the Events page in the app.",
    es: "DNA es el primer paso real para conectarte y crecer en Lifted — es el discipulado fundamental, la base para cada voluntario. Si te preguntas \"¿qué sigue?\", DNA casi siempre es la respuesta. Pregúntale a un líder cómo unirte al próximo DNA, o revisa la página de Eventos en la app.",
  },
  {
    id: "ladder",
    keys: ["star", "stars", "ladder", "level", "advance", "promotion", "serve honor", "1 star", "estrella", "estrellas", "escalera", "nivel", "ascender", "avanzar"],
    en: "The Serve Honor System is the star ladder — public acknowledgment of real, observed growth:\n\n• 1★ Faithful Server · 2★ Reliable Team Member · 3★ Team Leader Candidate · 5★ Area Lead · 7★ Service Lead\n• 4★ and 6★ are intentional development gaps — not waiting rooms.\n• No star is ever awarded without the matching training on file. No exceptions.\n\nCheck The Ladder page to see where you are and what your next rung needs.",
    es: "El Sistema de Honor al Servicio es la escalera de estrellas — un reconocimiento público de crecimiento real y observado:\n\n• 1★ Servidor Fiel · 2★ Miembro Confiable · 3★ Candidato a Líder · 5★ Líder de Área · 7★ Líder de Servicio\n• 4★ y 6★ son brechas de desarrollo intencionales — no salas de espera.\n• Ninguna estrella se otorga sin la capacitación correspondiente registrada. Sin excepciones.\n\nRevisa la página La Escalera para ver dónde estás y qué requiere tu próximo escalón.",
  },
  {
    id: "trainings",
    keys: ["training", "trainings", "inauguration", "leader foundations", "zone leadership", "service operations", "capacitacion", "capacitación", "entrenamiento", "entrenamientos"],
    en: "Four trainings unlock the ladder:\n\n• Inauguration → 1★ & 2★ (the cultural baseline; any leader can run it)\n• Leader Foundations → 3★\n• Zone Leadership → 5★\n• Service Operations → 7★ (multi-session, led by the Ministry Lead)\n\nEach one builds exactly the capability its star needs. See the Trainings page to mark one complete.",
    es: "Cuatro capacitaciones desbloquean la escalera:\n\n• Inauguración → 1★ y 2★ (la base cultural; cualquier líder puede darla)\n• Fundamentos de Liderazgo → 3★\n• Liderazgo de Zona → 5★\n• Operaciones de Servicio → 7★ (varias sesiones, dirigidas por el Líder de Ministerio)\n\nCada una construye exactamente la capacidad que su estrella necesita. Revisa la página de Capacitaciones para marcar una como completada.",
  },
  {
    id: "multiply",
    keys: ["multiply", "multiplication", "5 into 1", "five into one", "disciple", "mentor", "develop leaders", "multiplicar", "multiplicación", "discipular", "formar lideres", "formar líderes"],
    en: "Multiplication is the heart of leadership here: \"You are only as good as your ability to multiply yourself.\"\n\n• 5 Into 1 — every leader intentionally shapes up to five people. Not managing them — shaping them.\n• The real test isn't \"did you teach them?\" but: \"Can they teach it without you?\" Until the answer is yes, it's transfer, not multiplication.\n\nThe Multiply page lets you track the people you're shaping.",
    es: "La multiplicación es el corazón del liderazgo aquí: \"Eres tan bueno como tu capacidad de multiplicarte.\"\n\n• 5 En 1 — cada líder forma intencionalmente hasta cinco personas. No las administra — las forma.\n• La verdadera prueba no es \"¿les enseñaste?\" sino: \"¿Pueden enseñarlo sin ti?\" Hasta que la respuesta sea sí, es transferencia, no multiplicación.\n\nLa página Multiplicar te permite seguir a las personas que estás formando.",
  },
  {
    id: "rivers",
    keys: ["river", "rivers", "channel", "channels", "rio", "río", "rios", "ríos", "canal", "canales"],
    en: "The Rivers are the natural channels multiplication flows through:\n\n• Small Group pipelines\n• SEE team funnels\n• Gap leader networks\n\nThis map is still being unpacked with Pastor Mike, so expect it to grow.",
    es: "Los Ríos son los canales naturales por donde fluye la multiplicación:\n\n• Canales de Grupos Pequeños\n• Embudos del equipo VER\n• Redes de líderes puente\n\nEste mapa todavía se está desarrollando con el Pastor Mike, así que espera que crezca.",
  },
  {
    id: "callup",
    keys: ["call out", "call up", "accountability", "confront", "correction", "conflict", "rebuke", "llamar", "corregir", "confrontar", "rendir cuentas", "conflicto"],
    en: "At Lifted we don't call out — we call up. When someone is off-track, the move is never to expose or shame them; it's to invite them toward something higher: \"I see what you're capable of, and I'm holding you to that.\" It preserves dignity and keeps the culture aspirational. Address it privately, kindly, and clearly.",
    es: "En Lifted no señalamos — elevamos. Cuando alguien se desvía, el paso nunca es exponerlo o avergonzarlo; es invitarlo a algo más alto: \"Veo de lo que eres capaz, y te sostengo a ese nivel.\" Eso preserva la dignidad y mantiene la cultura aspiracional. Abórdalo en privado, con amabilidad y claridad.",
  },
  {
    id: "recognition",
    keys: ["recognition", "celebrate", "honor", "recognize", "appreciate", "reconocimiento", "celebrar", "honrar", "reconocer"],
    en: "Celebration here is a system, not a feeling — every month at least one person from the SEE team is recognized publicly. The best recognition is specific (names the exact behavior), public, tied to a value, and timely. \"Recognition makes the invisible visible.\"",
    es: "La celebración aquí es un sistema, no un sentimiento — cada mes al menos una persona del equipo VER es reconocida públicamente. El mejor reconocimiento es específico (nombra la conducta exacta), público, ligado a un valor, y oportuno. \"El reconocimiento hace visible lo invisible.\"",
  },
  {
    id: "see3rs",
    keys: ["3rs", "3 rs", "three rs", "first impression", "first impressions", "guest", "greeter", "welcome", "zone", "parking", "doors", "primeras impresiones", "invitado", "bienvenida", "zona"],
    en: "SEE is the front door — the parking lot, breezeway, patio, and doors, across four zones. Everyone starts here in Month 1; it's where habits are formed. The guest framework is the 3Rs (built on the principle that people stay after repeated positive engagement). The exact 3Rs wording is being finalized by Sabian and Pastor Mike.",
    es: "VER es la puerta de entrada — el estacionamiento, el pasillo, el patio y las puertas, en cuatro zonas. Todos empiezan aquí en el Mes 1; es donde se forman los hábitos. El marco para invitados son las 3Rs (basado en el principio de que las personas se quedan tras una interacción positiva repetida). La redacción exacta de las 3Rs la están finalizando Sabian y el Pastor Mike.",
  },
  {
    id: "faith",
    keys: ["pray", "prayer", "bible", "scripture", "god", "jesus", "faith", "verse", "orar", "oracion", "oración", "biblia", "dios", "jesús", "fe", "versiculo", "versículo"],
    en: "That's a beautiful place to be growing. A few simple rhythms go a long way: daily prayer (even a few honest sentences), reading Scripture, staying in community, and serving. For going deeper on a specific question, DNA and a Life Group are built exactly for that — and a Lifted leader would love to walk with you. Is there a specific question on your heart?",
    es: "Ese es un lugar hermoso para crecer. Unos ritmos sencillos hacen mucho: oración diaria (aunque sean unas frases honestas), leer la Escritura, permanecer en comunidad, y servir. Para profundizar en una pregunta específica, DNA y un Grupo Pequeño están hechos justo para eso — y a un líder de Lifted le encantaría caminar contigo. ¿Hay alguna pregunta específica en tu corazón?",
  },
  {
    id: "events",
    keys: ["event", "events", "service time", "schedule", "when is", "what time", "evento", "eventos", "horario", "a que hora", "a qué hora", "cuando es", "cuándo es"],
    en: "For service times, dates, and what's coming up, check the Events page in the app — that's where leaders keep it current. I don't want to give you a date I can't confirm.",
    es: "Para los horarios de servicio, fechas y lo que viene, revisa la página de Eventos en la app — ahí los líderes lo mantienen al día. No quiero darte una fecha que no pueda confirmar.",
  },
];

const GREETING = {
  en: "Hi — I'm the Lifted Coach. I can walk you through See · Grow · Multiply, DNA and your next step, the star ladder and trainings, serving on the See team, or a question about faith. What's on your mind?",
  es: "Hola — soy el Coach de Lifted. Puedo guiarte por Ver · Crecer · Multiplicar, DNA y tu próximo paso, la escalera de estrellas y las capacitaciones, servir en el equipo Ver, o una pregunta sobre la fe. ¿Qué tienes en mente?",
};

const DEFAULT = {
  en: "I want to point you in the right direction. I can help with the See · Grow · Multiply pathway, DNA and your next step, the star ladder and trainings, serving, or faith questions — try asking about one of those. For anything specific to you, a Lifted leader is the best next step.\n\n(Heads up: the AI Coach isn't fully set up yet, so I'm answering from the ministry playbook for now.)",
  es: "Quiero orientarte en la dirección correcta. Puedo ayudarte con el camino Ver · Crecer · Multiplicar, DNA y tu próximo paso, la escalera de estrellas y las capacitaciones, servir, o preguntas de fe — intenta preguntar sobre uno de esos temas. Para algo específico a ti, un líder de Lifted es el mejor próximo paso.\n\n(Aviso: el Coach con IA aún no está completamente configurado, así que por ahora respondo desde el manual del ministerio.)",
};

const GREETING_KEYS = ["hi", "hello", "hey", "help", "what can you do", "who are you", "hola", "buenas", "ayuda", "que puedes hacer", "qué puedes hacer", "quien eres", "quién eres"];

function looksSpanish(text: string): boolean {
  if (/[ñ¿¡áéíóúü]/i.test(text)) return true;
  const esWords = [" el ", " la ", " que ", " como ", " cómo ", " qué ", " donde ", " dónde ", " puedo ", " soy ", " estoy ", " gracias", "hola"];
  const t = ` ${text.toLowerCase()} `;
  return esWords.some((w) => t.includes(w));
}

// Pick the best-matching topic and return a scripted reply, in the right language.
export function fallbackReply(message: string, languagePref?: string): string {
  const text = message.toLowerCase();
  const lang: Lang = looksSpanish(message) ? "es" : languagePref === "es" ? "es" : "en";

  if (CRISIS_KEYS.some((k) => text.includes(k))) return CRISIS[lang];

  let best: Topic | null = null;
  let bestScore = 0;
  for (const topic of TOPICS) {
    const score = topic.keys.reduce((n, k) => (text.includes(k) ? n + 1 : n), 0);
    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }
  if (best && bestScore > 0) return best[lang];

  if (GREETING_KEYS.some((k) => text.includes(k))) return GREETING[lang];

  return DEFAULT[lang];
}
