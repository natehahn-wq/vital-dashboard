// Animated integer count-up — eases from 0 to target over `dur` ms.
import { useState, useEffect } from "react";
import { easeOut } from "../lib/utils.js";

export function useCountUp(target,dur=1100,ease=easeOut){
  const [v,setV]=useState(0);
  useEffect(()=>{
    let st=null,raf;
    const step=ts=>{
      if(!st)st=ts;
      const p=Math.min(1,(ts-st)/dur);
      setV(Math.round(ease(p)*target));
      if(p<1)raf=requestAnimationFrame(step);
    };
    raf=requestAnimationFrame(step);
    return()=>cancelAnimationFrame(raf);
  },[target,dur]);
  return v;
}
