// src/scoring.js
// ─── SISTEMA DE PUNTUACIÓN ────────────────────────────────────────────────────
// Fase de grupos:
//   Resultado exacto (marcador correcto)  → 5 pts
//   Solo ganador/empate correcto          → 3 pts
//
// Eliminatorias:
//   Equipo ganador correcto               → 3 pts
//   Resultado exacto (marcador correcto)  → 5 pts
//
// Predicciones especiales:
//   Campeón correcto                      → 5 pts
//   Subcampeón correcto                   → 5 pts
//   Tercer lugar correcto                 → 5 pts
//   Goleador correcto                     → 5 pts
//
// Máximo posible:
//   Grupos: 72 partidos × 5 = 360 pts
//   Eliminatorias: 32 partidos × 5 = 160 pts
//   Especiales: 4 × 5 = 20 pts
//   TOTAL MÁXIMO: 540 pts

import { GRUPOS, KEYS } from "./data";

// ─── Calcular puntos de fase de grupos ────────────────────────────────────────
export function calcGroupPoints(quiniela, resultados) {
  let pts = 0;
  let breakdown = {}; // { "A-0": { pts, type } }

  KEYS.forEach(g => {
    const partidos = GRUPOS[g].partidos;
    partidos.forEach((_, i) => {
      const pred = (quiniela.scores?.[g]?.[i]) || {};
      const real = (resultados.scores?.[g]?.[i]) || {};

      const pL = parseInt(pred.local), pV = parseInt(pred.visita);
      const rL = parseInt(real.local), rV = parseInt(real.visita);

      if (isNaN(rL) || isNaN(rV)) return; // resultado no ingresado aún

      const key = `${g}-${i}`;
      if (isNaN(pL) || isNaN(pV)) {
        breakdown[key] = { pts: 0, type: "miss" };
        return;
      }

      if (pL === rL && pV === rV) {
        // Resultado exacto
        pts += 5;
        breakdown[key] = { pts: 5, type: "exact" };
      } else {
        // Verificar si acertó ganador/empate
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
export function calcKnockoutPoints(quiniela, resultados) {
  let pts = 0;
  let breakdown = {};

  const RONDA_IDS = ["r32", "r16", "qf", "sf", "final", "third"];

  RONDA_IDS.forEach(rondaId => {
    const predMatches = quiniela.knockout?.[rondaId] || [];
    const realMatches = resultados.knockout?.[rondaId] || [];

    realMatches.forEach((real, i) => {
      if (!real.ganador) return; // sin resultado oficial aún

      const pred = predMatches[i] || {};
      const key = `${rondaId}-${i}`;

      const pL = parseInt(pred.localGoles), pV = parseInt(pred.visitaGoles);
      const rL = parseInt(real.localGoles), rV = parseInt(real.visitaGoles);
      const exactScore = !isNaN(pL) && !isNaN(pV) && !isNaN(rL) && !isNaN(rV) && pL === rL && pV === rV;
      const rightWinner = pred.ganador && real.ganador && pred.ganador === real.ganador;

      if (exactScore && rightWinner) {
        pts += 5;
        breakdown[key] = { pts: 5, type: "exact" };
      } else if (rightWinner) {
        pts += 3;
        breakdown[key] = { pts: 3, type: "winner" };
      } else {
        breakdown[key] = { pts: 0, type: "miss" };
      }
    });
  });

  return { pts, breakdown };
}

// ─── Calcular puntos de predicciones especiales ───────────────────────────────
export function calcSpecialPoints(quiniela, resultados) {
  let pts = 0;
  let breakdown = {};

  const check = (field, label) => {
    if (!resultados[field]) return; // no definido aún
    const correct = quiniela[field] === resultados[field] ||
      (field === "goleador" && quiniela.goleadorCustom === resultados[field]);
    if (correct) { pts += 5; breakdown[label] = { pts: 5, type: "exact" }; }
    else { breakdown[label] = { pts: 0, type: "miss" }; }
  };

  check("campeon", "campeon");
  check("segundo", "segundo");
  check("tercero", "tercero");
  check("goleador", "goleador");

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
