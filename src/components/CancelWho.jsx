// ══════════════════════════════════════════════════════════════════════════════
// Traveller cancellation — yaaru request panna, yaaru approve / reject panna.
// Tour Bookings, Payment Dashboard maadhiri pages la use pannalaam.
//
//   <TravellerCancelInfo traveller={t} />
//
// Backend save pannuradhu: traveller.cancelled.requestedBy / decidedBy
//   { type: "staff"|"touradmin"|"admin"|"user", name, role, email, at }
// Pazhaya records la per illa — appo status + date mattum varum.
// ══════════════════════════════════════════════════════════════════════════════
import React from "react";

export const cancelWho = (p) => {
  if (!p) return "";
  const name = p.name || "";
  if (p.type === "staff") return `${name || "Staff"}${p.role ? ` · ${p.role}` : ""} (Staff portal)`;
  if (p.type === "touradmin") return name && name !== "Tour admin" ? `${name} (Tour admin)` : "Tour admin";
  if (p.type === "admin") return name && name !== "Admin" ? `${name} (Admin)` : "Admin";
  if (p.type === "user") return `${name || "Customer"} (Customer · website)`;
  return name;
};

const when = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
    : "";

// traveller → { status, requestedBy, requestedAt, decidedBy, decidedAt } | null
export const travellerCancelInfo = (t) => {
  const c = t?.cancelled || {};
  const ci = t?.cancelInfo || null; // Tour Bookings backend anuppuradhu (irundha)
  if (!c.byTraveller && !c.byAdmin && !ci) return null;
  if (c.viaTripCancel && !(c.byTraveller && c.byAdmin)) return null; // Trip cancel (no charge) — thani
  const status = c.byTraveller && c.byAdmin ? "approved" : c.byAdmin ? "rejected" : ci?.status || "requested";
  return {
    status,
    requestedBy: c.requestedBy || ci?.requestedBy || null,
    requestedAt: c.requestedBy?.at || ci?.requestedAt || (!c.byAdmin ? c.cancelledAt : null) || null,
    decidedBy: c.decidedBy || ci?.decidedBy || null,
    decidedAt: c.decidedBy?.at || ci?.decidedAt || (c.byAdmin ? c.cancelledAt : null) || null,
  };
};

const STATUS_TEXT = {
  requested: { label: "Cancellation Requested", cls: "text-orange-700" },
  approved: { label: "Cancelled", cls: "text-red-700" },
  rejected: { label: "Rejected by Admin", cls: "text-gray-700" },
};

export function TravellerCancelInfo({ traveller, showStatus = true }) {
  const info = travellerCancelInfo(traveller);
  if (!info) return null;
  const req = cancelWho(info.requestedBy);
  const dec = cancelWho(info.decidedBy);
  const st = STATUS_TEXT[info.status] || STATUS_TEXT.requested;
  const decLabel = info.status === "approved" ? "Approved" : info.status === "rejected" ? "Rejected" : "";
  return (
    <div className="mt-1.5 rounded-lg border border-orange-100 bg-orange-50/60 px-2.5 py-1.5 text-xs text-gray-700">
      {showStatus && <p className={`font-semibold ${st.cls}`}>{st.label}</p>}
      {(req || info.requestedAt) && (
        <p>
          <span className="font-semibold text-orange-800">Requested</span>
          {req ? <> by <b>{req}</b></> : ""}
          {info.requestedAt ? ` · ${when(info.requestedAt)}` : ""}
        </p>
      )}
      {decLabel && (dec || info.decidedAt) && (
        <p>
          <span className={`font-semibold ${info.status === "approved" ? "text-green-700" : "text-red-700"}`}>{decLabel}</span>
          {dec ? <> by <b>{dec}</b></> : ""}
          {info.decidedAt ? ` · ${when(info.decidedAt)}` : ""}
        </p>
      )}
    </div>
  );
}

export default TravellerCancelInfo;
