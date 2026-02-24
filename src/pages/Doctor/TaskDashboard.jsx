/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useLocation } from "react-router-dom";
import { TourContext } from "../../context/TourContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  IndianRupee,
  Receipt,
  CheckCircle,
  FileText,
  Loader2,
  Check,
  Calendar,
  Users,
  Copy,
  MapPin,
  Clock,
  FileCheck,
  Briefcase,
} from "lucide-react";

const TaskDashboard = () => {
  const {
    ttoken,
    allBookings: bookings,
    getAllBookings,
    taskMarkAdvanceReceiptSent,
    taskMarkBalanceReceiptSent,
    taskMarkModifyReceipt,
    taskCompleteBooking,
    taskMarkCancellationReceiptSent,
    taskMarkManageBookingReceiptSent,
  } = useContext(TourContext);

  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [expanded, setExpanded] = useState({});
  const [showMore, setShowMore] = useState({});

  const location = useLocation();

  useEffect(() => {
    return () => toast.dismiss();
  }, [location]);

  useEffect(() => {
    if (!ttoken) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        await getAllBookings();
      } catch (err) {
        console.error(err);
        toast.error("Failed to load tasks");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [ttoken, getAllBookings]);

  const filters = {
    advanceReceipt: (b) =>
      (b.payment?.advance?.paid &&
        !b.payment?.balance?.paid &&
        !b.receipts?.advanceReceiptSent &&
        b.travellers?.some(
          (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin,
        )) ||
      (b.payment?.advance?.paid &&
        b.payment?.balance?.paid &&
        !b.receipts?.advanceReceiptSent &&
        b.travellers?.some(
          (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin,
        )),

    balanceReceipt: (b) =>
      b?.payment?.advance?.paid === true &&
      b?.payment?.balance?.paid === true &&
      b?.receipts?.balanceReceiptSent !== true &&
      (b?.travellers || []).some(
        (t) => !t?.cancelled?.byTraveller && !t?.cancelled?.byAdmin,
      ),

    modifyReceipt: (b) =>
      b?.isTripCompleted === true &&
      (b?.travellers || []).some(
        (t) => !t?.cancelled?.byTraveller && !t?.cancelled?.byAdmin,
      ),

    uncompleted: (b) =>
      b?.payment?.advance?.paid === true &&
      b?.receipts?.advanceReceiptSent === true &&
      b?.payment?.balance?.paid === true &&
      b?.receipts?.balanceReceiptSent === true &&
      b?.isTripCompleted === false &&
      b?.isBookingCompleted !== true,

    unverified: (b) =>
      !b?.payment?.advance?.paid &&
      !b?.payment?.balance?.paid &&
      b.travellers?.some(
        (t) => !t?.cancelled?.byTraveller && !t?.cancelled?.byAdmin,
      ),

    cancellationReceipt: (b) => b?.cancellationReceipt === true,

    manageBookingReceipt: (b) => b?.manageBookingReceipt === true,
  };

  const categorized = useMemo(
    () => ({
      advanceReceipt: bookings
        .filter(filters.advanceReceipt)
        .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate)),
      balanceReceipt: bookings
        .filter(filters.balanceReceipt)
        .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate)),
      modifyReceipt: bookings
        .filter(filters.modifyReceipt)
        .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate)),
      uncompleted: bookings
        .filter(filters.uncompleted)
        .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate)),
      unverified: bookings
        .filter(filters.unverified)
        .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate)),
      cancellationReceipt: bookings
        .filter(filters.cancellationReceipt)
        .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate)),
      manageBookingReceipt: bookings
        .filter(filters.manageBookingReceipt)
        .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate)),
    }),
    [bookings],
  );

  const totalPendingTasks = useMemo(() => {
    return Object.values(categorized).reduce((sum, arr) => sum + arr.length, 0);
  }, [categorized]);

  useEffect(() => {
    if (!isLoading) {
      if (totalPendingTasks > 0) {
        toast.info(`${totalPendingTasks} pending tasks`, {
          toastId: "pending-tasks-count",
        });
      } else {
        toast.success("Task Dashboard loaded Successfully", {
          toastId: "no-pending-tasks",
        });
      }
    }
  }, [isLoading, totalPendingTasks]);

  const metrics = [
    {
      label: "Total Pending Tasks",
      value: totalPendingTasks,
      Icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Advance receipts Pending",
      value: categorized.advanceReceipt.length,
      Icon: IndianRupee,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Balance receipts Pending",
      value: categorized.balanceReceipt.length,
      Icon: Receipt,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      label: "Modified receipts Pending",
      value: categorized.modifyReceipt.length,
      Icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Booking Completion",
      value: categorized.uncompleted.length,
      Icon: CheckCircle,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      label: "Unverified",
      value: categorized.unverified.length,
      Icon: Clock,
      color: "text-teal-600",
      bg: "bg-teal-100",
    },
    {
      label: "Cancellation Receipts Pending",
      value: categorized.cancellationReceipt.length,
      Icon: FileCheck,
      color: "text-rose-600",
      bg: "bg-rose-100",
    },
    {
      label: "Manage Booking Receipts Pending",
      value: categorized.manageBookingReceipt.length,
      Icon: Briefcase,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
  ];

  const handleMarkAction = useCallback(
    async (tnr, type) => {
      const successMessages = {
        advance: "Advance Receipt marked as Complete!",
        balance: "Balance Receipt marked as Complete!",
        modify: "Modify Receipt marked as Complete!",
        completeBooking: "Booking marked as Completed!",
        cancellationReceipt: "Cancellation Receipt marked as Complete!",
        manageBookingReceipt: "Manage Booking Receipt marked as Complete!",
      };

      if (!window.confirm(`Mark this as Complete?`)) return;

      if (!tnr || typeof tnr !== "string" || tnr.trim().length !== 6) {
        toast.error("Valid TNR is required to mark receipt");
        return;
      }

      setActionLoading((prev) => ({ ...prev, [tnr]: type }));

      try {
        let res;
        if (type === "advance") res = await taskMarkAdvanceReceiptSent(tnr);
        else if (type === "balance")
          res = await taskMarkBalanceReceiptSent(tnr);
        else if (type === "modify") res = await taskMarkModifyReceipt(tnr);
        else if (type === "completeBooking")
          res = await taskCompleteBooking(tnr);
        else if (type === "cancellationReceipt")
          res = await taskMarkCancellationReceiptSent(tnr);
        else if (type === "manageBookingReceipt")
          res = await taskMarkManageBookingReceiptSent(tnr);

        if (res?.success) {
          toast.success(successMessages[type]);
          await getAllBookings();
        } else {
          toast.error(res?.message || "Failed");
        }
      } catch (err) {
        toast.error("Something went wrong");
      } finally {
        setActionLoading((prev) => ({ ...prev, [tnr]: null }));
      }
    },
    [
      taskMarkAdvanceReceiptSent,
      taskMarkBalanceReceiptSent,
      taskMarkModifyReceipt,
      taskCompleteBooking,
      taskMarkCancellationReceiptSent,
      taskMarkManageBookingReceiptSent,
      getAllBookings,
    ],
  );

  const toggleExpand = (category, tnr) => {
    if (!tnr) return;
    setExpanded((prev) => ({
      ...prev,
      [category]: { ...prev[category], [tnr]: !prev[category]?.[tnr] },
    }));
  };

  const toggleShowMore = (category) => {
    setShowMore((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

  const copyToClipboard = (text) => {
    if (!text) {
      toast.error("No TNR to copy");
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => toast.success("TNR copied!"),
      () => toast.error("Failed to copy"),
    );
  };

  const TaskCard = ({ booking, category, type }) => {
    const firstTrav = booking.travellers?.[0] || {};
    const travellerName =
      `${firstTrav.firstName || ""} ${firstTrav.lastName || ""}`.trim() ||
      "Unknown";
    const isActing = actionLoading[booking.tnr] === type;
    const showActionButton = category !== "unverified";

    // Safety: skip rendering if no TNR
    if (!booking.tnr) {
      return (
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-red-700 text-sm">
          Booking missing TNR – cannot display
        </div>
      );
    }

    return (
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-4 cursor-pointer"
        onClick={() => toggleExpand(category, booking.tnr)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
              {category === "unverified" && (
                <Clock className="w-5 h-5 text-blue-600" />
              )}
              {category === "advanceReceipt" && (
                <IndianRupee className="w-5 h-5 text-blue-600" />
              )}
              {category === "balanceReceipt" && (
                <Receipt className="w-5 h-5 text-blue-600" />
              )}
              {category === "modifyReceipt" && (
                <FileText className="w-5 h-5 text-blue-600" />
              )}
              {category === "uncompleted" && (
                <CheckCircle className="w-5 h-5 text-blue-600" />
              )}
              {category === "cancellationReceipt" && (
                <FileCheck className="w-5 h-5 text-rose-600" />
              )}
              {category === "manageBookingReceipt" && (
                <Briefcase className="w-5 h-5 text-indigo-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-base break-words whitespace-normal leading-snug">
                {booking.tourData?.title || booking.tour?.title || "Tour"}
              </p>
              <p className="text-sm text-gray-600 mt-0.5 break-words whitespace-normal">
                <strong>{travellerName}</strong>
              </p>
            </div>
          </div>

          {showActionButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAction(booking.tnr, type);
              }}
              disabled={isActing}
              className={`ml-3 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white rounded-lg transition ${
                isActing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isActing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span className="hidden xs:inline">Mark Sent</span>
            </button>
          )}
        </div>

        {expanded[category]?.[booking.tnr] && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 text-sm text-gray-700">
            {/* TNR Display */}
            <div className="flex items-center gap-2">
              <strong>TNR:</strong>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono tracking-wider font-bold">
                {booking.tnr}
              </code>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(booking.tnr);
                }}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <p>
                <strong>Email:</strong> {booking.contact?.email || "—"}
              </p>
              <p>
                <strong>Mobile:</strong> {booking.contact?.mobile || "—"}
              </p>
              <p>
                <strong>Booking Type:</strong> {booking.bookingType || "—"}
              </p>
              <p>
                <strong>Booking Date:</strong> {formatDate(booking.bookingDate)}
              </p>
              <p>
                <strong>Trip Completed:</strong>{" "}
                {booking.isTripCompleted ? "Yes" : "No"}
              </p>
              <p>
                <strong>Booking Completed:</strong>{" "}
                {booking.isBookingCompleted ? "Yes" : "No"}
              </p>
              <p>
                <strong>Manage Booking:</strong>{" "}
                {booking.manageBooking ? "Yes" : "No"}
              </p>
              <p>
                <strong>GV Cancellation Pool:</strong>{" "}
                {booking.gvCancellationPool || "—"}
              </p>
              <p>
                <strong>IRCTC Cancellation Pool:</strong>{" "}
                {booking.irctcCancellationPool || "—"}
              </p>
            </div>

            {/* Travellers */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" /> Travellers (
                {booking.travellers?.length || 0})
              </h4>
              <div className="space-y-3">
                {booking.travellers?.map((t, i) => (
                  <div
                    key={i}
                    className={`bg-gray-50 p-3 rounded-lg space-y-1 text-xs ${
                      t.cancelled?.byTraveller || t.cancelled?.byAdmin
                        ? "border-l-4 border-red-400"
                        : ""
                    }`}
                  >
                    <p className="font-medium break-words whitespace-normal leading-snug">
                      {t.title} {t.firstName} {t.lastName} ({t.age} yrs,{" "}
                      {t.gender || "—"})
                    </p>
                    <p className="break-words whitespace-normal">
                      Sharing Type: {t.sharingType || "—"}
                    </p>
                    <p className="break-words whitespace-normal">
                      Package Type: {t.packageType || "—"}
                      {t.variantPackageIndex !== null
                        ? ` (Variant ${t.variantPackageIndex})`
                        : ""}
                    </p>
                    {t.selectedAddon && (
                      <p className="break-words whitespace-normal">
                        Addon: {t.selectedAddon.name || "—"} (
                        {t.selectedAddon.price || 0})
                      </p>
                    )}
                    {t.boardingPoint && (
                      <p className="break-words whitespace-normal">
                        Boarding Point: {t.boardingPoint.stationName || "—"} (
                        {t.boardingPoint.stationCode || "—"})
                      </p>
                    )}
                    {t.deboardingPoint && (
                      <p className="break-words whitespace-normal">
                        Deboarding Point: {t.deboardingPoint.stationName || "—"}{" "}
                        ({t.deboardingPoint.stationCode || "—"})
                      </p>
                    )}
                    {t.trainSeats?.length > 0 && (
                      <p className="break-words whitespace-normal">
                        Train Seats:{" "}
                        {t.trainSeats
                          .map(
                            (s) => `${s.trainName || "—"}: ${s.seatNo || "—"}`,
                          )
                          .join(", ")}
                      </p>
                    )}
                    {t.flightSeats?.length > 0 && (
                      <p className="break-words whitespace-normal">
                        Flight Seats:{" "}
                        {t.flightSeats
                          .map(
                            (s) => `${s.flightName || "—"}: ${s.seatNo || "—"}`,
                          )
                          .join(", ")}
                      </p>
                    )}
                    <p className="break-words whitespace-pre-wrap">
                      Staff Remarks: {t.staffRemarks || "—"}
                    </p>
                    <p className="break-words whitespace-pre-wrap">
                      Remarks: {t.remarks || "—"}
                    </p>
                    {(t.cancelled?.byTraveller || t.cancelled?.byAdmin) && (
                      <p className="text-red-600 text-xs">
                        Cancelled by{" "}
                        {t.cancelled.byAdmin ? "Admin" : "Traveller"} at{" "}
                        {formatDate(t.cancelled.cancelledAt)}
                        {t.cancelled.reason
                          ? ` (Reason: ${t.cancelled.reason})`
                          : ""}
                      </p>
                    )}
                  </div>
                )) || (
                  <p className="text-gray-500 italic text-sm">No travellers</p>
                )}
              </div>
            </div>

            {/* Billing Address */}
            <div>
              <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Billing Address
              </h4>
              <p className="break-words whitespace-normal">
                {booking.billingAddress?.addressLine1 || "—"}{" "}
                {booking.billingAddress?.addressLine2 || ""}
              </p>
              <p className="break-words whitespace-normal">
                {booking.billingAddress?.city || "—"},{" "}
                {booking.billingAddress?.state || "—"} -{" "}
                {booking.billingAddress?.pincode || "—"},{" "}
                {booking.billingAddress?.country || "India"}
              </p>
            </div>

            {/* Payment Details */}
            <div>
              <h4 className="font-semibold mb-2 text-sm">Payment Details</h4>
              <p className="break-words whitespace-normal">
                Advance: ₹{booking.payment?.advance?.amount || 0} —{" "}
                {booking.payment?.advance?.paid
                  ? `Paid ${formatDate(booking.payment.advance.paidAt)}`
                  : "Pending"}
                {booking.payment?.advance?.paymentVerified && " (Verified)"}
              </p>
              <p className="break-words whitespace-normal">
                Balance: ₹{booking.payment?.balance?.amount || 0} —{" "}
                {booking.payment?.balance?.paid
                  ? `Paid ${formatDate(booking.payment.balance.paidAt)}`
                  : "Pending"}
                {booking.payment?.balance?.paymentVerified && " (Verified)"}
              </p>
            </div>

            {/* Receipts */}
            <div>
              <h4 className="font-semibold mb-2 text-sm">Receipts</h4>
              <p className="break-words whitespace-normal">
                Advance Receipt:{" "}
                {booking.receipts?.advanceReceiptSent
                  ? `Sent ${formatDate(booking.receipts.advanceReceiptSentAt)}`
                  : "Not Sent"}
              </p>
              <p className="break-words whitespace-normal">
                Balance Receipt:{" "}
                {booking.receipts?.balanceReceiptSent
                  ? `Sent ${formatDate(booking.receipts.balanceReceiptSentAt)}`
                  : "Not Sent"}
              </p>
              <p className="break-words whitespace-normal">
                Cancellation Receipt:{" "}
                {booking.cancellationReceipt ? "Marked" : "Not Marked"}
              </p>
              <p className="break-words whitespace-normal">
                Manage Booking Receipt:{" "}
                {booking.manageBookingReceipt ? "Marked" : "Not Marked"}
              </p>
            </div>

            {/* Advance Admin Remarks */}
            <div>
              <h4 className="font-semibold mb-2 text-sm">
                Advance Admin Remarks
              </h4>
              <div className="space-y-1">
                {booking.advanceAdminRemarks?.length > 0 ? (
                  booking.advanceAdminRemarks.map((r, i) => (
                    <div key={i} className="bg-gray-50 p-2 rounded text-xs">
                      <p>
                        {r.remark || "—"} (₹{r.amount || 0})
                      </p>
                      <p>Added at: {formatDate(r.addedAt)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">None</p>
                )}
              </div>
            </div>

            {/* General Admin Remarks */}
            <div>
              <h4 className="font-semibold mb-2 text-sm">Admin Remarks</h4>
              <div className="space-y-1">
                {booking.adminRemarks?.length > 0 ? (
                  booking.adminRemarks.map((r, i) => (
                    <div key={i} className="bg-gray-50 p-2 rounded text-xs">
                      <p>
                        {r.remark || "—"} (₹{r.amount || 0})
                      </p>
                      <p>Added at: {formatDate(r.addedAt)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">None</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const Section = ({ title, category, type, icon: Icon }) => {
    const items = categorized[category] || [];
    const visible = showMore[category] ? items : items.slice(0, 5);

    return (
      <section className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Icon className="w-6 h-6" />
          {title}
          <span className="text-sm font-normal text-gray-500 ml-1">
            ({items.length})
          </span>
        </h2>

        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-lg">
            No pending actions.
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {visible.map((b) => (
                <TaskCard
                  key={b.tnr}
                  booking={b}
                  category={category}
                  type={type}
                />
              ))}
            </div>

            {items.length > 5 && (
              <button
                onClick={() => toggleShowMore(category)}
                className="mt-6 w-full sm:w-auto mx-auto block px-6 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center justify-center gap-2"
              >
                {showMore[category]
                  ? "Show Less"
                  : `Show More (${items.length - 5})`}
              </button>
            )}
          </>
        )}
      </section>
    );
  };

  if (!ttoken) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-600 bg-gray-50 px-4">
        Please login to view your pending tasks.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
      />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-8 sm:mb-10 leading-tight">
          All Pending Tasks
        </h1>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="inline-block animate-spin h-12 w-12 text-blue-600" />
            <p className="mt-4 text-gray-600 text-lg">Loading tasks...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-10">
              {metrics.map((m, i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition text-center"
                >
                  <div
                    className={`w-12 h-12 ${m.bg} rounded-full flex items-center justify-center mx-auto mb-3`}
                  >
                    <m.Icon className={`w-6 h-6 ${m.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{m.label}</p>
                </div>
              ))}
            </div>

            <Section
              title="Unverified Bookings"
              category="unverified"
              type="advance"
              icon={Clock}
            />
            <Section
              title="Advance Receipts Pending"
              category="advanceReceipt"
              type="advance"
              icon={IndianRupee}
            />
            <Section
              title="Balance Receipts Pending"
              category="balanceReceipt"
              type="balance"
              icon={Receipt}
            />
            <Section
              title="Modified Receipts Pending"
              category="modifyReceipt"
              type="modify"
              icon={FileText}
            />
            <Section
              title="Cancellation Receipts Pending"
              category="cancellationReceipt"
              type="cancellationReceipt"
              icon={FileCheck}
            />
            <Section
              title="Manage Booking Receipts Pending"
              category="manageBookingReceipt"
              type="manageBookingReceipt"
              icon={Briefcase}
            />
            <Section
              title="Booking Completion Pending"
              category="uncompleted"
              type="completeBooking"
              icon={CheckCircle}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TaskDashboard;
