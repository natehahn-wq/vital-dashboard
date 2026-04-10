// Insights page — drag-and-drop document analyzer that posts uploaded files
// to /api/proxy (Claude) with the AI_P prompt and renders the structured result.
import { useState, useRef } from "react";
import { P, FF } from "../lib/theme.js";
import { AI_P } from "../lib/data/prompts.js";
import { BioCard } from "../components/shared.jsx";

export function Insights(){
  const [docs,setDocs]=useState([]);const[drag,setDrag]=useState(false);const ref=useRef();
  const analyze=async(file)=>{
    const entry={id:Date.now(),name:file.name,date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),status:"analyzing",result:null};
    setDocs(d=>[entry,...d]);
    try{
      let content;
      if(file.type==="application/pdf"||file.type.startsWith("image/")){const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});content=[{type:file.type==="application/pdf"?"document":"image",source:{type:"base64",media_type:file.type,data:b64}},{type:"text",text:AI_P}];}
      else{const t=await file.text();content=[{type:"text",text:`${AI_P}\n\nFILE: ${file.name}\n\n${t}`}];}
      const res=await fetch("/api/proxy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,messages:[{role:"user",content}]})});
      const data=await res.json();const raw=data.content?.find(b=>b.type==="text")?.text||"";
      let parsed;try{parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());}catch{parsed={summary:raw,biomarkers:[],insights:[],recommendations:[]};}
      setDocs(d=>d.map(doc=>doc.id===entry.id?{...doc,status:"done",result:parsed}:doc));
    }catch{setDocs(d=>d.map(doc=>doc.id===entry.id?{...doc,status:"error",result:{summary:"Analysis failed.",biomarkers:[],insights:[],recommendations:[]}}:doc));}
  };
  const onFiles=f=>Array.from(f).forEach(analyze);const sc=s=>s==="done"?P.green:s==="error"?P.coral:P.amber;
  return(<div style={{display:"flex",flexDirection:"column",gap:13}}>
    <div style={{padding:"11px 14px",background:`${P.cyan}08`,borderRadius:9,border:`1px solid ${P.cyan}33`,fontFamily:FF.s,fontSize:11,color:P.sub,lineHeight:1.6}}>
      💡 Upload any health document — lab reports, Styku scans, RMR tests, DXA, VO₂ max, WHOOP exports — and Claude will extract biomarkers and generate personalized clinical insights for Nate.
    </div>
    <div onClick={()=>ref.current?.click()} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);onFiles(e.dataTransfer.files);}} style={{border:`1.5px dashed ${drag?P.cyan:P.border}`,borderRadius:14,padding:"36px 20px",textAlign:"center",cursor:"pointer",transition:"all .2s",background:drag?`${P.cyan}08`:P.card}}>
      <input ref={ref} type="file" multiple accept=".pdf,.txt,.csv,.png,.jpg,.jpeg" style={{display:"none"}} onChange={e=>onFiles(e.target.files)}/>
      <div style={{fontSize:32,marginBottom:10}}>🔬</div>
      <div style={{fontFamily:FF.s,fontWeight:800,fontSize:14,color:P.text,marginBottom:5}}>Upload Health Document</div>
      <div style={{fontFamily:FF.s,fontSize:11,color:P.sub,lineHeight:1.6}}>Lab panels · Styku scans · DXA · VO₂ max · RMR · WHOOP exports</div>
      <div style={{marginTop:12,display:"inline-flex",gap:7,padding:"7px 16px",borderRadius:8,border:`1px solid ${P.border}`,background:P.panel,fontFamily:FF.s,fontSize:11,color:P.sub}}>↑ Browse or drag & drop</div>
    </div>
    {docs.map(doc=>(
      <div key={doc.id} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"17px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:13}}>
          <div><div style={{fontFamily:FF.s,fontWeight:700,fontSize:13,color:P.text}}>{doc.name}</div><div style={{fontFamily:FF.s,fontSize:10,color:P.muted,marginTop:2}}>{doc.date}</div></div>
          <div style={{padding:"3px 10px",borderRadius:99,border:`1px solid ${sc(doc.status)}44`,background:sc(doc.status)+"15",fontFamily:FF.s,fontSize:10,fontWeight:700,color:sc(doc.status)}}>{doc.status==="done"?"Complete":doc.status==="error"?"Error":"Analyzing…"}</div>
        </div>
        {doc.status==="analyzing"&&<div style={{padding:"14px",textAlign:"center",fontFamily:FF.s,fontSize:12,color:P.muted}}>Running clinical analysis…</div>}
        {doc.result&&doc.status!=="analyzing"&&(<div>
          {doc.result.summary&&<div style={{fontFamily:FF.s,fontSize:12,color:P.sub,lineHeight:1.7,marginBottom:14,padding:"12px 14px",background:P.panel,borderRadius:8,border:`1px solid ${P.border}`}}>{doc.result.summary}</div>}
          {doc.result.biomarkers?.length>0&&(<div style={{marginBottom:14}}><div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:P.muted,marginBottom:9}}>Biomarkers</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8}}>{doc.result.biomarkers.map((b,i)=><BioCard key={i} {...b}/>)}</div></div>)}
          {doc.result.insights?.length>0&&(<div style={{marginBottom:12}}><div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:P.muted,marginBottom:8}}>Insights</div>{doc.result.insights.map((ins,i)=><div key={i} style={{display:"flex",gap:9,marginBottom:6}}><span style={{color:P.cyan,fontWeight:700,fontSize:12,lineHeight:1.5}}>·</span><span style={{fontFamily:FF.s,fontSize:12,color:P.sub,lineHeight:1.6}}>{ins}</span></div>)}</div>)}
          {doc.result.recommendations?.length>0&&(<div><div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:P.muted,marginBottom:8}}>Recommendations</div>{doc.result.recommendations.map((r,i)=><div key={i} style={{display:"flex",gap:9,marginBottom:6}}><span style={{color:P.green,fontWeight:700,fontSize:12,lineHeight:1.5}}>→</span><span style={{fontFamily:FF.s,fontSize:12,color:P.sub,lineHeight:1.6}}>{r}</span></div>)}</div>)}
        </div>)}
      </div>
    ))}
    {docs.length===0&&<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"24px",textAlign:"center",color:P.muted,fontFamily:FF.s,fontSize:12}}>No documents analyzed yet.</div>}
  </div>);
}
