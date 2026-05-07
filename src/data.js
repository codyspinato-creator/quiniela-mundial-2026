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


// ─── BRACKET FIFA 2026 OFICIAL ────────────────────────────────────────────────
// Dieciseisavos P73-P88, Octavos P89-P96, Cuartos P97-P100, Semis P101-P102
// Tercer Puesto P103, Final P104

export const R32_BRACKET = [
  // P73  (idx 0)
  { num:"P73",  local:"2A", visita:"2B",       fecha:"28 jun", sede:"Los Ángeles"    },
  // P74  (idx 1)
  { num:"P74",  local:"1E", visita:"3ABCDF",   fecha:"29 jun", sede:"Boston"         },
  // P75  (idx 2)
  { num:"P75",  local:"1F", visita:"2C",       fecha:"29 jun", sede:"Monterrey"      },
  // P76  (idx 3)
  { num:"P76",  local:"1C", visita:"2F",       fecha:"29 jun", sede:"Houston"        },
  // P77  (idx 4)
  { num:"P77",  local:"1I", visita:"3CDFGH",   fecha:"30 jun", sede:"Nueva York/NJ"  },
  // P78  (idx 5)
  { num:"P78",  local:"2E", visita:"2I",       fecha:"30 jun", sede:"Dallas"         },
  // P79  (idx 6)
  { num:"P79",  local:"1A", visita:"3CEFHI",   fecha:"30 jun", sede:"Ciudad de México"},
  // P80  (idx 7)
  { num:"P80",  local:"1L", visita:"3EHIJK",   fecha:"1 jul",  sede:"Atlanta"        },
  // P81  (idx 8)
  { num:"P81",  local:"1D", visita:"3BEFIJ",   fecha:"1 jul",  sede:"San Francisco"  },
  // P82  (idx 9)
  { num:"P82",  local:"1G", visita:"3AEHIJ",   fecha:"1 jul",  sede:"Seattle"        },
  // P83  (idx 10)
  { num:"P83",  local:"2K", visita:"2L",       fecha:"2 jul",  sede:"Toronto"        },
  // P84  (idx 11)
  { num:"P84",  local:"1H", visita:"2J",       fecha:"2 jul",  sede:"Los Ángeles"    },
  // P85  (idx 12)
  { num:"P85",  local:"1B", visita:"3EFGIJ",   fecha:"2 jul",  sede:"Vancouver"      },
  // P86  (idx 13)
  { num:"P86",  local:"1J", visita:"2H",       fecha:"3 jul",  sede:"Miami"          },
  // P87  (idx 14)
  { num:"P87",  local:"1K", visita:"3DEIJL",   fecha:"3 jul",  sede:"Kansas City"    },
  // P88  (idx 15)
  { num:"P88",  local:"2D", visita:"2G",       fecha:"3 jul",  sede:"Dallas"         },
];

// Octavos P89-P96
// idx en R32: P73=0, P74=1, P75=2, P76=3, P77=4, P78=5, P79=6, P80=7
//             P81=8, P82=9, P83=10, P84=11, P85=12, P86=13, P87=14, P88=15
export const R16_BRACKET = [
  { num:"P89",  l:"W1",  v:"W4",  fecha:"4 jul",  sede:"Filadelfia"    }, // GP74 vs GP77
  { num:"P90",  l:"W0",  v:"W2",  fecha:"4 jul",  sede:"Houston"       }, // GP73 vs GP75
  { num:"P91",  l:"W3",  v:"W5",  fecha:"5 jul",  sede:"Nueva York/NJ" }, // GP76 vs GP78
  { num:"P92",  l:"W6",  v:"W7",  fecha:"5 jul",  sede:"Ciudad de México"}, // GP79 vs GP80
  { num:"P93",  l:"W10", v:"W11", fecha:"6 jul",  sede:"Dallas"        }, // GP83 vs GP84
  { num:"P94",  l:"W8",  v:"W9",  fecha:"6 jul",  sede:"Seattle"       }, // GP81 vs GP82
  { num:"P95",  l:"W13", v:"W15", fecha:"7 jul",  sede:"Atlanta"       }, // GP86 vs GP88
  { num:"P96",  l:"W12", v:"W14", fecha:"7 jul",  sede:"Vancouver"     }, // GP85 vs GP87
];

// Cuartos P97-P100
export const QF_BRACKET = [
  { num:"P97",  l:"W0", v:"W1", fecha:"9 jul",  sede:"Boston"       }, // GP89 vs GP90
  { num:"P98",  l:"W4", v:"W5", fecha:"10 jul", sede:"Los Ángeles"  }, // GP93 vs GP94
  { num:"P99",  l:"W2", v:"W3", fecha:"11 jul", sede:"Miami"        }, // GP91 vs GP92
  { num:"P100", l:"W6", v:"W7", fecha:"11 jul", sede:"Kansas City"  }, // GP95 vs GP96
];

// Semifinales P101-P102
export const SF_BRACKET = [
  { num:"P101", l:"W0", v:"W1", fecha:"14 jul", sede:"Dallas (AT&T Stadium)"           }, // GP97 vs GP98
  { num:"P102", l:"W2", v:"W3", fecha:"15 jul", sede:"Atlanta (Mercedes-Benz Stadium)" }, // GP99 vs GP100
];

// ─── Clasificados de grupos ───────────────────────────────────────────────────
export function getGroupClassified(scores) {
  const result = {};
  const thirds = [];
  KEYS.forEach(g => {
    const gr = GRUPOS[g];
    const ms = gr.partidos.map((_,i) => scores?.[g]?.[i] || {local:"",visita:""});
    const tabla = calcTabla(gr.equipos, gr.partidos, ms);
    if (tabla[0]&&tabla[0][1].jj>0) result["1"+g] = tabla[0][0];
    if (tabla[1]&&tabla[1][1].jj>0) result["2"+g] = tabla[1][0];
    if (tabla[2]&&tabla[2][1].jj>0) thirds.push({
      group:g, team:tabla[2][0],
      pts:tabla[2][1].pts, dif:tabla[2][1].gf-tabla[2][1].gc, gf:tabla[2][1].gf
    });
  });
  // Sort best thirds
  thirds.sort((a,b)=>b.pts!==a.pts?b.pts-a.pts:b.dif!==a.dif?b.dif-a.dif:b.gf-a.gf);
  // Assign by slot rules (which groups the third came from)
  // Each R32 slot specifies which groups are eligible (e.g. "3ABCDF")
  // We assign best available third that matches the group filter
  result["_thirds"] = thirds; // store sorted thirds for slot matching
  return result;
}

// Get best third that came from one of the allowed groups and hasn't been used
function getBestThird(thirds, allowedGroups, used) {
  for (const t of thirds) {
    if (allowedGroups.includes(t.group) && !used.has(t.team)) return t.team;
  }
  return "";
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
  try {
    const c = getGroupClassified(scores||{});
    const thirds = c["_thirds"] || [];
    const usedThirds = new Set();
    const ko = {};

    ko.r32 = R32_BRACKET.map((s,i) => {
      let local = "", visita = "";
      // local is always a group winner/runner-up
      if (s.local.startsWith("1") || s.local.startsWith("2")) {
        local = c[s.local]||"";
      }
      // visita: if it starts with "3" it's a third-place slot
      if (s.visita.startsWith("3")) {
        const allowedGroups = s.visita.slice(1).split(""); // e.g. "ABCDF" → ["A","B","C","D","F"]
        visita = getBestThird(thirds, allowedGroups, usedThirds);
        if (visita) usedThirds.add(visita);
      } else {
        visita = c[s.visita]||"";
      }
      // If local is also 2nd place
      if (s.local.startsWith("2")) local = c[s.local]||"";

      return {
        ...makeMatch(i, local, visita, knockout?.r32?.[i]),
        num: s.num, sede: s.sede, fecha: s.fecha
      };
    });

    ko.r16 = R16_BRACKET.map((s,i) => {
      const li=parseInt(s.l.replace("W","")), vi=parseInt(s.v.replace("W",""));
      return {
        ...makeMatch(i, ko.r32[li]?.ganador||"", ko.r32[vi]?.ganador||"", knockout?.r16?.[i]),
        num:s.num, sede:s.sede, fecha:s.fecha
      };
    });

    ko.qf = QF_BRACKET.map((s,i) => {
      const li=parseInt(s.l.replace("W","")), vi=parseInt(s.v.replace("W",""));
      return {
        ...makeMatch(i, ko.r16[li]?.ganador||"", ko.r16[vi]?.ganador||"", knockout?.qf?.[i]),
        num:s.num, sede:s.sede, fecha:s.fecha
      };
    });

    ko.sf = SF_BRACKET.map((s,i) => {
      const li=parseInt(s.l.replace("W","")), vi=parseInt(s.v.replace("W",""));
      return {
        ...makeMatch(i, ko.qf[li]?.ganador||"", ko.qf[vi]?.ganador||"", knockout?.sf?.[i]),
        num:s.num, sede:s.sede, fecha:s.fecha
      };
    });

    const sfW0=ko.sf[0]?.ganador||"", sfW1=ko.sf[1]?.ganador||"";
    ko.final = [{
      ...makeMatch(0, sfW0, sfW1, knockout?.final?.[0]),
      num:"P104", sede:"MetLife Stadium, Nueva York/NJ", fecha:"19 jul"
    }];

    const sf0L = ko.sf[0]?.ganador
      ? (ko.sf[0].ganador===ko.sf[0].local ? ko.sf[0].visita : ko.sf[0].local) : "";
    const sf1L = ko.sf[1]?.ganador
      ? (ko.sf[1].ganador===ko.sf[1].local ? ko.sf[1].visita : ko.sf[1].local) : "";
    ko.third = [{
      ...makeMatch(0, sf0L, sf1L, knockout?.third?.[0]),
      num:"P103", sede:"Hard Rock Stadium, Miami", fecha:"18 jul"
    }];

    return ko;
  } catch(e) {
    return knockout || {};
  }
}
