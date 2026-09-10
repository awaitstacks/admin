// import React, { useContext, useEffect, useState, useMemo } from "react";
// import { TourContext } from "../../context/TourContext";
// import {
//   CalendarCheck,
//   Loader2,
//   AlertCircle,
//   Mail,
//   MapPin,
//   Users,
//   Save,
//   MessageSquare,
//   IndianRupee,
//   PlusCircle,
//   Trash2,
//   Train,
// } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const trainClasses = [
//   { value: "3A", label: "3A - Three tier AC" },
//   { value: "2A", label: "2A - Two tier AC" },
//   { value: "1A", label: "1A - First AC" },
//   { value: "3E", label: "3E - Three tier economy AC" },
//   { value: "SL", label: "SL - Sleeper" },
//   { value: "2S", label: "2S - Second sitting" },
//   { value: "CC", label: "CC - Chair car AC" },
//   { value: "EC", label: "EC - Executive chair car AC" },
// ];

// const flightClasses = [
//   { value: "Economy", label: "Economy" },
//   { value: "Business", label: "Business" },
//   { value: "First", label: "First Class" },
// ];

// // ─────────────────────────────────────────────────────────────
// // SINGLE SOURCE OF TRUTH for "which trains/flights does this
// // package show, and in what order". Used identically by:
// //   - the dropdown rendering (what the admin sees, with its index)
// //   - handleTripAddonChange (which trip a selection applies to)
// //   - getSelectedTripAddonId (which trip a saved selection matches)
// // Package data can contain empty/garbage entries (no trainName,
// // no trainNo) — those are filtered out here. If any ONE of these
// // three places used a different (unfiltered) list, the same
// // tripIndex would point at a DIFFERENT physical trip in each place
// // — silently replacing/reading the wrong trip's addon. That was
// // the root cause of "changing one addon corrupts the total".
// const getFilteredTrainDetails = (pkg) =>
//   (pkg?.trainDetails || []).filter(
//     (tr) => tr && (tr.trainName?.trim() || tr.trainNo?.trim()),
//   );

// const getFilteredFlightDetails = (pkg) =>
//   (pkg?.flightDetails || []).filter(
//     (fl) => fl && (fl.airline?.trim() || fl.flightNo?.trim()),
//   );

// // ─────────────────────────────────────────────────────────────
// // Does this PACKAGE (main tour or a variant) actually offer any
// // trip-wise (train/flight leg) add-ons at all? Checked per package,
// // not per booking — a traveller's package (main vs a specific
// // variant) can differ from another traveller's in the same booking,
// // and each package can have its own train/flight addon config.
// const packageHasTripWiseAddons = (pkg) => {
//   const trainList = getFilteredTrainDetails(pkg);
//   const flightList = getFilteredFlightDetails(pkg);
//   const trainHasAddons = trainList.some(
//     (tr) => Array.isArray(tr.addons) && tr.addons.length > 0,
//   );
//   const flightHasAddons = flightList.some(
//     (fl) => Array.isArray(fl.addons) && fl.addons.length > 0,
//   );
//   return trainHasAddons || flightHasAddons;
// };

// // Does this specific traveller have an old-style FLAT addon saved
// // (name + non-zero price)? Used to decide, for a package that DOES
// // support trip-wise addons, whether to still show the flat dropdown
// // for THIS traveller (because that's what's actually saved on their
// // record) rather than the trip-wise UI.
// const travellerHasFlatAddon = (t) => {
//   const a = t?.selectedAddon;
//   if (!a || typeof a !== "object") return false;
//   const hasName = typeof a.name === "string" && a.name.trim().length > 0;
//   const hasPrice = typeof a.price === "number" && a.price !== 0;
//   return hasName || hasPrice;
// };

// const ManageBooking = () => {
//   const [bookingId, setBookingId] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [booking, setBooking] = useState(null);
//   const [tour, setTour] = useState(null);
//   const [originalBooking, setOriginalBooking] = useState(null);
//   const [validationErrors, setValidationErrors] = useState({});
//   const [balanceInfo, setBalanceInfo] = useState(null);

//   const [balanceHistory, setBalanceHistory] = useState([]);
//   const [historyLoading, setHistoryLoading] = useState(false);
//   const [historyError, setHistoryError] = useState("");

//   const { viewBooking, getTourList, tourList, getManagedBookingsHistory } =
//     useContext(TourContext);

//   useEffect(() => {
//     if (tourList.length === 0) getTourList();
//   }, [tourList, getTourList]);

//   const isFullyPaid = useMemo(() => {
//     if (!booking?.payment) return false;
//     return (
//       booking.payment.advance.paid === true &&
//       booking.payment.balance.paid === true
//     );
//   }, [booking]);

//   const handleGetDetails = async () => {
//     if (!bookingId.trim()) return setError("Enter a Booking ID");

//     setLoading(true);
//     setError("");
//     setBooking(null);
//     setTour(null);
//     setValidationErrors({});
//     setBalanceInfo(null);
//     setBalanceHistory([]);

//     const res = await viewBooking(bookingId.trim());
//     if (!res.success) {
//       setError(res.message || "Failed to load booking");
//       setLoading(false);
//       return;
//     }

//     const loadedBooking = res.booking;
//     const rawTourId = loadedBooking.tourId?._id || loadedBooking.tourId;
//     const tourId =
//       typeof rawTourId === "object" ? rawTourId.toString() : rawTourId;

//     const foundTour = tourList.find((t) => t._id === tourId);
//     if (!foundTour) {
//       setError("Tour data not found. Please refresh or contact support.");
//       setLoading(false);
//       return;
//     }

//     setTour(foundTour);
//     setBooking(loadedBooking);
//     setOriginalBooking(JSON.parse(JSON.stringify(loadedBooking)));
//     setLoading(false);
//   };

//   const addNewTraveller = () => {
//     const newTraveller = {
//       title: "Mr",
//       firstName: "",
//       lastName: "",
//       age: "",
//       gender: "Male", // default for Mr
//       packageType: "main",
//       variantPackageIndex: null,
//       sharingType: "",
//       // Both kept in sync so whichever UI (flat vs trip-wise) ends up
//       // rendering for this traveller's package has the field it needs.
//       selectedAddon: null,
//       selectedAddons: [],
//       boardingPoint: null,
//       deboardingPoint: null,
//       remarks: "",
//     };

//     setBooking((prev) => ({
//       ...prev,
//       travellers: [...(prev.travellers || []), newTraveller],
//     }));

//     toast.info("New traveller added. Fill details and save.");
//   };

//   const removeTraveller = (index) => {
//     const travellerToRemove = booking.travellers[index];

//     // Only show serious warning if this is an EXISTING traveller (has _id)
//     if (travellerToRemove._id) {
//       const warningMessage =
//         "WARNING: Removing this existing traveller will reset all advance and balance payments for the entire booking.\n\n" +
//         "This action effectively treats the booking as new — no prior payment history, calculations, or records will be carried forward for this traveller.\n\n" +
//         "Please consult with the admin team before proceeding to avoid unintended financial adjustments.\n\n" +
//         "Are you sure you want to continue?";

//       if (!window.confirm(warningMessage)) {
//         return; // User cancelled → do nothing
//       }
//     }

//     // Proceed with removal (no warning for newly added travellers)
//     setBooking((prev) => ({
//       ...prev,
//       travellers: prev.travellers.filter((_, i) => i !== index),
//     }));

//     toast.info("Traveller removed. Save to confirm.");
//   };

//   const getPackage = (traveller) => {
//     if (!tour) return null;
//     return traveller.packageType === "main"
//       ? tour
//       : tour.variantPackage?.[traveller.variantPackageIndex] || null;
//   };

//   const resetTravellerFields = (idx, fieldsToReset = {}) => {
//     const upd = { ...booking };
//     const t = upd.travellers[idx];
//     const defaults = {
//       sharingType: "",
//       selectedAddon: null,
//       selectedAddons: [],
//       boardingPoint: null,
//       deboardingPoint: null,
//     };
//     Object.assign(t, { ...defaults, ...fieldsToReset });
//     setBooking(upd);
//   };

//   const updateTraveller = (idx, field, value) => {
//     const upd = { ...booking };
//     const t = upd.travellers[idx];
//     const ORIG = originalBooking?.travellers?.[idx];

//     // Bidirectional sync: Title ↔ Gender
//     if (field === "title") {
//       if (value === "Mr") {
//         t.gender = "Male";
//       } else if (value === "Mrs" || value === "Ms") {
//         t.gender = "Female";
//       }
//     } else if (field === "gender") {
//       if (value === "Male") {
//         t.title = "Mr";
//       } else if (value === "Female") {
//         t.title = "Ms"; // Default to Ms for Female (user can manually change to Mrs)
//       }
//     }

//     if (field === "packageType" || field === "variantPackageIndex") {
//       const newPkg = field === "packageType" ? value : t.packageType;
//       const newIdx =
//         field === "variantPackageIndex" ? value : t.variantPackageIndex;

//       t.packageType = newPkg;
//       if (field === "variantPackageIndex") t.variantPackageIndex = newIdx;

//       const pkgChanged =
//         t.packageType !== ORIG?.packageType ||
//         t.variantPackageIndex !== ORIG?.variantPackageIndex;

//       if (pkgChanged) {
//         resetTravellerFields(idx);
//       }

//       setBooking(upd);
//       return;
//     }

//     t[field] = value;
//     setBooking(upd);
//   };

//   // ─────────────────────────────────────────────────────────
//   // Trip-wise addon change (NEW bookings only — package has
//   // trainDetails/flightDetails addons). Mirrors TourBooking.jsx's
//   // handleAddonChange so the same selectedAddons[] shape is used
//   // on both the user-facing booking page and here.
//   // ─────────────────────────────────────────────────────────
//   const normalizeAddonEntry = (a, refList) => {
//     const list = refList || [];
//     const wantedType = (a.tripType || "").trim().toUpperCase();

//     const matchWithinType = (predicate) => {
//       if (!wantedType) return -1;
//       for (let i = 0; i < list.length; i++) {
//         const entry = list[i];
//         if ((entry.tripType || "").trim().toUpperCase() !== wantedType)
//           continue;
//         if (!predicate || predicate(entry)) return i;
//       }
//       return -1;
//     };

//     if (a.trainNo || a.trainName) {
//       let idx = matchWithinType(
//         (tr) =>
//           (a.trainNo && tr.trainNo === a.trainNo) ||
//           (a.trainName && tr.trainName === a.trainName),
//       );
//       if (idx === -1) idx = matchWithinType(null);
//       if (idx === -1) {
//         idx = list.findIndex(
//           (tr) =>
//             (a.trainNo && tr.trainNo === a.trainNo) ||
//             (a.trainName && tr.trainName === a.trainName),
//         );
//       }
//       if (idx !== -1) return { tripKind: "train", tripIndex: idx };
//     }
//     if (a.flightNo || a.airline) {
//       let idx = matchWithinType(
//         (fl) =>
//           (a.flightNo && fl.flightNo === a.flightNo) ||
//           (a.airline && fl.airline === a.airline),
//       );
//       if (idx === -1) idx = matchWithinType(null);
//       if (idx === -1) {
//         idx = list.findIndex(
//           (fl) =>
//             (a.flightNo && fl.flightNo === a.flightNo) ||
//             (a.airline && fl.airline === a.airline),
//         );
//       }
//       if (idx !== -1) return { tripKind: "flight", tripIndex: idx };
//     }
//     if (a.tripKind && a.tripIndex !== undefined && a.tripIndex !== null) {
//       return { tripKind: a.tripKind, tripIndex: Number(a.tripIndex) };
//     }
//     if (a.trainIndex !== undefined && a.trainIndex !== null) {
//       return { tripKind: "train", tripIndex: Number(a.trainIndex) };
//     }
//     return { tripKind: undefined, tripIndex: undefined };
//   };

//   const tripOrderRank = (tripType) => {
//     const t = (tripType || "").toUpperCase();
//     if (t.startsWith("BOARD")) return 0;
//     if (t.startsWith("MIDDLE")) return 1;
//     if (t.startsWith("DEBOARD") || t.startsWith("DEBOARF")) return 2;
//     return 3;
//   };

//   const sortAddonsForStorage = (addons) =>
//     [...addons].sort((a, b) => {
//       const rankDiff = tripOrderRank(a.tripType) - tripOrderRank(b.tripType);
//       if (rankDiff !== 0) return rankDiff;
//       const ai = a.tripIndex ?? a.trainIndex ?? 0;
//       const bi = b.tripIndex ?? b.trainIndex ?? 0;
//       return ai - bi;
//     });

//   const handleTripAddonChange = (travellerIdx, tripKind, tripIndex, addonId) => {
//     const upd = { ...booking };
//     const t = upd.travellers[travellerIdx];
//     const pkg = getPackage(t);

//     const list =
//       tripKind === "train"
//         ? getFilteredTrainDetails(pkg)
//         : getFilteredFlightDetails(pkg);
//     const trip = list[tripIndex];
//     if (!trip) return;

//     let selectedAddons = Array.isArray(t.selectedAddons)
//       ? [...t.selectedAddons]
//       : [];

//     selectedAddons = selectedAddons.filter((a) => {
//       const norm = normalizeAddonEntry(a, list);
//       return !(norm.tripKind === tripKind && norm.tripIndex === tripIndex);
//     });

//     if (addonId) {
//       const found = (trip.addons || []).find(
//         (a) => String(a._id || a.id) === String(addonId),
//       );
//       if (found) {
//         selectedAddons.push({
//           tripKind,
//           tripIndex,
//           ...(tripKind === "train" ? { trainIndex: tripIndex } : {}),
//           trainNo: trip.trainNo,
//           trainName: trip.trainName,
//           flightNo: trip.flightNo,
//           airline: trip.airline,
//           tripType: trip.tripType,
//           addonId: found._id || found.id,
//           name: found.name,
//           amount: Number(found.amount) || 0,
//           addedAt: new Date(),
//         });
//       }
//     }

//     t.selectedAddons = sortAddonsForStorage(selectedAddons);
//     setBooking(upd);
//   };

//   const getSelectedTripAddonId = (traveller, pkg, tripKind, tripIndex) => {
//     const list = Array.isArray(traveller.selectedAddons)
//       ? traveller.selectedAddons
//       : [];
//     const refList =
//       tripKind === "train"
//         ? getFilteredTrainDetails(pkg)
//         : getFilteredFlightDetails(pkg);
//     const match = list.find((a) => {
//       const norm = normalizeAddonEntry(a, refList);
//       return norm.tripKind === tripKind && norm.tripIndex === tripIndex;
//     });
//     if (!match) return "";
//     const raw = match.addonId;
//     const rawId =
//       raw && typeof raw === "object" && raw.$oid
//         ? String(raw.$oid)
//         : String(raw ?? "");

//     const trip = refList[tripIndex];
//     const availableAddons = trip?.addons || [];

//     if (availableAddons.some((a) => String(a._id || a.id) === rawId)) {
//       return rawId;
//     }

//     const byName = availableAddons.find((a) => a.name === match.name);
//     if (byName) return String(byName._id || byName.id);

//     return "";
//   };

//   const updateNested = (path, value) => {
//     const parts = path.split(".");
//     const upd = { ...booking };
//     let ref = upd;
//     for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]];
//     ref[parts[parts.length - 1]] = value;
//     setBooking(upd);
//   };

//   const hasChanges = useMemo(() => {
//     if (!originalBooking || !booking) return false;
//     return JSON.stringify(booking) !== JSON.stringify(originalBooking);
//   }, [booking, originalBooking]);

//   const travellerPrice = (t) => {
//     const pkg =
//       t.packageType === "main"
//         ? tour
//         : (tour.variantPackage?.[t.variantPackageIndex] ?? tour);

//     let base = 0;
//     switch (t.sharingType) {
//       case "double":
//         base = pkg?.price?.doubleSharing ?? 0;
//         break;
//       case "triple":
//         base = pkg?.price?.tripleSharing ?? 0;
//         break;
//       case "withBerth":
//         base = pkg?.price?.childWithBerth ?? 0;
//         break;
//       case "withoutBerth":
//         base = pkg?.price?.childWithoutBerth ?? 0;
//         break;
//       default:
//         base = pkg?.price?.doubleSharing ?? 0;
//     }

//     const flatAddon = t.selectedAddon?.price ?? 0;
//     const tripAddonsTotal = Array.isArray(t.selectedAddons)
//       ? t.selectedAddons.reduce((sum, a) => sum + (Number(a.amount) || 0), 0)
//       : 0;

//     return base + flatAddon + tripAddonsTotal;
//   };

//   const validateBeforeSave = () => {
//     const errors = {};
//     let hasError = false;

//     booking.travellers.forEach((t, idx) => {
//       if (t.cancelled?.byAdmin || t.cancelled?.byTraveller) return;

//       const errKey = `traveller_${idx}`;
//       const err = [];

//       if (
//         !t.packageType ||
//         (t.packageType === "variant" && t.variantPackageIndex === null)
//       )
//         err.push("Valid package must be selected");
//       if (!t.sharingType) err.push("Sharing type is required");
//       if (!t.boardingPoint?.stationCode) err.push("Boarding point is required");
//       if (!t.deboardingPoint?.stationCode)
//         err.push("De-boarding point is required");
//       if (!t.firstName?.trim()) err.push("First name is required");
//       if (!t.age || isNaN(t.age) || t.age < 1)
//         err.push("Valid age is required");

//       if (err.length) {
//         errors[errKey] = err;
//         hasError = true;
//       }
//     });

//     setValidationErrors(errors);
//     return !hasError;
//   };

//   const handleSaveUpdate = async () => {
//     if (!hasChanges) {
//       toast.info("No changes to save.");
//       return;
//     }

//     if (!validateBeforeSave()) {
//       toast.error("Please fix validation errors before saving.");
//       return;
//     }

//     setSaving(true);
//     setError("");

//     try {
//       const updates = {
//         travellers: booking.travellers.map((t) => ({
//           _id: t._id || undefined,
//           title: t.title || "",
//           firstName: t.firstName?.trim() || "",
//           lastName: t.lastName?.trim() || "",
//           age: Number(t.age) || null,
//           gender: t.gender || "",
//           packageType: t.packageType || "main",
//           variantPackageIndex: t.variantPackageIndex ?? null,
//           sharingType: t.sharingType || "",

//           selectedAddon: t.selectedAddon
//             ? { name: t.selectedAddon.name, price: t.selectedAddon.price }
//             : null,

//           selectedAddons: Array.isArray(t.selectedAddons)
//             ? sortAddonsForStorage(t.selectedAddons).map((a) => ({
//                 tripKind: a.tripKind,
//                 tripIndex: a.tripIndex,
//                 trainNo: a.trainNo,
//                 trainName: a.trainName,
//                 flightNo: a.flightNo,
//                 airline: a.airline,
//                 tripType: a.tripType,
//                 addonId: a.addonId,
//                 name: a.name,
//                 amount: Number(a.amount) || 0,
//               }))
//             : [],

//           boardingPoint: t.boardingPoint ? { ...t.boardingPoint } : null,
//           deboardingPoint: t.deboardingPoint ? { ...t.deboardingPoint } : null,
//           remarks: t.remarks?.trim() || "",
//         })),

//         contact: {},
//         billingAddress: {},
//       };

//       if (booking.contact?.email !== originalBooking?.contact?.email) {
//         updates.contact.email = booking.contact.email?.trim();
//       }
//       if (booking.contact?.mobile !== originalBooking?.contact?.mobile) {
//         updates.contact.mobile = booking.contact.mobile?.trim();
//       }

//       const billingFields = [
//         "addressLine1",
//         "addressLine2",
//         "city",
//         "state",
//         "pincode",
//         "country",
//       ];
//       billingFields.forEach((f) => {
//         if (
//           booking.billingAddress?.[f] !== originalBooking?.billingAddress?.[f]
//         ) {
//           updates.billingAddress[f] = booking.billingAddress[f]?.trim() || "";
//         }
//       });

//       if (!Object.keys(updates.contact).length) delete updates.contact;
//       if (!Object.keys(updates.billingAddress).length)
//         delete updates.billingAddress;

//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/tour/manage-booking-balance/${booking._id}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             ttoken: localStorage.getItem("ttoken"),
//           },
//           body: JSON.stringify({ updates }),
//         },
//       );

//       const result = await response.json();

//       if (result.success) {
//         toast.success(
//           "Update request raised! Boarding/De-boarding updated (fully paid booking).",
//         );

//         setBalanceInfo({
//           gvPool: result.data?.gvCancellationPool,
//           irctcPool: result.data?.irctcCancellationPool,
//         });

//         setOriginalBooking(JSON.parse(JSON.stringify(booking)));

//         const res = await getManagedBookingsHistory();
//         if (res.success && Array.isArray(res.data)) {
//           const filtered = res.data
//             .filter(
//               (e) =>
//                 e.originalBooking?._id?.toString() === booking._id.toString(),
//             )
//             .sort((a, b) => {
//               const dateA = new Date(a.raisedAt || a.createdAt || 0);
//               const dateB = new Date(b.raisedAt || b.createdAt || 0);
//               return dateB - dateA; // newest first
//             });

//           setBalanceHistory(filtered);
//         }
//       } else {
//         toast.error(result.message || "Failed to raise update request");
//       }
//     } catch (err) {
//       console.error("Save error:", err);
//       toast.error("Network or server error");
//     } finally {
//       setSaving(false);
//     }
//   };

//   useEffect(() => {
//     if (!booking?._id) return;

//     const fetchHistory = async () => {
//       setHistoryLoading(true);
//       setHistoryError("");
//       setBalanceHistory([]);

//       try {
//         const res = await getManagedBookingsHistory();
//         if (res.success && Array.isArray(res.data)) {
//           const filtered = res.data
//             .filter(
//               (e) =>
//                 e.originalBooking?._id?.toString() === booking._id.toString(),
//             )
//             .sort((a, b) => {
//               const dateA = new Date(a.raisedAt || a.createdAt || 0);
//               const dateB = new Date(b.raisedAt || b.createdAt || 0);
//               return dateB - dateA; // newest first
//             });

//           setBalanceHistory(filtered);
//         }
//       } catch (err) {
//         console.error("History fetch error:", err);
//         setHistoryError("Failed to load balance update history");
//       } finally {
//         setHistoryLoading(false);
//       }
//     };

//     fetchHistory();
//   }, [booking?._id, getManagedBookingsHistory]);

//   const formatHistoryDate = (dateStr) => {
//     if (!dateStr) return "N/A";
//     const date = new Date(dateStr);
//     if (isNaN(date.getTime())) return "Invalid Date";
//     return date.toLocaleString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: false,
//     });
//   };

//   return (
//     <div className="relative max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
//       <ToastContainer position="top-right" autoClose={4000} />

//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-6 mb-8 gap-4">
//         <div className="flex items-center gap-6">
//           <CalendarCheck className="w-11 h-11 text-indigo-600 flex-shrink-0" />
//           <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800">
//             Booking Controller
//           </h1>
//         </div>

//         <div className="flex flex-wrap gap-3">
//           {booking && (
//             <button
//               onClick={handleSaveUpdate}
//               disabled={saving || !hasChanges}
//               className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
//                 saving || !hasChanges
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-green-600 hover:bg-green-700"
//               }`}
//             >
//               {saving ? (
//                 <>
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   Saving...
//                 </>
//               ) : (
//                 <>
//                   <Save className="w-5 h-5" />
//                   Save Update
//                 </>
//               )}
//             </button>
//           )}
//         </div>
//       </div>

//       <div className="max-w-2xl mx-auto mb-10">
//         <label className="block text-sm font-semibold text-gray-700 mb-3">
//           Enter TNR
//         </label>
//         <div className="flex flex-col sm:flex-row gap-4">
//           <input
//             type="text"
//             placeholder="Paste TNR here..."
//             value={bookingId}
//             onChange={(e) => setBookingId(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && handleGetDetails()}
//             className="flex-1 px-6 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 shadow-sm transition-all"
//           />
//           <button
//             onClick={handleGetDetails}
//             disabled={loading}
//             className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-lg transition-all transform hover:scale-105"
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="w-6 h-6 animate-spin inline mr-2" />
//                 Loading...
//               </>
//             ) : (
//               "Get Details"
//             )}
//           </button>
//         </div>
//       </div>

//       {error && (
//         <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
//           <AlertCircle className="w-7 h-7 flex-shrink-0" />
//           <span className="font-medium">{error}</span>
//         </div>
//       )}

//       {booking && tour && (
//         <div className="space-y-10">
//           {isFullyPaid && (
//             <div className="p-6 bg-green-100 border-2 border-green-600 rounded-xl text-green-900 font-bold text-center text-lg shadow-md">
//               This booking is FULLY PAID
//               <br />
//               <span className="text-base font-medium">
//                 All fields are LOCKED except Boarding Point & De-boarding Point.
//                 <br />
//                 You can only change boarding/de-boarding locations.
//               </span>
//             </div>
//           )}

//           <div className="grid md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 TNR
//               </label>
//               <input
//                 type="text"
//                 value={booking.tnr}
//                 disabled
//                 className="mt-2 w-full px-4 py-3 border rounded-lg bg-gray-100 font-mono text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Tour Title
//               </label>
//               <input
//                 type="text"
//                 value={tour.title}
//                 disabled
//                 className="mt-2 w-full px-4 py-3 border rounded-lg bg-gray-100"
//               />
//             </div>
//           </div>

//           {booking.adminRemarks?.length > 0 && (
//             <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
//               <h3 className="flex items-center gap-2 font-bold mb-4 text-yellow-800 text-lg">
//                 <MessageSquare className="w-6 h-6" /> Admin Remarks
//               </h3>
//               <div className="space-y-3">
//                 {booking.adminRemarks.map((remark, i) => {
//                   const amount = Number(remark.amount) || 0;
//                   const isNegative = amount < 0;
//                   const date = new Date(remark.addedAt);
//                   const formattedDate = date.toLocaleDateString("en-IN", {
//                     day: "2-digit",
//                     month: "short",
//                     year: "numeric",
//                   });
//                   const formattedTime = date.toLocaleTimeString("en-IN", {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                     hour12: false,
//                   });

//                   return (
//                     <div
//                       key={i}
//                       className={`p-4 rounded-lg text-sm font-medium border ${
//                         isNegative
//                           ? "bg-red-50 text-red-800 border-red-200"
//                           : "bg-green-50 text-green-800 border-green-200"
//                       }`}
//                     >
//                       <div className="flex justify-between items-center">
//                         <span className="font-bold text-lg">
//                           {isNegative ? "-₹" : "+₹"}
//                           {Math.abs(amount)}
//                         </span>
//                         <span className="text-sm opacity-75">
//                           {formattedDate} at {formattedTime}
//                         </span>
//                       </div>
//                       <div className="mt-1">{remark.remark}</div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {(booking.gvCancellationPool !== undefined ||
//             booking.irctcCancellationPool !== undefined) && (
//             <div className="p-6 bg-purple-50 border border-purple-200 rounded-xl">
//               <h3 className="flex items-center gap-2 font-bold mb-4 text-purple-800 text-lg">
//                 <IndianRupee className="w-6 h-6" /> Cancellation Pools
//               </h3>
//               <div className="grid grid-cols-2 gap-6 text-base">
//                 {booking.gvCancellationPool !== undefined && (
//                   <div>
//                     <span className="font-medium">GV Pool:</span>{" "}
//                     <span className="font-bold text-purple-700">
//                       ₹{booking.gvCancellationPool}
//                     </span>
//                   </div>
//                 )}
//                 {booking.irctcCancellationPool !== undefined && (
//                   <div>
//                     <span className="font-medium">IRCTC Pool:</span>{" "}
//                     <span className="font-bold text-purple-700">
//                       ₹{booking.irctcCancellationPool}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-xl">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="flex items-center gap-2 font-bold text-indigo-800 text-lg">
//                 <IndianRupee className="w-6 h-6" />
//                 Balance Update History
//               </h3>
//               <button
//                 onClick={async () => {
//                   setHistoryLoading(true);
//                   const res = await getManagedBookingsHistory();
//                   if (res.success && Array.isArray(res.data)) {
//                     const filtered = res.data
//                       .filter(
//                         (e) =>
//                           e.originalBooking?._id?.toString() ===
//                           booking._id.toString(),
//                       )
//                       .sort((a, b) => {
//                         const dateA = new Date(a.raisedAt || a.createdAt || 0);
//                         const dateB = new Date(b.raisedAt || b.createdAt || 0);
//                         return dateB - dateA; // newest first
//                       });

//                     setBalanceHistory(filtered);
//                   }
//                   setHistoryLoading(false);
//                 }}
//                 className="text-sm text-indigo-600 hover:underline font-medium"
//                 disabled={historyLoading}
//               >
//                 {historyLoading ? "Refreshing..." : "Refresh"}
//               </button>
//             </div>

//             {historyLoading && (
//               <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
//                 <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" />
//                 Loading history...
//               </div>
//             )}

//             {historyError && (
//               <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center text-red-800 font-medium">
//                 {historyError}
//               </div>
//             )}

//             {!historyLoading &&
//               !historyError &&
//               balanceHistory.length === 0 && (
//                 <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center text-yellow-800 font-medium">
//                   No balance update history found for this booking.
//                 </div>
//               )}

//             {!historyLoading && !historyError && balanceHistory.length > 0 && (
//               <div className="space-y-4">
//                 {balanceHistory.map((entry) => {
//                   const isApproved = entry.approvedBy;

//                   const displayDate = entry.raisedAt || entry.createdAt;
//                   const formattedDate = displayDate
//                     ? new Date(displayDate).toLocaleString("en-IN", {
//                         day: "2-digit",
//                         month: "short",
//                         year: "numeric",
//                         hour: "2-digit",
//                         minute: "2-digit",
//                         hour12: false,
//                       })
//                     : "N/A";

//                   return (
//                     <div
//                       key={entry._id}
//                       className={`p-5 rounded-xl border text-sm font-medium transition-all ${
//                         isApproved
//                           ? "bg-green-50 text-green-800 border-green-300"
//                           : "bg-red-50 text-red-800 border-red-300"
//                       }`}
//                     >
//                       <div className="flex justify-between items-start mb-3">
//                         <div>
//                           <span className="font-bold text-lg">
//                             {isApproved ? "Approved" : "Not Approved"}
//                           </span>
//                         </div>
//                         <span className="text-xs opacity-75">
//                           {formattedDate}
//                         </span>
//                       </div>

//                       <div className="grid grid-cols-2 gap-3 text-sm">
//                         <div>
//                           <span className="font-medium">Old Advance:</span>{" "}
//                           <span className="font-bold">
//                             ₹{entry.originalBooking?.advancePaid || 0}
//                           </span>
//                         </div>
//                         <div>
//                           <span className="font-medium">Old Balance:</span>{" "}
//                           <span className="font-bold">
//                             ₹{entry.originalBooking?.balanceDue || 0}
//                           </span>
//                         </div>
//                         <div>
//                           <span className="font-medium">New Advance:</span>{" "}
//                           <span className="font-bold text-green-700">
//                             ₹{entry.requested?.updatedAdvance || 0}
//                           </span>
//                         </div>
//                         <div>
//                           <span className="font-medium">New Balance:</span>{" "}
//                           <span className="font-bold text-green-700">
//                             ₹{entry.requested?.updatedBalance || 0}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//           <div className="p-6 bg-blue-50 rounded-xl">
//             <h3 className="flex items-center gap-2 font-bold mb-5 text-blue-800 text-lg">
//               <Mail className="w-6 h-6" /> Contact
//             </h3>
//             <div className="grid md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Advance amount
//                 </label>
//                 <input
//                   value={booking.payment?.advance?.amount || ""}
//                   disabled={true}
//                   className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
//                 />
//                 <input
//                   value={booking.payment?.advance?.paid || "Not paid"}
//                   disabled={true}
//                   className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Balance amount
//                 </label>
//                 <input
//                   value={booking.payment?.balance?.amount || ""}
//                   disabled={true}
//                   className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
//                 />
//                 <input
//                   value={booking.payment?.balance?.paid || "Not paid"}
//                   disabled={true}
//                   className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="p-6 bg-blue-50 rounded-xl">
//             <h3 className="flex items-center gap-2 font-bold mb-5 text-blue-800 text-lg">
//               <Mail className="w-6 h-6" /> Contact
//             </h3>
//             <div className="grid md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   value={booking.contact?.email || ""}
//                   onChange={(e) =>
//                     updateNested("contact.email", e.target.value)
//                   }
//                   disabled={isFullyPaid}
//                   className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Mobile
//                 </label>
//                 <input
//                   type="text"
//                   value={booking.contact?.mobile || ""}
//                   onChange={(e) =>
//                     updateNested("contact.mobile", e.target.value)
//                   }
//                   disabled={isFullyPaid}
//                   className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="p-6 bg-green-50 rounded-xl">
//             <h3 className="flex items-center gap-2 font-bold mb-5 text-green-800 text-lg">
//               <MapPin className="w-6 h-6" /> Billing Address
//             </h3>
//             <div className="grid md:grid-cols-2 gap-6">
//               {[
//                 "addressLine1",
//                 "addressLine2",
//                 "city",
//                 "state",
//                 "pincode",
//                 "country",
//               ].map((f) => (
//                 <div key={f}>
//                   <label className="block text-sm font-medium text-gray-700 capitalize">
//                     {f.replace(/([A-Z])/g, " $1").trim()}
//                   </label>
//                   <input
//                     type="text"
//                     value={booking.billingAddress?.[f] || ""}
//                     onChange={(e) =>
//                       updateNested(`billingAddress.${f}`, e.target.value)
//                     }
//                     disabled={isFullyPaid}
//                     className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div>
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//               <h3 className="flex items-center gap-3 font-bold text-gray-800 text-xl">
//                 <Users className="w-8 h-8" /> Travellers
//                 <span className="text-lg text-gray-600">
//                   ({booking.travellers.length})
//                 </span>
//               </h3>

//               {!isFullyPaid && (
//                 <button
//                   onClick={addNewTraveller}
//                   className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all"
//                 >
//                   <PlusCircle className="w-5 h-5" />
//                   Add New Traveller
//                 </button>
//               )}
//             </div>

//             {booking.travellers.map((t, idx) => {
//               const isCancelled =
//                 t.cancelled?.byAdmin || t.cancelled?.byTraveller;
//               const pkg = getPackage(t);
//               const boardingOpts =
//                 t.packageType === "main"
//                   ? tour.boardingPoints || []
//                   : pkg?.boardingPoints || [];
//               const deboardingOpts =
//                 t.packageType === "main"
//                   ? tour.deboardingPoints || []
//                   : pkg?.deboardingPoints || [];
//               const addonOpts =
//                 t.packageType === "main"
//                   ? tour.addons || []
//                   : pkg?.addons || [];

//               // ── Flat vs trip-wise decision — PER TRAVELLER, based on
//               // THIS traveller's package:
//               //   1. If the package has NO trip-wise (train/flight leg)
//               //      addons configured at all → always flat UI (nothing
//               //      else to show).
//               //   2. If the package DOES have trip-wise addons:
//               //      a. Traveller already has an old-style flat addon
//               //         saved on their record → keep showing flat UI
//               //         (so their existing selection stays visible/
//               //         editable, doesn't silently disappear).
//               //      b. Otherwise (no flat addon — whether they have
//               //         trip-wise addons saved already, or none at
//               //         all) → trip-wise UI, since that's what the
//               //         package actually offers.
//               const pkgTripWiseCapable = packageHasTripWiseAddons(pkg);
//               const tripWise =
//                 pkgTripWiseCapable && !travellerHasFlatAddon(t);
//               const trainDetails = getFilteredTrainDetails(pkg);
//               const flightDetails = getFilteredFlightDetails(pkg);
//               const tripAddonsTotal = Array.isArray(t.selectedAddons)
//                 ? t.selectedAddons.reduce(
//                     (sum, a) => sum + (Number(a.amount) || 0),
//                     0,
//                   )
//                 : 0;

//               const errKey = `traveller_${idx}`;
//               const fieldErrors = validationErrors[errKey] || [];

//               const isNew = !t._id;

//               const isTravellerEditable = !isFullyPaid && !isCancelled;
//               const isBoardingEditable = !isCancelled;

//               return (
//                 <div
//                   key={idx}
//                   className={`mb-8 p-6 border-2 rounded-xl relative ${isCancelled ? "bg-red-50 border-red-300 opacity-75" : "bg-gray-50 border-gray-300"}`}
//                 >
//                   <div className="flex items-center justify-between mb-4">
//                     <h4 className="text-lg font-bold text-gray-800">
//                       Traveller {idx + 1}
//                       {isNew && (
//                         <span className="ml-2 text-sm text-indigo-600 font-medium">
//                           (New)
//                         </span>
//                       )}
//                     </h4>

//                     <div className="flex items-center gap-4">
//                       {isCancelled && (
//                         <span className="text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">
//                           Cancelled – No edits
//                         </span>
//                       )}

//                       {!isCancelled && !isFullyPaid && (
//                         <button
//                           onClick={() => removeTraveller(idx)}
//                           className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                           Remove
//                         </button>
//                       )}
//                     </div>
//                   </div>

//                   <div className="mb-4 text-lg font-bold text-indigo-700">
//                     Price: ₹{travellerPrice(t)}
//                   </div>

//                   {fieldErrors.length > 0 && (
//                     <div className="mb-5 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
//                       {fieldErrors.map((e, i) => (
//                         <div key={i}>• {e}</div>
//                       ))}
//                     </div>
//                   )}

//                   <div className="grid md:grid-cols-3 gap-5">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">
//                         Package *
//                       </label>
//                       <select
//                         value={
//                           t.packageType === "main"
//                             ? "main"
//                             : (t.variantPackageIndex ?? "")
//                         }
//                         onChange={(e) => {
//                           const v = e.target.value;
//                           if (v === "main") {
//                             updateTraveller(idx, "packageType", "main");
//                             updateTraveller(idx, "variantPackageIndex", null);
//                           } else {
//                             updateTraveller(idx, "packageType", "variant");
//                             updateTraveller(
//                               idx,
//                               "variantPackageIndex",
//                               Number(v),
//                             );
//                           }
//                         }}
//                         disabled={!isTravellerEditable}
//                         className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
//                       >
//                         <option value="main">Main Package</option>
//                         {tour.variantPackage?.map((_, i) => (
//                           <option key={i} value={i}>
//                             Variant {i + 1}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">
//                         Title
//                       </label>
//                       <select
//                         value={t.title || ""}
//                         onChange={(e) =>
//                           updateTraveller(idx, "title", e.target.value)
//                         }
//                         disabled={!isTravellerEditable}
//                         className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
//                       >
//                         <option value="">Select</option>
//                         <option>Mr</option>
//                         <option>Mrs</option>
//                         <option>Ms</option>
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">
//                         First Name *
//                       </label>
//                       <input
//                         type="text"
//                         value={t.firstName || ""}
//                         onChange={(e) =>
//                           updateTraveller(idx, "firstName", e.target.value)
//                         }
//                         disabled={!isTravellerEditable}
//                         className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">
//                         Last Name
//                       </label>
//                       <input
//                         type="text"
//                         value={t.lastName || ""}
//                         onChange={(e) =>
//                           updateTraveller(idx, "lastName", e.target.value)
//                         }
//                         disabled={!isTravellerEditable}
//                         className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">
//                         Age *
//                       </label>
//                       <input
//                         type="number"
//                         value={t.age || ""}
//                         onChange={(e) =>
//                           updateTraveller(idx, "age", Number(e.target.value))
//                         }
//                         disabled={!isTravellerEditable}
//                         className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">
//                         Gender
//                       </label>
//                       <select
//                         value={t.gender || ""}
//                         onChange={(e) =>
//                           updateTraveller(idx, "gender", e.target.value)
//                         }
//                         disabled={!isTravellerEditable}
//                         className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
//                       >
//                         <option value="">Select</option>
//                         <option>Male</option>
//                         <option>Female</option>
//                         <option>Other</option>
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">
//                         Sharing *
//                       </label>
//                       <select
//                         value={t.sharingType || ""}
//                         onChange={(e) =>
//                           updateTraveller(idx, "sharingType", e.target.value)
//                         }
//                         disabled={!isTravellerEditable}
//                         className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
//                       >
//                         <option value="">Select</option>
//                         {Number(t.age) >= 11 ? (
//                           <>
//                             <option value="double">Double</option>
//                             <option value="triple">Triple</option>
//                           </>
//                         ) : Number(t.age) >= 6 && Number(t.age) <= 10 ? (
//                           <>
//                             <option value="withBerth">Child with Berth</option>
//                             <option value="withoutBerth">
//                               Child without Berth
//                             </option>
//                           </>
//                         ) : null}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">
//                         Boarding Point *
//                       </label>
//                       <select
//                         value={t.boardingPoint?.stationCode || ""}
//                         onChange={(e) => {
//                           const p = boardingOpts.find(
//                             (x) => x.stationCode === e.target.value,
//                           );
//                           updateTraveller(idx, "boardingPoint", p || null);
//                         }}
//                         disabled={!isBoardingEditable}
//                         className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
//                       >
//                         <option value="">Select</option>
//                         {boardingOpts.map((bp) => (
//                           <option key={bp.stationCode} value={bp.stationCode}>
//                             {bp.stationCode} - {bp.stationName}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">
//                         De-boarding Point *
//                       </label>
//                       <select
//                         value={t.deboardingPoint?.stationCode || ""}
//                         onChange={(e) => {
//                           const p = deboardingOpts.find(
//                             (x) => x.stationCode === e.target.value,
//                           );
//                           updateTraveller(idx, "deboardingPoint", p || null);
//                         }}
//                         disabled={!isBoardingEditable}
//                         className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
//                       >
//                         <option value="">Select</option>
//                         {deboardingOpts.map((dp) => (
//                           <option key={dp.stationCode} value={dp.stationCode}>
//                             {dp.stationCode} - {dp.stationName}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* ─────────────────────────────────────────────
//                         ADDONS — OLD flat dropdown, only when this
//                         traveller's package has NO trip-wise addon
//                         data (old bookings / old tours) OR this
//                         traveller already has a flat addon saved.
//                     ───────────────────────────────────────────── */}
//                     {!tripWise && (
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Add-on
//                         </label>
//                         <select
//                           value={t.selectedAddon?.name || ""}
//                           onChange={(e) => {
//                             const a = addonOpts.find(
//                               (x) => x.name === e.target.value,
//                             );
//                             updateTraveller(idx, "selectedAddon", {
//                               name: a?.name || "",
//                               price: a?.amount || 0,
//                             });
//                           }}
//                           disabled={!isTravellerEditable}
//                           className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
//                         >
//                           <option value="">None</option>
//                           {addonOpts.map((a) => (
//                             <option key={a._id || a.id} value={a.name}>
//                               {a.name} (+{a.amount || 0})
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                     )}

//                     <div className="md:col-span-3">
//                       <label className="block text-sm font-medium text-gray-700">
//                         Remarks (optional)
//                       </label>
//                       <textarea
//                         value={t.remarks || ""}
//                         onChange={(e) =>
//                           updateTraveller(idx, "remarks", e.target.value)
//                         }
//                         disabled={!isTravellerEditable}
//                         className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
//                         rows={3}
//                       />
//                     </div>
//                   </div>

//                   {/* ─────────────────────────────────────────────
//                       ADDONS — NEW train/flight-wise section, shown
//                       whenever THIS traveller's package has trip-wise
//                       addon data AND this traveller doesn't already
//                       have an old-style flat addon saved. Mirrors the
//                       TourBooking.jsx (user-facing) UI/logic.
//                   ───────────────────────────────────────────── */}
//                   {tripWise && (
//                     <div className="mt-6 pt-6 border-t border-gray-300">
//                       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
//                         <div>
//                           <div className="flex items-center gap-2">
//                             <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
//                               <Train className="w-5 h-5" />
//                             </div>
//                             <h4 className="text-base sm:text-lg font-bold text-gray-800">
//                               Train / Flight Add-ons
//                             </h4>
//                           </div>
//                           <p className="text-sm text-gray-500 mt-1">
//                             Select add-on per trip
//                           </p>
//                         </div>

//                         <div className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100">
//                           <span className="text-sm font-semibold text-gray-600">
//                             TOTAL ADD-ONS:
//                           </span>
//                           <span className="ml-2 text-base font-bold text-indigo-700">
//                             ₹{tripAddonsTotal}
//                           </span>
//                         </div>
//                       </div>

//                       {trainDetails.length > 0 && (
//                         <div className="mb-5">
//                           <p className="text-sm font-bold text-indigo-700 mb-2.5 flex items-center gap-1.5">
//                             <span>🚆</span> Train Add-ons
//                           </p>
//                           <div className="space-y-3">
//                             {trainDetails.map((train, tIdx) => (
//                               <div
//                                 key={train._id || `train-${tIdx}`}
//                                 className="border border-gray-200 rounded-xl p-4 bg-white"
//                               >
//                                 <div className="grid grid-cols-1 md:grid-cols-[60px_1fr_260px] gap-4 items-center">
//                                   <div className="flex md:justify-center">
//                                     <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
//                                       {String(tIdx + 1).padStart(2, "0")}
//                                     </div>
//                                   </div>

//                                   <div>
//                                     {train.tripType && (
//                                       <span className="inline-block mb-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase">
//                                         {train.tripType}
//                                       </span>
//                                     )}
//                                     <h5 className="text-base font-semibold text-gray-800">
//                                       {train.trainName}{" "}
//                                       <span className="text-gray-500 font-medium">
//                                         ({train.trainNo})
//                                       </span>
//                                     </h5>
//                                     <p className="text-sm text-gray-500 mt-1">
//                                       {train.fromStation}
//                                       <span className="mx-2 text-gray-400">→</span>
//                                       {train.toStation}
//                                     </p>
//                                   </div>

//                                   <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                                       Add-on
//                                     </label>
//                                     <select
//                                       value={getSelectedTripAddonId(
//                                         t,
//                                         pkg,
//                                         "train",
//                                         tIdx,
//                                       )}
//                                       onChange={(e) =>
//                                         handleTripAddonChange(
//                                           idx,
//                                           "train",
//                                           tIdx,
//                                           e.target.value,
//                                         )
//                                       }
//                                       disabled={!isTravellerEditable}
//                                       className="w-full px-3.5 py-3 rounded-lg border border-gray-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm disabled:bg-gray-200 disabled:cursor-not-allowed"
//                                     >
//                                       <option value="">No Add-on</option>
//                                       {(train.addons || []).map((a) => (
//                                         <option
//                                           key={a._id || a.id}
//                                           value={a._id || a.id}
//                                         >
//                                           {a.name} (+{a.amount || 0})
//                                         </option>
//                                       ))}
//                                     </select>
//                                   </div>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}

//                       {flightDetails.length > 0 && (
//                         <div>
//                           <p className="text-sm font-bold text-purple-700 mb-2.5 flex items-center gap-1.5">
//                             <span>✈️</span> Flight Add-ons
//                           </p>
//                           <div className="space-y-3">
//                             {flightDetails.map((flight, fIdx) => (
//                               <div
//                                 key={flight._id || `flight-${fIdx}`}
//                                 className="border border-gray-200 rounded-xl p-4 bg-white"
//                               >
//                                 <div className="grid grid-cols-1 md:grid-cols-[60px_1fr_260px] gap-4 items-center">
//                                   <div className="flex md:justify-center">
//                                     <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
//                                       {String(fIdx + 1).padStart(2, "0")}
//                                     </div>
//                                   </div>

//                                   <div>
//                                     {flight.tripType && (
//                                       <span className="inline-block mb-1 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold uppercase">
//                                         {flight.tripType}
//                                       </span>
//                                     )}
//                                     <h5 className="text-base font-semibold text-gray-800">
//                                       {flight.airline}{" "}
//                                       <span className="text-gray-500 font-medium">
//                                         ({flight.flightNo})
//                                       </span>
//                                     </h5>
//                                     <p className="text-sm text-gray-500 mt-1">
//                                       {flight.fromAirport}
//                                       <span className="mx-2 text-gray-400">→</span>
//                                       {flight.toAirport}
//                                     </p>
//                                   </div>

//                                   <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                                       Add-on
//                                     </label>
//                                     <select
//                                       value={getSelectedTripAddonId(
//                                         t,
//                                         pkg,
//                                         "flight",
//                                         fIdx,
//                                       )}
//                                       onChange={(e) =>
//                                         handleTripAddonChange(
//                                           idx,
//                                           "flight",
//                                           fIdx,
//                                           e.target.value,
//                                         )
//                                       }
//                                       disabled={!isTravellerEditable}
//                                       className="w-full px-3.5 py-3 rounded-lg border border-gray-200 bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm disabled:bg-gray-200 disabled:cursor-not-allowed"
//                                     >
//                                       <option value="">No Add-on</option>
//                                       {(flight.addons || []).map((a) => (
//                                         <option
//                                           key={a._id || a.id}
//                                           value={a._id || a.id}
//                                         >
//                                           {a.name} (+{a.amount || 0})
//                                         </option>
//                                       ))}
//                                     </select>
//                                   </div>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ManageBooking;


import React, { useContext, useEffect, useState, useMemo } from "react";
import { TourContext } from "../../context/TourContext";
import {
  CalendarCheck,
  Loader2,
  AlertCircle,
  Mail,
  MapPin,
  Users,
  Save,
  MessageSquare,
  IndianRupee,
  PlusCircle,
  Trash2,
  Train,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const trainClasses = [
  { value: "3A", label: "3A - Three tier AC" },
  { value: "2A", label: "2A - Two tier AC" },
  { value: "1A", label: "1A - First AC" },
  { value: "3E", label: "3E - Three tier economy AC" },
  { value: "SL", label: "SL - Sleeper" },
  { value: "2S", label: "2S - Second sitting" },
  { value: "CC", label: "CC - Chair car AC" },
  { value: "EC", label: "EC - Executive chair car AC" },
];

const flightClasses = [
  { value: "Economy", label: "Economy" },
  { value: "Business", label: "Business" },
  { value: "First", label: "First Class" },
];

// ─────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for "which trains/flights does this
// package show, and in what order". Used identically by:
//   - the dropdown rendering (what the admin sees, with its index)
//   - handleTripAddonChange (which trip a selection applies to)
//   - getSelectedTripAddonId (which trip a saved selection matches)
// Package data can contain empty/garbage entries (no trainName,
// no trainNo) — those are filtered out here. If any ONE of these
// three places used a different (unfiltered) list, the same
// tripIndex would point at a DIFFERENT physical trip in each place
// — silently replacing/reading the wrong trip's addon. That was
// the root cause of "changing one addon corrupts the total".
const getFilteredTrainDetails = (pkg) =>
  (pkg?.trainDetails || []).filter(
    (tr) => tr && (tr.trainName?.trim() || tr.trainNo?.trim()),
  );

const getFilteredFlightDetails = (pkg) =>
  (pkg?.flightDetails || []).filter(
    (fl) => fl && (fl.airline?.trim() || fl.flightNo?.trim()),
  );

// ─────────────────────────────────────────────────────────────
// Does this PACKAGE (main tour or a variant) actually offer any
// trip-wise (train/flight leg) add-ons at all? Checked per package,
// not per booking — a traveller's package (main vs a specific
// variant) can differ from another traveller's in the same booking,
// and each package can have its own train/flight addon config.
const packageHasTripWiseAddons = (pkg) => {
  const trainList = getFilteredTrainDetails(pkg);
  const flightList = getFilteredFlightDetails(pkg);
  const trainHasAddons = trainList.some(
    (tr) => Array.isArray(tr.addons) && tr.addons.length > 0,
  );
  const flightHasAddons = flightList.some(
    (fl) => Array.isArray(fl.addons) && fl.addons.length > 0,
  );
  return trainHasAddons || flightHasAddons;
};

// Newer bookings (created via the user-facing Booking.jsx) store the
// flat addon INSIDE the selectedAddons[] array with a `flat: true`
// marker, instead of the older singular t.selectedAddon field. This
// finds that entry, if present.
const getArrayFlatAddon = (t) => {
  if (!Array.isArray(t?.selectedAddons)) return null;
  return t.selectedAddons.find((a) => a?.flat === true) || null;
};

// Does this specific traveller have an old-style FLAT addon saved
// (name + non-zero price)? Checks BOTH the legacy singular
// t.selectedAddon field AND the newer array-based { flat: true } entry
// inside t.selectedAddons — either one means "this traveller already
// has a flat addon on record", which decides (for a package that DOES
// support trip-wise addons) whether to still show the flat dropdown
// for THIS traveller rather than the trip-wise UI.
const travellerHasFlatAddon = (t) => {
  const a = t?.selectedAddon;
  if (a && typeof a === "object") {
    const hasName = typeof a.name === "string" && a.name.trim().length > 0;
    const hasPrice = typeof a.price === "number" && a.price !== 0;
    if (hasName || hasPrice) return true;
  }
  return !!getArrayFlatAddon(t);
};

const ManageBooking = () => {
  const [bookingId, setBookingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);
  const [tour, setTour] = useState(null);
  const [originalBooking, setOriginalBooking] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [balanceInfo, setBalanceInfo] = useState(null);

  const [balanceHistory, setBalanceHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const { viewBooking, getTourList, tourList, getManagedBookingsHistory } =
    useContext(TourContext);

  useEffect(() => {
    if (tourList.length === 0) getTourList();
  }, [tourList, getTourList]);

  const isFullyPaid = useMemo(() => {
    if (!booking?.payment) return false;
    return (
      booking.payment.advance.paid === true &&
      booking.payment.balance.paid === true
    );
  }, [booking]);

  const handleGetDetails = async () => {
    if (!bookingId.trim()) return setError("Enter a Booking ID");

    setLoading(true);
    setError("");
    setBooking(null);
    setTour(null);
    setValidationErrors({});
    setBalanceInfo(null);
    setBalanceHistory([]);

    const res = await viewBooking(bookingId.trim());
    if (!res.success) {
      setError(res.message || "Failed to load booking");
      setLoading(false);
      return;
    }

    const loadedBooking = res.booking;
    const rawTourId = loadedBooking.tourId?._id || loadedBooking.tourId;
    const tourId =
      typeof rawTourId === "object" ? rawTourId.toString() : rawTourId;

    const foundTour = tourList.find((t) => t._id === tourId);
    if (!foundTour) {
      setError("Tour data not found. Please refresh or contact support.");
      setLoading(false);
      return;
    }

    setTour(foundTour);
    setBooking(loadedBooking);
    setOriginalBooking(JSON.parse(JSON.stringify(loadedBooking)));
    setLoading(false);
  };

  const addNewTraveller = () => {
    const newTraveller = {
      title: "Mr",
      firstName: "",
      lastName: "",
      age: "",
      gender: "Male", // default for Mr
      packageType: "main",
      variantPackageIndex: null,
      sharingType: "",
      // Both kept in sync so whichever UI (flat vs trip-wise) ends up
      // rendering for this traveller's package has the field it needs.
      selectedAddon: null,
      selectedAddons: [],
      boardingPoint: null,
      deboardingPoint: null,
      remarks: "",
    };

    setBooking((prev) => ({
      ...prev,
      travellers: [...(prev.travellers || []), newTraveller],
    }));

    toast.info("New traveller added. Fill details and save.");
  };

  const removeTraveller = (index) => {
    const travellerToRemove = booking.travellers[index];

    // Only show serious warning if this is an EXISTING traveller (has _id)
    if (travellerToRemove._id) {
      const warningMessage =
        "WARNING: Removing this existing traveller will reset all advance and balance payments for the entire booking.\n\n" +
        "This action effectively treats the booking as new — no prior payment history, calculations, or records will be carried forward for this traveller.\n\n" +
        "Please consult with the admin team before proceeding to avoid unintended financial adjustments.\n\n" +
        "Are you sure you want to continue?";

      if (!window.confirm(warningMessage)) {
        return; // User cancelled → do nothing
      }
    }

    // Proceed with removal (no warning for newly added travellers)
    setBooking((prev) => ({
      ...prev,
      travellers: prev.travellers.filter((_, i) => i !== index),
    }));

    toast.info("Traveller removed. Save to confirm.");
  };

  const getPackage = (traveller) => {
    if (!tour) return null;
    return traveller.packageType === "main"
      ? tour
      : tour.variantPackage?.[traveller.variantPackageIndex] || null;
  };

  const resetTravellerFields = (idx, fieldsToReset = {}) => {
    const upd = { ...booking };
    const t = upd.travellers[idx];
    const defaults = {
      sharingType: "",
      selectedAddon: null,
      selectedAddons: [],
      boardingPoint: null,
      deboardingPoint: null,
    };
    Object.assign(t, { ...defaults, ...fieldsToReset });
    setBooking(upd);
  };

  const updateTraveller = (idx, field, value) => {
    const upd = { ...booking };
    const t = upd.travellers[idx];
    const ORIG = originalBooking?.travellers?.[idx];

    // Bidirectional sync: Title ↔ Gender
    if (field === "title") {
      if (value === "Mr") {
        t.gender = "Male";
      } else if (value === "Mrs" || value === "Ms") {
        t.gender = "Female";
      }
    } else if (field === "gender") {
      if (value === "Male") {
        t.title = "Mr";
      } else if (value === "Female") {
        t.title = "Ms"; // Default to Ms for Female (user can manually change to Mrs)
      }
    }

    if (field === "packageType" || field === "variantPackageIndex") {
      const newPkg = field === "packageType" ? value : t.packageType;
      const newIdx =
        field === "variantPackageIndex" ? value : t.variantPackageIndex;

      t.packageType = newPkg;
      if (field === "variantPackageIndex") t.variantPackageIndex = newIdx;

      const pkgChanged =
        t.packageType !== ORIG?.packageType ||
        t.variantPackageIndex !== ORIG?.variantPackageIndex;

      if (pkgChanged) {
        resetTravellerFields(idx);
      }

      setBooking(upd);
      return;
    }

    t[field] = value;
    setBooking(upd);
  };

  // ─────────────────────────────────────────────────────────
  // Flat addon change — writes into t.selectedAddon as an OBJECT
  // ({ name, price }), matching the correct/authoritative shape:
  // flat (single, non-trip) addons are an object on selectedAddon,
  // trip-wise (train/flight leg) addons are the ONLY thing that
  // belongs in the selectedAddons[] array. Also strips any stray
  // array-based flat entry (from earlier data) so a traveller never
  // ends up with the addon recorded in both places at once.
  // ─────────────────────────────────────────────────────────
  const handleFlatAddonChange = (travellerIdx, addonName, addonOpts) => {
    const upd = { ...booking };
    const t = upd.travellers[travellerIdx];

    // Strip any legacy array-based flat entry, if one exists.
    if (Array.isArray(t.selectedAddons)) {
      t.selectedAddons = t.selectedAddons.filter((a) => a?.flat !== true);
    }

    if (!addonName) {
      t.selectedAddon = null;
      setBooking(upd);
      return;
    }

    const matched = addonOpts.find((a) => a.name === addonName);
    t.selectedAddon = matched
      ? { name: matched.name, price: Number(matched.amount) || 0 }
      : null;

    setBooking(upd);
  };

  // ─────────────────────────────────────────────────────────
  // Trip-wise addon change (NEW bookings only — package has
  // trainDetails/flightDetails addons). Mirrors TourBooking.jsx's
  // handleAddonChange so the same selectedAddons[] shape is used
  // on both the user-facing booking page and here.
  // ─────────────────────────────────────────────────────────
  const normalizeAddonEntry = (a, refList) => {
    const list = refList || [];
    const wantedType = (a.tripType || "").trim().toUpperCase();

    const matchWithinType = (predicate) => {
      if (!wantedType) return -1;
      for (let i = 0; i < list.length; i++) {
        const entry = list[i];
        if ((entry.tripType || "").trim().toUpperCase() !== wantedType)
          continue;
        if (!predicate || predicate(entry)) return i;
      }
      return -1;
    };

    if (a.trainNo || a.trainName) {
      let idx = matchWithinType(
        (tr) =>
          (a.trainNo && tr.trainNo === a.trainNo) ||
          (a.trainName && tr.trainName === a.trainName),
      );
      if (idx === -1) idx = matchWithinType(null);
      if (idx === -1) {
        idx = list.findIndex(
          (tr) =>
            (a.trainNo && tr.trainNo === a.trainNo) ||
            (a.trainName && tr.trainName === a.trainName),
        );
      }
      if (idx !== -1) return { tripKind: "train", tripIndex: idx };
    }
    if (a.flightNo || a.airline) {
      let idx = matchWithinType(
        (fl) =>
          (a.flightNo && fl.flightNo === a.flightNo) ||
          (a.airline && fl.airline === a.airline),
      );
      if (idx === -1) idx = matchWithinType(null);
      if (idx === -1) {
        idx = list.findIndex(
          (fl) =>
            (a.flightNo && fl.flightNo === a.flightNo) ||
            (a.airline && fl.airline === a.airline),
        );
      }
      if (idx !== -1) return { tripKind: "flight", tripIndex: idx };
    }
    if (a.tripKind && a.tripIndex !== undefined && a.tripIndex !== null) {
      return { tripKind: a.tripKind, tripIndex: Number(a.tripIndex) };
    }
    if (a.trainIndex !== undefined && a.trainIndex !== null) {
      return { tripKind: "train", tripIndex: Number(a.trainIndex) };
    }
    return { tripKind: undefined, tripIndex: undefined };
  };

  const tripOrderRank = (tripType) => {
    const t = (tripType || "").toUpperCase();
    if (t.startsWith("BOARD")) return 0;
    if (t.startsWith("MIDDLE")) return 1;
    if (t.startsWith("DEBOARD") || t.startsWith("DEBOARF")) return 2;
    return 3;
  };

  const sortAddonsForStorage = (addons) =>
    [...addons].sort((a, b) => {
      const rankDiff = tripOrderRank(a.tripType) - tripOrderRank(b.tripType);
      if (rankDiff !== 0) return rankDiff;
      const ai = a.tripIndex ?? a.trainIndex ?? 0;
      const bi = b.tripIndex ?? b.trainIndex ?? 0;
      return ai - bi;
    });

  const handleTripAddonChange = (travellerIdx, tripKind, tripIndex, addonId) => {
    const upd = { ...booking };
    const t = upd.travellers[travellerIdx];
    const pkg = getPackage(t);

    const list =
      tripKind === "train"
        ? getFilteredTrainDetails(pkg)
        : getFilteredFlightDetails(pkg);
    const trip = list[tripIndex];
    if (!trip) return;

    let selectedAddons = Array.isArray(t.selectedAddons)
      ? [...t.selectedAddons]
      : [];

    selectedAddons = selectedAddons.filter((a) => {
      const norm = normalizeAddonEntry(a, list);
      return !(norm.tripKind === tripKind && norm.tripIndex === tripIndex);
    });

    if (addonId) {
      const found = (trip.addons || []).find(
        (a) => String(a._id || a.id) === String(addonId),
      );
      if (found) {
        selectedAddons.push({
          tripKind,
          tripIndex,
          ...(tripKind === "train" ? { trainIndex: tripIndex } : {}),
          trainNo: trip.trainNo,
          trainName: trip.trainName,
          flightNo: trip.flightNo,
          airline: trip.airline,
          tripType: trip.tripType,
          addonId: found._id || found.id,
          name: found.name,
          amount: Number(found.amount) || 0,
          addedAt: new Date(),
        });
      }
    }

    t.selectedAddons = sortAddonsForStorage(selectedAddons);
    setBooking(upd);
  };

  const getSelectedTripAddonId = (traveller, pkg, tripKind, tripIndex) => {
    const list = Array.isArray(traveller.selectedAddons)
      ? traveller.selectedAddons
      : [];
    const refList =
      tripKind === "train"
        ? getFilteredTrainDetails(pkg)
        : getFilteredFlightDetails(pkg);
    const match = list.find((a) => {
      const norm = normalizeAddonEntry(a, refList);
      return norm.tripKind === tripKind && norm.tripIndex === tripIndex;
    });
    if (!match) return "";
    const raw = match.addonId;
    const rawId =
      raw && typeof raw === "object" && raw.$oid
        ? String(raw.$oid)
        : String(raw ?? "");

    const trip = refList[tripIndex];
    const availableAddons = trip?.addons || [];

    if (availableAddons.some((a) => String(a._id || a.id) === rawId)) {
      return rawId;
    }

    const byName = availableAddons.find((a) => a.name === match.name);
    if (byName) return String(byName._id || byName.id);

    return "";
  };

  const updateNested = (path, value) => {
    const parts = path.split(".");
    const upd = { ...booking };
    let ref = upd;
    for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]];
    ref[parts[parts.length - 1]] = value;
    setBooking(upd);
  };

  const hasChanges = useMemo(() => {
    if (!originalBooking || !booking) return false;
    return JSON.stringify(booking) !== JSON.stringify(originalBooking);
  }, [booking, originalBooking]);

  const travellerPrice = (t) => {
    const pkg =
      t.packageType === "main"
        ? tour
        : (tour.variantPackage?.[t.variantPackageIndex] ?? tour);

    let base = 0;
    switch (t.sharingType) {
      case "double":
        base = pkg?.price?.doubleSharing ?? 0;
        break;
      case "triple":
        base = pkg?.price?.tripleSharing ?? 0;
        break;
      case "withBerth":
        base = pkg?.price?.childWithBerth ?? 0;
        break;
      case "withoutBerth":
        base = pkg?.price?.childWithoutBerth ?? 0;
        break;
      default:
        base = pkg?.price?.doubleSharing ?? 0;
    }

    const flatAddon = t.selectedAddon?.price ?? 0;
    const tripAddonsTotal = Array.isArray(t.selectedAddons)
      ? t.selectedAddons.reduce((sum, a) => sum + (Number(a.amount) || 0), 0)
      : 0;

    return base + flatAddon + tripAddonsTotal;
  };

  const validateBeforeSave = () => {
    const errors = {};
    let hasError = false;

    booking.travellers.forEach((t, idx) => {
      if (t.cancelled?.byAdmin || t.cancelled?.byTraveller) return;

      const errKey = `traveller_${idx}`;
      const err = [];

      if (
        !t.packageType ||
        (t.packageType === "variant" && t.variantPackageIndex === null)
      )
        err.push("Valid package must be selected");
      if (!t.sharingType) err.push("Sharing type is required");
      if (!t.boardingPoint?.stationCode) err.push("Boarding point is required");
      if (!t.deboardingPoint?.stationCode)
        err.push("De-boarding point is required");
      if (!t.firstName?.trim()) err.push("First name is required");
      if (!t.age || isNaN(t.age) || t.age < 1)
        err.push("Valid age is required");

      if (err.length) {
        errors[errKey] = err;
        hasError = true;
      }
    });

    setValidationErrors(errors);
    return !hasError;
  };

  const handleSaveUpdate = async () => {
    if (!hasChanges) {
      toast.info("No changes to save.");
      return;
    }

    if (!validateBeforeSave()) {
      toast.error("Please fix validation errors before saving.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const updates = {
        travellers: booking.travellers.map((t) => ({
          _id: t._id || undefined,
          title: t.title || "",
          firstName: t.firstName?.trim() || "",
          lastName: t.lastName?.trim() || "",
          age: Number(t.age) || null,
          gender: t.gender || "",
          packageType: t.packageType || "main",
          variantPackageIndex: t.variantPackageIndex ?? null,
          sharingType: t.sharingType || "",

          selectedAddon: t.selectedAddon
            ? { name: t.selectedAddon.name, price: t.selectedAddon.price }
            : null,

          // selectedAddons is reserved for trip-wise (train/flight leg)
          // addons only — filter out any stray flat-marked entry so it
          // never gets saved here (it belongs in selectedAddon above).
          selectedAddons: Array.isArray(t.selectedAddons)
            ? sortAddonsForStorage(
                t.selectedAddons.filter((a) => a?.flat !== true),
              ).map((a) => ({
                tripKind: a.tripKind,
                tripIndex: a.tripIndex,
                trainNo: a.trainNo,
                trainName: a.trainName,
                flightNo: a.flightNo,
                airline: a.airline,
                tripType: a.tripType,
                addonId: a.addonId,
                name: a.name,
                amount: Number(a.amount) || 0,
              }))
            : [],

          boardingPoint: t.boardingPoint ? { ...t.boardingPoint } : null,
          deboardingPoint: t.deboardingPoint ? { ...t.deboardingPoint } : null,
          remarks: t.remarks?.trim() || "",
        })),

        contact: {},
        billingAddress: {},
      };

      if (booking.contact?.email !== originalBooking?.contact?.email) {
        updates.contact.email = booking.contact.email?.trim();
      }
      if (booking.contact?.mobile !== originalBooking?.contact?.mobile) {
        updates.contact.mobile = booking.contact.mobile?.trim();
      }

      const billingFields = [
        "addressLine1",
        "addressLine2",
        "city",
        "state",
        "pincode",
        "country",
      ];
      billingFields.forEach((f) => {
        if (
          booking.billingAddress?.[f] !== originalBooking?.billingAddress?.[f]
        ) {
          updates.billingAddress[f] = booking.billingAddress[f]?.trim() || "";
        }
      });

      if (!Object.keys(updates.contact).length) delete updates.contact;
      if (!Object.keys(updates.billingAddress).length)
        delete updates.billingAddress;

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tour/manage-booking-balance/${booking._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ttoken: localStorage.getItem("ttoken"),
          },
          body: JSON.stringify({ updates }),
        },
      );

      const result = await response.json();

      if (result.success) {
        toast.success(
          "Update request raised! Boarding/De-boarding updated (fully paid booking).",
        );

        setBalanceInfo({
          gvPool: result.data?.gvCancellationPool,
          irctcPool: result.data?.irctcCancellationPool,
        });

        setOriginalBooking(JSON.parse(JSON.stringify(booking)));

        const res = await getManagedBookingsHistory();
        if (res.success && Array.isArray(res.data)) {
          const filtered = res.data
            .filter(
              (e) =>
                e.originalBooking?._id?.toString() === booking._id.toString(),
            )
            .sort((a, b) => {
              const dateA = new Date(a.raisedAt || a.createdAt || 0);
              const dateB = new Date(b.raisedAt || b.createdAt || 0);
              return dateB - dateA; // newest first
            });

          setBalanceHistory(filtered);
        }
      } else {
        toast.error(result.message || "Failed to raise update request");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Network or server error");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!booking?._id) return;

    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError("");
      setBalanceHistory([]);

      try {
        const res = await getManagedBookingsHistory();
        if (res.success && Array.isArray(res.data)) {
          const filtered = res.data
            .filter(
              (e) =>
                e.originalBooking?._id?.toString() === booking._id.toString(),
            )
            .sort((a, b) => {
              const dateA = new Date(a.raisedAt || a.createdAt || 0);
              const dateB = new Date(b.raisedAt || b.createdAt || 0);
              return dateB - dateA; // newest first
            });

          setBalanceHistory(filtered);
        }
      } catch (err) {
        console.error("History fetch error:", err);
        setHistoryError("Failed to load balance update history");
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [booking?._id, getManagedBookingsHistory]);

  const formatHistoryDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="relative max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <ToastContainer position="top-right" autoClose={4000} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-6 mb-8 gap-4">
        <div className="flex items-center gap-6">
          <CalendarCheck className="w-11 h-11 text-indigo-600 flex-shrink-0" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800">
            Booking Controller
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          {booking && (
            <button
              onClick={handleSaveUpdate}
              disabled={saving || !hasChanges}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
                saving || !hasChanges
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Update
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto mb-10">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Enter TNR
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Paste TNR here..."
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGetDetails()}
            className="flex-1 px-6 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 shadow-sm transition-all"
          />
          <button
            onClick={handleGetDetails}
            disabled={loading}
            className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-lg transition-all transform hover:scale-105"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin inline mr-2" />
                Loading...
              </>
            ) : (
              "Get Details"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-7 h-7 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {booking && tour && (
        <div className="space-y-10">
          {isFullyPaid && (
            <div className="p-6 bg-green-100 border-2 border-green-600 rounded-xl text-green-900 font-bold text-center text-lg shadow-md">
              This booking is FULLY PAID
              <br />
              <span className="text-base font-medium">
                All fields are LOCKED except Boarding Point & De-boarding Point.
                <br />
                You can only change boarding/de-boarding locations.
              </span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                TNR
              </label>
              <input
                type="text"
                value={booking.tnr}
                disabled
                className="mt-2 w-full px-4 py-3 border rounded-lg bg-gray-100 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tour Title
              </label>
              <input
                type="text"
                value={tour.title}
                disabled
                className="mt-2 w-full px-4 py-3 border rounded-lg bg-gray-100"
              />
            </div>
          </div>

          {booking.adminRemarks?.length > 0 && (
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
              <h3 className="flex items-center gap-2 font-bold mb-4 text-yellow-800 text-lg">
                <MessageSquare className="w-6 h-6" /> Admin Remarks
              </h3>
              <div className="space-y-3">
                {booking.adminRemarks.map((remark, i) => {
                  const amount = Number(remark.amount) || 0;
                  const isNegative = amount < 0;
                  const date = new Date(remark.addedAt);
                  const formattedDate = date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  const formattedTime = date.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });

                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-lg text-sm font-medium border ${
                        isNegative
                          ? "bg-red-50 text-red-800 border-red-200"
                          : "bg-green-50 text-green-800 border-green-200"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">
                          {isNegative ? "-₹" : "+₹"}
                          {Math.abs(amount)}
                        </span>
                        <span className="text-sm opacity-75">
                          {formattedDate} at {formattedTime}
                        </span>
                      </div>
                      <div className="mt-1">{remark.remark}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(booking.gvCancellationPool !== undefined ||
            booking.irctcCancellationPool !== undefined) && (
            <div className="p-6 bg-purple-50 border border-purple-200 rounded-xl">
              <h3 className="flex items-center gap-2 font-bold mb-4 text-purple-800 text-lg">
                <IndianRupee className="w-6 h-6" /> Cancellation Pools
              </h3>
              <div className="grid grid-cols-2 gap-6 text-base">
                {booking.gvCancellationPool !== undefined && (
                  <div>
                    <span className="font-medium">GV Pool:</span>{" "}
                    <span className="font-bold text-purple-700">
                      ₹{booking.gvCancellationPool}
                    </span>
                  </div>
                )}
                {booking.irctcCancellationPool !== undefined && (
                  <div>
                    <span className="font-medium">IRCTC Pool:</span>{" "}
                    <span className="font-bold text-purple-700">
                      ₹{booking.irctcCancellationPool}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="flex items-center gap-2 font-bold text-indigo-800 text-lg">
                <IndianRupee className="w-6 h-6" />
                Balance Update History
              </h3>
              <button
                onClick={async () => {
                  setHistoryLoading(true);
                  const res = await getManagedBookingsHistory();
                  if (res.success && Array.isArray(res.data)) {
                    const filtered = res.data
                      .filter(
                        (e) =>
                          e.originalBooking?._id?.toString() ===
                          booking._id.toString(),
                      )
                      .sort((a, b) => {
                        const dateA = new Date(a.raisedAt || a.createdAt || 0);
                        const dateB = new Date(b.raisedAt || b.createdAt || 0);
                        return dateB - dateA; // newest first
                      });

                    setBalanceHistory(filtered);
                  }
                  setHistoryLoading(false);
                }}
                className="text-sm text-indigo-600 hover:underline font-medium"
                disabled={historyLoading}
              >
                {historyLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {historyLoading && (
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" />
                Loading history...
              </div>
            )}

            {historyError && (
              <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center text-red-800 font-medium">
                {historyError}
              </div>
            )}

            {!historyLoading &&
              !historyError &&
              balanceHistory.length === 0 && (
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center text-yellow-800 font-medium">
                  No balance update history found for this booking.
                </div>
              )}

            {!historyLoading && !historyError && balanceHistory.length > 0 && (
              <div className="space-y-4">
                {balanceHistory.map((entry) => {
                  const isApproved = entry.approvedBy;

                  const displayDate = entry.raisedAt || entry.createdAt;
                  const formattedDate = displayDate
                    ? new Date(displayDate).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    : "N/A";

                  return (
                    <div
                      key={entry._id}
                      className={`p-5 rounded-xl border text-sm font-medium transition-all ${
                        isApproved
                          ? "bg-green-50 text-green-800 border-green-300"
                          : "bg-red-50 text-red-800 border-red-300"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="font-bold text-lg">
                            {isApproved ? "Approved" : "Not Approved"}
                          </span>
                        </div>
                        <span className="text-xs opacity-75">
                          {formattedDate}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium">Old Advance:</span>{" "}
                          <span className="font-bold">
                            ₹{entry.originalBooking?.advancePaid || 0}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Old Balance:</span>{" "}
                          <span className="font-bold">
                            ₹{entry.originalBooking?.balanceDue || 0}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">New Advance:</span>{" "}
                          <span className="font-bold text-green-700">
                            ₹{entry.requested?.updatedAdvance || 0}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">New Balance:</span>{" "}
                          <span className="font-bold text-green-700">
                            ₹{entry.requested?.updatedBalance || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="p-6 bg-blue-50 rounded-xl">
            <h3 className="flex items-center gap-2 font-bold mb-5 text-blue-800 text-lg">
              <Mail className="w-6 h-6" /> Contact
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Advance amount
                </label>
                <input
                  value={booking.payment?.advance?.amount || ""}
                  disabled={true}
                  className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                />
                <input
                  value={booking.payment?.advance?.paid || "Not paid"}
                  disabled={true}
                  className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Balance amount
                </label>
                <input
                  value={booking.payment?.balance?.amount || ""}
                  disabled={true}
                  className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                />
                <input
                  value={booking.payment?.balance?.paid || "Not paid"}
                  disabled={true}
                  className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-blue-50 rounded-xl">
            <h3 className="flex items-center gap-2 font-bold mb-5 text-blue-800 text-lg">
              <Mail className="w-6 h-6" /> Contact
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={booking.contact?.email || ""}
                  onChange={(e) =>
                    updateNested("contact.email", e.target.value)
                  }
                  disabled={isFullyPaid}
                  className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mobile
                </label>
                <input
                  type="text"
                  value={booking.contact?.mobile || ""}
                  onChange={(e) =>
                    updateNested("contact.mobile", e.target.value)
                  }
                  disabled={isFullyPaid}
                  className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-green-50 rounded-xl">
            <h3 className="flex items-center gap-2 font-bold mb-5 text-green-800 text-lg">
              <MapPin className="w-6 h-6" /> Billing Address
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "addressLine1",
                "addressLine2",
                "city",
                "state",
                "pincode",
                "country",
              ].map((f) => (
                <div key={f}>
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {f.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <input
                    type="text"
                    value={booking.billingAddress?.[f] || ""}
                    onChange={(e) =>
                      updateNested(`billingAddress.${f}`, e.target.value)
                    }
                    disabled={isFullyPaid}
                    className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="flex items-center gap-3 font-bold text-gray-800 text-xl">
                <Users className="w-8 h-8" /> Travellers
                <span className="text-lg text-gray-600">
                  ({booking.travellers.length})
                </span>
              </h3>

              {!isFullyPaid && (
                <button
                  onClick={addNewTraveller}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all"
                >
                  <PlusCircle className="w-5 h-5" />
                  Add New Traveller
                </button>
              )}
            </div>

            {booking.travellers.map((t, idx) => {
              const isCancelled =
                t.cancelled?.byAdmin || t.cancelled?.byTraveller;
              const pkg = getPackage(t);
              const boardingOpts =
                t.packageType === "main"
                  ? tour.boardingPoints || []
                  : pkg?.boardingPoints || [];
              const deboardingOpts =
                t.packageType === "main"
                  ? tour.deboardingPoints || []
                  : pkg?.deboardingPoints || [];
              const addonOpts =
                t.packageType === "main"
                  ? tour.addons || []
                  : pkg?.addons || [];

              // ── Flat vs trip-wise decision — PER TRAVELLER, based on
              // THIS traveller's package:
              //   1. If the package has NO trip-wise (train/flight leg)
              //      addons configured at all → always flat UI (nothing
              //      else to show).
              //   2. If the package DOES have trip-wise addons:
              //      a. Traveller already has an old-style flat addon
              //         saved on their record → keep showing flat UI
              //         (so their existing selection stays visible/
              //         editable, doesn't silently disappear).
              //      b. Otherwise (no flat addon — whether they have
              //         trip-wise addons saved already, or none at
              //         all) → trip-wise UI, since that's what the
              //         package actually offers.
              const pkgTripWiseCapable = packageHasTripWiseAddons(pkg);
              const tripWise =
                pkgTripWiseCapable && !travellerHasFlatAddon(t);
              const trainDetails = getFilteredTrainDetails(pkg);
              const flightDetails = getFilteredFlightDetails(pkg);
              const tripAddonsTotal = Array.isArray(t.selectedAddons)
                ? t.selectedAddons.reduce(
                    (sum, a) => sum + (Number(a.amount) || 0),
                    0,
                  )
                : 0;

              const errKey = `traveller_${idx}`;
              const fieldErrors = validationErrors[errKey] || [];

              const isNew = !t._id;

              const isTravellerEditable = !isFullyPaid && !isCancelled;
              const isBoardingEditable = !isCancelled;

              return (
                <div
                  key={idx}
                  className={`mb-8 p-6 border-2 rounded-xl relative ${isCancelled ? "bg-red-50 border-red-300 opacity-75" : "bg-gray-50 border-gray-300"}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-800">
                      Traveller {idx + 1}
                      {isNew && (
                        <span className="ml-2 text-sm text-indigo-600 font-medium">
                          (New)
                        </span>
                      )}
                    </h4>

                    <div className="flex items-center gap-4">
                      {isCancelled && (
                        <span className="text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                          Cancelled – No edits
                        </span>
                      )}

                      {!isCancelled && !isFullyPaid && (
                        <button
                          onClick={() => removeTraveller(idx)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mb-4 text-lg font-bold text-indigo-700">
                    Price: ₹{travellerPrice(t)}
                  </div>

                  {fieldErrors.length > 0 && (
                    <div className="mb-5 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                      {fieldErrors.map((e, i) => (
                        <div key={i}>• {e}</div>
                      ))}
                    </div>
                  )}

                  <div className="grid md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Package *
                      </label>
                      <select
                        value={
                          t.packageType === "main"
                            ? "main"
                            : (t.variantPackageIndex ?? "")
                        }
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "main") {
                            updateTraveller(idx, "packageType", "main");
                            updateTraveller(idx, "variantPackageIndex", null);
                          } else {
                            updateTraveller(idx, "packageType", "variant");
                            updateTraveller(
                              idx,
                              "variantPackageIndex",
                              Number(v),
                            );
                          }
                        }}
                        disabled={!isTravellerEditable}
                        className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                      >
                        <option value="main">Main Package</option>
                        {tour.variantPackage?.map((_, i) => (
                          <option key={i} value={i}>
                            Variant {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <select
                        value={t.title || ""}
                        onChange={(e) =>
                          updateTraveller(idx, "title", e.target.value)
                        }
                        disabled={!isTravellerEditable}
                        className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                      >
                        <option value="">Select</option>
                        <option>Mr</option>
                        <option>Mrs</option>
                        <option>Ms</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={t.firstName || ""}
                        onChange={(e) =>
                          updateTraveller(idx, "firstName", e.target.value)
                        }
                        disabled={!isTravellerEditable}
                        className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={t.lastName || ""}
                        onChange={(e) =>
                          updateTraveller(idx, "lastName", e.target.value)
                        }
                        disabled={!isTravellerEditable}
                        className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Age *
                      </label>
                      <input
                        type="number"
                        value={t.age || ""}
                        onChange={(e) =>
                          updateTraveller(idx, "age", Number(e.target.value))
                        }
                        disabled={!isTravellerEditable}
                        className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Gender
                      </label>
                      <select
                        value={t.gender || ""}
                        onChange={(e) =>
                          updateTraveller(idx, "gender", e.target.value)
                        }
                        disabled={!isTravellerEditable}
                        className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                      >
                        <option value="">Select</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Sharing *
                      </label>
                      <select
                        value={t.sharingType || ""}
                        onChange={(e) =>
                          updateTraveller(idx, "sharingType", e.target.value)
                        }
                        disabled={!isTravellerEditable}
                        className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                      >
                        <option value="">Select</option>
                        {Number(t.age) >= 11 ? (
                          <>
                            <option value="double">Double</option>
                            <option value="triple">Triple</option>
                          </>
                        ) : Number(t.age) >= 6 && Number(t.age) <= 10 ? (
                          <>
                            <option value="withBerth">Child with Berth</option>
                            <option value="withoutBerth">
                              Child without Berth
                            </option>
                          </>
                        ) : null}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Boarding Point *
                      </label>
                      <select
                        value={t.boardingPoint?.stationCode || ""}
                        onChange={(e) => {
                          const p = boardingOpts.find(
                            (x) => x.stationCode === e.target.value,
                          );
                          updateTraveller(idx, "boardingPoint", p || null);
                        }}
                        disabled={!isBoardingEditable}
                        className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                      >
                        <option value="">Select</option>
                        {boardingOpts.map((bp) => (
                          <option key={bp.stationCode} value={bp.stationCode}>
                            {bp.stationCode} - {bp.stationName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        De-boarding Point *
                      </label>
                      <select
                        value={t.deboardingPoint?.stationCode || ""}
                        onChange={(e) => {
                          const p = deboardingOpts.find(
                            (x) => x.stationCode === e.target.value,
                          );
                          updateTraveller(idx, "deboardingPoint", p || null);
                        }}
                        disabled={!isBoardingEditable}
                        className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                      >
                        <option value="">Select</option>
                        {deboardingOpts.map((dp) => (
                          <option key={dp.stationCode} value={dp.stationCode}>
                            {dp.stationCode} - {dp.stationName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ─────────────────────────────────────────────
                        ADDONS — OLD flat dropdown, only when this
                        traveller's package has NO trip-wise addon
                        data (old bookings / old tours) OR this
                        traveller already has a flat addon saved.
                    ───────────────────────────────────────────── */}
                    {!tripWise && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Add-on
                        </label>
                        <select
                          value={
                            t.selectedAddon?.name ||
                            getArrayFlatAddon(t)?.name ||
                            ""
                          }
                          onChange={(e) =>
                            handleFlatAddonChange(idx, e.target.value, addonOpts)
                          }
                          disabled={!isTravellerEditable}
                          className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                        >
                          <option value="">None</option>
                          {addonOpts.map((a) => (
                            <option key={a._id || a.id} value={a.name}>
                              {a.name} (+{a.amount || 0})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Remarks (optional)
                      </label>
                      <textarea
                        value={t.remarks || ""}
                        onChange={(e) =>
                          updateTraveller(idx, "remarks", e.target.value)
                        }
                        disabled={!isTravellerEditable}
                        className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────
                      ADDONS — NEW train/flight-wise section, shown
                      whenever THIS traveller's package has trip-wise
                      addon data AND this traveller doesn't already
                      have an old-style flat addon saved. Mirrors the
                      TourBooking.jsx (user-facing) UI/logic.
                  ───────────────────────────────────────────── */}
                  {tripWise && (
                    <div className="mt-6 pt-6 border-t border-gray-300">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                              <Train className="w-5 h-5" />
                            </div>
                            <h4 className="text-base sm:text-lg font-bold text-gray-800">
                              Train / Flight Add-ons
                            </h4>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Select add-on per trip
                          </p>
                        </div>

                        <div className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100">
                          <span className="text-sm font-semibold text-gray-600">
                            TOTAL ADD-ONS:
                          </span>
                          <span className="ml-2 text-base font-bold text-indigo-700">
                            ₹{tripAddonsTotal}
                          </span>
                        </div>
                      </div>

                      {trainDetails.length > 0 && (
                        <div className="mb-5">
                          <p className="text-sm font-bold text-indigo-700 mb-2.5 flex items-center gap-1.5">
                            <span>🚆</span> Train Add-ons
                          </p>
                          <div className="space-y-3">
                            {trainDetails.map((train, tIdx) => (
                              <div
                                key={train._id || `train-${tIdx}`}
                                className="border border-gray-200 rounded-xl p-4 bg-white"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-[60px_1fr_260px] gap-4 items-center">
                                  <div className="flex md:justify-center">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                      {String(tIdx + 1).padStart(2, "0")}
                                    </div>
                                  </div>

                                  <div>
                                    {train.tripType && (
                                      <span className="inline-block mb-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase">
                                        {train.tripType}
                                      </span>
                                    )}
                                    <h5 className="text-base font-semibold text-gray-800">
                                      {train.trainName}{" "}
                                      <span className="text-gray-500 font-medium">
                                        ({train.trainNo})
                                      </span>
                                    </h5>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {train.fromStation}
                                      <span className="mx-2 text-gray-400">→</span>
                                      {train.toStation}
                                    </p>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                      Add-on
                                    </label>
                                    <select
                                      value={getSelectedTripAddonId(
                                        t,
                                        pkg,
                                        "train",
                                        tIdx,
                                      )}
                                      onChange={(e) =>
                                        handleTripAddonChange(
                                          idx,
                                          "train",
                                          tIdx,
                                          e.target.value,
                                        )
                                      }
                                      disabled={!isTravellerEditable}
                                      className="w-full px-3.5 py-3 rounded-lg border border-gray-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm disabled:bg-gray-200 disabled:cursor-not-allowed"
                                    >
                                      <option value="">No Add-on</option>
                                      {(train.addons || []).map((a) => (
                                        <option
                                          key={a._id || a.id}
                                          value={a._id || a.id}
                                        >
                                          {a.name} (+{a.amount || 0})
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {flightDetails.length > 0 && (
                        <div>
                          <p className="text-sm font-bold text-purple-700 mb-2.5 flex items-center gap-1.5">
                            <span>✈️</span> Flight Add-ons
                          </p>
                          <div className="space-y-3">
                            {flightDetails.map((flight, fIdx) => (
                              <div
                                key={flight._id || `flight-${fIdx}`}
                                className="border border-gray-200 rounded-xl p-4 bg-white"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-[60px_1fr_260px] gap-4 items-center">
                                  <div className="flex md:justify-center">
                                    <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                                      {String(fIdx + 1).padStart(2, "0")}
                                    </div>
                                  </div>

                                  <div>
                                    {flight.tripType && (
                                      <span className="inline-block mb-1 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold uppercase">
                                        {flight.tripType}
                                      </span>
                                    )}
                                    <h5 className="text-base font-semibold text-gray-800">
                                      {flight.airline}{" "}
                                      <span className="text-gray-500 font-medium">
                                        ({flight.flightNo})
                                      </span>
                                    </h5>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {flight.fromAirport}
                                      <span className="mx-2 text-gray-400">→</span>
                                      {flight.toAirport}
                                    </p>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                      Add-on
                                    </label>
                                    <select
                                      value={getSelectedTripAddonId(
                                        t,
                                        pkg,
                                        "flight",
                                        fIdx,
                                      )}
                                      onChange={(e) =>
                                        handleTripAddonChange(
                                          idx,
                                          "flight",
                                          fIdx,
                                          e.target.value,
                                        )
                                      }
                                      disabled={!isTravellerEditable}
                                      className="w-full px-3.5 py-3 rounded-lg border border-gray-200 bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm disabled:bg-gray-200 disabled:cursor-not-allowed"
                                    >
                                      <option value="">No Add-on</option>
                                      {(flight.addons || []).map((a) => (
                                        <option
                                          key={a._id || a.id}
                                          value={a._id || a.id}
                                        >
                                          {a.name} (+{a.amount || 0})
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBooking;
