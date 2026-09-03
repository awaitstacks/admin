// // import React, { useContext, useEffect, useState } from "react";
// // import { TourAdminContext } from "../../context/TourAdminContext";
// // import { toast, ToastContainer } from "react-toastify";
// // import "react-toastify/dist/ReactToastify.css";
// // import jsPDF from "jspdf";
// // import autoTable from "jspdf-autotable";

// // const ToursList = () => {
// //   const {
// //     tours,
// //     bookings,
// //     getAllTours,
// //     getAllBookings,
// //     changeTourAvailablity,
// //   } = useContext(TourAdminContext);

// //   const [filterText, setFilterText] = useState("");
// //   const [isLoading, setIsLoading] = useState(false);

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       setIsLoading(true);
// //       try {
// //         const [toursResponse, bookingsResponse] = await Promise.all([
// //           getAllTours(),
// //           getAllBookings(),
// //         ]);
// //         console.log("Tours fetched:", toursResponse.tours);
// //         console.log("Bookings fetched:", bookingsResponse.bookings);
// //       } catch (error) {
// //         console.error("Error fetching data:", error.message);
// //         toast.error("Failed to fetch tours or bookings");
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };

// //     fetchData();
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);

// //   // Helper: Get valid travellers for a tour (strict rules)
// //   const getValidTravellers = (tourId) => {
// //     if (!tourId) {
// //       console.warn("Invalid tourId:", tourId);
// //       return [];
// //     }

// //     const validBookings = bookings.filter((b) => {
// //       const isValid =
// //         b.tourId?.toString() === tourId.toString() &&
// //         b.payment?.advance?.paid === true &&
// //         b.payment?.balance?.paid === true &&
// //         b.isBookingCompleted === true;
// //       if (!isValid) {
// //         console.log(`Booking ${b._id} filtered out for tour ${tourId}`, {
// //           tourIdMatch: b.tourId?.toString() === tourId.toString(),
// //           advancePaid: b.payment?.advance?.paid,
// //           balancePaid: b.payment?.balance?.paid,
// //           isBookingCompleted: b.isBookingCompleted,
// //         });
// //       }
// //       return isValid;
// //     });

// //     const travellers = validBookings.flatMap((b) => {
// //       const validTravellers = (b.travellers || []).filter(
// //         (t) =>
// //           t.cancelled?.byTraveller !== true && t.cancelled?.byAdmin !== true,
// //       );
// //       console.log(`Travellers for booking ${b._id}:`, validTravellers);
// //       return validTravellers;
// //     });

// //     console.log(`Valid travellers for tour ${tourId}:`, travellers);
// //     return travellers;
// //   };

// //   // Count functions
// //   const getTravellerCount = (tourId) => {
// //     const count = getValidTravellers(tourId).length;
// //     console.log(`Traveller count for tour ${tourId}: ${count}`);
// //     return count;
// //   };

// //   const getCancellationCount = (tourId) => {
// //     const count = bookings
// //       .filter(
// //         (b) =>
// //           b.tourId?.toString() === tourId.toString() &&
// //           b.isBookingCompleted === true,
// //       )
// //       .reduce((count, b) => {
// //         const cancelledTravellers = (b.travellers || []).filter(
// //           (t) =>
// //             t.cancelled?.byTraveller === true && t.cancelled?.byAdmin === true,
// //         );
// //         return count + cancelledTravellers.length;
// //       }, 0);
// //     console.log(`Cancellation count for tour ${tourId}: ${count}`);
// //     return count;
// //   };

// //   const getDoubleSharingCount = (tourId) => {
// //     const count = getValidTravellers(tourId).filter(
// //       (t) => t.sharingType === "double" && t.sharingType !== "withBerth",
// //     ).length;
// //     console.log(`Double sharing count for tour ${tourId}: ${count}`);
// //     return count;
// //   };

// //   const getTripleSharingCount = (tourId) => {
// //     const count = getValidTravellers(tourId).filter(
// //       (t) => t.sharingType === "triple" && t.sharingType !== "withBerth",
// //     ).length;
// //     console.log(`Triple sharing count for tour ${tourId}: ${count}`);
// //     return count;
// //   };

// //   const getChildAndWithBerthCount = (tourId) => {
// //     const travellers = getValidTravellers(tourId);
// //     const count = travellers.filter(
// //       (t) =>
// //         t.sharingType === "withBerth" || t.gender?.toLowerCase() === "other",
// //     ).length;
// //     console.log(`Child count for tour ${tourId}: ${count}`, {
// //       withBerth: travellers.filter((t) => t.sharingType === "withBerth").length,
// //       children: travellers.filter(
// //         (t) =>
// //           t.gender?.toLowerCase() === "other" && t.sharingType !== "withBerth",
// //       ).length,
// //     });
// //     return count;
// //   };

// //   const getMaleCount = (tourId) => {
// //     const count = getValidTravellers(tourId).filter(
// //       (t) =>
// //         t.gender?.toLowerCase() === "male" && t.sharingType !== "withBerth",
// //     ).length;
// //     console.log(`Male count for tour ${tourId}: ${count}`);
// //     return count;
// //   };

// //   const getFemaleCount = (tourId) => {
// //     const count = getValidTravellers(tourId).filter(
// //       (t) =>
// //         t.gender?.toLowerCase() === "female" && t.sharingType !== "withBerth",
// //     ).length;
// //     console.log(`Female count for tour ${tourId}: ${count}`);
// //     return count;
// //   };

// //   // Filter tours by title
// //   const filteredTours = tours.filter(
// //     (tour) =>
// //       tour?.title?.toLowerCase()?.includes(filterText.toLowerCase()) ?? false,
// //   );

// //   // Export filtered tours to PDF
// //   const exportPDF = () => {
// //     const doc = new jsPDF();
// //     doc.text("Tours Summary", 14, 15);

// //     const tableColumn = [
// //       "S.No",
// //       "Tour Title",
// //       "Travellers",
// //       "Cancellations",
// //       "Double",
// //       "Triple",
// //       "Male",
// //       "Female",
// //       "Child",
// //       "Availability",
// //     ];

// //     const tableRows = filteredTours.map((tour, index) => {
// //       const row = [
// //         index + 1,
// //         tour.title || "Unknown",
// //         getTravellerCount(tour._id),
// //         getCancellationCount(tour._id),
// //         getDoubleSharingCount(tour._id),
// //         getTripleSharingCount(tour._id),
// //         getMaleCount(tour._id),
// //         getFemaleCount(tour._id),
// //         getChildAndWithBerthCount(tour._id),
// //         tour.available ? "Available" : "Unavailable",
// //       ];
// //       console.log(`PDF row for tour ${tour._id}:`, row);
// //       return row;
// //     });

// //     autoTable(doc, {
// //       head: [tableColumn],
// //       body: tableRows,
// //       startY: 20,
// //     });

// //     doc.save("Tours_Summary.pdf");
// //   };

// //   // Handle tour availability change
// //   const handleChangeAvailability = async (tourId) => {
// //     const confirm = window.confirm(
// //       "Are you sure you want to change the tour availability?",
// //     );
// //     if (!confirm) return;

// //     setIsLoading(true);
// //     try {
// //       const response = await changeTourAvailablity(tourId);
// //       if (response.success) {
// //         toast.success("Tour availability changed successfully");
// //         await getAllTours(); // Refresh tours after availability change
// //       } else {
// //         toast.error(response.message || "Failed to change tour availability");
// //       }
// //     } catch (error) {
// //       toast.error(
// //         error.response?.data?.message ||
// //           error.message ||
// //           "Failed to change tour availability",
// //       );
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
// //       <ToastContainer
// //         position="top-right"
// //         autoClose={3000}
// //         hideProgressBar={false}
// //         newestOnTop
// //         closeOnClick
// //         rtl={false}
// //         pauseOnFocusLoss
// //         draggable
// //         pauseOnHover
// //       />

// //       <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
// //         <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center lg:text-left w-full">
// //           Tours Controls
// //         </h1>

// //         <button
// //           onClick={exportPDF}
// //           disabled={isLoading}
// //           className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition shadow-sm disabled:opacity-60 text-sm sm:text-base"
// //         >
// //           {isLoading ? "Processing..." : "Export PDF"}
// //         </button>
// //       </div>

// //       <input
// //         type="text"
// //         placeholder="Filter by Tour Title..."
// //         value={filterText}
// //         onChange={(e) => setFilterText(e.target.value)}
// //         disabled={isLoading}
// //         className="w-full max-w-lg mb-6 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-60"
// //       />

// //       {isLoading ? (
// //         <div className="text-center py-12 text-gray-500">Loading tours...</div>
// //       ) : filteredTours.length === 0 ? (
// //         <div className="text-center py-12 text-gray-500">No tours found</div>
// //       ) : (
// //         <>
// //           {/* DESKTOP TABLE - visible from md+ */}
// //           <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
// //             <table className="min-w-full divide-y divide-gray-200 text-sm">
// //               <thead className="bg-gray-50">
// //                 <tr>
// //                   <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider w-12">
// //                     S.No
// //                   </th>
// //                   <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
// //                     Tour Title
// //                   </th>
// //                   <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
// //                     Travellers
// //                   </th>
// //                   <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
// //                     Cancellations
// //                   </th>
// //                   <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
// //                     Double
// //                   </th>
// //                   <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
// //                     Triple
// //                   </th>
// //                   <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
// //                     Male
// //                   </th>
// //                   <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
// //                     Female
// //                   </th>
// //                   <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
// //                     Child
// //                   </th>
// //                   <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
// //                     Availability
// //                   </th>
// //                 </tr>
// //               </thead>
// //               <tbody className="bg-white divide-y divide-gray-200">
// //                 {filteredTours.map((tour, index) => (
// //                   <tr key={tour._id} className="hover:bg-gray-50">
// //                     <td className="px-4 py-4 whitespace-nowrap text-center font-medium">
// //                       {index + 1}
// //                     </td>
// //                     <td className="px-6 py-4 font-medium text-gray-900">
// //                       {tour.title || "Unknown"}
// //                     </td>
// //                     <td className="px-4 py-4 text-center font-semibold">
// //                       {getTravellerCount(tour._id)}
// //                     </td>
// //                     <td className="px-4 py-4 text-center text-red-600">
// //                       {getCancellationCount(tour._id)}
// //                     </td>
// //                     <td className="px-4 py-4 text-center">
// //                       {getDoubleSharingCount(tour._id)}
// //                     </td>
// //                     <td className="px-4 py-4 text-center">
// //                       {getTripleSharingCount(tour._id)}
// //                     </td>
// //                     <td className="px-4 py-4 text-center text-blue-600">
// //                       {getMaleCount(tour._id)}
// //                     </td>
// //                     <td className="px-4 py-4 text-center text-pink-600">
// //                       {getFemaleCount(tour._id)}
// //                     </td>
// //                     <td className="px-4 py-4 text-center text-purple-600">
// //                       {getChildAndWithBerthCount(tour._id)}
// //                     </td>
// //                     <td className="px-6 py-4 text-center">
// //                       <button
// //                         onClick={() => handleChangeAvailability(tour._id)}
// //                         disabled={isLoading}
// //                         className={`px-5 py-2 rounded-lg text-white text-sm font-medium min-w-[120px] transition ${
// //                           tour.available
// //                             ? "bg-green-600 hover:bg-green-700"
// //                             : "bg-red-600 hover:bg-red-700"
// //                         } disabled:opacity-60`}
// //                       >
// //                         {tour.available ? "Available" : "Unavailable"}
// //                       </button>
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>

// //           {/* MOBILE CARDS - visible below md */}
// //           <div className="md:hidden space-y-5">
// //             {filteredTours.map((tour, index) => (
// //               <div
// //                 key={tour._id}
// //                 className="bg-white border border-gray-200 rounded-xl shadow overflow-hidden"
// //               >
// //                 <div className="bg-gray-50 px-4 py-3 border-b">
// //                   <div className="flex justify-between items-start gap-3">
// //                     <h3 className="font-semibold text-base leading-tight line-clamp-2">
// //                       {tour.title || "Unknown Tour"}
// //                     </h3>
// //                     <span className="text-xs text-gray-500 font-medium shrink-0">
// //                       #{index + 1}
// //                     </span>
// //                   </div>
// //                 </div>

// //                 <div className="grid grid-cols-3 gap-3 p-4 text-center text-sm">
// //                   <div>
// //                     <div className="text-gray-500 text-xs mb-1">Travellers</div>
// //                     <div className="font-bold text-lg">
// //                       {getTravellerCount(tour._id)}
// //                     </div>
// //                   </div>
// //                   <div>
// //                     <div className="text-gray-500 text-xs mb-1">
// //                       Cancellations
// //                     </div>
// //                     <div className="font-bold text-lg text-red-600">
// //                       {getCancellationCount(tour._id)}
// //                     </div>
// //                   </div>
// //                   <div>
// //                     <div className="text-gray-500 text-xs mb-1">Child</div>
// //                     <div className="font-bold text-lg">
// //                       {getChildAndWithBerthCount(tour._id)}
// //                     </div>
// //                   </div>

// //                   <div>
// //                     <div className="text-gray-500 text-xs mb-1">Double</div>
// //                     <div className="font-bold text-lg">
// //                       {getDoubleSharingCount(tour._id)}
// //                     </div>
// //                   </div>
// //                   <div>
// //                     <div className="text-gray-500 text-xs mb-1">Triple</div>
// //                     <div className="font-bold text-lg">
// //                       {getTripleSharingCount(tour._id)}
// //                     </div>
// //                   </div>
// //                   <div className="col-span-3 mt-2">
// //                     <div className="flex justify-center gap-8">
// //                       <div>
// //                         <div className="text-gray-500 text-xs">Male</div>
// //                         <div className="font-bold text-blue-600">
// //                           {getMaleCount(tour._id)}
// //                         </div>
// //                       </div>
// //                       <div>
// //                         <div className="text-gray-500 text-xs">Female</div>
// //                         <div className="font-bold text-pink-600">
// //                           {getFemaleCount(tour._id)}
// //                         </div>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <div className="px-4 py-4 bg-gray-50 border-t flex justify-center">
// //                   <button
// //                     onClick={() => handleChangeAvailability(tour._id)}
// //                     disabled={isLoading}
// //                     className={`px-8 py-3 rounded-xl text-white font-medium min-w-[160px] transition shadow-sm ${
// //                       tour.available
// //                         ? "bg-green-600 hover:bg-green-700"
// //                         : "bg-red-600 hover:bg-red-700"
// //                     } disabled:opacity-60`}
// //                   >
// //                     {tour.available ? "Available" : "Unavailable"}
// //                   </button>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         </>
// //       )}
// //     </div>
// //   );
// // };

// // export default ToursList;

// // import React, { useContext, useEffect, useState } from "react";
// // import { TourAdminContext } from "../../context/TourAdminContext";
// // import { toast, ToastContainer } from "react-toastify";
// // import "react-toastify/dist/ReactToastify.css";
// // import jsPDF from "jspdf";
// // import autoTable from "jspdf-autotable";

// // const ToursList = () => {
// //   const {
// //     tours,
// //     bookings,
// //     getAllTours,
// //     getAllBookings,
// //     changeTourAvailablity,
// //     closeTourBookings,
// //     reopenTourBookings,
// //     cancelEntireTrip,
// //   } = useContext(TourAdminContext);

// //   const [filterText, setFilterText] = useState("");
// //   const [isLoading, setIsLoading] = useState(false);

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       setIsLoading(true);
// //       try {
// //         const [toursResponse, bookingsResponse] = await Promise.all([
// //           getAllTours(),
// //           getAllBookings(),
// //         ]);
// //       } catch (error) {
// //         console.error("Error fetching data:", error.message);
// //         toast.error("Failed to fetch tours or bookings");
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };

// //     fetchData();
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);

// //   // Helper: Get valid travellers for a tour (strict rules)
// //   const getValidTravellers = (tourId) => {
// //     if (!tourId) {
// //       console.warn("Invalid tourId:", tourId);
// //       return [];
// //     }

// //     const validBookings = bookings.filter((b) => {
// //       const isValid =
// //         b.tourId?.toString() === tourId.toString() &&
// //         b.payment?.advance?.paid === true &&
// //         b.payment?.balance?.paid === true &&
// //         b.isBookingCompleted === true;
// //       return isValid;
// //     });

// //     const travellers = validBookings.flatMap((b) => {
// //       const validTravellers = (b.travellers || []).filter(
// //         (t) =>
// //           t.cancelled?.byTraveller !== true && t.cancelled?.byAdmin !== true,
// //       );
// //       return validTravellers;
// //     });

// //     return travellers;
// //   };

// //   // Count functions
// //   const getTravellerCount = (tourId) => {
// //     const count = getValidTravellers(tourId).length;
// //     return count;
// //   };

// //   const getCancellationCount = (tourId) => {
// //     const count = bookings
// //       .filter((b) => b.tourId?.toString() === tourId.toString())
// //       // NOTE: previously also required b.isBookingCompleted === true here,
// //       // which silently excluded EVERY active/upcoming booking's
// //       // cancellations — a traveller who cancelled on a booking that
// //       // hasn't been marked "Completed" yet still counts as a real
// //       // cancellation for this tour, so that condition is removed.
// //       .reduce((count, b) => {
// //         const cancelledTravellers = (b.travellers || []).filter(
// //           (t) =>
// //             t.cancelled?.byTraveller === true && t.cancelled?.byAdmin === true,
// //         );
// //         return count + cancelledTravellers.length;
// //       }, 0);
// //     return count;
// //   };

// //   const getDoubleSharingCount = (tourId) => {
// //     const count = getValidTravellers(tourId).filter(
// //       (t) => t.sharingType === "double" && t.sharingType !== "withBerth",
// //     ).length;
// //     return count;
// //   };

// //   const getTripleSharingCount = (tourId) => {
// //     const count = getValidTravellers(tourId).filter(
// //       (t) => t.sharingType === "triple" && t.sharingType !== "withBerth",
// //     ).length;
// //     return count;
// //   };

// //   const getChildAndWithBerthCount = (tourId) => {
// //     const travellers = getValidTravellers(tourId);
// //     const count = travellers.filter(
// //       (t) =>
// //         t.sharingType === "withBerth" || t.gender?.toLowerCase() === "other",
// //     ).length;
// //     return count;
// //   };

// //   const getMaleCount = (tourId) => {
// //     const count = getValidTravellers(tourId).filter(
// //       (t) =>
// //         t.gender?.toLowerCase() === "male" && t.sharingType !== "withBerth",
// //     ).length;
// //     return count;
// //   };

// //   const getFemaleCount = (tourId) => {
// //     const count = getValidTravellers(tourId).filter(
// //       (t) =>
// //         t.gender?.toLowerCase() === "female" && t.sharingType !== "withBerth",
// //     ).length;
// //     return count;
// //   };

// //   // Filter tours by title
// //   const filteredTours = tours.filter(
// //     (tour) =>
// //       tour?.title?.toLowerCase()?.includes(filterText.toLowerCase()) ?? false,
// //   );

// //   // Export filtered tours to PDF
// //   const exportPDF = () => {
// //     const doc = new jsPDF();
// //     doc.text("Tours Summary", 14, 15);

// //     const tableColumn = [
// //       "S.No",
// //       "Tour Title",
// //       "Travellers",
// //       "Cancellations",
// //       "Double",
// //       "Triple",
// //       "Male",
// //       "Female",
// //       "Child",
// //       "Availability",
// //     ];

// //     const tableRows = filteredTours.map((tour, index) => {
// //       const row = [
// //         index + 1,
// //         tour.title || "Unknown",
// //         getTravellerCount(tour._id),
// //         getCancellationCount(tour._id),
// //         getDoubleSharingCount(tour._id),
// //         getTripleSharingCount(tour._id),
// //         getMaleCount(tour._id),
// //         getFemaleCount(tour._id),
// //         getChildAndWithBerthCount(tour._id),
// //         tour.available ? "Available" : "Unavailable",
// //       ];
// //       return row;
// //     });

// //     autoTable(doc, {
// //       head: [tableColumn],
// //       body: tableRows,
// //       startY: 20,
// //     });

// //     doc.save("Tours_Summary.pdf");
// //   };

// //   // Handle tour availability change
// //   const handleChangeAvailability = async (tourId) => {
// //     const confirm = window.confirm(
// //       "Are you sure you want to change the tour availability?",
// //     );
// //     if (!confirm) return;

// //     setIsLoading(true);
// //     try {
// //       const response = await changeTourAvailablity(tourId);
// //       if (response.success) {
// //         toast.success("Tour availability changed successfully");
// //         await getAllTours(); // Refresh tours after availability change
// //       } else {
// //         toast.error(response.message || "Failed to change tour availability");
// //       }
// //     } catch (error) {
// //       toast.error(
// //         error.response?.data?.message ||
// //           error.message ||
// //           "Failed to change tour availability",
// //       );
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   // Handle booking closed — blocks NEW bookings on the customer-facing
// //   // page, doesn't touch existing travellers/bookings at all.
// //   const handleCloseBookings = async (tourId, currentlyClosed) => {
// //     const confirm = window.confirm(
// //       currentlyClosed
// //         ? "Reopen bookings for this tour? Customers will be able to book again."
// //         : "Close bookings for this tour? New customer bookings will be blocked immediately. Existing travellers are NOT affected.",
// //     );
// //     if (!confirm) return;

// //     setIsLoading(true);
// //     try {
// //       const response = currentlyClosed
// //         ? await reopenTourBookings(tourId)
// //         : await closeTourBookings(tourId);

// //       if (response.success) {
// //         toast.success(response.message || "Updated successfully");
// //       } else {
// //         toast.error(response.message || "Failed to update booking status");
// //       }
// //     } catch (error) {
// //       toast.error(error.message || "Failed to update booking status");
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   // Handle trip cancelled — cancels the WHOLE trip: every traveller on
// //   // every booking for this tour gets cancelled (except ones already
// //   // individually cancelled), backend-side. TourBookings.jsx's existing
// //   // "all travellers cancelled" logic then automatically moves every
// //   // affected booking into its Cancelled section with disabled buttons —
// //   // no separate button-blocking code needed here.
// //   const handleCancelTrip = async (tourId, tourTitle) => {
// //     const confirm = window.confirm(
// //       `Cancel the ENTIRE trip "${tourTitle}"?\n\nThis cancels EVERY traveller on EVERY booking for this tour (except any already individually cancelled). This cannot be easily undone — are you sure?`,
// //     );
// //     if (!confirm) return;

// //     setIsLoading(true);
// //     try {
// //       const response = await cancelEntireTrip(tourId);

// //       if (response.success) {
// //         toast.success(response.message || "Trip cancelled");
// //       } else {
// //         toast.error(response.message || "Failed to cancel trip");
// //       }
// //     } catch (error) {
// //       toast.error(error.message || "Failed to cancel trip");
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
// //       <ToastContainer
// //         position="top-right"
// //         autoClose={3000}
// //         hideProgressBar={false}
// //         newestOnTop
// //         closeOnClick
// //         rtl={false}
// //         pauseOnFocusLoss
// //         draggable
// //         pauseOnHover
// //       />

// //       <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
// //         <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center lg:text-left w-full">
// //           Tours Controls
// //         </h1>

// //         <button
// //           onClick={exportPDF}
// //           disabled={isLoading}
// //           className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition shadow-sm disabled:opacity-60 text-sm sm:text-base"
// //         >
// //           {isLoading ? "Processing..." : "Export PDF"}
// //         </button>
// //       </div>

// //       <input
// //         type="text"
// //         placeholder="Filter by Tour Title..."
// //         value={filterText}
// //         onChange={(e) => setFilterText(e.target.value)}
// //         disabled={isLoading}
// //         className="w-full max-w-lg mb-6 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-60"
// //       />

// //       {isLoading ? (
// //         <div className="text-center py-12 text-gray-500">Loading tours...</div>
// //       ) : filteredTours.length === 0 ? (
// //         <div className="text-center py-12 text-gray-500">No tours found</div>
// //       ) : (
// //         <>
// //           {/* DESKTOP TABLE - visible from md+ */}
// //           <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
// //             <table className="min-w-full divide-y divide-gray-200 text-sm">
// //               <thead className="bg-gray-50">
// //                 <tr>
// //                   <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider w-12">
// //                     S.No
// //                   </th>
// //                   <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
// //                     Tour Title
// //                   </th>
// //                   <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
// //                     Travellers
// //                   </th>
// //                   <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
// //                     Cancellations
// //                   </th>
// //                   <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
// //                     Double
// //                   </th>
// //                   <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
// //                     Triple
// //                   </th>
// //                   <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
// //                     Male
// //                   </th>
// //                   <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
// //                     Female
// //                   </th>
// //                   <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
// //                     Child
// //                   </th>
// //                   <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
// //                     Availability
// //                   </th>
// //                   <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
// //                     Trip Status
// //                   </th>
// //                 </tr>
// //               </thead>
// //               <tbody className="bg-white divide-y divide-gray-200">
// //                 {filteredTours.map((tour, index) => (
// //                   <tr key={tour._id} className="hover:bg-gray-50">
// //                     <td className="px-4 py-4 whitespace-nowrap text-center font-medium">
// //                       {index + 1}
// //                     </td>
// //                     <td className="px-6 py-4 font-medium text-gray-900">
// //                       {tour.title || "Unknown"}
// //                     </td>
// //                     <td className="px-4 py-4 text-center font-semibold">
// //                       {getTravellerCount(tour._id)}
// //                     </td>
// //                     <td className="px-4 py-4 text-center text-red-600">
// //                       {getCancellationCount(tour._id)}
// //                     </td>
// //                     <td className="px-4 py-4 text-center">
// //                       {getDoubleSharingCount(tour._id)}
// //                     </td>
// //                     <td className="px-4 py-4 text-center">
// //                       {getTripleSharingCount(tour._id)}
// //                     </td>
// //                     <td className="px-4 py-4 text-center text-blue-600">
// //                       {getMaleCount(tour._id)}
// //                     </td>
// //                     <td className="px-4 py-4 text-center text-pink-600">
// //                       {getFemaleCount(tour._id)}
// //                     </td>
// //                     <td className="px-4 py-4 text-center text-purple-600">
// //                       {getChildAndWithBerthCount(tour._id)}
// //                     </td>
// //                     <td className="px-6 py-4 text-center">
// //                       <button
// //                         onClick={() => handleChangeAvailability(tour._id)}
// //                         disabled={isLoading}
// //                         className={`px-5 py-2 rounded-lg text-white text-sm font-medium min-w-[120px] transition ${
// //                           tour.available
// //                             ? "bg-green-600 hover:bg-green-700"
// //                             : "bg-red-600 hover:bg-red-700"
// //                         } disabled:opacity-60`}
// //                       >
// //                         {tour.available ? "Available" : "Unavailable"}
// //                       </button>
// //                     </td>
// //                     <td className="px-6 py-4 text-center">
// //                       {tour.tripCancelled ? (
// //                         <span className="px-4 py-2 rounded-lg bg-gray-200 text-gray-500 text-xs font-bold inline-block min-w-[130px]">
// //                           🚫 Trip Cancelled
// //                         </span>
// //                       ) : (
// //                         <div className="flex flex-col gap-2 items-center">
// //                           <button
// //                             onClick={() =>
// //                               handleCloseBookings(tour._id, tour.bookingClosed)
// //                             }
// //                             disabled={isLoading}
// //                             className={`px-4 py-1.5 rounded-lg text-white text-xs font-medium min-w-[130px] transition disabled:opacity-60 ${
// //                               tour.bookingClosed
// //                                 ? "bg-amber-500 hover:bg-amber-600"
// //                                 : "bg-slate-500 hover:bg-slate-600"
// //                             }`}
// //                           >
// //                             {tour.bookingClosed
// //                               ? "Booking Closed"
// //                               : "Close Booking"}
// //                           </button>
// //                           <button
// //                             onClick={() =>
// //                               handleCancelTrip(tour._id, tour.title)
// //                             }
// //                             disabled={isLoading}
// //                             className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium min-w-[130px] transition disabled:opacity-60"
// //                           >
// //                             Trip Cancelled
// //                           </button>
// //                         </div>
// //                       )}
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>

// //           {/* MOBILE CARDS - visible below md */}
// //           <div className="md:hidden space-y-5">
// //             {filteredTours.map((tour, index) => (
// //               <div
// //                 key={tour._id}
// //                 className="bg-white border border-gray-200 rounded-xl shadow overflow-hidden"
// //               >
// //                 <div className="bg-gray-50 px-4 py-3 border-b">
// //                   <div className="flex justify-between items-start gap-3">
// //                     <h3 className="font-semibold text-base leading-tight line-clamp-2">
// //                       {tour.title || "Unknown Tour"}
// //                     </h3>
// //                     <span className="text-xs text-gray-500 font-medium shrink-0">
// //                       #{index + 1}
// //                     </span>
// //                   </div>
// //                 </div>

// //                 <div className="grid grid-cols-3 gap-3 p-4 text-center text-sm">
// //                   <div>
// //                     <div className="text-gray-500 text-xs mb-1">Travellers</div>
// //                     <div className="font-bold text-lg">
// //                       {getTravellerCount(tour._id)}
// //                     </div>
// //                   </div>
// //                   <div>
// //                     <div className="text-gray-500 text-xs mb-1">
// //                       Cancellations
// //                     </div>
// //                     <div className="font-bold text-lg text-red-600">
// //                       {getCancellationCount(tour._id)}
// //                     </div>
// //                   </div>
// //                   <div>
// //                     <div className="text-gray-500 text-xs mb-1">Child</div>
// //                     <div className="font-bold text-lg">
// //                       {getChildAndWithBerthCount(tour._id)}
// //                     </div>
// //                   </div>

// //                   <div>
// //                     <div className="text-gray-500 text-xs mb-1">Double</div>
// //                     <div className="font-bold text-lg">
// //                       {getDoubleSharingCount(tour._id)}
// //                     </div>
// //                   </div>
// //                   <div>
// //                     <div className="text-gray-500 text-xs mb-1">Triple</div>
// //                     <div className="font-bold text-lg">
// //                       {getTripleSharingCount(tour._id)}
// //                     </div>
// //                   </div>
// //                   <div className="col-span-3 mt-2">
// //                     <div className="flex justify-center gap-8">
// //                       <div>
// //                         <div className="text-gray-500 text-xs">Male</div>
// //                         <div className="font-bold text-blue-600">
// //                           {getMaleCount(tour._id)}
// //                         </div>
// //                       </div>
// //                       <div>
// //                         <div className="text-gray-500 text-xs">Female</div>
// //                         <div className="font-bold text-pink-600">
// //                           {getFemaleCount(tour._id)}
// //                         </div>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <div className="px-4 py-4 bg-gray-50 border-t flex flex-col gap-3 items-center">
// //                   <button
// //                     onClick={() => handleChangeAvailability(tour._id)}
// //                     disabled={isLoading}
// //                     className={`px-8 py-3 rounded-xl text-white font-medium min-w-[160px] transition shadow-sm ${
// //                       tour.available
// //                         ? "bg-green-600 hover:bg-green-700"
// //                         : "bg-red-600 hover:bg-red-700"
// //                     } disabled:opacity-60`}
// //                   >
// //                     {tour.available ? "Available" : "Unavailable"}
// //                   </button>

// //                   {tour.tripCancelled ? (
// //                     <span className="px-6 py-2 rounded-xl bg-gray-200 text-gray-500 text-sm font-bold">
// //                       🚫 Trip Cancelled
// //                     </span>
// //                   ) : (
// //                     <div className="flex gap-3 w-full">
// //                       <button
// //                         onClick={() =>
// //                           handleCloseBookings(tour._id, tour.bookingClosed)
// //                         }
// //                         disabled={isLoading}
// //                         className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition disabled:opacity-60 ${
// //                           tour.bookingClosed
// //                             ? "bg-amber-500 hover:bg-amber-600"
// //                             : "bg-slate-500 hover:bg-slate-600"
// //                         }`}
// //                       >
// //                         {tour.bookingClosed
// //                           ? "Booking Closed"
// //                           : "Close Booking"}
// //                       </button>
// //                       <button
// //                         onClick={() => handleCancelTrip(tour._id, tour.title)}
// //                         disabled={isLoading}
// //                         className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition disabled:opacity-60"
// //                       >
// //                         Trip Cancelled
// //                       </button>
// //                     </div>
// //                   )}
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         </>
// //       )}
// //     </div>
// //   );
// // };

// // export default ToursList;


// import React, { useContext, useEffect, useState } from "react";
// import { TourAdminContext } from "../../context/TourAdminContext";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const ToursList = () => {
//   const {
//     tours,
//     bookings,
//     getAllTours,
//     getAllBookings,
//     changeTourAvailablity,
//     closeTourBookings,
//     reopenTourBookings,
//     cancelEntireTrip,
//   } = useContext(TourAdminContext);

//   const [filterText, setFilterText] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       try {
//         const [toursResponse, bookingsResponse] = await Promise.all([
//           getAllTours(),
//           getAllBookings(),
//         ]);
//       } catch (error) {
//         console.error("Error fetching data:", error.message);
//         toast.error("Failed to fetch tours or bookings");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Helper: Get valid travellers for a tour (strict rules)
//   const getValidTravellers = (tourId) => {
//     if (!tourId) {
//       console.warn("Invalid tourId:", tourId);
//       return [];
//     }

//     const validBookings = bookings.filter((b) => {
//       const isValid =
//         b.tourId?.toString() === tourId.toString() &&
//         b.payment?.advance?.paid === true &&
//         b.payment?.balance?.paid === true &&
//         b.isBookingCompleted === true;
//       return isValid;
//     });

//     const travellers = validBookings.flatMap((b) => {
//       const validTravellers = (b.travellers || []).filter(
//         (t) =>
//           t.cancelled?.byTraveller !== true && t.cancelled?.byAdmin !== true,
//       );
//       return validTravellers;
//     });

//     return travellers;
//   };

//   // Count functions
//   const getTravellerCount = (tourId) => {
//     const count = getValidTravellers(tourId).length;
//     return count;
//   };

//   const getCancellationCount = (tourId) => {
//     const count = bookings
//       .filter((b) => b.tourId?.toString() === tourId.toString())
//       // NOTE: previously also required b.isBookingCompleted === true here,
//       // which silently excluded EVERY active/upcoming booking's
//       // cancellations — a traveller who cancelled on a booking that
//       // hasn't been marked "Completed" yet still counts as a real
//       // cancellation for this tour, so that condition is removed.
//       .reduce((count, b) => {
//         const cancelledTravellers = (b.travellers || []).filter(
//           (t) =>
//             t.cancelled?.byTraveller === true && t.cancelled?.byAdmin === true,
//         );
//         return count + cancelledTravellers.length;
//       }, 0);
//     return count;
//   };

//   const getDoubleSharingCount = (tourId) => {
//     const count = getValidTravellers(tourId).filter(
//       (t) => t.sharingType === "double" && t.sharingType !== "withBerth",
//     ).length;
//     return count;
//   };

//   const getTripleSharingCount = (tourId) => {
//     const count = getValidTravellers(tourId).filter(
//       (t) => t.sharingType === "triple" && t.sharingType !== "withBerth",
//     ).length;
//     return count;
//   };

//   const getChildAndWithBerthCount = (tourId) => {
//     const travellers = getValidTravellers(tourId);
//     const count = travellers.filter(
//       (t) =>
//         t.sharingType === "withBerth" || t.gender?.toLowerCase() === "other",
//     ).length;
//     return count;
//   };

//   const getMaleCount = (tourId) => {
//     const count = getValidTravellers(tourId).filter(
//       (t) =>
//         t.gender?.toLowerCase() === "male" && t.sharingType !== "withBerth",
//     ).length;
//     return count;
//   };

//   const getFemaleCount = (tourId) => {
//     const count = getValidTravellers(tourId).filter(
//       (t) =>
//         t.gender?.toLowerCase() === "female" && t.sharingType !== "withBerth",
//     ).length;
//     return count;
//   };

//   // Filter tours by title
//   const filteredTours = tours.filter(
//     (tour) =>
//       tour?.title?.toLowerCase()?.includes(filterText.toLowerCase()) ?? false,
//   );

//   // Export filtered tours to PDF
//   const exportPDF = () => {
//     const doc = new jsPDF();
//     doc.text("Tours Summary", 14, 15);

//     const tableColumn = [
//       "S.No",
//       "Tour Title",
//       "Travellers",
//       "Cancellations",
//       "Double",
//       "Triple",
//       "Male",
//       "Female",
//       "Child",
//       "Availability",
//     ];

//     const tableRows = filteredTours.map((tour, index) => {
//       const row = [
//         index + 1,
//         tour.title || "Unknown",
//         getTravellerCount(tour._id),
//         getCancellationCount(tour._id),
//         getDoubleSharingCount(tour._id),
//         getTripleSharingCount(tour._id),
//         getMaleCount(tour._id),
//         getFemaleCount(tour._id),
//         getChildAndWithBerthCount(tour._id),
//         tour.available ? "Available" : "Unavailable",
//       ];
//       return row;
//     });

//     autoTable(doc, {
//       head: [tableColumn],
//       body: tableRows,
//       startY: 20,
//     });

//     doc.save("Tours_Summary.pdf");
//   };

//   // Handle tour availability change
//   const handleChangeAvailability = async (tourId) => {
//     const confirm = window.confirm(
//       "Are you sure you want to change the tour availability?",
//     );
//     if (!confirm) return;

//     setIsLoading(true);
//     try {
//       const response = await changeTourAvailablity(tourId);
//       if (response.success) {
//         toast.success("Tour availability changed successfully");
//         await getAllTours(); // Refresh tours after availability change
//       } else {
//         toast.error(response.message || "Failed to change tour availability");
//       }
//     } catch (error) {
//       toast.error(
//         error.response?.data?.message ||
//           error.message ||
//           "Failed to change tour availability",
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle booking closed — blocks NEW bookings on the customer-facing
//   // page, doesn't touch existing travellers/bookings at all.
//   const handleCloseBookings = async (tourId, currentlyClosed) => {
//     const confirm = window.confirm(
//       currentlyClosed
//         ? "Reopen bookings for this tour? Customers will be able to book again."
//         : "Close bookings for this tour? New customer bookings will be blocked immediately. Existing travellers are NOT affected.",
//     );
//     if (!confirm) return;

//     setIsLoading(true);
//     try {
//       const response = currentlyClosed
//         ? await reopenTourBookings(tourId)
//         : await closeTourBookings(tourId);

//       if (response.success) {
//         toast.success(response.message || "Updated successfully");
//       } else {
//         toast.error(response.message || "Failed to update booking status");
//       }
//     } catch (error) {
//       toast.error(error.message || "Failed to update booking status");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle trip cancelled — cancels the WHOLE trip: every traveller on
//   // every booking for this tour gets cancelled (except ones already
//   // individually cancelled), backend-side. TourBookings.jsx's existing
//   // "all travellers cancelled" logic then automatically moves every
//   // affected booking into its Cancelled section with disabled buttons —
//   // no separate button-blocking code needed here.
//   const handleCancelTrip = async (tourId, tourTitle) => {
//     const confirm = window.confirm(
//       `Cancel the ENTIRE trip "${tourTitle}"?\n\nThis cancels EVERY traveller on EVERY booking for this tour (except any already individually cancelled). This cannot be easily undone — are you sure?`,
//     );
//     if (!confirm) return;

//     setIsLoading(true);
//     try {
//       const response = await cancelEntireTrip(tourId);

//       if (response.success) {
//         toast.success(response.message || "Trip cancelled");
//       } else {
//         toast.error(response.message || "Failed to cancel trip");
//       }
//     } catch (error) {
//       toast.error(error.message || "Failed to cancel trip");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="w-full min-w-0 max-w-full p-3 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//       />

//       <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 px-1">
//         <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 text-center sm:text-left w-full">
//           Tours Controls
//         </h1>

//         <button
//           onClick={exportPDF}
//           disabled={isLoading}
//           className="w-full sm:w-auto px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition shadow-sm disabled:opacity-60 text-sm sm:text-base whitespace-nowrap"
//         >
//           {isLoading ? "Processing..." : "Export PDF"}
//         </button>
//       </div>

//       <input
//         type="text"
//         placeholder="Filter by Tour Title..."
//         value={filterText}
//         onChange={(e) => setFilterText(e.target.value)}
//         disabled={isLoading}
//         className="w-full sm:max-w-lg mb-6 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-60 text-sm sm:text-base"
//       />

//       {isLoading ? (
//         <div className="text-center py-12 text-gray-500">Loading tours...</div>
//       ) : filteredTours.length === 0 ? (
//         <div className="text-center py-12 text-gray-500">No tours found</div>
//       ) : (
//         <>
//           {/* DESKTOP TABLE - visible from lg+ (tablets fall back to cards) */}
//           <div className="hidden lg:block w-full min-w-0 border border-gray-200 rounded-xl shadow-sm overflow-hidden">
//             <table className="w-full table-fixed divide-y divide-gray-200 text-[11px] xl:text-xs">
//               <colgroup>
//                 <col className="w-[3%]" />
//                 <col className="w-[20%]" />
//                 <col className="w-[7%]" />
//                 <col className="w-[10%]" />
//                 <col className="w-[5%]" />
//                 <col className="w-[5%]" />
//                 <col className="w-[6%]" />
//                 <col className="w-[6%]" />
//                 <col className="w-[6%]" />
//                 <col className="w-[11%]" />
//                 <col className="w-[12%]" />
//               </colgroup>
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-1.5 py-2.5 text-left font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
//                     S.No
//                   </th>
//                   <th className="px-1.5 py-2.5 text-left font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
//                     Tour Title
//                   </th>
//                   <th className="px-1 py-2.5 text-center font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
//                     Travellers
//                   </th>
//                   <th className="px-1 py-2.5 text-center font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
//                     Cancellations
//                   </th>
//                   <th className="px-1 py-2.5 text-center font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
//                     Double
//                   </th>
//                   <th className="px-1 py-2.5 text-center font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
//                     Triple
//                   </th>
//                   <th className="px-1 py-2.5 text-center font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
//                     Male
//                   </th>
//                   <th className="px-1 py-2.5 text-center font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
//                     Female
//                   </th>
//                   <th className="px-1 py-2.5 text-center font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
//                     Child
//                   </th>
//                   <th className="px-1.5 py-2.5 text-center font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
//                     Availability
//                   </th>
//                   <th className="px-1.5 py-2.5 text-center font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
//                     Trip Status
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredTours.map((tour, index) => (
//                   <tr key={tour._id} className="hover:bg-gray-50 align-top">
//                     <td className="px-2 py-3 text-center font-medium">
//                       {index + 1}
//                     </td>
//                     <td className="px-2 py-3 font-medium text-gray-900">
//                       <span className="line-clamp-2 break-words">
//                         {tour.title || "Unknown"}
//                       </span>
//                     </td>
//                     <td className="px-1 py-3 text-center font-semibold">
//                       {getTravellerCount(tour._id)}
//                     </td>
//                     <td className="px-1 py-3 text-center text-red-600">
//                       {getCancellationCount(tour._id)}
//                     </td>
//                     <td className="px-1 py-3 text-center">
//                       {getDoubleSharingCount(tour._id)}
//                     </td>
//                     <td className="px-1 py-3 text-center">
//                       {getTripleSharingCount(tour._id)}
//                     </td>
//                     <td className="px-1 py-3 text-center text-blue-600">
//                       {getMaleCount(tour._id)}
//                     </td>
//                     <td className="px-1 py-3 text-center text-pink-600">
//                       {getFemaleCount(tour._id)}
//                     </td>
//                     <td className="px-1 py-3 text-center text-purple-600">
//                       {getChildAndWithBerthCount(tour._id)}
//                     </td>
//                     <td className="px-2 py-3 text-center">
//                       <button
//                         onClick={() => handleChangeAvailability(tour._id)}
//                         disabled={isLoading}
//                         className={`px-2 py-1 rounded-md text-white font-medium transition text-[10px] xl:text-[11px] ${
//                           tour.available
//                             ? "bg-green-600 hover:bg-green-700"
//                             : "bg-red-600 hover:bg-red-700"
//                         } disabled:opacity-60`}
//                       >
//                         {tour.available ? "Available" : "Unavailable"}
//                       </button>
//                     </td>
//                     <td className="px-2 py-3 text-center">
//                       {tour.tripCancelled ? (
//                         <span className="inline-block px-2 py-1 rounded-md bg-gray-200 text-gray-500 font-bold text-[10px] xl:text-[11px]">
//                           🚫 Cancelled
//                         </span>
//                       ) : (
//                         <div className="flex gap-1 justify-center">
//                           <button
//                             onClick={() =>
//                               handleCloseBookings(tour._id, tour.bookingClosed)
//                             }
//                             disabled={isLoading}
//                             className={`px-2 py-1 rounded-md text-white font-medium transition disabled:opacity-60 text-[10px] xl:text-[11px] ${
//                               tour.bookingClosed
//                                 ? "bg-amber-500 hover:bg-amber-600"
//                                 : "bg-slate-500 hover:bg-slate-600"
//                             }`}
//                           >
//                             {tour.bookingClosed ? "Closed" : "Close"}
//                           </button>
//                           <button
//                             onClick={() =>
//                               handleCancelTrip(tour._id, tour.title)
//                             }
//                             disabled={isLoading}
//                             className="px-2 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium transition disabled:opacity-60 text-[10px] xl:text-[11px]"
//                           >
//                             Cancel
//                           </button>
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* MOBILE / TABLET CARDS - visible below lg */}
//           <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
//             {filteredTours.map((tour, index) => (
//               <div
//                 key={tour._id}
//                 className="bg-white border border-gray-200 rounded-xl shadow overflow-hidden flex flex-col"
//               >
//                 <div className="bg-gray-50 px-4 py-3 border-b">
//                   <div className="flex justify-between items-start gap-3">
//                     <h3 className="font-semibold text-base leading-tight line-clamp-2">
//                       {tour.title || "Unknown Tour"}
//                     </h3>
//                     <span className="text-xs text-gray-500 font-medium shrink-0">
//                       #{index + 1}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-3 p-4 text-center text-sm flex-1">
//                   <div>
//                     <div className="text-gray-500 text-xs mb-1">Travellers</div>
//                     <div className="font-bold text-lg">
//                       {getTravellerCount(tour._id)}
//                     </div>
//                   </div>
//                   <div>
//                     <div className="text-gray-500 text-xs mb-1">
//                       Cancellations
//                     </div>
//                     <div className="font-bold text-lg text-red-600">
//                       {getCancellationCount(tour._id)}
//                     </div>
//                   </div>
//                   <div>
//                     <div className="text-gray-500 text-xs mb-1">Child</div>
//                     <div className="font-bold text-lg">
//                       {getChildAndWithBerthCount(tour._id)}
//                     </div>
//                   </div>

//                   <div>
//                     <div className="text-gray-500 text-xs mb-1">Double</div>
//                     <div className="font-bold text-lg">
//                       {getDoubleSharingCount(tour._id)}
//                     </div>
//                   </div>
//                   <div>
//                     <div className="text-gray-500 text-xs mb-1">Triple</div>
//                     <div className="font-bold text-lg">
//                       {getTripleSharingCount(tour._id)}
//                     </div>
//                   </div>
//                   <div className="col-span-3 mt-2">
//                     <div className="flex justify-center gap-8">
//                       <div>
//                         <div className="text-gray-500 text-xs">Male</div>
//                         <div className="font-bold text-blue-600">
//                           {getMaleCount(tour._id)}
//                         </div>
//                       </div>
//                       <div>
//                         <div className="text-gray-500 text-xs">Female</div>
//                         <div className="font-bold text-pink-600">
//                           {getFemaleCount(tour._id)}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="px-4 py-4 bg-gray-50 border-t flex flex-col gap-3 items-center mt-auto">
//                   <button
//                     onClick={() => handleChangeAvailability(tour._id)}
//                     disabled={isLoading}
//                     className={`w-full px-8 py-3 rounded-xl text-white font-medium transition shadow-sm ${
//                       tour.available
//                         ? "bg-green-600 hover:bg-green-700"
//                         : "bg-red-600 hover:bg-red-700"
//                     } disabled:opacity-60`}
//                   >
//                     {tour.available ? "Available" : "Unavailable"}
//                   </button>

//                   {tour.tripCancelled ? (
//                     <span className="px-6 py-2 rounded-xl bg-gray-200 text-gray-500 text-sm font-bold">
//                       🚫 Trip Cancelled
//                     </span>
//                   ) : (
//                     <div className="flex gap-3 w-full">
//                       <button
//                         onClick={() =>
//                           handleCloseBookings(tour._id, tour.bookingClosed)
//                         }
//                         disabled={isLoading}
//                         className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition disabled:opacity-60 ${
//                           tour.bookingClosed
//                             ? "bg-amber-500 hover:bg-amber-600"
//                             : "bg-slate-500 hover:bg-slate-600"
//                         }`}
//                       >
//                         {tour.bookingClosed
//                           ? "Booking Closed"
//                           : "Close Booking"}
//                       </button>
//                       <button
//                         onClick={() => handleCancelTrip(tour._id, tour.title)}
//                         disabled={isLoading}
//                         className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition disabled:opacity-60"
//                       >
//                         Trip Cancelled
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ToursList;


import React, { useContext, useEffect, useState } from "react";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ToursList = () => {
  const {
    tours,
    bookings,
    getAllTours,
    getAllBookings,
    changeTourAvailablity,
    closeTourBookings,
    reopenTourBookings,
    cancelEntireTrip,
    reopenEntireTrip, // NEW — reverses cancelEntireTrip
  } = useContext(TourAdminContext);

  const [filterText, setFilterText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [toursResponse, bookingsResponse] = await Promise.all([
          getAllTours(),
          getAllBookings(),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        toast.error("Failed to fetch tours or bookings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper: Get valid travellers for a tour (strict rules)
  const getValidTravellers = (tourId) => {
    if (!tourId) {
      console.warn("Invalid tourId:", tourId);
      return [];
    }

    const validBookings = bookings.filter((b) => {
      const isValid =
        b.tourId?.toString() === tourId.toString() &&
        b.payment?.advance?.paid === true &&
        b.payment?.balance?.paid === true &&
        b.isBookingCompleted === true;
      return isValid;
    });

    const travellers = validBookings.flatMap((b) => {
      const validTravellers = (b.travellers || []).filter(
        (t) =>
          t.cancelled?.byTraveller !== true && t.cancelled?.byAdmin !== true,
      );
      return validTravellers;
    });

    return travellers;
  };

  // Count functions
  const getTravellerCount = (tourId) => {
    const count = getValidTravellers(tourId).length;
    return count;
  };

  const getCancellationCount = (tourId) => {
    const count = bookings
      .filter((b) => b.tourId?.toString() === tourId.toString())
      // NOTE: previously also required b.isBookingCompleted === true here,
      // which silently excluded EVERY active/upcoming booking's
      // cancellations — a traveller who cancelled on a booking that
      // hasn't been marked "Completed" yet still counts as a real
      // cancellation for this tour, so that condition is removed.
      .reduce((count, b) => {
        const cancelledTravellers = (b.travellers || []).filter(
          (t) =>
            t.cancelled?.byTraveller === true && t.cancelled?.byAdmin === true,
        );
        return count + cancelledTravellers.length;
      }, 0);
    return count;
  };

  const getDoubleSharingCount = (tourId) => {
    const count = getValidTravellers(tourId).filter(
      (t) => t.sharingType === "double" && t.sharingType !== "withBerth",
    ).length;
    return count;
  };

  const getTripleSharingCount = (tourId) => {
    const count = getValidTravellers(tourId).filter(
      (t) => t.sharingType === "triple" && t.sharingType !== "withBerth",
    ).length;
    return count;
  };

  const getChildAndWithBerthCount = (tourId) => {
    const travellers = getValidTravellers(tourId);
    const count = travellers.filter(
      (t) =>
        t.sharingType === "withBerth" || t.gender?.toLowerCase() === "other",
    ).length;
    return count;
  };

  const getMaleCount = (tourId) => {
    const count = getValidTravellers(tourId).filter(
      (t) =>
        t.gender?.toLowerCase() === "male" && t.sharingType !== "withBerth",
    ).length;
    return count;
  };

  const getFemaleCount = (tourId) => {
    const count = getValidTravellers(tourId).filter(
      (t) =>
        t.gender?.toLowerCase() === "female" && t.sharingType !== "withBerth",
    ).length;
    return count;
  };

  // Filter tours by title
  const filteredTours = tours.filter(
    (tour) =>
      tour?.title?.toLowerCase()?.includes(filterText.toLowerCase()) ?? false,
  );

  // Export filtered tours to PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Tours Summary", 14, 15);

    const tableColumn = [
      "S.No",
      "Tour Title",
      "Travellers",
      "Cancellations",
      "Double",
      "Triple",
      "Male",
      "Female",
      "Child",
      "Availability",
    ];

    const tableRows = filteredTours.map((tour, index) => {
      const row = [
        index + 1,
        tour.title || "Unknown",
        getTravellerCount(tour._id),
        getCancellationCount(tour._id),
        getDoubleSharingCount(tour._id),
        getTripleSharingCount(tour._id),
        getMaleCount(tour._id),
        getFemaleCount(tour._id),
        getChildAndWithBerthCount(tour._id),
        tour.available ? "Available" : "Unavailable",
      ];
      return row;
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("Tours_Summary.pdf");
  };

  // Handle tour availability change
  const handleChangeAvailability = async (tourId) => {
    const confirm = window.confirm(
      "Are you sure you want to change the tour availability?",
    );
    if (!confirm) return;

    setIsLoading(true);
    try {
      const response = await changeTourAvailablity(tourId);
      if (response.success) {
        toast.success("Tour availability changed successfully");
        await getAllTours(); // Refresh tours after availability change
      } else {
        toast.error(response.message || "Failed to change tour availability");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to change tour availability",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle booking closed — blocks NEW bookings on the customer-facing
  // page, doesn't touch existing travellers/bookings at all.
  const handleCloseBookings = async (tourId, currentlyClosed) => {
    const confirm = window.confirm(
      currentlyClosed
        ? "Reopen bookings for this tour? Customers will be able to book again."
        : "Close bookings for this tour? New customer bookings will be blocked immediately. Existing travellers are NOT affected.",
    );
    if (!confirm) return;

    setIsLoading(true);
    try {
      const response = currentlyClosed
        ? await reopenTourBookings(tourId)
        : await closeTourBookings(tourId);

      if (response.success) {
        toast.success(response.message || "Updated successfully");
      } else {
        toast.error(response.message || "Failed to update booking status");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update booking status");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle trip cancelled — cancels the WHOLE trip: every traveller on
  // every booking for this tour gets cancelled (except ones already
  // individually cancelled), backend-side. TourBookings.jsx's existing
  // "all travellers cancelled" logic then automatically moves every
  // affected booking into its Cancelled section with disabled buttons —
  // no separate button-blocking code needed here.
  const handleCancelTrip = async (tourId, tourTitle) => {
    const confirm = window.confirm(
      `Cancel the ENTIRE trip "${tourTitle}"?\n\nThis cancels EVERY traveller on EVERY booking for this tour (except any already individually cancelled). This cannot be easily undone — are you sure?`,
    );
    if (!confirm) return;

    setIsLoading(true);
    try {
      const response = await cancelEntireTrip(tourId);

      if (response.success) {
        toast.success(response.message || "Trip cancelled");
      } else {
        toast.error(response.message || "Failed to cancel trip");
      }
    } catch (error) {
      toast.error(error.message || "Failed to cancel trip");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle trip reopened — reverses handleCancelTrip. Travellers who
  // were only swept up by the bulk cancel (never individually
  // cancelled/rejected) are fully restored; travellers who had a real,
  // individually-approved cancellation keep that cancellation exactly
  // as it was — only the trip-cancel tag is removed from them.
  const handleReopenTrip = async (tourId, tourTitle) => {
    const confirm = window.confirm(
      `Reopen the trip "${tourTitle}"?\n\nTravellers who were only cancelled because of this trip cancellation will be restored. Travellers with a real, individually-approved cancellation keep that cancellation. Continue?`,
    );
    if (!confirm) return;

    setIsLoading(true);
    try {
      const response = await reopenEntireTrip(tourId);

      if (response.success) {
        toast.success(response.message || "Trip reopened");
        await getAllTours();
        await getAllBookings();
      } else {
        toast.error(response.message || "Failed to reopen trip");
      }
    } catch (error) {
      toast.error(error.message || "Failed to reopen trip");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full p-3 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 px-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 text-center sm:text-left w-full">
          Tours Controls
        </h1>

        <button
          onClick={exportPDF}
          disabled={isLoading}
          className="w-full sm:w-auto px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition shadow-sm disabled:opacity-60 text-sm sm:text-base whitespace-nowrap"
        >
          {isLoading ? "Processing..." : "Export PDF"}
        </button>
      </div>

      <input
        type="text"
        placeholder="Filter by Tour Title..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        disabled={isLoading}
        className="w-full sm:max-w-lg mb-6 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-60 text-sm sm:text-base"
      />

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading tours...</div>
      ) : filteredTours.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No tours found</div>
      ) : (
        <>
          {/* DESKTOP TABLE - visible from lg+ (tablets fall back to cards) */}
          <div className="hidden lg:block w-full min-w-0 border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full table-fixed divide-y divide-gray-200 text-[11px] xl:text-xs">
              <colgroup>
                <col className="w-[3%]" />
                <col className="w-[20%]" />
                <col className="w-[7%]" />
                <col className="w-[10%]" />
                <col className="w-[5%]" />
                <col className="w-[5%]" />
                <col className="w-[6%]" />
                <col className="w-[6%]" />
                <col className="w-[6%]" />
                <col className="w-[11%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-1.5 py-2.5 text-left font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
                    S.No
                  </th>
                  <th className="px-1.5 py-2.5 text-left font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
                    Tour Title
                  </th>
                  <th className="px-1 py-2.5 text-center font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
                    Travellers
                  </th>
                  <th className="px-1 py-2.5 text-center font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
                    Cancellations
                  </th>
                  <th className="px-1 py-2.5 text-center font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
                    Double
                  </th>
                  <th className="px-1 py-2.5 text-center font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
                    Triple
                  </th>
                  <th className="px-1 py-2.5 text-center font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
                    Male
                  </th>
                  <th className="px-1 py-2.5 text-center font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
                    Female
                  </th>
                  <th className="px-1 py-2.5 text-center font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
                    Child
                  </th>
                  <th className="px-1.5 py-2.5 text-center font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
                    Availability
                  </th>
                  <th className="px-1.5 py-2.5 text-center font-medium text-gray-500 uppercase overflow-hidden break-all leading-tight">
                    Trip Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTours.map((tour, index) => (
                  <tr key={tour._id} className="hover:bg-gray-50 align-top">
                    <td className="px-2 py-3 text-center font-medium">
                      {index + 1}
                    </td>
                    <td className="px-2 py-3 font-medium text-gray-900">
                      <span className="line-clamp-2 break-words">
                        {tour.title || "Unknown"}
                      </span>
                    </td>
                    <td className="px-1 py-3 text-center font-semibold">
                      {getTravellerCount(tour._id)}
                    </td>
                    <td className="px-1 py-3 text-center text-red-600">
                      {getCancellationCount(tour._id)}
                    </td>
                    <td className="px-1 py-3 text-center">
                      {getDoubleSharingCount(tour._id)}
                    </td>
                    <td className="px-1 py-3 text-center">
                      {getTripleSharingCount(tour._id)}
                    </td>
                    <td className="px-1 py-3 text-center text-blue-600">
                      {getMaleCount(tour._id)}
                    </td>
                    <td className="px-1 py-3 text-center text-pink-600">
                      {getFemaleCount(tour._id)}
                    </td>
                    <td className="px-1 py-3 text-center text-purple-600">
                      {getChildAndWithBerthCount(tour._id)}
                    </td>
                    <td className="px-2 py-3 text-center">
                      <button
                        onClick={() => handleChangeAvailability(tour._id)}
                        disabled={isLoading}
                        className={`px-2 py-1 rounded-md text-white font-medium transition text-[10px] xl:text-[11px] ${
                          tour.available
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700"
                        } disabled:opacity-60`}
                      >
                        {tour.available ? "Available" : "Unavailable"}
                      </button>
                    </td>
                    <td className="px-2 py-3 text-center">
                      {tour.tripCancelled ? (
                        <div className="flex flex-col gap-1 items-center">
                          <span className="inline-block px-2 py-1 rounded-md bg-gray-200 text-gray-500 font-bold text-[10px] xl:text-[11px]">
                            🚫 Cancelled
                          </span>
                          <button
                            onClick={() =>
                              handleReopenTrip(tour._id, tour.title)
                            }
                            disabled={isLoading}
                            className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition disabled:opacity-60 text-[10px] xl:text-[11px]"
                          >
                            Reopen
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() =>
                              handleCloseBookings(tour._id, tour.bookingClosed)
                            }
                            disabled={isLoading}
                            className={`px-2 py-1 rounded-md text-white font-medium transition disabled:opacity-60 text-[10px] xl:text-[11px] ${
                              tour.bookingClosed
                                ? "bg-amber-500 hover:bg-amber-600"
                                : "bg-slate-500 hover:bg-slate-600"
                            }`}
                          >
                            {tour.bookingClosed ? "Closed" : "Close"}
                          </button>
                          <button
                            onClick={() =>
                              handleCancelTrip(tour._id, tour.title)
                            }
                            disabled={isLoading}
                            className="px-2 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium transition disabled:opacity-60 text-[10px] xl:text-[11px]"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE / TABLET CARDS - visible below lg */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {filteredTours.map((tour, index) => (
              <div
                key={tour._id}
                className="bg-white border border-gray-200 rounded-xl shadow overflow-hidden flex flex-col"
              >
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="font-semibold text-base leading-tight line-clamp-2">
                      {tour.title || "Unknown Tour"}
                    </h3>
                    <span className="text-xs text-gray-500 font-medium shrink-0">
                      #{index + 1}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-4 text-center text-sm flex-1">
                  <div>
                    <div className="text-gray-500 text-xs mb-1">Travellers</div>
                    <div className="font-bold text-lg">
                      {getTravellerCount(tour._id)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">
                      Cancellations
                    </div>
                    <div className="font-bold text-lg text-red-600">
                      {getCancellationCount(tour._id)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">Child</div>
                    <div className="font-bold text-lg">
                      {getChildAndWithBerthCount(tour._id)}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-500 text-xs mb-1">Double</div>
                    <div className="font-bold text-lg">
                      {getDoubleSharingCount(tour._id)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">Triple</div>
                    <div className="font-bold text-lg">
                      {getTripleSharingCount(tour._id)}
                    </div>
                  </div>
                  <div className="col-span-3 mt-2">
                    <div className="flex justify-center gap-8">
                      <div>
                        <div className="text-gray-500 text-xs">Male</div>
                        <div className="font-bold text-blue-600">
                          {getMaleCount(tour._id)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Female</div>
                        <div className="font-bold text-pink-600">
                          {getFemaleCount(tour._id)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-4 bg-gray-50 border-t flex flex-col gap-3 items-center mt-auto">
                  <button
                    onClick={() => handleChangeAvailability(tour._id)}
                    disabled={isLoading}
                    className={`w-full px-8 py-3 rounded-xl text-white font-medium transition shadow-sm ${
                      tour.available
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    } disabled:opacity-60`}
                  >
                    {tour.available ? "Available" : "Unavailable"}
                  </button>

                  {tour.tripCancelled ? (
                    <div className="flex flex-col gap-2 w-full items-center">
                      <span className="px-6 py-2 rounded-xl bg-gray-200 text-gray-500 text-sm font-bold">
                        🚫 Trip Cancelled
                      </span>
                      <button
                        onClick={() => handleReopenTrip(tour._id, tour.title)}
                        disabled={isLoading}
                        className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition disabled:opacity-60"
                      >
                        Reopen Trip
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3 w-full">
                      <button
                        onClick={() =>
                          handleCloseBookings(tour._id, tour.bookingClosed)
                        }
                        disabled={isLoading}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition disabled:opacity-60 ${
                          tour.bookingClosed
                            ? "bg-amber-500 hover:bg-amber-600"
                            : "bg-slate-500 hover:bg-slate-600"
                        }`}
                      >
                        {tour.bookingClosed
                          ? "Booking Closed"
                          : "Close Booking"}
                      </button>
                      <button
                        onClick={() => handleCancelTrip(tour._id, tour.title)}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition disabled:opacity-60"
                      >
                        Trip Cancelled
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ToursList;
