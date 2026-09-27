import { useState, useEffect, useMemo, useRef, useContext } from "react";
import { TourContext } from "../../context/TourContext";

const GENDERS = ["Male", "Female", "Other"];
const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed"];
const STATUSES = ["Active", "Inactive"];
const STAFF_TYPES = ["Admin Staff", "Field Staff"];
const RELIEVING_REASONS = ["Resigned", "Terminated", "Contract ended", "Long leave", "Other"];

const EMPTY_FORM = {
  fullName: "", designation: "", department: "", reportingManager: "",
  dateOfJoining: "", dateOfBirth: "", gender: "", maritalStatus: "", status: "Active", staffType: "Admin Staff",
  mobileNumber: "", alternateNumber: "", whatsappNumber: "", email: "", currentAddress: "", sameAsCurrent: false, permanentAddress: "",
  emergencyName: "", emergencyRelation: "", emergencyNumber: "",
  qualification: "", specialization: "", collegeOrUniversity: "", yearOfPassing: "",
  experience: "", skills: "",
  // Relieve pannum bodhu
  relievedOn: "", relievingReason: "",
};

const AVATAR_COLORS = [
  "bg-blue-700", "bg-sky-700", "bg-indigo-700", "bg-blue-600",
  "bg-cyan-700", "bg-blue-800", "bg-sky-600",
];

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function hashColor(name) {
  let h = 0;
  const s = String(name || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

// "2 yrs 3 mos" madhiri — evlo naal work pannanga
function durationBetween(from, to) {
  const a = new Date(from);
  const b = to ? new Date(to) : new Date();
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) return "";
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) months -= 1;
  if (months < 1) return "Less than a month";
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y ? `${y} yr${y > 1 ? "s" : ""}` : "", m ? `${m} mo${m > 1 ? "s" : ""}` : ""].filter(Boolean).join(" ");
}

// Pazhaya staff ku history illana ippo irukura joining date vechu oru stint kaatum
function getHistory(staff) {
  if (Array.isArray(staff.employmentHistory) && staff.employmentHistory.length) return staff.employmentHistory;
  if (!staff.dateOfJoining) return [];
  return [{
    joinedOn: staff.dateOfJoining,
    relievedOn: staff.status === "Inactive" ? staff.relievedOn || null : null,
    relievingReason: staff.relievingReason || "",
  }];
}

function telHref(phone) {
  return `tel:${String(phone).replace(/[^\d+]/g, "")}`;
}

// Age is derived from date of birth — never entered by hand
function calcAge(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const beforeBirthday =
    today.getMonth() < d.getMonth() ||
    (today.getMonth() === d.getMonth() && today.getDate() < d.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 ? age : null;
}

const PHONE_RE = /^[+()\d][\d\s()+\-]{5,}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(form, origStatus) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Enter the full name.";
  if (!form.designation.trim()) errors.designation = "Enter the designation.";
  if (!form.mobileNumber.trim()) errors.mobileNumber = "Enter a mobile number.";
  else if (!PHONE_RE.test(form.mobileNumber.trim())) errors.mobileNumber = "Enter a valid mobile number.";
  if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) errors.email = "Enter a valid email address.";
  if (form.emergencyNumber.trim() && !PHONE_RE.test(form.emergencyNumber.trim())) {
    errors.emergencyNumber = "Enter a valid phone number.";
  }
  // Relieve: date venum, joining date ku munnadi irukka koodadhu
  if (form.status === "Inactive" && origStatus !== "Inactive") {
    if (!form.relievedOn) errors.relievedOn = "Enter the relieving date.";
    else if (form.dateOfJoining && form.relievedOn < form.dateOfJoining) {
      errors.relievedOn = "Relieving date can't be before the joining date.";
    }
  }
  // Rejoin: puthu joining date venum
  if (origStatus === "Inactive" && form.status === "Active" && !form.dateOfJoining) {
    errors.dateOfJoining = "Enter the new joining date.";
  }
  return errors;
}

function buildFormData(form, photoFile, removePhoto) {
  const fd = new FormData();
  const textFields = [
    "fullName", "designation", "department", "reportingManager", "status", "staffType", "gender", "maritalStatus",
    "mobileNumber", "alternateNumber", "whatsappNumber", "email", "currentAddress", "permanentAddress",
    "emergencyName", "emergencyRelation", "emergencyNumber",
    "qualification", "specialization", "collegeOrUniversity", "yearOfPassing", "experience",
  ];
  textFields.forEach((key) => fd.append(key, form[key] ?? ""));
  fd.append("age", calcAge(form.dateOfBirth) ?? "");
  fd.append("dateOfJoining", form.dateOfJoining || "");
  fd.append("dateOfBirth", form.dateOfBirth || "");
  fd.append("sameAsCurrent", form.sameAsCurrent ? "true" : "false");
  fd.append("skills", form.skills);
  // Inactive na mattum relieving details anuppuvom
  if (form.status === "Inactive") {
    fd.append("relievedOn", form.relievedOn || "");
    fd.append("relievingReason", form.relievingReason || "");
  }
  if (photoFile) fd.append("photo", photoFile);
  else if (removePhoto) fd.append("removePhoto", "true");
  return fd;
}

const inputClass =
  "w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px] text-slate-900 " +
  "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 " +
  "disabled:bg-slate-100 disabled:text-slate-400";

/* ---------- shared bits ---------- */

function Crown() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-[18px]" aria-hidden="true">
      👑
    </span>
  );
}

function Avatar({ staff, size = 44, ring }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.36) };
  if (staff.photo) {
    return (
      <img
        src={staff.photo}
        alt=""
        style={style}
        className={`shrink-0 rounded-full object-cover ${ring ? "border-4 border-white shadow-md" : ""}`}
      />
    );
  }
  return (
    <div
      style={style}
      className={`grid shrink-0 place-items-center rounded-full font-bold text-white ${hashColor(staff.fullName)} ${
        ring ? "border-4 border-white shadow-md" : ""
      }`}
      aria-hidden="true"
    >
      {initials(staff.fullName)}
    </div>
  );
}

function StatusPill({ status }) {
  const active = status !== "Inactive";
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
        active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-green-500" : "bg-slate-400"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// Tells an office-side admin profile apart from a field / tour-manager profile
function StaffTypeBadge({ type }) {
  const isField = type === "Field Staff";
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
        isField ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
      }`}
    >
      {isField ? "🧭 Field Staff" : "🏢 Admin Staff"}
    </span>
  );
}

function RejoinedBadge() {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full bg-violet-50 px-2 py-0.5 text-[11.5px] font-semibold text-violet-700">
      Rejoined
    </span>
  );
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

function SectionCard({ icon, title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="mb-1 flex items-center gap-2 text-[15px] font-bold text-blue-800">
        <span aria-hidden="true">{icon}</span> {title}
      </h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Field({ label, required, error, help, wide, children }) {
  return (
    <label className={`flex min-w-0 flex-col gap-1.5 ${wide ? "col-span-2 max-[559px]:col-span-1" : ""}`}>
      <span className="text-[13.5px] font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-blue-700">*</span>}
      </span>
      {children}
      {help && <span className="text-[12.5px] text-slate-500">{help}</span>}
      {error && <small className="text-[12.5px] font-medium text-red-600">{error}</small>}
    </label>
  );
}

/* ---------- app ---------- */

export default function StaffProfiles() {
  const {
    staffList: staff,
    staffLoading: loading,
    staffError: loadError,
    getAllStaff,
    createStaff: createStaffApi,
    updateStaff: updateStaffApi,
    deleteStaff: deleteStaffApi,
  } = useContext(TourContext);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [detailStaff, setDetailStaff] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [origStatus, setOrigStatus] = useState("Active"); // edit open pannum bodhu irundha status
  const [origJoining, setOrigJoining] = useState(""); // edit open pannum bodhu irundha joining date
  const [formErrors, setFormErrors] = useState({});
  const [formServerError, setFormServerError] = useState("");
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [removePhoto, setRemovePhoto] = useState(false);
  const fileInputRef = useRef(null);

  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { getAllStaff(); }, [getAllStaff]);

  // keep the open detail card in sync after edits/refresh
  useEffect(() => {
    if (!detailStaff) return;
    const fresh = staff.find((s) => s._id === detailStaff._id);
    if (fresh && fresh !== detailStaff) setDetailStaff(fresh);
  }, [staff, detailStaff]);

  const visibleStaff = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...staff].sort((a, b) => (a.fullName || "").localeCompare(b.fullName || "", "en", { sensitivity: "base" }));
    return sorted.filter((s) => {
      if (typeFilter !== "All" && (s.staffType || "Admin Staff") !== typeFilter) return false;
      if (!q) return true;
      return [s.fullName, s.employeeId, s.designation, s.department, s.mobileNumber]
        .some((v) => String(v || "").toLowerCase().includes(q));
    });
  }, [staff, query, typeFilter]);

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOrigStatus("Active");
    setOrigJoining("");
    setFormErrors({});
    setFormServerError("");
    setPhotoFile(null);
    setPhotoPreview("");
    setRemovePhoto(false);
    setFormOpen(true);
  }

  function openEditForm(s) {
    setEditingId(s._id);
    setOrigStatus(s.status || "Active");
    setOrigJoining(s.dateOfJoining ? s.dateOfJoining.slice(0, 10) : "");
    setForm({
      fullName: s.fullName || "",
      designation: s.designation || "",
      department: s.department || "",
      reportingManager: s.reportingManager || "",
      dateOfJoining: s.dateOfJoining ? s.dateOfJoining.slice(0, 10) : "",
      dateOfBirth: s.dateOfBirth ? s.dateOfBirth.slice(0, 10) : "",
      gender: s.gender || "",
      maritalStatus: s.maritalStatus || "",
      status: s.status || "Active",
      staffType: s.staffType || "Admin Staff",
      mobileNumber: s.mobileNumber || "",
      alternateNumber: s.alternateNumber || "",
      whatsappNumber: s.whatsappNumber || "",
      email: s.email || "",
      currentAddress: s.currentAddress || "",
      sameAsCurrent: !!s.sameAsCurrent,
      permanentAddress: s.permanentAddress || "",
      emergencyName: s.emergencyName || "",
      emergencyRelation: s.emergencyRelation || "",
      emergencyNumber: s.emergencyNumber || "",
      qualification: s.qualification || "",
      specialization: s.specialization || "",
      collegeOrUniversity: s.collegeOrUniversity || "",
      yearOfPassing: s.yearOfPassing || "",
      experience: s.experience || "",
      skills: (s.skills || []).join(", "),
      relievedOn: s.relievedOn ? s.relievedOn.slice(0, 10) : "",
      relievingReason: s.relievingReason || "",
    });
    setFormErrors({});
    setFormServerError("");
    setPhotoFile(null);
    setPhotoPreview(s.photo || "");
    setRemovePhoto(false);
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setFormOpen(false);
  }

  function updateField(key, value) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "status") {
        // Active → Inactive: relieving date default ah indha naal
        if (value === "Inactive" && origStatus !== "Inactive" && !f.relievedOn) next.relievedOn = todayISO();
        // Inactive → Active (rejoin): puthu joining date default ah indha naal
        if (value === "Active" && origStatus === "Inactive") next.dateOfJoining = todayISO();
        // Maathi thirumba pazhaya status ku vandha pazhaya date
        if (value === origStatus) {
          next.dateOfJoining = origJoining;
          if (value === "Active") next.relievedOn = "";
        }
      }
      return next;
    });
  }

  function handleSameAddr(checked) {
    setForm((f) => ({ ...f, sameAsCurrent: checked, permanentAddress: checked ? f.currentAddress : f.permanentAddress }));
  }

  function handleCurrentAddr(value) {
    setForm((f) => ({ ...f, currentAddress: value, permanentAddress: f.sameAsCurrent ? value : f.permanentAddress }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormServerError("Choose an image file (JPG or PNG).");
      return;
    }
    setFormServerError("");
    setRemovePhoto(false);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleRemovePhoto() {
    setPhotoFile(null);
    setPhotoPreview("");
    setRemovePhoto(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validateForm(form, editingId ? origStatus : "Active");
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    setSaving(true);
    setFormServerError("");
    const fd = buildFormData(form, photoFile, removePhoto);
    const result = editingId ? await updateStaffApi(editingId, fd) : await createStaffApi(fd);
    setSaving(false);

    if (!result.success) {
      setFormServerError(result.message || "Could not save. Try again.");
      return;
    }
    setFormOpen(false);
    setDetailStaff(result.data);
  }

  async function handleDelete() {
    if (!confirmTarget) return;
    setDeleting(true);
    const result = await deleteStaffApi(confirmTarget._id);
    setDeleting(false);
    if (!result.success) return;
    setConfirmTarget(null);
    if (detailStaff?._id === confirmTarget._id) setDetailStaff(null);
  }

  return (
    <div className="mx-4 mt-8 mb-6 max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:mx-6 sm:mt-10 sm:mb-8 sm:rounded-3xl">
      {/* banner */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-800 to-blue-700 px-4 py-4 sm:px-6 sm:py-5">
        <Crown />
        <h1 className="text-[20px] font-bold text-white">Admin & Field Panel</h1>
      </div>
      <div className="border-b border-slate-200 px-4 sm:px-6">
        <span className="inline-flex items-center gap-2 border-b-2 border-blue-700 py-3 text-[14px] font-semibold text-blue-800">
          👥 Staff
        </span>
      </div>

      {/* body */}
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-[19px] font-bold text-blue-900">
            👥 Staff Details
          </h2>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-blue-700 px-4 text-[14px] font-semibold text-white hover:bg-blue-800"
          >
            + Add Staff
          </button>
        </div>

        <input
          type="search"
          placeholder="Search by name, staff ID or department…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search staff"
          className={inputClass + " mb-3"}
        />

        <div className="mb-4 flex flex-wrap gap-1.5">
          {["All", ...STAFF_TYPES].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              aria-pressed={typeFilter === t}
              className={`min-h-[30px] rounded-full border px-3 text-[12.5px] font-medium ${
                typeFilter === t
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-slate-300 bg-white text-slate-600"
              }`}
            >
              {t === "All" ? "All" : t === "Field Staff" ? "🧭 Field Staff" : "🏢 Admin Staff"}
            </button>
          ))}
        </div>

        <p className="mb-3 text-[13px] font-medium text-slate-500">
          Total Staff <span className="ml-1 font-bold text-blue-800">{staff.length}</span>
        </p>

        {loading && <div className="py-10 text-center text-[14px] text-slate-500">Loading staff…</div>}

        {!loading && loadError && (
          <div className="py-10 text-center text-[14px] text-slate-500">
            Could not load the staff list.
            <div className="mt-2">
              <button onClick={() => getAllStaff()} className="font-semibold text-blue-700 underline underline-offset-2">
                Try again
              </button>
            </div>
          </div>
        )}

        {!loading && !loadError && staff.length === 0 && (
          <div className="py-10 text-center text-[14px] text-slate-500">
            No one is added yet.
            <div className="mt-3">
              <button onClick={openCreateForm} className="rounded-xl bg-blue-700 px-4 py-2 text-[13px] font-semibold text-white">
                Add the first staff member
              </button>
            </div>
          </div>
        )}

        {!loading && !loadError && staff.length > 0 && visibleStaff.length === 0 && (
          <div className="py-10 text-center text-[14px] text-slate-500">
            No one matches your search.
            <div className="mt-2">
              <button onClick={() => { setQuery(""); setTypeFilter("All"); }} className="font-semibold text-blue-700 underline underline-offset-2">
                Clear search
              </button>
            </div>
          </div>
        )}

        {!loading && !loadError && visibleStaff.length > 0 && (
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {visibleStaff.map((s) => (
              <button
                key={s._id}
                type="button"
                onClick={() => setDetailStaff(s)}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-16 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500" />
                <div className="absolute right-2.5 top-2.5 flex flex-col items-end gap-1">
                  <StatusPill status={s.status} />
                  {getHistory(s).length > 1 && <RejoinedBadge />}
                </div>
                <div className="flex flex-1 flex-col px-3.5 pb-3.5">
                  <div className="-mt-11 mb-2">
                    <Avatar staff={s} size={84} ring />
                  </div>
                  <p className="truncate text-[14.5px] font-bold text-slate-800">{s.fullName || "Unnamed"}</p>
                  <p className="truncate text-[12.5px] text-slate-500">{s.designation || "No designation"}</p>
                  <div className="mb-2.5 mt-1.5 flex flex-col items-start gap-1">
                    <StaffTypeBadge type={s.staffType} />
                    {s.department && (
                      <span className="inline-block max-w-full truncate rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {s.department}
                      </span>
                    )}
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-dashed border-slate-200 pt-2 text-[11px]">
                    <span className="text-slate-400">Staff ID</span>
                    <span className="font-mono font-semibold text-slate-600">{s.employeeId}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {detailStaff && (
        <DetailModal
          staff={detailStaff}
          onClose={() => setDetailStaff(null)}
          onEdit={() => openEditForm(detailStaff)}
          onRemove={() => setConfirmTarget(detailStaff)}
        />
      )}

      {formOpen && (
        <FormModal
          editingId={editingId}
          form={form}
          origStatus={editingId ? origStatus : "Active"}
          errors={formErrors}
          serverError={formServerError}
          saving={saving}
          photoPreview={photoPreview}
          fileInputRef={fileInputRef}
          onField={updateField}
          onSameAddr={handleSameAddr}
          onCurrentAddr={handleCurrentAddr}
          onPhotoChange={handlePhotoChange}
          onRemovePhoto={handleRemovePhoto}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}

      {confirmTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/55 p-3" onClick={() => !deleting && setConfirmTarget(null)}>
          <div className="w-full max-w-[420px] rounded-2xl bg-white p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-2 text-[19px] font-bold text-slate-800">Remove this profile?</h2>
            <p className="text-[14px] text-slate-600">
              This deletes {confirmTarget.fullName || "this person"}’s details for good. It cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setConfirmTarget(null)}
                className="min-h-[42px] rounded-xl border border-slate-300 px-4 text-[14px] font-semibold disabled:opacity-60"
              >
                Keep profile
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="min-h-[42px] rounded-xl bg-red-600 px-4 text-[14px] font-semibold text-white disabled:opacity-60"
              >
                {deleting ? "Removing…" : "Remove profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- employment history ---------- */

function EmploymentHistory({ staff }) {
  // Puthusu mudhal la
  const history = [...getHistory(staff)].reverse();
  if (!history.length) return null;
  return (
    <SectionCard icon="🗓️" title="Employment History">
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
                  <span className="text-[14px] font-semibold text-slate-800">
                    {stintNo === 1 ? "First joining" : `Rejoining ${stintNo - 1}`}
                  </span>
                  {current ? (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11.5px] font-semibold text-green-700">Current</span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11.5px] font-semibold text-slate-500">Previous</span>
                  )}
                </div>
                <p className="mt-0.5 text-[13.5px] text-slate-700">
                  Joined <b>{fmtDate(h.joinedOn) || "—"}</b>
                  <span className="mx-1.5 text-slate-300" aria-hidden="true">→</span>
                  {h.relievedOn ? (
                    <>
                      Relieved <b>{fmtDate(h.relievedOn)}</b>
                    </>
                  ) : (
                    <b className="text-green-700">Present</b>
                  )}
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
    </SectionCard>
  );
}

/* ---------- detail modal ---------- */

function DetailModal({ staff, onClose, onEdit, onRemove }) {
  const history = getHistory(staff);
  const rejoined = history.length > 1;
  const previous = history.slice(0, -1);
  const lastPrevious = previous[previous.length - 1];
  const inactive = staff.status === "Inactive";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 p-3" onClick={onClose}>
      <div
        className="max-h-[calc(100vh-24px)] w-full max-w-[640px] overflow-y-auto rounded-3xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-r from-blue-800 to-blue-700 px-4 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            ✕
          </button>
          <div className="flex items-center gap-4 pr-8">
            <Avatar staff={staff} size={72} ring />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-[22px] font-bold text-white">{staff.fullName}</h2>
                <StatusPill status={staff.status} />
                <StaffTypeBadge type={staff.staffType} />
              </div>
              <p className="text-[14px] text-blue-100">
                {staff.designation}{staff.department ? ` · ${staff.department}` : ""}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4 text-[13px] text-blue-100">
              <span className="inline-flex items-center gap-1.5">🪪 {staff.employeeId}</span>
              {staff.dateOfJoining && (
                <span className="inline-flex items-center gap-1.5">
                  📅 {rejoined ? "Rejoined" : "Joined"} on {fmtDate(staff.dateOfJoining)}
                </span>
              )}
              {inactive && staff.relievedOn && (
                <span className="inline-flex items-center gap-1.5">🚪 Relieved on {fmtDate(staff.relievedOn)}</span>
              )}
            </div>
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-white px-4 text-[13.5px] font-semibold text-blue-800 hover:bg-blue-50"
            >
              ✎ Edit
            </button>
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          <SectionCard icon="👤" title="Basic Details">
            <Row label="Staff ID" value={staff.employeeId} />
            <Row label="Name" value={staff.fullName} />
            <Row label="Date of birth" value={fmtDate(staff.dateOfBirth)} />
            <Row label="Gender" value={staff.gender} />
            <Row label="Age" value={calcAge(staff.dateOfBirth)} />
            <Row label="Marital status" value={staff.maritalStatus} />
            <Row label="Mobile number" value={staff.mobileNumber ? <a className="text-blue-700" href={telHref(staff.mobileNumber)}>{staff.mobileNumber}</a> : null} />
            <Row label="Alternate number" value={staff.alternateNumber ? <a className="text-blue-700" href={telHref(staff.alternateNumber)}>{staff.alternateNumber}</a> : null} />
            <Row
              label="WhatsApp number"
              value={
                staff.whatsappNumber ? (
                  <a className="text-blue-700" href={`https://wa.me/${String(staff.whatsappNumber).replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer">
                    {staff.whatsappNumber}
                  </a>
                ) : null
              }
            />
            <Row label="Email" value={staff.email ? <a className="text-blue-700" href={`mailto:${staff.email}`}>{staff.email}</a> : null} />
            <Row label="Address" value={staff.currentAddress} />
            <Row label="Permanent address" value={staff.sameAsCurrent ? "Same as current address" : staff.permanentAddress} />
          </SectionCard>

          <SectionCard icon="💼" title="Job Details">
            <Row label="Designation" value={staff.designation} />
            <Row label="Staff type" value={<StaffTypeBadge type={staff.staffType} />} />
            <Row label="Department" value={staff.department} />
            <Row label="Reporting manager" value={staff.reportingManager} />
            <Row
              label={rejoined ? "Current joining date" : "Joining date"}
              value={
                staff.dateOfJoining ? (
                  <span className="inline-flex flex-wrap items-center justify-end gap-1.5">
                    {fmtDate(staff.dateOfJoining)}
                    {rejoined && <RejoinedBadge />}
                  </span>
                ) : null
              }
            />
            {rejoined && (
              <Row
                label="Previous joining date"
                value={
                  lastPrevious
                    ? `${fmtDate(lastPrevious.joinedOn)} – ${fmtDate(lastPrevious.relievedOn) || "?"}`
                    : null
                }
              />
            )}
            <Row label="Status" value={<StatusPill status={staff.status} />} />
            {inactive && <Row label="Relieved on" value={fmtDate(staff.relievedOn)} />}
            {inactive && <Row label="Relieving reason" value={staff.relievingReason} />}
          </SectionCard>

          <EmploymentHistory staff={staff} />

          <SectionCard icon="🎓" title="Study Details">
            <Row label="Qualification" value={staff.qualification} />
            <Row label="Specialization" value={staff.specialization} />
            <Row label="College / University" value={staff.collegeOrUniversity} />
            <Row label="Year of passing" value={staff.yearOfPassing} />
            <Row label="Working experience" value={staff.experience} />
            <Row
              label="Skills"
              value={
                staff.skills && staff.skills.length
                  ? staff.skills.join(", ")
                  : null
              }
            />
          </SectionCard>

          {(staff.emergencyName || staff.emergencyNumber) && (
            <SectionCard icon="🚨" title="Emergency Contact">
              <Row label="Name" value={staff.emergencyName} />
              <Row label="Relation" value={staff.emergencyRelation} />
              <Row label="Phone number" value={staff.emergencyNumber ? <a className="text-blue-700" href={telHref(staff.emergencyNumber)}>{staff.emergencyNumber}</a> : null} />
            </SectionCard>
          )}

          <button
            type="button"
            onClick={onRemove}
            className="text-[13.5px] font-semibold text-red-600 hover:underline"
          >
            Remove this profile
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- form modal ---------- */

function FormModal({
  editingId, form, origStatus, errors, serverError, saving, photoPreview, fileInputRef,
  onField, onSameAddr, onCurrentAddr, onPhotoChange, onRemovePhoto, onSubmit, onClose,
}) {
  const relieving = form.status === "Inactive" && origStatus !== "Inactive";
  const rejoining = origStatus === "Inactive" && form.status === "Active";
  const stillInactive = form.status === "Inactive" && origStatus === "Inactive";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 p-3" onClick={() => !saving && onClose()}>
      <div
        className="flex max-h-[calc(100vh-24px)] w-full max-w-[640px] flex-col overflow-hidden rounded-3xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit} noValidate>
          <div className="relative bg-gradient-to-r from-blue-800 to-blue-700 px-4 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
            >
              ✕
            </button>
            <p className="mb-1 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-blue-200">
              {editingId ? "Editing staff profile" : "New staff profile"}
            </p>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border-4 border-white bg-blue-900/40 text-[22px] font-bold text-white">
                  {photoPreview ? <img src={photoPreview} alt="" className="h-full w-full object-cover" /> : initials(form.fullName)}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Change photo"
                  className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-white text-[13px] shadow"
                >
                  📷
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onPhotoChange} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[11.5px] font-medium text-blue-100">Profile photo</span>
                <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[36px] rounded-xl bg-white px-3 text-[13px] font-semibold text-blue-800"
                >
                  {photoPreview ? "Change photo" : "Upload photo"}
                </button>
                {photoPreview && (
                  <button type="button" onClick={onRemovePhoto} className="min-h-[36px] rounded-xl bg-white/15 px-3 text-[13px] font-semibold text-white">
                    Remove photo
                  </button>
                )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-blue-800">👤 Basic Details</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 max-[479px]:grid-cols-1">
                <Field label="Full name" required error={errors.fullName}>
                  <input className={inputClass} value={form.fullName} onChange={(e) => onField("fullName", e.target.value)} />
                </Field>
                <Field label="Designation" required error={errors.designation}>
                  <input className={inputClass} value={form.designation} onChange={(e) => onField("designation", e.target.value)} placeholder="e.g. Office Admin" />
                </Field>
                <Field label="Date of birth">
                  <input className={inputClass} type="date" value={form.dateOfBirth} onChange={(e) => onField("dateOfBirth", e.target.value)} />
                </Field>
                <Field label="Gender">
                  <select className={inputClass} value={form.gender} onChange={(e) => onField("gender", e.target.value)}>
                    <option value="">Select</option>
                    {GENDERS.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </Field>
                <Field label="Age" help="Calculated from date of birth">
                  <div className={inputClass + " flex items-center bg-slate-50 text-slate-600"}>
                    {calcAge(form.dateOfBirth) ?? "—"}
                  </div>
                </Field>
                <Field label="Marital status">
                  <select className={inputClass} value={form.maritalStatus} onChange={(e) => onField("maritalStatus", e.target.value)}>
                    <option value="">Select</option>
                    {MARITAL_STATUSES.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select className={inputClass} value={form.status} onChange={(e) => onField("status", e.target.value)}>
                    {STATUSES.map((st) => <option key={st}>{st}</option>)}
                  </select>
                </Field>
              </div>

              {/* ── Relieve: Active → Inactive ── */}
              {(relieving || stillInactive) && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-[14px] font-semibold text-amber-900">
                    {relieving ? "Relieving this staff member" : "Relieving details"}
                  </p>
                  {relieving && (
                    <p className="mt-0.5 text-[12.5px] text-amber-800">
                      Their current joining period closes on this date. It stays in the employment history.
                    </p>
                  )}
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3.5 max-[479px]:grid-cols-1">
                    <Field label="Relieving date" required error={errors.relievedOn}>
                      <input className={inputClass} type="date" value={form.relievedOn} onChange={(e) => onField("relievedOn", e.target.value)} />
                    </Field>
                    <Field label="Reason">
                      <input
                        className={inputClass}
                        list="relieving-reasons"
                        value={form.relievingReason}
                        onChange={(e) => onField("relievingReason", e.target.value)}
                        placeholder="e.g. Resigned"
                      />
                      <datalist id="relieving-reasons">
                        {RELIEVING_REASONS.map((r) => <option key={r} value={r} />)}
                      </datalist>
                    </Field>
                  </div>
                </div>
              )}

              {/* ── Rejoin: Inactive → Active ── */}
              {rejoining && (
                <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-4" role="status">
                  <p className="text-[14px] font-semibold text-violet-900">Rejoining</p>
                  <p className="mt-0.5 text-[12.5px] text-violet-800">
                    Set the new joining date in Job Details below. The previous joining date stays in the employment history.
                  </p>
                </div>
              )}
            </section>

            <section className="mt-5 border-t border-slate-100 pt-5">
              <h3 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-blue-800">💼 Job Details</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 max-[479px]:grid-cols-1">
                <Field label="Staff type" required help="Admin side or field / tour manager">
                  <select className={inputClass} value={form.staffType} onChange={(e) => onField("staffType", e.target.value)}>
                    {STAFF_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Department">
                  <input className={inputClass} value={form.department} onChange={(e) => onField("department", e.target.value)} placeholder="e.g. Administration" />
                </Field>
                <Field label="Reporting manager">
                  <input className={inputClass} value={form.reportingManager} onChange={(e) => onField("reportingManager", e.target.value)} />
                </Field>
                <Field
                  label={rejoining ? "New joining date" : "Joining date"}
                  required={rejoining}
                  error={errors.dateOfJoining}
                  help={rejoining ? "The date they rejoined" : undefined}
                >
                  <input
                    className={inputClass + (rejoining ? " border-violet-400 ring-2 ring-violet-100" : "")}
                    type="date"
                    value={form.dateOfJoining}
                    onChange={(e) => onField("dateOfJoining", e.target.value)}
                  />
                </Field>
              </div>
            </section>

            <section className="mt-5 border-t border-slate-100 pt-5">
              <h3 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-blue-800">📞 Contact Details</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 max-[479px]:grid-cols-1">
                <Field label="Mobile number" required error={errors.mobileNumber}>
                  <input className={inputClass} type="tel" value={form.mobileNumber} onChange={(e) => onField("mobileNumber", e.target.value)} />
                </Field>
                <Field label="Alternate number">
                  <input className={inputClass} type="tel" value={form.alternateNumber} onChange={(e) => onField("alternateNumber", e.target.value)} />
                </Field>
                <Field label="WhatsApp number" help="Leave blank if same as mobile number">
                  <input className={inputClass} type="tel" value={form.whatsappNumber} onChange={(e) => onField("whatsappNumber", e.target.value)} />
                </Field>
                <Field label="Email" error={errors.email}>
                  <input className={inputClass} type="email" value={form.email} onChange={(e) => onField("email", e.target.value)} />
                </Field>
                <Field label="Address" wide>
                  <textarea className={inputClass + " min-h-[70px] resize-y"} rows={2} value={form.currentAddress} onChange={(e) => handleCurrentAddrChange(e, onCurrentAddr)} />
                </Field>
                <div className="col-span-2 max-[479px]:col-span-1">
                  <label className="flex min-h-[32px] cursor-pointer items-center gap-2.5 text-[13.5px] text-slate-600">
                    <input type="checkbox" className="h-4 w-4 accent-blue-600" checked={form.sameAsCurrent} onChange={(e) => onSameAddr(e.target.checked)} />
                    Permanent address is the same as current address
                  </label>
                </div>
                <Field label="Permanent address" wide>
                  <textarea
                    className={inputClass + " min-h-[70px] resize-y"}
                    rows={2}
                    value={form.permanentAddress}
                    disabled={form.sameAsCurrent}
                    onChange={(e) => onField("permanentAddress", e.target.value)}
                  />
                </Field>
              </div>

              <h4 className="mb-2 mt-4 text-[13px] font-semibold text-slate-500">Emergency contact</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 max-[479px]:grid-cols-1">
                <Field label="Name">
                  <input className={inputClass} value={form.emergencyName} onChange={(e) => onField("emergencyName", e.target.value)} />
                </Field>
                <Field label="Relation">
                  <input className={inputClass} value={form.emergencyRelation} onChange={(e) => onField("emergencyRelation", e.target.value)} placeholder="e.g. Spouse, Father" />
                </Field>
                <Field label="Phone number" error={errors.emergencyNumber}>
                  <input className={inputClass} type="tel" value={form.emergencyNumber} onChange={(e) => onField("emergencyNumber", e.target.value)} />
                </Field>
              </div>
            </section>

            <section className="mt-5 border-t border-slate-100 pt-5">
              <h3 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-blue-800">🎓 Study Details</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 max-[479px]:grid-cols-1">
                <Field label="Qualification">
                  <input className={inputClass} value={form.qualification} onChange={(e) => onField("qualification", e.target.value)} placeholder="e.g. B.Com" />
                </Field>
                <Field label="Specialization / Subject">
                  <input className={inputClass} value={form.specialization} onChange={(e) => onField("specialization", e.target.value)} />
                </Field>
                <Field label="College / University">
                  <input className={inputClass} value={form.collegeOrUniversity} onChange={(e) => onField("collegeOrUniversity", e.target.value)} />
                </Field>
                <Field label="Year of passing">
                  <input className={inputClass} value={form.yearOfPassing} onChange={(e) => onField("yearOfPassing", e.target.value)} placeholder="e.g. 2019" />
                </Field>
                <Field label="Working experience">
                  <input className={inputClass} value={form.experience} onChange={(e) => onField("experience", e.target.value)} placeholder="e.g. 4 years" />
                </Field>
                <Field label="Skills" help="Separate with commas.">
                  <input className={inputClass} value={form.skills} onChange={(e) => onField("skills", e.target.value)} placeholder="MS Office, Tally, Typing" />
                </Field>
              </div>
            </section>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-200 px-4 py-3 sm:px-6 sm:py-4">
            {serverError && <span className="mr-auto text-[13.5px] font-medium text-red-600" role="alert">{serverError}</span>}
            <button type="button" onClick={onClose} disabled={saving} className="min-h-[42px] rounded-xl border border-slate-300 px-4 text-[14px] font-semibold disabled:opacity-60">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="min-h-[42px] rounded-xl bg-blue-700 px-5 text-[14px] font-semibold text-white disabled:opacity-60">
              {saving ? "Saving…" : editingId ? "Save changes" : "Add Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function handleCurrentAddrChange(e, onCurrentAddr) {
  onCurrentAddr(e.target.value);
}
