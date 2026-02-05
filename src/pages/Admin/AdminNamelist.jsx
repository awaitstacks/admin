// import React, { useState, useContext, useEffect,useMemo } from "react";
// import { useLocation } from "react-router-dom";
// import { TourAdminContext } from "../../context/TourAdminContext"; // adjust path if needed
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const AdminNamelist = () => {
//   const {
//     tours = [],
//     fetchToursList,
//     tourBookings = [],
//     fetchBookingsOfTour,
//     isLoadingBookings = false,
//     selectedTourId,
//     setSelectedTourId,
//   } = useContext(TourAdminContext);

//   const bookings = tourBookings;

//   const [nameFilter, setNameFilter] = useState("");
//   const [phoneFilter, setPhoneFilter] = useState("");
//   const [boardingPointFilter, setBoardingPointFilter] = useState("");
//   const [deboardingPointFilter, setDeboardingPointFilter] = useState("");

//   const location = useLocation();

//   // Load tours once
//   useEffect(() => {
//     fetchToursList?.();
//   }, [fetchToursList]);

//   // Load bookings when tour selected
//   useEffect(() => {
//     if (selectedTourId) {
//       fetchBookingsOfTour?.(selectedTourId);
//     }
//   }, [selectedTourId, fetchBookingsOfTour]);

//   // Clear toasts on unmount / route change
//   useEffect(() => {
//     return () => toast.dismiss();
//   }, [location]);

//   // Flatten travellers for display (view only)
//   const filteredTravellers = useMemo(() => {
//     return bookings.flatMap(booking =>
//       (booking.travellers || []).map(trav => ({
//         name: `${trav.firstName || ""} ${trav.lastName || ""}`.trim(),
//         age: trav.age ?? "—",
//         gender: trav.gender || "—",
//         mobile: booking.contact?.mobile ?? trav.phone ?? "—",
//         boardingPoint: trav.boardingPoint?.stationName || "—",
//         deboardingPoint: trav.deboardingPoint?.stationName || "—",
//         trainSeats: Array.isArray(trav.trainSeats)
//           ? trav.trainSeats.map(s => s.seatNo || "—").join(", ")
//           : trav.trainSeats || "—",
//         flightSeats: Array.isArray(trav.flightSeats)
//           ? trav.flightSeats.map(s => s.seatNo || "—").join(", ")
//           : trav.flightSeats || "—",
//       }))
//     ).filter(trav => {
//       const nameMatch = nameFilter ? trav.name.toLowerCase().includes(nameFilter.toLowerCase()) : true;
//       const phoneMatch = phoneFilter ? trav.mobile.includes(phoneFilter) : true;
//       const boardingMatch = boardingPointFilter ? trav.boardingPoint.toLowerCase().includes(boardingPointFilter.toLowerCase()) : true;
//       const deboardingMatch = deboardingPointFilter ? trav.deboardingPoint.toLowerCase().includes(deboardingPointFilter.toLowerCase()) : true;
//       return nameMatch && phoneMatch && boardingMatch && deboardingMatch;
//     });
//   }, [bookings, nameFilter, phoneFilter, boardingPointFilter, deboardingPointFilter]);

//   const exportToPDF = () => {
//     const doc = new jsPDF("landscape", "pt", "a4");
//     const title = tours.find(t => t._id === selectedTourId)?.title?.trim() || "Name List";

//     doc.setFontSize(18);
//     doc.text(title, doc.internal.pageSize.getWidth() / 2, 50, { align: "center" });

//     const head = [["SL NO", "NAME", "AGE", "GENDER", "MOBILE", "BOARDING POINT", "DEBOARDING POINT", "TRAIN SEATS", "FLIGHT SEATS"]];

//     const body = filteredTravellers.map((trav, idx) => [
//       String(idx + 1).padStart(2, "0"),
//       trav.name,
//       trav.age,
//       trav.gender,
//       trav.mobile,
//       trav.boardingPoint,
//       trav.deboardingPoint,
//       trav.trainSeats,
//       trav.flightSeats,
//     ]);

//     autoTable(doc, {
//       head,
//       body,
//       startY: 80,
//       styles: { fontSize: 10, cellPadding: 5, halign: "center", valign: "middle" },
//       headStyles: { fillColor: [40, 167, 69], textColor: [255, 255, 255], fontStyle: "bold" },
//       alternateRowStyles: { fillColor: [240, 248, 243] },
//     });

//     const safeName = title.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_").trim();
//     doc.save(`${safeName}_Name_List.pdf`);

//     toast.success("PDF exported successfully");
//   };

//   return (
//     <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto">
//       <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

//       <div className="mb-8">
//         <h2 className="text-2xl font-bold text-center">Name List (Admin View)</h2>
//       </div>

//       <div className="mb-6">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Select Tour:
//         </label>
//         <select
//           value={selectedTourId}
//           onChange={(e) => setSelectedTourId(e.target.value)}
//           className="w-full max-w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
//           disabled={isLoadingBookings}
//         >
//           <option value="">-- Select Tour --</option>
//           {tours.map((tour) => (
//             <option key={tour._id} value={tour._id}>
//               {tour.title || "Unnamed Tour"}
//             </option>
//           ))}
//         </select>
//       </div>

//       {selectedTourId ? (
//         isLoadingBookings ? (
//           <div className="text-center py-10">Loading...</div>
//         ) : filteredTravellers.length === 0 ? (
//           <p className="text-center text-gray-500 py-10">
//             No travellers found for this tour.
//           </p>
//         ) : (
//           <>
//             <div className="flex justify-end mb-6">
//               <button
//                 onClick={exportToPDF}
//                 className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
//               >
//                 Export to PDF
//               </button>
//             </div>

//             <div className="overflow-x-auto bg-white border rounded-lg shadow">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SL NO</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NAME</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AGE</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GENDER</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MOBILE</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BOARDING POINT</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DEBOARDING POINT</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TRAIN SEATS</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">FLIGHT SEATS</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {filteredTravellers.map((trav, idx) => (
//                     <tr key={idx}>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">{String(idx + 1).padStart(2, "0")}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">{trav.name}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{trav.age}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{trav.gender}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{trav.mobile}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">{trav.boardingPoint}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">{trav.deboardingPoint}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{trav.trainSeats}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{trav.flightSeats}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </>
//         )
//       ) : (
//         <p className="text-center text-gray-500 py-10">
//           Please select a tour to view the traveller list.
//         </p>
//       )}
//     </div>
//   );
// };

// export default AdminNamelist;

import React, { useState, useContext, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AdminNamelist = () => {
  const { tours = [], fetchToursList, tourBookings = [], fetchBookingsOfTour, selectedTourId, setSelectedTourId, isLoadingBookings = false } = useContext(TourAdminContext);
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
}, [selectedTourId, nameFilter, phoneFilter, boardingPointFilter, deboardingPointFilter]);

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
    setSelectedTourId("");               // tour clear
    setNameFilter("");                   // all filters clear
    setPhoneFilter("");
    setBoardingPointFilter("");
    setDeboardingPointFilter("");
    
    // Optional: toast காட்டலாம் (debug-க்கு உதவும்)
    // toast.info("Admin Name List reset to initial state", { autoClose: 2000 });
  }, [location.pathname]);

  useEffect(() => { fetchToursList?.(); }, [fetchToursList]);
  useEffect(() => { if (selectedTourId) fetchBookingsOfTour?.(selectedTourId); }, [selectedTourId, fetchBookingsOfTour]);
  useEffect(() => { return () => toast.dismiss(); }, [location]);

  const getDisplayGender = (age, gender, sharingType) => {
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 6) return "";
    const genderAbbrev = gender?.toLowerCase() === "male" ? "M" : gender?.toLowerCase() === "female" ? "F" : "";
    if (parsedAge >= 6 && parsedAge <= 10) {
      if (["withBerth", "double", "triple"].includes(sharingType)) return genderAbbrev ? `CWB(${genderAbbrev})` : "CWB";
      if (sharingType === "withoutBerth") return genderAbbrev ? `CNB(${genderAbbrev})` : "CNB";
      return "";
    }
    return genderAbbrev;
  };

  const tableData = useMemo(() => {
    if (!tourBookings.length || !selectedTourId) return { trainColumns: ["Train 1"], flightColumns: ["Flight 1"], travellers: [] };
    
    const trainSet = new Set();
    const flightSet = new Set();
    const travellersList = [];

    tourBookings.forEach((booking) => {
      if (!booking.payment?.advance?.paymentVerified) return;
      booking.travellers?.forEach((trav) => {
        if (trav.cancelled?.byTraveller || trav.cancelled?.byAdmin) return;

        if (Array.isArray(trav.trainSeats)) {
          trav.trainSeats.forEach((s) => s?.trainName && trainSet.add(s.trainName));
        } else if (trav.trainSeats && typeof trav.trainSeats === "object") {
          Object.keys(trav.trainSeats).forEach((k) => trainSet.add(k));
        }

        if (Array.isArray(trav.flightSeats)) {
          trav.flightSeats.forEach((s) => s?.flightName && flightSet.add(s.flightName));
        } else if (trav.flightSeats && typeof trav.flightSeats === "object") {
          Object.keys(trav.flightSeats).forEach((k) => flightSet.add(k));
        }

        const trainSeatsMap = {};
        const flightSeatsMap = {};
        const trainColumns = trainSet.size > 0 ? Array.from(trainSet) : ["Train 1"];
        const flightColumns = flightSet.size > 0 ? Array.from(flightSet) : ["Flight 1"];

        trainColumns.forEach((tn) => (trainSeatsMap[tn] = ""));
        flightColumns.forEach((fn) => (flightSeatsMap[fn] = ""));

        if (Array.isArray(trav.trainSeats)) {
          trav.trainSeats.forEach((s) => s?.trainName && (trainSeatsMap[s.trainName] = s.seatNo ?? ""));
        } else if (trav.trainSeats && typeof trav.trainSeats === "object") {
          Object.entries(trav.trainSeats).forEach(([k, v]) => (trainSeatsMap[k] = v ?? ""));
        }

        if (Array.isArray(trav.flightSeats)) {
          trav.flightSeats.forEach((s) => s?.flightName && (flightSeatsMap[s.flightName] = s.seatNo ?? ""));
        } else if (trav.flightSeats && typeof trav.flightSeats === "object") {
          Object.entries(trav.flightSeats).forEach(([k, v]) => (flightSeatsMap[k] = v ?? ""));
        }

        travellersList.push({
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
      const matchesName = nameFilter ? traveller.name.toLowerCase().includes(nameFilter.toLowerCase()) : true;
      const matchesPhone = phoneFilter ? traveller.mobile.includes(phoneFilter) : true;
      const matchesBoardingPoint = boardingPointFilter ? traveller.boardingPoint.toLowerCase().includes(boardingPointFilter.toLowerCase()) : true;
      const matchesDeboardingPoint = deboardingPointFilter ? traveller.deboardingPoint.toLowerCase().includes(deboardingPointFilter.toLowerCase()) : true;
      return matchesName && matchesPhone && matchesBoardingPoint && matchesDeboardingPoint;
    });

    return {
      trainColumns: Array.from(trainSet.size > 0 ? trainSet : new Set(["Train 1"])),
      flightColumns: Array.from(flightSet.size > 0 ? flightSet : new Set(["Flight 1"])),
      travellers: filteredTravellers,
    };
  }, [tourBookings, selectedTourId, nameFilter, phoneFilter, boardingPointFilter, deboardingPointFilter]);

  const exportToPDF = () => {
    const doc = new jsPDF("landscape", "pt", "a4");
    const tourFromList = tours.find((tour) => tour._id === selectedTourId);
    const displayTitle = tourFromList?.title?.trim() || "Tour Traveller List";

    doc.setFontSize(18);
    doc.text(displayTitle, doc.internal.pageSize.getWidth() / 2, 50, { align: "center" });

    const head = [["SL NO", "NAME", "AGE", "GENDER", "MOBILE", "BOARDING POINT", "DEBOARDING POINT", ...tableData.trainColumns, ...tableData.flightColumns]];
    const body = tableData.travellers.map((trav, idx) => [
      String(idx + 1).padStart(2, "0"),
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
      head, body, startY: 80,
      styles: { fontSize: 10, cellPadding: 5, halign: "center", valign: "middle", overflow: "linebreak" },
      headStyles: { fillColor: [40, 167, 69], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [240, 248, 243] },
      columnStyles: { 1: { halign: "left" } },
    });

    const safeFileName = displayTitle.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_").trim();
    doc.save(`${safeFileName}_Traveller_List.pdf`);
    toast.success("✅ PDF exported successfully", { toastId: "pdf-export-success" });
  };

  const totalColumns = tableData.trainColumns.length + tableData.flightColumns.length;
  const columnWidthClass = totalColumns > 10 ? "min-w-[80px]" : totalColumns > 6 ? "min-w-[100px]" : "min-w-[120px]";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto">
      <ToastContainer
        position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false}
        pauseOnFocusLoss draggable pauseOnHover limit={5}
        className="fixed top-4 right-4 z-[9999]"
        toastClassName="min-w-[280px] max-w-[380px] bg-white shadow-xl rounded-lg border border-gray-200"
        bodyClassName="text-sm font-medium text-gray-800"
        progressClassName="bg-gradient-to-r from-blue-500 to-indigo-600 h-1 rounded-full"
      />

      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6 text-center">Admin Name List</h2>
        
        <div className="mb-4 sm:mb-6">
          <label htmlFor="tour-select" className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1">Select Tour:</label>
          <select
            id="tour-select"
            value={selectedTourId || ""}
            onChange={(e) => setSelectedTourId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md disabled:bg-gray-100 touch-manipulation"
            disabled={isLoadingBookings}
          >
            <option value="">-- Select a Tour --</option>
            {tours.map((tour) => (
              <option key={tour._id} value={tour._id}>{tour.title}</option>
            ))}
          </select>
        </div>

        {selectedTourId ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex-1">
                <label htmlFor="name-filter" className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1">Filter by Name:</label>
                <input id="name-filter" type="text" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)}
                  placeholder="Enter name to filter" className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation" />
              </div>
              <div className="flex-1">
                <label htmlFor="phone-filter" className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1">Filter by Phone:</label>
                <input id="phone-filter" type="text" value={phoneFilter} onChange={(e) => setPhoneFilter(e.target.value)}
                  placeholder="Enter phone to filter" className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation" />
              </div>
              <div className="flex-1">
                <label htmlFor="boarding-point-filter" className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1">Filter by Boarding Point:</label>
                <input id="boarding-point-filter" type="text" value={boardingPointFilter} onChange={(e) => setBoardingPointFilter(e.target.value)}
                  placeholder="Enter boarding point" className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation" />
              </div>
              <div className="flex-1">
                <label htmlFor="deboarding-point-filter" className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1">Filter by Deboarding Point:</label>
                <input id="deboarding-point-filter" type="text" value={deboardingPointFilter} onChange={(e) => setDeboardingPointFilter(e.target.value)}
                  placeholder="Enter deboarding point" className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation" />
              </div>
            </div>

            <div className="flex justify-end mb-4 sm:mb-6">
              <button onClick={exportToPDF} className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs sm:text-sm lg:text-base min-w-[100px] sm:min-w-[120px] touch-manipulation">
                📄 Export to PDF
              </button>
            </div>

            {isLoadingBookings ? (
              <div className="text-center text-gray-500 text-xs sm:text-sm lg:text-base py-10">
                <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 mx-auto text-indigo-500" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg> Loading...
              </div>
            ) : tableData.travellers.length === 0 ? (
              <p className="text-center text-gray-500 text-xs sm:text-sm lg:text-base py-10">No active travellers with verified advance payment found.</p>
            ) : (
              <>
                {/* Desktop Table - VIEW ONLY (no inputs/buttons) */}
                <div className="hidden sm:block overflow-x-auto max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-3rem)] lg:max-w-[calc(100vw-4rem)] mx-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 sticky top-0 z-10">
                        <th className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[50px]`}>SL NO</th>
                        <th className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[100px] sm:min-w-[120px]`}>NAME</th>
                        <th className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[50px]`}>AGE</th>
                        <th className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[60px]`}>GENDER</th>
                        <th className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[80px]`}>MOBILE</th>
                        <th className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold ${columnWidthClass}`}>BOARDING POINT</th>
                        <th className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold ${columnWidthClass}`}>DEBOARDING POINT</th>
                        {tableData.trainColumns.map((col, i) => (
                          <th key={i} className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold ${columnWidthClass}`}>{col}</th>
                        ))}
                        {tableData.flightColumns.map((col, i) => (
                          <th key={i} className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold ${columnWidthClass}`}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.travellers.map((trav, idx) => (
                        <tr key={trav.id}>
                          <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base">{String(idx + 1).padStart(2, "0")}.</td>
                          <td className="p-2 sm:p-3 border border-gray-200 text-xs sm:text-sm lg:text-base truncate max-w-[100px] sm:max-w-[120px]" title={trav.name}>{trav.name}</td>
                          <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base">{trav.age || "—"}</td>
                          <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base">{getDisplayGender(trav.age, trav.gender, trav.sharingType) || "—"}</td>
                          <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base">{trav.mobile || "—"}</td>
                          <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base truncate max-w-[80px] sm:max-w-[100px]" title={trav.boardingPoint}>{trav.boardingPoint || "—"}</td>
                          <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base truncate max-w-[80px] sm:max-w-[100px]" title={trav.deboardingPoint}>{trav.deboardingPoint || "—"}</td>
                          {tableData.trainColumns.map((col) => (
                            <td key={col} className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base bg-gray-50">{trav.trainSeats?.[col] ?? "—"}</td>
                          ))}
                          {tableData.flightColumns.map((col) => (
                            <td key={col} className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base bg-gray-50">{trav.flightSeats?.[col] ?? "—"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View - VIEW ONLY */}
                <div className="block sm:hidden space-y-4">
                  {tableData.travellers.map((trav, idx) => (
                    <div key={trav.id} className="bg-white border rounded-lg p-4 shadow-sm">
                      <div className="grid grid-cols-1 gap-3 text-xs sm:text-sm">
                        <div><span className="font-semibold">SL NO: </span>{String(idx + 1).padStart(2, "0")}.</div>
                        <div><span className="font-semibold">Name: </span>{trav.name}</div>
                        <div><span className="font-semibold">Age: </span>{trav.age || "—"}</div>
                        <div><span className="font-semibold">Gender: </span>{getDisplayGender(trav.age, trav.gender, trav.sharingType) || "—"}</div>
                        <div><span className="font-semibold">Mobile: </span>{trav.mobile || "—"}</div>
                        <div><span className="font-semibold">Boarding: </span>{trav.boardingPoint || "—"}</div>
                        <div><span className="font-semibold">Deboarding: </span>{trav.deboardingPoint || "—"}</div>
                        {tableData.trainColumns.map((col) => (
                          <div key={col} className="bg-gray-50 p-2 rounded">
                            <span className="font-semibold block mb-1">{col}:</span>
                            <span className="text-sm font-medium">{trav.trainSeats?.[col] ?? "—"}</span>
                          </div>
                        ))}
                        {tableData.flightColumns.map((col) => (
                          <div key={col} className="bg-blue-50 p-2 rounded">
                            <span className="font-semibold block mb-1">{col}:</span>
                            <span className="text-sm font-medium">{trav.flightSeats?.[col] ?? "—"}</span>
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
          <p className="text-center text-gray-500 text-xs sm:text-sm lg:text-base py-10">Please select a tour to view the traveller list.</p>
        )}
      </div>

      {showBackConfirm && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Unsaved Filters / Selection
      </h2>
      <p className="text-gray-600 mb-6">
        You have selected a tour or applied filters.<br />
        Going back will reset them.<br />
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

export default AdminNamelist;


