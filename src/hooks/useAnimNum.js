// Animated number (decimal-safe) — eases from 0 to target over `dur` ms.
import { useState, useEffect } from "react";
import { easeOut } from "../lib/utils.js";

export function useAnimNum(target,dur=900,ease=easeOut){
  const [val,set]=useState(0);
  useEffect(()=>{
    let st=null,raf;
    const step=ts=>{
      if(!st)st=ts;
      const p=Math.min(1,(ts-st)/dur);
      set(Math.round(ease(p)*target*10)/10);
      if(p<1)raf=requestAnimationFrame(step);
    };
    raf=requestAnimationFrame(step);
    return()=>cancelAnimationFrame(raf);
  },[target,dur]);
  return val;
}
