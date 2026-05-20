import { useState, useEffect, useCallback } from "react";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { GRUPOS, KEYS, SELECCIONES, GOLEADORES, calcTabla, completionPct, buildBracket } from "./data";
import { calcTotalPoints } from "./scoring";
import Admin from "./Admin";

// ─── BRAND ───────────────────────────────────────────────────────────────────
const B = {
  // Clean white + Mundial 2026 accent colors
  primary:   "#3a5bd9",   // azul vibrante (del banner)
  primary2:  "#2a4bc9",   // azul oscuro
  primaryDim:"#3a5bd915",
  green:     "#00c853",   // verde MundoFutbol
  purple:    "#7c3aed",   // lila/violeta
  red:       "#e63946",   // rojo vibrante
  orange:    "#f77f00",   // naranja
  yellow:    "#fee440",   // amarillo
  rainbow:   "linear-gradient(90deg,#3a5bd9,#7c3aed,#e63946,#f77f00,#00c853)",
  // Backgrounds - white theme
  bg:        "#f5f5f7",   // gris muy claro (Apple-style)
  card:      "#111111",   // blanco puro
  cardAlt:   "#f0f0f5",   // gris muy suave
  border:    "#e0e0e8",
  borderStrong: "#c0c0cc",
  // Text - dark
  text:      "#111111",   // negro
  textSub:   "#444455",   // gris oscuro
  muted:     "#888899",   // gris medio
  logoMF:    "/logo-mf.png",
  logoKOTO:   "/KOTO.png",
  logoMundial:"/logo-mundial.png",
};

// ─── KNOCKOUT STRUCTURE ───────────────────────────────────────────────────────
// 48 teams → 32 pass from groups (24 group winners/runners-up + 8 best 3rd)
// R32 = 32 teams, 16 matches
// R16 = 16 teams, 8 matches
// QF  = 8 teams, 4 matches
// SF  = 4 teams, 2 matches
// Final + 3rd place = 2 matches

const RONDAS = [
  { id:"r32",  label:"Dieciseisavos", short:"1/16", emoji:"⚔️",  partidos:16, color:"#4a7a9b" },
  { id:"r16",  label:"Octavos",       short:"1/8",  emoji:"🔥",  partidos:8,  color:"#7a4a9b" },
  { id:"qf",   label:"Cuartos",       short:"1/4",  emoji:"⭐",  partidos:4,  color:"#9b7a4a" },
  { id:"sf",   label:"Semifinales",   short:"1/2",  emoji:"🌟",  partidos:2,  color:"#9b4a4a" },
  { id:"final",label:"Final",         short:"FINAL",emoji:"🏆",  partidos:1,  color:"#3a5bd9" },
  { id:"third",label:"3er Puesto",    short:"3°",   emoji:"🥉",  partidos:1,  color:"#a07040" },
];

// Initial empty bracket — local and visita are filled by user as text
function emptyKnockout() {
  const k = {};
  RONDAS.forEach(r => {
    k[r.id] = Array.from({ length: r.partidos }, (_, i) => ({
      id: i,
      local: "", localGoles: "",
      visita: "", visitaGoles: "",
      ganador: "",
      penaltis: false, penaltisGanador: "",
    }));
  });
  return k;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function Logos({ size = 40, center = false }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:center?"center":"flex-start" }}>
      <img src={B.logoMF} alt="MundoFutbol" style={{ height:size, objectFit:"contain", filter:"brightness(0) invert(1)" }} onError={e=>{ e.target.style.display="none"; }} />
      <img src={B.logoKOTO} alt="KOTO" style={{ height:size*0.85, objectFit:"contain", filter:"brightness(0) invert(1)" }} onError={e=>{ e.target.style.display="none"; }} />
      <div style={{ width:1, height:size*0.7, background:"#ffffff40" }} />
      <img src={B.logoMundial} alt="FIFA 2026" style={{ height:size*0.85, objectFit:"contain" }} onError={e=>{ e.target.style.display="none"; }} />
    </div>
  );
}



// ─── KNOCKOUT MATCH CARD ──────────────────────────────────────────────────────
function MatchCard({ match, idx, rondaColor, onChange, autoFilled=false }) {
  const { local, localGoles, visita, visitaGoles, ganador, penaltis, penaltisGanador } = match;
  const hasTeams = local && visita;
  const gl = parseInt(localGoles), gv = parseInt(visitaGoles);
  const hasScore = hasTeams && !isNaN(gl) && !isNaN(gv) && localGoles!=="" && visitaGoles!=="";
  const empate = hasScore && gl === gv;

  const upd = (field, val) => onChange(idx, { ...match, [field]: val });

  return (
    <div style={{
      background: "#ffffff", border:`1px solid ${ganador ? rondaColor+"80" : "#e0e0e8"}`,
      borderRadius:12, padding:"10px 12px", marginBottom:8,
      boxShadow: ganador ? `0 0 10px ${rondaColor}18` : "none",
    }}>
      <div style={{ fontSize:9, color:B.muted, marginBottom:7, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span>
          {match.num
            ? <><span style={{color:"#3a5bd9",fontWeight:"800"}}>{match.num}</span>{match.fecha && <span style={{color:"#bbb",fontWeight:"normal"}}> · {match.fecha}</span>}{match.sede && <span style={{color:"#aaa",fontWeight:"normal"}}> · 📍{match.sede}</span>}</>
            : `Partido ${idx+1}`
          }
        </span>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          {autoFilled && <span style={{fontSize:8,background:"#eeeefc",border:"1px solid #00cc0030",color:"#3a5bd9",borderRadius:10,padding:"1px 6px"}}>⚡ Auto</span>}
          {ganador && <span style={{ color:rondaColor, fontWeight:"bold" }}>✓ {ganador.split(" ").slice(0,2).join(" ")}</span>}
        </div>
      </div>

      {/* Equipo local */}
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
        {autoFilled && local ? (
          <div style={{flex:1,background:"#f0f4ff",border:`1px solid ${ganador===local?"#3a5bd9":"#c8d8ff"}`,borderRadius:6,padding:"6px 8px",color:ganador===local?B.primary:"#7070b8",fontSize:11,fontWeight:ganador===local?"bold":"normal"}}>
            {local}
          </div>
        ) : (
        <input
          value={local}
          onChange={e=>upd("local", e.target.value)}
          placeholder="Equipo local..."
          style={{ flex:1, background:"#f8f8f8", border:`1px solid ${ganador===local&&local?"#3a5bd9":"#e0e0e8"}`, borderRadius:6, padding:"7px 10px", color:ganador===local&&local?"#3a5bd9":"#111", fontSize:11, outline:"none", fontWeight:ganador===local&&local?"bold":"normal" }}
        />
        )}
        <input
          type="number" min="0" max="20"
          value={localGoles}
          onChange={e=>upd("localGoles", e.target.value)}
          style={{ width:38, height:36, textAlign:"center", background:"#f5f5f7", border:`2px solid ${hasScore?rondaColor:"#e0e0e8"}`, borderRadius:8, color:hasScore?rondaColor:"#bbb", fontSize:15, fontWeight:"bold", outline:"none" }}
        />
      </div>

      {/* Equipo visitante */}
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom: empate ? 8 : 0 }}>
        {autoFilled && visita ? (
          <div style={{flex:1,background:"#f0f4ff",border:`1px solid ${ganador===visita?"#3a5bd9":"#c8d8ff"}`,borderRadius:6,padding:"6px 8px",color:ganador===visita?B.primary:"#7070b8",fontSize:11,fontWeight:ganador===visita?"bold":"normal"}}>
            {visita}
          </div>
        ) : (
        <input
          value={visita}
          onChange={e=>upd("visita", e.target.value)}
          placeholder="Equipo visitante..."
          style={{ flex:1, background:"#f8f8f8", border:`1px solid ${ganador===visita&&visita?"#3a5bd9":"#e0e0e8"}`, borderRadius:6, padding:"7px 10px", color:ganador===visita&&visita?"#3a5bd9":"#111", fontSize:11, outline:"none", fontWeight:ganador===visita&&visita?"bold":"normal" }}
        />
        )}
        <input
          type="number" min="0" max="20"
          value={visitaGoles}
          onChange={e=>upd("visitaGoles", e.target.value)}
          style={{ width:38, height:36, textAlign:"center", background:"#f5f5f7", border:`2px solid ${hasScore?rondaColor:"#e0e0e8"}`, borderRadius:8, color:hasScore?"#111":"#bbb", fontSize:15, fontWeight:"bold", outline:"none" }}
        />
      </div>

      {/* Penaltis si hay empate */}
      {empate && (
        <div style={{ marginTop:8, padding:"6px 8px", background:"#00000006", borderRadius:8, border:"1px solid #ffffff10" }}>
          <div style={{ fontSize:9, color:B.muted, marginBottom:5 }}>🥅 Penaltis — ¿Quién avanza?</div>
          <div style={{ display:"flex", gap:6 }}>
            {[local, visita].filter(Boolean).map(eq=>(
              <button key={eq} onClick={()=>{ upd("penaltis",true); upd("penaltisGanador",eq); upd("ganador",eq); }}
                style={{ flex:1, padding:"5px 8px", borderRadius:7, border:`1px solid ${penaltisGanador===eq?"#3a5bd9":"#00000015"}`, background:penaltisGanador===eq?"#eff4ff":"#f8f8fc", color:penaltisGanador===eq?"#3a5bd9":"#666", fontSize:11, cursor:"pointer", fontWeight:penaltisGanador===eq?"bold":"normal" }}>
                {eq.split(" ").slice(0,2).join(" ")}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Botones ganador si no hay empate */}
      {hasScore && !empate && (
        <div style={{ marginTop:8 }}>
          <div style={{ fontSize:9, color:B.muted, marginBottom:5 }}>Ganador:</div>
          <div style={{ display:"flex", gap:6 }}>
            {[{eq:local,wins:gl>gv},{eq:visita,wins:gv>gl}].filter(x=>x.eq).map(({eq,wins})=>(
              <button key={eq} onClick={()=>upd("ganador",eq)}
                style={{ flex:1, padding:"5px 8px", borderRadius:7, border:`1px solid ${ganador===eq?rondaColor:"#00000012"}`, background:ganador===eq?rondaColor+"20":"#f8f8fc", color:ganador===eq?rondaColor:B.muted, fontSize:10, cursor:"pointer", fontWeight:ganador===eq?"bold":"normal" }}>
                {wins?"⚽ ":""}{eq.split(" ").slice(0,2).join(" ")}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── KNOCKOUT TAB ─────────────────────────────────────────────────────────────
function KnockoutTab({ knockout, setKnockout, scores }) {
  const [rondaActiva, setRondaActiva] = useState("r32");
  const ronda = RONDAS.find(r=>r.id===rondaActiva);

  const updateMatch = (rondaId, idx, newMatch) => {
    setKnockout(prev => {
      const arr = [...(prev[rondaId]||[])];
      arr[idx] = newMatch;
      const updated = { ...prev, [rondaId]: arr };
      // If a winner was set, propagate to next round
      if (newMatch.ganador) {
        try { return buildBracket(scores||{}, updated); } catch(e) { return updated; }
      }
      return updated;
    });
  };

  const matches = knockout[rondaActiva] || Array.from({length:ronda.partidos},(_,i)=>({ id:i, local:"", localGoles:"", visita:"", visitaGoles:"", ganador:"", penaltis:false, penaltisGanador:"" }));

  const completedInRound = matches.filter(m=>m.ganador).length;
  const isFinal = rondaActiva === "final";
  const isThird = rondaActiva === "third";

  return (
    <div>
      {/* Bracket visual de rondas */}
      <div style={{ overflowX:"auto", marginBottom:16 }}>
        <div style={{ display:"flex", gap:4, minWidth:"max-content", padding:"0 2px" }}>
          {RONDAS.map(r=>{
            const ko = knockout[r.id]||[];
            const done = ko.filter(m=>m.ganador).length;
            const active = r.id===rondaActiva;
            return (
              <button key={r.id} onClick={()=>setRondaActiva(r.id)} style={{
                padding:"6px 10px", borderRadius:8, border:`2px solid ${active?r.color:"transparent"}`,
                background:active?r.color+"22":"#00000008",
                color:active?r.color:done===r.partidos?"#3a5bd9":B.muted,
                fontSize:10, cursor:"pointer", fontWeight:"bold", whiteSpace:"nowrap",
                boxShadow:active?`0 0 10px ${r.color}30`:"none",
              }}>
                <div style={{ fontSize:14 }}>{r.emoji}</div>
                <div>{r.short}</div>
                <div style={{ fontSize:8, marginTop:2, color:active?r.color:B.muted }}>{done}/{r.partidos}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Header de ronda */}
      <div style={{ background:`linear-gradient(135deg,${ronda.color}22,${ronda.color}10)`, border:`1px solid ${ronda.color}40`, borderRadius:12, padding:"12px 14px", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ fontSize:28 }}>{ronda.emoji}</div>
          <div>
            <div style={{ fontSize:16, fontWeight:"bold", color:ronda.color }}>{ronda.label}</div>
            <div style={{ fontSize:10, color:B.muted }}>
              {completedInRound}/{ronda.partidos} partidos predichos
              {ronda.info && <span style={{color:ronda.color}}> · {ronda.info}</span>}
            </div>
          </div>
          {completedInRound===ronda.partidos && (
            <div style={{ marginLeft:"auto", fontSize:10, color:"#3a5bd9", background:"#eeeefc", border:"1px solid #4caf50", borderRadius:20, padding:"2px 8px" }}>✓ Completo</div>
          )}
        </div>
        {/* Mini progress */}
        <div style={{ height:3, background:"#00000008", borderRadius:2, overflow:"hidden", marginTop:10 }}>
          <div style={{ height:"100%", width:`${(completedInRound/ronda.partidos)*100}%`, background:ronda.color, transition:"width 0.3s", boxShadow:`0 0 6px ${ronda.color}80` }}/>
        </div>
      </div>

      {/* Instrucción especial r32 */}
      {rondaActiva==="r32" && (
        <div style={{ background:"#00000008", border:"1px solid #ffffff10", borderRadius:10, padding:"9px 12px", marginBottom:12, fontSize:11, color:B.muted, lineHeight:1.5 }}>
          💡 Escribe el nombre de los equipos que crees que pasan a cada partido de dieciseisavos. Los cruces oficiales se conocerán al terminar la fase de grupos.
        </div>
      )}

      {/* Partidos */}
      <div style={{ display: ronda.partidos > 2 ? "grid" : "block", gridTemplateColumns: ronda.partidos >= 4 ? "1fr 1fr" : "1fr", gap:8 }}>
        {matches.map((match, i) => (
          <MatchCard
            key={i} match={match} idx={i}
            rondaColor={ronda.color}
            onChange={(idx, newMatch) => updateMatch(rondaActiva, idx, newMatch)}
          />
        ))}
      </div>

      {/* Bracket de ganadores si hay avance */}
      {completedInRound > 0 && !isFinal && !isThird && (
        <div style={{ marginTop:14, background:"#f5f5f7", border:`1px solid ${ronda.color}30`, borderRadius:12, padding:"10px 14px" }}>
          <div style={{ fontSize:9, color:ronda.color, letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>
            Clasificados → {RONDAS[RONDAS.indexOf(ronda)+1]?.label}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            {matches.filter(m=>m.ganador).map((m,i)=>(
              <div key={i} style={{ padding:"4px 10px", borderRadius:20, background:ronda.color+"18", border:`1px solid ${ronda.color}40`, fontSize:11, color:ronda.color, fontWeight:"bold" }}>
                {m.ganador.split(" ").slice(0,2).join(" ")}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campeón si es final */}
      {isFinal && matches[0]?.ganador && (
        <div style={{ marginTop:14, background:"linear-gradient(135deg,#eff4ff,#e8f0ff)", border:"2px solid #3a5bd9", borderRadius:14, padding:"16px", textAlign:"center", boxShadow:"0 4px 20px rgba(58,91,217,0.15)" }}>
          <div style={{ fontSize:36, marginBottom:6 }}>🏆</div>
          <div style={{ fontSize:12, color:B.muted, marginBottom:4 }}>¡CAMPEÓN DEL MUNDO 2026!</div>
          <div style={{ fontSize:20, fontWeight:"bold", color:B.primary }}>{matches[0].ganador}</div>
        </div>
      )}

      {/* Navegación entre rondas */}
      <div style={{ display:"flex", gap:8, marginTop:14 }}>
        {RONDAS.indexOf(ronda) > 0 && (
          <button onClick={()=>setRondaActiva(RONDAS[RONDAS.indexOf(ronda)-1].id)} style={{ flex:1, padding:8, borderRadius:9, border:"1px solid #0a1a0a", background:"#f0f0f8", color:B.muted, fontSize:12, cursor:"pointer" }}>
            ← {RONDAS[RONDAS.indexOf(ronda)-1].label}
          </button>
        )}
        {RONDAS.indexOf(ronda) < RONDAS.length-1 && (
          <button onClick={()=>setRondaActiva(RONDAS[RONDAS.indexOf(ronda)+1].id)} style={{ flex:1, padding:8, borderRadius:9, border:"none", background:ronda.color, color:"#ffffff", fontSize:12, fontWeight:"bold", cursor:"pointer" }}>
            {RONDAS[RONDAS.indexOf(ronda)+1].label} →
          </button>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,setScreen]=useState("login");
  const [myId,setMyId]=useState(""); const [myNombre,setMyNombre]=useState("");
  const [loginInput,setLoginInput]=useState(""); const [loginError,setLoginError]=useState("");
  const [codigoInput,setCodigoInput]=useState("");
  const [emailInput,setEmailInput]=useState("");
  const [saving,setSaving]=useState(false); const [saveMsg,setSaveMsg]=useState("");
  const [portalData,setPortalData]=useState([]); const [portalLoading,setPortalLoading]=useState(false);
  const [selectedUser,setSelectedUser]=useState(null);
  const [resultadosOficiales,setResultadosOficiales]=useState({});

  const [scores,setScores]=useState({});
  const [campeon,setCampeon]=useState(""); const [segundo,setSegundo]=useState("");
  const [tercero,setTercero]=useState(""); const [goleador,setGoleador]=useState("");
  const [goleadorCustom,setGoleadorCustom]=useState("");
  const [knockout,setKnockout]=useState(emptyKnockout());

  const [tab,setTab]=useState("partidos"); const [grupo,setGrupo]=useState("A");

  // Auto-rebuild knockout bracket whenever scores change
  useEffect(() => {
    try { const newKO = buildBracket(scores, knockout); setKnockout(newKO); } catch(e) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scores]);

  // ── Auth / Save / Load ────────────────────────────────────────────────────
  const handleLogin=async()=>{
    const name=loginInput.trim();
    if(!name||name.length<2){setLoginError("Escribe tu nombre (mínimo 2 caracteres)");return;}
    if(!codigoInput.trim()){setLoginError("Ingresa el código de acceso");return;}
    // Verify access code against Firestore admin/config
    try{
      const cfgSnap=await getDoc(doc(db,"admin","config"));
      if(cfgSnap.exists()){
        const cfg=cfgSnap.data();
        if(cfg.codigoAcceso && codigoInput.trim()!==cfg.codigoAcceso){
          setLoginError("Código de acceso incorrecto ❌");
          return;
        }
      }
      // If no config set yet, any code works (organizer hasn't set one)
    }catch(e){
      // If can't reach Firestore, let through (offline fallback)
    }
    const id=name.toLowerCase().replace(/[^a-z0-9]/gi,"_").substring(0,24);
    setMyId(id); setMyNombre(name);
    try{
      const snap=await getDoc(doc(db,"quinielas",id));
      if(snap.exists()){
        const d=snap.data();
        setScores(d.scores||{}); setCampeon(d.campeon||""); setSegundo(d.segundo||"");
        setTercero(d.tercero||""); setGoleador(d.goleador||""); setGoleadorCustom(d.goleadorCustom||"");
        setKnockout(d.knockout||emptyKnockout());
        setEmailInput(d.email||"");
      }
    }catch(e){}
    setLoginError(""); setScreen("quiniela");
  };

  const saveQuiniela=async()=>{
    setSaving(true); setSaveMsg("");
    try{
      await setDoc(doc(db,"quinielas",myId),{
        nombre:myNombre, email:emailInput.trim(), scores, campeon, segundo, tercero,
        goleador, goleadorCustom, knockout, updatedAt:Date.now(),
      });
      setSaveMsg("¡Guardado! ✓");
    }catch(e){setSaveMsg("Error ✗");}
    setSaving(false); setTimeout(()=>setSaveMsg(""),3000);
  };

  const loadPortal=useCallback(async()=>{
    setPortalLoading(true);
    try{
      const snap=await getDocs(collection(db,"quinielas"));
      const list=[]; snap.forEach(d=>list.push({id:d.id,...d.data()}));
      setPortalData(list.sort((a,b)=>b.updatedAt-a.updatedAt));
      // Load official results for scoring
      const rSnap=await getDoc(doc(db,"admin","resultados"));
      if(rSnap.exists()) setResultadosOficiales(rSnap.data());
    }catch(e){setPortalData([]);}
    setPortalLoading(false);
  },[]);

  useEffect(()=>{if(screen==="portal")loadPortal();},[screen,loadPortal]);

  // ── Grupo helpers ─────────────────────────────────────────────────────────
  const getMs=(g)=>GRUPOS[g].partidos.map((_,i)=>scores[g]?.[i]||{local:"",visita:""});
  const setGol=(g,idx,lado,val)=>{setScores(prev=>{const arr=GRUPOS[g].partidos.map((_,i)=>prev[g]?.[i]||{local:"",visita:""});arr[idx]={...arr[idx],[lado]:val};return{...prev,[g]:arr};});};
  const isDone=(g)=>getMs(g).every(m=>!isNaN(parseInt(m.local))&&m.local!==""&&!isNaN(parseInt(m.visita))&&m.visita!=="");

  const myQ={scores,campeon,segundo,tercero,goleador:goleador==="Otro..."?goleadorCustom:goleador,knockout};
  const {partidos:rellenados,total:totalP,extras:predCount,pct,koFilled,koTotal}=completionPct(myQ);
  const podioCompleto=campeon&&segundo&&tercero&&(goleador||goleadorCustom);
  const gr=GRUPOS[grupo]; const ms=getMs(grupo);
  const tabla=calcTabla(gr.equipos,gr.partidos,ms);
  const gIdx=KEYS.indexOf(grupo);

  // shared styles
  const tagStyle=(on,color)=>({fontSize:10,background:on?color+"18":"#00000006",border:`1px solid ${on?color:"#00000010"}`,color:on?color:"#888",borderRadius:20,padding:"2px 8px"});
  const btnStyle=(active,color)=>({padding:"5px 10px",borderRadius:18,fontSize:11,border:`1px solid ${active?color:"#00000010"}`,background:active?color+"20":"#00000006",color:active?color:B.muted,cursor:"pointer",fontWeight:active?"bold":"normal",transition:"all 0.15s"});

  // ── TABS config ───────────────────────────────────────────────────────────
  const TABS=[
    {id:"partidos",label:"Grupos"},
    {id:"knockout",label:"Eliminatorias"},
    {id:"predicciones",label:"Predicciones"},
    {id:"ranking",label:"Ranking"},
    {id:"resumen",label:"Resumen"},
  ];

  // Load resultados oficiales for scoring on quiniela screen
  useEffect(()=>{
    if(screen==="quiniela"&&myId){
      getDoc(doc(db,"admin","resultados")).then(snap=>{
        if(snap.exists()) setResultadosOficiales(snap.data());
      }).catch(()=>{});
    }
  },[screen,myId]);

  // ════════════════════════════════════════════════════════════════════════════
  // ADMIN
  // ════════════════════════════════════════════════════════════════════════════
  if(screen==="admin") return <Admin onBack={()=>setScreen(myId?"quiniela":"login")} />;

  // ════════════════════════════════════════════════════════════════════════════
  // LOGIN
  // ════════════════════════════════════════════════════════════════════════════
  if(screen==="login") return (
    <div style={{minHeight:"100vh",background:B.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",padding:20}}>
      <div style={{maxWidth:360,width:"100%"}}>
        {/* Hero banner - matches the screenshot */}
        <div style={{
          background:"#2a4bc9",
          borderRadius:20, marginBottom:20,
          boxShadow:"0 8px 32px rgba(58,91,217,0.4)",
          position:"relative", overflow:"hidden",
          minHeight:180, display:"flex",
        }}>
          {/* Left: text content */}
          <div style={{
            position:"relative", zIndex:2,
            padding:"28px 20px 24px 24px",
            flex:1, display:"flex", flexDirection:"column", justifyContent:"center",
          }}>
            {/* MF + KOTO Logos */}
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <img src={B.logoMF} alt="MundoFutbol"
                style={{height:46,objectFit:"contain",filter:"drop-shadow(0 0 6px rgba(255,255,255,0.3))"}}
                onError={e=>{ e.target.style.display="none"; }}
              />
              <img src={B.logoKOTO} alt="KOTO"
                style={{height:54,objectFit:"contain",filter:"drop-shadow(0 0 4px rgba(255,255,255,0.2))"}}
                onError={e=>{ e.target.style.display="none"; }}
              />
            </div>
            <div style={{fontSize:8,letterSpacing:5,color:"rgba(255,255,255,0.75)",textTransform:"uppercase",fontWeight:"600",marginBottom:2}}>Copa del Mundo</div>
            <div style={{fontSize:28,fontWeight:"900",color:"#ffffff",letterSpacing:-0.5,lineHeight:1,textTransform:"uppercase"}}>QUINIELA</div>
            <div style={{fontSize:28,fontWeight:"900",color:"#ffffff",letterSpacing:-0.5,lineHeight:1,textTransform:"uppercase",marginBottom:6}}>2026</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.7)",letterSpacing:3,textTransform:"uppercase"}}>Predice · Compite · Gana</div>
          </div>

          {/* Right: vertical colored stripes + FIFA logo */}
          <div style={{position:"relative", width:180, flexShrink:0, overflow:"hidden"}}>
            {/* Vertical stripes */}
            {[["#7c3aed",0],["#3a5bd9",36],["#00c853",72],["#e63946",108],["#f77f00",144]].map(([col,x])=>(
              <div key={col} style={{
                position:"absolute", top:0, bottom:0,
                left:x, width:40,
                background:col,
              }}/>
            ))}
            {/* FIFA 2026 logo on top of stripes */}
            <div style={{
              position:"absolute", inset:0,
              display:"flex", alignItems:"center", justifyContent:"center",
              zIndex:2,
            }}>
              <img src={B.logoMundial} alt="FIFA World Cup 2026"
                style={{ height:140, objectFit:"contain",
                  filter:"drop-shadow(0 2px 12px rgba(0,0,0,0.4))" }}
                onError={e=>{ e.target.style.display="none"; }}
              />
            </div>
          </div>
        </div>
        <div style={{background:"#ffffff",border:"1px solid #e0e0e8",borderRadius:16,padding:24,boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}>
          <div style={{fontSize:12,color:"#444455",fontWeight:"600",marginBottom:6}}>Tu nombre</div>
          <input
            autoFocus value={loginInput}
            onChange={e=>setLoginInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            placeholder="Tu nombre completo..."
            style={{width:"100%",background:"#f8f8fc",border:"1px solid #ddd",borderRadius:8,padding:"10px 12px",color:"#111",fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:12}}
          />
          <div style={{fontSize:12,color:"#444455",fontWeight:"600",marginBottom:6}}>Código de acceso</div>
          <div style={{position:"relative",marginBottom:8}}>
            <input
              type="password" value={codigoInput}
              onChange={e=>setCodigoInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              placeholder="Código de la quiniela..."
              style={{width:"100%",background:"#f8f8fc",border:"1px solid #ddd",borderRadius:8,padding:"10px 12px 10px 36px",color:"#111",fontSize:14,outline:"none",boxSizing:"border-box"}}
            />
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,opacity:0.5}}>🔑</span>
          </div>
          <div style={{fontSize:12,color:"#444455",fontWeight:"600",marginBottom:6}}>WhatsApp</div>
          <div style={{position:"relative",marginBottom:12}}>
            <input
              type="tel" value={emailInput}
              onChange={e=>setEmailInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              placeholder="+58 123 4567890"
              style={{width:"100%",background:"#f8f8fc",border:"1px solid #ddd",borderRadius:8,padding:"10px 12px 10px 36px",color:"#111",fontSize:14,outline:"none",boxSizing:"border-box"}}
            />
           <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:16}}>
  <svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
</span>

          </div>
          {loginError&&<div style={{fontSize:11,color:"#f44336",marginBottom:8,padding:"6px 10px",background:"#f4433615",borderRadius:6,border:"1px solid #f4433630"}}>{loginError}</div>}
          <button onClick={handleLogin} style={{width:"100%",padding:12,borderRadius:9,border:"none",background:"linear-gradient(135deg,#3a5bd9,#7c3aed)",color:"#ffffff",fontWeight:"bold",fontSize:14,cursor:"pointer",boxShadow:`0 4px 20px rgba(58,91,217,0.25)`,marginTop:4}}>Entrar a mi Quiniela →</button>
          <div style={{textAlign:"center",marginTop:14,display:"flex",gap:16,justifyContent:"center"}}>
            <button onClick={()=>setScreen("portal")} style={{background:"transparent",border:"none",color:"#3a5bd9",fontSize:11,cursor:"pointer",textDecoration:"underline",fontWeight:"600"}}>👥 Ver quinielas de todos</button>
            <button onClick={()=>setScreen("admin")} style={{background:"transparent",border:"none",color:"#888",fontSize:11,cursor:"pointer",textDecoration:"none"}}>🔐 Admin</button>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:14,fontSize:10,color:"#f0f0f8"}}>Usa el mismo nombre para recuperar tu quiniela</div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // PORTAL
  // ════════════════════════════════════════════════════════════════════════════
  if(screen==="portal"){
    if(selectedUser){
      const q=selectedUser; const qc=completionPct(q);
      return(
        <div style={{minHeight:"100vh",background:B.bg,color:B.text,fontFamily:"'SF Pro Display','Helvetica Neue',Arial,sans-serif"}}>
          <div style={{background:"#1a2a6c",borderBottom:"none",boxShadow:"0 2px 16px rgba(26,42,108,0.25)",padding:"10px 14px",position:"sticky",top:0,zIndex:100}}>
            <div style={{maxWidth:560,margin:"0 auto",display:"flex",alignItems:"center",gap:10}}>
              <button onClick={()=>setSelectedUser(null)} style={{background:"#00000008",border:"none",borderRadius:8,padding:"6px 10px",color:"#aaa",cursor:"pointer",fontSize:12}}>← Volver</button>
              <div><div style={{fontSize:8,color:B.primary,letterSpacing:3}}>QUINIELA DE</div><div style={{fontSize:15,fontWeight:"bold",color:"#ffffff"}}>{q.nombre}</div></div>
              <div style={{marginLeft:"auto",textAlign:"right"}}><div style={{fontSize:9,color:B.muted}}>Grupos</div><div style={{fontSize:14,fontWeight:"bold",color:qc.pct===100?"#00ff88":"#ffffff"}}>{qc.pct}%</div></div>
            </div>
          </div>
          <div style={{maxWidth:560,margin:"0 auto",padding:"14px 12px 40px"}}>
            <div style={{background:"#f5f5f7",border:`1px solid ${B.border}`,borderRadius:12,padding:14,marginBottom:14}}>
              <div style={{fontSize:10,letterSpacing:3,color:B.primary,textTransform:"uppercase",marginBottom:12}}>Predicciones Especiales</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[{icon:"🥇",label:"Campeón",val:q.campeon,color:B.primary},{icon:"🥈",label:"Subcampeón",val:q.segundo,color:"#888"},{icon:"🥉",label:"3er Lugar",val:q.tercero,color:"#a07040"},{icon:"👟",label:"Bota de Oro",val:q.goleador==="Otro..."?q.goleadorCustom:q.goleador,color:"#3a5bd9"}].map(({icon,label,val,color})=>(
                  <div key={label} style={{background:val?"#00000005":"#ffffff02",border:`1px solid ${val?color+"35":"#00000008"}`,borderRadius:10,padding:"10px 12px"}}>
                    <div style={{fontSize:9,color:B.muted,marginBottom:4}}>{icon} {label}</div>
                    <div style={{fontSize:12,fontWeight:"bold",color:val?color:"#e0e0f0"}}>{val||"—"}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Eliminatorias resumen */}
            <div style={{background:"#f5f5f7",border:`1px solid ${B.border}`,borderRadius:12,padding:14,marginBottom:14}}>
              <div style={{fontSize:10,letterSpacing:3,color:B.primary,textTransform:"uppercase",marginBottom:10}}>Eliminatorias</div>
              {RONDAS.map(r=>{
                const ko=(q.knockout||{})[r.id]||[];
                const done=ko.filter(m=>m.ganador).length;
                return(
                  <div key={r.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid #ffffff05"}}>
                    <span style={{fontSize:14}}>{r.emoji}</span>
                    <span style={{fontSize:11,color:B.muted,flex:1}}>{r.label}</span>
                    <span style={{fontSize:10,color:done===r.partidos?"#3a5bd9":B.muted}}>{done}/{r.partidos}</span>
                  </div>
                );
              })}
            </div>
            {KEYS.map(g=>{
              const gr2=GRUPOS[g];const ms2=GRUPOS[g].partidos.map((_,i)=>(q.scores||{})[g]?.[i]||{local:"",visita:""});
              const tab2=calcTabla(gr2.equipos,gr2.partidos,ms2);
              const done=ms2.every(m=>!isNaN(parseInt(m.local))&&m.local!==""&&!isNaN(parseInt(m.visita))&&m.visita!=="");
              return(
                <div key={g} style={{background:"#ffffff",border:`1px solid ${done?gr2.color+"45":"#00000008"}`,borderRadius:10,padding:"9px 13px",marginBottom:7}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:done?8:0}}>
                    <div style={{width:26,height:26,borderRadius:6,background:done?gr2.color:"#0000000a",color:done?gr2.accent:"#e0e0f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:"900"}}>{g}</div>
                    <div style={{fontSize:10,color:B.muted}}>{gr2.equipos.map(e=>e.split(" ").slice(1).join(" ")).join(" · ")}</div>
                    <span style={{marginLeft:"auto",fontSize:9,color:done?B.primary:"#e0e0f0"}}>{done?"✓":"pendiente"}</span>
                  </div>
                  {done&&(<div style={{display:"flex",gap:4}}>{tab2.map(([eq,st],i)=>(<div key={eq} style={{flex:1,textAlign:"center",background:i<2?gr2.color+"25":"#00000005",border:`1px solid ${i<2?gr2.color+"40":"#00000008"}`,borderRadius:6,padding:"4px 2px"}}><div style={{fontSize:8,color:i<2?gr2.accent:"#e8e8f5",marginBottom:1}}>{i+1}°</div><div style={{fontSize:9,color:i<2?B.text:"#e8e8f5",fontWeight:i<2?"bold":"normal"}}>{eq.split(" ").slice(1).join(" ").substring(0,7)}</div><div style={{fontSize:10,color:i<2?gr2.accent:"#e8e8f5",fontWeight:"bold"}}>{st.pts}pts</div></div>))}</div>)}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return(
      <div style={{minHeight:"100vh",background:B.bg,color:B.text,fontFamily:"'SF Pro Display','Helvetica Neue',Arial,sans-serif"}}>
        <div style={{background:"#1a2a6c",borderBottom:"none",boxShadow:"0 2px 16px rgba(26,42,108,0.25)",padding:"10px 14px",position:"sticky",top:0,zIndex:100}}>
          <div style={{maxWidth:560,margin:"0 auto",display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setScreen(myId?"quiniela":"login")} style={{background:"#00000008",border:"none",borderRadius:8,padding:"6px 10px",color:"#aaa",cursor:"pointer",fontSize:12}}>← {myId?"Mi quiniela":"Inicio"}</button>
            <Logos size={26} />
            <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:11,color:"#ffffffaa"}}>{portalData.length} participantes</span>
              <button onClick={loadPortal} style={{background:"#00000008",border:"none",borderRadius:6,padding:"5px 8px",color:"#aaa",cursor:"pointer",fontSize:13}}>{portalLoading?"⏳":"↻"}</button>
            </div>
          </div>
        </div>
        <div style={{maxWidth:560,margin:"0 auto",padding:"14px 12px 40px"}}>
          {portalLoading&&<div style={{textAlign:"center",padding:40,color:B.muted}}><div style={{fontSize:28,marginBottom:8}}>⏳</div>Cargando...</div>}
          {!portalLoading&&portalData.length===0&&(<div style={{textAlign:"center",padding:40}}><div style={{fontSize:40,marginBottom:12}}>🏜️</div><div style={{fontSize:14,color:B.muted,marginBottom:8}}>Aún no hay quinielas guardadas</div><button onClick={()=>setScreen(myId?"quiniela":"login")} style={{padding:"9px 20px",borderRadius:9,border:"none",background:"#3a5bd9",color:"#ffffff",fontWeight:"bold",fontSize:13,cursor:"pointer"}}>{myId?"Ir a mi quiniela":"Crear quiniela"}</button></div>)}
          {!portalLoading&&portalData.length>0&&(
            <>
              <div style={{background:"#ffffff",border:"1px solid #e0e0e8",borderRadius:12,padding:14,marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
                <div style={{fontSize:10,letterSpacing:3,color:B.primary,textTransform:"uppercase",marginBottom:12}}>Estadísticas del grupo</div>
                {(()=>{
                  const cc={},gc={};
                  portalData.forEach(q=>{if(q.campeon)cc[q.campeon]=(cc[q.campeon]||0)+1;const g=q.goleador==="Otro..."?q.goleadorCustom:q.goleador;if(g)gc[g]=(gc[g]||0)+1;});
                  const topC=Object.entries(cc).sort((a,b)=>b[1]-a[1]).slice(0,3);
                  const topG=Object.entries(gc).sort((a,b)=>b[1]-a[1])[0];
                  return(<div>
                    <div style={{fontSize:11,color:B.muted,marginBottom:6}}>🏆 Campeón más elegido</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{topC.map(([sel,n])=>(<div key={sel} style={{background:"#eff4ff",border:"1px solid #3a5bd960",borderRadius:8,padding:"5px 10px",display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}>{sel.split(" ")[0]}</span><span style={{fontSize:11,color:B.primary,fontWeight:"bold"}}>{sel.split(" ").slice(1).join(" ")}</span><span style={{fontSize:10,color:B.muted,background:"#0000000d",borderRadius:10,padding:"1px 5px"}}>{n}</span></div>))}</div>
                    {topG&&<div style={{fontSize:11,color:B.muted}}>👟 Goleador favorito: <span style={{color:"#3a5bd9",fontWeight:"bold"}}>{topG[0]}</span> <span style={{color:"#e0e0f0"}}>({topG[1]} votos)</span></div>}
                  </div>);
                })()}
              </div>
              {resultadosOficiales&&Object.keys(resultadosOficiales).length>0&&(
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:10,letterSpacing:3,color:B.primary,textTransform:"uppercase",marginBottom:8}}>🏅 Ranking de puntuación</div>
                  {portalData.map(p=>({...p,score:calcTotalPoints(p,resultadosOficiales)})).sort((a,b)=>b.score.total-a.score.total).slice(0,3).map((p,rank)=>(
                    <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:rank===0?"#eff4ff":"#ffffff",border:`1px solid ${rank===0?"#3a5bd9":"#e0e0e8"}`,borderRadius:8,marginBottom:4}}>
                      <span style={{fontSize:14}}>{rank===0?"🥇":rank===1?"🥈":"🥉"}</span>
                      <span style={{fontSize:13,fontWeight:"bold",color:rank===0?B.primary:B.text,flex:1}}>{p.nombre}</span>
                      <span style={{fontSize:15,fontWeight:"bold",color:rank===0?B.primary:B.muted}}>{p.score.total} pts</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{fontSize:10,letterSpacing:3,color:"#e8e8f5",textTransform:"uppercase",marginBottom:10}}>Participantes ({portalData.length})</div>
              {portalData.map(q=>{
                const qc=completionPct(q); const isMe=q.id===myId;
                return(
                  <div key={q.id} onClick={()=>setSelectedUser(q)} style={{background:isMe?"#eff4ff":"#ffffff",border:`1px solid ${isMe?"#3a5bd9":"#e0e0e8"}`,borderRadius:12,padding:"12px 14px",marginBottom:8,cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:36,height:36,borderRadius:10,background:isMe?B.primaryDim:"#00000008",border:`1px solid ${isMe?B.primary+"40":"#0000000d"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:"bold",color:isMe?B.primary:"#d8d8ec",flexShrink:0}}>{q.nombre.charAt(0).toUpperCase()}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                          <span style={{fontSize:13,fontWeight:"bold",color:isMe?"#3a5bd9":"#111"}}>{q.nombre}</span>
                          {isMe&&<span style={{fontSize:9,background:B.primaryDim,border:`1px solid ${B.primary}`,color:B.primary,borderRadius:10,padding:"1px 6px"}}>Tú</span>}
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          {q.campeon&&<span style={{fontSize:9,color:B.primary}}>🏆 {q.campeon.split(" ").slice(1).join(" ")}</span>}
                          {q.goleador&&q.goleador!=="Otro..."&&<span style={{fontSize:9,color:"#3a5bd9"}}>👟 {q.goleador}</span>}
                        </div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        {resultadosOficiales&&Object.keys(resultadosOficiales).length>0?(
                          <div>
                            <div style={{fontSize:16,fontWeight:"bold",color:B.primary}}>{
                              calcTotalPoints(q,resultadosOficiales).total
                            } pts</div>
                            <div style={{fontSize:9,color:B.muted}}>G:{calcTotalPoints(q,resultadosOficiales).groups} E:{calcTotalPoints(q,resultadosOficiales).knockout} X:{calcTotalPoints(q,resultadosOficiales).special}</div>
                          </div>
                        ):(
                          <div>
                            <div style={{fontSize:14,fontWeight:"bold",color:qc.pct===100?B.primary:qc.pct>50?B.primary2:"#d8d8ec"}}>{qc.pct}%</div>
                            <div style={{fontSize:9,color:"#e0e0f0"}}>grupos</div>
                          </div>
                        )}
                      </div>
                      <div style={{color:"#e8e8f5",fontSize:16}}>›</div>
                    </div>
                    <div style={{height:2,background:"#00000008",borderRadius:1,overflow:"hidden",marginTop:8}}>
                      <div style={{height:"100%",width:qc.pct+"%",background:qc.pct===100?B.primary:`linear-gradient(90deg,${B.primary2},${B.primary})`,transition:"width 0.3s"}}/>
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

  // ════════════════════════════════════════════════════════════════════════════
  // QUINIELA PRINCIPAL
  // ════════════════════════════════════════════════════════════════════════════
  return(
    <div style={{minHeight:"100vh",background:B.bg,color:B.text,fontFamily:"'SF Pro Display','Helvetica Neue',Arial,sans-serif"}}>
      {/* HEADER */}
      <div style={{background:"#1a2a6c",borderBottom:"none",boxShadow:"0 2px 16px rgba(26,42,108,0.3)",padding:"9px 14px",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:560,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <Logos size={28}/>
            <div style={{flex:1}}/>
            <div style={{textAlign:"center"}}><div style={{fontSize:7,color:"#ffffffaa",fontWeight:"600"}}>GRUPOS</div><div style={{fontSize:12,fontWeight:"bold",color:pct===100?"#00ff88":"#ffffff"}}>{rellenados}/{totalP}</div></div>
            <div style={{textAlign:"center"}}><div style={{fontSize:7,color:"#ffffffaa",fontWeight:"600"}}>ELIM.</div><div style={{fontSize:12,fontWeight:"bold",color:koFilled===koTotal?"#00ff88":"#ffffff"}}>{koFilled}/{koTotal}</div></div>
            <div style={{textAlign:"center"}}><div style={{fontSize:7,color:"#ffffffaa",fontWeight:"600"}}>EXTRAS</div><div style={{fontSize:12,fontWeight:"bold",color:predCount===4?"#00ff88":"#ffffff"}}>{predCount}/4</div></div>
            <button onClick={()=>setScreen("portal")} style={{background:"#00000008",border:`1px solid ${B.border}`,borderRadius:8,padding:"5px 8px",color:"#aaa",cursor:"pointer",fontSize:9,whiteSpace:"nowrap"}}>👥 Portal</button>
          </div>
          <div style={{height:3,background:"#00000008",borderRadius:2,overflow:"hidden",marginBottom:6}}>
            <div style={{height:"100%",width:pct+"%",background:pct===100?"#00c853":"linear-gradient(90deg,#3a5bd9,#7c3aed)",transition:"width 0.3s",boxShadow:`0 0 0px transparent`}}/>
          </div>
          <div style={{display:"flex",gap:3,alignItems:"center"}}>
            <div style={{fontSize:10,color:"#ffffff",fontWeight:"700",marginRight:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:80}}>⚽ {myNombre}</div>
            {TABS.map(({id,label})=>(<button key={id} onClick={()=>setTab(id)} style={{padding:"3px 7px",borderRadius:6,border:"none",background:tab===id?"#ffffff":"#ffffff20",color:tab===id?"#1a2a6c":"#ffffffcc",fontSize:9,cursor:"pointer",fontWeight:"bold",whiteSpace:"nowrap"}}>{label}</button>))}
            <button onClick={saveQuiniela} disabled={saving} style={{marginLeft:"auto",padding:"3px 8px",borderRadius:6,border:"none",background:saving?"#ffffff30":saveMsg.includes("✓")?"#00c853":"#ffffff",color:saving?"#aaa":saveMsg.includes("✓")?"#ffffff":"#1a2a6c",fontSize:9,cursor:saving?"not-allowed":"pointer",fontWeight:"bold",flexShrink:0}}>{saving?"...":saveMsg||"💾"}</button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:560,margin:"0 auto",padding:"12px 10px 56px"}}>

        {/* ═══ GRUPOS ═══ */}
        {tab==="partidos"&&(
          <>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,justifyContent:"center",marginBottom:14}}>
              {KEYS.map(g=>{const done=isDone(g);const active=g===grupo;return(<button key={g} onClick={()=>setGrupo(g)} style={{width:34,height:34,borderRadius:7,fontSize:12,fontWeight:"bold",border:active?"2px solid #3a5bd9":"2px solid transparent",background:done?(active?B.primary2:B.primaryDim):active?"#00000012":"#00000008",color:done?(active?"#ffffff":"#3a5bd9"):active?"#3a5bd9":"#aaa",cursor:"pointer",transition:"all 0.2s",boxShadow:active?`0 2px 8px rgba(58,91,217,0.20)`:"none"}}>{done&&!active?"✓":g}</button>);})}
            </div>
            <div style={{borderRadius:14,overflow:"hidden",border:`1px solid ${gr.accent}20`,marginBottom:12}}>
              <div style={{background:`linear-gradient(135deg,${gr.color},${gr.color}cc)`,padding:"11px 14px",display:"flex",alignItems:"center",gap:10,borderBottom:`2px solid ${gr.accent}30`}}>
                <div style={{width:36,height:36,borderRadius:8,background:gr.accent,color:gr.color||"#000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:"900"}}>{grupo}</div>
                <div><div style={{fontSize:15,fontWeight:"bold"}}>Grupo {grupo}</div><div style={{fontSize:10,color:"#ffffff70"}}>{gr.equipos.map(e=>e.split(" ").slice(1).join(" ")).join(" · ")}</div></div>
                {isDone(grupo)&&<div style={{marginLeft:"auto",fontSize:10,color:"#00c853",background:"#e8fff0",border:"1px solid #00c853",borderRadius:20,padding:"2px 8px"}}>✓ Listo</div>}
              </div>
              <div style={{background:"#f5f5f7"}}>
                {[1,2,3].map(fecha=>(
                  <div key={fecha}>
                    <div style={{padding:"5px 14px",background:"#f0f0f5",fontSize:9,color:"#333",fontWeight:"600",letterSpacing:2,textTransform:"uppercase",borderTop:fecha>1?"1px solid #e0e0e8":"none",borderBottom:"1px solid #e0e0e8"}}>Jornada {fecha}</div>
                    {gr.partidos.filter(p=>p.f===fecha).map(p=>{
                      const idx=gr.partidos.indexOf(p);const m=ms[idx];
                      const gl=parseInt(m.local),gv=parseInt(m.visita);
                      const ok=!isNaN(gl)&&!isNaN(gv)&&m.local!==""&&m.visita!=="";
                      const wL=ok&&gl>gv,wV=ok&&gv>gl,emp=ok&&gl===gv;
                      return(
                        <div key={idx} style={{padding:"9px 14px",borderBottom:"1px solid #eeeeef",background:"#ffffff"}}>
                          <div style={{fontSize:9,color:"#777",marginBottom:5}}>📅 {p.fecha}</div>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{flex:1,fontSize:11,textAlign:"right",fontWeight:wL?"bold":"normal",color:wL?"#111":ok?"#333":"#aaa"}}>{p.local}</div>
                            <input type="number" min="0" max="20" value={m.local} onChange={e=>setGol(grupo,idx,"local",e.target.value)} style={{width:34,height:32,textAlign:"center",background:"#f0f0f5",border:`2px solid ${ok?"#3a5bd9":"#e0e0e8"}`,borderRadius:6,color:ok?"#3a5bd9":"#bbb",fontSize:15,fontWeight:"bold",outline:"none"}}/>
                            <div style={{width:16,textAlign:"center",fontSize:12,color:wL?"#3a5bd9":wV?"#e63946":emp?"#f77f00":"#ccc",fontWeight:"bold"}}>{ok?(wL?"▸":wV?"◂":"="):"·"}</div>
                            <input type="number" min="0" max="20" value={m.visita} onChange={e=>setGol(grupo,idx,"visita",e.target.value)} style={{width:34,height:32,textAlign:"center",background:"#f0f0f5",border:`2px solid ${ok?"#3a5bd9":"#e0e0e8"}`,borderRadius:6,color:ok?"#333":"#bbb",fontSize:15,fontWeight:"bold",outline:"none"}}/>
                            <div style={{flex:1,fontSize:11,fontWeight:wV?"bold":"normal",color:wV?"#111":ok?"#333":"#aaa"}}>{p.visita}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div style={{background:"#f5f5f7",padding:"10px 14px",borderTop:"1px solid #e8e8f0"}}>
                <div style={{fontSize:8,letterSpacing:2,color:"#555",fontWeight:"600",textTransform:"uppercase",marginBottom:7}}>Clasificación proyectada</div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
                  <thead><tr>{["#","Equipo","PJ","GF","GC","DIF","PTS"].map(h=><th key={h} style={{color:"#888",textAlign:h==="Equipo"?"left":"center",padding:"0 4px 4px",fontWeight:"600"}}>{h}</th>)}</tr></thead>
                  <tbody>{tabla.map(([eq,st],i)=>(<tr key={eq} style={{borderTop:"1px solid #f0f0f0"}}><td style={{padding:4,textAlign:"center"}}>{i<2?<span style={{background:gr.accent,color:gr.color||"#000",borderRadius:4,padding:"1px 4px",fontSize:9,fontWeight:"900"}}>{i+1}</span>:<span style={{color:"#888"}}>{i+1}</span>}</td><td style={{padding:4,color:i<2?"#111":"#888",fontWeight:i<2?"bold":"normal",fontSize:11}}>{eq.split(" ").slice(0,2).join(" ")}</td>{[st.jj,st.gf,st.gc,st.gf-st.gc,st.pts].map((v,vi)=><td key={vi} style={{textAlign:"center",padding:4,color:vi===4?(i<2?"#3a5bd9":"#555"):"#666",fontWeight:vi===4&&i<2?"bold":"normal"}}>{v}</td>)}</tr>))}</tbody>
                </table>
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <button onClick={()=>gIdx>0&&setGrupo(KEYS[gIdx-1])} disabled={gIdx===0} style={{flex:1,padding:8,borderRadius:9,border:"1px solid #e0e0e8",background:gIdx===0?"#f5f5f7":"#f0f0ff",color:gIdx===0?"#ccc":"#7c3aed",fontSize:12,cursor:gIdx===0?"not-allowed":"pointer"}}>← Anterior</button>
              <button onClick={()=>gIdx<KEYS.length-1&&setGrupo(KEYS[gIdx+1])} disabled={gIdx===KEYS.length-1} style={{flex:1,padding:8,borderRadius:9,border:"none",background:gIdx===KEYS.length-1?"#f5f5f7":"#7c3aed",color:gIdx===KEYS.length-1?"#ccc":"#ffffff",fontSize:12,fontWeight:"bold",cursor:gIdx===KEYS.length-1?"not-allowed":"pointer"}}>Siguiente →</button>
            </div>
            <div style={{background:"#ffffff",border:"1px solid #e0e0e8",borderRadius:10,padding:"10px 14px",textAlign:"center"}}>
              <div style={{fontSize:10,color:"#888",marginBottom:6}}>¿Listo con los grupos?</div>
              <button onClick={()=>setTab("knockout")} style={{padding:"8px 18px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#3a5bd9,#7c3aed)",color:"#ffffff",fontWeight:"bold",fontSize:12,cursor:"pointer"}}>Continuar a Eliminatorias ⚔️</button>
            </div>
          </>
        )}

        {/* ═══ ELIMINATORIAS ═══ */}
        {tab==="knockout"&&(
          <KnockoutTab knockout={knockout} setKnockout={setKnockout} scores={scores} />
        )}

        {/* ═══ PREDICCIONES ═══ */}
        {tab==="predicciones"&&(
          <div>
            <div style={{background:"linear-gradient(135deg,#2a4bc9,#7c3aed)",border:"none",borderRadius:14,padding:16,marginBottom:18,textAlign:"center",boxShadow:"0 4px 20px rgba(58,91,217,0.25)"}}>
              <Logos size={42} center />
              <div style={{fontSize:16,fontWeight:"bold",color:"#ffffff",marginTop:12,marginBottom:4}}>Predicciones Especiales</div>
              <div style={{fontSize:11,color:"#ffffffaa"}}>Elige el podio y al máximo goleador</div>
              <div style={{marginTop:10,display:"flex",justifyContent:"center",gap:8}}>
                {[campeon,segundo,tercero,goleador||goleadorCustom].map((v,i)=>(<div key={i} style={{width:10,height:10,borderRadius:"50%",background:v?B.primary:"#f0f0f8",boxShadow:v?`0 0 6px ${B.primary}`:"none",transition:"all 0.3s"}}/>))}
              </div>
            </div>
            {(campeon||segundo||tercero)&&(
              <div style={{marginBottom:18,display:"flex",alignItems:"flex-end",justifyContent:"center",gap:6,height:110}}>
                {[{place:2,val:segundo,h:70,bg:"linear-gradient(180deg,#3a3a3a,#1a1a1a)",border:"#555",medal:"🥈"},{place:1,val:campeon,h:90,bg:"linear-gradient(180deg,#9b5de5,#7b3fc4)",border:"#3a5bd9",medal:"🥇"},{place:3,val:tercero,h:55,bg:"linear-gradient(180deg,#5a3a1a,#3a2010)",border:"#7a5a2a",medal:"🥉"}].map(({place,val,h,bg,border,medal})=>(
                  <div key={place} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
                    {val&&<div style={{fontSize:10,color:place===1?B.primary:B.muted,marginBottom:4,textAlign:"center",fontWeight:place===1?"bold":"normal"}}>{val.split(" ").slice(1).join(" ")}</div>}
                    <div style={{width:"100%",height:h,background:bg,borderRadius:"8px 8px 0 0",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",border:`1px solid ${border}`,boxShadow:place===1?`0 0 20px ${B.primary}40`:"none"}}>
                      <div style={{fontSize:place===1?26:20}}>{medal}</div>
                      {val&&<div style={{fontSize:place===1?15:12}}>{val.split(" ")[0]}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {[
              {icon:"🥇",label:"Campeón del Mundo",sub:"¿Quién levantará la copa el 19 de julio?",val:campeon,set:v=>{setCampeon(v);if(segundo===v)setSegundo("");if(tercero===v)setTercero("");},color:B.primary,exclude:[]},
              {icon:"🥈",label:"Subcampeón",sub:"Finalista perdedor",val:segundo,set:v=>{setSegundo(v);if(tercero===v)setTercero("");},color:"#888",exclude:[campeon]},
              {icon:"🥉",label:"Tercer Lugar",sub:"Ganador del partido por el bronce",val:tercero,set:setTercero,color:"#a07040",exclude:[campeon,segundo]},
            ].map(({icon,label,sub,val,set,color,exclude})=>(
              <div key={label} style={{background:"#ffffff",border:`1px solid ${color}30`,borderRadius:12,padding:14,marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <span style={{fontSize:20}}>{icon}</span>
                  <div><div style={{fontSize:13,fontWeight:"bold",color}}>{label}</div><div style={{fontSize:10,color:B.muted}}>{sub}</div></div>
                  {val&&<div style={{marginLeft:"auto",fontSize:16}}>{val.split(" ")[0]}</div>}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {SELECCIONES.filter(s=>!exclude.includes(s)).map(s=>(<button key={s} onClick={()=>set(s===val?"":s)} style={btnStyle(val===s,color)}>{s}</button>))}
                </div>
              </div>
            ))}
            <div style={{background:"#ffffff",border:"1px solid #00c85330",borderRadius:12,padding:14,marginBottom:18,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <span style={{fontSize:20}}>👟</span>
                <div><div style={{fontSize:13,fontWeight:"bold",color:"#3a5bd9"}}>Bota de Oro</div><div style={{fontSize:10,color:B.muted}}>Máximo goleador del torneo</div></div>
                {goleador&&goleador!=="Otro..."&&<div style={{marginLeft:"auto",fontSize:11,color:"#3a5bd9",fontWeight:"bold"}}>{GOLEADORES.find(g=>g.nombre===goleador)?.sel} {goleador}</div>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                {GOLEADORES.map(g=>(<button key={g.nombre} onClick={()=>setGoleador(g.nombre===goleador?"":g.nombre)} style={{padding:"7px 10px",borderRadius:8,textAlign:"left",border:`1px solid ${goleador===g.nombre?"#3a5bd9":"#0000000d"}`,background:goleador===g.nombre?"#9b5de510":"#00000005",color:goleador===g.nombre?"#3a5bd9":B.muted,cursor:"pointer",transition:"all 0.15s",display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:14}}>{g.sel}</span>
                  <div style={{flex:1}}><div style={{fontSize:11,fontWeight:goleador===g.nombre?"bold":"normal"}}>{g.nombre}</div>{g.club&&<div style={{fontSize:9,color:"#e0e0f0"}}>{g.club}</div>}</div>
                  {goleador===g.nombre&&<span>✓</span>}
                </button>))}
              </div>
              {goleador==="Otro..."&&<input type="text" placeholder="Nombre del jugador..." value={goleadorCustom} onChange={e=>setGoleadorCustom(e.target.value)} style={{width:"100%",background:"#00000008",border:"1px solid #4caf5025",borderRadius:8,padding:"8px 12px",color:B.text,fontSize:13,outline:"none",boxSizing:"border-box",marginTop:10}}/>}
            </div>
            {podioCompleto&&(
              <div style={{background:"#f5f5f7",border:`1px solid ${B.primary}`,borderRadius:12,padding:14,textAlign:"center",boxShadow:`0 0 20px ${B.primary}15`}}>
                <div style={{fontSize:18,marginBottom:6}}>🎉</div>
                <div style={{fontSize:13,fontWeight:"bold",color:"#3a5bd9",marginBottom:8}}>¡Predicciones completas!</div>
                <button onClick={saveQuiniela} style={{padding:"8px 20px",borderRadius:8,border:"none",background:"#3a5bd9",color:"#ffffff",fontWeight:"bold",fontSize:13,cursor:"pointer",marginRight:8}}>💾 Guardar</button>
                <button onClick={()=>setTab("resumen")} style={{padding:"8px 14px",borderRadius:8,border:"1px solid #e0e0e8",background:"transparent",color:"#666",fontSize:12,cursor:"pointer"}}>Ver resumen →</button>
              </div>
            )}
          </div>
        )}


        {/* ═══ RANKING ═══ */}
        {tab==="ranking"&&(
          <div>
            {/* My score card */}
            {resultadosOficiales&&Object.keys(resultadosOficiales).length>0&&(()=>{
              const myScore=calcTotalPoints({scores,campeon,segundo,tercero,goleador:goleador==="Otro..."?goleadorCustom:goleador,knockout},resultadosOficiales);
              return(
                <div style={{background:"linear-gradient(135deg,#2a4bc9,#7c3aed)",border:"none",borderRadius:14,padding:16,marginBottom:16,boxShadow:`0 4px 16px rgba(58,91,217,0.10)`}}>
                  <div style={{fontSize:9,letterSpacing:3,color:B.muted,textTransform:"uppercase",marginBottom:4}}>Tu puntuación</div>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{fontSize:40,fontWeight:"bold",color:"#ffffff"}}>{myScore.total}</div>
                    <div style={{fontSize:12,color:"#ffffffaa"}}>pts</div>
                    <div style={{marginLeft:"auto",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,textAlign:"center"}}>
                      {[{l:"Grupos",v:myScore.groups},{l:"Elim.",v:myScore.knockout},{l:"Extras",v:myScore.special}].map(({l,v})=>(
                        <div key={l} style={{background:"#00000008",borderRadius:8,padding:"5px 8px"}}>
                          <div style={{fontSize:15,fontWeight:"bold",color:B.primary}}>{v}</div>
                          <div style={{fontSize:8,color:B.muted}}>{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* No resultados yet */}
            {(!resultadosOficiales||Object.keys(resultadosOficiales).length===0)&&(
              <div style={{background:"#ffffff",border:"1px solid #e0e0e8",borderRadius:12,padding:24,marginBottom:16,textAlign:"center"}}>
                <div style={{fontSize:32,marginBottom:8}}>⏳</div>
                <div style={{fontSize:13,color:B.text,marginBottom:4}}>El ranking estará disponible</div>
                <div style={{fontSize:11,color:B.muted}}>cuando el organizador ingrese los resultados oficiales</div>
              </div>
            )}

            {/* Ranking table from portal */}
            {resultadosOficiales&&Object.keys(resultadosOficiales).length>0&&portalData.length>0&&(()=>{
              const ranked=portalData.map(p=>({...p,score:calcTotalPoints(p,resultadosOficiales)})).sort((a,b)=>b.score.total-a.score.total);
              return(
                <div style={{background:"#ffffff",border:"1px solid #e0e0e8",borderRadius:12,overflow:"hidden"}}>
                  <div style={{display:"grid",gridTemplateColumns:"32px 1fr 40px 40px 40px 52px",gap:4,padding:"8px 12px",background:"#e8e8f5",fontSize:9,color:B.muted,letterSpacing:1,textTransform:"uppercase"}}>
                    <div>#</div><div>Participante</div><div style={{textAlign:"center"}}>G</div><div style={{textAlign:"center"}}>E</div><div style={{textAlign:"center"}}>X</div><div style={{textAlign:"center"}}>TOTAL</div>
                  </div>
                  {ranked.map((p,rank)=>{
                    const isMe=p.id===myId;
                    return(
                      <div key={p.id} style={{display:"grid",gridTemplateColumns:"32px 1fr 40px 40px 40px 52px",gap:4,padding:"9px 12px",borderTop:"1px solid #f0f0f0",background:isMe?"#e8e8f5":"transparent",alignItems:"center"}}>
                        <div style={{fontSize:rank<3?15:12,textAlign:"center"}}>{rank===0?"🥇":rank===1?"🥈":rank===2?"🥉":<span style={{color:B.muted}}>{rank+1}</span>}</div>
                        <div>
                          <div style={{fontSize:12,fontWeight:isMe?"bold":"normal",color:isMe?B.primary:rank===0?B.text:B.muted}}>{p.nombre}{isMe&&<span style={{fontSize:9,marginLeft:5,color:B.primary}}>← tú</span>}</div>
                        </div>
                        <div style={{textAlign:"center",fontSize:11,color:B.muted}}>{p.score.groups}</div>
                        <div style={{textAlign:"center",fontSize:11,color:B.muted}}>{p.score.knockout}</div>
                        <div style={{textAlign:"center",fontSize:11,color:B.muted}}>{p.score.special}</div>
                        <div style={{textAlign:"center",fontSize:15,fontWeight:"bold",color:isMe?B.primary:rank===0?B.primary:B.text}}>{p.score.total}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Load portal data if not loaded */}
            {resultadosOficiales&&Object.keys(resultadosOficiales).length>0&&portalData.length===0&&(
              <div style={{textAlign:"center",marginTop:16}}>
                <button onClick={loadPortal} style={{padding:"9px 20px",borderRadius:9,border:"none",background:"#3a5bd9",color:"#ffffff",fontWeight:"bold",fontSize:13,cursor:"pointer"}}>Cargar ranking completo</button>
              </div>
            )}

            {/* Leyenda */}
            <div style={{marginTop:14,background:"#f5f5f7",border:`1px solid ${B.border}`,borderRadius:10,padding:12}}>
              <div style={{fontSize:9,color:B.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Sistema de puntos</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {[["Resultado exacto","5 pts",B.primary],["Solo ganador","3 pts","#3a5bd9"],["Campeón/Sub/3°/Gol","5 c/u",B.primary]].map(([l,v,c])=>(
                  <div key={l} style={{padding:"4px 10px",borderRadius:8,background:c+"15",border:`1px solid ${c}30`,fontSize:10}}>
                    <span style={{color:B.muted}}>{l}: </span><span style={{color:c,fontWeight:"bold"}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ RESUMEN ═══ */}
        {tab==="resumen"&&(
          <div>
            <div style={{background:"#ffffff",border:"1px solid #e0e0e8",borderRadius:12,padding:"13px 14px",marginBottom:14}}>
              <Logos size={26}/>
              <div style={{fontSize:14,fontWeight:"bold",marginTop:10,marginBottom:6}}>🎯 {myNombre}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                <span style={tagStyle(rellenados===totalP,B.primary)}>{rellenados===totalP?"✓":"·"} Grupos {rellenados}/{totalP}</span>
                <span style={tagStyle(koFilled===koTotal,B.primary)}>{koFilled===koTotal?"✓":"·"} Elim. {koFilled}/{koTotal}</span>
                <span style={tagStyle(podioCompleto,B.primary)}>{podioCompleto?"✓":"·"} Extras {predCount}/4</span>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={saveQuiniela} disabled={saving} style={{flex:1,padding:9,borderRadius:9,border:"none",background:saving?"#e0e0e8":"#3a5bd9",color:saving?"#aaa":"#fff",fontWeight:"bold",fontSize:12,cursor:saving?"not-allowed":"pointer"}}>{saving?"Guardando...":saveMsg||"💾 Guardar quiniela"}</button>
                <button onClick={()=>setScreen("portal")} style={{flex:1,padding:9,borderRadius:9,border:"1px solid #0a1a0a",background:"#f0f0f8",color:B.muted,fontSize:12,cursor:"pointer"}}>👥 Ver portal</button>
              </div>
            </div>

            {/* Resumen predicciones */}
            {(campeon||segundo||tercero||goleador||goleadorCustom)&&(
              <div style={{background:"#f5f5f7",border:`1px solid ${B.border}`,borderRadius:12,padding:14,marginBottom:14}}>
                <div style={{fontSize:10,letterSpacing:3,color:B.primary,textTransform:"uppercase",marginBottom:12}}>Predicciones Especiales</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[{icon:"🥇",label:"Campeón",val:campeon,color:B.primary},{icon:"🥈",label:"Subcampeón",val:segundo,color:"#888"},{icon:"🥉",label:"3er Lugar",val:tercero,color:"#a07040"},{icon:"👟",label:"Bota de Oro",val:goleador==="Otro..."?goleadorCustom:goleador,color:"#3a5bd9"}].map(({icon,label,val,color})=>(
                    <div key={label} style={{background:val?"#00000005":"#ffffff02",border:`1px solid ${val?color+"30":"#00000008"}`,borderRadius:10,padding:"10px 12px"}}>
                      <div style={{fontSize:9,color:B.muted,marginBottom:4}}>{icon} {label}</div>
                      <div style={{fontSize:12,fontWeight:"bold",color:val?color:"#e8e8f5"}}>{val||"—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumen eliminatorias */}
            <div style={{background:"#f5f5f7",border:`1px solid ${B.border}`,borderRadius:12,padding:14,marginBottom:14}}>
              <div style={{fontSize:10,letterSpacing:3,color:B.primary,textTransform:"uppercase",marginBottom:10}}>Eliminatorias</div>
              {RONDAS.map(r=>{
                const ko=knockout[r.id]||[];
                const done=ko.filter(m=>m.ganador).length;
                const ganadores=ko.filter(m=>m.ganador).map(m=>m.ganador);
                return(
                  <div key={r.id} onClick={()=>setTab("knockout")} style={{padding:"8px 0",borderBottom:"1px solid #eeeeef",cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:ganadores.length?5:0}}>
                      <span style={{fontSize:16}}>{r.emoji}</span>
                      <span style={{fontSize:12,color:done===r.partidos?B.primary:B.muted,fontWeight:done===r.partidos?"bold":"normal"}}>{r.label}</span>
                      <span style={{marginLeft:"auto",fontSize:10,color:done===r.partidos?"#3a5bd9":B.muted}}>{done}/{r.partidos}</span>
                    </div>
                    {ganadores.length>0&&(
                      <div style={{display:"flex",flexWrap:"wrap",gap:4,paddingLeft:24}}>
                        {ganadores.map((g,i)=>(<span key={i} style={{fontSize:9,color:r.color,background:r.color+"15",border:`1px solid ${r.color}30`,borderRadius:10,padding:"1px 6px"}}>{g.split(" ").slice(0,2).join(" ")}</span>))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Resumen grupos */}
            {KEYS.map(g=>{
              const gr2=GRUPOS[g];const ms2=getMs(g);const tab2=calcTabla(gr2.equipos,gr2.partidos,ms2);
              const done=isDone(g);const filled=ms2.filter(m=>!isNaN(parseInt(m.local))&&m.local!=="").length;
              return(
                <div key={g} onClick={()=>{setGrupo(g);setTab("partidos");}} style={{background:"#ffffff",border:`1px solid ${done?gr2.color+"40":"#00000008"}`,borderRadius:10,padding:"9px 13px",marginBottom:7,cursor:"pointer"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:done?8:0}}>
                    <div style={{width:26,height:26,borderRadius:6,background:done?gr2.color:"#00000009",color:done?gr2.accent:"#e8e8f5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:"900"}}>{g}</div>
                    <div style={{fontSize:10,color:B.muted}}>{gr2.equipos.map(e=>e.split(" ").slice(1).join(" ")).join(" · ")}</div>
                    <span style={{marginLeft:"auto",fontSize:9,color:done?B.primary:"#e8e8f5"}}>{done?"✓":`${filled}/${gr2.partidos.length}`}</span>
                  </div>
                  {done&&(<div style={{display:"flex",gap:4}}>{tab2.map(([eq,st],i)=>(<div key={eq} style={{flex:1,textAlign:"center",background:i<2?gr2.color+"25":"#00000005",border:`1px solid ${i<2?gr2.color+"40":"#00000008"}`,borderRadius:6,padding:"4px 2px"}}><div style={{fontSize:8,color:i<2?gr2.accent:"#e8e8f5",marginBottom:1}}>{i+1}°</div><div style={{fontSize:9,color:i<2?B.text:"#e8e8f5",fontWeight:i<2?"bold":"normal"}}>{eq.split(" ").slice(1).join(" ").substring(0,7)}</div><div style={{fontSize:10,color:i<2?gr2.accent:"#e8e8f5",fontWeight:"bold"}}>{st.pts}pts</div></div>))}</div>)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
