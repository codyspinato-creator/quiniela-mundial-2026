// src/Admin.js
import { useState, useEffect, useCallback } from "react";
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import { GRUPOS, KEYS, SELECCIONES, GOLEADORES, calcTabla, buildBracket } from "./data";
import { calcTotalPoints } from "./scoring";

const B = {
  primary: "#3a5bd9", primary2: "#2a4bc9", primaryDim: "#3a5bd915",
  bg: "#f5f5f7", card: "#ffffff", border: "#e0e0e8",
  text: "#111111", muted: "#888899",
  admin: "#7c3aed", adminDim: "#7c3aed15",
  logoMF: "/logo-mf.png",
};

const RONDAS = [
  { id: "r32",   label: "Dieciseisavos", emoji: "⚔️",  partidos: 16 },
  { id: "r16",   label: "Octavos",       emoji: "🔥",  partidos: 8  },
  { id: "qf",    label: "Cuartos",       emoji: "⭐",  partidos: 4  },
  { id: "sf",    label: "Semifinales",   emoji: "🌟",  partidos: 2  },
  { id: "final", label: "Final",         emoji: "🏆",  partidos: 1  },
  { id: "third", label: "3er Puesto",    emoji: "🥉",  partidos: 1  },
];

function emptyKnockout() {
  const k = {};
  RONDAS.forEach(r => {
    k[r.id] = Array.from({ length: r.partidos }, (_, i) => ({
      id: i, local: "", localGoles: "", visita: "", visitaGoles: "",
      ganador: "", penaltis: false, penaltisGanador: "",
    }));
  });
  return k;
}

function emptyResultados() {
  return { scores: {}, knockout: emptyKnockout(), campeon: "", segundo: "", tercero: "", goleador: "" };
}

// ─── EDITOR DE QUINIELA DE USUARIO ───────────────────────────────────────────
function UserQuinielaEditor({ participante, onBack, onSaved }) {
  const [scores, setScores] = useState(participante.scores || {});
  const [campeon, setCampeon] = useState(participante.campeon || "");
  const [segundo, setSegundo] = useState(participante.segundo || "");
  const [tercero, setTercero] = useState(participante.tercero || "");
  const [goleador, setGoleador] = useState(participante.goleador || "");
  const [goleadorCustom, setGoleadorCustom] = useState(participante.goleadorCustom || "");
  const [knockout, setKnockout] = useState(participante.knockout || emptyKnockout());
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [tab, setTab] = useState("grupos");
  const [grupo, setGrupo] = useState("A");
  const [rondaActiva, setRondaActiva] = useState("r32");

  const getMs = (g) => GRUPOS[g].partidos.map((_, i) => scores[g]?.[i] || { local: "", visita: "" });
  const setGol = (g, idx, lado, val) => {
    setScores(prev => {
      const arr = GRUPOS[g].partidos.map((_, i) => prev[g]?.[i] || { local: "", visita: "" });
      arr[idx] = { ...arr[idx], [lado]: val };
      return { ...prev, [g]: arr };
    });
  };
  const isDone = (g) => getMs(g).every(m => !isNaN(parseInt(m.local)) && m.local !== "" && !isNaN(parseInt(m.visita)) && m.visita !== "");

  const saveUser = async () => {
    setSaving(true); setSaveMsg("");
    try {
      const snap = await getDoc(doc(db, "quinielas", participante.id));
      const existingHash = snap.exists() ? snap.data().passwordHash : undefined;
      await setDoc(doc(db, "quinielas", participante.id), {
        nombre: participante.nombre,
        email: participante.email || "",
        ...(existingHash && { passwordHash: existingHash }),
        scores, campeon, segundo, tercero, goleador, goleadorCustom, knockout,
        updatedAt: Date.now(),
      });
      setSaveMsg("¡Guardado! ✓");
      onSaved && onSaved({ ...participante, scores, campeon, segundo, tercero, goleador, goleadorCustom, knockout });
    } catch (e) { setSaveMsg("Error ✗"); }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const gr = GRUPOS[grupo];
  const ms = getMs(grupo);
  const gIdx = KEYS.indexOf(grupo);
  const btnStyle = (active, color) => ({ padding: "5px 10px", borderRadius: 18, fontSize: 11, border: `1px solid ${active ? color : "#e0e0e0"}`, background: active ? color + "20" : "#f8f8fc", color: active ? color : "#888", cursor: "pointer", fontWeight: active ? "bold" : "normal" });

  return (
    <div style={{ minHeight: "100vh", background: B.bg, fontFamily: "Georgia,serif" }}>
      {/* Header */}
      <div style={{ background: "#1a2a6c", padding: "10px 14px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <button onClick={onBack} style={{ background: "#ffffff20", border: "none", borderRadius: 8, padding: "6px 10px", color: "#ffffff", cursor: "pointer", fontSize: 12 }}>← Volver</button>
            <div>
              <div style={{ fontSize: 9, color: "#ffffffaa", letterSpacing: 2 }}>EDITANDO QUINIELA DE</div>
              <div style={{ fontSize: 15, fontWeight: "bold", color: "#ffffff" }}>{participante.nombre}</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ background: "#f77f0030", border: "1px solid #f77f0060", borderRadius: 6, padding: "3px 8px", fontSize: 9, color: "#f77f00", fontWeight: "bold" }}>⚠️ MODO ADMIN</div>
              <button onClick={saveUser} disabled={saving} style={{ padding: "6px 14px", borderRadius: 7, border: "none", background: saving ? "#ffffff30" : saveMsg.includes("✓") ? "#00c853" : "#ffffff", color: saving ? "#aaa" : saveMsg.includes("✓") ? "#ffffff" : "#1a2a6c", fontSize: 11, fontWeight: "bold", cursor: "pointer" }}>
                {saving ? "..." : saveMsg || "💾 Guardar"}
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            {[["grupos","Grupos"],["predicciones","Predicciones"],["knockout","Eliminatorias"]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: tab === id ? "#ffffff" : "#ffffff20", color: tab === id ? "#1a2a6c" : "#ffffffcc", fontSize: 10, cursor: "pointer", fontWeight: "bold" }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "14px 12px 56px" }}>

        {/* ── GRUPOS ── */}
        {tab === "grupos" && (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", marginBottom: 14 }}>
              {KEYS.map(g => { const done = isDone(g); const active = g === grupo; return (
                <button key={g} onClick={() => setGrupo(g)} style={{ width: 34, height: 34, borderRadius: 7, fontSize: 12, fontWeight: "bold", border: active ? "2px solid #3a5bd9" : "2px solid transparent", background: done ? (active ? B.primary2 : B.primaryDim) : active ? "#3a5bd920" : "#f0f0f0", color: done ? (active ? "#ffffff" : B.primary) : active ? B.primary : "#aaa", cursor: "pointer" }}>
                  {done && !active ? "✓" : g}
                </button>
              );})}
            </div>
            <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${gr.accent}20`, marginBottom: 12 }}>
              <div style={{ background: `linear-gradient(135deg,${gr.color},${gr.color}cc)`, padding: "11px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: `2px solid ${gr.accent}30` }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: gr.accent, color: gr.color || "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: "900" }}>{grupo}</div>
                <div><div style={{ fontSize: 15, fontWeight: "bold" }}>Grupo {grupo}</div><div style={{ fontSize: 10, color: "#ffffff70" }}>{gr.equipos.map(e => e.split(" ").slice(1).join(" ")).join(" · ")}</div></div>
                {isDone(grupo) && <div style={{ marginLeft: "auto", fontSize: 10, color: "#00c853", background: "#e8fff0", border: "1px solid #00c853", borderRadius: 20, padding: "2px 8px" }}>✓ Listo</div>}
              </div>
              <div style={{ background: "#ffffff" }}>
                {[1, 2, 3].map(fecha => (
                  <div key={fecha}>
                    <div style={{ padding: "5px 14px", background: "#f0f0f5", fontSize: 9, color: "#333", fontWeight: "600", letterSpacing: 2, textTransform: "uppercase", borderTop: fecha > 1 ? "1px solid #e0e0e8" : "none", borderBottom: "1px solid #e0e0e8" }}>Jornada {fecha}</div>
                    {gr.partidos.filter(p => p.f === fecha).map(p => {
                      const idx = gr.partidos.indexOf(p); const m = ms[idx];
                      const gl = parseInt(m.local), gv = parseInt(m.visita);
                      const ok = !isNaN(gl) && !isNaN(gv) && m.local !== "" && m.visita !== "";
                      const wL = ok && gl > gv, wV = ok && gv > gl, emp = ok && gl === gv;
                      return (
                        <div key={idx} style={{ padding: "9px 14px", borderBottom: "1px solid #eeeeef", background: "#ffffff" }}>
                          <div style={{ fontSize: 9, color: "#777", marginBottom: 5 }}>📅 {p.fecha}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ flex: 1, fontSize: 11, textAlign: "right", fontWeight: wL ? "bold" : "normal", color: wL ? "#111" : ok ? "#333" : "#aaa" }}>{p.local}</div>
                            <input type="number" min="0" max="20" value={m.local} onChange={e => setGol(grupo, idx, "local", e.target.value)} style={{ width: 34, height: 32, textAlign: "center", background: "#f0f0f5", border: `2px solid ${ok ? "#3a5bd9" : "#e0e0e8"}`, borderRadius: 6, color: ok ? "#3a5bd9" : "#bbb", fontSize: 15, fontWeight: "bold", outline: "none" }} />
                            <div style={{ width: 16, textAlign: "center", fontSize: 12, color: wL ? "#3a5bd9" : wV ? "#e63946" : emp ? "#f77f00" : "#ccc", fontWeight: "bold" }}>{ok ? (wL ? "▸" : wV ? "◂" : "=") : "·"}</div>
                            <input type="number" min="0" max="20" value={m.visita} onChange={e => setGol(grupo, idx, "visita", e.target.value)} style={{ width: 34, height: 32, textAlign: "center", background: "#f0f0f5", border: `2px solid ${ok ? "#3a5bd9" : "#e0e0e8"}`, borderRadius: 6, color: ok ? "#333" : "#bbb", fontSize: 15, fontWeight: "bold", outline: "none" }} />
                            <div style={{ flex: 1, fontSize: 11, fontWeight: wV ? "bold" : "normal", color: wV ? "#111" : ok ? "#333" : "#aaa" }}>{p.visita}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => gIdx > 0 && setGrupo(KEYS[gIdx - 1])} disabled={gIdx === 0} style={{ flex: 1, padding: 8, borderRadius: 9, border: "1px solid #e0e0e8", background: gIdx === 0 ? "#f5f5f7" : "#f0f0ff", color: gIdx === 0 ? "#ccc" : "#7c3aed", fontSize: 12, cursor: gIdx === 0 ? "not-allowed" : "pointer" }}>← Anterior</button>
              <button onClick={() => gIdx < KEYS.length - 1 && setGrupo(KEYS[gIdx + 1])} disabled={gIdx === KEYS.length - 1} style={{ flex: 1, padding: 8, borderRadius: 9, border: "none", background: gIdx === KEYS.length - 1 ? "#f5f5f7" : "#7c3aed", color: gIdx === KEYS.length - 1 ? "#ccc" : "#ffffff", fontSize: 12, fontWeight: "bold", cursor: gIdx === KEYS.length - 1 ? "not-allowed" : "pointer" }}>Siguiente →</button>
            </div>
          </>
        )}

        {/* ── PREDICCIONES ── */}
        {tab === "predicciones" && (
          <div>
            {[
              { icon: "🥇", label: "Campeón del Mundo", sub: "¿Quién levantará la copa?", val: campeon, set: v => { setCampeon(v); if (segundo === v) setSegundo(""); if (tercero === v) setTercero(""); }, color: B.primary, exclude: [] },
              { icon: "🥈", label: "Subcampeón", sub: "Finalista perdedor", val: segundo, set: v => { setSegundo(v); if (tercero === v) setTercero(""); }, color: "#888", exclude: [campeon] },
              { icon: "🥉", label: "Tercer Lugar", sub: "Ganador del partido por el bronce", val: tercero, set: setTercero, color: "#a07040", exclude: [campeon, segundo] },
            ].map(({ icon, label, sub, val, set, color, exclude }) => (
              <div key={label} style={{ background: "#ffffff", border: `1px solid ${color}30`, borderRadius: 12, padding: 14, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <div><div style={{ fontSize: 13, fontWeight: "bold", color }}>{label}</div><div style={{ fontSize: 10, color: B.muted }}>{sub}</div></div>
                  {val && <div style={{ marginLeft: "auto", fontSize: 16 }}>{val.split(" ")[0]}</div>}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {SELECCIONES.filter(s => !exclude.includes(s)).map(s => (
                    <button key={s} onClick={() => set(s === val ? "" : s)} style={btnStyle(val === s, color)}>{s}</button>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ background: "#ffffff", border: "1px solid #3a5bd930", borderRadius: 12, padding: 14, marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>👟</span>
                <div><div style={{ fontSize: 13, fontWeight: "bold", color: "#3a5bd9" }}>Bota de Oro</div><div style={{ fontSize: 10, color: B.muted }}>Máximo goleador del torneo</div></div>
                {goleador && goleador !== "Otro..." && <div style={{ marginLeft: "auto", fontSize: 11, color: "#3a5bd9", fontWeight: "bold" }}>{GOLEADORES.find(g => g.nombre === goleador)?.sel} {goleador}</div>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {GOLEADORES.map(g => (
                  <button key={g.nombre} onClick={() => setGoleador(g.nombre === goleador ? "" : g.nombre)} style={{ padding: "7px 10px", borderRadius: 8, textAlign: "left", border: `1px solid ${goleador === g.nombre ? "#3a5bd9" : "#e0e0e0"}`, background: goleador === g.nombre ? "#eff4ff" : "#f8f8fc", color: goleador === g.nombre ? "#3a5bd9" : B.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{g.sel}</span>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: goleador === g.nombre ? "bold" : "normal" }}>{g.nombre}</div>{g.club && <div style={{ fontSize: 9, color: "#aaa" }}>{g.club}</div>}</div>
                    {goleador === g.nombre && <span>✓</span>}
                  </button>
                ))}
              </div>
              {goleador === "Otro..." && <input type="text" placeholder="Nombre del jugador..." value={goleadorCustom} onChange={e => setGoleadorCustom(e.target.value)} style={{ width: "100%", background: "#f8f8fc", border: "1px solid #e0e0e8", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box", marginTop: 10 }} />}
            </div>
          </div>
        )}

        {/* ── ELIMINATORIAS ── */}
        {tab === "knockout" && (
          <div>
            <div style={{ display: "flex", gap: 4, overflowX: "auto", marginBottom: 14 }}>
              {RONDAS.map(r => {
                const matches = knockout[r.id] || [];
                const done = matches.filter(m => m.ganador).length;
                const active = r.id === rondaActiva;
                return (
                  <button key={r.id} onClick={() => setRondaActiva(r.id)} style={{ padding: "6px 10px", borderRadius: 8, border: `2px solid ${active ? B.admin : "transparent"}`, background: active ? B.adminDim : "#f5f5f7", color: active ? B.admin : done === r.partidos ? "#9b5de5" : B.muted, fontSize: 10, cursor: "pointer", fontWeight: "bold", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {r.emoji} {r.label} ({done}/{r.partidos})
                  </button>
                );
              })}
            </div>
            {(() => {
              const ronda = RONDAS.find(r => r.id === rondaActiva);
              const matches = knockout[rondaActiva] || Array.from({ length: ronda.partidos }, (_, i) => ({ id: i, local: "", localGoles: "", visita: "", visitaGoles: "", ganador: "", penaltis: false, penaltisGanador: "" }));
              const updateMatch = (idx, newMatch) => {
                setKnockout(prev => {
                  const arr = [...(prev[rondaActiva] || [])]; arr[idx] = newMatch;
                  const updated = { ...prev, [rondaActiva]: arr };
                  try { return buildBracket(scores, updated); } catch (e) { return updated; }
                });
              };
              return (
                <div style={{ display: ronda.partidos >= 4 ? "grid" : "block", gridTemplateColumns: ronda.partidos >= 4 ? "1fr 1fr" : "1fr", gap: 8 }}>
                  {matches.map((match, i) => {
                    const gl = parseInt(match.localGoles), gv = parseInt(match.visitaGoles);
                    const hasScore = !isNaN(gl) && !isNaN(gv) && match.localGoles !== "" && match.visitaGoles !== "";
                    const empate = hasScore && gl === gv;
                    const upd = (field, val) => updateMatch(i, { ...match, [field]: val });
                    return (
                      <div key={i} style={{ background: "#ffffff", border: `1px solid ${match.ganador ? B.admin + "80" : "#e0e0e8"}`, borderRadius: 12, padding: "10px 12px", marginBottom: 8 }}>
                        <div style={{ fontSize: 9, color: B.muted, marginBottom: 7, display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: B.admin, fontWeight: "800" }}>{match.num || `P${i + 1}`}</span>
                          {match.ganador && <span style={{ color: B.admin, fontWeight: "bold" }}>✓ {match.ganador.split(" ").slice(0, 2).join(" ")}</span>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                          <input value={match.local} onChange={e => upd("local", e.target.value)} placeholder="Local..." style={{ flex: 1, background: "#f8f8f8", border: "1px solid #e0e0e8", borderRadius: 6, padding: "6px 8px", fontSize: 11, outline: "none" }} />
                          <input type="number" min="0" max="20" value={match.localGoles} onChange={e => upd("localGoles", e.target.value)} style={{ width: 36, height: 32, textAlign: "center", background: "#f5f5f7", border: `2px solid ${hasScore ? B.admin : "#e0e0e8"}`, borderRadius: 8, color: hasScore ? B.admin : "#bbb", fontSize: 14, fontWeight: "bold", outline: "none" }} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: empate ? 8 : 0 }}>
                          <input value={match.visita} onChange={e => upd("visita", e.target.value)} placeholder="Visitante..." style={{ flex: 1, background: "#f8f8f8", border: "1px solid #e0e0e8", borderRadius: 6, padding: "6px 8px", fontSize: 11, outline: "none" }} />
                          <input type="number" min="0" max="20" value={match.visitaGoles} onChange={e => upd("visitaGoles", e.target.value)} style={{ width: 36, height: 32, textAlign: "center", background: "#f5f5f7", border: `2px solid ${hasScore ? B.admin : "#e0e0e8"}`, borderRadius: 8, color: hasScore ? "#111" : "#bbb", fontSize: 14, fontWeight: "bold", outline: "none" }} />
                        </div>
                        {empate && (<div style={{ padding: "6px 8px", background: "#f5f5f7", borderRadius: 8 }}><div style={{ fontSize: 9, color: B.muted, marginBottom: 5 }}>Penaltis:</div><div style={{ display: "flex", gap: 6 }}>{[match.local, match.visita].filter(Boolean).map(eq => (<button key={eq} onClick={() => { upd("penaltis", true); upd("penaltisGanador", eq); upd("ganador", eq); }} style={{ flex: 1, padding: "5px 8px", borderRadius: 7, border: `1px solid ${match.ganador === eq ? B.admin : "#e0e0e8"}`, background: match.ganador === eq ? "#f5f0ff" : "#ffffff", color: match.ganador === eq ? B.admin : "#666", fontSize: 11, cursor: "pointer" }}>{eq.split(" ").slice(0, 2).join(" ")}</button>))}</div></div>)}
                        {hasScore && !empate && (<div><div style={{ fontSize: 9, color: B.muted, marginBottom: 5, marginTop: 8 }}>Ganador:</div><div style={{ display: "flex", gap: 6 }}>{[{ eq: match.local, wins: gl > gv }, { eq: match.visita, wins: gv > gl }].filter(x => x.eq).map(({ eq, wins }) => (<button key={eq} onClick={() => upd("ganador", eq)} style={{ flex: 1, padding: "5px 8px", borderRadius: 7, border: `1px solid ${match.ganador === eq ? B.admin : "#e0e0e8"}`, background: match.ganador === eq ? "#f5f0ff" : "#f8f8fc", color: match.ganador === eq ? B.admin : "#888", fontSize: 10, cursor: "pointer", fontWeight: match.ganador === eq ? "bold" : "normal" }}>{wins ? "⚽ " : ""}{eq.split(" ").slice(0, 2).join(" ")}</button>))}</div></div>)}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        <div style={{ marginTop: 16, background: "#ffffff", border: "1px solid #e0e0e8", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
          <button onClick={saveUser} disabled={saving} style={{ padding: "10px 28px", borderRadius: 9, border: "none", background: saving ? "#e0e0e8" : "linear-gradient(135deg,#3a5bd9,#7c3aed)", color: saving ? "#aaa" : "#ffffff", fontWeight: "bold", fontSize: 14, cursor: "pointer" }}>
            {saving ? "Guardando..." : saveMsg || "💾 Guardar quiniela de " + participante.nombre}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ─────────────────────────────────────────────────────────────
export default function Admin({ onBack }) {
  const [authed, setAuthed] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState("");
  const [codigoAcceso, setCodigoAcceso] = useState("");
  const [codigoSaved, setCodigoSaved] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null); // ← NEW: user being edited
  const [autoMsg, setAutoMsg] = useState("");

  const autoPopulateBracket = () => {
    try {
      const newKO = buildBracket(resultados.scores, resultados.knockout);
      setResultados(prev => ({ ...prev, knockout: newKO }));
      setAutoMsg("✓ Cruces actualizados desde grupos");
      setTimeout(() => setAutoMsg(""), 3000);
    } catch(e) {
      setAutoMsg("Error al calcular cruces");
      setTimeout(() => setAutoMsg(""), 3000);
    }
  };

  const [resultados, setResultados] = useState(emptyResultados());
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [adminTab, setAdminTab] = useState("grupos");
  const [jornadasCerradas, setJornadasCerradas] = useState({1:true,2:false,3:false});
  const [jornadasSaved, setJornadasSaved] = useState(false);
  const [grupoActivo, setGrupoActivo] = useState("A");
  const [rondaActiva, setRondaActiva] = useState("r32");

  const saveJornadas = async (newJornadas) => {
    try {
      const cfgSnap = await getDoc(doc(db, "admin", "config"));
      const existing = cfgSnap.exists() ? cfgSnap.data() : {};
      await setDoc(doc(db, "admin", "config"), { ...existing, jornadasCerradas: newJornadas, updatedAt: Date.now() });
      setJornadasSaved(true);
      setTimeout(() => setJornadasSaved(false), 2000);
    } catch (e) { console.error(e); }
  };

  const saveCodigo = async () => {
    try {
      await setDoc(doc(db, "admin", "config"), { codigoAcceso: codigoAcceso.trim(), updatedAt: Date.now() });
      setCodigoSaved(true);
      setTimeout(() => setCodigoSaved(false), 3000);
    } catch (e) { console.error(e); }
  };

  const deleteQuiniela = async (id) => {
    if (confirmDelete !== id) { setConfirmDelete(id); return; }
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "quinielas", id));
      setParticipantes(prev => prev.filter(p => p.id !== id));
      setConfirmDelete(null);
    } catch (e) { console.error(e); }
    setDeletingId(false);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const rSnap = await getDoc(doc(db, "admin", "resultados"));
      if (rSnap.exists()) {
        const data = rSnap.data();
        setResultados({ ...emptyResultados(), ...data, knockout: { ...emptyKnockout(), ...(data.knockout||{}) } });
      }
      const cfgSnap = await getDoc(doc(db, "admin", "config"));
      if (cfgSnap.exists()) {
        setCodigoAcceso(cfgSnap.data().codigoAcceso || "");
        if (cfgSnap.data().jornadasCerradas) setJornadasCerradas(cfgSnap.data().jornadasCerradas);
      }
      const pSnap = await getDocs(collection(db, "quinielas"));
      const list = [];
      pSnap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setParticipantes(list.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { if (authed) loadData(); }, [authed, loadData]);

  const saveResultados = async () => {
    setSaving(true); setSaveMsg("");
    try {
      await setDoc(doc(db, "admin", "resultados"), { ...resultados, updatedAt: Date.now() });
      setSaveMsg("¡Guardado! ✓");
    } catch (e) { setSaveMsg("Error ✗"); }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const setGol = (g, idx, lado, val) => {
    setResultados(prev => {
      const arr = GRUPOS[g].partidos.map((_, i) => prev.scores?.[g]?.[i] || { local: "", visita: "" });
      arr[idx] = { ...arr[idx], [lado]: val };
      return { ...prev, scores: { ...prev.scores, [g]: arr } };
    });
  };

  const setKO = (rondaId, idx, field, val) => {
    setResultados(prev => {
      const existing = prev.knockout?.[rondaId] || Array.from({ length: RONDAS.find(r=>r.id===rondaId).partidos }, (_,i) => ({ id:i, local:"", localGoles:"", visita:"", visitaGoles:"", ganador:"", penaltis:false, penaltisGanador:"" }));
      const arr = [...existing];
      arr[idx] = { ...arr[idx], [field]: val };
      const updatedKO = { ...prev.knockout, [rondaId]: arr };
      try { return { ...prev, knockout: buildBracket(prev.scores, updatedKO) }; }
      catch(e) { return { ...prev, knockout: updatedKO }; }
    });
  };

  const getMs = (g) => GRUPOS[g].partidos.map((_, i) => resultados.scores?.[g]?.[i] || { local: "", visita: "" });

  const ranking = participantes.map(p => ({ ...p, score: calcTotalPoints(p, resultados) })).sort((a, b) => b.score.total - a.score.total);

  const ADMIN_PASS = "mf25778035";
  const handleLogin = () => {
    if (passInput === ADMIN_PASS) { setAuthed(true); setPassError(""); }
    else { setPassError("Contraseña incorrecta"); }
  };

  // ── Route to user editor ──────────────────────────────────────────────────
  if (editingUser) return (
    <UserQuinielaEditor
      participante={editingUser}
      onBack={() => setEditingUser(null)}
      onSaved={(updated) => {
        setParticipantes(prev => prev.map(p => p.id === updated.id ? updated : p));
        setEditingUser(null);
      }}
    />
  );

  if (!authed) return (
    <div style={{ minHeight: "100vh", background: B.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", padding: 20 }}>
      <div style={{ maxWidth: 340, width: "100%" }}>
        <div style={{ background:"linear-gradient(135deg,#2a4bc9,#7c3aed)", borderRadius:16, padding:"20px", marginBottom:20, textAlign:"center", position:"relative", overflow:"hidden" }}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:"linear-gradient(90deg,#f15bb5,#9b5de5,#00bbf9,#fee440)"}}/>
          <img src={B.logoMF} alt="MundoFutbol" style={{ height: 44, objectFit: "contain", marginBottom: 10 }} onError={e => { e.target.style.display = "none"; }} />
          <div style={{ fontSize: 9, letterSpacing: 4, color: "#ffffffaa", textTransform: "uppercase" }}>Panel de Administrador</div>
          <div style={{ fontSize: 20, fontWeight: "bold", color: "#ffffff", marginTop: 4 }}>🔐 Acceso Restringido</div>
        </div>
        <div style={{ background: B.card, border: `1px solid ${B.admin}30`, borderRadius: 14, padding: 22 }}>
          <div style={{ fontSize: 12, color: B.muted, marginBottom: 8 }}>Contraseña de administrador</div>
          <input type="password" autoFocus value={passInput} onChange={e => setPassInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Contraseña..."
            style={{ width: "100%", background: "#f8f8fc", border: `1px solid ${B.admin}50`, borderRadius: 8, padding: "10px 12px", color: B.text, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
          {passError && <div style={{ fontSize: 11, color: "#f44336", marginBottom: 8 }}>{passError}</div>}
          <button onClick={handleLogin} style={{ width: "100%", padding: 11, borderRadius: 9, border: "none", background: `linear-gradient(135deg,${B.admin},#6d28d9)`, color: "#ffffff", fontWeight: "bold", fontSize: 14, cursor: "pointer" }}>
            Entrar al Panel →
          </button>
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button onClick={onBack} style={{ background: "transparent", border: "none", color: B.muted, fontSize: 11, cursor: "pointer", textDecoration: "underline" }}>← Volver a la quiniela</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: B.bg, color: B.text, fontFamily: "Georgia,serif" }}>
      <div style={{ background: "#ffffff", borderBottom: `2px solid ${B.admin}`, padding: "10px 14px", position: "sticky", top: 0, zIndex: 100, boxShadow: `0 2px 12px ${B.admin}20` }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <button onClick={onBack} style={{ background: "#f0f0f5", border: "1px solid #e0e0e8", borderRadius: 8, padding: "5px 9px", color: "#555", cursor: "pointer", fontSize: 11 }}>← Salir</button>
            <div>
              <div style={{ fontSize: 8, letterSpacing: 3, color: B.admin }}>PANEL ADMINISTRADOR</div>
              <div style={{ fontSize: 14, fontWeight: "bold" }}>🔐 MundoFutbol 2026</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: B.muted }}>{participantes.length} participantes</span>
              <button onClick={saveResultados} disabled={saving} style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: saving ? "#e0e0e8" : B.admin, color: saving ? "#888" : "#ffffff", fontSize: 11, cursor: saving ? "not-allowed" : "pointer", fontWeight: "bold" }}>
                {saving ? "..." : saveMsg || "💾 Guardar"}
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
            {[["grupos","📋 Grupos"],["knockout","⚔️ Eliminatorias"],["especiales","🏆 Especiales"],["ranking","🥇 Ranking"],["jornadas","🔓 Jornadas"],["codigo","🔑 Código"]].map(([id, label]) => (
              <button key={id} onClick={() => setAdminTab(id)} style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: adminTab === id ? B.admin : "#f0f0f8", color: adminTab === id ? "#ffffff" : "#555", fontSize: 10, cursor: "pointer", fontWeight: "bold", whiteSpace: "nowrap", flexShrink: 0 }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "14px 12px 56px" }}>
        {loading && <div style={{ textAlign: "center", padding: 40, color: B.muted }}>⏳ Cargando datos...</div>}

        {/* ═══ GRUPOS ═══ */}
        {!loading && adminTab === "grupos" && (
          <>
            <div style={{ background: `${B.admin}15`, border: `1px solid ${B.admin}40`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 11, color: B.muted }}>
              📝 Ingresa los resultados <strong style={{ color: B.text }}>oficiales</strong> de cada partido.
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", marginBottom: 14 }}>
              {KEYS.map(g => {
                const ms = getMs(g);
                const done = ms.filter(m => !isNaN(parseInt(m.local)) && m.local !== "").length;
                const active = g === grupoActivo;
                return (
                  <button key={g} onClick={() => setGrupoActivo(g)} style={{ width: 36, height: 36, borderRadius: 7, fontSize: 12, fontWeight: "bold", border: active ? `2px solid ${B.admin}` : "2px solid transparent", background: done === 6 ? (active ? B.admin : "#f5f0ff") : active ? "#f5f0ff" : "#f5f5f7", color: done === 6 ? (active ? "#ffffff" : B.admin) : active ? B.admin : "#888", cursor: "pointer" }}>
                    {done === 6 && !active ? "✓" : g}
                  </button>
                );
              })}
            </div>
            {(() => {
              const gr = GRUPOS[grupoActivo];
              const ms = getMs(grupoActivo);
              return (
                <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${gr.accent}20`, marginBottom: 12 }}>
                  <div style={{ background: `linear-gradient(135deg,${gr.color},${gr.color}cc)`, padding: "10px 14px", borderBottom: `2px solid ${gr.accent}30` }}>
                    <div style={{ fontSize: 14, fontWeight: "bold" }}>Grupo {grupoActivo} — Resultados Oficiales</div>
                    <div style={{ fontSize: 10, color: "#ffffff70" }}>{gr.equipos.map(e => e.split(" ").slice(1).join(" ")).join(" · ")}</div>
                  </div>
                  <div style={{ background: "#ffffff" }}>
                    {[1, 2, 3].map(fecha => (
                      <div key={fecha}>
                        <div style={{ padding: "4px 14px", background: "#f8f8fc", fontSize: 9, color: "#888", fontWeight:"600", letterSpacing: 2, textTransform: "uppercase", borderBottom: "1px solid #eeeeef" }}>Jornada {fecha}</div>
                        {gr.partidos.filter(p => p.f === fecha).map(p => {
                          const idx = gr.partidos.indexOf(p);
                          const m = ms[idx];
                          const gl = parseInt(m?.local), gv = parseInt(m?.visita);
                          const ok = !isNaN(gl) && !isNaN(gv) && m?.local !== "" && m?.visita !== "";
                          const wL = ok && gl > gv, wV = ok && gv > gl;
                          return (
                            <div key={idx} style={{ padding: "8px 14px", borderBottom: "1px solid #eeeeef" }}>
                              <div style={{ fontSize: 9, color: "#aaa", marginBottom: 5 }}>📅 {p.fecha}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{ flex: 1, fontSize: 11, textAlign: "right", fontWeight: wL ? "bold" : "normal", color: wL ? "#111" : "#555" }}>{p.local}</div>
                                <input type="number" min="0" max="20" value={m?.local || ""} onChange={e => setGol(grupoActivo, idx, "local", e.target.value)}
                                  style={{ width: 36, height: 32, textAlign: "center", background: "#f0f0f0", border: `2px solid ${ok ? B.admin : "#e0e0e8"}`, borderRadius: 6, color: ok ? B.admin : "#bbb", fontSize: 15, fontWeight: "bold", outline: "none" }} />
                                <div style={{ width: 14, textAlign: "center", color: ok ? B.admin : "#ddd", fontWeight: "bold" }}>{ok ? "–" : "·"}</div>
                                <input type="number" min="0" max="20" value={m?.visita || ""} onChange={e => setGol(grupoActivo, idx, "visita", e.target.value)}
                                  style={{ width: 36, height: 32, textAlign: "center", background: "#f0f0f0", border: `2px solid ${ok ? B.admin : "#e0e0e8"}`, borderRadius: 6, color: ok ? "#111" : "#bbb", fontSize: 15, fontWeight: "bold", outline: "none" }} />
                                <div style={{ flex: 1, fontSize: 11, fontWeight: wV ? "bold" : "normal", color: wV ? "#111" : "#555" }}>{p.visita}</div>
                                {ok && <div style={{ fontSize: 10, color: B.admin, fontWeight: "bold", minWidth: 40, textAlign: "right" }}>{wL ? "L gana" : wV ? "V gana" : "Empate"}</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button onClick={() => { const i = KEYS.indexOf(grupoActivo); if (i > 0) setGrupoActivo(KEYS[i - 1]); }} disabled={grupoActivo === "A"} style={{ flex: 1, padding: 8, borderRadius: 9, border: "1px solid #e0e0e8", background: grupoActivo === "A" ? "#f5f5f7" : "#f0f0ff", color: grupoActivo === "A" ? "#ccc" : "#7c3aed", fontSize: 12, cursor: grupoActivo === "A" ? "not-allowed" : "pointer" }}>← Anterior</button>
              <button onClick={() => { const i = KEYS.indexOf(grupoActivo); if (i < KEYS.length - 1) setGrupoActivo(KEYS[i + 1]); }} disabled={grupoActivo === "L"} style={{ flex: 1, padding: 8, borderRadius: 9, border: "none", background: grupoActivo === "L" ? "#f5f5f7" : B.admin, color: grupoActivo === "L" ? "#ccc" : "#ffffff", fontSize: 12, fontWeight: "bold", cursor: grupoActivo === "L" ? "not-allowed" : "pointer" }}>Siguiente →</button>
            </div>
            <div style={{ background: "#ffffff", border: "1px solid #e0e0e8", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: B.muted, marginBottom: 8 }}>Cuando hayas ingresado todos los grupos, calcula los cruces de eliminatorias:</div>
              {autoMsg && <div style={{ fontSize: 11, color: B.admin, fontWeight: "bold", marginBottom: 8 }}>{autoMsg}</div>}
              <button onClick={autoPopulateBracket} style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: `linear-gradient(135deg,${B.admin},#6d28d9)`, color: "#ffffff", fontWeight: "bold", fontSize: 13, cursor: "pointer" }}>⚡ Auto-calcular Eliminatorias</button>
            </div>
          </>
        )}

        {/* ═══ ELIMINATORIAS ═══ */}
        {!loading && adminTab === "knockout" && (
          <>
            <div style={{ background: "#f5f0ff", border: `1px solid ${B.admin}40`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, fontSize: 11, color: B.admin }}>{autoMsg || "¿Los equipos no aparecen? Recalcula los cruces desde grupos."}</div>
              <button onClick={autoPopulateBracket} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: B.admin, color: "#ffffff", fontWeight: "bold", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>⚡ Recalcular</button>
            </div>
            <div style={{ display: "flex", gap: 4, overflowX: "auto", marginBottom: 14 }}>
              {RONDAS.map(r => {
                const matches = resultados.knockout?.[r.id] || [];
                const done = matches.filter(m => m.ganador).length;
                const active = r.id === rondaActiva;
                return (
                  <button key={r.id} onClick={() => setRondaActiva(r.id)} style={{ padding: "6px 10px", borderRadius: 8, border: `2px solid ${active ? B.admin : "transparent"}`, background: active ? B.adminDim : "#f5f5f7", color: active ? B.admin : done === r.partidos ? "#9b5de5" : B.muted, fontSize: 10, cursor: "pointer", fontWeight: "bold", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {r.emoji} {r.label} ({done}/{r.partidos})
                  </button>
                );
              })}
            </div>
            {(() => {
              const ronda = RONDAS.find(r => r.id === rondaActiva);
              const matches = resultados.knockout?.[rondaActiva] || Array.from({ length: ronda.partidos }, (_, i) => ({ id: i, local: "", localGoles: "", visita: "", visitaGoles: "", ganador: "", penaltis: false, penaltisGanador: "" }));
              return (
                <div style={{ display: ronda.partidos >= 4 ? "grid" : "block", gridTemplateColumns: ronda.partidos >= 4 ? "1fr 1fr" : "1fr", gap: 8 }}>
                  {matches.map((match, i) => {
                    const gl = parseInt(match.localGoles), gv = parseInt(match.visitaGoles);
                    const hasScore = !isNaN(gl) && !isNaN(gv) && match.localGoles !== "" && match.visitaGoles !== "";
                    const empate = hasScore && gl === gv;
                    const hasTeams = match.local || match.visita;
                    return (
                      <div key={i} style={{ background: B.card, border: `1px solid ${match.ganador ? B.admin + "80" : "#e0e0e8"}`, borderRadius: 12, padding: "10px 12px", marginBottom: ronda.partidos < 4 ? 8 : 0 }}>
                        <div style={{ fontSize: 9, color: B.muted, marginBottom: 7, display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#3a5bd9", fontWeight: "800" }}>{match.num || `Partido ${i+1}`}</span>
                          {match.ganador && <span style={{ color: B.admin, fontWeight: "bold" }}>✓ {match.ganador.split(" ").slice(0,2).join(" ")}</span>}
                        </div>
                        {match.fecha && <div style={{ fontSize: 9, color: "#aaa", marginBottom: 6 }}>📅 {match.fecha} · 📍 {match.sede}</div>}
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                          {hasTeams && match.local ? (<div style={{ flex: 1, fontSize: 11, textAlign: "right", fontWeight: match.ganador === match.local ? "bold" : "normal", color: match.ganador === match.local ? B.admin : "#111", background: "#f0f4ff", border: `1px solid ${match.ganador === match.local ? B.admin : "#c8d8ff"}`, borderRadius: 6, padding: "6px 8px" }}>{match.local}</div>)
                          : (<input value={match.local} onChange={e => setKO(rondaActiva, i, "local", e.target.value)} placeholder="Local..." style={{ flex: 1, background: "#f8f8fc", border: "1px solid #e0e0e8", borderRadius: 6, padding: "6px 8px", fontSize: 11, outline: "none" }} />)}
                          <input type="number" min="0" max="20" value={match.localGoles} onChange={e => setKO(rondaActiva, i, "localGoles", e.target.value)} style={{ width: 36, height: 32, textAlign: "center", background: "#f0f0f0", border: `2px solid ${hasScore ? B.admin : "#e0e0e8"}`, borderRadius: 6, color: hasScore ? B.admin : "#bbb", fontSize: 14, fontWeight: "bold", outline: "none" }} />
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: empate ? 8 : 0 }}>
                          {hasTeams && match.visita ? (<div style={{ flex: 1, fontSize: 11, fontWeight: match.ganador === match.visita ? "bold" : "normal", color: match.ganador === match.visita ? B.admin : "#111", background: "#f0f4ff", border: `1px solid ${match.ganador === match.visita ? B.admin : "#c8d8ff"}`, borderRadius: 6, padding: "6px 8px" }}>{match.visita}</div>)
                          : (<input value={match.visita} onChange={e => setKO(rondaActiva, i, "visita", e.target.value)} placeholder="Visitante..." style={{ flex: 1, background: "#f8f8fc", border: "1px solid #e0e0e8", borderRadius: 6, padding: "6px 8px", fontSize: 11, outline: "none" }} />)}
                          <input type="number" min="0" max="20" value={match.visitaGoles} onChange={e => setKO(rondaActiva, i, "visitaGoles", e.target.value)} style={{ width: 36, height: 32, textAlign: "center", background: "#f0f0f0", border: `2px solid ${hasScore ? B.admin : "#e0e0e8"}`, borderRadius: 6, color: hasScore ? "#111" : "#bbb", fontSize: 14, fontWeight: "bold", outline: "none" }} />
                        </div>
                        {empate && (<div style={{ marginTop: 8, padding: "6px 8px", background: "#f8f8fc", borderRadius: 8 }}><div style={{ fontSize: 9, color: B.muted, marginBottom: 5 }}>🥅 Penaltis:</div><div style={{ display: "flex", gap: 6 }}>{[match.local, match.visita].filter(Boolean).map(eq => (<button key={eq} onClick={() => { setKO(rondaActiva, i, "penaltis", true); setKO(rondaActiva, i, "penaltisGanador", eq); setKO(rondaActiva, i, "ganador", eq); }} style={{ flex: 1, padding: "5px 8px", borderRadius: 7, border: `1px solid ${match.ganador === eq ? B.admin : "#e0e0e8"}`, background: match.ganador === eq ? "#f5f0ff" : "#ffffff", color: match.ganador === eq ? B.admin : "#888", fontSize: 11, cursor: "pointer" }}>{eq.split(" ").slice(0,2).join(" ")}</button>))}</div></div>)}
                        {hasScore && !empate && (<div style={{ marginTop: 8 }}><div style={{ fontSize: 9, color: B.muted, marginBottom: 5 }}>Ganador oficial:</div><div style={{ display: "flex", gap: 6 }}>{[{eq:match.local,wins:gl>gv},{eq:match.visita,wins:gv>gl}].filter(x=>x.eq).map(({eq,wins})=>(<button key={eq} onClick={()=>setKO(rondaActiva,i,"ganador",eq)} style={{flex:1,padding:"5px 8px",borderRadius:7,border:`1px solid ${match.ganador===eq?B.admin:"#e0e0e8"}`,background:match.ganador===eq?"#f5f0ff":"#f8f8fc",color:match.ganador===eq?B.admin:"#888",fontSize:10,cursor:"pointer",fontWeight:match.ganador===eq?"bold":"normal"}}>{wins?"⚽ ":""}{eq.split(" ").slice(0,2).join(" ")}</button>))}</div></div>)}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </>
        )}

        {/* ═══ ESPECIALES ═══ */}
        {!loading && adminTab === "especiales" && (
          <div>
            {[{icon:"🥇",label:"Campeón del Mundo",field:"campeon",color:B.primary},{icon:"🥈",label:"Subcampeón",field:"segundo",color:"#888"},{icon:"🥉",label:"Tercer Lugar",field:"tercero",color:"#a07040"}].map(({icon,label,field,color})=>(
              <div key={field} style={{background:B.card,border:`1px solid ${color}20`,borderRadius:12,padding:14,marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><span style={{fontSize:20}}>{icon}</span><div style={{fontSize:13,fontWeight:"bold",color}}>{label}</div>{resultados[field]&&<div style={{marginLeft:"auto",fontSize:14}}>{resultados[field].split(" ")[0]}</div>}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{SELECCIONES.map(s=>(<button key={s} onClick={()=>setResultados(prev=>({...prev,[field]:s===prev[field]?"":s}))} style={{padding:"5px 10px",borderRadius:18,fontSize:11,border:`1px solid ${resultados[field]===s?color:"#e0e0e8"}`,background:resultados[field]===s?color+"15":"#f8f8fc",color:resultados[field]===s?color:"#555",cursor:"pointer",fontWeight:resultados[field]===s?"bold":"normal"}}>{s}</button>))}</div>
              </div>
            ))}
            <div style={{background:B.card,border:"1px solid #9b5de520",borderRadius:12,padding:14}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><span style={{fontSize:20}}>👟</span><div style={{fontSize:13,fontWeight:"bold",color:"#9b5de5"}}>Bota de Oro</div>{resultados.goleador&&<div style={{marginLeft:"auto",fontSize:11,color:"#9b5de5",fontWeight:"bold"}}>{resultados.goleador}</div>}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>{GOLEADORES.map(g=>(<button key={g.nombre} onClick={()=>setResultados(prev=>({...prev,goleador:g.nombre===prev.goleador?"":g.nombre}))} style={{padding:"7px 10px",borderRadius:8,textAlign:"left",border:`1px solid ${resultados.goleador===g.nombre?"#9b5de5":"#e0e0e0"}`,background:resultados.goleador===g.nombre?"#f5f0ff":"#f8f8fc",color:resultados.goleador===g.nombre?"#9b5de5":"#555",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><span>{g.sel}</span><div style={{flex:1}}><div style={{fontSize:11,fontWeight:resultados.goleador===g.nombre?"bold":"normal"}}>{g.nombre}</div>{g.club&&<div style={{fontSize:9,color:"#aaa"}}>{g.club}</div>}</div>{resultados.goleador===g.nombre&&<span>✓</span>}</button>))}</div>
            </div>
          </div>
        )}

        {/* ═══ JORNADAS ═══ */}
        {!loading && adminTab === "jornadas" && (
          <div>
            <div style={{background:`${B.admin}15`,border:`1px solid ${B.admin}40`,borderRadius:10,padding:"12px 14px",marginBottom:16,fontSize:11,color:B.muted}}>
              🔓 Cierra partidos específicos por <strong style={{color:B.text}}>grupo y jornada</strong>. 🔒 = bloqueado para edición. Los cambios aplican al instante.
            </div>

            {/* Quick actions */}
            <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
              {[1,2,3].map(f=>(
                <button key={f} onClick={()=>{
                  const allLocked=KEYS.every(g=>jornadasCerradas[`${g}-${f}`]);
                  const updated={...jornadasCerradas};
                  KEYS.forEach(g=>{updated[`${g}-${f}`]=!allLocked;});
                  setJornadasCerradas(updated);saveJornadas(updated);
                }} style={{padding:"6px 12px",borderRadius:8,border:"1px solid #e0e0e8",background:"#f5f5f7",color:"#555",fontSize:11,cursor:"pointer",fontWeight:"bold"}}>
                  {KEYS.every(g=>jornadasCerradas[`${g}-${f}`])?"🔓":"🔒"} Toda J{f}
                </button>
              ))}
              <button onClick={()=>{
                const allLocked=KEYS.every(g=>[1,2,3].every(f=>jornadasCerradas[`${g}-${f}`]));
                const updated={};
                KEYS.forEach(g=>[1,2,3].forEach(f=>{updated[`${g}-${f}`]=!allLocked;}));
                setJornadasCerradas(updated);saveJornadas(updated);
              }} style={{padding:"6px 12px",borderRadius:8,border:"1px solid #e63946",background:"#fff0f0",color:"#e63946",fontSize:11,cursor:"pointer",fontWeight:"bold"}}>
                🔒 Todo
              </button>
            </div>

            {/* Matrix table */}
            <div style={{background:"#ffffff",border:"1px solid #e0e0e8",borderRadius:12,overflow:"hidden",marginBottom:12}}>
              {/* Header */}
              <div style={{display:"grid",gridTemplateColumns:"52px 1fr 1fr 1fr",background:"#f5f5f7",borderBottom:"2px solid #e0e0e8"}}>
                <div style={{padding:"8px 10px",fontSize:9,color:"#888",fontWeight:"600",textTransform:"uppercase"}}>Grupo</div>
                {[1,2,3].map(f=>(
                  <div key={f} style={{padding:"8px 10px",fontSize:9,color:"#555",fontWeight:"700",textTransform:"uppercase",textAlign:"center",borderLeft:"1px solid #e0e0e8"}}>
                    Jornada {f}
                  </div>
                ))}
              </div>
              {/* Rows */}
              {KEYS.map((g,gi)=>{
                const gr=GRUPOS[g];
                return(
                  <div key={g} style={{display:"grid",gridTemplateColumns:"52px 1fr 1fr 1fr",borderTop:gi>0?"1px solid #f0f0f0":"none"}}>
                    <div style={{padding:"8px 10px",display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:24,height:24,borderRadius:5,background:gr.color,color:gr.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:"900"}}>{g}</div>
                    </div>
                    {[1,2,3].map(f=>{
                      const key=`${g}-${f}`;
                      const locked=jornadasCerradas[key]===true;
                      const partidos=gr.partidos.filter(p=>p.f===f);
                      return(
                        <div key={f} onClick={()=>{
                          const updated={...jornadasCerradas,[key]:!locked};
                          setJornadasCerradas(updated);saveJornadas(updated);
                        }} style={{padding:"8px 6px",borderLeft:"1px solid #f0f0f0",cursor:"pointer",background:locked?"#fff5f5":"#f5fff7",display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"background 0.15s"}}>
                          <div style={{fontSize:16}}>{locked?"🔒":"🔓"}</div>
                          <div style={{fontSize:8,color:locked?"#e63946":"#00a044",fontWeight:"bold"}}>{locked?"Cerrado":"Abierto"}</div>
                          <div style={{fontSize:7,color:"#aaa"}}>{partidos.length} partido{partidos.length!==1?"s":""}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {jornadasSaved&&<div style={{textAlign:"center",fontSize:12,color:"#00c853",fontWeight:"bold",marginBottom:8}}>✓ Guardado</div>}
            <div style={{background:"#f8f8fc",border:"1px solid #e0e0e8",borderRadius:10,padding:"10px 14px",fontSize:11,color:B.muted}}>
              💡 Haz clic en cualquier celda para cambiar su estado. Usa los botones de arriba para cerrar/abrir una jornada completa de golpe.
            </div>

            {/* Eliminatorias */}
            <div style={{marginTop:20,marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:"700",color:B.text,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>⚔️ Fases Eliminatorias</div>
              <div style={{background:`${B.admin}15`,border:`1px solid ${B.admin}40`,borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:11,color:B.muted}}>
                Cierra cada fase antes de que empiece a jugarse. Los participantes solo pueden elegir el ganador de cada partido.
              </div>
              {[
                {id:"r32",label:"Dieciseisavos",emoji:"⚔️"},
                {id:"r16",label:"Octavos",emoji:"🔥"},
                {id:"qf",label:"Cuartos de Final",emoji:"⭐"},
                {id:"sf",label:"Semifinales",emoji:"🌟"},
                {id:"final",label:"Final",emoji:"🏆"},
                {id:"third",label:"Tercer Puesto",emoji:"🥉"},
              ].map(r=>{
                const key=`ko-${r.id}`;
                const locked=jornadasCerradas[key]===true;
                const toggle=()=>{
                  const updated={...jornadasCerradas,[key]:!locked};
                  setJornadasCerradas(updated);saveJornadas(updated);
                };
                return(
                  <div key={r.id} style={{background:"#ffffff",border:`2px solid ${locked?"#e63946":"#00c853"}`,borderRadius:12,padding:"12px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
                    <div style={{fontSize:24}}>{r.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:"bold",color:B.text}}>{r.label}</div>
                      <div style={{fontSize:11,color:B.muted,marginTop:2}}>{locked?"🔒 Cerrada — los participantes no pueden editar":"🔓 Abierta — los participantes pueden elegir ganadores"}</div>
                    </div>
                    <button onClick={toggle} style={{padding:"7px 16px",borderRadius:9,border:`1px solid ${locked?"#00c85360":"#e6394660"}`,background:locked?"#00c85320":"#e6394620",color:locked?"#00a044":"#e63946",fontWeight:"bold",fontSize:12,cursor:"pointer"}}>
                      {locked?"🔓 Abrir":"🔒 Cerrar"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ CÓDIGO ═══ */}
        {!loading && adminTab === "codigo" && (
          <div>
            <div style={{background:`${B.admin}15`,border:`1px solid ${B.admin}40`,borderRadius:10,padding:"12px 14px",marginBottom:18,fontSize:11,color:B.muted}}>🔑 Define el código que los participantes necesitan para entrar.</div>
            <div style={{background:"#ffffff",border:"1px solid #e0e0e8",borderRadius:14,padding:20,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:"bold",color:B.text,marginBottom:4}}>Código de acceso actual</div>
              <div style={{fontSize:11,color:B.muted,marginBottom:16}}>Si lo cambias, las personas con el código antiguo no podrán volver a entrar.</div>
              <div style={{position:"relative",marginBottom:12}}>
                <input type="text" value={codigoAcceso} onChange={e=>setCodigoAcceso(e.target.value)} placeholder="Escribe el código..." style={{width:"100%",background:"#f8f8fc",border:`1px solid ${B.admin}60`,borderRadius:8,padding:"12px 14px 12px 40px",color:B.text,fontSize:16,outline:"none",boxSizing:"border-box",letterSpacing:2,fontWeight:"bold"}}/>
                <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:16}}>🔑</span>
              </div>
              <button onClick={saveCodigo} style={{width:"100%",padding:12,borderRadius:9,border:"none",background:codigoSaved?"#00c853":`linear-gradient(135deg,${B.admin},#6d28d9)`,color:"#ffffff",fontWeight:"bold",fontSize:14,cursor:"pointer"}}>{codigoSaved?"✓ Código guardado":"Guardar código"}</button>
            </div>
            {codigoAcceso&&(<div style={{background:"#ffffff",border:`2px dashed ${B.admin}50`,borderRadius:12,padding:16,textAlign:"center"}}><div style={{fontSize:10,color:B.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:8}}>Comparte este código</div><div style={{fontSize:32,fontWeight:"900",color:B.admin,letterSpacing:8,fontFamily:"monospace"}}>{codigoAcceso}</div></div>)}
          </div>
        )}

        {/* ═══ RANKING ═══ */}
        {!loading && adminTab === "ranking" && (
          <div>
            <div style={{background:`${B.admin}15`,border:`1px solid ${B.admin}40`,borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:11,color:B.muted}}>
              🏅 Puntuación en tiempo real. Usa <strong style={{color:B.admin}}>✏️ Editar</strong> para llenar la quiniela de un participante en su nombre.
            </div>
            {confirmDelete && (<div style={{background:"#fff8f0",border:"1px solid #f77f00",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:11,color:"#7a4000",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span>⚠️ Clic en "¿Seguro?" para confirmar eliminación</span><button onClick={()=>setConfirmDelete(null)} style={{background:"none",border:"none",color:"#7a4000",cursor:"pointer",fontSize:13}}>✕</button></div>)}
            <div style={{background:B.card,border:`1px solid ${B.border}`,borderRadius:12,overflow:"hidden",marginBottom:14}}>
              <div style={{display:"grid",gridTemplateColumns:"32px 1fr 36px 36px 36px 52px 52px 52px",gap:4,padding:"8px 12px",background:"#f8f8fc",fontSize:9,color:"#888",letterSpacing:1,textTransform:"uppercase",fontWeight:"600"}}>
                <div>#</div><div>Participante</div><div style={{textAlign:"center"}}>G</div><div style={{textAlign:"center"}}>E</div><div style={{textAlign:"center"}}>X</div><div style={{textAlign:"center"}}>PTS</div><div style={{textAlign:"center"}}>Editar</div><div style={{textAlign:"center"}}>Borrar</div>
              </div>
              {ranking.length === 0 && <div style={{padding:20,textAlign:"center",color:B.muted,fontSize:12}}>No hay participantes aún</div>}
              {ranking.map((p, rank) => (
                <div key={p.id} style={{display:"grid",gridTemplateColumns:"32px 1fr 36px 36px 36px 52px 52px 52px",gap:4,padding:"10px 12px",borderTop:"1px solid #eeeeef",background:rank===0?"#eff4ff":"transparent",alignItems:"center"}}>
                  <div style={{fontSize:rank<3?16:13,textAlign:"center"}}>{rank===0?"🥇":rank===1?"🥈":rank===2?"🥉":<span style={{color:B.muted}}>{rank+1}</span>}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:rank<3?"bold":"normal",color:rank===0?B.primary:B.text}}>{p.nombre}</div>
                    {p.campeon&&<div style={{fontSize:9,color:B.muted,marginTop:1}}>🏆 {p.campeon.split(" ").slice(1).join(" ")}</div>}
                    {p.email&&<div style={{fontSize:9,color:"#aaa"}}>{p.email}</div>}
                  </div>
                  <div style={{textAlign:"center",fontSize:12,color:"#555"}}>{p.score.groups}</div>
                  <div style={{textAlign:"center",fontSize:12,color:"#555"}}>{p.score.knockout}</div>
                  <div style={{textAlign:"center",fontSize:12,color:"#555"}}>{p.score.special}</div>
                  <div style={{textAlign:"center",fontSize:16,fontWeight:"bold",color:rank===0?B.primary:rank<3?B.primary2:B.text}}>{p.score.total}</div>
                  <div style={{textAlign:"center"}}>
                    <button onClick={() => setEditingUser(p)} style={{padding:"4px 8px",borderRadius:6,border:"none",fontSize:11,background:"#eff4ff",color:B.primary,cursor:"pointer",fontWeight:"bold"}}>✏️</button>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <button onClick={()=>deleteQuiniela(p.id)} disabled={deletingId===p.id} style={{padding:"4px 8px",borderRadius:6,border:"none",fontSize:11,background:confirmDelete===p.id?"#e63946":"#fff0f0",color:confirmDelete===p.id?"#ffffff":"#e63946",cursor:"pointer",fontWeight:confirmDelete===p.id?"bold":"normal",whiteSpace:"nowrap"}}>
                      {deletingId===p.id?"⏳":confirmDelete===p.id?"¿Seguro?":"🗑️"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
