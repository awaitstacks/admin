
// import { useEffect, useContext, useMemo, useState, useCallback } from "react";
// import { useLocation } from "react-router-dom";
// import { TourContext } from "../../context/TourContext";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import {
//   ChevronDown, ChevronUp, IndianRupee, Users, Mail, Phone, MapPin,
//   Calendar, CheckCircle, Clock, AlertTriangle, Copy, FileText,
//   XCircle
// } from "lucide-react";

// const TourDashboard = () => {
//   const {
//     tourList,
//     getTourList,
//     dashData,
//     bookings,
//     getDashData,
//     getBookings,
//     markAdvanceReceiptSent,
//     markBalanceReceiptSent,
//     markModifyReceipt,
//     ttoken,
//   } = useContext(TourContext);

//   const [selectedTourId, setSelectedTourId] = useState("");
//   const [expandedStates, setExpandedStates] = useState({
//     advance: new Set(),
//     balance: new Set(),
//     modify: new Set(),
//     uncompleted: new Set(),
//   });
//   const [dismissedBookings, setDismissedBookings] = useState(new Set());
//   const [isLoading, setIsLoading] = useState(false);

//   const location = useLocation();
//   const [showConfirmLeave, setShowConfirmLeave] = useState(false);

//   const shouldProtect = Boolean(
//     selectedTourId && !isLoading && bookings && bookings.length > 0,
//   );

//   // Browser leave protection
//   useEffect(() => {
//     if (!shouldProtect) return;
//     const handleBeforeUnload = (e) => {
//       e.preventDefault();
//       e.returnValue = "";
//     };
//     window.addEventListener("beforeunload", handleBeforeUnload);
//     return () => window.removeEventListener("beforeunload", handleBeforeUnload);
//   }, [shouldProtect]);

//   // Back button protection
//   useEffect(() => {
//     if (!shouldProtect) return;
//     window.history.pushState(null, null, window.location.href);
//     const handlePopState = () => setShowConfirmLeave(true);
//     window.addEventListener("popstate", handlePopState);
//     return () => window.removeEventListener("popstate", handlePopState);
//   }, [shouldProtect]);

//   const handleConfirmLeave = () => {
//     setShowConfirmLeave(false);
//     window.history.back();
//   };

//   const handleCancelLeave = () => {
//     setShowConfirmLeave(false);
//     window.history.pushState(null, null, window.location.href);
//   };

//   useEffect(() => {
//     return () => toast.dismiss();
//   }, [location]);

//   const handleApiResponse = useCallback((response, successMsg, errorMsg) => {
//     if (response?.success) {
//       toast.success(successMsg || "Operation successful");
//       return true;
//     } else {
//       toast.error(response?.message || errorMsg || "Operation failed");
//       return false;
//     }
//   }, []);

//   useEffect(() => {
//     if (ttoken) {
//       setIsLoading(true);
//       getTourList()
//         .then((res) => handleApiResponse(res, "Tours loaded"))
//         .catch((err) => toast.error(err.message || "Failed to load tours"))
//         .finally(() => setIsLoading(false));
//     }
//   }, [ttoken, getTourList, handleApiResponse]);

//   useEffect(() => {
//     if (ttoken && selectedTourId) {
//       setIsLoading(true);
//       Promise.all([getDashData(selectedTourId), getBookings(selectedTourId)])
//         .then(([dashRes]) => handleApiResponse(dashRes, "Dashboard updated"))
//         .catch((err) => toast.error(err.message || "Failed to load data"))
//         .finally(() => setIsLoading(false));
//     }
//   }, [ttoken, selectedTourId, getDashData, getBookings, handleApiResponse]);

//   const stats = useMemo(() => {
//     if (!bookings?.length) {
//       return {
//         totalBookings: 0,
//         totalTravellers: 0,
//         completedBookings: 0,
//         pendingBookings: 0,
//         unverifiedBookings: 0,
//         cancelledBookings: 0,
//         rejectedBookings: 0,
//         advancePaidAmount: 0,
//         balancePaidAmount: 0,
//         totalEarnings: 0,
//         advancePending: [],
//         balancePending: [],
//         uncompleted: [],
//         modifyReceiptPending: [],
//       };
//     }

//     let totalBookingsCount = 0;
//     let totalTravellersCount = 0;

//     let completed = 0;
//     let pending = 0;
//     let unverified = 0;
//     let cancelled = 0;
//     let rejected = 0;

//     let advancePaidAmount = 0;
//     let balancePaidAmount = 0;

//     let advancePending = [];
//     let balancePending = [];
//     let uncompleted = [];
//     let modifyReceiptPending = [];

//     bookings.forEach((b) => {
//       if (b.tnr) totalBookingsCount++;

//       const advanceVerified = !!b.payment?.advance?.paymentVerified;

//       if (advanceVerified) {
//         const validTravellers = b.travellers?.filter((trav) => {
//           if (!trav) return false;
//           if (trav.cancelled?.byTraveller || trav.cancelled?.byAdmin) {
//             return false;
//           }
//           return true;
//         }) || [];
//         totalTravellersCount += validTravellers.length;
//       }

//       const isFullyCancelled = b.travellers?.length > 0 &&
//         b.travellers.every((t) => t.cancelled?.byTraveller && t.cancelled?.byAdmin);

//       const isRejectedByAdmin = b.travellers?.length > 0 &&
//         b.travellers.every((t) => t.cancelled?.byAdmin && !t.cancelled?.byTraveller);

//       const advancePaid = !!b.payment?.advance?.paid;
//       const balancePaid = !!b.payment?.balance?.paid;

//       if (isFullyCancelled) cancelled++;
//       else if (isRejectedByAdmin) rejected++;
//       else if (advancePaid && balancePaid) completed++;
//       else if (advancePaid && !balancePaid) pending++;
//       else unverified++;

//       const hasAnyCancelledTraveller = b.travellers?.some(
//         (t) => t.cancelled?.byTraveller || t.cancelled?.byAdmin
//       );

//       const bothPaidWithCancellation = advancePaid && balancePaid && hasAnyCancelledTraveller;
//       const isExcluded = isFullyCancelled || isRejectedByAdmin || bothPaidWithCancellation;

//       if (!isExcluded && advancePaid && advanceVerified) {
//         advancePaidAmount += b.payment?.advance?.amount || 0;
//       }

//       if (!isExcluded && balancePaid) {
//         balancePaidAmount += b.payment?.balance?.amount || 0;
//       }

//       if (advanceVerified && !b.receipts?.advanceReceiptSent) {
//         advancePending.push(b);
//       }
//       if (balancePaid && !b.receipts?.balanceReceiptSent) {
//         balancePending.push(b);
//       }
//       if (b.isTripCompleted && !isFullyCancelled) {
//         modifyReceiptPending.push(b);
//       }
//       if (!b.isBookingCompleted && !isFullyCancelled) {
//         uncompleted.push(b);
//       }
//     });

//     const totalEarnings = advancePaidAmount + balancePaidAmount;

//     console.log("✅ Final Total Travellers Count:", totalTravellersCount);
//     console.log("📊 Total Earnings:", totalEarnings);

//     return {
//       totalBookings: totalBookingsCount,
//       totalTravellers: totalTravellersCount,
//       completedBookings: completed,
//       pendingBookings: pending,
//       unverifiedBookings: unverified,
//       cancelledBookings: cancelled,
//       rejectedBookings: rejected,
//       advancePaidAmount,
//       balancePaidAmount,
//       totalEarnings,
//       advancePending: advancePending.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)),
//       balancePending: balancePending.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)),
//       uncompleted: uncompleted.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)),
//       modifyReceiptPending: modifyReceiptPending.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)),
//     };
//   }, [bookings]);

//   const toggleExpand = (section, tnr) => {
//     setExpandedStates((prev) => {
//       const newSets = { ...prev };
//       const sectionSet = new Set(newSets[section]);
//       if (sectionSet.has(tnr)) {
//         sectionSet.delete(tnr);
//       } else {
//         sectionSet.add(tnr);
//       }
//       newSets[section] = sectionSet;
//       return newSets;
//     });
//   };

//   const handleMarkReceipt = async (booking, type) => {
//     if (!selectedTourId) {
//       toast.error("Please select a tour first.");
//       return;
//     }

//     const typeNames = {
//       advance: "Advance Receipt",
//       balance: "Balance Receipt",
//       modify: "Modified Receipt",
//     };

//     if (!window.confirm(`Mark ${typeNames[type]} as complete?`)) return;

//     setIsLoading(true);
//     try {
//       let res;
//       if (type === "advance") {
//         res = await markAdvanceReceiptSent(booking.tnr, selectedTourId);
//       } else if (type === "balance") {
//         if (!booking.payment?.balance?.paid) {
//           toast.error("Balance payment not marked as paid yet.");
//           return;
//         }
//         res = await markBalanceReceiptSent(booking.tnr, selectedTourId);
//       } else if (type === "modify") {
//         res = await markModifyReceipt(booking.tnr, selectedTourId);
//       }

//       if (handleApiResponse(res, `${typeNames[type]} marked as complete`)) {
//         setDismissedBookings((prev) => {
//           const newSet = new Set(prev);
//           newSet.add(booking.tnr);
//           return newSet;
//         });

//         if (type === "balance" && getBookings) {
//           await getBookings(selectedTourId);
//           toast.success("Balance receipt completed! ✅");
//         }
//       }
//     } catch (err) {
//       toast.error(err.message || "Failed to update");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const copyTNR = (tnr) => {
//     if (!tnr) return;
//     navigator.clipboard.writeText(tnr).then(
//       () => toast.success("TNR copied!"),
//       () => toast.error("Failed to copy"),
//     );
//   };

//   const renderBookingCards = (list, type) => {
//     const filtered =
//       type === "advance" || type === "balance" || type === "modify"
//         ? list.filter((b) => !dismissedBookings.has(b.tnr))
//         : list;

//     if (!filtered.length) {
//       return (
//         <div className="text-center py-8 text-gray-500 italic">
//           🎉 No pending {type} actions — great job!
//         </div>
//       );
//     }

//     return (
//       <div className="space-y-4">
//         {filtered.map((booking) => {
//           const isExpanded = expandedStates[type]?.has(booking.tnr);
//           const firstTrav = booking.travellers?.[0] || {};
//           const travellerName =
//             `${firstTrav.firstName || ""} ${firstTrav.lastName || ""}`.trim() ||
//             "Unknown Traveller";

//           if (!booking.tnr) {
//             return (
//               <div
//                 key="missing"
//                 className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
//               >
//                 <AlertTriangle size={20} className="inline mr-2" />
//                 Booking missing TNR — cannot display properly
//               </div>
//             );
//           }

//           return (
//             <div
//               key={booking.tnr}
//               className="bg-white border rounded-xl shadow-sm hover:shadow transition-all overflow-hidden"
//             >
//               <div
//                 className="p-4 flex items-center justify-between cursor-pointer bg-gray-50 hover:bg-gray-100"
//                 onClick={() => toggleExpand(type, booking.tnr)}
//               >
//                 <div className="flex-1">
//                   <div className="flex items-center gap-3">
//                     <div className="font-bold text-lg text-gray-900">
//                       {travellerName}
//                     </div>
//                     <div className="flex items-center gap-2 text-sm">
//                       <span className="font-mono font-bold text-indigo-700 tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
//                         {booking.tnr}
//                       </span>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           copyTNR(booking.tnr);
//                         }}
//                         className="text-blue-600 hover:text-blue-800"
//                         title="Copy TNR"
//                       >
//                         <Copy size={16} />
//                       </button>
//                     </div>
//                   </div>
//                   <div className="text-sm text-gray-600 mt-1">
//                     {booking.contact?.email || "—"} •{" "}
//                     {booking.contact?.mobile || "—"}
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-4">
//                   {type !== "uncompleted" && (
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleMarkReceipt(booking, type);
//                       }}
//                       disabled={isLoading}
//                       className={`px-4 py-2 text-sm font-medium rounded-lg transition ${isLoading
//                         ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                         : "bg-green-600 text-white hover:bg-green-700"
//                         }`}
//                     >
//                       {isLoading ? "Processing..." : "Mark Complete"}
//                     </button>
//                   )}
//                   {isExpanded ? (
//                     <ChevronUp size={20} />
//                   ) : (
//                     <ChevronDown size={20} />
//                   )}
//                 </div>
//               </div>

//               {isExpanded && (
//                 <div className="p-5 bg-white border-t space-y-6 text-sm">
//                   <div>
//                     <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
//                       <Users size={18} className="text-indigo-600" />
//                       Travellers ({booking.travellers?.length || 0})
//                     </h3>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {booking.travellers?.map((t, idx) => (
//                         <div
//                           key={idx}
//                           className={`p-4 rounded-lg border ${t.cancelled?.byTraveller || t.cancelled?.byAdmin
//                             ? "bg-red-50 border-red-200"
//                             : "bg-gray-50 border-gray-200"
//                             }`}
//                         >
//                           <p className="font-medium">
//                             {t.title} {t.firstName} {t.lastName}
//                             <span className="text-gray-600 ml-2">
//                               ({t.age} yrs, {t.gender || "—"})
//                             </span>
//                           </p>
//                           <p className="mt-1">
//                             <strong>Sharing:</strong> {t.sharingType || "—"}
//                           </p>
//                           <p>
//                             <strong>Package:</strong> {t.packageType || "—"}
//                             {t.variantPackageIndex != null &&
//                               ` (Var ${t.variantPackageIndex})`}
//                           </p>
//                           {t.selectedAddon?.name && (
//                             <p>
//                               <strong>Add-on:</strong> {t.selectedAddon.name} (₹
//                               {t.selectedAddon.price})
//                             </p>
//                           )}
//                           {t.boardingPoint?.stationName && (
//                             <p>
//                               <strong>Boarding:</strong>{" "}
//                               {t.boardingPoint.stationName} (
//                               {t.boardingPoint.stationCode})
//                             </p>
//                           )}
//                           {t.deboardingPoint?.stationName && (
//                             <p>
//                               <strong>Deboarding:</strong>{" "}
//                               {t.deboardingPoint.stationName} (
//                               {t.deboardingPoint.stationCode})
//                             </p>
//                           )}
//                           {t.remarks && (
//                             <p className="mt-2 italic text-gray-600">
//                               Remarks: {t.remarks}
//                             </p>
//                           )}
//                           {(t.cancelled?.byTraveller ||
//                             t.cancelled?.byAdmin) && (
//                               <p className="mt-2 text-red-600 font-medium">
//                                 Cancelled (
//                                 {t.cancelled.byAdmin
//                                   ? "by Admin"
//                                   : "by Traveller"}
//                                 )
//                               </p>
//                             )}
//                         </div>
//                       )) || (
//                           <p className="text-gray-500 col-span-2">
//                             No travellers
//                           </p>
//                         )}
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <h3 className="font-semibold mb-2 flex items-center gap-2">
//                         <Mail size={16} /> Contact
//                       </h3>
//                       <p>Email: {booking.contact?.email || "—"}</p>
//                       <p>Mobile: {booking.contact?.mobile || "—"}</p>
//                     </div>

//                     <div>
//                       <h3 className="font-semibold mb-2 flex items-center gap-2">
//                         <MapPin size={16} /> Billing Address
//                       </h3>
//                       <p>
//                         {booking.billingAddress?.addressLine1 || "—"}{" "}
//                         {booking.billingAddress?.addressLine2 || ""}
//                       </p>
//                       <p>
//                         {booking.billingAddress?.city || "—"},{" "}
//                         {booking.billingAddress?.state || "—"} -{" "}
//                         {booking.billingAddress?.pincode || "—"}
//                       </p>
//                       <p>{booking.billingAddress?.country || "India"}</p>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <h3 className="font-semibold mb-2">Payment Status</h3>
//                       <p>
//                         Advance: ₹{booking.payment?.advance?.amount || 0} —{" "}
//                         {booking.payment?.advance?.paid ? (
//                           <span className="text-green-600">Paid</span>
//                         ) : (
//                           <span className="text-red-600">Pending</span>
//                         )}
//                       </p>
//                       <p>
//                         Balance: ₹{booking.payment?.balance?.amount || 0} —{" "}
//                         {booking.payment?.balance?.paid ? (
//                           <span className="text-green-600">Paid</span>
//                         ) : (
//                           <span className="text-red-600">Pending</span>
//                         )}
//                       </p>
//                     </div>

//                     <div>
//                       <h3 className="font-semibold mb-2">Receipt Status</h3>
//                       <p>
//                         Advance Receipt:{" "}
//                         {booking.receipts?.advanceReceiptSent ? (
//                           <span className="text-green-600">Sent</span>
//                         ) : (
//                           <span className="text-orange-600">Pending</span>
//                         )}
//                       </p>
//                       <p>
//                         Balance Receipt:{" "}
//                         {booking.receipts?.balanceReceiptSent ? (
//                           <span className="text-green-600">Sent</span>
//                         ) : (
//                           <span className="text-orange-600">Pending</span>
//                         )}
//                       </p>
//                     </div>
//                   </div>

//                   {(booking.adminRemarks?.length > 0 ||
//                     booking.advanceAdminRemarks?.length > 0) && (
//                       <div>
//                         <h3 className="font-semibold mb-2 flex items-center gap-2">
//                           <FileText size={16} /> Admin Remarks
//                         </h3>
//                         <div className="space-y-2">
//                           {booking.advanceAdminRemarks?.map((r, i) => (
//                             <div key={i} className="bg-gray-50 p-3 rounded text-sm">
//                               <p>{r.remark} (₹{r.amount || 0})</p>
//                               <p className="text-xs text-gray-500 mt-1">
//                                 {new Date(r.addedAt).toLocaleString()}
//                               </p>
//                             </div>
//                           ))}
//                           {booking.adminRemarks?.map((r, i) => (
//                             <div key={i} className="bg-gray-50 p-3 rounded text-sm">
//                               <p>{r.remark} (₹{r.amount || 0})</p>
//                               <p className="text-xs text-gray-500 mt-1">
//                                 {new Date(r.addedAt).toLocaleString()}
//                               </p>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     );
//   };

//   return (
//     <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
//       <ToastContainer position="top-right" autoClose={4000} />

//       <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
//         Tour Dashboard
//       </h1>

//       {isLoading ? (
//         <div className="text-center py-12 text-gray-600">
//           Loading dashboard...
//         </div>
//       ) : !ttoken ? (
//         <div className="text-center py-12 text-gray-600">
//           Please log in to view dashboard
//         </div>
//       ) : (
//         <>
//           <div className="mb-8 max-w-md mx-auto">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Select Tour
//             </label>
//             <select
//               value={selectedTourId}
//               onChange={(e) => setSelectedTourId(e.target.value)}
//               className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
//               disabled={isLoading}
//             >
//               <option value="">-- Select a Tour --</option>
//               {tourList.map((tour) => (
//                 <option key={tour._id} value={tour._id}>
//                   {tour.title}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {!selectedTourId ? (
//             <div className="text-center py-12 text-gray-600">
//               Please select a tour to view details
//             </div>
//           ) : (
//             <div className="space-y-10">

//               {/* ====================== STATISTICS CARDS ====================== */}
//               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-10 gap-4 md:gap-5">

//                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
//                   <div className="w-10 h-10 mx-auto bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
//                     <FileText size={24} />
//                   </div>
//                   <p className="text-xs font-medium text-gray-600">Total TNRs</p>
//                   <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBookings}</p>
//                 </div>

//                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
//                   <div className="w-10 h-10 mx-auto bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
//                     <Users size={24} />
//                   </div>
//                   <p className="text-xs font-medium text-gray-600">Total Travellers</p>
//                   <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.totalTravellers}</p>
//                 </div>

//                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
//                   <div className="w-10 h-10 mx-auto bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-3">
//                     <CheckCircle size={24} />
//                   </div>
//                   <p className="text-xs font-medium text-gray-600">Completed</p>
//                   <p className="text-3xl font-bold text-green-600 mt-1">{stats.completedBookings}</p>
//                 </div>

//                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
//                   <div className="w-10 h-10 mx-auto bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center mb-3">
//                     <IndianRupee size={24} />
//                   </div>
//                   <p className="text-xs font-medium text-gray-600">Advance Paid</p>
//                   <p className="text-2xl font-bold text-blue-700 mt-1">
//                     ₹{stats.advancePaidAmount.toLocaleString("en-IN")}
//                   </p>
//                 </div>

//                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
//                   <div className="w-10 h-10 mx-auto bg-yellow-50 text-yellow-700 rounded-xl flex items-center justify-center mb-3">
//                     <IndianRupee size={24} />
//                   </div>
//                   <p className="text-xs font-medium text-gray-600">Balance Paid</p>
//                   <p className="text-2xl font-bold text-yellow-700 mt-1">
//                     ₹{stats.balancePaidAmount.toLocaleString("en-IN")}
//                   </p>
//                 </div>

//                 {/* NEW - TOTAL EARNINGS */}
//                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center col-span-2 lg:col-span-1">
//                   <div className="w-10 h-10 mx-auto bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
//                     <IndianRupee size={24} />
//                   </div>
//                   <p className="text-xs font-medium text-gray-600">Total Earnings</p>
//                   <p className="text-2xl font-bold text-emerald-700 mt-1">
//                     ₹{stats.totalEarnings.toLocaleString("en-IN")}
//                   </p>
//                 </div>

//                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
//                   <div className="w-10 h-10 mx-auto bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-3">
//                     <Clock size={24} />
//                   </div>
//                   <p className="text-xs font-medium text-gray-600">Pending</p>
//                   <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pendingBookings}</p>
//                 </div>

//                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
//                   <div className="w-10 h-10 mx-auto bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center mb-3">
//                     <AlertTriangle size={24} />
//                   </div>
//                   <p className="text-xs font-medium text-gray-600">Unverified</p>
//                   <p className="text-3xl font-bold text-gray-500 mt-1">{stats.unverifiedBookings}</p>
//                 </div>

//                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
//                   <div className="w-10 h-10 mx-auto bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-3">
//                     <XCircle size={24} />
//                   </div>
//                   <p className="text-xs font-medium text-gray-600">Cancelled</p>
//                   <p className="text-3xl font-bold text-red-600 mt-1">{stats.cancelledBookings}</p>
//                 </div>

//                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
//                   <div className="w-10 h-10 mx-auto bg-red-50 text-red-700 rounded-xl flex items-center justify-center mb-3">
//                     <AlertTriangle size={24} />
//                   </div>
//                   <p className="text-xs font-medium text-gray-600">Rejected</p>
//                   <p className="text-3xl font-bold text-red-700 mt-1">{stats.rejectedBookings}</p>
//                 </div>

//               </div>

//               {/* Pending Sections */}
//               <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
//                 <div className="p-6 border-b bg-gray-50">
//                   <h2 className="text-xl font-semibold flex items-center gap-3">
//                     <IndianRupee size={24} className="text-blue-600" />
//                     Advance Receipt Pending ({stats.advancePending.length})
//                   </h2>
//                 </div>
//                 <div className="p-6">
//                   {renderBookingCards(stats.advancePending, "advance")}
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
//                 <div className="p-6 border-b bg-gray-50">
//                   <h2 className="text-xl font-semibold flex items-center gap-3">
//                     <IndianRupee size={24} className="text-yellow-600" />
//                     Balance Receipt Pending ({stats.balancePending.length})
//                   </h2>
//                 </div>
//                 <div className="p-6">
//                   {renderBookingCards(stats.balancePending, "balance")}
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
//                 <div className="p-6 border-b bg-gray-50">
//                   <h2 className="text-xl font-semibold flex items-center gap-3">
//                     <FileText size={24} className="text-purple-600" />
//                     Modified Receipts Pending ({stats.modifyReceiptPending.length})
//                   </h2>
//                 </div>
//                 <div className="p-6">
//                   {renderBookingCards(stats.modifyReceiptPending, "modify")}
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
//                 <div className="p-6 border-b bg-gray-50">
//                   <h2 className="text-xl font-semibold flex items-center gap-3">
//                     <Clock size={24} className="text-orange-600" />
//                     Uncompleted Bookings ({stats.uncompleted.length})
//                   </h2>
//                 </div>
//                 <div className="p-6">
//                   {renderBookingCards(stats.uncompleted, "uncompleted")}
//                 </div>
//               </div>

//             </div>
//           )}
//         </>
//       )}

//       {showConfirmLeave && (
//         <div
//           className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
//           onClick={handleCancelLeave}
//         >
//           <div
//             className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <h2 className="text-2xl font-bold text-gray-800 mb-4">
//               Leave this page?
//             </h2>
//             <p className="text-gray-600 mb-8">
//               You are viewing dashboard for{" "}
//               <strong>
//                 {tourList.find((t) => t._id === selectedTourId)?.title ||
//                   "this tour"}
//               </strong>
//               .<br />
//               Leaving will clear current view.
//             </p>
//             <div className="flex gap-4 justify-end">
//               <button
//                 onClick={handleCancelLeave}
//                 className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleConfirmLeave}
//                 className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
//               >
//                 Yes, Leave
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TourDashboard;


import { useEffect, useContext, useMemo, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { TourContext } from "../../context/TourContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ChevronDown, ChevronUp, IndianRupee, Users, Mail, Phone, MapPin,
  Calendar, CheckCircle, Clock, AlertTriangle, Copy, FileText,
  XCircle
} from "lucide-react";

const TourDashboard = () => {
  const {
    tourList,
    getTourList,
    dashData,
    bookings,
    getDashData,
    getBookings,
    markAdvanceReceiptSent,
    markBalanceReceiptSent,
    markModifyReceipt,
    ttoken,
  } = useContext(TourContext);

  const [selectedTourId, setSelectedTourId] = useState("");
  const [expandedStates, setExpandedStates] = useState({
    advance: new Set(),
    balance: new Set(),
    modify: new Set(),
    uncompleted: new Set(),
  });
  const [dismissedBookings, setDismissedBookings] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  const shouldProtect = Boolean(
    selectedTourId && !isLoading && bookings && bookings.length > 0,
  );

  useEffect(() => {
    if (!shouldProtect) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldProtect]);

  useEffect(() => {
    if (!shouldProtect) return;
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => setShowConfirmLeave(true);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [shouldProtect]);

  const handleConfirmLeave = () => {
    setShowConfirmLeave(false);
    window.history.back();
  };

  const handleCancelLeave = () => {
    setShowConfirmLeave(false);
    window.history.pushState(null, null, window.location.href);
  };

  useEffect(() => {
    return () => toast.dismiss();
  }, [location]);

  const handleApiResponse = useCallback((response, successMsg, errorMsg) => {
    if (response?.success) {
      toast.success(successMsg || "Operation successful");
      return true;
    } else {
      toast.error(response?.message || errorMsg || "Operation failed");
      return false;
    }
  }, []);

  useEffect(() => {
    if (ttoken) {
      setIsLoading(true);
      getTourList()
        .then((res) => handleApiResponse(res, "Tours loaded"))
        .catch((err) => toast.error(err.message || "Failed to load tours"))
        .finally(() => setIsLoading(false));
    }
  }, [ttoken, getTourList, handleApiResponse]);

  useEffect(() => {
    if (ttoken && selectedTourId) {
      setIsLoading(true);
      Promise.all([getDashData(selectedTourId), getBookings(selectedTourId)])
        .then(([dashRes]) => handleApiResponse(dashRes, "Dashboard updated"))
        .catch((err) => toast.error(err.message || "Failed to load data"))
        .finally(() => setIsLoading(false));
    }
  }, [ttoken, selectedTourId, getDashData, getBookings, handleApiResponse]);

  const stats = useMemo(() => {
    if (!bookings?.length) {
      return {
        totalBookings: 0,
        totalTravellers: 0,
        completedBookings: 0,
        pendingBookings: 0,
        unverifiedBookings: 0,
        cancelledBookings: 0,
        rejectedBookings: 0,
        advancePaidAmount: 0,
        balancePaidAmount: 0,
        totalEarnings: 0,
        advancePending: [],
        balancePending: [],
        uncompleted: [],
        modifyReceiptPending: [],
      };
    }

    let totalBookingsCount = 0;
    let totalTravellersCount = 0;
    let completed = 0;
    let pending = 0;
    let unverified = 0;
    let cancelled = 0;
    let rejected = 0;
    let advancePaidAmount = 0;
    let balancePaidAmount = 0;
    let advancePending = [];
    let balancePending = [];
    let uncompleted = [];
    let modifyReceiptPending = [];

    bookings.forEach((b) => {
      if (b.tnr) totalBookingsCount++;

      const advanceVerified = !!b.payment?.advance?.paymentVerified;

      if (advanceVerified) {
        const validTravellers = b.travellers?.filter((trav) => {
          if (!trav) return false;
          if (trav.cancelled?.byTraveller || trav.cancelled?.byAdmin) return false;
          return true;
        }) || [];
        totalTravellersCount += validTravellers.length;
      }

      const isFullyCancelled = b.travellers?.length > 0 &&
        b.travellers.every((t) => t.cancelled?.byTraveller && t.cancelled?.byAdmin);

      const isRejectedByAdmin = b.travellers?.length > 0 &&
        b.travellers.every((t) => t.cancelled?.byAdmin && !t.cancelled?.byTraveller);

      const advancePaid = !!b.payment?.advance?.paid;
      const balancePaid = !!b.payment?.balance?.paid;

      if (isFullyCancelled) cancelled++;
      else if (isRejectedByAdmin) rejected++;
      else if (advancePaid && balancePaid) completed++;
      else if (advancePaid && !balancePaid) pending++;
      else unverified++;

      const hasAnyCancelledTraveller = b.travellers?.some(
        (t) => t.cancelled?.byTraveller || t.cancelled?.byAdmin
      );

      const bothPaidWithCancellation = advancePaid && balancePaid && hasAnyCancelledTraveller;
      const isExcluded = isFullyCancelled || isRejectedByAdmin || bothPaidWithCancellation;

      if (!isExcluded && advancePaid && advanceVerified) {
        advancePaidAmount += b.payment?.advance?.amount || 0;
      }

      if (!isExcluded && balancePaid) {
        balancePaidAmount += b.payment?.balance?.amount || 0;
      }

      if (advanceVerified && !b.receipts?.advanceReceiptSent) {
        advancePending.push(b);
      }
      if (balancePaid && !b.receipts?.balanceReceiptSent) {
        balancePending.push(b);
      }
      if (b.isTripCompleted && !isFullyCancelled) {
        modifyReceiptPending.push(b);
      }
      if (!b.isBookingCompleted && !isFullyCancelled) {
        uncompleted.push(b);
      }
    });

    const totalEarnings = advancePaidAmount + balancePaidAmount;

    console.log("✅ Final Total Travellers Count:", totalTravellersCount);
    console.log("📊 Total Earnings:", totalEarnings);

    return {
      totalBookings: totalBookingsCount,
      totalTravellers: totalTravellersCount,
      completedBookings: completed,
      pendingBookings: pending,
      unverifiedBookings: unverified,
      cancelledBookings: cancelled,
      rejectedBookings: rejected,
      advancePaidAmount,
      balancePaidAmount,
      totalEarnings,
      advancePending: advancePending.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)),
      balancePending: balancePending.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)),
      uncompleted: uncompleted.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)),
      modifyReceiptPending: modifyReceiptPending.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)),
    };
  }, [bookings]);

  const toggleExpand = (section, tnr) => {
    setExpandedStates((prev) => {
      const newSets = { ...prev };
      const sectionSet = new Set(newSets[section]);
      if (sectionSet.has(tnr)) {
        sectionSet.delete(tnr);
      } else {
        sectionSet.add(tnr);
      }
      newSets[section] = sectionSet;
      return newSets;
    });
  };

  const handleMarkReceipt = async (booking, type) => {
    if (!selectedTourId) {
      toast.error("Please select a tour first.");
      return;
    }

    const typeNames = {
      advance: "Advance Receipt",
      balance: "Balance Receipt",
      modify: "Modified Receipt",
    };

    if (!window.confirm(`Mark ${typeNames[type]} as complete?`)) return;

    setIsLoading(true);
    try {
      let res;
      if (type === "advance") {
        res = await markAdvanceReceiptSent(booking.tnr, selectedTourId);
      } else if (type === "balance") {
        if (!booking.payment?.balance?.paid) {
          toast.error("Balance payment not marked as paid yet.");
          return;
        }
        res = await markBalanceReceiptSent(booking.tnr, selectedTourId);
      } else if (type === "modify") {
        res = await markModifyReceipt(booking.tnr, selectedTourId);
      }

      if (handleApiResponse(res, `${typeNames[type]} marked as complete`)) {
        setDismissedBookings((prev) => {
          const newSet = new Set(prev);
          newSet.add(booking.tnr);
          return newSet;
        });

        if (type === "balance" && getBookings) {
          await getBookings(selectedTourId);
          toast.success("Balance receipt completed! ✅");
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  const copyTNR = (tnr) => {
    if (!tnr) return;
    navigator.clipboard.writeText(tnr).then(
      () => toast.success("TNR copied!"),
      () => toast.error("Failed to copy"),
    );
  };

  const renderBookingCards = (list, type) => {
    const filtered =
      type === "advance" || type === "balance" || type === "modify"
        ? list.filter((b) => !dismissedBookings.has(b.tnr))
        : list;

    if (!filtered.length) {
      return (
        <div className="text-center py-8 text-gray-500 italic">
          🎉 No pending {type} actions — great job!
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filtered.map((booking) => {
          const isExpanded = expandedStates[type]?.has(booking.tnr);
          const firstTrav = booking.travellers?.[0] || {};
          const travellerName =
            `${firstTrav.firstName || ""} ${firstTrav.lastName || ""}`.trim() ||
            "Unknown Traveller";

          if (!booking.tnr) {
            return (
              <div
                key="missing"
                className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
              >
                <AlertTriangle size={20} className="inline mr-2" />
                Booking missing TNR — cannot display properly
              </div>
            );
          }

          return (
            <div
              key={booking.tnr}
              className="bg-white border rounded-xl shadow-sm hover:shadow transition-all overflow-hidden"
            >
              <div
                className="p-4 flex items-center justify-between gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100"
                onClick={() => toggleExpand(type, booking.tnr)}
              >
                {/* Left: name + TNR + contact */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base text-gray-900 truncate">
                    {travellerName}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="font-mono font-bold text-indigo-700 text-xs tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                      {booking.tnr}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyTNR(booking.tnr);
                      }}
                      className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                      title="Copy TNR"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {booking.contact?.email || "—"} • {booking.contact?.mobile || "—"}
                  </div>
                </div>

                {/* Right: Mark Complete button + chevron */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {type !== "uncompleted" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkReceipt(booking, type);
                      }}
                      disabled={isLoading}
                      className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition whitespace-nowrap ${isLoading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                    >
                      {isLoading ? "..." : "✓ Mark"}
                    </button>
                  )}
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-500 flex-shrink-0" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="p-5 bg-white border-t space-y-6 text-sm">
                  <div>
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                      <Users size={18} className="text-indigo-600" />
                      Travellers ({booking.travellers?.length || 0})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {booking.travellers?.map((t, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border ${t.cancelled?.byTraveller || t.cancelled?.byAdmin
                            ? "bg-red-50 border-red-200"
                            : "bg-gray-50 border-gray-200"
                            }`}
                        >
                          <p className="font-medium">
                            {t.title} {t.firstName} {t.lastName}
                            <span className="text-gray-600 ml-2">
                              ({t.age} yrs, {t.gender || "—"})
                            </span>
                          </p>
                          <p className="mt-1">
                            <strong>Sharing:</strong> {t.sharingType || "—"}
                          </p>
                          <p>
                            <strong>Package:</strong> {t.packageType || "—"}
                            {t.variantPackageIndex != null &&
                              ` (Var ${t.variantPackageIndex})`}
                          </p>
                          {t.selectedAddon?.name && (
                            <p>
                              <strong>Add-on:</strong> {t.selectedAddon.name} (₹
                              {t.selectedAddon.price})
                            </p>
                          )}
                          {t.boardingPoint?.stationName && (
                            <p>
                              <strong>Boarding:</strong>{" "}
                              {t.boardingPoint.stationName} (
                              {t.boardingPoint.stationCode})
                            </p>
                          )}
                          {t.deboardingPoint?.stationName && (
                            <p>
                              <strong>Deboarding:</strong>{" "}
                              {t.deboardingPoint.stationName} (
                              {t.deboardingPoint.stationCode})
                            </p>
                          )}
                          {t.remarks && (
                            <p className="mt-2 italic text-gray-600">
                              Remarks: {t.remarks}
                            </p>
                          )}
                          {(t.cancelled?.byTraveller || t.cancelled?.byAdmin) && (
                            <p className="mt-2 text-red-600 font-medium">
                              Cancelled (
                              {t.cancelled.byAdmin ? "by Admin" : "by Traveller"}
                              )
                            </p>
                          )}
                        </div>
                      )) || (
                          <p className="text-gray-500 col-span-2">No travellers</p>
                        )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Mail size={16} /> Contact
                      </h3>
                      <p>Email: {booking.contact?.email || "—"}</p>
                      <p>Mobile: {booking.contact?.mobile || "—"}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <MapPin size={16} /> Billing Address
                      </h3>
                      <p>
                        {booking.billingAddress?.addressLine1 || "—"}{" "}
                        {booking.billingAddress?.addressLine2 || ""}
                      </p>
                      <p>
                        {booking.billingAddress?.city || "—"},{" "}
                        {booking.billingAddress?.state || "—"} -{" "}
                        {booking.billingAddress?.pincode || "—"}
                      </p>
                      <p>{booking.billingAddress?.country || "India"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Payment Status</h3>
                      <p>
                        Advance: ₹{booking.payment?.advance?.amount || 0} —{" "}
                        {booking.payment?.advance?.paid ? (
                          <span className="text-green-600">Paid</span>
                        ) : (
                          <span className="text-red-600">Pending</span>
                        )}
                      </p>
                      <p>
                        Balance: ₹{booking.payment?.balance?.amount || 0} —{" "}
                        {booking.payment?.balance?.paid ? (
                          <span className="text-green-600">Paid</span>
                        ) : (
                          <span className="text-red-600">Pending</span>
                        )}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Receipt Status</h3>
                      <p>
                        Advance Receipt:{" "}
                        {booking.receipts?.advanceReceiptSent ? (
                          <span className="text-green-600">Sent</span>
                        ) : (
                          <span className="text-orange-600">Pending</span>
                        )}
                      </p>
                      <p>
                        Balance Receipt:{" "}
                        {booking.receipts?.balanceReceiptSent ? (
                          <span className="text-green-600">Sent</span>
                        ) : (
                          <span className="text-orange-600">Pending</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {(booking.adminRemarks?.length > 0 ||
                    booking.advanceAdminRemarks?.length > 0) && (
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <FileText size={16} /> Admin Remarks
                        </h3>
                        <div className="space-y-2">
                          {booking.advanceAdminRemarks?.map((r, i) => (
                            <div key={i} className="bg-gray-50 p-3 rounded text-sm">
                              <p>{r.remark} (₹{r.amount || 0})</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(r.addedAt).toLocaleString()}
                              </p>
                            </div>
                          ))}
                          {booking.adminRemarks?.map((r, i) => (
                            <div key={i} className="bg-gray-50 p-3 rounded text-sm">
                              <p>{r.remark} (₹{r.amount || 0})</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(r.addedAt).toLocaleString()}
                              </p>
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
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={4000} />

      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Tour Dashboard
      </h1>

      {isLoading ? (
        <div className="text-center py-12 text-gray-600">
          Loading dashboard...
        </div>
      ) : !ttoken ? (
        <div className="text-center py-12 text-gray-600">
          Please log in to view dashboard
        </div>
      ) : (
        <>
          <div className="mb-8 max-w-md mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Tour
            </label>
            <select
              value={selectedTourId}
              onChange={(e) => setSelectedTourId(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              <option value="">-- Select a Tour --</option>
              {tourList.map((tour) => (
                <option key={tour._id} value={tour._id}>
                  {tour.title}
                </option>
              ))}
            </select>
          </div>

          {!selectedTourId ? (
            <div className="text-center py-12 text-gray-600">
              Please select a tour to view details
            </div>
          ) : (
            <div className="space-y-10">

              {/* ====================== STATISTICS CARDS ====================== */}
              {/* Mobile: 2 cols | Tablet & Desktop: 5 cols (2 rows of 5) */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">

                <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
                  <div className="w-10 h-10 mx-auto bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                    <FileText size={24} />
                  </div>
                  <p className="text-xs font-medium text-gray-600">Total TNRs</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBookings}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
                  <div className="w-10 h-10 mx-auto bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
                    <Users size={24} />
                  </div>
                  <p className="text-xs font-medium text-gray-600">Total Travellers</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.totalTravellers}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
                  <div className="w-10 h-10 mx-auto bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-3">
                    <CheckCircle size={24} />
                  </div>
                  <p className="text-xs font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.completedBookings}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
                  <div className="w-10 h-10 mx-auto bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center mb-3">
                    <IndianRupee size={24} />
                  </div>
                  <p className="text-xs font-medium text-gray-600">Advance Paid</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">
                    ₹{stats.advancePaidAmount.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
                  <div className="w-10 h-10 mx-auto bg-yellow-50 text-yellow-700 rounded-xl flex items-center justify-center mb-3">
                    <IndianRupee size={24} />
                  </div>
                  <p className="text-xs font-medium text-gray-600">Balance Paid</p>
                  <p className="text-2xl font-bold text-yellow-700 mt-1">
                    ₹{stats.balancePaidAmount.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
                  <div className="w-10 h-10 mx-auto bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
                    <IndianRupee size={24} />
                  </div>
                  <p className="text-xs font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">
                    ₹{stats.totalEarnings.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
                  <div className="w-10 h-10 mx-auto bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-3">
                    <Clock size={24} />
                  </div>
                  <p className="text-xs font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pendingBookings}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
                  <div className="w-10 h-10 mx-auto bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center mb-3">
                    <AlertTriangle size={24} />
                  </div>
                  <p className="text-xs font-medium text-gray-600">Unverified</p>
                  <p className="text-3xl font-bold text-gray-500 mt-1">{stats.unverifiedBookings}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
                  <div className="w-10 h-10 mx-auto bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-3">
                    <XCircle size={24} />
                  </div>
                  <p className="text-xs font-medium text-gray-600">Cancelled</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{stats.cancelledBookings}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
                  <div className="w-10 h-10 mx-auto bg-red-50 text-red-700 rounded-xl flex items-center justify-center mb-3">
                    <AlertTriangle size={24} />
                  </div>
                  <p className="text-xs font-medium text-gray-600">Rejected</p>
                  <p className="text-3xl font-bold text-red-700 mt-1">{stats.rejectedBookings}</p>
                </div>

              </div>

              {/* Pending Sections */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-6 border-b bg-gray-50">
                  <h2 className="text-xl font-semibold flex items-center gap-3">
                    <IndianRupee size={24} className="text-blue-600" />
                    Advance Receipt Pending ({stats.advancePending.length})
                  </h2>
                </div>
                <div className="p-6">
                  {renderBookingCards(stats.advancePending, "advance")}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-6 border-b bg-gray-50">
                  <h2 className="text-xl font-semibold flex items-center gap-3">
                    <IndianRupee size={24} className="text-yellow-600" />
                    Balance Receipt Pending ({stats.balancePending.length})
                  </h2>
                </div>
                <div className="p-6">
                  {renderBookingCards(stats.balancePending, "balance")}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-6 border-b bg-gray-50">
                  <h2 className="text-xl font-semibold flex items-center gap-3">
                    <FileText size={24} className="text-purple-600" />
                    Modified Receipts Pending ({stats.modifyReceiptPending.length})
                  </h2>
                </div>
                <div className="p-6">
                  {renderBookingCards(stats.modifyReceiptPending, "modify")}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-6 border-b bg-gray-50">
                  <h2 className="text-xl font-semibold flex items-center gap-3">
                    <Clock size={24} className="text-orange-600" />
                    Uncompleted Bookings ({stats.uncompleted.length})
                  </h2>
                </div>
                <div className="p-6">
                  {renderBookingCards(stats.uncompleted, "uncompleted")}
                </div>
              </div>

            </div>
          )}
        </>
      )}

      {showConfirmLeave && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={handleCancelLeave}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Leave this page?
            </h2>
            <p className="text-gray-600 mb-8">
              You are viewing dashboard for{" "}
              <strong>
                {tourList.find((t) => t._id === selectedTourId)?.title ||
                  "this tour"}
              </strong>
              .<br />
              Leaving will clear current view.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={handleCancelLeave}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLeave}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes, Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourDashboard;
