/* eslint-disable no-unused-vars */
// import React, {
//   useState,
//   useContext,
//   useEffect,
//   useCallback,
//   useMemo,
// } from "react";
// import { useLocation } from "react-router-dom";
// import { TourContext } from "../../context/TourContext";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const TourNameList = () => {
//   const {
//     bookings,
//     getBookings,
//     updateTravellerDetails,
//     tourList,
//     getTourList,
//   } = useContext(TourContext);

//   const [initialized, setInitialized] = useState(false);
//   const [tableData, setTableData] = useState({
//     trainColumns: [],
//     flightColumns: [],
//     travellers: [],
//   });
//   const [selectedTourId, setSelectedTourId] = useState("");
//   const [isLoadingBookings, setIsLoadingBookings] = useState(false);
//   const [nameFilter, setNameFilter] = useState("");
//   const [phoneFilter, setPhoneFilter] = useState("");
//   const [boardingPointFilter, setBoardingPointFilter] = useState("");
//   const [deboardingPointFilter, setDeboardingPointFilter] = useState("");
//   const [showConfirmLeave, setShowConfirmLeave] = useState(false);
//   // Protection condition → tour select பண்ணி traveller data visible ஆனால்
//   const shouldProtect = Boolean(
//     selectedTourId && !isLoadingBookings && tableData.travellers.length > 0,
//   );
//   const location = useLocation();

//   // 1. Browser reload / close tab / navigate away
//   useEffect(() => {
//     if (!shouldProtect) return;

//     const handleBeforeUnload = (e) => {
//       e.preventDefault();
//       e.returnValue = ""; // Browser default "Leave site?" dialog
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);

//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//     };
//   }, [shouldProtect]);

//   // 2. Back button / mobile swipe back protection
//   useEffect(() => {
//     if (!shouldProtect) return;

//     // Dummy history entry → back அடிச்சா popstate வரும்
//     window.history.pushState(null, null, window.location.href);

//     const handlePopState = () => {
//       setShowConfirmLeave(true);
//     };

//     window.addEventListener("popstate", handlePopState);

//     return () => {
//       window.removeEventListener("popstate", handlePopState);
//     };
//   }, [shouldProtect]);

//   // Confirm & Cancel handlers
//   const handleConfirmLeave = () => {
//     setShowConfirmLeave(false);
//     window.history.back();
//   };

//   const handleCancelLeave = () => {
//     setShowConfirmLeave(false);
//     // Trap-ஐ மறுபடியும் set பண்ணி வைக்கிறோம்
//     window.history.pushState(null, null, window.location.href);
//   };

//   // Fetch the list of all tours for the dropdown
//   useEffect(() => {
//     getTourList();
//   }, [getTourList]);

//   // Fetch bookings for the selected tour
//   useEffect(() => {
//     if (selectedTourId) {
//       setIsLoadingBookings(true);
//       getBookings(selectedTourId)
//         .then((response) => {
//           if (
//             response &&
//             typeof response === "object" &&
//             "success" in response
//           ) {
//             if (response.success) {
//               toast.success("Bookings fetched successfully", {
//                 toastId: "bookings-fetch-success",
//               });
//             } else {
//               toast.error(response.message || "Failed to fetch bookings", {
//                 toastId: "bookings-fetch-error",
//               });
//             }
//           } else {
//             toast.error("Invalid response from server", {
//               toastId: "server-error",
//             });
//           }
//         })
//         .catch((error) => {
//           console.error("getBookings error:", error);
//           toast.error(
//             error.response?.data?.message ||
//               error.message ||
//               "Failed to fetch bookings",
//             { toastId: "bookings-fetch-error" },
//           );
//         })
//         .finally(() => {
//           setIsLoadingBookings(false);
//         });
//     } else {
//       setIsLoadingBookings(false);
//     }
//   }, [selectedTourId, getBookings]);

//   // Clear toasts on component unmount or route change
//   useEffect(() => {
//     return () => {
//       console.log("Dismissing toasts from TourNameList");
//       toast.dismiss();
//     };
//   }, [location]);

//   const handleApiResponse = useCallback(
//     (response, successMessage, skipRefresh = false) => {
//       console.log("API Response:", response);
//       if (response && typeof response === "object" && "success" in response) {
//         if (response.success) {
//           const toastId =
//             typeof successMessage === "string"
//               ? successMessage.toLowerCase().replace(/\s/g, "-")
//               : `operation-success-${Date.now()}`;
//           toast.success(successMessage || "Operation completed successfully", {
//             toastId,
//           });
//           if (selectedTourId && !skipRefresh) {
//             getBookings(selectedTourId);
//           }
//         } else {
//           toast.error(
//             response.message || "An error occurred during the operation",
//             { toastId: "api-error" },
//           );
//         }
//       } else {
//         toast.error("Invalid response from server", {
//           toastId: "server-error",
//         });
//       }
//     },
//     [selectedTourId, getBookings],
//   );

//   // Filter travellers based on name, phone number, boarding point, and deboarding point
//   const filteredTravellers = useMemo(() => {
//     return tableData.travellers.filter((traveller) => {
//       const matchesName = nameFilter
//         ? traveller.name.toLowerCase().includes(nameFilter.toLowerCase())
//         : true;
//       const matchesPhone = phoneFilter
//         ? traveller.mobile && traveller.mobile.includes(phoneFilter)
//         : true;
//       const matchesBoardingPoint = boardingPointFilter
//         ? traveller.boardingPoint &&
//           traveller.boardingPoint
//             .toLowerCase()
//             .includes(boardingPointFilter.toLowerCase())
//         : true;
//       const matchesDeboardingPoint = deboardingPointFilter
//         ? traveller.deboardingPoint &&
//           traveller.deboardingPoint
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
//   }, [
//     tableData.travellers,
//     nameFilter,
//     phoneFilter,
//     boardingPointFilter,
//     deboardingPointFilter,
//   ]);

//   // Re-initialize the table when bookings change
//   useEffect(() => {
//     if (bookings.length > 0 && selectedTourId) {
//       const trainSet = new Set();
//       const flightSet = new Set();
//       const travellersList = [];

//       bookings.forEach((booking) => {
//         if (!booking.payment?.advance?.paymentVerified) {
//           return;
//         }

//         booking.travellers.forEach((trav) => {
//           if (trav.cancelled?.byTraveller || trav.cancelled?.byAdmin) {
//             return;
//           }

//           if (Array.isArray(trav.trainSeats)) {
//             trav.trainSeats.forEach((s) => {
//               if (s?.trainName) trainSet.add(s.trainName);
//             });
//           } else if (trav.trainSeats && typeof trav.trainSeats === "object") {
//             Object.keys(trav.trainSeats).forEach((k) => trainSet.add(k));
//           }

//           if (Array.isArray(trav.flightSeats)) {
//             trav.flightSeats.forEach((s) => {
//               if (s?.flightName) flightSet.add(s.flightName);
//             });
//           } else if (trav.flightSeats && typeof trav.flightSeats === "object") {
//             Object.keys(trav.flightSeats).forEach((k) => flightSet.add(k));
//           }

//           const trainSeatsMap = {};
//           const flightSeatsMap = {};

//           const trainColumns =
//             trainSet.size > 0 ? Array.from(trainSet) : ["Train 1"];
//           const flightColumns =
//             flightSet.size > 0 ? Array.from(flightSet) : ["Flight 1"];

//           trainColumns.forEach((tn) => (trainSeatsMap[tn] = ""));
//           flightColumns.forEach((fn) => (flightSeatsMap[fn] = ""));
//           if (Array.isArray(trav.trainSeats)) {
//             trav.trainSeats.forEach((s) => {
//               if (s?.trainName) trainSeatsMap[s.trainName] = s.seatNo ?? "";
//             });
//           } else if (trav.trainSeats && typeof trav.trainSeats === "object") {
//             Object.entries(trav.trainSeats).forEach(([k, v]) => {
//               trainSeatsMap[k] = v ?? "";
//             });
//           }

//           if (Array.isArray(trav.flightSeats)) {
//             trav.flightSeats.forEach((s) => {
//               if (s?.flightName) flightSeatsMap[s.flightName] = s.seatNo ?? "";
//             });
//           } else if (trav.flightSeats && typeof trav.flightSeats === "object") {
//             Object.entries(trav.flightSeats).forEach(([k, v]) => {
//               flightSeatsMap[k] = v ?? "";
//             });
//           }

//           travellersList.push({
//             tnr: booking.tnr || "—",
//             id: trav._id,
//             name: `${trav.firstName || ""} ${trav.lastName || ""}`.trim(),
//             age: trav.age ?? "",
//             gender: trav.gender || "",
//             sharingType: trav.sharingType || "",
//             mobile: booking.contact?.mobile ?? trav.phone ?? "",
//             boardingPoint: trav.boardingPoint?.stationName || "",
//             deboardingPoint: trav.deboardingPoint?.stationName || "",
//             trainSeats: trainSeatsMap,
//             flightSeats: flightSeatsMap,
//           });
//         });
//       });

//       setTableData({
//         trainColumns: trainSet.size > 0 ? Array.from(trainSet) : ["Train 1"],
//         flightColumns:
//           flightSet.size > 0 ? Array.from(flightSet) : ["Flight 1"],
//         travellers: travellersList,
//       });
//       setInitialized(true);
//     } else if (selectedTourId) {
//       setTableData({
//         trainColumns: ["Train 1"],
//         flightColumns: ["Flight 1"],
//         travellers: [],
//       });
//       setInitialized(false);
//     } else {
//       setTableData({
//         trainColumns: ["Train 1"],
//         flightColumns: ["Flight 1"],
//         travellers: [],
//       });
//       setInitialized(false);
//     }
//     console.log("Table data:", tableData);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [bookings, selectedTourId]);

//   const cloneState = (s) => JSON.parse(JSON.stringify(s));

//   // Compute display gender based on age, gender, and sharingType
//   const getDisplayGender = (age, gender, sharingType) => {
//     const parsedAge = parseInt(age, 10);
//     if (isNaN(parsedAge) || parsedAge < 6) return "";
//     const genderAbbrev =
//       gender.toLowerCase() === "male"
//         ? "M"
//         : gender.toLowerCase() === "female"
//           ? "F"
//           : "";
//     if (parsedAge >= 6 && parsedAge <= 10) {
//       if (["withBerth", "double", "triple"].includes(sharingType)) {
//         return genderAbbrev ? `CWB(${genderAbbrev})` : "CWB";
//       }
//       if (sharingType === "withoutBerth") {
//         return genderAbbrev ? `CNB(${genderAbbrev})` : "CNB";
//       }
//       return "";
//     }
//     return genderAbbrev;
//   };

//   // // Export to PDF
//   const exportToPDF = () => {
//     const doc = new jsPDF("landscape", "pt", "a4");

//     // IMPORTANT: tourList-ல இருந்து மட்டும் title எடு (main tour - JAN 26)
//     const tourFromList = tourList.find((tour) => tour._id === selectedTourId);
//     const rawTitle = tourFromList?.title || "Tour Traveller List";

//     // Optional: Console-ல check பண்ணி confirm பண்ணுங்க (பிறகு remove பண்ணலாம்)
//     console.log("Selected Tour ID:", selectedTourId);
//     console.log("Raw Title (from tourList):", rawTitle);
//     // இது "GRAND GUJARAT YATRA JAN 26" ஆக print ஆகணும்

//     const displayTitle = rawTitle.trim(); // database-ல இருக்குறது அப்படியே

//     // PDF title
//     doc.setFontSize(18);
//     doc.text(displayTitle, doc.internal.pageSize.getWidth() / 2, 50, {
//       align: "center",
//     });

//     // Table headers & body (same)
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

//     const body = filteredTravellers.map((trav, idx) => [
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

//     // Filename - database raw title அப்படியே
//     const safeFileName = displayTitle
//       .replace(/[^a-zA-Z0-9\s-]/g, "")
//       .replace(/\s+/g, "_")
//       .trim();

//     doc.save(`${safeFileName}_Traveller_List.pdf`);
//     // Result: GRAND_GUJARAT_YATRA_JAN_26_Traveller_List.pdf

//     toast.success(
//       <div className="flex items-center gap-2">
//         <span>✅</span>
//         <span>PDF exported successfully</span>
//       </div>,
//       { toastId: "pdf-export-success" },
//     );
//   };

//   // Add train/flight column
//   const handleAddGlobalColumn = (type) => {
//     const maxColumns = 15;
//     setTableData((prev) => {
//       if (prev.trainColumns.length + prev.flightColumns.length >= maxColumns) {
//         toast.error(
//           <div className="flex items-center gap-2">
//             <span>❌</span>
//             <span>Cannot add more than {maxColumns} columns</span>
//           </div>,
//           { toastId: "max-columns-error" },
//         );
//         console.log("Toast displayed: max-columns-error");
//         return prev;
//       }
//       const updated = cloneState(prev);
//       if (type === "train") {
//         let newName = `Train ${updated.trainColumns.length + 1}`;
//         updated.trainColumns.push(newName);
//         updated.travellers.forEach((t) => (t.trainSeats[newName] = ""));
//         toast.success(
//           <div className="flex items-center gap-2">
//             <span>✅</span>
//             <span>Train column "{newName}" added</span>
//           </div>,
//           { toastId: `add-train-${newName}` },
//         );
//         console.log("Toast displayed: add-train-", newName);
//       } else {
//         let newName = `Flight ${updated.flightColumns.length + 1}`;
//         updated.flightColumns.push(newName);
//         updated.travellers.forEach((t) => (t.flightSeats[newName] = ""));
//         toast.success(
//           <div className="flex items-center gap-2">
//             <span>✅</span>
//             <span>Flight column "{newName}" added</span>
//           </div>,
//           { toastId: `add-flight-${newName}` },
//         );
//         console.log("Toast displayed: add-flight-", newName);
//       }
//       console.log("Table data after add:", updated);
//       return updated;
//     });
//   };

//   // Rename column
//   const handleColumnNameChangeGlobal = (type, index, newName) => {
//     setTableData((prev) => {
//       const updated = cloneState(prev);
//       if (type === "train") {
//         const oldName = updated.trainColumns[index];
//         if (oldName === newName) return prev;
//         updated.trainColumns[index] = newName;
//         updated.travellers.forEach((t) => {
//           t.trainSeats[newName] = t.trainSeats[oldName] ?? "";
//           delete t.trainSeats[oldName];
//         });
//         toast.success(
//           <div className="flex items-center gap-2">
//             <span>✅</span>
//             <span>Train column renamed to "{newName}"</span>
//           </div>,
//           { toastId: `rename-train-${index}` },
//         );
//         console.log("Toast displayed: rename-train-", index);
//       } else {
//         const oldName = updated.flightColumns[index];
//         if (oldName === newName) return prev;
//         updated.flightColumns[index] = newName;
//         updated.travellers.forEach((t) => {
//           t.flightSeats[newName] = t.flightSeats[oldName] ?? "";
//           delete t.flightSeats[oldName];
//         });
//         toast.success(
//           <div className="flex items-center gap-2">
//             <span>✅</span>
//             <span>Flight column renamed to "{newName}"</span>
//           </div>,
//           { toastId: `rename-flight-${index}` },
//         );
//         console.log("Toast displayed: rename-flight-", index);
//       }
//       console.log("Table data after rename:", updated);
//       return updated;
//     });
//   };

//   // Remove column
//   const handleRemoveGlobalColumn = async (type, index) => {
//     let removed;
//     setTableData((prev) => {
//       const updated = cloneState(prev);
//       if (type === "train") {
//         if (updated.trainColumns.length <= 1) {
//           toast.error(
//             <div className="flex items-center gap-2">
//               <span>❌</span>
//               <span>At least one train column is required</span>
//             </div>,
//             { toastId: "remove-train-error" },
//           );
//           console.log("Toast displayed: remove-train-error");
//           return prev;
//         }
//         removed = updated.trainColumns.splice(index, 1)[0];
//         updated.travellers.forEach((t) => delete t.trainSeats[removed]);
//         toast.success(
//           <div className="flex items-center gap-2">
//             <span>✅</span>
//             <span>Train column "{removed}" removed</span>
//           </div>,
//           { toastId: `remove-train-${index}` },
//         );
//         console.log("Toast displayed: remove-train-", index);
//       } else {
//         if (updated.flightColumns.length <= 1) {
//           toast.error(
//             <div className="flex items-center gap-2">
//               <span>❌</span>
//               <span>At least one flight column is required</span>
//             </div>,
//             { toastId: "remove-flight-error" },
//           );
//           console.log("Toast displayed: remove-flight-error");
//           return prev;
//         }
//         removed = updated.flightColumns.splice(index, 1)[0];
//         updated.travellers.forEach((t) => delete t.flightSeats[removed]);
//         toast.success(
//           <div className="flex items-center gap-2">
//             <span>✅</span>
//             <span>Flight column "{removed}" removed</span>
//           </div>,
//           { toastId: `remove-flight-${index}` },
//         );
//         console.log("Toast displayed: remove-flight-", index);
//       }
//       console.log("Table data after remove:", updated);
//       return updated;
//     });

//     if (!removed) return;

//     const promises = tableData.travellers.map((traveller) => {
//       const trainSeatsArr = Object.entries(traveller.trainSeats).map(
//         ([trainName, seatNo]) => ({ trainName, seatNo }),
//       );
//       const flightSeatsArr = Object.entries(traveller.flightSeats).map(
//         ([flightName, seatNo]) => ({ flightName, seatNo }),
//       );

//       const payload = {
//         trainSeats: trainSeatsArr,
//         flightSeats: flightSeatsArr,
//       };

//       const booking = bookings.find((b) =>
//         b.travellers.some((t) => t._id === traveller.id),
//       );
//       if (!booking) return null;

//       return updateTravellerDetails(booking._id, traveller.id, payload);
//     });

//     const responses = await Promise.all(promises);
//     responses.forEach((response, idx) => {
//       if (response) {
//         handleApiResponse(
//           response,
//           `Traveller ${tableData.travellers[idx].name} details updated`,
//           true,
//         );
//       }
//     });
//   };

//   // Traveller edits
//   const handleSeatChange = (travellerId, type, column, value) => {
//     setTableData((prev) => {
//       const updated = cloneState(prev);
//       const traveller = updated.travellers.find((t) => t.id === travellerId);
//       if (!traveller) return prev;
//       if (type === "train") traveller.trainSeats[column] = value;
//       else traveller.flightSeats[column] = value;
//       console.log("Table data after seat change:", updated);
//       return updated;
//     });
//   };

//   // Save one traveller
//   const handleSaveSingleTraveller = async (traveller) => {
//     if (!selectedTourId) {
//       toast.error(
//         <div className="flex items-center gap-2">
//           <span>❌</span>
//           <span>Please select a tour first.</span>
//         </div>,
//         { toastId: "no-tour-error" },
//       );
//       console.log("Toast displayed: no-tour-error");
//       return;
//     }

//     try {
//       const trainSeatsArr = Object.entries(traveller.trainSeats).map(
//         ([trainName, seatNo]) => ({ trainName, seatNo }),
//       );
//       const flightSeatsArr = Object.entries(traveller.flightSeats).map(
//         ([flightName, seatNo]) => ({ flightName, seatNo }),
//       );

//       const payload = {
//         trainSeats: trainSeatsArr,
//         flightSeats: flightSeatsArr,
//       };

//       const booking = bookings.find((b) =>
//         b.travellers.some((t) => t._id === traveller.id),
//       );
//       if (!booking) {
//         toast.error(
//           <div className="flex items-center gap-2">
//             <span>❌</span>
//             <span>Booking not found for this traveller.</span>
//           </div>,
//           { toastId: "no-booking-error" },
//         );
//         console.log("Toast displayed: no-booking-error");
//         return;
//       }

//       const response = await updateTravellerDetails(
//         booking._id,
//         traveller.id,
//         payload,
//       );
//       handleApiResponse(
//         response,
//         <div className="flex items-center gap-2">
//           <span>✅</span>
//           <span>Traveller {traveller.name} details updated</span>
//         </div>,
//         { toastId: `save-traveller-${traveller.id}` },
//       );
//     } catch (error) {
//       console.error("handleSaveSingleTraveller error:", error);
//       toast.error(
//         <div className="flex items-center gap-2">
//           <span>❌</span>
//           <span>Failed to save traveller details: {error.message}</span>
//         </div>,
//         { toastId: `save-traveller-error-${traveller.id}` },
//       );
//       console.log("Toast displayed: save-traveller-error-", traveller.id);
//     }
//   };

//   // Save all travellers
//   const handleSaveAllTravellers = async () => {
//     if (!selectedTourId) {
//       toast.error(
//         <div className="flex items-center gap-2">
//           <span>❌</span>
//           <span>Please select a tour first.</span>
//         </div>,
//         { toastId: "no-tour-error" },
//       );
//       console.log("Toast displayed: no-tour-error");
//       return;
//     }

//     try {
//       const promises = tableData.travellers.map((traveller) => {
//         const trainSeatsArr = Object.entries(traveller.trainSeats).map(
//           ([trainName, seatNo]) => ({ trainName, seatNo }),
//         );
//         const flightSeatsArr = Object.entries(traveller.flightSeats).map(
//           ([flightName, seatNo]) => ({ flightName, seatNo }),
//         );

//         const payload = {
//           trainSeats: trainSeatsArr,
//           flightSeats: flightSeatsArr,
//         };

//         const booking = bookings.find((b) =>
//           b.travellers.some((t) => t._id === traveller.id),
//         );
//         if (!booking) return null;

//         return updateTravellerDetails(booking._id, traveller.id, payload);
//       });

//       const responses = await Promise.all(promises);
//       let allSuccessful = true;
//       responses.forEach((response, idx) => {
//         if (response) {
//           handleApiResponse(
//             response,
//             <div className="flex items-center gap-2">
//               <span>✅</span>
//               <span>
//                 Traveller {tableData.travellers[idx].name} details updated
//               </span>
//             </div>,
//             { toastId: `update-traveller-${idx}` },
//           );
//           if (!response.success) allSuccessful = false;
//         }
//       });

//       if (allSuccessful) {
//         toast.success(
//           <div className="flex items-center gap-2">
//             <span>✅</span>
//             <span>All traveller details saved successfully!</span>
//           </div>,
//           { toastId: "save-all-success" },
//         );
//         console.log("Toast displayed: save-all-success");
//       }
//     } catch (error) {
//       console.error("handleSaveAllTravellers error:", error);
//       toast.error(
//         <div className="flex items-center gap-2">
//           <span>❌</span>
//           <span>Failed to save all traveller details: {error.message}</span>
//         </div>,
//         { toastId: "save-all-error" },
//       );
//       console.log("Toast displayed: save-all-error");
//     }
//   };

//   // Dynamic column width based on number of columns
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
//       {/* Compact ToastContainer */}
//       {/* Replace your current ToastContainer with this */}
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
//           Name List
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
//             value={selectedTourId}
//             onChange={(e) => setSelectedTourId(e.target.value)}
//             className="mt-1 block w-full pl-3 pr-10 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md disabled:bg-gray-100 touch-manipulation"
//             disabled={isLoadingBookings}
//             aria-label="Select a tour"
//           >
//             <option value="">-- Select a Tour --</option>
//             {tourList.map((tour) => (
//               <option key={tour._id} value={tour._id}>
//                 {tour.title}
//               </option>
//             ))}
//           </select>
//         </div>
//         {selectedTourId && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
//             <div className="flex-1">
//               <label
//                 htmlFor="name-filter"
//                 className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
//               >
//                 Filter by Name:
//               </label>
//               <input
//                 id="name-filter"
//                 type="text"
//                 value={nameFilter}
//                 onChange={(e) => setNameFilter(e.target.value)}
//                 placeholder="Enter name to filter"
//                 className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation"
//                 aria-label="Filter travellers by name"
//               />
//             </div>
//             <div className="flex-1">
//               <label
//                 htmlFor="phone-filter"
//                 className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
//               >
//                 Filter by Phone:
//               </label>
//               <input
//                 id="phone-filter"
//                 type="text"
//                 value={phoneFilter}
//                 onChange={(e) => setPhoneFilter(e.target.value)}
//                 placeholder="Enter phone to filter"
//                 className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation"
//                 aria-label="Filter travellers by phone number"
//               />
//             </div>
//             <div className="flex-1">
//               <label
//                 htmlFor="boarding-point-filter"
//                 className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
//               >
//                 Filter by Boarding Point:
//               </label>
//               <input
//                 id="boarding-point-filter"
//                 type="text"
//                 value={boardingPointFilter}
//                 onChange={(e) => setBoardingPointFilter(e.target.value)}
//                 placeholder="Enter boarding point to filter"
//                 className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation"
//                 aria-label="Filter travellers by boarding point"
//               />
//             </div>
//             <div className="flex-1">
//               <label
//                 htmlFor="deboarding-point-filter"
//                 className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
//               >
//                 Filter by Deboarding Point:
//               </label>
//               <input
//                 id="deboarding-point-filter"
//                 type="text"
//                 value={deboardingPointFilter}
//                 onChange={(e) => setDeboardingPointFilter(e.target.value)}
//                 placeholder="Enter deboarding point to filter"
//                 className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation"
//                 aria-label="Filter travellers by deboarding point"
//               />
//             </div>
//           </div>
//         )}
//       </div>

//       {selectedTourId ? (
//         isLoadingBookings ? (
//           <div className="text-center text-gray-500 text-xs sm:text-sm lg:text-base">
//             <svg
//               className="animate-spin h-5 w-5 sm:h-6 sm:w-6 mx-auto text-indigo-500"
//               viewBox="0 0 24 24"
//             >
//               <circle
//                 cx="12"
//                 cy="12"
//                 r="10"
//                 stroke="currentColor"
//                 strokeWidth="4"
//                 fill="none"
//               />
//               <path
//                 fill="currentColor"
//                 d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//               />
//             </svg>
//             Loading...
//           </div>
//         ) : filteredTravellers.length === 0 ? (
//           <p className="text-center text-gray-500 text-xs sm:text-sm lg:text-base">
//             No active travellers with verified advance payment found for this
//             tour.
//           </p>
//         ) : (
//           <>
//             <div className="flex justify-end mb-4 sm:mb-6">
//               <button
//                 onClick={exportToPDF}
//                 className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs sm:text-sm lg:text-base min-w-[100px] sm:min-w-[120px] touch-manipulation"
//                 aria-label="Export traveller list to PDF"
//               >
//                 📄 Export to PDF
//               </button>
//             </div>

//             <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
//               <button
//                 onClick={() => handleAddGlobalColumn("train")}
//                 className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs sm:text-sm lg:text-base min-w-[100px] sm:min-w-[120px] touch-manipulation"
//                 aria-label="Add new train column"
//               >
//                 + Add Train
//               </button>
//               <button
//                 onClick={() => handleAddGlobalColumn("flight")}
//                 className="px-3 sm:px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 text-xs sm:text-sm lg:text-base min-w-[100px] sm:min-w-[120px] touch-manipulation"
//                 aria-label="Add new flight column"
//               >
//                 + Add Flight
//               </button>
//               <button
//                 onClick={handleSaveAllTravellers}
//                 className="px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-xs sm:text-sm lg:text-base min-w-[100px] sm:min-w-[120px] touch-manipulation"
//                 aria-label="Save all traveller details"
//               >
//                 💾 Save All
//               </button>
//             </div>

//             {/* Desktop Table View */}
//             <div className="hidden sm:block overflow-x-auto max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-3rem)] lg:max-w-[calc(100vw-4rem)] mx-auto">
//               <table className="w-full border-collapse">
//                 <thead>
//                   <tr className="bg-gray-100 sticky top-0 z-10">
//                     <th
//                       className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[50px]`}
//                     >
//                       SL NO
//                     </th>
//                     <th
//                       className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[90px]`}
//                     >
//                       TNR
//                     </th>
//                     <th
//                       className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[100px] sm:min-w-[120px]`}
//                     >
//                       NAME
//                     </th>
//                     <th
//                       className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[50px]`}
//                     >
//                       AGE
//                     </th>
//                     <th
//                       className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[60px]`}
//                     >
//                       GENDER
//                     </th>
//                     <th
//                       className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[80px]`}
//                     >
//                       MOBILE
//                     </th>
//                     <th
//                       className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold ${columnWidthClass}`}
//                     >
//                       BOARDING POINT
//                     </th>
//                     <th
//                       className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold ${columnWidthClass}`}
//                     >
//                       DEBOARDING POINT
//                     </th>
//                     {tableData.trainColumns.map((col, i) => (
//                       <th
//                         key={i}
//                         className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold ${columnWidthClass}`}
//                       >
//                         <div className="flex items-center justify-center gap-1 sm:gap-2">
//                           <input
//                             type="text"
//                             value={col}
//                             onChange={(e) =>
//                               handleColumnNameChangeGlobal(
//                                 "train",
//                                 i,
//                                 e.target.value,
//                               )
//                             }
//                             className="w-16 sm:w-20 lg:w-24 px-1 sm:px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm font-semibold text-center touch-manipulation"
//                             aria-label={`Train column ${i + 1} name`}
//                           />
//                           {tableData.trainColumns.length > 1 && (
//                             <button
//                               onClick={() =>
//                                 handleRemoveGlobalColumn("train", i)
//                               }
//                               className="p-1 sm:p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs touch-manipulation"
//                               aria-label={`Remove train column ${col}`}
//                             >
//                               ×
//                             </button>
//                           )}
//                         </div>
//                       </th>
//                     ))}
//                     {tableData.flightColumns.map((col, i) => (
//                       <th
//                         key={i}
//                         className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold ${columnWidthClass}`}
//                       >
//                         <div className="flex items-center justify-center gap-1 sm:gap-2">
//                           <input
//                             type="text"
//                             value={col}
//                             onChange={(e) =>
//                               handleColumnNameChangeGlobal(
//                                 "flight",
//                                 i,
//                                 e.target.value,
//                               )
//                             }
//                             className="w-16 sm:w-20 lg:w-24 px-1 sm:px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm font-semibold text-center touch-manipulation"
//                             aria-label={`Flight column ${i + 1} name`}
//                           />
//                           {tableData.flightColumns.length > 1 && (
//                             <button
//                               onClick={() =>
//                                 handleRemoveGlobalColumn("flight", i)
//                               }
//                               className="p-1 sm:p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs touch-manipulation"
//                               aria-label={`Remove flight column ${col}`}
//                             >
//                               ×
//                             </button>
//                           )}
//                         </div>
//                       </th>
//                     ))}
//                     <th
//                       className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[80px]`}
//                     >
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredTravellers.map((trav, idx) => (
//                     <tr key={trav.id}>
//                       <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base">
//                         {String(idx + 1).padStart(2, "0")}.
//                       </td>
//                       <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-mono">
//                         {trav.tnr}
//                       </td>
//                       <td
//                         className="p-2 sm:p-3 border border-gray-200 text-xs sm:text-sm lg:text-base truncate max-w-[100px] sm:max-w-[120px]"
//                         title={trav.name}
//                       >
//                         {trav.name}
//                       </td>
//                       <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base">
//                         {trav.age}
//                       </td>
//                       <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base">
//                         {getDisplayGender(
//                           trav.age,
//                           trav.gender,
//                           trav.sharingType,
//                         )}
//                       </td>
//                       <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base">
//                         {trav.mobile || "—"}
//                       </td>
//                       <td
//                         className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base truncate max-w-[80px] sm:max-w-[100px]"
//                         title={trav.boardingPoint}
//                       >
//                         {trav.boardingPoint || "—"}
//                       </td>
//                       <td
//                         className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base truncate max-w-[80px] sm:max-w-[100px]"
//                         title={trav.deboardingPoint}
//                       >
//                         {trav.deboardingPoint || "—"}
//                       </td>
//                       {tableData.trainColumns.map((col, i) => (
//                         <td
//                           key={i}
//                           className="p-2 sm:p-3 border border-gray-200 text-center"
//                         >
//                           <input
//                             type="text"
//                             value={trav.trainSeats[col] ?? ""}
//                             onChange={(e) =>
//                               handleSeatChange(
//                                 trav.id,
//                                 "train",
//                                 col,
//                                 e.target.value,
//                               )
//                             }
//                             className="w-14 sm:w-16 lg:w-20 px-1 sm:px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm text-center touch-manipulation"
//                             aria-label={`Train seat for ${col}`}
//                           />
//                         </td>
//                       ))}
//                       {tableData.flightColumns.map((col, i) => (
//                         <td
//                           key={i}
//                           className="p-2 sm:p-3 border border-gray-200 text-center"
//                         >
//                           <input
//                             type="text"
//                             value={trav.flightSeats[col] ?? ""}
//                             onChange={(e) =>
//                               handleSeatChange(
//                                 trav.id,
//                                 "flight",
//                                 col,
//                                 e.target.value,
//                               )
//                             }
//                             className="w-14 sm:w-16 lg:w-20 px-1 sm:px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm text-center touch-manipulation"
//                             aria-label={`Flight seat for ${col}`}
//                           />
//                         </td>
//                       ))}
//                       <td className="p-2 sm:p-3 border border-gray-200 text-center">
//                         <button
//                           onClick={() => handleSaveSingleTraveller(trav)}
//                           className="px-2 sm:px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs sm:text-sm min-w-[60px] sm:min-w-[80px] touch-manipulation"
//                           aria-label={`Save details for ${trav.name}`}
//                         >
//                           Save
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Mobile Card View */}
//             <div className="block sm:hidden space-y-4">
//               <div className="mb-4">
//                 {tableData.trainColumns.map((col, i) => (
//                   <div key={i} className="flex items-center gap-2 mb-2">
//                     <input
//                       type="text"
//                       value={col}
//                       onChange={(e) =>
//                         handleColumnNameChangeGlobal("train", i, e.target.value)
//                       }
//                       className="w-full px-2 py-2 border border-gray-300 rounded-md text-xs sm:text-sm touch-manipulation"
//                       aria-label={`Train column ${i + 1} name`}
//                     />
//                     {tableData.trainColumns.length > 1 && (
//                       <button
//                         onClick={() => handleRemoveGlobalColumn("train", i)}
//                         className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs touch-manipulation"
//                         aria-label={`Remove train column ${col}`}
//                       >
//                         ×
//                       </button>
//                     )}
//                   </div>
//                 ))}
//                 {tableData.flightColumns.map((col, i) => (
//                   <div key={i} className="flex items-center gap-2 mb-2">
//                     <input
//                       type="text"
//                       value={col}
//                       onChange={(e) =>
//                         handleColumnNameChangeGlobal(
//                           "flight",
//                           i,
//                           e.target.value,
//                         )
//                       }
//                       className="w-full px-2 py-2 border border-gray-300 rounded-md text-xs sm:text-sm touch-manipulation"
//                       aria-label={`Flight column ${i + 1} name`}
//                     />
//                     {tableData.flightColumns.length > 1 && (
//                       <button
//                         onClick={() => handleRemoveGlobalColumn("flight", i)}
//                         className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs touch-manipulation"
//                         aria-label={`Remove flight column ${col}`}
//                       >
//                         ×
//                       </button>
//                     )}
//                   </div>
//                 ))}
//               </div>
//               {filteredTravellers.map((trav, idx) => (
//                 <div
//                   key={trav.id}
//                   className="bg-white border rounded-lg p-3 shadow-sm"
//                 >
//                   <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
//                     <div>
//                       <span className="font-semibold">SL NO: </span>
//                       {String(idx + 1).padStart(2, "0")}.
//                     </div>
//                     <div>
//                       <span className="font-semibold">TNR: </span> {trav.tnr}
//                     </div>
//                     <div>
//                       <span className="font-semibold">Name: </span>
//                       {trav.name}
//                     </div>
//                     <div>
//                       <span className="font-semibold">Age: </span>
//                       {trav.age}
//                     </div>
//                     <div>
//                       <span className="font-semibold">Gender: </span>
//                       {getDisplayGender(
//                         trav.age,
//                         trav.gender,
//                         trav.sharingType,
//                       )}
//                     </div>
//                     <div>
//                       <span className="font-semibold">Mobile: </span>
//                       {trav.mobile || "—"}
//                     </div>
//                     <div>
//                       <span className="font-semibold">Boarding Point: </span>
//                       {trav.boardingPoint || "—"}
//                     </div>
//                     <div>
//                       <span className="font-semibold">Deboarding Point: </span>
//                       {trav.deboardingPoint || "—"}
//                     </div>
//                     {tableData.trainColumns.map((col, i) => (
//                       <div key={i}>
//                         <span className="font-semibold">{col}: </span>
//                         <input
//                           type="text"
//                           value={trav.trainSeats[col] ?? ""}
//                           onChange={(e) =>
//                             handleSeatChange(
//                               trav.id,
//                               "train",
//                               col,
//                               e.target.value,
//                             )
//                           }
//                           className="w-full px-2 py-2 border border-gray-300 rounded-md text-xs sm:text-sm touch-manipulation"
//                           aria-label={`Train seat for ${col}`}
//                         />
//                       </div>
//                     ))}
//                     {tableData.flightColumns.map((col, i) => (
//                       <div key={i}>
//                         <span className="font-semibold">{col}: </span>
//                         <input
//                           type="text"
//                           value={trav.flightSeats[col] ?? ""}
//                           onChange={(e) =>
//                             handleSeatChange(
//                               trav.id,
//                               "flight",
//                               col,
//                               e.target.value,
//                             )
//                           }
//                           className="w-full px-2 py-2 border border-gray-300 rounded-md text-xs sm:text-sm touch-manipulation"
//                           aria-label={`Flight seat for ${col}`}
//                         />
//                       </div>
//                     ))}
//                     <div className="text-center">
//                       <button
//                         onClick={() => handleSaveSingleTraveller(trav)}
//                         className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs sm:text-sm w-full touch-manipulation"
//                         aria-label={`Save details for ${trav.name}`}
//                       >
//                         Save
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </>
//         )
//       ) : (
//         <p className="text-center text-gray-500 text-xs sm:text-sm lg:text-base">
//           Please select a tour to view the traveller list.
//         </p>
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
//               You are currently viewing the traveller name list for{" "}
//               <strong>
//                 {tourList.find((t) => t._id === selectedTourId)?.title ||
//                   "this tour"}
//               </strong>
//               .<br />
//               Leaving will clear the current list and filters.
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

// export default TourNameList;


// /* eslint-disable no-unused-vars */
/* eslint-disable no-unused-vars */
import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useLocation } from "react-router-dom";
import { TourContext } from "../../context/TourContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TourNameList = () => {
  const {
    bookings,
    getBookings,
    updateTravellerDetails,
    tourList,
    getTourList,
  } = useContext(TourContext);

  const [initialized, setInitialized] = useState(false);
  const [tableData, setTableData] = useState({
    trainColumns: [],
    flightColumns: [],
    travellers: [],
  });
  const [selectedTourId, setSelectedTourId] = useState("");
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [boardingPointFilter, setBoardingPointFilter] = useState("");
  const [deboardingPointFilter, setDeboardingPointFilter] = useState("");
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  // Protection condition → tour select பண்ணி traveller data visible ஆனால்
  const shouldProtect = Boolean(
    selectedTourId && !isLoadingBookings && tableData.travellers.length > 0,
  );
  const location = useLocation();

  // 1. Browser reload / close tab / navigate away
  useEffect(() => {
    if (!shouldProtect) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ""; // Browser default "Leave site?" dialog
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shouldProtect]);

  // 2. Back button / mobile swipe back protection
  useEffect(() => {
    if (!shouldProtect) return;

    // Dummy history entry → back அடிச்சா popstate வரும்
    window.history.pushState(null, null, window.location.href);

    const handlePopState = () => {
      setShowConfirmLeave(true);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [shouldProtect]);

  // Confirm & Cancel handlers
  const handleConfirmLeave = () => {
    setShowConfirmLeave(false);
    window.history.back();
  };

  const handleCancelLeave = () => {
    setShowConfirmLeave(false);
    // Trap-ஐ மறுபடியும் set பண்ணி வைக்கிறோம்
    window.history.pushState(null, null, window.location.href);
  };

  // Fetch the list of all tours for the dropdown
  useEffect(() => {
    getTourList();
  }, [getTourList]);

  // Fetch bookings for the selected tour
  useEffect(() => {
    if (selectedTourId) {
      setIsLoadingBookings(true);
      getBookings(selectedTourId)
        .then((response) => {
          if (
            response &&
            typeof response === "object" &&
            "success" in response
          ) {
            if (response.success) {
              toast.success("Bookings fetched successfully", {
                toastId: "bookings-fetch-success",
              });
            } else {
              toast.error(response.message || "Failed to fetch bookings", {
                toastId: "bookings-fetch-error",
              });
            }
          } else {
            toast.error("Invalid response from server", {
              toastId: "server-error",
            });
          }
        })
        .catch((error) => {
          console.error("getBookings error:", error);
          toast.error(
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch bookings",
            { toastId: "bookings-fetch-error" },
          );
        })
        .finally(() => {
          setIsLoadingBookings(false);
        });
    } else {
      setIsLoadingBookings(false);
    }
  }, [selectedTourId, getBookings]);

  // Clear toasts on component unmount or route change
  useEffect(() => {
    return () => {
      console.log("Dismissing toasts from TourNameList");
      toast.dismiss();
    };
  }, [location]);

  const handleApiResponse = useCallback(
    (response, successMessage, skipRefresh = false) => {
      console.log("API Response:", response);
      if (response && typeof response === "object" && "success" in response) {
        if (response.success) {
          const toastId =
            typeof successMessage === "string"
              ? successMessage.toLowerCase().replace(/\s/g, "-")
              : `operation-success-${Date.now()}`;
          toast.success(successMessage || "Operation completed successfully", {
            toastId,
          });
          if (selectedTourId && !skipRefresh) {
            getBookings(selectedTourId);
          }
        } else {
          toast.error(
            response.message || "An error occurred during the operation",
            { toastId: "api-error" },
          );
        }
      } else {
        toast.error("Invalid response from server", {
          toastId: "server-error",
        });
      }
    },
    [selectedTourId, getBookings],
  );

  // Filter travellers based on name, phone number, boarding point, and deboarding point
  const filteredTravellers = useMemo(() => {
    return tableData.travellers.filter((traveller) => {
      const matchesName = nameFilter
        ? traveller.name.toLowerCase().includes(nameFilter.toLowerCase())
        : true;
      const matchesPhone = phoneFilter
        ? traveller.mobile && traveller.mobile.includes(phoneFilter)
        : true;
      const matchesBoardingPoint = boardingPointFilter
        ? traveller.boardingPoint &&
        traveller.boardingPoint
          .toLowerCase()
          .includes(boardingPointFilter.toLowerCase())
        : true;
      const matchesDeboardingPoint = deboardingPointFilter
        ? traveller.deboardingPoint &&
        traveller.deboardingPoint
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
  }, [
    tableData.travellers,
    nameFilter,
    phoneFilter,
    boardingPointFilter,
    deboardingPointFilter,
  ]);

  // Extracts { coach, seatNo, isOwnBooking } from a manually typed seat value.
  // Handles "A1-23", "A1/23", "A1 23", or with an "OB" (Own Booking) prefix
  // like "OB-A1-23" — OB is detected and skipped, A1 is used as the coach,
  // and 23 is captured as the seat number.
  const extractCoachInfo = (seatValue) => {
    if (!seatValue) return null;
    const str = String(seatValue).trim();
    if (!str) return null;
    const parts = str.split(/[-/\s]+/).filter(Boolean);
    if (parts.length === 0) return null;

    const skipPrefixes = ["OB"]; // add more here later if needed, e.g. "OB", "GV"

    let idx = 0;
    let isOwnBooking = false;
    if (skipPrefixes.includes(parts[0].toUpperCase()) && parts.length > 1) {
      isOwnBooking = true;
      idx = 1;
    }

    const coach = parts[idx].toUpperCase();
    const seatNo = parts[idx + 1] || ""; // seat number that follows the coach

    return { coach, seatNo, isOwnBooking };
  };

  // Train-wise, then coach-wise traveller count.
  // trainWiseCoachCount[trainName][coach] = { total, ob, seats: [{ seatNo, isOwnBooking }, ...] }
  // Grouping by train FIRST (instead of combining every train's seats
  // together) is what keeps the totals correct when a tour has more than
  // one train — otherwise the same coach code in different trains (or a
  // traveller with seats filled in more than one train column) gets merged
  // into one wrong combined count.
  const trainWiseCoachCount = useMemo(() => {
    const result = {};
    filteredTravellers.forEach((trav) => {
      Object.entries(trav.trainSeats || {}).forEach(([trainName, seatVal]) => {
        const info = extractCoachInfo(seatVal);
        if (!info) return;
        const { coach, seatNo, isOwnBooking } = info;
        if (!result[trainName]) result[trainName] = {};
        if (!result[trainName][coach]) {
          result[trainName][coach] = { total: 0, ob: 0, seats: [] };
        }
        result[trainName][coach].total += 1;
        if (isOwnBooking) result[trainName][coach].ob += 1;
        if (seatNo) {
          result[trainName][coach].seats.push({ seatNo, isOwnBooking });
        }
      });
    });
    // Sort seat numbers numerically where possible (24, 45, 67 ...),
    // falling back to string order for non-numeric seat labels.
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
  }, [filteredTravellers]);

  // Sorted entries used by both the on-screen tags and the PDF grid.
  // Shape: [ [trainName, [ [coach, {total, ob, seats}], ... ]], ... ]
  const sortedTrainEntries = useMemo(() => {
    // Train order follows the same order they appear in the name list
    // (tableData.trainColumns) rather than alphabetical sorting.
    const orderedTrainNames = tableData.trainColumns.filter(
      (tn) => trainWiseCoachCount[tn],
    );
    Object.keys(trainWiseCoachCount).forEach((tn) => {
      if (!orderedTrainNames.includes(tn)) orderedTrainNames.push(tn);
    });
    return orderedTrainNames.map((trainName) => [
      trainName,
      // Coach order follows first-appearance order in the traveller list
      // (object key insertion order) instead of alphabetical sorting.
      Object.entries(trainWiseCoachCount[trainName]),
    ]);
  }, [trainWiseCoachCount, tableData.trainColumns]);
  // NOTE: per-train assigned counts are computed inline where each train's
  // section is rendered — a single combined total across all trains would
  // double count travellers who have seats filled in more than one train.

  // Re-initialize the table when bookings change
  useEffect(() => {
    if (bookings.length > 0 && selectedTourId) {
      const trainSet = new Set();
      const flightSet = new Set();
      const travellersList = [];

      bookings.forEach((booking) => {
        if (!booking.payment?.advance?.paymentVerified) {
          return;
        }

        booking.travellers.forEach((trav) => {
          if (trav.cancelled?.byTraveller || trav.cancelled?.byAdmin) {
            return;
          }

          if (Array.isArray(trav.trainSeats)) {
            trav.trainSeats.forEach((s) => {
              if (s?.trainName) trainSet.add(s.trainName);
            });
          } else if (trav.trainSeats && typeof trav.trainSeats === "object") {
            Object.keys(trav.trainSeats).forEach((k) => trainSet.add(k));
          }

          if (Array.isArray(trav.flightSeats)) {
            trav.flightSeats.forEach((s) => {
              if (s?.flightName) flightSet.add(s.flightName);
            });
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
            trav.trainSeats.forEach((s) => {
              if (s?.trainName) trainSeatsMap[s.trainName] = s.seatNo ?? "";
            });
          } else if (trav.trainSeats && typeof trav.trainSeats === "object") {
            Object.entries(trav.trainSeats).forEach(([k, v]) => {
              trainSeatsMap[k] = v ?? "";
            });
          }

          if (Array.isArray(trav.flightSeats)) {
            trav.flightSeats.forEach((s) => {
              if (s?.flightName) flightSeatsMap[s.flightName] = s.seatNo ?? "";
            });
          } else if (trav.flightSeats && typeof trav.flightSeats === "object") {
            Object.entries(trav.flightSeats).forEach(([k, v]) => {
              flightSeatsMap[k] = v ?? "";
            });
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

      setTableData({
        trainColumns: trainSet.size > 0 ? Array.from(trainSet) : ["Train 1"],
        flightColumns:
          flightSet.size > 0 ? Array.from(flightSet) : ["Flight 1"],
        travellers: travellersList,
      });
      setInitialized(true);
    } else if (selectedTourId) {
      setTableData({
        trainColumns: ["Train 1"],
        flightColumns: ["Flight 1"],
        travellers: [],
      });
      setInitialized(false);
    } else {
      setTableData({
        trainColumns: ["Train 1"],
        flightColumns: ["Flight 1"],
        travellers: [],
      });
      setInitialized(false);
    }
    console.log("Table data:", tableData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, selectedTourId]);

  const cloneState = (s) => JSON.parse(JSON.stringify(s));

  // Compute display gender based on age, gender, and sharingType
  const getDisplayGender = (age, gender, sharingType) => {
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 6) return "";
    const genderAbbrev =
      gender.toLowerCase() === "male"
        ? "M"
        : gender.toLowerCase() === "female"
          ? "F"
          : "";
    if (parsedAge >= 6 && parsedAge <= 10) {
      if (["withBerth", "double", "triple"].includes(sharingType)) {
        return genderAbbrev ? `CWB(${genderAbbrev})` : "CWB";
      }
      if (sharingType === "withoutBerth") {
        return genderAbbrev ? `CNB(${genderAbbrev})` : "CNB";
      }
      return "";
    }
    return genderAbbrev;
  };

  // // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF("landscape", "pt", "a4");

    // IMPORTANT: tourList-ல இருந்து மட்டும் title எடு (main tour - JAN 26)
    const tourFromList = tourList.find((tour) => tour._id === selectedTourId);
    const rawTitle = tourFromList?.title || "Tour Traveller List";

    // Optional: Console-ல check பண்ணி confirm பண்ணுங்க (பிறகு remove பண்ணலாம்)
    console.log("Selected Tour ID:", selectedTourId);
    console.log("Raw Title (from tourList):", rawTitle);
    // இது "GRAND GUJARAT YATRA JAN 26" ஆக print ஆகணும்

    const displayTitle = rawTitle.trim(); // database-ல இருக்குறது அப்படியே

    // PDF title
    doc.setFontSize(18);
    doc.text(displayTitle, doc.internal.pageSize.getWidth() / 2, 50, {
      align: "center",
    });

    // Train-wise, Coach-wise Traveller Count — one small table per train,
    // stacked vertically. This keeps different trains' coach totals from
    // ever being combined together.
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
          `${trainName.toUpperCase()}   (Assigned: ${trainTotal} / ${filteredTravellers.length})`,
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
        const badgeWidth = 42;
        const padX = 10;
        let x = sideMargin;
        let rowTallest = chipHeight;

        coachEntries.forEach(([coach, { total, ob, seats }]) => {
          const seatsText = seats
            .map((s) => `${s.seatNo}${s.isOwnBooking ? "*" : ""}`)
            .join(", ");
          const totalLineText = `${total}${ob > 0 ? `  (${ob} OB)` : ""}`;

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
                doc.setTextColor(220, 38, 38); // red-600
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

    // Table headers & body (same)
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

    const body = filteredTravellers.map((trav, idx) => [
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

    // Split travellers into chunks of 10 per page. Column widths below are
    // fixed so text like "MGR CHENNAI CTL" never wraps to a 2nd line —
    // unwrapped rows is what keeps every row the same height, which is what
    // makes exactly 10 rows fit uniformly on every page. minCellHeight then
    // stretches those uniform rows to fill the full page height.
    const rowsPerPage = 10;
    const bodyChunks = [];
    for (let i = 0; i < body.length; i += rowsPerPage) {
      const slice = body.slice(i, i + rowsPerPage);
      if (slice.length > 0) bodyChunks.push(slice);
    }
    if (bodyChunks.length === 0) bodyChunks.push([]);

    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidthForNameList = doc.internal.pageSize.getWidth();
    const tableSideMargin = 30;
    const bottomMargin = 60; // extra buffer so 11 rows never sit exactly at the page edge
    const safetyBuffer = 10;
    const rowMinHeight =
      (pageHeight - 40 - bottomMargin - safetyBuffer) / (rowsPerPage + 1);

    // Fixed widths for the 8 known columns — sized so their typical content
    // (e.g. "MGR CHENNAI CTL", a 10-digit mobile number) fits on one line.
    const baseColWidths = [35, 65, 100, 32, 55, 80, 110, 110];
    const numDynamicCols =
      tableData.trainColumns.length + tableData.flightColumns.length;
    const usableWidth = pageWidthForNameList - tableSideMargin * 2;
    const baseWidthSum = baseColWidths.reduce((a, b) => a + b, 0);
    const dynamicColWidth = Math.max(
      45,
      (usableWidth - baseWidthSum) / Math.max(numDynamicCols, 1),
    );

    const nameListColumnStyles = {};
    baseColWidths.forEach((w, i) => {
      nameListColumnStyles[i] = {
        cellWidth: w,
        halign: i === 1 || i === 2 ? "left" : "center",
      };
    });
    for (let i = 0; i < numDynamicCols; i++) {
      nameListColumnStyles[baseColWidths.length + i] = {
        cellWidth: dynamicColWidth,
      };
    }

    bodyChunks.forEach((chunk, chunkIdx) => {
      if (chunkIdx > 0) {
        doc.addPage();
      }
      autoTable(doc, {
        head,
        body: chunk,
        startY: chunkIdx === 0 ? tableStartY : 40,
        styles: {
          fontSize: 10,
          cellPadding: 8,
          halign: "center",
          valign: "middle",
          overflow: "linebreak",
          lineWidth: 0.5,
          minCellHeight: rowMinHeight,
        },
        headStyles: {
          fillColor: [40, 167, 69],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 10,
        },
        alternateRowStyles: { fillColor: [240, 248, 243] },
        columnStyles: nameListColumnStyles,
        tableWidth: "wrap",
        margin: { left: tableSideMargin, right: tableSideMargin },
      });
    });

    // Filename - database raw title அப்படியே
    const safeFileName = displayTitle
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "_")
      .trim();

    doc.save(`${safeFileName}_Traveller_List.pdf`);
    // Result: GRAND_GUJARAT_YATRA_JAN_26_Traveller_List.pdf

    toast.success(
      <div className="flex items-center gap-2">
        <span>✅</span>
        <span>PDF exported successfully</span>
      </div>,
      { toastId: "pdf-export-success" },
    );
  };

  // Add train/flight column
  const handleAddGlobalColumn = (type) => {
    const maxColumns = 15;
    setTableData((prev) => {
      if (prev.trainColumns.length + prev.flightColumns.length >= maxColumns) {
        toast.error(
          <div className="flex items-center gap-2">
            <span>❌</span>
            <span>Cannot add more than {maxColumns} columns</span>
          </div>,
          { toastId: "max-columns-error" },
        );
        console.log("Toast displayed: max-columns-error");
        return prev;
      }
      const updated = cloneState(prev);
      if (type === "train") {
        let newName = `Train ${updated.trainColumns.length + 1}`;
        updated.trainColumns.push(newName);
        updated.travellers.forEach((t) => (t.trainSeats[newName] = ""));
        toast.success(
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>Train column "{newName}" added</span>
          </div>,
          { toastId: `add-train-${newName}` },
        );
        console.log("Toast displayed: add-train-", newName);
      } else {
        let newName = `Flight ${updated.flightColumns.length + 1}`;
        updated.flightColumns.push(newName);
        updated.travellers.forEach((t) => (t.flightSeats[newName] = ""));
        toast.success(
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>Flight column "{newName}" added</span>
          </div>,
          { toastId: `add-flight-${newName}` },
        );
        console.log("Toast displayed: add-flight-", newName);
      }
      console.log("Table data after add:", updated);
      return updated;
    });
  };

  // Rename column
  const handleColumnNameChangeGlobal = (type, index, newName) => {
    setTableData((prev) => {
      const updated = cloneState(prev);
      if (type === "train") {
        const oldName = updated.trainColumns[index];
        if (oldName === newName) return prev;
        updated.trainColumns[index] = newName;
        updated.travellers.forEach((t) => {
          t.trainSeats[newName] = t.trainSeats[oldName] ?? "";
          delete t.trainSeats[oldName];
        });
        toast.success(
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>Train column renamed to "{newName}"</span>
          </div>,
          { toastId: `rename-train-${index}` },
        );
        console.log("Toast displayed: rename-train-", index);
      } else {
        const oldName = updated.flightColumns[index];
        if (oldName === newName) return prev;
        updated.flightColumns[index] = newName;
        updated.travellers.forEach((t) => {
          t.flightSeats[newName] = t.flightSeats[oldName] ?? "";
          delete t.flightSeats[oldName];
        });
        toast.success(
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>Flight column renamed to "{newName}"</span>
          </div>,
          { toastId: `rename-flight-${index}` },
        );
        console.log("Toast displayed: rename-flight-", index);
      }
      console.log("Table data after rename:", updated);
      return updated;
    });
  };

  // Remove column
  const handleRemoveGlobalColumn = async (type, index) => {
    let removed;
    setTableData((prev) => {
      const updated = cloneState(prev);
      if (type === "train") {
        if (updated.trainColumns.length <= 1) {
          toast.error(
            <div className="flex items-center gap-2">
              <span>❌</span>
              <span>At least one train column is required</span>
            </div>,
            { toastId: "remove-train-error" },
          );
          console.log("Toast displayed: remove-train-error");
          return prev;
        }
        removed = updated.trainColumns.splice(index, 1)[0];
        updated.travellers.forEach((t) => delete t.trainSeats[removed]);
        toast.success(
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>Train column "{removed}" removed</span>
          </div>,
          { toastId: `remove-train-${index}` },
        );
        console.log("Toast displayed: remove-train-", index);
      } else {
        if (updated.flightColumns.length <= 1) {
          toast.error(
            <div className="flex items-center gap-2">
              <span>❌</span>
              <span>At least one flight column is required</span>
            </div>,
            { toastId: "remove-flight-error" },
          );
          console.log("Toast displayed: remove-flight-error");
          return prev;
        }
        removed = updated.flightColumns.splice(index, 1)[0];
        updated.travellers.forEach((t) => delete t.flightSeats[removed]);
        toast.success(
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>Flight column "{removed}" removed</span>
          </div>,
          { toastId: `remove-flight-${index}` },
        );
        console.log("Toast displayed: remove-flight-", index);
      }
      console.log("Table data after remove:", updated);
      return updated;
    });

    if (!removed) return;

    const promises = tableData.travellers.map((traveller) => {
      const trainSeatsArr = Object.entries(traveller.trainSeats).map(
        ([trainName, seatNo]) => ({ trainName, seatNo }),
      );
      const flightSeatsArr = Object.entries(traveller.flightSeats).map(
        ([flightName, seatNo]) => ({ flightName, seatNo }),
      );

      const payload = {
        trainSeats: trainSeatsArr,
        flightSeats: flightSeatsArr,
      };

      const booking = bookings.find((b) =>
        b.travellers.some((t) => t._id === traveller.id),
      );
      if (!booking) return null;

      return updateTravellerDetails(booking._id, traveller.id, payload);
    });

    const responses = await Promise.all(promises);
    responses.forEach((response, idx) => {
      if (response) {
        handleApiResponse(
          response,
          `Traveller ${tableData.travellers[idx].name} details updated`,
          true,
        );
      }
    });
  };

  // Traveller edits
  const handleSeatChange = (travellerId, type, column, value) => {
    setTableData((prev) => {
      const updated = cloneState(prev);
      const traveller = updated.travellers.find((t) => t.id === travellerId);
      if (!traveller) return prev;
      if (type === "train") traveller.trainSeats[column] = value;
      else traveller.flightSeats[column] = value;
      console.log("Table data after seat change:", updated);
      return updated;
    });
  };

  // Save one traveller
  const handleSaveSingleTraveller = async (traveller) => {
    if (!selectedTourId) {
      toast.error(
        <div className="flex items-center gap-2">
          <span>❌</span>
          <span>Please select a tour first.</span>
        </div>,
        { toastId: "no-tour-error" },
      );
      console.log("Toast displayed: no-tour-error");
      return;
    }

    try {
      const trainSeatsArr = Object.entries(traveller.trainSeats).map(
        ([trainName, seatNo]) => ({ trainName, seatNo }),
      );
      const flightSeatsArr = Object.entries(traveller.flightSeats).map(
        ([flightName, seatNo]) => ({ flightName, seatNo }),
      );

      const payload = {
        trainSeats: trainSeatsArr,
        flightSeats: flightSeatsArr,
      };

      const booking = bookings.find((b) =>
        b.travellers.some((t) => t._id === traveller.id),
      );
      if (!booking) {
        toast.error(
          <div className="flex items-center gap-2">
            <span>❌</span>
            <span>Booking not found for this traveller.</span>
          </div>,
          { toastId: "no-booking-error" },
        );
        console.log("Toast displayed: no-booking-error");
        return;
      }

      const response = await updateTravellerDetails(
        booking._id,
        traveller.id,
        payload,
      );
      handleApiResponse(
        response,
        <div className="flex items-center gap-2">
          <span>✅</span>
          <span>Traveller {traveller.name} details updated</span>
        </div>,
        { toastId: `save-traveller-${traveller.id}` },
      );
    } catch (error) {
      console.error("handleSaveSingleTraveller error:", error);
      toast.error(
        <div className="flex items-center gap-2">
          <span>❌</span>
          <span>Failed to save traveller details: {error.message}</span>
        </div>,
        { toastId: `save-traveller-error-${traveller.id}` },
      );
      console.log("Toast displayed: save-traveller-error-", traveller.id);
    }
  };

  // Save all travellers
  const handleSaveAllTravellers = async () => {
    if (!selectedTourId) {
      toast.error(
        <div className="flex items-center gap-2">
          <span>❌</span>
          <span>Please select a tour first.</span>
        </div>,
        { toastId: "no-tour-error" },
      );
      console.log("Toast displayed: no-tour-error");
      return;
    }

    try {
      const promises = tableData.travellers.map((traveller) => {
        const trainSeatsArr = Object.entries(traveller.trainSeats).map(
          ([trainName, seatNo]) => ({ trainName, seatNo }),
        );
        const flightSeatsArr = Object.entries(traveller.flightSeats).map(
          ([flightName, seatNo]) => ({ flightName, seatNo }),
        );

        const payload = {
          trainSeats: trainSeatsArr,
          flightSeats: flightSeatsArr,
        };

        const booking = bookings.find((b) =>
          b.travellers.some((t) => t._id === traveller.id),
        );
        if (!booking) return null;

        return updateTravellerDetails(booking._id, traveller.id, payload);
      });

      const responses = await Promise.all(promises);
      let allSuccessful = true;
      responses.forEach((response, idx) => {
        if (response) {
          handleApiResponse(
            response,
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>
                Traveller {tableData.travellers[idx].name} details updated
              </span>
            </div>,
            { toastId: `update-traveller-${idx}` },
          );
          if (!response.success) allSuccessful = false;
        }
      });

      if (allSuccessful) {
        toast.success(
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>All traveller details saved successfully!</span>
          </div>,
          { toastId: "save-all-success" },
        );
        console.log("Toast displayed: save-all-success");
      }
    } catch (error) {
      console.error("handleSaveAllTravellers error:", error);
      toast.error(
        <div className="flex items-center gap-2">
          <span>❌</span>
          <span>Failed to save all traveller details: {error.message}</span>
        </div>,
        { toastId: "save-all-error" },
      );
      console.log("Toast displayed: save-all-error");
    }
  };

  // Dynamic column width based on number of columns
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
      {/* Compact ToastContainer */}
      {/* Replace your current ToastContainer with this */}
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
          Name List
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
            value={selectedTourId}
            onChange={(e) => setSelectedTourId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md disabled:bg-gray-100 touch-manipulation"
            disabled={isLoadingBookings}
            aria-label="Select a tour"
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
                aria-label="Filter travellers by name"
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
                aria-label="Filter travellers by phone number"
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
                placeholder="Enter boarding point to filter"
                className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation"
                aria-label="Filter travellers by boarding point"
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
                placeholder="Enter deboarding point to filter"
                className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation"
                aria-label="Filter travellers by deboarding point"
              />
            </div>
          </div>
        )}
      </div>

      {selectedTourId ? (
        isLoadingBookings ? (
          <div className="text-center text-gray-500 text-xs sm:text-sm lg:text-base">
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
            </svg>
            Loading...
          </div>
        ) : filteredTravellers.length === 0 ? (
          <p className="text-center text-gray-500 text-xs sm:text-sm lg:text-base">
            No active travellers with verified advance payment found for this
            tour.
          </p>
        ) : (
          <>
            <div className="flex justify-end mb-4 sm:mb-6">
              <button
                onClick={exportToPDF}
                className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs sm:text-sm lg:text-base min-w-[100px] sm:min-w-[120px] touch-manipulation"
                aria-label="Export traveller list to PDF"
              >
                📄 Export to PDF
              </button>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
              <button
                onClick={() => handleAddGlobalColumn("train")}
                className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs sm:text-sm lg:text-base min-w-[100px] sm:min-w-[120px] touch-manipulation"
                aria-label="Add new train column"
              >
                + Add Train
              </button>
              <button
                onClick={() => handleAddGlobalColumn("flight")}
                className="px-3 sm:px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 text-xs sm:text-sm lg:text-base min-w-[100px] sm:min-w-[120px] touch-manipulation"
                aria-label="Add new flight column"
              >
                + Add Flight
              </button>
              <button
                onClick={handleSaveAllTravellers}
                className="px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-xs sm:text-sm lg:text-base min-w-[100px] sm:min-w-[120px] touch-manipulation"
                aria-label="Save all traveller details"
              >
                💾 Save All
              </button>
            </div>


            {/* Train-wise, Coach-wise Traveller Count */}
            {sortedTrainEntries.length > 0 && (
              <div className="mb-5 sm:mb-7 rounded-xl border border-blue-200 bg-blue-50/70 p-3 sm:p-4">
                <div className="mb-3">
                  <p className="text-[11px] sm:text-xs font-bold text-orange-900 uppercase tracking-wide">
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
                        <p className="text-[10px] sm:text-xs font-bold text-indigo-700 uppercase tracking-wide">
                          {trainName}
                        </p>
                        <span
                          className={`text-[10px] sm:text-xs font-bold rounded-full px-2.5 py-0.5 border ${trainAssignedCount === filteredTravellers.length
                            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                            : "text-amber-700 bg-amber-50 border-amber-200"
                            }`}
                        >
                          Assigned: {trainAssignedCount} / {filteredTravellers.length}
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
                                            ? "text-emerald-600 font-semibold"
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

            {/* Desktop Table View */}
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
                      className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[90px]`}
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
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <input
                            type="text"
                            value={col}
                            onChange={(e) =>
                              handleColumnNameChangeGlobal(
                                "train",
                                i,
                                e.target.value,
                              )
                            }
                            className="w-16 sm:w-20 lg:w-24 px-1 sm:px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm font-semibold text-center touch-manipulation"
                            aria-label={`Train column ${i + 1} name`}
                          />
                          {tableData.trainColumns.length > 1 && (
                            <button
                              onClick={() =>
                                handleRemoveGlobalColumn("train", i)
                              }
                              className="p-1 sm:p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs touch-manipulation"
                              aria-label={`Remove train column ${col}`}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                    {tableData.flightColumns.map((col, i) => (
                      <th
                        key={i}
                        className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold ${columnWidthClass}`}
                      >
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <input
                            type="text"
                            value={col}
                            onChange={(e) =>
                              handleColumnNameChangeGlobal(
                                "flight",
                                i,
                                e.target.value,
                              )
                            }
                            className="w-16 sm:w-20 lg:w-24 px-1 sm:px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm font-semibold text-center touch-manipulation"
                            aria-label={`Flight column ${i + 1} name`}
                          />
                          {tableData.flightColumns.length > 1 && (
                            <button
                              onClick={() =>
                                handleRemoveGlobalColumn("flight", i)
                              }
                              className="p-1 sm:p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs touch-manipulation"
                              aria-label={`Remove flight column ${col}`}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                    <th
                      className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[80px]`}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTravellers.map((trav, idx) => (
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
                        {trav.age}
                      </td>
                      <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base">
                        {getDisplayGender(
                          trav.age,
                          trav.gender,
                          trav.sharingType,
                        )}
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
                      {tableData.trainColumns.map((col, i) => (
                        <td
                          key={i}
                          className="p-2 sm:p-3 border border-gray-200 text-center"
                        >
                          <input
                            type="text"
                            value={trav.trainSeats[col] ?? ""}
                            onChange={(e) =>
                              handleSeatChange(
                                trav.id,
                                "train",
                                col,
                                e.target.value,
                              )
                            }
                            className="w-14 sm:w-16 lg:w-20 px-1 sm:px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm text-center touch-manipulation"
                            aria-label={`Train seat for ${col}`}
                          />
                        </td>
                      ))}
                      {tableData.flightColumns.map((col, i) => (
                        <td
                          key={i}
                          className="p-2 sm:p-3 border border-gray-200 text-center"
                        >
                          <input
                            type="text"
                            value={trav.flightSeats[col] ?? ""}
                            onChange={(e) =>
                              handleSeatChange(
                                trav.id,
                                "flight",
                                col,
                                e.target.value,
                              )
                            }
                            className="w-14 sm:w-16 lg:w-20 px-1 sm:px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm text-center touch-manipulation"
                            aria-label={`Flight seat for ${col}`}
                          />
                        </td>
                      ))}
                      <td className="p-2 sm:p-3 border border-gray-200 text-center">
                        <button
                          onClick={() => handleSaveSingleTraveller(trav)}
                          className="px-2 sm:px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs sm:text-sm min-w-[60px] sm:min-w-[80px] touch-manipulation"
                          aria-label={`Save details for ${trav.name}`}
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4">
              <div className="mb-4">
                {tableData.trainColumns.map((col, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={col}
                      onChange={(e) =>
                        handleColumnNameChangeGlobal("train", i, e.target.value)
                      }
                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-xs sm:text-sm touch-manipulation"
                      aria-label={`Train column ${i + 1} name`}
                    />
                    {tableData.trainColumns.length > 1 && (
                      <button
                        onClick={() => handleRemoveGlobalColumn("train", i)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs touch-manipulation"
                        aria-label={`Remove train column ${col}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {tableData.flightColumns.map((col, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={col}
                      onChange={(e) =>
                        handleColumnNameChangeGlobal(
                          "flight",
                          i,
                          e.target.value,
                        )
                      }
                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-xs sm:text-sm touch-manipulation"
                      aria-label={`Flight column ${i + 1} name`}
                    />
                    {tableData.flightColumns.length > 1 && (
                      <button
                        onClick={() => handleRemoveGlobalColumn("flight", i)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs touch-manipulation"
                        aria-label={`Remove flight column ${col}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {filteredTravellers.map((trav, idx) => (
                <div
                  key={trav.id}
                  className="bg-white border rounded-lg p-3 shadow-sm"
                >
                  <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
                    <div>
                      <span className="font-semibold">SL NO: </span>
                      {String(idx + 1).padStart(2, "0")}.
                    </div>
                    <div>
                      <span className="font-semibold">TNR: </span> {trav.tnr}
                    </div>
                    <div>
                      <span className="font-semibold">Name: </span>
                      {trav.name}
                    </div>
                    <div>
                      <span className="font-semibold">Age: </span>
                      {trav.age}
                    </div>
                    <div>
                      <span className="font-semibold">Gender: </span>
                      {getDisplayGender(
                        trav.age,
                        trav.gender,
                        trav.sharingType,
                      )}
                    </div>
                    <div>
                      <span className="font-semibold">Mobile: </span>
                      {trav.mobile || "—"}
                    </div>
                    <div>
                      <span className="font-semibold">Boarding Point: </span>
                      {trav.boardingPoint || "—"}
                    </div>
                    <div>
                      <span className="font-semibold">Deboarding Point: </span>
                      {trav.deboardingPoint || "—"}
                    </div>
                    {tableData.trainColumns.map((col, i) => (
                      <div key={i}>
                        <span className="font-semibold">{col}: </span>
                        <input
                          type="text"
                          value={trav.trainSeats[col] ?? ""}
                          onChange={(e) =>
                            handleSeatChange(
                              trav.id,
                              "train",
                              col,
                              e.target.value,
                            )
                          }
                          className="w-full px-2 py-2 border border-gray-300 rounded-md text-xs sm:text-sm touch-manipulation"
                          aria-label={`Train seat for ${col}`}
                        />
                      </div>
                    ))}
                    {tableData.flightColumns.map((col, i) => (
                      <div key={i}>
                        <span className="font-semibold">{col}: </span>
                        <input
                          type="text"
                          value={trav.flightSeats[col] ?? ""}
                          onChange={(e) =>
                            handleSeatChange(
                              trav.id,
                              "flight",
                              col,
                              e.target.value,
                            )
                          }
                          className="w-full px-2 py-2 border border-gray-300 rounded-md text-xs sm:text-sm touch-manipulation"
                          aria-label={`Flight seat for ${col}`}
                        />
                      </div>
                    ))}
                    <div className="text-center">
                      <button
                        onClick={() => handleSaveSingleTraveller(trav)}
                        className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs sm:text-sm w-full touch-manipulation"
                        aria-label={`Save details for ${trav.name}`}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      ) : (
        <p className="text-center text-gray-500 text-xs sm:text-sm lg:text-base">
          Please select a tour to view the traveller list.
        </p>
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
              You are currently viewing the traveller name list for{" "}
              <strong>
                {tourList.find((t) => t._id === selectedTourId)?.title ||
                  "this tour"}
              </strong>
              .<br />
              Leaving will clear the current list and filters.
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

export default TourNameList;

