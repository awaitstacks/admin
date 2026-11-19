// // // ════════════════════════════════════════════════════════════════
// // //  WebsiteTraffic.jsx — gvtourplanners.com customer visits
// // //  Overview: cards + charts (daily, hour-wise, source, device) + top pages / clicks / stage events
// // //  Visitors: ovvoru visitor um thani row → click pannaa avanga journey (enna paarthaanga, enna click pannaanga)
// // //  Admin login + "Website Traffic" tab kudutha staff.
// // //  API: /api/touradmin/traffic/report | /visitors | /visitor/:id
// // // ════════════════════════════════════════════════════════════════
// // import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// // import axios from "axios";
// // import {
// //   RefreshCw, Loader2, Globe, Users, Eye, UserPlus, Activity, Smartphone, Monitor, Tablet,
// //   MousePointerClick, Flag, X, ChevronRight, Clock, LogIn, Search, Filter,
// // } from "lucide-react";

// // const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
// // const API = `${BACKEND}/api/touradmin/traffic`;

// // // ─── helpers ───
// // const istToday = () => new Date(Date.now() + 5.5 * 36e5).toISOString().slice(0, 10);
// // const shiftDay = (key, n) => {
// //   const d = new Date(`${key}T00:00:00Z`);
// //   d.setUTCDate(d.getUTCDate() + n);
// //   return d.toISOString().slice(0, 10);
// // };
// // const daysBetween = (a, b) => {
// //   const out = [];
// //   for (let k = a; k <= b && out.length < 400; k = shiftDay(k, 1)) out.push(k);
// //   return out;
// // };
// // const dayLabel = (key) => {
// //   const d = new Date(`${key}T00:00:00`);
// //   return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleDateString("en-IN", { month: "short" })}`;
// // };
// // const timeLabel = (iso) =>
// //   new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
// // const clockLabel = (iso) => new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
// // const hourLabel = (h) => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "am" : "pm"}`;
// // const num = (n) => Number(n || 0).toLocaleString("en-IN");
// // const ago = (iso) => {
// //   const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
// //   if (s < 60) return "just now";
// //   if (s < 3600) return `${Math.floor(s / 60)} min ago`;
// //   if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
// //   return `${Math.floor(s / 86400)} days ago`;
// // };
// // const duration = (sec) => {
// //   if (!sec) return "under 1 min";
// //   if (sec < 60) return `${sec}s`;
// //   const m = Math.floor(sec / 60);
// //   if (m < 60) return `${m} min`;
// //   return `${Math.floor(m / 60)} hr ${m % 60} min`;
// // };
// // // "/tour-details/6a7d…" → page title illana readable path
// // const pageName = (path, title) => {
// //   const t = String(title || "").replace(/\s*[|–-]\s*GV.*$/i, "").trim();
// //   if (t && !/^gv\s*-?\s*tour planners$/i.test(t)) return t;
// //   const clean = String(path || "/").replace(/\?.*$/, "");
// //   if (clean === "/" || clean === "") return "Home";
// //   return clean.replace(/\/[a-f0-9]{24}/gi, "/…");
// // };

// // // Login aana customer na per, illana "Visitor A1B2C3"
// // const whoName = (v) => v?.user?.name || v?.label || "Visitor";
// // const sourceText = (v) => {
// //   const list = v.sources?.length ? v.sources : [v.source];
// //   return list.length > 1 ? `${list[0]} +${list.length - 1} more` : list[0] || "Direct";
// // };
// // const SourceCell = ({ v }) => {
// //   const list = v.sources?.length ? v.sources : [v.source || "Direct"];
// //   return (
// //     <div title={list.join(", ")}>
// //       <div className="truncate">{list[0]}</div>
// //       {list.length > 1 && <div className="truncate text-[11px] text-[#8FA39B]">+ {list.slice(1).join(", ")}</div>}
// //     </div>
// //   );
// // };
// // const whoSub = (u) => (u ? [u.email, u.phone].filter(Boolean).join(" · ") : "");

// // const RANGES = [
// //   { key: "today", label: "Today" },
// //   { key: "yesterday", label: "Yesterday" },
// //   { key: "7", label: "Last 7 days" },
// //   { key: "30", label: "Last 30 days" },
// //   { key: "custom", label: "Custom" },
// // ];
// // const WHO = [
// //   { key: "guest", label: "Guests (not logged in)" },
// //   { key: "loggedIn", label: "Logged-in customers" },
// //   { key: "all", label: "Everyone" },
// // ];
// // const KINDS = [
// //   { key: "", label: "Everything" },
// //   { key: "pageview", label: "Page views" },
// //   { key: "click", label: "Clicks" },
// //   { key: "event", label: "Stage events" },
// // ];
// // const KIND = {
// //   pageview: { label: "View", cls: "bg-[#EEF3F0] text-[#4B5F57]", dot: "#64748B", Icon: Eye },
// //   click: { label: "Click", cls: "bg-[#FEF3C7] text-[#92400E]", dot: "#D97706", Icon: MousePointerClick },
// //   event: { label: "Event", cls: "bg-[#EDE9FE] text-[#5B21B6]", dot: "#7C3AED", Icon: Flag },
// // };
// // const kindOf = (v) => KIND[v.type] || KIND.pageview;
// // const DEVICE_ICON = { Mobile: Smartphone, Desktop: Monitor, Tablet };
// // const PALETTE = ["#2E9E4F", "#1E6FD9", "#D97706", "#7C3AED", "#DB2777", "#0891B2", "#65A30D", "#94A3B8"];

// // const authHeaders = () => {
// //   let aToken = null;
// //   try { aToken = localStorage.getItem("aToken"); } catch { /* */ }
// //   return aToken ? { atoken: aToken, aToken } : {};
// // };

// // // ─── small UI pieces ───
// // const Card = ({ title, right, children, className = "" }) => (
// //   <section className={`min-w-0 rounded-xl border border-[#DCE5E0] bg-white p-4 ${className}`}>
// //     {(title || right) && (
// //       <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
// //         <h3 className="text-sm font-semibold text-[#1B2B26]">{title}</h3>
// //         {right}
// //       </div>
// //     )}
// //     {children}
// //   </section>
// // );

// // // Table header + funnel icon → click panna filter popup
// // const ColHead = ({ label, title, active, children, align = "left", onClear }) => {
// //   const [open, setOpen] = useState(false);
// //   const ref = useRef(null);
// //   useEffect(() => {
// //     if (!open) return undefined;
// //     const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
// //     const esc = (e) => { if (e.key === "Escape") setOpen(false); };
// //     document.addEventListener("mousedown", close);
// //     document.addEventListener("keydown", esc);
// //     return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
// //   }, [open]);
// //   return (
// //     <div ref={ref} className="relative inline-flex items-center gap-1.5 whitespace-nowrap">
// //       <span>{label}</span>
// //       <button type="button" aria-label={`Filter ${label}`} aria-expanded={open} onClick={() => setOpen((o) => !o)}
// //         className={`rounded p-0.5 transition ${active ? "bg-[#EDE9FE] text-[#6D28D9]" : "text-[#9CA3AF] hover:bg-[#EEF2EF] hover:text-[#4B5F57]"}`}>
// //         <Filter className="h-3.5 w-3.5" fill={active ? "currentColor" : "none"} />
// //       </button>
// //       {open && (
// //         <div className={`absolute top-full z-30 mt-2 flex w-64 flex-col gap-2 rounded-xl border border-[#E5E7EB] bg-white p-3 text-[12px] font-normal normal-case tracking-normal text-[#1B2B26] shadow-xl ${align === "right" ? "right-0" : "left-0"}`}>
// //           <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7F77]">{title || `Filter by ${label.toLowerCase()}`}</p>
// //           <div className="flex w-full flex-col gap-2 [&>*]:w-full">{children}</div>
// //           {active && onClear && (
// //             <button type="button" onClick={() => { onClear(); setOpen(false); }} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B42318] hover:underline">
// //               <X className="h-3 w-3" /> Clear
// //             </button>
// //           )}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // const Stat = ({ icon: Icon, label, value, sub, tone }) => (
// //   <div className="rounded-xl border border-[#DCE5E0] bg-white px-4 py-3">
// //     <div className="flex items-center gap-2 text-[12px] text-[#6B7F77]"><Icon className="h-4 w-4" aria-hidden="true" /> {label}</div>
// //     <p className={`mt-1 text-2xl font-bold tabular-nums ${tone || "text-[#1B2B26]"}`}>{value}</p>
// //     {sub && <p className="text-[11px] text-[#8FA39B]">{sub}</p>}
// //   </div>
// // );

// // const Empty = ({ text = "No data yet" }) => <p className="py-6 text-center text-xs text-[#8FA39B]">{text}</p>;

// // // Line / area chart — visitors + page views per day
// // const DailyChart = ({ days, rows }) => {
// //   const [hover, setHover] = useState(null);
// //   const gid = useGid("day");
// //   const byDay = Object.fromEntries(rows.map((r) => [r.day, r]));
// //   const data = days.map((d) => ({ day: d, views: byDay[d]?.views || 0, visitors: byDay[d]?.visitors || 0 }));
// //   // Card width ku etha maadhiri chart (swipe / scroll illa) — mobile, tab, desktop ellaathukkum
// //   const boxRef = useRef(null);
// //   const [boxW, setBoxW] = useState(640);
// //   useEffect(() => {
// //     const el = boxRef.current;
// //     if (!el) return undefined;
// //     const set = () => setBoxW(Math.max(260, Math.round(el.clientWidth)));
// //     set();
// //     const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(set) : null;
// //     ro?.observe(el);
// //     window.addEventListener("resize", set);
// //     return () => { ro?.disconnect(); window.removeEventListener("resize", set); };
// //   }, []);
// //   const W = boxW;
// //   const slotGuess = (W - 42) / Math.max(1, days.length);
// //   // 14 naal ku mela: ore bar (views) ulla visitors, idaiveli vittu, date 3-4 naal ku oru thadava (nera)
// //   const area = days.length > 14;
// //   const many = !area && slotGuess < 46; // 7 naal, chinna screen: saanja label
// //   const H = many ? 250 : 230, P = { l: 34, r: 12, t: 26, b: many ? 48 : 28 };
// //   const labelEvery = area ? Math.max(1, Math.ceil(62 / slotGuess)) : many ? Math.max(1, Math.ceil(16 / slotGuess)) : 1;
// //   const max = Math.max(4, ...data.map((d) => d.views));
// //   const nice = Math.ceil(max / 4) * 4;
// //   const ticks = [0, 1, 2, 3, 4].map((k) => (nice / 4) * k);
// //   const slot = (W - P.l - P.r) / data.length;
// //   const overlay = area || slot < 30; // neraya naal / chinna screen: visitors bar views bar ulla (clutter illa)
// //   const bw = overlay ? Math.max(3, Math.min(16, slot * 0.62)) : Math.max(2, Math.min(20, (slot - 6) / 2)); // side by side la rendu bar
// //   const y = (v) => H - P.b - (v / nice) * (H - P.t - P.b);
// //   const showVals = slot >= 34; // bar mela number idam irundhaa mattum
// //   const totV = data.reduce((a, d) => a + d.views, 0);
// //   // Average per day (range la ella naalum, data illaadha naal um serthu)
// //   const avgV = data.length ? totV / data.length : 0;
// //   const avgP = data.length ? data.reduce((a, d) => a + d.visitors, 0) / data.length : 0;
// //   const fmt1 = (n) => String(+n.toFixed(1));
// //   const best = data.reduce((a, d) => (d.views > a.views ? d : a), data[0] || { views: 0 });
// //   const h = hover !== null ? data[hover] : null;
// //   return (
// //     <div className="relative">
// //       <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px]">
// //         <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FDFA] px-2.5 py-1 font-semibold text-[#0F766E]"><span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-[#0D9488] to-[#5EEAD4]" /> Page views · {num(totV)}</span>
// //         <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF1F2] px-2.5 py-1 font-semibold text-[#BE123C]"><span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-[#E11D48] to-[#FB7185]" /> Visitors (per day)</span>
// //         <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#94A3B8] px-2.5 py-1 font-semibold text-[#334155]">
// //           Avg / day: <span className="text-[#0F766E]">{fmt1(avgV)} views</span> · <span className="text-[#BE123C]">{fmt1(avgP)} visitors</span>
// //         </span>
// //         {best.views > 0 && <span className="ml-auto text-[#6B7280]">Best day: <b className="text-[#1F2937]">{dayLabel(best.day)}</b> ({best.views} views)</span>}
// //       </div>
// //       <div ref={boxRef} className="w-full overflow-hidden">
// //       <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block" role="img" aria-label="Page views and visitors per day" onMouseLeave={() => setHover(null)}>
// //         <defs>
// //           <linearGradient id={`${gid}-v`} x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#0D9488" /><stop offset="100%" stopColor="#5EEAD4" /></linearGradient>
// //           <linearGradient id={`${gid}-p`} x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#E11D48" /><stop offset="100%" stopColor="#FB7185" /></linearGradient>
// //         </defs>
// //         {ticks.map((t) => (
// //           <g key={t}>
// //             <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="#EEF0F4" strokeDasharray={t ? "4 4" : ""} />
// //             <text x={P.l - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#9CA3AF">{t}</text>
// //           </g>
// //         ))}
// //         {data.map((d, i) => {
// //           const cx = P.l + slot * i + slot / 2;
// //           const on = hover === null || hover === i;
// //           const isToday = d.day === istToday();
// //           return (
// //             <g key={d.day} onMouseEnter={() => setHover(i)} style={{ cursor: "pointer" }}>
// //               {hover === i && <rect x={P.l + slot * i + 1} y={P.t - 18} width={slot - 2} height={H - P.t - P.b + 18} rx="6" fill="#F0FDFA" />}
// //               <rect x={P.l + slot * i} y={P.t - 18} width={slot} height={H - P.t - P.b + 18} fill="transparent" />
// //               {overlay ? (
// //                 <>
// //                   {d.views > 0 && <rect x={cx - bw / 2} y={y(d.views)} width={bw} height={H - P.b - y(d.views)} rx={Math.min(4, bw / 2)} fill={`url(#${gid}-v)`} opacity={on ? 0.9 : 0.3} />}
// //                   {d.visitors > 0 && <rect x={cx - bw / 4} y={y(d.visitors)} width={bw / 2} stroke="#fff" strokeWidth="0.75" height={H - P.b - y(d.visitors)} rx={Math.min(3, bw / 4)} fill={`url(#${gid}-p)`} opacity={on ? 1 : 0.4} />}
// //                 </>
// //               ) : (
// //                 <>
// //                   {d.views > 0 && <rect x={cx - bw - 1} y={y(d.views)} width={bw} height={H - P.b - y(d.views)} rx={Math.min(5, bw / 2)} fill={`url(#${gid}-v)`} opacity={on ? 1 : 0.4} />}
// //                   {d.visitors > 0 && <rect x={cx + 1} y={y(d.visitors)} width={bw} height={H - P.b - y(d.visitors)} rx={Math.min(5, bw / 2)} fill={`url(#${gid}-p)`} opacity={on ? 1 : 0.4} />}
// //                 </>
// //               )}
// //               {d.views === 0 && d.visitors === 0 && <circle cx={cx} cy={H - P.b - 3} r="2" fill="#E5E7EB" />}
// //               {showVals && d.views > 0 && <text x={cx - bw / 2 - 1} y={y(d.views) - 5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#0F766E">{d.views}</text>}
// //               {showVals && d.visitors > 0 && <text x={cx + bw / 2 + 1} y={y(d.visitors) - 5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#BE123C">{d.visitors}</text>}
// //               {!(i === data.length - 1 || isToday || (i % labelEvery === 0 && data.length - 1 - i >= labelEvery)) ? null : many ? (
// //                 <text transform={`translate(${cx + 3} ${H - P.b + 12}) rotate(-45)`} textAnchor="end" fontSize="10" fontWeight={isToday ? "700" : "400"} fill={isToday ? "#0F766E" : "#6B7280"}>{isToday ? "Today" : dayLabel(d.day)}</text>
// //               ) : (
// //                 <text x={cx} y={H - 9} textAnchor="middle" fontSize="10" fontWeight={isToday ? "700" : "400"} fill={isToday ? "#0F766E" : "#6B7280"}>{isToday ? "Today" : dayLabel(d.day)}</text>
// //               )}
// //             </g>
// //           );
// //         })}
// //         {/* Average lines */}
// //         {avgV > 0 && (
// //           <g pointerEvents="none">
// //             <line x1={P.l} x2={W - P.r} y1={y(avgV)} y2={y(avgV)} stroke="#0F766E" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.8" />
// //             <rect x={W - P.r - 66} y={y(avgV) - 17} width="64" height="15" rx="7.5" fill="#0F766E" />
// //             <text x={W - P.r - 34} y={y(avgV) - 6.5} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fff">avg {fmt1(avgV)}</text>
// //           </g>
// //         )}
// //         {avgP > 0 && (
// //           <g pointerEvents="none">
// //             <line x1={P.l} x2={W - P.r} y1={y(avgP)} y2={y(avgP)} stroke="#BE123C" strokeWidth="1.5" strokeDasharray="2 4" opacity="0.8" />
// //             <rect x={P.l + 2} y={y(avgP) - 17} width="64" height="15" rx="7.5" fill="#BE123C" />
// //             <text x={P.l + 34} y={y(avgP) - 6.5} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fff">avg {fmt1(avgP)}</text>
// //           </g>
// //         )}
// //       </svg>
// //       </div>
// //       {h && (
// //         <div className={`pointer-events-none absolute top-8 rounded-xl ${hover > data.length / 2 ? "left-10" : "right-2"}`} >
// //           <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] shadow-lg">
// //           <b className="block text-[12px] text-[#1F2937]">{dayLabel(h.day)}</b>
// //           <span className="text-[#0F766E]">● {h.views} page views</span><br />
// //           <span className="text-[#BE123C]">● {h.visitors} visitors</span>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // // Ovvoru hour um thani light (pastel) colour — 24 hours = colour wheel suthi
// // const hourHue = (h) => Math.round(h * 137.508 + 200) % 360; // pakkathu hours ku romba vera colour
// // const HOUR_GRAD = (h) => `linear-gradient(0deg, hsl(${hourHue(h)} 75% 72%), hsl(${hourHue(h)} 85% 86%))`;
// // // Hour-wise bars (0–23, IST) — eppo adhigam varraanga
// // const HourChart = ({ rows }) => {
// //   const byHour = Object.fromEntries(rows.map((r) => [r.hour, r]));
// //   const data = Array.from({ length: 24 }, (_, h) => ({ hour: h, views: byHour[h]?.views || 0, visitors: byHour[h]?.visitors || 0 }));
// //   const max = Math.max(1, ...data.map((d) => d.views));
// //   const peak = data.reduce((a, b) => (b.views > a.views ? b : a), data[0]);
// //   return (
// //     <div>
// //       <div className="flex h-36 items-end gap-[3px]">
// //         {data.map((d) => (
// //           <div key={d.hour} className="group relative flex h-full flex-1 flex-col justify-end">
// //             <div
// //               className="w-full rounded-t-md"
// //               style={{
// //                 height: `${d.views ? Math.max(4, (d.views / max) * 100) : 2}%`,
// //                 background: d.views ? HOUR_GRAD(d.hour) : "#EEF0F4",
// //                 boxShadow: d.hour === peak.hour && d.views ? `0 0 0 2px #fff, 0 0 0 4px hsl(${hourHue(d.hour)} 70% 55%)` : "none",
// //               }}
// //             />
// //             <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[#1B2B26] px-2 py-0.5 text-[10px] text-white group-hover:block">
// //               {hourLabel(d.hour)} · {d.views} views · {d.visitors} visitors
// //             </span>
// //           </div>
// //         ))}
// //       </div>
// //       <div className="mt-1 flex justify-between text-[10px] text-[#8FA39B]">
// //         {[0, 6, 12, 18, 23].map((h) => <span key={h}>{hourLabel(h)}</span>)}
// //       </div>
// //       {peak.views > 0 && <p className="mt-2 text-[11px] text-[#4B5F57]">Busiest hour: <b>{hourLabel(peak.hour)} – {hourLabel((peak.hour + 1) % 24)}</b> ({peak.views} views)</p>}
// //     </div>
// //   );
// // };

// // // Donut + legend (source / device)
// // const Donut = ({ rows, label = "views", icon, colorOf }) => {
// //   const col = (p, i) => (colorOf && colorOf(p.key)) || PALETTE[i % PALETTE.length];
// //   const total = rows.reduce((a, r) => a + r.views, 0);
// //   if (!total) return <Empty />;
// //   const R = 42, C = 2 * Math.PI * R;
// //   let off = 0;
// //   const top = rows.slice(0, 7);
// //   const rest = rows.slice(7).reduce((a, r) => a + r.views, 0);
// //   const parts = rest ? [...top, { key: "Others", views: rest }] : top;
// //   // Accurate percent, 1 decimal (66.7%, 8.3%). .0 na adha kaattaadhu (100%, 25%)
// //   const pct = parts.map((p) => String(+((p.views / total) * 100).toFixed(1)));
// //   return (
// //     <div className="flex flex-wrap items-center justify-center gap-4">
// //       <svg viewBox="0 0 110 110" className="h-28 w-28 shrink-0" role="img" aria-label={`Share of ${label}`}>
// //         <circle cx="55" cy="55" r={R} fill="none" stroke="#EEF2EF" strokeWidth="16" />
// //         {parts.map((p, i) => {
// //           const len = (p.views / total) * C;
// //           const el = (
// //             <circle key={p.key || i} cx="55" cy="55" r={R} fill="none" stroke={col(p, i)} strokeWidth="16"
// //               strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} transform="rotate(-90 55 55)" />
// //           );
// //           off += len;
// //           return el;
// //         })}
// //         <text x="55" y="52" textAnchor="middle" fontSize="16" fontWeight="700" fill="#1B2B26">{num(total)}</text>
// //         <text x="55" y="67" textAnchor="middle" fontSize="9" fill="#8FA39B">{label}</text>
// //       </svg>
// //       <ul className="min-w-[170px] flex-1 space-y-1.5">
// //         {parts.map((p, i) => {
// //           const I = icon ? icon(p.key) : null;
// //           return (
// //             <li key={p.key || i} className="flex items-center justify-between gap-2 text-[12px]">
// //               <span className="flex min-w-0 items-center gap-1.5">
// //                 <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: col(p, i) }} />
// //                 {I && <I className="h-3.5 w-3.5 shrink-0 text-[#6B7F77]" />}
// //                 <span className="truncate text-[#1B2B26]">{p.key || "—"}</span>
// //               </span>
// //               <span className="shrink-0 tabular-nums text-[#4B5F57]">{pct[i]}%</span>
// //             </li>
// //           );
// //         })}
// //       </ul>
// //     </div>
// //   );
// // };

// // // Chart colours — ovvoru chart um thani look
// // const GRAD = [
// //   ["#6366F1", "#A78BFA"], // indigo → violet
// //   ["#F97316", "#FBBF24"], // orange → amber
// //   ["#06B6D4", "#34D399"], // cyan → green
// //   ["#EC4899", "#F472B6"], // pink
// //   ["#0EA5E9", "#7DD3FC"], // sky
// //   ["#EF4444", "#FCA5A5"], // red
// //   ["#84CC16", "#BEF264"], // lime
// //   ["#64748B", "#CBD5E1"], // slate (Others)
// // ];
// // const DEVICE_GRAD = { Desktop: GRAD[0], Mobile: GRAD[1], Tablet: GRAD[2] };
// // const BROWSER_GRAD = { Chrome: ["#2563EB", "#60A5FA"], Safari: ["#06B6D4", "#67E8F9"], Firefox: ["#EA580C", "#FDBA74"], Edge: ["#0D9488", "#5EEAD4"], Samsung: ["#7C3AED", "#C4B5FD"], Opera: ["#DC2626", "#FCA5A5"] };
// // // Source ku theriyura colour (Direct = grey, instagram = pink …)
// // const SOURCE_COLOR = { Direct: "#64748B", google: "#F59E0B", Google: "#F59E0B", instagram: "#E1306C", Instagram: "#E1306C", facebook: "#1877F2", Facebook: "#1877F2", whatsapp: "#22C55E", WhatsApp: "#22C55E", youtube: "#EF4444", YouTube: "#EF4444", linkedin: "#0A66C2", LinkedIn: "#0A66C2", Bing: "#0EA5E9", twitter: "#111827", X: "#111827" };
// // const useGid = (p) => useState(() => `${p}${Math.random().toString(36).slice(2, 8)}`)[0];

// // // Pie (Devices) — gradient slices, center la total
// // const PieChart = ({ rows, icon }) => {
// //   const gid = useGid("pie");
// //   const [hover, setHover] = useState(null);
// //   const total = rows.reduce((a, r) => a + r.views, 0);
// //   if (!total) return <Empty />;
// //   const parts = rows.slice(0, 6).map((r) => ({ ...r }));
// //   const rest = rows.slice(6).reduce((a, r) => a + r.views, 0);
// //   if (rest) parts.push({ key: "Others", views: rest, visitors: 0 });
// //   const gradOf = (k, i) => DEVICE_GRAD[k] || GRAD[i % GRAD.length];
// //   const cx = 80, cy = 80, R = 70;
// //   const pt = (a, r = R) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
// //   const pct = (v) => String(+((v / total) * 100).toFixed(1));
// //   let start = 0;
// //   return (
// //     <div className="flex flex-col items-center gap-4">
// //       <svg viewBox="0 0 160 160" className="h-44 w-44 shrink-0 drop-shadow-[0_6px_14px_rgba(99,102,241,0.25)]" role="img" aria-label="Share of page views by device" onMouseLeave={() => setHover(null)}>
// //         <defs>
// //           {parts.map((p, i) => {
// //             const [c1, c2] = gradOf(p.key, i);
// //             return (
// //               <linearGradient key={i} id={`${gid}-${i}`} x1="0" y1="0" x2="1" y2="1">
// //                 <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
// //               </linearGradient>
// //             );
// //           })}
// //         </defs>
// //         {parts.map((p, i) => {
// //           const ang = (p.views / total) * Math.PI * 2;
// //           const fill = `url(#${gid}-${i})`;
// //           const mid = start + ang / 2;
// //           const push = hover === i && parts.length > 1 ? 5 : 0; // hover slice konjam veliya
// //           const dx = push * Math.sin(mid), dy = -push * Math.cos(mid);
// //           let el;
// //           if (ang >= Math.PI * 2 - 1e-6) el = <circle cx={cx} cy={cy} r={R} fill={fill} />;
// //           else {
// //             const [x1, y1] = pt(start), [x2, y2] = pt(start + ang);
// //             el = <path d={`M${cx},${cy} L${x1},${y1} A${R},${R} 0 ${ang > Math.PI ? 1 : 0} 1 ${x2},${y2} Z`} fill={fill} stroke="#fff" strokeWidth="2" />;
// //           }
// //           const [lx, ly] = pt(mid, R * 0.68);
// //           const g = (
// //             <g key={i} transform={`translate(${dx} ${dy})`} onMouseEnter={() => setHover(i)} style={{ cursor: "pointer", transition: "transform .15s" }}>
// //               <title>{`${p.key}: ${p.views} views (${pct(p.views)}%)`}</title>
// //               {el}
// //               {parts.length > 1 && ang > 0.45 && (
// //                 <text x={lx} y={ly + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">{pct(p.views)}%</text>
// //               )}
// //             </g>
// //           );
// //           start += ang;
// //           return g;
// //         })}
// //         {/* naduvula white circle + total */}
// //         <circle cx={cx} cy={cy} r="30" fill="#fff" opacity="0.95" />
// //         <text x={cx} y={cy - 1} textAnchor="middle" fontSize="18" fontWeight="800" fill="#1E1B4B">{num(total)}</text>
// //         <text x={cx} y={cy + 13} textAnchor="middle" fontSize="9" fill="#6B7280">views</text>
// //       </svg>
// //       <ul className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
// //         {parts.map((p, i) => {
// //           const I = icon ? icon(p.key) : null;
// //           const [c1, c2] = gradOf(p.key, i);
// //           return (
// //             <li key={p.key || i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
// //               className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-[12px] transition ${hover === i ? "border-transparent shadow-md" : "border-[#EEF0F4]"}`}
// //               style={{ background: hover === i ? `linear-gradient(90deg, ${c1}18, ${c2}10)` : "#FAFAFC" }}>
// //               <span className="flex min-w-0 items-center gap-2">
// //                 <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
// //                   {I ? <I className="h-4 w-4" /> : null}
// //                 </span>
// //                 <span className="truncate font-semibold text-[#1B2B26]">{p.key || "—"}</span>
// //               </span>
// //               <span className="shrink-0 text-right tabular-nums">
// //                 <span className="block text-[14px] font-bold" style={{ color: c1 }}>{pct(p.views)}%</span>
// //                 <span className="block text-[10px] text-[#8FA39B]">{num(p.views)} views</span>
// //               </span>
// //             </li>
// //           );
// //         })}
// //       </ul>
// //     </div>
// //   );
// // };

// // // Vertical bars (Browsers) — gradient bars, mela value badge, pinnaadi light track
// // const BarChart = ({ rows }) => {
// //   const gid = useGid("bar");
// //   const [hover, setHover] = useState(null);
// //   if (!rows.length) return <Empty />;
// //   const data = rows.slice(0, 8);
// //   const gradOf = (k, i) => BROWSER_GRAD[k] || GRAD[i % GRAD.length];
// //   const W = 560, H = 230, P = { l: 34, r: 10, t: 30, b: 34 };
// //   const max = Math.max(4, ...data.map((d) => d.views));
// //   const nice = Math.ceil(max / 4) * 4;
// //   const ticks = [0, 1, 2, 3, 4].map((k) => (nice / 4) * k);
// //   const slot = (W - P.l - P.r) / data.length;
// //   const bw = Math.min(64, slot * 0.55);
// //   const y = (v) => H - P.b - (v / nice) * (H - P.t - P.b);
// //   const totalViews = data.reduce((a, d) => a + d.views, 0);
// //   return (
// //     <div className="relative">
// //       <svg viewBox={`0 0 ${W} ${H}`} className="h-60 w-full" role="img" aria-label="Page views by browser" onMouseLeave={() => setHover(null)}>
// //         <defs>
// //           {data.map((d, i) => {
// //             const [c1, c2] = gradOf(d.key, i);
// //             return (
// //               <linearGradient key={i} id={`${gid}-${i}`} x1="0" y1="1" x2="0" y2="0">
// //                 <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
// //               </linearGradient>
// //             );
// //           })}
// //         </defs>
// //         {ticks.map((t) => (
// //           <g key={t}>
// //             <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="#EEF0F4" strokeDasharray={t ? "4 4" : ""} />
// //             <text x={P.l - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#9CA3AF">{t}</text>
// //           </g>
// //         ))}
// //         {data.map((d, i) => {
// //           const x = P.l + slot * i + (slot - bw) / 2;
// //           const top = y(d.views);
// //           const [c1] = gradOf(d.key, i);
// //           const on = hover === null || hover === i;
// //           return (
// //             <g key={d.key || i} onMouseEnter={() => setHover(i)} style={{ cursor: "pointer" }}>
// //               <rect x={P.l + slot * i} y={P.t - 20} width={slot} height={H - P.t - P.b + 20} fill="transparent" />
// //               <rect x={x} y={P.t} width={bw} height={H - P.b - P.t} rx="10" fill={c1} opacity="0.07" />
// //               <rect x={x} y={top} width={bw} height={H - P.b - top} rx="10" fill={`url(#${gid}-${i})`} opacity={on ? 1 : 0.45} />
// //               <rect x={x + bw / 2 - 18} y={top - 24} width="36" height="18" rx="9" fill={c1} opacity={on ? 1 : 0.5} />
// //               <text x={x + bw / 2} y={top - 11} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">{d.views}</text>
// //               <text x={x + bw / 2} y={H - 14} textAnchor="middle" fontSize="12" fontWeight="600" fill="#374151">{d.key || "—"}</text>
// //               <text x={x + bw / 2} y={H - 2} textAnchor="middle" fontSize="9" fill="#9CA3AF">{String(+((d.views / totalViews) * 100).toFixed(1))}%</text>
// //             </g>
// //           );
// //         })}
// //       </svg>
// //       {hover !== null && data[hover] && (
// //         <div className="pointer-events-none absolute right-2 top-0 rounded-lg px-3 py-1.5 text-[11px] text-white shadow-lg" style={{ background: gradOf(data[hover].key, hover)[0] }}>
// //           <b>{data[hover].key}</b> · {data[hover].views} views · {data[hover].visitors} people
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // // ─── Top pages: horizontal gradient bars, ovvoru row um thani colour + rank badge ───
// // const PageBars = ({ rows }) => {
// //   if (!rows.length) return <Empty />;
// //   const data = rows.slice(0, 8);
// //   const max = Math.max(1, ...data.map((r) => r.views));
// //   const COLS = [["#059669", "#6EE7B7"], ["#0284C7", "#7DD3FC"], ["#D97706", "#FCD34D"], ["#E11D48", "#FDA4AF"], ["#7C3AED", "#C4B5FD"], ["#0891B2", "#67E8F9"], ["#65A30D", "#BEF264"], ["#C026D3", "#F0ABFC"]];
// //   return (
// //     <ul className="space-y-2.5">
// //       {data.map((r, i) => {
// //         const [c1, c2] = COLS[i % COLS.length];
// //         const w = Math.max(4, (r.views / max) * 100);
// //         return (
// //           <li key={`${r.key}-${i}`} className="flex items-center gap-2.5" title={`${r.key} · ${r.views} views · ${r.visitors} people`}>
// //             <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>{i + 1}</span>
// //             <div className="min-w-0 flex-1">
// //               <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
// //                 <span className="truncate font-semibold text-[#1F2937]">{pageName(r.key, r.title)}</span>
// //                 <span className="shrink-0 font-bold tabular-nums" style={{ color: c1 }}>{num(r.views)} <span className="font-normal text-[#9CA3AF]">views · {num(r.visitors)} {r.visitors === 1 ? "person" : "people"}</span></span>
// //               </div>
// //               <div className="h-2.5 overflow-hidden rounded-full" style={{ background: `${c1}14` }}>
// //                 <div className="h-full rounded-full" style={{ width: `${w}%`, background: `linear-gradient(90deg, ${c1}, ${c2})` }} />
// //               </div>
// //             </div>
// //           </li>
// //         );
// //       })}
// //     </ul>
// //   );
// // };

// // // ─── Top clicks: horizontal lollipop — per idadhu pakkam full aa, neraya vandhaalum clean aa irukkum ───
// // const Lollipop = ({ rows }) => {
// //   const [all, setAll] = useState(false);
// //   if (!rows.length) return <Empty />;
// //   const COLS = ["#F97316", "#8B5CF6", "#06B6D4", "#EC4899", "#22C55E", "#EAB308", "#3B82F6", "#EF4444"];
// //   const max = Math.max(1, ...rows.map((d) => d.views));
// //   const data = all ? rows : rows.slice(0, 6);
// //   return (
// //     <div>
// //       <ul className="space-y-2.5">
// //         {data.map((d, i) => {
// //           const c = COLS[i % COLS.length];
// //           const w = Math.max(3, (d.views / max) * 100);
// //           return (
// //             <li key={`${d.key}-${i}`} className="group" title={`${d.key} · ${d.views} clicks · ${d.visitors} people`}>
// //               <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
// //                 <span className="truncate font-medium text-[#1F2937]">{d.key || "—"}</span>
// //                 <span className="shrink-0 text-[10px] text-[#9CA3AF]">{num(d.visitors)} {d.visitors === 1 ? "person" : "people"}</span>
// //               </div>
// //               <div className="relative flex h-5 items-center">
// //                 <div className="absolute inset-x-0 h-px bg-[#EEF0F4]" />
// //                 <div className="relative h-[3px] rounded-full" style={{ width: `calc(${w}% - 11px)`, background: c }} />
// //                 <span className="relative -ml-px flex h-5 min-w-[22px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white shadow-sm ring-2 ring-white transition group-hover:scale-110" style={{ background: c }}>
// //                   {num(d.views)}
// //                 </span>
// //               </div>
// //             </li>
// //           );
// //         })}
// //       </ul>
// //       {rows.length > 6 && (
// //         <button type="button" onClick={() => setAll((v) => !v)} className="mt-3 text-[12px] font-semibold text-[#6D28D9] hover:underline">
// //           {all ? "Show less" : `Show all ${rows.length}`}
// //         </button>
// //       )}
// //     </div>
// //   );
// // };

// // // ─── Stage events: funnel (perusu → chinnadhu), ovvoru stage um thani colour ───
// // // Width max-w-md la nikkum, so wide screen / single stage la um stretch aagaadhu
// // const Funnel = ({ rows }) => {
// //   if (!rows.length) return <Empty />;
// //   const data = rows.slice(0, 6);
// //   const COLS = [["#C026D3", "#F0ABFC"], ["#EA580C", "#FDBA74"], ["#0891B2", "#67E8F9"], ["#16A34A", "#86EFAC"], ["#CA8A04", "#FDE047"], ["#4F46E5", "#A5B4FC"]];
// //   const top = Math.max(1, data[0].views);
// //   return (
// //     <div className="mx-auto w-full max-w-md space-y-1.5">
// //       {data.map((r, i) => {
// //         const [c1, c2] = COLS[i % COLS.length];
// //         const w = data.length === 1 ? 100 : 100 - (i * 36) / (data.length - 1);
// //         const conv = i > 0 ? Math.round((r.views / top) * 100) : null;
// //         return (
// //           <div key={`${r.key}-${i}`} className="flex justify-center" title={`${r.key} · ${r.views} times · ${r.visitors} people`}>
// //             <div className="flex min-h-[44px] items-center justify-between gap-2 px-5 py-1.5 text-white"
// //               style={{ width: `${w}%`, minWidth: 200, background: `linear-gradient(90deg, ${c1}, ${c2})`, clipPath: "polygon(0 0, 100% 0, calc(100% - 12px) 100%, 12px 100%)" }}>
// //               <span className="min-w-0 text-[12px] font-semibold leading-tight">
// //                 <span className="block truncate">{r.key}</span>
// //                 {conv !== null && <span className="block text-[10px] font-normal opacity-90">{conv}% of first step</span>}
// //               </span>
// //               <span className="shrink-0 text-right leading-tight">
// //                 <span className="block text-[15px] font-extrabold tabular-nums">{num(r.views)}</span>
// //                 <span className="block whitespace-nowrap text-[10px] opacity-90">{num(r.visitors)} {r.visitors === 1 ? "person" : "people"}</span>
// //               </span>
// //             </div>
// //           </div>
// //         );
// //       })}
// //     </div>
// //   );
// // };

// // const RankList = ({ rows, unit = "views", render }) => {
// //   if (!rows.length) return <Empty />;
// //   const max = Math.max(1, ...rows.map((r) => r.views));
// //   return (
// //     <ul className="space-y-2">
// //       {rows.map((r, i) => (
// //         <li key={`${r.key}-${i}`}>
// //           <div className="flex items-center justify-between gap-3 text-[13px]">
// //             <span className="min-w-0 truncate text-[#1B2B26]" title={r.key}>{render ? render(r) : r.key || "—"}</span>
// //             <span className="shrink-0 tabular-nums text-[#4B5F57]">
// //               {num(r.views)} <span className="text-[#8FA39B]">{unit} · {num(r.visitors)} people</span>
// //             </span>
// //           </div>
// //           <div className="mt-1 h-1.5 rounded-full bg-[#EEF3F0]">
// //             <div className="h-1.5 rounded-full bg-[#2E9E4F]" style={{ width: `${(r.views / max) * 100}%` }} />
// //           </div>
// //         </li>
// //       ))}
// //     </ul>
// //   );
// // };

// // // ─── Visitor journey drawer ───
// // const JourneyDrawer = ({ visitorId, onClose }) => {
// //   const [data, setData] = useState(null);
// //   const [err, setErr] = useState("");
// //   useEffect(() => {
// //     if (!visitorId) return undefined;
// //     let alive = true;
// //     setData(null);
// //     setErr("");
// //     axios.get(`${API}/visitor/${encodeURIComponent(visitorId)}`, { headers: authHeaders() })
// //       .then(({ data: d }) => { if (alive) { if (d.success) setData(d); else setErr(d.message); } })
// //       .catch((e) => { if (alive) setErr(e.response?.data?.message || e.message); });
// //     const onKey = (e) => { if (e.key === "Escape") onClose(); };
// //     window.addEventListener("keydown", onKey);
// //     return () => { alive = false; window.removeEventListener("keydown", onKey); };
// //   }, [visitorId, onClose]);
// //   if (!visitorId) return null;

// //   // Session wise group
// //   const sessions = [];
// //   (data?.items || []).forEach((it) => {
// //     const last = sessions[sessions.length - 1];
// //     if (!last || last.id !== it.sessionId) sessions.push({ id: it.sessionId, items: [it] });
// //     else last.items.push(it);
// //   });
// //   const v = data?.visitor;

// //   return (
// //     <div className="fixed inset-0 z-[60] flex justify-end bg-black/40" onClick={onClose} role="dialog" aria-modal="true" aria-label="Visitor journey">
// //       <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
// //         <div className="flex items-start justify-between gap-3 border-b border-[#EEF2EF] px-5 py-4">
// //           <div>
// //             <h2 className="text-lg font-bold text-[#1B2B26]">{v ? whoName(v) : "Visitor"}</h2>
// //             {v?.user && <p className="text-[12px] font-medium text-[#1E6FD9]">{whoSub(v.user)} · {v.label}</p>}
// //             {v && (
// //               <p className="text-[12px] text-[#6B7F77]">
// //                 {(v.devices || []).length > 1
// //                   ? `${v.devices.length} devices: ${v.devices.join("  |  ")}`
// //                   : `${v.device} · ${v.browser} · ${v.os}${v.screen ? ` · ${v.screen}` : ""}`}
// //                 {v.ip ? ` · ${v.ip}` : ""}
// //               </p>
// //             )}
// //           </div>
// //           <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-[#6B7F77] hover:bg-[#F4F7F5]"><X className="h-5 w-5" /></button>
// //         </div>

// //         <div className="flex-1 overflow-y-auto px-5 py-4">
// //           {err && <p className="rounded-lg bg-[#FDECEC] px-3 py-2 text-sm text-[#B42318]">{err}</p>}
// //           {!data && !err && <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#2E9E4F]" /></div>}
// //           {v && (
// //             <>
// //               <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
// //                 {[["Pages", v.views], ["Clicks", v.clicks], ["Events", v.events], ["Visits", v.sessions]].map(([k, n]) => (
// //                   <div key={k} className="rounded-lg bg-[#F7F9F8] px-3 py-2">
// //                     <p className="text-[11px] text-[#6B7F77]">{k}</p>
// //                     <p className="text-lg font-bold tabular-nums text-[#1B2B26]">{num(n)}</p>
// //                   </div>
// //                 ))}
// //               </div>
// //               <div className="mb-4 space-y-1 text-[12px] text-[#4B5F57]">
// //                 <p><b>First seen:</b> {timeLabel(v.firstAt)} · <b>Last seen:</b> {timeLabel(v.lastAt)} ({ago(v.lastAt)})</p>
// //                 <p><b>Came from:</b> {v.source}{v.referrer ? <span className="text-[#8FA39B]"> · {v.referrer}</span> : null}</p>
// //                 {v.isLoggedIn && <p className="inline-flex items-center gap-1 text-[#1E6FD9]"><LogIn className="h-3.5 w-3.5" /> Logged in on the website</p>}
// //               </div>

// //               {sessions.map((s, si) => (
// //                 <div key={`${s.id}-${si}`} className="mb-5">
// //                   <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#8FA39B]">
// //                     Visit {si + 1} · {timeLabel(s.items[0].at)} · {s.items.length} actions{(v.devices || []).length > 1 ? ` · ${s.items[0].device} · ${s.items[0].browser}` : ""}
// //                   </p>
// //                   <ol className="relative ml-2 border-l-2 border-[#EEF2EF]">
// //                     {s.items.map((it, i) => {
// //                       const k = kindOf(it);
// //                       return (
// //                         <li key={i} className="relative mb-3 pl-5">
// //                           <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-white" style={{ background: k.dot }} />
// //                           <div className="flex flex-wrap items-center gap-x-2 text-[13px]">
// //                             <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${k.cls}`}>{k.label}</span>
// //                             <span className="font-medium text-[#1B2B26]">{it.type === "click" || it.type === "event" ? it.name : pageName(it.path, it.title)}</span>
// //                             <span className="text-[11px] text-[#8FA39B]">{clockLabel(it.at)}</span>
// //                           </div>
// //                           <p className="break-all text-[11px] text-[#6B7F77]">
// //                             {it.type === "click" || it.type === "event" ? `on ${it.path}` : it.path}
// //                             {it.props ? ` · ${Object.entries(it.props).map(([pk, pv]) => `${pk}: ${pv}`).join(" · ")}` : ""}
// //                           </p>
// //                         </li>
// //                       );
// //                     })}
// //                   </ol>
// //                 </div>
// //               ))}
// //             </>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // ═════════════════════════════ PAGE ═════════════════════════════
// // const WebsiteTraffic = () => {
// //   const [tab, setTab] = useState("overview");
// //   const [range, setRange] = useState("today");
// //   const [from, setFrom] = useState(istToday());
// //   const [to, setTo] = useState(istToday());
// //   const [who, setWho] = useState("guest");
// //   const [kind, setKind] = useState("");
// //   // Column wise filters (Visitors + Activity log + Overview ellaathukkum)
// //   const EMPTY_F = { q: "", source: "", device: "", browser: "", page: "", event: "" };
// //   const [f, setF] = useState(EMPTY_F);
// //   const [qText, setQText] = useState("");
// //   useEffect(() => {
// //     const t = setTimeout(() => setF((p) => (p.q === qText.trim() ? p : { ...p, q: qText.trim() })), 400);
// //     return () => clearTimeout(t);
// //   }, [qText]);
// //   const fKey = JSON.stringify(f);
// //   const fParams = useMemo(() => Object.fromEntries(Object.entries(JSON.parse(fKey)).filter(([, v]) => v)), [fKey]);
// //   // Backend ku anuppa: page filter → "path" (page = pagination number, adhu vera)
// //   const qParams = useMemo(() => {
// //     const o = { ...fParams };
// //     if (o.page) { o.path = o.page; delete o.page; }
// //     return o;
// //   }, [fParams]);
// //   const setCol = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
// //   const [data, setData] = useState(null);
// //   const [list, setList] = useState([]);
// //   const [page, setPage] = useState(1);
// //   const [visitors, setVisitors] = useState({ list: [], total: 0, page: 1, hasMore: false });
// //   const [openVisitor, setOpenVisitor] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState("");
// //   const reqId = useRef(0);
// //   const visReq = useRef(0);

// //   const dates = useMemo(() => {
// //     const t = istToday();
// //     if (range === "today") return { from: t, to: t };
// //     if (range === "yesterday") { const y = shiftDay(t, -1); return { from: y, to: y }; }
// //     if (range === "7") return { from: shiftDay(t, -6), to: t };
// //     if (range === "30") return { from: shiftDay(t, -29), to: t };
// //     return { from: from || t, to: to || t };
// //   }, [range, from, to]);

// //   const load = useCallback(async (p = 1, quiet = false) => {
// //     const id = ++reqId.current;
// //     if (!quiet) setLoading(true);
// //     setError("");
// //     try {
// //       const { data: d } = await axios.get(`${API}/report`, { params: { from: dates.from, to: dates.to, who, kind, page: p, ...qParams }, headers: authHeaders() });
// //       if (id !== reqId.current) return;
// //       if (!d.success) throw new Error(d.message || "Could not load traffic");
// //       setData(d);
// //       setPage(p);
// //       setList((prev) => (p === 1 ? d.list : [...prev, ...d.list]));
// //     } catch (err) {
// //       if (id === reqId.current) setError(err.response?.data?.message || err.message);
// //     } finally {
// //       if (id === reqId.current) setLoading(false);
// //     }
// //   }, [dates.from, dates.to, who, kind, qParams]);

// //   const loadVisitors = useCallback(async (p = 1) => {
// //     const id = ++visReq.current;
// //     try {
// //       const { data: d } = await axios.get(`${API}/visitors`, { params: { from: dates.from, to: dates.to, who, page: p, ...qParams }, headers: authHeaders() });
// //       if (id !== visReq.current || !d.success) return;
// //       setVisitors((prev) => ({ ...d, list: p === 1 ? d.list : [...prev.list, ...d.list] }));
// //     } catch (err) {
// //       if (id === visReq.current) setError(err.response?.data?.message || err.message);
// //     }
// //   }, [dates.from, dates.to, who, qParams]);

// //   useEffect(() => { load(1); }, [load]);
// //   useEffect(() => { loadVisitors(1); }, [loadVisitors]);
// //   useEffect(() => {
// //     const t = setInterval(() => {
// //       if (page === 1) load(1, true);
// //       if (visitors.page === 1) loadVisitors(1);
// //     }, 30000);
// //     return () => clearInterval(t);
// //   }, [load, loadVisitors, page, visitors.page]);

// //   const totals = data?.totals || { views: 0, visitors: 0, sessions: 0, newVisitors: 0 };
// //   const allDays = daysBetween(dates.from, dates.to);
// //   const fieldCls = "h-9 rounded-lg border border-[#DCE5E0] bg-white px-3 text-sm text-[#1B2B26] outline-none focus:border-[#2E9E4F]";
// //   const refresh = () => { load(1); loadVisitors(1); };
// //   const colCount = Object.keys(fParams).length;
// //   const hasFilters = range !== "today" || who !== "guest" || kind !== "" || colCount > 0 || qText !== "";
// //   const clearCols = () => { setF(EMPTY_F); setQText(""); };
// //   const clearFilters = () => { setRange("today"); setFrom(istToday()); setTo(istToday()); setWho("guest"); setKind(""); clearCols(); };

// //   // Column filter controls
// //   // Backend options illana (pazhaya controller), charts data la irundhu edukkum
// //   const keysOf = (rows) => (rows || []).map((r) => r.key).filter(Boolean);
// //   const opts = data?.options || {
// //     sources: keysOf(data?.sources), devices: keysOf(data?.devices), browsers: keysOf(data?.browsers),
// //     pages: (data?.pages || []).map((r) => ({ path: r.key || "/", title: r.title || "", views: r.views })),
// //     events: keysOf(data?.events),
// //   };
// //   const colCls = "h-8 w-full min-w-0 rounded-md border border-[#DCE5E0] bg-white px-1.5 text-[11px] font-normal normal-case tracking-normal text-[#1B2B26] outline-none focus:border-[#7C3AED]";
// //   const onCls = "border-[#7C3AED] bg-[#F5F3FF] text-[#5B21B6] font-semibold";
// //   const sel = (k, list, all, label, render) => (
// //     <select aria-label={label} value={f[k]} onChange={setCol(k)} className={`${colCls} ${f[k] ? onCls : ""}`}>
// //       <option value="">{all}</option>
// //       {f[k] && !(list || []).some((x) => (typeof x === "string" ? x : x.path) === f[k]) && <option value={f[k]}>{f[k]}</option>}
// //       {(list || []).map((x) => typeof x === "string"
// //         ? <option key={x} value={x}>{x}</option>
// //         : <option key={x.path} value={x.path}>{render ? render(x) : x.path}</option>)}
// //     </select>
// //   );
// //   const C = {
// //     search: (
// //       <div className="relative">
// //         <Search className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#8FA39B]" />
// //         <input aria-label="Search name, email, phone or visitor ID" value={qText} onChange={(e) => setQText(e.target.value)}
// //           placeholder="Name, email, phone, ID" className={`${colCls} pl-5 ${qText ? onCls : ""}`} />
// //       </div>
// //     ),
// //     page: sel("page", opts.pages, "All pages", "Filter by page", (x) => `${pageName(x.path, x.title)} (${x.views})`),
// //     event: sel("event", opts.events, "All stage events", "Filter by stage event"),
// //     source: sel("source", opts.sources, "All sources", "Filter by source"),
// //     device: sel("device", opts.devices, "All devices", "Filter by device"),
// //     browser: sel("browser", opts.browsers, "All browsers", "Filter by browser"),
// //     kind: (
// //       <select aria-label="Filter by type" value={kind} onChange={(e) => setKind(e.target.value)} className={`${colCls} ${kind ? onCls : ""}`}>
// //         {KINDS.map((k) => <option key={k.key} value={k.key}>{k.key ? k.label : "All types"}</option>)}
// //       </select>
// //     ),
// //     clear: colCount > 0 || qText ? (
// //       <button type="button" onClick={clearCols} className="inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-[11px] font-semibold normal-case tracking-normal text-[#B42318] hover:bg-[#FDECEC]">
// //         <X className="h-3 w-3" /> Clear
// //       </button>
// //     ) : null,
// //   };
// //   const clr = (...ks) => () => { setF((p) => { const n = { ...p }; ks.forEach((k) => { n[k] = ""; }); return n; }); if (ks.includes("q")) setQText(""); };
// //   const FILTER_LABEL = { q: "Search", source: "Source", device: "Device", browser: "Browser", page: "Page", event: "Stage event" };
// //   const closeJourney = useCallback(() => setOpenVisitor(""), []);

// //   return (
// //     <div className="min-h-screen bg-[#F4F7F5] p-3 sm:p-6">
// //       <div className="mx-auto max-w-7xl">
// //         {/* Header */}
// //         <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
// //           <div>
// //             <h1 className="text-2xl font-bold text-[#1B2B26]">Website Traffic</h1>
// //             <p className="text-sm text-[#6B7F77]">Customer visits on gvtourplanners.com</p>
// //           </div>
// //           <button type="button" onClick={refresh} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#2E9E4F] px-4 text-sm font-semibold text-white hover:bg-[#27884A]">
// //             {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh
// //           </button>
// //         </div>

// //         {/* Filters — date + visitor type (column filters Visitors / Activity table la) */}
// //         <section className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#DCE5E0] bg-white p-3">
// //           <select aria-label="Date range" value={range} onChange={(e) => setRange(e.target.value)} className={fieldCls}>
// //             {RANGES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
// //           </select>
// //           {range === "custom" && (
// //             <>
// //               <label className="flex items-center gap-1 text-xs text-[#6B7F77]">From
// //                 <input type="date" value={from} max={to || istToday()} onChange={(e) => setFrom(e.target.value)} className={fieldCls} />
// //               </label>
// //               <label className="flex items-center gap-1 text-xs text-[#6B7F77]">To
// //                 <input type="date" value={to} min={from || undefined} max={istToday()} onChange={(e) => setTo(e.target.value)} className={fieldCls} />
// //               </label>
// //             </>
// //           )}
// //           <select aria-label="Visitor type" value={who} onChange={(e) => setWho(e.target.value)} className={fieldCls}>
// //             {WHO.map((w) => <option key={w.key} value={w.key}>{w.label}</option>)}
// //           </select>
// //           {hasFilters && (
// //             <button type="button" onClick={clearFilters} className="inline-flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-[#B42318] hover:bg-[#FDECEC]">
// //               <X className="h-4 w-4" /> Clear filters
// //             </button>
// //           )}
// //           {Object.entries(fParams).map(([k, v]) => (
// //             <span key={k} className="inline-flex h-7 items-center gap-1 rounded-full border border-[#DDD6FE] bg-[#F5F3FF] pl-2.5 pr-1 text-[11px] text-[#5B21B6]">
// //               <Filter className="h-3 w-3" /> {FILTER_LABEL[k]}: <b className="max-w-[140px] truncate">{k === "page" ? pageName(v) : v}</b>
// //               <button type="button" aria-label={`Remove ${FILTER_LABEL[k]} filter`} onClick={() => { setF((p) => ({ ...p, [k]: "" })); if (k === "q") setQText(""); }}
// //                 className="rounded-full p-0.5 hover:bg-[#EDE9FE]"><X className="h-3 w-3" /></button>
// //             </span>
// //           ))}
// //           <span className="ml-auto text-xs text-[#8FA39B]">
// //             {dates.from === dates.to ? dayLabel(dates.from) : `${dayLabel(dates.from)} – ${dayLabel(dates.to)}`} · auto-refreshes every 30s
// //           </span>
// //         </section>

// //         {error && <p className="mb-4 rounded-lg bg-[#FDECEC] px-3 py-2 text-sm text-[#B42318]">{error}</p>}

// //         {/* Stats */}
// //         <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
// //           <div className="col-span-2 rounded-xl border border-[#BFE3CB] bg-[#E7F6EC] px-4 py-3 md:col-span-1">
// //             <div className="flex items-center gap-2 text-[12px] text-[#0F7A5A]">
// //               <span className="relative flex h-2.5 w-2.5">
// //                 <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2E9E4F] opacity-60" />
// //                 <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#2E9E4F]" />
// //               </span>
// //               Live now
// //             </div>
// //             <p className="mt-1 text-2xl font-bold tabular-nums text-[#0F7A5A]">{num(data?.live)}</p>
// //             <p className="text-[11px] text-[#4B5F57]">active in the last 5 minutes</p>
// //           </div>
// //           <Stat icon={Users} label="Visitors" value={num(totals.visitors)} sub={[
// //             "unique people",
// //             totals.devices && totals.devices !== totals.visitors ? `${num(totals.devices)} devices` : "",
// //             allDays.length > 1 ? `avg ${String(+((data?.daily || []).filter((r) => allDays.includes(r.day)).reduce((a, r) => a + (r.visitors || 0), 0) / allDays.length).toFixed(1))}/day` : "",
// //           ].filter(Boolean).join(" · ")} />
// //           <Stat icon={Eye} label="Page views" value={num(totals.views)} sub={totals.visitors ? `${(totals.views / totals.visitors).toFixed(1)} pages per visitor` : ""} />
// //           <Stat icon={UserPlus} label="New visitors" value={num(totals.newVisitors)} sub={`${num(Math.max(0, totals.visitors - totals.newVisitors))} returning`} tone="text-[#1E6FD9]" />
// //           <Stat icon={Activity} label="Visits" value={num(totals.sessions)} sub="browsing sessions" />
// //         </div>

// //         {/* Tabs */}
// //         <div role="tablist" className="mb-4 inline-flex rounded-lg border border-[#DCE5E0] bg-white p-1">
// //           {[["overview", "Overview"], ["visitors", `Visitors${visitors.total ? ` (${num(visitors.total)})` : ""}`], ["activity", "Activity log"]].map(([k, l]) => (
// //             <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
// //               className={`rounded-md px-4 py-1.5 text-sm font-semibold ${tab === k ? "bg-[#2E9E4F] text-white" : "text-[#4B5F57] hover:bg-[#F4F7F5]"}`}>
// //               {l}
// //             </button>
// //           ))}
// //         </div>

// //         {/* ═══ Overview ═══ */}
// //         {tab === "overview" && (
// //           <>
// //             <div className="mb-4 grid gap-3 lg:grid-cols-3">
// //               <Card title={allDays.length > 1 ? "Visitors & page views per day" : "Today by hour"} className="lg:col-span-2">
// //                 {allDays.length > 1 ? <DailyChart days={allDays} rows={data?.daily || []} /> : <HourChart rows={data?.hourly || []} />}
// //               </Card>
// //               <Card title="Where they came from"><Donut rows={data?.sources || []} label="views" colorOf={(k) => SOURCE_COLOR[k]} /></Card>
// //             </div>
// //             <div className="mb-4 grid gap-3 lg:grid-cols-3">
// //               {allDays.length > 1 && <Card title="Busiest hours (all days)" className="lg:col-span-3"><HourChart rows={data?.hourly || []} /></Card>}
// //               <Card title="Devices">
// //                 <PieChart rows={data?.devices || []} icon={(k) => DEVICE_ICON[k] || Monitor} />
// //               </Card>
// //               <Card title="Browsers" className="lg:col-span-2"><BarChart rows={data?.browsers || []} /></Card>
// //             </div>
// //             <div className="mb-4 grid gap-3 lg:grid-cols-3">
// //               <Card title="Top pages"><PageBars rows={data?.pages || []} /></Card>
// //               <Card title="Top button / link clicks"><Lollipop rows={data?.clicks || []} /></Card>
// //               <Card title="Stage events"><Funnel rows={data?.events || []} /></Card>
// //             </div>
// //           </>
// //         )}

// //         {/* ═══ Visitors ═══ */}
// //         {tab === "visitors" && (
// //           <Card title="Visitors" right={<span className="hidden text-[11px] text-[#8FA39B] sm:inline">Click a visitor to see everything they did</span>}>
// //             {/* Mobile filters */}
// //             <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-3 xl:hidden">
// //               <div className="col-span-2">{C.search}</div>
// //               {C.page}{C.source}{C.device}{C.browser}{C.event}{C.clear}
// //             </div>
// //             {(
// //               <>
// //                 {/* Desktop table */}
// //                 <div className="hidden xl:block">
// //                   <table className="w-full table-fixed text-left text-[13px]">
// //                     <thead className="bg-[#F7F9F8] text-[11px] uppercase tracking-wide text-[#6B7F77]">
// //                       <tr>
// //                         <th className="w-[190px] px-3 py-2 font-semibold"><ColHead label="Visitor" active={!!qText} onClear={clr("q")}>{C.search}</ColHead></th>
// //                         <th className="px-3 py-2 font-semibold"><ColHead label="Last page" title="Visited page / stage event" active={!!(f.page || f.event)} onClear={clr("page", "event")}>{C.page}{C.event}</ColHead></th>
// //                         <th className="w-[110px] px-3 py-2 font-semibold"><ColHead label="Source" active={!!f.source} onClear={clr("source")}>{C.source}</ColHead></th>
// //                         <th className="w-[150px] px-3 py-2 font-semibold"><ColHead label="Device" active={!!(f.device || f.browser)} onClear={clr("device", "browser")}>{C.device}{C.browser}</ColHead></th>
// //                         <th className="w-[60px] px-3 py-2 text-right font-semibold">Pages</th>
// //                         <th className="w-[60px] px-3 py-2 text-right font-semibold">Clicks</th>
// //                         <th className="w-[55px] px-3 py-2 text-right font-semibold">Visits</th>
// //                         <th className="w-[90px] px-3 py-2 font-semibold">Time spent</th>
// //                         <th className="w-[105px] px-3 py-2 font-semibold">Last seen</th>
// //                       </tr>
// //                     </thead>
// //                     <tbody className="divide-y divide-[#EEF2EF]">
// //                       {visitors.list.length === 0 && (
// //                         <tr><td colSpan={9} className="px-3 py-10 text-center text-sm text-[#8FA39B]">No visitors match these filters.</td></tr>
// //                       )}
// //                       {visitors.list.map((v) => {
// //                         const DI = DEVICE_ICON[v.device] || Monitor;
// //                         return (
// //                           <tr key={v.visitorId} onClick={() => setOpenVisitor(v.visitorId)} className="cursor-pointer hover:bg-[#F7F9F8]"
// //                             tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") setOpenVisitor(v.visitorId); }}>
// //                             <td className="px-3 py-2.5">
// //                               <div className="flex items-center gap-2">
// //                                 <span className={`h-2 w-2 shrink-0 rounded-full ${v.live ? "bg-[#2E9E4F]" : "bg-[#CBD5E1]"}`} title={v.live ? "Live now" : "Not active"} />
// //                                 <span className="truncate font-semibold text-[#1B2B26]" title={v.label}>{whoName(v)}</span>
// //                               </div>
// //                               {v.user && <div className="truncate pl-4 text-[11px] text-[#1E6FD9]">{whoSub(v.user)}</div>}
// //                               {v.linkedLater && <div className="pl-4 text-[10px] text-[#8FA39B]">Guest visits only · this customer logged in separately</div>}
// //                               <div className="mt-0.5 flex flex-wrap gap-1 pl-4">
// //                                 <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${v.firstVisit ? "bg-[#E8F1FD] text-[#1E6FD9]" : "bg-[#EEF3F0] text-[#4B5F57]"}`}>{v.firstVisit ? "New" : "Returning"}</span>
// //                                 {v.isLoggedIn && <span className="rounded-full bg-[#EDE9FE] px-1.5 py-0.5 text-[10px] font-semibold text-[#5B21B6]">Logged in</span>}
// //                               </div>
// //                             </td>
// //                             <td className="truncate px-3 py-2.5" title={v.lastPath}>
// //                               <span className="text-[#1E6FD9]">{pageName(v.lastPath, v.lastTitle)}</span>
// //                               {v.eventNames.length > 0 && <span className="block truncate text-[11px] text-[#6D28D9]">🚩 {v.eventNames.join(", ")}</span>}
// //                             </td>
// //                             <td className="px-3 py-2.5"><SourceCell v={v} /></td>
// //                             <td className="truncate px-3 py-2.5 text-[#4B5F57]" title={(v.devices || []).map((d) => d.label).join("\n")}>
// //                               {(v.devices || []).length > 1
// //                                 ? <span className="font-medium text-[#1E6FD9]"><Monitor className="mr-1 inline h-3.5 w-3.5" />{v.devices.length} devices</span>
// //                                 : <><DI className="mr-1 inline h-3.5 w-3.5" />{v.device} · {v.browser}</>}
// //                             </td>
// //                             <td className="px-3 py-2.5 text-right tabular-nums">{v.views}</td>
// //                             <td className="px-3 py-2.5 text-right tabular-nums">{v.clicks}</td>
// //                             <td className="px-3 py-2.5 text-right tabular-nums">{v.sessions}</td>
// //                             <td className="px-3 py-2.5 text-[#4B5F57]">{duration(v.durationSec)}</td>
// //                             <td className="px-3 py-2.5 text-[#4B5F57]" title={timeLabel(v.lastAt)}>{v.live ? <span className="font-semibold text-[#2E9E4F]">Live</span> : ago(v.lastAt)}</td>
// //                           </tr>
// //                         );
// //                       })}
// //                     </tbody>
// //                   </table>
// //                 </div>
// //                 {/* Mobile cards */}
// //                 {visitors.list.length === 0 && <div className="xl:hidden"><Empty text="No visitors match these filters." /></div>}
// //                 <ul className="divide-y divide-[#EEF2EF] xl:hidden">
// //                   {visitors.list.map((v) => {
// //                     const DI = DEVICE_ICON[v.device] || Monitor;
// //                     return (
// //                       <li key={v.visitorId}>
// //                         <button type="button" onClick={() => setOpenVisitor(v.visitorId)}
// //                           className="flex w-full items-center gap-3 px-1 py-3 text-left hover:bg-[#F7F9F8]">
// //                           <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF3F0]">
// //                             <DI className="h-4 w-4 text-[#4B5F57]" />
// //                             {v.live && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#2E9E4F]" title="Live now" />}
// //                           </span>
// //                           <span className="min-w-0 flex-1">
// //                             <span className="flex flex-wrap items-center gap-x-2 text-[13px]">
// //                               <b className="text-[#1B2B26]">{whoName(v)}</b>
// //                               {v.user && <span className="text-[11px] text-[#1E6FD9]">{whoSub(v.user)}</span>}
// //                               <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${v.firstVisit ? "bg-[#E8F1FD] text-[#1E6FD9]" : "bg-[#EEF3F0] text-[#4B5F57]"}`}>{v.firstVisit ? "New" : "Returning"}</span>
// //                               {v.isLoggedIn && <span className="rounded-full bg-[#EDE9FE] px-1.5 py-0.5 text-[10px] font-semibold text-[#5B21B6]">Logged in</span>}
// //                               {v.live && <span className="text-[11px] font-semibold text-[#2E9E4F]">● Live</span>}
// //                             </span>
// //                             <span className="block truncate text-[12px] text-[#4B5F57]">
// //                               Last: {pageName(v.lastPath, v.lastTitle)} · {ago(v.lastAt)}
// //                             </span>
// //                             <span className="block text-[11px] text-[#8FA39B]">
// //                               {sourceText(v)} · {(v.devices || []).length > 1 ? `${v.devices.length} devices` : `${v.device} · ${v.browser}`}{v.ip ? ` · ${v.ip}` : ""} · <Clock className="inline h-3 w-3" /> {duration(v.durationSec)}
// //                               {v.eventNames.length ? ` · ${v.eventNames.join(", ")}` : ""}
// //                             </span>
// //                           </span>
// //                           <span className="hidden shrink-0 gap-3 text-center text-[11px] text-[#6B7F77] sm:flex">
// //                             <span><b className="block text-sm text-[#1B2B26]">{v.views}</b>pages</span>
// //                             <span><b className="block text-sm text-[#1B2B26]">{v.clicks}</b>clicks</span>
// //                             <span><b className="block text-sm text-[#1B2B26]">{v.sessions}</b>visits</span>
// //                           </span>
// //                           <ChevronRight className="h-4 w-4 shrink-0 text-[#8FA39B]" />
// //                         </button>
// //                       </li>
// //                     );
// //                   })}
// //                 </ul>
// //                 {visitors.hasMore && (
// //                   <div className="pt-3 text-center">
// //                     <button type="button" onClick={() => loadVisitors(visitors.page + 1)} className="rounded-lg border border-[#DCE5E0] px-4 py-2 text-sm font-semibold text-[#1B2B26] hover:bg-[#F7F9F8]">Load more</button>
// //                   </div>
// //                 )}
// //               </>
// //             )}
// //           </Card>
// //         )}

// //         {/* ═══ Activity log ═══ */}
// //         {tab === "activity" && (
// //           <section className="rounded-xl border border-[#DCE5E0] bg-white">
// //             <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEF2EF] px-4 py-3">
// //               <h3 className="text-sm font-semibold text-[#1B2B26]">Activity log</h3>
// //             </div>
// //             <div className="grid grid-cols-2 gap-2 border-b border-[#EEF2EF] p-3 md:grid-cols-3 xl:hidden">
// //               <div className="col-span-2">{C.search}</div>
// //               {C.kind}{C.page}{C.event}{C.source}{C.device}{C.browser}{C.clear}
// //             </div>
// //             {(
// //               <>
// //               <div className="hidden xl:block">
// //                 <table className="w-full table-fixed text-left text-[13px]">
// //                   <thead className="bg-[#F7F9F8] text-[11px] uppercase tracking-wide text-[#6B7F77]">
// //                     <tr>
// //                       <th className="w-[140px] px-4 py-2 font-semibold">Time</th>
// //                       <th className="w-[90px] px-4 py-2 font-semibold"><ColHead label="Type" active={!!kind} onClear={() => setKind("")}>{C.kind}</ColHead></th>
// //                       <th className="px-4 py-2 font-semibold"><ColHead label="Page / action" title="Page / stage event" active={!!(f.page || f.event)} onClear={clr("page", "event")}>{C.page}{C.event}</ColHead></th>
// //                       <th className="w-[130px] px-4 py-2 font-semibold"><ColHead label="Visitor" active={!!qText} onClear={clr("q")}>{C.search}</ColHead></th>
// //                       <th className="w-[110px] px-4 py-2 font-semibold"><ColHead label="Source" active={!!f.source} onClear={clr("source")} align="right">{C.source}</ColHead></th>
// //                       <th className="w-[150px] px-4 py-2 font-semibold"><ColHead label="Device" active={!!(f.device || f.browser)} onClear={clr("device", "browser")} align="right">{C.device}{C.browser}</ColHead></th>
// //                       <th className="w-[100px] px-4 py-2 font-semibold">IP</th>
// //                     </tr>
// //                   </thead>
// //                   <tbody className="divide-y divide-[#EEF2EF]">
// //                     {list.length === 0 && !loading && (
// //                       <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-[#8FA39B]">No activity matches these filters.</td></tr>
// //                     )}
// //                     {list.map((v) => {
// //                       const k = kindOf(v);
// //                       const isAct = v.type === "click" || v.type === "event";
// //                       return (
// //                         <tr key={v._id} onClick={() => setOpenVisitor(v.visitorId)} className="cursor-pointer hover:bg-[#F7F9F8]"
// //                           tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") setOpenVisitor(v.visitorId); }}>
// //                           <td className="px-4 py-2 text-[#1B2B26]">{timeLabel(v.at)}</td>
// //                           <td className="px-4 py-2"><span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${k.cls}`}>{k.label}</span></td>
// //                           <td className="truncate px-4 py-2" title={isAct ? `${v.name} — on ${v.path}` : v.path}>
// //                             <span className="text-[#1E6FD9]">{isAct ? v.name : pageName(v.path, v.title)}</span>
// //                             <span className="text-[11px] text-[#8FA39B]"> · {isAct ? `on ${v.path}` : v.path}</span>
// //                           </td>
// //                           <td className="truncate px-4 py-2 text-[#4B5F57]">{v.user?.name ? <span className="font-medium text-[#1B2B26]">{v.user.name}</span> : `Visitor ${String(v.visitorId || "").replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase()}`}</td>
// //                           <td className="truncate px-4 py-2">{v.source}</td>
// //                           <td className="truncate px-4 py-2 text-[#4B5F57]">{v.device} · {v.browser}</td>
// //                           <td className="px-4 py-2 text-[#8FA39B]">{v.ip || "—"}</td>
// //                         </tr>
// //                       );
// //                     })}
// //                   </tbody>
// //                 </table>
// //               </div>
// //               {list.length === 0 && !loading && <div className="xl:hidden"><Empty text="No activity matches these filters." /></div>}
// //               <ul className="divide-y divide-[#EEF2EF] xl:hidden">
// //                 {list.map((v) => {
// //                   const k = kindOf(v);
// //                   return (
// //                     <li key={v._id}>
// //                       <button type="button" onClick={() => setOpenVisitor(v.visitorId)} className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-[#F7F9F8]">
// //                         <span className={`mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${k.cls}`}>{k.label}</span>
// //                         <span className="min-w-0 flex-1 text-[13px]">
// //                           <span className="block truncate text-[#1B2B26]">{v.type === "click" || v.type === "event" ? v.name : pageName(v.path, v.title)}</span>
// //                           <span className="block truncate text-[11px] text-[#8FA39B]">
// //                             {v.type === "click" || v.type === "event" ? `on ${v.path}` : v.path} · {v.source} · {v.device} · {v.browser}
// //                           </span>
// //                         </span>
// //                         <span className="shrink-0 text-right text-[11px] text-[#6B7F77]">{timeLabel(v.at)}</span>
// //                       </button>
// //                     </li>
// //                   );
// //                 })}
// //               </ul>
// //               </>
// //             )}
// //             {data?.hasMore && (
// //               <div className="border-t border-[#EEF2EF] p-3 text-center">
// //                 <button type="button" onClick={() => load(page + 1)} disabled={loading} className="rounded-lg border border-[#DCE5E0] px-4 py-2 text-sm font-semibold text-[#1B2B26] hover:bg-[#F7F9F8] disabled:opacity-50">
// //                   {loading ? "Loading…" : "Load more"}
// //                 </button>
// //               </div>
// //             )}
// //           </section>
// //         )}

// //         <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[#8FA39B]">
// //           <Globe className="h-3.5 w-3.5" /> IP addresses are partly hidden. Bots and crawlers are not counted. Guests are anonymous (each browser gets its own visitor ID). Logged-in customers show their name.
// //         </p>
// //       </div>

// //       <JourneyDrawer visitorId={openVisitor} onClose={closeJourney} />
// //     </div>
// //   );
// // };

// // export default WebsiteTraffic;


// // ════════════════════════════════════════════════════════════════
// //  WebsiteTraffic.jsx — gvtourplanners.com customer visits
// //  Overview: cards + charts (daily, hour-wise, source, device) + top pages / clicks / stage events
// //  Visitors: ovvoru visitor um thani row → click pannaa avanga journey (enna paarthaanga, enna click pannaanga)
// //  Admin login + "Website Traffic" tab kudutha staff.
// //  API: /api/touradmin/traffic/report | /visitors | /visitor/:id
// // ════════════════════════════════════════════════════════════════
// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import axios from "axios";
// import {
//   RefreshCw, Loader2, Globe, Users, Eye, UserPlus, Activity, Smartphone, Monitor, Tablet,
//   MousePointerClick, Flag, X, ChevronRight, Clock, LogIn, Search, Filter,
// } from "lucide-react";

// const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
// const API = `${BACKEND}/api/touradmin/traffic`;

// // ─── helpers ───
// const istToday = () => new Date(Date.now() + 5.5 * 36e5).toISOString().slice(0, 10);
// const shiftDay = (key, n) => {
//   const d = new Date(`${key}T00:00:00Z`);
//   d.setUTCDate(d.getUTCDate() + n);
//   return d.toISOString().slice(0, 10);
// };
// const daysBetween = (a, b) => {
//   const out = [];
//   for (let k = a; k <= b && out.length < 400; k = shiftDay(k, 1)) out.push(k);
//   return out;
// };
// const dayLabel = (key) => {
//   const d = new Date(`${key}T00:00:00`);
//   return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleDateString("en-IN", { month: "short" })}`;
// };
// const timeLabel = (iso) =>
//   new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
// const clockLabel = (iso) => new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
// const hourLabel = (h) => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "am" : "pm"}`;
// const num = (n) => Number(n || 0).toLocaleString("en-IN");
// const ago = (iso) => {
//   const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
//   if (s < 60) return "just now";
//   if (s < 3600) return `${Math.floor(s / 60)} min ago`;
//   if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
//   return `${Math.floor(s / 86400)} days ago`;
// };
// const duration = (sec) => {
//   if (!sec) return "under 1 min";
//   if (sec < 60) return `${sec}s`;
//   const m = Math.floor(sec / 60);
//   if (m < 60) return `${m} min`;
//   return `${Math.floor(m / 60)} hr ${m % 60} min`;
// };
// // "/tour-details/6a7d…" → page title illana readable path
// // Page per — "/booking/6a7d…" → "Booking", "/my-trolly" → "My Trolly", "/" → "Home" (utm / id ellaam thookkidum)
// const PAGE_NAMES = { "": "Home", booking: "Booking", "tour-details": "Tour details", tours: "Tours", tour: "Tour", contact: "Contact", about: "About", login: "Login", enquiry: "Enquiry", "my-trolly": "My Trolly", "my-bookings": "My Bookings", "my-profile": "My Profile" };
// const prettyPage = (path) => {
//   const clean = String(path || "/").replace(/[?#].*$/, "");
//   const parts = clean.split("/").filter(Boolean).filter((x) => !/^[a-f0-9]{24}$/i.test(x) && !/^\d+$/.test(x));
//   if (!parts.length) return "Home";
//   return parts.map((x) => PAGE_NAMES[x.toLowerCase()] || x.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())).join(" › ");
// };
// // "?utm_source=facebook&utm_campaign=diwali" → "from facebook (diwali)"
// const utmText = (path) => {
//   try {
//     const q = new URLSearchParams(String(path || "").split("?")[1] || "");
//     const src = q.get("utm_source");
//     if (!src) return "";
//     const camp = q.get("utm_campaign");
//     return `from ${src}${camp ? ` (${camp})` : ""}`;
//   } catch { return ""; }
// };
// const pageName = (path, title) => {
//   const t = String(title || "").replace(/\s*[|–-]\s*GV.*$/i, "").trim();
//   if (t && !/^gv\s*-?\s*tour planners$/i.test(t)) return t;
//   return prettyPage(path);
// };
// // Clean line: "Booking · HAMPI TOUR · from facebook (diwali)"
// const prettyLine = (path, tour) => [prettyPage(path), tour, utmText(path)].filter(Boolean).join(" · ");

// // Login aana customer na per, illana "Visitor A1B2C3"
// const whoName = (v) => v?.user?.name || v?.label || "Visitor";
// const sourceText = (v) => {
//   const list = v.sources?.length ? v.sources : [v.source];
//   return list.length > 1 ? `${list[0]} +${list.length - 1} more` : list[0] || "Direct";
// };
// const SourceCell = ({ v }) => {
//   const list = v.sources?.length ? v.sources : [v.source || "Direct"];
//   return (
//     <div title={list.join(", ")}>
//       <div className="truncate">{list[0]}</div>
//       {list.length > 1 && <div className="truncate text-[11px] text-[#8FA39B]">+ {list.slice(1).join(", ")}</div>}
//     </div>
//   );
// };
// // Real device list: Desktop · Chrome rendu browser ID irundhaalum ore device thaan
// const devList = (v) => [...new Set((v?.devices || []).map((d) => (typeof d === "string" ? d : `${d.device} · ${d.browser}`)))];
// const whoSub = (u) => (u ? [u.email, u.phone].filter(Boolean).join(" · ") : "");

// const RANGES = [
//   { key: "today", label: "Today" },
//   { key: "yesterday", label: "Yesterday" },
//   { key: "7", label: "Last 7 days" },
//   { key: "30", label: "Last 30 days" },
//   { key: "custom", label: "Custom" },
// ];
// const WHO = [
//   { key: "guest", label: "Guests (not logged in)" },
//   { key: "loggedIn", label: "Logged-in customers" },
//   { key: "all", label: "Everyone" },
// ];
// const KINDS = [
//   { key: "", label: "Everything" },
//   { key: "pageview", label: "Page views" },
//   { key: "click", label: "Clicks" },
//   { key: "event", label: "Stage events" },
// ];
// const KIND = {
//   pageview: { label: "View", cls: "bg-[#EEF3F0] text-[#4B5F57]", dot: "#64748B", Icon: Eye },
//   click: { label: "Click", cls: "bg-[#FEF3C7] text-[#92400E]", dot: "#D97706", Icon: MousePointerClick },
//   event: { label: "Event", cls: "bg-[#EDE9FE] text-[#5B21B6]", dot: "#7C3AED", Icon: Flag },
// };
// const kindOf = (v) => KIND[v.type] || KIND.pageview;
// const DEVICE_ICON = { Mobile: Smartphone, Desktop: Monitor, Tablet };
// const PALETTE = ["#2E9E4F", "#1E6FD9", "#D97706", "#7C3AED", "#DB2777", "#0891B2", "#65A30D", "#94A3B8"];

// const authHeaders = () => {
//   let aToken = null;
//   try { aToken = localStorage.getItem("aToken"); } catch { /* */ }
//   return aToken ? { atoken: aToken, aToken } : {};
// };

// // ─── small UI pieces ───
// const Card = ({ title, right, children, className = "" }) => (
//   <section className={`min-w-0 rounded-xl border border-[#DCE5E0] bg-white p-4 ${className}`}>
//     {(title || right) && (
//       <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
//         <h3 className="text-sm font-semibold text-[#1B2B26]">{title}</h3>
//         {right}
//       </div>
//     )}
//     {children}
//   </section>
// );

// // Table header + funnel icon → click panna filter popup
// const ColHead = ({ label, title, active, children, align = "left", onClear }) => {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);
//   useEffect(() => {
//     if (!open) return undefined;
//     const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
//     const esc = (e) => { if (e.key === "Escape") setOpen(false); };
//     document.addEventListener("mousedown", close);
//     document.addEventListener("keydown", esc);
//     return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
//   }, [open]);
//   return (
//     <div ref={ref} className="relative inline-flex items-center gap-1.5 whitespace-nowrap">
//       <span>{label}</span>
//       <button type="button" aria-label={`Filter ${label}`} aria-expanded={open} onClick={() => setOpen((o) => !o)}
//         className={`rounded p-0.5 transition ${active ? "bg-[#EDE9FE] text-[#6D28D9]" : "text-[#9CA3AF] hover:bg-[#EEF2EF] hover:text-[#4B5F57]"}`}>
//         <Filter className="h-3.5 w-3.5" fill={active ? "currentColor" : "none"} />
//       </button>
//       {open && (
//         <div className={`absolute top-full z-30 mt-2 flex w-64 flex-col gap-2 rounded-xl border border-[#E5E7EB] bg-white p-3 text-[12px] font-normal normal-case tracking-normal text-[#1B2B26] shadow-xl ${align === "right" ? "right-0" : "left-0"}`}>
//           <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7F77]">{title || `Filter by ${label.toLowerCase()}`}</p>
//           <div className="flex w-full flex-col gap-2 [&>*]:w-full">{children}</div>
//           {active && onClear && (
//             <button type="button" onClick={() => { onClear(); setOpen(false); }} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B42318] hover:underline">
//               <X className="h-3 w-3" /> Clear
//             </button>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// const Stat = ({ icon: Icon, label, value, sub, tone }) => (
//   <div className="rounded-xl border border-[#DCE5E0] bg-white px-4 py-3">
//     <div className="flex items-center gap-2 text-[12px] text-[#6B7F77]"><Icon className="h-4 w-4" aria-hidden="true" /> {label}</div>
//     <p className={`mt-1 text-2xl font-bold tabular-nums ${tone || "text-[#1B2B26]"}`}>{value}</p>
//     {sub && <p className="text-[11px] text-[#8FA39B]">{sub}</p>}
//   </div>
// );

// const Empty = ({ text = "No data yet" }) => <p className="py-6 text-center text-xs text-[#8FA39B]">{text}</p>;

// // Line / area chart — visitors + page views per day
// const DailyChart = ({ days, rows }) => {
//   const [hover, setHover] = useState(null);
//   const gid = useGid("day");
//   const byDay = Object.fromEntries(rows.map((r) => [r.day, r]));
//   const data = days.map((d) => ({ day: d, views: byDay[d]?.views || 0, visitors: byDay[d]?.visitors || 0 }));
//   // Card width ku etha maadhiri chart (swipe / scroll illa) — mobile, tab, desktop ellaathukkum
//   const boxRef = useRef(null);
//   const [boxW, setBoxW] = useState(640);
//   useEffect(() => {
//     const el = boxRef.current;
//     if (!el) return undefined;
//     const set = () => setBoxW(Math.max(260, Math.round(el.clientWidth)));
//     set();
//     const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(set) : null;
//     ro?.observe(el);
//     window.addEventListener("resize", set);
//     return () => { ro?.disconnect(); window.removeEventListener("resize", set); };
//   }, []);
//   const W = boxW;
//   const slotGuess = (W - 42) / Math.max(1, days.length);
//   // 14 naal ku mela: ore bar (views) ulla visitors, idaiveli vittu, date 3-4 naal ku oru thadava (nera)
//   const area = days.length > 14;
//   const many = !area && slotGuess < 46; // 7 naal, chinna screen: saanja label
//   const H = many ? 250 : 230, P = { l: 34, r: 12, t: 26, b: many ? 48 : 28 };
//   const labelEvery = area ? Math.max(1, Math.ceil(62 / slotGuess)) : many ? Math.max(1, Math.ceil(16 / slotGuess)) : 1;
//   const max = Math.max(4, ...data.map((d) => d.views));
//   const nice = Math.ceil(max / 4) * 4;
//   const ticks = [0, 1, 2, 3, 4].map((k) => (nice / 4) * k);
//   const slot = (W - P.l - P.r) / data.length;
//   const overlay = area || slot < 30; // neraya naal / chinna screen: visitors bar views bar ulla (clutter illa)
//   const bw = overlay ? Math.max(3, Math.min(16, slot * 0.62)) : Math.max(2, Math.min(20, (slot - 6) / 2)); // side by side la rendu bar
//   const y = (v) => H - P.b - (v / nice) * (H - P.t - P.b);
//   const showVals = slot >= 34; // bar mela number idam irundhaa mattum
//   const totV = data.reduce((a, d) => a + d.views, 0);
//   // Average per day (range la ella naalum, data illaadha naal um serthu)
//   const avgV = data.length ? totV / data.length : 0;
//   const avgP = data.length ? data.reduce((a, d) => a + d.visitors, 0) / data.length : 0;
//   const fmt1 = (n) => String(+n.toFixed(1));
//   const best = data.reduce((a, d) => (d.views > a.views ? d : a), data[0] || { views: 0 });
//   const h = hover !== null ? data[hover] : null;
//   return (
//     <div className="relative">
//       <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px]">
//         <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FDFA] px-2.5 py-1 font-semibold text-[#0F766E]"><span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-[#0D9488] to-[#5EEAD4]" /> Page views · {num(totV)}</span>
//         <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF1F2] px-2.5 py-1 font-semibold text-[#BE123C]"><span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-[#E11D48] to-[#FB7185]" /> Visitors (per day)</span>
//         <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#94A3B8] px-2.5 py-1 font-semibold text-[#334155]">
//           Avg / day: <span className="text-[#0F766E]">{fmt1(avgV)} views</span> · <span className="text-[#BE123C]">{fmt1(avgP)} visitors</span>
//         </span>
//         {best.views > 0 && <span className="ml-auto text-[#6B7280]">Best day: <b className="text-[#1F2937]">{dayLabel(best.day)}</b> ({best.views} views)</span>}
//       </div>
//       <div ref={boxRef} className="w-full overflow-hidden">
//       <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block" role="img" aria-label="Page views and visitors per day" onMouseLeave={() => setHover(null)}>
//         <defs>
//           <linearGradient id={`${gid}-v`} x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#0D9488" /><stop offset="100%" stopColor="#5EEAD4" /></linearGradient>
//           <linearGradient id={`${gid}-p`} x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#E11D48" /><stop offset="100%" stopColor="#FB7185" /></linearGradient>
//         </defs>
//         {ticks.map((t) => (
//           <g key={t}>
//             <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="#EEF0F4" strokeDasharray={t ? "4 4" : ""} />
//             <text x={P.l - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#9CA3AF">{t}</text>
//           </g>
//         ))}
//         {data.map((d, i) => {
//           const cx = P.l + slot * i + slot / 2;
//           const on = hover === null || hover === i;
//           const isToday = d.day === istToday();
//           return (
//             <g key={d.day} onMouseEnter={() => setHover(i)} style={{ cursor: "pointer" }}>
//               {hover === i && <rect x={P.l + slot * i + 1} y={P.t - 18} width={slot - 2} height={H - P.t - P.b + 18} rx="6" fill="#F0FDFA" />}
//               <rect x={P.l + slot * i} y={P.t - 18} width={slot} height={H - P.t - P.b + 18} fill="transparent" />
//               {overlay ? (
//                 <>
//                   {d.views > 0 && <rect x={cx - bw / 2} y={y(d.views)} width={bw} height={H - P.b - y(d.views)} rx={Math.min(4, bw / 2)} fill={`url(#${gid}-v)`} opacity={on ? 0.9 : 0.3} />}
//                   {d.visitors > 0 && <rect x={cx - bw / 4} y={y(d.visitors)} width={bw / 2} stroke="#fff" strokeWidth="0.75" height={H - P.b - y(d.visitors)} rx={Math.min(3, bw / 4)} fill={`url(#${gid}-p)`} opacity={on ? 1 : 0.4} />}
//                 </>
//               ) : (
//                 <>
//                   {d.views > 0 && <rect x={cx - bw - 1} y={y(d.views)} width={bw} height={H - P.b - y(d.views)} rx={Math.min(5, bw / 2)} fill={`url(#${gid}-v)`} opacity={on ? 1 : 0.4} />}
//                   {d.visitors > 0 && <rect x={cx + 1} y={y(d.visitors)} width={bw} height={H - P.b - y(d.visitors)} rx={Math.min(5, bw / 2)} fill={`url(#${gid}-p)`} opacity={on ? 1 : 0.4} />}
//                 </>
//               )}
//               {d.views === 0 && d.visitors === 0 && <circle cx={cx} cy={H - P.b - 3} r="2" fill="#E5E7EB" />}
//               {showVals && d.views > 0 && <text x={cx - bw / 2 - 1} y={y(d.views) - 5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#0F766E">{d.views}</text>}
//               {showVals && d.visitors > 0 && <text x={cx + bw / 2 + 1} y={y(d.visitors) - 5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#BE123C">{d.visitors}</text>}
//               {!(i === data.length - 1 || isToday || (i % labelEvery === 0 && data.length - 1 - i >= labelEvery)) ? null : many ? (
//                 <text transform={`translate(${cx + 3} ${H - P.b + 12}) rotate(-45)`} textAnchor="end" fontSize="10" fontWeight={isToday ? "700" : "400"} fill={isToday ? "#0F766E" : "#6B7280"}>{isToday ? "Today" : dayLabel(d.day)}</text>
//               ) : (
//                 <text x={cx} y={H - 9} textAnchor="middle" fontSize="10" fontWeight={isToday ? "700" : "400"} fill={isToday ? "#0F766E" : "#6B7280"}>{isToday ? "Today" : dayLabel(d.day)}</text>
//               )}
//             </g>
//           );
//         })}
//         {/* Average lines */}
//         {avgV > 0 && (
//           <g pointerEvents="none">
//             <line x1={P.l} x2={W - P.r} y1={y(avgV)} y2={y(avgV)} stroke="#0F766E" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.8" />
//             <rect x={W - P.r - 66} y={y(avgV) - 17} width="64" height="15" rx="7.5" fill="#0F766E" />
//             <text x={W - P.r - 34} y={y(avgV) - 6.5} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fff">avg {fmt1(avgV)}</text>
//           </g>
//         )}
//         {avgP > 0 && (
//           <g pointerEvents="none">
//             <line x1={P.l} x2={W - P.r} y1={y(avgP)} y2={y(avgP)} stroke="#BE123C" strokeWidth="1.5" strokeDasharray="2 4" opacity="0.8" />
//             <rect x={P.l + 2} y={y(avgP) - 17} width="64" height="15" rx="7.5" fill="#BE123C" />
//             <text x={P.l + 34} y={y(avgP) - 6.5} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fff">avg {fmt1(avgP)}</text>
//           </g>
//         )}
//       </svg>
//       </div>
//       {h && (
//         <div className={`pointer-events-none absolute top-8 rounded-xl ${hover > data.length / 2 ? "left-10" : "right-2"}`} >
//           <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] shadow-lg">
//           <b className="block text-[12px] text-[#1F2937]">{dayLabel(h.day)}</b>
//           <span className="text-[#0F766E]">● {h.views} page views</span><br />
//           <span className="text-[#BE123C]">● {h.visitors} visitors</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Ovvoru hour um thani light (pastel) colour — 24 hours = colour wheel suthi
// const hourHue = (h) => Math.round(h * 137.508 + 200) % 360; // pakkathu hours ku romba vera colour
// const HOUR_GRAD = (h) => `linear-gradient(0deg, hsl(${hourHue(h)} 75% 72%), hsl(${hourHue(h)} 85% 86%))`;
// // Hour-wise bars (0–23, IST) — eppo adhigam varraanga
// const HourChart = ({ rows }) => {
//   const byHour = Object.fromEntries(rows.map((r) => [r.hour, r]));
//   const data = Array.from({ length: 24 }, (_, h) => ({ hour: h, views: byHour[h]?.views || 0, visitors: byHour[h]?.visitors || 0 }));
//   const max = Math.max(1, ...data.map((d) => d.views));
//   const peak = data.reduce((a, b) => (b.views > a.views ? b : a), data[0]);
//   return (
//     <div>
//       <div className="flex h-36 items-end gap-[3px]">
//         {data.map((d) => (
//           <div key={d.hour} className="group relative flex h-full flex-1 flex-col justify-end">
//             <div
//               className="w-full rounded-t-md"
//               style={{
//                 height: `${d.views ? Math.max(4, (d.views / max) * 100) : 2}%`,
//                 background: d.views ? HOUR_GRAD(d.hour) : "#EEF0F4",
//                 boxShadow: d.hour === peak.hour && d.views ? `0 0 0 2px #fff, 0 0 0 4px hsl(${hourHue(d.hour)} 70% 55%)` : "none",
//               }}
//             />
//             <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[#1B2B26] px-2 py-0.5 text-[10px] text-white group-hover:block">
//               {hourLabel(d.hour)} · {d.views} views · {d.visitors} visitors
//             </span>
//           </div>
//         ))}
//       </div>
//       <div className="mt-1 flex justify-between text-[10px] text-[#8FA39B]">
//         {[0, 6, 12, 18, 23].map((h) => <span key={h}>{hourLabel(h)}</span>)}
//       </div>
//       {peak.views > 0 && <p className="mt-2 text-[11px] text-[#4B5F57]">Busiest hour: <b>{hourLabel(peak.hour)} – {hourLabel((peak.hour + 1) % 24)}</b> ({peak.views} views)</p>}
//     </div>
//   );
// };

// // Donut + legend (source / device)
// const Donut = ({ rows, label = "views", icon, colorOf }) => {
//   const col = (p, i) => (colorOf && colorOf(p.key)) || PALETTE[i % PALETTE.length];
//   const total = rows.reduce((a, r) => a + r.views, 0);
//   if (!total) return <Empty />;
//   const R = 42, C = 2 * Math.PI * R;
//   let off = 0;
//   const top = rows.slice(0, 7);
//   const rest = rows.slice(7).reduce((a, r) => a + r.views, 0);
//   const parts = rest ? [...top, { key: "Others", views: rest }] : top;
//   // Accurate percent, 1 decimal (66.7%, 8.3%). .0 na adha kaattaadhu (100%, 25%)
//   const pct = parts.map((p) => String(+((p.views / total) * 100).toFixed(1)));
//   return (
//     <div className="flex flex-wrap items-center justify-center gap-4">
//       <svg viewBox="0 0 110 110" className="h-28 w-28 shrink-0" role="img" aria-label={`Share of ${label}`}>
//         <circle cx="55" cy="55" r={R} fill="none" stroke="#EEF2EF" strokeWidth="16" />
//         {parts.map((p, i) => {
//           const len = (p.views / total) * C;
//           const el = (
//             <circle key={p.key || i} cx="55" cy="55" r={R} fill="none" stroke={col(p, i)} strokeWidth="16"
//               strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} transform="rotate(-90 55 55)" />
//           );
//           off += len;
//           return el;
//         })}
//         <text x="55" y="52" textAnchor="middle" fontSize="16" fontWeight="700" fill="#1B2B26">{num(total)}</text>
//         <text x="55" y="67" textAnchor="middle" fontSize="9" fill="#8FA39B">{label}</text>
//       </svg>
//       <ul className="min-w-[170px] flex-1 space-y-1.5">
//         {parts.map((p, i) => {
//           const I = icon ? icon(p.key) : null;
//           return (
//             <li key={p.key || i} className="flex items-center justify-between gap-2 text-[12px]">
//               <span className="flex min-w-0 items-center gap-1.5">
//                 <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: col(p, i) }} />
//                 {I && <I className="h-3.5 w-3.5 shrink-0 text-[#6B7F77]" />}
//                 <span className="truncate text-[#1B2B26]">{p.key || "—"}</span>
//               </span>
//               <span className="shrink-0 tabular-nums text-[#4B5F57]">{pct[i]}%</span>
//             </li>
//           );
//         })}
//       </ul>
//     </div>
//   );
// };

// // Chart colours — ovvoru chart um thani look
// const GRAD = [
//   ["#6366F1", "#A78BFA"], // indigo → violet
//   ["#F97316", "#FBBF24"], // orange → amber
//   ["#06B6D4", "#34D399"], // cyan → green
//   ["#EC4899", "#F472B6"], // pink
//   ["#0EA5E9", "#7DD3FC"], // sky
//   ["#EF4444", "#FCA5A5"], // red
//   ["#84CC16", "#BEF264"], // lime
//   ["#64748B", "#CBD5E1"], // slate (Others)
// ];
// const DEVICE_GRAD = { Desktop: GRAD[0], Mobile: GRAD[1], Tablet: GRAD[2] };
// const BROWSER_GRAD = { Chrome: ["#2563EB", "#60A5FA"], Safari: ["#06B6D4", "#67E8F9"], Firefox: ["#EA580C", "#FDBA74"], Edge: ["#0D9488", "#5EEAD4"], Samsung: ["#7C3AED", "#C4B5FD"], Opera: ["#DC2626", "#FCA5A5"] };
// // Source ku theriyura colour (Direct = grey, instagram = pink …)
// const SOURCE_COLOR = { Direct: "#64748B", google: "#F59E0B", Google: "#F59E0B", instagram: "#E1306C", Instagram: "#E1306C", facebook: "#1877F2", Facebook: "#1877F2", whatsapp: "#22C55E", WhatsApp: "#22C55E", youtube: "#EF4444", YouTube: "#EF4444", linkedin: "#0A66C2", LinkedIn: "#0A66C2", Bing: "#0EA5E9", twitter: "#111827", X: "#111827" };
// const useGid = (p) => useState(() => `${p}${Math.random().toString(36).slice(2, 8)}`)[0];

// // Pie (Devices) — gradient slices, center la total
// const PieChart = ({ rows, icon }) => {
//   const gid = useGid("pie");
//   const [hover, setHover] = useState(null);
//   const total = rows.reduce((a, r) => a + r.views, 0);
//   if (!total) return <Empty />;
//   const parts = rows.slice(0, 6).map((r) => ({ ...r }));
//   const rest = rows.slice(6).reduce((a, r) => a + r.views, 0);
//   if (rest) parts.push({ key: "Others", views: rest, visitors: 0 });
//   const gradOf = (k, i) => DEVICE_GRAD[k] || GRAD[i % GRAD.length];
//   const cx = 80, cy = 80, R = 70;
//   const pt = (a, r = R) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
//   const pct = (v) => String(+((v / total) * 100).toFixed(1));
//   let start = 0;
//   return (
//     <div className="flex flex-col items-center gap-4">
//       <svg viewBox="0 0 160 160" className="h-44 w-44 shrink-0 drop-shadow-[0_6px_14px_rgba(99,102,241,0.25)]" role="img" aria-label="Share of page views by device" onMouseLeave={() => setHover(null)}>
//         <defs>
//           {parts.map((p, i) => {
//             const [c1, c2] = gradOf(p.key, i);
//             return (
//               <linearGradient key={i} id={`${gid}-${i}`} x1="0" y1="0" x2="1" y2="1">
//                 <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
//               </linearGradient>
//             );
//           })}
//         </defs>
//         {parts.map((p, i) => {
//           const ang = (p.views / total) * Math.PI * 2;
//           const fill = `url(#${gid}-${i})`;
//           const mid = start + ang / 2;
//           const push = hover === i && parts.length > 1 ? 5 : 0; // hover slice konjam veliya
//           const dx = push * Math.sin(mid), dy = -push * Math.cos(mid);
//           let el;
//           if (ang >= Math.PI * 2 - 1e-6) el = <circle cx={cx} cy={cy} r={R} fill={fill} />;
//           else {
//             const [x1, y1] = pt(start), [x2, y2] = pt(start + ang);
//             el = <path d={`M${cx},${cy} L${x1},${y1} A${R},${R} 0 ${ang > Math.PI ? 1 : 0} 1 ${x2},${y2} Z`} fill={fill} stroke="#fff" strokeWidth="2" />;
//           }
//           const [lx, ly] = pt(mid, R * 0.68);
//           const g = (
//             <g key={i} transform={`translate(${dx} ${dy})`} onMouseEnter={() => setHover(i)} style={{ cursor: "pointer", transition: "transform .15s" }}>
//               <title>{`${p.key}: ${p.views} views (${pct(p.views)}%)`}</title>
//               {el}
//               {parts.length > 1 && ang > 0.45 && (
//                 <text x={lx} y={ly + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">{pct(p.views)}%</text>
//               )}
//             </g>
//           );
//           start += ang;
//           return g;
//         })}
//         {/* naduvula white circle + total */}
//         <circle cx={cx} cy={cy} r="30" fill="#fff" opacity="0.95" />
//         <text x={cx} y={cy - 1} textAnchor="middle" fontSize="18" fontWeight="800" fill="#1E1B4B">{num(total)}</text>
//         <text x={cx} y={cy + 13} textAnchor="middle" fontSize="9" fill="#6B7280">views</text>
//       </svg>
//       <ul className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
//         {parts.map((p, i) => {
//           const I = icon ? icon(p.key) : null;
//           const [c1, c2] = gradOf(p.key, i);
//           return (
//             <li key={p.key || i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
//               className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-[12px] transition ${hover === i ? "border-transparent shadow-md" : "border-[#EEF0F4]"}`}
//               style={{ background: hover === i ? `linear-gradient(90deg, ${c1}18, ${c2}10)` : "#FAFAFC" }}>
//               <span className="flex min-w-0 items-center gap-2">
//                 <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
//                   {I ? <I className="h-4 w-4" /> : null}
//                 </span>
//                 <span className="truncate font-semibold text-[#1B2B26]">{p.key || "—"}</span>
//               </span>
//               <span className="shrink-0 text-right tabular-nums">
//                 <span className="block text-[14px] font-bold" style={{ color: c1 }}>{pct(p.views)}%</span>
//                 <span className="block text-[10px] text-[#8FA39B]">{num(p.views)} views</span>
//               </span>
//             </li>
//           );
//         })}
//       </ul>
//     </div>
//   );
// };

// // Vertical bars (Browsers) — gradient bars, mela value badge, pinnaadi light track
// const BarChart = ({ rows }) => {
//   const gid = useGid("bar");
//   const [hover, setHover] = useState(null);
//   if (!rows.length) return <Empty />;
//   const data = rows.slice(0, 8);
//   const gradOf = (k, i) => BROWSER_GRAD[k] || GRAD[i % GRAD.length];
//   const W = 560, H = 230, P = { l: 34, r: 10, t: 30, b: 34 };
//   const max = Math.max(4, ...data.map((d) => d.views));
//   const nice = Math.ceil(max / 4) * 4;
//   const ticks = [0, 1, 2, 3, 4].map((k) => (nice / 4) * k);
//   const slot = (W - P.l - P.r) / data.length;
//   const bw = Math.min(64, slot * 0.55);
//   const y = (v) => H - P.b - (v / nice) * (H - P.t - P.b);
//   const totalViews = data.reduce((a, d) => a + d.views, 0);
//   return (
//     <div className="relative">
//       <svg viewBox={`0 0 ${W} ${H}`} className="h-60 w-full" role="img" aria-label="Page views by browser" onMouseLeave={() => setHover(null)}>
//         <defs>
//           {data.map((d, i) => {
//             const [c1, c2] = gradOf(d.key, i);
//             return (
//               <linearGradient key={i} id={`${gid}-${i}`} x1="0" y1="1" x2="0" y2="0">
//                 <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
//               </linearGradient>
//             );
//           })}
//         </defs>
//         {ticks.map((t) => (
//           <g key={t}>
//             <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="#EEF0F4" strokeDasharray={t ? "4 4" : ""} />
//             <text x={P.l - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#9CA3AF">{t}</text>
//           </g>
//         ))}
//         {data.map((d, i) => {
//           const x = P.l + slot * i + (slot - bw) / 2;
//           const top = y(d.views);
//           const [c1] = gradOf(d.key, i);
//           const on = hover === null || hover === i;
//           return (
//             <g key={d.key || i} onMouseEnter={() => setHover(i)} style={{ cursor: "pointer" }}>
//               <rect x={P.l + slot * i} y={P.t - 20} width={slot} height={H - P.t - P.b + 20} fill="transparent" />
//               <rect x={x} y={P.t} width={bw} height={H - P.b - P.t} rx="10" fill={c1} opacity="0.07" />
//               <rect x={x} y={top} width={bw} height={H - P.b - top} rx="10" fill={`url(#${gid}-${i})`} opacity={on ? 1 : 0.45} />
//               <rect x={x + bw / 2 - 18} y={top - 24} width="36" height="18" rx="9" fill={c1} opacity={on ? 1 : 0.5} />
//               <text x={x + bw / 2} y={top - 11} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">{d.views}</text>
//               <text x={x + bw / 2} y={H - 14} textAnchor="middle" fontSize="12" fontWeight="600" fill="#374151">{d.key || "—"}</text>
//               <text x={x + bw / 2} y={H - 2} textAnchor="middle" fontSize="9" fill="#9CA3AF">{String(+((d.views / totalViews) * 100).toFixed(1))}%</text>
//             </g>
//           );
//         })}
//       </svg>
//       {hover !== null && data[hover] && (
//         <div className="pointer-events-none absolute right-2 top-0 rounded-lg px-3 py-1.5 text-[11px] text-white shadow-lg" style={{ background: gradOf(data[hover].key, hover)[0] }}>
//           <b>{data[hover].key}</b> · {data[hover].views} views · {data[hover].visitors} people
//         </div>
//       )}
//     </div>
//   );
// };

// // ─── Top pages: horizontal gradient bars, ovvoru row um thani colour + rank badge ───
// const PageBars = ({ rows }) => {
//   if (!rows.length) return <Empty />;
//   const data = rows.slice(0, 8);
//   const max = Math.max(1, ...data.map((r) => r.views));
//   const COLS = [["#059669", "#6EE7B7"], ["#0284C7", "#7DD3FC"], ["#D97706", "#FCD34D"], ["#E11D48", "#FDA4AF"], ["#7C3AED", "#C4B5FD"], ["#0891B2", "#67E8F9"], ["#65A30D", "#BEF264"], ["#C026D3", "#F0ABFC"]];
//   return (
//     <ul className="space-y-2.5">
//       {data.map((r, i) => {
//         const [c1, c2] = COLS[i % COLS.length];
//         const w = Math.max(4, (r.views / max) * 100);
//         return (
//           <li key={`${r.key}-${i}`} className="flex items-center gap-2.5" title={`${r.key} · ${r.views} views · ${r.visitors} people`}>
//             <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>{i + 1}</span>
//             <div className="min-w-0 flex-1">
//               <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
//                 <span className="truncate font-semibold text-[#1F2937]">{pageName(r.key, r.title)}</span>
//                 <span className="shrink-0 font-bold tabular-nums" style={{ color: c1 }}>{num(r.views)} <span className="font-normal text-[#9CA3AF]">views · {num(r.visitors)} {r.visitors === 1 ? "person" : "people"}</span></span>
//               </div>
//               <div className="h-2.5 overflow-hidden rounded-full" style={{ background: `${c1}14` }}>
//                 <div className="h-full rounded-full" style={{ width: `${w}%`, background: `linear-gradient(90deg, ${c1}, ${c2})` }} />
//               </div>
//             </div>
//           </li>
//         );
//       })}
//     </ul>
//   );
// };

// // ─── Top clicks: horizontal lollipop — per idadhu pakkam full aa, neraya vandhaalum clean aa irukkum ───
// const Lollipop = ({ rows }) => {
//   const [all, setAll] = useState(false);
//   if (!rows.length) return <Empty />;
//   const COLS = ["#F97316", "#8B5CF6", "#06B6D4", "#EC4899", "#22C55E", "#EAB308", "#3B82F6", "#EF4444"];
//   const max = Math.max(1, ...rows.map((d) => d.views));
//   const data = all ? rows : rows.slice(0, 6);
//   return (
//     <div>
//       <ul className="space-y-2.5">
//         {data.map((d, i) => {
//           const c = COLS[i % COLS.length];
//           const w = Math.max(3, (d.views / max) * 100);
//           return (
//             <li key={`${d.key}-${i}`} className="group" title={`${d.key} · ${d.views} clicks · ${d.visitors} people`}>
//               <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
//                 <span className="truncate font-medium text-[#1F2937]">{d.key || "—"}</span>
//                 <span className="shrink-0 text-[10px] text-[#9CA3AF]">{num(d.visitors)} {d.visitors === 1 ? "person" : "people"}</span>
//               </div>
//               <div className="relative flex h-5 items-center">
//                 <div className="absolute inset-x-0 h-px bg-[#EEF0F4]" />
//                 <div className="relative h-[3px] rounded-full" style={{ width: `calc(${w}% - 11px)`, background: c }} />
//                 <span className="relative -ml-px flex h-5 min-w-[22px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white shadow-sm ring-2 ring-white transition group-hover:scale-110" style={{ background: c }}>
//                   {num(d.views)}
//                 </span>
//               </div>
//             </li>
//           );
//         })}
//       </ul>
//       {rows.length > 6 && (
//         <button type="button" onClick={() => setAll((v) => !v)} className="mt-3 text-[12px] font-semibold text-[#6D28D9] hover:underline">
//           {all ? "Show less" : `Show all ${rows.length}`}
//         </button>
//       )}
//     </div>
//   );
// };

// // ─── Stage events: funnel (perusu → chinnadhu), ovvoru stage um thani colour ───
// // Width max-w-md la nikkum, so wide screen / single stage la um stretch aagaadhu
// const Funnel = ({ rows }) => {
//   if (!rows.length) return <Empty />;
//   const data = rows.slice(0, 6);
//   const COLS = [["#C026D3", "#F0ABFC"], ["#EA580C", "#FDBA74"], ["#0891B2", "#67E8F9"], ["#16A34A", "#86EFAC"], ["#CA8A04", "#FDE047"], ["#4F46E5", "#A5B4FC"]];
//   const top = Math.max(1, data[0].views);
//   return (
//     <div className="mx-auto w-full max-w-md space-y-1.5">
//       {data.map((r, i) => {
//         const [c1, c2] = COLS[i % COLS.length];
//         const w = data.length === 1 ? 100 : 100 - (i * 36) / (data.length - 1);
//         const conv = i > 0 ? Math.round((r.views / top) * 100) : null;
//         return (
//           <div key={`${r.key}-${i}`} className="flex justify-center" title={`${r.key} · ${r.views} times · ${r.visitors} people`}>
//             <div className="flex min-h-[44px] items-center justify-between gap-2 px-5 py-1.5 text-white"
//               style={{ width: `${w}%`, minWidth: 200, background: `linear-gradient(90deg, ${c1}, ${c2})`, clipPath: "polygon(0 0, 100% 0, calc(100% - 12px) 100%, 12px 100%)" }}>
//               <span className="min-w-0 text-[12px] font-semibold leading-tight">
//                 <span className="block truncate">{r.key}</span>
//                 {conv !== null && <span className="block text-[10px] font-normal opacity-90">{conv}% of first step</span>}
//               </span>
//               <span className="shrink-0 text-right leading-tight">
//                 <span className="block text-[15px] font-extrabold tabular-nums">{num(r.views)}</span>
//                 <span className="block whitespace-nowrap text-[10px] opacity-90">{num(r.visitors)} {r.visitors === 1 ? "person" : "people"}</span>
//               </span>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// const RankList = ({ rows, unit = "views", render }) => {
//   if (!rows.length) return <Empty />;
//   const max = Math.max(1, ...rows.map((r) => r.views));
//   return (
//     <ul className="space-y-2">
//       {rows.map((r, i) => (
//         <li key={`${r.key}-${i}`}>
//           <div className="flex items-center justify-between gap-3 text-[13px]">
//             <span className="min-w-0 truncate text-[#1B2B26]" title={r.key}>{render ? render(r) : r.key || "—"}</span>
//             <span className="shrink-0 tabular-nums text-[#4B5F57]">
//               {num(r.views)} <span className="text-[#8FA39B]">{unit} · {num(r.visitors)} people</span>
//             </span>
//           </div>
//           <div className="mt-1 h-1.5 rounded-full bg-[#EEF3F0]">
//             <div className="h-1.5 rounded-full bg-[#2E9E4F]" style={{ width: `${(r.views / max) * 100}%` }} />
//           </div>
//         </li>
//       ))}
//     </ul>
//   );
// };

// // ─── Visitor journey drawer ───
// const JourneyDrawer = ({ visitorId, onClose }) => {
//   const [data, setData] = useState(null);
//   const [err, setErr] = useState("");
//   useEffect(() => {
//     if (!visitorId) return undefined;
//     let alive = true;
//     setData(null);
//     setErr("");
//     axios.get(`${API}/visitor/${encodeURIComponent(visitorId)}`, { headers: authHeaders() })
//       .then(({ data: d }) => { if (alive) { if (d.success) setData(d); else setErr(d.message); } })
//       .catch((e) => { if (alive) setErr(e.response?.data?.message || e.message); });
//     const onKey = (e) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", onKey);
//     return () => { alive = false; window.removeEventListener("keydown", onKey); };
//   }, [visitorId, onClose]);
//   if (!visitorId) return null;

//   // Session wise group
//   const sessions = [];
//   (data?.items || []).forEach((it) => {
//     const last = sessions[sessions.length - 1];
//     if (!last || last.id !== it.sessionId) sessions.push({ id: it.sessionId, items: [it] });
//     else last.items.push(it);
//   });
//   const v = data?.visitor;
//   // /booking/<id> → tour per (event props la irundhu)
//   const tourByPath = {};
//   (data?.items || []).forEach((it) => { if (it.props?.tour) tourByPath[String(it.path || "").replace(/[?#].*$/, "")] = it.props.tour; });
//   const tourOf = (it) => it.props?.tour || tourByPath[String(it.path || "").replace(/[?#].*$/, "")] || "";
//   const extraProps = (pr) => Object.entries(pr || {}).filter(([pk]) => pk !== "tour").map(([pk, pv]) => `${pk}: ${pv}`).join(" · ");

//   return (
//     <div className="fixed inset-0 z-[60] flex justify-end bg-black/40" onClick={onClose} role="dialog" aria-modal="true" aria-label="Visitor journey">
//       <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
//         <div className="flex items-start justify-between gap-3 border-b border-[#EEF2EF] px-5 py-4">
//           <div>
//             <h2 className="text-lg font-bold text-[#1B2B26]">{v ? whoName(v) : "Visitor"}</h2>
//             {v?.user && <p className="text-[12px] font-medium text-[#1E6FD9]">{whoSub(v.user)} · {v.label}</p>}
//             {v && (
//               <p className="text-[12px] text-[#6B7F77]">
//                 {devList(v).length > 1
//                   ? `${devList(v).length} devices: ${devList(v).join("  |  ")}`
//                   : `${v.device} · ${v.browser} · ${v.os}${v.screen ? ` · ${v.screen}` : ""}`}
//                 {v.ip ? ` · ${v.ip}` : ""}
//               </p>
//             )}
//           </div>
//           <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-[#6B7F77] hover:bg-[#F4F7F5]"><X className="h-5 w-5" /></button>
//         </div>

//         <div className="flex-1 overflow-y-auto px-5 py-4">
//           {err && <p className="rounded-lg bg-[#FDECEC] px-3 py-2 text-sm text-[#B42318]">{err}</p>}
//           {!data && !err && <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#2E9E4F]" /></div>}
//           {v && (
//             <>
//               <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
//                 {[["Pages", v.views], ["Clicks", v.clicks], ["Events", v.events], ["Visits", v.sessions]].map(([k, n]) => (
//                   <div key={k} className="rounded-lg bg-[#F7F9F8] px-3 py-2">
//                     <p className="text-[11px] text-[#6B7F77]">{k}</p>
//                     <p className="text-lg font-bold tabular-nums text-[#1B2B26]">{num(n)}</p>
//                   </div>
//                 ))}
//               </div>
//               <div className="mb-4 space-y-1 text-[12px] text-[#4B5F57]">
//                 <p><b>First seen:</b> {timeLabel(v.firstAt)} · <b>Last seen:</b> {timeLabel(v.lastAt)} ({ago(v.lastAt)})</p>
//                 <p><b>Came from:</b> {v.source}{v.referrer ? <span className="text-[#8FA39B]"> · {v.referrer}</span> : null}</p>
//                 {v.isLoggedIn && <p className="inline-flex items-center gap-1 text-[#1E6FD9]"><LogIn className="h-3.5 w-3.5" /> Logged in on the website</p>}
//               </div>

//               {sessions.map((s, si) => (
//                 <div key={`${s.id}-${si}`} className="mb-5">
//                   <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#8FA39B]">
//                     Visit {si + 1} · {timeLabel(s.items[0].at)} · {s.items.length} actions{devList(v).length > 1 ? ` · ${s.items[0].device} · ${s.items[0].browser}` : ""}
//                   </p>
//                   <ol className="relative ml-2 border-l-2 border-[#EEF2EF]">
//                     {s.items.map((it, i) => {
//                       const k = kindOf(it);
//                       return (
//                         <li key={i} className="relative mb-3 pl-5">
//                           <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-white" style={{ background: k.dot }} />
//                           <div className="flex flex-wrap items-center gap-x-2 text-[13px]">
//                             <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${k.cls}`}>{k.label}</span>
//                             <span className="font-medium text-[#1B2B26]">{it.type === "click" || it.type === "event" ? it.name : prettyPage(it.path)}</span>
//                             <span className="text-[11px] text-[#8FA39B]">{clockLabel(it.at)}</span>
//                           </div>
//                           {(() => {
//                             const line = it.type === "click" || it.type === "event"
//                               ? `on ${prettyLine(it.path, tourOf(it))}`
//                               : [tourOf(it), utmText(it.path)].filter(Boolean).join(" · ");
//                             const more = extraProps(it.props);
//                             return (line || more) ? (
//                               <p className="text-[11px] text-[#6B7F77]" title={it.path}>
//                                 {line}{line && more ? " · " : ""}{more}
//                               </p>
//                             ) : null;
//                           })()}
//                         </li>
//                       );
//                     })}
//                   </ol>
//                 </div>
//               ))}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ═════════════════════════════ PAGE ═════════════════════════════
// const WebsiteTraffic = () => {
//   const [tab, setTab] = useState("overview");
//   const [range, setRange] = useState("today");
//   const [from, setFrom] = useState(istToday());
//   const [to, setTo] = useState(istToday());
//   const [who, setWho] = useState("guest");
//   const [kind, setKind] = useState("");
//   // Column wise filters (Visitors + Activity log + Overview ellaathukkum)
//   const EMPTY_F = { q: "", source: "", device: "", browser: "", page: "", event: "" };
//   const [f, setF] = useState(EMPTY_F);
//   const [qText, setQText] = useState("");
//   useEffect(() => {
//     const t = setTimeout(() => setF((p) => (p.q === qText.trim() ? p : { ...p, q: qText.trim() })), 400);
//     return () => clearTimeout(t);
//   }, [qText]);
//   const fKey = JSON.stringify(f);
//   const fParams = useMemo(() => Object.fromEntries(Object.entries(JSON.parse(fKey)).filter(([, v]) => v)), [fKey]);
//   // Backend ku anuppa: page filter → "path" (page = pagination number, adhu vera)
//   const qParams = useMemo(() => {
//     const o = { ...fParams };
//     if (o.page) { o.path = o.page; delete o.page; }
//     return o;
//   }, [fParams]);
//   const setCol = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
//   const [data, setData] = useState(null);
//   const [list, setList] = useState([]);
//   const [page, setPage] = useState(1);
//   const [visitors, setVisitors] = useState({ list: [], total: 0, page: 1, hasMore: false });
//   const [openVisitor, setOpenVisitor] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const reqId = useRef(0);
//   const visReq = useRef(0);

//   const dates = useMemo(() => {
//     const t = istToday();
//     if (range === "today") return { from: t, to: t };
//     if (range === "yesterday") { const y = shiftDay(t, -1); return { from: y, to: y }; }
//     if (range === "7") return { from: shiftDay(t, -6), to: t };
//     if (range === "30") return { from: shiftDay(t, -29), to: t };
//     return { from: from || t, to: to || t };
//   }, [range, from, to]);

//   // Live poll la "since" anuppum — pudhu data illana backend udane "unchanged" sollum (DB query illa, fast)
//   const repSince = useRef(null);
//   const visSince = useRef(null);
//   const load = useCallback(async (p = 1, quiet = false) => {
//     const id = ++reqId.current;
//     if (!quiet) setLoading(true);
//     if (!quiet) repSince.current = null;
//     setError("");
//     try {
//       const since = quiet && p === 1 ? repSince.current : null;
//       const { data: d } = await axios.get(`${API}/report`, { params: { from: dates.from, to: dates.to, who, kind, page: p, ...qParams, ...(since ? { since } : {}) }, headers: authHeaders() });
//       if (id !== reqId.current) return;
//       if (!d.success) throw new Error(d.message || "Could not load traffic");
//       if (d.unchanged) { setData((prev) => (prev ? { ...prev, live: d.live } : prev)); return; }
//       if (p === 1 && d.lastWrite) repSince.current = d.lastWrite;
//       setData(d);
//       setPage(p);
//       setList((prev) => (p === 1 ? d.list : [...prev, ...d.list]));
//     } catch (err) {
//       if (id === reqId.current) setError(err.response?.data?.message || err.message);
//     } finally {
//       if (id === reqId.current) setLoading(false);
//     }
//   }, [dates.from, dates.to, who, kind, qParams]);

//   const loadVisitors = useCallback(async (p = 1, quiet = false) => {
//     const id = ++visReq.current;
//     if (!quiet) visSince.current = null;
//     try {
//       const since = quiet && p === 1 ? visSince.current : null;
//       const { data: d } = await axios.get(`${API}/visitors`, { params: { from: dates.from, to: dates.to, who, page: p, ...qParams, ...(since ? { since } : {}) }, headers: authHeaders() });
//       if (id !== visReq.current || !d.success) return;
//       if (d.unchanged) {
//         const liveSet = new Set(d.liveIds || []);
//         setVisitors((prev) => ({ ...prev, list: prev.list.map((v) => ({ ...v, live: (v.devices || []).some((x) => liveSet.has(x.visitorId)) })) }));
//         return;
//       }
//       if (p === 1 && d.lastWrite) visSince.current = d.lastWrite;
//       setVisitors((prev) => ({ ...d, list: p === 1 ? d.list : [...prev.list, ...d.list] }));
//     } catch (err) {
//       if (id === visReq.current) setError(err.response?.data?.message || err.message);
//     }
//   }, [dates.from, dates.to, who, qParams]);

//   useEffect(() => { load(1); }, [load]);
//   useEffect(() => { loadVisitors(1); }, [loadVisitors]);
//   // LIVE: innaikku range la irundhaa 5 second ku oru thadava thaane update (refresh theva illa).
//   // Pazhaya dates (Yesterday / custom past) maaraadhu, so poll pannaadhu. Tab hide aanaa nirutthum.
//   const isLive = dates.to >= istToday();
//   useEffect(() => {
//     if (!isLive) return undefined;
//     const tick = () => {
//       if (typeof document !== "undefined" && document.hidden) return;
//       if (page === 1) load(1, true);
//       if (visitors.page === 1) loadVisitors(1, true);
//     };
//     const t = setInterval(tick, 5000);
//     const onVis = () => { if (!document.hidden) tick(); };
//     document.addEventListener("visibilitychange", onVis);
//     return () => { clearInterval(t); document.removeEventListener("visibilitychange", onVis); };
//   }, [isLive, load, loadVisitors, page, visitors.page]);

//   const totals = data?.totals || { views: 0, visitors: 0, sessions: 0, newVisitors: 0 };
//   const allDays = daysBetween(dates.from, dates.to);
//   const fieldCls = "h-9 rounded-lg border border-[#DCE5E0] bg-white px-3 text-sm text-[#1B2B26] outline-none focus:border-[#2E9E4F]";
//   const refresh = () => { load(1); loadVisitors(1); };
//   const colCount = Object.keys(fParams).length;
//   const hasFilters = range !== "today" || who !== "guest" || kind !== "" || colCount > 0 || qText !== "";
//   const clearCols = () => { setF(EMPTY_F); setQText(""); };
//   const clearFilters = () => { setRange("today"); setFrom(istToday()); setTo(istToday()); setWho("guest"); setKind(""); clearCols(); };

//   // Column filter controls
//   // Backend options illana (pazhaya controller), charts data la irundhu edukkum
//   const keysOf = (rows) => (rows || []).map((r) => r.key).filter(Boolean);
//   const opts = data?.options || {
//     sources: keysOf(data?.sources), devices: keysOf(data?.devices), browsers: keysOf(data?.browsers),
//     pages: (data?.pages || []).map((r) => ({ path: r.key || "/", title: r.title || "", views: r.views })),
//     events: keysOf(data?.events),
//   };
//   const colCls = "h-8 w-full min-w-0 rounded-md border border-[#DCE5E0] bg-white px-1.5 text-[11px] font-normal normal-case tracking-normal text-[#1B2B26] outline-none focus:border-[#7C3AED]";
//   const onCls = "border-[#7C3AED] bg-[#F5F3FF] text-[#5B21B6] font-semibold";
//   const sel = (k, list, all, label, render) => (
//     <select aria-label={label} value={f[k]} onChange={setCol(k)} className={`${colCls} ${f[k] ? onCls : ""}`}>
//       <option value="">{all}</option>
//       {f[k] && !(list || []).some((x) => (typeof x === "string" ? x : x.path) === f[k]) && <option value={f[k]}>{f[k]}</option>}
//       {(list || []).map((x) => typeof x === "string"
//         ? <option key={x} value={x}>{x}</option>
//         : <option key={x.path} value={x.path}>{render ? render(x) : x.path}</option>)}
//     </select>
//   );
//   const C = {
//     search: (
//       <div className="relative">
//         <Search className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#8FA39B]" />
//         <input aria-label="Search name, email, phone or visitor ID" value={qText} onChange={(e) => setQText(e.target.value)}
//           placeholder="Name, email, phone, ID" className={`${colCls} pl-5 ${qText ? onCls : ""}`} />
//       </div>
//     ),
//     page: sel("page", opts.pages, "All pages", "Filter by page", (x) => `${pageName(x.path, x.title)} (${x.views})`),
//     event: sel("event", opts.events, "All stage events", "Filter by stage event"),
//     source: sel("source", opts.sources, "All sources", "Filter by source"),
//     device: sel("device", opts.devices, "All devices", "Filter by device"),
//     browser: sel("browser", opts.browsers, "All browsers", "Filter by browser"),
//     kind: (
//       <select aria-label="Filter by type" value={kind} onChange={(e) => setKind(e.target.value)} className={`${colCls} ${kind ? onCls : ""}`}>
//         {KINDS.map((k) => <option key={k.key} value={k.key}>{k.key ? k.label : "All types"}</option>)}
//       </select>
//     ),
//     clear: colCount > 0 || qText ? (
//       <button type="button" onClick={clearCols} className="inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-[11px] font-semibold normal-case tracking-normal text-[#B42318] hover:bg-[#FDECEC]">
//         <X className="h-3 w-3" /> Clear
//       </button>
//     ) : null,
//   };
//   const clr = (...ks) => () => { setF((p) => { const n = { ...p }; ks.forEach((k) => { n[k] = ""; }); return n; }); if (ks.includes("q")) setQText(""); };
//   const FILTER_LABEL = { q: "Search", source: "Source", device: "Device", browser: "Browser", page: "Page", event: "Stage event" };
//   const closeJourney = useCallback(() => setOpenVisitor(""), []);

//   return (
//     <div className="min-h-screen bg-[#F4F7F5] p-3 sm:p-6">
//       <div className="mx-auto max-w-7xl">
//         {/* Header */}
//         <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
//           <div>
//             <h1 className="text-2xl font-bold text-[#1B2B26]">Website Traffic</h1>
//             <p className="text-sm text-[#6B7F77]">Customer visits on gvtourplanners.com</p>
//           </div>
//           <button type="button" onClick={refresh} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#2E9E4F] px-4 text-sm font-semibold text-white hover:bg-[#27884A]">
//             {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh
//           </button>
//         </div>

//         {/* Filters — date + visitor type (column filters Visitors / Activity table la) */}
//         <section className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#DCE5E0] bg-white p-3">
//           <select aria-label="Date range" value={range} onChange={(e) => setRange(e.target.value)} className={fieldCls}>
//             {RANGES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
//           </select>
//           {range === "custom" && (
//             <>
//               <label className="flex items-center gap-1 text-xs text-[#6B7F77]">From
//                 <input type="date" value={from} max={to || istToday()} onChange={(e) => setFrom(e.target.value)} className={fieldCls} />
//               </label>
//               <label className="flex items-center gap-1 text-xs text-[#6B7F77]">To
//                 <input type="date" value={to} min={from || undefined} max={istToday()} onChange={(e) => setTo(e.target.value)} className={fieldCls} />
//               </label>
//             </>
//           )}
//           <select aria-label="Visitor type" value={who} onChange={(e) => setWho(e.target.value)} className={fieldCls}>
//             {WHO.map((w) => <option key={w.key} value={w.key}>{w.label}</option>)}
//           </select>
//           {hasFilters && (
//             <button type="button" onClick={clearFilters} className="inline-flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-[#B42318] hover:bg-[#FDECEC]">
//               <X className="h-4 w-4" /> Clear filters
//             </button>
//           )}
//           {Object.entries(fParams).map(([k, v]) => (
//             <span key={k} className="inline-flex h-7 items-center gap-1 rounded-full border border-[#DDD6FE] bg-[#F5F3FF] pl-2.5 pr-1 text-[11px] text-[#5B21B6]">
//               <Filter className="h-3 w-3" /> {FILTER_LABEL[k]}: <b className="max-w-[140px] truncate">{k === "page" ? pageName(v) : v}</b>
//               <button type="button" aria-label={`Remove ${FILTER_LABEL[k]} filter`} onClick={() => { setF((p) => ({ ...p, [k]: "" })); if (k === "q") setQText(""); }}
//                 className="rounded-full p-0.5 hover:bg-[#EDE9FE]"><X className="h-3 w-3" /></button>
//             </span>
//           ))}
//           <span className="ml-auto text-xs text-[#8FA39B]">
//             {dates.from === dates.to ? dayLabel(dates.from) : `${dayLabel(dates.from)} – ${dayLabel(dates.to)}`}
//             {isLive
//               ? <span className="ml-1 inline-flex items-center gap-1 font-semibold text-[#2E9E4F]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2E9E4F]" />LIVE</span>
//               : " · saved data"}
//           </span>
//         </section>

//         {error && <p className="mb-4 rounded-lg bg-[#FDECEC] px-3 py-2 text-sm text-[#B42318]">{error}</p>}

//         {/* Stats */}
//         <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
//           <div className="col-span-2 rounded-xl border border-[#BFE3CB] bg-[#E7F6EC] px-4 py-3 md:col-span-1">
//             <div className="flex items-center gap-2 text-[12px] text-[#0F7A5A]">
//               <span className="relative flex h-2.5 w-2.5">
//                 <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2E9E4F] opacity-60" />
//                 <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#2E9E4F]" />
//               </span>
//               Live now
//             </div>
//             <p className="mt-1 text-2xl font-bold tabular-nums text-[#0F7A5A]">{num(data?.live)}</p>
//             <p className="text-[11px] text-[#4B5F57]">on the website right now</p>
//           </div>
//           <Stat icon={Users} label="Visitors" value={num(totals.visitors)} sub={[
//             "unique people",
//             totals.devices && totals.devices > totals.visitors ? `${num(totals.devices)} devices` : "",
//             allDays.length > 1 ? `avg ${String(+((data?.daily || []).filter((r) => allDays.includes(r.day)).reduce((a, r) => a + (r.visitors || 0), 0) / allDays.length).toFixed(1))}/day` : "",
//           ].filter(Boolean).join(" · ")} />
//           <Stat icon={Eye} label="Page views" value={num(totals.views)} sub={totals.visitors ? `${(totals.views / totals.visitors).toFixed(1)} pages per visitor` : ""} />
//           <Stat icon={UserPlus} label="New visitors" value={num(totals.newVisitors)} sub={`${num(Math.max(0, totals.visitors - totals.newVisitors))} returning`} tone="text-[#1E6FD9]" />
//           <Stat icon={Activity} label="Visits" value={num(totals.sessions)} sub="browsing sessions" />
//         </div>

//         {/* Tabs */}
//         <div role="tablist" className="mb-4 inline-flex rounded-lg border border-[#DCE5E0] bg-white p-1">
//           {[["overview", "Overview"], ["visitors", `Visitors${visitors.total ? ` (${num(visitors.total)})` : ""}`], ["activity", "Activity log"]].map(([k, l]) => (
//             <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
//               className={`rounded-md px-4 py-1.5 text-sm font-semibold ${tab === k ? "bg-[#2E9E4F] text-white" : "text-[#4B5F57] hover:bg-[#F4F7F5]"}`}>
//               {l}
//             </button>
//           ))}
//         </div>

//         {/* ═══ Overview ═══ */}
//         {tab === "overview" && (
//           <>
//             <div className="mb-4 grid gap-3 lg:grid-cols-3">
//               <Card title={allDays.length > 1 ? "Visitors & page views per day" : "Today by hour"} className="lg:col-span-2">
//                 {allDays.length > 1 ? <DailyChart days={allDays} rows={data?.daily || []} /> : <HourChart rows={data?.hourly || []} />}
//               </Card>
//               <Card title="Where they came from"><Donut rows={data?.sources || []} label="views" colorOf={(k) => SOURCE_COLOR[k]} /></Card>
//             </div>
//             <div className="mb-4 grid gap-3 lg:grid-cols-3">
//               {allDays.length > 1 && <Card title="Busiest hours (all days)" className="lg:col-span-3"><HourChart rows={data?.hourly || []} /></Card>}
//               <Card title="Devices">
//                 <PieChart rows={data?.devices || []} icon={(k) => DEVICE_ICON[k] || Monitor} />
//               </Card>
//               <Card title="Browsers" className="lg:col-span-2"><BarChart rows={data?.browsers || []} /></Card>
//             </div>
//             <div className="mb-4 grid gap-3 lg:grid-cols-3">
//               <Card title="Top pages"><PageBars rows={data?.pages || []} /></Card>
//               <Card title="Top button / link clicks"><Lollipop rows={data?.clicks || []} /></Card>
//               <Card title="Stage events"><Funnel rows={data?.events || []} /></Card>
//             </div>
//           </>
//         )}

//         {/* ═══ Visitors ═══ */}
//         {tab === "visitors" && (
//           <Card title="Visitors" right={<span className="hidden text-[11px] text-[#8FA39B] sm:inline">Click a visitor to see everything they did</span>}>
//             {/* Mobile filters */}
//             <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-3 xl:hidden">
//               <div className="col-span-2">{C.search}</div>
//               {C.page}{C.source}{C.device}{C.browser}{C.event}{C.clear}
//             </div>
//             {(
//               <>
//                 {/* Desktop table */}
//                 <div className="hidden xl:block">
//                   <table className="w-full table-fixed text-left text-[13px]">
//                     <thead className="bg-[#F7F9F8] text-[11px] uppercase tracking-wide text-[#6B7F77]">
//                       <tr>
//                         <th className="w-[190px] px-3 py-2 font-semibold"><ColHead label="Visitor" active={!!qText} onClear={clr("q")}>{C.search}</ColHead></th>
//                         <th className="px-3 py-2 font-semibold"><ColHead label="Last page" title="Visited page / stage event" active={!!(f.page || f.event)} onClear={clr("page", "event")}>{C.page}{C.event}</ColHead></th>
//                         <th className="w-[110px] px-3 py-2 font-semibold"><ColHead label="Source" active={!!f.source} onClear={clr("source")}>{C.source}</ColHead></th>
//                         <th className="w-[150px] px-3 py-2 font-semibold"><ColHead label="Device" active={!!(f.device || f.browser)} onClear={clr("device", "browser")}>{C.device}{C.browser}</ColHead></th>
//                         <th className="w-[60px] px-3 py-2 text-right font-semibold">Pages</th>
//                         <th className="w-[60px] px-3 py-2 text-right font-semibold">Clicks</th>
//                         <th className="w-[55px] px-3 py-2 text-right font-semibold">Visits</th>
//                         <th className="w-[90px] px-3 py-2 font-semibold">Time spent</th>
//                         <th className="w-[105px] px-3 py-2 font-semibold">Last seen</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-[#EEF2EF]">
//                       {visitors.list.length === 0 && (
//                         <tr><td colSpan={9} className="px-3 py-10 text-center text-sm text-[#8FA39B]">No visitors match these filters.</td></tr>
//                       )}
//                       {visitors.list.map((v) => {
//                         const DI = DEVICE_ICON[v.device] || Monitor;
//                         return (
//                           <tr key={v.visitorId} onClick={() => setOpenVisitor(v.visitorId)} className="cursor-pointer hover:bg-[#F7F9F8]"
//                             tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") setOpenVisitor(v.visitorId); }}>
//                             <td className="px-3 py-2.5">
//                               <div className="flex items-center gap-2">
//                                 <span className={`h-2 w-2 shrink-0 rounded-full ${v.live ? "bg-[#2E9E4F]" : "bg-[#CBD5E1]"}`} title={v.live ? "Live now" : "Not active"} />
//                                 <span className="truncate font-semibold text-[#1B2B26]" title={v.label}>{whoName(v)}</span>
//                               </div>
//                               {v.user && <div className="truncate pl-4 text-[11px] text-[#1E6FD9]">{whoSub(v.user)}</div>}
//                               {v.linkedLater && <div className="pl-4 text-[10px] text-[#8FA39B]">Guest visits only · this customer logged in separately</div>}
//                               <div className="mt-0.5 flex flex-wrap gap-1 pl-4">
//                                 <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${v.firstVisit ? "bg-[#E8F1FD] text-[#1E6FD9]" : "bg-[#EEF3F0] text-[#4B5F57]"}`}>{v.firstVisit ? "New" : "Returning"}</span>
//                                 {v.isLoggedIn && <span className="rounded-full bg-[#EDE9FE] px-1.5 py-0.5 text-[10px] font-semibold text-[#5B21B6]">Logged in</span>}
//                               </div>
//                             </td>
//                             <td className="truncate px-3 py-2.5" title={v.lastPath}>
//                               <span className="text-[#1E6FD9]">{pageName(v.lastPath, v.lastTitle)}</span>
//                               {v.eventNames.length > 0 && <span className="block truncate text-[11px] text-[#6D28D9]">🚩 {v.eventNames.join(", ")}</span>}
//                             </td>
//                             <td className="px-3 py-2.5"><SourceCell v={v} /></td>
//                             <td className="truncate px-3 py-2.5 text-[#4B5F57]" title={devList(v).join("\n")}>
//                               {devList(v).length > 1
//                                 ? <span className="font-medium text-[#1E6FD9]"><Monitor className="mr-1 inline h-3.5 w-3.5" />{devList(v).length} devices</span>
//                                 : <><DI className="mr-1 inline h-3.5 w-3.5" />{v.device} · {v.browser}</>}
//                             </td>
//                             <td className="px-3 py-2.5 text-right tabular-nums">{v.views}</td>
//                             <td className="px-3 py-2.5 text-right tabular-nums">{v.clicks}</td>
//                             <td className="px-3 py-2.5 text-right tabular-nums">{v.sessions}</td>
//                             <td className="px-3 py-2.5 text-[#4B5F57]">{duration(v.durationSec)}</td>
//                             <td className="px-3 py-2.5 text-[#4B5F57]" title={timeLabel(v.lastAt)}>{v.live ? <span className="font-semibold text-[#2E9E4F]">Live</span> : ago(v.lastAt)}</td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//                 {/* Mobile cards */}
//                 {visitors.list.length === 0 && <div className="xl:hidden"><Empty text="No visitors match these filters." /></div>}
//                 <ul className="divide-y divide-[#EEF2EF] xl:hidden">
//                   {visitors.list.map((v) => {
//                     const DI = DEVICE_ICON[v.device] || Monitor;
//                     return (
//                       <li key={v.visitorId}>
//                         <button type="button" onClick={() => setOpenVisitor(v.visitorId)}
//                           className="flex w-full items-center gap-3 px-1 py-3 text-left hover:bg-[#F7F9F8]">
//                           <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF3F0]">
//                             <DI className="h-4 w-4 text-[#4B5F57]" />
//                             {v.live && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#2E9E4F]" title="Live now" />}
//                           </span>
//                           <span className="min-w-0 flex-1">
//                             <span className="flex flex-wrap items-center gap-x-2 text-[13px]">
//                               <b className="text-[#1B2B26]">{whoName(v)}</b>
//                               {v.user && <span className="text-[11px] text-[#1E6FD9]">{whoSub(v.user)}</span>}
//                               <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${v.firstVisit ? "bg-[#E8F1FD] text-[#1E6FD9]" : "bg-[#EEF3F0] text-[#4B5F57]"}`}>{v.firstVisit ? "New" : "Returning"}</span>
//                               {v.isLoggedIn && <span className="rounded-full bg-[#EDE9FE] px-1.5 py-0.5 text-[10px] font-semibold text-[#5B21B6]">Logged in</span>}
//                               {v.live && <span className="text-[11px] font-semibold text-[#2E9E4F]">● Live</span>}
//                             </span>
//                             <span className="block truncate text-[12px] text-[#4B5F57]">
//                               Last: {pageName(v.lastPath, v.lastTitle)} · {ago(v.lastAt)}
//                             </span>
//                             <span className="block text-[11px] text-[#8FA39B]">
//                               {sourceText(v)} · {devList(v).length > 1 ? `${devList(v).length} devices` : `${v.device} · ${v.browser}`}{v.ip ? ` · ${v.ip}` : ""} · <Clock className="inline h-3 w-3" /> {duration(v.durationSec)}
//                               {v.eventNames.length ? ` · ${v.eventNames.join(", ")}` : ""}
//                             </span>
//                           </span>
//                           <span className="hidden shrink-0 gap-3 text-center text-[11px] text-[#6B7F77] sm:flex">
//                             <span><b className="block text-sm text-[#1B2B26]">{v.views}</b>pages</span>
//                             <span><b className="block text-sm text-[#1B2B26]">{v.clicks}</b>clicks</span>
//                             <span><b className="block text-sm text-[#1B2B26]">{v.sessions}</b>visits</span>
//                           </span>
//                           <ChevronRight className="h-4 w-4 shrink-0 text-[#8FA39B]" />
//                         </button>
//                       </li>
//                     );
//                   })}
//                 </ul>
//                 {visitors.hasMore && (
//                   <div className="pt-3 text-center">
//                     <button type="button" onClick={() => loadVisitors(visitors.page + 1)} className="rounded-lg border border-[#DCE5E0] px-4 py-2 text-sm font-semibold text-[#1B2B26] hover:bg-[#F7F9F8]">Load more</button>
//                   </div>
//                 )}
//               </>
//             )}
//           </Card>
//         )}

//         {/* ═══ Activity log ═══ */}
//         {tab === "activity" && (
//           <section className="rounded-xl border border-[#DCE5E0] bg-white">
//             <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEF2EF] px-4 py-3">
//               <h3 className="text-sm font-semibold text-[#1B2B26]">Activity log</h3>
//             </div>
//             <div className="grid grid-cols-2 gap-2 border-b border-[#EEF2EF] p-3 md:grid-cols-3 xl:hidden">
//               <div className="col-span-2">{C.search}</div>
//               {C.kind}{C.page}{C.event}{C.source}{C.device}{C.browser}{C.clear}
//             </div>
//             {(
//               <>
//               <div className="hidden xl:block">
//                 <table className="w-full table-fixed text-left text-[13px]">
//                   <thead className="bg-[#F7F9F8] text-[11px] uppercase tracking-wide text-[#6B7F77]">
//                     <tr>
//                       <th className="w-[140px] px-4 py-2 font-semibold">Time</th>
//                       <th className="w-[90px] px-4 py-2 font-semibold"><ColHead label="Type" active={!!kind} onClear={() => setKind("")}>{C.kind}</ColHead></th>
//                       <th className="px-4 py-2 font-semibold"><ColHead label="Page / action" title="Page / stage event" active={!!(f.page || f.event)} onClear={clr("page", "event")}>{C.page}{C.event}</ColHead></th>
//                       <th className="w-[130px] px-4 py-2 font-semibold"><ColHead label="Visitor" active={!!qText} onClear={clr("q")}>{C.search}</ColHead></th>
//                       <th className="w-[110px] px-4 py-2 font-semibold"><ColHead label="Source" active={!!f.source} onClear={clr("source")} align="right">{C.source}</ColHead></th>
//                       <th className="w-[150px] px-4 py-2 font-semibold"><ColHead label="Device" active={!!(f.device || f.browser)} onClear={clr("device", "browser")} align="right">{C.device}{C.browser}</ColHead></th>
//                       <th className="w-[100px] px-4 py-2 font-semibold">IP</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-[#EEF2EF]">
//                     {list.length === 0 && !loading && (
//                       <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-[#8FA39B]">No activity matches these filters.</td></tr>
//                     )}
//                     {list.map((v) => {
//                       const k = kindOf(v);
//                       const isAct = v.type === "click" || v.type === "event";
//                       return (
//                         <tr key={v._id} onClick={() => setOpenVisitor(v.visitorId)} className="cursor-pointer hover:bg-[#F7F9F8]"
//                           tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") setOpenVisitor(v.visitorId); }}>
//                           <td className="px-4 py-2 text-[#1B2B26]">{timeLabel(v.at)}</td>
//                           <td className="px-4 py-2"><span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${k.cls}`}>{k.label}</span></td>
//                           <td className="truncate px-4 py-2" title={isAct ? `${v.name} — on ${v.path}` : v.path}>
//                             <span className="text-[#1E6FD9]">{isAct ? v.name : pageName(v.path, v.title)}</span>
//                             {(isAct || utmText(v.path) || v.props?.tour) && <span className="text-[11px] text-[#8FA39B]"> · {isAct ? `on ${prettyLine(v.path, v.props?.tour)}` : prettyLine(v.path, v.props?.tour).replace(/^[^·]*·?\s*/, "")}</span>}
//                           </td>
//                           <td className="truncate px-4 py-2 text-[#4B5F57]">{v.user?.name ? <span className="font-medium text-[#1B2B26]">{v.user.name}</span> : `Visitor ${String(v.visitorId || "").replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase()}`}</td>
//                           <td className="truncate px-4 py-2">{v.source}</td>
//                           <td className="truncate px-4 py-2 text-[#4B5F57]">{v.device} · {v.browser}</td>
//                           <td className="px-4 py-2 text-[#8FA39B]">{v.ip || "—"}</td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//               {list.length === 0 && !loading && <div className="xl:hidden"><Empty text="No activity matches these filters." /></div>}
//               <ul className="divide-y divide-[#EEF2EF] xl:hidden">
//                 {list.map((v) => {
//                   const k = kindOf(v);
//                   return (
//                     <li key={v._id}>
//                       <button type="button" onClick={() => setOpenVisitor(v.visitorId)} className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-[#F7F9F8]">
//                         <span className={`mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${k.cls}`}>{k.label}</span>
//                         <span className="min-w-0 flex-1 text-[13px]">
//                           <span className="block truncate text-[#1B2B26]">{v.type === "click" || v.type === "event" ? v.name : pageName(v.path, v.title)}</span>
//                           <span className="block truncate text-[11px] text-[#8FA39B]">
//                             {v.type === "click" || v.type === "event" ? `on ${prettyLine(v.path, v.props?.tour)}` : prettyLine(v.path, v.props?.tour)} · {v.source} · {v.device} · {v.browser}
//                           </span>
//                         </span>
//                         <span className="shrink-0 text-right text-[11px] text-[#6B7F77]">{timeLabel(v.at)}</span>
//                       </button>
//                     </li>
//                   );
//                 })}
//               </ul>
//               </>
//             )}
//             {data?.hasMore && (
//               <div className="border-t border-[#EEF2EF] p-3 text-center">
//                 <button type="button" onClick={() => load(page + 1)} disabled={loading} className="rounded-lg border border-[#DCE5E0] px-4 py-2 text-sm font-semibold text-[#1B2B26] hover:bg-[#F7F9F8] disabled:opacity-50">
//                   {loading ? "Loading…" : "Load more"}
//                 </button>
//               </div>
//             )}
//           </section>
//         )}

//         <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[#8FA39B]">
//           <Globe className="h-3.5 w-3.5" /> IP addresses are partly hidden. Bots and crawlers are not counted. Guests are anonymous (each browser gets its own visitor ID). Logged-in customers show their name.
//         </p>
//       </div>

//       <JourneyDrawer visitorId={openVisitor} onClose={closeJourney} />
//     </div>
//   );
// };

// export default WebsiteTraffic;


// ════════════════════════════════════════════════════════════════
//  WebsiteTraffic.jsx — gvtourplanners.com customer visits
//  Overview: cards + charts (daily, hour-wise, source, device) + top pages / clicks / stage events
//  Visitors: ovvoru visitor um thani row → click pannaa avanga journey (enna paarthaanga, enna click pannaanga)
//  Admin login + "Website Traffic" tab kudutha staff.
//  API: /api/touradmin/traffic/report | /visitors | /visitor/:id
// ════════════════════════════════════════════════════════════════
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  RefreshCw, Loader2, Globe, Users, Eye, UserPlus, Activity, Smartphone, Monitor, Tablet,
  MousePointerClick, Flag, X, ChevronRight, Clock, LogIn, Search, Filter,
} from "lucide-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
const API = `${BACKEND}/api/touradmin/traffic`;

// ─── helpers ───
const istToday = () => new Date(Date.now() + 5.5 * 36e5).toISOString().slice(0, 10);
const shiftDay = (key, n) => {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const daysBetween = (a, b) => {
  const out = [];
  for (let k = a; k <= b && out.length < 400; k = shiftDay(k, 1)) out.push(k);
  return out;
};
const dayLabel = (key) => {
  const d = new Date(`${key}T00:00:00`);
  return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleDateString("en-IN", { month: "short" })}`;
};
const timeLabel = (iso) =>
  new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
const clockLabel = (iso) => new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
const hourLabel = (h) => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "am" : "pm"}`;
const num = (n) => Number(n || 0).toLocaleString("en-IN");
const ago = (iso) => {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return `${Math.floor(s / 86400)} days ago`;
};
const duration = (sec) => {
  if (!sec) return "under 1 min";
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} hr ${m % 60} min`;
};
// "/tour-details/6a7d…" → page title illana readable path
// Page per — "/booking/6a7d…" → "Booking", "/my-trolly" → "My Trolly", "/" → "Home" (utm / id ellaam thookkidum)
const PAGE_NAMES = { "": "Home", booking: "Booking", "tour-details": "Tour details", tours: "Tours", tour: "Tour", contact: "Contact", about: "About", login: "Login", enquiry: "Enquiry", "my-trolly": "My Trolly", "my-bookings": "My Bookings", "my-profile": "My Profile" };
const prettyPage = (path) => {
  const clean = String(path || "/").replace(/[?#].*$/, "");
  const parts = clean.split("/").filter(Boolean).filter((x) => !/^[a-f0-9]{24}$/i.test(x) && !/^\d+$/.test(x));
  if (!parts.length) return "Home";
  return parts.map((x) => PAGE_NAMES[x.toLowerCase()] || x.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())).join(" › ");
};
// "?utm_source=facebook&utm_campaign=diwali" → "from facebook (diwali)"
const utmText = (path) => {
  try {
    const q = new URLSearchParams(String(path || "").split("?")[1] || "");
    const src = q.get("utm_source");
    if (!src) return "";
    const camp = q.get("utm_campaign");
    return `from ${src}${camp ? ` (${camp})` : ""}`;
  } catch { return ""; }
};
const pageName = (path, title) => {
  const t = String(title || "").replace(/\s*[|–-]\s*GV.*$/i, "").trim();
  if (t && !/^gv\s*-?\s*tour planners$/i.test(t)) return t;
  return prettyPage(path);
};
// Clean line: "Booking · HAMPI TOUR · from facebook (diwali)"
const prettyLine = (path, tour) => [prettyPage(path), tour, utmText(path)].filter(Boolean).join(" · ");

// Login aana customer na per, illana "Visitor A1B2C3"
const whoName = (v) => v?.user?.name || v?.label || "Visitor";
const sourceText = (v) => {
  const list = v.sources?.length ? v.sources : [v.source];
  return list.length > 1 ? `${list[0]} +${list.length - 1} more` : list[0] || "Direct";
};
const SourceCell = ({ v }) => {
  const list = v.sources?.length ? v.sources : [v.source || "Direct"];
  return (
    <div title={list.join(", ")}>
      <div className="truncate">{list[0]}</div>
      {list.length > 1 && <div className="truncate text-[11px] text-[#8FA39B]">+ {list.slice(1).join(", ")}</div>}
    </div>
  );
};
// Real device list: Desktop · Chrome rendu browser ID irundhaalum ore device thaan
const devList = (v) => [...new Set((v?.devices || []).map((d) => (typeof d === "string" ? d : `${d.device} · ${d.browser}`)))];
const whoSub = (u) => (u ? [u.email, u.phone].filter(Boolean).join(" · ") : "");

const RANGES = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7", label: "Last 7 days" },
  { key: "30", label: "Last 30 days" },
  { key: "custom", label: "Custom" },
];
const WHO = [
  { key: "guest", label: "Guests (not logged in)" },
  { key: "loggedIn", label: "Logged-in customers" },
  { key: "all", label: "Everyone" },
];
const KINDS = [
  { key: "", label: "Everything" },
  { key: "pageview", label: "Page views" },
  { key: "click", label: "Clicks" },
  { key: "event", label: "Stage events" },
];
const KIND = {
  pageview: { label: "View", cls: "bg-[#EEF3F0] text-[#4B5F57]", dot: "#64748B", Icon: Eye },
  click: { label: "Click", cls: "bg-[#FEF3C7] text-[#92400E]", dot: "#D97706", Icon: MousePointerClick },
  event: { label: "Event", cls: "bg-[#EDE9FE] text-[#5B21B6]", dot: "#7C3AED", Icon: Flag },
};
const kindOf = (v) => KIND[v.type] || KIND.pageview;
const DEVICE_ICON = { Mobile: Smartphone, Desktop: Monitor, Tablet };
const PALETTE = ["#2E9E4F", "#1E6FD9", "#D97706", "#7C3AED", "#DB2777", "#0891B2", "#65A30D", "#94A3B8"];

const authHeaders = () => {
  let aToken = null;
  try { aToken = localStorage.getItem("aToken"); } catch { /* */ }
  return aToken ? { atoken: aToken, aToken } : {};
};

// ─── small UI pieces ───
const Card = ({ title, right, children, className = "" }) => (
  <section className={`min-w-0 rounded-xl border border-[#DCE5E0] bg-white p-4 ${className}`}>
    {(title || right) && (
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#1B2B26]">{title}</h3>
        {right}
      </div>
    )}
    {children}
  </section>
);

// Table header + funnel icon → click panna filter popup
const ColHead = ({ label, title, active, children, align = "left", onClear }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);
  return (
    <div ref={ref} className="relative inline-flex items-center gap-1.5 whitespace-nowrap">
      <span>{label}</span>
      <button type="button" aria-label={`Filter ${label}`} aria-expanded={open} onClick={() => setOpen((o) => !o)}
        className={`rounded p-0.5 transition ${active ? "bg-[#EDE9FE] text-[#6D28D9]" : "text-[#9CA3AF] hover:bg-[#EEF2EF] hover:text-[#4B5F57]"}`}>
        <Filter className="h-3.5 w-3.5" fill={active ? "currentColor" : "none"} />
      </button>
      {open && (
        <div className={`absolute top-full z-30 mt-2 flex w-64 flex-col gap-2 rounded-xl border border-[#E5E7EB] bg-white p-3 text-[12px] font-normal normal-case tracking-normal text-[#1B2B26] shadow-xl ${align === "right" ? "right-0" : "left-0"}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7F77]">{title || `Filter by ${label.toLowerCase()}`}</p>
          <div className="flex w-full flex-col gap-2 [&>*]:w-full">{children}</div>
          {active && onClear && (
            <button type="button" onClick={() => { onClear(); setOpen(false); }} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B42318] hover:underline">
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const Stat = ({ icon: Icon, label, value, sub, tone }) => (
  <div className="rounded-xl border border-[#DCE5E0] bg-white px-4 py-3">
    <div className="flex items-center gap-2 text-[12px] text-[#6B7F77]"><Icon className="h-4 w-4" aria-hidden="true" /> {label}</div>
    <p className={`mt-1 text-2xl font-bold tabular-nums ${tone || "text-[#1B2B26]"}`}>{value}</p>
    {sub && <p className="text-[11px] text-[#8FA39B]">{sub}</p>}
  </div>
);

const Empty = ({ text = "No data yet" }) => <p className="py-6 text-center text-xs text-[#8FA39B]">{text}</p>;

// Line / area chart — visitors + page views per day
const DailyChart = ({ days, rows }) => {
  const [hover, setHover] = useState(null);
  const gid = useGid("day");
  const byDay = Object.fromEntries(rows.map((r) => [r.day, r]));
  const data = days.map((d) => ({ day: d, views: byDay[d]?.views || 0, visitors: byDay[d]?.visitors || 0 }));
  // Card width ku etha maadhiri chart (swipe / scroll illa) — mobile, tab, desktop ellaathukkum
  const boxRef = useRef(null);
  const [boxW, setBoxW] = useState(640);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const set = () => setBoxW(Math.max(260, Math.round(el.clientWidth)));
    set();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(set) : null;
    ro?.observe(el);
    window.addEventListener("resize", set);
    return () => { ro?.disconnect(); window.removeEventListener("resize", set); };
  }, []);
  const W = boxW;
  const slotGuess = (W - 42) / Math.max(1, days.length);
  // 14 naal ku mela: ore bar (views) ulla visitors, idaiveli vittu, date 3-4 naal ku oru thadava (nera)
  const area = days.length > 14;
  const many = !area && slotGuess < 46; // 7 naal, chinna screen: saanja label
  const H = many ? 250 : 230, P = { l: 34, r: 12, t: 26, b: many ? 48 : 28 };
  const labelEvery = area ? Math.max(1, Math.ceil(62 / slotGuess)) : many ? Math.max(1, Math.ceil(16 / slotGuess)) : 1;
  const max = Math.max(4, ...data.map((d) => d.views));
  const nice = Math.ceil(max / 4) * 4;
  const ticks = [0, 1, 2, 3, 4].map((k) => (nice / 4) * k);
  const slot = (W - P.l - P.r) / data.length;
  const overlay = area || slot < 30; // neraya naal / chinna screen: visitors bar views bar ulla (clutter illa)
  const bw = overlay ? Math.max(3, Math.min(16, slot * 0.62)) : Math.max(2, Math.min(20, (slot - 6) / 2)); // side by side la rendu bar
  const y = (v) => H - P.b - (v / nice) * (H - P.t - P.b);
  const showVals = slot >= 34; // bar mela number idam irundhaa mattum
  const totV = data.reduce((a, d) => a + d.views, 0);
  // Average per day (range la ella naalum, data illaadha naal um serthu)
  const avgV = data.length ? totV / data.length : 0;
  const avgP = data.length ? data.reduce((a, d) => a + d.visitors, 0) / data.length : 0;
  const fmt1 = (n) => String(+n.toFixed(1));
  const best = data.reduce((a, d) => (d.views > a.views ? d : a), data[0] || { views: 0 });
  const h = hover !== null ? data[hover] : null;
  return (
    <div className="relative">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px]">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FDFA] px-2.5 py-1 font-semibold text-[#0F766E]"><span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-[#0D9488] to-[#5EEAD4]" /> Page views · {num(totV)}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF1F2] px-2.5 py-1 font-semibold text-[#BE123C]"><span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-[#E11D48] to-[#FB7185]" /> Visitors (per day)</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#94A3B8] px-2.5 py-1 font-semibold text-[#334155]">
          Avg / day: <span className="text-[#0F766E]">{fmt1(avgV)} views</span> · <span className="text-[#BE123C]">{fmt1(avgP)} visitors</span>
        </span>
        {best.views > 0 && <span className="ml-auto text-[#6B7280]">Best day: <b className="text-[#1F2937]">{dayLabel(best.day)}</b> ({best.views} views)</span>}
      </div>
      <div ref={boxRef} className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block" role="img" aria-label="Page views and visitors per day" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={`${gid}-v`} x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#0D9488" /><stop offset="100%" stopColor="#5EEAD4" /></linearGradient>
          <linearGradient id={`${gid}-p`} x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#E11D48" /><stop offset="100%" stopColor="#FB7185" /></linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="#EEF0F4" strokeDasharray={t ? "4 4" : ""} />
            <text x={P.l - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#9CA3AF">{t}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = P.l + slot * i + slot / 2;
          const on = hover === null || hover === i;
          const isToday = d.day === istToday();
          return (
            <g key={d.day} onMouseEnter={() => setHover(i)} style={{ cursor: "pointer" }}>
              {hover === i && <rect x={P.l + slot * i + 1} y={P.t - 18} width={slot - 2} height={H - P.t - P.b + 18} rx="6" fill="#F0FDFA" />}
              <rect x={P.l + slot * i} y={P.t - 18} width={slot} height={H - P.t - P.b + 18} fill="transparent" />
              {overlay ? (
                <>
                  {d.views > 0 && <rect x={cx - bw / 2} y={y(d.views)} width={bw} height={H - P.b - y(d.views)} rx={Math.min(4, bw / 2)} fill={`url(#${gid}-v)`} opacity={on ? 0.9 : 0.3} />}
                  {d.visitors > 0 && <rect x={cx - bw / 4} y={y(d.visitors)} width={bw / 2} stroke="#fff" strokeWidth="0.75" height={H - P.b - y(d.visitors)} rx={Math.min(3, bw / 4)} fill={`url(#${gid}-p)`} opacity={on ? 1 : 0.4} />}
                </>
              ) : (
                <>
                  {d.views > 0 && <rect x={cx - bw - 1} y={y(d.views)} width={bw} height={H - P.b - y(d.views)} rx={Math.min(5, bw / 2)} fill={`url(#${gid}-v)`} opacity={on ? 1 : 0.4} />}
                  {d.visitors > 0 && <rect x={cx + 1} y={y(d.visitors)} width={bw} height={H - P.b - y(d.visitors)} rx={Math.min(5, bw / 2)} fill={`url(#${gid}-p)`} opacity={on ? 1 : 0.4} />}
                </>
              )}
              {d.views === 0 && d.visitors === 0 && <circle cx={cx} cy={H - P.b - 3} r="2" fill="#E5E7EB" />}
              {showVals && d.views > 0 && <text x={cx - bw / 2 - 1} y={y(d.views) - 5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#0F766E">{d.views}</text>}
              {showVals && d.visitors > 0 && <text x={cx + bw / 2 + 1} y={y(d.visitors) - 5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#BE123C">{d.visitors}</text>}
              {!(i === data.length - 1 || isToday || (i % labelEvery === 0 && data.length - 1 - i >= labelEvery)) ? null : many ? (
                <text transform={`translate(${cx + 3} ${H - P.b + 12}) rotate(-45)`} textAnchor="end" fontSize="10" fontWeight={isToday ? "700" : "400"} fill={isToday ? "#0F766E" : "#6B7280"}>{isToday ? "Today" : dayLabel(d.day)}</text>
              ) : (
                <text x={cx} y={H - 9} textAnchor="middle" fontSize="10" fontWeight={isToday ? "700" : "400"} fill={isToday ? "#0F766E" : "#6B7280"}>{isToday ? "Today" : dayLabel(d.day)}</text>
              )}
            </g>
          );
        })}
        {/* Average lines */}
        {avgV > 0 && (
          <g pointerEvents="none">
            <line x1={P.l} x2={W - P.r} y1={y(avgV)} y2={y(avgV)} stroke="#0F766E" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.8" />
            <rect x={W - P.r - 66} y={y(avgV) - 17} width="64" height="15" rx="7.5" fill="#0F766E" />
            <text x={W - P.r - 34} y={y(avgV) - 6.5} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fff">avg {fmt1(avgV)}</text>
          </g>
        )}
        {avgP > 0 && (
          <g pointerEvents="none">
            <line x1={P.l} x2={W - P.r} y1={y(avgP)} y2={y(avgP)} stroke="#BE123C" strokeWidth="1.5" strokeDasharray="2 4" opacity="0.8" />
            <rect x={P.l + 2} y={y(avgP) - 17} width="64" height="15" rx="7.5" fill="#BE123C" />
            <text x={P.l + 34} y={y(avgP) - 6.5} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fff">avg {fmt1(avgP)}</text>
          </g>
        )}
      </svg>
      </div>
      {h && (
        <div className={`pointer-events-none absolute top-8 rounded-xl ${hover > data.length / 2 ? "left-10" : "right-2"}`} >
          <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] shadow-lg">
          <b className="block text-[12px] text-[#1F2937]">{dayLabel(h.day)}</b>
          <span className="text-[#0F766E]">● {h.views} page views</span><br />
          <span className="text-[#BE123C]">● {h.visitors} visitors</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Ovvoru hour um thani light (pastel) colour — 24 hours = colour wheel suthi
const hourHue = (h) => Math.round(h * 137.508 + 200) % 360; // pakkathu hours ku romba vera colour
const HOUR_GRAD = (h) => `linear-gradient(0deg, hsl(${hourHue(h)} 75% 72%), hsl(${hourHue(h)} 85% 86%))`;
// Hour-wise bars (0–23, IST) — eppo adhigam varraanga
const HourChart = ({ rows }) => {
  const byHour = Object.fromEntries(rows.map((r) => [r.hour, r]));
  const data = Array.from({ length: 24 }, (_, h) => ({ hour: h, views: byHour[h]?.views || 0, visitors: byHour[h]?.visitors || 0 }));
  const max = Math.max(1, ...data.map((d) => d.views));
  const peak = data.reduce((a, b) => (b.views > a.views ? b : a), data[0]);
  return (
    <div>
      <div className="flex h-36 items-end gap-[3px]">
        {data.map((d) => (
          <div key={d.hour} className="group relative flex h-full flex-1 flex-col justify-end">
            <div
              className="w-full rounded-t-md"
              style={{
                height: `${d.views ? Math.max(4, (d.views / max) * 100) : 2}%`,
                background: d.views ? HOUR_GRAD(d.hour) : "#EEF0F4",
                boxShadow: d.hour === peak.hour && d.views ? `0 0 0 2px #fff, 0 0 0 4px hsl(${hourHue(d.hour)} 70% 55%)` : "none",
              }}
            />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[#1B2B26] px-2 py-0.5 text-[10px] text-white group-hover:block">
              {hourLabel(d.hour)} · {d.views} views · {d.visitors} visitors
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-[#8FA39B]">
        {[0, 6, 12, 18, 23].map((h) => <span key={h}>{hourLabel(h)}</span>)}
      </div>
      {peak.views > 0 && <p className="mt-2 text-[11px] text-[#4B5F57]">Busiest hour: <b>{hourLabel(peak.hour)} – {hourLabel((peak.hour + 1) % 24)}</b> ({peak.views} views)</p>}
    </div>
  );
};

// Donut + legend (source / device)
const Donut = ({ rows, label = "views", icon, colorOf }) => {
  const col = (p, i) => (colorOf && colorOf(p.key)) || PALETTE[i % PALETTE.length];
  const total = rows.reduce((a, r) => a + r.views, 0);
  if (!total) return <Empty />;
  const R = 42, C = 2 * Math.PI * R;
  let off = 0;
  const top = rows.slice(0, 7);
  const rest = rows.slice(7).reduce((a, r) => a + r.views, 0);
  const parts = rest ? [...top, { key: "Others", views: rest }] : top;
  // Accurate percent, 1 decimal (66.7%, 8.3%). .0 na adha kaattaadhu (100%, 25%)
  const pct = parts.map((p) => String(+((p.views / total) * 100).toFixed(1)));
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <svg viewBox="0 0 110 110" className="h-28 w-28 shrink-0" role="img" aria-label={`Share of ${label}`}>
        <circle cx="55" cy="55" r={R} fill="none" stroke="#EEF2EF" strokeWidth="16" />
        {parts.map((p, i) => {
          const len = (p.views / total) * C;
          const el = (
            <circle key={p.key || i} cx="55" cy="55" r={R} fill="none" stroke={col(p, i)} strokeWidth="16"
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} transform="rotate(-90 55 55)" />
          );
          off += len;
          return el;
        })}
        <text x="55" y="52" textAnchor="middle" fontSize="16" fontWeight="700" fill="#1B2B26">{num(total)}</text>
        <text x="55" y="67" textAnchor="middle" fontSize="9" fill="#8FA39B">{label}</text>
      </svg>
      <ul className="min-w-[170px] flex-1 space-y-1.5">
        {parts.map((p, i) => {
          const I = icon ? icon(p.key) : null;
          return (
            <li key={p.key || i} className="flex items-center justify-between gap-2 text-[12px]">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: col(p, i) }} />
                {I && <I className="h-3.5 w-3.5 shrink-0 text-[#6B7F77]" />}
                <span className="truncate text-[#1B2B26]">{p.key || "—"}</span>
              </span>
              <span className="shrink-0 tabular-nums text-[#4B5F57]">{pct[i]}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// Chart colours — ovvoru chart um thani look
const GRAD = [
  ["#6366F1", "#A78BFA"], // indigo → violet
  ["#F97316", "#FBBF24"], // orange → amber
  ["#06B6D4", "#34D399"], // cyan → green
  ["#EC4899", "#F472B6"], // pink
  ["#0EA5E9", "#7DD3FC"], // sky
  ["#EF4444", "#FCA5A5"], // red
  ["#84CC16", "#BEF264"], // lime
  ["#64748B", "#CBD5E1"], // slate (Others)
];
const DEVICE_GRAD = { Desktop: GRAD[0], Mobile: GRAD[1], Tablet: GRAD[2] };
const BROWSER_GRAD = { Chrome: ["#2563EB", "#60A5FA"], Safari: ["#06B6D4", "#67E8F9"], Firefox: ["#EA580C", "#FDBA74"], Edge: ["#0D9488", "#5EEAD4"], Samsung: ["#7C3AED", "#C4B5FD"], Opera: ["#DC2626", "#FCA5A5"] };
// Source ku theriyura colour (Direct = grey, instagram = pink …)
const SOURCE_COLOR = { Direct: "#64748B", google: "#F59E0B", Google: "#F59E0B", instagram: "#E1306C", Instagram: "#E1306C", facebook: "#1877F2", Facebook: "#1877F2", whatsapp: "#22C55E", WhatsApp: "#22C55E", youtube: "#EF4444", YouTube: "#EF4444", linkedin: "#0A66C2", LinkedIn: "#0A66C2", Bing: "#0EA5E9", twitter: "#111827", X: "#111827" };
const useGid = (p) => useState(() => `${p}${Math.random().toString(36).slice(2, 8)}`)[0];

// Pie (Devices) — gradient slices, center la total
const PieChart = ({ rows, icon }) => {
  const gid = useGid("pie");
  const [hover, setHover] = useState(null);
  const total = rows.reduce((a, r) => a + r.views, 0);
  if (!total) return <Empty />;
  const parts = rows.slice(0, 6).map((r) => ({ ...r }));
  const rest = rows.slice(6).reduce((a, r) => a + r.views, 0);
  if (rest) parts.push({ key: "Others", views: rest, visitors: 0 });
  const gradOf = (k, i) => DEVICE_GRAD[k] || GRAD[i % GRAD.length];
  const cx = 80, cy = 80, R = 70;
  const pt = (a, r = R) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  const pct = (v) => String(+((v / total) * 100).toFixed(1));
  let start = 0;
  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 160 160" className="h-44 w-44 shrink-0 drop-shadow-[0_6px_14px_rgba(99,102,241,0.25)]" role="img" aria-label="Share of page views by device" onMouseLeave={() => setHover(null)}>
        <defs>
          {parts.map((p, i) => {
            const [c1, c2] = gradOf(p.key, i);
            return (
              <linearGradient key={i} id={`${gid}-${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
              </linearGradient>
            );
          })}
        </defs>
        {parts.map((p, i) => {
          const ang = (p.views / total) * Math.PI * 2;
          const fill = `url(#${gid}-${i})`;
          const mid = start + ang / 2;
          const push = hover === i && parts.length > 1 ? 5 : 0; // hover slice konjam veliya
          const dx = push * Math.sin(mid), dy = -push * Math.cos(mid);
          let el;
          if (ang >= Math.PI * 2 - 1e-6) el = <circle cx={cx} cy={cy} r={R} fill={fill} />;
          else {
            const [x1, y1] = pt(start), [x2, y2] = pt(start + ang);
            el = <path d={`M${cx},${cy} L${x1},${y1} A${R},${R} 0 ${ang > Math.PI ? 1 : 0} 1 ${x2},${y2} Z`} fill={fill} stroke="#fff" strokeWidth="2" />;
          }
          const [lx, ly] = pt(mid, R * 0.68);
          const g = (
            <g key={i} transform={`translate(${dx} ${dy})`} onMouseEnter={() => setHover(i)} style={{ cursor: "pointer", transition: "transform .15s" }}>
              <title>{`${p.key}: ${p.views} views (${pct(p.views)}%)`}</title>
              {el}
              {parts.length > 1 && ang > 0.45 && (
                <text x={lx} y={ly + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">{pct(p.views)}%</text>
              )}
            </g>
          );
          start += ang;
          return g;
        })}
        {/* naduvula white circle + total */}
        <circle cx={cx} cy={cy} r="30" fill="#fff" opacity="0.95" />
        <text x={cx} y={cy - 1} textAnchor="middle" fontSize="18" fontWeight="800" fill="#1E1B4B">{num(total)}</text>
        <text x={cx} y={cy + 13} textAnchor="middle" fontSize="9" fill="#6B7280">views</text>
      </svg>
      <ul className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {parts.map((p, i) => {
          const I = icon ? icon(p.key) : null;
          const [c1, c2] = gradOf(p.key, i);
          return (
            <li key={p.key || i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-[12px] transition ${hover === i ? "border-transparent shadow-md" : "border-[#EEF0F4]"}`}
              style={{ background: hover === i ? `linear-gradient(90deg, ${c1}18, ${c2}10)` : "#FAFAFC" }}>
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                  {I ? <I className="h-4 w-4" /> : null}
                </span>
                <span className="truncate font-semibold text-[#1B2B26]">{p.key || "—"}</span>
              </span>
              <span className="shrink-0 text-right tabular-nums">
                <span className="block text-[14px] font-bold" style={{ color: c1 }}>{pct(p.views)}%</span>
                <span className="block text-[10px] text-[#8FA39B]">{num(p.views)} views</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// Vertical bars (Browsers) — gradient bars, mela value badge, pinnaadi light track
const BarChart = ({ rows }) => {
  const gid = useGid("bar");
  const [hover, setHover] = useState(null);
  if (!rows.length) return <Empty />;
  const data = rows.slice(0, 8);
  const gradOf = (k, i) => BROWSER_GRAD[k] || GRAD[i % GRAD.length];
  const W = 560, H = 230, P = { l: 34, r: 10, t: 30, b: 34 };
  const max = Math.max(4, ...data.map((d) => d.views));
  const nice = Math.ceil(max / 4) * 4;
  const ticks = [0, 1, 2, 3, 4].map((k) => (nice / 4) * k);
  const slot = (W - P.l - P.r) / data.length;
  const bw = Math.min(64, slot * 0.55);
  const y = (v) => H - P.b - (v / nice) * (H - P.t - P.b);
  const totalViews = data.reduce((a, d) => a + d.views, 0);
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-60 w-full" role="img" aria-label="Page views by browser" onMouseLeave={() => setHover(null)}>
        <defs>
          {data.map((d, i) => {
            const [c1, c2] = gradOf(d.key, i);
            return (
              <linearGradient key={i} id={`${gid}-${i}`} x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
              </linearGradient>
            );
          })}
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="#EEF0F4" strokeDasharray={t ? "4 4" : ""} />
            <text x={P.l - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#9CA3AF">{t}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = P.l + slot * i + (slot - bw) / 2;
          const top = y(d.views);
          const [c1] = gradOf(d.key, i);
          const on = hover === null || hover === i;
          return (
            <g key={d.key || i} onMouseEnter={() => setHover(i)} style={{ cursor: "pointer" }}>
              <rect x={P.l + slot * i} y={P.t - 20} width={slot} height={H - P.t - P.b + 20} fill="transparent" />
              <rect x={x} y={P.t} width={bw} height={H - P.b - P.t} rx="10" fill={c1} opacity="0.07" />
              <rect x={x} y={top} width={bw} height={H - P.b - top} rx="10" fill={`url(#${gid}-${i})`} opacity={on ? 1 : 0.45} />
              <rect x={x + bw / 2 - 18} y={top - 24} width="36" height="18" rx="9" fill={c1} opacity={on ? 1 : 0.5} />
              <text x={x + bw / 2} y={top - 11} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">{d.views}</text>
              <text x={x + bw / 2} y={H - 14} textAnchor="middle" fontSize="12" fontWeight="600" fill="#374151">{d.key || "—"}</text>
              <text x={x + bw / 2} y={H - 2} textAnchor="middle" fontSize="9" fill="#9CA3AF">{String(+((d.views / totalViews) * 100).toFixed(1))}%</text>
            </g>
          );
        })}
      </svg>
      {hover !== null && data[hover] && (
        <div className="pointer-events-none absolute right-2 top-0 rounded-lg px-3 py-1.5 text-[11px] text-white shadow-lg" style={{ background: gradOf(data[hover].key, hover)[0] }}>
          <b>{data[hover].key}</b> · {data[hover].views} views · {data[hover].visitors} people
        </div>
      )}
    </div>
  );
};

// ─── Top pages: horizontal gradient bars, ovvoru row um thani colour + rank badge ───
const PageBars = ({ rows }) => {
  if (!rows.length) return <Empty />;
  const data = rows.slice(0, 8);
  const max = Math.max(1, ...data.map((r) => r.views));
  const COLS = [["#059669", "#6EE7B7"], ["#0284C7", "#7DD3FC"], ["#D97706", "#FCD34D"], ["#E11D48", "#FDA4AF"], ["#7C3AED", "#C4B5FD"], ["#0891B2", "#67E8F9"], ["#65A30D", "#BEF264"], ["#C026D3", "#F0ABFC"]];
  return (
    <ul className="space-y-2.5">
      {data.map((r, i) => {
        const [c1, c2] = COLS[i % COLS.length];
        const w = Math.max(4, (r.views / max) * 100);
        return (
          <li key={`${r.key}-${i}`} className="flex items-center gap-2.5" title={`${r.key} · ${r.views} views · ${r.visitors} people`}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
                <span className="truncate font-semibold text-[#1F2937]">{pageName(r.key, r.title)}</span>
                <span className="shrink-0 font-bold tabular-nums" style={{ color: c1 }}>{num(r.views)} <span className="font-normal text-[#9CA3AF]">views · {num(r.visitors)} {r.visitors === 1 ? "person" : "people"}</span></span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full" style={{ background: `${c1}14` }}>
                <div className="h-full rounded-full" style={{ width: `${w}%`, background: `linear-gradient(90deg, ${c1}, ${c2})` }} />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

// ─── Top clicks: horizontal lollipop — per idadhu pakkam full aa, neraya vandhaalum clean aa irukkum ───
const Lollipop = ({ rows }) => {
  const [all, setAll] = useState(false);
  if (!rows.length) return <Empty />;
  const COLS = ["#F97316", "#8B5CF6", "#06B6D4", "#EC4899", "#22C55E", "#EAB308", "#3B82F6", "#EF4444"];
  const max = Math.max(1, ...rows.map((d) => d.views));
  const data = all ? rows : rows.slice(0, 6);
  return (
    <div>
      <ul className="space-y-2.5">
        {data.map((d, i) => {
          const c = COLS[i % COLS.length];
          const w = Math.max(3, (d.views / max) * 100);
          return (
            <li key={`${d.key}-${i}`} className="group" title={`${d.key} · ${d.views} clicks · ${d.visitors} people`}>
              <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
                <span className="truncate font-medium text-[#1F2937]">{d.key || "—"}</span>
                <span className="shrink-0 text-[10px] text-[#9CA3AF]">{num(d.visitors)} {d.visitors === 1 ? "person" : "people"}</span>
              </div>
              <div className="relative flex h-5 items-center">
                <div className="absolute inset-x-0 h-px bg-[#EEF0F4]" />
                <div className="relative h-[3px] rounded-full" style={{ width: `calc(${w}% - 11px)`, background: c }} />
                <span className="relative -ml-px flex h-5 min-w-[22px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white shadow-sm ring-2 ring-white transition group-hover:scale-110" style={{ background: c }}>
                  {num(d.views)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      {rows.length > 6 && (
        <button type="button" onClick={() => setAll((v) => !v)} className="mt-3 text-[12px] font-semibold text-[#6D28D9] hover:underline">
          {all ? "Show less" : `Show all ${rows.length}`}
        </button>
      )}
    </div>
  );
};

// ─── Stage events: funnel (perusu → chinnadhu), ovvoru stage um thani colour ───
// Width max-w-md la nikkum, so wide screen / single stage la um stretch aagaadhu
const Funnel = ({ rows }) => {
  if (!rows.length) return <Empty />;
  const data = rows.slice(0, 6);
  const COLS = [["#C026D3", "#F0ABFC"], ["#EA580C", "#FDBA74"], ["#0891B2", "#67E8F9"], ["#16A34A", "#86EFAC"], ["#CA8A04", "#FDE047"], ["#4F46E5", "#A5B4FC"]];
  const top = Math.max(1, data[0].views);
  return (
    <div className="mx-auto w-full max-w-md space-y-1.5">
      {data.map((r, i) => {
        const [c1, c2] = COLS[i % COLS.length];
        const w = data.length === 1 ? 100 : 100 - (i * 36) / (data.length - 1);
        const conv = i > 0 ? Math.round((r.views / top) * 100) : null;
        return (
          <div key={`${r.key}-${i}`} className="flex justify-center" title={`${r.key} · ${r.views} times · ${r.visitors} people`}>
            <div className="flex min-h-[44px] items-center justify-between gap-2 px-5 py-1.5 text-white"
              style={{ width: `${w}%`, minWidth: 200, background: `linear-gradient(90deg, ${c1}, ${c2})`, clipPath: "polygon(0 0, 100% 0, calc(100% - 12px) 100%, 12px 100%)" }}>
              <span className="min-w-0 text-[12px] font-semibold leading-tight">
                <span className="block truncate">{r.key}</span>
                {conv !== null && <span className="block text-[10px] font-normal opacity-90">{conv}% of first step</span>}
              </span>
              <span className="shrink-0 text-right leading-tight">
                <span className="block text-[15px] font-extrabold tabular-nums">{num(r.views)}</span>
                <span className="block whitespace-nowrap text-[10px] opacity-90">{num(r.visitors)} {r.visitors === 1 ? "person" : "people"}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── New customer sign-ups (account create aana naal — pazhaya dates um) ───
const Signups = ({ s, days }) => {
  if (!s) return <Empty text="Restart the backend to see sign-ups" />;
  const by = Object.fromEntries((s.daily || []).map((r) => [r.day, r.count]));
  const data = days.map((d) => ({ day: d, n: by[d] || 0 }));
  const max = Math.max(1, ...data.map((d) => d.n));
  const COL = ["#0EA5E9", "#38BDF8"];
  return (
    <div className="grid gap-4 md:grid-cols-[180px_1fr_260px]">
      <div className="rounded-xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${COL[0]}, #6366F1)` }}>
        <p className="text-[12px] opacity-90">In this period</p>
        <p className="text-3xl font-extrabold tabular-nums">{num(s.total)}</p>
        <p className="mt-2 text-[11px] opacity-90">{num(s.allTime)} customers in total</p>
      </div>
      <div className="min-w-0">
        {days.length > 1 ? (
          <>
            <div className="flex h-28 items-end gap-[3px]">
              {data.map((d) => (
                <div key={d.day} className="group relative flex h-full flex-1 flex-col justify-end">
                  {d.n > 0 && days.length <= 14 && <span className="mb-0.5 text-center text-[10px] font-bold text-[#0369A1]">{d.n}</span>}
                  <div className="w-full rounded-t-md" style={{ height: `${d.n ? Math.max(6, (d.n / max) * 85) : 2}%`, background: d.n ? `linear-gradient(0deg, ${COL[0]}, ${COL[1]})` : "#EEF0F4" }} />
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[#1B2B26] px-2 py-0.5 text-[10px] text-white group-hover:block">
                    {dayLabel(d.day)} · {d.n} sign-up{d.n === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-[#8FA39B]">
              <span>{dayLabel(days[0])}</span><span>{dayLabel(days[days.length - 1])}</span>
            </div>
          </>
        ) : (
          <p className="py-8 text-center text-sm text-[#6B7F77]">{s.total ? `${s.total} new account${s.total === 1 ? "" : "s"} today` : "No new accounts today"}</p>
        )}
      </div>
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#8FA39B]">Latest sign-ups</p>
        {(s.recent || []).length === 0 ? <p className="text-xs text-[#8FA39B]">None in this period</p> : (
          <ul className="space-y-1.5">
            {s.recent.map((u, i) => (
              <li key={i} className="flex items-center justify-between gap-2 text-[12px]">
                <span className="min-w-0">
                  <b className="block truncate text-[#1F2937]">{u.name || "—"}</b>
                  <span className="block truncate text-[10px] text-[#8FA39B]">{u.email}</span>
                </span>
                <span className="shrink-0 text-[10px] text-[#6B7F77]">{timeLabel(u.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const RankList = ({ rows, unit = "views", render }) => {
  if (!rows.length) return <Empty />;
  const max = Math.max(1, ...rows.map((r) => r.views));
  return (
    <ul className="space-y-2">
      {rows.map((r, i) => (
        <li key={`${r.key}-${i}`}>
          <div className="flex items-center justify-between gap-3 text-[13px]">
            <span className="min-w-0 truncate text-[#1B2B26]" title={r.key}>{render ? render(r) : r.key || "—"}</span>
            <span className="shrink-0 tabular-nums text-[#4B5F57]">
              {num(r.views)} <span className="text-[#8FA39B]">{unit} · {num(r.visitors)} people</span>
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-[#EEF3F0]">
            <div className="h-1.5 rounded-full bg-[#2E9E4F]" style={{ width: `${(r.views / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

// ─── Visitor journey drawer ───
const JourneyDrawer = ({ visitorId, onClose }) => {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    if (!visitorId) return undefined;
    let alive = true;
    setData(null);
    setErr("");
    axios.get(`${API}/visitor/${encodeURIComponent(visitorId)}`, { headers: authHeaders() })
      .then(({ data: d }) => { if (alive) { if (d.success) setData(d); else setErr(d.message); } })
      .catch((e) => { if (alive) setErr(e.response?.data?.message || e.message); });
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { alive = false; window.removeEventListener("keydown", onKey); };
  }, [visitorId, onClose]);
  if (!visitorId) return null;

  // Session wise group
  const sessions = [];
  (data?.items || []).forEach((it) => {
    const last = sessions[sessions.length - 1];
    if (!last || last.id !== it.sessionId) sessions.push({ id: it.sessionId, items: [it] });
    else last.items.push(it);
  });
  const v = data?.visitor;
  // /booking/<id> → tour per (event props la irundhu)
  const tourByPath = {};
  (data?.items || []).forEach((it) => { if (it.props?.tour) tourByPath[String(it.path || "").replace(/[?#].*$/, "")] = it.props.tour; });
  const tourOf = (it) => it.props?.tour || tourByPath[String(it.path || "").replace(/[?#].*$/, "")] || "";
  const extraProps = (pr) => Object.entries(pr || {}).filter(([pk]) => pk !== "tour").map(([pk, pv]) => `${pk}: ${pv}`).join(" · ");

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/40" onClick={onClose} role="dialog" aria-modal="true" aria-label="Visitor journey">
      <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 border-b border-[#EEF2EF] px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-[#1B2B26]">{v ? whoName(v) : "Visitor"}</h2>
            {v?.user && <p className="text-[12px] font-medium text-[#1E6FD9]">{whoSub(v.user)} · {v.label}</p>}
            {v && (
              <p className="text-[12px] text-[#6B7F77]">
                {devList(v).length > 1
                  ? `${devList(v).length} devices: ${devList(v).join("  |  ")}`
                  : `${v.device} · ${v.browser} · ${v.os}${v.screen ? ` · ${v.screen}` : ""}`}
                {v.ip ? ` · ${v.ip}` : ""}
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-[#6B7F77] hover:bg-[#F4F7F5]"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {err && <p className="rounded-lg bg-[#FDECEC] px-3 py-2 text-sm text-[#B42318]">{err}</p>}
          {!data && !err && <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#2E9E4F]" /></div>}
          {v && (
            <>
              <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[["Pages", v.views], ["Clicks", v.clicks], ["Events", v.events], ["Visits", v.sessions]].map(([k, n]) => (
                  <div key={k} className="rounded-lg bg-[#F7F9F8] px-3 py-2">
                    <p className="text-[11px] text-[#6B7F77]">{k}</p>
                    <p className="text-lg font-bold tabular-nums text-[#1B2B26]">{num(n)}</p>
                  </div>
                ))}
              </div>
              <div className="mb-4 space-y-1 text-[12px] text-[#4B5F57]">
                <p><b>First seen:</b> {timeLabel(v.firstAt)} · <b>Last seen:</b> {timeLabel(v.lastAt)} ({ago(v.lastAt)})</p>
                <p><b>Came from:</b> {v.source}{v.referrer ? <span className="text-[#8FA39B]"> · {v.referrer}</span> : null}</p>
                {v.isLoggedIn && <p className="inline-flex items-center gap-1 text-[#1E6FD9]"><LogIn className="h-3.5 w-3.5" /> Logged in on the website</p>}
              </div>

              {sessions.map((s, si) => (
                <div key={`${s.id}-${si}`} className="mb-5">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#8FA39B]">
                    Visit {si + 1} · {timeLabel(s.items[0].at)} · {s.items.length} actions{devList(v).length > 1 ? ` · ${s.items[0].device} · ${s.items[0].browser}` : ""}
                  </p>
                  <ol className="relative ml-2 border-l-2 border-[#EEF2EF]">
                    {s.items.map((it, i) => {
                      const k = kindOf(it);
                      return (
                        <li key={i} className="relative mb-3 pl-5">
                          <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-white" style={{ background: k.dot }} />
                          <div className="flex flex-wrap items-center gap-x-2 text-[13px]">
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${k.cls}`}>{k.label}</span>
                            <span className="font-medium text-[#1B2B26]">{it.type === "click" || it.type === "event" ? it.name : prettyPage(it.path)}</span>
                            <span className="text-[11px] text-[#8FA39B]">{clockLabel(it.at)}</span>
                          </div>
                          {(() => {
                            const line = it.type === "click" || it.type === "event"
                              ? `on ${prettyLine(it.path, tourOf(it))}`
                              : [tourOf(it), utmText(it.path)].filter(Boolean).join(" · ");
                            const more = extraProps(it.props);
                            return (line || more) ? (
                              <p className="text-[11px] text-[#6B7F77]" title={it.path}>
                                {line}{line && more ? " · " : ""}{more}
                              </p>
                            ) : null;
                          })()}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════ PAGE ═════════════════════════════
const WebsiteTraffic = () => {
  const [tab, setTab] = useState("overview");
  const [range, setRange] = useState("today");
  const [from, setFrom] = useState(istToday());
  const [to, setTo] = useState(istToday());
  const [who, setWho] = useState("guest");
  const [kind, setKind] = useState("");
  // Column wise filters (Visitors + Activity log + Overview ellaathukkum)
  const EMPTY_F = { q: "", source: "", device: "", browser: "", page: "", event: "" };
  const [f, setF] = useState(EMPTY_F);
  const [qText, setQText] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setF((p) => (p.q === qText.trim() ? p : { ...p, q: qText.trim() })), 400);
    return () => clearTimeout(t);
  }, [qText]);
  const fKey = JSON.stringify(f);
  const fParams = useMemo(() => Object.fromEntries(Object.entries(JSON.parse(fKey)).filter(([, v]) => v)), [fKey]);
  // Backend ku anuppa: page filter → "path" (page = pagination number, adhu vera)
  const qParams = useMemo(() => {
    const o = { ...fParams };
    if (o.page) { o.path = o.page; delete o.page; }
    return o;
  }, [fParams]);
  const setCol = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const [data, setData] = useState(null);
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [visitors, setVisitors] = useState({ list: [], total: 0, page: 1, hasMore: false });
  const [openVisitor, setOpenVisitor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const reqId = useRef(0);
  const visReq = useRef(0);

  const dates = useMemo(() => {
    const t = istToday();
    if (range === "today") return { from: t, to: t };
    if (range === "yesterday") { const y = shiftDay(t, -1); return { from: y, to: y }; }
    if (range === "7") return { from: shiftDay(t, -6), to: t };
    if (range === "30") return { from: shiftDay(t, -29), to: t };
    return { from: from || t, to: to || t };
  }, [range, from, to]);

  // Live poll la "since" anuppum — pudhu data illana backend udane "unchanged" sollum (DB query illa, fast)
  const repSince = useRef(null);
  const visSince = useRef(null);
  const load = useCallback(async (p = 1, quiet = false) => {
    const id = ++reqId.current;
    if (!quiet) setLoading(true);
    if (!quiet) repSince.current = null;
    setError("");
    try {
      const since = quiet && p === 1 ? repSince.current : null;
      const { data: d } = await axios.get(`${API}/report`, { params: { from: dates.from, to: dates.to, who, kind, page: p, ...qParams, ...(since ? { since } : {}) }, headers: authHeaders() });
      if (id !== reqId.current) return;
      if (!d.success) throw new Error(d.message || "Could not load traffic");
      if (d.unchanged) { setData((prev) => (prev ? { ...prev, live: d.live } : prev)); return; }
      if (p === 1 && d.lastWrite) repSince.current = d.lastWrite;
      setData(d);
      setPage(p);
      setList((prev) => (p === 1 ? d.list : [...prev, ...d.list]));
    } catch (err) {
      if (id === reqId.current) setError(err.response?.data?.message || err.message);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [dates.from, dates.to, who, kind, qParams]);

  const loadVisitors = useCallback(async (p = 1, quiet = false) => {
    const id = ++visReq.current;
    if (!quiet) visSince.current = null;
    try {
      const since = quiet && p === 1 ? visSince.current : null;
      const { data: d } = await axios.get(`${API}/visitors`, { params: { from: dates.from, to: dates.to, who, page: p, ...qParams, ...(since ? { since } : {}) }, headers: authHeaders() });
      if (id !== visReq.current || !d.success) return;
      if (d.unchanged) {
        const liveSet = new Set(d.liveIds || []);
        setVisitors((prev) => ({ ...prev, list: prev.list.map((v) => ({ ...v, live: (v.devices || []).some((x) => liveSet.has(x.visitorId)) })) }));
        return;
      }
      if (p === 1 && d.lastWrite) visSince.current = d.lastWrite;
      setVisitors((prev) => ({ ...d, list: p === 1 ? d.list : [...prev.list, ...d.list] }));
    } catch (err) {
      if (id === visReq.current) setError(err.response?.data?.message || err.message);
    }
  }, [dates.from, dates.to, who, qParams]);

  useEffect(() => { load(1); }, [load]);
  useEffect(() => { loadVisitors(1); }, [loadVisitors]);
  // LIVE: innaikku range la irundhaa 5 second ku oru thadava thaane update (refresh theva illa).
  // Pazhaya dates (Yesterday / custom past) maaraadhu, so poll pannaadhu. Tab hide aanaa nirutthum.
  const isLive = dates.to >= istToday();
  useEffect(() => {
    if (!isLive) return undefined;
    const tick = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (page === 1) load(1, true);
      if (visitors.page === 1) loadVisitors(1, true);
    };
    const t = setInterval(tick, 5000);
    const onVis = () => { if (!document.hidden) tick(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", onVis); };
  }, [isLive, load, loadVisitors, page, visitors.page]);

  const totals = data?.totals || { views: 0, visitors: 0, sessions: 0, newVisitors: 0 };
  const allDays = daysBetween(dates.from, dates.to);
  const fieldCls = "h-9 rounded-lg border border-[#DCE5E0] bg-white px-3 text-sm text-[#1B2B26] outline-none focus:border-[#2E9E4F]";
  const refresh = () => { load(1); loadVisitors(1); };
  const colCount = Object.keys(fParams).length;
  const hasFilters = range !== "today" || who !== "guest" || kind !== "" || colCount > 0 || qText !== "";
  const clearCols = () => { setF(EMPTY_F); setQText(""); };
  const clearFilters = () => { setRange("today"); setFrom(istToday()); setTo(istToday()); setWho("guest"); setKind(""); clearCols(); };

  // Column filter controls
  // Backend options illana (pazhaya controller), charts data la irundhu edukkum
  const keysOf = (rows) => (rows || []).map((r) => r.key).filter(Boolean);
  const opts = data?.options || {
    sources: keysOf(data?.sources), devices: keysOf(data?.devices), browsers: keysOf(data?.browsers),
    pages: (data?.pages || []).map((r) => ({ path: r.key || "/", title: r.title || "", views: r.views })),
    events: keysOf(data?.events),
  };
  const colCls = "h-8 w-full min-w-0 rounded-md border border-[#DCE5E0] bg-white px-1.5 text-[11px] font-normal normal-case tracking-normal text-[#1B2B26] outline-none focus:border-[#7C3AED]";
  const onCls = "border-[#7C3AED] bg-[#F5F3FF] text-[#5B21B6] font-semibold";
  const sel = (k, list, all, label, render) => (
    <select aria-label={label} value={f[k]} onChange={setCol(k)} className={`${colCls} ${f[k] ? onCls : ""}`}>
      <option value="">{all}</option>
      {f[k] && !(list || []).some((x) => (typeof x === "string" ? x : x.path) === f[k]) && <option value={f[k]}>{f[k]}</option>}
      {(list || []).map((x) => typeof x === "string"
        ? <option key={x} value={x}>{x}</option>
        : <option key={x.path} value={x.path}>{render ? render(x) : x.path}</option>)}
    </select>
  );
  const C = {
    search: (
      <div className="relative">
        <Search className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#8FA39B]" />
        <input aria-label="Search name, email, phone or visitor ID" value={qText} onChange={(e) => setQText(e.target.value)}
          placeholder="Name, email, phone, ID" className={`${colCls} pl-5 ${qText ? onCls : ""}`} />
      </div>
    ),
    page: sel("page", opts.pages, "All pages", "Filter by page", (x) => `${pageName(x.path, x.title)} (${x.views})`),
    event: sel("event", opts.events, "All stage events", "Filter by stage event"),
    source: sel("source", opts.sources, "All sources", "Filter by source"),
    device: sel("device", opts.devices, "All devices", "Filter by device"),
    browser: sel("browser", opts.browsers, "All browsers", "Filter by browser"),
    kind: (
      <select aria-label="Filter by type" value={kind} onChange={(e) => setKind(e.target.value)} className={`${colCls} ${kind ? onCls : ""}`}>
        {KINDS.map((k) => <option key={k.key} value={k.key}>{k.key ? k.label : "All types"}</option>)}
      </select>
    ),
    clear: colCount > 0 || qText ? (
      <button type="button" onClick={clearCols} className="inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-[11px] font-semibold normal-case tracking-normal text-[#B42318] hover:bg-[#FDECEC]">
        <X className="h-3 w-3" /> Clear
      </button>
    ) : null,
  };
  const clr = (...ks) => () => { setF((p) => { const n = { ...p }; ks.forEach((k) => { n[k] = ""; }); return n; }); if (ks.includes("q")) setQText(""); };
  const FILTER_LABEL = { q: "Search", source: "Source", device: "Device", browser: "Browser", page: "Page", event: "Stage event" };
  const closeJourney = useCallback(() => setOpenVisitor(""), []);

  return (
    <div className="min-h-screen bg-[#F4F7F5] p-3 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2B26]">Website Traffic</h1>
            <p className="text-sm text-[#6B7F77]">Customer visits on gvtourplanners.com</p>
          </div>
          <button type="button" onClick={refresh} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#2E9E4F] px-4 text-sm font-semibold text-white hover:bg-[#27884A]">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh
          </button>
        </div>

        {/* Filters — date + visitor type (column filters Visitors / Activity table la) */}
        <section className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#DCE5E0] bg-white p-3">
          <select aria-label="Date range" value={range} onChange={(e) => setRange(e.target.value)} className={fieldCls}>
            {RANGES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
          {range === "custom" && (
            <>
              <label className="flex items-center gap-1 text-xs text-[#6B7F77]">From
                <input type="date" value={from} max={to || istToday()} onChange={(e) => setFrom(e.target.value)} className={fieldCls} />
              </label>
              <label className="flex items-center gap-1 text-xs text-[#6B7F77]">To
                <input type="date" value={to} min={from || undefined} max={istToday()} onChange={(e) => setTo(e.target.value)} className={fieldCls} />
              </label>
            </>
          )}
          <select aria-label="Visitor type" value={who} onChange={(e) => setWho(e.target.value)} className={fieldCls}>
            {WHO.map((w) => <option key={w.key} value={w.key}>{w.label}</option>)}
          </select>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="inline-flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-[#B42318] hover:bg-[#FDECEC]">
              <X className="h-4 w-4" /> Clear filters
            </button>
          )}
          {Object.entries(fParams).map(([k, v]) => (
            <span key={k} className="inline-flex h-7 items-center gap-1 rounded-full border border-[#DDD6FE] bg-[#F5F3FF] pl-2.5 pr-1 text-[11px] text-[#5B21B6]">
              <Filter className="h-3 w-3" /> {FILTER_LABEL[k]}: <b className="max-w-[140px] truncate">{k === "page" ? pageName(v) : v}</b>
              <button type="button" aria-label={`Remove ${FILTER_LABEL[k]} filter`} onClick={() => { setF((p) => ({ ...p, [k]: "" })); if (k === "q") setQText(""); }}
                className="rounded-full p-0.5 hover:bg-[#EDE9FE]"><X className="h-3 w-3" /></button>
            </span>
          ))}
          <span className="ml-auto text-xs text-[#8FA39B]">
            {dates.from === dates.to ? dayLabel(dates.from) : `${dayLabel(dates.from)} – ${dayLabel(dates.to)}`}
            {isLive
              ? <span className="ml-1 inline-flex items-center gap-1 font-semibold text-[#2E9E4F]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2E9E4F]" />LIVE</span>
              : " · saved data"}
          </span>
        </section>

        {error && <p className="mb-4 rounded-lg bg-[#FDECEC] px-3 py-2 text-sm text-[#B42318]">{error}</p>}

        {/* Stats */}
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="col-span-2 rounded-xl border border-[#BFE3CB] bg-[#E7F6EC] px-4 py-3 md:col-span-1">
            <div className="flex items-center gap-2 text-[12px] text-[#0F7A5A]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2E9E4F] opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#2E9E4F]" />
              </span>
              Live now
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[#0F7A5A]">{num(data?.live)}</p>
            <p className="text-[11px] text-[#4B5F57]">on the website right now</p>
          </div>
          <Stat icon={Users} label="Visitors" value={num(totals.visitors)} sub={[
            "unique people",
            totals.devices && totals.devices > totals.visitors ? `${num(totals.devices)} devices` : "",
            allDays.length > 1 ? `avg ${String(+((data?.daily || []).filter((r) => allDays.includes(r.day)).reduce((a, r) => a + (r.visitors || 0), 0) / allDays.length).toFixed(1))}/day` : "",
          ].filter(Boolean).join(" · ")} />
          <Stat icon={Eye} label="Page views" value={num(totals.views)} sub={totals.visitors ? `${(totals.views / totals.visitors).toFixed(1)} pages per visitor` : ""} />
          <Stat icon={UserPlus} label="New visitors" value={num(totals.newVisitors)} sub={`${num(Math.max(0, totals.visitors - totals.newVisitors))} returning`} tone="text-[#1E6FD9]" />
          <Stat icon={Activity} label="Visits" value={num(totals.sessions)} sub="browsing sessions" />
        </div>

        {/* Tabs */}
        <div role="tablist" className="mb-4 inline-flex rounded-lg border border-[#DCE5E0] bg-white p-1">
          {[["overview", "Overview"], ["visitors", `Visitors${visitors.total ? ` (${num(visitors.total)})` : ""}`], ["activity", "Activity log"]].map(([k, l]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold ${tab === k ? "bg-[#2E9E4F] text-white" : "text-[#4B5F57] hover:bg-[#F4F7F5]"}`}>
              {l}
            </button>
          ))}
        </div>

        {/* ═══ Overview ═══ */}
        {tab === "overview" && (
          <>
            <div className="mb-4 grid gap-3 lg:grid-cols-3">
              <Card title={allDays.length > 1 ? "Visitors & page views per day" : "Today by hour"} className="lg:col-span-2">
                {allDays.length > 1 ? <DailyChart days={allDays} rows={data?.daily || []} /> : <HourChart rows={data?.hourly || []} />}
              </Card>
              <Card title="Where they came from"><Donut rows={data?.sources || []} label="views" colorOf={(k) => SOURCE_COLOR[k]} /></Card>
            </div>
            <div className="mb-4 grid gap-3 lg:grid-cols-3">
              {allDays.length > 1 && <Card title="Busiest hours (all days)" className="lg:col-span-3"><HourChart rows={data?.hourly || []} /></Card>}
              <Card title="Devices">
                <PieChart rows={data?.devices || []} icon={(k) => DEVICE_ICON[k] || Monitor} />
              </Card>
              <Card title="Browsers" className="lg:col-span-2"><BarChart rows={data?.browsers || []} /></Card>
            </div>
            <div className="mb-4 grid gap-3 lg:grid-cols-3">
              <Card title="New customer sign-ups" className="lg:col-span-3"><Signups s={data?.signups} days={allDays} /></Card>
              <Card title="Top pages"><PageBars rows={data?.pages || []} /></Card>
              <Card title="Top button / link clicks"><Lollipop rows={data?.clicks || []} /></Card>
              <Card title="Stage events"><Funnel rows={data?.events || []} /></Card>
            </div>
          </>
        )}

        {/* ═══ Visitors ═══ */}
        {tab === "visitors" && (
          <Card title="Visitors" right={<span className="hidden text-[11px] text-[#8FA39B] sm:inline">Click a visitor to see everything they did</span>}>
            {/* Mobile filters */}
            <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-3 xl:hidden">
              <div className="col-span-2">{C.search}</div>
              {C.page}{C.source}{C.device}{C.browser}{C.event}{C.clear}
            </div>
            {(
              <>
                {/* Desktop table */}
                <div className="hidden xl:block">
                  <table className="w-full table-fixed text-left text-[13px]">
                    <thead className="bg-[#F7F9F8] text-[11px] uppercase tracking-wide text-[#6B7F77]">
                      <tr>
                        <th className="w-[190px] px-3 py-2 font-semibold"><ColHead label="Visitor" active={!!qText} onClear={clr("q")}>{C.search}</ColHead></th>
                        <th className="px-3 py-2 font-semibold"><ColHead label="Last page" title="Visited page / stage event" active={!!(f.page || f.event)} onClear={clr("page", "event")}>{C.page}{C.event}</ColHead></th>
                        <th className="w-[110px] px-3 py-2 font-semibold"><ColHead label="Source" active={!!f.source} onClear={clr("source")}>{C.source}</ColHead></th>
                        <th className="w-[150px] px-3 py-2 font-semibold"><ColHead label="Device" active={!!(f.device || f.browser)} onClear={clr("device", "browser")}>{C.device}{C.browser}</ColHead></th>
                        <th className="w-[60px] px-3 py-2 text-right font-semibold">Pages</th>
                        <th className="w-[60px] px-3 py-2 text-right font-semibold">Clicks</th>
                        <th className="w-[55px] px-3 py-2 text-right font-semibold">Visits</th>
                        <th className="w-[90px] px-3 py-2 font-semibold">Time spent</th>
                        <th className="w-[105px] px-3 py-2 font-semibold">Last seen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF2EF]">
                      {visitors.list.length === 0 && (
                        <tr><td colSpan={9} className="px-3 py-10 text-center text-sm text-[#8FA39B]">No visitors match these filters.</td></tr>
                      )}
                      {visitors.list.map((v) => {
                        const DI = DEVICE_ICON[v.device] || Monitor;
                        return (
                          <tr key={v.visitorId} onClick={() => setOpenVisitor(v.visitorId)} className="cursor-pointer hover:bg-[#F7F9F8]"
                            tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") setOpenVisitor(v.visitorId); }}>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 shrink-0 rounded-full ${v.live ? "bg-[#2E9E4F]" : "bg-[#CBD5E1]"}`} title={v.live ? "Live now" : "Not active"} />
                                <span className="truncate font-semibold text-[#1B2B26]" title={v.label}>{whoName(v)}</span>
                              </div>
                              {v.user && <div className="truncate pl-4 text-[11px] text-[#1E6FD9]">{whoSub(v.user)}</div>}
                              {v.linkedLater && <div className="pl-4 text-[10px] text-[#8FA39B]">Guest visits only · this customer logged in separately</div>}
                              <div className="mt-0.5 flex flex-wrap gap-1 pl-4">
                                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${v.firstVisit ? "bg-[#E8F1FD] text-[#1E6FD9]" : "bg-[#EEF3F0] text-[#4B5F57]"}`}>{v.firstVisit ? "New" : "Returning"}</span>
                                {v.isLoggedIn && <span className="rounded-full bg-[#EDE9FE] px-1.5 py-0.5 text-[10px] font-semibold text-[#5B21B6]">Logged in</span>}
                              </div>
                            </td>
                            <td className="truncate px-3 py-2.5" title={v.lastPath}>
                              <span className="text-[#1E6FD9]">{pageName(v.lastPath, v.lastTitle)}</span>
                              {v.eventNames.length > 0 && <span className="block truncate text-[11px] text-[#6D28D9]">🚩 {v.eventNames.join(", ")}</span>}
                            </td>
                            <td className="px-3 py-2.5"><SourceCell v={v} /></td>
                            <td className="truncate px-3 py-2.5 text-[#4B5F57]" title={devList(v).join("\n")}>
                              {devList(v).length > 1
                                ? <span className="font-medium text-[#1E6FD9]"><Monitor className="mr-1 inline h-3.5 w-3.5" />{devList(v).length} devices</span>
                                : <><DI className="mr-1 inline h-3.5 w-3.5" />{v.device} · {v.browser}</>}
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums">{v.views}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums">{v.clicks}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums">{v.sessions}</td>
                            <td className="px-3 py-2.5 text-[#4B5F57]">{duration(v.durationSec)}</td>
                            <td className="px-3 py-2.5 text-[#4B5F57]" title={timeLabel(v.lastAt)}>{v.live ? <span className="font-semibold text-[#2E9E4F]">Live</span> : ago(v.lastAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Mobile cards */}
                {visitors.list.length === 0 && <div className="xl:hidden"><Empty text="No visitors match these filters." /></div>}
                <ul className="divide-y divide-[#EEF2EF] xl:hidden">
                  {visitors.list.map((v) => {
                    const DI = DEVICE_ICON[v.device] || Monitor;
                    return (
                      <li key={v.visitorId}>
                        <button type="button" onClick={() => setOpenVisitor(v.visitorId)}
                          className="flex w-full items-center gap-3 px-1 py-3 text-left hover:bg-[#F7F9F8]">
                          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF3F0]">
                            <DI className="h-4 w-4 text-[#4B5F57]" />
                            {v.live && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#2E9E4F]" title="Live now" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-x-2 text-[13px]">
                              <b className="text-[#1B2B26]">{whoName(v)}</b>
                              {v.user && <span className="text-[11px] text-[#1E6FD9]">{whoSub(v.user)}</span>}
                              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${v.firstVisit ? "bg-[#E8F1FD] text-[#1E6FD9]" : "bg-[#EEF3F0] text-[#4B5F57]"}`}>{v.firstVisit ? "New" : "Returning"}</span>
                              {v.isLoggedIn && <span className="rounded-full bg-[#EDE9FE] px-1.5 py-0.5 text-[10px] font-semibold text-[#5B21B6]">Logged in</span>}
                              {v.live && <span className="text-[11px] font-semibold text-[#2E9E4F]">● Live</span>}
                            </span>
                            <span className="block truncate text-[12px] text-[#4B5F57]">
                              Last: {pageName(v.lastPath, v.lastTitle)} · {ago(v.lastAt)}
                            </span>
                            <span className="block text-[11px] text-[#8FA39B]">
                              {sourceText(v)} · {devList(v).length > 1 ? `${devList(v).length} devices` : `${v.device} · ${v.browser}`}{v.ip ? ` · ${v.ip}` : ""} · <Clock className="inline h-3 w-3" /> {duration(v.durationSec)}
                              {v.eventNames.length ? ` · ${v.eventNames.join(", ")}` : ""}
                            </span>
                          </span>
                          <span className="hidden shrink-0 gap-3 text-center text-[11px] text-[#6B7F77] sm:flex">
                            <span><b className="block text-sm text-[#1B2B26]">{v.views}</b>pages</span>
                            <span><b className="block text-sm text-[#1B2B26]">{v.clicks}</b>clicks</span>
                            <span><b className="block text-sm text-[#1B2B26]">{v.sessions}</b>visits</span>
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-[#8FA39B]" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {visitors.hasMore && (
                  <div className="pt-3 text-center">
                    <button type="button" onClick={() => loadVisitors(visitors.page + 1)} className="rounded-lg border border-[#DCE5E0] px-4 py-2 text-sm font-semibold text-[#1B2B26] hover:bg-[#F7F9F8]">Load more</button>
                  </div>
                )}
              </>
            )}
          </Card>
        )}

        {/* ═══ Activity log ═══ */}
        {tab === "activity" && (
          <section className="rounded-xl border border-[#DCE5E0] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEF2EF] px-4 py-3">
              <h3 className="text-sm font-semibold text-[#1B2B26]">Activity log</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 border-b border-[#EEF2EF] p-3 md:grid-cols-3 xl:hidden">
              <div className="col-span-2">{C.search}</div>
              {C.kind}{C.page}{C.event}{C.source}{C.device}{C.browser}{C.clear}
            </div>
            {(
              <>
              <div className="hidden xl:block">
                <table className="w-full table-fixed text-left text-[13px]">
                  <thead className="bg-[#F7F9F8] text-[11px] uppercase tracking-wide text-[#6B7F77]">
                    <tr>
                      <th className="w-[140px] px-4 py-2 font-semibold">Time</th>
                      <th className="w-[90px] px-4 py-2 font-semibold"><ColHead label="Type" active={!!kind} onClear={() => setKind("")}>{C.kind}</ColHead></th>
                      <th className="px-4 py-2 font-semibold"><ColHead label="Page / action" title="Page / stage event" active={!!(f.page || f.event)} onClear={clr("page", "event")}>{C.page}{C.event}</ColHead></th>
                      <th className="w-[130px] px-4 py-2 font-semibold"><ColHead label="Visitor" active={!!qText} onClear={clr("q")}>{C.search}</ColHead></th>
                      <th className="w-[110px] px-4 py-2 font-semibold"><ColHead label="Source" active={!!f.source} onClear={clr("source")} align="right">{C.source}</ColHead></th>
                      <th className="w-[150px] px-4 py-2 font-semibold"><ColHead label="Device" active={!!(f.device || f.browser)} onClear={clr("device", "browser")} align="right">{C.device}{C.browser}</ColHead></th>
                      <th className="w-[100px] px-4 py-2 font-semibold">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF2EF]">
                    {list.length === 0 && !loading && (
                      <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-[#8FA39B]">No activity matches these filters.</td></tr>
                    )}
                    {list.map((v) => {
                      const k = kindOf(v);
                      const isAct = v.type === "click" || v.type === "event";
                      return (
                        <tr key={v._id} onClick={() => setOpenVisitor(v.visitorId)} className="cursor-pointer hover:bg-[#F7F9F8]"
                          tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") setOpenVisitor(v.visitorId); }}>
                          <td className="px-4 py-2 text-[#1B2B26]">{timeLabel(v.at)}</td>
                          <td className="px-4 py-2"><span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${k.cls}`}>{k.label}</span></td>
                          <td className="truncate px-4 py-2" title={isAct ? `${v.name} — on ${v.path}` : v.path}>
                            <span className="text-[#1E6FD9]">{isAct ? v.name : pageName(v.path, v.title)}</span>
                            {(isAct || utmText(v.path) || v.props?.tour) && <span className="text-[11px] text-[#8FA39B]"> · {isAct ? `on ${prettyLine(v.path, v.props?.tour)}` : prettyLine(v.path, v.props?.tour).replace(/^[^·]*·?\s*/, "")}</span>}
                          </td>
                          <td className="truncate px-4 py-2 text-[#4B5F57]">{v.user?.name ? <span className="font-medium text-[#1B2B26]">{v.user.name}</span> : `Visitor ${String(v.visitorId || "").replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase()}`}</td>
                          <td className="truncate px-4 py-2">{v.source}</td>
                          <td className="truncate px-4 py-2 text-[#4B5F57]">{v.device} · {v.browser}</td>
                          <td className="px-4 py-2 text-[#8FA39B]">{v.ip || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {list.length === 0 && !loading && <div className="xl:hidden"><Empty text="No activity matches these filters." /></div>}
              <ul className="divide-y divide-[#EEF2EF] xl:hidden">
                {list.map((v) => {
                  const k = kindOf(v);
                  return (
                    <li key={v._id}>
                      <button type="button" onClick={() => setOpenVisitor(v.visitorId)} className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-[#F7F9F8]">
                        <span className={`mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${k.cls}`}>{k.label}</span>
                        <span className="min-w-0 flex-1 text-[13px]">
                          <span className="block truncate text-[#1B2B26]">{v.type === "click" || v.type === "event" ? v.name : pageName(v.path, v.title)}</span>
                          <span className="block truncate text-[11px] text-[#8FA39B]">
                            {v.type === "click" || v.type === "event" ? `on ${prettyLine(v.path, v.props?.tour)}` : prettyLine(v.path, v.props?.tour)} · {v.source} · {v.device} · {v.browser}
                          </span>
                        </span>
                        <span className="shrink-0 text-right text-[11px] text-[#6B7F77]">{timeLabel(v.at)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              </>
            )}
            {data?.hasMore && (
              <div className="border-t border-[#EEF2EF] p-3 text-center">
                <button type="button" onClick={() => load(page + 1)} disabled={loading} className="rounded-lg border border-[#DCE5E0] px-4 py-2 text-sm font-semibold text-[#1B2B26] hover:bg-[#F7F9F8] disabled:opacity-50">
                  {loading ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </section>
        )}

        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[#8FA39B]">
          <Globe className="h-3.5 w-3.5" /> IP addresses are partly hidden. Bots and crawlers are not counted. Guests are anonymous (each browser gets its own visitor ID). Logged-in customers show their name.
        </p>
      </div>

      <JourneyDrawer visitorId={openVisitor} onClose={closeJourney} />
    </div>
  );
};

export default WebsiteTraffic;
