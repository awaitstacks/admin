/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-vars */
import { useEffect, useContext, useMemo, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { TourContext } from "../../context/TourContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ChevronDown,
  ChevronUp,
  IndianRupee,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Copy,
  FileText,
} from "lucide-react";

const TourDashboard = () => {
  const {
    tourList,
    getTourList,
    dashData,
    bookings,
    getDashData,
    getBookings,
    markAdvanceReceiptSent,
    markBalanceReceiptSent,
    markModifyReceipt,
    ttoken,
  } = useContext(TourContext);

  const [selectedTourId, setSelectedTourId] = useState("");
  const [expandedStates, setExpandedStates] = useState({
    advance: new Set(),
    balance: new Set(),
    modify: new Set(),
    uncompleted: new Set(),
  });
  const [dismissedBookings, setDismissedBookings] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  const shouldProtect = Boolean(
    selectedTourId && !isLoading && bookings && bookings.length > 0,
  );

  // Browser leave protection
  useEffect(() => {
    if (!shouldProtect) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldProtect]);

  // Back button protection
  useEffect(() => {
    if (!shouldProtect) return;

    window.history.pushState(null, null, window.location.href);

    const handlePopState = () => setShowConfirmLeave(true);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [shouldProtect]);

  const handleConfirmLeave = () => {
    setShowConfirmLeave(false);
    window.history.back();
  };

  const handleCancelLeave = () => {
    setShowConfirmLeave(false);
    window.history.pushState(null, null, window.location.href);
  };

  useEffect(() => {
    return () => toast.dismiss();
  }, [location]);

  const handleApiResponse = useCallback((response, successMsg, errorMsg) => {
    if (response?.success) {
      toast.success(successMsg || "Operation successful");
      return true;
    } else {
      toast.error(response?.message || errorMsg || "Operation failed");
      return false;
    }
  }, []);

  useEffect(() => {
    if (ttoken) {
      setIsLoading(true);
      getTourList()
        .then((res) => handleApiResponse(res, "Tours loaded"))
        .catch((err) => toast.error(err.message || "Failed to load tours"))
        .finally(() => setIsLoading(false));
    }
  }, [ttoken, getTourList, handleApiResponse]);

  useEffect(() => {
    if (ttoken && selectedTourId) {
      setIsLoading(true);
      Promise.all([getDashData(selectedTourId), getBookings(selectedTourId)])
        .then(([dashRes]) => handleApiResponse(dashRes, "Dashboard updated"))
        .catch((err) => toast.error(err.message || "Failed to load data"))
        .finally(() => setIsLoading(false));
    }
  }, [ttoken, selectedTourId, getDashData, getBookings, handleApiResponse]);

  // Stats calculation (unchanged)
  const stats = useMemo(() => {
    if (!bookings?.length) {
      return {
        totalBookings: 0,
        totalTravellers: 0,
        completedBookings: 0,
        pendingBookings: 0,
        advancePending: [],
        balancePending: [],
        uncompleted: [],
        modifyReceiptPending: [],
      };
    }

    const uniqueUsers = new Set();
    let travellerCount = 0;
    let completed = 0;
    let pending = 0;
    let advancePending = [];
    let balancePending = [];
    let uncompleted = [];
    let modifyReceiptPending = [];

    bookings.forEach((b) => {
      if (b.userId?._id) uniqueUsers.add(b.userId._id.toString());

      const activeTravellers =
        b.travellers?.filter(
          (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin,
        ) || [];

      if (b.payment?.advance?.paid && activeTravellers.length > 0) {
        travellerCount += activeTravellers.length;
      }

      const allCancelled =
        b.travellers?.every(
          (t) => t.cancelled?.byTraveller || t.cancelled?.byAdmin,
        ) || b.travellers?.length === 0;

      if (b.isBookingCompleted && !allCancelled) {
        completed++;
      } else if (!allCancelled) {
        pending++;
        uncompleted.push(b);
      }

      if (
        b.payment?.advance?.paid &&
        !b.receipts?.advanceReceiptSent &&
        activeTravellers.length > 0
      ) {
        advancePending.push(b);
      }

      if (
        b.payment?.balance?.paid &&
        !b.receipts?.balanceReceiptSent &&
        activeTravellers.length > 0
      ) {
        balancePending.push(b);
      }

      if (b.isTripCompleted && !allCancelled) {
        modifyReceiptPending.push(b);
      }
    });

    return {
      totalBookings: uniqueUsers.size,
      totalTravellers: travellerCount,
      completedBookings: completed,
      pendingBookings: pending,
      advancePending: advancePending.sort(
        (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate),
      ),
      balancePending: balancePending.sort(
        (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate),
      ),
      uncompleted: uncompleted.sort(
        (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate),
      ),
      modifyReceiptPending: modifyReceiptPending.sort(
        (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate),
      ),
    };
  }, [bookings]);

  // Toggle expand for a specific section + tnr
  const toggleExpand = (section, tnr) => {
    setExpandedStates((prev) => {
      const newSets = { ...prev };
      const sectionSet = new Set(newSets[section]);
      if (sectionSet.has(tnr)) {
        sectionSet.delete(tnr);
      } else {
        sectionSet.add(tnr);
      }
      newSets[section] = sectionSet;
      return newSets;
    });
  };

  const handleMarkReceipt = async (booking, type) => {
    if (!selectedTourId) {
      toast.error("Please select a tour first.");
      return;
    }

    const typeNames = {
      advance: "Advance Receipt",
      balance: "Balance Receipt",
      modify: "Modified Receipt",
    };

    if (!window.confirm(`Mark ${typeNames[type]} as complete?`)) return;

    setIsLoading(true);
    try {
      let res;
      if (type === "advance") {
        if (!booking.payment?.advance?.paid) {
          toast.error("Advance payment not marked as paid yet.");
          return;
        }
        res = await markAdvanceReceiptSent(booking.tnr, selectedTourId);
      } else if (type === "balance") {
        if (!booking.payment?.balance?.paid) {
          toast.error("Balance payment not marked as paid yet.");
          return;
        }
        res = await markBalanceReceiptSent(booking.tnr, selectedTourId);
      } else if (type === "modify") {
        if (!booking.isTripCompleted) {
          toast.error("Trip not marked as completed yet.");
          return;
        }
        res = await markModifyReceipt(booking.tnr, selectedTourId);
      }

      if (handleApiResponse(res, `${typeNames[type]} marked as complete`)) {
        setDismissedBookings((prev) => {
          const newSet = new Set(prev);
          newSet.add(booking.tnr);
          return newSet;
        });
      }
    } catch (err) {
      toast.error(err.message || "Failed to update receipt status");
    } finally {
      setIsLoading(false);
    }
  };

  const copyTNR = (tnr) => {
    if (!tnr) return;
    navigator.clipboard.writeText(tnr).then(
      () => toast.success("TNR copied!"),
      () => toast.error("Failed to copy"),
    );
  };

  // Render cards for a section
  const renderBookingCards = (list, type) => {
    const filtered =
      type === "advance" || type === "balance" || type === "modify"
        ? list.filter((b) => !dismissedBookings.has(b.tnr))
        : list;

    if (!filtered.length) {
      return (
        <div className="text-center py-8 text-gray-500 italic">
          🎉 No pending {type} actions — great job!
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filtered.map((booking) => {
          const isExpanded = expandedStates[type]?.has(booking.tnr);
          const firstTrav = booking.travellers?.[0] || {};
          const travellerName =
            `${firstTrav.firstName || ""} ${firstTrav.lastName || ""}`.trim() ||
            "Unknown Traveller";

          if (!booking.tnr) {
            return (
              <div
                key="missing"
                className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
              >
                <AlertTriangle size={20} className="inline mr-2" />
                Booking missing TNR — cannot display properly
              </div>
            );
          }

          return (
            <div
              key={booking.tnr}
              className="bg-white border rounded-xl shadow-sm hover:shadow transition-all overflow-hidden"
            >
              {/* Header - clickable */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer bg-gray-50 hover:bg-gray-100"
                onClick={() => toggleExpand(type, booking.tnr)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-lg text-gray-900">
                      {travellerName}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-mono font-bold text-indigo-700 tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                        {booking.tnr}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyTNR(booking.tnr);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Copy TNR"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {booking.contact?.email || "—"} •{" "}
                    {booking.contact?.mobile || "—"}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {type !== "uncompleted" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkReceipt(booking, type);
                      }}
                      disabled={isLoading}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                        isLoading
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {isLoading ? "Processing..." : "Mark Complete"}
                    </button>
                  )}
                  {isExpanded ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-5 bg-white border-t space-y-6 text-sm">
                  {/* Travellers */}
                  <div>
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                      <Users size={18} className="text-indigo-600" />
                      Travellers ({booking.travellers?.length || 0})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {booking.travellers?.map((t, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border ${
                            t.cancelled?.byTraveller || t.cancelled?.byAdmin
                              ? "bg-red-50 border-red-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <p className="font-medium">
                            {t.title} {t.firstName} {t.lastName}
                            <span className="text-gray-600 ml-2">
                              ({t.age} yrs, {t.gender || "—"})
                            </span>
                          </p>
                          <p className="mt-1">
                            <strong>Sharing:</strong> {t.sharingType || "—"}
                          </p>
                          <p>
                            <strong>Package:</strong> {t.packageType || "—"}
                            {t.variantPackageIndex != null &&
                              ` (Var ${t.variantPackageIndex})`}
                          </p>
                          {t.selectedAddon?.name && (
                            <p>
                              <strong>Add-on:</strong> {t.selectedAddon.name} (₹
                              {t.selectedAddon.price})
                            </p>
                          )}
                          {t.boardingPoint?.stationName && (
                            <p>
                              <strong>Boarding:</strong>{" "}
                              {t.boardingPoint.stationName} (
                              {t.boardingPoint.stationCode})
                            </p>
                          )}
                          {t.deboardingPoint?.stationName && (
                            <p>
                              <strong>Deboarding:</strong>{" "}
                              {t.deboardingPoint.stationName} (
                              {t.deboardingPoint.stationCode})
                            </p>
                          )}
                          {t.remarks && (
                            <p className="mt-2 italic text-gray-600">
                              Remarks: {t.remarks}
                            </p>
                          )}
                          {(t.cancelled?.byTraveller ||
                            t.cancelled?.byAdmin) && (
                            <p className="mt-2 text-red-600 font-medium">
                              Cancelled (
                              {t.cancelled.byAdmin
                                ? "by Admin"
                                : "by Traveller"}
                              )
                            </p>
                          )}
                        </div>
                      )) || (
                        <p className="text-gray-500 col-span-2">
                          No travellers
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact & Billing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Mail size={16} /> Contact
                      </h3>
                      <p>Email: {booking.contact?.email || "—"}</p>
                      <p>Mobile: {booking.contact?.mobile || "—"}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <MapPin size={16} /> Billing Address
                      </h3>
                      <p>
                        {booking.billingAddress?.addressLine1 || "—"}{" "}
                        {booking.billingAddress?.addressLine2 || ""}
                      </p>
                      <p>
                        {booking.billingAddress?.city || "—"},{" "}
                        {booking.billingAddress?.state || "—"} -{" "}
                        {booking.billingAddress?.pincode || "—"}
                      </p>
                      <p>{booking.billingAddress?.country || "India"}</p>
                    </div>
                  </div>

                  {/* Payment & Receipts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Payment Status</h3>
                      <p>
                        Advance: ₹{booking.payment?.advance?.amount || 0} —{" "}
                        {booking.payment?.advance?.paid ? (
                          <span className="text-green-600">Paid</span>
                        ) : (
                          <span className="text-red-600">Pending</span>
                        )}
                      </p>
                      <p>
                        Balance: ₹{booking.payment?.balance?.amount || 0} —{" "}
                        {booking.payment?.balance?.paid ? (
                          <span className="text-green-600">Paid</span>
                        ) : (
                          <span className="text-red-600">Pending</span>
                        )}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Receipt Status</h3>
                      <p>
                        Advance Receipt:{" "}
                        {booking.receipts?.advanceReceiptSent ? (
                          <span className="text-green-600">Sent</span>
                        ) : (
                          <span className="text-orange-600">Pending</span>
                        )}
                      </p>
                      <p>
                        Balance Receipt:{" "}
                        {booking.receipts?.balanceReceiptSent ? (
                          <span className="text-green-600">Sent</span>
                        ) : (
                          <span className="text-orange-600">Pending</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Admin Remarks */}
                  {(booking.adminRemarks?.length > 0 ||
                    booking.advanceAdminRemarks?.length > 0) && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText size={16} /> Admin Remarks
                      </h3>
                      <div className="space-y-2">
                        {booking.advanceAdminRemarks?.map((r, i) => (
                          <div
                            key={i}
                            className="bg-gray-50 p-3 rounded text-sm"
                          >
                            <p>
                              {r.remark} (₹{r.amount || 0})
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(r.addedAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                        {booking.adminRemarks?.map((r, i) => (
                          <div
                            key={i}
                            className="bg-gray-50 p-3 rounded text-sm"
                          >
                            <p>
                              {r.remark} (₹{r.amount || 0})
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(r.addedAt).toLocaleString()}
                            </p>
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
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={4000} />

      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Tour Dashboard
      </h1>

      {isLoading ? (
        <div className="text-center py-12 text-gray-600">
          Loading dashboard...
        </div>
      ) : !ttoken ? (
        <div className="text-center py-12 text-gray-600">
          Please log in to view dashboard
        </div>
      ) : (
        <>
          {/* Tour Selector */}
          <div className="mb-8 max-w-md mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Tour
            </label>
            <select
              value={selectedTourId}
              onChange={(e) => setSelectedTourId(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              <option value="">-- Select a Tour --</option>
              {tourList.map((tour) => (
                <option key={tour._id} value={tour._id}>
                  {tour.title}
                </option>
              ))}
            </select>
          </div>

          {!selectedTourId ? (
            <div className="text-center py-12 text-gray-600">
              Please select a tour to view details
            </div>
          ) : (
            <div className="space-y-10">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.totalBookings}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <p className="text-sm text-gray-600">Total Travellers</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">
                    {stats.totalTravellers}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {stats.completedBookings}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {stats.pendingBookings}
                  </p>
                </div>
              </div>

              {/* Pending Sections */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-6 border-b bg-gray-50">
                  <h2 className="text-xl font-semibold flex items-center gap-3">
                    <IndianRupee size={24} className="text-blue-600" />
                    Advance Receipt Pending ({stats.advancePending.length})
                  </h2>
                </div>
                <div className="p-6">
                  {renderBookingCards(stats.advancePending, "advance")}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-6 border-b bg-gray-50">
                  <h2 className="text-xl font-semibold flex items-center gap-3">
                    <IndianRupee size={24} className="text-yellow-600" />
                    Balance Receipt Pending ({stats.balancePending.length})
                  </h2>
                </div>
                <div className="p-6">
                  {renderBookingCards(stats.balancePending, "balance")}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-6 border-b bg-gray-50">
                  <h2 className="text-xl font-semibold flex items-center gap-3">
                    <FileText size={24} className="text-purple-600" />
                    Modified Receipts Pending (
                    {stats.modifyReceiptPending.length})
                  </h2>
                </div>
                <div className="p-6">
                  {renderBookingCards(stats.modifyReceiptPending, "modify")}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-6 border-b bg-gray-50">
                  <h2 className="text-xl font-semibold flex items-center gap-3">
                    <Clock size={24} className="text-orange-600" />
                    Uncompleted Bookings ({stats.uncompleted.length})
                  </h2>
                </div>
                <div className="p-6">
                  {renderBookingCards(stats.uncompleted, "uncompleted")}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Leave Confirmation Modal */}
      {showConfirmLeave && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={handleCancelLeave}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Leave this page?
            </h2>
            <p className="text-gray-600 mb-8">
              You are viewing dashboard for{" "}
              <strong>
                {tourList.find((t) => t._id === selectedTourId)?.title ||
                  "this tour"}
              </strong>
              .<br />
              Leaving will clear current view.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={handleCancelLeave}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLeave}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
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

export default TourDashboard;
