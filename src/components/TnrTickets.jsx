// ══════════════════════════════════════════════════════════════════════════════
// Oru booking (TNR) la raise aana tickets — Tour Bookings maadhiri viewing pages la.
// Ticket no (copy), title, description, status, yaaru → yaarukku, eppo.
// Card expand pannumbodhu mattum load aagum (ellaa booking kum ore neram illa).
//
// Use:  <TnrTickets api={ticketApi} tnr={booking.tnr} />
//   api = TourContext / TourAdminContext la irukkura ticketApi (getQueries venum).
//   Staff login la avangaloda tickets mattum dhaan varum (backend scope).
// ══════════════════════════════════════════════════════════════════════════════
import React, { useCallback, useEffect, useState } from "react";
import { CopyTicketNo, personName, roleName, toName } from "../staff/ticketWho";

const STATUS = {
  open: { label: "Open", cls: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-500", bar: "border-l-sky-500" },
  pickup: { label: "Picked up", cls: "bg-violet-50 text-violet-700 ring-violet-200", dot: "bg-violet-500", bar: "border-l-violet-500" },
  processing: { label: "Processing", cls: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500", bar: "border-l-amber-500" },
  close: { label: "Closed", cls: "bg-green-50 text-green-700 ring-green-200", dot: "bg-green-500", bar: "border-l-green-500" },
  reject: { label: "Rejected", cls: "bg-red-50 text-red-700 ring-red-200", dot: "bg-red-500", bar: "border-l-red-500" },
};

// "Raised by / Raised to" — chinna label, keezha per + team
const Who = ({ label, name, team }) => (
  <div className="min-w-0">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
    <p className="truncate text-[13px] font-semibold text-gray-800" title={team ? `${name} · ${team}` : name}>
      {name}
      {team && <span className="font-normal text-gray-500"> · {team}</span>}
    </p>
  </div>
);
const fmt = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "";

const nameOf = (s) => personName(s) || "—";

export default function TnrTickets({ api, tnr, title = "Tickets" }) {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!tnr || !api?.getQueries) return;
    setLoading(true);
    setError("");
    try {
      const want = String(tnr).trim().toUpperCase();
      const data = await api.getQueries({ tnr: want, page: 1, limit: 100 });
      // Indha TNR ku raise aanadhu MATTUM (backend filter illaadha pazhaya server la um safe)
      const mine = (data?.queries || []).filter((q) => String(q.tnr || "").trim().toUpperCase() === want);
      setList(mine);
      setTotal(mine.length);
    } catch (err) {
      setError(err?.message || "Couldn't load tickets");
    } finally {
      setLoading(false);
    }
  }, [api, tnr]);

  useEffect(() => {
    load();
  }, [load]);

  if (!tnr) return null;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-800">
          {title}
          {!loading && !error && <span className="ml-1 font-normal text-gray-500">({total})</span>}
        </h3>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            load();
          }}
          disabled={loading}
          className="text-xs font-semibold text-blue-600 hover:underline disabled:text-gray-400"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {!loading && !error && list.length === 0 && (
        <p className="italic text-gray-500">No tickets raised for TNR {tnr}</p>
      )}

      {list.length > 0 && (
        <ul className="space-y-2">
          {list.map((q) => {
            const st = STATUS[q.status] || { label: q.status, cls: "bg-gray-100 text-gray-700 ring-gray-200", dot: "bg-gray-400", bar: "border-l-gray-300" };
            const from = nameOf(q.raisedBy);
            const to = toName(q, nameOf);
            return (
              <li
                key={q._id}
                className={`rounded-xl border border-l-4 border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:shadow-md ${st.bar}`}
              >
                {/* Mela: ticket no + title | status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <CopyTicketNo no={q.ticketNo} />
                    <p className="min-w-0 truncate text-[15px] font-semibold capitalize text-gray-900" title={q.subject}>
                      {q.subject}
                    </p>
                  </div>
                  <span className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${st.cls}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                    {st.label}
                  </span>
                </div>

                {/* Description — irundha mattum */}
                {q.description && (
                  <p className="mt-1.5 line-clamp-2 break-words text-[13px] leading-5 text-gray-600" title={q.description}>
                    {q.description}
                  </p>
                )}

                {/* Keezha: yaaru → yaarukku | type · date */}
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-gray-100 pt-2.5 text-xs">
                  <div className="flex min-w-0 items-center gap-6">
                    <Who label="Raised by" name={from} team={roleName(q.raisedBy)} />
                    <Who label="Raised to" name={to} team={q.raisedTo ? roleName(q.raisedTo) : ""} />
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    {q.queryType && (
                      <span className="rounded-md bg-gray-100 px-1.5 py-0.5 font-semibold text-gray-600">{q.queryType}</span>
                    )}
                    <span className="whitespace-nowrap">{fmt(q.createdAt)}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
