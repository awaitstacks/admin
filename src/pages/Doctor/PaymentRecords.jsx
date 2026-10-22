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

// Tear-off calendar leaf for each day block in the statement.
const DateStamp = ({ dp }) => (
  <span className="inline-flex flex-col w-11 shrink-0 rounded-lg overflow-hidden border border-[#CFE3D6] bg-white text-center shadow-sm">
    <span className="bg-[#2E9E4F] text-white text-[10px] font-semibold leading-4">
      {dp.month} {String(dp.year).slice(2)}
    </span>
    <span className="text-base font-bold tabular-nums leading-6 text-[#1B2B26]">{dp.day}</span>
  </span>
);

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
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onClose, onNav]);

  if (index === null || !items[index]) return null;
  const r = items[index];
  const meta = TYPE_META[r.type] || TYPE_META.partial;
  return (
    <div
      className="fixed inset-0 z-50 bg-[#1B2B26]/80 flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl grid grid-rows-[minmax(0,1fr)_auto] md:grid-rows-1 md:grid-cols-[minmax(0,1fr)_260px] max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#EEF2EF] min-h-0 flex items-center justify-center">
          <img src={toPreviewUrl(r.url)} alt="Payment screenshot" className="max-w-full max-h-[50vh] md:max-h-[86vh] object-contain" />
        </div>
        <div className="p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 overflow-y-auto border-t md:border-t-0 md:border-l border-[#DCE5E0]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-[#1B2B26] shadow hover:bg-white"
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

const PaymentRecords = () => {
  const { ttoken, getPaymentRecords } = useContext(TourContext);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [source, setSource] = useState("");
  const [selTours, setSelTours] = useState([]);
  const [tourQ, setTourQ] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [from, setFrom] = useState("");
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
      return [r.tnr, r.name, r.remarks, r.tourTitle, r.amount != null ? String(r.amount) : ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [records, search, source, selTours]);

  const filtered = useMemo(() => {
    const list = type ? baseFiltered.filter((r) => r.type === type) : baseFiltered;
    return [...list].sort((a, b) =>
      sortDir === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [baseFiltered, type, sortDir]);

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

  const hasFilters = search || type || source || selTours.length || from || to;
  const clearFilters = () => {
    setSearch("");
    setType("");
    setSource("");
    setSelTours([]);
    setTourQ("");
    setFrom("");
    setTo("");
  };

  const fieldCls =
    "w-full h-9 px-3 rounded-lg border border-[#DCE5E0] bg-white text-sm text-[#1B2B26] placeholder:text-[#8FA39B] outline-none focus:border-[#2E9E4F] focus:ring-2 focus:ring-[#2E9E4F]/15";
  
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#EEF5F0] py-4 sm:py-5 px-3 sm:px-6 text-[#1B2B26] text-sm">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Payment records</h1>
            <p className="text-xs text-[#6B7F77]">Screenshots uploaded from Aadhaar Upload, {sortDir === "asc" ? "oldest" : "newest"} first</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto [&>button]:flex-1 sm:[&>button]:flex-none [&>button]:justify-center">
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
                  className={`relative min-w-0 text-left px-3 sm:px-4 py-3 sm:py-3.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1E6FD9] ${
                    i < 2 ? "border-r border-dashed border-[#DCE5E0]" : "xl:border-r-0"
                  } ${i === 2 ? "col-span-2 sm:col-span-1 border-t sm:border-t-0 border-dashed border-[#DCE5E0]" : ""} ${
                    active ? "" : "hover:bg-[#FAFCFB]"
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

        {/* Filters — one compact toolbar */}
        <section className="bg-white rounded-2xl border border-[#DCE5E0] p-3 mb-4">
          <div className="grid grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2">
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
                <div className="absolute left-0 right-0 xl:right-auto xl:w-[360px] top-[calc(100%+4px)] z-30 bg-white border border-[#DCE5E0] rounded-xl shadow-lg overflow-hidden">
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
                              className={`flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-[#F7F9F8] ${
                                checked ? "bg-[#F1F8F3]" : ""
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
            <label className="relative min-w-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#8FA39B] pointer-events-none">From</span>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={`${fieldCls} pl-12`} />
            </label>
            <label className="relative min-w-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#8FA39B] pointer-events-none">To</span>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={`${fieldCls} pl-9`} />
            </label>
            <div className="col-span-2 xl:col-span-1 inline-flex h-9 rounded-lg border border-[#DCE5E0] p-0.5 bg-[#F7F9F8]" role="group" aria-label="Booking type">
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
                  className={`flex-1 xl:flex-none px-3 rounded-md text-xs font-semibold ${
                    source === o.v ? "bg-white text-[#1F7A3D] shadow-sm" : "text-[#6B7F77] hover:text-[#1B2B26]"
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
                {hasFilters ? "Change or clear the filters to see more." : "Screenshots uploaded from Aadhaar Upload will show here."}
              </p>
            </div>
          ) : (
            <>
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm border-collapse">
                <thead>
                  <tr className="text-xs text-[#1F7A3D] bg-[#F2FAF4] border-b border-[#CFE3D6]">
                    <th className="pl-5 pr-3 py-3 text-left font-semibold w-24">Time</th>
                    <th className="px-3 py-3 text-left font-semibold w-20">Proof</th>
                    <th className="px-3 py-3 text-left font-semibold">Guest and TNR</th>
                    <th className="px-3 py-3 text-left font-semibold">Bank / remarks</th>
                    <th className="px-3 py-3 text-left font-semibold">Tour</th>
                    <th className="px-3 py-3 text-left font-semibold w-24">Booking</th>
                    <th className="pl-3 pr-5 py-3 text-right font-semibold w-40">Amount</th>
                  </tr>
                </thead>
                {days.map((g) => {
                  const dp = dayParts(g.key);
                  return (
                    <tbody key={g.key}>
                      <tr className="border-y border-[#DCE5E0] bg-[#FAFCFB]">
                        <td colSpan={6} className="pl-5 pr-3 py-3">
                          <div className="flex items-center gap-3">
                            <DateStamp dp={dp} />
                            <div>
                              <p className="font-semibold leading-tight">{dp.rel}</p>
                              <p className="text-xs text-[#8FA39B]">{g.rows.length} payment{g.rows.length !== 1 ? "s" : ""} received</p>
                            </div>
                          </div>
                        </td>
                        <td className="pl-3 pr-5 py-3 text-right">
                          <span className="inline-block rounded-lg bg-[#E4F5EA] text-[#1F7A3D] px-3 py-1 font-bold tabular-nums">
                            ₹{formatAmount(g.total)}
                          </span>
                        </td>
                      </tr>
                      {g.rows.map(({ r, index }) => {
                        const m = TYPE_META[r.type] || TYPE_META.partial;
                        return (
                          <tr key={r._id} className="border-b border-[#EEF2EF] last:border-0 hover:bg-[#F7F9F8]">
                            <td className="pl-5 pr-3 py-2.5 align-middle whitespace-nowrap tabular-nums text-[#4B5F57]">
                              <span className="relative pl-3">
                                <span className="absolute left-0 top-0.5 bottom-0.5 w-1 rounded-full" style={{ background: m.color }} />
                                {formatTime(r.createdAt)}
                              </span>
                            </td>
                            <td className="px-3 py-3">
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
                            <td className="px-3 py-3 max-w-[260px]">
                              <p className="font-semibold truncate">{r.name || "Unnamed guest"}</p>
                              {r.tnr ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-[#3B5BDB]">
                                  <span className="select-all">{r.tnr}</span> <CopyTnr tnr={r.tnr} />
                                </span>
                              ) : (
                                <span className="text-xs text-[#8FA39B]">TNR not linked yet</span>
                              )}
                            </td>
                            <td className="px-3 py-3 max-w-[180px] text-[#4B5F57]">
                              <span className="block truncate">{r.remarks || <span className="text-[#B9C9C1]">—</span>}</span>
                            </td>
                            <td className="px-3 py-3 max-w-[220px] text-[#4B5F57]">
                              <span className="block truncate">{r.tourTitle || <span className="text-[#B9C9C1]">—</span>}</span>
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                                  r.bookingSource === "user" ? "bg-[#EBFBEE] text-[#2B8A3E]" : "bg-[#EDF2FF] text-[#364FC7]"
                                }`}
                              >
                                {r.bookingSource === "user" ? "User" : "Admin"}
                              </span>
                            </td>
                            <td className="pl-3 pr-5 py-3 text-right whitespace-nowrap">
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
                                className={`text-[10px] font-semibold px-1.5 py-px rounded ${
                                  r.bookingSource === "user" ? "bg-[#EBFBEE] text-[#2B8A3E]" : "bg-[#EDF2FF] text-[#364FC7]"
                                }`}
                              >
                                {r.bookingSource === "user" ? "User" : "Admin"}
                              </span>
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
