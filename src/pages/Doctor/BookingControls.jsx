// import React, { useState, useContext, useEffect } from "react";
// import { TourContext } from "../../context/TourContext";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const BookingControls = () => {
//   const {
//     viewTourBalance,
//     updateTourBalance,
//     balanceDetails,
//     viewTourAdvance,
//     updateTourAdvance,
//     advanceDetails,
//   } = useContext(TourContext);

//   const [tnr, setTnr] = useState("");
//   const [balanceUpdates, setBalanceUpdates] = useState([
//     { remarks: "", amount: "" },
//   ]);
//   const [advanceUpdates, setAdvanceUpdates] = useState([
//     { remarks: "", amount: "" },
//   ]);
//   const [isLoading, setIsLoading] = useState(false);

//   // ──────────────────────────────────────────────
//   // UNSAVED CHANGES + BACK/SWIPE PROTECTION
//   // ──────────────────────────────────────────────
//   const [formIsDirty, setFormIsDirty] = useState(false);
//   const [showBackConfirm, setShowBackConfirm] = useState(false);

//   // Detect unsaved changes
//   useEffect(() => {
//     const hasChanges =
//       tnr.trim() !== "" ||
//       balanceUpdates.some((u) => u.remarks.trim() || u.amount.trim()) ||
//       advanceUpdates.some((u) => u.remarks.trim() || u.amount.trim());

//     setFormIsDirty(hasChanges);
//   }, [tnr, balanceUpdates, advanceUpdates]);

//   // Browser refresh / tab close protection
//   useEffect(() => {
//     if (!formIsDirty) return;

//     const handleBeforeUnload = (event) => {
//       event.preventDefault();
//       event.returnValue =
//         "You have unsaved changes. Are you sure you want to leave?";
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);
//     return () => window.removeEventListener("beforeunload", handleBeforeUnload);
//   }, [formIsDirty]);

//   // Back button / swipe protection
//   useEffect(() => {
//     if (!formIsDirty) return;

//     window.history.pushState(null, null, window.location.href);

//     const handlePopState = (event) => {
//       event.preventDefault();
//       setShowBackConfirm(true);
//     };

//     window.addEventListener("popstate", handlePopState);
//     return () => window.removeEventListener("popstate", handlePopState);
//   }, [formIsDirty]);

//   const handleTnrChange = (e) => {
//     const value = e.target.value.toUpperCase().trim();
//     setTnr(value);
//   };

//   // ==================== BALANCE SECTION ====================
//   const handleViewBalance = async () => {
//     if (tnr.length !== 6) return; // No toast here — just disable button

//     setIsLoading(true);
//     const result = await viewTourBalance(tnr);
//     setIsLoading(false);

//     // Toast is now only in context function if fails
//   };

//   const handleBalanceChange = (index, field, value) => {
//     const newUpdates = [...balanceUpdates];
//     newUpdates[index] = { ...newUpdates[index], [field]: value || "" };
//     setBalanceUpdates(newUpdates);
//   };

//   const addBalanceField = () =>
//     setBalanceUpdates([...balanceUpdates, { remarks: "", amount: "" }]);

//   const removeBalanceField = (index) => {
//     if (balanceUpdates.length <= 1) return;
//     if (window.confirm("Remove this update?")) {
//       const filtered = balanceUpdates.filter((_, i) => i !== index);
//       setBalanceUpdates(
//         filtered.length ? filtered : [{ remarks: "", amount: "" }],
//       );
//     }
//   };

//   const handleUpdateBalance = async () => {
//     if (tnr.length !== 6) return toast.error("Valid 6-character TNR required");

//     const validUpdates = balanceUpdates
//       .map((u) => ({
//         remarks: u.remarks.trim(),
//         amount: u.amount.trim() === "" ? undefined : Number(u.amount),
//       }))
//       .filter((u) => u.amount !== undefined && !isNaN(u.amount));

//     if (validUpdates.length === 0)
//       return toast.error("Add at least one valid amount");

//     setIsLoading(true);
//     const result = await updateTourBalance(tnr, validUpdates);
//     setIsLoading(false);

//     if (result?.success) {
//       setBalanceUpdates([{ remarks: "", amount: "" }]);
//       toast.success("Balance updated successfully!");
//     } else {
//       toast.error(result?.message || "Failed to update balance");
//     }
//   };

//   // ==================== ADVANCE SECTION ====================
//   const handleViewAdvance = async () => {
//     if (tnr.length !== 6) return; // No toast here — just disable button

//     setIsLoading(true);
//     const result = await viewTourAdvance(tnr);
//     setIsLoading(false);

//     // Toast is now only in context function if fails
//   };

//   const handleAdvanceChange = (index, field, value) => {
//     const newUpdates = [...advanceUpdates];
//     newUpdates[index] = { ...newUpdates[index], [field]: value || "" };
//     setAdvanceUpdates(newUpdates);
//   };

//   const addAdvanceField = () =>
//     setAdvanceUpdates([...advanceUpdates, { remarks: "", amount: "" }]);

//   const removeAdvanceField = (index) => {
//     if (advanceUpdates.length <= 1) return;
//     if (window.confirm("Remove this update?")) {
//       const filtered = advanceUpdates.filter((_, i) => i !== index);
//       setAdvanceUpdates(
//         filtered.length ? filtered : [{ remarks: "", amount: "" }],
//       );
//     }
//   };

//   const handleUpdateAdvance = async () => {
//     if (tnr.length !== 6) return toast.error("Valid 6-character TNR required");

//     const validUpdates = advanceUpdates
//       .map((u) => ({
//         remarks: u.remarks.trim(),
//         amount: u.amount.trim() === "" ? undefined : Number(u.amount),
//       }))
//       .filter(
//         (u) => u.amount !== undefined && !isNaN(u.amount) && u.amount > 0,
//       );

//     if (validUpdates.length === 0)
//       return toast.error("Add at least one positive amount");

//     setIsLoading(true);
//     const result = await updateTourAdvance(tnr, validUpdates);
//     setIsLoading(false);

//     if (result?.success) {
//       setAdvanceUpdates([{ remarks: "", amount: "" }]);
//       toast.success("Advance shifted to balance successfully!");
//     } else {
//       toast.error(result?.message || "Failed to update advance");
//     }
//   };

//   // Helper: render amount with red if negative
//   const renderAmount = (amount) => {
//     const num = Number(amount);
//     if (isNaN(num)) return <span>₹0</span>;
//     return (
//       <span className={num < 0 ? "text-red-600 font-bold" : ""}>
//         ₹{Math.abs(num).toLocaleString("en-IN")}
//       </span>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10">
//       <ToastContainer position="top-right" autoClose={3000} newestOnTop />

//       {/* Shared TNR Input */}
//       <div className="max-w-4xl mx-auto mb-10">
//         <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
//           <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
//             Payment Controller (TNR)
//           </h2>
//           <div className="flex flex-col md:flex-row gap-4 items-end">
//             <div className="flex-1">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Enter 6-character TNR
//               </label>
//               <input
//                 type="text"
//                 value={tnr}
//                 onChange={handleTnrChange}
//                 placeholder="e.g. K7P9M2"
//                 maxLength={6}
//                 className="w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xl uppercase tracking-widest font-mono transition"
//               />
//             </div>
//             <div className="flex gap-4 w-full md:w-auto">
//               <button
//                 onClick={handleViewBalance}
//                 disabled={isLoading || tnr.length !== 6}
//                 className="flex-1 md:flex-none px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg transition shadow-md"
//               >
//                 View Balance
//               </button>
//               <button
//                 onClick={handleViewAdvance}
//                 disabled={isLoading || tnr.length !== 6}
//                 className="flex-1 md:flex-none px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg transition shadow-md"
//               >
//                 View Advance
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-5xl mx-auto space-y-12">
//         {/* BALANCE SECTION */}
//         <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
//           <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
//             Balance Controller
//           </h2>

//           {balanceDetails && (
//             <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
//               <h3 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-3">
//                 Current Balance (TNR:{" "}
//                 <span className="font-mono text-indigo-700">{tnr}</span>)
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
//                 <div>
//                   <p>
//                     <strong>Advance Amount:</strong>{" "}
//                     {renderAmount(balanceDetails?.advance?.amount ?? 0)}
//                   </p>
//                   <p>
//                     <strong>Balance Amount:</strong>{" "}
//                     {renderAmount(balanceDetails?.balance?.amount ?? 0)}
//                   </p>
//                 </div>
//                 <div>
//                   <h4 className="font-semibold mb-2">Admin Remarks:</h4>
//                   {Array.isArray(balanceDetails?.adminRemarks) &&
//                   balanceDetails.adminRemarks.length > 0 ? (
//                     <ul className="space-y-3 text-base">
//                       {balanceDetails.adminRemarks.map((r, i) => (
//                         <li
//                           key={i}
//                           className="bg-white p-3 rounded-lg shadow-sm"
//                         >
//                           <span className="font-medium text-gray-600">
//                             {new Date(r.addedAt).toLocaleString("en-IN", {
//                               dateStyle: "medium",
//                               timeStyle: "short",
//                             })}
//                           </span>
//                           <br />
//                           {r.remark || "No remark"}{" "}
//                           {renderAmount(r.amount ?? 0)}
//                         </li>
//                       ))}
//                     </ul>
//                   ) : (
//                     <p className="text-gray-500 italic">No remarks yet</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           <div>
//             <h3 className="text-2xl font-semibold text-gray-700 mb-6">
//               Adjust Balance (add / deduct)
//             </h3>
//             {balanceUpdates.map((u, i) => (
//               <div
//                 key={i}
//                 className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-50 p-5 rounded-xl border"
//               >
//                 <input
//                   type="text"
//                   placeholder="Remarks (optional)"
//                   value={u.remarks}
//                   onChange={(e) =>
//                     handleBalanceChange(i, "remarks", e.target.value)
//                   }
//                   className="flex-1 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                 />
//                 <input
//                   type="number"
//                   placeholder="Amount (negative = deduct)"
//                   value={u.amount}
//                   onChange={(e) =>
//                     handleBalanceChange(i, "amount", e.target.value)
//                   }
//                   className="w-full md:w-48 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                 />
//                 {balanceUpdates.length > 1 && (
//                   <button
//                     onClick={() => removeBalanceField(i)}
//                     className="px-6 py-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
//                   >
//                     Remove
//                   </button>
//                 )}
//               </div>
//             ))}
//             <button
//               onClick={addBalanceField}
//               className="w-full md:w-auto px-8 py-4 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition font-medium text-lg shadow-md"
//             >
//               + Add Adjustment
//             </button>
//           </div>

//           <button
//             onClick={handleUpdateBalance}
//             disabled={isLoading || tnr.length !== 6}
//             className="mt-8 w-full px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl shadow-lg transition"
//           >
//             {isLoading ? (
//               <span className="flex items-center justify-center gap-3">
//                 <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
//                   <circle
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                     fill="none"
//                   />
//                   <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
//                 </svg>
//                 Updating Balance...
//               </span>
//             ) : (
//               "Update Balance Now"
//             )}
//           </button>
//         </div>

//         {/* ADVANCE SECTION */}
//         <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
//           <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
//             Advance Controller
//           </h2>

//           {advanceDetails && (
//             <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
//               <h3 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-3">
//                 Current Advance (TNR:{" "}
//                 <span className="font-mono text-indigo-700">{tnr}</span>)
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
//                 <div>
//                   <p>
//                     <strong>Advance Amount:</strong>{" "}
//                     {renderAmount(advanceDetails?.advance?.amount ?? 0)}
//                   </p>
//                   <p>
//                     <strong>Paid:</strong>{" "}
//                     {advanceDetails?.advance?.paid ? "Yes" : "No"}
//                   </p>
//                   <p>
//                     <strong>Verified:</strong>{" "}
//                     {advanceDetails?.advance?.paymentVerified ? "Yes" : "No"}
//                   </p>
//                   <p>
//                     <strong>Trip Completed:</strong>{" "}
//                     {advanceDetails?.isTripCompleted ? "Yes" : "No"}
//                   </p>
//                 </div>
//                 <div>
//                   <h4 className="font-semibold mb-2">Advance Admin Remarks:</h4>
//                   {Array.isArray(advanceDetails?.advanceAdminRemarks) &&
//                   advanceDetails.advanceAdminRemarks.length > 0 ? (
//                     <ul className="space-y-3 text-base">
//                       {advanceDetails.advanceAdminRemarks.map((r, i) => (
//                         <li
//                           key={i}
//                           className="bg-white p-3 rounded-lg shadow-sm"
//                         >
//                           <span className="font-medium text-gray-600">
//                             {new Date(r.addedAt).toLocaleString("en-IN", {
//                               dateStyle: "medium",
//                               timeStyle: "short",
//                             })}
//                           </span>
//                           <br />
//                           {r.remark || "No remark"}{" "}
//                           {renderAmount(r.amount ?? 0)}
//                         </li>
//                       ))}
//                     </ul>
//                   ) : (
//                     <p className="text-gray-500 italic">No remarks yet</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           <div>
//             <h3 className="text-2xl font-semibold text-gray-700 mb-6">
//               Shift Amount from Advance to Balance
//             </h3>
//             {advanceUpdates.map((u, i) => (
//               <div
//                 key={i}
//                 className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-50 p-5 rounded-xl border"
//               >
//                 <input
//                   type="text"
//                   placeholder="Remarks (optional)"
//                   value={u.remarks}
//                   onChange={(e) =>
//                     handleAdvanceChange(i, "remarks", e.target.value)
//                   }
//                   className="flex-1 p-4 border rounded-lg focus:ring-2 focus:ring-green-500"
//                 />
//                 <input
//                   type="number"
//                   placeholder="Amount to shift (positive)"
//                   value={u.amount}
//                   onChange={(e) =>
//                     handleAdvanceChange(i, "amount", e.target.value)
//                   }
//                   className="w-full md:w-48 p-4 border rounded-lg focus:ring-2 focus:ring-green-500"
//                   min="1"
//                 />
//                 {advanceUpdates.length > 1 && (
//                   <button
//                     onClick={() => removeAdvanceField(i)}
//                     className="px-6 py-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
//                   >
//                     Remove
//                   </button>
//                 )}
//               </div>
//             ))}
//             <button
//               onClick={addAdvanceField}
//               className="w-full md:w-auto px-8 py-4 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition font-medium text-lg shadow-md"
//             >
//               + Add Amount to Shift
//             </button>
//           </div>

//           <button
//             onClick={handleUpdateAdvance}
//             disabled={isLoading || tnr.length !== 6}
//             className="mt-8 w-full px-8 py-5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl shadow-lg transition"
//           >
//             {isLoading ? (
//               <span className="flex items-center justify-center gap-3">
//                 <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
//                   <circle
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                     fill="none"
//                   />
//                   <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
//                 </svg>
//                 Processing...
//               </span>
//             ) : (
//               "Shift Advance to Balance"
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Back/Swipe/Leave Confirmation */}
//       {showBackConfirm && (
//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
//           <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
//             <h2 className="text-2xl font-bold text-gray-800 mb-4">
//               Unsaved Changes
//             </h2>
//             <p className="text-gray-600 mb-6">
//               You have unsaved changes.
//               <br />
//               Going back will lose them.
//               <br />
//               Are you sure?
//             </p>
//             <div className="flex justify-center gap-6">
//               <button
//                 onClick={() => {
//                   setShowBackConfirm(false);
//                   window.history.pushState(null, null, window.location.href);
//                 }}
//                 className="px-8 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition"
//               >
//                 Cancel (Stay)
//               </button>
//               <button
//                 onClick={() => {
//                   setShowBackConfirm(false);
//                   history.back();
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

// export default BookingControls;



// import React, { useState, useContext, useEffect } from "react";
// import { TourContext } from "../../context/TourContext";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const BookingControls = () => {
//   const {
//     viewTourBalance,
//     updateTourBalance,
//     balanceDetails,
//     viewTourAdvance,
//     updateTourAdvance,
//     advanceDetails,
//     updateBalanceRemark,
//     updateAdvanceRemark,
//     deleteBalanceRemark,
//     deleteAdvanceRemark,
//   } = useContext(TourContext);

//   const [tnr, setTnr] = useState("");
//   const [balanceUpdates, setBalanceUpdates] = useState([{ remarks: "", amount: "" }]);
//   const [advanceUpdates, setAdvanceUpdates] = useState([{ remarks: "", amount: "" }]);
//   const [isLoading, setIsLoading] = useState(false);

//   const [editingBalanceIndex, setEditingBalanceIndex] = useState(null);
//   const [editingAdvanceIndex, setEditingAdvanceIndex] = useState(null);
//   const [editRemarkText, setEditRemarkText] = useState("");
//   const [editRemarkAmount, setEditRemarkAmount] = useState("");

//   const [formIsDirty, setFormIsDirty] = useState(false);
//   const [showBackConfirm, setShowBackConfirm] = useState(false);

//   useEffect(() => {
//     const hasChanges =
//       tnr.trim() !== "" ||
//       balanceUpdates.some((u) => u.remarks.trim() || u.amount.trim()) ||
//       advanceUpdates.some((u) => u.remarks.trim() || u.amount.trim());

//     setFormIsDirty(hasChanges);
//   }, [tnr, balanceUpdates, advanceUpdates]);

//   useEffect(() => {
//     if (!formIsDirty) return;
//     const handleBeforeUnload = (event) => {
//       event.preventDefault();
//       event.returnValue = "You have unsaved changes. Are you sure you want to leave?";
//     };
//     window.addEventListener("beforeunload", handleBeforeUnload);
//     return () => window.removeEventListener("beforeunload", handleBeforeUnload);
//   }, [formIsDirty]);

//   useEffect(() => {
//     if (!formIsDirty) return;
//     window.history.pushState(null, null, window.location.href);
//     const handlePopState = () => setShowBackConfirm(true);
//     window.addEventListener("popstate", handlePopState);
//     return () => window.removeEventListener("popstate", handlePopState);
//   }, [formIsDirty]);

//   const handleTnrChange = (e) => {
//     setTnr(e.target.value.toUpperCase().trim());
//   };

//   const handleViewBalance = async () => {
//     if (tnr.length !== 6) return;
//     setIsLoading(true);
//     await viewTourBalance(tnr);
//     setIsLoading(false);
//   };

//   const handleViewAdvance = async () => {
//     if (tnr.length !== 6) return;
//     setIsLoading(true);
//     await viewTourAdvance(tnr);
//     setIsLoading(false);
//   };

//   // Balance Remark Functions
//   const startEditBalance = (index, remark, amount) => {
//     setEditingBalanceIndex(index);
//     setEditRemarkText(remark || "");
//     setEditRemarkAmount(amount || "");
//   };

//   const saveBalanceRemark = async () => {
//     if (editingBalanceIndex === null) return;
//     const result = await updateBalanceRemark(tnr, editingBalanceIndex, editRemarkText, editRemarkAmount);
//     if (result?.success) {
//       await viewTourBalance(tnr);
//       setEditingBalanceIndex(null);
//       setEditRemarkText("");
//       setEditRemarkAmount("");
//       toast.success("Remark updated");
//     }
//   };

//   const deleteBalanceRemarkHandler = async (index) => {
//     if (!window.confirm("Delete this remark?")) return;
//     const result = await deleteBalanceRemark(tnr, index);
//     if (result?.success) {
//       await viewTourBalance(tnr);
//       toast.success("Remark deleted");
//     }
//   };

//   // Advance Remark Functions
//   const startEditAdvance = (index, remark, amount) => {
//     setEditingAdvanceIndex(index);
//     setEditRemarkText(remark || "");
//     setEditRemarkAmount(amount || "");
//   };

//   const saveAdvanceRemark = async () => {
//     if (editingAdvanceIndex === null) return;
//     const result = await updateAdvanceRemark(tnr, editingAdvanceIndex, editRemarkText, editRemarkAmount);
//     if (result?.success) {
//       await viewTourAdvance(tnr);
//       await viewTourBalance(tnr);
//       setEditingAdvanceIndex(null);
//       setEditRemarkText("");
//       setEditRemarkAmount("");
//       toast.success("Remark updated");
//     }
//   };

//   const deleteAdvanceRemarkHandler = async (index) => {
//     if (!window.confirm("Delete this remark?")) return;
//     const result = await deleteAdvanceRemark(tnr, index);
//     if (result?.success) {
//       await viewTourAdvance(tnr);
//       await viewTourBalance(tnr);
//       toast.success("Remark deleted");
//     }
//   };

//   // Existing Functions
//   const handleBalanceChange = (index, field, value) => {
//     const newUpdates = [...balanceUpdates];
//     newUpdates[index] = { ...newUpdates[index], [field]: value || "" };
//     setBalanceUpdates(newUpdates);
//   };

//   const addBalanceField = () => setBalanceUpdates([...balanceUpdates, { remarks: "", amount: "" }]);

//   const removeBalanceField = (index) => {
//     if (balanceUpdates.length <= 1) return;
//     if (window.confirm("Remove this update?")) {
//       const filtered = balanceUpdates.filter((_, i) => i !== index);
//       setBalanceUpdates(filtered.length ? filtered : [{ remarks: "", amount: "" }]);
//     }
//   };

//   const handleUpdateBalance = async () => {
//     if (tnr.length !== 6) return toast.error("Valid 6-character TNR required");

//     const validUpdates = balanceUpdates
//       .map((u) => ({
//         remarks: u.remarks.trim(),
//         amount: u.amount.trim() === "" ? undefined : Number(u.amount),
//       }))
//       .filter((u) => u.amount !== undefined && !isNaN(u.amount));

//     if (validUpdates.length === 0) return toast.error("Add at least one valid amount");

//     setIsLoading(true);
//     const result = await updateTourBalance(tnr, validUpdates);
//     setIsLoading(false);

//     if (result?.success) {
//       setBalanceUpdates([{ remarks: "", amount: "" }]);
//       toast.success("Balance updated!");
//       await viewTourBalance(tnr);
//     } else {
//       toast.error(result?.message || "Failed to update");
//     }
//   };

//   const handleAdvanceChange = (index, field, value) => {
//     const newUpdates = [...advanceUpdates];
//     newUpdates[index] = { ...newUpdates[index], [field]: value || "" };
//     setAdvanceUpdates(newUpdates);
//   };

//   const addAdvanceField = () => setAdvanceUpdates([...advanceUpdates, { remarks: "", amount: "" }]);

//   const removeAdvanceField = (index) => {
//     if (advanceUpdates.length <= 1) return;
//     if (window.confirm("Remove this update?")) {
//       const filtered = advanceUpdates.filter((_, i) => i !== index);
//       setAdvanceUpdates(filtered.length ? filtered : [{ remarks: "", amount: "" }]);
//     }
//   };

//   const handleUpdateAdvance = async () => {
//     if (tnr.length !== 6) return toast.error("Valid 6-character TNR required");

//     const validUpdates = advanceUpdates
//       .map((u) => ({
//         remarks: u.remarks.trim(),
//         amount: u.amount.trim() === "" ? undefined : Number(u.amount),
//       }))
//       .filter((u) => u.amount !== undefined && !isNaN(u.amount) && u.amount > 0);

//     if (validUpdates.length === 0) return toast.error("Add at least one positive amount");

//     setIsLoading(true);
//     const result = await updateTourAdvance(tnr, validUpdates);
//     setIsLoading(false);

//     if (result?.success) {
//       setAdvanceUpdates([{ remarks: "", amount: "" }]);
//       toast.success("Amount shifted successfully!");
//       await viewTourAdvance(tnr);
//       await viewTourBalance(tnr);
//     } else {
//       toast.error(result?.message || "Failed to shift amount");
//     }
//   };

//   // CUTE & SMALLER renderAmount
//   const renderAmount = (amount, isMainAmount = false) => {
//     const num = Number(amount);
//     if (isNaN(num)) return <span className="text-gray-500 text-base">₹0</span>;

//     if (isMainAmount) {
//       return (
//         <span className="text-blue-600 font-semibold text-0.95g">
//           ₹{Math.abs(num).toLocaleString("en-IN")}
//         </span>
//       );
//     }

//     if (num > 0) {
//       return (
//         <span className="text-green-600 font-medium text-base">
//           +₹{num.toLocaleString("en-IN")}
//         </span>
//       );
//     } else if (num < 0) {
//       return (
//         <span className="text-red-600 font-medium text-base">
//           -₹{Math.abs(num).toLocaleString("en-IN")}
//         </span>
//       );
//     } else {
//       return <span className="text-gray-500 text-base">₹0</span>;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10">
//       <ToastContainer position="top-right" autoClose={3000} newestOnTop />

//       {/* TNR Input */}
//       <div className="max-w-4xl mx-auto mb-10">
//         <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
//           <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
//             Payment Controller (TNR)
//           </h2>
//           <div className="flex flex-col md:flex-row gap-4 items-end">
//             <div className="flex-1">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Enter 6-character TNR
//               </label>
//               <input
//                 type="text"
//                 value={tnr}
//                 onChange={handleTnrChange}
//                 placeholder="e.g. K7P9M2"
//                 maxLength={6}
//                 className="w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xl uppercase tracking-widest font-mono transition"
//               />
//             </div>
//             <div className="flex gap-4 w-full md:w-auto">
//               <button
//                 onClick={handleViewBalance}
//                 disabled={isLoading || tnr.length !== 6}
//                 className="flex-1 md:flex-none px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg transition shadow-md"
//               >
//                 View Balance
//               </button>
//               <button
//                 onClick={handleViewAdvance}
//                 disabled={isLoading || tnr.length !== 6}
//                 className="flex-1 md:flex-none px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg transition shadow-md"
//               >
//                 View Advance
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-5xl mx-auto space-y-12">
//         {/* BALANCE SECTION */}
//         <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
//           <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Balance Controller</h2>

//           {balanceDetails && (
//             <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
//                 <div>
//                   <h3 className="text-2xl font-semibold text-gray-700">Current Balance</h3>
//                   <p className="text-0.95g mt-3">
//                     <strong>Advance Amount:</strong> {renderAmount(balanceDetails?.advance?.amount ?? 0, true)}
//                   </p>
//                   <p className="text-0.95g">
//                     <strong>Balance Amount:</strong> {renderAmount(balanceDetails?.balance?.amount ?? 0, true)}
//                   </p>
//                 </div>
//                 <div>
//                   <h3 className="text-2xl font-semibold text-gray-700">Admin Remarks</h3>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 {Array.isArray(balanceDetails.adminRemarks) && balanceDetails.adminRemarks.length > 0 ? (
//                   balanceDetails.adminRemarks.map((r, i) => (
//                     <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border">
//                       {editingBalanceIndex === i ? (
//                         <div className="space-y-3">
//                           <input
//                             type="text"
//                             value={editRemarkText}
//                             onChange={(e) => setEditRemarkText(e.target.value)}
//                             className="w-full p-3 border rounded-lg text-base"
//                             placeholder="Remark"
//                           />
//                           <input
//                             type="number"
//                             value={editRemarkAmount}
//                             onChange={(e) => setEditRemarkAmount(e.target.value)}
//                             className="w-full p-3 border rounded-lg text-base"
//                             placeholder="Amount"
//                           />
//                           <div className="flex gap-3">
//                             <button onClick={saveBalanceRemark} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Save</button>
//                             <button onClick={() => setEditingBalanceIndex(null)} className="px-6 py-2 bg-gray-500 text-white rounded-lg text-sm">Cancel</button>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="flex justify-between items-start">
//                           <div className="flex-1">
//                             <p className="text-xs text-gray-500">
//                               {new Date(r.addedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
//                             </p>
//                             <p className="font-medium text-base mt-1">{r.remark || "No remark"}</p>
//                             <p className="text-lg font-semibold mt-1">
//                               {renderAmount(r.amount)}
//                             </p>
//                           </div>
//                           <div className="flex gap-3">
//                             <button onClick={() => startEditBalance(i, r.remark, r.amount)} className="text-indigo-600 hover:text-indigo-800 text-sm">✏️ Edit</button>
//                             <button onClick={() => deleteBalanceRemarkHandler(i)} className="text-red-600 hover:text-red-800 text-sm">🗑️ Delete</button>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-gray-500 italic text-center py-8">No remarks yet</p>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Adjust Balance Section */}
//           <div>
//             <h3 className="text-2xl font-semibold text-gray-700 mb-6">Adjust Balance (add / deduct)</h3>
//             {balanceUpdates.map((u, i) => (
//               <div key={i} className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-50 p-5 rounded-xl border">
//                 <input
//                   type="text"
//                   placeholder="Remarks (optional)"
//                   value={u.remarks}
//                   onChange={(e) => handleBalanceChange(i, "remarks", e.target.value)}
//                   className="flex-1 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
//                 />
//                 <input
//                   type="number"
//                   placeholder="Amount (negative = deduct)"
//                   value={u.amount}
//                   onChange={(e) => handleBalanceChange(i, "amount", e.target.value)}
//                   className="w-full md:w-48 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
//                 />
//                 {balanceUpdates.length > 1 && (
//                   <button onClick={() => removeBalanceField(i)} className="px-6 py-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium text-sm">
//                     Remove
//                   </button>
//                 )}
//               </div>
//             ))}
//             <button onClick={addBalanceField} className="w-full md:w-auto px-8 py-4 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition font-medium text-base shadow-md">
//               + Add Adjustment
//             </button>
//           </div>

//           <button
//             onClick={handleUpdateBalance}
//             disabled={isLoading || tnr.length !== 6}
//             className="mt-8 w-full px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl shadow-lg transition"
//           >
//             {isLoading ? "Updating Balance..." : "Update Balance Now"}
//           </button>
//         </div>

//         {/* ADVANCE SECTION */}
//         <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
//           <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Advance Controller</h2>

//           {advanceDetails && (
//             <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
//                 <div>
//                   <h3 className="text-2xl font-semibold text-gray-700">Current Advance</h3>
//                   <p className="text-0.8g mt-3">
//                     <strong>Advance Amount:</strong> {renderAmount(advanceDetails?.advance?.amount ?? 0, true)}
//                   </p>
//                 </div>
//                 <div>
//                   <h3 className="text-2xl font-semibold text-gray-700">Advance Remarks</h3>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 {Array.isArray(advanceDetails.advanceAdminRemarks) && advanceDetails.advanceAdminRemarks.length > 0 ? (
//                   advanceDetails.advanceAdminRemarks.map((r, i) => (
//                     <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border">
//                       {editingAdvanceIndex === i ? (
//                         <div className="space-y-3">
//                           <input type="text" value={editRemarkText} onChange={(e) => setEditRemarkText(e.target.value)} className="w-full p-3 border rounded-lg text-base" placeholder="Remark" />
//                           <input type="number" value={editRemarkAmount} onChange={(e) => setEditRemarkAmount(e.target.value)} className="w-full p-3 border rounded-lg text-base" placeholder="Amount" />
//                           <div className="flex gap-3">
//                             <button onClick={saveAdvanceRemark} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Save</button>
//                             <button onClick={() => setEditingAdvanceIndex(null)} className="px-6 py-2 bg-gray-500 text-white rounded-lg text-sm">Cancel</button>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="flex justify-between items-start">
//                           <div className="flex-1">
//                             <p className="text-xs text-gray-500">
//                               {new Date(r.addedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
//                             </p>
//                             <p className="font-medium text-base mt-1">{r.remark || "No remark"}</p>
//                             <p className="text-lg font-semibold mt-1">{renderAmount(r.amount)}</p>
//                           </div>
//                           <div className="flex gap-3">
//                             <button onClick={() => startEditAdvance(i, r.remark, r.amount)} className="text-indigo-600 hover:text-indigo-800 text-sm">✏️ Edit</button>
//                             <button onClick={() => deleteAdvanceRemarkHandler(i)} className="text-red-600 hover:text-red-800 text-sm">🗑️ Delete</button>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-gray-500 italic text-center py-8">No remarks yet</p>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Shift Advance Section */}
//           <div>
//             <h3 className="text-2xl font-semibold text-gray-700 mb-6">Shift Amount from Advance to Balance</h3>
//             {advanceUpdates.map((u, i) => (
//               <div key={i} className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-50 p-5 rounded-xl border">
//                 <input type="text" placeholder="Remarks (optional)" value={u.remarks} onChange={(e) => handleAdvanceChange(i, "remarks", e.target.value)} className="flex-1 p-4 border rounded-lg focus:ring-2 focus:ring-green-500 text-base" />
//                 <input type="number" placeholder="Amount to shift (positive)" value={u.amount} onChange={(e) => handleAdvanceChange(i, "amount", e.target.value)} className="w-full md:w-48 p-4 border rounded-lg focus:ring-2 focus:ring-green-500 text-base" min="1" />
//                 {advanceUpdates.length > 1 && <button onClick={() => removeAdvanceField(i)} className="px-6 py-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium text-sm">Remove</button>}
//               </div>
//             ))}
//             <button onClick={addAdvanceField} className="w-full md:w-auto px-8 py-4 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition font-medium text-base shadow-md">+ Add Amount to Shift</button>
//           </div>

//           <button onClick={handleUpdateAdvance} disabled={isLoading || tnr.length !== 6} className="mt-8 w-full px-8 py-5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl shadow-lg transition">
//             {isLoading ? "Processing..." : "Shift Advance to Balance"}
//           </button>
//         </div>
//       </div>

//       {/* Back Confirmation */}
//       {showBackConfirm && (
//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
//           <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
//             <h2 className="text-2xl font-bold text-gray-800 mb-4">Unsaved Changes</h2>
//             <p className="text-gray-600 mb-6">You have unsaved changes.<br />Going back will lose them.<br />Are you sure?</p>
//             <div className="flex justify-center gap-6">
//               <button onClick={() => { setShowBackConfirm(false); window.history.pushState(null, null, window.location.href); }} className="px-8 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition">Cancel (Stay)</button>
//               <button onClick={() => { setShowBackConfirm(false); history.back(); }} className="px-8 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition">OK (Go Back)</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BookingControls;

import React, { useState, useContext, useEffect } from "react";
import { TourContext } from "../../context/TourContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookingControls = ({
  isAdvancePaid: propAdvancePaid = false,
  isBalancePaid: propBalancePaid = false,
}) => {
  const {
    viewTourBalance,
    updateTourBalance,
    balanceDetails,
    viewTourAdvance,
    updateTourAdvance,
    advanceDetails,
    updateBalanceRemark,
    updateAdvanceRemark,
    deleteBalanceRemark,
    deleteAdvanceRemark,
  } = useContext(TourContext);

  const [tnr, setTnr] = useState("");
  const [balanceUpdates, setBalanceUpdates] = useState([{ remarks: "", amount: "" }]);
  const [advanceUpdates, setAdvanceUpdates] = useState([{ remarks: "", amount: "" }]);
  const [isLoading, setIsLoading] = useState(false);

  const [editingBalanceIndex, setEditingBalanceIndex] = useState(null);
  const [editingAdvanceIndex, setEditingAdvanceIndex] = useState(null);
  const [editRemarkText, setEditRemarkText] = useState("");
  const [editRemarkAmount, setEditRemarkAmount] = useState("");

  const [formIsDirty, setFormIsDirty] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  // AUTO DETECT PAID STATUS FROM API DATA (Most Reliable)
  const isAdvancePaid = advanceDetails?.advance?.paid ?? propAdvancePaid;
  const isBalancePaid = balanceDetails?.balance?.paid ?? propBalancePaid;

  const canEditBalance = !isBalancePaid;
  const canEditAdvance = !isAdvancePaid;

  useEffect(() => {
    const hasChanges =
      tnr.trim() !== "" ||
      balanceUpdates.some((u) => u.remarks.trim() || u.amount.trim()) ||
      advanceUpdates.some((u) => u.remarks.trim() || u.amount.trim());

    setFormIsDirty(hasChanges);
  }, [tnr, balanceUpdates, advanceUpdates]);

  useEffect(() => {
    if (!formIsDirty) return;
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "You have unsaved changes. Are you sure you want to leave?";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formIsDirty]);

  useEffect(() => {
    if (!formIsDirty) return;
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => setShowBackConfirm(true);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [formIsDirty]);

  const handleTnrChange = (e) => {
    setTnr(e.target.value.toUpperCase().trim());
  };

  const handleViewBalance = async () => {
    if (tnr.length !== 6) return;
    setIsLoading(true);
    await viewTourBalance(tnr);
    setIsLoading(false);
  };

  const handleViewAdvance = async () => {
    if (tnr.length !== 6) return;
    setIsLoading(true);
    await viewTourAdvance(tnr);
    setIsLoading(false);
  };

  // ====================== BALANCE REMARKS ======================
  const startEditBalance = (index, remark, amount) => {
    if (!canEditBalance) {
      toast.warning("Balance is already PAID. Cannot edit or delete remarks.");
      return;
    }
    setEditingBalanceIndex(index);
    setEditRemarkText(remark || "");
    setEditRemarkAmount(amount || "");
  };

  const saveBalanceRemark = async () => {
    if (editingBalanceIndex === null) return;
    const result = await updateBalanceRemark(tnr, editingBalanceIndex, editRemarkText, editRemarkAmount);
    if (result?.success) {
      await viewTourBalance(tnr);
      setEditingBalanceIndex(null);
      setEditRemarkText("");
      setEditRemarkAmount("");
      toast.success("Remark updated successfully");
    }
  };

  const deleteBalanceRemarkHandler = async (index) => {
    if (!canEditBalance) {
      toast.warning("Balance is already PAID. Cannot delete remarks.");
      return;
    }
    if (!window.confirm("Delete this remark?")) return;
    const result = await deleteBalanceRemark(tnr, index);
    if (result?.success) {
      await viewTourBalance(tnr);
      toast.success("Remark deleted");
    }
  };

  // ====================== ADVANCE REMARKS ======================
  const startEditAdvance = (index, remark, amount) => {
    if (!canEditAdvance) {
      toast.warning("Advance is already PAID. Cannot edit or delete remarks.");
      return;
    }
    setEditingAdvanceIndex(index);
    setEditRemarkText(remark || "");
    setEditRemarkAmount(amount || "");
  };

  const saveAdvanceRemark = async () => {
    if (editingAdvanceIndex === null) return;
    const result = await updateAdvanceRemark(tnr, editingAdvanceIndex, editRemarkText, editRemarkAmount);
    if (result?.success) {
      await viewTourAdvance(tnr);
      await viewTourBalance(tnr);
      setEditingAdvanceIndex(null);
      setEditRemarkText("");
      setEditRemarkAmount("");
      toast.success("Remark updated successfully");
    }
  };

  const deleteAdvanceRemarkHandler = async (index) => {
    if (!canEditAdvance) {
      toast.warning("Advance is already PAID. Cannot delete remarks.");
      return;
    }
    if (!window.confirm("Delete this remark?")) return;
    const result = await deleteAdvanceRemark(tnr, index);
    if (result?.success) {
      await viewTourAdvance(tnr);
      await viewTourBalance(tnr);
      toast.success("Remark deleted");
    }
  };

  // ====================== OTHER HANDLERS ======================
  const handleBalanceChange = (index, field, value) => {
    const newUpdates = [...balanceUpdates];
    newUpdates[index] = { ...newUpdates[index], [field]: value || "" };
    setBalanceUpdates(newUpdates);
  };

  const addBalanceField = () => setBalanceUpdates([...balanceUpdates, { remarks: "", amount: "" }]);

  const removeBalanceField = (index) => {
    if (balanceUpdates.length <= 1) return;
    if (window.confirm("Remove this update?")) {
      const filtered = balanceUpdates.filter((_, i) => i !== index);
      setBalanceUpdates(filtered.length ? filtered : [{ remarks: "", amount: "" }]);
    }
  };

  const handleUpdateBalance = async () => {
    if (tnr.length !== 6) return toast.error("Valid 6-character TNR required");
    if (isBalancePaid) return toast.error("Balance is already marked as PAID");

    const validUpdates = balanceUpdates
      .map((u) => ({
        remarks: u.remarks.trim(),
        amount: u.amount.trim() === "" ? undefined : Number(u.amount),
      }))
      .filter((u) => u.amount !== undefined && !isNaN(u.amount));

    if (validUpdates.length === 0) return toast.error("Add at least one valid amount");

    setIsLoading(true);
    const result = await updateTourBalance(tnr, validUpdates);
    setIsLoading(false);

    if (result?.success) {
      setBalanceUpdates([{ remarks: "", amount: "" }]);
      toast.success("Balance updated!");
      await viewTourBalance(tnr);
    } else {
      toast.error(result?.message || "Failed to update");
    }
  };

  const handleAdvanceChange = (index, field, value) => {
    const newUpdates = [...advanceUpdates];
    newUpdates[index] = { ...newUpdates[index], [field]: value || "" };
    setAdvanceUpdates(newUpdates);
  };

  const addAdvanceField = () => setAdvanceUpdates([...advanceUpdates, { remarks: "", amount: "" }]);

  const removeAdvanceField = (index) => {
    if (advanceUpdates.length <= 1) return;
    if (window.confirm("Remove this update?")) {
      const filtered = advanceUpdates.filter((_, i) => i !== index);
      setAdvanceUpdates(filtered.length ? filtered : [{ remarks: "", amount: "" }]);
    }
  };

  const handleUpdateAdvance = async () => {
    if (tnr.length !== 6) return toast.error("Valid 6-character TNR required");
    if (isAdvancePaid) return toast.error("Advance is already marked as PAID");

    const validUpdates = advanceUpdates
      .map((u) => ({
        remarks: u.remarks.trim(),
        amount: u.amount.trim() === "" ? undefined : Number(u.amount),
      }))
      .filter((u) => u.amount !== undefined && !isNaN(u.amount) && u.amount > 0);

    if (validUpdates.length === 0) return toast.error("Add at least one positive amount");

    setIsLoading(true);
    const result = await updateTourAdvance(tnr, validUpdates);
    setIsLoading(false);

    if (result?.success) {
      setAdvanceUpdates([{ remarks: "", amount: "" }]);
      toast.success("Amount shifted successfully!");
      await viewTourAdvance(tnr);
      await viewTourBalance(tnr);
    } else {
      toast.error(result?.message || "Failed to shift amount");
    }
  };

  const renderAmount = (amount, isMainAmount = false) => {
    const num = Number(amount);
    if (isNaN(num)) return <span className="text-gray-500 text-base">₹0</span>;

    if (isMainAmount) {
      return (
        <span className="text-blue-600 font-semibold text-0.95g">
          ₹{Math.abs(num).toLocaleString("en-IN")}
        </span>
      );
    }

    if (num > 0) {
      return (
        <span className="text-green-600 font-medium text-base">
          +₹{num.toLocaleString("en-IN")}
        </span>
      );
    } else if (num < 0) {
      return (
        <span className="text-red-600 font-medium text-base">
          -₹{Math.abs(num).toLocaleString("en-IN")}
        </span>
      );
    } else {
      return <span className="text-gray-500 text-base">₹0</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop />

      {/* TNR Input */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
            Payment Controller (TNR)
          </h2>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-character TNR
              </label>
              <input
                type="text"
                value={tnr}
                onChange={handleTnrChange}
                placeholder="e.g. K7P9M2"
                maxLength={6}
                className="w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xl uppercase tracking-widest font-mono transition"
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <button
                onClick={handleViewBalance}
                disabled={isLoading || tnr.length !== 6}
                className="flex-1 md:flex-none px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg transition shadow-md"
              >
                View Balance
              </button>
              <button
                onClick={handleViewAdvance}
                disabled={isLoading || tnr.length !== 6}
                className="flex-1 md:flex-none px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg transition shadow-md"
              >
                View Advance
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-12">
        {/* ==================== BALANCE CONTROLLER ==================== */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Balance Controller</h2>

          {isBalancePaid && (
            <div className="mb-6 p-4 bg-amber-100 border border-amber-300 rounded-xl text-amber-700 text-sm font-medium">
              ⚠️ Balance is already marked as PAID. Edit and Delete are disabled.
            </div>
          )}

          {balanceDetails && (
            <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-700">Current Balance</h3>
                  <p className="text-0.95g mt-3">
                    <strong>Advance Amount:</strong> {renderAmount(balanceDetails?.advance?.amount ?? 0, true)}
                  </p>
                  <p className="text-0.95g">
                    <strong>Balance Amount:</strong> {renderAmount(balanceDetails?.balance?.amount ?? 0, true)}
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-700">Admin Remarks</h3>
                </div>
              </div>

              <div className="space-y-4">
                {Array.isArray(balanceDetails.adminRemarks) && balanceDetails.adminRemarks.length > 0 ? (
                  balanceDetails.adminRemarks.map((r, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border">
                      {editingBalanceIndex === i ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editRemarkText}
                            onChange={(e) => setEditRemarkText(e.target.value)}
                            className="w-full p-3 border rounded-lg text-base"
                            placeholder="Remark"
                          />
                          <input
                            type="number"
                            value={editRemarkAmount}
                            onChange={(e) => setEditRemarkAmount(e.target.value)}
                            className="w-full p-3 border rounded-lg text-base"
                            placeholder="Amount"
                          />
                          <div className="flex gap-3">
                            <button onClick={saveBalanceRemark} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Save</button>
                            <button onClick={() => setEditingBalanceIndex(null)} className="px-6 py-2 bg-gray-500 text-white rounded-lg text-sm">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">
                              {new Date(r.addedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                            </p>
                            <p className="font-medium text-base mt-1">{r.remark || "No remark"}</p>
                            <p className="text-lg font-semibold mt-1">
                              {renderAmount(r.amount)}
                            </p>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => startEditBalance(i, r.remark, r.amount)}
                              disabled={!canEditBalance}
                              className={`text-sm ${canEditBalance ? "text-indigo-600 hover:text-indigo-800" : "text-gray-400 cursor-not-allowed"}`}
                            >
                              ✏️ 
                            </button>
                            <button
                              onClick={() => deleteBalanceRemarkHandler(i)}
                              disabled={!canEditBalance}
                              className={`text-sm ${canEditBalance ? "text-red-600 hover:text-red-800" : "text-gray-400 cursor-not-allowed"}`}
                            >
                              🗑️ 
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-center py-8">No remarks yet</p>
                )}
              </div>
            </div>
          )}

          {/* Adjust Balance Section */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-6">Adjust Balance (add / deduct)</h3>
            {balanceUpdates.map((u, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-50 p-5 rounded-xl border">
                <input
                  type="text"
                  placeholder="Remarks (optional)"
                  value={u.remarks}
                  onChange={(e) => handleBalanceChange(i, "remarks", e.target.value)}
                  className="flex-1 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                />
                <input
                  type="number"
                  placeholder="Amount (negative = deduct)"
                  value={u.amount}
                  onChange={(e) => handleBalanceChange(i, "amount", e.target.value)}
                  className="w-full md:w-48 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                />
                {balanceUpdates.length > 1 && (
                  <button onClick={() => removeBalanceField(i)} className="px-6 py-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium text-sm">
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button onClick={addBalanceField} className="w-full md:w-auto px-8 py-4 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition font-medium text-base shadow-md">
              + Add Adjustment
            </button>
          </div>

          <button
            onClick={handleUpdateBalance}
            disabled={isLoading || tnr.length !== 6 || isBalancePaid}
            className="mt-8 w-full px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl shadow-lg transition"
          >
            {isLoading ? "Updating Balance..." : isBalancePaid ? "Balance Already Paid" : "Update Balance Now"}
          </button>
        </div>

        {/* ==================== ADVANCE CONTROLLER ==================== */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Advance Controller</h2>

          {isAdvancePaid && (
            <div className="mb-6 p-4 bg-amber-100 border border-amber-300 rounded-xl text-amber-700 text-sm font-medium">
              ⚠️ Advance is already marked as PAID. Edit and Delete are disabled.
            </div>
          )}

          {advanceDetails && (
            <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-700">Current Advance</h3>
                  <p className="text-0.8g mt-3">
                    <strong>Advance Amount:</strong> {renderAmount(advanceDetails?.advance?.amount ?? 0, true)}
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-700">Advance Remarks</h3>
                </div>
              </div>

              <div className="space-y-4">
                {Array.isArray(advanceDetails.advanceAdminRemarks) && advanceDetails.advanceAdminRemarks.length > 0 ? (
                  advanceDetails.advanceAdminRemarks.map((r, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border">
                      {editingAdvanceIndex === i ? (
                        <div className="space-y-3">
                          <input type="text" value={editRemarkText} onChange={(e) => setEditRemarkText(e.target.value)} className="w-full p-3 border rounded-lg text-base" placeholder="Remark" />
                          <input type="number" value={editRemarkAmount} onChange={(e) => setEditRemarkAmount(e.target.value)} className="w-full p-3 border rounded-lg text-base" placeholder="Amount" />
                          <div className="flex gap-3">
                            <button onClick={saveAdvanceRemark} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Save</button>
                            <button onClick={() => setEditingAdvanceIndex(null)} className="px-6 py-2 bg-gray-500 text-white rounded-lg text-sm">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">
                              {new Date(r.addedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                            </p>
                            <p className="font-medium text-base mt-1">{r.remark || "No remark"}</p>
                            <p className="text-lg font-semibold mt-1">{renderAmount(r.amount)}</p>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => startEditAdvance(i, r.remark, r.amount)}
                              disabled={!canEditAdvance}
                              className={`text-sm ${canEditAdvance ? "text-indigo-600 hover:text-indigo-800" : "text-gray-400 cursor-not-allowed"}`}
                            >
                              ✏️ 
                            </button>
                            <button
                              onClick={() => deleteAdvanceRemarkHandler(i)}
                              disabled={!canEditAdvance}
                              className={`text-sm ${canEditAdvance ? "text-red-600 hover:text-red-800" : "text-gray-400 cursor-not-allowed"}`}
                            >
                              🗑️ 
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-center py-8">No remarks yet</p>
                )}
              </div>
            </div>
          )}

          {/* Shift Advance Section */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-6">Shift Amount from Advance to Balance</h3>
            {advanceUpdates.map((u, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-50 p-5 rounded-xl border">
                <input type="text" placeholder="Remarks (optional)" value={u.remarks} onChange={(e) => handleAdvanceChange(i, "remarks", e.target.value)} className="flex-1 p-4 border rounded-lg focus:ring-2 focus:ring-green-500 text-base" />
                <input type="number" placeholder="Amount to shift (positive)" value={u.amount} onChange={(e) => handleAdvanceChange(i, "amount", e.target.value)} className="w-full md:w-48 p-4 border rounded-lg focus:ring-2 focus:ring-green-500 text-base" min="1" />
                {advanceUpdates.length > 1 && <button onClick={() => removeAdvanceField(i)} className="px-6 py-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium text-sm">Remove</button>}
              </div>
            ))}
            <button onClick={addAdvanceField} className="w-full md:w-auto px-8 py-4 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition font-medium text-base shadow-md">+ Add Amount to Shift</button>
          </div>

          <button onClick={handleUpdateAdvance} disabled={isLoading || tnr.length !== 6 || isAdvancePaid} className="mt-8 w-full px-8 py-5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl shadow-lg transition">
            {isLoading ? "Processing..." : isAdvancePaid ? "Advance Already Paid" : "Shift Advance to Balance"}
          </button>
        </div>
      </div>

      {/* Back Confirmation */}
      {showBackConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Unsaved Changes</h2>
            <p className="text-gray-600 mb-6">You have unsaved changes.<br />Going back will lose them.<br />Are you sure?</p>
            <div className="flex justify-center gap-6">
              <button onClick={() => { setShowBackConfirm(false); window.history.pushState(null, null, window.location.href); }} className="px-8 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition">Cancel (Stay)</button>
              <button onClick={() => { setShowBackConfirm(false); history.back(); }} className="px-8 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition">OK (Go Back)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingControls;