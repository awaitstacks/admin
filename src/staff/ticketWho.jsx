// ══════════════════════════════════════════════════════════════════════════════
// Tickets — "yaar, enga irundhu" helpers. Admin (RaiseTicket) + Tour Admin
// (TicketLanding) rendu page um, staff site um idha use pannum.
// Pazhaya tickets / replies (staff fields illaadhadhu) pazhaya maari dhaan kaattum.
// ══════════════════════════════════════════════════════════════════════════════

export const personName = (s) => s?.fullName || s?.name || s?.staffName || "";
export const roleName = (s) => (s?.role && typeof s.role === "object" ? s.role.name || "" : "");

// Ticket endha side la irundhu raise aachu
export const ticketSource = (q) =>
  q?.raisedByStaffLogin ? "staff" : q?.raisedVia === "touradmin" ? "touradmin" : "admin";

const SOURCE = {
  admin: { label: "Admin", cls: "bg-sky-50 text-sky-700" },
  touradmin: { label: "Tour admin", cls: "bg-violet-50 text-violet-700" },
  staff: { label: "Staff portal", cls: "bg-amber-50 text-amber-700" },
};

export function SourceBadge({ q }) {
  const s = SOURCE[ticketSource(q)];
  return (
    <span className={`mt-1 inline-block whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-semibold ${s.cls}`}>{s.label}</span>
  );
}

// Reply en-oda dhaana (edit / delete / right side la kaatta)
//   side = "admin" | "touradmin" (indha page), me = staff site la login staff (illana null)
export function isMyReply(r, side, me) {
  if (me) return !!r.byStaffLogin && String(r.staff?._id || r.staff) === String(me._id);
  return r.from === side && !r.byStaffLogin;
}

// Reply yaar — "Sangeetha · BAT (Staff)", "Tour admin", "Admin"
export function replyLabel(r) {
  if (r.byStaffLogin) {
    const name = personName(r.staff) || "Staff";
    const role = roleName(r.staff);
    return `${name}${role ? ` · ${role}` : ""} (Staff)`;
  }
  const side = r.from === "touradmin" ? "Tour admin" : "Admin";
  const name = personName(r.staff);
  return name ? `${side} · ${name}` : side;
}

export const replyName = (r) =>
  personName(r.staff) || (r.byStaffLogin ? "Staff" : r.from === "touradmin" ? "Tour admin" : "Admin");

// Dropdown — role wise group (BAT, Ticketing Team...). Role illaadhavanga "Other staff".
export function groupStaffByRole(list = []) {
  const groups = new Map();
  list.forEach((s) => {
    const key = roleName(s) || "Other staff";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  });
  return [...groups.entries()]
    .sort(([a], [b]) => (a === "Other staff" ? 1 : b === "Other staff" ? -1 : a.localeCompare(b)))
    .map(([label, items]) => ({ label, items }));
}

// exclude = indha staff ah list la kaattaadha (eg: Raised to la "naane" varakoodadhu)
export function StaffOptions({ staff, exclude }) {
  const list = exclude ? (staff || []).filter((s) => String(s._id) !== String(exclude)) : staff;
  return groupStaffByRole(list).map((g) => (
    <optgroup key={g.label} label={g.label}>
      {g.items.map((s) => (
        <option key={s._id} value={s._id}>
          {personName(s)}
          {s.employeeId ? ` (${s.employeeId})` : ""}
          {s.designation ? ` · ${s.designation}` : ""}
        </option>
      ))}
    </optgroup>
  ));
}

// TNR lookup result card (raise form la)
export function TnrInfo({ info }) {
  if (!info) return null;
  if (info.error) return <p className="mt-2 text-sm text-red-600">{info.error}</p>;
  return (
    <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2.5 text-sm text-gray-700">
      <p className="font-semibold text-blue-900">
        {info.tnr}
        {info.tourTitle ? ` · ${info.tourTitle}` : ""}
      </p>
      {info.travellerName && <p>Traveller: {info.travellerName}</p>}
      {info.staff ? (
        <p>
          Booked by: <b>{info.staff.fullName}</b>
          {info.staff.employeeId ? ` (${info.staff.employeeId})` : ""}
          {info.staff.role?.name ? ` · ${info.staff.role.name}` : ""}
          {!info.staff.active && <span className="ml-1 text-red-600">— inactive, choose someone else</span>}
          {info.selfBooked && <span className="ml-1 text-red-600">— that's you, choose who to raise it to</span>}
        </p>
      ) : info.bookedBy?.name ? (
        <p>
          Booked by: {info.bookedBy.name}
          {info.bookedBy.employeeId ? ` (${info.bookedBy.employeeId})` : ""} — staff profile not found, choose manually
        </p>
      ) : (
        <p className="text-gray-500">No staff linked to this booking (online booking) — choose "Raised to" manually</p>
      )}
    </div>
  );
}

// ─── Team (department) tickets ──────────────────────────────────────────────
// Staff list la irundhu teams (role) — [{ _id, name, count }]
export function teamsFromStaff(list = []) {
  const map = new Map();
  list.forEach((s) => {
    const r = s?.role && typeof s.role === "object" ? s.role : null;
    if (!r?._id) return;
    const key = String(r._id);
    if (!map.has(key)) map.set(key, { _id: key, name: r.name || "Team", count: 0 });
    map.get(key).count += 1;
  });
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

const teamName = (q) => (q?.raisedToRole && typeof q.raisedToRole === "object" ? q.raisedToRole.name : "") || "Team";

// Team ku raise aagi innum yaarum pick pannala
export const isTeamOpen = (q) => !!q?.raisedToRole && !q?.raisedTo;

// "Raised to" column — peru / team
export const toName = (q, nameFn) => (q?.raisedTo ? nameFn(q.raisedTo) : q?.raisedToRole ? `${teamName(q)} team` : "—");
export const toSub = (q, roleFn) => {
  if (isTeamOpen(q)) return "Waiting for pickup";
  const role = q?.raisedTo ? roleFn(q.raisedTo) : "";
  return q?.raisedToRole ? [role, `via ${teamName(q)} team`].filter(Boolean).join(" · ") : role;
};

// Raise form la "Person / Team" switch (staff site mattum)
export function ToModeSwitch({ value, onChange }) {
  const btn = (key, label) => (
    <button
      type="button"
      onClick={() => onChange(key)}
      className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
        value === key ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  );
  return (
    <span className="ml-2 inline-flex rounded-lg bg-gray-100 p-0.5 align-middle">
      {btn("person", "Person")}
      {btn("team", "Team")}
    </span>
  );
}
