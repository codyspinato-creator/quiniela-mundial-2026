// src/scoring.js
// ─── SISTEMA DE PUNTUACIÓN ────────────────────────────────────────────────────
// Fase de grupos:
//   Resultado exacto (marcador correcto)  → 5 pts
//   Solo ganador/empate correcto          → 3 pts
//
// Eliminatorias (por partido):
//   Resultado exacto (marcador correcto)  → 5 pts
//   Solo ganador correcto                 → 3 pts
//
// Predicciones especiales:
//   Campeón correcto                      → 10 pts
//   Subcampeón correcto                   → 5 pts
//   Tercer lugar correcto                 → 5 pts
//   Goleador correcto                     → 10 pts
//
// Máximo posible:
//   Grupos: 72 × 5 = 360 pts
//   Eliminatorias: 32 × 5 = 160 pts
//   Especiales: 10 + 5 + 5 + 10 = 30 pts
//   TOTAL MÁXIMO: 550 pts

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
export function calcKnockoutPoints(quiniela, resultados) {
  let pts = 0;
  let breakdown = {};

  const RONDA_IDS = ["r32", "r16", "qf", "sf", "final", "third"];

  RONDA_IDS.forEach(rondaId => {
    const predMatches = quiniela.knockout?.[rondaId] || [];
    const realMatches = resultados.knockout?.[rondaId] || [];

    realMatches.forEach((real, i) => {
      if (!real.ganador) return;

      const pred = predMatches[i] || {};
      const key = `${rondaId}-${i}`;

      const pL = parseInt(pred.localGoles), pV = parseInt(pred.visitaGoles);
      const rL = parseInt(real.localGoles), rV = parseInt(real.visitaGoles);

      const exactScore =
        !isNaN(pL) && !isNaN(pV) && !isNaN(rL) && !isNaN(rV) &&
        pL === rL && pV === rV;

      const rightWinner =
        pred.ganador && real.ganador && pred.ganador === real.ganador;

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
