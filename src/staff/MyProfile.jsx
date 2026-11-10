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

function fmtDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function calcAge(dob) {
  if (!dob) return "";
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age >= 0 ? `${age} years` : "";
}

function durationBetween(from, to) {
  const a = new Date(from);
  const b = to ? new Date(to) : new Date();
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) return "";
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) months--;
  if (months < 1) return "Less than a month";
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y ? `${y} yr${y > 1 ? "s" : ""}` : "", m ? `${m} mo${m > 1 ? "s" : ""}` : ""].filter(Boolean).join(" ");
}

function getHistory(staff) {
  if (Array.isArray(staff.employmentHistory) && staff.employmentHistory.length) return staff.employmentHistory;
  if (!staff.dateOfJoining) return [];
  return [{ joinedOn: staff.dateOfJoining, relievedOn: staff.status === "Inactive" ? staff.relievedOn || null : null, relievingReason: staff.relievingReason || "" }];
}

const linkCls = "text-blue-700";
const tel = (n) => (n ? <a className={linkCls} href={`tel:${String(n).replace(/[^\d+]/g, "")}`}>{n}</a> : null);

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
  const history = [...getHistory(staff)].reverse();
  const skills = Array.isArray(staff.skills) ? staff.skills : [];
  const wa = staff.whatsappNumber ? String(staff.whatsappNumber).replace(/\D/g, "") : "";

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
              {staff.staffType && <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-semibold text-white">{staff.staffType}</span>}
              {staff.dateOfJoining && <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-semibold text-white">📅 Joined {fmtDate(staff.dateOfJoining)}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        <p className="rounded-xl bg-slate-50 px-4 py-2.5 text-[13px] text-slate-500">
          🔒 This is view-only. To change any details, please contact HR.
        </p>

        <Section icon="👤" title="Basic Details">
          <Row label="Employee ID" value={staff.employeeId} />
          <Row label="Name" value={staff.fullName} />
          <Row label="Date of birth" value={fmtDate(staff.dateOfBirth)} />
          <Row label="Age" value={calcAge(staff.dateOfBirth) || (staff.age ? `${staff.age} years` : "")} />
          <Row label="Gender" value={staff.gender} />
          <Row label="Marital status" value={staff.maritalStatus} />
          <Row label="Mobile number" value={tel(staff.mobileNumber)} />
          <Row label="Alternate number" value={tel(staff.alternateNumber)} />
          <Row
            label="WhatsApp number"
            value={wa ? <a className={linkCls} href={`https://wa.me/${wa.length === 10 ? "91" + wa : wa}`} target="_blank" rel="noreferrer">{staff.whatsappNumber}</a> : null}
          />
          <Row label="Email" value={staff.email ? <a className={linkCls} href={`mailto:${staff.email}`}>{staff.email}</a> : null} />
          <Row label="Address" value={staff.currentAddress} />
          <Row label="Permanent address" value={staff.sameAsCurrent ? "Same as current address" : staff.permanentAddress} />
        </Section>

        <Section icon="💼" title="Job Details">
          <Row label="Designation" value={staff.designation} />
          <Row label="Staff type" value={staff.staffType} />
          <Row label="Department" value={staff.department} />
          <Row label="Reporting manager" value={staff.reportingManager} />
          <Row label="Joining date" value={fmtDate(staff.dateOfJoining)} />
          <Row label="Status" value={staff.status} />
        </Section>

        {history.length > 0 && (
          <Section icon="🗓️" title="Employment History">
            <ol className="mt-1">
              {history.map((h, idx) => {
                const current = idx === 0 && !h.relievedOn;
                const last = idx === history.length - 1;
                const stintNo = history.length - idx;
                return (
                  <li key={h._id || idx} className="relative flex gap-3">
                    <div className="flex flex-col items-center" aria-hidden="true">
                      <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ring-4 ring-white ${current ? "bg-green-500" : "bg-slate-400"}`} />
                      {!last && <span className="w-px flex-1 bg-slate-200" />}
                    </div>
                    <div className={`min-w-0 flex-1 ${last ? "" : "pb-4"}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-semibold text-slate-800">{stintNo === 1 ? "First joining" : `Rejoining ${stintNo - 1}`}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${current ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                          {current ? "Current" : "Previous"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[13.5px] text-slate-700">
                        Joined <b>{fmtDate(h.joinedOn) || "—"}</b>
                        <span className="mx-1.5 text-slate-300" aria-hidden="true">→</span>
                        {h.relievedOn ? <>Relieved <b>{fmtDate(h.relievedOn)}</b></> : <b className="text-green-700">Present</b>}
                      </p>
                      <p className="text-[12.5px] text-slate-500">
                        {durationBetween(h.joinedOn, h.relievedOn)}
                        {h.relievingReason ? ` · ${h.relievingReason}` : ""}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Section>
        )}

        <Section icon="🔐" title="Staff Portal Login">
          <Row label="Username" value={staff.username ? <span className="font-mono">{staff.username}</span> : null} />
          <Row label="Role" value={staff.role?.name} />
          <Row label="Last login" value={fmtDateTime(staff.lastLogin)} />
          <Row label="Password" value="•••••••• (ask HR to reset)" />
        </Section>

        <Section icon="🧭" title="My Access">
          {!tabs.length && <Row label="Tabs" value={null} />}
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
                      {STAFF_TAB_LABEL[t] || t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </Section>

        <Section icon="🎓" title="Study Details">
          <Row label="Qualification" value={staff.qualification} />
          <Row label="Specialization" value={staff.specialization} />
          <Row label="College / University" value={staff.collegeOrUniversity} />
          <Row label="Year of passing" value={staff.yearOfPassing} />
          <Row label="Working experience" value={staff.experience} />
          <Row
            label="Skills"
            value={
              skills.length ? (
                <span className="inline-flex flex-wrap justify-end gap-1.5">
                  {skills.map((s) => (
                    <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-[12px] font-medium text-slate-700">{s}</span>
                  ))}
                </span>
              ) : null
            }
          />
        </Section>

        <Section icon="📄" title="Documents">
          <Row
            label="Resume"
            value={staff.resume ? <a className="text-blue-700 underline underline-offset-2" href={staff.resume} target="_blank" rel="noreferrer">View / download</a> : null}
          />
          <Row label="Aadhar number" value={maskDigits(staff.aadharNumber)} />
          <Row label="PAN number" value={staff.panNumber} />
        </Section>

        <Section icon="🏦" title="Bank Details">
          <Row label="Account number" value={maskDigits(staff.bankAccountNumber)} />
          <Row label="IFSC code" value={staff.bankIfscCode} />
          <Row label="Account holder name" value={staff.bankAccountName} />
          <Row label="Account type" value={staff.bankAccountType} />
          <Row label="Branch name" value={staff.bankBranchName} />
          <Row label="Branch code" value={staff.bankBranchCode} />
          <Row label="Swift code" value={staff.bankSwiftCode} />
        </Section>

        <Section icon="🚨" title="Emergency Contact">
          <Row label="Name" value={staff.emergencyName} />
          <Row label="Relation" value={staff.emergencyRelation} />
          <Row label="Phone number" value={tel(staff.emergencyNumber)} />
        </Section>
      </div>
    </div>
  );
}
