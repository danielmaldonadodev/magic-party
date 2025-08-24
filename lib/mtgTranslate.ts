// lib/mtgTranslate.ts

// ---------- Tipos (card types) ----------
const TYPE_MAP: Record<string, string> = {
  // base
  Artifact: 'Artefacto',
  Battle: 'Batalla',
  Conspiracy: 'Conspiración',
  Creature: 'Criatura',
  Enchantment: 'Encantamiento',
  Instant: 'Instantáneo',
  Land: 'Tierra',
  Planeswalker: 'Caminante de Planos',
  Scheme: 'Estrategema',
  Sorcery: 'Hechizo',
  Tribal: 'Tribal',
  Vanguard: 'Vanguardia',
  Token: 'Ficha',
  Emblem: 'Emblema',
  // Planechase / Dungeons / Arcanoma
  Plane: 'Plano',
  Phenomenon: 'Fenómeno',
  Dungeon: 'Mazmorra',
  // “subtipos promovidos” de sets recientes (aparecen en la izquierda
  // en algunos renderizados modernos)
  Case: 'Caso',
  Class: 'Clase',
  Role: 'Rol',
  Attraction: 'Atracción',
  Contraption: 'Artilugio',
  Sticker: 'Pegatina',
};

// ---------- Supertipos ----------
const SUPERTYPE_MAP: Record<string, string> = {
  Basic: 'Básica',
  Legendary: 'Legendaria',
  Snow: 'Nevada',
  World: 'Mundial',
  Ongoing: 'Continua',
};

// ---------- Subtipos por categoría ----------

// Criatura (ampliable: añade los que quieras sin tocar la función)
const CREATURE_SUBTYPES: Record<string, string> = {
  Advisor:'Consejero', Aetherborn:'Nacido del Éter', Ally:'Aliado', Angel:'Ángel', Antelope:'Antílope',
  Ape:'Simio', Archer:'Arquero', Archon:'Arconte', Artificer:'Artificiero', Assassin:'Asesino',
  "Assembly-Worker":'Trabajador ensamblador', Astartes:'Astartes', Atog:'Atog', Aurochs:'Uros',
  Avatar:'Avatar', Badger:'Tejón', Barbarian:'Bárbaro', Basilisk:'Basilisco', Bat:'Murciélago',
  Bear:'Oso', Beast:'Bestia', Beeble:'Chismoso', Berserker:'Bárbaro Furioso', Bird:'Ave',
  Blinkmoth:'Parpadeomorfo', Boar:'Jabalí', Bringer:'Portador', Brushwagg:'Cepillomono',
  Camarid:'Camárido', Camel:'Camello', Caribou:'Caribú', Carrier:'Portador', Cat:'Gato',
  Centaur:'Centauro', Cephalid:'Céfalo', Chimera:'Quimera', Citizen:'Ciudadano', Cleric:'Clérigo',
  Cockatrice:'Cocatriz', Construct:'Construcción', Crab:'Cangrejo', Crocodile:'Cocodrilo',
  Cyclops:'Cíclope', Dauthi:'Dauthi', Demon:'Demonio', Deserter:'Desertor', Dinosaur:'Dinosaurio',
  Djinn:'Djinn', Dog:'Perro', Dragon:'Dragón', Drake:'Draco', Dreadnought:'Acorazado', Drone:'Zángano',
  Druid:'Druida', Dryad:'Dríada', Dwarf:'Enano', Efreet:'Efrit', Egg:'Huevo', Elder:'Anciano',
  Eldrazi:'Eldrazi', Elemental:'Elemental', Elephant:'Elefante', Elf:'Elfo', Elk:'Alce', Eye:'Ojo',
  Faerie:'Hada', Ferret:'Hurón', Fish:'Pez', Flagbearer:'Abanderado', Fox:'Zorro', Frog:'Rana',
  Fungus:'Hongo', Gargoyle:'Gárgola', Germ:'Germen', Giant:'Gigante', Gnome:'Gnomo', Goat:'Cabra',
  Goblin:'Trasgo', God:'Dios', Golem:'Gólem', Gorgon:'Gorgona', Gremlin:'Gremlin', Griffin:'Grifo',
  Hag:'Bruja', Harpy:'Arpía', Hellion:'Demonio Infernal', Hippo:'Hipopótamo', Hippogriff:'Hipogrifo',
  Homarid:'Homárido', Homunculus:'Homúnculo', Horror:'Horror', Horse:'Caballo', Human:'Humano',
  Hydra:'Hidra', Hyena:'Hiena', Illusion:'Ilusión', Imp:'Diablillo', Incarnation:'Encarnación',
  Inkling:'Entintado', Insect:'Insecto', Jellyfish:'Medusa (marina)', Juggernaut:'Juggernaut',
  Kavu:'Kavu', Kirin:'Kirin', Knight:'Caballero', Kobold:'Kobold', Kor:'Kor', Kraken:'Kraken',
  Lamia:'Lamia', Lammasu:'Lammasu', Leech:'Sanguijuela', Leviathan:'Leviatán', Lhurgoyf:'Lhurgoyf',
  Licid:'Lícido', Lizard:'Lagarto', Manticore:'Mantícora', Masticore:'Másticore', Mercenary:'Mercenario',
  Merfolk:'Tritón', Metathran:'Metathrano', Minion:'Esbirro', Minotaur:'Minotauro', Monk:'Monje',
  Moonfolk:'Lunarino', Mutant:'Mutante', Myr:'Myr', Mystic:'Místico', Naga:'Naga', Nautilus:'Nautilo',
  Nephilim:'Nephilim', Nightmare:'Pesadilla', Nightstalker:'Acechador Nocturno', Ninja:'Ninja',
  Noble:'Noble', Noggle:'Noggle', Nomad:'Nómada', Nymph:'Ninfa', Octopus:'Pulpo', Ogre:'Ogro', Ooze:'Moco',
  Orb:'Orbe', Orc:'Orco', Orgg:'Orgg', Ouphe:'Trasguillo', Ox:'Buey', Oyster:'Ostra', Pegasus:'Pegaso',
  Pentavite:'Pentavita', Pest:'Plaga', Phelddagrif:'Phelddagrif', Phoenix:'Fénix', Pilot:'Piloto',
  Pincher:'Tenazas', Pirate:'Pirata', Plant:'Planta', Praetor:'Pretor', Prism:'Prisma',
  Processor:'Procesador', Rabbit:'Conejo', Rat:'Rata', Rebel:'Rebelde', Reflection:'Reflejo',
  Rhino:'Rinoceronte', Rogue:'Pícaro', Salamander:'Salamandra', Samurai:'Samurái', Sand:'Arena',
  Saproling:'Saprolín', Satyr:'Sátiro', Scarecrow:'Espantapájaros', Scientist:'Científico',
  Scion:'Vástago', Scout:'Explorador', Serf:'Siervo', Serpent:'Serpiente', Shade:'Sombra', Shaman:'Chamán',
  Shark:'Tiburón', Sheep:'Oveja', Siren:'Sirena', Skeleton:'Esqueleto', Slith:'Deslizante',
  Sliver:'Molleja', Snake:'Serpiente', Soldier:'Soldado', Soltari:'Soltari', Spawn:'Engendro',
  Specter:'Espectro', Spellshaper:'Modelador de Hechizos', Sphinx:'Esfinge', Spider:'Araña',
  Spike:'Pincho', Spirit:'Espíritu', Sponge:'Esponja', Squid:'Calamar', Squirrel:'Ardilla',
  Starfish:'Estrella de Mar', Surrakar:'Surrakar', Survivor:'Superviviente', Tentacle:'Tentáculo',
  Thalakos:'Thalakos', Thopter:'Tóftero', Thrull:'Esclavo', Treefolk:'Arbóreo', Troll:'Trol',
  Turtle:'Tortuga', Unicorn:'Unicornio', Vampire:'Vampiro', Vedalken:'Vedalken', Viashino:'Viashino',
  Villain:'Villano', Wall:'Muro', Warrior:'Guerrero', Weird:'Raro', Werewolf:'Hombre Lobo',
  Whale:'Ballena', Wizard:'Hechicero', Wolf:'Lobo', Wolverine:'Glotón', Wombat:'Wombat', Worm:'Gusano',
  Wraith:'Espectro', Wurm:'Vermis', Yeti:'Yeti', Zombie:'Zombi', Zubera:'Zubera',
  Phyrexian:'Pirexiano', // MUY usada
};

// Encantamiento
const ENCHANTMENT_SUBTYPES: Record<string, string> = {
  Aura:'Aura', Curse:'Maldición', Class:'Clase', Background:'Trasfondo', Role:'Rol', Saga:'Saga', Shrine:'Santuario',
  Case:'Caso',
};

// Artefacto
const ARTIFACT_SUBTYPES: Record<string, string> = {
  Equipment:'Equipo', Fortification:'Fortificación', Vehicle:'Vehículo', Clue:'Pista', Food:'Comida',
  Treasure:'Tesoro', Gold:'Oro', Blood:'Sangre', Powerstone:'Piedra de poder', Map:'Mapa',
  Contraption:'Artilugio', Incubator:'Incubadora',
};

// Instant / Sorcery (pocos)
const SPELL_SUBTYPES: Record<string, string> = {
  Arcane:'Arcano', Trap:'Trampa',
};

// Tierra
const LAND_SUBTYPES: Record<string, string> = {
  Forest:'Bosque', Island:'Isla', Mountain:'Montaña', Plains:'Llanura', Swamp:'Pantano',
  Desert:'Desierto', Gate:'Puerta', Lair:'Guarida', Locus:'Enclave',
  'Urza\'s':'de Urza', Mine:'Mina', Tower:'Torre', 'Power-Plant':'Planta de energía',
};

// Batallas
const BATTLE_SUBTYPES: Record<string, string> = { Siege: 'Asedio' };

// Utilidad: normalizar separador de subtipos
const SEP = ' — ';
const normalizeDash = (s: string) => s.replace(/\s+—\s+|\s+-\s+/g, SEP);

// Traduce lista de subtipos según categoría
function translateSubtypes(subs: string[], categoryGuess: string[]): string[] {
  // Si incluye Creature, prioriza criaturas; si incluye Enchantment, etc.
  const has = (t: string) => categoryGuess.includes(t);

  const dicts: Record<string, string>[] = [];
  if (has('Creature')) dicts.push(CREATURE_SUBTYPES);
  if (has('Enchantment')) dicts.push(ENCHANTMENT_SUBTYPES);
  if (has('Artifact')) dicts.push(ARTIFACT_SUBTYPES);
  if (has('Instant') || has('Sorcery') || has('Tribal')) dicts.push(SPELL_SUBTYPES);
  if (has('Land')) dicts.push(LAND_SUBTYPES);
  if (has('Battle')) dicts.push(BATTLE_SUBTYPES);

  // Búsqueda por orden, con fallback a original
  return subs.map((w) => {
    for (const d of dicts) {
      if (d[w]) return d[w];
    }
    // Fallback: si no hay dict específico, prueba con criatura (suele cubrir “Phyrexian”, etc.)
    if (CREATURE_SUBTYPES[w]) return CREATURE_SUBTYPES[w];
    return w; // deja como está si no conocemos la traducción
  });
}

// Traduce la parte izquierda (supertypes + types)
function translateLeftPart(leftRaw: string): { leftEs: string; leftTokens: string[] } {
  // Tokens separados por espacio, pero mantenemos palabras compuestas como "Artifact" "Creature" por separado
  const tokens = leftRaw.trim().split(/\s+/g);
  const leftTokens: string[] = [];
  const out: string[] = [];

  tokens.forEach((tok) => {
    leftTokens.push(tok);
    if (SUPERTYPE_MAP[tok]) out.push(SUPERTYPE_MAP[tok]);
    else if (TYPE_MAP[tok]) out.push(TYPE_MAP[tok]);
    else out.push(tok);
  });

  // Gramática típica “Criatura artefacto” cuando coexisten Artifact + Creature:
  // Simple: si contiene ambos, reordena a "Criatura artefacto"
  const has = (t: string) => tokens.includes(t);
  if (has('Artifact') && has('Creature')) {
    // Forzar “Criatura artefacto …”
    const filtered = out.filter((w) => w !== TYPE_MAP.Artifact && w !== TYPE_MAP.Creature);
    const prefix = `${TYPE_MAP.Creature} ${TYPE_MAP.Artifact}`; // "Criatura artefacto"
    return { leftEs: [prefix, ...filtered].join(' '), leftTokens: tokens };
  }

  return { leftEs: out.join(' '), leftTokens: tokens };
}

// Traducción principal (maneja doble cara)
export function translateTypeLine(typeLine?: string | null): string {
  if (!typeLine) return '';
  // DFC: “A // B”
  return typeLine.split(/\s*\/\/\s*/g).map((side) => {
    const normalized = normalizeDash(side);
    const [leftRaw, rightRaw] = normalized.split(SEP).map((s) => s?.trim());
    const { leftEs, leftTokens } = translateLeftPart(leftRaw || '');

    if (!rightRaw) return leftEs;

    const subTokens = rightRaw.split(/\s+/g).filter(Boolean);
    const translatedSubs = translateSubtypes(subTokens, leftTokens);
    return `${leftEs}${SEP}${translatedSubs.join(' ')}`;
  }).join(' // ');
}

// Helpers por si quieres traducir piezas sueltas
export const mtgTranslate = {
  translateTypeLine,
  TYPE_MAP, SUPERTYPE_MAP,
  CREATURE_SUBTYPES, ENCHANTMENT_SUBTYPES, ARTIFACT_SUBTYPES, LAND_SUBTYPES,
};
