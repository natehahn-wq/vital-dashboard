// Animated 0→value for SVG strokeDasharray (smooth ring fill), with optional delay.
import { useState, useEffect } from "react";
import { easeSpring } from "../lib/utils.js";

export function useAnimRing(target,dur=1000,delay=0,ease=easeSpring){
  const [v,setV]=useState(0);
  useEffect(()=>{
    let st=null,raf;
    const delayed=ts=>{
      if(!st)st=ts+delay;
      if(ts<st){raf=requestAnimationFrame(delayed);return;}
      const p=Math.min(1,(ts-st)/dur);
      setV(ease(p)*target);
      if(p<1)raf=requestAnimationFrame(delayed);
    };
    raf=requestAnimationFrame(delayed);
    return()=>cancelAnimationFrame(raf);
  },[target,dur,delay]);
  return v;
}
