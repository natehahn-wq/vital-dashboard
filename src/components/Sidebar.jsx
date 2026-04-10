// Desktop sidebar — VITAL nav (primary + collapsible "More"), data-source
// status footer, profile button (opens UserModal), and a privacy footer link.
import { useState } from "react";
import { P, FF, S } from "../lib/theme.js";
import { NAV_PRIMARY, NAV_MORE } from "../lib/data/nav.js";
import { UserModal } from "./UserModal.jsx";

export function Sidebar({active,set,peloConnected,theme,setTheme}){
  const [showProfile, setShowProfile] = useState(false);
  const [showMore,setShowMore]=useState(false);
  return(<>
    {showProfile&&<UserModal onClose={()=>setShowProfile(false)} theme={theme} setTheme={setTheme}/>}
    <div style={{width:200,flexShrink:0,background:P.card,borderRight:`1px solid ${P.border}`,display:"flex",flexDirection:"column",height:"100vh",position:"sticky",top:0}}>
    <div style={{padding:"22px 20px 18px",borderBottom:`1px solid ${P.border}`}}>
      <div style={S.row10}>
        <div style={{width:30,height:30,borderRadius:"50%",background:P.cardDk,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>
          <span style={{color:P.textInv}}>♥</span>
        </div>
        <div>
          <div style={{fontFamily:FF.r,fontWeight:700,fontSize:15,color:P.text,letterSpacing:"0.06em",lineHeight:1}}>VITAL</div>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginTop:1}}>Health OS</div>
        </div>
      </div>
    </div>
    <div style={{padding:"12px 10px",flex:1,overflowY:"auto"}}>
      {NAV_PRIMARY.map((n)=>{
      const on=active===n.id;
      const accent=n.id==="today"?P.amber:n.id==="score"?P.terra:n.id==="fitness"?P.sage:n.id==="labs"?P.terra:n.id==="body"?P.clay:n.id==="peloton"?P.terra:P.sage;
      const flagDot=n.id==="labs";
      return(<div key={n.id} onClick={()=>set(n.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",borderRadius:10,marginBottom:1,cursor:"pointer",transition:"all .15s",background:on?`${accent}12`:"transparent"}}
        onMouseEnter={e=>{if(!on)e.currentTarget.style.background=P.panel}}
        onMouseLeave={e=>{if(!on)e.currentTarget.style.background="transparent"}}>
          <span style={{fontSize:13,lineHeight:1,opacity:on?1:.5}}>{n.icon}</span>
          <span style={{fontFamily:FF.s,fontSize:12,fontWeight:on?600:400,color:on?P.text:P.sub,flex:1}}>{n.label}</span>
          {flagDot&&<div style={{width:6,height:6,borderRadius:"50%",background:P.terra}}/>}
          {on&&!flagDot&&<div style={{width:5,height:5,borderRadius:"50%",background:accent}}/>}
        </div>);
    })}
      <div onClick={()=>setShowMore(!showMore)} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",borderRadius:10,marginTop:6,marginBottom:1,cursor:"pointer",transition:"all .15s",opacity:.6}}
        onMouseEnter={e=>{e.currentTarget.style.background=P.panel}}
        onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}>
        <span style={{fontSize:13,lineHeight:1}}>{showMore?"▴":"▾"}</span>
        <span style={{fontFamily:FF.s,fontSize:11,fontWeight:500,color:P.sub}}>More</span>
      </div>
      {showMore&&<div style={{marginTop:2}}>
        {NAV_MORE.map((n)=>{
      const on=active===n.id;
      const accent=n.id==="today"?P.amber:n.id==="score"?P.terra:n.id==="fitness"?P.sage:n.id==="labs"?P.terra:n.id==="body"?P.clay:n.id==="peloton"?P.terra:P.sage;
      const flagDot=n.id==="labs";
      return(<div key={n.id} onClick={()=>set(n.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",borderRadius:10,marginBottom:1,cursor:"pointer",transition:"all .15s",background:on?`${accent}12`:"transparent"}}
        onMouseEnter={e=>{if(!on)e.currentTarget.style.background=P.panel}}
        onMouseLeave={e=>{if(!on)e.currentTarget.style.background="transparent"}}>
          <span style={{fontSize:13,lineHeight:1,opacity:on?1:.5}}>{n.icon}</span>
          <span style={{fontFamily:FF.s,fontSize:12,fontWeight:on?600:400,color:on?P.text:P.sub,flex:1}}>{n.label}</span>
          {flagDot&&<div style={{width:6,height:6,borderRadius:"50%",background:P.terra}}/>}
          {on&&!flagDot&&<div style={{width:5,height:5,borderRadius:"50%",background:accent}}/>}
        </div>);
    })}
      </div>}
    </div>
    <div style={{padding:"14px 16px",borderTop:`1px solid ${P.border}`}}>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Data Sources</div>
      {[
        {l:"WHOOP",       d:P.amber, s:"CSV loaded"},
        {l:"Styku",       d:P.sage,  s:"2 scans"},
        {l:"BioLab",      d:P.terra, s:"May '25"},
        {l:"CardioCoach", d:P.steel, s:"RMR"},
      ].map(({l,d,s})=>(
        <div key={l} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:d}}/>
            <span style={S.sub10}>{l}</span>
          </div>
          <span style={S.mut9}>{s}</span>
        </div>
      ))}
    </div>
    <div onClick={()=>setShowProfile(true)} style={{padding:"12px 16px",borderTop:`1px solid ${P.border}`,cursor:"pointer",transition:"background .15s"}}
      onMouseEnter={e=>e.currentTarget.style.background=P.panel}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
      <div style={S.row10}>
        <div style={{width:32,height:32,borderRadius:"50%",background:P.cardDk,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FF.r,fontWeight:600,fontSize:13,color:P.textInv,flexShrink:0}}>N</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:FF.s,fontWeight:600,fontSize:11,color:P.text}}>Nate Hahn</div>
          <div style={S.mut9}>47 · Male · Montecito</div>
        </div>
        <div style={{fontFamily:FF.s,fontSize:11,color:P.muted}}>⚙</div>
      </div>
    </div>

    {/* Privacy footer */}
    <div style={{padding:"10px 16px",borderTop:`1px solid ${P.border}`}}>
      <a href="https://www.privacypolicies.com/live/generic" target="_blank" rel="noopener noreferrer"
        style={{fontFamily:FF.s,fontSize:9,color:P.muted,textDecoration:"none",
          letterSpacing:"0.04em",display:"flex",alignItems:"center",gap:4,opacity:0.6}}
        onMouseEnter={e=>e.currentTarget.style.opacity="1"}
        onMouseLeave={e=>e.currentTarget.style.opacity="0.6"}>
        <span style={{fontSize:10}}>🔒</span> Privacy Policy
      </a>
    </div>
  </div>
  </>);
}
