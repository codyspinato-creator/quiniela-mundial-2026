// src/data.js

export const GRUPOS = {
  A: { equipos: ["🇲🇽 México","🇿🇦 Sudáfrica","🇰🇷 Corea del Sur","🇨🇿 Rep. Checa"], color:"#006341", accent:"#ffffff",
    partidos:[{f:1,local:"🇲🇽 México",visita:"🇿🇦 Sudáfrica",fecha:"11 jun"},{f:1,local:"🇰🇷 Corea del Sur",visita:"🇨🇿 Rep. Checa",fecha:"11 jun"},{f:2,local:"🇨🇿 Rep. Checa",visita:"🇿🇦 Sudáfrica",fecha:"18 jun"},{f:2,local:"🇲🇽 México",visita:"🇰🇷 Corea del Sur",fecha:"18 jun"},{f:3,local:"🇨🇿 Rep. Checa",visita:"🇲🇽 México",fecha:"24 jun"},{f:3,local:"🇿🇦 Sudáfrica",visita:"🇰🇷 Corea del Sur",fecha:"24 jun"}]},
  B: { equipos: ["🇨🇦 Canadá","🇨🇭 Suiza","🇶🇦 Qatar","🇧🇦 Bosnia y Herz."], color:"#bf0000", accent:"#ffffff",
    partidos:[{f:1,local:"🇨🇦 Canadá",visita:"🇧🇦 Bosnia y Herz.",fecha:"12 jun"},{f:1,local:"🇶🇦 Qatar",visita:"🇨🇭 Suiza",fecha:"13 jun"},{f:2,local:"🇨🇭 Suiza",visita:"🇧🇦 Bosnia y Herz.",fecha:"18 jun"},{f:2,local:"🇨🇦 Canadá",visita:"🇶🇦 Qatar",fecha:"18 jun"},{f:3,local:"🇨🇭 Suiza",visita:"🇨🇦 Canadá",fecha:"24 jun"},{f:3,local:"🇧🇦 Bosnia y Herz.",visita:"🇶🇦 Qatar",fecha:"24 jun"}]},
  C: { equipos: ["🇧🇷 Brasil","🇲🇦 Marruecos","🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia","🇭🇹 Haití"], color:"#009c3b", accent:"#ffdf00",
    partidos:[{f:1,local:"🇧🇷 Brasil",visita:"🇲🇦 Marruecos",fecha:"13 jun"},{f:1,local:"🇭🇹 Haití",visita:"🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia",fecha:"13 jun"},{f:2,local:"🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia",visita:"🇲🇦 Marruecos",fecha:"19 jun"},{f:2,local:"🇧🇷 Brasil",visita:"🇭🇹 Haití",fecha:"19 jun"},{f:3,local:"🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia",visita:"🇧🇷 Brasil",fecha:"24 jun"},{f:3,local:"🇲🇦 Marruecos",visita:"🇭🇹 Haití",fecha:"26 jun"}]},
  D: { equipos: ["🇺🇸 EE.UU.","🇵🇾 Paraguay","🇦🇺 Australia","🇹🇷 Turquía"], color:"#002868", accent:"#bf0a30",
    partidos:[{f:1,local:"🇺🇸 EE.UU.",visita:"🇵🇾 Paraguay",fecha:"12 jun"},{f:1,local:"🇦🇺 Australia",visita:"🇹🇷 Turquía",fecha:"13 jun"},{f:2,local:"🇹🇷 Turquía",visita:"🇵🇾 Paraguay",fecha:"19 jun"},{f:2,local:"🇺🇸 EE.UU.",visita:"🇦🇺 Australia",fecha:"19 jun"},{f:3,local:"🇹🇷 Turquía",visita:"🇺🇸 EE.UU.",fecha:"26 jun"},{f:3,local:"🇵🇾 Paraguay",visita:"🇦🇺 Australia",fecha:"25 jun"}]},
  E: { equipos: ["🇩🇪 Alemania","🇪🇨 Ecuador","🇨🇮 Costa de Marfil","🇨🇼 Curazao"], color:"#1a1a1a", accent:"#dd0000",
    partidos:[{f:1,local:"🇩🇪 Alemania",visita:"🇨🇼 Curazao",fecha:"14 jun"},{f:1,local:"🇨🇮 Costa de Marfil",visita:"🇪🇨 Ecuador",fecha:"14 jun"},{f:2,local:"🇩🇪 Alemania",visita:"🇨🇮 Costa de Marfil",fecha:"20 jun"},{f:2,local:"🇨🇼 Curazao",visita:"🇪🇨 Ecuador",fecha:"20 jun"},{f:3,local:"🇪🇨 Ecuador",visita:"🇩🇪 Alemania",fecha:"25 jun"},{f:3,local:"🇨🇼 Curazao",visita:"🇨🇮 Costa de Marfil",fecha:"25 jun"}]},
  F: { equipos: ["🇳🇱 Países Bajos","🇯🇵 Japón","🇸🇪 Suecia","🇹🇳 Túnez"], color:"#ae1c28", accent:"#ffffff",
    partidos:[{f:1,local:"🇳🇱 Países Bajos",visita:"🇯🇵 Japón",fecha:"14 jun"},{f:1,local:"🇸🇪 Suecia",visita:"🇹🇳 Túnez",fecha:"14 jun"},{f:2,local:"🇳🇱 Países Bajos",visita:"🇸🇪 Suecia",fecha:"20 jun"},{f:2,local:"🇹🇳 Túnez",visita:"🇯🇵 Japón",fecha:"20 jun"},{f:3,local:"🇯🇵 Japón",visita:"🇸🇪 Suecia",fecha:"25 jun"},{f:3,local:"🇹🇳 Túnez",visita:"🇳🇱 Países Bajos",fecha:"25 jun"}]},
  G: { equipos: ["🇧🇪 Bélgica","🇮🇷 Irán","🇳🇿 Nueva Zelanda","🇪🇬 Egipto"], color:"#1a1200", accent:"#fdda24",
    partidos:[{f:1,local:"🇮🇷 Irán",visita:"🇳🇿 Nueva Zelanda",fecha:"15 jun"},{f:1,local:"🇧🇪 Bélgica",visita:"🇪🇬 Egipto",fecha:"15 jun"},{f:2,local:"🇧🇪 Bélgica",visita:"🇮🇷 Irán",fecha:"21 jun"},{f:2,local:"🇳🇿 Nueva Zelanda",visita:"🇪🇬 Egipto",fecha:"21 jun"},{f:3,local:"🇪🇬 Egipto",visita:"🇮🇷 Irán",fecha:"27 jun"},{f:3,local:"🇳🇿 Nueva Zelanda",visita:"🇧🇪 Bélgica",fecha:"27 jun"}]},
  H: { equipos: ["🇪🇸 España","🇺🇾 Uruguay","🇸🇦 Arabia Saudita","🇨🇻 Cabo Verde"], color:"#c60b1e", accent:"#ffc400",
    partidos:[{f:1,local:"🇪🇸 España",visita:"🇨🇻 Cabo Verde",fecha:"15 jun"},{f:1,local:"🇸🇦 Arabia Saudita",visita:"🇺🇾 Uruguay",fecha:"15 jun"},{f:2,local:"🇺🇾 Uruguay",visita:"🇪🇸 España",fecha:"21 jun"},{f:2,local:"🇨🇻 Cabo Verde",visita:"🇸🇦 Arabia Saudita",fecha:"21 jun"},{f:3,local:"🇺🇾 Uruguay",visita:"🇨🇻 Cabo Verde",fecha:"27 jun"},{f:3,local:"🇸🇦 Arabia Saudita",visita:"🇪🇸 España",fecha:"27 jun"}]},
  I: { equipos: ["🇫🇷 Francia","🇸🇳 Senegal","🇳🇴 Noruega","🇮🇶 Irak"], color:"#002395", accent:"#ed2939",
    partidos:[{f:1,local:"🇫🇷 Francia",visita:"🇸🇳 Senegal",fecha:"16 jun"},{f:1,local:"🇮🇶 Irak",visita:"🇳🇴 Noruega",fecha:"16 jun"},{f:2,local:"🇳🇴 Noruega",visita:"🇫🇷 Francia",fecha:"22 jun"},{f:2,local:"🇸🇳 Senegal",visita:"🇮🇶 Irak",fecha:"22 jun"},{f:3,local:"🇳🇴 Noruega",visita:"🇸🇳 Senegal",fecha:"26 jun"},{f:3,local:"🇮🇶 Irak",visita:"🇫🇷 Francia",fecha:"26 jun"}]},
  J: { equipos: ["🇦🇷 Argentina","🇩🇿 Argelia","🇦🇹 Austria","🇯🇴 Jordania"], color:"#003580", accent:"#ffffff",
    partidos:[{f:1,local:"🇦🇷 Argentina",visita:"🇩🇿 Argelia",fecha:"16 jun"},{f:1,local:"🇦🇹 Austria",visita:"🇯🇴 Jordania",fecha:"16 jun"},{f:2,local:"🇦🇷 Argentina",visita:"🇦🇹 Austria",fecha:"22 jun"},{f:2,local:"🇩🇿 Argelia",visita:"🇯🇴 Jordania",fecha:"22 jun"},{f:3,local:"🇩🇿 Argelia",visita:"🇦🇹 Austria",fecha:"27 jun"},{f:3,local:"🇯🇴 Jordania",visita:"🇦🇷 Argentina",fecha:"27 jun"}]},
  K: { equipos: ["🇵🇹 Portugal","🇨🇴 Colombia","🇺🇿 Uzbekistán","🇨🇩 R.D. Congo"], color:"#006600", accent:"#ffcd00",
    partidos:[{f:1,local:"🇵🇹 Portugal",visita:"🇨🇩 R.D. Congo",fecha:"17 jun"},{f:1,local:"🇺🇿 Uzbekistán",visita:"🇨🇴 Colombia",fecha:"17 jun"},{f:2,local:"🇵🇹 Portugal",visita:"🇺🇿 Uzbekistán",fecha:"23 jun"},{f:2,local:"🇨🇩 R.D. Congo",visita:"🇨🇴 Colombia",fecha:"23 jun"},{f:3,local:"🇨🇴 Colombia",visita:"🇵🇹 Portugal",fecha:"27 jun"},{f:3,local:"🇨🇩 R.D. Congo",visita:"🇺🇿 Uzbekistán",fecha:"27 jun"}]},
  L: { equipos: ["🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra","🇭🇷 Croacia","🇬🇭 Ghana","🇵🇦 Panamá"], color:"#012169", accent:"#c8102e",
    partidos:[{f:1,local:"🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra",visita:"🇭🇷 Croacia",fecha:"17 jun"},{f:1,local:"🇬🇭 Ghana",visita:"🇵🇦 Panamá",fecha:"17 jun"},{f:2,local:"🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra",visita:"🇬🇭 Ghana",fecha:"23 jun"},{f:2,local:"🇵🇦 Panamá",visita:"🇭🇷 Croacia",fecha:"23 jun"},{f:3,local:"🇵🇦 Panamá",visita:"🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra",fecha:"27 jun"},{f:3,local:"🇭🇷 Croacia",visita:"🇬🇭 Ghana",fecha:"27 jun"}]},
};

export const KEYS = Object.keys(GRUPOS);

export const SELECCIONES = [
  "🇦🇷 Argentina","🇫🇷 Francia","🇧🇷 Brasil","🇪🇸 España","🇵🇹 Portugal",
  "🇳🇱 Países Bajos","🇩🇪 Alemania","🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra","🇲🇽 México","🇺🇾 Uruguay",
  "🇧🇪 Bélgica","🇲🇦 Marruecos","🇨🇴 Colombia","🇯🇵 Japón","🇸🇳 Senegal",
  "🇺🇸 EE.UU.","🇨🇦 Canadá","🇭🇷 Croacia","🇸🇪 Suecia","🇳🇴 Noruega","🇪🇨 Ecuador",
];

export const GOLEADORES = [
  {nombre:"K. Mbappé",    sel:"🇫🇷", club:"Real Madrid"},
  {nombre:"E. Haaland",   sel:"🇳🇴", club:"Man. City"},
  {nombre:"H. Kane",      sel:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", club:"Bayern"},
  {nombre:"Lamine Yamal", sel:"🇪🇸", club:"Barcelona"},
  {nombre:"Vinicius Jr.", sel:"🇧🇷", club:"Real Madrid"},
  {nombre:"L. Messi",     sel:"🇦🇷", club:"Inter Miami"},
  {nombre:"C. Ronaldo",   sel:"🇵🇹", club:"Al Nassr"},
  {nombre:"J. Bellingham",sel:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", club:"Real Madrid"},
  {nombre:"Raphinha",     sel:"🇧🇷", club:"Barcelona"},
  {nombre:"L. Martínez",  sel:"🇦🇷", club:"Inter"},
  {nombre:"L. Díaz",      sel:"🇨🇴", club:"Liverpool"},
  {nombre:"Santi Giménez",sel:"🇲🇽", club:"AC Milan"},
  {nombre:"R. Leão",      sel:"🇵🇹", club:"AC Milan"},
  {nombre:"A. Saka",      sel:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", club:"Arsenal"},
  {nombre:"Otro...",      sel:"⚽",  club:""},
];

export function calcTabla(equipos, partidos, marcadores) {
  const t = {};
  equipos.forEach(e => { t[e] = { pts:0, jj:0, gf:0, gc:0 }; });
  partidos.forEach((p, i) => {
    const m = marcadores[i];
    const gl = parseInt(m?.local), gv = parseInt(m?.visita);
    if (isNaN(gl) || isNaN(gv)) return;
    t[p.local].jj++; t[p.local].gf += gl; t[p.local].gc += gv;
    t[p.visita].jj++; t[p.visita].gf += gv; t[p.visita].gc += gl;
    if (gl > gv) t[p.local].pts += 3;
    else if (gl === gv) { t[p.local].pts++; t[p.visita].pts++; }
    else t[p.visita].pts += 3;
  });
  return Object.entries(t).sort((a, b) => {
    if (b[1].pts !== a[1].pts) return b[1].pts - a[1].pts;
    const da = a[1].gf - a[1].gc, db = b[1].gf - b[1].gc;
    if (db !== da) return db - da;
    return b[1].gf - a[1].gf;
  });
}

export function completionPct(quiniela) {
  const totalP = KEYS.reduce((s, g) => s + GRUPOS[g].partidos.length, 0);
  const filled = KEYS.reduce((s, g) => {
    const ms = (quiniela.scores || {})[g] || [];
    return s + GRUPOS[g].partidos.filter((_, i) => {
      const m = ms[i];
      return m && m.local !== "" && m.visita !== "" && !isNaN(parseInt(m.local)) && !isNaN(parseInt(m.visita));
    }).length;
  }, 0);
  const extras = [quiniela.campeon, quiniela.segundo, quiniela.tercero, quiniela.goleador].filter(Boolean).length;
  return { partidos: filled, total: totalP, extras, pct: Math.round((filled / totalP) * 100) };
}

// ─── BRACKET SEEDING FIFA 2026 OFICIAL ───────────────────────────────────────
//
// DIECISEISAVOS (R32) - 16 partidos
// Zona Alta:
//   M1:  1A vs mejor 3°         (Ciudad de México)
//   M2:  1E vs 2F               (Boston)
//   M3:  1F vs 2E               (Houston)
//   M4:  1I vs 2J               (Filadelfia)
//   M5:  1L vs 2K               (Toronto)
//   M6:  2A vs 2B               (Los Ángeles) - duelo de sublíderes
//   M7:  1G vs mejor 3°         (Seattle)
//   M8:  1K vs mejor 3°         (Kansas City)
// Zona Baja:
//   M9:  1B vs mejor 3°         (Vancouver)
//   M10: 1D vs 2C               (Dallas)
//   M11: 1C vs 2D               (Atlanta)  
//   M12: 1J vs mejor 3°         (Miami)
//   M13: 1H vs 2G               (Nueva York/NJ)
//   M14: 2K vs 2L               (Toronto) - duelo sublíderes
//   M15: 1B vs mejor 3°         (Vancouver)  
//   M16: 1G vs 2H               (Seattle)
//
// OCTAVOS (R16): ganadores de R32 se enfrentan por lado del cuadro
// CUARTOS: 9-jul Boston, 10-jul LA, 11-jul Miami, 11-jul Kansas City
// SEMIS: 14-jul Dallas, 15-jul Atlanta
// TERCER PUESTO: 18-jul Miami | FINAL: 19-jul Nueva York/NJ

export const R32_BRACKET = [
  // ── ZONA ALTA ──────────────────────────────────────────────────────────────
  { local: "1A", visita: "3°mejor",  sede: "Ciudad de México" },  // M1
  { local: "1E", visita: "2F",       sede: "Boston"           },  // M2
  { local: "1F", visita: "2E",       sede: "Houston"          },  // M3
  { local: "1I", visita: "2J",       sede: "Filadelfia"       },  // M4
  { local: "1L", visita: "2K",       sede: "Toronto"          },  // M5
  { local: "2A", visita: "2B",       sede: "Los Ángeles"      },  // M6
  { local: "1G", visita: "3°mejor",  sede: "Seattle"          },  // M7
  { local: "1K", visita: "3°mejor",  sede: "Kansas City"      },  // M8
  // ── ZONA BAJA ──────────────────────────────────────────────────────────────
  { local: "1B", visita: "3°mejor",  sede: "Vancouver"        },  // M9
  { local: "1D", visita: "2C",       sede: "Dallas"           },  // M10
  { local: "1C", visita: "2D",       sede: "Atlanta"          },  // M11
  { local: "1J", visita: "3°mejor",  sede: "Miami"            },  // M12
  { local: "1H", visita: "2G",       sede: "Nueva York/NJ"    },  // M13
  { local: "2K", visita: "2L",       sede: "Toronto"          },  // M14
  { local: "1B", visita: "3°mejor",  sede: "Vancouver"        },  // M15 - ajustar
  { local: "1G", visita: "2H",       sede: "Seattle"          },  // M16
];

// OCTAVOS: ganadores de R32 por lado del cuadro
// Lado Izq: W(M2) vs W(M3), W(M4) vs W(M1), etc.
export const R16_BRACKET = [
  { l:"W1",  v:"W0",  sede:"Filadelfia"   },  // W(Boston) vs W(CdMex)
  { l:"W2",  v:"W3",  sede:"Houston"      },  // W(Houston) vs W(Filadelfia)
  { l:"W5",  v:"W4",  sede:"Los Ángeles"  },  // W(Toronto) vs W(Boston)
  { l:"W6",  v:"W7",  sede:"Seattle"      },  // W(LA) vs W(Seattle)
  { l:"W9",  v:"W8",  sede:"Dallas"       },  // W(Vancouver) vs W(Kansas City)
  { l:"W10", v:"W11", sede:"Atlanta"      },  // W(Dallas) vs W(Atlanta)
  { l:"W12", v:"W13", sede:"Miami"        },  // W(Miami) vs W(NY/NJ)
  { l:"W14", v:"W15", sede:"Vancouver"    },  // W(Toronto2) vs W(Seattle2)
];

// CUARTOS
export const QF_BRACKET = [
  { l:"W0", v:"W1", sede:"Boston",      fecha:"9 jul"  },
  { l:"W2", v:"W3", sede:"Los Ángeles", fecha:"10 jul" },
  { l:"W4", v:"W5", sede:"Miami",       fecha:"11 jul" },
  { l:"W6", v:"W7", sede:"Kansas City", fecha:"11 jul" },
];

// SEMIFINALES
export const SF_BRACKET = [
  { l:"W0", v:"W1", sede:"Dallas (AT&T Stadium)",          fecha:"14 jul" },
  { l:"W2", v:"W3", sede:"Atlanta (Mercedes-Benz Stadium)", fecha:"15 jul" },
];

export function getGroupClassified(scores) {
  const result = {}; // { "1A": "🇦🇷 Argentina", "2A": "🇧🇷 Brasil", ... }
  const thirds = []; // array of { group, team, pts, gf, gc }

  KEYS.forEach(g => {
    const gr = GRUPOS[g];
    const ms = gr.partidos.map((_, i) => scores?.[g]?.[i] || { local: "", visita: "" });
    const tabla = calcTabla(gr.equipos, gr.partidos, ms);

    if (tabla[0] && tabla[0][1].jj > 0) {
      result[`1${g}`] = tabla[0][0];
    }
    if (tabla[1] && tabla[1][1].jj > 0) {
      result[`2${g}`] = tabla[1][0];
    }
    if (tabla[2] && tabla[2][1].jj > 0) {
      thirds.push({
        group: g, team: tabla[2][0],
        pts: tabla[2][1].pts, gf: tabla[2][1].gf, gc: tabla[2][1].gc,
        dif: tabla[2][1].gf - tabla[2][1].gc,
      });
    }
  });

  // Sort thirds by pts > dif > gf
  thirds.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dif !== a.dif) return b.dif - a.dif;
    return b.gf - a.gf;
  });

  // Assign best 8 thirds to their bracket slots (simplified - assign in order)
  const topThirds = thirds.slice(0, 8);
  const groupsOf8 = ["ABCD", "EFGH", "IJKL", "ABEF", "CDIJ", "GHKL", "ACDE", "BFJK"];
  groupsOf8.forEach((key, i) => {
    if (topThirds[i]) result[`3${key}`] = topThirds[i].team;
  });

  return result;
}

// ─── Build bracket from classified + round winners ────────────────────────────
export function buildBracket(scores, knockout) {
  const classified = getGroupClassified(scores);

  const newKO = {};

  // ── R32: fill from group classified ────────────────────────────────────────
  newKO.r32 = R32_BRACKET.map((slot, i) => {
    const existing = knockout?.r32?.[i] || {};
    return {
      id: i,
      local: classified[slot.local] || existing.local || "",
      visita: classified[slot.visita] || existing.visita || "",
      localGoles: existing.localGoles || "",
      visitaGoles: existing.visitaGoles || "",
      ganador: existing.ganador || "",
      penaltis: existing.penaltis || false,
      penaltisGanador: existing.penaltisGanador || "",
    };
  });

  // ── R16: fill from R32 winners ─────────────────────────────────────────────
  newKO.r16 = R16_BRACKET.map((slot, i) => {
    const existing = knockout?.r16?.[i] || {};
    const wIdx = parseInt(slot.local.replace("W", ""));
    const vIdx = parseInt(slot.visita.replace("W", ""));
    const localTeam = newKO.r32[wIdx]?.ganador || existing.local || "";
    const visitaTeam = newKO.r32[vIdx]?.ganador || existing.visita || "";
    return {
      id: i, local: localTeam, visita: visitaTeam,
      localGoles: localTeam !== existing.local ? "" : existing.localGoles || "",
      visitaGoles: visitaTeam !== existing.visita ? "" : existing.visitaGoles || "",
      ganador: (localTeam === existing.local && visitaTeam === existing.visita) ? existing.ganador || "" : "",
      penaltis: false, penaltisGanador: "",
    };
  });

  // ── QF: fill from R16 winners ──────────────────────────────────────────────
  newKO.qf = QF_BRACKET.map((slot, i) => {
    const existing = knockout?.qf?.[i] || {};
    const wIdx = parseInt(slot.local.replace("W", ""));
    const vIdx = parseInt(slot.visita.replace("W", ""));
    const localTeam = newKO.r16[wIdx]?.ganador || existing.local || "";
    const visitaTeam = newKO.r16[vIdx]?.ganador || existing.visita || "";
    return {
      id: i, local: localTeam, visita: visitaTeam,
      localGoles: localTeam !== existing.local ? "" : existing.localGoles || "",
      visitaGoles: visitaTeam !== existing.visita ? "" : existing.visitaGoles || "",
      ganador: (localTeam === existing.local && visitaTeam === existing.visita) ? existing.ganador || "" : "",
      penaltis: false, penaltisGanador: "",
    };
  });

  // ── SF: fill from QF winners ───────────────────────────────────────────────
  newKO.sf = SF_BRACKET.map((slot, i) => {
    const existing = knockout?.sf?.[i] || {};
    const wIdx = parseInt(slot.local.replace("W", ""));
    const vIdx = parseInt(slot.visita.replace("W", ""));
    const localTeam = newKO.qf[wIdx]?.ganador || existing.local || "";
    const visitaTeam = newKO.qf[vIdx]?.ganador || existing.visita || "";
    return {
      id: i, local: localTeam, visita: visitaTeam,
      localGoles: localTeam !== existing.local ? "" : existing.localGoles || "",
      visitaGoles: visitaTeam !== existing.visita ? "" : existing.visitaGoles || "",
      ganador: (localTeam === existing.local && visitaTeam === existing.visita) ? existing.ganador || "" : "",
      penaltis: false, penaltisGanador: "",
    };
  });

  // ── Final: fill from SF winners ────────────────────────────────────────────
  const sfW0 = newKO.sf[0]?.ganador || knockout?.final?.[0]?.local || "";
  const sfW1 = newKO.sf[1]?.ganador || knockout?.final?.[0]?.visita || "";
  const existingFinal = knockout?.final?.[0] || {};
  newKO.final = [{
    id: 0, local: sfW0, visita: sfW1,
    localGoles: sfW0 !== existingFinal.local ? "" : existingFinal.localGoles || "",
    visitaGoles: sfW1 !== existingFinal.visita ? "" : existingFinal.visitaGoles || "",
    ganador: (sfW0 === existingFinal.local && sfW1 === existingFinal.visita) ? existingFinal.ganador || "" : "",
    penaltis: false, penaltisGanador: "",
  }];

  // ── 3rd place: fill from SF losers ────────────────────────────────────────
  const sf0Loser = newKO.sf[0]?.ganador
    ? (newKO.sf[0].ganador === newKO.sf[0].local ? newKO.sf[0].visita : newKO.sf[0].local)
    : knockout?.third?.[0]?.local || "";
  const sf1Loser = newKO.sf[1]?.ganador
    ? (newKO.sf[1].ganador === newKO.sf[1].local ? newKO.sf[1].visita : newKO.sf[1].local)
    : knockout?.third?.[0]?.visita || "";
  const existingThird = knockout?.third?.[0] || {};
  newKO.third = [{
    id: 0, local: sf0Loser, visita: sf1Loser,
    localGoles: sf0Loser !== existingThird.local ? "" : existingThird.localGoles || "",
    visitaGoles: sf1Loser !== existingThird.visita ? "" : existingThird.visitaGoles || "",
    ganador: (sf0Loser === existingThird.local && sf1Loser === existingThird.visita) ? existingThird.ganador || "" : "",
    penaltis: false, penaltisGanador: "",
  }];

  return newKO;
}

// ─── BRACKET SEEDING ─────────────────────────────────────────────────────────
export const R32_BRACKET = [
  { local: "1A", visita: "2B" }, { local: "1C", visita: "2D" },
  { local: "1E", visita: "2F" }, { local: "1G", visita: "2H" },
  { local: "1I", visita: "2J" }, { local: "1K", visita: "2L" },
  { local: "1B", visita: "2A" }, { local: "1D", visita: "2C" },
  { local: "1F", visita: "2E" }, { local: "1H", visita: "2G" },
  { local: "1J", visita: "2I" }, { local: "1L", visita: "2K" },
  { local: "3ABCD", visita: "3EFGH" }, { local: "3IJKL", visita: "3ABEF" },
  { local: "3CDIJ", visita: "3GHKL" }, { local: "3ACDE", visita: "3BFJK" },
];
export const R16_BRACKET = [
  {l:"W0",v:"W1"},{l:"W2",v:"W3"},{l:"W4",v:"W5"},{l:"W6",v:"W7"},
  {l:"W8",v:"W9"},{l:"W10",v:"W11"},{l:"W12",v:"W13"},{l:"W14",v:"W15"},
];
export const QF_BRACKET = [{l:"W0",v:"W1"},{l:"W2",v:"W3"},{l:"W4",v:"W5"},{l:"W6",v:"W7"}];
export const SF_BRACKET = [{l:"W0",v:"W1"},{l:"W2",v:"W3"}];

export function getGroupClassified(scores) {
  const result = {};
  const thirds = [];
  KEYS.forEach(g => {
    const gr = GRUPOS[g];
    const ms = gr.partidos.map((_,i) => scores?.[g]?.[i] || {local:"",visita:""});
    const tabla = calcTabla(gr.equipos, gr.partidos, ms);
    if (tabla[0]&&tabla[0][1].jj>0) result["1"+g] = tabla[0][0];
    if (tabla[1]&&tabla[1][1].jj>0) result["2"+g] = tabla[1][0];
    if (tabla[2]&&tabla[2][1].jj>0) thirds.push({group:g,team:tabla[2][0],pts:tabla[2][1].pts,dif:tabla[2][1].gf-tabla[2][1].gc,gf:tabla[2][1].gf});
  });
  thirds.sort((a,b)=>b.pts!==a.pts?b.pts-a.pts:b.dif!==a.dif?b.dif-a.dif:b.gf-a.gf);
  ["ABCD","EFGH","IJKL","ABEF","CDIJ","GHKL","ACDE","BFJK"].forEach((k,i)=>{
    if (thirds[i]) result["3"+k] = thirds[i].team;
  });
  return result;
}

function makeMatch(i, local, visita, existing) {
  const same = local===existing?.local && visita===existing?.visita;
  return {
    id:i, local, visita,
    localGoles: same ? existing.localGoles||"" : "",
    visitaGoles: same ? existing.visitaGoles||"" : "",
    ganador: same ? existing.ganador||"" : "",
    penaltis: same ? existing.penaltis||false : false,
    penaltisGanador: same ? existing.penaltisGanador||"" : "",
  };
}

export function buildBracket(scores, knockout) {
  const c = getGroupClassified(scores);
  const ko = {};

  // R32: fill from group classified, keep sede info
  ko.r32 = R32_BRACKET.map((s,i) => {
    const local = c[s.local] || "";
    // For 3rd place slots, leave blank (user fills manually)
    const visita = s.visita.startsWith("3°") ? "" : (c[s.visita]||"");
    const m = makeMatch(i, local, visita, knockout?.r32?.[i]);
    return { ...m, sede: s.sede };
  });

  ko.r16 = R16_BRACKET.map((s,i) => {
    const li=parseInt(s.l.replace("W","")), vi=parseInt(s.v.replace("W",""));
    const m = makeMatch(i, ko.r32[li]?.ganador||"", ko.r32[vi]?.ganador||"", knockout?.r16?.[i]);
    return { ...m, sede: s.sede };
  });

  ko.qf = QF_BRACKET.map((s,i) => {
    const li=parseInt(s.l.replace("W","")), vi=parseInt(s.v.replace("W",""));
    const m = makeMatch(i, ko.r16[li]?.ganador||"", ko.r16[vi]?.ganador||"", knockout?.qf?.[i]);
    return { ...m, sede: s.sede, fecha: s.fecha };
  });

  ko.sf = SF_BRACKET.map((s,i) => {
    const li=parseInt(s.l.replace("W","")), vi=parseInt(s.v.replace("W",""));
    const m = makeMatch(i, ko.qf[li]?.ganador||"", ko.qf[vi]?.ganador||"", knockout?.sf?.[i]);
    return { ...m, sede: s.sede, fecha: s.fecha };
  });

  const sfW0=ko.sf[0]?.ganador||"", sfW1=ko.sf[1]?.ganador||"";
  ko.final = [{ ...makeMatch(0, sfW0, sfW1, knockout?.final?.[0]),
    sede: "MetLife Stadium, Nueva York/NJ", fecha: "19 jul" }];

  const sf0L=ko.sf[0]?.ganador?(ko.sf[0].ganador===ko.sf[0].local?ko.sf[0].visita:ko.sf[0].local):"";
  const sf1L=ko.sf[1]?.ganador?(ko.sf[1].ganador===ko.sf[1].local?ko.sf[1].visita:ko.sf[1].local):"";
  ko.third = [{ ...makeMatch(0, sf0L, sf1L, knockout?.third?.[0]),
    sede: "Hard Rock Stadium, Miami", fecha: "18 jul" }];

  return ko;
}
