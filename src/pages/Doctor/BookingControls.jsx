import React, { useState, useContext, useEffect } from "react";
import { TourContext } from "../../context/TourContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookingControls = () => {
  const {
    viewTourBalance,
    updateTourBalance,
    balanceDetails,
    viewTourAdvance,
    updateTourAdvance,
    advanceDetails,
  } = useContext(TourContext);

  const [tnr, setTnr] = useState("");
  const [balanceUpdates, setBalanceUpdates] = useState([
    { remarks: "", amount: "" },
  ]);
  const [advanceUpdates, setAdvanceUpdates] = useState([
    { remarks: "", amount: "" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // ──────────────────────────────────────────────
  // UNSAVED CHANGES + BACK/SWIPE PROTECTION
  // ──────────────────────────────────────────────
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  // Detect unsaved changes
  useEffect(() => {
    const hasChanges =
      tnr.trim() !== "" ||
      balanceUpdates.some((u) => u.remarks.trim() || u.amount.trim()) ||
      advanceUpdates.some((u) => u.remarks.trim() || u.amount.trim());

    setFormIsDirty(hasChanges);
  }, [tnr, balanceUpdates, advanceUpdates]);

  // Browser refresh / tab close protection
  useEffect(() => {
    if (!formIsDirty) return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue =
        "You have unsaved changes. Are you sure you want to leave?";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formIsDirty]);

  // Back button / swipe protection
  useEffect(() => {
    if (!formIsDirty) return;

    window.history.pushState(null, null, window.location.href);

    const handlePopState = (event) => {
      event.preventDefault();
      setShowBackConfirm(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [formIsDirty]);

  const handleTnrChange = (e) => {
    const value = e.target.value.toUpperCase().trim();
    setTnr(value);
  };

  // ==================== BALANCE SECTION ====================
  const handleViewBalance = async () => {
    if (tnr.length !== 6) return; // No toast here — just disable button

    setIsLoading(true);
    const result = await viewTourBalance(tnr);
    setIsLoading(false);

    // Toast is now only in context function if fails
  };

  const handleBalanceChange = (index, field, value) => {
    const newUpdates = [...balanceUpdates];
    newUpdates[index] = { ...newUpdates[index], [field]: value || "" };
    setBalanceUpdates(newUpdates);
  };

  const addBalanceField = () =>
    setBalanceUpdates([...balanceUpdates, { remarks: "", amount: "" }]);

  const removeBalanceField = (index) => {
    if (balanceUpdates.length <= 1) return;
    if (window.confirm("Remove this update?")) {
      const filtered = balanceUpdates.filter((_, i) => i !== index);
      setBalanceUpdates(
        filtered.length ? filtered : [{ remarks: "", amount: "" }],
      );
    }
  };

  const handleUpdateBalance = async () => {
    if (tnr.length !== 6) return toast.error("Valid 6-character TNR required");

    const validUpdates = balanceUpdates
      .map((u) => ({
        remarks: u.remarks.trim(),
        amount: u.amount.trim() === "" ? undefined : Number(u.amount),
      }))
      .filter((u) => u.amount !== undefined && !isNaN(u.amount));

    if (validUpdates.length === 0)
      return toast.error("Add at least one valid amount");

    setIsLoading(true);
    const result = await updateTourBalance(tnr, validUpdates);
    setIsLoading(false);

    if (result?.success) {
      setBalanceUpdates([{ remarks: "", amount: "" }]);
      toast.success("Balance updated successfully!");
    } else {
      toast.error(result?.message || "Failed to update balance");
    }
  };

  // ==================== ADVANCE SECTION ====================
  const handleViewAdvance = async () => {
    if (tnr.length !== 6) return; // No toast here — just disable button

    setIsLoading(true);
    const result = await viewTourAdvance(tnr);
    setIsLoading(false);

    // Toast is now only in context function if fails
  };

  const handleAdvanceChange = (index, field, value) => {
    const newUpdates = [...advanceUpdates];
    newUpdates[index] = { ...newUpdates[index], [field]: value || "" };
    setAdvanceUpdates(newUpdates);
  };

  const addAdvanceField = () =>
    setAdvanceUpdates([...advanceUpdates, { remarks: "", amount: "" }]);

  const removeAdvanceField = (index) => {
    if (advanceUpdates.length <= 1) return;
    if (window.confirm("Remove this update?")) {
      const filtered = advanceUpdates.filter((_, i) => i !== index);
      setAdvanceUpdates(
        filtered.length ? filtered : [{ remarks: "", amount: "" }],
      );
    }
  };

  const handleUpdateAdvance = async () => {
    if (tnr.length !== 6) return toast.error("Valid 6-character TNR required");

    const validUpdates = advanceUpdates
      .map((u) => ({
        remarks: u.remarks.trim(),
        amount: u.amount.trim() === "" ? undefined : Number(u.amount),
      }))
      .filter(
        (u) => u.amount !== undefined && !isNaN(u.amount) && u.amount > 0,
      );

    if (validUpdates.length === 0)
      return toast.error("Add at least one positive amount");

    setIsLoading(true);
    const result = await updateTourAdvance(tnr, validUpdates);
    setIsLoading(false);

    if (result?.success) {
      setAdvanceUpdates([{ remarks: "", amount: "" }]);
      toast.success("Advance shifted to balance successfully!");
    } else {
      toast.error(result?.message || "Failed to update advance");
    }
  };

  // Helper: render amount with red if negative
  const renderAmount = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return <span>₹0</span>;
    return (
      <span className={num < 0 ? "text-red-600 font-bold" : ""}>
        ₹{Math.abs(num).toLocaleString("en-IN")}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop />

      {/* Shared TNR Input */}
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
        {/* BALANCE SECTION */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Balance Controller
          </h2>

          {balanceDetails && (
            <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-3">
                Current Balance (TNR:{" "}
                <span className="font-mono text-indigo-700">{tnr}</span>)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                <div>
                  <p>
                    <strong>Advance Amount:</strong>{" "}
                    {renderAmount(balanceDetails?.advance?.amount ?? 0)}
                  </p>
                  <p>
                    <strong>Balance Amount:</strong>{" "}
                    {renderAmount(balanceDetails?.balance?.amount ?? 0)}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Admin Remarks:</h4>
                  {Array.isArray(balanceDetails?.adminRemarks) &&
                  balanceDetails.adminRemarks.length > 0 ? (
                    <ul className="space-y-3 text-base">
                      {balanceDetails.adminRemarks.map((r, i) => (
                        <li
                          key={i}
                          className="bg-white p-3 rounded-lg shadow-sm"
                        >
                          <span className="font-medium text-gray-600">
                            {new Date(r.addedAt).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                          <br />
                          {r.remark || "No remark"}{" "}
                          {renderAmount(r.amount ?? 0)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No remarks yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-6">
              Adjust Balance (add / deduct)
            </h3>
            {balanceUpdates.map((u, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-50 p-5 rounded-xl border"
              >
                <input
                  type="text"
                  placeholder="Remarks (optional)"
                  value={u.remarks}
                  onChange={(e) =>
                    handleBalanceChange(i, "remarks", e.target.value)
                  }
                  className="flex-1 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Amount (negative = deduct)"
                  value={u.amount}
                  onChange={(e) =>
                    handleBalanceChange(i, "amount", e.target.value)
                  }
                  className="w-full md:w-48 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {balanceUpdates.length > 1 && (
                  <button
                    onClick={() => removeBalanceField(i)}
                    className="px-6 py-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addBalanceField}
              className="w-full md:w-auto px-8 py-4 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition font-medium text-lg shadow-md"
            >
              + Add Adjustment
            </button>
          </div>

          <button
            onClick={handleUpdateBalance}
            disabled={isLoading || tnr.length !== 6}
            className="mt-8 w-full px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl shadow-lg transition"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Updating Balance...
              </span>
            ) : (
              "Update Balance Now"
            )}
          </button>
        </div>

        {/* ADVANCE SECTION */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Advance Controller
          </h2>

          {advanceDetails && (
            <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-3">
                Current Advance (TNR:{" "}
                <span className="font-mono text-indigo-700">{tnr}</span>)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                <div>
                  <p>
                    <strong>Advance Amount:</strong>{" "}
                    {renderAmount(advanceDetails?.advance?.amount ?? 0)}
                  </p>
                  <p>
                    <strong>Paid:</strong>{" "}
                    {advanceDetails?.advance?.paid ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Verified:</strong>{" "}
                    {advanceDetails?.advance?.paymentVerified ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Trip Completed:</strong>{" "}
                    {advanceDetails?.isTripCompleted ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Advance Admin Remarks:</h4>
                  {Array.isArray(advanceDetails?.advanceAdminRemarks) &&
                  advanceDetails.advanceAdminRemarks.length > 0 ? (
                    <ul className="space-y-3 text-base">
                      {advanceDetails.advanceAdminRemarks.map((r, i) => (
                        <li
                          key={i}
                          className="bg-white p-3 rounded-lg shadow-sm"
                        >
                          <span className="font-medium text-gray-600">
                            {new Date(r.addedAt).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                          <br />
                          {r.remark || "No remark"}{" "}
                          {renderAmount(r.amount ?? 0)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No remarks yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-6">
              Shift Amount from Advance to Balance
            </h3>
            {advanceUpdates.map((u, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-50 p-5 rounded-xl border"
              >
                <input
                  type="text"
                  placeholder="Remarks (optional)"
                  value={u.remarks}
                  onChange={(e) =>
                    handleAdvanceChange(i, "remarks", e.target.value)
                  }
                  className="flex-1 p-4 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="number"
                  placeholder="Amount to shift (positive)"
                  value={u.amount}
                  onChange={(e) =>
                    handleAdvanceChange(i, "amount", e.target.value)
                  }
                  className="w-full md:w-48 p-4 border rounded-lg focus:ring-2 focus:ring-green-500"
                  min="1"
                />
                {advanceUpdates.length > 1 && (
                  <button
                    onClick={() => removeAdvanceField(i)}
                    className="px-6 py-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addAdvanceField}
              className="w-full md:w-auto px-8 py-4 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition font-medium text-lg shadow-md"
            >
              + Add Amount to Shift
            </button>
          </div>

          <button
            onClick={handleUpdateAdvance}
            disabled={isLoading || tnr.length !== 6}
            className="mt-8 w-full px-8 py-5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl shadow-lg transition"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Processing...
              </span>
            ) : (
              "Shift Advance to Balance"
            )}
          </button>
        </div>
      </div>

      {/* Back/Swipe/Leave Confirmation */}
      {showBackConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Unsaved Changes
            </h2>
            <p className="text-gray-600 mb-6">
              You have unsaved changes.
              <br />
              Going back will lose them.
              <br />
              Are you sure?
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => {
                  setShowBackConfirm(false);
                  window.history.pushState(null, null, window.location.href);
                }}
                className="px-8 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition"
              >
                Cancel (Stay)
              </button>
              <button
                onClick={() => {
                  setShowBackConfirm(false);
                  history.back();
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

export default BookingControls;
