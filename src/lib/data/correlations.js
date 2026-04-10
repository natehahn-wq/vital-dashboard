// Curated cross-domain correlation findings shown on the Correlations page.
// Each finding has a stat color drawn from the live theme palette.

import { P } from "../theme.js";

export const CORR_DATA = [
  {icon:"🍷", title:"Alcohol → Next-Day Recovery Drop",
   text:"On the 24 days you drank, next-day recovery averaged 41% vs 67% on non-drink days — a 26-point gap. HRV dropped from 44ms avg to 31ms avg. The effect is larger with 2+ drinks.",
   stat:"−26 pts recovery", statColor:P.terra},
  {icon:"💪", title:"Workout Days → Following-Day Sleep Quality",
   text:"High-strain days (>13) correlate with 94% sleep score the following night vs 87% on rest days. Your body prioritizes deep sleep after hard efforts — avg deep sleep 2.1h post-workout vs 1.6h rest days.",
   stat:"+7 pts sleep score", statColor:P.sage},
  {icon:"🏃", title:"You're a Summer Runner, Winter Lifter",
   text:"Q3 2025 (Jul–Sept) you logged 26 running sessions vs just 1 Functional Fitness — almost exclusively outdoor aerobic. Q4 shifted to 18 FF sessions vs 12 runs. This seasonal pattern is consistent with 2023–24 data.",
   stat:"Seasonal pattern", statColor:P.steel},
  {icon:"🏋", title:"Functional Fitness Generates More HRV Suppression",
   text:"FF sessions average 12.0 strain vs 11.3 for running, producing more next-day HRV suppression (−6ms vs −3ms). Despite this, your 3-month HRV trend is flat-to-rising on weeks with 2 FF sessions.",
   stat:"−6ms HRV after FF", statColor:P.amber},
  {icon:"📅", title:"HRV & Recovery Are Seasonal — Peak in May & Sept, Trough in Aug & Jan",
   text:"May and September show your highest HRV (50ms both months). August is your worst month (39ms avg). Jan recovery averages 58% vs May's 71%. Aligns with temperature and training load cycles.",
   stat:"May = peak HRV", statColor:P.sage},
  {icon:"😴", title:"Short Sleep Tanks Recovery — The 7.5h Floor",
   text:"The 3 weeks with short sleep (<7.5h) averaged only 50% recovery. Optimal (7.5–9h) averaged 67%. Your sleep duration is high (8.5h avg) but highly variable — the variance matters more than the mean.",
   stat:"7.5h floor critical", statColor:P.violet},
];
