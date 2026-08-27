// Function Health-inspired biomarkers overview page.
// Warm cream palette, serif display numbers, category grouping,
// stacked bar summary, and biological age hero card.
import { useState } from "react";
import { P, FF } from "../lib/theme.js";
import { LABS, LABS_MERGED, LABS_PRIOR } from "../lib/data/labs.js";
import { useIsMobile } from "../hooks/useIsMobile.js";

// Function Health palette — warm, organic, cream-based
const FH = {
  bg: "#FAF7F2",
  card: "#FFFFFF",
  cardAlt: "#F5F2ED",
  border: "rgba(0,0,0,0.06)",
  text: "#1A1A1A",
  sub: "#6B6B6B",
  muted: "#9B9B9B",
  green: "#3D8B5E",
  greenBg: "#E8F2EC",
  terra: "#C0623A",
  terraBg: "#FAF0EB",
  sage: "#7A9B82",
  sageBg: "#EDF3EF",
  cream: "#F5EFDC",
  warm: "#E8DFD0",
  serif: '"Cormorant Garamond", "Cormorant", Georgia, serif',
  sans: '"DM Sans", system-ui, sans-serif',
  mono: '"DM Mono", monospace',
};

function getAllBiomarkers() {
  const panels = LABS_MERGED.panels;
  const categories = [
    { id: "metabolic", label: "Metabolic", markers: panels.metabolic || [] },
    { id: "lipids", label: "Lipid Studies", markers: panels.lipids || [] },
    { id: "liver", label: "Liver", markers: panels.liver || [] },
    { id: "hormones", label: "Hormones", markers: panels.hormones || [] },
    { id: "special", label: "Special Chemistry", markers: panels.special || [] },
  ].filter(c => c.markers.length > 0);

  const all = categories.flatMap(c => c.markers);
  const inRange = all.filter(b => b.status === "normal").length;
  const outOfRange = all.filter(b => b.status === "high" || b.status === "low").length;
  const improving = all.filter(b => {
    if (b.prev == null || b.status === "normal") return false;
    if (b.status === "high") return b.val < b.prev;
    if (b.status === "low") return b.val > b.prev;
    return false;
  }).length;

  return { categories, total: all.length, inRange, outOfRange, improving };
}

function SummaryBar({ inRange, outOfRange, improving, total }) {
  const inPct = (inRange / total) * 100;
  const outPct = (outOfRange / total) * 100;
  const impPct = (improving / total) * 100;
  return (
    <div style={{ display: "flex", height: 32, borderRadius: 6, overflow: "hidden", gap: 2 }}>
      <div style={{ width: `${inPct}%`, background: FH.green, borderRadius: "6px 0 0 6px", minWidth: inPct > 0 ? 8 : 0, transition: "width 0.8s ease" }} />
      <div style={{ width: `${outPct}%`, background: FH.terra, minWidth: outPct > 0 ? 8 : 0, transition: "width 0.8s ease" }} />
      <div style={{ width: `${Math.max(100 - inPct - outPct, 0)}%`, background: FH.sage, borderRadius: "0 6px 6px 0", minWidth: 4, transition: "width 0.8s ease", opacity: 0.5 }} />
    </div>
  );
}

function CountLabel({ count, label, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <span style={{ fontFamily: FH.serif, fontSize: 32, fontWeight: 600, color, lineHeight: 1, letterSpacing: "-0.02em" }}>{count}</span>
      <span style={{ fontFamily: FH.sans, fontSize: 12, color, fontWeight: 500, marginTop: 2 }}>{label}</span>
    </div>
  );
}

function BioAge() {
  return (
    <div style={{
      background: "linear-gradient(135deg, #7A9B82 0%, #5B8A6F 40%, #6B8FA0 100%)",
      borderRadius: 16, padding: "32px 28px", color: "#fff", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: "60%", height: "100%", background: "radial-gradient(ellipse at 80% 30%, rgba(255,255,255,0.12) 0%, transparent 70%)" }} />
      <div style={{ fontFamily: FH.serif, fontSize: 72, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.03em", position: "relative" }}>35.8</div>
      <div style={{ fontFamily: FH.sans, fontSize: 14, fontWeight: 500, opacity: 0.9, marginTop: 4, position: "relative" }}>Biological Age</div>
      <div style={{ fontFamily: FH.sans, fontSize: 12, opacity: 0.7, marginTop: 12, lineHeight: 1.5, maxWidth: 280, position: "relative" }}>
        Your biological age is <span style={{ fontWeight: 600 }}>3.2 years younger</span> than your chronological age of 39.
      </div>
    </div>
  );
}

function StatusDot({ status }) {
  const color = status === "normal" ? FH.green : status === "high" ? FH.terra : FH.terra;
  return <div style={{ width: 4, height: "100%", minHeight: 20, borderRadius: 2, background: color, flexShrink: 0 }} />;
}

function MarkerRow({ marker, isLast }) {
  const { name, val, unit, status, range, prev } = marker;
  const color = status === "normal" ? FH.green : FH.terra;
  const statusLabel = status === "normal" ? "In Range" : status === "high" ? "Above Range" : "Below Range";

  const delta = (prev != null && typeof val === "number" && typeof prev === "number")
    ? +(val - prev).toFixed(2) : null;
  const deltaUp = delta !== null && delta > 0;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "14px 0",
      borderBottom: isLast ? "none" : `1px solid ${FH.border}`,
    }}>
      <StatusDot status={status} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FH.sans, fontSize: 14, fontWeight: 500, color: FH.text, lineHeight: 1.3 }}>{name}</div>
        <div style={{ fontFamily: FH.sans, fontSize: 12, color: FH.muted, marginTop: 2 }}>
          {statusLabel} · <span style={{ fontFamily: FH.mono, fontSize: 11, color }}>{val}</span> <span style={{ fontSize: 11, color: FH.muted }}>{unit}</span>
        </div>
      </div>
      {delta !== null && (
        <div style={{
          fontFamily: FH.mono, fontSize: 10, color: status === "normal" ? FH.muted : (
            status === "high" ? (deltaUp ? FH.terra : FH.green) :
            (deltaUp ? FH.green : FH.terra)
          ),
          display: "flex", alignItems: "center", gap: 2, flexShrink: 0,
        }}>
          <span style={{ fontSize: 10 }}>{deltaUp ? "↑" : "↓"}</span>
          {Math.abs(delta)}
        </div>
      )}
    </div>
  );
}

function CategorySection({ category, isExpanded, onToggle }) {
  const { label, markers } = category;
  const inRange = markers.filter(b => b.status === "normal").length;
  const outCount = markers.length - inRange;

  return (
    <div style={{
      background: FH.card, borderRadius: 14, border: `1px solid ${FH.border}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden",
    }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 20px", border: "none", background: "transparent", cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontFamily: FH.sans, fontSize: 16, fontWeight: 600, color: FH.text, textAlign: "left" }}>
              {label} <span style={{ fontFamily: FH.sans, fontSize: 12, fontWeight: 400, color: FH.muted, marginLeft: 2 }}>›</span>
            </div>
            <div style={{ fontFamily: FH.sans, fontSize: 12, color: FH.muted, marginTop: 2, textAlign: "left" }}>
              {markers.length} Biomarkers
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {outCount > 0 && (
            <span style={{
              fontFamily: FH.sans, fontSize: 10, fontWeight: 600, color: FH.terra,
              background: FH.terraBg, padding: "3px 8px", borderRadius: 99,
            }}>{outCount} out</span>
          )}
          <span style={{
            fontFamily: FH.sans, fontSize: 16, color: FH.muted,
            transform: isExpanded ? "rotate(90deg)" : "none",
            transition: "transform 0.2s ease", display: "inline-block",
          }}>›</span>
        </div>
      </button>
      {isExpanded && (
        <div style={{ padding: "0 20px 8px" }}>
          {markers.map((m, i) => (
            <MarkerRow key={m.name + i} marker={m} isLast={i === markers.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function DetailCard({ marker }) {
  const { name, val, unit, range, status, prev } = marker;
  const color = status === "normal" ? FH.green : FH.terra;
  const statusLabel = status === "normal" ? "In Range" : status === "high" ? "Above Range" : "Below Range";

  // Parse range for visual
  let lo = null, hi = null;
  if (range) {
    const m1 = range.match(/([\d.]+)[–-]([\d.]+)/);
    if (m1) { lo = parseFloat(m1[1]); hi = parseFloat(m1[2]); }
    const m2 = range.match(/<\s*([\d.]+)/);
    if (m2) { lo = 0; hi = parseFloat(m2[1]); }
    const m3 = range.match(/[>≥]\s*([\d.]+)/);
    if (m3) { lo = parseFloat(m3[1]); hi = parseFloat(m3[1]) * 2.5; }
  }

  let pct = 50;
  if (lo !== null && hi !== null && hi > lo) {
    pct = Math.max(5, Math.min(95, ((val - lo) / (hi - lo)) * 100));
  }

  return (
    <div style={{
      background: FH.card, borderRadius: 14, border: `1px solid ${FH.border}`,
      padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{ fontFamily: FH.sans, fontSize: 12, fontWeight: 500, color: FH.sub, marginBottom: 4 }}>{name}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
        <span style={{ fontFamily: FH.serif, fontSize: 36, fontWeight: 600, color, lineHeight: 1, letterSpacing: "-0.02em" }}>{val}</span>
        <span style={{ fontFamily: FH.sans, fontSize: 12, color: FH.muted }}>{unit}</span>
      </div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px",
        borderRadius: 99, background: status === "normal" ? FH.greenBg : FH.terraBg,
        marginBottom: 14,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: 3, background: color }} />
        <span style={{ fontFamily: FH.sans, fontSize: 11, fontWeight: 500, color }}>{statusLabel}</span>
      </div>
      {/* Range bar */}
      {lo !== null && hi !== null && (
        <div style={{ marginTop: 8 }}>
          <div style={{ position: "relative", height: 6, background: FH.cardAlt, borderRadius: 3 }}>
            <div style={{
              position: "absolute", left: 0, top: 0, height: "100%",
              width: "100%", background: `linear-gradient(90deg, ${FH.terra}22 0%, ${FH.greenBg} 20%, ${FH.greenBg} 80%, ${FH.terra}22 100%)`,
              borderRadius: 3,
            }} />
            <div style={{
              position: "absolute", top: "50%", left: `${pct}%`,
              transform: "translate(-50%, -50%)", width: 12, height: 12,
              borderRadius: 6, background: color, border: "2px solid #fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontFamily: FH.mono, fontSize: 10, color: FH.muted }}>{range}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function BiomarkersPage() {
  const mob = useIsMobile();
  const { categories, total, inRange, outOfRange, improving } = getAllBiomarkers();
  const [expanded, setExpanded] = useState(new Set(["metabolic"]));
  const [view, setView] = useState("list"); // list or detail
  const [selectedMarker, setSelectedMarker] = useState(null);

  const toggle = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Out of range markers for the hero flags (deduplicated by name)
  const flaggedRaw = categories.flatMap(c => c.markers).filter(b => b.status !== "normal");
  const seen = new Set();
  const flagged = flaggedRaw.filter(b => { if (seen.has(b.name)) return false; seen.add(b.name); return true; });

  return (
    <div style={{
      fontFamily: FH.sans, color: FH.text,
      display: "flex", flexDirection: "column", gap: mob ? 16 : 20,
    }}>
      {/* Header */}
      <div>
        <div style={{ fontFamily: FH.serif, fontSize: mob ? 32 : 40, fontWeight: 600, color: FH.text, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          {total} Biomarkers
        </div>
      </div>

      {/* Summary counts */}
      <div style={{ display: "flex", gap: mob ? 24 : 40, flexWrap: "wrap" }}>
        <CountLabel count={inRange} label="In Range" color={FH.green} />
        <CountLabel count={outOfRange} label="Out of Range" color={FH.terra} />
        <CountLabel count={improving} label="Improving" color={FH.sage} />
      </div>

      {/* Stacked bar */}
      <SummaryBar inRange={inRange} outOfRange={outOfRange} improving={improving} total={total} />

      {/* View all link */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={() => {
            const allIds = categories.map(c => c.id);
            const allExpanded = allIds.every(id => expanded.has(id));
            setExpanded(allExpanded ? new Set() : new Set(allIds));
          }}
          style={{
            fontFamily: FH.sans, fontSize: 13, fontWeight: 500, color: FH.sub,
            background: "none", border: "none", cursor: "pointer", padding: 0,
            display: "flex", alignItems: "center", gap: 4,
          }}
        >
          {categories.every(c => expanded.has(c.id)) ? "Collapse all" : "View all"} <span style={{ fontSize: 14 }}>›</span>
        </button>
        <span style={{ fontFamily: FH.sans, fontSize: 11, color: FH.muted }}>
          Most recent: {LABS.date}
        </span>
      </div>

      {/* Biological Age card */}
      <BioAge />

      {/* Out of range flags */}
      {flagged.length > 0 && (
        <div style={{
          background: FH.terraBg, borderRadius: 14, padding: "14px 18px",
          border: `1px solid ${FH.terra}22`,
        }}>
          <div style={{ fontFamily: FH.sans, fontSize: 11, fontWeight: 600, color: FH.terra, marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Requires Attention
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {flagged.map((f, i) => (
              <div key={f.name + i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: FH.sans, fontSize: 12, fontWeight: 500, color: FH.terra }}>
                  {f.status === "high" ? "↑" : "↓"} {f.name}
                </span>
                <span style={{ fontFamily: FH.mono, fontSize: 11, color: FH.terra }}>
                  {f.val} {f.unit}
                </span>
                <span style={{ fontFamily: FH.sans, fontSize: 10, color: FH.muted }}>
                  (Ref: {f.range})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail cards grid for out-of-range markers */}
      {flagged.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: mob ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 12,
        }}>
          {flagged.map((m, i) => <DetailCard key={m.name + i} marker={m} />)}
        </div>
      )}

      {/* Category sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {categories.map(cat => (
          <CategorySection
            key={cat.id}
            category={cat}
            isExpanded={expanded.has(cat.id)}
            onToggle={() => toggle(cat.id)}
          />
        ))}
      </div>

      {/* Footer note */}
      <div style={{
        fontFamily: FH.sans, fontSize: 11, color: FH.muted, textAlign: "center",
        padding: "12px 0", lineHeight: 1.5,
      }}>
        Data from {LABS.source} · {LABS.date}<br/>
        Hormone and special chemistry values from {LABS_PRIOR.source} · {LABS_PRIOR.date}
      </div>
    </div>
  );
}
