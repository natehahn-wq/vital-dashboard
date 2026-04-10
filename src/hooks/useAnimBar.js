// Animated 0→value for progress bars, with optional delay.
import { useState, useEffect } from "react";
import { easeOut } from "../lib/utils.js";

export function useAnimBar(target,dur=800,delay=0){
  const [v,setV]=useState(0);
  useEffect(()=>{
    let st=null,raf;
    const run=ts=>{
      if(!st)st=ts+delay;
      if(ts<st){raf=requestAnimationFrame(run);return;}
      const p=Math.min(1,(ts-st)/dur);
      setV(easeOut(p)*target);
      if(p<1)raf=requestAnimationFrame(run);
    };
    raf=requestAnimationFrame(run);
    return()=>cancelAnimationFrame(raf);
  },[target,dur,delay]);
  return v;
}
