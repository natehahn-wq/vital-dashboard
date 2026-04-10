// Pure formatting / scoring / easing helpers used across the dashboard.
// Anything in here must be free of React, JSX, and runtime data — it can
// import from theme.js (palette colors are stable references) but should
// not import from data files or components.

import { P } from "./theme.js";

// ─── Time / event formatting ────────────────────────────────────────────────

export function fmtEvtTime(t) {
  if (!t) return "";
  // Handle ISO datetime strings
  if (t.includes("T")) {
    const d = new Date(t);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  }
  return t;
}

// ─── Calendar source labels + colors ────────────────────────────────────────

export function calLabel(id) {
  if (!id) return "";
  if (id.includes("epidemic")) return "Epidemic";
  if (id.includes("lasushi")) return "LA Sushi";
  if (id.includes("with.partners")) return "W/P";
  if (id.includes("family")) return "Family";
  return "Personal";
}

export function calColor(id) {
  if (!id) return P.muted;
  if (id.includes("epidemic")) return "#C47830";
  if (id.includes("lasushi")) return "#C4604A";
  if (id.includes("with.partners")) return "#4A8070";
  if (id.includes("family")) return "#3A9C68";
  return P.steel;
}

// ─── Trend generator (used to seed mock data) ───────────────────────────────

export function gT(base, mn, mx, d, days = 30) {
  let v = base;
  return Array.from({ length: days }, (_, i) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - (days - 1 - i));
    v = Math.round(Math.max(mn, Math.min(mx, v + (Math.random() - 0.47) * d)) * 10) / 10;
    return { d: dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }), v };
  });
}

// ─── Number formatting ──────────────────────────────────────────────────────

export const fmtH = h => `${Math.floor(h)}h ${Math.round((h % 1) * 60)}m`;
export const pctOf = (v, mx) => Math.min(100, (v / mx) * 100);
export const fmt = n => (typeof n === "number" ? n.toLocaleString() : n);

// ─── Score → color / grade / label ──────────────────────────────────────────

export const SCORE_COLOR = s => (s >= 80 ? P.sage : s >= 70 ? P.amber : s >= 60 ? P.clay : P.terra);
export const SCORE_GRADE = s => (s >= 90 ? "A" : s >= 80 ? "B+" : s >= 70 ? "B" : s >= 60 ? "C+" : s >= 50 ? "C" : "D");
export const SCORE_LABEL = s => (s >= 90 ? "Exceptional" : s >= 80 ? "Excellent" : s >= 70 ? "Good" : s >= 60 ? "Fair" : s >= 50 ? "Poor" : "Critical");

// ─── Easing curves for animations ───────────────────────────────────────────

export function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
export function easeSpring(t) { return 1 - Math.pow(1 - t, 4) * Math.cos(t * Math.PI * 2.2); }

// ─── Deterministic seeded RNG ───────────────────────────────────────────────

export function seedRng(s) {
  let x = s;
  return () => {
    x = Math.imul(48271, x) >>> 0;
    return (x & 0x7fffffff) / 0x7fffffff;
  };
}
