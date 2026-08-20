// /* eslint-disable react-hooks/exhaustive-deps */
// import React, { useContext, useEffect, useState } from "react";
// import { TourAdminContext } from "../../context/TourAdminContext";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { format } from "date-fns";
// import {
//   ChevronDown,
//   ChevronUp,
//   Search,
//   RefreshCw,
//   Loader2,
//   Users,
//   ArrowRightLeft,
//   Calendar,
// } from "lucide-react";

// const BookingApprovals = () => {
//   const {
//     pendingApprovals = [],
//     getPendingApprovals,
//     approveBookingUpdate,
//     rejectBookingUpdate,
//     aToken,
//   } = useContext(TourAdminContext);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredApprovals, setFilteredApprovals] = useState([]);
//   const [expanded, setExpanded] = useState({});
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [actionLoading, setActionLoading] = useState(false);

//   useEffect(() => {
//     if (aToken) getPendingApprovals();
//   }, [aToken]);

//   useEffect(() => {
//     const term = searchTerm.toLowerCase().trim();
//     const filtered = pendingApprovals.filter((item) => {
//       const traveller = item.travellers?.[0] || {};
//       const fullName = `${traveller.title || ""} ${traveller.firstName || ""} ${traveller.lastName || ""}`
//         .toLowerCase()
//         .trim();
//       const mobile = (item.contact?.mobile || "").toLowerCase();
//       return fullName.includes(term) || mobile.includes(term);
//     });
//     setFilteredApprovals(filtered);
//   }, [pendingApprovals, searchTerm]);

//   const toggleExpand = (id) => {
//     setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
//   };

//   const getDiffColor = (oldVal, newVal) => {
//     if (oldVal === newVal || newVal === undefined) return "text-gray-800";
//     if (
//       (typeof newVal === "string" && newVal !== oldVal) ||
//       (typeof newVal === "number" && newVal > oldVal)
//     ) {
//       return "text-emerald-600 font-medium";
//     }
//     return "text-rose-600 font-medium";
//   };

//   const renderPoint = (point) =>
//     point ? `${point.stationCode} - ${point.stationName}` : "—";

//   const getCancellationStatus = (traveller) => {
//     const byTraveller = traveller.cancelled?.byTraveller;
//     const byAdmin = traveller.cancelled?.byAdmin;

//     if (byTraveller && !byAdmin) {
//       return {
//         text: "Applied for Cancellation",
//         color: "bg-yellow-100 text-yellow-800 border-yellow-300",
//       };
//     }
//     if (byTraveller && byAdmin) {
//       return {
//         text: "Traveller Cancelled",
//         color: "bg-red-100 text-red-800 border-red-300",
//       };
//     }
//     if (byAdmin && !byTraveller) {
//       return {
//         text: "Traveller Rejected",
//         color: "bg-orange-100 text-orange-800 border-orange-300",
//       };
//     }
//     return null;
//   };

//   const handleRefresh = async () => {
//     setIsRefreshing(true);
//     await getPendingApprovals();
//     setTimeout(() => setIsRefreshing(false), 800);
//   };

//   const handleApprove = async (bookingId) => {
//     if (!window.confirm("Approve these changes?")) return;

//     setActionLoading(true);
//     try {
//       const res = await approveBookingUpdate(bookingId);
//       if (res?.success) {
//         toast.success("Changes approved successfully 🌟");
//         getPendingApprovals();
//       } else {
//         toast.error(res?.message || "Approval failed");
//       }
//     } catch (err) {
//       toast.error("Error while approving");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleReject = async (bookingId) => {
//     if (!window.confirm("Reject this update request?")) return;

//     setActionLoading(true);
//     try {
//       const res = await rejectBookingUpdate(bookingId, "Rejected by admin");
//       if (res?.success) {
//         toast.success("Request rejected successfully");
//         getPendingApprovals();
//       } else {
//         toast.error(res?.message || "Rejection failed");
//       }
//     } catch (err) {
//       toast.error("Error while rejecting");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-50/40 via-purple-50/20 to-white p-4 md:p-6">
//       <div className="max-w-6xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200/70 overflow-hidden mb-8">
//           <div className="px-5 py-7 md:px-8 md:py-9 flex flex-col items-center">
//             {/* Icon + Title combo */}
//             <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-6">
//               <div className="relative">
//                 <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-sm">
//                   <Calendar className="text-indigo-600" size={40} />
//                 </div>
//               </div>

//               <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
//                 Pending Booking Approvals
//               </h1>
//             </div>

//             {/* Search + count + refresh */}
//             <div className="w-full max-w-4xl">
//               <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-6">
//                 {/* Search */}
//                 <div className="relative flex-1">
//                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                     <Search className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Search by name or mobile..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full pl-11 pr-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl 
//                      text-gray-700 placeholder-gray-400 focus:outline-none 
//                      focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all shadow-sm"
//                   />
//                 </div>

//                 {/* Count + Refresh */}
//                 <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center md:justify-end">
//                   <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
//                     {filteredApprovals.length === 0
//                       ? "No pending approvals"
//                       : `${filteredApprovals.length} pending approval${filteredApprovals.length !== 1 ? "s" : ""}`}
//                   </div>

//                   <button
//                     onClick={handleRefresh}
//                     disabled={isRefreshing}
//                     className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 
//                      disabled:bg-indigo-400 disabled:cursor-not-allowed
//                      text-white font-medium rounded-xl shadow-md transition-all"
//                   >
//                     {isRefreshing ? (
//                       <>
//                         <Loader2 className="h-4 w-4 animate-spin" />
//                         Refreshing...
//                       </>
//                     ) : (
//                       <>
//                         <RefreshCw className="h-4 w-4" />
//                         Refresh List
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main content - cards */}
//         {!filteredApprovals.length ? (
//           <div className="bg-white/80 backdrop-blur rounded-3xl p-12 text-center shadow-lg border border-white/60">
//             <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center">
//               <Users className="text-indigo-500" size={40} />
//             </div>
//             <h3 className="text-2xl font-semibold text-gray-700 mb-3">All clear!</h3>
//             <p className="text-gray-500 text-lg">
//               No pending booking update requests right now 🌸
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {filteredApprovals.map((req) => {
//               const orig = req.bookingId || {};
//               const lead = req.travellers?.[0] || {};
//               const isExpanded = expanded[req._id];

//               return (
//                 <div
//                   key={req._id}
//                   className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 overflow-hidden transition-all hover:shadow-xl"
//                 >
//                   <div
//                     onClick={() => toggleExpand(req._id)}
//                     className="px-5 py-5 cursor-pointer flex items-center justify-between bg-gradient-to-r from-indigo-50/70 to-purple-50/50 hover:from-indigo-100/60 hover:to-purple-100/60 transition-colors"
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl shadow-sm">
//                         {lead.firstName?.[0]?.toUpperCase() || "?"}
//                       </div>
//                       <div>
//                         <h3 className="font-semibold text-lg text-gray-800">
//                           {lead.title} {lead.firstName} {lead.lastName}
//                         </h3>
//                         <div className="text-sm text-gray-600 mt-1">
//                           {req.contact?.mobile || "—"} • {req.travellers?.length || 1} traveller
//                           {req.travellers?.length !== 1 ? "s" : ""}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-4">
//                       <span className="hidden sm:inline text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium">
//                         {format(new Date(req.createdAt || Date.now()), "dd MMM • hh:mm a")}
//                       </span>
//                       {isExpanded ? (
//                         <ChevronUp className="text-gray-600" size={22} />
//                       ) : (
//                         <ChevronDown className="text-gray-600" size={22} />
//                       )}
//                     </div>
//                   </div>

//                   {isExpanded && (
//                     <div className="p-5 md:p-6 lg:grid lg:grid-cols-2 lg:gap-10">
//                       {/* Original */}
//                       <div className="pb-8 lg:pb-0 lg:pr-8">
//                         <h4 className="text-lg font-semibold text-gray-700 mb-5 flex items-center gap-2.5">
//                           <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
//                           Current Booking
//                         </h4>

//                         <div className="space-y-6">
//                           <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100">
//                             <div className="font-medium text-gray-700 mb-3">Payment</div>
//                             <div className="grid grid-cols-2 gap-6 text-sm">
//                               <div>
//                                 Advance:{" "}
//                                 <span className="font-semibold">
//                                   ₹{(orig.payment?.advance?.amount || 0).toLocaleString()}
//                                 </span>
//                               </div>
//                               <div>
//                                 Balance:{" "}
//                                 <span className="font-semibold">
//                                   ₹{(orig.payment?.balance?.amount || 0).toLocaleString()}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>

//                           <div>
//                             <div className="font-medium text-gray-700 mb-4">
//                               Travellers ({orig.travellers?.length || 0})
//                             </div>
//                             {orig.travellers?.map((t, i) => {
//                               const status = getCancellationStatus(t);
//                               return (
//                                 <div
//                                   key={i}
//                                   className="mb-5 last:mb-0 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 relative"
//                                 >
//                                   <div className="font-medium text-gray-800 mb-3">
//                                     {t.title} {t.firstName} {t.lastName}
//                                   </div>

//                                   {status && (
//                                     <span
//                                       className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-medium border ${status.color}`}
//                                     >
//                                       {status.text}
//                                     </span>
//                                   )}

//                                   <div className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm text-gray-600">
//                                     <div>Age: {t.age || "—"}</div>
//                                     <div>Gender: {t.gender || "—"}</div>
//                                     <div>
//                                       Package:{" "}
//                                       {t.packageType === "main"
//                                         ? "Main Package"
//                                         : `Variant ${t.variantPackageIndex ?? "?"}`}
//                                     </div>
//                                     <div>Sharing: {t.sharingType || "—"}</div>
//                                     <div>Boarding: {renderPoint(t.boardingPoint)}</div>
//                                     <div>Deboarding: {renderPoint(t.deboardingPoint)}</div>
//                                     <div>Add-on: {t.selectedAddon?.name || "None"}</div>
//                                     <div className="col-span-2">
//                                       Remarks: {t.remarks || "—"}
//                                     </div>
//                                   </div>
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         </div>
//                       </div>

//                       {/* Requested */}
//                       <div className="pt-8 lg:pt-0 lg:pl-8">
//                         <h4 className="text-lg font-semibold text-indigo-700 mb-5 flex items-center gap-2.5">
//                           <ArrowRightLeft className="text-indigo-400" size={20} />
//                           Requested Changes
//                         </h4>

//                         <div className="space-y-6">
//                           <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100/60">
//                             <div className="font-medium text-indigo-700 mb-3">Payment Update</div>
//                             <div className="grid grid-cols-2 gap-6 text-sm">
//                               <div>
//                                 Advance:{" "}
//                                 <span
//                                   className={getDiffColor(
//                                     orig.payment?.advance?.amount || 0,
//                                     req.updatedAdvance
//                                   )}
//                                 >
//                                   ₹{(req.updatedAdvance || 0).toLocaleString()}
//                                 </span>
//                               </div>
//                               <div>
//                                 Balance:{" "}
//                                 <span
//                                   className={getDiffColor(
//                                     orig.payment?.balance?.amount || 0,
//                                     req.updatedBalance
//                                   )}
//                                 >
//                                   ₹{(req.updatedBalance || 0).toLocaleString()}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>

//                           <div>
//                             <div className="font-medium text-indigo-700 mb-4">
//                               Travellers ({req.travellers?.length || 0})
//                             </div>

//                             {req.travellers?.map((t, i) => {
//                               const ot = orig.travellers?.[i] || {};

//                               const nameOld = `${ot.title || ""} ${ot.firstName || ""} ${ot.lastName || ""}`.trim();
//                               const nameNew = `${t.title || ""} ${t.firstName || ""} ${t.lastName || ""}`.trim();
//                               const nameChanged = nameOld !== nameNew;

//                               const status = getCancellationStatus(t);

//                               return (
//                                 <div
//                                   key={i}
//                                   className="mb-5 last:mb-0 p-5 bg-purple-50/30 rounded-2xl border border-purple-100/50 relative"
//                                 >
//                                   <div className="flex items-center gap-3 mb-4">
//                                     <div className="font-semibold text-gray-800 text-base">
//                                       {nameChanged ? (
//                                         <span className="text-emerald-600">
//                                           {t.title} {t.firstName} {t.lastName}
//                                         </span>
//                                       ) : (
//                                         <>
//                                           {t.title} {t.firstName} {t.lastName}
//                                         </>
//                                       )}
//                                     </div>
//                                     {nameChanged && (
//                                       <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
//                                         Name changed
//                                       </span>
//                                     )}
//                                   </div>

//                                   {status && (
//                                     <span
//                                       className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-medium border ${status.color}`}
//                                     >
//                                       {status.text}
//                                     </span>
//                                   )}

//                                   <div className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm text-gray-600">
//                                     <div>
//                                       Age:{" "}
//                                       <span className={getDiffColor(ot.age, t.age)}>
//                                         {t.age || "—"}
//                                       </span>
//                                     </div>
//                                     <div>
//                                       Gender:{" "}
//                                       <span className={getDiffColor(ot.gender, t.gender)}>
//                                         {t.gender || "—"}
//                                       </span>
//                                     </div>
//                                     <div>
//                                       Package:{" "}
//                                       <span
//                                         className={getDiffColor(ot.packageType, t.packageType)}
//                                       >
//                                         {t.packageType === "main"
//                                           ? "Main Package"
//                                           : `Variant ${t.variantPackageIndex ?? "?"}`}
//                                       </span>
//                                     </div>
//                                     <div>
//                                       Sharing:{" "}
//                                       <span
//                                         className={getDiffColor(ot.sharingType, t.sharingType)}
//                                       >
//                                         {t.sharingType || "—"}
//                                       </span>
//                                     </div>
//                                     <div>
//                                       Boarding:{" "}
//                                       <span
//                                         className={getDiffColor(
//                                           renderPoint(ot.boardingPoint),
//                                           renderPoint(t.boardingPoint)
//                                         )}
//                                       >
//                                         {renderPoint(t.boardingPoint)}
//                                       </span>
//                                     </div>
//                                     <div>
//                                       Deboarding:{" "}
//                                       <span
//                                         className={getDiffColor(
//                                           renderPoint(ot.deboardingPoint),
//                                           renderPoint(t.deboardingPoint)
//                                         )}
//                                       >
//                                         {renderPoint(t.deboardingPoint)}
//                                       </span>
//                                     </div>
//                                     <div>
//                                       Add-on:{" "}
//                                       <span
//                                         className={getDiffColor(
//                                           ot.selectedAddon?.name,
//                                           t.selectedAddon?.name
//                                         )}
//                                       >
//                                         {t.selectedAddon?.name || "None"}
//                                       </span>
//                                     </div>
//                                     <div className="col-span-2">
//                                       Remarks:{" "}
//                                       <span className={getDiffColor(ot.remarks, t.remarks)}>
//                                         {t.remarks || "—"}
//                                       </span>
//                                     </div>
//                                   </div>
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         </div>

//                         <div className="mt-10 flex flex-col sm:flex-row gap-4">
//                           <button
//                             onClick={() => handleApprove(req.bookingId?._id || req.bookingId)}
//                             disabled={actionLoading}
//                             className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-medium shadow-md hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-60 transition-all"
//                           >
//                             Approve Changes
//                           </button>
//                           <button
//                             onClick={() => handleReject(req.bookingId?._id || req.bookingId)}
//                             disabled={actionLoading}
//                             className="flex-1 py-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-2xl font-medium shadow-md hover:from-rose-600 hover:to-rose-700 disabled:opacity-60 transition-all"
//                           >
//                             Reject Request
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         <ToastContainer
//           position="top-center"
//           autoClose={4000}
//           hideProgressBar={false}
//           newestOnTop
//           closeOnClick
//           rtl={false}
//           pauseOnFocusLoss
//           draggable
//           pauseOnHover
//           theme="light"
//         />
//       </div>
//     </div>
//   );
// };

// export default BookingApprovals;


/* eslint-disable react-hooks/exhaustive-deps */
// import React, { useContext, useEffect, useState } from "react";
// import { TourAdminContext } from "../../context/TourAdminContext";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { format } from "date-fns";
// import {
//   ChevronDown,
//   ChevronUp,
//   Search,
//   RefreshCw,
//   Loader2,
//   Users,
//   ArrowRightLeft,
//   Calendar,
// } from "lucide-react";

// const BookingApprovals = () => {
//   const {
//     pendingApprovals = [],
//     getPendingApprovals,
//     approveBookingUpdate,
//     rejectBookingUpdate,
//     aToken,
//   } = useContext(TourAdminContext);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredApprovals, setFilteredApprovals] = useState([]);
//   const [expanded, setExpanded] = useState({});
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [actionLoading, setActionLoading] = useState(false);

//   useEffect(() => {
//     if (aToken) getPendingApprovals();
//   }, [aToken]);

//   useEffect(() => {
//     const term = searchTerm.toLowerCase().trim();
//     const filtered = pendingApprovals.filter((item) => {
//       const traveller = item.travellers?.[0] || {};
//       const fullName = `${traveller.title || ""} ${traveller.firstName || ""} ${traveller.lastName || ""}`
//         .toLowerCase()
//         .trim();
//       const mobile = (item.contact?.mobile || "").toLowerCase();
//       return fullName.includes(term) || mobile.includes(term);
//     });
//     setFilteredApprovals(filtered);
//   }, [pendingApprovals, searchTerm]);

//   const toggleExpand = (id) => {
//     setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
//   };

//   const getDiffColor = (oldVal, newVal) => {
//     if (oldVal === newVal || newVal === undefined) return "text-gray-800";
//     if (
//       (typeof newVal === "string" && newVal !== oldVal) ||
//       (typeof newVal === "number" && newVal > oldVal)
//     ) {
//       return "text-emerald-600 font-medium";
//     }
//     return "text-rose-600 font-medium";
//   };

//   const renderPoint = (point) =>
//     point ? `${point.stationCode} - ${point.stationName}` : "—";

//   const getCancellationStatus = (traveller) => {
//     const byTraveller = traveller.cancelled?.byTraveller;
//     const byAdmin = traveller.cancelled?.byAdmin;

//     if (byTraveller && !byAdmin) {
//       return {
//         text: "Applied for Cancellation",
//         color: "bg-yellow-100 text-yellow-800 border-yellow-300",
//       };
//     }
//     if (byTraveller && byAdmin) {
//       return {
//         text: "Traveller Cancelled",
//         color: "bg-red-100 text-red-800 border-red-300",
//       };
//     }
//     if (byAdmin && !byTraveller) {
//       return {
//         text: "Traveller Rejected",
//         color: "bg-orange-100 text-orange-800 border-orange-300",
//       };
//     }
//     return null;
//   };

//   // ─────────────────────────────────────────────────────────────
//   // Old bookings: t.selectedAddon is a flat single object
//   //   { name, price }.
//   // New bookings: t.selectedAddons is an array of train/flight-wise
//   //   addons, each { tripKind, trainName/airline, trainNo/flightNo,
//   //   tripType, name, amount }.
//   // Whichever is populated for a given traveller is what gets
//   // rendered — this is display-only, no calculation/algorithm here.
//   // ─────────────────────────────────────────────────────────────
//   const getTripTypeStyle = (tripType) => {
//     const t = (tripType || "").toUpperCase();
//     if (t.startsWith("BOARD")) {
//       return { badge: "bg-blue-100 text-blue-700", label: "Boarding" };
//     }
//     if (t.startsWith("MIDDLE")) {
//       return { badge: "bg-purple-100 text-purple-700", label: "Middle" };
//     }
//     if (t.startsWith("DEBOARD") || t.startsWith("DEBOARF")) {
//       return { badge: "bg-orange-100 text-orange-700", label: "Deboarding" };
//     }
//     return { badge: "bg-gray-100 text-gray-700", label: tripType || "Trip" };
//   };

//   // Fixed journey order for display — Boarding first, then Middle
//   // (multiple middles keep their relative order via tripIndex, falling
//   // back to original array position), then Deboarding last. This is a
//   // DISPLAY-ONLY sort — it never touches t.selectedAddons itself, so
//   // saving/approving is unaffected. Ensures every traveller's addon
//   // list reads in the same natural trip sequence, regardless of the
//   // order addons happened to be selected/stored in.
//   const tripOrderRank = (tripType) => {
//     const t = (tripType || "").toUpperCase();
//     if (t.startsWith("BOARD")) return 0;
//     if (t.startsWith("MIDDLE")) return 1;
//     if (t.startsWith("DEBOARD") || t.startsWith("DEBOARF")) return 2;
//     return 3;
//   };

//   const findMatchingOldAddon = (oldAddons, a) => {
//     if (!Array.isArray(oldAddons)) return null;
//     return (
//       oldAddons.find((o) => {
//         if (
//           o.tripKind &&
//           a.tripKind &&
//           o.tripIndex !== undefined &&
//           a.tripIndex !== undefined
//         ) {
//           return o.tripKind === a.tripKind && o.tripIndex === a.tripIndex;
//         }
//         if (a.tripKind === "flight" || o.flightNo || o.airline) {
//           return o.flightNo === a.flightNo && o.airline === a.airline;
//         }
//         return o.trainNo === a.trainNo && o.trainName === a.trainName;
//       }) || null
//     );
//   };

//   // t = the (possibly updated) traveller being displayed.
//   // ot = the ORIGINAL traveller to diff against — omit for the
//   // Current Booking column (no diffing there, always neutral style).
//   const renderAddonLine = (t, ot) => {
//     if (Array.isArray(t.selectedAddons) && t.selectedAddons.length > 0) {
//       const ordered = t.selectedAddons
//         .map((a, originalIndex) => ({ a, originalIndex }))
//         .sort((x, y) => {
//           const rankDiff = tripOrderRank(x.a.tripType) - tripOrderRank(y.a.tripType);
//           if (rankDiff !== 0) return rankDiff;
//           const xi = x.a.tripIndex ?? x.a.trainIndex ?? x.originalIndex;
//           const yi = y.a.tripIndex ?? y.a.trainIndex ?? y.originalIndex;
//           return xi - yi;
//         });

//       return (
//         <div className="space-y-1.5">
//           {ordered.map(({ a }, i) => {
//             const tripLabel =
//               a.tripKind === "flight"
//                 ? `${a.airline || ""} (${a.flightNo || ""})`
//                 : `${a.trainName || ""} (${a.trainNo || ""})`;
//             const style = getTripTypeStyle(a.tripType);

//             const oldMatch = ot
//               ? findMatchingOldAddon(ot.selectedAddons, a)
//               : null;
//             const changed = ot
//               ? !oldMatch ||
//                 oldMatch.name !== a.name ||
//                 Number(oldMatch.amount) !== Number(a.amount)
//               : false;

//             return (
//               <div
//                 key={i}
//                 className={`flex flex-wrap items-center gap-2 ${changed ? "text-emerald-600 font-medium" : ""}`}
//               >
//                 <span
//                   className={`px-2 py-0.5 rounded-full text-xs font-semibold ${style.badge}`}
//                 >
//                   {style.label}
//                 </span>
//                 <span className={changed ? "" : "text-gray-800"}>
//                   {tripLabel}: {a.name}
//                 </span>
//                 <span
//                   className={`font-semibold ${changed ? "" : "text-green-700"}`}
//                 >
//                   +₹{a.amount || 0}
//                 </span>
//               </div>
//             );
//           })}
//         </div>
//       );
//     }
//     if (!t.selectedAddon?.name) return "None";

//     const oldFlat = ot?.selectedAddon;
//     const changed = ot
//       ? !oldFlat ||
//         oldFlat.name !== t.selectedAddon.name ||
//         Number(oldFlat.price) !== Number(t.selectedAddon.price)
//       : false;

//     return (
//       <span className={changed ? "text-emerald-600 font-medium" : ""}>
//         <span className={changed ? "" : "text-gray-800"}>
//           {t.selectedAddon.name}
//         </span>{" "}
//         <span className={`font-semibold ${changed ? "" : "text-green-700"}`}>
//           (+₹{t.selectedAddon.price || 0})
//         </span>
//       </span>
//     );
//   };

//   // Stable string used only for diff-color comparison (old vs new),
//   // covering both flat and trip-wise shapes.
//   const addonSignature = (t) =>
//     JSON.stringify(t?.selectedAddons?.length ? t.selectedAddons : (t?.selectedAddon || null));

//   const handleRefresh = async () => {
//     setIsRefreshing(true);
//     await getPendingApprovals();
//     setTimeout(() => setIsRefreshing(false), 800);
//   };

//   const handleApprove = async (bookingId) => {
//     if (!window.confirm("Approve these changes?")) return;

//     setActionLoading(true);
//     try {
//       const res = await approveBookingUpdate(bookingId);
//       if (res?.success) {
//         toast.success("Changes approved successfully 🌟");
//         getPendingApprovals();
//       } else {
//         toast.error(res?.message || "Approval failed");
//       }
//     } catch (err) {
//       toast.error("Error while approving");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleReject = async (bookingId) => {
//     if (!window.confirm("Reject this update request?")) return;

//     setActionLoading(true);
//     try {
//       const res = await rejectBookingUpdate(bookingId, "Rejected by admin");
//       if (res?.success) {
//         toast.success("Request rejected successfully");
//         getPendingApprovals();
//       } else {
//         toast.error(res?.message || "Rejection failed");
//       }
//     } catch (err) {
//       toast.error("Error while rejecting");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-50/40 via-purple-50/20 to-white p-4 md:p-6">
//       <div className="max-w-6xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200/70 overflow-hidden mb-8">
//           <div className="px-5 py-7 md:px-8 md:py-9 flex flex-col items-center">
//             {/* Icon + Title combo */}
//             <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-6">
//               <div className="relative">
//                 <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-sm">
//                   <Calendar className="text-indigo-600" size={40} />
//                 </div>
//               </div>

//               <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
//                 Pending Booking Approvals
//               </h1>
//             </div>

//             {/* Search + count + refresh */}
//             <div className="w-full max-w-4xl">
//               <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-6">
//                 {/* Search */}
//                 <div className="relative flex-1">
//                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                     <Search className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Search by name or mobile..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full pl-11 pr-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl 
//                      text-gray-700 placeholder-gray-400 focus:outline-none 
//                      focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all shadow-sm"
//                   />
//                 </div>

//                 {/* Count + Refresh */}
//                 <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center md:justify-end">
//                   <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
//                     {filteredApprovals.length === 0
//                       ? "No pending approvals"
//                       : `${filteredApprovals.length} pending approval${filteredApprovals.length !== 1 ? "s" : ""}`}
//                   </div>

//                   <button
//                     onClick={handleRefresh}
//                     disabled={isRefreshing}
//                     className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 
//                      disabled:bg-indigo-400 disabled:cursor-not-allowed
//                      text-white font-medium rounded-xl shadow-md transition-all"
//                   >
//                     {isRefreshing ? (
//                       <>
//                         <Loader2 className="h-4 w-4 animate-spin" />
//                         Refreshing...
//                       </>
//                     ) : (
//                       <>
//                         <RefreshCw className="h-4 w-4" />
//                         Refresh List
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main content - cards */}
//         {!filteredApprovals.length ? (
//           <div className="bg-white/80 backdrop-blur rounded-3xl p-12 text-center shadow-lg border border-white/60">
//             <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center">
//               <Users className="text-indigo-500" size={40} />
//             </div>
//             <h3 className="text-2xl font-semibold text-gray-700 mb-3">All clear!</h3>
//             <p className="text-gray-500 text-lg">
//               No pending booking update requests right now 🌸
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {filteredApprovals.map((req) => {
//               const orig = req.bookingId || {};
//               const lead = req.travellers?.[0] || {};
//               const isExpanded = expanded[req._id];

//               return (
//                 <div
//                   key={req._id}
//                   className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 overflow-hidden transition-all hover:shadow-xl"
//                 >
//                   <div
//                     onClick={() => toggleExpand(req._id)}
//                     className="px-5 py-5 cursor-pointer flex items-center justify-between bg-gradient-to-r from-indigo-50/70 to-purple-50/50 hover:from-indigo-100/60 hover:to-purple-100/60 transition-colors"
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl shadow-sm">
//                         {lead.firstName?.[0]?.toUpperCase() || "?"}
//                       </div>
//                       <div>
//                         <h3 className="font-semibold text-lg text-gray-800">
//                           {lead.title} {lead.firstName} {lead.lastName}
//                         </h3>
//                         <div className="text-sm text-gray-600 mt-1">
//                           {req.contact?.mobile || "—"} • {req.travellers?.length || 1} traveller
//                           {req.travellers?.length !== 1 ? "s" : ""}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-4">
//                       <span className="hidden sm:inline text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium">
//                         {format(new Date(req.createdAt || Date.now()), "dd MMM • hh:mm a")}
//                       </span>
//                       {isExpanded ? (
//                         <ChevronUp className="text-gray-600" size={22} />
//                       ) : (
//                         <ChevronDown className="text-gray-600" size={22} />
//                       )}
//                     </div>
//                   </div>

//                   {isExpanded && (
//                     <div className="p-5 md:p-6 lg:grid lg:grid-cols-2 lg:gap-10">
//                       {/* Original */}
//                       <div className="pb-8 lg:pb-0 lg:pr-8">
//                         <h4 className="text-lg font-semibold text-gray-700 mb-5 flex items-center gap-2.5">
//                           <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
//                           Current Booking
//                         </h4>

//                         <div className="space-y-6">
//                           <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100">
//                             <div className="font-medium text-gray-700 mb-3">Payment</div>
//                             <div className="grid grid-cols-2 gap-6 text-sm">
//                               <div>
//                                 Advance:{" "}
//                                 <span className="font-semibold">
//                                   ₹{(orig.payment?.advance?.amount || 0).toLocaleString()}
//                                 </span>
//                               </div>
//                               <div>
//                                 Balance:{" "}
//                                 <span className="font-semibold">
//                                   ₹{(orig.payment?.balance?.amount || 0).toLocaleString()}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>

//                           <div>
//                             <div className="font-medium text-gray-700 mb-4">
//                               Travellers ({orig.travellers?.length || 0})
//                             </div>
//                             {orig.travellers?.map((t, i) => {
//                               const status = getCancellationStatus(t);
//                               return (
//                                 <div
//                                   key={i}
//                                   className="mb-5 last:mb-0 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 relative"
//                                 >
//                                   <div className="font-medium text-gray-800 mb-3">
//                                     {t.title} {t.firstName} {t.lastName}
//                                   </div>

//                                   {status && (
//                                     <span
//                                       className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-medium border ${status.color}`}
//                                     >
//                                       {status.text}
//                                     </span>
//                                   )}

//                                   <div className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm text-gray-600">
//                                     <div>Age: {t.age || "—"}</div>
//                                     <div>Gender: {t.gender || "—"}</div>
//                                     <div>
//                                       Package:{" "}
//                                       {t.packageType === "main"
//                                         ? "Main Package"
//                                         : `Variant ${t.variantPackageIndex ?? "?"}`}
//                                     </div>
//                                     <div>Sharing: {t.sharingType || "—"}</div>
//                                     <div>Boarding: {renderPoint(t.boardingPoint)}</div>
//                                     <div>Deboarding: {renderPoint(t.deboardingPoint)}</div>
//                                     <div className="col-span-2">
//                                       Add-on: {renderAddonLine(t)}
//                                     </div>
//                                     <div className="col-span-2">
//                                       Remarks: {t.remarks || "—"}
//                                     </div>
//                                   </div>
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         </div>
//                       </div>

//                       {/* Requested */}
//                       <div className="pt-8 lg:pt-0 lg:pl-8">
//                         <h4 className="text-lg font-semibold text-indigo-700 mb-5 flex items-center gap-2.5">
//                           <ArrowRightLeft className="text-indigo-400" size={20} />
//                           Requested Changes
//                         </h4>

//                         <div className="space-y-6">
//                           <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100/60">
//                             <div className="font-medium text-indigo-700 mb-3">Payment Update</div>
//                             <div className="grid grid-cols-2 gap-6 text-sm">
//                               <div>
//                                 Advance:{" "}
//                                 <span
//                                   className={getDiffColor(
//                                     orig.payment?.advance?.amount || 0,
//                                     req.updatedAdvance
//                                   )}
//                                 >
//                                   ₹{(req.updatedAdvance || 0).toLocaleString()}
//                                 </span>
//                               </div>
//                               <div>
//                                 Balance:{" "}
//                                 <span
//                                   className={getDiffColor(
//                                     orig.payment?.balance?.amount || 0,
//                                     req.updatedBalance
//                                   )}
//                                 >
//                                   ₹{(req.updatedBalance || 0).toLocaleString()}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>

//                           <div>
//                             <div className="font-medium text-indigo-700 mb-4">
//                               Travellers ({req.travellers?.length || 0})
//                             </div>

//                             {req.travellers?.map((t, i) => {
//                               const ot = orig.travellers?.[i] || {};

//                               const nameOld = `${ot.title || ""} ${ot.firstName || ""} ${ot.lastName || ""}`.trim();
//                               const nameNew = `${t.title || ""} ${t.firstName || ""} ${t.lastName || ""}`.trim();
//                               const nameChanged = nameOld !== nameNew;

//                               const status = getCancellationStatus(t);

//                               return (
//                                 <div
//                                   key={i}
//                                   className="mb-5 last:mb-0 p-5 bg-purple-50/30 rounded-2xl border border-purple-100/50 relative"
//                                 >
//                                   <div className="flex items-center gap-3 mb-4">
//                                     <div className="font-semibold text-gray-800 text-base">
//                                       {nameChanged ? (
//                                         <span className="text-emerald-600">
//                                           {t.title} {t.firstName} {t.lastName}
//                                         </span>
//                                       ) : (
//                                         <>
//                                           {t.title} {t.firstName} {t.lastName}
//                                         </>
//                                       )}
//                                     </div>
//                                     {nameChanged && (
//                                       <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
//                                         Name changed
//                                       </span>
//                                     )}
//                                   </div>

//                                   {status && (
//                                     <span
//                                       className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-medium border ${status.color}`}
//                                     >
//                                       {status.text}
//                                     </span>
//                                   )}

//                                   <div className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm text-gray-600">
//                                     <div>
//                                       Age:{" "}
//                                       <span className={getDiffColor(ot.age, t.age)}>
//                                         {t.age || "—"}
//                                       </span>
//                                     </div>
//                                     <div>
//                                       Gender:{" "}
//                                       <span className={getDiffColor(ot.gender, t.gender)}>
//                                         {t.gender || "—"}
//                                       </span>
//                                     </div>
//                                     <div>
//                                       Package:{" "}
//                                       <span
//                                         className={getDiffColor(ot.packageType, t.packageType)}
//                                       >
//                                         {t.packageType === "main"
//                                           ? "Main Package"
//                                           : `Variant ${t.variantPackageIndex ?? "?"}`}
//                                       </span>
//                                     </div>
//                                     <div>
//                                       Sharing:{" "}
//                                       <span
//                                         className={getDiffColor(ot.sharingType, t.sharingType)}
//                                       >
//                                         {t.sharingType || "—"}
//                                       </span>
//                                     </div>
//                                     <div
//                                       className={getDiffColor(
//                                         renderPoint(ot.boardingPoint),
//                                         renderPoint(t.boardingPoint)
//                                       )}
//                                     >
//                                       Boarding: {renderPoint(t.boardingPoint)}
//                                     </div>
//                                     <div
//                                       className={getDiffColor(
//                                         renderPoint(ot.deboardingPoint),
//                                         renderPoint(t.deboardingPoint)
//                                       )}
//                                     >
//                                       Deboarding: {renderPoint(t.deboardingPoint)}
//                                     </div>
//                                     <div className="col-span-2">
//                                       Add-on: {renderAddonLine(t, ot)}
//                                     </div>
//                                     <div className="col-span-2">
//                                       Remarks:{" "}
//                                       <span className={getDiffColor(ot.remarks, t.remarks)}>
//                                         {t.remarks || "—"}
//                                       </span>
//                                     </div>
//                                   </div>
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         </div>

//                         <div className="mt-10 flex flex-col sm:flex-row gap-4">
//                           <button
//                             onClick={() => handleApprove(req.bookingId?._id || req.bookingId)}
//                             disabled={actionLoading}
//                             className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-medium shadow-md hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-60 transition-all"
//                           >
//                             Approve Changes
//                           </button>
//                           <button
//                             onClick={() => handleReject(req.bookingId?._id || req.bookingId)}
//                             disabled={actionLoading}
//                             className="flex-1 py-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-2xl font-medium shadow-md hover:from-rose-600 hover:to-rose-700 disabled:opacity-60 transition-all"
//                           >
//                             Reject Request
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         <ToastContainer
//           position="top-center"
//           autoClose={4000}
//           hideProgressBar={false}
//           newestOnTop
//           closeOnClick
//           rtl={false}
//           pauseOnFocusLoss
//           draggable
//           pauseOnHover
//           theme="light"
//         />
//       </div>
//     </div>
//   );
// };

// export default BookingApprovals;


/* eslint-disable react-hooks/exhaustive-deps */
// import React, { useContext, useEffect, useState } from "react";
// import { TourAdminContext } from "../../context/TourAdminContext";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { format } from "date-fns";
// import {
//   ChevronDown,
//   ChevronUp,
//   Search,
//   RefreshCw,
//   Loader2,
//   Users,
//   ArrowRightLeft,
//   Calendar,
// } from "lucide-react";

// const BookingApprovals = () => {
//   const {
//     pendingApprovals = [],
//     getPendingApprovals,
//     approveBookingUpdate,
//     rejectBookingUpdate,
//     aToken,
//   } = useContext(TourAdminContext);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredApprovals, setFilteredApprovals] = useState([]);
//   const [expanded, setExpanded] = useState({});
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [actionLoading, setActionLoading] = useState(false);

//   useEffect(() => {
//     if (aToken) getPendingApprovals();
//   }, [aToken]);

//   useEffect(() => {
//     const term = searchTerm.toLowerCase().trim();
//     const filtered = pendingApprovals.filter((item) => {
//       const traveller = item.travellers?.[0] || {};
//       const fullName = `${traveller.title || ""} ${traveller.firstName || ""} ${traveller.lastName || ""}`
//         .toLowerCase()
//         .trim();
//       const mobile = (item.contact?.mobile || "").toLowerCase();
//       return fullName.includes(term) || mobile.includes(term);
//     });
//     setFilteredApprovals(filtered);
//   }, [pendingApprovals, searchTerm]);

//   const toggleExpand = (id) => {
//     setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
//   };

//   const getDiffColor = (oldVal, newVal) => {
//     if (oldVal === newVal || newVal === undefined) return "text-gray-800";
//     if (
//       (typeof newVal === "string" && newVal !== oldVal) ||
//       (typeof newVal === "number" && newVal > oldVal)
//     ) {
//       return "text-emerald-600 font-medium";
//     }
//     return "text-rose-600 font-medium";
//   };

//   const renderPoint = (point) =>
//     point ? `${point.stationCode} - ${point.stationName}` : "—";

//   const getCancellationStatus = (traveller) => {
//     const byTraveller = traveller.cancelled?.byTraveller;
//     const byAdmin = traveller.cancelled?.byAdmin;

//     if (byTraveller && !byAdmin) {
//       return {
//         text: "Applied for Cancellation",
//         color: "bg-yellow-100 text-yellow-800 border-yellow-300",
//       };
//     }
//     if (byTraveller && byAdmin) {
//       return {
//         text: "Traveller Cancelled",
//         color: "bg-red-100 text-red-800 border-red-300",
//       };
//     }
//     if (byAdmin && !byTraveller) {
//       return {
//         text: "Traveller Rejected",
//         color: "bg-orange-100 text-orange-800 border-orange-300",
//       };
//     }
//     return null;
//   };

//   // ─────────────────────────────────────────────────────────────
//   // Old bookings: t.selectedAddon is a flat single object
//   //   { name, price }.
//   // New bookings: t.selectedAddons is an array of train/flight-wise
//   //   addons, each { tripKind, trainName/airline, trainNo/flightNo,
//   //   tripType, name, amount }.
//   // Whichever is populated for a given traveller is what gets
//   // rendered — this is display-only, no calculation/algorithm here.
//   // ─────────────────────────────────────────────────────────────
//   const getTripTypeStyle = (tripType) => {
//     const t = (tripType || "").toUpperCase();
//     if (t.startsWith("BOARD")) {
//       return { badge: "bg-blue-100 text-blue-700", label: "Boarding" };
//     }
//     if (t.startsWith("MIDDLE")) {
//       return { badge: "bg-purple-100 text-purple-700", label: "Middle" };
//     }
//     if (t.startsWith("DEBOARD") || t.startsWith("DEBOARF")) {
//       return { badge: "bg-orange-100 text-orange-700", label: "Deboarding" };
//     }
//     return { badge: "bg-gray-100 text-gray-700", label: tripType || "Trip" };
//   };

//   // Fixed journey order for display — Boarding first, then Middle
//   // (multiple middles keep their relative order via tripIndex, falling
//   // back to original array position), then Deboarding last. This is a
//   // DISPLAY-ONLY sort — it never touches t.selectedAddons itself, so
//   // saving/approving is unaffected. Ensures every traveller's addon
//   // list reads in the same natural trip sequence, regardless of the
//   // order addons happened to be selected/stored in.
//   const tripOrderRank = (tripType) => {
//     const t = (tripType || "").toUpperCase();
//     if (t.startsWith("BOARD")) return 0;
//     if (t.startsWith("MIDDLE")) return 1;
//     if (t.startsWith("DEBOARD") || t.startsWith("DEBOARF")) return 2;
//     return 3;
//   };

//   const findMatchingOldAddon = (oldAddons, a) => {
//     if (!Array.isArray(oldAddons)) return null;
//     return (
//       oldAddons.find((o) => {
//         if (
//           o.tripKind &&
//           a.tripKind &&
//           o.tripIndex !== undefined &&
//           a.tripIndex !== undefined
//         ) {
//           return o.tripKind === a.tripKind && o.tripIndex === a.tripIndex;
//         }
//         if (a.tripKind === "flight" || o.flightNo || o.airline) {
//           return o.flightNo === a.flightNo && o.airline === a.airline;
//         }
//         return o.trainNo === a.trainNo && o.trainName === a.trainName;
//       }) || null
//     );
//   };

//   // t = the (possibly updated) traveller being displayed.
//   // ot = the ORIGINAL traveller to diff against — omit for the
//   // Current Booking column (no diffing there, always neutral style).
//   const renderAddonLine = (t, ot) => {
//     if (Array.isArray(t.selectedAddons) && t.selectedAddons.length > 0) {
//       const ordered = t.selectedAddons
//         .map((a, originalIndex) => ({ a, originalIndex }))
//         .sort((x, y) => {
//           const rankDiff = tripOrderRank(x.a.tripType) - tripOrderRank(y.a.tripType);
//           if (rankDiff !== 0) return rankDiff;
//           const xi = x.a.tripIndex ?? x.a.trainIndex ?? x.originalIndex;
//           const yi = y.a.tripIndex ?? y.a.trainIndex ?? y.originalIndex;
//           return xi - yi;
//         });

//       return (
//         <div className="space-y-1.5">
//           {ordered.map(({ a }, i) => {
//             const tripLabel =
//               a.tripKind === "flight"
//                 ? `${a.airline || ""} (${a.flightNo || ""})`
//                 : `${a.trainName || ""} (${a.trainNo || ""})`;
//             const style = getTripTypeStyle(a.tripType);

//             const oldMatch = ot
//               ? findMatchingOldAddon(ot.selectedAddons, a)
//               : null;
//             const changed = ot
//               ? !oldMatch ||
//                 oldMatch.name !== a.name ||
//                 Number(oldMatch.amount) !== Number(a.amount)
//               : false;

//             return (
//               <div
//                 key={i}
//                 className={`flex flex-wrap items-center gap-2 ${changed ? "text-emerald-600 font-medium" : ""}`}
//               >
//                 <span
//                   className={`px-2 py-0.5 rounded-full text-xs font-semibold ${style.badge}`}
//                 >
//                   {style.label}
//                 </span>
//                 <span className={changed ? "" : "text-gray-800"}>
//                   {tripLabel}: {a.name}
//                 </span>
//                 <span
//                   className={`font-semibold ${changed ? "" : "text-green-700"}`}
//                 >
//                   +₹{a.amount || 0}
//                 </span>
//               </div>
//             );
//           })}
//         </div>
//       );
//     }
//     if (!t.selectedAddon?.name) return "None";

//     const oldFlat = ot?.selectedAddon;
//     const changed = ot
//       ? !oldFlat ||
//         oldFlat.name !== t.selectedAddon.name ||
//         Number(oldFlat.price) !== Number(t.selectedAddon.price)
//       : false;

//     return (
//       <span className={changed ? "text-emerald-600 font-medium" : ""}>
//         <span className={changed ? "" : "text-gray-800"}>
//           {t.selectedAddon.name}
//         </span>{" "}
//         <span className={`font-semibold ${changed ? "" : "text-green-700"}`}>
//           (+₹{t.selectedAddon.price || 0})
//         </span>
//       </span>
//     );
//   };

//   // Stable string used only for diff-color comparison (old vs new),
//   // covering both flat and trip-wise shapes.
//   const addonSignature = (t) =>
//     JSON.stringify(t?.selectedAddons?.length ? t.selectedAddons : (t?.selectedAddon || null));

//   const handleRefresh = async () => {
//     setIsRefreshing(true);
//     await getPendingApprovals();
//     setTimeout(() => setIsRefreshing(false), 800);
//   };

//   const handleApprove = async (bookingId) => {
//     if (!window.confirm("Approve these changes?")) return;

//     setActionLoading(true);
//     try {
//       const res = await approveBookingUpdate(bookingId);
//       if (res?.success) {
//         toast.success("Changes approved successfully 🌟");
//         getPendingApprovals();
//       } else {
//         toast.error(res?.message || "Approval failed");
//       }
//     } catch (err) {
//       toast.error("Error while approving");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleReject = async (bookingId) => {
//     if (!window.confirm("Reject this update request?")) return;

//     setActionLoading(true);
//     try {
//       const res = await rejectBookingUpdate(bookingId, "Rejected by admin");
//       if (res?.success) {
//         toast.success("Request rejected successfully");
//         getPendingApprovals();
//       } else {
//         toast.error(res?.message || "Rejection failed");
//       }
//     } catch (err) {
//       toast.error("Error while rejecting");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-50/40 via-purple-50/20 to-white p-4 md:p-6">
//       <div className="max-w-6xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200/70 overflow-hidden mb-8">
//           <div className="px-5 py-7 md:px-8 md:py-9 flex flex-col items-center">
//             {/* Icon + Title combo */}
//             <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-6">
//               <div className="relative">
//                 <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-sm">
//                   <Calendar className="text-indigo-600" size={40} />
//                 </div>
//               </div>

//               <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
//                 Pending Booking Approvals
//               </h1>
//             </div>

//             {/* Search + count + refresh */}
//             <div className="w-full max-w-4xl">
//               <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-6">
//                 {/* Search */}
//                 <div className="relative flex-1">
//                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                     <Search className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Search by name or mobile..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full pl-11 pr-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl 
//                      text-gray-700 placeholder-gray-400 focus:outline-none 
//                      focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all shadow-sm"
//                   />
//                 </div>

//                 {/* Count + Refresh */}
//                 <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center md:justify-end">
//                   <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
//                     {filteredApprovals.length === 0
//                       ? "No pending approvals"
//                       : `${filteredApprovals.length} pending approval${filteredApprovals.length !== 1 ? "s" : ""}`}
//                   </div>

//                   <button
//                     onClick={handleRefresh}
//                     disabled={isRefreshing}
//                     className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 
//                      disabled:bg-indigo-400 disabled:cursor-not-allowed
//                      text-white font-medium rounded-xl shadow-md transition-all"
//                   >
//                     {isRefreshing ? (
//                       <>
//                         <Loader2 className="h-4 w-4 animate-spin" />
//                         Refreshing...
//                       </>
//                     ) : (
//                       <>
//                         <RefreshCw className="h-4 w-4" />
//                         Refresh List
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main content - cards */}
//         {!filteredApprovals.length ? (
//           <div className="bg-white/80 backdrop-blur rounded-3xl p-12 text-center shadow-lg border border-white/60">
//             <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center">
//               <Users className="text-indigo-500" size={40} />
//             </div>
//             <h3 className="text-2xl font-semibold text-gray-700 mb-3">All clear!</h3>
//             <p className="text-gray-500 text-lg">
//               No pending booking update requests right now 🌸
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {filteredApprovals.map((req) => {
//               const orig = req.bookingId || {};
//               const lead = req.travellers?.[0] || {};
//               const isExpanded = expanded[req._id];

//               return (
//                 <div
//                   key={req._id}
//                   className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 overflow-hidden transition-all hover:shadow-xl"
//                 >
//                   <div
//                     onClick={() => toggleExpand(req._id)}
//                     className="px-5 py-5 cursor-pointer flex items-center justify-between bg-gradient-to-r from-indigo-50/70 to-purple-50/50 hover:from-indigo-100/60 hover:to-purple-100/60 transition-colors"
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl shadow-sm">
//                         {lead.firstName?.[0]?.toUpperCase() || "?"}
//                       </div>
//                       <div>
//                         <h3 className="font-semibold text-lg text-gray-800">
//                           {lead.title} {lead.firstName} {lead.lastName}
//                         </h3>
//                         <div className="text-sm text-gray-600 mt-1">
//                           {req.contact?.mobile || "—"} • {req.travellers?.length || 1} traveller
//                           {req.travellers?.length !== 1 ? "s" : ""}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-4">
//                       <span className="hidden sm:inline text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium">
//                         {format(new Date(req.createdAt || Date.now()), "dd MMM • hh:mm a")}
//                       </span>
//                       {isExpanded ? (
//                         <ChevronUp className="text-gray-600" size={22} />
//                       ) : (
//                         <ChevronDown className="text-gray-600" size={22} />
//                       )}
//                     </div>
//                   </div>

//                   {isExpanded && (
//                     <div className="p-5 md:p-6 lg:grid lg:grid-cols-2 lg:gap-10">
//                       {/* Original */}
//                       <div className="pb-8 lg:pb-0 lg:pr-8">
//                         <h4 className="text-lg font-semibold text-gray-700 mb-5 flex items-center gap-2.5">
//                           <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
//                           Current Booking
//                         </h4>

//                         <div className="space-y-6">
//                           <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100">
//                             <div className="font-medium text-gray-700 mb-3">Payment</div>
//                             <div className="grid grid-cols-2 gap-6 text-sm">
//                               <div>
//                                 Advance:{" "}
//                                 <span className="font-semibold">
//                                   ₹{(orig.payment?.advance?.amount || 0).toLocaleString()}
//                                 </span>
//                               </div>
//                               <div>
//                                 Balance:{" "}
//                                 <span className="font-semibold">
//                                   ₹{(orig.payment?.balance?.amount || 0).toLocaleString()}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>

//                           <div>
//                             <div className="font-medium text-gray-700 mb-4">
//                               Travellers ({orig.travellers?.length || 0})
//                             </div>
//                             {orig.travellers?.map((t, i) => {
//                               const status = getCancellationStatus(t);
//                               return (
//                                 <div
//                                   key={i}
//                                   className="mb-5 last:mb-0 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 relative"
//                                 >
//                                   <div className="font-medium text-gray-800 mb-3">
//                                     {t.title} {t.firstName} {t.lastName}
//                                   </div>

//                                   {status && (
//                                     <span
//                                       className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-medium border ${status.color}`}
//                                     >
//                                       {status.text}
//                                     </span>
//                                   )}

//                                   <div className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm text-gray-600">
//                                     <div>Age: {t.age || "—"}</div>
//                                     <div>Gender: {t.gender || "—"}</div>
//                                     <div>
//                                       Package:{" "}
//                                       {t.packageType === "main"
//                                         ? "Main Package"
//                                         : `Variant ${t.variantPackageIndex ?? "?"}`}
//                                     </div>
//                                     <div>Sharing: {t.sharingType || "—"}</div>
//                                     <div>Boarding: {renderPoint(t.boardingPoint)}</div>
//                                     <div>Deboarding: {renderPoint(t.deboardingPoint)}</div>
//                                     <div className="col-span-2">
//                                       Add-on: {renderAddonLine(t)}
//                                     </div>
//                                     <div className="col-span-2">
//                                       Remarks: {t.remarks || "—"}
//                                     </div>
//                                   </div>
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         </div>
//                       </div>

//                       {/* Requested */}
//                       <div className="pt-8 lg:pt-0 lg:pl-8">
//                         <h4 className="text-lg font-semibold text-indigo-700 mb-5 flex items-center gap-2.5">
//                           <ArrowRightLeft className="text-indigo-400" size={20} />
//                           Requested Changes
//                         </h4>

//                         <div className="space-y-6">
//                           <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100/60">
//                             <div className="font-medium text-indigo-700 mb-3">Payment Update</div>
//                             <div className="grid grid-cols-2 gap-6 text-sm">
//                               <div>
//                                 Advance:{" "}
//                                 <span
//                                   className={getDiffColor(
//                                     orig.payment?.advance?.amount || 0,
//                                     req.updatedAdvance
//                                   )}
//                                 >
//                                   ₹{(req.updatedAdvance || 0).toLocaleString()}
//                                 </span>
//                               </div>
//                               <div>
//                                 Balance:{" "}
//                                 <span
//                                   className={getDiffColor(
//                                     orig.payment?.balance?.amount || 0,
//                                     req.updatedBalance
//                                   )}
//                                 >
//                                   ₹{(req.updatedBalance || 0).toLocaleString()}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>

//                           <div>
//                             <div className="font-medium text-indigo-700 mb-4">
//                               Travellers ({req.travellers?.length || 0})
//                             </div>

//                             {req.travellers?.map((t, i) => {
//                               const ot = orig.travellers?.[i] || {};

//                               const nameOld = `${ot.title || ""} ${ot.firstName || ""} ${ot.lastName || ""}`.trim();
//                               const nameNew = `${t.title || ""} ${t.firstName || ""} ${t.lastName || ""}`.trim();
//                               const nameChanged = nameOld !== nameNew;

//                               const status = getCancellationStatus(t);

//                               return (
//                                 <div
//                                   key={i}
//                                   className="mb-5 last:mb-0 p-5 bg-purple-50/30 rounded-2xl border border-purple-100/50 relative"
//                                 >
//                                   <div className="flex items-center gap-3 mb-4">
//                                     <div className="font-semibold text-gray-800 text-base">
//                                       {nameChanged ? (
//                                         <span className="text-emerald-600">
//                                           {t.title} {t.firstName} {t.lastName}
//                                         </span>
//                                       ) : (
//                                         <>
//                                           {t.title} {t.firstName} {t.lastName}
//                                         </>
//                                       )}
//                                     </div>
//                                     {nameChanged && (
//                                       <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
//                                         Name changed
//                                       </span>
//                                     )}
//                                   </div>

//                                   {status && (
//                                     <span
//                                       className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-medium border ${status.color}`}
//                                     >
//                                       {status.text}
//                                     </span>
//                                   )}

//                                   <div className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm text-gray-600">
//                                     <div>
//                                       Age:{" "}
//                                       <span className={getDiffColor(ot.age, t.age)}>
//                                         {t.age || "—"}
//                                       </span>
//                                     </div>
//                                     <div>
//                                       Gender:{" "}
//                                       <span className={getDiffColor(ot.gender, t.gender)}>
//                                         {t.gender || "—"}
//                                       </span>
//                                     </div>
//                                     <div>
//                                       Package:{" "}
//                                       <span
//                                         className={getDiffColor(ot.packageType, t.packageType)}
//                                       >
//                                         {t.packageType === "main"
//                                           ? "Main Package"
//                                           : `Variant ${t.variantPackageIndex ?? "?"}`}
//                                       </span>
//                                     </div>
//                                     <div>
//                                       Sharing:{" "}
//                                       <span
//                                         className={getDiffColor(ot.sharingType, t.sharingType)}
//                                       >
//                                         {t.sharingType || "—"}
//                                       </span>
//                                     </div>
//                                     <div>
//                                       Boarding:{" "}
//                                       <span
//                                         className={getDiffColor(
//                                           renderPoint(ot.boardingPoint),
//                                           renderPoint(t.boardingPoint)
//                                         )}
//                                       >
//                                         {renderPoint(t.boardingPoint)}
//                                       </span>
//                                     </div>
//                                     <div>
//                                       Deboarding:{" "}
//                                       <span
//                                         className={getDiffColor(
//                                           renderPoint(ot.deboardingPoint),
//                                           renderPoint(t.deboardingPoint)
//                                         )}
//                                       >
//                                         {renderPoint(t.deboardingPoint)}
//                                       </span>
//                                     </div>
//                                     <div className="col-span-2">
//                                       Add-on: {renderAddonLine(t, ot)}
//                                     </div>
//                                     <div className="col-span-2">
//                                       Remarks:{" "}
//                                       <span className={getDiffColor(ot.remarks, t.remarks)}>
//                                         {t.remarks || "—"}
//                                       </span>
//                                     </div>
//                                   </div>
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         </div>

//                         <div className="mt-10 flex flex-col sm:flex-row gap-4">
//                           <button
//                             onClick={() => handleApprove(req.bookingId?._id || req.bookingId)}
//                             disabled={actionLoading}
//                             className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-medium shadow-md hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-60 transition-all"
//                           >
//                             Approve Changes
//                           </button>
//                           <button
//                             onClick={() => handleReject(req.bookingId?._id || req.bookingId)}
//                             disabled={actionLoading}
//                             className="flex-1 py-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-2xl font-medium shadow-md hover:from-rose-600 hover:to-rose-700 disabled:opacity-60 transition-all"
//                           >
//                             Reject Request
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         <ToastContainer
//           position="top-center"
//           autoClose={4000}
//           hideProgressBar={false}
//           newestOnTop
//           closeOnClick
//           rtl={false}
//           pauseOnFocusLoss
//           draggable
//           pauseOnHover
//           theme="light"
//         />
//       </div>
//     </div>
//   );
// };

// export default BookingApprovals;


// import React, { useContext, useEffect, useState } from "react";
// import { TourAdminContext } from "../../context/TourAdminContext";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { format } from "date-fns";
// import {
//   ChevronDown,
//   ChevronUp,
//   Search,
//   RefreshCw,
//   Loader2,
//   Users,
//   ArrowRightLeft,
//   Calendar,
// } from "lucide-react";

// const BookingApprovals = () => {
//   const {
//     pendingApprovals = [],
//     getPendingApprovals,
//     approveBookingUpdate,
//     rejectBookingUpdate,
//     aToken,
//   } = useContext(TourAdminContext);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredApprovals, setFilteredApprovals] = useState([]);
//   const [expanded, setExpanded] = useState({});
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [actionLoading, setActionLoading] = useState(false);

//   useEffect(() => {
//     if (aToken) getPendingApprovals();
//   }, [aToken]);

//   useEffect(() => {
//     const term = searchTerm.toLowerCase().trim();
//     const filtered = pendingApprovals.filter((item) => {
//       const traveller = item.travellers?.[0] || {};
//       const fullName = `${traveller.title || ""} ${traveller.firstName || ""} ${traveller.lastName || ""}`
//         .toLowerCase()
//         .trim();
//       const mobile = (item.contact?.mobile || "").toLowerCase();
//       return fullName.includes(term) || mobile.includes(term);
//     });
//     setFilteredApprovals(filtered);
//   }, [pendingApprovals, searchTerm]);

//   const toggleExpand = (id) => {
//     setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
//   };

//   const getDiffColor = (oldVal, newVal) => {
//     if (oldVal === newVal || newVal === undefined) return "text-gray-800";
//     if (
//       (typeof newVal === "string" && newVal !== oldVal) ||
//       (typeof newVal === "number" && newVal > oldVal)
//     ) {
//       return "text-emerald-600 font-medium";
//     }
//     return "text-rose-600 font-medium";
//   };

//   const renderPoint = (point) =>
//     point ? `${point.stationCode} - ${point.stationName}` : "—";

//   const getCancellationStatus = (traveller) => {
//     const byTraveller = traveller.cancelled?.byTraveller;
//     const byAdmin = traveller.cancelled?.byAdmin;

//     if (byTraveller && !byAdmin) {
//       return {
//         text: "Applied for Cancellation",
//         color: "bg-yellow-100 text-yellow-800 border-yellow-300",
//       };
//     }
//     if (byTraveller && byAdmin) {
//       return {
//         text: "Traveller Cancelled",
//         color: "bg-red-100 text-red-800 border-red-300",
//       };
//     }
//     if (byAdmin && !byTraveller) {
//       return {
//         text: "Traveller Rejected",
//         color: "bg-orange-100 text-orange-800 border-orange-300",
//       };
//     }
//     return null;
//   };

//   // ─────────────────────────────────────────────────────────────
//   // Old bookings: t.selectedAddon is a flat single object
//   //   { name, price }.
//   // New bookings: t.selectedAddons is an array of train/flight-wise
//   //   addons, each { tripKind, trainName/airline, trainNo/flightNo,
//   //   tripType, name, amount }.
//   // Whichever is populated for a given traveller is what gets
//   // rendered — this is display-only, no calculation/algorithm here.
//   // ─────────────────────────────────────────────────────────────
//   const getTripTypeStyle = (tripType) => {
//     const t = (tripType || "").toUpperCase();
//     if (t.startsWith("BOARD")) {
//       return { badge: "bg-blue-100 text-blue-700", label: "Boarding" };
//     }
//     if (t.startsWith("MIDDLE")) {
//       return { badge: "bg-purple-100 text-purple-700", label: "Middle" };
//     }
//     if (t.startsWith("DEBOARD") || t.startsWith("DEBOARF")) {
//       return { badge: "bg-orange-100 text-orange-700", label: "Deboarding" };
//     }
//     return { badge: "bg-gray-100 text-gray-700", label: tripType || "Trip" };
//   };

//   // Fixed journey order for display — Boarding first, then Middle
//   // (multiple middles keep their relative order via tripIndex, falling
//   // back to original array position), then Deboarding last. This is a
//   // DISPLAY-ONLY sort — it never touches t.selectedAddons itself, so
//   // saving/approving is unaffected. Ensures every traveller's addon
//   // list reads in the same natural trip sequence, regardless of the
//   // order addons happened to be selected/stored in.
//   const tripOrderRank = (tripType) => {
//     const t = (tripType || "").toUpperCase();
//     if (t.startsWith("BOARD")) return 0;
//     if (t.startsWith("MIDDLE")) return 1;
//     if (t.startsWith("DEBOARD") || t.startsWith("DEBOARF")) return 2;
//     return 3;
//   };

//   const findMatchingOldAddon = (oldAddons, a) => {
//     if (!Array.isArray(oldAddons)) return null;
//     return (
//       oldAddons.find((o) => {
//         if (
//           o.tripKind &&
//           a.tripKind &&
//           o.tripIndex !== undefined &&
//           a.tripIndex !== undefined
//         ) {
//           return o.tripKind === a.tripKind && o.tripIndex === a.tripIndex;
//         }
//         if (a.tripKind === "flight" || o.flightNo || o.airline) {
//           return o.flightNo === a.flightNo && o.airline === a.airline;
//         }
//         return o.trainNo === a.trainNo && o.trainName === a.trainName;
//       }) || null
//     );
//   };

//   // Renders one addon row (shared by both the Train Addons and Flight
//   // Addons groups below) — purely display, same diff-highlight logic
//   // as before, just extracted so both groups can reuse it.
//   const renderSingleAddonRow = (a, i, ot) => {
//     const tripLabel =
//       a.tripKind === "flight"
//         ? `${a.airline || ""} (${a.flightNo || ""})`
//         : `${a.trainName || ""} (${a.trainNo || ""})`;
//     const style = getTripTypeStyle(a.tripType);

//     const oldMatch = ot ? findMatchingOldAddon(ot.selectedAddons, a) : null;
//     const changed = ot
//       ? !oldMatch ||
//         oldMatch.name !== a.name ||
//         Number(oldMatch.amount) !== Number(a.amount)
//       : false;

//     return (
//       <div
//         key={i}
//         className={`flex flex-wrap items-center gap-2.5 py-0.5 ${changed ? "text-emerald-600 font-medium" : ""}`}
//       >
//         <span
//           className={`px-2.5 py-1 rounded-full text-xs font-semibold ${style.badge}`}
//         >
//           {style.label}
//         </span>
//         <span className={changed ? "" : "text-gray-800"}>
//           {tripLabel}: {a.name}
//         </span>
//         <span className={`font-semibold ${changed ? "" : "text-green-700"}`}>
//           +₹{a.amount || 0}
//         </span>
//       </div>
//     );
//   };

//   // t = the (possibly updated) traveller being displayed.
//   // ot = the ORIGINAL traveller to diff against — omit for the
//   // Current Booking column (no diffing there, always neutral style).
//   const renderAddonLine = (t, ot) => {
//     if (Array.isArray(t.selectedAddons) && t.selectedAddons.length > 0) {
//       const ordered = t.selectedAddons
//         .map((a, originalIndex) => ({ a, originalIndex }))
//         .sort((x, y) => {
//           const rankDiff = tripOrderRank(x.a.tripType) - tripOrderRank(y.a.tripType);
//           if (rankDiff !== 0) return rankDiff;
//           const xi = x.a.tripIndex ?? x.a.trainIndex ?? x.originalIndex;
//           const yi = y.a.tripIndex ?? y.a.trainIndex ?? y.originalIndex;
//           return xi - yi;
//         })
//         .map(({ a }) => a);

//       // Split into Train Addons vs Flight Addons — same underlying
//       // ordering/diff logic, just grouped under two separate headings
//       // instead of one mixed list.
//       const trainEntries = ordered.filter((a) => a.tripKind !== "flight");
//       const flightEntries = ordered.filter((a) => a.tripKind === "flight");

//       return (
//         <div className="space-y-4">
//           {trainEntries.length > 0 && (
//             <div>
//               <p className="text-xs font-bold text-red-600 mb-2 flex items-center gap-1.5">
//                 <span>🚆</span> Train Addons
//               </p>
//               <div className="space-y-2.5">
//                 {trainEntries.map((a, i) => renderSingleAddonRow(a, i, ot))}
//               </div>
//             </div>
//           )}

//           {flightEntries.length > 0 && (
//             <div>
//               <p className="text-xs font-bold text-orange-900 mb-2 flex items-center gap-1.5">
//                 <span>✈️</span> Flight Addons
//               </p>
//               <div className="space-y-2.5">
//                 {flightEntries.map((a, i) => renderSingleAddonRow(a, i, ot))}
//               </div>
//             </div>
//           )}
//         </div>
//       );
//     }
//     if (!t.selectedAddon?.name) return "None";

//     const oldFlat = ot?.selectedAddon;
//     const changed = ot
//       ? !oldFlat ||
//         oldFlat.name !== t.selectedAddon.name ||
//         Number(oldFlat.price) !== Number(t.selectedAddon.price)
//       : false;

//     return (
//       <span className={changed ? "text-emerald-600 font-medium" : ""}>
//         <span className={changed ? "" : "text-gray-800"}>
//           {t.selectedAddon.name}
//         </span>{" "}
//         <span className={`font-semibold ${changed ? "" : "text-green-700"}`}>
//           (+₹{t.selectedAddon.price || 0})
//         </span>
//       </span>
//     );
//   };

//   // Stable string used only for diff-color comparison (old vs new),
//   // covering both flat and trip-wise shapes.
//   const addonSignature = (t) =>
//     JSON.stringify(t?.selectedAddons?.length ? t.selectedAddons : (t?.selectedAddon || null));

//   const handleRefresh = async () => {
//     setIsRefreshing(true);
//     await getPendingApprovals();
//     setTimeout(() => setIsRefreshing(false), 800);
//   };

//   const handleApprove = async (bookingId) => {
//     if (!window.confirm("Approve these changes?")) return;

//     setActionLoading(true);
//     try {
//       const res = await approveBookingUpdate(bookingId);
//       if (res?.success) {
//         toast.success("Changes approved successfully 🌟");
//         getPendingApprovals();
//       } else {
//         toast.error(res?.message || "Approval failed");
//       }
//     } catch (err) {
//       toast.error("Error while approving");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleReject = async (bookingId) => {
//     if (!window.confirm("Reject this update request?")) return;

//     setActionLoading(true);
//     try {
//       const res = await rejectBookingUpdate(bookingId, "Rejected by admin");
//       if (res?.success) {
//         toast.success("Request rejected successfully");
//         getPendingApprovals();
//       } else {
//         toast.error(res?.message || "Rejection failed");
//       }
//     } catch (err) {
//       toast.error("Error while rejecting");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-50/40 via-purple-50/20 to-white p-4 md:p-6">
//       <div className="max-w-6xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200/70 overflow-hidden mb-8">
//           <div className="px-5 py-7 md:px-8 md:py-9 flex flex-col items-center">
//             {/* Icon + Title combo */}
//             <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-6">
//               <div className="relative">
//                 <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-sm">
//                   <Calendar className="text-indigo-600" size={40} />
//                 </div>
//               </div>

//               <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
//                 Pending Booking Approvals
//               </h1>
//             </div>

//             {/* Search + count + refresh */}
//             <div className="w-full max-w-4xl">
//               <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-6">
//                 {/* Search */}
//                 <div className="relative flex-1">
//                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                     <Search className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Search by name or mobile..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full pl-11 pr-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl 
//                      text-gray-700 placeholder-gray-400 focus:outline-none 
//                      focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all shadow-sm"
//                   />
//                 </div>

//                 {/* Count + Refresh */}
//                 <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center md:justify-end">
//                   <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
//                     {filteredApprovals.length === 0
//                       ? "No pending approvals"
//                       : `${filteredApprovals.length} pending approval${filteredApprovals.length !== 1 ? "s" : ""}`}
//                   </div>

//                   <button
//                     onClick={handleRefresh}
//                     disabled={isRefreshing}
//                     className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 
//                      disabled:bg-indigo-400 disabled:cursor-not-allowed
//                      text-white font-medium rounded-xl shadow-md transition-all"
//                   >
//                     {isRefreshing ? (
//                       <>
//                         <Loader2 className="h-4 w-4 animate-spin" />
//                         Refreshing...
//                       </>
//                     ) : (
//                       <>
//                         <RefreshCw className="h-4 w-4" />
//                         Refresh List
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main content - cards */}
//         {!filteredApprovals.length ? (
//           <div className="bg-white/80 backdrop-blur rounded-3xl p-12 text-center shadow-lg border border-white/60">
//             <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center">
//               <Users className="text-indigo-500" size={40} />
//             </div>
//             <h3 className="text-2xl font-semibold text-gray-700 mb-3">All clear!</h3>
//             <p className="text-gray-500 text-lg">
//               No pending booking update requests right now 🌸
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {filteredApprovals.map((req) => {
//               const orig = req.bookingId || {};
//               const lead = req.travellers?.[0] || {};
//               const isExpanded = expanded[req._id];

//               return (
//                 <div
//                   key={req._id}
//                   className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 overflow-hidden transition-all hover:shadow-xl"
//                 >
//                   <div
//                     onClick={() => toggleExpand(req._id)}
//                     className="px-5 py-5 cursor-pointer flex items-center justify-between bg-gradient-to-r from-indigo-50/70 to-purple-50/50 hover:from-indigo-100/60 hover:to-purple-100/60 transition-colors"
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl shadow-sm">
//                         {lead.firstName?.[0]?.toUpperCase() || "?"}
//                       </div>
//                       <div>
//                         <h3 className="font-semibold text-lg text-gray-800">
//                           {lead.title} {lead.firstName} {lead.lastName}
//                         </h3>
//                         <div className="text-sm text-gray-600 mt-1">
//                           {req.contact?.mobile || "—"} • {req.travellers?.length || 1} traveller
//                           {req.travellers?.length !== 1 ? "s" : ""}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-4">
//                       <span className="hidden sm:inline text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium">
//                         {format(new Date(req.createdAt || Date.now()), "dd MMM • hh:mm a")}
//                       </span>
//                       {isExpanded ? (
//                         <ChevronUp className="text-gray-600" size={22} />
//                       ) : (
//                         <ChevronDown className="text-gray-600" size={22} />
//                       )}
//                     </div>
//                   </div>

//                   {isExpanded && (
//                     <div className="p-6 md:p-8 lg:grid lg:grid-cols-2 lg:gap-12">
//                       {/* Original */}
//                       <div className="pb-10 lg:pb-0 lg:pr-10">
//                         <h4 className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2.5">
//                           <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
//                           Current Booking
//                         </h4>

//                         <div className="space-y-8">
//                           <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-100">
//                             <div className="font-medium text-gray-700 mb-3">Payment</div>
//                             <div className="grid grid-cols-2 gap-6 text-sm">
//                               <div>
//                                 Advance:{" "}
//                                 <span className="font-semibold">
//                                   ₹{(orig.payment?.advance?.amount || 0).toLocaleString()}
//                                 </span>
//                               </div>
//                               <div>
//                                 Balance:{" "}
//                                 <span className="font-semibold">
//                                   ₹{(orig.payment?.balance?.amount || 0).toLocaleString()}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>

//                           <div>
//                             <div className="font-medium text-gray-700 mb-4">
//                               Travellers ({orig.travellers?.length || 0})
//                             </div>
//                             {orig.travellers?.map((t, i) => {
//                               const status = getCancellationStatus(t);
//                               return (
//                                 <div
//                                   key={i}
//                                   className="mb-6 last:mb-0 p-6 bg-gray-50/50 rounded-2xl border border-gray-100 relative"
//                                 >
//                                   <div className="font-medium text-gray-800 mb-4 text-base">
//                                     {t.title} {t.firstName} {t.lastName}
//                                   </div>

//                                   {status && (
//                                     <span
//                                       className={`absolute top-4 right-4 text-xs px-2.5 py-1 rounded-full font-medium border ${status.color}`}
//                                     >
//                                       {status.text}
//                                     </span>
//                                   )}

//                                   <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-600">
//                                     <div>Age: {t.age || "—"}</div>
//                                     <div>Gender: {t.gender || "—"}</div>
//                                     <div>
//                                       Package:{" "}
//                                       {t.packageType === "main"
//                                         ? "Main Package"
//                                         : `Variant ${t.variantPackageIndex ?? "?"}`}
//                                     </div>
//                                     <div>Sharing: {t.sharingType || "—"}</div>
//                                     <div>Boarding: {renderPoint(t.boardingPoint)}</div>
//                                     <div>Deboarding: {renderPoint(t.deboardingPoint)}</div>
//                                     <div className="col-span-2 pt-2">
//                                       <div className="mb-1.5">Add-on:</div>
//                                       {renderAddonLine(t)}
//                                     </div>
//                                     <div className="col-span-2 pt-1">
//                                       Remarks: {t.remarks || "—"}
//                                     </div>
//                                   </div>
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         </div>
//                       </div>

//                       {/* Requested */}
//                       <div className="pt-10 lg:pt-0 lg:pl-10">
//                         <h4 className="text-lg font-semibold text-indigo-700 mb-6 flex items-center gap-2.5">
//                           <ArrowRightLeft className="text-indigo-400" size={20} />
//                           Requested Changes
//                         </h4>

//                         <div className="space-y-8">
//                           <div className="bg-indigo-50/40 p-6 rounded-2xl border border-indigo-100/60">
//                             <div className="font-medium text-indigo-700 mb-3">Payment Update</div>
//                             <div className="grid grid-cols-2 gap-6 text-sm">
//                               <div>
//                                 Advance:{" "}
//                                 <span
//                                   className={getDiffColor(
//                                     orig.payment?.advance?.amount || 0,
//                                     req.updatedAdvance
//                                   )}
//                                 >
//                                   ₹{(req.updatedAdvance || 0).toLocaleString()}
//                                 </span>
//                               </div>
//                               <div>
//                                 Balance:{" "}
//                                 <span
//                                   className={getDiffColor(
//                                     orig.payment?.balance?.amount || 0,
//                                     req.updatedBalance
//                                   )}
//                                 >
//                                   ₹{(req.updatedBalance || 0).toLocaleString()}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>

//                           <div>
//                             <div className="font-medium text-indigo-700 mb-4">
//                               Travellers ({req.travellers?.length || 0})
//                             </div>

//                             {req.travellers?.map((t, i) => {
//                               const ot = orig.travellers?.[i] || {};

//                               const nameOld = `${ot.title || ""} ${ot.firstName || ""} ${ot.lastName || ""}`.trim();
//                               const nameNew = `${t.title || ""} ${t.firstName || ""} ${t.lastName || ""}`.trim();
//                               const nameChanged = nameOld !== nameNew;

//                               const status = getCancellationStatus(t);

//                               return (
//                                 <div
//                                   key={i}
//                                   className="mb-6 last:mb-0 p-6 bg-purple-50/30 rounded-2xl border border-purple-100/50 relative"
//                                 >
//                                   <div className="flex items-center gap-3 mb-4">
//                                     <div className="font-semibold text-gray-800 text-base">
//                                       {nameChanged ? (
//                                         <span className="text-emerald-600">
//                                           {t.title} {t.firstName} {t.lastName}
//                                         </span>
//                                       ) : (
//                                         <>
//                                           {t.title} {t.firstName} {t.lastName}
//                                         </>
//                                       )}
//                                     </div>
//                                     {nameChanged && (
//                                       <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
//                                         Name changed
//                                       </span>
//                                     )}
//                                   </div>

//                                   {status && (
//                                     <span
//                                       className={`absolute top-4 right-4 text-xs px-2.5 py-1 rounded-full font-medium border ${status.color}`}
//                                     >
//                                       {status.text}
//                                     </span>
//                                   )}

//                                   <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-600">
//                                     <div>
//                                       Age:{" "}
//                                       <span className={getDiffColor(ot.age, t.age)}>
//                                         {t.age || "—"}
//                                       </span>
//                                     </div>
//                                     <div>
//                                       Gender:{" "}
//                                       <span className={getDiffColor(ot.gender, t.gender)}>
//                                         {t.gender || "—"}
//                                       </span>
//                                     </div>
//                                     <div>
//                                       Package:{" "}
//                                       <span
//                                         className={getDiffColor(ot.packageType, t.packageType)}
//                                       >
//                                         {t.packageType === "main"
//                                           ? "Main Package"
//                                           : `Variant ${t.variantPackageIndex ?? "?"}`}
//                                       </span>
//                                     </div>
//                                     <div>
//                                       Sharing:{" "}
//                                       <span
//                                         className={getDiffColor(ot.sharingType, t.sharingType)}
//                                       >
//                                         {t.sharingType || "—"}
//                                       </span>
//                                     </div>
//                                     <div>
//                                       Boarding:{" "}
//                                       <span
//                                         className={getDiffColor(
//                                           renderPoint(ot.boardingPoint),
//                                           renderPoint(t.boardingPoint)
//                                         )}
//                                       >
//                                         {renderPoint(t.boardingPoint)}
//                                       </span>
//                                     </div>
//                                     <div>
//                                       Deboarding:{" "}
//                                       <span
//                                         className={getDiffColor(
//                                           renderPoint(ot.deboardingPoint),
//                                           renderPoint(t.deboardingPoint)
//                                         )}
//                                       >
//                                         {renderPoint(t.deboardingPoint)}
//                                       </span>
//                                     </div>
//                                     <div className="col-span-2 pt-2">
//                                       <div className="mb-1.5">Add-on:</div>
//                                       {renderAddonLine(t, ot)}
//                                     </div>
//                                     <div className="col-span-2 pt-1">
//                                       Remarks:{" "}
//                                       <span className={getDiffColor(ot.remarks, t.remarks)}>
//                                         {t.remarks || "—"}
//                                       </span>
//                                     </div>
//                                   </div>
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         </div>

//                         <div className="mt-10 flex flex-col sm:flex-row gap-4">
//                           <button
//                             onClick={() => handleApprove(req.bookingId?._id || req.bookingId)}
//                             disabled={actionLoading}
//                             className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-medium shadow-md hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-60 transition-all"
//                           >
//                             Approve Changes
//                           </button>
//                           <button
//                             onClick={() => handleReject(req.bookingId?._id || req.bookingId)}
//                             disabled={actionLoading}
//                             className="flex-1 py-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-2xl font-medium shadow-md hover:from-rose-600 hover:to-rose-700 disabled:opacity-60 transition-all"
//                           >
//                             Reject Request
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         <ToastContainer
//           position="top-center"
//           autoClose={4000}
//           hideProgressBar={false}
//           newestOnTop
//           closeOnClick
//           rtl={false}
//           pauseOnFocusLoss
//           draggable
//           pauseOnHover
//           theme="light"
//         />
//       </div>
//     </div>
//   );
// };

// export default BookingApprovals;


import React, { useContext, useEffect, useState } from "react";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  Loader2,
  Users,
  ArrowRightLeft,
  Calendar,
} from "lucide-react";

const BookingApprovals = () => {
  const {
    pendingApprovals = [],
    getPendingApprovals,
    approveBookingUpdate,
    rejectBookingUpdate,
    aToken,
  } = useContext(TourAdminContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredApprovals, setFilteredApprovals] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (aToken) getPendingApprovals();
  }, [aToken]);

  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    const filtered = pendingApprovals.filter((item) => {
      const traveller = item.travellers?.[0] || {};
      const fullName = `${traveller.title || ""} ${traveller.firstName || ""} ${traveller.lastName || ""}`
        .toLowerCase()
        .trim();
      const mobile = (item.contact?.mobile || "").toLowerCase();
      return fullName.includes(term) || mobile.includes(term);
    });
    setFilteredApprovals(filtered);
  }, [pendingApprovals, searchTerm]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getDiffColor = (oldVal, newVal) => {
    if (oldVal === newVal || newVal === undefined) return "text-gray-800";
    if (
      (typeof newVal === "string" && newVal !== oldVal) ||
      (typeof newVal === "number" && newVal > oldVal)
    ) {
      return "text-emerald-600 font-medium";
    }
    return "text-rose-600 font-medium";
  };

  const renderPoint = (point) =>
    point ? `${point.stationCode} - ${point.stationName}` : "—";

  const getCancellationStatus = (traveller) => {
    const byTraveller = traveller.cancelled?.byTraveller;
    const byAdmin = traveller.cancelled?.byAdmin;

    if (byTraveller && !byAdmin) {
      return {
        text: "Applied for Cancellation",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      };
    }
    if (byTraveller && byAdmin) {
      return {
        text: "Traveller Cancelled",
        color: "bg-red-100 text-red-800 border-red-300",
      };
    }
    if (byAdmin && !byTraveller) {
      return {
        text: "Traveller Rejected",
        color: "bg-orange-100 text-orange-800 border-orange-300",
      };
    }
    return null;
  };

  // ─────────────────────────────────────────────────────────────
  // Old bookings: t.selectedAddon is a flat single object
  //   { name, price }.
  // New bookings: t.selectedAddons is an array of train/flight-wise
  //   addons, each { tripKind, trainName/airline, trainNo/flightNo,
  //   tripType, name, amount }.
  // Whichever is populated for a given traveller is what gets
  // rendered — this is display-only, no calculation/algorithm here.
  // ─────────────────────────────────────────────────────────────
  const getTripTypeStyle = (tripType) => {
    const t = (tripType || "").toUpperCase();
    if (t.startsWith("BOARD")) {
      return { badge: "bg-blue-100 text-blue-700", label: "Boarding" };
    }
    if (t.startsWith("MIDDLE")) {
      return { badge: "bg-purple-100 text-purple-700", label: "Middle" };
    }
    if (t.startsWith("DEBOARD") || t.startsWith("DEBOARF")) {
      return { badge: "bg-orange-100 text-orange-700", label: "Deboarding" };
    }
    return { badge: "bg-gray-100 text-gray-700", label: tripType || "Trip" };
  };

  // Some older/manually-edited addon entries never got a `tripKind`
  // field saved at all — relying on tripKind === "flight" alone then
  // silently misclassifies a real flight addon as a train addon (it
  // falls into the "everything else" bucket) AND makes the label build
  // from the (empty) train fields instead, producing a bare "()" with
  // no airline/flight number shown. Classify from whichever identifying
  // fields are ACTUALLY present, falling back to tripKind only when
  // neither train nor flight fields exist at all.
  const classifyAddonKind = (a) => {
    if (a.flightNo || a.airline) return "flight";
    if (a.trainNo || a.trainName) return "train";
    return a.tripKind === "flight" ? "flight" : "train";
  };

  // Builds "Airline (Flight No)" / "Train Name (Train No)" — but ONLY
  // from fields that actually have a value. If neither field is
  // present, returns null so the caller can omit the label entirely
  // instead of rendering a bare "()".
  const buildTripLabel = (a, kind) => {
    const primary = kind === "flight" ? a.airline : a.trainName;
    const secondary = kind === "flight" ? a.flightNo : a.trainNo;
    if (!primary && !secondary) return null;
    if (primary && secondary) return `${primary} (${secondary})`;
    return primary || secondary;
  };

  // Fixed journey order for display — Boarding first, then Middle
  // (multiple middles keep their relative order via tripIndex, falling
  // back to original array position), then Deboarding last. This is a
  // DISPLAY-ONLY sort — it never touches t.selectedAddons itself, so
  // saving/approving is unaffected. Ensures every traveller's addon
  // list reads in the same natural trip sequence, regardless of the
  // order addons happened to be selected/stored in.
  const tripOrderRank = (tripType) => {
    const t = (tripType || "").toUpperCase();
    if (t.startsWith("BOARD")) return 0;
    if (t.startsWith("MIDDLE")) return 1;
    if (t.startsWith("DEBOARD") || t.startsWith("DEBOARF")) return 2;
    return 3;
  };

  const findMatchingOldAddon = (oldAddons, a) => {
    if (!Array.isArray(oldAddons)) return null;
    return (
      oldAddons.find((o) => {
        if (
          o.tripKind &&
          a.tripKind &&
          o.tripIndex !== undefined &&
          a.tripIndex !== undefined
        ) {
          return o.tripKind === a.tripKind && o.tripIndex === a.tripIndex;
        }
        if (classifyAddonKind(a) === "flight" || o.flightNo || o.airline) {
          return o.flightNo === a.flightNo && o.airline === a.airline;
        }
        return o.trainNo === a.trainNo && o.trainName === a.trainName;
      }) || null
    );
  };

  // Renders one addon row (shared by both the Train Addons and Flight
  // Addons groups below) — purely display, same diff-highlight logic
  // as before, just extracted so both groups can reuse it.
  const renderSingleAddonRow = (a, i, ot) => {
    const kind = classifyAddonKind(a);
    const tripLabel = buildTripLabel(a, kind);
    const style = getTripTypeStyle(a.tripType);

    const oldMatch = ot ? findMatchingOldAddon(ot.selectedAddons, a) : null;
    const changed = ot
      ? !oldMatch ||
        oldMatch.name !== a.name ||
        Number(oldMatch.amount) !== Number(a.amount)
      : false;

    return (
      <div
        key={i}
        className={`flex flex-wrap items-center gap-2.5 py-0.5 ${changed ? "text-emerald-600 font-medium" : ""}`}
      >
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${style.badge}`}
        >
          {style.label}
        </span>
        <span className={changed ? "" : "text-gray-800"}>
          {tripLabel ? `${tripLabel}: ` : ""}
          {a.name}
        </span>
        <span className={`font-semibold ${changed ? "" : "text-green-700"}`}>
          +₹{a.amount || 0}
        </span>
      </div>
    );
  };

  // t = the (possibly updated) traveller being displayed.
  // ot = the ORIGINAL traveller to diff against — omit for the
  // Current Booking column (no diffing there, always neutral style).
  const renderAddonLine = (t, ot) => {
    if (Array.isArray(t.selectedAddons) && t.selectedAddons.length > 0) {
      const ordered = t.selectedAddons
        .map((a, originalIndex) => ({ a, originalIndex }))
        .sort((x, y) => {
          const rankDiff = tripOrderRank(x.a.tripType) - tripOrderRank(y.a.tripType);
          if (rankDiff !== 0) return rankDiff;
          const xi = x.a.tripIndex ?? x.a.trainIndex ?? x.originalIndex;
          const yi = y.a.tripIndex ?? y.a.trainIndex ?? y.originalIndex;
          return xi - yi;
        })
        .map(({ a }) => a);

      // Split into Train Addons vs Flight Addons using classifyAddonKind
      // (field-presence based, NOT just tripKind) — same underlying
      // ordering/diff logic, just grouped under two separate headings
      // instead of one mixed list.
      const trainEntries = ordered.filter((a) => classifyAddonKind(a) !== "flight");
      const flightEntries = ordered.filter((a) => classifyAddonKind(a) === "flight");

      return (
        <div className="space-y-4">
          {trainEntries.length > 0 && (
            <div>
              <p className="text-xs font-bold text-red-600 mb-2 flex items-center gap-1.5">
                <span>🚆</span> Train Addons
              </p>
              <div className="space-y-2.5">
                {trainEntries.map((a, i) => renderSingleAddonRow(a, i, ot))}
              </div>
            </div>
          )}

          {flightEntries.length > 0 && (
            <div>
              <p className="text-xs font-bold text-orange-900 mb-2 flex items-center gap-1.5">
                <span>✈️</span> Flight Addons
              </p>
              <div className="space-y-2.5">
                {flightEntries.map((a, i) => renderSingleAddonRow(a, i, ot))}
              </div>
            </div>
          )}
        </div>
      );
    }
    if (!t.selectedAddon?.name) return "None";

    const oldFlat = ot?.selectedAddon;
    const changed = ot
      ? !oldFlat ||
        oldFlat.name !== t.selectedAddon.name ||
        Number(oldFlat.price) !== Number(t.selectedAddon.price)
      : false;

    return (
      <span className={changed ? "text-emerald-600 font-medium" : ""}>
        <span className={changed ? "" : "text-gray-800"}>
          {t.selectedAddon.name}
        </span>{" "}
        <span className={`font-semibold ${changed ? "" : "text-green-700"}`}>
          (+₹{t.selectedAddon.price || 0})
        </span>
      </span>
    );
  };

  // Stable string used only for diff-color comparison (old vs new),
  // covering both flat and trip-wise shapes.
  const addonSignature = (t) =>
    JSON.stringify(t?.selectedAddons?.length ? t.selectedAddons : (t?.selectedAddon || null));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await getPendingApprovals();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleApprove = async (bookingId) => {
    if (!window.confirm("Approve these changes?")) return;

    setActionLoading(true);
    try {
      const res = await approveBookingUpdate(bookingId);
      if (res?.success) {
        toast.success("Changes approved successfully 🌟");
        getPendingApprovals();
      } else {
        toast.error(res?.message || "Approval failed");
      }
    } catch (err) {
      toast.error("Error while approving");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (bookingId) => {
    if (!window.confirm("Reject this update request?")) return;

    setActionLoading(true);
    try {
      const res = await rejectBookingUpdate(bookingId, "Rejected by admin");
      if (res?.success) {
        toast.success("Request rejected successfully");
        getPendingApprovals();
      } else {
        toast.error(res?.message || "Rejection failed");
      }
    } catch (err) {
      toast.error("Error while rejecting");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/40 via-purple-50/20 to-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/70 overflow-hidden mb-8">
          <div className="px-5 py-7 md:px-8 md:py-9 flex flex-col items-center">
            {/* Icon + Title combo */}
            <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-sm">
                  <Calendar className="text-indigo-600" size={40} />
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
                Pending Booking Approvals
              </h1>
            </div>

            {/* Search + count + refresh */}
            <div className="w-full max-w-4xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-6">
                {/* Search */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or mobile..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl 
                     text-gray-700 placeholder-gray-400 focus:outline-none 
                     focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all shadow-sm"
                  />
                </div>

                {/* Count + Refresh */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center md:justify-end">
                  <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    {filteredApprovals.length === 0
                      ? "No pending approvals"
                      : `${filteredApprovals.length} pending approval${filteredApprovals.length !== 1 ? "s" : ""}`}
                  </div>

                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 
                     disabled:bg-indigo-400 disabled:cursor-not-allowed
                     text-white font-medium rounded-xl shadow-md transition-all"
                  >
                    {isRefreshing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Refresh List
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content - cards */}
        {!filteredApprovals.length ? (
          <div className="bg-white/80 backdrop-blur rounded-3xl p-12 text-center shadow-lg border border-white/60">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center">
              <Users className="text-indigo-500" size={40} />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">All clear!</h3>
            <p className="text-gray-500 text-lg">
              No pending booking update requests right now 🌸
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApprovals.map((req) => {
              const orig = req.bookingId || {};
              const lead = req.travellers?.[0] || {};
              const isExpanded = expanded[req._id];

              return (
                <div
                  key={req._id}
                  className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 overflow-hidden transition-all hover:shadow-xl"
                >
                  <div
                    onClick={() => toggleExpand(req._id)}
                    className="px-5 py-5 cursor-pointer flex items-center justify-between bg-gradient-to-r from-indigo-50/70 to-purple-50/50 hover:from-indigo-100/60 hover:to-purple-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl shadow-sm">
                        {lead.firstName?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">
                          {lead.title} {lead.firstName} {lead.lastName}
                        </h3>
                        <div className="text-sm text-gray-600 mt-1">
                          {req.contact?.mobile || "—"} • {req.travellers?.length || 1} traveller
                          {req.travellers?.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="hidden sm:inline text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium">
                        {format(new Date(req.createdAt || Date.now()), "dd MMM • hh:mm a")}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="text-gray-600" size={22} />
                      ) : (
                        <ChevronDown className="text-gray-600" size={22} />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-6 md:p-8 lg:grid lg:grid-cols-2 lg:gap-12">
                      {/* Original */}
                      <div className="pb-10 lg:pb-0 lg:pr-10">
                        <h4 className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                          Current Booking
                        </h4>

                        <div className="space-y-8">
                          <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-100">
                            <div className="font-medium text-gray-700 mb-3">Payment</div>
                            <div className="grid grid-cols-2 gap-6 text-sm">
                              <div>
                                Advance:{" "}
                                <span className="font-semibold">
                                  ₹{(orig.payment?.advance?.amount || 0).toLocaleString()}
                                </span>
                              </div>
                              <div>
                                Balance:{" "}
                                <span className="font-semibold">
                                  ₹{(orig.payment?.balance?.amount || 0).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="font-medium text-gray-700 mb-4">
                              Travellers ({orig.travellers?.length || 0})
                            </div>
                            {orig.travellers?.map((t, i) => {
                              const status = getCancellationStatus(t);
                              return (
                                <div
                                  key={i}
                                  className="mb-6 last:mb-0 p-6 bg-gray-50/50 rounded-2xl border border-gray-100 relative"
                                >
                                  <div className="font-medium text-gray-800 mb-4 text-base">
                                    {t.title} {t.firstName} {t.lastName}
                                  </div>

                                  {status && (
                                    <span
                                      className={`absolute top-4 right-4 text-xs px-2.5 py-1 rounded-full font-medium border ${status.color}`}
                                    >
                                      {status.text}
                                    </span>
                                  )}

                                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-600">
                                    <div>Age: {t.age || "—"}</div>
                                    <div>Gender: {t.gender || "—"}</div>
                                    <div>
                                      Package:{" "}
                                      {t.packageType === "main"
                                        ? "Main Package"
                                        : `Variant ${t.variantPackageIndex ?? "?"}`}
                                    </div>
                                    <div>Sharing: {t.sharingType || "—"}</div>
                                    <div>Boarding: {renderPoint(t.boardingPoint)}</div>
                                    <div>Deboarding: {renderPoint(t.deboardingPoint)}</div>
                                    <div className="col-span-2 pt-2">
                                      <div className="mb-1.5">Add-on:</div>
                                      {renderAddonLine(t)}
                                    </div>
                                    <div className="col-span-2 pt-1">
                                      Remarks: {t.remarks || "—"}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Requested */}
                      <div className="pt-10 lg:pt-0 lg:pl-10">
                        <h4 className="text-lg font-semibold text-indigo-700 mb-6 flex items-center gap-2.5">
                          <ArrowRightLeft className="text-indigo-400" size={20} />
                          Requested Changes
                        </h4>

                        <div className="space-y-8">
                          <div className="bg-indigo-50/40 p-6 rounded-2xl border border-indigo-100/60">
                            <div className="font-medium text-indigo-700 mb-3">Payment Update</div>
                            <div className="grid grid-cols-2 gap-6 text-sm">
                              <div>
                                Advance:{" "}
                                <span
                                  className={getDiffColor(
                                    orig.payment?.advance?.amount || 0,
                                    req.updatedAdvance
                                  )}
                                >
                                  ₹{(req.updatedAdvance || 0).toLocaleString()}
                                </span>
                              </div>
                              <div>
                                Balance:{" "}
                                <span
                                  className={getDiffColor(
                                    orig.payment?.balance?.amount || 0,
                                    req.updatedBalance
                                  )}
                                >
                                  ₹{(req.updatedBalance || 0).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="font-medium text-indigo-700 mb-4">
                              Travellers ({req.travellers?.length || 0})
                            </div>

                            {req.travellers?.map((t, i) => {
                              const ot = orig.travellers?.[i] || {};

                              const nameOld = `${ot.title || ""} ${ot.firstName || ""} ${ot.lastName || ""}`.trim();
                              const nameNew = `${t.title || ""} ${t.firstName || ""} ${t.lastName || ""}`.trim();
                              const nameChanged = nameOld !== nameNew;

                              const status = getCancellationStatus(t);

                              return (
                                <div
                                  key={i}
                                  className="mb-6 last:mb-0 p-6 bg-purple-50/30 rounded-2xl border border-purple-100/50 relative"
                                >
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="font-semibold text-gray-800 text-base">
                                      {nameChanged ? (
                                        <span className="text-emerald-600">
                                          {t.title} {t.firstName} {t.lastName}
                                        </span>
                                      ) : (
                                        <>
                                          {t.title} {t.firstName} {t.lastName}
                                        </>
                                      )}
                                    </div>
                                    {nameChanged && (
                                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                                        Name changed
                                      </span>
                                    )}
                                  </div>

                                  {status && (
                                    <span
                                      className={`absolute top-4 right-4 text-xs px-2.5 py-1 rounded-full font-medium border ${status.color}`}
                                    >
                                      {status.text}
                                    </span>
                                  )}

                                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-600">
                                    <div>
                                      Age:{" "}
                                      <span className={getDiffColor(ot.age, t.age)}>
                                        {t.age || "—"}
                                      </span>
                                    </div>
                                    <div>
                                      Gender:{" "}
                                      <span className={getDiffColor(ot.gender, t.gender)}>
                                        {t.gender || "—"}
                                      </span>
                                    </div>
                                    <div>
                                      Package:{" "}
                                      <span
                                        className={getDiffColor(ot.packageType, t.packageType)}
                                      >
                                        {t.packageType === "main"
                                          ? "Main Package"
                                          : `Variant ${t.variantPackageIndex ?? "?"}`}
                                      </span>
                                    </div>
                                    <div>
                                      Sharing:{" "}
                                      <span
                                        className={getDiffColor(ot.sharingType, t.sharingType)}
                                      >
                                        {t.sharingType || "—"}
                                      </span>
                                    </div>
                                    <div>
                                      Boarding:{" "}
                                      <span
                                        className={getDiffColor(
                                          renderPoint(ot.boardingPoint),
                                          renderPoint(t.boardingPoint)
                                        )}
                                      >
                                        {renderPoint(t.boardingPoint)}
                                      </span>
                                    </div>
                                    <div>
                                      Deboarding:{" "}
                                      <span
                                        className={getDiffColor(
                                          renderPoint(ot.deboardingPoint),
                                          renderPoint(t.deboardingPoint)
                                        )}
                                      >
                                        {renderPoint(t.deboardingPoint)}
                                      </span>
                                    </div>
                                    <div className="col-span-2 pt-2">
                                      <div className="mb-1.5">Add-on:</div>
                                      {renderAddonLine(t, ot)}
                                    </div>
                                    <div className="col-span-2 pt-1">
                                      Remarks:{" "}
                                      <span className={getDiffColor(ot.remarks, t.remarks)}>
                                        {t.remarks || "—"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-10 flex flex-col sm:flex-row gap-4">
                          <button
                            onClick={() => handleApprove(req.bookingId?._id || req.bookingId)}
                            disabled={actionLoading}
                            className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-medium shadow-md hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-60 transition-all"
                          >
                            Approve Changes
                          </button>
                          <button
                            onClick={() => handleReject(req.bookingId?._id || req.bookingId)}
                            disabled={actionLoading}
                            className="flex-1 py-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-2xl font-medium shadow-md hover:from-rose-600 hover:to-rose-700 disabled:opacity-60 transition-all"
                          >
                            Reject Request
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <ToastContainer
          position="top-center"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </div>
  );
};

export default BookingApprovals;
