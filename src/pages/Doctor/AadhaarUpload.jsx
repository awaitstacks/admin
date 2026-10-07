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
  Users,
  PlusCircle,
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

// Full traveller shape — Aadhaar OCR fields (front/back/ocrLoading) PLUS
// every booking-specific field (package, sharing, boarding/deboarding,
// addons, remarks), same shape CreateBooking.jsx expects. Filling these
// here means Create Booking is a review step, not a re-fill step.
const blankTraveller = (isMain) => ({
  title: "Mr",
  firstName: "",
  lastName: "",
  age: "",
  gender: "Male",
  packageType: "main",
  variantPackageIndex: null,
  sharingType: "",
  selectedAddon: null,
  selectedAddons: [],
  boardingPoint: null,
  deboardingPoint: null,
  remarks: "",
  isCoTraveller: !isMain,
  // Aadhaar OCR
  front: null,
  back: null,
  ocrLoading: false,
  _frontFile: null,
  _backFile: null,
  source: isMain ? "aadhaar" : "aadhaar", // "aadhaar" | "manual" — co-travellers can switch to manual
});

const AadhaarUpload = () => {
  const navigate = useNavigate();
  const {
    tourList,
    getTourList,
    currencySymbol,
    extractAadhaar,
    uploadPaymentScreenshot,
  } = useContext(TourContext);

  const [mode, setMode] = useState("new"); // "new" | "existing"
  const [tnr, setTnr] = useState("");
  const [tourId, setTourId] = useState("");
  const [tourInfo, setTourInfo] = useState(null);

  // travellers[0] = main traveller (Aadhaar front required), rest = co-travellers
  const [travellers, setTravellers] = useState([blankTraveller(true)]);

  const [paymentScreenshots, setPaymentScreenshots] = useState({});
  const [paymentLoading, setPaymentLoading] = useState({});
  const [paymentFiles, setPaymentFiles] = useState({});
  const [paymentAmounts, setPaymentAmounts] = useState({});

  // Existing-booking (add co-traveller) mode state — unchanged, simple.
  const [existingTraveller, setExistingTraveller] = useState(blankTraveller(false));
  const [existingFrontFile, setExistingFrontFile] = useState(null);
  const [existingOcrLoading, setExistingOcrLoading] = useState(false);

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

  // ───────────────────────── Traveller field + addon logic ─────────────────────────
  // Mirrors CreateBooking.jsx exactly, operating on the unified travellers[] array.
  const handleTravellerChange = (index, field, value) => {
    const updated = [...travellers];
    const t = updated[index];

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

    if (field === "packageType" || field === "variantPackageIndex") {
      t.boardingPoint = null;
      t.deboardingPoint = null;
      t.selectedAddon = null;
      t.selectedAddons = [];
    }

    setTravellers(updated);
  };

  const addCoTraveller = (source) => {
    setTravellers((prev) => [
      ...prev,
      { ...blankTraveller(false), source },
    ]);
  };

  const removeCoTraveller = (index) => {
    if (index === 0) return; // main traveller can't be removed
    setTravellers((prev) => prev.filter((_, i) => i !== index));
  };

  const setTravellerFrontFile = (index, file) => {
    const updated = [...travellers];
    updated[index]._frontFile = file;
    setTravellers(updated);
  };

  const setTravellerBackFile = (index, file) => {
    const updated = [...travellers];
    updated[index]._backFile = file;
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
        front: result.front || null,
        back: result.back || null,
        ocrLoading: false,
        _frontFile: null,
        _backFile: null,
      };
      setTravellers(updated);
      toast.success(`Traveller ${index + 1}'s Aadhaar read. Verify details below.`);
    } catch (err) {
      console.error("extractTravellerAadhaar error:", err);
      handleTravellerChange(index, "ocrLoading", false);
    }
  };

  const handleAddonChange = (travellerIndex, trainIndex, addonId) => {
    const updated = [...travellers];
    const traveller = updated[travellerIndex];
    const pkg =
      traveller.packageType === "main"
        ? tourInfo
        : tourInfo.variantPackage?.[traveller.variantPackageIndex];
    const train = pkg?.trainDetails?.[trainIndex];
    if (!train) return;

    let selectedAddons = Array.isArray(traveller.selectedAddons)
      ? [...traveller.selectedAddons]
      : [];
    selectedAddons = selectedAddons.filter((a) => a.trainIndex !== trainIndex);

    if (!addonId) {
      updated[travellerIndex].selectedAddons = selectedAddons;
      setTravellers(updated);
      return;
    }

    const selectedAddon = train.addons?.find(
      (a) => String(a._id || a.id) === String(addonId),
    );
    if (!selectedAddon) {
      updated[travellerIndex].selectedAddons = selectedAddons;
      setTravellers(updated);
      return;
    }

    selectedAddons.push({
      trainIndex,
      trainNo: train.trainNo,
      trainName: train.trainName,
      tripType: train.tripType,
      addonId: selectedAddon._id || selectedAddon.id,
      name: selectedAddon.name,
      amount: Number(selectedAddon.amount) || 0,
      addedAt: new Date(),
    });

    updated[travellerIndex].selectedAddons = selectedAddons;
    setTravellers(updated);
  };

  const handleFlightAddonChange = (travellerIndex, flightIndex, addonId) => {
    const updated = [...travellers];
    const traveller = updated[travellerIndex];
    const pkg =
      traveller.packageType === "main"
        ? tourInfo
        : tourInfo.variantPackage?.[traveller.variantPackageIndex];
    const flight = pkg?.flightDetails?.[flightIndex];
    if (!flight) return;

    let selectedAddons = Array.isArray(traveller.selectedAddons)
      ? [...traveller.selectedAddons]
      : [];
    selectedAddons = selectedAddons.filter((a) => a.flightIndex !== flightIndex);

    if (!addonId) {
      updated[travellerIndex].selectedAddons = selectedAddons;
      setTravellers(updated);
      return;
    }

    const selectedAddon = flight.addons?.find(
      (a) => String(a._id || a.id) === String(addonId),
    );
    if (!selectedAddon) {
      updated[travellerIndex].selectedAddons = selectedAddons;
      setTravellers(updated);
      return;
    }

    selectedAddons.push({
      flightIndex,
      flightNo: flight.flightNo,
      airline: flight.airline,
      tripType: flight.tripType,
      addonId: selectedAddon._id || selectedAddon.id,
      name: selectedAddon.name,
      amount: Number(selectedAddon.amount) || 0,
      addedAt: new Date(),
    });

    updated[travellerIndex].selectedAddons = selectedAddons;
    setTravellers(updated);
  };

  const handleFlatAddonSelect = (travellerIndex, addonId, flatAddonsList) => {
    const updated = [...travellers];
    if (!addonId) {
      updated[travellerIndex].selectedAddon = null;
      setTravellers(updated);
      return;
    }
    const selected = flatAddonsList.find(
      (a) => String(a._id || a.id) === String(addonId),
    );
    updated[travellerIndex].selectedAddon = selected
      ? { name: selected.name, price: Number(selected.amount) || 0 }
      : null;
    setTravellers(updated);
  };

  const getSelectedFlatAddonId = (traveller, flatAddonsList) => {
    const flat = traveller?.selectedAddon;
    if (!flat?.name) return "";
    const match = (flatAddonsList || []).find((a) => a.name === flat.name);
    return match ? String(match._id || match.id) : "";
  };

  const getSelectedAddonForTrain = (traveller, trainIndex) => {
    const selectedAddons = Array.isArray(traveller.selectedAddons)
      ? traveller.selectedAddons
      : [];
    return selectedAddons.find((a) => a.trainIndex === trainIndex)?.addonId || "";
  };

  const getSelectedAddonForFlight = (traveller, flightIndex) => {
    const selectedAddons = Array.isArray(traveller.selectedAddons)
      ? traveller.selectedAddons
      : [];
    return selectedAddons.find((a) => a.flightIndex === flightIndex)?.addonId || "";
  };

  // ───────────────────────── Payment screenshots ─────────────────────────
  const paymentSlots = [
    { type: "advance", label: "Advance Payment", cardClass: "bg-indigo-50 border-indigo-200" },
    { type: "balance", label: "Balance Payment", cardClass: "bg-green-50 border-green-200" },
    { type: "partial", label: "Partial Payment", cardClass: "bg-amber-50 border-amber-200" },
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

  // ───────────────────────── Create booking ─────────────────────────
  const handleCreateBooking = () => {
    if (!tourId) return toast.error("Select a tour first");
    if (!travellers[0].firstName.trim()) {
      return toast.error("Main traveller's name is required");
    }

    const finalTravellers = travellers.map((t) => ({
      title: t.title,
      firstName: t.firstName,
      lastName: t.lastName,
      age: t.age,
      gender: t.gender,
      packageType: t.packageType,
      variantPackageIndex: t.variantPackageIndex,
      sharingType: t.sharingType,
      selectedAddon: t.selectedAddon,
      selectedAddons: t.selectedAddons,
      boardingPoint: t.boardingPoint,
      deboardingPoint: t.deboardingPoint,
      remarks: t.remarks,
      isCoTraveller: t.isCoTraveller,
      _aadhaar: { front: t.front, back: t.back },
    }));

    navigate("/creat-bookings", {
      state: { tourId, travellers: finalTravellers, paymentScreenshots },
    });
  };

  // ───────────────────────── Existing booking (co-traveller) mode ─────────────────────────
  const extractExistingTraveller = async () => {
    if (!existingFrontFile) return toast.error("Aadhaar front image is required");

    setExistingOcrLoading(true);
    try {
      const formData = new FormData();
      formData.append("front", existingFrontFile);

      const result = await extractAadhaar(formData);
      if (!result.success) return;

      const p = result.parsed || {};
      setExistingTraveller((prev) => ({
        ...prev,
        title: "Mr",
        firstName: p.firstName || "",
        lastName: p.lastName || "",
        age: p.age || "",
        gender: p.gender || "Male",
        front: result.front || null,
      }));
      toast.success("Aadhaar read successfully. Verify details below.");
      setExistingFrontFile(null);
    } catch (err) {
      console.error("extractExistingTraveller error:", err);
    } finally {
      setExistingOcrLoading(false);
    }
  };

  const handleRaiseManageBooking = () => {
    if (!tnr.trim()) return toast.error("Enter the existing booking's TNR");
    if (!existingTraveller.firstName.trim())
      return toast.error("Add the co-traveller's details (Aadhaar or manual)");

    navigate("/tour-managebooking", {
      state: {
        tnr: tnr.trim().toUpperCase(),
        prefillTraveller: {
          title: existingTraveller.title,
          firstName: existingTraveller.firstName,
          lastName: existingTraveller.lastName,
          age: existingTraveller.age,
          gender: existingTraveller.gender,
          aadhaarId: null,
          isCoTraveller: true,
          addedBy: "admin",
          addedPostBooking: true,
        },
      },
    });
  };

  // ───────────────────────── Full traveller card (Aadhaar + every booking field) ─────────────────────────
  const TravellerCard = ({ traveller, index, isMain }) => {
    const pkg =
      traveller.packageType === "main"
        ? tourInfo
        : tourInfo.variantPackage?.[traveller.variantPackageIndex];

    const trainDetails = pkg?.trainDetails || [];
    const flightDetailsAll = pkg?.flightDetails || [];
    const flightsWithAddons = flightDetailsAll
      .map((flight, flightIndexInPackage) => ({ flight, flightIndexInPackage }))
      .filter(({ flight }) => Array.isArray(flight.addons) && flight.addons.length > 0);
    const trainAddonsExist = trainDetails.some(
      (t) => Array.isArray(t.addons) && t.addons.length > 0,
    );
    const hasLegAddons = trainAddonsExist || flightsWithAddons.length > 0;
    const flatAddons = pkg?.addons || [];

    return (
      <div
        className={`mb-6 p-5 sm:p-6 rounded-xl border-2 relative ${
          isMain ? "bg-indigo-50 border-indigo-200" : "bg-purple-50 border-purple-200"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-gray-800">
            {isMain ? "Main Traveller" : `Co-Traveller ${index}`}
            {!isMain && (
              <span className="ml-2 text-xs font-normal text-gray-500">
                ({traveller.source === "aadhaar" ? "via Aadhaar" : "Manual"})
              </span>
            )}
          </p>
          {!isMain && (
            <button
              onClick={() => removeCoTraveller(index)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Aadhaar upload — skippable for manual co-travellers */}
        {traveller.source === "aadhaar" && (
          <div className="p-4 bg-white rounded-lg border border-gray-200 mb-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Aadhaar Front {isMain ? "(required)" : ""}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTravellerFrontFile(index, e.target.files?.[0] || null)}
                  className="w-full text-sm"
                />
              </div>
              {isMain && (
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Aadhaar Back (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setTravellerBackFile(index, e.target.files?.[0] || null)}
                    className="w-full text-sm"
                  />
                </div>
              )}
              <button
                onClick={() => extractTravellerAadhaar(index)}
                disabled={traveller.ocrLoading || !traveller._frontFile}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-xl font-bold text-sm"
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
                  className="px-4 py-2.5 text-sm text-purple-700 border border-purple-300 rounded-xl"
                >
                  Switch to Manual
                </button>
              )}
            </div>
            {traveller.front && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                Aadhaar front {traveller.back ? "+ back " : ""}read
              </div>
            )}
          </div>
        )}

        {/* Basic identity fields */}
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600">Title</label>
            <select
              value={traveller.title}
              onChange={(e) => handleTravellerChange(index, "title", e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            >
              <option>Mr</option>
              <option>Mrs</option>
              <option>Ms</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">First Name</label>
            <input
              type="text"
              value={traveller.firstName}
              onChange={(e) => handleTravellerChange(index, "firstName", e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Last Name</label>
            <input
              type="text"
              value={traveller.lastName}
              onChange={(e) => handleTravellerChange(index, "lastName", e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Age</label>
            <input
              type="number"
              value={traveller.age}
              onChange={(e) => handleTravellerChange(index, "age", e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600">Gender</label>
            <select
              value={traveller.gender}
              onChange={(e) => handleTravellerChange(index, "gender", e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Package</label>
            <select
              value={traveller.packageType === "main" ? "main" : traveller.variantPackageIndex}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "main") {
                  handleTravellerChange(index, "packageType", "main");
                  handleTravellerChange(index, "variantPackageIndex", null);
                } else {
                  handleTravellerChange(index, "packageType", "variant");
                  handleTravellerChange(index, "variantPackageIndex", Number(v));
                }
              }}
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            >
              <option value="main">Main Package</option>
              {tourInfo.variantPackage?.map((p, i) => (
                <option key={i} value={i}>
                  Variant {i + 1} ({p.destination?.join(", ")})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Boarding / Deboarding */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600">Boarding Point</label>
            <select
              value={getPointId(traveller.boardingPoint)}
              onChange={(e) => {
                const opts =
                  traveller.packageType === "main"
                    ? tourInfo.boardingPoints
                    : tourInfo.variantPackage?.[traveller.variantPackageIndex]?.boardingPoints || [];
                const bp = opts?.find((x) => getPointId(x) === e.target.value);
                handleTravellerChange(index, "boardingPoint", bp || null);
              }}
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select Boarding Point</option>
              {(traveller.packageType === "main"
                ? tourInfo.boardingPoints
                : tourInfo.variantPackage?.[traveller.variantPackageIndex]?.boardingPoints || []
              )?.map((bp, i) => (
                <option key={getPointId(bp) || i} value={getPointId(bp)}>
                  {bp.stationCode} - {bp.stationName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Deboarding Point</label>
            <select
              value={getPointId(traveller.deboardingPoint)}
              onChange={(e) => {
                const opts =
                  traveller.packageType === "main"
                    ? tourInfo.deboardingPoints
                    : tourInfo.variantPackage?.[traveller.variantPackageIndex]?.deboardingPoints || [];
                const dp = opts?.find((x) => getPointId(x) === e.target.value);
                handleTravellerChange(index, "deboardingPoint", dp || null);
              }}
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select Deboarding Point</option>
              {(traveller.packageType === "main"
                ? tourInfo.deboardingPoints
                : tourInfo.variantPackage?.[traveller.variantPackageIndex]?.deboardingPoints || []
              )?.map((dp, i) => (
                <option key={getPointId(dp) || i} value={getPointId(dp)}>
                  {dp.stationCode} - {dp.stationName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sharing + flat addon */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600">Sharing Type</label>
            <select
              value={traveller.sharingType}
              onChange={(e) => handleTravellerChange(index, "sharingType", e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg"
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

          {!hasLegAddons && flatAddons.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600">Add-ons (Optional)</label>
              <select
                value={getSelectedFlatAddonId(traveller, flatAddons)}
                onChange={(e) => handleFlatAddonSelect(index, e.target.value, flatAddons)}
                className="mt-1 w-full px-3 py-2 border rounded-lg"
              >
                <option value="">No Add-on</option>
                {flatAddons.map((a) => (
                  <option key={a._id || a.id} value={a._id || a.id}>
                    {a.name} (+{currencySymbol}{a.amount || 0})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Trip-wise addons */}
        {hasLegAddons && (
          <div className="mt-4 pt-4 border-t border-gray-300">
            {trainDetails.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-bold text-indigo-700 mb-2 flex items-center gap-1.5">
                  🚆 Train Add-ons
                </p>
                <div className="space-y-2">
                  {trainDetails.map((train, tIdx) => (
                    <div key={train._id || tIdx} className="border border-gray-200 rounded-lg p-3 bg-white">
                      <p className="text-sm font-semibold text-gray-800">
                        {train.trainName} <span className="text-gray-500">({train.trainNo})</span>
                      </p>
                      <select
                        value={getSelectedAddonForTrain(traveller, tIdx)}
                        onChange={(e) => handleAddonChange(index, tIdx, e.target.value)}
                        className="mt-2 w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">No Add-on</option>
                        {(train.addons || []).map((a) => (
                          <option key={a._id || a.id} value={a._id || a.id}>
                            {a.name} (+{currencySymbol}{a.amount || 0})
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
                <p className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-1.5">
                  ✈️ Flight Add-ons
                </p>
                <div className="space-y-2">
                  {flightsWithAddons.map(({ flight, flightIndexInPackage }) => (
                    <div
                      key={flight._id || flightIndexInPackage}
                      className="border border-gray-200 rounded-lg p-3 bg-white"
                    >
                      <p className="text-sm font-semibold text-gray-800">
                        {flight.airline} <span className="text-gray-500">({flight.flightNo})</span>
                      </p>
                      <select
                        value={getSelectedAddonForFlight(traveller, flightIndexInPackage)}
                        onChange={(e) =>
                          handleFlightAddonChange(index, flightIndexInPackage, e.target.value)
                        }
                        className="mt-2 w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">No Add-on</option>
                        {(flight.addons || []).map((a) => (
                          <option key={a._id || a.id} value={a._id || a.id}>
                            {a.name} (+{currencySymbol}{a.amount || 0})
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

        {/* Remarks */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-600">Remarks (optional)</label>
          <textarea
            value={traveller.remarks}
            onChange={(e) => handleTravellerChange(index, "remarks", e.target.value)}
            rows={2}
            className="mt-1 w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <ToastContainer position="top-right" autoClose={4000} />

      <div className="flex items-center gap-4 border-b pb-6 mb-8">
        <UserPlus className="w-10 h-10 text-indigo-600" />
        <h1 className="text-3xl font-extrabold text-gray-800">Aadhaar Upload</h1>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setMode("new")}
          className={`flex-1 px-6 py-4 rounded-xl font-bold border-2 transition-all ${
            mode === "new" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-700 border-gray-300"
          }`}
        >
          New Walk-in Booking
        </button>
        <button
          onClick={() => setMode("existing")}
          className={`flex-1 px-6 py-4 rounded-xl font-bold border-2 transition-all ${
            mode === "existing" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-700 border-gray-300"
          }`}
        >
          Add Co-Traveller (Existing Booking)
        </button>
      </div>

      {/* ══════════════════════ NEW WALK-IN BOOKING ══════════════════════ */}
      {mode === "new" && (
        <>
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Tour *</label>
            <select
              value={tourId}
              onChange={(e) => setTourId(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-base"
            >
              <option value="">-- Select a tour --</option>
              {tourList?.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          {tourId && tourInfo && (
            <>
              <TravellerCard traveller={travellers[0]} index={0} isMain={true} />

              {travellers.slice(1).map((c, i) => (
                <TravellerCard key={i + 1} traveller={c} index={i + 1} isMain={false} />
              ))}

              <div className="flex gap-3 mb-8">
                <button
                  onClick={() => addCoTraveller("aadhaar")}
                  className="flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold"
                >
                  <PlusCircle className="w-5 h-5" /> Add Co-Traveller (via Aadhaar)
                </button>
                <button
                  onClick={() => addCoTraveller("manual")}
                  className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-purple-300 text-purple-700 rounded-xl font-semibold"
                >
                  <PlusCircle className="w-5 h-5" /> Add Co-Traveller (Manual)
                </button>
              </div>

              {/* Payment screenshots — 3 separate cards */}
              <div className="mb-8">
                <h3 className="flex items-center gap-2 font-bold text-gray-800 text-lg mb-4">
                  <IndianRupee className="w-6 h-6" /> Payment Screenshots (optional)
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {paymentSlots.map(({ type, label, cardClass }) => {
                    const done = paymentScreenshots[type];
                    return (
                      <div
                        key={type}
                        className={`p-5 rounded-xl border-2 ${done ? "bg-green-50 border-green-300" : cardClass}`}
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
                              className="w-full text-xs mb-2"
                            />
                            <input
                              type="number"
                              placeholder="Amount (optional)"
                              value={paymentAmounts[type] || ""}
                              onChange={(e) =>
                                setPaymentAmounts((prev) => ({ ...prev, [type]: e.target.value }))
                              }
                              className="w-full px-2 py-1.5 border rounded text-sm mb-3"
                            />
                            <button
                              onClick={() => handlePaymentUpload(type)}
                              disabled={paymentLoading[type] || !paymentFiles[type]}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-semibold"
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
                onClick={handleCreateBooking}
                className="w-full px-6 py-4 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold text-lg shadow-lg transition-all"
              >
                Create Booking
              </button>
            </>
          )}
        </>
      )}

      {/* ══════════════════════ ADD CO-TRAVELLER TO EXISTING BOOKING ══════════════════════ */}
      {mode === "existing" && (
        <>
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Existing Booking TNR *</label>
            <input
              type="text"
              value={tnr}
              onChange={(e) => setTnr(e.target.value)}
              placeholder="e.g. AB12CD"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="p-6 bg-gray-50 border-2 border-gray-200 rounded-xl mb-8">
            <h3 className="flex items-center gap-2 font-bold text-gray-800 text-lg mb-4">
              <FileImage className="w-6 h-6" /> Upload Co-Traveller's Aadhaar
            </h3>
            <div className="flex flex-wrap items-end gap-3 mb-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Front (required)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setExistingFrontFile(e.target.files?.[0] || null)}
                  className="w-full text-sm"
                />
              </div>
              <button
                onClick={extractExistingTraveller}
                disabled={existingOcrLoading || !existingFrontFile}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-xl font-bold shadow-lg"
              >
                {existingOcrLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Reading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" /> Extract Aadhaar
                  </>
                )}
              </button>
            </div>

            <div className="p-4 bg-white rounded-xl border">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600">Title</label>
                  <select
                    value={existingTraveller.title}
                    onChange={(e) => setExistingTraveller((p) => ({ ...p, title: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                  >
                    <option>Mr</option>
                    <option>Mrs</option>
                    <option>Ms</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">First Name</label>
                  <input
                    type="text"
                    value={existingTraveller.firstName}
                    onChange={(e) => setExistingTraveller((p) => ({ ...p, firstName: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Last Name</label>
                  <input
                    type="text"
                    value={existingTraveller.lastName}
                    onChange={(e) => setExistingTraveller((p) => ({ ...p, lastName: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Age</label>
                  <input
                    type="number"
                    value={existingTraveller.age}
                    onChange={(e) => setExistingTraveller((p) => ({ ...p, age: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              {existingTraveller.front && (
                <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle2 className="w-4 h-4" /> Aadhaar front read
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleRaiseManageBooking}
            className="w-full px-6 py-4 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold text-lg shadow-lg transition-all"
          >
            Raise Manage Booking
          </button>
        </>
      )}
    </div>
  );
};

export default AadhaarUpload;

