
// // // // // ════════════════════════════════════════════════════════════════
// // // // //  EmployeePerformance.jsx — Admin panel (CEO tab) — SIMPLE scorecard
// // // // //  Mela oru employee select → avangaludhu mattum:
// // // // //    Tickets  : Raise / View Tickets page la varra adhe status cards + tabs
// // // // //    Bookings : Tour Bookings maadhiri status + amount cards
// // // // //    FIT      : FIT Enquiries page la varra stage cards (FitPerformance.jsx la)
// // // // //  Card click pannaa keezha list andha status ku filter aagum.
// // // // //  API: GET /api/touradmin/<api>?tab=&employee=&from=&to=
// // // // // ════════════════════════════════════════════════════════════════
// // // // import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
// // // // import axios from "axios";
// // // // import { ColumnFilter } from "../../components/TicketFilters"; // ticket page la irukkura header funnel filter
// // // // import { toast } from "react-toastify";
// // // // import { TourAdminContext } from "../../context/TourAdminContext"; // ⚙️ path check pannunga

// // // // // ─── Dates ───
// // // // const pad = (n) => String(n).padStart(2, "0");
// // // // const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// // // // const PRESETS = [
// // // //   { key: "all", label: "All time", range: () => ["", ""] },
// // // //   { key: "month", label: "This month", range: () => { const t = new Date(); return [ymd(new Date(t.getFullYear(), t.getMonth(), 1)), ymd(t)]; } },
// // // //   { key: "last", label: "Last month", range: () => { const t = new Date(); return [ymd(new Date(t.getFullYear(), t.getMonth() - 1, 1)), ymd(new Date(t.getFullYear(), t.getMonth(), 0))]; } },
// // // //   { key: "year", label: "This year", range: () => { const t = new Date(); return [ymd(new Date(t.getFullYear(), 0, 1)), ymd(t)]; } },
// // // // ];
// // // // const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");
// // // // const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

// // // // // ─── Status cards (ticket page / FIT page la irukkura adhe colours) ───
// // // // const TICKET_CARDS = [
// // // //   { key: "", label: "Total", cls: "border-slate-300 text-slate-900" },
// // // //   { key: "open", label: "Open", cls: "border-sky-300 text-sky-800" },
// // // //   { key: "pickup", label: "Picked up", cls: "border-violet-300 text-violet-800" },
// // // //   { key: "processing", label: "Processing", cls: "border-amber-300 text-amber-800" },
// // // //   { key: "close", label: "Closed", cls: "border-green-400 text-green-800" },
// // // //   { key: "reject", label: "Rejected", cls: "border-red-300 text-red-700" },
// // // // ];
// // // // const TICKET_VIEWS = [
// // // //   { key: "Assigned", label: "Assigned to them" },
// // // //   { key: "Raised", label: "Raised by them" },
// // // //   { key: "Forwarded", label: "Forwarded by them" },
// // // // ];
// // // // const BOOKING_CARDS = [
// // // //   { key: "", label: "Total bookings", cls: "border-slate-300 text-slate-900" },
// // // //   { key: "unverified", label: "Unverified", cls: "border-gray-400 text-gray-700" },
// // // //   { key: "active", label: "Active (Advance only paid)", cls: "border-green-400 text-green-800" },
// // // //   { key: "completed", label: "Completed (Booking completed)", cls: "border-yellow-400 text-yellow-800" },
// // // //   { key: "cancelled", label: "Fully cancelled", cls: "border-red-300 text-red-700" },
// // // //   { key: "tripCancelled", label: "Trip cancelled", cls: "border-rose-300 text-rose-700" },
// // // //   { key: "rejected", label: "Rejected", cls: "border-purple-300 text-purple-700" },
// // // // ];
// // // // const FIT_CARDS = [
// // // //   { key: "", label: "Total", cls: "border-slate-300 text-slate-900" },
// // // //   { key: "Pending", label: "Pending", cls: "border-orange-300 text-orange-800" },
// // // //   { key: "Picked up", label: "Pickup", cls: "border-sky-300 text-sky-800" },
// // // //   { key: "Rate shared", label: "Rate shared", cls: "border-yellow-300 text-yellow-800" },
// // // //   { key: "Accepted", label: "Accepted", cls: "border-green-400 text-green-800" },
// // // //   { key: "Closed", label: "Closed", cls: "border-slate-400 text-slate-700" },
// // // //   { key: "Cancelled", label: "Cancelled", cls: "border-rose-300 text-rose-800" },
// // // //   { key: "Rejected", label: "Rejected", cls: "border-red-300 text-red-700" },
// // // // ];
// // // // const FIT_VIEWS = [
// // // //   { key: "now", label: "Currently handling", hint: "Enquiries with this employee right now." },
// // // //   { key: "fwdBy", label: "Forwarded by them", hint: "Enquiries this employee forwarded to someone else." },
// // // //   { key: "fwdTo", label: "Forwarded to them", hint: "Enquiries someone else forwarded to this employee." },
// // // // ];
// // // // const STATUS_PILL = {
// // // //   open: ["Open", "bg-blue-50 text-blue-700"], pickup: ["Picked up", "bg-violet-50 text-violet-700"], processing: ["Processing", "bg-amber-50 text-amber-800"],
// // // //   close: ["Closed", "bg-green-50 text-green-700"], reject: ["Rejected", "bg-red-50 text-red-700"],
// // // //   active: ["Active", "bg-green-50 text-green-700"], unverified: ["Unverified", "bg-gray-100 text-gray-700"], completed: ["Completed", "bg-yellow-50 text-yellow-800"],
// // // //   cancelRequested: ["Cancellation requested", "bg-orange-50 text-orange-700"], cancelled: ["Fully cancelled", "bg-red-50 text-red-700"], tripCancelled: ["Trip cancelled", "bg-rose-50 text-rose-700"], rejected: ["Rejected", "bg-purple-50 text-purple-700"],
// // // // };
// // // // // Pax — Active (cancellation request um serthu) / Cancelled (trip cancel um) / Rejected thani thani
// // // // const paxOf = (b) => {
// // // //   const c = b.cancelledTr || 0, r = b.rejectedTr || 0;
// // // //   const a = b.activeTr != null ? (b.activeTr || 0) + (b.requestedTr || 0) : Math.max(0, (b.travellers || 0) - c - r);
// // // //   return { a, c, r };
// // // // };
// // // // const paxExtra = ({ c, r }) => [c ? `${c} cancelled` : "", r ? `${r} rejected` : ""].filter(Boolean).join(" · ");
// // // // // FIT — stage pill + "by …" (FIT Enquiries page maadhiri)
// // // // const STAGE_PILL = {
// // // //   Pending: "bg-gray-100 text-gray-700", "Picked up": "bg-sky-50 text-sky-700", "Rate shared": "bg-yellow-50 text-yellow-800",
// // // //   Accepted: "bg-green-50 text-green-700", Closed: "bg-slate-100 text-slate-700", Cancelled: "bg-rose-50 text-rose-700", Rejected: "bg-red-50 text-red-700",
// // // // };
// // // // const StagePill = ({ s }) => (
// // // //   <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${STAGE_PILL[s] || "bg-gray-100 text-gray-700"}`}>
// // // //     <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{s}
// // // //   </span>
// // // // );
// // // // const ACTION_LABEL = { created: "Created", pickedUp: "Picked up", rateShared: "Rate shared", accepted: "Accepted", closed: "Closed", cancelled: "Cancelled", rejected: "Rejected", reopened: "Reopened", forwarded: "Forwarded" };
// // // // const duration = (e) => (e.days ? `${e.days}D${e.nights != null ? `/${e.nights}N` : ""}` : "");
// // // // const ZoneChips = ({ zones }) => (zones?.length
// // // //   ? <div className="flex flex-wrap gap-1">{zones.map((z) => <span key={z} className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800">{z}</span>)}</div>
// // // //   : <span className="text-gray-400">—</span>);
// // // // // Kaasu received — Active bookings mattum
// // // // const countsMoney = (b) => b.state === "active" || b.state === "completed"; // Active + Completed mattum
// // // // const Pill = ({ s }) => {
// // // //   const [t, c] = STATUS_PILL[s] || [s, "bg-gray-100 text-gray-700"];
// // // //   return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${c}`}>{t}</span>;
// // // // };

// // // // // Clickable count card
// // // // const Card = ({ c, count, active, onClick, money }) => (
// // // //   <button type="button" onClick={onClick} aria-pressed={active}
// // // //     className={`rounded-2xl border-2 bg-white p-3 text-left transition ${active ? `${c.cls} shadow-md ring-2 ring-offset-1 ring-current` : `border-gray-200 hover:-translate-y-0.5 hover:shadow ${c.cls.split(" ").filter((x) => x.startsWith("text-")).join(" ")}`}`}>
// // // //     <p className="text-2xl font-bold tabular-nums">{money ? inr(count) : count}</p>
// // // //     <p className="mt-0.5 text-xs font-semibold text-gray-600">{c.label}</p>
// // // //   </button>
// // // // );
// // // // // Advance / Balance — amount + Paid / Pending (Cancellation la adjust aanaa adhu)
// // // // const MoneyLine = ({ label, v }) => (
// // // //   <p className="flex flex-wrap items-baseline gap-x-1">
// // // //     <span className="text-gray-500">{label}</span>
// // // //     {v?.adjusted ? <span className="text-gray-500">Adjusted in cancellation</span>
// // // //       : <><span className="font-semibold tabular-nums text-gray-900">{inr(v?.amount)}</span><span className={`font-semibold ${v?.paid ? "text-green-700" : "text-gray-400"}`}>{v?.paid ? "Paid" : "Pending"}</span></>}
// // // //   </p>
// // // // );
// // // // const Kv = ({ label, v, bold }) => (
// // // //   <p className="flex flex-wrap items-baseline gap-x-1">
// // // //     <span className="text-gray-500">{label}</span>
// // // //     <span className={`tabular-nums ${bold ? "font-bold text-gray-900" : "font-semibold text-gray-800"}`}>{v ? inr(v) : "—"}</span>
// // // //   </p>
// // // // );
// // // // const Money = ({ label, value, sub, tone = "text-gray-900" }) => (
// // // //   <div className="rounded-2xl border border-gray-200 bg-white p-3">
// // // //     <p className={`text-xl font-bold tabular-nums ${tone}`}>{inr(value)}</p>
// // // //     <p className="mt-0.5 text-xs font-semibold text-gray-600">{label}</p>
// // // //     {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
// // // //   </div>
// // // // );

// // // // // ════════════════════════════════════════════════════════════════
// // // // const EmployeePerformance = ({
// // // //   tabs = ["tickets", "bookings"],
// // // //   api = "employee-performance",
// // // //   title = "Employee Performance",
// // // //   subtitle = "All employees together — pick one employee to see only theirs.",
// // // // }) => {
// // // //   const { aToken, backendUrl } = useContext(TourAdminContext);
// // // //   const [tab, setTab] = useState(tabs[0]);
// // // //   const [preset, setPreset] = useState("all");
// // // //   const [[from, to], setRange] = useState(["", ""]);
// // // //   const [employees, setEmployees] = useState([]);
// // // //   const [allEmps, setAllEmps] = useState(new Map()); // key → name (Tour admin / Website kooda)
// // // //   const [emp, setEmp] = useState("*"); // "*" = ellaa employees um (Tour admin page maadhiri), illa "staff:<id>"
// // // //   const [list, setList] = useState(null);
// // // //   const [loading, setLoading] = useState(false);
// // // //   const [view, setView] = useState(tabs[0] === "fit" ? "now" : "Assigned"); // ticket / FIT view
// // // //   const [card, setCard] = useState(""); // card filter
// // // //   const [q, setQ] = useState("");

// // // //   const get = useCallback(
// // // //     async (params) => {
// // // //       const { data } = await axios.get(`${backendUrl}/api/touradmin/${api}`, { headers: { aToken }, params });
// // // //       if (!data?.success) throw new Error(data?.message || "Failed to load");
// // // //       return data;
// // // //     },
// // // //     [backendUrl, aToken, api],
// // // //   );

// // // //   // Employee list (staff mattum)
// // // //   useEffect(() => {
// // // //     get({ tab: tabs[0], from: "2999-01-01" }) // list mattum venum — data illaadha date
// // // //       .then((d) => setEmployees((d.employees || []).filter((e) => e.type === "staff" && e.staffId).sort((a, b) => (a.status === "Active" ? 0 : 1) - (b.status === "Active" ? 0 : 1) || a.name.localeCompare(b.name))))
// // // //       .catch((err) => toast.error(err.response?.data?.message || err.message));
// // // //   }, [get]); // eslint-disable-line react-hooks/exhaustive-deps

// // // //   const reqId = useRef(0); // late-aa vandha pazhaya response (vera tab / employee) list-a maathakoodaadhu
// // // //   const load = useCallback(async () => {
// // // //     const id = ++reqId.current;
// // // //     if (!emp) { setList(null); return; }
// // // //     setLoading(true);
// // // //     setList(null);
// // // //     try {
// // // //       const d = await get({ tab, employee: emp, from: from || undefined, to: to || undefined });
// // // //       if (id !== reqId.current) return;
// // // //       setList(d[tab]?.details || []);
// // // //       setAllEmps(new Map((d.employees || []).map((e) => [e.key, e.name])));
// // // //     } catch (err) {
// // // //       if (id !== reqId.current) return;
// // // //       toast.error(err.response?.data?.message || err.message);
// // // //       setList([]);
// // // //     } finally {
// // // //       if (id === reqId.current) setLoading(false);
// // // //     }
// // // //   }, [get, tab, emp, from, to]);
// // // //   useEffect(() => { load(); }, [load]);
// // // //   const [cf, setCf] = useState({}); // column filters { key: value }
// // // //   useEffect(() => { setCard(""); setQ(""); setCf({}); }, [tab, emp, view]);
// // // //   useEffect(() => { setView(tab === "fit" ? "now" : "Assigned"); }, [tab]);

// // // //   const me = employees.find((e) => e.key === emp);
// // // //   const ALL = emp === "*";
// // // //   const nameOf = (k) => allEmps.get(k) || (k ? k.replace(/^name:/, "") : "—");
// // // //   const L = list || [];

// // // //   // ─── Tickets ───
// // // //   const tBase = useMemo(() => (tab === "tickets" ? (ALL ? L : L.filter((t) => (t.roles || []).includes(view))) : []), [L, tab, view, ALL]);

// // // //   // ─── Bookings ───

// // // //   const sum = (arr, fn) => arr.reduce((a, x) => a + (Number(fn(x)) || 0), 0);
// // // //   // ─── FIT ───
// // // //   const fBase = useMemo(() => {
// // // //     if (tab !== "fit") return [];
// // // //     if (ALL) return L;
// // // //     if (view === "fwdBy") return L.filter((e) => e.fwdOut?.length);
// // // //     if (view === "fwdTo") return L.filter((e) => e.fwdIn?.length);
// // // //     return L.filter((e) => e.withMe);
// // // //   }, [L, tab, view, ALL]);
// // // //   const fwdNames = (arr) => [...new Set((arr || []).map((f) => (f.key ? nameOf(f.key) : f.label) || "—"))].join(", ");
// // // //   const fitExtra = ALL ? ["With"] : view === "fwdBy" ? ["Forwarded to", "Now with"] : view === "fwdTo" ? ["Forwarded by", "Now with"] : ["Now with"]; // "Handled by now" column eppavum


// // // //   // List — card + search filter
// // // //   const s = q.trim().toLowerCase();
// // // //   const has = (...xs) => !s || xs.some((x) => String(x || "").toLowerCase().includes(s));
// // // //   // ─── Column filters — ticket page maadhiri header la funnel (ColumnFilter) ───
// // // //   // Ovvoru field: kind multi (comma string) / text / date + get(row) → value (or array)
// // // //   const opts = (arr, fn) => [...new Set(arr.flatMap((x) => [].concat(fn(x))).map((v) => String(v ?? "").trim()).filter(Boolean))]
// // // //     .sort((x, y) => x.localeCompare(y)).map((v) => ({ value: v, label: v }));
// // // //   const fixed = (pairs) => pairs.map(([value, label]) => ({ value, label }));
// // // //   const base = tab === "tickets" ? tBase : tab === "bookings" ? L : fBase;
// // // //   const paxTags = (b) => { const p = paxOf(b); return [p.c ? "c" : "", p.r ? "r" : "", !p.c && !p.r ? "none" : ""].filter(Boolean); };
// // // //   const cancTags = (b) => { const t = [b.gvCancellation > 0 && "gv", b.irctcCancellation > 0 && "irctc", b.refund > 0 && "refund"].filter(Boolean); return t.length ? t : ["none"]; };
// // // //   const monthOf = (d) => { if (!d) return "No date"; const x = new Date(d); return isNaN(x) ? "No date" : x.toLocaleDateString("en-IN", { month: "short", year: "numeric" }); };
// // // //   const ownerName = (e) => (e.ownerKey ? nameOf(e.ownerKey) : "Not picked yet");
// // // //   const raiserName = (e) => (e.raisedByWho?.key ? nameOf(e.raisedByWho.key) : e.raisedByWho?.name || "—");
// // // //   const splitNames = (arr) => fwdNames(arr).split(", ").filter(Boolean);
// // // //   const COLS =
// // // //     tab === "tickets" ? {
// // // //       ticketNo: { label: "Ticket no", fields: [{ key: "c_tno", kind: "text", label: "Ticket no contains", placeholder: "e.g. GVTKT033", get: (t) => t.ticketNo }] },
// // // //       ticket: {
// // // //         label: "Ticket", fields: [
// // // //           { key: "c_subj", kind: "text", label: "Subject / TNR contains", placeholder: "e.g. Advance or XQ08ZT", get: (t) => `${t.subject || ""} ${t.tnr || ""}` },
// // // //           { key: "c_type", kind: "multi", label: "Ticket type", options: opts(base, (t) => t.queryType), get: (t) => t.queryType },
// // // //         ]
// // // //       },
// // // //       raisedBy: { label: "Raised by", fields: [{ key: "c_by", kind: "multi", label: "Raised by", search: true, options: opts(base, (t) => t.raisedBy), get: (t) => t.raisedBy }] },
// // // //       raisedTo: { label: "Raised to", fields: [{ key: "c_to", kind: "multi", label: "Raised to", search: true, options: opts(base, (t) => t.raisedTo), get: (t) => t.raisedTo }] },
// // // //       date: { label: "Raised on", fields: [{ key: "date", kind: "date", label: "Raised on", get: (t) => t.createdAt }] },
// // // //       status: { label: "Status", fields: [{ key: "c_st", kind: "multi", label: "Status", options: TICKET_CARDS.filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })), get: (t) => t.status }] },
// // // //     }
// // // //       : tab === "bookings" ? {
// // // //         tnr: {
// // // //           label: "TNR", fields: [
// // // //             { key: "c_tnr", kind: "text", label: "TNR contains", placeholder: "e.g. UF08IX", get: (b) => b.tnr },
// // // //             { key: "date", kind: "date", label: "Booked on", get: (b) => b.bookingDate },
// // // //           ]
// // // //         },
// // // //         tour: {
// // // //           label: "Tour / Customer", fields: [
// // // //             { key: "c_tour", kind: "multi", label: "Tour", search: true, options: opts(base, (b) => b.tour), get: (b) => b.tour },
// // // //             { key: "c_cust", kind: "text", label: "Customer contains", placeholder: "Customer name", get: (b) => b.customer },
// // // //           ]
// // // //         },
// // // //         by: { label: "Booked by", fields: [{ key: "c_by", kind: "multi", label: "Booked by", search: true, options: opts(base, (b) => nameOf(b.empKey)), get: (b) => nameOf(b.empKey) }] },
// // // //         pax: { label: "Pax", fields: [{ key: "c_pax", kind: "multi", label: "Pax", options: fixed([["c", "Has cancelled pax"], ["r", "Has rejected pax"], ["none", "No cancelled / rejected"]]), get: paxTags }] },
// // // //         pay: {
// // // //           label: "Advance / Balance", fields: [
// // // //             { key: "c_adv", kind: "multi", label: "Advance", options: fixed([["paid", "Paid"], ["pending", "Pending"]]), get: (b) => (b.advance?.paid ? "paid" : "pending") },
// // // //             { key: "c_bal", kind: "multi", label: "Balance", options: fixed([["paid", "Paid"], ["pending", "Pending"], ["adjusted", "Adjusted in cancellation"]]), get: (b) => (b.balance?.adjusted ? "adjusted" : b.balance?.paid ? "paid" : "pending") },
// // // //           ]
// // // //         },
// // // //         canc: { label: "Cancellation", fields: [{ key: "c_canc", kind: "multi", label: "Cancellation", options: fixed([["gv", "Has GV"], ["irctc", "Has IRCTC"], ["refund", "Has refund"], ["none", "No cancellation"]]), get: cancTags }] },
// // // //         status: { label: "Status", fields: [{ key: "c_st", kind: "multi", label: "Status", options: BOOKING_CARDS.filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })), get: (b) => b.state }] },
// // // //       }
// // // //         : {
// // // //           code: {
// // // //             label: "Enquiry", fields: [
// // // //               { key: "c_code", kind: "text", label: "FIT code contains", placeholder: "e.g. GVFIT0030", get: (e) => e.fitCode },
// // // //               { key: "date", kind: "date", label: "Enquired on", get: (e) => e.createdAt },
// // // //               { key: "c_raised", kind: "multi", label: "Raised by", search: true, options: opts(base, raiserName), get: raiserName },
// // // //             ]
// // // //           },
// // // //           name: {
// // // //             label: "Customer", fields: [
// // // //               { key: "c_name", kind: "text", label: "Name / mobile contains", placeholder: "Name or mobile", get: (e) => `${e.name || ""} ${e.mobile || ""}` },
// // // //             ]
// // // //           },
// // // //           trip: {
// // // //             label: "Trip", fields: [
// // // //               { key: "c_dest", kind: "multi", label: "Destination", search: true, options: opts(base, (e) => e.destination), get: (e) => String(e.destination || "").trim() },
// // // //               { key: "c_ttype", kind: "multi", label: "Tour type", options: opts(base, (e) => e.tourType), get: (e) => e.tourType },
// // // //               { key: "c_tmonth", kind: "multi", label: "Travel month", options: opts(base, (e) => monthOf(e.travelDate)), get: (e) => monthOf(e.travelDate) },
// // // //               { key: "c_zone", kind: "multi", label: "Zone", options: opts(base, (e) => e.zones || []), get: (e) => (e.zones?.length ? e.zones : ["No zone"]) },
// // // //             ]
// // // //           },
// // // //           fto: { label: "Forwarded to", fields: [{ key: "c_fto", kind: "multi", label: "Forwarded to", search: true, options: opts(base, (e) => splitNames(e.fwdOut)), get: (e) => splitNames(e.fwdOut) }] },
// // // //           fby: { label: "Forwarded by", fields: [{ key: "c_fby", kind: "multi", label: "Forwarded by", search: true, options: opts(base, (e) => splitNames(e.fwdIn)), get: (e) => splitNames(e.fwdIn) }] },
// // // //           with: { label: "Handled by now", fields: [{ key: "c_with", kind: "multi", label: "Currently handled by", search: true, options: opts(base, ownerName), get: ownerName }] },
// // // //           value: {
// // // //             label: "Value", fields: [
// // // //               { key: "c_sales", kind: "multi", label: "Sales value", options: fixed([["yes", "Has sales value"], ["no", "No sales value"]]), get: (e) => (e.salesValue > 0 ? "yes" : "no") },
// // // //               { key: "c_canc", kind: "multi", label: "Cancellation charge", options: fixed([["yes", "Has cancellation charge"], ["no", "No cancellation charge"]]), get: (e) => (e.cancellationCharge > 0 ? "yes" : "no") },
// // // //             ]
// // // //           },
// // // //           stage: { label: "Stage", fields: [{ key: "c_st", kind: "multi", label: "Stage", options: FIT_CARDS.filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })), get: (e) => e.stage }] },
// // // //         };
// // // //   // Indha tab la kaattura columns mattum (filter apply aaga)
// // // //   const visibleCols =
// // // //     tab === "tickets" ? ["ticketNo", "ticket", "raisedBy", "raisedTo", "date", "status"]
// // // //       : tab === "bookings" ? ["tnr", "tour", ...(ALL ? ["by"] : []), "pax", "pay", "canc", "status"]
// // // //         : ["code", "name", "trip", ...(ALL ? ["with"] : view === "fwdBy" ? ["fto", "with"] : view === "fwdTo" ? ["fby", "with"] : ["with"]), "value", "stage"];
// // // //   const activeFields = visibleCols.flatMap((id) => COLS[id]?.fields || []);
// // // //   const localDay = (d) => { if (!d) return ""; const x = new Date(d); return isNaN(x) ? "" : x.toLocaleDateString("en-CA"); };
// // // //   const passCols = (r) => activeFields.every((f) => {
// // // //     if (f.kind === "date") {
// // // //       if (!cf.fromDate && !cf.toDate) return true;
// // // //       const day = localDay(f.get(r));
// // // //       return !!day && (!cf.fromDate || day >= cf.fromDate) && (!cf.toDate || day <= cf.toDate);
// // // //     }
// // // //     if (f.kind === "text") {
// // // //       const t = String(cf[f.key] || "").trim().toLowerCase();
// // // //       return !t || String(f.get(r) || "").toLowerCase().includes(t);
// // // //     }
// // // //     const want = String(cf[f.key] || "").split(",").map((x) => x.trim()).filter(Boolean);
// // // //     if (!want.length) return true;
// // // //     return [].concat(f.get(r)).some((v) => want.includes(String(v ?? "").trim()));
// // // //   });
// // // //   const applyCf = (o) => setCf((c) => ({ ...c, ...o }));
// // // //   const head = (id, className = "") => (
// // // //     <th key={id} className={`px-3 py-3 font-semibold ${className}`}>
// // // //       <ColumnFilter label={COLS[id].label} fields={COLS[id].fields} filters={cf} onApply={applyCf} />
// // // //     </th>
// // // //   );
// // // //   // Mobile — header illa, adhanaala filter chips
// // // //   const mobileFilters = (hideFrom = "md") => (
// // // //     <div className={`flex flex-wrap gap-1.5 border-b border-gray-100 px-4 py-2.5 ${hideFrom === "lg" ? "lg:hidden" : "md:hidden"}`}>
// // // //       {visibleCols.map((id) => <ColumnFilter key={id} variant="chip" label={COLS[id].label} fields={COLS[id].fields} filters={cf} onApply={applyCf} />)}
// // // //     </div>
// // // //   );
// // // //   const anyCol = Object.values(cf).some((v) => String(v || "").trim());
// // // //   // Cards + money — column filter apply aagi (card click / search illaama)
// // // //   const CB = base.filter(passCols);
// // // //   const tCount = (k) => (k ? CB.filter((t) => t.status === k).length : CB.length);
// // // //   const bCount = (k) => (k ? CB.filter((b) => b.state === k).length : CB.length);
// // // //   const fCount = (k) => (k ? CB.filter((e) => e.stage === k).length : CB.length);

// // // //   const rows =
// // // //     tab === "tickets" ? tBase.filter((t) => (!card || t.status === card) && passCols(t) && has(t.ticketNo, t.subject, t.tnr, t.raisedBy, t.raisedTo))
// // // //       : tab === "bookings" ? L.filter((b) => (!card || b.state === card) && passCols(b) && has(b.tnr, b.tour, b.customer, nameOf(b.empKey)))
// // // //         : fBase.filter((e) => (!card || e.stage === card) && passCols(e) && has(e.fitCode, e.name, e.destination));

// // // //   const inputCls = "rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100";
// // // //   const pill = (on) => `rounded-xl px-4 py-2 text-sm font-semibold ${on ? "bg-white text-green-700 shadow" : "text-gray-600 hover:text-gray-900"}`;

// // // //   return (
// // // //     <div className="w-full min-w-0 max-w-7xl flex-1 p-3 pt-16 sm:p-5 sm:pt-16 lg:pt-5">
// // // //       <div className="mb-5 text-center">
// // // //         <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
// // // //         <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
// // // //         <span className="mx-auto mt-3 block h-1 w-14 rounded-full bg-green-500" aria-hidden="true" />
// // // //       </div>

// // // //       {/* ── Employee + dates ── */}
// // // //       <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4">
// // // //         <label className="w-full text-xs font-semibold text-gray-600 sm:w-auto sm:min-w-[16rem] sm:flex-1">Employee
// // // //           <select value={emp} onChange={(e) => setEmp(e.target.value)} className={`mt-1 block w-full ${inputCls}`}>
// // // //             <option value="*">All employees</option>
// // // //             {employees.map((e) => (
// // // //               <option key={e.key} value={e.key}>{e.name}{e.employeeId ? ` (${e.employeeId})` : ""}{e.role ? ` · ${e.role}` : ""}{e.status !== "Active" ? ` · ${e.status}` : ""}</option>
// // // //             ))}
// // // //           </select>
// // // //         </label>
// // // //         <div className="flex flex-wrap gap-1.5">
// // // //           {PRESETS.map((p) => (
// // // //             <button key={p.key} type="button" onClick={() => { setPreset(p.key); setRange(p.range()); }}
// // // //               className={`rounded-full px-3 py-2 text-xs font-semibold ${preset === p.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
// // // //               {p.label}
// // // //             </button>
// // // //           ))}
// // // //         </div>
// // // //         <label className="min-w-[9rem] flex-1 text-xs font-semibold text-gray-600 sm:flex-none">From
// // // //           <input type="date" value={from} max={to || undefined} onChange={(e) => { setPreset(""); setRange([e.target.value, to]); }} className={`mt-1 block w-full ${inputCls}`} />
// // // //         </label>
// // // //         <label className="min-w-[9rem] flex-1 text-xs font-semibold text-gray-600 sm:flex-none">To
// // // //           <input type="date" value={to} min={from || undefined} onChange={(e) => { setPreset(""); setRange([from, e.target.value]); }} className={`mt-1 block w-full ${inputCls}`} />
// // // //         </label>
// // // //       </div>

// // // //       {!emp ? null : (
// // // //         <>
// // // //           {/* ── Who ── */}
// // // //           <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
// // // //             <div>
// // // //               <p className="text-lg font-bold text-gray-900">{ALL ? "All employees" : me?.name}{!ALL && me?.employeeId ? <span className="font-medium text-gray-500"> · {me.employeeId}</span> : null}</p>
// // // //               <p className="text-xs text-gray-500">{ALL ? "Pick an employee above to see only theirs" : `${me?.role || ""}${me?.status && me.status !== "Active" ? ` · ${me.status}` : ""}`} · {from ? fmtDate(from) : "All time"}{to ? ` – ${fmtDate(to)}` : ""}</p>
// // // //             </div>
// // // //             {tabs.length > 1 && (
// // // //               <div className="flex w-full gap-1 rounded-2xl bg-gray-100 p-1 sm:w-auto" role="tablist">
// // // //                 {tabs.map((k) => (
// // // //                   <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`flex-1 sm:flex-none ${pill(tab === k)}`}>
// // // //                     {k === "tickets" ? "🎫 Tickets" : k === "bookings" ? "🧳 Tour bookings" : "✈️ FIT"}
// // // //                   </button>
// // // //                 ))}
// // // //               </div>
// // // //             )}
// // // //           </div>

// // // //           {/* ── Views (ticket page / FIT page maadhiri) ── */}
// // // //           {!ALL && (tab === "tickets" || tab === "fit") && (
// // // //             <div className="mb-3 flex flex-wrap gap-1 rounded-2xl bg-gray-100 p-1 sm:inline-flex">
// // // //               {(tab === "tickets" ? TICKET_VIEWS : FIT_VIEWS).map((v) => (
// // // //                 <button key={v.key} type="button" onClick={() => setView(v.key)} className={pill(view === v.key)}>{v.label}</button>
// // // //               ))}
// // // //             </div>
// // // //           )}
// // // //           {!ALL && tab === "fit" && (
// // // //             <p className="-mt-1 mb-3 text-xs text-gray-500">{FIT_VIEWS.find((v) => v.key === view)?.hint}</p>
// // // //           )}

// // // //           {/* ── Cards ── */}
// // // //           {loading || !list ? (
// // // //             <p className="py-10 text-center text-sm text-gray-500">Loading…</p>
// // // //           ) : (
// // // //             <>
// // // //               {tab === "tickets" && (
// // // //                 <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
// // // //                   {TICKET_CARDS.map((c) => <Card key={c.label} c={c} count={tCount(c.key)} active={card === c.key} onClick={() => setCard(c.key)} />)}
// // // //                 </div>
// // // //               )}
// // // //               {tab === "bookings" && (
// // // //                 <>
// // // //                   <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
// // // //                     {BOOKING_CARDS.map((c) => <Card key={c.label} c={c} count={bCount(c.key)} active={card === c.key} onClick={() => setCard(c.key)} />)}
// // // //                   </div>
// // // //                   <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
// // // //                     <Money label="Advance received" value={sum(CB, (b) => (countsMoney(b) && b.advance?.paid ? b.advance.amount : 0))} sub={`${CB.filter((b) => countsMoney(b) && b.advance?.paid).length} bookings · Active + Completed`} tone="text-green-700" />
// // // //                     <Money label="Balance received" value={sum(CB, (b) => (countsMoney(b) && b.balance?.paid ? b.balance.amount : 0))} sub={`${CB.filter((b) => countsMoney(b) && b.balance?.paid).length} paid · ${CB.filter((b) => countsMoney(b) && !b.balance?.paid && !b.balance?.adjusted).length} pending`} tone="text-green-700" />
// // // //                     <Money label="GV cancellation" value={sum(CB, (b) => b.gvCancellation)} />
// // // //                     <Money label="IRCTC cancellation" value={sum(CB, (b) => b.irctcCancellation)} />
// // // //                     <Money label="Refund" value={sum(CB, (b) => b.refund)} />
// // // //                   </div>
// // // //                 </>
// // // //               )}
// // // //               {tab === "fit" && (
// // // //                 <>
// // // //                   <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
// // // //                     {FIT_CARDS.map((c) => <Card key={c.label} c={c} count={fCount(c.key)} active={card === c.key} onClick={() => setCard(c.key)} />)}
// // // //                   </div>
// // // //                   <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
// // // //                     <Money label="Sales value (accepted)" value={sum(CB.filter((e) => ["Accepted", "Closed"].includes(e.stage)), (e) => e.salesValue)} tone="text-green-700" />
// // // //                     <Money label="Cancellation charge" value={sum(CB, (e) => e.cancellationCharge)} sub={`${CB.filter((e) => e.cancellationCharge > 0).length} enquiries`} tone="text-rose-700" />
// // // //                     {CB.some((e) => "gvVinoth" in e) && (
// // // //                       <>
// // // //                         <Money label="Vinoth share (GVEMP008)" value={sum(CB, (e) => e.gvVinoth)} sub={`${CB.filter((e) => e.gvVinoth > 0).length} enquiries`} tone="text-indigo-700" />
// // // //                         <Money label="Giridharan share (GVEMP009)" value={sum(CB, (e) => e.gvGiridhar)} sub={`${CB.filter((e) => e.gvGiridhar > 0).length} enquiries`} tone="text-indigo-700" />
// // // //                       </>
// // // //                     )}
// // // //                   </div>
// // // //                 </>
// // // //               )}

// // // //               {/* ── List ── */}
// // // //               <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
// // // //                 <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-4 py-3">
// // // //                   <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "tickets" ? "Search ticket no, subject, TNR" : tab === "bookings" ? "Search TNR, tour, customer" : "Search FIT code, name, place"} className={`w-full min-w-0 flex-1 sm:min-w-[14rem] ${inputCls}`} />
// // // //                   {(card || q || anyCol) && <button type="button" onClick={() => { setCard(""); setQ(""); setCf({}); }} className="text-xs font-semibold text-red-600 hover:underline">Clear all</button>}
// // // //                   <span className="text-xs text-gray-500">Showing {rows.length}</span>
// // // //                 </div>
// // // //                 {rows.length === 0 ? (
// // // //                   <p className="px-4 py-10 text-center text-sm text-gray-500">Nothing here.</p>
// // // //                 ) : tab === "tickets" ? (
// // // //                   <>
// // // //                     {mobileFilters()}
// // // //                     {/* Mobile / tablet — cards */}
// // // //                     <ul className="divide-y divide-gray-100 md:hidden">
// // // //                       {rows.map((t) => (
// // // //                         <li key={t._id} className="px-4 py-3">
// // // //                           <div className="flex items-center justify-between gap-2">
// // // //                             <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800">{t.ticketNo || "—"}</span>
// // // //                             <Pill s={t.status} />
// // // //                           </div>
// // // //                           <p className="mt-1.5 font-semibold text-gray-900">{t.subject}</p>
// // // //                           <p className="text-xs text-gray-500">{t.queryType}{t.tnr ? ` · TNR ${t.tnr}` : ""}</p>
// // // //                           <p className="mt-1 text-xs text-gray-600"><span className="font-semibold">{t.raisedBy || "—"}</span> → <span className="font-semibold">{t.raisedTo || "—"}</span> · {fmtDate(t.createdAt)}</p>
// // // //                         </li>
// // // //                       ))}
// // // //                     </ul>
// // // //                     {/* Desktop — table */}
// // // //                     <div className="hidden md:block">
// // // //                       <table className="w-full table-fixed text-left text-sm">
// // // //                         <thead className="bg-blue-50 text-xs text-gray-600"><tr>
// // // //                           {head("ticketNo", "w-36")}{head("ticket")}{head("raisedBy", "w-[19%]")}
// // // //                           {head("raisedTo", "w-[17%]")}{head("date", "w-36")}{head("status", "w-32")}
// // // //                         </tr></thead>
// // // //                         <tbody>
// // // //                           {rows.map((t) => (
// // // //                             <tr key={t._id} className="border-t border-gray-100 align-top">
// // // //                               <td className="px-4 py-2.5"><span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800">{t.ticketNo || "—"}</span></td>
// // // //                               <td className="px-4 py-2.5"><p className="truncate font-semibold text-gray-900">{t.subject}</p><p className="truncate text-xs text-gray-500">{t.queryType}{t.tnr ? ` · TNR ${t.tnr}` : ""}</p></td>
// // // //                               <td className="truncate px-3 py-2.5 text-xs font-semibold" title={t.raisedBy}>{t.raisedBy || "—"}</td>
// // // //                               <td className="truncate px-3 py-2.5 text-xs" title={t.raisedTo}>{t.raisedTo || "—"}</td>
// // // //                               <td className="px-4 py-2.5 text-xs">{fmtDate(t.createdAt)}</td>
// // // //                               <td className="px-4 py-2.5"><Pill s={t.status} /></td>
// // // //                             </tr>
// // // //                           ))}
// // // //                         </tbody>
// // // //                       </table>
// // // //                     </div>
// // // //                   </>
// // // //                 ) : tab === "bookings" ? (
// // // //                   <>
// // // //                     {mobileFilters("lg")}
// // // //                     {/* Mobile / tablet — cards */}
// // // //                     <ul className="divide-y divide-gray-100 lg:hidden">
// // // //                       {rows.map((b, i) => (
// // // //                         <li key={`${b.tnr}-${i}`} className="px-4 py-3">
// // // //                           <div className="flex items-center justify-between gap-2">
// // // //                             <span className="font-mono text-sm font-bold text-amber-800">{b.tnr || "—"}</span>
// // // //                             <span className="flex items-center gap-1.5">{b.requestedTr > 0 && <span className="text-[11px] font-semibold text-orange-700">{b.requestedTr} cancel request</span>}<Pill s={b.state} /></span>
// // // //                           </div>
// // // //                           <p className="mt-1 font-semibold text-gray-900">{b.tour}</p>
// // // //                           <p className="text-xs text-gray-500">{b.customer || "—"} · {paxOf(b).a} pax{paxExtra(paxOf(b)) ? ` (${paxExtra(paxOf(b))})` : ""} · {fmtDate(b.bookingDate)}{ALL ? ` · ${nameOf(b.empKey)}` : ""}</p>
// // // //                           <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl bg-gray-50 p-2.5 text-xs sm:grid-cols-3">
// // // //                             <MoneyLine label="Advance" v={b.advance} />
// // // //                             <MoneyLine label="Balance" v={b.balance} />
// // // //                             <Kv label="GV cancel" v={b.gvCancellation} />
// // // //                             <Kv label="IRCTC cancel" v={b.irctcCancellation} />
// // // //                             <Kv label="Refund" v={b.refund} />
// // // //                           </div>
// // // //                         </li>
// // // //                       ))}
// // // //                     </ul>
// // // //                     {/* Desktop — compact table (Advance + Balance oru column; GV / IRCTC / Refund oru column) */}
// // // //                     <div className="hidden lg:block">
// // // //                       <table className="w-full table-fixed text-left text-sm">
// // // //                         <thead className="bg-blue-50 text-xs text-gray-600"><tr>
// // // //                           {head("tnr", "w-28")}
// // // //                           {head("tour")}
// // // //                           {ALL && head("by", "w-[14%]")}
// // // //                           {head("pax", "w-24")}
// // // //                           {head("pay", "w-[20%]")}
// // // //                           {head("canc", "w-[16%]")}
// // // //                           {head("status", "w-36")}
// // // //                         </tr></thead>
// // // //                         <tbody>
// // // //                           {rows.map((b, i) => (
// // // //                             <tr key={`${b.tnr}-${i}`} className="border-t border-gray-100 align-top">
// // // //                               <td className="px-3 py-2.5"><p className="font-mono text-xs font-bold text-amber-800">{b.tnr || "—"}</p><p className="text-[11px] text-gray-500">{fmtDate(b.bookingDate)}</p></td>
// // // //                               <td className="px-3 py-2.5"><p className="truncate font-semibold text-gray-900" title={b.tour}>{b.tour}</p><p className="truncate text-xs text-gray-500" title={b.customer}>{b.customer || "—"}</p></td>
// // // //                               {ALL && <td className="truncate px-3 py-2.5 text-xs font-semibold" title={nameOf(b.empKey)}>{nameOf(b.empKey)}</td>}
// // // //                               <td className="px-3 py-2.5"><p className="font-semibold">{paxOf(b).a}</p>{paxOf(b).c > 0 && <p className="text-[11px] text-amber-700">{paxOf(b).c} cancelled</p>}{paxOf(b).r > 0 && <p className="text-[11px] text-red-600">{paxOf(b).r} rejected</p>}</td>
// // // //                               <td className="px-3 py-2.5 text-xs"><MoneyLine label="Adv" v={b.advance} /><MoneyLine label="Bal" v={b.balance} /></td>
// // // //                               <td className="px-3 py-2.5 text-xs">
// // // //                                 {b.gvCancellation || b.irctcCancellation || b.refund ? (
// // // //                                   <><Kv label="GV" v={b.gvCancellation} /><Kv label="IRCTC" v={b.irctcCancellation} /><Kv label="Refund" v={b.refund} /></>
// // // //                                 ) : <span className="text-gray-400">—</span>}
// // // //                               </td>
// // // //                               <td className="px-3 py-2.5"><Pill s={b.state} />{b.requestedTr > 0 && <p className="mt-1 text-[11px] font-semibold text-orange-700">{b.requestedTr} cancel request</p>}</td>
// // // //                             </tr>
// // // //                           ))}
// // // //                         </tbody>
// // // //                       </table>
// // // //                     </div>
// // // //                     {/* Total — ellaa screen ku um */}
// // // //                     <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-t-2 border-gray-200 bg-gray-50 px-4 py-3 text-xs sm:grid-cols-3 lg:grid-cols-6">
// // // //                       <p className="col-span-2 text-sm font-bold sm:col-span-3 lg:col-span-1">Total · {rows.length} bookings<span className="block text-xs font-semibold text-gray-600">{sum(rows, (b) => paxOf(b).a)} active pax · {sum(rows, (b) => paxOf(b).c)} cancelled · {sum(rows, (b) => paxOf(b).r)} rejected</span></p>
// // // //                       <Kv label="Advance paid" v={sum(rows, (b) => (countsMoney(b) && b.advance?.paid ? b.advance.amount : 0))} bold />
// // // //                       <Kv label="Balance paid" v={sum(rows, (b) => (countsMoney(b) && b.balance?.paid ? b.balance.amount : 0))} bold />
// // // //                       <Kv label="GV cancel" v={sum(rows, (b) => b.gvCancellation)} bold />
// // // //                       <Kv label="IRCTC cancel" v={sum(rows, (b) => b.irctcCancellation)} bold />
// // // //                       <Kv label="Refund" v={sum(rows, (b) => b.refund)} bold />
// // // //                     </div>
// // // //                   </>
// // // //                 ) : (
// // // //                   <>
// // // //                     {mobileFilters("lg")}
// // // //                     {/* Mobile / tablet — cards */}
// // // //                     <ul className="divide-y divide-gray-100 lg:hidden">
// // // //                       {rows.map((e) => (
// // // //                         <li key={e._id} className="px-4 py-3">
// // // //                           <div className="flex items-center justify-between gap-2">
// // // //                             <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800">{e.fitCode || "—"}</span>
// // // //                             <StagePill s={e.stage} />
// // // //                           </div>
// // // //                           <div className="mt-1.5 flex items-start justify-between gap-2">
// // // //                             <div className="min-w-0">
// // // //                               <p className="truncate font-semibold text-gray-900">{e.name}</p>
// // // //                               {e.mobile && <p className="text-xs text-gray-500">📞 {e.mobile}</p>}
// // // //                             </div>
// // // //                           </div>
// // // //                           <p className="mt-1 text-xs text-gray-600">Raised by <b className="text-gray-900">{raiserName(e)}</b></p>
// // // //                           <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl bg-gray-50 p-2.5 text-xs sm:grid-cols-3">
// // // //                             <p><span className="text-gray-500">Destination </span><b className="text-purple-800">{e.destination || "—"}</b>{duration(e) ? ` · ${duration(e)}` : ""}</p>
// // // //                             <p><span className="text-gray-500">Travel </span><b>{e.travelDate ? fmtDate(e.travelDate) : "—"}</b></p>
// // // //                             <p><span className="text-gray-500">Enquired </span>{fmtDate(e.createdAt)}</p>
// // // //                             {e.pickupDate && <p><span className="text-gray-500">Pickup </span><b className="text-red-600">{fmtDate(e.pickupDate)}</b></p>}
// // // //                             {e.salesValue > 0 && <p><span className="text-gray-500">Sales </span><b className="text-green-700">{inr(e.salesValue)}</b></p>}
// // // //                             {e.cancellationCharge > 0 && <p><span className="text-gray-500">Cancellation </span><b className="text-rose-700">{inr(e.cancellationCharge)}</b></p>}
// // // //                             {e.pax > 0 && <p><span className="text-gray-500">Pax </span>{e.pax}</p>}
// // // //                           </div>
// // // //                           <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
// // // //                             <ZoneChips zones={e.zones} />
// // // //                             {!ALL && view === "fwdBy" && <span>Forwarded to <b>{fwdNames(e.fwdOut)}</b></span>}
// // // //                             {!ALL && view === "fwdTo" && <span>Forwarded by <b>{fwdNames(e.fwdIn)}</b></span>}
// // // //                             {fitExtra.length > 0 && <span>Currently handled by <b>{ownerName(e)}</b></span>}
// // // //                             {e.lastBy && <span className="text-gray-500">{ACTION_LABEL[e.lastBy.action] || "Updated"} by <b className="text-gray-800">{e.lastBy.key ? nameOf(e.lastBy.key) : e.lastBy.name || "—"}</b></span>}
// // // //                           </div>
// // // //                         </li>
// // // //                       ))}
// // // //                     </ul>
// // // //                     {/* Desktop — table */}
// // // //                     <div className="hidden lg:block">
// // // //                       <table className="w-full table-fixed text-left text-sm">
// // // //                         <thead className="bg-blue-50 text-xs text-gray-600"><tr>
// // // //                           {head("code", "w-[15%]")}{head("name", "w-[17%]")}{head("trip")}
// // // //                           {visibleCols.filter((id) => ["fto", "fby", "with"].includes(id)).map((id) => head(id, "w-[13%]"))}
// // // //                           {head("value", "w-[11%]")}{head("stage", "w-[17%]")}
// // // //                         </tr></thead>
// // // //                         <tbody>
// // // //                           {rows.map((e) => (
// // // //                             <tr key={e._id} className="border-t border-gray-100 align-top hover:bg-gray-50/60">
// // // //                               <td className="px-3 py-3">
// // // //                                 <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800">{e.fitCode || "—"}</span>
// // // //                                 <p className="mt-1.5 text-[11px] text-gray-500">{fmtDate(e.createdAt)}</p>
// // // //                                 <p className="truncate text-[11px] text-gray-500" title={raiserName(e)}>by <b className="text-gray-700">{raiserName(e)}</b></p>
// // // //                               </td>
// // // //                               <td className="px-3 py-3">
// // // //                                 <p className="truncate font-semibold text-gray-900" title={e.name}>{e.name || "—"}</p>
// // // //                                 <p className="truncate text-xs text-gray-500">{[e.mobile, e.pax ? `${e.pax} pax` : ""].filter(Boolean).join(" · ")}</p>
// // // //                               </td>
// // // //                               <td className="px-3 py-3">
// // // //                                 <p className="truncate"><b className="text-purple-800">{e.destination || "—"}</b><span className="text-xs text-gray-500">{duration(e) ? ` · ${duration(e)}` : ""}</span></p>
// // // //                                 <p className="truncate text-xs text-gray-600">✈️ {e.travelDate ? fmtDate(e.travelDate) : "No date"}{e.pickupDate && <span className="font-semibold text-red-600"> · 🚌 {fmtDate(e.pickupDate)}</span>}</p>
// // // //                                 {e.zones?.length > 0 && <div className="mt-1"><ZoneChips zones={e.zones} /></div>}
// // // //                               </td>
// // // //                               {!ALL && view === "fwdBy" && <td className="truncate px-3 py-3 text-xs font-semibold">{fwdNames(e.fwdOut)}</td>}
// // // //                               {!ALL && view === "fwdTo" && <td className="truncate px-3 py-3 text-xs font-semibold">{fwdNames(e.fwdIn)}</td>}
// // // //                               {fitExtra.length > 0 && <td className={`truncate px-3 py-3 text-xs font-semibold ${e.ownerKey ? "text-gray-900" : "text-gray-400"}`} title={ownerName(e)}>{ownerName(e)}</td>}
// // // //                               <td className="px-3 py-3 text-xs">
// // // //                                 {e.salesValue || e.cancellationCharge ? (
// // // //                                   <>
// // // //                                     {e.salesValue > 0 && <p className="font-semibold text-green-700">{inr(e.salesValue)}</p>}
// // // //                                     {e.cancellationCharge > 0 && <p className="font-semibold text-rose-700">−{inr(e.cancellationCharge)} <span className="font-normal text-gray-500">cancel</span></p>}
// // // //                                   </>
// // // //                                 ) : <span className="text-gray-400">—</span>}
// // // //                               </td>
// // // //                               <td className="px-3 py-3">
// // // //                                 <StagePill s={e.stage} />
// // // //                                 {e.lastBy && (
// // // //                                   <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-gray-500" title={`${ACTION_LABEL[e.lastBy.action] || "Updated"} by ${e.lastBy.key ? nameOf(e.lastBy.key) : e.lastBy.name || "—"}`}>
// // // //                                     {ACTION_LABEL[e.lastBy.action] || "Updated"} by <b className="text-gray-700">{e.lastBy.key ? nameOf(e.lastBy.key) : e.lastBy.name || "—"}</b> · {fmtDate(e.lastBy.at)}
// // // //                                   </p>
// // // //                                 )}
// // // //                               </td>
// // // //                             </tr>
// // // //                           ))}
// // // //                         </tbody>
// // // //                       </table>
// // // //                     </div>
// // // //                     <div className="flex flex-wrap justify-between gap-2 border-t-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold">
// // // //                       <span>Total · {rows.length} enquiries</span><span className="flex flex-wrap gap-x-4"><span className="text-green-700">Sales value {inr(sum(rows, (e) => e.salesValue))}</span><span className="text-rose-700">Cancellation {inr(sum(rows, (e) => e.cancellationCharge))}</span></span>
// // // //                     </div>
// // // //                   </>
// // // //                 )}
// // // //               </div>
// // // //             </>
// // // //           )}
// // // //         </>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // };

// // // // export default EmployeePerformance;



// // // // ════════════════════════════════════════════════════════════════
// // // //  EmployeePerformance.jsx — Admin panel (CEO tab) — SIMPLE scorecard
// // // //  Mela oru employee select → avangaludhu mattum:
// // // //    Tickets  : Raise / View Tickets page la varra adhe status cards + tabs
// // // //    Bookings : Tour Bookings maadhiri status + amount cards
// // // //    FIT      : FIT Enquiries page la varra stage cards (FitPerformance.jsx la)
// // // //  Card click pannaa keezha list andha status ku filter aagum.
// // // //  API: GET /api/touradmin/<api>?tab=&employee=&from=&to=
// // // // ════════════════════════════════════════════════════════════════
// // // import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
// // // import axios from "axios";
// // // import { ColumnFilter } from "../../components/TicketFilters"; // ticket page la irukkura header funnel filter
// // // import { toast } from "react-toastify";
// // // import { TourAdminContext } from "../../context/TourAdminContext"; // ⚙️ path check pannunga

// // // // ─── Dates ───
// // // const pad = (n) => String(n).padStart(2, "0");
// // // const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// // // const PRESETS = [
// // //   { key: "all", label: "All time", range: () => ["", ""] },
// // //   { key: "month", label: "This month", range: () => { const t = new Date(); return [ymd(new Date(t.getFullYear(), t.getMonth(), 1)), ymd(t)]; } },
// // //   { key: "last", label: "Last month", range: () => { const t = new Date(); return [ymd(new Date(t.getFullYear(), t.getMonth() - 1, 1)), ymd(new Date(t.getFullYear(), t.getMonth(), 0))]; } },
// // //   { key: "year", label: "This year", range: () => { const t = new Date(); return [ymd(new Date(t.getFullYear(), 0, 1)), ymd(t)]; } },
// // // ];
// // // const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");
// // // const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

// // // // ─── Status cards (ticket page / FIT page la irukkura adhe colours) ───
// // // const TICKET_CARDS = [
// // //   { key: "", label: "Total", cls: "border-slate-300 text-slate-900" },
// // //   { key: "open", label: "Open", cls: "border-sky-300 text-sky-800" },
// // //   { key: "pickup", label: "Picked up", cls: "border-violet-300 text-violet-800" },
// // //   { key: "processing", label: "Processing", cls: "border-amber-300 text-amber-800" },
// // //   { key: "close", label: "Closed", cls: "border-green-400 text-green-800" },
// // //   { key: "reject", label: "Rejected", cls: "border-red-300 text-red-700" },
// // // ];
// // // const TICKET_VIEWS = [
// // //   { key: "Assigned", label: "Assigned to them" },
// // //   { key: "Raised", label: "Raised by them" },
// // //   { key: "Forwarded", label: "Forwarded by them" },
// // //   { key: "Edits", label: "✏️ Edit history" }, // avanga panna ticket edits (Raise Ticket → Edit History maadhiri)
// // // ];
// // // // All employees → Tickets / ellaa employees oda full edit history
// // // const ALL_TICKET_VIEWS = [
// // //   { key: "Assigned", label: "🎫 All tickets" },
// // //   { key: "Edits", label: "✏️ Edit history (all employees)" },
// // // ];
// // // const BOOKING_CARDS = [
// // //   { key: "", label: "Total bookings", cls: "border-slate-300 text-slate-900" },
// // //   { key: "unverified", label: "Unverified", cls: "border-gray-400 text-gray-700" },
// // //   { key: "active", label: "Active (Advance only paid)", cls: "border-green-400 text-green-800" },
// // //   { key: "completed", label: "Completed (Booking completed)", cls: "border-yellow-400 text-yellow-800" },
// // //   { key: "cancelled", label: "Fully cancelled", cls: "border-red-300 text-red-700" },
// // //   { key: "tripCancelled", label: "Trip cancelled", cls: "border-rose-300 text-rose-700" },
// // //   { key: "rejected", label: "Rejected", cls: "border-purple-300 text-purple-700" },
// // // ];
// // // const FIT_CARDS = [
// // //   { key: "", label: "Total", cls: "border-slate-300 text-slate-900" },
// // //   { key: "Pending", label: "Pending", cls: "border-orange-300 text-orange-800" },
// // //   { key: "Picked up", label: "Pickup", cls: "border-sky-300 text-sky-800" },
// // //   { key: "Rate shared", label: "Rate shared", cls: "border-yellow-300 text-yellow-800" },
// // //   { key: "Accepted", label: "Accepted", cls: "border-green-400 text-green-800" },
// // //   { key: "Closed", label: "Closed", cls: "border-slate-400 text-slate-700" },
// // //   { key: "Cancelled", label: "Cancelled", cls: "border-rose-300 text-rose-800" },
// // //   { key: "Rejected", label: "Rejected", cls: "border-red-300 text-red-700" },
// // // ];
// // // const FIT_VIEWS = [
// // //   { key: "now", label: "Currently handling", hint: "Enquiries with this employee right now." },
// // //   { key: "fwdBy", label: "Forwarded by them", hint: "Enquiries this employee forwarded to someone else." },
// // //   { key: "fwdTo", label: "Forwarded to them", hint: "Enquiries someone else forwarded to this employee." },
// // // ];
// // // const STATUS_PILL = {
// // //   open: ["Open", "bg-blue-50 text-blue-700"], pickup: ["Picked up", "bg-violet-50 text-violet-700"], processing: ["Processing", "bg-amber-50 text-amber-800"],
// // //   close: ["Closed", "bg-green-50 text-green-700"], reject: ["Rejected", "bg-red-50 text-red-700"],
// // //   active: ["Active", "bg-green-50 text-green-700"], unverified: ["Unverified", "bg-gray-100 text-gray-700"], completed: ["Completed", "bg-yellow-50 text-yellow-800"],
// // //   cancelRequested: ["Cancellation requested", "bg-orange-50 text-orange-700"], cancelled: ["Fully cancelled", "bg-red-50 text-red-700"], tripCancelled: ["Trip cancelled", "bg-rose-50 text-rose-700"], rejected: ["Rejected", "bg-purple-50 text-purple-700"],
// // // };
// // // // Pax — Active (cancellation request um serthu) / Cancelled (trip cancel um) / Rejected thani thani
// // // const paxOf = (b) => {
// // //   const c = b.cancelledTr || 0, r = b.rejectedTr || 0;
// // //   const a = b.activeTr != null ? (b.activeTr || 0) + (b.requestedTr || 0) : Math.max(0, (b.travellers || 0) - c - r);
// // //   return { a, c, r };
// // // };
// // // const paxExtra = ({ c, r }) => [c ? `${c} cancelled` : "", r ? `${r} rejected` : ""].filter(Boolean).join(" · ");
// // // // FIT — stage pill + "by …" (FIT Enquiries page maadhiri)
// // // const STAGE_PILL = {
// // //   Pending: "bg-gray-100 text-gray-700", "Picked up": "bg-sky-50 text-sky-700", "Rate shared": "bg-yellow-50 text-yellow-800",
// // //   Accepted: "bg-green-50 text-green-700", Closed: "bg-slate-100 text-slate-700", Cancelled: "bg-rose-50 text-rose-700", Rejected: "bg-red-50 text-red-700",
// // // };
// // // const StagePill = ({ s }) => (
// // //   <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${STAGE_PILL[s] || "bg-gray-100 text-gray-700"}`}>
// // //     <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{s}
// // //   </span>
// // // );
// // // const ACTION_LABEL = { created: "Created", pickedUp: "Picked up", rateShared: "Rate shared", accepted: "Accepted", closed: "Closed", cancelled: "Cancelled", rejected: "Rejected", reopened: "Reopened", forwarded: "Forwarded" };
// // // const duration = (e) => (e.days ? `${e.days}D${e.nights != null ? `/${e.nights}N` : ""}` : "");
// // // const ZoneChips = ({ zones }) => (zones?.length
// // //   ? <div className="flex flex-wrap gap-1">{zones.map((z) => <span key={z} className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800">{z}</span>)}</div>
// // //   : <span className="text-gray-400">—</span>);
// // // // Kaasu received — Active bookings mattum
// // // const countsMoney = (b) => b.state === "active" || b.state === "completed"; // Active + Completed mattum
// // // const Pill = ({ s }) => {
// // //   const [t, c] = STATUS_PILL[s] || [s, "bg-gray-100 text-gray-700"];
// // //   return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${c}`}>{t}</span>;
// // // };

// // // // Clickable count card
// // // const Card = ({ c, count, active, onClick, money }) => (
// // //   <button type="button" onClick={onClick} aria-pressed={active}
// // //     className={`rounded-2xl border-2 bg-white p-3 text-left transition ${active ? `${c.cls} shadow-md ring-2 ring-offset-1 ring-current` : `border-gray-200 hover:-translate-y-0.5 hover:shadow ${c.cls.split(" ").filter((x) => x.startsWith("text-")).join(" ")}`}`}>
// // //     <p className="text-2xl font-bold tabular-nums">{money ? inr(count) : count}</p>
// // //     <p className="mt-0.5 text-xs font-semibold text-gray-600">{c.label}</p>
// // //   </button>
// // // );
// // // // Advance / Balance — amount + Paid / Pending (Cancellation la adjust aanaa adhu)
// // // const MoneyLine = ({ label, v }) => (
// // //   <p className="flex flex-wrap items-baseline gap-x-1">
// // //     <span className="text-gray-500">{label}</span>
// // //     {v?.adjusted ? <span className="text-gray-500">Adjusted in cancellation</span>
// // //       : <><span className="font-semibold tabular-nums text-gray-900">{inr(v?.amount)}</span><span className={`font-semibold ${v?.paid ? "text-green-700" : "text-gray-400"}`}>{v?.paid ? "Paid" : "Pending"}</span></>}
// // //   </p>
// // // );
// // // const Kv = ({ label, v, bold }) => (
// // //   <p className="flex flex-wrap items-baseline gap-x-1">
// // //     <span className="text-gray-500">{label}</span>
// // //     <span className={`tabular-nums ${bold ? "font-bold text-gray-900" : "font-semibold text-gray-800"}`}>{v ? inr(v) : "—"}</span>
// // //   </p>
// // // );
// // // const Money = ({ label, value, sub, tone = "text-gray-900" }) => (
// // //   <div className="rounded-2xl border border-gray-200 bg-white p-3">
// // //     <p className={`text-xl font-bold tabular-nums ${tone}`}>{inr(value)}</p>
// // //     <p className="mt-0.5 text-xs font-semibold text-gray-600">{label}</p>
// // //     {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
// // //   </div>
// // // );

// // // // ─── Edit history — oru employee panna ticket edits (Admin Raise Ticket → Edit History maadhiri) ───
// // // const EDIT_KIND = {
// // //   query: ["Ticket edited", "bg-blue-50 text-blue-700"],
// // //   "reply-edit": ["Reply edited", "bg-violet-50 text-violet-700"],
// // //   "reply-delete": ["Reply deleted", "bg-red-50 text-red-700"],
// // // };
// // // const fmtDT = (d) =>
// // //   d ? `${new Date(d).toLocaleDateString("en-IN")} ${new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}` : "—";
// // // const byLabel = (e) => e.staffName || (e.by === "touradmin" ? "Tour admin" : "Admin");

// // // const EditHistoryPanel = ({ backendUrl, aToken, staffId, all = false, from, to }) => {
// // //   const [items, setItems] = useState(null);
// // //   const [page, setPage] = useState(1);
// // //   const [totalPages, setTotalPages] = useState(1);
// // //   const [total, setTotal] = useState(0);
// // //   const [search, setSearch] = useState("");
// // //   const [term, setTerm] = useState("");
// // //   const [hidden, setHidden] = useState({});

// // //   useEffect(() => { setPage(1); }, [staffId, all, from, to, term]);
// // //   useEffect(() => {
// // //     const t = setTimeout(() => setTerm(search.trim()), 400);
// // //     return () => clearTimeout(t);
// // //   }, [search]);

// // //   useEffect(() => {
// // //     if (!staffId && !all) return;
// // //     let alive = true;
// // //     setItems(null);
// // //     axios
// // //       .get(`${backendUrl}/api/touradmin/queries/edit-history`, {
// // //         headers: { aToken },
// // //         params: { staff: all ? undefined : staffId, page, limit: 10, search: term || undefined, from: from || undefined, to: to || undefined },
// // //       })
// // //       .then(({ data }) => {
// // //         if (!alive) return;
// // //         if (!data?.success) throw new Error(data?.message || "Failed to load edit history");
// // //         setItems(data.items || []);
// // //         setTotalPages(data.totalPages || 1);
// // //         setTotal(data.total || 0);
// // //       })
// // //       .catch((err) => {
// // //         if (!alive) return;
// // //         toast.error(err.response?.data?.message || err.message);
// // //         setItems([]);
// // //       });
// // //     return () => { alive = false; };
// // //   }, [backendUrl, aToken, staffId, all, page, term, from, to]);

// // //   const edits = (items || []).reduce((n, q) => n + (q.edits?.length || 0), 0);

// // //   return (
// // //     <div className="space-y-4">
// // //       <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
// // //         <input
// // //           value={search}
// // //           onChange={(e) => setSearch(e.target.value)}
// // //           placeholder="Search by ticket no (GVTKT001) or subject"
// // //           className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
// // //         />
// // //         <span className="text-xs text-gray-500">{total} ticket{total !== 1 ? "s" : ""}{items ? ` · ${edits} edit${edits !== 1 ? "s" : ""} on this page` : ""}</span>
// // //       </div>

// // //       {!items ? (
// // //         <p className="py-10 text-center text-sm text-gray-500">Loading…</p>
// // //       ) : items.length === 0 ? (
// // //         <p className="rounded-2xl border border-gray-200 bg-white py-10 text-center text-sm text-gray-500">{all ? "No edits by any employee" : "No edits by this employee"}{from || to ? " in this period" : ""}.</p>
// // //       ) : (
// // //         items.map((q) => {
// // //           const isHidden = hidden[q.queryId];
// // //           return (
// // //             <div key={q.queryId} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
// // //               <div className="flex flex-wrap items-start justify-between gap-2 bg-blue-50/60 px-4 py-3">
// // //                 <div className="min-w-0">
// // //                   <div className="flex flex-wrap items-center gap-2">
// // //                     <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold tracking-wide text-blue-800">{q.ticketNo || "—"}</span>
// // //                     <Pill s={q.status} />
// // //                     <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-gray-700">{q.editCount} edit{q.editCount !== 1 ? "s" : ""}</span>
// // //                   </div>
// // //                   <p className="mt-1.5 truncate font-semibold text-gray-900">{q.subject}</p>
// // //                 </div>
// // //                 <div className="flex items-center gap-3 text-xs text-gray-600">
// // //                   <span>Last edit {fmtDT(q.lastEditedAt)}</span>
// // //                   <button type="button" onClick={() => setHidden((h) => ({ ...h, [q.queryId]: !h[q.queryId] }))} className="font-semibold text-blue-600 hover:underline">
// // //                     {isHidden ? "Show" : "Hide"}
// // //                   </button>
// // //                 </div>
// // //               </div>
// // //               {!isHidden && (
// // //                 <ol className="space-y-4 px-4 py-4">
// // //                   {q.edits.map((e) => {
// // //                     const [kLabel, kCls] = EDIT_KIND[e.kind] || EDIT_KIND.query;
// // //                     return (
// // //                       <li key={e.id} className="relative pl-6">
// // //                         <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-blue-500" aria-hidden="true" />
// // //                         <div className="flex flex-wrap items-center gap-2 text-sm">
// // //                           <span className="font-bold text-gray-900">Edit {e.editNo}</span>
// // //                           <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${kCls}`}>{kLabel}</span>
// // //                           <span className="text-gray-500">by <b className="text-gray-800">{byLabel(e)}</b></span>
// // //                           <span className="text-xs text-gray-500">{fmtDT(e.editedAt)}</span>
// // //                         </div>
// // //                         <div className="mt-2 space-y-2 rounded-xl border border-gray-100 p-2">
// // //                           {(e.changes || []).map((c, i) => (
// // //                             <div key={i} className="grid gap-2 md:grid-cols-[10rem_1fr_1fr]">
// // //                               <p className="px-1 py-1 text-sm font-semibold text-gray-700">{c.label}</p>
// // //                               <div className="rounded-lg bg-red-50 px-3 py-2">
// // //                                 <p className="text-[11px] font-bold uppercase tracking-wide text-red-700">Before</p>
// // //                                 <p className="whitespace-pre-line break-words text-sm text-gray-800">{c.before || "—"}</p>
// // //                               </div>
// // //                               <div className="rounded-lg bg-green-50 px-3 py-2">
// // //                                 <p className="text-[11px] font-bold uppercase tracking-wide text-green-700">After</p>
// // //                                 <p className="whitespace-pre-line break-words text-sm text-gray-800">{c.after || "—"}</p>
// // //                               </div>
// // //                             </div>
// // //                           ))}
// // //                         </div>
// // //                       </li>
// // //                     );
// // //                   })}
// // //                 </ol>
// // //               )}
// // //             </div>
// // //           );
// // //         })
// // //       )}

// // //       {totalPages > 1 && (
// // //         <div className="flex items-center justify-end gap-2 text-sm">
// // //           <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Previous</button>
// // //           <span className="text-gray-600">Page {page} of {totalPages}</span>
// // //           <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Next</button>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // // ════════════════════════════════════════════════════════════════
// // // const EmployeePerformance = ({
// // //   tabs = ["tickets", "bookings"],
// // //   api = "employee-performance",
// // //   title = "Employee Performance",
// // //   subtitle = "All employees together — pick one employee to see only theirs.",
// // // }) => {
// // //   const { aToken, backendUrl } = useContext(TourAdminContext);
// // //   const [tab, setTab] = useState(tabs[0]);
// // //   const [preset, setPreset] = useState("all");
// // //   const [[from, to], setRange] = useState(["", ""]);
// // //   const [employees, setEmployees] = useState([]);
// // //   const [allEmps, setAllEmps] = useState(new Map()); // key → name (Tour admin / Website kooda)
// // //   const [emp, setEmp] = useState("*"); // "*" = ellaa employees um (Tour admin page maadhiri), illa "staff:<id>"
// // //   const [list, setList] = useState(null);
// // //   const [loading, setLoading] = useState(false);
// // //   const [view, setView] = useState(tabs[0] === "fit" ? "now" : "Assigned"); // ticket / FIT view
// // //   const [card, setCard] = useState(""); // card filter
// // //   const [q, setQ] = useState("");

// // //   const get = useCallback(
// // //     async (params) => {
// // //       const { data } = await axios.get(`${backendUrl}/api/touradmin/${api}`, { headers: { aToken }, params });
// // //       if (!data?.success) throw new Error(data?.message || "Failed to load");
// // //       return data;
// // //     },
// // //     [backendUrl, aToken, api],
// // //   );

// // //   // Employee list (staff mattum)
// // //   useEffect(() => {
// // //     get({ tab: tabs[0], from: "2999-01-01" }) // list mattum venum — data illaadha date
// // //       .then((d) => setEmployees((d.employees || []).filter((e) => e.type === "staff" && e.staffId).sort((a, b) => (a.status === "Active" ? 0 : 1) - (b.status === "Active" ? 0 : 1) || a.name.localeCompare(b.name))))
// // //       .catch((err) => toast.error(err.response?.data?.message || err.message));
// // //   }, [get]); // eslint-disable-line react-hooks/exhaustive-deps

// // //   const reqId = useRef(0); // late-aa vandha pazhaya response (vera tab / employee) list-a maathakoodaadhu
// // //   const load = useCallback(async () => {
// // //     const id = ++reqId.current;
// // //     if (!emp) { setList(null); return; }
// // //     setLoading(true);
// // //     setList(null);
// // //     try {
// // //       const d = await get({ tab, employee: emp, from: from || undefined, to: to || undefined });
// // //       if (id !== reqId.current) return;
// // //       setList(d[tab]?.details || []);
// // //       setAllEmps(new Map((d.employees || []).map((e) => [e.key, e.name])));
// // //     } catch (err) {
// // //       if (id !== reqId.current) return;
// // //       toast.error(err.response?.data?.message || err.message);
// // //       setList([]);
// // //     } finally {
// // //       if (id === reqId.current) setLoading(false);
// // //     }
// // //   }, [get, tab, emp, from, to]);
// // //   useEffect(() => { load(); }, [load]);
// // //   const [cf, setCf] = useState({}); // column filters { key: value }
// // //   useEffect(() => { setCard(""); setQ(""); setCf({}); }, [tab, emp, view]);
// // //   useEffect(() => { setView(tab === "fit" ? "now" : "Assigned"); }, [tab]);

// // //   const me = employees.find((e) => e.key === emp);
// // //   const ALL = emp === "*";
// // //   const nameOf = (k) => allEmps.get(k) || (k ? k.replace(/^name:/, "") : "—");
// // //   const L = list || [];

// // //   // ─── Tickets ───
// // //   const tBase = useMemo(() => (tab === "tickets" ? (ALL ? L : L.filter((t) => (t.roles || []).includes(view))) : []), [L, tab, view, ALL]);

// // //   // ─── Bookings ───

// // //   const sum = (arr, fn) => arr.reduce((a, x) => a + (Number(fn(x)) || 0), 0);
// // //   // ─── FIT ───
// // //   const fBase = useMemo(() => {
// // //     if (tab !== "fit") return [];
// // //     if (ALL) return L;
// // //     if (view === "fwdBy") return L.filter((e) => e.fwdOut?.length);
// // //     if (view === "fwdTo") return L.filter((e) => e.fwdIn?.length);
// // //     return L.filter((e) => e.withMe);
// // //   }, [L, tab, view, ALL]);
// // //   const fwdNames = (arr) => [...new Set((arr || []).map((f) => (f.key ? nameOf(f.key) : f.label) || "—"))].join(", ");
// // //   const fitExtra = ALL ? ["With"] : view === "fwdBy" ? ["Forwarded to", "Now with"] : view === "fwdTo" ? ["Forwarded by", "Now with"] : ["Now with"]; // "Handled by now" column eppavum


// // //   // List — card + search filter
// // //   const s = q.trim().toLowerCase();
// // //   const has = (...xs) => !s || xs.some((x) => String(x || "").toLowerCase().includes(s));
// // //   // ─── Column filters — ticket page maadhiri header la funnel (ColumnFilter) ───
// // //   // Ovvoru field: kind multi (comma string) / text / date + get(row) → value (or array)
// // //   const opts = (arr, fn) => [...new Set(arr.flatMap((x) => [].concat(fn(x))).map((v) => String(v ?? "").trim()).filter(Boolean))]
// // //     .sort((x, y) => x.localeCompare(y)).map((v) => ({ value: v, label: v }));
// // //   const fixed = (pairs) => pairs.map(([value, label]) => ({ value, label }));
// // //   const base = tab === "tickets" ? tBase : tab === "bookings" ? L : fBase;
// // //   const paxTags = (b) => { const p = paxOf(b); return [p.c ? "c" : "", p.r ? "r" : "", !p.c && !p.r ? "none" : ""].filter(Boolean); };
// // //   const cancTags = (b) => { const t = [b.gvCancellation > 0 && "gv", b.irctcCancellation > 0 && "irctc", b.refund > 0 && "refund"].filter(Boolean); return t.length ? t : ["none"]; };
// // //   const monthOf = (d) => { if (!d) return "No date"; const x = new Date(d); return isNaN(x) ? "No date" : x.toLocaleDateString("en-IN", { month: "short", year: "numeric" }); };
// // //   const ownerName = (e) => (e.ownerKey ? nameOf(e.ownerKey) : "Not picked yet");
// // //   const raiserName = (e) => (e.raisedByWho?.key ? nameOf(e.raisedByWho.key) : e.raisedByWho?.name || "—");
// // //   const splitNames = (arr) => fwdNames(arr).split(", ").filter(Boolean);
// // //   const COLS =
// // //     tab === "tickets" ? {
// // //       ticketNo: { label: "Ticket no", fields: [{ key: "c_tno", kind: "text", label: "Ticket no contains", placeholder: "e.g. GVTKT033", get: (t) => t.ticketNo }] },
// // //       ticket: {
// // //         label: "Ticket", fields: [
// // //           { key: "c_subj", kind: "text", label: "Subject / TNR contains", placeholder: "e.g. Advance or XQ08ZT", get: (t) => `${t.subject || ""} ${t.tnr || ""}` },
// // //           { key: "c_type", kind: "multi", label: "Ticket type", options: opts(base, (t) => t.queryType), get: (t) => t.queryType },
// // //         ]
// // //       },
// // //       raisedBy: { label: "Raised by", fields: [{ key: "c_by", kind: "multi", label: "Raised by", search: true, options: opts(base, (t) => t.raisedBy), get: (t) => t.raisedBy }] },
// // //       raisedTo: { label: "Raised to", fields: [{ key: "c_to", kind: "multi", label: "Raised to", search: true, options: opts(base, (t) => t.raisedTo), get: (t) => t.raisedTo }] },
// // //       date: { label: "Raised on", fields: [{ key: "date", kind: "date", label: "Raised on", get: (t) => t.createdAt }] },
// // //       status: { label: "Status", fields: [{ key: "c_st", kind: "multi", label: "Status", options: TICKET_CARDS.filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })), get: (t) => t.status }] },
// // //     }
// // //       : tab === "bookings" ? {
// // //         tnr: {
// // //           label: "TNR", fields: [
// // //             { key: "c_tnr", kind: "text", label: "TNR contains", placeholder: "e.g. UF08IX", get: (b) => b.tnr },
// // //             { key: "date", kind: "date", label: "Booked on", get: (b) => b.bookingDate },
// // //           ]
// // //         },
// // //         tour: {
// // //           label: "Tour / Customer", fields: [
// // //             { key: "c_tour", kind: "multi", label: "Tour", search: true, options: opts(base, (b) => b.tour), get: (b) => b.tour },
// // //             { key: "c_cust", kind: "text", label: "Customer contains", placeholder: "Customer name", get: (b) => b.customer },
// // //           ]
// // //         },
// // //         by: { label: "Booked by", fields: [{ key: "c_by", kind: "multi", label: "Booked by", search: true, options: opts(base, (b) => nameOf(b.empKey)), get: (b) => nameOf(b.empKey) }] },
// // //         pax: { label: "Pax", fields: [{ key: "c_pax", kind: "multi", label: "Pax", options: fixed([["c", "Has cancelled pax"], ["r", "Has rejected pax"], ["none", "No cancelled / rejected"]]), get: paxTags }] },
// // //         pay: {
// // //           label: "Advance / Balance", fields: [
// // //             { key: "c_adv", kind: "multi", label: "Advance", options: fixed([["paid", "Paid"], ["pending", "Pending"]]), get: (b) => (b.advance?.paid ? "paid" : "pending") },
// // //             { key: "c_bal", kind: "multi", label: "Balance", options: fixed([["paid", "Paid"], ["pending", "Pending"], ["adjusted", "Adjusted in cancellation"]]), get: (b) => (b.balance?.adjusted ? "adjusted" : b.balance?.paid ? "paid" : "pending") },
// // //           ]
// // //         },
// // //         canc: { label: "Cancellation", fields: [{ key: "c_canc", kind: "multi", label: "Cancellation", options: fixed([["gv", "Has GV"], ["irctc", "Has IRCTC"], ["refund", "Has refund"], ["none", "No cancellation"]]), get: cancTags }] },
// // //         status: { label: "Status", fields: [{ key: "c_st", kind: "multi", label: "Status", options: BOOKING_CARDS.filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })), get: (b) => b.state }] },
// // //       }
// // //         : {
// // //           code: {
// // //             label: "Enquiry", fields: [
// // //               { key: "c_code", kind: "text", label: "FIT code contains", placeholder: "e.g. GVFIT0030", get: (e) => e.fitCode },
// // //               { key: "date", kind: "date", label: "Enquired on", get: (e) => e.createdAt },
// // //               { key: "c_raised", kind: "multi", label: "Raised by", search: true, options: opts(base, raiserName), get: raiserName },
// // //             ]
// // //           },
// // //           name: {
// // //             label: "Customer", fields: [
// // //               { key: "c_name", kind: "text", label: "Name / mobile contains", placeholder: "Name or mobile", get: (e) => `${e.name || ""} ${e.mobile || ""}` },
// // //             ]
// // //           },
// // //           trip: {
// // //             label: "Trip", fields: [
// // //               { key: "c_dest", kind: "multi", label: "Destination", search: true, options: opts(base, (e) => e.destination), get: (e) => String(e.destination || "").trim() },
// // //               { key: "c_ttype", kind: "multi", label: "Tour type", options: opts(base, (e) => e.tourType), get: (e) => e.tourType },
// // //               { key: "c_tmonth", kind: "multi", label: "Travel month", options: opts(base, (e) => monthOf(e.travelDate)), get: (e) => monthOf(e.travelDate) },
// // //               { key: "c_zone", kind: "multi", label: "Zone", options: opts(base, (e) => e.zones || []), get: (e) => (e.zones?.length ? e.zones : ["No zone"]) },
// // //             ]
// // //           },
// // //           fto: { label: "Forwarded to", fields: [{ key: "c_fto", kind: "multi", label: "Forwarded to", search: true, options: opts(base, (e) => splitNames(e.fwdOut)), get: (e) => splitNames(e.fwdOut) }] },
// // //           fby: { label: "Forwarded by", fields: [{ key: "c_fby", kind: "multi", label: "Forwarded by", search: true, options: opts(base, (e) => splitNames(e.fwdIn)), get: (e) => splitNames(e.fwdIn) }] },
// // //           with: { label: "Handled by now", fields: [{ key: "c_with", kind: "multi", label: "Currently handled by", search: true, options: opts(base, ownerName), get: ownerName }] },
// // //           value: {
// // //             label: "Value", fields: [
// // //               { key: "c_sales", kind: "multi", label: "Sales value", options: fixed([["yes", "Has sales value"], ["no", "No sales value"]]), get: (e) => (e.salesValue > 0 ? "yes" : "no") },
// // //               { key: "c_canc", kind: "multi", label: "Cancellation charge", options: fixed([["yes", "Has cancellation charge"], ["no", "No cancellation charge"]]), get: (e) => (e.cancellationCharge > 0 ? "yes" : "no") },
// // //             ]
// // //           },
// // //           stage: { label: "Stage", fields: [{ key: "c_st", kind: "multi", label: "Stage", options: FIT_CARDS.filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })), get: (e) => e.stage }] },
// // //         };
// // //   // Indha tab la kaattura columns mattum (filter apply aaga)
// // //   const visibleCols =
// // //     tab === "tickets" ? ["ticketNo", "ticket", "raisedBy", "raisedTo", "date", "status"]
// // //       : tab === "bookings" ? ["tnr", "tour", ...(ALL ? ["by"] : []), "pax", "pay", "canc", "status"]
// // //         : ["code", "name", "trip", ...(ALL ? ["with"] : view === "fwdBy" ? ["fto", "with"] : view === "fwdTo" ? ["fby", "with"] : ["with"]), "value", "stage"];
// // //   const activeFields = visibleCols.flatMap((id) => COLS[id]?.fields || []);
// // //   const localDay = (d) => { if (!d) return ""; const x = new Date(d); return isNaN(x) ? "" : x.toLocaleDateString("en-CA"); };
// // //   const passCols = (r) => activeFields.every((f) => {
// // //     if (f.kind === "date") {
// // //       if (!cf.fromDate && !cf.toDate) return true;
// // //       const day = localDay(f.get(r));
// // //       return !!day && (!cf.fromDate || day >= cf.fromDate) && (!cf.toDate || day <= cf.toDate);
// // //     }
// // //     if (f.kind === "text") {
// // //       const t = String(cf[f.key] || "").trim().toLowerCase();
// // //       return !t || String(f.get(r) || "").toLowerCase().includes(t);
// // //     }
// // //     const want = String(cf[f.key] || "").split(",").map((x) => x.trim()).filter(Boolean);
// // //     if (!want.length) return true;
// // //     return [].concat(f.get(r)).some((v) => want.includes(String(v ?? "").trim()));
// // //   });
// // //   const applyCf = (o) => setCf((c) => ({ ...c, ...o }));
// // //   const head = (id, className = "") => (
// // //     <th key={id} className={`px-3 py-3 font-semibold ${className}`}>
// // //       <ColumnFilter label={COLS[id].label} fields={COLS[id].fields} filters={cf} onApply={applyCf} />
// // //     </th>
// // //   );
// // //   // Mobile — header illa, adhanaala filter chips
// // //   const mobileFilters = (hideFrom = "md") => (
// // //     <div className={`flex flex-wrap gap-1.5 border-b border-gray-100 px-4 py-2.5 ${hideFrom === "lg" ? "lg:hidden" : "md:hidden"}`}>
// // //       {visibleCols.map((id) => <ColumnFilter key={id} variant="chip" label={COLS[id].label} fields={COLS[id].fields} filters={cf} onApply={applyCf} />)}
// // //     </div>
// // //   );
// // //   const anyCol = Object.values(cf).some((v) => String(v || "").trim());
// // //   // Cards + money — column filter apply aagi (card click / search illaama)
// // //   const CB = base.filter(passCols);
// // //   const tCount = (k) => (k ? CB.filter((t) => t.status === k).length : CB.length);
// // //   const bCount = (k) => (k ? CB.filter((b) => b.state === k).length : CB.length);
// // //   const fCount = (k) => (k ? CB.filter((e) => e.stage === k).length : CB.length);

// // //   const rows =
// // //     tab === "tickets" ? tBase.filter((t) => (!card || t.status === card) && passCols(t) && has(t.ticketNo, t.subject, t.tnr, t.raisedBy, t.raisedTo))
// // //       : tab === "bookings" ? L.filter((b) => (!card || b.state === card) && passCols(b) && has(b.tnr, b.tour, b.customer, nameOf(b.empKey)))
// // //         : fBase.filter((e) => (!card || e.stage === card) && passCols(e) && has(e.fitCode, e.name, e.destination));

// // //   const inputCls = "rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100";
// // //   const pill = (on) => `rounded-xl px-4 py-2 text-sm font-semibold ${on ? "bg-white text-green-700 shadow" : "text-gray-600 hover:text-gray-900"}`;

// // //   return (
// // //     <div className="w-full min-w-0 max-w-7xl flex-1 p-3 pt-16 sm:p-5 sm:pt-16 lg:pt-5">
// // //       <div className="mb-5 text-center">
// // //         <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
// // //         <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
// // //         <span className="mx-auto mt-3 block h-1 w-14 rounded-full bg-green-500" aria-hidden="true" />
// // //       </div>

// // //       {/* ── Employee + dates ── */}
// // //       <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4">
// // //         <label className="w-full text-xs font-semibold text-gray-600 sm:w-auto sm:min-w-[16rem] sm:flex-1">Employee
// // //           <select value={emp} onChange={(e) => setEmp(e.target.value)} className={`mt-1 block w-full ${inputCls}`}>
// // //             <option value="*">All employees</option>
// // //             {employees.map((e) => (
// // //               <option key={e.key} value={e.key}>{e.name}{e.employeeId ? ` (${e.employeeId})` : ""}{e.role ? ` · ${e.role}` : ""}{e.status !== "Active" ? ` · ${e.status}` : ""}</option>
// // //             ))}
// // //           </select>
// // //         </label>
// // //         <div className="flex flex-wrap gap-1.5">
// // //           {PRESETS.map((p) => (
// // //             <button key={p.key} type="button" onClick={() => { setPreset(p.key); setRange(p.range()); }}
// // //               className={`rounded-full px-3 py-2 text-xs font-semibold ${preset === p.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
// // //               {p.label}
// // //             </button>
// // //           ))}
// // //         </div>
// // //         <label className="min-w-[9rem] flex-1 text-xs font-semibold text-gray-600 sm:flex-none">From
// // //           <input type="date" value={from} max={to || undefined} onChange={(e) => { setPreset(""); setRange([e.target.value, to]); }} className={`mt-1 block w-full ${inputCls}`} />
// // //         </label>
// // //         <label className="min-w-[9rem] flex-1 text-xs font-semibold text-gray-600 sm:flex-none">To
// // //           <input type="date" value={to} min={from || undefined} onChange={(e) => { setPreset(""); setRange([from, e.target.value]); }} className={`mt-1 block w-full ${inputCls}`} />
// // //         </label>
// // //       </div>

// // //       {!emp ? null : (
// // //         <>
// // //           {/* ── Who ── */}
// // //           <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
// // //             <div>
// // //               <p className="text-lg font-bold text-gray-900">{ALL ? "All employees" : me?.name}{!ALL && me?.employeeId ? <span className="font-medium text-gray-500"> · {me.employeeId}</span> : null}</p>
// // //               <p className="text-xs text-gray-500">{ALL ? "Pick an employee above to see only theirs" : `${me?.role || ""}${me?.status && me.status !== "Active" ? ` · ${me.status}` : ""}`} · {from ? fmtDate(from) : "All time"}{to ? ` – ${fmtDate(to)}` : ""}</p>
// // //             </div>
// // //             {tabs.length > 1 && (
// // //               <div className="flex w-full gap-1 rounded-2xl bg-gray-100 p-1 sm:w-auto" role="tablist">
// // //                 {tabs.map((k) => (
// // //                   <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`flex-1 sm:flex-none ${pill(tab === k)}`}>
// // //                     {k === "tickets" ? "🎫 Tickets" : k === "bookings" ? "🧳 Tour bookings" : "✈️ FIT"}
// // //                   </button>
// // //                 ))}
// // //               </div>
// // //             )}
// // //           </div>

// // //           {/* ── Views (ticket page / FIT page maadhiri) ── */}
// // //           {((!ALL && (tab === "tickets" || tab === "fit")) || (ALL && tab === "tickets")) && (
// // //             <div className="mb-3 flex flex-wrap gap-1 rounded-2xl bg-gray-100 p-1 sm:inline-flex">
// // //               {(tab === "tickets" ? (ALL ? ALL_TICKET_VIEWS : TICKET_VIEWS) : FIT_VIEWS).map((v) => (
// // //                 <button key={v.key} type="button" onClick={() => setView(v.key)} className={pill(view === v.key)}>{v.label}</button>
// // //               ))}
// // //             </div>
// // //           )}
// // //           {!ALL && tab === "fit" && (
// // //             <p className="-mt-1 mb-3 text-xs text-gray-500">{FIT_VIEWS.find((v) => v.key === view)?.hint}</p>
// // //           )}

// // //           {/* ── Edit history (oru employee) ── */}
// // //           {tab === "tickets" && view === "Edits" ? (
// // //             <EditHistoryPanel backendUrl={backendUrl} aToken={aToken} staffId={ALL ? "" : me?.staffId} all={ALL} from={from} to={to} />
// // //           ) : loading || !list ? (
// // //             <p className="py-10 text-center text-sm text-gray-500">Loading…</p>
// // //           ) : (
// // //             <>
// // //               {tab === "tickets" && (
// // //                 <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
// // //                   {TICKET_CARDS.map((c) => <Card key={c.label} c={c} count={tCount(c.key)} active={card === c.key} onClick={() => setCard(c.key)} />)}
// // //                 </div>
// // //               )}
// // //               {tab === "bookings" && (
// // //                 <>
// // //                   <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
// // //                     {BOOKING_CARDS.map((c) => <Card key={c.label} c={c} count={bCount(c.key)} active={card === c.key} onClick={() => setCard(c.key)} />)}
// // //                   </div>
// // //                   <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
// // //                     <Money label="Advance received" value={sum(CB, (b) => (countsMoney(b) && b.advance?.paid ? b.advance.amount : 0))} sub={`${CB.filter((b) => countsMoney(b) && b.advance?.paid).length} bookings · Active + Completed`} tone="text-green-700" />
// // //                     <Money label="Balance received" value={sum(CB, (b) => (countsMoney(b) && b.balance?.paid ? b.balance.amount : 0))} sub={`${CB.filter((b) => countsMoney(b) && b.balance?.paid).length} paid · ${CB.filter((b) => countsMoney(b) && !b.balance?.paid && !b.balance?.adjusted).length} pending`} tone="text-green-700" />
// // //                     <Money label="GV cancellation" value={sum(CB, (b) => b.gvCancellation)} />
// // //                     <Money label="IRCTC cancellation" value={sum(CB, (b) => b.irctcCancellation)} />
// // //                     <Money label="Refund" value={sum(CB, (b) => b.refund)} />
// // //                   </div>
// // //                 </>
// // //               )}
// // //               {tab === "fit" && (
// // //                 <>
// // //                   <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
// // //                     {FIT_CARDS.map((c) => <Card key={c.label} c={c} count={fCount(c.key)} active={card === c.key} onClick={() => setCard(c.key)} />)}
// // //                   </div>
// // //                   <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
// // //                     <Money label="Sales value (accepted)" value={sum(CB.filter((e) => ["Accepted", "Closed"].includes(e.stage)), (e) => e.salesValue)} tone="text-green-700" />
// // //                     <Money label="Cancellation charge" value={sum(CB, (e) => e.cancellationCharge)} sub={`${CB.filter((e) => e.cancellationCharge > 0).length} enquiries`} tone="text-rose-700" />
// // //                     {CB.some((e) => "gvVinoth" in e) && (
// // //                       <>
// // //                         <Money label="Vinoth share (GVEMP008)" value={sum(CB, (e) => e.gvVinoth)} sub={`${CB.filter((e) => e.gvVinoth > 0).length} enquiries`} tone="text-indigo-700" />
// // //                         <Money label="Giridharan share (GVEMP009)" value={sum(CB, (e) => e.gvGiridhar)} sub={`${CB.filter((e) => e.gvGiridhar > 0).length} enquiries`} tone="text-indigo-700" />
// // //                       </>
// // //                     )}
// // //                   </div>
// // //                 </>
// // //               )}

// // //               {/* ── List ── */}
// // //               <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
// // //                 <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-4 py-3">
// // //                   <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "tickets" ? "Search ticket no, subject, TNR" : tab === "bookings" ? "Search TNR, tour, customer" : "Search FIT code, name, place"} className={`w-full min-w-0 flex-1 sm:min-w-[14rem] ${inputCls}`} />
// // //                   {(card || q || anyCol) && <button type="button" onClick={() => { setCard(""); setQ(""); setCf({}); }} className="text-xs font-semibold text-red-600 hover:underline">Clear all</button>}
// // //                   <span className="text-xs text-gray-500">Showing {rows.length}</span>
// // //                 </div>
// // //                 {rows.length === 0 ? (
// // //                   <p className="px-4 py-10 text-center text-sm text-gray-500">Nothing here.</p>
// // //                 ) : tab === "tickets" ? (
// // //                   <>
// // //                     {mobileFilters()}
// // //                     {/* Mobile / tablet — cards */}
// // //                     <ul className="divide-y divide-gray-100 md:hidden">
// // //                       {rows.map((t) => (
// // //                         <li key={t._id} className="px-4 py-3">
// // //                           <div className="flex items-center justify-between gap-2">
// // //                             <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800">{t.ticketNo || "—"}</span>
// // //                             <Pill s={t.status} />
// // //                           </div>
// // //                           <p className="mt-1.5 font-semibold text-gray-900">{t.subject}</p>
// // //                           <p className="text-xs text-gray-500">{t.queryType}{t.tnr ? ` · TNR ${t.tnr}` : ""}</p>
// // //                           <p className="mt-1 text-xs text-gray-600"><span className="font-semibold">{t.raisedBy || "—"}</span> → <span className="font-semibold">{t.raisedTo || "—"}</span> · {fmtDate(t.createdAt)}</p>
// // //                         </li>
// // //                       ))}
// // //                     </ul>
// // //                     {/* Desktop — table */}
// // //                     <div className="hidden md:block">
// // //                       <table className="w-full table-fixed text-left text-sm">
// // //                         <thead className="bg-blue-50 text-xs text-gray-600"><tr>
// // //                           {head("ticketNo", "w-36")}{head("ticket")}{head("raisedBy", "w-[19%]")}
// // //                           {head("raisedTo", "w-[17%]")}{head("date", "w-36")}{head("status", "w-32")}
// // //                         </tr></thead>
// // //                         <tbody>
// // //                           {rows.map((t) => (
// // //                             <tr key={t._id} className="border-t border-gray-100 align-top">
// // //                               <td className="px-4 py-2.5"><span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800">{t.ticketNo || "—"}</span></td>
// // //                               <td className="px-4 py-2.5"><p className="truncate font-semibold text-gray-900">{t.subject}</p><p className="truncate text-xs text-gray-500">{t.queryType}{t.tnr ? ` · TNR ${t.tnr}` : ""}</p></td>
// // //                               <td className="truncate px-3 py-2.5 text-xs font-semibold" title={t.raisedBy}>{t.raisedBy || "—"}</td>
// // //                               <td className="truncate px-3 py-2.5 text-xs" title={t.raisedTo}>{t.raisedTo || "—"}</td>
// // //                               <td className="px-4 py-2.5 text-xs">{fmtDate(t.createdAt)}</td>
// // //                               <td className="px-4 py-2.5"><Pill s={t.status} /></td>
// // //                             </tr>
// // //                           ))}
// // //                         </tbody>
// // //                       </table>
// // //                     </div>
// // //                   </>
// // //                 ) : tab === "bookings" ? (
// // //                   <>
// // //                     {mobileFilters("lg")}
// // //                     {/* Mobile / tablet — cards */}
// // //                     <ul className="divide-y divide-gray-100 lg:hidden">
// // //                       {rows.map((b, i) => (
// // //                         <li key={`${b.tnr}-${i}`} className="px-4 py-3">
// // //                           <div className="flex items-center justify-between gap-2">
// // //                             <span className="font-mono text-sm font-bold text-amber-800">{b.tnr || "—"}</span>
// // //                             <span className="flex items-center gap-1.5">{b.requestedTr > 0 && <span className="text-[11px] font-semibold text-orange-700">{b.requestedTr} cancel request</span>}<Pill s={b.state} /></span>
// // //                           </div>
// // //                           <p className="mt-1 font-semibold text-gray-900">{b.tour}</p>
// // //                           <p className="text-xs text-gray-500">{b.customer || "—"} · {paxOf(b).a} pax{paxExtra(paxOf(b)) ? ` (${paxExtra(paxOf(b))})` : ""} · {fmtDate(b.bookingDate)}{ALL ? ` · ${nameOf(b.empKey)}` : ""}</p>
// // //                           <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl bg-gray-50 p-2.5 text-xs sm:grid-cols-3">
// // //                             <MoneyLine label="Advance" v={b.advance} />
// // //                             <MoneyLine label="Balance" v={b.balance} />
// // //                             <Kv label="GV cancel" v={b.gvCancellation} />
// // //                             <Kv label="IRCTC cancel" v={b.irctcCancellation} />
// // //                             <Kv label="Refund" v={b.refund} />
// // //                           </div>
// // //                         </li>
// // //                       ))}
// // //                     </ul>
// // //                     {/* Desktop — compact table (Advance + Balance oru column; GV / IRCTC / Refund oru column) */}
// // //                     <div className="hidden lg:block">
// // //                       <table className="w-full table-fixed text-left text-sm">
// // //                         <thead className="bg-blue-50 text-xs text-gray-600"><tr>
// // //                           {head("tnr", "w-28")}
// // //                           {head("tour")}
// // //                           {ALL && head("by", "w-[14%]")}
// // //                           {head("pax", "w-24")}
// // //                           {head("pay", "w-[20%]")}
// // //                           {head("canc", "w-[16%]")}
// // //                           {head("status", "w-36")}
// // //                         </tr></thead>
// // //                         <tbody>
// // //                           {rows.map((b, i) => (
// // //                             <tr key={`${b.tnr}-${i}`} className="border-t border-gray-100 align-top">
// // //                               <td className="px-3 py-2.5"><p className="font-mono text-xs font-bold text-amber-800">{b.tnr || "—"}</p><p className="text-[11px] text-gray-500">{fmtDate(b.bookingDate)}</p></td>
// // //                               <td className="px-3 py-2.5"><p className="truncate font-semibold text-gray-900" title={b.tour}>{b.tour}</p><p className="truncate text-xs text-gray-500" title={b.customer}>{b.customer || "—"}</p></td>
// // //                               {ALL && <td className="truncate px-3 py-2.5 text-xs font-semibold" title={nameOf(b.empKey)}>{nameOf(b.empKey)}</td>}
// // //                               <td className="px-3 py-2.5"><p className="font-semibold">{paxOf(b).a}</p>{paxOf(b).c > 0 && <p className="text-[11px] text-amber-700">{paxOf(b).c} cancelled</p>}{paxOf(b).r > 0 && <p className="text-[11px] text-red-600">{paxOf(b).r} rejected</p>}</td>
// // //                               <td className="px-3 py-2.5 text-xs"><MoneyLine label="Adv" v={b.advance} /><MoneyLine label="Bal" v={b.balance} /></td>
// // //                               <td className="px-3 py-2.5 text-xs">
// // //                                 {b.gvCancellation || b.irctcCancellation || b.refund ? (
// // //                                   <><Kv label="GV" v={b.gvCancellation} /><Kv label="IRCTC" v={b.irctcCancellation} /><Kv label="Refund" v={b.refund} /></>
// // //                                 ) : <span className="text-gray-400">—</span>}
// // //                               </td>
// // //                               <td className="px-3 py-2.5"><Pill s={b.state} />{b.requestedTr > 0 && <p className="mt-1 text-[11px] font-semibold text-orange-700">{b.requestedTr} cancel request</p>}</td>
// // //                             </tr>
// // //                           ))}
// // //                         </tbody>
// // //                       </table>
// // //                     </div>
// // //                     {/* Total — ellaa screen ku um */}
// // //                     <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-t-2 border-gray-200 bg-gray-50 px-4 py-3 text-xs sm:grid-cols-3 lg:grid-cols-6">
// // //                       <p className="col-span-2 text-sm font-bold sm:col-span-3 lg:col-span-1">Total · {rows.length} bookings<span className="block text-xs font-semibold text-gray-600">{sum(rows, (b) => paxOf(b).a)} active pax · {sum(rows, (b) => paxOf(b).c)} cancelled · {sum(rows, (b) => paxOf(b).r)} rejected</span></p>
// // //                       <Kv label="Advance paid" v={sum(rows, (b) => (countsMoney(b) && b.advance?.paid ? b.advance.amount : 0))} bold />
// // //                       <Kv label="Balance paid" v={sum(rows, (b) => (countsMoney(b) && b.balance?.paid ? b.balance.amount : 0))} bold />
// // //                       <Kv label="GV cancel" v={sum(rows, (b) => b.gvCancellation)} bold />
// // //                       <Kv label="IRCTC cancel" v={sum(rows, (b) => b.irctcCancellation)} bold />
// // //                       <Kv label="Refund" v={sum(rows, (b) => b.refund)} bold />
// // //                     </div>
// // //                   </>
// // //                 ) : (
// // //                   <>
// // //                     {mobileFilters("lg")}
// // //                     {/* Mobile / tablet — cards */}
// // //                     <ul className="divide-y divide-gray-100 lg:hidden">
// // //                       {rows.map((e) => (
// // //                         <li key={e._id} className="px-4 py-3">
// // //                           <div className="flex items-center justify-between gap-2">
// // //                             <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800">{e.fitCode || "—"}</span>
// // //                             <StagePill s={e.stage} />
// // //                           </div>
// // //                           <div className="mt-1.5 flex items-start justify-between gap-2">
// // //                             <div className="min-w-0">
// // //                               <p className="truncate font-semibold text-gray-900">{e.name}</p>
// // //                               {e.mobile && <p className="text-xs text-gray-500">📞 {e.mobile}</p>}
// // //                             </div>
// // //                           </div>
// // //                           <p className="mt-1 text-xs text-gray-600">Raised by <b className="text-gray-900">{raiserName(e)}</b></p>
// // //                           <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl bg-gray-50 p-2.5 text-xs sm:grid-cols-3">
// // //                             <p><span className="text-gray-500">Destination </span><b className="text-purple-800">{e.destination || "—"}</b>{duration(e) ? ` · ${duration(e)}` : ""}</p>
// // //                             <p><span className="text-gray-500">Travel </span><b>{e.travelDate ? fmtDate(e.travelDate) : "—"}</b></p>
// // //                             <p><span className="text-gray-500">Enquired </span>{fmtDate(e.createdAt)}</p>
// // //                             {e.pickupDate && <p><span className="text-gray-500">Pickup </span><b className="text-red-600">{fmtDate(e.pickupDate)}</b></p>}
// // //                             {e.salesValue > 0 && <p><span className="text-gray-500">Sales </span><b className="text-green-700">{inr(e.salesValue)}</b></p>}
// // //                             {e.cancellationCharge > 0 && <p><span className="text-gray-500">Cancellation </span><b className="text-rose-700">{inr(e.cancellationCharge)}</b></p>}
// // //                             {e.pax > 0 && <p><span className="text-gray-500">Pax </span>{e.pax}</p>}
// // //                           </div>
// // //                           <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
// // //                             <ZoneChips zones={e.zones} />
// // //                             {!ALL && view === "fwdBy" && <span>Forwarded to <b>{fwdNames(e.fwdOut)}</b></span>}
// // //                             {!ALL && view === "fwdTo" && <span>Forwarded by <b>{fwdNames(e.fwdIn)}</b></span>}
// // //                             {fitExtra.length > 0 && <span>Currently handled by <b>{ownerName(e)}</b></span>}
// // //                             {e.lastBy && <span className="text-gray-500">{ACTION_LABEL[e.lastBy.action] || "Updated"} by <b className="text-gray-800">{e.lastBy.key ? nameOf(e.lastBy.key) : e.lastBy.name || "—"}</b></span>}
// // //                           </div>
// // //                         </li>
// // //                       ))}
// // //                     </ul>
// // //                     {/* Desktop — table */}
// // //                     <div className="hidden lg:block">
// // //                       <table className="w-full table-fixed text-left text-sm">
// // //                         <thead className="bg-blue-50 text-xs text-gray-600"><tr>
// // //                           {head("code", "w-[15%]")}{head("name", "w-[17%]")}{head("trip")}
// // //                           {visibleCols.filter((id) => ["fto", "fby", "with"].includes(id)).map((id) => head(id, "w-[13%]"))}
// // //                           {head("value", "w-[11%]")}{head("stage", "w-[17%]")}
// // //                         </tr></thead>
// // //                         <tbody>
// // //                           {rows.map((e) => (
// // //                             <tr key={e._id} className="border-t border-gray-100 align-top hover:bg-gray-50/60">
// // //                               <td className="px-3 py-3">
// // //                                 <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800">{e.fitCode || "—"}</span>
// // //                                 <p className="mt-1.5 text-[11px] text-gray-500">{fmtDate(e.createdAt)}</p>
// // //                                 <p className="truncate text-[11px] text-gray-500" title={raiserName(e)}>by <b className="text-gray-700">{raiserName(e)}</b></p>
// // //                               </td>
// // //                               <td className="px-3 py-3">
// // //                                 <p className="truncate font-semibold text-gray-900" title={e.name}>{e.name || "—"}</p>
// // //                                 <p className="truncate text-xs text-gray-500">{[e.mobile, e.pax ? `${e.pax} pax` : ""].filter(Boolean).join(" · ")}</p>
// // //                               </td>
// // //                               <td className="px-3 py-3">
// // //                                 <p className="truncate"><b className="text-purple-800">{e.destination || "—"}</b><span className="text-xs text-gray-500">{duration(e) ? ` · ${duration(e)}` : ""}</span></p>
// // //                                 <p className="truncate text-xs text-gray-600">✈️ {e.travelDate ? fmtDate(e.travelDate) : "No date"}{e.pickupDate && <span className="font-semibold text-red-600"> · 🚌 {fmtDate(e.pickupDate)}</span>}</p>
// // //                                 {e.zones?.length > 0 && <div className="mt-1"><ZoneChips zones={e.zones} /></div>}
// // //                               </td>
// // //                               {!ALL && view === "fwdBy" && <td className="truncate px-3 py-3 text-xs font-semibold">{fwdNames(e.fwdOut)}</td>}
// // //                               {!ALL && view === "fwdTo" && <td className="truncate px-3 py-3 text-xs font-semibold">{fwdNames(e.fwdIn)}</td>}
// // //                               {fitExtra.length > 0 && <td className={`truncate px-3 py-3 text-xs font-semibold ${e.ownerKey ? "text-gray-900" : "text-gray-400"}`} title={ownerName(e)}>{ownerName(e)}</td>}
// // //                               <td className="px-3 py-3 text-xs">
// // //                                 {e.salesValue || e.cancellationCharge ? (
// // //                                   <>
// // //                                     {e.salesValue > 0 && <p className="font-semibold text-green-700">{inr(e.salesValue)}</p>}
// // //                                     {e.cancellationCharge > 0 && <p className="font-semibold text-rose-700">−{inr(e.cancellationCharge)} <span className="font-normal text-gray-500">cancel</span></p>}
// // //                                   </>
// // //                                 ) : <span className="text-gray-400">—</span>}
// // //                               </td>
// // //                               <td className="px-3 py-3">
// // //                                 <StagePill s={e.stage} />
// // //                                 {e.lastBy && (
// // //                                   <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-gray-500" title={`${ACTION_LABEL[e.lastBy.action] || "Updated"} by ${e.lastBy.key ? nameOf(e.lastBy.key) : e.lastBy.name || "—"}`}>
// // //                                     {ACTION_LABEL[e.lastBy.action] || "Updated"} by <b className="text-gray-700">{e.lastBy.key ? nameOf(e.lastBy.key) : e.lastBy.name || "—"}</b> · {fmtDate(e.lastBy.at)}
// // //                                   </p>
// // //                                 )}
// // //                               </td>
// // //                             </tr>
// // //                           ))}
// // //                         </tbody>
// // //                       </table>
// // //                     </div>
// // //                     <div className="flex flex-wrap justify-between gap-2 border-t-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold">
// // //                       <span>Total · {rows.length} enquiries</span><span className="flex flex-wrap gap-x-4"><span className="text-green-700">Sales value {inr(sum(rows, (e) => e.salesValue))}</span><span className="text-rose-700">Cancellation {inr(sum(rows, (e) => e.cancellationCharge))}</span></span>
// // //                     </div>
// // //                   </>
// // //                 )}
// // //               </div>
// // //             </>
// // //           )}
// // //         </>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default EmployeePerformance;


// // // ════════════════════════════════════════════════════════════════
// // //  EmployeePerformance.jsx — Admin panel (CEO tab) — SIMPLE scorecard
// // //  Mela oru employee select → avangaludhu mattum:
// // //    Tickets  : Raise / View Tickets page la varra adhe status cards + tabs
// // //    Bookings : Tour Bookings maadhiri status + amount cards
// // //    FIT      : FIT Enquiries page la varra stage cards (FitPerformance.jsx la)
// // //  Card click pannaa keezha list andha status ku filter aagum.
// // //  API: GET /api/touradmin/<api>?tab=&employee=&from=&to=
// // // ════════════════════════════════════════════════════════════════
// // import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
// // import axios from "axios";
// // import { ColumnFilter } from "../../components/TicketFilters"; // ticket page la irukkura header funnel filter
// // import { toast } from "react-toastify";
// // import { TourAdminContext } from "../../context/TourAdminContext"; // ⚙️ path check pannunga

// // // ─── Dates ───
// // const pad = (n) => String(n).padStart(2, "0");
// // const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// // const PRESETS = [
// //   { key: "all", label: "All time", range: () => ["", ""] },
// //   { key: "month", label: "This month", range: () => { const t = new Date(); return [ymd(new Date(t.getFullYear(), t.getMonth(), 1)), ymd(t)]; } },
// //   { key: "last", label: "Last month", range: () => { const t = new Date(); return [ymd(new Date(t.getFullYear(), t.getMonth() - 1, 1)), ymd(new Date(t.getFullYear(), t.getMonth(), 0))]; } },
// //   { key: "year", label: "This year", range: () => { const t = new Date(); return [ymd(new Date(t.getFullYear(), 0, 1)), ymd(t)]; } },
// // ];
// // const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");
// // const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

// // // ─── Status cards (ticket page / FIT page la irukkura adhe colours) ───
// // const TICKET_CARDS = [
// //   { key: "", label: "Total", cls: "border-slate-300 text-slate-900" },
// //   { key: "open", label: "Open", cls: "border-sky-300 text-sky-800" },
// //   { key: "pickup", label: "Picked up", cls: "border-violet-300 text-violet-800" },
// //   { key: "processing", label: "Processing", cls: "border-amber-300 text-amber-800" },
// //   { key: "close", label: "Closed", cls: "border-green-400 text-green-800" },
// //   { key: "reject", label: "Rejected", cls: "border-red-300 text-red-700" },
// // ];
// // const TICKET_VIEWS = [
// //   { key: "Assigned", label: "Assigned to them" },
// //   { key: "Raised", label: "Raised by them" },
// //   { key: "Forwarded", label: "Forwarded by them" },
// //   { key: "Edits", label: "✏️ Edit history" }, // avanga panna ticket edits (Raise Ticket → Edit History maadhiri)
// // ];
// // // All employees → Tickets / ellaa employees oda full edit history
// // const ALL_TICKET_VIEWS = [
// //   { key: "Assigned", label: "🎫 All tickets" },
// //   { key: "Edits", label: "✏️ Edit history (all employees)" },
// // ];
// // const BOOKING_CARDS = [
// //   { key: "", label: "Total bookings", cls: "border-slate-300 text-slate-900" },
// //   { key: "unverified", label: "Unverified", cls: "border-gray-400 text-gray-700" },
// //   { key: "active", label: "Active (Advance only paid)", cls: "border-green-400 text-green-800" },
// //   { key: "completed", label: "Completed (Booking completed)", cls: "border-yellow-400 text-yellow-800" },
// //   { key: "cancelled", label: "Fully cancelled", cls: "border-red-300 text-red-700" },
// //   { key: "tripCancelled", label: "Trip cancelled", cls: "border-rose-300 text-rose-700" },
// //   { key: "rejected", label: "Rejected", cls: "border-purple-300 text-purple-700" },
// // ];
// // const FIT_CARDS = [
// //   { key: "", label: "Total", cls: "border-slate-300 text-slate-900" },
// //   { key: "Pending", label: "Pending", cls: "border-orange-300 text-orange-800" },
// //   { key: "Picked up", label: "Pickup", cls: "border-sky-300 text-sky-800" },
// //   { key: "Rate shared", label: "Rate shared", cls: "border-yellow-300 text-yellow-800" },
// //   { key: "Accepted", label: "Accepted", cls: "border-green-400 text-green-800" },
// //   { key: "Closed", label: "Closed", cls: "border-slate-400 text-slate-700" },
// //   { key: "Cancelled", label: "Cancelled", cls: "border-rose-300 text-rose-800" },
// //   { key: "Rejected", label: "Rejected", cls: "border-red-300 text-red-700" },
// // ];
// // const FIT_VIEWS = [
// //   { key: "now", label: "Currently handling", hint: "Enquiries with this employee right now." },
// //   { key: "fwdBy", label: "Forwarded by them", hint: "Enquiries this employee forwarded to someone else." },
// //   { key: "fwdTo", label: "Forwarded to them", hint: "Enquiries someone else forwarded to this employee." },
// // ];
// // const STATUS_PILL = {
// //   open: ["Open", "bg-blue-50 text-blue-700"], pickup: ["Picked up", "bg-violet-50 text-violet-700"], processing: ["Processing", "bg-amber-50 text-amber-800"],
// //   close: ["Closed", "bg-green-50 text-green-700"], reject: ["Rejected", "bg-red-50 text-red-700"],
// //   active: ["Active", "bg-green-50 text-green-700"], unverified: ["Unverified", "bg-gray-100 text-gray-700"], completed: ["Completed", "bg-yellow-50 text-yellow-800"],
// //   cancelRequested: ["Cancellation requested", "bg-orange-50 text-orange-700"], cancelled: ["Fully cancelled", "bg-red-50 text-red-700"], tripCancelled: ["Trip cancelled", "bg-rose-50 text-rose-700"], rejected: ["Rejected", "bg-purple-50 text-purple-700"],
// // };
// // // Pax — Active (cancellation request um serthu) / Cancelled (trip cancel um) / Rejected thani thani
// // const paxOf = (b) => {
// //   const c = b.cancelledTr || 0, r = b.rejectedTr || 0;
// //   const a = b.activeTr != null ? (b.activeTr || 0) + (b.requestedTr || 0) : Math.max(0, (b.travellers || 0) - c - r);
// //   return { a, c, r };
// // };
// // const paxExtra = ({ c, r }) => [c ? `${c} cancelled` : "", r ? `${r} rejected` : ""].filter(Boolean).join(" · ");
// // // FIT — stage pill + "by …" (FIT Enquiries page maadhiri)
// // const STAGE_PILL = {
// //   Pending: "bg-gray-100 text-gray-700", "Picked up": "bg-sky-50 text-sky-700", "Rate shared": "bg-yellow-50 text-yellow-800",
// //   Accepted: "bg-green-50 text-green-700", Closed: "bg-slate-100 text-slate-700", Cancelled: "bg-rose-50 text-rose-700", Rejected: "bg-red-50 text-red-700",
// // };
// // const StagePill = ({ s }) => (
// //   <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${STAGE_PILL[s] || "bg-gray-100 text-gray-700"}`}>
// //     <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{s}
// //   </span>
// // );
// // const ACTION_LABEL = { created: "Created", pickedUp: "Picked up", rateShared: "Rate shared", accepted: "Accepted", closed: "Closed", cancelled: "Cancelled", rejected: "Rejected", reopened: "Reopened", forwarded: "Forwarded" };
// // const duration = (e) => (e.days ? `${e.days}D${e.nights != null ? `/${e.nights}N` : ""}` : "");
// // const ZoneChips = ({ zones }) => (zones?.length
// //   ? <div className="flex flex-wrap gap-1">{zones.map((z) => <span key={z} className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800">{z}</span>)}</div>
// //   : <span className="text-gray-400">—</span>);
// // // Kaasu received — Active bookings mattum
// // const countsMoney = (b) => b.state === "active" || b.state === "completed"; // Active + Completed mattum
// // const Pill = ({ s }) => {
// //   const [t, c] = STATUS_PILL[s] || [s, "bg-gray-100 text-gray-700"];
// //   return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${c}`}>{t}</span>;
// // };

// // // Clickable count card
// // const Card = ({ c, count, active, onClick, money }) => (
// //   <button type="button" onClick={onClick} aria-pressed={active}
// //     className={`rounded-2xl border-2 bg-white p-3 text-left transition ${active ? `${c.cls} shadow-md ring-2 ring-offset-1 ring-current` : `border-gray-200 hover:-translate-y-0.5 hover:shadow ${c.cls.split(" ").filter((x) => x.startsWith("text-")).join(" ")}`}`}>
// //     <p className="text-2xl font-bold tabular-nums">{money ? inr(count) : count}</p>
// //     <p className="mt-0.5 text-xs font-semibold text-gray-600">{c.label}</p>
// //   </button>
// // );
// // // Advance / Balance — amount + Paid / Pending (Cancellation la adjust aanaa adhu)
// // const MoneyLine = ({ label, v }) => (
// //   <p className="flex flex-wrap items-baseline gap-x-1">
// //     <span className="text-gray-500">{label}</span>
// //     {v?.adjusted ? <span className="text-gray-500">Adjusted in cancellation</span>
// //       : <><span className="font-semibold tabular-nums text-gray-900">{inr(v?.amount)}</span><span className={`font-semibold ${v?.paid ? "text-green-700" : "text-gray-400"}`}>{v?.paid ? "Paid" : "Pending"}</span></>}
// //   </p>
// // );
// // const Kv = ({ label, v, bold }) => (
// //   <p className="flex flex-wrap items-baseline gap-x-1">
// //     <span className="text-gray-500">{label}</span>
// //     <span className={`tabular-nums ${bold ? "font-bold text-gray-900" : "font-semibold text-gray-800"}`}>{v ? inr(v) : "—"}</span>
// //   </p>
// // );
// // const Money = ({ label, value, sub, tone = "text-gray-900" }) => (
// //   <div className="rounded-2xl border border-gray-200 bg-white p-3">
// //     <p className={`text-xl font-bold tabular-nums ${tone}`}>{inr(value)}</p>
// //     <p className="mt-0.5 text-xs font-semibold text-gray-600">{label}</p>
// //     {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
// //   </div>
// // );

// // // ─── Edit history — oru employee panna ticket edits (Admin Raise Ticket → Edit History maadhiri) ───
// // const EDIT_KIND = {
// //   query: ["Ticket edited", "bg-blue-50 text-blue-700"],
// //   "reply-edit": ["Reply edited", "bg-violet-50 text-violet-700"],
// //   "reply-delete": ["Reply deleted", "bg-red-50 text-red-700"],
// // };
// // const fmtDT = (d) =>
// //   d ? `${new Date(d).toLocaleDateString("en-IN")} ${new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}` : "—";
// // const byLabel = (e) => e.staffName || (e.by === "touradmin" ? "Tour admin" : "Admin");

// // const EditHistoryPanel = ({ backendUrl, aToken, staffId, all = false, from, to }) => {
// //   const [items, setItems] = useState(null);
// //   const [page, setPage] = useState(1);
// //   const [totalPages, setTotalPages] = useState(1);
// //   const [total, setTotal] = useState(0);
// //   const [search, setSearch] = useState("");
// //   const [term, setTerm] = useState("");
// //   const [hidden, setHidden] = useState({});

// //   useEffect(() => { setPage(1); }, [staffId, all, from, to, term]);
// //   useEffect(() => {
// //     const t = setTimeout(() => setTerm(search.trim()), 400);
// //     return () => clearTimeout(t);
// //   }, [search]);

// //   useEffect(() => {
// //     if (!staffId && !all) return;
// //     let alive = true;
// //     setItems(null);
// //     axios
// //       .get(`${backendUrl}/api/touradmin/queries/edit-history`, {
// //         headers: { aToken },
// //         params: { staff: all ? undefined : staffId, page, limit: 10, search: term || undefined, from: from || undefined, to: to || undefined },
// //       })
// //       .then(({ data }) => {
// //         if (!alive) return;
// //         if (!data?.success) throw new Error(data?.message || "Failed to load edit history");
// //         setItems(data.items || []);
// //         setTotalPages(data.totalPages || 1);
// //         setTotal(data.total || 0);
// //       })
// //       .catch((err) => {
// //         if (!alive) return;
// //         toast.error(err.response?.data?.message || err.message);
// //         setItems([]);
// //       });
// //     return () => { alive = false; };
// //   }, [backendUrl, aToken, staffId, all, page, term, from, to]);

// //   const edits = (items || []).reduce((n, q) => n + (q.edits?.length || 0), 0);

// //   return (
// //     <div className="space-y-4">
// //       <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
// //         <input
// //           value={search}
// //           onChange={(e) => setSearch(e.target.value)}
// //           placeholder="Search by ticket no (GVTKT001) or subject"
// //           className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
// //         />
// //         <span className="text-xs text-gray-500">{total} ticket{total !== 1 ? "s" : ""}{items ? ` · ${edits} edit${edits !== 1 ? "s" : ""} on this page` : ""}</span>
// //       </div>

// //       {!items ? (
// //         <p className="py-10 text-center text-sm text-gray-500">Loading…</p>
// //       ) : items.length === 0 ? (
// //         <p className="rounded-2xl border border-gray-200 bg-white py-10 text-center text-sm text-gray-500">{all ? "No edits by any employee" : "No edits by this employee"}{from || to ? " in this period" : ""}.</p>
// //       ) : (
// //         items.map((q) => {
// //           const isHidden = hidden[q.queryId];
// //           return (
// //             <div key={q.queryId} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
// //               <div className="flex flex-wrap items-start justify-between gap-2 bg-blue-50/60 px-4 py-3">
// //                 <div className="min-w-0">
// //                   <div className="flex flex-wrap items-center gap-2">
// //                     <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold tracking-wide text-blue-800">{q.ticketNo || "—"}</span>
// //                     <Pill s={q.status} />
// //                     <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-gray-700">{q.editCount} edit{q.editCount !== 1 ? "s" : ""}</span>
// //                   </div>
// //                   <p className="mt-1.5 truncate font-semibold text-gray-900">{q.subject}</p>
// //                 </div>
// //                 <div className="flex items-center gap-3 text-xs text-gray-600">
// //                   <span>Last edit {fmtDT(q.lastEditedAt)}</span>
// //                   <button type="button" onClick={() => setHidden((h) => ({ ...h, [q.queryId]: !h[q.queryId] }))} className="font-semibold text-blue-600 hover:underline">
// //                     {isHidden ? "Show" : "Hide"}
// //                   </button>
// //                 </div>
// //               </div>
// //               {!isHidden && (
// //                 <ol className="space-y-4 px-4 py-4">
// //                   {q.edits.map((e) => {
// //                     const [kLabel, kCls] = EDIT_KIND[e.kind] || EDIT_KIND.query;
// //                     return (
// //                       <li key={e.id} className="relative pl-6">
// //                         <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-blue-500" aria-hidden="true" />
// //                         <div className="flex flex-wrap items-center gap-2 text-sm">
// //                           <span className="font-bold text-gray-900">Edit {e.editNo}</span>
// //                           <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${kCls}`}>{kLabel}</span>
// //                           <span className="text-gray-500">by <b className="text-gray-800">{byLabel(e)}</b></span>
// //                           <span className="text-xs text-gray-500">{fmtDT(e.editedAt)}</span>
// //                         </div>
// //                         <div className="mt-2 space-y-2 rounded-xl border border-gray-100 p-2">
// //                           {(e.changes || []).map((c, i) => (
// //                             <div key={i} className="grid gap-2 md:grid-cols-[10rem_1fr_1fr]">
// //                               <p className="px-1 py-1 text-sm font-semibold text-gray-700">{c.label}</p>
// //                               <div className="rounded-lg bg-red-50 px-3 py-2">
// //                                 <p className="text-[11px] font-bold uppercase tracking-wide text-red-700">Before</p>
// //                                 <p className="whitespace-pre-line break-words text-sm text-gray-800">{c.before || "—"}</p>
// //                               </div>
// //                               <div className="rounded-lg bg-green-50 px-3 py-2">
// //                                 <p className="text-[11px] font-bold uppercase tracking-wide text-green-700">After</p>
// //                                 <p className="whitespace-pre-line break-words text-sm text-gray-800">{c.after || "—"}</p>
// //                               </div>
// //                             </div>
// //                           ))}
// //                         </div>
// //                       </li>
// //                     );
// //                   })}
// //                 </ol>
// //               )}
// //             </div>
// //           );
// //         })
// //       )}

// //       {totalPages > 1 && (
// //         <div className="flex items-center justify-end gap-2 text-sm">
// //           <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Previous</button>
// //           <span className="text-gray-600">Page {page} of {totalPages}</span>
// //           <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Next</button>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };


// // // ════════════════════════════════════════════════════════════════
// // //  PDF — screen la theriyura list (filters / card / search apply aagi) appadiye A4 landscape la
// // //  Employee Performance (Tickets / Bookings) + FIT Performance rendukkum idhe
// // // ════════════════════════════════════════════════════════════════
// // const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// // const PDF_ROWS = 10; // oru page ku max 10 rows (perusa irukkura rows na page la fit aagura alavu)
// // // Page la irukkura adhe pill colours
// // const PDF_PILL = {
// //   open: ["#EFF6FF", "#1D4ED8"], pickup: ["#F5F3FF", "#6D28D9"], processing: ["#FFFBEB", "#92400E"], close: ["#F0FDF4", "#15803D"], reject: ["#FEF2F2", "#B91C1C"],
// //   active: ["#F0FDF4", "#15803D"], unverified: ["#F3F4F6", "#374151"], completed: ["#FEFCE8", "#854D0E"], cancelRequested: ["#FFF7ED", "#C2410C"],
// //   cancelled: ["#FEF2F2", "#B91C1C"], tripCancelled: ["#FFF1F2", "#BE123C"], rejected: ["#FAF5FF", "#7E22CE"],
// //   Pending: ["#F3F4F6", "#374151"], "Picked up": ["#F0F9FF", "#0369A1"], "Rate shared": ["#FEFCE8", "#854D0E"], Accepted: ["#F0FDF4", "#15803D"],
// //   Closed: ["#F1F5F9", "#334155"], Cancelled: ["#FFF1F2", "#BE123C"], Rejected: ["#FEF2F2", "#B91C1C"],
// // };
// // // Page cards oda adhe number colour (Tailwind text-* → hex)
// // const TW_TEXT = {
// //   "slate-900": "#0F172A", "slate-700": "#334155", "sky-800": "#075985", "violet-800": "#5B21B6", "amber-800": "#92400E",
// //   "green-800": "#166534", "red-700": "#B91C1C", "gray-700": "#374151", "yellow-800": "#854D0E", "rose-700": "#BE123C",
// //   "rose-800": "#9F1239", "purple-700": "#7E22CE", "orange-800": "#9A3412",
// // };
// // const cardColor = (cls = "") => TW_TEXT[(cls.match(/text-([a-z]+-\d+)/) || [])[1]] || "#111827";
// // const pdfPill = (key, label) => {
// //   const [bg, fg] = PDF_PILL[key] || ["#F3F4F6", "#374151"];
// //   return `<span class="pill" style="background:${bg};color:${fg}"><i style="background:${fg}"></i>${esc(label)}</span>`;
// // };
// // const buildPerfPdfHtml = ({ title, who, period, viewText, filterText, cards, money, head, rows, foot }) => {
// //   const now = new Date();
// //   const gen = `${now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
// //   const colgroup = `<colgroup><col style="width:46px">${head.map((h) => `<col${h[1] ? ` style="width:${h[1]}"` : ""}>`).join("")}</colgroup>`;
// //   const thead = `<thead><tr><th class="n">#</th>${head.map((h) => `<th${h[2] ? ` class="r"` : ""}>${esc(h[0])}</th>`).join("")}</tr></thead>`;
// //   // 2 rows: mela counts, keezha amounts
// //   const strip = `<div class="strip">${cards.map((c) => `<div class="card"><b style="color:${c[2] || "#111827"}">${esc(c[1])}</b><span>${esc(c[0])}</span></div>`).join("")}</div>`
// //     + (money?.length ? `<div class="strip money">${money.map((c) => `<div class="card m"><b style="color:${c[2] || "#111827"}">${esc(c[1])}</b><span>${esc(c[0])}</span>${c[3] ? `<em>${esc(c[3])}</em>` : ""}</div>`).join("")}</div>` : "");
// //   const pageTpl = `<section class="page">
// //       <header class="hd">
// //         <div><h1>${esc(title)}</h1><div class="sub">${esc(viewText)}</div></div>
// //         <div class="who">${esc(who)}<span>${esc(period)}</span></div>
// //       </header>
// //       <div class="first">${filterText ? `<div class="ft"><b>Filters:</b> ${esc(filterText)}</div>` : ""}${strip}</div>
// //       <div class="tw"><table>${colgroup}${thead}<tbody></tbody></table></div>
// //       <footer class="pf"><span>Generated on ${esc(gen)}</span><span class="pno"></span></footer>
// //     </section>`;
// //   // Rows <template> la — browser la alandhu page page ah pirikkum (10 rows / page la fit aagura alavu)
// //   return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)} - ${esc(who)}</title>
// // <style>
// //   @page { size: A4 landscape; margin: 8mm; }
// //   * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
// //   body { margin: 0; font-family: "Segoe UI", Roboto, Arial, sans-serif; color: #111827; background: #EEF1F4; font-size: 13.5px; }
// //   .bar { position: sticky; top: 0; z-index: 2; display: flex; gap: 8px; justify-content: center; padding: 10px; background: #fff; border-bottom: 1px solid #E5E7EB; }
// //   .bar button { border: 0; border-radius: 8px; padding: 8px 18px; font-weight: 600; font-size: 13px; cursor: pointer; background: #16A34A; color: #fff; }
// //   .bar button.sec { background: #E5E7EB; color: #374151; }
// //   .page { width: 281mm; height: 193mm; overflow: hidden; margin: 14px auto; background: #fff; display: flex; flex-direction: column; }
// //   @media screen { .page { width: 297mm; height: 209mm; padding: 8mm; box-shadow: 0 1px 6px rgba(0,0,0,.08); } }
// //   .page > * { flex-shrink: 0; }
// //   .hd { display: flex; justify-content: space-between; align-items: flex-end; gap: 14px; border-bottom: 3px solid #16A34A; padding-bottom: 6px; }
// //   .hd h1 { margin: 0; font-size: 20px; color: #111827; }
// //   .hd .sub { margin-top: 2px; font-size: 12px; color: #4B5563; }
// //   .hd .who { text-align: right; font-size: 15px; font-weight: 700; }
// //   .hd .who span { display: block; margin-top: 1px; font-size: 12px; font-weight: 600; color: #2563EB; }
// //   .ft { margin-top: 6px; font-size: 11px; color: #4B5563; }
// //   .strip { display: flex; gap: 10px; margin-top: 10px; }
// //   .card { flex: 1 1 0; min-width: 0; border: 1px solid #E5E7EB; border-radius: 10px; padding: 8px 8px; text-align: center; }
// //   .card b { display: block; font-size: 22px; line-height: 1.2; }
// //   .card span { display: block; margin-top: 3px; font-size: 10.5px; line-height: 1.25; color: #6B7280; font-weight: 600; }
// //   .strip.money { margin-top: 16px; }
// //   .card.m { background: #fff; border-color: #E5E7EB; } .card.m b { font-size: 20px; }
// //   .card.m em { display: block; margin-top: 2px; font-style: normal; font-size: 10.5px; color: #6B7280; }
// //   .tw { margin-top: 14px; display: flex; flex-direction: column; }
// //   .page.full .tw { flex: 1 1 auto; } .page.full table { flex: 1 1 auto; height: 100%; }
// //   table { width: 100%; border-collapse: collapse; table-layout: fixed; }
// //   th { background: #DBEAFE; color: #1E3A8A; font-size: 13.5px; font-weight: 700; text-align: left; padding: 9px 9px; border: 1px solid #94A3B8; }
// //   td { padding: 8px 9px; border: 1px solid #CBD5E1; vertical-align: middle; text-align: left; word-wrap: break-word; overflow-wrap: anywhere; line-height: 1.35; }
// //   tbody tr:nth-child(even) td { background: #F8FAFC; }
// //   th.n, td.n { text-align: center; white-space: nowrap; overflow-wrap: normal; } td.n { color: #6B7280; }
// //   .r { text-align: left; }
// //   .d { display: block; }
// //   .s { color: #4B5563; font-size: 12.5px; } .b { font-weight: 700; color: #111827; }
// //   .chip { display: inline-block; border-radius: 6px; background: #EFF6FF; color: #1E40AF; font-weight: 700; padding: 2px 8px; font-size: 13px; }
// //   .tnr { font-family: ui-monospace, Menlo, monospace; font-weight: 700; color: #92400E; }
// //   .dest { font-weight: 700; color: #6B21A8; } .pk { color: #DC2626; font-weight: 600; }
// //   .zone { display: inline-block; margin: 3px 3px 0 0; border-radius: 5px; background: #ECFDF5; color: #065F46; font-weight: 600; font-size: 11.5px; padding: 1px 7px; }
// //   .muted { color: #9CA3AF; font-weight: 600; }
// //   .desc { margin-top: 3px; font-size: 12.5px; color: #374151; white-space: pre-line; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
// //   .g { color: #15803D; font-weight: 700; } .red { color: #BE123C; font-weight: 700; } .amb { color: #B45309; } .rj { color: #DC2626; } .or { color: #C2410C; font-weight: 600; }
// //   .pill { display: inline-flex; align-items: center; gap: 5px; max-width: 100%; border-radius: 999px; padding: 3px 9px; font-size: 12.5px; font-weight: 600; white-space: nowrap; }
// //   .pill i { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
// //   .kv { display: block; } .kv .s { margin-right: 3px; }
// //   tfoot td { background: #F1F5F9; font-weight: 700; border-top: 2px solid #64748B; vertical-align: middle; }
// //   td.empty { text-align: center; color: #6B7280; padding: 20px; }
// //   .pf { margin-top: auto; padding-top: 5px; display: flex; justify-content: space-between; font-size: 10px; color: #9CA3AF; }
// //   @media print {
// //     body { background: #fff; } .bar { display: none; }
// //     .page { margin: 0; page-break-after: always; break-after: page; }
// //     .page:last-child { page-break-after: auto; break-after: auto; }
// //   }
// // </style></head><body>
// //   <div class="bar"><button onclick="window.print()">Save as PDF</button><button class="sec" onclick="window.close()">Close</button></div>
// //   <div id="pages"></div>
// //   <template id="tpl">${pageTpl}</template>
// //   <template id="rows"><table><tbody>${rows.join("") || `<tr><td colspan="${head.length + 1}" class="empty">No records</td></tr>`}</tbody>${foot ? `<tfoot>${foot}</tfoot>` : ""}</table></template>
// //   <script>
// //   (function () {
// //     var MAX = ${PDF_ROWS};
// //     var holder = document.getElementById("pages");
// //     var src = document.getElementById("rows").content;
// //     var rows = Array.prototype.slice.call(src.querySelectorAll("tbody > tr"));
// //     var tfoot = src.querySelector("tfoot");
// //     var pages = [];
// //     function newPage() {
// //       var pg = document.getElementById("tpl").content.firstElementChild.cloneNode(true);
// //       if (pages.length) pg.querySelector(".first").remove();
// //       holder.appendChild(pg); pages.push(pg); return pg;
// //     }
// //     function over(pg) { return pg.scrollHeight > pg.clientHeight + 1; }
// //     var pg = newPage(), body = pg.querySelector("tbody"), n = 0;
// //     rows.forEach(function (tr) {
// //       if (n >= MAX) { pg = newPage(); body = pg.querySelector("tbody"); n = 0; }
// //       body.appendChild(tr); n++;
// //       if (n > 1 && over(pg)) { body.removeChild(tr); pg = newPage(); body = pg.querySelector("tbody"); body.appendChild(tr); n = 1; }
// //     });
// //     if (tfoot) {
// //       // Total row kadaisi page la; idam illaatti kadaisi row + total pudhu page ku
// //       var t = pg.querySelector("table"); t.appendChild(tfoot);
// //       if (over(pg) && body.children.length > 1) {
// //         var lastRow = body.lastElementChild;
// //         t.removeChild(tfoot); body.removeChild(lastRow);
// //         pg = newPage(); body = pg.querySelector("tbody"); body.appendChild(lastRow); pg.querySelector("table").appendChild(tfoot);
// //       }
// //     }
// //     pages.forEach(function (p, i) {
// //       p.querySelector(".pno").textContent = "Page " + (i + 1) + " of " + pages.length;
// //       if (p.querySelectorAll("tbody > tr").length >= MAX) p.classList.add("full");
// //     });
// //     setTimeout(function () { try { window.print(); } catch (e) {} }, 400);
// //   })();
// //   </script>
// // </body></html>`;
// // };

// // // ════════════════════════════════════════════════════════════════
// // const EmployeePerformance = ({
// //   tabs = ["tickets", "bookings"],
// //   api = "employee-performance",
// //   title = "Employee Performance",
// //   subtitle = "All employees together — pick one employee to see only theirs.",
// // }) => {
// //   const { aToken, backendUrl } = useContext(TourAdminContext);
// //   const [tab, setTab] = useState(tabs[0]);
// //   const [preset, setPreset] = useState("all");
// //   const [[from, to], setRange] = useState(["", ""]);
// //   const [employees, setEmployees] = useState([]);
// //   const [allEmps, setAllEmps] = useState(new Map()); // key → name (Tour admin / Website kooda)
// //   const [emp, setEmp] = useState("*"); // "*" = ellaa employees um (Tour admin page maadhiri), illa "staff:<id>"
// //   const [list, setList] = useState(null);
// //   const [loading, setLoading] = useState(false);
// //   const [view, setView] = useState(tabs[0] === "fit" ? "now" : "Assigned"); // ticket / FIT view
// //   const [card, setCard] = useState(""); // card filter
// //   const [q, setQ] = useState("");

// //   const get = useCallback(
// //     async (params) => {
// //       const { data } = await axios.get(`${backendUrl}/api/touradmin/${api}`, { headers: { aToken }, params });
// //       if (!data?.success) throw new Error(data?.message || "Failed to load");
// //       return data;
// //     },
// //     [backendUrl, aToken, api],
// //   );

// //   // Employee list (staff mattum)
// //   useEffect(() => {
// //     get({ tab: tabs[0], from: "2999-01-01" }) // list mattum venum — data illaadha date
// //       .then((d) => setEmployees((d.employees || []).filter((e) => e.type === "staff" && e.staffId).sort((a, b) => (a.status === "Active" ? 0 : 1) - (b.status === "Active" ? 0 : 1) || a.name.localeCompare(b.name))))
// //       .catch((err) => toast.error(err.response?.data?.message || err.message));
// //   }, [get]); // eslint-disable-line react-hooks/exhaustive-deps

// //   const reqId = useRef(0); // late-aa vandha pazhaya response (vera tab / employee) list-a maathakoodaadhu
// //   const load = useCallback(async () => {
// //     const id = ++reqId.current;
// //     if (!emp) { setList(null); return; }
// //     setLoading(true);
// //     setList(null);
// //     try {
// //       const d = await get({ tab, employee: emp, from: from || undefined, to: to || undefined });
// //       if (id !== reqId.current) return;
// //       setList(d[tab]?.details || []);
// //       setAllEmps(new Map((d.employees || []).map((e) => [e.key, e.name])));
// //     } catch (err) {
// //       if (id !== reqId.current) return;
// //       toast.error(err.response?.data?.message || err.message);
// //       setList([]);
// //     } finally {
// //       if (id === reqId.current) setLoading(false);
// //     }
// //   }, [get, tab, emp, from, to]);
// //   useEffect(() => { load(); }, [load]);
// //   const [cf, setCf] = useState({}); // column filters { key: value }
// //   useEffect(() => { setCard(""); setQ(""); setCf({}); }, [tab, emp, view]);
// //   useEffect(() => { setView(tab === "fit" ? "now" : "Assigned"); }, [tab]);

// //   const me = employees.find((e) => e.key === emp);
// //   const ALL = emp === "*";
// //   const nameOf = (k) => allEmps.get(k) || (k ? k.replace(/^name:/, "") : "—");
// //   const L = list || [];

// //   // ─── Tickets ───
// //   const tBase = useMemo(() => (tab === "tickets" ? (ALL ? L : L.filter((t) => (t.roles || []).includes(view))) : []), [L, tab, view, ALL]);

// //   // ─── Bookings ───

// //   const sum = (arr, fn) => arr.reduce((a, x) => a + (Number(fn(x)) || 0), 0);
// //   // ─── FIT ───
// //   const fBase = useMemo(() => {
// //     if (tab !== "fit") return [];
// //     if (ALL) return L;
// //     if (view === "fwdBy") return L.filter((e) => e.fwdOut?.length);
// //     if (view === "fwdTo") return L.filter((e) => e.fwdIn?.length);
// //     return L.filter((e) => e.withMe);
// //   }, [L, tab, view, ALL]);
// //   const fwdNames = (arr) => [...new Set((arr || []).map((f) => (f.key ? nameOf(f.key) : f.label) || "—"))].join(", ");
// //   const fitExtra = ALL ? ["With"] : view === "fwdBy" ? ["Forwarded to", "Now with"] : view === "fwdTo" ? ["Forwarded by", "Now with"] : ["Now with"]; // "Handled by now" column eppavum


// //   // List — card + search filter
// //   const s = q.trim().toLowerCase();
// //   const has = (...xs) => !s || xs.some((x) => String(x || "").toLowerCase().includes(s));
// //   // ─── Column filters — ticket page maadhiri header la funnel (ColumnFilter) ───
// //   // Ovvoru field: kind multi (comma string) / text / date + get(row) → value (or array)
// //   const opts = (arr, fn) => [...new Set(arr.flatMap((x) => [].concat(fn(x))).map((v) => String(v ?? "").trim()).filter(Boolean))]
// //     .sort((x, y) => x.localeCompare(y)).map((v) => ({ value: v, label: v }));
// //   const fixed = (pairs) => pairs.map(([value, label]) => ({ value, label }));
// //   const base = tab === "tickets" ? tBase : tab === "bookings" ? L : fBase;
// //   const paxTags = (b) => { const p = paxOf(b); return [p.c ? "c" : "", p.r ? "r" : "", !p.c && !p.r ? "none" : ""].filter(Boolean); };
// //   const cancTags = (b) => { const t = [b.gvCancellation > 0 && "gv", b.irctcCancellation > 0 && "irctc", b.refund > 0 && "refund"].filter(Boolean); return t.length ? t : ["none"]; };
// //   const monthOf = (d) => { if (!d) return "No date"; const x = new Date(d); return isNaN(x) ? "No date" : x.toLocaleDateString("en-IN", { month: "short", year: "numeric" }); };
// //   const ownerName = (e) => (e.ownerKey ? nameOf(e.ownerKey) : "Not picked yet");
// //   const raiserName = (e) => (e.raisedByWho?.key ? nameOf(e.raisedByWho.key) : e.raisedByWho?.name || "—");
// //   const splitNames = (arr) => fwdNames(arr).split(", ").filter(Boolean);
// //   const COLS =
// //     tab === "tickets" ? {
// //       ticketNo: { label: "Ticket no", fields: [{ key: "c_tno", kind: "text", label: "Ticket no contains", placeholder: "e.g. GVTKT033", get: (t) => t.ticketNo }] },
// //       ticket: {
// //         label: "Ticket", fields: [
// //           { key: "c_subj", kind: "text", label: "Subject / TNR / description contains", placeholder: "e.g. Advance or XQ08ZT", get: (t) => `${t.subject || ""} ${t.tnr || ""} ${t.description || ""}` },
// //           { key: "c_type", kind: "multi", label: "Ticket type", options: opts(base, (t) => t.queryType), get: (t) => t.queryType },
// //         ]
// //       },
// //       raisedBy: { label: "Raised by", fields: [{ key: "c_by", kind: "multi", label: "Raised by", search: true, options: opts(base, (t) => t.raisedBy), get: (t) => t.raisedBy }] },
// //       raisedTo: { label: "Raised to", fields: [{ key: "c_to", kind: "multi", label: "Raised to", search: true, options: opts(base, (t) => t.raisedTo), get: (t) => t.raisedTo }] },
// //       date: { label: "Raised on", fields: [{ key: "date", kind: "date", label: "Raised on", get: (t) => t.createdAt }] },
// //       status: { label: "Status", fields: [{ key: "c_st", kind: "multi", label: "Status", options: TICKET_CARDS.filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })), get: (t) => t.status }] },
// //     }
// //       : tab === "bookings" ? {
// //         tnr: {
// //           label: "TNR", fields: [
// //             { key: "c_tnr", kind: "text", label: "TNR contains", placeholder: "e.g. UF08IX", get: (b) => b.tnr },
// //             { key: "date", kind: "date", label: "Booked on", get: (b) => b.bookingDate },
// //           ]
// //         },
// //         tour: {
// //           label: "Tour / Customer", fields: [
// //             { key: "c_tour", kind: "multi", label: "Tour", search: true, options: opts(base, (b) => b.tour), get: (b) => b.tour },
// //             { key: "c_cust", kind: "text", label: "Customer contains", placeholder: "Customer name", get: (b) => b.customer },
// //           ]
// //         },
// //         by: { label: "Booked by", fields: [{ key: "c_by", kind: "multi", label: "Booked by", search: true, options: opts(base, (b) => nameOf(b.empKey)), get: (b) => nameOf(b.empKey) }] },
// //         pax: { label: "Pax", fields: [{ key: "c_pax", kind: "multi", label: "Pax", options: fixed([["c", "Has cancelled pax"], ["r", "Has rejected pax"], ["none", "No cancelled / rejected"]]), get: paxTags }] },
// //         pay: {
// //           label: "Advance / Balance", fields: [
// //             { key: "c_adv", kind: "multi", label: "Advance", options: fixed([["paid", "Paid"], ["pending", "Pending"]]), get: (b) => (b.advance?.paid ? "paid" : "pending") },
// //             { key: "c_bal", kind: "multi", label: "Balance", options: fixed([["paid", "Paid"], ["pending", "Pending"], ["adjusted", "Adjusted in cancellation"]]), get: (b) => (b.balance?.adjusted ? "adjusted" : b.balance?.paid ? "paid" : "pending") },
// //           ]
// //         },
// //         canc: { label: "Cancellation", fields: [{ key: "c_canc", kind: "multi", label: "Cancellation", options: fixed([["gv", "Has GV"], ["irctc", "Has IRCTC"], ["refund", "Has refund"], ["none", "No cancellation"]]), get: cancTags }] },
// //         status: { label: "Status", fields: [{ key: "c_st", kind: "multi", label: "Status", options: BOOKING_CARDS.filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })), get: (b) => b.state }] },
// //       }
// //         : {
// //           code: {
// //             label: "Enquiry", fields: [
// //               { key: "c_code", kind: "text", label: "FIT code contains", placeholder: "e.g. GVFIT0030", get: (e) => e.fitCode },
// //               { key: "date", kind: "date", label: "Enquired on", get: (e) => e.createdAt },
// //               { key: "c_raised", kind: "multi", label: "Raised by", search: true, options: opts(base, raiserName), get: raiserName },
// //             ]
// //           },
// //           name: {
// //             label: "Customer", fields: [
// //               { key: "c_name", kind: "text", label: "Name / mobile contains", placeholder: "Name or mobile", get: (e) => `${e.name || ""} ${e.mobile || ""}` },
// //             ]
// //           },
// //           trip: {
// //             label: "Trip", fields: [
// //               { key: "c_dest", kind: "multi", label: "Destination", search: true, options: opts(base, (e) => e.destination), get: (e) => String(e.destination || "").trim() },
// //               { key: "c_ttype", kind: "multi", label: "Tour type", options: opts(base, (e) => e.tourType), get: (e) => e.tourType },
// //               { key: "c_tmonth", kind: "multi", label: "Travel month", options: opts(base, (e) => monthOf(e.travelDate)), get: (e) => monthOf(e.travelDate) },
// //               { key: "c_zone", kind: "multi", label: "Zone", options: opts(base, (e) => e.zones || []), get: (e) => (e.zones?.length ? e.zones : ["No zone"]) },
// //             ]
// //           },
// //           fto: { label: "Forwarded to", fields: [{ key: "c_fto", kind: "multi", label: "Forwarded to", search: true, options: opts(base, (e) => splitNames(e.fwdOut)), get: (e) => splitNames(e.fwdOut) }] },
// //           fby: { label: "Forwarded by", fields: [{ key: "c_fby", kind: "multi", label: "Forwarded by", search: true, options: opts(base, (e) => splitNames(e.fwdIn)), get: (e) => splitNames(e.fwdIn) }] },
// //           with: { label: "Handled by now", fields: [{ key: "c_with", kind: "multi", label: "Currently handled by", search: true, options: opts(base, ownerName), get: ownerName }] },
// //           value: {
// //             label: "Value", fields: [
// //               { key: "c_sales", kind: "multi", label: "Sales value", options: fixed([["yes", "Has sales value"], ["no", "No sales value"]]), get: (e) => (e.salesValue > 0 ? "yes" : "no") },
// //               { key: "c_canc", kind: "multi", label: "Cancellation charge", options: fixed([["yes", "Has cancellation charge"], ["no", "No cancellation charge"]]), get: (e) => (e.cancellationCharge > 0 ? "yes" : "no") },
// //             ]
// //           },
// //           stage: { label: "Stage", fields: [{ key: "c_st", kind: "multi", label: "Stage", options: FIT_CARDS.filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })), get: (e) => e.stage }] },
// //         };
// //   // Indha tab la kaattura columns mattum (filter apply aaga)
// //   const visibleCols =
// //     tab === "tickets" ? ["ticketNo", "ticket", "raisedBy", "raisedTo", "date", "status"]
// //       : tab === "bookings" ? ["tnr", "tour", ...(ALL ? ["by"] : []), "pax", "pay", "canc", "status"]
// //         : ["code", "name", "trip", ...(ALL ? ["with"] : view === "fwdBy" ? ["fto", "with"] : view === "fwdTo" ? ["fby", "with"] : ["with"]), "value", "stage"];
// //   const activeFields = visibleCols.flatMap((id) => COLS[id]?.fields || []);
// //   const localDay = (d) => { if (!d) return ""; const x = new Date(d); return isNaN(x) ? "" : x.toLocaleDateString("en-CA"); };
// //   const passCols = (r) => activeFields.every((f) => {
// //     if (f.kind === "date") {
// //       if (!cf.fromDate && !cf.toDate) return true;
// //       const day = localDay(f.get(r));
// //       return !!day && (!cf.fromDate || day >= cf.fromDate) && (!cf.toDate || day <= cf.toDate);
// //     }
// //     if (f.kind === "text") {
// //       const t = String(cf[f.key] || "").trim().toLowerCase();
// //       return !t || String(f.get(r) || "").toLowerCase().includes(t);
// //     }
// //     const want = String(cf[f.key] || "").split(",").map((x) => x.trim()).filter(Boolean);
// //     if (!want.length) return true;
// //     return [].concat(f.get(r)).some((v) => want.includes(String(v ?? "").trim()));
// //   });
// //   const applyCf = (o) => setCf((c) => ({ ...c, ...o }));
// //   const head = (id, className = "") => (
// //     <th key={id} className={`px-3 py-3 font-semibold ${className}`}>
// //       <ColumnFilter label={COLS[id].label} fields={COLS[id].fields} filters={cf} onApply={applyCf} />
// //     </th>
// //   );
// //   // Mobile — header illa, adhanaala filter chips
// //   const mobileFilters = (hideFrom = "md") => (
// //     <div className={`flex flex-wrap gap-1.5 border-b border-gray-100 px-4 py-2.5 ${hideFrom === "lg" ? "lg:hidden" : "md:hidden"}`}>
// //       {visibleCols.map((id) => <ColumnFilter key={id} variant="chip" label={COLS[id].label} fields={COLS[id].fields} filters={cf} onApply={applyCf} />)}
// //     </div>
// //   );
// //   const anyCol = Object.values(cf).some((v) => String(v || "").trim());
// //   // Cards + money — column filter apply aagi (card click / search illaama)
// //   const CB = base.filter(passCols);
// //   const tCount = (k) => (k ? CB.filter((t) => t.status === k).length : CB.length);
// //   const bCount = (k) => (k ? CB.filter((b) => b.state === k).length : CB.length);
// //   const fCount = (k) => (k ? CB.filter((e) => e.stage === k).length : CB.length);

// //   const rows =
// //     tab === "tickets" ? tBase.filter((t) => (!card || t.status === card) && passCols(t) && has(t.ticketNo, t.subject, t.tnr, t.raisedBy, t.raisedTo, t.description))
// //       : tab === "bookings" ? L.filter((b) => (!card || b.state === card) && passCols(b) && has(b.tnr, b.tour, b.customer, nameOf(b.empKey)))
// //         : fBase.filter((e) => (!card || e.stage === card) && passCols(e) && has(e.fitCode, e.name, e.destination));


// //   // ─── PDF download — ippo screen la theriyura list (tab / view / card / search / column filters) ───
// //   const downloadPdf = () => {
// //     if (!rows.length) { toast.error("Nothing to download for these filters"); return; }
// //     const who = ALL ? "All employees" : `${me?.name || ""}${me?.employeeId ? ` (${me.employeeId})` : ""}`;
// //     const period = from || to ? `${from ? fmtDate(from) : "Start"} – ${to ? fmtDate(to) : "Today"}` : "All time";
// //     const viewText = tab === "tickets"
// //       ? `Tickets · ${(ALL ? ALL_TICKET_VIEWS : TICKET_VIEWS).find((v) => v.key === view)?.label || ""}`.replace(/[🎫✏️]\s?/gu, "")
// //       : tab === "bookings" ? "Tour bookings"
// //         : `FIT enquiries${ALL ? "" : ` · ${FIT_VIEWS.find((v) => v.key === view)?.label || ""}`}`;
// //     const cardList = tab === "tickets" ? TICKET_CARDS : tab === "bookings" ? BOOKING_CARDS : FIT_CARDS;
// //     const fp = [];
// //     if (card) fp.push(`${tab === "fit" ? "Stage" : "Status"}: ${cardList.find((c) => c.key === card)?.label || card}`);
// //     if (q.trim()) fp.push(`Search: ${q.trim()}`);
// //     activeFields.forEach((f) => {
// //       if (f.kind === "date") return;
// //       const v = String(cf[f.key] || "").trim();
// //       if (!v) return;
// //       const shown = f.kind === "multi" ? v.split(",").map((x) => f.options?.find((o) => o.value === x.trim())?.label || x.trim()).join(", ") : v;
// //       fp.push(`${f.label}: ${shown}`);
// //     });
// //     if (cf.fromDate || cf.toDate) fp.push(`Date: ${cf.fromDate ? fmtDate(cf.fromDate) : "…"} – ${cf.toDate ? fmtDate(cf.toDate) : "…"}`);
// //     const count = tab === "tickets" ? tCount : tab === "bookings" ? bCount : fCount;
// //     const cards = cardList.map((c) => [c.label, count(c.key), cardColor(c.cls)]);
// //     const statusTxt = (k) => (STATUS_PILL[k] || [k])[0];
// //     let head, body, foot = "", money = [];
// //     const D = (html, cls = "") => `<span class="d ${cls}">${html}</span>`;

// //     if (tab === "tickets") {
// //       head = [["Ticket no", "11%"], ["Ticket / Description"], ["Raised by", "16%"], ["Raised to", "13%"], ["Raised on", "10%"], ["Status", "12%"]];
// //       body = rows.map((t, i) => `<tr><td class="n">${i + 1}</td>
// //         <td><span class="chip">${esc(t.ticketNo || "—")}</span></td>
// //         <td>${D(esc(t.subject), "b")}${D(`${esc(t.queryType || "")}${t.tnr ? ` · TNR ${esc(t.tnr)}` : ""}`, "s")}${t.description?.trim() ? D(esc(t.description.trim()), "desc") : ""}</td>
// //         <td class="b">${esc(t.raisedBy || "—")}</td><td>${esc(t.raisedTo || "—")}</td><td>${esc(fmtDate(t.createdAt))}</td>
// //         <td>${pdfPill(t.status, statusTxt(t.status))}</td></tr>`);
// //     } else if (tab === "bookings") {
// //       money = [
// //         // [label, amount, colour, keezha line] — page la irukkura adhe colour + sub line
// //         ["Advance received", inr(sum(CB, (b) => (countsMoney(b) && b.advance?.paid ? b.advance.amount : 0))), "#15803D", `${CB.filter((b) => countsMoney(b) && b.advance?.paid).length} bookings · Active + Completed`],
// //         ["Balance received", inr(sum(CB, (b) => (countsMoney(b) && b.balance?.paid ? b.balance.amount : 0))), "#15803D", `${CB.filter((b) => countsMoney(b) && b.balance?.paid).length} paid · ${CB.filter((b) => countsMoney(b) && !b.balance?.paid && !b.balance?.adjusted).length} pending`],
// //         ["GV cancellation", inr(sum(CB, (b) => b.gvCancellation)), "#C2410C"],
// //         ["IRCTC cancellation", inr(sum(CB, (b) => b.irctcCancellation)), "#1D4ED8"],
// //         ["Refund", inr(sum(CB, (b) => b.refund)), "#7E22CE"],
// //       ];
// //       const ml = (label, v) => `<span class="kv"><span class="s">${label}</span>${v?.adjusted ? `<span class="s">Adjusted in cancellation</span>` : `<b>${inr(v?.amount)}</b> <span class="${v?.paid ? "g" : "muted"}">${v?.paid ? "Paid" : "Pending"}</span>`}</span>`;
// //       const kv = (label, v) => `<span class="kv"><span class="s">${label}</span><b>${v ? inr(v) : "—"}</b></span>`;
// //       head = [["TNR", "9%"], ["Tour / Customer"], ...(ALL ? [["Booked by", "13%"]] : []), ["Pax", "8%"], ["Advance / Balance", "18%"], ["Cancellation", "14%"], ["Status", "14%"]];
// //       body = rows.map((b, i) => {
// //         const p = paxOf(b);
// //         return `<tr><td class="n">${i + 1}</td>
// //         <td>${D(esc(b.tnr || "—"), "tnr")}${D(esc(fmtDate(b.bookingDate)), "s")}</td>
// //         <td>${D(esc(b.tour), "b")}${D(esc(b.customer || "—"), "s")}</td>${ALL ? `<td class="b">${esc(nameOf(b.empKey))}</td>` : ""}
// //         <td>${D(p.a, "b")}${p.c ? D(`${p.c} cancelled`, "s amb") : ""}${p.r ? D(`${p.r} rejected`, "s rj") : ""}</td>
// //         <td>${ml("Adv", b.advance)}${ml("Bal", b.balance)}</td>
// //         <td>${b.gvCancellation || b.irctcCancellation || b.refund ? `${kv("GV", b.gvCancellation)}${kv("IRCTC", b.irctcCancellation)}${kv("Refund", b.refund)}` : `<span class="muted">—</span>`}</td>
// //         <td>${pdfPill(b.state, statusTxt(b.state))}${b.requestedTr > 0 ? D(`${b.requestedTr} cancel request`, "s or") : ""}</td></tr>`;
// //       });
// //       foot = `<tr><td></td><td colspan="${ALL ? 3 : 2}">Total · ${rows.length} bookings<span class="d s">${sum(rows, (b) => paxOf(b).a)} active pax · ${sum(rows, (b) => paxOf(b).c)} cancelled · ${sum(rows, (b) => paxOf(b).r)} rejected</span></td><td>${sum(rows, (b) => paxOf(b).a)}</td>
// //         <td><span class="kv"><span class="s">Adv paid</span><span class="g">${inr(sum(rows, (b) => (countsMoney(b) && b.advance?.paid ? b.advance.amount : 0)))}</span></span><span class="kv"><span class="s">Bal paid</span><span class="g">${inr(sum(rows, (b) => (countsMoney(b) && b.balance?.paid ? b.balance.amount : 0)))}</span></span></td>
// //         <td><span class="kv"><span class="s">GV</span>${inr(sum(rows, (b) => b.gvCancellation))}</span><span class="kv"><span class="s">IRCTC</span>${inr(sum(rows, (b) => b.irctcCancellation))}</span><span class="kv"><span class="s">Refund</span>${inr(sum(rows, (b) => b.refund))}</span></td><td></td></tr>`;
// //     } else {
// //       money = [
// //         ["Sales value (accepted)", inr(sum(CB.filter((e) => ["Accepted", "Closed"].includes(e.stage)), (e) => e.salesValue)), "#15803D"],
// //         ["Cancellation charge", inr(sum(CB, (e) => e.cancellationCharge)), "#BE123C", `${CB.filter((e) => e.cancellationCharge > 0).length} enquiries`],
// //         ...(CB.some((e) => "gvVinoth" in e) ? [
// //           ["Vinoth share (GVEMP008)", inr(sum(CB, (e) => e.gvVinoth)), "#4338CA", `${CB.filter((e) => e.gvVinoth > 0).length} enquiries`],
// //           ["Giridharan share (GVEMP009)", inr(sum(CB, (e) => e.gvGiridhar)), "#4338CA", `${CB.filter((e) => e.gvGiridhar > 0).length} enquiries`],
// //         ] : []),
// //       ];
// //       const fwdCol = !ALL && view === "fwdBy" ? ["Forwarded to", (e) => fwdNames(e.fwdOut)] : !ALL && view === "fwdTo" ? ["Forwarded by", (e) => fwdNames(e.fwdIn)] : null;
// //       head = [["Enquiry", "14%"], ["Customer", "14%"], ["Trip"], ...(fwdCol ? [[fwdCol[0], "11%"]] : []), ["Handled by now", "12%"], ["Value", "10%"], ["Stage", "18%"]];
// //       body = rows.map((e, i) => `<tr><td class="n">${i + 1}</td>
// //         <td><span class="chip">${esc(e.fitCode || "—")}</span>${D(esc(fmtDate(e.createdAt)), "s")}${D(`by <b class="b">${esc(raiserName(e))}</b>`, "s")}</td>
// //         <td>${D(esc(e.name || "—"), "b")}${D(esc([e.mobile, e.pax ? `${e.pax} pax` : ""].filter(Boolean).join(" · ")), "s")}</td>
// //         <td>${D(`<span class="dest">${esc(e.destination || "—")}</span>${duration(e) ? ` <span class="s">· ${esc(duration(e))}</span>` : ""}`)}${D(`✈️ ${esc(e.travelDate ? fmtDate(e.travelDate) : "No date")}${e.pickupDate ? ` · <span class="pk">🚌 ${esc(fmtDate(e.pickupDate))}</span>` : ""}`)}${e.zones?.length ? `<span class="d">${e.zones.map((z) => `<span class="zone">${esc(z)}</span>`).join("")}</span>` : ""}</td>
// //         ${fwdCol ? `<td class="b">${esc(fwdCol[1](e))}</td>` : ""}
// //         <td>${e.ownerKey ? `<span class="b">${esc(ownerName(e))}</span>` : `<span class="muted">${esc(ownerName(e))}</span>`}</td>
// //         <td>${e.salesValue || e.cancellationCharge ? `${e.salesValue > 0 ? D(inr(e.salesValue), "g") : ""}${e.cancellationCharge > 0 ? D(`−${inr(e.cancellationCharge)} <span class="s">cancel</span>`, "red") : ""}` : `<span class="muted">—</span>`}</td>
// //         <td>${pdfPill(e.stage, e.stage)}${e.lastBy ? D(`${esc(ACTION_LABEL[e.lastBy.action] || "Updated")} by <b class="b">${esc(e.lastBy.key ? nameOf(e.lastBy.key) : e.lastBy.name || "—")}</b> · ${esc(fmtDate(e.lastBy.at))}`, "s") : ""}</td></tr>`);
// //       foot = `<tr><td></td><td colspan="${fwdCol ? 5 : 4}">Total · ${rows.length} enquiries</td>
// //         <td>${D(inr(sum(rows, (e) => e.salesValue)), "g")}${D(`−${inr(sum(rows, (e) => e.cancellationCharge))}`, "red")}</td><td></td></tr>`;
// //     }

// //     const html = buildPerfPdfHtml({ title, who, period, viewText, filterText: fp.join(" · "), cards, money, head, rows: body, foot });
// //     const w = window.open("", "_blank");
// //     if (!w) { toast.error("Allow pop-ups for this site to download the PDF"); return; }
// //     w.document.open();
// //     w.document.write(html);
// //     w.document.close();
// //     w.focus(); // page pirichadhum andha window ae print open pannum
// //   };

// //   const inputCls = "rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100";
// //   const pill = (on) => `rounded-xl px-4 py-2 text-sm font-semibold ${on ? "bg-white text-green-700 shadow" : "text-gray-600 hover:text-gray-900"}`;

// //   return (
// //     <div className="w-full min-w-0 max-w-7xl flex-1 p-3 pt-16 sm:p-5 sm:pt-16 lg:pt-5">
// //       <div className="mb-5 text-center">
// //         <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
// //         <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
// //         <span className="mx-auto mt-3 block h-1 w-14 rounded-full bg-green-500" aria-hidden="true" />
// //       </div>

// //       {/* ── Employee + dates ── */}
// //       <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4">
// //         <label className="w-full text-xs font-semibold text-gray-600 sm:w-auto sm:min-w-[16rem] sm:flex-1">Employee
// //           <select value={emp} onChange={(e) => setEmp(e.target.value)} className={`mt-1 block w-full ${inputCls}`}>
// //             <option value="*">All employees</option>
// //             {employees.map((e) => (
// //               <option key={e.key} value={e.key}>{e.name}{e.employeeId ? ` (${e.employeeId})` : ""}{e.role ? ` · ${e.role}` : ""}{e.status !== "Active" ? ` · ${e.status}` : ""}</option>
// //             ))}
// //           </select>
// //         </label>
// //         <div className="flex flex-wrap gap-1.5">
// //           {PRESETS.map((p) => (
// //             <button key={p.key} type="button" onClick={() => { setPreset(p.key); setRange(p.range()); }}
// //               className={`rounded-full px-3 py-2 text-xs font-semibold ${preset === p.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
// //               {p.label}
// //             </button>
// //           ))}
// //         </div>
// //         <label className="min-w-[9rem] flex-1 text-xs font-semibold text-gray-600 sm:flex-none">From
// //           <input type="date" value={from} max={to || undefined} onChange={(e) => { setPreset(""); setRange([e.target.value, to]); }} className={`mt-1 block w-full ${inputCls}`} />
// //         </label>
// //         <label className="min-w-[9rem] flex-1 text-xs font-semibold text-gray-600 sm:flex-none">To
// //           <input type="date" value={to} min={from || undefined} onChange={(e) => { setPreset(""); setRange([from, e.target.value]); }} className={`mt-1 block w-full ${inputCls}`} />
// //         </label>
// //       </div>

// //       {!emp ? null : (
// //         <>
// //           {/* ── Who ── */}
// //           <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
// //             <div>
// //               <p className="text-lg font-bold text-gray-900">{ALL ? "All employees" : me?.name}{!ALL && me?.employeeId ? <span className="font-medium text-gray-500"> · {me.employeeId}</span> : null}</p>
// //               <p className="text-xs text-gray-500">{ALL ? "Pick an employee above to see only theirs" : `${me?.role || ""}${me?.status && me.status !== "Active" ? ` · ${me.status}` : ""}`} · {from ? fmtDate(from) : "All time"}{to ? ` – ${fmtDate(to)}` : ""}</p>
// //             </div>
// //             {tabs.length > 1 && (
// //               <div className="flex w-full gap-1 rounded-2xl bg-gray-100 p-1 sm:w-auto" role="tablist">
// //                 {tabs.map((k) => (
// //                   <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`flex-1 sm:flex-none ${pill(tab === k)}`}>
// //                     {k === "tickets" ? "🎫 Tickets" : k === "bookings" ? "🧳 Tour bookings" : "✈️ FIT"}
// //                   </button>
// //                 ))}
// //               </div>
// //             )}
// //           </div>

// //           {/* ── Views (ticket page / FIT page maadhiri) ── */}
// //           {((!ALL && (tab === "tickets" || tab === "fit")) || (ALL && tab === "tickets")) && (
// //             <div className="mb-3 flex flex-wrap gap-1 rounded-2xl bg-gray-100 p-1 sm:inline-flex">
// //               {(tab === "tickets" ? (ALL ? ALL_TICKET_VIEWS : TICKET_VIEWS) : FIT_VIEWS).map((v) => (
// //                 <button key={v.key} type="button" onClick={() => setView(v.key)} className={pill(view === v.key)}>{v.label}</button>
// //               ))}
// //             </div>
// //           )}
// //           {!ALL && tab === "fit" && (
// //             <p className="-mt-1 mb-3 text-xs text-gray-500">{FIT_VIEWS.find((v) => v.key === view)?.hint}</p>
// //           )}

// //           {/* ── Edit history (oru employee) ── */}
// //           {tab === "tickets" && view === "Edits" ? (
// //             <EditHistoryPanel backendUrl={backendUrl} aToken={aToken} staffId={ALL ? "" : me?.staffId} all={ALL} from={from} to={to} />
// //           ) : loading || !list ? (
// //             <p className="py-10 text-center text-sm text-gray-500">Loading…</p>
// //           ) : (
// //             <>
// //               {tab === "tickets" && (
// //                 <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
// //                   {TICKET_CARDS.map((c) => <Card key={c.label} c={c} count={tCount(c.key)} active={card === c.key} onClick={() => setCard(c.key)} />)}
// //                 </div>
// //               )}
// //               {tab === "bookings" && (
// //                 <>
// //                   <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
// //                     {BOOKING_CARDS.map((c) => <Card key={c.label} c={c} count={bCount(c.key)} active={card === c.key} onClick={() => setCard(c.key)} />)}
// //                   </div>
// //                   <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
// //                     <Money label="Advance received" value={sum(CB, (b) => (countsMoney(b) && b.advance?.paid ? b.advance.amount : 0))} sub={`${CB.filter((b) => countsMoney(b) && b.advance?.paid).length} bookings · Active + Completed`} tone="text-green-700" />
// //                     <Money label="Balance received" value={sum(CB, (b) => (countsMoney(b) && b.balance?.paid ? b.balance.amount : 0))} sub={`${CB.filter((b) => countsMoney(b) && b.balance?.paid).length} paid · ${CB.filter((b) => countsMoney(b) && !b.balance?.paid && !b.balance?.adjusted).length} pending`} tone="text-green-700" />
// //                     <Money label="GV cancellation" value={sum(CB, (b) => b.gvCancellation)} />
// //                     <Money label="IRCTC cancellation" value={sum(CB, (b) => b.irctcCancellation)} />
// //                     <Money label="Refund" value={sum(CB, (b) => b.refund)} />
// //                   </div>
// //                 </>
// //               )}
// //               {tab === "fit" && (
// //                 <>
// //                   <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
// //                     {FIT_CARDS.map((c) => <Card key={c.label} c={c} count={fCount(c.key)} active={card === c.key} onClick={() => setCard(c.key)} />)}
// //                   </div>
// //                   <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
// //                     <Money label="Sales value (accepted)" value={sum(CB.filter((e) => ["Accepted", "Closed"].includes(e.stage)), (e) => e.salesValue)} tone="text-green-700" />
// //                     <Money label="Cancellation charge" value={sum(CB, (e) => e.cancellationCharge)} sub={`${CB.filter((e) => e.cancellationCharge > 0).length} enquiries`} tone="text-rose-700" />
// //                     {CB.some((e) => "gvVinoth" in e) && (
// //                       <>
// //                         <Money label="Vinoth share (GVEMP008)" value={sum(CB, (e) => e.gvVinoth)} sub={`${CB.filter((e) => e.gvVinoth > 0).length} enquiries`} tone="text-indigo-700" />
// //                         <Money label="Giridharan share (GVEMP009)" value={sum(CB, (e) => e.gvGiridhar)} sub={`${CB.filter((e) => e.gvGiridhar > 0).length} enquiries`} tone="text-indigo-700" />
// //                       </>
// //                     )}
// //                   </div>
// //                 </>
// //               )}

// //               {/* ── List ── */}
// //               <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
// //                 <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-4 py-3">
// //                   <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "tickets" ? "Search ticket no, subject, TNR, description" : tab === "bookings" ? "Search TNR, tour, customer" : "Search FIT code, name, place"} className={`w-full min-w-0 flex-1 sm:min-w-[14rem] ${inputCls}`} />
// //                   {(card || q || anyCol) && <button type="button" onClick={() => { setCard(""); setQ(""); setCf({}); }} className="text-xs font-semibold text-red-600 hover:underline">Clear all</button>}
// //                   <span className="text-xs text-gray-500">Showing {rows.length}</span>
// //                   <button
// //                     type="button"
// //                     onClick={downloadPdf}
// //                     disabled={!rows.length}
// //                     className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
// //                   >
// //                     <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
// //                     Download PDF
// //                   </button>
// //                 </div>
// //                 {rows.length === 0 ? (
// //                   <p className="px-4 py-10 text-center text-sm text-gray-500">Nothing here.</p>
// //                 ) : tab === "tickets" ? (
// //                   <>
// //                     {mobileFilters()}
// //                     {/* Mobile / tablet — cards */}
// //                     <ul className="divide-y divide-gray-100 md:hidden">
// //                       {rows.map((t) => (
// //                         <li key={t._id} className="px-4 py-3">
// //                           <div className="flex items-center justify-between gap-2">
// //                             <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800">{t.ticketNo || "—"}</span>
// //                             <Pill s={t.status} />
// //                           </div>
// //                           <p className="mt-1.5 font-semibold text-gray-900">{t.subject}</p>
// //                           <p className="text-xs text-gray-500">{t.queryType}{t.tnr ? ` · TNR ${t.tnr}` : ""}</p>
// //                           {t.description?.trim() && <p className="mt-1 line-clamp-3 whitespace-pre-line text-xs text-gray-700">{t.description.trim()}</p>}
// //                           <p className="mt-1 text-xs text-gray-600"><span className="font-semibold">{t.raisedBy || "—"}</span> → <span className="font-semibold">{t.raisedTo || "—"}</span> · {fmtDate(t.createdAt)}</p>
// //                         </li>
// //                       ))}
// //                     </ul>
// //                     {/* Desktop — table */}
// //                     <div className="hidden md:block">
// //                       <table className="w-full table-fixed text-left text-sm">
// //                         <thead className="bg-blue-50 text-xs text-gray-600"><tr>
// //                           {head("ticketNo", "w-36")}{head("ticket")}{head("raisedBy", "w-[19%]")}
// //                           {head("raisedTo", "w-[17%]")}{head("date", "w-36")}{head("status", "w-32")}
// //                         </tr></thead>
// //                         <tbody>
// //                           {rows.map((t) => (
// //                             <tr key={t._id} className="border-t border-gray-100 align-top">
// //                               <td className="px-4 py-2.5"><span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800">{t.ticketNo || "—"}</span></td>
// //                               <td className="px-4 py-2.5"><p className="truncate font-semibold text-gray-900">{t.subject}</p><p className="truncate text-xs text-gray-500">{t.queryType}{t.tnr ? ` · TNR ${t.tnr}` : ""}</p>{t.description?.trim() && <p className="mt-1 line-clamp-2 whitespace-pre-line break-words text-xs text-gray-700" title={t.description.trim()}>{t.description.trim()}</p>}</td>
// //                               <td className="truncate px-3 py-2.5 text-xs font-semibold" title={t.raisedBy}>{t.raisedBy || "—"}</td>
// //                               <td className="truncate px-3 py-2.5 text-xs" title={t.raisedTo}>{t.raisedTo || "—"}</td>
// //                               <td className="px-4 py-2.5 text-xs">{fmtDate(t.createdAt)}</td>
// //                               <td className="px-4 py-2.5"><Pill s={t.status} /></td>
// //                             </tr>
// //                           ))}
// //                         </tbody>
// //                       </table>
// //                     </div>
// //                   </>
// //                 ) : tab === "bookings" ? (
// //                   <>
// //                     {mobileFilters("lg")}
// //                     {/* Mobile / tablet — cards */}
// //                     <ul className="divide-y divide-gray-100 lg:hidden">
// //                       {rows.map((b, i) => (
// //                         <li key={`${b.tnr}-${i}`} className="px-4 py-3">
// //                           <div className="flex items-center justify-between gap-2">
// //                             <span className="font-mono text-sm font-bold text-amber-800">{b.tnr || "—"}</span>
// //                             <span className="flex items-center gap-1.5">{b.requestedTr > 0 && <span className="text-[11px] font-semibold text-orange-700">{b.requestedTr} cancel request</span>}<Pill s={b.state} /></span>
// //                           </div>
// //                           <p className="mt-1 font-semibold text-gray-900">{b.tour}</p>
// //                           <p className="text-xs text-gray-500">{b.customer || "—"} · {paxOf(b).a} pax{paxExtra(paxOf(b)) ? ` (${paxExtra(paxOf(b))})` : ""} · {fmtDate(b.bookingDate)}{ALL ? ` · ${nameOf(b.empKey)}` : ""}</p>
// //                           <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl bg-gray-50 p-2.5 text-xs sm:grid-cols-3">
// //                             <MoneyLine label="Advance" v={b.advance} />
// //                             <MoneyLine label="Balance" v={b.balance} />
// //                             <Kv label="GV cancel" v={b.gvCancellation} />
// //                             <Kv label="IRCTC cancel" v={b.irctcCancellation} />
// //                             <Kv label="Refund" v={b.refund} />
// //                           </div>
// //                         </li>
// //                       ))}
// //                     </ul>
// //                     {/* Desktop — compact table (Advance + Balance oru column; GV / IRCTC / Refund oru column) */}
// //                     <div className="hidden lg:block">
// //                       <table className="w-full table-fixed text-left text-sm">
// //                         <thead className="bg-blue-50 text-xs text-gray-600"><tr>
// //                           {head("tnr", "w-28")}
// //                           {head("tour")}
// //                           {ALL && head("by", "w-[14%]")}
// //                           {head("pax", "w-24")}
// //                           {head("pay", "w-[20%]")}
// //                           {head("canc", "w-[16%]")}
// //                           {head("status", "w-36")}
// //                         </tr></thead>
// //                         <tbody>
// //                           {rows.map((b, i) => (
// //                             <tr key={`${b.tnr}-${i}`} className="border-t border-gray-100 align-top">
// //                               <td className="px-3 py-2.5"><p className="font-mono text-xs font-bold text-amber-800">{b.tnr || "—"}</p><p className="text-[11px] text-gray-500">{fmtDate(b.bookingDate)}</p></td>
// //                               <td className="px-3 py-2.5"><p className="truncate font-semibold text-gray-900" title={b.tour}>{b.tour}</p><p className="truncate text-xs text-gray-500" title={b.customer}>{b.customer || "—"}</p></td>
// //                               {ALL && <td className="truncate px-3 py-2.5 text-xs font-semibold" title={nameOf(b.empKey)}>{nameOf(b.empKey)}</td>}
// //                               <td className="px-3 py-2.5"><p className="font-semibold">{paxOf(b).a}</p>{paxOf(b).c > 0 && <p className="text-[11px] text-amber-700">{paxOf(b).c} cancelled</p>}{paxOf(b).r > 0 && <p className="text-[11px] text-red-600">{paxOf(b).r} rejected</p>}</td>
// //                               <td className="px-3 py-2.5 text-xs"><MoneyLine label="Adv" v={b.advance} /><MoneyLine label="Bal" v={b.balance} /></td>
// //                               <td className="px-3 py-2.5 text-xs">
// //                                 {b.gvCancellation || b.irctcCancellation || b.refund ? (
// //                                   <><Kv label="GV" v={b.gvCancellation} /><Kv label="IRCTC" v={b.irctcCancellation} /><Kv label="Refund" v={b.refund} /></>
// //                                 ) : <span className="text-gray-400">—</span>}
// //                               </td>
// //                               <td className="px-3 py-2.5"><Pill s={b.state} />{b.requestedTr > 0 && <p className="mt-1 text-[11px] font-semibold text-orange-700">{b.requestedTr} cancel request</p>}</td>
// //                             </tr>
// //                           ))}
// //                         </tbody>
// //                       </table>
// //                     </div>
// //                     {/* Total — ellaa screen ku um */}
// //                     <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-t-2 border-gray-200 bg-gray-50 px-4 py-3 text-xs sm:grid-cols-3 lg:grid-cols-6">
// //                       <p className="col-span-2 text-sm font-bold sm:col-span-3 lg:col-span-1">Total · {rows.length} bookings<span className="block text-xs font-semibold text-gray-600">{sum(rows, (b) => paxOf(b).a)} active pax · {sum(rows, (b) => paxOf(b).c)} cancelled · {sum(rows, (b) => paxOf(b).r)} rejected</span></p>
// //                       <Kv label="Advance paid" v={sum(rows, (b) => (countsMoney(b) && b.advance?.paid ? b.advance.amount : 0))} bold />
// //                       <Kv label="Balance paid" v={sum(rows, (b) => (countsMoney(b) && b.balance?.paid ? b.balance.amount : 0))} bold />
// //                       <Kv label="GV cancel" v={sum(rows, (b) => b.gvCancellation)} bold />
// //                       <Kv label="IRCTC cancel" v={sum(rows, (b) => b.irctcCancellation)} bold />
// //                       <Kv label="Refund" v={sum(rows, (b) => b.refund)} bold />
// //                     </div>
// //                   </>
// //                 ) : (
// //                   <>
// //                     {mobileFilters("lg")}
// //                     {/* Mobile / tablet — cards */}
// //                     <ul className="divide-y divide-gray-100 lg:hidden">
// //                       {rows.map((e) => (
// //                         <li key={e._id} className="px-4 py-3">
// //                           <div className="flex items-center justify-between gap-2">
// //                             <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800">{e.fitCode || "—"}</span>
// //                             <StagePill s={e.stage} />
// //                           </div>
// //                           <div className="mt-1.5 flex items-start justify-between gap-2">
// //                             <div className="min-w-0">
// //                               <p className="truncate font-semibold text-gray-900">{e.name}</p>
// //                               {e.mobile && <p className="text-xs text-gray-500">📞 {e.mobile}</p>}
// //                             </div>
// //                           </div>
// //                           <p className="mt-1 text-xs text-gray-600">Raised by <b className="text-gray-900">{raiserName(e)}</b></p>
// //                           <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl bg-gray-50 p-2.5 text-xs sm:grid-cols-3">
// //                             <p><span className="text-gray-500">Destination </span><b className="text-purple-800">{e.destination || "—"}</b>{duration(e) ? ` · ${duration(e)}` : ""}</p>
// //                             <p><span className="text-gray-500">Travel </span><b>{e.travelDate ? fmtDate(e.travelDate) : "—"}</b></p>
// //                             <p><span className="text-gray-500">Enquired </span>{fmtDate(e.createdAt)}</p>
// //                             {e.pickupDate && <p><span className="text-gray-500">Pickup </span><b className="text-red-600">{fmtDate(e.pickupDate)}</b></p>}
// //                             {e.salesValue > 0 && <p><span className="text-gray-500">Sales </span><b className="text-green-700">{inr(e.salesValue)}</b></p>}
// //                             {e.cancellationCharge > 0 && <p><span className="text-gray-500">Cancellation </span><b className="text-rose-700">{inr(e.cancellationCharge)}</b></p>}
// //                             {e.pax > 0 && <p><span className="text-gray-500">Pax </span>{e.pax}</p>}
// //                           </div>
// //                           <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
// //                             <ZoneChips zones={e.zones} />
// //                             {!ALL && view === "fwdBy" && <span>Forwarded to <b>{fwdNames(e.fwdOut)}</b></span>}
// //                             {!ALL && view === "fwdTo" && <span>Forwarded by <b>{fwdNames(e.fwdIn)}</b></span>}
// //                             {fitExtra.length > 0 && <span>Currently handled by <b>{ownerName(e)}</b></span>}
// //                             {e.lastBy && <span className="text-gray-500">{ACTION_LABEL[e.lastBy.action] || "Updated"} by <b className="text-gray-800">{e.lastBy.key ? nameOf(e.lastBy.key) : e.lastBy.name || "—"}</b></span>}
// //                           </div>
// //                         </li>
// //                       ))}
// //                     </ul>
// //                     {/* Desktop — table */}
// //                     <div className="hidden lg:block">
// //                       <table className="w-full table-fixed text-left text-sm">
// //                         <thead className="bg-blue-50 text-xs text-gray-600"><tr>
// //                           {head("code", "w-[15%]")}{head("name", "w-[17%]")}{head("trip")}
// //                           {visibleCols.filter((id) => ["fto", "fby", "with"].includes(id)).map((id) => head(id, "w-[13%]"))}
// //                           {head("value", "w-[11%]")}{head("stage", "w-[17%]")}
// //                         </tr></thead>
// //                         <tbody>
// //                           {rows.map((e) => (
// //                             <tr key={e._id} className="border-t border-gray-100 align-top hover:bg-gray-50/60">
// //                               <td className="px-3 py-3">
// //                                 <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800">{e.fitCode || "—"}</span>
// //                                 <p className="mt-1.5 text-[11px] text-gray-500">{fmtDate(e.createdAt)}</p>
// //                                 <p className="truncate text-[11px] text-gray-500" title={raiserName(e)}>by <b className="text-gray-700">{raiserName(e)}</b></p>
// //                               </td>
// //                               <td className="px-3 py-3">
// //                                 <p className="truncate font-semibold text-gray-900" title={e.name}>{e.name || "—"}</p>
// //                                 <p className="truncate text-xs text-gray-500">{[e.mobile, e.pax ? `${e.pax} pax` : ""].filter(Boolean).join(" · ")}</p>
// //                               </td>
// //                               <td className="px-3 py-3">
// //                                 <p className="truncate"><b className="text-purple-800">{e.destination || "—"}</b><span className="text-xs text-gray-500">{duration(e) ? ` · ${duration(e)}` : ""}</span></p>
// //                                 <p className="truncate text-xs text-gray-600">✈️ {e.travelDate ? fmtDate(e.travelDate) : "No date"}{e.pickupDate && <span className="font-semibold text-red-600"> · 🚌 {fmtDate(e.pickupDate)}</span>}</p>
// //                                 {e.zones?.length > 0 && <div className="mt-1"><ZoneChips zones={e.zones} /></div>}
// //                               </td>
// //                               {!ALL && view === "fwdBy" && <td className="truncate px-3 py-3 text-xs font-semibold">{fwdNames(e.fwdOut)}</td>}
// //                               {!ALL && view === "fwdTo" && <td className="truncate px-3 py-3 text-xs font-semibold">{fwdNames(e.fwdIn)}</td>}
// //                               {fitExtra.length > 0 && <td className={`truncate px-3 py-3 text-xs font-semibold ${e.ownerKey ? "text-gray-900" : "text-gray-400"}`} title={ownerName(e)}>{ownerName(e)}</td>}
// //                               <td className="px-3 py-3 text-xs">
// //                                 {e.salesValue || e.cancellationCharge ? (
// //                                   <>
// //                                     {e.salesValue > 0 && <p className="font-semibold text-green-700">{inr(e.salesValue)}</p>}
// //                                     {e.cancellationCharge > 0 && <p className="font-semibold text-rose-700">−{inr(e.cancellationCharge)} <span className="font-normal text-gray-500">cancel</span></p>}
// //                                   </>
// //                                 ) : <span className="text-gray-400">—</span>}
// //                               </td>
// //                               <td className="px-3 py-3">
// //                                 <StagePill s={e.stage} />
// //                                 {e.lastBy && (
// //                                   <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-gray-500" title={`${ACTION_LABEL[e.lastBy.action] || "Updated"} by ${e.lastBy.key ? nameOf(e.lastBy.key) : e.lastBy.name || "—"}`}>
// //                                     {ACTION_LABEL[e.lastBy.action] || "Updated"} by <b className="text-gray-700">{e.lastBy.key ? nameOf(e.lastBy.key) : e.lastBy.name || "—"}</b> · {fmtDate(e.lastBy.at)}
// //                                   </p>
// //                                 )}
// //                               </td>
// //                             </tr>
// //                           ))}
// //                         </tbody>
// //                       </table>
// //                     </div>
// //                     <div className="flex flex-wrap justify-between gap-2 border-t-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold">
// //                       <span>Total · {rows.length} enquiries</span><span className="flex flex-wrap gap-x-4"><span className="text-green-700">Sales value {inr(sum(rows, (e) => e.salesValue))}</span><span className="text-rose-700">Cancellation {inr(sum(rows, (e) => e.cancellationCharge))}</span></span>
// //                     </div>
// //                   </>
// //                 )}
// //               </div>
// //             </>
// //           )}
// //         </>
// //       )}
// //     </div>
// //   );
// // };

// // export default EmployeePerformance;


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
//   { key: "Edits", label: "✏️ Edit history" }, // avanga panna ticket edits (Raise Ticket → Edit History maadhiri)
// ];
// // All employees → Tickets / ellaa employees oda full edit history
// const ALL_TICKET_VIEWS = [
//   { key: "Assigned", label: "🎫 All tickets" },
//   { key: "Edits", label: "✏️ Edit history (all employees)" },
// ];
// const BOOKING_CARDS = [
//   { key: "", label: "Total bookings", cls: "border-slate-300 text-slate-900" },
//   { key: "unverified", label: "Unverified", cls: "border-gray-400 text-gray-700" },
//   { key: "active", label: "Active (Advance only paid)", cls: "border-green-400 text-green-800" },
//   { key: "completed", label: "Completed (Booking completed)", cls: "border-yellow-400 text-yellow-800" },
//   { key: "cancelled", label: "Fully cancelled", cls: "border-red-300 text-red-700" },
//   { key: "tripCancelled", label: "Trip cancelled", cls: "border-rose-300 text-rose-700" },
//   { key: "rejected", label: "Rejected", cls: "border-purple-300 text-purple-700" },
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
//   active: ["Active", "bg-green-50 text-green-700"], unverified: ["Unverified", "bg-gray-100 text-gray-700"], completed: ["Completed", "bg-yellow-50 text-yellow-800"],
//   cancelRequested: ["Cancellation requested", "bg-orange-50 text-orange-700"], cancelled: ["Fully cancelled", "bg-red-50 text-red-700"], tripCancelled: ["Trip cancelled", "bg-rose-50 text-rose-700"], rejected: ["Rejected", "bg-purple-50 text-purple-700"],
// };
// // Pax — Active (cancellation request um serthu) / Cancelled (trip cancel um) / Rejected thani thani
// const paxOf = (b) => {
//   const c = b.cancelledTr || 0, r = b.rejectedTr || 0;
//   const a = b.activeTr != null ? (b.activeTr || 0) + (b.requestedTr || 0) : Math.max(0, (b.travellers || 0) - c - r);
//   return { a, c, r };
// };
// const paxExtra = ({ c, r }) => [c ? `${c} cancelled` : "", r ? `${r} rejected` : ""].filter(Boolean).join(" · ");
// // FIT — stage pill + "by …" (FIT Enquiries page maadhiri)
// const STAGE_PILL = {
//   Pending: "bg-gray-100 text-gray-700", "Picked up": "bg-sky-50 text-sky-700", "Rate shared": "bg-yellow-50 text-yellow-800",
//   Accepted: "bg-green-50 text-green-700", Closed: "bg-slate-100 text-slate-700", Cancelled: "bg-rose-50 text-rose-700", Rejected: "bg-red-50 text-red-700",
// };
// const StagePill = ({ s }) => (
//   <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${STAGE_PILL[s] || "bg-gray-100 text-gray-700"}`}>
//     <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{s}
//   </span>
// );
// const ACTION_LABEL = { created: "Created", pickedUp: "Picked up", rateShared: "Rate shared", accepted: "Accepted", closed: "Closed", cancelled: "Cancelled", rejected: "Rejected", reopened: "Reopened", forwarded: "Forwarded" };
// const duration = (e) => (e.days ? `${e.days}D${e.nights != null ? `/${e.nights}N` : ""}` : "");
// const ZoneChips = ({ zones }) => (zones?.length
//   ? <div className="flex flex-wrap gap-1">{zones.map((z) => <span key={z} className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800">{z}</span>)}</div>
//   : <span className="text-gray-400">—</span>);
// // Kaasu received — Active bookings mattum
// const countsMoney = (b) => b.state === "active" || b.state === "completed"; // Active + Completed mattum
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

// // ─── Edit history — oru employee panna ticket edits (Admin Raise Ticket → Edit History maadhiri) ───
// const EDIT_KIND = {
//   query: ["Ticket edited", "bg-blue-50 text-blue-700"],
//   "reply-edit": ["Reply edited", "bg-violet-50 text-violet-700"],
//   "reply-delete": ["Reply deleted", "bg-red-50 text-red-700"],
// };
// const fmtDT = (d) =>
//   d ? `${new Date(d).toLocaleDateString("en-IN")} ${new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}` : "—";
// const byLabel = (e) => e.staffName || (e.by === "touradmin" ? "Tour admin" : "Admin");

// const EditHistoryPanel = ({ backendUrl, aToken, staffId, all = false, from, to, refreshKey = 0 }) => {
//   const [items, setItems] = useState(null);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [search, setSearch] = useState("");
//   const [term, setTerm] = useState("");
//   const [hidden, setHidden] = useState({});

//   useEffect(() => { setPage(1); }, [staffId, all, from, to, term]);
//   useEffect(() => {
//     const t = setTimeout(() => setTerm(search.trim()), 400);
//     return () => clearTimeout(t);
//   }, [search]);

//   useEffect(() => {
//     if (!staffId && !all) return;
//     let alive = true;
//     setItems(null);
//     axios
//       .get(`${backendUrl}/api/touradmin/queries/edit-history`, {
//         headers: { aToken },
//         params: { staff: all ? undefined : staffId, page, limit: 10, search: term || undefined, from: from || undefined, to: to || undefined },
//       })
//       .then(({ data }) => {
//         if (!alive) return;
//         if (!data?.success) throw new Error(data?.message || "Failed to load edit history");
//         setItems(data.items || []);
//         setTotalPages(data.totalPages || 1);
//         setTotal(data.total || 0);
//       })
//       .catch((err) => {
//         if (!alive) return;
//         toast.error(err.response?.data?.message || err.message);
//         setItems([]);
//       });
//     return () => { alive = false; };
//   }, [backendUrl, aToken, staffId, all, page, term, from, to, refreshKey]);

//   const edits = (items || []).reduce((n, q) => n + (q.edits?.length || 0), 0);

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
//         <input
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           placeholder="Search by ticket no (GVTKT001) or subject"
//           className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
//         />
//         <span className="text-xs text-gray-500">{total} ticket{total !== 1 ? "s" : ""}{items ? ` · ${edits} edit${edits !== 1 ? "s" : ""} on this page` : ""}</span>
//       </div>

//       {!items ? (
//         <p className="py-10 text-center text-sm text-gray-500">Loading…</p>
//       ) : items.length === 0 ? (
//         <p className="rounded-2xl border border-gray-200 bg-white py-10 text-center text-sm text-gray-500">{all ? "No edits by any employee" : "No edits by this employee"}{from || to ? " in this period" : ""}.</p>
//       ) : (
//         items.map((q) => {
//           const isHidden = hidden[q.queryId];
//           return (
//             <div key={q.queryId} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
//               <div className="flex flex-wrap items-start justify-between gap-2 bg-blue-50/60 px-4 py-3">
//                 <div className="min-w-0">
//                   <div className="flex flex-wrap items-center gap-2">
//                     <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold tracking-wide text-blue-800">{q.ticketNo || "—"}</span>
//                     <Pill s={q.status} />
//                     <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-gray-700">{q.editCount} edit{q.editCount !== 1 ? "s" : ""}</span>
//                   </div>
//                   <p className="mt-1.5 truncate font-semibold text-gray-900">{q.subject}</p>
//                 </div>
//                 <div className="flex items-center gap-3 text-xs text-gray-600">
//                   <span>Last edit {fmtDT(q.lastEditedAt)}</span>
//                   <button type="button" onClick={() => setHidden((h) => ({ ...h, [q.queryId]: !h[q.queryId] }))} className="font-semibold text-blue-600 hover:underline">
//                     {isHidden ? "Show" : "Hide"}
//                   </button>
//                 </div>
//               </div>
//               {!isHidden && (
//                 <ol className="space-y-4 px-4 py-4">
//                   {q.edits.map((e) => {
//                     const [kLabel, kCls] = EDIT_KIND[e.kind] || EDIT_KIND.query;
//                     return (
//                       <li key={e.id} className="relative pl-6">
//                         <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-blue-500" aria-hidden="true" />
//                         <div className="flex flex-wrap items-center gap-2 text-sm">
//                           <span className="font-bold text-gray-900">Edit {e.editNo}</span>
//                           <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${kCls}`}>{kLabel}</span>
//                           <span className="text-gray-500">by <b className="text-gray-800">{byLabel(e)}</b></span>
//                           <span className="text-xs text-gray-500">{fmtDT(e.editedAt)}</span>
//                         </div>
//                         <div className="mt-2 space-y-2 rounded-xl border border-gray-100 p-2">
//                           {(e.changes || []).map((c, i) => (
//                             <div key={i} className="grid gap-2 md:grid-cols-[10rem_1fr_1fr]">
//                               <p className="px-1 py-1 text-sm font-semibold text-gray-700">{c.label}</p>
//                               <div className="rounded-lg bg-red-50 px-3 py-2">
//                                 <p className="text-[11px] font-bold uppercase tracking-wide text-red-700">Before</p>
//                                 <p className="whitespace-pre-line break-words text-sm text-gray-800">{c.before || "—"}</p>
//                               </div>
//                               <div className="rounded-lg bg-green-50 px-3 py-2">
//                                 <p className="text-[11px] font-bold uppercase tracking-wide text-green-700">After</p>
//                                 <p className="whitespace-pre-line break-words text-sm text-gray-800">{c.after || "—"}</p>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </li>
//                     );
//                   })}
//                 </ol>
//               )}
//             </div>
//           );
//         })
//       )}

//       {totalPages > 1 && (
//         <div className="flex items-center justify-end gap-2 text-sm">
//           <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Previous</button>
//           <span className="text-gray-600">Page {page} of {totalPages}</span>
//           <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Next</button>
//         </div>
//       )}
//     </div>
//   );
// };


// // ════════════════════════════════════════════════════════════════
// //  PDF — screen la theriyura list (filters / card / search apply aagi) appadiye A4 landscape la
// //  Employee Performance (Tickets / Bookings) + FIT Performance rendukkum idhe
// // ════════════════════════════════════════════════════════════════
// const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// const PDF_ROWS = { landscape: 10, portrait: 14 }; // oru page ku max rows (perusa irukkura rows na page la fit aagura alavu)
// // Page la irukkura adhe pill colours
// const PDF_PILL = {
//   open: ["#EFF6FF", "#1D4ED8"], pickup: ["#F5F3FF", "#6D28D9"], processing: ["#FFFBEB", "#92400E"], close: ["#F0FDF4", "#15803D"], reject: ["#FEF2F2", "#B91C1C"],
//   active: ["#F0FDF4", "#15803D"], unverified: ["#F3F4F6", "#374151"], completed: ["#FEFCE8", "#854D0E"], cancelRequested: ["#FFF7ED", "#C2410C"],
//   cancelled: ["#FEF2F2", "#B91C1C"], tripCancelled: ["#FFF1F2", "#BE123C"], rejected: ["#FAF5FF", "#7E22CE"],
//   Pending: ["#F3F4F6", "#374151"], "Picked up": ["#F0F9FF", "#0369A1"], "Rate shared": ["#FEFCE8", "#854D0E"], Accepted: ["#F0FDF4", "#15803D"],
//   Closed: ["#F1F5F9", "#334155"], Cancelled: ["#FFF1F2", "#BE123C"], Rejected: ["#FEF2F2", "#B91C1C"],
// };
// // Page cards oda adhe number colour (Tailwind text-* → hex)
// const TW_TEXT = {
//   "slate-900": "#0F172A", "slate-700": "#334155", "sky-800": "#075985", "violet-800": "#5B21B6", "amber-800": "#92400E",
//   "green-800": "#166534", "red-700": "#B91C1C", "gray-700": "#374151", "yellow-800": "#854D0E", "rose-700": "#BE123C",
//   "rose-800": "#9F1239", "purple-700": "#7E22CE", "orange-800": "#9A3412",
// };
// const cardColor = (cls = "") => TW_TEXT[(cls.match(/text-([a-z]+-\d+)/) || [])[1]] || "#111827";
// const pdfPill = (key, label) => {
//   const [bg, fg] = PDF_PILL[key] || ["#F3F4F6", "#374151"];
//   return `<span class="pill" style="background:${bg};color:${fg}"><i style="background:${fg}"></i>${esc(label)}</span>`;
// };
// const buildPerfPdfHtml = ({ title, who, period, viewText, filterText, cards, money, head, rows, foot, direct = false, orient = "landscape" }) => {
//   const P = orient === "portrait";
//   const [W, H] = P ? [210, 297] : [297, 210]; // A4 mm
//   const now = new Date();
//   const gen = `${now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
//   const colgroup = `<colgroup><col style="width:46px">${head.map((h) => `<col${h[1] ? ` style="width:${h[1]}"` : ""}>`).join("")}</colgroup>`;
//   const thead = `<thead><tr><th class="n">#</th>${head.map((h) => `<th${h[2] ? ` class="r"` : ""}>${esc(h[0])}</th>`).join("")}</tr></thead>`;
//   // 2 rows: mela counts, keezha amounts
//   const strip = `<div class="strip">${cards.map((c) => `<div class="card"><b style="color:${c[2] || "#111827"}">${esc(c[1])}</b><span>${esc(c[0])}</span></div>`).join("")}</div>`
//     + (money?.length ? `<div class="strip money">${money.map((c) => `<div class="card m"><b style="color:${c[2] || "#111827"}">${esc(c[1])}</b><span>${esc(c[0])}</span>${c[3] ? `<em>${esc(c[3])}</em>` : ""}</div>`).join("")}</div>` : "");
//   const pageTpl = `<section class="page">
//       <header class="hd">
//         <div><h1>${esc(title)}</h1><div class="sub">${esc(viewText)}</div></div>
//         <div class="who">${esc(who)}<span>${esc(period)}</span></div>
//       </header>
//       <div class="first">${filterText ? `<div class="ft"><b>Filters:</b> ${esc(filterText)}</div>` : ""}${strip}</div>
//       <div class="tw"><table>${colgroup}${thead}<tbody></tbody></table></div>
//       <footer class="pf"><span>Generated on ${esc(gen)}</span><span class="pno"></span></footer>
//     </section>`;
//   // Rows <template> la — browser la alandhu page page ah pirikkum (10 rows / page la fit aagura alavu)
//   return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)} - ${esc(who)}</title>
// <style>
//   @page { size: A4 ${P ? "portrait" : "landscape"}; margin: 8mm; }
//   * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//   body { margin: 0; font-family: "Segoe UI", Roboto, Arial, sans-serif; color: #111827; background: #EEF1F4; font-size: 13.5px; }
//   .bar { position: sticky; top: 0; z-index: 2; display: flex; gap: 8px; justify-content: center; padding: 10px; background: #fff; border-bottom: 1px solid #E5E7EB; }
//   .bar button { border: 0; border-radius: 8px; padding: 8px 18px; font-weight: 600; font-size: 13px; cursor: pointer; background: #16A34A; color: #fff; }
//   .bar button.sec { background: #E5E7EB; color: #374151; }
//   .bar .hint { align-self: center; padding: 8px 14px; border-radius: 8px; background: #FEF3C7; border: 2px solid #F59E0B; color: #92400E; font-size: 15px; font-weight: 700; }
//   .bar .hint b { color: #B91C1C; font-weight: 800; text-decoration: underline; }
//   .page { width: ${W - 16}mm; height: ${H - 17}mm; overflow: hidden; margin: 14px auto; background: #fff; display: flex; flex-direction: column; }
//   @media screen { .page { width: ${W}mm; height: ${H - 1}mm; padding: 8mm; box-shadow: 0 1px 6px rgba(0,0,0,.08); } }
//   ${direct ? `body.direct { background: #fff; } body.direct .page { width: ${W}mm; height: ${H}mm; margin: 0; box-shadow: none; }` : ""}
//   .page > * { flex-shrink: 0; }
//   .hd { display: flex; justify-content: space-between; align-items: flex-end; gap: 14px; border-bottom: 3px solid #16A34A; padding-bottom: 6px; }
//   .hd h1 { margin: 0; font-size: 20px; color: #111827; }
//   .hd .sub { margin-top: 2px; font-size: 12px; color: #4B5563; }
//   .hd .who { text-align: right; font-size: 15px; font-weight: 700; }
//   .hd .who span { display: block; margin-top: 1px; font-size: 12px; font-weight: 600; color: #2563EB; }
//   .ft { margin-top: 6px; font-size: 11px; color: #4B5563; }
//   .strip { display: flex; gap: 10px; margin-top: 10px; }
//   .card { flex: 1 1 0; min-width: 0; border: 1px solid #E5E7EB; border-radius: 10px; padding: 8px 8px; text-align: center; }
//   .card b { display: block; font-size: 22px; line-height: 1.2; }
//   .card span { display: block; margin-top: 3px; font-size: 10.5px; line-height: 1.25; color: #6B7280; font-weight: 600; }
//   .strip.money { margin-top: 16px; }
//   .card.m { background: #fff; border-color: #E5E7EB; } .card.m b { font-size: 20px; }
//   .card.m em { display: block; margin-top: 2px; font-style: normal; font-size: 10.5px; color: #6B7280; }
//   .tw { margin-top: 14px; display: flex; flex-direction: column; }
//   .page.full .tw { flex: 1 1 auto; } .page.full table { flex: 1 1 auto; height: 100%; }
//   table { width: 100%; border-collapse: collapse; table-layout: fixed; }
//   th { background: #DBEAFE; color: #1E3A8A; font-size: 13.5px; font-weight: 700; text-align: left; padding: 9px 9px; border: 1px solid #94A3B8; }
//   td { padding: 8px 9px; border: 1px solid #CBD5E1; vertical-align: middle; text-align: left; word-wrap: break-word; overflow-wrap: anywhere; line-height: 1.35; }
//   tbody tr:nth-child(even) td { background: #F8FAFC; }
//   th.n, td.n { text-align: center; white-space: nowrap; overflow-wrap: normal; } td.n { color: #6B7280; }
//   .r { text-align: left; }
//   .d { display: block; }
//   .s { color: #4B5563; font-size: 12.5px; } .b { font-weight: 700; color: #111827; }
//   .chip { display: inline-block; border-radius: 6px; background: #EFF6FF; color: #1E40AF; font-weight: 700; padding: 2px 8px; font-size: 13px; }
//   .tnr { font-family: ui-monospace, Menlo, monospace; font-weight: 700; color: #92400E; }
//   .dest { font-weight: 700; color: #6B21A8; } .pk { color: #DC2626; font-weight: 600; }
//   .zone { display: inline-block; margin: 3px 3px 0 0; border-radius: 5px; background: #ECFDF5; color: #065F46; font-weight: 600; font-size: 11.5px; padding: 1px 7px; }
//   .muted { color: #9CA3AF; font-weight: 600; }
//   .desc { margin-top: 3px; font-size: 12.5px; color: #374151; white-space: pre-line; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
//   .g { color: #15803D; font-weight: 700; } .red { color: #BE123C; font-weight: 700; } .amb { color: #B45309; } .rj { color: #DC2626; } .or { color: #C2410C; font-weight: 600; }
//   .pill { display: inline-flex; align-items: center; gap: 5px; max-width: 100%; border-radius: 999px; padding: 3px 9px; font-size: 12.5px; font-weight: 600; white-space: nowrap; }
//   .pill i { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
//   .kv { display: block; } .kv .s { margin-right: 3px; }
//   tfoot td { background: #F1F5F9; font-weight: 700; border-top: 2px solid #64748B; vertical-align: middle; }
//   td.empty { text-align: center; color: #6B7280; padding: 20px; }
//   .pf { margin-top: auto; padding-top: 5px; display: flex; justify-content: space-between; font-size: 10px; color: #9CA3AF; }
//   ${P ? `/* Portrait — kurugalaana page: font konjam chinna, cards 2 varisai */
//   body { font-size: 12px; } th { font-size: 12px; padding: 7px 6px; } td { padding: 6px 6px; }
//   .s, .desc { font-size: 11px; } .chip { font-size: 11.5px; } .pill { font-size: 11px; padding: 2px 7px; }
//   .strip { flex-wrap: wrap; } .card { flex: 1 1 22%; } .card b { font-size: 19px; } .card.m b { font-size: 17px; }
//   .hd h1 { font-size: 18px; }` : ""}
//   @media print {
//     body { background: #fff; } .bar { display: none; }
//     .page { margin: 0; page-break-after: always; break-after: page; }
//     .page:last-child { page-break-after: auto; break-after: auto; }
//   }
// </style></head><body${direct ? ' class="direct"' : ""}>
//   ${direct ? "" : `<div class="bar"><button onclick="window.print()">Save as PDF</button><button class="sec" onclick="window.close()">Close</button><span class="hint">⚠️ In the print box, set <b>Orientation → Landscape</b> before saving</span></div>`}
//   <div id="pages"></div>
//   <template id="tpl">${pageTpl}</template>
//   <template id="rows"><table><tbody>${rows.join("") || `<tr><td colspan="${head.length + 1}" class="empty">No records</td></tr>`}</tbody>${foot ? `<tfoot>${foot}</tfoot>` : ""}</table></template>
//   <script>
//   (function () {
//     var MAX = ${PDF_ROWS[P ? "portrait" : "landscape"]};
//     var holder = document.getElementById("pages");
//     var src = document.getElementById("rows").content;
//     var rows = Array.prototype.slice.call(src.querySelectorAll("tbody > tr"));
//     var tfoot = src.querySelector("tfoot");
//     var pages = [];
//     function newPage() {
//       var pg = document.getElementById("tpl").content.firstElementChild.cloneNode(true);
//       if (pages.length) pg.querySelector(".first").remove();
//       holder.appendChild(pg); pages.push(pg); return pg;
//     }
//     function over(pg) { return pg.scrollHeight > pg.clientHeight + 1; }
//     var pg = newPage(), body = pg.querySelector("tbody"), n = 0;
//     rows.forEach(function (tr) {
//       if (n >= MAX) { pg = newPage(); body = pg.querySelector("tbody"); n = 0; }
//       body.appendChild(tr); n++;
//       if (n > 1 && over(pg)) { body.removeChild(tr); pg = newPage(); body = pg.querySelector("tbody"); body.appendChild(tr); n = 1; }
//     });
//     if (tfoot) {
//       // Total row kadaisi page la; idam illaatti kadaisi row + total pudhu page ku
//       var t = pg.querySelector("table"); t.appendChild(tfoot);
//       if (over(pg) && body.children.length > 1) {
//         var lastRow = body.lastElementChild;
//         t.removeChild(tfoot); body.removeChild(lastRow);
//         pg = newPage(); body = pg.querySelector("tbody"); body.appendChild(lastRow); pg.querySelector("table").appendChild(tfoot);
//       }
//     }
//     pages.forEach(function (p, i) {
//       p.querySelector(".pno").textContent = "Page " + (i + 1) + " of " + pages.length;
//       if (p.querySelectorAll("tbody > tr").length >= MAX) p.classList.add("full");
//     });
//     window.__pdfReady = true;
//     ${direct ? "" : "setTimeout(function () { try { window.print(); } catch (e) {} }, 400);"}
//   })();
//   </script>
// </body></html>`;
// };

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
//   const fitExtra = ALL ? ["With"] : view === "fwdBy" ? ["Forwarded to", "Now with"] : view === "fwdTo" ? ["Forwarded by", "Now with"] : ["Now with"]; // "Handled by now" column eppavum


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
//   const monthOf = (d) => { if (!d) return "No date"; const x = new Date(d); return isNaN(x) ? "No date" : x.toLocaleDateString("en-IN", { month: "short", year: "numeric" }); };
//   const ownerName = (e) => (e.ownerKey ? nameOf(e.ownerKey) : "Not picked yet");
//   const raiserName = (e) => (e.raisedByWho?.key ? nameOf(e.raisedByWho.key) : e.raisedByWho?.name || "—");
//   const splitNames = (arr) => fwdNames(arr).split(", ").filter(Boolean);
//   const COLS =
//     tab === "tickets" ? {
//       ticketNo: { label: "Ticket no", fields: [{ key: "c_tno", kind: "text", label: "Ticket no contains", placeholder: "e.g. GVTKT033", get: (t) => t.ticketNo }] },
//       ticket: {
//         label: "Ticket", fields: [
//           { key: "c_subj", kind: "text", label: "Subject / TNR / description contains", placeholder: "e.g. Advance or XQ08ZT", get: (t) => `${t.subject || ""} ${t.tnr || ""} ${t.description || ""}` },
//           { key: "c_type", kind: "multi", label: "Ticket type", options: opts(base, (t) => t.queryType), get: (t) => t.queryType },
//         ]
//       },
//       raisedBy: { label: "Raised by", fields: [{ key: "c_by", kind: "multi", label: "Raised by", search: true, options: opts(base, (t) => t.raisedBy), get: (t) => t.raisedBy }] },
//       raisedTo: { label: "Raised to", fields: [{ key: "c_to", kind: "multi", label: "Raised to", search: true, options: opts(base, (t) => t.raisedTo), get: (t) => t.raisedTo }] },
//       date: { label: "Raised on", fields: [{ key: "date", kind: "date", label: "Raised on", get: (t) => t.createdAt }] },
//       status: { label: "Status", fields: [{ key: "c_st", kind: "multi", label: "Status", options: TICKET_CARDS.filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })), get: (t) => t.status }] },
//     }
//       : tab === "bookings" ? {
//         tnr: {
//           label: "TNR", fields: [
//             { key: "c_tnr", kind: "text", label: "TNR contains", placeholder: "e.g. UF08IX", get: (b) => b.tnr },
//             { key: "date", kind: "date", label: "Booked on", get: (b) => b.bookingDate },
//           ]
//         },
//         tour: {
//           label: "Tour / Customer", fields: [
//             { key: "c_tour", kind: "multi", label: "Tour", search: true, options: opts(base, (b) => b.tour), get: (b) => b.tour },
//             { key: "c_cust", kind: "text", label: "Customer contains", placeholder: "Customer name", get: (b) => b.customer },
//           ]
//         },
//         by: { label: "Booked by", fields: [{ key: "c_by", kind: "multi", label: "Booked by", search: true, options: opts(base, (b) => nameOf(b.empKey)), get: (b) => nameOf(b.empKey) }] },
//         pax: { label: "Pax", fields: [{ key: "c_pax", kind: "multi", label: "Pax", options: fixed([["c", "Has cancelled pax"], ["r", "Has rejected pax"], ["none", "No cancelled / rejected"]]), get: paxTags }] },
//         pay: {
//           label: "Advance / Balance", fields: [
//             { key: "c_adv", kind: "multi", label: "Advance", options: fixed([["paid", "Paid"], ["pending", "Pending"]]), get: (b) => (b.advance?.paid ? "paid" : "pending") },
//             { key: "c_bal", kind: "multi", label: "Balance", options: fixed([["paid", "Paid"], ["pending", "Pending"], ["adjusted", "Adjusted in cancellation"]]), get: (b) => (b.balance?.adjusted ? "adjusted" : b.balance?.paid ? "paid" : "pending") },
//           ]
//         },
//         canc: { label: "Cancellation", fields: [{ key: "c_canc", kind: "multi", label: "Cancellation", options: fixed([["gv", "Has GV"], ["irctc", "Has IRCTC"], ["refund", "Has refund"], ["none", "No cancellation"]]), get: cancTags }] },
//         status: { label: "Status", fields: [{ key: "c_st", kind: "multi", label: "Status", options: BOOKING_CARDS.filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })), get: (b) => b.state }] },
//       }
//         : {
//           code: {
//             label: "Enquiry", fields: [
//               { key: "c_code", kind: "text", label: "FIT code contains", placeholder: "e.g. GVFIT0030", get: (e) => e.fitCode },
//               { key: "date", kind: "date", label: "Enquired on", get: (e) => e.createdAt },
//               { key: "c_raised", kind: "multi", label: "Raised by", search: true, options: opts(base, raiserName), get: raiserName },
//             ]
//           },
//           name: {
//             label: "Customer", fields: [
//               { key: "c_name", kind: "text", label: "Name / mobile contains", placeholder: "Name or mobile", get: (e) => `${e.name || ""} ${e.mobile || ""}` },
//             ]
//           },
//           trip: {
//             label: "Trip", fields: [
//               { key: "c_dest", kind: "multi", label: "Destination", search: true, options: opts(base, (e) => e.destination), get: (e) => String(e.destination || "").trim() },
//               { key: "c_ttype", kind: "multi", label: "Tour type", options: opts(base, (e) => e.tourType), get: (e) => e.tourType },
//               { key: "c_tmonth", kind: "multi", label: "Travel month", options: opts(base, (e) => monthOf(e.travelDate)), get: (e) => monthOf(e.travelDate) },
//               { key: "c_zone", kind: "multi", label: "Zone", options: opts(base, (e) => e.zones || []), get: (e) => (e.zones?.length ? e.zones : ["No zone"]) },
//             ]
//           },
//           fto: { label: "Forwarded to", fields: [{ key: "c_fto", kind: "multi", label: "Forwarded to", search: true, options: opts(base, (e) => splitNames(e.fwdOut)), get: (e) => splitNames(e.fwdOut) }] },
//           fby: { label: "Forwarded by", fields: [{ key: "c_fby", kind: "multi", label: "Forwarded by", search: true, options: opts(base, (e) => splitNames(e.fwdIn)), get: (e) => splitNames(e.fwdIn) }] },
//           with: { label: "Handled by now", fields: [{ key: "c_with", kind: "multi", label: "Currently handled by", search: true, options: opts(base, ownerName), get: ownerName }] },
//           value: {
//             label: "Value", fields: [
//               { key: "c_sales", kind: "multi", label: "Sales value", options: fixed([["yes", "Has sales value"], ["no", "No sales value"]]), get: (e) => (e.salesValue > 0 ? "yes" : "no") },
//               { key: "c_canc", kind: "multi", label: "Cancellation charge", options: fixed([["yes", "Has cancellation charge"], ["no", "No cancellation charge"]]), get: (e) => (e.cancellationCharge > 0 ? "yes" : "no") },
//             ]
//           },
//           stage: { label: "Stage", fields: [{ key: "c_st", kind: "multi", label: "Stage", options: FIT_CARDS.filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })), get: (e) => e.stage }] },
//         };
//   // Indha tab la kaattura columns mattum (filter apply aaga)
//   const visibleCols =
//     tab === "tickets" ? ["ticketNo", "ticket", "raisedBy", "raisedTo", "date", "status"]
//       : tab === "bookings" ? ["tnr", "tour", ...(ALL ? ["by"] : []), "pax", "pay", "canc", "status"]
//         : ["code", "name", "trip", ...(ALL ? ["with"] : view === "fwdBy" ? ["fto", "with"] : view === "fwdTo" ? ["fby", "with"] : ["with"]), "value", "stage"];
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
//     tab === "tickets" ? tBase.filter((t) => (!card || t.status === card) && passCols(t) && has(t.ticketNo, t.subject, t.tnr, t.raisedBy, t.raisedTo, t.description))
//       : tab === "bookings" ? L.filter((b) => (!card || b.state === card) && passCols(b) && has(b.tnr, b.tour, b.customer, nameOf(b.empKey)))
//         : fBase.filter((e) => (!card || e.stage === card) && passCols(e) && has(e.fitCode, e.name, e.destination));


//   // ─── PDF download — ippo screen la theriyura list (tab / view / card / search / column filters) ───
//   const downloadPdf = () => {
//     if (!rows.length) { toast.error("Nothing to download for these filters"); return; }
//     const who = ALL ? "All employees" : `${me?.name || ""}${me?.employeeId ? ` (${me.employeeId})` : ""}`;
//     const period = from || to ? `${from ? fmtDate(from) : "Start"} – ${to ? fmtDate(to) : "Today"}` : "All time";
//     const viewText = tab === "tickets"
//       ? `Tickets · ${(ALL ? ALL_TICKET_VIEWS : TICKET_VIEWS).find((v) => v.key === view)?.label || ""}`.replace(/[🎫✏️]\s?/gu, "")
//       : tab === "bookings" ? "Tour bookings"
//         : `FIT enquiries${ALL ? "" : ` · ${FIT_VIEWS.find((v) => v.key === view)?.label || ""}`}`;
//     const cardList = tab === "tickets" ? TICKET_CARDS : tab === "bookings" ? BOOKING_CARDS : FIT_CARDS;
//     const fp = [];
//     if (card) fp.push(`${tab === "fit" ? "Stage" : "Status"}: ${cardList.find((c) => c.key === card)?.label || card}`);
//     if (q.trim()) fp.push(`Search: ${q.trim()}`);
//     activeFields.forEach((f) => {
//       if (f.kind === "date") return;
//       const v = String(cf[f.key] || "").trim();
//       if (!v) return;
//       const shown = f.kind === "multi" ? v.split(",").map((x) => f.options?.find((o) => o.value === x.trim())?.label || x.trim()).join(", ") : v;
//       fp.push(`${f.label}: ${shown}`);
//     });
//     if (cf.fromDate || cf.toDate) fp.push(`Date: ${cf.fromDate ? fmtDate(cf.fromDate) : "…"} – ${cf.toDate ? fmtDate(cf.toDate) : "…"}`);
//     const count = tab === "tickets" ? tCount : tab === "bookings" ? bCount : fCount;
//     const cards = cardList.map((c) => [c.label, count(c.key), cardColor(c.cls)]);
//     const statusTxt = (k) => (STATUS_PILL[k] || [k])[0];
//     let head, body, foot = "", money = [];
//     const D = (html, cls = "") => `<span class="d ${cls}">${html}</span>`;

//     if (tab === "tickets") {
//       head = [["Ticket no", "11%"], ["Ticket / Description"], ["Raised by", "16%"], ["Raised to", "13%"], ["Raised on", "10%"], ["Status", "12%"]];
//       body = rows.map((t, i) => `<tr><td class="n">${i + 1}</td>
//         <td><span class="chip">${esc(t.ticketNo || "—")}</span></td>
//         <td>${D(esc(t.subject), "b")}${D(`${esc(t.queryType || "")}${t.tnr ? ` · TNR ${esc(t.tnr)}` : ""}`, "s")}${t.description?.trim() ? D(esc(t.description.trim()), "desc") : ""}</td>
//         <td class="b">${esc(t.raisedBy || "—")}</td><td>${esc(t.raisedTo || "—")}</td><td>${esc(fmtDate(t.createdAt))}</td>
//         <td>${pdfPill(t.status, statusTxt(t.status))}</td></tr>`);
//     } else if (tab === "bookings") {
//       money = [
//         // [label, amount, colour, keezha line] — page la irukkura adhe colour + sub line
//         ["Advance received", inr(sum(CB, (b) => (countsMoney(b) && b.advance?.paid ? b.advance.amount : 0))), "#15803D", `${CB.filter((b) => countsMoney(b) && b.advance?.paid).length} bookings · Active + Completed`],
//         ["Balance received", inr(sum(CB, (b) => (countsMoney(b) && b.balance?.paid ? b.balance.amount : 0))), "#15803D", `${CB.filter((b) => countsMoney(b) && b.balance?.paid).length} paid · ${CB.filter((b) => countsMoney(b) && !b.balance?.paid && !b.balance?.adjusted).length} pending`],
//         ["GV cancellation", inr(sum(CB, (b) => b.gvCancellation)), "#C2410C"],
//         ["IRCTC cancellation", inr(sum(CB, (b) => b.irctcCancellation)), "#1D4ED8"],
//         ["Refund", inr(sum(CB, (b) => b.refund)), "#7E22CE"],
//       ];
//       const ml = (label, v) => `<span class="kv"><span class="s">${label}</span>${v?.adjusted ? `<span class="s">Adjusted in cancellation</span>` : `<b>${inr(v?.amount)}</b> <span class="${v?.paid ? "g" : "muted"}">${v?.paid ? "Paid" : "Pending"}</span>`}</span>`;
//       const kv = (label, v) => `<span class="kv"><span class="s">${label}</span><b>${v ? inr(v) : "—"}</b></span>`;
//       head = [["TNR", "9%"], ["Tour / Customer"], ...(ALL ? [["Booked by", "13%"]] : []), ["Pax", "8%"], ["Advance / Balance", "18%"], ["Cancellation", "14%"], ["Status", "14%"]];
//       body = rows.map((b, i) => {
//         const p = paxOf(b);
//         return `<tr><td class="n">${i + 1}</td>
//         <td>${D(esc(b.tnr || "—"), "tnr")}${D(esc(fmtDate(b.bookingDate)), "s")}</td>
//         <td>${D(esc(b.tour), "b")}${D(esc(b.customer || "—"), "s")}</td>${ALL ? `<td class="b">${esc(nameOf(b.empKey))}</td>` : ""}
//         <td>${D(p.a, "b")}${p.c ? D(`${p.c} cancelled`, "s amb") : ""}${p.r ? D(`${p.r} rejected`, "s rj") : ""}</td>
//         <td>${ml("Adv", b.advance)}${ml("Bal", b.balance)}</td>
//         <td>${b.gvCancellation || b.irctcCancellation || b.refund ? `${kv("GV", b.gvCancellation)}${kv("IRCTC", b.irctcCancellation)}${kv("Refund", b.refund)}` : `<span class="muted">—</span>`}</td>
//         <td>${pdfPill(b.state, statusTxt(b.state))}${b.requestedTr > 0 ? D(`${b.requestedTr} cancel request`, "s or") : ""}</td></tr>`;
//       });
//       foot = `<tr><td></td><td colspan="${ALL ? 3 : 2}">Total · ${rows.length} bookings<span class="d s">${sum(rows, (b) => paxOf(b).a)} active pax · ${sum(rows, (b) => paxOf(b).c)} cancelled · ${sum(rows, (b) => paxOf(b).r)} rejected</span></td><td>${sum(rows, (b) => paxOf(b).a)}</td>
//         <td><span class="kv"><span class="s">Adv paid</span><span class="g">${inr(sum(rows, (b) => (countsMoney(b) && b.advance?.paid ? b.advance.amount : 0)))}</span></span><span class="kv"><span class="s">Bal paid</span><span class="g">${inr(sum(rows, (b) => (countsMoney(b) && b.balance?.paid ? b.balance.amount : 0)))}</span></span></td>
//         <td><span class="kv"><span class="s">GV</span>${inr(sum(rows, (b) => b.gvCancellation))}</span><span class="kv"><span class="s">IRCTC</span>${inr(sum(rows, (b) => b.irctcCancellation))}</span><span class="kv"><span class="s">Refund</span>${inr(sum(rows, (b) => b.refund))}</span></td><td></td></tr>`;
//     } else {
//       money = [
//         ["Sales value (accepted)", inr(sum(CB.filter((e) => ["Accepted", "Closed"].includes(e.stage)), (e) => e.salesValue)), "#15803D"],
//         ["Cancellation charge", inr(sum(CB, (e) => e.cancellationCharge)), "#BE123C", `${CB.filter((e) => e.cancellationCharge > 0).length} enquiries`],
//         ...(CB.some((e) => "gvVinoth" in e) ? [
//           ["Vinoth share (GVEMP008)", inr(sum(CB, (e) => e.gvVinoth)), "#4338CA", `${CB.filter((e) => e.gvVinoth > 0).length} enquiries`],
//           ["Giridharan share (GVEMP009)", inr(sum(CB, (e) => e.gvGiridhar)), "#4338CA", `${CB.filter((e) => e.gvGiridhar > 0).length} enquiries`],
//         ] : []),
//       ];
//       const fwdCol = !ALL && view === "fwdBy" ? ["Forwarded to", (e) => fwdNames(e.fwdOut)] : !ALL && view === "fwdTo" ? ["Forwarded by", (e) => fwdNames(e.fwdIn)] : null;
//       head = [["Enquiry", "14%"], ["Customer", "14%"], ["Trip"], ...(fwdCol ? [[fwdCol[0], "11%"]] : []), ["Handled by now", "12%"], ["Value", "10%"], ["Stage", "18%"]];
//       body = rows.map((e, i) => `<tr><td class="n">${i + 1}</td>
//         <td><span class="chip">${esc(e.fitCode || "—")}</span>${D(esc(fmtDate(e.createdAt)), "s")}${D(`by <b class="b">${esc(raiserName(e))}</b>`, "s")}</td>
//         <td>${D(esc(e.name || "—"), "b")}${D(esc([e.mobile, e.pax ? `${e.pax} pax` : ""].filter(Boolean).join(" · ")), "s")}</td>
//         <td>${D(`<span class="dest">${esc(e.destination || "—")}</span>${duration(e) ? ` <span class="s">· ${esc(duration(e))}</span>` : ""}`)}${D(`✈️ ${esc(e.travelDate ? fmtDate(e.travelDate) : "No date")}${e.pickupDate ? ` · <span class="pk">🚌 ${esc(fmtDate(e.pickupDate))}</span>` : ""}`)}${e.zones?.length ? `<span class="d">${e.zones.map((z) => `<span class="zone">${esc(z)}</span>`).join("")}</span>` : ""}</td>
//         ${fwdCol ? `<td class="b">${esc(fwdCol[1](e))}</td>` : ""}
//         <td>${e.ownerKey ? `<span class="b">${esc(ownerName(e))}</span>` : `<span class="muted">${esc(ownerName(e))}</span>`}</td>
//         <td>${e.salesValue || e.cancellationCharge ? `${e.salesValue > 0 ? D(inr(e.salesValue), "g") : ""}${e.cancellationCharge > 0 ? D(`−${inr(e.cancellationCharge)} <span class="s">cancel</span>`, "red") : ""}` : `<span class="muted">—</span>`}</td>
//         <td>${pdfPill(e.stage, e.stage)}${e.lastBy ? D(`${esc(ACTION_LABEL[e.lastBy.action] || "Updated")} by <b class="b">${esc(e.lastBy.key ? nameOf(e.lastBy.key) : e.lastBy.name || "—")}</b> · ${esc(fmtDate(e.lastBy.at))}`, "s") : ""}</td></tr>`);
//       foot = `<tr><td></td><td colspan="${fwdCol ? 5 : 4}">Total · ${rows.length} enquiries</td>
//         <td>${D(inr(sum(rows, (e) => e.salesValue)), "g")}${D(`−${inr(sum(rows, (e) => e.cancellationCharge))}`, "red")}</td><td></td></tr>`;
//     }

//     const html = buildPerfPdfHtml({ title, who, period, viewText, filterText: fp.join(" · "), cards, money, head, rows: body, foot });
//     savePdf(html);
//   };

//   // Browser print — A4 landscape, page la theriyura adhe design
//   const savePdf = (html) => {
//     // Blob URL la open — about:blank illaama, Chrome oda print preview (orientation sariyaa) varum
//     const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
//     const w = window.open(url, "_blank");
//     if (!w) { URL.revokeObjectURL(url); toast.error("Allow pop-ups for this site to download the PDF"); return; }
//     setTimeout(() => URL.revokeObjectURL(url), 60000);
//   };

//   // ─── Clear filters / Refresh ───
//   const [refreshKey, setRefreshKey] = useState(0);
//   const filtersOn = emp !== "*" || preset !== "all" || !!from || !!to || !!card || !!q.trim() || Object.values(cf).some((v) => String(v || "").trim());
//   const clearFilters = () => {
//     setEmp("*");
//     setPreset("all");
//     setRange(["", ""]);
//     setCard("");
//     setQ("");
//     setCf({});
//   };
//   const refreshAll = () => {
//     load();
//     setRefreshKey((k) => k + 1); // Edit history um reload
//   };

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
//         {/* Clear filters + Refresh */}
//         <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
//           <button
//             type="button"
//             onClick={clearFilters}
//             disabled={!filtersOn}
//             className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
//           >
//             <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
//             Clear filters
//           </button>
//           <button
//             type="button"
//             onClick={refreshAll}
//             disabled={loading}
//             className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
//           >
//             <svg viewBox="0 0 24 24" className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36" /><polyline points="21 3 21 9 15 9" /></svg>
//             {loading ? "Refreshing…" : "Refresh"}
//           </button>
//         </div>
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
//           {((!ALL && (tab === "tickets" || tab === "fit")) || (ALL && tab === "tickets")) && (
//             <div className="mb-3 flex flex-wrap gap-1 rounded-2xl bg-gray-100 p-1 sm:inline-flex">
//               {(tab === "tickets" ? (ALL ? ALL_TICKET_VIEWS : TICKET_VIEWS) : FIT_VIEWS).map((v) => (
//                 <button key={v.key} type="button" onClick={() => setView(v.key)} className={pill(view === v.key)}>{v.label}</button>
//               ))}
//             </div>
//           )}
//           {!ALL && tab === "fit" && (
//             <p className="-mt-1 mb-3 text-xs text-gray-500">{FIT_VIEWS.find((v) => v.key === view)?.hint}</p>
//           )}

//           {/* ── Edit history (oru employee) ── */}
//           {tab === "tickets" && view === "Edits" ? (
//             <EditHistoryPanel backendUrl={backendUrl} aToken={aToken} staffId={ALL ? "" : me?.staffId} all={ALL} from={from} to={to} refreshKey={refreshKey} />
//           ) : loading || !list ? (
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
//                   <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
//                     {BOOKING_CARDS.map((c) => <Card key={c.label} c={c} count={bCount(c.key)} active={card === c.key} onClick={() => setCard(c.key)} />)}
//                   </div>
//                   <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
//                     <Money label="Advance received" value={sum(CB, (b) => (countsMoney(b) && b.advance?.paid ? b.advance.amount : 0))} sub={`${CB.filter((b) => countsMoney(b) && b.advance?.paid).length} bookings · Active + Completed`} tone="text-green-700" />
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
//                     <Money label="Cancellation charge" value={sum(CB, (e) => e.cancellationCharge)} sub={`${CB.filter((e) => e.cancellationCharge > 0).length} enquiries`} tone="text-rose-700" />
//                     {CB.some((e) => "gvVinoth" in e) && (
//                       <>
//                         <Money label="Vinoth share (GVEMP008)" value={sum(CB, (e) => e.gvVinoth)} sub={`${CB.filter((e) => e.gvVinoth > 0).length} enquiries`} tone="text-indigo-700" />
//                         <Money label="Giridharan share (GVEMP009)" value={sum(CB, (e) => e.gvGiridhar)} sub={`${CB.filter((e) => e.gvGiridhar > 0).length} enquiries`} tone="text-indigo-700" />
//                       </>
//                     )}
//                   </div>
//                 </>
//               )}

//               {/* ── List ── */}
//               <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
//                 <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-4 py-3">
//                   <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "tickets" ? "Search ticket no, subject, TNR, description" : tab === "bookings" ? "Search TNR, tour, customer" : "Search FIT code, name, place"} className={`w-full min-w-0 flex-1 sm:min-w-[14rem] ${inputCls}`} />
//                   {(card || q || anyCol) && <button type="button" onClick={() => { setCard(""); setQ(""); setCf({}); }} className="text-xs font-semibold text-red-600 hover:underline">Clear all</button>}
//                   <span className="text-xs text-gray-500">Showing {rows.length}</span>
//                   <button
//                     type="button"
//                     onClick={downloadPdf}
//                     disabled={!rows.length}
//                     className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
//                   >
//                     <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
//                     Download PDF
//                   </button>
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
//                           {t.description?.trim() && <p className="mt-1 line-clamp-3 whitespace-pre-line text-xs text-gray-700">{t.description.trim()}</p>}
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
//                               <td className="px-4 py-2.5"><p className="truncate font-semibold text-gray-900">{t.subject}</p><p className="truncate text-xs text-gray-500">{t.queryType}{t.tnr ? ` · TNR ${t.tnr}` : ""}</p>{t.description?.trim() && <p className="mt-1 line-clamp-2 whitespace-pre-line break-words text-xs text-gray-700" title={t.description.trim()}>{t.description.trim()}</p>}</td>
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
//                             <span className="flex items-center gap-1.5">{b.requestedTr > 0 && <span className="text-[11px] font-semibold text-orange-700">{b.requestedTr} cancel request</span>}<Pill s={b.state} /></span>
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
//                               <td className="px-3 py-2.5"><Pill s={b.state} />{b.requestedTr > 0 && <p className="mt-1 text-[11px] font-semibold text-orange-700">{b.requestedTr} cancel request</p>}</td>
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
//                     {mobileFilters("lg")}
//                     {/* Mobile / tablet — cards */}
//                     <ul className="divide-y divide-gray-100 lg:hidden">
//                       {rows.map((e) => (
//                         <li key={e._id} className="px-4 py-3">
//                           <div className="flex items-center justify-between gap-2">
//                             <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800">{e.fitCode || "—"}</span>
//                             <StagePill s={e.stage} />
//                           </div>
//                           <div className="mt-1.5 flex items-start justify-between gap-2">
//                             <div className="min-w-0">
//                               <p className="truncate font-semibold text-gray-900">{e.name}</p>
//                               {e.mobile && <p className="text-xs text-gray-500">📞 {e.mobile}</p>}
//                             </div>
//                           </div>
//                           <p className="mt-1 text-xs text-gray-600">Raised by <b className="text-gray-900">{raiserName(e)}</b></p>
//                           <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl bg-gray-50 p-2.5 text-xs sm:grid-cols-3">
//                             <p><span className="text-gray-500">Destination </span><b className="text-purple-800">{e.destination || "—"}</b>{duration(e) ? ` · ${duration(e)}` : ""}</p>
//                             <p><span className="text-gray-500">Travel </span><b>{e.travelDate ? fmtDate(e.travelDate) : "—"}</b></p>
//                             <p><span className="text-gray-500">Enquired </span>{fmtDate(e.createdAt)}</p>
//                             {e.pickupDate && <p><span className="text-gray-500">Pickup </span><b className="text-red-600">{fmtDate(e.pickupDate)}</b></p>}
//                             {e.salesValue > 0 && <p><span className="text-gray-500">Sales </span><b className="text-green-700">{inr(e.salesValue)}</b></p>}
//                             {e.cancellationCharge > 0 && <p><span className="text-gray-500">Cancellation </span><b className="text-rose-700">{inr(e.cancellationCharge)}</b></p>}
//                             {e.pax > 0 && <p><span className="text-gray-500">Pax </span>{e.pax}</p>}
//                           </div>
//                           <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
//                             <ZoneChips zones={e.zones} />
//                             {!ALL && view === "fwdBy" && <span>Forwarded to <b>{fwdNames(e.fwdOut)}</b></span>}
//                             {!ALL && view === "fwdTo" && <span>Forwarded by <b>{fwdNames(e.fwdIn)}</b></span>}
//                             {fitExtra.length > 0 && <span>Currently handled by <b>{ownerName(e)}</b></span>}
//                             {e.lastBy && <span className="text-gray-500">{ACTION_LABEL[e.lastBy.action] || "Updated"} by <b className="text-gray-800">{e.lastBy.key ? nameOf(e.lastBy.key) : e.lastBy.name || "—"}</b></span>}
//                           </div>
//                         </li>
//                       ))}
//                     </ul>
//                     {/* Desktop — table */}
//                     <div className="hidden lg:block">
//                       <table className="w-full table-fixed text-left text-sm">
//                         <thead className="bg-blue-50 text-xs text-gray-600"><tr>
//                           {head("code", "w-[15%]")}{head("name", "w-[17%]")}{head("trip")}
//                           {visibleCols.filter((id) => ["fto", "fby", "with"].includes(id)).map((id) => head(id, "w-[13%]"))}
//                           {head("value", "w-[11%]")}{head("stage", "w-[17%]")}
//                         </tr></thead>
//                         <tbody>
//                           {rows.map((e) => (
//                             <tr key={e._id} className="border-t border-gray-100 align-top hover:bg-gray-50/60">
//                               <td className="px-3 py-3">
//                                 <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800">{e.fitCode || "—"}</span>
//                                 <p className="mt-1.5 text-[11px] text-gray-500">{fmtDate(e.createdAt)}</p>
//                                 <p className="truncate text-[11px] text-gray-500" title={raiserName(e)}>by <b className="text-gray-700">{raiserName(e)}</b></p>
//                               </td>
//                               <td className="px-3 py-3">
//                                 <p className="truncate font-semibold text-gray-900" title={e.name}>{e.name || "—"}</p>
//                                 <p className="truncate text-xs text-gray-500">{[e.mobile, e.pax ? `${e.pax} pax` : ""].filter(Boolean).join(" · ")}</p>
//                               </td>
//                               <td className="px-3 py-3">
//                                 <p className="truncate"><b className="text-purple-800">{e.destination || "—"}</b><span className="text-xs text-gray-500">{duration(e) ? ` · ${duration(e)}` : ""}</span></p>
//                                 <p className="truncate text-xs text-gray-600">✈️ {e.travelDate ? fmtDate(e.travelDate) : "No date"}{e.pickupDate && <span className="font-semibold text-red-600"> · 🚌 {fmtDate(e.pickupDate)}</span>}</p>
//                                 {e.zones?.length > 0 && <div className="mt-1"><ZoneChips zones={e.zones} /></div>}
//                               </td>
//                               {!ALL && view === "fwdBy" && <td className="truncate px-3 py-3 text-xs font-semibold">{fwdNames(e.fwdOut)}</td>}
//                               {!ALL && view === "fwdTo" && <td className="truncate px-3 py-3 text-xs font-semibold">{fwdNames(e.fwdIn)}</td>}
//                               {fitExtra.length > 0 && <td className={`truncate px-3 py-3 text-xs font-semibold ${e.ownerKey ? "text-gray-900" : "text-gray-400"}`} title={ownerName(e)}>{ownerName(e)}</td>}
//                               <td className="px-3 py-3 text-xs">
//                                 {e.salesValue || e.cancellationCharge ? (
//                                   <>
//                                     {e.salesValue > 0 && <p className="font-semibold text-green-700">{inr(e.salesValue)}</p>}
//                                     {e.cancellationCharge > 0 && <p className="font-semibold text-rose-700">−{inr(e.cancellationCharge)} <span className="font-normal text-gray-500">cancel</span></p>}
//                                   </>
//                                 ) : <span className="text-gray-400">—</span>}
//                               </td>
//                               <td className="px-3 py-3">
//                                 <StagePill s={e.stage} />
//                                 {e.lastBy && (
//                                   <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-gray-500" title={`${ACTION_LABEL[e.lastBy.action] || "Updated"} by ${e.lastBy.key ? nameOf(e.lastBy.key) : e.lastBy.name || "—"}`}>
//                                     {ACTION_LABEL[e.lastBy.action] || "Updated"} by <b className="text-gray-700">{e.lastBy.key ? nameOf(e.lastBy.key) : e.lastBy.name || "—"}</b> · {fmtDate(e.lastBy.at)}
//                                   </p>
//                                 )}
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                     <div className="flex flex-wrap justify-between gap-2 border-t-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold">
//                       <span>Total · {rows.length} enquiries</span><span className="flex flex-wrap gap-x-4"><span className="text-green-700">Sales value {inr(sum(rows, (e) => e.salesValue))}</span><span className="text-rose-700">Cancellation {inr(sum(rows, (e) => e.cancellationCharge))}</span></span>
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
  { key: "Edits", label: "✏️ Edit history" }, // avanga panna ticket edits (Raise Ticket → Edit History maadhiri)
];
// All employees → Tickets / ellaa employees oda full edit history
const ALL_TICKET_VIEWS = [
  { key: "Assigned", label: "🎫 All tickets" },
  { key: "Edits", label: "✏️ Edit history (all employees)" },
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
// FIT sales value — Accepted + Closed mattum (mela card maadhiriye; Cancelled / Rejected sales count aagaadhu)
const isSale = (e) => e.stage === "Accepted" || e.stage === "Closed";
// ─── Ticket Priority + ETA (Raise / View Tickets page maadhiri) ───
const PRIO = { low: ["Low", "bg-slate-50 text-slate-600 ring-slate-200", "#F1F5F9", "#475569"], medium: ["Medium", "bg-amber-50 text-amber-700 ring-amber-200", "#FFFBEB", "#B45309"], high: ["High", "bg-rose-50 text-rose-700 ring-rose-200", "#FFF1F2", "#BE123C"] };
const prioOf = (t) => (PRIO[t?.priority] ? t.priority : "low");
const dayStr = (d) => { const x = new Date(d); return isNaN(x) ? "" : `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`; };
const etaOf = (t) => {
  if (!t?.etaDate) return null;
  const day = dayStr(t.etaDate); if (!day) return null;
  const d0 = new Date(`${day}T00:00:00`);
  const diff = Math.round((d0 - new Date(`${dayStr(new Date())}T00:00:00`)) / 86400000);
  const date = d0.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const wd = d0.toLocaleDateString("en-IN", { weekday: "short" });
  if (["close", "reject"].includes(t.status)) return { date, wd, rel: "", cls: "bg-gray-50 text-gray-500 ring-gray-200", c: ["#F9FAFB", "#6B7280"] };
  if (diff < 0) return { date, wd, rel: `${-diff}d overdue`, cls: "bg-red-600 text-white ring-red-600", c: ["#DC2626", "#FFFFFF"] };
  if (diff === 0) return { date, wd, rel: "Today", cls: "bg-orange-100 text-orange-800 ring-orange-300", c: ["#FFEDD5", "#9A3412"] };
  if (diff === 1) return { date, wd, rel: "Tomorrow", cls: "bg-amber-50 text-amber-800 ring-amber-200", c: ["#FFFBEB", "#92400E"] };
  return { date, wd, rel: `in ${diff}d`, cls: "bg-sky-50 text-sky-700 ring-sky-200", c: ["#F0F9FF", "#0369A1"] };
};
const PrioBadge = ({ t }) => {
  const [l, cls] = PRIO[prioOf(t)];
  return <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${cls}`}>⚑ {l}</span>;
};
const EtaCell = ({ t }) => {
  const e = etaOf(t);
  if (!e) return <span className="text-sm text-gray-300">—</span>;
  return (
    <div className="whitespace-nowrap">
      <p className="text-sm font-semibold text-gray-800">📅 {e.date}</p>
      <p className="mt-1 flex items-center gap-1.5"><span className="text-xs font-medium text-gray-500">{e.wd}</span>{e.rel && <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ring-1 ring-inset ${e.cls}`}>{e.rel}</span>}</p>
    </div>
  );
};
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

// ─── Edit history — oru employee panna ticket edits (Admin Raise Ticket → Edit History maadhiri) ───
const EDIT_KIND = {
  query: ["Ticket edited", "bg-blue-50 text-blue-700"],
  "reply-edit": ["Reply edited", "bg-violet-50 text-violet-700"],
  "reply-delete": ["Reply deleted", "bg-red-50 text-red-700"],
};
const fmtDT = (d) =>
  d ? `${new Date(d).toLocaleDateString("en-IN")} ${new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}` : "—";
const byLabel = (e) => e.staffName || (e.by === "touradmin" ? "Tour admin" : "Admin");

const EditHistoryPanel = ({ backendUrl, aToken, staffId, all = false, from, to, refreshKey = 0 }) => {
  const [items, setItems] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [hidden, setHidden] = useState({});

  useEffect(() => { setPage(1); }, [staffId, all, from, to, term]);
  useEffect(() => {
    const t = setTimeout(() => setTerm(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!staffId && !all) return;
    let alive = true;
    setItems(null);
    axios
      .get(`${backendUrl}/api/touradmin/queries/edit-history`, {
        headers: { aToken },
        params: { staff: all ? undefined : staffId, page, limit: 10, search: term || undefined, from: from || undefined, to: to || undefined },
      })
      .then(({ data }) => {
        if (!alive) return;
        if (!data?.success) throw new Error(data?.message || "Failed to load edit history");
        setItems(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      })
      .catch((err) => {
        if (!alive) return;
        toast.error(err.response?.data?.message || err.message);
        setItems([]);
      });
    return () => { alive = false; };
  }, [backendUrl, aToken, staffId, all, page, term, from, to, refreshKey]);

  const edits = (items || []).reduce((n, q) => n + (q.edits?.length || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ticket no (GVTKT001) or subject"
          className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <span className="text-xs text-gray-500">{total} ticket{total !== 1 ? "s" : ""}{items ? ` · ${edits} edit${edits !== 1 ? "s" : ""} on this page` : ""}</span>
      </div>

      {!items ? (
        <p className="py-10 text-center text-sm text-gray-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-gray-200 bg-white py-10 text-center text-sm text-gray-500">{all ? "No edits by any employee" : "No edits by this employee"}{from || to ? " in this period" : ""}.</p>
      ) : (
        items.map((q) => {
          const isHidden = hidden[q.queryId];
          return (
            <div key={q.queryId} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2 bg-blue-50/60 px-4 py-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold tracking-wide text-blue-800">{q.ticketNo || "—"}</span>
                    <Pill s={q.status} />
                    <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-gray-700">{q.editCount} edit{q.editCount !== 1 ? "s" : ""}</span>
                  </div>
                  <p className="mt-1.5 truncate font-semibold text-gray-900">{q.subject}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>Last edit {fmtDT(q.lastEditedAt)}</span>
                  <button type="button" onClick={() => setHidden((h) => ({ ...h, [q.queryId]: !h[q.queryId] }))} className="font-semibold text-blue-600 hover:underline">
                    {isHidden ? "Show" : "Hide"}
                  </button>
                </div>
              </div>
              {!isHidden && (
                <ol className="space-y-4 px-4 py-4">
                  {q.edits.map((e) => {
                    const [kLabel, kCls] = EDIT_KIND[e.kind] || EDIT_KIND.query;
                    return (
                      <li key={e.id} className="relative pl-6">
                        <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-blue-500" aria-hidden="true" />
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="font-bold text-gray-900">Edit {e.editNo}</span>
                          <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${kCls}`}>{kLabel}</span>
                          <span className="text-gray-500">by <b className="text-gray-800">{byLabel(e)}</b></span>
                          <span className="text-xs text-gray-500">{fmtDT(e.editedAt)}</span>
                        </div>
                        <div className="mt-2 space-y-2 rounded-xl border border-gray-100 p-2">
                          {(e.changes || []).map((c, i) => (
                            <div key={i} className="grid gap-2 md:grid-cols-[10rem_1fr_1fr]">
                              <p className="px-1 py-1 text-sm font-semibold text-gray-700">{c.label}</p>
                              <div className="rounded-lg bg-red-50 px-3 py-2">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-red-700">Before</p>
                                <p className="whitespace-pre-line break-words text-sm text-gray-800">{c.before || "—"}</p>
                              </div>
                              <div className="rounded-lg bg-green-50 px-3 py-2">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-green-700">After</p>
                                <p className="whitespace-pre-line break-words text-sm text-gray-800">{c.after || "—"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          );
        })
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Previous</button>
          <span className="text-gray-600">Page {page} of {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
};


// ════════════════════════════════════════════════════════════════
//  PDF — screen la theriyura list (filters / card / search apply aagi) appadiye A4 landscape la
//  Employee Performance (Tickets / Bookings) + FIT Performance rendukkum idhe
// ════════════════════════════════════════════════════════════════
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const PDF_ROWS = { landscape: 10, portrait: 14 }; // oru page ku max rows (perusa irukkura rows na page la fit aagura alavu)
// Page la irukkura adhe pill colours
const PDF_PILL = {
  open: ["#EFF6FF", "#1D4ED8"], pickup: ["#F5F3FF", "#6D28D9"], processing: ["#FFFBEB", "#92400E"], close: ["#F0FDF4", "#15803D"], reject: ["#FEF2F2", "#B91C1C"],
  active: ["#F0FDF4", "#15803D"], unverified: ["#F3F4F6", "#374151"], completed: ["#FEFCE8", "#854D0E"], cancelRequested: ["#FFF7ED", "#C2410C"],
  cancelled: ["#FEF2F2", "#B91C1C"], tripCancelled: ["#FFF1F2", "#BE123C"], rejected: ["#FAF5FF", "#7E22CE"],
  Pending: ["#F3F4F6", "#374151"], "Picked up": ["#F0F9FF", "#0369A1"], "Rate shared": ["#FEFCE8", "#854D0E"], Accepted: ["#F0FDF4", "#15803D"],
  Closed: ["#F1F5F9", "#334155"], Cancelled: ["#FFF1F2", "#BE123C"], Rejected: ["#FEF2F2", "#B91C1C"],
};
// Page cards oda adhe number colour (Tailwind text-* → hex)
const TW_TEXT = {
  "slate-900": "#0F172A", "slate-700": "#334155", "sky-800": "#075985", "violet-800": "#5B21B6", "amber-800": "#92400E",
  "green-800": "#166534", "red-700": "#B91C1C", "gray-700": "#374151", "yellow-800": "#854D0E", "rose-700": "#BE123C",
  "rose-800": "#9F1239", "purple-700": "#7E22CE", "orange-800": "#9A3412",
};
const cardColor = (cls = "") => TW_TEXT[(cls.match(/text-([a-z]+-\d+)/) || [])[1]] || "#111827";
const pdfPill = (key, label) => {
  const [bg, fg] = PDF_PILL[key] || ["#F3F4F6", "#374151"];
  return `<span class="pill" style="background:${bg};color:${fg}"><i style="background:${fg}"></i>${esc(label)}</span>`;
};
const buildPerfPdfHtml = ({ title, who, period, viewText, filterText, cards, money, head, rows, foot, direct = false, orient = "landscape" }) => {
  const P = orient === "portrait";
  const [W, H] = P ? [210, 297] : [297, 210]; // A4 mm
  const now = new Date();
  const gen = `${now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
  const colgroup = `<colgroup><col style="width:58px">${head.map((h) => `<col${h[1] ? ` style="width:${h[1]}"` : ""}>`).join("")}</colgroup>`;
  const thead = `<thead><tr><th class="n">S.No</th>${head.map((h) => `<th${h[2] ? ` class="r"` : ""}>${esc(h[0])}</th>`).join("")}</tr></thead>`;
  // 2 rows: mela counts, keezha amounts
  const strip = `<div class="strip">${cards.map((c) => `<div class="card"><b style="color:${c[2] || "#111827"}">${esc(c[1])}</b><span>${esc(c[0])}</span></div>`).join("")}</div>`
    + (money?.length ? `<div class="strip money">${money.map((c) => `<div class="card m"><b style="color:${c[2] || "#111827"}">${esc(c[1])}</b><span>${esc(c[0])}</span>${c[3] ? `<em>${esc(c[3])}</em>` : ""}</div>`).join("")}</div>` : "");
  const pageTpl = `<section class="page">
      <header class="hd">
        <div><h1>${esc(title)}</h1><div class="sub">${esc(viewText)}</div></div>
        <div class="who">${esc(who)}<span>${esc(period)}</span></div>
      </header>
      <div class="first">${filterText ? `<div class="ft"><b>Filters:</b> ${esc(filterText)}</div>` : ""}${strip}</div>
      <div class="tw"><table>${colgroup}${thead}<tbody></tbody></table></div>
      <footer class="pf"><span>Generated on ${esc(gen)}</span><span class="pno"></span></footer>
    </section>`;
  // Rows <template> la — browser la alandhu page page ah pirikkum (10 rows / page la fit aagura alavu)
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)} - ${esc(who)}</title>
<style>
  @page { size: A4 ${P ? "portrait" : "landscape"}; margin: 8mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; font-family: "Segoe UI", Roboto, Arial, sans-serif; color: #111827; background: #EEF1F4; font-size: 13.5px; }
  .bar { position: sticky; top: 0; z-index: 2; display: flex; gap: 8px; justify-content: center; padding: 10px; background: #fff; border-bottom: 1px solid #E5E7EB; }
  .bar button { border: 0; border-radius: 8px; padding: 8px 18px; font-weight: 600; font-size: 13px; cursor: pointer; background: #16A34A; color: #fff; }
  .bar button.sec { background: #E5E7EB; color: #374151; }
  .bar .hint { align-self: center; padding: 8px 14px; border-radius: 8px; background: #FEF3C7; border: 2px solid #F59E0B; color: #92400E; font-size: 15px; font-weight: 700; }
  .bar .hint b { color: #B91C1C; font-weight: 800; text-decoration: underline; }
  .page { width: ${W - 16}mm; height: ${H - 17}mm; overflow: hidden; margin: 14px auto; background: #fff; display: flex; flex-direction: column; }
  @media screen { .page { width: ${W}mm; height: ${H - 1}mm; padding: 8mm; box-shadow: 0 1px 6px rgba(0,0,0,.08); } }
  ${direct ? `body.direct { background: #fff; } body.direct .page { width: ${W}mm; height: ${H}mm; margin: 0; box-shadow: none; }` : ""}
  .page > * { flex-shrink: 0; }
  .hd { display: flex; justify-content: space-between; align-items: flex-end; gap: 14px; border-bottom: 3px solid #16A34A; padding-bottom: 6px; }
  .hd h1 { margin: 0; font-size: 20px; color: #111827; }
  .hd .sub { margin-top: 2px; font-size: 12px; color: #4B5563; }
  .hd .who { text-align: right; font-size: 15px; font-weight: 700; }
  .hd .who span { display: block; margin-top: 1px; font-size: 12px; font-weight: 600; color: #2563EB; }
  .ft { margin-top: 6px; font-size: 11px; color: #4B5563; }
  .strip { display: flex; gap: 10px; margin-top: 10px; }
  .card { flex: 1 1 0; min-width: 0; border: 1px solid #E5E7EB; border-radius: 10px; padding: 8px 8px; text-align: center; }
  .card b { display: block; font-size: 22px; line-height: 1.2; }
  .card span { display: block; margin-top: 3px; font-size: 10.5px; line-height: 1.25; color: #6B7280; font-weight: 600; }
  .strip.money { margin-top: 16px; }
  .card.m { background: #fff; border-color: #E5E7EB; } .card.m b { font-size: 20px; }
  .card.m em { display: block; margin-top: 2px; font-style: normal; font-size: 10.5px; color: #6B7280; }
  .tw { margin-top: 14px; display: flex; flex-direction: column; }
  .page.full .tw { flex: 1 1 auto; } .page.full table { flex: 1 1 auto; height: 100%; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  th { background: #DBEAFE; color: #1E3A8A; font-size: 13.5px; font-weight: 700; text-align: left; padding: 9px 9px; border: 1px solid #94A3B8; }
  td { padding: 8px 9px; border: 1px solid #CBD5E1; vertical-align: middle; text-align: left; word-wrap: break-word; overflow-wrap: anywhere; line-height: 1.35; }
  tbody tr:nth-child(even) td { background: #F8FAFC; }
  th.n, td.n { text-align: center; white-space: nowrap; overflow-wrap: normal; } td.n { color: #6B7280; }
  .r { text-align: left; }
  .d { display: block; }
  .s { color: #4B5563; font-size: 12.5px; } .b { font-weight: 700; color: #111827; }
  .chip { display: inline-block; border-radius: 6px; background: #EFF6FF; color: #1E40AF; font-weight: 700; padding: 2px 8px; font-size: 13px; }
  .tnr { font-family: ui-monospace, Menlo, monospace; font-weight: 700; color: #92400E; }
  .dest { font-weight: 700; color: #6B21A8; } .pk { color: #DC2626; font-weight: 600; }
  .zone { display: inline-block; margin: 3px 3px 0 0; border-radius: 5px; background: #ECFDF5; color: #065F46; font-weight: 600; font-size: 11.5px; padding: 1px 7px; }
  .muted { color: #9CA3AF; font-weight: 600; }
  .desc { margin-top: 3px; font-size: 12.5px; color: #374151; white-space: pre-line; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .g { color: #15803D; font-weight: 700; } .red { color: #BE123C; font-weight: 700; } .amb { color: #B45309; } .rj { color: #DC2626; } .or { color: #C2410C; font-weight: 600; }
  .pill { display: inline-flex; align-items: center; gap: 5px; max-width: 100%; border-radius: 999px; padding: 3px 9px; font-size: 12.5px; font-weight: 600; white-space: nowrap; }
  .pill i { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
  .kv { display: block; } .kv .s { margin-right: 3px; }
  tfoot td { background: #F1F5F9; font-weight: 700; border-top: 2px solid #64748B; vertical-align: middle; }
  td.empty { text-align: center; color: #6B7280; padding: 20px; }
  .pf { margin-top: auto; padding-top: 5px; display: flex; justify-content: space-between; font-size: 10px; color: #9CA3AF; }
  .pf > span { flex: 1; } .pf > .pno { text-align: right; } .pf > .eor { text-align: center; font-weight: 800; color: #4B5563; }
  ${P ? `/* Portrait — kurugalaana page: font konjam chinna, cards 2 varisai */
  body { font-size: 12px; } th { font-size: 12px; padding: 7px 6px; } td { padding: 6px 6px; }
  .s, .desc { font-size: 11px; } .chip { font-size: 11.5px; } .pill { font-size: 11px; padding: 2px 7px; }
  .strip { flex-wrap: wrap; } .card { flex: 1 1 22%; } .card b { font-size: 19px; } .card.m b { font-size: 17px; }
  .hd h1 { font-size: 18px; }` : ""}
  @media print {
    body { background: #fff; } .bar { display: none; }
    .page { margin: 0; page-break-after: always; break-after: page; }
    .page:last-child { page-break-after: auto; break-after: auto; }
  }
</style></head><body${direct ? ' class="direct"' : ""}>
  ${direct ? "" : `<div class="bar"><button onclick="window.print()">Save as PDF</button><button class="sec" onclick="window.close()">Close</button><span class="hint">⚠️ In the print box, set <b>Orientation → Landscape</b> before saving</span></div>`}
  <div id="pages"></div>
  <template id="tpl">${pageTpl}</template>
  <template id="rows"><table><tbody>${rows.join("") || `<tr><td colspan="${head.length + 1}" class="empty">No records</td></tr>`}</tbody>${foot ? `<tfoot>${foot}</tfoot>` : ""}</table></template>
  <script>
  (function () {
    var MAX = ${PDF_ROWS[P ? "portrait" : "landscape"]};
    var holder = document.getElementById("pages");
    var src = document.getElementById("rows").content;
    var rows = Array.prototype.slice.call(src.querySelectorAll("tbody > tr"));
    var tfoot = src.querySelector("tfoot");
    var pages = [];
    function newPage() {
      var pg = document.getElementById("tpl").content.firstElementChild.cloneNode(true);
      if (pages.length) pg.querySelector(".first").remove();
      holder.appendChild(pg); pages.push(pg); return pg;
    }
    function over(pg) { return pg.scrollHeight > pg.clientHeight + 1; }
    var pg = newPage(), body = pg.querySelector("tbody"), n = 0;
    rows.forEach(function (tr) {
      if (n >= MAX) { pg = newPage(); body = pg.querySelector("tbody"); n = 0; }
      body.appendChild(tr); n++;
      if (n > 1 && over(pg)) { body.removeChild(tr); pg = newPage(); body = pg.querySelector("tbody"); body.appendChild(tr); n = 1; }
    });
    if (tfoot) {
      // Total row kadaisi page la; idam illaatti kadaisi row + total pudhu page ku
      var t = pg.querySelector("table"); t.appendChild(tfoot);
      if (over(pg) && body.children.length > 1) {
        var lastRow = body.lastElementChild;
        t.removeChild(tfoot); body.removeChild(lastRow);
        pg = newPage(); body = pg.querySelector("tbody"); body.appendChild(lastRow); pg.querySelector("table").appendChild(tfoot);
      }
    }
    pages.forEach(function (p, i) {
      p.querySelector(".pno").textContent = "Page " + (i + 1) + " of " + pages.length;
      // Report mudiyura page footer la naduvula "End of Report" (adhe font size, bold)
      if (i === pages.length - 1) { var e = document.createElement("span"); e.className = "eor"; e.textContent = "End of Report"; p.querySelector(".pno").before(e); }
      if (p.querySelectorAll("tbody > tr").length >= MAX) p.classList.add("full");
    });
    window.__pdfReady = true;
    ${direct ? "" : "setTimeout(function () { try { window.print(); } catch (e) {} }, 400);"}
  })();
  </script>
</body></html>`;
};

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
  // ETA tags — Overdue / Today / Tomorrow / Next 7 days / After 7 days / No ETA
  const etaTags = (t) => {
    if (!t.etaDate) return ["none"];
    const day = dayStr(t.etaDate), today = dayStr(new Date());
    const diff = Math.round((new Date(`${day}T00:00:00`) - new Date(`${today}T00:00:00`)) / 86400000);
    const out = [];
    if (diff < 0 && !["close", "reject"].includes(t.status)) out.push("overdue");
    if (diff === 0) out.push("today");
    if (diff === 1) out.push("tomorrow");
    if (diff >= 0 && diff < 7) out.push("week");
    if (diff >= 7) out.push("later");
    return out.length ? out : ["past"];
  };
  // Tickets — ETA munnaadi irukkuradhu mudhal (Raise / View Tickets maadhiri); ore ETA na munnaadi raise aanadhu;
  // ETA illaadhadhu kadaisila (puthusu mudhal). Screen + PDF rendukkum.
  const byEta = (a, b) => {
    const ea = a.etaDate ? new Date(a.etaDate).getTime() : null, eb = b.etaDate ? new Date(b.etaDate).getTime() : null;
    if (ea !== null && eb !== null) return ea - eb || new Date(a.createdAt) - new Date(b.createdAt);
    if (ea !== null) return -1;
    if (eb !== null) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  };
  const COLS =
    tab === "tickets" ? {
      ticketNo: { label: "Ticket no", fields: [{ key: "c_tno", kind: "text", label: "Ticket no contains", placeholder: "e.g. GVTKT033", get: (t) => t.ticketNo }] },
      ticket: {
        label: "Ticket", fields: [
          { key: "c_subj", kind: "text", label: "Subject / TNR / description contains", placeholder: "e.g. Advance or XQ08ZT", get: (t) => `${t.subject || ""} ${t.tnr || ""} ${t.description || ""}` },
          { key: "c_type", kind: "multi", label: "Ticket type", options: opts(base, (t) => t.queryType), get: (t) => t.queryType },
        ]
      },
      raisedBy: { label: "Raised by", fields: [{ key: "c_by", kind: "multi", label: "Raised by", search: true, options: opts(base, (t) => t.raisedBy), get: (t) => t.raisedBy }] },
      raisedTo: { label: "Raised to", fields: [{ key: "c_to", kind: "multi", label: "Raised to", search: true, options: opts(base, (t) => t.raisedTo), get: (t) => t.raisedTo }] },
      date: { label: "Raised on", fields: [{ key: "date", kind: "date", label: "Raised on", get: (t) => t.createdAt }] },
      eta: { label: "ETA", fields: [
        { key: "c_etaR", kind: "range", fromKey: "c_etaFrom", toKey: "c_etaTo", label: "ETA date" },
        { key: "c_eta", kind: "multi", label: "ETA", options: fixed([["overdue", "Overdue"], ["today", "Today"], ["tomorrow", "Tomorrow"], ["week", "Within a week"], ["later", "More than a week"], ["none", "No ETA"]]), get: etaTags },
      ] },
      status: { label: "Status", fields: [
        { key: "c_st", kind: "multi", label: "Status", options: TICKET_CARDS.filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })), get: (t) => t.status },
        { key: "c_prio", kind: "multi", label: "Priority", options: fixed([["low", "Low"], ["medium", "Medium"], ["high", "High"]]), get: (t) => prioOf(t) },
      ] },
    }
      : tab === "bookings" ? {
        tnr: {
          label: "TNR", fields: [
            { key: "c_tnr", kind: "text", label: "TNR contains", placeholder: "e.g. UF08IX", get: (b) => b.tnr },
            { key: "date", kind: "date", label: "Booked on", get: (b) => b.bookingDate },
          ]
        },
        tour: {
          label: "Tour / Customer", fields: [
            { key: "c_tour", kind: "multi", label: "Tour", search: true, options: opts(base, (b) => b.tour), get: (b) => b.tour },
            { key: "c_cust", kind: "text", label: "Customer contains", placeholder: "Customer name", get: (b) => b.customer },
          ]
        },
        by: { label: "Booked by", fields: [{ key: "c_by", kind: "multi", label: "Booked by", search: true, options: opts(base, (b) => nameOf(b.empKey)), get: (b) => nameOf(b.empKey) }] },
        pax: { label: "Pax", fields: [{ key: "c_pax", kind: "multi", label: "Pax", options: fixed([["c", "Has cancelled pax"], ["r", "Has rejected pax"], ["none", "No cancelled / rejected"]]), get: paxTags }] },
        pay: {
          label: "Advance / Balance", fields: [
            { key: "c_adv", kind: "multi", label: "Advance", options: fixed([["paid", "Paid"], ["pending", "Pending"]]), get: (b) => (b.advance?.paid ? "paid" : "pending") },
            { key: "c_bal", kind: "multi", label: "Balance", options: fixed([["paid", "Paid"], ["pending", "Pending"], ["adjusted", "Adjusted in cancellation"]]), get: (b) => (b.balance?.adjusted ? "adjusted" : b.balance?.paid ? "paid" : "pending") },
          ]
        },
        canc: { label: "Cancellation", fields: [{ key: "c_canc", kind: "multi", label: "Cancellation", options: fixed([["gv", "Has GV"], ["irctc", "Has IRCTC"], ["refund", "Has refund"], ["none", "No cancellation"]]), get: cancTags }] },
        status: { label: "Status", fields: [{ key: "c_st", kind: "multi", label: "Status", options: BOOKING_CARDS.filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })), get: (b) => b.state }] },
      }
        : {
          code: {
            label: "Enquiry", fields: [
              { key: "c_code", kind: "text", label: "FIT code contains", placeholder: "e.g. GVFIT0030", get: (e) => e.fitCode },
              { key: "date", kind: "date", label: "Enquired on", get: (e) => e.createdAt },
              { key: "c_raised", kind: "multi", label: "Raised by", search: true, options: opts(base, raiserName), get: raiserName },
            ]
          },
          name: {
            label: "Customer", fields: [
              { key: "c_name", kind: "text", label: "Name / mobile contains", placeholder: "Name or mobile", get: (e) => `${e.name || ""} ${e.mobile || ""}` },
            ]
          },
          trip: {
            label: "Trip", fields: [
              { key: "c_dest", kind: "multi", label: "Destination", search: true, options: opts(base, (e) => e.destination), get: (e) => String(e.destination || "").trim() },
              { key: "c_ttype", kind: "multi", label: "Tour type", options: opts(base, (e) => e.tourType), get: (e) => e.tourType },
              { key: "c_tmonth", kind: "multi", label: "Travel month", options: opts(base, (e) => monthOf(e.travelDate)), get: (e) => monthOf(e.travelDate) },
              { key: "c_zone", kind: "multi", label: "Zone", options: opts(base, (e) => e.zones || []), get: (e) => (e.zones?.length ? e.zones : ["No zone"]) },
            ]
          },
          fto: { label: "Forwarded to", fields: [{ key: "c_fto", kind: "multi", label: "Forwarded to", search: true, options: opts(base, (e) => splitNames(e.fwdOut)), get: (e) => splitNames(e.fwdOut) }] },
          fby: { label: "Forwarded by", fields: [{ key: "c_fby", kind: "multi", label: "Forwarded by", search: true, options: opts(base, (e) => splitNames(e.fwdIn)), get: (e) => splitNames(e.fwdIn) }] },
          with: { label: "Handled by now", fields: [{ key: "c_with", kind: "multi", label: "Currently handled by", search: true, options: opts(base, ownerName), get: ownerName }] },
          value: {
            label: "Value", fields: [
              { key: "c_sales", kind: "multi", label: "Sales value", options: fixed([["yes", "Has sales value"], ["no", "No sales value"]]), get: (e) => (e.salesValue > 0 ? "yes" : "no") },
              { key: "c_canc", kind: "multi", label: "Cancellation charge", options: fixed([["yes", "Has cancellation charge"], ["no", "No cancellation charge"]]), get: (e) => (e.cancellationCharge > 0 ? "yes" : "no") },
            ]
          },
          stage: { label: "Stage", fields: [{ key: "c_st", kind: "multi", label: "Stage", options: FIT_CARDS.filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })), get: (e) => e.stage }] },
        };
  // Indha tab la kaattura columns mattum (filter apply aaga)
  const visibleCols =
    tab === "tickets" ? ["ticketNo", "ticket", "raisedBy", "raisedTo", "date", "eta", "status"]
      : tab === "bookings" ? ["tnr", "tour", ...(ALL ? ["by"] : []), "pax", "pay", "canc", "status"]
        : ["code", "name", "trip", ...(ALL ? ["with"] : view === "fwdBy" ? ["fto", "with"] : view === "fwdTo" ? ["fby", "with"] : ["with"]), "value", "stage"];
  const activeFields = visibleCols.flatMap((id) => COLS[id]?.fields || []);
  const localDay = (d) => { if (!d) return ""; const x = new Date(d); return isNaN(x) ? "" : x.toLocaleDateString("en-CA"); };
  const passCols = (r) => activeFields.every((f) => {
    if (f.kind === "range") {
      const a = cf[f.fromKey], b = cf[f.toKey];
      if (!a && !b) return true;
      const day = r.etaDate ? dayStr(r.etaDate) : "";
      return !!day && (!a || day >= a) && (!b || day <= b);
    }
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
    tab === "tickets" ? tBase.filter((t) => (!card || t.status === card) && passCols(t) && has(t.ticketNo, t.subject, t.tnr, t.raisedBy, t.raisedTo, t.description)).sort(byEta)
      : tab === "bookings" ? L.filter((b) => (!card || b.state === card) && passCols(b) && has(b.tnr, b.tour, b.customer, nameOf(b.empKey)))
        : fBase.filter((e) => (!card || e.stage === card) && passCols(e) && has(e.fitCode, e.name, e.destination));


  // ─── PDF download — ippo screen la theriyura list (tab / view / card / search / column filters) ───
  const downloadPdf = () => {
    if (!rows.length) { toast.error("Nothing to download for these filters"); return; }
    const who = ALL ? "All employees" : `${me?.name || ""}${me?.employeeId ? ` (${me.employeeId})` : ""}`;
    const period = from || to ? `${from ? fmtDate(from) : "Start"} – ${to ? fmtDate(to) : "Today"}` : "All time";
    const viewText = tab === "tickets"
      ? `Tickets · ${(ALL ? ALL_TICKET_VIEWS : TICKET_VIEWS).find((v) => v.key === view)?.label || ""}`.replace(/[🎫✏️]\s?/gu, "")
      : tab === "bookings" ? "Tour bookings"
        : `FIT enquiries${ALL ? "" : ` · ${FIT_VIEWS.find((v) => v.key === view)?.label || ""}`}`;
    const cardList = tab === "tickets" ? TICKET_CARDS : tab === "bookings" ? BOOKING_CARDS : FIT_CARDS;
    const fp = [];
    if (card) fp.push(`${tab === "fit" ? "Stage" : "Status"}: ${cardList.find((c) => c.key === card)?.label || card}`);
    if (q.trim()) fp.push(`Search: ${q.trim()}`);
    activeFields.forEach((f) => {
      if (f.kind === "date") return;
      if (f.kind === "range") { const a = cf[f.fromKey], b = cf[f.toKey]; if (a || b) fp.push(`${f.label}: ${a ? fmtDate(a) : "…"} – ${b ? fmtDate(b) : "…"}`); return; }
      const v = String(cf[f.key] || "").trim();
      if (!v) return;
      const shown = f.kind === "multi" ? v.split(",").map((x) => f.options?.find((o) => o.value === x.trim())?.label || x.trim()).join(", ") : v;
      fp.push(`${f.label}: ${shown}`);
    });
    if (cf.fromDate || cf.toDate) fp.push(`Date: ${cf.fromDate ? fmtDate(cf.fromDate) : "…"} – ${cf.toDate ? fmtDate(cf.toDate) : "…"}`);
    const count = tab === "tickets" ? tCount : tab === "bookings" ? bCount : fCount;
    const cards = cardList.map((c) => [c.label, count(c.key), cardColor(c.cls)]);
    const statusTxt = (k) => (STATUS_PILL[k] || [k])[0];
    let head, body, foot = "", money = [];
    const D = (html, cls = "") => `<span class="d ${cls}">${html}</span>`;

    if (tab === "tickets") {
      head = [["Ticket no", "10%"], ["Ticket / Description"], ["Raised by", "14%"], ["Raised to", "12%"], ["Raised on", "9%"], ["ETA", "10%"], ["Status", "12%"]];
      const etaPdf = (t) => { const e = etaOf(t); return e ? `${D(`📅 ${esc(e.date)} <span class="s">· ${esc(e.wd)}</span>`, "b")}${e.rel ? `<span class="pill" style="margin-top:3px;background:${e.c[0]};color:${e.c[1]}">${esc(e.rel)}</span>` : ""}` : `<span class="muted">—</span>`; };
      const prioPdf = (t) => { const [l, , bg, fg] = PRIO[prioOf(t)]; return `<span class="pill" style="margin-top:4px;background:${bg};color:${fg}">⚑ ${l.toUpperCase()}</span>`; };
      body = rows.map((t, i) => `<tr><td class="n">${i + 1}</td>
        <td><span class="chip">${esc(t.ticketNo || "—")}</span></td>
        <td>${D(esc(t.subject), "b")}${D(`${esc(t.queryType || "")}${t.tnr ? ` · TNR ${esc(t.tnr)}` : ""}`, "s")}${t.description?.trim() ? D(esc(t.description.trim()), "desc") : ""}</td>
        <td class="b">${esc(t.raisedBy || "—")}</td><td>${esc(t.raisedTo || "—")}</td><td>${esc(fmtDate(t.createdAt))}</td>
        <td>${etaPdf(t)}</td>
        <td>${pdfPill(t.status, statusTxt(t.status))}<br>${prioPdf(t)}</td></tr>`);
    } else if (tab === "bookings") {
      money = [
        // [label, amount, colour, keezha line] — page la irukkura adhe colour + sub line
        ["Advance received", inr(sum(CB, (b) => (countsMoney(b) && b.advance?.paid ? b.advance.amount : 0))), "#15803D", `${CB.filter((b) => countsMoney(b) && b.advance?.paid).length} bookings · Active + Completed`],
        ["Balance received", inr(sum(CB, (b) => (countsMoney(b) && b.balance?.paid ? b.balance.amount : 0))), "#15803D", `${CB.filter((b) => countsMoney(b) && b.balance?.paid).length} paid · ${CB.filter((b) => countsMoney(b) && !b.balance?.paid && !b.balance?.adjusted).length} pending`],
        ["GV cancellation", inr(sum(CB, (b) => b.gvCancellation)), "#C2410C"],
        ["IRCTC cancellation", inr(sum(CB, (b) => b.irctcCancellation)), "#1D4ED8"],
        ["Refund", inr(sum(CB, (b) => b.refund)), "#7E22CE"],
      ];
      const ml = (label, v) => `<span class="kv"><span class="s">${label}</span>${v?.adjusted ? `<span class="s">Adjusted in cancellation</span>` : `<b>${inr(v?.amount)}</b> <span class="${v?.paid ? "g" : "muted"}">${v?.paid ? "Paid" : "Pending"}</span>`}</span>`;
      const kv = (label, v) => `<span class="kv"><span class="s">${label}</span><b>${v ? inr(v) : "—"}</b></span>`;
      head = [["TNR", "9%"], ["Tour / Customer"], ...(ALL ? [["Booked by", "13%"]] : []), ["Pax", "8%"], ["Advance / Balance", "18%"], ["Cancellation", "14%"], ["Status", "14%"]];
      body = rows.map((b, i) => {
        const p = paxOf(b);
        return `<tr><td class="n">${i + 1}</td>
        <td>${D(esc(b.tnr || "—"), "tnr")}${D(esc(fmtDate(b.bookingDate)), "s")}</td>
        <td>${D(esc(b.tour), "b")}${D(esc(b.customer || "—"), "s")}</td>${ALL ? `<td class="b">${esc(nameOf(b.empKey))}</td>` : ""}
        <td>${D(p.a, "b")}${p.c ? D(`${p.c} cancelled`, "s amb") : ""}${p.r ? D(`${p.r} rejected`, "s rj") : ""}</td>
        <td>${ml("Adv", b.advance)}${ml("Bal", b.balance)}</td>
        <td>${b.gvCancellation || b.irctcCancellation || b.refund ? `${kv("GV", b.gvCancellation)}${kv("IRCTC", b.irctcCancellation)}${kv("Refund", b.refund)}` : `<span class="muted">—</span>`}</td>
        <td>${pdfPill(b.state, statusTxt(b.state))}${b.requestedTr > 0 ? D(`${b.requestedTr} cancel request`, "s or") : ""}</td></tr>`;
      });
      foot = `<tr><td></td><td colspan="${ALL ? 3 : 2}">Total · ${rows.length} bookings<span class="d s">${sum(rows, (b) => paxOf(b).a)} active pax · ${sum(rows, (b) => paxOf(b).c)} cancelled · ${sum(rows, (b) => paxOf(b).r)} rejected</span></td><td>${sum(rows, (b) => paxOf(b).a)}</td>
        <td><span class="kv"><span class="s">Adv paid</span><span class="g">${inr(sum(rows, (b) => (countsMoney(b) && b.advance?.paid ? b.advance.amount : 0)))}</span></span><span class="kv"><span class="s">Bal paid</span><span class="g">${inr(sum(rows, (b) => (countsMoney(b) && b.balance?.paid ? b.balance.amount : 0)))}</span></span></td>
        <td><span class="kv"><span class="s">GV</span>${inr(sum(rows, (b) => b.gvCancellation))}</span><span class="kv"><span class="s">IRCTC</span>${inr(sum(rows, (b) => b.irctcCancellation))}</span><span class="kv"><span class="s">Refund</span>${inr(sum(rows, (b) => b.refund))}</span></td><td></td></tr>`;
    } else {
      money = [
        ["Sales value (accepted)", inr(sum(CB.filter((e) => ["Accepted", "Closed"].includes(e.stage)), (e) => e.salesValue)), "#15803D"],
        ["Cancellation charge", inr(sum(CB, (e) => e.cancellationCharge)), "#BE123C", `${CB.filter((e) => e.cancellationCharge > 0).length} enquiries`],
        ...(CB.some((e) => "gvVinoth" in e) ? [
          ["Vinoth share (GVEMP008)", inr(sum(CB, (e) => e.gvVinoth)), "#4338CA", `${CB.filter((e) => e.gvVinoth > 0).length} enquiries`],
          ["Giridharan share (GVEMP009)", inr(sum(CB, (e) => e.gvGiridhar)), "#4338CA", `${CB.filter((e) => e.gvGiridhar > 0).length} enquiries`],
        ] : []),
      ];
      const fwdCol = !ALL && view === "fwdBy" ? ["Forwarded to", (e) => fwdNames(e.fwdOut)] : !ALL && view === "fwdTo" ? ["Forwarded by", (e) => fwdNames(e.fwdIn)] : null;
      head = [["Enquiry", "14%"], ["Customer", "14%"], ["Trip"], ...(fwdCol ? [[fwdCol[0], "11%"]] : []), ["Handled by now", "12%"], ["Value", "10%"], ["Stage", "18%"]];
      body = rows.map((e, i) => `<tr><td class="n">${i + 1}</td>
        <td><span class="chip">${esc(e.fitCode || "—")}</span>${D(esc(fmtDate(e.createdAt)), "s")}${D(`by <b class="b">${esc(raiserName(e))}</b>`, "s")}</td>
        <td>${D(esc(e.name || "—"), "b")}${D(esc([e.mobile, e.pax ? `${e.pax} pax` : ""].filter(Boolean).join(" · ")), "s")}</td>
        <td>${D(`<span class="dest">${esc(e.destination || "—")}</span>${duration(e) ? ` <span class="s">· ${esc(duration(e))}</span>` : ""}`)}${D(`✈️ ${esc(e.travelDate ? fmtDate(e.travelDate) : "No date")}${e.pickupDate ? ` · <span class="pk">🚌 ${esc(fmtDate(e.pickupDate))}</span>` : ""}`)}${e.zones?.length ? `<span class="d">${e.zones.map((z) => `<span class="zone">${esc(z)}</span>`).join("")}</span>` : ""}</td>
        ${fwdCol ? `<td class="b">${esc(fwdCol[1](e))}</td>` : ""}
        <td>${e.ownerKey ? `<span class="b">${esc(ownerName(e))}</span>` : `<span class="muted">${esc(ownerName(e))}</span>`}</td>
        <td>${e.salesValue || e.cancellationCharge ? `${e.salesValue > 0 ? D(inr(e.salesValue), "g") : ""}${e.cancellationCharge > 0 ? D(`−${inr(e.cancellationCharge)} <span class="s">cancel</span>`, "red") : ""}` : `<span class="muted">—</span>`}</td>
        <td>${pdfPill(e.stage, e.stage)}${e.lastBy ? D(`${esc(ACTION_LABEL[e.lastBy.action] || "Updated")} by <b class="b">${esc(e.lastBy.key ? nameOf(e.lastBy.key) : e.lastBy.name || "—")}</b> · ${esc(fmtDate(e.lastBy.at))}`, "s") : ""}</td></tr>`);
      foot = `<tr><td></td><td colspan="${fwdCol ? 5 : 4}">Total · ${rows.length} enquiries</td>
        <td>${D(inr(sum(rows.filter(isSale), (e) => e.salesValue)), "g")}${D(`−${inr(sum(rows, (e) => e.cancellationCharge))}`, "red")}</td><td></td></tr>`;
    }

    const html = buildPerfPdfHtml({ title, who, period, viewText, filterText: fp.join(" · "), cards, money, head, rows: body, foot });
    savePdf(html);
  };

  // Browser print — A4 landscape, page la theriyura adhe design
  const savePdf = (html) => {
    // Blob URL la open — about:blank illaama, Chrome oda print preview (orientation sariyaa) varum
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const w = window.open(url, "_blank");
    if (!w) { URL.revokeObjectURL(url); toast.error("Allow pop-ups for this site to download the PDF"); return; }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  // ─── Clear filters / Refresh ───
  const [refreshKey, setRefreshKey] = useState(0);
  const filtersOn = emp !== "*" || preset !== "all" || !!from || !!to || !!card || !!q.trim() || Object.values(cf).some((v) => String(v || "").trim());
  const clearFilters = () => {
    setEmp("*");
    setPreset("all");
    setRange(["", ""]);
    setCard("");
    setQ("");
    setCf({});
  };
  const refreshAll = () => {
    load();
    setRefreshKey((k) => k + 1); // Edit history um reload
  };

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
        {/* Clear filters + Refresh */}
        <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
          <button
            type="button"
            onClick={clearFilters}
            disabled={!filtersOn}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
            Clear filters
          </button>
          <button
            type="button"
            onClick={refreshAll}
            disabled={loading}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
          >
            <svg viewBox="0 0 24 24" className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36" /><polyline points="21 3 21 9 15 9" /></svg>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
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
          {((!ALL && (tab === "tickets" || tab === "fit")) || (ALL && tab === "tickets")) && (
            <div className="mb-3 flex flex-wrap gap-1 rounded-2xl bg-gray-100 p-1 sm:inline-flex">
              {(tab === "tickets" ? (ALL ? ALL_TICKET_VIEWS : TICKET_VIEWS) : FIT_VIEWS).map((v) => (
                <button key={v.key} type="button" onClick={() => setView(v.key)} className={pill(view === v.key)}>{v.label}</button>
              ))}
            </div>
          )}
          {!ALL && tab === "fit" && (
            <p className="-mt-1 mb-3 text-xs text-gray-500">{FIT_VIEWS.find((v) => v.key === view)?.hint}</p>
          )}

          {/* ── Edit history (oru employee) ── */}
          {tab === "tickets" && view === "Edits" ? (
            <EditHistoryPanel backendUrl={backendUrl} aToken={aToken} staffId={ALL ? "" : me?.staffId} all={ALL} from={from} to={to} refreshKey={refreshKey} />
          ) : loading || !list ? (
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
                    {CB.some((e) => "gvVinoth" in e) && (
                      <>
                        <Money label="Vinoth share (GVEMP008)" value={sum(CB, (e) => e.gvVinoth)} sub={`${CB.filter((e) => e.gvVinoth > 0).length} enquiries`} tone="text-indigo-700" />
                        <Money label="Giridharan share (GVEMP009)" value={sum(CB, (e) => e.gvGiridhar)} sub={`${CB.filter((e) => e.gvGiridhar > 0).length} enquiries`} tone="text-indigo-700" />
                      </>
                    )}
                  </div>
                </>
              )}

              {/* ── List ── */}
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-4 py-3">
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "tickets" ? "Search ticket no, subject, TNR, description" : tab === "bookings" ? "Search TNR, tour, customer" : "Search FIT code, name, place"} className={`w-full min-w-0 flex-1 sm:min-w-[14rem] ${inputCls}`} />
                  {(card || q || anyCol) && <button type="button" onClick={() => { setCard(""); setQ(""); setCf({}); }} className="text-xs font-semibold text-red-600 hover:underline">Clear all</button>}
                  <span className="text-xs text-gray-500">Showing {rows.length}</span>
                  <button
                    type="button"
                    onClick={downloadPdf}
                    disabled={!rows.length}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    Download PDF
                  </button>
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
                            <span className="flex flex-wrap items-center justify-end gap-1.5"><Pill s={t.status} /><PrioBadge t={t} /></span>
                          </div>
                          <p className="mt-1.5 font-semibold text-gray-900">{t.subject}</p>
                          <p className="text-xs text-gray-500">{t.queryType}{t.tnr ? ` · TNR ${t.tnr}` : ""}</p>
                          {t.description?.trim() && <p className="mt-1 line-clamp-3 whitespace-pre-line text-xs text-gray-700">{t.description.trim()}</p>}
                          <p className="mt-1 text-xs text-gray-600"><span className="font-semibold">{t.raisedBy || "—"}</span> → <span className="font-semibold">{t.raisedTo || "—"}</span> · {fmtDate(t.createdAt)}</p>
                          {etaOf(t) && <div className="mt-1.5 text-xs"><span className="mr-1 text-gray-500">ETA</span><EtaCell t={t} /></div>}
                        </li>
                      ))}
                    </ul>
                    {/* Desktop — table */}
                    <div className="hidden md:block">
                      <table className="w-full table-fixed text-left text-sm">
                        <thead className="bg-blue-50 text-xs text-gray-600"><tr>
                          {head("ticketNo", "w-32")}{head("ticket")}{head("raisedBy", "w-[16%]")}
                          {head("raisedTo", "w-[14%]")}{head("date", "w-32")}{head("eta", "w-32")}{head("status", "w-36")}
                        </tr></thead>
                        <tbody>
                          {rows.map((t) => (
                            <tr key={t._id} className="border-t border-gray-100 align-top">
                              <td className="px-4 py-2.5"><span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800">{t.ticketNo || "—"}</span></td>
                              <td className="px-4 py-2.5"><p className="truncate font-semibold text-gray-900">{t.subject}</p><p className="truncate text-xs text-gray-500">{t.queryType}{t.tnr ? ` · TNR ${t.tnr}` : ""}</p>{t.description?.trim() && <p className="mt-1 line-clamp-2 whitespace-pre-line break-words text-xs text-gray-700" title={t.description.trim()}>{t.description.trim()}</p>}</td>
                              <td className="truncate px-3 py-2.5 text-xs font-semibold" title={t.raisedBy}>{t.raisedBy || "—"}</td>
                              <td className="truncate px-3 py-2.5 text-xs" title={t.raisedTo}>{t.raisedTo || "—"}</td>
                              <td className="px-4 py-2.5 text-xs">{fmtDate(t.createdAt)}</td>
                              <td className="px-3 py-2.5"><EtaCell t={t} /></td>
                              <td className="px-4 py-2.5"><Pill s={t.status} /><div className="mt-1.5"><PrioBadge t={t} /></div></td>
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
                      <span>Total · {rows.length} enquiries</span><span className="flex flex-wrap gap-x-4"><span className="text-green-700">Sales value {inr(sum(rows.filter(isSale), (e) => e.salesValue))}</span><span className="text-rose-700">Cancellation {inr(sum(rows, (e) => e.cancellationCharge))}</span></span>
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
