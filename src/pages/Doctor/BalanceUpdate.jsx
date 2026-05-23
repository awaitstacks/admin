import React, { useState, useEffect, useContext } from "react";
import { TourContext } from "../../context/TourContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Copy, Share2, Users, IndianRupee, CheckCircle, Clock,
  AlertTriangle, Edit2, Trash2, Plus, CreditCard, QrCode
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

  // Tour & Booking States
  const [selectedTourId, setSelectedTourId] = useState("");
  const [tourBookings, setTourBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Payment Methods States (Tour Specific)
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [formType, setFormType] = useState("bank");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    bankName: "",
    branchName: "",
    accountNumber: "",
    ifsc: "",
    swift: "",
    beneficiary: "",
    accountType: "",
    upiId: "",
    phone: ""
  });
  const [qrFile, setQrFile] = useState(null);
  const [previewQr, setPreviewQr] = useState(null);
  const [creatingPayment, setCreatingPayment] = useState(false);

  const refreshBookings = async () => {
    if (selectedTourId) {
      const res = await getBookings(selectedTourId);
      if (res.success) {
        setTourBookings(res.bookings || []);
      }
    }
  };

  const fetchTourPaymentMethods = async (tourId) => {
    if (!tourId) return;
    setPaymentLoading(true);
    try {
      const res = await getTourPaymentMethods(tourId);
      if (res.success) {
        setPaymentMethods(res.paymentMethods || []);
      } else {
        setPaymentMethods([]);
      }
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

    if (!tourId) {
      setTourBookings([]);
      return;
    }

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

  // Statistics
  const totalTravellers = tourBookings.reduce((sum, b) => sum + (b.travellers?.length || 0), 0);
  const advancePaid = tourBookings.filter(b => b.payment?.advance?.paid).length;
  const balancePending = tourBookings.filter(b => b.payment?.advance?.paid && !b.payment?.balance?.paid).length;
  const balancePaid = tourBookings.filter(b => b.payment?.balance?.paid).length;

  
  // ==================== PAYMENT MESSAGE - BOLD LEFT SIDE ====================
  const getPaymentMessage = (booking) => {
    const lead = booking.travellers?.[0] || {};
    const name = [lead.title, lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Dear Guest";

    const balanceAmt = booking.payment?.balance?.amount || 0;
    const tnr = booking.tnr;
    const travellerCount = booking.travellers?.length || 1;
    const travellerNames = booking.travellers?.map(t =>
      [t.title, t.firstName, t.lastName].filter(Boolean).join(" ")
    ).join(", ") || name;

    // Exact Tour Title from tourList
    const selectedTour = tourList.find(t => t._id === selectedTourId);
    const tourTitle = selectedTour?.title ||
      booking.tour?.title ||
      booking.tourName ||
      booking.tourTitle ||
      "TOUR";

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
*BOOKING ID*    : ${tnr}
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
    const message = getPaymentMessage(booking);
    navigator.clipboard.writeText(message).then(() => {
      toast.success("Message copied successfully!");
    });
  };

  const shareLink = (booking) => {
    const message = getPaymentMessage(booking);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
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
      if (!formData.upiId?.trim() || !formData.phone?.trim()) {
        toast.error("UPI ID and Phone are required");
        return false;
      }
      if (!/^\d{10}$/.test(formData.phone)) {
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
      payload.append("phone", formData.phone.trim());
      if (qrFile) payload.append("qrImage", qrFile);
    }

    try {
      let res;
      if (editingId) {
        res = await updateTourPaymentMethod(selectedTourId, editingId, payload);
        if (res?.success) {
          toast.success();
        }
      } else {
        res = await createTourPaymentMethod(selectedTourId, payload);
        if (res?.success) {
          toast.success("Payment method saved successfully!");
        }
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

        {/* Header */}
        <header className="mb-6 sm:mb-10 text-center">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4">
            <AlertTriangle className="text-orange-600" size={36} />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Balance Reminder
            </h1>
          </div>
        </header>

        {/* Tour Selector */}
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
            {/* Statistics */}
            <div className="mb-8 bg-orange-50/60 p-4 sm:p-6 rounded-2xl border border-orange-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                {[
                  { label: "Total Travellers", value: totalTravellers, icon: Users, color: "orange" },
                  { label: "Advance Paid", value: advancePaid, icon: CheckCircle, color: "emerald" },
                  { label: "Balance Pending", value: balancePending, icon: Clock, color: "amber" },
                  { label: "Balance Paid", value: balancePaid, icon: IndianRupee, color: "green" },
                ].map((s, i) => (
                  <div key={i} className="bg-white p-4 sm:p-5 rounded-xl shadow-sm text-center">
                    <s.icon className={`mx-auto mb-3 text-${s.color}-600`} size={28} />
                    <div className="text-2xl sm:text-3xl font-bold">{s.value}</div>
                    <div className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods Section */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-8 mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-xl sm:text-2xl font-bold">Payment Methods (This Tour)</h2>
                
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
                    <input name="phone" placeholder="Phone Number (10 digits) *" value={formData.phone} onChange={handleInputChange} maxLength={10} className="border p-4 rounded-2xl" required />
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
                              <p><span className="text-gray-500">Phone:</span> {pm.phone}</p>
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

            {/* Bookings List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold text-gray-800">Bookings List</h2>
                <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-600">
                  {tourBookings.length} Items
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {tourBookings.map(booking => {
                  const lead = booking.travellers?.[0] || {};
                  const name = [lead.title, lead.firstName, lead.lastName].filter(Boolean).join(" ");
                  const balanceAmt = booking.payment?.balance?.amount || 0;
                  const isPaid = booking.payment?.balance?.paid;

                  return (
                    <div key={booking.tnr} className={`relative flex flex-col h-full rounded-3xl border transition-all ${isPaid ? "bg-green-50/70 border-green-200" : "bg-white border-gray-100 shadow-sm hover:shadow-xl"}`}>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-5">
                          <div>
                            <h3 className="font-bold text-xl">{name}</h3>
                            <p className="font-mono text-sm text-gray-500 mt-1">{booking.tnr}</p>
                          </div>
                          {isPaid ? (
                            <div className="px-4 py-1 bg-green-500 text-white text-xs font-bold rounded-2xl flex items-center gap-1">PAID</div>
                          ) : (
                            <div className="px-4 py-1 bg-amber-400 text-white text-xs font-bold rounded-2xl">PENDING</div>
                          )}
                        </div>

                        <div className="mb-6">
                          <p className="text-sm text-gray-500">Balance Due</p>
                          <p className="text-4xl font-bold text-red-600">₹{balanceAmt}</p>
                        </div>
                      </div>

                      <div className="mt-auto p-6 pt-0 grid grid-cols-2 gap-3">
                        <button
                          onClick={() => copyPaymentLink(booking)}
                          className="flex items-center justify-center gap-2 py-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl font-semibold transition"
                        >
                          <Copy size={18} /> Copy
                        </button>
                        <button
                          onClick={() => shareLink(booking)}
                          className="flex items-center justify-center gap-2 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-semibold transition"
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