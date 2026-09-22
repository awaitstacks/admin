import { useState, useEffect, useMemo, useRef, useCallback, useContext } from "react";
import { TourContext } from "../../context/TourContext";

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract"];
const ACCESS_PRESETS = [
  "Office keys", "Cash counter", "Accounting software",
  "Email and admin panel", "Staff records", "Visitor register",
  "Server room", "Stationery store",
];
const EMPTY_FORM = {
  fullName: "", designation: "", department: "", reportingManager: "",
  dateOfJoining: "", employmentType: "Full-time", workLocation: "",
  shiftStart: "", shiftEnd: "",
  mobileNumber: "", email: "", currentAddress: "", sameAsCurrent: false,
  permanentAddress: "", emergencyName: "", emergencyRelation: "", emergencyNumber: "",
  keyResponsibilities: "", skills: "", qualification: "", experience: "",
  accessLevels: [], otherAccess: "",
};

const AVATAR_COLORS = [
  "bg-blue-700", "bg-teal-700", "bg-purple-700", "bg-amber-700",
  "bg-lime-700", "bg-pink-700", "bg-cyan-700",
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

const AVATAR_SIZE = {
  sm: "h-11 w-11 rounded-xl text-base",
  md: "h-[72px] w-[72px] rounded-2xl text-2xl",
  xl: "h-28 w-28 rounded-[26px] text-4xl border-4 border-white -mt-14 relative mx-auto",
};

function Avatar({ staff, size = "sm" }) {
  const base = `grid place-items-center overflow-hidden shrink-0 font-bold text-white ${AVATAR_SIZE[size]}`;
  if (staff.photo) {
    return (
      <div className={base}>
        <img src={staff.photo} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`${base} ${size === "md" ? "bg-slate-100 text-slate-400" : hashColor(staff.fullName)}`} aria-hidden="true">
      {initials(staff.fullName)}
    </div>
  );
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function tenureText(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  if (d > now) return "Joining soon";
  let months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  if (now.getDate() < d.getDate()) months -= 1;
  if (months < 1) return "Less than a month with the team";
  const y = Math.floor(months / 12);
  const m = months % 12;
  const out = [];
  if (y) out.push(`${y} ${y === 1 ? "yr" : "yrs"}`);
  if (m) out.push(`${m} mo`);
  return `${out.join(" ")} with the team`;
}

function fmtTime(t) {
  if (!t) return "";
  const [hStr, m] = t.split(":");
  const h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return "";
  return `${(h % 12) || 12}:${m || "00"} ${h >= 12 ? "PM" : "AM"}`;
}

function shiftText(staff) {
  const a = fmtTime(staff.shiftStart);
  const b = fmtTime(staff.shiftEnd);
  return a && b ? `${a} to ${b}` : a || b || "";
}

function telHref(phone) {
  return `tel:${String(phone).replace(/[^\d+]/g, "")}`;
}

const PHONE_RE = /^[+()\d][\d\s()+\-]{5,}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(form) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Enter the full name.";
  if (!form.designation.trim()) errors.designation = "Enter the designation.";
  if (!form.mobileNumber.trim()) errors.mobileNumber = "Enter a mobile number.";
  else if (!PHONE_RE.test(form.mobileNumber.trim())) errors.mobileNumber = "Enter a valid mobile number.";
  if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) errors.email = "Enter a valid email address.";
  if (form.emergencyNumber.trim() && !PHONE_RE.test(form.emergencyNumber.trim())) {
    errors.emergencyNumber = "Enter a valid phone number.";
  }
  return errors;
}

function buildFormData(form, photoFile, removePhoto) {
  const fd = new FormData();
  const textFields = [
    "fullName", "designation", "department", "reportingManager", "dateOfJoining",
    "employmentType", "workLocation", "shiftStart", "shiftEnd",
    "mobileNumber", "email", "currentAddress", "permanentAddress",
    "emergencyName", "emergencyRelation", "emergencyNumber",
    "qualification", "experience", "otherAccess",
  ];
  textFields.forEach((key) => fd.append(key, form[key] ?? ""));
  fd.append("sameAsCurrent", form.sameAsCurrent ? "true" : "false");
  fd.append("keyResponsibilities", form.keyResponsibilities);
  fd.append("skills", form.skills);
  form.accessLevels.forEach((level) => fd.append("accessLevels", level));
  if (photoFile) fd.append("photo", photoFile);
  else if (removePhoto) fd.append("removePhoto", "true");
  return fd;
}

const inputClass =
  "w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px] text-slate-900 " +
  "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 " +
  "disabled:bg-slate-100 disabled:text-slate-400";

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

  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("All");
  const [mobileView, setMobileView] = useState("list"); // "list" | "detail"

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formServerError, setFormServerError] = useState("");
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [removePhoto, setRemovePhoto] = useState(false);
  const fileInputRef = useRef(null);

  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadStaff = useCallback(() => {
    return getAllStaff();
  }, [getAllStaff]);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const departments = useMemo(() => {
    const counts = {};
    staff.forEach((s) => {
      const d = (s.department || "").trim();
      if (d) counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
  }, [staff]);

  const sortedStaff = useMemo(
    () => [...staff].sort((a, b) => (a.fullName || "").localeCompare(b.fullName || "", "en", { sensitivity: "base" })),
    [staff]
  );

  const visibleStaff = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortedStaff.filter((s) => {
      if (department !== "All" && (s.department || "").trim() !== department) return false;
      if (!q) return true;
      return [s.fullName, s.employeeId, s.designation, s.department, s.mobileNumber]
        .some((v) => String(v || "").toLowerCase().includes(q));
    });
  }, [sortedStaff, query, department]);

  const selected = staff.find((s) => s._id === selectedId) || null;

  function selectStaff(id) {
    setSelectedId(id);
    setMobileView("detail");
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormServerError("");
    setPhotoFile(null);
    setPhotoPreview("");
    setRemovePhoto(false);
    setFormOpen(true);
  }

  function openEditForm(s) {
    setEditingId(s._id);
    setForm({
      fullName: s.fullName || "",
      designation: s.designation || "",
      department: s.department || "",
      reportingManager: s.reportingManager || "",
      dateOfJoining: s.dateOfJoining ? s.dateOfJoining.slice(0, 10) : "",
      employmentType: s.employmentType || "Full-time",
      workLocation: s.workLocation || "",
      shiftStart: s.shiftStart || "",
      shiftEnd: s.shiftEnd || "",
      mobileNumber: s.mobileNumber || "",
      email: s.email || "",
      currentAddress: s.currentAddress || "",
      sameAsCurrent: !!s.sameAsCurrent,
      permanentAddress: s.permanentAddress || "",
      emergencyName: s.emergencyName || "",
      emergencyRelation: s.emergencyRelation || "",
      emergencyNumber: s.emergencyNumber || "",
      keyResponsibilities: (s.keyResponsibilities || []).join("\n"),
      skills: (s.skills || []).join(", "),
      qualification: s.qualification || "",
      experience: s.experience || "",
      accessLevels: s.accessLevels || [],
      otherAccess: s.otherAccess || "",
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
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleAccess(level) {
    setForm((f) => ({
      ...f,
      accessLevels: f.accessLevels.includes(level)
        ? f.accessLevels.filter((l) => l !== level)
        : [...f.accessLevels, level],
    }));
  }

  function handleSameAddr(checked) {
    setForm((f) => ({
      ...f,
      sameAsCurrent: checked,
      permanentAddress: checked ? f.currentAddress : f.permanentAddress,
    }));
  }

  function handleCurrentAddr(value) {
    setForm((f) => ({
      ...f,
      currentAddress: value,
      permanentAddress: f.sameAsCurrent ? value : f.permanentAddress,
    }));
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
    const errors = validateForm(form);
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
    setSelectedId(result.data._id);
    setMobileView("detail");
  }

  async function handleDelete() {
    if (!confirmTarget) return;
    setDeleting(true);
    const result = await deleteStaffApi(confirmTarget._id);
    setDeleting(false);

    if (!result.success) return; // context already shows the error toast
    setConfirmTarget(null);
    if (selectedId === confirmTarget._id) setSelectedId(null);
    setMobileView("list");
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 pb-14 pt-6 font-sans">
      <header className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Staff profiles</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2.5 text-slate-600">
            <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-[13px] font-semibold text-teal-800">
              Admin only
            </span>
            <span>Basic, contact and job details of your admin team.</span>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-teal-700 px-5 font-semibold text-white hover:brightness-110"
        >
          + Add staff
        </button>
      </header>

      <main className="mx-auto max-w-3xl">
        <section
          className={`rounded-2xl border border-slate-200 bg-white p-3.5 ${
            mobileView === "detail" ? "hidden" : ""
          }`}
          aria-label="Staff list"
        >
          <input
            type="search"
            placeholder="Search staff"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search staff"
            className={inputClass}
          />

          {departments.length >= 2 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setDepartment("All")}
                aria-pressed={department === "All"}
                className={`min-h-[32px] rounded-full border px-3 text-[13px] font-medium ${
                  department === "All"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-slate-600"
                }`}
              >
                All ({staff.length})
              </button>
              {departments.map(([name, count]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setDepartment(name)}
                  aria-pressed={department === name}
                  className={`min-h-[32px] rounded-full border px-3 text-[13px] font-medium ${
                    department === name
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-600"
                  }`}
                >
                  {name} ({count})
                </button>
              ))}
            </div>
          )}

          <p className="mt-3 mb-1.5 px-0.5 text-[13px] text-slate-500">
            {loading || loadError
              ? ""
              : visibleStaff.length === staff.length
              ? `${staff.length} staff member${staff.length === 1 ? "" : "s"}`
              : `${visibleStaff.length} of ${staff.length} staff members`}
          </p>

          <div className="flex min-h-[60px] flex-col gap-0.5">
            {loading && <div className="p-4 text-sm text-slate-600">Loading staff…</div>}
            {!loading && loadError && (
              <div className="p-4 text-sm text-slate-600">
                Could not load the staff list.
                <div className="mt-2.5">
                  <button
                    onClick={loadStaff}
                    className="min-h-[36px] rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}
            {!loading && !loadError && staff.length === 0 && (
              <div className="p-4 text-sm text-slate-600">No one is added yet.</div>
            )}
            {!loading && !loadError && staff.length > 0 && visibleStaff.length === 0 && (
              <div className="p-4 text-sm text-slate-600">
                No one matches your search.
                <div className="mt-2.5">
                  <button
                    onClick={() => { setQuery(""); setDepartment("All"); }}
                    className="min-h-[36px] rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold"
                  >
                    Clear search
                  </button>
                </div>
              </div>
            )}
            {!loading && !loadError && visibleStaff.map((s) => (
              <button
                key={s._id}
                type="button"
                onClick={() => selectStaff(s._id)}
                aria-current={s._id === selectedId}
                className={`grid grid-cols-[44px_minmax(0,1fr)] items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50 ${
                  s._id === selectedId ? "bg-teal-50 shadow-[inset_3px_0_0_theme(colors.teal.700)]" : ""
                }`}
              >
                <Avatar staff={s} size="sm" />
                <div className="min-w-0">
                  <div className="truncate font-semibold">{s.fullName || "Unnamed"}</div>
                  <div className="truncate text-[13px] text-slate-500">{s.designation || "No designation"}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className={mobileView === "list" ? "hidden" : ""} aria-live="polite">
          {loading ? (
            <EmptyDetail mode="loading" />
          ) : !selected ? (
            <EmptyDetail mode={staff.length === 0 ? "no-staff" : "none-selected"} onAdd={openCreateForm} />
          ) : (
            <StaffDetail
              staff={selected}
              onBack={() => setMobileView("list")}
              onEdit={() => openEditForm(selected)}
              onRemove={() => setConfirmTarget(selected)}
            />
          )}
        </section>
      </main>

      {formOpen && (
        <StaffFormDialog
          editingId={editingId}
          form={form}
          errors={formErrors}
          serverError={formServerError}
          saving={saving}
          photoPreview={photoPreview}
          fileInputRef={fileInputRef}
          onField={updateField}
          onToggleAccess={toggleAccess}
          onSameAddr={handleSameAddr}
          onCurrentAddr={handleCurrentAddr}
          onPhotoChange={handlePhotoChange}
          onRemovePhoto={handleRemovePhoto}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}

      {confirmTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 p-3"
          role="presentation"
          onClick={() => !deleting && setConfirmTarget(null)}
        >
          <div
            className="w-full max-w-[440px] rounded-2xl bg-white p-5"
            role="alertdialog"
            aria-labelledby="sp-confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="sp-confirm-title" className="text-xl font-bold mb-2">Remove this profile?</h2>
            <p className="text-slate-600">
              This deletes {confirmTarget.fullName || "this person"}’s details for good. It cannot be undone.
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2.5">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setConfirmTarget(null)}
                className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 font-semibold disabled:opacity-60"
              >
                Keep profile
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="min-h-[44px] rounded-lg bg-red-700 px-4 font-semibold text-white disabled:opacity-60"
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

function EmptyDetail({ mode, onAdd }) {
  const ghostBadge = (
    <div className="relative mx-auto max-w-[300px] overflow-hidden rounded-3xl border border-dashed border-slate-300 pb-5 text-center" aria-hidden="true">
      <div className="-mx-5 h-24 bg-slate-100" />
      <div className="-mt-14 mx-auto grid h-28 w-28 place-items-center rounded-[26px] border-4 border-slate-100 bg-slate-100 text-4xl font-bold text-slate-400">
        ?
      </div>
    </div>
  );

  if (mode === "loading") {
    return (
      <div className="pt-2">
        {ghostBadge}
        <h2 className="mt-6 mb-1.5 text-center text-xl font-bold md:text-left">Loading profiles…</h2>
      </div>
    );
  }
  if (mode === "no-staff") {
    return (
      <div className="pt-2 text-center md:text-left">
        {ghostBadge}
        <h2 className="mt-6 mb-1.5 text-xl font-bold">No staff profiles yet</h2>
        <p className="mx-auto max-w-[46ch] text-slate-600 md:mx-0">
          Add the first person with their basic, contact and job details.
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-teal-700 px-5 font-semibold text-white"
        >
          Add staff
        </button>
      </div>
    );
  }
  return (
    <div className="pt-2 text-center md:text-left">
      {ghostBadge}
      <h2 className="mt-6 mb-1.5 text-xl font-bold">Pick someone from the list</h2>
      <p className="mx-auto max-w-[46ch] text-slate-600 md:mx-0">Their full profile will show here.</p>
    </div>
  );
}

function Item({ label, value, wide, hint }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <dt className="mb-0.5 text-[13px] text-slate-500">{label}</dt>
      <dd className="break-words">
        {value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0) ? (
          <span className="text-slate-400">Not added</span>
        ) : (
          value
        )}
        {hint && <span className="mt-0.5 block text-[13px] text-slate-500">{hint}</span>}
      </dd>
    </div>
  );
}

function ChipList({ items, accent }) {
  if (!items || !items.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span
          key={t}
          className={`inline-block rounded-full px-2.5 py-0.5 text-[13px] ${
            accent ? "bg-teal-50 text-teal-800" : "border border-slate-200 bg-slate-50"
          }`}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function StaffDetail({ staff, onBack, onEdit, onRemove }) {
  const responsibilities = String(staff.keyResponsibilities?.join?.("\n") ?? "")
    .split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  const access = [...(staff.accessLevels || [])];
  if (staff.otherAccess) {
    access.push(...String(staff.otherAccess).split(",").map((x) => x.trim()).filter(Boolean));
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 font-semibold"
        >
          Back to list
        </button>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 font-semibold"
          >
            Edit profile
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 font-semibold text-red-700"
          >
            Remove profile
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[270px_minmax(0,1fr)] lg:items-start">
        <div className="relative mx-auto max-w-[300px] overflow-hidden rounded-3xl border border-slate-200 bg-white pb-5 text-center shadow-[0_22px_40px_-26px_rgba(24,33,58,0.5)] lg:sticky lg:top-4">
          <div className="pointer-events-none absolute left-1/2 top-3.5 h-2.5 w-14 -translate-x-1/2 rounded-full bg-slate-100" />
          <div className="-mx-5 h-24 bg-teal-700" />
          <Avatar staff={staff} size="xl" />
          <h2 className="mt-3.5 mb-1 break-words px-5 text-2xl font-bold leading-tight">{staff.fullName}</h2>
          <p className="text-slate-600">{staff.designation}</p>
          {staff.department && <p className="text-[14px] text-slate-500">{staff.department}</p>}
          {staff.employmentType && (
            <span className="mt-3 inline-block rounded-full bg-teal-50 px-3 py-0.5 text-[13px] font-semibold text-teal-800">
              {staff.employmentType}
            </span>
          )}
          <div className="mt-4.5 flex items-baseline justify-between gap-2.5 border-t-2 border-dashed border-slate-200 px-5 pt-3.5">
            <span className="text-[13px] text-slate-500">Employee ID</span>
            <span className="break-words font-semibold tracking-wide">{staff.employeeId}</span>
          </div>
        </div>

        <div className="grid gap-4 min-w-0">
          <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4.5">
            <h3 className="mb-3.5 text-lg font-bold">Basic details</h3>
            <dl className="grid grid-cols-2 gap-x-7 gap-y-4 max-[559px]:grid-cols-1">
              <Item label="Department" value={staff.department} />
              <Item label="Reporting manager" value={staff.reportingManager} />
              <Item label="Date of joining" value={fmtDate(staff.dateOfJoining)} hint={tenureText(staff.dateOfJoining)} />
              <Item label="Employment type" value={staff.employmentType} />
              <Item label="Work location" value={staff.workLocation} />
              <Item label="Shift timing" value={shiftText(staff)} />
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4.5">
            <h3 className="mb-3.5 text-lg font-bold">Contact details</h3>
            <dl className="grid grid-cols-2 gap-x-7 gap-y-4 max-[559px]:grid-cols-1">
              <Item
                label="Mobile number"
                value={staff.mobileNumber ? <a className="font-medium text-teal-700" href={telHref(staff.mobileNumber)}>{staff.mobileNumber}</a> : null}
              />
              <Item
                label="Official email"
                value={staff.email ? <a className="font-medium text-teal-700" href={`mailto:${staff.email}`}>{staff.email}</a> : null}
              />
              <Item label="Current address" wide value={staff.currentAddress ? <pre className="whitespace-pre-wrap font-sans">{staff.currentAddress}</pre> : null} />
              <Item
                label="Permanent address"
                wide
                value={
                  staff.sameAsCurrent ? (
                    <span className="text-slate-400">Same as current address</span>
                  ) : staff.permanentAddress ? (
                    <pre className="whitespace-pre-wrap font-sans">{staff.permanentAddress}</pre>
                  ) : null
                }
              />
              <Item
                label="Emergency contact"
                wide
                value={
                  staff.emergencyName || staff.emergencyNumber ? (
                    <span>
                      {staff.emergencyName}
                      {staff.emergencyRelation ? ` (${staff.emergencyRelation})` : ""}
                      {staff.emergencyNumber && (
                        <span className="mt-0.5 block text-[13px] text-slate-500">
                          <a className="text-teal-700" href={telHref(staff.emergencyNumber)}>{staff.emergencyNumber}</a>
                        </span>
                      )}
                    </span>
                  ) : null
                }
              />
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4.5">
            <h3 className="mb-3.5 text-lg font-bold">Job details</h3>
            <dl className="grid grid-cols-2 gap-x-7 gap-y-4 max-[559px]:grid-cols-1">
              <Item
                label="Key responsibilities"
                wide
                value={
                  responsibilities.length ? (
                    <ul className="list-disc space-y-0.5 pl-4.5">
                      {responsibilities.map((r) => <li key={r}>{r}</li>)}
                    </ul>
                  ) : null
                }
              />
              <Item label="Skills and tools" wide value={<ChipList items={staff.skills} />} />
              <Item label="Qualification" value={staff.qualification} />
              <Item label="Experience" value={staff.experience} />
              <Item label="Access levels" wide value={<ChipList items={access} accent />} />
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}

function StaffFormDialog({
  editingId, form, errors, serverError, saving, photoPreview, fileInputRef,
  onField, onToggleAccess, onSameAddr, onCurrentAddr,
  onPhotoChange, onRemovePhoto, onSubmit, onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 p-3"
      role="presentation"
      onClick={() => !saving && onClose()}
    >
      <div
        className="flex max-h-[calc(100vh-24px)] w-full max-w-[780px] flex-col overflow-hidden rounded-2xl bg-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sp-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit} noValidate>
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
            <h2 id="sp-form-title" className="text-xl font-bold">{editingId ? "Edit staff" : "Add staff"}</h2>
            <button
              type="button"
              aria-label="Close form"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-lg text-lg hover:bg-slate-100"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <section>
              <h3 className="mb-3.5 text-lg font-bold">Basic details</h3>

              <div className="mb-4.5 flex flex-wrap items-center gap-4">
                <div className="grid h-[72px] w-[72px] place-items-center overflow-hidden rounded-2xl bg-slate-100 text-2xl font-bold text-slate-400">
                  {photoPreview ? (
                    <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials(form.fullName) || "?"
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="min-h-[36px] rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold"
                  >
                    {photoPreview ? "Change photo" : "Upload photo"}
                  </button>
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={onRemovePhoto}
                      className="min-h-[36px] rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-red-700"
                    >
                      Remove photo
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onPhotoChange} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5 max-[559px]:grid-cols-1">
                <Field label="Full name" required error={errors.fullName}>
                  <input className={inputClass} value={form.fullName} onChange={(e) => onField("fullName", e.target.value)} />
                </Field>
                <Field label="Designation" required error={errors.designation}>
                  <input
                    className={inputClass}
                    value={form.designation}
                    onChange={(e) => onField("designation", e.target.value)}
                    placeholder="e.g. Office Admin"
                  />
                </Field>
                <Field label="Department">
                  <input className={inputClass} value={form.department} onChange={(e) => onField("department", e.target.value)} placeholder="e.g. Administration" />
                </Field>
                <Field label="Reporting manager">
                  <input className={inputClass} value={form.reportingManager} onChange={(e) => onField("reportingManager", e.target.value)} />
                </Field>
                <Field label="Date of joining">
                  <input className={inputClass} type="date" value={form.dateOfJoining} onChange={(e) => onField("dateOfJoining", e.target.value)} />
                </Field>
                <Field label="Employment type">
                  <select className={inputClass} value={form.employmentType} onChange={(e) => onField("employmentType", e.target.value)}>
                    {EMPLOYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Work location">
                  <input className={inputClass} value={form.workLocation} onChange={(e) => onField("workLocation", e.target.value)} placeholder="e.g. Head office" />
                </Field>
                <Field label="Shift starts">
                  <input className={inputClass} type="time" value={form.shiftStart} onChange={(e) => onField("shiftStart", e.target.value)} />
                </Field>
                <Field label="Shift ends">
                  <input className={inputClass} type="time" value={form.shiftEnd} onChange={(e) => onField("shiftEnd", e.target.value)} />
                </Field>
              </div>
            </section>

            <section className="mt-5.5 border-t border-slate-200 pt-5">
              <h3 className="mb-3.5 text-lg font-bold">Contact details</h3>
              <div className="grid grid-cols-2 gap-3.5 max-[559px]:grid-cols-1">
                <Field label="Mobile number" required error={errors.mobileNumber}>
                  <input className={inputClass} type="tel" value={form.mobileNumber} onChange={(e) => onField("mobileNumber", e.target.value)} />
                </Field>
                <Field label="Official email" error={errors.email}>
                  <input className={inputClass} type="email" value={form.email} onChange={(e) => onField("email", e.target.value)} />
                </Field>
                <Field label="Current address" wide>
                  <textarea
                    className={inputClass + " min-h-[84px] resize-y"}
                    rows={2}
                    value={form.currentAddress}
                    onChange={(e) => onCurrentAddr(e.target.value)}
                  />
                </Field>
                <div className="col-span-2 max-[559px]:col-span-1">
                  <label className="flex min-h-[36px] cursor-pointer items-center gap-2.5 text-sm">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-teal-700"
                      checked={form.sameAsCurrent}
                      onChange={(e) => onSameAddr(e.target.checked)}
                    />
                    Permanent address is the same as current address
                  </label>
                </div>
                <Field label="Permanent address" wide>
                  <textarea
                    className={inputClass + " min-h-[84px] resize-y"}
                    rows={2}
                    value={form.permanentAddress}
                    disabled={form.sameAsCurrent}
                    onChange={(e) => onField("permanentAddress", e.target.value)}
                  />
                </Field>
              </div>

              <h4 className="mb-2.5 mt-4.5 text-sm font-semibold text-slate-600">Emergency contact</h4>
              <div className="grid grid-cols-2 gap-3.5 max-[559px]:grid-cols-1">
                <Field label="Name">
                  <input className={inputClass} value={form.emergencyName} onChange={(e) => onField("emergencyName", e.target.value)} />
                </Field>
                <Field label="Relation">
                  <input
                    className={inputClass}
                    value={form.emergencyRelation}
                    onChange={(e) => onField("emergencyRelation", e.target.value)}
                    placeholder="e.g. Spouse, Father"
                  />
                </Field>
                <Field label="Phone number" error={errors.emergencyNumber}>
                  <input className={inputClass} type="tel" value={form.emergencyNumber} onChange={(e) => onField("emergencyNumber", e.target.value)} />
                </Field>
              </div>
            </section>

            <section className="mt-5.5 border-t border-slate-200 pt-5">
              <h3 className="mb-3.5 text-lg font-bold">Job details</h3>
              <div className="grid grid-cols-2 gap-3.5 max-[559px]:grid-cols-1">
                <Field label="Key responsibilities" wide help="One responsibility per line.">
                  <textarea
                    className={inputClass + " min-h-[100px] resize-y"}
                    rows={4}
                    value={form.keyResponsibilities}
                    onChange={(e) => onField("keyResponsibilities", e.target.value)}
                    placeholder={"Front desk\nVisitor register\nCourier handling"}
                  />
                </Field>
                <Field label="Skills and tools" wide help="Separate with commas.">
                  <input className={inputClass} value={form.skills} onChange={(e) => onField("skills", e.target.value)} placeholder="MS Office, Tally, Typing" />
                </Field>
                <Field label="Qualification">
                  <input className={inputClass} value={form.qualification} onChange={(e) => onField("qualification", e.target.value)} placeholder="e.g. B.Com" />
                </Field>
                <Field label="Experience">
                  <input className={inputClass} value={form.experience} onChange={(e) => onField("experience", e.target.value)} placeholder="e.g. 4 years in office admin" />
                </Field>
                <div className="col-span-2 max-[559px]:col-span-1">
                  <span className="mb-1.5 block text-sm font-semibold">Access levels</span>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Access levels">
                    {ACCESS_PRESETS.map((level) => {
                      const active = form.accessLevels.includes(level);
                      return (
                        <button
                          key={level}
                          type="button"
                          aria-pressed={active}
                          onClick={() => onToggleAccess(level)}
                          className={`min-h-[38px] rounded-full border px-3.5 text-sm ${
                            active ? "border-teal-700 bg-teal-700 font-semibold text-white" : "border-slate-300 bg-white"
                          }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Field label="Other access" wide>
                  <input className={inputClass} value={form.otherAccess} onChange={(e) => onField("otherAccess", e.target.value)} placeholder="Anything not listed above" />
                </Field>
              </div>
            </section>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-200 px-5 py-3">
            {serverError && <span className="mr-auto text-sm text-red-700" role="alert">{serverError}</span>}
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 font-semibold disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] rounded-lg bg-teal-700 px-4 font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : editingId ? "Save changes" : "Add staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, error, help, wide, children }) {
  return (
    <label className={`flex min-w-0 flex-col gap-1.5 ${wide ? "col-span-2 max-[559px]:col-span-1" : ""}`}>
      <span className="text-sm font-semibold">
        {label}
        {required && <em className="ml-1.5 text-[13px] font-normal not-italic text-slate-400">required</em>}
      </span>
      {children}
      {help && <span className="text-[13px] text-slate-500">{help}</span>}
      {error && <small className="text-[13px] text-red-700">{error}</small>}
    </label>
  );
}
