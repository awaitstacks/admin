// /* eslint-disable react-hooks/exhaustive-deps */
// // Shared presentational component for the "Payment Tasks" dashboard —
// // used by BOTH the Tour Admin side and the Admin side. Each side has its
// // own tiny wrapper page (PaymentTasks.jsx / PaymentTasksAdmin.jsx) that
// // pulls getPaymentTasks/markPaymentTaskDone from its own Context and
// // passes them in here as props — this file never imports a Context
// // itself, so the exact same UI/behaviour renders on both logins.
// //
// // Styled to match the existing Task Dashboard's look (gradient background,
// // click-to-expand cards, metric tiles, "Show More" pagination) — this is a
// // brand-new, separate page though, never touching TaskDashboard.jsx itself.
// // Only 3 headings here instead of 7:
// //   1. Advance Payment Pending  — read-only. Clears itself automatically
// //      the moment the admin uses the EXISTING "Mark Advance Paid" action
// //      on the Tour Bookings page. No button here for this one, on purpose.
// //   2. Partial Payment Pending  — has a manual "Mark Done" button.
// //   3. Balance Payment Pending  — has a manual "Mark Done" button.
// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import {
//   IndianRupee,
//   Receipt,
//   Wallet,
//   Loader2,
//   Check,
//   Copy,
//   Clock,
//   Users,
//   MapPin,
//   History,
// } from "lucide-react";

// const formatDateTime = (date) =>
//   date
//     ? new Date(date).toLocaleString("en-IN", {
//         dateStyle: "medium",
//         timeStyle: "short",
//       })
//     : "—";

// const copyToClipboard = (text) => {
//   if (!text) {
//     toast.error("No TNR to copy");
//     return;
//   }
//   navigator.clipboard.writeText(text).then(
//     () => toast.success("TNR copied!"),
//     () => toast.error("Failed to copy"),
//   );
// };

// // One task card — click to expand, same shell for all three categories.
// // Action button only rendered when onMarkDone is passed (i.e. not Advance).
// const TaskCard = ({ task, category, Icon, iconColor, onMarkDone, isMarking }) => {
//   const [expanded, setExpanded] = useState(false);

//   if (!task.tnr) {
//     return (
//       <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-red-700 text-sm">
//         Task missing TNR – cannot display
//       </div>
//     );
//   }

//   return (
//     <div
//       className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-4 cursor-pointer"
//       onClick={() => setExpanded((e) => !e)}
//     >
//       <div className="flex justify-between items-center">
//         <div className="flex items-center gap-3 flex-1 min-w-0">
//           <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
//             <Icon className={`w-5 h-5 ${iconColor}`} />
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="font-medium text-gray-900 text-base break-words whitespace-normal leading-snug">
//               {task.tourTitle || "Tour"}
//             </p>
//             <p className="text-sm text-gray-600 mt-0.5 break-words whitespace-normal">
//               <strong>{task.mainName || "Unnamed traveller"}</strong>
//             </p>
//           </div>
//         </div>

//         {onMarkDone ? (
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onMarkDone(task.docId);
//             }}
//             disabled={isMarking}
//             className={`ml-3 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white rounded-lg transition ${
//               isMarking
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-green-600 hover:bg-green-700"
//             }`}
//           >
//             {isMarking ? (
//               <Loader2 className="w-4 h-4 animate-spin" />
//             ) : (
//               <Check className="w-4 h-4" />
//             )}
//             <span className="hidden xs:inline">Mark Done</span>
//           </button>
//         ) : (
//           <span className="ml-3 flex-shrink-0 text-[11px] text-gray-400 italic text-right max-w-[110px]">
//             Auto-clears via Tour Bookings
//           </span>
//         )}
//       </div>

//       {expanded && (
//         <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 text-sm text-gray-700">
//           {/* TNR */}
//           <div className="flex items-center gap-2">
//             <strong>TNR:</strong>
//             <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono tracking-wider font-bold">
//               {task.tnr}
//             </code>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 copyToClipboard(task.tnr);
//               }}
//               className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
//             >
//               <Copy className="w-3 h-3" /> Copy
//             </button>
//           </div>

//           {task.amount != null && (
//             <p>
//               <strong>Amount:</strong> ₹{task.amount}
//             </p>
//           )}

//           <p className="flex items-center gap-1.5 text-gray-600">
//             <Clock className="w-3.5 h-3.5" />
//             {task.uploadedAt
//               ? `Uploaded ${formatDateTime(task.uploadedAt)}`
//               : task.bookingDate
//               ? `Booked ${formatDateTime(task.bookingDate)}`
//               : "—"}
//           </p>

//           {task.screenshotUrl && (
//             <div onClick={(e) => e.stopPropagation()}>
//               <p className="font-semibold mb-1.5">Payment Screenshot</p>
//               <a
//                 href={task.screenshotUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="block w-28 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition"
//               >
//                 <img
//                   src={task.screenshotUrl}
//                   alt="Payment screenshot"
//                   className="w-full h-28 object-cover"
//                 />
//               </a>
//               <a
//                 href={task.screenshotUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="inline-block mt-1.5 text-blue-600 hover:text-blue-800 text-xs font-medium"
//               >
//                 View full screenshot
//               </a>
//             </div>
//           )}

//           {/* Everything that was saved on this booking — same depth as the
//               Task Dashboard's card. Only renders once the backend could
//               resolve the linked booking (task.booking); older/unlinked
//               groups just show the fields above. */}
//           {task.booking && (
//             <>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
//                 <p><strong>Email:</strong> {task.booking.email || "—"}</p>
//                 <p><strong>Mobile:</strong> {task.booking.mobile || "—"}</p>
//                 <p><strong>Booking Type:</strong> {task.booking.bookingType || "—"}</p>
//                 <p><strong>Booking Date:</strong> {formatDateTime(task.booking.bookingDate)}</p>
//                 <p><strong>Trip Completed:</strong> {task.booking.isTripCompleted ? "Yes" : "No"}</p>
//                 <p><strong>Booking Completed:</strong> {task.booking.isBookingCompleted ? "Yes" : "No"}</p>
//                 <p><strong>Manage Booking:</strong> {task.booking.manageBooking ? "Yes" : "No"}</p>
//                 <p><strong>GV Cancellation Pool:</strong> {task.booking.gvCancellationPool ?? "—"}</p>
//                 <p><strong>IRCTC Cancellation Pool:</strong> {task.booking.irctcCancellationPool ?? "—"}</p>
//               </div>

//               {task.booking.creationRemarks && (
//                 <p className="text-sm break-words whitespace-pre-wrap">
//                   <strong>Booking Creation Remarks:</strong> {task.booking.creationRemarks}
//                 </p>
//               )}

//               {/* Travellers */}
//               <div>
//                 <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
//                   <Users className="w-4 h-4" /> Travellers ({task.booking.travellers?.length || 0})
//                 </h4>
//                 <div className="space-y-3">
//                   {task.booking.travellers?.length ? (
//                     task.booking.travellers.map((t, i) => (
//                       <div
//                         key={i}
//                         className={`bg-gray-50 p-3 rounded-lg space-y-1 text-xs ${
//                           t.cancelled?.byTraveller || t.cancelled?.byAdmin
//                             ? "border-l-4 border-red-400"
//                             : ""
//                         }`}
//                       >
//                         <p className="font-medium break-words whitespace-normal leading-snug">
//                           {t.title} {t.firstName} {t.lastName} ({t.age} yrs, {t.gender || "—"})
//                         </p>
//                         <p className="break-words whitespace-normal">
//                           Sharing Type: {t.sharingType || "—"}
//                         </p>
//                         <p className="break-words whitespace-normal">
//                           Package Type: {t.packageType || "—"}
//                           {t.variantPackageIndex != null ? ` (Variant ${t.variantPackageIndex})` : ""}
//                         </p>
//                         {(() => {
//                           // NEW bookings: t.selectedAddons is an array, each
//                           // entry EITHER train-wise (trainNo/trainName) OR
//                           // flight-wise (flightNo/airline). OLD bookings:
//                           // t.selectedAddon is a flat single object — kept
//                           // working exactly as before.
//                           if (Array.isArray(t.selectedAddons) && t.selectedAddons.length > 0) {
//                             const getTripTypeStyle = (tripType) => {
//                               const tt = (tripType || "").toUpperCase();
//                               if (tt.startsWith("BOARD"))
//                                 return { badge: "bg-blue-100 text-blue-700", label: "Boarding" };
//                               if (tt.startsWith("MIDDLE"))
//                                 return { badge: "bg-purple-100 text-purple-700", label: "Middle" };
//                               if (tt.startsWith("DEBOARD") || tt.startsWith("DEBOARF"))
//                                 return { badge: "bg-orange-100 text-orange-700", label: "Deboarding" };
//                               return { badge: "bg-gray-100 text-gray-700", label: tripType || "Trip" };
//                             };

//                             const isFlightAddon = (a) => {
//                               if (a.flightNo || a.airline) return true;
//                               if (a.trainNo || a.trainName) return false;
//                               return (
//                                 (a.flightIndex !== undefined && a.flightIndex !== null) ||
//                                 a.tripKind === "flight"
//                               );
//                             };

//                             const buildLabel = (a, isFlight) => {
//                               const primary = isFlight ? a.airline : a.trainName;
//                               const secondary = isFlight ? a.flightNo : a.trainNo;
//                               if (!primary && !secondary) return null;
//                               if (primary && secondary) return `${primary} (${secondary})`;
//                               return primary || secondary;
//                             };

//                             const trainEntries = t.selectedAddons.filter((a) => !isFlightAddon(a));
//                             const flightEntries = t.selectedAddons.filter((a) => isFlightAddon(a));

//                             const renderRow = (a, idx, isFlight) => {
//                               const style = getTripTypeStyle(a.tripType);
//                               const label = buildLabel(a, isFlight);
//                               return (
//                                 <div key={idx} className="flex flex-wrap items-center gap-1.5 mt-1">
//                                   <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${style.badge}`}>
//                                     {style.label}
//                                   </span>
//                                   <span className="text-gray-700">
//                                     {label ? `${label}: ` : ""}
//                                     {a.name}
//                                   </span>
//                                   <span className="font-semibold text-green-700">
//                                     +₹{a.amount || 0}
//                                   </span>
//                                 </div>
//                               );
//                             };

//                             return (
//                               <>
//                                 {trainEntries.length > 0 && (
//                                   <div className="mt-1.5">
//                                     <p className="font-semibold text-red-600 text-[11px]">
//                                       🚆 Train Addons
//                                     </p>
//                                     {trainEntries.map((a, idx) => renderRow(a, idx, false))}
//                                   </div>
//                                 )}
//                                 {flightEntries.length > 0 && (
//                                   <div className="mt-1.5">
//                                     <p className="font-semibold text-orange-900 text-[11px]">
//                                       ✈️ Flight Addons
//                                     </p>
//                                     {flightEntries.map((a, idx) => renderRow(a, idx, true))}
//                                   </div>
//                                 )}
//                               </>
//                             );
//                           }

//                           // OLD flat addon (unchanged)
//                           return (
//                             t.selectedAddon && (
//                               <p className="break-words whitespace-normal">
//                                 Addon: {t.selectedAddon.name || "—"} ({t.selectedAddon.price || 0})
//                               </p>
//                             )
//                           );
//                         })()}
//                         {t.boardingPoint && (
//                           <p className="break-words whitespace-normal">
//                             Boarding Point: {t.boardingPoint.stationName || "—"} (
//                             {t.boardingPoint.stationCode || "—"})
//                           </p>
//                         )}
//                         {t.deboardingPoint && (
//                           <p className="break-words whitespace-normal">
//                             Deboarding Point: {t.deboardingPoint.stationName || "—"}{" "}
//                             ({t.deboardingPoint.stationCode || "—"})
//                           </p>
//                         )}
//                         {t.trainSeats?.length > 0 && (
//                           <p className="break-words whitespace-normal">
//                             Train Seats:{" "}
//                             {t.trainSeats
//                               .map((s) => `${s.trainName || "—"}: ${s.seatNo || "—"}`)
//                               .join(", ")}
//                           </p>
//                         )}
//                         {t.flightSeats?.length > 0 && (
//                           <p className="break-words whitespace-normal">
//                             Flight Seats:{" "}
//                             {t.flightSeats
//                               .map((s) => `${s.flightName || "—"}: ${s.seatNo || "—"}`)
//                               .join(", ")}
//                           </p>
//                         )}
//                         <p className="break-words whitespace-pre-wrap">
//                           Staff Remarks: {t.staffRemarks || "—"}
//                         </p>
//                         <p className="break-words whitespace-pre-wrap">
//                           Remarks: {t.remarks || "—"}
//                         </p>
//                         {(t.cancelled?.byTraveller || t.cancelled?.byAdmin) && (
//                           <p className="text-red-600 text-xs">
//                             Cancelled by {t.cancelled.byAdmin ? "Admin" : "Traveller"} at{" "}
//                             {formatDateTime(t.cancelled.cancelledAt)}
//                             {t.cancelled.reason ? ` (Reason: ${t.cancelled.reason})` : ""}
//                           </p>
//                         )}
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-gray-500 italic text-sm">No travellers</p>
//                   )}
//                 </div>
//               </div>

//               {/* Billing Address */}
//               <div>
//                 <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
//                   <MapPin className="w-4 h-4" /> Billing Address
//                 </h4>
//                 <p className="break-words whitespace-normal">
//                   {task.booking.billingAddress?.addressLine1 || "—"}{" "}
//                   {task.booking.billingAddress?.addressLine2 || ""}
//                 </p>
//                 <p className="break-words whitespace-normal">
//                   {task.booking.billingAddress?.city || "—"}, {task.booking.billingAddress?.state || "—"} -{" "}
//                   {task.booking.billingAddress?.pincode || "—"}, {task.booking.billingAddress?.country || "India"}
//                 </p>
//               </div>

//               {/* Payment Details */}
//               <div>
//                 <h4 className="font-semibold mb-2 text-sm">Payment Details</h4>
//                 <p className="break-words whitespace-normal">
//                   Advance: ₹{task.booking.payment?.advance?.amount || 0} —{" "}
//                   {task.booking.payment?.advance?.paid
//                     ? `Paid ${formatDateTime(task.booking.payment.advance.paidAt)}`
//                     : "Pending"}
//                   {task.booking.payment?.advance?.paymentVerified && " (Verified)"}
//                 </p>
//                 <p className="break-words whitespace-normal">
//                   Balance: ₹{task.booking.payment?.balance?.amount || 0} —{" "}
//                   {task.booking.payment?.balance?.paid
//                     ? `Paid ${formatDateTime(task.booking.payment.balance.paidAt)}`
//                     : "Pending"}
//                   {task.booking.payment?.balance?.paymentVerified && " (Verified)"}
//                 </p>
//                 <div className="mt-2 pt-2 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
//                   <p className="bg-blue-50 text-blue-700 rounded px-2 py-1">
//                     <strong>Advance Paid:</strong> ₹{task.booking.paymentTotals?.advancePaid || 0}
//                   </p>
//                   <p className="bg-yellow-50 text-yellow-700 rounded px-2 py-1">
//                     <strong>Partial Paid:</strong> ₹{task.booking.paymentTotals?.partialPaid || 0}
//                   </p>
//                   <p className="bg-orange-50 text-orange-700 rounded px-2 py-1">
//                     <strong>Balance Paid:</strong> ₹{task.booking.paymentTotals?.balancePaid || 0}
//                   </p>
//                 </div>
//               </div>

//               {/* Payment History — EVERY advance/partial/balance screenshot
//                   ever uploaded for this booking, oldest first, each with
//                   its own date/time — so partial paid today and partial
//                   paid again tomorrow both show up as separate entries. */}
//               <div>
//                 <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
//                   <History className="w-4 h-4" /> Payment History (
//                   {task.booking.paymentHistory?.length || 0})
//                 </h4>
//                 <div className="space-y-1.5">
//                   {task.booking.paymentHistory?.length > 0 ? (
//                     task.booking.paymentHistory.map((h, i) => {
//                       const label =
//                         h.type === "paymentAdvance"
//                           ? "Advance"
//                           : h.type === "paymentPartial"
//                             ? "Partial"
//                             : "Balance";
//                       const badgeColor =
//                         h.type === "paymentAdvance"
//                           ? "bg-blue-100 text-blue-700"
//                           : h.type === "paymentPartial"
//                             ? "bg-yellow-100 text-yellow-700"
//                             : "bg-orange-100 text-orange-700";
//                       return (
//                         <div
//                           key={i}
//                           className="bg-gray-50 p-2 rounded text-xs flex flex-wrap items-center justify-between gap-2"
//                         >
//                           <div className="flex items-center gap-2">
//                             <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${badgeColor}`}>
//                               {label}
//                             </span>
//                             <span className="font-medium">₹{h.amount || 0}</span>
//                             <span className="text-gray-500">{formatDateTime(h.uploadedAt)}</span>
//                             {!h.taskCleared && h.type !== "paymentAdvance" && (
//                               <span className="text-[10px] text-red-600 font-medium">Pending</span>
//                             )}
//                           </div>
//                           {h.url && (
//                             <a
//                               href={h.url}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="text-blue-600 hover:text-blue-800 font-medium"
//                             >
//                               View screenshot
//                             </a>
//                           )}
//                         </div>
//                       );
//                     })
//                   ) : (
//                     <p className="text-gray-500 italic text-sm">No payment screenshots yet</p>
//                   )}
//                 </div>
//               </div>

//               {/* Receipts */}
//               <div>
//                 <h4 className="font-semibold mb-2 text-sm">Receipts</h4>
//                 <p className="break-words whitespace-normal">
//                   Advance Receipt:{" "}
//                   {task.booking.receipts?.advanceReceiptSent
//                     ? `Sent ${formatDateTime(task.booking.receipts.advanceReceiptSentAt)}`
//                     : "Not Sent"}
//                 </p>
//                 <p className="break-words whitespace-normal">
//                   Balance Receipt:{" "}
//                   {task.booking.receipts?.balanceReceiptSent
//                     ? `Sent ${formatDateTime(task.booking.receipts.balanceReceiptSentAt)}`
//                     : "Not Sent"}
//                 </p>
//               </div>

//               {/* Admin Remarks */}
//               <div>
//                 <h4 className="font-semibold mb-2 text-sm">Admin Remarks</h4>
//                 <div className="space-y-1">
//                   {task.booking.adminRemarks?.length > 0 ? (
//                     task.booking.adminRemarks.map((r, i) => (
//                       <div key={i} className="bg-gray-50 p-2 rounded text-xs">
//                         <p>{r.remark || "—"} (₹{r.amount || 0})</p>
//                         <p>Added at: {formatDateTime(r.addedAt)}</p>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-gray-500 italic">None</p>
//                   )}
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// const Section = ({ title, category, icon: Icon, iconColor, items, onMarkDone, markingId, showMore, toggleShowMore }) => {
//   const visible = showMore ? items : items.slice(0, 5);

//   return (
//     <section className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
//       <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
//         <Icon className="w-6 h-6" />
//         {title}
//         <span className="text-sm font-normal text-gray-500 ml-1">
//           ({items.length})
//         </span>
//       </h2>

//       {items.length === 0 ? (
//         <p className="text-center text-gray-500 py-8 text-lg">
//           No pending actions.
//         </p>
//       ) : (
//         <>
//           <div className="space-y-4">
//             {visible.map((t) => (
//               <TaskCard
//                 key={t.docId || t.tnr}
//                 task={t}
//                 category={category}
//                 Icon={Icon}
//                 iconColor={iconColor}
//                 onMarkDone={onMarkDone}
//                 isMarking={onMarkDone ? markingId === t.docId : false}
//               />
//             ))}
//           </div>

//           {items.length > 5 && (
//             <button
//               onClick={toggleShowMore}
//               className="mt-6 w-full sm:w-auto mx-auto block px-6 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center justify-center gap-2"
//             >
//               {showMore ? "Show Less" : `Show More (${items.length - 5})`}
//             </button>
//           )}
//         </>
//       )}
//     </section>
//   );
// };

// // ─── Props ──────────────────────────────────────────────────────────────
// // isAuthed    — boolean, gates the "please login" state
// // fetchTasks  — async () => { success, advanceTasks, partialTasks, balanceTasks }
// // markTaskDone — async (docId) => { success, message? }
// const PaymentTasksView = ({ isAuthed, fetchTasks, markTaskDone }) => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [tasks, setTasks] = useState({
//     advanceTasks: [],
//     partialTasks: [],
//     balanceTasks: [],
//   });
//   const [markingId, setMarkingId] = useState(null);
//   const [showMore, setShowMore] = useState({});

//   const loadTasks = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const data = await fetchTasks();
//       if (data?.success) {
//         setTasks({
//           advanceTasks: data.advanceTasks || [],
//           partialTasks: data.partialTasks || [],
//           balanceTasks: data.balanceTasks || [],
//         });
//       } else {
//         toast.error(data?.message || "Failed to load payment tasks");
//       }
//     } catch (err) {
//       console.error("PaymentTasksView loadTasks error:", err);
//       toast.error("Failed to load payment tasks");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [fetchTasks]);

//   useEffect(() => {
//     if (!isAuthed) return;
//     loadTasks();
//   }, [isAuthed, loadTasks]);

//   const totalPendingTasks = useMemo(
//     () => tasks.advanceTasks.length + tasks.partialTasks.length + tasks.balanceTasks.length,
//     [tasks],
//   );

//   useEffect(() => {
//     if (!isLoading) {
//       if (totalPendingTasks > 0) {
//         toast.info(`${totalPendingTasks} pending payment tasks`, {
//           toastId: "pending-payment-tasks-count",
//         });
//       } else {
//         toast.success("Payment Tasks loaded Successfully", {
//           toastId: "no-pending-payment-tasks",
//         });
//       }
//     }
//   }, [isLoading, totalPendingTasks]);

//   const handleMarkDone = useCallback(
//     async (docId) => {
//       if (!docId) return;
//       if (!window.confirm("Mark this as Complete?")) return;

//       setMarkingId(docId);
//       try {
//         const res = await markTaskDone(docId);
//         if (res?.success) {
//           toast.success("Marked as Complete!");
//           await loadTasks();
//         } else {
//           toast.error(res?.message || "Failed");
//         }
//       } catch (err) {
//         toast.error("Something went wrong");
//       } finally {
//         setMarkingId(null);
//       }
//     },
//     [markTaskDone, loadTasks],
//   );

//   const toggleShowMore = (category) => {
//     setShowMore((prev) => ({ ...prev, [category]: !prev[category] }));
//   };

//   const metrics = [
//     {
//       label: "Advance Payment Pending",
//       value: tasks.advanceTasks.length,
//       Icon: IndianRupee,
//       color: "text-blue-600",
//       bg: "bg-blue-100",
//     },
//     {
//       label: "Partial Payment Pending",
//       value: tasks.partialTasks.length,
//       Icon: Receipt,
//       color: "text-yellow-600",
//       bg: "bg-yellow-100",
//     },
//     {
//       label: "Balance Payment Pending",
//       value: tasks.balanceTasks.length,
//       Icon: Wallet,
//       color: "text-orange-600",
//       bg: "bg-orange-100",
//     },
//   ];

//   if (!isAuthed) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-lg text-gray-600 bg-gray-50 px-4">
//         Please login to view payment tasks.
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         newestOnTop
//         closeOnClick
//         pauseOnHover
//       />

//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-8 sm:mb-10 leading-tight">
//           Payment Tasks
//         </h1>

//         {isLoading ? (
//           <div className="text-center py-12">
//             <Loader2 className="inline-block animate-spin h-12 w-12 text-blue-600" />
//             <p className="mt-4 text-gray-600 text-lg">Loading payment tasks...</p>
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
//               {metrics.map((m, i) => (
//                 <div
//                   key={i}
//                   className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition text-center"
//                 >
//                   <div
//                     className={`w-12 h-12 ${m.bg} rounded-full flex items-center justify-center mx-auto mb-3`}
//                   >
//                     <m.Icon className={`w-6 h-6 ${m.color}`} />
//                   </div>
//                   <p className="text-2xl font-bold text-gray-900">{m.value}</p>
//                   <p className="text-xs text-gray-500 mt-1">{m.label}</p>
//                 </div>
//               ))}
//             </div>

//             <Section
//               title="Advance Payment Pending"
//               category="advance"
//               icon={IndianRupee}
//               iconColor="text-blue-600"
//               items={tasks.advanceTasks}
//               onMarkDone={null}
//               markingId={markingId}
//               showMore={showMore.advance}
//               toggleShowMore={() => toggleShowMore("advance")}
//             />
//             <Section
//               title="Partial Payment Pending"
//               category="partial"
//               icon={Receipt}
//               iconColor="text-yellow-600"
//               items={tasks.partialTasks}
//               onMarkDone={handleMarkDone}
//               markingId={markingId}
//               showMore={showMore.partial}
//               toggleShowMore={() => toggleShowMore("partial")}
//             />
//             <Section
//               title="Balance Payment Pending"
//               category="balance"
//               icon={Wallet}
//               iconColor="text-orange-600"
//               items={tasks.balanceTasks}
//               onMarkDone={handleMarkDone}
//               markingId={markingId}
//               showMore={showMore.balance}
//               toggleShowMore={() => toggleShowMore("balance")}
//             />
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PaymentTasksView;


/* eslint-disable react-hooks/exhaustive-deps */
// Shared presentational component for the "Payment Tasks" dashboard —
// used by BOTH the Tour Admin side and the Admin side. Each side has its
// own tiny wrapper page (PaymentTasks.jsx / PaymentTasksAdmin.jsx) that
// pulls getPaymentTasks/markPaymentTaskDone from its own Context and
// passes them in here as props — this file never imports a Context
// itself, so the exact same UI/behaviour renders on both logins.
//
// Styled to match the existing Task Dashboard's look (gradient background,
// click-to-expand cards, metric tiles, "Show More" pagination) — this is a
// brand-new, separate page though, never touching TaskDashboard.jsx itself.
// Only 3 headings here instead of 7:
//   1. Advance Payment Pending  — read-only. Clears itself automatically
//      the moment the admin uses the EXISTING "Mark Advance Paid" action
//      on the Tour Bookings page. No button here for this one, on purpose.
//   2. Partial Payment Pending  — has a manual "Mark Done" button.
//   3. Balance Payment Pending  — has a manual "Mark Done" button.
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  IndianRupee,
  Receipt,
  Wallet,
  Loader2,
  Check,
  Copy,
  Clock,
  Users,
  MapPin,
  History,
} from "lucide-react";

const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

const copyToClipboard = (text) => {
  if (!text) {
    toast.error("No TNR to copy");
    return;
  }
  navigator.clipboard.writeText(text).then(
    () => toast.success("TNR copied!"),
    () => toast.error("Failed to copy"),
  );
};

// One task card — click to expand, same shell for all three categories.
// Action button only rendered when onMarkDone is passed; otherwise shows
// readOnlyLabel (different wording for Advance vs a read-only Admin view).
const TaskCard = ({ task, category, Icon, iconColor, onMarkDone, isMarking, readOnlyLabel }) => {
  const [expanded, setExpanded] = useState(false);

  if (!task.tnr) {
    return (
      <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-red-700 text-sm">
        Task missing TNR – cannot display
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-4 cursor-pointer"
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-base break-words whitespace-normal leading-snug">
              {task.tourTitle || "Tour"}
            </p>
            <p className="text-sm text-gray-600 mt-0.5 break-words whitespace-normal">
              <strong>{task.mainName || "Unnamed traveller"}</strong>
            </p>
          </div>
        </div>

        {onMarkDone ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkDone(category === "advance" ? task.tnr : task.docId);
            }}
            disabled={isMarking}
            className={`ml-3 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white rounded-lg transition ${
              isMarking
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isMarking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span className="hidden xs:inline">Mark Done</span>
          </button>
        ) : (
          <span className="ml-3 flex-shrink-0 text-[11px] text-gray-400 italic text-right max-w-[110px]">
            {readOnlyLabel}
          </span>
        )}
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 text-sm text-gray-700">
          {/* TNR */}
          <div className="flex items-center gap-2">
            <strong>TNR:</strong>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono tracking-wider font-bold">
              {task.tnr}
            </code>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(task.tnr);
              }}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
            >
              <Copy className="w-3 h-3" /> Copy
            </button>
          </div>

          {task.amount != null && (
            <p>
              <strong>Amount:</strong> ₹{task.amount}
            </p>
          )}

          <p className="flex items-center gap-1.5 text-gray-600">
            <Clock className="w-3.5 h-3.5" />
            {task.uploadedAt
              ? `Uploaded ${formatDateTime(task.uploadedAt)}`
              : task.bookingDate
              ? `Booked ${formatDateTime(task.bookingDate)}`
              : "—"}
          </p>

          {task.screenshotUrl && (
            <div onClick={(e) => e.stopPropagation()}>
              <p className="font-semibold mb-1.5">Payment Screenshot</p>
              <a
                href={task.screenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-28 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition"
              >
                <img
                  src={task.screenshotUrl}
                  alt="Payment screenshot"
                  className="w-full h-28 object-cover"
                />
              </a>
              <a
                href={task.screenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-1.5 text-blue-600 hover:text-blue-800 text-xs font-medium"
              >
                View full screenshot
              </a>
            </div>
          )}

          {/* Everything that was saved on this booking — same depth as the
              Task Dashboard's card. Only renders once the backend could
              resolve the linked booking (task.booking); older/unlinked
              groups just show the fields above. */}
          {task.booking && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <p><strong>Email:</strong> {task.booking.email || "—"}</p>
                <p><strong>Mobile:</strong> {task.booking.mobile || "—"}</p>
                <p><strong>Booking Type:</strong> {task.booking.bookingType || "—"}</p>
                <p><strong>Booking Date:</strong> {formatDateTime(task.booking.bookingDate)}</p>
              </div>

              {task.booking.creationRemarks && (
                <p className="text-sm break-words whitespace-pre-wrap">
                  <strong>Booking Creation Remarks:</strong> {task.booking.creationRemarks}
                </p>
              )}

              {/* Travellers */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" /> Travellers ({task.booking.travellers?.length || 0})
                </h4>
                <div className="space-y-3">
                  {task.booking.travellers?.length ? (
                    task.booking.travellers.map((t, i) => (
                      <div
                        key={i}
                        className={`bg-gray-50 p-3 rounded-lg space-y-1 text-xs ${
                          t.cancelled?.byTraveller || t.cancelled?.byAdmin
                            ? "border-l-4 border-red-400"
                            : ""
                        }`}
                      >
                        <p className="font-medium break-words whitespace-normal leading-snug">
                          {t.title} {t.firstName} {t.lastName} ({t.age} yrs, {t.gender || "—"})
                        </p>
                        <p className="break-words whitespace-normal">
                          Sharing Type: {t.sharingType || "—"}
                        </p>
                        <p className="break-words whitespace-normal">
                          Package Type: {t.packageType || "—"}
                          {t.variantPackageIndex != null ? ` (Variant ${t.variantPackageIndex})` : ""}
                        </p>
                        {(() => {
                          // NEW bookings: t.selectedAddons is an array, each
                          // entry EITHER train-wise (trainNo/trainName) OR
                          // flight-wise (flightNo/airline). OLD bookings:
                          // t.selectedAddon is a flat single object — kept
                          // working exactly as before.
                          if (Array.isArray(t.selectedAddons) && t.selectedAddons.length > 0) {
                            const getTripTypeStyle = (tripType) => {
                              const tt = (tripType || "").toUpperCase();
                              if (tt.startsWith("BOARD"))
                                return { badge: "bg-blue-100 text-blue-700", label: "Boarding" };
                              if (tt.startsWith("MIDDLE"))
                                return { badge: "bg-purple-100 text-purple-700", label: "Middle" };
                              if (tt.startsWith("DEBOARD") || tt.startsWith("DEBOARF"))
                                return { badge: "bg-orange-100 text-orange-700", label: "Deboarding" };
                              return { badge: "bg-gray-100 text-gray-700", label: tripType || "Trip" };
                            };

                            const isFlightAddon = (a) => {
                              if (a.flightNo || a.airline) return true;
                              if (a.trainNo || a.trainName) return false;
                              return (
                                (a.flightIndex !== undefined && a.flightIndex !== null) ||
                                a.tripKind === "flight"
                              );
                            };

                            const buildLabel = (a, isFlight) => {
                              const primary = isFlight ? a.airline : a.trainName;
                              const secondary = isFlight ? a.flightNo : a.trainNo;
                              if (!primary && !secondary) return null;
                              if (primary && secondary) return `${primary} (${secondary})`;
                              return primary || secondary;
                            };

                            const trainEntries = t.selectedAddons.filter((a) => !isFlightAddon(a));
                            const flightEntries = t.selectedAddons.filter((a) => isFlightAddon(a));

                            const renderRow = (a, idx, isFlight) => {
                              const style = getTripTypeStyle(a.tripType);
                              const label = buildLabel(a, isFlight);
                              return (
                                <div key={idx} className="flex flex-wrap items-center gap-1.5 mt-1">
                                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${style.badge}`}>
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
                              <>
                                {trainEntries.length > 0 && (
                                  <div className="mt-1.5">
                                    <p className="font-semibold text-red-600 text-[11px]">
                                      🚆 Train Addons
                                    </p>
                                    {trainEntries.map((a, idx) => renderRow(a, idx, false))}
                                  </div>
                                )}
                                {flightEntries.length > 0 && (
                                  <div className="mt-1.5">
                                    <p className="font-semibold text-orange-900 text-[11px]">
                                      ✈️ Flight Addons
                                    </p>
                                    {flightEntries.map((a, idx) => renderRow(a, idx, true))}
                                  </div>
                                )}
                              </>
                            );
                          }

                          // OLD flat addon (unchanged)
                          return (
                            t.selectedAddon && (
                              <p className="break-words whitespace-normal">
                                Addon: {t.selectedAddon.name || "—"} ({t.selectedAddon.price || 0})
                              </p>
                            )
                          );
                        })()}
                        {t.boardingPoint && (
                          <p className="break-words whitespace-normal">
                            Boarding Point: {t.boardingPoint.stationName || "—"} (
                            {t.boardingPoint.stationCode || "—"})
                          </p>
                        )}
                        {t.deboardingPoint && (
                          <p className="break-words whitespace-normal">
                            Deboarding Point: {t.deboardingPoint.stationName || "—"}{" "}
                            ({t.deboardingPoint.stationCode || "—"})
                          </p>
                        )}
                        {t.trainSeats?.length > 0 && (
                          <p className="break-words whitespace-normal">
                            Train Seats:{" "}
                            {t.trainSeats
                              .map((s) => `${s.trainName || "—"}: ${s.seatNo || "—"}`)
                              .join(", ")}
                          </p>
                        )}
                        {t.flightSeats?.length > 0 && (
                          <p className="break-words whitespace-normal">
                            Flight Seats:{" "}
                            {t.flightSeats
                              .map((s) => `${s.flightName || "—"}: ${s.seatNo || "—"}`)
                              .join(", ")}
                          </p>
                        )}
                        <p className="break-words whitespace-pre-wrap">
                          Staff Remarks: {t.staffRemarks || "—"}
                        </p>
                        <p className="break-words whitespace-pre-wrap">
                          Remarks: {t.remarks || "—"}
                        </p>
                        {(t.cancelled?.byTraveller || t.cancelled?.byAdmin) && (
                          <p className="text-red-600 text-xs">
                            Cancelled by {t.cancelled.byAdmin ? "Admin" : "Traveller"} at{" "}
                            {formatDateTime(t.cancelled.cancelledAt)}
                            {t.cancelled.reason ? ` (Reason: ${t.cancelled.reason})` : ""}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic text-sm">No travellers</p>
                  )}
                </div>
              </div>

              {/* Billing Address */}
              <div>
                <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Billing Address
                </h4>
                <p className="break-words whitespace-normal">
                  {task.booking.billingAddress?.addressLine1 || "—"}{" "}
                  {task.booking.billingAddress?.addressLine2 || ""}
                </p>
                <p className="break-words whitespace-normal">
                  {task.booking.billingAddress?.city || "—"}, {task.booking.billingAddress?.state || "—"} -{" "}
                  {task.booking.billingAddress?.pincode || "—"}, {task.booking.billingAddress?.country || "India"}
                </p>
              </div>

              {/* Payment Details */}
              <div>
                <h4 className="font-semibold mb-2 text-sm">Payment Details</h4>
                <p className="break-words whitespace-normal">
                  Advance: ₹{task.booking.payment?.advance?.amount || 0} —{" "}
                  {task.booking.payment?.advance?.paid
                    ? `Paid ${formatDateTime(task.booking.payment.advance.paidAt)}`
                    : "Pending"}
                  {task.booking.payment?.advance?.paymentVerified && " (Verified)"}
                </p>
                <p className="break-words whitespace-normal">
                  Balance: ₹{task.booking.payment?.balance?.amount || 0} —{" "}
                  {task.booking.payment?.balance?.paid
                    ? `Paid ${formatDateTime(task.booking.payment.balance.paidAt)}`
                    : "Pending"}
                  {task.booking.payment?.balance?.paymentVerified && " (Verified)"}
                </p>
                <div className="mt-2 pt-2 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <p className="bg-blue-50 text-blue-700 rounded px-2 py-1">
                    <strong>Advance Paid:</strong> ₹{task.booking.paymentTotals?.advancePaid || 0}
                  </p>
                  <p className="bg-yellow-50 text-yellow-700 rounded px-2 py-1">
                    <strong>Partial Paid:</strong> ₹{task.booking.paymentTotals?.partialPaid || 0}
                  </p>
                  <p className="bg-orange-50 text-orange-700 rounded px-2 py-1">
                    <strong>Balance Paid:</strong> ₹{task.booking.paymentTotals?.balancePaid || 0}
                  </p>
                </div>
              </div>

              {/* Payment History — EVERY advance/partial/balance screenshot
                  ever uploaded for this booking, oldest first, each with
                  its own date/time — so partial paid today and partial
                  paid again tomorrow both show up as separate entries. */}
              <div>
                <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                  <History className="w-4 h-4" /> Payment History (
                  {task.booking.paymentHistory?.length || 0})
                </h4>
                <div className="space-y-1.5">
                  {task.booking.paymentHistory?.length > 0 ? (
                    task.booking.paymentHistory.map((h, i) => {
                      const label =
                        h.type === "paymentAdvance"
                          ? "Advance"
                          : h.type === "paymentPartial"
                            ? "Partial"
                            : "Balance";
                      const badgeColor =
                        h.type === "paymentAdvance"
                          ? "bg-blue-100 text-blue-700"
                          : h.type === "paymentPartial"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-orange-100 text-orange-700";
                      return (
                        <div
                          key={i}
                          className="bg-gray-50 p-2 rounded text-xs flex flex-wrap items-center justify-between gap-2"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${badgeColor}`}>
                              {label}
                            </span>
                            <span className="font-medium">₹{h.amount || 0}</span>
                            <span className="text-gray-500">{formatDateTime(h.uploadedAt)}</span>
                            {!h.taskCleared && h.type !== "paymentAdvance" && (
                              <span className="text-[10px] text-red-600 font-medium">Pending</span>
                            )}
                          </div>
                          {h.url && (
                            <a
                              href={h.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View screenshot
                            </a>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 italic text-sm">No payment screenshots yet</p>
                  )}
                </div>
              </div>

            </>
          )}
        </div>
      )}
    </div>
  );
};

const Section = ({ title, category, icon: Icon, iconColor, items, onMarkDone, markingId, showMore, toggleShowMore, readOnlyLabel }) => {
  const visible = showMore ? items : items.slice(0, 5);

  return (
    <section className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
        <Icon className="w-6 h-6" />
        {title}
        <span className="text-sm font-normal text-gray-500 ml-1">
          ({items.length})
        </span>
      </h2>

      {items.length === 0 ? (
        <p className="text-center text-gray-500 py-8 text-lg">
          No pending actions.
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {visible.map((t) => (
              <TaskCard
                key={t.docId || t.tnr}
                task={t}
                category={category}
                Icon={Icon}
                iconColor={iconColor}
                onMarkDone={onMarkDone}
                isMarking={
                  onMarkDone
                    ? markingId === (category === "advance" ? t.tnr : t.docId)
                    : false
                }
                readOnlyLabel={readOnlyLabel}
              />
            ))}
          </div>

          {items.length > 5 && (
            <button
              onClick={toggleShowMore}
              className="mt-6 w-full sm:w-auto mx-auto block px-6 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center justify-center gap-2"
            >
              {showMore ? "Show Less" : `Show More (${items.length - 5})`}
            </button>
          )}
        </>
      )}
    </section>
  );
};

// ─── Props ──────────────────────────────────────────────────────────────
// isAuthed    — boolean, gates the "please login" state
// fetchTasks  — async () => { success, advanceTasks, partialTasks, balanceTasks }
// markTaskDone — async (docId) => { success, message? } — Partial/Balance only
// markAdvanceDone — async (tnr) => { success, message? } — unused now that
//   Advance is read-only again; kept as a prop so either wrapper page can
//   still pass it in without breaking, but PaymentTasksView never calls it.
// canMarkDone — default true. Pass false (Admin side) to make Partial/
//   Balance READ-ONLY too, same as Advance — no "Mark Done" button at all;
//   it only clears once the Tour Admin side marks it done (same shared
//   backend data, so it disappears here automatically once that happens).
const PaymentTasksView = ({ isAuthed, fetchTasks, markTaskDone, markAdvanceDone, canMarkDone = true }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState({
    advanceTasks: [],
    partialTasks: [],
    balanceTasks: [],
  });
  const [markingId, setMarkingId] = useState(null);
  const [showMore, setShowMore] = useState({});

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchTasks();
      if (data?.success) {
        setTasks({
          advanceTasks: data.advanceTasks || [],
          partialTasks: data.partialTasks || [],
          balanceTasks: data.balanceTasks || [],
        });
      } else {
        toast.error(data?.message || "Failed to load payment tasks");
      }
    } catch (err) {
      console.error("PaymentTasksView loadTasks error:", err);
      toast.error("Failed to load payment tasks");
    } finally {
      setIsLoading(false);
    }
  }, [fetchTasks]);

  useEffect(() => {
    if (!isAuthed) return;
    loadTasks();
  }, [isAuthed, loadTasks]);

  const totalPendingTasks = useMemo(
    () => tasks.advanceTasks.length + tasks.partialTasks.length + tasks.balanceTasks.length,
    [tasks],
  );

  useEffect(() => {
    if (!isLoading) {
      if (totalPendingTasks > 0) {
        toast.info(`${totalPendingTasks} pending payment tasks`, {
          toastId: "pending-payment-tasks-count",
        });
      } else {
        toast.success("Payment Tasks loaded Successfully", {
          toastId: "no-pending-payment-tasks",
        });
      }
    }
  }, [isLoading, totalPendingTasks]);

  const handleMarkDone = useCallback(
    async (docId) => {
      if (!docId) return;
      if (!window.confirm("Mark this as Complete?")) return;

      setMarkingId(docId);
      try {
        const res = await markTaskDone(docId);
        if (res?.success) {
          toast.success("Marked as Complete!");
          await loadTasks();
        } else {
          toast.error(res?.message || "Failed");
        }
      } catch (err) {
        toast.error("Something went wrong");
      } finally {
        setMarkingId(null);
      }
    },
    [markTaskDone, loadTasks],
  );

  // Advance's own "done" tick — keyed by tnr (Advance tasks have no docId;
  // they come straight off tourBookingModel, not an aadhaarModel doc).
  // Deliberately separate from handleMarkDone above and from
  // payment.advance.paid — purely a to-do checkbox for this list.
  const handleMarkAdvanceDone = useCallback(
    async (tnr) => {
      if (!tnr) return;
      if (
        !window.confirm(
          "Mark this Advance task as done on this dashboard?\n\nNote: this only hides it from Payment Tasks — it does NOT mark the advance as actually paid. Use 'Mark Advance Paid' on the Tour Bookings page for that.",
        )
      )
        return;

      setMarkingId(tnr);
      try {
        const res = await markAdvanceDone(tnr);
        if (res?.success) {
          toast.success("Marked as Complete!");
          await loadTasks();
        } else {
          toast.error(res?.message || "Failed");
        }
      } catch (err) {
        toast.error("Something went wrong");
      } finally {
        setMarkingId(null);
      }
    },
    [markAdvanceDone, loadTasks],
  );

  const toggleShowMore = (category) => {
    setShowMore((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const metrics = [
    {
      label: "Advance Payment Pending",
      value: tasks.advanceTasks.length,
      Icon: IndianRupee,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Partial Payment Pending",
      value: tasks.partialTasks.length,
      Icon: Receipt,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      label: "Balance Payment Pending",
      value: tasks.balanceTasks.length,
      Icon: Wallet,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-600 bg-gray-50 px-4">
        Please login to view payment tasks.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
      />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-8 sm:mb-10 leading-tight">
          Payment Tasks
        </h1>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="inline-block animate-spin h-12 w-12 text-blue-600" />
            <p className="mt-4 text-gray-600 text-lg">Loading payment tasks...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {metrics.map((m, i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition text-center"
                >
                  <div
                    className={`w-12 h-12 ${m.bg} rounded-full flex items-center justify-center mx-auto mb-3`}
                  >
                    <m.Icon className={`w-6 h-6 ${m.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{m.label}</p>
                </div>
              ))}
            </div>

            <Section
              title="Advance Payment Pending"
              category="advance"
              icon={IndianRupee}
              iconColor="text-blue-600"
              items={tasks.advanceTasks}
              onMarkDone={null}
              markingId={markingId}
              showMore={showMore.advance}
              toggleShowMore={() => toggleShowMore("advance")}
              readOnlyLabel="Auto-clears via Tour Bookings"
            />
            <Section
              title="Partial Payment Pending"
              category="partial"
              icon={Receipt}
              iconColor="text-yellow-600"
              items={tasks.partialTasks}
              onMarkDone={canMarkDone ? handleMarkDone : null}
              markingId={markingId}
              showMore={showMore.partial}
              toggleShowMore={() => toggleShowMore("partial")}
              readOnlyLabel="Clears when marked on Tour Admin side"
            />
            <Section
              title="Balance Payment Pending"
              category="balance"
              icon={Wallet}
              iconColor="text-orange-600"
              items={tasks.balanceTasks}
              onMarkDone={canMarkDone ? handleMarkDone : null}
              markingId={markingId}
              showMore={showMore.balance}
              toggleShowMore={() => toggleShowMore("balance")}
              readOnlyLabel="Clears when marked on Tour Admin side"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentTasksView;
