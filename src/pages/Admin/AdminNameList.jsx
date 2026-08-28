// import React, { useState, useContext, useEffect, useMemo } from "react";
// import { useLocation } from "react-router-dom";
// import { TourAdminContext } from "../../context/TourAdminContext";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const AdminNameList = () => {
//   const {
//     tours = [],
//     fetchToursList,
//     tourBookings = [],
//     fetchBookingsOfTour,
//     selectedTourId,
//     setSelectedTourId,
//     isLoadingBookings = false,
//   } = useContext(TourAdminContext);
//   const [nameFilter, setNameFilter] = useState("");
//   const [phoneFilter, setPhoneFilter] = useState("");
//   const [boardingPointFilter, setBoardingPointFilter] = useState("");
//   const [deboardingPointFilter, setDeboardingPointFilter] = useState("");
//   const location = useLocation();
//   const [showBackConfirm, setShowBackConfirm] = useState(false);
//   const pageIsActive = useMemo(() => {
//     return (
//       selectedTourId ||
//       nameFilter.trim() ||
//       phoneFilter.trim() ||
//       boardingPointFilter.trim() ||
//       deboardingPointFilter.trim()
//     );
//   }, [
//     selectedTourId,
//     nameFilter,
//     phoneFilter,
//     boardingPointFilter,
//     deboardingPointFilter,
//   ]);

//   useEffect(() => {
//     if (!pageIsActive) return;

//     const handleBeforeUnload = (event) => {
//       event.preventDefault();
//       event.returnValue = ""; // Triggers dialog with browser's default message
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);

//     window.history.pushState(null, null, window.location.href);

//     const handlePopState = () => {
//       setShowBackConfirm(true);
//     };

//     window.addEventListener("popstate", handlePopState);

//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//       window.removeEventListener("popstate", handlePopState);
//     };
//   }, [pageIsActive]);

//   // ─── IMPORTANT RESET LOGIC ───────────────────────────────────────
//   useEffect(() => {
//     // Every time this page is visited / re-entered → full reset
//     setSelectedTourId(""); // tour clear
//     setNameFilter(""); // all filters clear
//     setPhoneFilter("");
//     setBoardingPointFilter("");
//     setDeboardingPointFilter("");

//     // Optional: toast காட்டலாம் (debug-க்கு உதவும்)
//     // toast.info("Admin Name List reset to initial state", { autoClose: 2000 });
//   }, [location.pathname]);

//   useEffect(() => {
//     fetchToursList?.();
//   }, [fetchToursList]);
//   useEffect(() => {
//     if (selectedTourId) fetchBookingsOfTour?.(selectedTourId);
//   }, [selectedTourId, fetchBookingsOfTour]);
//   useEffect(() => {
//     return () => toast.dismiss();
//   }, [location]);

//   const getDisplayGender = (age, gender, sharingType) => {
//     const parsedAge = parseInt(age, 10);
//     if (isNaN(parsedAge) || parsedAge < 6) return "";
//     const genderAbbrev =
//       gender?.toLowerCase() === "male"
//         ? "M"
//         : gender?.toLowerCase() === "female"
//           ? "F"
//           : "";
//     if (parsedAge >= 6 && parsedAge <= 10) {
//       if (["withBerth", "double", "triple"].includes(sharingType))
//         return genderAbbrev ? `CWB(${genderAbbrev})` : "CWB";
//       if (sharingType === "withoutBerth")
//         return genderAbbrev ? `CNB(${genderAbbrev})` : "CNB";
//       return "";
//     }
//     return genderAbbrev;
//   };

//   const tableData = useMemo(() => {
//     if (!tourBookings.length || !selectedTourId)
//       return {
//         trainColumns: ["Train 1"],
//         flightColumns: ["Flight 1"],
//         travellers: [],
//       };

//     const trainSet = new Set();
//     const flightSet = new Set();
//     const travellersList = [];

//     tourBookings.forEach((booking) => {
//       if (!booking.payment?.advance?.paymentVerified) return;
//       booking.travellers?.forEach((trav) => {
//         if (trav.cancelled?.byTraveller || trav.cancelled?.byAdmin) return;

//         if (Array.isArray(trav.trainSeats)) {
//           trav.trainSeats.forEach(
//             (s) => s?.trainName && trainSet.add(s.trainName),
//           );
//         } else if (trav.trainSeats && typeof trav.trainSeats === "object") {
//           Object.keys(trav.trainSeats).forEach((k) => trainSet.add(k));
//         }

//         if (Array.isArray(trav.flightSeats)) {
//           trav.flightSeats.forEach(
//             (s) => s?.flightName && flightSet.add(s.flightName),
//           );
//         } else if (trav.flightSeats && typeof trav.flightSeats === "object") {
//           Object.keys(trav.flightSeats).forEach((k) => flightSet.add(k));
//         }

//         const trainSeatsMap = {};
//         const flightSeatsMap = {};
//         const trainColumns =
//           trainSet.size > 0 ? Array.from(trainSet) : ["Train 1"];
//         const flightColumns =
//           flightSet.size > 0 ? Array.from(flightSet) : ["Flight 1"];

//         trainColumns.forEach((tn) => (trainSeatsMap[tn] = ""));
//         flightColumns.forEach((fn) => (flightSeatsMap[fn] = ""));

//         if (Array.isArray(trav.trainSeats)) {
//           trav.trainSeats.forEach(
//             (s) =>
//               s?.trainName && (trainSeatsMap[s.trainName] = s.seatNo ?? ""),
//           );
//         } else if (trav.trainSeats && typeof trav.trainSeats === "object") {
//           Object.entries(trav.trainSeats).forEach(
//             ([k, v]) => (trainSeatsMap[k] = v ?? ""),
//           );
//         }

//         if (Array.isArray(trav.flightSeats)) {
//           trav.flightSeats.forEach(
//             (s) =>
//               s?.flightName && (flightSeatsMap[s.flightName] = s.seatNo ?? ""),
//           );
//         } else if (trav.flightSeats && typeof trav.flightSeats === "object") {
//           Object.entries(trav.flightSeats).forEach(
//             ([k, v]) => (flightSeatsMap[k] = v ?? ""),
//           );
//         }

//         travellersList.push({
//           tnr: booking.tnr || "—",
//           id: trav._id,
//           name: `${trav.firstName || ""} ${trav.lastName || ""}`.trim(),
//           age: trav.age ?? "",
//           gender: trav.gender || "",
//           sharingType: trav.sharingType || "",
//           mobile: booking.contact?.mobile ?? trav.phone ?? "",
//           boardingPoint: trav.boardingPoint?.stationName || "",
//           deboardingPoint: trav.deboardingPoint?.stationName || "",
//           trainSeats: trainSeatsMap,
//           flightSeats: flightSeatsMap,
//         });
//       });
//     });

//     const filteredTravellers = travellersList.filter((traveller) => {
//       const matchesName = nameFilter
//         ? traveller.name.toLowerCase().includes(nameFilter.toLowerCase())
//         : true;
//       const matchesPhone = phoneFilter
//         ? traveller.mobile.includes(phoneFilter)
//         : true;
//       const matchesBoardingPoint = boardingPointFilter
//         ? traveller.boardingPoint
//             .toLowerCase()
//             .includes(boardingPointFilter.toLowerCase())
//         : true;
//       const matchesDeboardingPoint = deboardingPointFilter
//         ? traveller.deboardingPoint
//             .toLowerCase()
//             .includes(deboardingPointFilter.toLowerCase())
//         : true;
//       return (
//         matchesName &&
//         matchesPhone &&
//         matchesBoardingPoint &&
//         matchesDeboardingPoint
//       );
//     });

//     return {
//       trainColumns: Array.from(
//         trainSet.size > 0 ? trainSet : new Set(["Train 1"]),
//       ),
//       flightColumns: Array.from(
//         flightSet.size > 0 ? flightSet : new Set(["Flight 1"]),
//       ),
//       travellers: filteredTravellers,
//     };
//   }, [
//     tourBookings,
//     selectedTourId,
//     nameFilter,
//     phoneFilter,
//     boardingPointFilter,
//     deboardingPointFilter,
//   ]);

//   const exportToPDF = () => {
//     const doc = new jsPDF("landscape", "pt", "a4");
//     const tourFromList = tours.find((tour) => tour._id === selectedTourId);
//     const displayTitle = tourFromList?.title?.trim() || "Tour Traveller List";

//     doc.setFontSize(18);
//     doc.text(displayTitle, doc.internal.pageSize.getWidth() / 2, 50, {
//       align: "center",
//     });

//     const head = [
//       [
//         "SL NO",
//         "TNR",
//         "NAME",
//         "AGE",
//         "GENDER",
//         "MOBILE",
//         "BOARDING POINT",
//         "DEBOARDING POINT",
//         ...tableData.trainColumns,
//         ...tableData.flightColumns,
//       ],
//     ];
//     const body = tableData.travellers.map((trav, idx) => [
//       String(idx + 1).padStart(2, "0"),
//       trav.tnr || "—",
//       trav.name || "—",
//       trav.age ?? "—",
//       getDisplayGender(trav.age, trav.gender, trav.sharingType),
//       trav.mobile || "—",
//       trav.boardingPoint || "—",
//       trav.deboardingPoint || "—",
//       ...tableData.trainColumns.map((c) => trav.trainSeats?.[c] ?? "—"),
//       ...tableData.flightColumns.map((c) => trav.flightSeats?.[c] ?? "—"),
//     ]);

//     autoTable(doc, {
//       head,
//       body,
//       startY: 80,
//       styles: {
//         fontSize: 10,
//         cellPadding: 5,
//         halign: "center",
//         valign: "middle",
//         overflow: "linebreak",
//       },
//       headStyles: {
//         fillColor: [40, 167, 69],
//         textColor: [255, 255, 255],
//         fontStyle: "bold",
//       },
//       alternateRowStyles: { fillColor: [240, 248, 243] },
//       columnStyles: { 1: { halign: "left" } },
//     });

//     const safeFileName = displayTitle
//       .replace(/[^a-zA-Z0-9\s-]/g, "")
//       .replace(/\s+/g, "_")
//       .trim();
//     doc.save(`${safeFileName}_Traveller_List.pdf`);
//     toast.success("✅ PDF exported successfully", {
//       toastId: "pdf-export-success",
//     });
//   };

//   const totalColumns =
//     tableData.trainColumns.length + tableData.flightColumns.length;
//   const columnWidthClass =
//     totalColumns > 10
//       ? "min-w-[80px]"
//       : totalColumns > 6
//         ? "min-w-[100px]"
//         : "min-w-[120px]";

//   return (
//     <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto">
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
//         limit={5}
//         className="fixed top-4 right-4 z-[9999]"
//         toastClassName="min-w-[280px] max-w-[380px] bg-white shadow-xl rounded-lg border border-gray-200"
//         bodyClassName="text-sm font-medium text-gray-800"
//         progressClassName="bg-gradient-to-r from-blue-500 to-indigo-600 h-1 rounded-full"
//       />

//       <div className="mb-4 sm:mb-6 lg:mb-8">
//         <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6 text-center">
//           Admin Name List
//         </h2>

//         <div className="mb-4 sm:mb-6">
//           <label
//             htmlFor="tour-select"
//             className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
//           >
//             Select Tour:
//           </label>
//           <select
//             id="tour-select"
//             value={selectedTourId || ""}
//             onChange={(e) => setSelectedTourId(e.target.value)}
//             className="mt-1 block w-full pl-3 pr-10 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md disabled:bg-gray-100 touch-manipulation"
//             disabled={isLoadingBookings}
//           >
//             <option value="">-- Select a Tour --</option>
//             {tours.map((tour) => (
//               <option key={tour._id} value={tour._id}>
//                 {tour.title}
//               </option>
//             ))}
//           </select>
//         </div>

//         {selectedTourId ? (
//           <>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
//               <div className="flex-1">
//                 <label
//                   htmlFor="name-filter"
//                   className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
//                 >
//                   Filter by Name:
//                 </label>
//                 <input
//                   id="name-filter"
//                   type="text"
//                   value={nameFilter}
//                   onChange={(e) => setNameFilter(e.target.value)}
//                   placeholder="Enter name to filter"
//                   className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation"
//                 />
//               </div>
//               <div className="flex-1">
//                 <label
//                   htmlFor="phone-filter"
//                   className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
//                 >
//                   Filter by Phone:
//                 </label>
//                 <input
//                   id="phone-filter"
//                   type="text"
//                   value={phoneFilter}
//                   onChange={(e) => setPhoneFilter(e.target.value)}
//                   placeholder="Enter phone to filter"
//                   className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation"
//                 />
//               </div>
//               <div className="flex-1">
//                 <label
//                   htmlFor="boarding-point-filter"
//                   className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
//                 >
//                   Filter by Boarding Point:
//                 </label>
//                 <input
//                   id="boarding-point-filter"
//                   type="text"
//                   value={boardingPointFilter}
//                   onChange={(e) => setBoardingPointFilter(e.target.value)}
//                   placeholder="Enter boarding point"
//                   className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation"
//                 />
//               </div>
//               <div className="flex-1">
//                 <label
//                   htmlFor="deboarding-point-filter"
//                   className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
//                 >
//                   Filter by Deboarding Point:
//                 </label>
//                 <input
//                   id="deboarding-point-filter"
//                   type="text"
//                   value={deboardingPointFilter}
//                   onChange={(e) => setDeboardingPointFilter(e.target.value)}
//                   placeholder="Enter deboarding point"
//                   className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation"
//                 />
//               </div>
//             </div>

//             <div className="flex justify-end mb-4 sm:mb-6">
//               <button
//                 onClick={exportToPDF}
//                 className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs sm:text-sm lg:text-base min-w-[100px] sm:min-w-[120px] touch-manipulation"
//               >
//                 📄 Export to PDF
//               </button>
//             </div>

//             {isLoadingBookings ? (
//               <div className="text-center text-gray-500 text-xs sm:text-sm lg:text-base py-10">
//                 <svg
//                   className="animate-spin h-5 w-5 sm:h-6 sm:w-6 mx-auto text-indigo-500"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                     fill="none"
//                   />
//                   <path
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//                   />
//                 </svg>{" "}
//                 Loading...
//               </div>
//             ) : tableData.travellers.length === 0 ? (
//               <p className="text-center text-gray-500 text-xs sm:text-sm lg:text-base py-10">
//                 No active travellers with verified advance payment found.
//               </p>
//             ) : (
//               <>
//                 {/* Desktop Table - VIEW ONLY (no inputs/buttons) */}
//                 <div className="hidden sm:block overflow-x-auto max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-3rem)] lg:max-w-[calc(100vw-4rem)] mx-auto">
//                   <table className="w-full border-collapse">
//                     <thead>
//                       <tr className="bg-gray-100 sticky top-0 z-10">
//                         <th
//                           className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[50px]`}
//                         >
//                           SL NO
//                         </th>
//                         <th
//                           className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[90px] font-mono`}
//                         >
//                           TNR
//                         </th>
//                         <th
//                           className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[100px] sm:min-w-[120px]`}
//                         >
//                           NAME
//                         </th>
//                         <th
//                           className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[50px]`}
//                         >
//                           AGE
//                         </th>
//                         <th
//                           className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[60px]`}
//                         >
//                           GENDER
//                         </th>
//                         <th
//                           className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[80px]`}
//                         >
//                           MOBILE
//                         </th>
//                         <th
//                           className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold ${columnWidthClass}`}
//                         >
//                           BOARDING POINT
//                         </th>
//                         <th
//                           className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold ${columnWidthClass}`}
//                         >
//                           DEBOARDING POINT
//                         </th>
//                         {tableData.trainColumns.map((col, i) => (
//                           <th
//                             key={i}
//                             className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold ${columnWidthClass}`}
//                           >
//                             {col}
//                           </th>
//                         ))}
//                         {tableData.flightColumns.map((col, i) => (
//                           <th
//                             key={i}
//                             className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold ${columnWidthClass}`}
//                           >
//                             {col}
//                           </th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {tableData.travellers.map((trav, idx) => (
//                         <tr key={trav.id}>
//                           <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base">
//                             {String(idx + 1).padStart(2, "0")}.
//                           </td>
//                           <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-mono">
//                             {trav.tnr}
//                           </td>
//                           <td
//                             className="p-2 sm:p-3 border border-gray-200 text-xs sm:text-sm lg:text-base truncate max-w-[100px] sm:max-w-[120px]"
//                             title={trav.name}
//                           >
//                             {trav.name}
//                           </td>
//                           <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base">
//                             {trav.age || "—"}
//                           </td>
//                           <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base">
//                             {getDisplayGender(
//                               trav.age,
//                               trav.gender,
//                               trav.sharingType,
//                             ) || "—"}
//                           </td>
//                           <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base">
//                             {trav.mobile || "—"}
//                           </td>
//                           <td
//                             className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base truncate max-w-[80px] sm:max-w-[100px]"
//                             title={trav.boardingPoint}
//                           >
//                             {trav.boardingPoint || "—"}
//                           </td>
//                           <td
//                             className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base truncate max-w-[80px] sm:max-w-[100px]"
//                             title={trav.deboardingPoint}
//                           >
//                             {trav.deboardingPoint || "—"}
//                           </td>
//                           {tableData.trainColumns.map((col) => (
//                             <td
//                               key={col}
//                               className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base bg-gray-50"
//                             >
//                               {trav.trainSeats?.[col] ?? "—"}
//                             </td>
//                           ))}
//                           {tableData.flightColumns.map((col) => (
//                             <td
//                               key={col}
//                               className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base bg-gray-50"
//                             >
//                               {trav.flightSeats?.[col] ?? "—"}
//                             </td>
//                           ))}
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Mobile Card View - VIEW ONLY */}
//                 <div className="block sm:hidden space-y-4">
//                   {tableData.travellers.map((trav, idx) => (
//                     <div
//                       key={trav.id}
//                       className="bg-white border rounded-lg p-4 shadow-sm"
//                     >
//                       <div className="grid grid-cols-1 gap-3 text-xs sm:text-sm">
//                         <div>
//                           <span className="font-semibold">SL NO: </span>
//                           {String(idx + 1).padStart(2, "0")}.
//                         </div>
//                         <div>
//                           <span className="font-semibold">TNR: </span>
//                           {trav.tnr}
//                         </div>
//                         <div>
//                           <span className="font-semibold">Name: </span>
//                           {trav.name}
//                         </div>
//                         <div>
//                           <span className="font-semibold">Age: </span>
//                           {trav.age || "—"}
//                         </div>
//                         <div>
//                           <span className="font-semibold">Gender: </span>
//                           {getDisplayGender(
//                             trav.age,
//                             trav.gender,
//                             trav.sharingType,
//                           ) || "—"}
//                         </div>
//                         <div>
//                           <span className="font-semibold">Mobile: </span>
//                           {trav.mobile || "—"}
//                         </div>
//                         <div>
//                           <span className="font-semibold">Boarding: </span>
//                           {trav.boardingPoint || "—"}
//                         </div>
//                         <div>
//                           <span className="font-semibold">Deboarding: </span>
//                           {trav.deboardingPoint || "—"}
//                         </div>
//                         {tableData.trainColumns.map((col) => (
//                           <div key={col} className="bg-gray-50 p-2 rounded">
//                             <span className="font-semibold block mb-1">
//                               {col}:
//                             </span>
//                             <span className="text-sm font-medium">
//                               {trav.trainSeats?.[col] ?? "—"}
//                             </span>
//                           </div>
//                         ))}
//                         {tableData.flightColumns.map((col) => (
//                           <div key={col} className="bg-blue-50 p-2 rounded">
//                             <span className="font-semibold block mb-1">
//                               {col}:
//                             </span>
//                             <span className="text-sm font-medium">
//                               {trav.flightSeats?.[col] ?? "—"}
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </>
//             )}
//           </>
//         ) : (
//           <p className="text-center text-gray-500 text-xs sm:text-sm lg:text-base py-10">
//             Please select a tour to view the traveller list.
//           </p>
//         )}
//       </div>

//       {showBackConfirm && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
//           <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
//             <h2 className="text-2xl font-bold text-gray-800 mb-4">
//               Unsaved Filters / Selection
//             </h2>
//             <p className="text-gray-600 mb-6">
//               You have selected a tour or applied filters.
//               <br />
//               Going back will reset them.
//               <br />
//               Are you sure you want to go back?
//             </p>
//             <div className="flex justify-center gap-6">
//               <button
//                 onClick={() => {
//                   setShowBackConfirm(false);
//                   // Stay → re-trap the back button
//                   window.history.pushState(null, null, window.location.href);
//                 }}
//                 className="px-8 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition"
//               >
//                 Cancel (Stay)
//               </button>
//               <button
//                 onClick={() => {
//                   setShowBackConfirm(false);
//                   history.back(); // Really go back
//                 }}
//                 className="px-8 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
//               >
//                 OK (Go Back)
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminNameList;

import React, { useState, useContext, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AdminNameList = () => {
  const {
    tours = [],
    fetchToursList,
    tourBookings = [],
    fetchBookingsOfTour,
    selectedTourId,
    setSelectedTourId,
    isLoadingBookings = false,
  } = useContext(TourAdminContext);
  const [nameFilter, setNameFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [boardingPointFilter, setBoardingPointFilter] = useState("");
  const [deboardingPointFilter, setDeboardingPointFilter] = useState("");
  const location = useLocation();
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const pageIsActive = useMemo(() => {
    return (
      selectedTourId ||
      nameFilter.trim() ||
      phoneFilter.trim() ||
      boardingPointFilter.trim() ||
      deboardingPointFilter.trim()
    );
  }, [
    selectedTourId,
    nameFilter,
    phoneFilter,
    boardingPointFilter,
    deboardingPointFilter,
  ]);

  useEffect(() => {
    if (!pageIsActive) return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ""; // Triggers dialog with browser's default message
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    window.history.pushState(null, null, window.location.href);

    const handlePopState = () => {
      setShowBackConfirm(true);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pageIsActive]);

  // ─── IMPORTANT RESET LOGIC ───────────────────────────────────────
  useEffect(() => {
    // Every time this page is visited / re-entered → full reset
    setSelectedTourId(""); // tour clear
    setNameFilter(""); // all filters clear
    setPhoneFilter("");
    setBoardingPointFilter("");
    setDeboardingPointFilter("");

    // Optional: toast காட்டலாம் (debug-க்கு உதவும்)
    // toast.info("Admin Name List reset to initial state", { autoClose: 2000 });
  }, [location.pathname]);

  useEffect(() => {
    fetchToursList?.();
  }, [fetchToursList]);
  useEffect(() => {
    if (selectedTourId) fetchBookingsOfTour?.(selectedTourId);
  }, [selectedTourId, fetchBookingsOfTour]);
  useEffect(() => {
    return () => toast.dismiss();
  }, [location]);

  const getDisplayGender = (age, gender, sharingType) => {
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 6) return "";
    const genderAbbrev =
      gender?.toLowerCase() === "male"
        ? "M"
        : gender?.toLowerCase() === "female"
          ? "F"
          : "";
    if (parsedAge >= 6 && parsedAge <= 10) {
      if (["withBerth", "double", "triple"].includes(sharingType))
        return genderAbbrev ? `CWB(${genderAbbrev})` : "CWB";
      if (sharingType === "withoutBerth")
        return genderAbbrev ? `CNB(${genderAbbrev})` : "CNB";
      return "";
    }
    return genderAbbrev;
  };

  const tableData = useMemo(() => {
    if (!tourBookings.length || !selectedTourId)
      return {
        trainColumns: ["Train 1"],
        flightColumns: ["Flight 1"],
        travellers: [],
      };

    const trainSet = new Set();
    const flightSet = new Set();
    const travellersList = [];

    tourBookings.forEach((booking) => {
      if (!booking.payment?.advance?.paymentVerified) return;
      booking.travellers?.forEach((trav) => {
        if (trav.cancelled?.byTraveller || trav.cancelled?.byAdmin) return;

        if (Array.isArray(trav.trainSeats)) {
          trav.trainSeats.forEach(
            (s) => s?.trainName && trainSet.add(s.trainName),
          );
        } else if (trav.trainSeats && typeof trav.trainSeats === "object") {
          Object.keys(trav.trainSeats).forEach((k) => trainSet.add(k));
        }

        if (Array.isArray(trav.flightSeats)) {
          trav.flightSeats.forEach(
            (s) => s?.flightName && flightSet.add(s.flightName),
          );
        } else if (trav.flightSeats && typeof trav.flightSeats === "object") {
          Object.keys(trav.flightSeats).forEach((k) => flightSet.add(k));
        }

        const trainSeatsMap = {};
        const flightSeatsMap = {};
        const trainColumns =
          trainSet.size > 0 ? Array.from(trainSet) : ["Train 1"];
        const flightColumns =
          flightSet.size > 0 ? Array.from(flightSet) : ["Flight 1"];

        trainColumns.forEach((tn) => (trainSeatsMap[tn] = ""));
        flightColumns.forEach((fn) => (flightSeatsMap[fn] = ""));

        if (Array.isArray(trav.trainSeats)) {
          trav.trainSeats.forEach(
            (s) =>
              s?.trainName && (trainSeatsMap[s.trainName] = s.seatNo ?? ""),
          );
        } else if (trav.trainSeats && typeof trav.trainSeats === "object") {
          Object.entries(trav.trainSeats).forEach(
            ([k, v]) => (trainSeatsMap[k] = v ?? ""),
          );
        }

        if (Array.isArray(trav.flightSeats)) {
          trav.flightSeats.forEach(
            (s) =>
              s?.flightName && (flightSeatsMap[s.flightName] = s.seatNo ?? ""),
          );
        } else if (trav.flightSeats && typeof trav.flightSeats === "object") {
          Object.entries(trav.flightSeats).forEach(
            ([k, v]) => (flightSeatsMap[k] = v ?? ""),
          );
        }

        travellersList.push({
          tnr: booking.tnr || "—",
          id: trav._id,
          name: `${trav.firstName || ""} ${trav.lastName || ""}`.trim(),
          age: trav.age ?? "",
          gender: trav.gender || "",
          sharingType: trav.sharingType || "",
          mobile: booking.contact?.mobile ?? trav.phone ?? "",
          boardingPoint: trav.boardingPoint?.stationName || "",
          deboardingPoint: trav.deboardingPoint?.stationName || "",
          trainSeats: trainSeatsMap,
          flightSeats: flightSeatsMap,
        });
      });
    });

    const filteredTravellers = travellersList.filter((traveller) => {
      const matchesName = nameFilter
        ? traveller.name.toLowerCase().includes(nameFilter.toLowerCase())
        : true;
      const matchesPhone = phoneFilter
        ? traveller.mobile.includes(phoneFilter)
        : true;
      const matchesBoardingPoint = boardingPointFilter
        ? traveller.boardingPoint
            .toLowerCase()
            .includes(boardingPointFilter.toLowerCase())
        : true;
      const matchesDeboardingPoint = deboardingPointFilter
        ? traveller.deboardingPoint
            .toLowerCase()
            .includes(deboardingPointFilter.toLowerCase())
        : true;
      return (
        matchesName &&
        matchesPhone &&
        matchesBoardingPoint &&
        matchesDeboardingPoint
      );
    });

    return {
      trainColumns: Array.from(
        trainSet.size > 0 ? trainSet : new Set(["Train 1"]),
      ),
      flightColumns: Array.from(
        flightSet.size > 0 ? flightSet : new Set(["Flight 1"]),
      ),
      travellers: filteredTravellers,
    };
  }, [
    tourBookings,
    selectedTourId,
    nameFilter,
    phoneFilter,
    boardingPointFilter,
    deboardingPointFilter,
  ]);

  // ── Train-wise, Coach-wise Traveller Count (view-only) ──────────────
  // Mirrors TourNameList.jsx's logic exactly, so Tour Admin and Super
  // Admin always show the same counts from the same underlying seat
  // data. Purely a client-side computation over tableData.travellers —
  // no separate backend endpoint, nothing gets written anywhere.

  // Extracts { coach, seatNo, isOwnBooking } from a manually typed seat
  // value like "A2-45" or "OB-A1-23" — OB is detected and skipped, A1 is
  // used as the coach, 23 as the seat number.
  const extractCoachInfo = (seatValue) => {
    if (!seatValue) return null;
    const str = String(seatValue).trim();
    if (!str) return null;
    // Must match TourNameList.jsx exactly — splits on hyphen, slash, OR
    // whitespace, since admins type seat values in different formats
    // ("C17-10", "C17/10", "C17 10"). Splitting on "-" alone left
    // space-separated values (e.g. "C17 10") as one single unsplit
    // chunk, so the coach badge showed "C17 10" merged together instead
    // of coach="C17" / seatNo="10".
    const parts = str.split(/[-/\s]+/).filter(Boolean);
    if (parts.length === 0) return null;

    const skipPrefixes = ["OB"];

    let idx = 0;
    let isOwnBooking = false;
    if (skipPrefixes.includes(parts[0].toUpperCase()) && parts.length > 1) {
      isOwnBooking = true;
      idx = 1;
    }

    const coach = parts[idx].toUpperCase();
    const seatNo = parts[idx + 1] || "";
    return { coach, seatNo, isOwnBooking };
  };

  // trainWiseCoachCount[trainName][coach] = { total, ob, seats: [{ seatNo, isOwnBooking }, ...] }
  const trainWiseCoachCount = useMemo(() => {
    const result = {};
    tableData.travellers.forEach((traveller) => {
      Object.entries(traveller.trainSeats || {}).forEach(
        ([trainName, seatVal]) => {
          const info = extractCoachInfo(seatVal);
          if (!info) return;
          const { coach, seatNo, isOwnBooking } = info;

          result[trainName] = result[trainName] || {};
          if (!result[trainName][coach]) {
            result[trainName][coach] = { total: 0, ob: 0, seats: [] };
          }
          result[trainName][coach].total += 1;
          if (isOwnBooking) result[trainName][coach].ob += 1;
          if (seatNo) {
            result[trainName][coach].seats.push({ seatNo, isOwnBooking });
          }
        },
      );
    });

    Object.values(result).forEach((coaches) => {
      Object.values(coaches).forEach((c) => {
        c.seats.sort((a, b) => {
          const na = parseInt(a.seatNo, 10);
          const nb = parseInt(b.seatNo, 10);
          if (!isNaN(na) && !isNaN(nb)) return na - nb;
          return String(a.seatNo).localeCompare(String(b.seatNo));
        });
      });
    });

    return result;
  }, [tableData.travellers]);

  // Shape: [ [trainName, [ [coach, {total, ob, seats}], ... ]], ... ]
  // Train order follows tableData.trainColumns (same order the columns
  // appear in the table below); coach order follows first-appearance
  // order in the traveller list.
  const sortedTrainEntries = useMemo(() => {
    const orderedTrainNames = (tableData.trainColumns || []).filter(
      (tn) => trainWiseCoachCount[tn],
    );
    Object.keys(trainWiseCoachCount).forEach((tn) => {
      if (!orderedTrainNames.includes(tn)) orderedTrainNames.push(tn);
    });
    return orderedTrainNames.map((trainName) => [
      trainName,
      Object.entries(trainWiseCoachCount[trainName]),
    ]);
  }, [trainWiseCoachCount, tableData.trainColumns]);

  const exportToPDF = () => {
    const doc = new jsPDF("landscape", "pt", "a4");
    const tourFromList = tours.find((tour) => tour._id === selectedTourId);
    const displayTitle = tourFromList?.title?.trim() || "Tour Traveller List";

    doc.setFontSize(18);
    doc.text(displayTitle, doc.internal.pageSize.getWidth() / 2, 50, {
      align: "center",
    });

    // Train-wise, Coach-wise Traveller Count — one small table per train,
    // stacked vertically, exactly matching TourNameList.jsx's PDF layout
    // so Tour Admin and Super Admin printouts are identical.
    let tableStartY = 100;

    if (sortedTrainEntries.length > 0) {
      doc.setFontSize(15);
      doc.setFont(undefined, "bold");
      doc.setTextColor(21, 128, 61); // green-700
      doc.text(
        "TRAIN-WISE COACH TRAVELLER COUNT",
        doc.internal.pageSize.getWidth() / 2,
        86,
        { align: "center" },
      );
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "normal");

      const pageWidth = doc.internal.pageSize.getWidth();
      const sideMargin = 40;
      const pageHeight = doc.internal.pageSize.getHeight();
      const bottomMargin = 50;
      let currentY = 124;
      let anyObAcrossAllTrains = false;

      sortedTrainEntries.forEach(([trainName, coachEntries]) => {
        const trainTotal = coachEntries.reduce(
          (sum, [, { total }]) => sum + total,
          0,
        );

        // If there isn't room left on this page for the heading plus at
        // least one row of chips, start a fresh page rather than clipping.
        if (currentY + 14 + 58 > pageHeight - bottomMargin) {
          doc.addPage();
          currentY = 40;
        }

        // Sub-heading naming the train this coach table belongs to, plus its total
        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.setTextColor(124, 45, 18); // green-700
        doc.text(
          `${trainName.toUpperCase()}   (Assigned: ${trainTotal} / ${tableData.travellers.length})`,
          pageWidth / 2,
          currentY,
          { align: "center" },
        );
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, "normal");
        currentY += 14;

        const hasAnyObThisTrain = coachEntries.some(([, { ob }]) => ob > 0);
        anyObAcrossAllTrains = anyObAcrossAllTrains || hasAnyObThisTrain;

        // Draw each coach as a rounded "chip" card — colored coach-code badge
        // on the left, traveller count + seat numbers on the right — laid
        // out left-to-right and wrapping to a new row like flex-wrap,
        // mirroring the on-screen card design instead of a plain table.
        const chipGap = 14;
        const chipHeight = 58;
        const padX = 10;
        let x = sideMargin;
        let rowTallest = chipHeight;

        coachEntries.forEach(([coach, { total, ob, seats }]) => {
          const seatsText = seats
            .map((s) => `${s.seatNo}${s.isOwnBooking ? "*" : ""}`)
            .join(", ");
          const totalLineText = `${total}${ob > 0 ? `  (${ob} OB)` : ""}`;

          // Badge width must fit the coach text itself (e.g. "C17" is
          // wider than "A2") — a fixed 42pt badge let longer coach codes
          // overflow past the badge and visually merge with the seat
          // numbers next to it. Measured with the same bold 14pt font
          // used to actually draw the coach label below.
          doc.setFontSize(14);
          doc.setFont(undefined, "bold");
          const coachTextWidth = doc.getTextWidth(coach);
          const badgeWidth = Math.max(42, coachTextWidth + 18);

          doc.setFontSize(14);
          doc.setFont(undefined, "bold");
          const totalLineWidth = doc.getTextWidth(totalLineText);
          doc.setFontSize(12.5);
          const seatsLineWidth = seats.length ? doc.getTextWidth(seatsText) : 0;

          const rightWidth =
            Math.max(totalLineWidth, seatsLineWidth, 24) + padX * 2;
          const chipWidth = badgeWidth + rightWidth;

          // Wrap to next row if this chip doesn't fit on the current line
          if (x + chipWidth > pageWidth - sideMargin) {
            x = sideMargin;
            currentY += rowTallest + chipGap;
            rowTallest = chipHeight;
          }

          // If this row would overflow the bottom of the page, continue on a new page
          if (currentY + chipHeight > pageHeight - bottomMargin) {
            doc.addPage();
            currentY = 40;
            x = sideMargin;
            rowTallest = chipHeight;
          }

          // Card background + border
          doc.setDrawColor(203, 213, 225); // slate-300
          doc.setFillColor(238, 242, 255); // indigo-50 card background
          doc.roundedRect(x, currentY, chipWidth, chipHeight, 5, 5, "FD");

          // Left colored coach badge
          doc.setFillColor(99, 102, 241); // indigo-500
          doc.rect(x + 1, currentY + 1, badgeWidth - 2, chipHeight - 2, "F");
          doc.setFontSize(14);
          doc.setFont(undefined, "bold");
          doc.setTextColor(255, 255, 255);
          doc.text(coach, x + badgeWidth / 2, currentY + chipHeight / 2 + 4, {
            align: "center",
          });

          // Total count (+ OB) line
          const textX = x + badgeWidth + padX;
          const totalY = seats.length ? currentY + 21 : currentY + chipHeight / 2 + 4;
          doc.setFontSize(14);
          doc.setFont(undefined, "bold");
          doc.setTextColor(220, 38, 38); // red-600
          doc.text(`${total}`, textX, totalY);
          if (ob > 0) {
            let obX = textX + doc.getTextWidth(`${total}`) + 4;
            doc.setFontSize(10);
            doc.setTextColor(21, 128, 61); // green-700
            doc.text(`(${ob} OB)`, obX, totalY);
          }

          // Seat numbers line, with each OB seat colored red
          if (seats.length > 0) {
            doc.setFontSize(12.5);
            let sx = textX;
            const sy = currentY + chipHeight - 12;
            seats.forEach((s, i) => {
              const txt = `${s.seatNo}${s.isOwnBooking ? "*" : ""}${
                i < seats.length - 1 ? "," : ""
              }`;
              if (s.isOwnBooking) {
                doc.setTextColor(147, 51, 234); // purple-600
                doc.setFont(undefined, "bold");
              } else {
                doc.setTextColor(0, 0, 0); // black
                doc.setFont(undefined, "normal");
              }
              doc.text(txt, sx, sy);
              sx += doc.getTextWidth(txt) + 2;
            });
          }

          doc.setTextColor(0, 0, 0);
          doc.setFont(undefined, "normal");

          x += chipWidth + chipGap;
        });

        currentY += rowTallest + 36; // gap before next train's section
      });

      // Small legend explaining the "*" marker, after all train tables
      if (anyObAcrossAllTrains) {
        doc.setFontSize(8);
        doc.setFont(undefined, "italic");
        doc.setTextColor(120, 53, 15); // brown-800
        doc.text(
          "* = Own Booking (OB)",
          doc.internal.pageSize.getWidth() / 2,
          currentY,
          { align: "center" },
        );
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, "normal");
        currentY += 16;
      }

      // Keep page 1 dedicated to the train/coach-wise count — name list starts on page 2
      doc.addPage();
      tableStartY = 40;
    }

    const head = [
      [
        "SL NO",
        "TNR",
        "NAME",
        "AGE",
        "GENDER",
        "MOBILE",
        "BOARDING POINT",
        "DEBOARDING POINT",
        ...tableData.trainColumns,
        ...tableData.flightColumns,
      ],
    ];
    const body = tableData.travellers.map((trav, idx) => [
      String(idx + 1).padStart(2, "0"),
      trav.tnr || "—",
      trav.name || "—",
      trav.age ?? "—",
      getDisplayGender(trav.age, trav.gender, trav.sharingType),
      trav.mobile || "—",
      trav.boardingPoint || "—",
      trav.deboardingPoint || "—",
      ...tableData.trainColumns.map((c) => trav.trainSeats?.[c] ?? "—"),
      ...tableData.flightColumns.map((c) => trav.flightSeats?.[c] ?? "—"),
    ]);

    autoTable(doc, {
      head,
      body,
      startY: tableStartY,
      styles: {
        fontSize: 10,
        cellPadding: 5,
        halign: "center",
        valign: "middle",
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [40, 167, 69],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [240, 248, 243] },
      columnStyles: { 1: { halign: "left" } },
    });

    const safeFileName = displayTitle
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "_")
      .trim();
    doc.save(`${safeFileName}_Traveller_List.pdf`);
    toast.success("✅ PDF exported successfully", {
      toastId: "pdf-export-success",
    });
  };

  const totalColumns =
    tableData.trainColumns.length + tableData.flightColumns.length;
  const columnWidthClass =
    totalColumns > 10
      ? "min-w-[80px]"
      : totalColumns > 6
        ? "min-w-[100px]"
        : "min-w-[120px]";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto">
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
        limit={5}
        className="fixed top-4 right-4 z-[9999]"
        toastClassName="min-w-[280px] max-w-[380px] bg-white shadow-xl rounded-lg border border-gray-200"
        bodyClassName="text-sm font-medium text-gray-800"
        progressClassName="bg-gradient-to-r from-blue-500 to-indigo-600 h-1 rounded-full"
      />

      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6 text-center">
          Admin Name List
        </h2>

        <div className="mb-4 sm:mb-6">
          <label
            htmlFor="tour-select"
            className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
          >
            Select Tour:
          </label>
          <select
            id="tour-select"
            value={selectedTourId || ""}
            onChange={(e) => setSelectedTourId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md disabled:bg-gray-100 touch-manipulation"
            disabled={isLoadingBookings}
          >
            <option value="">-- Select a Tour --</option>
            {tours.map((tour) => (
              <option key={tour._id} value={tour._id}>
                {tour.title}
              </option>
            ))}
          </select>
        </div>

        {selectedTourId ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex-1">
                <label
                  htmlFor="name-filter"
                  className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
                >
                  Filter by Name:
                </label>
                <input
                  id="name-filter"
                  type="text"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  placeholder="Enter name to filter"
                  className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="phone-filter"
                  className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
                >
                  Filter by Phone:
                </label>
                <input
                  id="phone-filter"
                  type="text"
                  value={phoneFilter}
                  onChange={(e) => setPhoneFilter(e.target.value)}
                  placeholder="Enter phone to filter"
                  className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="boarding-point-filter"
                  className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
                >
                  Filter by Boarding Point:
                </label>
                <input
                  id="boarding-point-filter"
                  type="text"
                  value={boardingPointFilter}
                  onChange={(e) => setBoardingPointFilter(e.target.value)}
                  placeholder="Enter boarding point"
                  className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="deboarding-point-filter"
                  className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
                >
                  Filter by Deboarding Point:
                </label>
                <input
                  id="deboarding-point-filter"
                  type="text"
                  value={deboardingPointFilter}
                  onChange={(e) => setDeboardingPointFilter(e.target.value)}
                  placeholder="Enter deboarding point"
                  className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation"
                />
              </div>
            </div>

            <div className="flex justify-end mb-4 sm:mb-6">
              <button
                onClick={exportToPDF}
                className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs sm:text-sm lg:text-base min-w-[100px] sm:min-w-[120px] touch-manipulation"
              >
                📄 Export to PDF
              </button>
            </div>

            {/* Train-wise, Coach-wise Traveller Count — VIEW ONLY */}
            {sortedTrainEntries.length > 0 && (
              <div className="mb-5 sm:mb-7 rounded-xl border border-blue-200 bg-blue-50/70 p-3 sm:p-4">
                <div className="mb-3">
                  <p className="text-[11px] sm:text-xs font-bold text-green-700 uppercase tracking-wide">
                    Train-wise Coach Traveller Count
                  </p>
                </div>
                <div className="space-y-4">
                  {sortedTrainEntries.map(([trainName, coachEntries]) => {
                    const trainAssignedCount = coachEntries.reduce(
                      (sum, [, { total }]) => sum + total,
                      0,
                    );
                    return (
                      <div key={trainName}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] sm:text-xs font-bold text-orange-900 uppercase tracking-wide">
                            {trainName}
                          </p>
                          <span
                            className={`text-[10px] sm:text-xs font-bold rounded-full px-2.5 py-0.5 border ${
                              trainAssignedCount === tableData.travellers.length
                                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                : "text-amber-700 bg-amber-50 border-amber-200"
                            }`}
                          >
                            Assigned: {trainAssignedCount} /{" "}
                            {tableData.travellers.length}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-5">
                          {coachEntries.map(([coach, { total, ob, seats }]) => (
                            <div
                              key={`${trainName}-${coach}`}
                              className="flex items-stretch overflow-hidden rounded-md border border-slate-200 bg-white"
                            >
                              <span className="flex items-center px-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-500">
                                {coach}
                              </span>
                              <div className="flex flex-col justify-center px-2.5 py-1.5">
                                <span className="flex items-center gap-1">
                                  <span className="text-xs sm:text-sm font-bold text-red-600">
                                    {total}
                                  </span>
                                  {ob > 0 && (
                                    <span className="text-[10px] sm:text-xs font-bold text-green-600">
                                      ({ob} OB)
                                    </span>
                                  )}
                                </span>
                                {seats.length > 0 && (
                                  <span className="text-[10px] sm:text-xs text-slate-500 mt-0.5 whitespace-nowrap">
                                    {seats.map((s, i) => (
                                      <React.Fragment key={i}>
                                        {i > 0 && ","}
                                        <span
                                          className={
                                            s.isOwnBooking
                                              ? "text-purple-600 font-semibold"
                                              : ""
                                          }
                                        >
                                          {s.seatNo}
                                          {s.isOwnBooking ? "*" : ""}
                                        </span>
                                      </React.Fragment>
                                    ))}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isLoadingBookings ? (
              <div className="text-center text-gray-500 text-xs sm:text-sm lg:text-base py-10">
                <svg
                  className="animate-spin h-5 w-5 sm:h-6 sm:w-6 mx-auto text-indigo-500"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>{" "}
                Loading...
              </div>
            ) : tableData.travellers.length === 0 ? (
              <p className="text-center text-gray-500 text-xs sm:text-sm lg:text-base py-10">
                No active travellers with verified advance payment found.
              </p>
            ) : (
              <>
                {/* Desktop Table - VIEW ONLY (no inputs/buttons) */}
                <div className="hidden sm:block overflow-x-auto max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-3rem)] lg:max-w-[calc(100vw-4rem)] mx-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 sticky top-0 z-10">
                        <th
                          className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[50px]`}
                        >
                          SL NO
                        </th>
                        <th
                          className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[90px] font-mono`}
                        >
                          TNR
                        </th>
                        <th
                          className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[100px] sm:min-w-[120px]`}
                        >
                          NAME
                        </th>
                        <th
                          className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[50px]`}
                        >
                          AGE
                        </th>
                        <th
                          className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[60px]`}
                        >
                          GENDER
                        </th>
                        <th
                          className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[80px]`}
                        >
                          MOBILE
                        </th>
                        <th
                          className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold ${columnWidthClass}`}
                        >
                          BOARDING POINT
                        </th>
                        <th
                          className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold ${columnWidthClass}`}
                        >
                          DEBOARDING POINT
                        </th>
                        {tableData.trainColumns.map((col, i) => (
                          <th
                            key={i}
                            className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold ${columnWidthClass}`}
                          >
                            {col}
                          </th>
                        ))}
                        {tableData.flightColumns.map((col, i) => (
                          <th
                            key={i}
                            className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold ${columnWidthClass}`}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.travellers.map((trav, idx) => (
                        <tr key={trav.id}>
                          <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base">
                            {String(idx + 1).padStart(2, "0")}.
                          </td>
                          <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-mono">
                            {trav.tnr}
                          </td>
                          <td
                            className="p-2 sm:p-3 border border-gray-200 text-xs sm:text-sm lg:text-base truncate max-w-[100px] sm:max-w-[120px]"
                            title={trav.name}
                          >
                            {trav.name}
                          </td>
                          <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base">
                            {trav.age || "—"}
                          </td>
                          <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base">
                            {getDisplayGender(
                              trav.age,
                              trav.gender,
                              trav.sharingType,
                            ) || "—"}
                          </td>
                          <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base">
                            {trav.mobile || "—"}
                          </td>
                          <td
                            className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base truncate max-w-[80px] sm:max-w-[100px]"
                            title={trav.boardingPoint}
                          >
                            {trav.boardingPoint || "—"}
                          </td>
                          <td
                            className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base truncate max-w-[80px] sm:max-w-[100px]"
                            title={trav.deboardingPoint}
                          >
                            {trav.deboardingPoint || "—"}
                          </td>
                          {tableData.trainColumns.map((col) => (
                            <td
                              key={col}
                              className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base bg-gray-50"
                            >
                              {trav.trainSeats?.[col] ?? "—"}
                            </td>
                          ))}
                          {tableData.flightColumns.map((col) => (
                            <td
                              key={col}
                              className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base bg-gray-50"
                            >
                              {trav.flightSeats?.[col] ?? "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View - VIEW ONLY */}
                <div className="block sm:hidden space-y-4">
                  {tableData.travellers.map((trav, idx) => (
                    <div
                      key={trav.id}
                      className="bg-white border rounded-lg p-4 shadow-sm"
                    >
                      <div className="grid grid-cols-1 gap-3 text-xs sm:text-sm">
                        <div>
                          <span className="font-semibold">SL NO: </span>
                          {String(idx + 1).padStart(2, "0")}.
                        </div>
                        <div>
                          <span className="font-semibold">TNR: </span>
                          {trav.tnr}
                        </div>
                        <div>
                          <span className="font-semibold">Name: </span>
                          {trav.name}
                        </div>
                        <div>
                          <span className="font-semibold">Age: </span>
                          {trav.age || "—"}
                        </div>
                        <div>
                          <span className="font-semibold">Gender: </span>
                          {getDisplayGender(
                            trav.age,
                            trav.gender,
                            trav.sharingType,
                          ) || "—"}
                        </div>
                        <div>
                          <span className="font-semibold">Mobile: </span>
                          {trav.mobile || "—"}
                        </div>
                        <div>
                          <span className="font-semibold">Boarding: </span>
                          {trav.boardingPoint || "—"}
                        </div>
                        <div>
                          <span className="font-semibold">Deboarding: </span>
                          {trav.deboardingPoint || "—"}
                        </div>
                        {tableData.trainColumns.map((col) => (
                          <div key={col} className="bg-gray-50 p-2 rounded">
                            <span className="font-semibold block mb-1">
                              {col}:
                            </span>
                            <span className="text-sm font-medium">
                              {trav.trainSeats?.[col] ?? "—"}
                            </span>
                          </div>
                        ))}
                        {tableData.flightColumns.map((col) => (
                          <div key={col} className="bg-blue-50 p-2 rounded">
                            <span className="font-semibold block mb-1">
                              {col}:
                            </span>
                            <span className="text-sm font-medium">
                              {trav.flightSeats?.[col] ?? "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500 text-xs sm:text-sm lg:text-base py-10">
            Please select a tour to view the traveller list.
          </p>
        )}
      </div>

      {showBackConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Unsaved Filters / Selection
            </h2>
            <p className="text-gray-600 mb-6">
              You have selected a tour or applied filters.
              <br />
              Going back will reset them.
              <br />
              Are you sure you want to go back?
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => {
                  setShowBackConfirm(false);
                  // Stay → re-trap the back button
                  window.history.pushState(null, null, window.location.href);
                }}
                className="px-8 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition"
              >
                Cancel (Stay)
              </button>
              <button
                onClick={() => {
                  setShowBackConfirm(false);
                  history.back(); // Really go back
                }}
                className="px-8 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
              >
                OK (Go Back)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNameList;
