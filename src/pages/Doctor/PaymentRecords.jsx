// // // import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
// // // import { toast } from "react-toastify";
// // // import {
// // //   Search,
// // //   X,
// // //   Loader2,
// // //   RefreshCw,
// // //   ArrowUpDown,
// // //   ChevronLeft,
// // //   ChevronRight,
// // //   ExternalLink,
// // //   Copy,
// // //   Check,
// // //   FileImage,
// // //   Landmark,
// // // } from "lucide-react";
// // // import { TourContext } from "../../context/TourContext";

// // // /*
// // //   Payment Records — reads like a bank statement for the Aadhaar Upload
// // //   payment screenshots. Each day is a block with its own subtotal; each row
// // //   is one screenshot, with a coloured edge for its type. The one bold piece
// // //   is the "money split" bar at the top: it shows how the filtered total
// // //   divides into Advance / Balance / Partial, and clicking a segment filters
// // //   the table to that type.
// // // */

// // // const INK = "#1B2B26";
// // // const TYPE_META = {
// // //   advance: { label: "Advance", color: "#1E6FD9", soft: "#E8F1FD" },
// // //   balance: { label: "Balance", color: "#2E9E4F", soft: "#E7F6EC" },
// // //   partial: { label: "Partial", color: "#D98E04", soft: "#FDF4DC" },
// // // };
// // // const TYPE_ORDER = ["advance", "balance", "partial"];

// // // // A PDF on Cloudinary can't render in <img>; .jpg serves page 1 as an image.
// // // const toPreviewUrl = (url = "") => url.replace(/\.pdf(\?.*)?$/i, ".jpg$1");
// // // const isPdf = (url = "") => /\.pdf(\?.*)?$/i.test(url);

// // // const formatAmount = (n) => (Number(n) || 0).toLocaleString("en-IN");
// // // const formatTime = (d) =>
// // //   new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
// // // const formatDateTime = (d) =>
// // //   new Date(d).toLocaleString("en-IN", {
// // //     day: "2-digit",
// // //     month: "short",
// // //     year: "numeric",
// // //     hour: "numeric",
// // //     minute: "2-digit",
// // //     hour12: true,
// // //   });
// // // const dayKey = (d) => {
// // //   const x = new Date(d);
// // //   return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
// // // };
// // // const dayParts = (key) => {
// // //   const d = new Date(`${key}T00:00:00`);
// // //   const today = dayKey(new Date());
// // //   const y = new Date();
// // //   y.setDate(y.getDate() - 1);
// // //   const rel = key === today ? "Today" : key === dayKey(y) ? "Yesterday" : d.toLocaleDateString("en-IN", { weekday: "long" });
// // //   return {
// // //     day: d.getDate(),
// // //     month: d.toLocaleDateString("en-IN", { month: "short" }),
// // //     year: d.getFullYear(),
// // //     rel,
// // //   };
// // // };

// // // // Quick day filters — each sets From and To to that one day.
// // // const dayOffsetKey = (offset) => {
// // //   const d = new Date();
// // //   d.setDate(d.getDate() + offset);
// // //   return dayKey(d);
// // // };
// // // const QUICK_DAYS = [
// // //   { offset: -2, label: "Day before yesterday" },
// // //   { offset: -1, label: "Yesterday" },
// // //   { offset: 0, label: "Today" },
// // // ];

// // // // Tear-off calendar leaf for each day block in the statement.
// // // const DateStamp = ({ dp }) => (
// // //   <span className="inline-flex flex-col w-11 shrink-0 rounded-lg overflow-hidden border border-[#CFE3D6] bg-white text-center shadow-sm">
// // //     <span className="bg-[#2E9E4F] text-white text-[10px] font-semibold leading-4">
// // //       {dp.month} {String(dp.year).slice(2)}
// // //     </span>
// // //     <span className="text-base font-bold tabular-nums leading-6 text-[#1B2B26]">{dp.day}</span>
// // //   </span>
// // // );

// // // // "2026-11-08" → "08 Nov'26"
// // // const payRangeLabel = (key) => {
// // //   const d = new Date(`${key}T00:00:00`);
// // //   if (Number.isNaN(d.getTime())) return key;
// // //   return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleDateString("en-IN", { month: "short" }).slice(0, 3)}'${String(d.getFullYear()).slice(-2)}`;
// // // };

// // // // Andha naal advance pay panna bookings count (tourBookingModel). Mouse vachaa TNR list.
// // // const AdvanceBookingsBadge = ({ count, tnrs = [] }) =>
// // //   count > 0 ? (
// // //     <span
// // //       title={`Advance paid: ${tnrs.filter(Boolean).join(", ")}`}
// // //       className="inline-flex items-center gap-1 rounded-md bg-[#E8F1FD] text-[#1E6FD9] px-2 py-0.5 text-[11px] font-semibold tabular-nums whitespace-nowrap"
// // //     >
// // //       {count} booking{count !== 1 ? "s" : ""} · advance paid
// // //     </span>
// // //   ) : null;

// // // // Yaaru upload panna — { type, name, role } → "Pavithra · BAT" / "Tour admin" / "Admin"
// // // const uploaderName = (u) => {
// // //   if (!u) return "";
// // //   if (u.type === "staff") return u.name || "Staff";
// // //   if (u.type === "touradmin") return "Tour admin";
// // //   if (u.type === "admin") return "Admin";
// // //   if (u.type === "user") return u.name ? `${u.name} (Customer)` : "Customer";
// // //   return u.name || "";
// // // };
// // // const uploaderSub = (u) => (u?.type === "staff" ? u.role || u.employeeId || "Staff" : "");
// // // const uploaderSubOf = (r) => uploaderSub(r?.uploader); // staff → role / employee ID

// // // // Works on every device: the Clipboard API needs HTTPS (or localhost), and
// // // // some phones/in-app browsers don't have it, so fall back to a hidden
// // // // textarea + execCommand("copy").
// // // const copyText = async (text) => {
// // //   try {
// // //     if (navigator.clipboard && window.isSecureContext) {
// // //       await navigator.clipboard.writeText(text);
// // //       return true;
// // //     }
// // //   } catch (err) {
// // //     console.error("Clipboard API copy failed, trying fallback:", err);
// // //   }
// // //   try {
// // //     const ta = document.createElement("textarea");
// // //     ta.value = text;
// // //     ta.setAttribute("readonly", "");
// // //     ta.style.position = "fixed";
// // //     ta.style.top = "0";
// // //     ta.style.left = "0";
// // //     ta.style.opacity = "0";
// // //     document.body.appendChild(ta);
// // //     ta.focus();
// // //     ta.select();
// // //     ta.setSelectionRange(0, text.length);
// // //     const ok = document.execCommand("copy");
// // //     document.body.removeChild(ta);
// // //     return ok;
// // //   } catch (err) {
// // //     console.error("Fallback copy failed:", err);
// // //     return false;
// // //   }
// // // };

// // // const CopyTnr = ({ tnr, size = "sm" }) => {
// // //   const [copied, setCopied] = useState(false);
// // //   const icon = size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5";
// // //   return (
// // //     <button
// // //       type="button"
// // //       onClick={async (e) => {
// // //         e.stopPropagation();
// // //         e.preventDefault();
// // //         const ok = await copyText(tnr);
// // //         if (ok) {
// // //           setCopied(true);
// // //           toast.success(`TNR ${tnr} copied`, { autoClose: 1200 });
// // //           setTimeout(() => setCopied(false), 1500);
// // //         } else {
// // //           toast.error("Could not copy — long-press the TNR to copy it");
// // //         }
// // //       }}
// // //       title="Copy TNR"
// // //       aria-label={`Copy TNR ${tnr}`}
// // //       className={`${size === "lg" ? "p-1.5" : "p-1"} -m-0.5 rounded-md text-[#8FA39B] hover:text-[#1B2B26] hover:bg-[#EEF2EF] active:bg-[#E4F5EA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3B5BDB] shrink-0`}
// // //     >
// // //       {copied ? <Check className={`${icon} text-[#2F9E44]`} /> : <Copy className={icon} />}
// // //     </button>
// // //   );
// // // };

// // // const Viewer = ({ items, index, onClose, onNav }) => {
// // //   useEffect(() => {
// // //     if (index === null) return undefined;
// // //     const onKey = (e) => {
// // //       if (e.key === "Escape") onClose();
// // //       if (e.key === "ArrowLeft" && index > 0) onNav(index - 1);
// // //       if (e.key === "ArrowRight" && index < items.length - 1) onNav(index + 1);
// // //     };
// // //     window.addEventListener("keydown", onKey);
// // //     const prev = document.body.style.overflow;
// // //     document.body.style.overflow = "hidden"; // pinnaadi page scroll aaga koodaadhu
// // //     return () => {
// // //       window.removeEventListener("keydown", onKey);
// // //       document.body.style.overflow = prev;
// // //     };
// // //   }, [index, items.length, onClose, onNav]);

// // //   if (index === null || !items[index]) return null;
// // //   const r = items[index];
// // //   const meta = TYPE_META[r.type] || TYPE_META.partial;
// // //   return (
// // //     <div
// // //       className="fixed inset-0 z-50 bg-[#1B2B26]/80 flex items-start md:items-center justify-center p-3 sm:p-6 overflow-y-auto"
// // //       onClick={onClose}
// // //       role="dialog"
// // //       aria-modal="true"
// // //     >
// // //       <div
// // //         className="relative my-auto w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_260px] md:max-h-[92vh] md:overflow-hidden"
// // //         onClick={(e) => e.stopPropagation()}
// // //       >
// // //         <div className="bg-[#EEF2EF] min-h-0 flex items-center justify-center rounded-t-2xl md:rounded-none md:rounded-l-2xl overflow-hidden">
// // //           <img src={toPreviewUrl(r.url)} alt="Payment screenshot" className="max-w-full max-h-[55dvh] md:max-h-[86vh] object-contain" />
// // //         </div>
// // //         <div className="p-4 sm:p-5 pb-6 flex flex-col gap-3 sm:gap-4 md:overflow-y-auto border-t md:border-t-0 md:border-l border-[#DCE5E0]">
// // //           <button
// // //             type="button"
// // //             onClick={onClose}
// // //             aria-label="Close"
// // //             className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 text-[#1B2B26] shadow hover:bg-white"
// // //           >
// // //             <X className="w-4 h-4" />
// // //           </button>
// // //           <div>
// // //             <span className="text-xs font-semibold" style={{ color: meta.color }}>
// // //               {meta.label} payment
// // //             </span>
// // //             <p className="text-2xl sm:text-3xl font-bold tabular-nums" style={{ color: INK }}>
// // //               {r.amount ? `₹${formatAmount(r.amount)}` : "No amount"}
// // //             </p>
// // //             {r.remarks && (
// // //               <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-[#4B5F57]">
// // //                 <Landmark className="w-4 h-4" /> {r.remarks}
// // //               </p>
// // //             )}
// // //           </div>
// // //           <dl className="text-sm space-y-2">
// // //             <div>
// // //               <dt className="text-xs text-[#8FA39B]">Uploaded</dt>
// // //               <dd className="font-semibold text-[#1B2B26]">{formatDateTime(r.createdAt)}</dd>
// // //             </div>
// // //             <div>
// // //               <dt className="text-xs text-[#8FA39B]">Uploaded by</dt>
// // //               <dd className="font-semibold text-[#1B2B26]">
// // //                 {r.uploader ? (
// // //                   <>
// // //                     {uploaderName(r.uploader)}
// // //                     {uploaderSubOf(r) && <span className="font-normal text-[#8FA39B]"> · {uploaderSubOf(r)}</span>}
// // //                   </>
// // //                 ) : (
// // //                   <span className="font-normal text-[#8FA39B]">Not recorded (older upload)</span>
// // //                 )}
// // //               </dd>
// // //             </div>
// // //             <div>
// // //               <dt className="text-xs text-[#8FA39B]">Guest</dt>
// // //               <dd className="font-semibold text-[#1B2B26]">{r.name || "—"}</dd>
// // //             </div>
// // //             <div>
// // //               <dt className="text-xs text-[#8FA39B]">TNR</dt>
// // //               <dd className="font-semibold tracking-wide text-[#1B2B26] flex items-center gap-1">
// // //                 {r.tnr || "Not linked yet"} {r.tnr && <CopyTnr tnr={r.tnr} />}
// // //               </dd>
// // //             </div>
// // //             {r.tourTitle && (
// // //               <div>
// // //                 <dt className="text-xs text-[#8FA39B]">Tour</dt>
// // //                 <dd className="text-[#1B2B26]">{r.tourTitle}</dd>
// // //               </div>
// // //             )}
// // //           </dl>
// // //           <a
// // //             href={r.url}
// // //             target="_blank"
// // //             rel="noreferrer"
// // //             className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3B5BDB] hover:underline"
// // //           >
// // //             <ExternalLink className="w-4 h-4" /> {isPdf(r.url) ? "Open PDF" : "Open original"}
// // //           </a>
// // //           <div className="mt-auto flex items-center justify-between gap-2">
// // //             <button
// // //               type="button"
// // //               onClick={() => onNav(index - 1)}
// // //               disabled={index === 0}
// // //               aria-label="Previous screenshot"
// // //               className="p-2 rounded-lg border border-[#DCE5E0] hover:bg-[#F3F6F4] disabled:opacity-30"
// // //             >
// // //               <ChevronLeft className="w-4 h-4" />
// // //             </button>
// // //             <span className="text-xs text-[#8FA39B] tabular-nums">
// // //               {index + 1} of {items.length}
// // //             </span>
// // //             <button
// // //               type="button"
// // //               onClick={() => onNav(index + 1)}
// // //               disabled={index === items.length - 1}
// // //               aria-label="Next screenshot"
// // //               className="p-2 rounded-lg border border-[#DCE5E0] hover:bg-[#F3F6F4] disabled:opacity-30"
// // //             >
// // //               <ChevronRight className="w-4 h-4" />
// // //             </button>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // const PaymentRecords = () => {
// // //   const { ttoken, getPaymentRecords } = useContext(TourContext);

// // //   const [records, setRecords] = useState([]);
// // //   // tourBookingModel la advance.paid = true bookings (backend → advancePaid)
// // //   const [advancePaid, setAdvancePaid] = useState([]);
// // //   const [loading, setLoading] = useState(false);
// // //   const [search, setSearch] = useState("");
// // //   const [type, setType] = useState("");
// // //   const [source, setSource] = useState("");
// // //   const [selTours, setSelTours] = useState([]);
// // //   const [tourQ, setTourQ] = useState("");
// // //   const [showDrop, setShowDrop] = useState(false);
// // //   const [from, setFrom] = useState("");
// // //   // Day box select → keezha table la andha naal mattum (IRCTC date strip maadhiri)
// // //   const [selDay, setSelDay] = useState("");
// // //   // Date dropdown la "Custom" select pannaa dhaan From / To theriyum
// // //   const [customRange, setCustomRange] = useState(false);
// // //   const [to, setTo] = useState("");
// // //   const [viewerIndex, setViewerIndex] = useState(null);
// // //   const [visibleCount, setVisibleCount] = useState(50);
// // //   // "asc" = oldest date first (default), "desc" = newest first.
// // //   const [sortDir, setSortDir] = useState("asc");
// // //   const dropRef = useRef(null);

// // //   const fetchRecords = useCallback(async () => {
// // //     if (!ttoken) return;
// // //     setLoading(true);
// // //     try {
// // //       const params = {};
// // //       if (from) params.from = from;
// // //       if (to) params.to = to;
// // //       const data = await getPaymentRecords(params);
// // //       if (data?.success) {
// // //         setRecords(data.records || []);
// // //         setAdvancePaid(data.advancePaid || []);
// // //       } else {
// // //         toast.error(data?.message || "Could not load payment records");
// // //       }
// // //     } catch (err) {
// // //       console.error("getPaymentRecords error:", err);
// // //       toast.error(err.response?.data?.message || err.message || "Could not load payment records");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // //   }, [ttoken, from, to]);

// // //   useEffect(() => {
// // //     fetchRecords();
// // //   }, [fetchRecords]);

// // //   useEffect(() => {
// // //     setVisibleCount(50);
// // //   }, [search, type, source, selTours, from, to, sortDir]);

// // //   // ── Tour search (same behaviour as the Sales Dashboard) ──────────────
// // //   const tourOptions = useMemo(
// // //     () => [...new Set(records.map((r) => r.tourTitle).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
// // //     [records],
// // //   );
// // //   // Tour picker — a checkbox list of every tour that has payments; typing
// // //   // narrows the list. The list stays open while ticking several tours.
// // //   const tourMatches = useMemo(() => {
// // //     const q = tourQ.trim().toLowerCase();
// // //     if (!q) return tourOptions;
// // //     return tourOptions.filter((t) => t.toLowerCase().includes(q));
// // //   }, [tourOptions, tourQ]);
// // //   useEffect(() => {
// // //     const h = (e) => {
// // //       if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false);
// // //     };
// // //     document.addEventListener("mousedown", h);
// // //     return () => document.removeEventListener("mousedown", h);
// // //   }, []);
// // //   const toggleTour = (t) =>
// // //     setSelTours((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
// // //   const allMatchesSelected = tourMatches.length > 0 && tourMatches.every((t) => selTours.includes(t));
// // //   const toggleAllTours = () =>
// // //     setSelTours((p) =>
// // //       allMatchesSelected
// // //         ? p.filter((t) => !tourMatches.includes(t))
// // //         : [...p, ...tourMatches.filter((t) => !p.includes(t))],
// // //     );
// // //   const removeTour = (t) => setSelTours((p) => p.filter((x) => x !== t));

// // //   // Everything except the type filter — the split bar is built from this,
// // //   // so its segments still show all three types while one is selected.
// // //   const baseFiltered = useMemo(() => {
// // //     const q = search.trim().toLowerCase();
// // //     return records.filter((r) => {
// // //       if (source && r.bookingSource !== source) return false;
// // //       if (selTours.length && !selTours.includes(r.tourTitle)) return false;
// // //       if (!q) return true;
// // //       return [r.tnr, r.name, r.remarks, r.tourTitle, uploaderName(r.uploader), r.amount != null ? String(r.amount) : ""]
// // //         .join(" ")
// // //         .toLowerCase()
// // //         .includes(q);
// // //     });
// // //   }, [records, search, source, selTours]);

// // //   const filtered = useMemo(() => {
// // //     let list = type ? baseFiltered.filter((r) => r.type === type) : baseFiltered;
// // //     if (selDay) list = list.filter((r) => dayKey(r.createdAt) === selDay);
// // //     return [...list].sort((a, b) =>
// // //       sortDir === "asc"
// // //         ? new Date(a.createdAt) - new Date(b.createdAt)
// // //         : new Date(b.createdAt) - new Date(a.createdAt),
// // //     );
// // //   }, [baseFiltered, type, sortDir, selDay]);

// // //   const split = useMemo(() => {
// // //     const t = { advance: 0, balance: 0, partial: 0, count: { advance: 0, balance: 0, partial: 0 } };
// // //     baseFiltered.forEach((r) => {
// // //       if (t[r.type] === undefined) return;
// // //       t[r.type] += Number(r.amount) || 0;
// // //       t.count[r.type] += 1;
// // //     });
// // //     t.all = t.advance + t.balance + t.partial;
// // //     return t;
// // //   }, [baseFiltered]);

// // //   const shownTotal = type ? split[type] : split.all;

// // //   // Advance paid bookings — tourBookingModel la payment.advance.paid = true.
// // //   // Naal = advance paidAt. Search / Tour / Admin-User filter ku yetha maadhiri.
// // //   const advanceBookings = useMemo(() => {
// // //     const q = search.trim().toLowerCase();
// // //     const byDay = new Map(); // dayKey → [tnr...]
// // //     let total = 0;
// // //     advancePaid.forEach((b) => {
// // //       if (source && b.bookingSource !== source) return;
// // //       if (selTours.length && !selTours.includes(b.tourTitle)) return;
// // //       if (q && ![b.tnr, b.name, b.tourTitle].join(" ").toLowerCase().includes(q)) return;
// // //       const k = dayKey(b.bookedAt || b.paidAt); // tour booking date (advance.paid === true)
// // //       if (!byDay.has(k)) byDay.set(k, []);
// // //       byDay.get(k).push(b);
// // //       total += 1;
// // //     });
// // //     return { byDay, total };
// // //   }, [advancePaid, search, source, selTours]);
// // //   const advanceCountOn = (k) => advanceBookings.byDay.get(k)?.length || 0;

// // //   // ── Advance paid bookings (tour bookings, advance.paid === true) ──
// // //   // Filter illana: inniku mattum. From / To pottaa: andha naatkal mattum —
// // //   // bookings = andha naatkal la motham, average = motham ÷ naatkal.
// // //   const todayKey = dayKey(new Date());
// // //   const advanceTnrsOn = (k) => (advanceBookings.byDay.get(k) || []).map((b) => b.tnr);
// // //   const advanceListOn = (k) => advanceBookings.byDay.get(k) || [];
// // //   const perDay = useMemo(() => {
// // //     let start = from || to || todayKey;
// // //     let end = to || (from ? todayKey : todayKey);
// // //     if (!from && to) start = to; // To mattum → andha oru naal
// // //     if (end > todayKey && start <= todayKey) end = todayKey;
// // //     if (start > end) [start, end] = [end, start];
// // //     let total = 0;
// // //     advanceBookings.byDay.forEach((items, k) => {
// // //       if (k >= start && k <= end) total += items.length;
// // //     });
// // //     const toUTC = (k) => { const [y, m, d] = k.split("-").map(Number); return Date.UTC(y, m - 1, d); };
// // //     const days = Math.round((toUTC(end) - toUTC(start)) / 86400000) + 1;

// // //     // Days with bookings / Busiest day / day boxes:
// // //     // filter illana mudhal advance booking naal → inniku varai; filter pottaa andha naatkal.
// // //     let aStart = start;
// // //     let aEnd = end;
// // //     if (!from && !to) {
// // //       const first = [...advanceBookings.byDay.keys()].sort()[0];
// // //       if (first && first < aStart) aStart = first;
// // //     }
// // //     let activeDays = 0;
// // //     let best = null;
// // //     advanceBookings.byDay.forEach((items, k) => {
// // //       if (k < aStart || k > aEnd) return;
// // //       activeDays += 1;
// // //       if (!best || items.length > best.n) best = { k, n: items.length };
// // //     });

// // //     // Keezha day boxes — Payment Records filter padi: filter illana inniku mattum,
// // //     // From / To pottaa andha naatkal la booking aana naatkal.
// // //     const list = []; // [dayKey, bookings]
// // //     advanceBookings.byDay.forEach((items, k) => {
// // //       if (k >= start && k <= end) list.push([k, items]);
// // //     });
// // //     if (!from && !to && !list.length) list.push([todayKey, []]); // inniku 0 bookings na kooda box
// // //     const allDays = Math.round((toUTC(aEnd) - toUTC(aStart)) / 86400000) + 1;
// // //     list.sort((a, b) => (sortDir === "asc" ? a[0].localeCompare(b[0]) : b[0].localeCompare(a[0])));
// // //     return { total, days, avg: days ? total / days : 0, start, end, activeDays, allDays, aStart, best, list };
// // //   }, [advanceBookings, from, to, todayKey, sortDir]);

// // //   // Day box click → andha naal details keezha. Matha boxes maraiyaadhu.
// // //   useEffect(() => { setSelDay(""); }, [from, to]);
// // //   const fmtAvg = (n) => String(Math.round(n)); // round off — 4.3 → 4, 4.5 → 5

// // //   const visible = filtered.slice(0, visibleCount);

// // //   const days = useMemo(() => {
// // //     const out = [];
// // //     const byKey = new Map();
// // //     visible.forEach((r, i) => {
// // //       const k = dayKey(r.createdAt);
// // //       if (!byKey.has(k)) {
// // //         const g = { key: k, rows: [], total: 0 };
// // //         byKey.set(k, g);
// // //         out.push(g);
// // //       }
// // //       const g = byKey.get(k);
// // //       g.rows.push({ r, index: i });
// // //       g.total += Number(r.amount) || 0;
// // //     });
// // //     return out;
// // //   }, [visible]);

// // //   const hasFilters = search || type || source || selTours.length || from || to || selDay;
// // //   const clearFilters = () => {
// // //     setSelDay("");
// // //     setCustomRange(false);
// // //     setSearch("");
// // //     setType("");
// // //     setSource("");
// // //     setSelTours([]);
// // //     setTourQ("");
// // //     setFrom("");
// // //     setTo("");
// // //   };

// // //   const fieldCls =
// // //     "w-full h-9 px-3 rounded-lg border border-[#DCE5E0] bg-white text-sm text-[#1B2B26] placeholder:text-[#8FA39B] outline-none focus:border-[#2E9E4F] focus:ring-2 focus:ring-[#2E9E4F]/15";

// // //   return (
// // //     <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#EEF5F0] pt-16 pb-4 sm:pb-5 lg:pt-5 px-3 sm:px-6 text-[#1B2B26] text-sm">
// // //       <div className="max-w-7xl mx-auto">
// // //         {/* Header */}
// // //         <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
// // //           <div>
// // //             <h1 className="text-xl font-bold tracking-tight">Payment Records</h1>
// // //             <p className="text-xs text-[#6B7F77]">Advance, balance and partial payment screenshots, {sortDir === "asc" ? "oldest" : "newest"} first</p>
// // //           </div>
// // //           <div className="flex items-center gap-2 w-full sm:w-auto [&>button]:flex-1 sm:[&>button]:flex-none [&>button]:justify-center">
// // //             <button
// // //               type="button"
// // //               onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
// // //               title="Change date order"
// // //               className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[#DCE5E0] bg-white text-sm font-semibold text-[#1B2B26] hover:bg-[#F7F9F8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2E9E4F]"
// // //             >
// // //               <ArrowUpDown className="w-4 h-4 text-[#2E9E4F]" />
// // //               {sortDir === "asc" ? "Oldest first" : "Newest first"}
// // //             </button>
// // //             <button
// // //               type="button"
// // //               onClick={fetchRecords}
// // //               disabled={loading}
// // //               className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#2E9E4F] hover:bg-[#268A44] text-white text-sm font-semibold disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E6FD9]"
// // //             >
// // //               <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
// // //             </button>
// // //           </div>
// // //         </div>

// // //         {/* Summary receipt — total + three type cells split by perforated
// // //             dividers; the coloured strip along the bottom shows the split.
// // //             Clicking a type cell filters the statement to that type. */}
// // //         <section className="bg-white rounded-2xl border border-[#DCE5E0] overflow-hidden mb-4">
// // //           <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
// // //             <div className="col-span-2 sm:col-span-3 xl:col-span-1 px-4 py-3.5 bg-[#F1F8F3] border-b xl:border-b-0 xl:border-r border-dashed border-[#CFE3D6]">
// // //               <p className="text-xs text-[#4B5F57]">
// // //                 {type ? `${TYPE_META[type].label} received` : "Total received"}
// // //               </p>
// // //               <p className="text-xl sm:text-2xl font-bold tabular-nums tracking-tight text-[#1F7A3D] break-all">₹{formatAmount(shownTotal)}</p>
// // //               <p className="text-[11px] text-[#8FA39B]">
// // //                 {filtered.length} screenshot{filtered.length !== 1 ? "s" : ""}
// // //                 {type && (
// // //                   <button type="button" onClick={() => setType("")} className="ml-2 font-semibold text-[#1E6FD9] hover:underline">
// // //                     Show all
// // //                   </button>
// // //                 )}
// // //               </p>
// // //             </div>
// // //             {TYPE_ORDER.map((k, i) => {
// // //               const m = TYPE_META[k];
// // //               const active = type === k;
// // //               const bar = k === "partial" ? "#F4B400" : m.color;
// // //               return (
// // //                 <button
// // //                   key={k}
// // //                   type="button"
// // //                   onClick={() => setType(active ? "" : k)}
// // //                   aria-pressed={active}
// // //                   className={`relative min-w-0 text-left px-3 sm:px-4 py-3 sm:py-3.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1E6FD9] ${i < 2 ? "border-r border-dashed border-[#DCE5E0]" : "xl:border-r-0"
// // //                     } ${i === 2 ? "col-span-2 sm:col-span-1 border-t sm:border-t-0 border-dashed border-[#DCE5E0]" : ""} ${active ? "" : "hover:bg-[#FAFCFB]"
// // //                     } ${type && !active ? "opacity-50" : ""}`}
// // //                   style={active ? { background: m.soft } : undefined}
// // //                 >
// // //                   <span className="absolute left-0 top-0 h-full w-[3px]" style={{ background: active ? bar : "transparent" }} />
// // //                   <span className="flex items-center gap-1.5 text-xs font-semibold text-[#4B5F57]">
// // //                     <span className="w-2 h-2 rounded-full shrink-0" style={{ background: bar }} />
// // //                     {m.label}
// // //                     <span className="ml-auto text-[11px] font-medium text-[#8FA39B] tabular-nums">{split.count[k]}</span>
// // //                   </span>
// // //                   <span className="block text-base sm:text-lg font-bold tabular-nums mt-0.5 truncate">₹{formatAmount(split[k])}</span>
// // //                   <span className="block text-[11px] text-[#8FA39B] tabular-nums">
// // //                     {split.all ? Math.round((split[k] / split.all) * 100) : 0}% of total
// // //                   </span>
// // //                 </button>
// // //               );
// // //             })}
// // //           </div>
// // //           <div className="flex h-1.5 w-full bg-[#EEF2EF]" aria-hidden="true">
// // //             {TYPE_ORDER.map((k) =>
// // //               split[k] > 0 ? (
// // //                 <div
// // //                   key={k}
// // //                   style={{
// // //                     width: `${(split[k] / (split.all || 1)) * 100}%`,
// // //                     background: k === "partial" ? "#F4B400" : TYPE_META[k].color,
// // //                     opacity: type && type !== k ? 0.25 : 1,
// // //                   }}
// // //                   className="h-full transition-opacity"
// // //                 />
// // //               ) : null,
// // //             )}
// // //           </div>
// // //         </section>

// // //         {/* Advance paid bookings (tour bookings, advance.paid === true) — inniku, illana filter potta naatkal */}
// // //         <section className="bg-white rounded-2xl border border-[#DCE5E0] p-3 mb-4">
// // //           <p className="text-xs font-semibold text-[#1E6FD9]">Advance paid bookings</p>
// // //           <p className="text-[11px] text-[#8FA39B] mb-2">
// // //             {perDay.start === perDay.end
// // //               ? `${perDay.start === todayKey ? "Today · " : ""}${payRangeLabel(perDay.start)}`
// // //               : `${payRangeLabel(perDay.start)} – ${payRangeLabel(perDay.end)} · ${perDay.days} days`}
// // //           </p>
// // //           <div className="grid grid-cols-2 gap-2">
// // //             <div className="rounded-lg bg-[#E8F1FD] px-3 py-2">
// // //               <p className="text-[11px] text-[#4B5F57]">Bookings (advance paid)</p>
// // //               <p className="text-xl font-bold tabular-nums text-[#1E6FD9] leading-tight">{perDay.total}</p>
// // //             </div>
// // //             <div className="rounded-lg bg-[#E7F6EC] px-3 py-2">
// // //               <p className="text-[11px] text-[#4B5F57]">Average per day</p>
// // //               <p className="text-xl font-bold tabular-nums text-[#0F7A5A] leading-tight">{fmtAvg(perDay.avg)}</p>
// // //               {perDay.days > 1 && (
// // //                 <p className="text-[10.5px] text-[#8FA39B] tabular-nums">{perDay.total} ÷ {perDay.days} days</p>
// // //               )}
// // //             </div>
// // //           </div>

// // //           {/* Days with bookings + Busiest day */}
// // //           <div className="mt-2 grid grid-cols-2 gap-2">
// // //             <div className="rounded-lg border border-[#DCE5E0] bg-[#F7F9F8] px-3 py-2">
// // //               <p className="text-[11px] text-[#6B7F77]">Days with bookings</p>
// // //               <p className="text-base font-bold tabular-nums text-[#1B2B26] leading-tight">
// // //                 {perDay.activeDays} / {perDay.allDays}
// // //               </p>
// // //               <p className="text-[10.5px] text-[#8FA39B]">
// // //                 {!from && !to && perDay.activeDays ? `Since ${payRangeLabel(perDay.aStart)}` : perDay.activeDays ? "" : "No bookings"}
// // //               </p>
// // //             </div>
// // //             {perDay.best ? (
// // //               <button
// // //                 type="button"
// // //                 onClick={() => setSelDay((d) => (d === perDay.best.k ? "" : perDay.best.k))}
// // //                 title="Show this day's bookings"
// // //                 className={`text-left rounded-lg border px-3 py-2 hover:bg-[#EEF3F0] ${selDay === perDay.best.k ? "border-[#1E6FD9] bg-[#E8F1FD]" : "border-[#DCE5E0] bg-[#F7F9F8]"}`}
// // //               >
// // //                 <p className="text-[11px] text-[#6B7F77]">Busiest day</p>
// // //                 <p className="text-base font-bold tabular-nums text-[#1B2B26] leading-tight">
// // //                   {perDay.best.n} booking{perDay.best.n !== 1 ? "s" : ""}
// // //                 </p>
// // //                 <p className="text-[10.5px] text-[#8FA39B]">{payRangeLabel(perDay.best.k)}</p>
// // //               </button>
// // //             ) : (
// // //               <div className="rounded-lg border border-[#DCE5E0] bg-[#F7F9F8] px-3 py-2">
// // //                 <p className="text-[11px] text-[#6B7F77]">Busiest day</p>
// // //                 <p className="text-base font-bold text-[#8FA39B] leading-tight">—</p>
// // //               </div>
// // //             )}
// // //           </div>

// // //           {/* Day boxes — click pannaa andha naal details keezha; matha boxes apdiye irukkum */}
// // //           {perDay.list.length > 0 && (
// // //             <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
// // //               {perDay.list.map(([k, items]) => {
// // //                 const dp = dayParts(k);
// // //                 const active = selDay === k;
// // //                 return (
// // //                   <button
// // //                     key={k}
// // //                     type="button"
// // //                     aria-pressed={active}
// // //                     onClick={() => setSelDay(active ? "" : k)}
// // //                     className={`shrink-0 text-left rounded-lg border px-3 py-1.5 ${active ? "border-[#1E6FD9] bg-[#E8F1FD]" : "border-[#DCE5E0] hover:bg-[#F7F9F8]"}`}
// // //                   >
// // //                     <span className="block text-[11px] text-[#6B7F77] whitespace-nowrap">
// // //                       {String(dp.day).padStart(2, "0")} {dp.month} {String(dp.year).slice(2)} · {dp.rel}
// // //                     </span>
// // //                     <span className="block text-sm font-bold tabular-nums text-[#1E6FD9]">
// // //                       {items.length} booking{items.length !== 1 ? "s" : ""}
// // //                     </span>
// // //                   </button>
// // //                 );
// // //               })}
// // //             </div>
// // //           )}

// // //           {selDay && (
// // //             <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
// // //               <span className="rounded-full bg-[#E8F1FD] text-[#1E6FD9] font-semibold px-2.5 py-1">
// // //                 Showing {payRangeLabel(selDay)} only
// // //               </span>
// // //               <button type="button" onClick={() => setSelDay("")} className="font-semibold text-[#4B5F57] underline hover:text-[#1B2B26]">
// // //                 Show all days
// // //               </button>
// // //             </div>
// // //           )}
// // //         </section>

// // //         {/* Filters — one compact toolbar */}
// // //         <section className="bg-white rounded-2xl border border-[#DCE5E0] p-3 mb-4">
// // //           <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
// // //             <div className="col-span-2 md:col-span-1 relative min-w-0">
// // //               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA39B] pointer-events-none" />
// // //               <input
// // //                 aria-label="Search guest, TNR, bank or amount"
// // //                 type="text"
// // //                 value={search}
// // //                 onChange={(e) => setSearch(e.target.value)}
// // //                 placeholder="Guest, TNR, bank or amount"
// // //                 className={`${fieldCls} pl-9 pr-8`}
// // //               />
// // //               {search && (
// // //                 <button
// // //                   type="button"
// // //                   onClick={() => setSearch("")}
// // //                   aria-label="Clear search"
// // //                   className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-[#8FA39B] hover:text-[#1B2B26]"
// // //                 >
// // //                   <X className="w-4 h-4" />
// // //                 </button>
// // //               )}
// // //             </div>
// // //             <div className="col-span-2 md:col-span-1 relative min-w-0" ref={dropRef}>
// // //               <button
// // //                 type="button"
// // //                 onClick={() => setShowDrop((v) => !v)}
// // //                 aria-haspopup="listbox"
// // //                 aria-expanded={showDrop}
// // //                 className={`${fieldCls} flex items-center gap-2 text-left`}
// // //               >
// // //                 <Search className="w-4 h-4 shrink-0 text-[#8FA39B]" />
// // //                 <span className={`flex-1 truncate ${selTours.length ? "text-[#1B2B26] font-medium" : "text-[#8FA39B]"}`}>
// // //                   {selTours.length === 0
// // //                     ? "All tours"
// // //                     : selTours.length === 1
// // //                       ? selTours[0]
// // //                       : `${selTours.length} tours selected`}
// // //                 </span>
// // //                 <ChevronRight className={`w-4 h-4 shrink-0 text-[#8FA39B] transition-transform ${showDrop ? "-rotate-90" : "rotate-90"}`} />
// // //               </button>
// // //               {showDrop && (
// // //                 <div className="absolute left-0 right-0 md:right-auto md:w-[360px] top-[calc(100%+4px)] z-30 bg-white border border-[#DCE5E0] rounded-xl shadow-lg overflow-hidden">
// // //                   <div className="p-2 border-b border-[#EEF2EF]">
// // //                     <div className="relative">
// // //                       <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8FA39B] pointer-events-none" />
// // //                       <input
// // //                         autoFocus
// // //                         aria-label="Search tour"
// // //                         type="text"
// // //                         value={tourQ}
// // //                         onChange={(e) => setTourQ(e.target.value)}
// // //                         placeholder="Search tour"
// // //                         className="w-full h-8 pl-8 pr-2 rounded-md border border-[#DCE5E0] text-sm outline-none focus:border-[#2E9E4F]"
// // //                       />
// // //                     </div>
// // //                   </div>
// // //                   {tourMatches.length === 0 ? (
// // //                     <p className="px-3 py-4 text-sm text-[#8FA39B] text-center">No tours match "{tourQ}"</p>
// // //                   ) : (
// // //                     <ul role="listbox" aria-multiselectable="true" className="max-h-64 overflow-y-auto py-1">
// // //                       <li>
// // //                         <label className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#1F7A3D] cursor-pointer hover:bg-[#F1F8F3] border-b border-[#EEF2EF]">
// // //                           <input
// // //                             type="checkbox"
// // //                             checked={allMatchesSelected}
// // //                             onChange={toggleAllTours}
// // //                             className="w-4 h-4 accent-[#2E9E4F]"
// // //                           />
// // //                           {tourQ ? `Select all matching (${tourMatches.length})` : `Select all tours (${tourMatches.length})`}
// // //                         </label>
// // //                       </li>
// // //                       {tourMatches.map((t) => {
// // //                         const checked = selTours.includes(t);
// // //                         const count = records.filter((r) => r.tourTitle === t).length;
// // //                         return (
// // //                           <li key={t}>
// // //                             <label
// // //                               className={`flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-[#F7F9F8] ${checked ? "bg-[#F1F8F3]" : ""
// // //                                 }`}
// // //                             >
// // //                               <input
// // //                                 type="checkbox"
// // //                                 checked={checked}
// // //                                 onChange={() => toggleTour(t)}
// // //                                 className="w-4 h-4 shrink-0 accent-[#2E9E4F]"
// // //                               />
// // //                               <span className={`flex-1 min-w-0 truncate ${checked ? "font-semibold text-[#1F7A3D]" : ""}`}>{t}</span>
// // //                               <span className="text-[11px] text-[#8FA39B] tabular-nums shrink-0">{count}</span>
// // //                             </label>
// // //                           </li>
// // //                         );
// // //                       })}
// // //                     </ul>
// // //                   )}
// // //                   <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-[#EEF2EF] bg-[#FAFCFB]">
// // //                     <button
// // //                       type="button"
// // //                       onClick={() => setSelTours([])}
// // //                       disabled={!selTours.length}
// // //                       className="text-xs font-semibold text-[#6B7F77] hover:text-[#1B2B26] disabled:opacity-40"
// // //                     >
// // //                       Clear
// // //                     </button>
// // //                     <button
// // //                       type="button"
// // //                       onClick={() => {
// // //                         setShowDrop(false);
// // //                         setTourQ("");
// // //                       }}
// // //                       className="h-7 px-3 rounded-md bg-[#2E9E4F] text-white text-xs font-semibold hover:bg-[#268A44]"
// // //                     >
// // //                       Done{selTours.length ? ` (${selTours.length})` : ""}
// // //                     </button>
// // //                   </div>
// // //                 </div>
// // //               )}
// // //             </div>
// // //             <select
// // //               aria-label="Date"
// // //               value={(() => {
// // //                 if (customRange) return "custom";
// // //                 const hit = QUICK_DAYS.find(({ offset }) => {
// // //                   const k = dayOffsetKey(offset);
// // //                   return from === k && to === k;
// // //                 });
// // //                 if (hit) return String(hit.offset);
// // //                 return from || to ? "custom" : "";
// // //               })()}
// // //               onChange={(e) => {
// // //                 const v = e.target.value;
// // //                 if (v === "custom") {
// // //                   setCustomRange(true);
// // //                   return;
// // //                 }
// // //                 setCustomRange(false);
// // //                 if (v === "") {
// // //                   setFrom("");
// // //                   setTo("");
// // //                 } else {
// // //                   const k = dayOffsetKey(Number(v));
// // //                   setFrom(k);
// // //                   setTo(k);
// // //                 }
// // //               }}
// // //               className={`${fieldCls} col-span-2 md:col-span-1 pr-8 cursor-pointer`}
// // //             >
// // //               <option value="">All dates</option>
// // //               {QUICK_DAYS.map(({ offset, label }) => (
// // //                 <option key={offset} value={String(offset)}>
// // //                   {label}
// // //                 </option>
// // //               ))}
// // //               <option value="custom">Custom</option>
// // //             </select>
// // //             {(customRange || ((from || to) && !QUICK_DAYS.some(({ offset }) => { const k = dayOffsetKey(offset); return from === k && to === k; }))) && (
// // //               <>
// // //               <label className="relative min-w-0">
// // //                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#8FA39B] pointer-events-none">From</span>
// // //                 <input type="date" value={from} max={to || todayKey} onChange={(e) => setFrom(e.target.value > todayKey ? todayKey : e.target.value)} className={`${fieldCls} pl-12`} />
// // //               </label>
// // //               <label className="relative min-w-0">
// // //                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#8FA39B] pointer-events-none">To</span>
// // //                 <input type="date" value={to} min={from || undefined} max={todayKey} onChange={(e) => setTo(e.target.value > todayKey ? todayKey : e.target.value)} className={`${fieldCls} pl-9`} />
// // //               </label>
// // //               </>
// // //             )}
// // //             <div className="col-span-2 md:col-span-1 flex h-9 rounded-lg border border-[#DCE5E0] p-0.5 bg-[#F7F9F8]" role="group" aria-label="Booking type">
// // //               {[
// // //                 { v: "", l: "All" },
// // //                 { v: "admin", l: "Admin" },
// // //                 { v: "user", l: "User" },
// // //               ].map((o) => (
// // //                 <button
// // //                   key={o.v || "all"}
// // //                   type="button"
// // //                   onClick={() => setSource(o.v)}
// // //                   aria-pressed={source === o.v}
// // //                   className={`flex-1 px-3 rounded-md text-xs font-semibold ${source === o.v ? "bg-white text-[#1F7A3D] shadow-sm" : "text-[#6B7F77] hover:text-[#1B2B26]"
// // //                     }`}
// // //                 >
// // //                   {o.l}
// // //                 </button>
// // //               ))}
// // //             </div>
// // //           </div>

// // //           {(selTours.length > 0 || hasFilters) && (
// // //             <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
// // //               {selTours.map((t) => (
// // //                 <span
// // //                   key={t}
// // //                   className="inline-flex items-center gap-1 max-w-full h-7 pl-2.5 pr-1.5 rounded-md bg-[#F1F8F3] border border-[#CFE3D6] text-[#1F7A3D] text-xs font-semibold"
// // //                 >
// // //                   <span className="truncate">{t}</span>
// // //                   <button type="button" onClick={() => removeTour(t)} aria-label={`Remove ${t}`} className="shrink-0 hover:text-[#1B2B26]">
// // //                     <X className="w-3.5 h-3.5" />
// // //                   </button>
// // //                 </span>
// // //               ))}
// // //               {hasFilters && (
// // //                 <button type="button" onClick={clearFilters} className="ml-auto text-xs font-semibold text-[#6B7F77] hover:text-[#1B2B26] hover:underline">
// // //                   Clear all filters
// // //                 </button>
// // //               )}
// // //             </div>
// // //           )}
// // //         </section>

// // //         {/* Statement */}
// // //         <section className="bg-white rounded-2xl border border-[#DCE5E0] overflow-hidden">
// // //           {loading && records.length === 0 ? (
// // //             <div className="flex justify-center py-20">
// // //               <Loader2 className="w-9 h-9 animate-spin text-[#3B5BDB]" />
// // //             </div>
// // //           ) : filtered.length === 0 ? (
// // //             <div className="py-16 px-4 text-center">
// // //               <FileImage className="w-10 h-10 mx-auto mb-3 text-[#B9C9C1]" />
// // //               <p className="font-semibold">No payment screenshots match</p>
// // //               <p className="text-sm text-[#4B5F57] mt-1">
// // //                 {hasFilters ? "Change or clear the filters to see more." : "Payment screenshots will show here once they are uploaded."}
// // //               </p>
// // //             </div>
// // //           ) : (
// // //             <>
// // //               <div className="hidden xl:block overflow-x-auto">
// // //                 {/* table-fixed — screen agalathukku ulla adangum, side la cut aagaadhu */}
// // //                 <table className="w-full table-fixed text-sm border-collapse">
// // //                   <thead>
// // //                     <tr className="text-xs text-[#1F7A3D] bg-[#F2FAF4] border-b border-[#CFE3D6]">
// // //                       <th className="pl-4 pr-2 py-3 text-left font-semibold w-[5.5rem]">Time</th>
// // //                       <th className="px-2 py-3 text-left font-semibold w-16">Proof</th>
// // //                       <th className="px-2 py-3 text-left font-semibold w-[24%]">Guest and TNR</th>
// // //                       <th className="px-2 py-3 text-left font-semibold w-[9%]">Bank</th>
// // //                       <th className="px-2 py-3 text-left font-semibold">Tour</th>
// // //                       <th className="px-2 py-3 text-left font-semibold w-[15%]">Uploaded by</th>
// // //                       <th className="pl-2 pr-4 py-3 text-right font-semibold w-28">Amount</th>
// // //                     </tr>
// // //                   </thead>
// // //                   {days.map((g) => {
// // //                     const dp = dayParts(g.key);
// // //                     return (
// // //                       <tbody key={g.key}>
// // //                         <tr className="border-y border-[#DCE5E0] bg-[#FAFCFB]">
// // //                           <td colSpan={6} className="pl-4 pr-2 py-3">
// // //                             <div className="flex items-center gap-3">
// // //                               <DateStamp dp={dp} />
// // //                               <div>
// // //                                 <p className="font-semibold leading-tight">{dp.rel}</p>
// // //                                 <p className="text-xs text-[#8FA39B]">{g.rows.length} payment{g.rows.length !== 1 ? "s" : ""} received</p>
// // //                               </div>
// // //                               <AdvanceBookingsBadge count={advanceCountOn(g.key)} tnrs={advanceTnrsOn(g.key)} />
// // //                             </div>
// // //                           </td>
// // //                           <td className="pl-2 pr-4 py-3 text-right">
// // //                             <span className="inline-block rounded-lg bg-[#E4F5EA] text-[#1F7A3D] px-3 py-1 font-bold tabular-nums">
// // //                               ₹{formatAmount(g.total)}
// // //                             </span>
// // //                           </td>
// // //                         </tr>
// // //                         {g.rows.map(({ r, index }) => {
// // //                           const m = TYPE_META[r.type] || TYPE_META.partial;
// // //                           return (
// // //                             <tr key={r._id} className="border-b border-[#EEF2EF] last:border-0 hover:bg-[#F7F9F8]">
// // //                               <td className="pl-4 pr-2 py-2.5 align-middle whitespace-nowrap tabular-nums text-[#4B5F57]">
// // //                                 <span className="relative pl-3">
// // //                                   <span className="absolute left-0 top-0.5 bottom-0.5 w-1 rounded-full" style={{ background: m.color }} />
// // //                                   {formatTime(r.createdAt)}
// // //                                 </span>
// // //                               </td>
// // //                               <td className="px-2 py-3">
// // //                                 <button
// // //                                   type="button"
// // //                                   onClick={() => setViewerIndex(index)}
// // //                                   aria-label="View screenshot"
// // //                                   className="relative block w-10 h-10 rounded-md overflow-hidden border border-[#DCE5E0] bg-[#EEF2EF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3B5BDB] hover:border-[#3B5BDB]"
// // //                                 >
// // //                                   <img src={toPreviewUrl(r.url)} alt="" loading="lazy" className="w-full h-full object-cover" />
// // //                                   {isPdf(r.url) && (
// // //                                     <span className="absolute inset-x-0 bottom-0 text-[9px] font-bold text-center bg-[#1B2B26]/70 text-white">
// // //                                       PDF
// // //                                     </span>
// // //                                   )}
// // //                                 </button>
// // //                               </td>
// // //                               <td className="px-2 py-3 min-w-0">
// // //                                 <p className="font-semibold truncate" title={r.name}>{r.name || "Unnamed guest"}</p>
// // //                                 {r.tnr ? (
// // //                                   <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-[#3B5BDB]">
// // //                                     <span className="select-all">{r.tnr}</span> <CopyTnr tnr={r.tnr} />
// // //                                   </span>
// // //                                 ) : (
// // //                                   <span className="text-xs text-[#8FA39B]">TNR not linked yet</span>
// // //                                 )}
// // //                               </td>
// // //                               <td className="px-2 py-3 text-[#4B5F57]">
// // //                                 <span className="block truncate" title={r.remarks}>{r.remarks || <span className="text-[#B9C9C1]">—</span>}</span>
// // //                               </td>
// // //                               <td className="px-2 py-3 text-[#4B5F57]">
// // //                                 <span className="block truncate" title={r.tourTitle}>{r.tourTitle || <span className="text-[#B9C9C1]">—</span>}</span>
// // //                                 <span
// // //                                   className={`mt-1 inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md ${r.bookingSource === "user" ? "bg-[#EBFBEE] text-[#2B8A3E]" : "bg-[#EDF2FF] text-[#364FC7]"
// // //                                     }`}
// // //                                 >
// // //                                   {r.bookingSource === "user" ? "User" : "Admin"}
// // //                                 </span>
// // //                               </td>
// // //                               <td className="px-2 py-3 min-w-0">
// // //                                 {r.uploader ? (
// // //                                   <>
// // //                                     <span className="block font-semibold truncate text-[#1B2B26]">{uploaderName(r.uploader)}</span>
// // //                                     {uploaderSubOf(r) && (
// // //                                       <span className="block text-[11px] text-[#8FA39B] truncate">{uploaderSubOf(r)}</span>
// // //                                     )}
// // //                                   </>
// // //                                 ) : (
// // //                                   <span className="text-[11px] text-[#B9C9C1]">Not recorded</span>
// // //                                 )}
// // //                               </td>
// // //                               <td className="pl-2 pr-4 py-3 text-right whitespace-nowrap">
// // //                                 <span className="block font-bold tabular-nums text-sm">
// // //                                   {r.amount ? `₹${formatAmount(r.amount)}` : <span className="text-[#B9C9C1] font-normal">—</span>}
// // //                                 </span>
// // //                                 <span className="text-xs font-semibold" style={{ color: m.color }}>
// // //                                   {m.label}
// // //                                 </span>
// // //                               </td>
// // //                             </tr>
// // //                           );
// // //                         })}
// // //                       </tbody>
// // //                     );
// // //                   })}
// // //                 </table>
// // //               </div>

// // //               {/* Mobile: same statement as a compact list */}
// // //               <div className="xl:hidden">
// // //                 {days.map((g) => {
// // //                   const dp = dayParts(g.key);
// // //                   return (
// // //                     <div key={g.key}>
// // //                       <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-[#FAFCFB] border-y border-[#DCE5E0]">
// // //                         <div className="flex items-center gap-2.5 min-w-0">
// // //                           <DateStamp dp={dp} />
// // //                           <div className="min-w-0">
// // //                             <p className="font-semibold text-sm leading-tight truncate">{dp.rel}</p>
// // //                             <p className="text-xs text-[#8FA39B]">{g.rows.length} received</p>
// // //                             <div className="mt-1">
// // //                               <AdvanceBookingsBadge count={advanceCountOn(g.key)} tnrs={advanceTnrsOn(g.key)} />
// // //                             </div>
// // //                           </div>
// // //                         </div>
// // //                         <span className="rounded-lg bg-[#E4F5EA] text-[#1F7A3D] px-2.5 py-1 font-bold tabular-nums text-sm shrink-0">
// // //                           ₹{formatAmount(g.total)}
// // //                         </span>
// // //                       </div>
// // //                       {g.rows.map(({ r, index }) => {
// // //                         const m = TYPE_META[r.type] || TYPE_META.partial;
// // //                         return (
// // //                           <div
// // //                             key={r._id}
// // //                             role="button"
// // //                             tabIndex={0}
// // //                             onClick={() => setViewerIndex(index)}
// // //                             onKeyDown={(e) => {
// // //                               if (e.key === "Enter" || e.key === " ") {
// // //                                 e.preventDefault();
// // //                                 setViewerIndex(index);
// // //                               }
// // //                             }}
// // //                             className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 border-b border-[#EEF2EF] text-left cursor-pointer active:bg-[#F7F9F8] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#2E9E4F]"
// // //                             style={{ boxShadow: `inset 3px 0 0 ${m.color}` }}
// // //                           >
// // //                             <span className="relative w-12 h-12 shrink-0 rounded-md overflow-hidden border border-[#DCE5E0] bg-[#EEF2EF]">
// // //                               <img src={toPreviewUrl(r.url)} alt="" loading="lazy" className="w-full h-full object-cover" />
// // //                               {isPdf(r.url) && (
// // //                                 <span className="absolute inset-x-0 bottom-0 text-[9px] font-bold text-center bg-[#1B2B26]/70 text-white">PDF</span>
// // //                               )}
// // //                             </span>
// // //                             <span className="min-w-0 flex-1">
// // //                               <span className="block font-semibold text-sm truncate">{r.name || "Unnamed guest"}</span>
// // //                               <span className="flex items-center gap-1 min-w-0 text-xs">
// // //                                 {r.tnr ? (
// // //                                   <>
// // //                                     <span className="font-semibold tracking-wide text-[#3B5BDB] select-all">{r.tnr}</span>
// // //                                     <CopyTnr tnr={r.tnr} size="lg" />
// // //                                   </>
// // //                                 ) : (
// // //                                   <span className="text-[#8FA39B]">No TNR</span>
// // //                                 )}
// // //                                 {r.remarks && <span className="text-[#4B5F57] truncate">· {r.remarks}</span>}
// // //                               </span>
// // //                               <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#8FA39B]">
// // //                                 <span className="tabular-nums">{formatTime(r.createdAt)}</span>
// // //                                 {r.tourTitle && <span className="hidden sm:inline truncate max-w-[260px]">· {r.tourTitle}</span>}
// // //                                 <span
// // //                                   className={`text-[10px] font-semibold px-1.5 py-px rounded ${r.bookingSource === "user" ? "bg-[#EBFBEE] text-[#2B8A3E]" : "bg-[#EDF2FF] text-[#364FC7]"
// // //                                     }`}
// // //                                 >
// // //                                   {r.bookingSource === "user" ? "User" : "Admin"}
// // //                                 </span>
// // //                                 {r.uploader && (
// // //                                   <span className="truncate max-w-[160px]">· by {uploaderName(r.uploader)}</span>
// // //                                 )}
// // //                               </span>
// // //                             </span>
// // //                             <span className="text-right shrink-0">
// // //                               <span className="block font-bold tabular-nums">
// // //                                 {r.amount ? `₹${formatAmount(r.amount)}` : "—"}
// // //                               </span>
// // //                               <span className="text-xs font-semibold" style={{ color: m.color }}>{m.label}</span>
// // //                             </span>
// // //                           </div>
// // //                         );
// // //                       })}
// // //                     </div>
// // //                   );
// // //                 })}
// // //               </div>
// // //             </>
// // //           )}
// // //         </section>

// // //         {filtered.length > visibleCount && (
// // //           <div className="text-center pt-5">
// // //             <button
// // //               type="button"
// // //               onClick={() => setVisibleCount((c) => c + 50)}
// // //               className="h-10 px-6 rounded-lg border border-[#DCE5E0] bg-white text-sm font-semibold hover:bg-[#F7F9F8]"
// // //             >
// // //               Show {Math.min(50, filtered.length - visibleCount)} more of {filtered.length - visibleCount}
// // //             </button>
// // //           </div>
// // //         )}
// // //       </div>

// // //       <Viewer items={visible} index={viewerIndex} onClose={() => setViewerIndex(null)} onNav={setViewerIndex} />
// // //     </div>
// // //   );
// // // };

// // // export default PaymentRecords;


// // import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
// // import { toast } from "react-toastify";
// // import {
// //   Search,
// //   X,
// //   Loader2,
// //   RefreshCw,
// //   ArrowUpDown,
// //   ChevronLeft,
// //   ChevronRight,
// //   ExternalLink,
// //   Copy,
// //   Check,
// //   FileImage,
// //   Landmark,
// //   FileDown,
// // } from "lucide-react";
// // import { TourContext } from "../../context/TourContext";

// // /*
// //   Payment Records — reads like a bank statement for the Aadhaar Upload
// //   payment screenshots. Each day is a block with its own subtotal; each row
// //   is one screenshot, with a coloured edge for its type. The one bold piece
// //   is the "money split" bar at the top: it shows how the filtered total
// //   divides into Advance / Balance / Partial, and clicking a segment filters
// //   the table to that type.
// // */

// // const INK = "#1B2B26";
// // const TYPE_META = {
// //   advance: { label: "Advance", color: "#1E6FD9", soft: "#E8F1FD" },
// //   balance: { label: "Balance", color: "#2E9E4F", soft: "#E7F6EC" },
// //   partial: { label: "Partial", color: "#D98E04", soft: "#FDF4DC" },
// // };
// // const TYPE_ORDER = ["advance", "balance", "partial"];

// // // A PDF on Cloudinary can't render in <img>; .jpg serves page 1 as an image.
// // const toPreviewUrl = (url = "") => url.replace(/\.pdf(\?.*)?$/i, ".jpg$1");
// // const isPdf = (url = "") => /\.pdf(\?.*)?$/i.test(url);

// // const formatAmount = (n) => (Number(n) || 0).toLocaleString("en-IN");
// // const formatTime = (d) =>
// //   new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
// // const formatDateTime = (d) =>
// //   new Date(d).toLocaleString("en-IN", {
// //     day: "2-digit",
// //     month: "short",
// //     year: "numeric",
// //     hour: "numeric",
// //     minute: "2-digit",
// //     hour12: true,
// //   });
// // const dayKey = (d) => {
// //   const x = new Date(d);
// //   return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
// // };
// // const dayParts = (key) => {
// //   const d = new Date(`${key}T00:00:00`);
// //   const today = dayKey(new Date());
// //   const y = new Date();
// //   y.setDate(y.getDate() - 1);
// //   const rel = key === today ? "Today" : key === dayKey(y) ? "Yesterday" : d.toLocaleDateString("en-IN", { weekday: "long" });
// //   return {
// //     day: d.getDate(),
// //     month: d.toLocaleDateString("en-IN", { month: "short" }),
// //     year: d.getFullYear(),
// //     rel,
// //   };
// // };

// // // Quick day filters — each sets From and To to that one day.
// // const dayOffsetKey = (offset) => {
// //   const d = new Date();
// //   d.setDate(d.getDate() + offset);
// //   return dayKey(d);
// // };
// // const QUICK_DAYS = [
// //   { offset: -2, label: "Day before yesterday" },
// //   { offset: -1, label: "Yesterday" },
// //   { offset: 0, label: "Today" },
// // ];

// // // Tear-off calendar leaf for each day block in the statement.
// // const DateStamp = ({ dp }) => (
// //   <span className="inline-flex flex-col w-11 shrink-0 rounded-lg overflow-hidden border border-[#CFE3D6] bg-white text-center shadow-sm">
// //     <span className="bg-[#2E9E4F] text-white text-[10px] font-semibold leading-4">
// //       {dp.month} {String(dp.year).slice(2)}
// //     </span>
// //     <span className="text-base font-bold tabular-nums leading-6 text-[#1B2B26]">{dp.day}</span>
// //   </span>
// // );

// // // "2026-11-08" → "08 Nov'26"
// // const payRangeLabel = (key) => {
// //   const d = new Date(`${key}T00:00:00`);
// //   if (Number.isNaN(d.getTime())) return key;
// //   return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleDateString("en-IN", { month: "short" }).slice(0, 3)}'${String(d.getFullYear()).slice(-2)}`;
// // };

// // // Andha naal advance pay panna bookings count (tourBookingModel). Mouse vachaa TNR list.
// // const AdvanceBookingsBadge = ({ count, tnrs = [] }) =>
// //   count > 0 ? (
// //     <span
// //       title={`Advance paid: ${tnrs.filter(Boolean).join(", ")}`}
// //       className="inline-flex items-center gap-1 rounded-md bg-[#E8F1FD] text-[#1E6FD9] px-2 py-0.5 text-[11px] font-semibold tabular-nums whitespace-nowrap"
// //     >
// //       {count} booking{count !== 1 ? "s" : ""} · advance paid
// //     </span>
// //   ) : null;

// // // Yaaru upload panna — { type, name, role } → "Pavithra · BAT" / "Tour admin" / "Admin"
// // const uploaderName = (u) => {
// //   if (!u) return "";
// //   if (u.type === "staff") return u.name || "Staff";
// //   if (u.type === "touradmin") return "Tour admin";
// //   if (u.type === "admin") return "Admin";
// //   if (u.type === "user") return u.name ? `${u.name} (Customer)` : "Customer";
// //   return u.name || "";
// // };
// // const uploaderSub = (u) => (u?.type === "staff" ? u.role || u.employeeId || "Staff" : "");
// // const uploaderSubOf = (r) => uploaderSub(r?.uploader); // staff → role / employee ID

// // // Works on every device: the Clipboard API needs HTTPS (or localhost), and
// // // some phones/in-app browsers don't have it, so fall back to a hidden
// // // textarea + execCommand("copy").
// // const copyText = async (text) => {
// //   try {
// //     if (navigator.clipboard && window.isSecureContext) {
// //       await navigator.clipboard.writeText(text);
// //       return true;
// //     }
// //   } catch (err) {
// //     console.error("Clipboard API copy failed, trying fallback:", err);
// //   }
// //   try {
// //     const ta = document.createElement("textarea");
// //     ta.value = text;
// //     ta.setAttribute("readonly", "");
// //     ta.style.position = "fixed";
// //     ta.style.top = "0";
// //     ta.style.left = "0";
// //     ta.style.opacity = "0";
// //     document.body.appendChild(ta);
// //     ta.focus();
// //     ta.select();
// //     ta.setSelectionRange(0, text.length);
// //     const ok = document.execCommand("copy");
// //     document.body.removeChild(ta);
// //     return ok;
// //   } catch (err) {
// //     console.error("Fallback copy failed:", err);
// //     return false;
// //   }
// // };

// // const CopyTnr = ({ tnr, size = "sm" }) => {
// //   const [copied, setCopied] = useState(false);
// //   const icon = size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5";
// //   return (
// //     <button
// //       type="button"
// //       onClick={async (e) => {
// //         e.stopPropagation();
// //         e.preventDefault();
// //         const ok = await copyText(tnr);
// //         if (ok) {
// //           setCopied(true);
// //           toast.success(`TNR ${tnr} copied`, { autoClose: 1200 });
// //           setTimeout(() => setCopied(false), 1500);
// //         } else {
// //           toast.error("Could not copy — long-press the TNR to copy it");
// //         }
// //       }}
// //       title="Copy TNR"
// //       aria-label={`Copy TNR ${tnr}`}
// //       className={`${size === "lg" ? "p-1.5" : "p-1"} -m-0.5 rounded-md text-[#8FA39B] hover:text-[#1B2B26] hover:bg-[#EEF2EF] active:bg-[#E4F5EA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3B5BDB] shrink-0`}
// //     >
// //       {copied ? <Check className={`${icon} text-[#2F9E44]`} /> : <Copy className={icon} />}
// //     </button>
// //   );
// // };

// // const Viewer = ({ items, index, onClose, onNav }) => {
// //   useEffect(() => {
// //     if (index === null) return undefined;
// //     const onKey = (e) => {
// //       if (e.key === "Escape") onClose();
// //       if (e.key === "ArrowLeft" && index > 0) onNav(index - 1);
// //       if (e.key === "ArrowRight" && index < items.length - 1) onNav(index + 1);
// //     };
// //     window.addEventListener("keydown", onKey);
// //     const prev = document.body.style.overflow;
// //     document.body.style.overflow = "hidden"; // pinnaadi page scroll aaga koodaadhu
// //     return () => {
// //       window.removeEventListener("keydown", onKey);
// //       document.body.style.overflow = prev;
// //     };
// //   }, [index, items.length, onClose, onNav]);

// //   if (index === null || !items[index]) return null;
// //   const r = items[index];
// //   const meta = TYPE_META[r.type] || TYPE_META.partial;
// //   return (
// //     <div
// //       className="fixed inset-0 z-50 bg-[#1B2B26]/80 flex items-start md:items-center justify-center p-3 sm:p-6 overflow-y-auto"
// //       onClick={onClose}
// //       role="dialog"
// //       aria-modal="true"
// //     >
// //       <div
// //         className="relative my-auto w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_260px] md:max-h-[92vh] md:overflow-hidden"
// //         onClick={(e) => e.stopPropagation()}
// //       >
// //         <div className="bg-[#EEF2EF] min-h-0 flex items-center justify-center rounded-t-2xl md:rounded-none md:rounded-l-2xl overflow-hidden">
// //           <img src={toPreviewUrl(r.url)} alt="Payment screenshot" className="max-w-full max-h-[55dvh] md:max-h-[86vh] object-contain" />
// //         </div>
// //         <div className="p-4 sm:p-5 pb-6 flex flex-col gap-3 sm:gap-4 md:overflow-y-auto border-t md:border-t-0 md:border-l border-[#DCE5E0]">
// //           <button
// //             type="button"
// //             onClick={onClose}
// //             aria-label="Close"
// //             className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 text-[#1B2B26] shadow hover:bg-white"
// //           >
// //             <X className="w-4 h-4" />
// //           </button>
// //           <div>
// //             <span className="text-xs font-semibold" style={{ color: meta.color }}>
// //               {meta.label} payment
// //             </span>
// //             <p className="text-2xl sm:text-3xl font-bold tabular-nums" style={{ color: INK }}>
// //               {r.amount ? `₹${formatAmount(r.amount)}` : "No amount"}
// //             </p>
// //             {r.remarks && (
// //               <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-[#4B5F57]">
// //                 <Landmark className="w-4 h-4" /> {r.remarks}
// //               </p>
// //             )}
// //           </div>
// //           <dl className="text-sm space-y-2">
// //             <div>
// //               <dt className="text-xs text-[#8FA39B]">Uploaded</dt>
// //               <dd className="font-semibold text-[#1B2B26]">{formatDateTime(r.createdAt)}</dd>
// //             </div>
// //             <div>
// //               <dt className="text-xs text-[#8FA39B]">Uploaded by</dt>
// //               <dd className="font-semibold text-[#1B2B26]">
// //                 {r.uploader ? (
// //                   <>
// //                     {uploaderName(r.uploader)}
// //                     {uploaderSubOf(r) && <span className="font-normal text-[#8FA39B]"> · {uploaderSubOf(r)}</span>}
// //                   </>
// //                 ) : (
// //                   <span className="font-normal text-[#8FA39B]">Not recorded (older upload)</span>
// //                 )}
// //               </dd>
// //             </div>
// //             <div>
// //               <dt className="text-xs text-[#8FA39B]">Guest</dt>
// //               <dd className="font-semibold text-[#1B2B26]">{r.name || "—"}</dd>
// //             </div>
// //             <div>
// //               <dt className="text-xs text-[#8FA39B]">TNR</dt>
// //               <dd className="font-semibold tracking-wide text-[#1B2B26] flex items-center gap-1">
// //                 {r.tnr || "Not linked yet"} {r.tnr && <CopyTnr tnr={r.tnr} />}
// //               </dd>
// //             </div>
// //             {r.tourTitle && (
// //               <div>
// //                 <dt className="text-xs text-[#8FA39B]">Tour</dt>
// //                 <dd className="text-[#1B2B26]">{r.tourTitle}</dd>
// //               </div>
// //             )}
// //           </dl>
// //           <a
// //             href={r.url}
// //             target="_blank"
// //             rel="noreferrer"
// //             className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3B5BDB] hover:underline"
// //           >
// //             <ExternalLink className="w-4 h-4" /> {isPdf(r.url) ? "Open PDF" : "Open original"}
// //           </a>
// //           <div className="mt-auto flex items-center justify-between gap-2">
// //             <button
// //               type="button"
// //               onClick={() => onNav(index - 1)}
// //               disabled={index === 0}
// //               aria-label="Previous screenshot"
// //               className="p-2 rounded-lg border border-[#DCE5E0] hover:bg-[#F3F6F4] disabled:opacity-30"
// //             >
// //               <ChevronLeft className="w-4 h-4" />
// //             </button>
// //             <span className="text-xs text-[#8FA39B] tabular-nums">
// //               {index + 1} of {items.length}
// //             </span>
// //             <button
// //               type="button"
// //               onClick={() => onNav(index + 1)}
// //               disabled={index === items.length - 1}
// //               aria-label="Next screenshot"
// //               className="p-2 rounded-lg border border-[#DCE5E0] hover:bg-[#F3F6F4] disabled:opacity-30"
// //             >
// //               <ChevronRight className="w-4 h-4" />
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // ─── PDF: browser print → "Save as PDF" (desktop + phone). Extra package theva illa. ───
// // // Ovvoru bank um thani page (HDFC oru page, ICICI oru page …)
// // const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// // const BANK_NAMES = [
// //   "SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "Indian Bank", "Indian Overseas Bank",
// //   "Canara Bank", "Bank of Baroda", "Union Bank of India", "Punjab National Bank", "Bank of India", "IDFC FIRST Bank",
// //   "IndusInd Bank", "Yes Bank", "Federal Bank", "Karur Vysya Bank", "City Union Bank", "Tamilnad Mercantile Bank",
// //   "South Indian Bank", "Equitas Small Finance Bank", "AU Small Finance Bank", "Cash",
// // ];
// // const BANK_ALIAS = { sbi: "SBI", statebankofindia: "SBI", iob: "Indian Overseas Bank", pnb: "Punjab National Bank", bob: "Bank of Baroda", kvb: "Karur Vysya Bank", cub: "City Union Bank", tmb: "Tamilnad Mercantile Bank", kotak: "Kotak Mahindra Bank", idfc: "IDFC FIRST Bank", idfcfirst: "IDFC FIRST Bank", union: "Union Bank of India", unionbank: "Union Bank of India" };
// // const bankKey = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9]/g, "").replace(/bank|ltd|limited/g, "");
// // const BANK_BY_KEY = Object.fromEntries(BANK_NAMES.map((n) => [bankKey(n), n]));
// // // "hdfc", "HDFC bank", "Hdfc Bank Ltd" → "HDFC Bank"
// // const bankOf = (remarks) => {
// //   const k = bankKey(remarks);
// //   if (!k) return "";
// //   return BANK_BY_KEY[k] || BANK_ALIAS[k] || String(remarks).trim();
// // };
// // // Total / Advance / Balance / Partial — screen mela irukkura maadhiri
// // const statsOf = (list) => {
// //   const t = { all: 0, n: list.length, advance: 0, balance: 0, partial: 0, c: { advance: 0, balance: 0, partial: 0 } };
// //   list.forEach((r) => {
// //     const a = Number(r.amount) || 0;
// //     t.all += a;
// //     if (t[r.type] !== undefined) { t[r.type] += a; t.c[r.type] += 1; }
// //   });
// //   return t;
// // };
// // const statsHtml = (st) => `<div class="stats">
// //   <div class="st first"><div class="l">Total received</div><div class="v" style="color:#1F7A3D">₹${formatAmount(st.all)}</div><div class="s">${st.n} payment${st.n !== 1 ? "s" : ""}</div></div>
// //   ${TYPE_ORDER.map((k) => `<div class="st"><div class="l"><i style="background:${k === "partial" ? "#F4B400" : TYPE_META[k].color}"></i>${TYPE_META[k].label}<span>${st.c[k]}</span></div><div class="v">₹${formatAmount(st[k])}</div><div class="s">${st.all ? Math.round((st[k] / st.all) * 100) : 0}% of total</div></div>`).join("")}
// //   <div class="split">${TYPE_ORDER.map((k) => (st[k] > 0 ? `<b style="width:${(st[k] / (st.all || 1)) * 100}%;background:${k === "partial" ? "#F4B400" : TYPE_META[k].color}"></b>` : "")).join("")}</div>
// // </div>`;

// // const buildPdfHtml = ({ rows, filterText, dateText }) => {
// //   const NONE = "Bank not mentioned";
// //   const banks = new Map(); // bank → rows
// //   rows.forEach((r) => {
// //     const b = bankOf(r.remarks) || NONE;
// //     if (!banks.has(b)) banks.set(b, []);
// //     banks.get(b).push(r);
// //   });
// //   const order = [...banks.keys()].sort((x, y) => (x === NONE ? 1 : y === NONE ? -1 : x.localeCompare(y)));
// //   const now = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
// //   const PER_PAGE = 15; // oru page la max 15 records — otti otti illaama
// //   const thead = `<thead><tr><th class="c" style="width:4.5%">S.No</th><th style="width:10%">Date &amp; Time</th><th style="width:9%">TNR</th><th style="width:19%">Guest Name</th><th>Tour Name</th><th style="width:11.5%">Uploaded By</th><th style="width:9%">Type</th><th style="width:10.5%">Amount</th></tr></thead>`;
// //   const pages = order.map((bank) => {
// //     const list = banks.get(bank);
// //     const total = list.reduce((a, r) => a + (Number(r.amount) || 0), 0);
// //     const chunks = [];
// //     for (let i = 0; i < list.length; i += PER_PAGE) chunks.push(list.slice(i, i + PER_PAGE));
// //     return chunks.map((chunk, ci) => {
// //       const last = ci === chunks.length - 1;
// //       const trs = chunk.map((r, j) => {
// //         const m = TYPE_META[r.type] || TYPE_META.partial;
// //         return `<tr>
// //         <td class="c">${ci * PER_PAGE + j + 1}</td>
// //         <td class="dt">${esc(new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }))}<div class="sub">${esc(formatTime(r.createdAt))}</div></td>
// //         <td class="tnr">${esc(r.tnr || "—")}</td>
// //         <td>${esc(r.name || "—")}</td>
// //         <td>${esc(r.tourTitle || "—")}</td>
// //         <td>${esc(uploaderName(r.uploader) || "Not recorded")}</td>
// //         <td><span class="pill" style="color:${m.color};background:${m.soft}">${m.label}</span></td>
// //         <td class="amt">${r.amount ? `₹${formatAmount(r.amount)}` : "—"}</td>
// //       </tr>`;
// //       }).join("");
// //       return `<section class="page${chunk.length === PER_PAGE ? " full" : ""}">
// //       <div class="head">
// //         <div><h1>${esc(bank)}${chunks.length > 1 ? ` <small>· Page ${ci + 1} of ${chunks.length}</small>` : ""}</h1><p class="date">${esc(dateText)}</p>${filterText ? `<p class="meta">${esc(filterText)}</p>` : ""}</div>
// //         <div class="tot"><span>${list.length} payment${list.length !== 1 ? "s" : ""}</span><b>₹${formatAmount(total)}</b></div>
// //       </div>
// //       ${ci === 0 ? statsHtml(statsOf(list)) : ""}
// //       <table>
// //         ${thead}
// //         <tbody>${trs}</tbody>
// //         ${last ? `<tfoot><tr><td colspan="7" style="text-align:right">Total</td><td class="amt">₹${formatAmount(total)}</td></tr></tfoot>` : ""}
// //       </table>
// //       <p class="gen">GV Tour Planners · Generated ${esc(now)}</p>
// //     </section>`;
// //     }).join("");
// //   }).join("");
// //   return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
// // <title>Payment Records - Bank wise</title>
// // <style>
// //   @page { size: A4 portrait; margin: 10mm; }
// //   * { box-sizing: border-box; }
// //   body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #1B2B26; margin: 0; font-size: 11px; -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #F3F6F4; }
// //   .bar { position: sticky; top: 0; z-index: 2; display: flex; gap: 8px; padding: 10px 14px; background: #fff; border-bottom: 1px solid #DCE5E0; }
// //   .bar button { font: inherit; font-size: 13px; font-weight: 700; padding: 9px 16px; border-radius: 8px; border: 0; background: #2E9E4F; color: #fff; cursor: pointer; }
// //   .bar .sec { background: #fff; color: #1B2B26; border: 1px solid #DCE5E0; }
// //   .page { background: #fff; max-width: 900px; margin: 14px auto; padding: 18px; border-radius: 10px; }
// //   .head { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; border-bottom: 2px solid #1B2B26; padding-bottom: 8px; margin-bottom: 10px; }
// //   h1 { font-size: 22px; margin: 0; } h1 small { font-size: 12px; font-weight: 600; color: #8FA39B; }
// //   .meta { color: #6B7F77; font-size: 11px; margin: 2px 0 0; }
// //   .date { display: inline-block; margin: 5px 0 0; font-size: 12px; font-weight: 700; color: #1E6FD9; background: #E8F1FD; padding: 3px 9px; border-radius: 6px; }
// //   .stats { position: relative; display: grid; grid-template-columns: 1.2fr 1fr 1fr 1fr; border: 1px solid #DCE5E0; border-radius: 12px; overflow: hidden; margin-bottom: 12px; padding-bottom: 5px; }
// //   .st { padding: 9px 11px; border-right: 1px dashed #DCE5E0; } .st:last-of-type { border-right: 0; } .st.first { background: #F1F8F3; }
// //   .st .l { display: flex; align-items: center; gap: 5px; font-size: 10.5px; font-weight: 600; color: #4B5F57; } .st .l i { width: 7px; height: 7px; border-radius: 50%; display: inline-block; } .st .l span { margin-left: auto; color: #8FA39B; font-weight: 500; }
// //   .st .v { font-size: 16px; font-weight: 800; margin-top: 2px; } .st .s { font-size: 9.5px; color: #8FA39B; }
// //   .split { position: absolute; left: 0; right: 0; bottom: 0; height: 5px; display: flex; background: #EEF2EF; } .split b { display: block; height: 100%; }
// //   .tot { text-align: right; } .tot span { display: block; font-size: 11px; color: #4B5F57; } .tot b { font-size: 18px; color: #1F7A3D; }
// //   table { width: 100%; border-collapse: collapse; table-layout: fixed; }
// //   th { text-align: center; font-size: 10.5px; color: #1F7A3D; background: #F2FAF4; padding: 7px 6px; border: 1px solid #CFE3D6; }
// //   td { padding: 7px 6px; border: 1px solid #E3EAE6; vertical-align: middle; word-break: break-word; line-height: 1.3; font-size: 10.5px; text-align: center; }
// //   tr { page-break-inside: avoid; }
// //   tbody tr:nth-child(even) td { background: #FAFCFB; }
// //   tfoot td { font-weight: 700; background: #F2FAF4; }
// //   .dt { white-space: nowrap; } .sub { font-size: 9.5px; color: #8FA39B; margin-top: 2px; }
// //   .c { text-align: center; } .tnr { font-weight: 600; white-space: nowrap; } .amt { white-space: nowrap; font-weight: 700; }
// //   .pill { font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 6px; white-space: nowrap; }
// //   .gen { margin: 8px 0 0; font-size: 9.5px; color: #8FA39B; text-align: right; }
// //   /* Phone la paakkumbodhu — table card maadhiri (PDF save pannaa A4 table thaan) */
// //   @media screen and (max-width: 640px) {
// //     .page { margin: 10px; padding: 12px; }
// //     .stats { grid-template-columns: 1fr 1fr; } .st { border-bottom: 1px dashed #DCE5E0; }
// //     thead { display: none; } table, tbody, tfoot, tr, td { display: block; width: 100%; }
// //     tbody tr { border: 1px solid #E3EAE6; border-radius: 8px; margin-bottom: 8px; padding: 6px 8px; }
// //     td { border: 0; padding: 2px 0; background: none !important; text-align: left; } .c { text-align: left; color: #8FA39B; } .c::before { content: "#"; }
// //     .amt { text-align: left; } tfoot td { display: inline-block; width: auto; padding: 4px 0; }
// //   }
// //   @media print {
// //     body { background: #fff; } .bar { display: none; }
// //     .page { max-width: none; margin: 0; padding: 0; border-radius: 0; page-break-after: always; break-after: page; }
// //     .page:last-child { page-break-after: auto; break-after: auto; }
// //     /* A4 page full-aa fill aaganum — 15 rows irundhaa rows stretch aagi keezha gap irukkaadhu */
// //     .page { height: 275mm; display: flex; flex-direction: column; }
// //     .page > * { flex-shrink: 0; } .page.full table { flex: 1 1 auto; }
// //     .gen { margin-top: auto; padding-top: 6px; }
// //   }
// // </style></head><body>
// //   <div class="bar"><button onclick="window.print()">Save as PDF</button><button class="sec" onclick="window.close()">Close</button></div>
// //   ${pages}
// // </body></html>`;
// // };

// // const PaymentRecords = () => {
// //   const { ttoken, getPaymentRecords } = useContext(TourContext);

// //   const [records, setRecords] = useState([]);
// //   // tourBookingModel la advance.paid = true bookings (backend → advancePaid)
// //   const [advancePaid, setAdvancePaid] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [search, setSearch] = useState("");
// //   const [type, setType] = useState("");
// //   const [source, setSource] = useState("");
// //   const [selTours, setSelTours] = useState([]);
// //   const [tourQ, setTourQ] = useState("");
// //   const [showDrop, setShowDrop] = useState(false);
// //   const [from, setFrom] = useState("");
// //   // Day box select → keezha table la andha naal mattum (IRCTC date strip maadhiri)
// //   const [selDay, setSelDay] = useState("");
// //   // Date dropdown la "Custom" select pannaa dhaan From / To theriyum
// //   const [customRange, setCustomRange] = useState(false);
// //   const [to, setTo] = useState("");
// //   const [viewerIndex, setViewerIndex] = useState(null);
// //   const [visibleCount, setVisibleCount] = useState(50);
// //   // "asc" = oldest date first (default), "desc" = newest first.
// //   const [sortDir, setSortDir] = useState("asc");
// //   const dropRef = useRef(null);

// //   const fetchRecords = useCallback(async () => {
// //     if (!ttoken) return;
// //     setLoading(true);
// //     try {
// //       const params = {};
// //       if (from) params.from = from;
// //       if (to) params.to = to;
// //       const data = await getPaymentRecords(params);
// //       if (data?.success) {
// //         setRecords(data.records || []);
// //         setAdvancePaid(data.advancePaid || []);
// //       } else {
// //         toast.error(data?.message || "Could not load payment records");
// //       }
// //     } catch (err) {
// //       console.error("getPaymentRecords error:", err);
// //       toast.error(err.response?.data?.message || err.message || "Could not load payment records");
// //     } finally {
// //       setLoading(false);
// //     }
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [ttoken, from, to]);

// //   useEffect(() => {
// //     fetchRecords();
// //   }, [fetchRecords]);

// //   useEffect(() => {
// //     setVisibleCount(50);
// //   }, [search, type, source, selTours, from, to, sortDir]);

// //   // ── Tour search (same behaviour as the Sales Dashboard) ──────────────
// //   const tourOptions = useMemo(
// //     () => [...new Set(records.map((r) => r.tourTitle).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
// //     [records],
// //   );
// //   // Tour picker — a checkbox list of every tour that has payments; typing
// //   // narrows the list. The list stays open while ticking several tours.
// //   const tourMatches = useMemo(() => {
// //     const q = tourQ.trim().toLowerCase();
// //     if (!q) return tourOptions;
// //     return tourOptions.filter((t) => t.toLowerCase().includes(q));
// //   }, [tourOptions, tourQ]);
// //   useEffect(() => {
// //     const h = (e) => {
// //       if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false);
// //     };
// //     document.addEventListener("mousedown", h);
// //     return () => document.removeEventListener("mousedown", h);
// //   }, []);
// //   const toggleTour = (t) =>
// //     setSelTours((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
// //   const allMatchesSelected = tourMatches.length > 0 && tourMatches.every((t) => selTours.includes(t));
// //   const toggleAllTours = () =>
// //     setSelTours((p) =>
// //       allMatchesSelected
// //         ? p.filter((t) => !tourMatches.includes(t))
// //         : [...p, ...tourMatches.filter((t) => !p.includes(t))],
// //     );
// //   const removeTour = (t) => setSelTours((p) => p.filter((x) => x !== t));

// //   // Everything except the type filter — the split bar is built from this,
// //   // so its segments still show all three types while one is selected.
// //   const baseFiltered = useMemo(() => {
// //     const q = search.trim().toLowerCase();
// //     return records.filter((r) => {
// //       if (source && r.bookingSource !== source) return false;
// //       if (selTours.length && !selTours.includes(r.tourTitle)) return false;
// //       if (!q) return true;
// //       return [r.tnr, r.name, r.remarks, r.tourTitle, uploaderName(r.uploader), r.amount != null ? String(r.amount) : ""]
// //         .join(" ")
// //         .toLowerCase()
// //         .includes(q);
// //     });
// //   }, [records, search, source, selTours]);

// //   const filtered = useMemo(() => {
// //     let list = type ? baseFiltered.filter((r) => r.type === type) : baseFiltered;
// //     if (selDay) list = list.filter((r) => dayKey(r.createdAt) === selDay);
// //     return [...list].sort((a, b) =>
// //       sortDir === "asc"
// //         ? new Date(a.createdAt) - new Date(b.createdAt)
// //         : new Date(b.createdAt) - new Date(a.createdAt),
// //     );
// //   }, [baseFiltered, type, sortDir, selDay]);

// //   const split = useMemo(() => {
// //     const t = { advance: 0, balance: 0, partial: 0, count: { advance: 0, balance: 0, partial: 0 } };
// //     baseFiltered.forEach((r) => {
// //       if (t[r.type] === undefined) return;
// //       t[r.type] += Number(r.amount) || 0;
// //       t.count[r.type] += 1;
// //     });
// //     t.all = t.advance + t.balance + t.partial;
// //     return t;
// //   }, [baseFiltered]);

// //   const shownTotal = type ? split[type] : split.all;

// //   // Advance paid bookings — tourBookingModel la payment.advance.paid = true.
// //   // Naal = advance paidAt. Search / Tour / Admin-User filter ku yetha maadhiri.
// //   const advanceBookings = useMemo(() => {
// //     const q = search.trim().toLowerCase();
// //     const byDay = new Map(); // dayKey → [tnr...]
// //     let total = 0;
// //     advancePaid.forEach((b) => {
// //       if (source && b.bookingSource !== source) return;
// //       if (selTours.length && !selTours.includes(b.tourTitle)) return;
// //       if (q && ![b.tnr, b.name, b.tourTitle].join(" ").toLowerCase().includes(q)) return;
// //       const k = dayKey(b.bookedAt || b.paidAt); // tour booking date (advance.paid === true)
// //       if (!byDay.has(k)) byDay.set(k, []);
// //       byDay.get(k).push(b);
// //       total += 1;
// //     });
// //     return { byDay, total };
// //   }, [advancePaid, search, source, selTours]);
// //   const advanceCountOn = (k) => advanceBookings.byDay.get(k)?.length || 0;

// //   // ── Advance paid bookings (tour bookings, advance.paid === true) ──
// //   // Filter illana: inniku mattum. From / To pottaa: andha naatkal mattum —
// //   // bookings = andha naatkal la motham, average = motham ÷ naatkal.
// //   const todayKey = dayKey(new Date());
// //   const advanceTnrsOn = (k) => (advanceBookings.byDay.get(k) || []).map((b) => b.tnr);
// //   const advanceListOn = (k) => advanceBookings.byDay.get(k) || [];
// //   const perDay = useMemo(() => {
// //     let start = from || to || todayKey;
// //     let end = to || (from ? todayKey : todayKey);
// //     if (!from && to) start = to; // To mattum → andha oru naal
// //     if (end > todayKey && start <= todayKey) end = todayKey;
// //     if (start > end) [start, end] = [end, start];
// //     let total = 0;
// //     advanceBookings.byDay.forEach((items, k) => {
// //       if (k >= start && k <= end) total += items.length;
// //     });
// //     const toUTC = (k) => { const [y, m, d] = k.split("-").map(Number); return Date.UTC(y, m - 1, d); };
// //     const days = Math.round((toUTC(end) - toUTC(start)) / 86400000) + 1;

// //     // Days with bookings / Busiest day / day boxes:
// //     // filter illana mudhal advance booking naal → inniku varai; filter pottaa andha naatkal.
// //     let aStart = start;
// //     let aEnd = end;
// //     if (!from && !to) {
// //       const first = [...advanceBookings.byDay.keys()].sort()[0];
// //       if (first && first < aStart) aStart = first;
// //     }
// //     let activeDays = 0;
// //     let best = null;
// //     advanceBookings.byDay.forEach((items, k) => {
// //       if (k < aStart || k > aEnd) return;
// //       activeDays += 1;
// //       if (!best || items.length > best.n) best = { k, n: items.length };
// //     });

// //     // Keezha day boxes — Payment Records filter padi: filter illana inniku mattum,
// //     // From / To pottaa andha naatkal la booking aana naatkal.
// //     const list = []; // [dayKey, bookings]
// //     advanceBookings.byDay.forEach((items, k) => {
// //       if (k >= start && k <= end) list.push([k, items]);
// //     });
// //     if (!from && !to && !list.length) list.push([todayKey, []]); // inniku 0 bookings na kooda box
// //     const allDays = Math.round((toUTC(aEnd) - toUTC(aStart)) / 86400000) + 1;
// //     list.sort((a, b) => (sortDir === "asc" ? a[0].localeCompare(b[0]) : b[0].localeCompare(a[0])));
// //     return { total, days, avg: days ? total / days : 0, start, end, activeDays, allDays, aStart, best, list };
// //   }, [advanceBookings, from, to, todayKey, sortDir]);

// //   // Day box click → andha naal details keezha. Matha boxes maraiyaadhu.
// //   useEffect(() => { setSelDay(""); }, [from, to]);
// //   const fmtAvg = (n) => String(Math.round(n)); // round off — 4.3 → 4, 4.5 → 5

// //   const visible = filtered.slice(0, visibleCount);

// //   const days = useMemo(() => {
// //     const out = [];
// //     const byKey = new Map();
// //     visible.forEach((r, i) => {
// //       const k = dayKey(r.createdAt);
// //       if (!byKey.has(k)) {
// //         const g = { key: k, rows: [], total: 0 };
// //         byKey.set(k, g);
// //         out.push(g);
// //       }
// //       const g = byKey.get(k);
// //       g.rows.push({ r, index: i });
// //       g.total += Number(r.amount) || 0;
// //     });
// //     return out;
// //   }, [visible]);

// //   const hasFilters = search || type || source || selTours.length || from || to || selDay;
// //   const clearFilters = () => {
// //     setSelDay("");
// //     setCustomRange(false);
// //     setSearch("");
// //     setType("");
// //     setSource("");
// //     setSelTours([]);
// //     setTourQ("");
// //     setFrom("");
// //     setTo("");
// //   };

// //   // PDF — ippo podra filters padi ELLAA rows um (Show more pannaadhadhu kooda)
// //   const downloadPdf = () => {
// //     if (!filtered.length) { toast.info("No payments to export for these filters"); return; }
// //     const parts = [];
// //     if (selDay) parts.push(payRangeLabel(selDay));
// //     else if (from && to && from === to) parts.push(payRangeLabel(from));
// //     else if (from || to) parts.push(`${from ? payRangeLabel(from) : "Start"} – ${to ? payRangeLabel(to) : "Today"}`);
// //     else {
// //       // All dates → mudhal payment la irundhu kadaisi payment varai
// //       const ks = filtered.map((r) => dayKey(r.createdAt)).sort();
// //       parts.push(ks.length ? (ks[0] === ks[ks.length - 1] ? payRangeLabel(ks[0]) : `${payRangeLabel(ks[0])} – ${payRangeLabel(ks[ks.length - 1])} (all dates)`) : "All dates");
// //     }
// //     if (type) parts.push(TYPE_META[type].label);
// //     if (source) parts.push(source === "user" ? "User bookings" : "Admin bookings");
// //     if (selTours.length) parts.push(selTours.length === 1 ? selTours[0] : `${selTours.length} tours`);
// //     if (search.trim()) parts.push(`Search: ${search.trim()}`);
// //     const dateText = parts.shift(); // date mela thani-aa (blue)
// //     const html = buildPdfHtml({ rows: filtered, filterText: parts.join(" · "), dateText: `Date: ${dateText}` });
// //     const w = window.open("", "_blank");
// //     if (!w) { toast.error("Allow pop-ups for this site to download the PDF"); return; }
// //     w.document.open();
// //     w.document.write(html);
// //     w.document.close();
// //     w.focus();
// //     setTimeout(() => { try { w.print(); } catch { /* user can tap Save as PDF */ } }, 500);
// //   };

// //   const fieldCls =
// //     "w-full h-9 px-3 rounded-lg border border-[#DCE5E0] bg-white text-sm text-[#1B2B26] placeholder:text-[#8FA39B] outline-none focus:border-[#2E9E4F] focus:ring-2 focus:ring-[#2E9E4F]/15";

// //   return (
// //     <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#EEF5F0] pt-16 pb-4 sm:pb-5 lg:pt-5 px-3 sm:px-6 text-[#1B2B26] text-sm">
// //       <div className="max-w-7xl mx-auto">
// //         {/* Header */}
// //         <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
// //           <div>
// //             <h1 className="text-xl font-bold tracking-tight">Payment Records</h1>
// //             <p className="text-xs text-[#6B7F77]">Advance, balance and partial payment screenshots, {sortDir === "asc" ? "oldest" : "newest"} first</p>
// //           </div>
// //           <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto [&>button]:flex-1 sm:[&>button]:flex-none [&>button]:justify-center">
// //             <button
// //               type="button"
// //               onClick={downloadPdf}
// //               disabled={loading || !filtered.length}
// //               title="Download the current list as PDF"
// //               className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[#C7D2FE] bg-[#EEF2FF] text-sm font-semibold text-[#4338CA] hover:bg-[#E0E7FF] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4338CA]"
// //             >
// //               <FileDown className="w-4 h-4" /> PDF
// //             </button>
// //             <button
// //               type="button"
// //               onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
// //               title="Change date order"
// //               className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[#DCE5E0] bg-white text-sm font-semibold text-[#1B2B26] hover:bg-[#F7F9F8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2E9E4F]"
// //             >
// //               <ArrowUpDown className="w-4 h-4 text-[#2E9E4F]" />
// //               {sortDir === "asc" ? "Oldest first" : "Newest first"}
// //             </button>
// //             <button
// //               type="button"
// //               onClick={fetchRecords}
// //               disabled={loading}
// //               className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#2E9E4F] hover:bg-[#268A44] text-white text-sm font-semibold disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E6FD9]"
// //             >
// //               <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
// //             </button>
// //           </div>
// //         </div>

// //         {/* Summary receipt — total + three type cells split by perforated
// //             dividers; the coloured strip along the bottom shows the split.
// //             Clicking a type cell filters the statement to that type. */}
// //         <section className="bg-white rounded-2xl border border-[#DCE5E0] overflow-hidden mb-4">
// //           <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
// //             <div className="col-span-2 sm:col-span-3 xl:col-span-1 px-4 py-3.5 bg-[#F1F8F3] border-b xl:border-b-0 xl:border-r border-dashed border-[#CFE3D6]">
// //               <p className="text-xs text-[#4B5F57]">
// //                 {type ? `${TYPE_META[type].label} received` : "Total received"}
// //               </p>
// //               <p className="text-xl sm:text-2xl font-bold tabular-nums tracking-tight text-[#1F7A3D] break-all">₹{formatAmount(shownTotal)}</p>
// //               <p className="text-[11px] text-[#8FA39B]">
// //                 {filtered.length} screenshot{filtered.length !== 1 ? "s" : ""}
// //                 {type && (
// //                   <button type="button" onClick={() => setType("")} className="ml-2 font-semibold text-[#1E6FD9] hover:underline">
// //                     Show all
// //                   </button>
// //                 )}
// //               </p>
// //             </div>
// //             {TYPE_ORDER.map((k, i) => {
// //               const m = TYPE_META[k];
// //               const active = type === k;
// //               const bar = k === "partial" ? "#F4B400" : m.color;
// //               return (
// //                 <button
// //                   key={k}
// //                   type="button"
// //                   onClick={() => setType(active ? "" : k)}
// //                   aria-pressed={active}
// //                   className={`relative min-w-0 text-left px-3 sm:px-4 py-3 sm:py-3.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1E6FD9] ${i < 2 ? "border-r border-dashed border-[#DCE5E0]" : "xl:border-r-0"
// //                     } ${i === 2 ? "col-span-2 sm:col-span-1 border-t sm:border-t-0 border-dashed border-[#DCE5E0]" : ""} ${active ? "" : "hover:bg-[#FAFCFB]"
// //                     } ${type && !active ? "opacity-50" : ""}`}
// //                   style={active ? { background: m.soft } : undefined}
// //                 >
// //                   <span className="absolute left-0 top-0 h-full w-[3px]" style={{ background: active ? bar : "transparent" }} />
// //                   <span className="flex items-center gap-1.5 text-xs font-semibold text-[#4B5F57]">
// //                     <span className="w-2 h-2 rounded-full shrink-0" style={{ background: bar }} />
// //                     {m.label}
// //                     <span className="ml-auto text-[11px] font-medium text-[#8FA39B] tabular-nums">{split.count[k]}</span>
// //                   </span>
// //                   <span className="block text-base sm:text-lg font-bold tabular-nums mt-0.5 truncate">₹{formatAmount(split[k])}</span>
// //                   <span className="block text-[11px] text-[#8FA39B] tabular-nums">
// //                     {split.all ? Math.round((split[k] / split.all) * 100) : 0}% of total
// //                   </span>
// //                 </button>
// //               );
// //             })}
// //           </div>
// //           <div className="flex h-1.5 w-full bg-[#EEF2EF]" aria-hidden="true">
// //             {TYPE_ORDER.map((k) =>
// //               split[k] > 0 ? (
// //                 <div
// //                   key={k}
// //                   style={{
// //                     width: `${(split[k] / (split.all || 1)) * 100}%`,
// //                     background: k === "partial" ? "#F4B400" : TYPE_META[k].color,
// //                     opacity: type && type !== k ? 0.25 : 1,
// //                   }}
// //                   className="h-full transition-opacity"
// //                 />
// //               ) : null,
// //             )}
// //           </div>
// //         </section>

// //         {/* Advance paid bookings (tour bookings, advance.paid === true) — inniku, illana filter potta naatkal */}
// //         <section className="bg-white rounded-2xl border border-[#DCE5E0] p-3 mb-4">
// //           <p className="text-xs font-semibold text-[#1E6FD9]">Advance paid bookings</p>
// //           <p className="text-[11px] text-[#8FA39B] mb-2">
// //             {perDay.start === perDay.end
// //               ? `${perDay.start === todayKey ? "Today · " : ""}${payRangeLabel(perDay.start)}`
// //               : `${payRangeLabel(perDay.start)} – ${payRangeLabel(perDay.end)} · ${perDay.days} days`}
// //           </p>
// //           <div className="grid grid-cols-2 gap-2">
// //             <div className="rounded-lg bg-[#E8F1FD] px-3 py-2">
// //               <p className="text-[11px] text-[#4B5F57]">Bookings (advance paid)</p>
// //               <p className="text-xl font-bold tabular-nums text-[#1E6FD9] leading-tight">{perDay.total}</p>
// //             </div>
// //             <div className="rounded-lg bg-[#E7F6EC] px-3 py-2">
// //               <p className="text-[11px] text-[#4B5F57]">Average per day</p>
// //               <p className="text-xl font-bold tabular-nums text-[#0F7A5A] leading-tight">{fmtAvg(perDay.avg)}</p>
// //               {perDay.days > 1 && (
// //                 <p className="text-[10.5px] text-[#8FA39B] tabular-nums">{perDay.total} ÷ {perDay.days} days</p>
// //               )}
// //             </div>
// //           </div>

// //           {/* Days with bookings + Busiest day */}
// //           <div className="mt-2 grid grid-cols-2 gap-2">
// //             <div className="rounded-lg border border-[#DCE5E0] bg-[#F7F9F8] px-3 py-2">
// //               <p className="text-[11px] text-[#6B7F77]">Days with bookings</p>
// //               <p className="text-base font-bold tabular-nums text-[#1B2B26] leading-tight">
// //                 {perDay.activeDays} / {perDay.allDays}
// //               </p>
// //               <p className="text-[10.5px] text-[#8FA39B]">
// //                 {!from && !to && perDay.activeDays ? `Since ${payRangeLabel(perDay.aStart)}` : perDay.activeDays ? "" : "No bookings"}
// //               </p>
// //             </div>
// //             {perDay.best ? (
// //               <button
// //                 type="button"
// //                 onClick={() => setSelDay((d) => (d === perDay.best.k ? "" : perDay.best.k))}
// //                 title="Show this day's bookings"
// //                 className={`text-left rounded-lg border px-3 py-2 hover:bg-[#EEF3F0] ${selDay === perDay.best.k ? "border-[#1E6FD9] bg-[#E8F1FD]" : "border-[#DCE5E0] bg-[#F7F9F8]"}`}
// //               >
// //                 <p className="text-[11px] text-[#6B7F77]">Busiest day</p>
// //                 <p className="text-base font-bold tabular-nums text-[#1B2B26] leading-tight">
// //                   {perDay.best.n} booking{perDay.best.n !== 1 ? "s" : ""}
// //                 </p>
// //                 <p className="text-[10.5px] text-[#8FA39B]">{payRangeLabel(perDay.best.k)}</p>
// //               </button>
// //             ) : (
// //               <div className="rounded-lg border border-[#DCE5E0] bg-[#F7F9F8] px-3 py-2">
// //                 <p className="text-[11px] text-[#6B7F77]">Busiest day</p>
// //                 <p className="text-base font-bold text-[#8FA39B] leading-tight">—</p>
// //               </div>
// //             )}
// //           </div>

// //           {/* Day boxes — click pannaa andha naal details keezha; matha boxes apdiye irukkum */}
// //           {perDay.list.length > 0 && (
// //             <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
// //               {perDay.list.map(([k, items]) => {
// //                 const dp = dayParts(k);
// //                 const active = selDay === k;
// //                 return (
// //                   <button
// //                     key={k}
// //                     type="button"
// //                     aria-pressed={active}
// //                     onClick={() => setSelDay(active ? "" : k)}
// //                     className={`shrink-0 text-left rounded-lg border px-3 py-1.5 ${active ? "border-[#1E6FD9] bg-[#E8F1FD]" : "border-[#DCE5E0] hover:bg-[#F7F9F8]"}`}
// //                   >
// //                     <span className="block text-[11px] text-[#6B7F77] whitespace-nowrap">
// //                       {String(dp.day).padStart(2, "0")} {dp.month} {String(dp.year).slice(2)} · {dp.rel}
// //                     </span>
// //                     <span className="block text-sm font-bold tabular-nums text-[#1E6FD9]">
// //                       {items.length} booking{items.length !== 1 ? "s" : ""}
// //                     </span>
// //                   </button>
// //                 );
// //               })}
// //             </div>
// //           )}

// //           {selDay && (
// //             <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
// //               <span className="rounded-full bg-[#E8F1FD] text-[#1E6FD9] font-semibold px-2.5 py-1">
// //                 Showing {payRangeLabel(selDay)} only
// //               </span>
// //               <button type="button" onClick={() => setSelDay("")} className="font-semibold text-[#4B5F57] underline hover:text-[#1B2B26]">
// //                 Show all days
// //               </button>
// //             </div>
// //           )}
// //         </section>

// //         {/* Filters — one compact toolbar */}
// //         <section className="bg-white rounded-2xl border border-[#DCE5E0] p-3 mb-4">
// //           <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
// //             <div className="col-span-2 md:col-span-1 relative min-w-0">
// //               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA39B] pointer-events-none" />
// //               <input
// //                 aria-label="Search guest, TNR, bank or amount"
// //                 type="text"
// //                 value={search}
// //                 onChange={(e) => setSearch(e.target.value)}
// //                 placeholder="Guest, TNR, bank or amount"
// //                 className={`${fieldCls} pl-9 pr-8`}
// //               />
// //               {search && (
// //                 <button
// //                   type="button"
// //                   onClick={() => setSearch("")}
// //                   aria-label="Clear search"
// //                   className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-[#8FA39B] hover:text-[#1B2B26]"
// //                 >
// //                   <X className="w-4 h-4" />
// //                 </button>
// //               )}
// //             </div>
// //             <div className="col-span-2 md:col-span-1 relative min-w-0" ref={dropRef}>
// //               <button
// //                 type="button"
// //                 onClick={() => setShowDrop((v) => !v)}
// //                 aria-haspopup="listbox"
// //                 aria-expanded={showDrop}
// //                 className={`${fieldCls} flex items-center gap-2 text-left`}
// //               >
// //                 <Search className="w-4 h-4 shrink-0 text-[#8FA39B]" />
// //                 <span className={`flex-1 truncate ${selTours.length ? "text-[#1B2B26] font-medium" : "text-[#8FA39B]"}`}>
// //                   {selTours.length === 0
// //                     ? "All tours"
// //                     : selTours.length === 1
// //                       ? selTours[0]
// //                       : `${selTours.length} tours selected`}
// //                 </span>
// //                 <ChevronRight className={`w-4 h-4 shrink-0 text-[#8FA39B] transition-transform ${showDrop ? "-rotate-90" : "rotate-90"}`} />
// //               </button>
// //               {showDrop && (
// //                 <div className="absolute left-0 right-0 md:right-auto md:w-[360px] top-[calc(100%+4px)] z-30 bg-white border border-[#DCE5E0] rounded-xl shadow-lg overflow-hidden">
// //                   <div className="p-2 border-b border-[#EEF2EF]">
// //                     <div className="relative">
// //                       <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8FA39B] pointer-events-none" />
// //                       <input
// //                         autoFocus
// //                         aria-label="Search tour"
// //                         type="text"
// //                         value={tourQ}
// //                         onChange={(e) => setTourQ(e.target.value)}
// //                         placeholder="Search tour"
// //                         className="w-full h-8 pl-8 pr-2 rounded-md border border-[#DCE5E0] text-sm outline-none focus:border-[#2E9E4F]"
// //                       />
// //                     </div>
// //                   </div>
// //                   {tourMatches.length === 0 ? (
// //                     <p className="px-3 py-4 text-sm text-[#8FA39B] text-center">No tours match "{tourQ}"</p>
// //                   ) : (
// //                     <ul role="listbox" aria-multiselectable="true" className="max-h-64 overflow-y-auto py-1">
// //                       <li>
// //                         <label className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#1F7A3D] cursor-pointer hover:bg-[#F1F8F3] border-b border-[#EEF2EF]">
// //                           <input
// //                             type="checkbox"
// //                             checked={allMatchesSelected}
// //                             onChange={toggleAllTours}
// //                             className="w-4 h-4 accent-[#2E9E4F]"
// //                           />
// //                           {tourQ ? `Select all matching (${tourMatches.length})` : `Select all tours (${tourMatches.length})`}
// //                         </label>
// //                       </li>
// //                       {tourMatches.map((t) => {
// //                         const checked = selTours.includes(t);
// //                         const count = records.filter((r) => r.tourTitle === t).length;
// //                         return (
// //                           <li key={t}>
// //                             <label
// //                               className={`flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-[#F7F9F8] ${checked ? "bg-[#F1F8F3]" : ""
// //                                 }`}
// //                             >
// //                               <input
// //                                 type="checkbox"
// //                                 checked={checked}
// //                                 onChange={() => toggleTour(t)}
// //                                 className="w-4 h-4 shrink-0 accent-[#2E9E4F]"
// //                               />
// //                               <span className={`flex-1 min-w-0 truncate ${checked ? "font-semibold text-[#1F7A3D]" : ""}`}>{t}</span>
// //                               <span className="text-[11px] text-[#8FA39B] tabular-nums shrink-0">{count}</span>
// //                             </label>
// //                           </li>
// //                         );
// //                       })}
// //                     </ul>
// //                   )}
// //                   <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-[#EEF2EF] bg-[#FAFCFB]">
// //                     <button
// //                       type="button"
// //                       onClick={() => setSelTours([])}
// //                       disabled={!selTours.length}
// //                       className="text-xs font-semibold text-[#6B7F77] hover:text-[#1B2B26] disabled:opacity-40"
// //                     >
// //                       Clear
// //                     </button>
// //                     <button
// //                       type="button"
// //                       onClick={() => {
// //                         setShowDrop(false);
// //                         setTourQ("");
// //                       }}
// //                       className="h-7 px-3 rounded-md bg-[#2E9E4F] text-white text-xs font-semibold hover:bg-[#268A44]"
// //                     >
// //                       Done{selTours.length ? ` (${selTours.length})` : ""}
// //                     </button>
// //                   </div>
// //                 </div>
// //               )}
// //             </div>
// //             <select
// //               aria-label="Date"
// //               value={(() => {
// //                 if (customRange) return "custom";
// //                 const hit = QUICK_DAYS.find(({ offset }) => {
// //                   const k = dayOffsetKey(offset);
// //                   return from === k && to === k;
// //                 });
// //                 if (hit) return String(hit.offset);
// //                 return from || to ? "custom" : "";
// //               })()}
// //               onChange={(e) => {
// //                 const v = e.target.value;
// //                 if (v === "custom") {
// //                   setCustomRange(true);
// //                   return;
// //                 }
// //                 setCustomRange(false);
// //                 if (v === "") {
// //                   setFrom("");
// //                   setTo("");
// //                 } else {
// //                   const k = dayOffsetKey(Number(v));
// //                   setFrom(k);
// //                   setTo(k);
// //                 }
// //               }}
// //               className={`${fieldCls} col-span-2 md:col-span-1 pr-8 cursor-pointer`}
// //             >
// //               <option value="">All dates</option>
// //               {QUICK_DAYS.map(({ offset, label }) => (
// //                 <option key={offset} value={String(offset)}>
// //                   {label}
// //                 </option>
// //               ))}
// //               <option value="custom">Custom</option>
// //             </select>
// //             {(customRange || ((from || to) && !QUICK_DAYS.some(({ offset }) => { const k = dayOffsetKey(offset); return from === k && to === k; }))) && (
// //               <>
// //               <label className="relative min-w-0">
// //                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#8FA39B] pointer-events-none">From</span>
// //                 <input type="date" value={from} max={to || todayKey} onChange={(e) => setFrom(e.target.value > todayKey ? todayKey : e.target.value)} className={`${fieldCls} pl-12`} />
// //               </label>
// //               <label className="relative min-w-0">
// //                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#8FA39B] pointer-events-none">To</span>
// //                 <input type="date" value={to} min={from || undefined} max={todayKey} onChange={(e) => setTo(e.target.value > todayKey ? todayKey : e.target.value)} className={`${fieldCls} pl-9`} />
// //               </label>
// //               </>
// //             )}
// //             <div className="col-span-2 md:col-span-1 flex h-9 rounded-lg border border-[#DCE5E0] p-0.5 bg-[#F7F9F8]" role="group" aria-label="Booking type">
// //               {[
// //                 { v: "", l: "All" },
// //                 { v: "admin", l: "Admin" },
// //                 { v: "user", l: "User" },
// //               ].map((o) => (
// //                 <button
// //                   key={o.v || "all"}
// //                   type="button"
// //                   onClick={() => setSource(o.v)}
// //                   aria-pressed={source === o.v}
// //                   className={`flex-1 px-3 rounded-md text-xs font-semibold ${source === o.v ? "bg-white text-[#1F7A3D] shadow-sm" : "text-[#6B7F77] hover:text-[#1B2B26]"
// //                     }`}
// //                 >
// //                   {o.l}
// //                 </button>
// //               ))}
// //             </div>
// //           </div>

// //           {(selTours.length > 0 || hasFilters) && (
// //             <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
// //               {selTours.map((t) => (
// //                 <span
// //                   key={t}
// //                   className="inline-flex items-center gap-1 max-w-full h-7 pl-2.5 pr-1.5 rounded-md bg-[#F1F8F3] border border-[#CFE3D6] text-[#1F7A3D] text-xs font-semibold"
// //                 >
// //                   <span className="truncate">{t}</span>
// //                   <button type="button" onClick={() => removeTour(t)} aria-label={`Remove ${t}`} className="shrink-0 hover:text-[#1B2B26]">
// //                     <X className="w-3.5 h-3.5" />
// //                   </button>
// //                 </span>
// //               ))}
// //               {hasFilters && (
// //                 <button type="button" onClick={clearFilters} className="ml-auto text-xs font-semibold text-[#6B7F77] hover:text-[#1B2B26] hover:underline">
// //                   Clear all filters
// //                 </button>
// //               )}
// //             </div>
// //           )}
// //         </section>

// //         {/* Statement */}
// //         <section className="bg-white rounded-2xl border border-[#DCE5E0] overflow-hidden">
// //           {loading && records.length === 0 ? (
// //             <div className="flex justify-center py-20">
// //               <Loader2 className="w-9 h-9 animate-spin text-[#3B5BDB]" />
// //             </div>
// //           ) : filtered.length === 0 ? (
// //             <div className="py-16 px-4 text-center">
// //               <FileImage className="w-10 h-10 mx-auto mb-3 text-[#B9C9C1]" />
// //               <p className="font-semibold">No payment screenshots match</p>
// //               <p className="text-sm text-[#4B5F57] mt-1">
// //                 {hasFilters ? "Change or clear the filters to see more." : "Payment screenshots will show here once they are uploaded."}
// //               </p>
// //             </div>
// //           ) : (
// //             <>
// //               <div className="hidden xl:block overflow-x-auto">
// //                 {/* table-fixed — screen agalathukku ulla adangum, side la cut aagaadhu */}
// //                 <table className="w-full table-fixed text-sm border-collapse">
// //                   <thead>
// //                     <tr className="text-xs text-[#1F7A3D] bg-[#F2FAF4] border-b border-[#CFE3D6]">
// //                       <th className="pl-4 pr-2 py-3 text-left font-semibold w-[5.5rem]">Time</th>
// //                       <th className="px-2 py-3 text-left font-semibold w-16">Proof</th>
// //                       <th className="px-2 py-3 text-left font-semibold w-[24%]">Guest and TNR</th>
// //                       <th className="px-2 py-3 text-left font-semibold w-[9%]">Bank</th>
// //                       <th className="px-2 py-3 text-left font-semibold">Tour</th>
// //                       <th className="px-2 py-3 text-left font-semibold w-[15%]">Uploaded by</th>
// //                       <th className="pl-2 pr-4 py-3 text-right font-semibold w-28">Amount</th>
// //                     </tr>
// //                   </thead>
// //                   {days.map((g) => {
// //                     const dp = dayParts(g.key);
// //                     return (
// //                       <tbody key={g.key}>
// //                         <tr className="border-y border-[#DCE5E0] bg-[#FAFCFB]">
// //                           <td colSpan={6} className="pl-4 pr-2 py-3">
// //                             <div className="flex items-center gap-3">
// //                               <DateStamp dp={dp} />
// //                               <div>
// //                                 <p className="font-semibold leading-tight">{dp.rel}</p>
// //                                 <p className="text-xs text-[#8FA39B]">{g.rows.length} payment{g.rows.length !== 1 ? "s" : ""} received</p>
// //                               </div>
// //                               <AdvanceBookingsBadge count={advanceCountOn(g.key)} tnrs={advanceTnrsOn(g.key)} />
// //                             </div>
// //                           </td>
// //                           <td className="pl-2 pr-4 py-3 text-right">
// //                             <span className="inline-block rounded-lg bg-[#E4F5EA] text-[#1F7A3D] px-3 py-1 font-bold tabular-nums">
// //                               ₹{formatAmount(g.total)}
// //                             </span>
// //                           </td>
// //                         </tr>
// //                         {g.rows.map(({ r, index }) => {
// //                           const m = TYPE_META[r.type] || TYPE_META.partial;
// //                           return (
// //                             <tr key={r._id} className="border-b border-[#EEF2EF] last:border-0 hover:bg-[#F7F9F8]">
// //                               <td className="pl-4 pr-2 py-2.5 align-middle whitespace-nowrap tabular-nums text-[#4B5F57]">
// //                                 <span className="relative pl-3">
// //                                   <span className="absolute left-0 top-0.5 bottom-0.5 w-1 rounded-full" style={{ background: m.color }} />
// //                                   {formatTime(r.createdAt)}
// //                                 </span>
// //                               </td>
// //                               <td className="px-2 py-3">
// //                                 <button
// //                                   type="button"
// //                                   onClick={() => setViewerIndex(index)}
// //                                   aria-label="View screenshot"
// //                                   className="relative block w-10 h-10 rounded-md overflow-hidden border border-[#DCE5E0] bg-[#EEF2EF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3B5BDB] hover:border-[#3B5BDB]"
// //                                 >
// //                                   <img src={toPreviewUrl(r.url)} alt="" loading="lazy" className="w-full h-full object-cover" />
// //                                   {isPdf(r.url) && (
// //                                     <span className="absolute inset-x-0 bottom-0 text-[9px] font-bold text-center bg-[#1B2B26]/70 text-white">
// //                                       PDF
// //                                     </span>
// //                                   )}
// //                                 </button>
// //                               </td>
// //                               <td className="px-2 py-3 min-w-0">
// //                                 <p className="font-semibold truncate" title={r.name}>{r.name || "Unnamed guest"}</p>
// //                                 {r.tnr ? (
// //                                   <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-[#3B5BDB]">
// //                                     <span className="select-all">{r.tnr}</span> <CopyTnr tnr={r.tnr} />
// //                                   </span>
// //                                 ) : (
// //                                   <span className="text-xs text-[#8FA39B]">TNR not linked yet</span>
// //                                 )}
// //                               </td>
// //                               <td className="px-2 py-3 text-[#4B5F57]">
// //                                 <span className="block truncate" title={r.remarks}>{r.remarks || <span className="text-[#B9C9C1]">—</span>}</span>
// //                               </td>
// //                               <td className="px-2 py-3 text-[#4B5F57]">
// //                                 <span className="block truncate" title={r.tourTitle}>{r.tourTitle || <span className="text-[#B9C9C1]">—</span>}</span>
// //                                 <span
// //                                   className={`mt-1 inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md ${r.bookingSource === "user" ? "bg-[#EBFBEE] text-[#2B8A3E]" : "bg-[#EDF2FF] text-[#364FC7]"
// //                                     }`}
// //                                 >
// //                                   {r.bookingSource === "user" ? "User" : "Admin"}
// //                                 </span>
// //                               </td>
// //                               <td className="px-2 py-3 min-w-0">
// //                                 {r.uploader ? (
// //                                   <>
// //                                     <span className="block font-semibold truncate text-[#1B2B26]">{uploaderName(r.uploader)}</span>
// //                                     {uploaderSubOf(r) && (
// //                                       <span className="block text-[11px] text-[#8FA39B] truncate">{uploaderSubOf(r)}</span>
// //                                     )}
// //                                   </>
// //                                 ) : (
// //                                   <span className="text-[11px] text-[#B9C9C1]">Not recorded</span>
// //                                 )}
// //                               </td>
// //                               <td className="pl-2 pr-4 py-3 text-right whitespace-nowrap">
// //                                 <span className="block font-bold tabular-nums text-sm">
// //                                   {r.amount ? `₹${formatAmount(r.amount)}` : <span className="text-[#B9C9C1] font-normal">—</span>}
// //                                 </span>
// //                                 <span className="text-xs font-semibold" style={{ color: m.color }}>
// //                                   {m.label}
// //                                 </span>
// //                               </td>
// //                             </tr>
// //                           );
// //                         })}
// //                       </tbody>
// //                     );
// //                   })}
// //                 </table>
// //               </div>

// //               {/* Mobile: same statement as a compact list */}
// //               <div className="xl:hidden">
// //                 {days.map((g) => {
// //                   const dp = dayParts(g.key);
// //                   return (
// //                     <div key={g.key}>
// //                       <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-[#FAFCFB] border-y border-[#DCE5E0]">
// //                         <div className="flex items-center gap-2.5 min-w-0">
// //                           <DateStamp dp={dp} />
// //                           <div className="min-w-0">
// //                             <p className="font-semibold text-sm leading-tight truncate">{dp.rel}</p>
// //                             <p className="text-xs text-[#8FA39B]">{g.rows.length} received</p>
// //                             <div className="mt-1">
// //                               <AdvanceBookingsBadge count={advanceCountOn(g.key)} tnrs={advanceTnrsOn(g.key)} />
// //                             </div>
// //                           </div>
// //                         </div>
// //                         <span className="rounded-lg bg-[#E4F5EA] text-[#1F7A3D] px-2.5 py-1 font-bold tabular-nums text-sm shrink-0">
// //                           ₹{formatAmount(g.total)}
// //                         </span>
// //                       </div>
// //                       {g.rows.map(({ r, index }) => {
// //                         const m = TYPE_META[r.type] || TYPE_META.partial;
// //                         return (
// //                           <div
// //                             key={r._id}
// //                             role="button"
// //                             tabIndex={0}
// //                             onClick={() => setViewerIndex(index)}
// //                             onKeyDown={(e) => {
// //                               if (e.key === "Enter" || e.key === " ") {
// //                                 e.preventDefault();
// //                                 setViewerIndex(index);
// //                               }
// //                             }}
// //                             className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 border-b border-[#EEF2EF] text-left cursor-pointer active:bg-[#F7F9F8] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#2E9E4F]"
// //                             style={{ boxShadow: `inset 3px 0 0 ${m.color}` }}
// //                           >
// //                             <span className="relative w-12 h-12 shrink-0 rounded-md overflow-hidden border border-[#DCE5E0] bg-[#EEF2EF]">
// //                               <img src={toPreviewUrl(r.url)} alt="" loading="lazy" className="w-full h-full object-cover" />
// //                               {isPdf(r.url) && (
// //                                 <span className="absolute inset-x-0 bottom-0 text-[9px] font-bold text-center bg-[#1B2B26]/70 text-white">PDF</span>
// //                               )}
// //                             </span>
// //                             <span className="min-w-0 flex-1">
// //                               <span className="block font-semibold text-sm truncate">{r.name || "Unnamed guest"}</span>
// //                               <span className="flex items-center gap-1 min-w-0 text-xs">
// //                                 {r.tnr ? (
// //                                   <>
// //                                     <span className="font-semibold tracking-wide text-[#3B5BDB] select-all">{r.tnr}</span>
// //                                     <CopyTnr tnr={r.tnr} size="lg" />
// //                                   </>
// //                                 ) : (
// //                                   <span className="text-[#8FA39B]">No TNR</span>
// //                                 )}
// //                                 {r.remarks && <span className="text-[#4B5F57] truncate">· {r.remarks}</span>}
// //                               </span>
// //                               <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#8FA39B]">
// //                                 <span className="tabular-nums">{formatTime(r.createdAt)}</span>
// //                                 {r.tourTitle && <span className="hidden sm:inline truncate max-w-[260px]">· {r.tourTitle}</span>}
// //                                 <span
// //                                   className={`text-[10px] font-semibold px-1.5 py-px rounded ${r.bookingSource === "user" ? "bg-[#EBFBEE] text-[#2B8A3E]" : "bg-[#EDF2FF] text-[#364FC7]"
// //                                     }`}
// //                                 >
// //                                   {r.bookingSource === "user" ? "User" : "Admin"}
// //                                 </span>
// //                                 {r.uploader && (
// //                                   <span className="truncate max-w-[160px]">· by {uploaderName(r.uploader)}</span>
// //                                 )}
// //                               </span>
// //                             </span>
// //                             <span className="text-right shrink-0">
// //                               <span className="block font-bold tabular-nums">
// //                                 {r.amount ? `₹${formatAmount(r.amount)}` : "—"}
// //                               </span>
// //                               <span className="text-xs font-semibold" style={{ color: m.color }}>{m.label}</span>
// //                             </span>
// //                           </div>
// //                         );
// //                       })}
// //                     </div>
// //                   );
// //                 })}
// //               </div>
// //             </>
// //           )}
// //         </section>

// //         {filtered.length > visibleCount && (
// //           <div className="text-center pt-5">
// //             <button
// //               type="button"
// //               onClick={() => setVisibleCount((c) => c + 50)}
// //               className="h-10 px-6 rounded-lg border border-[#DCE5E0] bg-white text-sm font-semibold hover:bg-[#F7F9F8]"
// //             >
// //               Show {Math.min(50, filtered.length - visibleCount)} more of {filtered.length - visibleCount}
// //             </button>
// //           </div>
// //         )}
// //       </div>

// //       <Viewer items={visible} index={viewerIndex} onClose={() => setViewerIndex(null)} onNav={setViewerIndex} />
// //     </div>
// //   );
// // };

// // export default PaymentRecords;


// import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
// import { toast } from "react-toastify";
// import {
//   Search,
//   X,
//   Loader2,
//   RefreshCw,
//   ArrowUpDown,
//   ChevronLeft,
//   ChevronRight,
//   ExternalLink,
//   Copy,
//   Check,
//   FileImage,
//   Landmark,
//   FileDown,
//   CalendarDays,
// } from "lucide-react";
// import { TourContext } from "../../context/TourContext";

// /*
//   Payment Records — reads like a bank statement for the Aadhaar Upload
//   payment screenshots. Each day is a block with its own subtotal; each row
//   is one screenshot, with a coloured edge for its type. The one bold piece
//   is the "money split" bar at the top: it shows how the filtered total
//   divides into Advance / Balance / Partial, and clicking a segment filters
//   the table to that type.
// */

// const INK = "#1B2B26";
// const TYPE_META = {
//   advance: { label: "Advance", color: "#1E6FD9", soft: "#E8F1FD" },
//   balance: { label: "Balance", color: "#2E9E4F", soft: "#E7F6EC" },
//   partial: { label: "Partial", color: "#D98E04", soft: "#FDF4DC" },
// };
// const TYPE_ORDER = ["advance", "balance", "partial"];

// // A PDF on Cloudinary can't render in <img>; .jpg serves page 1 as an image.
// const toPreviewUrl = (url = "") => url.replace(/\.pdf(\?.*)?$/i, ".jpg$1");
// const isPdf = (url = "") => /\.pdf(\?.*)?$/i.test(url);

// const formatAmount = (n) => (Number(n) || 0).toLocaleString("en-IN");
// const formatTime = (d) =>
//   new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
// const formatDateTime = (d) =>
//   new Date(d).toLocaleString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//     hour: "numeric",
//     minute: "2-digit",
//     hour12: true,
//   });
// const dayKey = (d) => {
//   const x = new Date(d);
//   return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
// };
// const dayParts = (key) => {
//   const d = new Date(`${key}T00:00:00`);
//   const today = dayKey(new Date());
//   const y = new Date();
//   y.setDate(y.getDate() - 1);
//   const rel = key === today ? "Today" : key === dayKey(y) ? "Yesterday" : d.toLocaleDateString("en-IN", { weekday: "long" });
//   return {
//     day: d.getDate(),
//     month: d.toLocaleDateString("en-IN", { month: "short" }),
//     year: d.getFullYear(),
//     rel,
//   };
// };

// // Quick day filters — each sets From and To to that one day.
// const dayOffsetKey = (offset) => {
//   const d = new Date();
//   d.setDate(d.getDate() + offset);
//   return dayKey(d);
// };
// const QUICK_DAYS = [
//   { offset: -2, label: "Day before yesterday" },
//   { offset: -1, label: "Yesterday" },
//   { offset: 0, label: "Today" },
// ];

// // Tear-off calendar leaf for each day block in the statement.
// const DateStamp = ({ dp }) => (
//   <span className="inline-flex flex-col w-11 shrink-0 rounded-lg overflow-hidden border border-[#CFE3D6] bg-white text-center shadow-sm">
//     <span className="bg-[#2E9E4F] text-white text-[10px] font-semibold leading-4">
//       {dp.month} {String(dp.year).slice(2)}
//     </span>
//     <span className="text-base font-bold tabular-nums leading-6 text-[#1B2B26]">{dp.day}</span>
//   </span>
// );

// // "2026-11-08" → "08 Nov'26"
// const payRangeLabel = (key) => {
//   const d = new Date(`${key}T00:00:00`);
//   if (Number.isNaN(d.getTime())) return key;
//   return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleDateString("en-IN", { month: "short" }).slice(0, 3)}'${String(d.getFullYear()).slice(-2)}`;
// };

// // Andha naal advance pay panna bookings count (tourBookingModel). Mouse vachaa TNR list.
// const AdvanceBookingsBadge = ({ count, tnrs = [] }) =>
//   count > 0 ? (
//     <span
//       title={`Advance paid: ${tnrs.filter(Boolean).join(", ")}`}
//       className="inline-flex items-center gap-1 rounded-md bg-[#E8F1FD] text-[#1E6FD9] px-2 py-0.5 text-[11px] font-semibold tabular-nums whitespace-nowrap"
//     >
//       {count} booking{count !== 1 ? "s" : ""} · advance paid
//     </span>
//   ) : null;

// // Yaaru upload panna — { type, name, role } → "Pavithra · BAT" / "Tour admin" / "Admin"
// const uploaderName = (u) => {
//   if (!u) return "";
//   if (u.type === "staff") return u.name || "Staff";
//   if (u.type === "touradmin") return "Tour admin";
//   if (u.type === "admin") return "Admin";
//   if (u.type === "user") return u.name ? `${u.name} (Customer)` : "Customer";
//   return u.name || "";
// };
// const uploaderSub = (u) => (u?.type === "staff" ? u.role || u.employeeId || "Staff" : "");
// const uploaderSubOf = (r) => uploaderSub(r?.uploader); // staff → role / employee ID

// // Works on every device: the Clipboard API needs HTTPS (or localhost), and
// // some phones/in-app browsers don't have it, so fall back to a hidden
// // textarea + execCommand("copy").
// const copyText = async (text) => {
//   try {
//     if (navigator.clipboard && window.isSecureContext) {
//       await navigator.clipboard.writeText(text);
//       return true;
//     }
//   } catch (err) {
//     console.error("Clipboard API copy failed, trying fallback:", err);
//   }
//   try {
//     const ta = document.createElement("textarea");
//     ta.value = text;
//     ta.setAttribute("readonly", "");
//     ta.style.position = "fixed";
//     ta.style.top = "0";
//     ta.style.left = "0";
//     ta.style.opacity = "0";
//     document.body.appendChild(ta);
//     ta.focus();
//     ta.select();
//     ta.setSelectionRange(0, text.length);
//     const ok = document.execCommand("copy");
//     document.body.removeChild(ta);
//     return ok;
//   } catch (err) {
//     console.error("Fallback copy failed:", err);
//     return false;
//   }
// };

// const CopyTnr = ({ tnr, size = "sm" }) => {
//   const [copied, setCopied] = useState(false);
//   const icon = size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5";
//   return (
//     <button
//       type="button"
//       onClick={async (e) => {
//         e.stopPropagation();
//         e.preventDefault();
//         const ok = await copyText(tnr);
//         if (ok) {
//           setCopied(true);
//           toast.success(`TNR ${tnr} copied`, { autoClose: 1200 });
//           setTimeout(() => setCopied(false), 1500);
//         } else {
//           toast.error("Could not copy — long-press the TNR to copy it");
//         }
//       }}
//       title="Copy TNR"
//       aria-label={`Copy TNR ${tnr}`}
//       className={`${size === "lg" ? "p-1.5" : "p-1"} -m-0.5 rounded-md text-[#8FA39B] hover:text-[#1B2B26] hover:bg-[#EEF2EF] active:bg-[#E4F5EA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3B5BDB] shrink-0`}
//     >
//       {copied ? <Check className={`${icon} text-[#2F9E44]`} /> : <Copy className={icon} />}
//     </button>
//   );
// };

// const Viewer = ({ items, index, onClose, onNav }) => {
//   useEffect(() => {
//     if (index === null) return undefined;
//     const onKey = (e) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft" && index > 0) onNav(index - 1);
//       if (e.key === "ArrowRight" && index < items.length - 1) onNav(index + 1);
//     };
//     window.addEventListener("keydown", onKey);
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = "hidden"; // pinnaadi page scroll aaga koodaadhu
//     return () => {
//       window.removeEventListener("keydown", onKey);
//       document.body.style.overflow = prev;
//     };
//   }, [index, items.length, onClose, onNav]);

//   if (index === null || !items[index]) return null;
//   const r = items[index];
//   const meta = TYPE_META[r.type] || TYPE_META.partial;
//   return (
//     <div
//       className="fixed inset-0 z-50 bg-[#1B2B26]/80 flex items-start md:items-center justify-center p-3 sm:p-6 overflow-y-auto"
//       onClick={onClose}
//       role="dialog"
//       aria-modal="true"
//     >
//       <div
//         className="relative my-auto w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_260px] md:max-h-[92vh] md:overflow-hidden"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="bg-[#EEF2EF] min-h-0 flex items-center justify-center rounded-t-2xl md:rounded-none md:rounded-l-2xl overflow-hidden">
//           <img src={toPreviewUrl(r.url)} alt="Payment screenshot" className="max-w-full max-h-[55dvh] md:max-h-[86vh] object-contain" />
//         </div>
//         <div className="p-4 sm:p-5 pb-6 flex flex-col gap-3 sm:gap-4 md:overflow-y-auto border-t md:border-t-0 md:border-l border-[#DCE5E0]">
//           <button
//             type="button"
//             onClick={onClose}
//             aria-label="Close"
//             className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 text-[#1B2B26] shadow hover:bg-white"
//           >
//             <X className="w-4 h-4" />
//           </button>
//           <div>
//             <span className="text-xs font-semibold" style={{ color: meta.color }}>
//               {meta.label} payment
//             </span>
//             <p className="text-2xl sm:text-3xl font-bold tabular-nums" style={{ color: INK }}>
//               {r.amount ? `₹${formatAmount(r.amount)}` : "No amount"}
//             </p>
//             {r.remarks && (
//               <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-[#4B5F57]">
//                 <Landmark className="w-4 h-4" /> {r.remarks}
//               </p>
//             )}
//           </div>
//           <dl className="text-sm space-y-2">
//             <div>
//               <dt className="text-xs text-[#8FA39B]">Uploaded</dt>
//               <dd className="font-semibold text-[#1B2B26]">{formatDateTime(r.createdAt)}</dd>
//             </div>
//             <div>
//               <dt className="text-xs text-[#8FA39B]">Uploaded by</dt>
//               <dd className="font-semibold text-[#1B2B26]">
//                 {r.uploader ? (
//                   <>
//                     {uploaderName(r.uploader)}
//                     {uploaderSubOf(r) && <span className="font-normal text-[#8FA39B]"> · {uploaderSubOf(r)}</span>}
//                   </>
//                 ) : (
//                   <span className="font-normal text-[#8FA39B]">Not recorded (older upload)</span>
//                 )}
//               </dd>
//             </div>
//             <div>
//               <dt className="text-xs text-[#8FA39B]">Guest</dt>
//               <dd className="font-semibold text-[#1B2B26]">{r.name || "—"}</dd>
//             </div>
//             <div>
//               <dt className="text-xs text-[#8FA39B]">TNR</dt>
//               <dd className="font-semibold tracking-wide text-[#1B2B26] flex items-center gap-1">
//                 {r.tnr || "Not linked yet"} {r.tnr && <CopyTnr tnr={r.tnr} />}
//               </dd>
//             </div>
//             {r.tourTitle && (
//               <div>
//                 <dt className="text-xs text-[#8FA39B]">Tour</dt>
//                 <dd className="text-[#1B2B26]">{r.tourTitle}</dd>
//               </div>
//             )}
//           </dl>
//           <a
//             href={r.url}
//             target="_blank"
//             rel="noreferrer"
//             className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3B5BDB] hover:underline"
//           >
//             <ExternalLink className="w-4 h-4" /> {isPdf(r.url) ? "Open PDF" : "Open original"}
//           </a>
//           <div className="mt-auto flex items-center justify-between gap-2">
//             <button
//               type="button"
//               onClick={() => onNav(index - 1)}
//               disabled={index === 0}
//               aria-label="Previous screenshot"
//               className="p-2 rounded-lg border border-[#DCE5E0] hover:bg-[#F3F6F4] disabled:opacity-30"
//             >
//               <ChevronLeft className="w-4 h-4" />
//             </button>
//             <span className="text-xs text-[#8FA39B] tabular-nums">
//               {index + 1} of {items.length}
//             </span>
//             <button
//               type="button"
//               onClick={() => onNav(index + 1)}
//               disabled={index === items.length - 1}
//               aria-label="Next screenshot"
//               className="p-2 rounded-lg border border-[#DCE5E0] hover:bg-[#F3F6F4] disabled:opacity-30"
//             >
//               <ChevronRight className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── PDF: browser print → "Save as PDF" (desktop + phone). Extra package theva illa. ───
// // Ovvoru bank um thani page (HDFC oru page, ICICI oru page …)
// const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// const BANK_NAMES = [
//   "SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "Indian Bank", "Indian Overseas Bank",
//   "Canara Bank", "Bank of Baroda", "Union Bank of India", "Punjab National Bank", "Bank of India", "IDFC FIRST Bank",
//   "IndusInd Bank", "Yes Bank", "Federal Bank", "Karur Vysya Bank", "City Union Bank", "Tamilnad Mercantile Bank",
//   "South Indian Bank", "Equitas Small Finance Bank", "AU Small Finance Bank", "Cash",
// ];
// const BANK_ALIAS = { sbi: "SBI", statebankofindia: "SBI", iob: "Indian Overseas Bank", pnb: "Punjab National Bank", bob: "Bank of Baroda", kvb: "Karur Vysya Bank", cub: "City Union Bank", tmb: "Tamilnad Mercantile Bank", kotak: "Kotak Mahindra Bank", idfc: "IDFC FIRST Bank", idfcfirst: "IDFC FIRST Bank", union: "Union Bank of India", unionbank: "Union Bank of India" };
// const bankKey = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9]/g, "").replace(/bank|ltd|limited/g, "");
// const BANK_BY_KEY = Object.fromEntries(BANK_NAMES.map((n) => [bankKey(n), n]));
// // "hdfc", "HDFC bank", "Hdfc Bank Ltd" → "HDFC Bank"
// const bankOf = (remarks) => {
//   const k = bankKey(remarks);
//   if (!k) return "";
//   return BANK_BY_KEY[k] || BANK_ALIAS[k] || String(remarks).trim();
// };
// // Total / Advance / Balance / Partial — screen mela irukkura maadhiri
// const statsOf = (list) => {
//   const t = { all: 0, n: list.length, advance: 0, balance: 0, partial: 0, c: { advance: 0, balance: 0, partial: 0 } };
//   list.forEach((r) => {
//     const a = Number(r.amount) || 0;
//     t.all += a;
//     if (t[r.type] !== undefined) { t[r.type] += a; t.c[r.type] += 1; }
//   });
//   return t;
// };
// const statsHtml = (st) => `<div class="stats">
//   <div class="st first"><div class="l">Total received</div><div class="v" style="color:#1F7A3D">₹${formatAmount(st.all)}</div><div class="s">${st.n} payment${st.n !== 1 ? "s" : ""}</div></div>
//   ${TYPE_ORDER.map((k) => `<div class="st"><div class="l"><i style="background:${k === "partial" ? "#F4B400" : TYPE_META[k].color}"></i>${TYPE_META[k].label}<span>${st.c[k]}</span></div><div class="v">₹${formatAmount(st[k])}</div><div class="s">${st.all ? Math.round((st[k] / st.all) * 100) : 0}% of total</div></div>`).join("")}
//   <div class="split">${TYPE_ORDER.map((k) => (st[k] > 0 ? `<b style="width:${(st[k] / (st.all || 1)) * 100}%;background:${k === "partial" ? "#F4B400" : TYPE_META[k].color}"></b>` : "")).join("")}</div>
// </div>`;

// const buildPdfHtml = ({ rows, filterText, dateText }) => {
//   const NONE = "Bank not mentioned";
//   const banks = new Map(); // bank → rows
//   rows.forEach((r) => {
//     const b = bankOf(r.remarks) || NONE;
//     if (!banks.has(b)) banks.set(b, []);
//     banks.get(b).push(r);
//   });
//   const order = [...banks.keys()].sort((x, y) => (x === NONE ? 1 : y === NONE ? -1 : x.localeCompare(y)));
//   const now = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
//   const PER_PAGE = 15; // oru page la max 15 records — otti otti illaama
//   const thead = `<thead><tr><th class="c" style="width:4.5%">S.No</th><th style="width:10%">Date &amp; Time</th><th style="width:9%">TNR</th><th style="width:19%">Guest Name</th><th>Tour Name</th><th style="width:11.5%">Uploaded By</th><th style="width:9%">Type</th><th style="width:10.5%">Amount</th></tr></thead>`;
//   const pages = order.map((bank) => {
//     const list = banks.get(bank);
//     const total = list.reduce((a, r) => a + (Number(r.amount) || 0), 0);
//     const chunks = [];
//     for (let i = 0; i < list.length; i += PER_PAGE) chunks.push(list.slice(i, i + PER_PAGE));
//     return chunks.map((chunk, ci) => {
//       const last = ci === chunks.length - 1;
//       const trs = chunk.map((r, j) => {
//         const m = TYPE_META[r.type] || TYPE_META.partial;
//         return `<tr>
//         <td class="c">${ci * PER_PAGE + j + 1}</td>
//         <td class="dt">${esc(new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }))}<div class="sub">${esc(formatTime(r.createdAt))}</div></td>
//         <td class="tnr">${esc(r.tnr || "—")}</td>
//         <td>${esc(r.name || "—")}</td>
//         <td>${esc(r.tourTitle || "—")}</td>
//         <td>${esc(uploaderName(r.uploader) || "Not recorded")}</td>
//         <td><span class="pill" style="color:${m.color};background:${m.soft}">${m.label}</span></td>
//         <td class="amt">${r.amount ? `₹${formatAmount(r.amount)}` : "—"}</td>
//       </tr>`;
//       }).join("");
//       return `<section class="page${chunk.length === PER_PAGE ? " full" : ""}">
//       <div class="head">
//         <div><h1>${esc(bank)}${chunks.length > 1 ? ` <small>· Page ${ci + 1} of ${chunks.length}</small>` : ""}</h1><p class="date">${esc(dateText)}</p>${filterText ? `<p class="meta">${esc(filterText)}</p>` : ""}</div>
//         <div class="tot"><span>${list.length} payment${list.length !== 1 ? "s" : ""}</span><b>₹${formatAmount(total)}</b></div>
//       </div>
//       ${ci === 0 ? statsHtml(statsOf(list)) : ""}
//       <table>
//         ${thead}
//         <tbody>${trs}</tbody>
//         ${last ? `<tfoot><tr><td colspan="7" style="text-align:right">Total</td><td class="amt">₹${formatAmount(total)}</td></tr></tfoot>` : ""}
//       </table>
//       <p class="gen">GV Tour Planners · Generated ${esc(now)}</p>
//     </section>`;
//     }).join("");
//   }).join("");
//   return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
// <title>Payment Records - Bank wise</title>
// <style>
//   @page { size: A4 portrait; margin: 10mm; }
//   * { box-sizing: border-box; }
//   body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #1B2B26; margin: 0; font-size: 11px; -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #F3F6F4; }
//   .bar { position: sticky; top: 0; z-index: 2; display: flex; gap: 8px; padding: 10px 14px; background: #fff; border-bottom: 1px solid #DCE5E0; }
//   .bar button { font: inherit; font-size: 13px; font-weight: 700; padding: 9px 16px; border-radius: 8px; border: 0; background: #2E9E4F; color: #fff; cursor: pointer; }
//   .bar .sec { background: #fff; color: #1B2B26; border: 1px solid #DCE5E0; }
//   .page { background: #fff; max-width: 900px; margin: 14px auto; padding: 18px; border-radius: 10px; }
//   .head { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; border-bottom: 2px solid #1B2B26; padding-bottom: 8px; margin-bottom: 10px; }
//   h1 { font-size: 22px; margin: 0; } h1 small { font-size: 12px; font-weight: 600; color: #8FA39B; }
//   .meta { color: #6B7F77; font-size: 11px; margin: 2px 0 0; }
//   .date { display: inline-block; margin: 5px 0 0; font-size: 12px; font-weight: 700; color: #1E6FD9; background: #E8F1FD; padding: 3px 9px; border-radius: 6px; }
//   .stats { position: relative; display: grid; grid-template-columns: 1.2fr 1fr 1fr 1fr; border: 1px solid #DCE5E0; border-radius: 12px; overflow: hidden; margin-bottom: 12px; padding-bottom: 5px; }
//   .st { padding: 9px 11px; border-right: 1px dashed #DCE5E0; } .st:last-of-type { border-right: 0; } .st.first { background: #F1F8F3; }
//   .st .l { display: flex; align-items: center; gap: 5px; font-size: 10.5px; font-weight: 600; color: #4B5F57; } .st .l i { width: 7px; height: 7px; border-radius: 50%; display: inline-block; } .st .l span { margin-left: auto; color: #8FA39B; font-weight: 500; }
//   .st .v { font-size: 16px; font-weight: 800; margin-top: 2px; } .st .s { font-size: 9.5px; color: #8FA39B; }
//   .split { position: absolute; left: 0; right: 0; bottom: 0; height: 5px; display: flex; background: #EEF2EF; } .split b { display: block; height: 100%; }
//   .tot { text-align: right; } .tot span { display: block; font-size: 11px; color: #4B5F57; } .tot b { font-size: 18px; color: #1F7A3D; }
//   table { width: 100%; border-collapse: collapse; table-layout: fixed; }
//   th { text-align: center; font-size: 10.5px; color: #1F7A3D; background: #F2FAF4; padding: 7px 6px; border: 1px solid #CFE3D6; }
//   td { padding: 7px 6px; border: 1px solid #E3EAE6; vertical-align: middle; word-break: break-word; line-height: 1.3; font-size: 10.5px; text-align: center; }
//   tr { page-break-inside: avoid; }
//   tbody tr:nth-child(even) td { background: #FAFCFB; }
//   tfoot td { font-weight: 700; background: #F2FAF4; }
//   .dt { white-space: nowrap; } .sub { font-size: 9.5px; color: #8FA39B; margin-top: 2px; }
//   .c { text-align: center; } .tnr { font-weight: 600; white-space: nowrap; } .amt { white-space: nowrap; font-weight: 700; }
//   .pill { font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 6px; white-space: nowrap; }
//   .gen { margin: 8px 0 0; font-size: 9.5px; color: #8FA39B; text-align: right; }
//   /* Phone la paakkumbodhu — table card maadhiri (PDF save pannaa A4 table thaan) */
//   @media screen and (max-width: 640px) {
//     .page { margin: 10px; padding: 12px; }
//     .stats { grid-template-columns: 1fr 1fr; } .st { border-bottom: 1px dashed #DCE5E0; }
//     thead { display: none; } table, tbody, tfoot, tr, td { display: block; width: 100%; }
//     tbody tr { border: 1px solid #E3EAE6; border-radius: 8px; margin-bottom: 8px; padding: 6px 8px; }
//     td { border: 0; padding: 2px 0; background: none !important; text-align: left; } .c { text-align: left; color: #8FA39B; } .c::before { content: "#"; }
//     .amt { text-align: left; } tfoot td { display: inline-block; width: auto; padding: 4px 0; }
//   }
//   @media print {
//     body { background: #fff; } .bar { display: none; }
//     .page { max-width: none; margin: 0; padding: 0; border-radius: 0; page-break-after: always; break-after: page; }
//     .page:last-child { page-break-after: auto; break-after: auto; }
//     /* A4 page full-aa fill aaganum — 15 rows irundhaa rows stretch aagi keezha gap irukkaadhu */
//     .page { height: 275mm; display: flex; flex-direction: column; }
//     .page > * { flex-shrink: 0; } .page.full table { flex: 1 1 auto; }
//     .gen { margin-top: auto; padding-top: 6px; }
//   }
// </style></head><body>
//   <div class="bar"><button onclick="window.print()">Save as PDF</button><button class="sec" onclick="window.close()">Close</button></div>
//   ${pages}
// </body></html>`;
// };

// // Custom calendar — Year boxes → Month boxes → Date (browser calendar maadhiri kashtam illa)
// const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// const pad2 = (n) => String(n).padStart(2, "0");
// const ymd = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
// const DatePick = ({ value, onChange, min, max, label, padCls = "pl-12", right = false }) => {
//   const [open, setOpen] = useState(false);
//   const [mode, setMode] = useState("day"); // day | month | year
//   const boxRef = useRef(null);
//   const base = value || max || dayKey(new Date());
//   const [view, setView] = useState({ y: Number(base.slice(0, 4)), m: Number(base.slice(5, 7)) - 1 });
//   useEffect(() => {
//     if (!open) return;
//     const b = value || max || dayKey(new Date());
//     setView({ y: Number(b.slice(0, 4)), m: Number(b.slice(5, 7)) - 1 });
//     setMode("day"); // default dates; mela year click pannaa Year → Month → Date
//     const close = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
//     const esc = (e) => { if (e.key === "Escape") setOpen(false); };
//     document.addEventListener("mousedown", close);
//     document.addEventListener("touchstart", close);
//     document.addEventListener("keydown", esc);
//     return () => { document.removeEventListener("mousedown", close); document.removeEventListener("touchstart", close); document.removeEventListener("keydown", esc); };
//   }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
//   const today = dayKey(new Date());
//   const maxK = max || today;
//   const maxY = Number(maxK.slice(0, 4));
//   const minY = Math.min(maxY - 2, min ? Number(min.slice(0, 4)) : maxY - 2, 2024);
//   const years = [];
//   for (let y = minY; y <= maxY; y++) years.push(y);
//   const ymKey = (y, m) => `${y}-${pad2(m + 1)}`;
//   const monthOff = (y, m) => ymKey(y, m) > maxK.slice(0, 7) || (min && ymKey(y, m) < min.slice(0, 7));
//   const yearOff = (y) => y > maxY || (min && y < Number(min.slice(0, 4)));
//   const first = new Date(view.y, view.m, 1).getDay();
//   const days = new Date(view.y, view.m + 1, 0).getDate();
//   const cells = [];
//   for (let i = 0; i < first; i++) cells.push(null);
//   for (let d = 1; d <= days; d++) cells.push(d);
//   const shift = (n) => setView(({ y, m }) => { const d = new Date(y, m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
//   const nd = new Date(view.y, view.m + 1, 1), pd = new Date(view.y, view.m - 1, 1);
//   const nextOk = mode === "day" ? !monthOff(nd.getFullYear(), nd.getMonth()) : mode === "month" ? !yearOff(view.y + 1) : false;
//   const prevOk = mode === "day" ? !monthOff(pd.getFullYear(), pd.getMonth()) : mode === "month" ? !yearOff(view.y - 1) && view.y - 1 >= minY : false;
//   const goPrev = () => (mode === "day" ? shift(-1) : setView((v) => ({ ...v, y: v.y - 1 })));
//   const goNext = () => (mode === "day" ? shift(1) : setView((v) => ({ ...v, y: v.y + 1 })));
//   const show = value ? (() => { const d = new Date(`${value}T00:00:00`); return `${pad2(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; })() : "";
//   const vy = value ? Number(value.slice(0, 4)) : null, vm = value ? Number(value.slice(5, 7)) - 1 : null;
//   const boxCls = (sel, now) =>
//     `h-11 rounded-lg text-sm font-semibold transition-colors ${sel ? "bg-[#2E9E4F] text-white" : now ? "border border-[#2E9E4F] text-[#1F7A3D] hover:bg-[#F2FAF4]" : "bg-[#F7F9F8] text-[#1B2B26] hover:bg-[#E7F6EC]"} disabled:opacity-25 disabled:hover:bg-[#F7F9F8]`;
//   return (
//     <div ref={boxRef} className="relative min-w-0">
//       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#8FA39B] pointer-events-none">{label}</span>
//       <button
//         type="button"
//         onClick={() => setOpen((o) => !o)}
//         className={`w-full h-9 pr-8 ${padCls} rounded-lg border bg-white text-left text-sm outline-none ${open ? "border-[#2E9E4F] ring-2 ring-[#2E9E4F]/15" : "border-[#DCE5E0]"} ${show ? "text-[#1B2B26]" : "text-[#8FA39B]"}`}
//       >
//         {show || "Select date"}
//       </button>
//       {value ? (
//         <button type="button" onClick={() => onChange("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-[#8FA39B] hover:text-[#1B2B26]" aria-label="Clear date">
//           <X size={14} />
//         </button>
//       ) : (
//         <CalendarDays size={15} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8FA39B] pointer-events-none" />
//       )}
//       {open && (
//         <div className={`absolute ${right ? "right-0 md:right-auto md:left-0" : "left-0"} top-full mt-1.5 z-40 w-[280px] max-w-[calc(100vw-24px)] rounded-xl border border-[#DCE5E0] bg-white p-3 shadow-xl`}>
//           <div className="flex items-center gap-1 mb-2">
//             <button type="button" disabled={!prevOk} onClick={goPrev} className={`p-1.5 rounded-md hover:bg-[#F2FAF4] disabled:opacity-30 ${mode === "year" ? "invisible" : ""}`} aria-label="Previous"><ChevronLeft size={16} /></button>
//             <div className="flex-1 flex items-center justify-center gap-1">
//               {mode === "day" && (
//                 <button type="button" onClick={() => setMode("month")} className="px-2 py-1 rounded-md text-sm font-bold text-[#1B2B26] hover:bg-[#F2FAF4]">{MONTHS[view.m]}</button>
//               )}
//               {mode !== "year" ? (
//                 <button type="button" onClick={() => setMode("year")} className="px-2 py-1 rounded-md text-sm font-bold text-[#1B2B26] hover:bg-[#F2FAF4]">{view.y}</button>
//               ) : (
//                 <span className="px-2 py-1 text-sm font-bold text-[#1B2B26]">Select year</span>
//               )}
//             </div>
//             <button type="button" disabled={!nextOk} onClick={goNext} className={`p-1.5 rounded-md hover:bg-[#F2FAF4] disabled:opacity-30 ${mode === "year" ? "invisible" : ""}`} aria-label="Next"><ChevronRight size={16} /></button>
//           </div>

//           {mode === "year" && (
//             <div className="grid grid-cols-3 gap-2">
//               {years.map((y) => (
//                 <button key={y} type="button" disabled={!!yearOff(y)} onClick={() => { setView((v) => { let m = v.m; if (monthOff(y, m)) m = ymKey(y, m) > maxK.slice(0, 7) ? Number(maxK.slice(5, 7)) - 1 : Number(min.slice(5, 7)) - 1; return { y, m }; }); setMode("month"); }} className={boxCls(y === vy, y === Number(today.slice(0, 4)))}>
//                   {y}
//                 </button>
//               ))}
//             </div>
//           )}

//           {mode === "month" && (
//             <div className="grid grid-cols-3 gap-2">
//               {MONTHS.map((mn, i) => (
//                 <button key={mn} type="button" disabled={!!monthOff(view.y, i)} onClick={() => { setView((v) => ({ ...v, m: i })); setMode("day"); }} className={boxCls(view.y === vy && i === vm, ymKey(view.y, i) === today.slice(0, 7))}>
//                   {mn}
//                 </button>
//               ))}
//             </div>
//           )}

//           {mode === "day" && (
//             <>
//               <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-[#8FA39B] mb-1">
//                 {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <span key={d} className="py-1">{d}</span>)}
//               </div>
//               <div className="grid grid-cols-7 gap-0.5">
//                 {cells.map((d, i) => {
//                   if (!d) return <span key={`e${i}`} />;
//                   const k = ymd(view.y, view.m, d);
//                   const off = k > maxK || (min && k < min);
//                   const sel = k === value;
//                   return (
//                     <button
//                       key={k}
//                       type="button"
//                       disabled={!!off}
//                       onClick={() => { onChange(k); setOpen(false); }}
//                       className={`h-8 rounded-md text-sm tabular-nums transition-colors ${sel ? "bg-[#2E9E4F] text-white font-bold" : k === today ? "border border-[#2E9E4F] text-[#1F7A3D] font-semibold hover:bg-[#F2FAF4]" : "text-[#1B2B26] hover:bg-[#F2FAF4]"} disabled:opacity-25 disabled:hover:bg-transparent`}
//                     >
//                       {d}
//                     </button>
//                   );
//                 })}
//               </div>
//             </>
//           )}

//           <div className="flex justify-between mt-2 pt-2 border-t border-[#EEF2EF]">
//             <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="text-xs font-semibold text-[#6B7F77] hover:text-[#1B2B26] px-2 py-1">Clear</button>
//             <button type="button" disabled={today > maxK || (min && today < min)} onClick={() => { onChange(today); setOpen(false); }} className="text-xs font-semibold text-[#1F7A3D] hover:bg-[#F2FAF4] rounded px-2 py-1 disabled:opacity-30">Today</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const PaymentRecords = () => {
//   const { ttoken, getPaymentRecords } = useContext(TourContext);

//   const [records, setRecords] = useState([]);
//   // tourBookingModel la advance.paid = true bookings (backend → advancePaid)
//   const [advancePaid, setAdvancePaid] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [search, setSearch] = useState("");
//   const [type, setType] = useState("");
//   const [source, setSource] = useState("");
//   const [selTours, setSelTours] = useState([]);
//   const [tourQ, setTourQ] = useState("");
//   const [showDrop, setShowDrop] = useState(false);
//   const [from, setFrom] = useState("");
//   // Day box select → keezha table la andha naal mattum (IRCTC date strip maadhiri)
//   const [selDay, setSelDay] = useState("");
//   // Date dropdown la "Custom" select pannaa dhaan From / To theriyum
//   const [customRange, setCustomRange] = useState(false);
//   const [to, setTo] = useState("");
//   const [viewerIndex, setViewerIndex] = useState(null);
//   const [visibleCount, setVisibleCount] = useState(50);
//   // "asc" = oldest date first (default), "desc" = newest first.
//   const [sortDir, setSortDir] = useState("asc");
//   const dropRef = useRef(null);

//   const fetchRecords = useCallback(async () => {
//     if (!ttoken) return;
//     setLoading(true);
//     try {
//       const params = {};
//       if (from) params.from = from;
//       if (to) params.to = to;
//       const data = await getPaymentRecords(params);
//       if (data?.success) {
//         setRecords(data.records || []);
//         setAdvancePaid(data.advancePaid || []);
//       } else {
//         toast.error(data?.message || "Could not load payment records");
//       }
//     } catch (err) {
//       console.error("getPaymentRecords error:", err);
//       toast.error(err.response?.data?.message || err.message || "Could not load payment records");
//     } finally {
//       setLoading(false);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [ttoken, from, to]);

//   useEffect(() => {
//     fetchRecords();
//   }, [fetchRecords]);

//   useEffect(() => {
//     setVisibleCount(50);
//   }, [search, type, source, selTours, from, to, sortDir]);

//   // ── Tour search (same behaviour as the Sales Dashboard) ──────────────
//   const tourOptions = useMemo(
//     () => [...new Set(records.map((r) => r.tourTitle).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
//     [records],
//   );
//   // Tour picker — a checkbox list of every tour that has payments; typing
//   // narrows the list. The list stays open while ticking several tours.
//   const tourMatches = useMemo(() => {
//     const q = tourQ.trim().toLowerCase();
//     if (!q) return tourOptions;
//     return tourOptions.filter((t) => t.toLowerCase().includes(q));
//   }, [tourOptions, tourQ]);
//   useEffect(() => {
//     const h = (e) => {
//       if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false);
//     };
//     document.addEventListener("mousedown", h);
//     return () => document.removeEventListener("mousedown", h);
//   }, []);
//   const toggleTour = (t) =>
//     setSelTours((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
//   const allMatchesSelected = tourMatches.length > 0 && tourMatches.every((t) => selTours.includes(t));
//   const toggleAllTours = () =>
//     setSelTours((p) =>
//       allMatchesSelected
//         ? p.filter((t) => !tourMatches.includes(t))
//         : [...p, ...tourMatches.filter((t) => !p.includes(t))],
//     );
//   const removeTour = (t) => setSelTours((p) => p.filter((x) => x !== t));

//   // Everything except the type filter — the split bar is built from this,
//   // so its segments still show all three types while one is selected.
//   const baseFiltered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return records.filter((r) => {
//       if (source && r.bookingSource !== source) return false;
//       if (selTours.length && !selTours.includes(r.tourTitle)) return false;
//       if (!q) return true;
//       return [r.tnr, r.name, r.remarks, r.tourTitle, uploaderName(r.uploader), r.amount != null ? String(r.amount) : ""]
//         .join(" ")
//         .toLowerCase()
//         .includes(q);
//     });
//   }, [records, search, source, selTours]);

//   const filtered = useMemo(() => {
//     let list = type ? baseFiltered.filter((r) => r.type === type) : baseFiltered;
//     if (selDay) list = list.filter((r) => dayKey(r.createdAt) === selDay);
//     return [...list].sort((a, b) =>
//       sortDir === "asc"
//         ? new Date(a.createdAt) - new Date(b.createdAt)
//         : new Date(b.createdAt) - new Date(a.createdAt),
//     );
//   }, [baseFiltered, type, sortDir, selDay]);

//   const split = useMemo(() => {
//     const t = { advance: 0, balance: 0, partial: 0, count: { advance: 0, balance: 0, partial: 0 } };
//     baseFiltered.forEach((r) => {
//       if (t[r.type] === undefined) return;
//       t[r.type] += Number(r.amount) || 0;
//       t.count[r.type] += 1;
//     });
//     t.all = t.advance + t.balance + t.partial;
//     return t;
//   }, [baseFiltered]);

//   const shownTotal = type ? split[type] : split.all;

//   // Advance paid bookings — tourBookingModel la payment.advance.paid = true.
//   // Naal = advance paidAt. Search / Tour / Admin-User filter ku yetha maadhiri.
//   const advanceBookings = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     const byDay = new Map(); // dayKey → [tnr...]
//     let total = 0;
//     advancePaid.forEach((b) => {
//       if (source && b.bookingSource !== source) return;
//       if (selTours.length && !selTours.includes(b.tourTitle)) return;
//       if (q && ![b.tnr, b.name, b.tourTitle].join(" ").toLowerCase().includes(q)) return;
//       const k = dayKey(b.bookedAt || b.paidAt); // tour booking date (advance.paid === true)
//       if (!byDay.has(k)) byDay.set(k, []);
//       byDay.get(k).push(b);
//       total += 1;
//     });
//     return { byDay, total };
//   }, [advancePaid, search, source, selTours]);
//   const advanceCountOn = (k) => advanceBookings.byDay.get(k)?.length || 0;

//   // ── Advance paid bookings (tour bookings, advance.paid === true) ──
//   // Filter illana: inniku mattum. From / To pottaa: andha naatkal mattum —
//   // bookings = andha naatkal la motham, average = motham ÷ naatkal.
//   const todayKey = dayKey(new Date());
//   const advanceTnrsOn = (k) => (advanceBookings.byDay.get(k) || []).map((b) => b.tnr);
//   const advanceListOn = (k) => advanceBookings.byDay.get(k) || [];
//   const perDay = useMemo(() => {
//     let start = from || to || todayKey;
//     let end = to || (from ? todayKey : todayKey);
//     if (!from && to) start = to; // To mattum → andha oru naal
//     if (end > todayKey && start <= todayKey) end = todayKey;
//     if (start > end) [start, end] = [end, start];
//     let total = 0;
//     advanceBookings.byDay.forEach((items, k) => {
//       if (k >= start && k <= end) total += items.length;
//     });
//     const toUTC = (k) => { const [y, m, d] = k.split("-").map(Number); return Date.UTC(y, m - 1, d); };
//     const days = Math.round((toUTC(end) - toUTC(start)) / 86400000) + 1;

//     // Days with bookings / Busiest day / day boxes:
//     // filter illana mudhal advance booking naal → inniku varai; filter pottaa andha naatkal.
//     let aStart = start;
//     let aEnd = end;
//     if (!from && !to) {
//       const first = [...advanceBookings.byDay.keys()].sort()[0];
//       if (first && first < aStart) aStart = first;
//     }
//     let activeDays = 0;
//     let best = null;
//     advanceBookings.byDay.forEach((items, k) => {
//       if (k < aStart || k > aEnd) return;
//       activeDays += 1;
//       if (!best || items.length > best.n) best = { k, n: items.length };
//     });

//     // Keezha day boxes — Payment Records filter padi: filter illana inniku mattum,
//     // From / To pottaa andha naatkal la booking aana naatkal.
//     const list = []; // [dayKey, bookings]
//     advanceBookings.byDay.forEach((items, k) => {
//       if (k >= start && k <= end) list.push([k, items]);
//     });
//     if (!from && !to && !list.length) list.push([todayKey, []]); // inniku 0 bookings na kooda box
//     const allDays = Math.round((toUTC(aEnd) - toUTC(aStart)) / 86400000) + 1;
//     list.sort((a, b) => (sortDir === "asc" ? a[0].localeCompare(b[0]) : b[0].localeCompare(a[0])));
//     return { total, days, avg: days ? total / days : 0, start, end, activeDays, allDays, aStart, best, list };
//   }, [advanceBookings, from, to, todayKey, sortDir]);

//   // Day box click → andha naal details keezha. Matha boxes maraiyaadhu.
//   useEffect(() => { setSelDay(""); }, [from, to]);
//   const fmtAvg = (n) => String(Math.round(n)); // round off — 4.3 → 4, 4.5 → 5

//   const visible = filtered.slice(0, visibleCount);

//   const days = useMemo(() => {
//     const out = [];
//     const byKey = new Map();
//     visible.forEach((r, i) => {
//       const k = dayKey(r.createdAt);
//       if (!byKey.has(k)) {
//         const g = { key: k, rows: [], total: 0 };
//         byKey.set(k, g);
//         out.push(g);
//       }
//       const g = byKey.get(k);
//       g.rows.push({ r, index: i });
//       g.total += Number(r.amount) || 0;
//     });
//     return out;
//   }, [visible]);

//   const hasFilters = search || type || source || selTours.length || from || to || selDay;
//   const clearFilters = () => {
//     setSelDay("");
//     setCustomRange(false);
//     setSearch("");
//     setType("");
//     setSource("");
//     setSelTours([]);
//     setTourQ("");
//     setFrom("");
//     setTo("");
//   };

//   // PDF — ippo podra filters padi ELLAA rows um (Show more pannaadhadhu kooda)
//   const downloadPdf = () => {
//     if (!filtered.length) { toast.info("No payments to export for these filters"); return; }
//     const parts = [];
//     if (selDay) parts.push(payRangeLabel(selDay));
//     else if (from && to && from === to) parts.push(payRangeLabel(from));
//     else if (from || to) parts.push(`${from ? payRangeLabel(from) : "Start"} – ${to ? payRangeLabel(to) : "Today"}`);
//     else {
//       // All dates → mudhal payment la irundhu kadaisi payment varai
//       const ks = filtered.map((r) => dayKey(r.createdAt)).sort();
//       parts.push(ks.length ? (ks[0] === ks[ks.length - 1] ? payRangeLabel(ks[0]) : `${payRangeLabel(ks[0])} – ${payRangeLabel(ks[ks.length - 1])} (all dates)`) : "All dates");
//     }
//     if (type) parts.push(TYPE_META[type].label);
//     if (source) parts.push(source === "user" ? "User bookings" : "Admin bookings");
//     if (selTours.length) parts.push(selTours.length === 1 ? selTours[0] : `${selTours.length} tours`);
//     if (search.trim()) parts.push(`Search: ${search.trim()}`);
//     const dateText = parts.shift(); // date mela thani-aa (blue)
//     const html = buildPdfHtml({ rows: filtered, filterText: parts.join(" · "), dateText: `Date: ${dateText}` });
//     const w = window.open("", "_blank");
//     if (!w) { toast.error("Allow pop-ups for this site to download the PDF"); return; }
//     w.document.open();
//     w.document.write(html);
//     w.document.close();
//     w.focus();
//     setTimeout(() => { try { w.print(); } catch { /* user can tap Save as PDF */ } }, 500);
//   };

//   const fieldCls =
//     "w-full h-9 px-3 rounded-lg border border-[#DCE5E0] bg-white text-sm text-[#1B2B26] placeholder:text-[#8FA39B] outline-none focus:border-[#2E9E4F] focus:ring-2 focus:ring-[#2E9E4F]/15";

//   return (
//     <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#EEF5F0] pt-16 pb-4 sm:pb-5 lg:pt-5 px-3 sm:px-6 text-[#1B2B26] text-sm">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
//           <div>
//             <h1 className="text-xl font-bold tracking-tight">Payment Records</h1>
//             <p className="text-xs text-[#6B7F77]">Advance, balance and partial payment screenshots, {sortDir === "asc" ? "oldest" : "newest"} first</p>
//           </div>
//           <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto [&>button]:flex-1 sm:[&>button]:flex-none [&>button]:justify-center">
//             <button
//               type="button"
//               onClick={downloadPdf}
//               disabled={loading || !filtered.length}
//               title="Download the current list as PDF"
//               className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[#C7D2FE] bg-[#EEF2FF] text-sm font-semibold text-[#4338CA] hover:bg-[#E0E7FF] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4338CA]"
//             >
//               <FileDown className="w-4 h-4" /> PDF
//             </button>
//             <button
//               type="button"
//               onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
//               title="Change date order"
//               className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[#DCE5E0] bg-white text-sm font-semibold text-[#1B2B26] hover:bg-[#F7F9F8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2E9E4F]"
//             >
//               <ArrowUpDown className="w-4 h-4 text-[#2E9E4F]" />
//               {sortDir === "asc" ? "Oldest first" : "Newest first"}
//             </button>
//             <button
//               type="button"
//               onClick={fetchRecords}
//               disabled={loading}
//               className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#2E9E4F] hover:bg-[#268A44] text-white text-sm font-semibold disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E6FD9]"
//             >
//               <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
//             </button>
//           </div>
//         </div>

//         {/* Summary receipt — total + three type cells split by perforated
//             dividers; the coloured strip along the bottom shows the split.
//             Clicking a type cell filters the statement to that type. */}
//         <section className="bg-white rounded-2xl border border-[#DCE5E0] overflow-hidden mb-4">
//           <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
//             <div className="col-span-2 sm:col-span-3 xl:col-span-1 px-4 py-3.5 bg-[#F1F8F3] border-b xl:border-b-0 xl:border-r border-dashed border-[#CFE3D6]">
//               <p className="text-xs text-[#4B5F57]">
//                 {type ? `${TYPE_META[type].label} received` : "Total received"}
//               </p>
//               <p className="text-xl sm:text-2xl font-bold tabular-nums tracking-tight text-[#1F7A3D] break-all">₹{formatAmount(shownTotal)}</p>
//               <p className="text-[11px] text-[#8FA39B]">
//                 {filtered.length} screenshot{filtered.length !== 1 ? "s" : ""}
//                 {type && (
//                   <button type="button" onClick={() => setType("")} className="ml-2 font-semibold text-[#1E6FD9] hover:underline">
//                     Show all
//                   </button>
//                 )}
//               </p>
//             </div>
//             {TYPE_ORDER.map((k, i) => {
//               const m = TYPE_META[k];
//               const active = type === k;
//               const bar = k === "partial" ? "#F4B400" : m.color;
//               return (
//                 <button
//                   key={k}
//                   type="button"
//                   onClick={() => setType(active ? "" : k)}
//                   aria-pressed={active}
//                   className={`relative min-w-0 text-left px-3 sm:px-4 py-3 sm:py-3.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1E6FD9] ${i < 2 ? "border-r border-dashed border-[#DCE5E0]" : "xl:border-r-0"
//                     } ${i === 2 ? "col-span-2 sm:col-span-1 border-t sm:border-t-0 border-dashed border-[#DCE5E0]" : ""} ${active ? "" : "hover:bg-[#FAFCFB]"
//                     } ${type && !active ? "opacity-50" : ""}`}
//                   style={active ? { background: m.soft } : undefined}
//                 >
//                   <span className="absolute left-0 top-0 h-full w-[3px]" style={{ background: active ? bar : "transparent" }} />
//                   <span className="flex items-center gap-1.5 text-xs font-semibold text-[#4B5F57]">
//                     <span className="w-2 h-2 rounded-full shrink-0" style={{ background: bar }} />
//                     {m.label}
//                     <span className="ml-auto text-[11px] font-medium text-[#8FA39B] tabular-nums">{split.count[k]}</span>
//                   </span>
//                   <span className="block text-base sm:text-lg font-bold tabular-nums mt-0.5 truncate">₹{formatAmount(split[k])}</span>
//                   <span className="block text-[11px] text-[#8FA39B] tabular-nums">
//                     {split.all ? Math.round((split[k] / split.all) * 100) : 0}% of total
//                   </span>
//                 </button>
//               );
//             })}
//           </div>
//           <div className="flex h-1.5 w-full bg-[#EEF2EF]" aria-hidden="true">
//             {TYPE_ORDER.map((k) =>
//               split[k] > 0 ? (
//                 <div
//                   key={k}
//                   style={{
//                     width: `${(split[k] / (split.all || 1)) * 100}%`,
//                     background: k === "partial" ? "#F4B400" : TYPE_META[k].color,
//                     opacity: type && type !== k ? 0.25 : 1,
//                   }}
//                   className="h-full transition-opacity"
//                 />
//               ) : null,
//             )}
//           </div>
//         </section>

//         {/* Advance paid bookings (tour bookings, advance.paid === true) — inniku, illana filter potta naatkal */}
//         <section className="bg-white rounded-2xl border border-[#DCE5E0] p-3 mb-4">
//           <p className="text-xs font-semibold text-[#1E6FD9]">Advance paid bookings</p>
//           <p className="text-[11px] text-[#8FA39B] mb-2">
//             {perDay.start === perDay.end
//               ? `${perDay.start === todayKey ? "Today · " : ""}${payRangeLabel(perDay.start)}`
//               : `${payRangeLabel(perDay.start)} – ${payRangeLabel(perDay.end)} · ${perDay.days} days`}
//           </p>
//           <div className="grid grid-cols-2 gap-2">
//             <div className="rounded-lg bg-[#E8F1FD] px-3 py-2">
//               <p className="text-[11px] text-[#4B5F57]">Bookings (advance paid)</p>
//               <p className="text-xl font-bold tabular-nums text-[#1E6FD9] leading-tight">{perDay.total}</p>
//             </div>
//             <div className="rounded-lg bg-[#E7F6EC] px-3 py-2">
//               <p className="text-[11px] text-[#4B5F57]">Average per day</p>
//               <p className="text-xl font-bold tabular-nums text-[#0F7A5A] leading-tight">{fmtAvg(perDay.avg)}</p>
//               {perDay.days > 1 && (
//                 <p className="text-[10.5px] text-[#8FA39B] tabular-nums">{perDay.total} ÷ {perDay.days} days</p>
//               )}
//             </div>
//           </div>

//           {/* Days with bookings + Busiest day */}
//           <div className="mt-2 grid grid-cols-2 gap-2">
//             <div className="rounded-lg border border-[#DCE5E0] bg-[#F7F9F8] px-3 py-2">
//               <p className="text-[11px] text-[#6B7F77]">Days with bookings</p>
//               <p className="text-base font-bold tabular-nums text-[#1B2B26] leading-tight">
//                 {perDay.activeDays} / {perDay.allDays}
//               </p>
//               <p className="text-[10.5px] text-[#8FA39B]">
//                 {!from && !to && perDay.activeDays ? `Since ${payRangeLabel(perDay.aStart)}` : perDay.activeDays ? "" : "No bookings"}
//               </p>
//             </div>
//             {perDay.best ? (
//               <button
//                 type="button"
//                 onClick={() => setSelDay((d) => (d === perDay.best.k ? "" : perDay.best.k))}
//                 title="Show this day's bookings"
//                 className={`text-left rounded-lg border px-3 py-2 hover:bg-[#EEF3F0] ${selDay === perDay.best.k ? "border-[#1E6FD9] bg-[#E8F1FD]" : "border-[#DCE5E0] bg-[#F7F9F8]"}`}
//               >
//                 <p className="text-[11px] text-[#6B7F77]">Busiest day</p>
//                 <p className="text-base font-bold tabular-nums text-[#1B2B26] leading-tight">
//                   {perDay.best.n} booking{perDay.best.n !== 1 ? "s" : ""}
//                 </p>
//                 <p className="text-[10.5px] text-[#8FA39B]">{payRangeLabel(perDay.best.k)}</p>
//               </button>
//             ) : (
//               <div className="rounded-lg border border-[#DCE5E0] bg-[#F7F9F8] px-3 py-2">
//                 <p className="text-[11px] text-[#6B7F77]">Busiest day</p>
//                 <p className="text-base font-bold text-[#8FA39B] leading-tight">—</p>
//               </div>
//             )}
//           </div>

//           {/* Day boxes — click pannaa andha naal details keezha; matha boxes apdiye irukkum */}
//           {perDay.list.length > 0 && (
//             <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
//               {perDay.list.map(([k, items]) => {
//                 const dp = dayParts(k);
//                 const active = selDay === k;
//                 return (
//                   <button
//                     key={k}
//                     type="button"
//                     aria-pressed={active}
//                     onClick={() => setSelDay(active ? "" : k)}
//                     className={`shrink-0 text-left rounded-lg border px-3 py-1.5 ${active ? "border-[#1E6FD9] bg-[#E8F1FD]" : "border-[#DCE5E0] hover:bg-[#F7F9F8]"}`}
//                   >
//                     <span className="block text-[11px] text-[#6B7F77] whitespace-nowrap">
//                       {String(dp.day).padStart(2, "0")} {dp.month} {String(dp.year).slice(2)} · {dp.rel}
//                     </span>
//                     <span className="block text-sm font-bold tabular-nums text-[#1E6FD9]">
//                       {items.length} booking{items.length !== 1 ? "s" : ""}
//                     </span>
//                   </button>
//                 );
//               })}
//             </div>
//           )}

//           {selDay && (
//             <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
//               <span className="rounded-full bg-[#E8F1FD] text-[#1E6FD9] font-semibold px-2.5 py-1">
//                 Showing {payRangeLabel(selDay)} only
//               </span>
//               <button type="button" onClick={() => setSelDay("")} className="font-semibold text-[#4B5F57] underline hover:text-[#1B2B26]">
//                 Show all days
//               </button>
//             </div>
//           )}
//         </section>

//         {/* Filters — one compact toolbar */}
//         <section className="bg-white rounded-2xl border border-[#DCE5E0] p-3 mb-4">
//           <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//             <div className="col-span-2 md:col-span-1 relative min-w-0">
//               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA39B] pointer-events-none" />
//               <input
//                 aria-label="Search guest, TNR, bank or amount"
//                 type="text"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Guest, TNR, bank or amount"
//                 className={`${fieldCls} pl-9 pr-8`}
//               />
//               {search && (
//                 <button
//                   type="button"
//                   onClick={() => setSearch("")}
//                   aria-label="Clear search"
//                   className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-[#8FA39B] hover:text-[#1B2B26]"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               )}
//             </div>
//             <div className="col-span-2 md:col-span-1 relative min-w-0" ref={dropRef}>
//               <button
//                 type="button"
//                 onClick={() => setShowDrop((v) => !v)}
//                 aria-haspopup="listbox"
//                 aria-expanded={showDrop}
//                 className={`${fieldCls} flex items-center gap-2 text-left`}
//               >
//                 <Search className="w-4 h-4 shrink-0 text-[#8FA39B]" />
//                 <span className={`flex-1 truncate ${selTours.length ? "text-[#1B2B26] font-medium" : "text-[#8FA39B]"}`}>
//                   {selTours.length === 0
//                     ? "All tours"
//                     : selTours.length === 1
//                       ? selTours[0]
//                       : `${selTours.length} tours selected`}
//                 </span>
//                 <ChevronRight className={`w-4 h-4 shrink-0 text-[#8FA39B] transition-transform ${showDrop ? "-rotate-90" : "rotate-90"}`} />
//               </button>
//               {showDrop && (
//                 <div className="absolute left-0 right-0 md:right-auto md:w-[360px] top-[calc(100%+4px)] z-30 bg-white border border-[#DCE5E0] rounded-xl shadow-lg overflow-hidden">
//                   <div className="p-2 border-b border-[#EEF2EF]">
//                     <div className="relative">
//                       <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8FA39B] pointer-events-none" />
//                       <input
//                         autoFocus
//                         aria-label="Search tour"
//                         type="text"
//                         value={tourQ}
//                         onChange={(e) => setTourQ(e.target.value)}
//                         placeholder="Search tour"
//                         className="w-full h-8 pl-8 pr-2 rounded-md border border-[#DCE5E0] text-sm outline-none focus:border-[#2E9E4F]"
//                       />
//                     </div>
//                   </div>
//                   {tourMatches.length === 0 ? (
//                     <p className="px-3 py-4 text-sm text-[#8FA39B] text-center">No tours match "{tourQ}"</p>
//                   ) : (
//                     <ul role="listbox" aria-multiselectable="true" className="max-h-64 overflow-y-auto py-1">
//                       <li>
//                         <label className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#1F7A3D] cursor-pointer hover:bg-[#F1F8F3] border-b border-[#EEF2EF]">
//                           <input
//                             type="checkbox"
//                             checked={allMatchesSelected}
//                             onChange={toggleAllTours}
//                             className="w-4 h-4 accent-[#2E9E4F]"
//                           />
//                           {tourQ ? `Select all matching (${tourMatches.length})` : `Select all tours (${tourMatches.length})`}
//                         </label>
//                       </li>
//                       {tourMatches.map((t) => {
//                         const checked = selTours.includes(t);
//                         const count = records.filter((r) => r.tourTitle === t).length;
//                         return (
//                           <li key={t}>
//                             <label
//                               className={`flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-[#F7F9F8] ${checked ? "bg-[#F1F8F3]" : ""
//                                 }`}
//                             >
//                               <input
//                                 type="checkbox"
//                                 checked={checked}
//                                 onChange={() => toggleTour(t)}
//                                 className="w-4 h-4 shrink-0 accent-[#2E9E4F]"
//                               />
//                               <span className={`flex-1 min-w-0 truncate ${checked ? "font-semibold text-[#1F7A3D]" : ""}`}>{t}</span>
//                               <span className="text-[11px] text-[#8FA39B] tabular-nums shrink-0">{count}</span>
//                             </label>
//                           </li>
//                         );
//                       })}
//                     </ul>
//                   )}
//                   <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-[#EEF2EF] bg-[#FAFCFB]">
//                     <button
//                       type="button"
//                       onClick={() => setSelTours([])}
//                       disabled={!selTours.length}
//                       className="text-xs font-semibold text-[#6B7F77] hover:text-[#1B2B26] disabled:opacity-40"
//                     >
//                       Clear
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setShowDrop(false);
//                         setTourQ("");
//                       }}
//                       className="h-7 px-3 rounded-md bg-[#2E9E4F] text-white text-xs font-semibold hover:bg-[#268A44]"
//                     >
//                       Done{selTours.length ? ` (${selTours.length})` : ""}
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//             <select
//               aria-label="Date"
//               value={(() => {
//                 if (customRange) return "custom";
//                 const hit = QUICK_DAYS.find(({ offset }) => {
//                   const k = dayOffsetKey(offset);
//                   return from === k && to === k;
//                 });
//                 if (hit) return String(hit.offset);
//                 return from || to ? "custom" : "";
//               })()}
//               onChange={(e) => {
//                 const v = e.target.value;
//                 if (v === "custom") {
//                   setCustomRange(true);
//                   return;
//                 }
//                 setCustomRange(false);
//                 if (v === "") {
//                   setFrom("");
//                   setTo("");
//                 } else {
//                   const k = dayOffsetKey(Number(v));
//                   setFrom(k);
//                   setTo(k);
//                 }
//               }}
//               className={`${fieldCls} col-span-2 md:col-span-1 pr-8 cursor-pointer`}
//             >
//               <option value="">All dates</option>
//               {QUICK_DAYS.map(({ offset, label }) => (
//                 <option key={offset} value={String(offset)}>
//                   {label}
//                 </option>
//               ))}
//               <option value="custom">Custom</option>
//             </select>
//             {(customRange || ((from || to) && !QUICK_DAYS.some(({ offset }) => { const k = dayOffsetKey(offset); return from === k && to === k; }))) && (
//               <>
//               <DatePick label="From" value={from} max={to || todayKey} onChange={(v) => setFrom(v > todayKey ? todayKey : v)} padCls="pl-12" />
//               <DatePick label="To" value={to} min={from || undefined} max={todayKey} onChange={(v) => setTo(v > todayKey ? todayKey : v)} padCls="pl-9" right />
//               </>
//             )}
//             <div className="col-span-2 md:col-span-1 flex h-9 rounded-lg border border-[#DCE5E0] p-0.5 bg-[#F7F9F8]" role="group" aria-label="Booking type">
//               {[
//                 { v: "", l: "All" },
//                 { v: "admin", l: "Admin" },
//                 { v: "user", l: "User" },
//               ].map((o) => (
//                 <button
//                   key={o.v || "all"}
//                   type="button"
//                   onClick={() => setSource(o.v)}
//                   aria-pressed={source === o.v}
//                   className={`flex-1 px-3 rounded-md text-xs font-semibold ${source === o.v ? "bg-white text-[#1F7A3D] shadow-sm" : "text-[#6B7F77] hover:text-[#1B2B26]"
//                     }`}
//                 >
//                   {o.l}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {(selTours.length > 0 || hasFilters) && (
//             <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
//               {selTours.map((t) => (
//                 <span
//                   key={t}
//                   className="inline-flex items-center gap-1 max-w-full h-7 pl-2.5 pr-1.5 rounded-md bg-[#F1F8F3] border border-[#CFE3D6] text-[#1F7A3D] text-xs font-semibold"
//                 >
//                   <span className="truncate">{t}</span>
//                   <button type="button" onClick={() => removeTour(t)} aria-label={`Remove ${t}`} className="shrink-0 hover:text-[#1B2B26]">
//                     <X className="w-3.5 h-3.5" />
//                   </button>
//                 </span>
//               ))}
//               {hasFilters && (
//                 <button type="button" onClick={clearFilters} className="ml-auto text-xs font-semibold text-[#6B7F77] hover:text-[#1B2B26] hover:underline">
//                   Clear all filters
//                 </button>
//               )}
//             </div>
//           )}
//         </section>

//         {/* Statement */}
//         <section className="bg-white rounded-2xl border border-[#DCE5E0] overflow-hidden">
//           {loading && records.length === 0 ? (
//             <div className="flex justify-center py-20">
//               <Loader2 className="w-9 h-9 animate-spin text-[#3B5BDB]" />
//             </div>
//           ) : filtered.length === 0 ? (
//             <div className="py-16 px-4 text-center">
//               <FileImage className="w-10 h-10 mx-auto mb-3 text-[#B9C9C1]" />
//               <p className="font-semibold">No payment screenshots match</p>
//               <p className="text-sm text-[#4B5F57] mt-1">
//                 {hasFilters ? "Change or clear the filters to see more." : "Payment screenshots will show here once they are uploaded."}
//               </p>
//             </div>
//           ) : (
//             <>
//               <div className="hidden xl:block overflow-x-auto">
//                 {/* table-fixed — screen agalathukku ulla adangum, side la cut aagaadhu */}
//                 <table className="w-full table-fixed text-sm border-collapse">
//                   <thead>
//                     <tr className="text-xs text-[#1F7A3D] bg-[#F2FAF4] border-b border-[#CFE3D6]">
//                       <th className="pl-4 pr-2 py-3 text-left font-semibold w-[5.5rem]">Time</th>
//                       <th className="px-2 py-3 text-left font-semibold w-16">Proof</th>
//                       <th className="px-2 py-3 text-left font-semibold w-[24%]">Guest and TNR</th>
//                       <th className="px-2 py-3 text-left font-semibold w-[9%]">Bank</th>
//                       <th className="px-2 py-3 text-left font-semibold">Tour</th>
//                       <th className="px-2 py-3 text-left font-semibold w-[15%]">Uploaded by</th>
//                       <th className="pl-2 pr-4 py-3 text-right font-semibold w-28">Amount</th>
//                     </tr>
//                   </thead>
//                   {days.map((g) => {
//                     const dp = dayParts(g.key);
//                     return (
//                       <tbody key={g.key}>
//                         <tr className="border-y border-[#DCE5E0] bg-[#FAFCFB]">
//                           <td colSpan={6} className="pl-4 pr-2 py-3">
//                             <div className="flex items-center gap-3">
//                               <DateStamp dp={dp} />
//                               <div>
//                                 <p className="font-semibold leading-tight">{dp.rel}</p>
//                                 <p className="text-xs text-[#8FA39B]">{g.rows.length} payment{g.rows.length !== 1 ? "s" : ""} received</p>
//                               </div>
//                               <AdvanceBookingsBadge count={advanceCountOn(g.key)} tnrs={advanceTnrsOn(g.key)} />
//                             </div>
//                           </td>
//                           <td className="pl-2 pr-4 py-3 text-right">
//                             <span className="inline-block rounded-lg bg-[#E4F5EA] text-[#1F7A3D] px-3 py-1 font-bold tabular-nums">
//                               ₹{formatAmount(g.total)}
//                             </span>
//                           </td>
//                         </tr>
//                         {g.rows.map(({ r, index }) => {
//                           const m = TYPE_META[r.type] || TYPE_META.partial;
//                           return (
//                             <tr key={r._id} className="border-b border-[#EEF2EF] last:border-0 hover:bg-[#F7F9F8]">
//                               <td className="pl-4 pr-2 py-2.5 align-middle whitespace-nowrap tabular-nums text-[#4B5F57]">
//                                 <span className="relative pl-3">
//                                   <span className="absolute left-0 top-0.5 bottom-0.5 w-1 rounded-full" style={{ background: m.color }} />
//                                   {formatTime(r.createdAt)}
//                                 </span>
//                               </td>
//                               <td className="px-2 py-3">
//                                 <button
//                                   type="button"
//                                   onClick={() => setViewerIndex(index)}
//                                   aria-label="View screenshot"
//                                   className="relative block w-10 h-10 rounded-md overflow-hidden border border-[#DCE5E0] bg-[#EEF2EF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3B5BDB] hover:border-[#3B5BDB]"
//                                 >
//                                   <img src={toPreviewUrl(r.url)} alt="" loading="lazy" className="w-full h-full object-cover" />
//                                   {isPdf(r.url) && (
//                                     <span className="absolute inset-x-0 bottom-0 text-[9px] font-bold text-center bg-[#1B2B26]/70 text-white">
//                                       PDF
//                                     </span>
//                                   )}
//                                 </button>
//                               </td>
//                               <td className="px-2 py-3 min-w-0">
//                                 <p className="font-semibold truncate" title={r.name}>{r.name || "Unnamed guest"}</p>
//                                 {r.tnr ? (
//                                   <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-[#3B5BDB]">
//                                     <span className="select-all">{r.tnr}</span> <CopyTnr tnr={r.tnr} />
//                                   </span>
//                                 ) : (
//                                   <span className="text-xs text-[#8FA39B]">TNR not linked yet</span>
//                                 )}
//                               </td>
//                               <td className="px-2 py-3 text-[#4B5F57]">
//                                 <span className="block truncate" title={r.remarks}>{r.remarks || <span className="text-[#B9C9C1]">—</span>}</span>
//                               </td>
//                               <td className="px-2 py-3 text-[#4B5F57]">
//                                 <span className="block truncate" title={r.tourTitle}>{r.tourTitle || <span className="text-[#B9C9C1]">—</span>}</span>
//                                 <span
//                                   className={`mt-1 inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md ${r.bookingSource === "user" ? "bg-[#EBFBEE] text-[#2B8A3E]" : "bg-[#EDF2FF] text-[#364FC7]"
//                                     }`}
//                                 >
//                                   {r.bookingSource === "user" ? "User" : "Admin"}
//                                 </span>
//                               </td>
//                               <td className="px-2 py-3 min-w-0">
//                                 {r.uploader ? (
//                                   <>
//                                     <span className="block font-semibold truncate text-[#1B2B26]">{uploaderName(r.uploader)}</span>
//                                     {uploaderSubOf(r) && (
//                                       <span className="block text-[11px] text-[#8FA39B] truncate">{uploaderSubOf(r)}</span>
//                                     )}
//                                   </>
//                                 ) : (
//                                   <span className="text-[11px] text-[#B9C9C1]">Not recorded</span>
//                                 )}
//                               </td>
//                               <td className="pl-2 pr-4 py-3 text-right whitespace-nowrap">
//                                 <span className="block font-bold tabular-nums text-sm">
//                                   {r.amount ? `₹${formatAmount(r.amount)}` : <span className="text-[#B9C9C1] font-normal">—</span>}
//                                 </span>
//                                 <span className="text-xs font-semibold" style={{ color: m.color }}>
//                                   {m.label}
//                                 </span>
//                               </td>
//                             </tr>
//                           );
//                         })}
//                       </tbody>
//                     );
//                   })}
//                 </table>
//               </div>

//               {/* Mobile: same statement as a compact list */}
//               <div className="xl:hidden">
//                 {days.map((g) => {
//                   const dp = dayParts(g.key);
//                   return (
//                     <div key={g.key}>
//                       <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-[#FAFCFB] border-y border-[#DCE5E0]">
//                         <div className="flex items-center gap-2.5 min-w-0">
//                           <DateStamp dp={dp} />
//                           <div className="min-w-0">
//                             <p className="font-semibold text-sm leading-tight truncate">{dp.rel}</p>
//                             <p className="text-xs text-[#8FA39B]">{g.rows.length} received</p>
//                             <div className="mt-1">
//                               <AdvanceBookingsBadge count={advanceCountOn(g.key)} tnrs={advanceTnrsOn(g.key)} />
//                             </div>
//                           </div>
//                         </div>
//                         <span className="rounded-lg bg-[#E4F5EA] text-[#1F7A3D] px-2.5 py-1 font-bold tabular-nums text-sm shrink-0">
//                           ₹{formatAmount(g.total)}
//                         </span>
//                       </div>
//                       {g.rows.map(({ r, index }) => {
//                         const m = TYPE_META[r.type] || TYPE_META.partial;
//                         return (
//                           <div
//                             key={r._id}
//                             role="button"
//                             tabIndex={0}
//                             onClick={() => setViewerIndex(index)}
//                             onKeyDown={(e) => {
//                               if (e.key === "Enter" || e.key === " ") {
//                                 e.preventDefault();
//                                 setViewerIndex(index);
//                               }
//                             }}
//                             className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 border-b border-[#EEF2EF] text-left cursor-pointer active:bg-[#F7F9F8] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#2E9E4F]"
//                             style={{ boxShadow: `inset 3px 0 0 ${m.color}` }}
//                           >
//                             <span className="relative w-12 h-12 shrink-0 rounded-md overflow-hidden border border-[#DCE5E0] bg-[#EEF2EF]">
//                               <img src={toPreviewUrl(r.url)} alt="" loading="lazy" className="w-full h-full object-cover" />
//                               {isPdf(r.url) && (
//                                 <span className="absolute inset-x-0 bottom-0 text-[9px] font-bold text-center bg-[#1B2B26]/70 text-white">PDF</span>
//                               )}
//                             </span>
//                             <span className="min-w-0 flex-1">
//                               <span className="block font-semibold text-sm truncate">{r.name || "Unnamed guest"}</span>
//                               <span className="flex items-center gap-1 min-w-0 text-xs">
//                                 {r.tnr ? (
//                                   <>
//                                     <span className="font-semibold tracking-wide text-[#3B5BDB] select-all">{r.tnr}</span>
//                                     <CopyTnr tnr={r.tnr} size="lg" />
//                                   </>
//                                 ) : (
//                                   <span className="text-[#8FA39B]">No TNR</span>
//                                 )}
//                                 {r.remarks && <span className="text-[#4B5F57] truncate">· {r.remarks}</span>}
//                               </span>
//                               <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#8FA39B]">
//                                 <span className="tabular-nums">{formatTime(r.createdAt)}</span>
//                                 {r.tourTitle && <span className="hidden sm:inline truncate max-w-[260px]">· {r.tourTitle}</span>}
//                                 <span
//                                   className={`text-[10px] font-semibold px-1.5 py-px rounded ${r.bookingSource === "user" ? "bg-[#EBFBEE] text-[#2B8A3E]" : "bg-[#EDF2FF] text-[#364FC7]"
//                                     }`}
//                                 >
//                                   {r.bookingSource === "user" ? "User" : "Admin"}
//                                 </span>
//                                 {r.uploader && (
//                                   <span className="truncate max-w-[160px]">· by {uploaderName(r.uploader)}</span>
//                                 )}
//                               </span>
//                             </span>
//                             <span className="text-right shrink-0">
//                               <span className="block font-bold tabular-nums">
//                                 {r.amount ? `₹${formatAmount(r.amount)}` : "—"}
//                               </span>
//                               <span className="text-xs font-semibold" style={{ color: m.color }}>{m.label}</span>
//                             </span>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   );
//                 })}
//               </div>
//             </>
//           )}
//         </section>

//         {filtered.length > visibleCount && (
//           <div className="text-center pt-5">
//             <button
//               type="button"
//               onClick={() => setVisibleCount((c) => c + 50)}
//               className="h-10 px-6 rounded-lg border border-[#DCE5E0] bg-white text-sm font-semibold hover:bg-[#F7F9F8]"
//             >
//               Show {Math.min(50, filtered.length - visibleCount)} more of {filtered.length - visibleCount}
//             </button>
//           </div>
//         )}
//       </div>

//       <Viewer items={visible} index={viewerIndex} onClose={() => setViewerIndex(null)} onNav={setViewerIndex} />
//     </div>
//   );
// };

// export default PaymentRecords;


import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Search,
  X,
  Loader2,
  RefreshCw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  FileImage,
  Landmark,
  FileDown,
  CalendarDays,
} from "lucide-react";
import { TourContext } from "../../context/TourContext";

/*
  Payment Records — reads like a bank statement for the Aadhaar Upload
  payment screenshots. Each day is a block with its own subtotal; each row
  is one screenshot, with a coloured edge for its type. The one bold piece
  is the "money split" bar at the top: it shows how the filtered total
  divides into Advance / Balance / Partial, and clicking a segment filters
  the table to that type.
*/

const INK = "#1B2B26";
const TYPE_META = {
  advance: { label: "Advance", color: "#1E6FD9", soft: "#E8F1FD" },
  balance: { label: "Balance", color: "#2E9E4F", soft: "#E7F6EC" },
  partial: { label: "Partial", color: "#D98E04", soft: "#FDF4DC" },
};
const TYPE_ORDER = ["advance", "balance", "partial"];

// A PDF on Cloudinary can't render in <img>; .jpg serves page 1 as an image.
const toPreviewUrl = (url = "") => url.replace(/\.pdf(\?.*)?$/i, ".jpg$1");
const isPdf = (url = "") => /\.pdf(\?.*)?$/i.test(url);

const formatAmount = (n) => (Number(n) || 0).toLocaleString("en-IN");
const formatTime = (d) =>
  new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
const formatDateTime = (d) =>
  new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
const dayKey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
const dayParts = (key) => {
  const d = new Date(`${key}T00:00:00`);
  const today = dayKey(new Date());
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const rel = key === today ? "Today" : key === dayKey(y) ? "Yesterday" : d.toLocaleDateString("en-IN", { weekday: "long" });
  return {
    day: d.getDate(),
    month: d.toLocaleDateString("en-IN", { month: "short" }),
    year: d.getFullYear(),
    rel,
  };
};

// Quick day filters — each sets From and To to that one day.
const dayOffsetKey = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return dayKey(d);
};
const QUICK_DAYS = [
  { offset: -2, label: "Day before yesterday" },
  { offset: -1, label: "Yesterday" },
  { offset: 0, label: "Today" },
];

// Tear-off calendar leaf for each day block in the statement.
const DateStamp = ({ dp }) => (
  <span className="inline-flex flex-col w-11 shrink-0 rounded-lg overflow-hidden border border-[#CFE3D6] bg-white text-center shadow-sm">
    <span className="bg-[#2E9E4F] text-white text-[10px] font-semibold leading-4">
      {dp.month} {String(dp.year).slice(2)}
    </span>
    <span className="text-base font-bold tabular-nums leading-6 text-[#1B2B26]">{dp.day}</span>
  </span>
);

// "2026-11-08" → "08 Nov'26"
const payRangeLabel = (key) => {
  const d = new Date(`${key}T00:00:00`);
  if (Number.isNaN(d.getTime())) return key;
  return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleDateString("en-IN", { month: "short" }).slice(0, 3)}'${String(d.getFullYear()).slice(-2)}`;
};

// Andha naal advance pay panna bookings count (tourBookingModel). Mouse vachaa TNR list.
const AdvanceBookingsBadge = ({ count, tnrs = [] }) =>
  count > 0 ? (
    <span
      title={`Advance paid: ${tnrs.filter(Boolean).join(", ")}`}
      className="inline-flex items-center gap-1 rounded-md bg-[#E8F1FD] text-[#1E6FD9] px-2 py-0.5 text-[11px] font-semibold tabular-nums whitespace-nowrap"
    >
      {count} booking{count !== 1 ? "s" : ""} · advance paid
    </span>
  ) : null;

// Yaaru upload panna — { type, name, role } → "Pavithra · BAT" / "Tour admin" / "Admin"
const uploaderName = (u) => {
  if (!u) return "";
  if (u.type === "staff") return u.name || "Staff";
  if (u.type === "touradmin") return "Tour admin";
  if (u.type === "admin") return "Admin";
  if (u.type === "user") return u.name ? `${u.name} (Customer)` : "Customer";
  return u.name || "";
};
const uploaderSub = (u) => (u?.type === "staff" ? u.role || u.employeeId || "Staff" : "");
const uploaderSubOf = (r) => uploaderSub(r?.uploader); // staff → role / employee ID

// Works on every device: the Clipboard API needs HTTPS (or localhost), and
// some phones/in-app browsers don't have it, so fall back to a hidden
// textarea + execCommand("copy").
const copyText = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.error("Clipboard API copy failed, trying fallback:", err);
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch (err) {
    console.error("Fallback copy failed:", err);
    return false;
  }
};

const CopyTnr = ({ tnr, size = "sm" }) => {
  const [copied, setCopied] = useState(false);
  const icon = size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation();
        e.preventDefault();
        const ok = await copyText(tnr);
        if (ok) {
          setCopied(true);
          toast.success(`TNR ${tnr} copied`, { autoClose: 1200 });
          setTimeout(() => setCopied(false), 1500);
        } else {
          toast.error("Could not copy — long-press the TNR to copy it");
        }
      }}
      title="Copy TNR"
      aria-label={`Copy TNR ${tnr}`}
      className={`${size === "lg" ? "p-1.5" : "p-1"} -m-0.5 rounded-md text-[#8FA39B] hover:text-[#1B2B26] hover:bg-[#EEF2EF] active:bg-[#E4F5EA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3B5BDB] shrink-0`}
    >
      {copied ? <Check className={`${icon} text-[#2F9E44]`} /> : <Copy className={icon} />}
    </button>
  );
};

const Viewer = ({ items, index, onClose, onNav }) => {
  useEffect(() => {
    if (index === null) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onNav(index - 1);
      if (e.key === "ArrowRight" && index < items.length - 1) onNav(index + 1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // pinnaadi page scroll aaga koodaadhu
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [index, items.length, onClose, onNav]);

  if (index === null || !items[index]) return null;
  const r = items[index];
  const meta = TYPE_META[r.type] || TYPE_META.partial;
  return (
    <div
      className="fixed inset-0 z-50 bg-[#1B2B26]/80 flex items-start md:items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative my-auto w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_260px] md:max-h-[92vh] md:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#EEF2EF] min-h-0 flex items-center justify-center rounded-t-2xl md:rounded-none md:rounded-l-2xl overflow-hidden">
          <img src={toPreviewUrl(r.url)} alt="Payment screenshot" className="max-w-full max-h-[55dvh] md:max-h-[86vh] object-contain" />
        </div>
        <div className="p-4 sm:p-5 pb-6 flex flex-col gap-3 sm:gap-4 md:overflow-y-auto border-t md:border-t-0 md:border-l border-[#DCE5E0]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 text-[#1B2B26] shadow hover:bg-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div>
            <span className="text-xs font-semibold" style={{ color: meta.color }}>
              {meta.label} payment
            </span>
            <p className="text-2xl sm:text-3xl font-bold tabular-nums" style={{ color: INK }}>
              {r.amount ? `₹${formatAmount(r.amount)}` : "No amount"}
            </p>
            {r.remarks && (
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-[#4B5F57]">
                <Landmark className="w-4 h-4" /> {r.remarks}
              </p>
            )}
          </div>
          <dl className="text-sm space-y-2">
            <div>
              <dt className="text-xs text-[#8FA39B]">Uploaded</dt>
              <dd className="font-semibold text-[#1B2B26]">{formatDateTime(r.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-[#8FA39B]">Uploaded by</dt>
              <dd className="font-semibold text-[#1B2B26]">
                {r.uploader ? (
                  <>
                    {uploaderName(r.uploader)}
                    {uploaderSubOf(r) && <span className="font-normal text-[#8FA39B]"> · {uploaderSubOf(r)}</span>}
                  </>
                ) : (
                  <span className="font-normal text-[#8FA39B]">Not recorded (older upload)</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[#8FA39B]">Guest</dt>
              <dd className="font-semibold text-[#1B2B26]">{r.name || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-[#8FA39B]">TNR</dt>
              <dd className="font-semibold tracking-wide text-[#1B2B26] flex items-center gap-1">
                {r.tnr || "Not linked yet"} {r.tnr && <CopyTnr tnr={r.tnr} />}
              </dd>
            </div>
            {r.tourTitle && (
              <div>
                <dt className="text-xs text-[#8FA39B]">Tour</dt>
                <dd className="text-[#1B2B26]">{r.tourTitle}</dd>
              </div>
            )}
          </dl>
          <a
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3B5BDB] hover:underline"
          >
            <ExternalLink className="w-4 h-4" /> {isPdf(r.url) ? "Open PDF" : "Open original"}
          </a>
          <div className="mt-auto flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onNav(index - 1)}
              disabled={index === 0}
              aria-label="Previous screenshot"
              className="p-2 rounded-lg border border-[#DCE5E0] hover:bg-[#F3F6F4] disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#8FA39B] tabular-nums">
              {index + 1} of {items.length}
            </span>
            <button
              type="button"
              onClick={() => onNav(index + 1)}
              disabled={index === items.length - 1}
              aria-label="Next screenshot"
              className="p-2 rounded-lg border border-[#DCE5E0] hover:bg-[#F3F6F4] disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PDF: browser print → "Save as PDF" (desktop + phone). Extra package theva illa. ───
// Ovvoru bank um thani page (HDFC oru page, ICICI oru page …)
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const BANK_NAMES = [
  "SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "Indian Bank", "Indian Overseas Bank",
  "Canara Bank", "Bank of Baroda", "Union Bank of India", "Punjab National Bank", "Bank of India", "IDFC FIRST Bank",
  "IndusInd Bank", "Yes Bank", "Federal Bank", "Karur Vysya Bank", "City Union Bank", "Tamilnad Mercantile Bank",
  "South Indian Bank", "Equitas Small Finance Bank", "AU Small Finance Bank", "Cash",
];
const BANK_ALIAS = { sbi: "SBI", statebankofindia: "SBI", iob: "Indian Overseas Bank", pnb: "Punjab National Bank", bob: "Bank of Baroda", kvb: "Karur Vysya Bank", cub: "City Union Bank", tmb: "Tamilnad Mercantile Bank", kotak: "Kotak Mahindra Bank", idfc: "IDFC FIRST Bank", idfcfirst: "IDFC FIRST Bank", union: "Union Bank of India", unionbank: "Union Bank of India" };
const bankKey = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9]/g, "").replace(/bank|ltd|limited/g, "");
const BANK_BY_KEY = Object.fromEntries(BANK_NAMES.map((n) => [bankKey(n), n]));
// "hdfc", "HDFC bank", "Hdfc Bank Ltd" → "HDFC Bank"
const bankOf = (remarks) => {
  const k = bankKey(remarks);
  if (!k) return "";
  return BANK_BY_KEY[k] || BANK_ALIAS[k] || String(remarks).trim();
};
// Total / Advance / Balance / Partial — screen mela irukkura maadhiri
const statsOf = (list) => {
  const t = { all: 0, n: list.length, advance: 0, balance: 0, partial: 0, c: { advance: 0, balance: 0, partial: 0 } };
  list.forEach((r) => {
    const a = Number(r.amount) || 0;
    t.all += a;
    if (t[r.type] !== undefined) { t[r.type] += a; t.c[r.type] += 1; }
  });
  return t;
};
const statsHtml = (st) => `<div class="stats">
  <div class="st first"><div class="l">Total received</div><div class="v" style="color:#1F7A3D">₹${formatAmount(st.all)}</div><div class="s">${st.n} payment${st.n !== 1 ? "s" : ""}</div></div>
  ${TYPE_ORDER.map((k) => `<div class="st"><div class="l"><i style="background:${k === "partial" ? "#F4B400" : TYPE_META[k].color}"></i>${TYPE_META[k].label}<span>${st.c[k]}</span></div><div class="v">₹${formatAmount(st[k])}</div><div class="s">${st.all ? Math.round((st[k] / st.all) * 100) : 0}% of total</div></div>`).join("")}
  <div class="split">${TYPE_ORDER.map((k) => (st[k] > 0 ? `<b style="width:${(st[k] / (st.all || 1)) * 100}%;background:${k === "partial" ? "#F4B400" : TYPE_META[k].color}"></b>` : "")).join("")}</div>
</div>`;

const buildPdfHtml = ({ rows, filterText, dateText }) => {
  const NONE = "Bank not mentioned";
  const banks = new Map(); // bank → rows
  rows.forEach((r) => {
    const b = bankOf(r.remarks) || NONE;
    if (!banks.has(b)) banks.set(b, []);
    banks.get(b).push(r);
  });
  // Date wise: ovvoru bank kulla palaya date mudhalla (Oct → Nov), banks um avanga mudhal payment date padi
  const ts = (r) => new Date(r.createdAt).getTime() || 0;
  banks.forEach((list) => list.sort((x, y) => ts(x) - ts(y)));
  const order = [...banks.keys()].sort((x, y) => (x === NONE ? 1 : y === NONE ? -1 : ts(banks.get(x)[0]) - ts(banks.get(y)[0])));
  const now = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
  const PER_PAGE = 15; // oru page la max 15 records — otti otti illaama
  const thead = `<thead><tr><th class="c" style="width:4.5%">S.No</th><th style="width:10%">Date &amp; Time</th><th style="width:9%">TNR</th><th style="width:19%">Guest Name</th><th>Tour Name</th><th style="width:11.5%">Uploaded By</th><th style="width:9%">Type</th><th style="width:10.5%">Amount</th></tr></thead>`;
  const pages = order.map((bank) => {
    const list = banks.get(bank);
    const total = list.reduce((a, r) => a + (Number(r.amount) || 0), 0);
    const chunks = [];
    for (let i = 0; i < list.length; i += PER_PAGE) chunks.push(list.slice(i, i + PER_PAGE));
    return chunks.map((chunk, ci) => {
      const last = ci === chunks.length - 1;
      const trs = chunk.map((r, j) => {
        const m = TYPE_META[r.type] || TYPE_META.partial;
        return `<tr>
        <td class="c">${ci * PER_PAGE + j + 1}</td>
        <td class="dt">${esc(new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }))}<div class="sub">${esc(formatTime(r.createdAt))}</div></td>
        <td class="tnr">${esc(r.tnr || "—")}</td>
        <td>${esc(r.name || "—")}</td>
        <td>${esc(r.tourTitle || "—")}</td>
        <td>${esc(uploaderName(r.uploader) || "Not recorded")}</td>
        <td><span class="pill" style="color:${m.color};background:${m.soft}">${m.label}</span></td>
        <td class="amt">${r.amount ? `₹${formatAmount(r.amount)}` : "—"}</td>
      </tr>`;
      }).join("");
      return `<section class="page${chunk.length === PER_PAGE ? " full" : ""}">
      <div class="head">
        <div><h1>${esc(bank)}${chunks.length > 1 ? ` <small>· Page ${ci + 1} of ${chunks.length}</small>` : ""}</h1><p class="date">${esc(dateText)}</p>${filterText ? `<p class="meta">${esc(filterText)}</p>` : ""}</div>
        <div class="tot"><span>${list.length} payment${list.length !== 1 ? "s" : ""}</span><b>₹${formatAmount(total)}</b></div>
      </div>
      ${ci === 0 ? statsHtml(statsOf(list)) : ""}
      <table>
        ${thead}
        <tbody>${trs}</tbody>
        ${last ? `<tfoot><tr><td colspan="7" style="text-align:right">Total</td><td class="amt">₹${formatAmount(total)}</td></tr></tfoot>` : ""}
      </table>
      <p class="gen">GV Tour Planners · Generated ${esc(now)}</p>
    </section>`;
    }).join("");
  }).join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Payment Records - Bank wise</title>
<style>
  @page { size: A4 portrait; margin: 10mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #1B2B26; margin: 0; font-size: 11px; -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #F3F6F4; }
  .bar { position: sticky; top: 0; z-index: 2; display: flex; gap: 8px; padding: 10px 14px; background: #fff; border-bottom: 1px solid #DCE5E0; }
  .bar button { font: inherit; font-size: 13px; font-weight: 700; padding: 9px 16px; border-radius: 8px; border: 0; background: #2E9E4F; color: #fff; cursor: pointer; }
  .bar .sec { background: #fff; color: #1B2B26; border: 1px solid #DCE5E0; }
  .page { background: #fff; max-width: 900px; margin: 14px auto; padding: 18px; border-radius: 10px; }
  .head { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; border-bottom: 2px solid #1B2B26; padding-bottom: 8px; margin-bottom: 10px; }
  h1 { font-size: 22px; margin: 0; } h1 small { font-size: 12px; font-weight: 600; color: #8FA39B; }
  .meta { color: #6B7F77; font-size: 11px; margin: 2px 0 0; }
  .date { display: inline-block; margin: 5px 0 0; font-size: 12px; font-weight: 700; color: #1E6FD9; background: #E8F1FD; padding: 3px 9px; border-radius: 6px; }
  .stats { position: relative; display: grid; grid-template-columns: 1.2fr 1fr 1fr 1fr; border: 1px solid #DCE5E0; border-radius: 12px; overflow: hidden; margin-bottom: 12px; padding-bottom: 5px; }
  .st { padding: 9px 11px; border-right: 1px dashed #DCE5E0; } .st:last-of-type { border-right: 0; } .st.first { background: #F1F8F3; }
  .st .l { display: flex; align-items: center; gap: 5px; font-size: 10.5px; font-weight: 600; color: #4B5F57; } .st .l i { width: 7px; height: 7px; border-radius: 50%; display: inline-block; } .st .l span { margin-left: auto; color: #8FA39B; font-weight: 500; }
  .st .v { font-size: 16px; font-weight: 800; margin-top: 2px; } .st .s { font-size: 9.5px; color: #8FA39B; }
  .split { position: absolute; left: 0; right: 0; bottom: 0; height: 5px; display: flex; background: #EEF2EF; } .split b { display: block; height: 100%; }
  .tot { text-align: right; } .tot span { display: block; font-size: 11px; color: #4B5F57; } .tot b { font-size: 18px; color: #1F7A3D; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  th { text-align: center; font-size: 10.5px; color: #1F7A3D; background: #F2FAF4; padding: 7px 6px; border: 1px solid #CFE3D6; }
  td { padding: 7px 6px; border: 1px solid #E3EAE6; vertical-align: middle; word-break: break-word; line-height: 1.3; font-size: 10.5px; text-align: center; }
  tr { page-break-inside: avoid; }
  tbody tr:nth-child(even) td { background: #FAFCFB; }
  tfoot td { font-weight: 700; background: #F2FAF4; }
  .dt { white-space: nowrap; } .sub { font-size: 9.5px; color: #8FA39B; margin-top: 2px; }
  .c { text-align: center; } .tnr { font-weight: 600; white-space: nowrap; } .amt { white-space: nowrap; font-weight: 700; }
  .pill { font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 6px; white-space: nowrap; }
  .gen { margin: 8px 0 0; font-size: 9.5px; color: #8FA39B; text-align: right; }
  /* Phone la paakkumbodhu — table card maadhiri (PDF save pannaa A4 table thaan) */
  @media screen and (max-width: 640px) {
    .page { margin: 10px; padding: 12px; }
    .stats { grid-template-columns: 1fr 1fr; } .st { border-bottom: 1px dashed #DCE5E0; }
    thead { display: none; } table, tbody, tfoot, tr, td { display: block; width: 100%; }
    tbody tr { border: 1px solid #E3EAE6; border-radius: 8px; margin-bottom: 8px; padding: 6px 8px; }
    td { border: 0; padding: 2px 0; background: none !important; text-align: left; } .c { text-align: left; color: #8FA39B; } .c::before { content: "#"; }
    .amt { text-align: left; } tfoot td { display: inline-block; width: auto; padding: 4px 0; }
  }
  @media print {
    body { background: #fff; } .bar { display: none; }
    .page { max-width: none; margin: 0; padding: 0; border-radius: 0; page-break-after: always; break-after: page; }
    .page:last-child { page-break-after: auto; break-after: auto; }
    /* A4 page full-aa fill aaganum — 15 rows irundhaa rows stretch aagi keezha gap irukkaadhu */
    .page { height: 275mm; display: flex; flex-direction: column; }
    .page > * { flex-shrink: 0; } .page.full table { flex: 1 1 auto; }
    .gen { margin-top: auto; padding-top: 6px; }
  }
</style></head><body>
  <div class="bar"><button onclick="window.print()">Save as PDF</button><button class="sec" onclick="window.close()">Close</button></div>
  ${pages}
</body></html>`;
};

// Custom calendar — Year boxes → Month boxes → Date (browser calendar maadhiri kashtam illa)
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad2 = (n) => String(n).padStart(2, "0");
const ymd = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
const DatePick = ({ value, onChange, min, max, label, padCls = "pl-12", right = false }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("day"); // day | month | year
  const boxRef = useRef(null);
  const base = value || max || dayKey(new Date());
  const [view, setView] = useState({ y: Number(base.slice(0, 4)), m: Number(base.slice(5, 7)) - 1 });
  useEffect(() => {
    if (!open) return;
    const b = value || max || dayKey(new Date());
    setView({ y: Number(b.slice(0, 4)), m: Number(b.slice(5, 7)) - 1 });
    setMode("day"); // default dates; mela year click pannaa Year → Month → Date
    const close = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("touchstart", close); document.removeEventListener("keydown", esc); };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const today = dayKey(new Date());
  const maxK = max || today;
  const maxY = Number(maxK.slice(0, 4));
  const minY = Math.min(maxY - 2, min ? Number(min.slice(0, 4)) : maxY - 2, 2024);
  const years = [];
  for (let y = minY; y <= maxY; y++) years.push(y);
  const ymKey = (y, m) => `${y}-${pad2(m + 1)}`;
  const monthOff = (y, m) => ymKey(y, m) > maxK.slice(0, 7) || (min && ymKey(y, m) < min.slice(0, 7));
  const yearOff = (y) => y > maxY || (min && y < Number(min.slice(0, 4)));
  const first = new Date(view.y, view.m, 1).getDay();
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  const shift = (n) => setView(({ y, m }) => { const d = new Date(y, m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const nd = new Date(view.y, view.m + 1, 1), pd = new Date(view.y, view.m - 1, 1);
  const nextOk = mode === "day" ? !monthOff(nd.getFullYear(), nd.getMonth()) : mode === "month" ? !yearOff(view.y + 1) : false;
  const prevOk = mode === "day" ? !monthOff(pd.getFullYear(), pd.getMonth()) : mode === "month" ? !yearOff(view.y - 1) && view.y - 1 >= minY : false;
  const goPrev = () => (mode === "day" ? shift(-1) : setView((v) => ({ ...v, y: v.y - 1 })));
  const goNext = () => (mode === "day" ? shift(1) : setView((v) => ({ ...v, y: v.y + 1 })));
  const show = value ? (() => { const d = new Date(`${value}T00:00:00`); return `${pad2(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; })() : "";
  const vy = value ? Number(value.slice(0, 4)) : null, vm = value ? Number(value.slice(5, 7)) - 1 : null;
  const boxCls = (sel, now) =>
    `h-11 rounded-lg text-sm font-semibold transition-colors ${sel ? "bg-[#2E9E4F] text-white" : now ? "border border-[#2E9E4F] text-[#1F7A3D] hover:bg-[#F2FAF4]" : "bg-[#F7F9F8] text-[#1B2B26] hover:bg-[#E7F6EC]"} disabled:opacity-25 disabled:hover:bg-[#F7F9F8]`;
  return (
    <div ref={boxRef} className="relative min-w-0">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#8FA39B] pointer-events-none">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full h-9 pr-8 ${padCls} rounded-lg border bg-white text-left text-sm outline-none ${open ? "border-[#2E9E4F] ring-2 ring-[#2E9E4F]/15" : "border-[#DCE5E0]"} ${show ? "text-[#1B2B26]" : "text-[#8FA39B]"}`}
      >
        {show || "Select date"}
      </button>
      {value ? (
        <button type="button" onClick={() => onChange("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-[#8FA39B] hover:text-[#1B2B26]" aria-label="Clear date">
          <X size={14} />
        </button>
      ) : (
        <CalendarDays size={15} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8FA39B] pointer-events-none" />
      )}
      {open && (
        <div className={`absolute ${right ? "right-0 md:right-auto md:left-0" : "left-0"} top-full mt-1.5 z-40 w-[280px] max-w-[calc(100vw-24px)] rounded-xl border border-[#DCE5E0] bg-white p-3 shadow-xl`}>
          <div className="flex items-center gap-1 mb-2">
            <button type="button" disabled={!prevOk} onClick={goPrev} className={`p-1.5 rounded-md hover:bg-[#F2FAF4] disabled:opacity-30 ${mode === "year" ? "invisible" : ""}`} aria-label="Previous"><ChevronLeft size={16} /></button>
            <div className="flex-1 flex items-center justify-center gap-1">
              {mode === "day" && (
                <button type="button" onClick={() => setMode("month")} className="px-2 py-1 rounded-md text-sm font-bold text-[#1B2B26] hover:bg-[#F2FAF4]">{MONTHS[view.m]}</button>
              )}
              {mode !== "year" ? (
                <button type="button" onClick={() => setMode("year")} className="px-2 py-1 rounded-md text-sm font-bold text-[#1B2B26] hover:bg-[#F2FAF4]">{view.y}</button>
              ) : (
                <span className="px-2 py-1 text-sm font-bold text-[#1B2B26]">Select year</span>
              )}
            </div>
            <button type="button" disabled={!nextOk} onClick={goNext} className={`p-1.5 rounded-md hover:bg-[#F2FAF4] disabled:opacity-30 ${mode === "year" ? "invisible" : ""}`} aria-label="Next"><ChevronRight size={16} /></button>
          </div>

          {mode === "year" && (
            <div className="grid grid-cols-3 gap-2">
              {years.map((y) => (
                <button key={y} type="button" disabled={!!yearOff(y)} onClick={() => { setView((v) => { let m = v.m; if (monthOff(y, m)) m = ymKey(y, m) > maxK.slice(0, 7) ? Number(maxK.slice(5, 7)) - 1 : Number(min.slice(5, 7)) - 1; return { y, m }; }); setMode("month"); }} className={boxCls(y === vy, y === Number(today.slice(0, 4)))}>
                  {y}
                </button>
              ))}
            </div>
          )}

          {mode === "month" && (
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((mn, i) => (
                <button key={mn} type="button" disabled={!!monthOff(view.y, i)} onClick={() => { setView((v) => ({ ...v, m: i })); setMode("day"); }} className={boxCls(view.y === vy && i === vm, ymKey(view.y, i) === today.slice(0, 7))}>
                  {mn}
                </button>
              ))}
            </div>
          )}

          {mode === "day" && (
            <>
              <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-[#8FA39B] mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <span key={d} className="py-1">{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {cells.map((d, i) => {
                  if (!d) return <span key={`e${i}`} />;
                  const k = ymd(view.y, view.m, d);
                  const off = k > maxK || (min && k < min);
                  const sel = k === value;
                  return (
                    <button
                      key={k}
                      type="button"
                      disabled={!!off}
                      onClick={() => { onChange(k); setOpen(false); }}
                      className={`h-8 rounded-md text-sm tabular-nums transition-colors ${sel ? "bg-[#2E9E4F] text-white font-bold" : k === today ? "border border-[#2E9E4F] text-[#1F7A3D] font-semibold hover:bg-[#F2FAF4]" : "text-[#1B2B26] hover:bg-[#F2FAF4]"} disabled:opacity-25 disabled:hover:bg-transparent`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="flex justify-between mt-2 pt-2 border-t border-[#EEF2EF]">
            <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="text-xs font-semibold text-[#6B7F77] hover:text-[#1B2B26] px-2 py-1">Clear</button>
            <button type="button" disabled={today > maxK || (min && today < min)} onClick={() => { onChange(today); setOpen(false); }} className="text-xs font-semibold text-[#1F7A3D] hover:bg-[#F2FAF4] rounded px-2 py-1 disabled:opacity-30">Today</button>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentRecords = () => {
  const { ttoken, getPaymentRecords } = useContext(TourContext);

  const [records, setRecords] = useState([]);
  // tourBookingModel la advance.paid = true bookings (backend → advancePaid)
  const [advancePaid, setAdvancePaid] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [source, setSource] = useState("");
  const [selTours, setSelTours] = useState([]);
  const [tourQ, setTourQ] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [from, setFrom] = useState("");
  // Day box select → keezha table la andha naal mattum (IRCTC date strip maadhiri)
  const [selDay, setSelDay] = useState("");
  // Date dropdown la "Custom" select pannaa dhaan From / To theriyum
  const [customRange, setCustomRange] = useState(false);
  const [to, setTo] = useState("");
  const [viewerIndex, setViewerIndex] = useState(null);
  const [visibleCount, setVisibleCount] = useState(50);
  // "asc" = oldest date first (default), "desc" = newest first.
  const [sortDir, setSortDir] = useState("asc");
  const dropRef = useRef(null);

  const fetchRecords = useCallback(async () => {
    if (!ttoken) return;
    setLoading(true);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const data = await getPaymentRecords(params);
      if (data?.success) {
        setRecords(data.records || []);
        setAdvancePaid(data.advancePaid || []);
      } else {
        toast.error(data?.message || "Could not load payment records");
      }
    } catch (err) {
      console.error("getPaymentRecords error:", err);
      toast.error(err.response?.data?.message || err.message || "Could not load payment records");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ttoken, from, to]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    setVisibleCount(50);
  }, [search, type, source, selTours, from, to, sortDir]);

  // ── Tour search (same behaviour as the Sales Dashboard) ──────────────
  const tourOptions = useMemo(
    () => [...new Set(records.map((r) => r.tourTitle).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [records],
  );
  // Tour picker — a checkbox list of every tour that has payments; typing
  // narrows the list. The list stays open while ticking several tours.
  const tourMatches = useMemo(() => {
    const q = tourQ.trim().toLowerCase();
    if (!q) return tourOptions;
    return tourOptions.filter((t) => t.toLowerCase().includes(q));
  }, [tourOptions, tourQ]);
  useEffect(() => {
    const h = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const toggleTour = (t) =>
    setSelTours((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
  const allMatchesSelected = tourMatches.length > 0 && tourMatches.every((t) => selTours.includes(t));
  const toggleAllTours = () =>
    setSelTours((p) =>
      allMatchesSelected
        ? p.filter((t) => !tourMatches.includes(t))
        : [...p, ...tourMatches.filter((t) => !p.includes(t))],
    );
  const removeTour = (t) => setSelTours((p) => p.filter((x) => x !== t));

  // Everything except the type filter — the split bar is built from this,
  // so its segments still show all three types while one is selected.
  const baseFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      if (source && r.bookingSource !== source) return false;
      if (selTours.length && !selTours.includes(r.tourTitle)) return false;
      if (!q) return true;
      return [r.tnr, r.name, r.remarks, r.tourTitle, uploaderName(r.uploader), r.amount != null ? String(r.amount) : ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [records, search, source, selTours]);

  const filtered = useMemo(() => {
    let list = type ? baseFiltered.filter((r) => r.type === type) : baseFiltered;
    if (selDay) list = list.filter((r) => dayKey(r.createdAt) === selDay);
    return [...list].sort((a, b) =>
      sortDir === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [baseFiltered, type, sortDir, selDay]);

  const split = useMemo(() => {
    const t = { advance: 0, balance: 0, partial: 0, count: { advance: 0, balance: 0, partial: 0 } };
    baseFiltered.forEach((r) => {
      if (t[r.type] === undefined) return;
      t[r.type] += Number(r.amount) || 0;
      t.count[r.type] += 1;
    });
    t.all = t.advance + t.balance + t.partial;
    return t;
  }, [baseFiltered]);

  const shownTotal = type ? split[type] : split.all;

  // Advance paid bookings — tourBookingModel la payment.advance.paid = true.
  // Naal = advance paidAt. Search / Tour / Admin-User filter ku yetha maadhiri.
  const advanceBookings = useMemo(() => {
    const q = search.trim().toLowerCase();
    const byDay = new Map(); // dayKey → [tnr...]
    let total = 0;
    advancePaid.forEach((b) => {
      if (source && b.bookingSource !== source) return;
      if (selTours.length && !selTours.includes(b.tourTitle)) return;
      if (q && ![b.tnr, b.name, b.tourTitle].join(" ").toLowerCase().includes(q)) return;
      const k = dayKey(b.bookedAt || b.paidAt); // tour booking date (advance.paid === true)
      if (!byDay.has(k)) byDay.set(k, []);
      byDay.get(k).push(b);
      total += 1;
    });
    return { byDay, total };
  }, [advancePaid, search, source, selTours]);
  const advanceCountOn = (k) => advanceBookings.byDay.get(k)?.length || 0;

  // ── Advance paid bookings (tour bookings, advance.paid === true) ──
  // Filter illana: inniku mattum. From / To pottaa: andha naatkal mattum —
  // bookings = andha naatkal la motham, average = motham ÷ naatkal.
  const todayKey = dayKey(new Date());
  const advanceTnrsOn = (k) => (advanceBookings.byDay.get(k) || []).map((b) => b.tnr);
  const advanceListOn = (k) => advanceBookings.byDay.get(k) || [];
  const perDay = useMemo(() => {
    let start = from || to || todayKey;
    let end = to || (from ? todayKey : todayKey);
    if (!from && to) start = to; // To mattum → andha oru naal
    if (end > todayKey && start <= todayKey) end = todayKey;
    if (start > end) [start, end] = [end, start];
    let total = 0;
    advanceBookings.byDay.forEach((items, k) => {
      if (k >= start && k <= end) total += items.length;
    });
    const toUTC = (k) => { const [y, m, d] = k.split("-").map(Number); return Date.UTC(y, m - 1, d); };
    const days = Math.round((toUTC(end) - toUTC(start)) / 86400000) + 1;

    // Days with bookings / Busiest day / day boxes:
    // filter illana mudhal advance booking naal → inniku varai; filter pottaa andha naatkal.
    let aStart = start;
    let aEnd = end;
    if (!from && !to) {
      const first = [...advanceBookings.byDay.keys()].sort()[0];
      if (first && first < aStart) aStart = first;
    }
    let activeDays = 0;
    let best = null;
    advanceBookings.byDay.forEach((items, k) => {
      if (k < aStart || k > aEnd) return;
      activeDays += 1;
      if (!best || items.length > best.n) best = { k, n: items.length };
    });

    // Keezha day boxes — Payment Records filter padi: filter illana inniku mattum,
    // From / To pottaa andha naatkal la booking aana naatkal.
    const list = []; // [dayKey, bookings]
    advanceBookings.byDay.forEach((items, k) => {
      if (k >= start && k <= end) list.push([k, items]);
    });
    if (!from && !to && !list.length) list.push([todayKey, []]); // inniku 0 bookings na kooda box
    const allDays = Math.round((toUTC(aEnd) - toUTC(aStart)) / 86400000) + 1;
    list.sort((a, b) => (sortDir === "asc" ? a[0].localeCompare(b[0]) : b[0].localeCompare(a[0])));
    return { total, days, avg: days ? total / days : 0, start, end, activeDays, allDays, aStart, best, list };
  }, [advanceBookings, from, to, todayKey, sortDir]);

  // Day box click → andha naal details keezha. Matha boxes maraiyaadhu.
  useEffect(() => { setSelDay(""); }, [from, to]);
  const fmtAvg = (n) => String(Math.round(n)); // round off — 4.3 → 4, 4.5 → 5

  const visible = filtered.slice(0, visibleCount);

  const days = useMemo(() => {
    const out = [];
    const byKey = new Map();
    visible.forEach((r, i) => {
      const k = dayKey(r.createdAt);
      if (!byKey.has(k)) {
        const g = { key: k, rows: [], total: 0 };
        byKey.set(k, g);
        out.push(g);
      }
      const g = byKey.get(k);
      g.rows.push({ r, index: i });
      g.total += Number(r.amount) || 0;
    });
    return out;
  }, [visible]);

  const hasFilters = search || type || source || selTours.length || from || to || selDay;
  const clearFilters = () => {
    setSelDay("");
    setCustomRange(false);
    setSearch("");
    setType("");
    setSource("");
    setSelTours([]);
    setTourQ("");
    setFrom("");
    setTo("");
  };

  // PDF — ippo podra filters padi ELLAA rows um (Show more pannaadhadhu kooda)
  const downloadPdf = () => {
    if (!filtered.length) { toast.info("No payments to export for these filters"); return; }
    const parts = [];
    if (selDay) parts.push(payRangeLabel(selDay));
    else if (from && to && from === to) parts.push(payRangeLabel(from));
    else if (from || to) parts.push(`${from ? payRangeLabel(from) : "Start"} – ${to ? payRangeLabel(to) : "Today"}`);
    else {
      // All dates → mudhal payment la irundhu kadaisi payment varai
      const ks = filtered.map((r) => dayKey(r.createdAt)).sort();
      parts.push(ks.length ? (ks[0] === ks[ks.length - 1] ? payRangeLabel(ks[0]) : `${payRangeLabel(ks[0])} – ${payRangeLabel(ks[ks.length - 1])} (all dates)`) : "All dates");
    }
    if (type) parts.push(TYPE_META[type].label);
    if (source) parts.push(source === "user" ? "User bookings" : "Admin bookings");
    if (selTours.length) parts.push(selTours.length === 1 ? selTours[0] : `${selTours.length} tours`);
    if (search.trim()) parts.push(`Search: ${search.trim()}`);
    const dateText = parts.shift(); // date mela thani-aa (blue)
    const html = buildPdfHtml({ rows: filtered, filterText: parts.join(" · "), dateText: `Date: ${dateText}` });
    const w = window.open("", "_blank");
    if (!w) { toast.error("Allow pop-ups for this site to download the PDF"); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { try { w.print(); } catch { /* user can tap Save as PDF */ } }, 500);
  };

  const fieldCls =
    "w-full h-9 px-3 rounded-lg border border-[#DCE5E0] bg-white text-sm text-[#1B2B26] placeholder:text-[#8FA39B] outline-none focus:border-[#2E9E4F] focus:ring-2 focus:ring-[#2E9E4F]/15";

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#EEF5F0] pt-16 pb-4 sm:pb-5 lg:pt-5 px-3 sm:px-6 text-[#1B2B26] text-sm">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Payment Records</h1>
            <p className="text-xs text-[#6B7F77]">Advance, balance and partial payment screenshots, {sortDir === "asc" ? "oldest" : "newest"} first</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto [&>button]:flex-1 sm:[&>button]:flex-none [&>button]:justify-center">
            <button
              type="button"
              onClick={downloadPdf}
              disabled={loading || !filtered.length}
              title="Download the current list as PDF"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[#C7D2FE] bg-[#EEF2FF] text-sm font-semibold text-[#4338CA] hover:bg-[#E0E7FF] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4338CA]"
            >
              <FileDown className="w-4 h-4" /> PDF
            </button>
            <button
              type="button"
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              title="Change date order"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[#DCE5E0] bg-white text-sm font-semibold text-[#1B2B26] hover:bg-[#F7F9F8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2E9E4F]"
            >
              <ArrowUpDown className="w-4 h-4 text-[#2E9E4F]" />
              {sortDir === "asc" ? "Oldest first" : "Newest first"}
            </button>
            <button
              type="button"
              onClick={fetchRecords}
              disabled={loading}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#2E9E4F] hover:bg-[#268A44] text-white text-sm font-semibold disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E6FD9]"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>

        {/* Summary receipt — total + three type cells split by perforated
            dividers; the coloured strip along the bottom shows the split.
            Clicking a type cell filters the statement to that type. */}
        <section className="bg-white rounded-2xl border border-[#DCE5E0] overflow-hidden mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
            <div className="col-span-2 sm:col-span-3 xl:col-span-1 px-4 py-3.5 bg-[#F1F8F3] border-b xl:border-b-0 xl:border-r border-dashed border-[#CFE3D6]">
              <p className="text-xs text-[#4B5F57]">
                {type ? `${TYPE_META[type].label} received` : "Total received"}
              </p>
              <p className="text-xl sm:text-2xl font-bold tabular-nums tracking-tight text-[#1F7A3D] break-all">₹{formatAmount(shownTotal)}</p>
              <p className="text-[11px] text-[#8FA39B]">
                {filtered.length} screenshot{filtered.length !== 1 ? "s" : ""}
                {type && (
                  <button type="button" onClick={() => setType("")} className="ml-2 font-semibold text-[#1E6FD9] hover:underline">
                    Show all
                  </button>
                )}
              </p>
            </div>
            {TYPE_ORDER.map((k, i) => {
              const m = TYPE_META[k];
              const active = type === k;
              const bar = k === "partial" ? "#F4B400" : m.color;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setType(active ? "" : k)}
                  aria-pressed={active}
                  className={`relative min-w-0 text-left px-3 sm:px-4 py-3 sm:py-3.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1E6FD9] ${i < 2 ? "border-r border-dashed border-[#DCE5E0]" : "xl:border-r-0"
                    } ${i === 2 ? "col-span-2 sm:col-span-1 border-t sm:border-t-0 border-dashed border-[#DCE5E0]" : ""} ${active ? "" : "hover:bg-[#FAFCFB]"
                    } ${type && !active ? "opacity-50" : ""}`}
                  style={active ? { background: m.soft } : undefined}
                >
                  <span className="absolute left-0 top-0 h-full w-[3px]" style={{ background: active ? bar : "transparent" }} />
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[#4B5F57]">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: bar }} />
                    {m.label}
                    <span className="ml-auto text-[11px] font-medium text-[#8FA39B] tabular-nums">{split.count[k]}</span>
                  </span>
                  <span className="block text-base sm:text-lg font-bold tabular-nums mt-0.5 truncate">₹{formatAmount(split[k])}</span>
                  <span className="block text-[11px] text-[#8FA39B] tabular-nums">
                    {split.all ? Math.round((split[k] / split.all) * 100) : 0}% of total
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex h-1.5 w-full bg-[#EEF2EF]" aria-hidden="true">
            {TYPE_ORDER.map((k) =>
              split[k] > 0 ? (
                <div
                  key={k}
                  style={{
                    width: `${(split[k] / (split.all || 1)) * 100}%`,
                    background: k === "partial" ? "#F4B400" : TYPE_META[k].color,
                    opacity: type && type !== k ? 0.25 : 1,
                  }}
                  className="h-full transition-opacity"
                />
              ) : null,
            )}
          </div>
        </section>

        {/* Advance paid bookings (tour bookings, advance.paid === true) — inniku, illana filter potta naatkal */}
        <section className="bg-white rounded-2xl border border-[#DCE5E0] p-3 mb-4">
          <p className="text-xs font-semibold text-[#1E6FD9]">Advance paid bookings</p>
          <p className="text-[11px] text-[#8FA39B] mb-2">
            {perDay.start === perDay.end
              ? `${perDay.start === todayKey ? "Today · " : ""}${payRangeLabel(perDay.start)}`
              : `${payRangeLabel(perDay.start)} – ${payRangeLabel(perDay.end)} · ${perDay.days} days`}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-[#E8F1FD] px-3 py-2">
              <p className="text-[11px] text-[#4B5F57]">Bookings (advance paid)</p>
              <p className="text-xl font-bold tabular-nums text-[#1E6FD9] leading-tight">{perDay.total}</p>
            </div>
            <div className="rounded-lg bg-[#E7F6EC] px-3 py-2">
              <p className="text-[11px] text-[#4B5F57]">Average per day</p>
              <p className="text-xl font-bold tabular-nums text-[#0F7A5A] leading-tight">{fmtAvg(perDay.avg)}</p>
              {perDay.days > 1 && (
                <p className="text-[10.5px] text-[#8FA39B] tabular-nums">{perDay.total} ÷ {perDay.days} days</p>
              )}
            </div>
          </div>

          {/* Days with bookings + Busiest day */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-[#DCE5E0] bg-[#F7F9F8] px-3 py-2">
              <p className="text-[11px] text-[#6B7F77]">Days with bookings</p>
              <p className="text-base font-bold tabular-nums text-[#1B2B26] leading-tight">
                {perDay.activeDays} / {perDay.allDays}
              </p>
              <p className="text-[10.5px] text-[#8FA39B]">
                {!from && !to && perDay.activeDays ? `Since ${payRangeLabel(perDay.aStart)}` : perDay.activeDays ? "" : "No bookings"}
              </p>
            </div>
            {perDay.best ? (
              <button
                type="button"
                onClick={() => setSelDay((d) => (d === perDay.best.k ? "" : perDay.best.k))}
                title="Show this day's bookings"
                className={`text-left rounded-lg border px-3 py-2 hover:bg-[#EEF3F0] ${selDay === perDay.best.k ? "border-[#1E6FD9] bg-[#E8F1FD]" : "border-[#DCE5E0] bg-[#F7F9F8]"}`}
              >
                <p className="text-[11px] text-[#6B7F77]">Busiest day</p>
                <p className="text-base font-bold tabular-nums text-[#1B2B26] leading-tight">
                  {perDay.best.n} booking{perDay.best.n !== 1 ? "s" : ""}
                </p>
                <p className="text-[10.5px] text-[#8FA39B]">{payRangeLabel(perDay.best.k)}</p>
              </button>
            ) : (
              <div className="rounded-lg border border-[#DCE5E0] bg-[#F7F9F8] px-3 py-2">
                <p className="text-[11px] text-[#6B7F77]">Busiest day</p>
                <p className="text-base font-bold text-[#8FA39B] leading-tight">—</p>
              </div>
            )}
          </div>

          {/* Day boxes — click pannaa andha naal details keezha; matha boxes apdiye irukkum */}
          {perDay.list.length > 0 && (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {perDay.list.map(([k, items]) => {
                const dp = dayParts(k);
                const active = selDay === k;
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelDay(active ? "" : k)}
                    className={`shrink-0 text-left rounded-lg border px-3 py-1.5 ${active ? "border-[#1E6FD9] bg-[#E8F1FD]" : "border-[#DCE5E0] hover:bg-[#F7F9F8]"}`}
                  >
                    <span className="block text-[11px] text-[#6B7F77] whitespace-nowrap">
                      {String(dp.day).padStart(2, "0")} {dp.month} {String(dp.year).slice(2)} · {dp.rel}
                    </span>
                    <span className="block text-sm font-bold tabular-nums text-[#1E6FD9]">
                      {items.length} booking{items.length !== 1 ? "s" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {selDay && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
              <span className="rounded-full bg-[#E8F1FD] text-[#1E6FD9] font-semibold px-2.5 py-1">
                Showing {payRangeLabel(selDay)} only
              </span>
              <button type="button" onClick={() => setSelDay("")} className="font-semibold text-[#4B5F57] underline hover:text-[#1B2B26]">
                Show all days
              </button>
            </div>
          )}
        </section>

        {/* Filters — one compact toolbar */}
        <section className="bg-white rounded-2xl border border-[#DCE5E0] p-3 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="col-span-2 md:col-span-1 relative min-w-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA39B] pointer-events-none" />
              <input
                aria-label="Search guest, TNR, bank or amount"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Guest, TNR, bank or amount"
                className={`${fieldCls} pl-9 pr-8`}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-[#8FA39B] hover:text-[#1B2B26]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="col-span-2 md:col-span-1 relative min-w-0" ref={dropRef}>
              <button
                type="button"
                onClick={() => setShowDrop((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={showDrop}
                className={`${fieldCls} flex items-center gap-2 text-left`}
              >
                <Search className="w-4 h-4 shrink-0 text-[#8FA39B]" />
                <span className={`flex-1 truncate ${selTours.length ? "text-[#1B2B26] font-medium" : "text-[#8FA39B]"}`}>
                  {selTours.length === 0
                    ? "All tours"
                    : selTours.length === 1
                      ? selTours[0]
                      : `${selTours.length} tours selected`}
                </span>
                <ChevronRight className={`w-4 h-4 shrink-0 text-[#8FA39B] transition-transform ${showDrop ? "-rotate-90" : "rotate-90"}`} />
              </button>
              {showDrop && (
                <div className="absolute left-0 right-0 md:right-auto md:w-[360px] top-[calc(100%+4px)] z-30 bg-white border border-[#DCE5E0] rounded-xl shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-[#EEF2EF]">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8FA39B] pointer-events-none" />
                      <input
                        autoFocus
                        aria-label="Search tour"
                        type="text"
                        value={tourQ}
                        onChange={(e) => setTourQ(e.target.value)}
                        placeholder="Search tour"
                        className="w-full h-8 pl-8 pr-2 rounded-md border border-[#DCE5E0] text-sm outline-none focus:border-[#2E9E4F]"
                      />
                    </div>
                  </div>
                  {tourMatches.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-[#8FA39B] text-center">No tours match "{tourQ}"</p>
                  ) : (
                    <ul role="listbox" aria-multiselectable="true" className="max-h-64 overflow-y-auto py-1">
                      <li>
                        <label className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#1F7A3D] cursor-pointer hover:bg-[#F1F8F3] border-b border-[#EEF2EF]">
                          <input
                            type="checkbox"
                            checked={allMatchesSelected}
                            onChange={toggleAllTours}
                            className="w-4 h-4 accent-[#2E9E4F]"
                          />
                          {tourQ ? `Select all matching (${tourMatches.length})` : `Select all tours (${tourMatches.length})`}
                        </label>
                      </li>
                      {tourMatches.map((t) => {
                        const checked = selTours.includes(t);
                        const count = records.filter((r) => r.tourTitle === t).length;
                        return (
                          <li key={t}>
                            <label
                              className={`flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-[#F7F9F8] ${checked ? "bg-[#F1F8F3]" : ""
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleTour(t)}
                                className="w-4 h-4 shrink-0 accent-[#2E9E4F]"
                              />
                              <span className={`flex-1 min-w-0 truncate ${checked ? "font-semibold text-[#1F7A3D]" : ""}`}>{t}</span>
                              <span className="text-[11px] text-[#8FA39B] tabular-nums shrink-0">{count}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-[#EEF2EF] bg-[#FAFCFB]">
                    <button
                      type="button"
                      onClick={() => setSelTours([])}
                      disabled={!selTours.length}
                      className="text-xs font-semibold text-[#6B7F77] hover:text-[#1B2B26] disabled:opacity-40"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDrop(false);
                        setTourQ("");
                      }}
                      className="h-7 px-3 rounded-md bg-[#2E9E4F] text-white text-xs font-semibold hover:bg-[#268A44]"
                    >
                      Done{selTours.length ? ` (${selTours.length})` : ""}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <select
              aria-label="Date"
              value={(() => {
                if (customRange) return "custom";
                const hit = QUICK_DAYS.find(({ offset }) => {
                  const k = dayOffsetKey(offset);
                  return from === k && to === k;
                });
                if (hit) return String(hit.offset);
                return from || to ? "custom" : "";
              })()}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "custom") {
                  setCustomRange(true);
                  return;
                }
                setCustomRange(false);
                if (v === "") {
                  setFrom("");
                  setTo("");
                } else {
                  const k = dayOffsetKey(Number(v));
                  setFrom(k);
                  setTo(k);
                }
              }}
              className={`${fieldCls} col-span-2 md:col-span-1 pr-8 cursor-pointer`}
            >
              <option value="">All dates</option>
              {QUICK_DAYS.map(({ offset, label }) => (
                <option key={offset} value={String(offset)}>
                  {label}
                </option>
              ))}
              <option value="custom">Custom</option>
            </select>
            {(customRange || ((from || to) && !QUICK_DAYS.some(({ offset }) => { const k = dayOffsetKey(offset); return from === k && to === k; }))) && (
              <>
              <DatePick label="From" value={from} max={to || todayKey} onChange={(v) => setFrom(v > todayKey ? todayKey : v)} padCls="pl-12" />
              <DatePick label="To" value={to} min={from || undefined} max={todayKey} onChange={(v) => setTo(v > todayKey ? todayKey : v)} padCls="pl-9" right />
              </>
            )}
            <div className="col-span-2 md:col-span-1 flex h-9 rounded-lg border border-[#DCE5E0] p-0.5 bg-[#F7F9F8]" role="group" aria-label="Booking type">
              {[
                { v: "", l: "All" },
                { v: "admin", l: "Admin" },
                { v: "user", l: "User" },
              ].map((o) => (
                <button
                  key={o.v || "all"}
                  type="button"
                  onClick={() => setSource(o.v)}
                  aria-pressed={source === o.v}
                  className={`flex-1 px-3 rounded-md text-xs font-semibold ${source === o.v ? "bg-white text-[#1F7A3D] shadow-sm" : "text-[#6B7F77] hover:text-[#1B2B26]"
                    }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          {(selTours.length > 0 || hasFilters) && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              {selTours.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 max-w-full h-7 pl-2.5 pr-1.5 rounded-md bg-[#F1F8F3] border border-[#CFE3D6] text-[#1F7A3D] text-xs font-semibold"
                >
                  <span className="truncate">{t}</span>
                  <button type="button" onClick={() => removeTour(t)} aria-label={`Remove ${t}`} className="shrink-0 hover:text-[#1B2B26]">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {hasFilters && (
                <button type="button" onClick={clearFilters} className="ml-auto text-xs font-semibold text-[#6B7F77] hover:text-[#1B2B26] hover:underline">
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </section>

        {/* Statement */}
        <section className="bg-white rounded-2xl border border-[#DCE5E0] overflow-hidden">
          {loading && records.length === 0 ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-9 h-9 animate-spin text-[#3B5BDB]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <FileImage className="w-10 h-10 mx-auto mb-3 text-[#B9C9C1]" />
              <p className="font-semibold">No payment screenshots match</p>
              <p className="text-sm text-[#4B5F57] mt-1">
                {hasFilters ? "Change or clear the filters to see more." : "Payment screenshots will show here once they are uploaded."}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden xl:block overflow-x-auto">
                {/* table-fixed — screen agalathukku ulla adangum, side la cut aagaadhu */}
                <table className="w-full table-fixed text-sm border-collapse">
                  <thead>
                    <tr className="text-xs text-[#1F7A3D] bg-[#F2FAF4] border-b border-[#CFE3D6]">
                      <th className="pl-4 pr-2 py-3 text-left font-semibold w-[5.5rem]">Time</th>
                      <th className="px-2 py-3 text-left font-semibold w-16">Proof</th>
                      <th className="px-2 py-3 text-left font-semibold w-[24%]">Guest and TNR</th>
                      <th className="px-2 py-3 text-left font-semibold w-[9%]">Bank</th>
                      <th className="px-2 py-3 text-left font-semibold">Tour</th>
                      <th className="px-2 py-3 text-left font-semibold w-[15%]">Uploaded by</th>
                      <th className="pl-2 pr-4 py-3 text-right font-semibold w-28">Amount</th>
                    </tr>
                  </thead>
                  {days.map((g) => {
                    const dp = dayParts(g.key);
                    return (
                      <tbody key={g.key}>
                        <tr className="border-y border-[#DCE5E0] bg-[#FAFCFB]">
                          <td colSpan={6} className="pl-4 pr-2 py-3">
                            <div className="flex items-center gap-3">
                              <DateStamp dp={dp} />
                              <div>
                                <p className="font-semibold leading-tight">{dp.rel}</p>
                                <p className="text-xs text-[#8FA39B]">{g.rows.length} payment{g.rows.length !== 1 ? "s" : ""} received</p>
                              </div>
                              <AdvanceBookingsBadge count={advanceCountOn(g.key)} tnrs={advanceTnrsOn(g.key)} />
                            </div>
                          </td>
                          <td className="pl-2 pr-4 py-3 text-right">
                            <span className="inline-block rounded-lg bg-[#E4F5EA] text-[#1F7A3D] px-3 py-1 font-bold tabular-nums">
                              ₹{formatAmount(g.total)}
                            </span>
                          </td>
                        </tr>
                        {g.rows.map(({ r, index }) => {
                          const m = TYPE_META[r.type] || TYPE_META.partial;
                          return (
                            <tr key={r._id} className="border-b border-[#EEF2EF] last:border-0 hover:bg-[#F7F9F8]">
                              <td className="pl-4 pr-2 py-2.5 align-middle whitespace-nowrap tabular-nums text-[#4B5F57]">
                                <span className="relative pl-3">
                                  <span className="absolute left-0 top-0.5 bottom-0.5 w-1 rounded-full" style={{ background: m.color }} />
                                  {formatTime(r.createdAt)}
                                </span>
                              </td>
                              <td className="px-2 py-3">
                                <button
                                  type="button"
                                  onClick={() => setViewerIndex(index)}
                                  aria-label="View screenshot"
                                  className="relative block w-10 h-10 rounded-md overflow-hidden border border-[#DCE5E0] bg-[#EEF2EF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3B5BDB] hover:border-[#3B5BDB]"
                                >
                                  <img src={toPreviewUrl(r.url)} alt="" loading="lazy" className="w-full h-full object-cover" />
                                  {isPdf(r.url) && (
                                    <span className="absolute inset-x-0 bottom-0 text-[9px] font-bold text-center bg-[#1B2B26]/70 text-white">
                                      PDF
                                    </span>
                                  )}
                                </button>
                              </td>
                              <td className="px-2 py-3 min-w-0">
                                <p className="font-semibold truncate" title={r.name}>{r.name || "Unnamed guest"}</p>
                                {r.tnr ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-[#3B5BDB]">
                                    <span className="select-all">{r.tnr}</span> <CopyTnr tnr={r.tnr} />
                                  </span>
                                ) : (
                                  <span className="text-xs text-[#8FA39B]">TNR not linked yet</span>
                                )}
                              </td>
                              <td className="px-2 py-3 text-[#4B5F57]">
                                <span className="block truncate" title={r.remarks}>{r.remarks || <span className="text-[#B9C9C1]">—</span>}</span>
                              </td>
                              <td className="px-2 py-3 text-[#4B5F57]">
                                <span className="block truncate" title={r.tourTitle}>{r.tourTitle || <span className="text-[#B9C9C1]">—</span>}</span>
                                <span
                                  className={`mt-1 inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md ${r.bookingSource === "user" ? "bg-[#EBFBEE] text-[#2B8A3E]" : "bg-[#EDF2FF] text-[#364FC7]"
                                    }`}
                                >
                                  {r.bookingSource === "user" ? "User" : "Admin"}
                                </span>
                              </td>
                              <td className="px-2 py-3 min-w-0">
                                {r.uploader ? (
                                  <>
                                    <span className="block font-semibold truncate text-[#1B2B26]">{uploaderName(r.uploader)}</span>
                                    {uploaderSubOf(r) && (
                                      <span className="block text-[11px] text-[#8FA39B] truncate">{uploaderSubOf(r)}</span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-[11px] text-[#B9C9C1]">Not recorded</span>
                                )}
                              </td>
                              <td className="pl-2 pr-4 py-3 text-right whitespace-nowrap">
                                <span className="block font-bold tabular-nums text-sm">
                                  {r.amount ? `₹${formatAmount(r.amount)}` : <span className="text-[#B9C9C1] font-normal">—</span>}
                                </span>
                                <span className="text-xs font-semibold" style={{ color: m.color }}>
                                  {m.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    );
                  })}
                </table>
              </div>

              {/* Mobile: same statement as a compact list */}
              <div className="xl:hidden">
                {days.map((g) => {
                  const dp = dayParts(g.key);
                  return (
                    <div key={g.key}>
                      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-[#FAFCFB] border-y border-[#DCE5E0]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <DateStamp dp={dp} />
                          <div className="min-w-0">
                            <p className="font-semibold text-sm leading-tight truncate">{dp.rel}</p>
                            <p className="text-xs text-[#8FA39B]">{g.rows.length} received</p>
                            <div className="mt-1">
                              <AdvanceBookingsBadge count={advanceCountOn(g.key)} tnrs={advanceTnrsOn(g.key)} />
                            </div>
                          </div>
                        </div>
                        <span className="rounded-lg bg-[#E4F5EA] text-[#1F7A3D] px-2.5 py-1 font-bold tabular-nums text-sm shrink-0">
                          ₹{formatAmount(g.total)}
                        </span>
                      </div>
                      {g.rows.map(({ r, index }) => {
                        const m = TYPE_META[r.type] || TYPE_META.partial;
                        return (
                          <div
                            key={r._id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setViewerIndex(index)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setViewerIndex(index);
                              }
                            }}
                            className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 border-b border-[#EEF2EF] text-left cursor-pointer active:bg-[#F7F9F8] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#2E9E4F]"
                            style={{ boxShadow: `inset 3px 0 0 ${m.color}` }}
                          >
                            <span className="relative w-12 h-12 shrink-0 rounded-md overflow-hidden border border-[#DCE5E0] bg-[#EEF2EF]">
                              <img src={toPreviewUrl(r.url)} alt="" loading="lazy" className="w-full h-full object-cover" />
                              {isPdf(r.url) && (
                                <span className="absolute inset-x-0 bottom-0 text-[9px] font-bold text-center bg-[#1B2B26]/70 text-white">PDF</span>
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-semibold text-sm truncate">{r.name || "Unnamed guest"}</span>
                              <span className="flex items-center gap-1 min-w-0 text-xs">
                                {r.tnr ? (
                                  <>
                                    <span className="font-semibold tracking-wide text-[#3B5BDB] select-all">{r.tnr}</span>
                                    <CopyTnr tnr={r.tnr} size="lg" />
                                  </>
                                ) : (
                                  <span className="text-[#8FA39B]">No TNR</span>
                                )}
                                {r.remarks && <span className="text-[#4B5F57] truncate">· {r.remarks}</span>}
                              </span>
                              <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#8FA39B]">
                                <span className="tabular-nums">{formatTime(r.createdAt)}</span>
                                {r.tourTitle && <span className="hidden sm:inline truncate max-w-[260px]">· {r.tourTitle}</span>}
                                <span
                                  className={`text-[10px] font-semibold px-1.5 py-px rounded ${r.bookingSource === "user" ? "bg-[#EBFBEE] text-[#2B8A3E]" : "bg-[#EDF2FF] text-[#364FC7]"
                                    }`}
                                >
                                  {r.bookingSource === "user" ? "User" : "Admin"}
                                </span>
                                {r.uploader && (
                                  <span className="truncate max-w-[160px]">· by {uploaderName(r.uploader)}</span>
                                )}
                              </span>
                            </span>
                            <span className="text-right shrink-0">
                              <span className="block font-bold tabular-nums">
                                {r.amount ? `₹${formatAmount(r.amount)}` : "—"}
                              </span>
                              <span className="text-xs font-semibold" style={{ color: m.color }}>{m.label}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {filtered.length > visibleCount && (
          <div className="text-center pt-5">
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + 50)}
              className="h-10 px-6 rounded-lg border border-[#DCE5E0] bg-white text-sm font-semibold hover:bg-[#F7F9F8]"
            >
              Show {Math.min(50, filtered.length - visibleCount)} more of {filtered.length - visibleCount}
            </button>
          </div>
        )}
      </div>

      <Viewer items={visible} index={viewerIndex} onClose={() => setViewerIndex(null)} onNav={setViewerIndex} />
    </div>
  );
};

export default PaymentRecords;
