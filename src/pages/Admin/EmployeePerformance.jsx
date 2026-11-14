// // ════════════════════════════════════════════════════════════════
// //  EmployeePerformance.jsx — Admin panel (CEO tab) — SIMPLE scorecard
// //  Mela oru employee select → avangaludhu mattum:
// //    Tickets  : Raise / View Tickets page la varra adhe status cards + tabs
// //    Bookings : Tour Bookings maadhiri status + amount cards
// //    FIT      : FIT Enquiries page la varra stage cards (FitPerformance.jsx la)
// //  Card click pannaa keezha list andha status ku filter aagum.
// //  API: GET /api/touradmin/<api>?tab=&employee=&from=&to=
// // ════════════════════════════════════════════════════════════════
// import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
// import axios from "axios";
// import { ColumnFilter } from "../../components/TicketFilters"; // ticket page la irukkura header funnel filter
// import { toast } from "react-toastify";
// import { TourAdminContext } from "../../context/TourAdminContext"; // ⚙️ path check pannunga

// // ─── Dates ───
// const pad = (n) => String(n).padStart(2, "0");
// const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// const PRESETS = [
//   { key: "all", label: "All time", range: () => ["", ""] },
//   { key: "month", label: "This month", range: () => { const t = new Date(); return [ymd(new Date(t.getFullYear(), t.getMonth(), 1)), ymd(t)]; } },
//   { key: "last", label: "Last month", range: () => { const t = new Date(); return [ymd(new Date(t.getFullYear(), t.getMonth() - 1, 1)), ymd(new Date(t.getFullYear(), t.getMonth(), 0))]; } },
//   { key: "year", label: "This year", range: () => { const t = new Date(); return [ymd(new Date(t.getFullYear(), 0, 1)), ymd(t)]; } },
// ];
// const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");
// const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

// // ─── Status cards (ticket page / FIT page la irukkura adhe colours) ───
// const TICKET_CARDS = [
//   { key: "", label: "Total", cls: "border-slate-300 text-slate-900" },
//   { key: "open", label: "Open", cls: "border-sky-300 text-sky-800" },
//   { key: "pickup", label: "Picked up", cls: "border-violet-300 text-violet-800" },
//   { key: "processing", label: "Processing", cls: "border-amber-300 text-amber-800" },
//   { key: "close", label: "Closed", cls: "border-green-400 text-green-800" },
//   { key: "reject", label: "Rejected", cls: "border-red-300 text-red-700" },
// ];
// const TICKET_VIEWS = [
//   { key: "Assigned", label: "Assigned to them" },
//   { key: "Raised", label: "Raised by them" },
//   { key: "Forwarded", label: "Forwarded by them" },
// ];
// const BOOKING_CARDS = [
//   { key: "", label: "Total bookings", cls: "border-slate-300 text-slate-900" },
//   { key: "active", label: "Active", cls: "border-green-400 text-green-800" },
//   { key: "cancelRequested", label: "Cancellation requested", cls: "border-orange-300 text-orange-700" },
//   { key: "cancelled", label: "Cancelled", cls: "border-amber-300 text-amber-800" },
//   { key: "rejected", label: "Rejected", cls: "border-red-300 text-red-700" },
// ];
// const FIT_CARDS = [
//   { key: "", label: "Total", cls: "border-slate-300 text-slate-900" },
//   { key: "Pending", label: "Pending", cls: "border-orange-300 text-orange-800" },
//   { key: "Picked up", label: "Pickup", cls: "border-sky-300 text-sky-800" },
//   { key: "Rate shared", label: "Rate shared", cls: "border-yellow-300 text-yellow-800" },
//   { key: "Accepted", label: "Accepted", cls: "border-green-400 text-green-800" },
//   { key: "Closed", label: "Closed", cls: "border-slate-400 text-slate-700" },
//   { key: "Cancelled", label: "Cancelled", cls: "border-rose-300 text-rose-800" },
//   { key: "Rejected", label: "Rejected", cls: "border-red-300 text-red-700" },
// ];
// const FIT_VIEWS = [
//   { key: "now", label: "Currently handling", hint: "Enquiries with this employee right now." },
//   { key: "fwdBy", label: "Forwarded by them", hint: "Enquiries this employee forwarded to someone else." },
//   { key: "fwdTo", label: "Forwarded to them", hint: "Enquiries someone else forwarded to this employee." },
// ];
// const STATUS_PILL = {
//   open: ["Open", "bg-blue-50 text-blue-700"], pickup: ["Picked up", "bg-violet-50 text-violet-700"], processing: ["Processing", "bg-amber-50 text-amber-800"],
//   close: ["Closed", "bg-green-50 text-green-700"], reject: ["Rejected", "bg-red-50 text-red-700"],
//   active: ["Active", "bg-green-50 text-green-700"], cancelRequested: ["Cancellation requested", "bg-orange-50 text-orange-700"], cancelled: ["Cancelled", "bg-amber-50 text-amber-800"], rejected: ["Rejected", "bg-red-50 text-red-700"],
// };
// // Pax — Active (cancellation request um serthu) / Cancelled (trip cancel um) / Rejected thani thani
// const paxOf = (b) => {
//   const c = b.cancelledTr || 0, r = b.rejectedTr || 0;
//   const a = b.activeTr != null ? (b.activeTr || 0) + (b.requestedTr || 0) : Math.max(0, (b.travellers || 0) - c - r);
//   return { a, c, r };
// };
// const paxExtra = ({ c, r }) => [c ? `${c} cancelled` : "", r ? `${r} rejected` : ""].filter(Boolean).join(" · ");
// // Kaasu received — Active + Cancellation requested bookings mattum (Cancelled / Rejected illa)
// const countsMoney = (b) => b.state === "active" || b.state === "cancelRequested";
// const Pill = ({ s }) => {
//   const [t, c] = STATUS_PILL[s] || [s, "bg-gray-100 text-gray-700"];
//   return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${c}`}>{t}</span>;
// };

// // Clickable count card
// const Card = ({ c, count, active, onClick, money }) => (
//   <button type="button" onClick={onClick} aria-pressed={active}
//     className={`rounded-2xl border-2 bg-white p-3 text-left transition ${active ? `${c.cls} shadow-md ring-2 ring-offset-1 ring-current` : `border-gray-200 hover:-translate-y-0.5 hover:shadow ${c.cls.split(" ").filter((x) => x.startsWith("text-")).join(" ")}`}`}>
//     <p className="text-2xl font-bold tabular-nums">{money ? inr(count) : count}</p>
//     <p className="mt-0.5 text-xs font-semibold text-gray-600">{c.label}</p>
//   </button>
// );
// // Advance / Balance — amount + Paid / Pending (Cancellation la adjust aanaa adhu)
// const MoneyLine = ({ label, v }) => (
//   <p className="flex flex-wrap items-baseline gap-x-1">
//     <span className="text-gray-500">{label}</span>
//     {v?.adjusted ? <span className="text-gray-500">Adjusted in cancellation</span>
//       : <><span className="font-semibold tabular-nums text-gray-900">{inr(v?.amount)}</span><span className={`font-semibold ${v?.paid ? "text-green-700" : "text-gray-400"}`}>{v?.paid ? "Paid" : "Pending"}</span></>}
//   </p>
// );
// const Kv = ({ label, v, bold }) => (
//   <p className="flex flex-wrap items-baseline gap-x-1">
//     <span className="text-gray-500">{label}</span>
//     <span className={`tabular-nums ${bold ? "font-bold text-gray-900" : "font-semibold text-gray-800"}`}>{v ? inr(v) : "—"}</span>
//   </p>
// );
// const Money = ({ label, value, sub, tone = "text-gray-900" }) => (
//   <div className="rounded-2xl border border-gray-200 bg-white p-3">
//     <p className={`text-xl font-bold tabular-nums ${tone}`}>{inr(value)}</p>
//     <p className="mt-0.5 text-xs font-semibold text-gray-600">{label}</p>
//     {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
//   </div>
// );

// // ════════════════════════════════════════════════════════════════
// const EmployeePerformance = ({
//   tabs = ["tickets", "bookings"],
//   api = "employee-performance",
//   title = "Employee Performance",
//   subtitle = "All employees together — pick one employee to see only theirs.",
// }) => {
//   const { aToken, backendUrl } = useContext(TourAdminContext);
//   const [tab, setTab] = useState(tabs[0]);
//   const [preset, setPreset] = useState("all");
//   const [[from, to], setRange] = useState(["", ""]);
//   const [employees, setEmployees] = useState([]);
//   const [allEmps, setAllEmps] = useState(new Map()); // key → name (Tour admin / Website kooda)
//   const [emp, setEmp] = useState("*"); // "*" = ellaa employees um (Tour admin page maadhiri), illa "staff:<id>"
//   const [list, setList] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [view, setView] = useState(tabs[0] === "fit" ? "now" : "Assigned"); // ticket / FIT view
//   const [card, setCard] = useState(""); // card filter
//   const [q, setQ] = useState("");

//   const get = useCallback(
//     async (params) => {
//       const { data } = await axios.get(`${backendUrl}/api/touradmin/${api}`, { headers: { aToken }, params });
//       if (!data?.success) throw new Error(data?.message || "Failed to load");
//       return data;
//     },
//     [backendUrl, aToken, api],
//   );

//   // Employee list (staff mattum)
//   useEffect(() => {
//     get({ tab: tabs[0], from: "2999-01-01" }) // list mattum venum — data illaadha date
//       .then((d) => setEmployees((d.employees || []).filter((e) => e.type === "staff" && e.staffId).sort((a, b) => (a.status === "Active" ? 0 : 1) - (b.status === "Active" ? 0 : 1) || a.name.localeCompare(b.name))))
//       .catch((err) => toast.error(err.response?.data?.message || err.message));
//   }, [get]); // eslint-disable-line react-hooks/exhaustive-deps

//   const reqId = useRef(0); // late-aa vandha pazhaya response (vera tab / employee) list-a maathakoodaadhu
//   const load = useCallback(async () => {
//     const id = ++reqId.current;
//     if (!emp) { setList(null); return; }
//     setLoading(true);
//     setList(null);
//     try {
//       const d = await get({ tab, employee: emp, from: from || undefined, to: to || undefined });
//       if (id !== reqId.current) return;
//       setList(d[tab]?.details || []);
//       setAllEmps(new Map((d.employees || []).map((e) => [e.key, e.name])));
//     } catch (err) {
//       if (id !== reqId.current) return;
//       toast.error(err.response?.data?.message || err.message);
//       setList([]);
//     } finally {
//       if (id === reqId.current) setLoading(false);
//     }
//   }, [get, tab, emp, from, to]);
//   useEffect(() => { load(); }, [load]);
//   const [cf, setCf] = useState({}); // column filters { key: value }
//   useEffect(() => { setCard(""); setQ(""); setCf({}); }, [tab, emp, view]);
//   useEffect(() => { setView(tab === "fit" ? "now" : "Assigned"); }, [tab]);

//   const me = employees.find((e) => e.key === emp);
//   const ALL = emp === "*";
//   const nameOf = (k) => allEmps.get(k) || (k ? k.replace(/^name:/, "") : "—");
//   const L = list || [];

//   // ─── Tickets ───
//   const tBase = useMemo(() => (tab === "tickets" ? (ALL ? L : L.filter((t) => (t.roles || []).includes(view))) : []), [L, tab, view, ALL]);

//   // ─── Bookings ───

//   const sum = (arr, fn) => arr.reduce((a, x) => a + (Number(fn(x)) || 0), 0);
//   // ─── FIT ───
//   const fBase = useMemo(() => {
//     if (tab !== "fit") return [];
//     if (ALL) return L;
//     if (view === "fwdBy") return L.filter((e) => e.fwdOut?.length);
//     if (view === "fwdTo") return L.filter((e) => e.fwdIn?.length);
//     return L.filter((e) => e.withMe);
//   }, [L, tab, view, ALL]);
//   const fwdNames = (arr) => [...new Set((arr || []).map((f) => (f.key ? nameOf(f.key) : f.label) || "—"))].join(", ");
//   const fitExtra = ALL ? ["With"] : view === "fwdBy" ? ["Forwarded to", "Now with"] : view === "fwdTo" ? ["Forwarded by", "Now with"] : [];


//   // List — card + search filter
//   const s = q.trim().toLowerCase();
//   const has = (...xs) => !s || xs.some((x) => String(x || "").toLowerCase().includes(s));
//   // ─── Column filters — ticket page maadhiri header la funnel (ColumnFilter) ───
//   // Ovvoru field: kind multi (comma string) / text / date + get(row) → value (or array)
//   const opts = (arr, fn) => [...new Set(arr.flatMap((x) => [].concat(fn(x))).map((v) => String(v ?? "").trim()).filter(Boolean))]
//     .sort((x, y) => x.localeCompare(y)).map((v) => ({ value: v, label: v }));
//   const fixed = (pairs) => pairs.map(([value, label]) => ({ value, label }));
//   const base = tab === "tickets" ? tBase : tab === "bookings" ? L : fBase;
//   const paxTags = (b) => { const p = paxOf(b); return [p.c ? "c" : "", p.r ? "r" : "", !p.c && !p.r ? "none" : ""].filter(Boolean); };
//   const cancTags = (b) => { const t = [b.gvCancellation > 0 && "gv", b.irctcCancellation > 0 && "irctc", b.refund > 0 && "refund"].filter(Boolean); return t.length ? t : ["none"]; };
//   const ownerName = (e) => (e.ownerKey ? nameOf(e.ownerKey) : "Not picked");
//   const splitNames = (arr) => fwdNames(arr).split(", ").filter(Boolean);
//   const COLS =
//     tab === "tickets" ? {
//       ticketNo: { label: "Ticket no", fields: [{ key: "c_tno", kind: "text", label: "Ticket no contains", placeholder: "e.g. GVTKT033", get: (t) => t.ticketNo }] },
//       ticket: { label: "Ticket", fields: [
//         { key: "c_subj", kind: "text", label: "Subject / TNR contains", placeholder: "e.g. Advance or XQ08ZT", get: (t) => `${t.subject || ""} ${t.tnr || ""}` },
//         { key: "c_type", kind: "multi", label: "Ticket type", options: opts(base, (t) => t.queryType), get: (t) => t.queryType },
//       ] },
//       raisedBy: { label: "Raised by", fields: [{ key: "c_by", kind: "multi", label: "Raised by", search: true, options: opts(base, (t) => t.raisedBy), get: (t) => t.raisedBy }] },
//       raisedTo: { label: "Raised to", fields: [{ key: "c_to", kind: "multi", label: "Raised to", search: true, options: opts(base, (t) => t.raisedTo), get: (t) => t.raisedTo }] },
//       date: { label: "Raised on", fields: [{ key: "date", kind: "date", label: "Raised on", get: (t) => t.createdAt }] },
//       status: { label: "Status", fields: [{ key: "c_st", kind: "multi", label: "Status", options: TICKET_CARDS.filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })), get: (t) => t.status }] },
//     }
//       : tab === "bookings" ? {
//         tnr: { label: "TNR", fields: [
//           { key: "c_tnr", kind: "text", label: "TNR contains", placeholder: "e.g. UF08IX", get: (b) => b.tnr },
//           { key: "date", kind: "date", label: "Booked on", get: (b) => b.bookingDate },
//         ] },
//         tour: { label: "Tour / Customer", fields: [
//           { key: "c_tour", kind: "multi", label: "Tour", search: true, options: opts(base, (b) => b.tour), get: (b) => b.tour },
//           { key: "c_cust", kind: "text", label: "Customer contains", placeholder: "Customer name", get: (b) => b.customer },
//         ] },
//         by: { label: "Booked by", fields: [{ key: "c_by", kind: "multi", label: "Booked by", search: true, options: opts(base, (b) => nameOf(b.empKey)), get: (b) => nameOf(b.empKey) }] },
//         pax: { label: "Pax", fields: [{ key: "c_pax", kind: "multi", label: "Pax", options: fixed([["c", "Has cancelled pax"], ["r", "Has rejected pax"], ["none", "No cancelled / rejected"]]), get: paxTags }] },
//         pay: { label: "Advance / Balance", fields: [
//           { key: "c_adv", kind: "multi", label: "Advance", options: fixed([["paid", "Paid"], ["pending", "Pending"]]), get: (b) => (b.advance?.paid ? "paid" : "pending") },
//           { key: "c_bal", kind: "multi", label: "Balance", options: fixed([["paid", "Paid"], ["pending", "Pending"], ["adjusted", "Adjusted in cancellation"]]), get: (b) => (b.balance?.adjusted ? "adjusted" : b.balance?.paid ? "paid" : "pending") },
//         ] },
//         canc: { label: "Cancellation", fields: [{ key: "c_canc", kind: "multi", label: "Cancellation", options: fixed([["gv", "Has GV"], ["irctc", "Has IRCTC"], ["refund", "Has refund"], ["none", "No cancellation"]]), get: cancTags }] },
//         status: { label: "Status", fields: [{ key: "c_st", kind: "multi", label: "Status", options: BOOKING_CARDS.filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })), get: (b) => b.state }] },
//       }
//         : {
//           code: { label: "FIT code", fields: [
//             { key: "c_code", kind: "text", label: "FIT code contains", placeholder: "e.g. GVFIT0030", get: (e) => e.fitCode },
//             { key: "date", kind: "date", label: "Created on", get: (e) => e.createdAt },
//           ] },
//           name: { label: "Name / Destination", fields: [
//             { key: "c_name", kind: "text", label: "Name contains", placeholder: "Customer name", get: (e) => e.name },
//             { key: "c_dest", kind: "multi", label: "Destination", search: true, options: opts(base, (e) => e.destination), get: (e) => String(e.destination || "").trim() },
//           ] },
//           zone: { label: "Zone", fields: [{ key: "c_zone", kind: "multi", label: "Zone", options: opts(base, (e) => String(e.zone || "").split(",")), get: (e) => String(e.zone || "").split(",").map((z) => z.trim()) }] },
//           fto: { label: "Forwarded to", fields: [{ key: "c_fto", kind: "multi", label: "Forwarded to", search: true, options: opts(base, (e) => splitNames(e.fwdOut)), get: (e) => splitNames(e.fwdOut) }] },
//           fby: { label: "Forwarded by", fields: [{ key: "c_fby", kind: "multi", label: "Forwarded by", search: true, options: opts(base, (e) => splitNames(e.fwdIn)), get: (e) => splitNames(e.fwdIn) }] },
//           with: { label: ALL ? "With" : "Now with", fields: [{ key: "c_with", kind: "multi", label: ALL ? "With" : "Now with", search: true, options: opts(base, ownerName), get: ownerName }] },
//           sales: { label: "Sales value", fields: [{ key: "c_sales", kind: "multi", label: "Sales value", options: fixed([["yes", "Has sales value"], ["no", "No sales value"]]), get: (e) => (e.salesValue > 0 ? "yes" : "no") }] },
//           stage: { label: "Stage", fields: [{ key: "c_st", kind: "multi", label: "Stage", options: FIT_CARDS.filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })), get: (e) => e.stage }] },
//         };
//   // Indha tab la kaattura columns mattum (filter apply aaga)
//   const visibleCols =
//     tab === "tickets" ? ["ticketNo", "ticket", "raisedBy", "raisedTo", "date", "status"]
//       : tab === "bookings" ? ["tnr", "tour", ...(ALL ? ["by"] : []), "pax", "pay", "canc", "status"]
//         : ["code", "name", "zone", ...(ALL ? ["with"] : view === "fwdBy" ? ["fto", "with"] : view === "fwdTo" ? ["fby", "with"] : []), "sales", "stage"];
//   const activeFields = visibleCols.flatMap((id) => COLS[id]?.fields || []);
//   const localDay = (d) => { if (!d) return ""; const x = new Date(d); return isNaN(x) ? "" : x.toLocaleDateString("en-CA"); };
//   const passCols = (r) => activeFields.every((f) => {
//     if (f.kind === "date") {
//       if (!cf.fromDate && !cf.toDate) return true;
//       const day = localDay(f.get(r));
//       return !!day && (!cf.fromDate || day >= cf.fromDate) && (!cf.toDate || day <= cf.toDate);
//     }
//     if (f.kind === "text") {
//       const t = String(cf[f.key] || "").trim().toLowerCase();
//       return !t || String(f.get(r) || "").toLowerCase().includes(t);
//     }
//     const want = String(cf[f.key] || "").split(",").map((x) => x.trim()).filter(Boolean);
//     if (!want.length) return true;
//     return [].concat(f.get(r)).some((v) => want.includes(String(v ?? "").trim()));
//   });
//   const applyCf = (o) => setCf((c) => ({ ...c, ...o }));
//   const head = (id, className = "") => (
//     <th key={id} className={`px-3 py-3 font-semibold ${className}`}>
//       <ColumnFilter label={COLS[id].label} fields={COLS[id].fields} filters={cf} onApply={applyCf} />
//     </th>
//   );
//   // Mobile — header illa, adhanaala filter chips
//   const mobileFilters = (hideFrom = "md") => (
//     <div className={`flex flex-wrap gap-1.5 border-b border-gray-100 px-4 py-2.5 ${hideFrom === "lg" ? "lg:hidden" : "md:hidden"}`}>
//       {visibleCols.map((id) => <ColumnFilter key={id} variant="chip" label={COLS[id].label} fields={COLS[id].fields} filters={cf} onApply={applyCf} />)}
//     </div>
//   );
//   const anyCol = Object.values(cf).some((v) => String(v || "").trim());
//   // Cards + money — column filter apply aagi (card click / search illaama)
//   const CB = base.filter(passCols);
//   const tCount = (k) => (k ? CB.filter((t) => t.status === k).length : CB.length);
//   const bCount = (k) => (k ? CB.filter((b) => b.state === k).length : CB.length);
//   const fCount = (k) => (k ? CB.filter((e) => e.stage === k).length : CB.length);

//   const rows =
//     tab === "tickets" ? tBase.filter((t) => (!card || t.status === card) && passCols(t) && has(t.ticketNo, t.subject, t.tnr, t.raisedBy, t.raisedTo))
//       : tab === "bookings" ? L.filter((b) => (!card || b.state === card) && passCols(b) && has(b.tnr, b.tour, b.customer, nameOf(b.empKey)))
//         : fBase.filter((e) => (!card || e.stage === card) && passCols(e) && has(e.fitCode, e.name, e.destination));

//   const inputCls = "rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100";
//   const pill = (on) => `rounded-xl px-4 py-2 text-sm font-semibold ${on ? "bg-white text-green-700 shadow" : "text-gray-600 hover:text-gray-900"}`;

//   return (
//     <div className="w-full min-w-0 max-w-7xl flex-1 p-3 pt-16 sm:p-5 sm:pt-16 lg:pt-5">
//       <div className="mb-5 text-center">
//         <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
//         <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
//         <span className="mx-auto mt-3 block h-1 w-14 rounded-full bg-green-500" aria-hidden="true" />
//       </div>

//       {/* ── Employee + dates ── */}
//       <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4">
//         <label className="w-full text-xs font-semibold text-gray-600 sm:w-auto sm:min-w-[16rem] sm:flex-1">Employee
//           <select value={emp} onChange={(e) => setEmp(e.target.value)} className={`mt-1 block w-full ${inputCls}`}>
//             <option value="*">All employees</option>
//             {employees.map((e) => (
//               <option key={e.key} value={e.key}>{e.name}{e.employeeId ? ` (${e.employeeId})` : ""}{e.role ? ` · ${e.role}` : ""}{e.status !== "Active" ? ` · ${e.status}` : ""}</option>
//             ))}
//           </select>
//         </label>
//         <div className="flex flex-wrap gap-1.5">
//           {PRESETS.map((p) => (
//             <button key={p.key} type="button" onClick={() => { setPreset(p.key); setRange(p.range()); }}
//               className={`rounded-full px-3 py-2 text-xs font-semibold ${preset === p.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
//               {p.label}
//             </button>
//           ))}
//         </div>
//         <label className="min-w-[9rem] flex-1 text-xs font-semibold text-gray-600 sm:flex-none">From
//           <input type="date" value={from} max={to || undefined} onChange={(e) => { setPreset(""); setRange([e.target.value, to]); }} className={`mt-1 block w-full ${inputCls}`} />
//         </label>
//         <label className="min-w-[9rem] flex-1 text-xs font-semibold text-gray-600 sm:flex-none">To
//           <input type="date" value={to} min={from || undefined} onChange={(e) => { setPreset(""); setRange([from, e.target.value]); }} className={`mt-1 block w-full ${inputCls}`} />
//         </label>
//       </div>

//       {!emp ? null : (
//         <>
//           {/* ── Who ── */}
//           <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
//             <div>
//               <p className="text-lg font-bold text-gray-900">{ALL ? "All employees" : me?.name}{!ALL && me?.employeeId ? <span className="font-medium text-gray-500"> · {me.employeeId}</span> : null}</p>
//               <p className="text-xs text-gray-500">{ALL ? "Pick an employee above to see only theirs" : `${me?.role || ""}${me?.status && me.status !== "Active" ? ` · ${me.status}` : ""}`} · {from ? fmtDate(from) : "All time"}{to ? ` – ${fmtDate(to)}` : ""}</p>
//             </div>
//             {tabs.length > 1 && (
//               <div className="flex w-full gap-1 rounded-2xl bg-gray-100 p-1 sm:w-auto" role="tablist">
//                 {tabs.map((k) => (
//                   <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`flex-1 sm:flex-none ${pill(tab === k)}`}>
//                     {k === "tickets" ? "🎫 Tickets" : k === "bookings" ? "🧳 Tour bookings" : "✈️ FIT"}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* ── Views (ticket page / FIT page maadhiri) ── */}
//           {!ALL && (tab === "tickets" || tab === "fit") && (
//             <div className="mb-3 flex flex-wrap gap-1 rounded-2xl bg-gray-100 p-1 sm:inline-flex">
//               {(tab === "tickets" ? TICKET_VIEWS : FIT_VIEWS).map((v) => (
//                 <button key={v.key} type="button" onClick={() => setView(v.key)} className={pill(view === v.key)}>{v.label}</button>
//               ))}
//             </div>
//           )}
//           {!ALL && tab === "fit" && (
//             <p className="-mt-1 mb-3 text-xs text-gray-500">{FIT_VIEWS.find((v) => v.key === view)?.hint}</p>
//           )}

//           {/* ── Cards ── */}
//           {loading || !list ? (
//             <p className="py-10 text-center text-sm text-gray-500">Loading…</p>
//           ) : (
//             <>
//               {tab === "tickets" && (
//                 <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
//                   {TICKET_CARDS.map((c) => <Card key={c.label} c={c} count={tCount(c.key)} active={card === c.key} onClick={() => setCard(c.key)} />)}
//                 </div>
//               )}
//               {tab === "bookings" && (
//                 <>
//                   <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-5">
//                     {BOOKING_CARDS.map((c) => <Card key={c.label} c={c} count={bCount(c.key)} active={card === c.key} onClick={() => setCard(c.key)} />)}
//                   </div>
//                   <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
//                     <Money label="Advance received" value={sum(CB, (b) => (countsMoney(b) && b.advance?.paid ? b.advance.amount : 0))} sub={`${CB.filter((b) => countsMoney(b) && b.advance?.paid).length} paid · ${CB.filter((b) => countsMoney(b) && !b.advance?.paid).length} pending`} tone="text-green-700" />
//                     <Money label="Balance received" value={sum(CB, (b) => (countsMoney(b) && b.balance?.paid ? b.balance.amount : 0))} sub={`${CB.filter((b) => countsMoney(b) && b.balance?.paid).length} paid · ${CB.filter((b) => countsMoney(b) && !b.balance?.paid && !b.balance?.adjusted).length} pending`} tone="text-green-700" />
//                     <Money label="GV cancellation" value={sum(CB, (b) => b.gvCancellation)} />
//                     <Money label="IRCTC cancellation" value={sum(CB, (b) => b.irctcCancellation)} />
//                     <Money label="Refund" value={sum(CB, (b) => b.refund)} />
//                   </div>
//                 </>
//               )}
//               {tab === "fit" && (
//                 <>
//                   <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
//                     {FIT_CARDS.map((c) => <Card key={c.label} c={c} count={fCount(c.key)} active={card === c.key} onClick={() => setCard(c.key)} />)}
//                   </div>
//                   <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
//                     <Money label="Sales value (accepted)" value={sum(CB.filter((e) => ["Accepted", "Closed"].includes(e.stage)), (e) => e.salesValue)} tone="text-green-700" />
//                   </div>
//                 </>
//               )}

//               {/* ── List ── */}
//               <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
//                 <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-4 py-3">
//                   <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "tickets" ? "Search ticket no, subject, TNR" : tab === "bookings" ? "Search TNR, tour, customer" : "Search FIT code, name, place"} className={`w-full min-w-0 flex-1 sm:min-w-[14rem] ${inputCls}`} />
//                   {(card || q || anyCol) && <button type="button" onClick={() => { setCard(""); setQ(""); setCf({}); }} className="text-xs font-semibold text-red-600 hover:underline">Clear all</button>}
//                   <span className="text-xs text-gray-500">Showing {rows.length}</span>
//                 </div>
//                 {rows.length === 0 ? (
//                   <p className="px-4 py-10 text-center text-sm text-gray-500">Nothing here.</p>
//                 ) : tab === "tickets" ? (
//                   <>
//                     {mobileFilters()}
//                     {/* Mobile / tablet — cards */}
//                     <ul className="divide-y divide-gray-100 md:hidden">
//                       {rows.map((t) => (
//                         <li key={t._id} className="px-4 py-3">
//                           <div className="flex items-center justify-between gap-2">
//                             <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800">{t.ticketNo || "—"}</span>
//                             <Pill s={t.status} />
//                           </div>
//                           <p className="mt-1.5 font-semibold text-gray-900">{t.subject}</p>
//                           <p className="text-xs text-gray-500">{t.queryType}{t.tnr ? ` · TNR ${t.tnr}` : ""}</p>
//                           <p className="mt-1 text-xs text-gray-600"><span className="font-semibold">{t.raisedBy || "—"}</span> → <span className="font-semibold">{t.raisedTo || "—"}</span> · {fmtDate(t.createdAt)}</p>
//                         </li>
//                       ))}
//                     </ul>
//                     {/* Desktop — table */}
//                     <div className="hidden md:block">
//                       <table className="w-full table-fixed text-left text-sm">
//                         <thead className="bg-blue-50 text-xs text-gray-600"><tr>
//                           {head("ticketNo", "w-36")}{head("ticket")}{head("raisedBy", "w-[19%]")}
//                           {head("raisedTo", "w-[17%]")}{head("date", "w-36")}{head("status", "w-32")}
//                         </tr></thead>
//                         <tbody>
//                           {rows.map((t) => (
//                             <tr key={t._id} className="border-t border-gray-100 align-top">
//                               <td className="px-4 py-2.5"><span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800">{t.ticketNo || "—"}</span></td>
//                               <td className="px-4 py-2.5"><p className="truncate font-semibold text-gray-900">{t.subject}</p><p className="truncate text-xs text-gray-500">{t.queryType}{t.tnr ? ` · TNR ${t.tnr}` : ""}</p></td>
//                               <td className="truncate px-3 py-2.5 text-xs font-semibold" title={t.raisedBy}>{t.raisedBy || "—"}</td>
//                               <td className="truncate px-3 py-2.5 text-xs" title={t.raisedTo}>{t.raisedTo || "—"}</td>
//                               <td className="px-4 py-2.5 text-xs">{fmtDate(t.createdAt)}</td>
//                               <td className="px-4 py-2.5"><Pill s={t.status} /></td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </>
//                 ) : tab === "bookings" ? (
//                   <>
//                     {mobileFilters("lg")}
//                     {/* Mobile / tablet — cards */}
//                     <ul className="divide-y divide-gray-100 lg:hidden">
//                       {rows.map((b, i) => (
//                         <li key={`${b.tnr}-${i}`} className="px-4 py-3">
//                           <div className="flex items-center justify-between gap-2">
//                             <span className="font-mono text-sm font-bold text-amber-800">{b.tnr || "—"}</span>
//                             <Pill s={b.state} />
//                           </div>
//                           <p className="mt-1 font-semibold text-gray-900">{b.tour}</p>
//                           <p className="text-xs text-gray-500">{b.customer || "—"} · {paxOf(b).a} pax{paxExtra(paxOf(b)) ? ` (${paxExtra(paxOf(b))})` : ""} · {fmtDate(b.bookingDate)}{ALL ? ` · ${nameOf(b.empKey)}` : ""}</p>
//                           <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl bg-gray-50 p-2.5 text-xs sm:grid-cols-3">
//                             <MoneyLine label="Advance" v={b.advance} />
//                             <MoneyLine label="Balance" v={b.balance} />
//                             <Kv label="GV cancel" v={b.gvCancellation} />
//                             <Kv label="IRCTC cancel" v={b.irctcCancellation} />
//                             <Kv label="Refund" v={b.refund} />
//                           </div>
//                         </li>
//                       ))}
//                     </ul>
//                     {/* Desktop — compact table (Advance + Balance oru column; GV / IRCTC / Refund oru column) */}
//                     <div className="hidden lg:block">
//                       <table className="w-full table-fixed text-left text-sm">
//                         <thead className="bg-blue-50 text-xs text-gray-600"><tr>
//                           {head("tnr", "w-28")}
//                           {head("tour")}
//                           {ALL && head("by", "w-[14%]")}
//                           {head("pax", "w-24")}
//                           {head("pay", "w-[20%]")}
//                           {head("canc", "w-[16%]")}
//                           {head("status", "w-36")}
//                         </tr></thead>
//                         <tbody>
//                           {rows.map((b, i) => (
//                             <tr key={`${b.tnr}-${i}`} className="border-t border-gray-100 align-top">
//                               <td className="px-3 py-2.5"><p className="font-mono text-xs font-bold text-amber-800">{b.tnr || "—"}</p><p className="text-[11px] text-gray-500">{fmtDate(b.bookingDate)}</p></td>
//                               <td className="px-3 py-2.5"><p className="truncate font-semibold text-gray-900" title={b.tour}>{b.tour}</p><p className="truncate text-xs text-gray-500" title={b.customer}>{b.customer || "—"}</p></td>
//                               {ALL && <td className="truncate px-3 py-2.5 text-xs font-semibold" title={nameOf(b.empKey)}>{nameOf(b.empKey)}</td>}
//                               <td className="px-3 py-2.5"><p className="font-semibold">{paxOf(b).a}</p>{paxOf(b).c > 0 && <p className="text-[11px] text-amber-700">{paxOf(b).c} cancelled</p>}{paxOf(b).r > 0 && <p className="text-[11px] text-red-600">{paxOf(b).r} rejected</p>}</td>
//                               <td className="px-3 py-2.5 text-xs"><MoneyLine label="Adv" v={b.advance} /><MoneyLine label="Bal" v={b.balance} /></td>
//                               <td className="px-3 py-2.5 text-xs">
//                                 {b.gvCancellation || b.irctcCancellation || b.refund ? (
//                                   <><Kv label="GV" v={b.gvCancellation} /><Kv label="IRCTC" v={b.irctcCancellation} /><Kv label="Refund" v={b.refund} /></>
//                                 ) : <span className="text-gray-400">—</span>}
//                               </td>
//                               <td className="px-3 py-2.5"><Pill s={b.state} /></td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                     {/* Total — ellaa screen ku um */}
//                     <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-t-2 border-gray-200 bg-gray-50 px-4 py-3 text-xs sm:grid-cols-3 lg:grid-cols-6">
//                       <p className="col-span-2 text-sm font-bold sm:col-span-3 lg:col-span-1">Total · {rows.length} bookings<span className="block text-xs font-semibold text-gray-600">{sum(rows, (b) => paxOf(b).a)} active pax · {sum(rows, (b) => paxOf(b).c)} cancelled · {sum(rows, (b) => paxOf(b).r)} rejected</span></p>
//                       <Kv label="Advance paid" v={sum(rows, (b) => (countsMoney(b) && b.advance?.paid ? b.advance.amount : 0))} bold />
//                       <Kv label="Balance paid" v={sum(rows, (b) => (countsMoney(b) && b.balance?.paid ? b.balance.amount : 0))} bold />
//                       <Kv label="GV cancel" v={sum(rows, (b) => b.gvCancellation)} bold />
//                       <Kv label="IRCTC cancel" v={sum(rows, (b) => b.irctcCancellation)} bold />
//                       <Kv label="Refund" v={sum(rows, (b) => b.refund)} bold />
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     {mobileFilters()}
//                     {/* Mobile — cards */}
//                     <ul className="divide-y divide-gray-100 md:hidden">
//                       {rows.map((e) => (
//                         <li key={e._id} className="px-4 py-3">
//                           <div className="flex items-center justify-between gap-2">
//                             <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800">{e.fitCode || "—"}</span>
//                             <span className="text-xs font-semibold">{e.stage}</span>
//                           </div>
//                           <p className="mt-1 font-semibold text-gray-900">{e.name}</p>
//                           <p className="text-xs text-gray-500">{e.destination || "—"} · {e.zone || "No zone"}{e.salesValue ? ` · ${inr(e.salesValue)}` : ""}</p>
//                           {!ALL && view === "fwdBy" && <p className="mt-1 text-xs">Forwarded to <b>{fwdNames(e.fwdOut)}</b></p>}
//                           {!ALL && view === "fwdTo" && <p className="mt-1 text-xs">Forwarded by <b>{fwdNames(e.fwdIn)}</b></p>}
//                           {fitExtra.length > 0 && <p className="text-xs">Now with <b>{e.ownerKey ? nameOf(e.ownerKey) : "Not picked"}</b></p>}
//                         </li>
//                       ))}
//                     </ul>
//                     {/* Desktop — table */}
//                     <div className="hidden md:block">
//                       <table className="w-full table-fixed text-left text-sm">
//                         <thead className="bg-blue-50 text-xs text-gray-600"><tr>
//                           {head("code", "w-36")}{head("name")}
//                           {head("zone", "w-[14%]")}
//                           {visibleCols.filter((id) => ["fto", "fby", "with"].includes(id)).map((id) => head(id, "w-[14%]"))}
//                           {head("sales", "w-32")}{head("stage", "w-32")}
//                         </tr></thead>
//                         <tbody>
//                           {rows.map((e) => (
//                             <tr key={e._id} className="border-t border-gray-100 align-top">
//                               <td className="px-3 py-2.5"><span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800">{e.fitCode || "—"}</span></td>
//                               <td className="px-3 py-2.5"><p className="truncate font-semibold">{e.name}</p><p className="truncate text-xs text-gray-500">{e.destination || "—"}</p></td>
//                               <td className="truncate px-3 py-2.5 text-xs" title={e.zone}>{e.zone || "—"}</td>
//                               {!ALL && view === "fwdBy" && <td className="truncate px-3 py-2.5 text-xs font-semibold">{fwdNames(e.fwdOut)}</td>}
//                               {!ALL && view === "fwdTo" && <td className="truncate px-3 py-2.5 text-xs font-semibold">{fwdNames(e.fwdIn)}</td>}
//                               {fitExtra.length > 0 && <td className="truncate px-3 py-2.5 text-xs font-semibold">{e.ownerKey ? nameOf(e.ownerKey) : "Not picked"}</td>}
//                               <td className="px-3 py-2.5">{e.salesValue ? inr(e.salesValue) : "—"}</td>
//                               <td className="px-3 py-2.5 text-xs font-semibold">{e.stage}</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                     <div className="flex flex-wrap justify-between gap-2 border-t-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold">
//                       <span>Total · {rows.length} enquiries</span><span>Sales value {inr(sum(rows, (e) => e.salesValue))}</span>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default EmployeePerformance;

// ════════════════════════════════════════════════════════════════
//  EmployeePerformance.jsx — Admin panel (CEO tab) — SIMPLE scorecard
//  Mela oru employee select → avangaludhu mattum:
//    Tickets  : Raise / View Tickets page la varra adhe status cards + tabs
//    Bookings : Tour Bookings maadhiri status + amount cards
//    FIT      : FIT Enquiries page la varra stage cards (FitPerformance.jsx la)
//  Card click pannaa keezha list andha status ku filter aagum.
//  API: GET /api/touradmin/<api>?tab=&employee=&from=&to=
// ════════════════════════════════════════════════════════════════
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { ColumnFilter } from "../../components/TicketFilters"; // ticket page la irukkura header funnel filter
import { toast } from "react-toastify";
import { TourAdminContext } from "../../context/TourAdminContext"; // ⚙️ path check pannunga

// ─── Dates ───
const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const PRESETS = [
  { key: "all", label: "All time", range: () => ["", ""] },
  { key: "month", label: "This month", range: () => { const t = new Date(); return [ymd(new Date(t.getFullYear(), t.getMonth(), 1)), ymd(t)]; } },
  { key: "last", label: "Last month", range: () => { const t = new Date(); return [ymd(new Date(t.getFullYear(), t.getMonth() - 1, 1)), ymd(new Date(t.getFullYear(), t.getMonth(), 0))]; } },
  { key: "year", label: "This year", range: () => { const t = new Date(); return [ymd(new Date(t.getFullYear(), 0, 1)), ymd(t)]; } },
];
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");
const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

// ─── Status cards (ticket page / FIT page la irukkura adhe colours) ───
const TICKET_CARDS = [
  { key: "", label: "Total", cls: "border-slate-300 text-slate-900" },
  { key: "open", label: "Open", cls: "border-sky-300 text-sky-800" },
  { key: "pickup", label: "Picked up", cls: "border-violet-300 text-violet-800" },
  { key: "processing", label: "Processing", cls: "border-amber-300 text-amber-800" },
  { key: "close", label: "Closed", cls: "border-green-400 text-green-800" },
  { key: "reject", label: "Rejected", cls: "border-red-300 text-red-700" },
];
const TICKET_VIEWS = [
  { key: "Assigned", label: "Assigned to them" },
  { key: "Raised", label: "Raised by them" },
  { key: "Forwarded", label: "Forwarded by them" },
];
const BOOKING_CARDS = [
  { key: "", label: "Total bookings", cls: "border-slate-300 text-slate-900" },
  { key: "unverified", label: "Unverified", cls: "border-gray-400 text-gray-700" },
  { key: "active", label: "Active (Advance only paid)", cls: "border-green-400 text-green-800" },
  { key: "completed", label: "Completed (Booking completed)", cls: "border-yellow-400 text-yellow-800" },
  { key: "cancelled", label: "Fully cancelled", cls: "border-red-300 text-red-700" },
  { key: "tripCancelled", label: "Trip cancelled", cls: "border-rose-300 text-rose-700" },
  { key: "rejected", label: "Rejected", cls: "border-purple-300 text-purple-700" },
];
const FIT_CARDS = [
  { key: "", label: "Total", cls: "border-slate-300 text-slate-900" },
  { key: "Pending", label: "Pending", cls: "border-orange-300 text-orange-800" },
  { key: "Picked up", label: "Pickup", cls: "border-sky-300 text-sky-800" },
  { key: "Rate shared", label: "Rate shared", cls: "border-yellow-300 text-yellow-800" },
  { key: "Accepted", label: "Accepted", cls: "border-green-400 text-green-800" },
  { key: "Closed", label: "Closed", cls: "border-slate-400 text-slate-700" },
  { key: "Cancelled", label: "Cancelled", cls: "border-rose-300 text-rose-800" },
  { key: "Rejected", label: "Rejected", cls: "border-red-300 text-red-700" },
];
const FIT_VIEWS = [
  { key: "now", label: "Currently handling", hint: "Enquiries with this employee right now." },
  { key: "fwdBy", label: "Forwarded by them", hint: "Enquiries this employee forwarded to someone else." },
  { key: "fwdTo", label: "Forwarded to them", hint: "Enquiries someone else forwarded to this employee." },
];
const STATUS_PILL = {
  open: ["Open", "bg-blue-50 text-blue-700"], pickup: ["Picked up", "bg-violet-50 text-violet-700"], processing: ["Processing", "bg-amber-50 text-amber-800"],
  close: ["Closed", "bg-green-50 text-green-700"], reject: ["Rejected", "bg-red-50 text-red-700"],
  active: ["Active", "bg-green-50 text-green-700"], unverified: ["Unverified", "bg-gray-100 text-gray-700"], completed: ["Completed", "bg-yellow-50 text-yellow-800"],
  cancelRequested: ["Cancellation requested", "bg-orange-50 text-orange-700"], cancelled: ["Fully cancelled", "bg-red-50 text-red-700"], tripCancelled: ["Trip cancelled", "bg-rose-50 text-rose-700"], rejected: ["Rejected", "bg-purple-50 text-purple-700"],
};
// Pax — Active (cancellation request um serthu) / Cancelled (trip cancel um) / Rejected thani thani
const paxOf = (b) => {
  const c = b.cancelledTr || 0, r = b.rejectedTr || 0;
  const a = b.activeTr != null ? (b.activeTr || 0) + (b.requestedTr || 0) : Math.max(0, (b.travellers || 0) - c - r);
  return { a, c, r };
};
const paxExtra = ({ c, r }) => [c ? `${c} cancelled` : "", r ? `${r} rejected` : ""].filter(Boolean).join(" · ");
// FIT — stage pill + "by …" (FIT Enquiries page maadhiri)
const STAGE_PILL = {
  Pending: "bg-gray-100 text-gray-700", "Picked up": "bg-sky-50 text-sky-700", "Rate shared": "bg-yellow-50 text-yellow-800",
  Accepted: "bg-green-50 text-green-700", Closed: "bg-slate-100 text-slate-700", Cancelled: "bg-rose-50 text-rose-700", Rejected: "bg-red-50 text-red-700",
};
const StagePill = ({ s }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${STAGE_PILL[s] || "bg-gray-100 text-gray-700"}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{s}
  </span>
);
const ACTION_LABEL = { created: "Created", pickedUp: "Picked up", rateShared: "Rate shared", accepted: "Accepted", closed: "Closed", cancelled: "Cancelled", rejected: "Rejected", reopened: "Reopened", forwarded: "Forwarded" };
const duration = (e) => (e.days ? `${e.days}D${e.nights != null ? `/${e.nights}N` : ""}` : "");
const ZoneChips = ({ zones }) => (zones?.length
  ? <div className="flex flex-wrap gap-1">{zones.map((z) => <span key={z} className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800">{z}</span>)}</div>
  : <span className="text-gray-400">—</span>);
// Kaasu received — Active bookings mattum
const countsMoney = (b) => b.state === "active" || b.state === "completed"; // Active + Completed mattum
const Pill = ({ s }) => {
  const [t, c] = STATUS_PILL[s] || [s, "bg-gray-100 text-gray-700"];
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${c}`}>{t}</span>;
};

// Clickable count card
const Card = ({ c, count, active, onClick, money }) => (
  <button type="button" onClick={onClick} aria-pressed={active}
    className={`rounded-2xl border-2 bg-white p-3 text-left transition ${active ? `${c.cls} shadow-md ring-2 ring-offset-1 ring-current` : `border-gray-200 hover:-translate-y-0.5 hover:shadow ${c.cls.split(" ").filter((x) => x.startsWith("text-")).join(" ")}`}`}>
    <p className="text-2xl font-bold tabular-nums">{money ? inr(count) : count}</p>
    <p className="mt-0.5 text-xs font-semibold text-gray-600">{c.label}</p>
  </button>
);
// Advance / Balance — amount + Paid / Pending (Cancellation la adjust aanaa adhu)
const MoneyLine = ({ label, v }) => (
  <p className="flex flex-wrap items-baseline gap-x-1">
    <span className="text-gray-500">{label}</span>
    {v?.adjusted ? <span className="text-gray-500">Adjusted in cancellation</span>
      : <><span className="font-semibold tabular-nums text-gray-900">{inr(v?.amount)}</span><span className={`font-semibold ${v?.paid ? "text-green-700" : "text-gray-400"}`}>{v?.paid ? "Paid" : "Pending"}</span></>}
  </p>
);
const Kv = ({ label, v, bold }) => (
  <p className="flex flex-wrap items-baseline gap-x-1">
    <span className="text-gray-500">{label}</span>
    <span className={`tabular-nums ${bold ? "font-bold text-gray-900" : "font-semibold text-gray-800"}`}>{v ? inr(v) : "—"}</span>
  </p>
);
const Money = ({ label, value, sub, tone = "text-gray-900" }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-3">
    <p className={`text-xl font-bold tabular-nums ${tone}`}>{inr(value)}</p>
    <p className="mt-0.5 text-xs font-semibold text-gray-600">{label}</p>
    {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
  </div>
);

// ════════════════════════════════════════════════════════════════
const EmployeePerformance = ({
  tabs = ["tickets", "bookings"],
  api = "employee-performance",
  title = "Employee Performance",
  subtitle = "All employees together — pick one employee to see only theirs.",
}) => {
  const { aToken, backendUrl } = useContext(TourAdminContext);
  const [tab, setTab] = useState(tabs[0]);
  const [preset, setPreset] = useState("all");
  const [[from, to], setRange] = useState(["", ""]);
  const [employees, setEmployees] = useState([]);
  const [allEmps, setAllEmps] = useState(new Map()); // key → name (Tour admin / Website kooda)
  const [emp, setEmp] = useState("*"); // "*" = ellaa employees um (Tour admin page maadhiri), illa "staff:<id>"
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(tabs[0] === "fit" ? "now" : "Assigned"); // ticket / FIT view
  const [card, setCard] = useState(""); // card filter
  const [q, setQ] = useState("");

  const get = useCallback(
    async (params) => {
      const { data } = await axios.get(`${backendUrl}/api/touradmin/${api}`, { headers: { aToken }, params });
      if (!data?.success) throw new Error(data?.message || "Failed to load");
      return data;
    },
    [backendUrl, aToken, api],
  );

  // Employee list (staff mattum)
  useEffect(() => {
    get({ tab: tabs[0], from: "2999-01-01" }) // list mattum venum — data illaadha date
      .then((d) => setEmployees((d.employees || []).filter((e) => e.type === "staff" && e.staffId).sort((a, b) => (a.status === "Active" ? 0 : 1) - (b.status === "Active" ? 0 : 1) || a.name.localeCompare(b.name))))
      .catch((err) => toast.error(err.response?.data?.message || err.message));
  }, [get]); // eslint-disable-line react-hooks/exhaustive-deps

  const reqId = useRef(0); // late-aa vandha pazhaya response (vera tab / employee) list-a maathakoodaadhu
  const load = useCallback(async () => {
    const id = ++reqId.current;
    if (!emp) { setList(null); return; }
    setLoading(true);
    setList(null);
    try {
      const d = await get({ tab, employee: emp, from: from || undefined, to: to || undefined });
      if (id !== reqId.current) return;
      setList(d[tab]?.details || []);
      setAllEmps(new Map((d.employees || []).map((e) => [e.key, e.name])));
    } catch (err) {
      if (id !== reqId.current) return;
      toast.error(err.response?.data?.message || err.message);
      setList([]);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [get, tab, emp, from, to]);
  useEffect(() => { load(); }, [load]);
  const [cf, setCf] = useState({}); // column filters { key: value }
  useEffect(() => { setCard(""); setQ(""); setCf({}); }, [tab, emp, view]);
  useEffect(() => { setView(tab === "fit" ? "now" : "Assigned"); }, [tab]);

  const me = employees.find((e) => e.key === emp);
  const ALL = emp === "*";
  const nameOf = (k) => allEmps.get(k) || (k ? k.replace(/^name:/, "") : "—");
  const L = list || [];

  // ─── Tickets ───
  const tBase = useMemo(() => (tab === "tickets" ? (ALL ? L : L.filter((t) => (t.roles || []).includes(view))) : []), [L, tab, view, ALL]);

  // ─── Bookings ───

  const sum = (arr, fn) => arr.reduce((a, x) => a + (Number(fn(x)) || 0), 0);
  // ─── FIT ───
  const fBase = useMemo(() => {
    if (tab !== "fit") return [];
    if (ALL) return L;
    if (view === "fwdBy") return L.filter((e) => e.fwdOut?.length);
    if (view === "fwdTo") return L.filter((e) => e.fwdIn?.length);
    return L.filter((e) => e.withMe);
  }, [L, tab, view, ALL]);
  const fwdNames = (arr) => [...new Set((arr || []).map((f) => (f.key ? nameOf(f.key) : f.label) || "—"))].join(", ");
  const fitExtra = ALL ? ["With"] : view === "fwdBy" ? ["Forwarded to", "Now with"] : view === "fwdTo" ? ["Forwarded by", "Now with"] : ["Now with"]; // "Handled by now" column eppavum


  // List — card + search filter
  const s = q.trim().toLowerCase();
  const has = (...xs) => !s || xs.some((x) => String(x || "").toLowerCase().includes(s));
  // ─── Column filters — ticket page maadhiri header la funnel (ColumnFilter) ───
  // Ovvoru field: kind multi (comma string) / text / date + get(row) → value (or array)
  const opts = (arr, fn) => [...new Set(arr.flatMap((x) => [].concat(fn(x))).map((v) => String(v ?? "").trim()).filter(Boolean))]
    .sort((x, y) => x.localeCompare(y)).map((v) => ({ value: v, label: v }));
  const fixed = (pairs) => pairs.map(([value, label]) => ({ value, label }));
  const base = tab === "tickets" ? tBase : tab === "bookings" ? L : fBase;
  const paxTags = (b) => { const p = paxOf(b); return [p.c ? "c" : "", p.r ? "r" : "", !p.c && !p.r ? "none" : ""].filter(Boolean); };
  const cancTags = (b) => { const t = [b.gvCancellation > 0 && "gv", b.irctcCancellation > 0 && "irctc", b.refund > 0 && "refund"].filter(Boolean); return t.length ? t : ["none"]; };
  const monthOf = (d) => { if (!d) return "No date"; const x = new Date(d); return isNaN(x) ? "No date" : x.toLocaleDateString("en-IN", { month: "short", year: "numeric" }); };
  const ownerName = (e) => (e.ownerKey ? nameOf(e.ownerKey) : "Not picked yet");
  const raiserName = (e) => (e.raisedByWho?.key ? nameOf(e.raisedByWho.key) : e.raisedByWho?.name || "—");
  const splitNames = (arr) => fwdNames(arr).split(", ").filter(Boolean);
  const COLS =
    tab === "tickets" ? {
      ticketNo: { label: "Ticket no", fields: [{ key: "c_tno", kind: "text", label: "Ticket no contains", placeholder: "e.g. GVTKT033", get: (t) => t.ticketNo }] },
      ticket: { label: "Ticket", fields: [
        { key: "c_subj", kind: "text", label: "Subject / TNR contains", placeholder: "e.g. Advance or XQ08ZT", get: (t) => `${t.subject || ""} ${t.tnr || ""}` },
        { key: "c_type", kind: "multi", label: "Ticket type", options: opts(base, (t) => t.queryType), get: (t) => t.queryType },
      ] },
      raisedBy: { label: "Raised by", fields: [{ key: "c_by", kind: "multi", label: "Raised by", search: true, options: opts(base, (t) => t.raisedBy), get: (t) => t.raisedBy }] },
      raisedTo: { label: "Raised to", fields: [{ key: "c_to", kind: "multi", label: "Raised to", search: true, options: opts(base, (t) => t.raisedTo), get: (t) => t.raisedTo }] },
      date: { label: "Raised on", fields: [{ key: "date", kind: "date", label: "Raised on", get: (t) => t.createdAt }] },
      status: { label: "Status", fields: [{ key: "c_st", kind: "multi", label: "Status", options: TICKET_CARDS.filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })), get: (t) => t.status }] },
    }
      : tab === "bookings" ? {
        tnr: { label: "TNR", fields: [
          { key: "c_tnr", kind: "text", label: "TNR contains", placeholder: "e.g. UF08IX", get: (b) => b.tnr },
          { key: "date", kind: "date", label: "Booked on", get: (b) => b.bookingDate },
        ] },
        tour: { label: "Tour / Customer", fields: [
          { key: "c_tour", kind: "multi", label: "Tour", search: true, options: opts(base, (b) => b.tour), get: (b) => b.tour },
          { key: "c_cust", kind: "text", label: "Customer contains", placeholder: "Customer name", get: (b) => b.customer },
        ] },
        by: { label: "Booked by", fields: [{ key: "c_by", kind: "multi", label: "Booked by", search: true, options: opts(base, (b) => nameOf(b.empKey)), get: (b) => nameOf(b.empKey) }] },
        pax: { label: "Pax", fields: [{ key: "c_pax", kind: "multi", label: "Pax", options: fixed([["c", "Has cancelled pax"], ["r", "Has rejected pax"], ["none", "No cancelled / rejected"]]), get: paxTags }] },
        pay: { label: "Advance / Balance", fields: [
          { key: "c_adv", kind: "multi", label: "Advance", options: fixed([["paid", "Paid"], ["pending", "Pending"]]), get: (b) => (b.advance?.paid ? "paid" : "pending") },
          { key: "c_bal", kind: "multi", label: "Balance", options: fixed([["paid", "Paid"], ["pending", "Pending"], ["adjusted", "Adjusted in cancellation"]]), get: (b) => (b.balance?.adjusted ? "adjusted" : b.balance?.paid ? "paid" : "pending") },
        ] },
        canc: { label: "Cancellation", fields: [{ key: "c_canc", kind: "multi", label: "Cancellation", options: fixed([["gv", "Has GV"], ["irctc", "Has IRCTC"], ["refund", "Has refund"], ["none", "No cancellation"]]), get: cancTags }] },
        status: { label: "Status", fields: [{ key: "c_st", kind: "multi", label: "Status", options: BOOKING_CARDS.filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })), get: (b) => b.state }] },
      }
        : {
          code: { label: "Enquiry", fields: [
            { key: "c_code", kind: "text", label: "FIT code contains", placeholder: "e.g. GVFIT0030", get: (e) => e.fitCode },
            { key: "date", kind: "date", label: "Enquired on", get: (e) => e.createdAt },
            { key: "c_raised", kind: "multi", label: "Raised by", search: true, options: opts(base, raiserName), get: raiserName },
          ] },
          name: { label: "Customer", fields: [
            { key: "c_name", kind: "text", label: "Name / mobile contains", placeholder: "Name or mobile", get: (e) => `${e.name || ""} ${e.mobile || ""}` },
          ] },
          trip: { label: "Trip", fields: [
            { key: "c_dest", kind: "multi", label: "Destination", search: true, options: opts(base, (e) => e.destination), get: (e) => String(e.destination || "").trim() },
            { key: "c_ttype", kind: "multi", label: "Tour type", options: opts(base, (e) => e.tourType), get: (e) => e.tourType },
            { key: "c_tmonth", kind: "multi", label: "Travel month", options: opts(base, (e) => monthOf(e.travelDate)), get: (e) => monthOf(e.travelDate) },
            { key: "c_zone", kind: "multi", label: "Zone", options: opts(base, (e) => e.zones || []), get: (e) => (e.zones?.length ? e.zones : ["No zone"]) },
          ] },
          fto: { label: "Forwarded to", fields: [{ key: "c_fto", kind: "multi", label: "Forwarded to", search: true, options: opts(base, (e) => splitNames(e.fwdOut)), get: (e) => splitNames(e.fwdOut) }] },
          fby: { label: "Forwarded by", fields: [{ key: "c_fby", kind: "multi", label: "Forwarded by", search: true, options: opts(base, (e) => splitNames(e.fwdIn)), get: (e) => splitNames(e.fwdIn) }] },
          with: { label: "Handled by now", fields: [{ key: "c_with", kind: "multi", label: "Currently handled by", search: true, options: opts(base, ownerName), get: ownerName }] },
          value: { label: "Value", fields: [
            { key: "c_sales", kind: "multi", label: "Sales value", options: fixed([["yes", "Has sales value"], ["no", "No sales value"]]), get: (e) => (e.salesValue > 0 ? "yes" : "no") },
            { key: "c_canc", kind: "multi", label: "Cancellation charge", options: fixed([["yes", "Has cancellation charge"], ["no", "No cancellation charge"]]), get: (e) => (e.cancellationCharge > 0 ? "yes" : "no") },
          ] },
          stage: { label: "Stage", fields: [{ key: "c_st", kind: "multi", label: "Stage", options: FIT_CARDS.filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })), get: (e) => e.stage }] },
        };
  // Indha tab la kaattura columns mattum (filter apply aaga)
  const visibleCols =
    tab === "tickets" ? ["ticketNo", "ticket", "raisedBy", "raisedTo", "date", "status"]
      : tab === "bookings" ? ["tnr", "tour", ...(ALL ? ["by"] : []), "pax", "pay", "canc", "status"]
        : ["code", "name", "trip", ...(ALL ? ["with"] : view === "fwdBy" ? ["fto", "with"] : view === "fwdTo" ? ["fby", "with"] : ["with"]), "value", "stage"];
  const activeFields = visibleCols.flatMap((id) => COLS[id]?.fields || []);
  const localDay = (d) => { if (!d) return ""; const x = new Date(d); return isNaN(x) ? "" : x.toLocaleDateString("en-CA"); };
  const passCols = (r) => activeFields.every((f) => {
    if (f.kind === "date") {
      if (!cf.fromDate && !cf.toDate) return true;
      const day = localDay(f.get(r));
      return !!day && (!cf.fromDate || day >= cf.fromDate) && (!cf.toDate || day <= cf.toDate);
    }
    if (f.kind === "text") {
      const t = String(cf[f.key] || "").trim().toLowerCase();
      return !t || String(f.get(r) || "").toLowerCase().includes(t);
    }
    const want = String(cf[f.key] || "").split(",").map((x) => x.trim()).filter(Boolean);
    if (!want.length) return true;
    return [].concat(f.get(r)).some((v) => want.includes(String(v ?? "").trim()));
  });
  const applyCf = (o) => setCf((c) => ({ ...c, ...o }));
  const head = (id, className = "") => (
    <th key={id} className={`px-3 py-3 font-semibold ${className}`}>
      <ColumnFilter label={COLS[id].label} fields={COLS[id].fields} filters={cf} onApply={applyCf} />
    </th>
  );
  // Mobile — header illa, adhanaala filter chips
  const mobileFilters = (hideFrom = "md") => (
    <div className={`flex flex-wrap gap-1.5 border-b border-gray-100 px-4 py-2.5 ${hideFrom === "lg" ? "lg:hidden" : "md:hidden"}`}>
      {visibleCols.map((id) => <ColumnFilter key={id} variant="chip" label={COLS[id].label} fields={COLS[id].fields} filters={cf} onApply={applyCf} />)}
    </div>
  );
  const anyCol = Object.values(cf).some((v) => String(v || "").trim());
  // Cards + money — column filter apply aagi (card click / search illaama)
  const CB = base.filter(passCols);
  const tCount = (k) => (k ? CB.filter((t) => t.status === k).length : CB.length);
  const bCount = (k) => (k ? CB.filter((b) => b.state === k).length : CB.length);
  const fCount = (k) => (k ? CB.filter((e) => e.stage === k).length : CB.length);

  const rows =
    tab === "tickets" ? tBase.filter((t) => (!card || t.status === card) && passCols(t) && has(t.ticketNo, t.subject, t.tnr, t.raisedBy, t.raisedTo))
      : tab === "bookings" ? L.filter((b) => (!card || b.state === card) && passCols(b) && has(b.tnr, b.tour, b.customer, nameOf(b.empKey)))
        : fBase.filter((e) => (!card || e.stage === card) && passCols(e) && has(e.fitCode, e.name, e.destination));

  const inputCls = "rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100";
  const pill = (on) => `rounded-xl px-4 py-2 text-sm font-semibold ${on ? "bg-white text-green-700 shadow" : "text-gray-600 hover:text-gray-900"}`;

  return (
    <div className="w-full min-w-0 max-w-7xl flex-1 p-3 pt-16 sm:p-5 sm:pt-16 lg:pt-5">
      <div className="mb-5 text-center">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        <span className="mx-auto mt-3 block h-1 w-14 rounded-full bg-green-500" aria-hidden="true" />
      </div>

      {/* ── Employee + dates ── */}
      <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <label className="w-full text-xs font-semibold text-gray-600 sm:w-auto sm:min-w-[16rem] sm:flex-1">Employee
          <select value={emp} onChange={(e) => setEmp(e.target.value)} className={`mt-1 block w-full ${inputCls}`}>
            <option value="*">All employees</option>
            {employees.map((e) => (
              <option key={e.key} value={e.key}>{e.name}{e.employeeId ? ` (${e.employeeId})` : ""}{e.role ? ` · ${e.role}` : ""}{e.status !== "Active" ? ` · ${e.status}` : ""}</option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button key={p.key} type="button" onClick={() => { setPreset(p.key); setRange(p.range()); }}
              className={`rounded-full px-3 py-2 text-xs font-semibold ${preset === p.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
              {p.label}
            </button>
          ))}
        </div>
        <label className="min-w-[9rem] flex-1 text-xs font-semibold text-gray-600 sm:flex-none">From
          <input type="date" value={from} max={to || undefined} onChange={(e) => { setPreset(""); setRange([e.target.value, to]); }} className={`mt-1 block w-full ${inputCls}`} />
        </label>
        <label className="min-w-[9rem] flex-1 text-xs font-semibold text-gray-600 sm:flex-none">To
          <input type="date" value={to} min={from || undefined} onChange={(e) => { setPreset(""); setRange([from, e.target.value]); }} className={`mt-1 block w-full ${inputCls}`} />
        </label>
      </div>

      {!emp ? null : (
        <>
          {/* ── Who ── */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-gray-900">{ALL ? "All employees" : me?.name}{!ALL && me?.employeeId ? <span className="font-medium text-gray-500"> · {me.employeeId}</span> : null}</p>
              <p className="text-xs text-gray-500">{ALL ? "Pick an employee above to see only theirs" : `${me?.role || ""}${me?.status && me.status !== "Active" ? ` · ${me.status}` : ""}`} · {from ? fmtDate(from) : "All time"}{to ? ` – ${fmtDate(to)}` : ""}</p>
            </div>
            {tabs.length > 1 && (
              <div className="flex w-full gap-1 rounded-2xl bg-gray-100 p-1 sm:w-auto" role="tablist">
                {tabs.map((k) => (
                  <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`flex-1 sm:flex-none ${pill(tab === k)}`}>
                    {k === "tickets" ? "🎫 Tickets" : k === "bookings" ? "🧳 Tour bookings" : "✈️ FIT"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Views (ticket page / FIT page maadhiri) ── */}
          {!ALL && (tab === "tickets" || tab === "fit") && (
            <div className="mb-3 flex flex-wrap gap-1 rounded-2xl bg-gray-100 p-1 sm:inline-flex">
              {(tab === "tickets" ? TICKET_VIEWS : FIT_VIEWS).map((v) => (
                <button key={v.key} type="button" onClick={() => setView(v.key)} className={pill(view === v.key)}>{v.label}</button>
              ))}
            </div>
          )}
          {!ALL && tab === "fit" && (
            <p className="-mt-1 mb-3 text-xs text-gray-500">{FIT_VIEWS.find((v) => v.key === view)?.hint}</p>
          )}

          {/* ── Cards ── */}
          {loading || !list ? (
            <p className="py-10 text-center text-sm text-gray-500">Loading…</p>
          ) : (
            <>
              {tab === "tickets" && (
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {TICKET_CARDS.map((c) => <Card key={c.label} c={c} count={tCount(c.key)} active={card === c.key} onClick={() => setCard(c.key)} />)}
                </div>
              )}
              {tab === "bookings" && (
                <>
                  <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {BOOKING_CARDS.map((c) => <Card key={c.label} c={c} count={bCount(c.key)} active={card === c.key} onClick={() => setCard(c.key)} />)}
                  </div>
                  <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
                    <Money label="Advance received" value={sum(CB, (b) => (countsMoney(b) && b.advance?.paid ? b.advance.amount : 0))} sub={`${CB.filter((b) => countsMoney(b) && b.advance?.paid).length} bookings · Active + Completed`} tone="text-green-700" />
                    <Money label="Balance received" value={sum(CB, (b) => (countsMoney(b) && b.balance?.paid ? b.balance.amount : 0))} sub={`${CB.filter((b) => countsMoney(b) && b.balance?.paid).length} paid · ${CB.filter((b) => countsMoney(b) && !b.balance?.paid && !b.balance?.adjusted).length} pending`} tone="text-green-700" />
                    <Money label="GV cancellation" value={sum(CB, (b) => b.gvCancellation)} />
                    <Money label="IRCTC cancellation" value={sum(CB, (b) => b.irctcCancellation)} />
                    <Money label="Refund" value={sum(CB, (b) => b.refund)} />
                  </div>
                </>
              )}
              {tab === "fit" && (
                <>
                  <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                    {FIT_CARDS.map((c) => <Card key={c.label} c={c} count={fCount(c.key)} active={card === c.key} onClick={() => setCard(c.key)} />)}
                  </div>
                  <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <Money label="Sales value (accepted)" value={sum(CB.filter((e) => ["Accepted", "Closed"].includes(e.stage)), (e) => e.salesValue)} tone="text-green-700" />
                    <Money label="Cancellation charge" value={sum(CB, (e) => e.cancellationCharge)} sub={`${CB.filter((e) => e.cancellationCharge > 0).length} enquiries`} tone="text-rose-700" />
                  </div>
                </>
              )}

              {/* ── List ── */}
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-4 py-3">
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "tickets" ? "Search ticket no, subject, TNR" : tab === "bookings" ? "Search TNR, tour, customer" : "Search FIT code, name, place"} className={`w-full min-w-0 flex-1 sm:min-w-[14rem] ${inputCls}`} />
                  {(card || q || anyCol) && <button type="button" onClick={() => { setCard(""); setQ(""); setCf({}); }} className="text-xs font-semibold text-red-600 hover:underline">Clear all</button>}
                  <span className="text-xs text-gray-500">Showing {rows.length}</span>
                </div>
                {rows.length === 0 ? (
                  <p className="px-4 py-10 text-center text-sm text-gray-500">Nothing here.</p>
                ) : tab === "tickets" ? (
                  <>
                    {mobileFilters()}
                    {/* Mobile / tablet — cards */}
                    <ul className="divide-y divide-gray-100 md:hidden">
                      {rows.map((t) => (
                        <li key={t._id} className="px-4 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800">{t.ticketNo || "—"}</span>
                            <Pill s={t.status} />
                          </div>
                          <p className="mt-1.5 font-semibold text-gray-900">{t.subject}</p>
                          <p className="text-xs text-gray-500">{t.queryType}{t.tnr ? ` · TNR ${t.tnr}` : ""}</p>
                          <p className="mt-1 text-xs text-gray-600"><span className="font-semibold">{t.raisedBy || "—"}</span> → <span className="font-semibold">{t.raisedTo || "—"}</span> · {fmtDate(t.createdAt)}</p>
                        </li>
                      ))}
                    </ul>
                    {/* Desktop — table */}
                    <div className="hidden md:block">
                      <table className="w-full table-fixed text-left text-sm">
                        <thead className="bg-blue-50 text-xs text-gray-600"><tr>
                          {head("ticketNo", "w-36")}{head("ticket")}{head("raisedBy", "w-[19%]")}
                          {head("raisedTo", "w-[17%]")}{head("date", "w-36")}{head("status", "w-32")}
                        </tr></thead>
                        <tbody>
                          {rows.map((t) => (
                            <tr key={t._id} className="border-t border-gray-100 align-top">
                              <td className="px-4 py-2.5"><span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800">{t.ticketNo || "—"}</span></td>
                              <td className="px-4 py-2.5"><p className="truncate font-semibold text-gray-900">{t.subject}</p><p className="truncate text-xs text-gray-500">{t.queryType}{t.tnr ? ` · TNR ${t.tnr}` : ""}</p></td>
                              <td className="truncate px-3 py-2.5 text-xs font-semibold" title={t.raisedBy}>{t.raisedBy || "—"}</td>
                              <td className="truncate px-3 py-2.5 text-xs" title={t.raisedTo}>{t.raisedTo || "—"}</td>
                              <td className="px-4 py-2.5 text-xs">{fmtDate(t.createdAt)}</td>
                              <td className="px-4 py-2.5"><Pill s={t.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : tab === "bookings" ? (
                  <>
                    {mobileFilters("lg")}
                    {/* Mobile / tablet — cards */}
                    <ul className="divide-y divide-gray-100 lg:hidden">
                      {rows.map((b, i) => (
                        <li key={`${b.tnr}-${i}`} className="px-4 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-sm font-bold text-amber-800">{b.tnr || "—"}</span>
                            <span className="flex items-center gap-1.5">{b.requestedTr > 0 && <span className="text-[11px] font-semibold text-orange-700">{b.requestedTr} cancel request</span>}<Pill s={b.state} /></span>
                          </div>
                          <p className="mt-1 font-semibold text-gray-900">{b.tour}</p>
                          <p className="text-xs text-gray-500">{b.customer || "—"} · {paxOf(b).a} pax{paxExtra(paxOf(b)) ? ` (${paxExtra(paxOf(b))})` : ""} · {fmtDate(b.bookingDate)}{ALL ? ` · ${nameOf(b.empKey)}` : ""}</p>
                          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl bg-gray-50 p-2.5 text-xs sm:grid-cols-3">
                            <MoneyLine label="Advance" v={b.advance} />
                            <MoneyLine label="Balance" v={b.balance} />
                            <Kv label="GV cancel" v={b.gvCancellation} />
                            <Kv label="IRCTC cancel" v={b.irctcCancellation} />
                            <Kv label="Refund" v={b.refund} />
                          </div>
                        </li>
                      ))}
                    </ul>
                    {/* Desktop — compact table (Advance + Balance oru column; GV / IRCTC / Refund oru column) */}
                    <div className="hidden lg:block">
                      <table className="w-full table-fixed text-left text-sm">
                        <thead className="bg-blue-50 text-xs text-gray-600"><tr>
                          {head("tnr", "w-28")}
                          {head("tour")}
                          {ALL && head("by", "w-[14%]")}
                          {head("pax", "w-24")}
                          {head("pay", "w-[20%]")}
                          {head("canc", "w-[16%]")}
                          {head("status", "w-36")}
                        </tr></thead>
                        <tbody>
                          {rows.map((b, i) => (
                            <tr key={`${b.tnr}-${i}`} className="border-t border-gray-100 align-top">
                              <td className="px-3 py-2.5"><p className="font-mono text-xs font-bold text-amber-800">{b.tnr || "—"}</p><p className="text-[11px] text-gray-500">{fmtDate(b.bookingDate)}</p></td>
                              <td className="px-3 py-2.5"><p className="truncate font-semibold text-gray-900" title={b.tour}>{b.tour}</p><p className="truncate text-xs text-gray-500" title={b.customer}>{b.customer || "—"}</p></td>
                              {ALL && <td className="truncate px-3 py-2.5 text-xs font-semibold" title={nameOf(b.empKey)}>{nameOf(b.empKey)}</td>}
                              <td className="px-3 py-2.5"><p className="font-semibold">{paxOf(b).a}</p>{paxOf(b).c > 0 && <p className="text-[11px] text-amber-700">{paxOf(b).c} cancelled</p>}{paxOf(b).r > 0 && <p className="text-[11px] text-red-600">{paxOf(b).r} rejected</p>}</td>
                              <td className="px-3 py-2.5 text-xs"><MoneyLine label="Adv" v={b.advance} /><MoneyLine label="Bal" v={b.balance} /></td>
                              <td className="px-3 py-2.5 text-xs">
                                {b.gvCancellation || b.irctcCancellation || b.refund ? (
                                  <><Kv label="GV" v={b.gvCancellation} /><Kv label="IRCTC" v={b.irctcCancellation} /><Kv label="Refund" v={b.refund} /></>
                                ) : <span className="text-gray-400">—</span>}
                              </td>
                              <td className="px-3 py-2.5"><Pill s={b.state} />{b.requestedTr > 0 && <p className="mt-1 text-[11px] font-semibold text-orange-700">{b.requestedTr} cancel request</p>}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Total — ellaa screen ku um */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-t-2 border-gray-200 bg-gray-50 px-4 py-3 text-xs sm:grid-cols-3 lg:grid-cols-6">
                      <p className="col-span-2 text-sm font-bold sm:col-span-3 lg:col-span-1">Total · {rows.length} bookings<span className="block text-xs font-semibold text-gray-600">{sum(rows, (b) => paxOf(b).a)} active pax · {sum(rows, (b) => paxOf(b).c)} cancelled · {sum(rows, (b) => paxOf(b).r)} rejected</span></p>
                      <Kv label="Advance paid" v={sum(rows, (b) => (countsMoney(b) && b.advance?.paid ? b.advance.amount : 0))} bold />
                      <Kv label="Balance paid" v={sum(rows, (b) => (countsMoney(b) && b.balance?.paid ? b.balance.amount : 0))} bold />
                      <Kv label="GV cancel" v={sum(rows, (b) => b.gvCancellation)} bold />
                      <Kv label="IRCTC cancel" v={sum(rows, (b) => b.irctcCancellation)} bold />
                      <Kv label="Refund" v={sum(rows, (b) => b.refund)} bold />
                    </div>
                  </>
                ) : (
                  <>
                    {mobileFilters("lg")}
                    {/* Mobile / tablet — cards */}
                    <ul className="divide-y divide-gray-100 lg:hidden">
                      {rows.map((e) => (
                        <li key={e._id} className="px-4 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800">{e.fitCode || "—"}</span>
                            <StagePill s={e.stage} />
                          </div>
                          <div className="mt-1.5 flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-gray-900">{e.name}</p>
                              {e.mobile && <p className="text-xs text-gray-500">📞 {e.mobile}</p>}
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-gray-600">Raised by <b className="text-gray-900">{raiserName(e)}</b></p>
                          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl bg-gray-50 p-2.5 text-xs sm:grid-cols-3">
                            <p><span className="text-gray-500">Destination </span><b className="text-purple-800">{e.destination || "—"}</b>{duration(e) ? ` · ${duration(e)}` : ""}</p>
                            <p><span className="text-gray-500">Travel </span><b>{e.travelDate ? fmtDate(e.travelDate) : "—"}</b></p>
                            <p><span className="text-gray-500">Enquired </span>{fmtDate(e.createdAt)}</p>
                            {e.pickupDate && <p><span className="text-gray-500">Pickup </span><b className="text-red-600">{fmtDate(e.pickupDate)}</b></p>}
                            {e.salesValue > 0 && <p><span className="text-gray-500">Sales </span><b className="text-green-700">{inr(e.salesValue)}</b></p>}
                            {e.cancellationCharge > 0 && <p><span className="text-gray-500">Cancellation </span><b className="text-rose-700">{inr(e.cancellationCharge)}</b></p>}
                            {e.pax > 0 && <p><span className="text-gray-500">Pax </span>{e.pax}</p>}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                            <ZoneChips zones={e.zones} />
                            {!ALL && view === "fwdBy" && <span>Forwarded to <b>{fwdNames(e.fwdOut)}</b></span>}
                            {!ALL && view === "fwdTo" && <span>Forwarded by <b>{fwdNames(e.fwdIn)}</b></span>}
                            {fitExtra.length > 0 && <span>Currently handled by <b>{ownerName(e)}</b></span>}
                            {e.lastBy && <span className="text-gray-500">{ACTION_LABEL[e.lastBy.action] || "Updated"} by <b className="text-gray-800">{e.lastBy.key ? nameOf(e.lastBy.key) : e.lastBy.name || "—"}</b></span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                    {/* Desktop — table */}
                    <div className="hidden lg:block">
                      <table className="w-full table-fixed text-left text-sm">
                        <thead className="bg-blue-50 text-xs text-gray-600"><tr>
                          {head("code", "w-[15%]")}{head("name", "w-[17%]")}{head("trip")}
                          {visibleCols.filter((id) => ["fto", "fby", "with"].includes(id)).map((id) => head(id, "w-[13%]"))}
                          {head("value", "w-[11%]")}{head("stage", "w-[17%]")}
                        </tr></thead>
                        <tbody>
                          {rows.map((e) => (
                            <tr key={e._id} className="border-t border-gray-100 align-top hover:bg-gray-50/60">
                              <td className="px-3 py-3">
                                <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800">{e.fitCode || "—"}</span>
                                <p className="mt-1.5 text-[11px] text-gray-500">{fmtDate(e.createdAt)}</p>
                                <p className="truncate text-[11px] text-gray-500" title={raiserName(e)}>by <b className="text-gray-700">{raiserName(e)}</b></p>
                              </td>
                              <td className="px-3 py-3">
                                <p className="truncate font-semibold text-gray-900" title={e.name}>{e.name || "—"}</p>
                                <p className="truncate text-xs text-gray-500">{[e.mobile, e.pax ? `${e.pax} pax` : ""].filter(Boolean).join(" · ")}</p>
                              </td>
                              <td className="px-3 py-3">
                                <p className="truncate"><b className="text-purple-800">{e.destination || "—"}</b><span className="text-xs text-gray-500">{duration(e) ? ` · ${duration(e)}` : ""}</span></p>
                                <p className="truncate text-xs text-gray-600">✈️ {e.travelDate ? fmtDate(e.travelDate) : "No date"}{e.pickupDate && <span className="font-semibold text-red-600"> · 🚌 {fmtDate(e.pickupDate)}</span>}</p>
                                {e.zones?.length > 0 && <div className="mt-1"><ZoneChips zones={e.zones} /></div>}
                              </td>
                              {!ALL && view === "fwdBy" && <td className="truncate px-3 py-3 text-xs font-semibold">{fwdNames(e.fwdOut)}</td>}
                              {!ALL && view === "fwdTo" && <td className="truncate px-3 py-3 text-xs font-semibold">{fwdNames(e.fwdIn)}</td>}
                              {fitExtra.length > 0 && <td className={`truncate px-3 py-3 text-xs font-semibold ${e.ownerKey ? "text-gray-900" : "text-gray-400"}`} title={ownerName(e)}>{ownerName(e)}</td>}
                              <td className="px-3 py-3 text-xs">
                                {e.salesValue || e.cancellationCharge ? (
                                  <>
                                    {e.salesValue > 0 && <p className="font-semibold text-green-700">{inr(e.salesValue)}</p>}
                                    {e.cancellationCharge > 0 && <p className="font-semibold text-rose-700">−{inr(e.cancellationCharge)} <span className="font-normal text-gray-500">cancel</span></p>}
                                  </>
                                ) : <span className="text-gray-400">—</span>}
                              </td>
                              <td className="px-3 py-3">
                                <StagePill s={e.stage} />
                                {e.lastBy && (
                                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-gray-500" title={`${ACTION_LABEL[e.lastBy.action] || "Updated"} by ${e.lastBy.key ? nameOf(e.lastBy.key) : e.lastBy.name || "—"}`}>
                                    {ACTION_LABEL[e.lastBy.action] || "Updated"} by <b className="text-gray-700">{e.lastBy.key ? nameOf(e.lastBy.key) : e.lastBy.name || "—"}</b> · {fmtDate(e.lastBy.at)}
                                  </p>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2 border-t-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold">
                      <span>Total · {rows.length} enquiries</span><span className="flex flex-wrap gap-x-4"><span className="text-green-700">Sales value {inr(sum(rows, (e) => e.salesValue))}</span><span className="text-rose-700">Cancellation {inr(sum(rows, (e) => e.cancellationCharge))}</span></span>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default EmployeePerformance;
