// "User Bookings" tab — third tab on the Aadhaar Upload page, alongside
// the existing "Save Booking" and "All Bookings" tabs (neither of which
// this file touches or imports). For a guest who already booked THEMSELVES
// online, through the real customer website (bookingType: "online" on
// tourBookingModel) — there's no walk-in aadhaarModel group for them, so
// Save Booking / All Bookings never show them. This tab finds that real
// booking by tour + email and lets the admin attach the guest's Aadhaar +
// payment screenshots straight onto it.
//
// Read-only against tourBookingModel except the one narrow, pre-existing
// write pattern (travellers.$.aadhaarId) the backend already uses
// elsewhere for admin-attached proof — never payment.advance/balance.paid,
// never anything in the Manage Booking financial subsystem.
import React, { useState } from "react";
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
} from "lucide-react";
import { toast } from "react-toastify";

const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "—";

// One traveller row — pick Aadhaar front (+ back for the main traveller
// only), Extract (OCR, same two-step pattern as the rest of this page:
// read first, confirm, then save), then Save.
const TravellerAadhaarRow = ({ traveller, tnr, extractAadhaar, uploadUserTravellerAadhaar, onSaved }) => {
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
        <p className="font-semibold text-sm text-gray-900">
          {name}{" "}
          <span className="font-normal text-gray-500">
            · {traveller.age ?? "—"} yrs, {traveller.gender || "—"} · {traveller.isCoTraveller ? "Co-traveller" : "Main traveller"}
          </span>
        </p>
        {alreadyHasAadhaar && !draft && (
          <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" /> Aadhaar on file
          </span>
        )}
      </div>

      {!draft ? (
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-medium bg-white border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:border-indigo-400">
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            {frontFile ? frontFile.name : "Choose Aadhaar front"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFrontFile(e.target.files?.[0] || null)} />
          </label>
          {!traveller.isCoTraveller && (
            <label className="flex items-center gap-2 text-xs font-medium bg-white border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:border-indigo-400">
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              {backFile ? backFile.name : "Choose Aadhaar back (optional)"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setBackFile(e.target.files?.[0] || null)} />
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

// One payment screenshot slot — Advance / Partial / Balance.
const PaymentSlot = ({ tnr, slot, label, Icon, uploadUserBookingPayment }) => {
  const [file, setFile] = useState(null);
  const [amount, setAmount] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleUpload = async () => {
    if (!file) return toast.error(`Choose the ${label} screenshot first`);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("screenshot", file);
      formData.append("tnr", tnr);
      formData.append("type", slot);
      if (amount) formData.append("amount", amount);
      const res = await uploadUserBookingPayment(formData);
      if (res?.success) {
        toast.success(`${label} screenshot saved — ₹${res.payment?.amount ?? amount ?? "—"}`);
        setUploaded(true);
        setFile(null);
        setAmount("");
      } else {
        toast.error(res?.message || "Upload failed.");
      }
    } catch (err) {
      console.error("PaymentSlot upload error:", err);
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <p className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-3">
        <Icon className="w-4 h-4" /> {label}
      </p>
      <label className="flex items-center gap-2 text-xs font-medium bg-gray-50 border border-dashed border-gray-300 rounded-lg px-3 py-3 cursor-pointer hover:border-indigo-400 mb-2">
        <Upload className="w-3.5 h-3.5 text-gray-500" />
        {file ? file.name : "Choose screenshot"}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </label>
      <input
        type="number"
        placeholder="Amount (optional — OCR reads it first)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 mb-2 outline-none focus:border-indigo-400"
      />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 rounded-lg py-2"
      >
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
        {uploaded ? "Uploaded — add another" : uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

const UserBookingsTab = ({ tourId, searchUserBookings, uploadUserTravellerAadhaar, uploadUserBookingPayment, extractAadhaar }) => {
  const [email, setEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [searched, setSearched] = useState(false);
  const [expandedTnr, setExpandedTnr] = useState(null);

  const handleSearch = async () => {
    if (!email.trim()) return toast.error("Enter the customer's email first");
    setSearching(true);
    setSearched(false);
    try {
      const res = await searchUserBookings(tourId, email.trim());
      if (res?.success) {
        setBookings(res.bookings || []);
        setExpandedTnr(res.bookings?.[0]?.tnr || null);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("UserBookingsTab search error:", err);
      toast.error("Could not search online bookings.");
    } finally {
      setSearching(false);
      setSearched(true);
    }
  };

  return (
    <div>
      {/* Search by email */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6">
        <p className="text-sm font-bold text-gray-800 mb-1">Find a user-side booking for this tour</p>
        <p className="text-xs text-gray-500 mb-3">
          Search the ONLINE bookings the customer made themselves on the website — upload their Aadhaar &amp; payment
          screenshots here on their behalf.
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="customer@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold text-sm px-5 py-2.5 rounded-xl"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>
      </div>

      {searched && bookings.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm rounded-2xl border-2 border-dashed border-gray-200">
          No online bookings found for this email on this tour.
        </div>
      )}

      {bookings.map((b) => {
        const expanded = expandedTnr === b.tnr;
        return (
          <div key={b.tnr} className="border border-gray-200 rounded-2xl overflow-hidden mb-4">
            <button
              onClick={() => setExpandedTnr(expanded ? null : b.tnr)}
              className="w-full flex items-center justify-between gap-3 bg-white px-5 py-4 text-left"
            >
              <div className="flex items-center gap-3 flex-wrap">
                <code className="bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wider">
                  {b.tnr}
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
            </button>

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
                    onSaved={handleSearch}
                  />
                ))}

                <p className="text-sm font-bold text-gray-800 mt-5 mb-1">Payment Screenshots</p>
                <p className="text-xs text-gray-500 mb-3">
                  Upload whichever this guest has paid — each one lands straight on this booking's Payment Tasks list.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <PaymentSlot tnr={b.tnr} slot="advance" label="Advance" Icon={IndianRupee} uploadUserBookingPayment={uploadUserBookingPayment} />
                  <PaymentSlot tnr={b.tnr} slot="partial" label="Partial" Icon={Receipt} uploadUserBookingPayment={uploadUserBookingPayment} />
                  <PaymentSlot tnr={b.tnr} slot="balance" label="Balance" Icon={Wallet} uploadUserBookingPayment={uploadUserBookingPayment} />
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
