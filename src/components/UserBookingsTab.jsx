
// "User Bookings" tab — third tab on the Aadhaar Upload page, alongside
// the existing "Save Booking" and "All Bookings" tabs (neither of which
// this file touches or imports). For a guest who already booked THEMSELVES
// online, through the real customer website (createdBy: "user" on
// tourBookingModel) — there's no walk-in aadhaarModel group for them, so
// Save Booking / All Bookings never show them. This tab auto-lists every
// such booking for the selected tour (same as All Bookings auto-lists its
// walk-in groups — no email typed in) and lets the admin attach the
// guest's Aadhaar + payment screenshots straight onto the right one.
//
// Read-only against tourBookingModel except the one narrow, pre-existing
// write pattern (travellers.$.aadhaarId) the backend already uses
// elsewhere for admin-attached proof — never payment.advance/balance.paid,
// never anything in the Manage Booking financial subsystem.
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Loader2,
  Upload,
  CheckCircle2,
  Users,
  IndianRupee,
  Receipt,
  Wallet,
  Clock,
  RefreshCw,
  Eye,
  Trash2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

// Click-to-copy icon for a TNR — stopPropagation matters since this always
// sits inside the booking row's own expand/collapse click target.
const CopyTnrButton = ({ tnr, className = "" }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(tnr);
    } catch (err) {
      console.error("Copy TNR failed:", err);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy TNR"
      className={`inline-flex items-center justify-center shrink-0 hover:opacity-60 transition-opacity ${className}`}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

// Same three-state traveller badge as the All Bookings tab — a pending
// cancellation request, one the admin rejected (traveller stays active),
// or one actually approved/cancelled. searchUserBookings already resolves
// which of the three a traveller is in; nothing shown when active (null).
const CANCEL_STATUS = {
  request: { label: "Cancellation Requested", className: "bg-amber-100 text-amber-700 border border-amber-200" },
  rejected: { label: "Cancellation Rejected", className: "bg-gray-100 text-gray-600 border border-gray-300" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 border border-red-200" },
};
const CancelStatusBadge = ({ status }) => {
  const meta = CANCEL_STATUS[status];
  if (!meta) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.className}`}>
      {meta.label}
    </span>
  );
};

const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "—";

// One-at-a-time image viewer for a list of payment screenshots — clicking
// any uploaded item (however many there are) opens this instead of a raw
// new-tab link, with Prev/Next to step through all of them one by one.
// Duplicated from AadhaarUpload.jsx's copy (same reason as CopyTnrButton
// above — importing it would create a circular dependency).
// A PDF uploaded to Cloudinary can't render inside <img>; swapping the
// .pdf extension for .jpg makes Cloudinary serve page 1 as an image.
const toPreviewUrl = (url = "") => url.replace(/\.pdf(\?.*)?$/i, ".jpg$1");

const ScreenshotViewer = ({ items, index, onClose, onNav }) => {
  if (index === null || index === undefined || !items?.[index]) return null;
  const item = items[index];
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <img
          src={toPreviewUrl(item.url)}
          alt={`Screenshot ${index + 1}`}
          className="w-full max-h-[70vh] object-contain bg-gray-100"
        />
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
          <button
            type="button"
            onClick={() => onNav(index - 1)}
            disabled={index === 0}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {index + 1} / {items.length}
            {item.amount ? ` — ₹${item.amount}` : " — amount not entered"}
            {item.remarks ? ` — ${item.remarks}` : ""}
          </span>
          <button
            type="button"
            onClick={() => onNav(index + 1)}
            disabled={index === items.length - 1}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// One traveller row — pick Aadhaar front (+ back for the main traveller
// only), Extract (OCR, same two-step pattern as the rest of this page:
// read first, confirm, then save), then Save. Named-exported (alongside
// the default UserBookingsTab) so the All Bookings tab's BookingCard can
// reuse the exact same "upload Aadhaar for a traveller missing one"
// UI/logic for its own main/co-travellers, instead of a second copy.
export const TravellerAadhaarRow = ({ traveller, tnr, extractAadhaar, uploadUserTravellerAadhaar, onSaved }) => {
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [draft, setDraft] = useState(null); // { front, back, parsed }
  const [saving, setSaving] = useState(false);

  const alreadyHasAadhaar = traveller.hasAadhaar;
  const name = [traveller.title, traveller.firstName, traveller.lastName].filter(Boolean).join(" ") || "Unnamed traveller";

  const handleExtract = async () => {
    if (!frontFile) return toast.error("Choose the Aadhaar front image first");
    setExtracting(true);
    try {
      const formData = new FormData();
      formData.append("front", frontFile);
      if (!traveller.isCoTraveller && backFile) formData.append("back", backFile);
      const result = await extractAadhaar(formData);
      if (!result?.success || !result.front?.url) {
        toast.error(result?.message || "Could not read this Aadhaar image.");
        return;
      }
      setDraft({ front: result.front, back: result.back || null, parsed: result.parsed || {} });
      toast.success(`Aadhaar read for ${name}. Verify, then Save.`);
    } catch (err) {
      console.error("TravellerAadhaarRow extract error:", err);
      toast.error("Something went wrong reading this Aadhaar.");
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!draft?.front?.url) return;
    setSaving(true);
    try {
      const res = await uploadUserTravellerAadhaar({
        tnr,
        travellerId: traveller._id,
        front: draft.front,
        back: draft.back,
        parsed: draft.parsed,
      });
      if (res?.success) {
        toast.success(`Aadhaar saved for ${name}`);
        setDraft(null);
        setFrontFile(null);
        setBackFile(null);
        onSaved?.();
      } else {
        toast.error(res?.message || "Could not save this Aadhaar.");
      }
    } catch (err) {
      console.error("TravellerAadhaarRow save error:", err);
      toast.error("Could not save this Aadhaar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-3">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <p className="font-semibold text-sm text-gray-900 flex items-center gap-2 flex-wrap">
          {name}{" "}
          <span className="font-normal text-gray-500">
            · {traveller.age ?? "—"} yrs, {traveller.gender || "—"} · {traveller.isCoTraveller ? "Co-traveller" : "Main traveller"}
          </span>
          <CancelStatusBadge status={traveller.cancelStatus} />
        </p>
        {alreadyHasAadhaar && !draft && (
          <span className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Aadhaar on file
            </span>
            {traveller.aadhaar?.front?.url && (
              <a
                href={traveller.aadhaar.front.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <Eye className="w-3.5 h-3.5" /> View front
              </a>
            )}
            {traveller.aadhaar?.back?.url && (
              <a
                href={traveller.aadhaar.back.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <Eye className="w-3.5 h-3.5" /> View back
              </a>
            )}
          </span>
        )}
      </div>

      {!draft ? (
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-medium bg-white border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:border-indigo-400">
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            {frontFile ? frontFile.name : "Choose Aadhaar front (JPG / PDF)"}
            <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setFrontFile(e.target.files?.[0] || null)} />
          </label>
          {!traveller.isCoTraveller && (
            <label className="flex items-center gap-2 text-xs font-medium bg-white border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:border-indigo-400">
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              {backFile ? backFile.name : "Choose Aadhaar back (optional)"}
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setBackFile(e.target.files?.[0] || null)} />
            </label>
          )}
          <button
            onClick={handleExtract}
            disabled={!frontFile || extracting}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 rounded-lg px-4 py-2"
          >
            {extracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {extracting ? "Reading..." : "Extract"}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between flex-wrap gap-2 bg-white border border-indigo-200 rounded-lg px-3 py-2.5">
          <p className="text-xs text-gray-700">
            Read as: <strong>{[draft.parsed?.firstName, draft.parsed?.lastName].filter(Boolean).join(" ") || "—"}</strong>
            {draft.back ? " · front + back" : " · front only"}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setDraft(null); setFrontFile(null); setBackFile(null); }}
              className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 rounded-lg px-4 py-2"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// One payment screenshot slot — Advance / Partial / Balance. Shows every
// screenshot already uploaded for this slot (View links, same as All
// Bookings) above the upload form, so nothing looks "empty" once a guest
// has actually paid.
const PaymentSlot = ({ tnr, slot, label, Icon, uploadUserBookingPayment, deleteGroupPayment, existing = [], refresh }) => {
  // queue holds files picked together but not yet uploaded, queueAmounts
  // the (optional) amount typed against each one, same index. "Upload All"
  // sends them to the backend ONE AT A TIME in order (not in parallel) so
  // each screenshot lands as its own doc — the admin picks several
  // together but doesn't have to click Upload once per file.
  const [queue, setQueue] = useState([]);
  const [queueAmounts, setQueueAmounts] = useState([]);
  const [queueRemarks, setQueueRemarks] = useState([]); // bank name per file, same index
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); // { current, total }
  const [deletingId, setDeletingId] = useState(null);
  const [viewerIndex, setViewerIndex] = useState(null);

  const handleDelete = async (docId) => {
    if (!window.confirm(`Delete this ${label} screenshot? This can't be undone.`)) return;
    setDeletingId(docId);
    try {
      const result = await deleteGroupPayment(docId);
      if (result?.success) {
        toast.success(`${label} screenshot deleted`);
        refresh?.();
      } else {
        toast.error(result?.message || "Could not delete this screenshot.");
      }
    } catch (err) {
      console.error("PaymentSlot delete error:", err);
      toast.error("Could not delete this screenshot.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRemoveQueued = (idx) => {
    setQueue((prev) => prev.filter((_, i) => i !== idx));
    setQueueAmounts((prev) => prev.filter((_, i) => i !== idx));
    setQueueRemarks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUploadAll = async () => {
    if (queue.length === 0) return toast.error(`Choose at least one ${label} screenshot first`);
    for (let i = 0; i < queueAmounts.length; i++) {
      if (queueAmounts[i] && Number(queueAmounts[i]) <= 0) {
        return toast.error(`Amount for "${queue[i]?.name}", if entered, must be a positive number`);
      }
    }
    setUploading(true);
    let successCount = 0;
    for (let i = 0; i < queue.length; i++) {
      setUploadProgress({ current: i + 1, total: queue.length });
      try {
        const formData = new FormData();
        formData.append("screenshot", queue[i]);
        formData.append("tnr", tnr);
        formData.append("type", slot);
        if (queueAmounts[i]) formData.append("amount", queueAmounts[i]);
        if (queueRemarks[i]?.trim()) formData.append("remarks", queueRemarks[i].trim());
        const res = await uploadUserBookingPayment(formData);
        if (res?.success) successCount += 1;
        else toast.error(res?.message || "Upload failed.");
      } catch (err) {
        console.error("PaymentSlot upload error:", err);
      }
    }
    setUploading(false);
    setUploadProgress(null);
    setQueue([]);
    setQueueAmounts([]);
    setQueueRemarks([]);
    if (successCount > 0) {
      toast.success(`${successCount} ${label} screenshot${successCount > 1 ? "s" : ""} saved`);
    }
    refresh?.();
  };

  return (
    <div className="min-w-0 w-full border border-gray-200 rounded-xl p-3 sm:p-4">
      <p className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-3">
        <Icon className="w-4 h-4" /> {label}
      </p>

      {existing.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-3">
          {existing.map((p, i) => (
            <div
              key={p._id || i}
              className="flex items-center justify-between gap-2 text-xs bg-green-50 border border-green-200 rounded-lg pl-2.5 pr-1.5 py-1.5 text-green-700 font-semibold hover:bg-green-100"
            >
              {/* Opens the one-at-a-time viewer instead of a raw new-tab
                  link, so several screenshots can be stepped through
                  (Prev/Next) without leaving the page. */}
              <button
                type="button"
                onClick={() => setViewerIndex(i)}
                className="flex items-center gap-2 min-w-0 text-left"
              >
                <span className="flex flex-col min-w-0">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 shrink-0" />
                    {existing.length > 1 ? `#${i + 1}` : "View"}
                    {p.amount ? ` — ₹${p.amount}` : " — amount not entered"}
                  </span>
                  <span className="font-normal text-green-600 truncate">{formatDateTime(p.uploadedAt || p.createdAt)}</span>
                  {p.remarks && <span className="font-normal text-green-600 italic truncate">{p.remarks}</span>}
                </span>
              </button>
              {p._id && deleteGroupPayment && (
                <button
                  type="button"
                  onClick={() => handleDelete(p._id)}
                  disabled={deletingId === p._id}
                  title={`Delete this ${label} screenshot`}
                  className="shrink-0 p-1 rounded-md text-red-600 hover:text-red-800 hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  {deletingId === p._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ScreenshotViewer
        items={existing}
        index={viewerIndex}
        onClose={() => setViewerIndex(null)}
        onNav={setViewerIndex}
      />

      {/* Pick several screenshots together — they still go to the backend
          one at a time (sequentially), but a single "Upload All" click
          walks the whole queue instead of needing a click per file. */}
      {queue.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-2">
          {queue.map((f, i) => (
            <div key={i} className="flex flex-col gap-1.5 p-2 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-1.5">
                <div className="flex-1 min-w-0 flex items-center gap-1.5 text-xs font-medium px-1 py-1">
                  <Upload className="w-3.5 h-3.5 shrink-0 text-gray-500" />
                  <span className="truncate">{f.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveQueued(i)}
                  disabled={uploading}
                  title="Remove from queue"
                  className="shrink-0 p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                type="number"
                placeholder="₹ Amount (optional)"
                value={queueAmounts[i] || ""}
                onChange={(e) =>
                  setQueueAmounts((prev) => prev.map((a, idx) => (idx === i ? e.target.value : a)))
                }
                disabled={uploading}
                className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 outline-none focus:border-indigo-400"
              />
              <input
                type="text"
                placeholder="Bank (e.g. SBI)"
                value={queueRemarks[i] || ""}
                onChange={(e) =>
                  setQueueRemarks((prev) => {
                    const next = [...prev];
                    next[i] = e.target.value;
                    return next;
                  })
                }
                disabled={uploading}
                className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 outline-none focus:border-indigo-400"
              />
            </div>
          ))}
        </div>
      )}

      <label className="flex items-center gap-2 text-xs font-medium bg-gray-50 border border-dashed border-gray-300 rounded-lg px-3 py-3 cursor-pointer hover:border-indigo-400 mb-2">
        <Upload className="w-3.5 h-3.5 text-gray-500" />
        {queue.length > 0 ? "Add more screenshot(s)" : "Choose screenshot(s)"}
        <input
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (!files.length) return;
            setQueue((prev) => [...prev, ...files]);
            setQueueAmounts((prev) => [...prev, ...files.map(() => "")]);
            setQueueRemarks((prev) => [...prev, ...files.map(() => "")]);
            e.target.value = "";
          }}
        />
      </label>

      {queue.length > 0 && (
        <button
          onClick={handleUploadAll}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 rounded-lg py-2"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          {uploading
            ? `Uploading ${uploadProgress?.current || 1} of ${uploadProgress?.total || queue.length}...`
            : `Upload ${queue.length > 1 ? `All (${queue.length})` : ""}`}
        </button>
      )}
    </div>
  );
};

const UserBookingsTab = ({ tourId, searchUserBookings, uploadUserTravellerAadhaar, uploadUserBookingPayment, deleteGroupPayment, extractAadhaar }) => {
  const [filter, setFilter] = useState(""); // client-side only — name/email/tnr
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [expandedTnr, setExpandedTnr] = useState(null);

  // Auto-loads every online booking for the selected tour — no email typed
  // in, same as the All Bookings tab auto-lists its walk-in groups.
  const fetchAll = useCallback(async () => {
    if (!tourId) return;
    setLoading(true);
    try {
      const res = await searchUserBookings(tourId);
      if (res?.success) {
        setBookings(res.bookings || []);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("UserBookingsTab fetch error:", err);
      toast.error("Could not load online bookings.");
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [tourId, searchUserBookings]);

  useEffect(() => {
    setBookings([]);
    setLoaded(false);
    setExpandedTnr(null);
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId]);

  const visibleBookings = filter.trim()
    ? bookings.filter((b) => {
      const q = filter.trim().toLowerCase();
      const names = (b.travellers || [])
        .map((t) => [t.title, t.firstName, t.lastName].filter(Boolean).join(" "))
        .join(" ")
        .toLowerCase();
      return (
        b.tnr?.toLowerCase().includes(q) ||
        b.contact?.email?.toLowerCase().includes(q) ||
        b.contact?.mobile?.toLowerCase().includes(q) ||
        names.includes(q)
      );
    })
    : bookings;

  return (
    <div>
      {/* Every online booking for this tour, auto-loaded */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
          <p className="text-sm font-bold text-gray-800">Online bookings for this tour</p>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Every booking the customer made themselves on the website for this tour — upload their Aadhaar &amp;
          payment screenshots here on their behalf.
        </p>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by name, email, mobile or TNR (optional)"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
      </div>

      {loading && bookings.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-12 text-gray-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading online bookings...
        </div>
      )}

      {loaded && !loading && bookings.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm rounded-2xl border-2 border-dashed border-gray-200">
          No online bookings found for this tour yet.
        </div>
      )}

      {loaded && !loading && bookings.length > 0 && visibleBookings.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm rounded-2xl border-2 border-dashed border-gray-200">
          No booking matches "{filter}".
        </div>
      )}

      {visibleBookings.map((b) => {
        const expanded = expandedTnr === b.tnr;
        return (
          <div key={b.tnr} className="border border-gray-200 rounded-2xl overflow-hidden mb-4">
            {/* A real <button> here would nest CopyTnrButton's own
                <button> inside it — invalid HTML, which React warns about
                and browsers mangle to recover from — so this is a div
                acting as the toggle, with the keyboard behavior a button
                would give for free. */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setExpandedTnr(expanded ? null : b.tnr)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setExpandedTnr(expanded ? null : b.tnr);
                }
              }}
              className="w-full flex items-center justify-between gap-3 bg-white px-5 py-4 text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-wrap">
                <code className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wider">
                  {b.tnr}
                  <CopyTnrButton tnr={b.tnr} />
                </code>
                <span className="bg-green-100 text-green-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                  ● USER — booked online
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" /> {formatDateTime(b.bookingDate)}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="w-3.5 h-3.5" /> {b.travellers?.length || 0} travellers
                </span>
              </div>
              {b.paymentSummary && (
                b.paymentSummary.fullyPaid ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Fully paid
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                    Balance Due: ₹{b.paymentSummary.balanceRemaining.toLocaleString("en-IN")}
                    {b.paymentSummary.packageAmount > 0 && (
                      <span className="font-medium text-amber-600"> (of ₹{b.paymentSummary.packageAmount.toLocaleString("en-IN")})</span>
                    )}
                  </span>
                )
              )}
            </div>

            {expanded && (
              <div className="bg-white border-t border-gray-100 px-5 py-5">
                <p className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-3">
                  <Users className="w-4 h-4" /> Travellers
                </p>
                {(b.travellers || []).map((t) => (
                  <TravellerAadhaarRow
                    key={t._id}
                    traveller={t}
                    tnr={b.tnr}
                    extractAadhaar={extractAadhaar}
                    uploadUserTravellerAadhaar={uploadUserTravellerAadhaar}
                    onSaved={fetchAll}
                  />
                ))}

                <p className="text-sm font-bold text-gray-800 mt-5 mb-1">Payment Screenshots</p>
                <p className="text-xs text-gray-500 mb-3">
                  Upload whichever this guest has paid — each one lands straight on this booking's Payment Tasks list.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <PaymentSlot tnr={b.tnr} slot="advance" label="Advance" Icon={IndianRupee} uploadUserBookingPayment={uploadUserBookingPayment} deleteGroupPayment={deleteGroupPayment} existing={b.payments?.advance} refresh={fetchAll} />
                  <PaymentSlot tnr={b.tnr} slot="partial" label="Partial" Icon={Receipt} uploadUserBookingPayment={uploadUserBookingPayment} deleteGroupPayment={deleteGroupPayment} existing={b.payments?.partial} refresh={fetchAll} />
                  <PaymentSlot tnr={b.tnr} slot="balance" label="Balance" Icon={Wallet} uploadUserBookingPayment={uploadUserBookingPayment} deleteGroupPayment={deleteGroupPayment} existing={b.payments?.balance} refresh={fetchAll} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UserBookingsTab;
