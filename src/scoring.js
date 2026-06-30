// src/scoring.js
// ─── SISTEMA DE PUNTUACIÓN ────────────────────────────────────────────────────
// Fase de grupos:
//   Resultado exacto (marcador correcto)  → 5 pts
//   Solo ganador/empate correcto          → 3 pts
//
// Eliminatorias (por partido, basado en el marcador de los 90 minutos):
//   Marcador exacto en los 90 min         → 5 pts
//   Acertó el empate en 90 min (sin marcador exacto) → 3 pts
//   Nada acertado                         → 0 pts
//   + Si hubo empate en 90 min: +1 pt extra si acertó quién avanza
//     en penales/tiempo extra
//
// Predicciones especiales:
//   Campeón correcto                      → 10 pts
//   Subcampeón correcto                   → 5 pts
//   Tercer lugar correcto                 → 5 pts
//   Goleador correcto                     → 10 pts
//
// Máximo posible:
//   Grupos: 72 × 5 = 360 pts
//   Eliminatorias: hasta 32 × 6 = 192 pts (5 + 1 si hay empates con penales)
//   Especiales: 10 + 5 + 5 + 10 = 30 pts
//   TOTAL MÁXIMO: ~580 pts (depende de cuántos partidos van a penales)

import { GRUPOS, KEYS } from "./data";

// ─── Calcular puntos de fase de grupos ───────────────────────────────────────
export function calcGroupPoints(quiniela, resultados) {
  let pts = 0;
  let breakdown = {};

  KEYS.forEach(g => {
    const partidos = GRUPOS[g].partidos;
    partidos.forEach((_, i) => {
      const pred = (quiniela.scores?.[g]?.[i]) || {};
      const real = (resultados.scores?.[g]?.[i]) || {};

      const pL = parseInt(pred.local), pV = parseInt(pred.visita);
      const rL = parseInt(real.local), rV = parseInt(real.visita);

      if (isNaN(rL) || isNaN(rV)) return;

      const key = `${g}-${i}`;
      if (isNaN(pL) || isNaN(pV)) {
        breakdown[key] = { pts: 0, type: "miss" };
        return;
      }

      if (pL === rL && pV === rV) {
        pts += 5;
        breakdown[key] = { pts: 5, type: "exact" };
      } else {
        const predWinner = pL > pV ? "L" : pL < pV ? "V" : "E";
        const realWinner = rL > rV ? "L" : rL < rV ? "V" : "E";
        if (predWinner === realWinner) {
          pts += 3;
          breakdown[key] = { pts: 3, type: "winner" };
        } else {
          breakdown[key] = { pts: 0, type: "miss" };
        }
      }
    });
  });

  return { pts, breakdown };
}

// ─── Calcular puntos de eliminatorias ────────────────────────────────────────
// Basado en el marcador de los 90 minutos (localGoles/visitaGoles), no en
// quién avanza por penales. El "ganador" oficial solo se usa para el bonus
// de +1 pt cuando hubo empate en los 90 minutos.
export function calcKnockoutPoints(quiniela, resultados) {
  let pts = 0;
  let breakdown = {};

  const RONDA_IDS = ["r32", "r16", "qf", "sf", "final", "third"];

  RONDA_IDS.forEach(rondaId => {
    const predMatches = quiniela.knockout?.[rondaId] || [];
    const realMatches = resultados.knockout?.[rondaId] || [];

    realMatches.forEach((real, i) => {
      // Solo evaluar si el resultado oficial tiene marcador de 90 min cargado
      const rL = parseInt(real.localGoles), rV = parseInt(real.visitaGoles);
      if (isNaN(rL) || isNaN(rV)) return;

      const pred = predMatches[i] || {};
      const key = `${rondaId}-${i}`;

      const pL = parseInt(pred.localGoles), pV = parseInt(pred.visitaGoles);
      const hasPred = !isNaN(pL) && !isNaN(pV);

      const realEmpate90 = rL === rV;
      const predEmpate90 = hasPred && pL === pV;

      let matchPts = 0;
      let type = "miss";

      if (hasPred && pL === rL && pV === rV) {
        // Marcador exacto en los 90 minutos
        matchPts = 5;
        type = "exact";
      } else if (realEmpate90 && predEmpate90) {
        // Acertó que hubo empate en 90 min, sin acertar el marcador exacto
        matchPts = 3;
        type = "draw90";
      } else {
        matchPts = 0;
        type = "miss";
      }

      // Bonus: si hubo empate en 90 min y se definió por penales/tiempo extra,
      // +1 pt si el participante acertó quién avanza
      let bonusPts = 0;
      if (realEmpate90 && real.ganador && pred.ganador && pred.ganador === real.ganador) {
        bonusPts = 1;
      }

      pts += matchPts + bonusPts;
      breakdown[key] = { pts: matchPts + bonusPts, type, bonus: bonusPts };
    });
  });

  return { pts, breakdown };
}

// ─── Calcular puntos de predicciones especiales ───────────────────────────────
export function calcSpecialPoints(quiniela, resultados) {
  let pts = 0;
  let breakdown = {};

  const check = (field, label, value) => {
    if (!resultados[field]) return;
    const correct = quiniela[field] === resultados[field] ||
      (field === "goleador" && quiniela.goleadorCustom === resultados[field]);
    if (correct) {
      pts += value;
      breakdown[label] = { pts: value, type: "exact" };
    } else {
      breakdown[label] = { pts: 0, type: "miss" };
    }
  };

  check("campeon", "campeon", 10);
  check("segundo", "segundo", 5);
  check("tercero", "tercero", 5);
  check("goleador", "goleador", 10);

  return { pts, breakdown };
}

// ─── Calcular total de puntos ─────────────────────────────────────────────────
export function calcTotalPoints(quiniela, resultados) {
  const groups = calcGroupPoints(quiniela, resultados);
  const knockout = calcKnockoutPoints(quiniela, resultados);
  const special = calcSpecialPoints(quiniela, resultados);

  return {
    total: groups.pts + knockout.pts + special.pts,
    groups: groups.pts,
    knockout: knockout.pts,
    special: special.pts,
    breakdown: {
      groups: groups.breakdown,
      knockout: knockout.breakdown,
      special: special.breakdown,
    }
  };
}
