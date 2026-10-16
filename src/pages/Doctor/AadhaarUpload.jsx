
// // import React, { useContext, useEffect, useRef, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import JSZip from "jszip";
// // import { TourContext } from "../../context/TourContext";
// // import UserBookingsTab, { TravellerAadhaarRow } from "../../components/UserBookingsTab";
// // import {
// //   UserPlus,
// //   Upload,
// //   Loader2,
// //   CheckCircle2,
// //   Trash2,
// //   Pencil,
// //   IndianRupee,
// //   FileImage,
// //   MapPin,
// //   Package,
// //   Train,
// //   Plane,
// //   Phone,
// //   Home,
// //   NotebookPen,
// //   ArrowRight,
// //   Users,
// //   IdCard,
// //   PlusCircle,
// //   ChevronDown,
// //   ChevronUp,
// //   Ticket,
// //   Link2,
// //   BookOpenCheck,
// //   RefreshCw,
// //   XCircle,
// //   Download,
// //   UserCheck,
// //   Search,
// //   Copy,
// //   Check,
// //   ChevronLeft,
// //   ChevronRight,
// //   X,
// //   FileText,
// // } from "lucide-react";
// // import { toast, ToastContainer } from "react-toastify";
// // import "react-toastify/dist/ReactToastify.css";

// // // Click-to-copy TNR. stopPropagation so it never toggles the parent row.
// // const CopyTnrButton = ({ tnr, className = "" }) => {
// //   const [copied, setCopied] = useState(false);
// //   const handleCopy = async (e) => {
// //     e.stopPropagation();
// //     e.preventDefault();
// //     try {
// //       await navigator.clipboard.writeText(tnr);
// //     } catch (err) {
// //       console.error("Copy TNR failed:", err);
// //     }
// //     setCopied(true);
// //     setTimeout(() => setCopied(false), 1500);
// //   };
// //   return (
// //     <button
// //       type="button"
// //       onClick={handleCopy}
// //       title="Copy TNR"
// //       className={`inline-flex items-center justify-center shrink-0 hover:opacity-60 transition-opacity ${className}`}
// //     >
// //       {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
// //     </button>
// //   );
// // };

// // // Three-state traveller cancellation badge (resolved by the backend).
// // const CANCEL_STATUS = {
// //   request: { label: "Cancellation Requested", className: "bg-amber-100 text-amber-700 border border-amber-200" },
// //   rejected: { label: "Cancellation Rejected", className: "bg-gray-100 text-gray-600 border border-gray-300" },
// //   cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 border border-red-200" },
// // };
// // const CancelStatusBadge = ({ status }) => {
// //   const meta = CANCEL_STATUS[status];
// //   if (!meta) return null;
// //   return (
// //     <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.className}`}>
// //       {meta.label}
// //     </span>
// //   );
// // };

// // // One-at-a-time payment screenshot viewer with Prev/Next.
// // const ScreenshotViewer = ({ items, index, onClose, onNav }) => {
// //   if (index === null || index === undefined || !items?.[index]) return null;
// //   const item = items[index];
// //   return (
// //     <div
// //       className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
// //       onClick={onClose}
// //     >
// //       <div
// //         className="relative w-full max-w-lg bg-white rounded-xl overflow-hidden shadow-2xl"
// //         onClick={(e) => e.stopPropagation()}
// //       >
// //         <button
// //           type="button"
// //           onClick={onClose}
// //           className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
// //         >
// //           <X className="w-4 h-4" />
// //         </button>
// //         <img
// //           src={item.url}
// //           alt={`Screenshot ${index + 1}`}
// //           className="w-full max-h-[70vh] object-contain bg-gray-100"
// //         />
// //         <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
// //           <button
// //             type="button"
// //             onClick={() => onNav(index - 1)}
// //             disabled={index === 0}
// //             className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
// //           >
// //             <ChevronLeft className="w-4 h-4" />
// //           </button>
// //           <span className="text-sm font-semibold text-gray-700">
// //             {index + 1} / {items.length}
// //             {item.amount ? ` — ₹${item.amount}` : " — amount not entered"}
// //           </span>
// //           <button
// //             type="button"
// //             onClick={() => onNav(index + 1)}
// //             disabled={index === items.length - 1}
// //             className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
// //           >
// //             <ChevronRight className="w-4 h-4" />
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // Match boarding/deboarding points by their own _id (stationCode isn't unique).
// // const getPointId = (point) => {
// //   if (!point) return "";
// //   const raw = point._id;
// //   if (raw && typeof raw === "object" && raw.$oid) return String(raw.$oid);
// //   return raw !== undefined && raw !== null ? String(raw) : "";
// // };

// // // Person-level fields only — package/boarding/addons/remarks are booking-wide.
// // const blankTraveller = (isMain) => ({
// //   title: "Mr",
// //   firstName: "",
// //   lastName: "",
// //   age: "",
// //   gender: "Male",
// //   sharingType: "",
// //   phone: "",
// //   address: "",
// //   addressLine1: "",
// //   addressLine2: "",
// //   city: "",
// //   state: "",
// //   pincode: "",
// //   isCoTraveller: !isMain,
// //   front: null,
// //   back: null,
// //   ocrLoading: false,
// //   _frontFile: null,
// //   _backFile: null,
// //   source: "aadhaar", // "aadhaar" | "manual"
// // });

// // // ───────────── Booking-wide section ─────────────
// // // Module scope (not inside AadhaarUpload) so inputs don't lose focus on
// // // every keystroke.
// // const BookingWideSection = ({
// //   tourInfo,
// //   packageSelection,
// //   setPackageSelection,
// //   boardingPoint,
// //   setBoardingPoint,
// //   deboardingPoint,
// //   setDeboardingPoint,
// //   selectedAddons,
// //   setSelectedAddons,
// //   remarks,
// //   setRemarks,
// //   staffList,
// //   raisedByStaffId,
// //   setRaisedByStaffId,
// // }) => {
// //   const pkg =
// //     packageSelection.type === "main"
// //       ? tourInfo
// //       : tourInfo?.variantPackage?.[packageSelection.variantIndex];

// //   const boardingOptions = pkg?.boardingPoints || [];
// //   const deboardingOptions = pkg?.deboardingPoints || [];
// //   const trainDetails = pkg?.trainDetails || [];
// //   const flightDetails = pkg?.flightDetails || [];
// //   const flightsWithAddons = flightDetails
// //     .map((flight, flightIndex) => ({ flight, flightIndex }))
// //     .filter(({ flight }) => Array.isArray(flight.addons) && flight.addons.length > 0);

// //   const handleAddonChange = (trainIndex, addonId) => {
// //     const train = trainDetails[trainIndex];
// //     if (!train) return;

// //     let updated = selectedAddons.filter((a) => a.trainIndex !== trainIndex);
// //     if (!addonId) {
// //       setSelectedAddons(updated);
// //       return;
// //     }
// //     const addon = train.addons?.find((a) => String(a._id || a.id) === String(addonId));
// //     if (!addon) {
// //       setSelectedAddons(updated);
// //       return;
// //     }
// //     updated.push({
// //       trainIndex,
// //       trainNo: train.trainNo,
// //       trainName: train.trainName,
// //       tripType: train.tripType,
// //       addonId: addon._id || addon.id,
// //       name: addon.name,
// //       amount: Number(addon.amount) || 0,
// //     });
// //     setSelectedAddons(updated);
// //   };

// //   const handleFlightAddonChange = (flightIndex, addonId) => {
// //     const flight = flightDetails[flightIndex];
// //     if (!flight) return;

// //     let updated = selectedAddons.filter((a) => a.flightIndex !== flightIndex);
// //     if (!addonId) {
// //       setSelectedAddons(updated);
// //       return;
// //     }
// //     const addon = flight.addons?.find((a) => String(a._id || a.id) === String(addonId));
// //     if (!addon) {
// //       setSelectedAddons(updated);
// //       return;
// //     }
// //     updated.push({
// //       flightIndex,
// //       flightNo: flight.flightNo,
// //       airline: flight.airline,
// //       tripType: flight.tripType,
// //       addonId: addon._id || addon.id,
// //       name: addon.name,
// //       amount: Number(addon.amount) || 0,
// //     });
// //     setSelectedAddons(updated);
// //   };

// //   const getSelectedAddonForTrain = (trainIndex) =>
// //     selectedAddons.find((a) => a.trainIndex === trainIndex)?.addonId || "";

// //   const getSelectedAddonForFlight = (flightIndex) =>
// //     selectedAddons.find((a) => a.flightIndex === flightIndex)?.addonId || "";

// //   return (
// //     <div className="mb-6 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-sky-50/60 shadow-sm overflow-hidden">
// //       <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-sky-200/70 bg-white/60">
// //         <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm">
// //           <Package className="w-5 h-5" />
// //         </div>
// //         <div>
// //           <p className="font-bold text-gray-800 leading-tight">Booking Details</p>
// //           <p className="text-xs text-gray-500">Applies to every traveller on this TNR</p>
// //         </div>
// //       </div>

// //       <div className="p-5 sm:p-6">
// //         <div className="grid md:grid-cols-3 gap-4 mb-5">
// //           <div>
// //             <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
// //               <Package className="w-3.5 h-3.5 text-sky-600" /> Package Type
// //             </label>
// //             <select
// //               value={packageSelection.type === "main" ? "main" : packageSelection.variantIndex}
// //               onChange={(e) => {
// //                 const v = e.target.value;
// //                 if (v === "main") setPackageSelection({ type: "main", variantIndex: null });
// //                 else setPackageSelection({ type: "variant", variantIndex: Number(v) });
// //               }}
// //               className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none text-sm transition-all"
// //             >
// //               <option value="main">Main Package</option>
// //               {tourInfo?.variantPackage?.map((p, i) => (
// //                 <option key={i} value={i}>
// //                   Variant {i + 1} ({p.destination?.join(", ")})
// //                 </option>
// //               ))}
// //             </select>
// //           </div>
// //           <div>
// //             <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
// //               <MapPin className="w-3.5 h-3.5 text-sky-600" /> Boarding Point
// //             </label>
// //             <select
// //               value={getPointId(boardingPoint)}
// //               onChange={(e) => {
// //                 const bp = boardingOptions.find((x) => getPointId(x) === e.target.value);
// //                 setBoardingPoint(bp || null);
// //               }}
// //               className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none text-sm transition-all"
// //             >
// //               <option value="">Select Boarding Point</option>
// //               {boardingOptions.map((bp, i) => (
// //                 <option key={getPointId(bp) || i} value={getPointId(bp)}>
// //                   {bp.stationCode} - {bp.stationName}
// //                 </option>
// //               ))}
// //             </select>
// //           </div>
// //           <div>
// //             <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
// //               <MapPin className="w-3.5 h-3.5 text-sky-600" /> Deboarding Point
// //             </label>
// //             <select
// //               value={getPointId(deboardingPoint)}
// //               onChange={(e) => {
// //                 const dp = deboardingOptions.find((x) => getPointId(x) === e.target.value);
// //                 setDeboardingPoint(dp || null);
// //               }}
// //               className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none text-sm transition-all"
// //             >
// //               <option value="">Select Deboarding Point</option>
// //               {deboardingOptions.map((dp, i) => (
// //                 <option key={getPointId(dp) || i} value={getPointId(dp)}>
// //                   {dp.stationCode} - {dp.stationName}
// //                 </option>
// //               ))}
// //             </select>
// //           </div>
// //         </div>

// //         {(trainDetails.length > 0 || flightsWithAddons.length > 0) && (
// //           <div className="pt-5 border-t border-sky-200/70 space-y-5">
// //             {trainDetails.length > 0 && (
// //               <div>
// //                 <p className="flex items-center gap-1.5 text-sm font-bold text-indigo-700 mb-2.5">
// //                   <Train className="w-4 h-4" /> Train Add-ons
// //                 </p>
// //                 <div className="space-y-2">
// //                   {trainDetails.map((train, tIdx) => (
// //                     <div
// //                       key={train._id || tIdx}
// //                       className="border border-gray-200 rounded-xl p-3.5 bg-white hover:border-indigo-200 transition-colors"
// //                     >
// //                       <p className="text-sm font-semibold text-gray-800">
// //                         {train.trainName} <span className="text-gray-500 font-normal">({train.trainNo})</span>
// //                       </p>
// //                       <select
// //                         value={getSelectedAddonForTrain(tIdx)}
// //                         onChange={(e) => handleAddonChange(tIdx, e.target.value)}
// //                         className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
// //                       >
// //                         <option value="">No Add-on</option>
// //                         {(train.addons || []).map((a) => (
// //                           <option key={a._id || a.id} value={a._id || a.id}>
// //                             {a.name} (+{a.amount || 0})
// //                           </option>
// //                         ))}
// //                       </select>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             )}

// //             {flightsWithAddons.length > 0 && (
// //               <div>
// //                 <p className="flex items-center gap-1.5 text-sm font-bold text-purple-700 mb-2.5">
// //                   <Plane className="w-4 h-4" /> Flight Add-ons
// //                 </p>
// //                 <div className="space-y-2">
// //                   {flightsWithAddons.map(({ flight, flightIndex }) => (
// //                     <div
// //                       key={flight._id || flightIndex}
// //                       className="border border-gray-200 rounded-xl p-3.5 bg-white hover:border-purple-200 transition-colors"
// //                     >
// //                       <p className="text-sm font-semibold text-gray-800">
// //                         {flight.airline} <span className="text-gray-500 font-normal">({flight.flightNo})</span>
// //                       </p>
// //                       <select
// //                         value={getSelectedAddonForFlight(flightIndex)}
// //                         onChange={(e) => handleFlightAddonChange(flightIndex, e.target.value)}
// //                         className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
// //                       >
// //                         <option value="">No Add-on</option>
// //                         {(flight.addons || []).map((a) => (
// //                           <option key={a._id || a.id} value={a._id || a.id}>
// //                             {a.name} (+{a.amount || 0})
// //                           </option>
// //                         ))}
// //                       </select>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             )}
// //           </div>
// //         )}

// //         <div className="mt-5 pt-5 border-t border-sky-200/70">
// //           <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
// //             <UserCheck className="w-3.5 h-3.5 text-sky-600" /> Raised By (who is saving this booking?) *
// //           </label>
// //           <select
// //             value={raisedByStaffId || ""}
// //             onChange={(e) => setRaisedByStaffId(e.target.value)}
// //             className="w-full mb-4 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none text-sm transition-all"
// //           >
// //             <option value="">Select your name</option>
// //             {(staffList || []).map((s) => (
// //               <option key={s._id} value={s._id}>
// //                 {s.fullName}{s.employeeId ? ` (${s.employeeId})` : ""}
// //               </option>
// //             ))}
// //           </select>

// //           <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
// //             <NotebookPen className="w-3.5 h-3.5 text-sky-600" /> Remarks (optional)
// //           </label>
// //           <textarea
// //             value={remarks}
// //             onChange={(e) => setRemarks(e.target.value)}
// //             rows={2}
// //             className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none text-sm transition-all resize-none"
// //           />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // ───────────── Per-person traveller card ─────────────
// // const TravellerCard = ({
// //   traveller,
// //   index,
// //   isMain,
// //   removeCoTraveller,
// //   setTravellerFrontFile,
// //   setTravellerBackFile,
// //   extractTravellerAadhaar,
// //   clearTravellerAadhaar,
// //   handleTravellerChange,
// // }) => {
// //   const frontInputRef = useRef(null);
// //   const backInputRef = useRef(null);
// //   const [showRawText, setShowRawText] = useState(false);

// //   const clearChosenFront = () => {
// //     if (frontInputRef.current) frontInputRef.current.value = "";
// //     setTravellerFrontFile(index, null);
// //   };
// //   const clearChosenBack = () => {
// //     if (backInputRef.current) backInputRef.current.value = "";
// //     setTravellerBackFile(index, null);
// //   };

// //   // One cross mark for the whole lifecycle — clears the picker, and the
// //   // OCR'd result too if already extracted.
// //   const clearFront = () => {
// //     clearChosenFront();
// //     if (traveller.front) clearTravellerAadhaar(index);
// //   };
// //   const clearBack = () => {
// //     clearChosenBack();
// //     if (traveller.back) clearTravellerAadhaar(index);
// //   };

// //   return (
// //     <div
// //       className={`mb-6 rounded-2xl border shadow-sm overflow-hidden ${isMain ? "border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-indigo-50/50" : "border-purple-200 bg-gradient-to-br from-purple-50 via-white to-purple-50/50"
// //         }`}
// //     >
// //       <div
// //         className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b bg-white/60 ${isMain ? "border-indigo-200/70" : "border-purple-200/70"
// //           }`}
// //       >
// //         <div className="flex items-center gap-3">
// //           <div
// //             className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-sm ${isMain ? "bg-indigo-600" : "bg-purple-600"
// //               }`}
// //           >
// //             {isMain ? <IdCard className="w-5 h-5" /> : <Users className="w-5 h-5" />}
// //           </div>
// //           <div>
// //             <p className="font-bold text-gray-800 leading-tight">
// //               {isMain ? "Main Traveller" : `Co-Traveller ${index}`}
// //             </p>
// //             {!isMain && (
// //               <p className="text-xs text-gray-500">
// //                 {traveller.source === "aadhaar" ? "Via Aadhaar OCR" : "Manual entry"}
// //               </p>
// //             )}
// //           </div>
// //         </div>
// //         {!isMain && (
// //           <button
// //             onClick={() => removeCoTraveller(index)}
// //             className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
// //             title="Remove co-traveller"
// //           >
// //             <Trash2 className="w-4.5 h-4.5" />
// //           </button>
// //         )}
// //       </div>

// //       <div className="p-5 sm:p-6">
// //         {traveller.source === "aadhaar" && (
// //           <div className="p-4 bg-white rounded-xl border border-dashed border-gray-300 mb-5">
// //             <div className="flex flex-wrap items-end gap-3">
// //               <div className="flex-1 min-w-[160px]">
// //                 <label className="block text-xs font-semibold text-gray-600 mb-1.5">
// //                   Aadhaar Front {isMain ? "(required)" : ""}
// //                 </label>
// //                 <div className="flex items-center gap-2">
// //                   <input
// //                     ref={frontInputRef}
// //                     type="file"
// //                     accept="image/*,application/pdf"
// //                     onChange={(e) => setTravellerFrontFile(index, e.target.files?.[0] || null)}
// //                     className="flex-1 min-w-0 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
// //                   />
// //                   {(traveller._frontFile || traveller.front) && (
// //                     <button
// //                       type="button"
// //                       onClick={clearFront}
// //                       className="shrink-0 text-gray-400 hover:text-red-600"
// //                       title={traveller.front ? "Remove this Aadhaar and redo it" : "Clear chosen file"}
// //                     >
// //                       <XCircle className="w-4 h-4" />
// //                     </button>
// //                   )}
// //                 </div>
// //               </div>
// //               {isMain && (
// //                 <div className="flex-1 min-w-[160px]">
// //                   <label className="block text-xs font-semibold text-gray-600 mb-1.5">Aadhaar Back (optional)</label>
// //                   <div className="flex items-center gap-2">
// //                     <input
// //                       ref={backInputRef}
// //                       type="file"
// //                       accept="image/*,application/pdf"
// //                       onChange={(e) => setTravellerBackFile(index, e.target.files?.[0] || null)}
// //                       className="flex-1 min-w-0 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
// //                     />
// //                     {(traveller._backFile || traveller.back) && (
// //                       <button
// //                         type="button"
// //                         onClick={clearBack}
// //                         className="shrink-0 text-gray-400 hover:text-red-600"
// //                         title={traveller.back ? "Remove this Aadhaar and redo it" : "Clear chosen file"}
// //                       >
// //                         <XCircle className="w-4 h-4" />
// //                       </button>
// //                     )}
// //                   </div>
// //                 </div>
// //               )}
// //               <button
// //                 onClick={() => extractTravellerAadhaar(index)}
// //                 disabled={traveller.ocrLoading || !traveller._frontFile}
// //                 className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-xl font-bold text-sm shadow-sm transition-colors"
// //               >
// //                 {traveller.ocrLoading ? (
// //                   <>
// //                     <Loader2 className="w-4 h-4 animate-spin" /> Reading...
// //                   </>
// //                 ) : (
// //                   <>
// //                     <Upload className="w-4 h-4" /> Extract Aadhaar
// //                   </>
// //                 )}
// //               </button>
// //               {!isMain && (
// //                 <button
// //                   onClick={() => handleTravellerChange(index, "source", "manual")}
// //                   className="px-4 py-2.5 text-sm font-semibold text-purple-700 border border-purple-300 rounded-xl hover:bg-purple-50 transition-colors"
// //                 >
// //                   Switch to Manual
// //                 </button>
// //               )}
// //             </div>
// //             {traveller.front && (
// //               <div className="mt-3 flex flex-wrap items-center gap-3">
// //                 <span className="flex items-center gap-1.5 text-sm font-medium text-green-700">
// //                   <CheckCircle2 className="w-4 h-4" />
// //                   Aadhaar front {traveller.back ? "+ back " : ""}read
// //                 </span>
// //                 <a
// //                   href={traveller.front?.url}
// //                   target="_blank"
// //                   rel="noopener noreferrer"
// //                   className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
// //                 >
// //                   View Front
// //                 </a>
// //                 {traveller.back && (
// //                   <a
// //                     href={traveller.back?.url}
// //                     target="_blank"
// //                     rel="noopener noreferrer"
// //                     className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
// //                   >
// //                     View Back
// //                   </a>
// //                 )}
// //                 {(traveller.front?.ocrText || traveller.back?.ocrText) && (
// //                   <button
// //                     type="button"
// //                     onClick={() => setShowRawText((v) => !v)}
// //                     className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-600"
// //                   >
// //                     {showRawText ? "Hide" : "Show"} raw text read
// //                   </button>
// //                 )}
// //               </div>
// //             )}
// //             {showRawText && traveller.front?.ocrText && (
// //               <div className="mt-2">
// //                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Front</p>
// //                 <pre className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
// //                   {traveller.front.ocrText}
// //                 </pre>
// //               </div>
// //             )}
// //             {showRawText && traveller.back?.ocrText && (
// //               <div className="mt-2">
// //                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Back (address comes from here)</p>
// //                 <pre className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
// //                   {traveller.back.ocrText}
// //                 </pre>
// //               </div>
// //             )}
// //           </div>
// //         )}

// //         <div className="grid md:grid-cols-4 gap-4 mb-4">
// //           <div>
// //             <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title</label>
// //             <select
// //               value={traveller.title}
// //               onChange={(e) => handleTravellerChange(index, "title", e.target.value)}
// //               className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
// //             >
// //               <option>Mr</option>
// //               <option>Mrs</option>
// //               <option>Ms</option>
// //             </select>
// //           </div>
// //           <div>
// //             <label className="block text-xs font-semibold text-gray-600 mb-1.5">First Name</label>
// //             <input
// //               type="text"
// //               value={traveller.firstName}
// //               onChange={(e) => handleTravellerChange(index, "firstName", e.target.value)}
// //               className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
// //             />
// //           </div>
// //           <div>
// //             <label className="block text-xs font-semibold text-gray-600 mb-1.5">Last Name</label>
// //             <input
// //               type="text"
// //               value={traveller.lastName}
// //               onChange={(e) => handleTravellerChange(index, "lastName", e.target.value)}
// //               className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
// //             />
// //           </div>
// //           <div>
// //             <label className="block text-xs font-semibold text-gray-600 mb-1.5">Age</label>
// //             <input
// //               type="number"
// //               value={traveller.age}
// //               onChange={(e) => handleTravellerChange(index, "age", e.target.value)}
// //               className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
// //             />
// //           </div>
// //         </div>

// //         <div className="grid md:grid-cols-2 gap-4 mb-4">
// //           <div>
// //             <label className="block text-xs font-semibold text-gray-600 mb-1.5">Gender</label>
// //             <select
// //               value={traveller.gender}
// //               onChange={(e) => handleTravellerChange(index, "gender", e.target.value)}
// //               className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
// //             >
// //               <option>Male</option>
// //               <option>Female</option>
// //               <option>Other</option>
// //             </select>
// //           </div>
// //           <div>
// //             <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sharing Type</label>
// //             <select
// //               value={traveller.sharingType}
// //               onChange={(e) => handleTravellerChange(index, "sharingType", e.target.value)}
// //               className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
// //             >
// //               <option value="">Select Sharing</option>
// //               {Number(traveller.age) >= 11 ? (
// //                 <>
// //                   <option value="double">Double Sharing</option>
// //                   <option value="triple">Triple Sharing</option>
// //                 </>
// //               ) : Number(traveller.age) >= 6 && Number(traveller.age) <= 10 ? (
// //                 <>
// //                   <option value="withBerth">Child with Berth</option>
// //                   <option value="withoutBerth">Child without Berth</option>
// //                 </>
// //               ) : null}
// //             </select>
// //           </div>
// //         </div>

// //         {/* Mobile / Address — main traveller only. */}
// //         {isMain && (
// //           <div className="space-y-4">
// //             <div>
// //               <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
// //                 <Phone className="w-3.5 h-3.5 text-indigo-500" /> Mobile Number
// //               </label>
// //               <input
// //                 type="tel"
// //                 value={traveller.phone}
// //                 onChange={(e) => handleTravellerChange(index, "phone", e.target.value)}
// //                 placeholder="e.g. 9876543210"
// //                 className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
// //               />
// //             </div>

// //             <div>
// //               <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
// //                 <Home className="w-3.5 h-3.5 text-indigo-500" /> Address
// //               </label>
// //               <div className="grid sm:grid-cols-2 gap-3">
// //                 <input
// //                   type="text"
// //                   value={traveller.addressLine1}
// //                   onChange={(e) => handleTravellerChange(index, "addressLine1", e.target.value)}
// //                   placeholder="Address Line 1"
// //                   className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
// //                 />
// //                 <input
// //                   type="text"
// //                   value={traveller.addressLine2}
// //                   onChange={(e) => handleTravellerChange(index, "addressLine2", e.target.value)}
// //                   placeholder="Address Line 2"
// //                   className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
// //                 />
// //                 <input
// //                   type="text"
// //                   value={traveller.city}
// //                   onChange={(e) => handleTravellerChange(index, "city", e.target.value)}
// //                   placeholder="City"
// //                   className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
// //                 />
// //                 <input
// //                   type="text"
// //                   value={traveller.state}
// //                   onChange={(e) => handleTravellerChange(index, "state", e.target.value)}
// //                   placeholder="State"
// //                   className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
// //                 />
// //                 <input
// //                   type="text"
// //                   value={traveller.pincode}
// //                   onChange={(e) => handleTravellerChange(index, "pincode", e.target.value)}
// //                   placeholder="Pincode"
// //                   className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
// //                 />
// //                 <input
// //                   type="text"
// //                   value="India"
// //                   readOnly
// //                   disabled
// //                   className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm text-gray-500 cursor-not-allowed"
// //                 />
// //               </div>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // // ───────────── All Bookings tab ─────────────
// // const PAYMENT_TYPES = [
// //   { type: "advance", label: "Advance" },
// //   { type: "balance", label: "Balance" },
// //   { type: "partial", label: "Partial Balance" },
// // ];

// // const PaymentSlot = ({ groupId, tnr, type, label, items, uploadGroupPayment, deleteGroupPayment, refresh }) => {
// //   const [queue, setQueue] = useState([]);
// //   const [queueAmounts, setQueueAmounts] = useState([]);
// //   const [queueRemarks, setQueueRemarks] = useState([]);
// //   const [uploading, setUploading] = useState(false);
// //   const [uploadProgress, setUploadProgress] = useState(null); // { current, total }
// //   const [deletingId, setDeletingId] = useState(null);
// //   const [viewerIndex, setViewerIndex] = useState(null);
// //   // Synchronous double-click guard.
// //   const uploadingRef = useRef(false);

// //   const handleDelete = async (docId) => {
// //     if (!window.confirm(`Delete this ${label} screenshot? This can't be undone.`)) return;
// //     setDeletingId(docId);
// //     try {
// //       const result = await deleteGroupPayment(docId);
// //       if (result?.success) {
// //         toast.success(`${label} screenshot deleted`);
// //         refresh();
// //       }
// //     } catch (err) {
// //       console.error("deleteGroupPayment error:", err);
// //     } finally {
// //       setDeletingId(null);
// //     }
// //   };

// //   const handleRemoveQueued = (idx) => {
// //     setQueue((prev) => prev.filter((_, i) => i !== idx));
// //     setQueueAmounts((prev) => prev.filter((_, i) => i !== idx));
// //     setQueueRemarks((prev) => prev.filter((_, i) => i !== idx));
// //   };

// //   const uploadOne = async (file, amount, remarks) => {
// //     const formData = new FormData();
// //     formData.append("screenshot", file);
// //     // Real walk-in group → groupId; booking merged from tourBookingModel
// //     // ("real-<id>" placeholder) → tnr.
// //     if (groupId && !String(groupId).startsWith("real-")) {
// //       formData.append("groupId", groupId);
// //     } else if (tnr) {
// //       formData.append("tnr", tnr);
// //     }
// //     formData.append("type", type);
// //     if (amount) formData.append("amount", amount);
// //     if (remarks?.trim()) formData.append("remarks", remarks.trim());
// //     return uploadGroupPayment(formData);
// //   };

// //   const handleUploadAll = async () => {
// //     if (queue.length === 0) return toast.error(`Select at least one ${label} screenshot first`);
// //     for (let i = 0; i < queueAmounts.length; i++) {
// //       if (queueAmounts[i] && Number(queueAmounts[i]) <= 0) {
// //         return toast.error(`Amount for "${queue[i]?.name}", if entered, must be a positive number`);
// //       }
// //     }
// //     if (uploadingRef.current) return;
// //     uploadingRef.current = true;
// //     setUploading(true);
// //     let successCount = 0;
// //     for (let i = 0; i < queue.length; i++) {
// //       setUploadProgress({ current: i + 1, total: queue.length });
// //       try {
// //         const result = await uploadOne(queue[i], queueAmounts[i], queueRemarks[i]);
// //         if (result?.success) successCount += 1;
// //       } catch (err) {
// //         console.error("uploadGroupPayment error:", err);
// //       }
// //     }
// //     setUploading(false);
// //     setUploadProgress(null);
// //     setQueue([]);
// //     setQueueAmounts([]);
// //     setQueueRemarks([]);
// //     uploadingRef.current = false;
// //     if (successCount > 0) {
// //       toast.success(`${successCount} ${label} screenshot${successCount > 1 ? "s" : ""} uploaded`);
// //     }
// //     if (successCount < queue.length) {
// //       toast.error(`${queue.length - successCount} ${label} screenshot(s) failed to upload`);
// //     }
// //     refresh();
// //   };

// //   return (
// //     <div className="p-4 rounded-xl border border-[#DEE2E8] bg-[#F7F8FA]/60">
// //       <h5 className="flex items-center gap-1.5 font-bold text-gray-700 text-sm mb-2.5">
// //         <FileImage className="w-4 h-4" /> {label}
// //       </h5>

// //       {items.length > 0 && (
// //         <div className="flex flex-wrap gap-2 mb-3">
// //           {items.map((item, i) => (
// //             <div
// //               key={item._id || i}
// //               className="relative flex items-start gap-1 text-xs font-semibold text-[#235F47] bg-[#EDF6F1] border border-[#B6DFC8] rounded-lg pl-2.5 pr-1.5 py-1.5 hover:bg-[#D7EEE0]"
// //             >
// //               <button
// //                 type="button"
// //                 onClick={() => setViewerIndex(i)}
// //                 className="flex flex-col items-start gap-0.5 text-left"
// //               >
// //                 <span className="flex items-center gap-1.5">
// //                   <CheckCircle2 className="w-3.5 h-3.5" />
// //                   {items.length > 1 ? `#${i + 1}` : "View"}
// //                   {item.amount ? ` — ₹${item.amount}` : " — amount not entered"}
// //                 </span>
// //                 {item.createdAt && (
// //                   <span className="font-normal text-[#2E7D5E]">
// //                     {new Date(item.createdAt).toLocaleString("en-IN", {
// //                       day: "2-digit",
// //                       month: "short",
// //                       year: "numeric",
// //                       hour: "2-digit",
// //                       minute: "2-digit",
// //                     })}
// //                   </span>
// //                 )}
// //                 {item.remarks && (
// //                   <span className="font-normal text-[#2E7D5E] italic">{item.remarks}</span>
// //                 )}
// //               </button>
// //               {item._id && deleteGroupPayment && (
// //                 <button
// //                   type="button"
// //                   onClick={() => handleDelete(item._id)}
// //                   disabled={deletingId === item._id}
// //                   title={`Delete this ${label} screenshot`}
// //                   className="shrink-0 p-1 rounded-md text-[#B23B3B] hover:text-[#872A2A] hover:bg-[#FBEEEE] disabled:opacity-50 transition-colors"
// //                 >
// //                   {deletingId === item._id ? (
// //                     <Loader2 className="w-3.5 h-3.5 animate-spin" />
// //                   ) : (
// //                     <Trash2 className="w-3.5 h-3.5" />
// //                   )}
// //                 </button>
// //               )}
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       <ScreenshotViewer
// //         items={items}
// //         index={viewerIndex}
// //         onClose={() => setViewerIndex(null)}
// //         onNav={setViewerIndex}
// //       />

// //       {queue.length > 0 && (
// //         <div className="flex flex-col gap-1.5 mb-2">
// //           {queue.map((f, i) => (
// //             <div key={i} className="flex items-center gap-1.5 flex-wrap">
// //               <div className="flex-1 min-w-0 flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white border border-[#DEE2E8] rounded-lg px-2.5 py-2 truncate">
// //                 <FileImage className="w-3.5 h-3.5 shrink-0 text-gray-400" />
// //                 {f.name}
// //               </div>
// //               <input
// //                 type="number"
// //                 placeholder="₹ (optional — OCR tries first)"
// //                 value={queueAmounts[i] || ""}
// //                 onChange={(e) =>
// //                   setQueueAmounts((prev) => prev.map((a, idx) => (idx === i ? e.target.value : a)))
// //                 }
// //                 disabled={uploading}
// //                 className="w-20 sm:w-28 shrink-0 px-2 py-2 bg-white border border-[#DEE2E8] rounded-lg text-xs focus:border-[#5C84B3] focus:ring-2 focus:ring-[#DCE6F2] outline-none transition-all"
// //               />
// //               <input
// //                 type="text"
// //                 placeholder="Bank (e.g. SBI)"
// //                 value={queueRemarks[i] || ""}
// //                 onChange={(e) =>
// //                   setQueueRemarks((prev) => {
// //                     const next = [...prev];
// //                     next[i] = e.target.value;
// //                     return next;
// //                   })
// //                 }
// //                 disabled={uploading}
// //                 className="w-24 sm:w-32 shrink-0 px-2 py-2 bg-white border border-[#DEE2E8] rounded-lg text-xs focus:border-[#5C84B3] focus:ring-2 focus:ring-[#DCE6F2] outline-none transition-all"
// //               />
// //               <button
// //                 type="button"
// //                 onClick={() => handleRemoveQueued(i)}
// //                 disabled={uploading}
// //                 title="Remove from queue"
// //                 className="shrink-0 p-1.5 rounded-md text-gray-400 hover:text-[#B23B3B] hover:bg-[#FBEEEE] disabled:opacity-40 transition-colors"
// //               >
// //                 <X className="w-3.5 h-3.5" />
// //               </button>
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       <label className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 bg-white border border-dashed border-[#DEE2E8] rounded-lg px-3 py-2.5 mb-2 cursor-pointer hover:border-[#5C84B3]">
// //         <Upload className="w-3.5 h-3.5" />
// //         {queue.length > 0 ? "Add more screenshot(s)" : "Choose screenshot(s)"}
// //         <input
// //           type="file"
// //           accept="image/*,application/pdf"
// //           multiple
// //           className="hidden"
// //           onChange={(e) => {
// //             const files = Array.from(e.target.files || []);
// //             if (!files.length) return;
// //             setQueue((prev) => [...prev, ...files]);
// //             setQueueAmounts((prev) => [...prev, ...files.map(() => "")]);
// //             setQueueRemarks((prev) => [...prev, ...files.map(() => "")]);
// //             e.target.value = "";
// //           }}
// //         />
// //       </label>

// //       {queue.length > 0 && (
// //         <button
// //           onClick={handleUploadAll}
// //           disabled={uploading}
// //           className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#2E7D5E] hover:bg-[#235F47] disabled:bg-[#C9CFD8] text-white rounded-lg text-xs font-semibold transition-colors"
// //         >
// //           {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
// //           {uploading
// //             ? `Uploading ${uploadProgress?.current || 1} of ${uploadProgress?.total || queue.length}...`
// //             : `Upload ${queue.length > 1 ? `All (${queue.length})` : ""}`}
// //         </button>
// //       )}
// //     </div>
// //   );
// // };

// // const SHARING_LABELS = {
// //   double: "Double Sharing",
// //   triple: "Triple Sharing",
// //   withBerth: "Child w/ Berth",
// //   withoutBerth: "Child w/o Berth",
// // };

// // // Inline edit form for an already-captured traveller.
// // const TravellerEditForm = ({ draft, setDraft, onSave, onCancel, saving, accent = "indigo" }) => {
// //   if (!draft) return null;
// //   const update = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }));
// //   const updateAddressField = (field, value) =>
// //     setDraft((prev) => {
// //       const next = { ...prev, [field]: value };
// //       next.address = [next.addressLine1, next.addressLine2, next.city, next.state, next.pincode]
// //         .filter(Boolean)
// //         .join(", ");
// //       return next;
// //     });
// //   const ring = accent === "purple" ? "border-[#EAD29C] bg-[#FBF4E7]/40" : "border-[#C3D4E8] bg-[#EEF3FA]/40";
// //   const btn = accent === "purple" ? "bg-[#B07D2B] hover:bg-[#8C6220]" : "bg-[#2A5490] hover:bg-[#1F3F6E]";
// //   return (
// //     <div className={`rounded-xl border-2 p-3 sm:p-4 ${ring}`}>
// //       <div className="grid sm:grid-cols-4 gap-3">
// //         <div>
// //           <label className="block text-xs font-medium text-gray-600">Title</label>
// //           <select
// //             value={draft.title}
// //             onChange={(e) => update("title", e.target.value)}
// //             className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
// //           >
// //             <option>Mr</option>
// //             <option>Mrs</option>
// //             <option>Ms</option>
// //           </select>
// //         </div>
// //         <div>
// //           <label className="block text-xs font-medium text-gray-600">First Name</label>
// //           <input
// //             type="text"
// //             value={draft.firstName}
// //             onChange={(e) => update("firstName", e.target.value)}
// //             className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
// //           />
// //         </div>
// //         <div>
// //           <label className="block text-xs font-medium text-gray-600">Last Name</label>
// //           <input
// //             type="text"
// //             value={draft.lastName}
// //             onChange={(e) => update("lastName", e.target.value)}
// //             className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
// //           />
// //         </div>
// //         <div>
// //           <label className="block text-xs font-medium text-gray-600">Age</label>
// //           <input
// //             type="number"
// //             value={draft.age}
// //             onChange={(e) => update("age", e.target.value)}
// //             className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
// //           />
// //         </div>
// //       </div>
// //       <div className="grid sm:grid-cols-4 gap-3 mt-3">
// //         <div>
// //           <label className="block text-xs font-medium text-gray-600">Gender</label>
// //           <select
// //             value={draft.gender}
// //             onChange={(e) => update("gender", e.target.value)}
// //             className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
// //           >
// //             <option>Male</option>
// //             <option>Female</option>
// //             <option>Other</option>
// //           </select>
// //         </div>
// //         <div>
// //           <label className="block text-xs font-medium text-gray-600">Sharing Type</label>
// //           <select
// //             value={draft.sharingType}
// //             onChange={(e) => update("sharingType", e.target.value)}
// //             className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
// //           >
// //             <option value="">Select Sharing</option>
// //             <option value="double">Double Sharing</option>
// //             <option value="triple">Triple Sharing</option>
// //             <option value="withBerth">Child with Berth</option>
// //             <option value="withoutBerth">Child without Berth</option>
// //           </select>
// //         </div>
// //         <div>
// //           <label className="block text-xs font-medium text-gray-600">Phone</label>
// //           <input
// //             type="text"
// //             value={draft.phone}
// //             onChange={(e) => update("phone", e.target.value)}
// //             className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
// //           />
// //         </div>
// //       </div>
// //       <div className="mt-3">
// //         <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
// //         <div className="grid sm:grid-cols-3 gap-3">
// //           <input
// //             type="text"
// //             value={draft.addressLine1 || ""}
// //             onChange={(e) => updateAddressField("addressLine1", e.target.value)}
// //             placeholder="Address Line 1"
// //             className="w-full px-3 py-2 border rounded-lg text-sm"
// //           />
// //           <input
// //             type="text"
// //             value={draft.addressLine2 || ""}
// //             onChange={(e) => updateAddressField("addressLine2", e.target.value)}
// //             placeholder="Address Line 2"
// //             className="w-full px-3 py-2 border rounded-lg text-sm"
// //           />
// //           <input
// //             type="text"
// //             value={draft.city || ""}
// //             onChange={(e) => updateAddressField("city", e.target.value)}
// //             placeholder="City"
// //             className="w-full px-3 py-2 border rounded-lg text-sm"
// //           />
// //           <input
// //             type="text"
// //             value={draft.state || ""}
// //             onChange={(e) => updateAddressField("state", e.target.value)}
// //             placeholder="State"
// //             className="w-full px-3 py-2 border rounded-lg text-sm"
// //           />
// //           <input
// //             type="text"
// //             value={draft.pincode || ""}
// //             onChange={(e) => updateAddressField("pincode", e.target.value)}
// //             placeholder="Pincode"
// //             className="w-full px-3 py-2 border rounded-lg text-sm"
// //           />
// //           <input
// //             type="text"
// //             value="India"
// //             readOnly
// //             disabled
// //             className="w-full px-3 py-2 border rounded-lg text-sm bg-[#F7F8FA] text-gray-500 cursor-not-allowed"
// //           />
// //         </div>
// //       </div>
// //       <div className="flex items-center gap-2 mt-3">
// //         <button
// //           onClick={onSave}
// //           disabled={saving}
// //           className={`flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-60 ${btn}`}
// //         >
// //           {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
// //           {saving ? "Saving..." : "Save"}
// //         </button>
// //         <button
// //           onClick={onCancel}
// //           disabled={saving}
// //           className="px-3 py-1.5 bg-white border border-[#C9CFD8] hover:bg-[#F7F8FA] text-gray-600 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60"
// //         >
// //           Cancel
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // const BookingCard = ({
// //   booking,
// //   expanded,
// //   onToggle,
// //   extractAadhaar,
// //   addCoTravellerApi,
// //   uploadGroupPayment,
// //   deleteGroupPayment,
// //   uploadUserTravellerAadhaar,
// //   linkGroupTnr,
// //   editAadhaarTraveller,
// //   deleteAadhaarTraveller,
// //   linkGuestTnr,
// //   unlinkGuestTnr,
// //   deleteBookingByTnr,
// //   allBookings,
// //   onCreateBooking,
// //   navigate,
// //   refresh,
// // }) => {
// //   const [ctFile, setCtFile] = useState(null);
// //   const [ctExtracting, setCtExtracting] = useState(false);
// //   const [ctSaving, setCtSaving] = useState(false);
// //   const ctSavingRef = useRef(false); // synchronous double-click guard
// //   const [ctDraft, setCtDraft] = useState(null);
// //   const ctInputRef = useRef(null);
// //   const [showCtRawText, setShowCtRawText] = useState(false);
// //   const [tnrInput, setTnrInput] = useState("");
// //   const [linkingTnr, setLinkingTnr] = useState(false);
// //   const [showTnrInput, setShowTnrInput] = useState(false);

// //   const [guestSearch, setGuestSearch] = useState("");
// //   const [selectedGuestTnrs, setSelectedGuestTnrs] = useState([]);
// //   const [showGuestInput, setShowGuestInput] = useState(false);
// //   const [linkingGuest, setLinkingGuest] = useState(false);
// //   const [unlinkingGuest, setUnlinkingGuest] = useState(false);

// //   const [editingId, setEditingId] = useState(null);
// //   const [editingDocId, setEditingDocId] = useState(null);
// //   const [editDraft, setEditDraft] = useState(null);
// //   const [savingEdit, setSavingEdit] = useState(false);
// //   const [deletingId, setDeletingId] = useState(null);
// //   const [downloadingZip, setDownloadingZip] = useState(false);

// //   const startEdit = (traveller) => {
// //     setEditingId(traveller._id);
// //     setEditingDocId(traveller.aadhaarDocId || traveller._id);
// //     setEditDraft({
// //       title: traveller.title || "",
// //       firstName: traveller.firstName || "",
// //       lastName: traveller.lastName || "",
// //       age: traveller.age || "",
// //       gender: traveller.gender || "",
// //       sharingType: traveller.sharingType || "",
// //       phone: traveller.phone || "",
// //       address: traveller.address || "",
// //       addressLine1: traveller.addressLine1 || "",
// //       addressLine2: traveller.addressLine2 || "",
// //       city: traveller.city || "",
// //       state: traveller.state || "",
// //       pincode: traveller.pincode || "",
// //     });
// //   };
// //   const cancelEdit = () => {
// //     setEditingId(null);
// //     setEditingDocId(null);
// //     setEditDraft(null);
// //   };
// //   const saveEdit = async () => {
// //     if (!editingId || !editDraft) return;
// //     setSavingEdit(true);
// //     try {
// //       const result = await editAadhaarTraveller(editingDocId || editingId, editDraft);
// //       if (result?.success) {
// //         toast.success("Traveller updated");
// //         cancelEdit();
// //         refresh();
// //       }
// //     } finally {
// //       setSavingEdit(false);
// //     }
// //   };
// //   const handleDeleteTraveller = async (traveller, isMain) => {
// //     const travellerName =
// //       [traveller.title, traveller.firstName, traveller.lastName].filter(Boolean).join(" ") || "this co-traveller";
// //     const confirmMsg = isMain
// //       ? "Delete the Aadhaar FILES (front/back image or PDF) for every traveller in this booking (main + co-travellers)? The already-extracted details (Name, Age, Gender, Address, Aadhaar Number) are kept — only the uploaded files are removed from storage. This cannot be undone."
// //       : `Remove ${travellerName} from this booking? This cannot be undone.`;
// //     if (!window.confirm(confirmMsg)) return;
// //     setDeletingId(traveller._id);
// //     try {
// //       const result = await deleteAadhaarTraveller(traveller.aadhaarDocId || traveller._id);
// //       if (result?.success) {
// //         toast.success(
// //           isMain
// //             ? "Aadhaar files deleted for this booking"
// //             : result.removedTraveller
// //               ? "Co-traveller removed from this booking"
// //               : "Co-traveller's Aadhaar file removed",
// //         );
// //         refresh();
// //       }
// //     } finally {
// //       setDeletingId(null);
// //     }
// //   };

// //   const mainName = [booking.main?.title, booking.main?.firstName, booking.main?.lastName]
// //     .filter(Boolean)
// //     .join(" ") || "Unnamed traveller";
// //   const travellerCount = 1 + (booking.coTravellers?.length || 0);

// //   const guestCandidates = (allBookings || [])
// //     .filter((b) => b.tnr && b.tnr !== booking.tnr)
// //     .filter((b) => !(booking.guestGroup?.otherTnrs || []).includes(b.tnr))
// //     .map((b) => ({
// //       tnr: b.tnr,
// //       name: [b.main?.title, b.main?.firstName, b.main?.lastName].filter(Boolean).join(" ") || "Unnamed traveller",
// //     }))
// //     .filter(({ tnr, name }) => {
// //       const q = guestSearch.trim().toLowerCase();
// //       if (!q) return true;
// //       return tnr.toLowerCase().includes(q) || name.toLowerCase().includes(q);
// //     });

// //   const toggleGuestCandidate = (tnr) => {
// //     setSelectedGuestTnrs((prev) =>
// //       prev.includes(tnr) ? prev.filter((t) => t !== tnr) : [...prev, tnr],
// //     );
// //   };

// //   const safeFileName = (name) =>
// //     (name || "traveller").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "traveller";
// //   const extFromUrl = (url) => {
// //     const match = url.split("?")[0].match(/\.([a-zA-Z0-9]+)$/);
// //     return match ? match[1] : "jpg";
// //   };
// //   // ZIP of Aadhaar images of this booking's active (not approved-cancelled) travellers.
// //   const handleDownloadZip = async () => {
// //     const entries = [];
// //     if (booking.main?.front?.url && !booking.main?.cancelled) {
// //       entries.push({ name: `Main - ${mainName} - Front`, url: booking.main.front.url });
// //     }
// //     if (booking.main?.back?.url && !booking.main?.cancelled) {
// //       entries.push({ name: `Main - ${mainName} - Back`, url: booking.main.back.url });
// //     }
// //     (booking.coTravellers || []).forEach((ct, i) => {
// //       if (ct.cancelled) return;
// //       const ctName = [ct.title, ct.firstName, ct.lastName].filter(Boolean).join(" ") || `Co-Traveller ${i + 1}`;
// //       if (ct.url) {
// //         entries.push({ name: `Co-Traveller ${i + 1} - ${ctName} - Front`, url: ct.url });
// //       }
// //       if (ct.back?.url) {
// //         entries.push({ name: `Co-Traveller ${i + 1} - ${ctName} - Back`, url: ct.back.url });
// //       }
// //     });

// //     if (entries.length === 0) {
// //       toast.error("No Aadhaar images found for this booking's active (non-cancelled) travellers");
// //       return;
// //     }

// //     setDownloadingZip(true);
// //     try {
// //       const zip = new JSZip();
// //       let fetchedCount = 0;
// //       await Promise.all(
// //         entries.map(async (entry) => {
// //           try {
// //             const res = await fetch(entry.url);
// //             if (!res.ok) throw new Error(`HTTP ${res.status}`);
// //             const blob = await res.blob();
// //             zip.file(`${safeFileName(entry.name)}.${extFromUrl(entry.url)}`, blob);
// //             fetchedCount += 1;
// //           } catch (err) {
// //             console.error(`[DownloadZip] Could not fetch "${entry.name}" (${entry.url}):`, err);
// //           }
// //         }),
// //       );

// //       if (fetchedCount === 0) {
// //         toast.error("Could not download any Aadhaar images — check your connection and try again.");
// //         return;
// //       }

// //       const zipBlob = await zip.generateAsync({ type: "blob" });
// //       const link = document.createElement("a");
// //       link.href = URL.createObjectURL(zipBlob);
// //       link.download = `${safeFileName(mainName)}_Aadhaar.zip`;
// //       document.body.appendChild(link);
// //       link.click();
// //       link.remove();
// //       URL.revokeObjectURL(link.href);
// //       toast.success(
// //         fetchedCount < entries.length
// //           ? `Downloaded ${fetchedCount}/${entries.length} Aadhaar images (some failed — check console)`
// //           : "Aadhaar ZIP downloaded",
// //       );
// //     } catch (error) {
// //       console.error("[DownloadZip] error:", error);
// //       toast.error("Could not build the Aadhaar ZIP");
// //     } finally {
// //       setDownloadingZip(false);
// //     }
// //   };

// //   // Step 1 of 2 — OCR into an editable draft (not saved yet).
// //   const handleExtractCt = async () => {
// //     if (!ctFile) return toast.error("Choose the co-traveller's Aadhaar front image first");
// //     setCtExtracting(true);
// //     try {
// //       const formData = new FormData();
// //       formData.append("front", ctFile);
// //       const ocrResult = await extractAadhaar(formData);
// //       if (!ocrResult?.success) {
// //         if (ocrResult === undefined) {
// //           toast.error("Aadhaar read failed — no response from server. Check your connection and try again.");
// //         }
// //         return;
// //       }
// //       if (!ocrResult.front?.url) {
// //         toast.error("Aadhaar was read but the image didn't upload — please try again.");
// //         return;
// //       }

// //       const p = ocrResult.parsed || {};
// //       const ctGender = p.gender || "Male";
// //       const age = Number(p.age) || "";
// //       setCtDraft({
// //         front: ocrResult.front,
// //         title: ctGender === "Female" ? "Mrs" : "Mr",
// //         firstName: p.firstName || "",
// //         lastName: p.lastName || "",
// //         age,
// //         gender: ctGender,
// //         dob: p.dob || "",
// //         phone: p.phone || "",
// //         address: p.address || "",
// //         addressLine1: p.addressLine1 || "",
// //         addressLine2: p.addressLine2 || "",
// //         city: p.city || "",
// //         state: p.state || "",
// //         pincode: p.pincode || "",
// //         sharingType: age >= 11 ? "double" : age >= 6 && age <= 10 ? "withBerth" : "",
// //       });
// //       toast.success("Aadhaar read. Verify details below before adding.");
// //     } catch (err) {
// //       console.error("extract co-traveller error:", err);
// //       toast.error("Something went wrong reading this Aadhaar. Check the console for details.");
// //     } finally {
// //       setCtExtracting(false);
// //     }
// //   };

// //   const clearCtFile = () => {
// //     if (ctInputRef.current) ctInputRef.current.value = "";
// //     setCtFile(null);
// //     setCtDraft(null);
// //   };

// //   const updateCtDraft = (field, value) => {
// //     setCtDraft((prev) => {
// //       const next = { ...prev, [field]: value };
// //       if (field === "gender") next.title = value === "Female" ? "Mrs" : "Mr";
// //       if (field === "age") {
// //         const age = Number(value);
// //         if (age > 85) {
// //           toast.error("Age cannot exceed 85 years.");
// //           return prev;
// //         }
// //         if (age >= 11) next.sharingType = "double";
// //         else if (age >= 6 && age <= 10) next.sharingType = "withBerth";
// //         else next.sharingType = "";
// //       }
// //       return next;
// //     });
// //   };

// //   // Step 2 of 2 — save the draft. For a real booking ("real-<id>") this
// //   // sends tnr; the backend keeps it pending (NOT in Tour Bookings) until
// //   // Raise Manage Booking is approved.
// //   const handleAddCoTraveller = async () => {
// //     if (!ctDraft?.front?.url) return toast.error("Extract the co-traveller's Aadhaar first");
// //     if (ctSavingRef.current) return;
// //     ctSavingRef.current = true;
// //     setCtSaving(true);
// //     try {
// //       const isRealBooking = String(booking.groupId || "").startsWith("real-");
// //       const addResult = await addCoTravellerApi({
// //         ...(isRealBooking ? { tnr: booking.tnr } : { groupId: booking.groupId }),
// //         title: ctDraft.title,
// //         firstName: ctDraft.firstName,
// //         lastName: ctDraft.lastName,
// //         age: ctDraft.age,
// //         dob: ctDraft.dob,
// //         gender: ctDraft.gender,
// //         sharingType: ctDraft.sharingType,
// //         phone: ctDraft.phone,
// //         address: ctDraft.address,
// //         addressLine1: ctDraft.addressLine1,
// //         addressLine2: ctDraft.addressLine2,
// //         city: ctDraft.city,
// //         state: ctDraft.state,
// //         pincode: ctDraft.pincode,
// //         front: ctDraft.front,
// //       });
// //       if (!addResult?.success) {
// //         toast.error(addResult?.message || "Could not save the co-traveller — please try again.");
// //         return;
// //       }

// //       toast.success(
// //         booking.tnr
// //           ? "Co-traveller added — click Raise Manage Booking to add them to the booking"
// //           : "Co-traveller added",
// //       );
// //       clearCtFile();
// //       refresh();
// //     } catch (err) {
// //       console.error("addCoTraveller error:", err);
// //       toast.error("Something went wrong adding this co-traveller. Check the console for details.");
// //     } finally {
// //       ctSavingRef.current = false;
// //       setCtSaving(false);
// //     }
// //   };

// //   const handleLinkTnr = async () => {
// //     if (!tnrInput.trim()) return toast.error("Enter the TNR");
// //     setLinkingTnr(true);
// //     try {
// //       const result = await linkGroupTnr({ groupId: booking.groupId, tnr: tnrInput.trim() });
// //       if (!result?.success) return;
// //       toast.success("TNR linked to this booking");
// //       setTnrInput("");
// //       setShowTnrInput(false);
// //       refresh();
// //     } catch (err) {
// //       console.error("linkGroupTnr error:", err);
// //     } finally {
// //       setLinkingTnr(false);
// //     }
// //   };

// //   const handleLinkGuest = async () => {
// //     if (selectedGuestTnrs.length === 0) return toast.error("Select at least one booking to link");
// //     setLinkingGuest(true);
// //     try {
// //       let okCount = 0;
// //       for (const tnr of selectedGuestTnrs) {
// //         const result = await linkGuestTnr(booking.tnr, tnr);
// //         if (result?.success) okCount += 1;
// //       }
// //       if (okCount === 0) return;
// //       toast.success(
// //         okCount === selectedGuestTnrs.length
// //           ? `Linked as the same guest (${okCount} booking${okCount !== 1 ? "s" : ""})`
// //           : `Linked ${okCount}/${selectedGuestTnrs.length} bookings — check console for the rest`,
// //       );
// //       setSelectedGuestTnrs([]);
// //       setGuestSearch("");
// //       setShowGuestInput(false);
// //       refresh();
// //     } catch (err) {
// //       console.error("linkGuestTnr error:", err);
// //     } finally {
// //       setLinkingGuest(false);
// //     }
// //   };

// //   const handleUnlinkGuest = async () => {
// //     if (!window.confirm("Unlink this booking from its guest group?")) return;
// //     setUnlinkingGuest(true);
// //     try {
// //       const result = await unlinkGuestTnr(booking.tnr);
// //       if (!result?.success) return;
// //       toast.success("Unlinked from guest group");
// //       refresh();
// //     } catch (err) {
// //       console.error("unlinkGuestTnr error:", err);
// //     } finally {
// //       setUnlinkingGuest(false);
// //     }
// //   };

// //   const handleRaiseManageBooking = (traveller) => {
// //     navigate("/tour-managebooking", {
// //       state: {
// //         tnr: booking.tnr,
// //         prefillTraveller: {
// //           title: traveller.title,
// //           firstName: traveller.firstName,
// //           lastName: traveller.lastName,
// //           age: traveller.age,
// //           gender: traveller.gender,
// //           aadhaarId: traveller.aadhaarDocId || traveller._id || null,
// //           isCoTraveller: true,
// //           addedBy: "admin",
// //           addedPostBooking: true,
// //         },
// //       },
// //     });
// //   };

// //   const spineColor = booking.paymentSummary?.fullyPaid
// //     ? "border-l-[#2E7D5E]"
// //     : booking.paymentSummary
// //       ? "border-l-[#B8641F]"
// //       : "border-l-[#C3D4E8]";
// //   const avatarGradient = booking.paymentSummary?.fullyPaid
// //     ? "from-emerald-600 to-emerald-500 shadow-emerald-200"
// //     : booking.paymentSummary
// //       ? "from-amber-600 to-amber-500 shadow-amber-200"
// //       : "from-[#2A5490] to-sky-500 shadow-sky-200";

// //   return (
// //     <div className={`rounded-2xl border border-[#DEE2E8] border-l-4 ${spineColor} shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white`}>
// //       <div className="w-full flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 px-3.5 sm:px-5 py-3.5 sm:py-4 bg-gradient-to-r from-[#F5F6F8] to-[#F8FAFC] hover:from-[#EEF0F3] hover:to-[#EEF3FA] transition-colors">
// //         <div
// //           role="button"
// //           tabIndex={0}
// //           onClick={onToggle}
// //           onKeyDown={(e) => {
// //             if (e.key === "Enter" || e.key === " ") {
// //               e.preventDefault();
// //               onToggle();
// //             }
// //           }}
// //           className="flex-1 min-w-0 flex items-center gap-2.5 sm:gap-3 text-left cursor-pointer"
// //         >
// //           <div className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-gradient-to-br ${avatarGradient} text-white flex items-center justify-center shadow-sm`}>
// //             <IdCard className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
// //           </div>
// //           <div className="min-w-0">
// //             <p className="font-bold text-[#1C2733] truncate">{mainName}</p>
// //             <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
// //               <span className="truncate max-w-full">
// //                 {booking.tourTitle || "Tour"} · {travellerCount} traveller{travellerCount !== 1 ? "s" : ""}
// //               </span>
// //               {booking.tnr && (
// //                 <span className="inline-flex items-center gap-1 text-[#1F3F6E] font-bold font-mono tracking-wide">
// //                   <Ticket className="w-3 h-3 shrink-0" /> {booking.tnr}
// //                   <CopyTnrButton tnr={booking.tnr} />
// //                 </span>
// //               )}
// //               {booking.tnr && (
// //                 <span
// //                   className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${booking.createdBy === "user" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
// //                     }`}
// //                 >
// //                   ● {booking.createdBy === "user" ? "USER" : "ADMIN"}
// //                 </span>
// //               )}
// //               {booking.raisedBy?.name && (
// //                 <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
// //                   <UserCheck className="w-3 h-3 shrink-0" /> Raised by {booking.raisedBy.name}
// //                   {booking.raisedBy.employeeId ? ` (${booking.raisedBy.employeeId})` : ""}
// //                 </span>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //         <div className="flex items-center gap-2 shrink-0">
// //           <button
// //             onClick={(e) => { e.stopPropagation(); handleDownloadZip(); }}
// //             disabled={downloadingZip}
// //             title="Download Aadhaar images of this booking's current travellers as a ZIP"
// //             className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#C3D4E8] bg-white text-[#1F3F6E] text-xs font-semibold hover:bg-[#EEF3FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
// //           >
// //             {downloadingZip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
// //             <span className="hidden sm:inline">{downloadingZip ? "Zipping..." : "Aadhaar ZIP"}</span>
// //           </button>
// //           <button onClick={onToggle} className="shrink-0 p-1">
// //             {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
// //           </button>
// //         </div>
// //       </div>

// //       {expanded && (
// //         <div className="p-5 sm:p-6 border-t-2 border-dashed border-[#DEE2E8] space-y-6">
// //           {/* Same guest, different TNR */}
// //           {booking.tnr && (
// //             <div className="rounded-xl border border-[#F5E6C8] bg-[#FBF4E7]/50 p-3">
// //               {booking.guestGroup ? (
// //                 <div className="space-y-2">
// //                   <p className="text-xs font-bold text-[#6B4A18] flex items-center gap-1.5">
// //                     <Users className="w-3.5 h-3.5" /> Same guest — {booking.guestGroup.otherTnrs.length} other booking{booking.guestGroup.otherTnrs.length !== 1 ? "s" : ""}
// //                   </p>
// //                   <div className="flex flex-wrap gap-1.5">
// //                     {booking.guestGroup.otherTnrs.map((t) => {
// //                       const matched = (allBookings || []).find((b) => b.tnr === t);
// //                       const matchedName = matched
// //                         ? [matched.main?.title, matched.main?.firstName, matched.main?.lastName]
// //                           .filter(Boolean)
// //                           .join(" ")
// //                         : "";
// //                       return (
// //                         <span
// //                           key={t}
// //                           className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-[#EAD29C] text-[#6B4A18] text-xs font-semibold"
// //                         >
// //                           <Ticket className="w-3 h-3 shrink-0" /> {t}
// //                           {matchedName && <span className="font-normal text-[#B07D2B]">· {matchedName}</span>}
// //                         </span>
// //                       );
// //                     })}
// //                   </div>
// //                   {booking.guestGroup.label && (
// //                     <p className="text-xs text-[#8C6220]">{booking.guestGroup.label}</p>
// //                   )}
// //                   <button
// //                     onClick={handleUnlinkGuest}
// //                     disabled={unlinkingGuest}
// //                     className="text-xs font-semibold text-[#A33333] hover:text-[#6E2222] disabled:opacity-50 disabled:cursor-not-allowed"
// //                   >
// //                     {unlinkingGuest ? "Unlinking..." : "Unlink this booking"}
// //                   </button>
// //                 </div>
// //               ) : !showGuestInput ? (
// //                 <button
// //                   onClick={() => setShowGuestInput(true)}
// //                   className="flex items-center gap-1.5 text-xs font-semibold text-[#8C6220] hover:text-[#4F3712]"
// //                 >
// //                   <Link2 className="w-3.5 h-3.5" /> Link as same guest as another booking
// //                 </button>
// //               ) : (
// //                 <div className="space-y-2">
// //                   <input
// //                     type="text"
// //                     value={guestSearch}
// //                     onChange={(e) => setGuestSearch(e.target.value)}
// //                     placeholder="Search by TNR or traveller name"
// //                     className="w-full px-3 py-1.5 bg-white border border-[#EAD29C] rounded-lg text-xs focus:border-[#C89B44] focus:ring-2 focus:ring-[#F5E6C8] outline-none transition-all"
// //                   />

// //                   {selectedGuestTnrs.length > 0 && (
// //                     <div className="flex flex-wrap gap-1.5">
// //                       {selectedGuestTnrs.map((t) => (
// //                         <span
// //                           key={t}
// //                           className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#B07D2B] text-white text-xs font-semibold"
// //                         >
// //                           {t}
// //                         </span>
// //                       ))}
// //                     </div>
// //                   )}

// //                   <div className="max-h-48 overflow-y-auto rounded-lg border border-[#EAD29C] bg-white divide-y divide-[#FBF4E7]">
// //                     {guestCandidates.length === 0 ? (
// //                       <p className="text-xs text-gray-400 px-3 py-3 text-center">
// //                         {guestSearch.trim() ? "No matching bookings" : "No other bookings with a TNR yet"}
// //                       </p>
// //                     ) : (
// //                       guestCandidates.map(({ tnr, name }) => (
// //                         <label
// //                           key={tnr}
// //                           className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-[#FBF4E7] text-xs"
// //                         >
// //                           <input
// //                             type="checkbox"
// //                             checked={selectedGuestTnrs.includes(tnr)}
// //                             onChange={() => toggleGuestCandidate(tnr)}
// //                             className="w-3.5 h-3.5 accent-[#B07D2B] shrink-0"
// //                           />
// //                           <span className="flex items-center gap-1 font-semibold text-[#1F3F6E] shrink-0">
// //                             <Ticket className="w-3 h-3" /> {tnr}
// //                           </span>
// //                           <span className="text-gray-600 truncate">{name}</span>
// //                         </label>
// //                       ))
// //                     )}
// //                   </div>

// //                   <div className="flex items-center gap-2">
// //                     <button
// //                       onClick={handleLinkGuest}
// //                       disabled={linkingGuest || selectedGuestTnrs.length === 0}
// //                       className="px-3 py-1.5 bg-[#B07D2B] hover:bg-[#8C6220] disabled:bg-[#C9CFD8] text-white rounded-lg text-xs font-semibold transition-colors"
// //                     >
// //                       {linkingGuest ? "Linking..." : `Save${selectedGuestTnrs.length ? ` (${selectedGuestTnrs.length})` : ""}`}
// //                     </button>
// //                     <button
// //                       onClick={() => { setShowGuestInput(false); setSelectedGuestTnrs([]); setGuestSearch(""); }}
// //                       className="text-xs text-gray-500 hover:text-gray-700"
// //                     >
// //                       Cancel
// //                     </button>
// //                   </div>
// //                 </div>
// //               )}
// //             </div>
// //           )}

// //           {/* Booking notes — reference only */}
// //           {booking.bookingNotes && (
// //             <div className="text-xs text-gray-500 bg-[#F7F8FA] rounded-xl p-3 border border-[#E7EAEF] space-y-1.5">
// //               <div className="flex flex-col gap-1">
// //                 {booking.bookingNotes.packageType && <span><b>Package:</b> {booking.bookingNotes.packageType}</span>}
// //                 {booking.bookingNotes.boardingPoint && <span><b>Boarding:</b> {booking.bookingNotes.boardingPoint}</span>}
// //                 {booking.bookingNotes.deboardingPoint && <span><b>Deboarding:</b> {booking.bookingNotes.deboardingPoint}</span>}
// //                 {booking.bookingNotes.remarks && <span><b>Remarks:</b> {booking.bookingNotes.remarks}</span>}
// //               </div>
// //               {booking.bookingNotes.addonsDetail?.length > 0 ? (
// //                 <div className="flex flex-col gap-1.5 pt-1">
// //                   {booking.bookingNotes.addonsDetail.map((a, i) => (
// //                     <div
// //                       key={i}
// //                       className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#DCE6F2] text-[#17314F] font-medium"
// //                     >
// //                       <Train className="w-3.5 h-3.5 shrink-0" />
// //                       <span className="flex-1 min-w-0 truncate">{a.label ? `${a.label}: ` : ""}{a.name}</span>
// //                       {a.amount > 0 && <span className="shrink-0 text-[#2A5490] font-semibold">₹{a.amount}</span>}
// //                     </div>
// //                   ))}
// //                 </div>
// //               ) : (
// //                 booking.bookingNotes.addons && <div><b>Add-ons:</b> {booking.bookingNotes.addons}</div>
// //               )}
// //             </div>
// //           )}

// //           {/* Main traveller */}
// //           <div>
// //             <h4 className="flex items-center gap-2 font-bold text-gray-800 text-sm mb-2">
// //               <IdCard className="w-4 h-4 text-[#2A5490]" /> Main Traveller
// //             </h4>
// //             {editingId === booking.main?._id ? (
// //               <TravellerEditForm
// //                 draft={editDraft}
// //                 setDraft={setEditDraft}
// //                 onSave={saveEdit}
// //                 onCancel={cancelEdit}
// //                 saving={savingEdit}
// //                 accent="indigo"
// //               />
// //             ) : (
// //               <div className="flex flex-col items-start gap-1.5 text-sm text-gray-600 bg-[#EEF3FA]/60 border border-[#DCE6F2] rounded-xl p-3">
// //                 <span className="font-semibold text-gray-800">{mainName}</span>
// //                 <CancelStatusBadge status={booking.main?.cancelStatus} />
// //                 <span>Age: {booking.main?.age || "—"}</span>
// //                 <span>Gender: {booking.main?.gender || "—"}</span>
// //                 <span>Mobile: {booking.main?.phone || "—"}</span>
// //                 {booking.main?.sharingType && (
// //                   <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#DCE6F2] text-[#1F3F6E] font-semibold text-xs">
// //                     {SHARING_LABELS[booking.main.sharingType] || booking.main.sharingType}
// //                   </span>
// //                 )}
// //                 {booking.main?.front?.url && (
// //                   <a href={booking.main.front.url} target="_blank" rel="noopener noreferrer" className="text-[#2A5490] font-semibold underline">View Front</a>
// //                 )}
// //                 {booking.main?.back?.url && (
// //                   <a href={booking.main.back.url} target="_blank" rel="noopener noreferrer" className="text-[#2A5490] font-semibold underline">View Back</a>
// //                 )}
// //                 {booking.main?.address && (
// //                   <span className="w-full flex items-center gap-1.5 text-gray-600">
// //                     <Home className="w-3.5 h-3.5 text-[#3A6698] shrink-0" /> {booking.main.address}
// //                   </span>
// //                 )}
// //                 {/* Edit/Delete only before a real tnr exists. */}
// //                 {!booking.tnr && booking.main?._id && (
// //                   <div className="w-full flex items-center gap-2 pt-1">
// //                     <button
// //                       onClick={() => startEdit(booking.main)}
// //                       className="flex items-center gap-1 px-2.5 py-1 bg-white border border-[#9FB9D8] hover:bg-[#DCE6F2] text-[#1F3F6E] rounded-lg text-xs font-semibold transition-colors"
// //                     >
// //                       <Pencil className="w-3 h-3" /> Edit
// //                     </button>
// //                     <button
// //                       onClick={() => handleDeleteTraveller(booking.main, true)}
// //                       disabled={deletingId === booking.main._id}
// //                       className="flex items-center gap-1 px-2.5 py-1 bg-white border border-[#D99999] hover:bg-[#FBEEEE] text-[#A33333] rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
// //                     >
// //                       <Trash2 className="w-3 h-3" /> {deletingId === booking.main._id ? "Deleting..." : "Delete Booking"}
// //                     </button>
// //                   </div>
// //                 )}
// //               </div>
// //             )}
// //             {/* Missing Aadhaar on a real booking — upload row (hidden for
// //                 cancelled/rejected travellers). */}
// //             {booking.tnr && booking.main?._id && !booking.main?.front?.url && uploadUserTravellerAadhaar &&
// //               booking.main?.cancelStatus !== "cancelled" && booking.main?.cancelStatus !== "rejected" && (
// //                 <TravellerAadhaarRow
// //                   traveller={{
// //                     _id: booking.main._id,
// //                     title: booking.main.title,
// //                     firstName: booking.main.firstName,
// //                     lastName: booking.main.lastName,
// //                     age: booking.main.age,
// //                     gender: booking.main.gender,
// //                     isCoTraveller: false,
// //                     hasAadhaar: false,
// //                   }}
// //                   tnr={booking.tnr}
// //                   extractAadhaar={extractAadhaar}
// //                   uploadUserTravellerAadhaar={uploadUserTravellerAadhaar}
// //                   onSaved={refresh}
// //                 />
// //               )}
// //           </div>

// //           {/* Co-travellers */}
// //           <div>
// //             <h4 className="flex items-center gap-2 font-bold text-gray-800 text-sm mb-2">
// //               <Users className="w-4 h-4 text-[#B07D2B]" /> Co-Travellers ({booking.coTravellers.length})
// //             </h4>
// //             {booking.coTravellers.length > 0 && (
// //               <div className="space-y-2 mb-3">
// //                 {booking.coTravellers.map((ct, i) => {
// //                   const ctName = [ct.title, ct.firstName, ct.lastName].filter(Boolean).join(" ") || `Traveller ${i + 2}`;
// //                   if (editingId === ct._id) {
// //                     return (
// //                       <TravellerEditForm
// //                         key={ct._id || i}
// //                         draft={editDraft}
// //                         setDraft={setEditDraft}
// //                         onSave={saveEdit}
// //                         onCancel={cancelEdit}
// //                         saving={savingEdit}
// //                         accent="purple"
// //                       />
// //                     );
// //                   }
// //                   return (
// //                     <React.Fragment key={ct._id || i}>
// //                       <div className="flex flex-col gap-3 text-sm text-gray-600 bg-[#FBF4E7]/60 border border-[#F5E6C8] rounded-xl p-3">
// //                         <div className="flex flex-col items-start gap-1.5">
// //                           <span className="font-semibold text-gray-800">{ctName}</span>
// //                           <CancelStatusBadge status={ct.cancelStatus} />
// //                           <span>Age: {ct.age || "—"}</span>
// //                           <span>Gender: {ct.gender || "—"}</span>
// //                           {ct.sharingType && (
// //                             <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#F5E6C8] text-[#8C6220] font-semibold text-xs">
// //                               {SHARING_LABELS[ct.sharingType] || ct.sharingType}
// //                             </span>
// //                           )}
// //                           {ct.url && (
// //                             <a href={ct.url} target="_blank" rel="noopener noreferrer" className="text-[#2A5490] font-semibold underline">View Front</a>
// //                           )}
// //                           {ct.back?.url && (
// //                             <a href={ct.back.url} target="_blank" rel="noopener noreferrer" className="text-[#2A5490] font-semibold underline">View Back</a>
// //                           )}
// //                         </div>
// //                         {/* Before a tnr exists → Edit/Remove.
// //                             After a tnr exists, for a co-traveller added later
// //                             (postBooking) → Edit/Remove + Raise Manage Booking,
// //                             UNTIL Manage Booking is approved and they're in
// //                             Tour Bookings (ct.inRealBooking) → then only the
// //                             "Added to booking" badge. Rejected → not in Tour
// //                             Bookings → buttons visible again. Same for ADMIN
// //                             and USER bookings. */}
// //                         {(!booking.tnr || ct.postBooking) && !ct.inRealBooking && (
// //                           <div className="flex flex-wrap items-center gap-2">
// //                             <button
// //                               onClick={() => startEdit(ct)}
// //                               className="flex items-center gap-1 px-2.5 py-1 bg-white border border-[#DCB86D] hover:bg-[#F5E6C8] text-[#8C6220] rounded-lg text-xs font-semibold transition-colors"
// //                             >
// //                               <Pencil className="w-3 h-3" /> Edit
// //                             </button>
// //                             <button
// //                               onClick={() => handleDeleteTraveller(ct, false)}
// //                               disabled={deletingId === ct._id}
// //                               className="flex items-center gap-1 px-2.5 py-1 bg-white border border-[#D99999] hover:bg-[#FBEEEE] text-[#A33333] rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
// //                             >
// //                               <Trash2 className="w-3 h-3" /> {deletingId === ct._id ? "Removing..." : "Remove"}
// //                             </button>
// //                             {booking.tnr && ct.postBooking && (
// //                               <button
// //                                 onClick={() => handleRaiseManageBooking(ct)}
// //                                 className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B07D2B] hover:bg-[#8C6220] text-white rounded-lg text-xs font-bold transition-colors"
// //                               >
// //                                 Raise Manage Booking <ArrowRight className="w-3.5 h-3.5" />
// //                               </button>
// //                             )}
// //                           </div>
// //                         )}
// //                         {booking.tnr && ct.postBooking && ct.inRealBooking && (
// //                           <span className="inline-flex w-fit items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EDF6F1] border border-[#B6DFC8] text-[#235F47] text-xs font-bold">
// //                             <CheckCircle2 className="w-3.5 h-3.5" /> Added to booking
// //                           </span>
// //                         )}
// //                       </div>
// //                       {booking.tnr && ct._id && !ct.url && uploadUserTravellerAadhaar &&
// //                         ct.cancelStatus !== "cancelled" && ct.cancelStatus !== "rejected" && (
// //                           <TravellerAadhaarRow
// //                             traveller={{
// //                               _id: ct._id,
// //                               title: ct.title,
// //                               firstName: ct.firstName,
// //                               lastName: ct.lastName,
// //                               age: ct.age,
// //                               gender: ct.gender,
// //                               isCoTraveller: true,
// //                               hasAadhaar: false,
// //                             }}
// //                             tnr={booking.tnr}
// //                             extractAadhaar={extractAadhaar}
// //                             uploadUserTravellerAadhaar={uploadUserTravellerAadhaar}
// //                             onSaved={refresh}
// //                           />
// //                         )}
// //                     </React.Fragment>
// //                   );
// //                 })}
// //               </div>
// //             )}

// //             {/* Add co-traveller — OCR first, verify, then save. */}
// //             <div className="p-4 sm:p-5 rounded-xl border-2 border-dashed border-[#DCB86D] bg-[#FBF4E7]/30">
// //               <p className="text-xs font-bold text-gray-600 mb-3">Add Co-Traveller (via Aadhaar)</p>
// //               <div className="flex flex-wrap items-end gap-3">
// //                 <div className="flex-1 min-w-[160px]">
// //                   <label className="block text-xs font-semibold text-gray-600 mb-1.5">Aadhaar Front</label>
// //                   <div className="flex items-center gap-2">
// //                     <input
// //                       ref={ctInputRef}
// //                       type="file"
// //                       accept="image/*,application/pdf"
// //                       onChange={(e) => {
// //                         setCtFile(e.target.files?.[0] || null);
// //                         setCtDraft(null);
// //                       }}
// //                       className="flex-1 min-w-0 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#F5E6C8] file:text-[#8C6220] hover:file:bg-[#EAD29C]"
// //                     />
// //                     {(ctFile || ctDraft) && (
// //                       <button
// //                         type="button"
// //                         onClick={clearCtFile}
// //                         className="shrink-0 text-gray-400 hover:text-[#A33333]"
// //                         title={ctDraft ? "Remove this Aadhaar and redo it" : "Clear chosen file"}
// //                       >
// //                         <XCircle className="w-4 h-4" />
// //                       </button>
// //                     )}
// //                   </div>
// //                 </div>
// //                 <button
// //                   onClick={handleExtractCt}
// //                   disabled={ctExtracting || !ctFile || !!ctDraft}
// //                   className="flex items-center gap-2 px-5 py-2.5 bg-[#B07D2B] hover:bg-[#8C6220] disabled:bg-[#C9CFD8] text-white rounded-xl font-bold text-sm transition-colors"
// //                 >
// //                   {ctExtracting ? (
// //                     <>
// //                       <Loader2 className="w-4 h-4 animate-spin" /> Reading...
// //                     </>
// //                   ) : (
// //                     <>
// //                       <Upload className="w-4 h-4" /> Extract Aadhaar
// //                     </>
// //                   )}
// //                 </button>
// //               </div>

// //               {ctDraft && (
// //                 <>
// //                   <div className="grid sm:grid-cols-4 gap-3 mt-4">
// //                     <div>
// //                       <label className="block text-xs font-medium text-gray-600">Title</label>
// //                       <select
// //                         value={ctDraft.title}
// //                         onChange={(e) => updateCtDraft("title", e.target.value)}
// //                         className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
// //                       >
// //                         <option>Mr</option>
// //                         <option>Mrs</option>
// //                         <option>Ms</option>
// //                       </select>
// //                     </div>
// //                     <div>
// //                       <label className="block text-xs font-medium text-gray-600">First Name</label>
// //                       <input
// //                         type="text"
// //                         value={ctDraft.firstName}
// //                         onChange={(e) => updateCtDraft("firstName", e.target.value)}
// //                         className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
// //                       />
// //                     </div>
// //                     <div>
// //                       <label className="block text-xs font-medium text-gray-600">Last Name</label>
// //                       <input
// //                         type="text"
// //                         value={ctDraft.lastName}
// //                         onChange={(e) => updateCtDraft("lastName", e.target.value)}
// //                         className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
// //                       />
// //                     </div>
// //                     <div>
// //                       <label className="block text-xs font-medium text-gray-600">Age</label>
// //                       <input
// //                         type="number"
// //                         value={ctDraft.age}
// //                         onChange={(e) => updateCtDraft("age", e.target.value)}
// //                         className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
// //                       />
// //                     </div>
// //                   </div>
// //                   <div className="grid sm:grid-cols-2 gap-3 mt-3">
// //                     <div>
// //                       <label className="block text-xs font-medium text-gray-600">Gender</label>
// //                       <select
// //                         value={ctDraft.gender}
// //                         onChange={(e) => updateCtDraft("gender", e.target.value)}
// //                         className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
// //                       >
// //                         <option>Male</option>
// //                         <option>Female</option>
// //                         <option>Other</option>
// //                       </select>
// //                     </div>
// //                     <div>
// //                       <label className="block text-xs font-medium text-gray-600">Sharing Type</label>
// //                       <select
// //                         value={ctDraft.sharingType}
// //                         onChange={(e) => updateCtDraft("sharingType", e.target.value)}
// //                         className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
// //                       >
// //                         <option value="">Select Sharing</option>
// //                         {Number(ctDraft.age) >= 11 ? (
// //                           <>
// //                             <option value="double">Double Sharing</option>
// //                             <option value="triple">Triple Sharing</option>
// //                           </>
// //                         ) : Number(ctDraft.age) >= 6 && Number(ctDraft.age) <= 10 ? (
// //                           <>
// //                             <option value="withBerth">Child with Berth</option>
// //                             <option value="withoutBerth">Child without Berth</option>
// //                           </>
// //                         ) : null}
// //                       </select>
// //                     </div>
// //                   </div>
// //                   {ctDraft.front?.ocrText && (
// //                     <button
// //                       type="button"
// //                       onClick={() => setShowCtRawText((v) => !v)}
// //                       className="mt-3 text-xs font-semibold text-gray-400 hover:text-gray-600"
// //                     >
// //                       {showCtRawText ? "Hide" : "Show"} raw text read
// //                     </button>
// //                   )}
// //                   {showCtRawText && ctDraft.front?.ocrText && (
// //                     <pre className="mt-2 p-3 bg-[#F7F8FA] border border-[#DEE2E8] rounded-lg text-[11px] text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
// //                       {ctDraft.front.ocrText}
// //                     </pre>
// //                   )}
// //                   <button
// //                     onClick={handleAddCoTraveller}
// //                     disabled={ctSaving}
// //                     className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#B07D2B] hover:bg-[#8C6220] disabled:bg-[#C9CFD8] text-white rounded-xl font-bold text-sm transition-colors"
// //                   >
// //                     {ctSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
// //                     Add Co-Traveller
// //                   </button>
// //                 </>
// //               )}
// //             </div>
// //           </div>

// //           {/* Payments */}
// //           <div>
// //             <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
// //               <h4 className="flex items-center gap-2 font-bold text-gray-800 text-sm">
// //                 <IndianRupee className="w-4 h-4 text-[#2E7D5E]" /> Payment Screenshots
// //               </h4>
// //               {booking.paymentSummary && (
// //                 booking.paymentSummary.fullyPaid ? (
// //                   <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#235F47] bg-[#EDF6F1] border-2 border-dashed border-[#2E7D5E] rounded-full px-3.5 py-1 -rotate-2 shadow-sm">
// //                     <CheckCircle2 className="w-3.5 h-3.5" /> Balance Fully Paid
// //                   </span>
// //                 ) : (
// //                   <span className="flex items-center gap-1.5 text-xs font-semibold text-[#93501A] bg-[#FBF1E6] border border-[#E8C89A] rounded-full px-3 py-1">
// //                     Balance Due: ₹{booking.paymentSummary.balanceRemaining.toLocaleString("en-IN")}
// //                     <span className="font-normal text-[#B8641F]">
// //                       (of ₹{booking.paymentSummary.packageAmount.toLocaleString("en-IN")})
// //                     </span>
// //                   </span>
// //                 )
// //               )}
// //             </div>
// //             <div className="grid md:grid-cols-3 gap-3">
// //               {PAYMENT_TYPES.map(({ type, label }) => {
// //                 const items = booking.payments[type] || [];
// //                 return (
// //                   <PaymentSlot
// //                     key={type}
// //                     groupId={booking.groupId}
// //                     tnr={booking.tnr}
// //                     type={type}
// //                     label={label}
// //                     items={items}
// //                     uploadGroupPayment={uploadGroupPayment}
// //                     deleteGroupPayment={deleteGroupPayment}
// //                     refresh={refresh}
// //                   />
// //                 );
// //               })}
// //             </div>
// //           </div>

// //           {/* Create Booking / link TNR */}
// //           {!booking.tnr && (
// //             <div className="pt-2 border-t border-[#E7EAEF]">
// //               <button
// //                 onClick={onCreateBooking}
// //                 className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[#1F3F6E] to-[#2A5490] hover:from-[#17314F] hover:to-[#1F3F6E] text-white rounded-xl font-bold text-sm shadow-sm transition-all"
// //               >
// //                 Create Booking <ArrowRight className="w-4 h-4" />
// //               </button>
// //               <p className="text-center text-[11px] text-gray-400 mt-2">
// //                 TNR links automatically once the booking is created — hit Refresh above after creating it.
// //               </p>

// //               {!showTnrInput ? (
// //                 <button
// //                   onClick={() => setShowTnrInput(true)}
// //                   className="w-full text-center text-xs font-semibold text-gray-400 hover:text-[#2A5490] mt-1"
// //                 >
// //                   Didn't auto-link? Paste the TNR manually
// //                 </button>
// //               ) : (
// //                 <div className="flex gap-2 mt-3">
// //                   <input
// //                     type="text"
// //                     value={tnrInput}
// //                     onChange={(e) => setTnrInput(e.target.value)}
// //                     placeholder="e.g. EP69TQ"
// //                     className="flex-1 px-3.5 py-2.5 bg-white border border-[#DEE2E8] rounded-xl text-sm uppercase focus:border-[#5C84B3] focus:ring-4 focus:ring-[#DCE6F2] outline-none transition-all"
// //                   />
// //                   <button
// //                     onClick={handleLinkTnr}
// //                     disabled={linkingTnr}
// //                     className="flex items-center gap-1.5 px-4 py-2.5 bg-[#2A5490] hover:bg-[#1F3F6E] disabled:bg-[#C9CFD8] text-white rounded-xl font-bold text-sm transition-colors"
// //                   >
// //                     {linkingTnr ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
// //                     Link
// //                   </button>
// //                 </div>
// //               )}
// //             </div>
// //           )}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // const AllBookingsTab = ({ getAadhaarBookings, extractAadhaar, addCoTravellerApi, uploadGroupPayment, deleteGroupPayment, uploadUserTravellerAadhaar, linkGroupTnr, editAadhaarTraveller, deleteAadhaarTraveller, linkGuestTnr, unlinkGuestTnr, deleteBookingByTnr, navigate, tourId, tourTitle }) => {
// //   const [bookings, setBookings] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [expanded, setExpanded] = useState({});
// //   const [downloadingAllZip, setDownloadingAllZip] = useState(false);
// //   const [searchQuery, setSearchQuery] = useState("");

// //   const fetchBookings = async () => {
// //     setLoading(true);
// //     try {
// //       const result = await getAadhaarBookings();
// //       if (result?.success) setBookings(result.bookings || []);
// //     } catch (err) {
// //       console.error("getAadhaarBookings error:", err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchBookings();
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [tourId]);

// //   const toggleExpand = (groupId) => setExpanded((prev) => ({ ...prev, [groupId]: !prev[groupId] }));

// //   const handleCreateBooking = (booking) => {
// //     const mainT = booking.main;
// //     const finalTravellers = [
// //       {
// //         title: mainT?.title,
// //         firstName: mainT?.firstName,
// //         lastName: mainT?.lastName,
// //         age: mainT?.age,
// //         gender: mainT?.gender,
// //         sharingType: mainT?.sharingType,
// //         isCoTraveller: false,
// //         phone: mainT?.phone,
// //         address: mainT?.address,
// //         _aadhaar: { front: mainT?.front || null, back: mainT?.back || null },
// //       },
// //       ...(booking.coTravellers || []).map((ct) => ({
// //         title: ct.title,
// //         firstName: ct.firstName,
// //         lastName: ct.lastName,
// //         age: ct.age,
// //         gender: ct.gender,
// //         sharingType: ct.sharingType,
// //         isCoTraveller: true,
// //         phone: ct.phone,
// //         address: ct.address,
// //         _aadhaar: { front: { url: ct.url }, back: null },
// //       })),
// //     ];

// //     navigate("/creat-bookings", {
// //       state: {
// //         tourId: booking.tourId,
// //         travellers: finalTravellers,
// //         paymentScreenshots: booking.payments?.advance?.length
// //           ? {
// //             advance: {
// //               url: booking.payments.advance[booking.payments.advance.length - 1].url,
// //               amount: booking.payments.advance[booking.payments.advance.length - 1].amount,
// //             },
// //           }
// //           : {},
// //         contactMobile: mainT?.phone || "",
// //         contactAddress: mainT?.address || "",
// //         contactAddressLine1: mainT?.addressLine1 || "",
// //         contactAddressLine2: mainT?.addressLine2 || "",
// //         contactCity: mainT?.city || "",
// //         contactState: mainT?.state || "",
// //         contactPincode: mainT?.pincode || "",
// //         groupId: booking.groupId,
// //         bookingNotes: booking.bookingNotes || null,
// //       },
// //     });
// //   };

// //   const visibleBookings = tourId
// //     ? bookings.filter((b) => String(b.tourId || "") === String(tourId))
// //     : bookings;

// //   const bookingMatchesSearch = (b, q) => {
// //     const names = [b.main, ...(b.coTravellers || [])]
// //       .map((t) => [t?.title, t?.firstName, t?.lastName].filter(Boolean).join(" "))
// //       .join(" ");
// //     const haystack = [names, b.tnr, b.main?.phone, b.main?.aadhaarNumber].filter(Boolean).join(" ").toLowerCase();
// //     return haystack.includes(q);
// //   };
// //   const searchedBookings = (() => {
// //     const q = searchQuery.trim().toLowerCase();
// //     if (!q) return visibleBookings;
// //     return visibleBookings.filter((b) => bookingMatchesSearch(b, q));
// //   })();

// //   const tourZipSafeName = (name) =>
// //     (name || "file").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "file";
// //   const tourZipExtFromUrl = (url) => {
// //     const match = url.split("?")[0].match(/\.([a-zA-Z0-9]+)$/);
// //     return match ? match[1] : "jpg";
// //   };
// //   // Whole-tour Aadhaar ZIP — flat, booking name/tnr baked into each filename.
// //   const handleDownloadAllZip = async () => {
// //     if (visibleBookings.length === 0) {
// //       toast.error("No bookings to download for this tour");
// //       return;
// //     }
// //     setDownloadingAllZip(true);
// //     try {
// //       const zip = new JSZip();
// //       let fetchedCount = 0;
// //       let totalCount = 0;

// //       await Promise.all(
// //         visibleBookings.map(async (booking, bIdx) => {
// //           const mainName = [booking.main?.title, booking.main?.firstName, booking.main?.lastName]
// //             .filter(Boolean)
// //             .join(" ") || `Booking ${bIdx + 1}`;
// //           const bookingPrefix = `${bIdx + 1}. ${tourZipSafeName(mainName)}${booking.tnr ? `_${booking.tnr}` : ""}`;

// //           const entries = [];
// //           if (booking.main?.front?.url) {
// //             entries.push({ name: `${bookingPrefix} - Main - ${mainName} - Front`, url: booking.main.front.url });
// //           }
// //           if (booking.main?.back?.url) {
// //             entries.push({ name: `${bookingPrefix} - Main - ${mainName} - Back`, url: booking.main.back.url });
// //           }
// //           (booking.coTravellers || []).forEach((ct, i) => {
// //             const ctName = [ct.title, ct.firstName, ct.lastName].filter(Boolean).join(" ") || `Co-Traveller ${i + 1}`;
// //             if (ct.url) {
// //               entries.push({ name: `${bookingPrefix} - Co-Traveller ${i + 1} - ${ctName} - Front`, url: ct.url });
// //             }
// //             if (ct.back?.url) {
// //               entries.push({ name: `${bookingPrefix} - Co-Traveller ${i + 1} - ${ctName} - Back`, url: ct.back.url });
// //             }
// //           });

// //           totalCount += entries.length;

// //           await Promise.all(
// //             entries.map(async (entry) => {
// //               try {
// //                 const res = await fetch(entry.url);
// //                 if (!res.ok) throw new Error(`HTTP ${res.status}`);
// //                 const blob = await res.blob();
// //                 zip.file(`${tourZipSafeName(entry.name)}.${tourZipExtFromUrl(entry.url)}`, blob);
// //                 fetchedCount += 1;
// //               } catch (err) {
// //                 console.error(`[DownloadAllZip] Could not fetch "${entry.name}" (${entry.url}):`, err);
// //               }
// //             }),
// //           );
// //         }),
// //       );

// //       if (fetchedCount === 0) {
// //         toast.error("Could not download any Aadhaar images for this tour");
// //         return;
// //       }

// //       const zipBlob = await zip.generateAsync({ type: "blob" });
// //       const link = document.createElement("a");
// //       link.href = URL.createObjectURL(zipBlob);
// //       link.download = `${tourZipSafeName(tourTitle || "Tour")}_All_Aadhaar.zip`;
// //       document.body.appendChild(link);
// //       link.click();
// //       link.remove();
// //       URL.revokeObjectURL(link.href);
// //       toast.success(
// //         fetchedCount < totalCount
// //           ? `Downloaded ${fetchedCount}/${totalCount} Aadhaar images (some failed — check console)`
// //           : `Downloaded all Aadhaar images for ${visibleBookings.length} booking${visibleBookings.length !== 1 ? "s" : ""}`,
// //       );
// //     } catch (error) {
// //       console.error("[DownloadAllZip] error:", error);
// //       toast.error("Could not build the tour's Aadhaar ZIP");
// //     } finally {
// //       setDownloadingAllZip(false);
// //     }
// //   };

// //   // Deletes Aadhaar FILES (never extracted data) for every booking in this
// //   // tour — main traveller's aadhaarDocId clears the whole booking.
// //   const [deletingAllAadhaar, setDeletingAllAadhaar] = useState(false);
// //   const handleDeleteAllAadhaar = async () => {
// //     const mainDocIds = visibleBookings.map((b) => b.main?.aadhaarDocId).filter(Boolean);
// //     if (mainDocIds.length === 0) {
// //       toast.error("No bookings with Aadhaar to delete for this tour");
// //       return;
// //     }
// //     if (
// //       !window.confirm(
// //         `Delete the Aadhaar FILES for ALL ${mainDocIds.length} booking(s) in this tour? Extracted details (Name/Age/Gender/Address/Aadhaar Number) are kept — only the uploaded files are removed from storage. This cannot be undone.`,
// //       )
// //     ) {
// //       return;
// //     }
// //     setDeletingAllAadhaar(true);
// //     try {
// //       let okCount = 0;
// //       for (const docId of mainDocIds) {
// //         try {
// //           const result = await deleteAadhaarTraveller(docId);
// //           if (result?.success) okCount += 1;
// //         } catch (err) {
// //           console.error(`handleDeleteAllAadhaar: failed for docId ${docId}:`, err);
// //         }
// //       }
// //       toast.success(
// //         okCount === mainDocIds.length
// //           ? "Aadhaar files deleted for all bookings"
// //           : `Aadhaar files deleted for ${okCount}/${mainDocIds.length} booking(s) — check console for the rest`,
// //       );
// //       fetchBookings();
// //     } finally {
// //       setDeletingAllAadhaar(false);
// //     }
// //   };

// //   return (
// //     <div className="mb-8">
// //       <div className="mb-5 pb-4 border-b-2 border-dashed border-[#DEE2E8] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
// //         <div className="flex items-center justify-between lg:justify-start gap-2.5 min-w-0 lg:flex-1">
// //           <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full bg-gradient-to-br from-indigo-600 to-sky-500 text-white text-sm font-bold font-mono shadow-sm shadow-indigo-200 shrink-0">
// //             {visibleBookings.length}
// //           </span>
// //           <p className="text-sm text-[#1C2733] min-w-0 lg:truncate">
// //             booking{visibleBookings.length !== 1 ? "s" : ""}
// //             {tourTitle ? <span className="text-gray-500"> for {tourTitle}</span> : ""}
// //           </p>
// //           <button
// //             onClick={fetchBookings}
// //             title="Refresh"
// //             className="lg:hidden shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-[#DEE2E8] text-[#2A5490] hover:bg-[#EEF3FA] hover:border-[#C3D4E8] transition-colors"
// //           >
// //             <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
// //           </button>
// //         </div>
// //         <div className="flex items-center gap-2 sm:gap-3">
// //           <div className="flex flex-col sm:flex-row w-full lg:w-fit rounded-xl border border-gray-200 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 shadow-sm overflow-hidden">
// //             <button
// //               onClick={handleDeleteAllAadhaar}
// //               disabled={deletingAllAadhaar || visibleBookings.length === 0}
// //               title="Delete the uploaded Aadhaar files for EVERY booking in this tour (keeps the extracted Name/Age/Gender/Address/Aadhaar Number — does not delete any booking)"
// //               className="sm:flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 lg:py-2 bg-white text-red-600 text-xs font-semibold hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
// //             >
// //               {deletingAllAadhaar ? <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 shrink-0" />}
// //               <span className="whitespace-nowrap">{deletingAllAadhaar ? "Deleting..." : "Delete All Aadhaar"}</span>
// //             </button>
// //             <button
// //               onClick={handleDownloadAllZip}
// //               disabled={downloadingAllZip || visibleBookings.length === 0}
// //               title="Download Aadhaar images of every booking in this tour as one ZIP"
// //               className="sm:flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 lg:py-2 bg-white text-[#1F3F6E] text-xs font-semibold hover:bg-[#EEF3FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
// //             >
// //               {downloadingAllZip ? <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" /> : <Download className="w-3.5 h-3.5 shrink-0" />}
// //               <span className="whitespace-nowrap">{downloadingAllZip ? "Zipping..." : "Download All (Tour) ZIP"}</span>
// //             </button>
// //           </div>
// //           <button
// //             onClick={fetchBookings}
// //             title="Refresh"
// //             className="hidden lg:flex shrink-0 items-center justify-center w-8 h-8 rounded-full border border-[#DEE2E8] text-[#2A5490] hover:bg-[#EEF3FA] hover:border-[#C3D4E8] transition-colors"
// //           >
// //             <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
// //           </button>
// //         </div>
// //       </div>

// //       <div className="relative mb-5">
// //         <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
// //         <input
// //           type="text"
// //           value={searchQuery}
// //           onChange={(e) => setSearchQuery(e.target.value)}
// //           placeholder="Filter by name, mobile, TNR or Aadhaar number (optional)"
// //           className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
// //         />
// //         {searchQuery && (
// //           <button
// //             type="button"
// //             onClick={() => setSearchQuery("")}
// //             className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
// //             title="Clear"
// //           >
// //             <XCircle className="w-4 h-4" />
// //           </button>
// //         )}
// //       </div>

// //       {loading ? (
// //         <div className="flex items-center justify-center py-16 text-gray-400">
// //           <Loader2 className="w-6 h-6 animate-spin" />
// //         </div>
// //       ) : visibleBookings.length === 0 ? (
// //         <div className="text-center py-16 text-gray-400 text-sm rounded-2xl border-2 border-dashed border-[#DEE2E8]">No bookings saved for this tour yet.</div>
// //       ) : searchedBookings.length === 0 ? (
// //         <div className="text-center py-16 text-gray-400 text-sm rounded-2xl border-2 border-dashed border-[#DEE2E8]">No booking matches "{searchQuery}".</div>
// //       ) : (
// //         <div className="space-y-4">
// //           {searchedBookings.map((booking) => (
// //             <BookingCard
// //               key={booking.groupId}
// //               booking={booking}
// //               expanded={!!expanded[booking.groupId]}
// //               onToggle={() => toggleExpand(booking.groupId)}
// //               extractAadhaar={extractAadhaar}
// //               addCoTravellerApi={addCoTravellerApi}
// //               uploadGroupPayment={uploadGroupPayment}
// //               deleteGroupPayment={deleteGroupPayment}
// //               uploadUserTravellerAadhaar={uploadUserTravellerAadhaar}
// //               linkGroupTnr={linkGroupTnr}
// //               editAadhaarTraveller={editAadhaarTraveller}
// //               deleteAadhaarTraveller={deleteAadhaarTraveller}
// //               linkGuestTnr={linkGuestTnr}
// //               unlinkGuestTnr={unlinkGuestTnr}
// //               deleteBookingByTnr={deleteBookingByTnr}
// //               allBookings={visibleBookings}
// //               onCreateBooking={() => handleCreateBooking(booking)}
// //               navigate={navigate}
// //               refresh={fetchBookings}
// //             />
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // const AadhaarUpload = () => {
// //   const navigate = useNavigate();
// //   const {
// //     tourList,
// //     getTourList,
// //     extractAadhaar,
// //     uploadPaymentScreenshot,
// //     saveAadhaarUpload,
// //     getAadhaarBookings,
// //     addCoTraveller: addCoTravellerApi,
// //     uploadGroupPayment,
// //     deleteGroupPayment,
// //     linkGroupTnr,
// //     editAadhaarTraveller,
// //     deleteAadhaarTraveller,
// //     linkGuestTnr,
// //     unlinkGuestTnr,
// //     getAllStaff,
// //     staffList,
// //     searchUserBookings,
// //     uploadUserTravellerAadhaar,
// //     uploadUserBookingPayment,
// //     deleteBookingByTnr,
// //   } = useContext(TourContext);

// //   const [saving, setSaving] = useState(false);
// //   const savingRef = useRef(false); // synchronous double-click guard

// //   // "save" = new walk-in booking, "all" = All Bookings, "user" = User Bookings.
// //   const [activeTab, setActiveTab] = useState("save");

// //   const [tourId, setTourId] = useState("");
// //   const [tourInfo, setTourInfo] = useState(null);

// //   const [packageSelection, setPackageSelection] = useState({ type: "main", variantIndex: null });
// //   const [boardingPoint, setBoardingPoint] = useState(null);
// //   const [deboardingPoint, setDeboardingPoint] = useState(null);
// //   const [selectedAddons, setSelectedAddons] = useState([]);
// //   const [remarks, setRemarks] = useState("");
// //   const [raisedByStaffId, setRaisedByStaffId] = useState("");

// //   const [travellers, setTravellers] = useState([blankTraveller(true)]);

// //   const [paymentScreenshots, setPaymentScreenshots] = useState({});
// //   const [paymentLoading, setPaymentLoading] = useState({});
// //   const paymentUploadingRef = useRef({});
// //   const [paymentFiles, setPaymentFiles] = useState({});
// //   const [paymentAmounts, setPaymentAmounts] = useState({});
// //   const [paymentRemarks, setPaymentRemarks] = useState({});
// //   const [paymentViewerIndex, setPaymentViewerIndex] = useState({});

// //   useEffect(() => {
// //     if (!tourList || tourList.length === 0) getTourList();
// //   }, [tourList, getTourList]);

// //   useEffect(() => {
// //     if (!staffList || staffList.length === 0) getAllStaff();
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);

// //   useEffect(() => {
// //     if (!tourId || !tourList?.length) {
// //       setTourInfo(null);
// //       return;
// //     }
// //     setTourInfo(tourList.find((t) => t._id === tourId) || null);
// //   }, [tourId, tourList]);

// //   useEffect(() => {
// //     setPackageSelection({ type: "main", variantIndex: null });
// //     setBoardingPoint(null);
// //     setDeboardingPoint(null);
// //     setSelectedAddons([]);
// //     setRemarks("");
// //   }, [tourId]);

// //   useEffect(() => {
// //     setBoardingPoint(null);
// //     setDeboardingPoint(null);
// //     setSelectedAddons([]);
// //   }, [packageSelection.type, packageSelection.variantIndex]);

// //   const handleTravellerChange = (index, field, value) => {
// //     const updated = [...travellers];
// //     const t = { ...updated[index] };

// //     if (field === "title") {
// //       if (value === "Mr") t.gender = "Male";
// //       else if (value === "Mrs" || value === "Ms") t.gender = "Female";
// //     }
// //     if (field === "gender") {
// //       if (value === "Male") t.title = "Mr";
// //       else if (value === "Female") t.title = "Mrs";
// //     }
// //     if (field === "age") {
// //       const age = Number(value);
// //       if (age > 85) {
// //         toast.error("Age cannot exceed 85 years.");
// //         return;
// //       }
// //       if (age >= 11) t.sharingType = "double";
// //       else if (age >= 6 && age <= 10) t.sharingType = "withBerth";
// //       else t.sharingType = "";
// //     }

// //     t[field] = value;

// //     if (["addressLine1", "addressLine2", "city", "state", "pincode"].includes(field)) {
// //       t.address = [t.addressLine1, t.addressLine2, t.city, t.state, t.pincode]
// //         .filter(Boolean)
// //         .join(", ");
// //     }

// //     updated[index] = t;
// //     setTravellers(updated);
// //   };

// //   const addCoTraveller = () => {
// //     setTravellers((prev) => [...prev, blankTraveller(false)]);
// //   };

// //   const removeCoTraveller = (index) => {
// //     setTravellers((prev) => prev.filter((_, i) => i !== index));
// //   };

// //   const setTravellerFrontFile = (index, file) => {
// //     const updated = [...travellers];
// //     updated[index] = { ...updated[index], _frontFile: file };
// //     setTravellers(updated);
// //   };

// //   const setTravellerBackFile = (index, file) => {
// //     const updated = [...travellers];
// //     updated[index] = { ...updated[index], _backFile: file };
// //     setTravellers(updated);
// //   };

// //   const extractTravellerAadhaar = async (index) => {
// //     const t = travellers[index];
// //     if (!t._frontFile) return toast.error("Aadhaar front image is required");

// //     handleTravellerChange(index, "ocrLoading", true);
// //     try {
// //       const formData = new FormData();
// //       formData.append("front", t._frontFile);
// //       if (t._backFile) formData.append("back", t._backFile);

// //       const result = await extractAadhaar(formData);
// //       if (!result?.success) {
// //         handleTravellerChange(index, "ocrLoading", false);
// //         return;
// //       }

// //       const p = result.parsed || {};
// //       const readGender = p.gender || "Male";
// //       const updated = [...travellers];
// //       updated[index] = {
// //         ...updated[index],
// //         title: readGender === "Female" ? "Mrs" : "Mr",
// //         firstName: p.firstName || "",
// //         lastName: p.lastName || "",
// //         age: p.age || "",
// //         gender: readGender,
// //         phone: p.phone || updated[index].phone || "",
// //         address: p.address || updated[index].address || "",
// //         addressLine1: p.addressLine1 || updated[index].addressLine1 || "",
// //         addressLine2: p.addressLine2 || updated[index].addressLine2 || "",
// //         city: p.city || updated[index].city || "",
// //         state: p.state || updated[index].state || "",
// //         pincode: p.pincode || updated[index].pincode || "",
// //         front: result.front || null,
// //         back: result.back || null,
// //         ocrLoading: false,
// //         _frontFile: null,
// //         _backFile: null,
// //       };
// //       setTravellers(updated);
// //       if (index === 0 && (!p.phone || !p.address)) {
// //         toast.info(
// //           `Traveller ${index + 1}'s Aadhaar read. ${!p.phone ? "Mobile number" : "Address"}${!p.phone && !p.address ? " & address" : ""} couldn't be read — please fill it in.`,
// //         );
// //       } else {
// //         toast.success(`Traveller ${index + 1}'s Aadhaar read. Verify details below.`);
// //       }
// //     } catch (err) {
// //       console.error("extractTravellerAadhaar error:", err);
// //       handleTravellerChange(index, "ocrLoading", false);
// //     }
// //   };

// //   const clearTravellerAadhaar = (index) => {
// //     const updated = [...travellers];
// //     updated[index] = {
// //       ...updated[index],
// //       title: "Mr",
// //       firstName: "",
// //       lastName: "",
// //       age: "",
// //       dob: "",
// //       gender: "Male",
// //       front: null,
// //       back: null,
// //       _frontFile: null,
// //       _backFile: null,
// //       ...(index !== 0 ? { phone: "", address: "" } : {}),
// //     };
// //     setTravellers(updated);
// //     toast.info(`Traveller ${index + 1}'s Aadhaar cleared — upload the correct image and extract again.`);
// //   };

// //   // Only Advance is collected here.
// //   const paymentSlots = [
// //     { type: "advance", label: "Advance Payment", cardClass: "bg-indigo-50 border-indigo-200" },
// //   ];

// //   const handlePaymentUpload = async (type) => {
// //     const queue = paymentFiles[type] || [];
// //     const amounts = paymentAmounts[type] || [];
// //     const remarksQueue = paymentRemarks[type] || [];
// //     if (queue.length === 0) return toast.error(`Select at least one ${type} screenshot first`);
// //     for (let i = 0; i < amounts.length; i++) {
// //       if (amounts[i] && Number(amounts[i]) <= 0) {
// //         return toast.error(`Amount for "${queue[i]?.name}", if entered, must be a positive number`);
// //       }
// //     }
// //     if (paymentUploadingRef.current[type]) return;
// //     paymentUploadingRef.current[type] = true;

// //     let successCount = 0;
// //     for (let i = 0; i < queue.length; i++) {
// //       setPaymentLoading((prev) => ({ ...prev, [type]: { current: i + 1, total: queue.length } }));
// //       try {
// //         const formData = new FormData();
// //         formData.append("screenshot", queue[i]);
// //         formData.append("type", type);
// //         if (amounts[i]) formData.append("amount", amounts[i]);
// //         const result = await uploadPaymentScreenshot(formData);
// //         if (result?.success) {
// //           successCount += 1;
// //           setPaymentScreenshots((prev) => ({
// //             ...prev,
// //             [type]: [
// //               ...(prev[type] || []),
// //               { url: result.url, amount: result.amount, remarks: (remarksQueue[i] || "").trim() },
// //             ],
// //           }));
// //         }
// //       } catch (err) {
// //         console.error("handlePaymentUpload error:", err);
// //       }
// //     }
// //     setPaymentLoading((prev) => ({ ...prev, [type]: false }));
// //     setPaymentFiles((prev) => ({ ...prev, [type]: [] }));
// //     setPaymentAmounts((prev) => ({ ...prev, [type]: [] }));
// //     setPaymentRemarks((prev) => ({ ...prev, [type]: [] }));
// //     paymentUploadingRef.current[type] = false;
// //     if (successCount > 0) {
// //       toast.success(`${successCount} ${type} screenshot${successCount > 1 ? "s" : ""} uploaded`);
// //     }
// //     if (successCount < queue.length) {
// //       toast.error(`${queue.length - successCount} ${type} screenshot(s) failed to upload`);
// //     }
// //   };

// //   const handleSaveBooking = async () => {
// //     // The ONE hard requirement: at least one Advance Payment screenshot.
// //     if (!(paymentScreenshots.advance || []).length) {
// //       return toast.error("Attach the Advance Payment screenshot before creating this booking");
// //     }
// //     if (savingRef.current) return;
// //     savingRef.current = true;
// //     const mainTraveller = travellers[0];

// //     const coTravellerRows = travellers.slice(1);

// //     const packageTypeStr =
// //       packageSelection.type === "main"
// //         ? "Main Package"
// //         : `Variant ${packageSelection.variantIndex + 1}`;
// //     const boardingPointStr = boardingPoint
// //       ? `${boardingPoint.stationCode} - ${boardingPoint.stationName}`
// //       : "";
// //     const deboardingPointStr = deboardingPoint
// //       ? `${deboardingPoint.stationCode} - ${deboardingPoint.stationName}`
// //       : "";
// //     const addonsStr = selectedAddons.map((a) => a.name).join(", ");
// //     const raisedByStaff = (staffList || []).find((s) => s._id === raisedByStaffId);
// //     const addonsDetail = selectedAddons.map((a) => ({
// //       label: a.trainName
// //         ? `${a.trainName} (${a.trainNo})${a.tripType ? ` - ${a.tripType}` : ""}`
// //         : a.flightNo
// //           ? `${a.airline || "Flight"} ${a.flightNo}${a.tripType ? ` - ${a.tripType}` : ""}`
// //           : "",
// //       name: a.name,
// //       amount: a.amount || 0,
// //     }));

// //     setSaving(true);
// //     try {
// //       const result = await saveAadhaarUpload({
// //         tourId,
// //         packageType: packageTypeStr,
// //         packageKind: packageSelection.type,
// //         variantPackageIndex: packageSelection.type === "variant" ? packageSelection.variantIndex : null,
// //         boardingPoint: boardingPointStr,
// //         deboardingPoint: deboardingPointStr,
// //         addons: addonsStr,
// //         addonsDetail,
// //         remarks: remarks.trim(),
// //         raisedBy: {
// //           name: raisedByStaff?.fullName || "",
// //           employeeId: raisedByStaff?.employeeId || "",
// //         },
// //         traveller: {
// //           title: mainTraveller.title,
// //           firstName: mainTraveller.firstName,
// //           lastName: mainTraveller.lastName,
// //           age: mainTraveller.age,
// //           dob: mainTraveller.dob,
// //           gender: mainTraveller.gender,
// //           sharingType: mainTraveller.sharingType,
// //           phone: mainTraveller.phone,
// //           address: mainTraveller.address,
// //           addressLine1: mainTraveller.addressLine1,
// //           addressLine2: mainTraveller.addressLine2,
// //           city: mainTraveller.city,
// //           state: mainTraveller.state,
// //           pincode: mainTraveller.pincode,
// //           front: mainTraveller.front,
// //           back: mainTraveller.back,
// //         },
// //         coTravellers: coTravellerRows.map((t) => ({
// //           title: t.title,
// //           firstName: t.firstName,
// //           lastName: t.lastName,
// //           age: t.age,
// //           dob: t.dob,
// //           gender: t.gender,
// //           sharingType: t.sharingType,
// //           phone: t.phone,
// //           address: t.address,
// //           addressLine1: t.addressLine1,
// //           addressLine2: t.addressLine2,
// //           city: t.city,
// //           state: t.state,
// //           pincode: t.pincode,
// //           front: t.front,
// //         })),
// //         advanceScreenshots: paymentScreenshots.advance || [],
// //       });

// //       if (!result?.success) return;

// //       toast.success("Booking saved. Find it on the All Bookings page.");

// //       setTourId("");
// //       setTourInfo(null);
// //       setTravellers([blankTraveller(true)]);
// //       setPaymentScreenshots({});
// //       setPaymentFiles({});
// //       setPaymentAmounts({});
// //       setPaymentRemarks({});
// //     } catch (err) {
// //       console.error("handleSaveBooking error:", err);
// //       toast.error("Could not save this booking. Please try again.");
// //     } finally {
// //       savingRef.current = false;
// //       setSaving(false);
// //     }
// //   };

// //   return (
// //     <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-slate-50 to-sky-50 py-4 px-2.5 sm:py-8 sm:px-4">
// //       <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 rounded-full bg-indigo-300/30 blur-3xl" />
// //       <div className="pointer-events-none absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-sky-300/30 blur-3xl" />
// //       <div className="pointer-events-none absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-purple-200/30 blur-3xl" />

// //       <div className="relative max-w-5xl mx-auto bg-white/90 backdrop-blur-sm shadow-2xl shadow-indigo-200/50 rounded-2xl sm:rounded-[2rem] border border-white ring-1 ring-indigo-100 overflow-hidden">
// //         <div className="h-1.5 sm:h-2 bg-gradient-to-r from-indigo-600 via-violet-500 to-sky-500" />

// //         <div className="p-3.5 sm:p-6 md:p-8">
// //           <ToastContainer position="top-right" autoClose={4000} />

// //           <div className="flex items-center gap-3 sm:gap-4 border-b border-gray-100 pb-4 sm:pb-6 mb-4 sm:mb-6">
// //             <div className="relative shrink-0">
// //               <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 blur-md opacity-40" />
// //               <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-indigo-300/60 ring-2 ring-white">
// //                 <UserPlus className="w-5.5 h-5.5 sm:w-7 sm:h-7" />
// //               </div>
// //             </div>
// //             <div className="min-w-0">
// //               <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight truncate bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
// //                 Aadhaar Upload
// //               </h1>
// //               <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Walk-in bookings, read straight off the Aadhaar card</p>
// //             </div>
// //           </div>

// //           <div className="mb-5 sm:mb-6">
// //             <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
// //               <MapPin className="w-4 h-4 text-indigo-500" /> Select Tour *
// //             </label>
// //             <div className="relative">
// //               <select
// //                 value={tourId}
// //                 onChange={(e) => setTourId(e.target.value)}
// //                 className="w-full appearance-none pl-3.5 sm:pl-4 pr-10 sm:pr-11 py-3 sm:py-3.5 bg-gradient-to-br from-indigo-50/70 to-white border-2 border-indigo-100 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm sm:text-base font-semibold text-gray-800 truncate transition-all cursor-pointer"
// //               >
// //                 <option value="">-- Select a tour --</option>
// //                 {tourList?.map((t) => (
// //                   <option key={t._id} value={t._id}>
// //                     {t.title}
// //                   </option>
// //                 ))}
// //               </select>
// //               <ChevronDown className="pointer-events-none absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-indigo-400" />
// //             </div>
// //           </div>

// //           <div className="grid grid-cols-3 sm:flex sm:flex-row gap-1.5 sm:gap-2 p-1.5 bg-gradient-to-br from-gray-100 to-indigo-50/60 rounded-2xl mb-6 sm:mb-8 w-full sm:w-fit ring-1 ring-black/5">
// //             <button
// //               onClick={() => setActiveTab("save")}
// //               className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-5 py-2.5 rounded-xl font-bold text-[11px] sm:text-sm leading-tight text-center transition-all sm:flex-none ${activeTab === "save"
// //                 ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-300/60"
// //                 : "text-gray-500 hover:text-indigo-600 hover:bg-white/60"
// //                 }`}
// //             >
// //               <UserPlus className="w-[18px] h-[18px] sm:w-4 sm:h-4 shrink-0" /> <span>Save Booking</span>
// //             </button>
// //             <button
// //               onClick={() => setActiveTab("all")}
// //               className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-5 py-2.5 rounded-xl font-bold text-[11px] sm:text-sm leading-tight text-center transition-all sm:flex-none ${activeTab === "all"
// //                 ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-300/60"
// //                 : "text-gray-500 hover:text-indigo-600 hover:bg-white/60"
// //                 }`}
// //             >
// //               <BookOpenCheck className="w-[18px] h-[18px] sm:w-4 sm:h-4 shrink-0" /> <span>All Bookings</span>
// //             </button>
// //             <button
// //               onClick={() => setActiveTab("user")}
// //               className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-5 py-2.5 rounded-xl font-bold text-[11px] sm:text-sm leading-tight text-center transition-all sm:flex-none ${activeTab === "user"
// //                 ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-300/60"
// //                 : "text-gray-500 hover:text-indigo-600 hover:bg-white/60"
// //                 }`}
// //             >
// //               <Search className="w-[18px] h-[18px] sm:w-4 sm:h-4 shrink-0" /> <span>User Bookings</span>
// //             </button>
// //           </div>

// //           {!tourId && (
// //             <div className="text-center py-16 text-gray-400 text-sm">Select a tour above to continue.</div>
// //           )}

// //           {tourId && activeTab === "all" && (
// //             <AllBookingsTab
// //               getAadhaarBookings={getAadhaarBookings}
// //               extractAadhaar={extractAadhaar}
// //               addCoTravellerApi={addCoTravellerApi}
// //               uploadGroupPayment={uploadGroupPayment}
// //               deleteGroupPayment={deleteGroupPayment}
// //               uploadUserTravellerAadhaar={uploadUserTravellerAadhaar}
// //               linkGroupTnr={linkGroupTnr}
// //               editAadhaarTraveller={editAadhaarTraveller}
// //               deleteAadhaarTraveller={deleteAadhaarTraveller}
// //               linkGuestTnr={linkGuestTnr}
// //               unlinkGuestTnr={unlinkGuestTnr}
// //               deleteBookingByTnr={deleteBookingByTnr}
// //               navigate={navigate}
// //               tourId={tourId}
// //               tourTitle={tourInfo?.title}
// //             />
// //           )}

// //           {tourId && activeTab === "user" && (
// //             <UserBookingsTab
// //               tourId={tourId}
// //               searchUserBookings={searchUserBookings}
// //               uploadUserTravellerAadhaar={uploadUserTravellerAadhaar}
// //               uploadUserBookingPayment={uploadUserBookingPayment}
// //               deleteGroupPayment={deleteGroupPayment}
// //               extractAadhaar={extractAadhaar}
// //             />
// //           )}

// //           {tourId && activeTab === "save" && (
// //             <>
// //               {tourInfo && (
// //                 <>
// //                   <BookingWideSection
// //                     tourInfo={tourInfo}
// //                     packageSelection={packageSelection}
// //                     setPackageSelection={setPackageSelection}
// //                     boardingPoint={boardingPoint}
// //                     setBoardingPoint={setBoardingPoint}
// //                     deboardingPoint={deboardingPoint}
// //                     setDeboardingPoint={setDeboardingPoint}
// //                     selectedAddons={selectedAddons}
// //                     setSelectedAddons={setSelectedAddons}
// //                     remarks={remarks}
// //                     setRemarks={setRemarks}
// //                     staffList={staffList}
// //                     raisedByStaffId={raisedByStaffId}
// //                     setRaisedByStaffId={setRaisedByStaffId}
// //                   />

// //                   <TravellerCard
// //                     traveller={travellers[0]}
// //                     index={0}
// //                     isMain={true}
// //                     setTravellerFrontFile={setTravellerFrontFile}
// //                     setTravellerBackFile={setTravellerBackFile}
// //                     extractTravellerAadhaar={extractTravellerAadhaar}
// //                     clearTravellerAadhaar={clearTravellerAadhaar}
// //                     handleTravellerChange={handleTravellerChange}
// //                   />

// //                   {travellers.slice(1).map((t, i) => (
// //                     <TravellerCard
// //                       key={i + 1}
// //                       traveller={t}
// //                       index={i + 1}
// //                       isMain={false}
// //                       removeCoTraveller={removeCoTraveller}
// //                       setTravellerFrontFile={setTravellerFrontFile}
// //                       setTravellerBackFile={setTravellerBackFile}
// //                       extractTravellerAadhaar={extractTravellerAadhaar}
// //                       clearTravellerAadhaar={clearTravellerAadhaar}
// //                       handleTravellerChange={handleTravellerChange}
// //                     />
// //                   ))}

// //                   <button
// //                     onClick={addCoTraveller}
// //                     className="w-full flex items-center justify-center gap-2 px-5 py-3 mb-8 border-2 border-dashed border-indigo-300 text-indigo-700 rounded-2xl font-semibold text-sm hover:bg-indigo-50 transition-all"
// //                   >
// //                     <PlusCircle className="w-4.5 h-4.5" />
// //                     Add Co-Traveller
// //                   </button>

// //                   <div className="mb-8">
// //                     <h3 className="flex items-center gap-2 font-bold text-gray-800 text-lg mb-4">
// //                       <IndianRupee className="w-6 h-6 text-indigo-600" /> Advance Payment Screenshot <span className="text-red-500">*</span>
// //                       <span className="text-xs font-normal text-gray-400">
// //                         (required to create this booking — OCR tries to read the amount automatically, type it in only if OCR misses)
// //                       </span>
// //                     </h3>
// //                     <div className="grid md:grid-cols-3 gap-4">
// //                       {paymentSlots.map(({ type, label, cardClass }) => {
// //                         const uploaded = paymentScreenshots[type] || [];
// //                         const queue = paymentFiles[type] || [];
// //                         const amounts = paymentAmounts[type] || [];
// //                         const remarksQueue = paymentRemarks[type] || [];
// //                         const progress = paymentLoading[type];
// //                         return (
// //                           <div
// //                             key={type}
// //                             className={`p-5 rounded-2xl border shadow-sm ${uploaded.length > 0 ? "bg-green-50 border-green-300" : `${cardClass} border`}`}
// //                           >
// //                             <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-3">
// //                               <FileImage className="w-5 h-5" /> {label}
// //                             </h4>

// //                             {uploaded.length > 0 && (
// //                               <div className="flex flex-col gap-1 mb-3">
// //                                 {uploaded.map((u, i) => (
// //                                   <button
// //                                     type="button"
// //                                     key={i}
// //                                     onClick={() =>
// //                                       setPaymentViewerIndex((prev) => ({ ...prev, [type]: i }))
// //                                     }
// //                                     className="flex items-center gap-2 text-sm text-green-700 font-medium hover:underline text-left"
// //                                   >
// //                                     <CheckCircle2 className="w-4 h-4 shrink-0" /> #{i + 1}
// //                                     {u.amount ? ` — ₹${u.amount}` : " — amount not entered"}
// //                                     {u.remarks ? ` — ${u.remarks}` : ""}
// //                                   </button>
// //                                 ))}
// //                               </div>
// //                             )}
// //                             <ScreenshotViewer
// //                               items={uploaded}
// //                               index={paymentViewerIndex[type] ?? null}
// //                               onClose={() => setPaymentViewerIndex((prev) => ({ ...prev, [type]: null }))}
// //                               onNav={(i) => setPaymentViewerIndex((prev) => ({ ...prev, [type]: i }))}
// //                             />

// //                             {queue.length > 0 && (
// //                               <div className="flex flex-col gap-1.5 mb-2.5">
// //                                 {queue.map((f, i) => (
// //                                   <div key={i} className="flex items-center gap-1.5 flex-wrap">
// //                                     <div className="flex-1 min-w-0 flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg px-2.5 py-2 truncate">
// //                                       <FileImage className="w-3.5 h-3.5 shrink-0 text-gray-400" />
// //                                       {f.name}
// //                                     </div>
// //                                     <input
// //                                       type="number"
// //                                       placeholder="₹ (optional — OCR tries first)"
// //                                       value={amounts[i] || ""}
// //                                       onChange={(e) =>
// //                                         setPaymentAmounts((prev) => ({
// //                                           ...prev,
// //                                           [type]: (prev[type] || []).map((a, idx) => (idx === i ? e.target.value : a)),
// //                                         }))
// //                                       }
// //                                       disabled={!!progress}
// //                                       className="w-24 shrink-0 px-2 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
// //                                     />
// //                                     <input
// //                                       type="text"
// //                                       placeholder="Bank (e.g. SBI)"
// //                                       value={remarksQueue[i] || ""}
// //                                       onChange={(e) =>
// //                                         setPaymentRemarks((prev) => ({
// //                                           ...prev,
// //                                           [type]: (prev[type] || []).map((r, idx) => (idx === i ? e.target.value : r)),
// //                                         }))
// //                                       }
// //                                       disabled={!!progress}
// //                                       className="w-28 shrink-0 px-2 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
// //                                     />
// //                                     <button
// //                                       type="button"
// //                                       onClick={() => {
// //                                         setPaymentFiles((prev) => ({
// //                                           ...prev,
// //                                           [type]: (prev[type] || []).filter((_, idx) => idx !== i),
// //                                         }));
// //                                         setPaymentAmounts((prev) => ({
// //                                           ...prev,
// //                                           [type]: (prev[type] || []).filter((_, idx) => idx !== i),
// //                                         }));
// //                                         setPaymentRemarks((prev) => ({
// //                                           ...prev,
// //                                           [type]: (prev[type] || []).filter((_, idx) => idx !== i),
// //                                         }));
// //                                       }}
// //                                       disabled={!!progress}
// //                                       title="Remove from queue"
// //                                       className="shrink-0 p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 transition-colors"
// //                                     >
// //                                       <X className="w-3.5 h-3.5" />
// //                                     </button>
// //                                   </div>
// //                                 ))}
// //                               </div>
// //                             )}

// //                             <label className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 bg-white border border-dashed border-gray-300 rounded-lg px-3 py-3 mb-2.5 cursor-pointer hover:border-indigo-400">
// //                               <Upload className="w-3.5 h-3.5" />
// //                               {queue.length > 0 ? "Add more screenshot(s)" : "Choose screenshot(s)"}
// //                               <input
// //                                 type="file"
// //                                 accept="image/*,application/pdf"
// //                                 multiple
// //                                 className="hidden"
// //                                 onChange={(e) => {
// //                                   const files = Array.from(e.target.files || []);
// //                                   if (!files.length) return;
// //                                   setPaymentFiles((prev) => ({ ...prev, [type]: [...(prev[type] || []), ...files] }));
// //                                   setPaymentAmounts((prev) => ({
// //                                     ...prev,
// //                                     [type]: [...(prev[type] || []), ...files.map(() => "")],
// //                                   }));
// //                                   setPaymentRemarks((prev) => ({
// //                                     ...prev,
// //                                     [type]: [...(prev[type] || []), ...files.map(() => "")],
// //                                   }));
// //                                   e.target.value = "";
// //                                 }}
// //                               />
// //                             </label>

// //                             {queue.length > 0 && (
// //                               <button
// //                                 onClick={() => handlePaymentUpload(type)}
// //                                 disabled={!!progress}
// //                                 className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-semibold transition-colors"
// //                               >
// //                                 {progress ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
// //                                 {progress
// //                                   ? `Uploading ${progress.current} of ${progress.total}...`
// //                                   : `Upload ${queue.length > 1 ? `All (${queue.length})` : ""}`}
// //                               </button>
// //                             )}
// //                           </div>
// //                         );
// //                       })}
// //                     </div>
// //                   </div>

// //                   <button
// //                     onClick={handleSaveBooking}
// //                     disabled={saving}
// //                     className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-800 hover:to-indigo-700 disabled:opacity-60 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all"
// //                   >
// //                     {saving ? (
// //                       <>
// //                         <Loader2 className="w-5 h-5 animate-spin" /> Saving...
// //                       </>
// //                     ) : (
// //                       <>
// //                         Save Booking <ArrowRight className="w-5 h-5" />
// //                       </>
// //                     )}
// //                   </button>
// //                 </>
// //               )}
// //             </>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AadhaarUpload;

// import React, { useContext, useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import JSZip from "jszip";
// import { TourContext } from "../../context/TourContext";
// import UserBookingsTab, { TravellerAadhaarRow } from "../../components/UserBookingsTab";
// import {
//   UserPlus,
//   Upload,
//   Loader2,
//   CheckCircle2,
//   Trash2,
//   Pencil,
//   IndianRupee,
//   FileImage,
//   MapPin,
//   Package,
//   Train,
//   Plane,
//   Phone,
//   Home,
//   NotebookPen,
//   ArrowRight,
//   Users,
//   IdCard,
//   PlusCircle,
//   ChevronDown,
//   ChevronUp,
//   Ticket,
//   Link2,
//   BookOpenCheck,
//   RefreshCw,
//   XCircle,
//   Download,
//   UserCheck,
//   Search,
//   Copy,
//   Check,
//   ChevronLeft,
//   ChevronRight,
//   X,
//   FileText,
// } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// // Click-to-copy TNR. stopPropagation so it never toggles the parent row.
// const CopyTnrButton = ({ tnr, className = "" }) => {
//   const [copied, setCopied] = useState(false);
//   const handleCopy = async (e) => {
//     e.stopPropagation();
//     e.preventDefault();
//     try {
//       await navigator.clipboard.writeText(tnr);
//     } catch (err) {
//       console.error("Copy TNR failed:", err);
//     }
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1500);
//   };
//   return (
//     <button
//       type="button"
//       onClick={handleCopy}
//       title="Copy TNR"
//       className={`inline-flex items-center justify-center shrink-0 hover:opacity-60 transition-opacity ${className}`}
//     >
//       {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
//     </button>
//   );
// };

// // Three-state traveller cancellation badge (resolved by the backend).
// const CANCEL_STATUS = {
//   request: { label: "Cancellation Requested", className: "bg-amber-100 text-amber-700 border border-amber-200" },
//   rejected: { label: "Cancellation Rejected", className: "bg-gray-100 text-gray-600 border border-gray-300" },
//   cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 border border-red-200" },
// };
// const CancelStatusBadge = ({ status }) => {
//   const meta = CANCEL_STATUS[status];
//   if (!meta) return null;
//   return (
//     <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.className}`}>
//       {meta.label}
//     </span>
//   );
// };

// // One-at-a-time payment screenshot viewer with Prev/Next.
// const ScreenshotViewer = ({ items, index, onClose, onNav }) => {
//   if (index === null || index === undefined || !items?.[index]) return null;
//   const item = items[index];
//   return (
//     <div
//       className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
//       onClick={onClose}
//     >
//       <div
//         className="relative w-full max-w-lg bg-white rounded-xl overflow-hidden shadow-2xl"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <button
//           type="button"
//           onClick={onClose}
//           className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
//         >
//           <X className="w-4 h-4" />
//         </button>
//         <img
//           src={item.url}
//           alt={`Screenshot ${index + 1}`}
//           className="w-full max-h-[70vh] object-contain bg-gray-100"
//         />
//         <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
//           <button
//             type="button"
//             onClick={() => onNav(index - 1)}
//             disabled={index === 0}
//             className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
//           >
//             <ChevronLeft className="w-4 h-4" />
//           </button>
//           <span className="text-sm font-semibold text-gray-700">
//             {index + 1} / {items.length}
//             {item.amount ? ` — ₹${item.amount}` : " — amount not entered"}
//           </span>
//           <button
//             type="button"
//             onClick={() => onNav(index + 1)}
//             disabled={index === items.length - 1}
//             className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
//           >
//             <ChevronRight className="w-4 h-4" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Match boarding/deboarding points by their own _id (stationCode isn't unique).
// const getPointId = (point) => {
//   if (!point) return "";
//   const raw = point._id;
//   if (raw && typeof raw === "object" && raw.$oid) return String(raw.$oid);
//   return raw !== undefined && raw !== null ? String(raw) : "";
// };

// // Person-level fields only — package/boarding/addons/remarks are booking-wide.
// const blankTraveller = (isMain) => ({
//   title: "Mr",
//   firstName: "",
//   lastName: "",
//   age: "",
//   gender: "Male",
//   sharingType: "",
//   phone: "",
//   address: "",
//   addressLine1: "",
//   addressLine2: "",
//   city: "",
//   state: "",
//   pincode: "",
//   isCoTraveller: !isMain,
//   front: null,
//   back: null,
//   ocrLoading: false,
//   _frontFile: null,
//   _backFile: null,
//   source: "aadhaar", // "aadhaar" | "manual"
// });

// // ───────────── Booking-wide section ─────────────
// // Module scope (not inside AadhaarUpload) so inputs don't lose focus on
// // every keystroke.
// const BookingWideSection = ({
//   tourInfo,
//   packageSelection,
//   setPackageSelection,
//   boardingPoint,
//   setBoardingPoint,
//   deboardingPoint,
//   setDeboardingPoint,
//   selectedAddons,
//   setSelectedAddons,
//   remarks,
//   setRemarks,
//   staffList,
//   raisedByStaffId,
//   setRaisedByStaffId,
// }) => {
//   const pkg =
//     packageSelection.type === "main"
//       ? tourInfo
//       : tourInfo?.variantPackage?.[packageSelection.variantIndex];

//   const boardingOptions = pkg?.boardingPoints || [];
//   const deboardingOptions = pkg?.deboardingPoints || [];
//   const trainDetails = pkg?.trainDetails || [];
//   const flightDetails = pkg?.flightDetails || [];
//   const flightsWithAddons = flightDetails
//     .map((flight, flightIndex) => ({ flight, flightIndex }))
//     .filter(({ flight }) => Array.isArray(flight.addons) && flight.addons.length > 0);

//   const handleAddonChange = (trainIndex, addonId) => {
//     const train = trainDetails[trainIndex];
//     if (!train) return;

//     let updated = selectedAddons.filter((a) => a.trainIndex !== trainIndex);
//     if (!addonId) {
//       setSelectedAddons(updated);
//       return;
//     }
//     const addon = train.addons?.find((a) => String(a._id || a.id) === String(addonId));
//     if (!addon) {
//       setSelectedAddons(updated);
//       return;
//     }
//     updated.push({
//       trainIndex,
//       trainNo: train.trainNo,
//       trainName: train.trainName,
//       tripType: train.tripType,
//       addonId: addon._id || addon.id,
//       name: addon.name,
//       amount: Number(addon.amount) || 0,
//     });
//     setSelectedAddons(updated);
//   };

//   const handleFlightAddonChange = (flightIndex, addonId) => {
//     const flight = flightDetails[flightIndex];
//     if (!flight) return;

//     let updated = selectedAddons.filter((a) => a.flightIndex !== flightIndex);
//     if (!addonId) {
//       setSelectedAddons(updated);
//       return;
//     }
//     const addon = flight.addons?.find((a) => String(a._id || a.id) === String(addonId));
//     if (!addon) {
//       setSelectedAddons(updated);
//       return;
//     }
//     updated.push({
//       flightIndex,
//       flightNo: flight.flightNo,
//       airline: flight.airline,
//       tripType: flight.tripType,
//       addonId: addon._id || addon.id,
//       name: addon.name,
//       amount: Number(addon.amount) || 0,
//     });
//     setSelectedAddons(updated);
//   };

//   const getSelectedAddonForTrain = (trainIndex) =>
//     selectedAddons.find((a) => a.trainIndex === trainIndex)?.addonId || "";

//   const getSelectedAddonForFlight = (flightIndex) =>
//     selectedAddons.find((a) => a.flightIndex === flightIndex)?.addonId || "";

//   return (
//     <div className="mb-6 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-sky-50/60 shadow-sm overflow-hidden">
//       <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-sky-200/70 bg-white/60">
//         <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm">
//           <Package className="w-5 h-5" />
//         </div>
//         <div>
//           <p className="font-bold text-gray-800 leading-tight">Booking Details</p>
//           <p className="text-xs text-gray-500">Applies to every traveller on this TNR</p>
//         </div>
//       </div>

//       <div className="p-5 sm:p-6">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
//           <div>
//             <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
//               <Package className="w-3.5 h-3.5 text-sky-600" /> Package Type
//             </label>
//             <select
//               value={packageSelection.type === "main" ? "main" : packageSelection.variantIndex}
//               onChange={(e) => {
//                 const v = e.target.value;
//                 if (v === "main") setPackageSelection({ type: "main", variantIndex: null });
//                 else setPackageSelection({ type: "variant", variantIndex: Number(v) });
//               }}
//               className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none text-sm transition-all"
//             >
//               <option value="main">Main Package</option>
//               {tourInfo?.variantPackage?.map((p, i) => (
//                 <option key={i} value={i}>
//                   Variant {i + 1} ({p.destination?.join(", ")})
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
//               <MapPin className="w-3.5 h-3.5 text-sky-600" /> Boarding Point
//             </label>
//             <select
//               value={getPointId(boardingPoint)}
//               onChange={(e) => {
//                 const bp = boardingOptions.find((x) => getPointId(x) === e.target.value);
//                 setBoardingPoint(bp || null);
//               }}
//               className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none text-sm transition-all"
//             >
//               <option value="">Select Boarding Point</option>
//               {boardingOptions.map((bp, i) => (
//                 <option key={getPointId(bp) || i} value={getPointId(bp)}>
//                   {bp.stationCode} - {bp.stationName}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
//               <MapPin className="w-3.5 h-3.5 text-sky-600" /> Deboarding Point
//             </label>
//             <select
//               value={getPointId(deboardingPoint)}
//               onChange={(e) => {
//                 const dp = deboardingOptions.find((x) => getPointId(x) === e.target.value);
//                 setDeboardingPoint(dp || null);
//               }}
//               className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none text-sm transition-all"
//             >
//               <option value="">Select Deboarding Point</option>
//               {deboardingOptions.map((dp, i) => (
//                 <option key={getPointId(dp) || i} value={getPointId(dp)}>
//                   {dp.stationCode} - {dp.stationName}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {(trainDetails.length > 0 || flightsWithAddons.length > 0) && (
//           <div className="pt-5 border-t border-sky-200/70 space-y-5">
//             {trainDetails.length > 0 && (
//               <div>
//                 <p className="flex items-center gap-1.5 text-sm font-bold text-indigo-700 mb-2.5">
//                   <Train className="w-4 h-4" /> Train Add-ons
//                 </p>
//                 <div className="space-y-2">
//                   {trainDetails.map((train, tIdx) => (
//                     <div
//                       key={train._id || tIdx}
//                       className="border border-gray-200 rounded-xl p-3.5 bg-white hover:border-indigo-200 transition-colors"
//                     >
//                       <p className="text-sm font-semibold text-gray-800">
//                         {train.trainName} <span className="text-gray-500 font-normal">({train.trainNo})</span>
//                       </p>
//                       <select
//                         value={getSelectedAddonForTrain(tIdx)}
//                         onChange={(e) => handleAddonChange(tIdx, e.target.value)}
//                         className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
//                       >
//                         <option value="">No Add-on</option>
//                         {(train.addons || []).map((a) => (
//                           <option key={a._id || a.id} value={a._id || a.id}>
//                             {a.name} (+{a.amount || 0})
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {flightsWithAddons.length > 0 && (
//               <div>
//                 <p className="flex items-center gap-1.5 text-sm font-bold text-purple-700 mb-2.5">
//                   <Plane className="w-4 h-4" /> Flight Add-ons
//                 </p>
//                 <div className="space-y-2">
//                   {flightsWithAddons.map(({ flight, flightIndex }) => (
//                     <div
//                       key={flight._id || flightIndex}
//                       className="border border-gray-200 rounded-xl p-3.5 bg-white hover:border-purple-200 transition-colors"
//                     >
//                       <p className="text-sm font-semibold text-gray-800">
//                         {flight.airline} <span className="text-gray-500 font-normal">({flight.flightNo})</span>
//                       </p>
//                       <select
//                         value={getSelectedAddonForFlight(flightIndex)}
//                         onChange={(e) => handleFlightAddonChange(flightIndex, e.target.value)}
//                         className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
//                       >
//                         <option value="">No Add-on</option>
//                         {(flight.addons || []).map((a) => (
//                           <option key={a._id || a.id} value={a._id || a.id}>
//                             {a.name} (+{a.amount || 0})
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         <div className="mt-5 pt-5 border-t border-sky-200/70">
//           <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
//             <UserCheck className="w-3.5 h-3.5 text-sky-600" /> Raised By (who is saving this booking?) *
//           </label>
//           <select
//             value={raisedByStaffId || ""}
//             onChange={(e) => setRaisedByStaffId(e.target.value)}
//             className="w-full mb-4 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none text-sm transition-all"
//           >
//             <option value="">Select your name</option>
//             {(staffList || []).map((s) => (
//               <option key={s._id} value={s._id}>
//                 {s.fullName}{s.employeeId ? ` (${s.employeeId})` : ""}
//               </option>
//             ))}
//           </select>

//           <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
//             <NotebookPen className="w-3.5 h-3.5 text-sky-600" /> Remarks (optional)
//           </label>
//           <textarea
//             value={remarks}
//             onChange={(e) => setRemarks(e.target.value)}
//             rows={2}
//             className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none text-sm transition-all resize-none"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// // ───────────── Per-person traveller card ─────────────
// const TravellerCard = ({
//   traveller,
//   index,
//   isMain,
//   removeCoTraveller,
//   setTravellerFrontFile,
//   setTravellerBackFile,
//   extractTravellerAadhaar,
//   clearTravellerAadhaar,
//   handleTravellerChange,
// }) => {
//   const frontInputRef = useRef(null);
//   const backInputRef = useRef(null);
//   const [showRawText, setShowRawText] = useState(false);

//   const clearChosenFront = () => {
//     if (frontInputRef.current) frontInputRef.current.value = "";
//     setTravellerFrontFile(index, null);
//   };
//   const clearChosenBack = () => {
//     if (backInputRef.current) backInputRef.current.value = "";
//     setTravellerBackFile(index, null);
//   };

//   // One cross mark for the whole lifecycle — clears the picker, and the
//   // OCR'd result too if already extracted.
//   const clearFront = () => {
//     clearChosenFront();
//     if (traveller.front) clearTravellerAadhaar(index);
//   };
//   const clearBack = () => {
//     clearChosenBack();
//     if (traveller.back) clearTravellerAadhaar(index);
//   };

//   return (
//     <div
//       className={`mb-6 rounded-2xl border shadow-sm overflow-hidden ${isMain ? "border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-indigo-50/50" : "border-purple-200 bg-gradient-to-br from-purple-50 via-white to-purple-50/50"
//         }`}
//     >
//       <div
//         className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b bg-white/60 ${isMain ? "border-indigo-200/70" : "border-purple-200/70"
//           }`}
//       >
//         <div className="flex items-center gap-3">
//           <div
//             className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-sm ${isMain ? "bg-indigo-600" : "bg-purple-600"
//               }`}
//           >
//             {isMain ? <IdCard className="w-5 h-5" /> : <Users className="w-5 h-5" />}
//           </div>
//           <div>
//             <p className="font-bold text-gray-800 leading-tight">
//               {isMain ? "Main Traveller" : `Co-Traveller ${index}`}
//             </p>
//             {!isMain && (
//               <p className="text-xs text-gray-500">
//                 {traveller.source === "aadhaar" ? "Via Aadhaar OCR" : "Manual entry"}
//               </p>
//             )}
//           </div>
//         </div>
//         {!isMain && (
//           <button
//             onClick={() => removeCoTraveller(index)}
//             className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
//             title="Remove co-traveller"
//           >
//             <Trash2 className="w-4.5 h-4.5" />
//           </button>
//         )}
//       </div>

//       <div className="p-5 sm:p-6">
//         {traveller.source === "aadhaar" && (
//           <div className="p-4 bg-white rounded-xl border border-dashed border-gray-300 mb-5">
//             <div className="flex flex-wrap items-end gap-3">
//               <div className="flex-1 min-w-[160px]">
//                 <label className="block text-xs font-semibold text-gray-600 mb-1.5">
//                   Aadhaar Front {isMain ? "(required)" : ""}
//                 </label>
//                 <div className="flex items-center gap-2">
//                   <input
//                     ref={frontInputRef}
//                     type="file"
//                     accept="image/*,application/pdf"
//                     onChange={(e) => setTravellerFrontFile(index, e.target.files?.[0] || null)}
//                     className="flex-1 min-w-0 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
//                   />
//                   {(traveller._frontFile || traveller.front) && (
//                     <button
//                       type="button"
//                       onClick={clearFront}
//                       className="shrink-0 text-gray-400 hover:text-red-600"
//                       title={traveller.front ? "Remove this Aadhaar and redo it" : "Clear chosen file"}
//                     >
//                       <XCircle className="w-4 h-4" />
//                     </button>
//                   )}
//                 </div>
//               </div>
//               {isMain && (
//                 <div className="flex-1 min-w-[160px]">
//                   <label className="block text-xs font-semibold text-gray-600 mb-1.5">Aadhaar Back (optional)</label>
//                   <div className="flex items-center gap-2">
//                     <input
//                       ref={backInputRef}
//                       type="file"
//                       accept="image/*,application/pdf"
//                       onChange={(e) => setTravellerBackFile(index, e.target.files?.[0] || null)}
//                       className="flex-1 min-w-0 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
//                     />
//                     {(traveller._backFile || traveller.back) && (
//                       <button
//                         type="button"
//                         onClick={clearBack}
//                         className="shrink-0 text-gray-400 hover:text-red-600"
//                         title={traveller.back ? "Remove this Aadhaar and redo it" : "Clear chosen file"}
//                       >
//                         <XCircle className="w-4 h-4" />
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               )}
//               <button
//                 onClick={() => extractTravellerAadhaar(index)}
//                 disabled={traveller.ocrLoading || !traveller._frontFile}
//                 className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-xl font-bold text-sm shadow-sm transition-colors"
//               >
//                 {traveller.ocrLoading ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin" /> Reading...
//                   </>
//                 ) : (
//                   <>
//                     <Upload className="w-4 h-4" /> Extract Aadhaar
//                   </>
//                 )}
//               </button>
//               {!isMain && (
//                 <button
//                   onClick={() => handleTravellerChange(index, "source", "manual")}
//                   className="px-4 py-2.5 text-sm font-semibold text-purple-700 border border-purple-300 rounded-xl hover:bg-purple-50 transition-colors"
//                 >
//                   Switch to Manual
//                 </button>
//               )}
//             </div>
//             {traveller.front && (
//               <div className="mt-3 flex flex-wrap items-center gap-3">
//                 <span className="flex items-center gap-1.5 text-sm font-medium text-green-700">
//                   <CheckCircle2 className="w-4 h-4" />
//                   Aadhaar front {traveller.back ? "+ back " : ""}read
//                 </span>
//                 <a
//                   href={traveller.front?.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
//                 >
//                   View Front
//                 </a>
//                 {traveller.back && (
//                   <a
//                     href={traveller.back?.url}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
//                   >
//                     View Back
//                   </a>
//                 )}
//                 {(traveller.front?.ocrText || traveller.back?.ocrText) && (
//                   <button
//                     type="button"
//                     onClick={() => setShowRawText((v) => !v)}
//                     className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-600"
//                   >
//                     {showRawText ? "Hide" : "Show"} raw text read
//                   </button>
//                 )}
//               </div>
//             )}
//             {showRawText && traveller.front?.ocrText && (
//               <div className="mt-2">
//                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Front</p>
//                 <pre className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
//                   {traveller.front.ocrText}
//                 </pre>
//               </div>
//             )}
//             {showRawText && traveller.back?.ocrText && (
//               <div className="mt-2">
//                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Back (address comes from here)</p>
//                 <pre className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
//                   {traveller.back.ocrText}
//                 </pre>
//               </div>
//             )}
//           </div>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//           <div>
//             <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title</label>
//             <select
//               value={traveller.title}
//               onChange={(e) => handleTravellerChange(index, "title", e.target.value)}
//               className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
//             >
//               <option>Mr</option>
//               <option>Mrs</option>
//               <option>Ms</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-xs font-semibold text-gray-600 mb-1.5">First Name</label>
//             <input
//               type="text"
//               value={traveller.firstName}
//               onChange={(e) => handleTravellerChange(index, "firstName", e.target.value)}
//               className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-semibold text-gray-600 mb-1.5">Last Name</label>
//             <input
//               type="text"
//               value={traveller.lastName}
//               onChange={(e) => handleTravellerChange(index, "lastName", e.target.value)}
//               className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-semibold text-gray-600 mb-1.5">Age</label>
//             <input
//               type="number"
//               value={traveller.age}
//               onChange={(e) => handleTravellerChange(index, "age", e.target.value)}
//               className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//           <div>
//             <label className="block text-xs font-semibold text-gray-600 mb-1.5">Gender</label>
//             <select
//               value={traveller.gender}
//               onChange={(e) => handleTravellerChange(index, "gender", e.target.value)}
//               className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
//             >
//               <option>Male</option>
//               <option>Female</option>
//               <option>Other</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sharing Type</label>
//             <select
//               value={traveller.sharingType}
//               onChange={(e) => handleTravellerChange(index, "sharingType", e.target.value)}
//               className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
//             >
//               <option value="">Select Sharing</option>
//               {Number(traveller.age) >= 11 ? (
//                 <>
//                   <option value="double">Double Sharing</option>
//                   <option value="triple">Triple Sharing</option>
//                 </>
//               ) : Number(traveller.age) >= 6 && Number(traveller.age) <= 10 ? (
//                 <>
//                   <option value="withBerth">Child with Berth</option>
//                   <option value="withoutBerth">Child without Berth</option>
//                 </>
//               ) : null}
//             </select>
//           </div>
//         </div>

//         {/* Mobile / Address — main traveller only. */}
//         {isMain && (
//           <div className="space-y-4">
//             <div>
//               <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
//                 <Phone className="w-3.5 h-3.5 text-indigo-500" /> Mobile Number
//               </label>
//               <input
//                 type="tel"
//                 value={traveller.phone}
//                 onChange={(e) => handleTravellerChange(index, "phone", e.target.value)}
//                 placeholder="e.g. 9876543210"
//                 className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
//               />
//             </div>

//             <div>
//               <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
//                 <Home className="w-3.5 h-3.5 text-indigo-500" /> Address
//               </label>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <input
//                   type="text"
//                   value={traveller.addressLine1}
//                   onChange={(e) => handleTravellerChange(index, "addressLine1", e.target.value)}
//                   placeholder="Address Line 1"
//                   className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
//                 />
//                 <input
//                   type="text"
//                   value={traveller.addressLine2}
//                   onChange={(e) => handleTravellerChange(index, "addressLine2", e.target.value)}
//                   placeholder="Address Line 2"
//                   className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
//                 />
//                 <input
//                   type="text"
//                   value={traveller.city}
//                   onChange={(e) => handleTravellerChange(index, "city", e.target.value)}
//                   placeholder="City"
//                   className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
//                 />
//                 <input
//                   type="text"
//                   value={traveller.state}
//                   onChange={(e) => handleTravellerChange(index, "state", e.target.value)}
//                   placeholder="State"
//                   className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
//                 />
//                 <input
//                   type="text"
//                   value={traveller.pincode}
//                   onChange={(e) => handleTravellerChange(index, "pincode", e.target.value)}
//                   placeholder="Pincode"
//                   className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
//                 />
//                 <input
//                   type="text"
//                   value="India"
//                   readOnly
//                   disabled
//                   className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm text-gray-500 cursor-not-allowed"
//                 />
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // ───────────── All Bookings tab ─────────────
// const PAYMENT_TYPES = [
//   { type: "advance", label: "Advance" },
//   { type: "balance", label: "Balance" },
//   { type: "partial", label: "Partial Balance" },
// ];

// const PaymentSlot = ({ groupId, tnr, type, label, items, uploadGroupPayment, deleteGroupPayment, refresh }) => {
//   const [queue, setQueue] = useState([]);
//   const [queueAmounts, setQueueAmounts] = useState([]);
//   const [queueRemarks, setQueueRemarks] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(null); // { current, total }
//   const [deletingId, setDeletingId] = useState(null);
//   const [viewerIndex, setViewerIndex] = useState(null);
//   // Synchronous double-click guard.
//   const uploadingRef = useRef(false);

//   const handleDelete = async (docId) => {
//     if (!window.confirm(`Delete this ${label} screenshot? This can't be undone.`)) return;
//     setDeletingId(docId);
//     try {
//       const result = await deleteGroupPayment(docId);
//       if (result?.success) {
//         toast.success(`${label} screenshot deleted`);
//         refresh();
//       }
//     } catch (err) {
//       console.error("deleteGroupPayment error:", err);
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const handleRemoveQueued = (idx) => {
//     setQueue((prev) => prev.filter((_, i) => i !== idx));
//     setQueueAmounts((prev) => prev.filter((_, i) => i !== idx));
//     setQueueRemarks((prev) => prev.filter((_, i) => i !== idx));
//   };

//   const uploadOne = async (file, amount, remarks) => {
//     const formData = new FormData();
//     formData.append("screenshot", file);
//     // Real walk-in group → groupId; booking merged from tourBookingModel
//     // ("real-<id>" placeholder) → tnr.
//     if (groupId && !String(groupId).startsWith("real-")) {
//       formData.append("groupId", groupId);
//     } else if (tnr) {
//       formData.append("tnr", tnr);
//     }
//     formData.append("type", type);
//     if (amount) formData.append("amount", amount);
//     if (remarks?.trim()) formData.append("remarks", remarks.trim());
//     return uploadGroupPayment(formData);
//   };

//   const handleUploadAll = async () => {
//     if (queue.length === 0) return toast.error(`Select at least one ${label} screenshot first`);
//     for (let i = 0; i < queueAmounts.length; i++) {
//       if (queueAmounts[i] && Number(queueAmounts[i]) <= 0) {
//         return toast.error(`Amount for "${queue[i]?.name}", if entered, must be a positive number`);
//       }
//     }
//     if (uploadingRef.current) return;
//     uploadingRef.current = true;
//     setUploading(true);
//     let successCount = 0;
//     for (let i = 0; i < queue.length; i++) {
//       setUploadProgress({ current: i + 1, total: queue.length });
//       try {
//         const result = await uploadOne(queue[i], queueAmounts[i], queueRemarks[i]);
//         if (result?.success) successCount += 1;
//       } catch (err) {
//         console.error("uploadGroupPayment error:", err);
//       }
//     }
//     setUploading(false);
//     setUploadProgress(null);
//     setQueue([]);
//     setQueueAmounts([]);
//     setQueueRemarks([]);
//     uploadingRef.current = false;
//     if (successCount > 0) {
//       toast.success(`${successCount} ${label} screenshot${successCount > 1 ? "s" : ""} uploaded`);
//     }
//     if (successCount < queue.length) {
//       toast.error(`${queue.length - successCount} ${label} screenshot(s) failed to upload`);
//     }
//     refresh();
//   };

//   return (
//     <div className="min-w-0 w-full p-3 sm:p-4 rounded-xl border border-[#DEE2E8] bg-[#F7F8FA]/60">
//       <h5 className="flex items-center gap-1.5 font-bold text-gray-700 text-sm mb-2.5">
//         <FileImage className="w-4 h-4" /> {label}
//       </h5>

//       {items.length > 0 && (
//         <div className="flex flex-wrap gap-2 mb-3">
//           {items.map((item, i) => (
//             <div
//               key={item._id || i}
//               className="relative flex items-start gap-1 text-xs font-semibold text-[#235F47] bg-[#EDF6F1] border border-[#B6DFC8] rounded-lg pl-2.5 pr-1.5 py-1.5 hover:bg-[#D7EEE0]"
//             >
//               <button
//                 type="button"
//                 onClick={() => setViewerIndex(i)}
//                 className="flex flex-col items-start gap-0.5 text-left"
//               >
//                 <span className="flex items-center gap-1.5">
//                   <CheckCircle2 className="w-3.5 h-3.5" />
//                   {items.length > 1 ? `#${i + 1}` : "View"}
//                   {item.amount ? ` — ₹${item.amount}` : " — amount not entered"}
//                 </span>
//                 {item.createdAt && (
//                   <span className="font-normal text-[#2E7D5E]">
//                     {new Date(item.createdAt).toLocaleString("en-IN", {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </span>
//                 )}
//                 {item.remarks && (
//                   <span className="font-normal text-[#2E7D5E] italic">{item.remarks}</span>
//                 )}
//               </button>
//               {item._id && deleteGroupPayment && (
//                 <button
//                   type="button"
//                   onClick={() => handleDelete(item._id)}
//                   disabled={deletingId === item._id}
//                   title={`Delete this ${label} screenshot`}
//                   className="shrink-0 p-1 rounded-md text-[#B23B3B] hover:text-[#872A2A] hover:bg-[#FBEEEE] disabled:opacity-50 transition-colors"
//                 >
//                   {deletingId === item._id ? (
//                     <Loader2 className="w-3.5 h-3.5 animate-spin" />
//                   ) : (
//                     <Trash2 className="w-3.5 h-3.5" />
//                   )}
//                 </button>
//               )}
//             </div>
//           ))}
//         </div>
//       )}

//       <ScreenshotViewer
//         items={items}
//         index={viewerIndex}
//         onClose={() => setViewerIndex(null)}
//         onNav={setViewerIndex}
//       />

//       {queue.length > 0 && (
//         <div className="flex flex-col gap-1.5 mb-2">
//           {queue.map((f, i) => (
//             <div key={i} className="flex flex-col gap-1.5 p-2 bg-white border border-[#DEE2E8] rounded-lg">
//               <div className="flex items-center gap-1.5">
//                 <div className="flex-1 min-w-0 flex items-center gap-1.5 text-xs font-semibold text-gray-700 px-1 py-1">
//                   <FileImage className="w-3.5 h-3.5 shrink-0 text-gray-400" />
//                   <span className="truncate">{f.name}</span>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={() => handleRemoveQueued(i)}
//                   disabled={uploading}
//                   title="Remove from queue"
//                   className="shrink-0 p-1.5 rounded-md text-gray-400 hover:text-[#B23B3B] hover:bg-[#FBEEEE] disabled:opacity-40 transition-colors"
//                 >
//                   <X className="w-3.5 h-3.5" />
//                 </button>
//               </div>
//               <input
//                 type="number"
//                 placeholder="₹ (optional — OCR tries first)"
//                 value={queueAmounts[i] || ""}
//                 onChange={(e) =>
//                   setQueueAmounts((prev) => prev.map((a, idx) => (idx === i ? e.target.value : a)))
//                 }
//                 disabled={uploading}
//                 className="w-full px-2.5 py-2 bg-white border border-[#DEE2E8] rounded-lg text-xs focus:border-[#5C84B3] focus:ring-2 focus:ring-[#DCE6F2] outline-none transition-all"
//               />
//               <input
//                 type="text"
//                 placeholder="Bank (e.g. SBI)"
//                 value={queueRemarks[i] || ""}
//                 onChange={(e) =>
//                   setQueueRemarks((prev) => {
//                     const next = [...prev];
//                     next[i] = e.target.value;
//                     return next;
//                   })
//                 }
//                 disabled={uploading}
//                 className="w-full px-2.5 py-2 bg-white border border-[#DEE2E8] rounded-lg text-xs focus:border-[#5C84B3] focus:ring-2 focus:ring-[#DCE6F2] outline-none transition-all"
//               />
//             </div>
//           ))}
//         </div>
//       )}

//       <label className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 bg-white border border-dashed border-[#DEE2E8] rounded-lg px-3 py-2.5 mb-2 cursor-pointer hover:border-[#5C84B3]">
//         <Upload className="w-3.5 h-3.5" />
//         {queue.length > 0 ? "Add more screenshot(s)" : "Choose screenshot(s)"}
//         <input
//           type="file"
//           accept="image/*,application/pdf"
//           multiple
//           className="hidden"
//           onChange={(e) => {
//             const files = Array.from(e.target.files || []);
//             if (!files.length) return;
//             setQueue((prev) => [...prev, ...files]);
//             setQueueAmounts((prev) => [...prev, ...files.map(() => "")]);
//             setQueueRemarks((prev) => [...prev, ...files.map(() => "")]);
//             e.target.value = "";
//           }}
//         />
//       </label>

//       {queue.length > 0 && (
//         <button
//           onClick={handleUploadAll}
//           disabled={uploading}
//           className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#2E7D5E] hover:bg-[#235F47] disabled:bg-[#C9CFD8] text-white rounded-lg text-xs font-semibold transition-colors"
//         >
//           {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
//           {uploading
//             ? `Uploading ${uploadProgress?.current || 1} of ${uploadProgress?.total || queue.length}...`
//             : `Upload ${queue.length > 1 ? `All (${queue.length})` : ""}`}
//         </button>
//       )}
//     </div>
//   );
// };

// const SHARING_LABELS = {
//   double: "Double Sharing",
//   triple: "Triple Sharing",
//   withBerth: "Child w/ Berth",
//   withoutBerth: "Child w/o Berth",
// };

// // Inline edit form for an already-captured traveller.
// const TravellerEditForm = ({ draft, setDraft, onSave, onCancel, saving, accent = "indigo" }) => {
//   if (!draft) return null;
//   const update = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }));
//   const updateAddressField = (field, value) =>
//     setDraft((prev) => {
//       const next = { ...prev, [field]: value };
//       next.address = [next.addressLine1, next.addressLine2, next.city, next.state, next.pincode]
//         .filter(Boolean)
//         .join(", ");
//       return next;
//     });
//   const ring = accent === "purple" ? "border-[#EAD29C] bg-[#FBF4E7]/40" : "border-[#C3D4E8] bg-[#EEF3FA]/40";
//   const btn = accent === "purple" ? "bg-[#B07D2B] hover:bg-[#8C6220]" : "bg-[#2A5490] hover:bg-[#1F3F6E]";
//   return (
//     <div className={`rounded-xl border-2 p-3 sm:p-4 ${ring}`}>
//       <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
//         <div>
//           <label className="block text-xs font-medium text-gray-600">Title</label>
//           <select
//             value={draft.title}
//             onChange={(e) => update("title", e.target.value)}
//             className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
//           >
//             <option>Mr</option>
//             <option>Mrs</option>
//             <option>Ms</option>
//           </select>
//         </div>
//         <div>
//           <label className="block text-xs font-medium text-gray-600">First Name</label>
//           <input
//             type="text"
//             value={draft.firstName}
//             onChange={(e) => update("firstName", e.target.value)}
//             className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
//           />
//         </div>
//         <div>
//           <label className="block text-xs font-medium text-gray-600">Last Name</label>
//           <input
//             type="text"
//             value={draft.lastName}
//             onChange={(e) => update("lastName", e.target.value)}
//             className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
//           />
//         </div>
//         <div>
//           <label className="block text-xs font-medium text-gray-600">Age</label>
//           <input
//             type="number"
//             value={draft.age}
//             onChange={(e) => update("age", e.target.value)}
//             className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
//           />
//         </div>
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
//         <div>
//           <label className="block text-xs font-medium text-gray-600">Gender</label>
//           <select
//             value={draft.gender}
//             onChange={(e) => update("gender", e.target.value)}
//             className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
//           >
//             <option>Male</option>
//             <option>Female</option>
//             <option>Other</option>
//           </select>
//         </div>
//         <div>
//           <label className="block text-xs font-medium text-gray-600">Sharing Type</label>
//           <select
//             value={draft.sharingType}
//             onChange={(e) => update("sharingType", e.target.value)}
//             className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
//           >
//             <option value="">Select Sharing</option>
//             <option value="double">Double Sharing</option>
//             <option value="triple">Triple Sharing</option>
//             <option value="withBerth">Child with Berth</option>
//             <option value="withoutBerth">Child without Berth</option>
//           </select>
//         </div>
//         <div>
//           <label className="block text-xs font-medium text-gray-600">Phone</label>
//           <input
//             type="text"
//             value={draft.phone}
//             onChange={(e) => update("phone", e.target.value)}
//             className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
//           />
//         </div>
//       </div>
//       <div className="mt-3">
//         <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//           <input
//             type="text"
//             value={draft.addressLine1 || ""}
//             onChange={(e) => updateAddressField("addressLine1", e.target.value)}
//             placeholder="Address Line 1"
//             className="w-full px-3 py-2 border rounded-lg text-sm"
//           />
//           <input
//             type="text"
//             value={draft.addressLine2 || ""}
//             onChange={(e) => updateAddressField("addressLine2", e.target.value)}
//             placeholder="Address Line 2"
//             className="w-full px-3 py-2 border rounded-lg text-sm"
//           />
//           <input
//             type="text"
//             value={draft.city || ""}
//             onChange={(e) => updateAddressField("city", e.target.value)}
//             placeholder="City"
//             className="w-full px-3 py-2 border rounded-lg text-sm"
//           />
//           <input
//             type="text"
//             value={draft.state || ""}
//             onChange={(e) => updateAddressField("state", e.target.value)}
//             placeholder="State"
//             className="w-full px-3 py-2 border rounded-lg text-sm"
//           />
//           <input
//             type="text"
//             value={draft.pincode || ""}
//             onChange={(e) => updateAddressField("pincode", e.target.value)}
//             placeholder="Pincode"
//             className="w-full px-3 py-2 border rounded-lg text-sm"
//           />
//           <input
//             type="text"
//             value="India"
//             readOnly
//             disabled
//             className="w-full px-3 py-2 border rounded-lg text-sm bg-[#F7F8FA] text-gray-500 cursor-not-allowed"
//           />
//         </div>
//       </div>
//       <div className="flex items-center gap-2 mt-3">
//         <button
//           onClick={onSave}
//           disabled={saving}
//           className={`flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-60 ${btn}`}
//         >
//           {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
//           {saving ? "Saving..." : "Save"}
//         </button>
//         <button
//           onClick={onCancel}
//           disabled={saving}
//           className="px-3 py-1.5 bg-white border border-[#C9CFD8] hover:bg-[#F7F8FA] text-gray-600 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60"
//         >
//           Cancel
//         </button>
//       </div>
//     </div>
//   );
// };

// const BookingCard = ({
//   booking,
//   expanded,
//   onToggle,
//   extractAadhaar,
//   addCoTravellerApi,
//   uploadGroupPayment,
//   deleteGroupPayment,
//   uploadUserTravellerAadhaar,
//   linkGroupTnr,
//   editAadhaarTraveller,
//   deleteAadhaarTraveller,
//   linkGuestTnr,
//   unlinkGuestTnr,
//   deleteBookingByTnr,
//   allBookings,
//   onCreateBooking,
//   navigate,
//   refresh,
// }) => {
//   const [ctFile, setCtFile] = useState(null);
//   const [ctExtracting, setCtExtracting] = useState(false);
//   const [ctSaving, setCtSaving] = useState(false);
//   const ctSavingRef = useRef(false); // synchronous double-click guard
//   const [ctDraft, setCtDraft] = useState(null);
//   const ctInputRef = useRef(null);
//   const [showCtRawText, setShowCtRawText] = useState(false);
//   const [tnrInput, setTnrInput] = useState("");
//   const [linkingTnr, setLinkingTnr] = useState(false);
//   const [showTnrInput, setShowTnrInput] = useState(false);

//   const [guestSearch, setGuestSearch] = useState("");
//   const [selectedGuestTnrs, setSelectedGuestTnrs] = useState([]);
//   const [showGuestInput, setShowGuestInput] = useState(false);
//   const [linkingGuest, setLinkingGuest] = useState(false);
//   const [unlinkingGuest, setUnlinkingGuest] = useState(false);

//   const [editingId, setEditingId] = useState(null);
//   const [editingDocId, setEditingDocId] = useState(null);
//   const [editDraft, setEditDraft] = useState(null);
//   const [savingEdit, setSavingEdit] = useState(false);
//   const [deletingId, setDeletingId] = useState(null);
//   const [downloadingZip, setDownloadingZip] = useState(false);

//   const startEdit = (traveller) => {
//     setEditingId(traveller._id);
//     setEditingDocId(traveller.aadhaarDocId || traveller._id);
//     setEditDraft({
//       title: traveller.title || "",
//       firstName: traveller.firstName || "",
//       lastName: traveller.lastName || "",
//       age: traveller.age || "",
//       gender: traveller.gender || "",
//       sharingType: traveller.sharingType || "",
//       phone: traveller.phone || "",
//       address: traveller.address || "",
//       addressLine1: traveller.addressLine1 || "",
//       addressLine2: traveller.addressLine2 || "",
//       city: traveller.city || "",
//       state: traveller.state || "",
//       pincode: traveller.pincode || "",
//     });
//   };
//   const cancelEdit = () => {
//     setEditingId(null);
//     setEditingDocId(null);
//     setEditDraft(null);
//   };
//   const saveEdit = async () => {
//     if (!editingId || !editDraft) return;
//     setSavingEdit(true);
//     try {
//       const result = await editAadhaarTraveller(editingDocId || editingId, editDraft);
//       if (result?.success) {
//         toast.success("Traveller updated");
//         cancelEdit();
//         refresh();
//       }
//     } finally {
//       setSavingEdit(false);
//     }
//   };
//   const handleDeleteTraveller = async (traveller, isMain) => {
//     const travellerName =
//       [traveller.title, traveller.firstName, traveller.lastName].filter(Boolean).join(" ") || "this co-traveller";
//     const confirmMsg = isMain
//       ? "Delete the Aadhaar FILES (front/back image or PDF) for every traveller in this booking (main + co-travellers)? The already-extracted details (Name, Age, Gender, Address, Aadhaar Number) are kept — only the uploaded files are removed from storage. This cannot be undone."
//       : `Remove ${travellerName} from this booking? This cannot be undone.`;
//     if (!window.confirm(confirmMsg)) return;
//     setDeletingId(traveller._id);
//     try {
//       const result = await deleteAadhaarTraveller(traveller.aadhaarDocId || traveller._id);
//       if (result?.success) {
//         toast.success(
//           isMain
//             ? "Aadhaar files deleted for this booking"
//             : result.removedTraveller
//               ? "Co-traveller removed from this booking"
//               : "Co-traveller's Aadhaar file removed",
//         );
//         refresh();
//       }
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const mainName = [booking.main?.title, booking.main?.firstName, booking.main?.lastName]
//     .filter(Boolean)
//     .join(" ") || "Unnamed traveller";
//   const travellerCount = 1 + (booking.coTravellers?.length || 0);

//   const guestCandidates = (allBookings || [])
//     .filter((b) => b.tnr && b.tnr !== booking.tnr)
//     .filter((b) => !(booking.guestGroup?.otherTnrs || []).includes(b.tnr))
//     .map((b) => ({
//       tnr: b.tnr,
//       name: [b.main?.title, b.main?.firstName, b.main?.lastName].filter(Boolean).join(" ") || "Unnamed traveller",
//     }))
//     .filter(({ tnr, name }) => {
//       const q = guestSearch.trim().toLowerCase();
//       if (!q) return true;
//       return tnr.toLowerCase().includes(q) || name.toLowerCase().includes(q);
//     });

//   const toggleGuestCandidate = (tnr) => {
//     setSelectedGuestTnrs((prev) =>
//       prev.includes(tnr) ? prev.filter((t) => t !== tnr) : [...prev, tnr],
//     );
//   };

//   const safeFileName = (name) =>
//     (name || "traveller").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "traveller";
//   const extFromUrl = (url) => {
//     const match = url.split("?")[0].match(/\.([a-zA-Z0-9]+)$/);
//     return match ? match[1] : "jpg";
//   };
//   // ZIP of Aadhaar images of this booking's active (not approved-cancelled) travellers.
//   const handleDownloadZip = async () => {
//     const entries = [];
//     if (booking.main?.front?.url && !booking.main?.cancelled) {
//       entries.push({ name: `Main - ${mainName} - Front`, url: booking.main.front.url });
//     }
//     if (booking.main?.back?.url && !booking.main?.cancelled) {
//       entries.push({ name: `Main - ${mainName} - Back`, url: booking.main.back.url });
//     }
//     (booking.coTravellers || []).forEach((ct, i) => {
//       if (ct.cancelled) return;
//       const ctName = [ct.title, ct.firstName, ct.lastName].filter(Boolean).join(" ") || `Co-Traveller ${i + 1}`;
//       if (ct.url) {
//         entries.push({ name: `Co-Traveller ${i + 1} - ${ctName} - Front`, url: ct.url });
//       }
//       if (ct.back?.url) {
//         entries.push({ name: `Co-Traveller ${i + 1} - ${ctName} - Back`, url: ct.back.url });
//       }
//     });

//     if (entries.length === 0) {
//       toast.error("No Aadhaar images found for this booking's active (non-cancelled) travellers");
//       return;
//     }

//     setDownloadingZip(true);
//     try {
//       const zip = new JSZip();
//       let fetchedCount = 0;
//       await Promise.all(
//         entries.map(async (entry) => {
//           try {
//             const res = await fetch(entry.url);
//             if (!res.ok) throw new Error(`HTTP ${res.status}`);
//             const blob = await res.blob();
//             zip.file(`${safeFileName(entry.name)}.${extFromUrl(entry.url)}`, blob);
//             fetchedCount += 1;
//           } catch (err) {
//             console.error(`[DownloadZip] Could not fetch "${entry.name}" (${entry.url}):`, err);
//           }
//         }),
//       );

//       if (fetchedCount === 0) {
//         toast.error("Could not download any Aadhaar images — check your connection and try again.");
//         return;
//       }

//       const zipBlob = await zip.generateAsync({ type: "blob" });
//       const link = document.createElement("a");
//       link.href = URL.createObjectURL(zipBlob);
//       link.download = `${safeFileName(mainName)}_Aadhaar.zip`;
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       URL.revokeObjectURL(link.href);
//       toast.success(
//         fetchedCount < entries.length
//           ? `Downloaded ${fetchedCount}/${entries.length} Aadhaar images (some failed — check console)`
//           : "Aadhaar ZIP downloaded",
//       );
//     } catch (error) {
//       console.error("[DownloadZip] error:", error);
//       toast.error("Could not build the Aadhaar ZIP");
//     } finally {
//       setDownloadingZip(false);
//     }
//   };

//   // Step 1 of 2 — OCR into an editable draft (not saved yet).
//   const handleExtractCt = async () => {
//     if (!ctFile) return toast.error("Choose the co-traveller's Aadhaar front image first");
//     setCtExtracting(true);
//     try {
//       const formData = new FormData();
//       formData.append("front", ctFile);
//       const ocrResult = await extractAadhaar(formData);
//       if (!ocrResult?.success) {
//         if (ocrResult === undefined) {
//           toast.error("Aadhaar read failed — no response from server. Check your connection and try again.");
//         }
//         return;
//       }
//       if (!ocrResult.front?.url) {
//         toast.error("Aadhaar was read but the image didn't upload — please try again.");
//         return;
//       }

//       const p = ocrResult.parsed || {};
//       const ctGender = p.gender || "Male";
//       const age = Number(p.age) || "";
//       setCtDraft({
//         front: ocrResult.front,
//         title: ctGender === "Female" ? "Mrs" : "Mr",
//         firstName: p.firstName || "",
//         lastName: p.lastName || "",
//         age,
//         gender: ctGender,
//         dob: p.dob || "",
//         phone: p.phone || "",
//         address: p.address || "",
//         addressLine1: p.addressLine1 || "",
//         addressLine2: p.addressLine2 || "",
//         city: p.city || "",
//         state: p.state || "",
//         pincode: p.pincode || "",
//         sharingType: age >= 11 ? "double" : age >= 6 && age <= 10 ? "withBerth" : "",
//       });
//       toast.success("Aadhaar read. Verify details below before adding.");
//     } catch (err) {
//       console.error("extract co-traveller error:", err);
//       toast.error("Something went wrong reading this Aadhaar. Check the console for details.");
//     } finally {
//       setCtExtracting(false);
//     }
//   };

//   const clearCtFile = () => {
//     if (ctInputRef.current) ctInputRef.current.value = "";
//     setCtFile(null);
//     setCtDraft(null);
//   };

//   const updateCtDraft = (field, value) => {
//     setCtDraft((prev) => {
//       const next = { ...prev, [field]: value };
//       if (field === "gender") next.title = value === "Female" ? "Mrs" : "Mr";
//       if (field === "age") {
//         const age = Number(value);
//         if (age > 85) {
//           toast.error("Age cannot exceed 85 years.");
//           return prev;
//         }
//         if (age >= 11) next.sharingType = "double";
//         else if (age >= 6 && age <= 10) next.sharingType = "withBerth";
//         else next.sharingType = "";
//       }
//       return next;
//     });
//   };

//   // Step 2 of 2 — save the draft. For a real booking ("real-<id>") this
//   // sends tnr; the backend keeps it pending (NOT in Tour Bookings) until
//   // Raise Manage Booking is approved.
//   const handleAddCoTraveller = async () => {
//     if (!ctDraft?.front?.url) return toast.error("Extract the co-traveller's Aadhaar first");
//     if (ctSavingRef.current) return;
//     ctSavingRef.current = true;
//     setCtSaving(true);
//     try {
//       const isRealBooking = String(booking.groupId || "").startsWith("real-");
//       const addResult = await addCoTravellerApi({
//         ...(isRealBooking ? { tnr: booking.tnr } : { groupId: booking.groupId }),
//         title: ctDraft.title,
//         firstName: ctDraft.firstName,
//         lastName: ctDraft.lastName,
//         age: ctDraft.age,
//         dob: ctDraft.dob,
//         gender: ctDraft.gender,
//         sharingType: ctDraft.sharingType,
//         phone: ctDraft.phone,
//         address: ctDraft.address,
//         addressLine1: ctDraft.addressLine1,
//         addressLine2: ctDraft.addressLine2,
//         city: ctDraft.city,
//         state: ctDraft.state,
//         pincode: ctDraft.pincode,
//         front: ctDraft.front,
//       });
//       if (!addResult?.success) {
//         toast.error(addResult?.message || "Could not save the co-traveller — please try again.");
//         return;
//       }

//       toast.success(
//         booking.tnr
//           ? "Co-traveller added — click Raise Manage Booking to add them to the booking"
//           : "Co-traveller added",
//       );
//       clearCtFile();
//       refresh();
//     } catch (err) {
//       console.error("addCoTraveller error:", err);
//       toast.error("Something went wrong adding this co-traveller. Check the console for details.");
//     } finally {
//       ctSavingRef.current = false;
//       setCtSaving(false);
//     }
//   };

//   const handleLinkTnr = async () => {
//     if (!tnrInput.trim()) return toast.error("Enter the TNR");
//     setLinkingTnr(true);
//     try {
//       const result = await linkGroupTnr({ groupId: booking.groupId, tnr: tnrInput.trim() });
//       if (!result?.success) return;
//       toast.success("TNR linked to this booking");
//       setTnrInput("");
//       setShowTnrInput(false);
//       refresh();
//     } catch (err) {
//       console.error("linkGroupTnr error:", err);
//     } finally {
//       setLinkingTnr(false);
//     }
//   };

//   const handleLinkGuest = async () => {
//     if (selectedGuestTnrs.length === 0) return toast.error("Select at least one booking to link");
//     setLinkingGuest(true);
//     try {
//       let okCount = 0;
//       for (const tnr of selectedGuestTnrs) {
//         const result = await linkGuestTnr(booking.tnr, tnr);
//         if (result?.success) okCount += 1;
//       }
//       if (okCount === 0) return;
//       toast.success(
//         okCount === selectedGuestTnrs.length
//           ? `Linked as the same guest (${okCount} booking${okCount !== 1 ? "s" : ""})`
//           : `Linked ${okCount}/${selectedGuestTnrs.length} bookings — check console for the rest`,
//       );
//       setSelectedGuestTnrs([]);
//       setGuestSearch("");
//       setShowGuestInput(false);
//       refresh();
//     } catch (err) {
//       console.error("linkGuestTnr error:", err);
//     } finally {
//       setLinkingGuest(false);
//     }
//   };

//   const handleUnlinkGuest = async () => {
//     if (!window.confirm("Unlink this booking from its guest group?")) return;
//     setUnlinkingGuest(true);
//     try {
//       const result = await unlinkGuestTnr(booking.tnr);
//       if (!result?.success) return;
//       toast.success("Unlinked from guest group");
//       refresh();
//     } catch (err) {
//       console.error("unlinkGuestTnr error:", err);
//     } finally {
//       setUnlinkingGuest(false);
//     }
//   };

//   const handleRaiseManageBooking = (traveller) => {
//     navigate("/tour-managebooking", {
//       state: {
//         tnr: booking.tnr,
//         prefillTraveller: {
//           title: traveller.title,
//           firstName: traveller.firstName,
//           lastName: traveller.lastName,
//           age: traveller.age,
//           gender: traveller.gender,
//           aadhaarId: traveller.aadhaarDocId || traveller._id || null,
//           isCoTraveller: true,
//           addedBy: "admin",
//           addedPostBooking: true,
//         },
//       },
//     });
//   };

//   const spineColor = booking.paymentSummary?.fullyPaid
//     ? "border-l-[#2E7D5E]"
//     : booking.paymentSummary
//       ? "border-l-[#B8641F]"
//       : "border-l-[#C3D4E8]";
//   const avatarGradient = booking.paymentSummary?.fullyPaid
//     ? "from-emerald-600 to-emerald-500 shadow-emerald-200"
//     : booking.paymentSummary
//       ? "from-amber-600 to-amber-500 shadow-amber-200"
//       : "from-[#2A5490] to-sky-500 shadow-sky-200";

//   return (
//     <div className={`rounded-2xl border border-[#DEE2E8] border-l-4 ${spineColor} shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white`}>
//       <div className="w-full flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 px-3.5 sm:px-5 py-3.5 sm:py-4 bg-gradient-to-r from-[#F5F6F8] to-[#F8FAFC] hover:from-[#EEF0F3] hover:to-[#EEF3FA] transition-colors">
//         <div
//           role="button"
//           tabIndex={0}
//           onClick={onToggle}
//           onKeyDown={(e) => {
//             if (e.key === "Enter" || e.key === " ") {
//               e.preventDefault();
//               onToggle();
//             }
//           }}
//           className="flex-1 min-w-0 flex items-center gap-2.5 sm:gap-3 text-left cursor-pointer"
//         >
//           <div className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-gradient-to-br ${avatarGradient} text-white flex items-center justify-center shadow-sm`}>
//             <IdCard className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
//           </div>
//           <div className="min-w-0">
//             <p className="font-bold text-[#1C2733] truncate">{mainName}</p>
//             <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
//               <span className="truncate max-w-full">
//                 {booking.tourTitle || "Tour"} · {travellerCount} traveller{travellerCount !== 1 ? "s" : ""}
//               </span>
//               {booking.tnr && (
//                 <span className="inline-flex items-center gap-1 text-[#1F3F6E] font-bold font-mono tracking-wide">
//                   <Ticket className="w-3 h-3 shrink-0" /> {booking.tnr}
//                   <CopyTnrButton tnr={booking.tnr} />
//                 </span>
//               )}
//               {booking.tnr && (
//                 <span
//                   className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${booking.createdBy === "user" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
//                     }`}
//                 >
//                   ● {booking.createdBy === "user" ? "USER" : "ADMIN"}
//                 </span>
//               )}
//               {booking.raisedBy?.name && (
//                 <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
//                   <UserCheck className="w-3 h-3 shrink-0" /> Raised by {booking.raisedBy.name}
//                   {booking.raisedBy.employeeId ? ` (${booking.raisedBy.employeeId})` : ""}
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>
//         <div className="flex items-center gap-2 shrink-0">
//           <button
//             onClick={(e) => { e.stopPropagation(); handleDownloadZip(); }}
//             disabled={downloadingZip}
//             title="Download Aadhaar images of this booking's current travellers as a ZIP"
//             className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#C3D4E8] bg-white text-[#1F3F6E] text-xs font-semibold hover:bg-[#EEF3FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//           >
//             {downloadingZip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
//             <span className="hidden sm:inline">{downloadingZip ? "Zipping..." : "Aadhaar ZIP"}</span>
//           </button>
//           <button onClick={onToggle} className="shrink-0 p-1">
//             {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
//           </button>
//         </div>
//       </div>

//       {expanded && (
//         <div className="p-5 sm:p-6 border-t-2 border-dashed border-[#DEE2E8] space-y-6">
//           {/* Same guest, different TNR */}
//           {booking.tnr && (
//             <div className="rounded-xl border border-[#F5E6C8] bg-[#FBF4E7]/50 p-3">
//               {booking.guestGroup ? (
//                 <div className="space-y-2">
//                   <p className="text-xs font-bold text-[#6B4A18] flex items-center gap-1.5">
//                     <Users className="w-3.5 h-3.5" /> Same guest — {booking.guestGroup.otherTnrs.length} other booking{booking.guestGroup.otherTnrs.length !== 1 ? "s" : ""}
//                   </p>
//                   <div className="flex flex-wrap gap-1.5">
//                     {booking.guestGroup.otherTnrs.map((t) => {
//                       const matched = (allBookings || []).find((b) => b.tnr === t);
//                       const matchedName = matched
//                         ? [matched.main?.title, matched.main?.firstName, matched.main?.lastName]
//                           .filter(Boolean)
//                           .join(" ")
//                         : "";
//                       return (
//                         <span
//                           key={t}
//                           className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-[#EAD29C] text-[#6B4A18] text-xs font-semibold"
//                         >
//                           <Ticket className="w-3 h-3 shrink-0" /> {t}
//                           {matchedName && <span className="font-normal text-[#B07D2B]">· {matchedName}</span>}
//                         </span>
//                       );
//                     })}
//                   </div>
//                   {booking.guestGroup.label && (
//                     <p className="text-xs text-[#8C6220]">{booking.guestGroup.label}</p>
//                   )}
//                   <button
//                     onClick={handleUnlinkGuest}
//                     disabled={unlinkingGuest}
//                     className="text-xs font-semibold text-[#A33333] hover:text-[#6E2222] disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {unlinkingGuest ? "Unlinking..." : "Unlink this booking"}
//                   </button>
//                 </div>
//               ) : !showGuestInput ? (
//                 <button
//                   onClick={() => setShowGuestInput(true)}
//                   className="flex items-center gap-1.5 text-xs font-semibold text-[#8C6220] hover:text-[#4F3712]"
//                 >
//                   <Link2 className="w-3.5 h-3.5" /> Link as same guest as another booking
//                 </button>
//               ) : (
//                 <div className="space-y-2">
//                   <input
//                     type="text"
//                     value={guestSearch}
//                     onChange={(e) => setGuestSearch(e.target.value)}
//                     placeholder="Search by TNR or traveller name"
//                     className="w-full px-3 py-1.5 bg-white border border-[#EAD29C] rounded-lg text-xs focus:border-[#C89B44] focus:ring-2 focus:ring-[#F5E6C8] outline-none transition-all"
//                   />

//                   {selectedGuestTnrs.length > 0 && (
//                     <div className="flex flex-wrap gap-1.5">
//                       {selectedGuestTnrs.map((t) => (
//                         <span
//                           key={t}
//                           className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#B07D2B] text-white text-xs font-semibold"
//                         >
//                           {t}
//                         </span>
//                       ))}
//                     </div>
//                   )}

//                   <div className="max-h-48 overflow-y-auto rounded-lg border border-[#EAD29C] bg-white divide-y divide-[#FBF4E7]">
//                     {guestCandidates.length === 0 ? (
//                       <p className="text-xs text-gray-400 px-3 py-3 text-center">
//                         {guestSearch.trim() ? "No matching bookings" : "No other bookings with a TNR yet"}
//                       </p>
//                     ) : (
//                       guestCandidates.map(({ tnr, name }) => (
//                         <label
//                           key={tnr}
//                           className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-[#FBF4E7] text-xs"
//                         >
//                           <input
//                             type="checkbox"
//                             checked={selectedGuestTnrs.includes(tnr)}
//                             onChange={() => toggleGuestCandidate(tnr)}
//                             className="w-3.5 h-3.5 accent-[#B07D2B] shrink-0"
//                           />
//                           <span className="flex items-center gap-1 font-semibold text-[#1F3F6E] shrink-0">
//                             <Ticket className="w-3 h-3" /> {tnr}
//                           </span>
//                           <span className="text-gray-600 truncate">{name}</span>
//                         </label>
//                       ))
//                     )}
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={handleLinkGuest}
//                       disabled={linkingGuest || selectedGuestTnrs.length === 0}
//                       className="px-3 py-1.5 bg-[#B07D2B] hover:bg-[#8C6220] disabled:bg-[#C9CFD8] text-white rounded-lg text-xs font-semibold transition-colors"
//                     >
//                       {linkingGuest ? "Linking..." : `Save${selectedGuestTnrs.length ? ` (${selectedGuestTnrs.length})` : ""}`}
//                     </button>
//                     <button
//                       onClick={() => { setShowGuestInput(false); setSelectedGuestTnrs([]); setGuestSearch(""); }}
//                       className="text-xs text-gray-500 hover:text-gray-700"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Booking notes — reference only */}
//           {booking.bookingNotes && (
//             <div className="text-xs text-gray-500 bg-[#F7F8FA] rounded-xl p-3 border border-[#E7EAEF] space-y-1.5">
//               <div className="flex flex-col gap-1">
//                 {booking.bookingNotes.packageType && <span><b>Package:</b> {booking.bookingNotes.packageType}</span>}
//                 {booking.bookingNotes.boardingPoint && <span><b>Boarding:</b> {booking.bookingNotes.boardingPoint}</span>}
//                 {booking.bookingNotes.deboardingPoint && <span><b>Deboarding:</b> {booking.bookingNotes.deboardingPoint}</span>}
//                 {booking.bookingNotes.remarks && <span><b>Remarks:</b> {booking.bookingNotes.remarks}</span>}
//               </div>
//               {booking.bookingNotes.addonsDetail?.length > 0 ? (
//                 <div className="flex flex-col gap-1.5 pt-1">
//                   {booking.bookingNotes.addonsDetail.map((a, i) => (
//                     <div
//                       key={i}
//                       className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#DCE6F2] text-[#17314F] font-medium"
//                     >
//                       <Train className="w-3.5 h-3.5 shrink-0" />
//                       <span className="flex-1 min-w-0 truncate">{a.label ? `${a.label}: ` : ""}{a.name}</span>
//                       {a.amount > 0 && <span className="shrink-0 text-[#2A5490] font-semibold">₹{a.amount}</span>}
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 booking.bookingNotes.addons && <div><b>Add-ons:</b> {booking.bookingNotes.addons}</div>
//               )}
//             </div>
//           )}

//           {/* Main traveller */}
//           <div>
//             <h4 className="flex items-center gap-2 font-bold text-gray-800 text-sm mb-2">
//               <IdCard className="w-4 h-4 text-[#2A5490]" /> Main Traveller
//             </h4>
//             {editingId === booking.main?._id ? (
//               <TravellerEditForm
//                 draft={editDraft}
//                 setDraft={setEditDraft}
//                 onSave={saveEdit}
//                 onCancel={cancelEdit}
//                 saving={savingEdit}
//                 accent="indigo"
//               />
//             ) : (
//               <div className="flex flex-col items-start gap-1.5 text-sm text-gray-600 bg-[#EEF3FA]/60 border border-[#DCE6F2] rounded-xl p-3">
//                 <span className="font-semibold text-gray-800">{mainName}</span>
//                 <CancelStatusBadge status={booking.main?.cancelStatus} />
//                 <span>Age: {booking.main?.age || "—"}</span>
//                 <span>Gender: {booking.main?.gender || "—"}</span>
//                 <span>Mobile: {booking.main?.phone || "—"}</span>
//                 {booking.main?.sharingType && (
//                   <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#DCE6F2] text-[#1F3F6E] font-semibold text-xs">
//                     {SHARING_LABELS[booking.main.sharingType] || booking.main.sharingType}
//                   </span>
//                 )}
//                 {booking.main?.front?.url && (
//                   <a href={booking.main.front.url} target="_blank" rel="noopener noreferrer" className="text-[#2A5490] font-semibold underline">View Front</a>
//                 )}
//                 {booking.main?.back?.url && (
//                   <a href={booking.main.back.url} target="_blank" rel="noopener noreferrer" className="text-[#2A5490] font-semibold underline">View Back</a>
//                 )}
//                 {booking.main?.address && (
//                   <span className="w-full flex items-center gap-1.5 text-gray-600">
//                     <Home className="w-3.5 h-3.5 text-[#3A6698] shrink-0" /> {booking.main.address}
//                   </span>
//                 )}
//                 {/* Edit/Delete only before a real tnr exists. */}
//                 {!booking.tnr && booking.main?._id && (
//                   <div className="w-full flex items-center gap-2 pt-1">
//                     <button
//                       onClick={() => startEdit(booking.main)}
//                       className="flex items-center gap-1 px-2.5 py-1 bg-white border border-[#9FB9D8] hover:bg-[#DCE6F2] text-[#1F3F6E] rounded-lg text-xs font-semibold transition-colors"
//                     >
//                       <Pencil className="w-3 h-3" /> Edit
//                     </button>
//                     <button
//                       onClick={() => handleDeleteTraveller(booking.main, true)}
//                       disabled={deletingId === booking.main._id}
//                       className="flex items-center gap-1 px-2.5 py-1 bg-white border border-[#D99999] hover:bg-[#FBEEEE] text-[#A33333] rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
//                     >
//                       <Trash2 className="w-3 h-3" /> {deletingId === booking.main._id ? "Deleting..." : "Delete Booking"}
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}
//             {/* Missing Aadhaar on a real booking — upload row (hidden for
//                 cancelled/rejected travellers). */}
//             {booking.tnr && booking.main?._id && !booking.main?.front?.url && uploadUserTravellerAadhaar &&
//               booking.main?.cancelStatus !== "cancelled" && booking.main?.cancelStatus !== "rejected" && (
//                 <TravellerAadhaarRow
//                   traveller={{
//                     _id: booking.main._id,
//                     title: booking.main.title,
//                     firstName: booking.main.firstName,
//                     lastName: booking.main.lastName,
//                     age: booking.main.age,
//                     gender: booking.main.gender,
//                     isCoTraveller: false,
//                     hasAadhaar: false,
//                   }}
//                   tnr={booking.tnr}
//                   extractAadhaar={extractAadhaar}
//                   uploadUserTravellerAadhaar={uploadUserTravellerAadhaar}
//                   onSaved={refresh}
//                 />
//               )}
//           </div>

//           {/* Co-travellers */}
//           <div>
//             <h4 className="flex items-center gap-2 font-bold text-gray-800 text-sm mb-2">
//               <Users className="w-4 h-4 text-[#B07D2B]" /> Co-Travellers ({booking.coTravellers.length})
//             </h4>
//             {booking.coTravellers.length > 0 && (
//               <div className="space-y-2 mb-3">
//                 {booking.coTravellers.map((ct, i) => {
//                   const ctName = [ct.title, ct.firstName, ct.lastName].filter(Boolean).join(" ") || `Traveller ${i + 2}`;
//                   if (editingId === ct._id) {
//                     return (
//                       <TravellerEditForm
//                         key={ct._id || i}
//                         draft={editDraft}
//                         setDraft={setEditDraft}
//                         onSave={saveEdit}
//                         onCancel={cancelEdit}
//                         saving={savingEdit}
//                         accent="purple"
//                       />
//                     );
//                   }
//                   return (
//                     <React.Fragment key={ct._id || i}>
//                       <div className="flex flex-col gap-3 text-sm text-gray-600 bg-[#FBF4E7]/60 border border-[#F5E6C8] rounded-xl p-3">
//                         <div className="flex flex-col items-start gap-1.5">
//                           <span className="font-semibold text-gray-800">{ctName}</span>
//                           <CancelStatusBadge status={ct.cancelStatus} />
//                           <span>Age: {ct.age || "—"}</span>
//                           <span>Gender: {ct.gender || "—"}</span>
//                           {ct.sharingType && (
//                             <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#F5E6C8] text-[#8C6220] font-semibold text-xs">
//                               {SHARING_LABELS[ct.sharingType] || ct.sharingType}
//                             </span>
//                           )}
//                           {ct.url && (
//                             <a href={ct.url} target="_blank" rel="noopener noreferrer" className="text-[#2A5490] font-semibold underline">View Front</a>
//                           )}
//                           {ct.back?.url && (
//                             <a href={ct.back.url} target="_blank" rel="noopener noreferrer" className="text-[#2A5490] font-semibold underline">View Back</a>
//                           )}
//                         </div>
//                         {/* Before a tnr exists → Edit/Remove.
//                             After a tnr exists, for a co-traveller added later
//                             (postBooking) → Edit/Remove + Raise Manage Booking,
//                             UNTIL Manage Booking is approved and they're in
//                             Tour Bookings (ct.inRealBooking) → then only the
//                             "Added to booking" badge. Rejected → not in Tour
//                             Bookings → buttons visible again. Same for ADMIN
//                             and USER bookings. */}
//                         {(!booking.tnr || ct.postBooking) && !ct.inRealBooking && (
//                           <div className="flex flex-wrap items-center gap-2">
//                             <button
//                               onClick={() => startEdit(ct)}
//                               className="flex items-center gap-1 px-2.5 py-1 bg-white border border-[#DCB86D] hover:bg-[#F5E6C8] text-[#8C6220] rounded-lg text-xs font-semibold transition-colors"
//                             >
//                               <Pencil className="w-3 h-3" /> Edit
//                             </button>
//                             <button
//                               onClick={() => handleDeleteTraveller(ct, false)}
//                               disabled={deletingId === ct._id}
//                               className="flex items-center gap-1 px-2.5 py-1 bg-white border border-[#D99999] hover:bg-[#FBEEEE] text-[#A33333] rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
//                             >
//                               <Trash2 className="w-3 h-3" /> {deletingId === ct._id ? "Removing..." : "Remove"}
//                             </button>
//                             {booking.tnr && ct.postBooking && (
//                               <button
//                                 onClick={() => handleRaiseManageBooking(ct)}
//                                 className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B07D2B] hover:bg-[#8C6220] text-white rounded-lg text-xs font-bold transition-colors"
//                               >
//                                 Raise Manage Booking <ArrowRight className="w-3.5 h-3.5" />
//                               </button>
//                             )}
//                           </div>
//                         )}
//                         {booking.tnr && ct.postBooking && ct.inRealBooking && (
//                           <span className="inline-flex w-fit items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EDF6F1] border border-[#B6DFC8] text-[#235F47] text-xs font-bold">
//                             <CheckCircle2 className="w-3.5 h-3.5" /> Added to booking
//                           </span>
//                         )}
//                       </div>
//                       {booking.tnr && ct._id && !ct.url && uploadUserTravellerAadhaar &&
//                         ct.cancelStatus !== "cancelled" && ct.cancelStatus !== "rejected" && (
//                           <TravellerAadhaarRow
//                             traveller={{
//                               _id: ct._id,
//                               title: ct.title,
//                               firstName: ct.firstName,
//                               lastName: ct.lastName,
//                               age: ct.age,
//                               gender: ct.gender,
//                               isCoTraveller: true,
//                               hasAadhaar: false,
//                             }}
//                             tnr={booking.tnr}
//                             extractAadhaar={extractAadhaar}
//                             uploadUserTravellerAadhaar={uploadUserTravellerAadhaar}
//                             onSaved={refresh}
//                           />
//                         )}
//                     </React.Fragment>
//                   );
//                 })}
//               </div>
//             )}

//             {/* Add co-traveller — OCR first, verify, then save. */}
//             <div className="p-4 sm:p-5 rounded-xl border-2 border-dashed border-[#DCB86D] bg-[#FBF4E7]/30">
//               <p className="text-xs font-bold text-gray-600 mb-3">Add Co-Traveller (via Aadhaar)</p>
//               <div className="flex flex-wrap items-end gap-3">
//                 <div className="flex-1 min-w-[160px]">
//                   <label className="block text-xs font-semibold text-gray-600 mb-1.5">Aadhaar Front</label>
//                   <div className="flex items-center gap-2">
//                     <input
//                       ref={ctInputRef}
//                       type="file"
//                       accept="image/*,application/pdf"
//                       onChange={(e) => {
//                         setCtFile(e.target.files?.[0] || null);
//                         setCtDraft(null);
//                       }}
//                       className="flex-1 min-w-0 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#F5E6C8] file:text-[#8C6220] hover:file:bg-[#EAD29C]"
//                     />
//                     {(ctFile || ctDraft) && (
//                       <button
//                         type="button"
//                         onClick={clearCtFile}
//                         className="shrink-0 text-gray-400 hover:text-[#A33333]"
//                         title={ctDraft ? "Remove this Aadhaar and redo it" : "Clear chosen file"}
//                       >
//                         <XCircle className="w-4 h-4" />
//                       </button>
//                     )}
//                   </div>
//                 </div>
//                 <button
//                   onClick={handleExtractCt}
//                   disabled={ctExtracting || !ctFile || !!ctDraft}
//                   className="flex items-center gap-2 px-5 py-2.5 bg-[#B07D2B] hover:bg-[#8C6220] disabled:bg-[#C9CFD8] text-white rounded-xl font-bold text-sm transition-colors"
//                 >
//                   {ctExtracting ? (
//                     <>
//                       <Loader2 className="w-4 h-4 animate-spin" /> Reading...
//                     </>
//                   ) : (
//                     <>
//                       <Upload className="w-4 h-4" /> Extract Aadhaar
//                     </>
//                   )}
//                 </button>
//               </div>

//               {ctDraft && (
//                 <>
//                   <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
//                     <div>
//                       <label className="block text-xs font-medium text-gray-600">Title</label>
//                       <select
//                         value={ctDraft.title}
//                         onChange={(e) => updateCtDraft("title", e.target.value)}
//                         className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
//                       >
//                         <option>Mr</option>
//                         <option>Mrs</option>
//                         <option>Ms</option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-medium text-gray-600">First Name</label>
//                       <input
//                         type="text"
//                         value={ctDraft.firstName}
//                         onChange={(e) => updateCtDraft("firstName", e.target.value)}
//                         className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-medium text-gray-600">Last Name</label>
//                       <input
//                         type="text"
//                         value={ctDraft.lastName}
//                         onChange={(e) => updateCtDraft("lastName", e.target.value)}
//                         className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-medium text-gray-600">Age</label>
//                       <input
//                         type="number"
//                         value={ctDraft.age}
//                         onChange={(e) => updateCtDraft("age", e.target.value)}
//                         className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
//                       />
//                     </div>
//                   </div>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
//                     <div>
//                       <label className="block text-xs font-medium text-gray-600">Gender</label>
//                       <select
//                         value={ctDraft.gender}
//                         onChange={(e) => updateCtDraft("gender", e.target.value)}
//                         className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
//                       >
//                         <option>Male</option>
//                         <option>Female</option>
//                         <option>Other</option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-medium text-gray-600">Sharing Type</label>
//                       <select
//                         value={ctDraft.sharingType}
//                         onChange={(e) => updateCtDraft("sharingType", e.target.value)}
//                         className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
//                       >
//                         <option value="">Select Sharing</option>
//                         {Number(ctDraft.age) >= 11 ? (
//                           <>
//                             <option value="double">Double Sharing</option>
//                             <option value="triple">Triple Sharing</option>
//                           </>
//                         ) : Number(ctDraft.age) >= 6 && Number(ctDraft.age) <= 10 ? (
//                           <>
//                             <option value="withBerth">Child with Berth</option>
//                             <option value="withoutBerth">Child without Berth</option>
//                           </>
//                         ) : null}
//                       </select>
//                     </div>
//                   </div>
//                   {ctDraft.front?.ocrText && (
//                     <button
//                       type="button"
//                       onClick={() => setShowCtRawText((v) => !v)}
//                       className="mt-3 text-xs font-semibold text-gray-400 hover:text-gray-600"
//                     >
//                       {showCtRawText ? "Hide" : "Show"} raw text read
//                     </button>
//                   )}
//                   {showCtRawText && ctDraft.front?.ocrText && (
//                     <pre className="mt-2 p-3 bg-[#F7F8FA] border border-[#DEE2E8] rounded-lg text-[11px] text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
//                       {ctDraft.front.ocrText}
//                     </pre>
//                   )}
//                   <button
//                     onClick={handleAddCoTraveller}
//                     disabled={ctSaving}
//                     className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#B07D2B] hover:bg-[#8C6220] disabled:bg-[#C9CFD8] text-white rounded-xl font-bold text-sm transition-colors"
//                   >
//                     {ctSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
//                     Add Co-Traveller
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Payments */}
//           <div>
//             <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
//               <h4 className="flex items-center gap-2 font-bold text-gray-800 text-sm">
//                 <IndianRupee className="w-4 h-4 text-[#2E7D5E]" /> Payment Screenshots
//               </h4>
//               {booking.paymentSummary && (
//                 booking.paymentSummary.fullyPaid ? (
//                   <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#235F47] bg-[#EDF6F1] border-2 border-dashed border-[#2E7D5E] rounded-full px-3.5 py-1 -rotate-2 shadow-sm">
//                     <CheckCircle2 className="w-3.5 h-3.5" /> Balance Fully Paid
//                   </span>
//                 ) : (
//                   <span className="flex items-center gap-1.5 text-xs font-semibold text-[#93501A] bg-[#FBF1E6] border border-[#E8C89A] rounded-full px-3 py-1">
//                     Balance Due: ₹{booking.paymentSummary.balanceRemaining.toLocaleString("en-IN")}
//                     <span className="font-normal text-[#B8641F]">
//                       (of ₹{booking.paymentSummary.packageAmount.toLocaleString("en-IN")})
//                     </span>
//                   </span>
//                 )
//               )}
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//               {PAYMENT_TYPES.map(({ type, label }) => {
//                 const items = booking.payments[type] || [];
//                 return (
//                   <PaymentSlot
//                     key={type}
//                     groupId={booking.groupId}
//                     tnr={booking.tnr}
//                     type={type}
//                     label={label}
//                     items={items}
//                     uploadGroupPayment={uploadGroupPayment}
//                     deleteGroupPayment={deleteGroupPayment}
//                     refresh={refresh}
//                   />
//                 );
//               })}
//             </div>
//           </div>

//           {/* Create Booking / link TNR */}
//           {!booking.tnr && (
//             <div className="pt-2 border-t border-[#E7EAEF]">
//               <button
//                 onClick={onCreateBooking}
//                 className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[#1F3F6E] to-[#2A5490] hover:from-[#17314F] hover:to-[#1F3F6E] text-white rounded-xl font-bold text-sm shadow-sm transition-all"
//               >
//                 Create Booking <ArrowRight className="w-4 h-4" />
//               </button>
//               <p className="text-center text-[11px] text-gray-400 mt-2">
//                 TNR links automatically once the booking is created — hit Refresh above after creating it.
//               </p>

//               {!showTnrInput ? (
//                 <button
//                   onClick={() => setShowTnrInput(true)}
//                   className="w-full text-center text-xs font-semibold text-gray-400 hover:text-[#2A5490] mt-1"
//                 >
//                   Didn't auto-link? Paste the TNR manually
//                 </button>
//               ) : (
//                 <div className="flex gap-2 mt-3">
//                   <input
//                     type="text"
//                     value={tnrInput}
//                     onChange={(e) => setTnrInput(e.target.value)}
//                     placeholder="e.g. EP69TQ"
//                     className="flex-1 px-3.5 py-2.5 bg-white border border-[#DEE2E8] rounded-xl text-sm uppercase focus:border-[#5C84B3] focus:ring-4 focus:ring-[#DCE6F2] outline-none transition-all"
//                   />
//                   <button
//                     onClick={handleLinkTnr}
//                     disabled={linkingTnr}
//                     className="flex items-center gap-1.5 px-4 py-2.5 bg-[#2A5490] hover:bg-[#1F3F6E] disabled:bg-[#C9CFD8] text-white rounded-xl font-bold text-sm transition-colors"
//                   >
//                     {linkingTnr ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
//                     Link
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// const AllBookingsTab = ({ getAadhaarBookings, extractAadhaar, addCoTravellerApi, uploadGroupPayment, deleteGroupPayment, uploadUserTravellerAadhaar, linkGroupTnr, editAadhaarTraveller, deleteAadhaarTraveller, linkGuestTnr, unlinkGuestTnr, deleteBookingByTnr, navigate, tourId, tourTitle }) => {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [expanded, setExpanded] = useState({});
//   const [downloadingAllZip, setDownloadingAllZip] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");

//   const fetchBookings = async () => {
//     setLoading(true);
//     try {
//       const result = await getAadhaarBookings();
//       if (result?.success) setBookings(result.bookings || []);
//     } catch (err) {
//       console.error("getAadhaarBookings error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchBookings();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [tourId]);

//   const toggleExpand = (groupId) => setExpanded((prev) => ({ ...prev, [groupId]: !prev[groupId] }));

//   const handleCreateBooking = (booking) => {
//     const mainT = booking.main;
//     const finalTravellers = [
//       {
//         title: mainT?.title,
//         firstName: mainT?.firstName,
//         lastName: mainT?.lastName,
//         age: mainT?.age,
//         gender: mainT?.gender,
//         sharingType: mainT?.sharingType,
//         isCoTraveller: false,
//         phone: mainT?.phone,
//         address: mainT?.address,
//         _aadhaar: { front: mainT?.front || null, back: mainT?.back || null },
//       },
//       ...(booking.coTravellers || []).map((ct) => ({
//         title: ct.title,
//         firstName: ct.firstName,
//         lastName: ct.lastName,
//         age: ct.age,
//         gender: ct.gender,
//         sharingType: ct.sharingType,
//         isCoTraveller: true,
//         phone: ct.phone,
//         address: ct.address,
//         _aadhaar: { front: { url: ct.url }, back: null },
//       })),
//     ];

//     navigate("/creat-bookings", {
//       state: {
//         tourId: booking.tourId,
//         travellers: finalTravellers,
//         paymentScreenshots: booking.payments?.advance?.length
//           ? {
//             advance: {
//               url: booking.payments.advance[booking.payments.advance.length - 1].url,
//               amount: booking.payments.advance[booking.payments.advance.length - 1].amount,
//             },
//           }
//           : {},
//         contactMobile: mainT?.phone || "",
//         contactAddress: mainT?.address || "",
//         contactAddressLine1: mainT?.addressLine1 || "",
//         contactAddressLine2: mainT?.addressLine2 || "",
//         contactCity: mainT?.city || "",
//         contactState: mainT?.state || "",
//         contactPincode: mainT?.pincode || "",
//         groupId: booking.groupId,
//         bookingNotes: booking.bookingNotes || null,
//       },
//     });
//   };

//   const visibleBookings = tourId
//     ? bookings.filter((b) => String(b.tourId || "") === String(tourId))
//     : bookings;

//   const bookingMatchesSearch = (b, q) => {
//     const names = [b.main, ...(b.coTravellers || [])]
//       .map((t) => [t?.title, t?.firstName, t?.lastName].filter(Boolean).join(" "))
//       .join(" ");
//     const haystack = [names, b.tnr, b.main?.phone, b.main?.aadhaarNumber].filter(Boolean).join(" ").toLowerCase();
//     return haystack.includes(q);
//   };
//   const searchedBookings = (() => {
//     const q = searchQuery.trim().toLowerCase();
//     if (!q) return visibleBookings;
//     return visibleBookings.filter((b) => bookingMatchesSearch(b, q));
//   })();

//   const tourZipSafeName = (name) =>
//     (name || "file").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "file";
//   const tourZipExtFromUrl = (url) => {
//     const match = url.split("?")[0].match(/\.([a-zA-Z0-9]+)$/);
//     return match ? match[1] : "jpg";
//   };
//   // Whole-tour Aadhaar ZIP — flat, booking name/tnr baked into each filename.
//   const handleDownloadAllZip = async () => {
//     if (visibleBookings.length === 0) {
//       toast.error("No bookings to download for this tour");
//       return;
//     }
//     setDownloadingAllZip(true);
//     try {
//       const zip = new JSZip();
//       let fetchedCount = 0;
//       let totalCount = 0;

//       await Promise.all(
//         visibleBookings.map(async (booking, bIdx) => {
//           const mainName = [booking.main?.title, booking.main?.firstName, booking.main?.lastName]
//             .filter(Boolean)
//             .join(" ") || `Booking ${bIdx + 1}`;
//           const bookingPrefix = `${bIdx + 1}. ${tourZipSafeName(mainName)}${booking.tnr ? `_${booking.tnr}` : ""}`;

//           const entries = [];
//           if (booking.main?.front?.url) {
//             entries.push({ name: `${bookingPrefix} - Main - ${mainName} - Front`, url: booking.main.front.url });
//           }
//           if (booking.main?.back?.url) {
//             entries.push({ name: `${bookingPrefix} - Main - ${mainName} - Back`, url: booking.main.back.url });
//           }
//           (booking.coTravellers || []).forEach((ct, i) => {
//             const ctName = [ct.title, ct.firstName, ct.lastName].filter(Boolean).join(" ") || `Co-Traveller ${i + 1}`;
//             if (ct.url) {
//               entries.push({ name: `${bookingPrefix} - Co-Traveller ${i + 1} - ${ctName} - Front`, url: ct.url });
//             }
//             if (ct.back?.url) {
//               entries.push({ name: `${bookingPrefix} - Co-Traveller ${i + 1} - ${ctName} - Back`, url: ct.back.url });
//             }
//           });

//           totalCount += entries.length;

//           await Promise.all(
//             entries.map(async (entry) => {
//               try {
//                 const res = await fetch(entry.url);
//                 if (!res.ok) throw new Error(`HTTP ${res.status}`);
//                 const blob = await res.blob();
//                 zip.file(`${tourZipSafeName(entry.name)}.${tourZipExtFromUrl(entry.url)}`, blob);
//                 fetchedCount += 1;
//               } catch (err) {
//                 console.error(`[DownloadAllZip] Could not fetch "${entry.name}" (${entry.url}):`, err);
//               }
//             }),
//           );
//         }),
//       );

//       if (fetchedCount === 0) {
//         toast.error("Could not download any Aadhaar images for this tour");
//         return;
//       }

//       const zipBlob = await zip.generateAsync({ type: "blob" });
//       const link = document.createElement("a");
//       link.href = URL.createObjectURL(zipBlob);
//       link.download = `${tourZipSafeName(tourTitle || "Tour")}_All_Aadhaar.zip`;
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       URL.revokeObjectURL(link.href);
//       toast.success(
//         fetchedCount < totalCount
//           ? `Downloaded ${fetchedCount}/${totalCount} Aadhaar images (some failed — check console)`
//           : `Downloaded all Aadhaar images for ${visibleBookings.length} booking${visibleBookings.length !== 1 ? "s" : ""}`,
//       );
//     } catch (error) {
//       console.error("[DownloadAllZip] error:", error);
//       toast.error("Could not build the tour's Aadhaar ZIP");
//     } finally {
//       setDownloadingAllZip(false);
//     }
//   };

//   // Deletes Aadhaar FILES (never extracted data) for every booking in this
//   // tour — main traveller's aadhaarDocId clears the whole booking.
//   const [deletingAllAadhaar, setDeletingAllAadhaar] = useState(false);
//   const handleDeleteAllAadhaar = async () => {
//     const mainDocIds = visibleBookings.map((b) => b.main?.aadhaarDocId).filter(Boolean);
//     if (mainDocIds.length === 0) {
//       toast.error("No bookings with Aadhaar to delete for this tour");
//       return;
//     }
//     if (
//       !window.confirm(
//         `Delete the Aadhaar FILES for ALL ${mainDocIds.length} booking(s) in this tour? Extracted details (Name/Age/Gender/Address/Aadhaar Number) are kept — only the uploaded files are removed from storage. This cannot be undone.`,
//       )
//     ) {
//       return;
//     }
//     setDeletingAllAadhaar(true);
//     try {
//       let okCount = 0;
//       for (const docId of mainDocIds) {
//         try {
//           const result = await deleteAadhaarTraveller(docId);
//           if (result?.success) okCount += 1;
//         } catch (err) {
//           console.error(`handleDeleteAllAadhaar: failed for docId ${docId}:`, err);
//         }
//       }
//       toast.success(
//         okCount === mainDocIds.length
//           ? "Aadhaar files deleted for all bookings"
//           : `Aadhaar files deleted for ${okCount}/${mainDocIds.length} booking(s) — check console for the rest`,
//       );
//       fetchBookings();
//     } finally {
//       setDeletingAllAadhaar(false);
//     }
//   };

//   return (
//     <div className="mb-8">
//       <div className="mb-5 pb-4 border-b-2 border-dashed border-[#DEE2E8] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
//         <div className="flex items-center justify-between lg:justify-start gap-2.5 min-w-0 lg:flex-1">
//           <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full bg-gradient-to-br from-indigo-600 to-sky-500 text-white text-sm font-bold font-mono shadow-sm shadow-indigo-200 shrink-0">
//             {visibleBookings.length}
//           </span>
//           <p className="text-sm text-[#1C2733] min-w-0 lg:truncate">
//             booking{visibleBookings.length !== 1 ? "s" : ""}
//             {tourTitle ? <span className="text-gray-500"> for {tourTitle}</span> : ""}
//           </p>
//           <button
//             onClick={fetchBookings}
//             title="Refresh"
//             className="lg:hidden shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-[#DEE2E8] text-[#2A5490] hover:bg-[#EEF3FA] hover:border-[#C3D4E8] transition-colors"
//           >
//             <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
//           </button>
//         </div>
//         <div className="flex items-center gap-2 sm:gap-3">
//           <div className="flex flex-col sm:flex-row w-full lg:w-fit rounded-xl border border-gray-200 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 shadow-sm overflow-hidden">
//             <button
//               onClick={handleDeleteAllAadhaar}
//               disabled={deletingAllAadhaar || visibleBookings.length === 0}
//               title="Delete the uploaded Aadhaar files for EVERY booking in this tour (keeps the extracted Name/Age/Gender/Address/Aadhaar Number — does not delete any booking)"
//               className="sm:flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 lg:py-2 bg-white text-red-600 text-xs font-semibold hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               {deletingAllAadhaar ? <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 shrink-0" />}
//               <span className="whitespace-nowrap">{deletingAllAadhaar ? "Deleting..." : "Delete All Aadhaar"}</span>
//             </button>
//             <button
//               onClick={handleDownloadAllZip}
//               disabled={downloadingAllZip || visibleBookings.length === 0}
//               title="Download Aadhaar images of every booking in this tour as one ZIP"
//               className="sm:flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 lg:py-2 bg-white text-[#1F3F6E] text-xs font-semibold hover:bg-[#EEF3FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               {downloadingAllZip ? <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" /> : <Download className="w-3.5 h-3.5 shrink-0" />}
//               <span className="whitespace-nowrap">{downloadingAllZip ? "Zipping..." : "Download All (Tour) ZIP"}</span>
//             </button>
//           </div>
//           <button
//             onClick={fetchBookings}
//             title="Refresh"
//             className="hidden lg:flex shrink-0 items-center justify-center w-8 h-8 rounded-full border border-[#DEE2E8] text-[#2A5490] hover:bg-[#EEF3FA] hover:border-[#C3D4E8] transition-colors"
//           >
//             <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
//           </button>
//         </div>
//       </div>

//       <div className="relative mb-5">
//         <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//         <input
//           type="text"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           placeholder="Filter by name, mobile, TNR or Aadhaar number (optional)"
//           className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
//         />
//         {searchQuery && (
//           <button
//             type="button"
//             onClick={() => setSearchQuery("")}
//             className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//             title="Clear"
//           >
//             <XCircle className="w-4 h-4" />
//           </button>
//         )}
//       </div>

//       {loading ? (
//         <div className="flex items-center justify-center py-16 text-gray-400">
//           <Loader2 className="w-6 h-6 animate-spin" />
//         </div>
//       ) : visibleBookings.length === 0 ? (
//         <div className="text-center py-16 text-gray-400 text-sm rounded-2xl border-2 border-dashed border-[#DEE2E8]">No bookings saved for this tour yet.</div>
//       ) : searchedBookings.length === 0 ? (
//         <div className="text-center py-16 text-gray-400 text-sm rounded-2xl border-2 border-dashed border-[#DEE2E8]">No booking matches "{searchQuery}".</div>
//       ) : (
//         <div className="space-y-4">
//           {searchedBookings.map((booking) => (
//             <BookingCard
//               key={booking.groupId}
//               booking={booking}
//               expanded={!!expanded[booking.groupId]}
//               onToggle={() => toggleExpand(booking.groupId)}
//               extractAadhaar={extractAadhaar}
//               addCoTravellerApi={addCoTravellerApi}
//               uploadGroupPayment={uploadGroupPayment}
//               deleteGroupPayment={deleteGroupPayment}
//               uploadUserTravellerAadhaar={uploadUserTravellerAadhaar}
//               linkGroupTnr={linkGroupTnr}
//               editAadhaarTraveller={editAadhaarTraveller}
//               deleteAadhaarTraveller={deleteAadhaarTraveller}
//               linkGuestTnr={linkGuestTnr}
//               unlinkGuestTnr={unlinkGuestTnr}
//               deleteBookingByTnr={deleteBookingByTnr}
//               allBookings={visibleBookings}
//               onCreateBooking={() => handleCreateBooking(booking)}
//               navigate={navigate}
//               refresh={fetchBookings}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// const AadhaarUpload = () => {
//   const navigate = useNavigate();
//   const {
//     tourList,
//     getTourList,
//     extractAadhaar,
//     uploadPaymentScreenshot,
//     saveAadhaarUpload,
//     getAadhaarBookings,
//     addCoTraveller: addCoTravellerApi,
//     uploadGroupPayment,
//     deleteGroupPayment,
//     linkGroupTnr,
//     editAadhaarTraveller,
//     deleteAadhaarTraveller,
//     linkGuestTnr,
//     unlinkGuestTnr,
//     getAllStaff,
//     staffList,
//     searchUserBookings,
//     uploadUserTravellerAadhaar,
//     uploadUserBookingPayment,
//     deleteBookingByTnr,
//   } = useContext(TourContext);

//   const [saving, setSaving] = useState(false);
//   const savingRef = useRef(false); // synchronous double-click guard

//   // "save" = new walk-in booking, "all" = All Bookings, "user" = User Bookings.
//   const [activeTab, setActiveTab] = useState("save");

//   const [tourId, setTourId] = useState("");
//   const [tourInfo, setTourInfo] = useState(null);

//   const [packageSelection, setPackageSelection] = useState({ type: "main", variantIndex: null });
//   const [boardingPoint, setBoardingPoint] = useState(null);
//   const [deboardingPoint, setDeboardingPoint] = useState(null);
//   const [selectedAddons, setSelectedAddons] = useState([]);
//   const [remarks, setRemarks] = useState("");
//   const [raisedByStaffId, setRaisedByStaffId] = useState("");

//   const [travellers, setTravellers] = useState([blankTraveller(true)]);

//   const [paymentScreenshots, setPaymentScreenshots] = useState({});
//   const [paymentLoading, setPaymentLoading] = useState({});
//   const paymentUploadingRef = useRef({});
//   const [paymentFiles, setPaymentFiles] = useState({});
//   const [paymentAmounts, setPaymentAmounts] = useState({});
//   const [paymentRemarks, setPaymentRemarks] = useState({});
//   const [paymentViewerIndex, setPaymentViewerIndex] = useState({});

//   useEffect(() => {
//     if (!tourList || tourList.length === 0) getTourList();
//   }, [tourList, getTourList]);

//   useEffect(() => {
//     if (!staffList || staffList.length === 0) getAllStaff();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     if (!tourId || !tourList?.length) {
//       setTourInfo(null);
//       return;
//     }
//     setTourInfo(tourList.find((t) => t._id === tourId) || null);
//   }, [tourId, tourList]);

//   useEffect(() => {
//     setPackageSelection({ type: "main", variantIndex: null });
//     setBoardingPoint(null);
//     setDeboardingPoint(null);
//     setSelectedAddons([]);
//     setRemarks("");
//   }, [tourId]);

//   useEffect(() => {
//     setBoardingPoint(null);
//     setDeboardingPoint(null);
//     setSelectedAddons([]);
//   }, [packageSelection.type, packageSelection.variantIndex]);

//   const handleTravellerChange = (index, field, value) => {
//     const updated = [...travellers];
//     const t = { ...updated[index] };

//     if (field === "title") {
//       if (value === "Mr") t.gender = "Male";
//       else if (value === "Mrs" || value === "Ms") t.gender = "Female";
//     }
//     if (field === "gender") {
//       if (value === "Male") t.title = "Mr";
//       else if (value === "Female") t.title = "Mrs";
//     }
//     if (field === "age") {
//       const age = Number(value);
//       if (age > 85) {
//         toast.error("Age cannot exceed 85 years.");
//         return;
//       }
//       if (age >= 11) t.sharingType = "double";
//       else if (age >= 6 && age <= 10) t.sharingType = "withBerth";
//       else t.sharingType = "";
//     }

//     t[field] = value;

//     if (["addressLine1", "addressLine2", "city", "state", "pincode"].includes(field)) {
//       t.address = [t.addressLine1, t.addressLine2, t.city, t.state, t.pincode]
//         .filter(Boolean)
//         .join(", ");
//     }

//     updated[index] = t;
//     setTravellers(updated);
//   };

//   const addCoTraveller = () => {
//     setTravellers((prev) => [...prev, blankTraveller(false)]);
//   };

//   const removeCoTraveller = (index) => {
//     setTravellers((prev) => prev.filter((_, i) => i !== index));
//   };

//   const setTravellerFrontFile = (index, file) => {
//     const updated = [...travellers];
//     updated[index] = { ...updated[index], _frontFile: file };
//     setTravellers(updated);
//   };

//   const setTravellerBackFile = (index, file) => {
//     const updated = [...travellers];
//     updated[index] = { ...updated[index], _backFile: file };
//     setTravellers(updated);
//   };

//   const extractTravellerAadhaar = async (index) => {
//     const t = travellers[index];
//     if (!t._frontFile) return toast.error("Aadhaar front image is required");

//     handleTravellerChange(index, "ocrLoading", true);
//     try {
//       const formData = new FormData();
//       formData.append("front", t._frontFile);
//       if (t._backFile) formData.append("back", t._backFile);

//       const result = await extractAadhaar(formData);
//       if (!result?.success) {
//         handleTravellerChange(index, "ocrLoading", false);
//         return;
//       }

//       const p = result.parsed || {};
//       const readGender = p.gender || "Male";
//       const updated = [...travellers];
//       updated[index] = {
//         ...updated[index],
//         title: readGender === "Female" ? "Mrs" : "Mr",
//         firstName: p.firstName || "",
//         lastName: p.lastName || "",
//         age: p.age || "",
//         gender: readGender,
//         phone: p.phone || updated[index].phone || "",
//         address: p.address || updated[index].address || "",
//         addressLine1: p.addressLine1 || updated[index].addressLine1 || "",
//         addressLine2: p.addressLine2 || updated[index].addressLine2 || "",
//         city: p.city || updated[index].city || "",
//         state: p.state || updated[index].state || "",
//         pincode: p.pincode || updated[index].pincode || "",
//         front: result.front || null,
//         back: result.back || null,
//         ocrLoading: false,
//         _frontFile: null,
//         _backFile: null,
//       };
//       setTravellers(updated);
//       if (index === 0 && (!p.phone || !p.address)) {
//         toast.info(
//           `Traveller ${index + 1}'s Aadhaar read. ${!p.phone ? "Mobile number" : "Address"}${!p.phone && !p.address ? " & address" : ""} couldn't be read — please fill it in.`,
//         );
//       } else {
//         toast.success(`Traveller ${index + 1}'s Aadhaar read. Verify details below.`);
//       }
//     } catch (err) {
//       console.error("extractTravellerAadhaar error:", err);
//       handleTravellerChange(index, "ocrLoading", false);
//     }
//   };

//   const clearTravellerAadhaar = (index) => {
//     const updated = [...travellers];
//     updated[index] = {
//       ...updated[index],
//       title: "Mr",
//       firstName: "",
//       lastName: "",
//       age: "",
//       dob: "",
//       gender: "Male",
//       front: null,
//       back: null,
//       _frontFile: null,
//       _backFile: null,
//       ...(index !== 0 ? { phone: "", address: "" } : {}),
//     };
//     setTravellers(updated);
//     toast.info(`Traveller ${index + 1}'s Aadhaar cleared — upload the correct image and extract again.`);
//   };

//   // Only Advance is collected here.
//   const paymentSlots = [
//     { type: "advance", label: "Advance Payment", cardClass: "bg-indigo-50 border-indigo-200" },
//   ];

//   const handlePaymentUpload = async (type) => {
//     const queue = paymentFiles[type] || [];
//     const amounts = paymentAmounts[type] || [];
//     const remarksQueue = paymentRemarks[type] || [];
//     if (queue.length === 0) return toast.error(`Select at least one ${type} screenshot first`);
//     for (let i = 0; i < amounts.length; i++) {
//       if (amounts[i] && Number(amounts[i]) <= 0) {
//         return toast.error(`Amount for "${queue[i]?.name}", if entered, must be a positive number`);
//       }
//     }
//     if (paymentUploadingRef.current[type]) return;
//     paymentUploadingRef.current[type] = true;

//     let successCount = 0;
//     for (let i = 0; i < queue.length; i++) {
//       setPaymentLoading((prev) => ({ ...prev, [type]: { current: i + 1, total: queue.length } }));
//       try {
//         const formData = new FormData();
//         formData.append("screenshot", queue[i]);
//         formData.append("type", type);
//         if (amounts[i]) formData.append("amount", amounts[i]);
//         const result = await uploadPaymentScreenshot(formData);
//         if (result?.success) {
//           successCount += 1;
//           setPaymentScreenshots((prev) => ({
//             ...prev,
//             [type]: [
//               ...(prev[type] || []),
//               { url: result.url, amount: result.amount, remarks: (remarksQueue[i] || "").trim() },
//             ],
//           }));
//         }
//       } catch (err) {
//         console.error("handlePaymentUpload error:", err);
//       }
//     }
//     setPaymentLoading((prev) => ({ ...prev, [type]: false }));
//     setPaymentFiles((prev) => ({ ...prev, [type]: [] }));
//     setPaymentAmounts((prev) => ({ ...prev, [type]: [] }));
//     setPaymentRemarks((prev) => ({ ...prev, [type]: [] }));
//     paymentUploadingRef.current[type] = false;
//     if (successCount > 0) {
//       toast.success(`${successCount} ${type} screenshot${successCount > 1 ? "s" : ""} uploaded`);
//     }
//     if (successCount < queue.length) {
//       toast.error(`${queue.length - successCount} ${type} screenshot(s) failed to upload`);
//     }
//   };

//   const handleSaveBooking = async () => {
//     // The ONE hard requirement: at least one Advance Payment screenshot.
//     if (!(paymentScreenshots.advance || []).length) {
//       return toast.error("Attach the Advance Payment screenshot before creating this booking");
//     }
//     if (savingRef.current) return;
//     savingRef.current = true;
//     const mainTraveller = travellers[0];

//     const coTravellerRows = travellers.slice(1);

//     const packageTypeStr =
//       packageSelection.type === "main"
//         ? "Main Package"
//         : `Variant ${packageSelection.variantIndex + 1}`;
//     const boardingPointStr = boardingPoint
//       ? `${boardingPoint.stationCode} - ${boardingPoint.stationName}`
//       : "";
//     const deboardingPointStr = deboardingPoint
//       ? `${deboardingPoint.stationCode} - ${deboardingPoint.stationName}`
//       : "";
//     const addonsStr = selectedAddons.map((a) => a.name).join(", ");
//     const raisedByStaff = (staffList || []).find((s) => s._id === raisedByStaffId);
//     const addonsDetail = selectedAddons.map((a) => ({
//       label: a.trainName
//         ? `${a.trainName} (${a.trainNo})${a.tripType ? ` - ${a.tripType}` : ""}`
//         : a.flightNo
//           ? `${a.airline || "Flight"} ${a.flightNo}${a.tripType ? ` - ${a.tripType}` : ""}`
//           : "",
//       name: a.name,
//       amount: a.amount || 0,
//     }));

//     setSaving(true);
//     try {
//       const result = await saveAadhaarUpload({
//         tourId,
//         packageType: packageTypeStr,
//         packageKind: packageSelection.type,
//         variantPackageIndex: packageSelection.type === "variant" ? packageSelection.variantIndex : null,
//         boardingPoint: boardingPointStr,
//         deboardingPoint: deboardingPointStr,
//         addons: addonsStr,
//         addonsDetail,
//         remarks: remarks.trim(),
//         raisedBy: {
//           name: raisedByStaff?.fullName || "",
//           employeeId: raisedByStaff?.employeeId || "",
//         },
//         traveller: {
//           title: mainTraveller.title,
//           firstName: mainTraveller.firstName,
//           lastName: mainTraveller.lastName,
//           age: mainTraveller.age,
//           dob: mainTraveller.dob,
//           gender: mainTraveller.gender,
//           sharingType: mainTraveller.sharingType,
//           phone: mainTraveller.phone,
//           address: mainTraveller.address,
//           addressLine1: mainTraveller.addressLine1,
//           addressLine2: mainTraveller.addressLine2,
//           city: mainTraveller.city,
//           state: mainTraveller.state,
//           pincode: mainTraveller.pincode,
//           front: mainTraveller.front,
//           back: mainTraveller.back,
//         },
//         coTravellers: coTravellerRows.map((t) => ({
//           title: t.title,
//           firstName: t.firstName,
//           lastName: t.lastName,
//           age: t.age,
//           dob: t.dob,
//           gender: t.gender,
//           sharingType: t.sharingType,
//           phone: t.phone,
//           address: t.address,
//           addressLine1: t.addressLine1,
//           addressLine2: t.addressLine2,
//           city: t.city,
//           state: t.state,
//           pincode: t.pincode,
//           front: t.front,
//         })),
//         advanceScreenshots: paymentScreenshots.advance || [],
//       });

//       if (!result?.success) return;

//       toast.success("Booking saved. Find it on the All Bookings page.");

//       setTourId("");
//       setTourInfo(null);
//       setTravellers([blankTraveller(true)]);
//       setPaymentScreenshots({});
//       setPaymentFiles({});
//       setPaymentAmounts({});
//       setPaymentRemarks({});
//     } catch (err) {
//       console.error("handleSaveBooking error:", err);
//       toast.error("Could not save this booking. Please try again.");
//     } finally {
//       savingRef.current = false;
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-slate-50 to-sky-50 py-4 px-2.5 sm:py-8 sm:px-4">
//       <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 rounded-full bg-indigo-300/30 blur-3xl" />
//       <div className="pointer-events-none absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-sky-300/30 blur-3xl" />
//       <div className="pointer-events-none absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-purple-200/30 blur-3xl" />

//       <div className="relative max-w-5xl mx-auto bg-white/90 backdrop-blur-sm shadow-2xl shadow-indigo-200/50 rounded-2xl sm:rounded-[2rem] border border-white ring-1 ring-indigo-100 overflow-hidden">
//         <div className="h-1.5 sm:h-2 bg-gradient-to-r from-indigo-600 via-violet-500 to-sky-500" />

//         <div className="p-3.5 sm:p-6 md:p-8">
//           <ToastContainer position="top-right" autoClose={4000} />

//           <div className="flex items-center gap-3 sm:gap-4 border-b border-gray-100 pb-4 sm:pb-6 mb-4 sm:mb-6">
//             <div className="relative shrink-0">
//               <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 blur-md opacity-40" />
//               <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-indigo-300/60 ring-2 ring-white">
//                 <UserPlus className="w-5.5 h-5.5 sm:w-7 sm:h-7" />
//               </div>
//             </div>
//             <div className="min-w-0">
//               <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight truncate bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
//                 Aadhaar Upload
//               </h1>
//               <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Walk-in bookings, read straight off the Aadhaar card</p>
//             </div>
//           </div>

//           <div className="mb-5 sm:mb-6">
//             <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
//               <MapPin className="w-4 h-4 text-indigo-500" /> Select Tour *
//             </label>
//             <div className="relative">
//               <select
//                 value={tourId}
//                 onChange={(e) => setTourId(e.target.value)}
//                 className="w-full appearance-none pl-3.5 sm:pl-4 pr-10 sm:pr-11 py-3 sm:py-3.5 bg-gradient-to-br from-indigo-50/70 to-white border-2 border-indigo-100 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm sm:text-base font-semibold text-gray-800 truncate transition-all cursor-pointer"
//               >
//                 <option value="">-- Select a tour --</option>
//                 {tourList?.map((t) => (
//                   <option key={t._id} value={t._id}>
//                     {t.title}
//                   </option>
//                 ))}
//               </select>
//               <ChevronDown className="pointer-events-none absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-indigo-400" />
//             </div>
//           </div>

//           <div className="grid grid-cols-3 sm:flex sm:flex-row gap-1.5 sm:gap-2 p-1.5 bg-gradient-to-br from-gray-100 to-indigo-50/60 rounded-2xl mb-6 sm:mb-8 w-full sm:w-fit ring-1 ring-black/5">
//             <button
//               onClick={() => setActiveTab("save")}
//               className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-5 py-2.5 rounded-xl font-bold text-[11px] sm:text-sm leading-tight text-center transition-all sm:flex-none ${activeTab === "save"
//                 ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-300/60"
//                 : "text-gray-500 hover:text-indigo-600 hover:bg-white/60"
//                 }`}
//             >
//               <UserPlus className="w-[18px] h-[18px] sm:w-4 sm:h-4 shrink-0" /> <span>Save Booking</span>
//             </button>
//             <button
//               onClick={() => setActiveTab("all")}
//               className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-5 py-2.5 rounded-xl font-bold text-[11px] sm:text-sm leading-tight text-center transition-all sm:flex-none ${activeTab === "all"
//                 ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-300/60"
//                 : "text-gray-500 hover:text-indigo-600 hover:bg-white/60"
//                 }`}
//             >
//               <BookOpenCheck className="w-[18px] h-[18px] sm:w-4 sm:h-4 shrink-0" /> <span>All Bookings</span>
//             </button>
//             <button
//               onClick={() => setActiveTab("user")}
//               className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-5 py-2.5 rounded-xl font-bold text-[11px] sm:text-sm leading-tight text-center transition-all sm:flex-none ${activeTab === "user"
//                 ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-300/60"
//                 : "text-gray-500 hover:text-indigo-600 hover:bg-white/60"
//                 }`}
//             >
//               <Search className="w-[18px] h-[18px] sm:w-4 sm:h-4 shrink-0" /> <span>User Bookings</span>
//             </button>
//           </div>

//           {!tourId && (
//             <div className="text-center py-16 text-gray-400 text-sm">Select a tour above to continue.</div>
//           )}

//           {tourId && activeTab === "all" && (
//             <AllBookingsTab
//               getAadhaarBookings={getAadhaarBookings}
//               extractAadhaar={extractAadhaar}
//               addCoTravellerApi={addCoTravellerApi}
//               uploadGroupPayment={uploadGroupPayment}
//               deleteGroupPayment={deleteGroupPayment}
//               uploadUserTravellerAadhaar={uploadUserTravellerAadhaar}
//               linkGroupTnr={linkGroupTnr}
//               editAadhaarTraveller={editAadhaarTraveller}
//               deleteAadhaarTraveller={deleteAadhaarTraveller}
//               linkGuestTnr={linkGuestTnr}
//               unlinkGuestTnr={unlinkGuestTnr}
//               deleteBookingByTnr={deleteBookingByTnr}
//               navigate={navigate}
//               tourId={tourId}
//               tourTitle={tourInfo?.title}
//             />
//           )}

//           {tourId && activeTab === "user" && (
//             <UserBookingsTab
//               tourId={tourId}
//               searchUserBookings={searchUserBookings}
//               uploadUserTravellerAadhaar={uploadUserTravellerAadhaar}
//               uploadUserBookingPayment={uploadUserBookingPayment}
//               deleteGroupPayment={deleteGroupPayment}
//               extractAadhaar={extractAadhaar}
//             />
//           )}

//           {tourId && activeTab === "save" && (
//             <>
//               {tourInfo && (
//                 <>
//                   <BookingWideSection
//                     tourInfo={tourInfo}
//                     packageSelection={packageSelection}
//                     setPackageSelection={setPackageSelection}
//                     boardingPoint={boardingPoint}
//                     setBoardingPoint={setBoardingPoint}
//                     deboardingPoint={deboardingPoint}
//                     setDeboardingPoint={setDeboardingPoint}
//                     selectedAddons={selectedAddons}
//                     setSelectedAddons={setSelectedAddons}
//                     remarks={remarks}
//                     setRemarks={setRemarks}
//                     staffList={staffList}
//                     raisedByStaffId={raisedByStaffId}
//                     setRaisedByStaffId={setRaisedByStaffId}
//                   />

//                   <TravellerCard
//                     traveller={travellers[0]}
//                     index={0}
//                     isMain={true}
//                     setTravellerFrontFile={setTravellerFrontFile}
//                     setTravellerBackFile={setTravellerBackFile}
//                     extractTravellerAadhaar={extractTravellerAadhaar}
//                     clearTravellerAadhaar={clearTravellerAadhaar}
//                     handleTravellerChange={handleTravellerChange}
//                   />

//                   {travellers.slice(1).map((t, i) => (
//                     <TravellerCard
//                       key={i + 1}
//                       traveller={t}
//                       index={i + 1}
//                       isMain={false}
//                       removeCoTraveller={removeCoTraveller}
//                       setTravellerFrontFile={setTravellerFrontFile}
//                       setTravellerBackFile={setTravellerBackFile}
//                       extractTravellerAadhaar={extractTravellerAadhaar}
//                       clearTravellerAadhaar={clearTravellerAadhaar}
//                       handleTravellerChange={handleTravellerChange}
//                     />
//                   ))}

//                   <button
//                     onClick={addCoTraveller}
//                     className="w-full flex items-center justify-center gap-2 px-5 py-3 mb-8 border-2 border-dashed border-indigo-300 text-indigo-700 rounded-2xl font-semibold text-sm hover:bg-indigo-50 transition-all"
//                   >
//                     <PlusCircle className="w-4.5 h-4.5" />
//                     Add Co-Traveller
//                   </button>

//                   <div className="mb-8">
//                     <h3 className="flex items-center gap-2 font-bold text-gray-800 text-lg mb-4">
//                       <IndianRupee className="w-6 h-6 text-indigo-600" /> Advance Payment Screenshot <span className="text-red-500">*</span>
//                       <span className="text-xs font-normal text-gray-400">
//                         (required to create this booking — OCR tries to read the amount automatically, type it in only if OCR misses)
//                       </span>
//                     </h3>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       {paymentSlots.map(({ type, label, cardClass }) => {
//                         const uploaded = paymentScreenshots[type] || [];
//                         const queue = paymentFiles[type] || [];
//                         const amounts = paymentAmounts[type] || [];
//                         const remarksQueue = paymentRemarks[type] || [];
//                         const progress = paymentLoading[type];
//                         return (
//                           <div
//                             key={type}
//                             className={`min-w-0 w-full p-4 sm:p-5 rounded-2xl border shadow-sm ${uploaded.length > 0 ? "bg-green-50 border-green-300" : `${cardClass} border`}`}
//                           >
//                             <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-3">
//                               <FileImage className="w-5 h-5" /> {label}
//                             </h4>

//                             {uploaded.length > 0 && (
//                               <div className="flex flex-col gap-1 mb-3">
//                                 {uploaded.map((u, i) => (
//                                   <button
//                                     type="button"
//                                     key={i}
//                                     onClick={() =>
//                                       setPaymentViewerIndex((prev) => ({ ...prev, [type]: i }))
//                                     }
//                                     className="flex items-center gap-2 text-sm text-green-700 font-medium hover:underline text-left"
//                                   >
//                                     <CheckCircle2 className="w-4 h-4 shrink-0" /> #{i + 1}
//                                     {u.amount ? ` — ₹${u.amount}` : " — amount not entered"}
//                                     {u.remarks ? ` — ${u.remarks}` : ""}
//                                   </button>
//                                 ))}
//                               </div>
//                             )}
//                             <ScreenshotViewer
//                               items={uploaded}
//                               index={paymentViewerIndex[type] ?? null}
//                               onClose={() => setPaymentViewerIndex((prev) => ({ ...prev, [type]: null }))}
//                               onNav={(i) => setPaymentViewerIndex((prev) => ({ ...prev, [type]: i }))}
//                             />

//                             {queue.length > 0 && (
//                               <div className="flex flex-col gap-1.5 mb-2.5">
//                                 {queue.map((f, i) => (
//                                   <div key={i} className="flex flex-col gap-1.5 p-2 bg-white border border-gray-200 rounded-lg">
//                                     <div className="flex items-center gap-1.5">
//                                       <div className="flex-1 min-w-0 flex items-center gap-1.5 text-xs font-semibold text-gray-700 px-1 py-1">
//                                         <FileImage className="w-3.5 h-3.5 shrink-0 text-gray-400" />
//                                         <span className="truncate">{f.name}</span>
//                                       </div>
//                                       <button
//                                         type="button"
//                                         onClick={() => {
//                                           setPaymentFiles((prev) => ({
//                                             ...prev,
//                                             [type]: (prev[type] || []).filter((_, idx) => idx !== i),
//                                           }));
//                                           setPaymentAmounts((prev) => ({
//                                             ...prev,
//                                             [type]: (prev[type] || []).filter((_, idx) => idx !== i),
//                                           }));
//                                           setPaymentRemarks((prev) => ({
//                                             ...prev,
//                                             [type]: (prev[type] || []).filter((_, idx) => idx !== i),
//                                           }));
//                                         }}
//                                         disabled={!!progress}
//                                         title="Remove from queue"
//                                         className="shrink-0 p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 transition-colors"
//                                       >
//                                         <X className="w-3.5 h-3.5" />
//                                       </button>
//                                     </div>
//                                     <input
//                                       type="number"
//                                       placeholder="₹ (optional — OCR tries first)"
//                                       value={amounts[i] || ""}
//                                       onChange={(e) =>
//                                         setPaymentAmounts((prev) => ({
//                                           ...prev,
//                                           [type]: (prev[type] || []).map((a, idx) => (idx === i ? e.target.value : a)),
//                                         }))
//                                       }
//                                       disabled={!!progress}
//                                       className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
//                                     />
//                                     <input
//                                       type="text"
//                                       placeholder="Bank (e.g. SBI)"
//                                       value={remarksQueue[i] || ""}
//                                       onChange={(e) =>
//                                         setPaymentRemarks((prev) => ({
//                                           ...prev,
//                                           [type]: (prev[type] || []).map((r, idx) => (idx === i ? e.target.value : r)),
//                                         }))
//                                       }
//                                       disabled={!!progress}
//                                       className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
//                                     />
//                                   </div>
//                                 ))}
//                               </div>
//                             )}

//                             <label className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 bg-white border border-dashed border-gray-300 rounded-lg px-3 py-3 mb-2.5 cursor-pointer hover:border-indigo-400">
//                               <Upload className="w-3.5 h-3.5" />
//                               {queue.length > 0 ? "Add more screenshot(s)" : "Choose screenshot(s)"}
//                               <input
//                                 type="file"
//                                 accept="image/*,application/pdf"
//                                 multiple
//                                 className="hidden"
//                                 onChange={(e) => {
//                                   const files = Array.from(e.target.files || []);
//                                   if (!files.length) return;
//                                   setPaymentFiles((prev) => ({ ...prev, [type]: [...(prev[type] || []), ...files] }));
//                                   setPaymentAmounts((prev) => ({
//                                     ...prev,
//                                     [type]: [...(prev[type] || []), ...files.map(() => "")],
//                                   }));
//                                   setPaymentRemarks((prev) => ({
//                                     ...prev,
//                                     [type]: [...(prev[type] || []), ...files.map(() => "")],
//                                   }));
//                                   e.target.value = "";
//                                 }}
//                               />
//                             </label>

//                             {queue.length > 0 && (
//                               <button
//                                 onClick={() => handlePaymentUpload(type)}
//                                 disabled={!!progress}
//                                 className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-semibold transition-colors"
//                               >
//                                 {progress ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
//                                 {progress
//                                   ? `Uploading ${progress.current} of ${progress.total}...`
//                                   : `Upload ${queue.length > 1 ? `All (${queue.length})` : ""}`}
//                               </button>
//                             )}
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>

//                   <button
//                     onClick={handleSaveBooking}
//                     disabled={saving}
//                     className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-800 hover:to-indigo-700 disabled:opacity-60 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all"
//                   >
//                     {saving ? (
//                       <>
//                         <Loader2 className="w-5 h-5 animate-spin" /> Saving...
//                       </>
//                     ) : (
//                       <>
//                         Save Booking <ArrowRight className="w-5 h-5" />
//                       </>
//                     )}
//                   </button>
//                 </>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AadhaarUpload;

import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import JSZip from "jszip";
import { TourContext } from "../../context/TourContext";
import UserBookingsTab, { TravellerAadhaarRow } from "../../components/UserBookingsTab";
import {
  UserPlus,
  Upload,
  Loader2,
  CheckCircle2,
  Trash2,
  Pencil,
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
  Clock,
  IdCard,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Ticket,
  Link2,
  BookOpenCheck,
  RefreshCw,
  XCircle,
  Download,
  UserCheck,
  Search,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Click-to-copy TNR. stopPropagation so it never toggles the parent row.
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
      {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
    </button>
  );
};

// Three-state traveller cancellation badge (resolved by the backend).
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

// One-at-a-time payment screenshot viewer with Prev/Next.
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
          src={item.url}
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

// Match boarding/deboarding points by their own _id (stationCode isn't unique).
const getPointId = (point) => {
  if (!point) return "";
  const raw = point._id;
  if (raw && typeof raw === "object" && raw.$oid) return String(raw.$oid);
  return raw !== undefined && raw !== null ? String(raw) : "";
};

// Person-level fields only — package/boarding/addons/remarks are booking-wide.
const blankTraveller = (isMain) => ({
  title: "Mr",
  firstName: "",
  lastName: "",
  age: "",
  gender: "Male",
  sharingType: "",
  phone: "",
  address: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  isCoTraveller: !isMain,
  front: null,
  back: null,
  ocrLoading: false,
  _frontFile: null,
  _backFile: null,
  source: "aadhaar", // "aadhaar" | "manual"
});

// ───────────── Booking-wide section ─────────────
// Module scope (not inside AadhaarUpload) so inputs don't lose focus on
// every keystroke.
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
  staffList,
  raisedByStaffId,
  setRaisedByStaffId,
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
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
            <UserCheck className="w-3.5 h-3.5 text-sky-600" /> Raised By (who is saving this booking?) *
          </label>
          <select
            value={raisedByStaffId || ""}
            onChange={(e) => setRaisedByStaffId(e.target.value)}
            className="w-full mb-4 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none text-sm transition-all"
          >
            <option value="">Select your name</option>
            {(staffList || []).map((s) => (
              <option key={s._id} value={s._id}>
                {s.fullName}{s.employeeId ? ` (${s.employeeId})` : ""}
              </option>
            ))}
          </select>

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

// ───────────── Per-person traveller card ─────────────
const TravellerCard = ({
  traveller,
  index,
  isMain,
  removeCoTraveller,
  setTravellerFrontFile,
  setTravellerBackFile,
  extractTravellerAadhaar,
  clearTravellerAadhaar,
  handleTravellerChange,
}) => {
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);
  const [showRawText, setShowRawText] = useState(false);

  const clearChosenFront = () => {
    if (frontInputRef.current) frontInputRef.current.value = "";
    setTravellerFrontFile(index, null);
  };
  const clearChosenBack = () => {
    if (backInputRef.current) backInputRef.current.value = "";
    setTravellerBackFile(index, null);
  };

  // One cross mark for the whole lifecycle — clears the picker, and the
  // OCR'd result too if already extracted.
  const clearFront = () => {
    clearChosenFront();
    if (traveller.front) clearTravellerAadhaar(index);
  };
  const clearBack = () => {
    clearChosenBack();
    if (traveller.back) clearTravellerAadhaar(index);
  };

  return (
    <div
      className={`mb-6 rounded-2xl border shadow-sm overflow-hidden ${isMain ? "border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-indigo-50/50" : "border-purple-200 bg-gradient-to-br from-purple-50 via-white to-purple-50/50"
        }`}
    >
      <div
        className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b bg-white/60 ${isMain ? "border-indigo-200/70" : "border-purple-200/70"
          }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-sm ${isMain ? "bg-indigo-600" : "bg-purple-600"
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
        {traveller.source === "aadhaar" && (
          <div className="p-4 bg-white rounded-xl border border-dashed border-gray-300 mb-5">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Aadhaar Front {isMain ? "(required)" : ""}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={frontInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setTravellerFrontFile(index, e.target.files?.[0] || null)}
                    className="flex-1 min-w-0 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
                  />
                  {(traveller._frontFile || traveller.front) && (
                    <button
                      type="button"
                      onClick={clearFront}
                      className="shrink-0 text-gray-400 hover:text-red-600"
                      title={traveller.front ? "Remove this Aadhaar and redo it" : "Clear chosen file"}
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {isMain && (
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Aadhaar Back (optional)</label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={backInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setTravellerBackFile(index, e.target.files?.[0] || null)}
                      className="flex-1 min-w-0 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
                    />
                    {(traveller._backFile || traveller.back) && (
                      <button
                        type="button"
                        onClick={clearBack}
                        className="shrink-0 text-gray-400 hover:text-red-600"
                        title={traveller.back ? "Remove this Aadhaar and redo it" : "Clear chosen file"}
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
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
                {(traveller.front?.ocrText || traveller.back?.ocrText) && (
                  <button
                    type="button"
                    onClick={() => setShowRawText((v) => !v)}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-600"
                  >
                    {showRawText ? "Hide" : "Show"} raw text read
                  </button>
                )}
              </div>
            )}
            {showRawText && traveller.front?.ocrText && (
              <div className="mt-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Front</p>
                <pre className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {traveller.front.ocrText}
                </pre>
              </div>
            )}
            {showRawText && traveller.back?.ocrText && (
              <div className="mt-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Back (address comes from here)</p>
                <pre className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {traveller.back.ocrText}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

        {/* Mobile / Address — main traveller only. */}
        {isMain && (
          <div className="space-y-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={traveller.addressLine1}
                  onChange={(e) => handleTravellerChange(index, "addressLine1", e.target.value)}
                  placeholder="Address Line 1"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
                />
                <input
                  type="text"
                  value={traveller.addressLine2}
                  onChange={(e) => handleTravellerChange(index, "addressLine2", e.target.value)}
                  placeholder="Address Line 2"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
                />
                <input
                  type="text"
                  value={traveller.city}
                  onChange={(e) => handleTravellerChange(index, "city", e.target.value)}
                  placeholder="City"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
                />
                <input
                  type="text"
                  value={traveller.state}
                  onChange={(e) => handleTravellerChange(index, "state", e.target.value)}
                  placeholder="State"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
                />
                <input
                  type="text"
                  value={traveller.pincode}
                  onChange={(e) => handleTravellerChange(index, "pincode", e.target.value)}
                  placeholder="Pincode"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
                />
                <input
                  type="text"
                  value="India"
                  readOnly
                  disabled
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ───────────── All Bookings tab ─────────────
const PAYMENT_TYPES = [
  { type: "advance", label: "Advance" },
  { type: "balance", label: "Balance" },
  { type: "partial", label: "Partial Balance" },
];

const PaymentSlot = ({ groupId, tnr, type, label, items, uploadGroupPayment, deleteGroupPayment, refresh }) => {
  const [queue, setQueue] = useState([]);
  const [queueAmounts, setQueueAmounts] = useState([]);
  const [queueRemarks, setQueueRemarks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); // { current, total }
  const [deletingId, setDeletingId] = useState(null);
  const [viewerIndex, setViewerIndex] = useState(null);
  // Synchronous double-click guard.
  const uploadingRef = useRef(false);

  const handleDelete = async (docId) => {
    if (!window.confirm(`Delete this ${label} screenshot? This can't be undone.`)) return;
    setDeletingId(docId);
    try {
      const result = await deleteGroupPayment(docId);
      if (result?.success) {
        toast.success(`${label} screenshot deleted`);
        refresh();
      }
    } catch (err) {
      console.error("deleteGroupPayment error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRemoveQueued = (idx) => {
    setQueue((prev) => prev.filter((_, i) => i !== idx));
    setQueueAmounts((prev) => prev.filter((_, i) => i !== idx));
    setQueueRemarks((prev) => prev.filter((_, i) => i !== idx));
  };

  const uploadOne = async (file, amount, remarks) => {
    const formData = new FormData();
    formData.append("screenshot", file);
    // Real walk-in group → groupId; booking merged from tourBookingModel
    // ("real-<id>" placeholder) → tnr.
    if (groupId && !String(groupId).startsWith("real-")) {
      formData.append("groupId", groupId);
    } else if (tnr) {
      formData.append("tnr", tnr);
    }
    formData.append("type", type);
    if (amount) formData.append("amount", amount);
    if (remarks?.trim()) formData.append("remarks", remarks.trim());
    return uploadGroupPayment(formData);
  };

  const handleUploadAll = async () => {
    if (queue.length === 0) return toast.error(`Select at least one ${label} screenshot first`);
    for (let i = 0; i < queueAmounts.length; i++) {
      if (queueAmounts[i] && Number(queueAmounts[i]) <= 0) {
        return toast.error(`Amount for "${queue[i]?.name}", if entered, must be a positive number`);
      }
    }
    if (uploadingRef.current) return;
    uploadingRef.current = true;
    setUploading(true);
    let successCount = 0;
    for (let i = 0; i < queue.length; i++) {
      setUploadProgress({ current: i + 1, total: queue.length });
      try {
        const result = await uploadOne(queue[i], queueAmounts[i], queueRemarks[i]);
        if (result?.success) successCount += 1;
      } catch (err) {
        console.error("uploadGroupPayment error:", err);
      }
    }
    setUploading(false);
    setUploadProgress(null);
    setQueue([]);
    setQueueAmounts([]);
    setQueueRemarks([]);
    uploadingRef.current = false;
    if (successCount > 0) {
      toast.success(`${successCount} ${label} screenshot${successCount > 1 ? "s" : ""} uploaded`);
    }
    if (successCount < queue.length) {
      toast.error(`${queue.length - successCount} ${label} screenshot(s) failed to upload`);
    }
    refresh();
  };

  return (
    <div className="min-w-0 w-full p-3 sm:p-4 rounded-xl border border-[#DEE2E8] bg-[#F7F8FA]/60">
      <h5 className="flex items-center gap-1.5 font-bold text-gray-700 text-sm mb-2.5">
        <FileImage className="w-4 h-4" /> {label}
      </h5>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {items.map((item, i) => (
            <div
              key={item._id || i}
              className="relative flex items-start gap-1 text-xs font-semibold text-[#235F47] bg-[#EDF6F1] border border-[#B6DFC8] rounded-lg pl-2.5 pr-1.5 py-1.5 hover:bg-[#D7EEE0]"
            >
              <button
                type="button"
                onClick={() => setViewerIndex(i)}
                className="flex flex-col items-start gap-0.5 text-left"
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {items.length > 1 ? `#${i + 1}` : "View"}
                  {item.amount ? ` — ₹${item.amount}` : " — amount not entered"}
                </span>
                {item.createdAt && (
                  <span className="font-normal text-[#2E7D5E]">
                    {new Date(item.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
                {item.remarks && (
                  <span className="font-normal text-[#2E7D5E] italic">{item.remarks}</span>
                )}
              </button>
              {item._id && deleteGroupPayment && (
                <button
                  type="button"
                  onClick={() => handleDelete(item._id)}
                  disabled={deletingId === item._id}
                  title={`Delete this ${label} screenshot`}
                  className="shrink-0 p-1 rounded-md text-[#B23B3B] hover:text-[#872A2A] hover:bg-[#FBEEEE] disabled:opacity-50 transition-colors"
                >
                  {deletingId === item._id ? (
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
        items={items}
        index={viewerIndex}
        onClose={() => setViewerIndex(null)}
        onNav={setViewerIndex}
      />

      {queue.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-2">
          {queue.map((f, i) => (
            <div key={i} className="flex flex-col gap-1.5 p-2 bg-white border border-[#DEE2E8] rounded-lg">
              <div className="flex items-center gap-1.5">
                <div className="flex-1 min-w-0 flex items-center gap-1.5 text-xs font-semibold text-gray-700 px-1 py-1">
                  <FileImage className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                  <span className="truncate">{f.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveQueued(i)}
                  disabled={uploading}
                  title="Remove from queue"
                  className="shrink-0 p-1.5 rounded-md text-gray-400 hover:text-[#B23B3B] hover:bg-[#FBEEEE] disabled:opacity-40 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                type="number"
                placeholder="₹ (optional — OCR tries first)"
                value={queueAmounts[i] || ""}
                onChange={(e) =>
                  setQueueAmounts((prev) => prev.map((a, idx) => (idx === i ? e.target.value : a)))
                }
                disabled={uploading}
                className="w-full px-2.5 py-2 bg-white border border-[#DEE2E8] rounded-lg text-xs focus:border-[#5C84B3] focus:ring-2 focus:ring-[#DCE6F2] outline-none transition-all"
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
                className="w-full px-2.5 py-2 bg-white border border-[#DEE2E8] rounded-lg text-xs focus:border-[#5C84B3] focus:ring-2 focus:ring-[#DCE6F2] outline-none transition-all"
              />
            </div>
          ))}
        </div>
      )}

      <label className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 bg-white border border-dashed border-[#DEE2E8] rounded-lg px-3 py-2.5 mb-2 cursor-pointer hover:border-[#5C84B3]">
        <Upload className="w-3.5 h-3.5" />
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
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#2E7D5E] hover:bg-[#235F47] disabled:bg-[#C9CFD8] text-white rounded-lg text-xs font-semibold transition-colors"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading
            ? `Uploading ${uploadProgress?.current || 1} of ${uploadProgress?.total || queue.length}...`
            : `Upload ${queue.length > 1 ? `All (${queue.length})` : ""}`}
        </button>
      )}
    </div>
  );
};

const SHARING_LABELS = {
  double: "Double Sharing",
  triple: "Triple Sharing",
  withBerth: "Child w/ Berth",
  withoutBerth: "Child w/o Berth",
};

// Inline edit form for an already-captured traveller.
const TravellerEditForm = ({ draft, setDraft, onSave, onCancel, saving, accent = "indigo" }) => {
  if (!draft) return null;
  const update = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }));
  const updateAddressField = (field, value) =>
    setDraft((prev) => {
      const next = { ...prev, [field]: value };
      next.address = [next.addressLine1, next.addressLine2, next.city, next.state, next.pincode]
        .filter(Boolean)
        .join(", ");
      return next;
    });
  const ring = accent === "purple" ? "border-[#EAD29C] bg-[#FBF4E7]/40" : "border-[#C3D4E8] bg-[#EEF3FA]/40";
  const btn = accent === "purple" ? "bg-[#B07D2B] hover:bg-[#8C6220]" : "bg-[#2A5490] hover:bg-[#1F3F6E]";
  return (
    <div className={`rounded-xl border-2 p-3 sm:p-4 ${ring}`}>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600">Title</label>
          <select
            value={draft.title}
            onChange={(e) => update("title", e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
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
            value={draft.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Last Name</label>
          <input
            type="text"
            value={draft.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Age</label>
          <input
            type="number"
            value={draft.age}
            onChange={(e) => update("age", e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
        <div>
          <label className="block text-xs font-medium text-gray-600">Gender</label>
          <select
            value={draft.gender}
            onChange={(e) => update("gender", e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Sharing Type</label>
          <select
            value={draft.sharingType}
            onChange={(e) => update("sharingType", e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Select Sharing</option>
            <option value="double">Double Sharing</option>
            <option value="triple">Triple Sharing</option>
            <option value="withBerth">Child with Berth</option>
            <option value="withoutBerth">Child without Berth</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Phone</label>
          <input
            type="text"
            value={draft.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>
      <div className="mt-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={draft.addressLine1 || ""}
            onChange={(e) => updateAddressField("addressLine1", e.target.value)}
            placeholder="Address Line 1"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <input
            type="text"
            value={draft.addressLine2 || ""}
            onChange={(e) => updateAddressField("addressLine2", e.target.value)}
            placeholder="Address Line 2"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <input
            type="text"
            value={draft.city || ""}
            onChange={(e) => updateAddressField("city", e.target.value)}
            placeholder="City"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <input
            type="text"
            value={draft.state || ""}
            onChange={(e) => updateAddressField("state", e.target.value)}
            placeholder="State"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <input
            type="text"
            value={draft.pincode || ""}
            onChange={(e) => updateAddressField("pincode", e.target.value)}
            placeholder="Pincode"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <input
            type="text"
            value="India"
            readOnly
            disabled
            className="w-full px-3 py-2 border rounded-lg text-sm bg-[#F7F8FA] text-gray-500 cursor-not-allowed"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={onSave}
          disabled={saving}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-60 ${btn}`}
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-3 py-1.5 bg-white border border-[#C9CFD8] hover:bg-[#F7F8FA] text-gray-600 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
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
  deleteGroupPayment,
  uploadUserTravellerAadhaar,
  linkGroupTnr,
  editAadhaarTraveller,
  deleteAadhaarTraveller,
  linkGuestTnr,
  unlinkGuestTnr,
  deleteBookingByTnr,
  allBookings,
  onCreateBooking,
  navigate,
  refresh,
}) => {
  const [ctFile, setCtFile] = useState(null);
  const [ctExtracting, setCtExtracting] = useState(false);
  const [ctSaving, setCtSaving] = useState(false);
  const ctSavingRef = useRef(false); // synchronous double-click guard
  const [ctDraft, setCtDraft] = useState(null);
  const ctInputRef = useRef(null);
  const [showCtRawText, setShowCtRawText] = useState(false);
  const [tnrInput, setTnrInput] = useState("");
  const [linkingTnr, setLinkingTnr] = useState(false);
  const [showTnrInput, setShowTnrInput] = useState(false);

  const [guestSearch, setGuestSearch] = useState("");
  const [selectedGuestTnrs, setSelectedGuestTnrs] = useState([]);
  const [showGuestInput, setShowGuestInput] = useState(false);
  const [linkingGuest, setLinkingGuest] = useState(false);
  const [unlinkingGuest, setUnlinkingGuest] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingDocId, setEditingDocId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const startEdit = (traveller) => {
    setEditingId(traveller._id);
    setEditingDocId(traveller.aadhaarDocId || traveller._id);
    setEditDraft({
      title: traveller.title || "",
      firstName: traveller.firstName || "",
      lastName: traveller.lastName || "",
      age: traveller.age || "",
      gender: traveller.gender || "",
      sharingType: traveller.sharingType || "",
      phone: traveller.phone || "",
      address: traveller.address || "",
      addressLine1: traveller.addressLine1 || "",
      addressLine2: traveller.addressLine2 || "",
      city: traveller.city || "",
      state: traveller.state || "",
      pincode: traveller.pincode || "",
    });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingDocId(null);
    setEditDraft(null);
  };
  const saveEdit = async () => {
    if (!editingId || !editDraft) return;
    setSavingEdit(true);
    try {
      const result = await editAadhaarTraveller(editingDocId || editingId, editDraft);
      if (result?.success) {
        toast.success("Traveller updated");
        cancelEdit();
        refresh();
      }
    } finally {
      setSavingEdit(false);
    }
  };
  const handleDeleteTraveller = async (traveller, isMain) => {
    const travellerName =
      [traveller.title, traveller.firstName, traveller.lastName].filter(Boolean).join(" ") || "this co-traveller";
    const confirmMsg = isMain
      ? "Delete the Aadhaar FILES (front/back image or PDF) for every traveller in this booking (main + co-travellers)? The already-extracted details (Name, Age, Gender, Address, Aadhaar Number) are kept — only the uploaded files are removed from storage. This cannot be undone."
      : `Remove ${travellerName} from this booking? This cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;
    setDeletingId(traveller._id);
    try {
      const result = await deleteAadhaarTraveller(traveller.aadhaarDocId || traveller._id);
      if (result?.success) {
        toast.success(
          isMain
            ? "Aadhaar files deleted for this booking"
            : result.removedTraveller
              ? "Co-traveller removed from this booking"
              : "Co-traveller's Aadhaar file removed",
        );
        refresh();
      }
    } finally {
      setDeletingId(null);
    }
  };

  const mainName = [booking.main?.title, booking.main?.firstName, booking.main?.lastName]
    .filter(Boolean)
    .join(" ") || "Unnamed traveller";
  const travellerCount = 1 + (booking.coTravellers?.length || 0);

  const guestCandidates = (allBookings || [])
    .filter((b) => b.tnr && b.tnr !== booking.tnr)
    .filter((b) => !(booking.guestGroup?.otherTnrs || []).includes(b.tnr))
    .map((b) => ({
      tnr: b.tnr,
      name: [b.main?.title, b.main?.firstName, b.main?.lastName].filter(Boolean).join(" ") || "Unnamed traveller",
    }))
    .filter(({ tnr, name }) => {
      const q = guestSearch.trim().toLowerCase();
      if (!q) return true;
      return tnr.toLowerCase().includes(q) || name.toLowerCase().includes(q);
    });

  const toggleGuestCandidate = (tnr) => {
    setSelectedGuestTnrs((prev) =>
      prev.includes(tnr) ? prev.filter((t) => t !== tnr) : [...prev, tnr],
    );
  };

  const safeFileName = (name) =>
    (name || "traveller").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "traveller";
  const extFromUrl = (url) => {
    const match = url.split("?")[0].match(/\.([a-zA-Z0-9]+)$/);
    return match ? match[1] : "jpg";
  };
  // ZIP of Aadhaar images of this booking's active (not approved-cancelled) travellers.
  const handleDownloadZip = async () => {
    const entries = [];
    if (booking.main?.front?.url && !booking.main?.cancelled) {
      entries.push({ name: `Main - ${mainName} - Front`, url: booking.main.front.url });
    }
    if (booking.main?.back?.url && !booking.main?.cancelled) {
      entries.push({ name: `Main - ${mainName} - Back`, url: booking.main.back.url });
    }
    (booking.coTravellers || []).forEach((ct, i) => {
      if (ct.cancelled) return;
      const ctName = [ct.title, ct.firstName, ct.lastName].filter(Boolean).join(" ") || `Co-Traveller ${i + 1}`;
      if (ct.url) {
        entries.push({ name: `Co-Traveller ${i + 1} - ${ctName} - Front`, url: ct.url });
      }
      if (ct.back?.url) {
        entries.push({ name: `Co-Traveller ${i + 1} - ${ctName} - Back`, url: ct.back.url });
      }
    });

    if (entries.length === 0) {
      toast.error("No Aadhaar images found for this booking's active (non-cancelled) travellers");
      return;
    }

    setDownloadingZip(true);
    try {
      const zip = new JSZip();
      let fetchedCount = 0;
      await Promise.all(
        entries.map(async (entry) => {
          try {
            const res = await fetch(entry.url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const blob = await res.blob();
            zip.file(`${safeFileName(entry.name)}.${extFromUrl(entry.url)}`, blob);
            fetchedCount += 1;
          } catch (err) {
            console.error(`[DownloadZip] Could not fetch "${entry.name}" (${entry.url}):`, err);
          }
        }),
      );

      if (fetchedCount === 0) {
        toast.error("Could not download any Aadhaar images — check your connection and try again.");
        return;
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${safeFileName(mainName)}_Aadhaar.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
      toast.success(
        fetchedCount < entries.length
          ? `Downloaded ${fetchedCount}/${entries.length} Aadhaar images (some failed — check console)`
          : "Aadhaar ZIP downloaded",
      );
    } catch (error) {
      console.error("[DownloadZip] error:", error);
      toast.error("Could not build the Aadhaar ZIP");
    } finally {
      setDownloadingZip(false);
    }
  };

  // Step 1 of 2 — OCR into an editable draft (not saved yet).
  const handleExtractCt = async () => {
    if (!ctFile) return toast.error("Choose the co-traveller's Aadhaar front image first");
    setCtExtracting(true);
    try {
      const formData = new FormData();
      formData.append("front", ctFile);
      const ocrResult = await extractAadhaar(formData);
      if (!ocrResult?.success) {
        if (ocrResult === undefined) {
          toast.error("Aadhaar read failed — no response from server. Check your connection and try again.");
        }
        return;
      }
      if (!ocrResult.front?.url) {
        toast.error("Aadhaar was read but the image didn't upload — please try again.");
        return;
      }

      const p = ocrResult.parsed || {};
      const ctGender = p.gender || "Male";
      const age = Number(p.age) || "";
      setCtDraft({
        front: ocrResult.front,
        title: ctGender === "Female" ? "Mrs" : "Mr",
        firstName: p.firstName || "",
        lastName: p.lastName || "",
        age,
        gender: ctGender,
        dob: p.dob || "",
        phone: p.phone || "",
        address: p.address || "",
        addressLine1: p.addressLine1 || "",
        addressLine2: p.addressLine2 || "",
        city: p.city || "",
        state: p.state || "",
        pincode: p.pincode || "",
        sharingType: age >= 11 ? "double" : age >= 6 && age <= 10 ? "withBerth" : "",
      });
      toast.success("Aadhaar read. Verify details below before adding.");
    } catch (err) {
      console.error("extract co-traveller error:", err);
      toast.error("Something went wrong reading this Aadhaar. Check the console for details.");
    } finally {
      setCtExtracting(false);
    }
  };

  const clearCtFile = () => {
    if (ctInputRef.current) ctInputRef.current.value = "";
    setCtFile(null);
    setCtDraft(null);
  };

  const updateCtDraft = (field, value) => {
    setCtDraft((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "gender") next.title = value === "Female" ? "Mrs" : "Mr";
      if (field === "age") {
        const age = Number(value);
        if (age > 85) {
          toast.error("Age cannot exceed 85 years.");
          return prev;
        }
        if (age >= 11) next.sharingType = "double";
        else if (age >= 6 && age <= 10) next.sharingType = "withBerth";
        else next.sharingType = "";
      }
      return next;
    });
  };

  // Step 2 of 2 — save the draft. For a real booking ("real-<id>") this
  // sends tnr; the backend keeps it pending (NOT in Tour Bookings) until
  // Raise Manage Booking is approved.
  const handleAddCoTraveller = async () => {
    if (!ctDraft?.front?.url) return toast.error("Extract the co-traveller's Aadhaar first");
    if (ctSavingRef.current) return;
    ctSavingRef.current = true;
    setCtSaving(true);
    try {
      const isRealBooking = String(booking.groupId || "").startsWith("real-");
      const addResult = await addCoTravellerApi({
        ...(isRealBooking ? { tnr: booking.tnr } : { groupId: booking.groupId }),
        title: ctDraft.title,
        firstName: ctDraft.firstName,
        lastName: ctDraft.lastName,
        age: ctDraft.age,
        dob: ctDraft.dob,
        gender: ctDraft.gender,
        sharingType: ctDraft.sharingType,
        phone: ctDraft.phone,
        address: ctDraft.address,
        addressLine1: ctDraft.addressLine1,
        addressLine2: ctDraft.addressLine2,
        city: ctDraft.city,
        state: ctDraft.state,
        pincode: ctDraft.pincode,
        front: ctDraft.front,
      });
      if (!addResult?.success) {
        toast.error(addResult?.message || "Could not save the co-traveller — please try again.");
        return;
      }

      toast.success(
        booking.tnr
          ? "Co-traveller added — click Raise Manage Booking to add them to the booking"
          : "Co-traveller added",
      );
      clearCtFile();
      refresh();
    } catch (err) {
      console.error("addCoTraveller error:", err);
      toast.error("Something went wrong adding this co-traveller. Check the console for details.");
    } finally {
      ctSavingRef.current = false;
      setCtSaving(false);
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

  const handleLinkGuest = async () => {
    if (selectedGuestTnrs.length === 0) return toast.error("Select at least one booking to link");
    setLinkingGuest(true);
    try {
      let okCount = 0;
      for (const tnr of selectedGuestTnrs) {
        const result = await linkGuestTnr(booking.tnr, tnr);
        if (result?.success) okCount += 1;
      }
      if (okCount === 0) return;
      toast.success(
        okCount === selectedGuestTnrs.length
          ? `Linked as the same guest (${okCount} booking${okCount !== 1 ? "s" : ""})`
          : `Linked ${okCount}/${selectedGuestTnrs.length} bookings — check console for the rest`,
      );
      setSelectedGuestTnrs([]);
      setGuestSearch("");
      setShowGuestInput(false);
      refresh();
    } catch (err) {
      console.error("linkGuestTnr error:", err);
    } finally {
      setLinkingGuest(false);
    }
  };

  const handleUnlinkGuest = async () => {
    if (!window.confirm("Unlink this booking from its guest group?")) return;
    setUnlinkingGuest(true);
    try {
      const result = await unlinkGuestTnr(booking.tnr);
      if (!result?.success) return;
      toast.success("Unlinked from guest group");
      refresh();
    } catch (err) {
      console.error("unlinkGuestTnr error:", err);
    } finally {
      setUnlinkingGuest(false);
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
          aadhaarId: traveller.aadhaarDocId || traveller._id || null,
          isCoTraveller: true,
          addedBy: "admin",
          addedPostBooking: true,
        },
      },
    });
  };

  const spineColor = booking.paymentSummary?.fullyPaid
    ? "border-l-[#2E7D5E]"
    : booking.paymentSummary
      ? "border-l-[#B8641F]"
      : "border-l-[#C3D4E8]";
  const avatarGradient = booking.paymentSummary?.fullyPaid
    ? "from-emerald-600 to-emerald-500 shadow-emerald-200"
    : booking.paymentSummary
      ? "from-amber-600 to-amber-500 shadow-amber-200"
      : "from-[#2A5490] to-sky-500 shadow-sky-200";

  return (
    <div className={`rounded-2xl border border-[#DEE2E8] border-l-4 ${spineColor} shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white`}>
      <div className="w-full flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 px-3.5 sm:px-5 py-3.5 sm:py-4 bg-gradient-to-r from-[#F5F6F8] to-[#F8FAFC] hover:from-[#EEF0F3] hover:to-[#EEF3FA] transition-colors">
        <div
          role="button"
          tabIndex={0}
          onClick={onToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggle();
            }
          }}
          className="flex-1 min-w-0 flex items-center gap-2.5 sm:gap-3 text-left cursor-pointer"
        >
          <div className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-gradient-to-br ${avatarGradient} text-white flex items-center justify-center shadow-sm`}>
            <IdCard className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[#1C2733] truncate">{mainName}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
              <span className="truncate max-w-full">
                {booking.tourTitle || "Tour"} · {travellerCount} traveller{travellerCount !== 1 ? "s" : ""}
              </span>
              {booking.createdAt && (
                <span className="inline-flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3 shrink-0" />
                  {new Date(booking.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              )}
              {booking.tnr && (
                <span className="inline-flex items-center gap-1 text-[#1F3F6E] font-bold font-mono tracking-wide">
                  <Ticket className="w-3 h-3 shrink-0" /> {booking.tnr}
                  <CopyTnrButton tnr={booking.tnr} />
                </span>
              )}
              {booking.tnr && (
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${booking.createdBy === "user" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                    }`}
                >
                  ● {booking.createdBy === "user" ? "USER" : "ADMIN"}
                </span>
              )}
              {booking.raisedBy?.name && (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                  <UserCheck className="w-3 h-3 shrink-0" /> Raised by {booking.raisedBy.name}
                  {booking.raisedBy.employeeId ? ` (${booking.raisedBy.employeeId})` : ""}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); handleDownloadZip(); }}
            disabled={downloadingZip}
            title="Download Aadhaar images of this booking's current travellers as a ZIP"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#C3D4E8] bg-white text-[#1F3F6E] text-xs font-semibold hover:bg-[#EEF3FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {downloadingZip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{downloadingZip ? "Zipping..." : "Aadhaar ZIP"}</span>
          </button>
          <button onClick={onToggle} className="shrink-0 p-1">
            {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-5 sm:p-6 border-t-2 border-dashed border-[#DEE2E8] space-y-6">
          {/* Same guest, different TNR */}
          {booking.tnr && (
            <div className="rounded-xl border border-[#F5E6C8] bg-[#FBF4E7]/50 p-3">
              {booking.guestGroup ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#6B4A18] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Same guest — {booking.guestGroup.otherTnrs.length} other booking{booking.guestGroup.otherTnrs.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {booking.guestGroup.otherTnrs.map((t) => {
                      const matched = (allBookings || []).find((b) => b.tnr === t);
                      const matchedName = matched
                        ? [matched.main?.title, matched.main?.firstName, matched.main?.lastName]
                          .filter(Boolean)
                          .join(" ")
                        : "";
                      return (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-[#EAD29C] text-[#6B4A18] text-xs font-semibold"
                        >
                          <Ticket className="w-3 h-3 shrink-0" /> {t}
                          {matchedName && <span className="font-normal text-[#B07D2B]">· {matchedName}</span>}
                        </span>
                      );
                    })}
                  </div>
                  {booking.guestGroup.label && (
                    <p className="text-xs text-[#8C6220]">{booking.guestGroup.label}</p>
                  )}
                  <button
                    onClick={handleUnlinkGuest}
                    disabled={unlinkingGuest}
                    className="text-xs font-semibold text-[#A33333] hover:text-[#6E2222] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {unlinkingGuest ? "Unlinking..." : "Unlink this booking"}
                  </button>
                </div>
              ) : !showGuestInput ? (
                <button
                  onClick={() => setShowGuestInput(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#8C6220] hover:text-[#4F3712]"
                >
                  <Link2 className="w-3.5 h-3.5" /> Link as same guest as another booking
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                    placeholder="Search by TNR or traveller name"
                    className="w-full px-3 py-1.5 bg-white border border-[#EAD29C] rounded-lg text-xs focus:border-[#C89B44] focus:ring-2 focus:ring-[#F5E6C8] outline-none transition-all"
                  />

                  {selectedGuestTnrs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedGuestTnrs.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#B07D2B] text-white text-xs font-semibold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="max-h-48 overflow-y-auto rounded-lg border border-[#EAD29C] bg-white divide-y divide-[#FBF4E7]">
                    {guestCandidates.length === 0 ? (
                      <p className="text-xs text-gray-400 px-3 py-3 text-center">
                        {guestSearch.trim() ? "No matching bookings" : "No other bookings with a TNR yet"}
                      </p>
                    ) : (
                      guestCandidates.map(({ tnr, name }) => (
                        <label
                          key={tnr}
                          className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-[#FBF4E7] text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={selectedGuestTnrs.includes(tnr)}
                            onChange={() => toggleGuestCandidate(tnr)}
                            className="w-3.5 h-3.5 accent-[#B07D2B] shrink-0"
                          />
                          <span className="flex items-center gap-1 font-semibold text-[#1F3F6E] shrink-0">
                            <Ticket className="w-3 h-3" /> {tnr}
                          </span>
                          <span className="text-gray-600 truncate">{name}</span>
                        </label>
                      ))
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleLinkGuest}
                      disabled={linkingGuest || selectedGuestTnrs.length === 0}
                      className="px-3 py-1.5 bg-[#B07D2B] hover:bg-[#8C6220] disabled:bg-[#C9CFD8] text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      {linkingGuest ? "Linking..." : `Save${selectedGuestTnrs.length ? ` (${selectedGuestTnrs.length})` : ""}`}
                    </button>
                    <button
                      onClick={() => { setShowGuestInput(false); setSelectedGuestTnrs([]); setGuestSearch(""); }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Booking notes — reference only */}
          {booking.bookingNotes && (
            <div className="text-xs text-gray-500 bg-[#F7F8FA] rounded-xl p-3 border border-[#E7EAEF] space-y-1.5">
              <div className="flex flex-col gap-1">
                {booking.bookingNotes.packageType && <span><b>Package:</b> {booking.bookingNotes.packageType}</span>}
                {booking.bookingNotes.boardingPoint && <span><b>Boarding:</b> {booking.bookingNotes.boardingPoint}</span>}
                {booking.bookingNotes.deboardingPoint && <span><b>Deboarding:</b> {booking.bookingNotes.deboardingPoint}</span>}
                {booking.bookingNotes.remarks && <span><b>Remarks:</b> {booking.bookingNotes.remarks}</span>}
              </div>
              {booking.bookingNotes.addonsDetail?.length > 0 ? (
                <div className="flex flex-col gap-1.5 pt-1">
                  {booking.bookingNotes.addonsDetail.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#DCE6F2] text-[#17314F] font-medium"
                    >
                      <Train className="w-3.5 h-3.5 shrink-0" />
                      <span className="flex-1 min-w-0 truncate">{a.label ? `${a.label}: ` : ""}{a.name}</span>
                      {a.amount > 0 && <span className="shrink-0 text-[#2A5490] font-semibold">₹{a.amount}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                booking.bookingNotes.addons && <div><b>Add-ons:</b> {booking.bookingNotes.addons}</div>
              )}
            </div>
          )}

          {/* Main traveller */}
          <div>
            <h4 className="flex items-center gap-2 font-bold text-gray-800 text-sm mb-2">
              <IdCard className="w-4 h-4 text-[#2A5490]" /> Main Traveller
            </h4>
            {editingId === booking.main?._id ? (
              <TravellerEditForm
                draft={editDraft}
                setDraft={setEditDraft}
                onSave={saveEdit}
                onCancel={cancelEdit}
                saving={savingEdit}
                accent="indigo"
              />
            ) : (
              <div className="flex flex-col items-start gap-1.5 text-sm text-gray-600 bg-[#EEF3FA]/60 border border-[#DCE6F2] rounded-xl p-3">
                <span className="font-semibold text-gray-800">{mainName}</span>
                <CancelStatusBadge status={booking.main?.cancelStatus} />
                <span>Age: {booking.main?.age || "—"}</span>
                <span>Gender: {booking.main?.gender || "—"}</span>
                <span>Mobile: {booking.main?.phone || "—"}</span>
                {booking.main?.sharingType && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#DCE6F2] text-[#1F3F6E] font-semibold text-xs">
                    {SHARING_LABELS[booking.main.sharingType] || booking.main.sharingType}
                  </span>
                )}
                {booking.main?.front?.url && (
                  <a href={booking.main.front.url} target="_blank" rel="noopener noreferrer" className="text-[#2A5490] font-semibold underline">View Front</a>
                )}
                {booking.main?.back?.url && (
                  <a href={booking.main.back.url} target="_blank" rel="noopener noreferrer" className="text-[#2A5490] font-semibold underline">View Back</a>
                )}
                {booking.main?.address && (
                  <span className="w-full flex items-center gap-1.5 text-gray-600">
                    <Home className="w-3.5 h-3.5 text-[#3A6698] shrink-0" /> {booking.main.address}
                  </span>
                )}
                {/* Edit/Delete only before a real tnr exists. */}
                {!booking.tnr && booking.main?._id && (
                  <div className="w-full flex items-center gap-2 pt-1">
                    <button
                      onClick={() => startEdit(booking.main)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-white border border-[#9FB9D8] hover:bg-[#DCE6F2] text-[#1F3F6E] rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTraveller(booking.main, true)}
                      disabled={deletingId === booking.main._id}
                      className="flex items-center gap-1 px-2.5 py-1 bg-white border border-[#D99999] hover:bg-[#FBEEEE] text-[#A33333] rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" /> {deletingId === booking.main._id ? "Deleting..." : "Delete Booking"}
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* Missing Aadhaar on a real booking — upload row (hidden for
                cancelled/rejected travellers). */}
            {booking.tnr && booking.main?._id && !booking.main?.front?.url && uploadUserTravellerAadhaar &&
              booking.main?.cancelStatus !== "cancelled" && booking.main?.cancelStatus !== "rejected" && (
                <TravellerAadhaarRow
                  traveller={{
                    _id: booking.main._id,
                    title: booking.main.title,
                    firstName: booking.main.firstName,
                    lastName: booking.main.lastName,
                    age: booking.main.age,
                    gender: booking.main.gender,
                    isCoTraveller: false,
                    hasAadhaar: false,
                  }}
                  tnr={booking.tnr}
                  extractAadhaar={extractAadhaar}
                  uploadUserTravellerAadhaar={uploadUserTravellerAadhaar}
                  onSaved={refresh}
                />
              )}
          </div>

          {/* Co-travellers */}
          <div>
            <h4 className="flex items-center gap-2 font-bold text-gray-800 text-sm mb-2">
              <Users className="w-4 h-4 text-[#B07D2B]" /> Co-Travellers ({booking.coTravellers.length})
            </h4>
            {booking.coTravellers.length > 0 && (
              <div className="space-y-2 mb-3">
                {booking.coTravellers.map((ct, i) => {
                  const ctName = [ct.title, ct.firstName, ct.lastName].filter(Boolean).join(" ") || `Traveller ${i + 2}`;
                  if (editingId === ct._id) {
                    return (
                      <TravellerEditForm
                        key={ct._id || i}
                        draft={editDraft}
                        setDraft={setEditDraft}
                        onSave={saveEdit}
                        onCancel={cancelEdit}
                        saving={savingEdit}
                        accent="purple"
                      />
                    );
                  }
                  return (
                    <React.Fragment key={ct._id || i}>
                      <div className="flex flex-col gap-3 text-sm text-gray-600 bg-[#FBF4E7]/60 border border-[#F5E6C8] rounded-xl p-3">
                        <div className="flex flex-col items-start gap-1.5">
                          <span className="font-semibold text-gray-800">{ctName}</span>
                          <CancelStatusBadge status={ct.cancelStatus} />
                          <span>Age: {ct.age || "—"}</span>
                          <span>Gender: {ct.gender || "—"}</span>
                          {ct.sharingType && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#F5E6C8] text-[#8C6220] font-semibold text-xs">
                              {SHARING_LABELS[ct.sharingType] || ct.sharingType}
                            </span>
                          )}
                          {ct.url && (
                            <a href={ct.url} target="_blank" rel="noopener noreferrer" className="text-[#2A5490] font-semibold underline">View Front</a>
                          )}
                          {ct.back?.url && (
                            <a href={ct.back.url} target="_blank" rel="noopener noreferrer" className="text-[#2A5490] font-semibold underline">View Back</a>
                          )}
                        </div>
                        {/* Before a tnr exists → Edit/Remove.
                            After a tnr exists, for a co-traveller added later
                            (postBooking) → Edit/Remove + Raise Manage Booking,
                            UNTIL Manage Booking is approved and they're in
                            Tour Bookings (ct.inRealBooking) → then only the
                            "Added to booking" badge. Rejected → not in Tour
                            Bookings → buttons visible again. Same for ADMIN
                            and USER bookings. */}
                        {(!booking.tnr || ct.postBooking) && !ct.inRealBooking && (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => startEdit(ct)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-white border border-[#DCB86D] hover:bg-[#F5E6C8] text-[#8C6220] rounded-lg text-xs font-semibold transition-colors"
                            >
                              <Pencil className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTraveller(ct, false)}
                              disabled={deletingId === ct._id}
                              className="flex items-center gap-1 px-2.5 py-1 bg-white border border-[#D99999] hover:bg-[#FBEEEE] text-[#A33333] rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-3 h-3" /> {deletingId === ct._id ? "Removing..." : "Remove"}
                            </button>
                            {booking.tnr && ct.postBooking && (
                              <button
                                onClick={() => handleRaiseManageBooking(ct)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B07D2B] hover:bg-[#8C6220] text-white rounded-lg text-xs font-bold transition-colors"
                              >
                                Raise Manage Booking <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                        {booking.tnr && ct.postBooking && ct.inRealBooking && (
                          <span className="inline-flex w-fit items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EDF6F1] border border-[#B6DFC8] text-[#235F47] text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Added to booking
                          </span>
                        )}
                      </div>
                      {booking.tnr && ct._id && !ct.url && uploadUserTravellerAadhaar &&
                        ct.cancelStatus !== "cancelled" && ct.cancelStatus !== "rejected" && (
                          <TravellerAadhaarRow
                            traveller={{
                              _id: ct._id,
                              title: ct.title,
                              firstName: ct.firstName,
                              lastName: ct.lastName,
                              age: ct.age,
                              gender: ct.gender,
                              isCoTraveller: true,
                              hasAadhaar: false,
                            }}
                            tnr={booking.tnr}
                            extractAadhaar={extractAadhaar}
                            uploadUserTravellerAadhaar={uploadUserTravellerAadhaar}
                            onSaved={refresh}
                          />
                        )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* Add co-traveller — OCR first, verify, then save. */}
            <div className="p-4 sm:p-5 rounded-xl border-2 border-dashed border-[#DCB86D] bg-[#FBF4E7]/30">
              <p className="text-xs font-bold text-gray-600 mb-3">Add Co-Traveller (via Aadhaar)</p>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Aadhaar Front</label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={ctInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        setCtFile(e.target.files?.[0] || null);
                        setCtDraft(null);
                      }}
                      className="flex-1 min-w-0 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#F5E6C8] file:text-[#8C6220] hover:file:bg-[#EAD29C]"
                    />
                    {(ctFile || ctDraft) && (
                      <button
                        type="button"
                        onClick={clearCtFile}
                        className="shrink-0 text-gray-400 hover:text-[#A33333]"
                        title={ctDraft ? "Remove this Aadhaar and redo it" : "Clear chosen file"}
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleExtractCt}
                  disabled={ctExtracting || !ctFile || !!ctDraft}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#B07D2B] hover:bg-[#8C6220] disabled:bg-[#C9CFD8] text-white rounded-xl font-bold text-sm transition-colors"
                >
                  {ctExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Reading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" /> Extract Aadhaar
                    </>
                  )}
                </button>
              </div>

              {ctDraft && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600">Title</label>
                      <select
                        value={ctDraft.title}
                        onChange={(e) => updateCtDraft("title", e.target.value)}
                        className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
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
                        value={ctDraft.firstName}
                        onChange={(e) => updateCtDraft("firstName", e.target.value)}
                        className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600">Last Name</label>
                      <input
                        type="text"
                        value={ctDraft.lastName}
                        onChange={(e) => updateCtDraft("lastName", e.target.value)}
                        className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600">Age</label>
                      <input
                        type="number"
                        value={ctDraft.age}
                        onChange={(e) => updateCtDraft("age", e.target.value)}
                        className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600">Gender</label>
                      <select
                        value={ctDraft.gender}
                        onChange={(e) => updateCtDraft("gender", e.target.value)}
                        className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600">Sharing Type</label>
                      <select
                        value={ctDraft.sharingType}
                        onChange={(e) => updateCtDraft("sharingType", e.target.value)}
                        className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Select Sharing</option>
                        {Number(ctDraft.age) >= 11 ? (
                          <>
                            <option value="double">Double Sharing</option>
                            <option value="triple">Triple Sharing</option>
                          </>
                        ) : Number(ctDraft.age) >= 6 && Number(ctDraft.age) <= 10 ? (
                          <>
                            <option value="withBerth">Child with Berth</option>
                            <option value="withoutBerth">Child without Berth</option>
                          </>
                        ) : null}
                      </select>
                    </div>
                  </div>
                  {ctDraft.front?.ocrText && (
                    <button
                      type="button"
                      onClick={() => setShowCtRawText((v) => !v)}
                      className="mt-3 text-xs font-semibold text-gray-400 hover:text-gray-600"
                    >
                      {showCtRawText ? "Hide" : "Show"} raw text read
                    </button>
                  )}
                  {showCtRawText && ctDraft.front?.ocrText && (
                    <pre className="mt-2 p-3 bg-[#F7F8FA] border border-[#DEE2E8] rounded-lg text-[11px] text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {ctDraft.front.ocrText}
                    </pre>
                  )}
                  <button
                    onClick={handleAddCoTraveller}
                    disabled={ctSaving}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#B07D2B] hover:bg-[#8C6220] disabled:bg-[#C9CFD8] text-white rounded-xl font-bold text-sm transition-colors"
                  >
                    {ctSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                    Add Co-Traveller
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Payments */}
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <h4 className="flex items-center gap-2 font-bold text-gray-800 text-sm">
                <IndianRupee className="w-4 h-4 text-[#2E7D5E]" /> Payment Screenshots
              </h4>
              {booking.paymentSummary && (
                booking.paymentSummary.fullyPaid ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#235F47] bg-[#EDF6F1] border-2 border-dashed border-[#2E7D5E] rounded-full px-3.5 py-1 -rotate-2 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Balance Fully Paid
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[#93501A] bg-[#FBF1E6] border border-[#E8C89A] rounded-full px-3 py-1">
                    Balance Due: ₹{booking.paymentSummary.balanceRemaining.toLocaleString("en-IN")}
                    <span className="font-normal text-[#B8641F]">
                      (of ₹{booking.paymentSummary.packageAmount.toLocaleString("en-IN")})
                    </span>
                  </span>
                )
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PAYMENT_TYPES.map(({ type, label }) => {
                const items = booking.payments[type] || [];
                return (
                  <PaymentSlot
                    key={type}
                    groupId={booking.groupId}
                    tnr={booking.tnr}
                    type={type}
                    label={label}
                    items={items}
                    uploadGroupPayment={uploadGroupPayment}
                    deleteGroupPayment={deleteGroupPayment}
                    refresh={refresh}
                  />
                );
              })}
            </div>
          </div>

          {/* Create Booking / link TNR */}
          {!booking.tnr && (
            <div className="pt-2 border-t border-[#E7EAEF]">
              <button
                onClick={onCreateBooking}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[#1F3F6E] to-[#2A5490] hover:from-[#17314F] hover:to-[#1F3F6E] text-white rounded-xl font-bold text-sm shadow-sm transition-all"
              >
                Create Booking <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-[11px] text-gray-400 mt-2">
                TNR links automatically once the booking is created — hit Refresh above after creating it.
              </p>

              {!showTnrInput ? (
                <button
                  onClick={() => setShowTnrInput(true)}
                  className="w-full text-center text-xs font-semibold text-gray-400 hover:text-[#2A5490] mt-1"
                >
                  Didn't auto-link? Paste the TNR manually
                </button>
              ) : (
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={tnrInput}
                    onChange={(e) => setTnrInput(e.target.value)}
                    placeholder="e.g. EP69TQ"
                    className="flex-1 px-3.5 py-2.5 bg-white border border-[#DEE2E8] rounded-xl text-sm uppercase focus:border-[#5C84B3] focus:ring-4 focus:ring-[#DCE6F2] outline-none transition-all"
                  />
                  <button
                    onClick={handleLinkTnr}
                    disabled={linkingTnr}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#2A5490] hover:bg-[#1F3F6E] disabled:bg-[#C9CFD8] text-white rounded-xl font-bold text-sm transition-colors"
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

const AllBookingsTab = ({ getAadhaarBookings, extractAadhaar, addCoTravellerApi, uploadGroupPayment, deleteGroupPayment, uploadUserTravellerAadhaar, linkGroupTnr, editAadhaarTraveller, deleteAadhaarTraveller, linkGuestTnr, unlinkGuestTnr, deleteBookingByTnr, navigate, tourId, tourTitle }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [downloadingAllZip, setDownloadingAllZip] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
        paymentScreenshots: booking.payments?.advance?.length
          ? {
            advance: {
              url: booking.payments.advance[booking.payments.advance.length - 1].url,
              amount: booking.payments.advance[booking.payments.advance.length - 1].amount,
            },
          }
          : {},
        contactMobile: mainT?.phone || "",
        contactAddress: mainT?.address || "",
        contactAddressLine1: mainT?.addressLine1 || "",
        contactAddressLine2: mainT?.addressLine2 || "",
        contactCity: mainT?.city || "",
        contactState: mainT?.state || "",
        contactPincode: mainT?.pincode || "",
        groupId: booking.groupId,
        bookingNotes: booking.bookingNotes || null,
      },
    });
  };

  const visibleBookings = tourId
    ? bookings.filter((b) => String(b.tourId || "") === String(tourId))
    : bookings;

  const bookingMatchesSearch = (b, q) => {
    const names = [b.main, ...(b.coTravellers || [])]
      .map((t) => [t?.title, t?.firstName, t?.lastName].filter(Boolean).join(" "))
      .join(" ");
    const haystack = [names, b.tnr, b.main?.phone, b.main?.aadhaarNumber].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(q);
  };
  const searchedBookings = (() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return visibleBookings;
    return visibleBookings.filter((b) => bookingMatchesSearch(b, q));
  })();

  const tourZipSafeName = (name) =>
    (name || "file").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "file";
  const tourZipExtFromUrl = (url) => {
    const match = url.split("?")[0].match(/\.([a-zA-Z0-9]+)$/);
    return match ? match[1] : "jpg";
  };
  // Whole-tour Aadhaar ZIP — flat, booking name/tnr baked into each filename.
  const handleDownloadAllZip = async () => {
    if (visibleBookings.length === 0) {
      toast.error("No bookings to download for this tour");
      return;
    }
    setDownloadingAllZip(true);
    try {
      const zip = new JSZip();
      let fetchedCount = 0;
      let totalCount = 0;

      await Promise.all(
        visibleBookings.map(async (booking, bIdx) => {
          const mainName = [booking.main?.title, booking.main?.firstName, booking.main?.lastName]
            .filter(Boolean)
            .join(" ") || `Booking ${bIdx + 1}`;
          const bookingPrefix = `${bIdx + 1}. ${tourZipSafeName(mainName)}${booking.tnr ? `_${booking.tnr}` : ""}`;

          const entries = [];
          if (booking.main?.front?.url) {
            entries.push({ name: `${bookingPrefix} - Main - ${mainName} - Front`, url: booking.main.front.url });
          }
          if (booking.main?.back?.url) {
            entries.push({ name: `${bookingPrefix} - Main - ${mainName} - Back`, url: booking.main.back.url });
          }
          (booking.coTravellers || []).forEach((ct, i) => {
            const ctName = [ct.title, ct.firstName, ct.lastName].filter(Boolean).join(" ") || `Co-Traveller ${i + 1}`;
            if (ct.url) {
              entries.push({ name: `${bookingPrefix} - Co-Traveller ${i + 1} - ${ctName} - Front`, url: ct.url });
            }
            if (ct.back?.url) {
              entries.push({ name: `${bookingPrefix} - Co-Traveller ${i + 1} - ${ctName} - Back`, url: ct.back.url });
            }
          });

          totalCount += entries.length;

          await Promise.all(
            entries.map(async (entry) => {
              try {
                const res = await fetch(entry.url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const blob = await res.blob();
                zip.file(`${tourZipSafeName(entry.name)}.${tourZipExtFromUrl(entry.url)}`, blob);
                fetchedCount += 1;
              } catch (err) {
                console.error(`[DownloadAllZip] Could not fetch "${entry.name}" (${entry.url}):`, err);
              }
            }),
          );
        }),
      );

      if (fetchedCount === 0) {
        toast.error("Could not download any Aadhaar images for this tour");
        return;
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${tourZipSafeName(tourTitle || "Tour")}_All_Aadhaar.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
      toast.success(
        fetchedCount < totalCount
          ? `Downloaded ${fetchedCount}/${totalCount} Aadhaar images (some failed — check console)`
          : `Downloaded all Aadhaar images for ${visibleBookings.length} booking${visibleBookings.length !== 1 ? "s" : ""}`,
      );
    } catch (error) {
      console.error("[DownloadAllZip] error:", error);
      toast.error("Could not build the tour's Aadhaar ZIP");
    } finally {
      setDownloadingAllZip(false);
    }
  };

  // Deletes Aadhaar FILES (never extracted data) for every booking in this
  // tour — main traveller's aadhaarDocId clears the whole booking.
  const [deletingAllAadhaar, setDeletingAllAadhaar] = useState(false);
  const handleDeleteAllAadhaar = async () => {
    const mainDocIds = visibleBookings.map((b) => b.main?.aadhaarDocId).filter(Boolean);
    if (mainDocIds.length === 0) {
      toast.error("No bookings with Aadhaar to delete for this tour");
      return;
    }
    if (
      !window.confirm(
        `Delete the Aadhaar FILES for ALL ${mainDocIds.length} booking(s) in this tour? Extracted details (Name/Age/Gender/Address/Aadhaar Number) are kept — only the uploaded files are removed from storage. This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeletingAllAadhaar(true);
    try {
      let okCount = 0;
      for (const docId of mainDocIds) {
        try {
          const result = await deleteAadhaarTraveller(docId);
          if (result?.success) okCount += 1;
        } catch (err) {
          console.error(`handleDeleteAllAadhaar: failed for docId ${docId}:`, err);
        }
      }
      toast.success(
        okCount === mainDocIds.length
          ? "Aadhaar files deleted for all bookings"
          : `Aadhaar files deleted for ${okCount}/${mainDocIds.length} booking(s) — check console for the rest`,
      );
      fetchBookings();
    } finally {
      setDeletingAllAadhaar(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-5 pb-4 border-b-2 border-dashed border-[#DEE2E8] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center justify-between lg:justify-start gap-2.5 min-w-0 lg:flex-1">
          <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full bg-gradient-to-br from-indigo-600 to-sky-500 text-white text-sm font-bold font-mono shadow-sm shadow-indigo-200 shrink-0">
            {visibleBookings.length}
          </span>
          <p className="text-sm text-[#1C2733] min-w-0 lg:truncate">
            booking{visibleBookings.length !== 1 ? "s" : ""}
            {tourTitle ? <span className="text-gray-500"> for {tourTitle}</span> : ""}
          </p>
          <button
            onClick={fetchBookings}
            title="Refresh"
            className="lg:hidden shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-[#DEE2E8] text-[#2A5490] hover:bg-[#EEF3FA] hover:border-[#C3D4E8] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex flex-col sm:flex-row w-full lg:w-fit rounded-xl border border-gray-200 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 shadow-sm overflow-hidden">
            <button
              onClick={handleDeleteAllAadhaar}
              disabled={deletingAllAadhaar || visibleBookings.length === 0}
              title="Delete the uploaded Aadhaar files for EVERY booking in this tour (keeps the extracted Name/Age/Gender/Address/Aadhaar Number — does not delete any booking)"
              className="sm:flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 lg:py-2 bg-white text-red-600 text-xs font-semibold hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {deletingAllAadhaar ? <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 shrink-0" />}
              <span className="whitespace-nowrap">{deletingAllAadhaar ? "Deleting..." : "Delete All Aadhaar"}</span>
            </button>
            <button
              onClick={handleDownloadAllZip}
              disabled={downloadingAllZip || visibleBookings.length === 0}
              title="Download Aadhaar images of every booking in this tour as one ZIP"
              className="sm:flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 lg:py-2 bg-white text-[#1F3F6E] text-xs font-semibold hover:bg-[#EEF3FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {downloadingAllZip ? <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" /> : <Download className="w-3.5 h-3.5 shrink-0" />}
              <span className="whitespace-nowrap">{downloadingAllZip ? "Zipping..." : "Download All (Tour) ZIP"}</span>
            </button>
          </div>
          <button
            onClick={fetchBookings}
            title="Refresh"
            className="hidden lg:flex shrink-0 items-center justify-center w-8 h-8 rounded-full border border-[#DEE2E8] text-[#2A5490] hover:bg-[#EEF3FA] hover:border-[#C3D4E8] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by name, mobile, TNR or Aadhaar number (optional)"
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            title="Clear"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : visibleBookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm rounded-2xl border-2 border-dashed border-[#DEE2E8]">No bookings saved for this tour yet.</div>
      ) : searchedBookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm rounded-2xl border-2 border-dashed border-[#DEE2E8]">No booking matches "{searchQuery}".</div>
      ) : (
        <div className="space-y-4">
          {searchedBookings.map((booking) => (
            <BookingCard
              key={booking.groupId}
              booking={booking}
              expanded={!!expanded[booking.groupId]}
              onToggle={() => toggleExpand(booking.groupId)}
              extractAadhaar={extractAadhaar}
              addCoTravellerApi={addCoTravellerApi}
              uploadGroupPayment={uploadGroupPayment}
              deleteGroupPayment={deleteGroupPayment}
              uploadUserTravellerAadhaar={uploadUserTravellerAadhaar}
              linkGroupTnr={linkGroupTnr}
              editAadhaarTraveller={editAadhaarTraveller}
              deleteAadhaarTraveller={deleteAadhaarTraveller}
              linkGuestTnr={linkGuestTnr}
              unlinkGuestTnr={unlinkGuestTnr}
              deleteBookingByTnr={deleteBookingByTnr}
              allBookings={visibleBookings}
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
    deleteGroupPayment,
    linkGroupTnr,
    editAadhaarTraveller,
    deleteAadhaarTraveller,
    linkGuestTnr,
    unlinkGuestTnr,
    getAllStaff,
    staffList,
    searchUserBookings,
    uploadUserTravellerAadhaar,
    uploadUserBookingPayment,
    deleteBookingByTnr,
  } = useContext(TourContext);

  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false); // synchronous double-click guard

  // "save" = new walk-in booking, "all" = All Bookings, "user" = User Bookings.
  const [activeTab, setActiveTab] = useState("save");

  const [tourId, setTourId] = useState("");
  const [tourInfo, setTourInfo] = useState(null);

  const [packageSelection, setPackageSelection] = useState({ type: "main", variantIndex: null });
  const [boardingPoint, setBoardingPoint] = useState(null);
  const [deboardingPoint, setDeboardingPoint] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [raisedByStaffId, setRaisedByStaffId] = useState("");

  const [travellers, setTravellers] = useState([blankTraveller(true)]);

  const [paymentScreenshots, setPaymentScreenshots] = useState({});
  const [paymentLoading, setPaymentLoading] = useState({});
  const paymentUploadingRef = useRef({});
  const [paymentFiles, setPaymentFiles] = useState({});
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [paymentRemarks, setPaymentRemarks] = useState({});
  const [paymentViewerIndex, setPaymentViewerIndex] = useState({});

  useEffect(() => {
    if (!tourList || tourList.length === 0) getTourList();
  }, [tourList, getTourList]);

  useEffect(() => {
    if (!staffList || staffList.length === 0) getAllStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!tourId || !tourList?.length) {
      setTourInfo(null);
      return;
    }
    setTourInfo(tourList.find((t) => t._id === tourId) || null);
  }, [tourId, tourList]);

  useEffect(() => {
    setPackageSelection({ type: "main", variantIndex: null });
    setBoardingPoint(null);
    setDeboardingPoint(null);
    setSelectedAddons([]);
    setRemarks("");
  }, [tourId]);

  useEffect(() => {
    setBoardingPoint(null);
    setDeboardingPoint(null);
    setSelectedAddons([]);
  }, [packageSelection.type, packageSelection.variantIndex]);

  const handleTravellerChange = (index, field, value) => {
    const updated = [...travellers];
    const t = { ...updated[index] };

    if (field === "title") {
      if (value === "Mr") t.gender = "Male";
      else if (value === "Mrs" || value === "Ms") t.gender = "Female";
    }
    if (field === "gender") {
      if (value === "Male") t.title = "Mr";
      else if (value === "Female") t.title = "Mrs";
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

    if (["addressLine1", "addressLine2", "city", "state", "pincode"].includes(field)) {
      t.address = [t.addressLine1, t.addressLine2, t.city, t.state, t.pincode]
        .filter(Boolean)
        .join(", ");
    }

    updated[index] = t;
    setTravellers(updated);
  };

  const addCoTraveller = () => {
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
      if (!result?.success) {
        handleTravellerChange(index, "ocrLoading", false);
        return;
      }

      const p = result.parsed || {};
      const readGender = p.gender || "Male";
      const updated = [...travellers];
      updated[index] = {
        ...updated[index],
        title: readGender === "Female" ? "Mrs" : "Mr",
        firstName: p.firstName || "",
        lastName: p.lastName || "",
        age: p.age || "",
        gender: readGender,
        phone: p.phone || updated[index].phone || "",
        address: p.address || updated[index].address || "",
        addressLine1: p.addressLine1 || updated[index].addressLine1 || "",
        addressLine2: p.addressLine2 || updated[index].addressLine2 || "",
        city: p.city || updated[index].city || "",
        state: p.state || updated[index].state || "",
        pincode: p.pincode || updated[index].pincode || "",
        front: result.front || null,
        back: result.back || null,
        ocrLoading: false,
        _frontFile: null,
        _backFile: null,
      };
      setTravellers(updated);
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

  const clearTravellerAadhaar = (index) => {
    const updated = [...travellers];
    updated[index] = {
      ...updated[index],
      title: "Mr",
      firstName: "",
      lastName: "",
      age: "",
      dob: "",
      gender: "Male",
      front: null,
      back: null,
      _frontFile: null,
      _backFile: null,
      ...(index !== 0 ? { phone: "", address: "" } : {}),
    };
    setTravellers(updated);
    toast.info(`Traveller ${index + 1}'s Aadhaar cleared — upload the correct image and extract again.`);
  };

  // Only Advance is collected here.
  const paymentSlots = [
    { type: "advance", label: "Advance Payment", cardClass: "bg-indigo-50 border-indigo-200" },
  ];

  const handlePaymentUpload = async (type) => {
    const queue = paymentFiles[type] || [];
    const amounts = paymentAmounts[type] || [];
    const remarksQueue = paymentRemarks[type] || [];
    if (queue.length === 0) return toast.error(`Select at least one ${type} screenshot first`);
    for (let i = 0; i < amounts.length; i++) {
      if (amounts[i] && Number(amounts[i]) <= 0) {
        return toast.error(`Amount for "${queue[i]?.name}", if entered, must be a positive number`);
      }
    }
    if (paymentUploadingRef.current[type]) return;
    paymentUploadingRef.current[type] = true;

    let successCount = 0;
    for (let i = 0; i < queue.length; i++) {
      setPaymentLoading((prev) => ({ ...prev, [type]: { current: i + 1, total: queue.length } }));
      try {
        const formData = new FormData();
        formData.append("screenshot", queue[i]);
        formData.append("type", type);
        if (amounts[i]) formData.append("amount", amounts[i]);
        const result = await uploadPaymentScreenshot(formData);
        if (result?.success) {
          successCount += 1;
          setPaymentScreenshots((prev) => ({
            ...prev,
            [type]: [
              ...(prev[type] || []),
              { url: result.url, amount: result.amount, remarks: (remarksQueue[i] || "").trim() },
            ],
          }));
        }
      } catch (err) {
        console.error("handlePaymentUpload error:", err);
      }
    }
    setPaymentLoading((prev) => ({ ...prev, [type]: false }));
    setPaymentFiles((prev) => ({ ...prev, [type]: [] }));
    setPaymentAmounts((prev) => ({ ...prev, [type]: [] }));
    setPaymentRemarks((prev) => ({ ...prev, [type]: [] }));
    paymentUploadingRef.current[type] = false;
    if (successCount > 0) {
      toast.success(`${successCount} ${type} screenshot${successCount > 1 ? "s" : ""} uploaded`);
    }
    if (successCount < queue.length) {
      toast.error(`${queue.length - successCount} ${type} screenshot(s) failed to upload`);
    }
  };

  const handleSaveBooking = async () => {
    // The ONE hard requirement: at least one Advance Payment screenshot.
    if (!(paymentScreenshots.advance || []).length) {
      return toast.error("Attach the Advance Payment screenshot before creating this booking");
    }
    if (savingRef.current) return;
    savingRef.current = true;
    const mainTraveller = travellers[0];

    const coTravellerRows = travellers.slice(1);

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
    const raisedByStaff = (staffList || []).find((s) => s._id === raisedByStaffId);
    const addonsDetail = selectedAddons.map((a) => ({
      label: a.trainName
        ? `${a.trainName} (${a.trainNo})${a.tripType ? ` - ${a.tripType}` : ""}`
        : a.flightNo
          ? `${a.airline || "Flight"} (${a.flightNo})${a.tripType ? ` - ${a.tripType}` : ""}`
          : "",
      name: a.name,
      amount: a.amount || 0,
    }));

    setSaving(true);
    try {
      const result = await saveAadhaarUpload({
        tourId,
        packageType: packageTypeStr,
        packageKind: packageSelection.type,
        variantPackageIndex: packageSelection.type === "variant" ? packageSelection.variantIndex : null,
        boardingPoint: boardingPointStr,
        deboardingPoint: deboardingPointStr,
        addons: addonsStr,
        addonsDetail,
        remarks: remarks.trim(),
        raisedBy: {
          name: raisedByStaff?.fullName || "",
          employeeId: raisedByStaff?.employeeId || "",
        },
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
          addressLine1: mainTraveller.addressLine1,
          addressLine2: mainTraveller.addressLine2,
          city: mainTraveller.city,
          state: mainTraveller.state,
          pincode: mainTraveller.pincode,
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
          addressLine1: t.addressLine1,
          addressLine2: t.addressLine2,
          city: t.city,
          state: t.state,
          pincode: t.pincode,
          front: t.front,
        })),
        advanceScreenshots: paymentScreenshots.advance || [],
      });

      if (!result?.success) return;

      toast.success("Booking saved. Find it on the All Bookings page.");

      setTourId("");
      setTourInfo(null);
      setTravellers([blankTraveller(true)]);
      setPaymentScreenshots({});
      setPaymentFiles({});
      setPaymentAmounts({});
      setPaymentRemarks({});
    } catch (err) {
      console.error("handleSaveBooking error:", err);
      toast.error("Could not save this booking. Please try again.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-slate-50 to-sky-50 py-4 px-2.5 sm:py-8 sm:px-4">
      <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-sky-300/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-purple-200/30 blur-3xl" />

      <div className="relative max-w-5xl mx-auto bg-white/90 backdrop-blur-sm shadow-2xl shadow-indigo-200/50 rounded-2xl sm:rounded-[2rem] border border-white ring-1 ring-indigo-100 overflow-hidden">
        <div className="h-1.5 sm:h-2 bg-gradient-to-r from-indigo-600 via-violet-500 to-sky-500" />

        <div className="p-3.5 sm:p-6 md:p-8">
          <ToastContainer position="top-right" autoClose={4000} />

          <div className="flex items-center gap-3 sm:gap-4 border-b border-gray-100 pb-4 sm:pb-6 mb-4 sm:mb-6">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 blur-md opacity-40" />
              <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-indigo-300/60 ring-2 ring-white">
                <UserPlus className="w-5.5 h-5.5 sm:w-7 sm:h-7" />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight truncate bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                Aadhaar Upload
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Walk-in bookings, read straight off the Aadhaar card</p>
            </div>
          </div>

          <div className="mb-5 sm:mb-6">
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="w-4 h-4 text-indigo-500" /> Select Tour *
            </label>
            <div className="relative">
              <select
                value={tourId}
                onChange={(e) => setTourId(e.target.value)}
                className="w-full appearance-none pl-3.5 sm:pl-4 pr-10 sm:pr-11 py-3 sm:py-3.5 bg-gradient-to-br from-indigo-50/70 to-white border-2 border-indigo-100 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-sm sm:text-base font-semibold text-gray-800 truncate transition-all cursor-pointer"
              >
                <option value="">-- Select a tour --</option>
                {tourList?.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-indigo-400" />
            </div>
          </div>

          <div className="grid grid-cols-3 sm:flex sm:flex-row gap-1.5 sm:gap-2 p-1.5 bg-gradient-to-br from-gray-100 to-indigo-50/60 rounded-2xl mb-6 sm:mb-8 w-full sm:w-fit ring-1 ring-black/5">
            <button
              onClick={() => setActiveTab("save")}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-5 py-2.5 rounded-xl font-bold text-[11px] sm:text-sm leading-tight text-center transition-all sm:flex-none ${activeTab === "save"
                ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-300/60"
                : "text-gray-500 hover:text-indigo-600 hover:bg-white/60"
                }`}
            >
              <UserPlus className="w-[18px] h-[18px] sm:w-4 sm:h-4 shrink-0" /> <span>Save Booking</span>
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-5 py-2.5 rounded-xl font-bold text-[11px] sm:text-sm leading-tight text-center transition-all sm:flex-none ${activeTab === "all"
                ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-300/60"
                : "text-gray-500 hover:text-indigo-600 hover:bg-white/60"
                }`}
            >
              <BookOpenCheck className="w-[18px] h-[18px] sm:w-4 sm:h-4 shrink-0" /> <span>All Bookings</span>
            </button>
            <button
              onClick={() => setActiveTab("user")}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-5 py-2.5 rounded-xl font-bold text-[11px] sm:text-sm leading-tight text-center transition-all sm:flex-none ${activeTab === "user"
                ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-300/60"
                : "text-gray-500 hover:text-indigo-600 hover:bg-white/60"
                }`}
            >
              <Search className="w-[18px] h-[18px] sm:w-4 sm:h-4 shrink-0" /> <span>User Bookings</span>
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
              deleteGroupPayment={deleteGroupPayment}
              uploadUserTravellerAadhaar={uploadUserTravellerAadhaar}
              linkGroupTnr={linkGroupTnr}
              editAadhaarTraveller={editAadhaarTraveller}
              deleteAadhaarTraveller={deleteAadhaarTraveller}
              linkGuestTnr={linkGuestTnr}
              unlinkGuestTnr={unlinkGuestTnr}
              deleteBookingByTnr={deleteBookingByTnr}
              navigate={navigate}
              tourId={tourId}
              tourTitle={tourInfo?.title}
            />
          )}

          {tourId && activeTab === "user" && (
            <UserBookingsTab
              tourId={tourId}
              searchUserBookings={searchUserBookings}
              uploadUserTravellerAadhaar={uploadUserTravellerAadhaar}
              uploadUserBookingPayment={uploadUserBookingPayment}
              deleteGroupPayment={deleteGroupPayment}
              extractAadhaar={extractAadhaar}
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
                    staffList={staffList}
                    raisedByStaffId={raisedByStaffId}
                    setRaisedByStaffId={setRaisedByStaffId}
                  />

                  <TravellerCard
                    traveller={travellers[0]}
                    index={0}
                    isMain={true}
                    setTravellerFrontFile={setTravellerFrontFile}
                    setTravellerBackFile={setTravellerBackFile}
                    extractTravellerAadhaar={extractTravellerAadhaar}
                    clearTravellerAadhaar={clearTravellerAadhaar}
                    handleTravellerChange={handleTravellerChange}
                  />

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
                      clearTravellerAadhaar={clearTravellerAadhaar}
                      handleTravellerChange={handleTravellerChange}
                    />
                  ))}

                  <button
                    onClick={addCoTraveller}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 mb-8 border-2 border-dashed border-indigo-300 text-indigo-700 rounded-2xl font-semibold text-sm hover:bg-indigo-50 transition-all"
                  >
                    <PlusCircle className="w-4.5 h-4.5" />
                    Add Co-Traveller
                  </button>

                  <div className="mb-8">
                    <h3 className="flex items-center gap-2 font-bold text-gray-800 text-lg mb-4">
                      <IndianRupee className="w-6 h-6 text-indigo-600" /> Advance Payment Screenshot <span className="text-red-500">*</span>
                      <span className="text-xs font-normal text-gray-400">
                        (required to create this booking — OCR tries to read the amount automatically, type it in only if OCR misses)
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {paymentSlots.map(({ type, label, cardClass }) => {
                        const uploaded = paymentScreenshots[type] || [];
                        const queue = paymentFiles[type] || [];
                        const amounts = paymentAmounts[type] || [];
                        const remarksQueue = paymentRemarks[type] || [];
                        const progress = paymentLoading[type];
                        return (
                          <div
                            key={type}
                            className={`min-w-0 w-full p-4 sm:p-5 rounded-2xl border shadow-sm ${uploaded.length > 0 ? "bg-green-50 border-green-300" : `${cardClass} border`}`}
                          >
                            <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-3">
                              <FileImage className="w-5 h-5" /> {label}
                            </h4>

                            {uploaded.length > 0 && (
                              <div className="flex flex-col gap-1 mb-3">
                                {uploaded.map((u, i) => (
                                  <button
                                    type="button"
                                    key={i}
                                    onClick={() =>
                                      setPaymentViewerIndex((prev) => ({ ...prev, [type]: i }))
                                    }
                                    className="flex items-center gap-2 text-sm text-green-700 font-medium hover:underline text-left"
                                  >
                                    <CheckCircle2 className="w-4 h-4 shrink-0" /> #{i + 1}
                                    {u.amount ? ` — ₹${u.amount}` : " — amount not entered"}
                                    {u.remarks ? ` — ${u.remarks}` : ""}
                                  </button>
                                ))}
                              </div>
                            )}
                            <ScreenshotViewer
                              items={uploaded}
                              index={paymentViewerIndex[type] ?? null}
                              onClose={() => setPaymentViewerIndex((prev) => ({ ...prev, [type]: null }))}
                              onNav={(i) => setPaymentViewerIndex((prev) => ({ ...prev, [type]: i }))}
                            />

                            {queue.length > 0 && (
                              <div className="flex flex-col gap-1.5 mb-2.5">
                                {queue.map((f, i) => (
                                  <div key={i} className="flex flex-col gap-1.5 p-2 bg-white border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-1.5">
                                      <div className="flex-1 min-w-0 flex items-center gap-1.5 text-xs font-semibold text-gray-700 px-1 py-1">
                                        <FileImage className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                                        <span className="truncate">{f.name}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPaymentFiles((prev) => ({
                                            ...prev,
                                            [type]: (prev[type] || []).filter((_, idx) => idx !== i),
                                          }));
                                          setPaymentAmounts((prev) => ({
                                            ...prev,
                                            [type]: (prev[type] || []).filter((_, idx) => idx !== i),
                                          }));
                                          setPaymentRemarks((prev) => ({
                                            ...prev,
                                            [type]: (prev[type] || []).filter((_, idx) => idx !== i),
                                          }));
                                        }}
                                        disabled={!!progress}
                                        title="Remove from queue"
                                        className="shrink-0 p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 transition-colors"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <input
                                      type="number"
                                      placeholder="₹ (optional — OCR tries first)"
                                      value={amounts[i] || ""}
                                      onChange={(e) =>
                                        setPaymentAmounts((prev) => ({
                                          ...prev,
                                          [type]: (prev[type] || []).map((a, idx) => (idx === i ? e.target.value : a)),
                                        }))
                                      }
                                      disabled={!!progress}
                                      className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Bank (e.g. SBI)"
                                      value={remarksQueue[i] || ""}
                                      onChange={(e) =>
                                        setPaymentRemarks((prev) => ({
                                          ...prev,
                                          [type]: (prev[type] || []).map((r, idx) => (idx === i ? e.target.value : r)),
                                        }))
                                      }
                                      disabled={!!progress}
                                      className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            <label className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 bg-white border border-dashed border-gray-300 rounded-lg px-3 py-3 mb-2.5 cursor-pointer hover:border-indigo-400">
                              <Upload className="w-3.5 h-3.5" />
                              {queue.length > 0 ? "Add more screenshot(s)" : "Choose screenshot(s)"}
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  if (!files.length) return;
                                  setPaymentFiles((prev) => ({ ...prev, [type]: [...(prev[type] || []), ...files] }));
                                  setPaymentAmounts((prev) => ({
                                    ...prev,
                                    [type]: [...(prev[type] || []), ...files.map(() => "")],
                                  }));
                                  setPaymentRemarks((prev) => ({
                                    ...prev,
                                    [type]: [...(prev[type] || []), ...files.map(() => "")],
                                  }));
                                  e.target.value = "";
                                }}
                              />
                            </label>

                            {queue.length > 0 && (
                              <button
                                onClick={() => handlePaymentUpload(type)}
                                disabled={!!progress}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-semibold transition-colors"
                              >
                                {progress ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                {progress
                                  ? `Uploading ${progress.current} of ${progress.total}...`
                                  : `Upload ${queue.length > 1 ? `All (${queue.length})` : ""}`}
                              </button>
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
    </div>
  );
};

export default AadhaarUpload;
