// import React, { useState, useEffect, useContext } from "react";
// import { TourContext } from "../../context/TourContext";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import {
//   Copy, Share2, Users, IndianRupee, CheckCircle, Clock,
//   AlertTriangle, Edit2, Trash2, CreditCard, QrCode
// } from "lucide-react";

// const BalanceUpdatePage = () => {
//   const {
//     tourList,
//     getTourList,
//     getBookings,
//     getTourPaymentMethods,
//     createTourPaymentMethod,
//     updateTourPaymentMethod,
//     deleteTourPaymentMethod,
//   } = useContext(TourContext);

//   // Tour & Booking States
//   const [selectedTourId, setSelectedTourId] = useState("");
//   const [tourBookings, setTourBookings] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Payment Methods States
//   const [paymentMethods, setPaymentMethods] = useState([]);
//   const [paymentLoading, setPaymentLoading] = useState(false);
//   const [formType, setFormType] = useState("bank");
//   const [editingId, setEditingId] = useState(null);
//   const [formData, setFormData] = useState({
//     bankName: "", branchName: "", accountNumber: "", ifsc: "", swift: "",
//     beneficiary: "", accountType: "", upiId: "", phone: ""
//   });
//   const [qrFile, setQrFile] = useState(null);
//   const [previewQr, setPreviewQr] = useState(null);
//   const [creatingPayment, setCreatingPayment] = useState(false);



//   const handleBalanceUpdateLogic = (booking) => {
//     if (!booking) return { blockButtons: false, color: "normal", statusText: "Active" };

//     const tnr = booking.tnr || "Unknown";

//     const isAdvancePaid = booking.payment?.advance?.paid || false;
//     const isBalancePaid = booking.payment?.balance?.paid || false;
//     const balanceAmount = booking.payment?.balance?.amount || 0;

//     const travellers = booking.travellers || [];

//     const hasCancellationRequest = travellers.some(t =>
//       t.cancelled?.byTraveller === true && t.cancelled?.byAdmin !== true
//     );

//     const hasCancellationApproved = travellers.some(t =>
//       t.cancelled?.byAdmin === true
//     ) || booking.cancelled?.byAdmin === true;

//     const totalTravellers = travellers.length;
//     const cancelledTravellersCount = travellers.filter(t =>
//       t.cancelled?.byAdmin === true || t.isCancelled === true
//     ).length;

//     const allTravellersCancelled = totalTravellers > 0 && totalTravellers === cancelledTravellersCount;

//     console.log(`🔍 TNR:${tnr} | Advance:${isAdvancePaid} | BalancePaid:${isBalancePaid} | BalanceAmt:${balanceAmount} | Request:${hasCancellationRequest} | Approved:${hasCancellationApproved} | AllCancelled:${allTravellersCancelled}`);

//     if (hasCancellationApproved && allTravellersCancelled) {
//       console.log(`→ ALL TRAVELLERS CANCELLED → RED + BLOCK`);
//       return { blockButtons: true, color: "red", statusText: "Cancelled" };
//     }

//     if (isBalancePaid && !hasCancellationRequest && !hasCancellationApproved) {
//       console.log(`→ SCENARIO 1A: ${tnr} → GREEN + BLOCK`);
//       return { blockButtons: true, color: "green", statusText: "Paid" };
//     }

//     if (isAdvancePaid && !isBalancePaid) {
//       if (hasCancellationRequest) {
//         console.log(`→ 2.1 Cancellation Request → YELLOW + BLOCK`);
//         return { blockButtons: true, color: "yellow", statusText: "Cancellation Requested" };
//       }

//       if (hasCancellationApproved && !allTravellersCancelled) {
//         if (balanceAmount === 0) {
//           console.log(`→ 2.3 Partial Cancel + Balance == 0 → GREEN + BLOCK`);
//           return { blockButtons: true, color: "green", statusText: "Partially Cancelled" };
//         } else {
//           console.log(`→ 2.3 Partial Cancel + Balance > 0 → DEFAULT + ENABLE`);
//           return { blockButtons: false, color: "default", statusText: "Pending" };
//         }
//       }
//     }

//     if (isBalancePaid && hasCancellationRequest && !allTravellersCancelled) {
//       console.log(`→ Balance Paid + Partial Cancel → GREEN + BLOCK`);
//       return { blockButtons: true, color: "green", statusText: "Paid" };
//     }

//     if (isBalancePaid && hasCancellationApproved && !allTravellersCancelled) {
//       console.log(`→ Balance Paid + Partial Cancel → GREEN + BLOCK`);
//       return { blockButtons: true, color: "green", statusText: "Paid" };
//     }

//     console.log(`→ Default: ${tnr} → NORMAL + ENABLE`);
//     return { blockButtons: false, color: "normal", statusText: "Pending" };
//   };

//   const handleCopyTNR = (tnr) => {
//     if (!tnr) { toast.error("Nothing to copy"); return; }
//     navigator.clipboard.writeText(tnr)
//       .then(() => toast.success(`Copied!`))
//       .catch(() => toast.error("Failed to copy"));
//   };

//   const getButtonState = (booking) => {
//     const result = handleBalanceUpdateLogic(booking);
//     if (result.refresh) {
//       setTimeout(() => {
//         if (confirm("Cancellation detected. Refreshing page...")) {
//           window.location.reload();
//         }
//       }, 600);
//     }
//     return result;
//   };

//   const getCardColor = (color) => {
//     switch (color) {
//       case "green": return "border-green-500 bg-green-50";
//       case "red": return "border-red-500 bg-red-50";
//       case "yellow": return "border-yellow-500 bg-yellow-50";
//       default: return "border-gray-200 bg-white";
//     }
//   };

//   const getStatusBadgeColor = (color) => {
//     switch (color) {
//       case "green": return "bg-green-500 text-white";
//       case "red": return "bg-red-500 text-white";
//       case "yellow": return "bg-yellow-500 text-white";
//       default: return "bg-yellow-500 text-white";
//     }
//   };

//   const getBookingStats = (bookings) => {
//     let totalBookings = 0;
//     let cancellationRequested = 0;
//     let cancellationApproved = 0;
//     let balancePending = 0;
//     let balancePendingAmount = 0;
//     let balancePaid = 0;

//     bookings.forEach(booking => {
//       if (!booking.payment?.advance?.paid) return;

//       totalBookings++;

//       const state = handleBalanceUpdateLogic(booking);

//       if (state.statusText === "Cancellation Requested") {
//         cancellationRequested++;
//       }

//       if (["Cancelled", "Partially Cancelled", "Booking Rejected"].includes(state.statusText)) {
//         cancellationApproved++;
//         return;
//       }

//       if (booking.payment?.balance?.paid === true) {
//         balancePaid++;
//       } else {
//         balancePending++;
//         balancePendingAmount += booking.payment?.balance?.amount || 0;
//       }
//     });

//     return {
//       totalBookings,
//       cancellationRequested,
//       cancellationApproved,
//       balancePending,
//       balancePendingAmount,
//       balancePaid
//     };
//   };

//   const stats = getBookingStats(tourBookings);

//   const refreshBookings = async () => {
//     if (selectedTourId) {
//       const res = await getBookings(selectedTourId);
//       if (res.success) {
//         const filtered = (res.bookings || []).filter(b => b.payment?.advance?.paid === true);
//         setTourBookings(filtered);
//       }
//     }
//   };

//   const fetchTourPaymentMethods = async (tourId) => {
//     if (!tourId) return;
//     setPaymentLoading(true);
//     try {
//       const res = await getTourPaymentMethods(tourId);
//       if (res.success) {
//         setPaymentMethods(res.paymentMethods || []);
//       } else {
//         setPaymentMethods([]);
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load payment methods for this tour");
//       setPaymentMethods([]);
//     } finally {
//       setPaymentLoading(false);
//     }
//   };

//   useEffect(() => {
//     refreshBookings();
//     fetchTourPaymentMethods(selectedTourId);
//   }, [selectedTourId]);

//   useEffect(() => {
//     getTourList();
//   }, [getTourList]);

//   const handleTourChange = async (e) => {
//     const tourId = e.target.value;
//     setSelectedTourId(tourId);
//     setError("");
//     setPaymentMethods([]);

//     if (!tourId) { setTourBookings([]); return; }

//     setLoading(true);
//     try {
//       const res = await getBookings(tourId);
//       if (res.success) setTourBookings(res.bookings || []);
//       else setError(res.message || "No bookings found");
//     } catch (err) {
//       setError("Failed to load bookings");
//       toast.error("Error fetching bookings");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const advancePaid = tourBookings.filter(b => b.payment?.advance?.paid).length;
//   const balancePending = tourBookings.filter(b => b.payment?.advance?.paid && !b.payment?.balance?.paid).length;
//   const balancePaid = tourBookings.filter(b => b.payment?.balance?.paid).length;

//   const getPaymentMessage = (booking) => {
//     const lead = booking.travellers?.[0] || {};
//     const name = [lead.title, lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Dear Guest";
//     const balanceAmt = booking.payment?.balance?.amount || 0;
//     const tnr = booking.tnr;
//     const travellerCount = booking.travellers?.length || 1;
//     const travellerNames = booking.travellers?.map(t =>
//       [t.title, t.firstName, t.lastName].filter(Boolean).join(" ")
//     ).join(", ") || name;

//     const selectedTour = tourList.find(t => t._id === selectedTourId);
//     const tourTitle = selectedTour?.title || booking.tour?.title || booking.tourName || booking.tourTitle || "TOUR";

//     let paymentDetails = "";
//     if (paymentMethods.length > 0) {
//       paymentDetails += `\n*Payment Options:*\n`;
//       paymentMethods.forEach((pm, index) => {
//         if (pm.type === "bank") {
//           paymentDetails += `\n*Bank Transfer ${index + 1}*\n`;
//           paymentDetails += `- *Bank Name*      : ${pm.bankName}\n`;
//           paymentDetails += `- *Account Number* : ${pm.accountNumber}\n`;
//           paymentDetails += `- *Account Holder* : ${pm.beneficiary || 'GV TOUR PLANNERS'}\n`;
//           if (pm.accountType) paymentDetails += `- *Account Type*   : ${pm.accountType}\n`;
//           paymentDetails += `- *IFSC Code*      : ${pm.ifsc}\n`;
//           if (pm.branchName) paymentDetails += `- *Branch*         : ${pm.branchName}\n`;
//         } else if (pm.type === "upi") {
//           paymentDetails += `\n*UPI Payment ${index + 1}*\n`;
//           paymentDetails += `- *UPI ID*         : ${pm.upiId}\n`;
//           if (pm.phone) paymentDetails += `- *Phone Number*   : ${pm.phone}\n`;
//         }
//       });
//     }

//     return `Hello *${name}*,

// Hope you're doing great.

// Kindly complete your *pending balance payment* of *Rs.${balanceAmt}* for your present tour.

// *TOUR NAME*     : ${tourTitle}
// *TNR NO*    : ${tnr}
// *TRAVELLERS*    : ${travellerCount} (${travellerNames})

// ${paymentDetails}

// ------------------------
// After making the payment, please send the *payment screenshot* to:

// +91 93444 57790

// Thank you for choosing *GV Tour Planners*.
// We are committed to making your current tour a memorable one.

// *GV Tour Planners Team*`;
//   };

//   const copyPaymentLink = (booking) => {
//     const state = getButtonState(booking);
//     if (state.blockButtons) return toast.warning("Copy is blocked for this booking");
//     const message = getPaymentMessage(booking);
//     navigator.clipboard.writeText(message).then(() => toast.success("Message copied successfully!"));
//   };

//   const shareLink = (booking) => {
//     const state = getButtonState(booking);
//     if (state.blockButtons) return toast.warning("Share is blocked for this booking");
//     const message = getPaymentMessage(booking);
//     const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
//     window.open(whatsappUrl, '_blank');
//     toast.success("Opening WhatsApp...");
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (!file.type.startsWith("image/")) return toast.error("Please select an image file");
//       if (file.size > 5 * 1024 * 1024) return toast.error("File size should be less than 5MB");
//       setQrFile(file);
//       setPreviewQr(URL.createObjectURL(file));
//     }
//   };

//   const validateForm = () => {
//     if (formType === "bank") {
//       if (!formData.bankName?.trim() || !formData.branchName?.trim() ||
//         !formData.accountNumber?.trim() || !formData.ifsc?.trim() ||
//         !formData.beneficiary?.trim() || !formData.accountType?.trim()) {
//         toast.error("All bank fields are required");
//         return false;
//       }
//     } else if (formType === "upi") {
//       if (!formData.upiId?.trim() || !formData.phone?.trim()) {
//         toast.error("UPI ID and Phone are required");
//         return false;
//       }
//       if (!/^\d{10}$/.test(formData.phone)) {
//         toast.error("Phone must be exactly 10 digits");
//         return false;
//       }
//     }
//     return true;
//   };

//   const handlePaymentSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedTourId) return toast.error("Please select a tour first");
//     if (!validateForm()) return;

//     setCreatingPayment(true);
//     const payload = new FormData();
//     payload.append("type", formType);

//     if (formType === "bank") {
//       payload.append("bankName", formData.bankName.trim());
//       payload.append("branchName", formData.branchName.trim());
//       payload.append("accountNumber", formData.accountNumber.trim());
//       payload.append("ifsc", formData.ifsc.trim().toUpperCase());
//       if (formData.swift?.trim()) payload.append("swift", formData.swift.trim());
//       payload.append("beneficiary", formData.beneficiary.trim());
//       payload.append("accountType", formData.accountType.trim());
//     } else {
//       payload.append("upiId", formData.upiId.trim());
//       payload.append("phone", formData.phone.trim());
//       if (qrFile) payload.append("qrImage", qrFile);
//     }

//     try {
//       let res;
//       if (editingId) {
//         res = await updateTourPaymentMethod(selectedTourId, editingId, payload);
//         if (res?.success) toast.success();
//       } else {
//         res = await createTourPaymentMethod(selectedTourId, payload);
//         if (res?.success) toast.success("Payment method saved successfully!");
//       }
//       if (res?.success) {
//         resetPaymentForm();
//         fetchTourPaymentMethods(selectedTourId);
//       }
//     } catch (err) {
//       toast.error("Something went wrong");
//     } finally {
//       setCreatingPayment(false);
//     }
//   };

//   const handleEdit = (pm) => {
//     setFormType(pm.type);
//     setEditingId(pm._id);
//     setFormData({
//       bankName: pm.bankName || "",
//       branchName: pm.branchName || "",
//       accountNumber: pm.accountNumber || "",
//       ifsc: pm.ifsc || "",
//       swift: pm.swift || "",
//       beneficiary: pm.beneficiary || "",
//       accountType: pm.accountType || "",
//       upiId: pm.upiId || "",
//       phone: pm.phone || ""
//     });
//     setQrFile(null);
//     setPreviewQr(pm.qrImage || null);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this payment method?")) return;
//     try {
//       const res = await deleteTourPaymentMethod(selectedTourId, id);
//       if (res.success) {
//         toast.success();
//         fetchTourPaymentMethods(selectedTourId);
//       } else {
//         toast.error(res.message || "Failed to delete payment method");
//       }
//     } catch (err) {
//       toast.error("Failed to delete payment method");
//     }
//   };

//   const resetPaymentForm = () => {
//     setFormType("bank");
//     setEditingId(null);
//     setFormData({
//       bankName: "", branchName: "", accountNumber: "", ifsc: "", swift: "",
//       beneficiary: "", accountType: "", upiId: "", phone: ""
//     });
//     setQrFile(null);
//     setPreviewQr(null);
//   };

//   return (
//     <div className="min-h-screen w-full bg-gray-50 py-4 px-2 sm:px-4 md:py-8 lg:px-8">
//       <ToastContainer position="top-right" autoClose={3000} theme="light" />

//       <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-4 sm:p-6 lg:p-10">

//         {/* Header */}
//         <header className="mb-6 sm:mb-10 text-center">
//           <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4">
//             <AlertTriangle className="text-orange-600" size={36} />
//             <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
//               Balance Reminder
//             </h1>
//           </div>
//         </header>

//         {/* Tour Selector */}
//         <div className="mb-8">
//           <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Select Tour Batch</label>
//           <select
//             value={selectedTourId}
//             onChange={handleTourChange}
//             className="w-full px-4 py-3.5 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-orange-500 outline-none"
//           >
//             <option value="">Choose a tour...</option>
//             {tourList.map(t => (
//               <option key={t._id} value={t._id}>{t.title} — {t.batch}</option>
//             ))}
//           </select>
//         </div>

//         {selectedTourId && (
//           <>
//             {/* ====================== STATISTICS ====================== */}
//             {/* Mobile: 2 cols | Tablet: 3 cols | Desktop: 6 cols */}
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">

//               <div className="bg-blue-50 rounded-2xl p-5 shadow-sm border text-center">
//                 <p className="text-sm text-blue-600 font-medium">Total TNR's</p>
//                 <p className="text-4xl font-bold text-blue-600 mt-2">{stats.totalBookings}</p>
//               </div>

//               <div className="bg-yellow-50 rounded-2xl p-5 shadow-sm border border-yellow-200 text-center">
//                 <p className="text-sm text-yellow-600 font-medium">Cancellation Request</p>
//                 <p className="text-4xl font-bold text-yellow-600 mt-2">{stats.cancellationRequested}</p>
//               </div>

//               <div className="bg-orange-50 rounded-2xl p-5 shadow-sm border border-orange-200 text-center">
//                 <p className="text-sm text-orange-600 font-medium">Cancellation Approved</p>
//                 <p className="text-4xl font-bold text-orange-600 mt-2">{stats.cancellationApproved}</p>
//               </div>

//               <div className="bg-amber-50 rounded-2xl p-5 shadow-sm border border-amber-200 text-center">
//                 <p className="text-sm text-amber-600 font-medium">Balance Pending</p>
//                 <p className="text-4xl font-bold text-amber-600 mt-2">{stats.balancePending}</p>
//               </div>

//               {/* NEW — Pending Amount */}
//               <div className="bg-red-50 rounded-2xl p-5 shadow-sm border border-red-200 text-center">
//                 <p className="text-sm text-red-600 font-medium">Balance Pending Amount</p>
//                 <p className="text-2xl font-bold text-red-600 mt-2">
//                   ₹{stats.balancePendingAmount.toLocaleString("en-IN")}
//                 </p>
//               </div>

//               <div className="bg-green-50 rounded-2xl p-5 shadow-sm border border-green-200 text-center">
//                 <p className="text-sm text-green-600 font-medium">Balance Paid</p>
//                 <p className="text-4xl font-bold text-green-600 mt-2">{stats.balancePaid}</p>
//               </div>

//             </div>

//             {/* Payment Methods Section */}
//             <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-8 mb-10">
//               <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
//                 <h2 className="text-xl sm:text-2xl font-bold">Payment Methods (This Tour)</h2>
//               </div>

//               <form onSubmit={handlePaymentSubmit} className="space-y-8 sm:space-y-10 mb-12">
//                 <div className="flex flex-wrap gap-6 sm:gap-10">
//                   <label className="flex items-center gap-3 cursor-pointer">
//                     <input type="radio" name="type" value="bank" checked={formType === "bank"} onChange={(e) => setFormType(e.target.value)} className="w-5 h-5" />
//                     <span className="font-semibold text-base sm:text-lg">Bank Transfer</span>
//                   </label>
//                   <label className="flex items-center gap-3 cursor-pointer">
//                     <input type="radio" name="type" value="upi" checked={formType === "upi"} onChange={(e) => setFormType(e.target.value)} className="w-5 h-5" />
//                     <span className="font-semibold text-base sm:text-lg">UPI / QR Code</span>
//                   </label>
//                 </div>

//                 {formType === "bank" ? (
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
//                     <input name="bankName" placeholder="Bank Name *" value={formData.bankName} onChange={handleInputChange} className="border p-4 rounded-2xl" required />
//                     <input name="branchName" placeholder="Branch Name *" value={formData.branchName} onChange={handleInputChange} className="border p-4 rounded-2xl" required />
//                     <input name="accountNumber" placeholder="Account Number *" value={formData.accountNumber} onChange={handleInputChange} className="border p-4 rounded-2xl" required />
//                     <input name="ifsc" placeholder="IFSC Code *" value={formData.ifsc} onChange={handleInputChange} className="border p-4 rounded-2xl uppercase" required />
//                     <input name="swift" placeholder="Swift Code (Optional)" value={formData.swift} onChange={handleInputChange} className="border p-4 rounded-2xl" />
//                     <div className="sm:col-span-2">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Account Type *</label>
//                       <select name="accountType" value={formData.accountType} onChange={handleInputChange} className="border p-4 rounded-2xl w-full" required>
//                         <option value="">Select Account Type</option>
//                         <option value="Savings">Savings</option>
//                         <option value="Current">Current</option>
//                       </select>
//                     </div>
//                     <input name="beneficiary" placeholder="Beneficiary Name *" value={formData.beneficiary} onChange={handleInputChange} className="border p-4 rounded-2xl sm:col-span-2" required />
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
//                     <input name="upiId" placeholder="UPI ID *" value={formData.upiId} onChange={handleInputChange} className="border p-4 rounded-2xl" required />
//                     <input name="phone" placeholder="Phone Number (10 digits) *" value={formData.phone} onChange={handleInputChange} maxLength={10} className="border p-4 rounded-2xl" required />
//                   </div>
//                 )}

//                 <button
//                   type="submit"
//                   disabled={creatingPayment}
//                   className="w-full py-5 sm:py-6 bg-orange-600 text-white rounded-2xl font-semibold text-base sm:text-lg hover:bg-orange-700 disabled:bg-gray-400 transition"
//                 >
//                   {creatingPayment ? "Saving..." : editingId ? "Update Payment Method" : "Save Payment Method"}
//                 </button>
//               </form>

//               <h3 className="font-semibold text-lg mb-5">
//                 Existing Payment Methods ({paymentMethods.length}) {paymentLoading && "(Loading...)"}
//               </h3>

//               <div className="space-y-4 sm:space-y-6">
//                 {paymentMethods.length > 0 ? paymentMethods.map((pm) => (
//                   <div key={pm._id} className="border rounded-3xl p-5 sm:p-6 bg-white hover:shadow-md transition">
//                     <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
//                       <div className="flex gap-4 flex-1">
//                         {pm.type === "bank" ? <CreditCard size={34} className="text-indigo-600 mt-1" /> : <QrCode size={34} className="text-teal-600 mt-1" />}
//                         <div>
//                           <p className="font-bold text-lg sm:text-xl capitalize">{pm.type} Payment</p>
//                           {pm.type === "bank" ? (
//                             <div className="mt-3 space-y-1 text-sm text-gray-700">
//                               <p><span className="text-gray-500">Bank:</span> {pm.bankName}</p>
//                               <p><span className="text-gray-500">Branch:</span> {pm.branchName}</p>
//                               <p><span className="text-gray-500">Account:</span> {pm.accountNumber}</p>
//                               <p><span className="text-gray-500">IFSC:</span> {pm.ifsc}</p>
//                               <p><span className="text-gray-500">Account Type:</span> {pm.accountType}</p>
//                               <p><span className="text-gray-500">Beneficiary:</span> {pm.beneficiary}</p>
//                             </div>
//                           ) : (
//                             <div className="mt-3 space-y-1 text-sm text-gray-700">
//                               <p><span className="text-gray-500">UPI ID:</span> {pm.upiId}</p>
//                               <p><span className="text-gray-500">Phone:</span> {pm.phone}</p>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                       <div className="flex gap-3 mt-4 sm:mt-0">
//                         <button onClick={() => handleEdit(pm)} className="p-3 hover:bg-blue-100 rounded-xl text-blue-600">
//                           <Edit2 size={22} />
//                         </button>
//                         <button onClick={() => handleDelete(pm._id)} className="p-3 hover:bg-red-100 text-red-600 rounded-xl">
//                           <Trash2 size={22} />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )) : (
//                   <p className="text-center py-10 text-gray-500">No payment methods added for this tour yet.</p>
//                 )}
//               </div>
//             </div>

//             {/* ==================== BOOKINGS LIST ==================== */}
//             <div className="space-y-6">
//               <div className="flex items-center justify-between px-1">
//                 <h2 className="text-lg font-bold text-gray-800">Bookings List</h2>
//                 <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-600">
//                   {tourBookings.filter(b => b.payment?.advance?.paid === true).length} Items
//                 </span>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {tourBookings
//                   .filter(booking => booking.payment?.advance?.paid === true)
//                   .map(booking => {
//                     const lead = booking.travellers?.[0] || {};
//                     const name = [lead.title, lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Guest";
//                     const balanceAmt = booking.payment?.balance?.amount || 0;
//                     const state = handleBalanceUpdateLogic(booking);

//                     return (
//                       <div
//                         key={booking.tnr}
//                         className={`relative flex flex-col h-full rounded-3xl border-2 overflow-hidden transition-all duration-300 
//                         ${getCardColor(state.color)} ${state.blockButtons ? "opacity-95" : "hover:shadow-2xl hover:-translate-y-1"}`}
//                       >
//                         {/* Status Badge */}
//                         <div className={`absolute top-4 right-4 px-4 py-1.5 text-xs font-semibold rounded-3xl shadow-sm ${getStatusBadgeColor(state.color)}`}>
//                           {state.statusText}
//                         </div>

//                         <div className="p-6 pt-12">
//                           <div className="flex items-center gap-2 mb-4">
//                             <h3 className="font-bold text-xl text-gray-800">{name}</h3>
//                           </div>

//                           <div className="flex items-center gap-2 mb-6">
//                             <p className="font-mono text-sm text-gray-500">{booking.tnr}</p>
//                             <button onClick={() => handleCopyTNR(booking.tnr)} className="text-blue-600 hover:text-blue-700">
//                               <Copy size={18} />
//                             </button>
//                           </div>

//                           <div>
//                             <p className="text-sm text-gray-500 mb-1">Balance Due</p>
//                             <p className={`text-4xl font-bold tracking-tight ${balanceAmt >= 0 ? "text-red-600" : "text-green-600"}`}>
//                               ₹{balanceAmt.toLocaleString('en-IN')}
//                             </p>
//                           </div>
//                         </div>

//                         {/* Buttons */}
//                         <div className="mt-auto p-6 pt-0 grid grid-cols-2 gap-3">
//                           <button
//                             onClick={() => copyPaymentLink(booking)}
//                             disabled={state.blockButtons}
//                             className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold transition-all
//                               ${state.blockButtons
//                                 ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                                 : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 active:scale-95"}`}
//                           >
//                             <Copy size={18} /> Copy
//                           </button>

//                           <button
//                             onClick={() => shareLink(booking)}
//                             disabled={state.blockButtons}
//                             className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold transition-all
//                               ${state.blockButtons
//                                 ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                                 : "bg-green-600 hover:bg-green-700 text-white active:scale-95"}`}
//                           >
//                             <Share2 size={18} /> Share
//                           </button>
//                         </div>
//                       </div>
//                     );
//                   })}
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BalanceUpdatePage;


import React, { useState, useEffect, useContext } from "react";
import { TourContext } from "../../context/TourContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Copy, Share2, Users, IndianRupee, CheckCircle, Clock,
  AlertTriangle, Edit2, Trash2, CreditCard, QrCode
} from "lucide-react";

const BalanceUpdatePage = () => {
  const {
    tourList,
    getTourList,
    getBookings,
    getTourPaymentMethods,
    createTourPaymentMethod,
    updateTourPaymentMethod,
    deleteTourPaymentMethod,
  } = useContext(TourContext);

  const [selectedTourId, setSelectedTourId] = useState("");
  const [tourBookings, setTourBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [formType, setFormType] = useState("bank");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    bankName: "", branchName: "", accountNumber: "", ifsc: "", swift: "",
    beneficiary: "", accountType: "", upiId: "", phone: ""
  });
  const [qrFile, setQrFile] = useState(null);
  const [previewQr, setPreviewQr] = useState(null);
  const [creatingPayment, setCreatingPayment] = useState(false);

  const handleBalanceUpdateLogic = (booking) => {
    if (!booking) return { blockButtons: false, color: "normal", statusText: "Active" };

    const tnr = booking.tnr || "Unknown";
    const isAdvancePaid = booking.payment?.advance?.paid || false;
    const isBalancePaid = booking.payment?.balance?.paid || false;
    const balanceAmount = booking.payment?.balance?.amount || 0;
    const travellers = booking.travellers || [];

    const hasCancellationRequest = travellers.some(t =>
      t.cancelled?.byTraveller === true && t.cancelled?.byAdmin !== true
    );
    const hasCancellationApproved = travellers.some(t =>
      t.cancelled?.byAdmin === true
    ) || booking.cancelled?.byAdmin === true;

    const totalTravellers = travellers.length;
    const cancelledTravellersCount = travellers.filter(t =>
      t.cancelled?.byAdmin === true || t.isCancelled === true
    ).length;
    const allTravellersCancelled = totalTravellers > 0 && totalTravellers === cancelledTravellersCount;

    console.log(`🔍 TNR:${tnr} | Advance:${isAdvancePaid} | BalancePaid:${isBalancePaid} | BalanceAmt:${balanceAmount} | Request:${hasCancellationRequest} | Approved:${hasCancellationApproved} | AllCancelled:${allTravellersCancelled}`);

    if (hasCancellationApproved && allTravellersCancelled) {
      return { blockButtons: true, color: "red", statusText: "Cancelled" };
    }
    if (isBalancePaid && !hasCancellationRequest && !hasCancellationApproved) {
      return { blockButtons: true, color: "green", statusText: "Paid" };
    }
    if (isAdvancePaid && !isBalancePaid) {
      if (hasCancellationRequest) {
        return { blockButtons: true, color: "yellow", statusText: "Cancellation Requested" };
      }
      if (hasCancellationApproved && !allTravellersCancelled) {
        if (balanceAmount === 0) {
          return { blockButtons: true, color: "green", statusText: "Partially Cancelled" };
        } else {
          return { blockButtons: false, color: "default", statusText: "Pending" };
        }
      }
    }
    if (isBalancePaid && hasCancellationRequest && !allTravellersCancelled) {
      return { blockButtons: true, color: "green", statusText: "Paid" };
    }
    if (isBalancePaid && hasCancellationApproved && !allTravellersCancelled) {
      return { blockButtons: true, color: "green", statusText: "Paid" };
    }

    return { blockButtons: false, color: "normal", statusText: "Pending" };
  };

  const handleCopyTNR = (tnr) => {
    if (!tnr) { toast.error("Nothing to copy"); return; }
    navigator.clipboard.writeText(tnr)
      .then(() => toast.success(`Copied!`))
      .catch(() => toast.error("Failed to copy"));
  };

  const getButtonState = (booking) => {
    const result = handleBalanceUpdateLogic(booking);
    if (result.refresh) {
      setTimeout(() => {
        if (confirm("Cancellation detected. Refreshing page...")) {
          window.location.reload();
        }
      }, 600);
    }
    return result;
  };

  const getCardColor = (color) => {
    switch (color) {
      case "green": return "border-green-500 bg-green-50";
      case "red": return "border-red-500 bg-red-50";
      case "yellow": return "border-yellow-500 bg-yellow-50";
      default: return "border-gray-200 bg-white";
    }
  };

  const getStatusBadgeColor = (color) => {
    switch (color) {
      case "green": return "bg-green-500 text-white";
      case "red": return "bg-red-500 text-white";
      case "yellow": return "bg-yellow-500 text-white";
      default: return "bg-yellow-500 text-white";
    }
  };

  const getBookingStats = (bookings) => {
    let totalBookings = 0;
    let cancellationRequested = 0;
    let cancellationApproved = 0;
    let balancePending = 0;
    let balancePendingAmount = 0;
    let balancePaid = 0;

    bookings.forEach(booking => {
      if (!booking.payment?.advance?.paid) return;
      totalBookings++;
      const state = handleBalanceUpdateLogic(booking);
      if (state.statusText === "Cancellation Requested") cancellationRequested++;
      if (["Cancelled", "Partially Cancelled", "Booking Rejected"].includes(state.statusText)) {
        cancellationApproved++;
        return;
      }
      if (booking.payment?.balance?.paid === true) {
        balancePaid++;
      } else {
        balancePending++;
        balancePendingAmount += booking.payment?.balance?.amount || 0;
      }
    });

    return { totalBookings, cancellationRequested, cancellationApproved, balancePending, balancePendingAmount, balancePaid };
  };

  const stats = getBookingStats(tourBookings);

  const refreshBookings = async () => {
    if (selectedTourId) {
      const res = await getBookings(selectedTourId);
      if (res.success) {
        const filtered = (res.bookings || []).filter(b => b.payment?.advance?.paid === true);
        setTourBookings(filtered);
      }
    }
  };

  const fetchTourPaymentMethods = async (tourId) => {
    if (!tourId) return;
    setPaymentLoading(true);
    try {
      const res = await getTourPaymentMethods(tourId);
      if (res.success) setPaymentMethods(res.paymentMethods || []);
      else setPaymentMethods([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load payment methods for this tour");
      setPaymentMethods([]);
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    refreshBookings();
    fetchTourPaymentMethods(selectedTourId);
  }, [selectedTourId]);

  useEffect(() => {
    getTourList();
  }, [getTourList]);

  const handleTourChange = async (e) => {
    const tourId = e.target.value;
    setSelectedTourId(tourId);
    setError("");
    setPaymentMethods([]);
    if (!tourId) { setTourBookings([]); return; }
    setLoading(true);
    try {
      const res = await getBookings(tourId);
      if (res.success) setTourBookings(res.bookings || []);
      else setError(res.message || "No bookings found");
    } catch (err) {
      setError("Failed to load bookings");
      toast.error("Error fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  const advancePaid = tourBookings.filter(b => b.payment?.advance?.paid).length;
  const balancePending = tourBookings.filter(b => b.payment?.advance?.paid && !b.payment?.balance?.paid).length;
  const balancePaid = tourBookings.filter(b => b.payment?.balance?.paid).length;

  const getPaymentMessage = (booking) => {
    const lead = booking.travellers?.[0] || {};
    const name = [lead.title, lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Dear Guest";
    const balanceAmt = booking.payment?.balance?.amount || 0;
    const tnr = booking.tnr;
    const travellerCount = booking.travellers?.length || 1;
    const travellerNames = booking.travellers?.map(t =>
      [t.title, t.firstName, t.lastName].filter(Boolean).join(" ")
    ).join(", ") || name;

    const selectedTour = tourList.find(t => t._id === selectedTourId);
    const tourTitle = selectedTour?.title || booking.tour?.title || booking.tourName || booking.tourTitle || "TOUR";

    let paymentDetails = "";
    if (paymentMethods.length > 0) {
      paymentDetails += `\n*Payment Options:*\n`;
      paymentMethods.forEach((pm, index) => {
        if (pm.type === "bank") {
          paymentDetails += `\n*Bank Transfer ${index + 1}*\n`;
          paymentDetails += `- *Bank Name*      : ${pm.bankName}\n`;
          paymentDetails += `- *Account Number* : ${pm.accountNumber}\n`;
          paymentDetails += `- *Account Holder* : ${pm.beneficiary || 'GV TOUR PLANNERS'}\n`;
          if (pm.accountType) paymentDetails += `- *Account Type*   : ${pm.accountType}\n`;
          paymentDetails += `- *IFSC Code*      : ${pm.ifsc}\n`;
          if (pm.branchName) paymentDetails += `- *Branch*         : ${pm.branchName}\n`;
        } else if (pm.type === "upi") {
          paymentDetails += `\n*UPI Payment ${index + 1}*\n`;
          paymentDetails += `- *UPI ID*         : ${pm.upiId}\n`;
          if (pm.phone) paymentDetails += `- *Phone Number*   : ${pm.phone}\n`;
        }
      });
    }

    return `Hello *${name}*,

Hope you're doing great.

Kindly complete your *pending balance payment* of *Rs.${balanceAmt}* for your present tour.

*TOUR NAME*     : ${tourTitle}
*TNR NO*    : ${tnr}
*TRAVELLERS*    : ${travellerCount} (${travellerNames})

${paymentDetails}

------------------------
After making the payment, please send the *payment screenshot* to:

+91 93444 57790

Thank you for choosing *GV Tour Planners*.
We are committed to making your current tour a memorable one.

*GV Tour Planners Team*`;
  };

  const copyPaymentLink = (booking) => {
    const state = getButtonState(booking);
    if (state.blockButtons) return toast.warning("Copy is blocked for this booking");
    const message = getPaymentMessage(booking);
    navigator.clipboard.writeText(message).then(() => toast.success("Message copied successfully!"));
  };

  const shareLink = (booking) => {
    const state = getButtonState(booking);
    if (state.blockButtons) return toast.warning("Share is blocked for this booking");
    const message = getPaymentMessage(booking);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success("Opening WhatsApp...");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) return toast.error("Please select an image file");
      if (file.size > 5 * 1024 * 1024) return toast.error("File size should be less than 5MB");
      setQrFile(file);
      setPreviewQr(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    if (formType === "bank") {
      if (!formData.bankName?.trim() || !formData.branchName?.trim() ||
        !formData.accountNumber?.trim() || !formData.ifsc?.trim() ||
        !formData.beneficiary?.trim() || !formData.accountType?.trim()) {
        toast.error("All bank fields are required");
        return false;
      }
    } else if (formType === "upi") {
      if (!formData.upiId?.trim()) {
        toast.error("UPI ID is required");
        return false;
      }
      // phone is optional — only validate format if provided
      if (formData.phone?.trim() && !/^\d{10}$/.test(formData.phone)) {
        toast.error("Phone must be exactly 10 digits");
        return false;
      }
    }
    return true;
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTourId) return toast.error("Please select a tour first");
    if (!validateForm()) return;

    setCreatingPayment(true);
    const payload = new FormData();
    payload.append("type", formType);

    if (formType === "bank") {
      payload.append("bankName", formData.bankName.trim());
      payload.append("branchName", formData.branchName.trim());
      payload.append("accountNumber", formData.accountNumber.trim());
      payload.append("ifsc", formData.ifsc.trim().toUpperCase());
      if (formData.swift?.trim()) payload.append("swift", formData.swift.trim());
      payload.append("beneficiary", formData.beneficiary.trim());
      payload.append("accountType", formData.accountType.trim());
    } else {
      payload.append("upiId", formData.upiId.trim());
      if (formData.phone?.trim()) payload.append("phone", formData.phone.trim());
      if (qrFile) payload.append("qrImage", qrFile);
    }

    try {
      let res;
      if (editingId) {
        res = await updateTourPaymentMethod(selectedTourId, editingId, payload);
        if (res?.success) toast.success();
      } else {
        res = await createTourPaymentMethod(selectedTourId, payload);
        if (res?.success) toast.success("Payment method saved successfully!");
      }
      if (res?.success) {
        resetPaymentForm();
        fetchTourPaymentMethods(selectedTourId);
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setCreatingPayment(false);
    }
  };

  const handleEdit = (pm) => {
    setFormType(pm.type);
    setEditingId(pm._id);
    setFormData({
      bankName: pm.bankName || "",
      branchName: pm.branchName || "",
      accountNumber: pm.accountNumber || "",
      ifsc: pm.ifsc || "",
      swift: pm.swift || "",
      beneficiary: pm.beneficiary || "",
      accountType: pm.accountType || "",
      upiId: pm.upiId || "",
      phone: pm.phone || ""
    });
    setQrFile(null);
    setPreviewQr(pm.qrImage || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this payment method?")) return;
    try {
      const res = await deleteTourPaymentMethod(selectedTourId, id);
      if (res.success) {
        toast.success();
        fetchTourPaymentMethods(selectedTourId);
      } else {
        toast.error(res.message || "Failed to delete payment method");
      }
    } catch (err) {
      toast.error("Failed to delete payment method");
    }
  };

  const resetPaymentForm = () => {
    setFormType("bank");
    setEditingId(null);
    setFormData({
      bankName: "", branchName: "", accountNumber: "", ifsc: "", swift: "",
      beneficiary: "", accountType: "", upiId: "", phone: ""
    });
    setQrFile(null);
    setPreviewQr(null);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 py-4 px-2 sm:px-4 md:py-8 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-4 sm:p-6 lg:p-10">

        <header className="mb-6 sm:mb-10 text-center">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4">
            <AlertTriangle className="text-orange-600" size={36} />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Balance Reminder
            </h1>
          </div>
        </header>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Select Tour Batch</label>
          <select
            value={selectedTourId}
            onChange={handleTourChange}
            className="w-full px-4 py-3.5 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-orange-500 outline-none"
          >
            <option value="">Choose a tour...</option>
            {tourList.map(t => (
              <option key={t._id} value={t._id}>{t.title} — {t.batch}</option>
            ))}
          </select>
        </div>

        {selectedTourId && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">              <div className="bg-blue-50 rounded-2xl p-5 shadow-sm border text-center">
              <p className="text-sm text-blue-600 font-medium">Total TNR's</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">{stats.totalBookings}</p>
            </div>
              <div className="bg-yellow-50 rounded-2xl p-5 shadow-sm border border-yellow-200 text-center">
                <p className="text-sm text-yellow-600 font-medium">Cancellation Request</p>
                <p className="text-4xl font-bold text-yellow-600 mt-2">{stats.cancellationRequested}</p>
              </div>
              <div className="bg-orange-50 rounded-2xl p-5 shadow-sm border border-orange-200 text-center">
                <p className="text-sm text-orange-600 font-medium">Cancellation Approved</p>
                <p className="text-4xl font-bold text-orange-600 mt-2">{stats.cancellationApproved}</p>
              </div>
              <div className="bg-amber-50 rounded-2xl p-5 shadow-sm border border-amber-200 text-center">
                <p className="text-sm text-amber-600 font-medium">Balance Pending</p>
                <p className="text-4xl font-bold text-amber-600 mt-2">{stats.balancePending}</p>
              </div>
              <div className="bg-red-50 rounded-2xl p-5 shadow-sm border border-red-200 text-center">
                <p className="text-sm text-red-600 font-medium">Balance Pending Amount</p>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  ₹{stats.balancePendingAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-green-50 rounded-2xl p-5 shadow-sm border border-green-200 text-center">
                <p className="text-sm text-green-600 font-medium">Balance Paid</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{stats.balancePaid}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-8 mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-xl sm:text-2xl font-bold">Payment Methods</h2>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-8 sm:space-y-10 mb-12">
                <div className="flex flex-wrap gap-6 sm:gap-10">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="type" value="bank" checked={formType === "bank"} onChange={(e) => setFormType(e.target.value)} className="w-5 h-5" />
                    <span className="font-semibold text-base sm:text-lg">Bank Transfer</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="type" value="upi" checked={formType === "upi"} onChange={(e) => setFormType(e.target.value)} className="w-5 h-5" />
                    <span className="font-semibold text-base sm:text-lg">UPI / QR Code</span>
                  </label>
                </div>

                {formType === "bank" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <input name="bankName" placeholder="Bank Name *" value={formData.bankName} onChange={handleInputChange} className="border p-4 rounded-2xl" required />
                    <input name="branchName" placeholder="Branch Name *" value={formData.branchName} onChange={handleInputChange} className="border p-4 rounded-2xl" required />
                    <input name="accountNumber" placeholder="Account Number *" value={formData.accountNumber} onChange={handleInputChange} className="border p-4 rounded-2xl" required />
                    <input name="ifsc" placeholder="IFSC Code *" value={formData.ifsc} onChange={handleInputChange} className="border p-4 rounded-2xl uppercase" required />
                    <input name="swift" placeholder="Swift Code (Optional)" value={formData.swift} onChange={handleInputChange} className="border p-4 rounded-2xl" />
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Type *</label>
                      <select name="accountType" value={formData.accountType} onChange={handleInputChange} className="border p-4 rounded-2xl w-full" required>
                        <option value="">Select Account Type</option>
                        <option value="Savings">Savings</option>
                        <option value="Current">Current</option>
                      </select>
                    </div>
                    <input name="beneficiary" placeholder="Beneficiary Name *" value={formData.beneficiary} onChange={handleInputChange} className="border p-4 rounded-2xl sm:col-span-2" required />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <input name="upiId" placeholder="UPI ID *" value={formData.upiId} onChange={handleInputChange} className="border p-4 rounded-2xl" required />
                    {/* Phone is optional */}
                    <input name="phone" placeholder="Phone Number (Optional)" value={formData.phone} onChange={handleInputChange} maxLength={10} className="border p-4 rounded-2xl" />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={creatingPayment}
                  className="w-full py-5 sm:py-6 bg-orange-600 text-white rounded-2xl font-semibold text-base sm:text-lg hover:bg-orange-700 disabled:bg-gray-400 transition"
                >
                  {creatingPayment ? "Saving..." : editingId ? "Update Payment Method" : "Save Payment Method"}
                </button>
              </form>

              <h3 className="font-semibold text-lg mb-5">
                Existing Payment Methods ({paymentMethods.length}) {paymentLoading && "(Loading...)"}
              </h3>

              <div className="space-y-4 sm:space-y-6">
                {paymentMethods.length > 0 ? paymentMethods.map((pm) => (
                  <div key={pm._id} className="border rounded-3xl p-5 sm:p-6 bg-white hover:shadow-md transition">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
                      <div className="flex gap-4 flex-1">
                        {pm.type === "bank" ? <CreditCard size={34} className="text-indigo-600 mt-1" /> : <QrCode size={34} className="text-teal-600 mt-1" />}
                        <div>
                          <p className="font-bold text-lg sm:text-xl capitalize">{pm.type} Payment</p>
                          {pm.type === "bank" ? (
                            <div className="mt-3 space-y-1 text-sm text-gray-700">
                              <p><span className="text-gray-500">Bank:</span> {pm.bankName}</p>
                              <p><span className="text-gray-500">Branch:</span> {pm.branchName}</p>
                              <p><span className="text-gray-500">Account:</span> {pm.accountNumber}</p>
                              <p><span className="text-gray-500">IFSC:</span> {pm.ifsc}</p>
                              <p><span className="text-gray-500">Account Type:</span> {pm.accountType}</p>
                              <p><span className="text-gray-500">Beneficiary:</span> {pm.beneficiary}</p>
                            </div>
                          ) : (
                            <div className="mt-3 space-y-1 text-sm text-gray-700">
                              <p><span className="text-gray-500">UPI ID:</span> {pm.upiId}</p>
                              {pm.phone && <p><span className="text-gray-500">Phone:</span> {pm.phone}</p>}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4 sm:mt-0">
                        <button onClick={() => handleEdit(pm)} className="p-3 hover:bg-blue-100 rounded-xl text-blue-600">
                          <Edit2 size={22} />
                        </button>
                        <button onClick={() => handleDelete(pm._id)} className="p-3 hover:bg-red-100 text-red-600 rounded-xl">
                          <Trash2 size={22} />
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-center py-10 text-gray-500">No payment methods added for this tour yet.</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold text-gray-800">Bookings List</h2>
                <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-600">
                  {tourBookings.filter(b => b.payment?.advance?.paid === true).length} Items
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tourBookings
                  .filter(booking => booking.payment?.advance?.paid === true)
                  .map(booking => {
                    const lead = booking.travellers?.[0] || {};
                    const name = [lead.title, lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Guest";
                    const balanceAmt = booking.payment?.balance?.amount || 0;
                    const state = handleBalanceUpdateLogic(booking);

                    return (
                      <div
                        key={booking.tnr}
                        className={`relative flex flex-col h-full rounded-3xl border-2 overflow-hidden transition-all duration-300 
                        ${getCardColor(state.color)} ${state.blockButtons ? "opacity-95" : "hover:shadow-2xl hover:-translate-y-1"}`}
                      >
                        <div className={`absolute top-4 right-4 px-4 py-1.5 text-xs font-semibold rounded-3xl shadow-sm ${getStatusBadgeColor(state.color)}`}>
                          {state.statusText}
                        </div>

                        <div className="p-6 pt-12">
                          <div className="flex items-center gap-2 mb-4">
                            <h3 className="font-bold text-xl text-gray-800">{name}</h3>
                          </div>
                          <div className="flex items-center gap-2 mb-6">
                            <p className="font-mono text-sm text-gray-500">{booking.tnr}</p>
                            <button onClick={() => handleCopyTNR(booking.tnr)} className="text-blue-600 hover:text-blue-700">
                              <Copy size={18} />
                            </button>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Balance Due</p>
                            <p className={`text-4xl font-bold tracking-tight ${balanceAmt >= 0 ? "text-red-600" : "text-green-600"}`}>
                              ₹{balanceAmt.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        <div className="mt-auto p-6 pt-0 grid grid-cols-2 gap-3">
                          <button
                            onClick={() => copyPaymentLink(booking)}
                            disabled={state.blockButtons}
                            className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold transition-all
                              ${state.blockButtons
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 active:scale-95"}`}
                          >
                            <Copy size={18} /> Copy
                          </button>
                          <button
                            onClick={() => shareLink(booking)}
                            disabled={state.blockButtons}
                            className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold transition-all
                              ${state.blockButtons
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700 text-white active:scale-95"}`}
                          >
                            <Share2 size={18} /> Share
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BalanceUpdatePage;
