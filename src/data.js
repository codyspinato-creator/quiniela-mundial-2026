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
