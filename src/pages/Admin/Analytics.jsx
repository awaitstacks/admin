
// import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
// import Chart from "chart.js/auto";
// import ChartDataLabels from "chartjs-plugin-datalabels";
// import { TourAdminContext } from "../../context/TourAdminContext";

// const MN = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Chart.register(ChartDataLabels);

// const fmt = (n) => !n ? "₹0" : n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(0)}K` : `₹${n}`;
// const fmtFull = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;

// function useBreakpoint() {
//   const [bp, setBp] = useState(() => {
//     const w = window.innerWidth;
//     return w < 1000 ? "mobile" : w < 1200 ? "tablet" : "desktop";
//   });
//   useEffect(() => {
//     const fn = () => { const w = window.innerWidth; setBp(w < 1000 ? "mobile" : w < 1200 ? "tablet" : "desktop"); };
//     window.addEventListener("resize", fn);
//     return () => window.removeEventListener("resize", fn);
//   }, []);
//   return bp;
// }

// // ── Styles ────────────────────────────────────────────────────
// const S = {
//   pg: { padding: 10, background: "#f4f6fb", minHeight: "100vh", fontFamily: "inherit", overflowX: "hidden", maxWidth: "100%" },
//   topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 },
//   h2: { fontSize: 17, fontWeight: 600, color: "#1a1a2e", display: "flex", alignItems: "center", gap: 6, margin: 0 },
//   sub: { fontSize: 11, color: "#aaa", marginTop: 2 },

//   // Section header
//   sh: {
//     fontSize: 12, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: ".05em",
//     borderLeft: "3px solid #7c3aed", paddingLeft: 8, marginBottom: 8, marginTop: 4
//   },

//   // Stat card
//   card: { background: "#fff", borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: 8, boxShadow: "0 1px 4px rgba(0,0,0,.04)", minWidth: 0, overflow: "hidden" },
//   ic: (bg) => ({ width: 34, height: 34, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15 }),
//   lbl: { fontSize: 11, color: "#888", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
//   val: { fontSize: 18, fontWeight: 700, color: "#1a1a2e", lineHeight: 1.1 },

//   // Chart card
//   cc: { background: "#fff", borderRadius: 12, padding: 10, boxShadow: "0 1px 4px rgba(0,0,0,.04)", minWidth: 0, overflow: "hidden" },
//   ct: { fontSize: 12, fontWeight: 600, color: "#1a1a2e", marginBottom: 2 },
//   cs: { fontSize: 11, color: "#aaa", marginBottom: 4 },
//   leg: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4, fontSize: 11, color: "#666" },
//   ld: (c) => ({ width: 9, height: 9, borderRadius: 2, background: c, flexShrink: 0, display: "inline-block" }),

//   // Filter bar
//   fbar: { background: "#fff", borderRadius: 12, padding: "10px 12px", marginBottom: 10, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,.04)" },
//   sel: { fontSize: 12, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", color: "#333", cursor: "pointer", minWidth: 90, flex: "1 1 90px" },
//   sw: { position: "relative", flex: "1 1 180px", minWidth: 160 },
//   sinp: { width: "100%", padding: "8px 12px 8px 32px", border: "1px solid #e5e7eb", borderRadius: 9, fontSize: 13, background: "#fff", color: "#333", outline: "none", boxSizing: "border-box" },
//   drop: { position: "absolute", top: "calc(100% + 3px)", left: 0, right: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, zIndex: 99, maxHeight: 200, overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,.08)" },
//   di: { padding: "7px 10px", fontSize: 12, cursor: "pointer", color: "#333" },
//   chip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", background: "#f3f0ff", color: "#7c3aed", borderRadius: 20, fontSize: 11, fontWeight: 500 },
//   clr: { fontSize: 11, padding: "5px 11px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", color: "#666", cursor: "pointer", flexShrink: 0 },

//   // Table
//   tcard: { background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,.04)" },
//   th: { textAlign: "left", fontSize: 9, fontWeight: 600, color: "#aaa", padding: "7px 8px", borderBottom: "0.5px solid #eee", textTransform: "uppercase", letterSpacing: ".03em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
//   td: { padding: "7px 8px", borderBottom: "0.5px solid #f0f0f0", color: "#1a1a2e", verticalAlign: "middle", fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
//   badge: (s) => ({
//     display: "inline-block", padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600,
//     background: s === "Completed" ? "#dcfce7" : s === "Available" ? "#dbeafe" : s === "Soldout" ? "#fee2e2" : "#fef9c3",
//     color: s === "Completed" ? "#166534" : s === "Available" ? "#1e40af" : s === "Soldout" ? "#b45309" : "#854d0e",
//   }),
//   pill: (c, bg, bc) => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 28, height: 26, padding: "0 6px", borderRadius: 13, fontSize: 11, fontWeight: 600, background: bg, color: c, border: `1.5px solid ${bc}` }),
// };

// // ── ChartCanvas ───────────────────────────────────────────────
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

// // ── StatCard ──────────────────────────────────────────────────
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

// // ── Section wrapper ───────────────────────────────────────────
// function Section({ title, children, cols = 4, isMob, isTab }) {
//   // tablet: max 3 cols always to prevent overflow with sidebar
//   const tabCols = Math.min(3, cols);
//   const gridCols = isMob ? "repeat(2,1fr)" : isTab ? `repeat(${tabCols},1fr)` : `repeat(${cols},1fr)`;
//   return (
//     <div style={{ marginBottom: 10 }}>
//       <div style={S.sh}>{title}</div>
//       <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 6 }}>
//         {children}
//       </div>
//     </div>
//   );
// }

// // ── Mobile tour card ──────────────────────────────────────────
// function TourCard({ t, i }) {
//   const [open, setOpen] = useState(false);
//   const status = t.isCompleted === 1 ? "Completed" : t.available === false ? "Soldout" : "Available";
//   const tot = (t.gvPool || 0) + (t.irctcPool || 0);
//   return (
//     <div style={{ border: "0.5px solid #eee", borderRadius: 10, marginBottom: 6, overflow: "hidden" }}>
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
//         <div style={{ padding: "10px 12px", background: "#f8f9fb", borderTop: "0.5px solid #eee" }}>
//           <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 8 }}>
//             {[["TNR", t.totalTNR || 0, "#fff", "#1a1a2e"], ["Travellers", t.totalTravellers || 0, "#f3f0ff", "#7c3aed"], ["Child", t.totalChild || 0, "#fff", "#1a1a2e"]].map(([lbl, val, bg, color]) => (
//               <div key={lbl} style={{ textAlign: "center", background: bg, borderRadius: 8, padding: "6px 4px" }}>
//                 <div style={{ fontSize: 10, color }}>{lbl}</div>
//                 <div style={{ fontWeight: 600, fontSize: 14, color }}>{val}</div>
//               </div>
//             ))}
//           </div>
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
//             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fdf2f8", borderRadius: 8, padding: "5px 8px" }}>
//               <span style={{ fontSize: 10, color: "#9d174d" }}>Female</span>
//               <span style={{ fontWeight: 600, fontSize: 13, color: "#9d174d" }}>{t.totalFemale || 0}</span>
//             </div>
//             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#eff6ff", borderRadius: 8, padding: "5px 8px" }}>
//               <span style={{ fontSize: 10, color: "#1d4ed8" }}>Male</span>
//               <span style={{ fontWeight: 600, fontSize: 13, color: "#1d4ed8" }}>{t.totalMale || 0}</span>
//             </div>
//           </div>
//           {tot > 0 && (
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
//               {[["GV cancel", fmtFull(t.gvPool || 0), "#15803d"], ["IRCTC cancel", fmtFull(t.irctcPool || 0), "#b45309"], ["Total cancel", fmtFull(tot), "#1a1a2e"]].map(([lbl, val, color]) => (
//                 <div key={lbl} style={{ textAlign: "center", background: "#fff", borderRadius: 8, padding: "5px 4px" }}>
//                   <div style={{ fontSize: 9, color: "#888" }}>{lbl}</div>
//                   <div style={{ fontWeight: 600, fontSize: 11, color }}>{val}</div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// // ══════════════════════════════════════════════════════════════
// export default function Analytics() {
//   const {
//     getAnalyticsSummaryData,
//     getAnalyticsYearWise,
//     getAnalyticsMonthWise,
//     getAnalyticsCancellation,
//     getAnalyticsTourList,
//     searchAnalyticsTours,
//   } = useContext(TourAdminContext);

//   const bp = useBreakpoint();
//   const isMob = bp === "mobile";
//   const isTab = bp === "tablet";

//   // ── State ──
//   const [filters, setFilters] = useState({ year: "", month: "", type: "", status: "" });
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
//   const dropRef = useRef(null);

//   const tourIdParam = selTours.map(t => t._id.toString()).join(",");

//   // ── Static fetches ──
//   useEffect(() => {
//     Promise.all([
//       getAnalyticsYearWise(),
//       getAnalyticsCancellation({ view: "year" }),
//     ]).then(([yw, ca]) => {
//       setYearWise(yw.data || []);
//       setCancelYW(ca.data || []);
//     }).catch(console.error);
//   }, []);

//   // ── Month-wise travellers + cancellation month wise ──
//   useEffect(() => {
//     const y = filters.year || new Date().getFullYear();
//     Promise.all([
//       getAnalyticsMonthWise(y),
//       getAnalyticsCancellation({ view: "month", year: y }),
//     ]).then(([mw, cm]) => {
//       setMonthWise(mw.data || []);
//       setCancelMW(cm.data || []);
//     }).catch(console.error);
//   }, [filters.year]);

//   // ── Filtered summary + tour list ──
//   const fetchFiltered = useCallback(async () => {
//     setTableLoading(true);
//     try {
//       const [sum, list] = await Promise.all([
//         getAnalyticsSummaryData({ year: filters.year, month: filters.month, tourId: tourIdParam }),
//         getAnalyticsTourList({ year: filters.year, month: filters.month, type: filters.type, status: filters.status, tourId: tourIdParam }),
//       ]);
//       setSummary(sum.data || {});
//       setTourList(list.data || []);
//     } catch (e) { console.error(e); }
//     finally { setTableLoading(false); setLoading(false); }
//   }, [filters, tourIdParam]);

//   useEffect(() => { fetchFiltered(); }, [fetchFiltered]);

//   // ── Tour search ──
//   useEffect(() => {
//     if (searchQ.length < 1) { setSearchRes([]); setShowDrop(false); return; }
//     searchAnalyticsTours({ q: searchQ, year: filters.year, month: filters.month, status: filters.status })
//       .then(r => { setSearchRes(r.data || []); setShowDrop((r.data || []).length > 0); })
//       .catch(console.error);
//   }, [searchQ, filters.year, filters.month, filters.status]);

//   useEffect(() => {
//     const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
//     document.addEventListener("mousedown", h);
//     return () => document.removeEventListener("mousedown", h);
//   }, []);

//   const selTour = (t) => { if (!selTours.find(s => s._id.toString() === t._id.toString())) setSelTours(p => [...p, t]); setSearchQ(""); setShowDrop(false); };
//   const removeTour = (id) => setSelTours(p => p.filter(t => t._id.toString() !== id.toString()));
//   const clearAll = () => { setFilters({ year: "", month: "", type: "", status: "" }); setSelTours([]); setSearchQ(""); };

//   const chartH = isMob ? 160 : isTab ? 180 : 215;

//   // ── Chart configs ─────────────────────────────────────────────

//   // 1. Total travellers — year wise
//   const chartYW = {
//     type: "bar",
//     data: { labels: yearWise.map(d => d._id), datasets: [{ data: yearWise.map(d => d.travellers || 0), backgroundColor: "#2563eb", borderRadius: 5, barPercentage: .55 }] },
//     options: {
//       responsive: true, maintainAspectRatio: false,
//       plugins: { legend: { display: false }, datalabels: { anchor: "end", align: "top", color: "#1a1a2e", font: { size: isMob ? 9 : 11, weight: "600" }, formatter: v => v > 0 ? v.toLocaleString() : "" } },
//       scales: { x: { ticks: { font: { size: isMob ? 9 : 10 } }, grid: { display: false } }, y: { ticks: { font: { size: isMob ? 9 : 10 } }, grid: { color: "rgba(0,0,0,0.05)" } } },
//       layout: { padding: { top: 20 } }
//     }
//   };

//   // 2. Total travellers — month wise (line)
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
//         datalabels: { anchor: "top", align: "top", offset: 6, color: "#5b21b6", font: { size: isMob ? 9 : 11, weight: "700" }, formatter: v => v > 0 ? v.toLocaleString() : "" }
//       },
//       scales: {
//         x: { ticks: { font: { size: isMob ? 8 : 11 }, color: "#888" }, grid: { display: false }, border: { display: false } },
//         y: { ticks: { font: { size: isMob ? 8 : 10 }, color: "#bbb", callback: v => v >= 1000 ? `${v / 1000}K` : v }, grid: { color: "rgba(0,0,0,0.05)" }, border: { display: false }, min: 0 }
//       },
//       layout: { padding: { top: 32, right: 16 } }
//     }
//   };

//   // 3. Traveller status — year wise (stacked bar)
//   const chartTravStatusYW = {
//     type: "bar",
//     data: {
//       labels: yearWise.map(d => d._id),
//       datasets: [
//         { label: "Active", data: yearWise.map(d => d.activeTravellers || 0), backgroundColor: "#16a34a", borderRadius: 2, stack: "s" },
//         { label: "Cancelled", data: yearWise.map(d => d.cancelledTravellers || 0), backgroundColor: "#f97316", borderRadius: 2, stack: "s" },
//         { label: "Rejected", data: yearWise.map(d => d.rejectedTravellers || 0), backgroundColor: "#dc2626", borderRadius: 2, stack: "s" },
//       ]
//     },
//     options: {
//       responsive: true, maintainAspectRatio: false,
//       plugins: { legend: { display: false }, datalabels: { color: "#fff", font: { size: isMob ? 9 : 10, weight: "600" }, formatter: v => v > 0 ? v : "" } },
//       scales: { x: { stacked: true, ticks: { font: { size: isMob ? 9 : 10 } }, grid: { display: false } }, y: { stacked: true, ticks: { font: { size: isMob ? 9 : 10 } } } }
//     }
//   };

//   // 4. Traveller status — month wise (stacked bar)
//   const mwActive = Array.from({ length: 12 }, (_, i) => { const f = monthWise.find(d => d.month === i + 1); return f ? (f.activeTravellers || 0) : 0; });
//   const mwCancelled = Array.from({ length: 12 }, (_, i) => { const f = monthWise.find(d => d.month === i + 1); return f ? (f.cancelledTravellers || 0) : 0; });
//   const mwRejected = Array.from({ length: 12 }, (_, i) => { const f = monthWise.find(d => d.month === i + 1); return f ? (f.rejectedTravellers || 0) : 0; });
//   const chartTravStatusMW = {
//     type: "bar",
//     data: {
//       labels: MN.slice(1),
//       datasets: [
//         { label: "Active", data: mwActive, backgroundColor: "#16a34a", borderRadius: 2, stack: "s" },
//         { label: "Cancelled", data: mwCancelled, backgroundColor: "#f97316", borderRadius: 2, stack: "s" },
//         { label: "Rejected", data: mwRejected, backgroundColor: "#dc2626", borderRadius: 2, stack: "s" },
//       ]
//     },
//     options: {
//       responsive: true, maintainAspectRatio: false,
//       plugins: { legend: { display: false }, datalabels: { color: "#fff", font: { size: isMob ? 9 : 10, weight: "600" }, formatter: v => v > 0 ? v : "" } },
//       scales: { x: { stacked: true, ticks: { font: { size: isMob ? 9 : 10 } }, grid: { display: false } }, y: { stacked: true, ticks: { font: { size: isMob ? 9 : 10 } } } }
//     }
//   };

//   // 5. Tour status year wise (available / soldout)
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
//       plugins: { legend: { display: false }, datalabels: { color: "#fff", font: { size: isMob ? 9 : 10, weight: "600" }, formatter: v => v > 0 ? v : "" } },
//       scales: { x: { stacked: true, ticks: { font: { size: isMob ? 9 : 10 } }, grid: { display: false } }, y: { stacked: true, ticks: { font: { size: isMob ? 9 : 10 } } } }
//     }
//   };

//   // 6. Tour status month wise (available / soldout)
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
//       plugins: { legend: { display: false }, datalabels: { color: "#fff", font: { size: isMob ? 9 : 10, weight: "600" }, formatter: v => v > 0 ? v : "" } },
//       scales: { x: { stacked: true, ticks: { font: { size: isMob ? 9 : 10 } }, grid: { display: false } }, y: { stacked: true, ticks: { font: { size: isMob ? 9 : 10 } } } }
//     }
//   };

//   // 7. Cancellation — year wise grouped bar
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
//           font: { size: isMob ? 8 : 9, weight: "600" },
//           formatter: v => v > 0 ? `₹${v.toLocaleString("en-IN")}` : ""
//         }
//       },
//       scales: {
//         x: { ticks: { font: { size: isMob ? 9 : 10 }, color: "#888" }, grid: { display: false }, border: { display: false } },
//         y: {
//           ticks: { font: { size: isMob ? 8 : 9 }, color: "#bbb", callback: v => v >= 1000 ? `₹${v / 1000}K` : v },
//           grid: { color: "rgba(0,0,0,0.04)" }, border: { display: false }
//         }
//       },
//       layout: { padding: { top: 22 } }
//     }
//   };

//   // 8. Cancellation — month wise dual line (fill all 12 months)
//   const cancelMWGV = Array.from({ length: 12 }, (_, i) => { const f = cancelMW.find(d => d._id === i + 1); return f ? (f.gvPool || 0) : 0; });
//   const cancelMWIRCTC = Array.from({ length: 12 }, (_, i) => { const f = cancelMW.find(d => d._id === i + 1); return f ? (f.irctcPool || 0) : 0; });
//   const chartCancelMW = {
//     type: "line",
//     data: {
//       labels: MN.slice(1),
//       datasets: [
//         {
//           label: "GV", data: cancelMWGV,
//           borderColor: "#ef4444", backgroundColor: "transparent",
//           tension: 0, fill: false,
//           pointRadius: 5, pointBackgroundColor: "#ef4444",
//           pointBorderColor: "#ef4444", pointBorderWidth: 0,
//           borderWidth: 2.5
//         },
//         {
//           label: "IRCTC", data: cancelMWIRCTC,
//           borderColor: "#f59e0b", backgroundColor: "transparent",
//           tension: 0, fill: false,
//           pointRadius: 5, pointBackgroundColor: "#f59e0b",
//           pointBorderColor: "#f59e0b", pointBorderWidth: 0,
//           borderWidth: 2.5
//         },
//       ]
//     },
//     options: {
//       responsive: true, maintainAspectRatio: false,
//       plugins: {
//         legend: { display: false },
//         datalabels: {
//           anchor: "top", align: "top", offset: 5,
//           font: { size: isMob ? 8 : 9, weight: "600" },
//           color: ctx => ctx.datasetIndex === 0 ? "#ef4444" : "#d97706",
//           formatter: v => v > 0 ? `₹${v.toLocaleString("en-IN")}` : ""
//         }
//       },
//       scales: {
//         x: { ticks: { font: { size: isMob ? 8 : 11 }, color: "#888" }, grid: { display: false }, border: { display: false } },
//         y: {
//           ticks: { font: { size: isMob ? 8 : 10 }, color: "#bbb", callback: v => v >= 1000 ? `₹${v / 1000}K` : v },
//           grid: { color: "rgba(0,0,0,0.05)" }, border: { display: false }, min: 0
//         }
//       },
//       layout: { padding: { top: 44, right: 16 } }
//     }
//   };

//   // Tour list totals
//   const totTNR = tourList.reduce((a, t) => a + (t.totalTNR || 0), 0);
//   const totPax = tourList.reduce((a, t) => a + (t.totalTravellers || 0), 0);
//   const totFem = tourList.reduce((a, t) => a + (t.totalFemale || 0), 0);
//   const totMal = tourList.reduce((a, t) => a + (t.totalMale || 0), 0);
//   const totChi = tourList.reduce((a, t) => a + (t.totalChild || 0), 0);
//   const totGVt = tourList.reduce((a, t) => a + (t.gvPool || 0), 0);
//   const totIRt = tourList.reduce((a, t) => a + (t.irctcPool || 0), 0);

//   if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#888", fontSize: 14 }}>Loading analytics...</div>;

//   const g2 = { display: "grid", gridTemplateColumns: isMob ? "1fr" : "repeat(2,1fr)", gap: 8, marginBottom: 8, minWidth: 0 };
//   // chart card with overflow protection
//   const cc = { ...S.cc, minWidth: 0, overflow: "hidden" };

//   return (
//     <div style={S.pg}>
//       {/* ── Top bar ── */}
//       <div style={{ ...S.topbar, justifyContent: 'center', alignItems: 'center' }}>
//         <div style={{ textAlign: 'center' }}>
//           <h2 style={{ ...S.h2, fontSize: isMob ? 29 : 29, color: 'blue' }}>
//             📊 Sales dashboard
//           </h2>
//           <div style={{ ...S.sub, color: 'gray' }}>
//             Overview of travellers, tours and cancellations
//           </div>
//         </div>
//       </div>
//       <br />

//       {/* ══ TOURS SECTION ══ */}
//       <Section title="Tours" cols={3} isMob={isMob} isTab={isTab}>
//         <StatCard icon="🚌" iconBg="#ede9fe" label="Total tours" value={tourList.length} />
//         <StatCard icon="✅" iconBg="#dbeafe" label="Available" value={tourList.filter(t => t.available !== false).length} />
//         <StatCard icon="🔴" iconBg="#fee2e2" label="Soldout" value={tourList.filter(t => t.available === false).length} />
//       </Section>

//       {/* ══ TOUR BOOKINGS SECTION ══ */}
//       <Section title="Tour Bookings" cols={6} isMob={isMob} isTab={isTab}>
//         <StatCard icon="📋" iconBg="#e0f2fe" label="Total bookings" value={summary.totalBookings || 0} />
//         <StatCard icon="⏳" iconBg="#f1f5f9" label="Unverified" value={summary.unverifiedBookings || 0} />
//         <StatCard icon="🟢" iconBg="#dcfce7" label="Active" value={summary.activeBookings || 0} />
//         <StatCard icon="🏆" iconBg="#fef9c3" label="Completed" value={summary.completedBookings || 0} />
//         <StatCard icon="❌" iconBg="#fee2e2" label="Fully cancelled" value={summary.fullyCancelledBookings || 0} />
//         <StatCard icon="🚫" iconBg="#f3e8ff" label="Rejected" value={summary.rejectedBookings || 0} />
//       </Section>

//       {/* ══ TRAVELLERS SECTION ══ */}
//       <Section title="Travellers" cols={5} isMob={isMob} isTab={isTab}>
//         <StatCard icon="👥" iconBg="#ede9fe" label="Total travellers" value={(summary.totalTravellers || 0).toLocaleString("en-IN")} />
//         <StatCard icon="🟢" iconBg="#dcfce7" label="Active travellers" value={summary.activeTravellers || 0} />
//         <StatCard icon="🔶" iconBg="#fef3c7" label="Cancelled" value={summary.cancelledTravellers || 0} />
//         <StatCard icon="🕐" iconBg="#fde8d8" label="Cancel request" value={summary.cancellationRequestTravellers || 0} />
//         <StatCard icon="🚫" iconBg="#fee2e2" label="Rejected" value={summary.rejectedTravellers || 0} />
//       </Section>

//       {/* ══ GENDER SECTION ══ */}
//       <Section title="Gender" cols={3} isMob={isMob} isTab={isTab}>
//         <StatCard icon="👩" iconBg="#fce7f3" label="Female" value={summary.totalFemale || 0} />
//         <StatCard icon="👨" iconBg="#dbeafe" label="Male" value={summary.totalMale || 0} />
//         <StatCard icon="🧒" iconBg="#fef9c3" label="Child" value={summary.totalChild || 0} />
//       </Section>

//       {/* ══ CANCELLATION AMOUNT SECTION ══ */}
//       <Section title="Cancellation Amount" cols={3} isMob={isMob} isTab={isTab}>
//         <StatCard icon="₹" iconBg="#fef3c7" label="GV cancellation" value={fmtFull(summary.totalGVPool || 0)} />
//         <StatCard icon="🎫" iconBg="#ede9fe" label="IRCTC cancellation" value={fmtFull(summary.totalIRCTCPool || 0)} />
//         <StatCard icon="💰" iconBg="#fee2e2" label="Total cancellation" value={fmtFull((summary.totalGVPool || 0) + (summary.totalIRCTCPool || 0))} />
//       </Section>

//       {/* ══ FILTER BAR ══ */}
//       <div style={{ ...S.fbar, marginBottom: 12 }}>
//         <select style={S.sel} value={filters.year} onChange={e => setFilters(p => ({ ...p, year: e.target.value }))}>
//           <option value="">All years</option>
//           {[...new Set([
//             ...yearWise.map(d => d._id),
//             new Date().getFullYear()
//           ])].sort((a, b) => b - a).map(y => <option key={y} value={y}>{y}</option>)}
//         </select>
//         <select style={S.sel} value={filters.month} onChange={e => setFilters(p => ({ ...p, month: e.target.value }))}>
//           <option value="">All months</option>
//           {MN.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
//         </select>
//         <select style={S.sel} value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}>
//           <option value="">All types</option>
//           <option value="Spiritual">Spiritual</option>
//           <option value="Historical">Historical</option>
//           <option value="International">International</option>
//           <option value="Jolly">Jolly</option>
//         </select>
//         <select style={S.sel} value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
//           <option value="">All status</option>
//           <option value="Available">Available</option>
//           <option value="Soldout">Soldout</option>
//           <option value="Completed">Completed</option>
//         </select>
//         <div style={S.sw} ref={dropRef}>
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
//         <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center", flex: "1 1 auto" }}>
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
//         <button style={S.clr} onClick={clearAll}>✕ Clear</button>
//       </div>

//       {/* ══ GRAPH 1+2: Total travellers year + month wise ══ */}
//       <div style={g2}>
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

//       {/* ══ GRAPH 3+4: Traveller status year + month wise ══ */}
//       <div style={g2}>
//         <div style={cc}>
//           <div style={S.ct}>Traveller status — year wise</div>
//           <div style={S.cs}>Active / Cancelled / Rejected</div>
//           <div style={S.leg}>
//             {[["#16a34a", "Active"], ["#f97316", "Cancelled"], ["#dc2626", "Rejected"]].map(([c, l]) => (
//               <span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>
//             ))}
//           </div>
//           <ChartCanvas id="c3" config={chartTravStatusYW} height={chartH} />
//         </div>
//         <div style={cc}>
//           <div style={S.ct}>Traveller status — month wise {filters.year ? `(${filters.year})` : `(${new Date().getFullYear()})`}</div>
//           <div style={S.cs}>Active / Cancelled / Rejected</div>
//           <div style={S.leg}>
//             {[["#16a34a", "Active"], ["#f97316", "Cancelled"], ["#dc2626", "Rejected"]].map(([c, l]) => (
//               <span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>
//             ))}
//           </div>
//           <ChartCanvas id="c4" config={chartTravStatusMW} height={chartH} />
//         </div>
//       </div>

//       {/* ══ GRAPH 5+6: Tour status year + month wise ══ */}
//       <div style={g2}>
//         <div style={cc}>
//           <div style={S.ct}>Tour status — year wise</div>
//           <div style={S.cs}>Available / Soldout per year</div>
//           <div style={S.leg}>
//             {[["#2563eb", "Available"], ["#f97316", "Soldout"]].map(([c, l]) => (
//               <span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>
//             ))}
//           </div>
//           <ChartCanvas id="c5" config={chartTourStatusYW} height={chartH} />
//         </div>
//         <div style={cc}>
//           <div style={S.ct}>Tour status — month wise {filters.year ? `(${filters.year})` : `(${new Date().getFullYear()})`}</div>
//           <div style={S.cs}>Available / Soldout by month</div>
//           <div style={S.leg}>
//             {[["#2563eb", "Available"], ["#f97316", "Soldout"]].map(([c, l]) => (
//               <span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>
//             ))}
//           </div>
//           <ChartCanvas id="c6" config={chartTourStatusMW} height={chartH} />
//         </div>
//       </div>

//       {/* ══ GRAPH 7+8: Cancellation year wise + month wise ══ */}
//       <div style={g2}>
//         <div style={cc}>
//           <div style={S.ct}>Cancellations — year wise</div>
//           <div style={S.cs}>GV vs IRCTC cancel amounts per year</div>
//           <div style={S.leg}>
//             {[["#ef4444", "GV Cancelled"], ["#f59e0b", "IRCTC Cancelled"]].map(([c, l]) => (
//               <span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>
//             ))}
//           </div>
//           <ChartCanvas id="c7" config={chartCancelYW} height={chartH} />
//         </div>
//         <div style={cc}>
//           <div style={S.ct}>Cancellations — month wise {filters.year ? `(${filters.year})` : `(${new Date().getFullYear()})`}</div>
//           <div style={S.cs}>GV vs IRCTC cancel amounts by month</div>
//           <div style={S.leg}>
//             {[["#ef4444", "GV"], ["#f59e0b", "IRCTC"]].map(([c, l]) => (
//               <span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>
//             ))}
//           </div>
//           <ChartCanvas id="c8" config={chartCancelMW} height={chartH + 60} />
//         </div>
//       </div>

//       {/* ══ TOUR LIST TABLE ══ */}
//       <div style={S.tcard}>
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
//           <div>
//             <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>Tour profile performance</div>
//             <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>
//               {filters.year || filters.month || filters.type || filters.status || selTours.length
//                 ? `Filtered: ${[filters.year, filters.month ? MN[+filters.month] : "", filters.type, filters.status].filter(Boolean).join(" · ")}`
//                 : "Showing all tours"}
//             </div>
//           </div>
//           <span style={{ fontSize: 11, color: "#aaa" }}>{tableLoading ? "Loading..." : `${tourList.length} tours`}</span>
//         </div>

//         {isMob ? (
//           tableLoading
//             ? <div style={{ textAlign: "center", padding: 24, color: "#aaa" }}>Loading...</div>
//             : tourList.length === 0
//               ? <div style={{ textAlign: "center", padding: 24, color: "#aaa" }}>No tours match</div>
//               : <>
//                 {tourList.map((t, i) => <TourCard key={t._id} t={t} i={i} />)}
//                 {/* ── Sticky total row — mobile ── */}
//                 <div style={{
//                   position: "sticky", bottom: 0, background: "#f8f9fb",
//                   borderTop: "1.5px solid #e5e7eb", borderRadius: "0 0 10px 10px",
//                   padding: "10px 12px", marginTop: 4,
//                   display: "grid", gridTemplateColumns: "1fr 1fr",
//                   gap: 6, zIndex: 10,
//                   boxShadow: "0 -2px 8px rgba(0,0,0,.06)"
//                 }}>
//                   <div style={{ fontSize: 11, fontWeight: 600, color: "#555", gridColumn: "1/-1", marginBottom: 4 }}>
//                     Total — {tourList.length} tours
//                   </div>
//                   {[
//                     ["TNR", totTNR, "#1a1a2e"],
//                     ["Travellers", totPax, "#7c3aed"],
//                     ["Female", totFem, "#9d174d"],
//                     ["Male", totMal, "#1d4ed8"],
//                     ["Child", totChi, "#854d0e"],
//                     ["GV cancel", fmtFull(totGVt), "#15803d"],
//                     ["IRCTC cancel", fmtFull(totIRt), "#b45309"],
//                     ["Total cancel", fmtFull(totGVt + totIRt), "#1a1a2e"],
//                   ].map(([lbl, val, color]) => (
//                     <div key={lbl} style={{ background: "#fff", borderRadius: 8, padding: "6px 8px" }}>
//                       <div style={{ fontSize: 9, color: "#aaa", marginBottom: 2 }}>{lbl}</div>
//                       <div style={{ fontSize: 13, fontWeight: 700, color }}>{val}</div>
//                     </div>
//                   ))}
//                 </div>
//               </>
//         ) : (
//           <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
//             <table style={{ width: "100%", minWidth: isTab ? 500 : 600, borderCollapse: "collapse", tableLayout: "fixed" }}>
//               <colgroup>
//                 <col style={{ width: "24px" }} />
//                 <col style={{ width: "20%" }} />
//                 <col style={{ width: "6%" }} />
//                 <col style={{ width: "8%" }} />
//                 <col style={{ width: "6%" }} />
//                 <col style={{ width: "6%" }} />
//                 <col style={{ width: "6%" }} />
//                 <col style={{ width: "11%" }} />
//                 <col style={{ width: "12%" }} />
//                 <col style={{ width: "11%" }} />
//                 <col style={{ width: "9%" }} />
//               </colgroup>
//               <thead>
//                 <tr style={{ background: "#f8f9fa" }}>
//                   {["S.No", "Tour name", "TNR", "Travellers", "Female", "Male", "Child", "GV cancel", "IRCTC cancel", "Total cancel", "Status"].map((h, i) => (
//                     <th key={i} style={{
//                       ...S.th,
//                       textAlign: i === 0 || i === 1 ? "left" : "center"
//                     }}>{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {tableLoading ? (
//                   <tr><td colSpan={11} style={{ ...S.td, textAlign: "center", padding: 24, color: "#aaa" }}>Loading...</td></tr>
//                 ) : tourList.length === 0 ? (
//                   <tr><td colSpan={11} style={{ ...S.td, textAlign: "center", padding: 24, color: "#aaa" }}>No tours match</td></tr>
//                 ) : (
//                   <>
//                     {tourList.map((t, i) => {
//                       const status = t.isCompleted === 1 ? "Completed" : t.available === false ? "Soldout" : "Available";
//                       const tot = (t.gvPool || 0) + (t.irctcPool || 0);
//                       return (
//                         <tr key={t._id}
//                           onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
//                           onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
//                           <td style={{ ...S.td, color: "#ccc", fontSize: 10 }}>{i + 1}</td>
//                           <td style={S.td}>
//                             <div style={{ fontWeight: 600, fontSize: isTab ? 11 : 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.tourName || "—"}</div>
//                             <small style={{ color: "#aaa", fontSize: 10 }}>{t.tourType || ""}</small>
//                           </td>
//                           <td style={{ ...S.td, textAlign: "center", fontWeight: 600 }}>{t.totalTNR || 0}</td>
//                           <td style={{ ...S.td, textAlign: "center", fontWeight: 600, color: "#7c3aed" }}>{t.totalTravellers || 0}</td>
//                           <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#9d174d", "#fdf2f8", "#f9a8d4")}>{t.totalFemale || 0}</span></td>
//                           <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#1d4ed8", "#eff6ff", "#93c5fd")}>{t.totalMale || 0}</span></td>
//                           <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#854d0e", "#fef9c3", "#fde68a")}>{t.totalChild || 0}</span></td>
//                           <td style={{ ...S.td, textAlign: "center", color: "#15803d", fontWeight: 600 }}>{fmtFull(t.gvPool || 0)}</td>
//                           <td style={{ ...S.td, textAlign: "center", color: "#b45309", fontWeight: 600 }}>{fmtFull(t.irctcPool || 0)}</td>
//                           <td style={{ ...S.td, textAlign: "center", fontWeight: 600 }}>{fmtFull(tot)}</td>
//                           <td style={{ ...S.td, textAlign: "center" }}><span style={S.badge(status)}>{status}</span></td>
//                         </tr>
//                       );
//                     })}
//                     <tr style={{ background: "#f8f9fb", fontWeight: 600 }}>
//                       <td style={S.td} /><td style={{ ...S.td, fontSize: 11 }}>Total ({tourList.length})</td>
//                       <td style={{ ...S.td, textAlign: "center" }}>{totTNR}</td>
//                       <td style={{ ...S.td, textAlign: "center", color: "#7c3aed" }}>{totPax}</td>
//                       <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#9d174d", "#fdf2f8", "#f9a8d4")}>{totFem}</span></td>
//                       <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#1d4ed8", "#eff6ff", "#93c5fd")}>{totMal}</span></td>
//                       <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#854d0e", "#fef9c3", "#fde68a")}>{totChi}</span></td>
//                       <td style={{ ...S.td, textAlign: "center", color: "#15803d" }}>{fmtFull(totGVt)}</td>
//                       <td style={{ ...S.td, textAlign: "center", color: "#b45309" }}>{fmtFull(totIRt)}</td>
//                       <td style={{ ...S.td, textAlign: "center" }}>{fmtFull(totGVt + totIRt)}</td>
//                       <td style={S.td} />
//                     </tr>
//                   </>
//                 )}
//               </tbody>
//             </table>
//           </div>
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

const fmt = (n) => !n ? "₹0" : n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(0)}K` : `₹${n}`;
const fmtFull = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;

function useBreakpoint() {
  const [bp, setBp] = useState(() => {
    const w = window.innerWidth;
    return w < 1000 ? "mobile" : w < 1200 ? "tablet" : "desktop";
  });
  useEffect(() => {
    const fn = () => { const w = window.innerWidth; setBp(w < 1000 ? "mobile" : w < 1200 ? "tablet" : "desktop"); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return bp;
}

const S = {
  pg: { padding: 10, background: "#f4f6fb", minHeight: "100vh", fontFamily: "inherit", overflowX: "hidden", maxWidth: "100%" },
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
  fbar: { background: "#fff", borderRadius: 12, padding: "10px 12px", marginBottom: 10, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,.04)" },
  sel: { fontSize: 12, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", color: "#333", cursor: "pointer", minWidth: 90, flex: "1 1 90px" },
  sw: { position: "relative", flex: "1 1 180px", minWidth: 160 },
  sinp: { width: "100%", padding: "8px 12px 8px 32px", border: "1px solid #e5e7eb", borderRadius: 9, fontSize: 13, background: "#fff", color: "#333", outline: "none", boxSizing: "border-box" },
  drop: { position: "absolute", top: "calc(100% + 3px)", left: 0, right: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, zIndex: 99, maxHeight: 200, overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,.08)" },
  di: { padding: "7px 10px", fontSize: 12, cursor: "pointer", color: "#333" },
  chip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", background: "#f3f0ff", color: "#7c3aed", borderRadius: 20, fontSize: 11, fontWeight: 500 },
  clr: { fontSize: 11, padding: "5px 11px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", color: "#666", cursor: "pointer", flexShrink: 0 },
  tcard: { background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,.04)" },
  th: { textAlign: "left", fontSize: 9, fontWeight: 600, color: "#aaa", padding: "7px 8px", borderBottom: "0.5px solid #eee", textTransform: "uppercase", letterSpacing: ".03em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  td: { padding: "7px 8px", borderBottom: "0.5px solid #f0f0f0", color: "#1a1a2e", verticalAlign: "middle", fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  badge: (s) => ({
    display: "inline-block", padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600,
    background: s === "Completed" ? "#dcfce7" : s === "Available" ? "#dbeafe" : s === "Soldout" ? "#fee2e2" : "#fef9c3",
    color: s === "Completed" ? "#166534" : s === "Available" ? "#1e40af" : s === "Soldout" ? "#b45309" : "#854d0e",
  }),
  pill: (c, bg, bc) => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 28, height: 26, padding: "0 6px", borderRadius: 13, fontSize: 11, fontWeight: 600, background: bg, color: c, border: `1.5px solid ${bc}` }),
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

function Section({ title, children, cols = 4, isMob, isTab }) {
  const tabCols = Math.min(3, cols);
  const gridCols = isMob ? "repeat(2,1fr)" : isTab ? `repeat(${tabCols},1fr)` : `repeat(${cols},1fr)`;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={S.sh}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 6 }}>
        {children}
      </div>
    </div>
  );
}

function TourCard({ t, i }) {
  const [open, setOpen] = useState(false);
  const status = t.isCompleted === 1 ? "Completed" : t.available === false ? "Soldout" : "Available";
  const tot = (t.gvPool || 0) + (t.irctcPool || 0);
  return (
    <div style={{ border: "0.5px solid #eee", borderRadius: 10, marginBottom: 6, overflow: "hidden" }}>
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
        <div style={{ padding: "10px 12px", background: "#f8f9fb", borderTop: "0.5px solid #eee" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 8 }}>
            {[["TNR", t.totalTNR || 0, "#fff", "#1a1a2e"], ["Travellers", t.totalTravellers || 0, "#f3f0ff", "#7c3aed"], ["Child", t.totalChild || 0, "#fff", "#1a1a2e"]].map(([lbl, val, bg, color]) => (
              <div key={lbl} style={{ textAlign: "center", background: bg, borderRadius: 8, padding: "6px 4px" }}>
                <div style={{ fontSize: 10, color }}>{lbl}</div>
                <div style={{ fontWeight: 600, fontSize: 14, color }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fdf2f8", borderRadius: 8, padding: "5px 8px" }}>
              <span style={{ fontSize: 10, color: "#9d174d" }}>Female</span>
              <span style={{ fontWeight: 600, fontSize: 13, color: "#9d174d" }}>{t.totalFemale || 0}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#eff6ff", borderRadius: 8, padding: "5px 8px" }}>
              <span style={{ fontSize: 10, color: "#1d4ed8" }}>Male</span>
              <span style={{ fontWeight: 600, fontSize: 13, color: "#1d4ed8" }}>{t.totalMale || 0}</span>
            </div>
          </div>
          {tot > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
              {[["GV cancel", fmtFull(t.gvPool || 0), "#15803d"], ["IRCTC cancel", fmtFull(t.irctcPool || 0), "#b45309"], ["Total cancel", fmtFull(tot), "#1a1a2e"]].map(([lbl, val, color]) => (
                <div key={lbl} style={{ textAlign: "center", background: "#fff", borderRadius: 8, padding: "5px 4px" }}>
                  <div style={{ fontSize: 9, color: "#888" }}>{lbl}</div>
                  <div style={{ fontWeight: 600, fontSize: 11, color }}>{val}</div>
                </div>
              ))}
            </div>
          )}
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

  const bp = useBreakpoint();
  const isMob = bp === "mobile";
  const isTab = bp === "tablet";

  const [filters, setFilters] = useState({ year: "", month: "", type: "", status: "" });
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
  const dropRef = useRef(null);

  const tourIdParam = selTours.map(t => t._id.toString()).join(",");

  useEffect(() => {
    Promise.all([
      getAnalyticsYearWise(),
      getAnalyticsCancellation({ view: "year" }),
    ]).then(([yw, ca]) => {
      setYearWise(yw.data || []);
      setCancelYW(ca.data || []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const y = filters.year || new Date().getFullYear();
    Promise.all([
      getAnalyticsMonthWise(y),
      getAnalyticsCancellation({ view: "month", year: y }),
    ]).then(([mw, cm]) => {
      setMonthWise(mw.data || []);
      setCancelMW(cm.data || []);
    }).catch(console.error);
  }, [filters.year]);

  const fetchFiltered = useCallback(async () => {
    setTableLoading(true);
    try {
      const [sum, list] = await Promise.all([
        getAnalyticsSummaryData({ year: filters.year, month: filters.month, tourId: tourIdParam }),
        getAnalyticsTourList({ year: filters.year, month: filters.month, type: filters.type, status: filters.status, tourId: tourIdParam }),
      ]);
      setSummary(sum.data || {});
      setTourList(list.data || []);
    } catch (e) { console.error(e); }
    finally { setTableLoading(false); setLoading(false); }
  }, [filters, tourIdParam]);

  useEffect(() => { fetchFiltered(); }, [fetchFiltered]);

  useEffect(() => {
    if (searchQ.length < 1) { setSearchRes([]); setShowDrop(false); return; }
    searchAnalyticsTours({ q: searchQ, year: filters.year, month: filters.month, status: filters.status })
      .then(r => { setSearchRes(r.data || []); setShowDrop((r.data || []).length > 0); })
      .catch(console.error);
  }, [searchQ, filters.year, filters.month, filters.status]);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selTour = (t) => { if (!selTours.find(s => s._id.toString() === t._id.toString())) setSelTours(p => [...p, t]); setSearchQ(""); setShowDrop(false); };
  const removeTour = (id) => setSelTours(p => p.filter(t => t._id.toString() !== id.toString()));
  const clearAll = () => { setFilters({ year: "", month: "", type: "", status: "" }); setSelTours([]); setSearchQ(""); };

  const chartH = isMob ? 160 : isTab ? 180 : 215;

  const chartYW = {
    type: "bar",
    data: { labels: yearWise.map(d => d._id), datasets: [{ data: yearWise.map(d => d.travellers || 0), backgroundColor: "#2563eb", borderRadius: 5, barPercentage: .55 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, datalabels: { anchor: "end", align: "top", color: "#1a1a2e", font: { size: isMob ? 9 : 11, weight: "600" }, formatter: v => v > 0 ? v.toLocaleString() : "" } },
      scales: { x: { ticks: { font: { size: isMob ? 9 : 10 } }, grid: { display: false } }, y: { ticks: { font: { size: isMob ? 9 : 10 } }, grid: { color: "rgba(0,0,0,0.05)" } } },
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
        datalabels: { anchor: "top", align: "top", offset: 6, color: "#5b21b6", font: { size: isMob ? 9 : 11, weight: "700" }, formatter: v => v > 0 ? v.toLocaleString() : "" }
      },
      scales: {
        x: { ticks: { font: { size: isMob ? 8 : 11 }, color: "#888" }, grid: { display: false }, border: { display: false } },
        y: { ticks: { font: { size: isMob ? 8 : 10 }, color: "#bbb", callback: v => v >= 1000 ? `${v / 1000}K` : v }, grid: { color: "rgba(0,0,0,0.05)" }, border: { display: false }, min: 0 }
      },
      layout: { padding: { top: 32, right: 16 } }
    }
  };

  const chartTravStatusYW = {
    type: "bar",
    data: {
      labels: yearWise.map(d => d._id),
      datasets: [
        { label: "Active", data: yearWise.map(d => d.activeTravellers || 0), backgroundColor: "#16a34a", borderRadius: 2, stack: "s" },
        { label: "Cancelled", data: yearWise.map(d => d.cancelledTravellers || 0), backgroundColor: "#f97316", borderRadius: 2, stack: "s" },
        { label: "Rejected", data: yearWise.map(d => d.rejectedTravellers || 0), backgroundColor: "#dc2626", borderRadius: 2, stack: "s" },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, datalabels: { color: "#fff", font: { size: isMob ? 9 : 10, weight: "600" }, formatter: v => v > 0 ? v : "" } },
      scales: { x: { stacked: true, ticks: { font: { size: isMob ? 9 : 10 } }, grid: { display: false } }, y: { stacked: true, ticks: { font: { size: isMob ? 9 : 10 } } } }
    }
  };

  const mwActive = Array.from({ length: 12 }, (_, i) => { const f = monthWise.find(d => d.month === i + 1); return f ? (f.activeTravellers || 0) : 0; });
  const mwCancelled = Array.from({ length: 12 }, (_, i) => { const f = monthWise.find(d => d.month === i + 1); return f ? (f.cancelledTravellers || 0) : 0; });
  const mwRejected = Array.from({ length: 12 }, (_, i) => { const f = monthWise.find(d => d.month === i + 1); return f ? (f.rejectedTravellers || 0) : 0; });
  const chartTravStatusMW = {
    type: "bar",
    data: {
      labels: MN.slice(1),
      datasets: [
        { label: "Active", data: mwActive, backgroundColor: "#16a34a", borderRadius: 2, stack: "s" },
        { label: "Cancelled", data: mwCancelled, backgroundColor: "#f97316", borderRadius: 2, stack: "s" },
        { label: "Rejected", data: mwRejected, backgroundColor: "#dc2626", borderRadius: 2, stack: "s" },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, datalabels: { color: "#fff", font: { size: isMob ? 9 : 10, weight: "600" }, formatter: v => v > 0 ? v : "" } },
      scales: { x: { stacked: true, ticks: { font: { size: isMob ? 9 : 10 } }, grid: { display: false } }, y: { stacked: true, ticks: { font: { size: isMob ? 9 : 10 } } } }
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
      plugins: { legend: { display: false }, datalabels: { color: "#fff", font: { size: isMob ? 9 : 10, weight: "600" }, formatter: v => v > 0 ? v : "" } },
      scales: { x: { stacked: true, ticks: { font: { size: isMob ? 9 : 10 } }, grid: { display: false } }, y: { stacked: true, ticks: { font: { size: isMob ? 9 : 10 } } } }
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
      plugins: { legend: { display: false }, datalabels: { color: "#fff", font: { size: isMob ? 9 : 10, weight: "600" }, formatter: v => v > 0 ? v : "" } },
      scales: { x: { stacked: true, ticks: { font: { size: isMob ? 9 : 10 } }, grid: { display: false } }, y: { stacked: true, ticks: { font: { size: isMob ? 9 : 10 } } } }
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
        datalabels: { anchor: "end", align: "top", color: "#1e1e2e", font: { size: isMob ? 8 : 9, weight: "600" }, formatter: v => v > 0 ? `₹${v.toLocaleString("en-IN")}` : "" }
      },
      scales: {
        x: { ticks: { font: { size: isMob ? 9 : 10 }, color: "#888" }, grid: { display: false }, border: { display: false } },
        y: { ticks: { font: { size: isMob ? 8 : 9 }, color: "#bbb", callback: v => v >= 1000 ? `₹${v / 1000}K` : v }, grid: { color: "rgba(0,0,0,0.04)" }, border: { display: false } }
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
        datalabels: { anchor: "top", align: "top", offset: 5, font: { size: isMob ? 8 : 9, weight: "600" }, color: ctx => ctx.datasetIndex === 0 ? "#ef4444" : "#d97706", formatter: v => v > 0 ? `₹${v.toLocaleString("en-IN")}` : "" }
      },
      scales: {
        x: { ticks: { font: { size: isMob ? 8 : 11 }, color: "#888" }, grid: { display: false }, border: { display: false } },
        y: { ticks: { font: { size: isMob ? 8 : 10 }, color: "#bbb", callback: v => v >= 1000 ? `₹${v / 1000}K` : v }, grid: { color: "rgba(0,0,0,0.05)" }, border: { display: false }, min: 0 }
      },
      layout: { padding: { top: 44, right: 16 } }
    }
  };

  const totTNR = tourList.reduce((a, t) => a + (t.totalTNR || 0), 0);
  const totPax = tourList.reduce((a, t) => a + (t.totalTravellers || 0), 0);
  const totFem = tourList.reduce((a, t) => a + (t.totalFemale || 0), 0);
  const totMal = tourList.reduce((a, t) => a + (t.totalMale || 0), 0);
  const totChi = tourList.reduce((a, t) => a + (t.totalChild || 0), 0);
  const totGVt = tourList.reduce((a, t) => a + (t.gvPool || 0), 0);
  const totIRt = tourList.reduce((a, t) => a + (t.irctcPool || 0), 0);

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#888", fontSize: 14 }}>Loading analytics...</div>;

  const g2 = { display: "grid", gridTemplateColumns: isMob ? "1fr" : "repeat(2,1fr)", gap: 8, marginBottom: 8, minWidth: 0 };
  const cc = { ...S.cc, minWidth: 0, overflow: "hidden" };

  return (
    <div style={S.pg}>
      <div style={{ ...S.topbar, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ ...S.h2, fontSize: isMob ? 29 : 29, color: 'blue' }}>
            📊 Sales dashboard
          </h2>
          <div style={{ ...S.sub, color: 'gray' }}>
            Overview of travellers, tours and cancellations
          </div>
        </div>
      </div>
      <br />

      {/* ══ TOURS ══ */}
      <Section title="Tours" cols={3} isMob={isMob} isTab={isTab}>
        <StatCard icon="🚌" iconBg="#ede9fe" label="Total tours" value={tourList.length} />
        <StatCard icon="✅" iconBg="#dbeafe" label="Available" value={tourList.filter(t => t.available !== false).length} />
        <StatCard icon="🔴" iconBg="#fee2e2" label="Soldout" value={tourList.filter(t => t.available === false).length} />
      </Section>

      {/* ══ TOUR BOOKINGS ══
          Active    = advance paid + balance NOT paid + NOT fully cancelled + NOT all rejected
          Completed = advance paid + balance paid     + NOT fully cancelled + NOT all rejected
          Cancelled = all travellers byAdmin+byTraveller = true
          Rejected  = all travellers byAdmin=true, byTraveller=false
      */}
      <Section title="Tour Bookings" cols={6} isMob={isMob} isTab={isTab}>
        <StatCard icon="📋" iconBg="#e0f2fe" label="Total bookings"    value={summary.totalBookings        || 0} />
        <StatCard icon="⏳" iconBg="#f1f5f9" label="Unverified"        value={summary.unverifiedBookings   || 0} />
        <StatCard icon="🟢" iconBg="#dcfce7" label="Active"            value={summary.activeBookings       || 0} />
        <StatCard icon="🏆" iconBg="#fef9c3" label="Completed"         value={summary.completedBookings    || 0} />
        <StatCard icon="❌" iconBg="#fee2e2" label="Fully cancelled"   value={summary.fullyCancelledBookings || 0} />
        <StatCard icon="🚫" iconBg="#f3e8ff" label="Rejected"          value={summary.rejectedBookings     || 0} />
      </Section>

      {/* ══ TRAVELLERS ══ */}
      <Section title="Travellers" cols={5} isMob={isMob} isTab={isTab}>
        <StatCard icon="👥" iconBg="#ede9fe" label="Total travellers"  value={(summary.totalTravellers || 0).toLocaleString("en-IN")} />
        <StatCard icon="🟢" iconBg="#dcfce7" label="Active travellers" value={summary.activeTravellers || 0} />
        <StatCard icon="🔶" iconBg="#fef3c7" label="Cancelled"         value={summary.cancelledTravellers || 0} />
        <StatCard icon="🕐" iconBg="#fde8d8" label="Cancel request"    value={summary.cancellationRequestTravellers || 0} />
        <StatCard icon="🚫" iconBg="#fee2e2" label="Rejected"          value={summary.rejectedTravellers || 0} />
      </Section>

      {/* ══ GENDER ══ */}
      <Section title="Gender" cols={3} isMob={isMob} isTab={isTab}>
        <StatCard icon="👩" iconBg="#fce7f3" label="Female" value={summary.totalFemale || 0} />
        <StatCard icon="👨" iconBg="#dbeafe" label="Male"   value={summary.totalMale   || 0} />
        <StatCard icon="🧒" iconBg="#fef9c3" label="Child"  value={summary.totalChild  || 0} />
      </Section>

      {/* ══ CANCELLATION AMOUNT ══ */}
      <Section title="Cancellation Amount" cols={3} isMob={isMob} isTab={isTab}>
        <StatCard icon="₹"  iconBg="#fef3c7" label="GV cancellation"    value={fmtFull(summary.totalGVPool    || 0)} />
        <StatCard icon="🎫" iconBg="#ede9fe" label="IRCTC cancellation" value={fmtFull(summary.totalIRCTCPool || 0)} />
        <StatCard icon="💰" iconBg="#fee2e2" label="Total cancellation" value={fmtFull((summary.totalGVPool || 0) + (summary.totalIRCTCPool || 0))} />
      </Section>

      {/* ══ FILTER BAR ══ */}
      <div style={{ ...S.fbar, marginBottom: 12 }}>
        <select style={S.sel} value={filters.year} onChange={e => setFilters(p => ({ ...p, year: e.target.value }))}>
          <option value="">All years</option>
          {[...new Set([...yearWise.map(d => d._id), new Date().getFullYear()])].sort((a, b) => b - a).map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select style={S.sel} value={filters.month} onChange={e => setFilters(p => ({ ...p, month: e.target.value }))}>
          <option value="">All months</option>
          {MN.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
        <select style={S.sel} value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}>
          <option value="">All types</option>
          <option value="Spiritual">Spiritual</option>
          <option value="Historical">Historical</option>
          <option value="International">International</option>
          <option value="Jolly">Jolly</option>
        </select>
        <select style={S.sel} value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
          <option value="">All status</option>
          <option value="Available">Available</option>
          <option value="Soldout">Soldout</option>
          <option value="Completed">Completed</option>
        </select>
        <div style={S.sw} ref={dropRef}>
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
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center", flex: "1 1 auto" }}>
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
        <button style={S.clr} onClick={clearAll}>✕ Clear</button>
      </div>

      {/* ══ CHARTS ══ */}
      <div style={g2}>
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

      <div style={g2}>
        <div style={cc}>
          <div style={S.ct}>Traveller status — year wise</div>
          <div style={S.cs}>Active / Cancelled / Rejected</div>
          <div style={S.leg}>{[["#16a34a", "Active"], ["#f97316", "Cancelled"], ["#dc2626", "Rejected"]].map(([c, l]) => (<span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>))}</div>
          <ChartCanvas id="c3" config={chartTravStatusYW} height={chartH} />
        </div>
        <div style={cc}>
          <div style={S.ct}>Traveller status — month wise {filters.year ? `(${filters.year})` : `(${new Date().getFullYear()})`}</div>
          <div style={S.cs}>Active / Cancelled / Rejected</div>
          <div style={S.leg}>{[["#16a34a", "Active"], ["#f97316", "Cancelled"], ["#dc2626", "Rejected"]].map(([c, l]) => (<span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>))}</div>
          <ChartCanvas id="c4" config={chartTravStatusMW} height={chartH} />
        </div>
      </div>

      <div style={g2}>
        <div style={cc}>
          <div style={S.ct}>Tour status — year wise</div>
          <div style={S.cs}>Available / Soldout per year</div>
          <div style={S.leg}>{[["#2563eb", "Available"], ["#f97316", "Soldout"]].map(([c, l]) => (<span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>))}</div>
          <ChartCanvas id="c5" config={chartTourStatusYW} height={chartH} />
        </div>
        <div style={cc}>
          <div style={S.ct}>Tour status — month wise {filters.year ? `(${filters.year})` : `(${new Date().getFullYear()})`}</div>
          <div style={S.cs}>Available / Soldout by month</div>
          <div style={S.leg}>{[["#2563eb", "Available"], ["#f97316", "Soldout"]].map(([c, l]) => (<span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={S.ld(c)} />{l}</span>))}</div>
          <ChartCanvas id="c6" config={chartTourStatusMW} height={chartH} />
        </div>
      </div>

      <div style={g2}>
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

      {/* ══ TOUR LIST TABLE ══ */}
      <div style={S.tcard}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>Tour profile performance</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>
              {filters.year || filters.month || filters.type || filters.status || selTours.length
                ? `Filtered: ${[filters.year, filters.month ? MN[+filters.month] : "", filters.type, filters.status].filter(Boolean).join(" · ")}`
                : "Showing all tours"}
            </div>
          </div>
          <span style={{ fontSize: 11, color: "#aaa" }}>{tableLoading ? "Loading..." : `${tourList.length} tours`}</span>
        </div>

        {isMob ? (
          tableLoading
            ? <div style={{ textAlign: "center", padding: 24, color: "#aaa" }}>Loading...</div>
            : tourList.length === 0
              ? <div style={{ textAlign: "center", padding: 24, color: "#aaa" }}>No tours match</div>
              : <>
                {tourList.map((t, i) => <TourCard key={t._id} t={t} i={i} />)}
                <div style={{
                  position: "sticky", bottom: 0, background: "#f8f9fb",
                  borderTop: "1.5px solid #e5e7eb", borderRadius: "0 0 10px 10px",
                  padding: "10px 12px", marginTop: 4,
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: 6, zIndex: 10, boxShadow: "0 -2px 8px rgba(0,0,0,.06)"
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#555", gridColumn: "1/-1", marginBottom: 4 }}>Total — {tourList.length} tours</div>
                  {[
                    ["TNR", totTNR, "#1a1a2e"], ["Travellers", totPax, "#7c3aed"],
                    ["Female", totFem, "#9d174d"], ["Male", totMal, "#1d4ed8"],
                    ["Child", totChi, "#854d0e"], ["GV cancel", fmtFull(totGVt), "#15803d"],
                    ["IRCTC cancel", fmtFull(totIRt), "#b45309"], ["Total cancel", fmtFull(totGVt + totIRt), "#1a1a2e"],
                  ].map(([lbl, val, color]) => (
                    <div key={lbl} style={{ background: "#fff", borderRadius: 8, padding: "6px 8px" }}>
                      <div style={{ fontSize: 9, color: "#aaa", marginBottom: 2 }}>{lbl}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color }}>{val}</div>
                    </div>
                  ))}
                </div>
              </>
        ) : (
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", minWidth: isTab ? 500 : 600, borderCollapse: "collapse", tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "24px" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "9%" }} />
              </colgroup>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  {["S.No", "Tour name", "TNR", "Travellers", "Female", "Male", "Child", "GV cancel", "IRCTC cancel", "Total cancel", "Status"].map((h, i) => (
                    <th key={i} style={{ ...S.th, textAlign: i === 0 || i === 1 ? "left" : "center" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableLoading ? (
                  <tr><td colSpan={11} style={{ ...S.td, textAlign: "center", padding: 24, color: "#aaa" }}>Loading...</td></tr>
                ) : tourList.length === 0 ? (
                  <tr><td colSpan={11} style={{ ...S.td, textAlign: "center", padding: 24, color: "#aaa" }}>No tours match</td></tr>
                ) : (
                  <>
                    {tourList.map((t, i) => {
                      const status = t.isCompleted === 1 ? "Completed" : t.available === false ? "Soldout" : "Available";
                      const tot = (t.gvPool || 0) + (t.irctcPool || 0);
                      return (
                        <tr key={t._id}
                          onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <td style={{ ...S.td, color: "#ccc", fontSize: 10 }}>{i + 1}</td>
                          <td style={S.td}>
                            <div style={{ fontWeight: 600, fontSize: isTab ? 11 : 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.tourName || "—"}</div>
                            <small style={{ color: "#aaa", fontSize: 10 }}>{t.tourType || ""}</small>
                          </td>
                          <td style={{ ...S.td, textAlign: "center", fontWeight: 600 }}>{t.totalTNR || 0}</td>
                          <td style={{ ...S.td, textAlign: "center", fontWeight: 600, color: "#7c3aed" }}>{t.totalTravellers || 0}</td>
                          <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#9d174d", "#fdf2f8", "#f9a8d4")}>{t.totalFemale || 0}</span></td>
                          <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#1d4ed8", "#eff6ff", "#93c5fd")}>{t.totalMale || 0}</span></td>
                          <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#854d0e", "#fef9c3", "#fde68a")}>{t.totalChild || 0}</span></td>
                          <td style={{ ...S.td, textAlign: "center", color: "#15803d", fontWeight: 600 }}>{fmtFull(t.gvPool || 0)}</td>
                          <td style={{ ...S.td, textAlign: "center", color: "#b45309", fontWeight: 600 }}>{fmtFull(t.irctcPool || 0)}</td>
                          <td style={{ ...S.td, textAlign: "center", fontWeight: 600 }}>{fmtFull(tot)}</td>
                          <td style={{ ...S.td, textAlign: "center" }}><span style={S.badge(status)}>{status}</span></td>
                        </tr>
                      );
                    })}
                    <tr style={{ background: "#f8f9fb", fontWeight: 600 }}>
                      <td style={S.td} /><td style={{ ...S.td, fontSize: 11 }}>Total ({tourList.length})</td>
                      <td style={{ ...S.td, textAlign: "center" }}>{totTNR}</td>
                      <td style={{ ...S.td, textAlign: "center", color: "#7c3aed" }}>{totPax}</td>
                      <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#9d174d", "#fdf2f8", "#f9a8d4")}>{totFem}</span></td>
                      <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#1d4ed8", "#eff6ff", "#93c5fd")}>{totMal}</span></td>
                      <td style={{ ...S.td, textAlign: "center" }}><span style={S.pill("#854d0e", "#fef9c3", "#fde68a")}>{totChi}</span></td>
                      <td style={{ ...S.td, textAlign: "center", color: "#15803d" }}>{fmtFull(totGVt)}</td>
                      <td style={{ ...S.td, textAlign: "center", color: "#b45309" }}>{fmtFull(totIRt)}</td>
                      <td style={{ ...S.td, textAlign: "center" }}>{fmtFull(totGVt + totIRt)}</td>
                      <td style={S.td} />
                    </tr>
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
