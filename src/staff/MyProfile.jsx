import { useContext, useEffect } from "react";
import { StaffContext } from "./StaffContext";
import { STAFF_TAB_GROUPS, STAFF_TAB_GROUP, STAFF_TAB_LABEL } from "../config/staffTabs";

// Staff ku sondha profile — VIEW ONLY. Edit HR (Tour Admin) mattum.

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function maskDigits(value) {
  if (!value) return null;
  const s = String(value);
  return s.length <= 4 ? s : "•".repeat(s.length - 4) + s.slice(-4);
}

function Row({ label, value }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-0.5 border-b border-slate-100 py-2.5 text-[14px] last:border-b-0">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="min-w-0 max-w-full break-words text-right font-medium text-slate-800 sm:max-w-[65%]">
        {value === null || value === undefined || value === "" ? <span className="text-slate-300">—</span> : value}
      </span>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="mb-2 flex items-center gap-2 text-[15px] font-bold text-blue-800">
        <span aria-hidden="true">{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

export default function MyProfile() {
  const { staff, refreshMe, loadingMe } = useContext(StaffContext);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  if (!staff) {
    return <div className="p-10 text-center text-[14px] text-slate-500">{loadingMe ? "Loading your profile…" : "Could not load your profile."}</div>;
  }

  const tabs = staff.role?.tabs || [];
  const initials = String(staff.fullName || "?")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-4 mt-16 mb-6 max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:mx-6 sm:rounded-3xl lg:mt-10">
      <div className="bg-gradient-to-r from-blue-800 to-blue-700 px-5 py-6 sm:px-6">
        <div className="flex items-center gap-4">
          {staff.photo ? (
            <img src={staff.photo} alt="" className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md" />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-blue-900/40 text-[26px] font-bold text-white">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-[22px] font-bold text-white">{staff.fullName}</h1>
            <p className="text-[14px] text-blue-100">
              {staff.designation}
              {staff.department ? ` · ${staff.department}` : ""}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-2 text-[12.5px]">
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-semibold text-white">🪪 {staff.employeeId}</span>
              {staff.role?.name && <span className="rounded-full bg-white px-2.5 py-0.5 font-semibold text-blue-800">👥 {staff.role.name}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        <p className="rounded-xl bg-slate-50 px-4 py-2.5 text-[13px] text-slate-500">
          🔒 This is view-only. To change any details, please contact HR.
        </p>

        <Section icon="👤" title="Basic Details">
          <Row label="Name" value={staff.fullName} />
          <Row label="Username" value={staff.username ? <span className="font-mono">{staff.username}</span> : null} />
          <Row label="Date of birth" value={fmtDate(staff.dateOfBirth)} />
          <Row label="Gender" value={staff.gender} />
          <Row label="Mobile number" value={staff.mobileNumber} />
          <Row label="Email" value={staff.email} />
          <Row label="Address" value={staff.currentAddress} />
        </Section>

        <Section icon="💼" title="Job Details">
          <Row label="Employee ID" value={staff.employeeId} />
          <Row label="Designation" value={staff.designation} />
          <Row label="Department" value={staff.department} />
          <Row label="Reporting manager" value={staff.reportingManager} />
          <Row label="Joining date" value={fmtDate(staff.dateOfJoining)} />
          <Row label="Staff type" value={staff.staffType} />
        </Section>

        <Section icon="🔐" title="My Access">
          <Row label="Role" value={staff.role?.name} />
          {STAFF_TAB_GROUPS.map((g) => {
            const groupTabs = tabs.filter((t) => STAFF_TAB_GROUP[t] === g.key);
            if (!groupTabs.length) return null;
            return (
              <div key={g.key} className="border-b border-slate-100 py-2.5 last:border-b-0">
                <p className="mb-1.5 text-[12.5px] font-semibold text-slate-500">
                  {g.icon} {g.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {groupTabs.map((t) => (
                    <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-[12px] font-medium text-slate-700">
                      {STAFF_TAB_LABEL[t]}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </Section>

        {(staff.bankAccountNumber || staff.bankIfscCode) && (
          <Section icon="🏦" title="Bank Details">
            <Row label="Account number" value={maskDigits(staff.bankAccountNumber)} />
            <Row label="IFSC code" value={staff.bankIfscCode} />
            <Row label="Account holder name" value={staff.bankAccountName} />
          </Section>
        )}
      </div>
    </div>
  );
}
