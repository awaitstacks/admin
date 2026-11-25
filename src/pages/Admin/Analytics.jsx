import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { TourAdminContext } from "../../context/TourAdminContext";
import LeaveGuard from "../../components/LeaveGuard";

const MN = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
Chart.register(ChartDataLabels);

// ── Custom "lollipop stems" plugin ──────────────────────────────────────
// Used by the Traveller Status charts (year-wise + month-wise). Each
// category (Active/Cancelled/Rejected) gets its own thin vertical line
// ("stem") within a month/year slot, split into thirds so all 3 sit
// side-by-side without overlapping — a dot caps each stem, with the
// count drawn just above it. Built as a custom plugin (not a native
// Chart.js type) because Chart.js has no built-in lollipop chart type;
// this draws on top of an invisible scatter dataset that provides the
// x/y point positions.
const lollipopStemsPlugin = {
  id: "lollipopStems",
  afterDatasetsDraw(chart) {
    if (!chart.options._lollipop) return;
    const ctx = chart.ctx;
    const meta0 = chart.getDatasetMeta(0);
    const baseY = (meta0.data[0] && meta0.data[0].base !== undefined) ? meta0.data[0].base : chart.chartArea.bottom;

    // ── Responsive dot/line sizing ───────────────────────────────────
    // The 3 stems (Active/Cancelled/Rejected) sit at x ± 0.22 within each
    // category slot. On a narrow (mobile) canvas, each slot's pixel width
    // shrinks, so a fixed 5px dot radius starts visually overlapping its
    // neighbours. Scale the radius (and stem line width) down in
    // proportion to the actual pixel width available per category, with
    // sane floor/ceiling clamps so it never gets too small to see or too
    // big on wide desktop charts.
    const xScale = chart.scales.x;
    const categoryCount = Math.max(1, (xScale.max ?? 1) - (xScale.min ?? 0));
    const pxPerCategory = chart.chartArea.width / categoryCount;
    const k = chart.options._lollipopScale || 1; // PDF image la perusa (screen la 1)
    const dotRadius = Math.max(1.5, Math.min(3.5, pxPerCategory / 16)) * k;
    const lineWidth = Math.max(2.5, Math.min(2.5, pxPerCategory / 30)) * k;
    const fontSize = Math.round(Math.max(10, Math.min(11, Math.round(pxPerCategory / 9))) * k);

    chart.data.datasets.forEach((dataset) => {
      const dsIndex = chart.data.datasets.indexOf(dataset);
      const meta = chart.getDatasetMeta(dsIndex);
      meta.data.forEach((point, i) => {
        const raw = dataset.data[i];
        const value = raw && typeof raw === "object" ? raw.y : raw;
        if (!value) return;
        ctx.save();
        ctx.strokeStyle = dataset.borderColor;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(point.x, baseY);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(point.x, point.y, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = dataset.borderColor;
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.fillStyle = "#1a1a2e";
        ctx.font = `700 ${fontSize}px sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText(value, point.x, point.y - (dotRadius + 3));
        ctx.restore();
      });
    });
  }
};
Chart.register(lollipopStemsPlugin);

const fmt = (n) => !n ? "₹0" : n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(0)}K` : `₹${n}`;
const fmtFull = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;

/*
  ── RESPONSIVE STRATEGY ──────────────────────────────────────────
  Pure CSS media queries control all layout switching (no JS resize
  listener). This matches the TripEnquiries.jsx pattern, which works
  cleanly with the sidebar's CSS-only show/hide (lg: breakpoint =
  1024px in TourSidebar.jsx). A JS window.innerWidth listener can
  race against the sidebar's own CSS transition; pure CSS @media
  rules resolve in the same browser layout pass, so there's no
  mismatch between sidebar state and content layout.

  Breakpoints (aligned with sidebar's lg=1024px hide/show point):
    < 700px          -> mobile:  stat cards 2x2, charts stacked, card-expand list
    700px  - 1023px  -> tab:     stat cards 3x3, charts stacked, card-expand list (sidebar hidden, full width)
    1024px - 1250px  -> tabWide: stat cards 3x3, charts 2x2, real table (sidebar just appeared)
    > 1250px          -> desktop: stat cards auto-fit, charts 2x2, real table
*/

const RESPONSIVE_CSS = `
  .an-root, .an-root * { box-sizing: border-box; }
  .an-root img, .an-root canvas { max-width: 100%; }

  .an-stat-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; min-width: 0; }
  @media (max-width: 1250px) { .an-stat-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 6px; } }
  @media (max-width: 699px)  { .an-stat-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px; } }

  .an-chart-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 8px; min-width: 0; }
  @media (max-width: 1199px) { .an-chart-grid { grid-template-columns: 1fr !important; } }

  /* an-desk-table/an-mob-cards display switching is now handled in JS via
     the showTable boolean (window.innerWidth-driven), not CSS media queries.
     This avoids the table's fixed 760px minWidth ever existing in the DOM
     when the card-list view is active. */

  .an-sel { min-width: 0; max-width: 100%; box-sizing: border-box; width: 100%; }
  .an-search-wrap { min-width: 0; max-width: 100%; box-sizing: border-box; width: 100%; }

  /* ── Filter bar: 5-column grid on desktop/tab (8 items: range, year,
     month, type, status, search(span3), chips, clear — wraps 5+3),
     collapses to 2 columns on mobile (chips + clear share the last row
     together). All items including Clear stay in normal grid flow. ── */
  .an-fbar-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
  @media (max-width: 699px) { .an-fbar-grid { grid-template-columns: repeat(2, 1fr) !important; } }

  /* ── Hard containment against stale layout cache when resizing
     mobile -> desktop in devtools. Forces the browser to recompute
     width on every paint instead of reusing a cached narrow value. ── */
  html, body { overflow-x: hidden !important; max-width: 100vw; scrollbar-gutter: stable; }
  .an-root { contain: layout; }
  .an-desk-table-wrap { contain: layout; overflow-x: auto; max-width: 100%; }
`;

const S = {
  pg: { padding: 10, background: "#f4f6fb", minHeight: "100vh", fontFamily: "inherit", overflowX: "hidden", maxWidth: "100%", boxSizing: "border-box", width: "100%" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  h2: { fontSize: 17, fontWeight: 600, color: "#1a1a2e", display: "flex", alignItems: "center", gap: 6, margin: 0 },
  sub: { fontSize: 11, color: "#aaa", marginTop: 2 },

  sh: {
    fontSize: 12, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: ".05em",
    borderLeft: "3px solid #7c3aed", paddingLeft: 8, marginBottom: 8, marginTop: 4
  },

  card: { background: "#fff", borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: 8, boxShadow: "0 1px 4px rgba(0,0,0,.04)", minWidth: 0, overflow: "hidden" },
  ic: (bg) => ({ width: 34, height: 34, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15 }),
  lbl: { fontSize: 11, color: "#888", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  val: { fontSize: 18, fontWeight: 700, color: "#1a1a2e", lineHeight: 1.1 },

  cc: { background: "#fff", borderRadius: 12, padding: 10, boxShadow: "0 1px 4px rgba(0,0,0,.04)", minWidth: 0, overflow: "hidden" },
  ct: { fontSize: 12, fontWeight: 600, color: "#1a1a2e", marginBottom: 2 },
  cs: { fontSize: 11, color: "#aaa", marginBottom: 4 },
  leg: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4, fontSize: 11, color: "#666" },
  ld: (c) => ({ width: 9, height: 9, borderRadius: 2, background: c, flexShrink: 0, display: "inline-block" }),

  fbar: { background: "#fff", borderRadius: 12, padding: "10px 12px", marginBottom: 10, boxShadow: "0 1px 4px rgba(0,0,0,.04)", minWidth: 0, maxWidth: "100%", boxSizing: "border-box", position: "relative" },
  sel: { fontSize: 12, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", color: "#333", cursor: "pointer", minWidth: 0, maxWidth: "100%", boxSizing: "border-box" },
  sinp: { width: "100%", padding: "8px 12px 8px 32px", border: "1px solid #e5e7eb", borderRadius: 9, fontSize: 13, background: "#fff", color: "#333", outline: "none", boxSizing: "border-box" },
  drop: { position: "absolute", top: "calc(100% + 3px)", left: 0, right: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, zIndex: 99, maxHeight: 200, overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,.08)" },
  di: { padding: "7px 10px", fontSize: 12, cursor: "pointer", color: "#333" },
  chip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", background: "#f3f0ff", color: "#7c3aed", borderRadius: 20, fontSize: 11, fontWeight: 500 },
  clr: { fontSize: 11, padding: "5px 11px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", color: "#666", cursor: "pointer", flexShrink: 0 },

  tcard: { background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,.04)", minWidth: 0, maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" },
  th: { textAlign: "left", fontSize: 9, fontWeight: 600, color: "#aaa", padding: "7px 6px", borderBottom: "0.5px solid #eee", textTransform: "uppercase", letterSpacing: ".03em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  td: { padding: "7px 6px", borderBottom: "0.5px solid #f0f0f0", color: "#1a1a2e", verticalAlign: "middle", fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  badge: (s) => ({
    display: "inline-block", padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600,
    background: s === "Completed" ? "#dcfce7" : s === "Available" ? "#dbeafe" : s === "Soldout" ? "#fee2e2" : s === "Cancelled" ? "#fecaca" : s === "Booking Closed" ? "#e2e8f0" : "#fef9c3",
    color: s === "Completed" ? "#166534" : s === "Available" ? "#1e40af" : s === "Soldout" ? "#b45309" : s === "Cancelled" ? "#991b1b" : s === "Booking Closed" ? "#334155" : "#854d0e",
  }),
  pill: (c, bg, bc) => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 26, height: 24, padding: "0 5px", borderRadius: 12, fontSize: 10, fontWeight: 600, background: bg, color: c, border: `1.5px solid ${bc}` }),
};

// ── Tour status resolver (shared by the table view and the mobile/tab
// card-list view) ──────────────────────────────────────────────────
// Priority: trip cancelled (terminal, wins over everything) > Booking
// Closed (new bookings blocked, but trip still runs) > Soldout
// (available === false) > Available. "Completed" was dropped per
// request — Available/Soldout/Cancelled/Booking Closed are the only
// statuses shown now.
function getTourStatus(t) {
  if (t.tripCancelled) return "Cancelled";
  if (t.available === false) return "Soldout";     // ← unavailable+closed → "Soldout" (order swap matum)
  if (t.bookingClosed) return "Booking Closed";
  return "Available";
}

function ChartCanvas({ id, config, height = 220 }) {
  const ref = useRef(null);
  const inst = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    if (inst.current) inst.current.destroy();
    inst.current = new Chart(ref.current, config);
    return () => inst.current?.destroy();
  }, [JSON.stringify(config)]);
  return <div style={{ position: "relative", width: "100%", height }}><canvas id={id} ref={ref} /></div>;
}

function StatCard({ icon, iconBg, label, value }) {
  return (
    <div style={S.card}>
      <div style={S.ic(iconBg)}>{icon}</div>
      <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
        <div style={{ ...S.lbl, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
        <div style={S.val}>{value ?? 0}</div>
      </div>
    </div>
  );
}

function Section({ title, children, cols = 6 }) {
  // Desktop column count is explicit per-section (3 or 6) using safe 1fr tracks,
  // which can NEVER force the grid wider than its container (unlike minmax()
  // with a fixed px floor, which can blow out under certain intrinsic-sizing
  // edge cases). Mobile/tab breakpoints always override to 2 or 3 via CSS.
  return (
    <div style={{ marginBottom: 10, minWidth: 0, maxWidth: "100%" }}>
      <div style={S.sh}>{title}</div>
      <div className="an-stat-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {children}
      </div>
    </div>
  );
}

function TourBreakdown({ t, compact = false }) {
  const tot = (t.gvPool || 0) + (t.irctcPool || 0);

  if (compact) {
    const unverified = t.unverifiedTravellers || 0;
    const active = t.activeTravellers || 0;
    const cancelRequest = t.cancellationRequestTravellers || 0;
    const cancelled = t.fullyCancelledTravellers || 0;
    const tripCancelled = t.tripCancelledTravellers || 0;
    const rejected = t.rejectedTravellers || 0;
    const totalAll = unverified + active + cancelRequest + cancelled + tripCancelled + rejected;

    return (
      <div style={{ padding: "10px 12px", background: "#f8f9fb" }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: "#888", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".03em" }}>
          Traveller Status
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
          {[
            ["Total", totalAll, "#ede9fe", "#5b21b6"],
            ["Unverified", unverified, "#fef3c7", "#92400e"],
            ["Active", active, "#dcfce7", "#166534"],
            ["Cancel request", cancelRequest, "#fde8d8", "#9a3412"],
            ["Cancelled", cancelled, "#fee2e2", "#991b1b"],
            ["Trip cancelled", tripCancelled, "#f3f0ff", "#5b21b6"],
            ["Rejected", rejected, "#f3e8ff", "#6b21a8"],
          ].map(([lbl, val, bg, color]) => (
            <div key={lbl} style={{ display: "flex", flexDirection: "column", alignItems: "center", background: bg, borderRadius: 8, padding: "8px 6px", minWidth: 0 }}>
              <span style={{ fontSize: 10, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lbl}</span>
              <span style={{ fontWeight: 700, fontSize: 16, color, marginTop: 2 }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "10px 12px", background: "#f8f9fb" }}>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 8 }}>
        {[
          ["TNR", t.totalTNR || 0, "#fff", "#1a1a2e"],
          ["Travellers", t.totalTravellers || 0, "#f3f0ff", "#7c3aed"],
          ["Cancelled", t.cancelledTravellers || 0, "#fef2f2", "#dc2626"],
        ].map(([lbl, val, bg, color]) => (
          <div key={lbl} style={{ textAlign: "center", background: bg, borderRadius: 8, padding: "6px 4px", minWidth: 0 }}>
            <div style={{ fontSize: 9, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lbl}</div>
            <div style={{ fontWeight: 600, fontSize: 14, color }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#fdf2f8", borderRadius: 8, padding: "5px 4px" }}>
          <span style={{ fontSize: 9, color: "#9d174d" }}>Female</span>
          <span style={{ fontWeight: 600, fontSize: 13, color: "#9d174d" }}>{t.totalFemale || 0}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#eff6ff", borderRadius: 8, padding: "5px 4px" }}>
          <span style={{ fontSize: 9, color: "#1d4ed8" }}>Male</span>
          <span style={{ fontWeight: 600, fontSize: 13, color: "#1d4ed8" }}>{t.totalMale || 0}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#ecfeff", borderRadius: 8, padding: "5px 4px" }}>
          <span style={{ fontSize: 9, color: "#0891b2" }}>Others</span>
          <span style={{ fontWeight: 600, fontSize: 13, color: "#0891b2" }}>{t.totalOther || 0}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#fef9c3", borderRadius: 8, padding: "5px 4px" }}>
          <span style={{ fontSize: 9, color: "#854d0e" }}>Child</span>
          <span style={{ fontWeight: 600, fontSize: 13, color: "#854d0e" }}>{t.totalChild || 0}</span>
        </div>
      </div>

      <div style={{ fontSize: 9, fontWeight: 600, color: "#888", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".03em" }}>
        Traveller Status
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6, marginBottom: tot > 0 ? 8 : 0 }}>
        {[
          ["Unverified", t.unverifiedTravellers || 0, "#fef3c7", "#92400e"],
          ["Active", t.activeTravellers || 0, "#dcfce7", "#166534"],
          ["Cancel request", t.cancellationRequestTravellers || 0, "#fde8d8", "#9a3412"],
          ["Cancelled", t.fullyCancelledTravellers || 0, "#fee2e2", "#991b1b"],
          ["Trip cancelled", t.tripCancelledTravellers || 0, "#f3f0ff", "#5b21b6"],
          ["Rejected", t.rejectedTravellers || 0, "#f3e8ff", "#6b21a8"],
        ].map(([lbl, val, bg, color]) => (
          <div key={lbl} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: bg, borderRadius: 8, padding: "6px 8px", minWidth: 0 }}>
            <span style={{ fontSize: 10, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lbl}</span>
            <span style={{ fontWeight: 700, fontSize: 13, color, flexShrink: 0, marginLeft: 6 }}>{val}</span>
          </div>
        ))}
      </div>

      {tot > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
          {[["GV cancel", fmtFull(t.gvPool || 0), "#15803d"], ["IRCTC cancel", fmtFull(t.irctcPool || 0), "#b45309"], ["Total cancel", fmtFull(tot), "#1a1a2e"]].map(([lbl, val, color]) => (
            <div key={lbl} style={{ textAlign: "center", background: "#fff", borderRadius: 8, padding: "5px 4px", minWidth: 0 }}>
              <div style={{ fontSize: 9, color: "#888" }}>{lbl}</div>
              <div style={{ fontWeight: 600, fontSize: 11, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TourCard({ t, i }) {
  const [open, setOpen] = useState(false);
  const status = getTourStatus(t);

  return (
    <div style={{ border: "0.5px solid #eee", borderRadius: 10, marginBottom: 6, overflow: "hidden", maxWidth: "100%" }}>
      <div onClick={() => setOpen(p => !p)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", cursor: "pointer", gap: 8, background: "#fff" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#1a1a2e", whiteSpace: "normal", overflowWrap: "anywhere", lineHeight: 1.3 }}>
            {i + 1}. {t.tourName || "—"}
          </div>
          <div style={{ fontSize: 10, color: "#aaa", marginTop: 1 }}>{t.tourType || ""}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={S.badge(status)}>{status}</span>
          <span style={{ fontSize: 14, color: "#aaa", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }}>▾</span>
        </div>
      </div>
      {open && (
        <div style={{ borderTop: "0.5px solid #eee" }}>
          <TourBreakdown t={t} />
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  PDF REPORT — Sales Analytics (A4 landscape, browser print → Save as PDF)
//  Cards + ellaa charts (image ah) + Tour profile table — ippo irukkura filters oda
// ════════════════════════════════════════════════════════════════
const pdfEsc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// Chart font perusa — PDF la padikka easy
const bumpFonts = (o, f) => {
  if (Array.isArray(o)) return o.map((x) => bumpFonts(x, f));
  if (!o || typeof o !== "object") return o;
  const out = {};
  Object.keys(o).forEach((k) => {
    const v = o[k];
    if (k === "font" && v && typeof v === "object" && !Array.isArray(v) && typeof v.size === "number") out[k] = { ...v, size: Math.round(v.size * f) };
    else out[k] = typeof v === "function" ? v : bumpFonts(v, f);
  });
  return out;
};
// Page la irukkura adhe chart config → high quality PNG (screen chart ah thodaadhu)
// PDF ku chart style — smooth line + light fill, perusa points, bar thickness limit
const hexA = (c, a) => (typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c) ? `${c}${a}` : c);
const prettyData = (type, data) => {
  const d = JSON.parse(JSON.stringify(data || {})); // screen chart oda data ah share pannaadhu
  (d.datasets || []).forEach((ds) => {
    if (type === "line") {
      Object.assign(ds, { tension: 0.35, fill: "origin", backgroundColor: hexA(ds.borderColor, "1F"), borderWidth: 4, pointRadius: 7, pointHoverRadius: 7, pointBorderColor: "#fff", pointBorderWidth: 2.5 });
    } else if (type === "bar") {
      Object.assign(ds, { maxBarThickness: 110, borderRadius: ds.stack ? 4 : 10 });
    }
  });
  return d;
};
const chartToImage = (config, w = 1500, h = 700, f = 1.9) => {
  const holder = document.createElement("div");
  holder.style.cssText = `position:fixed;left:-99999px;top:0;width:${w}px;height:${h}px;`;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
  holder.appendChild(canvas);
  document.body.appendChild(holder);
  let chart;
  try {
    const opts = bumpFonts(config.options || {}, f);
    const pad = opts.layout?.padding || {};
    chart = new Chart(canvas, {
      ...config,
      data: prettyData(config.type, config.data),
      options: {
        ...opts,
        _lollipopScale: f,
        layout: { padding: { top: (pad.top || 10) * 1.6, right: (pad.right || 10) + 20, left: 10, bottom: 6 } },
        responsive: false, maintainAspectRatio: false, animation: false, devicePixelRatio: 2,
      },
    });
    chart.draw();
    return canvas.toDataURL("image/png");
  } catch (e) {
    console.error("chart image error:", e);
    return "";
  } finally {
    chart?.destroy();
    holder.remove();
  }
};
// Chart keezha "key numbers" — ovvoru dataset total + peak
const chartStats = (config, money) => {
  const labels = config.data?.labels || [];
  const val = (p) => (p && typeof p === "object" ? Number(p.y) || 0 : Number(p) || 0);
  const lab = (p, i) => (p && typeof p === "object" ? labels[Math.round(p.x)] : labels[i]);
  const show = (n) => (money ? fmtFull(n) : Number(n || 0).toLocaleString("en-IN"));
  const out = [];
  (config.data?.datasets || []).forEach((ds) => {
    const pts = ds.data || [];
    const total = pts.reduce((a, p) => a + val(p), 0);
    const color = typeof ds.borderColor === "string" && ds.borderColor !== "transparent" ? ds.borderColor : ds.backgroundColor;
    out.push({ label: `${ds.label || "Total"}`, value: show(total), color });
  });
  // Peak — ellaa datasets layum sethu adhigamaana value (GV / IRCTC edhu adhigamo adhu)
  let best = 0, bLab = "", bName = "";
  (config.data?.datasets || []).forEach((ds) => {
    (ds.data || []).forEach((p, i) => { if (val(p) > best) { best = val(p); bLab = lab(p, i) ?? "—"; bName = ds.label || "Total"; } });
  });
  if (best > 0) out.push({ label: (config.data?.datasets || []).length > 1 ? `Highest · ${bName}` : "Highest", value: `${bLab} · ${show(best)}`, color: "#111827", peak: true });
  return out;
};

const PDF_STATUS = {
  Available: ["#DBEAFE", "#1E40AF"], Soldout: ["#FFEDD5", "#B45309"], Cancelled: ["#FEE2E2", "#991B1B"], "Booking Closed": ["#E2E8F0", "#334155"],
};
const TOURS_PER_PAGE = 10; // oru page ku 10 rows — idaiveli vittu

function buildSalesPdfHtml({ filterText, hero, sections, charts, tours, totals }) {
  const now = new Date();
  const gen = `${now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
  const head = (sub) => `<header class="hd">
      <div class="brand"><div class="logo">📊</div><div><h1>Sales Analytics Report</h1><div class="sub">${pdfEsc(sub)}</div></div></div>
      <div class="meta"><b>GV - Tour Planners LLP</b><span>${pdfEsc(filterText)}</span></div>
    </header>`;
  const foot = `<footer class="pf"><span>Generated on ${pdfEsc(gen)}</span><span class="pno"></span></footer>`;

  // Page 1 — hero + ellaa sections
  const heroHtml = `<div class="hero">${hero.map(([icon, label, value, c1, c2]) => `
      <div class="hcard" style="background:linear-gradient(135deg, ${c1}, ${c2})"><div class="hic">${icon}</div><div><span>${pdfEsc(label)}</span><b>${pdfEsc(value)}</b></div></div>`).join("")}</div>`;
  // Section — oru varisai cards (center la icon + perusaana number + label)
  const secBlock = ({ title, color, items }) => `
      <div class="sx"><div class="sh" style="--c:${color}">${pdfEsc(title)}</div>
        <div class="grid" style="grid-template-columns:repeat(${items.length}, 1fr)">${items.map(([icon, label, value, bg, fg]) => `
          <div class="st" style="--fg:${fg || "#111827"};--bg:${bg}"><div class="ic" style="background:${bg}">${icon}</div><b class="vl" style="color:${fg || "#111827"}${String(value).length > 8 ? ";font-size:24px" : ""}">${pdfEsc(value)}</b><span class="lb">${pdfEsc(label)}</span></div>`).join("")}</div>
      </div>`;
  // Summary 2 page: 1) hero + Tours + Tour bookings  2) Travellers + Gender + Cancellation
  const page1 = `<section class="page">${head("Summary · 1 of 2")}${heroHtml}<div class="secs">${sections.slice(0, 2).map(secBlock).join("")}</div>${foot}</section>`;
  const page2 = `<section class="page">${head("Summary · 2 of 2")}<div class="secs">${sections.slice(2).map(secBlock).join("")}</div>${foot}</section>`;

  // Chart pages — oru page ku oru perusaana chart
  const chartPages = charts.map((c, i) => `<section class="page">${head(`Charts · ${i + 1} of ${charts.length}`)}
      <div class="chart">
        <div class="ctop">
          <div><div class="ct"><span class="cno">${i + 1}</span>${pdfEsc(c.title)}</div><div class="cs">${pdfEsc(c.sub)}</div></div>
          ${c.legend?.length ? `<div class="lg">${c.legend.map(([col, l]) => `<span><i style="background:${col}"></i>${pdfEsc(l)}</span>`).join("")}</div>` : ""}
        </div>
        <div class="cimg">${c.img ? `<img src="${c.img}" alt="">` : `<div class="noimg">Chart not available</div>`}</div>
        ${c.stats?.length ? `<div class="kst">${c.stats.map((k) => `<div class="k${k.peak ? " pk" : ""}" style="--k:${k.color || "#7C3AED"}"><span>${pdfEsc(k.label)}</span><b>${pdfEsc(k.value)}</b></div>`).join("")}</div>` : ""}
      </div>${foot}</section>`);

  // Tour table pages
  const th = ["S.No", "Tour name", "TNR", "Travellers", "Cancelled", "Trip cancelled", "Female", "Male", "Others", "Child", "GV cancel", "IRCTC cancel", "Total cancel", "Status"];
  const cols = ["4.5%", "", "4.5%", "6.5%", "6.5%", "6.5%", "5.5%", "5%", "5.5%", "4.5%", "7.5%", "7.5%", "7.5%", "10.5%"];
  const colgroup = `<colgroup>${cols.map((w) => `<col${w ? ` style="width:${w}"` : ""}>`).join("")}</colgroup>`;
  const thead = `<thead><tr>${th.map((h, i) => `<th${i > 1 ? ' class="c"' : ""}>${h}</th>`).join("")}</tr></thead>`;
  const num = (n, cls = "") => `<td class="c ${cls}">${n || 0}</td>`;
  const tRows = tours.map((t, i) => {
    const [bg, fg] = PDF_STATUS[t.status] || ["#FEF9C3", "#854D0E"];
    return `<tr><td class="c mut">${i + 1}</td>
      <td><b class="tn">${pdfEsc(t.tourName || "—")}</b><span class="tt">${pdfEsc(t.tourType || "")}</span></td>
      ${num(t.totalTNR, "b")}${num(t.totalTravellers, "pur b")}
      <td class="c"><span class="pl" style="--b:#FECACA;--f:#DC2626">${t.cancelledTravellers || 0}</span></td>
      <td class="c"><span class="pl" style="--b:#DDD6FE;--f:#7C3AED">${t.tripCancelledTravellers || 0}</span></td>
      <td class="c"><span class="pl" style="--b:#FBCFE8;--f:#9D174D">${t.totalFemale || 0}</span></td>
      <td class="c"><span class="pl" style="--b:#BFDBFE;--f:#1D4ED8">${t.totalMale || 0}</span></td>
      <td class="c"><span class="pl" style="--b:#A5F3FC;--f:#0E7490">${t.totalOther || 0}</span></td>
      <td class="c"><span class="pl" style="--b:#FDE68A;--f:#854D0E">${t.totalChild || 0}</span></td>
      <td class="c gv">${pdfEsc(fmtFull(t.gvPool || 0))}</td><td class="c ir">${pdfEsc(fmtFull(t.irctcPool || 0))}</td>
      <td class="c b">${pdfEsc(fmtFull((t.gvPool || 0) + (t.irctcPool || 0)))}</td>
      <td class="c"><span class="bd" style="background:${bg};color:${fg}">${pdfEsc(t.status)}</span></td></tr>`;
  });
  const tfoot = `<tfoot><tr><td></td><td>Total · ${tours.length} tours</td>${num(totals.tnr)}${num(totals.pax, "pur")}${num(totals.canc)}${num(totals.trip)}${num(totals.fem)}${num(totals.mal)}${num(totals.oth)}${num(totals.chi)}
      <td class="c gv">${pdfEsc(fmtFull(totals.gv))}</td><td class="c ir">${pdfEsc(fmtFull(totals.ir))}</td><td class="c">${pdfEsc(fmtFull(totals.gv + totals.ir))}</td><td></td></tr></tfoot>`;
  // Table pages — script pirikkum (max 10 rows / page; peru 2 line aanaalum page ku veliya pogaadhu)
  const tablePage = `<section class="page tpg">${head("Tour profile performance")}
      <div class="tw"><table>${colgroup}${thead}<tbody></tbody></table></div>${foot}</section>`;
  const tableData = `<template id="tpl">${tablePage}</template>
    <template id="trows"><table><tbody>${tRows.join("") || `<tr><td colspan="14" class="empty">No tours match</td></tr>`}</tbody>${tfoot}</table></template>`;
  const tablePages = [`<div id="tpages"></div>`, tableData];

  const pages = [page1, page2, ...chartPages, ...tablePages];
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Sales Analytics Report - ${pdfEsc(filterText)}</title>
<style>
  @page { size: A4 landscape; margin: 8mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; font-family: "Segoe UI", Roboto, Arial, sans-serif; color: #111827; background: #E9ECF3; font-size: 12px; }
  .bar { position: sticky; top: 0; z-index: 2; display: flex; gap: 10px; justify-content: center; align-items: center; padding: 10px; background: #fff; border-bottom: 1px solid #E5E7EB; }
  .bar button { border: 0; border-radius: 8px; padding: 9px 20px; font-weight: 700; font-size: 14px; cursor: pointer; background: #7C3AED; color: #fff; }
  .bar button.sec { background: #E5E7EB; color: #374151; }
  .bar .hint { padding: 8px 14px; border-radius: 8px; background: #FEF3C7; border: 2px solid #F59E0B; color: #92400E; font-size: 15px; font-weight: 700; }
  .bar .hint b { color: #B91C1C; font-weight: 800; text-decoration: underline; }
  .page { width: 281mm; height: 193mm; overflow: hidden; margin: 14px auto; background: #fff; display: flex; flex-direction: column; position: relative; }
  @media screen { .page { width: 297mm; height: 209mm; padding: 8mm; box-shadow: 0 2px 10px rgba(0,0,0,.08); } }
  .page > * { flex-shrink: 0; }
  .hd { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border-radius: 12px; color: #fff;
        background: linear-gradient(120deg, #4C1D95 0%, #6D28D9 45%, #2563EB 100%); }
  .brand { display: flex; align-items: center; gap: 12px; }
  .logo { width: 40px; height: 40px; border-radius: 10px; background: rgba(255,255,255,.18); display: flex; align-items: center; justify-content: center; font-size: 22px; }
  .hd h1 { margin: 0; font-size: 21px; letter-spacing: .3px; }
  .hd .sub { font-size: 12px; opacity: .85; margin-top: 1px; text-transform: uppercase; letter-spacing: 1.2px; font-weight: 600; }
  .meta { text-align: right; } .meta b { display: block; font-size: 15px; } .meta span { font-size: 11.5px; opacity: .9; }
  .hero { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 10px; }
  .hcard { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 12px; color: #fff; }
  .hic { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,.22); display: flex; align-items: center; justify-content: center; font-size: 19px; flex-shrink: 0; }
  .hcard span { display: block; font-size: 11px; font-weight: 600; opacity: .92; } .hcard b { display: block; font-size: 22px; line-height: 1.15; }
  .secs { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; justify-content: space-evenly; gap: 14px; margin-top: 6px; }
  .sx { flex: 0 0 auto; display: flex; flex-direction: column; }
  .sx .sh { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: .1em; color: #374151; border-left: 5px solid var(--c); padding-left: 10px; margin-bottom: 8px; }
  .grid { display: grid; gap: 10px; grid-auto-rows: 33mm; } /* box height kammi — sections naduvula gap */
  .st { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 4px; padding: 8px 8px; border-radius: 14px;
        border: 1px solid #ECEEF4; border-top: 5px solid var(--fg); background: linear-gradient(180deg, var(--bg) 0%, #FFFFFF 70%); min-width: 0; }
  .ic { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 17px; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
  .st .vl { font-size: 27px; font-weight: 800; line-height: 1.05; white-space: nowrap; }
  .st .lb { font-size: 12px; color: #4B5563; font-weight: 700; line-height: 1.25; }
  .chart { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; margin-top: 10px; border: 1px solid #E5E7EB; border-radius: 16px; padding: 12px 18px 12px; background: linear-gradient(180deg, #FFFFFF 0%, #FAF9FF 100%); }
  .ctop { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
  .ct { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 800; color: #1F2937; }
  .cno { width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(135deg, #7C3AED, #2563EB); color: #fff; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; }
  .cs { font-size: 12px; color: #6B7280; margin: 2px 0 0 38px; }
  .lg { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
  .lg span { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: #F3F4F6; font-size: 12px; font-weight: 600; color: #374151; }
  .lg i { width: 11px; height: 11px; border-radius: 3px; display: inline-block; }
  .cimg { flex: 1 1 auto; min-height: 0; display: flex; align-items: center; justify-content: center; margin-top: 6px; }
  .cimg img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .kst { display: flex; gap: 10px; margin-top: 8px; }
  .k { flex: 1 1 0; min-width: 0; border-radius: 12px; padding: 8px 12px; background: #fff; border: 1px solid #E5E7EB; border-top: 4px solid var(--k); }
  .k span { display: block; font-size: 11px; color: #6B7280; font-weight: 600; } .k b { display: block; font-size: 18px; color: var(--k); white-space: nowrap; }
  .k.pk { background: #F5F3FF; border-color: #DDD6FE; border-top-color: #7C3AED; } .k.pk b { color: #4C1D95; }
  .noimg { flex: 1; display: flex; align-items: center; justify-content: center; color: #9CA3AF; }
  .tw { margin-top: 10px; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  th { background: #EDE9FE; color: #4C1D95; font-size: 11.5px; font-weight: 800; padding: 10px 8px; border: 1px solid #C4B5FD; text-align: left; }
  td { padding: 8px 8px; border: 1px solid #E5E7EB; font-size: 12px; height: 13.6mm; vertical-align: middle; }
  tbody tr:nth-child(even) td { background: #FAF9FF; }
  .c { text-align: center; } .b { font-weight: 700; } .mut { color: #9CA3AF; } .pur { color: #7C3AED; font-weight: 700; }
  .tn { display: block; white-space: normal; overflow-wrap: anywhere; line-height: 1.25; } .tt { display: block; font-size: 10px; color: #9CA3AF; }
  .pl { display: inline-block; min-width: 26px; padding: 2px 6px; border-radius: 12px; border: 1.5px solid var(--b); color: var(--f); font-weight: 700; font-size: 11px; }
  .gv { color: #15803D; font-weight: 700; } .ir { color: #B45309; font-weight: 700; }
  .bd { display: inline-block; max-width: 100%; padding: 3px 9px; border-radius: 10px; font-size: 10.5px; font-weight: 700; white-space: nowrap; }
  tfoot td { background: #F5F3FF !important; font-weight: 800; border-top: 2px solid #7C3AED; }
  td.empty { text-align: center; color: #6B7280; height: 24mm; }
  .pf { margin-top: auto; padding-top: 6px; display: flex; justify-content: space-between; font-size: 10px; color: #9CA3AF; border-top: 1px solid #F3F4F6; }
  .pf > span { flex: 1; } .pf > .pno { text-align: right; } .pf > .eor { text-align: center; font-weight: 800; color: #4B5563; }
  @media print {
    body { background: #fff; } .bar { display: none; }
    .page { margin: 0; box-shadow: none; page-break-after: always; break-after: page; }
    .page:last-child { page-break-after: auto; break-after: auto; }
  }
</style></head><body>
  <div class="bar"><button onclick="window.print()">Save as PDF</button><button class="sec" onclick="window.close()">Close</button><span class="hint">⚠️ In the print box, set <b>Orientation → Landscape</b> before saving</span></div>
  ${pages.join("")}
  <script>
    (function () {
      // Tour table — page page ah
      var MAX = ${TOURS_PER_PAGE}, holder = document.getElementById("tpages"), src = document.getElementById("trows").content;
      var rows = Array.prototype.slice.call(src.querySelectorAll("tbody > tr")), tf = src.querySelector("tfoot");
      function np() { var p = document.getElementById("tpl").content.firstElementChild.cloneNode(true); holder.appendChild(p); return p; }
      function over(p) { return p.scrollHeight > p.clientHeight + 1; }
      var pg = np(), body = pg.querySelector("tbody"), n = 0;
      rows.forEach(function (tr) {
        if (n >= MAX) { pg = np(); body = pg.querySelector("tbody"); n = 0; }
        body.appendChild(tr); n++;
        if (n > 1 && over(pg)) { body.removeChild(tr); pg = np(); body = pg.querySelector("tbody"); body.appendChild(tr); n = 1; }
      });
      if (tf) {
        var t = pg.querySelector("table"); t.appendChild(tf);
        if (over(pg) && body.children.length > 1) { var lr = body.lastElementChild; t.removeChild(tf); body.removeChild(lr); pg = np(); body = pg.querySelector("tbody"); body.appendChild(lr); pg.querySelector("table").appendChild(tf); }
      }
      var ps = document.querySelectorAll(".page");
      ps.forEach(function (p, i) {
        var n = p.querySelector(".pno"); if (n) n.textContent = "Page " + (i + 1) + " of " + ps.length;
        // Report mudiyura page footer la naduvula "End of Report" (adhe font size, bold)
        if (n && i === ps.length - 1) { var e = document.createElement("span"); e.className = "eor"; e.textContent = "End of Report"; n.before(e); }
      });
      var imgs = Array.prototype.slice.call(document.images);
      Promise.all(imgs.map(function (im) { return im.complete ? 0 : new Promise(function (r) { im.onload = im.onerror = r; }); }))
        .then(function () { setTimeout(function () { try { window.print(); } catch (e) {} }, 400); });
    })();
  </script>
</body></html>`;
}

export default function Analytics() {
  const {
    getAnalyticsSummaryData,
    getAnalyticsYearWise,
    getAnalyticsMonthWise,
    getAnalyticsCancellation,
    getAnalyticsTourList,
    searchAnalyticsTours,
  } = useContext(TourAdminContext);

  const [filters, setFilters] = useState({ year: "", month: "", type: "", status: "" });
  // ── Range filter (year range + month range, independent AND filters) ──
  // When rangeMode is on, fromYear/toYear and fromMonth/toMonth take
  // priority over the single year/month dropdowns above.
  const [rangeMode, setRangeMode] = useState(false);
  const [range, setRange] = useState({ fromYear: "", toYear: "", fromMonth: "", toMonth: "" });
  const [selTours, setSelTours] = useState([]);
  const [searchQ, setSearchQ] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [searchRes, setSearchRes] = useState([]);
  const [summary, setSummary] = useState({});
  const [yearWise, setYearWise] = useState([]);
  const [allAvailableYears, setAllAvailableYears] = useState([]);
  useEffect(() => {
    getAnalyticsYearWise({}).then(yw => {
      setAllAvailableYears((yw.data || []).map(d => d._id));
    }).catch(console.error);
  }, []);
  const [monthWise, setMonthWise] = useState([]);
  const [cancelYW, setCancelYW] = useState([]);
  const [cancelMW, setCancelMW] = useState([]);
  const [tourList, setTourList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const dropRef = useRef(null);

  // ── Container-width tracking for table-vs-card-list decision ──────────
  // Uses window.innerWidth + a resize listener. The previous ResizeObserver
  // approach measured the .an-root container directly, but in practice its
  // callback wasn't reliably triggering a re-render (containerWidth stayed
  // null, so showTable's `containerWidth === null` fallback always won and
  // the table rendered even on narrow/mobile viewports). A plain window
  // resize listener is simpler and has none of that ambiguity — it always
  // fires, and the state update always triggers a re-render.
  const rootRef = useRef(null);
  const [winWidth, setWinWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setWinWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  // Table only shows on true DESKTOP now (per request) — every tablet and
  // mobile width, however wide, gets the expand-card list instead. Using
  // raw winWidth (not content-area-minus-sidebar) keeps this a simple,
  // predictable single threshold: 1250px matches the original "desktop"
  // tier from the responsive strategy notes above.
  const showTable = winWidth >= 1250;

  const tourIdParam = selTours.map(t => t._id.toString()).join(",");

  // ── IMPORTANT: TourAdminContext functions must also be updated ────────
  // getAnalyticsYearWise and getAnalyticsMonthWise currently accept
  // (year) as a single positional arg (per existing context). The calls
  // below pass an extra params object for range support — the context
  // functions need a matching update to forward fromYear/toYear/
  // fromMonth/toMonth into the query string. See the accompanying
  // TourAdminContext patch notes.

  useEffect(() => {
    Promise.all([
      getAnalyticsYearWise(rangeMode ? { fromYear: range.fromYear, toYear: range.toYear } : {}),
      getAnalyticsCancellation({ view: "year", ...(rangeMode ? { fromYear: range.fromYear, toYear: range.toYear } : {}) }),
    ]).then(([yw, ca]) => {
      setYearWise(yw.data || []);
      setCancelYW(ca.data || []);
    }).catch(console.error);
  }, [rangeMode, range.fromYear, range.toYear]);

  useEffect(() => {
    if (rangeMode) {
      // Range mode: month-wise chart spans the whole year+month range,
      // not just a single selected year.
      // IMPORTANT: pass `undefined` (not `null`) for the year arg — JS
      // default parameters only kick in for `undefined`, not `null`.
      // Passing `null` here previously caused the context function's
      // `year = new Date().getFullYear()` default to NOT apply, and a
      // literal year=null ended up in the request URL.
      Promise.all([
        getAnalyticsMonthWise(undefined, { fromYear: range.fromYear, toYear: range.toYear, fromMonth: range.fromMonth, toMonth: range.toMonth }),
        getAnalyticsCancellation({ view: "month", fromYear: range.fromYear, toYear: range.toYear, fromMonth: range.fromMonth, toMonth: range.toMonth }),
      ]).then(([mw, cm]) => {
        setMonthWise(mw.data || []);
        setCancelMW(cm.data || []);
      }).catch(console.error);
    } else {
      const y = filters.year || new Date().getFullYear();
      Promise.all([
        getAnalyticsMonthWise(y),
        getAnalyticsCancellation({ view: "month", year: y }),
      ]).then(([mw, cm]) => {
        setMonthWise(mw.data || []);
        setCancelMW(cm.data || []);
      }).catch(console.error);
    }
  }, [filters.year, rangeMode, range.fromYear, range.toYear, range.fromMonth, range.toMonth]);

  const fetchFiltered = useCallback(async () => {
    setTableLoading(true);
    try {
      const dateParams = rangeMode
        ? { fromYear: range.fromYear, toYear: range.toYear, fromMonth: range.fromMonth, toMonth: range.toMonth }
        : { year: filters.year, month: filters.month };
      const [sum, list] = await Promise.all([
        getAnalyticsSummaryData({ ...dateParams, tourId: tourIdParam }),
        getAnalyticsTourList({ ...dateParams, type: filters.type, status: filters.status, tourId: tourIdParam }),
      ]);
      setSummary(sum.data || {});
      setTourList(list.data || []);
    } catch (e) { console.error(e); }
    finally { setTableLoading(false); setLoading(false); }
  }, [filters, tourIdParam, rangeMode, range]);

  useEffect(() => { fetchFiltered(); }, [fetchFiltered]);

  useEffect(() => {
    if (searchQ.length < 1) { setSearchRes([]); setShowDrop(false); return; }
    const dateParams = rangeMode
      ? { fromYear: range.fromYear, toYear: range.toYear, fromMonth: range.fromMonth, toMonth: range.toMonth }
      : { year: filters.year, month: filters.month };
    searchAnalyticsTours({ q: searchQ, ...dateParams, status: filters.status })
      .then(r => { setSearchRes(r.data || []); setShowDrop((r.data || []).length > 0); })
      .catch(console.error);
  }, [searchQ, filters.year, filters.month, filters.status, rangeMode, range]);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selTour = (t) => { if (!selTours.find(s => s._id.toString() === t._id.toString())) setSelTours(p => [...p, t]); setSearchQ(""); setShowDrop(false); };
  const removeTour = (id) => setSelTours(p => p.filter(t => t._id.toString() !== id.toString()));
  const clearAll = () => {
    setFilters({ year: "", month: "", type: "", status: "" });
    setRange({ fromYear: "", toYear: "", fromMonth: "", toMonth: "" });
    setSelTours([]);
    setSearchQ("");
  };

  // Fixed chart height; layout (1-col vs 2-col) is handled entirely by
  // the .an-chart-grid CSS media query above, not by JS.
  const chartH = 200;

  const chartYW = {
    type: "bar",
    data: { labels: yearWise.map(d => d._id), datasets: [{ data: yearWise.map(d => d.travellers || 0), backgroundColor: "#2563eb", borderRadius: 5, barPercentage: .55 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, datalabels: { anchor: "end", align: "top", color: "#1a1a2e", font: { size: 10, weight: "600" }, formatter: v => v > 0 ? v.toLocaleString() : "" } },
      scales: { x: { ticks: { font: { size: 9 } }, grid: { display: false } }, y: { ticks: { font: { size: 9 } }, grid: { color: "rgba(0,0,0,0.05)" } } },
      layout: { padding: { top: 20 } }
    }
  };

  const mwFull = Array.from({ length: 12 }, (_, i) => { const f = monthWise.find(d => d.month === i + 1); return f ? (f.travellers || 0) : 0; });
  const chartMW = {
    type: "line",
    data: {
      labels: MN.slice(1), datasets: [{
        data: mwFull,
        borderColor: "#7c3aed", backgroundColor: "transparent",
        tension: 0, fill: false, borderWidth: 2.5,
        pointRadius: 5, pointBackgroundColor: "#7c3aed",
        pointBorderColor: "#7c3aed", pointBorderWidth: 0,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        datalabels: { anchor: "top", align: "top", offset: 6, color: "#5b21b6", font: { size: 10, weight: "700" }, formatter: v => v > 0 ? v.toLocaleString() : "" }
      },
      scales: {
        x: { ticks: { font: { size: 9 }, color: "#888" }, grid: { display: false }, border: { display: false } },
        y: { ticks: { font: { size: 9 }, color: "#bbb", callback: v => v >= 1000 ? `${v / 1000}K` : v }, grid: { color: "rgba(0,0,0,0.05)" }, border: { display: false }, min: 0 }
      },
      layout: { padding: { top: 32, right: 16 } }
    }
  };

  // ── Traveller status: lollipop charts (year-wise + month-wise) ──────
  // Each category (Active/Cancelled/Rejected) gets its own thin stem
  // within a month/year slot, offset by ±1/3 of the slot width so all
  // 3 sit side-by-side without overlapping (Active left, Cancelled
  // center, Rejected right). Built on Chart.js's "scatter" type (which
  // gives free control over exact x position per point) + the
  // lollipopStemsPlugin registered above, since stock Chart.js has no
  // lollipop chart type.
  //
  // "Active" total = activeTravellers + unverifiedTravellers +
  // cancellationRequestTravellers (combined display rule — NOT the same
  // as the Average Travellers card, which excludes unverifiedTravellers).
  const ywLabels = yearWise.map(d => d._id);
  const ywActiveVals = yearWise.map(d => (d.activeTravellers || 0) + (d.unverifiedTravellers || 0) + (d.cancellationRequestTravellers || 0));
  const ywCancelledVals = yearWise.map(d => d.cancelledTravellers || 0);
  const ywTripCancelledVals = yearWise.map(d => d.tripCancelledTravellers || 0);
  const ywRejectedVals = yearWise.map(d => d.rejectedTravellers || 0);

  const chartTravStatusYW = {
    type: "scatter",
    data: {
      labels: ywLabels,
      datasets: [
        { label: "Active", data: ywActiveVals.map((v, i) => v ? { x: i - 0.3, y: v } : null).filter(Boolean), borderColor: "#16a34a", backgroundColor: "transparent", pointRadius: 0 },
        { label: "Cancelled", data: ywCancelledVals.map((v, i) => v ? { x: i - 0.1, y: v } : null).filter(Boolean), borderColor: "#f97316", backgroundColor: "transparent", pointRadius: 0 },
        { label: "Trip Cancelled", data: ywTripCancelledVals.map((v, i) => v ? { x: i + 0.1, y: v } : null).filter(Boolean), borderColor: "#8b5cf6", backgroundColor: "transparent", pointRadius: 0 },
        { label: "Rejected", data: ywRejectedVals.map((v, i) => v ? { x: i + 0.3, y: v } : null).filter(Boolean), borderColor: "#dc2626", backgroundColor: "transparent", pointRadius: 0 },
      ]
    },
    options: {
      _lollipop: true,
      responsive: true, maintainAspectRatio: false,
      layout: { padding: { top: 24 } },
      plugins: { legend: { display: false }, tooltip: { enabled: false }, datalabels: { display: false } },
      scales: {
        x: {
          type: "linear", min: -0.6, max: Math.max(0, ywLabels.length - 1) + 0.6,
          afterBuildTicks: (axis) => {
            axis.ticks = ywLabels.map((_, i) => ({ value: i }));
          },
          ticks: { callback: (v) => ywLabels[Math.round(v)] ?? "", font: { size: 9 } },
          grid: { display: false }
        },
        y: { beginAtZero: true, ticks: { font: { size: 9 } }, grid: { color: "rgba(0,0,0,0.05)" } }
      }
    }
  };

  const mwLabels = MN.slice(1);
  const mwActiveVals = Array.from({ length: 12 }, (_, i) => { const f = monthWise.find(d => d.month === i + 1); return f ? ((f.activeTravellers || 0) + (f.unverifiedTravellers || 0) + (f.cancellationRequestTravellers || 0)) : 0; });
  const mwCancelledVals = Array.from({ length: 12 }, (_, i) => { const f = monthWise.find(d => d.month === i + 1); return f ? (f.cancelledTravellers || 0) : 0; });
  const mwTripCancelledVals = Array.from({ length: 12 }, (_, i) => { const f = monthWise.find(d => d.month === i + 1); return f ? (f.tripCancelledTravellers || 0) : 0; });
  const mwRejectedVals = Array.from({ length: 12 }, (_, i) => { const f = monthWise.find(d => d.month === i + 1); return f ? (f.rejectedTravellers || 0) : 0; });

  const chartTravStatusMW = {
    type: "scatter",
    data: {
      labels: mwLabels,
      datasets: [
        { label: "Active", data: mwActiveVals.map((v, i) => v ? { x: i - 0.3, y: v } : null).filter(Boolean), borderColor: "#16a34a", backgroundColor: "transparent", pointRadius: 0 },
        { label: "Cancelled", data: mwCancelledVals.map((v, i) => v ? { x: i - 0.1, y: v } : null).filter(Boolean), borderColor: "#f97316", backgroundColor: "transparent", pointRadius: 0 },
        { label: "Trip Cancelled", data: mwTripCancelledVals.map((v, i) => v ? { x: i + 0.1, y: v } : null).filter(Boolean), borderColor: "#8b5cf6", backgroundColor: "transparent", pointRadius: 0 },
        { label: "Rejected", data: mwRejectedVals.map((v, i) => v ? { x: i + 0.3, y: v } : null).filter(Boolean), borderColor: "#dc2626", backgroundColor: "transparent", pointRadius: 0 },
      ]
    },
    options: {
      _lollipop: true,
      responsive: true, maintainAspectRatio: false,
      layout: { padding: { top: 24 } },
      plugins: { legend: { display: false }, tooltip: { enabled: false }, datalabels: { display: false } },
      scales: {
        x: {
          type: "linear", min: -0.6, max: mwLabels.length - 1 + 0.6,
          afterBuildTicks: (axis) => {
            axis.ticks = mwLabels.map((_, i) => ({ value: i }));
          },
          ticks: { callback: (v) => mwLabels[Math.round(v)] ?? "", font: { size: 9 } },
          grid: { display: false }
        },
        y: { beginAtZero: true, ticks: { font: { size: 9 } }, grid: { color: "rgba(0,0,0,0.05)" } }
      }
    }
  };


  const chartTourStatusYW = {
    type: "bar",
    data: {
      labels: yearWise.map(d => d._id),
      datasets: [
        { label: "Available", data: yearWise.map(d => d.availableTours || 0), backgroundColor: "#2563eb", borderRadius: 2, stack: "s" },
        { label: "Soldout", data: yearWise.map(d => d.soldoutTours || 0), backgroundColor: "#f97316", borderRadius: 2, stack: "s" },
        { label: "Cancelled", data: yearWise.map(d => d.cancelledTours || 0), backgroundColor: "#dc2626", borderRadius: 2, stack: "s" },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, datalabels: { color: "#fff", font: { size: 9, weight: "600" }, formatter: v => v > 0 ? v : "" } },
      scales: { x: { stacked: true, ticks: { font: { size: 9 } }, grid: { display: false } }, y: { stacked: true, ticks: { font: { size: 9 } } } }
    }
  };

  const mwAvailable = Array.from({ length: 12 }, (_, i) => { const f = monthWise.find(d => d.month === i + 1); return f ? (f.availableTours || 0) : 0; });
  const mwSoldout = Array.from({ length: 12 }, (_, i) => { const f = monthWise.find(d => d.month === i + 1); return f ? (f.soldoutTours || 0) : 0; });
  const mwCancelled = Array.from({ length: 12 }, (_, i) => { const f = monthWise.find(d => d.month === i + 1); return f ? (f.cancelledTours || 0) : 0; });
  const chartTourStatusMW = {
    type: "bar",
    data: {
      labels: MN.slice(1),
      datasets: [
        { label: "Available", data: mwAvailable, backgroundColor: "#2563eb", borderRadius: 2, stack: "s" },
        { label: "Soldout", data: mwSoldout, backgroundColor: "#f97316", borderRadius: 2, stack: "s" },
        { label: "Cancelled", data: mwCancelled, backgroundColor: "#dc2626", borderRadius: 2, stack: "s" },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, datalabels: { color: "#fff", font: { size: 9, weight: "600" }, formatter: v => v > 0 ? v : "" } },
      scales: { x: { stacked: true, ticks: { font: { size: 9 } }, grid: { display: false } }, y: { stacked: true, ticks: { font: { size: 9 } } } }
    }
  };

  const chartCancelYW = {
    type: "bar",
    data: {
      labels: cancelYW.map(d => d._id),
      datasets: [
        { label: "GV Cancelled", data: cancelYW.map(d => d.gvPool || 0), backgroundColor: "#ef4444", borderRadius: 6, barPercentage: .35, categoryPercentage: .7 },
        { label: "IRCTC Cancelled", data: cancelYW.map(d => d.irctcPool || 0), backgroundColor: "#f59e0b", borderRadius: 6, barPercentage: .35, categoryPercentage: .7 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: "end", align: "top", color: "#1e1e2e",
          font: { size: 9, weight: "600" },
          formatter: v => v > 0 ? `₹${v.toLocaleString("en-IN")}` : ""
        }
      },
      scales: {
        x: { ticks: { font: { size: 9 }, color: "#888" }, grid: { display: false }, border: { display: false } },
        y: {
          ticks: { font: { size: 9 }, color: "#bbb", callback: v => v >= 1000 ? `₹${v / 1000}K` : v },
          grid: { color: "rgba(0,0,0,0.04)" }, border: { display: false }
        }
      },
      layout: { padding: { top: 22 } }
    }
  };

  const cancelMWGV = Array.from({ length: 12 }, (_, i) => { const f = cancelMW.find(d => d._id === i + 1); return f ? (f.gvPool || 0) : 0; });
  const cancelMWIRCTC = Array.from({ length: 12 }, (_, i) => { const f = cancelMW.find(d => d._id === i + 1); return f ? (f.irctcPool || 0) : 0; });
  const chartCancelMW = {
    type: "line",
    data: {
      labels: MN.slice(1),
      datasets: [
        { label: "GV", data: cancelMWGV, borderColor: "#ef4444", backgroundColor: "transparent", tension: 0, fill: false, pointRadius: 5, pointBackgroundColor: "#ef4444", pointBorderColor: "#ef4444", pointBorderWidth: 0, borderWidth: 2.5 },
        { label: "IRCTC", data: cancelMWIRCTC, borderColor: "#f59e0b", backgroundColor: "transparent", tension: 0, fill: false, pointRadius: 5, pointBackgroundColor: "#f59e0b", pointBorderColor: "#f59e0b", pointBorderWidth: 0, borderWidth: 2.5 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        datalabels: { anchor: "top", align: "top", offset: 5, font: { size: 9, weight: "600" }, color: ctx => ctx.datasetIndex === 0 ? "#ef4444" : "#d97706", formatter: v => v > 0 ? `₹${v.toLocaleString("en-IN")}` : "" }
      },
      scales: {
        x: { ticks: { font: { size: 9 }, color: "#888" }, grid: { display: false }, border: { display: false } },
        y: { ticks: { font: { size: 9 }, color: "#bbb", callback: v => v >= 1000 ? `₹${v / 1000}K` : v }, grid: { color: "rgba(0,0,0,0.05)" }, border: { display: false }, min: 0 }
      },
      layout: { padding: { top: 44, right: 16 } }
    }
  };

  // ── Average Travellers ──────────────────────────────────────────────
  // Single mode:
  //   Year selected, month = All -> (Active + CancelRequest) / 12
  //   Year + specific month selected -> (Active + CancelRequest) for that
  //   month only, NOT divided (it's already a single-month figure).
  // Range mode:
  //   Total (Active + CancelRequest) across ALL years in the range
  //   (summary already aggregates this correctly via the backend range
  //   query) divided by the MONTH RANGE LENGTH only — year count does
  //   NOT multiply into the divisor. E.g. years 2025–2026 + months Jan–Jun
  //   -> divide by 6 (not 12), regardless of how many years are spanned.
  const activePlusCancelRequest = (summary.activeTravellers || 0) + (summary.cancellationRequestTravellers || 0);
  const monthRangeLength = (range.fromMonth && range.toMonth)
    ? (() => {
      const fm = parseInt(range.fromMonth), tm = parseInt(range.toMonth);
      return fm <= tm ? (tm - fm + 1) : (12 - fm + 1 + tm); // wrap-around e.g. Nov(11)–Feb(2)
    })()
    : 12;
  const avgTravellers = rangeMode
    ? Math.round(activePlusCancelRequest / monthRangeLength)
    : filters.month
      ? activePlusCancelRequest
      : Math.round(activePlusCancelRequest / 12);

  // ── Average Tour Count ────────────────────────────────────────────────
  // Same divide-by-month logic as Average Travellers above, but on
  // tourList.length (already filtered by the active year/month/range)
  // instead of a traveller count.
  const nonCancelledTourCount = tourList.filter(t => !t.tripCancelled).length;

  const avgTourCount = rangeMode
    ? Math.round(nonCancelledTourCount / monthRangeLength)
    : filters.month
      ? nonCancelledTourCount
      : Math.round(nonCancelledTourCount / 12);


  const totTNR = tourList.reduce((a, t) => a + (t.totalTNR || 0), 0);
  const totPax = tourList.reduce((a, t) => a + (t.totalTravellers || 0), 0);
  const totCancelledTrav = tourList.reduce((a, t) => a + (t.cancelledTravellers || 0), 0);
  const totFem = tourList.reduce((a, t) => a + (t.totalFemale || 0), 0);
  const totMal = tourList.reduce((a, t) => a + (t.totalMale || 0), 0);
  const totOth = tourList.reduce((a, t) => a + (t.totalOther || 0), 0);
  const totChi = tourList.reduce((a, t) => a + (t.totalChild || 0), 0);
  const totGVt = tourList.reduce((a, t) => a + (t.gvPool || 0), 0);
  const totIRt = tourList.reduce((a, t) => a + (t.irctcPool || 0), 0);

  // ── Trip-cancelled tours / travellers ────────────────────────────────
  // "Trip cancelled" = the whole tour was cancelled via cancelEntireTrip
  // (tour.tripCancelled === true), NOT the same as an individual
  // traveller's own cancellation (summary.cancelledTravellers / the
  // per-tour t.cancelledTravellers, which now both EXCLUDE trip-cancelled
  // travellers on the backend — see cancelledTravellers aggregation fix).
  // Tour count is still derived client-side from tourList (no dedicated
  // backend counter needed for a tour-level boolean). Traveller count
  // now comes straight from the backend's dedicated
  // tripCancelledTravellers field (per tour), NOT from totalTravellers
  // of cancelled tours — that would have wrongly included travellers who
  // already had a proper individual cancellation before the trip got
  // cancelled.
  const tripCancelledToursCount = tourList.filter(t => t.tripCancelled).length;
  const tripCancelledTravellersCount = tourList.reduce((a, t) => a + (t.tripCancelledTravellers || 0), 0);

  // ── PDF download — ippo irukkura filters oda cards + charts + table ──
  const filterLabel = () => {
    const parts = [];
    // "All years" badhila data irukkura mudhal year – kadaisi year (e.g. 2025 – 2027)
    const ys = [...new Set(allAvailableYears.map(Number).filter(Boolean))].sort((a, b) => a - b);
    const minY = ys[0], maxY = ys[ys.length - 1];
    const allYears = ys.length ? (minY === maxY ? `${minY}` : `${minY} – ${maxY}`) : "All years";
    if (rangeMode) {
      const yr = range.fromYear || range.toYear
        ? (() => { const f = range.fromYear || minY || "", t = range.toYear || maxY || ""; return !f || !t || String(f) === String(t) ? String(f || t) : `${f} – ${t}`; })()
        : "";
      const mo = range.fromMonth && range.toMonth ? `${MN[+range.fromMonth]}–${MN[+range.toMonth]}` : range.fromMonth ? MN[+range.fromMonth] : range.toMonth ? MN[+range.toMonth] : "";
      if (yr) parts.push(yr);
      if (mo) parts.push(mo);
      if (!yr) parts.unshift(allYears);
    } else {
      parts.push(filters.year || allYears);
      parts.push(filters.month ? MN[+filters.month] : "All months");
    }
    if (filters.type) parts.push(filters.type);
    if (filters.status) parts.push(filters.status);
    if (selTours.length) parts.push(selTours.length === 1 ? selTours[0].tourName : `${selTours.length} tours`);
    return parts.join(" · ");
  };
  const downloadPdf = () => {
    const yLbl = rangeMode ? "" : ` (${filters.year || new Date().getFullYear()})`;
    const LG_STATUS = [["#16a34a", "Active"], ["#f97316", "Cancelled"], ["#8b5cf6", "Trip Cancelled"], ["#dc2626", "Rejected"]];
    const LG_TOUR = [["#2563eb", "Available"], ["#f97316", "Soldout"], ["#dc2626", "Cancelled"]];
    const charts = [
      { title: "Total travellers — year wise", sub: "By departure year", cfg: chartYW },
      { title: `Total travellers — month wise${yLbl}`, sub: "By departure month", cfg: chartMW },
      { title: "Traveller status — year wise", sub: "Active / Cancelled / Trip cancelled / Rejected", cfg: chartTravStatusYW, legend: LG_STATUS },
      { title: `Traveller status — month wise${yLbl}`, sub: "Active / Cancelled / Trip cancelled / Rejected", cfg: chartTravStatusMW, legend: LG_STATUS },
      { title: "Tour status — year wise", sub: "Available / Soldout / Cancelled per year", cfg: chartTourStatusYW, legend: LG_TOUR },
      { title: `Tour status — month wise${yLbl}`, sub: "Available / Soldout / Cancelled by month", cfg: chartTourStatusMW, legend: LG_TOUR },
      { title: "Cancellations — year wise", sub: "GV vs IRCTC cancel amounts per year", cfg: chartCancelYW, legend: [["#ef4444", "GV Cancelled"], ["#f59e0b", "IRCTC Cancelled"]] },
      { title: `Cancellations — month wise${yLbl}`, sub: "GV vs IRCTC cancel amounts by month", cfg: chartCancelMW, legend: [["#ef4444", "GV"], ["#f59e0b", "IRCTC"]] },
    ].map(({ cfg, ...c }, i) => ({ ...c, img: chartToImage(cfg), stats: chartStats(cfg, i >= 6) }));

    const totalCancel = (summary.totalGVPool || 0) + (summary.totalIRCTCPool || 0);
    const hero = [
      ["🚌", "Total tours", tourList.length, "#7C3AED", "#A855F7"],
      ["📋", "Total bookings", summary.totalBookings || 0, "#2563EB", "#3B82F6"],
      ["👥", "Total travellers", (summary.totalTravellers || 0).toLocaleString("en-IN"), "#0E7490", "#06B6D4"],
      ["📊", "Average travellers", avgTravellers, "#15803D", "#22C55E"],
      ["💰", "Total cancellation", fmtFull(totalCancel), "#B91C1C", "#F43F5E"],
    ];
    const sections = [
      {
        title: "Tours", color: "#7C3AED", items: [
          ["🚌", "Total tours", tourList.length, "#EDE9FE", "#5B21B6"],
          ["📊", "Average tours", avgTourCount, "#E0E7FF", "#3730A3"],
          ["✅", "Available", tourList.filter(t => !t.tripCancelled && t.available !== false).length, "#DBEAFE", "#1E40AF"],
          ["🔴", "Soldout", tourList.filter(t => !t.tripCancelled && t.available === false).length, "#FFEDD5", "#C2410C"],
          ["🚫", "Cancelled", tripCancelledToursCount, "#FEE2E2", "#B91C1C"],
        ]
      },
      {
        title: "Tour bookings", color: "#2563EB", items: [
          ["📋", "Total bookings", summary.totalBookings || 0, "#E0F2FE", "#0369A1"],
          ["⏳", "Unverified", summary.unverifiedBookings || 0, "#F1F5F9", "#334155"],
          ["🟢", "Active (advance paid)", summary.activeBookings || 0, "#DCFCE7", "#15803D"],
          ["🏆", "Completed", summary.completedBookings || 0, "#FEF9C3", "#854D0E"],
          ["❌", "Fully cancelled", summary.fullyCancelledBookings || 0, "#FEE2E2", "#B91C1C"],
          ["🚫", "Rejected", summary.rejectedBookings || 0, "#F3E8FF", "#7E22CE"],
          ["🛑", "Trip cancelled", summary.tripCancelledBookings || 0, "#FECACA", "#991B1B"],
        ]
      },
      {
        title: "Travellers", color: "#0E7490", items: [
          ["👥", "Total travellers", (summary.totalTravellers || 0).toLocaleString("en-IN"), "#EDE9FE", "#5B21B6"],
          ["📊", "Average (Active+CR)", avgTravellers, "#E0E7FF", "#3730A3"],
          ["⏳", "Unverified", summary.unverifiedTravellers || 0, "#FEF3C7", "#92400E"],
          ["🟢", "Active", summary.activeTravellers || 0, "#DCFCE7", "#15803D"],
          ["🔶", "Cancelled", summary.cancelledTravellers || 0, "#FEF3C7", "#C2410C"],
          ["🕐", "Cancel request", summary.cancellationRequestTravellers || 0, "#FDE8D8", "#9A3412"],
          ["🚫", "Rejected", summary.rejectedTravellers || 0, "#FEE2E2", "#B91C1C"],
          ["🛑", "Trip cancelled", tripCancelledTravellersCount, "#FECACA", "#991B1B"],
        ]
      },
      {
        title: "Gender (completed bookings)", color: "#DB2777", items: [
          ["👩", "Female", summary.totalFemale || 0, "#FCE7F3", "#9D174D"],
          ["👨", "Male", summary.totalMale || 0, "#DBEAFE", "#1D4ED8"],
          ["🧑", "Others", summary.totalOther || 0, "#CFFAFE", "#0E7490"],
          ["🧒", "Child", summary.totalChild || 0, "#FEF9C3", "#854D0E"],
        ]
      },
      {
        title: "Cancellation amount", color: "#DC2626", items: [
          ["₹", "GV cancellation", fmtFull(summary.totalGVPool || 0), "#DCFCE7", "#15803D"],
          ["🎫", "IRCTC cancellation", fmtFull(summary.totalIRCTCPool || 0), "#FEF3C7", "#B45309"],
          ["💰", "Total cancellation", fmtFull(totalCancel), "#FEE2E2", "#B91C1C"],
        ]
      },
    ];
    const tours = tourList.map((t) => ({ ...t, status: getTourStatus(t) }));
    const totals = { tnr: totTNR, pax: totPax, canc: totCancelledTrav, trip: tripCancelledTravellersCount, fem: totFem, mal: totMal, oth: totOth, chi: totChi, gv: totGVt, ir: totIRt };

    const html = buildSalesPdfHtml({ filterText: filterLabel(), hero, sections, charts, tours, totals });
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const w = window.open(url, "_blank");
    if (!w) { URL.revokeObjectURL(url); alert("Allow pop-ups for this site to download the PDF"); return; }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#888", fontSize: 14 }}>Loading analytics...</div>;

  const cc = { ...S.cc, minWidth: 0, overflow: "hidden" };

  return (
    <div ref={rootRef} className="an-root" style={S.pg}>
      <style>{RESPONSIVE_CSS}</style>
      {/* Leave popup — filter / range / tour select pannirundhaa mattum kekkum */}
      <LeaveGuard
        when={!!(filters.year || filters.month || filters.type || filters.status || rangeMode || range.fromYear || range.toYear || range.fromMonth || range.toMonth || selTours.length)}
        title="Leave Sales Analytics?"
        message={
          <>
            You have filters selected on this page.
            <br />
            Leaving will clear the filters and the current view.
            <br />
            Are you sure you want to leave?
          </>
        }
      />

      <div style={{ ...S.topbar, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ ...S.h2, fontSize: 29, color: 'blue' }}>
            📊 Sales Analytics
          </h2>
          <div style={{ ...S.sub, color: 'gray' }}>
            Overview of travellers, tours and cancellations
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <button
          type="button"
          onClick={downloadPdf}
          disabled={tableLoading}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: "none",
            background: tableLoading ? "#c4b5fd" : "linear-gradient(120deg, #6d28d9, #2563eb)", color: "#fff",
            fontSize: 13, fontWeight: 700, cursor: tableLoading ? "not-allowed" : "pointer", boxShadow: "0 2px 8px rgba(109,40,217,.25)",
          }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          {tableLoading ? "Loading…" : "Download PDF"}
        </button>
      </div>

      <div style={{ ...S.fbar, marginBottom: 12 }}>
        <div className="an-fbar-grid">
          <button
            onClick={() => setRangeMode(p => !p)}
            style={{
              fontSize: 11, padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontWeight: 600,
              border: rangeMode ? "1px solid #7c3aed" : "1px solid #e5e7eb",
              background: rangeMode ? "#7c3aed" : "#fff",
              color: rangeMode ? "#fff" : "#666",
              width: "100%",
            }}
          >
            {rangeMode ? "📅 Range mode" : "📅 Use range"}
          </button>

          {!rangeMode ? (
            <>
              <select className="an-sel" style={S.sel} value={filters.year} onChange={e => setFilters(p => ({ ...p, year: e.target.value }))}>
                <option value="">All years</option>
                {[...new Set([
                  ...allAvailableYears,
                  new Date().getFullYear()
                ])].sort((a, b) => b - a).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select className="an-sel" style={S.sel} value={filters.month} onChange={e => setFilters(p => ({ ...p, month: e.target.value }))}>
                <option value="">All months</option>
                {MN.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
            </>
          ) : (
            <>
              {/* ── Year range: from / to ──
                 Shows ONLY the exact years present in yearWise (DB data),
                 sorted ascending. No buffer years, no future estimation —
                 if a tour exists for a given year, it appears here; if
                 not, it doesn't. ── */}
              {(() => {
                const yearOptions = [...new Set(allAvailableYears)].sort((a, b) => a - b); return (
                  <>
                    <select className="an-sel" style={S.sel} value={range.fromYear} onChange={e => setRange(p => ({ ...p, fromYear: e.target.value }))}>
                      <option value="">Year from</option>
                      {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select className="an-sel" style={S.sel} value={range.toYear} onChange={e => setRange(p => ({ ...p, toYear: e.target.value }))}>
                      <option value="">Year to</option>
                      {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </>
                );
              })()}            {/* ── Month range: from / to (applied within EACH matched year independently) ── */}
              <select className="an-sel" style={S.sel} value={range.fromMonth} onChange={e => setRange(p => ({ ...p, fromMonth: e.target.value }))}>
                <option value="">Month from</option>
                {MN.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
              <select className="an-sel" style={S.sel} value={range.toMonth} onChange={e => setRange(p => ({ ...p, toMonth: e.target.value }))}>
                <option value="">Month to</option>
                {MN.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
            </>
          )}

          <select className="an-sel" style={S.sel} value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}>
            <option value="">All types</option>
            <option value="Spiritual">Spiritual</option>
            <option value="Historical">Historical</option>
            <option value="International">International</option>
            <option value="Jolly">Jolly</option>
          </select>
          <select className="an-sel" style={S.sel} value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
            <option value="">All status</option>
            <option value="Available">Available</option>
            <option value="Soldout">Soldout</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <div className="an-search-wrap" style={{ position: "relative", gridColumn: rangeMode ? "span 1" : "span 3" }} ref={dropRef}>
            <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#aaa", pointerEvents: "none" }}>🔍</span>
            <input style={S.sinp} placeholder="Search tour..." value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              onFocus={() => searchRes.length > 0 && setShowDrop(true)} />
            {showDrop && searchRes.length > 0 && (
              <div style={S.drop}>
                <div style={{ ...S.di, fontWeight: 600, borderBottom: "0.5px solid #eee", color: "#7c3aed" }}
                  onMouseDown={() => { const n = searchRes.filter(r => !selTours.find(s => s._id.toString() === r._id.toString())); setSelTours(p => [...p, ...n]); setSearchQ(""); setShowDrop(false); }}>
                  ✓ Select all ({searchRes.length})
                </div>
                {searchRes.map(t => (
                  <div key={t._id} style={{ ...S.di, background: selTours.find(s => s._id.toString() === t._id.toString()) ? "#f3f0ff" : "transparent" }} onMouseDown={() => selTour(t)}>
                    {t.tourName}<small style={{ display: "block", fontSize: 10, color: "#aaa" }}>{t.tourType}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center", minWidth: 0 }}>
            {selTours.length === 0
              ? <span style={{ ...S.chip, background: "#f4f6fb", color: "#888" }}>🔽 All tours</span>
              : selTours.map(t => (
                <span key={t._id} style={S.chip}>
                  {t.tourName?.split(" ").slice(0, 3).join(" ")}
                  <button onClick={() => removeTour(t._id)} style={{ background: "none", border: "none", color: "#7c3aed", cursor: "pointer", fontSize: 13, lineHeight: 1, padding: 0 }}>×</button>
                </span>
              ))
            }
          </div>
          <button className="an-clr-btn" style={{ ...S.clr, width: "100%" }} onClick={clearAll}>✕ Clear</button>
        </div>
      </div>

      {/* ── Total summary — standalone section, sits right under the filter bar.
           Shows the same aggregate totals as the table's own footer row,
           but always visible regardless of table-vs-card-list view. ── */}
      <div style={{ marginBottom: 10, minWidth: 0, maxWidth: "100%" }}>
        <div style={S.sh}>Total summary ({tableLoading ? "…" : `${tourList.length} tours`})</div>
        <div className="an-stat-grid" style={{ gridTemplateColumns: `repeat(3, 1fr)` }}>
          {[
            ["TNR", totTNR, "#1a1a2e"],
            ["Travellers (Active+CR+UV)", totPax, "#7c3aed"],
            ["Cancelled trav", totCancelledTrav, "#dc2626"],
            ["Trip cancelled trav", tripCancelledTravellersCount, "#8b5cf6"],
            ["Female", totFem, "#9d174d"],
            ["Male", totMal, "#1d4ed8"],
            ["Others", totOth, "#0891b2"],
            ["Child", totChi, "#854d0e"],
            ["GV cancel", fmtFull(totGVt), "#15803d"],
            ["IRCTC cancel", fmtFull(totIRt), "#b45309"],
            ["Total cancel", fmtFull(totGVt + totIRt), "#1a1a2e"],
          ].map(([lbl, val, color]) => (
            <div key={lbl} style={{ background: "#fff", borderRadius: 8, padding: "8px 8px", minWidth: 0, boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ fontSize: 9, color: "#aaa", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lbl}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{val}</div>
            </div>
          ))}
        </div>
      </div>


      <Section title="Tours" cols={3}>
        <StatCard icon="🚌" iconBg="#ede9fe" label="Total tours" value={tourList.length} />
        <StatCard icon="📊" iconBg="#e0e7ff" label="Average tours" value={avgTourCount} />
        <StatCard icon="✅" iconBg="#dbeafe" label="Available" value={tourList.filter(t => !t.tripCancelled && t.available !== false).length} />
        <StatCard icon="🔴" iconBg="#fee2e2" label="Soldout" value={tourList.filter(t => !t.tripCancelled && t.available === false).length} />
        <StatCard icon="🚫" iconBg="#fecaca" label="Cancelled" value={tripCancelledToursCount} />
      </Section>

      <Section title="Tour Bookings" cols={3}>
        <StatCard icon="📋" iconBg="#e0f2fe" label="Total bookings" value={summary.totalBookings || 0} />
        <StatCard icon="⏳" iconBg="#f1f5f9" label="Unverified" value={summary.unverifiedBookings || 0} />
        <StatCard icon="🟢" iconBg="#dcfce7" label="Active (Advance only paid)" value={summary.activeBookings || 0} />
        <StatCard icon="🏆" iconBg="#fef9c3" label="Completed (Booking completed)" value={summary.completedBookings || 0} />
        <StatCard icon="❌" iconBg="#fee2e2" label="Fully cancelled" value={summary.fullyCancelledBookings || 0} />
        <StatCard icon="🚫" iconBg="#f3e8ff" label="Rejected" value={summary.rejectedBookings || 0} />
        <StatCard icon="🛑" iconBg="#fecaca" label="Trip cancelled bookings" value={summary.tripCancelledBookings || 0} />
      </Section>

      <Section title="Travellers" cols={3}>
        <StatCard icon="👥" iconBg="#ede9fe" label="Total travellers" value={(summary.totalTravellers || 0).toLocaleString("en-IN")} />
        <StatCard icon="📊" iconBg="#e0e7ff" label="Average travellers (Active+CR)" value={avgTravellers} />
        <StatCard icon="⏳" iconBg="#fef3c7" label="Unverified travellers" value={summary.unverifiedTravellers || 0} />
        <StatCard icon="🟢" iconBg="#dcfce7" label="Active travellers (Once Advance paid)" value={summary.activeTravellers || 0} />
        <StatCard icon="🔶" iconBg="#fef3c7" label="Cancelled (admin+traveller confirmed)" value={summary.cancelledTravellers || 0} />
        <StatCard icon="🕐" iconBg="#fde8d8" label="Cancel request" value={summary.cancellationRequestTravellers || 0} />
        <StatCard icon="🚫" iconBg="#fee2e2" label="Rejected" value={summary.rejectedTravellers || 0} />
        <StatCard icon="🛑" iconBg="#fecaca" label="Trip cancelled travellers" value={tripCancelledTravellersCount} />
      </Section>

      <Section title="Gender (Completed bookings)" cols={3}>
        <StatCard icon="👩" iconBg="#fce7f3" label="Female" value={summary.totalFemale || 0} />
        <StatCard icon="👨" iconBg="#dbeafe" label="Male" value={summary.totalMale || 0} />
        <StatCard icon="🧑" iconBg="#cffafe" label="Others" value={summary.totalOther || 0} />
        <StatCard icon="🧒" iconBg="#fef9c3" label="Child" value={summary.totalChild || 0} />
      </Section>

      <Section title="Cancellation Amount" cols={3}>
        <StatCard icon="₹" iconBg="#fef3c7" label="GV cancellation" value={fmtFull(summary.totalGVPool || 0)} />
        <StatCard icon="🎫" iconBg="#ede9fe" label="IRCTC cancellation" value={fmtFull(summary.totalIRCTCPool || 0)} />
        <StatCard icon="💰" iconBg="#fee2e2" label="Total cancellation" value={fmtFull((summary.totalGVPool || 0) + (summary.totalIRCTCPool || 0))} />
      </Section>

      <div className="an-chart-grid">
        <div style={cc}>
          <div style={S.ct}>Total travellers — year wise</div>
          <div style={S.cs}>By departure year</div>
          <ChartCanvas id="c1" config={chartYW} height={chartH} />
        </div>
        <div style={cc}>
          <div style={S.ct}>Total travellers — month wise {filters.year ? `(${filters.year})` : `(${new Date().getFullYear()})`}</div>
          <div style={S.cs}>By departure month</div>
          <ChartCanvas id="c2" config={chartMW} height={chartH} />
        </div>
      </div>

      <div className="an-chart-grid">
        <div style={cc}>
          <div style={S.ct}>Traveller status — year wise</div>
          <div style={S.cs}>Active / Cancelled / Rejected</div>
          <div style={S.leg}>{[["#16a34a", "Active"], ["#f97316", "Cancelled"], ["#8b5cf6", "Trip Cancelled"], ["#dc2626", "Rejected"]].map(([c, l]) => (<span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>))}</div>
          <ChartCanvas id="c3" config={chartTravStatusYW} height={chartH + 40} />
        </div>
        <div style={cc}>
          <div style={S.ct}>Traveller status — month wise {filters.year ? `(${filters.year})` : `(${new Date().getFullYear()})`}</div>
          <div style={S.cs}>Active / Cancelled / Rejected</div>
          <div style={S.leg}>{[["#16a34a", "Active"], ["#f97316", "Cancelled"], ["#8b5cf6", "Trip Cancelled"], ["#dc2626", "Rejected"]].map(([c, l]) => (<span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>))}</div>
          <ChartCanvas id="c4" config={chartTravStatusMW} height={chartH + 40} />
        </div>
      </div>

      <div className="an-chart-grid">
        <div style={cc}>
          <div style={S.ct}>Tour status — year wise</div>
          <div style={S.cs}>Available / Soldout per year</div>
          <div style={S.leg}>{[["#2563eb", "Available"], ["#f97316", "Soldout"], ["#dc2626", "Cancelled"]].map(([c, l]) => (<span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>))}</div>
          <ChartCanvas id="c5" config={chartTourStatusYW} height={chartH + 40} />
        </div>
        <div style={cc}>
          <div style={S.ct}>Tour status — month wise {filters.year ? `(${filters.year})` : `(${new Date().getFullYear()})`}</div>
          <div style={S.cs}>Available / Soldout by month</div>
          <div style={S.leg}>{[["#2563eb", "Available"], ["#f97316", "Soldout"], ["#dc2626", "Cancelled"]].map(([c, l]) => (<span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>))}</div>
          <ChartCanvas id="c6" config={chartTourStatusMW} height={chartH + 40} />
        </div>
      </div>

      <div className="an-chart-grid">
        <div style={cc}>
          <div style={S.ct}>Cancellations — year wise</div>
          <div style={S.cs}>GV vs IRCTC cancel amounts per year</div>
          <div style={S.leg}>{[["#ef4444", "GV Cancelled"], ["#f59e0b", "IRCTC Cancelled"]].map(([c, l]) => (<span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>))}</div>
          <ChartCanvas id="c7" config={chartCancelYW} height={chartH} />
        </div>
        <div style={cc}>
          <div style={S.ct}>Cancellations — month wise {filters.year ? `(${filters.year})` : `(${new Date().getFullYear()})`}</div>
          <div style={S.cs}>GV vs IRCTC cancel amounts by month</div>
          <div style={S.leg}>{[["#ef4444", "GV"], ["#f59e0b", "IRCTC"]].map(([c, l]) => (<span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>))}</div>
          <ChartCanvas id="c8" config={chartCancelMW} height={chartH + 60} />
        </div>
      </div>

      <div style={S.tcard}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>Tour profile performance</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>
              {rangeMode
                ? (range.fromYear || range.toYear || range.fromMonth || range.toMonth)
                  ? `Range: ${[
                    range.fromYear && range.toYear ? `${range.fromYear}–${range.toYear}` : range.fromYear || range.toYear,
                    range.fromMonth && range.toMonth ? `${MN[+range.fromMonth]}–${MN[+range.toMonth]}` : range.fromMonth ? MN[+range.fromMonth] : range.toMonth ? MN[+range.toMonth] : "",
                    filters.type, filters.status
                  ].filter(Boolean).join(" · ")}`
                  : "Range mode — pick a year/month range"
                : (filters.year || filters.month || filters.type || filters.status || selTours.length)
                  ? `Filtered: ${[filters.year, filters.month ? MN[+filters.month] : "", filters.type, filters.status].filter(Boolean).join(" · ")}`
                  : "Showing all tours"}
            </div>
          </div>
          <span style={{ fontSize: 11, color: "#aaa" }}>{tableLoading ? "Loading..." : `${tourList.length} tours`}</span>
        </div>

        {!showTable && (
          <div>
            {tableLoading
              ? <div style={{ textAlign: "center", padding: 24, color: "#aaa" }}>Loading...</div>
              : tourList.length === 0
                ? <div style={{ textAlign: "center", padding: 24, color: "#aaa" }}>No tours match</div>
                : <>
                  {tourList.map((t, i) => <TourCard key={t._id} t={t} i={i} />)}
                </>
            }
          </div>
        )}

        {showTable && (
          <div className="an-desk-table-wrap" style={{ WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse", tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "28px" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "5%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "5%" }} />
                <col style={{ width: "5%" }} />
                <col style={{ width: "5%" }} />
                <col style={{ width: "5%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "8%" }} />
              </colgroup>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  {["S.No", "Tour name", "TNR", "Travellers", "Cancelled", "Trip Cancelled", "Female", "Male", "Others", "Child", "GV cancel", "IRCTC cancel", "Total cancel", "Status"].map((h, i) => (
                    <th key={i} style={{ ...S.th, textAlign: i === 0 ? "center" : i === 1 ? "left" : "center", padding: i === 0 ? "7px 2px" : i === 1 ? "7px 6px 7px 4px" : S.th.padding }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableLoading ? (
                  <tr><td colSpan={14} style={{ ...S.td, textAlign: "center", padding: 24, color: "#aaa" }}>Loading...</td></tr>
                ) : tourList.length === 0 ? (
                  <tr><td colSpan={14} style={{ ...S.td, textAlign: "center", padding: 24, color: "#aaa" }}>No tours match</td></tr>
                ) : (
                  <>
                    {tourList.map((t, i) => {
                      const status = getTourStatus(t);
                      const tot = (t.gvPool || 0) + (t.irctcPool || 0);
                      const isOpen = expandedRow === t._id;
                      return (
                        <React.Fragment key={t._id}>
                          <tr
                            onClick={() => setExpandedRow(isOpen ? null : t._id)}
                            style={{ cursor: "pointer", background: isOpen ? "#f3f0ff" : "transparent" }}
                            onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = "#fafafa"; }}
                            onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = "transparent"; }}>
                            <td style={{ ...S.td, color: "#ccc", fontSize: 10, textAlign: "center", padding: "7px 2px" }}>{i + 1}</td>
                            <td style={{ ...S.td, padding: "7px 6px 7px 4px", whiteSpace: "normal" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                <span style={{ fontSize: 10, color: "#7c3aed", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .15s", flexShrink: 0 }}>▸</span>
                                <div style={{ minWidth: 0, overflow: "hidden" }}>
                                  <div style={{ fontWeight: 600, fontSize: 12, whiteSpace: "normal", overflowWrap: "anywhere", lineHeight: 1.3 }}>{t.tourName || "—"}</div>
                                  <small style={{ color: "#aaa", fontSize: 10 }}>{t.tourType || ""}</small>
                                </div>
                              </div>
                            </td>
                            <td style={{ ...S.td, textAlign: "center", fontWeight: 600 }}>{t.totalTNR || 0}</td>
                            <td style={{ ...S.td, textAlign: "center", fontWeight: 600, color: "#7c3aed" }}>{t.totalTravellers || 0}</td>
                            <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#dc2626", "#fef2f2", "#fca5a5")}>{t.cancelledTravellers || 0}</span></td>
                            <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#8b5cf6", "#f3f0ff", "#c4b5fd")}>{t.tripCancelledTravellers || 0}</span></td>
                            <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#9d174d", "#fdf2f8", "#f9a8d4")}>{t.totalFemale || 0}</span></td>
                            <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#1d4ed8", "#eff6ff", "#93c5fd")}>{t.totalMale || 0}</span></td>
                            <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#0891b2", "#ecfeff", "#67e8f9")}>{t.totalOther || 0}</span></td>
                            <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#854d0e", "#fef9c3", "#fde68a")}>{t.totalChild || 0}</span></td>
                            <td style={{ ...S.td, textAlign: "center", color: "#15803d", fontWeight: 600 }}>{fmtFull(t.gvPool || 0)}</td>
                            <td style={{ ...S.td, textAlign: "center", color: "#b45309", fontWeight: 600 }}>{fmtFull(t.irctcPool || 0)}</td>
                            <td style={{ ...S.td, textAlign: "center", fontWeight: 600 }}>{fmtFull(tot)}</td>
                            <td style={{ ...S.td, textAlign: "center" }}><span style={S.badge(status)}>{status}</span></td>
                          </tr>
                          {isOpen && (
                            <tr>
                              <td colSpan={14} style={{ padding: 0, borderBottom: "0.5px solid #f0f0f0" }}>
                                <TourBreakdown t={t} compact />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
