// // /* eslint-disable no-unused-vars */
// // import React, { useState, useEffect, useContext, useCallback } from "react";
// // import { useLocation } from "react-router-dom";
// // import { TourContext } from "../../context/TourContext";
// // import { ChevronDown, ChevronUp, CheckCircle, Copy } from "lucide-react";
// // import { toast, ToastContainer } from "react-toastify";
// // import "react-toastify/dist/ReactToastify.css";

// // const TourBookings = () => {
// //   const {
// //     tourList,
// //     getTourList,
// //     bookings,
// //     getBookings,
// //     markAdvancePaid,
// //     markBalancePaid,
// //     completeBooking,
// //     ttoken,
// //   } = useContext(TourContext);

// //   const [expanded, setExpanded] = useState(null);
// //   const [selectedTourId, setSelectedTourId] = useState("");
// //   const [isLoadingBookings, setIsLoadingBookings] = useState(false);
// //   const [paymentFilter, setPaymentFilter] = useState("all");
// //   const [statusFilter, setStatusFilter] = useState("all");
// //   const [travellerNameFilter, setTravellerNameFilter] = useState("");
// //   const [tnrFilter, setTnrFilter] = useState("");
// //   const [showConfirmLeave, setShowConfirmLeave] = useState(false);

// //   const shouldProtect = Boolean(
// //     selectedTourId && !isLoadingBookings && bookings && bookings.length > 0,
// //   );

// //   const location = useLocation();

// //   useEffect(() => {
// //     if (!shouldProtect) return;

// //     const handleBeforeUnload = (e) => {
// //       e.preventDefault();
// //       e.returnValue = "";
// //     };

// //     window.addEventListener("beforeunload", handleBeforeUnload);

// //     return () => {
// //       window.removeEventListener("beforeunload", handleBeforeUnload);
// //     };
// //   }, [shouldProtect]);

// //   useEffect(() => {
// //     if (!shouldProtect) return;

// //     window.history.pushState(null, null, window.location.href);

// //     const handlePopState = () => {
// //       setShowConfirmLeave(true);
// //     };

// //     window.addEventListener("popstate", handlePopState);

// //     return () => {
// //       window.removeEventListener("popstate", handlePopState);
// //     };
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
// //     if (ttoken) {
// //       getTourList();
// //     }
// //   }, [ttoken, getTourList]);

// //   useEffect(() => {
// //     if (ttoken && selectedTourId) {
// //       setIsLoadingBookings(true);
// //       getBookings(selectedTourId)
// //         .then((response) => {
// //           if (
// //             response &&
// //             typeof response === "object" &&
// //             "success" in response
// //           ) {
// //             if (response.success) {
// //               toast.success("Bookings fetched successfully");
// //             } else {
// //               toast.error(response.message || "Failed to fetch bookings");
// //             }
// //           } else {
// //             toast.error("Invalid response from server");
// //           }
// //         })
// //         .catch((error) => {
// //           console.error("getBookings error:", error);
// //           toast.error(
// //             error.response?.data?.message ||
// //               error.message ||
// //               "Failed to fetch bookings",
// //           );
// //         })
// //         .finally(() => {
// //           setIsLoadingBookings(false);
// //         });
// //     } else {
// //       setIsLoadingBookings(false);
// //     }
// //   }, [ttoken, selectedTourId, getBookings]);

// //   useEffect(() => {
// //     return () => {
// //       toast.dismiss();
// //     };
// //   }, [location]);

// //   const toggleExpand = (id) => {
// //     setExpanded(expanded === id ? null : id);
// //   };

// //   const handleTourChange = (e) => {
// //     setSelectedTourId(e.target.value);
// //     setPaymentFilter("all");
// //     setStatusFilter("all");
// //     setTravellerNameFilter("");
// //     setTnrFilter("");
// //   };

// //   const handleApiResponse = useCallback(
// //     (response, successMessage) => {
// //       console.log("API Response:", response);
// //       if (response && typeof response === "object" && "success" in response) {
// //         if (response.success) {
// //           toast.success(successMessage || "Operation completed successfully");
// //           if (selectedTourId) {
// //             getBookings(selectedTourId);
// //           }
// //         } else {
// //           toast.error(response.message || "An error occurred");
// //         }
// //       } else {
// //         toast.error("Invalid response from server");
// //       }
// //     },
// //     [selectedTourId, getBookings],
// //   );

// //   const handleMarkAdvancePaid = async (tnr, tourId) => {
// //     if (!tnr) {
// //       toast.error("Cannot mark advance – TNR is missing");
// //       return;
// //     }

// //     if (!window.confirm("Are you sure you want to mark Advance as PAID?"))
// //       return;

// //     try {
// //       const response = await markAdvancePaid(tnr, tourId);
// //       handleApiResponse(response, "Advance payment marked successfully");
// //     } catch (error) {
// //       console.error("markAdvancePaid error:", error);
// //       toast.error(
// //         "Failed to mark advance: " + (error.message || "Unknown error"),
// //       );
// //     }
// //   };

// //   const handleMarkBalancePaid = async (tnr, tourId) => {
// //     if (!tourId) {
// //       toast.error("Please select a tour first.");
// //       return;
// //     }
// //     if (!tnr) {
// //       toast.error("Cannot mark balance – TNR is missing");
// //       return;
// //     }

// //     if (!window.confirm("Are you sure you want to mark Balance as PAID?"))
// //       return;

// //     try {
// //       const response = await markBalancePaid(tnr, tourId);
// //       handleApiResponse(response, "Balance payment marked successfully");
// //     } catch (error) {
// //       console.error("markBalancePaid error:", error);
// //       toast.error(
// //         "Failed to mark balance: " + (error.message || "Unknown error"),
// //       );
// //     }
// //   };

// //   const handleCompleteBooking = async (tnr, tourId) => {
// //     if (!tnr) {
// //       toast.error("Cannot complete booking – TNR is missing");
// //       return;
// //     }

// //     if (
// //       !window.confirm(
// //         "Mark this booking as completed? This action cannot be undone easily.",
// //       )
// //     ) {
// //       return;
// //     }

// //     try {
// //       const response = await completeBooking(tnr, tourId);
// //       handleApiResponse(response, "Booking completed successfully");
// //     } catch (error) {
// //       console.error("completeBooking error:", error);
// //       toast.error("Failed to complete: " + (error.message || "Unknown error"));
// //     }
// //   };

// //   const handleCopyTNR = (text) => {
// //     if (!text) {
// //       toast.error("Nothing to copy");
// //       return;
// //     }
// //     navigator.clipboard
// //       .writeText(text)
// //       .then(() => toast.success("Copied!"))
// //       .catch(() => toast.error("Failed to copy"));
// //   };

// //   // === HELPER FUNCTIONS ===
// //   const areAllTravellersCancelled = (booking) =>
// //     booking.travellers.length > 0 &&
// //     booking.travellers.every(
// //       (t) => t.cancelled?.byTraveller && t.cancelled?.byAdmin,
// //     );

// //   const areAllTravellersRejected = (booking) =>
// //     booking.travellers.length > 0 &&
// //     booking.travellers.every(
// //       (t) => t.cancelled?.byAdmin && !t.cancelled?.byTraveller,
// //     );

// //   const hasCancellationRequest = (booking) =>
// //     booking.travellers.some(
// //       (t) => t.cancelled?.byTraveller && !t.cancelled?.byAdmin,
// //     ) && !areAllTravellersCancelled(booking);

// //   const hasActiveTraveller = (booking) =>
// //     booking.travellers.some(
// //       (t) => !(t.cancelled?.byTraveller || t.cancelled?.byAdmin),
// //     );

// //   // === FILTER BOOKINGS ===
// //   const filteredBookings = bookings.filter((booking) => {
// //     const firstTraveller = booking.travellers[0] || {};
// //     const displayName =
// //       `${firstTraveller.firstName || ""} ${firstTraveller.lastName || ""}`.trim();

// //     let paymentMatch = true;
// //     if (paymentFilter !== "all") {
// //       if (paymentFilter === "advancePaid" && !booking.payment.advance.paid)
// //         paymentMatch = false;
// //       else if (
// //         paymentFilter === "advancePending" &&
// //         booking.payment.advance.paid
// //       )
// //         paymentMatch = false;
// //       else if (paymentFilter === "balancePaid" && !booking.payment.balance.paid)
// //         paymentMatch = false;
// //       else if (
// //         paymentFilter === "balancePending" &&
// //         booking.payment.balance.paid
// //       )
// //         paymentMatch = false;
// //     }

// //     let statusMatch = true;
// //     if (statusFilter !== "all") {
// //       const allCancelled = areAllTravellersCancelled(booking);
// //       const allRejected = areAllTravellersRejected(booking);
// //       const hasActive = hasActiveTraveller(booking);

// //       if (statusFilter === "active")
// //         statusMatch = !booking.isBookingCompleted && hasActive;
// //       else if (statusFilter === "completed")
// //         statusMatch = booking.isBookingCompleted && hasActive;
// //       else if (statusFilter === "rejected") statusMatch = allRejected;
// //       else if (statusFilter === "cancelled") statusMatch = allCancelled;
// //     }

// //     let nameMatch = true;
// //     if (travellerNameFilter) {
// //       nameMatch = displayName
// //         .toLowerCase()
// //         .includes(travellerNameFilter.toLowerCase());
// //     }

// //     let tnrMatch = true;
// //     if (tnrFilter.trim()) {
// //       const searchTnr = tnrFilter.trim().toUpperCase();
// //       tnrMatch = booking.tnr?.toUpperCase().includes(searchTnr);
// //     }

// //     return paymentMatch && statusMatch && nameMatch && tnrMatch;
// //   });

// //   // === CATEGORIZE BOOKINGS ===
// //   const activeBookings = filteredBookings
// //     .filter((b) => !b.isBookingCompleted && hasActiveTraveller(b))
// //     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

// //   const completedBookings = filteredBookings
// //     .filter((b) => b.isBookingCompleted && hasActiveTraveller(b))
// //     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

// //   const cancellationRequestBookings = filteredBookings
// //     .filter(hasCancellationRequest)
// //     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

// //   const rejectedByAdminBookings = filteredBookings
// //     .filter(areAllTravellersRejected)
// //     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

// //   const cancelledByTravellerBookings = filteredBookings
// //     .filter(areAllTravellersCancelled)
// //     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

// //   // === RENDER CARD ===
// //   const renderBookingCard = (booking, category) => {
// //     const isExpanded = expanded === booking._id;
// //     const firstTraveller = booking.travellers[0] || {};
// //     const displayName =
// //       `${firstTraveller.firstName || ""} ${firstTraveller.lastName || ""}`.trim() ||
// //       "Unknown Traveller";

// //     const showPartialCancellation = hasCancellationRequest(booking);
// //     const isFullyCancelled = areAllTravellersCancelled(booking);
// //     const isFullyRejected = areAllTravellersRejected(booking);

// //     const displayRef = booking.tnr || `...${booking._id?.slice(-8) || ""}`;

// //     return (
// //       <div
// //         key={booking._id}
// //         className="bg-white rounded-2xl shadow border overflow-hidden w-full sm:max-w-4xl mx-auto"
// //       >
// //         <div
// //           className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 cursor-pointer hover:bg-gray-50"
// //           onClick={() => toggleExpand(booking._id)}
// //         >
// //           <div className="w-full sm:w-auto">
// //             <p className="font-semibold text-base sm:text-lg">
// //               <strong>{displayName}</strong>
// //             </p>
// //             <p className="text-xs sm:text-sm text-gray-600 truncate">
// //               {booking.userId?.email || "No email"} |{" "}
// //               {booking.contact?.mobile || "No phone"}
// //             </p>

// //             <div className="mt-2 flex flex-wrap gap-2 text-xs sm:text-sm">
// //               <span
// //                 className={`px-2 py-1 rounded-lg text-xs font-medium ${
// //                   booking.payment.advance.paid
// //                     ? "bg-green-100 text-green-700"
// //                     : "bg-red-100 text-red-600"
// //                 }`}
// //               >
// //                 Advance: {booking.payment.advance.paid ? "Paid" : "Pending"}
// //               </span>
// //               <span
// //                 className={`px-2 py-1 rounded-lg text-xs font-medium ${
// //                   booking.payment.balance.paid
// //                     ? "bg-green-100 text-green-700"
// //                     : "bg-red-100 text-red-600"
// //                 }`}
// //               >
// //                 Balance: {booking.payment.balance.paid ? "Paid" : "Pending"}
// //               </span>

// //               {/* T&C Agreed Label */}
// //               {booking.termsAgreed && (
// //                 <span className="px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700">
// //                   T&C form submitted
// //                 </span>
// //               )}

// //               {/* Emergency Contact Badge */}
// //               {booking.emergencyContact && (
// //                 <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
// //                   Emergency: {booking.emergencyContact}
// //                 </span>
// //               )}
// //             </div>

// //             {category === "completed" && (
// //               <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 mt-2 inline-block">
// //                 Completed
// //               </span>
// //             )}
// //             {showPartialCancellation && (
// //               <span className="px-2 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-700 mt-2 inline-block">
// //                 Partial Cancellation Request
// //               </span>
// //             )}
// //             {isFullyRejected && (
// //               <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 mt-2 inline-block">
// //                 Rejected by Admin
// //               </span>
// //             )}
// //             {isFullyCancelled && (
// //               <span className="px-2 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700 mt-2 inline-block">
// //                 Fully Cancelled
// //               </span>
// //             )}

// //             <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm">
// //               <span className="text-gray-700 font-medium">
// //                 TNR:{" "}
// //                 <span className="font-bold tracking-wide">{displayRef}</span>
// //               </span>
// //               <button
// //                 onClick={(e) => {
// //                   e.stopPropagation();
// //                   handleCopyTNR(booking.tnr || booking._id);
// //                 }}
// //                 className="text-blue-600 hover:text-blue-800 transition-colors"
// //                 title="Copy TNR"
// //               >
// //                 <Copy size={16} />
// //               </button>
// //               <span className="text-gray-500">| {booking.bookingType}</span>
// //             </div>
// //           </div>

// //           <div className="flex items-center gap-2 mt-3 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
// //             {isFullyCancelled || isFullyRejected ? (
// //               <button
// //                 disabled
// //                 className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-gray-400 text-white rounded-lg cursor-not-allowed min-w-[120px] sm:min-w-[140px]"
// //               >
// //                 <CheckCircle size={16} />
// //                 Cancelled
// //               </button>
// //             ) : booking.isBookingCompleted ? (
// //               <button
// //                 disabled
// //                 className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-green-400 text-white rounded-lg cursor-not-allowed min-w-[120px] sm:min-w-[140px]"
// //               >
// //                 <CheckCircle size={16} />
// //                 Completed
// //               </button>
// //             ) : (
// //               <>
// //                 {booking.bookingType === "offline" && (
// //                   <>
// //                     {!booking.payment.advance.paid && (
// //                       <button
// //                         onClick={(e) => {
// //                           e.stopPropagation();
// //                           handleMarkAdvancePaid(booking.tnr, selectedTourId);
// //                         }}
// //                         className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 min-w-[120px] sm:min-w-[140px]"
// //                       >
// //                         <CheckCircle size={16} />
// //                         Mark Advance
// //                       </button>
// //                     )}
// //                     {booking.payment.advance.paid &&
// //                       !booking.payment.balance.paid && (
// //                         <button
// //                           onClick={(e) => {
// //                             e.stopPropagation();
// //                             handleMarkBalancePaid(booking.tnr, selectedTourId);
// //                           }}
// //                           className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 min-w-[120px] sm:min-w-[140px]"
// //                         >
// //                           <CheckCircle size={16} />
// //                           Mark Balance
// //                         </button>
// //                       )}
// //                   </>
// //                 )}
// //                 <button
// //                   onClick={(e) => {
// //                     e.stopPropagation();
// //                     handleCompleteBooking(booking.tnr, selectedTourId);
// //                   }}
// //                   className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 min-w-[120px] sm:min-w-[140px]"
// //                 >
// //                   <CheckCircle size={16} />
// //                   Mark Complete
// //                 </button>
// //               </>
// //             )}
// //             {isExpanded ? (
// //               <ChevronUp className="text-gray-500 w-5 h-5" />
// //             ) : (
// //               <ChevronDown className="text-gray-500 w-5 h-5" />
// //             )}
// //           </div>
// //         </div>

// //         {isExpanded && (
// //           <div className="p-4 border-t bg-gray-50 text-xs sm:text-sm text-gray-700 space-y-4">
// //             <div>
// //               <p>
// //                 <strong>TNR / Reference:</strong>{" "}
// //                 <span className="font-mono font-bold">
// //                   {booking.tnr || "Not generated"}
// //                 </span>
// //               </p>
// //               <p>
// //                 <strong>Tour:</strong> {booking?.tourData?.title}
// //               </p>
// //               <p>
// //                 <strong>Date:</strong>{" "}
// //                 {new Date(booking.bookingDate).toLocaleDateString()}
// //               </p>
// //               <p>
// //                 <strong>Type:</strong> {booking.bookingType}
// //               </p>
// //             </div>

// //             <div>
// //               <h3 className="font-semibold text-gray-800">Contact</h3>
// //               <p>Email: {booking.contact?.email || "—"}</p>
// //               <p>Mobile: {booking.contact?.mobile || "—"}</p>

// //               {booking.emergencyContact && (
// //                 <p className="mt-1 text-blue-700 font-medium">
// //                   Emergency Contact: {booking.emergencyContact}
// //                 </p>
// //               )}

// //               <p className="mt-2">
// //                 <strong>T&C Agreed:</strong>{" "}
// //                 <span
// //                   className={
// //                     booking.termsAgreed
// //                       ? "text-green-600 font-medium"
// //                       : "text-red-600"
// //                   }
// //                 >
// //                   {booking.termsAgreed ? "Yes" : "No"}
// //                   {booking.termsAgreed && booking.termsAgreedAt && (
// //                     <>
// //                       {" "}
// //                       (on {new Date(booking.termsAgreedAt).toLocaleDateString()}
// //                       )
// //                     </>
// //                   )}
// //                 </span>
// //               </p>
// //             </div>

// //             {booking.billingAddress && (
// //               <div>
// //                 <h3 className="font-semibold text-gray-800">Billing Address</h3>
// //                 <p>{booking.billingAddress.addressLine1}</p>
// //                 {booking.billingAddress.addressLine2 && (
// //                   <p>{booking.billingAddress.addressLine2}</p>
// //                 )}
// //                 <p>
// //                   {booking.billingAddress.city}, {booking.billingAddress.state}{" "}
// //                   - {booking.billingAddress.pincode}
// //                 </p>
// //                 <p>{booking.billingAddress.country}</p>
// //               </div>
// //             )}

// //             {/* Admin Remarks */}
// //             <div className="bg-white p-4 rounded-lg border shadow-sm">
// //               <h3 className="font-semibold text-gray-800 mb-3">
// //                 Admin Remarks
// //               </h3>
// //               {booking.adminRemarks?.length > 0 ? (
// //                 <div className="space-y-3">
// //                   {booking.adminRemarks.map((remark, idx) => {
// //                     const amount = remark.amount || 0;
// //                     const isNegative = amount < 0;
// //                     const displayAmount =
// //                       amount !== 0 ? `₹${Math.abs(amount)}` : "—";

// //                     return (
// //                       <div
// //                         key={idx}
// //                         className={`p-3 rounded border ${
// //                           isNegative
// //                             ? "bg-red-50 border-red-200"
// //                             : amount > 0
// //                               ? "bg-green-50 border-green-200"
// //                               : "bg-gray-50 border-gray-200"
// //                         }`}
// //                       >
// //                         <p className="text-sm">{remark.remark}</p>

// //                         <div className="flex items-center gap-2 mt-1">
// //                           <span
// //                             className={`text-xs font-medium px-2 py-0.5 rounded-full ${
// //                               isNegative
// //                                 ? "bg-red-100 text-red-700"
// //                                 : amount > 0
// //                                   ? "bg-green-100 text-green-700"
// //                                   : "bg-gray-100 text-gray-600"
// //                             }`}
// //                           >
// //                             {isNegative
// //                               ? "Refund/Adjustment"
// //                               : amount > 0
// //                                 ? "Additional"
// //                                 : "No Amount"}
// //                           </span>

// //                           <span
// //                             className={`text-sm font-medium ${
// //                               isNegative
// //                                 ? "text-red-600"
// //                                 : amount > 0
// //                                   ? "text-green-600"
// //                                   : "text-gray-600"
// //                             }`}
// //                           >
// //                             {amount !== 0 ? (isNegative ? "-" : "+") : ""}
// //                             {displayAmount}
// //                           </span>
// //                         </div>

// //                         <p className="text-xs text-gray-500 mt-1">
// //                           Added on:{" "}
// //                           {new Date(remark.addedAt).toLocaleDateString()}
// //                         </p>
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               ) : (
// //                 <p className="text-gray-500 italic">No admin remarks found</p>
// //               )}
// //             </div>

// //             {/* Advance Admin Remarks */}
// //             <div className="bg-white p-4 rounded-lg border shadow-sm">
// //               <h3 className="font-semibold text-gray-800 mb-3">
// //                 Advance Admin Remarks
// //               </h3>
// //               {booking.advanceAdminRemarks?.length > 0 ? (
// //                 <div className="space-y-3">
// //                   {booking.advanceAdminRemarks.map((remark, idx) => {
// //                     const amount = remark.amount || 0;
// //                     const isNegative = amount < 0;
// //                     const displayAmount =
// //                       amount !== 0 ? `₹${Math.abs(amount)}` : "—";

// //                     return (
// //                       <div
// //                         key={idx}
// //                         className={`p-3 rounded border ${
// //                           isNegative
// //                             ? "bg-red-50 border-red-200"
// //                             : amount > 0
// //                               ? "bg-green-50 border-green-200"
// //                               : "bg-gray-50 border-gray-200"
// //                         }`}
// //                       >
// //                         <p className="text-sm">{remark.remark}</p>

// //                         <div className="flex items-center gap-2 mt-1">
// //                           <span
// //                             className={`text-xs font-medium px-2 py-0.5 rounded-full ${
// //                               isNegative
// //                                 ? "bg-red-100 text-red-700"
// //                                 : amount > 0
// //                                   ? "bg-green-100 text-green-700"
// //                                   : "bg-gray-100 text-gray-600"
// //                             }`}
// //                           >
// //                             {isNegative
// //                               ? "Refund/Adjustment"
// //                               : amount > 0
// //                                 ? "Additional"
// //                                 : "No Amount"}
// //                           </span>

// //                           <span
// //                             className={`text-sm font-medium ${
// //                               isNegative
// //                                 ? "text-red-600"
// //                                 : amount > 0
// //                                   ? "text-green-600"
// //                                   : "text-gray-600"
// //                             }`}
// //                           >
// //                             {amount !== 0 ? (isNegative ? "-" : "+") : ""}
// //                             {displayAmount}
// //                           </span>
// //                         </div>

// //                         <p className="text-xs text-gray-500 mt-1">
// //                           Added on:{" "}
// //                           {new Date(remark.addedAt).toLocaleDateString()}
// //                         </p>
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               ) : (
// //                 <p className="text-gray-500 italic">No advance remarks found</p>
// //               )}
// //             </div>

// //             {/* Travellers */}
// //             {booking.travellers.map((trav, idx) => {
// //               let status = null;
// //               if (trav.cancelled?.byTraveller && !trav.cancelled?.byAdmin) {
// //                 status = "Cancellation Requested";
// //               } else if (
// //                 trav.cancelled?.byAdmin &&
// //                 !trav.cancelled?.byTraveller
// //               ) {
// //                 status = "Rejected by Admin";
// //               } else if (
// //                 trav.cancelled?.byTraveller &&
// //                 trav.cancelled?.byAdmin
// //               ) {
// //                 status = "Cancelled";
// //               }

// //               return (
// //                 <div
// //                   key={idx}
// //                   className="p-3 bg-white rounded-lg border shadow-sm"
// //                 >
// //                   <p className="font-medium">
// //                     {trav.title} {trav.firstName} {trav.lastName} ({trav.age}{" "}
// //                     yrs, {trav.gender})
// //                   </p>
// //                   <p>Package: {trav.packageType}</p>
// //                   <p>Sharing: {trav.sharingType}</p>
// //                   {trav.boardingPoint?.stationName && (
// //                     <p>
// //                       Boarding: {trav.boardingPoint.stationName} (
// //                       {trav.boardingPoint.stationCode})
// //                     </p>
// //                   )}
// //                   {trav.deboardingPoint?.stationName && (
// //                     <p>
// //                       Deboarding: {trav.deboardingPoint.stationName} (
// //                       {trav.deboardingPoint.stationCode})
// //                     </p>
// //                   )}
// //                   {trav.selectedAddon?.name && (
// //                     <p>
// //                       Add-on: {trav.selectedAddon.name} (₹
// //                       {trav.selectedAddon.price})
// //                     </p>
// //                   )}
// //                   {trav.remarks && (
// //                     <p className="italic text-gray-500">
// //                       Remarks: {trav.remarks}
// //                     </p>
// //                   )}
// //                   {status && (
// //                     <p className="text-red-600 font-medium">{status}</p>
// //                   )}
// //                 </div>
// //               );
// //             })}

// //             {booking.payment && (
// //               <div>
// //                 <h3 className="font-semibold text-gray-800">Payment</h3>
// //                 <p>
// //                   Advance: ₹{booking.payment.advance.amount} –{" "}
// //                   {booking.payment.advance.paid ? "Paid" : "Pending"}{" "}
// //                   {booking.payment.advance.paidAt &&
// //                     `(on ${new Date(booking.payment.advance.paidAt).toLocaleDateString()})`}
// //                 </p>
// //                 <p>
// //                   Balance: ₹{booking.payment.balance.amount} –{" "}
// //                   {booking.payment.balance.paid ? "Paid" : "Pending"}{" "}
// //                   {booking.payment.balance.paidAt &&
// //                     `(on ${new Date(booking.payment.balance.paidAt).toLocaleDateString()})`}
// //                 </p>
// //               </div>
// //             )}
// //           </div>
// //         )}
// //       </div>
// //     );
// //   };

// //   return (
// //     <div className="p-4 sm:p-6 max-w-7xl mx-auto">
// //       <ToastContainer position="top-right" autoClose={3000} />

// //       <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 pl-12 md:pl-0">
// //         Tour Bookings
// //       </h2>

// //       <div className="mb-4 sm:mb-6">
// //         <label
// //           htmlFor="tour-select"
// //           className="block text-sm font-medium text-gray-700 mb-1"
// //         >
// //           Select a Tour:
// //         </label>
// //         <select
// //           id="tour-select"
// //           value={selectedTourId}
// //           onChange={handleTourChange}
// //           className="mt-1 block w-full pl-3 pr-10 py-2 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
// //         >
// //           <option value="">-- Select a Tour --</option>
// //           {tourList.map((tour) => (
// //             <option key={tour._id} value={tour._id}>
// //               {tour.title}
// //             </option>
// //           ))}
// //         </select>
// //       </div>

// //       {selectedTourId && (
// //         <div className="mb-6 flex flex-col md:flex-row gap-4 md:gap-6">
// //           <div className="w-full md:w-1/4">
// //             <label className="block text-sm font-medium text-gray-700 mb-1">
// //               Payment Status
// //             </label>
// //             <select
// //               value={paymentFilter}
// //               onChange={(e) => setPaymentFilter(e.target.value)}
// //               className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
// //             >
// //               <option value="all">All</option>
// //               <option value="advancePaid">Advance Paid</option>
// //               <option value="advancePending">Advance Pending</option>
// //               <option value="balancePaid">Balance Paid</option>
// //               <option value="balancePending">Balance Pending</option>
// //             </select>
// //           </div>

// //           <div className="w-full md:w-1/4">
// //             <label className="block text-sm font-medium text-gray-700 mb-1">
// //               Booking Status
// //             </label>
// //             <select
// //               value={statusFilter}
// //               onChange={(e) => setStatusFilter(e.target.value)}
// //               className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
// //             >
// //               <option value="all">All</option>
// //               <option value="active">Active</option>
// //               <option value="completed">Completed</option>
// //               <option value="rejected">Rejected</option>
// //               <option value="cancelled">Cancelled</option>
// //             </select>
// //           </div>

// //           <div className="w-full md:w-1/4">
// //             <label className="block text-sm font-medium text-gray-700 mb-1">
// //               Traveller Name
// //             </label>
// //             <input
// //               type="text"
// //               value={travellerNameFilter}
// //               onChange={(e) => setTravellerNameFilter(e.target.value)}
// //               placeholder="Search by name..."
// //               className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
// //             />
// //           </div>

// //           <div className="w-full md:w-1/4">
// //             <label className="block text-sm font-medium text-gray-700 mb-1">
// //               TNR
// //             </label>
// //             <input
// //               type="text"
// //               value={tnrFilter}
// //               onChange={(e) => setTnrFilter(e.target.value.toUpperCase())}
// //               placeholder="e.g. KD74PX"
// //               className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md uppercase tracking-wider"
// //               maxLength={6}
// //             />
// //           </div>
// //         </div>
// //       )}

// //       {!selectedTourId ? (
// //         <div className="text-center text-gray-500 p-6">
// //           Please select a tour to view bookings.
// //         </div>
// //       ) : isLoadingBookings ? (
// //         <div className="text-center text-gray-500 p-6">Loading bookings...</div>
// //       ) : filteredBookings.length === 0 ? (
// //         <div className="text-center text-gray-500 p-6">
// //           {tnrFilter || travellerNameFilter
// //             ? "No matching bookings found for your search."
// //             : "No bookings found."}
// //         </div>
// //       ) : (
// //         <>
// //           {activeBookings.length > 0 && (
// //             <div className="space-y-4 mb-8">
// //               <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
// //                 Active Bookings
// //               </h3>
// //               {activeBookings.map((b) => renderBookingCard(b, "active"))}
// //             </div>
// //           )}

// //           {completedBookings.length > 0 && (
// //             <div className="space-y-4 mb-8">
// //               <h3 className="text-lg sm:text-xl font-semibold text-green-600 mb-4">
// //                 Completed Bookings
// //               </h3>
// //               {completedBookings.map((b) => renderBookingCard(b, "completed"))}
// //             </div>
// //           )}

// //           {cancellationRequestBookings.length > 0 && (
// //             <div className="space-y-4 mb-8">
// //               <h3 className="text-lg sm:text-xl font-semibold text-orange-600 mb-4">
// //                 Cancellation Requests
// //               </h3>
// //               {cancellationRequestBookings.map((b) =>
// //                 renderBookingCard(b, "cancellationRequest"),
// //               )}
// //             </div>
// //           )}

// //           {rejectedByAdminBookings.length > 0 && (
// //             <div className="space-y-4 mb-8">
// //               <h3 className="text-lg sm:text-xl font-semibold text-red-600 mb-4">
// //                 Rejected by Admin
// //               </h3>
// //               {rejectedByAdminBookings.map((b) =>
// //                 renderBookingCard(b, "rejected"),
// //               )}
// //             </div>
// //           )}

// //           {cancelledByTravellerBookings.length > 0 && (
// //             <div className="space-y-4">
// //               <h3 className="text-lg sm:text-xl font-semibold text-yellow-600 mb-4">
// //                 Cancelled Bookings
// //               </h3>
// //               {cancelledByTravellerBookings.map((b) =>
// //                 renderBookingCard(b, "cancelledByTraveller"),
// //               )}
// //             </div>
// //           )}
// //         </>
// //       )}

// //       {showConfirmLeave && (
// //         <div
// //           style={{
// //             position: "fixed",
// //             inset: 0,
// //             backgroundColor: "rgba(0,0,0,0.65)",
// //             display: "flex",
// //             alignItems: "center",
// //             justifyContent: "center",
// //             zIndex: 9999,
// //             padding: "16px",
// //           }}
// //         >
// //           <div
// //             style={{
// //               backgroundColor: "white",
// //               borderRadius: "12px",
// //               padding: "24px",
// //               maxWidth: "440px",
// //               width: "100%",
// //               textAlign: "center",
// //               boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
// //             }}
// //           >
// //             <h2
// //               style={{
// //                 fontSize: "1.5rem",
// //                 fontWeight: "bold",
// //                 marginBottom: "16px",
// //                 color: "#111827",
// //               }}
// //             >
// //               Leave this page?
// //             </h2>

// //             <p
// //               style={{
// //                 color: "#4b5563",
// //                 marginBottom: "24px",
// //                 lineHeight: "1.6",
// //               }}
// //             >
// //               You are currently viewing bookings for{" "}
// //               <strong>
// //                 {tourList.find((t) => t._id === selectedTourId)?.title ||
// //                   "this tour"}
// //               </strong>
// //               .<br />
// //               Leaving will clear the current bookings view.
// //               <br />
// //               Are you sure you want to leave?
// //             </p>

// //             <div
// //               style={{ display: "flex", gap: "16px", justifyContent: "center" }}
// //             >
// //               <button
// //                 onClick={handleCancelLeave}
// //                 style={{
// //                   padding: "12px 28px",
// //                   backgroundColor: "#e5e7eb",
// //                   color: "#1f2937",
// //                   borderRadius: "8px",
// //                   fontWeight: "600",
// //                   border: "none",
// //                   cursor: "pointer",
// //                 }}
// //               >
// //                 Cancel (Stay)
// //               </button>

// //               <button
// //                 onClick={handleConfirmLeave}
// //                 style={{
// //                   padding: "12px 28px",
// //                   backgroundColor: "#dc2626",
// //                   color: "white",
// //                   borderRadius: "8px",
// //                   fontWeight: "600",
// //                   border: "none",
// //                   cursor: "pointer",
// //                 }}
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

// // export default TourBookings;


// /* eslint-disable no-unused-vars */
// // import React, { useState, useEffect, useContext, useCallback } from "react";
// // import { useLocation, useNavigate } from "react-router-dom";
// // import { TourContext } from "../../context/TourContext";
// // import {
// //   ChevronDown,
// //   ChevronUp,
// //   CheckCircle,
// //   Copy,
// //   Receipt as ReceiptIcon,
// //   FileText,
// // } from "lucide-react";
// // import { toast, ToastContainer } from "react-toastify";
// // import "react-toastify/dist/ReactToastify.css";

// // // ═══════════════════════════════════════════════════════════════════════
// // // Receipt/Invoice button — shown once booking.invoiceNumber exists (i.e.
// // // once advance has been marked paid). Does NOT fetch or render any
// // // invoice data itself — it just navigates to the standalone Invoice.jsx
// // // page, which handles fetching + display + download on its own.
// // // ═══════════════════════════════════════════════════════════════════════
// // const ReceiptNavButton = ({ booking }) => {
// //   const navigate = useNavigate();

// //   if (!booking?.invoiceNumber) return null;

// //   // booking.payment.balance.paid is already on the booking object
// //   // client-side, so the label is correct instantly — no fetch needed here.
// //   const isFullyPaid = booking.payment?.balance?.paid === true;
// //   const docLabel = isFullyPaid ? "Invoice" : "Receipt";

// //   return (
// //     <button
// //       onClick={(e) => {
// //         e.stopPropagation();
// //         navigate(`/invoice/${booking.tnr}`);
// //       }}
// //       className={`flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm rounded-lg text-white min-w-[120px] sm:min-w-[140px] ${isFullyPaid
// //         ? "bg-emerald-600 hover:bg-emerald-700"
// //         : "bg-cyan-600 hover:bg-cyan-700"
// //         }`}
// //     >
// //       {isFullyPaid ? <FileText size={16} /> : <ReceiptIcon size={16} />}
// //       {docLabel}
// //     </button>
// //   );
// // };

// // // ═══════════════════════════════════════════════════════════════════════
// // // Main TourBookings page
// // // ═══════════════════════════════════════════════════════════════════════
// // const TourBookings = () => {
// //   const {
// //     tourList,
// //     getTourList,
// //     bookings,
// //     getBookings,
// //     markAdvancePaid,
// //     markBalancePaid,
// //     completeBooking,
// //     ttoken,
// //   } = useContext(TourContext);

// //   const [expanded, setExpanded] = useState(null);
// //   const [selectedTourId, setSelectedTourId] = useState("");
// //   const [isLoadingBookings, setIsLoadingBookings] = useState(false);
// //   const [paymentFilter, setPaymentFilter] = useState("all");
// //   const [statusFilter, setStatusFilter] = useState("all");
// //   const [travellerNameFilter, setTravellerNameFilter] = useState("");
// //   const [tnrFilter, setTnrFilter] = useState("");
// //   const [showConfirmLeave, setShowConfirmLeave] = useState(false);

// //   const shouldProtect = Boolean(
// //     selectedTourId && !isLoadingBookings && bookings && bookings.length > 0,
// //   );

// //   const location = useLocation();

// //   useEffect(() => {
// //     if (!shouldProtect) return;

// //     const handleBeforeUnload = (e) => {
// //       e.preventDefault();
// //       e.returnValue = "";
// //     };

// //     window.addEventListener("beforeunload", handleBeforeUnload);

// //     return () => {
// //       window.removeEventListener("beforeunload", handleBeforeUnload);
// //     };
// //   }, [shouldProtect]);

// //   useEffect(() => {
// //     if (!shouldProtect) return;

// //     window.history.pushState(null, null, window.location.href);

// //     const handlePopState = () => {
// //       setShowConfirmLeave(true);
// //     };

// //     window.addEventListener("popstate", handlePopState);

// //     return () => {
// //       window.removeEventListener("popstate", handlePopState);
// //     };
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
// //     if (ttoken) {
// //       getTourList();
// //     }
// //   }, [ttoken, getTourList]);

// //   useEffect(() => {
// //     if (ttoken && selectedTourId) {
// //       setIsLoadingBookings(true);
// //       getBookings(selectedTourId)
// //         .then((response) => {
// //           if (
// //             response &&
// //             typeof response === "object" &&
// //             "success" in response
// //           ) {
// //             if (response.success) {
// //               toast.success("Bookings fetched successfully");
// //             } else {
// //               toast.error(response.message || "Failed to fetch bookings");
// //             }
// //           } else {
// //             toast.error("Invalid response from server");
// //           }
// //         })
// //         .catch((error) => {
// //           console.error("getBookings error:", error);
// //           toast.error(
// //             error.response?.data?.message ||
// //             error.message ||
// //             "Failed to fetch bookings",
// //           );
// //         })
// //         .finally(() => {
// //           setIsLoadingBookings(false);
// //         });
// //     } else {
// //       setIsLoadingBookings(false);
// //     }
// //   }, [ttoken, selectedTourId, getBookings]);

// //   useEffect(() => {
// //     return () => {
// //       toast.dismiss();
// //     };
// //   }, [location]);

// //   const toggleExpand = (id) => {
// //     setExpanded(expanded === id ? null : id);
// //   };

// //   const handleTourChange = (e) => {
// //     setSelectedTourId(e.target.value);
// //     setPaymentFilter("all");
// //     setStatusFilter("all");
// //     setTravellerNameFilter("");
// //     setTnrFilter("");
// //   };

// //   const handleApiResponse = useCallback(
// //     (response, successMessage) => {
// //       console.log("API Response:", response);
// //       if (response && typeof response === "object" && "success" in response) {
// //         if (response.success) {
// //           toast.success(successMessage || "Operation completed successfully");
// //           if (selectedTourId) {
// //             getBookings(selectedTourId);
// //           }
// //         } else {
// //           toast.error(response.message || "An error occurred");
// //         }
// //       } else {
// //         toast.error("Invalid response from server");
// //       }
// //     },
// //     [selectedTourId, getBookings],
// //   );

// //   const handleMarkAdvancePaid = async (tnr, tourId) => {
// //     if (!tnr) {
// //       toast.error("Cannot mark advance – TNR is missing");
// //       return;
// //     }

// //     if (!window.confirm("Are you sure you want to mark Advance as PAID?"))
// //       return;

// //     try {
// //       const response = await markAdvancePaid(tnr, tourId);
// //       handleApiResponse(response, "Advance payment marked successfully");
// //     } catch (error) {
// //       console.error("markAdvancePaid error:", error);
// //       toast.error(
// //         "Failed to mark advance: " + (error.message || "Unknown error"),
// //       );
// //     }
// //   };

// //   const handleMarkBalancePaid = async (tnr, tourId) => {
// //     if (!tourId) {
// //       toast.error("Please select a tour first.");
// //       return;
// //     }
// //     if (!tnr) {
// //       toast.error("Cannot mark balance – TNR is missing");
// //       return;
// //     }

// //     if (!window.confirm("Are you sure you want to mark Balance as PAID?"))
// //       return;

// //     try {
// //       const response = await markBalancePaid(tnr, tourId);
// //       handleApiResponse(response, "Balance payment marked successfully");
// //     } catch (error) {
// //       console.error("markBalancePaid error:", error);
// //       toast.error(
// //         "Failed to mark balance: " + (error.message || "Unknown error"),
// //       );
// //     }
// //   };

// //   const handleCompleteBooking = async (tnr, tourId) => {
// //     if (!tnr) {
// //       toast.error("Cannot complete booking – TNR is missing");
// //       return;
// //     }

// //     if (
// //       !window.confirm(
// //         "Mark this booking as completed? This action cannot be undone easily.",
// //       )
// //     ) {
// //       return;
// //     }

// //     try {
// //       const response = await completeBooking(tnr, tourId);
// //       handleApiResponse(response, "Booking completed successfully");
// //     } catch (error) {
// //       console.error("completeBooking error:", error);
// //       toast.error("Failed to complete: " + (error.message || "Unknown error"));
// //     }
// //   };

// //   const handleCopyTNR = (text) => {
// //     if (!text) {
// //       toast.error("Nothing to copy");
// //       return;
// //     }
// //     navigator.clipboard
// //       .writeText(text)
// //       .then(() => toast.success("Copied!"))
// //       .catch(() => toast.error("Failed to copy"));
// //   };

// //   // === HELPER FUNCTIONS ===
// //   const areAllTravellersCancelled = (booking) =>
// //     booking.travellers.length > 0 &&
// //     booking.travellers.every(
// //       (t) => t.cancelled?.byTraveller && t.cancelled?.byAdmin,
// //     );

// //   const areAllTravellersRejected = (booking) =>
// //     booking.travellers.length > 0 &&
// //     booking.travellers.every(
// //       (t) => t.cancelled?.byAdmin && !t.cancelled?.byTraveller,
// //     );

// //   const hasCancellationRequest = (booking) =>
// //     booking.travellers.some(
// //       (t) => t.cancelled?.byTraveller && !t.cancelled?.byAdmin,
// //     ) && !areAllTravellersCancelled(booking);

// //   const hasActiveTraveller = (booking) =>
// //     booking.travellers.some(
// //       (t) => !(t.cancelled?.byTraveller || t.cancelled?.byAdmin),
// //     );

// //   // === FILTER BOOKINGS ===
// //   const filteredBookings = bookings.filter((booking) => {
// //     const firstTraveller = booking.travellers[0] || {};
// //     const displayName =
// //       `${firstTraveller.firstName || ""} ${firstTraveller.lastName || ""}`.trim();

// //     let paymentMatch = true;
// //     if (paymentFilter !== "all") {
// //       if (paymentFilter === "advancePaid" && !booking.payment.advance.paid)
// //         paymentMatch = false;
// //       else if (
// //         paymentFilter === "advancePending" &&
// //         booking.payment.advance.paid
// //       )
// //         paymentMatch = false;
// //       else if (paymentFilter === "balancePaid" && !booking.payment.balance.paid)
// //         paymentMatch = false;
// //       else if (
// //         paymentFilter === "balancePending" &&
// //         booking.payment.balance.paid
// //       )
// //         paymentMatch = false;
// //     }

// //     let statusMatch = true;
// //     if (statusFilter !== "all") {
// //       const allCancelled = areAllTravellersCancelled(booking);
// //       const allRejected = areAllTravellersRejected(booking);
// //       const hasActive = hasActiveTraveller(booking);

// //       if (statusFilter === "active")
// //         statusMatch = !booking.isBookingCompleted && hasActive;
// //       else if (statusFilter === "completed")
// //         statusMatch = booking.isBookingCompleted && hasActive;
// //       else if (statusFilter === "rejected") statusMatch = allRejected;
// //       else if (statusFilter === "cancelled") statusMatch = allCancelled;
// //     }

// //     let nameMatch = true;
// //     if (travellerNameFilter) {
// //       nameMatch = displayName
// //         .toLowerCase()
// //         .includes(travellerNameFilter.toLowerCase());
// //     }

// //     let tnrMatch = true;
// //     if (tnrFilter.trim()) {
// //       const searchTnr = tnrFilter.trim().toUpperCase();
// //       tnrMatch = booking.tnr?.toUpperCase().includes(searchTnr);
// //     }

// //     return paymentMatch && statusMatch && nameMatch && tnrMatch;
// //   });

// //   // === CATEGORIZE BOOKINGS ===
// //   const activeBookings = filteredBookings
// //     .filter((b) => !b.isBookingCompleted && hasActiveTraveller(b))
// //     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

// //   const completedBookings = filteredBookings
// //     .filter((b) => b.isBookingCompleted && hasActiveTraveller(b))
// //     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

// //   const cancellationRequestBookings = filteredBookings
// //     .filter(hasCancellationRequest)
// //     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

// //   const rejectedByAdminBookings = filteredBookings
// //     .filter(areAllTravellersRejected)
// //     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

// //   const cancelledByTravellerBookings = filteredBookings
// //     .filter(areAllTravellersCancelled)
// //     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

// //   // === RENDER CARD ===
// //   const renderBookingCard = (booking, category) => {
// //     const isExpanded = expanded === booking._id;
// //     const firstTraveller = booking.travellers[0] || {};
// //     const displayName =
// //       `${firstTraveller.firstName || ""} ${firstTraveller.lastName || ""}`.trim() ||
// //       "Unknown Traveller";

// //     const showPartialCancellation = hasCancellationRequest(booking);
// //     const isFullyCancelled = areAllTravellersCancelled(booking);
// //     const isFullyRejected = areAllTravellersRejected(booking);

// //     const displayRef = booking.tnr || `...${booking._id?.slice(-8) || ""}`;

// //     return (
// //       <div
// //         key={booking._id}
// //         className="bg-white rounded-2xl shadow border overflow-hidden w-full sm:max-w-4xl mx-auto"
// //       >
// //         <div
// //           className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 cursor-pointer hover:bg-gray-50"
// //           onClick={() => toggleExpand(booking._id)}
// //         >
// //           <div className="w-full sm:w-auto">
// //             <p className="font-semibold text-base sm:text-lg">
// //               <strong>{displayName}</strong>
// //             </p>
// //             <p className="text-xs sm:text-sm text-gray-600 truncate">
// //               {booking.userId?.email || "No email"} |{" "}
// //               {booking.contact?.mobile || "No phone"}
// //             </p>

// //             <div className="mt-2 flex flex-wrap gap-2 text-xs sm:text-sm">
// //               <span
// //                 className={`px-2 py-1 rounded-lg text-xs font-medium ${booking.payment.advance.paid
// //                   ? "bg-green-100 text-green-700"
// //                   : "bg-red-100 text-red-600"
// //                   }`}
// //               >
// //                 Advance: {booking.payment.advance.paid ? "Paid" : "Pending"}
// //               </span>
// //               <span
// //                 className={`px-2 py-1 rounded-lg text-xs font-medium ${booking.payment.balance.paid
// //                   ? "bg-green-100 text-green-700"
// //                   : "bg-red-100 text-red-600"
// //                   }`}
// //               >
// //                 Balance: {booking.payment.balance.paid ? "Paid" : "Pending"}
// //               </span>

// //               {/* T&C Agreed Label */}
// //               {booking.termsAgreed && (
// //                 <span className="px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700">
// //                   T&C form submitted
// //                 </span>
// //               )}

// //               {/* Emergency Contact Badge */}
// //               {booking.emergencyContact && (
// //                 <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
// //                   Emergency: {booking.emergencyContact}
// //                 </span>
// //               )}
// //             </div>

// //             {category === "completed" && (
// //               <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 mt-2 inline-block">
// //                 Completed
// //               </span>
// //             )}
// //             {showPartialCancellation && (
// //               <span className="px-2 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-700 mt-2 inline-block">
// //                 Partial Cancellation Request
// //               </span>
// //             )}
// //             {isFullyRejected && (
// //               <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 mt-2 inline-block">
// //                 Rejected by Admin
// //               </span>
// //             )}
// //             {isFullyCancelled && (
// //               <span className="px-2 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700 mt-2 inline-block">
// //                 Fully Cancelled
// //               </span>
// //             )}

// //             <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm">
// //               <span className="text-gray-700 font-medium">
// //                 TNR:{" "}
// //                 <span className="font-bold tracking-wide">{displayRef}</span>
// //               </span>
// //               <button
// //                 onClick={(e) => {
// //                   e.stopPropagation();
// //                   handleCopyTNR(booking.tnr || booking._id);
// //                 }}
// //                 className="text-blue-600 hover:text-blue-800 transition-colors"
// //                 title="Copy TNR"
// //               >
// //                 <Copy size={16} />
// //               </button>
// //               <span className="text-gray-500">| {booking.bookingType}</span>
// //             </div>
// //           </div>

// //           <div className="flex items-center gap-2 mt-3 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
// //             {isFullyCancelled || isFullyRejected ? (
// //               <button
// //                 disabled
// //                 className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-gray-400 text-white rounded-lg cursor-not-allowed min-w-[120px] sm:min-w-[140px]"
// //               >
// //                 <CheckCircle size={16} />
// //                 Cancelled
// //               </button>
// //             ) : booking.isBookingCompleted ? (
// //               <button
// //                 disabled
// //                 className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-green-400 text-white rounded-lg cursor-not-allowed min-w-[120px] sm:min-w-[140px]"
// //               >
// //                 <CheckCircle size={16} />
// //                 Completed
// //               </button>
// //             ) : (
// //               <>
// //                 {booking.bookingType === "offline" && (
// //                   <>
// //                     {!booking.payment.advance.paid && (
// //                       <button
// //                         onClick={(e) => {
// //                           e.stopPropagation();
// //                           handleMarkAdvancePaid(booking.tnr, selectedTourId);
// //                         }}
// //                         className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 min-w-[120px] sm:min-w-[140px]"
// //                       >
// //                         <CheckCircle size={16} />
// //                         Mark Advance
// //                       </button>
// //                     )}
// //                     {booking.payment.advance.paid &&
// //                       !booking.payment.balance.paid && (
// //                         <button
// //                           onClick={(e) => {
// //                             e.stopPropagation();
// //                             handleMarkBalancePaid(booking.tnr, selectedTourId);
// //                           }}
// //                           className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 min-w-[120px] sm:min-w-[140px]"
// //                         >
// //                           <CheckCircle size={16} />
// //                           Mark Balance
// //                         </button>
// //                       )}
// //                   </>
// //                 )}
// //                 <button
// //                   onClick={(e) => {
// //                     e.stopPropagation();
// //                     handleCompleteBooking(booking.tnr, selectedTourId);
// //                   }}
// //                   className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 min-w-[120px] sm:min-w-[140px]"
// //                 >
// //                   <CheckCircle size={16} />
// //                   Mark Complete
// //                 </button>
// //               </>
// //             )}

// //             {/* ── Receipt/Invoice button — shows once advance is paid ── */}
// //             <ReceiptNavButton booking={booking} />

// //             {isExpanded ? (
// //               <ChevronUp className="text-gray-500 w-5 h-5" />
// //             ) : (
// //               <ChevronDown className="text-gray-500 w-5 h-5" />
// //             )}
// //           </div>
// //         </div>

// //         {isExpanded && (
// //           <div className="p-4 border-t bg-gray-50 text-xs sm:text-sm text-gray-700 space-y-4">
// //             <div>
// //               <p>
// //                 <strong>TNR / Reference:</strong>{" "}
// //                 <span className="font-mono font-bold">
// //                   {booking.tnr || "Not generated"}
// //                 </span>
// //               </p>
// //               <p>
// //                 <strong>Tour:</strong> {booking?.tourData?.title}
// //               </p>
// //               <p>
// //                 <strong>Date:</strong>{" "}
// //                 {new Date(booking.bookingDate).toLocaleDateString()}
// //               </p>
// //               <p>
// //                 <strong>Type:</strong> {booking.bookingType}
// //               </p>
// //             </div>

// //             <div>
// //               <h3 className="font-semibold text-gray-800">Contact</h3>
// //               <p>Email: {booking.contact?.email || "—"}</p>
// //               <p>Mobile: {booking.contact?.mobile || "—"}</p>

// //               {booking.emergencyContact && (
// //                 <p className="mt-1 text-blue-700 font-medium">
// //                   Emergency Contact: {booking.emergencyContact}
// //                 </p>
// //               )}

// //               <p className="mt-2">
// //                 <strong>T&C Agreed:</strong>{" "}
// //                 <span
// //                   className={
// //                     booking.termsAgreed
// //                       ? "text-green-600 font-medium"
// //                       : "text-red-600"
// //                   }
// //                 >
// //                   {booking.termsAgreed ? "Yes" : "No"}
// //                   {booking.termsAgreed && booking.termsAgreedAt && (
// //                     <>
// //                       {" "}
// //                       (on {new Date(booking.termsAgreedAt).toLocaleDateString()}
// //                       )
// //                     </>
// //                   )}
// //                 </span>
// //               </p>
// //             </div>

// //             {booking.billingAddress && (
// //               <div>
// //                 <h3 className="font-semibold text-gray-800">Billing Address</h3>
// //                 <p>{booking.billingAddress.addressLine1}</p>
// //                 {booking.billingAddress.addressLine2 && (
// //                   <p>{booking.billingAddress.addressLine2}</p>
// //                 )}
// //                 <p>
// //                   {booking.billingAddress.city}, {booking.billingAddress.state}{" "}
// //                   - {booking.billingAddress.pincode}
// //                 </p>
// //                 <p>{booking.billingAddress.country}</p>
// //               </div>
// //             )}

// //             {/* Admin Remarks */}
// //             <div className="bg-white p-4 rounded-lg border shadow-sm">
// //               <h3 className="font-semibold text-gray-800 mb-3">
// //                 Admin Remarks
// //               </h3>
// //               {booking.adminRemarks?.length > 0 ? (
// //                 <div className="space-y-3">
// //                   {booking.adminRemarks.map((remark, idx) => {
// //                     const amount = remark.amount || 0;
// //                     const isNegative = amount < 0;
// //                     const displayAmount =
// //                       amount !== 0 ? `₹${Math.abs(amount)}` : "—";

// //                     return (
// //                       <div
// //                         key={idx}
// //                         className={`p-3 rounded border ${isNegative
// //                           ? "bg-red-50 border-red-200"
// //                           : amount > 0
// //                             ? "bg-green-50 border-green-200"
// //                             : "bg-gray-50 border-gray-200"
// //                           }`}
// //                       >
// //                         <p className="text-sm">{remark.remark}</p>

// //                         <div className="flex items-center gap-2 mt-1">
// //                           <span
// //                             className={`text-xs font-medium px-2 py-0.5 rounded-full ${isNegative
// //                               ? "bg-red-100 text-red-700"
// //                               : amount > 0
// //                                 ? "bg-green-100 text-green-700"
// //                                 : "bg-gray-100 text-gray-600"
// //                               }`}
// //                           >
// //                             {isNegative
// //                               ? "Refund/Adjustment"
// //                               : amount > 0
// //                                 ? "Additional"
// //                                 : "No Amount"}
// //                           </span>

// //                           <span
// //                             className={`text-sm font-medium ${isNegative
// //                               ? "text-red-600"
// //                               : amount > 0
// //                                 ? "text-green-600"
// //                                 : "text-gray-600"
// //                               }`}
// //                           >
// //                             {amount !== 0 ? (isNegative ? "-" : "+") : ""}
// //                             {displayAmount}
// //                           </span>
// //                         </div>

// //                         <p className="text-xs text-gray-500 mt-1">
// //                           Added on:{" "}
// //                           {new Date(remark.addedAt).toLocaleDateString()}
// //                         </p>
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               ) : (
// //                 <p className="text-gray-500 italic">No admin remarks found</p>
// //               )}
// //             </div>

// //             {/* Advance Admin Remarks */}
// //             <div className="bg-white p-4 rounded-lg border shadow-sm">
// //               <h3 className="font-semibold text-gray-800 mb-3">
// //                 Advance Admin Remarks
// //               </h3>
// //               {booking.advanceAdminRemarks?.length > 0 ? (
// //                 <div className="space-y-3">
// //                   {booking.advanceAdminRemarks.map((remark, idx) => {
// //                     const amount = remark.amount || 0;
// //                     const isNegative = amount < 0;
// //                     const displayAmount =
// //                       amount !== 0 ? `₹${Math.abs(amount)}` : "—";

// //                     return (
// //                       <div
// //                         key={idx}
// //                         className={`p-3 rounded border ${isNegative
// //                           ? "bg-red-50 border-red-200"
// //                           : amount > 0
// //                             ? "bg-green-50 border-green-200"
// //                             : "bg-gray-50 border-gray-200"
// //                           }`}
// //                       >
// //                         <p className="text-sm">{remark.remark}</p>

// //                         <div className="flex items-center gap-2 mt-1">
// //                           <span
// //                             className={`text-xs font-medium px-2 py-0.5 rounded-full ${isNegative
// //                               ? "bg-red-100 text-red-700"
// //                               : amount > 0
// //                                 ? "bg-green-100 text-green-700"
// //                                 : "bg-gray-100 text-gray-600"
// //                               }`}
// //                           >
// //                             {isNegative
// //                               ? "Refund/Adjustment"
// //                               : amount > 0
// //                                 ? "Additional"
// //                                 : "No Amount"}
// //                           </span>

// //                           <span
// //                             className={`text-sm font-medium ${isNegative
// //                               ? "text-red-600"
// //                               : amount > 0
// //                                 ? "text-green-600"
// //                                 : "text-gray-600"
// //                               }`}
// //                           >
// //                             {amount !== 0 ? (isNegative ? "-" : "+") : ""}
// //                             {displayAmount}
// //                           </span>
// //                         </div>

// //                         <p className="text-xs text-gray-500 mt-1">
// //                           Added on:{" "}
// //                           {new Date(remark.addedAt).toLocaleDateString()}
// //                         </p>
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               ) : (
// //                 <p className="text-gray-500 italic">No advance remarks found</p>
// //               )}
// //             </div>

// //             {/* Travellers */}
// //             {/* Travellers */}
// //             {booking.travellers.map((trav, idx) => {
// //               let status = null;
// //               if (trav.cancelled?.byTraveller && !trav.cancelled?.byAdmin) {
// //                 status = "Cancellation Requested";
// //               } else if (
// //                 trav.cancelled?.byAdmin &&
// //                 !trav.cancelled?.byTraveller
// //               ) {
// //                 status = "Rejected by Admin";
// //               } else if (
// //                 trav.cancelled?.byTraveller &&
// //                 trav.cancelled?.byAdmin
// //               ) {
// //                 status = "Cancelled";
// //               }

// //               // ── if/else — resolve addon display ──
// //               // NEW bookings: trav.selectedAddons is an array (train-wise, with tripType)
// //               // OLD bookings: trav.selectedAddon is a flat single object
// //               let addonDisplay = null;

// //               if (Array.isArray(trav.selectedAddons) && trav.selectedAddons.length > 0) {
// //                 // ── NEW MODE: train-wise addons, color-coded by tripType ──
// //                 const getTripTypeStyle = (tripType) => {
// //                   const t = (tripType || "").toUpperCase();
// //                   if (t.startsWith("BOARD")) {
// //                     return { badge: "bg-blue-100 text-blue-700", label: "Boarding" };
// //                   }
// //                   if (t.startsWith("MIDDLE")) {
// //                     return { badge: "bg-purple-100 text-purple-700", label: "Middle" };
// //                   }
// //                   if (t.startsWith("DEBOARD") || t.startsWith("DEBOARF")) {
// //                     return { badge: "bg-orange-100 text-orange-700", label: "Deboarding" };
// //                   }
// //                   return { badge: "bg-gray-100 text-gray-700", label: tripType || "Train" };
// //                 };

// //                 addonDisplay = (
// //                   <div className="mt-3">
// //                     <p className="text-sm font-bold text-red-600 mb-1.5">
// //                       Add-ons
// //                     </p>
// //                     <div className="space-y-1.5">
// //                       {trav.selectedAddons.map((a, aIdx) => {
// //                         const style = getTripTypeStyle(a.tripType);
// //                         const isNegative = Number(a.amount) < 0;
// //                         return (
// //                           <div
// //                             key={aIdx}
// //                             className="flex flex-wrap items-center gap-2 text-sm"
// //                           >
// //                             <span
// //                               className={`px-2 py-0.5 rounded-full text-xs font-semibold ${style.badge}`}
// //                             >
// //                               {style.label}
// //                             </span>
// //                             <span className="text-gray-700">
// //                               {a.trainName}
// //                               {a.trainNo ? ` (${a.trainNo})` : ""}: {a.name}
// //                             </span>
// //                             <span
// //                               className={`font-semibold ${isNegative ? "text-red-600" : "text-green-700"
// //                                 }`}
// //                             >
// //                               {Number(a.amount) >= 0 ? "+" : ""}₹{a.amount}
// //                             </span>
// //                           </div>
// //                         );
// //                       })}
// //                     </div>
// //                   </div>
// //                 );

// //               } else if (trav.selectedAddon?.name) {
// //                 // ── OLD MODE: single flat addon ──
// //                 addonDisplay = (
// //                   <p className="mt-2">
// //                     <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 mr-2">
// //                       Add-on
// //                     </span>
// //                     {trav.selectedAddon.name} (₹{trav.selectedAddon.price})
// //                   </p>
// //                 );
// //               }

// //               return (
// //                 <div
// //                   key={idx}
// //                   className="p-3 bg-white rounded-lg border shadow-sm"
// //                 >
// //                   <p className="font-medium">
// //                     {trav.title} {trav.firstName} {trav.lastName} ({trav.age}{" "}
// //                     yrs, {trav.gender})
// //                   </p>
// //                   <p>Package: {trav.packageType}</p>
// //                   <p>Sharing: {trav.sharingType}</p>
// //                   {trav.boardingPoint?.stationName && (
// //                     <p>
// //                       Boarding: {trav.boardingPoint.stationName} (
// //                       {trav.boardingPoint.stationCode})
// //                     </p>
// //                   )}
// //                   {trav.deboardingPoint?.stationName && (
// //                     <p>
// //                       Deboarding: {trav.deboardingPoint.stationName} (
// //                       {trav.deboardingPoint.stationCode})
// //                     </p>
// //                   )}

// //                   {/* ── forked addon display (new train-wise array vs old flat) ── */}
// //                   {addonDisplay}

// //                   {trav.remarks && (
// //                     <p className="italic text-gray-500">
// //                       Remarks: {trav.remarks}
// //                     </p>
// //                   )}
// //                   {status && (
// //                     <p className="text-red-600 font-medium">{status}</p>
// //                   )}
// //                 </div>
// //               );
// //             })}

// //             {booking.payment && (
// //               <div>
// //                 <h3 className="font-semibold text-gray-800">Payment</h3>
// //                 <p>
// //                   Advance: ₹{booking.payment.advance.amount} –{" "}
// //                   {booking.payment.advance.paid ? "Paid" : "Pending"}{" "}
// //                   {booking.payment.advance.paidAt &&
// //                     `(on ${new Date(booking.payment.advance.paidAt).toLocaleDateString()})`}
// //                 </p>
// //                 <p>
// //                   Balance: ₹{booking.payment.balance.amount} –{" "}
// //                   {booking.payment.balance.paid ? "Paid" : "Pending"}{" "}
// //                   {booking.payment.balance.paidAt &&
// //                     `(on ${new Date(booking.payment.balance.paidAt).toLocaleDateString()})`}
// //                 </p>
// //               </div>
// //             )}
// //           </div>
// //         )}
// //       </div>
// //     );
// //   };

// //   return (
// //     <div className="p-4 sm:p-6 max-w-7xl mx-auto">
// //       <ToastContainer position="top-right" autoClose={3000} />

// //       <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 pl-12 md:pl-0">
// //         Tour Bookings
// //       </h2>

// //       <div className="mb-4 sm:mb-6">
// //         <label
// //           htmlFor="tour-select"
// //           className="block text-sm font-medium text-gray-700 mb-1"
// //         >
// //           Select a Tour:
// //         </label>
// //         <select
// //           id="tour-select"
// //           value={selectedTourId}
// //           onChange={handleTourChange}
// //           className="mt-1 block w-full pl-3 pr-10 py-2 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
// //         >
// //           <option value="">-- Select a Tour --</option>
// //           {tourList.map((tour) => (
// //             <option key={tour._id} value={tour._id}>
// //               {tour.title}
// //             </option>
// //           ))}
// //         </select>
// //       </div>

// //       {selectedTourId && (
// //         <div className="mb-6 flex flex-col md:flex-row gap-4 md:gap-6">
// //           <div className="w-full md:w-1/4">
// //             <label className="block text-sm font-medium text-gray-700 mb-1">
// //               Payment Status
// //             </label>
// //             <select
// //               value={paymentFilter}
// //               onChange={(e) => setPaymentFilter(e.target.value)}
// //               className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
// //             >
// //               <option value="all">All</option>
// //               <option value="advancePaid">Advance Paid</option>
// //               <option value="advancePending">Advance Pending</option>
// //               <option value="balancePaid">Balance Paid</option>
// //               <option value="balancePending">Balance Pending</option>
// //             </select>
// //           </div>

// //           <div className="w-full md:w-1/4">
// //             <label className="block text-sm font-medium text-gray-700 mb-1">
// //               Booking Status
// //             </label>
// //             <select
// //               value={statusFilter}
// //               onChange={(e) => setStatusFilter(e.target.value)}
// //               className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
// //             >
// //               <option value="all">All</option>
// //               <option value="active">Active</option>
// //               <option value="completed">Completed</option>
// //               <option value="rejected">Rejected</option>
// //               <option value="cancelled">Cancelled</option>
// //             </select>
// //           </div>

// //           <div className="w-full md:w-1/4">
// //             <label className="block text-sm font-medium text-gray-700 mb-1">
// //               Traveller Name
// //             </label>
// //             <input
// //               type="text"
// //               value={travellerNameFilter}
// //               onChange={(e) => setTravellerNameFilter(e.target.value)}
// //               placeholder="Search by name..."
// //               className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
// //             />
// //           </div>

// //           <div className="w-full md:w-1/4">
// //             <label className="block text-sm font-medium text-gray-700 mb-1">
// //               TNR
// //             </label>
// //             <input
// //               type="text"
// //               value={tnrFilter}
// //               onChange={(e) => setTnrFilter(e.target.value.toUpperCase())}
// //               placeholder="e.g. KD74PX"
// //               className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md uppercase tracking-wider"
// //               maxLength={6}
// //             />
// //           </div>
// //         </div>
// //       )}

// //       {!selectedTourId ? (
// //         <div className="text-center text-gray-500 p-6">
// //           Please select a tour to view bookings.
// //         </div>
// //       ) : isLoadingBookings ? (
// //         <div className="text-center text-gray-500 p-6">Loading bookings...</div>
// //       ) : filteredBookings.length === 0 ? (
// //         <div className="text-center text-gray-500 p-6">
// //           {tnrFilter || travellerNameFilter
// //             ? "No matching bookings found for your search."
// //             : "No bookings found."}
// //         </div>
// //       ) : (
// //         <>
// //           {activeBookings.length > 0 && (
// //             <div className="space-y-4 mb-8">
// //               <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
// //                 Active Bookings
// //               </h3>
// //               {activeBookings.map((b) => renderBookingCard(b, "active"))}
// //             </div>
// //           )}

// //           {completedBookings.length > 0 && (
// //             <div className="space-y-4 mb-8">
// //               <h3 className="text-lg sm:text-xl font-semibold text-green-600 mb-4">
// //                 Completed Bookings
// //               </h3>
// //               {completedBookings.map((b) => renderBookingCard(b, "completed"))}
// //             </div>
// //           )}

// //           {cancellationRequestBookings.length > 0 && (
// //             <div className="space-y-4 mb-8">
// //               <h3 className="text-lg sm:text-xl font-semibold text-orange-600 mb-4">
// //                 Cancellation Requests
// //               </h3>
// //               {cancellationRequestBookings.map((b) =>
// //                 renderBookingCard(b, "cancellationRequest"),
// //               )}
// //             </div>
// //           )}

// //           {rejectedByAdminBookings.length > 0 && (
// //             <div className="space-y-4 mb-8">
// //               <h3 className="text-lg sm:text-xl font-semibold text-red-600 mb-4">
// //                 Rejected by Admin
// //               </h3>
// //               {rejectedByAdminBookings.map((b) =>
// //                 renderBookingCard(b, "rejected"),
// //               )}
// //             </div>
// //           )}

// //           {cancelledByTravellerBookings.length > 0 && (
// //             <div className="space-y-4">
// //               <h3 className="text-lg sm:text-xl font-semibold text-yellow-600 mb-4">
// //                 Cancelled Bookings
// //               </h3>
// //               {cancelledByTravellerBookings.map((b) =>
// //                 renderBookingCard(b, "cancelledByTraveller"),
// //               )}
// //             </div>
// //           )}
// //         </>
// //       )}

// //       {showConfirmLeave && (
// //         <div
// //           style={{
// //             position: "fixed",
// //             inset: 0,
// //             backgroundColor: "rgba(0,0,0,0.65)",
// //             display: "flex",
// //             alignItems: "center",
// //             justifyContent: "center",
// //             zIndex: 9999,
// //             padding: "16px",
// //           }}
// //         >
// //           <div
// //             style={{
// //               backgroundColor: "white",
// //               borderRadius: "12px",
// //               padding: "24px",
// //               maxWidth: "440px",
// //               width: "100%",
// //               textAlign: "center",
// //               boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
// //             }}
// //           >
// //             <h2
// //               style={{
// //                 fontSize: "1.5rem",
// //                 fontWeight: "bold",
// //                 marginBottom: "16px",
// //                 color: "#111827",
// //               }}
// //             >
// //               Leave this page?
// //             </h2>

// //             <p
// //               style={{
// //                 color: "#4b5563",
// //                 marginBottom: "24px",
// //                 lineHeight: "1.6",
// //               }}
// //             >
// //               You are currently viewing bookings for{" "}
// //               <strong>
// //                 {tourList.find((t) => t._id === selectedTourId)?.title ||
// //                   "this tour"}
// //               </strong>
// //               .<br />
// //               Leaving will clear the current bookings view.
// //               <br />
// //               Are you sure you want to leave?
// //             </p>

// //             <div
// //               style={{ display: "flex", gap: "16px", justifyContent: "center" }}
// //             >
// //               <button
// //                 onClick={handleCancelLeave}
// //                 style={{
// //                   padding: "12px 28px",
// //                   backgroundColor: "#e5e7eb",
// //                   color: "#1f2937",
// //                   borderRadius: "8px",
// //                   fontWeight: "600",
// //                   border: "none",
// //                   cursor: "pointer",
// //                 }}
// //               >
// //                 Cancel (Stay)
// //               </button>

// //               <button
// //                 onClick={handleConfirmLeave}
// //                 style={{
// //                   padding: "12px 28px",
// //                   backgroundColor: "#dc2626",
// //                   color: "white",
// //                   borderRadius: "8px",
// //                   fontWeight: "600",
// //                   border: "none",
// //                   cursor: "pointer",
// //                 }}
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

// // export default TourBookings;


// // import React, { useState, useEffect, useContext, useCallback } from "react";
// // import { useLocation, useNavigate } from "react-router-dom";
// // import { TourContext } from "../../context/TourContext";
// // import {
// //   ChevronDown,
// //   ChevronUp,
// //   CheckCircle,
// //   Copy,
// //   Receipt as ReceiptIcon,
// //   FileText,
// // } from "lucide-react";
// // import { toast, ToastContainer } from "react-toastify";
// // import "react-toastify/dist/ReactToastify.css";

// // // ═══════════════════════════════════════════════════════════════════════
// // // Receipt/Invoice button — shown once booking.invoiceNumber exists (i.e.
// // // once advance has been marked paid). Does NOT fetch or render any
// // // invoice data itself — it just navigates to the standalone Invoice.jsx
// // // page, which handles fetching + display + download on its own.
// // // ═══════════════════════════════════════════════════════════════════════
// // const ReceiptNavButton = ({ booking }) => {
// //   const navigate = useNavigate();

// //   if (!booking?.invoiceNumber) return null;

// //   // booking.payment.balance.paid is already on the booking object
// //   // client-side, so the label is correct instantly — no fetch needed here.
// //   const isFullyPaid = booking.payment?.balance?.paid === true;
// //   const docLabel = isFullyPaid ? "Invoice" : "Receipt";

// //   return (
// //     <button
// //       onClick={(e) => {
// //         e.stopPropagation();
// //         navigate(`/invoice/${booking.tnr}`);
// //       }}
// //       className={`flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm rounded-lg text-white min-w-[120px] sm:min-w-[140px] ${isFullyPaid
// //         ? "bg-emerald-600 hover:bg-emerald-700"
// //         : "bg-cyan-600 hover:bg-cyan-700"
// //         }`}
// //     >
// //       {isFullyPaid ? <FileText size={16} /> : <ReceiptIcon size={16} />}
// //       {docLabel}
// //     </button>
// //   );
// // };

// // // ═══════════════════════════════════════════════════════════════════════
// // // Main TourBookings page
// // // ═══════════════════════════════════════════════════════════════════════
// // const TourBookings = () => {
// //   const {
// //     tourList,
// //     getTourList,
// //     bookings,
// //     getBookings,
// //     markAdvancePaid,
// //     markBalancePaid,
// //     completeBooking,
// //     ttoken,
// //   } = useContext(TourContext);

// //   const [expanded, setExpanded] = useState(null);
// //   const [selectedTourId, setSelectedTourId] = useState("");
// //   const [isLoadingBookings, setIsLoadingBookings] = useState(false);
// //   const [paymentFilter, setPaymentFilter] = useState("all");
// //   const [statusFilter, setStatusFilter] = useState("all");
// //   const [travellerNameFilter, setTravellerNameFilter] = useState("");
// //   const [tnrFilter, setTnrFilter] = useState("");
// //   const [showConfirmLeave, setShowConfirmLeave] = useState(false);

// //   const shouldProtect = Boolean(
// //     selectedTourId && !isLoadingBookings && bookings && bookings.length > 0,
// //   );

// //   const location = useLocation();

// //   useEffect(() => {
// //     if (!shouldProtect) return;

// //     const handleBeforeUnload = (e) => {
// //       e.preventDefault();
// //       e.returnValue = "";
// //     };

// //     window.addEventListener("beforeunload", handleBeforeUnload);

// //     return () => {
// //       window.removeEventListener("beforeunload", handleBeforeUnload);
// //     };
// //   }, [shouldProtect]);

// //   useEffect(() => {
// //     if (!shouldProtect) return;

// //     window.history.pushState(null, null, window.location.href);

// //     const handlePopState = () => {
// //       setShowConfirmLeave(true);
// //     };

// //     window.addEventListener("popstate", handlePopState);

// //     return () => {
// //       window.removeEventListener("popstate", handlePopState);
// //     };
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
// //     if (ttoken) {
// //       getTourList();
// //     }
// //   }, [ttoken, getTourList]);

// //   useEffect(() => {
// //     if (ttoken && selectedTourId) {
// //       setIsLoadingBookings(true);
// //       getBookings(selectedTourId)
// //         .then((response) => {
// //           if (
// //             response &&
// //             typeof response === "object" &&
// //             "success" in response
// //           ) {
// //             if (response.success) {
// //               toast.success("Bookings fetched successfully");
// //             } else {
// //               toast.error(response.message || "Failed to fetch bookings");
// //             }
// //           } else {
// //             toast.error("Invalid response from server");
// //           }
// //         })
// //         .catch((error) => {
// //           console.error("getBookings error:", error);
// //           toast.error(
// //             error.response?.data?.message ||
// //             error.message ||
// //             "Failed to fetch bookings",
// //           );
// //         })
// //         .finally(() => {
// //           setIsLoadingBookings(false);
// //         });
// //     } else {
// //       setIsLoadingBookings(false);
// //     }
// //   }, [ttoken, selectedTourId, getBookings]);

// //   useEffect(() => {
// //     return () => {
// //       toast.dismiss();
// //     };
// //   }, [location]);

// //   const toggleExpand = (id) => {
// //     setExpanded(expanded === id ? null : id);
// //   };

// //   const handleTourChange = (e) => {
// //     setSelectedTourId(e.target.value);
// //     setPaymentFilter("all");
// //     setStatusFilter("all");
// //     setTravellerNameFilter("");
// //     setTnrFilter("");
// //   };

// //   const handleApiResponse = useCallback(
// //     (response, successMessage) => {
// //       console.log("API Response:", response);
// //       if (response && typeof response === "object" && "success" in response) {
// //         if (response.success) {
// //           toast.success(successMessage || "Operation completed successfully");
// //           if (selectedTourId) {
// //             getBookings(selectedTourId);
// //           }
// //         } else {
// //           toast.error(response.message || "An error occurred");
// //         }
// //       } else {
// //         toast.error("Invalid response from server");
// //       }
// //     },
// //     [selectedTourId, getBookings],
// //   );

// //   const handleMarkAdvancePaid = async (tnr, tourId) => {
// //     if (!tnr) {
// //       toast.error("Cannot mark advance – TNR is missing");
// //       return;
// //     }

// //     if (!window.confirm("Are you sure you want to mark Advance as PAID?"))
// //       return;

// //     try {
// //       const response = await markAdvancePaid(tnr, tourId);
// //       handleApiResponse(response, "Advance payment marked successfully");
// //     } catch (error) {
// //       console.error("markAdvancePaid error:", error);
// //       toast.error(
// //         "Failed to mark advance: " + (error.message || "Unknown error"),
// //       );
// //     }
// //   };

// //   const handleMarkBalancePaid = async (tnr, tourId) => {
// //     if (!tourId) {
// //       toast.error("Please select a tour first.");
// //       return;
// //     }
// //     if (!tnr) {
// //       toast.error("Cannot mark balance – TNR is missing");
// //       return;
// //     }

// //     if (!window.confirm("Are you sure you want to mark Balance as PAID?"))
// //       return;

// //     try {
// //       const response = await markBalancePaid(tnr, tourId);
// //       handleApiResponse(response, "Balance payment marked successfully");
// //     } catch (error) {
// //       console.error("markBalancePaid error:", error);
// //       toast.error(
// //         "Failed to mark balance: " + (error.message || "Unknown error"),
// //       );
// //     }
// //   };

// //   const handleCompleteBooking = async (tnr, tourId) => {
// //     if (!tnr) {
// //       toast.error("Cannot complete booking – TNR is missing");
// //       return;
// //     }

// //     if (
// //       !window.confirm(
// //         "Mark this booking as completed? This action cannot be undone easily.",
// //       )
// //     ) {
// //       return;
// //     }

// //     try {
// //       const response = await completeBooking(tnr, tourId);
// //       handleApiResponse(response, "Booking completed successfully");
// //     } catch (error) {
// //       console.error("completeBooking error:", error);
// //       toast.error("Failed to complete: " + (error.message || "Unknown error"));
// //     }
// //   };

// //   const handleCopyTNR = (text) => {
// //     if (!text) {
// //       toast.error("Nothing to copy");
// //       return;
// //     }
// //     navigator.clipboard
// //       .writeText(text)
// //       .then(() => toast.success("Copied!"))
// //       .catch(() => toast.error("Failed to copy"));
// //   };

// //   // === HELPER FUNCTIONS ===
// //   const areAllTravellersCancelled = (booking) =>
// //     booking.travellers.length > 0 &&
// //     booking.travellers.every(
// //       (t) => t.cancelled?.byTraveller && t.cancelled?.byAdmin,
// //     );

// //   const areAllTravellersRejected = (booking) =>
// //     booking.travellers.length > 0 &&
// //     booking.travellers.every(
// //       (t) => t.cancelled?.byAdmin && !t.cancelled?.byTraveller,
// //     );

// //   const hasCancellationRequest = (booking) =>
// //     booking.travellers.some(
// //       (t) => t.cancelled?.byTraveller && !t.cancelled?.byAdmin,
// //     ) && !areAllTravellersCancelled(booking);

// //   const hasActiveTraveller = (booking) =>
// //     booking.travellers.some(
// //       (t) => !(t.cancelled?.byTraveller || t.cancelled?.byAdmin),
// //     );

// //   // === FILTER BOOKINGS ===
// //   const filteredBookings = bookings.filter((booking) => {
// //     const firstTraveller = booking.travellers[0] || {};
// //     const displayName =
// //       `${firstTraveller.firstName || ""} ${firstTraveller.lastName || ""}`.trim();

// //     let paymentMatch = true;
// //     if (paymentFilter !== "all") {
// //       if (paymentFilter === "advancePaid" && !booking.payment.advance.paid)
// //         paymentMatch = false;
// //       else if (
// //         paymentFilter === "advancePending" &&
// //         booking.payment.advance.paid
// //       )
// //         paymentMatch = false;
// //       else if (paymentFilter === "balancePaid" && !booking.payment.balance.paid)
// //         paymentMatch = false;
// //       else if (
// //         paymentFilter === "balancePending" &&
// //         booking.payment.balance.paid
// //       )
// //         paymentMatch = false;
// //     }

// //     let statusMatch = true;
// //     if (statusFilter !== "all") {
// //       const allCancelled = areAllTravellersCancelled(booking);
// //       const allRejected = areAllTravellersRejected(booking);
// //       const hasActive = hasActiveTraveller(booking);

// //       if (statusFilter === "active")
// //         statusMatch = !booking.isBookingCompleted && hasActive;
// //       else if (statusFilter === "completed")
// //         statusMatch = booking.isBookingCompleted && hasActive;
// //       else if (statusFilter === "rejected") statusMatch = allRejected;
// //       else if (statusFilter === "cancelled") statusMatch = allCancelled;
// //     }

// //     let nameMatch = true;
// //     if (travellerNameFilter) {
// //       nameMatch = displayName
// //         .toLowerCase()
// //         .includes(travellerNameFilter.toLowerCase());
// //     }

// //     let tnrMatch = true;
// //     if (tnrFilter.trim()) {
// //       const searchTnr = tnrFilter.trim().toUpperCase();
// //       tnrMatch = booking.tnr?.toUpperCase().includes(searchTnr);
// //     }

// //     return paymentMatch && statusMatch && nameMatch && tnrMatch;
// //   });

// //   // === CATEGORIZE BOOKINGS ===
// //   const activeBookings = filteredBookings
// //     .filter((b) => !b.isBookingCompleted && hasActiveTraveller(b))
// //     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

// //   const completedBookings = filteredBookings
// //     .filter((b) => b.isBookingCompleted && hasActiveTraveller(b))
// //     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

// //   const cancellationRequestBookings = filteredBookings
// //     .filter(hasCancellationRequest)
// //     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

// //   const rejectedByAdminBookings = filteredBookings
// //     .filter(areAllTravellersRejected)
// //     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

// //   const cancelledByTravellerBookings = filteredBookings
// //     .filter(areAllTravellersCancelled)
// //     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

// //   // === RENDER CARD ===
// //   const renderBookingCard = (booking, category) => {
// //     const isExpanded = expanded === booking._id;
// //     const firstTraveller = booking.travellers[0] || {};
// //     const displayName =
// //       `${firstTraveller.firstName || ""} ${firstTraveller.lastName || ""}`.trim() ||
// //       "Unknown Traveller";

// //     const showPartialCancellation = hasCancellationRequest(booking);
// //     const isFullyCancelled = areAllTravellersCancelled(booking);
// //     const isFullyRejected = areAllTravellersRejected(booking);

// //     const displayRef = booking.tnr || `...${booking._id?.slice(-8) || ""}`;

// //     return (
// //       <div
// //         key={booking._id}
// //         className="bg-white rounded-2xl shadow border overflow-hidden w-full sm:max-w-4xl mx-auto"
// //       >
// //         <div
// //           className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 cursor-pointer hover:bg-gray-50"
// //           onClick={() => toggleExpand(booking._id)}
// //         >
// //           <div className="w-full sm:w-auto">
// //             <p className="font-semibold text-base sm:text-lg">
// //               <strong>{displayName}</strong>
// //             </p>
// //             <p className="text-xs sm:text-sm text-gray-600 truncate">
// //               {booking.userId?.email || "No email"} |{" "}
// //               {booking.contact?.mobile || "No phone"}
// //             </p>

// //             <div className="mt-2 flex flex-wrap gap-2 text-xs sm:text-sm">
// //               <span
// //                 className={`px-2 py-1 rounded-lg text-xs font-medium ${booking.payment.advance.paid
// //                   ? "bg-green-100 text-green-700"
// //                   : "bg-red-100 text-red-600"
// //                   }`}
// //               >
// //                 Advance: {booking.payment.advance.paid ? "Paid" : "Pending"}
// //               </span>
// //               <span
// //                 className={`px-2 py-1 rounded-lg text-xs font-medium ${booking.payment.balance.paid
// //                   ? "bg-green-100 text-green-700"
// //                   : "bg-red-100 text-red-600"
// //                   }`}
// //               >
// //                 Balance: {booking.payment.balance.paid ? "Paid" : "Pending"}
// //               </span>

// //               {/* T&C Agreed Label */}
// //               {booking.termsAgreed && (
// //                 <span className="px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700">
// //                   T&C form submitted
// //                 </span>
// //               )}

// //               {/* Emergency Contact Badge */}
// //               {booking.emergencyContact && (
// //                 <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
// //                   Emergency: {booking.emergencyContact}
// //                 </span>
// //               )}
// //             </div>

// //             {category === "completed" && (
// //               <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 mt-2 inline-block">
// //                 Completed
// //               </span>
// //             )}
// //             {showPartialCancellation && (
// //               <span className="px-2 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-700 mt-2 inline-block">
// //                 Partial Cancellation Request
// //               </span>
// //             )}
// //             {isFullyRejected && (
// //               <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 mt-2 inline-block">
// //                 Rejected by Admin
// //               </span>
// //             )}
// //             {isFullyCancelled && (
// //               <span className="px-2 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700 mt-2 inline-block">
// //                 Fully Cancelled
// //               </span>
// //             )}

// //             <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm">
// //               <span className="text-gray-700 font-medium">
// //                 TNR:{" "}
// //                 <span className="font-bold tracking-wide">{displayRef}</span>
// //               </span>
// //               <button
// //                 onClick={(e) => {
// //                   e.stopPropagation();
// //                   handleCopyTNR(booking.tnr || booking._id);
// //                 }}
// //                 className="text-blue-600 hover:text-blue-800 transition-colors"
// //                 title="Copy TNR"
// //               >
// //                 <Copy size={16} />
// //               </button>
// //               <span className="text-gray-500">| {booking.bookingType}</span>
// //             </div>
// //           </div>

// //           <div className="flex items-center gap-2 mt-3 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
// //             {isFullyCancelled || isFullyRejected ? (
// //               <button
// //                 disabled
// //                 className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-gray-400 text-white rounded-lg cursor-not-allowed min-w-[120px] sm:min-w-[140px]"
// //               >
// //                 <CheckCircle size={16} />
// //                 Cancelled
// //               </button>
// //             ) : booking.isBookingCompleted ? (
// //               <button
// //                 disabled
// //                 className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-green-400 text-white rounded-lg cursor-not-allowed min-w-[120px] sm:min-w-[140px]"
// //               >
// //                 <CheckCircle size={16} />
// //                 Completed
// //               </button>
// //             ) : (
// //               <>
// //                 {booking.bookingType === "offline" && (
// //                   <>
// //                     {!booking.payment.advance.paid && (
// //                       <button
// //                         onClick={(e) => {
// //                           e.stopPropagation();
// //                           handleMarkAdvancePaid(booking.tnr, selectedTourId);
// //                         }}
// //                         className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 min-w-[120px] sm:min-w-[140px]"
// //                       >
// //                         <CheckCircle size={16} />
// //                         Mark Advance
// //                       </button>
// //                     )}
// //                     {booking.payment.advance.paid &&
// //                       !booking.payment.balance.paid && (
// //                         <button
// //                           onClick={(e) => {
// //                             e.stopPropagation();
// //                             handleMarkBalancePaid(booking.tnr, selectedTourId);
// //                           }}
// //                           className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 min-w-[120px] sm:min-w-[140px]"
// //                         >
// //                           <CheckCircle size={16} />
// //                           Mark Balance
// //                         </button>
// //                       )}
// //                   </>
// //                 )}
// //                 <button
// //                   onClick={(e) => {
// //                     e.stopPropagation();
// //                     handleCompleteBooking(booking.tnr, selectedTourId);
// //                   }}
// //                   className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 min-w-[120px] sm:min-w-[140px]"
// //                 >
// //                   <CheckCircle size={16} />
// //                   Mark Complete
// //                 </button>
// //               </>
// //             )}

// //             {/* ── Receipt/Invoice button — shows once advance is paid ── */}
// //             <ReceiptNavButton booking={booking} />

// //             {isExpanded ? (
// //               <ChevronUp className="text-gray-500 w-5 h-5" />
// //             ) : (
// //               <ChevronDown className="text-gray-500 w-5 h-5" />
// //             )}
// //           </div>
// //         </div>

// //         {isExpanded && (
// //           <div className="p-4 border-t bg-gray-50 text-xs sm:text-sm text-gray-700 space-y-4">
// //             <div>
// //               <p>
// //                 <strong>TNR / Reference:</strong>{" "}
// //                 <span className="font-mono font-bold">
// //                   {booking.tnr || "Not generated"}
// //                 </span>
// //               </p>
// //               <p>
// //                 <strong>Tour:</strong> {booking?.tourData?.title}
// //               </p>
// //               <p>
// //                 <strong>Date:</strong>{" "}
// //                 {new Date(booking.bookingDate).toLocaleDateString()}
// //               </p>
// //               <p>
// //                 <strong>Type:</strong> {booking.bookingType}
// //               </p>
// //             </div>

// //             <div>
// //               <h3 className="font-semibold text-gray-800">Contact</h3>
// //               <p>Email: {booking.contact?.email || "—"}</p>
// //               <p>Mobile: {booking.contact?.mobile || "—"}</p>

// //               {booking.emergencyContact && (
// //                 <p className="mt-1 text-blue-700 font-medium">
// //                   Emergency Contact: {booking.emergencyContact}
// //                 </p>
// //               )}

// //               <p className="mt-2">
// //                 <strong>T&C Agreed:</strong>{" "}
// //                 <span
// //                   className={
// //                     booking.termsAgreed
// //                       ? "text-green-600 font-medium"
// //                       : "text-red-600"
// //                   }
// //                 >
// //                   {booking.termsAgreed ? "Yes" : "No"}
// //                   {booking.termsAgreed && booking.termsAgreedAt && (
// //                     <>
// //                       {" "}
// //                       (on {new Date(booking.termsAgreedAt).toLocaleDateString()}
// //                       )
// //                     </>
// //                   )}
// //                 </span>
// //               </p>
// //             </div>

// //             {booking.billingAddress && (
// //               <div>
// //                 <h3 className="font-semibold text-gray-800">Billing Address</h3>
// //                 <p>{booking.billingAddress.addressLine1}</p>
// //                 {booking.billingAddress.addressLine2 && (
// //                   <p>{booking.billingAddress.addressLine2}</p>
// //                 )}
// //                 <p>
// //                   {booking.billingAddress.city}, {booking.billingAddress.state}{" "}
// //                   - {booking.billingAddress.pincode}
// //                 </p>
// //                 <p>{booking.billingAddress.country}</p>
// //               </div>
// //             )}

// //             {/* Admin Remarks */}
// //             <div className="bg-white p-4 rounded-lg border shadow-sm">
// //               <h3 className="font-semibold text-gray-800 mb-3">
// //                 Admin Remarks
// //               </h3>
// //               {booking.adminRemarks?.length > 0 ? (
// //                 <div className="space-y-3">
// //                   {booking.adminRemarks.map((remark, idx) => {
// //                     const amount = remark.amount || 0;
// //                     const isNegative = amount < 0;
// //                     const displayAmount =
// //                       amount !== 0 ? `₹${Math.abs(amount)}` : "—";

// //                     return (
// //                       <div
// //                         key={idx}
// //                         className={`p-3 rounded border ${isNegative
// //                           ? "bg-red-50 border-red-200"
// //                           : amount > 0
// //                             ? "bg-green-50 border-green-200"
// //                             : "bg-gray-50 border-gray-200"
// //                           }`}
// //                       >
// //                         <p className="text-sm">{remark.remark}</p>

// //                         <div className="flex items-center gap-2 mt-1">
// //                           <span
// //                             className={`text-xs font-medium px-2 py-0.5 rounded-full ${isNegative
// //                               ? "bg-red-100 text-red-700"
// //                               : amount > 0
// //                                 ? "bg-green-100 text-green-700"
// //                                 : "bg-gray-100 text-gray-600"
// //                               }`}
// //                           >
// //                             {isNegative
// //                               ? "Refund/Adjustment"
// //                               : amount > 0
// //                                 ? "Additional"
// //                                 : "No Amount"}
// //                           </span>

// //                           <span
// //                             className={`text-sm font-medium ${isNegative
// //                               ? "text-red-600"
// //                               : amount > 0
// //                                 ? "text-green-600"
// //                                 : "text-gray-600"
// //                               }`}
// //                           >
// //                             {amount !== 0 ? (isNegative ? "-" : "+") : ""}
// //                             {displayAmount}
// //                           </span>
// //                         </div>

// //                         <p className="text-xs text-gray-500 mt-1">
// //                           Added on:{" "}
// //                           {new Date(remark.addedAt).toLocaleDateString()}
// //                         </p>
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               ) : (
// //                 <p className="text-gray-500 italic">No admin remarks found</p>
// //               )}
// //             </div>

// //             {/* Advance Admin Remarks */}
// //             <div className="bg-white p-4 rounded-lg border shadow-sm">
// //               <h3 className="font-semibold text-gray-800 mb-3">
// //                 Advance Admin Remarks
// //               </h3>
// //               {booking.advanceAdminRemarks?.length > 0 ? (
// //                 <div className="space-y-3">
// //                   {booking.advanceAdminRemarks.map((remark, idx) => {
// //                     const amount = remark.amount || 0;
// //                     const isNegative = amount < 0;
// //                     const displayAmount =
// //                       amount !== 0 ? `₹${Math.abs(amount)}` : "—";

// //                     return (
// //                       <div
// //                         key={idx}
// //                         className={`p-3 rounded border ${isNegative
// //                           ? "bg-red-50 border-red-200"
// //                           : amount > 0
// //                             ? "bg-green-50 border-green-200"
// //                             : "bg-gray-50 border-gray-200"
// //                           }`}
// //                       >
// //                         <p className="text-sm">{remark.remark}</p>

// //                         <div className="flex items-center gap-2 mt-1">
// //                           <span
// //                             className={`text-xs font-medium px-2 py-0.5 rounded-full ${isNegative
// //                               ? "bg-red-100 text-red-700"
// //                               : amount > 0
// //                                 ? "bg-green-100 text-green-700"
// //                                 : "bg-gray-100 text-gray-600"
// //                               }`}
// //                           >
// //                             {isNegative
// //                               ? "Refund/Adjustment"
// //                               : amount > 0
// //                                 ? "Additional"
// //                                 : "No Amount"}
// //                           </span>

// //                           <span
// //                             className={`text-sm font-medium ${isNegative
// //                               ? "text-red-600"
// //                               : amount > 0
// //                                 ? "text-green-600"
// //                                 : "text-gray-600"
// //                               }`}
// //                           >
// //                             {amount !== 0 ? (isNegative ? "-" : "+") : ""}
// //                             {displayAmount}
// //                           </span>
// //                         </div>

// //                         <p className="text-xs text-gray-500 mt-1">
// //                           Added on:{" "}
// //                           {new Date(remark.addedAt).toLocaleDateString()}
// //                         </p>
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               ) : (
// //                 <p className="text-gray-500 italic">No advance remarks found</p>
// //               )}
// //             </div>

// //             {/* Travellers */}
// //             {booking.travellers.map((trav, idx) => {
// //               let status = null;
// //               if (trav.cancelled?.byTraveller && !trav.cancelled?.byAdmin) {
// //                 status = "Cancellation Requested";
// //               } else if (
// //                 trav.cancelled?.byAdmin &&
// //                 !trav.cancelled?.byTraveller
// //               ) {
// //                 status = "Rejected by Admin";
// //               } else if (
// //                 trav.cancelled?.byTraveller &&
// //                 trav.cancelled?.byAdmin
// //               ) {
// //                 status = "Cancelled";
// //               }

// //               // ── if/else — resolve addon display ──
// //               // NEW bookings: trav.selectedAddons is an array. Each entry
// //               // is EITHER a train-wise addon (carries trainIndex/trainNo/
// //               // trainName) OR a flight-wise addon (carries flightIndex/
// //               // flightNo/airline) — both kinds can be present in the same
// //               // array. OLD bookings: trav.selectedAddon is a flat single
// //               // object (unchanged, still handled below).
// //               let addonDisplay = null;

// //               if (Array.isArray(trav.selectedAddons) && trav.selectedAddons.length > 0) {
// //                 // ── NEW MODE: train-wise AND flight-wise addons, split
// //                 // into two clearly-labeled sections so it's obvious which
// //                 // is which even before reading the trip name. ──
// //                 const getTripTypeStyle = (tripType) => {
// //                   const t = (tripType || "").toUpperCase();
// //                   if (t.startsWith("BOARD")) {
// //                     return { badge: "bg-blue-100 text-blue-700", label: "Boarding" };
// //                   }
// //                   if (t.startsWith("MIDDLE")) {
// //                     return { badge: "bg-purple-100 text-purple-700", label: "Middle" };
// //                   }
// //                   if (t.startsWith("DEBOARD") || t.startsWith("DEBOARF")) {
// //                     return { badge: "bg-orange-100 text-orange-700", label: "Deboarding" };
// //                   }
// //                   return { badge: "bg-gray-100 text-gray-700", label: tripType || "Trip" };
// //                 };

// //                 // Distinguish train vs flight entry. Two different origins
// //                 // write addons in two different shapes:
// //                 //   - TourBooking.jsx (customer booking flow) → flight
// //                 //     entries carry `flightIndex`.
// //                 //   - ManageBooking.jsx (admin edit flow, approved via
// //                 //     Booking Approvals) → flight entries carry
// //                 //     `tripKind: "flight"` instead — NO flightIndex field
// //                 //     at all.
// //                 // Recognize BOTH shapes here, or a flight addon approved
// //                 // via Manage Booking silently falls into the train
// //                 // bucket and renders with a blank train name (exactly
// //                 // the "Deboarding : MAS TO DELHI" bug).
// //                 const isFlightAddon = (a) =>
// //                   (a.flightIndex !== undefined && a.flightIndex !== null) ||
// //                   a.tripKind === "flight";

// //                 const trainAddonEntries = trav.selectedAddons.filter(
// //                   (a) => !isFlightAddon(a),
// //                 );
// //                 const flightAddonEntries = trav.selectedAddons.filter(
// //                   (a) => isFlightAddon(a),
// //                 );

// //                 const renderAddonRow = (a, aIdx, isFlight) => {
// //                   const style = getTripTypeStyle(a.tripType);
// //                   const isNegative = Number(a.amount) < 0;
// //                   const tripLabel = isFlight
// //                     ? `${a.airline || ""}${a.flightNo ? ` (${a.flightNo})` : ""}`
// //                     : `${a.trainName || ""}${a.trainNo ? ` (${a.trainNo})` : ""}`;

// //                   return (
// //                     <div
// //                       key={aIdx}
// //                       className="flex flex-wrap items-center gap-2 text-sm"
// //                     >
// //                       <span
// //                         className={`px-2 py-0.5 rounded-full text-xs font-semibold ${style.badge}`}
// //                       >
// //                         {style.label}
// //                       </span>
// //                       <span className="text-gray-700">
// //                         {tripLabel}: {a.name}
// //                       </span>
// //                       <span
// //                         className={`font-semibold ${isNegative ? "text-red-600" : "text-green-700"
// //                           }`}
// //                       >
// //                         {Number(a.amount) >= 0 ? "+" : ""}₹{a.amount}
// //                       </span>
// //                     </div>
// //                   );
// //                 };

// //                 addonDisplay = (
// //                   <div className="mt-3 space-y-3">
// //                     {trainAddonEntries.length > 0 && (
// //                       <div>
// //                         <p className="text-sm font-bold text-red-600 mb-1.5 flex items-center gap-1.5">
// //                           <span>🚆</span> Train Addons
// //                         </p>
// //                         <div className="space-y-2">
// //                           {trainAddonEntries.map((a, aIdx) =>
// //                             renderAddonRow(a, aIdx, false),
// //                           )}
// //                         </div>
// //                       </div>
// //                     )}

// //                     {flightAddonEntries.length > 0 && (
// //                       <div>
// //                         <p className="text-sm font-bold text-orange-900 mb-1.5 flex items-center gap-1.5">
// //                           <span>✈️</span> Flight Addons
// //                         </p>
// //                         <div className="space-y-2">
// //                           {flightAddonEntries.map((a, aIdx) =>
// //                             renderAddonRow(a, aIdx, true),
// //                           )}
// //                         </div>
// //                       </div>
// //                     )}
// //                   </div>
// //                 );

// //               } else if (trav.selectedAddon?.name) {
// //                 // ── OLD MODE: single flat addon (unchanged) ──
// //                 addonDisplay = (
// //                   <p className="mt-2">
// //                     <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 mr-2">
// //                       Add-on
// //                     </span>
// //                     {trav.selectedAddon.name} (₹{trav.selectedAddon.price})
// //                   </p>
// //                 );
// //               }

// //               return (
// //                 <div
// //                   key={idx}
// //                   className="p-3 bg-white rounded-lg border shadow-sm"
// //                 >
// //                   <p className="font-medium">
// //                     {trav.title} {trav.firstName} {trav.lastName} ({trav.age}{" "}
// //                     yrs, {trav.gender})
// //                   </p>
// //                   <p>Package: {trav.packageType}</p>
// //                   <p>Sharing: {trav.sharingType}</p>
// //                   {trav.boardingPoint?.stationName && (
// //                     <p>
// //                       Boarding: {trav.boardingPoint.stationName} (
// //                       {trav.boardingPoint.stationCode})
// //                     </p>
// //                   )}
// //                   {trav.deboardingPoint?.stationName && (
// //                     <p>
// //                       Deboarding: {trav.deboardingPoint.stationName} (
// //                       {trav.deboardingPoint.stationCode})
// //                     </p>
// //                   )}

// //                   {/* ── forked addon display (new train+flight array vs old flat) ── */}
// //                   {addonDisplay}

// //                   {trav.remarks && (
// //                     <p className="italic text-gray-500">
// //                       Remarks: {trav.remarks}
// //                     </p>
// //                   )}
// //                   {status && (
// //                     <p className="text-red-600 font-medium">{status}</p>
// //                   )}
// //                 </div>
// //               );
// //             })}

// //             {booking.payment && (
// //               <div>
// //                 <h3 className="font-semibold text-gray-800">Payment</h3>
// //                 <p>
// //                   Advance: ₹{booking.payment.advance.amount} –{" "}
// //                   {booking.payment.advance.paid ? "Paid" : "Pending"}{" "}
// //                   {booking.payment.advance.paidAt &&
// //                     `(on ${new Date(booking.payment.advance.paidAt).toLocaleDateString()})`}
// //                 </p>
// //                 <p>
// //                   Balance: ₹{booking.payment.balance.amount} –{" "}
// //                   {booking.payment.balance.paid ? "Paid" : "Pending"}{" "}
// //                   {booking.payment.balance.paidAt &&
// //                     `(on ${new Date(booking.payment.balance.paidAt).toLocaleDateString()})`}
// //                 </p>
// //               </div>
// //             )}
// //           </div>
// //         )}
// //       </div>
// //     );
// //   };

// //   return (
// //     <div className="p-4 sm:p-6 max-w-7xl mx-auto">
// //       <ToastContainer position="top-right" autoClose={3000} />

// //       <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 pl-12 md:pl-0">
// //         Tour Bookings
// //       </h2>

// //       <div className="mb-4 sm:mb-6">
// //         <label
// //           htmlFor="tour-select"
// //           className="block text-sm font-medium text-gray-700 mb-1"
// //         >
// //           Select a Tour:
// //         </label>
// //         <select
// //           id="tour-select"
// //           value={selectedTourId}
// //           onChange={handleTourChange}
// //           className="mt-1 block w-full pl-3 pr-10 py-2 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
// //         >
// //           <option value="">-- Select a Tour --</option>
// //           {tourList.map((tour) => (
// //             <option key={tour._id} value={tour._id}>
// //               {tour.title}
// //             </option>
// //           ))}
// //         </select>
// //       </div>

// //       {selectedTourId && (
// //         <div className="mb-6 flex flex-col md:flex-row gap-4 md:gap-6">
// //           <div className="w-full md:w-1/4">
// //             <label className="block text-sm font-medium text-gray-700 mb-1">
// //               Payment Status
// //             </label>
// //             <select
// //               value={paymentFilter}
// //               onChange={(e) => setPaymentFilter(e.target.value)}
// //               className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
// //             >
// //               <option value="all">All</option>
// //               <option value="advancePaid">Advance Paid</option>
// //               <option value="advancePending">Advance Pending</option>
// //               <option value="balancePaid">Balance Paid</option>
// //               <option value="balancePending">Balance Pending</option>
// //             </select>
// //           </div>

// //           <div className="w-full md:w-1/4">
// //             <label className="block text-sm font-medium text-gray-700 mb-1">
// //               Booking Status
// //             </label>
// //             <select
// //               value={statusFilter}
// //               onChange={(e) => setStatusFilter(e.target.value)}
// //               className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
// //             >
// //               <option value="all">All</option>
// //               <option value="active">Active</option>
// //               <option value="completed">Completed</option>
// //               <option value="rejected">Rejected</option>
// //               <option value="cancelled">Cancelled</option>
// //             </select>
// //           </div>

// //           <div className="w-full md:w-1/4">
// //             <label className="block text-sm font-medium text-gray-700 mb-1">
// //               Traveller Name
// //             </label>
// //             <input
// //               type="text"
// //               value={travellerNameFilter}
// //               onChange={(e) => setTravellerNameFilter(e.target.value)}
// //               placeholder="Search by name..."
// //               className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
// //             />
// //           </div>

// //           <div className="w-full md:w-1/4">
// //             <label className="block text-sm font-medium text-gray-700 mb-1">
// //               TNR
// //             </label>
// //             <input
// //               type="text"
// //               value={tnrFilter}
// //               onChange={(e) => setTnrFilter(e.target.value.toUpperCase())}
// //               placeholder="e.g. KD74PX"
// //               className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md uppercase tracking-wider"
// //               maxLength={6}
// //             />
// //           </div>
// //         </div>
// //       )}

// //       {!selectedTourId ? (
// //         <div className="text-center text-gray-500 p-6">
// //           Please select a tour to view bookings.
// //         </div>
// //       ) : isLoadingBookings ? (
// //         <div className="text-center text-gray-500 p-6">Loading bookings...</div>
// //       ) : filteredBookings.length === 0 ? (
// //         <div className="text-center text-gray-500 p-6">
// //           {tnrFilter || travellerNameFilter
// //             ? "No matching bookings found for your search."
// //             : "No bookings found."}
// //         </div>
// //       ) : (
// //         <>
// //           {activeBookings.length > 0 && (
// //             <div className="space-y-4 mb-8">
// //               <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
// //                 Active Bookings
// //               </h3>
// //               {activeBookings.map((b) => renderBookingCard(b, "active"))}
// //             </div>
// //           )}

// //           {completedBookings.length > 0 && (
// //             <div className="space-y-4 mb-8">
// //               <h3 className="text-lg sm:text-xl font-semibold text-green-600 mb-4">
// //                 Completed Bookings
// //               </h3>
// //               {completedBookings.map((b) => renderBookingCard(b, "completed"))}
// //             </div>
// //           )}

// //           {cancellationRequestBookings.length > 0 && (
// //             <div className="space-y-4 mb-8">
// //               <h3 className="text-lg sm:text-xl font-semibold text-orange-600 mb-4">
// //                 Cancellation Requests
// //               </h3>
// //               {cancellationRequestBookings.map((b) =>
// //                 renderBookingCard(b, "cancellationRequest"),
// //               )}
// //             </div>
// //           )}

// //           {rejectedByAdminBookings.length > 0 && (
// //             <div className="space-y-4 mb-8">
// //               <h3 className="text-lg sm:text-xl font-semibold text-red-600 mb-4">
// //                 Rejected by Admin
// //               </h3>
// //               {rejectedByAdminBookings.map((b) =>
// //                 renderBookingCard(b, "rejected"),
// //               )}
// //             </div>
// //           )}

// //           {cancelledByTravellerBookings.length > 0 && (
// //             <div className="space-y-4">
// //               <h3 className="text-lg sm:text-xl font-semibold text-yellow-600 mb-4">
// //                 Cancelled Bookings
// //               </h3>
// //               {cancelledByTravellerBookings.map((b) =>
// //                 renderBookingCard(b, "cancelledByTraveller"),
// //               )}
// //             </div>
// //           )}
// //         </>
// //       )}

// //       {showConfirmLeave && (
// //         <div
// //           style={{
// //             position: "fixed",
// //             inset: 0,
// //             backgroundColor: "rgba(0,0,0,0.65)",
// //             display: "flex",
// //             alignItems: "center",
// //             justifyContent: "center",
// //             zIndex: 9999,
// //             padding: "16px",
// //           }}
// //         >
// //           <div
// //             style={{
// //               backgroundColor: "white",
// //               borderRadius: "12px",
// //               padding: "24px",
// //               maxWidth: "440px",
// //               width: "100%",
// //               textAlign: "center",
// //               boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
// //             }}
// //           >
// //             <h2
// //               style={{
// //                 fontSize: "1.5rem",
// //                 fontWeight: "bold",
// //                 marginBottom: "16px",
// //                 color: "#111827",
// //               }}
// //             >
// //               Leave this page?
// //             </h2>

// //             <p
// //               style={{
// //                 color: "#4b5563",
// //                 marginBottom: "24px",
// //                 lineHeight: "1.6",
// //               }}
// //             >
// //               You are currently viewing bookings for{" "}
// //               <strong>
// //                 {tourList.find((t) => t._id === selectedTourId)?.title ||
// //                   "this tour"}
// //               </strong>
// //               .<br />
// //               Leaving will clear the current bookings view.
// //               <br />
// //               Are you sure you want to leave?
// //             </p>

// //             <div
// //               style={{ display: "flex", gap: "16px", justifyContent: "center" }}
// //             >
// //               <button
// //                 onClick={handleCancelLeave}
// //                 style={{
// //                   padding: "12px 28px",
// //                   backgroundColor: "#e5e7eb",
// //                   color: "#1f2937",
// //                   borderRadius: "8px",
// //                   fontWeight: "600",
// //                   border: "none",
// //                   cursor: "pointer",
// //                 }}
// //               >
// //                 Cancel (Stay)
// //               </button>

// //               <button
// //                 onClick={handleConfirmLeave}
// //                 style={{
// //                   padding: "12px 28px",
// //                   backgroundColor: "#dc2626",
// //                   color: "white",
// //                   borderRadius: "8px",
// //                   fontWeight: "600",
// //                   border: "none",
// //                   cursor: "pointer",
// //                 }}
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

// // export default TourBookings;


// import React, { useState, useEffect, useContext, useCallback } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { TourContext } from "../../context/TourContext";
// import {
//   ChevronDown,
//   ChevronUp,
//   CheckCircle,
//   Copy,
//   Receipt as ReceiptIcon,
//   FileText,
// } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// // ═══════════════════════════════════════════════════════════════════════
// // Receipt/Invoice button — shown once booking.invoiceNumber exists (i.e.
// // once advance has been marked paid). Does NOT fetch or render any
// // invoice data itself — it just navigates to the standalone Invoice.jsx
// // page, which handles fetching + display + download on its own.
// // ═══════════════════════════════════════════════════════════════════════
// const ReceiptNavButton = ({ booking }) => {
//   const navigate = useNavigate();

//   if (!booking?.invoiceNumber) return null;

//   // booking.payment.balance.paid is already on the booking object
//   // client-side, so the label is correct instantly — no fetch needed here.
//   const isFullyPaid = booking.payment?.balance?.paid === true;
//   const docLabel = isFullyPaid ? "Invoice" : "Receipt";

//   return (
//     <button
//       onClick={(e) => {
//         e.stopPropagation();
//         navigate(`/invoice/${booking.tnr}`);
//       }}
//       className={`flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm rounded-lg text-white min-w-[120px] sm:min-w-[140px] ${isFullyPaid
//         ? "bg-emerald-600 hover:bg-emerald-700"
//         : "bg-cyan-600 hover:bg-cyan-700"
//         }`}
//     >
//       {isFullyPaid ? <FileText size={16} /> : <ReceiptIcon size={16} />}
//       {docLabel}
//     </button>
//   );
// };

// // ═══════════════════════════════════════════════════════════════════════
// // Main TourBookings page
// // ═══════════════════════════════════════════════════════════════════════
// const TourBookings = () => {
//   const {
//     tourList,
//     getTourList,
//     bookings,
//     getBookings,
//     markAdvancePaid,
//     markBalancePaid,
//     completeBooking,
//     ttoken,
//   } = useContext(TourContext);

//   const [expanded, setExpanded] = useState(null);
//   const [selectedTourId, setSelectedTourId] = useState("");
//   const [isLoadingBookings, setIsLoadingBookings] = useState(false);
//   const [paymentFilter, setPaymentFilter] = useState("all");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [travellerNameFilter, setTravellerNameFilter] = useState("");
//   const [tnrFilter, setTnrFilter] = useState("");
//   const [showConfirmLeave, setShowConfirmLeave] = useState(false);

//   const shouldProtect = Boolean(
//     selectedTourId && !isLoadingBookings && bookings && bookings.length > 0,
//   );

//   const location = useLocation();

//   useEffect(() => {
//     if (!shouldProtect) return;

//     const handleBeforeUnload = (e) => {
//       e.preventDefault();
//       e.returnValue = "";
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);

//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//     };
//   }, [shouldProtect]);

//   useEffect(() => {
//     if (!shouldProtect) return;

//     window.history.pushState(null, null, window.location.href);

//     const handlePopState = () => {
//       setShowConfirmLeave(true);
//     };

//     window.addEventListener("popstate", handlePopState);

//     return () => {
//       window.removeEventListener("popstate", handlePopState);
//     };
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
//     if (ttoken) {
//       getTourList();
//     }
//   }, [ttoken, getTourList]);

//   useEffect(() => {
//     if (ttoken && selectedTourId) {
//       setIsLoadingBookings(true);
//       getBookings(selectedTourId)
//         .then((response) => {
//           if (
//             response &&
//             typeof response === "object" &&
//             "success" in response
//           ) {
//             if (response.success) {
//               toast.success("Bookings fetched successfully");
//             } else {
//               toast.error(response.message || "Failed to fetch bookings");
//             }
//           } else {
//             toast.error("Invalid response from server");
//           }
//         })
//         .catch((error) => {
//           console.error("getBookings error:", error);
//           toast.error(
//             error.response?.data?.message ||
//             error.message ||
//             "Failed to fetch bookings",
//           );
//         })
//         .finally(() => {
//           setIsLoadingBookings(false);
//         });
//     } else {
//       setIsLoadingBookings(false);
//     }
//   }, [ttoken, selectedTourId, getBookings]);

//   useEffect(() => {
//     return () => {
//       toast.dismiss();
//     };
//   }, [location]);

//   const toggleExpand = (id) => {
//     setExpanded(expanded === id ? null : id);
//   };

//   const handleTourChange = (e) => {
//     setSelectedTourId(e.target.value);
//     setPaymentFilter("all");
//     setStatusFilter("all");
//     setTravellerNameFilter("");
//     setTnrFilter("");
//   };

//   const handleApiResponse = useCallback(
//     (response, successMessage) => {
//       console.log("API Response:", response);
//       if (response && typeof response === "object" && "success" in response) {
//         if (response.success) {
//           toast.success(successMessage || "Operation completed successfully");
//           if (selectedTourId) {
//             getBookings(selectedTourId);
//           }
//         } else {
//           toast.error(response.message || "An error occurred");
//         }
//       } else {
//         toast.error("Invalid response from server");
//       }
//     },
//     [selectedTourId, getBookings],
//   );

//   const handleMarkAdvancePaid = async (tnr, tourId) => {
//     if (!tnr) {
//       toast.error("Cannot mark advance – TNR is missing");
//       return;
//     }

//     if (!window.confirm("Are you sure you want to mark Advance as PAID?"))
//       return;

//     try {
//       const response = await markAdvancePaid(tnr, tourId);
//       handleApiResponse(response, "Advance payment marked successfully");
//     } catch (error) {
//       console.error("markAdvancePaid error:", error);
//       toast.error(
//         "Failed to mark advance: " + (error.message || "Unknown error"),
//       );
//     }
//   };

//   const handleMarkBalancePaid = async (tnr, tourId) => {
//     if (!tourId) {
//       toast.error("Please select a tour first.");
//       return;
//     }
//     if (!tnr) {
//       toast.error("Cannot mark balance – TNR is missing");
//       return;
//     }

//     if (!window.confirm("Are you sure you want to mark Balance as PAID?"))
//       return;

//     try {
//       const response = await markBalancePaid(tnr, tourId);
//       handleApiResponse(response, "Balance payment marked successfully");
//     } catch (error) {
//       console.error("markBalancePaid error:", error);
//       toast.error(
//         "Failed to mark balance: " + (error.message || "Unknown error"),
//       );
//     }
//   };

//   const handleCompleteBooking = async (tnr, tourId) => {
//     if (!tnr) {
//       toast.error("Cannot complete booking – TNR is missing");
//       return;
//     }

//     if (
//       !window.confirm(
//         "Mark this booking as completed? This action cannot be undone easily.",
//       )
//     ) {
//       return;
//     }

//     try {
//       const response = await completeBooking(tnr, tourId);
//       handleApiResponse(response, "Booking completed successfully");
//     } catch (error) {
//       console.error("completeBooking error:", error);
//       toast.error("Failed to complete: " + (error.message || "Unknown error"));
//     }
//   };

//   const handleCopyTNR = (text) => {
//     if (!text) {
//       toast.error("Nothing to copy");
//       return;
//     }
//     navigator.clipboard
//       .writeText(text)
//       .then(() => toast.success("Copied!"))
//       .catch(() => toast.error("Failed to copy"));
//   };

//   // === HELPER FUNCTIONS ===
//   const areAllTravellersCancelled = (booking) =>
//     booking.travellers.length > 0 &&
//     booking.travellers.every(
//       (t) => t.cancelled?.byTraveller && t.cancelled?.byAdmin,
//     );

//   const areAllTravellersRejected = (booking) =>
//     booking.travellers.length > 0 &&
//     booking.travellers.every(
//       (t) => t.cancelled?.byAdmin && !t.cancelled?.byTraveller,
//     );

//   const hasCancellationRequest = (booking) =>
//     booking.travellers.some(
//       (t) => t.cancelled?.byTraveller && !t.cancelled?.byAdmin,
//     ) && !areAllTravellersCancelled(booking);

//   const hasActiveTraveller = (booking) =>
//     booking.travellers.some(
//       (t) => !(t.cancelled?.byTraveller || t.cancelled?.byAdmin),
//     );

//   // === FILTER BOOKINGS ===
//   const filteredBookings = bookings.filter((booking) => {
//     const firstTraveller = booking.travellers[0] || {};
//     const displayName =
//       `${firstTraveller.firstName || ""} ${firstTraveller.lastName || ""}`.trim();

//     let paymentMatch = true;
//     if (paymentFilter !== "all") {
//       if (paymentFilter === "advancePaid" && !booking.payment.advance.paid)
//         paymentMatch = false;
//       else if (
//         paymentFilter === "advancePending" &&
//         booking.payment.advance.paid
//       )
//         paymentMatch = false;
//       else if (paymentFilter === "balancePaid" && !booking.payment.balance.paid)
//         paymentMatch = false;
//       else if (
//         paymentFilter === "balancePending" &&
//         booking.payment.balance.paid
//       )
//         paymentMatch = false;
//     }

//     let statusMatch = true;
//     if (statusFilter !== "all") {
//       const allCancelled = areAllTravellersCancelled(booking);
//       const allRejected = areAllTravellersRejected(booking);
//       const hasActive = hasActiveTraveller(booking);

//       if (statusFilter === "active")
//         statusMatch = !booking.isBookingCompleted && hasActive;
//       else if (statusFilter === "completed")
//         statusMatch = booking.isBookingCompleted && hasActive;
//       else if (statusFilter === "rejected") statusMatch = allRejected;
//       else if (statusFilter === "cancelled") statusMatch = allCancelled;
//     }

//     let nameMatch = true;
//     if (travellerNameFilter) {
//       nameMatch = displayName
//         .toLowerCase()
//         .includes(travellerNameFilter.toLowerCase());
//     }

//     let tnrMatch = true;
//     if (tnrFilter.trim()) {
//       const searchTnr = tnrFilter.trim().toUpperCase();
//       tnrMatch = booking.tnr?.toUpperCase().includes(searchTnr);
//     }

//     return paymentMatch && statusMatch && nameMatch && tnrMatch;
//   });

//   // === CATEGORIZE BOOKINGS ===
//   const activeBookings = filteredBookings
//     .filter((b) => !b.isBookingCompleted && hasActiveTraveller(b))
//     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

//   const completedBookings = filteredBookings
//     .filter((b) => b.isBookingCompleted && hasActiveTraveller(b))
//     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

//   const cancellationRequestBookings = filteredBookings
//     .filter(hasCancellationRequest)
//     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

//   const rejectedByAdminBookings = filteredBookings
//     .filter(areAllTravellersRejected)
//     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

//   const cancelledByTravellerBookings = filteredBookings
//     .filter(areAllTravellersCancelled)
//     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

//   // === RENDER CARD ===
//   const renderBookingCard = (booking, category) => {
//     const isExpanded = expanded === booking._id;
//     const firstTraveller = booking.travellers[0] || {};
//     const displayName =
//       `${firstTraveller.firstName || ""} ${firstTraveller.lastName || ""}`.trim() ||
//       "Unknown Traveller";

//     const showPartialCancellation = hasCancellationRequest(booking);
//     const isFullyCancelled = areAllTravellersCancelled(booking);
//     const isFullyRejected = areAllTravellersRejected(booking);

//     const displayRef = booking.tnr || `...${booking._id?.slice(-8) || ""}`;

//     return (
//       <div
//         key={booking._id}
//         className="bg-white rounded-2xl shadow border overflow-hidden w-full sm:max-w-4xl mx-auto"
//       >
//         <div
//           className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 cursor-pointer hover:bg-gray-50"
//           onClick={() => toggleExpand(booking._id)}
//         >
//           <div className="w-full sm:w-auto">
//             <p className="font-semibold text-base sm:text-lg">
//               <strong>{displayName}</strong>
//             </p>
//             <p className="text-xs sm:text-sm text-gray-600 truncate">
//               {booking.userId?.email || "No email"} |{" "}
//               {booking.contact?.mobile || "No phone"}
//             </p>

//             <div className="mt-2 flex flex-wrap gap-2 text-xs sm:text-sm">
//               <span
//                 className={`px-2 py-1 rounded-lg text-xs font-medium ${booking.payment.advance.paid
//                   ? "bg-green-100 text-green-700"
//                   : "bg-red-100 text-red-600"
//                   }`}
//               >
//                 Advance: {booking.payment.advance.paid ? "Paid" : "Pending"}
//               </span>
//               <span
//                 className={`px-2 py-1 rounded-lg text-xs font-medium ${booking.payment.balance.paid
//                   ? "bg-green-100 text-green-700"
//                   : "bg-red-100 text-red-600"
//                   }`}
//               >
//                 Balance: {booking.payment.balance.paid ? "Paid" : "Pending"}
//               </span>

//               {/* T&C Agreed Label */}
//               {booking.termsAgreed && (
//                 <span className="px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700">
//                   T&C form submitted
//                 </span>
//               )}

//               {/* Emergency Contact Badge */}
//               {booking.emergencyContact && (
//                 <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
//                   Emergency: {booking.emergencyContact}
//                 </span>
//               )}
//             </div>

//             {category === "completed" && (
//               <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 mt-2 inline-block">
//                 Completed
//               </span>
//             )}
//             {showPartialCancellation && (
//               <span className="px-2 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-700 mt-2 inline-block">
//                 Partial Cancellation Request
//               </span>
//             )}
//             {isFullyRejected && (
//               <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 mt-2 inline-block">
//                 Rejected by Admin
//               </span>
//             )}
//             {isFullyCancelled && (
//               <span className="px-2 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700 mt-2 inline-block">
//                 Fully Cancelled
//               </span>
//             )}

//             <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm">
//               <span className="text-gray-700 font-medium">
//                 TNR:{" "}
//                 <span className="font-bold tracking-wide">{displayRef}</span>
//               </span>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleCopyTNR(booking.tnr || booking._id);
//                 }}
//                 className="text-blue-600 hover:text-blue-800 transition-colors"
//                 title="Copy TNR"
//               >
//                 <Copy size={16} />
//               </button>
//               <span className="text-gray-500">| {booking.bookingType}</span>
//             </div>
//           </div>

//           <div className="flex items-center gap-2 mt-3 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
//             {isFullyCancelled || isFullyRejected ? (
//               <button
//                 disabled
//                 className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-gray-400 text-white rounded-lg cursor-not-allowed min-w-[120px] sm:min-w-[140px]"
//               >
//                 <CheckCircle size={16} />
//                 Cancelled
//               </button>
//             ) : booking.isBookingCompleted ? (
//               <button
//                 disabled
//                 className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-green-400 text-white rounded-lg cursor-not-allowed min-w-[120px] sm:min-w-[140px]"
//               >
//                 <CheckCircle size={16} />
//                 Completed
//               </button>
//             ) : (
//               <>
//                 {booking.bookingType === "offline" && (
//                   <>
//                     {!booking.payment.advance.paid && (
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleMarkAdvancePaid(booking.tnr, selectedTourId);
//                         }}
//                         className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 min-w-[120px] sm:min-w-[140px]"
//                       >
//                         <CheckCircle size={16} />
//                         Mark Advance
//                       </button>
//                     )}
//                     {booking.payment.advance.paid &&
//                       !booking.payment.balance.paid && (
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleMarkBalancePaid(booking.tnr, selectedTourId);
//                           }}
//                           className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 min-w-[120px] sm:min-w-[140px]"
//                         >
//                           <CheckCircle size={16} />
//                           Mark Balance
//                         </button>
//                       )}
//                   </>
//                 )}
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleCompleteBooking(booking.tnr, selectedTourId);
//                   }}
//                   className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 min-w-[120px] sm:min-w-[140px]"
//                 >
//                   <CheckCircle size={16} />
//                   Mark Complete
//                 </button>
//               </>
//             )}

//             {/* ── Receipt/Invoice button — shows once advance is paid ── */}
//             <ReceiptNavButton booking={booking} />

//             {isExpanded ? (
//               <ChevronUp className="text-gray-500 w-5 h-5" />
//             ) : (
//               <ChevronDown className="text-gray-500 w-5 h-5" />
//             )}
//           </div>
//         </div>

//         {isExpanded && (
//           <div className="p-4 border-t bg-gray-50 text-xs sm:text-sm text-gray-700 space-y-4">
//             <div>
//               <p>
//                 <strong>TNR / Reference:</strong>{" "}
//                 <span className="font-mono font-bold">
//                   {booking.tnr || "Not generated"}
//                 </span>
//               </p>
//               <p>
//                 <strong>Tour:</strong> {booking?.tourData?.title}
//               </p>
//               <p>
//                 <strong>Date:</strong>{" "}
//                 {new Date(booking.bookingDate).toLocaleDateString()}
//               </p>
//               <p>
//                 <strong>Type:</strong> {booking.bookingType}
//               </p>
//             </div>

//             <div>
//               <h3 className="font-semibold text-gray-800">Contact</h3>
//               <p>Email: {booking.contact?.email || "—"}</p>
//               <p>Mobile: {booking.contact?.mobile || "—"}</p>

//               {booking.emergencyContact && (
//                 <p className="mt-1 text-blue-700 font-medium">
//                   Emergency Contact: {booking.emergencyContact}
//                 </p>
//               )}

//               <p className="mt-2">
//                 <strong>T&C Agreed:</strong>{" "}
//                 <span
//                   className={
//                     booking.termsAgreed
//                       ? "text-green-600 font-medium"
//                       : "text-red-600"
//                   }
//                 >
//                   {booking.termsAgreed ? "Yes" : "No"}
//                   {booking.termsAgreed && booking.termsAgreedAt && (
//                     <>
//                       {" "}
//                       (on {new Date(booking.termsAgreedAt).toLocaleDateString()}
//                       )
//                     </>
//                   )}
//                 </span>
//               </p>
//             </div>

//             {booking.billingAddress && (
//               <div>
//                 <h3 className="font-semibold text-gray-800">Billing Address</h3>
//                 <p>{booking.billingAddress.addressLine1}</p>
//                 {booking.billingAddress.addressLine2 && (
//                   <p>{booking.billingAddress.addressLine2}</p>
//                 )}
//                 <p>
//                   {booking.billingAddress.city}, {booking.billingAddress.state}{" "}
//                   - {booking.billingAddress.pincode}
//                 </p>
//                 <p>{booking.billingAddress.country}</p>
//               </div>
//             )}

//             {/* Admin Remarks */}
//             <div className="bg-white p-4 rounded-lg border shadow-sm">
//               <h3 className="font-semibold text-gray-800 mb-3">
//                 Admin Remarks
//               </h3>
//               {booking.adminRemarks?.length > 0 ? (
//                 <div className="space-y-3">
//                   {booking.adminRemarks.map((remark, idx) => {
//                     const amount = remark.amount || 0;
//                     const isNegative = amount < 0;
//                     const displayAmount =
//                       amount !== 0 ? `₹${Math.abs(amount)}` : "—";

//                     return (
//                       <div
//                         key={idx}
//                         className={`p-3 rounded border ${isNegative
//                           ? "bg-red-50 border-red-200"
//                           : amount > 0
//                             ? "bg-green-50 border-green-200"
//                             : "bg-gray-50 border-gray-200"
//                           }`}
//                       >
//                         <p className="text-sm">{remark.remark}</p>

//                         <div className="flex items-center gap-2 mt-1">
//                           <span
//                             className={`text-xs font-medium px-2 py-0.5 rounded-full ${isNegative
//                               ? "bg-red-100 text-red-700"
//                               : amount > 0
//                                 ? "bg-green-100 text-green-700"
//                                 : "bg-gray-100 text-gray-600"
//                               }`}
//                           >
//                             {isNegative
//                               ? "Refund/Adjustment"
//                               : amount > 0
//                                 ? "Additional"
//                                 : "No Amount"}
//                           </span>

//                           <span
//                             className={`text-sm font-medium ${isNegative
//                               ? "text-red-600"
//                               : amount > 0
//                                 ? "text-green-600"
//                                 : "text-gray-600"
//                               }`}
//                           >
//                             {amount !== 0 ? (isNegative ? "-" : "+") : ""}
//                             {displayAmount}
//                           </span>
//                         </div>

//                         <p className="text-xs text-gray-500 mt-1">
//                           Added on:{" "}
//                           {new Date(remark.addedAt).toLocaleDateString()}
//                         </p>
//                       </div>
//                     );
//                   })}
//                 </div>
//               ) : (
//                 <p className="text-gray-500 italic">No admin remarks found</p>
//               )}
//             </div>

//             {/* Advance Admin Remarks */}
//             <div className="bg-white p-4 rounded-lg border shadow-sm">
//               <h3 className="font-semibold text-gray-800 mb-3">
//                 Advance Admin Remarks
//               </h3>
//               {booking.advanceAdminRemarks?.length > 0 ? (
//                 <div className="space-y-3">
//                   {booking.advanceAdminRemarks.map((remark, idx) => {
//                     const amount = remark.amount || 0;
//                     const isNegative = amount < 0;
//                     const displayAmount =
//                       amount !== 0 ? `₹${Math.abs(amount)}` : "—";

//                     return (
//                       <div
//                         key={idx}
//                         className={`p-3 rounded border ${isNegative
//                           ? "bg-red-50 border-red-200"
//                           : amount > 0
//                             ? "bg-green-50 border-green-200"
//                             : "bg-gray-50 border-gray-200"
//                           }`}
//                       >
//                         <p className="text-sm">{remark.remark}</p>

//                         <div className="flex items-center gap-2 mt-1">
//                           <span
//                             className={`text-xs font-medium px-2 py-0.5 rounded-full ${isNegative
//                               ? "bg-red-100 text-red-700"
//                               : amount > 0
//                                 ? "bg-green-100 text-green-700"
//                                 : "bg-gray-100 text-gray-600"
//                               }`}
//                           >
//                             {isNegative
//                               ? "Refund/Adjustment"
//                               : amount > 0
//                                 ? "Additional"
//                                 : "No Amount"}
//                           </span>

//                           <span
//                             className={`text-sm font-medium ${isNegative
//                               ? "text-red-600"
//                               : amount > 0
//                                 ? "text-green-600"
//                                 : "text-gray-600"
//                               }`}
//                           >
//                             {amount !== 0 ? (isNegative ? "-" : "+") : ""}
//                             {displayAmount}
//                           </span>
//                         </div>

//                         <p className="text-xs text-gray-500 mt-1">
//                           Added on:{" "}
//                           {new Date(remark.addedAt).toLocaleDateString()}
//                         </p>
//                       </div>
//                     );
//                   })}
//                 </div>
//               ) : (
//                 <p className="text-gray-500 italic">No advance remarks found</p>
//               )}
//             </div>

//             {/* Travellers */}
//             {booking.travellers.map((trav, idx) => {
//               let status = null;
//               if (trav.cancelled?.byTraveller && !trav.cancelled?.byAdmin) {
//                 status = "Cancellation Requested";
//               } else if (
//                 trav.cancelled?.byAdmin &&
//                 !trav.cancelled?.byTraveller
//               ) {
//                 status = "Rejected by Admin";
//               } else if (
//                 trav.cancelled?.byTraveller &&
//                 trav.cancelled?.byAdmin
//               ) {
//                 status = "Cancelled";
//               }

//               // ── if/else — resolve addon display ──
//               // NEW bookings: trav.selectedAddons is an array. Each entry
//               // is EITHER a train-wise addon (carries trainIndex/trainNo/
//               // trainName) OR a flight-wise addon (carries flightIndex/
//               // flightNo/airline) — both kinds can be present in the same
//               // array. OLD bookings: trav.selectedAddon is a flat single
//               // object (unchanged, still handled below).
//               let addonDisplay = null;

//               if (Array.isArray(trav.selectedAddons) && trav.selectedAddons.length > 0) {
//                 // ── NEW MODE: train-wise AND flight-wise addons, split
//                 // into two clearly-labeled sections so it's obvious which
//                 // is which even before reading the trip name. ──
//                 const getTripTypeStyle = (tripType) => {
//                   const t = (tripType || "").toUpperCase();
//                   if (t.startsWith("BOARD")) {
//                     return { badge: "bg-blue-100 text-blue-700", label: "Boarding" };
//                   }
//                   if (t.startsWith("MIDDLE")) {
//                     return { badge: "bg-purple-100 text-purple-700", label: "Middle" };
//                   }
//                   if (t.startsWith("DEBOARD") || t.startsWith("DEBOARF")) {
//                     return { badge: "bg-orange-100 text-orange-700", label: "Deboarding" };
//                   }
//                   return { badge: "bg-gray-100 text-gray-700", label: tripType || "Trip" };
//                 };

//                 // Distinguish train vs flight entry. Different origins
//                 // write addons in different shapes:
//                 //   - TourBooking.jsx (customer booking flow) → flight
//                 //     entries carry `flightIndex`.
//                 //   - ManageBooking.jsx (admin edit flow, approved via
//                 //     Booking Approvals) → flight entries carry
//                 //     `tripKind: "flight"` instead.
//                 //   - Older / manually-saved entries may carry NEITHER
//                 //     flightIndex nor tripKind, but DO still carry
//                 //     flightNo/airline (or trainNo/trainName). Checking
//                 //     flightIndex/tripKind alone silently drops these
//                 //     into the train bucket with blank train fields —
//                 //     exactly the "Deboarding : DEL TO MAS" blank-name
//                 //     bug. So the actual identifying fields (flightNo/
//                 //     airline vs trainNo/trainName) are checked FIRST,
//                 //     falling back to flightIndex/tripKind only when
//                 //     neither set of fields is present at all.
//                 const isFlightAddon = (a) => {
//                   if (a.flightNo || a.airline) return true;
//                   if (a.trainNo || a.trainName) return false;
//                   return (
//                     (a.flightIndex !== undefined && a.flightIndex !== null) ||
//                     a.tripKind === "flight"
//                   );
//                 };

//                 const trainAddonEntries = trav.selectedAddons.filter(
//                   (a) => !isFlightAddon(a),
//                 );
//                 const flightAddonEntries = trav.selectedAddons.filter(
//                   (a) => isFlightAddon(a),
//                 );

//                 const renderAddonRow = (a, aIdx, isFlight) => {
//                   const style = getTripTypeStyle(a.tripType);
//                   const isNegative = Number(a.amount) < 0;
//                   // Build the "Name (Code)" label only from fields that
//                   // actually have a value — if BOTH are empty (data gap),
//                   // omit the label + colon entirely instead of rendering
//                   // a bare ": name".
//                   const primary = isFlight ? a.airline : a.trainName;
//                   const secondary = isFlight ? a.flightNo : a.trainNo;
//                   const tripLabel = primary && secondary
//                     ? `${primary} (${secondary})`
//                     : primary || secondary || null;

//                   return (
//                     <div
//                       key={aIdx}
//                       className="flex flex-wrap items-center gap-2 text-sm"
//                     >
//                       <span
//                         className={`px-2 py-0.5 rounded-full text-xs font-semibold ${style.badge}`}
//                       >
//                         {style.label}
//                       </span>
//                       <span className="text-gray-700">
//                         {tripLabel ? `${tripLabel}: ` : ""}
//                         {a.name}
//                       </span>
//                       <span
//                         className={`font-semibold ${isNegative ? "text-red-600" : "text-green-700"
//                           }`}
//                       >
//                         {Number(a.amount) >= 0 ? "+" : ""}₹{a.amount}
//                       </span>
//                     </div>
//                   );
//                 };

//                 addonDisplay = (
//                   <div className="mt-3 space-y-3">
//                     {trainAddonEntries.length > 0 && (
//                       <div>
//                         <p className="text-sm font-bold text-red-600 mb-1.5 flex items-center gap-1.5">
//                           <span>🚆</span> Train Addons
//                         </p>
//                         <div className="space-y-2">
//                           {trainAddonEntries.map((a, aIdx) =>
//                             renderAddonRow(a, aIdx, false),
//                           )}
//                         </div>
//                       </div>
//                     )}

//                     {flightAddonEntries.length > 0 && (
//                       <div>
//                         <p className="text-sm font-bold text-orange-900 mb-1.5 flex items-center gap-1.5">
//                           <span>✈️</span> Flight Addons
//                         </p>
//                         <div className="space-y-2">
//                           {flightAddonEntries.map((a, aIdx) =>
//                             renderAddonRow(a, aIdx, true),
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 );

//               } else if (trav.selectedAddon?.name) {
//                 // ── OLD MODE: single flat addon (unchanged) ──
//                 addonDisplay = (
//                   <p className="mt-2">
//                     <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 mr-2">
//                       Add-on
//                     </span>
//                     {trav.selectedAddon.name} (₹{trav.selectedAddon.price})
//                   </p>
//                 );
//               }

//               return (
//                 <div
//                   key={idx}
//                   className="p-3 bg-white rounded-lg border shadow-sm"
//                 >
//                   <p className="font-medium">
//                     {trav.title} {trav.firstName} {trav.lastName} ({trav.age}{" "}
//                     yrs, {trav.gender})
//                   </p>
//                   <p>Package: {trav.packageType}</p>
//                   <p>Sharing: {trav.sharingType}</p>
//                   {trav.boardingPoint?.stationName && (
//                     <p>
//                       Boarding: {trav.boardingPoint.stationName} (
//                       {trav.boardingPoint.stationCode})
//                     </p>
//                   )}
//                   {trav.deboardingPoint?.stationName && (
//                     <p>
//                       Deboarding: {trav.deboardingPoint.stationName} (
//                       {trav.deboardingPoint.stationCode})
//                     </p>
//                   )}

//                   {/* ── forked addon display (new train+flight array vs old flat) ── */}
//                   {addonDisplay}

//                   {trav.remarks && (
//                     <p className="italic text-gray-500">
//                       Remarks: {trav.remarks}
//                     </p>
//                   )}
//                   {status && (
//                     <p className="text-red-600 font-medium">{status}</p>
//                   )}
//                 </div>
//               );
//             })}

//             {booking.payment && (
//               <div>
//                 <h3 className="font-semibold text-gray-800">Payment</h3>
//                 <p>
//                   Advance: ₹{booking.payment.advance.amount} –{" "}
//                   {booking.payment.advance.paid ? "Paid" : "Pending"}{" "}
//                   {booking.payment.advance.paidAt &&
//                     `(on ${new Date(booking.payment.advance.paidAt).toLocaleDateString()})`}
//                 </p>
//                 <p>
//                   Balance: ₹{booking.payment.balance.amount} –{" "}
//                   {booking.payment.balance.paid ? "Paid" : "Pending"}{" "}
//                   {booking.payment.balance.paidAt &&
//                     `(on ${new Date(booking.payment.balance.paidAt).toLocaleDateString()})`}
//                 </p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="p-4 sm:p-6 max-w-7xl mx-auto">
//       <ToastContainer position="top-right" autoClose={3000} />

//       <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 pl-12 md:pl-0">
//         Tour Bookings
//       </h2>

//       <div className="mb-4 sm:mb-6">
//         <label
//           htmlFor="tour-select"
//           className="block text-sm font-medium text-gray-700 mb-1"
//         >
//           Select a Tour:
//         </label>
//         <select
//           id="tour-select"
//           value={selectedTourId}
//           onChange={handleTourChange}
//           className="mt-1 block w-full pl-3 pr-10 py-2 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
//         >
//           <option value="">-- Select a Tour --</option>
//           {tourList.map((tour) => (
//             <option key={tour._id} value={tour._id}>
//               {tour.title}
//             </option>
//           ))}
//         </select>
//       </div>

//       {selectedTourId && (
//         <div className="mb-6 flex flex-col md:flex-row gap-4 md:gap-6">
//           <div className="w-full md:w-1/4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Payment Status
//             </label>
//             <select
//               value={paymentFilter}
//               onChange={(e) => setPaymentFilter(e.target.value)}
//               className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
//             >
//               <option value="all">All</option>
//               <option value="advancePaid">Advance Paid</option>
//               <option value="advancePending">Advance Pending</option>
//               <option value="balancePaid">Balance Paid</option>
//               <option value="balancePending">Balance Pending</option>
//             </select>
//           </div>

//           <div className="w-full md:w-1/4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Booking Status
//             </label>
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
//             >
//               <option value="all">All</option>
//               <option value="active">Active</option>
//               <option value="completed">Completed</option>
//               <option value="rejected">Rejected</option>
//               <option value="cancelled">Cancelled</option>
//             </select>
//           </div>

//           <div className="w-full md:w-1/4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Traveller Name
//             </label>
//             <input
//               type="text"
//               value={travellerNameFilter}
//               onChange={(e) => setTravellerNameFilter(e.target.value)}
//               placeholder="Search by name..."
//               className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
//             />
//           </div>

//           <div className="w-full md:w-1/4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               TNR
//             </label>
//             <input
//               type="text"
//               value={tnrFilter}
//               onChange={(e) => setTnrFilter(e.target.value.toUpperCase())}
//               placeholder="e.g. KD74PX"
//               className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md uppercase tracking-wider"
//               maxLength={6}
//             />
//           </div>
//         </div>
//       )}

//       {!selectedTourId ? (
//         <div className="text-center text-gray-500 p-6">
//           Please select a tour to view bookings.
//         </div>
//       ) : isLoadingBookings ? (
//         <div className="text-center text-gray-500 p-6">Loading bookings...</div>
//       ) : filteredBookings.length === 0 ? (
//         <div className="text-center text-gray-500 p-6">
//           {tnrFilter || travellerNameFilter
//             ? "No matching bookings found for your search."
//             : "No bookings found."}
//         </div>
//       ) : (
//         <>
//           {activeBookings.length > 0 && (
//             <div className="space-y-4 mb-8">
//               <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
//                 Active Bookings
//               </h3>
//               {activeBookings.map((b) => renderBookingCard(b, "active"))}
//             </div>
//           )}

//           {completedBookings.length > 0 && (
//             <div className="space-y-4 mb-8">
//               <h3 className="text-lg sm:text-xl font-semibold text-green-600 mb-4">
//                 Completed Bookings
//               </h3>
//               {completedBookings.map((b) => renderBookingCard(b, "completed"))}
//             </div>
//           )}

//           {cancellationRequestBookings.length > 0 && (
//             <div className="space-y-4 mb-8">
//               <h3 className="text-lg sm:text-xl font-semibold text-orange-600 mb-4">
//                 Cancellation Requests
//               </h3>
//               {cancellationRequestBookings.map((b) =>
//                 renderBookingCard(b, "cancellationRequest"),
//               )}
//             </div>
//           )}

//           {rejectedByAdminBookings.length > 0 && (
//             <div className="space-y-4 mb-8">
//               <h3 className="text-lg sm:text-xl font-semibold text-red-600 mb-4">
//                 Rejected by Admin
//               </h3>
//               {rejectedByAdminBookings.map((b) =>
//                 renderBookingCard(b, "rejected"),
//               )}
//             </div>
//           )}

//           {cancelledByTravellerBookings.length > 0 && (
//             <div className="space-y-4">
//               <h3 className="text-lg sm:text-xl font-semibold text-yellow-600 mb-4">
//                 Cancelled Bookings
//               </h3>
//               {cancelledByTravellerBookings.map((b) =>
//                 renderBookingCard(b, "cancelledByTraveller"),
//               )}
//             </div>
//           )}
//         </>
//       )}

//       {showConfirmLeave && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             backgroundColor: "rgba(0,0,0,0.65)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 9999,
//             padding: "16px",
//           }}
//         >
//           <div
//             style={{
//               backgroundColor: "white",
//               borderRadius: "12px",
//               padding: "24px",
//               maxWidth: "440px",
//               width: "100%",
//               textAlign: "center",
//               boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
//             }}
//           >
//             <h2
//               style={{
//                 fontSize: "1.5rem",
//                 fontWeight: "bold",
//                 marginBottom: "16px",
//                 color: "#111827",
//               }}
//             >
//               Leave this page?
//             </h2>

//             <p
//               style={{
//                 color: "#4b5563",
//                 marginBottom: "24px",
//                 lineHeight: "1.6",
//               }}
//             >
//               You are currently viewing bookings for{" "}
//               <strong>
//                 {tourList.find((t) => t._id === selectedTourId)?.title ||
//                   "this tour"}
//               </strong>
//               .<br />
//               Leaving will clear the current bookings view.
//               <br />
//               Are you sure you want to leave?
//             </p>

//             <div
//               style={{ display: "flex", gap: "16px", justifyContent: "center" }}
//             >
//               <button
//                 onClick={handleCancelLeave}
//                 style={{
//                   padding: "12px 28px",
//                   backgroundColor: "#e5e7eb",
//                   color: "#1f2937",
//                   borderRadius: "8px",
//                   fontWeight: "600",
//                   border: "none",
//                   cursor: "pointer",
//                 }}
//               >
//                 Cancel (Stay)
//               </button>

//               <button
//                 onClick={handleConfirmLeave}
//                 style={{
//                   padding: "12px 28px",
//                   backgroundColor: "#dc2626",
//                   color: "white",
//                   borderRadius: "8px",
//                   fontWeight: "600",
//                   border: "none",
//                   cursor: "pointer",
//                 }}
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

// export default TourBookings;


import React, { useState, useEffect, useContext, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TourContext } from "../../context/TourContext";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Copy,
  Receipt as ReceiptIcon,
  FileText,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ═══════════════════════════════════════════════════════════════════════
// Receipt/Invoice button — shown once booking.invoiceNumber exists (i.e.
// once advance has been marked paid). Does NOT fetch or render any
// invoice data itself — it just navigates to the standalone Invoice.jsx
// page, which handles fetching + display + download on its own.
// ═══════════════════════════════════════════════════════════════════════
const ReceiptNavButton = ({ booking }) => {
  const navigate = useNavigate();

  if (!booking?.invoiceNumber) return null;

  // booking.payment.balance.paid is already on the booking object
  // client-side, so the label is correct instantly — no fetch needed here.
  const isFullyPaid = booking.payment?.balance?.paid === true;
  const docLabel = isFullyPaid ? "Invoice" : "Receipt";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/invoice/${booking.tnr}`);
      }}
      className={`flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm rounded-lg text-white min-w-[120px] sm:min-w-[140px] ${isFullyPaid
        ? "bg-emerald-600 hover:bg-emerald-700"
        : "bg-cyan-600 hover:bg-cyan-700"
        }`}
    >
      {isFullyPaid ? <FileText size={16} /> : <ReceiptIcon size={16} />}
      {docLabel}
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// Main TourBookings page
// ═══════════════════════════════════════════════════════════════════════
const TourBookings = () => {
  const {
    tourList,
    getTourList,
    bookings,
    getBookings,
    markAdvancePaid,
    markBalancePaid,
    completeBooking,
    ttoken,
  } = useContext(TourContext);

  const [expanded, setExpanded] = useState(null);
  const [selectedTourId, setSelectedTourId] = useState("");
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [travellerNameFilter, setTravellerNameFilter] = useState("");
  const [tnrFilter, setTnrFilter] = useState("");
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  const shouldProtect = Boolean(
    selectedTourId && !isLoadingBookings && bookings && bookings.length > 0,
  );

  const location = useLocation();

  useEffect(() => {
    if (!shouldProtect) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shouldProtect]);

  useEffect(() => {
    if (!shouldProtect) return;

    window.history.pushState(null, null, window.location.href);

    const handlePopState = () => {
      setShowConfirmLeave(true);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
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
    if (ttoken) {
      getTourList();
    }
  }, [ttoken, getTourList]);

  useEffect(() => {
    if (ttoken && selectedTourId) {
      setIsLoadingBookings(true);
      getBookings(selectedTourId)
        .then((response) => {
          if (
            response &&
            typeof response === "object" &&
            "success" in response
          ) {
            if (response.success) {
              toast.success("Bookings fetched successfully");
            } else {
              toast.error(response.message || "Failed to fetch bookings");
            }
          } else {
            toast.error("Invalid response from server");
          }
        })
        .catch((error) => {
          console.error("getBookings error:", error);
          toast.error(
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch bookings",
          );
        })
        .finally(() => {
          setIsLoadingBookings(false);
        });
    } else {
      setIsLoadingBookings(false);
    }
  }, [ttoken, selectedTourId, getBookings]);

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, [location]);

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleTourChange = (e) => {
    setSelectedTourId(e.target.value);
    setPaymentFilter("all");
    setStatusFilter("all");
    setTravellerNameFilter("");
    setTnrFilter("");
  };

  const handleApiResponse = useCallback(
    (response, successMessage) => {
      console.log("API Response:", response);
      if (response && typeof response === "object" && "success" in response) {
        if (response.success) {
          toast.success(successMessage || "Operation completed successfully");
          if (selectedTourId) {
            getBookings(selectedTourId);
          }
        } else {
          toast.error(response.message || "An error occurred");
        }
      } else {
        toast.error("Invalid response from server");
      }
    },
    [selectedTourId, getBookings],
  );

  const handleMarkAdvancePaid = async (tnr, tourId) => {
    if (!tnr) {
      toast.error("Cannot mark advance – TNR is missing");
      return;
    }

    if (!window.confirm("Are you sure you want to mark Advance as PAID?"))
      return;

    try {
      const response = await markAdvancePaid(tnr, tourId);
      handleApiResponse(response, "Advance payment marked successfully");
    } catch (error) {
      console.error("markAdvancePaid error:", error);
      toast.error(
        "Failed to mark advance: " + (error.message || "Unknown error"),
      );
    }
  };

  const handleMarkBalancePaid = async (tnr, tourId) => {
    if (!tourId) {
      toast.error("Please select a tour first.");
      return;
    }
    if (!tnr) {
      toast.error("Cannot mark balance – TNR is missing");
      return;
    }

    if (!window.confirm("Are you sure you want to mark Balance as PAID?"))
      return;

    try {
      const response = await markBalancePaid(tnr, tourId);
      handleApiResponse(response, "Balance payment marked successfully");
    } catch (error) {
      console.error("markBalancePaid error:", error);
      toast.error(
        "Failed to mark balance: " + (error.message || "Unknown error"),
      );
    }
  };

  const handleCompleteBooking = async (tnr, tourId) => {
    if (!tnr) {
      toast.error("Cannot complete booking – TNR is missing");
      return;
    }

    if (
      !window.confirm(
        "Mark this booking as completed? This action cannot be undone easily.",
      )
    ) {
      return;
    }

    try {
      const response = await completeBooking(tnr, tourId);
      handleApiResponse(response, "Booking completed successfully");
    } catch (error) {
      console.error("completeBooking error:", error);
      toast.error("Failed to complete: " + (error.message || "Unknown error"));
    }
  };

  const handleCopyTNR = (text) => {
    if (!text) {
      toast.error("Nothing to copy");
      return;
    }
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied!"))
      .catch(() => toast.error("Failed to copy"));
  };

  // === HELPER FUNCTIONS ===
  const areAllTravellersCancelled = (booking) =>
    booking.travellers.length > 0 &&
    booking.travellers.every(
      (t) => t.cancelled?.byTraveller && t.cancelled?.byAdmin,
    );

  const areAllTravellersRejected = (booking) =>
    booking.travellers.length > 0 &&
    booking.travellers.every(
      (t) => t.cancelled?.byAdmin && !t.cancelled?.byTraveller,
    );

  const hasCancellationRequest = (booking) =>
    booking.travellers.some(
      (t) => t.cancelled?.byTraveller && !t.cancelled?.byAdmin,
    ) && !areAllTravellersCancelled(booking);

  const hasActiveTraveller = (booking) =>
    booking.travellers.some(
      (t) => !(t.cancelled?.byTraveller || t.cancelled?.byAdmin),
    );

  // === FILTER BOOKINGS ===
  const filteredBookings = bookings.filter((booking) => {
    const firstTraveller = booking.travellers[0] || {};
    const displayName =
      `${firstTraveller.firstName || ""} ${firstTraveller.lastName || ""}`.trim();

    let paymentMatch = true;
    if (paymentFilter !== "all") {
      if (paymentFilter === "advancePaid" && !booking.payment.advance.paid)
        paymentMatch = false;
      else if (
        paymentFilter === "advancePending" &&
        booking.payment.advance.paid
      )
        paymentMatch = false;
      else if (paymentFilter === "balancePaid" && !booking.payment.balance.paid)
        paymentMatch = false;
      else if (
        paymentFilter === "balancePending" &&
        booking.payment.balance.paid
      )
        paymentMatch = false;
    }

    let statusMatch = true;
    if (statusFilter !== "all") {
      const allCancelled = areAllTravellersCancelled(booking);
      const allRejected = areAllTravellersRejected(booking);
      const hasActive = hasActiveTraveller(booking);

      if (statusFilter === "active")
        statusMatch = !booking.isBookingCompleted && hasActive;
      else if (statusFilter === "completed")
        statusMatch = booking.isBookingCompleted && hasActive;
      else if (statusFilter === "rejected") statusMatch = allRejected;
      else if (statusFilter === "cancelled") statusMatch = allCancelled;
    }

    let nameMatch = true;
    if (travellerNameFilter) {
      nameMatch = displayName
        .toLowerCase()
        .includes(travellerNameFilter.toLowerCase());
    }

    let tnrMatch = true;
    if (tnrFilter.trim()) {
      const searchTnr = tnrFilter.trim().toUpperCase();
      tnrMatch = booking.tnr?.toUpperCase().includes(searchTnr);
    }

    return paymentMatch && statusMatch && nameMatch && tnrMatch;
  });

  // === CATEGORIZE BOOKINGS ===
  const activeBookings = filteredBookings
    .filter((b) => !b.isBookingCompleted && hasActiveTraveller(b))
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  const completedBookings = filteredBookings
    .filter((b) => b.isBookingCompleted && hasActiveTraveller(b))
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  const cancellationRequestBookings = filteredBookings
    .filter(hasCancellationRequest)
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  const rejectedByAdminBookings = filteredBookings
    .filter(areAllTravellersRejected)
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  const cancelledByTravellerBookings = filteredBookings
    .filter(areAllTravellersCancelled)
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  // === RENDER CARD ===
  const renderBookingCard = (booking, category) => {
    const isExpanded = expanded === booking._id;
    const firstTraveller = booking.travellers[0] || {};
    const displayName =
      `${firstTraveller.firstName || ""} ${firstTraveller.lastName || ""}`.trim() ||
      "Unknown Traveller";

    const showPartialCancellation = hasCancellationRequest(booking);
    const isFullyCancelled = areAllTravellersCancelled(booking);
    const isFullyRejected = areAllTravellersRejected(booking);

    // Whether the TOUR itself has been "Trip Cancelled" (the bulk admin
    // action) — looked up live from tourList, not from any snapshot on
    // the booking, since a booking's embedded tourData can be stale.
    const selectedTour = tourList.find((t) => t._id === selectedTourId);
    const isTripCancelledTour = selectedTour?.tripCancelled === true;

    // Only meaningful once the TOUR has been trip-cancelled: does THIS
    // TNR have a real, charged cancellation (gvCancellationPool/
    // irctcCancellationPool > 0 means a genuine approved cancellationModel
    // record exists for it) — as opposed to being cancelled ONLY by the
    // no-charge bulk trip-cancel action.
    const hasChargedCancellation =
      (booking.gvCancellationPool || 0) > 0 ||
      (booking.irctcCancellationPool || 0) > 0;

    const displayRef = booking.tnr || `...${booking._id?.slice(-8) || ""}`;

    // Card color:
    //  - Tour NOT trip-cancelled → always white/default, regardless of
    //    any individual traveller cancellation status.
    //  - Tour trip-cancelled → blue if this TNR has a real charged
    //    cancellation record, red if it was only bulk-cancelled with no
    //    charge.
    const cardColorClass = !isTripCancelledTour
      ? "bg-white border-gray-200"
      : hasChargedCancellation
        ? "bg-blue-50 border-blue-300"
        : "bg-red-50 border-red-300";

    return (
      <div
        key={booking._id}
        className={`rounded-2xl shadow border overflow-hidden w-full sm:max-w-4xl mx-auto ${cardColorClass}`}
      >
        <div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => toggleExpand(booking._id)}
        >
          <div className="w-full sm:w-auto">
            <p className="font-semibold text-base sm:text-lg">
              <strong>{displayName}</strong>
            </p>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {booking.userId?.email || "No email"} |{" "}
              {booking.contact?.mobile || "No phone"}
            </p>

            <div className="mt-2 flex flex-wrap gap-2 text-xs sm:text-sm">
              <span
                className={`px-2 py-1 rounded-lg text-xs font-medium ${booking.payment.advance.paid
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
                  }`}
              >
                Advance: {booking.payment.advance.paid ? "Paid" : "Pending"}
              </span>
              <span
                className={`px-2 py-1 rounded-lg text-xs font-medium ${booking.payment.balance.paid
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
                  }`}
              >
                Balance: {booking.payment.balance.paid ? "Paid" : "Pending"}
              </span>

              {/* T&C Agreed Label */}
              {booking.termsAgreed && (
                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700">
                  T&C form submitted
                </span>
              )}

              {/* Emergency Contact Badge */}
              {booking.emergencyContact && (
                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
                  Emergency: {booking.emergencyContact}
                </span>
              )}
            </div>

            {category === "completed" && (
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 mt-2 inline-block">
                Completed
              </span>
            )}
            {showPartialCancellation && (
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-700 mt-2 inline-block">
                Partial Cancellation Request
              </span>
            )}
            {isFullyRejected && (
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 mt-2 inline-block">
                Rejected by Admin
              </span>
            )}
            {isFullyCancelled && (
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700 mt-2 inline-block">
                Fully Cancelled
              </span>
            )}
            {booking.tripCancelledTravellerCount > 0 && (
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 mt-2 ml-2 inline-block">
                {booking.tripCancelledTravellerCount} Trip Cancelled (No Charge)
              </span>
            )}

            <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-gray-700 font-medium">
                TNR:{" "}
                <span className="font-bold tracking-wide">{displayRef}</span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyTNR(booking.tnr || booking._id);
                }}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Copy TNR"
              >
                <Copy size={16} />
              </button>
              <span className="text-gray-500">| {booking.bookingType}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
            {isFullyRejected ? (
              <button
                disabled
                className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-gray-400 text-white rounded-lg cursor-not-allowed min-w-[120px] sm:min-w-[140px]"
              >
                <CheckCircle size={16} />
                Cancelled
              </button>
            ) : booking.isBookingCompleted && !isFullyCancelled && !isTripCancelledTour ? (
              <button
                disabled
                className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-green-400 text-white rounded-lg cursor-not-allowed min-w-[120px] sm:min-w-[140px]"
              >
                <CheckCircle size={16} />
                Completed
              </button>
            ) : (
              <>
                {booking.bookingType === "offline" && (
                  <>
                    {!booking.payment.advance.paid && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isFullyCancelled && !isTripCancelledTour) {
                            handleMarkAdvancePaid(booking.tnr, selectedTourId);
                          }
                        }}
                        disabled={isFullyCancelled || isTripCancelledTour}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm text-white rounded-lg min-w-[120px] sm:min-w-[140px] ${
                          isFullyCancelled || isTripCancelledTour
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        <CheckCircle size={16} />
                        Mark Advance
                      </button>
                    )}
                    {booking.payment.advance.paid &&
                      !booking.payment.balance.paid && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isFullyCancelled && !isTripCancelledTour) {
                              handleMarkBalancePaid(booking.tnr, selectedTourId);
                            }
                          }}
                          disabled={isFullyCancelled || isTripCancelledTour}
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm text-white rounded-lg min-w-[120px] sm:min-w-[140px] ${
                            isFullyCancelled || isTripCancelledTour
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-orange-500 hover:bg-orange-600"
                          }`}
                        >
                          <CheckCircle size={16} />
                          Mark Balance
                        </button>
                      )}
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isFullyCancelled && !isTripCancelledTour) {
                      handleCompleteBooking(booking.tnr, selectedTourId);
                    }
                  }}
                  disabled={isFullyCancelled || isTripCancelledTour}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm text-white rounded-lg min-w-[120px] sm:min-w-[140px] ${
                    isFullyCancelled || isTripCancelledTour
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  <CheckCircle size={16} />
                  Mark Complete
                </button>
              </>
            )}

            {/* ── Receipt/Invoice button — shows once advance is paid ── */}
            <ReceiptNavButton booking={booking} />

            {isExpanded ? (
              <ChevronUp className="text-gray-500 w-5 h-5" />
            ) : (
              <ChevronDown className="text-gray-500 w-5 h-5" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 border-t bg-gray-50 text-xs sm:text-sm text-gray-700 space-y-4">
            <div>
              <p>
                <strong>TNR / Reference:</strong>{" "}
                <span className="font-mono font-bold">
                  {booking.tnr || "Not generated"}
                </span>
              </p>
              <p>
                <strong>Tour:</strong> {booking?.tourData?.title}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(booking.bookingDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Type:</strong> {booking.bookingType}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">Contact</h3>
              <p>Email: {booking.contact?.email || "—"}</p>
              <p>Mobile: {booking.contact?.mobile || "—"}</p>

              {booking.emergencyContact && (
                <p className="mt-1 text-blue-700 font-medium">
                  Emergency Contact: {booking.emergencyContact}
                </p>
              )}

              <p className="mt-2">
                <strong>T&C Agreed:</strong>{" "}
                <span
                  className={
                    booking.termsAgreed
                      ? "text-green-600 font-medium"
                      : "text-red-600"
                  }
                >
                  {booking.termsAgreed ? "Yes" : "No"}
                  {booking.termsAgreed && booking.termsAgreedAt && (
                    <>
                      {" "}
                      (on {new Date(booking.termsAgreedAt).toLocaleDateString()}
                      )
                    </>
                  )}
                </span>
              </p>
            </div>

            {booking.billingAddress && (
              <div>
                <h3 className="font-semibold text-gray-800">Billing Address</h3>
                <p>{booking.billingAddress.addressLine1}</p>
                {booking.billingAddress.addressLine2 && (
                  <p>{booking.billingAddress.addressLine2}</p>
                )}
                <p>
                  {booking.billingAddress.city}, {booking.billingAddress.state}{" "}
                  - {booking.billingAddress.pincode}
                </p>
                <p>{booking.billingAddress.country}</p>
              </div>
            )}

            {/* Admin Remarks */}
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">
                Admin Remarks
              </h3>
              {booking.adminRemarks?.length > 0 ? (
                <div className="space-y-3">
                  {booking.adminRemarks.map((remark, idx) => {
                    const amount = remark.amount || 0;
                    const isNegative = amount < 0;
                    const displayAmount =
                      amount !== 0 ? `₹${Math.abs(amount)}` : "—";

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded border ${isNegative
                          ? "bg-red-50 border-red-200"
                          : amount > 0
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                          }`}
                      >
                        <p className="text-sm">{remark.remark}</p>

                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${isNegative
                              ? "bg-red-100 text-red-700"
                              : amount > 0
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                              }`}
                          >
                            {isNegative
                              ? "Refund/Adjustment"
                              : amount > 0
                                ? "Additional"
                                : "No Amount"}
                          </span>

                          <span
                            className={`text-sm font-medium ${isNegative
                              ? "text-red-600"
                              : amount > 0
                                ? "text-green-600"
                                : "text-gray-600"
                              }`}
                          >
                            {amount !== 0 ? (isNegative ? "-" : "+") : ""}
                            {displayAmount}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          Added on:{" "}
                          {new Date(remark.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 italic">No admin remarks found</p>
              )}
            </div>

            {/* Advance Admin Remarks */}
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">
                Advance Admin Remarks
              </h3>
              {booking.advanceAdminRemarks?.length > 0 ? (
                <div className="space-y-3">
                  {booking.advanceAdminRemarks.map((remark, idx) => {
                    const amount = remark.amount || 0;
                    const isNegative = amount < 0;
                    const displayAmount =
                      amount !== 0 ? `₹${Math.abs(amount)}` : "—";

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded border ${isNegative
                          ? "bg-red-50 border-red-200"
                          : amount > 0
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                          }`}
                      >
                        <p className="text-sm">{remark.remark}</p>

                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${isNegative
                              ? "bg-red-100 text-red-700"
                              : amount > 0
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                              }`}
                          >
                            {isNegative
                              ? "Refund/Adjustment"
                              : amount > 0
                                ? "Additional"
                                : "No Amount"}
                          </span>

                          <span
                            className={`text-sm font-medium ${isNegative
                              ? "text-red-600"
                              : amount > 0
                                ? "text-green-600"
                                : "text-gray-600"
                              }`}
                          >
                            {amount !== 0 ? (isNegative ? "-" : "+") : ""}
                            {displayAmount}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          Added on:{" "}
                          {new Date(remark.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 italic">No advance remarks found</p>
              )}
            </div>

            {/* Travellers */}
            {booking.travellers.map((trav, idx) => {
              let status = null;
              // Bulk-cancelled via the "Trip Cancelled" admin action — NO
              // GV/IRCTC charge was ever computed for this traveller,
              // distinct from a real individually-approved cancellation
              // (which DOES carry a charge). Shown in a different color
              // so admins can tell the two apart at a glance.
              const isNoChargeTripCancel = trav.cancelled?.viaTripCancel === true;

              if (trav.cancelled?.byTraveller && !trav.cancelled?.byAdmin) {
                status = "Cancellation Requested";
              } else if (
                trav.cancelled?.byAdmin &&
                !trav.cancelled?.byTraveller
              ) {
                status = "Rejected by Admin";
              } else if (
                trav.cancelled?.byTraveller &&
                trav.cancelled?.byAdmin
              ) {
                status = isNoChargeTripCancel
                  ? "Cancelled (Trip Cancelled — No Charge)"
                  : "Cancelled";
              }

              // ── if/else — resolve addon display ──
              // NEW bookings: trav.selectedAddons is an array. Each entry
              // is EITHER a train-wise addon (carries trainIndex/trainNo/
              // trainName) OR a flight-wise addon (carries flightIndex/
              // flightNo/airline) — both kinds can be present in the same
              // array. OLD bookings: trav.selectedAddon is a flat single
              // object (unchanged, still handled below).
              let addonDisplay = null;

              if (Array.isArray(trav.selectedAddons) && trav.selectedAddons.length > 0) {
                // ── NEW MODE: train-wise AND flight-wise addons, split
                // into two clearly-labeled sections so it's obvious which
                // is which even before reading the trip name. ──
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

                // Distinguish train vs flight entry. Different origins
                // write addons in different shapes:
                //   - TourBooking.jsx (customer booking flow) → flight
                //     entries carry `flightIndex`.
                //   - ManageBooking.jsx (admin edit flow, approved via
                //     Booking Approvals) → flight entries carry
                //     `tripKind: "flight"` instead.
                //   - Older / manually-saved entries may carry NEITHER
                //     flightIndex nor tripKind, but DO still carry
                //     flightNo/airline (or trainNo/trainName). Checking
                //     flightIndex/tripKind alone silently drops these
                //     into the train bucket with blank train fields —
                //     exactly the "Deboarding : DEL TO MAS" blank-name
                //     bug. So the actual identifying fields (flightNo/
                //     airline vs trainNo/trainName) are checked FIRST,
                //     falling back to flightIndex/tripKind only when
                //     neither set of fields is present at all.
                const isFlightAddon = (a) => {
                  if (a.flightNo || a.airline) return true;
                  if (a.trainNo || a.trainName) return false;
                  return (
                    (a.flightIndex !== undefined && a.flightIndex !== null) ||
                    a.tripKind === "flight"
                  );
                };

                const trainAddonEntries = trav.selectedAddons.filter(
                  (a) => !isFlightAddon(a),
                );
                const flightAddonEntries = trav.selectedAddons.filter(
                  (a) => isFlightAddon(a),
                );

                const renderAddonRow = (a, aIdx, isFlight) => {
                  const style = getTripTypeStyle(a.tripType);
                  const isNegative = Number(a.amount) < 0;
                  // Build the "Name (Code)" label only from fields that
                  // actually have a value — if BOTH are empty (data gap),
                  // omit the label + colon entirely instead of rendering
                  // a bare ": name".
                  const primary = isFlight ? a.airline : a.trainName;
                  const secondary = isFlight ? a.flightNo : a.trainNo;
                  const tripLabel = primary && secondary
                    ? `${primary} (${secondary})`
                    : primary || secondary || null;

                  return (
                    <div
                      key={aIdx}
                      className="flex flex-wrap items-center gap-2 text-sm"
                    >
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${style.badge}`}
                      >
                        {style.label}
                      </span>
                      <span className="text-gray-700">
                        {tripLabel ? `${tripLabel}: ` : ""}
                        {a.name}
                      </span>
                      <span
                        className={`font-semibold ${isNegative ? "text-red-600" : "text-green-700"
                          }`}
                      >
                        {Number(a.amount) >= 0 ? "+" : ""}₹{a.amount}
                      </span>
                    </div>
                  );
                };

                addonDisplay = (
                  <div className="mt-3 space-y-3">
                    {trainAddonEntries.length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-red-600 mb-1.5 flex items-center gap-1.5">
                          <span>🚆</span> Train Addons
                        </p>
                        <div className="space-y-2">
                          {trainAddonEntries.map((a, aIdx) =>
                            renderAddonRow(a, aIdx, false),
                          )}
                        </div>
                      </div>
                    )}

                    {flightAddonEntries.length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-orange-900 mb-1.5 flex items-center gap-1.5">
                          <span>✈️</span> Flight Addons
                        </p>
                        <div className="space-y-2">
                          {flightAddonEntries.map((a, aIdx) =>
                            renderAddonRow(a, aIdx, true),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );

              } else if (trav.selectedAddon?.name) {
                // ── OLD MODE: single flat addon (unchanged) ──
                addonDisplay = (
                  <p className="mt-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 mr-2">
                      Add-on
                    </span>
                    {trav.selectedAddon.name} (₹{trav.selectedAddon.price})
                  </p>
                );
              }

              return (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-lg border shadow-sm"
                >
                  <p className="font-medium">
                    {trav.title} {trav.firstName} {trav.lastName} ({trav.age}{" "}
                    yrs, {trav.gender})
                  </p>
                  <p>Package: {trav.packageType}</p>
                  <p>Sharing: {trav.sharingType}</p>
                  {trav.boardingPoint?.stationName && (
                    <p>
                      Boarding: {trav.boardingPoint.stationName} (
                      {trav.boardingPoint.stationCode})
                    </p>
                  )}
                  {trav.deboardingPoint?.stationName && (
                    <p>
                      Deboarding: {trav.deboardingPoint.stationName} (
                      {trav.deboardingPoint.stationCode})
                    </p>
                  )}

                  {/* ── forked addon display (new train+flight array vs old flat) ── */}
                  {addonDisplay}

                  {trav.remarks && (
                    <p className="italic text-gray-500">
                      Remarks: {trav.remarks}
                    </p>
                  )}
                  {status && (
                    <p
                      className={`font-medium ${
                        isNoChargeTripCancel ? "text-slate-500" : "text-red-600"
                      }`}
                    >
                      {status}
                    </p>
                  )}
                </div>
              );
            })}

            {booking.payment && (
              <div>
                <h3 className="font-semibold text-gray-800">Payment</h3>
                <p>
                  Advance: ₹{booking.payment.advance.amount} –{" "}
                  {booking.payment.advance.paid ? "Paid" : "Pending"}{" "}
                  {booking.payment.advance.paidAt &&
                    `(on ${new Date(booking.payment.advance.paidAt).toLocaleDateString()})`}
                </p>
                <p>
                  Balance: ₹{booking.payment.balance.amount} –{" "}
                  {booking.payment.balance.paid ? "Paid" : "Pending"}{" "}
                  {booking.payment.balance.paidAt &&
                    `(on ${new Date(booking.payment.balance.paidAt).toLocaleDateString()})`}
                </p>
              </div>
            )}

            {(booking.gvCancellationPool > 0 ||
              booking.irctcCancellationPool > 0) && (
              <div>
                <h3 className="font-semibold text-gray-800">
                  Cancellation Amount
                </h3>
                <p>GV Cancellation: ₹{booking.gvCancellationPool || 0}</p>
                <p>IRCTC Cancellation: ₹{booking.irctcCancellationPool || 0}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 pl-12 md:pl-0">
        Tour Bookings
      </h2>

      <div className="mb-4 sm:mb-6">
        <label
          htmlFor="tour-select"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Select a Tour:
        </label>
        <select
          id="tour-select"
          value={selectedTourId}
          onChange={handleTourChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
        >
          <option value="">-- Select a Tour --</option>
          {tourList.map((tour) => (
            <option key={tour._id} value={tour._id}>
              {tour.title}
            </option>
          ))}
        </select>
      </div>

      {selectedTourId && (
        <div className="mb-6 flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
              <option value="all">All</option>
              <option value="advancePaid">Advance Paid</option>
              <option value="advancePending">Advance Pending</option>
              <option value="balancePaid">Balance Paid</option>
              <option value="balancePending">Balance Pending</option>
            </select>
          </div>

          <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Booking Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Traveller Name
            </label>
            <input
              type="text"
              value={travellerNameFilter}
              onChange={(e) => setTravellerNameFilter(e.target.value)}
              placeholder="Search by name..."
              className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            />
          </div>

          <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TNR
            </label>
            <input
              type="text"
              value={tnrFilter}
              onChange={(e) => setTnrFilter(e.target.value.toUpperCase())}
              placeholder="e.g. KD74PX"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md uppercase tracking-wider"
              maxLength={6}
            />
          </div>
        </div>
      )}

      {!selectedTourId ? (
        <div className="text-center text-gray-500 p-6">
          Please select a tour to view bookings.
        </div>
      ) : isLoadingBookings ? (
        <div className="text-center text-gray-500 p-6">Loading bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center text-gray-500 p-6">
          {tnrFilter || travellerNameFilter
            ? "No matching bookings found for your search."
            : "No bookings found."}
        </div>
      ) : (
        <>
          {activeBookings.length > 0 && (
            <div className="space-y-4 mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                Active Bookings
              </h3>
              {activeBookings.map((b) => renderBookingCard(b, "active"))}
            </div>
          )}

          {completedBookings.length > 0 && (
            <div className="space-y-4 mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-green-600 mb-4">
                Completed Bookings
              </h3>
              {completedBookings.map((b) => renderBookingCard(b, "completed"))}
            </div>
          )}

          {cancellationRequestBookings.length > 0 && (
            <div className="space-y-4 mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-orange-600 mb-4">
                Cancellation Requests
              </h3>
              {cancellationRequestBookings.map((b) =>
                renderBookingCard(b, "cancellationRequest"),
              )}
            </div>
          )}

          {rejectedByAdminBookings.length > 0 && (
            <div className="space-y-4 mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-red-600 mb-4">
                Rejected by Admin
              </h3>
              {rejectedByAdminBookings.map((b) =>
                renderBookingCard(b, "rejected"),
              )}
            </div>
          )}

          {cancelledByTravellerBookings.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-yellow-600 mb-4">
                Cancelled Bookings
              </h3>
              {cancelledByTravellerBookings.map((b) =>
                renderBookingCard(b, "cancelledByTraveller"),
              )}
            </div>
          )}
        </>
      )}

      {showConfirmLeave && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "440px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "16px",
                color: "#111827",
              }}
            >
              Leave this page?
            </h2>

            <p
              style={{
                color: "#4b5563",
                marginBottom: "24px",
                lineHeight: "1.6",
              }}
            >
              You are currently viewing bookings for{" "}
              <strong>
                {tourList.find((t) => t._id === selectedTourId)?.title ||
                  "this tour"}
              </strong>
              .<br />
              Leaving will clear the current bookings view.
              <br />
              Are you sure you want to leave?
            </p>

            <div
              style={{ display: "flex", gap: "16px", justifyContent: "center" }}
            >
              <button
                onClick={handleCancelLeave}
                style={{
                  padding: "12px 28px",
                  backgroundColor: "#e5e7eb",
                  color: "#1f2937",
                  borderRadius: "8px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Cancel (Stay)
              </button>

              <button
                onClick={handleConfirmLeave}
                style={{
                  padding: "12px 28px",
                  backgroundColor: "#dc2626",
                  color: "white",
                  borderRadius: "8px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                }}
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

export default TourBookings;
