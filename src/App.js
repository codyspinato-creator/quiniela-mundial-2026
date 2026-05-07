import { useState, useEffect, useCallback } from "react";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { GRUPOS, KEYS, SELECCIONES, GOLEADORES, calcTabla, completionPct } from "./data";

// ─── SCREENS ──────────────────────────────────────────────────────────────────
// "login" | "quiniela" | "portal" | "verUser"

export default function App() {
  const [screen, setScreen] = useState("login");
  const [myId, setMyId] = useState("");
  const [myNombre, setMyNombre] = useState("");
  const [loginInput, setLoginInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [portalData, setPortalData] = useState([]);
  const [portalLoading, setPortalLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Quiniela state
  const [scores, setScores] = useState({});
  const [campeon, setCampeon] = useState("");
  const [segundo, setSegundo] = useState("");
  const [tercero, setTercero] = useState("");
  const [goleador, setGoleador] = useState("");
  const [goleadorCustom, setGoleadorCustom] = useState("");

  // UI
  const [tab, setTab] = useState("partidos");
  const [grupo, setGrupo] = useState("A");

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    const name = loginInput.trim();
    if (!name || name.length < 2) { setLoginError("Escribe al menos 2 caracteres"); return; }
    if (name.length > 24) { setLoginError("Máximo 24 caracteres"); return; }
    const id = name.toLowerCase().replace(/[^a-z0-9áéíóúüñ]/gi, "_").substring(0, 24);
    setMyId(id);
    setMyNombre(name);
    try {
      const snap = await getDoc(doc(db, "quinielas", id));
      if (snap.exists()) {
        const data = snap.data();
        setScores(data.scores || {});
        setCampeon(data.campeon || "");
        setSegundo(data.segundo || "");
        setTercero(data.tercero || "");
        setGoleador(data.goleador || "");
        setGoleadorCustom(data.goleadorCustom || "");
      }
    } catch (e) { console.log("New user or load error", e); }
    setLoginError("");
    setScreen("quiniela");
  };

  // ── SAVE ───────────────────────────────────────────────────────────────────
  const saveQuiniela = async () => {
    setSaving(true); setSaveMsg("");
    try {
      await setDoc(doc(db, "quinielas", myId), {
        nombre: myNombre, scores, campeon, segundo, tercero,
        goleador, goleadorCustom, updatedAt: Date.now(),
      });
      setSaveMsg("¡Guardado! ✓");
    } catch (e) { setSaveMsg("Error al guardar ✗"); }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  // ── LOAD PORTAL ────────────────────────────────────────────────────────────
  const loadPortal = useCallback(async () => {
    setPortalLoading(true);
    try {
      const snap = await getDocs(collection(db, "quinielas"));
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setPortalData(list.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (e) { setPortalData([]); }
    setPortalLoading(false);
  }, []);

  useEffect(() => { if (screen === "portal") loadPortal(); }, [screen, loadPortal]);

  // ── HELPERS ────────────────────────────────────────────────────────────────
  const getMs = (g) => GRUPOS[g].partidos.map((_, i) => scores[g]?.[i] || { local: "", visita: "" });
  const setGol = (g, idx, lado, val) => {
    setScores(prev => {
      const arr = GRUPOS[g].partidos.map((_, i) => prev[g]?.[i] || { local: "", visita: "" });
      arr[idx] = { ...arr[idx], [lado]: val };
      return { ...prev, [g]: arr };
    });
  };
  const isDone = (g) => getMs(g).every(m => !isNaN(parseInt(m.local)) && m.local !== "" && !isNaN(parseInt(m.visita)) && m.visita !== "");

  const myQ = { scores, campeon, segundo, tercero, goleador: goleador === "Otro..." ? goleadorCustom : goleador };
  const { partidos: rellenados, total: totalP, extras: predCount, pct } = completionPct(myQ);
  const podioCompleto = campeon && segundo && tercero && (goleador || goleadorCustom);
  const gr = GRUPOS[grupo];
  const ms = getMs(grupo);
  const tabla = calcTabla(gr.equipos, gr.partidos, ms);
  const gIdx = KEYS.indexOf(grupo);

  // ══════════════════════════════════════════════════════════════════════════
  // SCREEN: LOGIN
  // ══════════════════════════════════════════════════════════════════════════
  if (screen === "login") return (
    <div style={{ minHeight: "100vh", background: "#07090d", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", padding: 20 }}>
      <div style={{ maxWidth: 340, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>⚽</div>
          <div style={{ fontSize: 9, letterSpacing: 5, color: "#b8942a", textTransform: "uppercase", marginBottom: 6 }}>Copa del Mundo 2026</div>
          <div style={{ fontSize: 26, fontWeight: "bold", color: "#fff", marginBottom: 4 }}>Quiniela Oficial</div>
          <div style={{ fontSize: 12, color: "#555" }}>Predice · Compite · Comparte</div>
        </div>

        <div style={{ background: "#0d1018", border: "1px solid #b8942a30", borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>¿Cómo te llamas?</div>
          <input
            autoFocus value={loginInput}
            onChange={e => setLoginInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="Tu nombre o alias..."
            style={{ width: "100%", background: "#ffffff08", border: "1px solid #ffffff20", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 8 }}
          />
          {loginError && <div style={{ fontSize: 11, color: "#f44336", marginBottom: 8 }}>{loginError}</div>}
          <button onClick={handleLogin} style={{ width: "100%", padding: 11, borderRadius: 9, border: "none", background: "linear-gradient(135deg,#b8942a,#d4a830)", color: "#000", fontWeight: "bold", fontSize: 14, cursor: "pointer" }}>
            Entrar a mi Quiniela →
          </button>
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button onClick={() => setScreen("portal")} style={{ background: "transparent", border: "none", color: "#555", fontSize: 11, cursor: "pointer", textDecoration: "underline" }}>
              👥 Ver quinielas de todos
            </button>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 10, color: "#333" }}>
          Si ya participaste antes, ingresa el mismo nombre para recuperar tu quiniela
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // SCREEN: PORTAL
  // ══════════════════════════════════════════════════════════════════════════
  if (screen === "portal") {
    if (selectedUser) {
      const q = selectedUser;
      const qc = completionPct(q);
      return (
        <div style={{ minHeight: "100vh", background: "#07090d", color: "#e0e0e0", fontFamily: "Georgia,serif" }}>
          <div style={{ background: "#0e1520", borderBottom: "2px solid #b8942a", padding: "12px 14px", position: "sticky", top: 0, zIndex: 100 }}>
            <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setSelectedUser(null)} style={{ background: "#ffffff10", border: "none", borderRadius: 8, padding: "6px 10px", color: "#ccc", cursor: "pointer", fontSize: 12 }}>← Volver</button>
              <div>
                <div style={{ fontSize: 9, color: "#b8942a", letterSpacing: 3 }}>QUINIELA DE</div>
                <div style={{ fontSize: 16, fontWeight: "bold" }}>{q.nombre}</div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div style={{ fontSize: 9, color: "#666" }}>Completado</div>
                <div style={{ fontSize: 14, fontWeight: "bold", color: qc.pct === 100 ? "#4caf50" : "#b8942a" }}>{qc.pct}%</div>
              </div>
            </div>
          </div>
          <div style={{ maxWidth: 560, margin: "0 auto", padding: "14px 12px 40px" }}>
            {/* Predicciones especiales */}
            <div style={{ background: "#111000", border: "1px solid #b8942a30", borderRadius: 12, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#b8942a", textTransform: "uppercase", marginBottom: 12 }}>Predicciones Especiales</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { icon: "🥇", label: "Campeón", val: q.campeon, color: "#b8942a" },
                  { icon: "🥈", label: "Subcampeón", val: q.segundo, color: "#888" },
                  { icon: "🥉", label: "3er Lugar", val: q.tercero, color: "#8b5a2b" },
                  { icon: "👟", label: "Bota de Oro", val: q.goleador === "Otro..." ? q.goleadorCustom : q.goleador, color: "#4caf50" },
                ].map(({ icon, label, val, color }) => (
                  <div key={label} style={{ background: val ? "#ffffff06" : "#ffffff03", border: `1px solid ${val ? color + "40" : "#ffffff0a"}`, borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 9, color: "#555", marginBottom: 4 }}>{icon} {label}</div>
                    <div style={{ fontSize: 12, fontWeight: "bold", color: val ? color : "#333" }}>{val || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Grupos */}
            {KEYS.map(g => {
              const gr2 = GRUPOS[g];
              const ms2 = GRUPOS[g].partidos.map((_, i) => (q.scores || {})[g]?.[i] || { local: "", visita: "" });
              const tab2 = calcTabla(gr2.equipos, gr2.partidos, ms2);
              const done = ms2.every(m => !isNaN(parseInt(m.local)) && m.local !== "" && !isNaN(parseInt(m.visita)) && m.visita !== "");
              return (
                <div key={g} style={{ background: done ? "#0c1018" : "#08090c", border: `1px solid ${done ? gr2.color + "50" : "#ffffff08"}`, borderRadius: 10, padding: "9px 13px", marginBottom: 7 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: done ? 8 : 0 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: done ? gr2.color : "#ffffff0d", color: done ? gr2.accent : "#555", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "900" }}>{g}</div>
                    <div style={{ fontSize: 10, color: "#777" }}>{gr2.equipos.map(e => e.split(" ").slice(1).join(" ")).join(" · ")}</div>
                    <span style={{ marginLeft: "auto", fontSize: 9, color: done ? "#4caf50" : "#555" }}>{done ? "✓" : "pendiente"}</span>
                  </div>
                  {done && (
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        {GRUPOS[g].partidos.map((p, i) => {
                          const m = ms2[i]; const gl = parseInt(m?.local), gv = parseInt(m?.visita); const ok = !isNaN(gl) && !isNaN(gv);
                          return (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0", borderBottom: "1px solid #ffffff06" }}>
                              <div style={{ flex: 1, fontSize: 10, textAlign: "right", color: ok && gl > gv ? "#fff" : "#888" }}>{p.local.split(" ").slice(0, 2).join(" ")}</div>
                              <div style={{ fontSize: 13, fontWeight: "bold", color: "#b8942a", minWidth: 36, textAlign: "center" }}>{ok ? `${gl}–${gv}` : "–"}</div>
                              <div style={{ flex: 1, fontSize: 10, color: ok && gv > gl ? "#fff" : "#888" }}>{p.visita.split(" ").slice(0, 2).join(" ")}</div>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        {tab2.map(([eq, st], i) => (
                          <div key={eq} style={{ flex: 1, textAlign: "center", background: i < 2 ? gr2.color + "30" : "#ffffff05", border: `1px solid ${i < 2 ? gr2.color + "50" : "#ffffff08"}`, borderRadius: 6, padding: "4px 2px" }}>
                            <div style={{ fontSize: 8, color: i < 2 ? gr2.accent : "#444", marginBottom: 1 }}>{i + 1}°</div>
                            <div style={{ fontSize: 9, color: i < 2 ? "#ddd" : "#444", fontWeight: i < 2 ? "bold" : "normal" }}>{eq.split(" ").slice(1).join(" ").substring(0, 7)}</div>
                            <div style={{ fontSize: 10, color: i < 2 ? gr2.accent : "#444", fontWeight: "bold" }}>{st.pts}pts</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div style={{ minHeight: "100vh", background: "#07090d", color: "#e0e0e0", fontFamily: "Georgia,serif" }}>
        <div style={{ background: "#0e1520", borderBottom: "2px solid #b8942a", padding: "12px 14px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setScreen(myId ? "quiniela" : "login")} style={{ background: "#ffffff10", border: "none", borderRadius: 8, padding: "6px 10px", color: "#ccc", cursor: "pointer", fontSize: 12 }}>← {myId ? "Mi quiniela" : "Inicio"}</button>
            <div>
              <div style={{ fontSize: 9, color: "#b8942a", letterSpacing: 3 }}>PORTAL</div>
              <div style={{ fontSize: 16, fontWeight: "bold" }}>Todas las Quinielas</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#666" }}>{portalData.length} participantes</span>
              <button onClick={loadPortal} style={{ background: "#ffffff10", border: "none", borderRadius: 6, padding: "5px 8px", color: "#aaa", cursor: "pointer", fontSize: 13 }}>{portalLoading ? "⏳" : "↻"}</button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 560, margin: "0 auto", padding: "14px 12px 40px" }}>
          {portalLoading && <div style={{ textAlign: "center", padding: 40, color: "#555" }}><div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>Cargando quinielas...</div>}

          {!portalLoading && portalData.length === 0 && (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏜️</div>
              <div style={{ fontSize: 14, color: "#555", marginBottom: 8 }}>Aún no hay quinielas guardadas</div>
              <button onClick={() => setScreen(myId ? "quiniela" : "login")} style={{ marginTop: 8, padding: "9px 20px", borderRadius: 9, border: "none", background: "#b8942a", color: "#000", fontWeight: "bold", fontSize: 13, cursor: "pointer" }}>
                {myId ? "Ir a mi quiniela" : "Crear quiniela"}
              </button>
            </div>
          )}

          {!portalLoading && portalData.length > 0 && (
            <>
              {/* Stats globales */}
              <div style={{ background: "#0d1018", border: "1px solid #b8942a25", borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "#b8942a", textTransform: "uppercase", marginBottom: 12 }}>Estadísticas del grupo</div>
                {(() => {
                  const cc = {}, gc = {};
                  portalData.forEach(q => {
                    if (q.campeon) cc[q.campeon] = (cc[q.campeon] || 0) + 1;
                    const g = q.goleador === "Otro..." ? q.goleadorCustom : q.goleador;
                    if (g) gc[g] = (gc[g] || 0) + 1;
                  });
                  const topC = Object.entries(cc).sort((a, b) => b[1] - a[1]).slice(0, 3);
                  const topG = Object.entries(gc).sort((a, b) => b[1] - a[1])[0];
                  return (
                    <div>
                      <div style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>🏆 Campeón más elegido</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                        {topC.map(([sel, n]) => (
                          <div key={sel} style={{ background: "#b8942a15", border: "1px solid #b8942a30", borderRadius: 8, padding: "5px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 13 }}>{sel.split(" ")[0]}</span>
                            <span style={{ fontSize: 11, color: "#b8942a", fontWeight: "bold" }}>{sel.split(" ").slice(1).join(" ")}</span>
                            <span style={{ fontSize: 10, color: "#555", background: "#ffffff10", borderRadius: 10, padding: "1px 5px" }}>{n}</span>
                          </div>
                        ))}
                      </div>
                      {topG && <div style={{ fontSize: 11, color: "#666" }}>👟 Goleador favorito: <span style={{ color: "#4caf50", fontWeight: "bold" }}>{topG[0]}</span> <span style={{ color: "#555" }}>({topG[1]} votos)</span></div>}
                    </div>
                  );
                })()}
              </div>

              <div style={{ fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 10 }}>Participantes ({portalData.length})</div>
              {portalData.map(q => {
                const qc = completionPct(q); const isMe = q.id === myId;
                return (
                  <div key={q.id} onClick={() => setSelectedUser(q)} style={{ background: isMe ? "#0d1a0a" : "#0c0f14", border: `1px solid ${isMe ? "#4caf5040" : "#ffffff10"}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: isMe ? "#4caf5020" : "#ffffff08", border: `1px solid ${isMe ? "#4caf5040" : "#ffffff10"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: "bold", color: isMe ? "#4caf50" : "#555", flexShrink: 0 }}>
                        {q.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: "bold", color: isMe ? "#4caf50" : "#ddd" }}>{q.nombre}</span>
                          {isMe && <span style={{ fontSize: 9, background: "#4caf5020", border: "1px solid #4caf50", color: "#4caf50", borderRadius: 10, padding: "1px 6px" }}>Tú</span>}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          {q.campeon && <span style={{ fontSize: 9, color: "#b8942a" }}>🏆 {q.campeon.split(" ").slice(1).join(" ")}</span>}
                          {(q.goleador && q.goleador !== "Otro...") && <span style={{ fontSize: 9, color: "#4caf50" }}>👟 {q.goleador}</span>}
                          {(q.goleador === "Otro..." && q.goleadorCustom) && <span style={{ fontSize: 9, color: "#4caf50" }}>👟 {q.goleadorCustom}</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: "bold", color: qc.pct === 100 ? "#4caf50" : qc.pct > 50 ? "#b8942a" : "#555" }}>{qc.pct}%</div>
                        <div style={{ fontSize: 9, color: "#444" }}>{qc.partidos}/{qc.total}</div>
                      </div>
                      <div style={{ color: "#333", fontSize: 16 }}>›</div>
                    </div>
                    <div style={{ height: 2, background: "#ffffff08", borderRadius: 1, overflow: "hidden", marginTop: 8 }}>
                      <div style={{ height: "100%", width: qc.pct + "%", background: qc.pct === 100 ? "#4caf50" : "linear-gradient(90deg,#b8942a,#d4a830)", transition: "width 0.3s" }} />
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SCREEN: QUINIELA
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight: "100vh", background: "#07090d", color: "#e0e0e0", fontFamily: "Georgia,serif" }}>
      {/* HEADER */}
      <div style={{ background: "linear-gradient(180deg,#0e1520,#0a1018)", borderBottom: "2px solid #b8942a", padding: "10px 14px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 8, letterSpacing: 4, color: "#b8942a" }}>COPA DEL MUNDO 2026</div>
              <div style={{ fontSize: 15, fontWeight: "bold" }}>⚽ {myNombre}</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 8, color: "#666" }}>GRUPOS</div>
                <div style={{ fontSize: 13, fontWeight: "bold", color: pct === 100 ? "#4caf50" : "#b8942a" }}>{rellenados}/{totalP}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 8, color: "#666" }}>EXTRAS</div>
                <div style={{ fontSize: 13, fontWeight: "bold", color: predCount === 4 ? "#4caf50" : "#b8942a" }}>{predCount}/4</div>
              </div>
            </div>
            <button onClick={() => setScreen("portal")} style={{ background: "#ffffff10", border: "1px solid #ffffff15", borderRadius: 8, padding: "6px 10px", color: "#aaa", cursor: "pointer", fontSize: 10, whiteSpace: "nowrap" }}>👥 Portal</button>
          </div>
          <div style={{ height: 3, background: "#ffffff10", borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
            <div style={{ height: "100%", width: pct + "%", background: pct === 100 ? "#4caf50" : "linear-gradient(90deg,#b8942a,#e8c050)", transition: "width 0.3s" }} />
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {[["partidos", "Grupos"], ["predicciones", "Predicciones"], ["resumen", "Resumen"]].map(([v, l]) => (
              <button key={v} onClick={() => setTab(v)} style={{ padding: "4px 9px", borderRadius: 6, border: "none", background: tab === v ? "#b8942a" : "#ffffff10", color: tab === v ? "#000" : "#999", fontSize: 10, cursor: "pointer", fontWeight: "bold" }}>{l}</button>
            ))}
            <button onClick={saveQuiniela} disabled={saving} style={{ marginLeft: "auto", padding: "4px 10px", borderRadius: 6, border: "none", background: saving ? "#333" : saveMsg.includes("✓") ? "#4caf50" : "#b8942a", color: saving ? "#666" : "#000", fontSize: 10, cursor: saving ? "not-allowed" : "pointer", fontWeight: "bold", flexShrink: 0 }}>
              {saving ? "Guardando..." : saveMsg || "💾 Guardar"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "12px 10px 56px" }}>

        {/* ═══ GRUPOS ═══ */}
        {tab === "partidos" && (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", marginBottom: 14 }}>
              {KEYS.map(g => {
                const done = isDone(g); const active = g === grupo;
                return <button key={g} onClick={() => setGrupo(g)} style={{ width: 34, height: 34, borderRadius: 7, fontSize: 12, fontWeight: "bold", border: active ? `2px solid ${GRUPOS[g].accent}` : "2px solid transparent", background: done ? (active ? GRUPOS[g].color : GRUPOS[g].color + "50") : active ? "#ffffff15" : "#ffffff08", color: done ? GRUPOS[g].accent : "#bbb", cursor: "pointer", transition: "all 0.2s" }}>{done && !active ? "✓" : g}</button>;
              })}
            </div>

            <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${gr.accent}20`, marginBottom: 12 }}>
              <div style={{ background: `linear-gradient(135deg,${gr.color},${gr.color}bb)`, padding: "11px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: `2px solid ${gr.accent}35` }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: gr.accent, color: gr.color || "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: "900" }}>{grupo}</div>
                <div><div style={{ fontSize: 15, fontWeight: "bold" }}>Grupo {grupo}</div><div style={{ fontSize: 10, color: "#ffffff70" }}>{gr.equipos.map(e => e.split(" ").slice(1).join(" ")).join(" · ")}</div></div>
                {isDone(grupo) && <div style={{ marginLeft: "auto", fontSize: 10, color: "#4caf50", background: "#4caf5020", border: "1px solid #4caf50", borderRadius: 20, padding: "2px 8px" }}>✓ Listo</div>}
              </div>
              <div style={{ background: "#0c0f14" }}>
                {[1, 2, 3].map(fecha => (
                  <div key={fecha}>
                    <div style={{ padding: "5px 14px", background: "#ffffff05", fontSize: 9, color: "#555", letterSpacing: 2, textTransform: "uppercase", borderTop: fecha > 1 ? "1px solid #ffffff08" : "none", borderBottom: "1px solid #ffffff08" }}>Jornada {fecha}</div>
                    {gr.partidos.filter(p => p.f === fecha).map(p => {
                      const idx = gr.partidos.indexOf(p); const m = ms[idx];
                      const gl = parseInt(m.local), gv = parseInt(m.visita);
                      const ok = !isNaN(gl) && !isNaN(gv) && m.local !== "" && m.visita !== "";
                      const wL = ok && gl > gv, wV = ok && gv > gl, emp = ok && gl === gv;
                      return (
                        <div key={idx} style={{ padding: "9px 14px", borderBottom: "1px solid #ffffff06", background: ok ? "#ffffff04" : "transparent" }}>
                          <div style={{ fontSize: 9, color: "#555", marginBottom: 5 }}>📅 {p.fecha}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ flex: 1, fontSize: 11, textAlign: "right", fontWeight: wL ? "bold" : "normal", color: wL ? "#fff" : ok ? "#aaa" : "#ccc" }}>{p.local}</div>
                            <input type="number" min="0" max="20" value={m.local} onChange={e => setGol(grupo, idx, "local", e.target.value)} style={{ width: 34, height: 32, textAlign: "center", background: ok ? "#13171f" : "#ffffff08", border: `1px solid ${ok ? gr.accent + "60" : "#ffffff18"}`, borderRadius: 6, color: ok ? gr.accent : "#777", fontSize: 15, fontWeight: "bold", outline: "none" }} />
                            <div style={{ width: 16, textAlign: "center", fontSize: 12, color: wL ? "#4caf50" : wV ? "#f44336" : emp ? "#ff9800" : "#444", fontWeight: "bold" }}>{ok ? (wL ? "▸" : wV ? "◂" : "=") : "·"}</div>
                            <input type="number" min="0" max="20" value={m.visita} onChange={e => setGol(grupo, idx, "visita", e.target.value)} style={{ width: 34, height: 32, textAlign: "center", background: ok ? "#13171f" : "#ffffff08", border: `1px solid ${ok ? "#ffffff30" : "#ffffff18"}`, borderRadius: 6, color: ok ? "#ddd" : "#777", fontSize: 15, fontWeight: "bold", outline: "none" }} />
                            <div style={{ flex: 1, fontSize: 11, fontWeight: wV ? "bold" : "normal", color: wV ? "#fff" : ok ? "#aaa" : "#ccc" }}>{p.visita}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div style={{ background: "#08090e", padding: "10px 14px", borderTop: "2px solid #ffffff0d" }}>
                <div style={{ fontSize: 8, letterSpacing: 2, color: "#444", textTransform: "uppercase", marginBottom: 7 }}>Clasificación proyectada</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                  <thead><tr>{["#", "Equipo", "PJ", "GF", "GC", "DIF", "PTS"].map(h => <th key={h} style={{ color: "#444", textAlign: h === "Equipo" ? "left" : "center", padding: "0 4px 4px", fontWeight: "normal" }}>{h}</th>)}</tr></thead>
                  <tbody>{tabla.map(([eq, st], i) => (
                    <tr key={eq} style={{ borderTop: "1px solid #ffffff06" }}>
                      <td style={{ padding: "4px", textAlign: "center" }}>{i < 2 ? <span style={{ background: gr.accent, color: gr.color || "#000", borderRadius: 4, padding: "1px 4px", fontSize: 9, fontWeight: "900" }}>{i + 1}</span> : <span style={{ color: "#333" }}>{i + 1}</span>}</td>
                      <td style={{ padding: "4px", color: i < 2 ? "#ddd" : "#555", fontWeight: i < 2 ? "bold" : "normal", fontSize: 11 }}>{eq.split(" ").slice(0, 2).join(" ")}</td>
                      {[st.jj, st.gf, st.gc, st.gf - st.gc, st.pts].map((v, vi) => <td key={vi} style={{ textAlign: "center", padding: "4px", color: vi === 4 ? (i < 2 ? gr.accent : "#333") : "#444", fontWeight: vi === 4 && i < 2 ? "bold" : "normal" }}>{v}</td>)}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button onClick={() => gIdx > 0 && setGrupo(KEYS[gIdx - 1])} disabled={gIdx === 0} style={{ flex: 1, padding: "8px", borderRadius: 9, border: "1px solid #ffffff12", background: gIdx === 0 ? "#ffffff04" : "#ffffff0e", color: gIdx === 0 ? "#333" : "#bbb", fontSize: 12, cursor: gIdx === 0 ? "not-allowed" : "pointer" }}>← Anterior</button>
              <button onClick={() => gIdx < KEYS.length - 1 && setGrupo(KEYS[gIdx + 1])} disabled={gIdx === KEYS.length - 1} style={{ flex: 1, padding: "8px", borderRadius: 9, border: "none", background: gIdx === KEYS.length - 1 ? "#ffffff04" : "#b8942a", color: gIdx === KEYS.length - 1 ? "#333" : "#000", fontSize: 12, fontWeight: "bold", cursor: gIdx === KEYS.length - 1 ? "not-allowed" : "pointer" }}>Siguiente →</button>
            </div>
          </>
        )}

        {/* ═══ PREDICCIONES ═══ */}
        {tab === "predicciones" && (
          <div>
            <div style={{ background: "linear-gradient(135deg,#1a1200,#2a1e00)", border: "1px solid #b8942a50", borderRadius: 14, padding: 16, marginBottom: 18, textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>🏆</div>
              <div style={{ fontSize: 16, fontWeight: "bold", color: "#b8942a", marginBottom: 4 }}>Predicciones Especiales</div>
              <div style={{ fontSize: 11, color: "#777" }}>Elige el podio del Mundial y al máximo goleador</div>
              <div style={{ marginTop: 8, display: "flex", justifyContent: "center", gap: 8 }}>
                {[campeon, segundo, tercero, goleador || goleadorCustom].map((v, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: v ? "#b8942a" : "#333" }} />
                ))}
              </div>
            </div>

            {(campeon || segundo || tercero) && (
              <div style={{ marginBottom: 18, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 6, height: 110 }}>
                {[{ place: 2, val: segundo, h: 70, bg: "linear-gradient(180deg,#8a8a8a,#555)", border: "#888", medal: "🥈" }, { place: 1, val: campeon, h: 90, bg: "linear-gradient(180deg,#b8942a,#7a5e1a)", border: "#b8942a", medal: "🥇" }, { place: 3, val: tercero, h: 55, bg: "linear-gradient(180deg,#8b5a2b,#5c3a1a)", border: "#8b5a2b", medal: "🥉" }].map(({ place, val, h, bg, border, medal }) => (
                  <div key={place} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {val && <div style={{ fontSize: 10, color: place === 1 ? "#b8942a" : "#aaa", marginBottom: 4, textAlign: "center", fontWeight: place === 1 ? "bold" : "normal" }}>{val.split(" ").slice(1).join(" ")}</div>}
                    <div style={{ width: "100%", height: h, background: bg, borderRadius: "8px 8px 0 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `1px solid ${border}`, boxShadow: place === 1 ? "0 0 20px #b8942a40" : "none" }}>
                      <div style={{ fontSize: place === 1 ? 26 : 20 }}>{medal}</div>
                      {val && <div style={{ fontSize: place === 1 ? 16 : 13 }}>{val.split(" ")[0]}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {[
              { icon: "🥇", label: "Campeón del Mundo", sub: "¿Quién levantará la copa el 19 de julio?", val: campeon, set: v => { setCampeon(v); if (segundo === v) setSegundo(""); if (tercero === v) setTercero(""); }, color: "#b8942a", exclude: [] },
              { icon: "🥈", label: "Subcampeón", sub: "Finalista perdedor", val: segundo, set: v => { setSegundo(v); if (tercero === v) setTercero(""); }, color: "#888", exclude: [campeon] },
              { icon: "🥉", label: "Tercer Lugar", sub: "Ganador del partido por el bronce", val: tercero, set: setTercero, color: "#8b5a2b", exclude: [campeon, segundo] },
            ].map(({ icon, label, sub, val, set, color, exclude }) => (
              <div key={label} style={{ background: "#0d1018", border: `1px solid ${color}25`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <div><div style={{ fontSize: 13, fontWeight: "bold", color }}>{label}</div><div style={{ fontSize: 10, color: "#666" }}>{sub}</div></div>
                  {val && <div style={{ marginLeft: "auto", fontSize: 16 }}>{val.split(" ")[0]}</div>}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {SELECCIONES.filter(s => !exclude.includes(s)).map(s => (
                    <button key={s} onClick={() => set(s === val ? "" : s)} style={{ padding: "5px 10px", borderRadius: 18, fontSize: 11, border: `1px solid ${val === s ? color : "#ffffff15"}`, background: val === s ? color + "25" : "#ffffff06", color: val === s ? color : "#999", cursor: "pointer", fontWeight: val === s ? "bold" : "normal", transition: "all 0.15s" }}>{s}</button>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ background: "#0d1018", border: "1px solid #4caf5030", borderRadius: 12, padding: 14, marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>👟</span>
                <div><div style={{ fontSize: 13, fontWeight: "bold", color: "#4caf50" }}>Bota de Oro</div><div style={{ fontSize: 10, color: "#666" }}>Máximo goleador del torneo</div></div>
                {goleador && goleador !== "Otro..." && <div style={{ marginLeft: "auto", fontSize: 11, color: "#4caf50", fontWeight: "bold" }}>{GOLEADORES.find(g => g.nombre === goleador)?.sel} {goleador}</div>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {GOLEADORES.map(g => (
                  <button key={g.nombre} onClick={() => setGoleador(g.nombre === goleador ? "" : g.nombre)} style={{ padding: "7px 10px", borderRadius: 8, textAlign: "left", border: `1px solid ${goleador === g.nombre ? "#4caf50" : "#ffffff12"}`, background: goleador === g.nombre ? "#4caf5015" : "#ffffff05", color: goleador === g.nombre ? "#4caf50" : "#999", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{g.sel}</span>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: goleador === g.nombre ? "bold" : "normal" }}>{g.nombre}</div>{g.club && <div style={{ fontSize: 9, color: "#555" }}>{g.club}</div>}</div>
                    {goleador === g.nombre && <span style={{ fontSize: 12 }}>✓</span>}
                  </button>
                ))}
              </div>
              {goleador === "Otro..." && (
                <input type="text" placeholder="Nombre del jugador..." value={goleadorCustom} onChange={e => setGoleadorCustom(e.target.value)} style={{ width: "100%", background: "#ffffff08", border: "1px solid #4caf5040", borderRadius: 8, padding: "8px 12px", color: "#eee", fontSize: 13, outline: "none", boxSizing: "border-box", marginTop: 10 }} />
              )}
            </div>

            {podioCompleto && (
              <div style={{ background: "#0a1f0a", border: "1px solid #4caf50", borderRadius: 12, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 18, marginBottom: 6 }}>🎉</div>
                <div style={{ fontSize: 13, fontWeight: "bold", color: "#4caf50", marginBottom: 8 }}>¡Predicciones completas!</div>
                <button onClick={saveQuiniela} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#b8942a", color: "#000", fontWeight: "bold", fontSize: 13, cursor: "pointer", marginRight: 8 }}>💾 Guardar</button>
                <button onClick={() => setTab("resumen")} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #ffffff20", background: "transparent", color: "#aaa", fontSize: 12, cursor: "pointer" }}>Ver resumen →</button>
              </div>
            )}
          </div>
        )}

        {/* ═══ RESUMEN ═══ */}
        {tab === "resumen" && (
          <div>
            <div style={{ background: "#0d1320", border: "1px solid #b8942a30", borderRadius: 12, padding: "13px 14px", marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 6 }}>🎯 {myNombre}</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 10, background: rellenados === totalP ? "#4caf5020" : "#ffffff0a", border: `1px solid ${rellenados === totalP ? "#4caf50" : "#ffffff15"}`, color: rellenados === totalP ? "#4caf50" : "#666", borderRadius: 20, padding: "2px 8px" }}>{rellenados === totalP ? "✓" : "·"} Grupos {rellenados}/{totalP}</span>
                <span style={{ fontSize: 10, background: podioCompleto ? "#4caf5020" : "#ffffff0a", border: `1px solid ${podioCompleto ? "#4caf50" : "#ffffff15"}`, color: podioCompleto ? "#4caf50" : "#666", borderRadius: 20, padding: "2px 8px" }}>{podioCompleto ? "✓" : "·"} Predicciones {predCount}/4</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={saveQuiniela} disabled={saving} style={{ flex: 1, padding: "9px", borderRadius: 9, border: "none", background: saving ? "#333" : "#b8942a", color: saving ? "#666" : "#000", fontWeight: "bold", fontSize: 12, cursor: saving ? "not-allowed" : "pointer" }}>{saving ? "Guardando..." : saveMsg || "💾 Guardar quiniela"}</button>
                <button onClick={() => setScreen("portal")} style={{ flex: 1, padding: "9px", borderRadius: 9, border: "1px solid #ffffff15", background: "#ffffff08", color: "#aaa", fontSize: 12, cursor: "pointer" }}>👥 Ver portal</button>
              </div>
            </div>

            {(campeon || segundo || tercero || goleador || goleadorCustom) && (
              <div style={{ background: "#111000", border: "1px solid #b8942a30", borderRadius: 12, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "#b8942a", textTransform: "uppercase", marginBottom: 12 }}>Predicciones Especiales</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[{ icon: "🥇", label: "Campeón", val: campeon, color: "#b8942a" }, { icon: "🥈", label: "Subcampeón", val: segundo, color: "#888" }, { icon: "🥉", label: "3er Lugar", val: tercero, color: "#8b5a2b" }, { icon: "👟", label: "Bota de Oro", val: goleador === "Otro..." ? goleadorCustom : goleador, color: "#4caf50" }].map(({ icon, label, val, color }) => (
                    <div key={label} style={{ background: val ? "#ffffff06" : "#ffffff03", border: `1px solid ${val ? color + "40" : "#ffffff0a"}`, borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ fontSize: 9, color: "#555", marginBottom: 4 }}>{icon} {label}</div>
                      <div style={{ fontSize: 12, fontWeight: "bold", color: val ? color : "#333" }}>{val || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {KEYS.map(g => {
              const gr2 = GRUPOS[g]; const ms2 = getMs(g);
              const tab2 = calcTabla(gr2.equipos, gr2.partidos, ms2);
              const done = isDone(g);
              const filled = ms2.filter(m => !isNaN(parseInt(m.local)) && m.local !== "").length;
              return (
                <div key={g} onClick={() => { setGrupo(g); setTab("partidos"); }} style={{ background: done ? "#0c1018" : "#08090c", border: `1px solid ${done ? gr2.color + "50" : "#ffffff08"}`, borderRadius: 10, padding: "9px 13px", marginBottom: 7, cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: done ? 8 : 0 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: done ? gr2.color : "#ffffff0d", color: done ? gr2.accent : "#555", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "900" }}>{g}</div>
                    <div style={{ fontSize: 10, color: "#777" }}>{gr2.equipos.map(e => e.split(" ").slice(1).join(" ")).join(" · ")}</div>
                    <span style={{ marginLeft: "auto", fontSize: 9, color: done ? "#4caf50" : "#555" }}>{done ? "✓" : `${filled}/${gr2.partidos.length}`}</span>
                  </div>
                  {done && (
                    <div style={{ display: "flex", gap: 4 }}>
                      {tab2.map(([eq, st], i) => (
                        <div key={eq} style={{ flex: 1, textAlign: "center", background: i < 2 ? gr2.color + "30" : "#ffffff05", border: `1px solid ${i < 2 ? gr2.color + "50" : "#ffffff08"}`, borderRadius: 6, padding: "4px 2px" }}>
                          <div style={{ fontSize: 8, color: i < 2 ? gr2.accent : "#444", marginBottom: 1 }}>{i + 1}°</div>
                          <div style={{ fontSize: 9, color: i < 2 ? "#ddd" : "#444", fontWeight: i < 2 ? "bold" : "normal" }}>{eq.split(" ").slice(1).join(" ").substring(0, 7)}</div>
                          <div style={{ fontSize: 10, color: i < 2 ? gr2.accent : "#444", fontWeight: "bold" }}>{st.pts}pts</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
