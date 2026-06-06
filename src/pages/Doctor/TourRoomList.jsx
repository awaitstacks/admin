// import React, { useContext, useEffect, useState } from "react";
// import { TourContext } from "../../context/TourContext";
// import { jsPDF } from "jspdf";
// import html2canvas from "html2canvas";

// const CHUNK_SIZE = 8;

// const COMPANY_NAME = "GV - Tour Planners LLP";
// const COMPANY_ADDRESS = "15/4, Nehru Street, Jaihindpuram, Madurai - 625011";

// const TourRoomList = () => {
//   const {
//     tourList,
//     getTourList,
//     getRoomAllocation,
//     roomAllocation,
//     roomAllocationLoading,
//     roomAllocationError,
//   } = useContext(TourContext);

//   const [selectedTourId, setSelectedTourId] = useState("");
//   const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
//   const [isGeneratingVendorPDF, setIsGeneratingVendorPDF] = useState(false);
//     const [showConfirmLeave, setShowConfirmLeave] = useState(false);
//     const shouldProtect = Boolean(selectedTourId);   // protect as soon as a tour is selected

//     // 1. Browser reload / close tab / navigate away confirmation
//     useEffect(() => {
//       if (!shouldProtect) return;

//       const handleBeforeUnload = (e) => {
//         e.preventDefault();
//         e.returnValue = '';   // This triggers the browser's default "Leave site?" dialog
//       };

//       window.addEventListener('beforeunload', handleBeforeUnload);

//       return () => {
//         window.removeEventListener('beforeunload', handleBeforeUnload);
//       };
//     }, [shouldProtect]);

//     // 2. Back button / mobile swipe back protection
//     useEffect(() => {
//       if (!shouldProtect) return;

//       // Push a dummy history entry so back button triggers popstate
//       window.history.pushState(null, null, window.location.href);

//       const handlePopState = () => {
//         setShowConfirmLeave(true);
//       };

//       window.addEventListener('popstate', handlePopState);

//       return () => {
//         window.removeEventListener('popstate', handlePopState);
//       };
//     }, [shouldProtect]);

//     // Confirm / Cancel handlers
//     const handleConfirmLeave = () => {
//       setShowConfirmLeave(false);
//       window.history.back();
//     };

//     const handleCancelLeave = () => {
//       setShowConfirmLeave(false);
//       // Re-push to keep the back button trap active
//       window.history.pushState(null, null, window.location.href);
//     };


//   useEffect(() => {
//     if (tourList.length === 0) getTourList();
//   }, [getTourList, tourList.length]);

//   useEffect(() => {
//     if (selectedTourId) getRoomAllocation(selectedTourId);
//   }, [selectedTourId, getRoomAllocation]);

//   const selectedTour = tourList.find((t) => t._id === selectedTourId);

//   /* ---------------- HELPERS ---------------- */
//   const chunkArray = (arr, size) => {
//     const out = [];
//     for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
//     return out;
//   };

//   const getSharingLabel = (count) => {
//     if (count === 1) return "SINGLE";
//     if (count === 2) return "DOUBLE";
//     if (count === 3) return "TRIPLE";
//     return "QUAD";
//   };

//   const getSharingColor = (count) => {
//     if (count === 1) return "bg-amber-100 text-amber-800";
//     if (count === 2) return "bg-blue-100 text-blue-800";
//     if (count === 3) return "bg-emerald-100 text-emerald-800";
//     return "bg-purple-100 text-purple-800";
//   };

//   /* ---------------- ROOM STATS ---------------- */
//   const getRoomStats = () => {
//     const stats = { total: 0, single: 0, double: 0, triple: 0, quad: 0 };
//     if (!roomAllocation?.groupedByMobile) return stats;

//     roomAllocation.groupedByMobile.forEach((group) => {
//       group.rooms.forEach((room) => {
//         stats.total++;
//         const c = room.occupants?.length || 0;
//         if (c === 1) stats.single++;
//         else if (c === 2) stats.double++;
//         else if (c === 3) stats.triple++;
//         else if (c >= 4) stats.quad++;
//       });
//     });
//     return stats;
//   };

//   /* ---------------- GROUP LABELS ---------------- */
//   const getMobileGroupLabels = () => {
//     const mobileToGroupMap = {};
//     let counter = 1;
//     if (!roomAllocation?.groupedByMobile)
//       return { groupMap: mobileToGroupMap, hasGroups: false };

//     roomAllocation.groupedByMobile.forEach((group) => {
//       const label = `F${counter++}`;
//       mobileToGroupMap[group.contactMobile] = label;
//     });

//     return { groupMap: mobileToGroupMap, hasGroups: counter > 1 };
//   };

//   /* ---------------- FLATTEN + SORT ROOMS ---------------- */
//   const getAllRooms = (familyLabels) => {
//     if (!roomAllocation?.groupedByMobile) return [];

//     const rooms = [];
//     roomAllocation.groupedByMobile.forEach((group) => {
//       const groupLabel = familyLabels[group.contactMobile];
//       group.rooms.forEach((room) => {
//         rooms.push({
//           ...room,
//           roomNumber: room.roomNumber,
//           contactMobile: group.contactMobile,
//           groupLabel: groupLabel,
//         });
//       });
//     });

//     rooms.sort((a, b) => {
//       const labelA = parseInt(a.groupLabel?.substring(1) || "999");
//       const labelB = parseInt(b.groupLabel?.substring(1) || "999");
//       if (labelA !== labelB) return labelA - labelB;
//       return a.roomNumber - b.roomNumber;
//     });

//     return rooms;
//   };

//   const { groupMap: familyLabels, hasGroups: hasFamilies } =
//     getMobileGroupLabels();
//   const allRooms = getAllRooms(familyLabels);
//   const roomStats = getRoomStats();
//   const roomChunks = chunkArray(allRooms, CHUNK_SIZE);

//   /* ---------------- PDF EXPORT ---------------- */
//   const exportToPDF = async (isVendor = false) => {
//     const generating = isVendor ? isGeneratingVendorPDF : isGeneratingPDF;
//     if (generating) return;

//     if (isVendor) setIsGeneratingVendorPDF(true);
//     else setIsGeneratingPDF(true);

//     const pages = document.querySelectorAll(
//       isVendor ? ".vendor-pdf-page" : ".admin-pdf-page"
//     );
//     const pdf = new jsPDF("l", "mm", "a4");

//     try {
//       for (let i = 0; i < pages.length; i++) {
//         const canvas = await html2canvas(pages[i], {
//           scale: 2,
//           backgroundColor: "#ffffff",
//           useCORS: true,
//         });
//         const img = canvas.toDataURL("image/png");
//         if (i > 0) pdf.addPage();
//         pdf.addImage(img, "PNG", 0, 0, 297, 210);
//       }

//       const suffix = isVendor ? "_Vendor" : "";
//       const fileName =
//         (selectedTour?.title || "Room_Allocation")
//           .replace(/[^a-zA-Z0-9]/g, "_")
//           .substring(0, 40) +
//         suffix +
//         ".pdf";

//       pdf.save(fileName);
//     } catch (err) {
//       console.error(err);
//       alert("PDF generation failed");
//     } finally {
//       if (isVendor) setIsGeneratingVendorPDF(false);
//       else setIsGeneratingPDF(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10">
//           Tour Room Allocation
//         </h1>

//         <div className="bg-white rounded-xl shadow-lg p-6 mb-10">
//           <select
//             className="w-full max-w-lg mx-auto block border-2 border-gray-300 rounded-lg px-5 py-4 text-lg focus:border-blue-500 focus:outline-none transition"
//             value={selectedTourId}
//             onChange={(e) => setSelectedTourId(e.target.value)}
//           >
//             <option value="">-- Select Tour --</option>
//             {tourList.map((t) => (
//               <option key={t._id} value={t._id}>
//                 {t.title}
//               </option>
//             ))}
//           </select>
//         </div>

//         {roomAllocationLoading && (
//           <div className="text-center text-blue-600 text-xl font-medium">
//             Loading room allocation...
//           </div>
//         )}

//         {roomAllocationError && (
//           <div className="text-center text-red-600 text-xl font-medium bg-red-50 py-4 rounded-lg">
//             {roomAllocationError}
//           </div>
//         )}

//         {selectedTourId &&
//           !roomAllocationLoading &&
//           !roomAllocationError &&
//           allRooms.length === 0 && (
//             <div className="text-center text-gray-600 text-xl bg-gray-100 py-10 rounded-xl">
//               No room allocations found for this tour.
//             </div>
//           )}

//         {allRooms.length > 0 && (
//           <>
//             {/* Download Buttons */}
//             <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
//               <button
//                 onClick={() => exportToPDF(false)}
//                 disabled={isGeneratingPDF}
//                 className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-10 rounded-xl text-lg shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition transform hover:scale-105"
//               >
//                 {isGeneratingPDF ? "Generating..." : "Download Full PDF"}
//               </button>

//               <button
//                 onClick={() => exportToPDF(true)}
//                 disabled={isGeneratingVendorPDF}
//                 className="bg-gradient-to-r from-green-600 to-green-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-4 px-10 rounded-xl text-lg shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition transform hover:scale-105"
//               >
//                 {isGeneratingVendorPDF
//                   ? "Generating..."
//                   : "Download Vendor File"}
//               </button>
//             </div>

//             {/* Main Content Card */}
//             <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//               <div className=" bg-white-300 text-blue py-8 px-6">
//                 <h2 className="text-3xl font-bold text-center">
//                   {selectedTour?.title}
//                 </h2>
//                 {hasFamilies && (
//                   <p className="text-center mt-4 text-black-100 italic text-lg">
//                     Rooms grouped by family (F1, F2, F3...)
//                   </p>
//                 )}
//               </div>

//               <div className="p-6 lg:p-10">
//                 {/* Stats Grid */}
//                 <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
//                   <StatBox
//                     label="Total Rooms"
//                     value={roomStats.total}
//                     color="blue"
//                   />
//                   <StatBox
//                     label="Single"
//                     value={roomStats.single}
//                     color="amber"
//                   />
//                   <StatBox
//                     label="Double"
//                     value={roomStats.double}
//                     color="emerald"
//                   />
//                   <StatBox
//                     label="Triple"
//                     value={roomStats.triple}
//                     color="purple"
//                   />
//                   <StatBox label="Quad" value={roomStats.quad} color="rose" />
//                 </div>

//                 <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center border-b-2 border-gray-200 pb-4">
//                   Room Details
//                 </h3>

//                 {/* Responsive Room Grid */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                   {allRooms.map((room, idx) => {
//                     const family = familyLabels[room.contactMobile];
//                     const runningRoomIndex = idx + 1;

//                     return (
//                       <div
//                         key={idx}
//                         className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
//                       >
//                         <div>
//                           <div className="flex justify-between items-start mb-4">
//                             <div className="text-2xl font-bold text-gray-800">
//                               Room {runningRoomIndex}
//                             </div>
//                             {family && (
//                               <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-sm">
//                                 {family}
//                               </span>
//                             )}
//                           </div>

//                           <div className="text-center text-gray-600 mb-4">
//                             Mob: {room.contactMobile}
//                           </div>

//                           <div
//                             className={`inline-block mx-auto px-6 py-2 rounded-full font-semibold text-sm ${getSharingColor(
//                               room.occupants.length
//                             )}`}
//                           >
//                             {room.occupants.length} SHARING
//                           </div>
//                         </div>

//                         <div className="mt-6 space-y-2">
//                           {room.occupants.map((p, i) => (
//                             <div
//                               key={i}
//                               className="text-sm font-medium text-gray-700"
//                             >
//                               {p.firstName} {p.lastName}{" "}
//                               <span className="text-gray-500">
//                                 ({p.gender})
//                               </span>
//                             </div>
//                           ))}
//                         </div>

//                         <div className="border-t border-dashed border-gray-300 mt-6 pt-4 text-center text-xs text-gray-500">
//                           Physical Room No:
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </div>

//       {/* ================= OFFSCREEN PDFs ================= */}
//       <style>{pdfStyles}</style>

//       {/* ADMIN PDF (WITH MOBILE) */}
//       <div style={{ position: "absolute", left: "-9999px", width: "297mm" }}>
//         {/* First Page - Admin (ONLY HERE company header) */}
//         <div className="pdf-page admin-pdf-page">
//           <div style={{ textAlign: "center", marginBottom: "8mm" }}>
//             <div
//               style={{ fontSize: "20pt", fontWeight: "bold", color: "#1e40af" }}
//             >
//               {COMPANY_NAME}
//             </div>
//             <div style={{ fontSize: "12pt", color: "#4b5563" }}>
//               {COMPANY_ADDRESS}
//             </div>
//           </div>

//           <h1
//             style={{
//               textAlign: "center",
//               fontSize: "28pt",
//               color: "#1e40af",
//               margin: "10mm 0",
//             }}
//           >
//             Room Allocation Report
//           </h1>
//           <h2
//             style={{
//               textAlign: "center",
//               fontSize: "22pt",
//               fontWeight: "bold",
//             }}
//           >
//             {selectedTour?.title}
//           </h2>

//           <div
//             style={{
//               marginTop: "15mm",
//               fontSize: "14pt",
//               fontWeight: "bold",
//               textAlign: "left",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "flex-start",
//                 gap: "80mm",
//                 maxWidth: "240mm",
//                 margin: "0 auto",
//               }}
//             >
//               <div>Hotel Name:</div>
//               <div>Check-in Date:</div>
//             </div>
//             <div
//               style={{
//                 width: "100%",
//                 marginTop: "5mm",
//                 textAlign: "left",
//                 maxWidth: "240mm",
//                 marginLeft: "auto",
//                 marginRight: "auto",
//               }}
//             >
//               Place:
//             </div>
//           </div>

//           {hasFamilies && (
//             <p
//               style={{
//                 textAlign: "center",
//                 color: "#dc2626",
//                 fontStyle: "italic",
//                 marginTop: "15mm",
//               }}
//             >
//               * Rooms are grouped by contact mobile number (F1, F2, F3, etc.)
//             </p>
//           )}

//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(5,1fr)",
//               gap: "10mm",
//               marginTop: "15mm",
//             }}
//           >
//             <Stat label="Total" value={roomStats.total} isPDF />
//             <Stat label="Single" value={roomStats.single} isPDF />
//             <Stat label="Double" value={roomStats.double} isPDF />
//             <Stat label="Triple" value={roomStats.triple} isPDF />
//             <Stat label="Quad" value={roomStats.quad} isPDF />
//           </div>
//         </div>

//         {/* Subsequent Room Pages - Admin (NO company header) */}
//         {roomChunks.map((chunk, pageIndex) => (
//           <div className="pdf-page admin-pdf-page" key={`admin-${pageIndex}`}>
//             <div className="room-grid">
//               {chunk.map((room, idx) => {
//                 const family = familyLabels[room.contactMobile];
//                 const runningRoomIndex = pageIndex * CHUNK_SIZE + idx + 1;
//                 return (
//                   <div className="room-card" key={idx}>
//                     <div>
//                       <div className="room-title">
//                         Room {runningRoomIndex}
//                         {family && (
//                           <span className="family-badge">({family})</span>
//                         )}
//                       </div>
//                       <div className="mobile">Mob: {room.contactMobile}</div>
//                       <div className="sharing">
//                         {getSharingLabel(room.occupants.length)} SHARING
//                       </div>
//                     </div>
//                     <div>
//                       {room.occupants.map((p, i) => (
//                         <div className="guest" key={i}>
//                           {p.firstName} {p.lastName} ({p.gender})
//                         </div>
//                       ))}
//                     </div>
//                     <div
//                       style={{
//                         borderTop: "1px dashed #333",
//                         textAlign: "center",
//                         fontSize: "9pt",
//                         paddingTop: "2mm",
//                       }}
//                     >
//                       Physical Room No:
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* VENDOR PDF (NO MOBILE) */}
//       <div style={{ position: "absolute", left: "-9999px", width: "297mm" }}>
//         {/* First Page - Vendor (ONLY HERE company header) */}
//         <div className="pdf-page vendor-pdf-page">
//           <div style={{ textAlign: "center", marginBottom: "8mm" }}>
//             <div
//               style={{ fontSize: "20pt", fontWeight: "bold", color: "#059669" }}
//             >
//               {COMPANY_NAME}
//             </div>
//             <div style={{ fontSize: "12pt", color: "#4b5563" }}>
//               {COMPANY_ADDRESS}
//             </div>
//           </div>

//           <h1
//             style={{
//               textAlign: "center",
//               fontSize: "28pt",
//               color: "#059669",
//               margin: "10mm 0",
//             }}
//           >
//             Room Allocation - Vendor Copy
//           </h1>
//           <h2
//             style={{
//               textAlign: "center",
//               fontSize: "22pt",
//               fontWeight: "bold",
//             }}
//           >
//             {selectedTour?.title}
//           </h2>

//           <div
//             style={{
//               marginTop: "15mm",
//               fontSize: "14pt",
//               fontWeight: "bold",
//               textAlign: "left",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "flex-start",
//                 gap: "80mm",
//                 maxWidth: "240mm",
//                 margin: "0 auto",
//               }}
//             >
//               <div>Hotel Name:</div>
//               <div>Check-in Date:</div>
//             </div>
//             <div
//               style={{
//                 width: "100%",
//                 marginTop: "5mm",
//                 textAlign: "left",
//                 maxWidth: "240mm",
//                 marginLeft: "auto",
//                 marginRight: "auto",
//               }}
//             >
//               Place:
//             </div>
//           </div>
//           {hasFamilies && (
//             <p
//               style={{
//                 textAlign: "center",
//                 color: "#dc2626",
//                 fontStyle: "italic",
//                 marginTop: "15mm",
//               }}
//             >
//               * Rooms are grouped by family (F1, F2, F3, etc.)
//             </p>
//           )}

//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(5,1fr)",
//               gap: "10mm",
//               marginTop: "15mm",
//             }}
//           >
//             <Stat label="Total" value={roomStats.total} isPDF />
//             <Stat label="Single" value={roomStats.single} isPDF />
//             <Stat label="Double" value={roomStats.double} isPDF />
//             <Stat label="Triple" value={roomStats.triple} isPDF />
//             <Stat label="Quad" value={roomStats.quad} isPDF />
//           </div>
//         </div>

//         {/* Subsequent Room Pages - Vendor (NO company header) */}
//         {roomChunks.map((chunk, pageIndex) => (
//           <div className="pdf-page vendor-pdf-page" key={`vendor-${pageIndex}`}>
//             <div className="room-grid">
//               {chunk.map((room, idx) => {
//                 const family = familyLabels[room.contactMobile];
//                 const runningRoomIndex = pageIndex * CHUNK_SIZE + idx + 1;
//                 return (
//                   <div className="room-card" key={idx}>
//                     <div>
//                       <div className="room-title">
//                         Room {runningRoomIndex}
//                         {family && (
//                           <span className="family-badge">({family})</span>
//                         )}
//                       </div>
//                       {/* Mobile hidden in vendor copy */}
//                       <div className="sharing" style={{ marginTop: "8mm" }}>
//                         {getSharingLabel(room.occupants.length)} SHARING
//                       </div>
//                     </div>
//                     <div>
//                       {room.occupants.map((p, i) => (
//                         <div className="guest" key={i}>
//                           {p.firstName} {p.lastName} ({p.gender})
//                         </div>
//                       ))}
//                     </div>
//                     <div
//                       style={{
//                         borderTop: "1px dashed #333",
//                         textAlign: "center",
//                         fontSize: "9pt",
//                         paddingTop: "2mm",
//                       }}
//                     >
//                       Physical Room No:
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         ))}
//       </div>
//       {showConfirmLeave && (
//         <div
//           style={{
//             position: 'fixed',
//             inset: 0,
//             backgroundColor: 'rgba(0,0,0,0.6)',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             zIndex: 9999,
//             padding: '1rem'
//           }}
//         >
//           <div
//             style={{
//               backgroundColor: 'white',
//               borderRadius: '12px',
//               padding: '2rem 1.5rem',
//               maxWidth: '420px',
//               width: '100%',
//               textAlign: 'center',
//               boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)'
//             }}
//           >
//             <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
//               Leave this page?
//             </h2>

//             <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.5' }}>
//               Room allocation for <strong>{selectedTour?.title || "this tour"}</strong> is currently shown.<br />
//               Leaving will clear your selection.<br />
//               Are you sure you want to leave?
//             </p>

//             <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
//               <button
//                 onClick={handleCancelLeave}
//                 style={{
//                   padding: '0.75rem 1.5rem',
//                   backgroundColor: '#e5e7eb',
//                   color: '#1f2937',
//                   borderRadius: '8px',
//                   fontWeight: '600',
//                   border: 'none',
//                   cursor: 'pointer'
//                 }}
//               >
//                 Cancel (Stay)
//               </button>

//               <button
//                 onClick={handleConfirmLeave}
//                 style={{
//                   padding: '0.75rem 1.5rem',
//                   backgroundColor: '#dc2626',
//                   color: 'white',
//                   borderRadius: '8px',
//                   fontWeight: '600',
//                   border: 'none',
//                   cursor: 'pointer'
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

// /* Shared PDF Styles */
// const pdfStyles = `
//   .pdf-page { width:297mm;height:210mm;padding:12mm;background:white; }
//   .room-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:10mm; }
//   .room-card { border:2px solid #333;border-radius:8px;padding:10mm;height:85mm;display:flex;flex-direction:column;justify-content:space-between; }
//   .room-title { font-size:15pt;font-weight:bold;text-align:center; }
//   .family-badge { color:#d32f2f;font-weight:bold;margin-left:6mm; }
//   .mobile { text-align:center;font-size:10pt;margin:4mm 0;color:#1976d2; }
//   .sharing { text-align:center;font-size:10pt;font-weight:bold; }
//   .guest { font-size:10pt;margin-bottom:2mm; }
// `;

// /* Stat Components */
// const StatBox = ({ label, value, color }) => {
//   const colorClasses = {
//     blue: "bg-blue-100 text-blue-800 border-blue-200",
//     amber: "bg-amber-100 text-amber-800 border-amber-200",
//     emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
//     purple: "bg-purple-100 text-purple-800 border-purple-200",
//     rose: "bg-rose-100 text-rose-800 border-rose-200",
//   };

//   return (
//     <div
//       className={`border-2 ${colorClasses[color]} rounded-xl p-6 text-center shadow-sm`}
//     >
//       <div className="text-3xl font-bold">{value}</div>
//       <div className="text-sm mt-2">{label}</div>
//     </div>
//   );
// };

// const Stat = ({ label, value, isPDF }) => {
//   if (isPDF) {
//     return (
//       <div
//         style={{
//           border: "2px solid #333",
//           borderRadius: "8px",
//           padding: "10mm",
//           textAlign: "center",
//         }}
//       >
//         <div style={{ fontSize: "24pt", fontWeight: "bold" }}>{value}</div>
//         <div style={{ fontSize: "12pt" }}>{label}</div>
//       </div>
//     );
//   }
//   return null;
// };

// export default TourRoomList;




import React, { useContext, useEffect, useState } from "react";
import { TourContext } from "../../context/TourContext";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Trash2 } from "lucide-react";   // ← Add this import

const CHUNK_SIZE = 8;

const COMPANY_NAME = "GV - Tour Planners LLP";
const COMPANY_ADDRESS = "15/4, Nehru Street, Jaihindpuram, Madurai - 625011";

const TourRoomList = () => {
  const {
    tourList,
    getTourList,
    getRoomAllocation,
    roomAllocation,
    roomAllocationLoading,
    roomAllocationError,
    getManualRooms,
    addGuestRoom,
    addLeaderRoom,
    deleteLeaderRoom,
    manualRooms = [],
  } = useContext(TourContext);

  const [selectedTourId, setSelectedTourId] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingVendorPDF, setIsGeneratingVendorPDF] = useState(false);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [roomType, setRoomType] = useState("guest");

  const [formData, setFormData] = useState({
    sharingType: "double",
    mobile: "",
    occupants: [{ firstName: "", lastName: "", gender: "Male" }],
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const shouldProtect = Boolean(selectedTourId);

  // Browser protections
  useEffect(() => {
    if (!shouldProtect) return;
    const handleBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [shouldProtect]);

  useEffect(() => {
    if (!shouldProtect) return;
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => setShowConfirmLeave(true);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [shouldProtect]);

  const handleConfirmLeave = () => { setShowConfirmLeave(false); window.history.back(); };
  const handleCancelLeave = () => {
    setShowConfirmLeave(false);
    window.history.pushState(null, null, window.location.href);
  };

  useEffect(() => {
    if (tourList.length === 0) getTourList();
  }, [getTourList, tourList.length]);

  // Load both system and manual rooms
  useEffect(() => {
    if (selectedTourId) {
      getRoomAllocation(selectedTourId);
      getManualRooms(selectedTourId);
    }
  }, [selectedTourId, getRoomAllocation, getManualRooms]);

  const selectedTour = tourList.find((t) => t._id === selectedTourId);

  /* ---------------- HELPERS ---------------- */
  const chunkArray = (arr, size) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  const getSharingLabel = (count) => {
    if (count === 1) return "SINGLE";
    if (count === 2) return "DOUBLE";
    if (count === 3) return "TRIPLE";
    return "QUAD";
  };

  const getEffectiveSharingCount = (occupants) => {
    return occupants.filter(p => p.sharingType !== "withoutBerth").length;
  };


  const getSharingColor = (count) => {
    if (count === 1) return "bg-amber-100 text-amber-800";
    if (count === 2) return "bg-blue-100 text-blue-800";
    if (count === 3) return "bg-emerald-100 text-emerald-800";
    return "bg-purple-100 text-purple-800";
  };

  /* ---------------- COMBINE SYSTEM + MANUAL ROOMS ---------------- */
  const systemRooms = roomAllocation?.groupedByMobile?.flatMap((group) =>
    group.rooms.map((room) => ({
      ...room,
      contactMobile: group.contactMobile,
      isManual: false,
    }))
  ) || [];

  const manualFormatted = manualRooms.map((room) => ({
    ...room,
    contactMobile: room.mobile,
    isManual: true,
  }));

  const sorted = [...systemRooms, ...manualFormatted].sort((a, b) => {
    const aIsLeader = a.type === "leader" ? 1 : 0;
    const bIsLeader = b.type === "leader" ? 1 : 0;
    if (aIsLeader !== bIsLeader) return aIsLeader - bIsLeader;
    return a.roomNumber - b.roomNumber;
  });

  const allRooms = sorted.map((room, idx) => ({
    ...room,
    roomNumber: idx + 1,
  }));

  /* ---------------- ROOM STATS ---------------- */
  const getRoomStats = () => {
    const stats = { total: 0, single: 0, double: 0, triple: 0, quad: 0 };
    allRooms.forEach((room) => {
      stats.total++;
      const c = getEffectiveSharingCount(room.occupants); // ✅ effective count
      if (c === 1) stats.single++;
      else if (c === 2) stats.double++;
      else if (c === 3) stats.triple++;
      else if (c >= 4) stats.quad++;
    });
    return stats;
  };

  const roomStats = getRoomStats();

  /* ---------------- GROUP LABELS (Only for system rooms) ---------------- */
  const getMobileGroupLabels = () => {
    const mobileToGroupMap = {};
    let counter = 1;

    // Walk allRooms in display order — assign F-labels as each new mobile is seen
    allRooms.forEach((room) => {
      if (room.isManual) return; // skip manual rooms, they don't get F-labels
      const mob = room.contactMobile;
      if (mob && !mobileToGroupMap[mob]) {
        mobileToGroupMap[mob] = `F${counter++}`;
      }
    });

    return { groupMap: mobileToGroupMap, hasGroups: counter > 1 };
  };

  const { groupMap: familyLabels, hasGroups: hasFamilies } = getMobileGroupLabels();
  const roomChunks = chunkArray(allRooms, CHUNK_SIZE);


  /* ---------------- PDF EXPORT (Unchanged) ---------------- */
  const exportToPDF = async (isVendor = false) => {
    const generating = isVendor ? isGeneratingVendorPDF : isGeneratingPDF;
    if (generating) return;

    if (isVendor) setIsGeneratingVendorPDF(true);
    else setIsGeneratingPDF(true);

    const pages = document.querySelectorAll(isVendor ? ".vendor-pdf-page" : ".admin-pdf-page");
    const pdf = new jsPDF("l", "mm", "a4");

    try {
      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], { scale: 2, backgroundColor: "#ffffff", useCORS: true });
        const img = canvas.toDataURL("image/png");
        if (i > 0) pdf.addPage();
        pdf.addImage(img, "PNG", 0, 0, 297, 210);
      }

      const suffix = isVendor ? "_Vendor" : "";
      const fileName = (selectedTour?.title || "Room_Allocation").replace(/[^a-zA-Z0-9]/g, "_").substring(0, 40) + suffix + ".pdf";
      pdf.save(fileName);
    } catch (err) {
      console.error(err);
      alert("PDF generation failed");
    } finally {
      if (isVendor) setIsGeneratingVendorPDF(false);
      else setIsGeneratingPDF(false);
    }
  };

  /* ---------------- ADD ROOM HANDLER ---------------- */
  const handleAddRoom = async () => {
    if (!formData.mobile || formData.occupants.some(o => !o.firstName?.trim() || !o.lastName?.trim())) {
      showToast("Please fill all fields", "error");
      return;
    }

    const isLeaderRoom = roomType === "leader";
    const confirmMsg = isLeaderRoom
      ? "Are you sure you want to add this Leader Room?"
      : "Are you sure you want to add this Guest Room?";

    // Show cute confirmation
    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      const payload = {
        tourId: selectedTourId,
        sharingType: formData.sharingType,
        mobile: formData.mobile.trim(),
        occupants: formData.occupants.map(o => ({
          firstName: o.firstName,
          lastName: o.lastName,
          gender: o.sharingType === "withBerth" || o.sharingType === "withoutBerth" ? "Male" : o.gender,
          sharingType: o.sharingType || undefined,
        })),
      };


      let response;
      if (roomType === "guest") {
        response = await addGuestRoom(payload);
      } else {
        response = await addLeaderRoom(payload);
      }

      await getManualRooms(selectedTourId);
      await getRoomAllocation(selectedTourId);

      showToast(
        response?.data?.message ||
        `${isLeaderRoom ? "Leader" : "Guest"} Room added successfully!`
      );

      setShowAddModal(false);
      setFormData({
        sharingType: "double",
        mobile: "",
        occupants: [{ firstName: "", lastName: "", gender: "Male" }]
      });

    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || "Failed to add room", "error");
    }
  };

  const addOccupant = () => {
    setFormData(prev => ({
      ...prev,
      occupants: [...prev.occupants, { firstName: "", lastName: "", gender: "Male" }]
    }));
  };

  const removeOccupant = (index) => {
    if (formData.occupants.length === 1) return;
    setFormData(prev => ({
      ...prev,
      occupants: prev.occupants.filter((_, i) => i !== index)
    }));
  };
  const handleDeleteLeaderRoom = async (roomId) => {
    if (!window.confirm("Delete this Leader Room?")) return;
    try {
      const response = await deleteLeaderRoom(selectedTourId, roomId);
      await getManualRooms(selectedTourId);
      await getRoomAllocation(selectedTourId);
      showToast(response?.data?.message || "Leader Room deleted successfully!");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || "Failed to delete room", "error");
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10">
          Tour Room Allocation
        </h1>

        {/* Tour Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-10">
          <select
            className="w-full max-w-lg mx-auto block border-2 border-gray-300 rounded-lg px-5 py-4 text-lg focus:border-blue-500 focus:outline-none transition"
            value={selectedTourId}
            onChange={(e) => setSelectedTourId(e.target.value)}
          >
            <option value="">-- Select Tour --</option>
            {tourList.map((t) => (
              <option key={t._id} value={t._id}>{t.title}</option>
            ))}
          </select>
        </div>

        {roomAllocationLoading && (
          <div className="text-center text-blue-600 text-xl font-medium">
            Loading room allocation...
          </div>
        )}

        {roomAllocationError && (
          <div className="text-center text-red-600 text-xl font-medium bg-red-50 py-4 rounded-lg">
            {roomAllocationError}
          </div>
        )}

        {selectedTourId &&
          !roomAllocationLoading &&
          !roomAllocationError &&
          allRooms.length === 0 && (
            <div className="text-center text-gray-600 text-xl bg-gray-100 py-10 rounded-xl">
              No room allocations found for this tour.
            </div>
          )}

        {allRooms.length > 0 && (
          <>
            {/* Add Guest & Leader Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() => { setRoomType("guest"); setShowAddModal(true); }}
                style={{
                  background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
                  border: "none",
                  color: "white",
                  fontWeight: "bold",
                  padding: "16px 32px",
                  borderRadius: "16px",
                  fontSize: "15pt",
                  boxShadow: "0 4px 20px rgba(168,85,247,0.4)",
                  cursor: "pointer",
                }}
              >
                🛎️ Add Guest Room
              </button>

              <button
                onClick={() => { setRoomType("leader"); setShowAddModal(true); }}
                style={{
                  background: "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)",
                  border: "none",
                  color: "white",
                  fontWeight: "bold",
                  padding: "16px 32px",
                  borderRadius: "16px",
                  fontSize: "15pt",
                  boxShadow: "0 4px 20px rgba(251,146,60,0.4)",
                  cursor: "pointer",
                }}
              >
                👑 Add Leader Room
              </button>
            </div>

            {/* Existing Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <button
                onClick={() => exportToPDF(false)}
                disabled={isGeneratingPDF}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-10 rounded-xl text-lg shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition transform hover:scale-105"
              >
                {isGeneratingPDF ? "Generating..." : "Download Full PDF"}
              </button>

              <button
                onClick={() => exportToPDF(true)}
                disabled={isGeneratingVendorPDF}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-4 px-10 rounded-xl text-lg shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition transform hover:scale-105"
              >
                {isGeneratingVendorPDF ? "Generating..." : "Download Vendor File"}
              </button>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-white-300 text-blue py-8 px-6">
                <h2 className="text-3xl font-bold text-center">
                  {selectedTour?.title}
                </h2>
                {hasFamilies && (
                  <p className="text-center mt-4 text-black-100 italic text-lg">
                    Rooms grouped by family (F1, F2, F3...)
                  </p>
                )}
              </div>

              <div className="p-6 lg:p-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
                  <StatBox label="Total Rooms" value={roomStats.total} color="blue" />
                  <StatBox label="Single" value={roomStats.single} color="amber" />
                  <StatBox label="Double" value={roomStats.double} color="emerald" />
                  <StatBox label="Triple" value={roomStats.triple} color="purple" />
                  <StatBox label="Quad" value={roomStats.quad} color="rose" />
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center border-b-2 border-gray-200 pb-4">
                  Room Details
                </h3>

                {/* Room Grid */}
                {/* Room Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {allRooms.map((room, idx) => {
                    const family = familyLabels[room.contactMobile];
                    const isManual = room.isManual;
                    const isLeader = room.type === "leader";

                    return (
                      <div
                        key={idx}
                        className={`border-2 rounded-3xl p-6 shadow hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative
                           ${isManual
                            ? isLeader
                              ? "border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50"
                              : "border-purple-300 bg-gradient-to-br from-purple-50 to-violet-50"
                            : "bg-gray-50 border-gray-200"
                          }`}
                      >
                        <div>
                          {/* Top Row - Room Number + Badge */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="text-2xl font-bold text-gray-800">
                              Room {room.roomNumber}
                            </div>

                            {isManual && (
                              <span className={`px-4 py-1 rounded-2xl text-sm font-bold flex items-center gap-1 ${isLeader
                                ? "bg-orange-100 text-orange-700"
                                : "bg-purple-100 text-purple-700"
                                }`}>
                                {isLeader ? "Leader" : "Guest"}
                              </span>
                            )}

                            {family && !isManual && (
                              <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-sm">
                                {family}
                              </span>
                            )}
                          </div>

                          {/* Mobile Number + Delete Button */}
                          <div className="text-center text-gray-600 mb-4 relative">
                            Mob: {room.contactMobile}

                            {/* Professional Delete Button */}
                            {isLeader && room._id && (
                              <button
                                onClick={() => handleDeleteLeaderRoom(room._id)}
                                className="absolute right--2 top-1/2 -translate-y-1/2 p-2 text-red-600  rounded-xl transition-all duration-200 hover:scale-110"
                                title="Delete Leader Room"
                              >
                                <Trash2 size={22} />
                              </button>
                            )}
                          </div>

                          <div
                            className={`inline-block mx-auto px-6 py-2 rounded-full font-semibold text-sm ${getEffectiveSharingCount(room.occupants) === 1
                              ? "bg-amber-100 text-amber-800"
                              : getEffectiveSharingCount(room.occupants) === 2
                                ? "bg-blue-100 text-blue-800"
                                : getEffectiveSharingCount(room.occupants) === 3
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                          >
                            {getSharingLabel(getEffectiveSharingCount(room.occupants))} SHARING
                          </div>
                        </div>

                        {/* Occupants Display - Only "Child" Mention */}
                        <div className="mt-6 space-y-2">
                          {room.occupants.map((p, i) => {
                            let extra = "";
                            let badgeStyle = {};

                            if (p.sharingType === "withBerth") {
                              extra = "CWB";
                              badgeStyle = { color: "#15803d", background: "#dcfce7", padding: "1px 6px", borderRadius: "8px", fontSize: "11px", fontWeight: "bold", marginLeft: "4px" };
                            } else if (p.sharingType === "withoutBerth") {
                              extra = "CNB";
                              badgeStyle = { color: "#dc2626", background: "#fee2e2", padding: "1px 6px", borderRadius: "8px", fontSize: "11px", fontWeight: "bold", marginLeft: "4px" };
                            }

                            return (
                              <div key={i} className="text-sm font-medium text-gray-700">
                                {p.firstName} {p.lastName}{" "}
                                <span className="text-gray-500">({p.gender})</span>
                                {extra && <span style={badgeStyle}>{extra}</span>}
                              </div>
                            );
                          })}
                        </div>

                        <div className="border-t border-dashed border-gray-300 mt-6 pt-4 text-center text-xs text-gray-500">
                          Physical Room No:
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ================= ADD ROOM MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div
            className={`bg-white rounded-3xl p-8 w-full max-w-md max-h-[92vh] overflow-auto shadow-2xl border-4 ${roomType === "guest"
              ? "border-purple-200"
              : "border-orange-200"
              }`}
          >
            <h2 className={`text-3xl font-bold mb-6 text-center ${roomType === "guest" ? "text-purple-700" : "text-orange-700"
              }`}>
              Add {roomType === "guest" ? "Guest" : "Leader"} Room
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700">Mobile Number</label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-300 rounded-2xl px-5 py-4 text-lg focus:border-purple-500 focus:outline-none"
                  placeholder="9876543210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700">Sharing Type</label>
                <select
                  className="w-full border-2 border-gray-300 rounded-2xl px-5 py-4 text-lg focus:border-purple-500 focus:outline-none"
                  value={formData.sharingType}
                  onChange={(e) => setFormData({ ...formData, sharingType: e.target.value })}
                >
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="triple">Triple</option>
                  <option value="quad">Quad</option>
                </select>
              </div>

              {/* Occupants */}
              {formData.occupants.map((occ, index) => (
                <div key={index} className={`border-2 rounded-3xl p-5 relative ${roomType === "guest" ? "border-purple-100 bg-purple-50" : "border-orange-100 bg-orange-50"
                  }`}>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      placeholder="First Name"
                      className="border border-gray-300 rounded-2xl px-4 py-3"
                      value={occ.firstName}
                      onChange={(e) => {
                        const newOcc = [...formData.occupants];
                        newOcc[index].firstName = e.target.value;
                        setFormData({ ...formData, occupants: newOcc });
                      }}
                    />
                    <input
                      placeholder="Last Name"
                      className="border border-gray-300 rounded-2xl px-4 py-3"
                      value={occ.lastName}
                      onChange={(e) => {
                        const newOcc = [...formData.occupants];
                        newOcc[index].lastName = e.target.value;
                        setFormData({ ...formData, occupants: newOcc });
                      }}
                    />
                  </div>

                  <select
                    className="mt-4 w-full border border-gray-300 rounded-2xl px-4 py-3"
                    value={occ.sharingType || occ.gender}
                    onChange={(e) => {
                      const newOcc = [...formData.occupants];
                      const val = e.target.value;
                      if (val === "withBerth" || val === "withoutBerth") {
                        newOcc[index].gender = "Male";
                        newOcc[index].sharingType = val;
                      } else {
                        newOcc[index].gender = val;
                        newOcc[index].sharingType = undefined;
                      }
                      setFormData({ ...formData, occupants: newOcc });
                    }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    {roomType === "guest" && (
                      <>
                        <option value="withBerth">Child With Berth (CWB)</option>
                        <option value="withoutBerth">Child Without Berth (CNB)</option>
                      </>
                    )}
                  </select>

                  {formData.occupants.length > 1 && (
                    <button
                      onClick={() => removeOccupant(index)}
                      className="absolute -top-3 -right-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full hover:bg-red-600 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={addOccupant}
                className={`text-sm font-medium flex items-center gap-1 ${roomType === "guest" ? "text-purple-600" : "text-orange-600"
                  }`}
              >
                + Add Another Occupant
              </button>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-4 border-2 border-gray-300 rounded-2xl font-medium text-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRoom}
                className={`flex-1 py-4 rounded-2xl font-bold text-lg text-white ${roomType === "guest"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-orange-600 hover:bg-orange-700"
                  }`}
              >
                Save {roomType === "guest" ? "Guest" : "Leader"} Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= OFFSCREEN PDFs ================= */}
      <style>{pdfStyles}</style>

      {/* ADMIN PDF */}
      <div style={{ position: "absolute", left: "-9999px", width: "297mm" }}>
        <div className="pdf-page admin-pdf-page">
          <div style={{ textAlign: "center", marginBottom: "8mm" }}>
            <div style={{ fontSize: "20pt", fontWeight: "bold", color: "#1e40af" }}>
              {COMPANY_NAME}
            </div>
            <div style={{ fontSize: "12pt", color: "#4b5563" }}>
              {COMPANY_ADDRESS}
            </div>
          </div>

          <h1 style={{ textAlign: "center", fontSize: "28pt", color: "#1e40af", margin: "10mm 0" }}>
            Room Allocation Report
          </h1>
          <h2 style={{ textAlign: "center", fontSize: "22pt", fontWeight: "bold" }}>
            {selectedTour?.title}
          </h2>

          <div style={{ marginTop: "15mm", fontSize: "14pt", fontWeight: "bold", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "flex-start", gap: "80mm", maxWidth: "240mm", margin: "0 auto" }}>
              <div>Hotel Name:</div>
              <div>Check-in Date:</div>
            </div>
            <div style={{ width: "100%", marginTop: "5mm", textAlign: "left", maxWidth: "240mm", marginLeft: "auto", marginRight: "auto" }}>
              Place:
            </div>
          </div>

          {hasFamilies && (
            <p style={{ textAlign: "center", color: "#dc2626", fontStyle: "italic", marginTop: "15mm" }}>
              * Rooms are grouped by contact mobile number (F1, F2, F3, etc.)
            </p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "10mm", marginTop: "15mm" }}>
            <Stat label="Total" value={roomStats.total} isPDF />
            <Stat label="Single" value={roomStats.single} isPDF />
            <Stat label="Double" value={roomStats.double} isPDF />
            <Stat label="Triple" value={roomStats.triple} isPDF />
            <Stat label="Quad" value={roomStats.quad} isPDF />
          </div>
        </div>

        {/* Subsequent Pages - Admin */}
        {roomChunks.map((chunk, pageIndex) => (
          <div className="pdf-page admin-pdf-page" key={`admin-${pageIndex}`}>
            <div className="room-grid">
              {chunk.map((room, idx) => {
                const family = familyLabels[room.contactMobile];
                const runningRoomIndex = pageIndex * CHUNK_SIZE + idx + 1;
                return (
                  <div className="room-card" key={idx}
                    style={{
                      background: room.isManual
                        ? room.type === "leader" ? "#fff7ed" : "#faf5ff"
                        : "white",
                      borderColor: room.isManual
                        ? room.type === "leader" ? "#fdba74" : "#d8b4fe"
                        : "#333"
                    }}>
                    <div>
                      <div className="room-title" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span>Room {room.roomNumber}</span>

                        {family && <span className="family-badge">({family})</span>}

                        {room.isManual && (
                          <span style={{
                            fontSize: "11.5pt",
                            fontWeight: "bold",
                            color: room.type === "leader" ? "#c2410c" : "#7e22ce",
                            whiteSpace: "nowrap"
                          }}>
                            ({room.type === "leader" ? "Leader" : "Guest"})
                          </span>
                        )}
                      </div>
                      <div className="mobile">Mob: {room.contactMobile}</div>
                      <div className="sharing">
                        {getSharingLabel(getEffectiveSharingCount(room.occupants))} SHARING                      </div>
                    </div>
                    {room.occupants.map((p, i) => {
                      let extra = "";
                      let extraStyle = {};

                      if (p.sharingType === "withBerth") {
                        extra = "CWB";
                        extraStyle = {
                          color: "#15803d",
                          padding: "1px 5px",
                          fontSize: "9pt",
                          fontWeight: "bold",
                          marginLeft: "3px",
                          display: "inline-block",
                        };
                      } else if (p.sharingType === "withoutBerth") {
                        extra = "CNB";
                        extraStyle = {
                          color: "#dc2626",
                          padding: "1px 5px",
                          fontSize: "9pt",
                          fontWeight: "bold",
                          marginLeft: "3px",
                          display: "inline-block",
                        };
                      }

                      return (
                        <div className="guest" key={i}>
                          {p.firstName} {p.lastName} ({p.gender})
                          {extra && <span style={extraStyle}>{extra}</span>}
                        </div>
                      );
                    })}
                    <div style={{ borderTop: "1px dashed #333", textAlign: "center", fontSize: "9pt", paddingTop: "2mm" }}>
                      Physical Room No:
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* VENDOR PDF */}
      <div style={{ position: "absolute", left: "-9999px", width: "297mm" }}>
        <div className="pdf-page vendor-pdf-page">
          <div style={{ textAlign: "center", marginBottom: "8mm" }}>
            <div style={{ fontSize: "20pt", fontWeight: "bold", color: "#059669" }}>
              {COMPANY_NAME}
            </div>
            <div style={{ fontSize: "12pt", color: "#4b5563" }}>
              {COMPANY_ADDRESS}
            </div>
          </div>

          <h1 style={{ textAlign: "center", fontSize: "28pt", color: "#059669", margin: "10mm 0" }}>
            Room Allocation - Vendor Copy
          </h1>
          <h2 style={{ textAlign: "center", fontSize: "22pt", fontWeight: "bold" }}>
            {selectedTour?.title}
          </h2>

          <div style={{ marginTop: "15mm", fontSize: "14pt", fontWeight: "bold", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "flex-start", gap: "80mm", maxWidth: "240mm", margin: "0 auto" }}>
              <div>Hotel Name:</div>
              <div>Check-in Date:</div>
            </div>
            <div style={{ width: "100%", marginTop: "5mm", textAlign: "left", maxWidth: "240mm", marginLeft: "auto", marginRight: "auto" }}>
              Place:
            </div>
          </div>

          {hasFamilies && (
            <p style={{ textAlign: "center", color: "#dc2626", fontStyle: "italic", marginTop: "15mm" }}>
              * Rooms are grouped by family (F1, F2, F3, etc.)
            </p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "10mm", marginTop: "15mm" }}>
            <Stat label="Total" value={roomStats.total} isPDF />
            <Stat label="Single" value={roomStats.single} isPDF />
            <Stat label="Double" value={roomStats.double} isPDF />
            <Stat label="Triple" value={roomStats.triple} isPDF />
            <Stat label="Quad" value={roomStats.quad} isPDF />
          </div>
        </div>

        {/* Subsequent Pages - Vendor */}
        {roomChunks.map((chunk, pageIndex) => (
          <div className="pdf-page vendor-pdf-page" key={`vendor-${pageIndex}`}>
            <div className="room-grid">
              {chunk.map((room, idx) => {
                const family = familyLabels[room.contactMobile];
                const runningRoomIndex = pageIndex * CHUNK_SIZE + idx + 1;
                return (
                  <div className="room-card" key={idx}
                    style={{
                      background: room.isManual
                        ? room.type === "leader" ? "#fff7ed" : "#faf5ff"
                        : "white",
                      borderColor: room.isManual
                        ? room.type === "leader" ? "#fdba74" : "#d8b4fe"
                        : "#333"
                    }}>
                    <div>
                      <div className="room-title" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span>Room {room.roomNumber}</span>

                        {family && <span className="family-badge">({family})</span>}

                        {room.isManual && (
                          <span style={{
                            fontSize: "11.5pt",
                            fontWeight: "bold",
                            color: room.type === "leader" ? "#c2410c" : "#7e22ce",
                            whiteSpace: "nowrap"
                          }}>
                            ({room.type === "leader" ? "Leader" : "Guest"})
                          </span>
                        )}
                      </div>
                      {/* Mobile hidden in vendor copy */}
                      <div className="sharing" style={{ marginTop: "8mm" }}>
                        {getSharingLabel(getEffectiveSharingCount(room.occupants))} SHARING
                      </div>
                    </div>
                    <div>
                      {room.occupants.map((p, i) => {
                        let extra = "";
                        let extraStyle = {};

                        if (p.sharingType === "withBerth") {
                          extra = "CWB";
                          extraStyle = {
                            color: "#15803d",
                            padding: "1px 5px",
                            fontSize: "9pt",
                            fontWeight: "bold",
                            marginLeft: "3px",
                            display: "inline-block",
                          };
                        } else if (p.sharingType === "withoutBerth") {
                          extra = "CNB";
                          extraStyle = {
                            color: "#dc2626",
                            padding: "1px 5px",
                            fontSize: "9pt",
                            fontWeight: "bold",
                            marginLeft: "3px",
                            display: "inline-block",
                          };
                        }

                        return (
                          <div className="guest" key={i}>
                            {p.firstName} {p.lastName} ({p.gender})
                            {extra && <span style={extraStyle}>{extra}</span>}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{
                      borderTop: "1px dashed #333",
                      textAlign: "center",
                      fontSize: "9pt",
                      paddingTop: "2mm",
                    }}>
                      Physical Room No:
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ===== TOAST ===== */}
      {toast && (
        <div style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 9999,
          background: "white",
          color: "#1f2937",
          padding: "16px 20px",
          borderRadius: "12px",
          fontWeight: "600",
          fontSize: "14px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          minWidth: "280px",
          borderLeft: `5px solid ${toast.type === "success" ? "#22c55e" : "#ef4444"}`,
          animation: "slideIn 0.3s ease",
        }}>
          <span style={{ fontSize: "20px" }}>
            {toast.type === "success" ? "✅" : "❌"}
          </span>
          <span>{toast.message}</span>
          <span
            onClick={() => setToast(null)}
            style={{ marginLeft: "auto", cursor: "pointer", color: "#9ca3af", fontSize: "16px" }}
          >
          </span>
        </div>
      )}

      <style>{`
  @keyframes slideIn {
    from { transform: translateX(120px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`}</style>


      {/* Confirm Leave Modal */}
      {showConfirmLeave && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem 1.5rem',
              maxWidth: '420px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)'
            }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
              Leave this page?
            </h2>

            <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Room allocation for <strong>{selectedTour?.title || "this tour"}</strong> is currently shown.<br />
              Leaving will clear your selection.<br />
              Are you sure you want to leave?
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={handleCancelLeave}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#e5e7eb',
                  color: '#1f2937',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel (Stay)
              </button>

              <button
                onClick={handleConfirmLeave}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer'
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
/* Shared PDF Styles */
const pdfStyles = `
  .pdf-page { width:297mm;height:210mm;padding:12mm;background:white; }
  .room-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:10mm; }
  .room-card { border:2px solid #333;border-radius:8px;padding:10mm;height:85mm;display:flex;flex-direction:column;justify-content:space-between; }
  .room-title { font-size:15pt;font-weight:bold;text-align:center; }
  .family-badge { color:#d32f2f;font-weight:bold;margin-left:6mm; }
  .mobile { text-align:center;font-size:10pt;margin:4mm 0;color:#1976d2; }
  .sharing { text-align:center;font-size:10pt;font-weight:bold; }
  .guest { font-size:10pt;margin-bottom:2mm; }
`;

/* Stat Components */
const StatBox = ({ label, value, color }) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    rose: "bg-rose-100 text-rose-800 border-rose-200",
  };

  return (
    <div
      className={`border-2 ${colorClasses[color]} rounded-xl p-6 text-center shadow-sm`}
    >
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm mt-2">{label}</div>
    </div>
  );
};

const Stat = ({ label, value, isPDF }) => {
  if (isPDF) {
    return (
      <div
        style={{
          border: "2px solid #333",
          borderRadius: "8px",
          padding: "10mm",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "24pt", fontWeight: "bold" }}>{value}</div>
        <div style={{ fontSize: "12pt" }}>{label}</div>
      </div>
    );
  }
  return null;
};

export default TourRoomList;

