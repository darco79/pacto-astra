import type { Fighter, SkillDef } from "./types";

function skill(
  kind: SkillDef["kind"],
  name: string,
  blurb: string,
  cost: number,
  effects: SkillDef["effects"],
  kiGain = 0,
): SkillDef {
  return { kind, name, blurb, cost, kiGain, effects };
}

const neri = {
  basic: skill("basic", "Pulso de taller", "Un golpe corto con la cápsula de práctica.", 0, [
    { op: "damage", target: "enemy", mult: 0.95 },
  ], 22),
  skill: skill("skill", "Cúpula de repuesto", "Un escudo improvisado, pero firme.", 30, [
    { op: "shield", target: "self", pct: 0.22 },
  ]),
  ult: skill("ult", "Lote de emergencia", "Cura al pacto y deja una lámina de ki.", 100, [
    { op: "heal", target: "allies", pct: 0.12 },
    { op: "shield", target: "allies", pct: 0.1 },
  ]),
};

const tessa = {
  basic: skill("basic", "Gancho del muelle", "Pega como quien cierra una escotilla.", 0, [
    { op: "damage", target: "enemy", mult: 1 },
  ], 22),
  skill: skill("skill", "Mecha viva", "Fuego corto. Quema un turno.", 35, [
    { op: "damage", target: "enemy", mult: 1.45 },
    { op: "burn", target: "enemy", turns: 1, pct: 0.04 },
  ]),
  ult: skill("ult", "Puño de brea", "Un impacto que huele a horno y a puerto.", 100, [
    { op: "damage", target: "enemy", mult: 1.9 },
  ]),
};

const hana = {
  basic: skill("basic", "Paso relámpago", "Llega antes que el aviso.", 0, [
    { op: "damage", target: "enemy", mult: 0.95 },
  ], 22),
  skill: skill("skill", "Doble entrega", "Dos cortes eléctricos seguidos.", 35, [
    { op: "damage", target: "enemy", mult: 0.55, hits: 2 },
  ]),
  ult: skill("ult", "Sobre cerrado", "Todo el rayo, en un solo sobre.", 100, [
    { op: "damage", target: "enemy", mult: 2.05 },
  ]),
};

const pira = {
  basic: skill("basic", "Mordida de ki", "Entra baja y no suelta.", 0, [
    { op: "damage", target: "enemy", mult: 1.05 },
  ], 22),
  skill: skill("skill", "Hambre de pelea", "Se hiere un poco para golpear más fuerte.", 30, [
    { op: "self-hp", pct: 0.05 },
    { op: "atk", target: "self", pct: 0.25, turns: 2 },
  ]),
  ult: skill("ult", "Colmillo abierto", "Un zarpazo que no pide permiso.", 100, [
    { op: "damage", target: "enemy", mult: 2.1 },
  ]),
};

const calla = {
  basic: skill("basic", "Toque de reglamento", "Marca la distancia. Luego pega.", 0, [
    { op: "damage", target: "enemy", mult: 0.95 },
  ], 22),
  skill: skill("skill", "Falta clara", "Golpe y baja la guardia de todo el frente.", 40, [
    { op: "damage", target: "enemy", mult: 1.15 },
    { op: "def", target: "enemies", pct: -0.15, turns: 2 },
  ]),
  ult: skill("ult", "Cierre de asalto", "El anillo entero recibe el veredicto.", 100, [
    { op: "damage", target: "enemies", mult: 0.95 },
  ]),
};

const ysol = {
  basic: skill("basic", "Segundo corto", "Un golpe pequeño, a tiempo.", 0, [
    { op: "damage", target: "enemy", mult: 0.9 },
  ], 22),
  skill: skill("skill", "Vuelta al pulso", "Cura a quien esté peor.", 35, [
    { op: "heal", target: "low-ally", pct: 0.2 },
  ]),
  ult: skill("ult", "Pausa de aprendizaje", "Cura al pacto y limpia el daño persistente.", 100, [
    { op: "heal", target: "allies", pct: 0.14 },
    { op: "cleanse" },
  ]),
};

const rin = {
  basic: skill("basic", "Palma del horno", "El dojo le enseñó a no desperdiciar fuego.", 0, [
    { op: "damage", target: "enemy", mult: 1 },
  ], 22),
  skill: skill("skill", "Ascua heredada", "Quema durante dos turnos.", 40, [
    { op: "damage", target: "enemy", mult: 1.65 },
    { op: "burn", target: "enemy", turns: 2, pct: 0.045 },
  ]),
  ult: skill("ult", "Horno abierto", "Más dura si el blanco ya arde.", 100, [
    { op: "damage", target: "enemy", mult: 2.4, bonusIfBurn: 1.2 },
  ]),
};

const dara = {
  basic: skill("basic", "Tonfa de hangar", "Herramienta, y también argumento.", 0, [
    { op: "damage", target: "enemy", mult: 1 },
  ], 22),
  skill: skill("skill", "Placa de reactor", "Se cubre con chapa de ki.", 35, [
    { op: "shield", target: "self", pct: 0.28 },
  ]),
  ult: skill("ult", "Remache final", "Golpea y refuerza su propia guardia.", 100, [
    { op: "damage", target: "enemy", mult: 1.7 },
    { op: "def", target: "self", pct: 0.2, turns: 2 },
  ]),
};

const luma = {
  basic: skill("basic", "Paso de circuito", "Entra en ángulo, sale en línea.", 0, [
    { op: "damage", target: "enemy", mult: 1 },
  ], 22),
  skill: skill("skill", "Curva de rayo", "Golpea y acelera su propio ataque.", 40, [
    { op: "damage", target: "enemy", mult: 1.5 },
    { op: "atk", target: "self", pct: 0.18, turns: 2 },
  ]),
  ult: skill("ult", "Vuelta completa", "El rayo recorre todo el frente.", 100, [
    { op: "damage", target: "enemies", mult: 1.15 },
  ]),
};

const brisa = {
  basic: skill("basic", "Corte de hoja", "Uno, y ya está buscando el segundo.", 0, [
    { op: "damage", target: "enemy", mult: 1 },
  ], 22),
  skill: skill("skill", "Tres rastros", "Tres cortes verdes.", 45, [
    { op: "damage", target: "enemy", mult: 0.58, hits: 3 },
  ]),
  ult: skill("ult", "Caza cerrada", "Si derriba, recupera ki.", 100, [
    { op: "damage", target: "enemy", mult: 2.5, kiOnKill: 20 },
  ]),
};

const selka = {
  basic: skill("basic", "Hilo de pozo", "Un tirón que no se ve venir.", 0, [
    { op: "damage", target: "enemy", mult: 1 },
  ], 22),
  skill: skill("skill", "Nudo de gravedad", "Daño leve y un aturdimiento.", 45, [
    { op: "damage", target: "enemy", mult: 0.7 },
    { op: "stun", target: "enemy" },
  ]),
  ult: skill("ult", "Pozo abierto", "Golpe pesado y baja el ataque rival.", 100, [
    { op: "damage", target: "enemy", mult: 1.8 },
    { op: "atk", target: "enemy", pct: -0.18, turns: 2 },
  ]),
};

const nima = {
  basic: skill("basic", "Toque de campaña", "Primero mira el pulso. Luego empuja.", 0, [
    { op: "damage", target: "enemy", mult: 0.92 },
  ], 22),
  skill: skill("skill", "Vendaje de ki", "Cura a la compañera más herida.", 40, [
    { op: "heal", target: "low-ally", pct: 0.26 },
  ]),
  ult: skill("ult", "Puesto de auxilio", "Cura al pacto y le deja ki a quien mejor pueda usarlo.", 100, [
    { op: "heal", target: "allies", pct: 0.16 },
    { op: "ki", target: "best-ally", amount: 15 },
  ]),
};

const ione = {
  basic: skill("basic", "Lección de palma", "La academia no enseña a contenerse.", 0, [
    { op: "damage", target: "enemy", mult: 1 },
  ], 22),
  skill: skill("skill", "Aula en llamas", "Fuego a todo el frente. Quema dos turnos.", 45, [
    { op: "damage", target: "enemies", mult: 1.05 },
    { op: "burn", target: "enemies", turns: 2, pct: 0.04 },
  ]),
  ult: skill("ult", "Examen final", "Un impacto enorme si el blanco ya arde.", 100, [
    { op: "damage", target: "enemy", mult: 2.6, bonusIfBurn: 1.25 },
  ]),
};

const vesper = {
  basic: skill("basic", "Descarga de guardia", "El núcleo empuja sin alzar la voz.", 0, [
    { op: "damage", target: "enemy", mult: 1 },
  ], 22),
  skill: skill("skill", "Hexágono compartido", "Escudo para toda la escuadra.", 40, [
    { op: "shield", target: "allies", pct: 0.16 },
  ]),
  ult: skill("ult", "Lanza de centinela", "Rayo pesado. Aturde si el blanco queda muy herido.", 100, [
    { op: "damage", target: "enemy", mult: 2.15, stunIfBelow: 0.4 },
  ]),
};

const tamsin = {
  basic: skill("basic", "Paso de risco", "El suelo cede un poco. Ella no.", 0, [
    { op: "damage", target: "enemy", mult: 1.08 },
  ], 22),
  skill: skill("skill", "Ira del borde", "Sangra un poco y su ataque se dispara.", 35, [
    { op: "self-hp", pct: 0.05 },
    { op: "atk", target: "self", pct: 0.35, turns: 3 },
  ]),
  ult: skill("ult", "Grito de acantilado", "Un golpe enorme. Luego se cierra la herida.", 100, [
    { op: "damage", target: "enemy", mult: 2.7 },
    { op: "heal", target: "self", pct: 0.08 },
  ]),
};

const rhea = {
  basic: skill("basic", "Compás de pulso", "Mide, y el golpe cae en el hueco.", 0, [
    { op: "damage", target: "enemy", mult: 1 },
  ], 22),
  skill: skill("skill", "Plano de ruptura", "Daña al frente y baja su defensa.", 45, [
    { op: "damage", target: "enemies", mult: 0.9 },
    { op: "def", target: "enemies", pct: -0.2, turns: 2 },
  ]),
  ult: skill("ult", "Clave de carga", "Un pulso que deja al blanco detenido.", 100, [
    { op: "damage", target: "enemy", mult: 1.9 },
    { op: "stun", target: "enemy" },
  ]),
};

const sable = {
  basic: skill("basic", "Filo oculto", "No anuncia el ángulo.", 0, [
    { op: "damage", target: "enemy", mult: 1 },
  ], 22),
  skill: skill("skill", "Corte de sombra", "Un tajo limpio, sin adorno.", 40, [
    { op: "damage", target: "enemy", mult: 1.75 },
  ]),
  ult: skill("ult", "Veredicto negro", "Si derriba, el anillo le devuelve ki.", 100, [
    { op: "damage", target: "enemy", mult: 2.75, kiOnKill: 25 },
  ]),
};

const solenne = {
  basic: skill("basic", "Palma de sol", "El calor llega antes que el puño.", 0, [
    { op: "damage", target: "enemy", mult: 1.08 },
  ], 22),
  skill: skill("skill", "Corona de ascua", "Quema tres turnos y enciende su ataque.", 45, [
    { op: "damage", target: "enemy", mult: 1.8 },
    { op: "burn", target: "enemy", turns: 3, pct: 0.06 },
    { op: "atk", target: "self", pct: 0.2, turns: 2 },
  ]),
  ult: skill("ult", "Mediodía", "El cielo se abre. Duele más si ya hay fuego.", 100, [
    { op: "damage", target: "enemy", mult: 3, bonusIfBurn: 1.35 },
  ]),
};

const maera = {
  basic: skill("basic", "Sello de pozo", "Una frase, y el peso cae.", 0, [
    { op: "damage", target: "enemy", mult: 1 },
  ], 22),
  skill: skill("skill", "Lectura de falla", "Golpea al frente y abre su defensa.", 45, [
    { op: "damage", target: "enemies", mult: 1.05 },
    { op: "def", target: "enemies", pct: -0.22, turns: 3 },
  ]),
  ult: skill("ult", "Sentencia del pozo", "Todo el frente se detiene un instante.", 100, [
    { op: "damage", target: "enemies", mult: 1.05 },
    { op: "stun", target: "enemies" },
  ]),
};

const eira = {
  basic: skill("basic", "Aguja de medianoche", "Un segundo robado, devuelto en golpe.", 0, [
    { op: "damage", target: "enemy", mult: 0.92 },
  ], 22),
  skill: skill("skill", "Círculo de horas", "Cura al pacto y deja un escudo breve.", 40, [
    { op: "heal", target: "allies", pct: 0.14 },
    { op: "shield", target: "allies", pct: 0.12 },
  ]),
  ult: skill("ult", "Medianoche en punto", "Cura, limpia y entrega ki a la mejor aliada.", 100, [
    { op: "heal", target: "allies", pct: 0.22 },
    { op: "cleanse" },
    { op: "ki", target: "best-ally", amount: 30 },
  ]),
};

export const MORE_FIGHTERS: Fighter[] = [
  {
    id: "neri",
    name: "Neri Quill",
    title: "Aprendiz de cápsulas",
    lore: "Aprendió el oficio en el taller de Lira, comprimiendo escudos defectuosos hasta que uno aguantó un asalto entero. Entra al pacto con las manos manchadas de aceite y un cuaderno lleno de fallos útiles.",
    rarity: "R",
    element: "acero",
    role: "soporte",
    weight: 60,
    hp: 900,
    atk: 74,
    def: 62,
    spd: 104,
    crit: 0.07,
    skills: neri,
  },
  {
    id: "tessa",
    name: "Tessa Brin",
    title: "Puño del muelle",
    lore: "Peina el puerto Ámbar a puño limpio. No vuela y no le hace falta: cierra peleas entre cajas, sogas y hornos que nadie apagó a tiempo.",
    rarity: "R",
    element: "fuego",
    role: "luchadora",
    weight: 60,
    hp: 940,
    atk: 96,
    def: 48,
    spd: 112,
    crit: 0.12,
    skills: tessa,
  },
  {
    id: "hana",
    name: "Hana Vesk",
    title: "Mensajera del relámpago",
    lore: "Lleva sobres entre pozos de ki y llega antes de que el sello se enfríe. Si el camino se cierra, el camino se abre a golpes.",
    rarity: "R",
    element: "rayo",
    role: "asesina",
    weight: 60,
    hp: 780,
    atk: 102,
    def: 36,
    spd: 128,
    crit: 0.16,
    skills: hana,
  },
  {
    id: "pira",
    name: "Pira Den",
    title: "Colmillo de cañón",
    lore: "Crió en el mismo cañón que Sera, pero no busca rivales: busca la pelea que todavía no tiene nombre. Mide mal su fuerza y aun así vuelve a intentarlo.",
    rarity: "R",
    element: "salvaje",
    role: "berserker",
    weight: 60,
    hp: 1020,
    atk: 100,
    def: 44,
    spd: 98,
    crit: 0.1,
    skills: pira,
  },
  {
    id: "calla",
    name: "Calla Orth",
    title: "Árbitra del anillo",
    lore: "Pitó cien combates del Anillo Libre antes de bajarse de la silla. Ahora el reglamento lo escribe con el puño, y solo cuando alguien lo rompe.",
    rarity: "R",
    element: "gravedad",
    role: "control",
    weight: 60,
    hp: 980,
    atk: 84,
    def: 56,
    spd: 106,
    crit: 0.08,
    skills: calla,
  },
  {
    id: "ysol",
    name: "Ysol Peck",
    title: "Aprendiz de la hora",
    lore: "Aera le prestó un reloj que atrasa a propósito. Ysol todavía no devuelve minutos enteros: devuelve el aliento justo para que otra siga de pie.",
    rarity: "R",
    element: "tiempo",
    role: "soporte",
    weight: 60,
    hp: 960,
    atk: 70,
    def: 54,
    spd: 102,
    crit: 0.07,
    skills: ysol,
  },
  {
    id: "rin",
    name: "Rin Kael",
    title: "Heredera del horno",
    lore: "Prima lejana del dojo de Mira. El horno familiar no calienta casas: calienta palmas. Vino al pacto porque alguien apagó un pozo que su familia juró cuidar.",
    rarity: "SR",
    element: "fuego",
    role: "asalto",
    weight: 40,
    hp: 880,
    atk: 138,
    def: 42,
    spd: 116,
    crit: 0.15,
    skills: rin,
  },
  {
    id: "dara",
    name: "Dara Venn",
    title: "Mecánica de hangar",
    lore: "Soldaba corazas para androides que no pedían permiso. Cuando el Sindicato quiso abrir el reactor de Kora, Dara soldó la puerta por dentro y se quedó del otro lado.",
    rarity: "SR",
    element: "acero",
    role: "guardiana",
    weight: 40,
    hp: 1240,
    atk: 108,
    def: 68,
    spd: 94,
    crit: 0.08,
    skills: dara,
  },
  {
    id: "luma",
    name: "Luma Crest",
    title: "As del circuito",
    lore: "Campeona de las carreras de ki sobre los anillos exteriores. No pelea por el título: pelea porque alguien usó su circuito para mover tropas.",
    rarity: "SR",
    element: "rayo",
    role: "luchadora",
    weight: 40,
    hp: 980,
    atk: 130,
    def: 46,
    spd: 122,
    crit: 0.14,
    skills: luma,
  },
  {
    id: "brisa",
    name: "Brisa Quen",
    title: "Cazadora del verde",
    lore: "Sigue rastros de ki salvaje por el cañón. No colecciona trofeos. Cierra cacerías y deja el eco para quien se atreva a repetirlas.",
    rarity: "SR",
    element: "salvaje",
    role: "asesina",
    weight: 40,
    hp: 820,
    atk: 146,
    def: 36,
    spd: 126,
    crit: 0.18,
    skills: brisa,
  },
  {
    id: "selka",
    name: "Selka Dorn",
    title: "Tejedora de pozos",
    lore: "Estudia la gravedad como quien teje una red. Un hilo mal puesto y una ciudad se queda sin vuelo. Ella vino a cortar los hilos que no son suyos.",
    rarity: "SR",
    element: "gravedad",
    role: "control",
    weight: 40,
    hp: 940,
    atk: 118,
    def: 50,
    spd: 112,
    crit: 0.1,
    skills: selka,
  },
  {
    id: "nima",
    name: "Nima Solace",
    title: "Médica de campaña",
    lore: "Monta puestos de auxilio donde el ki todavía quema. No promete milagros. Promete que la escuadra llega al siguiente asalto.",
    rarity: "SR",
    element: "tiempo",
    role: "soporte",
    weight: 40,
    hp: 1080,
    atk: 96,
    def: 58,
    spd: 108,
    crit: 0.08,
    skills: nima,
  },
  {
    id: "ione",
    name: "Ione Marr",
    title: "Llama de academia",
    lore: "Primera de su promoción y última en pedir permiso. La academia la expulsó por incendiar el patio de examen. El patio, dice ella, ya estaba pidiendo fuego.",
    rarity: "SSR",
    element: "fuego",
    role: "asalto",
    weight: 27,
    hp: 900,
    atk: 150,
    def: 42,
    spd: 118,
    crit: 0.16,
    skills: ione,
  },
  {
    id: "vesper",
    name: "Vesper Quinn",
    title: "Centinela de núcleo",
    lore: "Androide de la misma línea que Kora, despertada para vigilar un pozo y no para servir. Su escudo es un hexágono que no negocia.",
    rarity: "SSR",
    element: "rayo",
    role: "guardiana",
    weight: 26,
    hp: 1280,
    atk: 120,
    def: 72,
    spd: 98,
    crit: 0.1,
    skills: vesper,
  },
  {
    id: "tamsin",
    name: "Tamsin Holt",
    title: "Ira del risco",
    lore: "Guerrera de los mismos acantilados que Orra, sin la calma. Cuando el ki la desborda no pide perdón: pide espacio, y el risco se lo da.",
    rarity: "SSR",
    element: "salvaje",
    role: "berserker",
    weight: 26,
    hp: 1180,
    atk: 156,
    def: 44,
    spd: 100,
    crit: 0.13,
    skills: tamsin,
  },
  {
    id: "rhea",
    name: "Rhea Kast",
    title: "Arquitecta de pulso",
    lore: "Diseña pozos como quien dibuja una ciudad. Sabe dónde se parte una barrera porque ella puso la junta. Hoy las deshace.",
    rarity: "SSR",
    element: "acero",
    role: "control",
    weight: 27,
    hp: 1040,
    atk: 124,
    def: 60,
    spd: 108,
    crit: 0.1,
    skills: rhea,
  },
  {
    id: "sable",
    name: "Sable Orrin",
    title: "Sombra del anillo",
    lore: "Campeona que dejó el Anillo Libre cuando las apuestas empezaron a comprar caídas. Pega desde el ángulo que el foco no cubre.",
    rarity: "SSR",
    element: "gravedad",
    role: "asesina",
    weight: 26,
    hp: 840,
    atk: 160,
    def: 38,
    spd: 130,
    crit: 0.19,
    skills: sable,
  },
  {
    id: "solenne",
    name: "Solenne Vey",
    title: "Sol de los acantilados",
    lore: "Cuando Orra contiene el oro, Solenne lo deja salir. No es una forma prestada: es mediodía, y el mediodía no pide turno.",
    rarity: "UR",
    element: "fuego",
    role: "berserker",
    weight: 10,
    hp: 1260,
    atk: 168,
    def: 48,
    spd: 102,
    crit: 0.15,
    skills: solenne,
  },
  {
    id: "maera",
    name: "Maera Kest",
    title: "Jueza del pozo",
    lore: "Dicta sobre fallas de gravedad. Una sentencia suya detiene un frente entero el tiempo de un latido. No alza la voz. El pozo sí.",
    rarity: "UR",
    element: "gravedad",
    role: "control",
    weight: 10,
    hp: 1160,
    atk: 130,
    def: 64,
    spd: 108,
    crit: 0.11,
    skills: maera,
  },
  {
    id: "eira",
    name: "Eira Morn",
    title: "Reloj de medianoche",
    lore: "Guardiana de la hora que llega cuando el reloj ya dio las doce. No reescribe el combate: le devuelve al pacto el minuto que estaba a punto de perder.",
    rarity: "UR",
    element: "tiempo",
    role: "soporte",
    weight: 10,
    hp: 1180,
    atk: 98,
    def: 66,
    spd: 106,
    crit: 0.08,
    skills: eira,
  },
];
