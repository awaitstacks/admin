import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TourContext } from "../../context/TourContext";
import {
  UserPlus,
  Upload,
  Loader2,
  CheckCircle2,
  Trash2,
  IndianRupee,
  FileImage,
  MapPin,
  Package,
  Train,
  Plane,
  Phone,
  Home,
  NotebookPen,
  ArrowRight,
  Users,
  IdCard,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Ticket,
  Link2,
  BookOpenCheck,
  RefreshCw,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// stationCode is NOT guaranteed unique within a tour's boardingPoints /
// deboardingPoints array — match by each point's own _id (same fix as
// TourBooking.jsx / CreateBooking.jsx).
const getPointId = (point) => {
  if (!point) return "";
  const raw = point._id;
  if (raw && typeof raw === "object" && raw.$oid) return String(raw.$oid);
  return raw !== undefined && raw !== null ? String(raw) : "";
};

// Traveller shape now holds ONLY person-level fields — identity + sharing +
// Aadhaar. Package Type, Boarding/Deboarding Point, Add-ons and Remarks are
// BOOKING-wide (set once, fetched from the selected tour's own data below —
// not typed free-text).
const blankTraveller = (isMain) => ({
  title: "Mr",
  firstName: "",
  lastName: "",
  age: "",
  gender: "Male",
  sharingType: "",
  // Address/Mobile — same fields for main AND co-travellers. OCR fills
  // these when it can; the admin can always edit/correct them here.
  phone: "",
  address: "",
  isCoTraveller: !isMain,
  // Aadhaar OCR
  front: null,
  back: null,
  ocrLoading: false,
  _frontFile: null,
  _backFile: null,
  source: "aadhaar", // "aadhaar" | "manual" — co-travellers can switch to manual
});

// ───────────────────────── Booking-wide section (Package / Boarding / Deboarding / Add-ons / Remarks) ─────────────────────────
// IMPORTANT: defined OUTSIDE AadhaarUpload (module scope), not as a function
// created fresh on every render. A component defined INSIDE a parent's
// render body gets a brand-new identity every re-render, so React unmounts
// and remounts the whole subtree on every keystroke — every input loses
// focus and the cursor jumps out after each character. Keeping it at
// module scope with plain props fixes that.
//
// Package Type / Boarding Point / Deboarding Point / Add-ons are now
// fetched from the selected tour's own data (tourInfo) via dropdowns —
// not typed free-text — so what the admin picks here actually matches a
// real package/boarding/deboarding/addon on that tour.
const BookingWideSection = ({
  tourInfo,
  packageSelection,
  setPackageSelection,
  boardingPoint,
  setBoardingPoint,
  deboardingPoint,
  setDeboardingPoint,
  selectedAddons,
  setSelectedAddons,
  remarks,
  setRemarks,
}) => {
  const pkg =
    packageSelection.type === "main"
      ? tourInfo
      : tourInfo?.variantPackage?.[packageSelection.variantIndex];

  const boardingOptions = pkg?.boardingPoints || [];
  const deboardingOptions = pkg?.deboardingPoints || [];
  const trainDetails = pkg?.trainDetails || [];
  const flightDetails = pkg?.flightDetails || [];
  const flightsWithAddons = flightDetails
    .map((flight, flightIndex) => ({ flight, flightIndex }))
    .filter(({ flight }) => Array.isArray(flight.addons) && flight.addons.length > 0);

  // Train/flight-wise addon selection — SAME pattern CreateBooking.jsx
  // uses per traveller, promoted to booking-wide here (one selection
  // applied to the whole booking instead of per traveller).
  const handleAddonChange = (trainIndex, addonId) => {
    const train = trainDetails[trainIndex];
    if (!train) return;

    let updated = selectedAddons.filter((a) => a.trainIndex !== trainIndex);
    if (!addonId) {
      setSelectedAddons(updated);
      return;
    }
    const addon = train.addons?.find((a) => String(a._id || a.id) === String(addonId));
    if (!addon) {
      setSelectedAddons(updated);
      return;
    }
    updated.push({
      trainIndex,
      trainNo: train.trainNo,
      trainName: train.trainName,
      tripType: train.tripType,
      addonId: addon._id || addon.id,
      name: addon.name,
      amount: Number(addon.amount) || 0,
    });
    setSelectedAddons(updated);
  };

  const handleFlightAddonChange = (flightIndex, addonId) => {
    const flight = flightDetails[flightIndex];
    if (!flight) return;

    let updated = selectedAddons.filter((a) => a.flightIndex !== flightIndex);
    if (!addonId) {
      setSelectedAddons(updated);
      return;
    }
    const addon = flight.addons?.find((a) => String(a._id || a.id) === String(addonId));
    if (!addon) {
      setSelectedAddons(updated);
      return;
    }
    updated.push({
      flightIndex,
      flightNo: flight.flightNo,
      airline: flight.airline,
      tripType: flight.tripType,
      addonId: addon._id || addon.id,
      name: addon.name,
      amount: Number(addon.amount) || 0,
    });
    setSelectedAddons(updated);
  };

  const getSelectedAddonForTrain = (trainIndex) =>
    selectedAddons.find((a) => a.trainIndex === trainIndex)?.addonId || "";

  const getSelectedAddonForFlight = (flightIndex) =>
    selectedAddons.find((a) => a.flightIndex === flightIndex)?.addonId || "";

  return (
    <div className="mb-6 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-sky-50/60 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-sky-200/70 bg-white/60">
        <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-gray-800 leading-tight">Booking Details</p>
          <p className="text-xs text-gray-500">Applies to every traveller on this TNR</p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid md:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
              <Package className="w-3.5 h-3.5 text-sky-600" /> Package Type
            </label>
            <select
              value={packageSelection.type === "main" ? "main" : packageSelection.variantIndex}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "main") setPackageSelection({ type: "main", variantIndex: null });
                else setPackageSelection({ type: "variant", variantIndex: Number(v) });
              }}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none text-sm transition-all"
            >
              <option value="main">Main Package</option>
              {tourInfo?.variantPackage?.map((p, i) => (
                <option key={i} value={i}>
                  Variant {i + 1} ({p.destination?.join(", ")})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-600" /> Boarding Point
            </label>
            <select
              value={getPointId(boardingPoint)}
              onChange={(e) => {
                const bp = boardingOptions.find((x) => getPointId(x) === e.target.value);
                setBoardingPoint(bp || null);
              }}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none text-sm transition-all"
            >
              <option value="">Select Boarding Point</option>
              {boardingOptions.map((bp, i) => (
                <option key={getPointId(bp) || i} value={getPointId(bp)}>
                  {bp.stationCode} - {bp.stationName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-600" /> Deboarding Point
            </label>
            <select
              value={getPointId(deboardingPoint)}
              onChange={(e) => {
                const dp = deboardingOptions.find((x) => getPointId(x) === e.target.value);
                setDeboardingPoint(dp || null);
              }}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none text-sm transition-all"
            >
              <option value="">Select Deboarding Point</option>
              {deboardingOptions.map((dp, i) => (
                <option key={getPointId(dp) || i} value={getPointId(dp)}>
                  {dp.stationCode} - {dp.stationName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(trainDetails.length > 0 || flightsWithAddons.length > 0) && (
          <div className="pt-5 border-t border-sky-200/70 space-y-5">
            {trainDetails.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-sm font-bold text-indigo-700 mb-2.5">
                  <Train className="w-4 h-4" /> Train Add-ons
                </p>
                <div className="space-y-2">
                  {trainDetails.map((train, tIdx) => (
                    <div
                      key={train._id || tIdx}
                      className="border border-gray-200 rounded-xl p-3.5 bg-white hover:border-indigo-200 transition-colors"
                    >
                      <p className="text-sm font-semibold text-gray-800">
                        {train.trainName} <span className="text-gray-500 font-normal">({train.trainNo})</span>
                      </p>
                      <select
                        value={getSelectedAddonForTrain(tIdx)}
                        onChange={(e) => handleAddonChange(tIdx, e.target.value)}
                        className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      >
                        <option value="">No Add-on</option>
                        {(train.addons || []).map((a) => (
                          <option key={a._id || a.id} value={a._id || a.id}>
                            {a.name} (+{a.amount || 0})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {flightsWithAddons.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-sm font-bold text-purple-700 mb-2.5">
                  <Plane className="w-4 h-4" /> Flight Add-ons
                </p>
                <div className="space-y-2">
                  {flightsWithAddons.map(({ flight, flightIndex }) => (
                    <div
                      key={flight._id || flightIndex}
                      className="border border-gray-200 rounded-xl p-3.5 bg-white hover:border-purple-200 transition-colors"
                    >
                      <p className="text-sm font-semibold text-gray-800">
                        {flight.airline} <span className="text-gray-500 font-normal">({flight.flightNo})</span>
                      </p>
                      <select
                        value={getSelectedAddonForFlight(flightIndex)}
                        onChange={(e) => handleFlightAddonChange(flightIndex, e.target.value)}
                        className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                      >
                        <option value="">No Add-on</option>
                        {(flight.addons || []).map((a) => (
                          <option key={a._id || a.id} value={a._id || a.id}>
                            {a.name} (+{a.amount || 0})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 pt-5 border-t border-sky-200/70">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
            <NotebookPen className="w-3.5 h-3.5 text-sky-600" /> Remarks (optional)
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={2}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none text-sm transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
};

// ───────────────────────── Per-person traveller card (identity + sharing + Aadhaar) ─────────────────────────
// Also module-scope for the same reason as BookingWideSection above.
const TravellerCard = ({
  traveller,
  index,
  isMain,
  removeCoTraveller,
  setTravellerFrontFile,
  setTravellerBackFile,
  extractTravellerAadhaar,
  handleTravellerChange,
}) => (
  <div
    className={`mb-6 rounded-2xl border shadow-sm overflow-hidden ${
      isMain ? "border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-indigo-50/50" : "border-purple-200 bg-gradient-to-br from-purple-50 via-white to-purple-50/50"
    }`}
  >
    <div
      className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b bg-white/60 ${
        isMain ? "border-indigo-200/70" : "border-purple-200/70"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-sm ${
            isMain ? "bg-indigo-600" : "bg-purple-600"
          }`}
        >
          {isMain ? <IdCard className="w-5 h-5" /> : <Users className="w-5 h-5" />}
        </div>
        <div>
          <p className="font-bold text-gray-800 leading-tight">
            {isMain ? "Main Traveller" : `Co-Traveller ${index}`}
          </p>
          {!isMain && (
            <p className="text-xs text-gray-500">
              {traveller.source === "aadhaar" ? "Via Aadhaar OCR" : "Manual entry"}
            </p>
          )}
        </div>
      </div>
      {!isMain && (
        <button
          onClick={() => removeCoTraveller(index)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
          title="Remove co-traveller"
        >
          <Trash2 className="w-4.5 h-4.5" />
        </button>
      )}
    </div>

    <div className="p-5 sm:p-6">
      {/* Aadhaar upload — skippable for manual co-travellers */}
      {traveller.source === "aadhaar" && (
        <div className="p-4 bg-white rounded-xl border border-dashed border-gray-300 mb-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Aadhaar Front {isMain ? "(required)" : ""}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setTravellerFrontFile(index, e.target.files?.[0] || null)}
                className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
              />
            </div>
            {isMain && (
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Aadhaar Back (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTravellerBackFile(index, e.target.files?.[0] || null)}
                  className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
                />
              </div>
            )}
            <button
              onClick={() => extractTravellerAadhaar(index)}
              disabled={traveller.ocrLoading || !traveller._frontFile}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-xl font-bold text-sm shadow-sm transition-colors"
            >
              {traveller.ocrLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Reading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Extract Aadhaar
                </>
              )}
            </button>
            {!isMain && (
              <button
                onClick={() => handleTravellerChange(index, "source", "manual")}
                className="px-4 py-2.5 text-sm font-semibold text-purple-700 border border-purple-300 rounded-xl hover:bg-purple-50 transition-colors"
              >
                Switch to Manual
              </button>
            )}
          </div>
          {traveller.front && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                Aadhaar front {traveller.back ? "+ back " : ""}read
              </span>
              <a
                href={traveller.front?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
              >
                View Front
              </a>
              {traveller.back && (
                <a
                  href={traveller.back?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
                >
                  View Back
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Basic identity fields */}
      <div className="grid md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title</label>
          <select
            value={traveller.title}
            onChange={(e) => handleTravellerChange(index, "title", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
          >
            <option>Mr</option>
            <option>Mrs</option>
            <option>Ms</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">First Name</label>
          <input
            type="text"
            value={traveller.firstName}
            onChange={(e) => handleTravellerChange(index, "firstName", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Last Name</label>
          <input
            type="text"
            value={traveller.lastName}
            onChange={(e) => handleTravellerChange(index, "lastName", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Age</label>
          <input
            type="number"
            value={traveller.age}
            onChange={(e) => handleTravellerChange(index, "age", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Gender</label>
          <select
            value={traveller.gender}
            onChange={(e) => handleTravellerChange(index, "gender", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sharing Type</label>
          <select
            value={traveller.sharingType}
            onChange={(e) => handleTravellerChange(index, "sharingType", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
          >
            <option value="">Select Sharing</option>
            {Number(traveller.age) >= 11 ? (
              <>
                <option value="double">Double Sharing</option>
                <option value="triple">Triple Sharing</option>
              </>
            ) : Number(traveller.age) >= 6 && Number(traveller.age) <= 10 ? (
              <>
                <option value="withBerth">Child with Berth</option>
                <option value="withoutBerth">Child without Berth</option>
              </>
            ) : null}
          </select>
        </div>
      </div>

      {/* Mobile Number / Address — MAIN TRAVELLER ONLY. Only the main
          traveller's phone/address are used anywhere (as the booking's
          contact number / billing address) — co-travellers don't need
          these fields at all. */}
      {isMain && (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
              <Phone className="w-3.5 h-3.5 text-indigo-500" /> Mobile Number
            </label>
            <input
              type="tel"
              value={traveller.phone}
              onChange={(e) => handleTravellerChange(index, "phone", e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
              <Home className="w-3.5 h-3.5 text-indigo-500" /> Address
            </label>
            <textarea
              value={traveller.address}
              onChange={(e) => handleTravellerChange(index, "address", e.target.value)}
              rows={1}
              placeholder="e.g. No 14, Gandhi Street, Thanjavur - 613001"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all resize-none"
            />
          </div>
        </div>
      )}
    </div>
  </div>
);

// ───────────────────────── All Bookings tab ─────────────────────────
// Everything saved from Tab 1 (one card per groupId): view Aadhaar +
// advance screenshot, upload Balance/Partial Balance (repeatable), add
// more co-travellers (Aadhaar front only — saved to the server right
// away, unlike Tab 1 where it waits for Save), and either "Create
// Booking" (navigates to the existing, untouched CreateBooking.jsx) or,
// once a tnr has been linked, "Raise Manage Booking" per co-traveller.
const PAYMENT_TYPES = [
  { type: "advance", label: "Advance" },
  { type: "balance", label: "Balance" },
  { type: "partial", label: "Partial Balance" },
];

const PaymentSlot = ({ groupId, type, label, items, uploadGroupPayment, refresh }) => {
  const [file, setFile] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return toast.error(`Select a ${label} screenshot first`);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("screenshot", file);
      formData.append("groupId", groupId);
      formData.append("type", type);
      if (amount) formData.append("amount", amount);
      const result = await uploadGroupPayment(formData);
      if (!result?.success) return;
      toast.success(`${label} screenshot uploaded`);
      setFile(null);
      setAmount("");
      refresh();
    } catch (err) {
      console.error("uploadGroupPayment error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60">
      <h5 className="flex items-center gap-1.5 font-bold text-gray-700 text-sm mb-2.5">
        <FileImage className="w-4 h-4" /> {label}
      </h5>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {items.map((item, i) => (
            <a
              key={item._id || i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1.5 hover:bg-green-100"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {items.length > 1 ? `#${i + 1}` : "View"}
              {item.amount ? ` — ₹${item.amount}` : ""}
            </a>
          ))}
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="w-full text-xs mb-2 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-gray-700"
      />
      <input
        type="number"
        placeholder="Amount (optional)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm mb-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
      />
      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg text-xs font-semibold transition-colors"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        Upload
      </button>
    </div>
  );
};

const BookingCard = ({
  booking,
  expanded,
  onToggle,
  extractAadhaar,
  addCoTravellerApi,
  uploadGroupPayment,
  linkGroupTnr,
  onCreateBooking,
  navigate,
  refresh,
}) => {
  const [ctFile, setCtFile] = useState(null);
  const [ctLoading, setCtLoading] = useState(false);
  const [tnrInput, setTnrInput] = useState("");
  const [linkingTnr, setLinkingTnr] = useState(false);
  const [showTnrInput, setShowTnrInput] = useState(false);

  const mainName = [booking.main?.title, booking.main?.firstName, booking.main?.lastName]
    .filter(Boolean)
    .join(" ") || "Unnamed traveller";
  const travellerCount = 1 + (booking.coTravellers?.length || 0);

  const handleAddCoTraveller = async () => {
    if (!ctFile) return toast.error("Choose the co-traveller's Aadhaar front image first");
    if (travellerCount >= 10) return toast.error("10 travellers max per booking");
    setCtLoading(true);
    try {
      const formData = new FormData();
      formData.append("front", ctFile);
      const ocrResult = await extractAadhaar(formData);
      console.log("[AddCoTraveller] OCR result:", ocrResult);
      if (!ocrResult?.success) {
        // extractAadhaar() already toasts the real backend message on
        // failure — but if it ever comes back falsy/undefined for some
        // other reason, don't fail silently like a no-op.
        if (ocrResult === undefined) {
          toast.error("Aadhaar read failed — no response from server. Check your connection and try again.");
        }
        return;
      }
      if (!ocrResult.front?.url) {
        toast.error("Aadhaar was read but the image didn't upload — please try again.");
        console.error("[AddCoTraveller] OCR succeeded but front.url missing:", ocrResult);
        return;
      }

      const p = ocrResult.parsed || {};
      const addResult = await addCoTravellerApi({
        groupId: booking.groupId,
        title: "Mr",
        firstName: p.firstName || "",
        lastName: p.lastName || "",
        age: p.age || "",
        dob: p.dob || "",
        gender: p.gender || "Male",
        sharingType: "",
        phone: p.phone || "",
        address: p.address || "",
        front: ocrResult.front,
      });
      console.log("[AddCoTraveller] addCoTraveller result:", addResult);
      if (!addResult?.success) {
        toast.error(addResult?.message || "Could not save the co-traveller — please try again.");
        return;
      }

      toast.success("Co-traveller added");
      setCtFile(null);
      refresh();
    } catch (err) {
      console.error("addCoTraveller error:", err);
      toast.error("Something went wrong adding this co-traveller. Check the console for details.");
    } finally {
      setCtLoading(false);
    }
  };

  const handleLinkTnr = async () => {
    if (!tnrInput.trim()) return toast.error("Enter the TNR");
    setLinkingTnr(true);
    try {
      const result = await linkGroupTnr({ groupId: booking.groupId, tnr: tnrInput.trim() });
      if (!result?.success) return;
      toast.success("TNR linked to this booking");
      setTnrInput("");
      setShowTnrInput(false);
      refresh();
    } catch (err) {
      console.error("linkGroupTnr error:", err);
    } finally {
      setLinkingTnr(false);
    }
  };

  const handleRaiseManageBooking = (traveller) => {
    navigate("/tour-managebooking", {
      state: {
        tnr: booking.tnr,
        prefillTraveller: {
          title: traveller.title,
          firstName: traveller.firstName,
          lastName: traveller.lastName,
          age: traveller.age,
          gender: traveller.gender,
          aadhaarId: traveller._id || null,
          isCoTraveller: true,
          addedBy: "admin",
          addedPostBooking: true,
        },
      },
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-gray-50/80 hover:bg-gray-100/80 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
            <IdCard className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-800 truncate">{mainName}</p>
            <p className="text-xs text-gray-500 truncate">
              {booking.tourTitle || "Tour"} · {travellerCount} traveller{travellerCount !== 1 ? "s" : ""}
              {booking.tnr && (
                <span className="ml-2 inline-flex items-center gap-1 text-indigo-700 font-semibold">
                  <Ticket className="w-3 h-3" /> {booking.tnr}
                </span>
              )}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />}
      </button>

      {expanded && (
        <div className="p-5 sm:p-6 border-t border-gray-100 space-y-6">
          {/* Booking notes — reference only */}
          {booking.bookingNotes && (
            <div className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-100">
              {booking.bookingNotes.packageType && <span className="mr-3"><b>Package:</b> {booking.bookingNotes.packageType}</span>}
              {booking.bookingNotes.boardingPoint && <span className="mr-3"><b>Boarding:</b> {booking.bookingNotes.boardingPoint}</span>}
              {booking.bookingNotes.deboardingPoint && <span className="mr-3"><b>Deboarding:</b> {booking.bookingNotes.deboardingPoint}</span>}
              {booking.bookingNotes.addons && <span className="mr-3"><b>Add-ons:</b> {booking.bookingNotes.addons}</span>}
              {booking.bookingNotes.remarks && <span><b>Remarks:</b> {booking.bookingNotes.remarks}</span>}
            </div>
          )}

          {/* Main traveller */}
          <div>
            <h4 className="flex items-center gap-2 font-bold text-gray-800 text-sm mb-2">
              <IdCard className="w-4 h-4 text-indigo-600" /> Main Traveller
            </h4>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 bg-indigo-50/60 border border-indigo-100 rounded-xl p-3">
              <span className="font-semibold text-gray-800">{mainName}</span>
              <span>Age {booking.main?.age || "—"}</span>
              <span>{booking.main?.gender}</span>
              <span>{booking.main?.phone}</span>
              {booking.main?.front?.url && (
                <a href={booking.main.front.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold underline">View Front</a>
              )}
              {booking.main?.back?.url && (
                <a href={booking.main.back.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold underline">View Back</a>
              )}
              {booking.main?.address && (
                <span className="w-full flex items-center gap-1.5 text-gray-600">
                  <Home className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> {booking.main.address}
                </span>
              )}
            </div>
          </div>

          {/* Co-travellers */}
          <div>
            <h4 className="flex items-center gap-2 font-bold text-gray-800 text-sm mb-2">
              <Users className="w-4 h-4 text-purple-600" /> Co-Travellers ({booking.coTravellers.length})
            </h4>
            {booking.coTravellers.length > 0 && (
              <div className="space-y-2 mb-3">
                {booking.coTravellers.map((ct, i) => {
                  const ctName = [ct.title, ct.firstName, ct.lastName].filter(Boolean).join(" ") || `Traveller ${i + 2}`;
                  return (
                    <div key={ct._id || i} className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600 bg-purple-50/60 border border-purple-100 rounded-xl p-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-semibold text-gray-800">{ctName}</span>
                        <span>Age {ct.age || "—"}</span>
                        {ct.url && (
                          <a href={ct.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold underline">View Front</a>
                        )}
                      </div>
                      {booking.tnr && (
                        <button
                          onClick={() => handleRaiseManageBooking(ct)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          Raise Manage Booking <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add co-traveller — front side only, saved straight away */}
            <div className="flex flex-wrap items-end gap-3 p-3 rounded-xl border border-dashed border-purple-300 bg-purple-50/30">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Aadhaar Front</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCtFile(e.target.files?.[0] || null)}
                  className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                />
              </div>
              <button
                onClick={handleAddCoTraveller}
                disabled={ctLoading || !ctFile || travellerCount >= 10}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-xl font-bold text-sm transition-colors"
              >
                {ctLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                Add Co-Traveller
              </button>
            </div>
          </div>

          {/* Payments */}
          <div>
            <h4 className="flex items-center gap-2 font-bold text-gray-800 text-sm mb-2">
              <IndianRupee className="w-4 h-4 text-green-600" /> Payment Screenshots
            </h4>
            <div className="grid md:grid-cols-3 gap-3">
              {PAYMENT_TYPES.map(({ type, label }) => {
                const items =
                  type === "advance"
                    ? booking.payments.advance ? [booking.payments.advance] : []
                    : booking.payments[type] || [];
                return (
                  <PaymentSlot
                    key={type}
                    groupId={booking.groupId}
                    type={type}
                    label={label}
                    items={items}
                    uploadGroupPayment={uploadGroupPayment}
                    refresh={refresh}
                  />
                );
              })}
            </div>
          </div>

          {/* Create Booking / link TNR */}
          {!booking.tnr && (
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={onCreateBooking}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-800 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all"
              >
                Create Booking <ArrowRight className="w-4 h-4" />
              </button>

              {!showTnrInput ? (
                <button
                  onClick={() => setShowTnrInput(true)}
                  className="w-full text-center text-xs font-semibold text-gray-400 hover:text-indigo-600 mt-2"
                >
                  Already created it? Link the TNR here
                </button>
              ) : (
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={tnrInput}
                    onChange={(e) => setTnrInput(e.target.value)}
                    placeholder="e.g. EP69TQ"
                    className="flex-1 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm uppercase focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  />
                  <button
                    onClick={handleLinkTnr}
                    disabled={linkingTnr}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-xl font-bold text-sm transition-colors"
                  >
                    {linkingTnr ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                    Link
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AllBookingsTab = ({ getAadhaarBookings, extractAadhaar, addCoTravellerApi, uploadGroupPayment, linkGroupTnr, navigate, tourId, tourTitle }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const result = await getAadhaarBookings();
      if (result?.success) setBookings(result.bookings || []);
    } catch (err) {
      console.error("getAadhaarBookings error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Tour-wise — this tab always shows only the currently selected tour's
  // bookings (same tour picked at the top of the page, shared with the
  // Save Booking tab). Re-fetches whenever the admin switches tours.
  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId]);

  const toggleExpand = (groupId) => setExpanded((prev) => ({ ...prev, [groupId]: !prev[groupId] }));

  const handleCreateBooking = (booking) => {
    const mainT = booking.main;
    const finalTravellers = [
      {
        title: mainT?.title,
        firstName: mainT?.firstName,
        lastName: mainT?.lastName,
        age: mainT?.age,
        gender: mainT?.gender,
        sharingType: mainT?.sharingType,
        isCoTraveller: false,
        phone: mainT?.phone,
        address: mainT?.address,
        _aadhaar: { front: mainT?.front || null, back: mainT?.back || null },
      },
      ...(booking.coTravellers || []).map((ct) => ({
        title: ct.title,
        firstName: ct.firstName,
        lastName: ct.lastName,
        age: ct.age,
        gender: ct.gender,
        sharingType: ct.sharingType,
        isCoTraveller: true,
        phone: ct.phone,
        address: ct.address,
        _aadhaar: { front: { url: ct.url }, back: null },
      })),
    ];

    navigate("/creat-bookings", {
      state: {
        tourId: booking.tourId,
        travellers: finalTravellers,
        paymentScreenshots: booking.payments?.advance
          ? { advance: { url: booking.payments.advance.url, amount: booking.payments.advance.amount } }
          : {},
        contactMobile: mainT?.phone || "",
        contactAddress: mainT?.address || "",
        groupId: booking.groupId,
      },
    });
  };

  // This tab is only ever rendered once a tour is selected (the parent
  // page gates it on tourId), so filtering is just belt-and-braces here.
  const visibleBookings = tourId
    ? bookings.filter((b) => String(b.tourId || "") === String(tourId))
    : bookings;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          {visibleBookings.length} booking{visibleBookings.length !== 1 ? "s" : ""}
          {tourTitle ? ` for ${tourTitle}` : ""}
        </p>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : visibleBookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No bookings saved for this tour yet.</div>
      ) : (
        <div className="space-y-4">
          {visibleBookings.map((booking) => (
            <BookingCard
              key={booking.groupId}
              booking={booking}
              expanded={!!expanded[booking.groupId]}
              onToggle={() => toggleExpand(booking.groupId)}
              extractAadhaar={extractAadhaar}
              addCoTravellerApi={addCoTravellerApi}
              uploadGroupPayment={uploadGroupPayment}
              linkGroupTnr={linkGroupTnr}
              onCreateBooking={() => handleCreateBooking(booking)}
              navigate={navigate}
              refresh={fetchBookings}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AadhaarUpload = () => {
  const navigate = useNavigate();
  const {
    tourList,
    getTourList,
    extractAadhaar,
    uploadPaymentScreenshot,
    saveAadhaarUpload,
    getAadhaarBookings,
    addCoTraveller: addCoTravellerApi,
    uploadGroupPayment,
    linkGroupTnr,
  } = useContext(TourContext);

  const [saving, setSaving] = useState(false);

  // Two tabs on this one page: "save" = capture a new walk-in booking,
  // "all" = everything saved so far (balance/partial upload, add more
  // co-travellers, Create Booking → tnr → Raise Manage Booking).
  const [activeTab, setActiveTab] = useState("save");

  const [tourId, setTourId] = useState("");
  const [tourInfo, setTourInfo] = useState(null);

  // ───────────── Booking-wide fields (apply to every traveller) ─────────────
  // Fetched from the selected tour's own data (tourInfo), not typed.
  const [packageSelection, setPackageSelection] = useState({ type: "main", variantIndex: null });
  const [boardingPoint, setBoardingPoint] = useState(null);
  const [deboardingPoint, setDeboardingPoint] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]); // train/flight-wise, same shape as CreateBooking.jsx
  const [remarks, setRemarks] = useState("");

  // Single main traveller only — co-traveller add, Partial/Balance
  // screenshot upload, and finalizing the booking with a TNR all happen
  // later, from the All Bookings page, not here.
  const [travellers, setTravellers] = useState([blankTraveller(true)]);

  const [paymentScreenshots, setPaymentScreenshots] = useState({});
  const [paymentLoading, setPaymentLoading] = useState({});
  const [paymentFiles, setPaymentFiles] = useState({});
  const [paymentAmounts, setPaymentAmounts] = useState({});

  useEffect(() => {
    if (!tourList || tourList.length === 0) getTourList();
  }, [tourList, getTourList]);

  useEffect(() => {
    if (!tourId || !tourList?.length) {
      setTourInfo(null);
      return;
    }
    setTourInfo(tourList.find((t) => t._id === tourId) || null);
  }, [tourId, tourList]);

  // Reset booking-wide fields whenever the tour changes.
  useEffect(() => {
    setPackageSelection({ type: "main", variantIndex: null });
    setBoardingPoint(null);
    setDeboardingPoint(null);
    setSelectedAddons([]);
    setRemarks("");
  }, [tourId]);

  // Reset boarding/deboarding/addons whenever the package selection changes
  // (different package = different boarding/deboarding/train/flight list).
  useEffect(() => {
    setBoardingPoint(null);
    setDeboardingPoint(null);
    setSelectedAddons([]);
  }, [packageSelection.type, packageSelection.variantIndex]);

  // ───────────────────────── Traveller (person-level) fields ─────────────────────────
  const handleTravellerChange = (index, field, value) => {
    const updated = [...travellers];
    const t = { ...updated[index] };

    if (field === "title") {
      if (value === "Mr") t.gender = "Male";
      else if (value === "Mrs" || value === "Ms") t.gender = "Female";
    }
    if (field === "gender") {
      if (value === "Male") t.title = "Mr";
      else if (value === "Female") t.title = "Ms";
    }
    if (field === "age") {
      const age = Number(value);
      if (age > 85) {
        toast.error("Age cannot exceed 85 years.");
        return;
      }
      if (age >= 11) t.sharingType = "double";
      else if (age >= 6 && age <= 10) t.sharingType = "withBerth";
      else t.sharingType = "";
    }

    t[field] = value;
    updated[index] = t;
    setTravellers(updated);
  };

  // ───────────────────────── Co-travellers (Tab 1) ─────────────────────────
  // 10 per booking total — the main traveller plus up to 9 more. Each
  // co-traveller is Aadhaar FRONT side only (TravellerCard already skips
  // the back-side input whenever isMain is false). These stay local state
  // here and are only persisted when "Save Booking" is pressed, same as
  // the main traveller — unlike Tab 2, where Add Co-Traveller saves
  // straight to the server because that booking already exists.
  const addCoTraveller = () => {
    if (travellers.length >= 10) {
      return toast.error("10 travellers max per booking (1 main + 9 co-travellers)");
    }
    setTravellers((prev) => [...prev, blankTraveller(false)]);
  };

  const removeCoTraveller = (index) => {
    setTravellers((prev) => prev.filter((_, i) => i !== index));
  };

  const setTravellerFrontFile = (index, file) => {
    const updated = [...travellers];
    updated[index] = { ...updated[index], _frontFile: file };
    setTravellers(updated);
  };

  const setTravellerBackFile = (index, file) => {
    const updated = [...travellers];
    updated[index] = { ...updated[index], _backFile: file };
    setTravellers(updated);
  };

  const extractTravellerAadhaar = async (index) => {
    const t = travellers[index];
    if (!t._frontFile) return toast.error("Aadhaar front image is required");

    handleTravellerChange(index, "ocrLoading", true);
    try {
      const formData = new FormData();
      formData.append("front", t._frontFile);
      if (t._backFile) formData.append("back", t._backFile);

      const result = await extractAadhaar(formData);
      if (!result.success) {
        handleTravellerChange(index, "ocrLoading", false);
        return;
      }

      const p = result.parsed || {};
      const updated = [...travellers];
      updated[index] = {
        ...updated[index],
        title: "Mr",
        firstName: p.firstName || "",
        lastName: p.lastName || "",
        age: p.age || "",
        gender: p.gender || "Male",
        // Keep whatever the admin already typed if OCR couldn't read a
        // phone/address this time (some Aadhaar cards don't print a
        // mobile number at all, and address OCR isn't always clean).
        phone: p.phone || updated[index].phone || "",
        address: p.address || updated[index].address || "",
        front: result.front || null,
        back: result.back || null,
        ocrLoading: false,
        _frontFile: null,
        _backFile: null,
      };
      setTravellers(updated);
      // Phone/address only matter for the MAIN traveller (index 0) — that
      // toast would be noise for a co-traveller, who has no phone/address
      // fields on this card at all.
      if (index === 0 && (!p.phone || !p.address)) {
        toast.info(
          `Traveller ${index + 1}'s Aadhaar read. ${!p.phone ? "Mobile number" : "Address"}${!p.phone && !p.address ? " & address" : ""} couldn't be read — please fill it in.`,
        );
      } else {
        toast.success(`Traveller ${index + 1}'s Aadhaar read. Verify details below.`);
      }
    } catch (err) {
      console.error("extractTravellerAadhaar error:", err);
      handleTravellerChange(index, "ocrLoading", false);
    }
  };

  // ───────────────────────── Payment screenshots ─────────────────────────
  // Only Advance is collected here. Balance/Partial Balance come later
  // (often ~30 days after), once the booking has a TNR — that happens
  // from the All Bookings page, not here.
  const paymentSlots = [
    { type: "advance", label: "Advance Payment", cardClass: "bg-indigo-50 border-indigo-200" },
  ];

  const handlePaymentUpload = async (type) => {
    const file = paymentFiles[type];
    if (!file) return toast.error(`Select a ${type} screenshot first`);

    setPaymentLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const formData = new FormData();
      formData.append("screenshot", file);
      formData.append("type", type);
      if (paymentAmounts[type]) formData.append("amount", paymentAmounts[type]);

      const result = await uploadPaymentScreenshot(formData);
      if (!result.success) return;

      setPaymentScreenshots((prev) => ({
        ...prev,
        [type]: { url: result.url, amount: result.amount },
      }));
      toast.success(`${type} screenshot uploaded`);
      setPaymentFiles((prev) => ({ ...prev, [type]: null }));
    } catch (err) {
      console.error("handlePaymentUpload error:", err);
    } finally {
      setPaymentLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  // ───────────────────────── Save booking ─────────────────────────
  // Persists this capture (tour, booking-wide details, main traveller,
  // advance screenshot) straight into aadhaarModel — Aadhaar front/back,
  // paymentAdvance and bookingNotes docs, all tied by one groupId. No
  // navigation to CreateBooking.jsx: this page's job ends at Save.
  // Co-traveller add, Partial/Balance screenshot upload and finalizing
  // the booking (with a real TNR, via CreateBooking.jsx) happen afterwards
  // from the All Bookings page.
  const handleSaveBooking = async () => {
    if (!tourId) return toast.error("Select a tour first");
    const mainTraveller = travellers[0];
    if (!mainTraveller.firstName.trim()) {
      return toast.error("Main traveller's name is required");
    }
    if (!mainTraveller.front?.url) {
      return toast.error("Scan the main traveller's Aadhaar first");
    }

    const coTravellerRows = travellers.slice(1);
    const incompleteCoTraveller = coTravellerRows.find(
      (t) => !t.front?.url || !t.firstName.trim(),
    );
    if (incompleteCoTraveller) {
      return toast.error(
        "Every co-traveller needs a name and a scanned Aadhaar front — finish or remove the incomplete one.",
      );
    }

    const packageTypeStr =
      packageSelection.type === "main"
        ? "Main Package"
        : `Variant ${packageSelection.variantIndex + 1}`;
    const boardingPointStr = boardingPoint
      ? `${boardingPoint.stationCode} - ${boardingPoint.stationName}`
      : "";
    const deboardingPointStr = deboardingPoint
      ? `${deboardingPoint.stationCode} - ${deboardingPoint.stationName}`
      : "";
    const addonsStr = selectedAddons.map((a) => a.name).join(", ");

    setSaving(true);
    try {
      const result = await saveAadhaarUpload({
        tourId,
        packageType: packageTypeStr,
        boardingPoint: boardingPointStr,
        deboardingPoint: deboardingPointStr,
        addons: addonsStr,
        remarks: remarks.trim(),
        traveller: {
          title: mainTraveller.title,
          firstName: mainTraveller.firstName,
          lastName: mainTraveller.lastName,
          age: mainTraveller.age,
          dob: mainTraveller.dob,
          gender: mainTraveller.gender,
          sharingType: mainTraveller.sharingType,
          phone: mainTraveller.phone,
          address: mainTraveller.address,
          front: mainTraveller.front,
          back: mainTraveller.back,
        },
        coTravellers: coTravellerRows.map((t) => ({
          title: t.title,
          firstName: t.firstName,
          lastName: t.lastName,
          age: t.age,
          dob: t.dob,
          gender: t.gender,
          sharingType: t.sharingType,
          phone: t.phone,
          address: t.address,
          front: t.front, // front side only
        })),
        advanceScreenshot: paymentScreenshots.advance || null,
      });

      if (!result?.success) return;

      toast.success("Booking saved. Find it on the All Bookings page.");

      // Reset the form for the next walk-in booking.
      setTourId("");
      setTourInfo(null);
      setTravellers([blankTraveller(true)]);
      setPaymentScreenshots({});
      setPaymentFiles({});
      setPaymentAmounts({});
    } catch (err) {
      console.error("handleSaveBooking error:", err);
      toast.error("Could not save this booking. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 py-6 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-3xl border border-gray-100 p-6 sm:p-8">
        <ToastContainer position="top-right" autoClose={4000} />

        <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-200">
            <UserPlus className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 leading-tight">Aadhaar Upload</h1>
            <p className="text-sm text-gray-500 mt-0.5">Walk-in bookings, read straight off the Aadhaar card</p>
          </div>
        </div>

        {/* Tour comes FIRST — everything below (Save Booking AND All
              Bookings) is scoped to this one tour. Switching tours clears
              the Save Booking draft; All Bookings re-fetches for the new
              tour automatically. */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Tour *</label>
          <select
            value={tourId}
            onChange={(e) => setTourId(e.target.value)}
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-base transition-all"
          >
            <option value="">-- Select a tour --</option>
            {tourList?.map((t) => (
              <option key={t._id} value={t._id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Two-tab pill header */}
        <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl mb-8 w-full sm:w-fit">
          <button
            onClick={() => setActiveTab("save")}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex-1 sm:flex-none ${
              activeTab === "save" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <UserPlus className="w-4 h-4" /> Save Booking
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex-1 sm:flex-none ${
              activeTab === "all" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <BookOpenCheck className="w-4 h-4" /> All Bookings
          </button>
        </div>

        {!tourId && (
          <div className="text-center py-16 text-gray-400 text-sm">Select a tour above to continue.</div>
        )}

        {tourId && activeTab === "all" && (
          <AllBookingsTab
            getAadhaarBookings={getAadhaarBookings}
            extractAadhaar={extractAadhaar}
            addCoTravellerApi={addCoTravellerApi}
            uploadGroupPayment={uploadGroupPayment}
            linkGroupTnr={linkGroupTnr}
            navigate={navigate}
            tourId={tourId}
            tourTitle={tourInfo?.title}
          />
        )}

        {tourId && activeTab === "save" && (
          <>
        {tourInfo && (
          <>
            <BookingWideSection
              tourInfo={tourInfo}
              packageSelection={packageSelection}
              setPackageSelection={setPackageSelection}
              boardingPoint={boardingPoint}
              setBoardingPoint={setBoardingPoint}
              deboardingPoint={deboardingPoint}
              setDeboardingPoint={setDeboardingPoint}
              selectedAddons={selectedAddons}
              setSelectedAddons={setSelectedAddons}
              remarks={remarks}
              setRemarks={setRemarks}
            />

            <TravellerCard
              traveller={travellers[0]}
              index={0}
              isMain={true}
              setTravellerFrontFile={setTravellerFrontFile}
              setTravellerBackFile={setTravellerBackFile}
              extractTravellerAadhaar={extractTravellerAadhaar}
              handleTravellerChange={handleTravellerChange}
            />

            {/* Co-travellers — up to 9 more, Aadhaar front side only.
                  Added here and saved together with the main traveller
                  when "Save Booking" is pressed. */}
            {travellers.slice(1).map((t, i) => (
              <TravellerCard
                key={i + 1}
                traveller={t}
                index={i + 1}
                isMain={false}
                removeCoTraveller={removeCoTraveller}
                setTravellerFrontFile={setTravellerFrontFile}
                setTravellerBackFile={setTravellerBackFile}
                extractTravellerAadhaar={extractTravellerAadhaar}
                handleTravellerChange={handleTravellerChange}
              />
            ))}

            <button
              onClick={addCoTraveller}
              disabled={travellers.length >= 10}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 mb-8 border-2 border-dashed border-indigo-300 text-indigo-700 rounded-2xl font-semibold text-sm hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <PlusCircle className="w-4.5 h-4.5" />
              Add Co-Traveller ({travellers.length}/10)
            </button>

            {/* Payment screenshot — Advance only. Balance / Partial
                  Balance come later from the All Bookings page once a
                  TNR exists. */}
              <div className="mb-8">
                <h3 className="flex items-center gap-2 font-bold text-gray-800 text-lg mb-4">
                  <IndianRupee className="w-6 h-6 text-indigo-600" /> Advance Payment Screenshot
                  <span className="text-xs font-normal text-gray-400">(optional)</span>
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {paymentSlots.map(({ type, label, cardClass }) => {
                    const done = paymentScreenshots[type];
                    return (
                      <div
                        key={type}
                        className={`p-5 rounded-2xl border shadow-sm ${done ? "bg-green-50 border-green-300" : `${cardClass} border`}`}
                      >
                        <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-3">
                          <FileImage className="w-5 h-5" /> {label}
                        </h4>
                        {done ? (
                          <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                            <CheckCircle2 className="w-4 h-4" /> Uploaded
                            {done.amount ? ` — ₹${done.amount}` : ""}
                          </div>
                        ) : (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                setPaymentFiles((prev) => ({ ...prev, [type]: e.target.files?.[0] || null }))
                              }
                              className="w-full text-xs mb-2.5 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-gray-700"
                            />
                            <input
                              type="number"
                              placeholder="Amount (optional)"
                              value={paymentAmounts[type] || ""}
                              onChange={(e) =>
                                setPaymentAmounts((prev) => ({ ...prev, [type]: e.target.value }))
                              }
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm mb-3 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                            />
                            <button
                              onClick={() => handlePaymentUpload(type)}
                              disabled={paymentLoading[type] || !paymentFiles[type]}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-semibold transition-colors"
                            >
                              {paymentLoading[type] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                              Upload
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleSaveBooking}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-800 hover:to-indigo-700 disabled:opacity-60 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    Save Booking <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
          </>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default AadhaarUpload;
