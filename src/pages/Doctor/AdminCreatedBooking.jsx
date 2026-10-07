import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TourContext } from "../../context/TourContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  ChevronDown,
  ChevronUp,
  IndianRupee,
  Users,
  Copy,
  Loader2,
  QrCode,
  Train,
  Plane,
} from "lucide-react";

const renderTripWiseAddons = (traveller, currencySymbol) => {
  if (
    !Array.isArray(traveller.selectedAddons) ||
    traveller.selectedAddons.length === 0
  ) {
    return null;
  }

  const getTripTypeStyle = (tripType) => {
    const tt = (tripType || "").toUpperCase();
    if (tt.startsWith("BOARD"))
      return { badge: "bg-blue-100 text-blue-700", label: "Boarding" };
    if (tt.startsWith("MIDDLE"))
      return { badge: "bg-purple-100 text-purple-700", label: "Middle" };
    if (tt.startsWith("DEBOARD") || tt.startsWith("DEBOARF"))
      return { badge: "bg-orange-100 text-orange-700", label: "Deboarding" };
    return { badge: "bg-gray-100 text-gray-700", label: tripType || "Trip" };
  };

  const isFlightAddon = (a) => {
    if (a.flightNo || a.airline) return true;
    if (a.trainNo || a.trainName) return false;
    return (
      (a.flightIndex !== undefined && a.flightIndex !== null) ||
      a.tripKind === "flight"
    );
  };

  const buildLabel = (a, isFlight) => {
    const primary = isFlight ? a.airline : a.trainName;
    const secondary = isFlight ? a.flightNo : a.trainNo;
    if (!primary && !secondary) return null;
    if (primary && secondary) return `${primary} (${secondary})`;
    return primary || secondary;
  };

  const trainEntries = traveller.selectedAddons.filter((a) => !isFlightAddon(a));
  const flightEntries = traveller.selectedAddons.filter((a) => isFlightAddon(a));

  const renderRow = (a, idx) => {
    const isFlight = isFlightAddon(a);
    const style = getTripTypeStyle(a.tripType);
    const label = buildLabel(a, isFlight);
    return (
      <div key={idx} className="flex flex-wrap items-center gap-1.5 mt-1">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${style.badge}`}
        >
          {style.label}
        </span>
        <span className="text-gray-700 text-xs sm:text-sm">
          {label ? `${label}: ` : ""}
          {a.name}
        </span>
        <span className="text-green-700 font-medium text-xs sm:text-sm">
          +{currencySymbol}
          {a.amount}
        </span>
      </div>
    );
  };

  return (
    <div className="mt-2 space-y-2">
      {trainEntries.length > 0 && (
        <div>
          <p className="font-semibold text-red-600 text-xs sm:text-sm flex items-center gap-1.5">
            <Train size={14} /> Train Addons
          </p>
          {trainEntries.map((a, idx) => renderRow(a, idx))}
        </div>
      )}
      {flightEntries.length > 0 && (
        <div>
          <p className="font-semibold text-orange-900 text-xs sm:text-sm flex items-center gap-1.5">
            <Plane size={14} /> Flight Addons
          </p>
          {flightEntries.map((a, idx) => renderRow(a, idx))}
        </div>
      )}
    </div>
  );
};

const AdminCreatedBooking = () => {
  const {
    backendUrl,
    ttoken,
    currencySymbol,
    getPaymentMethods,
    adminCreatedBookings,
    getAdminCreatedBookings,
  } = useContext(TourContext);

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [cancelPopup, setCancelPopup] = useState({
    show: false,
    tnr: null,
    travellerId: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      await getAdminCreatedBookings();
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await getPaymentMethods();
      if (res?.success) {
        setPaymentMethods(res.paymentMethods || []);
      }
    } catch (err) {
      console.error("Failed to load payment methods:", err);
    }
  };

  useEffect(() => {
    if (ttoken) {
      fetchBookings();
      fetchPaymentMethods();
    }
  }, [ttoken]);

  useEffect(() => {
    setVisibleCount(10);
  }, [searchTerm, statusFilter]);

  const confirmCancellation = async () => {
    const { tnr, travellerId } = cancelPopup;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/tour/cancel-traveller`,
        { tnr, travellerId },
        { headers: { ttoken } },
      );
      if (data.success) {
        toast.success(data.message);
        fetchBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to cancel traveller");
    } finally {
      setCancelPopup({ show: false, tnr: null, travellerId: null });
    }
  };

  const slotDateFormat = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB") + " " + d.toLocaleTimeString();
  };

  const allTravellersCancelled = (item) => {
    if (!item.travellers || item.travellers.length === 0) return false;
    return item.travellers.every((t) => {
      const byT = t?.cancelled?.byTraveller;
      const byA = t?.cancelled?.byAdmin;
      return byA || (byT && byA);
    });
  };

  const renderStatus = (item) => {
    if (item.isBookingCompleted) return "Booking Completed";
    if (allTravellersCancelled(item)) return "Booking Cancelled";
    if (item.cancelled?.byTraveller) return "Booking cancelled by user";
    if (item.cancelled?.byAdmin) return "Booking rejected by admin";

    const hasPendingCancellation = item.travellers?.some(
      (t) => t?.cancelled?.byTraveller && !t?.cancelled?.byAdmin,
    );
    if (hasPendingCancellation) return "Cancellation Requested";

    if (!item.payment?.advance?.paid) return "Awaiting Booking Confirmation";
    if (item.payment?.advance?.paid && !item.payment?.balance?.paid)
      return "Advance Received and booking reserved";
    if (item.payment?.advance?.paid)
      return "Balance Received and waiting for booking completion";

    return "Pending";
  };

  const filteredBookings = adminCreatedBookings.filter((item) => {
    const matchesTitle = item.tourData.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (!matchesTitle) return false;

    if (statusFilter === "all") return true;
    if (statusFilter !== "all" && allTravellersCancelled(item)) return false;

    let itemStatus = null;
    if (item.isBookingCompleted) {
      itemStatus = "completed";
    } else if (item.payment?.advance?.paid && !item.payment?.balance?.paid) {
      itemStatus = "balance";
    } else if (!item.payment?.advance?.paid) {
      itemStatus = "advance";
    }

    return itemStatus === statusFilter;
  });

  const displayedBookings = filteredBookings.slice(0, visibleCount);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  return (
    <>
      <style>{`
        @keyframes blink-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.75; }
        }
        .blink-slow {
          animation: blink-slow 3s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50/50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
            Admin Created Bookings
          </h1>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-lg mb-8 flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by tour title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm sm:text-base"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none md:w-48 text-sm sm:text-base"
            >
              <option value="all">All Statuses</option>
              <option value="advance">Advance Pending</option>
              <option value="balance">Balance Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
          ) : displayedBookings.length === 0 ? (
            <p className="text-center text-gray-600 text-lg sm:text-xl py-12">
              No bookings found.
            </p>
          ) : (
            <div className="space-y-6 md:space-y-8">
              {displayedBookings.map((item) => (
                <div
                  key={item.tnr}
                  className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-5 sm:p-6 transition-all duration-300 hover:shadow-xl overflow-hidden"
                >
                  <div
                    className="flex flex-col sm:flex-row gap-5 cursor-pointer"
                    onClick={() =>
                      setExpandedBooking(
                        expandedBooking === item.tnr ? null : item.tnr,
                      )
                    }
                  >
                    <img
                      src={item.tourData.titleImage}
                      alt={item.tourData.title}
                      className="w-full sm:w-40 md:w-48 h-32 object-cover rounded-xl flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                          {item.tourData.title}
                        </h2>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm sm:text-lg font-semibold text-gray-800">
                            TNR:{" "}
                            <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs sm:text-sm">
                              {item.tnr || "N/A"}
                            </code>
                          </span>
                          {item.tnr && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(item.tnr);
                                toast.success("TNR copied!");
                              }}
                              className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition"
                              title="Copy TNR"
                            >
                              <Copy size={20} />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-600 mb-1 text-xs sm:text-sm truncate">
                        Duration: {item.tourData.duration?.days} Days /{" "}
                        {item.tourData.duration?.nights} Nights
                      </p>
                      <p className="text-gray-600 mb-1 text-xs sm:text-sm">
                        Booking Date: {slotDateFormat(item.bookingDate)}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 mt-2 text-xs sm:text-sm">
                        <p className="flex items-center gap-1">
                          <span className="font-semibold text-gray-800">
                            Advance:
                          </span>{" "}
                          {currencySymbol}
                          {item.payment?.advance?.amount?.toLocaleString() ||
                            "0"}{" "}
                          <span
                            className={
                              item.payment?.advance?.paid
                                ? "text-green-600"
                                : "text-amber-600"
                            }
                          >
                            ({item.payment?.advance?.paid ? "Paid" : "Pending"})
                          </span>
                        </p>
                        <p className="flex items-center gap-1">
                          <span className="font-semibold text-gray-800">
                            Balance:
                          </span>{" "}
                          {currencySymbol}
                          {item.payment?.balance?.amount?.toLocaleString() ||
                            "0"}{" "}
                          <span
                            className={
                              item.payment?.balance?.paid
                                ? "text-green-600"
                                : "text-amber-600"
                            }
                          >
                            ({item.payment?.balance?.paid ? "Paid" : "Pending"})
                          </span>
                        </p>
                      </div>

                      <p className="text-indigo-700 font-medium mt-1 text-xs sm:text-sm">
                        Status: {renderStatus(item)}
                      </p>

                      <p className="text-gray-400 mt-1 text-[10px] sm:text-xs">
                        Created by: {item.createdBy === "admin" ? "Admin (walk-in)" : "Customer"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 justify-center sm:justify-end flex-shrink-0 mt-4 sm:mt-0">
                      {allTravellersCancelled(item) ? (
                        <span className="px-5 py-2.5 bg-red-100 text-red-700 rounded-xl font-medium text-center text-xs sm:text-sm">
                          Booking Cancelled
                        </span>
                      ) : (
                        <>
                          {!item.payment?.advance?.paid && (
                            <span className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-center text-xs sm:text-sm">
                              Awaiting Confirmation
                            </span>
                          )}
                          {item.payment?.advance?.paid &&
                            !item.payment?.balance?.paid && (
                              <span className="px-5 py-2.5 bg-green-100 text-green-700 rounded-xl font-medium text-center text-xs sm:text-sm">
                                Advance Received
                              </span>
                            )}
                          {item.payment?.balance?.paid &&
                            !item.isBookingCompleted && (
                              <span className="px-5 py-2.5 bg-green-100 text-green-700 rounded-xl font-medium text-center text-xs sm:text-sm">
                                Balance Received
                              </span>
                            )}
                          {item.isBookingCompleted && (
                            <span className="px-5 py-2.5 bg-green-100 text-green-700 rounded-xl font-medium text-center text-xs sm:text-sm">
                              Booking Completed
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {expandedBooking === item.tnr && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                        Traveller Details
                      </h3>
                      <div className="space-y-4">
                        {item.travellers?.map((traveller, idx) => {
                          const byT = traveller?.cancelled?.byTraveller;
                          const byA = traveller?.cancelled?.byAdmin;

                          let travellerBadge = null;
                          if (byT && byA) travellerBadge = "Cancelled";
                          else if (byT && !byA)
                            travellerBadge = "Cancellation Requested";
                          else if (!byT && byA)
                            travellerBadge = "Rejected by Admin";

                          const canCancel =
                            !traveller.cancelled?.byTraveller &&
                            !traveller.cancelled?.byAdmin &&
                            item.payment?.advance?.paid;

                          return (
                            <div
                              key={idx}
                              className="bg-indigo-50/50 rounded-xl p-5 transition-all duration-300 hover:bg-indigo-100/50 flex flex-col gap-3"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">
                                  {traveller.title} {traveller.firstName}{" "}
                                  {traveller.lastName}
                                </p>
                                <p className="text-gray-600 text-xs sm:text-sm">
                                  Age: {traveller.age} | Gender:{" "}
                                  {traveller.gender}
                                </p>
                                <p className="text-gray-600 text-xs sm:text-sm">
                                  Package:{" "}
                                  {traveller.packageType === "main"
                                    ? "Main Package"
                                    : `Variant ${traveller.variantPackageIndex + 1}`}
                                </p>
                                <p className="text-gray-600 text-xs sm:text-sm">
                                  Sharing: {traveller.sharingType}
                                </p>
                                {traveller.selectedAddon && (
                                  <p className="text-gray-600 text-xs sm:text-sm">
                                    Add-ons: {traveller.selectedAddon.name} (+
                                    {currencySymbol}
                                    {traveller.selectedAddon.price})
                                  </p>
                                )}
                                {renderTripWiseAddons(traveller, currencySymbol)}
                                <p className="text-gray-600 text-xs sm:text-sm truncate">
                                  Boarding:{" "}
                                  {traveller.boardingPoint?.stationName} (
                                  {traveller.boardingPoint?.stationCode})
                                </p>
                                <p className="text-gray-600 text-xs sm:text-sm truncate">
                                  Deboarding:{" "}
                                  {traveller.deboardingPoint?.stationName} (
                                  {traveller.deboardingPoint?.stationCode})
                                </p>
                                {traveller.remarks && (
                                  <p className="text-gray-600 text-xs sm:text-sm truncate">
                                    Remarks: {traveller.remarks}
                                  </p>
                                )}
                                {traveller.isCoTraveller && (
                                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mt-3 mr-2 bg-blue-100 text-blue-700">
                                    Added via Aadhaar OCR
                                  </span>
                                )}
                                {travellerBadge && (
                                  <span
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-3 ${
                                      travellerBadge === "Cancelled"
                                        ? "bg-red-100 text-red-700"
                                        : travellerBadge ===
                                            "Cancellation Requested"
                                          ? "bg-orange-100 text-orange-700"
                                          : "bg-purple-100 text-purple-700"
                                    }`}
                                  >
                                    {travellerBadge}
                                  </span>
                                )}
                              </div>

                              {canCancel && (
                                <div>
                                  <button
                                    onClick={() =>
                                      setCancelPopup({
                                        show: true,
                                        tnr: item.tnr,
                                        travellerId: traveller._id,
                                      })
                                    }
                                    className="w-full sm:w-auto px-5 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-all shadow-sm hover:shadow text-xs sm:text-sm"
                                  >
                                    Cancel Traveller
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filteredBookings.length > visibleCount && (
                <div className="text-center py-8">
                  <button
                    onClick={handleShowMore}
                    className="px-8 py-3 bg-indigo-100 text-indigo-700 rounded-xl font-medium hover:bg-indigo-200 transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
                  >
                    Show More
                  </button>
                </div>
              )}
            </div>
          )}

          {adminCreatedBookings.length > 0 && paymentMethods.length > 0 && (
            <div className="mt-12 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-200">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-5 text-center">
                Make Payment Using
              </h3>

              <p className="text-base sm:text-lg text-indigo-700 bg-indigo-50/80 p-4 rounded-xl mb-6 text-center font-medium blink-slow">
                Kindly paste the booking TNR in the description/note/remarks
                while making payment for easy tracking.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {paymentMethods.map((method) => (
                  <div
                    key={method._id}
                    className="bg-gray-50 rounded-xl p-5 sm:p-6 border border-gray-200 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      {method.type === "bank" ? (
                        <IndianRupee className="text-indigo-600" size={28} />
                      ) : (
                        <QrCode className="text-teal-600" size={28} />
                      )}
                      <h4 className="font-semibold text-gray-800 text-base sm:text-lg capitalize">
                        {method.type} Payment
                      </h4>
                    </div>

                    {method.type === "bank" ? (
                      <div className="text-sm sm:text-base text-gray-700 space-y-1.5 sm:space-y-2">
                        <p>
                          <strong>Bank Name:</strong> {method.bankName || "N/A"}
                        </p>
                        <p>
                          <strong>Branch Name:</strong>{" "}
                          {method.branchName || "N/A"}
                        </p>
                        <p className="break-all hyphens-auto">
                          <strong>A/C No:</strong> {method.accountNumber}
                        </p>
                        <p>
                          <strong>IFSC:</strong> {method.ifsc}
                        </p>
                        {method.swift && (
                          <p>
                            <strong>Swift:</strong> {method.swift}
                          </p>
                        )}
                        <p className="break-all hyphens-auto">
                          <strong>Beneficiary:</strong> {method.beneficiary}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 italic">
                          {method.accountType} account
                        </p>
                      </div>
                    ) : (
                      <div className="text-sm sm:text-base text-gray-700 space-y-1.5 sm:space-y-2">
                        <p className="break-all hyphens-auto">
                          <strong>UPI ID:</strong> {method.upiId}
                        </p>
                        <p>
                          <strong>Gpay(Only):</strong> {method.phone}
                        </p>
                        {method.qrImage && (
                          <div className="mt-4 flex justify-center">
                            <img
                              src={method.qrImage}
                              alt="UPI QR Code - Scan to Pay"
                              className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl border-2 border-gray-300 shadow-md hover:shadow-lg transition-shadow"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {cancelPopup.show && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 px-4">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl max-w-md w-full text-center transition-all duration-300 scale-100">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                  Confirm Cancellation?
                </h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  This action cannot be undone. Are you sure?
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() =>
                      setCancelPopup({
                        show: false,
                        tnr: null,
                        travellerId: null,
                      })
                    }
                    className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmCancellation}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-all text-sm sm:text-base"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminCreatedBooking;