// AI export / import page — copy-paste prompt builder for downstream LLM analysis.
import { useState, useEffect, useRef } from "react";
import { P, FF, S, CS } from "../lib/theme.js";
import { SLabel } from "../components/shared.jsx";
import { DXA, HUME_DATA, RMR, LATEST } from "../lib/data/body.js";
import { WHOOP } from "../lib/data/whoop.js";
import { CAL_RICH } from "../lib/data/calendar.js";
import { LAB_FRESHNESS, LAB_OVERDUE, LAB_DUE_SOON, TODAY_DATE } from "../lib/data/labs.js";
import { IMPORT_PROMPT } from "../lib/data/prompts.js";

export function ImportPage(){
  const [uploads, setUploads] = useState([]);
  const [drag,    setDrag]    = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [hasImportedData, setHasImportedData] = useState(()=>{
    try{ return !!(localStorage.getItem("vital_hume_imported")||localStorage.getItem("vital_peloton_v1")); }catch(e){ return false; }
  });

  // Check for existing imported Hume data
  const [importedHumeSummary, setImportedHumeSummary] = useState(()=>{
    try {
      const d = localStorage.getItem("vital_hume_imported");
      if(!d) return null;
      const arr = JSON.parse(d);
      if(!Array.isArray(arr) || arr.length === 0) return null;
      return { count: arr.length, latest: arr[0], oldest: arr[arr.length-1] };
    } catch(e){ return null; }
  });

  const clearHumeData = () => {
    try { localStorage.removeItem("vital_hume_imported"); } catch(e){}
    setImportedHumeSummary(null);
  };

  const fileRef = useRef();
  // File type detector
  const getFileIcon = (file) => {
    if(file.type==="application/pdf")     return "📄";
    if(file.type.startsWith("image/"))    return "🖼";
    if(file.name.endsWith(".csv"))        return "📊";
    if(file.name.endsWith(".xml"))        return "🗂";
    if(file.name.endsWith(".json"))       return "⚙";
    return "📁";
  };

  const getFileTypeLabel = (file) => {
    if(file.type==="application/pdf")     return "PDF";
    if(file.type.startsWith("image/"))    return file.type.split("/")[1].toUpperCase();
    if(file.name.endsWith(".csv"))        return "CSV";
    if(file.name.endsWith(".xml"))        return "XML";
    if(file.name.endsWith(".json"))       return "JSON";
    return "File";
  };

  const updateProgress = (id, step, pct) => {
    setUploads(u => u.map(x => x.id===id ? {...x, progressStep:step, progress:pct} : x));
  };

  const analyzeFile = async (file) => {
    const entry = {
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size > 1024*1024
        ? (file.size/1024/1024).toFixed(1) + " MB"
        : Math.round(file.size/1024) + " KB",
      date: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
      fileIcon: getFileIcon(file),
      fileTypeLabel: getFileTypeLabel(file),
      status: "queued",   // queued → reading → sending → analyzing → done/error
      progress: 0,
      progressStep: "Queued",
      result: null,
      raw: null,
    };
    // Show immediately on drop/select
    setUploads(u => [entry, ...u]);

   
    await new Promise(r => setTimeout(r, 60));
    updateProgress(entry.id, "Reading file…", 12);

    try {
      let content;
      const isPDF   = file.type === "application/pdf";
      const isImage = file.type.startsWith("image/");
      const isCSV   = file.name.endsWith(".csv") || file.type === "text/csv";
      const isXML   = file.name.endsWith(".xml");
            // Peloton CSV — parse locally, no AI needed
      const isPelotonFile = file.name.toLowerCase().includes("workout") && file.name.endsWith(".csv");
      if(isPelotonFile){
        updateProgress(entry.id, "Parsing Peloton CSV…", 30);
        const peloText = await file.slice(0, 10000000).text();
        const peloLines = peloText.trim().split("\n");
        const peloHeader = peloLines[0].split(",").map(h=>h.replace(/"/g,"").trim().toLowerCase());
        const isPelo = peloHeader.some(h=>h.includes("fitness discipline"))||peloHeader.some(h=>h.includes("total output"));
        if(isPelo){
          const pcol = (name) => peloHeader.findIndex(h=>h.includes(name));
          const piDate=pcol("workout timestamp"),piDisc=pcol("fitness discipline"),piType=pcol("type"),piTitle=pcol("title");
          const piOutput=pcol("total output"),piAvgW=pcol("avg. watts"),piMaxW=pcol("max watts");
          const piAvgRes=pcol("avg. resistance"),piAvgCad=pcol("avg. cadence"),piAvgSpd=pcol("avg. speed");
          const piDist=pcol("distance"),piCal=pcol("calories burned"),piAvgHR=pcol("avg. heartrate");
          const piMaxHR=pcol("max heartrate"),piInst=pcol("instructor name");
          const piDur=pcol("length")>=0?pcol("length"):pcol("duration");
          const peloRows = [];
          for(const pline of peloLines.slice(1).filter(l=>l.trim())){
            const pcols=[];let pcur="",pinQ=false;
            for(const ch of pline){if(ch==='"'){pinQ=!pinQ;}else if(ch===","&&!pinQ){pcols.push(pcur);pcur="";}else{pcur+=ch;}}
            pcols.push(pcur);
            const pget=(i)=>i>=0&&i<pcols.length?(pcols[i]||"").replace(/"/g,"").trim():"";
            const dateRaw=pget(piDate);if(!dateRaw)continue;
            const dm=dateRaw.match(/(\d{4})-(\d{2})-(\d{2})/);const dateKey=dm?`${dm[1]}-${dm[2]}-${dm[3]}`:"";if(!dateKey)continue;
            peloRows.push({dateKey,discipline:pget(piDisc),type:pget(piType),title:pget(piTitle),output:parseFloat(pget(piOutput))||0,avgWatts:parseFloat(pget(piAvgW))||0,maxWatts:parseFloat(pget(piMaxW))||0,avgResistance:parseFloat(pget(piAvgRes))||0,avgCadence:parseFloat(pget(piAvgCad))||0,avgSpeed:parseFloat(pget(piAvgSpd))||0,distance:parseFloat(pget(piDist))||0,calories:parseInt(pget(piCal))||0,avgHR:parseInt(pget(piAvgHR))||0,maxHR:parseInt(pget(piMaxHR))||0,duration:parseFloat(pget(piDur))||0,instructor:pget(piInst),source:"peloton_csv"});
          }
          localStorage.setItem("vital_peloton_v1", JSON.stringify(peloRows));
          updateProgress(entry.id, "Merging with WHOOP…", 70);
          try{const calRichRaw=localStorage.getItem("vital_cal_rich")||localStorage.getItem("vital_whoop_cal_rich");if(calRichRaw){const calRich=JSON.parse(calRichRaw);const catMap={cycling:"spin",running:"running",walking:"walking",strength:"functional fitness",yoga:"yoga",meditation:"meditation",cardio:"cardio"};const overlay={};for(const r of peloRows){if(!r.dateKey)continue;const cat=catMap[r.discipline.toLowerCase()]||r.discipline.toLowerCase()||"other";const sessions=calRich[r.dateKey];if(sessions&&sessions.length){overlay[r.dateKey]=overlay[r.dateKey]||{};overlay[r.dateKey][cat]={distance:r.distance,avgPace:r.avgSpeed>0?(60/r.avgSpeed):0,avgSpeed:r.avgSpeed,output:r.output,avgWatts:r.avgWatts,maxWatts:r.maxWatts,avgCadence:r.avgCadence,avgResistance:r.avgResistance,peloTitle:r.title,peloInst:r.instructor,duration:r.duration,source:"peloton"};}}localStorage.setItem("vital_cal_rich_overlay",JSON.stringify(overlay));}}catch(e){console.warn("Peloton overlay merge error:",e);}
          setUploads(u=>u.map(x=>x.id===entry.id?{...x,status:"done",progress:100,progressStep:"Complete",result:{summary:`Peloton: ${peloRows.length} workouts imported. ${peloRows.filter(r=>r.output>0).length} with power data.`,biomarkers:[],insights:[],recommendations:[]}}:x));
          return;
        }
      }



      if (isPDF || isImage) {
        const b64 = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload  = () => { res(r.result.split(",")[1]); };
          r.onerror = rej;
          r.readAsDataURL(file);
        });
        updateProgress(entry.id, "Encoding document…", 30);
        content = [
          { type: isPDF ? "document" : "image", source: { type: "base64", media_type: file.type, data: b64 } },
          { type: "text", text: IMPORT_PROMPT },
        ];
      } else if (isCSV || isXML) {
        const slice = file.slice(0, 51200);
        const text  = await slice.text();
        updateProgress(entry.id, "Parsing data…", 30);
        content = [{ type: "text", text: `${IMPORT_PROMPT}\n\nFILE: ${file.name}\n\n${text}` }];
      } else {
        const text = await file.text();
        updateProgress(entry.id, "Reading text…", 30);
        content = [{ type: "text", text: `${IMPORT_PROMPT}\n\nFILE: ${file.name}\n\n${text}` }];
      }

      updateProgress(entry.id, "Sending to Claude…", 48);
      setUploads(u => u.map(x => x.id===entry.id ? {...x, status:"analyzing"} : x));

     
      let fake = 48;
      const ticker = setInterval(() => {
        fake = Math.min(88, fake + (Math.random()*4 + 1));
        setUploads(u => u.map(x => x.id===entry.id && x.status==="analyzing"
          ? {...x, progress:Math.round(fake), progressStep:"Claude is reading…"}
          : x));
      }, 900);

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          messages: [{ role: "user", content }],
        }),
      });

      clearInterval(ticker);
      updateProgress(entry.id, "Parsing results…", 94);

      const data = await res.json();
      const raw  = data.content?.find(b => b.type === "text")?.text || "";
      let parsed;
      try {
        parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      } catch {
        parsed = { docType:"other", summary: raw, biomarkers:[], insights:[], recommendations:[] };
      }

      updateProgress(entry.id, "Complete", 100);
      await new Promise(r => setTimeout(r, 300));
     
      // Also handle raw CSV rows parsed directly
      if(file.name.toLowerCase().includes("hume") ||
         (parsed.docType==="dxa" || parsed.docType==="styku") ||
         (parsed.bodyComp?.weight && parsed.docType !== "labs")){
        const bc = parsed.bodyComp;
        if(bc?.weight){
          const today = new Date().toISOString().slice(0,10);
          const newRow = {
            d: parsed.docDate || today,
            wt: parseFloat(bc.weight),
            bf: bc.bodyFatPct ? parseFloat(bc.bodyFatPct) : null,
            bmi: bc.bmi ? parseFloat(bc.bmi) : null,
          };
          try {
            const existing = JSON.parse(localStorage.getItem("vital_hume_imported")||"[]");
            const deduped = existing.filter(r=>r.d!==newRow.d);
            deduped.unshift(newRow);
            deduped.sort((a,b)=>b.d.localeCompare(a.d));
            localStorage.setItem("vital_hume_imported", JSON.stringify(deduped.slice(0,500)));
          } catch(e){}
        }
      }
      if(file.name.toLowerCase() === "activities.csv" ||
         (file.name.toLowerCase().includes("strava") && file.name.endsWith(".csv"))){
        try {
          const text = await file.slice(0, 5000000).text();
          const lines = text.trim().split("\n");
          const header = lines[0].split(",").map(h=>h.replace(/"/g,"").trim().toLowerCase());

          // Map Strava column names to indices
         
          const col = (name) => {
            const exact = header.findIndex(h=>h===name);
            return exact>=0 ? exact : header.findIndex(h=>h.includes(name));
          };
          const iDate     = col("activity date");
          const iName     = col("activity name");
          const iType     = col("activity type");
         
         
          const iDist     = header.findIndex(h=>h==="distance");
          const iTime     = col("moving time");
          const iElapsed  = col("elapsed time");
          const iElevGain = col("elevation gain");
          const iAvgHR    = col("average heart rate");
          const iMaxHR    = col("max heart rate");
          const iCal      = col("calories");
          const iAvgSpeed = col("average speed");

          const ACT_MAP = {
            run:"running", walk:"walking", ride:"spin", virtualride:"spin",
            weighttraining:"fitness", workout:"fitness", hike:"walking",
            swim:"swimming", yoga:"other", crossfit:"fitness",
          };

          const stored = {};
          try {
            const ex = JSON.parse(localStorage.getItem("vital_strava_activities")||"{}");
            Object.assign(stored, ex);
          } catch(e){}

          let imported = 0;
          const actRows = lines.slice(1).filter(l=>l.trim());

          for(const line of actRows){
            // Handle quoted CSV fields
            const cols = [];
            let cur = "", inQ = false;
            for(const ch of line){
              if(ch==='"'){ inQ=!inQ; } else if(ch===","&&!inQ){ cols.push(cur); cur=""; } else { cur+=ch; }
            }
            cols.push(cur);

            const get = (i) => i>=0&&i<cols.length ? (cols[i]||"").replace(/"/g,"").trim() : "";

            const dateRaw = get(iDate);
            if(!dateRaw) continue;
           
            let dateKey = "";
            const dm = dateRaw.match(/(\d{4})-(\d{2})-(\d{2})/);
            const dm2 = dateRaw.match(/([A-Za-z]+)\s+(\d+),\s+(\d{4})/);
            if(dm) dateKey = `${dm[1]}-${dm[2]}-${dm[3]}`;
            else if(dm2){
              const months={Jan:"01",Feb:"02",Mar:"03",Apr:"04",May:"05",Jun:"06",
                            Jul:"07",Aug:"08",Sep:"09",Oct:"10",Nov:"11",Dec:"12"};
              dateKey = `${dm2[3]}-${months[dm2[1]]||"01"}-${dm2[2].padStart(2,"0")}`;
            }
            if(!dateKey) continue;

            const typeRaw = get(iType).toLowerCase().replace(/\s+/g,"");
            const cat     = ACT_MAP[typeRaw] || "other";
            const distRaw = parseFloat(get(iDist))||0;
           
           
            const distMi    = +distRaw.toFixed(2);
            const movSec  = parseInt(get(iTime))||0;
            const durMin  = Math.round(movSec/60);
            const avgHR   = parseInt(get(iAvgHR))||0;
            const maxHR   = parseInt(get(iMaxHR))||0;
            const cal     = parseInt(get(iCal))||0;
            const name    = get(iName)||get(iType)||"Activity";
            const avgSpd  = parseFloat(get(iAvgSpeed))||0;
           
            const avgPace = avgSpd>0 ? +(60/avgSpd).toFixed(2) : 0;

            const entry = {
              cat, name, dur:durMin, cal, avgHR, maxHR,
              distance:distMi, avgPace, strain:0,
              start:"", source:"strava_csv",
              z1p:0,z2p:0,z3p:0,z4p:0,z5p:0,
            };

            if(!stored[dateKey]) stored[dateKey]=[];
           
            const existIdx = stored[dateKey].findIndex(e=>e.name===name&&e.source==="strava_csv");
            if(existIdx>=0){ stored[dateKey][existIdx]=entry; imported++; }
            else { stored[dateKey].push(entry); imported++; }
          }

          try{ localStorage.setItem("vital_strava_activities", JSON.stringify(stored)); }catch(e){}

          parsed.dataUpdates = {
            description: `✓ ${imported} Strava activities imported from ${actRows.length} rows. Activities saved to dashboard — visible in Fitness page after reload.`
          };
          const sampleDate = Object.keys(stored).sort().reverse()[0];
          const sampleAct  = sampleDate ? stored[sampleDate][0] : null;
          parsed.summary = `Strava CSV: ${imported} activities imported. Sample: ${sampleAct?.name||""} on ${sampleDate||""} — ${sampleAct?.distance?.toFixed(2)||"0"} mi, ${sampleAct?.dur||0}min. If distance looks wrong, clear Strava data and re-import.`;

        } catch(stravaErr){
        }
      }
     
     
      // "Title", "Class Timestamp", "Total Output", "Avg. Watts", "Max Watts",
      // "Avg. Resistance", "Avg. Cadence (RPM)", "Avg. Speed (mph)", "Distance (mi)",
      // "Calories Burned", "Avg. Heartrate", "Max Heartrate", "Duration (minutes)", "Instructor Name"
      const isPelotonCSV = file.name.toLowerCase().includes("workout") &&
        file.name.endsWith(".csv");
      if(isPelotonCSV){
        try {
          const text = await file.slice(0, 10000000).text();
          const lines = text.trim().split("\n");
          const header = lines[0].split(",").map(h=>h.replace(/"/g,"").trim().toLowerCase());

          const isPelo = header.some(h=>h.includes("fitness discipline")||h.includes("total output")||h.includes("avg. watts"));
          if(isPelo){
            const col = (name) => header.findIndex(h=>h.includes(name));
            const iDate   = col("workout timestamp");
            const iDisc   = col("fitness discipline");
            const iType   = col("type");
            const iTitle  = col("title");
            const iOutput = col("total output");
            const iAvgW   = col("avg. watts");
            const iMaxW   = col("max watts");
            const iAvgRes = col("avg. resistance");
            const iAvgCad = col("avg. cadence");
            const iAvgSpd = col("avg. speed");
            const iDist   = col("distance");
            const iCal    = col("calories burned");
            const iAvgHR  = col("avg. heartrate");
            const iMaxHR  = col("max heartrate");
                            const iDur   = col("length")>=0 ? col("length") : col("duration");
            const iInst   = col("instructor name");

            const rows = [];
            for(const line of lines.slice(1).filter(l=>l.trim())){
              const cols = [];
              let cur="",inQ=false;
              for(const ch of line){
                if(ch==='"'){inQ=!inQ;}else if(ch===","&&!inQ){cols.push(cur);cur="";}else{cur+=ch;}
              }
              cols.push(cur);
              const get=(i)=>i>=0&&i<cols.length?(cols[i]||"").replace(/"/g,"").trim():"";

              const dateRaw = get(iDate);
              if(!dateRaw) continue;
             
              const dm = dateRaw.match(/(\d{4})-(\d{2})-(\d{2})/);
              const dateKey = dm ? `${dm[1]}-${dm[2]}-${dm[3]}` : "";
              if(!dateKey) continue;

              const row = {
                dateKey,
                discipline: get(iDisc),
                type:       get(iType),
                title:      get(iTitle),
                output:     parseFloat(get(iOutput))||0,
                avgWatts:   parseFloat(get(iAvgW))||0,
                maxWatts:   parseFloat(get(iMaxW))||0,
                avgResistance: parseFloat(get(iAvgRes))||0,
                avgCadence: parseFloat(get(iAvgCad))||0,
                avgSpeed:   parseFloat(get(iAvgSpd))||0,
                distance:   parseFloat(get(iDist))||0,
                calories:   parseInt(get(iCal))||0,
                avgHR:      parseInt(get(iAvgHR))||0,
                maxHR:      parseInt(get(iMaxHR))||0,
                duration:   parseFloat(get(iDur))||0,
                instructor: get(iInst),
                source:     "peloton_csv",
              };
              rows.push(row);
            }

            if(rows.length>0){
              rows.sort((a,b)=>b.dateKey.localeCompare(a.dateKey));
              try{ localStorage.setItem("vital_peloton_v1", JSON.stringify(rows)); }catch(e){}

              // ── MERGE into WHOOP CAL_RICH overlay ────────────────────
              // For each Peloton row, find matching WHOOP session by date + category
              // and attach Peloton-only fields: distance, pace, output, watts, cadence, resistance
              const PELO_TO_CAT = {
                cycling:"spin", running:"running",
                walking:"walking", strength:"fitness", stretching:"fitness",
                "boot camp":"fitness", cardio:"fitness",
              };
              const overlay = JSON.parse(localStorage.getItem("vital_cal_rich_overlay")||"{}");
              let merged = 0;
              for(const row of rows){
                const cat = PELO_TO_CAT[(row.discipline||"").toLowerCase()] || "other";
                if(!overlay[row.dateKey]) overlay[row.dateKey] = {};
                // Store Peloton power/distance data keyed by category
                // WHOOP stays authoritative for HR/strain/zones — we only ADD fields
                overlay[row.dateKey][cat] = {
                  ...(overlay[row.dateKey][cat]||{}),
                  distance:    row.distance    >0 ? row.distance    : undefined,
                  avgPace:     row.avgSpeed    >0 ? +(60/row.avgSpeed).toFixed(2) : undefined, // min/mile from mph
                  avgSpeed:    row.avgSpeed    >0 ? row.avgSpeed    : undefined,
                  output:      row.output      >0 ? row.output      : undefined,   // kJ
                  avgWatts:    row.avgWatts    >0 ? row.avgWatts    : undefined,
                  maxWatts:    row.maxWatts    >0 ? row.maxWatts    : undefined,
                  avgCadence:  row.avgCadence  >0 ? row.avgCadence  : undefined,
                  avgResist:   row.avgResistance>0? row.avgResistance: undefined,
                  peloTitle:   row.title       || undefined,
                  peloInst:    row.instructor  || undefined,
                  source:      "peloton",
                };
                merged++;
              }
              try{ localStorage.setItem("vital_cal_rich_overlay", JSON.stringify(overlay)); }catch(e){}

              const cyclingCount = rows.filter(r=>r.discipline.toLowerCase()==="cycling").length;
              const withDist = rows.filter(r=>r.distance>0).length;
              parsed.dataUpdates = {
                description: `✓ ${rows.length} Peloton workouts imported & merged with WHOOP. ${cyclingCount} cycling sessions${withDist>0?` · ${withDist} with distance/pace data`:""}.`
              };
              parsed.summary = `Peloton: ${rows.length} workouts imported — ${rows.filter(r=>r.output>0).length} with power data, merged into WHOOP sessions.`;
            }
          }
        } catch(peloErr){ console.warn("Peloton CSV parse error:", peloErr); }
      }

     
      if((file.name.toLowerCase().includes("hume") || file.name.toLowerCase().includes("body_comp"))
          && (file.name.endsWith(".csv"))){
        try {
          const text = await file.slice(0, 200000).text();
          const lines = text.trim().split("\n").slice(1); // skip header
          const csvRows = [];
          for(const line of lines){
            const cols = line.split(",");
            if(cols.length >= 3){
              const d = (cols[0]||"").trim().replace(/"/g,"");
              const wt = parseFloat((cols[1]||"").replace(/"/g,""));
              const bf = parseFloat((cols[2]||"").replace(/"/g,""));
              const bmi = parseFloat((cols[3]||"").replace(/"/g,""));
              if(d && !isNaN(wt) && wt > 100 && wt < 400){
                csvRows.push({d, wt:+wt.toFixed(1), bf:isNaN(bf)?null:+bf.toFixed(2), bmi:isNaN(bmi)?null:+bmi.toFixed(1)});
              }
            }
          }
          if(csvRows.length > 0){
            csvRows.sort((a,b)=>b.d.localeCompare(a.d));
            try {
              const existing = JSON.parse(localStorage.getItem("vital_hume_imported")||"[]");
              const existDates = new Set(existing.map(r=>r.d));
              const merged = [...csvRows.filter(r=>!existDates.has(r.d)), ...existing];
              merged.sort((a,b)=>b.d.localeCompare(a.d));
              localStorage.setItem("vital_hume_imported", JSON.stringify(merged.slice(0,500)));
              // Refresh the status banner
              setImportedHumeSummary({ count: merged.length, latest: merged[0], oldest: merged[merged.length-1] });
              parsed.dataUpdates = { description: `${csvRows.length} Hume body comp readings saved. Latest: ${csvRows[0].wt} lbs on ${csvRows[0].d}. Reload the dashboard for weight card and trends to reflect your new data.` };
            } catch(e){}
          }
        } catch(e){}
      }

     
      // constants (LATEST, HUME_DATA, etc.) pick up the fresh values
      const wroteNewData = !!(
        parsed.dataUpdates?.description ||
        parsed.bodyComp?.weight ||
        (file.name.toLowerCase().includes("hume") && file.name.endsWith(".csv")) ||
        (file.name.toLowerCase() === "activities.csv") ||
        (file.name.toLowerCase().includes("workout") && file.name.endsWith(".csv"))
      );

      setUploads(u => u.map(x => x.id === entry.id
        ? { ...x, status: "done", progress:100,
            progressStep: wroteNewData ? "✓ Reloading dashboard…" : "Complete",
            result: parsed, raw, reloading: wroteNewData }
        : x
      ));

      if(wroteNewData){
        setTimeout(()=> window.location.reload(), 2200);
      }

    } catch(err) {
      setUploads(u => u.map(x => x.id === entry.id
        ? { ...x, status: "error", progress:100, progressStep:"Error", result: { summary: err.message, biomarkers:[], insights:[], recommendations:[] } }
        : x
      ));
    }
  };

  const onFiles = files => Array.from(files).forEach(analyzeFile);

  const statusColor = s => s==="done"?"#3A9C68":s==="error"?P.terra:P.amber;
  const statusLabel = s => s==="done"?"Complete":s==="error"?"Error":"Analyzing…";

  const docTypeLabel = t => ({
    labs:"Lab Panel", whoop:"WHOOP Export", dxa:"DXA Scan",
    styku:"Styku Scan", rmr:"RMR Test", nutrition:"Nutrition", other:"Document",
  }[t]||"Document");

  const docTypeIcon = t => ({
    labs:"🧬", whoop:"⌚", dxa:"🦴", styku:"📐", rmr:"💨", nutrition:"🥗", other:"📄",
  }[t]||"📄");
  const ACCEPT_TYPES = [
    { ext:".pdf",  icon:"📄", label:"PDF reports" },
    { ext:".png .jpg .jpeg .webp", icon:"🖼", label:"Images / screenshots" },
    { ext:".csv",  icon:"📊", label:"CSV exports (WHOOP, Hume)" },
    { ext:".xml",  icon:"🗂", label:"Apple Health export.xml" },
    { ext:".json", icon:"⚙", label:"JSON data" },
  ];

  return(<div style={S.col16}>
    {hasImportedData&&(
      <div style={{background:P.sageBg||P.panel,border:`1px solid ${P.sage}44`,borderRadius:10,
        padding:"10px 14px",display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:14}}>🔄</span>
        <div style={{flex:1,fontFamily:FF.s,fontSize:10,color:P.sub,lineHeight:1.5}}>
          Imported data detected. <strong>Reload the dashboard</strong> so Today, Overview, and Body Comp pages pick up the latest values.
        </div>
        <button onClick={()=>window.location.reload()}
          style={{fontFamily:FF.s,fontSize:10,fontWeight:700,padding:"7px 14px",flexShrink:0,
            borderRadius:7,border:"none",background:P.sage,color:"#fff",cursor:"pointer",whiteSpace:"nowrap"}}>
          Reload Now
        </button>
      </div>
    )}
    <div style={S.rowsbe}>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>
          Labs · WHOOP · DXA
        </div>
        <div style={S.h18}>Import Health Data</div>
      </div>
      {/* WHOOP Live Connection Status */}
      <div style={{display:"flex",gap:8}}>
        {(()=>{
          const [whoopConn, setWhoopConn] = useState(null);
          useEffect(()=>{
            fetch('/api/whoop/data').then(r=>r.json()).then(d=>setWhoopConn(d)).catch(()=>setWhoopConn(null));
          },[]);
          if(!whoopConn) return null;
          return whoopConn.connected ? (
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,
              background:"#3A9C6812",border:"1px solid #3A9C6844"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"#3A9C68",
                boxShadow:"0 0 6px #3A9C68",animation:"pulse 2s infinite"}}/>
              <span style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color:"#3A9C68"}}>
                WHOOP Live {whoopConn.stale?"(stale)":""}
              </span>
              <span style={{fontFamily:FF.s,fontSize:9,color:P.muted}}>
                {whoopConn.hoursOld}h ago
              </span>
            </div>
          ) : (
            <a href="/api/whoop/login"
              style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,
                background:"#1A1816",border:"1px solid rgba(255,255,255,0.15)",textDecoration:"none",
                fontFamily:FF.s,fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.8)"}}>
              <span style={{fontSize:12}}>⌚</span> Connect WHOOP
            </a>
          );
        })()}
      </div>
      <div style={{display:"flex",gap:6}}>
        {["upload","peloton","history"].map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)} style={{
            fontFamily:FF.s,fontSize:11,fontWeight:600,padding:"5px 14px",borderRadius:7,
            cursor:"pointer",transition:"all .15s",
            background:activeTab===t?P.cardDk:P.card,
            color:activeTab===t?P.textInv:P.sub,
            border:`1px solid ${activeTab===t?P.cardDk:P.border}`,
          }}>{t==="upload"?"Upload":t==="peloton"?"🚴 Peloton":"History"} {t==="history"&&uploads.length>0?`(${uploads.length})`:""}</button>
        ))}
      </div>
    </div>

    {activeTab==="upload"&&(<>
      {importedHumeSummary&&(
        <div style={{background:P.sageBg,border:`1px solid ${P.sage}44`,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:18}}>⚖</span>
          <div style={{flex:1}}>
            <div style={{fontFamily:FF.s,fontSize:11,fontWeight:600,color:P.sage}}>
              Hume weight data active — {importedHumeSummary.count} readings
            </div>
            <div style={S.mut9t2}>
              Latest: <span style={{fontWeight:600,color:P.text}}>{importedHumeSummary.latest.wt} lbs</span> on {importedHumeSummary.latest.d}
              {" · "}Range: {importedHumeSummary.oldest.d} → {importedHumeSummary.latest.d}
              {" · "}Dashboard weight card and trends reflect this data.
            </div>
          </div>
          <button onClick={clearHumeData} style={{fontFamily:FF.s,fontSize:9,padding:"4px 10px",borderRadius:6,
            border:`1px solid ${P.terra}44`,background:"transparent",color:P.terra,cursor:"pointer"}}>
            Clear
          </button>
        </div>
      )}
      <div style={CS(14,"16px 18px")}>
        <div style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:P.sub,letterSpacing:"0.10em",textTransform:"uppercase",marginBottom:12}}>Supported Document Types</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
          {[
            {icon:"🧬",label:"Lab Reports",desc:"BioLab, Quest, LabCorp PDFs — extracts all biomarkers, flags out-of-range values"},
            {icon:"⌚",label:"WHOOP Exports",desc:"CSV physiological cycles or screenshot — updates recovery, HRV, RHR, strain"},
            {icon:"🦴",label:"DXA / Body Scan",desc:"DXA PDF or Styku/Hume screenshot — updates body fat %, lean mass, regional data"},
            {icon:"💨",label:"RMR / VO₂ Tests",desc:"CardioCoach, KORR, or metabolic test PDF — updates calorie targets"},
            {icon:"🖼",label:"Screenshots",desc:"Screenshot any app — WHOOP sleep screen, Hume scan result, lab portal — AI reads it"},
            {icon:"📊",label:"CSV / Apple Health",desc:"Hume body comp CSV, Apple Health export.xml — structured data import"},
          ].map(({icon,label,desc})=>(
            <div key={label} style={{padding:"11px 13px",borderRadius:10,background:P.panel,border:`1px solid ${P.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                <span style={{fontSize:16}}>{icon}</span>
                <div style={{fontFamily:FF.s,fontSize:10,fontWeight:700,color:P.text}}>{label}</div>
              </div>
              <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,lineHeight:1.55}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div
        onDragOver={e=>{e.preventDefault();setDrag(true);}}
        onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);onFiles(e.dataTransfer.files);}}
        onClick={()=>fileRef.current?.click()}
        style={{
          border:`2px dashed ${drag?P.accent:P.border}`,borderRadius:16,padding:"40px 20px",
          textAlign:"center",cursor:"pointer",transition:"all .2s",
          background:drag?P.accent+"08":P.panel,
        }}>
        <input ref={fileRef} type="file" multiple
          accept=".pdf,image/*,.csv,.xml,.json"
          style={{display:"none"}}
          onChange={e=>onFiles(e.target.files)}/>
        <div style={{fontSize:40,marginBottom:12}}>⬆</div>
        <div style={{fontFamily:FF.s,fontSize:14,fontWeight:600,color:P.text,marginBottom:6}}>
          Drop files here or click to browse
        </div>
        <div style={{fontFamily:FF.s,fontSize:11,color:P.muted,marginBottom:14}}>
          PDF · Images (JPG, PNG, WebP) · CSV · Apple Health XML · JSON
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
          {ACCEPT_TYPES.map(({ext,icon,label})=>(
            <div key={ext} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",
              borderRadius:6,background:P.card,border:`1px solid ${P.border}`}}>
              <span style={{fontSize:13}}>{icon}</span>
              <span style={S.sub9}>{label}</span>
            </div>
          ))}
        </div>
      </div>
      {uploads.filter(u=>u.status==="queued"||u.status==="analyzing").length>0&&(
        <div style={S.col10}>
          {uploads.filter(u=>u.status==="queued"||u.status==="analyzing").map(u=>{
            const pct    = u.progress||0;
            const isErr  = u.status==="error";
            const barClr = isErr?P.terra:pct===100?"#3A9C68":P.amber;
            return(
              <div key={u.id} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"16px 18px",boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                  <div style={{width:44,height:44,borderRadius:10,background:P.panel,border:`1px solid ${P.border}`,
                    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:20,lineHeight:1}}>{u.fileIcon||"📄"}</span>
                    <span style={{fontFamily:FF.m,fontSize:7,fontWeight:700,color:P.muted,marginTop:2,letterSpacing:"0.04em"}}>{u.fileTypeLabel||"FILE"}</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:FF.s,fontSize:12,fontWeight:600,color:P.text,
                      whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginBottom:2}}>{u.name}</div>
                    <div style={S.row10}>
                      <span style={S.mut9}>{u.size}</span>
                      <span style={S.mut9}>·</span>
                      <span style={S.mut9}>{u.date}</span>
                    </div>
                  </div>
                  <div style={{flexShrink:0,display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:99,
                    background:barClr+"14",border:`1px solid ${barClr}33`}}>
                    {pct<100&&<div style={{width:6,height:6,borderRadius:"50%",background:barClr,
                      animation:"pulse 1s infinite"}}/>}
                    {pct===100&&<span style={{fontSize:10}}>✓</span>}
                    <span style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:barClr}}>{u.progressStep||"Queued"}</span>
                  </div>
                </div>
                <div style={{position:"relative",height:6,borderRadius:3,background:P.panel,overflow:"hidden",marginBottom:6}}>
                  <div style={{
                    position:"absolute",left:0,top:0,height:"100%",borderRadius:3,
                    background:`linear-gradient(to right, ${barClr}cc, ${barClr})`,
                    width:`${pct}%`,
                    transition:"width 0.6s ease",
                  }}/>
                  {pct>0&&pct<100&&(
                    <div style={{
                      position:"absolute",top:0,left:`${pct-15}%`,
                      width:"15%",height:"100%",
                      background:"linear-gradient(to right, transparent, rgba(255,255,255,0.35), transparent)",
                      animation:"shimmer 1.4s ease-in-out infinite",
                    }}/>
                  )}
                </div>
                <div style={S.rowsb}>
                  <span style={{fontFamily:FF.s,fontSize:8.5,color:P.muted}}>{u.progressStep||"Waiting…"}</span>
                  <span style={{fontFamily:FF.m,fontSize:9,fontWeight:600,color:barClr}}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {uploads.filter(u=>u.status!=="analyzing").map(u=>(
        <div key={u.id} style={CS()}>
          <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:14,paddingBottom:12,borderBottom:`1px solid ${P.border}`}}>
            <span style={{fontSize:24,flexShrink:0}}>{u.result?docTypeIcon(u.result.docType):"📄"}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}>
                <div style={{fontFamily:FF.s,fontSize:12,fontWeight:600,color:P.text,marginBottom:2}}>{u.name}</div>
                <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                  {u.result?.docType&&u.result.docType!=="other"&&(
                    <span style={{fontFamily:FF.s,fontSize:8,fontWeight:700,padding:"3px 8px",borderRadius:4,
                      background:P.accent+"18",color:P.accent,letterSpacing:"0.06em",textTransform:"uppercase"}}>
                      {docTypeLabel(u.result.docType)}
                    </span>
                  )}
                  <span style={{padding:"3px 10px",borderRadius:99,fontFamily:FF.s,fontSize:9,fontWeight:700,
                    background:statusColor(u.status)+"18",color:statusColor(u.status),
                    border:`1px solid ${statusColor(u.status)}44`}}>
                    {statusLabel(u.status)}
                  </span>
                </div>
              </div>
              <div style={S.mut9}>{u.size} · {u.date}{u.result?.docDate?` · Scan date: ${u.result.docDate}`:""}</div>
              {u.result?.summary&&<div style={{fontFamily:FF.s,fontSize:10,color:P.sub,lineHeight:1.65,marginTop:6}}>{u.result.summary}</div>}
            </div>
          </div>
          {u.result?.biomarkers?.length>0&&(
            <div style={{marginBottom:14}}>
              <div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,letterSpacing:"0.10em",textTransform:"uppercase",color:P.muted,marginBottom:9}}>Biomarkers · {u.result.biomarkers.length} detected</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:7}}>
                {u.result.biomarkers.map((b,i)=>{
                  const sc = b.status==="high"?P.terra:b.status==="low"?P.amber:P.sage;
                  return(
                    <div key={i} style={{padding:"9px 11px",borderRadius:9,
                      background:sc+"10",border:`1px solid ${sc}28`}}>
                      <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:4}}>{b.name}</div>
                      <div style={{fontFamily:FF.m,fontSize:13,fontWeight:600,color:sc,lineHeight:1}}>{b.value}<span style={{fontSize:9,color:P.muted,marginLeft:3,fontWeight:400}}>{b.unit}</span></div>
                      {b.range&&<div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:3}}>Ref: {b.range}</div>}
                      {b.status!=="normal"&&b.status!=="unknown"&&(
                        <div style={{fontFamily:FF.s,fontSize:7.5,fontWeight:700,color:sc,marginTop:3,letterSpacing:"0.06em"}}>{b.status==="high"?"↑ HIGH":"↓ LOW"}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {u.result?.whoopData&&Object.values(u.result.whoopData).some(v=>v!==null)&&(
            <div style={{marginBottom:14}}>
              <div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,letterSpacing:"0.10em",textTransform:"uppercase",color:P.muted,marginBottom:9}}>WHOOP Metrics</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[
                  {label:"Recovery",key:"recovery",unit:"%",color:P.sage},
                  {label:"HRV",key:"hrv",unit:"ms",color:P.steel},
                  {label:"RHR",key:"rhr",unit:"bpm",color:P.terra},
                  {label:"Strain",key:"strain",unit:"",color:P.amber},
                  {label:"Sleep",key:"sleepScore",unit:"%",color:"#7A5A80"},
                  {label:"Sleep hrs",key:"sleepHours",unit:"h",color:P.steel},
                ].filter(f=>u.result.whoopData[f.key]!==null).map(f=>(
                  <div key={f.key} style={{padding:"9px 12px",borderRadius:9,background:P.panel,border:`1px solid ${P.border}`,minWidth:80}}>
                    <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{f.label}</div>
                    <div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:f.color,lineHeight:1}}>{u.result.whoopData[f.key]}<span style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginLeft:2}}>{f.unit}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {u.result?.bodyComp&&Object.values(u.result.bodyComp).some(v=>v!==null&&v!=="")&&(
            <div style={{marginBottom:14}}>
              <div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,letterSpacing:"0.10em",textTransform:"uppercase",color:P.muted,marginBottom:9}}>
                Body Composition {u.result.bodyComp.source&&`· ${u.result.bodyComp.source}`}
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[
                  {label:"Weight",key:"weight",unit:"lbs",color:P.steel},
                  {label:"Body Fat",key:"bodyFatPct",unit:"%",color:P.terra},
                  {label:"Lean Mass",key:"leanMassLbs",unit:"lbs",color:P.sage},
                  {label:"Fat Mass",key:"fatMassLbs",unit:"lbs",color:P.amber},
                  {label:"BMI",key:"bmi",unit:"",color:P.muted},
                ].filter(f=>u.result.bodyComp[f.key]!==null).map(f=>(
                  <div key={f.key} style={{padding:"9px 12px",borderRadius:9,background:P.panel,border:`1px solid ${P.border}`,minWidth:80}}>
                    <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{f.label}</div>
                    <div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:f.color,lineHeight:1}}>{u.result.bodyComp[f.key]}<span style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginLeft:2}}>{f.unit}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(u.result?.insights?.length>0||u.result?.recommendations?.length>0)&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:14}}>
              {u.result?.insights?.length>0&&(
                <div>
                  <div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,letterSpacing:"0.10em",textTransform:"uppercase",color:P.muted,marginBottom:7}}>Clinical Insights</div>
                  {u.result.insights.map((ins,i)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:5}}>
                      <div style={{width:5,height:5,borderRadius:"50%",background:P.sage,flexShrink:0,marginTop:4}}/>
                      <div style={{fontFamily:FF.s,fontSize:10,color:P.sub,lineHeight:1.6}}>{ins}</div>
                    </div>
                  ))}
                </div>
              )}
              {u.result?.recommendations?.length>0&&(
                <div>
                  <div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,letterSpacing:"0.10em",textTransform:"uppercase",color:P.muted,marginBottom:7}}>Recommendations</div>
                  {u.result.recommendations.map((rec,i)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:5}}>
                      <div style={{width:5,height:5,borderRadius:"50%",background:P.amber,flexShrink:0,marginTop:4}}/>
                      <div style={{fontFamily:FF.s,fontSize:10,color:P.sub,lineHeight:1.6}}>{rec}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {u.result?.dataUpdates?.description&&(
            <div style={{padding:"10px 13px",background:P.accent+"10",borderRadius:9,border:`1px solid ${P.accent}30`}}>
              <div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:P.accent,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>Dashboard Update</div>
              <div style={{fontFamily:FF.s,fontSize:10,color:P.sub,lineHeight:1.6}}>{u.result.dataUpdates.description}</div>
              <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:6}}>
                To apply: share the extracted values with Claude and ask to update the relevant data constants in the source file.
              </div>
            </div>
          )}
        </div>
      ))}

    </>)}
    {activeTab==="peloton"&&(
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:"linear-gradient(135deg,#E60000,#C40000)",borderRadius:14,
          padding:"20px 22px",display:"flex",alignItems:"center",gap:18}}>
          <div style={{width:48,height:48,borderRadius:12,background:"rgba(255,255,255,0.15)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>🚴</div>
          <div>
            <div style={{fontFamily:FF.r,fontWeight:700,fontSize:18,color:"#fff"}}>Import Peloton Data</div>
            <div style={{fontFamily:FF.s,fontSize:11,color:"rgba(255,255,255,0.85)",marginTop:3,lineHeight:1.6}}>
              Go to <strong>members.onepeloton.com/profile/workouts</strong> → click <strong>"Download Workouts"</strong> (top right) → drop the CSV into the Upload tab.
            </div>
          </div>
        </div>
        <div style={CS(12,"16px 18px","none")}>
          <div style={{fontFamily:FF.s,fontSize:11,fontWeight:700,color:P.text,marginBottom:12}}>How to export</div>
          {[
            {n:1, text:"Sign in at members.onepeloton.com"},
            {n:2, text:'Click "Workouts" tab in your profile'},
            {n:3, text:'Hit "Download Workouts" button — top right corner'},
            {n:4, text:"Drag the downloaded CSV into the Upload tab above"},
          ].map(({n,text})=>(
            <div key={n} style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:10}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:"#E6000018",border:"1px solid #E6000044",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:FF.m,fontSize:10,fontWeight:700,color:"#E60000",flexShrink:0}}>{n}</div>
              <div style={{fontFamily:FF.s,fontSize:11,color:P.sub,lineHeight:1.6,paddingTop:1}}>{text}</div>
            </div>
          ))}
          <a href="https://members.onepeloton.com/profile/workouts" target="_blank"
            style={{display:"inline-block",marginTop:4,fontFamily:FF.s,fontSize:11,fontWeight:700,
              padding:"8px 18px",borderRadius:8,background:"#E60000",color:"#fff",textDecoration:"none"}}>
            Open Peloton Profile →
          </a>
        </div>
        <div style={CS(12,"16px 18px","none")}>
          <div style={{fontFamily:FF.s,fontSize:11,fontWeight:700,color:P.text,marginBottom:10}}>What's in the CSV</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8}}>
            {[
              {icon:"📅",label:"Date & Time"},
              {icon:"🏷",label:"Class Title & Instructor"},
              {icon:"⚡",label:"Total Output (kJ)"},
              {icon:"🔋",label:"Avg & Max Watts"},
              {icon:"🔄",label:"Cadence (RPM)"},
              {icon:"💪",label:"Resistance %"},
              {icon:"🚀",label:"Speed (mph)"},
              {icon:"📍",label:"Distance (mi)"},
              {icon:"🔥",label:"Calories Burned"},
              {icon:"❤",label:"Avg & Max HR"},
              {icon:"⏱",label:"Duration (min)"},
              {icon:"👟",label:"Fitness Discipline"},
            ].map(({icon,label})=>(
              <div key={label} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 10px",
                background:P.panel,borderRadius:8,border:`1px solid ${P.border}`}}>
                <span style={{fontSize:14}}>{icon}</span>
                <span style={{fontFamily:FF.s,fontSize:9,color:P.sub,fontWeight:500}}>{label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    )}

    {activeTab==="history"&&(
      <div style={CS()}>
        {uploads.length===0?(
          <div style={{textAlign:"center",padding:"40px 20px"}}>
            <div style={{fontSize:40,marginBottom:12}}>📂</div>
            <div style={{fontFamily:FF.s,fontSize:13,fontWeight:600,color:P.text,marginBottom:6}}>No uploads yet</div>
            <div style={{fontFamily:FF.s,fontSize:11,color:P.muted}}>Uploads appear here after analysis</div>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:P.muted,letterSpacing:"0.10em",textTransform:"uppercase",marginBottom:4}}>
              {uploads.length} document{uploads.length!==1?"s":""} this session
            </div>
            {uploads.map(u=>(
              <div key={u.id} onClick={()=>setActiveTab("upload")}
                style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",
                  borderRadius:10,background:P.panel,border:`1px solid ${P.border}`,cursor:"pointer",
                  transition:"background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=P.card}
                onMouseLeave={e=>e.currentTarget.style.background=P.panel}>
                <span style={{fontSize:18,flexShrink:0}}>{u.result?docTypeIcon(u.result.docType):"📄"}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:FF.s,fontSize:11,fontWeight:500,color:P.text,
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{u.name}</div>
                  <div style={S.mut9}>{u.date} · {u.size}</div>
                </div>
                <div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,
                  color:statusColor(u.status),background:statusColor(u.status)+"18",
                  padding:"2px 8px",borderRadius:4,flexShrink:0}}>{statusLabel(u.status)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
    <div style={CS()}>
      <SLabel color={P.steel}>Apple Health export.xml (large file)</SLabel>
      <div style={{fontFamily:FF.s,fontSize:10,color:P.muted,marginTop:-8,marginBottom:14,lineHeight:1.6}}>
        Apple Health exports are typically 2–8 GB — too large for the browser. Use the Python script to extract Hume body comp data on your Mac, then drag the resulting CSV above.
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12}}>
        {[
          {icon:"1",title:"Connect Hume → Apple Health",body:"Hume app → Settings → Connected Apps → Apple Health → enable Body Fat %, Lean Body Mass, Body Mass"},
          {icon:"2",title:"Export from Apple Health",body:"Apple Health → Profile (top right) → Export All Health Data → share the ZIP to your Mac"},
          {icon:"3",title:"Run the Python extractor",body:"Terminal: python3 extract_hume.py ~/Downloads/apple_health_export/export.xml"},
          {icon:"4",title:"Upload hume_body_comp.csv",body:"Drag the output CSV into the dropzone above — Claude will parse and summarize all scan dates"},
        ].map(({icon,title,body})=>(
          <div key={icon} style={{display:"flex",gap:12,padding:"11px 13px",borderRadius:10,background:P.panel,border:`1px solid ${P.border}`}}>
            <div style={{width:20,height:20,borderRadius:"50%",background:P.steel,display:"flex",alignItems:"center",justifyContent:"center",
              fontFamily:FF.m,fontSize:9,fontWeight:700,color:"#fff",flexShrink:0}}>{icon}</div>
            <div>
              <div style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color:P.text,marginBottom:3}}>{title}</div>
              <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,lineHeight:1.6}}>{body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

  </div>);
}
// LAB_FRESHNESS, TODAY_DATE, LAB_OVERDUE, LAB_DUE_SOON now live in src/lib/data/labs.js

