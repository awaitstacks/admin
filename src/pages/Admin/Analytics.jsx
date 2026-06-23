
// import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
// import Chart from "chart.js/auto";
// import ChartDataLabels from "chartjs-plugin-datalabels";
// import { TourAdminContext } from "../../context/TourAdminContext";

// const MN = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Chart.register(ChartDataLabels);

// // ── Custom "lollipop stems" plugin ──────────────────────────────────────
// // Used by the Traveller Status charts (year-wise + month-wise). Each
// // category (Active/Cancelled/Rejected) gets its own thin vertical line
// // ("stem") within a month/year slot, split into thirds so all 3 sit
// // side-by-side without overlapping — a dot caps each stem, with the
// // count drawn just above it. Built as a custom plugin (not a native
// // Chart.js type) because Chart.js has no built-in lollipop chart type;
// // this draws on top of an invisible scatter dataset that provides the
// // x/y point positions.
// const lollipopStemsPlugin = {
//   id: "lollipopStems",
//   afterDatasetsDraw(chart) {
//     if (!chart.options._lollipop) return;
//     const ctx = chart.ctx;
//     const meta0 = chart.getDatasetMeta(0);
//     const baseY = (meta0.data[0] && meta0.data[0].base !== undefined) ? meta0.data[0].base : chart.chartArea.bottom;

//     // ── Responsive dot/line sizing ───────────────────────────────────
//     // The 3 stems (Active/Cancelled/Rejected) sit at x ± 0.22 within each
//     // category slot. On a narrow (mobile) canvas, each slot's pixel width
//     // shrinks, so a fixed 5px dot radius starts visually overlapping its
//     // neighbours. Scale the radius (and stem line width) down in
//     // proportion to the actual pixel width available per category, with
//     // sane floor/ceiling clamps so it never gets too small to see or too
//     // big on wide desktop charts.
//     const xScale = chart.scales.x;
//     const categoryCount = Math.max(1, (xScale.max ?? 1) - (xScale.min ?? 0));
//     const pxPerCategory = chart.chartArea.width / categoryCount;
//     const dotRadius = Math.max(1.5, Math.min(3.5, pxPerCategory / 16));
//     const lineWidth = Math.max(1.5, Math.min(2, pxPerCategory / 30));
//     const fontSize = Math.max(10, Math.min(10, Math.round(pxPerCategory / 9)));

//     chart.data.datasets.forEach((dataset) => {
//       const dsIndex = chart.data.datasets.indexOf(dataset);
//       const meta = chart.getDatasetMeta(dsIndex);
//       meta.data.forEach((point, i) => {
//         const raw = dataset.data[i];
//         const value = raw && typeof raw === "object" ? raw.y : raw;
//         if (!value) return;
//         ctx.save();
//         ctx.strokeStyle = dataset.borderColor;
//         ctx.lineWidth = lineWidth;
//         ctx.lineCap = "round";
//         ctx.beginPath();
//         ctx.moveTo(point.x, baseY);
//         ctx.lineTo(point.x, point.y);
//         ctx.stroke();
//         ctx.beginPath();
//         ctx.arc(point.x, point.y, dotRadius, 0, Math.PI * 2);
//         ctx.fillStyle = dataset.borderColor;
//         ctx.fill();
//         ctx.restore();
//         ctx.save();
//         ctx.fillStyle = "#1a1a2e";
//         ctx.font = `700 ${fontSize}px sans-serif`;
//         ctx.textAlign = "center";
//         ctx.textBaseline = "bottom";
//         ctx.fillText(value, point.x, point.y - (dotRadius + 3));
//         ctx.restore();
//       });
//     });
//   }
// };
// Chart.register(lollipopStemsPlugin);

// const fmt = (n) => !n ? "₹0" : n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(0)}K` : `₹${n}`;
// const fmtFull = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;

// /*
//   ── RESPONSIVE STRATEGY ──────────────────────────────────────────
//   Pure CSS media queries control all layout switching (no JS resize
//   listener). This matches the TripEnquiries.jsx pattern, which works
//   cleanly with the sidebar's CSS-only show/hide (lg: breakpoint =
//   1024px in TourSidebar.jsx). A JS window.innerWidth listener can
//   race against the sidebar's own CSS transition; pure CSS @media
//   rules resolve in the same browser layout pass, so there's no
//   mismatch between sidebar state and content layout.

//   Breakpoints (aligned with sidebar's lg=1024px hide/show point):
//     < 700px          -> mobile:  stat cards 2x2, charts stacked, card-expand list
//     700px  - 1023px  -> tab:     stat cards 3x3, charts stacked, card-expand list (sidebar hidden, full width)
//     1024px - 1250px  -> tabWide: stat cards 3x3, charts 2x2, real table (sidebar just appeared)
//     > 1250px          -> desktop: stat cards auto-fit, charts 2x2, real table
// */

// const RESPONSIVE_CSS = `
//   .an-root, .an-root * { box-sizing: border-box; }
//   .an-root img, .an-root canvas { max-width: 100%; }

//   .an-stat-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; min-width: 0; }
//   @media (max-width: 1250px) { .an-stat-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 6px; } }
//   @media (max-width: 699px)  { .an-stat-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px; } }

//   .an-chart-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 8px; min-width: 0; }
//   @media (max-width: 1199px) { .an-chart-grid { grid-template-columns: 1fr !important; } }

//   /* an-desk-table/an-mob-cards display switching is now handled in JS via
//      the showTable boolean (window.innerWidth-driven), not CSS media queries.
//      This avoids the table's fixed 760px minWidth ever existing in the DOM
//      when the card-list view is active. */

//   .an-sel { min-width: 0; max-width: 100%; box-sizing: border-box; width: 100%; }
//   .an-search-wrap { min-width: 0; max-width: 100%; box-sizing: border-box; width: 100%; }

//   /* ── Filter bar: 5-column grid on desktop/tab (5+3 wrap for 8 items),
//      collapses to 2 columns on mobile. Each direct child of .an-fbar-grid
//      occupies one grid cell — items naturally wrap to a new row once the
//      5-column row is full. ── */
//   .an-fbar-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
//   @media (max-width: 699px) { .an-fbar-grid { grid-template-columns: repeat(2, 1fr) !important; } }

//   /* ── Hard containment against stale layout cache when resizing
//      mobile -> desktop in devtools. Forces the browser to recompute
//      width on every paint instead of reusing a cached narrow value. ── */
//   html, body { overflow-x: hidden !important; max-width: 100vw; scrollbar-gutter: stable; }
//   .an-root { contain: layout; }
//   .an-desk-table-wrap { contain: layout; overflow-x: auto; max-width: 100%; }
// `;

// const S = {
//   pg: { padding: 10, background: "#f4f6fb", minHeight: "100vh", fontFamily: "inherit", overflowX: "hidden", maxWidth: "100%", boxSizing: "border-box", width: "100%" },
//   topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 },
//   h2: { fontSize: 17, fontWeight: 600, color: "#1a1a2e", display: "flex", alignItems: "center", gap: 6, margin: 0 },
//   sub: { fontSize: 11, color: "#aaa", marginTop: 2 },

//   sh: {
//     fontSize: 12, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: ".05em",
//     borderLeft: "3px solid #7c3aed", paddingLeft: 8, marginBottom: 8, marginTop: 4
//   },

//   card: { background: "#fff", borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: 8, boxShadow: "0 1px 4px rgba(0,0,0,.04)", minWidth: 0, overflow: "hidden" },
//   ic: (bg) => ({ width: 34, height: 34, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15 }),
//   lbl: { fontSize: 11, color: "#888", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
//   val: { fontSize: 18, fontWeight: 700, color: "#1a1a2e", lineHeight: 1.1 },

//   cc: { background: "#fff", borderRadius: 12, padding: 10, boxShadow: "0 1px 4px rgba(0,0,0,.04)", minWidth: 0, overflow: "hidden" },
//   ct: { fontSize: 12, fontWeight: 600, color: "#1a1a2e", marginBottom: 2 },
//   cs: { fontSize: 11, color: "#aaa", marginBottom: 4 },
//   leg: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4, fontSize: 11, color: "#666" },
//   ld: (c) => ({ width: 9, height: 9, borderRadius: 2, background: c, flexShrink: 0, display: "inline-block" }),

//   fbar: { background: "#fff", borderRadius: 12, padding: "10px 12px", marginBottom: 10, boxShadow: "0 1px 4px rgba(0,0,0,.04)", minWidth: 0, maxWidth: "100%", boxSizing: "border-box" },
//   sel: { fontSize: 12, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", color: "#333", cursor: "pointer", minWidth: 0, maxWidth: "100%", boxSizing: "border-box" },
//   sinp: { width: "100%", padding: "8px 12px 8px 32px", border: "1px solid #e5e7eb", borderRadius: 9, fontSize: 13, background: "#fff", color: "#333", outline: "none", boxSizing: "border-box" },
//   drop: { position: "absolute", top: "calc(100% + 3px)", left: 0, right: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, zIndex: 99, maxHeight: 200, overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,.08)" },
//   di: { padding: "7px 10px", fontSize: 12, cursor: "pointer", color: "#333" },
//   chip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", background: "#f3f0ff", color: "#7c3aed", borderRadius: 20, fontSize: 11, fontWeight: 500 },
//   clr: { fontSize: 11, padding: "5px 11px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", color: "#666", cursor: "pointer", flexShrink: 0 },

//   tcard: { background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,.04)", minWidth: 0, maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" },
//   th: { textAlign: "left", fontSize: 9, fontWeight: 600, color: "#aaa", padding: "7px 6px", borderBottom: "0.5px solid #eee", textTransform: "uppercase", letterSpacing: ".03em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
//   td: { padding: "7px 6px", borderBottom: "0.5px solid #f0f0f0", color: "#1a1a2e", verticalAlign: "middle", fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
//   badge: (s) => ({
//     display: "inline-block", padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600,
//     background: s === "Completed" ? "#dcfce7" : s === "Available" ? "#dbeafe" : s === "Soldout" ? "#fee2e2" : "#fef9c3",
//     color: s === "Completed" ? "#166534" : s === "Available" ? "#1e40af" : s === "Soldout" ? "#b45309" : "#854d0e",
//   }),
//   pill: (c, bg, bc) => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 26, height: 24, padding: "0 5px", borderRadius: 12, fontSize: 10, fontWeight: 600, background: bg, color: c, border: `1.5px solid ${bc}` }),
// };

// function ChartCanvas({ id, config, height = 220 }) {
//   const ref = useRef(null);
//   const inst = useRef(null);
//   useEffect(() => {
//     if (!ref.current) return;
//     if (inst.current) inst.current.destroy();
//     inst.current = new Chart(ref.current, config);
//     return () => inst.current?.destroy();
//   }, [JSON.stringify(config)]);
//   return <div style={{ position: "relative", width: "100%", height }}><canvas id={id} ref={ref} /></div>;
// }

// function StatCard({ icon, iconBg, label, value }) {
//   return (
//     <div style={S.card}>
//       <div style={S.ic(iconBg)}>{icon}</div>
//       <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
//         <div style={{ ...S.lbl, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
//         <div style={S.val}>{value ?? 0}</div>
//       </div>
//     </div>
//   );
// }

// function Section({ title, children, cols = 6 }) {
//   // Desktop column count is explicit per-section (3 or 6) using safe 1fr tracks,
//   // which can NEVER force the grid wider than its container (unlike minmax()
//   // with a fixed px floor, which can blow out under certain intrinsic-sizing
//   // edge cases). Mobile/tab breakpoints always override to 2 or 3 via CSS.
//   return (
//     <div style={{ marginBottom: 10, minWidth: 0, maxWidth: "100%" }}>
//       <div style={S.sh}>{title}</div>
//       <div className="an-stat-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
//         {children}
//       </div>
//     </div>
//   );
// }

// function TourBreakdown({ t, compact = false }) {
//   const tot = (t.gvPool || 0) + (t.irctcPool || 0);

//   if (compact) {
//     const unverified = t.unverifiedTravellers || 0;
//     const active = t.activeTravellers || 0;
//     const cancelRequest = t.cancellationRequestTravellers || 0;
//     const cancelled = t.fullyCancelledTravellers || 0;
//     const rejected = t.rejectedTravellers || 0;
//     const totalAll = unverified + active + cancelRequest + cancelled + rejected;

//     return (
//       <div style={{ padding: "10px 12px", background: "#f8f9fb" }}>
//         <div style={{ fontSize: 9, fontWeight: 600, color: "#888", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".03em" }}>
//           Traveller Status
//         </div>
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6 }}>
//           {[
//             ["Total", totalAll, "#ede9fe", "#5b21b6"],
//             ["Unverified", unverified, "#fef3c7", "#92400e"],
//             ["Active", active, "#dcfce7", "#166534"],
//             ["Cancel request", cancelRequest, "#fde8d8", "#9a3412"],
//             ["Cancelled", cancelled, "#fee2e2", "#991b1b"],
//             ["Rejected", rejected, "#f3e8ff", "#6b21a8"],
//           ].map(([lbl, val, bg, color]) => (
//             <div key={lbl} style={{ display: "flex", flexDirection: "column", alignItems: "center", background: bg, borderRadius: 8, padding: "8px 6px", minWidth: 0 }}>
//               <span style={{ fontSize: 10, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lbl}</span>
//               <span style={{ fontWeight: 700, fontSize: 16, color, marginTop: 2 }}>{val}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: "10px 12px", background: "#f8f9fb" }}>

//       <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 8 }}>
//         {[
//           ["TNR", t.totalTNR || 0, "#fff", "#1a1a2e"],
//           ["Travellers", t.totalTravellers || 0, "#f3f0ff", "#7c3aed"],
//           ["Cancelled", t.cancelledTravellers || 0, "#fef2f2", "#dc2626"],
//         ].map(([lbl, val, bg, color]) => (
//           <div key={lbl} style={{ textAlign: "center", background: bg, borderRadius: 8, padding: "6px 4px", minWidth: 0 }}>
//             <div style={{ fontSize: 9, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lbl}</div>
//             <div style={{ fontWeight: 600, fontSize: 14, color }}>{val}</div>
//           </div>
//         ))}
//       </div>

//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
//         <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#fdf2f8", borderRadius: 8, padding: "5px 4px" }}>
//           <span style={{ fontSize: 9, color: "#9d174d" }}>Female</span>
//           <span style={{ fontWeight: 600, fontSize: 13, color: "#9d174d" }}>{t.totalFemale || 0}</span>
//         </div>
//         <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#eff6ff", borderRadius: 8, padding: "5px 4px" }}>
//           <span style={{ fontSize: 9, color: "#1d4ed8" }}>Male</span>
//           <span style={{ fontWeight: 600, fontSize: 13, color: "#1d4ed8" }}>{t.totalMale || 0}</span>
//         </div>
//         <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#fef9c3", borderRadius: 8, padding: "5px 4px" }}>
//           <span style={{ fontSize: 9, color: "#854d0e" }}>Child</span>
//           <span style={{ fontWeight: 600, fontSize: 13, color: "#854d0e" }}>{t.totalChild || 0}</span>
//         </div>
//       </div>

//       <div style={{ fontSize: 9, fontWeight: 600, color: "#888", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".03em" }}>
//         Traveller Status
//       </div>
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6, marginBottom: tot > 0 ? 8 : 0 }}>
//         {[
//           ["Unverified", t.unverifiedTravellers || 0, "#fef3c7", "#92400e"],
//           ["Active", t.activeTravellers || 0, "#dcfce7", "#166534"],
//           ["Cancel request", t.cancellationRequestTravellers || 0, "#fde8d8", "#9a3412"],
//           ["Cancelled", t.fullyCancelledTravellers || 0, "#fee2e2", "#991b1b"],
//           ["Rejected", t.rejectedTravellers || 0, "#f3e8ff", "#6b21a8"],
//         ].map(([lbl, val, bg, color]) => (
//           <div key={lbl} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: bg, borderRadius: 8, padding: "6px 8px", minWidth: 0 }}>
//             <span style={{ fontSize: 10, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lbl}</span>
//             <span style={{ fontWeight: 700, fontSize: 13, color, flexShrink: 0, marginLeft: 6 }}>{val}</span>
//           </div>
//         ))}
//       </div>

//       {tot > 0 && (
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
//           {[["GV cancel", fmtFull(t.gvPool || 0), "#15803d"], ["IRCTC cancel", fmtFull(t.irctcPool || 0), "#b45309"], ["Total cancel", fmtFull(tot), "#1a1a2e"]].map(([lbl, val, color]) => (
//             <div key={lbl} style={{ textAlign: "center", background: "#fff", borderRadius: 8, padding: "5px 4px", minWidth: 0 }}>
//               <div style={{ fontSize: 9, color: "#888" }}>{lbl}</div>
//               <div style={{ fontWeight: 600, fontSize: 11, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{val}</div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function TourCard({ t, i }) {
//   const [open, setOpen] = useState(false);
//   const status = t.isCompleted === 1 ? "Completed" : t.available === false ? "Soldout" : "Available";

//   return (
//     <div style={{ border: "0.5px solid #eee", borderRadius: 10, marginBottom: 6, overflow: "hidden", maxWidth: "100%" }}>
//       <div onClick={() => setOpen(p => !p)}
//         style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", cursor: "pointer", gap: 8, background: "#fff" }}>
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <div style={{ fontWeight: 600, fontSize: 13, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//             {i + 1}. {t.tourName || "—"}
//           </div>
//           <div style={{ fontSize: 10, color: "#aaa", marginTop: 1 }}>{t.tourType || ""}</div>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
//           <span style={S.badge(status)}>{status}</span>
//           <span style={{ fontSize: 14, color: "#aaa", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }}>▾</span>
//         </div>
//       </div>
//       {open && (
//         <div style={{ borderTop: "0.5px solid #eee" }}>
//           <TourBreakdown t={t} />
//         </div>
//       )}
//     </div>
//   );
// }

// export default function Analytics() {
//   const {
//     getAnalyticsSummaryData,
//     getAnalyticsYearWise,
//     getAnalyticsMonthWise,
//     getAnalyticsCancellation,
//     getAnalyticsTourList,
//     searchAnalyticsTours,
//   } = useContext(TourAdminContext);

//   const [filters, setFilters] = useState({ year: "", month: "", type: "", status: "" });
//   // ── Range filter (year range + month range, independent AND filters) ──
//   // When rangeMode is on, fromYear/toYear and fromMonth/toMonth take
//   // priority over the single year/month dropdowns above.
//   const [rangeMode, setRangeMode] = useState(false);
//   const [range, setRange] = useState({ fromYear: "", toYear: "", fromMonth: "", toMonth: "" });
//   const [selTours, setSelTours] = useState([]);
//   const [searchQ, setSearchQ] = useState("");
//   const [showDrop, setShowDrop] = useState(false);
//   const [searchRes, setSearchRes] = useState([]);
//   const [summary, setSummary] = useState({});
//   const [yearWise, setYearWise] = useState([]);
//   const [monthWise, setMonthWise] = useState([]);
//   const [cancelYW, setCancelYW] = useState([]);
//   const [cancelMW, setCancelMW] = useState([]);
//   const [tourList, setTourList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [tableLoading, setTableLoading] = useState(false);
//   const [expandedRow, setExpandedRow] = useState(null);
//   const dropRef = useRef(null);

//   // ── Container-width tracking for table-vs-card-list decision ──────────
//   // Uses window.innerWidth + a resize listener. The previous ResizeObserver
//   // approach measured the .an-root container directly, but in practice its
//   // callback wasn't reliably triggering a re-render (containerWidth stayed
//   // null, so showTable's `containerWidth === null` fallback always won and
//   // the table rendered even on narrow/mobile viewports). A plain window
//   // resize listener is simpler and has none of that ambiguity — it always
//   // fires, and the state update always triggers a re-render.
//   const rootRef = useRef(null);
//   const [winWidth, setWinWidth] = useState(() => window.innerWidth);
//   useEffect(() => {
//     const onResize = () => setWinWidth(window.innerWidth);
//     window.addEventListener("resize", onResize);
//     return () => window.removeEventListener("resize", onResize);
//   }, []);
//   // Table needs >= 760px of CONTENT area (not raw window width) to render
//   // without feeling cramped. The sidebar (see TourSidebar.jsx) takes ~288px
//   // once it appears at its own lg=1024px breakpoint, so the content area is
//   // (window width - 288) once winWidth >= 1024, and equal to window width
//   // below that (sidebar is a hidden hamburger drawer, doesn't eat space).
//   const sidebarWidth = winWidth >= 1024 ? 288 : 0;
//   const contentWidth = winWidth - sidebarWidth;
//   const showTable = contentWidth >= 760;

//   const tourIdParam = selTours.map(t => t._id.toString()).join(",");

//   // ── IMPORTANT: TourAdminContext functions must also be updated ────────
//   // getAnalyticsYearWise and getAnalyticsMonthWise currently accept
//   // (year) as a single positional arg (per existing context). The calls
//   // below pass an extra params object for range support — the context
//   // functions need a matching update to forward fromYear/toYear/
//   // fromMonth/toMonth into the query string. See the accompanying
//   // TourAdminContext patch notes.

//   useEffect(() => {
//     Promise.all([
//       getAnalyticsYearWise(rangeMode ? { fromYear: range.fromYear, toYear: range.toYear } : {}),
//       getAnalyticsCancellation({ view: "year", ...(rangeMode ? { fromYear: range.fromYear, toYear: range.toYear } : {}) }),
//     ]).then(([yw, ca]) => {
//       setYearWise(yw.data || []);
//       setCancelYW(ca.data || []);
//     }).catch(console.error);
//   }, [rangeMode, range.fromYear, range.toYear]);

//   useEffect(() => {
//     if (rangeMode) {
//       // Range mode: month-wise chart spans the whole year+month range,
//       // not just a single selected year.
//       // IMPORTANT: pass `undefined` (not `null`) for the year arg — JS
//       // default parameters only kick in for `undefined`, not `null`.
//       // Passing `null` here previously caused the context function's
//       // `year = new Date().getFullYear()` default to NOT apply, and a
//       // literal year=null ended up in the request URL.
//       Promise.all([
//         getAnalyticsMonthWise(undefined, { fromYear: range.fromYear, toYear: range.toYear, fromMonth: range.fromMonth, toMonth: range.toMonth }),
//         getAnalyticsCancellation({ view: "month", fromYear: range.fromYear, toYear: range.toYear, fromMonth: range.fromMonth, toMonth: range.toMonth }),
//       ]).then(([mw, cm]) => {
//         setMonthWise(mw.data || []);
//         setCancelMW(cm.data || []);
//       }).catch(console.error);
//     } else {
//       const y = filters.year || new Date().getFullYear();
//       Promise.all([
//         getAnalyticsMonthWise(y),
//         getAnalyticsCancellation({ view: "month", year: y }),
//       ]).then(([mw, cm]) => {
//         setMonthWise(mw.data || []);
//         setCancelMW(cm.data || []);
//       }).catch(console.error);
//     }
//   }, [filters.year, rangeMode, range.fromYear, range.toYear, range.fromMonth, range.toMonth]);

//   const fetchFiltered = useCallback(async () => {
//     setTableLoading(true);
//     try {
//       const dateParams = rangeMode
//         ? { fromYear: range.fromYear, toYear: range.toYear, fromMonth: range.fromMonth, toMonth: range.toMonth }
//         : { year: filters.year, month: filters.month };
//       const [sum, list] = await Promise.all([
//         getAnalyticsSummaryData({ ...dateParams, tourId: tourIdParam }),
//         getAnalyticsTourList({ ...dateParams, type: filters.type, status: filters.status, tourId: tourIdParam }),
//       ]);
//       setSummary(sum.data || {});
//       setTourList(list.data || []);
//     } catch (e) { console.error(e); }
//     finally { setTableLoading(false); setLoading(false); }
//   }, [filters, tourIdParam, rangeMode, range]);

//   useEffect(() => { fetchFiltered(); }, [fetchFiltered]);

//   useEffect(() => {
//     if (searchQ.length < 1) { setSearchRes([]); setShowDrop(false); return; }
//     const dateParams = rangeMode
//       ? { fromYear: range.fromYear, toYear: range.toYear, fromMonth: range.fromMonth, toMonth: range.toMonth }
//       : { year: filters.year, month: filters.month };
//     searchAnalyticsTours({ q: searchQ, ...dateParams, status: filters.status })
//       .then(r => { setSearchRes(r.data || []); setShowDrop((r.data || []).length > 0); })
//       .catch(console.error);
//   }, [searchQ, filters.year, filters.month, filters.status, rangeMode, range]);

//   useEffect(() => {
//     const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
//     document.addEventListener("mousedown", h);
//     return () => document.removeEventListener("mousedown", h);
//   }, []);

//   const selTour = (t) => { if (!selTours.find(s => s._id.toString() === t._id.toString())) setSelTours(p => [...p, t]); setSearchQ(""); setShowDrop(false); };
//   const removeTour = (id) => setSelTours(p => p.filter(t => t._id.toString() !== id.toString()));
//   const clearAll = () => {
//     setFilters({ year: "", month: "", type: "", status: "" });
//     setRange({ fromYear: "", toYear: "", fromMonth: "", toMonth: "" });
//     setSelTours([]);
//     setSearchQ("");
//   };

//   // Fixed chart height; layout (1-col vs 2-col) is handled entirely by
//   // the .an-chart-grid CSS media query above, not by JS.
//   const chartH = 200;

//   const chartYW = {
//     type: "bar",
//     data: { labels: yearWise.map(d => d._id), datasets: [{ data: yearWise.map(d => d.travellers || 0), backgroundColor: "#2563eb", borderRadius: 5, barPercentage: .55 }] },
//     options: {
//       responsive: true, maintainAspectRatio: false,
//       plugins: { legend: { display: false }, datalabels: { anchor: "end", align: "top", color: "#1a1a2e", font: { size: 10, weight: "600" }, formatter: v => v > 0 ? v.toLocaleString() : "" } },
//       scales: { x: { ticks: { font: { size: 9 } }, grid: { display: false } }, y: { ticks: { font: { size: 9 } }, grid: { color: "rgba(0,0,0,0.05)" } } },
//       layout: { padding: { top: 20 } }
//     }
//   };

//   const mwFull = Array.from({ length: 12 }, (_, i) => { const f = monthWise.find(d => d.month === i + 1); return f ? (f.travellers || 0) : 0; });
//   const chartMW = {
//     type: "line",
//     data: {
//       labels: MN.slice(1), datasets: [{
//         data: mwFull,
//         borderColor: "#7c3aed", backgroundColor: "transparent",
//         tension: 0, fill: false, borderWidth: 2.5,
//         pointRadius: 5, pointBackgroundColor: "#7c3aed",
//         pointBorderColor: "#7c3aed", pointBorderWidth: 0,
//       }]
//     },
//     options: {
//       responsive: true, maintainAspectRatio: false,
//       plugins: {
//         legend: { display: false },
//         datalabels: { anchor: "top", align: "top", offset: 6, color: "#5b21b6", font: { size: 10, weight: "700" }, formatter: v => v > 0 ? v.toLocaleString() : "" }
//       },
//       scales: {
//         x: { ticks: { font: { size: 9 }, color: "#888" }, grid: { display: false }, border: { display: false } },
//         y: { ticks: { font: { size: 9 }, color: "#bbb", callback: v => v >= 1000 ? `${v / 1000}K` : v }, grid: { color: "rgba(0,0,0,0.05)" }, border: { display: false }, min: 0 }
//       },
//       layout: { padding: { top: 32, right: 16 } }
//     }
//   };

//   // ── Traveller status: lollipop charts (year-wise + month-wise) ──────
//   // Each category (Active/Cancelled/Rejected) gets its own thin stem
//   // within a month/year slot, offset by ±1/3 of the slot width so all
//   // 3 sit side-by-side without overlapping (Active left, Cancelled
//   // center, Rejected right). Built on Chart.js's "scatter" type (which
//   // gives free control over exact x position per point) + the
//   // lollipopStemsPlugin registered above, since stock Chart.js has no
//   // lollipop chart type.
//   //
//   // "Active" total = activeTravellers + unverifiedTravellers +
//   // cancellationRequestTravellers (combined display rule — NOT the same
//   // as the Average Travellers card, which excludes unverifiedTravellers).
//   const ywLabels = yearWise.map(d => d._id);
//   const ywActiveVals = yearWise.map(d => (d.activeTravellers || 0) + (d.unverifiedTravellers || 0) + (d.cancellationRequestTravellers || 0));
//   const ywCancelledVals = yearWise.map(d => d.cancelledTravellers || 0);
//   const ywRejectedVals = yearWise.map(d => d.rejectedTravellers || 0);

//   const chartTravStatusYW = {
//     type: "scatter",
//     data: {
//       labels: ywLabels,
//       datasets: [
//         { label: "Active", data: ywActiveVals.map((v, i) => v ? { x: i - 0.22, y: v } : null).filter(Boolean), borderColor: "#16a34a", backgroundColor: "transparent", pointRadius: 0 },
//         { label: "Cancelled", data: ywCancelledVals.map((v, i) => v ? { x: i, y: v } : null).filter(Boolean), borderColor: "#f97316", backgroundColor: "transparent", pointRadius: 0 },
//         { label: "Rejected", data: ywRejectedVals.map((v, i) => v ? { x: i + 0.22, y: v } : null).filter(Boolean), borderColor: "#dc2626", backgroundColor: "transparent", pointRadius: 0 },
//       ]
//     },
//     options: {
//       _lollipop: true,
//       responsive: true, maintainAspectRatio: false,
//       layout: { padding: { top: 24 } },
//       plugins: { legend: { display: false }, tooltip: { enabled: false }, datalabels: { display: false } },
//       scales: {
//         x: {
//           type: "linear", min: -0.6, max: Math.max(0, ywLabels.length - 1) + 0.6,
//           afterBuildTicks: (axis) => {
//             axis.ticks = ywLabels.map((_, i) => ({ value: i }));
//           },
//           ticks: { callback: (v) => ywLabels[Math.round(v)] ?? "", font: { size: 9 } },
//           grid: { display: false }
//         },
//         y: { beginAtZero: true, ticks: { font: { size: 9 } }, grid: { color: "rgba(0,0,0,0.05)" } }
//       }
//     }
//   };

//   const mwLabels = MN.slice(1);
//   const mwActiveVals = Array.from({ length: 12 }, (_, i) => { const f = monthWise.find(d => d.month === i + 1); return f ? ((f.activeTravellers || 0) + (f.unverifiedTravellers || 0) + (f.cancellationRequestTravellers || 0)) : 0; });
//   const mwCancelledVals = Array.from({ length: 12 }, (_, i) => { const f = monthWise.find(d => d.month === i + 1); return f ? (f.cancelledTravellers || 0) : 0; });
//   const mwRejectedVals = Array.from({ length: 12 }, (_, i) => { const f = monthWise.find(d => d.month === i + 1); return f ? (f.rejectedTravellers || 0) : 0; });

//   const chartTravStatusMW = {
//     type: "scatter",
//     data: {
//       labels: mwLabels,
//       datasets: [
//         { label: "Active", data: mwActiveVals.map((v, i) => v ? { x: i - 0.22, y: v } : null).filter(Boolean), borderColor: "#16a34a", backgroundColor: "transparent", pointRadius: 0 },
//         { label: "Cancelled", data: mwCancelledVals.map((v, i) => v ? { x: i, y: v } : null).filter(Boolean), borderColor: "#f97316", backgroundColor: "transparent", pointRadius: 0 },
//         { label: "Rejected", data: mwRejectedVals.map((v, i) => v ? { x: i + 0.22, y: v } : null).filter(Boolean), borderColor: "#dc2626", backgroundColor: "transparent", pointRadius: 0 },
//       ]
//     },
//     options: {
//       _lollipop: true,
//       responsive: true, maintainAspectRatio: false,
//       layout: { padding: { top: 24 } },
//       plugins: { legend: { display: false }, tooltip: { enabled: false }, datalabels: { display: false } },
//       scales: {
//         x: {
//           type: "linear", min: -0.6, max: mwLabels.length - 1 + 0.6,
//           afterBuildTicks: (axis) => {
//             axis.ticks = mwLabels.map((_, i) => ({ value: i }));
//           },
//           ticks: { callback: (v) => mwLabels[Math.round(v)] ?? "", font: { size: 9 } },
//           grid: { display: false }
//         },
//         y: { beginAtZero: true, ticks: { font: { size: 9 } }, grid: { color: "rgba(0,0,0,0.05)" } }
//       }
//     }
//   };


//   const chartTourStatusYW = {
//     type: "bar",
//     data: {
//       labels: yearWise.map(d => d._id),
//       datasets: [
//         { label: "Available", data: yearWise.map(d => d.availableTours || 0), backgroundColor: "#2563eb", borderRadius: 2, stack: "s" },
//         { label: "Soldout", data: yearWise.map(d => d.soldoutTours || 0), backgroundColor: "#f97316", borderRadius: 2, stack: "s" },
//       ]
//     },
//     options: {
//       responsive: true, maintainAspectRatio: false,
//       plugins: { legend: { display: false }, datalabels: { color: "#fff", font: { size: 9, weight: "600" }, formatter: v => v > 0 ? v : "" } },
//       scales: { x: { stacked: true, ticks: { font: { size: 9 } }, grid: { display: false } }, y: { stacked: true, ticks: { font: { size: 9 } } } }
//     }
//   };

//   const mwAvailable = Array.from({ length: 12 }, (_, i) => { const f = monthWise.find(d => d.month === i + 1); return f ? (f.availableTours || 0) : 0; });
//   const mwSoldout = Array.from({ length: 12 }, (_, i) => { const f = monthWise.find(d => d.month === i + 1); return f ? (f.soldoutTours || 0) : 0; });
//   const chartTourStatusMW = {
//     type: "bar",
//     data: {
//       labels: MN.slice(1),
//       datasets: [
//         { label: "Available", data: mwAvailable, backgroundColor: "#2563eb", borderRadius: 2, stack: "s" },
//         { label: "Soldout", data: mwSoldout, backgroundColor: "#f97316", borderRadius: 2, stack: "s" },
//       ]
//     },
//     options: {
//       responsive: true, maintainAspectRatio: false,
//       plugins: { legend: { display: false }, datalabels: { color: "#fff", font: { size: 9, weight: "600" }, formatter: v => v > 0 ? v : "" } },
//       scales: { x: { stacked: true, ticks: { font: { size: 9 } }, grid: { display: false } }, y: { stacked: true, ticks: { font: { size: 9 } } } }
//     }
//   };

//   const chartCancelYW = {
//     type: "bar",
//     data: {
//       labels: cancelYW.map(d => d._id),
//       datasets: [
//         { label: "GV Cancelled", data: cancelYW.map(d => d.gvPool || 0), backgroundColor: "#ef4444", borderRadius: 6, barPercentage: .35, categoryPercentage: .7 },
//         { label: "IRCTC Cancelled", data: cancelYW.map(d => d.irctcPool || 0), backgroundColor: "#f59e0b", borderRadius: 6, barPercentage: .35, categoryPercentage: .7 },
//       ]
//     },
//     options: {
//       responsive: true, maintainAspectRatio: false,
//       plugins: {
//         legend: { display: false },
//         datalabels: {
//           anchor: "end", align: "top", color: "#1e1e2e",
//           font: { size: 9, weight: "600" },
//           formatter: v => v > 0 ? `₹${v.toLocaleString("en-IN")}` : ""
//         }
//       },
//       scales: {
//         x: { ticks: { font: { size: 9 }, color: "#888" }, grid: { display: false }, border: { display: false } },
//         y: {
//           ticks: { font: { size: 9 }, color: "#bbb", callback: v => v >= 1000 ? `₹${v / 1000}K` : v },
//           grid: { color: "rgba(0,0,0,0.04)" }, border: { display: false }
//         }
//       },
//       layout: { padding: { top: 22 } }
//     }
//   };

//   const cancelMWGV = Array.from({ length: 12 }, (_, i) => { const f = cancelMW.find(d => d._id === i + 1); return f ? (f.gvPool || 0) : 0; });
//   const cancelMWIRCTC = Array.from({ length: 12 }, (_, i) => { const f = cancelMW.find(d => d._id === i + 1); return f ? (f.irctcPool || 0) : 0; });
//   const chartCancelMW = {
//     type: "line",
//     data: {
//       labels: MN.slice(1),
//       datasets: [
//         { label: "GV", data: cancelMWGV, borderColor: "#ef4444", backgroundColor: "transparent", tension: 0, fill: false, pointRadius: 5, pointBackgroundColor: "#ef4444", pointBorderColor: "#ef4444", pointBorderWidth: 0, borderWidth: 2.5 },
//         { label: "IRCTC", data: cancelMWIRCTC, borderColor: "#f59e0b", backgroundColor: "transparent", tension: 0, fill: false, pointRadius: 5, pointBackgroundColor: "#f59e0b", pointBorderColor: "#f59e0b", pointBorderWidth: 0, borderWidth: 2.5 },
//       ]
//     },
//     options: {
//       responsive: true, maintainAspectRatio: false,
//       plugins: {
//         legend: { display: false },
//         datalabels: { anchor: "top", align: "top", offset: 5, font: { size: 9, weight: "600" }, color: ctx => ctx.datasetIndex === 0 ? "#ef4444" : "#d97706", formatter: v => v > 0 ? `₹${v.toLocaleString("en-IN")}` : "" }
//       },
//       scales: {
//         x: { ticks: { font: { size: 9 }, color: "#888" }, grid: { display: false }, border: { display: false } },
//         y: { ticks: { font: { size: 9 }, color: "#bbb", callback: v => v >= 1000 ? `₹${v / 1000}K` : v }, grid: { color: "rgba(0,0,0,0.05)" }, border: { display: false }, min: 0 }
//       },
//       layout: { padding: { top: 44, right: 16 } }
//     }
//   };

//   // ── Average Travellers ──────────────────────────────────────────────
//   // Single mode:
//   //   Year selected, month = All -> (Active + CancelRequest) / 12
//   //   Year + specific month selected -> (Active + CancelRequest) for that
//   //   month only, NOT divided (it's already a single-month figure).
//   // Range mode:
//   //   Total (Active + CancelRequest) across ALL years in the range
//   //   (summary already aggregates this correctly via the backend range
//   //   query) divided by the MONTH RANGE LENGTH only — year count does
//   //   NOT multiply into the divisor. E.g. years 2025–2026 + months Jan–Jun
//   //   -> divide by 6 (not 12), regardless of how many years are spanned.
//   const activePlusCancelRequest = (summary.activeTravellers || 0) + (summary.cancellationRequestTravellers || 0);
//   const monthRangeLength = (range.fromMonth && range.toMonth)
//     ? (() => {
//         const fm = parseInt(range.fromMonth), tm = parseInt(range.toMonth);
//         return fm <= tm ? (tm - fm + 1) : (12 - fm + 1 + tm); // wrap-around e.g. Nov(11)–Feb(2)
//       })()
//     : 12;
//   const avgTravellers = rangeMode
//     ? Math.round(activePlusCancelRequest / monthRangeLength)
//     : filters.month
//       ? activePlusCancelRequest
//       : Math.round(activePlusCancelRequest / 12);

//   const totTNR = tourList.reduce((a, t) => a + (t.totalTNR || 0), 0);
//   const totPax = tourList.reduce((a, t) => a + (t.totalTravellers || 0), 0);
//   const totCancelledTrav = tourList.reduce((a, t) => a + (t.cancelledTravellers || 0), 0);
//   const totFem = tourList.reduce((a, t) => a + (t.totalFemale || 0), 0);
//   const totMal = tourList.reduce((a, t) => a + (t.totalMale || 0), 0);
//   const totChi = tourList.reduce((a, t) => a + (t.totalChild || 0), 0);
//   const totGVt = tourList.reduce((a, t) => a + (t.gvPool || 0), 0);
//   const totIRt = tourList.reduce((a, t) => a + (t.irctcPool || 0), 0);

//   if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#888", fontSize: 14 }}>Loading analytics...</div>;

//   const cc = { ...S.cc, minWidth: 0, overflow: "hidden" };

//   return (
//     <div ref={rootRef} className="an-root" style={S.pg}>
//       <style>{RESPONSIVE_CSS}</style>

//       <div style={{ ...S.topbar, justifyContent: 'center', alignItems: 'center' }}>
//         <div style={{ textAlign: 'center' }}>
//           <h2 style={{ ...S.h2, fontSize: 29, color: 'blue' }}>
//             📊 Sales dashboard
//           </h2>
//           <div style={{ ...S.sub, color: 'gray' }}>
//             Overview of travellers, tours and cancellations
//           </div>
//         </div>
//       </div>
//       <br />

//       <div style={{ ...S.fbar, marginBottom: 12 }}>
//         <div className="an-fbar-grid">
//         <button
//           onClick={() => setRangeMode(p => !p)}
//           style={{
//             fontSize: 11, padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontWeight: 600,
//             border: rangeMode ? "1px solid #7c3aed" : "1px solid #e5e7eb",
//             background: rangeMode ? "#7c3aed" : "#fff",
//             color: rangeMode ? "#fff" : "#666",
//             width: "100%",
//           }}
//         >
//           {rangeMode ? "📅 Range mode" : "📅 Use range"}
//         </button>

//         {!rangeMode ? (
//           <>
//             <select className="an-sel" style={S.sel} value={filters.year} onChange={e => setFilters(p => ({ ...p, year: e.target.value }))}>
//               <option value="">All years</option>
//               {[...new Set([
//                 ...yearWise.map(d => d._id),
//                 new Date().getFullYear()
//               ])].sort((a, b) => b - a).map(y => <option key={y} value={y}>{y}</option>)}
//             </select>
//             <select className="an-sel" style={S.sel} value={filters.month} onChange={e => setFilters(p => ({ ...p, month: e.target.value }))}>
//               <option value="">All months</option>
//               {MN.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
//             </select>
//           </>
//         ) : (
//           <>
//             {/* ── Year range: from / to ── */}
//             <select className="an-sel" style={S.sel} value={range.fromYear} onChange={e => setRange(p => ({ ...p, fromYear: e.target.value }))}>
//               <option value="">Year from</option>
//               {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => <option key={y} value={y}>{y}</option>)}
//             </select>
//             <select className="an-sel" style={S.sel} value={range.toYear} onChange={e => setRange(p => ({ ...p, toYear: e.target.value }))}>
//               <option value="">Year to</option>
//               {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => <option key={y} value={y}>{y}</option>)}
//             </select>
//             {/* ── Month range: from / to (applied within EACH matched year independently) ── */}
//             <select className="an-sel" style={S.sel} value={range.fromMonth} onChange={e => setRange(p => ({ ...p, fromMonth: e.target.value }))}>
//               <option value="">Month from</option>
//               {MN.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
//             </select>
//             <select className="an-sel" style={S.sel} value={range.toMonth} onChange={e => setRange(p => ({ ...p, toMonth: e.target.value }))}>
//               <option value="">Month to</option>
//               {MN.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
//             </select>
//           </>
//         )}

//         <select className="an-sel" style={S.sel} value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}>
//           <option value="">All types</option>
//           <option value="Spiritual">Spiritual</option>
//           <option value="Historical">Historical</option>
//           <option value="International">International</option>
//           <option value="Jolly">Jolly</option>
//         </select>
//         <select className="an-sel" style={S.sel} value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
//           <option value="">All status</option>
//           <option value="Available">Available</option>
//           <option value="Soldout">Soldout</option>
//           <option value="Completed">Completed</option>
//         </select>
//         <div className="an-search-wrap" style={{ position: "relative", gridColumn: rangeMode ? "span 1" : "span 3" }} ref={dropRef}>
//           <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#aaa", pointerEvents: "none" }}>🔍</span>
//           <input style={S.sinp} placeholder="Search tour..." value={searchQ}
//             onChange={e => setSearchQ(e.target.value)}
//             onFocus={() => searchRes.length > 0 && setShowDrop(true)} />
//           {showDrop && searchRes.length > 0 && (
//             <div style={S.drop}>
//               <div style={{ ...S.di, fontWeight: 600, borderBottom: "0.5px solid #eee", color: "#7c3aed" }}
//                 onMouseDown={() => { const n = searchRes.filter(r => !selTours.find(s => s._id.toString() === r._id.toString())); setSelTours(p => [...p, ...n]); setSearchQ(""); setShowDrop(false); }}>
//                 ✓ Select all ({searchRes.length})
//               </div>
//               {searchRes.map(t => (
//                 <div key={t._id} style={{ ...S.di, background: selTours.find(s => s._id.toString() === t._id.toString()) ? "#f3f0ff" : "transparent" }} onMouseDown={() => selTour(t)}>
//                   {t.tourName}<small style={{ display: "block", fontSize: 10, color: "#aaa" }}>{t.tourType}</small>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//         <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center", minWidth: 0 }}>
//           {selTours.length === 0
//             ? <span style={{ ...S.chip, background: "#f4f6fb", color: "#888" }}>🔽 All tours</span>
//             : selTours.map(t => (
//               <span key={t._id} style={S.chip}>
//                 {t.tourName?.split(" ").slice(0, 3).join(" ")}
//                 <button onClick={() => removeTour(t._id)} style={{ background: "none", border: "none", color: "#7c3aed", cursor: "pointer", fontSize: 13, lineHeight: 1, padding: 0 }}>×</button>
//               </span>
//             ))
//           }
//         </div>
//         <button style={{ ...S.clr, width: "50%", marginLeft: "auto", display: "block" }} onClick={clearAll}>✕ Clear</button>
//         </div>
//       </div>

//       {/* ── Total summary — standalone section, sits right under the filter bar.
//            Shows the same aggregate totals as the table's own footer row,
//            but always visible regardless of table-vs-card-list view. ── */}
//       <div style={{ marginBottom: 10, minWidth: 0, maxWidth: "100%" }}>
//         <div style={S.sh}>Total summary ({tableLoading ? "…" : `${tourList.length} tours`})</div>
//         <div className="an-stat-grid" style={{ gridTemplateColumns: `repeat(3, 1fr)` }}>
//           {[
//             ["TNR", totTNR, "#1a1a2e"],
//             ["Travellers (Active+CR+UV)", totPax, "#7c3aed"],
//             ["Cancelled trav", totCancelledTrav, "#dc2626"],
//             ["Female", totFem, "#9d174d"],
//             ["Male", totMal, "#1d4ed8"],
//             ["Child", totChi, "#854d0e"],
//             ["GV cancel", fmtFull(totGVt), "#15803d"],
//             ["IRCTC cancel", fmtFull(totIRt), "#b45309"],
//             ["Total cancel", fmtFull(totGVt + totIRt), "#1a1a2e"],
//           ].map(([lbl, val, color]) => (
//             <div key={lbl} style={{ background: "#fff", borderRadius: 8, padding: "8px 8px", minWidth: 0, boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
//               <div style={{ fontSize: 9, color: "#aaa", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lbl}</div>
//               <div style={{ fontSize: 14, fontWeight: 700, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{val}</div>
//             </div>
//           ))}
//         </div>
//       </div>


//       <Section title="Tours" cols={3}>
//         <StatCard icon="🚌" iconBg="#ede9fe" label="Total tours" value={tourList.length} />
//         <StatCard icon="✅" iconBg="#dbeafe" label="Available" value={tourList.filter(t => t.available !== false).length} />
//         <StatCard icon="🔴" iconBg="#fee2e2" label="Soldout" value={tourList.filter(t => t.available === false).length} />
//       </Section>

//       <Section title="Tour Bookings" cols={3}>
//         <StatCard icon="📋" iconBg="#e0f2fe" label="Total bookings" value={summary.totalBookings || 0} />
//         <StatCard icon="⏳" iconBg="#f1f5f9" label="Unverified" value={summary.unverifiedBookings || 0} />
//         <StatCard icon="🟢" iconBg="#dcfce7" label="Active (Advance only paid)" value={summary.activeBookings || 0} />
//         <StatCard icon="🏆" iconBg="#fef9c3" label="Completed (Booking completed)" value={summary.completedBookings || 0} />
//         <StatCard icon="❌" iconBg="#fee2e2" label="Fully cancelled" value={summary.fullyCancelledBookings || 0} />
//         <StatCard icon="🚫" iconBg="#f3e8ff" label="Rejected" value={summary.rejectedBookings || 0} />
//       </Section>

//       <Section title="Travellers" cols={3}>
//         <StatCard icon="👥" iconBg="#ede9fe" label="Total travellers" value={(summary.totalTravellers || 0).toLocaleString("en-IN")} />
//         <StatCard icon="📊" iconBg="#e0e7ff" label="Average travellers (Active+CR)" value={avgTravellers} />
//         <StatCard icon="⏳" iconBg="#fef3c7" label="Unverified travellers" value={summary.unverifiedTravellers || 0} />
//         <StatCard icon="🟢" iconBg="#dcfce7" label="Active travellers (Once advance paid)" value={summary.activeTravellers || 0} />
//         <StatCard icon="🔶" iconBg="#fef3c7" label="Cancelled" value={summary.cancelledTravellers || 0} />
//         <StatCard icon="🕐" iconBg="#fde8d8" label="Cancel request" value={summary.cancellationRequestTravellers || 0} />
//         <StatCard icon="🚫" iconBg="#fee2e2" label="Rejected" value={summary.rejectedTravellers || 0} />
//       </Section>

//       <Section title="Gender (Completed bookings)" cols={3}>
//         <StatCard icon="👩" iconBg="#fce7f3" label="Female" value={summary.totalFemale || 0} />
//         <StatCard icon="👨" iconBg="#dbeafe" label="Male" value={summary.totalMale || 0} />
//         <StatCard icon="🧒" iconBg="#fef9c3" label="Child" value={summary.totalChild || 0} />
//       </Section>

//       <Section title="Cancellation Amount" cols={3}>
//         <StatCard icon="₹" iconBg="#fef3c7" label="GV cancellation" value={fmtFull(summary.totalGVPool || 0)} />
//         <StatCard icon="🎫" iconBg="#ede9fe" label="IRCTC cancellation" value={fmtFull(summary.totalIRCTCPool || 0)} />
//         <StatCard icon="💰" iconBg="#fee2e2" label="Total cancellation" value={fmtFull((summary.totalGVPool || 0) + (summary.totalIRCTCPool || 0))} />
//       </Section>

//       <div className="an-chart-grid">
//         <div style={cc}>
//           <div style={S.ct}>Total travellers — year wise</div>
//           <div style={S.cs}>By departure year</div>
//           <ChartCanvas id="c1" config={chartYW} height={chartH} />
//         </div>
//         <div style={cc}>
//           <div style={S.ct}>Total travellers — month wise {filters.year ? `(${filters.year})` : `(${new Date().getFullYear()})`}</div>
//           <div style={S.cs}>By departure month</div>
//           <ChartCanvas id="c2" config={chartMW} height={chartH} />
//         </div>
//       </div>

//       <div className="an-chart-grid">
//         <div style={cc}>
//           <div style={S.ct}>Traveller status — year wise</div>
//           <div style={S.cs}>Active / Cancelled / Rejected</div>
//           <div style={S.leg}>{[["#16a34a", "Active"], ["#f97316", "Cancelled"], ["#dc2626", "Rejected"]].map(([c, l]) => (<span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>))}</div>
//           <ChartCanvas id="c3" config={chartTravStatusYW} height={chartH + 40} />
//         </div>
//         <div style={cc}>
//           <div style={S.ct}>Traveller status — month wise {filters.year ? `(${filters.year})` : `(${new Date().getFullYear()})`}</div>
//           <div style={S.cs}>Active / Cancelled / Rejected</div>
//           <div style={S.leg}>{[["#16a34a", "Active"], ["#f97316", "Cancelled"], ["#dc2626", "Rejected"]].map(([c, l]) => (<span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>))}</div>
//           <ChartCanvas id="c4" config={chartTravStatusMW} height={chartH + 40} />
//         </div>
//       </div>

//       <div className="an-chart-grid">
//         <div style={cc}>
//           <div style={S.ct}>Tour status — year wise</div>
//           <div style={S.cs}>Available / Soldout per year</div>
//           <div style={S.leg}>{[["#2563eb", "Available"], ["#f97316", "Soldout"]].map(([c, l]) => (<span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>))}</div>
//           <ChartCanvas id="c5" config={chartTourStatusYW} height={chartH + 40} />
//         </div>
//         <div style={cc}>
//           <div style={S.ct}>Tour status — month wise {filters.year ? `(${filters.year})` : `(${new Date().getFullYear()})`}</div>
//           <div style={S.cs}>Available / Soldout by month</div>
//           <div style={S.leg}>{[["#2563eb", "Available"], ["#f97316", "Soldout"]].map(([c, l]) => (<span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>))}</div>
//           <ChartCanvas id="c6" config={chartTourStatusMW} height={chartH + 40} />
//         </div>
//       </div>

//       <div className="an-chart-grid">
//         <div style={cc}>
//           <div style={S.ct}>Cancellations — year wise</div>
//           <div style={S.cs}>GV vs IRCTC cancel amounts per year</div>
//           <div style={S.leg}>{[["#ef4444", "GV Cancelled"], ["#f59e0b", "IRCTC Cancelled"]].map(([c, l]) => (<span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>))}</div>
//           <ChartCanvas id="c7" config={chartCancelYW} height={chartH} />
//         </div>
//         <div style={cc}>
//           <div style={S.ct}>Cancellations — month wise {filters.year ? `(${filters.year})` : `(${new Date().getFullYear()})`}</div>
//           <div style={S.cs}>GV vs IRCTC cancel amounts by month</div>
//           <div style={S.leg}>{[["#ef4444", "GV"], ["#f59e0b", "IRCTC"]].map(([c, l]) => (<span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>))}</div>
//           <ChartCanvas id="c8" config={chartCancelMW} height={chartH + 60} />
//         </div>
//       </div>

//       <div style={S.tcard}>
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
//           <div>
//             <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>Tour profile performance</div>
//             <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>
//               {rangeMode
//                 ? (range.fromYear || range.toYear || range.fromMonth || range.toMonth)
//                   ? `Range: ${[
//                       range.fromYear && range.toYear ? `${range.fromYear}–${range.toYear}` : range.fromYear || range.toYear,
//                       range.fromMonth && range.toMonth ? `${MN[+range.fromMonth]}–${MN[+range.toMonth]}` : range.fromMonth ? MN[+range.fromMonth] : range.toMonth ? MN[+range.toMonth] : "",
//                       filters.type, filters.status
//                     ].filter(Boolean).join(" · ")}`
//                   : "Range mode — pick a year/month range"
//                 : (filters.year || filters.month || filters.type || filters.status || selTours.length)
//                   ? `Filtered: ${[filters.year, filters.month ? MN[+filters.month] : "", filters.type, filters.status].filter(Boolean).join(" · ")}`
//                   : "Showing all tours"}
//             </div>
//           </div>
//           <span style={{ fontSize: 11, color: "#aaa" }}>{tableLoading ? "Loading..." : `${tourList.length} tours`}</span>
//         </div>

//         {!showTable && (
//           <div>
//             {tableLoading
//               ? <div style={{ textAlign: "center", padding: 24, color: "#aaa" }}>Loading...</div>
//               : tourList.length === 0
//                 ? <div style={{ textAlign: "center", padding: 24, color: "#aaa" }}>No tours match</div>
//                 : <>
//                   {tourList.map((t, i) => <TourCard key={t._id} t={t} i={i} />)}
//                 </>
//             }
//           </div>
//         )}

//         {showTable && (
//         <div className="an-desk-table-wrap" style={{ WebkitOverflowScrolling: "touch" }}>
//           <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse", tableLayout: "fixed" }}>
//             <colgroup>
//               <col style={{ width: "28px" }} />
//               <col style={{ width: "19%" }} />
//               <col style={{ width: "5%" }} />
//               <col style={{ width: "7%" }} />
//               <col style={{ width: "7%" }} />
//               <col style={{ width: "5%" }} />
//               <col style={{ width: "5%" }} />
//               <col style={{ width: "5%" }} />
//               <col style={{ width: "10%" }} />
//               <col style={{ width: "10%" }} />
//               <col style={{ width: "10%" }} />
//               <col style={{ width: "8%" }} />
//             </colgroup>
//             <thead>
//               <tr style={{ background: "#f8f9fa" }}>
//                 {["S.No", "Tour name", "TNR", "Travellers", "Cancelled", "Female", "Male", "Child", "GV cancel", "IRCTC cancel", "Total cancel", "Status"].map((h, i) => (
//                   <th key={i} style={{ ...S.th, textAlign: i === 0 ? "center" : i === 1 ? "left" : "center", padding: i === 0 ? "7px 2px" : i === 1 ? "7px 6px 7px 4px" : S.th.padding }}>{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {tableLoading ? (
//                 <tr><td colSpan={12} style={{ ...S.td, textAlign: "center", padding: 24, color: "#aaa" }}>Loading...</td></tr>
//               ) : tourList.length === 0 ? (
//                 <tr><td colSpan={12} style={{ ...S.td, textAlign: "center", padding: 24, color: "#aaa" }}>No tours match</td></tr>
//               ) : (
//                 <>
//                   {tourList.map((t, i) => {
//                     const status = t.isCompleted === 1 ? "Completed" : t.available === false ? "Soldout" : "Available";
//                     const tot = (t.gvPool || 0) + (t.irctcPool || 0);
//                     const isOpen = expandedRow === t._id;
//                     return (
//                       <React.Fragment key={t._id}>
//                         <tr
//                           onClick={() => setExpandedRow(isOpen ? null : t._id)}
//                           style={{ cursor: "pointer", background: isOpen ? "#f3f0ff" : "transparent" }}
//                           onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = "#fafafa"; }}
//                           onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = "transparent"; }}>
//                           <td style={{ ...S.td, color: "#ccc", fontSize: 10, textAlign: "center", padding: "7px 2px" }}>{i + 1}</td>
//                           <td style={{ ...S.td, padding: "7px 6px 7px 4px" }}>
//                             <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
//                               <span style={{ fontSize: 10, color: "#7c3aed", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .15s", flexShrink: 0 }}>▸</span>
//                               <div style={{ minWidth: 0, overflow: "hidden" }}>
//                                 <div style={{ fontWeight: 600, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.tourName || "—"}</div>
//                                 <small style={{ color: "#aaa", fontSize: 10 }}>{t.tourType || ""}</small>
//                               </div>
//                             </div>
//                           </td>
//                           <td style={{ ...S.td, textAlign: "center", fontWeight: 600 }}>{t.totalTNR || 0}</td>
//                           <td style={{ ...S.td, textAlign: "center", fontWeight: 600, color: "#7c3aed" }}>{t.totalTravellers || 0}</td>
//                           <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#dc2626", "#fef2f2", "#fca5a5")}>{t.cancelledTravellers || 0}</span></td>
//                           <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#9d174d", "#fdf2f8", "#f9a8d4")}>{t.totalFemale || 0}</span></td>
//                           <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#1d4ed8", "#eff6ff", "#93c5fd")}>{t.totalMale || 0}</span></td>
//                           <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#854d0e", "#fef9c3", "#fde68a")}>{t.totalChild || 0}</span></td>
//                           <td style={{ ...S.td, textAlign: "center", color: "#15803d", fontWeight: 600 }}>{fmtFull(t.gvPool || 0)}</td>
//                           <td style={{ ...S.td, textAlign: "center", color: "#b45309", fontWeight: 600 }}>{fmtFull(t.irctcPool || 0)}</td>
//                           <td style={{ ...S.td, textAlign: "center", fontWeight: 600 }}>{fmtFull(tot)}</td>
//                           <td style={{ ...S.td, textAlign: "center" }}><span style={S.badge(status)}>{status}</span></td>
//                         </tr>
//                         {isOpen && (
//                           <tr>
//                             <td colSpan={12} style={{ padding: 0, borderBottom: "0.5px solid #f0f0f0" }}>
//                               <TourBreakdown t={t} compact />
//                             </td>
//                           </tr>
//                         )}
//                       </React.Fragment>
//                     );
//                   })}
//                 </>
//               )}
//             </tbody>
//           </table>
//         </div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { TourAdminContext } from "../../context/TourAdminContext";

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
    const dotRadius = Math.max(1.5, Math.min(3.5, pxPerCategory / 16));
    const lineWidth = Math.max(2.5, Math.min(2.5, pxPerCategory / 30));
    const fontSize = Math.max(10, Math.min(11, Math.round(pxPerCategory / 9)));

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
    background: s === "Completed" ? "#dcfce7" : s === "Available" ? "#dbeafe" : s === "Soldout" ? "#fee2e2" : "#fef9c3",
    color: s === "Completed" ? "#166534" : s === "Available" ? "#1e40af" : s === "Soldout" ? "#b45309" : "#854d0e",
  }),
  pill: (c, bg, bc) => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 26, height: 24, padding: "0 5px", borderRadius: 12, fontSize: 10, fontWeight: 600, background: bg, color: c, border: `1.5px solid ${bc}` }),
};

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
    const rejected = t.rejectedTravellers || 0;
    const totalAll = unverified + active + cancelRequest + cancelled + rejected;

    return (
      <div style={{ padding: "10px 12px", background: "#f8f9fb" }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: "#888", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".03em" }}>
          Traveller Status
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6 }}>
          {[
            ["Total", totalAll, "#ede9fe", "#5b21b6"],
            ["Unverified", unverified, "#fef3c7", "#92400e"],
            ["Active", active, "#dcfce7", "#166534"],
            ["Cancel request", cancelRequest, "#fde8d8", "#9a3412"],
            ["Cancelled", cancelled, "#fee2e2", "#991b1b"],
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#fdf2f8", borderRadius: 8, padding: "5px 4px" }}>
          <span style={{ fontSize: 9, color: "#9d174d" }}>Female</span>
          <span style={{ fontWeight: 600, fontSize: 13, color: "#9d174d" }}>{t.totalFemale || 0}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#eff6ff", borderRadius: 8, padding: "5px 4px" }}>
          <span style={{ fontSize: 9, color: "#1d4ed8" }}>Male</span>
          <span style={{ fontWeight: 600, fontSize: 13, color: "#1d4ed8" }}>{t.totalMale || 0}</span>
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
  const status = t.isCompleted === 1 ? "Completed" : t.available === false ? "Soldout" : "Available";

  return (
    <div style={{ border: "0.5px solid #eee", borderRadius: 10, marginBottom: 6, overflow: "hidden", maxWidth: "100%" }}>
      <div onClick={() => setOpen(p => !p)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", cursor: "pointer", gap: 8, background: "#fff" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
  // Table needs >= 760px of CONTENT area (not raw window width) to render
  // without feeling cramped. The sidebar (see TourSidebar.jsx) takes ~288px
  // once it appears at its own lg=1024px breakpoint, so the content area is
  // (window width - 288) once winWidth >= 1024, and equal to window width
  // below that (sidebar is a hidden hamburger drawer, doesn't eat space).
  const sidebarWidth = winWidth >= 1024 ? 288 : 0;
  const contentWidth = winWidth - sidebarWidth;
  const showTable = contentWidth >= 760;

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
  const ywRejectedVals = yearWise.map(d => d.rejectedTravellers || 0);

  const chartTravStatusYW = {
    type: "scatter",
    data: {
      labels: ywLabels,
      datasets: [
        { label: "Active", data: ywActiveVals.map((v, i) => v ? { x: i - 0.22, y: v } : null).filter(Boolean), borderColor: "#16a34a", backgroundColor: "transparent", pointRadius: 0 },
        { label: "Cancelled", data: ywCancelledVals.map((v, i) => v ? { x: i, y: v } : null).filter(Boolean), borderColor: "#f97316", backgroundColor: "transparent", pointRadius: 0 },
        { label: "Rejected", data: ywRejectedVals.map((v, i) => v ? { x: i + 0.22, y: v } : null).filter(Boolean), borderColor: "#dc2626", backgroundColor: "transparent", pointRadius: 0 },
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
  const mwRejectedVals = Array.from({ length: 12 }, (_, i) => { const f = monthWise.find(d => d.month === i + 1); return f ? (f.rejectedTravellers || 0) : 0; });

  const chartTravStatusMW = {
    type: "scatter",
    data: {
      labels: mwLabels,
      datasets: [
        { label: "Active", data: mwActiveVals.map((v, i) => v ? { x: i - 0.22, y: v } : null).filter(Boolean), borderColor: "#16a34a", backgroundColor: "transparent", pointRadius: 0 },
        { label: "Cancelled", data: mwCancelledVals.map((v, i) => v ? { x: i, y: v } : null).filter(Boolean), borderColor: "#f97316", backgroundColor: "transparent", pointRadius: 0 },
        { label: "Rejected", data: mwRejectedVals.map((v, i) => v ? { x: i + 0.22, y: v } : null).filter(Boolean), borderColor: "#dc2626", backgroundColor: "transparent", pointRadius: 0 },
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
  const chartTourStatusMW = {
    type: "bar",
    data: {
      labels: MN.slice(1),
      datasets: [
        { label: "Available", data: mwAvailable, backgroundColor: "#2563eb", borderRadius: 2, stack: "s" },
        { label: "Soldout", data: mwSoldout, backgroundColor: "#f97316", borderRadius: 2, stack: "s" },
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

  const totTNR = tourList.reduce((a, t) => a + (t.totalTNR || 0), 0);
  const totPax = tourList.reduce((a, t) => a + (t.totalTravellers || 0), 0);
  const totCancelledTrav = tourList.reduce((a, t) => a + (t.cancelledTravellers || 0), 0);
  const totFem = tourList.reduce((a, t) => a + (t.totalFemale || 0), 0);
  const totMal = tourList.reduce((a, t) => a + (t.totalMale || 0), 0);
  const totChi = tourList.reduce((a, t) => a + (t.totalChild || 0), 0);
  const totGVt = tourList.reduce((a, t) => a + (t.gvPool || 0), 0);
  const totIRt = tourList.reduce((a, t) => a + (t.irctcPool || 0), 0);

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#888", fontSize: 14 }}>Loading analytics...</div>;

  const cc = { ...S.cc, minWidth: 0, overflow: "hidden" };

  return (
    <div ref={rootRef} className="an-root" style={S.pg}>
      <style>{RESPONSIVE_CSS}</style>

      <div style={{ ...S.topbar, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ ...S.h2, fontSize: 29, color: 'blue' }}>
            📊 Sales dashboard
          </h2>
          <div style={{ ...S.sub, color: 'gray' }}>
            Overview of travellers, tours and cancellations
          </div>
        </div>
      </div>
      <br />

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
                ...yearWise.map(d => d._id),
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
            {/* ── Year range: from / to ── */}
            <select className="an-sel" style={S.sel} value={range.fromYear} onChange={e => setRange(p => ({ ...p, fromYear: e.target.value }))}>
              <option value="">Year from</option>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select className="an-sel" style={S.sel} value={range.toYear} onChange={e => setRange(p => ({ ...p, toYear: e.target.value }))}>
              <option value="">Year to</option>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {/* ── Month range: from / to (applied within EACH matched year independently) ── */}
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
          <option value="Completed">Completed</option>
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
            ["Female", totFem, "#9d174d"],
            ["Male", totMal, "#1d4ed8"],
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
        <StatCard icon="✅" iconBg="#dbeafe" label="Available" value={tourList.filter(t => t.available !== false).length} />
        <StatCard icon="🔴" iconBg="#fee2e2" label="Soldout" value={tourList.filter(t => t.available === false).length} />
      </Section>

      <Section title="Tour Bookings" cols={3}>
        <StatCard icon="📋" iconBg="#e0f2fe" label="Total bookings" value={summary.totalBookings || 0} />
        <StatCard icon="⏳" iconBg="#f1f5f9" label="Unverified" value={summary.unverifiedBookings || 0} />
        <StatCard icon="🟢" iconBg="#dcfce7" label="Active (Advance only paid)" value={summary.activeBookings || 0} />
        <StatCard icon="🏆" iconBg="#fef9c3" label="Completed (Booking completed)" value={summary.completedBookings || 0} />
        <StatCard icon="❌" iconBg="#fee2e2" label="Fully cancelled" value={summary.fullyCancelledBookings || 0} />
        <StatCard icon="🚫" iconBg="#f3e8ff" label="Rejected" value={summary.rejectedBookings || 0} />
      </Section>

      <Section title="Travellers" cols={3}>
        <StatCard icon="👥" iconBg="#ede9fe" label="Total travellers" value={(summary.totalTravellers || 0).toLocaleString("en-IN")} />
        <StatCard icon="📊" iconBg="#e0e7ff" label="Average travellers (Active+CR)" value={avgTravellers} />
        <StatCard icon="⏳" iconBg="#fef3c7" label="Unverified travellers" value={summary.unverifiedTravellers || 0} />
        <StatCard icon="🟢" iconBg="#dcfce7" label="Active travellers (Once Advance paid)" value={summary.activeTravellers || 0} />
        <StatCard icon="🔶" iconBg="#fef3c7" label="Cancelled" value={summary.cancelledTravellers || 0} />
        <StatCard icon="🕐" iconBg="#fde8d8" label="Cancel request" value={summary.cancellationRequestTravellers || 0} />
        <StatCard icon="🚫" iconBg="#fee2e2" label="Rejected" value={summary.rejectedTravellers || 0} />
      </Section>

      <Section title="Gender (Completed bookings)" cols={3}>
        <StatCard icon="👩" iconBg="#fce7f3" label="Female" value={summary.totalFemale || 0} />
        <StatCard icon="👨" iconBg="#dbeafe" label="Male" value={summary.totalMale || 0} />
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
          <div style={S.leg}>{[["#16a34a", "Active"], ["#f97316", "Cancelled"], ["#dc2626", "Rejected"]].map(([c, l]) => (<span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>))}</div>
          <ChartCanvas id="c3" config={chartTravStatusYW} height={chartH + 40} />
        </div>
        <div style={cc}>
          <div style={S.ct}>Traveller status — month wise {filters.year ? `(${filters.year})` : `(${new Date().getFullYear()})`}</div>
          <div style={S.cs}>Active / Cancelled / Rejected</div>
          <div style={S.leg}>{[["#16a34a", "Active"], ["#f97316", "Cancelled"], ["#dc2626", "Rejected"]].map(([c, l]) => (<span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>))}</div>
          <ChartCanvas id="c4" config={chartTravStatusMW} height={chartH + 40} />
        </div>
      </div>

      <div className="an-chart-grid">
        <div style={cc}>
          <div style={S.ct}>Tour status — year wise</div>
          <div style={S.cs}>Available / Soldout per year</div>
          <div style={S.leg}>{[["#2563eb", "Available"], ["#f97316", "Soldout"]].map(([c, l]) => (<span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>))}</div>
          <ChartCanvas id="c5" config={chartTourStatusYW} height={chartH + 40} />
        </div>
        <div style={cc}>
          <div style={S.ct}>Tour status — month wise {filters.year ? `(${filters.year})` : `(${new Date().getFullYear()})`}</div>
          <div style={S.cs}>Available / Soldout by month</div>
          <div style={S.leg}>{[["#2563eb", "Available"], ["#f97316", "Soldout"]].map(([c, l]) => (<span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>))}</div>
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
              <col style={{ width: "19%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "8%" }} />
            </colgroup>
            <thead>
              <tr style={{ background: "#f8f9fa" }}>
                {["S.No", "Tour name", "TNR", "Travellers", "Cancelled", "Female", "Male", "Child", "GV cancel", "IRCTC cancel", "Total cancel", "Status"].map((h, i) => (
                  <th key={i} style={{ ...S.th, textAlign: i === 0 ? "center" : i === 1 ? "left" : "center", padding: i === 0 ? "7px 2px" : i === 1 ? "7px 6px 7px 4px" : S.th.padding }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableLoading ? (
                <tr><td colSpan={12} style={{ ...S.td, textAlign: "center", padding: 24, color: "#aaa" }}>Loading...</td></tr>
              ) : tourList.length === 0 ? (
                <tr><td colSpan={12} style={{ ...S.td, textAlign: "center", padding: 24, color: "#aaa" }}>No tours match</td></tr>
              ) : (
                <>
                  {tourList.map((t, i) => {
                    const status = t.isCompleted === 1 ? "Completed" : t.available === false ? "Soldout" : "Available";
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
                          <td style={{ ...S.td, padding: "7px 6px 7px 4px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                              <span style={{ fontSize: 10, color: "#7c3aed", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .15s", flexShrink: 0 }}>▸</span>
                              <div style={{ minWidth: 0, overflow: "hidden" }}>
                                <div style={{ fontWeight: 600, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.tourName || "—"}</div>
                                <small style={{ color: "#aaa", fontSize: 10 }}>{t.tourType || ""}</small>
                              </div>
                            </div>
                          </td>
                          <td style={{ ...S.td, textAlign: "center", fontWeight: 600 }}>{t.totalTNR || 0}</td>
                          <td style={{ ...S.td, textAlign: "center", fontWeight: 600, color: "#7c3aed" }}>{t.totalTravellers || 0}</td>
                          <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#dc2626", "#fef2f2", "#fca5a5")}>{t.cancelledTravellers || 0}</span></td>
                          <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#9d174d", "#fdf2f8", "#f9a8d4")}>{t.totalFemale || 0}</span></td>
                          <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#1d4ed8", "#eff6ff", "#93c5fd")}>{t.totalMale || 0}</span></td>
                          <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#854d0e", "#fef9c3", "#fde68a")}>{t.totalChild || 0}</span></td>
                          <td style={{ ...S.td, textAlign: "center", color: "#15803d", fontWeight: 600 }}>{fmtFull(t.gvPool || 0)}</td>
                          <td style={{ ...S.td, textAlign: "center", color: "#b45309", fontWeight: 600 }}>{fmtFull(t.irctcPool || 0)}</td>
                          <td style={{ ...S.td, textAlign: "center", fontWeight: 600 }}>{fmtFull(tot)}</td>
                          <td style={{ ...S.td, textAlign: "center" }}><span style={S.badge(status)}>{status}</span></td>
                        </tr>
                        {isOpen && (
                          <tr>
                            <td colSpan={12} style={{ padding: 0, borderBottom: "0.5px solid #f0f0f0" }}>
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
