// /* eslint-disable react-hooks/exhaustive-deps */
// import React, { useContext, useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import { TourAdminContext } from "../../context/TourAdminContext"; // adjust path if needed
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { ChevronDown, ChevronUp, Copy } from "lucide-react";

// const GetBookings = () => {
//     const { bookings, fetchAllBookings } = useContext(TourAdminContext);
//     const location = useLocation();

//     const [expandedRow, setExpandedRow] = useState(null);
//     const [filters, setFilters] = useState({
//         tour: "",
//         contact: "",
//         payment: "",
//         status: "all",
//         fromDate: "",
//         toDate: "",
//     });
//     const [isLoading, setIsLoading] = useState(true);

//     // ──────────────────────────────────────────────
//     // UNSAVED CHANGES / LEAVE CONFIRMATION PROTECTION
//     // ──────────────────────────────────────────────
//     const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

//     useEffect(() => {
//         const handleBeforeUnload = (event) => {
//             event.preventDefault();
//             event.returnValue = "You have unsaved changes or active filters. Are you sure you want to leave?";
//         };

//         window.addEventListener("beforeunload", handleBeforeUnload);

//         return () => {
//             window.removeEventListener("beforeunload", handleBeforeUnload);
//         };
//     }, []);

//     useEffect(() => {
//         window.history.pushState(null, null, window.location.href);

//         const handlePopState = (event) => {
//             event.preventDefault();
//             setShowLeaveConfirm(true);
//         };

//         window.addEventListener("popstate", handlePopState);

//         return () => {
//             window.removeEventListener("popstate", handlePopState);
//         };
//     }, []);

//     // Clear toasts on route change
//     useEffect(() => {
//         return () => toast.dismiss();
//     }, [location]);

//     // Fetch bookings
//     useEffect(() => {
//         const loadBookings = async () => {
//             setIsLoading(true);
//             try {
//                 await fetchAllBookings();
//             } catch (err) {
//                 toast.error("Something went wrong while loading bookings");
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         loadBookings();
//     }, [fetchAllBookings]);

//     // NEW: Check if any filter is active (to show/hide Clear button)
//     const hasActiveFilters =
//         filters.tour.trim() !== "" ||
//         filters.contact.trim() !== "" ||
//         filters.payment !== "" ||
//         filters.status !== "all" ||
//         filters.fromDate !== "" ||
//         filters.toDate !== "";

//     // Clear Filters function
//     const clearFilters = () => {
//         setFilters({
//             tour: "",
//             contact: "",
//             payment: "",
//             status: "all",
//             fromDate: "",
//             toDate: "",
//         });
//         toast.info("Filters cleared");
//     };

//     const toggleRow = (index) => {
//         setExpandedRow(expandedRow === index ? null : index);
//     };

//     const copyToClipboard = (text) => {
//         navigator.clipboard.writeText(text).then(
//             () => toast.success("Booking ID copied!"),
//             () => toast.error("Failed to copy")
//         );
//     };

//     const getStatusKey = (booking) => {
//         const isFullyCancelled =
//             booking.cancelled?.byAdmin || booking.cancelled?.byTraveller;
//         const allTravellersCancelled = booking.travellers?.every(
//             (t) => t.cancelled?.byAdmin || t.cancelled?.byTraveller
//         );

//         if (isFullyCancelled || allTravellersCancelled) return "cancelled";
//         if (booking.isBookingCompleted) return "completed";
//         if (booking.payment?.advance?.paid && booking.payment?.balance?.paid) return "Under Completion";
//         if (booking.payment?.advance?.paid) return "advance_paid";
//         if (!booking.payment?.advance?.paid) return "advance_pending";
//         return "under_completion";
//     };

//     const getStatusLabel = (booking) => {
//         const key = getStatusKey(booking);
//         switch (key) {
//             case "cancelled":
//                 return <span className="text-red-600 font-medium">Cancelled</span>;
//             case "completed":
//                 return <span className="text-green-600 font-medium">Completed</span>;
//             case "Under Completion":
//                 return <span className="text-yellow-600 font-medium">Under Completion</span>;
//             case "advance_paid":
//                 return <span className="text-yellow-600 font-medium">Advance Paid</span>;
//             case "advance_pending":
//                 return <span className="text-orange-600 font-medium">Advance Pending</span>;
//             default:
//                 return <span className="text-gray-600 font-medium">Under Completion</span>;
//         }
//     };

//     const filteredBookings = bookings
//         ?.filter((b) => {
//             const firstTraveller = b.travellers?.[0];
//             const displayName = firstTraveller
//                 ? `${firstTraveller.firstName} ${firstTraveller.lastName}`.toLowerCase()
//                 : "unknown traveller";

//             const tourMatch = b?.tourData?.title
//                 ?.toLowerCase()
//                 .includes(filters.tour.toLowerCase());

//             const contactMatch =
//                 filters.contact === "" ||
//                 displayName.includes(filters.contact.toLowerCase()) ||
//                 b?.contact?.mobile
//                     ?.toLowerCase()
//                     .includes(filters.contact.toLowerCase());

//             const paymentStatus = `${b.payment?.advance?.paid ? "advance-paid" : "advance-pending"
//                 } ${b.payment?.balance?.paid ? "balance-paid" : "balance-pending"}`;

//             const paymentMatch = paymentStatus.includes(filters.payment.toLowerCase());

//             const statusKey = getStatusKey(b);
//             const statusMatch = filters.status === "all" || statusKey === filters.status;

//             let dateMatch = true;
//             if (filters.fromDate || filters.toDate) {
//                 const bookedDate = new Date(b.bookingDate);
//                 if (filters.fromDate) {
//                     const from = new Date(filters.fromDate);
//                     dateMatch = dateMatch && bookedDate >= from;
//                 }
//                 if (filters.toDate) {
//                     const to = new Date(filters.toDate);
//                     to.setHours(23, 59, 59, 999);
//                     dateMatch = dateMatch && bookedDate <= to;
//                 }
//             }

//             return tourMatch && contactMatch && paymentMatch && statusMatch && dateMatch;
//         })
//         .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

//     return (
//         <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto bg-gray-50 min-h-screen">
//             <ToastContainer
//                 position="top-right"
//                 autoClose={3000}
//                 hideProgressBar={false}
//                 newestOnTop
//                 closeOnClick
//                 rtl={false}
//                 pauseOnFocusLoss
//                 draggable
//                 pauseOnHover
//             />

//             <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-800 mb-6 text-center">
//                 Get Bookings
//             </h1>

//             {/* Filters section */}
//             <div className="bg-white rounded-xl shadow-md p-4 mb-6 overflow-x-auto">
//                 <div className="flex flex-col sm:flex-row sm:items-end gap-4">
//                     {/* Filter inputs */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 flex-1">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Tour</label>
//                             <input
//                                 type="text"
//                                 placeholder="Filter tour"
//                                 value={filters.tour}
//                                 onChange={(e) => setFilters({ ...filters, tour: e.target.value })}
//                                 className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Name / Mobile</label>
//                             <input
//                                 type="text"
//                                 placeholder="Filter by name or mobile"
//                                 value={filters.contact}
//                                 onChange={(e) => setFilters({ ...filters, contact: e.target.value })}
//                                 className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
//                             <select
//                                 value={filters.payment}
//                                 onChange={(e) => setFilters({ ...filters, payment: e.target.value })}
//                                 className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
//                             >
//                                 <option value="">All</option>
//                                 <option value="advance-paid">Advance Paid</option>
//                                 <option value="advance-pending">Advance Pending</option>
//                                 <option value="balance-paid">Balance Paid</option>
//                                 <option value="balance-pending">Balance Pending</option>
//                             </select>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//                             <select
//                                 value={filters.status}
//                                 onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//                                 className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
//                             >
//                                 <option value="all">All</option>
//                                 <option value="cancelled">Cancelled</option>
//                                 <option value="completed">Completed</option>
//                                 <option value="Under Completion">Under Completion</option>
//                             </select>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
//                             <input
//                                 type="date"
//                                 value={filters.fromDate}
//                                 onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
//                                 className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
//                             <input
//                                 type="date"
//                                 value={filters.toDate}
//                                 onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
//                                 className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
//                             />
//                         </div>
//                     </div>

//                     {/* Clear Filters Button - only shown when filters are active */}
//                     {hasActiveFilters && (
//                         <button
//                             onClick={clearFilters}
//                             className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition whitespace-nowrap sm:self-end"
//                         >
//                             Clear Filters
//                         </button>
//                     )}
//                 </div>
//             </div>

//             {/* Rest of your page - table, expand, popup - exactly same */}
//             {isLoading ? (
//                 <div className="text-center text-gray-600 py-10">
//                     Loading all bookings...
//                 </div>
//             ) : filteredBookings.length === 0 ? (
//                 <p className="text-center text-gray-600 text-lg py-10">
//                     No bookings found
//                 </p>
//             ) : (
//                 <div className="overflow-x-auto bg-white rounded-xl shadow-md">
//                     <table className="min-w-full divide-y divide-gray-200">
//                         <thead className="bg-blue-50">
//                             <tr>
//                                 <th className="p-3 text-left text-sm font-semibold text-gray-700 w-10"></th>
//                                 <th className="p-3 text-left text-sm font-semibold text-gray-700">S.No</th>
//                                 <th className="p-3 text-left text-sm font-semibold text-gray-700">Tour</th>
//                                 <th className="p-3 text-left text-sm font-semibold text-gray-700">Booked On</th>
//                                 <th className="p-3 text-left text-sm font-semibold text-gray-700">Contact</th>
//                                 <th className="p-3 text-left text-sm font-semibold text-gray-700">Payment</th>
//                                 <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
//                             </tr>
//                         </thead>

//                         <tbody>
//                             {filteredBookings.map((booking, index) => {
//                                 const firstTraveller = booking.travellers?.[0];
//                                 const displayName = firstTraveller
//                                     ? `${firstTraveller.firstName} ${firstTraveller.lastName}`
//                                     : "Unknown Traveller";

//                                 return (
//                                     <React.Fragment key={booking._id}>
//                                         <tr
//                                             className="border-b hover:bg-gray-50 transition cursor-pointer"
//                                             onClick={() => toggleRow(index)}
//                                         >
//                                             <td className="p-3 text-gray-600">
//                                                 {expandedRow === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//                                             </td>
//                                             <td className="p-3 text-sm text-gray-800">{index + 1}</td>
//                                             <td className="p-3 text-sm text-gray-800">
//                                                 {booking?.tourData?.title || "N/A"}
//                                             </td>
//                                             <td className="p-3 text-sm text-gray-800">
//                                                 {booking?.bookingDate
//                                                     ? new Date(booking.bookingDate).toLocaleDateString("en-IN", {
//                                                         day: "2-digit",
//                                                         month: "short",
//                                                         year: "numeric",
//                                                     })
//                                                     : "N/A"}
//                                             </td>
//                                             <td className="p-3 text-sm text-gray-800">
//                                                 <div><strong>{displayName}</strong></div>
//                                                 <div>Mobile: {booking?.contact?.mobile || "N/A"}</div>
//                                                 <div>Email: {booking?.contact?.email || "N/A"}</div>
//                                             </td>
//                                             <td className="p-3 text-sm text-gray-800">
//                                                 <div>
//                                                     Advance: {booking.payment?.advance?.paid ? (
//                                                         <span className="text-green-600">Paid</span>
//                                                     ) : (
//                                                         <span className="text-red-600">Pending</span>
//                                                     )}
//                                                 </div>
//                                                 <div>
//                                                     Balance: {booking.payment?.balance?.paid ? (
//                                                         <span className="text-green-600">Paid</span>
//                                                     ) : (
//                                                         <span className="text-yellow-600">Pending</span>
//                                                     )}
//                                                 </div>
//                                             </td>
//                                             <td className="p-3 text-sm font-medium">
//                                                 {getStatusLabel(booking)}
//                                             </td>
//                                         </tr>

//                                         {expandedRow === index && (
//                                             <tr className="bg-gray-50">
//                                                 <td></td>
//                                                 <td colSpan="7" className="p-4">
//                                                     <div className="mb-4 flex items-center gap-3 text-sm">
//                                                         <strong>Booking ID:</strong>
//                                                         <code className="bg-gray-200 px-3 py-1 rounded font-mono">
//                                                             {booking._id}
//                                                         </code>
//                                                         <button
//                                                             onClick={(e) => {
//                                                                 e.stopPropagation();
//                                                                 copyToClipboard(booking._id);
//                                                             }}
//                                                             className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
//                                                             title="Copy Booking ID"
//                                                         >
//                                                             <Copy size={16} />
//                                                             Copy
//                                                         </button>
//                                                     </div>

//                                                     <div className="mb-6">
//                                                         <h4 className="font-semibold text-gray-800 mb-2 text-base">
//                                                             Billing Address
//                                                         </h4>
//                                                         <p className="text-sm text-gray-700">
//                                                             {booking.billingAddress?.addressLine1 || "N/A"},{" "}
//                                                             {booking.billingAddress?.addressLine2 || ""}
//                                                         </p>
//                                                         <p className="text-sm text-gray-700">
//                                                             {booking.billingAddress?.city || "N/A"},{" "}
//                                                             {booking.billingAddress?.state || "N/A"} -{" "}
//                                                             {booking.billingAddress?.pincode || "N/A"}
//                                                         </p>
//                                                         <p className="text-sm text-gray-700">
//                                                             Country: {booking.billingAddress?.country || "India"}
//                                                         </p>
//                                                     </div>

//                                                     <h4 className="font-semibold text-gray-800 mb-3 text-base">
//                                                         Travellers Details
//                                                     </h4>

//                                                     {booking.travellers?.length > 0 ? (
//                                                         <ul className="space-y-4">
//                                                             {booking.travellers.map((t, i) => (
//                                                                 <li
//                                                                     key={i}
//                                                                     className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 text-sm"
//                                                                 >
//                                                                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                                                                         <div className="space-y-1">
//                                                                             <p className="font-medium text-gray-800">
//                                                                                 Name: {t.title} {t.firstName} {t.lastName}
//                                                                             </p>
//                                                                             <p>Age: {t.age}</p>
//                                                                             <p>Gender: {t.gender}</p>
//                                                                             <p>Sharing Type: {t.sharingType}</p>
//                                                                         </div>

//                                                                         <div className="space-y-1">
//                                                                             <p>
//                                                                                 Package: {t.packageType === "main" ? "Main Package" : `Variant Package ${t.variantPackageIndex + 1}`}
//                                                                             </p>
//                                                                             <p>
//                                                                                 Addon: {t.selectedAddon?.name ? `${t.selectedAddon.name} (₹${t.selectedAddon.price || 0})` : "Nil"}
//                                                                             </p>
//                                                                             <p>
//                                                                                 Boarding: {t.boardingPoint?.stationName || "N/A"} ({t.boardingPoint?.stationCode || "N/A"})
//                                                                             </p>
//                                                                             <p>
//                                                                                 Deboarding: {t.deboardingPoint?.stationName || "N/A"} ({t.deboardingPoint?.stationCode || "N/A"})
//                                                                             </p>
//                                                                         </div>

//                                                                         <div className="space-y-1">
//                                                                             <p className="font-medium">
//                                                                                 Remarks: {t.remarks || "Nil"}
//                                                                             </p>
//                                                                         </div>
//                                                                     </div>
//                                                                 </li>
//                                                             ))}
//                                                         </ul>
//                                                     ) : (
//                                                         <p className="text-gray-500">No travellers</p>
//                                                     )}
//                                                 </td>
//                                             </tr>
//                                         )}
//                                     </React.Fragment>
//                                 );
//                             })}

//                             {filteredBookings.length === 0 && (
//                                 <tr>
//                                     <td colSpan="7" className="text-center text-gray-500 p-6 text-base">
//                                         No results match your filters
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             )}

//             {/* Leave Confirmation Popup */}
//             {showLeaveConfirm && (
//                 <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
//                     <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
//                         <h2 className="text-2xl font-bold text-gray-800 mb-4">
//                             Confirm Navigation
//                         </h2>
//                         <p className="text-gray-600 mb-6">
//                             You are about to leave this page.<br />
//                             Any active filters or changes will be lost on reload.<br /><br />
//                             Are you sure you want to continue?
//                         </p>
//                         <div className="flex justify-center gap-6">
//                             <button
//                                 onClick={() => {
//                                     setShowLeaveConfirm(false);
//                                     window.history.pushState(null, null, window.location.href);
//                                 }}
//                                 className="px-8 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition"
//                             >
//                                 Cancel (Stay)
//                             </button>
//                             <button
//                                 onClick={() => {
//                                     setShowLeaveConfirm(false);
//                                     window.history.back();
//                                 }}
//                                 className="px-8 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
//                             >
//                                 Yes (Leave)
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default GetBookings;


/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";

const GetBookings = () => {
  const { bookings, fetchAllBookings } = useContext(TourAdminContext);
  const location = useLocation();

  const [expandedRow, setExpandedRow] = useState(null);
  const [filters, setFilters] = useState({
    tour: "",
    contact: "",
    payment: "",
    status: "all",
    fromDate: "",
    toDate: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "You have unsaved changes or active filters. Are you sure you want to leave?";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    window.history.pushState(null, null, window.location.href);

    const handlePopState = (event) => {
      event.preventDefault();
      setShowLeaveConfirm(true);
    };

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    return () => toast.dismiss();
  }, [location]);

  useEffect(() => {
    const loadBookings = async () => {
      setIsLoading(true);
      try {
        await fetchAllBookings();
      } catch (err) {
        toast.error("Something went wrong while loading bookings");
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [fetchAllBookings]);

  const hasActiveFilters =
    filters.tour.trim() !== "" ||
    filters.contact.trim() !== "" ||
    filters.payment !== "" ||
    filters.status !== "all" ||
    filters.fromDate !== "" ||
    filters.toDate !== "";

  const clearFilters = () => {
    setFilters({
      tour: "",
      contact: "",
      payment: "",
      status: "all",
      fromDate: "",
      toDate: "",
    });
    toast.info("Filters cleared");
  };

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success("Booking ID copied!"),
      () => toast.error("Failed to copy")
    );
  };

  const getStatusKey = (booking) => {
    const isFullyCancelled = booking.cancelled?.byAdmin || booking.cancelled?.byTraveller;
    const allTravellersCancelled = booking.travellers?.every(
      (t) => t.cancelled?.byAdmin || t.cancelled?.byTraveller
    );

    if (isFullyCancelled || allTravellersCancelled) return "cancelled";
    if (booking.isBookingCompleted) return "completed";
    if (booking.payment?.advance?.paid && booking.payment?.balance?.paid) return "Under Completion";
    if (booking.payment?.advance?.paid) return "advance_paid";
    if (!booking.payment?.advance?.paid) return "advance_pending";
    return "under_completion";
  };

  const getStatusLabel = (booking) => {
    const key = getStatusKey(booking);
    switch (key) {
      case "cancelled":
        return <span className="text-red-600 font-medium">Cancelled</span>;
      case "completed":
        return <span className="text-green-600 font-medium">Completed</span>;
      case "Under Completion":
        return <span className="text-yellow-600 font-medium">Under Completion</span>;
      case "advance_paid":
        return <span className="text-yellow-600 font-medium">Advance Paid</span>;
      case "advance_pending":
        return <span className="text-orange-600 font-medium">Advance Pending</span>;
      default:
        return <span className="text-gray-600 font-medium">Under Completion</span>;
    }
  };

  const filteredBookings = bookings
    ?.filter((b) => {
      const firstTraveller = b.travellers?.[0];
      const displayName = firstTraveller
        ? `${firstTraveller.firstName} ${firstTraveller.lastName}`.toLowerCase()
        : "unknown traveller";

      const tourMatch = b?.tourData?.title?.toLowerCase().includes(filters.tour.toLowerCase());

      const contactMatch =
        filters.contact === "" ||
        displayName.includes(filters.contact.toLowerCase()) ||
        b?.contact?.mobile?.toLowerCase().includes(filters.contact.toLowerCase());

      const paymentStatus = `${b.payment?.advance?.paid ? "advance-paid" : "advance-pending"} ${
        b.payment?.balance?.paid ? "balance-paid" : "balance-pending"
      }`;

      const paymentMatch = paymentStatus.includes(filters.payment.toLowerCase());

      const statusKey = getStatusKey(b);
      const statusMatch = filters.status === "all" || statusKey === filters.status;

      let dateMatch = true;
      if (filters.fromDate || filters.toDate) {
        const bookedDate = new Date(b.bookingDate);
        if (filters.fromDate) {
          const from = new Date(filters.fromDate);
          dateMatch = dateMatch && bookedDate >= from;
        }
        if (filters.toDate) {
          const to = new Date(filters.toDate);
          to.setHours(23, 59, 59, 999);
          dateMatch = dateMatch && bookedDate <= to;
        }
      }

      return tourMatch && contactMatch && paymentMatch && statusMatch && dateMatch;
    })
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto bg-gray-50 min-h-screen">
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

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-800 mb-6 text-center">
        Get Bookings
      </h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 overflow-x-auto">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tour</label>
              <input
                type="text"
                placeholder="Filter tour"
                value={filters.tour}
                onChange={(e) => setFilters({ ...filters, tour: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name / Mobile</label>
              <input
                type="text"
                placeholder="Filter by name or mobile"
                value={filters.contact}
                onChange={(e) => setFilters({ ...filters, contact: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
              <select
                value={filters.payment}
                onChange={(e) => setFilters({ ...filters, payment: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
              >
                <option value="">All</option>
                <option value="advance-paid">Advance Paid</option>
                <option value="advance-pending">Advance Pending</option>
                <option value="balance-paid">Balance Paid</option>
                <option value="balance-pending">Balance Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
              >
                <option value="all">All</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
                <option value="Under Completion">Under Completion</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition whitespace-nowrap sm:self-end w-full sm:w-auto mt-2 sm:mt-0"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-600 py-10">Loading all bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <p className="text-center text-gray-600 text-lg py-10">No bookings found</p>
      ) : (
        <>
          {/* DESKTOP TABLE - same as AllTourBookings */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700 w-10"></th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">S.No</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Tour</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Booked On</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Payment</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map((booking, index) => {
                  const firstTraveller = booking.travellers?.[0];
                  const displayName = firstTraveller
                    ? `${firstTraveller.firstName} ${firstTraveller.lastName}`
                    : "Unknown Traveller";

                  return (
                    <React.Fragment key={booking._id}>
                      <tr
                        className="border-b hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => toggleRow(index)}
                      >
                        <td className="p-3 text-gray-600">
                          {expandedRow === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </td>
                        <td className="p-3 text-sm text-gray-800">{index + 1}</td>
                        <td className="p-3 text-sm text-gray-800">{booking?.tourData?.title || "N/A"}</td>
                        <td className="p-3 text-sm text-gray-800">
                          {booking?.bookingDate
                            ? new Date(booking.bookingDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </td>
                        <td className="p-3 text-sm text-gray-800">
                          <div><strong>{displayName}</strong></div>
                          <div>Mobile: {booking?.contact?.mobile || "N/A"}</div>
                          <div>Email: {booking?.contact?.email || "N/A"}</div>
                        </td>
                        <td className="p-3 text-sm text-gray-800">
                          <div>
                            Advance: {booking.payment?.advance?.paid ? (
                              <span className="text-green-600">Paid</span>
                            ) : (
                              <span className="text-red-600">Pending</span>
                            )}
                          </div>
                          <div>
                            Balance: {booking.payment?.balance?.paid ? (
                              <span className="text-green-600">Paid</span>
                            ) : (
                              <span className="text-yellow-600">Pending</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-sm font-medium">{getStatusLabel(booking)}</td>
                      </tr>

                      {expandedRow === index && (
                        <tr className="bg-gray-50">
                          <td></td>
                          <td colSpan={7} className="p-4">
                            <div className="mb-4 flex items-center gap-3 text-sm">
                              <strong>Booking ID:</strong>
                              <code className="bg-gray-200 px-3 py-1 rounded font-mono">
                                {booking._id}
                              </code>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(booking._id);
                                }}
                                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                title="Copy Booking ID"
                              >
                                <Copy size={16} />
                                Copy
                              </button>
                            </div>

                            <div className="mb-6">
                              <h4 className="font-semibold text-gray-800 mb-2 text-base">
                                Billing Address
                              </h4>
                              <p className="text-sm text-gray-700">
                                {booking.billingAddress?.addressLine1 || "N/A"},{" "}
                                {booking.billingAddress?.addressLine2 || ""}
                              </p>
                              <p className="text-sm text-gray-700">
                                {booking.billingAddress?.city || "N/A"},{" "}
                                {booking.billingAddress?.state || "N/A"} -{" "}
                                {booking.billingAddress?.pincode || "N/A"}
                              </p>
                              <p className="text-sm text-gray-700">
                                Country: {booking.billingAddress?.country || "India"}
                              </p>
                            </div>

                            <h4 className="font-semibold text-gray-800 mb-3 text-base">
                              Travellers Details
                            </h4>

                            {booking.travellers?.length > 0 ? (
                              <ul className="space-y-4">
                                {booking.travellers.map((t, i) => (
                                  <li
                                    key={i}
                                    className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 text-sm"
                                  >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                      <div className="space-y-1">
                                        <p className="font-medium text-gray-800">
                                          Name: {t.title} {t.firstName} {t.lastName}
                                        </p>
                                        <p>Age: {t.age}</p>
                                        <p>Gender: {t.gender}</p>
                                        <p>Sharing Type: {t.sharingType}</p>
                                      </div>

                                      <div className="space-y-1">
                                        <p>
                                          Package: {t.packageType === "main" ? "Main Package" : `Variant Package ${t.variantPackageIndex + 1}`}
                                        </p>
                                        <p>
                                          Addon: {t.selectedAddon?.name ? `${t.selectedAddon.name} (₹${t.selectedAddon.price || 0})` : "Nil"}
                                        </p>
                                        <p>
                                          Boarding: {t.boardingPoint?.stationName || "N/A"} ({t.boardingPoint?.stationCode || "N/A"})
                                        </p>
                                        <p>
                                          Deboarding: {t.deboardingPoint?.stationName || "N/A"} ({t.deboardingPoint?.stationCode || "N/A"})
                                        </p>
                                      </div>

                                      <div className="space-y-1">
                                        <p className="font-medium">
                                          Remarks: {t.remarks || "Nil"}
                                        </p>
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500">No travellers</p>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD LAYOUT - exactly matching AllTourBookings style */}
          <div className="md:hidden space-y-5 mt-2">
            {filteredBookings.map((booking, index) => {
              const firstTraveller = booking.travellers?.[0];
              const displayName = firstTraveller
                ? `${firstTraveller.firstName} ${firstTraveller.lastName}`
                : "Unknown Traveller";

              const isExpanded = expandedRow === index;

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden"
                >
                  {/* Header - same as AllTourBookings */}
                  <div
                    className="px-4 py-3.5 flex items-center justify-between cursor-pointer bg-gray-50/80 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    onClick={() => toggleRow(index)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium text-sm">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {booking?.tourData?.title || "N/A"}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {booking?.bookingDate
                            ? new Date(booking.bookingDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="text-right">{getStatusLabel(booking)}</div>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {/* Expanded content - same structure & classes */}
                  {isExpanded && (
                    <div className="p-4 border-t space-y-5 text-sm">
                      {/* Booking ID */}
                      <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-gray-100">
                        <span className="font-medium text-gray-800">Booking ID:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs break-all">
                          {booking._id}
                        </code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(booking._id);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs"
                        >
                          <Copy size={14} /> Copy
                        </button>
                      </div>

                      {/* Contact */}
                      <div className="space-y-1.5">
                        <div className="font-medium text-gray-800">Contact Person</div>
                        <div>{displayName}</div>
                        <div>Mobile: {booking?.contact?.mobile || "N/A"}</div>
                        <div>Email: {booking?.contact?.email || "N/A"}</div>
                      </div>

                      {/* Payment */}
                      <div className="space-y-1.5">
                        <div className="font-medium text-gray-800">Payment</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            Advance:{" "}
                            {booking.payment?.advance?.paid ? (
                              <span className="text-green-600">Paid</span>
                            ) : (
                              <span className="text-red-600">Pending</span>
                            )}
                          </div>
                          <div>
                            Balance:{" "}
                            {booking.payment?.balance?.paid ? (
                              <span className="text-green-600">Paid</span>
                            ) : (
                              <span className="text-yellow-600">Pending</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Travellers */}
                      {booking.travellers?.length > 0 && (
                        <div className="space-y-4">
                          <div className="font-medium text-gray-800">
                            Travellers ({booking.travellers.length})
                          </div>

                          <div className="space-y-4">
                            {booking.travellers.map((t, i) => (
                              <div
                                key={i}
                                className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3"
                              >
                                <div className="font-medium pb-2 border-b border-gray-200">
                                  {t.title} {t.firstName} {t.lastName}
                                </div>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                                  <div className="space-y-1.5">
                                    <div>Age: {t.age}</div>
                                    <div>Gender: {t.gender}</div>
                                    <div>Sharing: {t.sharingType}</div>
                                    <div>
                                      Package: {t.packageType === "main" ? "Main" : `Var ${t.variantPackageIndex + 1}`}
                                    </div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <div className="break-words">
                                      Boarding: {t.boardingPoint?.stationName || "N/A"} ({t.boardingPoint?.stationCode || "N/A"})
                                    </div>
                                    <div className="break-words">
                                      Deboarding: {t.deboardingPoint?.stationName || "N/A"} ({t.deboardingPoint?.stationCode || "N/A"})
                                    </div>
                                    <div>
                                      Addon: {t.selectedAddon?.name ? t.selectedAddon.name : "Nil"}
                                    </div>
                                    <div className="break-words">
                                      Remarks: {t.remarks || "Nil"}
                                    </div>
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
        </>
      )}

      {/* Leave Confirmation Popup */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Confirm Navigation
            </h2>
            <p className="text-gray-600 mb-6">
              You are about to leave this page.<br />
              Any active filters or changes will be lost on reload.<br /><br />
              Are you sure you want to continue?
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => {
                  setShowLeaveConfirm(false);
                  window.history.pushState(null, null, window.location.href);
                }}
                className="px-8 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition"
              >
                Cancel (Stay)
              </button>
              <button
                onClick={() => {
                  setShowLeaveConfirm(false);
                  window.history.back();
                }}
                className="px-8 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
              >
                Yes (Leave)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetBookings;