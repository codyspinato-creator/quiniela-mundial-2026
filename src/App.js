import { useState, useEffect, useCallback } from "react";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { GRUPOS, KEYS, SELECCIONES, GOLEADORES, calcTabla, completionPct } from "./data";
import { calcTotalPoints } from "./scoring";
import Admin from "./Admin";

// ─── BRAND ───────────────────────────────────────────────────────────────────
const B = {
  primary:"#00cc00", primary2:"#009900", primaryDim:"#00cc0018",
  bg:"#050a05", card:"#090f09", border:"#00cc0020",
  text:"#e8f5e8", muted:"#5a7a5a",
  logoMF:"/logo-mundofutbol.png",
  logoMundial:"https://assets.football-logos.cc/logos/tournaments/256x256/fifa-world-cup-2026.31d2489d.png",
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
  { id:"final",label:"Final",         short:"FINAL",emoji:"🏆",  partidos:1,  color:"#00cc00" },
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
    <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:center?"center":"flex-start" }}>
      <img src={B.logoMF} alt="MundoFutbol" style={{ height:size, objectFit:"contain", filter:"drop-shadow(0 0 6px #00cc0050)" }} onError={e=>{ e.target.style.display="none"; }} />
      <div style={{ width:1, height:size*0.7, background:"#00cc0020" }} />
      <img src={B.logoMundial} alt="FIFA World Cup 2026" style={{ height:size*0.85, objectFit:"contain" }} onError={e=>{ e.target.style.display="none"; }} />
    </div>
  );
}

function calcTabla(equipos, partidos, marcadores) {
  const t = {};
  equipos.forEach(e => { t[e] = { pts:0, jj:0, gf:0, gc:0 }; });
  partidos.forEach((p, i) => {
    const m = marcadores[i];
    const gl = parseInt(m?.local), gv = parseInt(m?.visita);
    if (isNaN(gl)||isNaN(gv)) return;
    t[p.local].jj++; t[p.local].gf+=gl; t[p.local].gc+=gv;
    t[p.visita].jj++; t[p.visita].gf+=gv; t[p.visita].gc+=gl;
    if(gl>gv) t[p.local].pts+=3;
    else if(gl===gv){t[p.local].pts++;t[p.visita].pts++;}
    else t[p.visita].pts+=3;
  });
  return Object.entries(t).sort((a,b)=>{
    if(b[1].pts!==a[1].pts) return b[1].pts-a[1].pts;
    const da=a[1].gf-a[1].gc,db=b[1].gf-b[1].gc;
    if(db!==da) return db-da;
    return b[1].gf-a[1].gf;
  });
}

function completionPct(quiniela) {
  const totalP = KEYS.reduce((s,g)=>s+GRUPOS[g].partidos.length,0);
  const filled = KEYS.reduce((s,g)=>{
    const ms=(quiniela.scores||{})[g]||[];
    return s+GRUPOS[g].partidos.filter((_,i)=>{const m=ms[i];return m&&m.local!==""&&m.visita!==""&&!isNaN(parseInt(m.local))&&!isNaN(parseInt(m.visita));}).length;
  },0);
  const extras=[quiniela.campeon,quiniela.segundo,quiniela.tercero,quiniela.goleador].filter(Boolean).length;
  // knockout completion
  const ko = quiniela.knockout || {};
  let koFilled = 0, koTotal = 0;
  RONDAS.forEach(r=>{
    const matches = ko[r.id]||[];
    koTotal += r.partidos;
    matches.forEach(m=>{ if(m.ganador) koFilled++; });
  });
  return { partidos:filled, total:totalP, extras, pct:Math.round((filled/totalP)*100), koFilled, koTotal };
}

// ─── KNOCKOUT MATCH CARD ──────────────────────────────────────────────────────
function MatchCard({ match, idx, rondaColor, onChange }) {
  const { local, localGoles, visita, visitaGoles, ganador, penaltis, penaltisGanador } = match;
  const hasTeams = local && visita;
  const gl = parseInt(localGoles), gv = parseInt(visitaGoles);
  const hasScore = hasTeams && !isNaN(gl) && !isNaN(gv) && localGoles!=="" && visitaGoles!=="";
  const empate = hasScore && gl === gv;

  const upd = (field, val) => onChange(idx, { ...match, [field]: val });

  return (
    <div style={{
      background: B.card, border:`1px solid ${ganador ? rondaColor+"50" : "#ffffff08"}`,
      borderRadius:12, padding:"10px 12px", marginBottom:8,
      boxShadow: ganador ? `0 0 10px ${rondaColor}18` : "none",
    }}>
      <div style={{ fontSize:9, color:B.muted, marginBottom:7, display:"flex", justifyContent:"space-between" }}>
        <span>Partido {idx+1}</span>
        {ganador && <span style={{ color:rondaColor, fontWeight:"bold" }}>✓ {ganador.split(" ").slice(0,2).join(" ")}</span>}
      </div>

      {/* Equipo local */}
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
        <input
          value={local}
          onChange={e=>upd("local", e.target.value)}
          placeholder="Equipo local..."
          style={{ flex:1, background:"#ffffff08", border:`1px solid ${ganador===local&&local?"#00cc0060":"#ffffff12"}`, borderRadius:6, padding:"6px 8px", color:ganador===local&&local?B.primary:B.text, fontSize:11, outline:"none", fontWeight:ganador===local&&local?"bold":"normal" }}
        />
        <input
          type="number" min="0" max="20"
          value={localGoles}
          onChange={e=>upd("localGoles", e.target.value)}
          style={{ width:34, height:30, textAlign:"center", background:"#0d180d", border:`1px solid ${hasScore?rondaColor+"60":"#ffffff12"}`, borderRadius:6, color:hasScore?rondaColor:B.muted, fontSize:14, fontWeight:"bold", outline:"none" }}
        />
      </div>

      {/* Equipo visitante */}
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom: empate ? 8 : 0 }}>
        <input
          value={visita}
          onChange={e=>upd("visita", e.target.value)}
          placeholder="Equipo visitante..."
          style={{ flex:1, background:"#ffffff08", border:`1px solid ${ganador===visita&&visita?"#00cc0060":"#ffffff12"}`, borderRadius:6, padding:"6px 8px", color:ganador===visita&&visita?B.primary:B.text, fontSize:11, outline:"none", fontWeight:ganador===visita&&visita?"bold":"normal" }}
        />
        <input
          type="number" min="0" max="20"
          value={visitaGoles}
          onChange={e=>upd("visitaGoles", e.target.value)}
          style={{ width:34, height:30, textAlign:"center", background:"#0d180d", border:`1px solid ${hasScore?"#ffffff25":"#ffffff12"}`, borderRadius:6, color:hasScore?B.text:B.muted, fontSize:14, fontWeight:"bold", outline:"none" }}
        />
      </div>

      {/* Penaltis si hay empate */}
      {empate && (
        <div style={{ marginTop:8, padding:"6px 8px", background:"#ffffff05", borderRadius:8, border:"1px solid #ffffff10" }}>
          <div style={{ fontSize:9, color:B.muted, marginBottom:5 }}>🥅 Penaltis — ¿Quién avanza?</div>
          <div style={{ display:"flex", gap:6 }}>
            {[local, visita].filter(Boolean).map(eq=>(
              <button key={eq} onClick={()=>{ upd("penaltis",true); upd("penaltisGanador",eq); upd("ganador",eq); }}
                style={{ flex:1, padding:"5px 8px", borderRadius:7, border:`1px solid ${penaltisGanador===eq?"#00cc00":"#ffffff15"}`, background:penaltisGanador===eq?"#00cc0020":"#ffffff06", color:penaltisGanador===eq?B.primary:B.muted, fontSize:11, cursor:"pointer", fontWeight:penaltisGanador===eq?"bold":"normal" }}>
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
                style={{ flex:1, padding:"5px 8px", borderRadius:7, border:`1px solid ${ganador===eq?rondaColor:"#ffffff12"}`, background:ganador===eq?rondaColor+"25":"#ffffff06", color:ganador===eq?rondaColor:B.muted, fontSize:10, cursor:"pointer", fontWeight:ganador===eq?"bold":"normal" }}>
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
function KnockoutTab({ knockout, setKnockout }) {
  const [rondaActiva, setRondaActiva] = useState("r32");
  const ronda = RONDAS.find(r=>r.id===rondaActiva);

  const updateMatch = (rondaId, idx, newMatch) => {
    setKnockout(prev => {
      const arr = [...(prev[rondaId]||[])];
      arr[idx] = newMatch;
      return { ...prev, [rondaId]: arr };
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
                background:active?r.color+"22":"#ffffff06",
                color:active?r.color:done===r.partidos?"#4caf50":B.muted,
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
              {rondaActiva==="r32" && " · 32 equipos clasificados de fase de grupos"}
              {rondaActiva==="r16" && " · 16 ganadores de dieciseisavos"}
              {rondaActiva==="qf"  && " · 8 ganadores de octavos"}
              {rondaActiva==="sf"  && " · 4 ganadores de cuartos"}
              {rondaActiva==="final" && " · Los 2 mejores del mundo"}
              {rondaActiva==="third" && " · Los perdedores de semifinales"}
            </div>
          </div>
          {completedInRound===ronda.partidos && (
            <div style={{ marginLeft:"auto", fontSize:10, color:"#4caf50", background:"#4caf5015", border:"1px solid #4caf50", borderRadius:20, padding:"2px 8px" }}>✓ Completo</div>
          )}
        </div>
        {/* Mini progress */}
        <div style={{ height:3, background:"#ffffff08", borderRadius:2, overflow:"hidden", marginTop:10 }}>
          <div style={{ height:"100%", width:`${(completedInRound/ronda.partidos)*100}%`, background:ronda.color, transition:"width 0.3s", boxShadow:`0 0 6px ${ronda.color}80` }}/>
        </div>
      </div>

      {/* Instrucción especial r32 */}
      {rondaActiva==="r32" && (
        <div style={{ background:"#ffffff06", border:"1px solid #ffffff10", borderRadius:10, padding:"9px 12px", marginBottom:12, fontSize:11, color:B.muted, lineHeight:1.5 }}>
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
        <div style={{ marginTop:14, background:"#060e06", border:`1px solid ${ronda.color}30`, borderRadius:12, padding:"10px 14px" }}>
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
        <div style={{ marginTop:14, background:"linear-gradient(135deg,#060e06,#0a180a)", border:`2px solid ${B.primary}`, borderRadius:14, padding:"16px", textAlign:"center", boxShadow:`0 0 30px ${B.primary}25` }}>
          <div style={{ fontSize:36, marginBottom:6 }}>🏆</div>
          <div style={{ fontSize:12, color:B.muted, marginBottom:4 }}>¡CAMPEÓN DEL MUNDO 2026!</div>
          <div style={{ fontSize:20, fontWeight:"bold", color:B.primary }}>{matches[0].ganador}</div>
        </div>
      )}

      {/* Navegación entre rondas */}
      <div style={{ display:"flex", gap:8, marginTop:14 }}>
        {RONDAS.indexOf(ronda) > 0 && (
          <button onClick={()=>setRondaActiva(RONDAS[RONDAS.indexOf(ronda)-1].id)} style={{ flex:1, padding:8, borderRadius:9, border:"1px solid #0a1a0a", background:"#0a140a", color:B.muted, fontSize:12, cursor:"pointer" }}>
            ← {RONDAS[RONDAS.indexOf(ronda)-1].label}
          </button>
        )}
        {RONDAS.indexOf(ronda) < RONDAS.length-1 && (
          <button onClick={()=>setRondaActiva(RONDAS[RONDAS.indexOf(ronda)+1].id)} style={{ flex:1, padding:8, borderRadius:9, border:"none", background:ronda.color, color:"#000", fontSize:12, fontWeight:"bold", cursor:"pointer" }}>
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

  // ── Auth / Save / Load ────────────────────────────────────────────────────
  const handleLogin=async()=>{
    const name=loginInput.trim();
    if(!name||name.length<2){setLoginError("Escribe al menos 2 caracteres");return;}
    const id=name.toLowerCase().replace(/[^a-z0-9]/gi,"_").substring(0,24);
    setMyId(id); setMyNombre(name);
    try{
      const snap=await getDoc(doc(db,"quinielas",id));
      if(snap.exists()){
        const d=snap.data();
        setScores(d.scores||{}); setCampeon(d.campeon||""); setSegundo(d.segundo||"");
        setTercero(d.tercero||""); setGoleador(d.goleador||""); setGoleadorCustom(d.goleadorCustom||"");
        setKnockout(d.knockout||emptyKnockout());
      }
    }catch(e){}
    setLoginError(""); setScreen("quiniela");
  };

  const saveQuiniela=async()=>{
    setSaving(true); setSaveMsg("");
    try{
      await setDoc(doc(db,"quinielas",myId),{
        nombre:myNombre, scores, campeon, segundo, tercero,
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
  const tagStyle=(on,color)=>({fontSize:10,background:on?color+"18":"#ffffff05",border:`1px solid ${on?color:"#ffffff10"}`,color:on?color:B.muted,borderRadius:20,padding:"2px 8px"});
  const btnStyle=(active,color)=>({padding:"5px 10px",borderRadius:18,fontSize:11,border:`1px solid ${active?color:"#ffffff10"}`,background:active?color+"20":"#ffffff05",color:active?color:B.muted,cursor:"pointer",fontWeight:active?"bold":"normal",transition:"all 0.15s"});

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
        <div style={{textAlign:"center",marginBottom:28}}>
          <Logos size={54} center />
          <div style={{marginTop:14,fontSize:9,letterSpacing:5,color:B.primary,textTransform:"uppercase"}}>Copa del Mundo 2026</div>
          <div style={{fontSize:22,fontWeight:"bold",color:B.text,marginTop:4}}>Quiniela Oficial</div>
          <div style={{fontSize:11,color:B.muted,marginTop:2}}>Predice · Compite · Gana</div>
        </div>
        <div style={{background:B.card,border:`1px solid ${B.border}`,borderRadius:16,padding:24,boxShadow:`0 0 40px ${B.primary}12`}}>
          <div style={{fontSize:12,color:B.muted,marginBottom:8}}>¿Cómo te llamas?</div>
          <input autoFocus value={loginInput} onChange={e=>setLoginInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="Tu nombre o alias..." style={{width:"100%",background:"#ffffff07",border:`1px solid ${B.border}`,borderRadius:8,padding:"10px 12px",color:B.text,fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
          {loginError&&<div style={{fontSize:11,color:"#f44336",marginBottom:8}}>{loginError}</div>}
          <button onClick={handleLogin} style={{width:"100%",padding:12,borderRadius:9,border:"none",background:`linear-gradient(135deg,${B.primary},${B.primary2})`,color:"#000",fontWeight:"bold",fontSize:14,cursor:"pointer",boxShadow:`0 4px 20px ${B.primary}30`}}>Entrar a mi Quiniela →</button>
          <div style={{textAlign:"center",marginTop:14,display:"flex",gap:16,justifyContent:"center"}}>
            <button onClick={()=>setScreen("portal")} style={{background:"transparent",border:"none",color:B.muted,fontSize:11,cursor:"pointer",textDecoration:"underline"}}>👥 Ver quinielas de todos</button>
            <button onClick={()=>setScreen("admin")} style={{background:"transparent",border:"none",color:"#f59e0b",fontSize:11,cursor:"pointer",textDecoration:"underline"}}>🔐 Admin</button>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:14,fontSize:10,color:"#1a2a1a"}}>Usa el mismo nombre para recuperar tu quiniela</div>
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
        <div style={{minHeight:"100vh",background:B.bg,color:B.text,fontFamily:"Georgia,serif"}}>
          <div style={{background:"#060d06",borderBottom:`2px solid ${B.primary}`,padding:"10px 14px",position:"sticky",top:0,zIndex:100}}>
            <div style={{maxWidth:560,margin:"0 auto",display:"flex",alignItems:"center",gap:10}}>
              <button onClick={()=>setSelectedUser(null)} style={{background:"#ffffff08",border:"none",borderRadius:8,padding:"6px 10px",color:"#aaa",cursor:"pointer",fontSize:12}}>← Volver</button>
              <div><div style={{fontSize:8,color:B.primary,letterSpacing:3}}>QUINIELA DE</div><div style={{fontSize:15,fontWeight:"bold"}}>{q.nombre}</div></div>
              <div style={{marginLeft:"auto",textAlign:"right"}}><div style={{fontSize:9,color:B.muted}}>Grupos</div><div style={{fontSize:14,fontWeight:"bold",color:qc.pct===100?B.primary:B.muted}}>{qc.pct}%</div></div>
            </div>
          </div>
          <div style={{maxWidth:560,margin:"0 auto",padding:"14px 12px 40px"}}>
            <div style={{background:"#080d08",border:`1px solid ${B.border}`,borderRadius:12,padding:14,marginBottom:14}}>
              <div style={{fontSize:10,letterSpacing:3,color:B.primary,textTransform:"uppercase",marginBottom:12}}>Predicciones Especiales</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[{icon:"🥇",label:"Campeón",val:q.campeon,color:B.primary},{icon:"🥈",label:"Subcampeón",val:q.segundo,color:"#888"},{icon:"🥉",label:"3er Lugar",val:q.tercero,color:"#a07040"},{icon:"👟",label:"Bota de Oro",val:q.goleador==="Otro..."?q.goleadorCustom:q.goleador,color:"#4caf50"}].map(({icon,label,val,color})=>(
                  <div key={label} style={{background:val?"#ffffff04":"#ffffff02",border:`1px solid ${val?color+"35":"#ffffff07"}`,borderRadius:10,padding:"10px 12px"}}>
                    <div style={{fontSize:9,color:B.muted,marginBottom:4}}>{icon} {label}</div>
                    <div style={{fontSize:12,fontWeight:"bold",color:val?color:"#2a4a2a"}}>{val||"—"}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Eliminatorias resumen */}
            <div style={{background:"#080d08",border:`1px solid ${B.border}`,borderRadius:12,padding:14,marginBottom:14}}>
              <div style={{fontSize:10,letterSpacing:3,color:B.primary,textTransform:"uppercase",marginBottom:10}}>Eliminatorias</div>
              {RONDAS.map(r=>{
                const ko=(q.knockout||{})[r.id]||[];
                const done=ko.filter(m=>m.ganador).length;
                return(
                  <div key={r.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid #ffffff05"}}>
                    <span style={{fontSize:14}}>{r.emoji}</span>
                    <span style={{fontSize:11,color:B.muted,flex:1}}>{r.label}</span>
                    <span style={{fontSize:10,color:done===r.partidos?"#4caf50":B.muted}}>{done}/{r.partidos}</span>
                  </div>
                );
              })}
            </div>
            {KEYS.map(g=>{
              const gr2=GRUPOS[g];const ms2=GRUPOS[g].partidos.map((_,i)=>(q.scores||{})[g]?.[i]||{local:"",visita:""});
              const tab2=calcTabla(gr2.equipos,gr2.partidos,ms2);
              const done=ms2.every(m=>!isNaN(parseInt(m.local))&&m.local!==""&&!isNaN(parseInt(m.visita))&&m.visita!=="");
              return(
                <div key={g} style={{background:done?B.card:"#060806",border:`1px solid ${done?gr2.color+"45":"#ffffff07"}`,borderRadius:10,padding:"9px 13px",marginBottom:7}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:done?8:0}}>
                    <div style={{width:26,height:26,borderRadius:6,background:done?gr2.color:"#ffffff0a",color:done?gr2.accent:"#2a4a2a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:"900"}}>{g}</div>
                    <div style={{fontSize:10,color:B.muted}}>{gr2.equipos.map(e=>e.split(" ").slice(1).join(" ")).join(" · ")}</div>
                    <span style={{marginLeft:"auto",fontSize:9,color:done?B.primary:"#2a4a2a"}}>{done?"✓":"pendiente"}</span>
                  </div>
                  {done&&(<div style={{display:"flex",gap:4}}>{tab2.map(([eq,st],i)=>(<div key={eq} style={{flex:1,textAlign:"center",background:i<2?gr2.color+"25":"#ffffff04",border:`1px solid ${i<2?gr2.color+"40":"#ffffff06"}`,borderRadius:6,padding:"4px 2px"}}><div style={{fontSize:8,color:i<2?gr2.accent:"#1a3a1a",marginBottom:1}}>{i+1}°</div><div style={{fontSize:9,color:i<2?B.text:"#1a3a1a",fontWeight:i<2?"bold":"normal"}}>{eq.split(" ").slice(1).join(" ").substring(0,7)}</div><div style={{fontSize:10,color:i<2?gr2.accent:"#1a3a1a",fontWeight:"bold"}}>{st.pts}pts</div></div>))}</div>)}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return(
      <div style={{minHeight:"100vh",background:B.bg,color:B.text,fontFamily:"Georgia,serif"}}>
        <div style={{background:"#060d06",borderBottom:`2px solid ${B.primary}`,padding:"10px 14px",position:"sticky",top:0,zIndex:100}}>
          <div style={{maxWidth:560,margin:"0 auto",display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setScreen(myId?"quiniela":"login")} style={{background:"#ffffff08",border:"none",borderRadius:8,padding:"6px 10px",color:"#aaa",cursor:"pointer",fontSize:12}}>← {myId?"Mi quiniela":"Inicio"}</button>
            <Logos size={26} />
            <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:11,color:B.muted}}>{portalData.length} participantes</span>
              <button onClick={loadPortal} style={{background:"#ffffff08",border:"none",borderRadius:6,padding:"5px 8px",color:"#aaa",cursor:"pointer",fontSize:13}}>{portalLoading?"⏳":"↻"}</button>
            </div>
          </div>
        </div>
        <div style={{maxWidth:560,margin:"0 auto",padding:"14px 12px 40px"}}>
          {portalLoading&&<div style={{textAlign:"center",padding:40,color:B.muted}}><div style={{fontSize:28,marginBottom:8}}>⏳</div>Cargando...</div>}
          {!portalLoading&&portalData.length===0&&(<div style={{textAlign:"center",padding:40}}><div style={{fontSize:40,marginBottom:12}}>🏜️</div><div style={{fontSize:14,color:B.muted,marginBottom:8}}>Aún no hay quinielas guardadas</div><button onClick={()=>setScreen(myId?"quiniela":"login")} style={{padding:"9px 20px",borderRadius:9,border:"none",background:B.primary,color:"#000",fontWeight:"bold",fontSize:13,cursor:"pointer"}}>{myId?"Ir a mi quiniela":"Crear quiniela"}</button></div>)}
          {!portalLoading&&portalData.length>0&&(
            <>
              <div style={{background:B.card,border:`1px solid ${B.border}`,borderRadius:12,padding:14,marginBottom:16}}>
                <div style={{fontSize:10,letterSpacing:3,color:B.primary,textTransform:"uppercase",marginBottom:12}}>Estadísticas del grupo</div>
                {(()=>{
                  const cc={},gc={};
                  portalData.forEach(q=>{if(q.campeon)cc[q.campeon]=(cc[q.campeon]||0)+1;const g=q.goleador==="Otro..."?q.goleadorCustom:q.goleador;if(g)gc[g]=(gc[g]||0)+1;});
                  const topC=Object.entries(cc).sort((a,b)=>b[1]-a[1]).slice(0,3);
                  const topG=Object.entries(gc).sort((a,b)=>b[1]-a[1])[0];
                  return(<div>
                    <div style={{fontSize:11,color:B.muted,marginBottom:6}}>🏆 Campeón más elegido</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{topC.map(([sel,n])=>(<div key={sel} style={{background:B.primaryDim,border:`1px solid ${B.primary}35`,borderRadius:8,padding:"5px 10px",display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}>{sel.split(" ")[0]}</span><span style={{fontSize:11,color:B.primary,fontWeight:"bold"}}>{sel.split(" ").slice(1).join(" ")}</span><span style={{fontSize:10,color:B.muted,background:"#ffffff0d",borderRadius:10,padding:"1px 5px"}}>{n}</span></div>))}</div>
                    {topG&&<div style={{fontSize:11,color:B.muted}}>👟 Goleador favorito: <span style={{color:"#4caf50",fontWeight:"bold"}}>{topG[0]}</span> <span style={{color:"#2a4a2a"}}>({topG[1]} votos)</span></div>}
                  </div>);
