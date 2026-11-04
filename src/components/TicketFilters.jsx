// ══════════════════════════════════════════════════════════════════════════════
// Ticket list — column wise filters (accounting software maadhiri).
// Ovvoru column header la funnel icon → popover → values select → Apply.
// Pala columns la ore neram filter podalaam; mela chips la kaattum, "Clear all" ore click.
// Common component — Admin (RaiseTicket) + Tour Admin / Staff (TicketLanding) moonu login um idha use pannum.
// Filters ellam comma string ah dhaan store aagum ("open,pickup") — backend adha split pannum.
// ══════════════════════════════════════════════════════════════════════════════
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { personName, groupStaffByRole, teamsFromStaff } from "../staff/ticketWho";

export const FILTER_KEYS = [
  "ticketNo",
  "subject",
  "queryType",
  "raisedBy",
  "raisedByDept",
  "raisedTo",
  "raisedToDept",
  "fromDate",
  "toDate",
  "status",
];

const split = (v) => String(v || "").split(",").map((x) => x.trim()).filter(Boolean);
const join = (arr) => arr.join(",");

// Indha naal (local) — YYYY-MM-DD
export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const shiftDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const monthStart = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};
const fmtDay = (s) => (s ? s.split("-").reverse().join("/") : "");

// ─── Column definitions ─────────────────────────────────────────────────────
// statuses = [{ key, label }]
export function buildColumnFilters({ types = [], staff = [], statuses = [] }) {
  const staffOpts = groupStaffByRole(staff).flatMap((g) =>
    g.items.map((s) => ({
      value: String(s._id),
      label: `${personName(s)}${s.employeeId ? ` (${s.employeeId})` : ""}`,
      group: g.label,
    })),
  );
  const teamOpts = teamsFromStaff(staff).map((t) => ({ value: t._id, label: t.name }));
  const typeOpts = types.map((t) => ({ value: t.name, label: t.name }));
  const statusOpts = statuses.map((s) => ({ value: s.key, label: s.label }));

  return {
    ticketNo: [{ key: "ticketNo", kind: "text", label: "Ticket no contains", placeholder: "e.g. GVTKT033 or 033" }],
    ticket: [
      { key: "subject", kind: "text", label: "Subject / TNR contains", placeholder: "e.g. Advance or XQ08ZT" },
      { key: "queryType", kind: "multi", label: "Ticket type", options: typeOpts },
    ],
    raisedBy: [
      { key: "raisedByDept", kind: "multi", label: "Department", options: teamOpts },
      { key: "raisedBy", kind: "multi", label: "Staff", options: staffOpts, search: true },
    ],
    raisedTo: [
      { key: "raisedToDept", kind: "multi", label: "Department / team", options: teamOpts },
      { key: "raisedTo", kind: "multi", label: "Staff", options: staffOpts, search: true },
    ],
    date: [{ key: "date", kind: "date", label: "Raised on" }],
    status: [{ key: "status", kind: "multi", label: "Status", options: statusOpts }],
  };
}

// Column la evvalavu filter active
const activeCount = (fields, filters) =>
  fields.reduce((n, f) => {
    if (f.kind === "date") return n + (filters.fromDate || filters.toDate ? 1 : 0);
    if (f.kind === "text") return n + (String(filters[f.key] || "").trim() ? 1 : 0);
    return n + split(filters[f.key]).length;
  }, 0);

const FunnelIcon = ({ className = "h-3.5 w-3.5", filled }) => (
  <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 5h18l-7 8.5V19l-4 2v-7.5z" />
  </svg>
);

// ─── Popover ────────────────────────────────────────────────────────────────
function FilterPopover({ anchor, title, fields, filters, onApply, onClose }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ top: -9999, left: -9999 });
  const today = todayStr();

  // Draft — Apply pannura varai filters maaraadhu
  const [draft, setDraft] = useState(() => {
    const d = {};
    fields.forEach((f) => {
      if (f.kind === "date") {
        d.fromDate = filters.fromDate || "";
        d.toDate = filters.toDate || "";
      } else if (f.kind === "text") d[f.key] = filters[f.key] || "";
      else d[f.key] = split(filters[f.key]);
    });
    return d;
  });
  const [q, setQ] = useState({}); // option search per field

  useLayoutEffect(() => {
    const place = () => {
      if (!anchor || !ref.current) return;
      const r = anchor.getBoundingClientRect();
      const w = ref.current.offsetWidth;
      const h = ref.current.offsetHeight;
      let left = Math.min(r.left, window.innerWidth - w - 8);
      left = Math.max(8, left);
      let top = r.bottom + 6;
      if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 6);
      setPos({ top, left });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchor]);

  useEffect(() => {
    const onDown = (e) => {
      if (ref.current?.contains(e.target) || anchor?.contains(e.target)) return;
      onClose();
    };
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [anchor, onClose]);

  const toggle = (key, value) =>
    setDraft((d) => ({ ...d, [key]: d[key].includes(value) ? d[key].filter((x) => x !== value) : [...d[key], value] }));

  const commit = (d) => {
    const out = {};
    fields.forEach((f) => {
      if (f.kind === "date") {
        let from = d.fromDate > today ? today : d.fromDate;
        let to = d.toDate > today ? today : d.toDate;
        if (from && to && from > to) [from, to] = [to, from];
        out.fromDate = from || "";
        out.toDate = to || "";
      } else if (f.kind === "text") out[f.key] = String(d[f.key] || "").trim();
      else out[f.key] = join(d[f.key]);
    });
    onApply(out);
    onClose();
  };

  const clearAll = () => {
    const d = {};
    fields.forEach((f) => {
      if (f.kind === "date") {
        d.fromDate = "";
        d.toDate = "";
      } else d[f.key] = f.kind === "text" ? "" : [];
    });
    commit(d);
  };

  const inputCls =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

  const preset = (from, to) => setDraft((d) => ({ ...d, fromDate: from, toDate: to }));

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label={`Filter ${title}`}
      style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 60 }}
      className="w-[19rem] max-w-[calc(100vw-1rem)] rounded-xl border border-gray-200 bg-white text-left text-sm font-normal text-gray-700 shadow-xl"
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target.tagName === "INPUT") {
          e.preventDefault();
          commit(draft);
        }
      }}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
        <p className="font-semibold text-gray-800">Filter · {title}</p>
        <button type="button" onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" aria-label="Close">
          ✕
        </button>
      </div>

      <div className="max-h-[60vh] space-y-4 overflow-y-auto px-3 py-3">
        {fields.map((f) => {
          if (f.kind === "text") {
            return (
              <div key={f.key}>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{f.label}</label>
                <input
                  autoFocus
                  type="text"
                  value={draft[f.key]}
                  onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className={inputCls}
                />
              </div>
            );
          }
          if (f.kind === "date") {
            return (
              <div key={f.key}>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {[
                    ["Today", today, today],
                    ["Yesterday", shiftDays(-1), shiftDays(-1)],
                    ["Last 7 days", shiftDays(-6), today],
                    ["This month", monthStart(), today],
                  ].map(([label, from, to]) => {
                    const on = draft.fromDate === from && draft.toDate === to;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => preset(from, to)}
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          on ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">From</label>
                    <input
                      type="date"
                      value={draft.fromDate}
                      max={draft.toDate || today}
                      onChange={(e) => setDraft((d) => ({ ...d, fromDate: e.target.value }))}
                      className={inputCls + " px-2"}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">To</label>
                    <input
                      type="date"
                      value={draft.toDate}
                      min={draft.fromDate || undefined}
                      max={today}
                      onChange={(e) => setDraft((d) => ({ ...d, toDate: e.target.value }))}
                      className={inputCls + " px-2"}
                    />
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-gray-400">Up to today only</p>
              </div>
            );
          }
          // multi
          const term = (q[f.key] || "").toLowerCase();
          const opts = f.options.filter((o) => !term || o.label.toLowerCase().includes(term) || (o.group || "").toLowerCase().includes(term));
          const allOn = opts.length > 0 && opts.every((o) => draft[f.key].includes(o.value));
          let lastGroup = null;
          return (
            <div key={f.key}>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {f.label}
                  {draft[f.key].length > 0 && <span className="ml-1 text-blue-600">({draft[f.key].length})</span>}
                </label>
                {opts.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        [f.key]: allOn
                          ? d[f.key].filter((v) => !opts.some((o) => o.value === v))
                          : [...new Set([...d[f.key], ...opts.map((o) => o.value)])],
                      }))
                    }
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    {allOn ? "Unselect all" : "Select all"}
                  </button>
                )}
              </div>
              {f.search && f.options.length > 6 && (
                <input
                  type="search"
                  value={q[f.key] || ""}
                  onChange={(e) => setQ((x) => ({ ...x, [f.key]: e.target.value }))}
                  placeholder="Search…"
                  className={inputCls + " mb-1.5 py-1.5"}
                />
              )}
              <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-100">
                {opts.length === 0 && <p className="px-3 py-2 text-xs text-gray-400">Nothing to choose</p>}
                {opts.map((o) => {
                  const showGroup = o.group && o.group !== lastGroup;
                  lastGroup = o.group;
                  return (
                    <React.Fragment key={o.value}>
                      {showGroup && (
                        <p className="sticky top-0 bg-gray-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{o.group}</p>
                      )}
                      <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={draft[f.key].includes(o.value)}
                          onChange={() => toggle(f.key, o.value)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600"
                        />
                        <span className="truncate">{o.label}</span>
                      </label>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-3 py-2">
        <button type="button" onClick={clearAll} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">
          Clear
        </button>
        <button type="button" onClick={() => commit(draft)} className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">
          Apply
        </button>
      </div>
    </div>,
    document.body,
  );
}

// ─── Header cell / button ───────────────────────────────────────────────────
// variant "th" = table header la; "chip" = mobile la filter button
export function ColumnFilter({ label, fields, filters, onApply, variant = "th" }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const n = activeCount(fields, filters);

  const trigger =
    variant === "th" ? (
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Filter ${label}`}
        aria-expanded={open}
        className={`inline-flex h-6 min-w-6 items-center justify-center gap-0.5 rounded-md px-1 transition ${
          n ? "bg-blue-600 text-white" : open ? "bg-blue-100 text-blue-700" : "text-gray-400 hover:bg-blue-100 hover:text-blue-700"
        }`}
      >
        <FunnelIcon filled={!!n} />
        {n > 0 && <span className="text-[10px] font-bold leading-none">{n}</span>}
      </button>
    ) : (
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
          n ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        <FunnelIcon filled={!!n} />
        {label}
        {n > 0 && <span>({n})</span>}
      </button>
    );

  return (
    <>
      {variant === "th" ? (
        <span className="inline-flex items-center gap-1.5">
          {label}
          {trigger}
        </span>
      ) : (
        trigger
      )}
      {open && (
        <FilterPopover
          anchor={btnRef.current}
          title={label}
          fields={fields}
          filters={filters}
          onApply={onApply}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

// ─── Active filter chips + Clear all ───────────────────────────────────────
// columns = [{ label, fields }]
export function ActiveFilterChips({ columns, filters, onApply, onClearAll, extra }) {
  const chips = useMemo(() => {
    const out = [];
    columns.forEach((c) =>
      c.fields.forEach((f) => {
        if (f.kind === "date") {
          if (filters.fromDate || filters.toDate) {
            const text =
              filters.fromDate && filters.toDate
                ? filters.fromDate === filters.toDate
                  ? fmtDay(filters.fromDate)
                  : `${fmtDay(filters.fromDate)} – ${fmtDay(filters.toDate)}`
                : filters.fromDate
                  ? `from ${fmtDay(filters.fromDate)}`
                  : `till ${fmtDay(filters.toDate)}`;
            out.push({ id: "date", label: c.label, text, clear: { fromDate: "", toDate: "" } });
          }
        } else if (f.kind === "text") {
          const v = String(filters[f.key] || "").trim();
          if (v) out.push({ id: f.key, label: f.label.replace(/ contains$/, ""), text: `"${v}"`, clear: { [f.key]: "" } });
        } else {
          const vals = split(filters[f.key]);
          if (!vals.length) return;
          const names = vals.map((v) => f.options.find((o) => o.value === v)?.label || v);
          const lbl = f.key.endsWith("Dept") ? `${c.label} · Dept` : f.key === "raisedBy" || f.key === "raisedTo" ? c.label : f.label;
          out.push({
            id: f.key,
            label: lbl,
            text: names.length > 2 ? `${names.slice(0, 2).join(", ")} +${names.length - 2}` : names.join(", "),
            title: names.join(", "),
            clear: { [f.key]: "" },
          });
        }
      }),
    );
    return out;
  }, [columns, filters]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <span
          key={c.id}
          title={c.title}
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 py-1 pl-3 pr-1.5 text-xs text-blue-900"
        >
          <span className="font-semibold">{c.label}:</span>
          <span className="truncate">{c.text}</span>
          <button
            type="button"
            onClick={() => onApply(c.clear)}
            className="flex h-5 w-5 items-center justify-center rounded-full text-blue-500 hover:bg-blue-100 hover:text-blue-800"
            aria-label={`Remove ${c.label} filter`}
          >
            ✕
          </button>
        </span>
      ))}
      {chips.length > 0 && (
        <button type="button" onClick={onClearAll} className="text-xs font-semibold text-red-600 hover:underline">
          Clear all
        </button>
      )}
      {extra}
    </div>
  );
}

