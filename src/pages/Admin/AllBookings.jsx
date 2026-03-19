/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";

const AllBookings = () => {
  const {
    aToken,
    bookings,
    getAllBookings,
    rejectBooking,
    deleteBooking, // ← NEW: coming from context
  } = useContext(TourAdminContext);

  const location = useLocation();

  const [expandedRow, setExpandedRow] = useState(null);
  const [filters, setFilters] = useState({
    tour: "",
    tnr: "",
    contact: "",
    payment: "",
    status: "",
  });
  const [rejectedTravellers, setRejectedTravellers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const shouldProtect = Boolean(bookings && bookings.length > 0 && !isLoading);

  // ─── Browser close / reload protection ─────────────────────────────
  useEffect(() => {
    if (!shouldProtect) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldProtect]);

  // ─── Back button protection ────────────────────────────────────────
  useEffect(() => {
    if (!shouldProtect) return;

    window.history.pushState(null, null, window.location.href);

    const handlePopState = () => {
      setShowConfirmLeave(true);
    };

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

  // Clear toasts on route change
  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, [location]);

  // Handle API responses uniformly
  const handleApiResponse = useCallback(
    (response, successMessage, errorMessage) => {
      if (response && typeof response === "object" && "success" in response) {
        if (response.success) {
          toast.success(successMessage || "Operation completed");
          return true;
        } else {
          toast.error(response.message || errorMessage || "Operation failed");
          return false;
        }
      } else {
        toast.error("Invalid server response");
        return false;
      }
    },
    [],
  );

  // Fetch all bookings
  useEffect(() => {
    if (aToken) {
      setIsLoading(true);
      getAllBookings()
        .then((response) => {
          handleApiResponse(
            response,
            "Bookings loaded successfully",
            "Failed to load bookings",
          );
        })
        .catch((error) => {
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Failed to fetch bookings",
          );
        })
        .finally(() => setIsLoading(false));
    }
  }, [aToken, getAllBookings, handleApiResponse]);

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const copyToClipboard = (text, label = "TNR") => {
    if (!text) {
      toast.error(`No ${label} to copy`);
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${label} copied!`),
      () => toast.error(`Failed to copy ${label}`),
    );
  };

  // ─── Reject handler (existing) ─────────────────────────────────────
  const handleReject = async (tnr, travellerId) => {
    const confirmReject = window.confirm(
      "Are you sure you want to reject this traveller's booking?",
    );
    if (!confirmReject) return;

    setIsLoading(true);
    try {
      const response = await rejectBooking(tnr, [travellerId]);
      if (
        handleApiResponse(
          response,
          "Traveller booking rejected successfully",
          "Failed to reject booking",
        )
      ) {
        setRejectedTravellers((prev) => ({
          ...prev,
          [travellerId]: true,
        }));
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to reject booking",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ─── NEW: Delete entire booking handler ────────────────────────────
  const handleDeleteBooking = (tnr) => {
    if (!tnr) {
      toast.error("No booking TNR found");
      return;
    }

    const confirmDelete = window.confirm(
      `⚠️ PERMANENT DELETE WARNING ⚠️\n\n` +
        `You are about to permanently delete the booking with TNR: ${tnr}\n\n` +
        `This action:\n` +
        `• Cannot be undone\n` +
        `• Will remove all traveller data, payments, seat/room allocations\n` +
        `• Should only be used for test/fraudulent bookings\n\n` +
        `Are you absolutely sure?`,
    );

    if (!confirmDelete) return;

    setIsLoading(true);

    deleteBooking(tnr)
      .then(() => {
        // List auto-refreshes inside deleteBooking()
        toast.success(`Booking ${tnr} permanently deleted`);
      })
      .catch((err) => {
        console.error("Delete failed:", err);
      })
      .finally(() => setIsLoading(false));
  };

  // Filtered & sorted bookings
  const filteredBookings = bookings
    ?.filter((b) => {
      const firstTraveller = b.travellers?.[0];
      const displayName = firstTraveller
        ? `${firstTraveller.firstName} ${firstTraveller.lastName}`.toLowerCase()
        : "";

      const tourMatch = b?.tourData?.title
        ?.toLowerCase()
        .includes(filters.tour.toLowerCase());

      const tnrMatch =
        !filters.tnr ||
        (b.tnr && b.tnr.toLowerCase().includes(filters.tnr.toLowerCase()));

      const contactMatch =
        displayName.includes(filters.contact.toLowerCase()) ||
        b?.contact?.mobile
          ?.toLowerCase()
          .includes(filters.contact.toLowerCase());

      const paymentStatus = `${
        b.payment?.advance?.paid ? "advance-paid" : "advance-pending"
      } ${b.payment?.balance?.paid ? "balance-paid" : "balance-pending"}`;

      const paymentMatch = paymentStatus.includes(
        filters.payment.toLowerCase(),
      );

      const statusValue = b.isBookingCompleted
        ? "completed"
        : b.cancelled?.byAdmin || b.cancelled?.byTraveller
          ? "cancelled"
          : "under completion";

      const statusMatch = statusValue.includes(filters.status.toLowerCase());

      return (
        tourMatch && tnrMatch && contactMatch && paymentMatch && statusMatch
      );
    })
    .sort(
      (a, b) =>
        new Date(b.bookingDate || b.createdAt) -
        new Date(a.bookingDate || a.createdAt),
    );

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">
        Super Admin — All Bookings
      </h1>

      {!aToken ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-red-600">Unauthorized</h2>
          <p className="mt-2 text-gray-600">Please login as Admin</p>
        </div>
      ) : isLoading && !bookings?.length ? (
        <div className="text-center py-12 text-gray-500">
          Loading bookings...
        </div>
      ) : !bookings || bookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No bookings found</div>
      ) : (
        <>
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Filter by TNR"
              value={filters.tnr}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  tnr: e.target.value.toUpperCase().trim(),
                })
              }
              maxLength={6}
              className="border rounded px-3 py-2 text-sm"
              disabled={isLoading}
            />
            <input
              type="text"
              placeholder="Filter by tour name"
              value={filters.tour}
              onChange={(e) => setFilters({ ...filters, tour: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
              disabled={isLoading}
            />
            <input
              type="text"
              placeholder="Filter by name / mobile"
              value={filters.contact}
              onChange={(e) =>
                setFilters({ ...filters, contact: e.target.value })
              }
              className="border rounded px-3 py-2 text-sm"
              disabled={isLoading}
            />
            <select
              value={filters.payment}
              onChange={(e) =>
                setFilters({ ...filters, payment: e.target.value })
              }
              className="border rounded px-3 py-2 text-sm"
              disabled={isLoading}
            >
              <option value="">All Payment Status</option>
              <option value="advance-paid">Advance Paid</option>
              <option value="advance-pending">Advance Pending</option>
              <option value="balance-paid">Balance Paid</option>
              <option value="balance-pending">Balance Pending</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="border rounded px-3 py-2 text-sm"
              disabled={isLoading}
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="under completion">Under Completion</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TNR
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tour
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking, index) => {
                  const firstTraveller = booking.travellers?.[0];
                  const displayName = firstTraveller
                    ? `${firstTraveller.title || ""} ${firstTraveller.firstName} ${firstTraveller.lastName}`.trim()
                    : "Unknown";

                  return (
                    <React.Fragment key={booking._id || booking.tnr || index}>
                      <tr
                        className="hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => toggleRow(index)}
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {expandedRow === index ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            {booking.tnr || "—"}
                            {booking.tnr && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(booking.tnr, "TNR");
                                }}
                                className="text-blue-600 hover:text-blue-800"
                                title="Copy TNR"
                              >
                                <Copy size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {booking?.tourData?.title || "—"}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div>{displayName}</div>
                          <div className="text-gray-600">
                            {booking?.contact?.mobile || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div>
                            Advance:{" "}
                            {booking.payment?.advance?.paid ? (
                              <span className="text-green-600 font-medium">
                                Paid
                              </span>
                            ) : (
                              <span className="text-red-600">Pending</span>
                            )}
                          </div>
                          <div>
                            Balance:{" "}
                            {booking.payment?.balance?.paid ? (
                              <span className="text-green-600 font-medium">
                                Paid
                              </span>
                            ) : (
                              <span className="text-yellow-600">Pending</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium">
                          {booking.isBookingCompleted ? (
                            <span className="text-green-600">Completed</span>
                          ) : booking.cancelled?.byAdmin ||
                            booking.cancelled?.byTraveller ? (
                            <span className="text-red-600">Cancelled</span>
                          ) : (
                            <span className="text-yellow-600">
                              Under Completion
                            </span>
                          )}
                        </td>
                      </tr>

                      {expandedRow === index && (
                        <tr className="bg-gray-50">
                          <td></td>
                          <td colSpan={6} className="p-6">
                            <div className="mb-4">
                              <strong className="block text-base mb-1">
                                TNR:
                              </strong>
                              <div className="flex items-center gap-3">
                                <code className="bg-gray-200 px-3 py-1 rounded font-mono">
                                  {booking.tnr || "Not generated"}
                                </code>
                                {booking.tnr && (
                                  <button
                                    onClick={() =>
                                      copyToClipboard(booking.tnr, "TNR")
                                    }
                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                  >
                                    <Copy size={16} /> Copy
                                  </button>
                                )}
                              </div>
                            </div>

                            <h4 className="font-semibold text-lg mb-3">
                              Travellers
                            </h4>

                            {booking.travellers?.length > 0 ? (
                              <ul className="space-y-4">
                                {booking.travellers.map((t, i) => {
                                  const isCancelledByAdmin =
                                    t.cancelled?.byAdmin;
                                  const isCancelledByTraveller =
                                    t.cancelled?.byTraveller;
                                  const isLocallyRejected =
                                    rejectedTravellers[t._id];

                                  const isDisabled =
                                    isCancelledByAdmin ||
                                    isCancelledByTraveller ||
                                    isLocallyRejected ||
                                    isLoading;

                                  let rejectLabel = "Reject";
                                  if (isCancelledByTraveller)
                                    rejectLabel = "Cancelled by User";
                                  else if (
                                    isCancelledByAdmin ||
                                    isLocallyRejected
                                  )
                                    rejectLabel = "Rejected";

                                  return (
                                    <li
                                      key={t._id || i}
                                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 py-3 border-b last:border-0"
                                    >
                                      <div>
                                        <span className="font-medium">
                                          {t.title} {t.firstName} {t.lastName}
                                        </span>
                                        <span className="text-gray-600 ml-2">
                                          ({t.age}y)
                                        </span>
                                      </div>

                                      <div className="flex gap-3 self-end sm:self-center">
                                        <button
                                          disabled={isDisabled}
                                          onClick={() =>
                                            !isDisabled &&
                                            handleReject(booking.tnr, t._id)
                                          }
                                          className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                                            isDisabled
                                              ? "bg-gray-400 text-white cursor-not-allowed"
                                              : "bg-red-600 hover:bg-red-700 text-white"
                                          }`}
                                        >
                                          {isLoading && !isDisabled
                                            ? "Rejecting..."
                                            : rejectLabel}
                                        </button>

                                        <button
                                          disabled={isLoading}
                                          onClick={() =>
                                            handleDeleteBooking(booking.tnr)
                                          }
                                          className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                                            isLoading
                                              ? "bg-gray-400 text-white cursor-not-allowed"
                                              : "bg-rose-800 hover:bg-rose-900 text-white"
                                          }`}
                                          title="Permanently delete entire booking"
                                        >
                                          {isLoading
                                            ? "Deleting..."
                                            : "Delete Booking"}
                                        </button>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : (
                              <p className="text-gray-500">
                                No travellers in this booking
                              </p>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No bookings match the current filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Leave page confirmation modal */}
      {showConfirmLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 md:p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
              Leave this page?
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              You're viewing the bookings dashboard.
              <br />
              Leaving now will refresh data when you return.
              <br />
              <br />
              Are you sure you want to leave?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleCancelLeave}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium"
              >
                Cancel (Stay)
              </button>
              <button
                onClick={handleConfirmLeave}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
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

export default AllBookings;
