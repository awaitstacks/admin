/* eslint-disable no-unused-vars */
// src/components/admin/PaymentDetails.jsx
import React, { useState, useEffect, useContext, useRef } from "react";
import { TourContext } from "../../context/TourContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Make sure this is imported
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  X,
  CreditCard,
  QrCode,
} from "lucide-react";

const PaymentDetails = () => {
  const {
    getPaymentMethods,
    createNewPaymentMethod,
    updateExistingPaymentMethod,
    deletePaymentMethodById,
  } = useContext(TourContext);

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formType, setFormType] = useState("bank");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    accountNumber: "",
    ifsc: "",
    swift: "",
    beneficiary: "",
    accountType: "",
    upiId: "",
    phone: "",
  });
  const [qrFile, setQrFile] = useState(null);
  const [previewQr, setPreviewQr] = useState(null);
  const [formError, setFormError] = useState("");

  // Ref to track toast IDs created on this page
  const toastIds = useRef([]);

  // Local toast helper – only for this page
  const showToast = (type, message) => {
    const id = toast[type](message, {
      position: "top-right",
      autoClose: type === "success" ? 4000 : 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      containerId: "payment-details-toast", // Unique container ID for this page
    });
    toastIds.current.push(id);
  };

  // Cleanup: Dismiss ALL toasts from this page when unmounting (navigating away)
  useEffect(() => {
    return () => {
      // Dismiss every tracked toast
      toastIds.current.forEach((id) => toast.dismiss(id));
      toastIds.current = [];
      // Also clear any remaining toasts in this container
      toast.dismiss({ containerId: "payment-details-toast" });
    };
  }, []);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    setLoading(true);
    try {
      const res = await getPaymentMethods();
      if (res?.success) {
        setPaymentMethods(res.paymentMethods || []);
      } else {
        showToast("error", res?.message || "Failed to load payment methods");
      }
    } catch (err) {
      showToast("error", "Error loading payment methods");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("error", "Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast("error", "File size should be less than 5MB");
        return;
      }
      setQrFile(file);
      setPreviewQr(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    if (formType === "bank") {
      if (
        !formData.accountNumber.trim() ||
        !formData.ifsc.trim() ||
        !formData.beneficiary.trim() ||
        !formData.accountType.trim()
      ) {
        setFormError("All bank fields except Swift are required.");
        showToast("error", "All bank fields except Swift are required.");
        return false;
      }
    } else if (formType === "upi") {
      if (!formData.upiId.trim() || !formData.phone.trim()) {
        setFormError("UPI ID and Phone are required.");
        showToast("error", "UPI ID and Phone are required.");
        return false;
      }
      if (!/^\d{10}$/.test(formData.phone)) {
        setFormError("Phone must be exactly 10 digits.");
        showToast("error", "Phone must be exactly 10 digits.");
        return false;
      }
    }
    return true;
  };

  const prepareFormData = () => {
    const data = new FormData();
    data.append("type", formType);

    if (formType === "bank") {
      data.append("accountNumber", formData.accountNumber.trim());
      data.append("ifsc", formData.ifsc.trim().toUpperCase());
      if (formData.swift.trim()) data.append("swift", formData.swift.trim());
      data.append("beneficiary", formData.beneficiary.trim());
      data.append("accountType", formData.accountType.trim());
    } else {
      data.append("upiId", formData.upiId.trim());
      data.append("phone", formData.phone.trim());
      if (qrFile) data.append("qrImage", qrFile);
    }

    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const payload = prepareFormData();

    try {
      let res;
      if (editingId) {
        res = await updateExistingPaymentMethod(editingId, payload);
      } else {
        res = await createNewPaymentMethod(payload);
      }

      if (res?.success) {
        showToast(
          "success",
          editingId
            ? "Payment method updated successfully"
            : "Payment method created successfully",
        );
        await loadPaymentMethods();
        resetForm();
      } else {
        showToast("error", res?.message || "Operation failed");
      }
    } catch (err) {
      showToast("error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (method) => {
    setFormType(method.type);
    setEditingId(method._id);
    setFormData({
      accountNumber: method.accountNumber || "",
      ifsc: method.ifsc || "",
      swift: method.swift || "",
      beneficiary: method.beneficiary || "",
      accountType: method.accountType || "",
      upiId: method.upiId || "",
      phone: method.phone || "",
    });
    setQrFile(null);
    setPreviewQr(method.qrImage || null);
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payment method? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      const res = await deletePaymentMethodById(id);

      if (res?.success) {
        showToast("success", "Payment method deleted successfully");
        await loadPaymentMethods();
      } else {
        showToast("error", res?.message || "Failed to delete payment method");
      }
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Error deleting payment method. Please try again.";

      showToast("error", errMsg);
    }
  };

  const resetForm = () => {
    setFormType("bank");
    setEditingId(null);
    setFormData({
      accountNumber: "",
      ifsc: "",
      swift: "",
      beneficiary: "",
      accountType: "",
      upiId: "",
      phone: "",
    });
    setQrFile(null);
    setPreviewQr(null);
    setFormError("");
  };

  return (
    <>
      {/* Local ToastContainer – only for this page */}
      <ToastContainer
        containerId="payment-details-toast"
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3} // Limit to 3 toasts visible at once
      />

      <div className="min-h-screen bg-gray-50/50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Centered Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Payment Methods
            </h1>
            <p className="mt-3 text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
              Securely manage bank accounts and UPI / QR options for your
              travellers
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-10 mb-12">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Type Selection */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-10">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="bank"
                    checked={formType === "bank"}
                    onChange={() => setFormType("bank")}
                    className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-gray-800 font-semibold text-lg">
                    Bank Transfer
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="upi"
                    checked={formType === "upi"}
                    onChange={() => setFormType("upi")}
                    className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-gray-800 font-semibold text-lg">
                    UPI / QR Code
                  </span>
                </label>
              </div>

              {/* Form Fields */}
              {formType === "bank" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      name="ifsc"
                      value={formData.ifsc}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 border border-gray-300 rounded-xl uppercase text-base tracking-wider focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Swift Code (Optional)
                    </label>
                    <input
                      type="text"
                      name="swift"
                      value={formData.swift}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Beneficiary Name
                    </label>
                    <input
                      type="text"
                      name="beneficiary"
                      value={formData.beneficiary}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Account Type
                    </label>
                    <input
                      type="text"
                      name="accountType"
                      value={formData.accountType}
                      onChange={handleInputChange}
                      placeholder="e.g., Savings / Current"
                      className="w-full px-5 py-3.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleInputChange}
                      placeholder="e.g., yourname@okaxis / yourname@upi"
                      className="w-full px-5 py-3.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Phone Number (GPay / PhonePe)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="w-full px-5 py-3.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      QR Code Image
                    </label>
                    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                      <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 px-6 py-3 rounded-xl border border-gray-300 transition text-base font-medium shadow-sm">
                        Select QR Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>

                      {previewQr && (
                        <div className="relative">
                          <img
                            src={previewQr}
                            alt="QR Code Preview – Ready to Scan"
                            className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-2xl border-2 border-gray-300 shadow-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setQrFile(null);
                              setPreviewQr(null);
                            }}
                            className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full p-2 shadow-md hover:bg-red-600 transition"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-gray-500 text-center sm:text-left">
                      Recommended: Clear PNG or JPG • Max 5MB • Ensure QR is
                      scannable
                    </p>
                  </div>
                </div>
              )}

              {/* Form Error */}
              {formError && (
                <p className="text-red-600 text-base bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                  {formError}
                </p>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-5 pt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-3.5 px-8 rounded-xl hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-3 font-semibold text-base shadow-md"
                >
                  {loading && <Loader2 className="animate-spin" size={20} />}
                  {editingId ? "Update Payment Method" : "Add Payment Method"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-200 text-gray-800 py-3.5 px-8 rounded-xl hover:bg-gray-300 transition font-semibold text-base"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Payment Methods List */}
          <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 text-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                All Payment Methods ({paymentMethods.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-20 flex justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="p-20 text-center text-gray-600 text-lg">
                No payment methods added yet. Start by adding one above.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {paymentMethods.map((method) => (
                  <div
                    key={method._id}
                    className="p-6 lg:p-8 hover:bg-gray-50/70 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8">
                      <div className="flex items-start gap-6 flex-1">
                        {method.type === "bank" ? (
                          <CreditCard
                            className="text-indigo-600 mt-2"
                            size={32}
                          />
                        ) : (
                          <QrCode className="text-teal-600 mt-2" size={32} />
                        )}

                        <div className="space-y-3 flex-1">
                          <h3 className="font-bold text-gray-900 text-xl capitalize">
                            {method.type} Payment
                          </h3>

                          {method.type === "bank" ? (
                            <div className="text-lg text-gray-700 space-y-2">
                              <p>
                                <span className="font-semibold text-gray-800">
                                  Account Number:
                                </span>{" "}
                                {method.accountNumber}
                              </p>
                              <p>
                                <span className="font-semibold text-gray-800">
                                  IFSC Code:
                                </span>{" "}
                                {method.ifsc}
                              </p>
                              {method.swift && (
                                <p>
                                  <span className="font-semibold text-gray-800">
                                    Swift Code:
                                  </span>{" "}
                                  {method.swift}
                                </p>
                              )}
                              <p>
                                <span className="font-semibold text-gray-800">
                                  Beneficiary:
                                </span>{" "}
                                {method.beneficiary}
                              </p>
                              <p className="text-base text-gray-600 italic pt-1">
                                {method.accountType}
                              </p>
                            </div>
                          ) : (
                            <div className="text-lg text-gray-700 space-y-2">
                              <p>
                                <span className="font-semibold text-gray-800">
                                  UPI ID:
                                </span>{" "}
                                {method.upiId}
                              </p>
                              <p>
                                <span className="font-semibold text-gray-800">
                                  Phone:
                                </span>{" "}
                                {method.phone}
                              </p>
                              {method.qrImage && (
                                <div className="mt-5">
                                  <p className="font-semibold text-gray-800 mb-3 text-lg">
                                    QR Code (Scan to Pay):
                                  </p>
                                  <img
                                    src={method.qrImage}
                                    alt="Payment QR Code – Scan with Phone"
                                    className="w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-2xl border-2 border-gray-300 shadow-lg mx-auto sm:mx-0"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-5 self-start sm:self-center justify-center sm:justify-end mt-6 sm:mt-0">
                        <button
                          onClick={() => handleEdit(method)}
                          className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                          title="Edit this payment method"
                        >
                          <Edit size={24} />
                        </button>
                        <button
                          onClick={() => handleDelete(method._id)}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition"
                          title="Delete this payment method"
                        >
                          <Trash2 size={24} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentDetails;
