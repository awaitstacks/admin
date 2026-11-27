// ════════════════════════════════════════════════════════════════
//  CancellationAnalytics.jsx — Admin panel — approve aana cancellations
//    • Advance only paid / Fully paid — thaniya thaniya
//    • Endha tier la adhigama cancel aagudhu (Cancel rule tiers)
//    • Date / year / month / gender / tier / tour (Select all) filter + search
//    • Stats + charts + TNR list — expand pannaa booking la ellaa travellers um
//      (cancel aanavanga highlight)
//    • Download PDF (landscape, print box la "Landscape" select pannunga)
//  Amount = tourBooking pool (Tour Info / Sales Dashboard adhe numbers)
//  API: GET /api/touradmin/cancellation-analytics
// ════════════════════════════════════════════════════════════════
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  RefreshCw, Loader2, Search, X, Download, ChevronDown, MapPin, TrainFront,
  Ticket, Users, Layers, Wallet, IndianRupee, User, Phone, Mail, MessageSquare, Copy, Check, Upload, BadgeCheck, Clock,
} from "lucide-react";
import { TourAdminContext } from "../../context/TourAdminContext"; // ⚙️ path check pannunga

// ─── Dates / format ───
const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PRESETS = [
  { key: "all", label: "All time", range: () => ["", ""] },
  { key: "month", label: "This month", range: () => { const t = new Date(); return [ymd(new Date(t.getFullYear(), t.getMonth(), 1)), ymd(t)]; } },
  { key: "last", label: "Last month", range: () => { const t = new Date(); return [ymd(new Date(t.getFullYear(), t.getMonth() - 1, 1)), ymd(new Date(t.getFullYear(), t.getMonth(), 0))]; } },
  { key: "year", label: "This year", range: () => { const t = new Date(); return [ymd(new Date(t.getFullYear(), 0, 1)), ymd(t)]; } },
  { key: "custom", label: "Custom", range: null },
];
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");
const inr = (n) => `₹${(Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const dayOf = (d) => (d ? ymd(new Date(d)) : "");

const CATS = [
  { key: "advance", label: "Advance only paid", hint: "Advance paid, balance not paid" },
  { key: "full", label: "Fully paid", hint: "Advance + balance paid" },
  { key: "all", label: "Both", hint: "Advance only + Fully paid together" },
];
const GENDERS = ["Male", "Female", "Other"];
// "male" / "MALE" / "M" → "Male" (data la case maaralaam — filter correct ah work aaganum)
const normG = (g) => {
  const v = String(g || "").trim().toLowerCase();
  if (v === "male" || v === "m") return "Male";
  if (v === "female" || v === "f") return "Female";
  return "Other";
};
const PALETTE = ["#F08A24", "#1E6FD9", "#D97706", "#7C3AED", "#DB2777", "#0891B2", "#65A30D", "#94A3B8"];
const isSpecialTier = (t) => t?.key === "trip" || t?.key === "norecord";

// Traveller status (expand la)
const TSTATUS = {
  this: ["Cancelled", "bg-[#FDECEC] text-[#B42318] ring-[#F5C2C0]"],
  cancelled: ["Cancelled (other request)", "bg-[#FFF1F0] text-[#C2410C] ring-[#FED7AA]"],
  trip: ["Trip cancelled", "bg-[#FEF3C7] text-[#92400E] ring-[#FDE68A]"],
  requested: ["Cancel requested", "bg-[#EDE9FE] text-[#5B21B6] ring-[#DDD6FE]"],
  active: ["Travelling", "bg-[#E3F4F1] text-[#12857A] ring-[#B5E2DA]"],
};

// ─── Booked by (login wise) — Tour Bookings page adhe maadhiri ───
const BY_TAG = {
  staff: ["Staff", "bg-indigo-50 text-indigo-700 ring-indigo-200"],
  user: ["Customer", "bg-emerald-50 text-emerald-700 ring-emerald-200"],
  touradmin: ["Tour admin", "bg-sky-50 text-sky-700 ring-sky-200"],
  admin: ["Admin", "bg-slate-100 text-slate-600 ring-slate-200"],
};
const byName = (by) => {
  if (!by) return "";
  if (by.type === "admin" && by.unknown) return "Not recorded";
  if (by.type === "staff" || by.type === "user") return by.name || (by.type === "user" ? "Customer" : "Staff");
  return by.name && !["Admin", "Tour admin"].includes(by.name) ? by.name : "";
};
const byLabel = (by) => {
  if (!by) return "";
  const n = byName(by);
  const tag = (BY_TAG[by.type] || BY_TAG.admin)[0];
  const extra = [by.employeeId, by.role].filter(Boolean).join(" · ");
  return [n, extra ? `(${extra})` : "", n === tag ? "" : tag].filter(Boolean).join(" ");
};
const BookedByLine = ({ by }) => {
  if (!by) return null;
  const [text, cls] = BY_TAG[by.type] || BY_TAG.admin;
  const n = byName(by);
  return (
    <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px]" title={`Uploaded by ${byLabel(by)}`}>
      <span className="shrink-0 text-[#9AA0B8]">by</span>
      {n && <span className={`min-w-0 truncate font-semibold ${by.unknown ? "italic text-[#9AA0B8]" : "text-[#1D2340]"}`}>{n}</span>}
      <span className={`shrink-0 rounded px-1.5 text-[9.5px] font-bold uppercase tracking-wide ring-1 ring-inset ${cls}`}>{text}</span>
    </span>
  );
};
// TNR + copy button
const CopyTnr = ({ tnr, className = "" }) => {
  const [done, setDone] = useState(false);
  const copy = async (e) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(tnr);
      else {
        const t = document.createElement("textarea");
        t.value = tnr; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove();
      }
      setDone(true);
      toast.success(`TNR ${tnr} copied`);
      setTimeout(() => setDone(false), 1500);
    } catch { toast.error("Could not copy the TNR"); }
  };
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="font-mono font-bold text-[#2F5BD3]">{tnr}</span>
      <button type="button" onClick={copy} aria-label={`Copy TNR ${tnr}`} title="Copy TNR"
        className={`rounded-md p-1 transition ${done ? "bg-emerald-50 text-emerald-600" : "text-[#9AA0B8] hover:bg-[#EEF1FB] hover:text-[#2F5BD3]"}`}>
        {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </span>
  );
};

// Refund = tour booking balance — booking la balance field la refund amount dhaan irukku
const refundIsBalance = (r) => Number(r?.amounts?.refund) > 0 && Math.abs(Number(r.amounts.refund) - Number(r.amounts.updatedBalance || 0)) < 0.5;

// TNR wise row — ovvoru traveller kum avanga tier (pazhaya backend la row tier)
const tierOfT = (r, t) => t?.tier || r.tier;
const tiersOf = (r) => (r.tiers && r.tiers.length ? r.tiers : [r.tier]).filter(Boolean);
const isTripT = (r, t) => tierOfT(r, t)?.key === "trip";
const TierPills = ({ r }) => (
  <span className="flex flex-wrap gap-1">{tiersOf(r).map((t) => <TierPill key={t.key} tier={t} />)}</span>
);

// Ovvoru TNR block kum thani soft accent colour (ore colour bore adikkaama)
const ACCENTS = [
  ["#4F46E5", "#EEF2FF"], ["#0D9488", "#E6F6F4"], ["#DB2777", "#FDECF4"], ["#D97706", "#FEF5E7"],
  ["#0284C7", "#E8F4FB"], ["#7C3AED", "#F3EEFE"], ["#059669", "#E8F7F1"], ["#EA580C", "#FEF0E7"],
];
// Ore TNR la ethana-vadhu cancel — "1st of 2"
const ORD = (n) => ["1st", "2nd", "3rd"][n - 1] || `${n}th`;
const SeqBadge = ({ r }) => (r.seqTotal > 1 ? (
  <span className="mt-1 inline-flex whitespace-nowrap rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10.5px] font-bold text-[#4338CA]" title={`This TNR has ${r.seqTotal} cancellations`}>
    {ORD(r.seq)} cancel of {r.seqTotal}
  </span>
) : null);

// Amount TNR ku ore set (tour booking) — total la oru thadava mattum
const uniqTnr = (arr) => { const m = new Map(); arr.forEach((r) => { if (!m.has(r.tnr)) m.set(r.tnr, r); }); return [...m.values()]; };
// Stats / total ellaam TOUR BOOKING actual amount (TNR ku oru thadava) — Tour Info / Sales adhe.
// Cancellation record la save aana amount traveller row la paakka mattum.
const groupAmount = (kids) => {
  const k0 = kids[0];
  return { gv: Number(k0.amounts.gv || 0), irctc: Number(k0.amounts.irctc || 0), total: Number(k0.amounts.total || 0), partial: false };
};
const netPaidOf = (r) => Number(r.amounts?.netPaid ?? 0);

// Tier filter value: "key" (rendu category um) illa "advance|key" / "full|key" (Both tab la)
const tierHit = (r, t, sel) => sel.includes(t?.key) || sel.includes(`${r.category}|${t?.key}`);
const selHasKey = (sel, key) => sel.some((v) => v === key || v.endsWith(`|${key}`));

const TierPill = ({ tier }) => isSpecialTier(tier) ? (
  <span className="inline-flex whitespace-nowrap rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-semibold text-[#475569] ring-1 ring-inset ring-[#E2E8F0]">{tier.label}</span>
) : (
  <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full py-0.5 pl-1 pr-2 text-[11px] font-bold"
    style={{ background: `${TIER_GRAD(tier?.percentage)[0]}14`, color: TIER_GRAD(tier?.percentage)[0], boxShadow: `inset 0 0 0 1px ${TIER_GRAD(tier?.percentage)[0]}33` }}>
    <span className="rounded-full px-1.5 text-[10px] text-white" style={{ background: `linear-gradient(135deg, ${TIER_GRAD(tier?.percentage)[0]}, ${TIER_GRAD(tier?.percentage)[1]})` }}>{tier?.percentage ?? 100}%</span>
    {tier?.label || "—"}
  </span>
);

// ─── Palette — railway signage indigo + saffron + signal red ───
const C = {
  ink: "#1D2340", sub: "#5B6280", faint: "#9AA0B8", line: "#DDE0EC", paper: "#F5F6FA",
  saffron: "#F08A24", red: "#D23B3B", teal: "#12857A", blue: "#2F5BD3",
};
// Days before tour — dhooram adhigam na light, departure kitta varra appo dark red
const heat = (pct) => {
  const p = Math.max(0, Math.min(100, Number(pct) || 0)) / 100;
  const mix = (a, b) => Math.round(a + (b - a) * p);
  return `rgb(${mix(252, 196)}, ${mix(214, 40)}, ${mix(196, 48)})`;
};

const Panel = ({ title, note, right, children, className = "" }) => (
  <section className={`min-w-0 rounded-xl border border-[#E3E6F0] bg-white p-4 sm:p-5 ${className}`}>
    {(title || right) && (
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-[15px] font-semibold text-[#1D2340]">{title}</h3>
          {note && <p className="mt-0.5 text-xs text-[#9AA0B8]">{note}</p>}
        </div>
        {right}
      </div>
    )}
    {children}
  </section>
);

// Multi-select dropdown — checkbox list, Select all / Clear
const MultiSelect = ({ label, allLabel, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const k = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [open]);
  const sel = new Set(value);
  const toggle = (v) => onChange(sel.has(v) ? value.filter((x) => x !== v) : [...value, v]);
  const allOn = options.length > 0 && options.every((o) => sel.has(o.value));
  const names = options.filter((o) => sel.has(o.value)).map((o) => o.short || o.label);
  const text = !value.length ? allLabel : names.length <= 2 ? names.join(", ") : `${names.length} ${label.toLowerCase()}s`;
  return (
    <div ref={ref} className="relative min-w-0">
      <button type="button" aria-label={label} aria-expanded={open} onClick={() => setOpen((v) => !v)}
        className={`flex h-10 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3 text-left text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#2F5BD3]/20 ${value.length ? "border-[#2F5BD3] text-[#2F5BD3]" : "border-[#DDE0EC] text-[#1D2340]"}`}>
        <span className="truncate">{text}</span>
        <span className="flex shrink-0 items-center gap-1">
          {value.length > 0 && <span className="rounded-full bg-[#2F5BD3] px-1.5 text-[10.5px] font-bold leading-[18px] text-white">{value.length}</span>}
          <ChevronDown className={`h-4 w-4 text-[#9AA0B8] transition ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && (
        <div className="absolute left-0 z-30 mt-1.5 w-full min-w-[13rem] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-[#DDE0EC]">
          <div className="flex items-center justify-between border-b border-[#EEF0F6] px-3 py-2 text-xs font-semibold">
            <button type="button" onClick={() => onChange(allOn ? [] : options.map((o) => o.value))} className="text-[#B45F06] hover:underline">
              {allOn ? "Unselect all" : `Select all ${options.length}`}
            </button>
            {value.length > 0 && <button type="button" onClick={() => onChange([])} className="text-[#D23B3B] hover:underline">Clear</button>}
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {options.map((o, oi) => {
              const on = sel.has(o.value);
              const head = o.group && o.group !== options[oi - 1]?.group;
              return (
                <React.Fragment key={o.value}>
                {head && <p className="mt-1 border-t border-[#EEF0F4] px-3 pb-1 pt-2 text-[10.5px] font-bold text-[#B45F06] first:mt-0 first:border-t-0">{o.group}</p>}
                <button type="button" role="menuitemcheckbox" aria-checked={on} onClick={() => toggle(o.value)}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-[#F5F6FA] ${on ? "font-semibold text-[#1D2340]" : "text-[#5B6280]"}`}>
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${on ? "border-[#2F5BD3] bg-[#2F5BD3]" : "border-[#C5C9DA] bg-white"}`}>
                    {on && <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M2.5 6.2l2.3 2.3 4.7-5" /></svg>}
                  </span>
                  <span className="truncate">{o.label}</span>
                </button>
                </React.Fragment>
              );
            })}
            {!options.length && <p className="px-3 py-4 text-center text-xs text-[#9AA0B8]">Nothing to pick yet</p>}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══ Charts — Website Traffic page maadhiri (gradient, value badge, hover) ═══
const useGid = (p) => useState(() => `${p}${Math.random().toString(36).slice(2, 8)}`)[0];
const Empty = ({ text = "No cancellations for these filters" }) => <p className="py-10 text-center text-xs text-[#9AA0B8]">{text}</p>;
// Card width ku etha SVG width (mobile / tab / desktop)
const useBoxW = (init = 640) => {
  const ref = useRef(null);
  const [w, setW] = useState(init);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const set = () => setW(Math.max(260, Math.round(el.clientWidth)));
    set();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(set) : null;
    ro?.observe(el);
    window.addEventListener("resize", set);
    return () => { ro?.disconnect(); window.removeEventListener("resize", set); };
  }, []);
  return [ref, w];
};
// Tier colour — deduction % adhigam aaga aaga green → amber → red
const TIER_GRAD = (pct, special) => {
  if (special) return ["#64748B", "#CBD5E1"];
  const p = Number(pct) || 0;
  if (p <= 10) return ["#059669", "#6EE7B7"];
  if (p <= 25) return ["#0284C7", "#7DD3FC"];
  if (p <= 50) return ["#D97706", "#FCD34D"];
  if (p < 100) return ["#EA580C", "#FDBA74"];
  return ["#E11D48", "#FDA4AF"];
};

// Stat card
const StatCard = ({ icon: Icon, label, value, sub, grad }) => (
  <div className="relative min-w-0 overflow-hidden rounded-xl border border-[#E3E6F0] bg-white px-4 py-3">
    <span className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${grad[0]}, ${grad[1]})` }} />
    <div className="flex items-center gap-2 text-[12px] text-[#5B6280]">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="truncate">{label}</span>
    </div>
    <p className="mt-2 truncate text-2xl font-bold tabular-nums" style={{ color: grad[0] }} title={String(value)}>{value}</p>
    {sub && <p className="truncate text-[11px] text-[#9AA0B8]" title={sub}>{sub}</p>}
  </div>
);

// Tier-wise vertical bars — click pannaa andha tier filter (multi)
const TierChart = ({ tiers, topKey, active, onPick }) => {
  const gid = useGid("tier");
  const [hover, setHover] = useState(null);
  const [boxRef, W] = useBoxW();
  const data = [...tiers].sort((a, b) => (isSpecialTier(a) - isSpecialTier(b)) || ((b.fromDays ?? 0) - (a.fromDays ?? 0)));
  if (!data.some((t) => t.trav)) return <div ref={boxRef}><Empty /></div>;
  const narrow = W < 560 || (W - 40) / Math.max(data.length, 1) < 96; // neraya tier na label saanju
  const H = 330, P = { l: narrow ? 52 : 30, r: 8, t: 40, b: narrow ? 58 : 46 };
  const max = Math.max(4, ...data.map((d) => d.trav));
  const nice = Math.ceil(max / 4) * 4;
  const ticks = [0, 1, 2, 3, 4].map((k) => (nice / 4) * k);
  const slot = (W - P.l - P.r) / data.length;
  const bw = Math.min(58, slot * 0.58);
  const y = (v) => H - P.b - (v / nice) * (H - P.t - P.b);
  const total = data.reduce((a, d) => a + d.trav, 0);
  return (
    <div ref={boxRef} className="relative w-full overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block" role="img" aria-label="Travellers cancelled per tier" onMouseLeave={() => setHover(null)}>
        <defs>
          {data.map((d, i) => {
            const [c1, c2] = TIER_GRAD(d.percentage, isSpecialTier(d));
            return <linearGradient key={d.key} id={`${gid}-${i}`} x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></linearGradient>;
          })}
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="#EEF0F4" strokeDasharray={t ? "4 4" : ""} />
            <text x={P.l - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#9CA3AF">{t}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const [c1] = TIER_GRAD(d.percentage, isSpecialTier(d));
          const x = P.l + slot * i + (slot - bw) / 2;
          const top = y(d.trav);
          const sel = active.includes(d.key);
          const on = (hover === null || hover === i) && (!active.length || sel);
          const isTop = d.key === topKey && d.trav > 0;
          const cx = x + bw / 2;
          return (
            <g key={d.key} onMouseEnter={() => setHover(i)} onClick={() => onPick(d.key)} style={{ cursor: "pointer" }}>
              <title>{`${d.label}: ${d.trav} travellers, ${d.tnr} TNRs`}</title>
              <rect x={P.l + slot * i} y={P.t - 26} width={slot} height={H - P.t - P.b + 26} fill={sel ? `${c1}12` : "transparent"} rx="10" />
              <rect x={x} y={P.t} width={bw} height={H - P.b - P.t} rx="10" fill={c1} opacity="0.07" />
              {d.trav > 0 && <rect x={x} y={top} width={bw} height={H - P.b - top} rx="10" fill={`url(#${gid}-${i})`} opacity={on ? 1 : 0.35} />}
              {d.trav > 0 && (
                <>
                  <rect x={cx - 17} y={top - 24} width="34" height="18" rx="9" fill={c1} opacity={on ? 1 : 0.5} />
                  <text x={cx} y={top - 11} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">{d.trav}</text>
                </>
              )}
              {isTop && <text x={cx} y={top - 30} textAnchor="middle" fontSize="13">🔥</text>}
              {narrow ? (
                <text transform={`translate(${cx + 4} ${H - P.b + 12}) rotate(-35)`} textAnchor="end" fontSize="10" fontWeight={sel ? "700" : "600"} fill="#374151">{d.label}</text>
              ) : (
                <>
                  <text x={cx} y={H - P.b + 16} textAnchor="middle" fontSize="11.5" fontWeight={sel ? "800" : "600"} fill={sel ? c1 : "#374151"}>{d.label}</text>
                  <text x={cx} y={H - P.b + 30} textAnchor="middle" fontSize="9.5" fill="#9CA3AF">{isSpecialTier(d) ? `${d.tnr} TNRs` : `${d.percentage}% · ${d.tnr} TNRs`}</text>
                </>
              )}
            </g>
          );
        })}
      </svg>
      {hover !== null && data[hover] && (
        <div className="pointer-events-none absolute right-2 top-0 rounded-lg px-3 py-1.5 text-[11px] text-white shadow-lg" style={{ background: TIER_GRAD(data[hover].percentage, isSpecialTier(data[hover]))[0] }}>
          <b>{data[hover].label}</b>{isSpecialTier(data[hover]) ? "" : ` · ${data[hover].percentage}% deduction`} · {data[hover].trav} travellers ({String(+((data[hover].trav / (total || 1)) * 100).toFixed(1))}%) · {data[hover].tnr} TNRs
        </div>
      )}
    </div>
  );
};

// Month-wise — TNRs + travellers side by side bars, avg line
const MonthChart = ({ data }) => {
  const gid = useGid("mon");
  const [hover, setHover] = useState(null);
  const [boxRef, W] = useBoxW();
  if (!data.length) return <div ref={boxRef}><Empty /></div>;
  const H = 240, P = { l: 30, r: 10, t: 26, b: 30 };
  const max = Math.max(4, ...data.map((d) => d.trav));
  const nice = Math.ceil(max / 4) * 4;
  const ticks = [0, 1, 2, 3, 4].map((k) => (nice / 4) * k);
  const slot = (W - P.l - P.r) / data.length;
  const bw = Math.max(3, Math.min(22, (slot - 8) / 2));
  const y = (v) => H - P.b - (v / nice) * (H - P.t - P.b);
  const showVals = slot >= 34;
  const labelEvery = Math.max(1, Math.ceil(52 / slot));
  const avg = data.reduce((a, d) => a + d.trav, 0) / data.length;
  const best = data.reduce((a, d) => (d.trav > a.trav ? d : a), data[0]);
  const h = hover !== null ? data[hover] : null;
  return (
    <div className="relative">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px]">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] px-2.5 py-1 font-semibold text-[#4338CA]"><span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-[#6366F1] to-[#A78BFA]" /> TNRs</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF1F2] px-2.5 py-1 font-semibold text-[#BE123C]"><span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-[#E11D48] to-[#FB7185]" /> Travellers</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#94A3B8] px-2.5 py-1 font-semibold text-[#334155]">Avg / month: <span className="text-[#BE123C]">{String(+avg.toFixed(1))} travellers</span></span>
        {best.trav > 0 && <span className="ml-auto text-[#6B7280]">Peak: <b className="text-[#1F2937]">{best.label}</b> ({best.trav} travellers)</span>}
      </div>
      <div ref={boxRef} className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block" role="img" aria-label="Cancellations per month" onMouseLeave={() => setHover(null)}>
          <defs>
            <linearGradient id={`${gid}-t`} x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#6366F1" /><stop offset="100%" stopColor="#A78BFA" /></linearGradient>
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
            return (
              <g key={d.key} onMouseEnter={() => setHover(i)} style={{ cursor: "pointer" }}>
                {hover === i && <rect x={P.l + slot * i + 1} y={P.t - 18} width={slot - 2} height={H - P.t - P.b + 18} rx="6" fill="#F5F3FF" />}
                <rect x={P.l + slot * i} y={P.t - 18} width={slot} height={H - P.t - P.b + 18} fill="transparent" />
                {d.tnr > 0 && <rect x={cx - bw - 1} y={y(d.tnr)} width={bw} height={H - P.b - y(d.tnr)} rx={Math.min(5, bw / 2)} fill={`url(#${gid}-t)`} opacity={on ? 1 : 0.4} />}
                {d.trav > 0 && <rect x={cx + 1} y={y(d.trav)} width={bw} height={H - P.b - y(d.trav)} rx={Math.min(5, bw / 2)} fill={`url(#${gid}-p)`} opacity={on ? 1 : 0.4} />}
                {showVals && d.tnr > 0 && <text x={cx - bw / 2 - 1} y={y(d.tnr) - 5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#4338CA">{d.tnr}</text>}
                {showVals && d.trav > 0 && <text x={cx + bw / 2 + 1} y={y(d.trav) - 5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#BE123C">{d.trav}</text>}
                {(i % labelEvery === 0 || i === data.length - 1) && <text x={cx} y={H - 9} textAnchor="middle" fontSize="10" fill="#6B7280">{d.label}</text>}
              </g>
            );
          })}
          {avg > 0 && (
            <g pointerEvents="none">
              <line x1={P.l} x2={W - P.r} y1={y(avg)} y2={y(avg)} stroke="#BE123C" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.8" />
              <rect x={P.l + 2} y={y(avg) - 17} width="64" height="15" rx="7.5" fill="#BE123C" />
              <text x={P.l + 34} y={y(avg) - 6.5} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fff">avg {String(+avg.toFixed(1))}</text>
            </g>
          )}
        </svg>
      </div>
      {h && (
        <div className={`pointer-events-none absolute top-10 ${hover > data.length / 2 ? "left-10" : "right-2"}`}>
          <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] shadow-lg">
            <b className="block text-[12px] text-[#1F2937]">{h.label}</b>
            <span className="text-[#4338CA]">● {h.tnr} TNRs</span><br />
            <span className="text-[#BE123C]">● {h.trav} travellers</span><br />
            <span className="text-[#6B7280]">{inr(h.amount)} cancellation</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Pie (gender / amount split) — gradient slices, naduvula total
const PieChart = ({ parts, unit, icon }) => {
  const gid = useGid("pie");
  const [hover, setHover] = useState(null);
  const shown = parts.filter((p) => p.value > 0);
  const total = shown.reduce((a, p) => a + p.value, 0);
  if (!total) return <Empty />;
  const cx = 80, cy = 80, R = 70;
  const pt = (a, r = R) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  const pct = (v) => String(+((v / total) * 100).toFixed(1));
  let start = 0;
  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="-22 -18 204 196" className="h-60 w-64 shrink-0 overflow-visible drop-shadow-[0_6px_14px_rgba(99,102,241,0.22)]" role="img" aria-label={`Split by ${unit}`} onMouseLeave={() => setHover(null)}>
        <defs>
          {shown.map((p, i) => (
            <linearGradient key={p.key} id={`${gid}-${i}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={p.grad[0]} /><stop offset="100%" stopColor={p.grad[1]} /></linearGradient>
          ))}
        </defs>
        {shown.map((p, i) => {
          const ang = (p.value / total) * Math.PI * 2;
          const fill = `url(#${gid}-${i})`;
          const mid = start + ang / 2;
          const push = hover === i && shown.length > 1 ? 5 : 0;
          let el;
          if (ang >= Math.PI * 2 - 1e-6) el = <circle cx={cx} cy={cy} r={R} fill={fill} />;
          else {
            const [x1, y1] = pt(start), [x2, y2] = pt(start + ang);
            el = <path d={`M${cx},${cy} L${x1},${y1} A${R},${R} 0 ${ang > Math.PI ? 1 : 0} 1 ${x2},${y2} Z`} fill={fill} stroke="#fff" strokeWidth="2" />;
          }
          const [lx, ly] = pt(mid, R * 0.8);
          const g = (
            <g key={p.key} transform={`translate(${push * Math.sin(mid)} ${-push * Math.cos(mid)})`} onMouseEnter={() => setHover(i)} style={{ cursor: "pointer", transition: "transform .15s" }}>
              <title>{`${p.key}: ${p.fmt ? p.fmt(p.value) : p.value} (${pct(p.value)}%)`}</title>
              {el}
              {shown.length > 1 && (ang > 0.62
                ? <text x={lx} y={ly + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">{pct(p.value)}%</text>
                : (() => { const [ox, oy] = pt(mid, R + 13); return <text x={ox} y={oy + 3.5} textAnchor={Math.sin(mid) >= 0 ? "start" : "end"} fontSize="10" fontWeight="800" fill={p.grad[0]}>{pct(p.value)}%</text>; })())}
            </g>
          );
          start += ang;
          return g;
        })}
        <circle cx={cx} cy={cy} r="44" fill="#fff" opacity="0.97" />
        <text x={cx} y={cy + 2} textAnchor="middle" fontSize={String(shown[0].fmt ? shown[0].fmt(total) : total).length > 8 ? 13 : String(shown[0].fmt ? shown[0].fmt(total) : total).length > 5 ? 15 : 20} fontWeight="800" fill="#1E1B4B">{shown[0].fmt ? shown[0].fmt(total) : total}</text>
        <text x={cx} y={cy + 17} textAnchor="middle" fontSize="10" fill="#6B7280">{unit}</text>
      </svg>
      <ul className="grid w-full grid-cols-1 gap-2">
        {parts.map((p) => {
          const i = shown.indexOf(p);
          const I = icon;
          return (
            <li key={p.key} onMouseEnter={() => setHover(i < 0 ? null : i)} onMouseLeave={() => setHover(null)}
              className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-[12px] transition ${hover === i && i >= 0 ? "border-transparent shadow-md" : "border-[#EEF0F4]"}`}
              style={{ background: hover === i && i >= 0 ? `linear-gradient(90deg, ${p.grad[0]}18, ${p.grad[1]}10)` : "#FAFAFC" }}>
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: `linear-gradient(135deg, ${p.grad[0]}, ${p.grad[1]})` }}>
                  {I ? <I className="h-4 w-4" /> : null}
                </span>
                <span className="truncate font-semibold text-[#1B2B26]">{p.key}</span>
              </span>
              <span className="shrink-0 text-right tabular-nums">
                <span className="block text-[14px] font-bold" style={{ color: p.grad[0] }}>{pct(p.value)}%</span>
                <span className="block text-[10px] text-[#8FA39B]">{p.fmt ? p.fmt(p.value) : `${p.value} ${unit}`}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// Top tours — rank badge + gradient bar (ovvoru row um thani colour)
const TourBars = ({ rows }) => {
  const [openT, setOpenT] = useState(null);
  if (!rows.length) return <Empty />;
  const max = Math.max(1, ...rows.map((r) => r.trav));
  const COLS = [["#E11D48", "#FDA4AF"], ["#EA580C", "#FDBA74"], ["#D97706", "#FCD34D"], ["#7C3AED", "#C4B5FD"], ["#0284C7", "#7DD3FC"], ["#0891B2", "#67E8F9"], ["#059669", "#6EE7B7"], ["#C026D3", "#F0ABFC"]];
  return (
    <ul className="space-y-1.5">
      {rows.map((r, i) => {
        const [c1, c2] = COLS[i % COLS.length];
        const open = openT === r.name;
        return (
          <li key={r.name} className="rounded-xl transition" style={{ background: open ? `${c1}0D` : undefined }}>
            <div role="button" tabIndex={0} aria-expanded={open} onClick={() => setOpenT(open ? null : r.name)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenT(open ? null : r.name); } }}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-2 outline-none hover:bg-[#F8F9FC] focus-visible:ring-2 focus-visible:ring-[#A5B4FC]"
              title={open ? "Click to close" : "Click to see the TNRs"}>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
                  <span className="truncate font-semibold text-[#1F2937]">{r.name}</span>
                  <span className="shrink-0 font-bold tabular-nums" style={{ color: c1 }}>{r.trav} <span className="font-normal text-[#9CA3AF]">travellers · {r.tnr} TNR{r.tnr === 1 ? "" : "s"} · {inr(r.amount)}</span></span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full" style={{ background: `${c1}14` }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.max(4, (r.trav / max) * 100)}%`, background: `linear-gradient(90deg, ${c1}, ${c2})` }} />
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} style={{ color: c1 }} />
            </div>
            {open && (
              <div className="px-2 pb-2.5 pl-10">
                <div className="overflow-hidden rounded-lg bg-white ring-1 ring-inset ring-[#EEF0F4]">
                  <div className="hidden grid-cols-[110px_minmax(0,0.9fr)_minmax(0,1.6fr)_100px] gap-3 px-3 py-1.5 text-[10.5px] font-semibold md:grid" style={{ background: `${c1}12`, color: c1 }}>
                    <span>TNR</span><span>Booking head</span><span>Cancelled travellers</span><span className="text-right">Total cancel</span>
                  </div>
                  {(r.groups || []).map((g) => (
                    <div key={g.tnr} className="grid grid-cols-2 gap-x-3 gap-y-1 border-t border-[#F1F2F6] px-3 py-2 text-xs first:border-t-0 md:grid-cols-[110px_minmax(0,0.9fr)_minmax(0,1.6fr)_100px] md:items-center">
                      <span className="font-mono font-bold text-[#2F5BD3]">{g.tnr}</span>
                      <span className="truncate text-right text-[#1D2340] md:text-left">{g.head.contact?.name || "—"}</span>
                      <span className="col-span-2 flex flex-wrap gap-1 md:col-span-1">
                        {(g.trav || []).map(({ k, t }, j) => {
                          const tt = tierOfT(k, t);
                          const [tc] = TIER_GRAD(tt?.percentage, isSpecialTier(tt));
                          return <span key={j} className="rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold" style={{ background: `${tc}14`, color: tc }}>{String(t.name || "—").replace(/^(mr|mrs|ms|miss|master|dr)\.?\s+/i, "")} · {isSpecialTier(tt) ? tt?.label : `${tt?.percentage}%`}</span>;
                        })}
                      </span>
                      <span className="col-span-2 text-right font-bold tabular-nums text-[#BE123C] md:col-span-1">{inr(g.amt.inOther ? g.show.total : g.amt.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

// ─── PDF (print window — Employee Performance PDF maadhiri) ───
const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// ─── PDF charts (static SVG — print la apdiye varum) ───
let pdfGid = 0;
const pdfBars = (items, { W = 660, H = 250 } = {}) => {
  if (!items.length || !items.some((d) => d.value)) return '<p class="empty">No data</p>';
  const P = { l: 34, r: 8, t: 30, b: 44 };
  const max = Math.max(4, ...items.map((d) => d.value));
  const nice = Math.ceil(max / 4) * 4;
  const slot = (W - P.l - P.r) / items.length;
  const bw = Math.min(56, slot * 0.58);
  const y = (v) => H - P.b - (v / nice) * (H - P.t - P.b);
  const id = `pb${(pdfGid += 1)}`;
  const grid = [0, 1, 2, 3, 4].map((k) => { const v = (nice / 4) * k; return `<line x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}" stroke="#EEF0F4" ${k ? 'stroke-dasharray="4 4"' : ""}/><text x="${P.l - 6}" y="${y(v) + 4}" text-anchor="end" font-size="10" fill="#9CA3AF">${v}</text>`; }).join("");
  const defs = items.map((d, i) => `<linearGradient id="${id}${i}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${d.c1}"/><stop offset="1" stop-color="${d.c2}"/></linearGradient>`).join("");
  const bars = items.map((d, i) => {
    const x = P.l + slot * i + (slot - bw) / 2;
    const cx = x + bw / 2;
    const top = y(d.value);
    return `<rect x="${x}" y="${P.t}" width="${bw}" height="${H - P.b - P.t}" rx="9" fill="${d.c1}" opacity="0.08"/>`
      + (d.value ? `<rect x="${x}" y="${top}" width="${bw}" height="${H - P.b - top}" rx="9" fill="url(#${id}${i})"/><rect x="${cx - 16}" y="${top - 22}" width="32" height="17" rx="8.5" fill="${d.c1}"/><text x="${cx}" y="${top - 10}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#fff">${d.value}</text>` : "")
      + `<text x="${cx}" y="${H - P.b + 15}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#374151">${esc(d.label)}</text>`
      + (d.sub ? `<text x="${cx}" y="${H - P.b + 28}" text-anchor="middle" font-size="9" fill="#9CA3AF">${esc(d.sub)}</text>` : "");
  }).join("");
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}"><defs>${defs}</defs>${grid}${bars}</svg>`;
};
const pdfDonut = (parts, center, unit, size = 150) => {
  const shown = parts.filter((p) => p.value > 0);
  const total = shown.reduce((a, p) => a + p.value, 0);
  if (!total) return '<p class="empty">No data</p>';
  const id = `pd${(pdfGid += 1)}`;
  const cx = 80, cy = 80, R = 70;
  const pt = (a, r = R) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  let st = 0;
  const defs = shown.map((p, i) => `<linearGradient id="${id}${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.c1}"/><stop offset="1" stop-color="${p.c2}"/></linearGradient>`).join("");
  const slices = shown.map((p, i) => {
    const ang = (p.value / total) * Math.PI * 2;
    let el;
    if (ang >= Math.PI * 2 - 1e-6) el = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#${id}${i})"/>`;
    else { const [x1, y1] = pt(st); const [x2, y2] = pt(st + ang); el = `<path d="M${cx},${cy} L${x1},${y1} A${R},${R} 0 ${ang > Math.PI ? 1 : 0} 1 ${x2},${y2} Z" fill="url(#${id}${i})" stroke="#fff" stroke-width="2"/>`; }
    const [lx, ly] = pt(st + ang / 2, R * 0.8);
    st += ang;
    const mid2 = st - ang / 2;
    const [ox, oy] = pt(mid2, R + 13);
    return el + (shown.length > 1 ? (ang > 0.62 ? `<text x="${lx}" y="${ly + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">${+((p.value / total) * 100).toFixed(1)}%</text>` : `<text x="${ox}" y="${oy + 3.5}" text-anchor="${Math.sin(mid2) >= 0 ? "start" : "end"}" font-size="10" font-weight="800" fill="${p.c1}">${+((p.value / total) * 100).toFixed(1)}%</text>`) : "");
  }).join("");
  const legend = parts.map((p) => `<div class="lg"><i style="background:linear-gradient(135deg,${p.c1},${p.c2})"></i><span>${esc(p.label)}</span><b style="color:${p.c1}">${total ? +((p.value / total) * 100).toFixed(1) : 0}%</b><em>${esc(p.fmt ? p.fmt(p.value) : `${p.value} ${unit}`)}</em></div>`).join("");
  return `<div class="dn${size > 200 ? " big" : ""}"><svg viewBox="-22 -18 204 196" width="${Math.round(size * 1.25)}" height="${size}" style="overflow:visible"><defs>${defs}</defs>${slices}<circle cx="${cx}" cy="${cy}" r="44" fill="#fff"/><text x="${cx}" y="${cy - 1}" text-anchor="middle" font-size="${String(center).length > 6 ? 12 : 18}" font-weight="800" fill="#1E1B4B">${esc(center)}</text><text x="${cx}" y="${cy + 13}" text-anchor="middle" font-size="9" fill="#6B7280">${esc(unit)}</text></svg><div class="lgs">${legend}</div></div>`;
};
const pdfMonth = (data, { W = 660, H = 230 } = {}) => {
  if (!data.length) return '<p class="empty">No data</p>';
  const P = { l: 30, r: 8, t: 22, b: 26 };
  const max = Math.max(4, ...data.map((d) => d.trav));
  const nice = Math.ceil(max / 4) * 4;
  const slot = (W - P.l - P.r) / data.length;
  const bw = Math.max(3, Math.min(20, (slot - 8) / 2));
  const y = (v) => H - P.b - (v / nice) * (H - P.t - P.b);
  const every = Math.max(1, Math.ceil(50 / slot));
  const grid = [0, 1, 2, 3, 4].map((k) => { const v = (nice / 4) * k; return `<line x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}" stroke="#EEF0F4" ${k ? 'stroke-dasharray="4 4"' : ""}/><text x="${P.l - 6}" y="${y(v) + 4}" text-anchor="end" font-size="10" fill="#9CA3AF">${v}</text>`; }).join("");
  const bars = data.map((d, i) => {
    const cx = P.l + slot * i + slot / 2;
    return (d.tnr ? `<rect x="${cx - bw - 1}" y="${y(d.tnr)}" width="${bw}" height="${H - P.b - y(d.tnr)}" rx="4" fill="url(#pm1)"/>` : "")
      + (d.trav ? `<rect x="${cx + 1}" y="${y(d.trav)}" width="${bw}" height="${H - P.b - y(d.trav)}" rx="4" fill="url(#pm2)"/>` : "")
      + (slot >= 30 ? `${d.tnr ? `<text x="${cx - bw / 2 - 1}" y="${y(d.tnr) - 4}" text-anchor="middle" font-size="9.5" font-weight="700" fill="#4338CA">${d.tnr}</text>` : ""}${d.trav ? `<text x="${cx + bw / 2 + 1}" y="${y(d.trav) - 4}" text-anchor="middle" font-size="9.5" font-weight="700" fill="#BE123C">${d.trav}</text>` : ""}` : "")
      + (i % every === 0 || i === data.length - 1 ? `<text x="${cx}" y="${H - 8}" text-anchor="middle" font-size="10" fill="#6B7280">${esc(d.label)}</text>` : "");
  }).join("");
  return `<div class="keys"><span><i style="background:#6366F1"></i>TNRs</span><span><i style="background:#E11D48"></i>Travellers</span></div><svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}"><defs><linearGradient id="pm1" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#6366F1"/><stop offset="1" stop-color="#A78BFA"/></linearGradient><linearGradient id="pm2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#E11D48"/><stop offset="1" stop-color="#FB7185"/></linearGradient></defs>${grid}${bars}</svg>`;
};
const pdfTours = (rows) => {
  if (!rows.length) return '<p class="empty">No data</p>';
  const COLS = [["#E11D48", "#FDA4AF"], ["#EA580C", "#FDBA74"], ["#D97706", "#FCD34D"], ["#7C3AED", "#C4B5FD"], ["#0284C7", "#7DD3FC"], ["#0891B2", "#67E8F9"], ["#059669", "#6EE7B7"], ["#C026D3", "#F0ABFC"]];
  const max = Math.max(1, ...rows.map((r) => r.trav));
  return rows.map((r, i) => { const [c1, c2] = COLS[i % COLS.length]; return `<div class="tr"><span class="rk" style="background:linear-gradient(135deg,${c1},${c2})">${i + 1}</span><div class="tb"><div class="tt"><b>${esc(r.name)}</b><span style="color:${c1}">${r.trav} travellers · ${esc(inr(r.amount))}</span></div><div class="trk" style="background:${c1}18"><i style="width:${Math.max(4, (r.trav / max) * 100)}%;background:linear-gradient(90deg,${c1},${c2})"></i></div></div></div>`; }).join("");
};

const pdfRoad = (g) => {
  const steps = roadOf(g);
  return `<div class="rm"><p class="cap2">Booking road map</p><div class="rms">${steps.map((st, i) => {
    const [c1, c2] = ROAD[st.kind] || ROAD.book;
    const next = steps[i + 1] && i % 6 !== 5 ? (ROAD[steps[i + 1].kind] || ROAD.book)[0] : null;
    return `<div class="rs">${next ? `<span class="ln" style="background:linear-gradient(90deg,${c1}66,${next}66)"></span>` : ""}<span class="dt" style="background:linear-gradient(135deg,${c1},${c2})"></span><b style="color:${c1}">${esc(st.title)}</b><span>${st.date ? esc(fmtDate(st.date)) : st.kind === "due" ? "Not paid" : "Date not saved"}</span>${st.sub ? `<em>${esc(st.sub)}</em>` : ""}${st.tier ? `<em>${esc(st.tier.label)}${isSpecialTier(st.tier) ? "" : ` · ${st.tier.percentage}%`}</em>` : ""}</div>`;
  }).join("")}</div></div>`;
};

// PDF table la TNR row keezha road map (compact, 6 step oru varisai)
const pdfRoadRow = (g) => {
  const steps = roadOf(g);
  const PER = 8;
  const out = [];
  for (let i = 0; i < steps.length; i += PER) {
    const chunk = steps.slice(i, i + PER);
    out.push(`<div class="rr">${chunk.map((st, j) => {
      const [c1, c2] = ROAD[st.kind] || ROAD.book;
      return `<div class="rs2">${j < chunk.length - 1 ? '<span class="rl"></span>' : ""}<span class="rd2" style="background:linear-gradient(135deg,${c1},${c2})">${i + j + 1}</span><b style="color:${c1}">${esc(st.title)}</b><span>${st.date ? esc(fmtDate(st.date)) : st.kind === "due" ? "Not paid" : "—"}</span>${st.sub ? `<em>${esc(st.sub)}</em>` : ""}${st.tier ? `<i>${esc(st.tier.label)}${isSpecialTier(st.tier) ? "" : ` · ${st.tier.percentage}%`}</i>` : ""}</div>`;
    }).join("")}${'<div class="rs2 gh"></div>'.repeat(PER - chunk.length)}</div>`);
  }
  return `<tr class="rd"><td></td><td colspan="9"><div class="rmap"><span class="rcap">Road map</span>${out.join("")}</div></td></tr>`;
};

// PDF journey card — oru TNR ku oru card, road map idam vittu (5 step oru varisai)
const pdfJourney = (g, no) => {
  const steps = roadOf(g);
  const r = g.head;
  const PER = 5;
  const rowsHtml = [];
  for (let i = 0; i < steps.length; i += PER) {
    const chunk = steps.slice(i, i + PER);
    rowsHtml.push(`<div class="jr">${chunk.map((st, j) => {
      const [c1, c2] = ROAD[st.kind] || ROAD.book;
      const last = j === chunk.length - 1;
      return `<div class="js">${last ? "" : '<span class="jl"></span>'}<span class="jd" style="background:linear-gradient(135deg,${c1},${c2})">${i + j + 1}</span>
        <b style="color:${c1}">${esc(st.title)}</b><span class="jt">${st.date ? esc(fmtDate(st.date)) : st.kind === "due" ? "Not paid" : "Date not saved"}</span>
        ${st.sub ? `<em>${esc(st.sub)}</em>` : ""}${st.tier ? `<i class="jtier">${esc(st.tier.label)}${isSpecialTier(st.tier) ? "" : ` · ${st.tier.percentage}%`}</i>` : ""}</div>`;
    }).join("")}${chunk.length < PER ? '<div class="js ghost"></div>'.repeat(PER - chunk.length) : ""}</div>`);
  }
  return `<div class="jc"><div class="jh"><span class="jno">${no}</span><b class="tnr">${esc(g.tnr)}</b><span class="jtour">${esc(r.tourName || "")}</span><span class="jby">${esc(r.contact?.name || "")}${r.contact?.mobile ? ` · ${esc(r.contact.mobile)}` : ""}</span></div>${rowsHtml.join("")}</div>`;
};

function buildPdfHtml({ filterText, hero, sections, tiers, groups, charts, note, catLabel, tierSplit, facts, allRows = [] }) {
  const now = new Date();
  const gen = `${now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
  const head = (sub) => `<header class="hd">
      <div class="brand"><div class="logo">GV</div><div><div class="kick">GV - Tour Planners LLP · Cancellation Report</div><h1>${esc(sub)}</h1></div></div>
      <div class="meta"><span class="ml">Report filters</span><span>${esc(filterText)}</span><span class="gen">${esc(gen)}</span></div>
    </header>`;
  const foot = `<footer class="pf"><span>Generated on ${esc(gen)}</span><span class="pno"></span></footer>`;

  // ── Summary page — ledger style (gradient cards illa) ──
  const heroHtml = `<div class="ledger">${hero.map(([icon, label, value, c1, c2]) => `
      <div class="lc" style="--c:${c1};--c2:${c2 || c1}"><span class="lic">${icon}</span><span class="ltx"><span class="ll">${esc(label)}</span><b class="lv"${String(value).length > 12 ? ' style="font-size:17px"' : ""}>${esc(value)}</b></span></div>`).join("")}</div>`;
  const secBlock = ({ title, color, items }) => `
      <div class="sx"><div class="sh"><i style="background:${color}"></i>${esc(title)}</div>
        <div class="rowv">${items.map(([icon, label, value, bg, fg]) => `
          <div class="rv" style="--fg:${fg};--bg:${bg}"><span class="rvi">${icon}</span><span class="rvt"><b style="${String(value).length > 9 ? "font-size:17px" : ""}">${esc(value)}</b><span>${esc(label)}</span></span></div>`).join("")}</div>
      </div>`;
  // ── Summary — own layout: KPI strip, money + people panels, tier bars (Both la rendu thaniya) ──
  const f = facts || {};
  const pct = (v, t) => (t ? +((v / t) * 100).toFixed(1) : 0);
  const kpis = `<div class="kp">${hero.map(([icon, label, value, c1]) => `<div class="kpc" style="--c:${c1}"><span class="kpi">${icon}</span><span class="kpl">${esc(label)}</span><b class="kpv"${String(value).length > 12 ? ' style="font-size:20px"' : ""}>${esc(value)}</b></div>`).join("")}</div>`;
  const money = `<div class="pn"><div class="pnh"><span class="pnd" style="background:#B91C1C"></span>Where the money went<em>tour booking</em></div>
    <div class="big">${esc(inr(f.total))}<span>total cancellation</span></div>
    <div class="stk"><i style="width:${pct(f.gv, f.total)}%;background:linear-gradient(90deg,#D97706,#FBBF24)"></i><i style="width:${pct(f.irctc, f.total)}%;background:linear-gradient(90deg,#0284C7,#38BDF8)"></i></div>
    <div class="mrow"><span><i style="background:#D97706"></i>GV cancellation</span><b style="color:#B45309">${esc(inr(f.gv))}</b><em>${pct(f.gv, f.total)}%</em></div>
    <div class="mrow"><span><i style="background:#0284C7"></i>IRCTC cancellation</span><b style="color:#0369A1">${esc(inr(f.irctc))}</b><em>${pct(f.irctc, f.total)}%</em></div></div>`;
  const tt = (f.trav || 0) + (f.trip || 0);
  const gt = (f.male || 0) + (f.female || 0) + (f.other || 0);
  const people = `<div class="pn"><div class="pnh"><span class="pnd" style="background:#0E7490"></span>Who cancelled<em>${tt} travellers</em></div>
    <p class="cap3">Proper cancellation vs trip cancelled</p>
    <div class="stk"><i style="width:${pct(f.trav, tt)}%;background:linear-gradient(90deg,#BE123C,#FB7185)"></i><i style="width:${pct(f.trip, tt)}%;background:linear-gradient(90deg,#B45309,#FCD34D)"></i></div>
    <div class="mrow"><span><i style="background:#BE123C"></i>Proper cancellation</span><b style="color:#BE123C">${f.trav || 0}</b><em>${pct(f.trav, tt)}%</em></div>
    <div class="mrow"><span><i style="background:#B45309"></i>Trip cancelled</span><b style="color:#92400E">${f.trip || 0}</b><em>${pct(f.trip, tt)}%</em></div>
    <p class="cap3" style="margin-top:10px">By gender</p>
    <div class="stk"><i style="width:${pct(f.male, gt)}%;background:linear-gradient(90deg,#4F46E5,#A78BFA)"></i><i style="width:${pct(f.female, gt)}%;background:linear-gradient(90deg,#DB2777,#F9A8D4)"></i><i style="width:${pct(f.other, gt)}%;background:#94A3B8"></i></div>
    <div class="gchips"><span><i style="background:#4F46E5"></i>Male <b>${f.male || 0}</b></span><span><i style="background:#DB2777"></i>Female <b>${f.female || 0}</b></span><span><i style="background:#94A3B8"></i>Other <b>${f.other || 0}</b></span></div></div>`;
  const tierCard = (title, list2) => {
    const mx = Math.max(1, ...list2.map((t) => t.trav));
    return `<div class="pn tc2"><div class="pnh"><span class="pnd" style="background:#6D28D9"></span>${esc(title)}<em>${list2.reduce((a2, t) => a2 + t.trav, 0)} travellers</em></div>
      ${list2.map((t) => { const [c1, c2] = TIER_GRAD(t.percentage, isSpecialTier(t)); return `<div class="tbr"><span class="tbl">${esc(t.label)}${isSpecialTier(t) ? "" : ` <em>${t.percentage}%</em>`}</span><span class="tbt"><i style="width:${Math.max(t.trav ? 3 : 0, (t.trav / mx) * 100)}%;background:linear-gradient(90deg,${c1},${c2})"></i></span><b>${t.trav}</b><span class="tbn">${t.tnr} TNR${t.tnr === 1 ? "" : "s"}</span></div>`; }).join("") || '<p class="empty">No data</p>'}</div>`;
  };
  const tierRow = tierSplit
    ? `<div class="g2">${tierCard("Tiers · Advance only paid", tierSplit.advance)}${tierCard("Tiers · Fully paid", tierSplit.full)}</div>`
    : `<div class="g1">${tierCard(`Tiers · ${catLabel}`, tiers)}</div>`;
  const summary = `<section class="page">${head(`Summary · ${catLabel}`)}${kpis}${note ? `<p class="note">${esc(note)}</p>` : ""}<div class="sb"><div class="g2">${money}${people}</div>${tierRow}</div>${foot}</section>`;

  // ── Chart pages — oru page ku oru chart ──
  const tierItems = tiers.map((t) => { const [c1, c2] = TIER_GRAD(t.percentage, isSpecialTier(t)); return { label: t.label, sub: isSpecialTier(t) ? `${t.tnr} TNRs` : `${t.percentage}% · ${t.tnr} TNRs`, value: t.trav, c1, c2 }; });
  const top = tiers.reduce((b, t) => (t.trav > (b?.trav || 0) ? t : b), null);
  const peakMonth = charts.month.reduce((b, m) => (m.trav > (b?.trav || 0) ? m : b), null);
  const g = charts.gender;
  const gTot = g.Male + g.Female + g.Other;
  const tierChart = (ttl, sub, list2) => {
    const items = list2.map((t) => { const [c1, c2] = TIER_GRAD(t.percentage, isSpecialTier(t)); return { label: t.label, sub: isSpecialTier(t) ? `${t.tnr} TNRs` : `${t.percentage}% · ${t.tnr} TNRs`, value: t.trav, c1, c2 }; });
    const tp = list2.filter((t) => !isSpecialTier(t)).reduce((b, t) => (t.trav > (b?.trav || 0) ? t : b), null);
    return { title: ttl, sub, body: pdfBars(items, { W: 1000, H: 380 }),
      stats: [["Travellers", list2.reduce((a, t) => a + t.trav, 0), "#2E7D32"], ["TNRs", list2.reduce((a, t) => a + t.tnr, 0), "#0284C7"], tp?.trav ? ["Most cancelled tier", `${tp.label} · ${tp.trav}`, "#E11D48", true] : null] };
  };
  const chartList = [
    ...(tierSplit
      ? [tierChart("Tier-wise · Advance only paid", "Cancelled with only the advance paid", tierSplit.advance), tierChart("Tier-wise · Fully paid", "Cancelled after the balance was paid", tierSplit.full)]
      : [{ title: "Tier-wise cancellations", sub: "Travellers cancelled in each cancellation tier", body: pdfBars(tierItems, { W: 1000, H: 380 }),
        stats: [["Travellers", tiers.reduce((a, t) => a + t.trav, 0), "#2E7D32"], ["TNRs", groups.length, "#0284C7"], top?.trav ? ["Most cancelled tier", `${top.label} · ${top.trav}`, "#E11D48", true] : null] }]),
    { title: "Who cancelled", sub: "Cancelled travellers by gender", body: pdfDonut([
        { label: "Male", value: g.Male, c1: "#6366F1", c2: "#A78BFA" },
        { label: "Female", value: g.Female, c1: "#EC4899", c2: "#F9A8D4" },
        { label: "Other", value: g.Other, c1: "#64748B", c2: "#CBD5E1" },
      ], gTot, "travellers", 300),
      stats: [["Male", g.Male, "#6366F1"], ["Female", g.Female, "#EC4899"], ["Other", g.Other, "#64748B"]] },
    { title: "Month by month", sub: "TNRs and travellers cancelled, by approved date", legend: [["#6366F1", "TNRs"], ["#E11D48", "Travellers"]], body: pdfMonth(charts.month, { W: 1000, H: 400 }),
      stats: [["Months", charts.month.length, "#2E7D32"], ["Travellers", charts.month.reduce((a, m) => a + m.trav, 0), "#E11D48"], peakMonth?.trav ? ["Highest month", `${peakMonth.label} · ${peakMonth.trav}`, "#4F46E5", true] : null] },
    { title: "Where the money went", sub: "GV vs IRCTC cancellation (tour booking)", legend: [["#D97706", "GV"], ["#0284C7", "IRCTC"]], body: pdfDonut([
        { label: "GV cancellation", value: charts.gv, c1: "#D97706", c2: "#FCD34D", fmt: inr },
        { label: "IRCTC cancellation", value: charts.irctc, c1: "#0284C7", c2: "#7DD3FC", fmt: inr },
      ], inr(charts.gv + charts.irctc), "total", 300),
      stats: [["GV cancellation", inr(charts.gv), "#D97706"], ["IRCTC cancellation", inr(charts.irctc), "#0284C7"], ["Total cancellation", inr(charts.gv + charts.irctc), "#BE123C", true]] },
    { title: "Tours with the most cancellations", sub: "Travellers cancelled and total cancellation amount", body: `<div class="tours">${pdfTours(charts.tours)}</div>`,
      stats: charts.tours[0] ? [["Tours", charts.tours.length, "#2E7D32"], ["Top tour", `${charts.tours[0].name} · ${charts.tours[0].trav}`, "#E11D48", true]] : [] },
  ];
  const chartPages = chartList.map((c, i) => `<section class="page">${head(`Charts · ${i + 1} of ${chartList.length}`)}
      <div class="chart">
        <div class="ctop">
          <div class="cttl"><span class="cno">${String(i + 1).padStart(2, "0")}</span><div><div class="ct">${esc(c.title)}</div><div class="cs">${esc(c.sub)}</div></div></div>
          ${c.legend?.length ? `<div class="lg">${c.legend.map(([col, l]) => `<span><i style="background:${col}"></i>${esc(l)}</span>`).join("")}</div>` : ""}
        </div>
        <div class="cimg">${c.body}</div>
        ${c.stats.filter(Boolean).length ? `<div class="kst">${c.stats.filter(Boolean).map(([l, v, col, pk]) => `<div class="k${pk ? " pk" : ""}" style="--k:${col}"><span>${esc(l)}</span><b>${esc(v)}</b></div>`).join("")}</div>` : ""}
      </div>${foot}</section>`);

  // ── TNR cards — screen la expand panna maadhiriye: amount strip, travellers table, road map ──
  const SHARE = { double: "Double", triple: "Triple", withBerth: "Child, berth", withoutBerth: "Child, no berth" };
  const card = (gr, no) => {
    const r = gr.head;
    const a = gr.owner?.amounts || {};
    const amt = gr.show || gr.amt;
    const rb = Number(a.refund) > 0 && Math.abs(Number(a.refund) - Number(a.balance || 0)) < 0.5;
    const rowsAll = allRows.filter((x) => x.tnr === gr.tnr).sort((x, y) => (x.seq || 0) - (y.seq || 0));
    const canc = rowsAll.flatMap((k) => k.travellers.map((t) => ({ k, t })));
    const ids = new Set(canc.map(({ t }) => t.id));
    const active = (r.allTravellers || []).filter((t) => !ids.has(t.id));
    const tiles = [
      ["Advance", inr(a.advance), "#0F766E", "#E6F6F4", a.advancePaid ? "Paid" : "Not paid"],
      ["Balance", inr(a.balance), rb ? "#6D28D9" : "#047857", rb ? "#F3EEFE" : "#E8F7F1", rb ? "Same as refund" : a.balancePaid ? "Paid" : "Pending"],
      ["GV cancellation", inr(amt.gv), "#B45309", "#FEF5E7", "incl. remarks"],
      ["IRCTC cancellation", inr(amt.irctc), "#0369A1", "#E8F4FB", ""],
      ["Total cancellation", inr(amt.total), "#BE123C", "#FDECF0", gr.amt.inOther ? `counted in ${gr.amt.inOther === "full" ? "Fully paid" : "Advance only"}` : "GV + IRCTC"],
      ["Refund", inr(a.refund), rb ? "#6D28D9" : "#047857", rb ? "#F3EEFE" : "#E8F7F1", "Last approved cancellation"],
    ];
    const trRow = ({ k, t }) => {
      const tt = tierOfT(k, t);
      const [c1] = TIER_GRAD(tt?.percentage, isSpecialTier(tt));
      return `<tr><td><span class="ord">${esc(ORD(k.seq || 1))}${(k.seqTotal || 1) > 1 ? ` of ${k.seqTotal}` : ""}</span></td><td>${esc(fmtDate(t.cancelledOn || k.approvedOn))}</td>
        <td><b>${esc(t.name || "—")}</b><span class="sm">${esc([t.age ? `${t.age} yrs` : "", t.gender, SHARE[t.sharingType] || t.sharingType].filter(Boolean).join(" · "))}</span></td>
        <td><span class="tp" style="color:${c1};background:${c1}14;border:1px solid ${c1}40">${isSpecialTier(tt) ? "" : `<i style="background:${c1}">${tt?.percentage}%</i> `}${esc(tt?.label || "—")}</span></td>
        <td>${isSpecialTier(tt) ? "—" : `${t.noOfDays ?? k.noOfDays} days`}</td>
        <td><span class="cat ${k.category === "full" ? "f" : "a"}">${k.category === "full" ? "Fully paid" : "Advance only"}</span></td></tr>`;
    };
    const st = { cancelled: ["Cancelled (other)", "#C2410C", "#FFF1E8"], trip: ["Trip cancelled", "#92400E", "#FEF3C7"], requested: ["Cancel requested", "#5B21B6", "#EDE9FE"], active: ["Travelling", "#047857", "#E3F4F1"] };
    const actRow = (t) => { const [l, c, bg] = st[t.status] || st.active; return `<tr><td class="mut">—</td><td class="mut">—</td><td><b>${esc(t.name || "—")}</b><span class="sm">${esc([t.age ? `${t.age} yrs` : "", t.gender, SHARE[t.sharingType] || t.sharingType].filter(Boolean).join(" · "))}</span></td><td colspan="3"><span class="cat" style="color:${c};background:${bg}">${l}</span></td></tr>`; };
    return `<div class="cc">
      <div class="cch"><span class="ccn">${no}</span><b class="tnr">${esc(gr.tnr)}</b><span class="cct">${esc(r.tourName || "")}</span>
        <span class="ccb"><b>${esc(r.contact?.name || "—")}</b> · ${esc(r.contact?.mobile || "")}${r.contact?.email ? ` · ${esc(String(r.contact.email).toLowerCase())}` : ""}${r.bookedBy ? ` · by ${esc(byName(r.bookedBy) || (BY_TAG[r.bookedBy.type] || BY_TAG.admin)[0])}` : ""}</span></div>
      <div class="ctl">${tiles.map(([l, v, c, bg, sub]) => `<div class="ct1" style="background:linear-gradient(180deg,${bg},#fff)"><span>${l}</span><b style="color:${c}">${v}</b>${sub ? `<em>${esc(sub)}</em>` : ""}</div>`).join("")}</div>
      ${rb ? `<p class="rbh">The balance on this tour booking is the refund amount. Refund ${esc(inr(a.refund))} to the customer, do not collect it.</p>` : ""}
      <div class="ctr"><div class="ctrh"><b>Travellers in this booking</b> <span>(${canc.length + active.length})</span><em>${canc.length} cancelled · ${active.length} not cancelled</em></div>
        <table class="kt"><thead><tr><th style="width:9%">Order</th><th style="width:12%">Cancelled on</th><th>Traveller</th><th style="width:18%">Tier</th><th style="width:11%">Days before</th><th style="width:13%">Paid status</th></tr></thead>
        <tbody>${canc.map(trRow).join("")}${active.map(actRow).join("")}</tbody></table></div>
      ${pdfRoadRow(gr).replace('<tr class="rd"><td></td><td colspan="9">', "").replace("</td></tr>", "")}
    </div>`;
  };
  const tablePage = `<section class="page tpg">${head("Cancelled TNRs")}<div class="cw"></div>${foot}</section>`;
  const tableData = `<template id="tpl">${tablePage}</template>
    <template id="trows">${groups.map((gr, i) => card(gr, i + 1)).join("") || '<p class="empty">No cancellations for these filters</p>'}</template>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Cancellation Analytics Report - ${esc(filterText)}</title>
<style>
  @page { size: A4 landscape; margin: 8mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; font-family: "Segoe UI", Roboto, Arial, sans-serif; color: #1C2B22; background: #EDEFEA; font-size: 12px; }
  .bar { position: sticky; top: 0; z-index: 2; display: flex; gap: 10px; justify-content: center; align-items: center; padding: 10px; background: #fff; border-bottom: 1px solid #E3E6E0; }
  .bar button { border: 0; border-radius: 8px; padding: 9px 20px; font-weight: 700; font-size: 14px; cursor: pointer; background: #1F6F43; color: #fff; }
  .bar button.sec { background: #E5E7EB; color: #374151; }
  .bar .hint { padding: 8px 14px; border-radius: 8px; background: #FEF3C7; border: 2px solid #F59E0B; color: #92400E; font-size: 15px; font-weight: 700; }
  .bar .hint b { color: #B91C1C; text-decoration: underline; }
  .page { width: 281mm; height: 193mm; overflow: hidden; margin: 14px auto; background: #fff; display: flex; flex-direction: column; position: relative; }
  @media screen { .page { width: 297mm; height: 209mm; padding: 9mm 10mm; box-shadow: 0 2px 10px rgba(0,0,0,.08); } }
  .page > * { flex-shrink: 0; }
  /* header — white, green rule */
  .hd { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; padding: 0 0 10px; border-bottom: 3px solid #1F6F43; position: relative; }
  .hd::after { content: ""; position: absolute; left: 0; right: 0; bottom: -7px; border-bottom: 1px solid #CFE3D6; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .logo { width: 42px; height: 42px; border-radius: 10px; background: #1F6F43; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 15px; letter-spacing: .5px; }
  .kick { font-size: 10.5px; font-weight: 700; color: #4A7A5C; letter-spacing: .4px; }
  .hd h1 { margin: 1px 0 0; font-size: 22px; color: #12261A; }
  .meta { text-align: right; max-width: 48%; font-size: 11.5px; color: #4B5563; } .meta .ml { display: block; font-size: 9.5px; font-weight: 700; color: #9CA3AF; letter-spacing: .6px; }
  /* summary ledger */
  .ledger { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; margin-top: 18px; border: 1px solid #E3E6E0; border-radius: 12px; overflow: hidden; }
  .lc { padding: 14px 16px; border-left: 1px solid #E3E6E0; display: flex; flex-direction: column; gap: 4px; min-width: 0; } .lc:first-child { border-left: 0; }
  .ld { width: 26px; height: 4px; border-radius: 4px; } .ll { font-size: 11px; color: #6B7280; font-weight: 600; } .lv { font-size: 22px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .note { margin: 10px 0 0; padding: 7px 12px; border-left: 3px solid #7C3AED; background: #F7F5FF; color: #5B21B6; font-size: 12px; font-weight: 600; }
  .secs { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; justify-content: space-evenly; gap: 10px; margin-top: 8px; }
  .page .secs { justify-content: flex-start; gap: 18px; margin-top: 18px; } .ledger .lc { min-height: 78px; }
  .sh { display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 800; color: #12261A; margin-bottom: 6px; } .sh i { width: 10px; height: 10px; border-radius: 3px; }
  .rowv { display: flex; border-top: 1px solid #E3E6E0; border-bottom: 1px solid #E3E6E0; }
  .rv { flex: 1 1 0; min-width: 0; padding: 12px 14px; border-left: 1px dashed #E3E6E0; } .rv:first-child { border-left: 0; padding-left: 2px; }
  .rv b { display: block; font-size: 24px; font-weight: 800; line-height: 1.1; white-space: nowrap; } .rv span { display: block; font-size: 11.5px; color: #6B7280; font-weight: 600; margin-top: 3px; }
  /* charts */
  .chart { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; margin-top: 16px; }
  .ctop { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding-bottom: 8px; border-bottom: 1px solid #EEF1EC; }
  .cttl { display: flex; align-items: center; gap: 12px; } .cno { font-size: 26px; font-weight: 900; color: #CFE3D6; line-height: 1; }
  .ct { font-size: 19px; font-weight: 800; color: #12261A; } .cs { font-size: 11.5px; color: #6B7280; margin-top: 2px; }
  .lg { display: flex; gap: 12px; flex-wrap: wrap; justify-content: flex-end; }
  .lg span { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 700; color: #374151; }
  .lg i { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
  .cimg { flex: 1 1 auto; min-height: 0; display: flex; align-items: center; justify-content: center; margin-top: 8px; } .cimg > svg { max-height: 100%; }
  .kst { display: flex; gap: 0; margin-top: 8px; border-top: 1px solid #EEF1EC; }
  .k { flex: 1 1 0; min-width: 0; padding: 8px 14px; border-left: 1px dashed #E3E6E0; } .k:first-child { border-left: 0; padding-left: 2px; }
  .k span { display: block; font-size: 10.5px; color: #6B7280; font-weight: 700; } .k b { display: block; font-size: 17px; color: var(--k); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .k.pk b { text-decoration: underline; text-decoration-color: #CFE3D6; text-underline-offset: 4px; }
  .empty, p.empty { color: #9CA3AF; text-align: center; }
  .dn { display: flex; align-items: center; justify-content: center; gap: 48px; } .lgs { width: 360px; display: grid; gap: 8px; }
  .dn .lg { display: grid; grid-template-columns: 12px 1fr auto auto; align-items: center; gap: 10px; font-size: 13px; border-bottom: 1px solid #EEF1EC; padding: 8px 2px; }
  .dn .lg i { width: 12px; height: 12px; border-radius: 50%; } .dn .lg em { font-style: normal; color: #9AA0B8; font-size: 11px; }
  .keys { display: none; }
  .tours { width: 100%; align-self: stretch; padding: 6px 10px; }
  .tr { display: flex; align-items: center; gap: 10px; margin: 16px 0; } .rk { width: 26px; height: 26px; border-radius: 50%; color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex: none; }
  .tb { flex: 1; min-width: 0; } .tt { display: flex; justify-content: space-between; gap: 8px; font-size: 13.5px; } .tt b { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .tt span { white-space: nowrap; font-weight: 700; }
  .trk { height: 10px; border-radius: 8px; overflow: hidden; margin-top: 5px; } .trk i { display: block; height: 100%; border-radius: 8px; }
  /* table — rules only, no boxes */
  .tw { margin-top: 14px; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  th { background: #fff; color: #1F6F43; font-size: 10.5px; font-weight: 800; padding: 8px 7px; border-bottom: 2px solid #1F6F43; text-align: left; letter-spacing: .2px; }
  td { padding: 8px 7px; border-bottom: 1px solid #ECEFEA; font-size: 11.5px; vertical-align: top; }
  tbody tr:nth-child(even) td { background: #FAFBF9; }
  .c { text-align: center; } .r { text-align: right; white-space: nowrap; } .b { font-weight: 700; } .mut { color: #9CA3AF; }
  .tnr { font-family: Consolas, monospace; color: #1F6F43; } .tn { display: block; line-height: 1.25; }
  .sm { display: block; font-size: 10px; color: #9CA3AF; } .sm.em { color: #4B5563; word-break: break-all; }
  .tv { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; padding: 2px 0; } .tv + .tv { border-top: 1px dotted #E3E6E0; padding-top: 4px; margin-top: 2px; }
  .tv b { font-size: 11px; } .tv em { font-style: normal; font-size: 10px; color: #6B7280; }
  .tp { display: inline-block; padding: 0 6px; border-radius: 999px; font-size: 10px; font-weight: 700; }
  .bd { display: block; width: fit-content; margin: 2px 0 0 auto; padding: 0 6px; border-radius: 6px; font-size: 9.5px; font-weight: 700; }
  .bd.ok { background: #E7F3EC; color: #1F6F43; } .bd.due { background: #FEF3C7; color: #B45309; } .bd.rf { background: #F3E8FF; color: #7E22CE; }
  .gv { color: #B45309; font-weight: 700; } .ir { color: #0369A1; font-weight: 700; } .tc { color: #BE123C; }
  tfoot td { background: #F2F7F3 !important; font-weight: 800; border-top: 2px solid #1F6F43; border-bottom: 0; }
  td.empty { text-align: center; color: #6B7280; height: 24mm; vertical-align: middle; }
  .pf { margin-top: auto; padding-top: 6px; display: flex; justify-content: space-between; font-size: 10px; color: #9CA3AF; border-top: 1px solid #EEF1EC; }
  /* road map under each TNR row */
  .r .sm { white-space: normal; text-align: right; } table { max-width: 100%; }
  tr.rd td { background: #FBFCFA !important; border-bottom: 2px solid #E1E8E1; padding: 4px 7px 8px; }
  .rmap { position: relative; border-left: 3px solid #D4AF37; padding-left: 10px; }
  .rcap { display: block; font-size: 9px; font-weight: 800; color: #8A6D1F; letter-spacing: .5px; margin-bottom: 2px; }
  .rr { display: flex; padding: 2px 0; }
  .rs2 { position: relative; flex: 1 1 0; min-width: 0; text-align: center; padding: 0 5px; font-size: 9.5px; line-height: 1.25; } .rs2.gh { visibility: hidden; }
  .rd2 { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; width: 18px; height: 18px; margin: 0 auto 3px; border-radius: 50%; color: #fff; font-size: 9px; font-weight: 800; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,.12); }
  .rl { position: absolute; left: 50%; top: 8px; width: 100%; height: 2px; background: repeating-linear-gradient(90deg, #C9D6CC 0 5px, transparent 5px 9px); }
  .rs2 b { display: block; font-size: 10px; } .rs2 span { display: block; color: #374151; } .rs2 em { display: block; font-style: normal; color: #8A94A6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .rs2 i { display: inline-block; margin-top: 2px; font-style: normal; font-weight: 700; font-size: 9px; padding: 0 6px; border-radius: 999px; background: #FDF2F4; color: #BE123C; }
  tbody tr:nth-child(even):not(.rd) td { background: transparent; }
  /* journeys */
  .jsub { margin: 10px 0 0; font-size: 11.5px; color: #6B7280; }
  .jw { display: flex; flex-direction: column; gap: 12px; margin-top: 10px; }
  .jc { border: 1px solid #E6EAE3; border-radius: 14px; padding: 12px 16px 6px; background: linear-gradient(180deg, #FFFFFF, #FAFBF8); break-inside: avoid; }
  .jh { display: flex; align-items: baseline; gap: 10px; padding-bottom: 8px; margin-bottom: 4px; border-bottom: 1px dashed #E6EAE3; }
  .jno { width: 22px; height: 22px; border-radius: 50%; background: #14432A; color: #F3E3A8; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; align-self: center; }
  .jh .tnr { font-size: 13px; } .jtour { font-family: Georgia, "Times New Roman", serif; font-weight: 700; color: #14432A; font-size: 13px; } .jby { margin-left: auto; font-size: 11px; color: #6B7280; }
  .jr { display: flex; padding: 10px 0 8px; }
  .js { position: relative; flex: 1 1 0; min-width: 0; text-align: center; padding: 0 8px; font-size: 10.5px; }
  .js.ghost { visibility: hidden; }
  .jd { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; margin: 0 auto 6px; border-radius: 50%; color: #fff; font-size: 11px; font-weight: 800; border: 3px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,.12); }
  .jl { position: absolute; left: 50%; top: 12px; width: 100%; height: 2px; background: repeating-linear-gradient(90deg, #C9D6CC 0 6px, transparent 6px 10px); }
  .js b { display: block; font-size: 11.5px; line-height: 1.25; } .js .jt { display: block; color: #374151; margin-top: 2px; }
  .js em { display: block; font-style: normal; color: #8A94A6; margin-top: 2px; line-height: 1.3; }
  .jtier { display: inline-block; margin-top: 4px; font-style: normal; font-weight: 700; font-size: 10px; padding: 1px 8px; border-radius: 999px; background: #FDF2F4; color: #BE123C; }
  /* ── classy layer ── */
  .hd { align-items: center; padding: 14px 20px; border: 0; border-radius: 14px; color: #fff; background: #14432A; background-image: radial-gradient(circle at 92% -40%, rgba(212,175,55,.28), transparent 55%), linear-gradient(120deg, #0F3520, #1F6F43); }
  .hd::after { left: 20px; right: 20px; bottom: 7px; border-bottom: 1px solid rgba(212,175,55,.55); }
  .logo { background: rgba(255,255,255,.12); border: 1px solid rgba(212,175,55,.7); color: #F3E3A8; font-family: Georgia, "Times New Roman", serif; }
  .kick { color: #D9C27A; letter-spacing: .6px; } .hd h1 { color: #fff; font-family: Georgia, "Times New Roman", serif; font-weight: 700; font-size: 23px; letter-spacing: .2px; }
  .meta { color: rgba(255,255,255,.88); } .meta .ml { color: #D9C27A; } .meta .gen { display: block; font-size: 10px; color: rgba(255,255,255,.6); margin-top: 2px; }
  .ledger { gap: 12px; border: 0; overflow: visible; margin-top: 16px; }
  .lc { border: 1px solid #E6EAE3; border-left: 0; border-radius: 12px; padding: 14px 16px 14px 18px; position: relative; background: linear-gradient(180deg, #FFFFFF, #FAFBF8); box-shadow: 0 1px 0 #EEF1EC; }
  .lc::before { content: ""; position: absolute; left: 0; top: 10px; bottom: 10px; width: 4px; border-radius: 0 4px 4px 0; background: var(--c); }
  .lc .ll { font-size: 11px; color: #6B7280; } .lc .lv { color: var(--c); font-family: Georgia, "Times New Roman", serif; font-size: 25px; }
  .sh { font-family: Georgia, "Times New Roman", serif; font-size: 14px; font-weight: 700; color: #14432A; padding-bottom: 4px; border-bottom: 1px solid #E6EAE3; }
  .rowv { border-top: 0; } .rv b { font-family: Georgia, "Times New Roman", serif; }
  .ct { font-family: Georgia, "Times New Roman", serif; font-size: 21px; color: #14432A; } .cno { color: #D4AF37; font-family: Georgia, serif; }
  .chart { border: 1px solid #E6EAE3; border-radius: 16px; padding: 14px 20px; background: linear-gradient(180deg, #FFFFFF 0%, #F8FAF6 100%); }
  .k { background: transparent; } .k b { font-family: Georgia, "Times New Roman", serif; }
  th { background: #14432A; color: #F3E3A8; border-bottom: 2px solid #D4AF37; font-weight: 700; }
  th:first-child { border-top-left-radius: 8px; } th:last-child { border-top-right-radius: 8px; }
  .tnr { color: #14432A; } tbody tr:nth-child(even) td { background: #F7F9F4; }
  tfoot td { background: #14432A !important; color: #fff; border-top: 2px solid #D4AF37; } tfoot .gv { color: #FCD34D; } tfoot .ir { color: #93C5FD; }
  .pf { border-top: 1px solid #E6EAE3; color: #8A9A8E; } .pf .pno { color: #14432A; font-weight: 700; }
  /* ══ v3 — Sales Dashboard richness, own identity ══ */
  body { font-family: "Segoe UI", Roboto, Arial, sans-serif; }
  .hd { border-radius: 16px; padding: 14px 20px; background: linear-gradient(115deg, #0B3D20 0%, #1B6B38 55%, #3FA45B 100%); overflow: hidden; }
  .hd::before { content: ""; position: absolute; right: -40px; top: -60px; width: 220px; height: 220px; border-radius: 50%; background: rgba(255,255,255,.07); }
  .hd::after { content: ""; position: absolute; left: auto; right: 120px; bottom: -70px; top: auto; width: 160px; height: 160px; border: 0; border-radius: 50%; background: rgba(255,255,255,.05); }
  .logo { background: #fff; color: #1B6B38; border: 0; font-family: inherit; font-weight: 900; box-shadow: 0 2px 6px rgba(0,0,0,.18); }
  .kick { color: #BFE6C8; font-weight: 700; } .hd h1 { font-family: inherit; font-weight: 800; font-size: 22px; }
  .meta { position: relative; z-index: 1; } .meta .ml { color: #BFE6C8; }
  .ledger { gap: 12px; margin-top: 14px; }
  .lc { display: flex; flex-direction: row; align-items: center; text-align: left; gap: 12px; border: 0; border-radius: 14px; padding: 14px 16px; color: #fff; overflow: hidden; background: linear-gradient(135deg, var(--c), var(--c2)); box-shadow: 0 4px 12px rgba(0,0,0,.10); }
  .lc::before { content: ""; position: absolute; left: auto; right: -18px; top: -26px; bottom: auto; width: 86px; height: 86px; border-radius: 50%; background: rgba(255,255,255,.14); }
  .lic { width: 40px; height: 40px; flex: none; border-radius: 12px; background: rgba(255,255,255,.22); display: flex; align-items: center; justify-content: center; font-size: 19px; }
  .ltx { min-width: 0; position: relative; } .lc .ll { display: block; color: rgba(255,255,255,.9); font-size: 11px; font-weight: 700; } .lc .lv { display: block; color: #fff; font-family: inherit; font-size: 22px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sh { font-family: inherit; font-size: 12.5px; font-weight: 800; color: #1F2937; border-bottom: 0; padding: 0; margin-bottom: 8px; } .sh i { width: 4px; height: 16px; border-radius: 3px; }
  .rowv { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 10px; border: 0; }
  .rv { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 1px solid #EEF0F4 !important; border-radius: 14px; background: linear-gradient(135deg, var(--bg), #FFFFFF 75%); }
  .rv:first-child { padding-left: 14px; }
  .rvi { width: 34px; height: 34px; flex: none; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; color: var(--fg); font-weight: 800; box-shadow: 0 1px 4px rgba(0,0,0,.10); }
  .rv .rvi { display: flex; margin: 0; font-size: 16px; } .rv { min-height: 74px; }
  .rvt { min-width: 0; } .rv b { display: block; color: var(--fg); font-family: inherit; font-size: 22px; font-weight: 800; white-space: nowrap; } .rv .rvt span { display: block; font-size: 11.5px; color: #4B5563; font-weight: 700; margin-top: 1px; }
  .chart { margin-top: 12px; border: 1px solid #E5EAE5; border-radius: 18px; padding: 0; overflow: hidden; background: #fff; }
  .ctop { padding: 12px 18px; border-bottom: 1px solid #EEF2EE; background: linear-gradient(180deg, #F3FAF4, #FFFFFF); }
  .cno { width: 32px; height: 32px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1B6B38, #3FA45B); color: #fff; font-family: inherit; font-size: 13px; font-weight: 800; }
  .ct { font-family: inherit; font-weight: 800; font-size: 19px; color: #1F2937; }
  .lg span { padding: 4px 10px; border-radius: 999px; background: #F3F4F6; }
  .cimg { padding: 6px 18px; }
  .kst { gap: 10px; padding: 0 18px 14px; border-top: 0; margin-top: 4px; }
  .k { border: 1px solid #EEF0F4 !important; border-left: 4px solid var(--k) !important; border-radius: 12px; padding: 8px 12px !important; background: #FAFBFA; }
  .k b { font-family: inherit; font-weight: 800; } .k.pk { background: #F0F8F2; } .k.pk b { text-decoration: none; }
  th { background: #E7F4EA; color: #1B5E20; border-bottom: 2px solid #3FA45B; font-weight: 800; }
  tfoot td { background: #1F6F43 !important; padding-top: 10px; padding-bottom: 10px; color: #fff; border-top: 0; } tfoot .gv { color: #FFE08A; } tfoot .ir { color: #CFE8FF; }
  tr.rd td { background: #FAFCFA !important; } .rmap { border-left-color: #3FA45B; } .rcap { color: #1B6B38; }
  .pf .pno { color: #1B6B38; }
  /* TNR cards */
  .cw { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
  .cc { border: 1px solid #E5EAE5; border-radius: 14px; padding: 10px 12px; background: #fff; display: flex; flex-direction: column; gap: 7px; }
  .cch { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
  .ccn { width: 22px; height: 22px; border-radius: 50%; background: #1B6B38; color: #fff; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; align-self: center; }
  .cch .tnr { font-size: 14px; } .cct { font-weight: 800; color: #1F2937; font-size: 12.5px; } .ccb { margin-left: auto; font-size: 11px; color: #4B5563; } .ccb b { color: #1F2937; }
  .ctl { display: grid; grid-template-columns: repeat(6, 1fr); gap: 7px; }
  .ct1 { border: 1px solid #EEF0F4; border-radius: 10px; padding: 6px 9px; } .ct1 span { display: block; font-size: 9.5px; color: #6B7280; font-weight: 700; } .ct1 b { display: block; font-size: 15px; font-weight: 800; } .ct1 em { display: block; font-style: normal; font-size: 9px; color: #9CA3AF; }
  .rbh { margin: 0; padding: 5px 10px; border-radius: 8px; background: #F5F3FF; color: #5B21B6; font-size: 10.5px; font-weight: 600; }
  .ctr { border: 1px solid #EEF0F4; border-radius: 10px; overflow: hidden; }
  .ctrh { display: flex; align-items: baseline; gap: 6px; padding: 5px 10px; font-size: 11px; } .ctrh span { color: #9CA3AF; } .ctrh em { margin-left: auto; font-style: normal; color: #6B7280; font-size: 10px; }
  table.kt { width: 100%; border-collapse: collapse; table-layout: fixed; }
  table.kt th { background: #E7F4EA; color: #1B5E20; font-size: 9.5px; font-weight: 800; padding: 4px 8px; border: 0; border-radius: 0 !important; text-align: left; }
  table.kt td { padding: 4px 8px; font-size: 10.5px; border-bottom: 1px solid #F1F3F1; vertical-align: middle; background: #fff !important; }
  table.kt td b { font-size: 11px; } table.kt .sm { font-size: 9.5px; }
  .cc .tp i { font-style: normal; color: #fff; border-radius: 999px; padding: 0 5px; font-size: 9px; }
  .cc .rmap { margin-top: 0; } .cc .rr { padding: 2px 0; }
  .cc { padding: 8px 10px; gap: 5px; } .cw { gap: 8px; margin-top: 8px; }
  .ct1 { padding: 4px 8px; } .ct1 b { font-size: 13.5px; } .ct1 em { display: none; }
  .ctrh { padding: 3px 10px; } table.kt td { padding: 2px 8px; } table.kt th { padding: 3px 8px; }
  .cc .rmap { padding-left: 8px; } .cc .rcap { margin-bottom: 0; } .cc .rs2 { font-size: 9px; line-height: 1.2; } .cc .rs2 b { font-size: 9.5px; }
  .cc .rd2 { width: 15px; height: 15px; font-size: 8px; margin-bottom: 2px; } .cc .rl { top: 7px; }
  .ord { display: inline-block; padding: 1px 6px; border-radius: 6px; background: #E7F4EA; color: #1B6B38; font-weight: 800; font-size: 10px; }
  .cat { display: inline-block; padding: 1px 8px; border-radius: 999px; font-size: 9.5px; font-weight: 700; } .cat.f { background: #E6F6F4; color: #0F766E; } .cat.a { background: #FEF5E7; color: #B45309; }
  .tp { display: inline-block; padding: 0 6px 0 2px; border-radius: 999px; font-size: 9.5px; font-weight: 700; }
  /* table page: 2 TNR fill the page */
  .tpg .tw { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
  .tpg.two table { height: 100%; }
  .tpg.two tbody tr:not(.rd) td { padding-top: 14px; padding-bottom: 14px; font-size: 12.5px; }
  .tpg.two .tn { font-size: 13.5px; } .tpg.two .tnr { font-size: 14px; } .tpg.two .tv b { font-size: 12.5px; } .tpg.two .sm { font-size: 11px; }
  .tpg.two tr.rd td { vertical-align: middle; padding: 10px 10px 14px; }
  .tpg.two .rcap { font-size: 10.5px; margin-bottom: 8px; }
  .tpg.two .rr { padding: 8px 0 10px; }
  .tpg.two .rs2 { font-size: 11px; line-height: 1.35; } .tpg.two .rs2 b { font-size: 12px; }
  .tpg.two .rd2 { width: 26px; height: 26px; font-size: 11px; margin-bottom: 6px; } .tpg.two .rl { top: 12px; height: 3px; }
  .tpg.two .rs2 i { font-size: 10.5px; padding: 1px 8px; margin-top: 4px; }
  /* summary v4 */
  .kp { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 12px; margin-top: 14px; }
  .kpc { position: relative; display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto auto; column-gap: 12px; align-items: center; padding: 12px 14px; border-radius: 14px; background: #fff; border: 1px solid #E8ECE8; box-shadow: 0 2px 8px rgba(16,24,40,.05); overflow: hidden; }
  .kpc::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 4px; background: var(--c); }
  .kpi { grid-row: span 2; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 19px; background: color-mix(in srgb, var(--c) 12%, #fff); border: 2px solid color-mix(in srgb, var(--c) 30%, #fff); }
  .kpl { font-size: 11px; color: #6B7280; font-weight: 700; } .kpv { font-size: 24px; font-weight: 800; color: var(--c); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sb { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
  .g2 { flex: 1 1 0; min-height: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; } .g1 { flex: 1 1 0; min-height: 0; display: grid; }
  .pn { min-height: 0; border: 1px solid #E8ECE8; border-radius: 16px; padding: 12px 16px; background: linear-gradient(180deg, #FFFFFF, #F9FBF9); display: flex; flex-direction: column; }
  .pnh { display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 800; color: #1F2937; margin-bottom: 8px; } .pnh em { margin-left: auto; font-style: normal; font-size: 11px; color: #9CA3AF; font-weight: 600; }
  .pnd { width: 8px; height: 8px; border-radius: 50%; }
  .big { font-size: 32px; font-weight: 900; color: #14432A; line-height: 1.05; } .big span { display: block; font-size: 11px; font-weight: 600; color: #6B7280; }
  .stk { display: flex; height: 12px; border-radius: 999px; overflow: hidden; background: #EEF1EE; margin: 10px 0 8px; } .stk i { display: block; height: 100%; }
  .mrow { display: grid; grid-template-columns: 1fr auto 52px; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px dashed #E5E9E5; font-size: 12.5px; }
  .mrow span { display: flex; align-items: center; gap: 8px; color: #374151; font-weight: 600; } .mrow span i { width: 10px; height: 10px; border-radius: 3px; } .mrow b { font-size: 16px; } .mrow em { font-style: normal; text-align: right; color: #6B7280; font-weight: 700; }
  .cap3 { margin: 0; font-size: 11px; color: #6B7280; font-weight: 700; }
  .gchips { display: flex; gap: 14px; font-size: 12px; color: #374151; } .gchips span { display: inline-flex; align-items: center; gap: 6px; } .gchips i { width: 10px; height: 10px; border-radius: 50%; } .gchips b { font-size: 15px; }
  .tbr { display: grid; grid-template-columns: 140px 1fr 34px 54px; align-items: center; gap: 10px; padding: 4px 0; font-size: 12px; }
  .tbl { font-weight: 700; color: #1F2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .tbl em { font-style: normal; color: #9CA3AF; font-weight: 600; }
  .tbt { height: 10px; border-radius: 999px; background: #EEF1EE; overflow: hidden; } .tbt i { display: block; height: 100%; border-radius: 999px; }
  .tbr b { text-align: right; font-size: 14px; } .tbn { color: #9CA3AF; font-size: 10.5px; text-align: right; }
  @media print {
    body { background: #fff; } .bar { display: none; }
    .page { margin: 0; box-shadow: none; page-break-after: always; break-after: page; }
    .page:last-child { page-break-after: auto; break-after: auto; }
  }
</style></head><body>
  <div class="bar"><button onclick="window.print()">Save as PDF</button><button class="sec" onclick="window.close()">Close</button><span class="hint">⚠️ In the print box, set <b>Orientation → Landscape</b> before saving</span></div>
  ${summary}${chartPages.join("")}<div id="tpages"></div>${tableData}
  <script>
    (function () {
      var holder = document.getElementById("tpages"), cards = Array.prototype.slice.call(document.getElementById("trows").content.children);
      function np() { var p = document.getElementById("tpl").content.firstElementChild.cloneNode(true); holder.appendChild(p); return p; }
      function over(p) { return p.scrollHeight > p.clientHeight + 1; }
      var pg = np(), w = pg.querySelector(".cw"), n = 0;
      cards.forEach(function (c) {
        if (n >= 2) { pg = np(); w = pg.querySelector(".cw"); n = 0; }
        w.appendChild(c); n++;
        if (n > 1 && over(pg)) { w.removeChild(c); pg = np(); w = pg.querySelector(".cw"); w.appendChild(c); n = 1; }
      });
      var ps = document.querySelectorAll(".page");
      ps.forEach(function (p, i) { var x = p.querySelector(".pno"); if (x) x.textContent = "Page " + (i + 1) + " of " + ps.length + (i === ps.length - 1 ? " · End of Report" : ""); });
      setTimeout(function () { try { window.print(); } catch (e) {} }, 500);
    })();
  </script>
</body></html>`;
}

// ─── Road map — Booked → Advance paid → Balance paid → 1st cancel → 2nd cancel (date order) ───
const roadSteps = (g) => {
  const a = g.owner?.amounts || {};
  const steps = [];
  steps.push({ key: "book", kind: "book", title: "Booked", date: g.head.bookingDate, sub: g.tnr });
  if (a.advancePaid) steps.push({ key: "adv", kind: "adv", title: "Advance paid", date: a.advancePaidAt, sub: inr(a.advance) });
  else steps.push({ key: "adv", kind: "due", title: "Advance due", date: null, sub: inr(a.advance) });
  const refundBal = Number(a.refund) > 0 && Math.abs(Number(a.refund) - Number(a.balance || 0)) < 0.5;
  if (a.balancePaid) steps.push({ key: "bal", kind: refundBal ? "refund" : "bal", title: refundBal ? "Balance = refund" : "Balance paid", date: a.balancePaidAt, sub: inr(a.balance) });
  const seen = new Set();
  g.kids.forEach((k) => {
    const id = `${k.seq || 1}`;
    if (seen.has(id)) return;
    seen.add(id);
    const same = g.kids.filter((x) => `${x.seq || 1}` === id);
    const names = same.flatMap((x) => x.travellers.map((t) => t.name)).filter(Boolean);
    steps.push({ key: `c${id}`, kind: "cancel", title: `${ORD(k.seq || 1)} cancellation`, date: k.approvedOn, sub: names.join(", "), tier: k.tier });
  });
  if (!a.balancePaid && Number(a.balance) > 0) steps.push({ key: "bal", kind: "due", title: "Balance pending", date: null, sub: inr(a.balance) });
  // date order; date illaadhadhu munnadi step kitta
  let last = 0;
  const withT = steps.map((st, i) => {
    const t = st.date ? new Date(st.date).getTime() : NaN;
    if (!Number.isNaN(t)) last = t;
    return { ...st, t: Number.isNaN(t) ? last + 0.5 : t, i };
  });
  return withT.sort((x, y) => (x.t - y.t) || (x.i - y.i));
};
// Backend la irundhu full event list (booking la nadandha ellaam) — illana pazhaya simple road map
const roadOf = (g) => {
  const evs = g.head?.events;
  if (!Array.isArray(evs) || !evs.length) return roadSteps(g);
  return evs.map((e, i) => ({
    key: `${e.kind}-${i}`,
    kind: e.kind,
    title: e.title,
    date: e.date,
    sub: [e.sub, e.refund ? `Refund ${inr(e.refund)}` : ""].filter(Boolean).join(" · "),
    tier: e.tier || null,
  }));
};
const ROAD = {
  info: ["#64748B", "#CBD5E1", BadgeCheck],
  remark: ["#D97706", "#FCD34D", MessageSquare],
  req: ["#EA580C", "#FDBA74", Clock],
  trip: ["#B45309", "#FCD34D", TrainFront],
  book: ["#4F46E5", "#A5B4FC", Ticket],
  adv: ["#0D9488", "#5EEAD4", Wallet],
  bal: ["#059669", "#6EE7B7", IndianRupee],
  refund: ["#7C3AED", "#C4B5FD", IndianRupee],
  due: ["#94A3B8", "#E2E8F0", Wallet],
  cancel: ["#E11D48", "#FDA4AF", X],
};
const RoadMap = ({ g }) => {
  const steps = roadOf(g);
  return (
    <div className="mt-3 rounded-xl bg-white p-3 ring-1 ring-inset ring-[#EEF0F4]">
      <p className="mb-2 flex items-center justify-between text-[11px] font-semibold text-[#5B6280]">
        <span>Booking road map</span><span className="font-normal text-[#9AA0B8]">{steps.length} steps, in date order</span>
      </p>
      <div>
      <ol className="flex flex-col gap-3 xl:grid xl:grid-cols-6 xl:gap-x-0 xl:gap-y-4">
        {steps.map((st, i) => {
          const [c1, c2, I] = ROAD[st.kind] || ROAD.book;
          const tc = st.tier && !isSpecialTier(st.tier) ? TIER_GRAD(st.tier.percentage) : null;
          return (
            <li key={st.key} className="relative flex min-w-0 flex-1 gap-2.5 xl:flex-col xl:items-center xl:gap-1.5 xl:px-1 xl:text-center">
              {i < steps.length - 1 && <span className={`absolute left-[13px] top-7 h-[calc(100%-4px)] w-0.5 xl:left-1/2 xl:top-[13px] xl:h-0.5 xl:w-full ${i % 6 === 5 ? "xl:hidden" : ""}`} style={{ background: `linear-gradient(90deg, ${c1}55, ${(ROAD[steps[i + 1].kind] || ROAD.book)[0]}55)` }} />}
              <span className="relative z-[1] flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ring-4 ring-white" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                <I className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 xl:w-full">
                <span className="block text-[11.5px] font-bold" style={{ color: c1 }}>{st.title}</span>
                <span className="block text-[10.5px] text-[#5B6280]">{st.date ? fmtDate(st.date) : st.kind === "due" ? "Not paid" : "Date not saved"}</span>
                {st.sub && <span className="block break-words text-[10.5px] leading-snug text-[#9AA0B8] xl:line-clamp-3" title={st.sub}>{st.sub}</span>}
                {st.tier && <span className="mt-0.5 inline-block rounded-full px-1.5 text-[10px] font-bold" style={{ background: `${(tc || ["#64748B"])[0]}14`, color: (tc || ["#64748B"])[0] }}>{st.tier.label}{tc ? ` · ${st.tier.percentage}%` : ""}</span>}
              </span>
            </li>
          );
        })}
      </ol>
      </div>
    </div>
  );
};

// ─── Amount strip — horizontal (expand la), tour booking la irundhu ───
const AmountStrip = ({ r }) => {
  const a = r.amounts || {};
  const paid = netPaidOf(r);
  const gv = Number(a.gv) || 0;
  const ir = Number(a.irctc) || 0;
  const base = Math.max(paid, gv + ir, 1);
  const rb = refundIsBalance(r);
  const tiles = [
    ["Advance", inr(a.advance), "#0F766E", "from-[#E6F6F4] to-white", a.advancePaid ? "Paid" : "Not paid"],
    ["Balance", inr(a.balance), rb ? "#6D28D9" : "#047857", rb ? "from-[#F3EEFE] to-white" : "from-[#E8F7F1] to-white", rb ? "Same as refund" : a.balancePaid ? "Paid" : "Pending"],
    ["GV cancellation", inr(gv), "#B45309", "from-[#FEF5E7] to-white", "incl. remarks"],
    ["IRCTC cancellation", inr(ir), "#0369A1", "from-[#E8F4FB] to-white", ""],
    ["Total cancellation", inr(a.total), "#BE123C", "from-[#FDECF0] to-white", "GV + IRCTC"],
    ["Refund", inr(a.refund), rb ? "#6D28D9" : "#047857", rb ? "from-[#F3EEFE] to-white" : "from-[#E8F7F1] to-white", "Last approved cancellation"],
  ];
  return (
    <div className="rounded-xl bg-white p-3 ring-1 ring-inset ring-[#EEF0F4]">
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-6">
        {tiles.map(([l, v, c, bg, sub]) => (
          <div key={l} className={`min-w-0 rounded-lg bg-gradient-to-b ${bg} px-3 py-2 ring-1 ring-inset ring-[#EEF0F4]`}>
            <p className="truncate text-[10.5px] text-[#5B6280]">{l}</p>
            <p className="truncate text-[15px] font-extrabold tabular-nums" style={{ color: c }}>{v}</p>
            {sub && <p className="truncate text-[10px] text-[#9AA0B8]">{sub}</p>}
          </div>
        ))}
      </div>
      {rb && (
        <p className="mt-2 flex items-start gap-2 rounded-lg bg-[#F5F3FF] px-3 py-2 text-[11.5px] text-[#5B21B6]">
          <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full bg-[#7C3AED]" />
          The balance on this tour booking is the refund amount. Refund {inr(a.refund)} to the customer, do not collect it.
        </p>
      )}
    </div>
  );
};

// ─── Amount card — tour booking la irundhu, TNR ku ore card (table + expand rendulayum) ───
const AmountCard = ({ r, filtered }) => {
  const paid = netPaidOf(r);
  const gv = Number(r.amounts.gv) || 0;
  const ir = Number(r.amounts.irctc) || 0;
  const base = Math.max(paid, gv + ir, 1);
  return (
    <div className="overflow-hidden rounded-xl border border-[#E3E6F0] bg-white">
      <div className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] px-4 py-3.5 text-white">
        <p className="text-[11px] opacity-80">Total cancellation · tour booking</p>
        <p className="text-2xl font-extrabold tabular-nums">{inr(r.amounts.total)}</p>
        <p className="mt-1 flex flex-wrap gap-1.5 text-[10.5px]">
          <span className="rounded-full bg-white/20 px-2 py-0.5">Advance {inr(r.amounts.advance)} · {r.amounts.advancePaid ? "Paid" : "Not paid"}</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5">Balance {inr(r.amounts.balance)} · {r.amounts.balancePaid ? "Paid" : "Pending"}</span>
        </p>
      </div>
      <div className="space-y-3 p-4 text-[12.5px]">
                <div className="space-y-1.5">
          <p className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-[#5B6280]"><span className="h-2.5 w-2.5 rounded-sm bg-[#F59E0B]" />GV cancellation <span className="text-[10.5px] text-[#9AA0B8]">(incl. remarks)</span></span><b className="tabular-nums text-[#B45309]">{inr(gv)}</b></p>
          <p className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-[#5B6280]"><span className="h-2.5 w-2.5 rounded-sm bg-[#0EA5E9]" />IRCTC cancellation</span><b className="tabular-nums text-[#0369A1]">{inr(ir)}</b></p>
          <p className="flex items-center justify-between gap-2 border-t border-dashed border-[#E3E6F0] pt-1.5"><span className="font-semibold text-[#1D2340]">Total cancellation <span className="text-[10.5px] font-normal text-[#9AA0B8]">(whole TNR)</span></span><b className="tabular-nums text-[#BE123C]">{inr(r.amounts.total)}</b></p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className={`rounded-lg px-3 py-2 ${refundIsBalance(r) ? "bg-[#F5F3FF] ring-2 ring-inset ring-[#A78BFA]" : "bg-[#F5F6FA]"}`} title="Current balance on the tour booking">
            <p className="text-[10.5px] text-[#5B6280]">Balance (tour booking)</p>
            <p className="flex flex-wrap items-center gap-1.5 text-[15px] font-bold tabular-nums text-[#1D2340]">
              {inr(r.amounts.updatedBalance)}
              {r.amounts.updatedBalance > 0 && !refundIsBalance(r) && (
                <span className={`rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase ${r.amounts.balancePaid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{r.amounts.balancePaid ? "Paid" : "Pending"}</span>
              )}
            </p>
          </div>
          <div className={`rounded-lg px-3 py-2 text-white ${refundIsBalance(r) ? "bg-gradient-to-br from-[#7C3AED] to-[#A78BFA]" : "bg-gradient-to-br from-[#059669] to-[#34D399]"}`}>
            <p className="text-[10.5px] opacity-90" title="From the last approved cancellation on this TNR">Refund</p>
            <p className="text-[15px] font-bold tabular-nums">{inr(r.amounts.refund)}</p>
          </div>
        </div>
        {refundIsBalance(r) && (
          <p className="flex items-start gap-2 rounded-lg bg-[#F5F3FF] px-3 py-2 text-[11px] leading-snug text-[#5B21B6]">
            <span className="mt-[3px] h-2 w-2 shrink-0 rounded-full bg-[#7C3AED]" />
            <span>The balance on this tour booking is the refund amount. Refund {inr(r.amounts.refund)} to the customer, do not collect it.</span>
          </p>
        )}
      </div>
    </div>
  );
};

const CancellationAnalytics = () => {
  const { aToken, backendUrl } = useContext(TourAdminContext);
  const [rows, setRows] = useState(null);
  const [tiers, setTiers] = useState({ advance: [], full: [] });
  const [salesCheck, setSalesCheck] = useState(null); // Sales Dashboard total (cross-check)
  const [allTours, setAllTours] = useState([]); // ellaa tours um (filter ku)
  const [loading, setLoading] = useState(false);

  // ─── Filters ───
  const [cat, setCat] = useState("advance");
  const [preset, setPreset] = useState("all");
  const [[from, to], setRange] = useState(["", ""]);
  const [year, setYear] = useState([]); // multi-select — ellaam array
  const [month, setMonth] = useState([]);
  const [gender, setGender] = useState([]);
  const [tier, setTier] = useState([]);
  const [q, setQ] = useState("");
  const [selTours, setSelTours] = useState([]); // [{ id, name }]
  const [tourQ, setTourQ] = useState("");
  const [tourDrop, setTourDrop] = useState(false);
  const [openId, setOpenId] = useState(null);
  const dropRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/touradmin/cancellation-analytics`, { headers: { aToken } });
      if (!data?.success) throw new Error(data?.message || "Failed to load");
      setRows(data.data || []);
      setTiers(data.tiers || { advance: [], full: [] });
      setSalesCheck(data.salesCheck || null);
      if (data.tours?.length) setAllTours(data.tours);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Could not load cancellation data");
      setRows((r) => r || []);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, aToken]);
  useEffect(() => { load(); }, [load]);

  // Ellaa tours um — Tours List page use panra adhe API (/api/touradmin/all-tours)
  // Create panna ellaa tours um varum (advance / booking / cancellation paakkaadhu)
  useEffect(() => {
    axios
      .post(`${backendUrl}/api/touradmin/all-tours`, {}, { headers: { aToken } })
      .then(({ data }) => {
        const list = (data?.tours || [])
          .map((t) => ({ id: String(t._id), name: t.title || "Unnamed tour" }))
          .sort((a, b) => (a.id < b.id ? 1 : -1)); // pudhu tour mela
        if (list.length) setAllTours(list);
      })
      .catch((err) => console.error("all-tours error:", err));
  }, [backendUrl, aToken]);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setTourDrop(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  useEffect(() => {
    setOpenId(null);
    // Advance / Fully paid tab ku pona "full|key" → "key" (tab maarinaalum filter apdiye)
    if (cat !== "all") setTier((p) => (p.some((v) => v.includes("|")) ? [...new Set(p.filter((v) => !v.includes("|") || v.startsWith(`${cat}|`)).map((v) => v.split("|").pop()))] : p));
  }, [cat]);

  const all = rows || [];
  // Tour list — ellaa tours um (backend la irundhu) + data la mattum irukura tour (delete aanadhu)
  const tourOptions = useMemo(() => {
    const m = new Map(allTours.map((t) => [t.id, t.name]));
    all.forEach((r) => { if (r.tourId && !m.has(r.tourId)) m.set(r.tourId, r.tourName || "Unnamed tour"); });
    return [...m].map(([id, name]) => ({ id, name })); // backend order (pudhu tour mela)
  }, [all, allTours]);
  const tourMatches = useMemo(() => {
    const t = tourQ.trim().toLowerCase();
    return tourOptions.filter((o) => !selTours.some((s) => s.id === o.id) && (!t || o.name.toLowerCase().includes(t)));
  }, [tourOptions, tourQ, selTours]);
  const years = useMemo(() => [...new Set(all.map((r) => new Date(r.approvedOn).getFullYear()).filter(Boolean))].sort((a, b) => b - a), [all]);

  // Gender filter — traveller level
  const travOf = useCallback((r) => (gender.length ? r.travellers.filter((t) => gender.includes(normG(t.gender))) : r.travellers), [gender]);

  // Category + ellaa filter um (tier thavira — tier card / chart ku)
  // Ellaa filter um (tab / tier thavira) — oru row pass aagudhaa
  const passes = useMemo(() => {
    const term = q.trim().toLowerCase();
    const digits = term.replace(/\D/g, "");
    const tourIds = new Set(selTours.map((s) => s.id));
    return (r) => {
      const d = dayOf(r.approvedOn);
      if (from && d < from) return false;
      if (to && d > to) return false;
      const dt = new Date(r.approvedOn);
      if (year.length && !year.includes(dt.getFullYear())) return false;
      if (month.length && !month.includes(dt.getMonth() + 1)) return false;
      if (tourIds.size && !tourIds.has(r.tourId)) return false;
      if (gender.length && !r.travellers.some((t) => gender.includes(normG(t.gender)))) return false;
      if (term) {
        const hay = [r.tnr, r.contact.name, byLabel(r.bookedBy), r.contact.email, r.contact.mobile, r.tourName, ...r.travellers.map((t) => t.name)].join(" ").toLowerCase();
        const phoneHit = digits.length >= 4 && String(r.contact.mobile || "").replace(/\D/g, "").includes(digits);
        if (!hay.includes(term) && !phoneHit) return false;
      }
      return true;
    };
  }, [from, to, year, month, selTours, gender, q]);
  const base = useMemo(() => all.filter((r) => (cat === "all" || r.category === cat) && passes(r)), [all, cat, passes]);
  // Indha tab la illaama matha tab la match aagura travellers (hint ku)
  const otherTab = useMemo(() => {
    if (cat === "all") return null;
    const rows2 = all.filter((r) => r.category !== cat && passes(r) && (!tier.length || tiersOf(r).some((t) => tierHit(r, t, tier))));
    if (!rows2.length) return null;
    const trav = rows2.reduce((a, r) => a + travOf(r).length, 0);
    return { key: rows2[0].category, trav, tnrs: new Set(rows2.map((r) => r.tnr)).size };
  }, [all, cat, passes, tier, travOf]);
  const list = useMemo(() => (tier.length ? base.filter((r) => tiersOf(r).some((t) => tierHit(r, t, tier))) : base), [base, tier]);

  // ─── Stats ───
  const sum = (arr, f) => arr.reduce((s, x) => s + (Number(f(x)) || 0), 0);
  const buildTierStats = useCallback((rowsSub, tierList) => {
    const m = new Map((tierList || []).map((t) => [t.key, { ...t, tnr: 0, trav: 0 }]));
    rowsSub.forEach((r) => {
      const seen = new Set();
      travOf(r).forEach((t) => {
        const tt = tierOfT(r, t);
        if (!tt) return;
        if (!m.has(tt.key)) m.set(tt.key, { ...tt, tnr: 0, trav: 0 });
        const st = m.get(tt.key);
        st.trav += 1;
        if (!seen.has(tt.key)) { seen.add(tt.key); st.tnr += 1; }
      });
      if (seen.size || !r.tier) return;
      if (!m.has(r.tier.key)) m.set(r.tier.key, { ...r.tier, tnr: 0, trav: 0 });
      const s2 = m.get(r.tier.key);
      s2.tnr += 1;
      s2.trav += travOf(r).length || r.travellerCount;
    });
    return [...m.values()].sort((x, y) => (x.fromDays ?? 0) - (y.fromDays ?? 0));
  }, [travOf]);
  const tierStats = useMemo(
    () => buildTierStats(base, cat === "all" ? [...(tiers.advance || []), ...(tiers.full || [])] : tiers[cat] || []),
    [base, tiers, cat, buildTierStats],
  );
  // Both tab la — Advance only / Fully paid tiers thaniya thaniya (rendu rule um vera vera %)
  const tierStatsSplit = useMemo(() => (cat !== "all" ? null : {
    advance: buildTierStats(base.filter((r) => r.category === "advance"), tiers.advance || []),
    full: buildTierStats(base.filter((r) => r.category === "full"), tiers.full || []),
  }), [base, tiers, cat, buildTierStats]);
  // Most cancelled tier — "Trip cancelled" / "No cancellation record" ah count pannaadhu
  const topTier = tierStats
    .filter((t) => t.key !== "trip" && t.key !== "norecord" && (!tier.length || selHasKey(tier, t.key)))
    .reduce((b, t) => (t.trav > (b?.trav || 0) ? t : b), null);
  // Sales Dashboard maadhiri — trip cancelled travellers thaniya (Cancelled la serkaadhu)
  // Sales Dashboard maadhiri — trip cancelled travellers thaniya
  const properOf = useCallback((r) => travOf(r).filter((t) => !isTripT(r, t)), [travOf]);
  const properList = list.filter((r) => r.tier?.key !== "trip" || properOf(r).length);
  const travTotal = sum(list, (r) => properOf(r).length);
  const tripTrav = sum(list, (r) => travOf(r).filter((t) => isTripT(r, t)).length);
  const catCount = (k) => (k === "all" ? all.length : all.filter((r) => r.category === k).length);

  // ─── Filter helpers ───
  const filtersOn = preset !== "all" || from || to || year.length || month.length || gender.length || tier.length || q || selTours.length;
  const clearFilters = () => {
    setPreset("all"); setRange(["", ""]); setYear([]); setMonth([]);
    setGender([]); setTier([]); setQ(""); setSelTours([]); setTourQ("");
  };
  const addTours = (arr) => { setSelTours((p) => [...p, ...arr.filter((o) => !p.some((s) => s.id === o.id))]); setTourQ(""); setTourDrop(false); };
  const fieldCls = "h-9 w-full rounded-lg border border-[#DDE0EC] bg-white px-3 text-sm text-[#1D2340] outline-none transition focus:border-[#F08A24] focus:ring-2 focus:ring-[#F08A24]/15";

  // ─── Expand — booking la ELLAA travellers um, cancel aanavanga highlight ───
  const Details = ({ r, noAmount, noTimeline }) => {
    const mine = new Set(r.travellers.map((t) => t.id));
    const people = (r.allTravellers && r.allTravellers.length ? r.allTravellers : r.travellers).map((t) => ({
      ...t,
      st: mine.has(t.id) ? (isTripT(r, r.travellers.find((x) => x.id === t.id)) ? "trip" : "this") : t.status || "active",
    }));
    const cancelledCount = people.filter((p) => p.st === "this" || p.st === "cancelled" || p.st === "trip").length;
    const SHARE = { double: "Double", triple: "Triple", withBerth: "Child, berth", withoutBerth: "Child, no berth" };
    const initials = (n) => String(n || "?").replace(/^(mr|mrs|ms|miss|master|dr)\.?\s+/i, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
    const AV = { this: "from-[#E11D48] to-[#FB7185]", cancelled: "from-[#EA580C] to-[#FDBA74]", trip: "from-[#D97706] to-[#FCD34D]", requested: "from-[#7C3AED] to-[#C4B5FD]", active: "from-[#059669] to-[#6EE7B7]" };
    const tg = isSpecialTier(r.tier) ? ["#64748B", "#CBD5E1"] : TIER_GRAD(r.tier?.percentage);
    return (
      <div className={`grid grid-cols-1 gap-4 text-sm ${noAmount ? "" : "lg:grid-cols-[minmax(0,1fr)_340px]"}`} onClick={(e) => e.stopPropagation()}>
        <div className="min-w-0 space-y-3">
          {/* Travellers */}
          <div className="rounded-xl border border-[#E3E6F0] bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h4 className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-[#1D2340]">
                <Users className="h-4 w-4 text-[#6366F1]" /> Travellers in this booking
                <span className="rounded-full bg-[#F1F2F8] px-2 py-0.5 text-[11px] font-bold text-[#5B6280]">{people.length}</span>
                <span className="whitespace-nowrap rounded-full bg-[#FFE4E6] px-2 py-0.5 text-[11px] font-bold text-[#BE123C]">{cancelledCount} cancelled</span>
              </h4>
              <span className="text-[11px] text-[#9AA0B8]">Red card = cancelled in this request</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 2xl:grid-cols-3">
              {people.map((t, i) => {
                const st = TSTATUS[t.st] || TSTATUS.active;
                const hit = t.st === "this";
                return (
                  <div key={t.id || i}
                    className={`relative flex items-center gap-3 overflow-hidden rounded-xl border p-3 transition ${hit ? "border-[#FDA4AF] bg-gradient-to-r from-[#FFF1F2] to-white" : t.st === "trip" ? "border-[#FDE68A] bg-[#FFFBEB]" : "border-[#EEF0F4] bg-[#FAFAFC]"} ${gender.length && !gender.includes(normG(t.gender)) ? "opacity-50" : ""}`}>
                    {hit && <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#E11D48] to-[#FB7185]" />}
                    <span className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[13px] font-bold text-white ${AV[t.st] || AV.active}`}>
                      {initials(t.name)}
                      {hit && <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[#E11D48] ring-1 ring-[#FDA4AF]"><X className="h-3 w-3" strokeWidth={3} /></span>}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[13px] font-semibold ${hit ? "text-[#BE123C]" : "text-[#1D2340]"}`} title={t.name}>{t.name || "—"}</span>
                      <span className="block truncate text-[11px] text-[#5B6280]">
                        {[t.age ? `${t.age} yrs` : "", t.gender, SHARE[t.sharingType] || t.sharingType].filter(Boolean).join(" · ") || "—"}
                      </span>
                      {hit && tiersOf(r).length > 1 && (() => {
                        const own = r.travellers.find((x) => x.id === t.id);
                        const tt = tierOfT(r, own);
                        return tt ? (
                          <span className="mt-1 block text-[10.5px] text-[#5B6280]">
                            <TierPill tier={tt} />{own?.cancelledOn ? <span className="ml-1.5">{fmtDate(own.cancelledOn)}</span> : null}
                          </span>
                        ) : null;
                      })()}
                    </span>
                    <span className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-semibold ring-1 ring-inset ${st[1]}`}>{st[0]}</span>
                  </div>
                );
              })}
              {!people.length && <p className="py-4 text-center text-xs text-[#9AA0B8] sm:col-span-2">Traveller details not found on this booking</p>}
            </div>
          </div>

          {/* Booking info + journey */}
          <div className={`grid grid-cols-1 gap-3 ${noTimeline ? "" : "md:grid-cols-2"}`}>
            <div className="rounded-xl border border-[#E3E6F0] bg-white p-4">
              <h4 className="mb-2.5 text-[13px] font-semibold text-[#1D2340]">Booking head</h4>
              <div className="space-y-2 text-[12.5px]">
                {[[User, r.contact.name, "#6366F1"], [Phone, r.contact.mobile, "#059669"], [Mail, r.contact.email, "#0284C7"]].map(([I, v, c], k) => (
                  <p key={k} className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: `${c}14`, color: c }}><I className="h-3.5 w-3.5" /></span>
                    <span className={`truncate ${k === 0 ? "font-semibold text-[#1D2340]" : "text-[#5B6280]"} ${k === 2 ? "lowercase" : ""}`} title={v || ""}>{v || "—"}</span>
                  </p>
                ))}
              </div>
              {r.bookedBy && (
                <div className="mt-3 flex items-start gap-2.5 rounded-lg bg-[#F5F6FA] p-2.5 text-[12px]">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#4F46E5]"><Upload className="h-3.5 w-3.5" /></span>
                  <span className="min-w-0">
                    <span className="block text-[11px] text-[#9AA0B8]">Booking uploaded by</span>
                    <span className="flex flex-wrap items-center gap-1.5">
                      <b className={r.bookedBy.unknown ? "italic text-[#9AA0B8]" : "text-[#1D2340]"}>{byName(r.bookedBy) || (BY_TAG[r.bookedBy.type] || BY_TAG.admin)[0]}</b>
                      <span className={`rounded px-1.5 text-[9.5px] font-bold uppercase tracking-wide ring-1 ring-inset ${(BY_TAG[r.bookedBy.type] || BY_TAG.admin)[1]}`}>{(BY_TAG[r.bookedBy.type] || BY_TAG.admin)[0]}</span>
                    </span>
                    {(r.bookedBy.employeeId || r.bookedBy.role || r.bookedBy.at) && (
                      <span className="block text-[11px] text-[#5B6280]">
                        {[r.bookedBy.employeeId, r.bookedBy.role, r.bookedBy.at ? new Date(r.bookedBy.at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : ""].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
            {!noTimeline && <div className="rounded-xl border border-[#E3E6F0] bg-white p-4">
              <h4 className="mb-3 text-[13px] font-semibold text-[#1D2340]">Timeline</h4>
              <ol className="relative ml-1.5 space-y-3 border-l-2 border-dashed border-[#E3E6F0] pl-4 text-[12px]">
                <li className="relative">
                  <span className="absolute -left-[23px] top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#6366F1] ring-2 ring-[#E0E7FF]" />
                  <span className="text-[#9AA0B8]">Booked</span> <b className="text-[#1D2340]">{fmtDate(r.bookingDate)}</b>
                </li>
                <li className="relative">
                  <span className="absolute -left-[23px] top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#E11D48] ring-2 ring-[#FFE4E6]" />
                  <span className="text-[#9AA0B8]">Cancel approved</span> <b className="text-[#1D2340]">{fmtDate(r.approvedOn)}</b>
                  {r.decidedBy?.name && <span className="block text-[11px] text-[#9AA0B8]">by {r.decidedBy.name}</span>}
                </li>
                <li className="relative">
                  <span className="absolute -left-[23px] top-0.5 h-3 w-3 rounded-full border-2 border-white ring-2 ring-[#F1F2F8]" style={{ background: tg[0] }} />
                  <span className="text-[#9AA0B8]">Tour starts</span>{" "}
                  <b style={{ color: tg[0] }}>{isSpecialTier(r.tier) ? r.tier?.label : `${r.noOfDays} days later`}</b>
                  {!isSpecialTier(r.tier) && <span className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10.5px] font-bold text-white" style={{ background: `linear-gradient(90deg, ${tg[0]}, ${tg[1]})` }}>{r.tier?.label} · {r.tier?.percentage}%</span>}
                </li>
              </ol>
            </div>}
          </div>
          {r.remarkText && (
            <p className="flex items-start gap-2 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-2.5 text-[12px] text-[#92400E]">
              <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" /> <span><b>Remark:</b> {r.remarkText}</span>
            </p>
          )}
        </div>

        {!noAmount && <AmountCard r={r} />}
      </div>
    );
  };

  const toggle = (id) => setOpenId((o) => (o === id ? null : id));
  const catInfo = CATS.find((c) => c.key === cat);
  // Table: TNR wise — oru TNR ku oru block, keezha cancel aana travellers date wise
  // Amount endha category la count: Advance / Fully paid tab la andha tab; Both la ELLAAM add (tier filter pottaalum)
  const ownCat = cat;
  const groups = (() => {
    const m = new Map();
    list.forEach((r) => {
      if (!m.has(r.tnr)) m.set(r.tnr, []);
      m.get(r.tnr).push(r);
    });
    return [...m.entries()].map(([tnr, kids]) => {
      const sorted = [...kids].sort((x, y) => (x.seq || 0) - (y.seq || 0));
      const latest = sorted[sorted.length - 1];
      const owner = sorted[0];
      const show = groupAmount(sorted); // booking amount (kaatta)
      // Oru TNR Advance + Fully paid rendu tab layum irundhaa, amount kadaisi cancellation oda tab la
      // mattum count — Advance tab + Fully paid tab = Both = Sales Dashboard
      const inOther = ownCat !== "all" && sorted[0].amountIn && sorted[0].amountIn !== ownCat ? sorted[0].amountIn : null;
      const amt = inOther ? { gv: 0, irctc: 0, total: 0, partial: false, inOther } : show;
      return {
        tnr,
        kids: sorted,
        // Gender filter potta andha gender travellers mattum (chips / PDF)
        trav: sorted.flatMap((k) => travOf(k).map((t) => ({ k, t }))),
        head: latest,
        owner,
        amt,
        show,
        detail: {
          ...latest,
          ...(owner ? { amounts: owner.amounts } : {}),
          travellers: sorted.flatMap((k) => k.travellers.map((t) => ({ ...t, tier: tierOfT(k, t) }))),
          remarkText: [...new Set(sorted.map((k) => k.remarkText).filter(Boolean))].join(" | "),
        },
      };
    });
  })();
  // Tier filter: rendu tier la cancel aana TNR evlo (note ku)
  // Rendu tier la cancel aana TNRs — endha tier, amount enga count aagudhu (hint ku)
  const multiList = groups.map((g) => {
    const rs = all.filter((r) => r.tnr === g.tnr).sort((x, y) => (x.seq || 0) - (y.seq || 0));
    const tiersSeen = [];
    rs.forEach((r) => { const id = `${r.category}|${r.tier?.key}`; if (!tiersSeen.some((t) => t.id === id)) tiersSeen.push({ id, cat: r.category, tier: r.tier }); });
    return { g, tiersSeen };
  }).filter((x) => new Set(x.tiersSeen.map((t) => t.tier?.key)).size > 1 || new Set(x.tiersSeen.map((t) => t.cat)).size > 1);
  const multiTier = multiList.length;
  const sumGv = sum(groups, (g) => g.amt.gv);
  const sumIr = sum(groups, (g) => g.amt.irctc);
  const sumTotal = sum(groups, (g) => g.amt.total);
  const tnrCount = new Set(properList.map((r) => r.tnr)).size;

  // ─── PDF ───
  const filterText = () => {
    const p = [catInfo.label];
    if (from || to) p.push(`${from ? fmtDate(from) : "Start"} – ${to ? fmtDate(to) : "Today"}`);
    else p.push(PRESETS.find((x) => x.key === preset)?.label || "All time");
    if (year.length) p.push([...year].sort().join(", "));
    if (month.length) p.push([...month].sort((a, b) => a - b).map((m) => MONTHS[m - 1]).join(", "));
    if (gender.length) p.push(gender.join(", "));
    if (tier.length) p.push(tier.map((v) => {
      const [c, k] = v.includes("|") ? v.split("|") : [null, v];
      const lbl = (tierStats.find((t) => t.key === k) || {}).label || k;
      return c ? `${c === "full" ? "Fully paid" : "Advance"} ${lbl}` : lbl;
    }).join(", "));
    if (selTours.length) p.push(selTours.length === 1 ? selTours[0].name : `${selTours.length} tours`);
    if (q) p.push(`Search "${q}"`);
    return p.filter(Boolean).join(" · ");
  };
  const downloadPdf = () => {
    const tierShown = tierStats.filter((t) => !tier.length || selHasKey(tier, t.key));
    const html = buildPdfHtml({
      filterText: filterText(),
      catLabel: catInfo.label,
      hero: [
        ["🎫", "Cancelled TNRs", tnrCount, "#14532D", "#2E7D32"],
        ["👥", "Travellers cancelled", travTotal, "#C2410C", "#F97316"],
        ["📊", "Most cancelled tier", topTier?.trav ? `${topTier.label} · ${topTier.percentage}%` : "—", "#6D28D9", "#A855F7"],
        ["💰", "Total cancellation", inr(sumTotal), "#B91C1C", "#F43F5E"],
      ],
      sections: [
        { title: "Cancellation amount (tour booking)", color: "#B91C1C", items: [
          ["₹", "GV cancellation", inr(sumGv), "#FEF3C7", "#B45309"],
          ["🎫", "IRCTC cancellation", inr(sumIr), "#E0F2FE", "#0369A1"],
          ["💰", "Total cancellation", inr(sumTotal), "#FEE2E2", "#B91C1C"],
        ] },
        { title: "Travellers", color: "#0E7490", items: [
          ["❌", "Cancelled", travTotal, "#FEE2E2", "#B91C1C"],
          ["🛑", "Trip cancelled", tripTrav, "#FEF3C7", "#92400E"],
          ["👨", "Male", genderCounts.Male, "#E0E7FF", "#4338CA"],
          ["👩", "Female", genderCounts.Female, "#FCE7F3", "#9D174D"],
          ["🧑", "Other", genderCounts.Other, "#F1F5F9", "#334155"],
        ] },
        { title: "Tiers (travellers)", color: "#6D28D9", items: tierShown.slice(0, 7).map((t) => {
          const [c1] = TIER_GRAD(t.percentage, isSpecialTier(t));
          return ["⏱", isSpecialTier(t) ? t.label : `${t.label} · ${t.percentage}%`, t.trav, `${c1}1A`, c1];
        }) },
      ],
      tiers: tierShown,
      facts: { gv: sumGv, irctc: sumIr, total: sumTotal, trav: travTotal, trip: tripTrav, male: genderCounts.Male, female: genderCounts.Female, other: genderCounts.Other },
      tierSplit: tierStatsSplit ? { advance: tierStatsSplit.advance.filter((t) => !tier.length || tier.includes(t.key) || tier.includes(`advance|${t.key}`)), full: tierStatsSplit.full.filter((t) => !tier.length || tier.includes(t.key) || tier.includes(`full|${t.key}`)) } : null,
      groups,
      allRows: all,
      charts: { gender: genderCounts, month: monthData, tours: tourRows, gv: sumGv, irctc: sumIr },
      note: tier.length > 0 && multiTier > 0 ? `${multiTier} TNR${multiTier === 1 ? "" : "s"} had cancellations in more than one tier; booking amount counted once: ${multiList.map(({ g }) => `${g.tnr} (${inr(g.show.total)} ${g.amt.inOther ? `in ${g.amt.inOther === "full" ? "Fully paid" : "Advance only"}` : "here"})`).join(", ")}.` : "",
    });
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const w = window.open(url, "_blank");
    if (!w) toast.error("Allow pop-ups to download the PDF");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  // ─── Chart data (custom charts) ───
  const monthData = (() => {
    const m = new Map();
    const seen = new Set();
    const amtOf = new Map(groups.map((g) => [g.tnr, g]));
    list.forEach((r) => {
      const d = new Date(r.approvedOn);
      const k = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      const v = m.get(k) || { tnr: 0, trav: 0, amount: 0 };
      if (!seen.has(`${k}|${r.tnr}`)) { seen.add(`${k}|${r.tnr}`); v.tnr += 1; }
      const g = amtOf.get(r.tnr);
      // amount: tour booking total, TNR ku oru thadava
      if (!seen.has(r.tnr)) { seen.add(r.tnr); v.amount += g?.amt.total || 0; }
      v.trav += travOf(r).length || r.travellerCount;
      m.set(k, v);
    });
    return [...m.keys()].sort().map((k) => ({ key: k, label: `${MONTHS[Number(k.slice(5)) - 1]} ${k.slice(2, 4)}`, ...m.get(k) }));
  })();
  const genderCounts = (() => {
    const c = { Male: 0, Female: 0, Other: 0 };
    properList.forEach((r) => properOf(r).forEach((t) => { c[normG(t.gender)] += 1; }));
    return c;
  })();
  const tourRows = (() => {
    const m = new Map();
    const seen = new Set();
    list.forEach((r) => {
      const k = r.tourName || "Unnamed tour";
      const v = m.get(k) || { name: k, trav: 0, tnr: 0, amount: 0, groups: [] };
      v.trav += travOf(r).length || r.travellerCount;
      if (!seen.has(r.tnr)) {
        seen.add(r.tnr);
        const gr = groups.find((g) => g.tnr === r.tnr);
        v.tnr += 1;
        v.amount += gr?.amt.total || 0;
        if (gr) v.groups.push(gr);
      }
      m.set(k, v);
    });
    return [...m.values()].sort((a, b) => b.trav - a.trav).slice(0, 8);
  })();
  const fieldCls2 = "h-10 w-full rounded-xl border border-[#DDE0EC] bg-white px-3 text-sm text-[#1D2340] outline-none transition focus:border-[#2F5BD3] focus:ring-2 focus:ring-[#2F5BD3]/15";

  return (
    <div className="min-h-screen w-full min-w-0 flex-1 bg-[#F5F6FA] p-3 pt-16 sm:p-6 sm:pt-16 lg:pt-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold leading-tight tracking-tight text-[#1D2340]">Cancellations</h1>
            <p className="mt-1 text-sm text-[#5B6280]">How close to departure people cancel, and what it cost</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div role="tablist" className="inline-flex rounded-xl bg-[#E6E8F1] p-1">
              {CATS.map((c) => (
                <button key={c.key} type="button" role="tab" aria-selected={cat === c.key} onClick={() => setCat(c.key)} title={c.hint}
                  className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition ${cat === c.key ? "bg-[#4CAF50] text-white shadow" : "text-[#5B6280] hover:text-[#2E7D32]"}`}>
                  {c.label} <span className={`ml-1 text-xs tabular-nums ${cat === c.key ? "text-[#E8F5E9]" : "text-[#9AA0B8]"}`}>{rows ? catCount(c.key) : "…"}</span>
                </button>
              ))}
            </div>
            <button type="button" onClick={downloadPdf} disabled={!rows}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#1D2340] shadow-[0_0_0_1px_#DDE0EC] hover:bg-[#F5F6FA] disabled:opacity-50">
              <Download className="h-4 w-4" /> PDF
            </button>
            <button type="button" onClick={load} aria-label="Refresh" className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#4CAF50] text-white hover:bg-[#3E9B43]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Filters */}
        <section className="mb-5 rounded-2xl bg-white p-3 shadow-[0_0_0_1px_#E6E8F1]">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex flex-wrap gap-1">
              {PRESETS.map((p) => (
                <button key={p.key} type="button" onClick={() => { setPreset(p.key); setRange(p.range ? p.range() : ["", ""]); }}
                  className={`h-8 rounded-full px-3.5 text-xs font-semibold transition ${preset === p.key ? "bg-[#4CAF50] text-white" : "bg-[#F5F6FA] text-[#5B6280] hover:bg-[#E8F5E9]"}`}>
                  {p.label}
                </button>
              ))}
            </div>
            {preset === "custom" ? (
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#5B6280]">From
                  <input type="date" aria-label="From date" value={from} max={to || undefined} onChange={(e) => setRange([e.target.value, to])} className={`${fieldCls2} sm:w-40`} />
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#5B6280]">To
                  <input type="date" aria-label="To date" value={to} min={from || undefined} onChange={(e) => setRange([from, e.target.value])} className={`${fieldCls2} sm:w-40`} />
                </label>
              </div>
            ) : preset !== "all" && (from || to) ? (
              <span className="text-xs text-[#9AA0B8]">{fmtDate(from)} – {fmtDate(to)}</span>
            ) : null}
            <div className="relative w-full sm:ml-auto sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9AA0B8]" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, mobile, TNR, email" className={`${fieldCls2} pl-9`} />
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,2fr)]">
            <MultiSelect label="Year" allLabel="Every year" value={year} onChange={setYear}
              options={years.map((y) => ({ value: y, label: String(y) }))} />
            <MultiSelect label="Month" allLabel="Every month" value={month} onChange={setMonth}
              options={MONTHS.map((m, i) => ({ value: i + 1, label: m, short: m.slice(0, 3) }))} />
            <MultiSelect label="Gender" allLabel="Any gender" value={gender} onChange={setGender}
              options={GENDERS.map((g) => ({ value: g, label: g }))} />
            <MultiSelect label="Tier" allLabel="Any tier" value={tier} onChange={setTier}
              options={tierStatsSplit
                ? [["advance", "Advance only paid", "Adv"], ["full", "Fully paid", "Full"]].flatMap(([c, g, sh]) => tierStatsSplit[c].map((t) => ({ value: `${c}|${t.key}`, group: g, label: `${t.label}${isSpecialTier(t) ? "" : ` (${t.percentage}%)`}`, short: `${sh} ${t.label}` })))
                : tierStats.map((t) => ({ value: t.key, label: `${t.label}${isSpecialTier(t) ? "" : ` (${t.percentage}%)`}`, short: t.label }))} />
            <div ref={dropRef} className="relative col-span-2 md:col-span-4 xl:col-span-1">
              <button type="button" onClick={() => setTourDrop((v) => !v)} aria-expanded={tourDrop}
                className={`${fieldCls2} flex items-center justify-between gap-2 text-left`}>
                <span className="flex min-w-0 items-center gap-2 truncate">
                  <MapPin className="h-4 w-4 shrink-0 text-[#4CAF50]" />
                  {selTours.length === 0 ? "All tours" : selTours.length === 1 ? selTours[0].name : `${selTours.length} tours`}
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-[#9AA0B8] transition ${tourDrop ? "rotate-180" : ""}`} />
              </button>
              {tourDrop && (
                <div className="absolute right-0 z-30 mt-1.5 w-full min-w-[19rem] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-[#DDE0EC]">
                  <div className="p-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9AA0B8]" />
                      <input autoFocus value={tourQ} onChange={(e) => setTourQ(e.target.value)} placeholder="Type a tour, e.g. Kerala" className="h-9 w-full rounded-xl bg-[#F5F6FA] pl-8 pr-2 text-sm outline-none focus:ring-2 focus:ring-[#2F5BD3]/20" />
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto pb-1">
                    {tourMatches.length > 0 && (
                      <button type="button" onClick={() => addTours(tourMatches)} className="mx-2 mb-1 w-[calc(100%-1rem)] rounded-lg bg-[#FFF1E3] px-3 py-2 text-left text-xs font-bold text-[#B45F06] hover:bg-[#FFE6CC]">
                        Select all {tourMatches.length} {tourQ ? "matching " : ""}tours
                      </button>
                    )}
                    {tourMatches.map((o) => (
                      <button key={o.id} type="button" onClick={() => setSelTours((p) => [...p, o])} className="block w-full truncate px-4 py-2 text-left text-sm text-[#1D2340] hover:bg-[#F5F6FA]">{o.name}</button>
                    ))}
                    {!tourMatches.length && <p className="px-3 py-4 text-center text-xs text-[#9AA0B8]">No more tours</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {(selTours.length > 0 || !!filtersOn) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {selTours.map((s) => (
                <span key={s.id} className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#EEF1FB] py-1 pl-3 pr-1.5 text-[11.5px] font-semibold text-[#2F5BD3]">
                  <span className="truncate">{s.name}</span>
                  <button type="button" onClick={() => setSelTours((p) => p.filter((x) => x.id !== s.id))} aria-label={`Remove ${s.name}`} className="rounded-full p-0.5 hover:bg-white"><X className="h-3 w-3" /></button>
                </span>
              ))}
              {!!filtersOn && (
                <button type="button" onClick={clearFilters} className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-[#D23B3B] hover:bg-[#FDECEC]">
                  <X className="h-3.5 w-3.5" /> Clear filters
                </button>
              )}
            </div>
          )}
        </section>

        {rows === null ? (
          <p className="flex items-center justify-center gap-2 py-20 text-sm text-[#5B6280]"><Loader2 className="h-4 w-4 animate-spin" /> Loading cancellations…</p>
        ) : (
          <>
            {otherTab && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#EEF2FF] px-4 py-2.5 text-[12.5px] text-[#3730A3] ring-1 ring-inset ring-[#C7D2FE]">
                <span>
                  <b>{otherTab.trav} more traveller{otherTab.trav === 1 ? "" : "s"}</b> ({otherTab.tnrs} TNR{otherTab.tnrs === 1 ? "" : "s"}) match these filters under <b>{CATS.find((c) => c.key === otherTab.key)?.label}</b>.
                </span>
                <span className="flex gap-2">
                  <button type="button" onClick={() => setCat(otherTab.key)} className="rounded-full bg-white px-3 py-1 text-[11.5px] font-semibold text-[#4338CA] ring-1 ring-inset ring-[#C7D2FE] hover:bg-[#F5F7FF]">Show {CATS.find((c) => c.key === otherTab.key)?.label}</button>
                  <button type="button" onClick={() => setCat("all")} className="rounded-full bg-[#4338CA] px-3 py-1 text-[11.5px] font-semibold text-white hover:bg-[#3730A3]">Show both</button>
                </span>
              </div>
            )}
            {/* Stats */}
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <StatCard icon={Ticket} label="Cancelled TNRs" value={tnrCount} sub={(() => { const n = sum(list, (r) => r.requests || 1); return `${n} cancellation request${n === 1 ? "" : "s"} approved`; })()} grad={["#E11D48", "#FB7185"]} />
              <StatCard icon={Users} label="Travellers cancelled" value={travTotal}
                sub={[`${genderCounts.Male} male · ${genderCounts.Female} female${genderCounts.Other ? ` · ${genderCounts.Other} other` : ""}`, tripTrav ? `+${tripTrav} trip cancelled` : ""].filter(Boolean).join(" · ")} grad={["#EA580C", "#FDBA74"]} />
              <StatCard icon={Layers} label="Most cancelled tier" value={topTier?.trav ? topTier.label : "—"} sub={topTier?.trav ? `${topTier.percentage}% deduction · ${topTier.trav} travellers` : ""} grad={["#7C3AED", "#C4B5FD"]} />
              <StatCard icon={Wallet} label="GV cancellation" value={inr(sumGv)} sub={sumTotal ? `${String(+((sumGv / sumTotal) * 100).toFixed(1))}% of total` : ""} grad={["#D97706", "#FCD34D"]} />
              <StatCard icon={TrainFront} label="IRCTC cancellation" value={inr(sumIr)} sub={sumTotal ? `${String(+((sumIr / sumTotal) * 100).toFixed(1))}% of total` : ""} grad={["#0284C7", "#7DD3FC"]} />
              <StatCard icon={IndianRupee} label="Total cancellation" value={inr(sumTotal)} sub="GV + IRCTC (tour booking)" grad={["#059669", "#6EE7B7"]} />
            </div>
            {tier.length > 0 && multiTier > 0 && (
              <div className="-mt-2 mb-4 rounded-xl bg-[#F5F3FF] px-4 py-3 text-[11.5px] text-[#5B21B6] ring-1 ring-inset ring-[#E4DCFB]">
                <p className="flex items-start gap-2">
                  <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#7C3AED]" />
                  <span><b>{multiTier} TNR{multiTier === 1 ? "" : "s"}</b> had cancellations in more than one tier. The booking amount is not split by tier, so it is counted once, where shown below. Click a TNR to open it.</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-2 pl-3.5">
                  {multiList.map(({ g, tiersSeen }) => {
                    const where = g.amt.inOther ? (g.amt.inOther === "full" ? "Fully paid" : "Advance only") : "this list";
                    return (
                      <button key={g.tnr} type="button"
                        onClick={() => { setOpenId(g.tnr); setTimeout(() => document.getElementById(`tnr-${g.tnr}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }}
                        className="flex flex-col items-start gap-1 rounded-lg bg-white px-2.5 py-1.5 text-left ring-1 ring-inset ring-[#E4DCFB] hover:ring-[#A78BFA]">
                        <span className="flex items-center gap-2">
                          <b className="font-mono text-[#2F5BD3]">{g.tnr}</b>
                          <span className={`rounded px-1.5 text-[10px] font-bold ${g.amt.inOther ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                            {inr(g.show.total)} · {g.amt.inOther ? `added in ${where}` : "added here"}
                          </span>
                        </span>
                        <span className="flex flex-wrap gap-1">
                          {tiersSeen.map((t) => {
                            const [c1] = TIER_GRAD(t.tier?.percentage, isSpecialTier(t.tier));
                            return <span key={t.id} className="rounded-full px-1.5 text-[10px] font-semibold" style={{ background: `${c1}14`, color: c1 }}>{t.cat === "full" ? "Full" : "Adv"} {t.tier?.label}{isSpecialTier(t.tier) ? "" : ` ${t.tier?.percentage}%`}</span>;
                          })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tier chart — full width; Both la Advance / Fully paid thaniya */}
            {(tierStatsSplit ? [["advance", "Advance only paid", tierStatsSplit.advance], ["full", "Fully paid", tierStatsSplit.full]] : [[cat, catInfo.label, tierStats]]).map(([k, lbl, data]) => (
              <Panel key={k} className="mb-4" title={`Tier-wise cancellations · ${lbl}`}
                note={k === "full" ? "Cancelled after the balance was paid. Fully paid cancellation rule %." : k === "advance" ? "Cancelled with only the advance paid. Advance cancellation rule %." : "Travellers per cancellation tier."}
                right={tier.length ? <button type="button" onClick={() => setTier([])} className="text-xs font-semibold text-[#D23B3B] hover:underline">Show all tiers</button> : <span className="text-[11px] text-[#9AA0B8]">Click a bar to filter the list</span>}>
                <TierChart tiers={data} topKey={data.filter((t) => !isSpecialTier(t)).reduce((b2, t) => (t.trav > (b2?.trav || 0) ? t : b2), null)?.key}
                  active={tierStatsSplit ? tier.filter((v) => v === `${k}|${v.split("|")[1]}` || !v.includes("|")).map((v) => (v.includes("|") ? v.split("|")[1] : v)) : tier}
                  onPick={(t) => { const v = tierStatsSplit ? `${k}|${t}` : t; setTier((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v])); }} />
              </Panel>
            ))}

            {/* Rendu pie chart mattum side by side */}
            <div className="mb-4 grid gap-3 lg:grid-cols-2">
              <Panel title="Who cancelled" note="Cancelled travellers by gender">
                <PieChart unit="travellers" icon={Users} parts={[
                  { key: "Male", value: genderCounts.Male, grad: ["#6366F1", "#A78BFA"] },
                  { key: "Female", value: genderCounts.Female, grad: ["#EC4899", "#F9A8D4"] },
                  { key: "Other", value: genderCounts.Other, grad: ["#64748B", "#CBD5E1"] },
                ]} />
              </Panel>
              <Panel title="Where the money went" note="GV vs IRCTC cancellation (tour booking)">
                <PieChart unit="total" icon={IndianRupee} parts={[
                  { key: "GV cancellation", value: sumGv, grad: ["#D97706", "#FCD34D"], fmt: inr },
                  { key: "IRCTC cancellation", value: sumIr, grad: ["#0284C7", "#7DD3FC"], fmt: inr },
                ]} />
              </Panel>
            </div>

            <Panel className="mb-4" title="Month by month" note="By approved date"><MonthChart data={monthData} /></Panel>
            <Panel className="mb-4" title="Tours with the most cancellations" note="Travellers cancelled and total cancellation amount">
              <TourBars rows={tourRows} />
            </Panel>

            {/* TNR list */}
            <Panel title="Cancelled bookings" right={<span className="text-xs text-[#9AA0B8]">{groups.length} TNRs · click a TNR to see full details</span>}>
              {list.length === 0 ? (
                <p className="py-10 text-center text-sm text-[#9AA0B8]">No cancellations match these filters. Try clearing a filter.</p>
              ) : (
                <>
                  {/* Table header (desktop) */}
                  <div className="-mx-5 hidden gap-3 border-t border-[#EEF0F4] bg-[#F7F8FB] px-5 py-2.5 text-[11px] font-semibold text-[#5B6280] xl:grid xl:grid-cols-[30px_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,0.85fr)_minmax(0,2.1fr)_32px] xl:items-center">
                    <span>#</span>
                    <span>TNR · Tour</span>
                    <span>Booking head</span>
                    <span>Cancelled travellers</span>
                    <span className="grid grid-cols-5 gap-2 text-right">
                      <span>Advance</span><span>Balance</span><span>GV</span><span>IRCTC</span><span>Total cancel</span>
                    </span>
                    <span />
                  </div>
                  <div className="-mx-5 divide-y divide-[#EEF0F4] border-y border-[#EEF0F4]">
                    {groups.map((g, gi) => {
                      const r = g.head;
                      const open = openId === g.tnr;
                      const own = g.owner;
                      const [ac, acBg] = ACCENTS[gi % ACCENTS.length];
                      const travs = g.trav;
                      // Details: booking la ELLAA cancel aanavanga (endha tab aanaalum) + cancel aagaadhavanga
                      const allTravRows = open
                        ? all.filter((x) => x.tnr === g.tnr).sort((x, y) => (x.seq || 0) - (y.seq || 0)).flatMap((k) => k.travellers.map((t) => ({ k, t })))
                        : [];
                      const cancelledIds = new Set(allTravRows.map(({ t }) => t.id));
                      const activeTrav = open ? (r.allTravellers || []).filter((t) => !cancelledIds.has(t.id)) : [];
                      return (
                        <div key={g.tnr} id={`tnr-${g.tnr}`} className="relative scroll-mt-20 transition" style={{ background: open ? `${acBg}66` : undefined }}>
                          <span className="absolute inset-y-0 left-0 w-1" style={{ background: ac }} />
                          {/* ── TNR row: head, booked by, travellers, Advance / Balance / GV / IRCTC / Total ── */}
                          <div role="button" tabIndex={0} aria-expanded={open} onClick={() => toggle(g.tnr)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(g.tnr); } }}
                            title={open ? "Click to close" : "Click to see full details"}
                            className="grid cursor-pointer grid-cols-1 gap-3 px-5 py-3.5 outline-none transition hover:bg-[#F8F9FC] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#A5B4FC] xl:grid-cols-[30px_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,0.85fr)_minmax(0,2.1fr)_32px] xl:items-center">
                            <span className="hidden xl:block"><span className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold" style={{ background: acBg, color: ac }}>{gi + 1}</span></span>
                            <div className="min-w-0">
                              <CopyTnr tnr={g.tnr} className="text-sm" />
                              <p className="truncate text-[12.5px] font-semibold text-[#1D2340]" title={r.tourName}>{r.tourName || "—"}</p>
                            </div>
                            <div className="min-w-0 text-xs">
                              <p className="truncate text-[13px] font-semibold text-[#1D2340]" title={`Booking head: ${r.contact.name || ""}`}>{r.contact.name || "—"}</p>
                              <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[11px] text-[#5B6280]">
                                <Phone className="h-3 w-3 shrink-0 text-[#9AA0B8]" /><span className="shrink-0 tabular-nums">{r.contact.mobile || "—"}</span>
                              </p>
                              <BookedByLine by={r.bookedBy} />
                            </div>
                            <div className="flex min-w-0 flex-col items-start gap-1">
                              {travs.map(({ k, t }, i) => {
                                const tt = tierOfT(k, t);
                                const [c1] = TIER_GRAD(tt?.percentage, isSpecialTier(tt));
                                return (
                                  <span key={`${k._id}-${t.id || i}`} className="inline-flex max-w-full items-center gap-1.5 text-[11.5px]" title={`${t.name} · ${t.gender || ""} · ${tt?.label || ""} · ${fmtDate(t.cancelledOn || k.approvedOn)}`}>
                                    <span className="truncate font-semibold text-[#1D2340]">{String(t.name || "—").replace(/^(mr|mrs|ms|miss|master|dr)\.?\s+/i, "")}</span>
                                    <span className="shrink-0 rounded px-1 text-[10.5px] font-bold" style={{ color: c1, background: `${c1}14` }}>{isSpecialTier(tt) ? tt?.label : `${tt?.percentage}%`}</span>
                                  </span>
                                );
                              })}
                            </div>
                            {/* amounts — tour booking */}
                            <div className="grid grid-cols-3 gap-2 text-xs tabular-nums xl:grid-cols-5">
                              {[
                                ["Advance", inr(own?.amounts.advance), "#1D2340", own?.amounts.advancePaid ? ["Paid", "ok"] : ["Due", "due"]],
                                ["Balance", inr(own?.amounts.balance), "#1D2340", refundIsBalance(own || {}) ? ["= Refund", "rf"] : own?.amounts.balancePaid ? ["Paid", "ok"] : ["Pending", "due"]],
                                ["GV", inr(g.show.gv), g.amt.inOther ? "#9AA0B8" : "#B45309"],
                                ["IRCTC", inr(g.show.irctc), g.amt.inOther ? "#9AA0B8" : "#0369A1"],
                                ["Total cancel", inr(g.show.total), g.amt.inOther ? "#9AA0B8" : "#BE123C", g.amt.inOther ? [`In ${g.amt.inOther === "full" ? "Fully paid" : "Advance"} tab`, "rf"] : null],
                              ].map(([l, v, c, tag]) => (
                                <div key={l} className="min-w-0 rounded-lg bg-[#F8F9FC] px-2 py-1.5 xl:bg-transparent xl:p-0 xl:text-right">
                                  <p className="text-[10px] text-[#9AA0B8] xl:hidden">{l}</p>
                                  <p className="truncate font-bold" style={{ color: c }}>{v}</p>
                                  {tag && <span title="Amount is counted in this tab" className={`mt-0.5 inline-block whitespace-nowrap rounded px-1.5 text-[9.5px] font-bold ${tag[1] === "ok" ? "bg-emerald-50 text-emerald-700" : tag[1] === "rf" ? "bg-violet-50 text-violet-700" : "bg-amber-50 text-amber-700"}`}>{tag[0]}</span>}
                                </div>
                              ))}
                            </div>
                            <span className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full xl:static xl:justify-self-end" style={{ background: open ? "#fff" : acBg, color: ac, boxShadow: `inset 0 0 0 1px ${ac}40` }} aria-hidden="true">
                              <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
                            </span>
                          </div>

                          {/* ── Details (open aanaa mattum) ── */}
                          {open && (
                            <div className="px-5 pb-5">
                              <div className="min-w-0 space-y-3">
                                {own && <AmountStrip r={own} />}
                                <div className="overflow-hidden rounded-xl bg-white" style={{ boxShadow: `inset 0 0 0 1px ${ac}26` }}>
                                  <div className="flex flex-wrap items-center justify-between gap-2 px-3 pt-2.5 text-[11.5px]">
                                    <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                                      <b className="text-[#1D2340]">Travellers in this booking <span className="font-medium text-[#9AA0B8]">({allTravRows.length + activeTrav.length})</span></b>
                                      {r.contact.email && (
                                        <span className="inline-flex min-w-0 items-center gap-1 text-[11px] text-[#5B6280]" title="Booking email">
                                          <Mail className="h-3 w-3 shrink-0 text-[#9AA0B8]" /><span className="truncate lowercase">{r.contact.email}</span>
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-[10.5px] text-[#9AA0B8]"><b className="text-[#BE123C]">{allTravRows.length}</b> cancelled · <b className="text-[#047857]">{activeTrav.length}</b> not cancelled</span>
                                  </div>
                                  <div className="mt-2 hidden grid-cols-[70px_110px_minmax(0,1fr)_150px_100px_110px] gap-3 px-3 py-1.5 text-[10.5px] font-semibold xl:grid" style={{ background: acBg, color: ac }}>
                                    <span>Order</span><span>Cancelled on</span><span>Traveller</span><span>Tier</span><span>Days before</span><span>Paid status</span>
                                  </div>
                                  {allTravRows.map(({ k, t }, i) => {
                                    const tt = tierOfT(k, t);
                                    const trip = isTripT(k, t);
                                    return (
                                      <div key={`${k._id}-${t.id || i}`} className={`grid grid-cols-2 gap-x-3 gap-y-1 border-t border-[#F1F2F6] px-3 py-2 text-xs xl:grid-cols-[70px_110px_minmax(0,1fr)_150px_100px_110px] xl:items-center ${k.category !== cat ? "bg-[#FAFAFC]" : ""}`}>
                                        <span className="inline-flex w-fit items-center rounded-md px-1.5 py-0.5 text-[11px] font-bold" style={{ background: acBg, color: ac }}>{ORD(k.seq || 1)}{(k.seqTotal || 1) > 1 ? <span className="font-medium opacity-70">&nbsp;of {k.seqTotal}</span> : null}</span>
                                        <span className="text-right text-[#1D2340] xl:text-left">{fmtDate(t.cancelledOn || k.approvedOn)}</span>
                                        <span className="col-span-2 min-w-0 xl:col-span-1">
                                          <b className="block break-words text-[#1D2340]">{t.name || "—"}{trip && <span className="ml-1.5 rounded bg-amber-50 px-1 text-[10px] font-semibold text-amber-700">Trip cancelled</span>}</b>
                                          <span className="text-[10.5px] text-[#9AA0B8]">{[t.age ? `${t.age} yrs` : "", t.gender, ({ double: "Double", triple: "Triple", withBerth: "Child, berth", withoutBerth: "Child, no berth" })[t.sharingType]].filter(Boolean).join(" · ")}</span>
                                        </span>
                                        <span><TierPill tier={tt} /></span>
                                        <span className="text-right text-[#5B6280] xl:text-left">{isSpecialTier(tt) ? "—" : `${t.noOfDays ?? k.noOfDays} days`}</span>
                                        <span className="col-span-2 xl:col-span-1">
                                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${k.category === "full" ? "bg-[#E6F6F4] text-[#0F766E]" : "bg-[#FEF5E7] text-[#B45309]"}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${k.category === "full" ? "bg-[#14B8A6]" : "bg-[#F59E0B]"}`} />{k.category === "full" ? "Fully paid" : "Advance only"}
                                          </span>
                                        </span>
                                      </div>
                                    );
                                  })}
                                  {activeTrav.map((t, i) => (
                                    <div key={`a-${t.id || i}`} className="grid grid-cols-2 gap-x-3 gap-y-1 border-t border-[#F1F2F6] px-3 py-2 text-xs xl:grid-cols-[70px_110px_minmax(0,1fr)_150px_100px_110px] xl:items-center">
                                      <span className="text-[#C5C9DA]">—</span>
                                      <span className="text-right text-[#C5C9DA] xl:text-left">—</span>
                                      <span className="col-span-2 min-w-0 xl:col-span-1">
                                        <b className="block break-words text-[#1D2340]">{t.name || "—"}</b>
                                        <span className="text-[10.5px] text-[#9AA0B8]">{[t.age ? `${t.age} yrs` : "", t.gender, ({ double: "Double", triple: "Triple", withBerth: "Child, berth", withoutBerth: "Child, no berth" })[t.sharingType]].filter(Boolean).join(" · ")}</span>
                                      </span>
                                      <span className="col-span-2 xl:col-span-3">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-semibold ring-1 ring-inset ${(TSTATUS[t.status] || TSTATUS.active)[1]}`}>{(TSTATUS[t.status] || TSTATUS.active)[0]}</span>
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <RoadMap g={g} />
                                {g.detail.remarkText && (
                                  <p className="flex items-start gap-2 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-2.5 text-[12px] text-[#92400E]">
                                    <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" /> <span><b>Remark:</b> {g.detail.remarkText}</span>
                                  </p>
                                )}
                                <button type="button" onClick={() => toggle(g.tnr)} className="inline-flex items-center gap-1 text-[11.5px] font-semibold hover:underline" style={{ color: ac }}>
                                  Close <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="-mx-5 -mb-5 mt-2 flex flex-wrap justify-between gap-2 rounded-b-2xl bg-[#1D2340] px-5 py-3.5 text-sm font-semibold text-white">
                    <span>{tnrCount} bookings, {travTotal} travellers</span>
                    <span className="flex flex-wrap gap-x-5 tabular-nums">
                      <span>GV <b className="text-[#FFD08A]">{inr(sumGv)}</b></span>
                      <span>IRCTC <b className="text-[#A9C1FF]">{inr(sumIr)}</b></span>
                      <span>Total <b className="text-[#FF9C9C]">{inr(sumTotal)}</b></span>
                    </span>
                  </div>
                  {salesCheck && (() => {
                    // Rendu tab um, filter illaama — Sales Dashboard total oda match aaganum
                    const allOwn = uniqTnr(all);
                    const gvAll = sum(allOwn, (r) => r.amounts.gv);
                    const irAll = sum(allOwn, (r) => r.amounts.irctc);
                    const ok = Math.abs(gvAll - salesCheck.gv) < 1 && Math.abs(irAll - salesCheck.irctc) < 1;
                    return (
                      <p className={`-mx-5 -mb-5 mt-5 px-5 py-2 text-[11px] ${ok ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                        {ok ? "✓ " : "⚠ "}Both tabs, no filters: GV {inr(gvAll)} · IRCTC {inr(irAll)}. Sales Dashboard: GV {inr(salesCheck.gv)} · IRCTC {inr(salesCheck.irctc)}
                        {ok ? " — matches." : ` — difference GV ${inr(salesCheck.gv - gvAll)}, IRCTC ${inr(salesCheck.irctc - irAll)}.`}
                      </p>
                    );
                  })()}
                </>
              )}
            </Panel>
          </>
        )}
      </div>
    </div>
  );
};

export default CancellationAnalytics;
