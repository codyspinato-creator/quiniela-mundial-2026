// src/Admin.js
import { useState, useEffect, useCallback } from "react";
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import { GRUPOS, KEYS, SELECCIONES, GOLEADORES } from "./data";
import { calcTotalPoints } from "./scoring";

// ─── BRAND ───────────────────────────────────────────────────────────────────
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

function emptyResultados() {
  const k = {};
  RONDAS.forEach(r => {
    k[r.id] = Array.from({ length: r.partidos }, (_, i) => ({
      id: i, local: "", localGoles: "", visita: "", visitaGoles: "",
      ganador: "", penaltis: false, penaltisGanador: "",
    }));
  });
  return { scores: {}, knockout: k, campeon: "", segundo: "", tercero: "", goleador: "" };
}

// ─── ADMIN PANEL ─────────────────────────────────────────────────────────────
export default function Admin({ onBack }) {
  const [authed, setAuthed] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState("");
  const [codigoAcceso, setCodigoAcceso] = useState("");
  const [codigoSaved, setCodigoSaved] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // id to confirm

  const [resultados, setResultados] = useState(emptyResultados());
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [adminTab, setAdminTab] = useState("grupos"); // grupos | knockout | especiales | ranking
  const [grupoActivo, setGrupoActivo] = useState("A");
  const [rondaActiva, setRondaActiva] = useState("r32");

  // ── Save access code ──────────────────────────────────────────────────────
  const saveCodigo = async () => {
    try {
      await setDoc(doc(db, "admin", "config"), { codigoAcceso: codigoAcceso.trim(), updatedAt: Date.now() });
      setCodigoSaved(true);
      setTimeout(() => setCodigoSaved(false), 3000);
    } catch (e) { console.error(e); }
  };

  // ── Delete quiniela ────────────────────────────────────────────────────────
  const deleteQuiniela = async (id, nombre) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id); // first click: ask confirm
      return;
    }
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "quinielas", id));
      setParticipantes(prev => prev.filter(p => p.id !== id));
      setConfirmDelete(null);
    } catch (e) { console.error(e); }
    setDeletingId(false);
  };

  // ── Load oficial results + participants ────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load official results
      const rSnap = await getDoc(doc(db, "admin", "resultados"));
      if (rSnap.exists()) {
        const data = rSnap.data();
        setResultados({ ...emptyResultados(), ...data });
      }
      // Load access code config
      const cfgSnap = await getDoc(doc(db, "admin", "config"));
      if (cfgSnap.exists()) {
        setCodigoAcceso(cfgSnap.data().codigoAcceso || "");
      }
      // Load all participants
      const pSnap = await getDocs(collection(db, "quinielas"));
      const list = [];
      pSnap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setParticipantes(list.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { if (authed) loadData(); }, [authed, loadData]);

  // ── Save official results ──────────────────────────────────────────────────
  const saveResultados = async () => {
    setSaving(true); setSaveMsg("");
    try {
      await setDoc(doc(db, "admin", "resultados"), { ...resultados, updatedAt: Date.now() });
      setSaveMsg("¡Guardado! ✓");
    } catch (e) { setSaveMsg("Error ✗"); }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const setGol = (g, idx, lado, val) => {
    setResultados(prev => {
      const arr = GRUPOS[g].partidos.map((_, i) => prev.scores?.[g]?.[i] || { local: "", visita: "" });
      arr[idx] = { ...arr[idx], [lado]: val };
      return { ...prev, scores: { ...prev.scores, [g]: arr } };
    });
  };

  const setKO = (rondaId, idx, field, val) => {
    setResultados(prev => {
      const arr = [...(prev.knockout?.[rondaId] || RONDAS.find(r => r.id === rondaId).partidos && Array.from({ length: RONDAS.find(r => r.id === rondaId).partidos }, (_, i) => ({ id: i, local: "", localGoles: "", visita: "", visitaGoles: "", ganador: "", penaltis: false, penaltisGanador: "" })))];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...prev, knockout: { ...prev.knockout, [rondaId]: arr } };
    });
  };

  const getMs = (g) => GRUPOS[g].partidos.map((_, i) => resultados.scores?.[g]?.[i] || { local: "", visita: "" });

  // ── Ranking ────────────────────────────────────────────────────────────────
  const ranking = participantes.map(p => {
    const score = calcTotalPoints(p, resultados);
    return { ...p, score };
  }).sort((a, b) => b.score.total - a.score.total);

  // ── Password check ─────────────────────────────────────────────────────────
  const ADMIN_PASS = "mundofutbol2026"; // ← CAMBIA ESTO antes de publicar

  const handleLogin = () => {
    if (passInput === ADMIN_PASS) { setAuthed(true); setPassError(""); }
    else { setPassError("Contraseña incorrecta"); }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // LOGIN ADMIN
  // ════════════════════════════════════════════════════════════════════════════
  if (!authed) return (
    <div style={{ minHeight: "100vh", background: B.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", padding: 20 }}>
      <div style={{ maxWidth: 340, width: "100%" }}>
        <div style={{
          background:"linear-gradient(135deg,#2a4bc9,#7c3aed)",
          borderRadius:16,padding:"20px",marginBottom:20,textAlign:"center",
          border:"1px solid #9b5de530",position:"relative",overflow:"hidden"
        }}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:"linear-gradient(90deg,#f15bb5,#9b5de5,#00bbf9,#fee440)"}}/>
          <img src={B.logoMF} alt="MundoFutbol" style={{ height: 44, objectFit: "contain", marginBottom: 10, filter:"drop-shadow(0 0 8px #9b5de560)" }} onError={e => { e.target.style.display = "none"; }} />
          <div style={{ fontSize: 9, letterSpacing: 4, color: B.admin, textTransform: "uppercase" }}>Panel de Administrador</div>
          <div style={{ fontSize: 20, fontWeight: "bold", color: B.text, marginTop: 4 }}>🔐 Acceso Restringido</div>
        </div>
        <div style={{ background: B.card, border: `1px solid ${B.admin}30`, borderRadius: 14, padding: 22 }}>
          <div style={{ fontSize: 12, color: B.muted, marginBottom: 8 }}>Contraseña de administrador</div>
          <input
            type="password" autoFocus value={passInput}
            onChange={e => setPassInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="Contraseña..."
            style={{ width: "100%", background: "#ffffff", border: `1px solid ${B.admin}50`, borderRadius: 8, padding: "10px 12px", color: B.text, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 8 }}
          />
          {passError && <div style={{ fontSize: 11, color: "#f44336", marginBottom: 8 }}>{passError}</div>}
          <button onClick={handleLogin} style={{ width: "100%", padding: 11, borderRadius: 9, border: "none", background: `linear-gradient(135deg,${B.admin},#e05c00)`, color: "#ffffff", fontWeight: "bold", fontSize: 14, cursor: "pointer" }}>
            Entrar al Panel →
          </button>
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button onClick={onBack} style={{ background: "transparent", border: "none", color: B.muted, fontSize: 11, cursor: "pointer", textDecoration: "underline" }}>← Volver a la quiniela</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // PANEL ADMIN
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight: "100vh", background: B.bg, color: B.text, fontFamily: "Georgia,serif" }}>
      {/* HEADER ADMIN */}
      <div style={{ background: "#ffffff", borderBottom: `2px solid ${B.admin}`, padding: "10px 14px", position: "sticky", top: 0, zIndex: 100, boxShadow: `0 4px 20px ${B.admin}20` }}>
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
            {[["grupos", "📋 Grupos"], ["knockout", "⚔️ Eliminatorias"], ["especiales", "🏆 Especiales"], ["ranking", "🥇 Ranking"], ["codigo", "🔑 Código"]].map(([id, label]) => (
              <button key={id} onClick={() => setAdminTab(id)} style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: adminTab === id ? B.admin : "#f0f0f8", color: adminTab === id ? "#ffffff" : "#555", fontSize: 10, cursor: "pointer", fontWeight: "bold", whiteSpace: "nowrap", flexShrink: 0 }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "14px 12px 56px" }}>
        {loading && <div style={{ textAlign: "center", padding: 40, color: B.muted }}>⏳ Cargando datos...</div>}

        {/* ═══ RESULTADOS GRUPOS ═══ */}
        {!loading && adminTab === "grupos" && (
          <>
            <div style={{ background: `${B.admin}15`, border: `1px solid ${B.admin}40`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 11, color: B.muted }}>
              📝 Ingresa los resultados <strong style={{ color: B.text }}>oficiales</strong> de cada partido. Los puntos se calcularán automáticamente al guardar.
            </div>

            {/* Selector grupos */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", marginBottom: 14 }}>
              {KEYS.map(g => {
                const gr = GRUPOS[g];
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

            {/* Partidos del grupo activo */}
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
                        <div style={{ padding: "4px 14px", background: "#f8f8fc", fontSize: 9, color: "#888", letterSpacing: 2, textTransform: "uppercase", borderBottom: "1px solid #eeeeef" }}>Jornada {fecha}</div>
                        {gr.partidos.filter(p => p.f === fecha).map(p => {
                          const idx = gr.partidos.indexOf(p);
                          const m = ms[idx];
                          const gl = parseInt(m?.local), gv = parseInt(m?.visita);
                          const ok = !isNaN(gl) && !isNaN(gv) && m?.local !== "" && m?.visita !== "";
                          const wL = ok && gl > gv, wV = ok && gv > gl;
                          return (
                            <div key={idx} style={{ padding: "8px 14px", borderBottom: "1px solid #eeeeef", background: "transparent" }}>
                              <div style={{ fontSize: 9, color: "#888", marginBottom: 5 }}>📅 {p.fecha}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{ flex: 1, fontSize: 11, textAlign: "right", fontWeight: wL ? "bold" : "normal", color: wL ? "#111" : ok ? "#333" : "#888" }}>{p.local}</div>
                                <input type="number" min="0" max="20" value={m?.local || ""} onChange={e => setGol(grupoActivo, idx, "local", e.target.value)}
                                  style={{ width: 36, height: 32, textAlign: "center", background: "#f0f0f0", border: `2px solid ${ok ? B.admin : "#e0e0e8"}`, borderRadius: 6, color: ok ? B.admin : "#bbb", fontSize: 15, fontWeight: "bold", outline: "none" }} />
                                <div style={{ width: 14, textAlign: "center", fontSize: 11, color: ok ? B.admin : "#222", fontWeight: "bold" }}>{ok ? "–" : "·"}</div>
                                <input type="number" min="0" max="20" value={m?.visita || ""} onChange={e => setGol(grupoActivo, idx, "visita", e.target.value)}
                                  style={{ width: 36, height: 32, textAlign: "center", background: "#f0f0f0", border: `2px solid ${ok ? B.admin : "#e0e0e8"}`, borderRadius: 6, color: ok ? "#111" : "#bbb", fontSize: 15, fontWeight: "bold", outline: "none" }} />
                                <div style={{ flex: 1, fontSize: 11, fontWeight: wV ? "bold" : "normal", color: wV ? "#111" : ok ? "#333" : "#888" }}>{p.visita}</div>
                                {ok && <div style={{ fontSize: 10, color: B.admin, fontWeight:"bold", minWidth: 40, textAlign: "right" }}>{wL ? "L gana" : wV ? "V gana" : "Empate"}</div>}
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

            {/* Navegación grupos */}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { const i = KEYS.indexOf(grupoActivo); if (i > 0) setGrupoActivo(KEYS[i - 1]); }} disabled={grupoActivo === "A"} style={{ flex: 1, padding: 8, borderRadius: 9, border: "1px solid #e0e0e8", background: grupoActivo === "A" ? "#f5f5f7" : "#f0f0ff", color: grupoActivo === "A" ? "#ccc" : "#7c3aed", fontSize: 12, cursor: grupoActivo === "A" ? "not-allowed" : "pointer" }}>← Anterior</button>
              <button onClick={() => { const i = KEYS.indexOf(grupoActivo); if (i < KEYS.length - 1) setGrupoActivo(KEYS[i + 1]); }} disabled={grupoActivo === "L"} style={{ flex: 1, padding: 8, borderRadius: 9, border: "none", background: grupoActivo === "L" ? "#f5f5f7" : B.admin, color: grupoActivo === "L" ? "#ccc" : "#ffffff", fontSize: 12, fontWeight: "bold", cursor: grupoActivo === "L" ? "not-allowed" : "pointer" }}>Siguiente →</button>
            </div>
          </>
        )}

        {/* ═══ RESULTADOS ELIMINATORIAS ═══ */}
        {!loading && adminTab === "knockout" && (
          <>
            <div style={{ background: `${B.admin}15`, border: `1px solid ${B.admin}40`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 11, color: B.muted }}>
              📝 Ingresa los resultados oficiales de la fase eliminatoria.
            </div>
            {/* Tabs rondas */}
            <div style={{ display: "flex", gap: 4, overflowX: "auto", marginBottom: 14 }}>
              {RONDAS.map(r => {
                const matches = resultados.knockout?.[r.id] || [];
                const done = matches.filter(m => m.ganador).length;
                const active = r.id === rondaActiva;
                return (
                  <button key={r.id} onClick={() => setRondaActiva(r.id)} style={{ padding: "6px 10px", borderRadius: 8, border: `2px solid ${active ? B.admin : "transparent"}`, background: active ? B.adminDim : "#ffffff06", color: active ? B.admin : done === r.partidos ? "#9b5de5" : B.muted, fontSize: 10, cursor: "pointer", fontWeight: "bold", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {r.emoji} {r.label} <span style={{ opacity: 0.7 }}>({done}/{r.partidos})</span>
                  </button>
                );
              })}
            </div>
            {/* Partidos de la ronda */}
            {(() => {
              const ronda = RONDAS.find(r => r.id === rondaActiva);
              const matches = resultados.knockout?.[rondaActiva] || Array.from({ length: ronda.partidos }, (_, i) => ({ id: i, local: "", localGoles: "", visita: "", visitaGoles: "", ganador: "", penaltis: false, penaltisGanador: "" }));
              return (
                <div style={{ display: ronda.partidos >= 4 ? "grid" : "block", gridTemplateColumns: ronda.partidos >= 4 ? "1fr 1fr" : "1fr", gap: 8 }}>
                  {matches.map((match, i) => {
                    const gl = parseInt(match.localGoles), gv = parseInt(match.visitaGoles);
                    const hasScore = !isNaN(gl) && !isNaN(gv) && match.localGoles !== "" && match.visitaGoles !== "";
                    const empate = hasScore && gl === gv;
                    return (
                      <div key={i} style={{ background: B.card, border: `1px solid ${match.ganador ? B.admin + "80" : "#e0e0e8"}`, borderRadius: 12, padding: "10px 12px", marginBottom: ronda.partidos < 4 ? 8 : 0 }}>
                        <div style={{ fontSize: 9, color: B.muted, marginBottom: 7, display: "flex", justifyContent: "space-between" }}>
                          <span>Partido {i + 1}</span>
                          {match.ganador && <span style={{ color: B.admin, fontWeight: "bold" }}>✓ {match.ganador.split(" ").slice(0, 2).join(" ")}</span>}
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                          <input value={match.local} onChange={e => setKO(rondaActiva, i, "local", e.target.value)} placeholder="Local..." style={{ flex: 1, background: "#ffffff", border: `1px solid ${match.ganador === match.local && match.local ? B.admin : "#e0e0e8"}`, borderRadius: 6, padding: "5px 8px", color: match.ganador === match.local ? B.admin : "#111", fontSize: 11, outline: "none", fontWeight: match.ganador === match.local ? "bold" : "normal" }} />
                          <input type="number" min="0" max="20" value={match.localGoles} onChange={e => setKO(rondaActiva, i, "localGoles", e.target.value)} style={{ width: 34, height: 28, textAlign: "center", background: "#f0f0f0", border: `2px solid ${hasScore ? B.admin : "#e0e0e8"}`, borderRadius: 6, color: hasScore ? B.admin : "#bbb", fontSize: 14, fontWeight: "bold", outline: "none" }} />
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: empate ? 8 : 0 }}>
                          <input value={match.visita} onChange={e => setKO(rondaActiva, i, "visita", e.target.value)} placeholder="Visitante..." style={{ flex: 1, background: "#ffffff", border: `1px solid ${match.ganador === match.visita && match.visita ? B.admin : "#e0e0e8"}`, borderRadius: 6, padding: "5px 8px", color: match.ganador === match.visita ? B.admin : "#111", fontSize: 11, outline: "none", fontWeight: match.ganador === match.visita ? "bold" : "normal" }} />
                          <input type="number" min="0" max="20" value={match.visitaGoles} onChange={e => setKO(rondaActiva, i, "visitaGoles", e.target.value)} style={{ width: 34, height: 28, textAlign: "center", background: "#f0f0f0", border: `2px solid ${hasScore ? B.admin : "#e0e0e8"}`, borderRadius: 6, color: hasScore ? "#111" : "#bbb", fontSize: 14, fontWeight: "bold", outline: "none" }} />
                        </div>
                        {/* Penaltis */}
                        {empate && (
                          <div style={{ marginTop: 8, padding: "6px 8px", background: "#ffffff", borderRadius: 8, border: "1px solid #e8e8f0" }}>
                            <div style={{ fontSize: 9, color: B.muted, marginBottom: 5 }}>🥅 Penaltis — ganador oficial:</div>
                            <div style={{ display: "flex", gap: 6 }}>
                              {[match.local, match.visita].filter(Boolean).map(eq => (
                                <button key={eq} onClick={() => { setKO(rondaActiva, i, "penaltis", true); setKO(rondaActiva, i, "penaltisGanador", eq); setKO(rondaActiva, i, "ganador", eq); }} style={{ flex: 1, padding: "5px 8px", borderRadius: 7, border: `1px solid ${match.ganador === eq ? B.admin : "#e0e0e8"}`, background: match.ganador === eq ? "#f5f0ff" : "#f8f8fc", color: match.ganador === eq ? B.admin : B.muted, fontSize: 11, cursor: "pointer", fontWeight: match.ganador === eq ? "bold" : "normal" }}>
                                  {eq.split(" ").slice(0, 2).join(" ")}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Ganador si no hay empate */}
                        {hasScore && !empate && (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ fontSize: 9, color: B.muted, marginBottom: 5 }}>Ganador oficial:</div>
                            <div style={{ display: "flex", gap: 6 }}>
                              {[{ eq: match.local, wins: gl > gv }, { eq: match.visita, wins: gv > gl }].filter(x => x.eq).map(({ eq, wins }) => (
                                <button key={eq} onClick={() => setKO(rondaActiva, i, "ganador", eq)} style={{ flex: 1, padding: "5px 8px", borderRadius: 7, border: `1px solid ${match.ganador === eq ? B.admin : "#ffffff12"}`, background: match.ganador === eq ? B.adminDim : "#ffffff06", color: match.ganador === eq ? B.admin : B.muted, fontSize: 10, cursor: "pointer", fontWeight: match.ganador === eq ? "bold" : "normal" }}>
                                  {wins ? "⚽ " : ""}{eq.split(" ").slice(0, 2).join(" ")}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
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
            <div style={{ background: `${B.admin}15`, border: `1px solid ${B.admin}40`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 11, color: B.muted }}>
              📝 Define los resultados oficiales de las predicciones especiales. Se compararán con las de cada participante para asignar 5 puntos por acierto.
            </div>
            {[
              { icon: "🥇", label: "Campeón del Mundo", field: "campeon", color: B.primary },
              { icon: "🥈", label: "Subcampeón", field: "segundo", color: "#888" },
              { icon: "🥉", label: "Tercer Lugar", field: "tercero", color: "#a07040" },
            ].map(({ icon, label, field, color }) => (
              <div key={field} style={{ background: B.card, border: `1px solid ${color}20`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <div style={{ fontSize: 13, fontWeight: "bold", color }}>{label}</div>
                  {resultados[field] && <div style={{ marginLeft: "auto", fontSize: 14 }}>{resultados[field].split(" ")[0]}</div>}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {SELECCIONES.map(s => (
                    <button key={s} onClick={() => setResultados(prev => ({ ...prev, [field]: s === prev[field] ? "" : s }))}
                      style={{ padding: "5px 10px", borderRadius: 18, fontSize: 11, border: `1px solid ${resultados[field] === s ? color : "#ffffff10"}`, background: resultados[field] === s ? color + "20" : "#ffffff05", color: resultados[field] === s ? color : B.muted, cursor: "pointer", fontWeight: resultados[field] === s ? "bold" : "normal" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {/* Goleador */}
            <div style={{ background: B.card, border: "1px solid #4caf5020", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>👟</span>
                <div style={{ fontSize: 13, fontWeight: "bold", color: "#9b5de5" }}>Bota de Oro — Goleador oficial</div>
                {resultados.goleador && <div style={{ marginLeft: "auto", fontSize: 11, color: "#9b5de5", fontWeight: "bold" }}>{resultados.goleador}</div>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: resultados.goleador === "Otro..." ? 8 : 0 }}>
                {GOLEADORES.map(g => (
                  <button key={g.nombre} onClick={() => setResultados(prev => ({ ...prev, goleador: g.nombre === prev.goleador ? "" : g.nombre }))}
                    style={{ padding: "7px 10px", borderRadius: 8, textAlign: "left", border: `1px solid ${resultados.goleador === g.nombre ? "#9b5de5" : "#ffffff0d"}`, background: resultados.goleador === g.nombre ? "#4caf5012" : "#ffffff04", color: resultados.goleador === g.nombre ? "#9b5de5" : B.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <span>{g.sel}</span>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: resultados.goleador === g.nombre ? "bold" : "normal" }}>{g.nombre}</div>{g.club && <div style={{ fontSize: 9, color: "#888" }}>{g.club}</div>}</div>
                    {resultados.goleador === g.nombre && <span>✓</span>}
                  </button>
                ))}
              </div>
              {resultados.goleador === "Otro..." && (
                <input type="text" placeholder="Nombre del goleador oficial..." value={resultados.goleadorCustom || ""} onChange={e => setResultados(prev => ({ ...prev, goleadorCustom: e.target.value }))}
                  style={{ width: "100%", background: "#ffffff06", border: "1px solid #4caf5025", borderRadius: 8, padding: "8px 12px", color: B.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              )}
            </div>
          </div>
        )}

        {/* ═══ CÓDIGO DE ACCESO ═══ */}
        {!loading && adminTab === "codigo" && (
          <div>
            <div style={{ background:`${B.admin}15`, border:`1px solid ${B.admin}40`, borderRadius:10, padding:"12px 14px", marginBottom:18, fontSize:11, color:B.muted }}>
              🔑 Define el código que los participantes necesitan para entrar a la quiniela. Compártelo solo con las personas que quieras que participen.
            </div>

            <div style={{ background:"#ffffff", border:"1px solid #e0e0e8", borderRadius:14, padding:20, marginBottom:14, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize:13, fontWeight:"bold", color:B.text, marginBottom:4 }}>Código de acceso actual</div>
              <div style={{ fontSize:11, color:B.muted, marginBottom:16 }}>
                Los participantes deben ingresar este código al entrar. Si lo cambias, las personas con el código antiguo no podrán volver a entrar (aunque sus quinielas se conservan).
              </div>

              <div style={{ position:"relative", marginBottom:12 }}>
                <input
                  type="text"
                  value={codigoAcceso}
                  onChange={e => setCodigoAcceso(e.target.value)}
                  placeholder="Escribe el código de acceso..."
                  style={{ width:"100%", background:"#f8f8fc", border:`1px solid ${B.admin}60`, borderRadius:8, padding:"12px 14px 12px 40px", color:B.text, fontSize:16, outline:"none", boxSizing:"border-box", letterSpacing:2, fontWeight:"bold" }}
                />
                <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:16 }}>🔑</span>
              </div>

              <button onClick={saveCodigo} style={{ width:"100%", padding:12, borderRadius:9, border:"none", background:codigoSaved ? "#00c853" : `linear-gradient(135deg,${B.admin},#e05c00)`, color:"#ffffff", fontWeight:"bold", fontSize:14, cursor:"pointer" }}>
                {codigoSaved ? "✓ Código guardado" : "Guardar código"}
              </button>
            </div>

            {codigoAcceso && (
              <div style={{ background:B.card, border:`2px dashed ${B.admin}50`, borderRadius:12, padding:16, textAlign:"center" }}>
                <div style={{ fontSize:10, color:B.muted, letterSpacing:3, textTransform:"uppercase", marginBottom:8 }}>Comparte este código con los participantes</div>
                <div style={{ fontSize:32, fontWeight:"900", color:B.admin, letterSpacing:8 }}>{codigoAcceso}</div>
                <div style={{ fontSize:10, color:B.muted, marginTop:8 }}>Solo quien tenga este código podrá entrar a la quiniela</div>
              </div>
            )}

            {!codigoAcceso && (
              <div style={{ background:"#ffffff06", border:"1px solid #ffffff10", borderRadius:10, padding:14, textAlign:"center" }}>
                <div style={{ fontSize:28, marginBottom:8 }}>🔓</div>
                <div style={{ fontSize:13, color:B.muted }}>Sin código configurado — cualquiera puede entrar</div>
                <div style={{ fontSize:11, color:"#555", marginTop:4 }}>Define un código arriba para restringir el acceso</div>
              </div>
            )}
          </div>
        )}

        {/* ═══ RANKING ═══ */}
        {!loading && adminTab === "ranking" && (
          <div>
            <div style={{ background: `${B.admin}15`, border: `1px solid ${B.admin}40`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 11, color: B.muted }}>
              🏅 Puntuación calculada en tiempo real según los resultados oficiales ingresados. Guarda los resultados para actualizar las puntuaciones de todos.
            </div>

            {/* Tabla de puntuación */}
            <div style={{ background: B.card, border: `1px solid ${B.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
              {/* Header tabla */}
              <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 180px 36px 36px 36px 52px 52px", gap: 4, padding: "8px 12px", background: "#f8f8fc", fontSize: 9, color: "#888", letterSpacing: 1, textTransform: "uppercase", fontWeight: "600" }}>
                <div>#</div><div>Participante</div><div>WhatsApp</div><div style={{ textAlign: "center" }}>G</div><div style={{ textAlign: "center" }}>E</div><div style={{ textAlign: "center" }}>X</div><div style={{ textAlign: "center" }}>PTS</div><div></div>
              </div>
              {ranking.length === 0 && <div style={{ padding: 20, textAlign: "center", color: B.muted, fontSize: 12 }}>No hay participantes aún</div>}
              {ranking.map((p, rank) => (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "32px 1fr 180px 36px 36px 36px 52px 52px", gap: 4, padding: "10px 12px", borderTop: "1px solid #eeeeef", background: rank === 0 ? "#eff4ff" : "transparent", alignItems: "center" }}>
                  <div style={{ fontSize: rank < 3 ? 16 : 13, textAlign: "center" }}>
                    {rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : <span style={{ color: B.muted }}>{rank + 1}</span>}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: rank < 3 ? "bold" : "normal", color: rank === 0 ? B.primary : B.text }}>{p.nombre}</div>
                    {p.campeon && <div style={{ fontSize: 9, color: B.muted, marginTop: 1 }}>🏆 {p.campeon.split(" ").slice(1).join(" ")}</div>}
                  </div>
                  <div style={{ fontSize: 10, color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "2px 0" }}>
                    {p.email ? <a href={`mailto:${p.email}`} style={{ color: "#3a5bd9", textDecoration: "none" }}>{p.email}</a> : <span style={{ color: "#ccc", fontStyle: "italic" }}>—</span>}
                  </div>
                  <div style={{ textAlign: "center", fontSize: 12, color: "#555" }}>{p.score.groups}</div>
                  <div style={{ textAlign: "center", fontSize: 12, color: "#555" }}>{p.score.knockout}</div>
                  <div style={{ textAlign: "center", fontSize: 12, color: "#555" }}>{p.score.special}</div>
                  <div style={{ textAlign: "center", fontSize: 16, fontWeight: "bold", color: rank === 0 ? B.primary : rank < 3 ? B.primary2 : B.text }}>{p.score.total}</div>
                  <div style={{ textAlign: "center" }}>
                    <button
                      onClick={() => deleteQuiniela(p.id, p.nombre)}
                      disabled={deletingId === p.id}
                      style={{
                        padding: "4px 8px", borderRadius: 6, border: "none", fontSize: 11,
                        background: confirmDelete === p.id ? "#e63946" : "#fff0f0",
                        color: confirmDelete === p.id ? "#ffffff" : "#e63946",
                        cursor: "pointer", fontWeight: confirmDelete === p.id ? "bold" : "normal",
                        transition: "all 0.2s", whiteSpace: "nowrap",
                      }}
                    >
                      {deletingId === p.id ? "⏳" : confirmDelete === p.id ? "¿Seguro?" : "🗑️"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Leyenda de puntuación */}
            <div style={{ background: "#ffffff", border: "1px solid #e0e0e8", borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: B.primary, textTransform: "uppercase", marginBottom: 10 }}>Sistema de Puntuación</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11 }}>
                {[
                  { label: "Resultado exacto (grupos)", pts: 5, color: B.primary },
                  { label: "Solo ganador/empate (grupos)", pts: 3, color: "#9b5de5" },
                  { label: "Ganador correcto (eliminatorias)", pts: 3, color: "#9b5de5" },
                  { label: "Resultado exacto (eliminatorias)", pts: 5, color: B.primary },
                  { label: "Campeón correcto", pts: 5, color: B.primary },
                  { label: "Subcampeón correcto", pts: 5, color: B.primary },
                  { label: "Tercer lugar correcto", pts: 5, color: B.primary },
                  { label: "Goleador correcto", pts: 5, color: B.primary },
                ].map(({ label, pts, color }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#f8f8fc", border: "1px solid #e8e8f0", borderRadius: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: "bold", color, minWidth: 24, textAlign: "center" }}>+{pts}</div>
                    <div style={{ fontSize: 10, color: B.muted, lineHeight: 1.3 }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, padding: "8px 10px", background: "#f8f8fc", borderRadius: 8, fontSize: 10, color: B.muted }}>
                📊 Máximo posible: Grupos <strong style={{ color: B.text }}>360 pts</strong> + Eliminatorias <strong style={{ color: B.text }}>160 pts</strong> + Especiales <strong style={{ color: B.text }}>20 pts</strong> = <strong style={{ color: B.primary }}>540 pts</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
