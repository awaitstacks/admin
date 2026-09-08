// // import { useEffect, useContext, useMemo, useState, useCallback } from "react";
// // import { useLocation } from "react-router-dom";
// // import { TourContext } from "../../context/TourContext";
// // import { toast, ToastContainer } from "react-toastify";
// // import "react-toastify/dist/ReactToastify.css";
// // import {
// //   ChevronDown, ChevronUp, IndianRupee, Users, Mail, Phone, MapPin,
// //   Calendar, CheckCircle, Clock, AlertTriangle, Copy, FileText,
// //   XCircle
// // } from "lucide-react";

// // const TourDashboard = () => {
// //   const {
// //     tourList,
// //     getTourList,
// //     dashData,
// //     bookings,
// //     getDashData,
// //     getBookings,
// //     markAdvanceReceiptSent,
// //     markBalanceReceiptSent,
// //     markModifyReceipt,
// //     ttoken,
// //   } = useContext(TourContext);

// //   const [selectedTourId, setSelectedTourId] = useState("");
// //   const [expandedStates, setExpandedStates] = useState({
// //     advance: new Set(),
// //     balance: new Set(),
// //     modify: new Set(),
// //     uncompleted: new Set(),
// //   });
// //   const [dismissedBookings, setDismissedBookings] = useState(new Set());
// //   const [isLoading, setIsLoading] = useState(false);

// //   const location = useLocation();
// //   const [showConfirmLeave, setShowConfirmLeave] = useState(false);

// //   const shouldProtect = Boolean(
// //     selectedTourId && !isLoading && bookings && bookings.length > 0,
// //   );

// //   useEffect(() => {
// //     if (!shouldProtect) return;
// //     const handleBeforeUnload = (e) => {
// //       e.preventDefault();
// //       e.returnValue = "";
// //     };
// //     window.addEventListener("beforeunload", handleBeforeUnload);
// //     return () => window.removeEventListener("beforeunload", handleBeforeUnload);
// //   }, [shouldProtect]);

// //   useEffect(() => {
// //     if (!shouldProtect) return;
// //     window.history.pushState(null, null, window.location.href);
// //     const handlePopState = () => setShowConfirmLeave(true);
// //     window.addEventListener("popstate", handlePopState);
// //     return () => window.removeEventListener("popstate", handlePopState);
// //   }, [shouldProtect]);

// //   const handleConfirmLeave = () => {
// //     setShowConfirmLeave(false);
// //     window.history.back();
// //   };

// //   const handleCancelLeave = () => {
// //     setShowConfirmLeave(false);
// //     window.history.pushState(null, null, window.location.href);
// //   };

// //   useEffect(() => {
// //     return () => toast.dismiss();
// //   }, [location]);

// //   const handleApiResponse = useCallback((response, successMsg, errorMsg) => {
// //     if (response?.success) {
// //       toast.success(successMsg || "Operation successful");
// //       return true;
// //     } else {
// //       toast.error(response?.message || errorMsg || "Operation failed");
// //       return false;
// //     }
// //   }, []);

// //   useEffect(() => {
// //     if (ttoken) {
// //       setIsLoading(true);
// //       getTourList()
// //         .then((res) => handleApiResponse(res, "Tours loaded"))
// //         .catch((err) => toast.error(err.message || "Failed to load tours"))
// //         .finally(() => setIsLoading(false));
// //     }
// //   }, [ttoken, getTourList, handleApiResponse]);

// //   useEffect(() => {
// //     if (ttoken && selectedTourId) {
// //       setIsLoading(true);
// //       Promise.all([getDashData(selectedTourId), getBookings(selectedTourId)])
// //         .then(([dashRes]) => handleApiResponse(dashRes, "Dashboard updated"))
// //         .catch((err) => toast.error(err.message || "Failed to load data"))
// //         .finally(() => setIsLoading(false));
// //     }
// //   }, [ttoken, selectedTourId, getDashData, getBookings, handleApiResponse]);

// //   const stats = useMemo(() => {
// //     if (!bookings?.length) {
// //       return {
// //         totalBookings: 0,
// //         totalTravellers: 0,
// //         completedBookings: 0,
// //         pendingBookings: 0,
// //         unverifiedBookings: 0,
// //         cancelledBookings: 0,
// //         rejectedBookings: 0,
// //         advancePaidAmount: 0,
// //         balancePaidAmount: 0,
// //         partialPaymentsTotal: 0,
// //         gvCancellationTotal: 0,
// //         irctcCancellationTotal: 0,
// //         positiveRemarksCancellationTotal: 0,
// //         totalEarnings: 0,
// //         advancePending: [],
// //         balancePending: [],
// //         uncompleted: [],
// //         modifyReceiptPending: [],
// //       };
// //     }

// //     let totalBookingsCount = 0;
// //     let totalTravellersCount = 0;
// //     let completed = 0;
// //     let pending = 0;
// //     let unverified = 0;
// //     let cancelled = 0;
// //     let rejected = 0;
// //     let advancePaidAmount = 0;
// //     let balancePaidAmount = 0;
// //     let partialPaymentsTotal = 0;
// //     // Revenue from cancellation-affected bookings, broken down like
// //     // partialPaymentsTotal — each shown as its own card AND added into
// //     // totalEarnings below: GV Cancellation Pool, IRCTC Cancellation
// //     // Pool, and any POSITIVE admin remark amount (negative remarks are
// //     // refunds/discounts, already handled above as partialPaymentsReceived
// //     // — never double-counted here).
// //     let gvCancellationTotal = 0;
// //     let irctcCancellationTotal = 0;
// //     let positiveRemarksCancellationTotal = 0;
// //     let advancePending = [];
// //     let balancePending = [];
// //     let uncompleted = [];
// //     let modifyReceiptPending = [];

// //     bookings.forEach((b) => {
// //       if (b.tnr) totalBookingsCount++;

// //       const advanceVerified = !!b.payment?.advance?.paymentVerified;

// //       if (advanceVerified) {
// //         const validTravellers = b.travellers?.filter((trav) => {
// //           if (!trav) return false;
// //           if (trav.cancelled?.byTraveller || trav.cancelled?.byAdmin) return false;
// //           return true;
// //         }) || [];
// //         totalTravellersCount += validTravellers.length;
// //       }

// //       const isFullyCancelled = b.travellers?.length > 0 &&
// //         b.travellers.every((t) => t.cancelled?.byTraveller && t.cancelled?.byAdmin);

// //       const isRejectedByAdmin = b.travellers?.length > 0 &&
// //         b.travellers.every((t) => t.cancelled?.byAdmin && !t.cancelled?.byTraveller);

// //       const advancePaid = !!b.payment?.advance?.paid;
// //       const balancePaid = !!b.payment?.balance?.paid;

// //       if (isFullyCancelled) cancelled++;
// //       else if (isRejectedByAdmin) rejected++;
// //       else if (advancePaid && balancePaid) completed++;
// //       else if (advancePaid && !balancePaid) pending++;
// //       else unverified++;

// //       const hasAnyCancelledTraveller = b.travellers?.some(
// //         (t) => t.cancelled?.byTraveller || t.cancelled?.byAdmin
// //       );

// //       // Special case: the customer's ENTIRE balance amount was refunded
// //       // back to them (refundAmount === payment.balance.amount) — in
// //       // this situation the raw balance.amount figure no longer
// //       // represents real revenue collected (it was given back), so it
// //       // must be treated the same way as a fully-cancelled booking: use
// //       // the cancellation charge (GV + IRCTC + positive admin remarks)
// //       // instead.
// //       const balanceFullyRefunded =
// //         (b.refundAmount || 0) > 0 &&
// //         (b.refundAmount || 0) === (b.payment?.balance?.amount || 0);

// //       const useCancellationFigureForBalance = isFullyCancelled || balanceFullyRefunded;

// //       // ── Advance Paid: counted for EVERY booking (rejected excluded
// //       // only) regardless of cancellation status — a fully or partially
// //       // cancelled booking still genuinely collected its advance. ──
// //       if (!isRejectedByAdmin && advancePaid && advanceVerified) {
// //         advancePaidAmount += b.payment?.advance?.amount || 0;
// //       }

// //       if (!isRejectedByAdmin) {
// //         if (useCancellationFigureForBalance) {
// //           // Fully cancelled, OR the whole balance was refunded back —
// //           // the real money actually kept/collected is the cancellation
// //           // charge, not the stale/refunded balance.amount.
// //           const cancellationRemarks = [
// //             ...(b.advanceAdminRemarks || []),
// //             ...(b.adminRemarks || []),
// //           ];
// //           const positiveRemarksTotal = cancellationRemarks
// //             .filter((r) => typeof r.amount === "number" && r.amount > 0)
// //             .reduce((sum, r) => sum + r.amount, 0);

// //           const gv = b.gvCancellationPool || 0;
// //           const irctc = b.irctcCancellationPool || 0;

// //           balancePaidAmount += gv + irctc + positiveRemarksTotal;
// //           gvCancellationTotal += gv;
// //           irctcCancellationTotal += irctc;
// //           positiveRemarksCancellationTotal += positiveRemarksTotal;
// //         } else if (balancePaid) {
// //           // Normal booking OR a PARTIAL cancellation (some, not all,
// //           // travellers cancelled) — payment.balance.amount is already
// //           // the correct, adjusted figure (reduced for cancelled
// //           // travellers via the invoice resync), so use it directly, no
// //           // extra cancellation math needed here.
// //           balancePaidAmount += b.payment?.balance?.amount || 0;

// //           // ── Negative admin remarks = PARTIAL PAYMENTS actually
// //           // received ── Remarks like "PARTIAL BALANCE PAID: -₹10000"
// //           // store the amount as negative (it reduces the outstanding
// //           // due), but the money itself was genuinely received from the
// //           // customer — same convention used in the invoice's
// //           // buildPayments (each negative-amount remark becomes a real
// //           // payment line, amount taken as its absolute value). Only
// //           // meaningful here (not in the cancellation-figure branch
// //           // above, which has its own POSITIVE-remarks handling).
// //           const allRemarks = [
// //             ...(b.advanceAdminRemarks || []),
// //             ...(b.adminRemarks || []),
// //           ];
// //           const partialPaymentsReceived = allRemarks
// //             .filter((r) => typeof r.amount === "number" && r.amount < 0)
// //             .reduce((sum, r) => sum + Math.abs(r.amount), 0);
// //           balancePaidAmount += partialPaymentsReceived;
// //           partialPaymentsTotal += partialPaymentsReceived;
// //         }
// //       }

// //       if (advanceVerified && !b.receipts?.advanceReceiptSent) {
// //         advancePending.push(b);
// //       }
// //       if (balancePaid && !b.receipts?.balanceReceiptSent) {
// //         balancePending.push(b);
// //       }
// //       if (b.isTripCompleted && !isFullyCancelled) {
// //         modifyReceiptPending.push(b);
// //       }
// //       if (!b.isBookingCompleted && !isFullyCancelled) {
// //         uncompleted.push(b);
// //       }
// //     });

// //     // GV/IRCTC/positive-remarks cancellation revenue is already folded
// //     // directly into balancePaidAmount above (in the
// //     // useCancellationFigureForBalance branch) — so totalEarnings is
// //     // simply advance + balance, same as before. The three cancellation
// //     // totals are kept separately ONLY for their own breakdown cards
// //     // (same pattern as partialPaymentsTotal), not added again here.
// //     const totalEarnings = advancePaidAmount + balancePaidAmount;

// //     console.log("✅ Final Total Travellers Count:", totalTravellersCount);
// //     console.log("📊 Total Earnings:", totalEarnings);

// //     return {
// //       totalBookings: totalBookingsCount,
// //       totalTravellers: totalTravellersCount,
// //       completedBookings: completed,
// //       pendingBookings: pending,
// //       unverifiedBookings: unverified,
// //       cancelledBookings: cancelled,
// //       rejectedBookings: rejected,
// //       advancePaidAmount,
// //       balancePaidAmount,
// //       partialPaymentsTotal,
// //       gvCancellationTotal,
// //       irctcCancellationTotal,
// //       positiveRemarksCancellationTotal,
// //       totalEarnings,
// //       advancePending: advancePending.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)),
// //       balancePending: balancePending.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)),
// //       uncompleted: uncompleted.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)),
// //       modifyReceiptPending: modifyReceiptPending.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)),
// //     };
// //   }, [bookings]);

// //   const toggleExpand = (section, tnr) => {
// //     setExpandedStates((prev) => {
// //       const newSets = { ...prev };
// //       const sectionSet = new Set(newSets[section]);
// //       if (sectionSet.has(tnr)) {
// //         sectionSet.delete(tnr);
// //       } else {
// //         sectionSet.add(tnr);
// //       }
// //       newSets[section] = sectionSet;
// //       return newSets;
// //     });
// //   };

// //   const handleMarkReceipt = async (booking, type) => {
// //     if (!selectedTourId) {
// //       toast.error("Please select a tour first.");
// //       return;
// //     }

// //     const typeNames = {
// //       advance: "Advance Receipt",
// //       balance: "Balance Receipt",
// //       modify: "Modified Receipt",
// //     };

// //     if (!window.confirm(`Mark ${typeNames[type]} as complete?`)) return;

// //     setIsLoading(true);
// //     try {
// //       let res;
// //       if (type === "advance") {
// //         res = await markAdvanceReceiptSent(booking.tnr, selectedTourId);
// //       } else if (type === "balance") {
// //         if (!booking.payment?.balance?.paid) {
// //           toast.error("Balance payment not marked as paid yet.");
// //           return;
// //         }
// //         res = await markBalanceReceiptSent(booking.tnr, selectedTourId);
// //       } else if (type === "modify") {
// //         res = await markModifyReceipt(booking.tnr, selectedTourId);
// //       }

// //       if (handleApiResponse(res, `${typeNames[type]} marked as complete`)) {
// //         setDismissedBookings((prev) => {
// //           const newSet = new Set(prev);
// //           newSet.add(booking.tnr);
// //           return newSet;
// //         });

// //         if (type === "balance" && getBookings) {
// //           await getBookings(selectedTourId);
// //           toast.success("Balance receipt completed! ✅");
// //         }
// //       }
// //     } catch (err) {
// //       toast.error(err.message || "Failed to update");
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const copyTNR = (tnr) => {
// //     if (!tnr) return;
// //     navigator.clipboard.writeText(tnr).then(
// //       () => toast.success("TNR copied!"),
// //       () => toast.error("Failed to copy"),
// //     );
// //   };

// //   const renderBookingCards = (list, type) => {
// //     const filtered =
// //       type === "advance" || type === "balance" || type === "modify"
// //         ? list.filter((b) => !dismissedBookings.has(b.tnr))
// //         : list;

// //     if (!filtered.length) {
// //       return (
// //         <div className="text-center py-8 text-gray-500 italic">
// //           🎉 No pending {type} actions — great job!
// //         </div>
// //       );
// //     }

// //     return (
// //       <div className="space-y-4">
// //         {filtered.map((booking) => {
// //           const isExpanded = expandedStates[type]?.has(booking.tnr);
// //           const firstTrav = booking.travellers?.[0] || {};
// //           const travellerName =
// //             `${firstTrav.firstName || ""} ${firstTrav.lastName || ""}`.trim() ||
// //             "Unknown Traveller";

// //           if (!booking.tnr) {
// //             return (
// //               <div
// //                 key="missing"
// //                 className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
// //               >
// //                 <AlertTriangle size={20} className="inline mr-2" />
// //                 Booking missing TNR — cannot display properly
// //               </div>
// //             );
// //           }

// //           return (
// //             <div
// //               key={booking.tnr}
// //               className="bg-white border rounded-xl shadow-sm hover:shadow transition-all overflow-hidden"
// //             >
// //               <div
// //                 className="p-4 flex items-center justify-between gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100"
// //                 onClick={() => toggleExpand(type, booking.tnr)}
// //               >
// //                 {/* Left: name + TNR + contact */}
// //                 <div className="flex-1 min-w-0">
// //                   <div className="font-bold text-base text-gray-900 truncate">
// //                     {travellerName}
// //                   </div>
// //                   <div className="flex items-center gap-1 mt-0.5">
// //                     <span className="font-mono font-bold text-indigo-700 text-xs tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
// //                       {booking.tnr}
// //                     </span>
// //                     <button
// //                       onClick={(e) => {
// //                         e.stopPropagation();
// //                         copyTNR(booking.tnr);
// //                       }}
// //                       className="text-blue-600 hover:text-blue-800 flex-shrink-0"
// //                       title="Copy TNR"
// //                     >
// //                       <Copy size={14} />
// //                     </button>
// //                   </div>
// //                   <div className="text-xs text-gray-500 mt-1 truncate">
// //                     {booking.contact?.email || "—"} • {booking.contact?.mobile || "—"}
// //                   </div>
// //                 </div>

// //                 {/* Right: Mark Complete button + chevron */}
// //                 <div className="flex items-center gap-2 flex-shrink-0">
// //                   {type !== "uncompleted" && (
// //                     <button
// //                       onClick={(e) => {
// //                         e.stopPropagation();
// //                         handleMarkReceipt(booking, type);
// //                       }}
// //                       disabled={isLoading}
// //                       className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition whitespace-nowrap ${isLoading
// //                         ? "bg-gray-300 text-gray-500 cursor-not-allowed"
// //                         : "bg-green-600 text-white hover:bg-green-700"
// //                         }`}
// //                     >
// //                       {isLoading ? "..." : "✓ Mark"}
// //                     </button>
// //                   )}
// //                   {isExpanded ? (
// //                     <ChevronUp size={18} className="text-gray-500 flex-shrink-0" />
// //                   ) : (
// //                     <ChevronDown size={18} className="text-gray-500 flex-shrink-0" />
// //                   )}
// //                 </div>
// //               </div>

// //               {isExpanded && (
// //                 <div className="p-5 bg-white border-t space-y-6 text-sm">
// //                   <div>
// //                     <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
// //                       <Users size={18} className="text-indigo-600" />
// //                       Travellers ({booking.travellers?.length || 0})
// //                     </h3>
// //                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                       {booking.travellers?.map((t, idx) => (
// //                         <div
// //                           key={idx}
// //                           className={`p-4 rounded-lg border ${t.cancelled?.byTraveller || t.cancelled?.byAdmin
// //                             ? "bg-red-50 border-red-200"
// //                             : "bg-gray-50 border-gray-200"
// //                             }`}
// //                         >
// //                           <p className="font-medium">
// //                             {t.title} {t.firstName} {t.lastName}
// //                             <span className="text-gray-600 ml-2">
// //                               ({t.age} yrs, {t.gender || "—"})
// //                             </span>
// //                           </p>
// //                           <p className="mt-1">
// //                             <strong>Sharing:</strong> {t.sharingType || "—"}
// //                           </p>
// //                           <p>
// //                             <strong>Package:</strong> {t.packageType || "—"}
// //                             {t.variantPackageIndex != null &&
// //                               ` (Var ${t.variantPackageIndex})`}
// //                           </p>
// //                           {(() => {
// //                             // ── if/else — resolve addon display ──
// //                             // NEW bookings: t.selectedAddons is an array,
// //                             // each entry EITHER train-wise (trainNo/
// //                             // trainName) OR flight-wise (flightNo/
// //                             // airline). OLD bookings: t.selectedAddon is
// //                             // a flat single object — kept working exactly
// //                             // as before.
// //                             if (
// //                               Array.isArray(t.selectedAddons) &&
// //                               t.selectedAddons.length > 0
// //                             ) {
// //                               const getTripTypeStyle = (tripType) => {
// //                                 const tt = (tripType || "").toUpperCase();
// //                                 if (tt.startsWith("BOARD"))
// //                                   return {
// //                                     badge: "bg-blue-100 text-blue-700",
// //                                     label: "Boarding",
// //                                   };
// //                                 if (tt.startsWith("MIDDLE"))
// //                                   return {
// //                                     badge: "bg-purple-100 text-purple-700",
// //                                     label: "Middle",
// //                                   };
// //                                 if (
// //                                   tt.startsWith("DEBOARD") ||
// //                                   tt.startsWith("DEBOARF")
// //                                 )
// //                                   return {
// //                                     badge: "bg-orange-100 text-orange-700",
// //                                     label: "Deboarding",
// //                                   };
// //                                 return {
// //                                   badge: "bg-gray-100 text-gray-700",
// //                                   label: tripType || "Trip",
// //                                 };
// //                               };

// //                               // Classify by which identifying fields are
// //                               // ACTUALLY present — not by tripKind/
// //                               // flightIndex alone, since those can be
// //                               // missing on entries saved from admin-edit
// //                               // flows (ManageBooking.jsx) or older data.
// //                               const isFlightAddon = (a) => {
// //                                 if (a.flightNo || a.airline) return true;
// //                                 if (a.trainNo || a.trainName) return false;
// //                                 return (
// //                                   (a.flightIndex !== undefined &&
// //                                     a.flightIndex !== null) ||
// //                                   a.tripKind === "flight"
// //                                 );
// //                               };

// //                               const buildLabel = (a, isFlight) => {
// //                                 const primary = isFlight
// //                                   ? a.airline
// //                                   : a.trainName;
// //                                 const secondary = isFlight
// //                                   ? a.flightNo
// //                                   : a.trainNo;
// //                                 if (!primary && !secondary) return null;
// //                                 if (primary && secondary)
// //                                   return `${primary} (${secondary})`;
// //                                 return primary || secondary;
// //                               };

// //                               const trainEntries = t.selectedAddons.filter(
// //                                 (a) => !isFlightAddon(a),
// //                               );
// //                               const flightEntries = t.selectedAddons.filter(
// //                                 (a) => isFlightAddon(a),
// //                               );

// //                               const renderRow = (a, idx) => {
// //                                 const isFlight = isFlightAddon(a);
// //                                 const style = getTripTypeStyle(a.tripType);
// //                                 const label = buildLabel(a, isFlight);
// //                                 return (
// //                                   <div
// //                                     key={idx}
// //                                     className="flex flex-wrap items-center gap-1.5 mt-0.5"
// //                                   >
// //                                     <span
// //                                       className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${style.badge}`}
// //                                     >
// //                                       {style.label}
// //                                     </span>
// //                                     <span className="text-gray-700">
// //                                       {label ? `${label}: ` : ""}
// //                                       {a.name}
// //                                     </span>
// //                                     <span className="font-semibold text-green-700">
// //                                       +₹{a.amount || 0}
// //                                     </span>
// //                                   </div>
// //                                 );
// //                               };

// //                               return (
// //                                 <div className="mt-1">
// //                                   {trainEntries.length > 0 && (
// //                                     <div>
// //                                       <p className="font-semibold text-red-600 text-[11px]">
// //                                         🚆 Train Addons
// //                                       </p>
// //                                       {trainEntries.map((a, idx) =>
// //                                         renderRow(a, idx),
// //                                       )}
// //                                     </div>
// //                                   )}
// //                                   {flightEntries.length > 0 && (
// //                                     <div className="mt-1">
// //                                       <p className="font-semibold text-orange-900 text-[11px]">
// //                                         ✈️ Flight Addons
// //                                       </p>
// //                                       {flightEntries.map((a, idx) =>
// //                                         renderRow(a, idx),
// //                                       )}
// //                                     </div>
// //                                   )}
// //                                 </div>
// //                               );
// //                             }

// //                             // ── OLD flat addon (unchanged) ──
// //                             return (
// //                               t.selectedAddon?.name && (
// //                                 <p>
// //                                   <strong>Add-on:</strong>{" "}
// //                                   {t.selectedAddon.name} (₹
// //                                   {t.selectedAddon.price})
// //                                 </p>
// //                               )
// //                             );
// //                           })()}
// //                           {t.boardingPoint?.stationName && (
// //                             <p>
// //                               <strong>Boarding:</strong>{" "}
// //                               {t.boardingPoint.stationName} (
// //                               {t.boardingPoint.stationCode})
// //                             </p>
// //                           )}
// //                           {t.deboardingPoint?.stationName && (
// //                             <p>
// //                               <strong>Deboarding:</strong>{" "}
// //                               {t.deboardingPoint.stationName} (
// //                               {t.deboardingPoint.stationCode})
// //                             </p>
// //                           )}
// //                           {t.remarks && (
// //                             <p className="mt-2 italic text-gray-600">
// //                               Remarks: {t.remarks}
// //                             </p>
// //                           )}
// //                           {(t.cancelled?.byTraveller || t.cancelled?.byAdmin) && (
// //                             <p className="mt-2 text-red-600 font-medium">
// //                               Cancelled (
// //                               {t.cancelled.byAdmin ? "by Admin" : "by Traveller"}
// //                               )
// //                             </p>
// //                           )}
// //                         </div>
// //                       )) || (
// //                           <p className="text-gray-500 col-span-2">No travellers</p>
// //                         )}
// //                     </div>
// //                   </div>

// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                     <div>
// //                       <h3 className="font-semibold mb-2 flex items-center gap-2">
// //                         <Mail size={16} /> Contact
// //                       </h3>
// //                       <p>Email: {booking.contact?.email || "—"}</p>
// //                       <p>Mobile: {booking.contact?.mobile || "—"}</p>
// //                     </div>

// //                     <div>
// //                       <h3 className="font-semibold mb-2 flex items-center gap-2">
// //                         <MapPin size={16} /> Billing Address
// //                       </h3>
// //                       <p>
// //                         {booking.billingAddress?.addressLine1 || "—"}{" "}
// //                         {booking.billingAddress?.addressLine2 || ""}
// //                       </p>
// //                       <p>
// //                         {booking.billingAddress?.city || "—"},{" "}
// //                         {booking.billingAddress?.state || "—"} -{" "}
// //                         {booking.billingAddress?.pincode || "—"}
// //                       </p>
// //                       <p>{booking.billingAddress?.country || "India"}</p>
// //                     </div>
// //                   </div>

// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                     <div>
// //                       <h3 className="font-semibold mb-2">Payment Status</h3>
// //                       <p>
// //                         Advance: ₹{booking.payment?.advance?.amount || 0} —{" "}
// //                         {booking.payment?.advance?.paid ? (
// //                           <span className="text-green-600">Paid</span>
// //                         ) : (
// //                           <span className="text-red-600">Pending</span>
// //                         )}
// //                       </p>
// //                       <p>
// //                         Balance: ₹{booking.payment?.balance?.amount || 0} —{" "}
// //                         {booking.payment?.balance?.paid ? (
// //                           <span className="text-green-600">Paid</span>
// //                         ) : (
// //                           <span className="text-red-600">Pending</span>
// //                         )}
// //                       </p>
// //                     </div>

// //                     <div>
// //                       <h3 className="font-semibold mb-2">Receipt Status</h3>
// //                       <p>
// //                         Advance Receipt:{" "}
// //                         {booking.receipts?.advanceReceiptSent ? (
// //                           <span className="text-green-600">Sent</span>
// //                         ) : (
// //                           <span className="text-orange-600">Pending</span>
// //                         )}
// //                       </p>
// //                       <p>
// //                         Balance Receipt:{" "}
// //                         {booking.receipts?.balanceReceiptSent ? (
// //                           <span className="text-green-600">Sent</span>
// //                         ) : (
// //                           <span className="text-orange-600">Pending</span>
// //                         )}
// //                       </p>
// //                     </div>
// //                   </div>

// //                   {(booking.adminRemarks?.length > 0 ||
// //                     booking.advanceAdminRemarks?.length > 0) && (
// //                       <div>
// //                         <h3 className="font-semibold mb-2 flex items-center gap-2">
// //                           <FileText size={16} /> Admin Remarks
// //                         </h3>
// //                         <div className="space-y-2">
// //                           {booking.advanceAdminRemarks?.map((r, i) => (
// //                             <div key={i} className="bg-gray-50 p-3 rounded text-sm">
// //                               <p>{r.remark} (₹{r.amount || 0})</p>
// //                               <p className="text-xs text-gray-500 mt-1">
// //                                 {new Date(r.addedAt).toLocaleString()}
// //                               </p>
// //                             </div>
// //                           ))}
// //                           {booking.adminRemarks?.map((r, i) => (
// //                             <div key={i} className="bg-gray-50 p-3 rounded text-sm">
// //                               <p>{r.remark} (₹{r.amount || 0})</p>
// //                               <p className="text-xs text-gray-500 mt-1">
// //                                 {new Date(r.addedAt).toLocaleString()}
// //                               </p>
// //                             </div>
// //                           ))}
// //                         </div>
// //                       </div>
// //                     )}
// //                 </div>
// //               )}
// //             </div>
// //           );
// //         })}
// //       </div>
// //     );
// //   };

// //   return (
// //     <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
// //       <ToastContainer position="top-right" autoClose={4000} />

// //       <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
// //         Tour Dashboard
// //       </h1>

// //       {isLoading ? (
// //         <div className="text-center py-12 text-gray-600">
// //           Loading dashboard...
// //         </div>
// //       ) : !ttoken ? (
// //         <div className="text-center py-12 text-gray-600">
// //           Please log in to view dashboard
// //         </div>
// //       ) : (
// //         <>
// //           <div className="mb-8 max-w-md mx-auto">
// //             <label className="block text-sm font-medium text-gray-700 mb-2">
// //               Select Tour
// //             </label>
// //             <select
// //               value={selectedTourId}
// //               onChange={(e) => setSelectedTourId(e.target.value)}
// //               className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
// //               disabled={isLoading}
// //             >
// //               <option value="">-- Select a Tour --</option>
// //               {tourList.map((tour) => (
// //                 <option key={tour._id} value={tour._id}>
// //                   {tour.title}
// //                 </option>
// //               ))}
// //             </select>
// //           </div>

// //           {!selectedTourId ? (
// //             <div className="text-center py-12 text-gray-600">
// //               Please select a tour to view details
// //             </div>
// //           ) : (
// //             <div className="space-y-10">

// //               {/* ====================== STATISTICS CARDS ====================== */}
// //               {/* Mobile: 2 cols | Tablet & Desktop: 5 cols (2 rows of 5) */}
// //               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">

// //                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
// //                   <div className="w-10 h-10 mx-auto bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
// //                     <FileText size={24} />
// //                   </div>
// //                   <p className="text-xs font-medium text-gray-600">Total TNRs</p>
// //                   <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBookings}</p>
// //                 </div>

// //                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
// //                   <div className="w-10 h-10 mx-auto bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
// //                     <Users size={24} />
// //                   </div>
// //                   <p className="text-xs font-medium text-gray-600">Total Travellers</p>
// //                   <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.totalTravellers}</p>
// //                 </div>

// //                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
// //                   <div className="w-10 h-10 mx-auto bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-3">
// //                     <CheckCircle size={24} />
// //                   </div>
// //                   <p className="text-xs font-medium text-gray-600">Completed</p>
// //                   <p className="text-3xl font-bold text-green-600 mt-1">{stats.completedBookings}</p>
// //                 </div>

// //                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
// //                   <div className="w-10 h-10 mx-auto bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center mb-3">
// //                     <IndianRupee size={24} />
// //                   </div>
// //                   <p className="text-xs font-medium text-gray-600">Advance Paid</p>
// //                   <p className="text-2xl font-bold text-blue-700 mt-1">
// //                     ₹{stats.advancePaidAmount.toLocaleString("en-IN")}
// //                   </p>
// //                 </div>

// //                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
// //                   <div className="w-10 h-10 mx-auto bg-yellow-50 text-yellow-700 rounded-xl flex items-center justify-center mb-3">
// //                     <IndianRupee size={24} />
// //                   </div>
// //                   <p className="text-xs font-medium text-gray-600">Balance Paid</p>
// //                   <p className="text-2xl font-bold text-yellow-700 mt-1">
// //                     ₹{stats.balancePaidAmount.toLocaleString("en-IN")}
// //                   </p>
// //                 </div>

// //                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
// //                   <div className="w-10 h-10 mx-auto bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center mb-3">
// //                     <IndianRupee size={24} />
// //                   </div>
// //                   <p className="text-xs font-medium text-gray-600">Partial Payments</p>
// //                   <p className="text-2xl font-bold text-amber-700 mt-1">
// //                     ₹{stats.partialPaymentsTotal.toLocaleString("en-IN")}
// //                   </p>
// //                 </div>

// //                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
// //                   <div className="w-10 h-10 mx-auto bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
// //                     <IndianRupee size={24} />
// //                   </div>
// //                   <p className="text-xs font-medium text-gray-600">Total Earnings</p>
// //                   <p className="text-2xl font-bold text-emerald-700 mt-1">
// //                     ₹{stats.totalEarnings.toLocaleString("en-IN")}
// //                   </p>
// //                 </div>

// //                 {/* GV / IRCTC Cancellation Pool + Positive Admin Remarks —
// //                     each shown as its own card, same pattern as "Partial
// //                     Payments" above. All three are already folded into
// //                     the "Total Earnings" card above (like partial
// //                     payments are folded into balance paid). */}
// //                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
// //                   <div className="w-10 h-10 mx-auto bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-3">
// //                     <IndianRupee size={24} />
// //                   </div>
// //                   <p className="text-xs font-medium text-gray-600">GV Cancellation</p>
// //                   <p className="text-2xl font-bold text-teal-700 mt-1">
// //                     ₹{stats.gvCancellationTotal.toLocaleString("en-IN")}
// //                   </p>
// //                 </div>

// //                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
// //                   <div className="w-10 h-10 mx-auto bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center mb-3">
// //                     <IndianRupee size={24} />
// //                   </div>
// //                   <p className="text-xs font-medium text-gray-600">IRCTC Cancellation</p>
// //                   <p className="text-2xl font-bold text-cyan-700 mt-1">
// //                     ₹{stats.irctcCancellationTotal.toLocaleString("en-IN")}
// //                   </p>
// //                 </div>

// //                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
// //                   <div className="w-10 h-10 mx-auto bg-lime-50 text-lime-700 rounded-xl flex items-center justify-center mb-3">
// //                     <IndianRupee size={24} />
// //                   </div>
// //                   <p className="text-xs font-medium text-gray-600">Positive Admin Remarks (Cancelled)</p>
// //                   <p className="text-2xl font-bold text-lime-700 mt-1">
// //                     ₹{stats.positiveRemarksCancellationTotal.toLocaleString("en-IN")}
// //                   </p>
// //                 </div>

// //                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
// //                   <div className="w-10 h-10 mx-auto bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-3">
// //                     <Clock size={24} />
// //                   </div>
// //                   <p className="text-xs font-medium text-gray-600">Pending</p>
// //                   <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pendingBookings}</p>
// //                 </div>

// //                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
// //                   <div className="w-10 h-10 mx-auto bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center mb-3">
// //                     <AlertTriangle size={24} />
// //                   </div>
// //                   <p className="text-xs font-medium text-gray-600">Unverified</p>
// //                   <p className="text-3xl font-bold text-gray-500 mt-1">{stats.unverifiedBookings}</p>
// //                 </div>

// //                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
// //                   <div className="w-10 h-10 mx-auto bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-3">
// //                     <XCircle size={24} />
// //                   </div>
// //                   <p className="text-xs font-medium text-gray-600">Cancelled</p>
// //                   <p className="text-3xl font-bold text-red-600 mt-1">{stats.cancelledBookings}</p>
// //                 </div>

// //                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
// //                   <div className="w-10 h-10 mx-auto bg-red-50 text-red-700 rounded-xl flex items-center justify-center mb-3">
// //                     <AlertTriangle size={24} />
// //                   </div>
// //                   <p className="text-xs font-medium text-gray-600">Rejected</p>
// //                   <p className="text-3xl font-bold text-red-700 mt-1">{stats.rejectedBookings}</p>
// //                 </div>

// //               </div>

// //               {/* Pending Sections */}
// //               <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
// //                 <div className="p-6 border-b bg-gray-50">
// //                   <h2 className="text-xl font-semibold flex items-center gap-3">
// //                     <IndianRupee size={24} className="text-blue-600" />
// //                     Advance Receipt Pending ({stats.advancePending.length})
// //                   </h2>
// //                 </div>
// //                 <div className="p-6">
// //                   {renderBookingCards(stats.advancePending, "advance")}
// //                 </div>
// //               </div>

// //               <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
// //                 <div className="p-6 border-b bg-gray-50">
// //                   <h2 className="text-xl font-semibold flex items-center gap-3">
// //                     <IndianRupee size={24} className="text-yellow-600" />
// //                     Balance Receipt Pending ({stats.balancePending.length})
// //                   </h2>
// //                 </div>
// //                 <div className="p-6">
// //                   {renderBookingCards(stats.balancePending, "balance")}
// //                 </div>
// //               </div>

// //               <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
// //                 <div className="p-6 border-b bg-gray-50">
// //                   <h2 className="text-xl font-semibold flex items-center gap-3">
// //                     <FileText size={24} className="text-purple-600" />
// //                     Modified Receipts Pending ({stats.modifyReceiptPending.length})
// //                   </h2>
// //                 </div>
// //                 <div className="p-6">
// //                   {renderBookingCards(stats.modifyReceiptPending, "modify")}
// //                 </div>
// //               </div>

// //               <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
// //                 <div className="p-6 border-b bg-gray-50">
// //                   <h2 className="text-xl font-semibold flex items-center gap-3">
// //                     <Clock size={24} className="text-orange-600" />
// //                     Uncompleted Bookings ({stats.uncompleted.length})
// //                   </h2>
// //                 </div>
// //                 <div className="p-6">
// //                   {renderBookingCards(stats.uncompleted, "uncompleted")}
// //                 </div>
// //               </div>

// //             </div>
// //           )}
// //         </>
// //       )}

// //       {showConfirmLeave && (
// //         <div
// //           className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
// //           onClick={handleCancelLeave}
// //         >
// //           <div
// //             className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
// //             onClick={(e) => e.stopPropagation()}
// //           >
// //             <h2 className="text-2xl font-bold text-gray-800 mb-4">
// //               Leave this page?
// //             </h2>
// //             <p className="text-gray-600 mb-8">
// //               You are viewing dashboard for{" "}
// //               <strong>
// //                 {tourList.find((t) => t._id === selectedTourId)?.title ||
// //                   "this tour"}
// //               </strong>
// //               .<br />
// //               Leaving will clear current view.
// //             </p>
// //             <div className="flex gap-4 justify-end">
// //               <button
// //                 onClick={handleCancelLeave}
// //                 className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={handleConfirmLeave}
// //                 className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
// //               >
// //                 Yes, Leave
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default TourDashboard;


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

//   useEffect(() => {
//     if (!shouldProtect) return;
//     const handleBeforeUnload = (e) => {
//       e.preventDefault();
//       e.returnValue = "";
//     };
//     window.addEventListener("beforeunload", handleBeforeUnload);
//     return () => window.removeEventListener("beforeunload", handleBeforeUnload);
//   }, [shouldProtect]);

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
//         partialPaymentsTotal: 0,
//         gvCancellationTotal: 0,
//         irctcCancellationTotal: 0,
//         remarksCancellationTotal: 0,
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
//     let partialPaymentsTotal = 0;
//     // Revenue from cancellation-affected bookings, broken down like
//     // partialPaymentsTotal — each shown as its own card AND added into
//     // totalEarnings below: GV Cancellation Pool, IRCTC Cancellation
//     // Pool, and Remarks Cancellation Pool — all three fetched DIRECTLY
//     // from the booking document (booking.gvCancellationPool /
//     // irctcCancellationPool / remarksCancellationPool), same pattern,
//     // no separate cancellationModel lookup needed.
//     let gvCancellationTotal = 0;
//     let irctcCancellationTotal = 0;
//     let remarksCancellationTotal = 0;
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
//           if (trav.cancelled?.byTraveller || trav.cancelled?.byAdmin) return false;
//           return true;
//         }) || [];
//         totalTravellersCount += validTravellers.length;
//       }

//       // A trip cancelled wholesale is marked with cancelled.viaTripCancel
//       // on every traveller — this happens for BOTH observed patterns
//       // ({byTraveller:false, byAdmin:false, viaTripCancel:true} — admin
//       // bulk trip-cancel, full refund — and {byTraveller:true,
//       // byAdmin:true, viaTripCancel:true} — normal individual
//       // cancellation that also carries the flag). viaTripCancel is the
//       // real decider, not the byTraveller/byAdmin combination. Kept the
//       // old byTraveller&&byAdmin check as a fallback for any legacy
//       // bookings that predate the viaTripCancel flag.
//       const isFullyCancelled = b.travellers?.length > 0 &&
//         b.travellers.every(
//           (t) =>
//             t.cancelled?.viaTripCancel === true ||
//             (t.cancelled?.byTraveller && t.cancelled?.byAdmin),
//         );

//       const isRejectedByAdmin = b.travellers?.length > 0 &&
//         b.travellers.every(
//           (t) =>
//             !t.cancelled?.viaTripCancel &&
//             t.cancelled?.byAdmin &&
//             !t.cancelled?.byTraveller,
//         );

//       const advancePaid = !!b.payment?.advance?.paid;
//       const balancePaid = !!b.payment?.balance?.paid;

//       if (isFullyCancelled) cancelled++;
//       else if (isRejectedByAdmin) rejected++;
//       else if (advancePaid && balancePaid) completed++;
//       else if (advancePaid && !balancePaid) pending++;
//       else unverified++;

//       const hasAnyCancelledTraveller = b.travellers?.some(
//         (t) => t.cancelled?.byTraveller || t.cancelled?.byAdmin || t.cancelled?.viaTripCancel
//       );
//       const isPartiallyCancelled = hasAnyCancelledTraveller && !isFullyCancelled;

//       // A "proper" cancellation is one where at least one traveller has
//       // BOTH cancelled.byTraveller AND cancelled.byAdmin true — this is
//       // the only pattern that actually carries a real GV/IRCTC/remarks
//       // charge. A booking cancelled purely via the admin bulk "trip
//       // cancel" action (viaTripCancel:true, byTraveller:false,
//       // byAdmin:false) is a FULL REFUND with no charge — even if a
//       // stale/leftover approved cancellationModel record exists for
//       // that tnr (e.g. from an earlier individual partial cancellation
//       // before the whole trip got bulk-cancelled), it must NOT be
//       // counted here.
//       const hasProperCancelledTraveller = b.travellers?.some(
//         (t) => t.cancelled?.byTraveller && t.cancelled?.byAdmin
//       );

//       // GV / IRCTC / Remarks / Refund — all four come from
//       // b.cancellationSummary, which the backend (bookingsTour in
//       // tourController.js) builds by querying APPROVED cancellationModel
//       // records for this tnr and summing gvCancellationAmount /
//       // irctcCancellationAmount / remarksAmount / refundAmount. These
//       // fields do NOT exist directly on the booking document itself
//       // (booking.gvCancellationPool/irctcCancellationPool are a
//       // DIFFERENT running-pool figure used internally for cancellation
//       // math, not the same as the actual per-cancellation amounts, and
//       // there is no booking-level refundAmount or remarksCancellationPool
//       // field at all) — cancellationSummary is the correct, single
//       // source for all four. Zeroed out entirely for bulk-trip-cancel
//       // (full refund) bookings via the hasProperCancelledTraveller gate.
//       const gv = hasProperCancelledTraveller ? (b.cancellationSummary?.gvCancellationAmount || 0) : 0;
//       const irctc = hasProperCancelledTraveller ? (b.cancellationSummary?.irctcCancellationAmount || 0) : 0;
//       const remarksPool = hasProperCancelledTraveller ? (b.cancellationSummary?.remarksAmount || 0) : 0;
//       gvCancellationTotal += gv;
//       irctcCancellationTotal += irctc;
//       remarksCancellationTotal += remarksPool;

//       // Negative admin remarks = money actually received that reduced
//       // the outstanding due (e.g. "PARTIAL BALANCE PAID: -₹10000") —
//       // the amount is stored negative but was genuinely collected, same
//       // convention as the invoice's buildPayments.
//       const allRemarks = [
//         ...(b.advanceAdminRemarks || []),
//         ...(b.adminRemarks || []),
//       ];
//       const negativeRemarksAmount = allRemarks
//         .filter((r) => typeof r.amount === "number" && r.amount < 0)
//         .reduce((sum, r) => sum + Math.abs(r.amount), 0);

//       // Amount comparisons involving refunds/balances can carry floating
//       // point noise (₹ paise rounding) — treat anything within this as
//       // equal.
//       const AMOUNT_EPSILON = 0.01;
//       const balanceAmt = b.payment?.balance?.amount || 0;
//       const refundAmount = hasProperCancelledTraveller ? (b.cancellationSummary?.refundAmount || 0) : 0;
//       const refundEqualsBalance =
//         refundAmount > 0 && Math.abs(refundAmount - balanceAmt) < AMOUNT_EPSILON;

//       if (!isRejectedByAdmin) {
//         if (isFullyCancelled) {
//           // Fully cancelled — refunded everything except the actual
//           // cancellation charge. Advance is fully refunded (0), balance
//           // is ONLY the cancellation charge — no negative remarks here.
//           balancePaidAmount += gv + irctc + remarksPool;
//         } else if (isPartiallyCancelled) {
//           // Partial cancellation — advance stays as genuinely collected.
//           if (advancePaid && advanceVerified) {
//             advancePaidAmount += b.payment?.advance?.amount || 0;
//           }
//           if (balancePaid) {
//             if (refundEqualsBalance) {
//               // Balance was already paid in FULL before cancellation,
//               // then refunded back exactly matching that amount — the
//               // real revenue kept is just the cancellation charge.
//               balancePaidAmount += gv + irctc + remarksPool + negativeRemarksAmount;
//             } else {
//               // Balance was adjusted DOWN to reflect the cancellation
//               // before being collected — payment.balance.amount is
//               // already the correct, reduced figure, so use it as-is.
//               balancePaidAmount += balanceAmt + negativeRemarksAmount;
//             }
//             partialPaymentsTotal += negativeRemarksAmount;
//           }
//         } else {
//           // No cancellation at all — original figures.
//           if (advancePaid && advanceVerified) {
//             advancePaidAmount += b.payment?.advance?.amount || 0;
//           }
//           if (balancePaid) {
//             balancePaidAmount += balanceAmt + negativeRemarksAmount;
//             partialPaymentsTotal += negativeRemarksAmount;
//           }
//         }
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

//     // GV/IRCTC/remarks cancellation revenue is already folded directly
//     // into balancePaidAmount above (fully cancelled → gv+irctc+remarks
//     // only; partial cancellation → gv+irctc+remarks+negative remarks) —
//     // so totalEarnings is simply advance + balance, same as before. The
//     // three cancellation totals are kept separately ONLY for their own
//     // breakdown cards (same pattern as partialPaymentsTotal), not added
//     // again here.
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
//       partialPaymentsTotal,
//       gvCancellationTotal,
//       irctcCancellationTotal,
//       remarksCancellationTotal,
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
//                 className="p-4 flex items-center justify-between gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100"
//                 onClick={() => toggleExpand(type, booking.tnr)}
//               >
//                 {/* Left: name + TNR + contact */}
//                 <div className="flex-1 min-w-0">
//                   <div className="font-bold text-base text-gray-900 truncate">
//                     {travellerName}
//                   </div>
//                   <div className="flex items-center gap-1 mt-0.5">
//                     <span className="font-mono font-bold text-indigo-700 text-xs tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
//                       {booking.tnr}
//                     </span>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         copyTNR(booking.tnr);
//                       }}
//                       className="text-blue-600 hover:text-blue-800 flex-shrink-0"
//                       title="Copy TNR"
//                     >
//                       <Copy size={14} />
//                     </button>
//                   </div>
//                   <div className="text-xs text-gray-500 mt-1 truncate">
//                     {booking.contact?.email || "—"} • {booking.contact?.mobile || "—"}
//                   </div>
//                 </div>

//                 {/* Right: Mark Complete button + chevron */}
//                 <div className="flex items-center gap-2 flex-shrink-0">
//                   {type !== "uncompleted" && (
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleMarkReceipt(booking, type);
//                       }}
//                       disabled={isLoading}
//                       className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition whitespace-nowrap ${isLoading
//                         ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                         : "bg-green-600 text-white hover:bg-green-700"
//                         }`}
//                     >
//                       {isLoading ? "..." : "✓ Mark"}
//                     </button>
//                   )}
//                   {isExpanded ? (
//                     <ChevronUp size={18} className="text-gray-500 flex-shrink-0" />
//                   ) : (
//                     <ChevronDown size={18} className="text-gray-500 flex-shrink-0" />
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
//                           {(() => {
//                             if (
//                               Array.isArray(t.selectedAddons) &&
//                               t.selectedAddons.length > 0
//                             ) {
//                               const getTripTypeStyle = (tripType) => {
//                                 const tt = (tripType || "").toUpperCase();
//                                 if (tt.startsWith("BOARD"))
//                                   return {
//                                     badge: "bg-blue-100 text-blue-700",
//                                     label: "Boarding",
//                                   };
//                                 if (tt.startsWith("MIDDLE"))
//                                   return {
//                                     badge: "bg-purple-100 text-purple-700",
//                                     label: "Middle",
//                                   };
//                                 if (
//                                   tt.startsWith("DEBOARD") ||
//                                   tt.startsWith("DEBOARF")
//                                 )
//                                   return {
//                                     badge: "bg-orange-100 text-orange-700",
//                                     label: "Deboarding",
//                                   };
//                                 return {
//                                   badge: "bg-gray-100 text-gray-700",
//                                   label: tripType || "Trip",
//                                 };
//                               };

//                               const isFlightAddon = (a) => {
//                                 if (a.flightNo || a.airline) return true;
//                                 if (a.trainNo || a.trainName) return false;
//                                 return (
//                                   (a.flightIndex !== undefined &&
//                                     a.flightIndex !== null) ||
//                                   a.tripKind === "flight"
//                                 );
//                               };

//                               const buildLabel = (a, isFlight) => {
//                                 const primary = isFlight
//                                   ? a.airline
//                                   : a.trainName;
//                                 const secondary = isFlight
//                                   ? a.flightNo
//                                   : a.trainNo;
//                                 if (!primary && !secondary) return null;
//                                 if (primary && secondary)
//                                   return `${primary} (${secondary})`;
//                                 return primary || secondary;
//                               };

//                               const trainEntries = t.selectedAddons.filter(
//                                 (a) => !isFlightAddon(a),
//                               );
//                               const flightEntries = t.selectedAddons.filter(
//                                 (a) => isFlightAddon(a),
//                               );

//                               const renderRow = (a, idx) => {
//                                 const isFlight = isFlightAddon(a);
//                                 const style = getTripTypeStyle(a.tripType);
//                                 const label = buildLabel(a, isFlight);
//                                 return (
//                                   <div
//                                     key={idx}
//                                     className="flex flex-wrap items-center gap-1.5 mt-0.5"
//                                   >
//                                     <span
//                                       className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${style.badge}`}
//                                     >
//                                       {style.label}
//                                     </span>
//                                     <span className="text-gray-700">
//                                       {label ? `${label}: ` : ""}
//                                       {a.name}
//                                     </span>
//                                     <span className="font-semibold text-green-700">
//                                       +₹{a.amount || 0}
//                                     </span>
//                                   </div>
//                                 );
//                               };

//                               return (
//                                 <div className="mt-1">
//                                   {trainEntries.length > 0 && (
//                                     <div>
//                                       <p className="font-semibold text-red-600 text-[11px]">
//                                         🚆 Train Addons
//                                       </p>
//                                       {trainEntries.map((a, idx) =>
//                                         renderRow(a, idx),
//                                       )}
//                                     </div>
//                                   )}
//                                   {flightEntries.length > 0 && (
//                                     <div className="mt-1">
//                                       <p className="font-semibold text-orange-900 text-[11px]">
//                                         ✈️ Flight Addons
//                                       </p>
//                                       {flightEntries.map((a, idx) =>
//                                         renderRow(a, idx),
//                                       )}
//                                     </div>
//                                   )}
//                                 </div>
//                               );
//                             }

//                             return (
//                               t.selectedAddon?.name && (
//                                 <p>
//                                   <strong>Add-on:</strong>{" "}
//                                   {t.selectedAddon.name} (₹
//                                   {t.selectedAddon.price})
//                                 </p>
//                               )
//                             );
//                           })()}
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
//                           {(t.cancelled?.byTraveller || t.cancelled?.byAdmin) && (
//                             <p className="mt-2 text-red-600 font-medium">
//                               Cancelled (
//                               {t.cancelled.byAdmin ? "by Admin" : "by Traveller"}
//                               )
//                             </p>
//                           )}
//                         </div>
//                       )) || (
//                           <p className="text-gray-500 col-span-2">No travellers</p>
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
//               {/* Mobile: 2 cols | Tablet & Desktop: 5 cols (2 rows of 5) */}
//               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">

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

//                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
//                   <div className="w-10 h-10 mx-auto bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center mb-3">
//                     <IndianRupee size={24} />
//                   </div>
//                   <p className="text-xs font-medium text-gray-600">Partial Payments</p>
//                   <p className="text-2xl font-bold text-amber-700 mt-1">
//                     ₹{stats.partialPaymentsTotal.toLocaleString("en-IN")}
//                   </p>
//                 </div>

//                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
//                   <div className="w-10 h-10 mx-auto bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
//                     <IndianRupee size={24} />
//                   </div>
//                   <p className="text-xs font-medium text-gray-600">Total Earnings</p>
//                   <p className="text-2xl font-bold text-emerald-700 mt-1">
//                     ₹{stats.totalEarnings.toLocaleString("en-IN")}
//                   </p>
//                 </div>

//                 {/* GV / IRCTC / Remarks Cancellation Pool — each shown as
//                     its own card, same pattern as "Partial Payments"
//                     above. All three are already folded into the "Total
//                     Earnings" card above (like partial payments are
//                     folded into balance paid). */}
//                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
//                   <div className="w-10 h-10 mx-auto bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-3">
//                     <IndianRupee size={24} />
//                   </div>
//                   <p className="text-xs font-medium text-gray-600">GV Cancellation</p>
//                   <p className="text-2xl font-bold text-teal-700 mt-1">
//                     ₹{stats.gvCancellationTotal.toLocaleString("en-IN")}
//                   </p>
//                 </div>

//                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
//                   <div className="w-10 h-10 mx-auto bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center mb-3">
//                     <IndianRupee size={24} />
//                   </div>
//                   <p className="text-xs font-medium text-gray-600">IRCTC Cancellation</p>
//                   <p className="text-2xl font-bold text-cyan-700 mt-1">
//                     ₹{stats.irctcCancellationTotal.toLocaleString("en-IN")}
//                   </p>
//                 </div>

//                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
//                   <div className="w-10 h-10 mx-auto bg-lime-50 text-lime-700 rounded-xl flex items-center justify-center mb-3">
//                     <IndianRupee size={24} />
//                   </div>
//                   <p className="text-xs font-medium text-gray-600">Remarks Cancellation</p>
//                   <p className="text-2xl font-bold text-lime-700 mt-1">
//                     ₹{stats.remarksCancellationTotal.toLocaleString("en-IN")}
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

//   useEffect(() => {
//     if (!shouldProtect) return;
//     const handleBeforeUnload = (e) => {
//       e.preventDefault();
//       e.returnValue = "";
//     };
//     window.addEventListener("beforeunload", handleBeforeUnload);
//     return () => window.removeEventListener("beforeunload", handleBeforeUnload);
//   }, [shouldProtect]);

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
//         partialPaymentsTotal: 0,
//         gvCancellationTotal: 0,
//         irctcCancellationTotal: 0,
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
//     let partialPaymentsTotal = 0;
//     // Revenue from cancellation-affected bookings, broken down like
//     // partialPaymentsTotal — each shown as its own card AND added into
//     // totalEarnings below: GV Cancellation Pool, IRCTC Cancellation
//     // Pool, and Remarks Cancellation Pool — all three fetched DIRECTLY
//     // from the booking document (booking.gvCancellationPool /
//     // irctcCancellationPool / remarksCancellationPool), same pattern,
//     // no separate cancellationModel lookup needed.
//     let gvCancellationTotal = 0;
//     let irctcCancellationTotal = 0;
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
//           if (trav.cancelled?.byTraveller || trav.cancelled?.byAdmin) return false;
//           return true;
//         }) || [];
//         totalTravellersCount += validTravellers.length;
//       }

//       // A trip cancelled wholesale is marked with cancelled.viaTripCancel
//       // on every traveller — this happens for BOTH observed patterns
//       // ({byTraveller:false, byAdmin:false, viaTripCancel:true} — admin
//       // bulk trip-cancel, full refund — and {byTraveller:true,
//       // byAdmin:true, viaTripCancel:true} — normal individual
//       // cancellation that also carries the flag). viaTripCancel is the
//       // real decider, not the byTraveller/byAdmin combination. Kept the
//       // old byTraveller&&byAdmin check as a fallback for any legacy
//       // bookings that predate the viaTripCancel flag.
//       const isFullyCancelled = b.travellers?.length > 0 &&
//         b.travellers.every(
//           (t) =>
//             t.cancelled?.viaTripCancel === true ||
//             (t.cancelled?.byTraveller && t.cancelled?.byAdmin),
//         );

//       const isRejectedByAdmin = b.travellers?.length > 0 &&
//         b.travellers.every(
//           (t) =>
//             !t.cancelled?.viaTripCancel &&
//             t.cancelled?.byAdmin &&
//             !t.cancelled?.byTraveller,
//         );

//       const advancePaid = !!b.payment?.advance?.paid;
//       const balancePaid = !!b.payment?.balance?.paid;

//       if (isFullyCancelled) cancelled++;
//       else if (isRejectedByAdmin) rejected++;
//       else if (advancePaid && balancePaid) completed++;
//       else if (advancePaid && !balancePaid) pending++;
//       else unverified++;

//       const hasAnyCancelledTraveller = b.travellers?.some(
//         (t) => t.cancelled?.byTraveller || t.cancelled?.byAdmin || t.cancelled?.viaTripCancel
//       );
//       const isPartiallyCancelled = hasAnyCancelledTraveller && !isFullyCancelled;

//       // GV / IRCTC — direct, unconditional from the booking document's
//       // own gvCancellationPool / irctcCancellationPool fields (same
//       // source and same "no traveller-level filter" approach as the
//       // Analytics/Sales Dashboard page, so both pages agree).
//       // Remarks / Refund still come from b.cancellationSummary (backend
//       // bookingsTour aggregation of approved cancellationModel records)
//       // since there is no equivalent booking-level pool field for them.
//       const gv = b.gvCancellationPool || 0;
//       const irctc = b.irctcCancellationPool || 0;
//       gvCancellationTotal += gv;
//       irctcCancellationTotal += irctc;

//       // Negative admin remarks (adminRemarks ONLY — these are the
//       // balance-side remarks; advanceAdminRemarks are unrelated to the
//       // balance and must not be mixed in) = money actually received
//       // that reduced the outstanding balance due (e.g. "PARTIAL
//       // BALANCE PAID: -₹10000"). The amount is stored negative but was
//       // genuinely collected — same convention as the invoice's
//       // buildPayments. This counts REGARDLESS of whether
//       // payment.balance.paid has been toggled true — the remark itself
//       // is the proof the money came in.
//       const negativeRemarksAmount = (b.adminRemarks || [])
//         .filter((r) => typeof r.amount === "number" && r.amount < 0)
//         .reduce((sum, r) => sum + Math.abs(r.amount), 0);

//       // Amount comparisons involving refunds/balances can carry floating
//       // point noise (₹ paise rounding) — treat anything within this as
//       // equal.
//       const AMOUNT_EPSILON = 0.01;
//       const balanceAmt = b.payment?.balance?.amount || 0;
//       const refundAmount = b.cancellationSummary?.refundAmount || 0;
//       const refundEqualsBalance =
//         refundAmount > 0 && Math.abs(refundAmount - balanceAmt) < AMOUNT_EPSILON;

//       if (!isRejectedByAdmin) {
//         if (isFullyCancelled) {
//           // Fully cancelled — refunded everything except the actual
//           // cancellation charge. Advance is fully refunded (0), balance
//           // is ONLY the cancellation charge — no negative remarks here.
//           balancePaidAmount += gv + irctc;
//         } else if (isPartiallyCancelled) {
//           // Partial cancellation — advance stays as genuinely collected.
//           if (advancePaid && advanceVerified) {
//             advancePaidAmount += b.payment?.advance?.amount || 0;
//           }
//           if (balancePaid) {
//             if (refundEqualsBalance) {
//               // Balance was already paid in FULL before cancellation,
//               // then refunded back exactly matching that amount — the
//               // real revenue kept is just the cancellation charge.
//               balancePaidAmount += gv + irctc;
//             } else {
//               // Balance was adjusted DOWN to reflect the cancellation
//               // before being collected — payment.balance.amount is
//               // already the correct, reduced figure, so use it as-is.
//               balancePaidAmount += balanceAmt;
//             }
//           }
//           balancePaidAmount += negativeRemarksAmount;
//           partialPaymentsTotal += negativeRemarksAmount;
//         } else {
//           // No cancellation at all — original figures.
//           if (advancePaid && advanceVerified) {
//             advancePaidAmount += b.payment?.advance?.amount || 0;
//           }
//           if (balancePaid) {
//             balancePaidAmount += balanceAmt;
//           }
//           balancePaidAmount += negativeRemarksAmount;
//           partialPaymentsTotal += negativeRemarksAmount;
//         }
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

//     // GV/IRCTC/remarks cancellation revenue is already folded directly
//     // into balancePaidAmount above (fully cancelled → gv+irctc+remarks
//     // only; partial cancellation → gv+irctc+remarks+negative remarks) —
//     // so totalEarnings is simply advance + balance, same as before. The
//     // three cancellation totals are kept separately ONLY for their own
//     // breakdown cards (same pattern as partialPaymentsTotal), not added
//     // again here.
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
//       partialPaymentsTotal,
//       gvCancellationTotal,
//       irctcCancellationTotal,
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
//                 className="p-4 flex items-center justify-between gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100"
//                 onClick={() => toggleExpand(type, booking.tnr)}
//               >
//                 {/* Left: name + TNR + contact */}
//                 <div className="flex-1 min-w-0">
//                   <div className="font-bold text-base text-gray-900 truncate">
//                     {travellerName}
//                   </div>
//                   <div className="flex items-center gap-1 mt-0.5">
//                     <span className="font-mono font-bold text-indigo-700 text-xs tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
//                       {booking.tnr}
//                     </span>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         copyTNR(booking.tnr);
//                       }}
//                       className="text-blue-600 hover:text-blue-800 flex-shrink-0"
//                       title="Copy TNR"
//                     >
//                       <Copy size={14} />
//                     </button>
//                   </div>
//                   <div className="text-xs text-gray-500 mt-1 truncate">
//                     {booking.contact?.email || "—"} • {booking.contact?.mobile || "—"}
//                   </div>
//                 </div>

//                 {/* Right: Mark Complete button + chevron */}
//                 <div className="flex items-center gap-2 flex-shrink-0">
//                   {type !== "uncompleted" && (
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleMarkReceipt(booking, type);
//                       }}
//                       disabled={isLoading}
//                       className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition whitespace-nowrap ${isLoading
//                         ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                         : "bg-green-600 text-white hover:bg-green-700"
//                         }`}
//                     >
//                       {isLoading ? "..." : "✓ Mark"}
//                     </button>
//                   )}
//                   {isExpanded ? (
//                     <ChevronUp size={18} className="text-gray-500 flex-shrink-0" />
//                   ) : (
//                     <ChevronDown size={18} className="text-gray-500 flex-shrink-0" />
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
//                           {(() => {
//                             if (
//                               Array.isArray(t.selectedAddons) &&
//                               t.selectedAddons.length > 0
//                             ) {
//                               const getTripTypeStyle = (tripType) => {
//                                 const tt = (tripType || "").toUpperCase();
//                                 if (tt.startsWith("BOARD"))
//                                   return {
//                                     badge: "bg-blue-100 text-blue-700",
//                                     label: "Boarding",
//                                   };
//                                 if (tt.startsWith("MIDDLE"))
//                                   return {
//                                     badge: "bg-purple-100 text-purple-700",
//                                     label: "Middle",
//                                   };
//                                 if (
//                                   tt.startsWith("DEBOARD") ||
//                                   tt.startsWith("DEBOARF")
//                                 )
//                                   return {
//                                     badge: "bg-orange-100 text-orange-700",
//                                     label: "Deboarding",
//                                   };
//                                 return {
//                                   badge: "bg-gray-100 text-gray-700",
//                                   label: tripType || "Trip",
//                                 };
//                               };

//                               const isFlightAddon = (a) => {
//                                 if (a.flightNo || a.airline) return true;
//                                 if (a.trainNo || a.trainName) return false;
//                                 return (
//                                   (a.flightIndex !== undefined &&
//                                     a.flightIndex !== null) ||
//                                   a.tripKind === "flight"
//                                 );
//                               };

//                               const buildLabel = (a, isFlight) => {
//                                 const primary = isFlight
//                                   ? a.airline
//                                   : a.trainName;
//                                 const secondary = isFlight
//                                   ? a.flightNo
//                                   : a.trainNo;
//                                 if (!primary && !secondary) return null;
//                                 if (primary && secondary)
//                                   return `${primary} (${secondary})`;
//                                 return primary || secondary;
//                               };

//                               const trainEntries = t.selectedAddons.filter(
//                                 (a) => !isFlightAddon(a),
//                               );
//                               const flightEntries = t.selectedAddons.filter(
//                                 (a) => isFlightAddon(a),
//                               );

//                               const renderRow = (a, idx) => {
//                                 const isFlight = isFlightAddon(a);
//                                 const style = getTripTypeStyle(a.tripType);
//                                 const label = buildLabel(a, isFlight);
//                                 return (
//                                   <div
//                                     key={idx}
//                                     className="flex flex-wrap items-center gap-1.5 mt-0.5"
//                                   >
//                                     <span
//                                       className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${style.badge}`}
//                                     >
//                                       {style.label}
//                                     </span>
//                                     <span className="text-gray-700">
//                                       {label ? `${label}: ` : ""}
//                                       {a.name}
//                                     </span>
//                                     <span className="font-semibold text-green-700">
//                                       +₹{a.amount || 0}
//                                     </span>
//                                   </div>
//                                 );
//                               };

//                               return (
//                                 <div className="mt-1">
//                                   {trainEntries.length > 0 && (
//                                     <div>
//                                       <p className="font-semibold text-red-600 text-[11px]">
//                                         🚆 Train Addons
//                                       </p>
//                                       {trainEntries.map((a, idx) =>
//                                         renderRow(a, idx),
//                                       )}
//                                     </div>
//                                   )}
//                                   {flightEntries.length > 0 && (
//                                     <div className="mt-1">
//                                       <p className="font-semibold text-orange-900 text-[11px]">
//                                         ✈️ Flight Addons
//                                       </p>
//                                       {flightEntries.map((a, idx) =>
//                                         renderRow(a, idx),
//                                       )}
//                                     </div>
//                                   )}
//                                 </div>
//                               );
//                             }

//                             return (
//                               t.selectedAddon?.name && (
//                                 <p>
//                                   <strong>Add-on:</strong>{" "}
//                                   {t.selectedAddon.name} (₹
//                                   {t.selectedAddon.price})
//                                 </p>
//                               )
//                             );
//                           })()}
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
//                           {(t.cancelled?.byTraveller || t.cancelled?.byAdmin) && (
//                             <p className="mt-2 text-red-600 font-medium">
//                               Cancelled (
//                               {t.cancelled.byAdmin ? "by Admin" : "by Traveller"}
//                               )
//                             </p>
//                           )}
//                         </div>
//                       )) || (
//                           <p className="text-gray-500 col-span-2">No travellers</p>
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
//               {/* Mobile: 2 cols | Tablet & Desktop: 5 cols (2 rows of 5) */}
//               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">

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

//                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
//                   <div className="w-10 h-10 mx-auto bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center mb-3">
//                     <IndianRupee size={24} />
//                   </div>
//                   <p className="text-xs font-medium text-gray-600">Partial Payments</p>
//                   <p className="text-2xl font-bold text-amber-700 mt-1">
//                     ₹{stats.partialPaymentsTotal.toLocaleString("en-IN")}
//                   </p>
//                 </div>

//                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
//                   <div className="w-10 h-10 mx-auto bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
//                     <IndianRupee size={24} />
//                   </div>
//                   <p className="text-xs font-medium text-gray-600">Total Earnings</p>
//                   <p className="text-2xl font-bold text-emerald-700 mt-1">
//                     ₹{stats.totalEarnings.toLocaleString("en-IN")}
//                   </p>
//                 </div>

//                 {/* GV (includes Remarks merged in) / IRCTC Cancellation
//                     Pool — each shown as its own card, same pattern as
//                     "Partial Payments" above. Both are already folded into
//                     the "Total Earnings" card above. */}
//                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
//                   <div className="w-10 h-10 mx-auto bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-3">
//                     <IndianRupee size={24} />
//                   </div>
//                   <p className="text-xs font-medium text-gray-600">GV Cancellation</p>
//                   <p className="text-2xl font-bold text-teal-700 mt-1">
//                     ₹{stats.gvCancellationTotal.toLocaleString("en-IN")}
//                   </p>
//                 </div>

//                 <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
//                   <div className="w-10 h-10 mx-auto bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center mb-3">
//                     <IndianRupee size={24} />
//                   </div>
//                   <p className="text-xs font-medium text-gray-600">IRCTC Cancellation</p>
//                   <p className="text-2xl font-bold text-cyan-700 mt-1">
//                     ₹{stats.irctcCancellationTotal.toLocaleString("en-IN")}
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

  // Re-run this fetch every time the user navigates to this page, not
  // just when selectedTourId first changes. location.key is a fresh
  // string on every React Router navigation (even to the same path),
  // so if the component stays mounted (persistent layout) after
  // marking a receipt on TaskDashboard and the user navigates back
  // here, this still refetches and the receipt-pending lists /
  // Advance-Balance totals reflect the just-marked receipt instead of
  // showing stale cached data.
  useEffect(() => {
    if (ttoken && selectedTourId) {
      setIsLoading(true);
      Promise.all([getDashData(selectedTourId), getBookings(selectedTourId)])
        .then(([dashRes]) => handleApiResponse(dashRes, "Dashboard updated"))
        .catch((err) => toast.error(err.message || "Failed to load data"))
        .finally(() => setIsLoading(false));
    }
  }, [ttoken, selectedTourId, location.key, getDashData, getBookings, handleApiResponse]);

  // Cross-TAB sync: TaskDashboard and TourDashboard are often open in
  // two separate browser tabs (two separate React app instances), so
  // TourContext state sharing only helps within a single tab — marking
  // a receipt on TaskDashboard in one tab does NOT update this
  // tab's in-memory `bookings`, even though the DB is already correct.
  // Refetching whenever this tab regains focus/visibility (switching
  // back to it) picks up that change without needing a manual page
  // reload.
  useEffect(() => {
    if (!ttoken || !selectedTourId) return;

    const refetchOnFocus = () => {
      if (document.visibilityState === "hidden") return;
      Promise.all([getDashData(selectedTourId), getBookings(selectedTourId)]).catch(
        (err) => toast.error(err.message || "Failed to refresh data"),
      );
    };

    window.addEventListener("focus", refetchOnFocus);
    document.addEventListener("visibilitychange", refetchOnFocus);
    return () => {
      window.removeEventListener("focus", refetchOnFocus);
      document.removeEventListener("visibilitychange", refetchOnFocus);
    };
  }, [ttoken, selectedTourId, getDashData, getBookings]);

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
        partialPaymentsTotal: 0,
        gvCancellationTotal: 0,
        irctcCancellationTotal: 0,
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
    let partialPaymentsTotal = 0;
    // Revenue from cancellation-affected bookings, broken down like
    // partialPaymentsTotal — each shown as its own card AND added into
    // totalEarnings below: GV Cancellation Pool, IRCTC Cancellation
    // Pool, and Remarks Cancellation Pool — all three fetched DIRECTLY
    // from the booking document (booking.gvCancellationPool /
    // irctcCancellationPool / remarksCancellationPool), same pattern,
    // no separate cancellationModel lookup needed.
    let gvCancellationTotal = 0;
    let irctcCancellationTotal = 0;
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

      // A trip cancelled wholesale is marked with cancelled.viaTripCancel
      // on every traveller — this happens for BOTH observed patterns
      // ({byTraveller:false, byAdmin:false, viaTripCancel:true} — admin
      // bulk trip-cancel, full refund — and {byTraveller:true,
      // byAdmin:true, viaTripCancel:true} — normal individual
      // cancellation that also carries the flag). viaTripCancel is the
      // real decider, not the byTraveller/byAdmin combination. Kept the
      // old byTraveller&&byAdmin check as a fallback for any legacy
      // bookings that predate the viaTripCancel flag.
      const isFullyCancelled = b.travellers?.length > 0 &&
        b.travellers.every(
          (t) =>
            t.cancelled?.viaTripCancel === true ||
            (t.cancelled?.byTraveller && t.cancelled?.byAdmin),
        );

      const isRejectedByAdmin = b.travellers?.length > 0 &&
        b.travellers.every(
          (t) =>
            !t.cancelled?.viaTripCancel &&
            t.cancelled?.byAdmin &&
            !t.cancelled?.byTraveller,
        );

      const advancePaid = !!b.payment?.advance?.paid;
      const balancePaid = !!b.payment?.balance?.paid;

      if (isFullyCancelled) cancelled++;
      else if (isRejectedByAdmin) rejected++;
      else if (advancePaid && balancePaid) completed++;
      else if (advancePaid && !balancePaid) pending++;
      else unverified++;

      const hasAnyCancelledTraveller = b.travellers?.some(
        (t) => t.cancelled?.byTraveller || t.cancelled?.byAdmin || t.cancelled?.viaTripCancel
      );
      const isPartiallyCancelled = hasAnyCancelledTraveller && !isFullyCancelled;

      // GV / IRCTC — direct, unconditional from the booking document's
      // own gvCancellationPool / irctcCancellationPool fields (same
      // source and same "no traveller-level filter" approach as the
      // Analytics/Sales Dashboard page, so both pages agree).
      // Remarks / Refund still come from b.cancellationSummary (backend
      // bookingsTour aggregation of approved cancellationModel records)
      // since there is no equivalent booking-level pool field for them.
      const gv = b.gvCancellationPool || 0;
      const irctc = b.irctcCancellationPool || 0;
      gvCancellationTotal += gv;
      irctcCancellationTotal += irctc;

      // Negative admin remarks (adminRemarks ONLY — these are the
      // balance-side remarks; advanceAdminRemarks are unrelated to the
      // balance and must not be mixed in) = money actually received
      // that reduced the outstanding balance due (e.g. "PARTIAL
      // BALANCE PAID: -₹10000"). The amount is stored negative but was
      // genuinely collected — same convention as the invoice's
      // buildPayments. This counts REGARDLESS of whether
      // payment.balance.paid has been toggled true — the remark itself
      // is the proof the money came in.
      const negativeRemarksAmount = (b.adminRemarks || [])
        .filter((r) => typeof r.amount === "number" && r.amount < 0)
        .reduce((sum, r) => sum + Math.abs(r.amount), 0);

      // Amount comparisons involving refunds/balances can carry floating
      // point noise (₹ paise rounding) — treat anything within this as
      // equal.
      const AMOUNT_EPSILON = 0.01;
      const balanceAmt = b.payment?.balance?.amount || 0;
      const refundAmount = b.cancellationSummary?.refundAmount || 0;
      const refundEqualsBalance =
        refundAmount > 0 && Math.abs(refundAmount - balanceAmt) < AMOUNT_EPSILON;

      if (!isRejectedByAdmin) {
        if (isFullyCancelled) {
          // Fully cancelled — refunded everything except the actual
          // cancellation charge. Advance is fully refunded (0), balance
          // is ONLY the cancellation charge — no negative remarks here.
          balancePaidAmount += gv + irctc;
        } else if (isPartiallyCancelled) {
          // Partial cancellation — advance stays as genuinely collected.
          if (advancePaid && advanceVerified) {
            advancePaidAmount += b.payment?.advance?.amount || 0;
          }
          if (balancePaid) {
            if (refundEqualsBalance) {
              // Balance was already paid in FULL before cancellation,
              // then refunded back exactly matching that amount — the
              // real revenue kept is just the cancellation charge.
              balancePaidAmount += gv + irctc;
            } else {
              // Balance was adjusted DOWN to reflect the cancellation
              // before being collected — payment.balance.amount is
              // already the correct, reduced figure, so use it as-is.
              balancePaidAmount += balanceAmt;
            }
          }
          balancePaidAmount += negativeRemarksAmount;
          partialPaymentsTotal += negativeRemarksAmount;
        } else {
          // No cancellation at all — original figures.
          if (advancePaid && advanceVerified) {
            advancePaidAmount += b.payment?.advance?.amount || 0;
          }
          if (balancePaid) {
            balancePaidAmount += balanceAmt;
          }
          balancePaidAmount += negativeRemarksAmount;
          partialPaymentsTotal += negativeRemarksAmount;
        }
      }

      if (!isFullyCancelled && advanceVerified && !b.receipts?.advanceReceiptSent) {
        advancePending.push(b);
      }
      if (!isFullyCancelled && balancePaid && !b.receipts?.balanceReceiptSent) {
        balancePending.push(b);
      }
      if (b.isTripCompleted && !isFullyCancelled) {
        modifyReceiptPending.push(b);
      }
      if (!b.isBookingCompleted && !isFullyCancelled) {
        uncompleted.push(b);
      }
    });

    // GV/IRCTC/remarks cancellation revenue is already folded directly
    // into balancePaidAmount above (fully cancelled → gv+irctc+remarks
    // only; partial cancellation → gv+irctc+remarks+negative remarks) —
    // so totalEarnings is simply advance + balance, same as before. The
    // three cancellation totals are kept separately ONLY for their own
    // breakdown cards (same pattern as partialPaymentsTotal), not added
    // again here.
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
      partialPaymentsTotal,
      gvCancellationTotal,
      irctcCancellationTotal,
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
                          {(() => {
                            if (
                              Array.isArray(t.selectedAddons) &&
                              t.selectedAddons.length > 0
                            ) {
                              const getTripTypeStyle = (tripType) => {
                                const tt = (tripType || "").toUpperCase();
                                if (tt.startsWith("BOARD"))
                                  return {
                                    badge: "bg-blue-100 text-blue-700",
                                    label: "Boarding",
                                  };
                                if (tt.startsWith("MIDDLE"))
                                  return {
                                    badge: "bg-purple-100 text-purple-700",
                                    label: "Middle",
                                  };
                                if (
                                  tt.startsWith("DEBOARD") ||
                                  tt.startsWith("DEBOARF")
                                )
                                  return {
                                    badge: "bg-orange-100 text-orange-700",
                                    label: "Deboarding",
                                  };
                                return {
                                  badge: "bg-gray-100 text-gray-700",
                                  label: tripType || "Trip",
                                };
                              };

                              const isFlightAddon = (a) => {
                                if (a.flightNo || a.airline) return true;
                                if (a.trainNo || a.trainName) return false;
                                return (
                                  (a.flightIndex !== undefined &&
                                    a.flightIndex !== null) ||
                                  a.tripKind === "flight"
                                );
                              };

                              const buildLabel = (a, isFlight) => {
                                const primary = isFlight
                                  ? a.airline
                                  : a.trainName;
                                const secondary = isFlight
                                  ? a.flightNo
                                  : a.trainNo;
                                if (!primary && !secondary) return null;
                                if (primary && secondary)
                                  return `${primary} (${secondary})`;
                                return primary || secondary;
                              };

                              const trainEntries = t.selectedAddons.filter(
                                (a) => !isFlightAddon(a),
                              );
                              const flightEntries = t.selectedAddons.filter(
                                (a) => isFlightAddon(a),
                              );

                              const renderRow = (a, idx) => {
                                const isFlight = isFlightAddon(a);
                                const style = getTripTypeStyle(a.tripType);
                                const label = buildLabel(a, isFlight);
                                return (
                                  <div
                                    key={idx}
                                    className="flex flex-wrap items-center gap-1.5 mt-0.5"
                                  >
                                    <span
                                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${style.badge}`}
                                    >
                                      {style.label}
                                    </span>
                                    <span className="text-gray-700">
                                      {label ? `${label}: ` : ""}
                                      {a.name}
                                    </span>
                                    <span className="font-semibold text-green-700">
                                      +₹{a.amount || 0}
                                    </span>
                                  </div>
                                );
                              };

                              return (
                                <div className="mt-1">
                                  {trainEntries.length > 0 && (
                                    <div>
                                      <p className="font-semibold text-red-600 text-[11px]">
                                        🚆 Train Addons
                                      </p>
                                      {trainEntries.map((a, idx) =>
                                        renderRow(a, idx),
                                      )}
                                    </div>
                                  )}
                                  {flightEntries.length > 0 && (
                                    <div className="mt-1">
                                      <p className="font-semibold text-orange-900 text-[11px]">
                                        ✈️ Flight Addons
                                      </p>
                                      {flightEntries.map((a, idx) =>
                                        renderRow(a, idx),
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            return (
                              t.selectedAddon?.name && (
                                <p>
                                  <strong>Add-on:</strong>{" "}
                                  {t.selectedAddon.name} (₹
                                  {t.selectedAddon.price})
                                </p>
                              )
                            );
                          })()}
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
                  <div className="w-10 h-10 mx-auto bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center mb-3">
                    <IndianRupee size={24} />
                  </div>
                  <p className="text-xs font-medium text-gray-600">Partial Payments</p>
                  <p className="text-2xl font-bold text-amber-700 mt-1">
                    ₹{stats.partialPaymentsTotal.toLocaleString("en-IN")}
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

                {/* GV (includes Remarks merged in) / IRCTC Cancellation
                    Pool — each shown as its own card, same pattern as
                    "Partial Payments" above. Both are already folded into
                    the "Total Earnings" card above. */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
                  <div className="w-10 h-10 mx-auto bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-3">
                    <IndianRupee size={24} />
                  </div>
                  <p className="text-xs font-medium text-gray-600">GV Cancellation</p>
                  <p className="text-2xl font-bold text-teal-700 mt-1">
                    ₹{stats.gvCancellationTotal.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all text-center">
                  <div className="w-10 h-10 mx-auto bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center mb-3">
                    <IndianRupee size={24} />
                  </div>
                  <p className="text-xs font-medium text-gray-600">IRCTC Cancellation</p>
                  <p className="text-2xl font-bold text-cyan-700 mt-1">
                    ₹{stats.irctcCancellationTotal.toLocaleString("en-IN")}
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
