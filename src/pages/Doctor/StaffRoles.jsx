import { useContext, useEffect, useMemo, useState } from "react";
import { TourContext } from "../../context/TourContext";
import { STAFF_TAB_GROUPS, STAFF_TABS, STAFF_TAB_LABEL, STAFF_TAB_GROUP } from "../../config/staffTabs";

// ══════════════════════════════════════════════════════════════════════════════
// STAFF ROLES — HR team create pannuvaanga (eg: Ticketing Team, Booking Team)
// Ovvoru role kum endha tabs theriyanum nu tick pannuvaanga.
// Staff Profile la role select panna, andha staff ku indha tabs mattum dhaan.
// ══════════════════════════════════════════════════════════════════════════════

const EMPTY_ROLE = { name: "", description: "", tabs: [] };

const inputClass =
  "w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-[15px] text-slate-900 " +
  "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600";

export default function StaffRoles() {
  const {
    staffRoles = [],
    staffRolesLoading,
    getStaffRoles,
    createStaffRole,
    updateStaffRole,
    deleteStaffRole,
  } = useContext(TourContext);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_ROLE);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    getStaffRoles();
  }, [getStaffRoles]);

  const allSelected = form.tabs.length === STAFF_TABS.length;

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_ROLE);
    setErrors({});
    setFormOpen(true);
  }

  function openEdit(role) {
    setEditingId(role._id);
    setForm({
      name: role.name || "",
      description: role.description || "",
      tabs: (role.tabs || []).filter((t) => STAFF_TAB_LABEL[t]),
    });
    setErrors({});
    setFormOpen(true);
  }

  function toggleTab(key) {
    setForm((f) => ({
      ...f,
      tabs: f.tabs.includes(key) ? f.tabs.filter((t) => t !== key) : [...f.tabs, key],
    }));
  }

  function toggleAll() {
    setForm((f) => ({ ...f, tabs: allSelected ? [] : STAFF_TABS.map((t) => t.key) }));
  }

  // Oru group (Tour Admin / Admin) mattum full select / clear
  function toggleGroup(group) {
    const keys = group.tabs.map((t) => t.key);
    const groupAll = keys.every((k) => form.tabs.includes(k));
    setForm((f) => ({
      ...f,
      tabs: groupAll ? f.tabs.filter((t) => !keys.includes(t)) : [...new Set([...f.tabs, ...keys])],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Enter a role name.";
    if (!form.tabs.length) next.tabs = "Select at least one tab.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    // Sidebar order la save — staff sidebar um adhe order la varum
    const orderedTabs = STAFF_TABS.map((t) => t.key).filter((k) => form.tabs.includes(k));
    const payload = { name: form.name.trim(), description: form.description.trim(), tabs: orderedTabs };
    const result = editingId ? await updateStaffRole(editingId, payload) : await createStaffRole(payload);
    setSaving(false);

    if (!result.success) {
      if (result.errors) setErrors((prev) => ({ ...prev, ...result.errors }));
      return;
    }
    setFormOpen(false);
  }

  async function handleDelete() {
    if (!confirmTarget) return;
    setDeleting(true);
    setDeleteError("");
    const result = await deleteStaffRole(confirmTarget._id);
    setDeleting(false);
    if (!result.success) {
      setDeleteError(result.message || "Could not delete this role.");
      return;
    }
    setConfirmTarget(null);
  }

  const sortedRoles = useMemo(
    () => [...staffRoles].sort((a, b) => String(a.name).localeCompare(String(b.name), "en", { sensitivity: "base" })),
    [staffRoles]
  );

  return (
    <div className="mx-4 mt-16 mb-6 max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:mx-6 sm:mb-8 sm:rounded-3xl lg:mt-10">
      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-800 to-blue-700 px-4 py-4 sm:px-6 sm:py-5">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-[18px]" aria-hidden="true">👥</span>
        <h1 className="text-[20px] font-bold text-white">Staff Roles</h1>
      </div>

      <div className="p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[19px] font-bold text-blue-900">Teams & tab access</h2>
            <p className="text-[13px] text-slate-500">
              Create a role for each team and choose which tabs they can use. Assign the role in Staff Profile.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-blue-700 px-4 text-[14px] font-semibold text-white hover:bg-blue-800"
          >
            + New Role
          </button>
        </div>

        {staffRolesLoading && !staffRoles.length && (
          <div className="py-10 text-center text-[14px] text-slate-500">Loading roles…</div>
        )}

        {!staffRolesLoading && !staffRoles.length && (
          <div className="py-10 text-center text-[14px] text-slate-500">
            No roles yet.
            <div className="mt-3">
              <button onClick={openCreate} className="rounded-xl bg-blue-700 px-4 py-2 text-[13px] font-semibold text-white">
                Create the first role
              </button>
            </div>
          </div>
        )}

        {sortedRoles.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {sortedRoles.map((r) => {
              const tabs = (r.tabs || []).filter((t) => STAFF_TAB_LABEL[t]);
              return (
                <div key={r._id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[16px] font-bold text-slate-800">{r.name}</p>
                      {r.description && <p className="text-[12.5px] text-slate-500">{r.description}</p>}
                    </div>
                    <span className="whitespace-nowrap rounded-full bg-blue-50 px-2.5 py-0.5 text-[12px] font-semibold text-blue-700">
                      {r.staffCount || 0} staff
                    </span>
                  </div>

                  {STAFF_TAB_GROUPS.map((g) => {
                    const groupTabs = tabs.filter((t) => STAFF_TAB_GROUP[t] === g.key);
                    if (!groupTabs.length) return null;
                    return (
                      <div key={g.key} className="mt-3">
                        <p className="text-[11.5px] font-semibold uppercase tracking-wide text-slate-400">
                          {g.icon} {g.label} · {groupTabs.length}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {groupTabs.map((t) => (
                            <span
                              key={t}
                              className={`rounded-full px-2 py-0.5 text-[11.5px] font-medium ${g.key === "admin" ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-slate-700"
                                }`}
                            >
                              {STAFF_TAB_LABEL[t]}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {!tabs.length && <p className="mt-3 text-[12.5px] text-slate-400">No tabs selected</p>}

                  <div className="mt-auto flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => { setDeleteError(""); setConfirmTarget(r); }}
                      className="min-h-[36px] rounded-lg px-3 text-[13px] font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(r)}
                      className="min-h-[36px] rounded-lg border border-slate-300 px-3 text-[13px] font-semibold text-blue-800 hover:bg-blue-50"
                    >
                      ✎ Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── create / edit ── */}
      {formOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 p-3" onClick={() => !saving && setFormOpen(false)}>
          <form
            onSubmit={handleSubmit}
            noValidate
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[calc(100vh-24px)] w-full max-w-[640px] flex-col overflow-hidden rounded-3xl bg-white"
          >
            <div className="bg-gradient-to-r from-blue-800 to-blue-700 px-4 py-5 sm:px-6">
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-blue-200">
                {editingId ? "Edit role" : "New role"}
              </p>
              <h2 className="text-[20px] font-bold text-white">{form.name || "Untitled role"}</h2>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
              <label className="flex flex-col gap-1.5">
                <span className="text-[13.5px] font-semibold text-slate-700">Role name *</span>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Ticketing Team"
                />
                {errors.name && <small className="text-[12.5px] font-medium text-red-600">{errors.name}</small>}
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[13.5px] font-semibold text-slate-700">Description</span>
                <input
                  className={inputClass}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Optional — what this team does"
                />
              </label>

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[13.5px] font-semibold text-slate-700">
                    Tabs this team can use * <span className="font-normal text-slate-400">({form.tabs.length} selected)</span>
                  </span>
                  <button type="button" onClick={toggleAll} className="text-[12.5px] font-semibold text-blue-700 underline underline-offset-2">
                    {allSelected ? "Clear all" : "Select all"}
                  </button>
                </div>
                <div className="space-y-4">
                  {STAFF_TAB_GROUPS.map((g) => {
                    const selected = g.tabs.filter((t) => form.tabs.includes(t.key)).length;
                    const groupAll = selected === g.tabs.length;
                    return (
                      <div key={g.key} className="rounded-2xl border border-slate-200">
                        <div className="flex items-center justify-between gap-2 rounded-t-2xl border-b border-slate-200 bg-slate-50 px-3 py-2.5">
                          <span className="text-[14px] font-bold text-slate-800">
                            {g.icon} {g.label}{" "}
                            <span className="font-normal text-slate-400">({selected}/{g.tabs.length})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleGroup(g)}
                            className="text-[12.5px] font-semibold text-blue-700 underline underline-offset-2"
                          >
                            {groupAll ? "Clear" : "Select all"}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
                          {g.tabs.map((t) => {
                            const on = form.tabs.includes(t.key);
                            return (
                              <label
                                key={t.key}
                                className={`flex min-h-[42px] cursor-pointer items-center gap-2.5 rounded-lg border px-3 text-[14px] ${on ? "border-blue-600 bg-blue-50 font-semibold text-blue-900" : "border-slate-200 text-slate-700"
                                  }`}
                              >
                                <input type="checkbox" className="h-4 w-4 accent-blue-700" checked={on} onChange={() => toggleTab(t.key)} />
                                {t.label}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {errors.tabs && <small className="mt-1.5 block text-[12.5px] font-medium text-red-600">{errors.tabs}</small>}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-slate-200 px-4 py-3 sm:px-6 sm:py-4">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                disabled={saving}
                className="min-h-[42px] rounded-xl border border-slate-300 px-4 text-[14px] font-semibold disabled:opacity-60"
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} className="min-h-[42px] rounded-xl bg-blue-700 px-5 text-[14px] font-semibold text-white disabled:opacity-60">
                {saving ? "Saving…" : editingId ? "Save changes" : "Create role"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── delete confirm ── */}
      {confirmTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/55 p-3" onClick={() => !deleting && setConfirmTarget(null)}>
          <div className="w-full max-w-[420px] rounded-2xl bg-white p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-2 text-[19px] font-bold text-slate-800">Delete “{confirmTarget.name}”?</h2>
            <p className="text-[14px] text-slate-600">
              {confirmTarget.staffCount
                ? `${confirmTarget.staffCount} staff use this role. Move them to another role in Staff Profile first.`
                : "No staff use this role. This cannot be undone."}
            </p>
            {deleteError && <p className="mt-2 text-[13px] font-medium text-red-600">{deleteError}</p>}
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setConfirmTarget(null)}
                className="min-h-[42px] rounded-xl border border-slate-300 px-4 text-[14px] font-semibold disabled:opacity-60"
              >
                Keep role
              </button>
              <button
                type="button"
                disabled={deleting || confirmTarget.staffCount > 0}
                onClick={handleDelete}
                className="min-h-[42px] rounded-xl bg-red-600 px-4 text-[14px] font-semibold text-white disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
