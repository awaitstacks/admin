/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { TourAdminContext } from "../../context/TourAdminContext";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { Copy, RefreshCw } from "lucide-react";

const CancellationCentre = () => {
  const { getCancellations, approveCancellation, rejectCancellation } =
    useContext(TourAdminContext);

  const [cancellations, setCancellations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [toastQueue, setToastQueue] = useState([]);

  // Auto-dismiss toast after 10 seconds
  useEffect(() => {
    if (toastQueue.length === 0) return;

    const timer = setTimeout(() => {
      setToastQueue((prev) => prev.slice(1));
    }, 10000);

    return () => clearTimeout(timer);
  }, [toastQueue]);

  // Fetch pending cancellations
  const fetchPendingCancellations = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const res = await getCancellations();
      if (res.success) {
        setCancellations(res.data || []);
      } else {
        showToast("error", res.message || "Failed to load cancellations");
      }
    } catch (err) {
      showToast("error", "Failed to load cancellations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingCancellations();
  }, [getCancellations]);

  const showToast = (type, msg) => {
    setToastQueue((prev) => [...prev, { type, msg, id: Date.now() }]);
  };

  // APPROVE → refresh after success
  const handleApprove = async (cancellation) => {
    const leadTraveller =
      cancellation.booking?.travellers?.find((t) =>
        cancellation.travellerIds?.includes(t._id.toString()),
      ) || cancellation.booking?.travellers?.[0];

    const leadName = leadTraveller
      ? `${leadTraveller.title || ""} ${leadTraveller.firstName || ""} ${leadTraveller.lastName || ""}`.trim()
      : "Traveller";

    const count = cancellation.travellerIds?.length || 0;

    const confirmed = window.confirm(
      `APPROVE CANCELLATION?\n\n` +
        `TNR: ${cancellation.tnr}\n` +
        `Traveller: ${leadName}\n` +
        `Cancelling: ${count} traveller(s)\n\n` +
        `This will deduct charges and update balance.\n\n` +
        `Are you sure you want to APPROVE?`,
    );

    if (!confirmed) {
      showToast("info", "Approval cancelled by admin");
      return;
    }

    setProcessingIds((s) => new Set([...s, cancellation._id]));

    try {
      const res = await approveCancellation(
        cancellation.tnr,
        cancellation.travellerIds,
        cancellation._id,
      );

      showToast("success", res.message || "Cancellation approved successfully");

      // Refresh the pending list (other pending ones should still appear)
      await fetchPendingCancellations();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Approve failed");
    } finally {
      setProcessingIds((s) => {
        const ns = new Set(s);
        ns.delete(cancellation._id);
        return ns;
      });
    }
  };

  // REJECT → refresh after success
  const handleReject = async (cancellation) => {
    const leadTraveller =
      cancellation.booking?.travellers?.find((t) =>
        cancellation.travellerIds?.includes(t._id.toString()),
      ) || cancellation.booking?.travellers?.[0];

    const leadName = leadTraveller
      ? `${leadTraveller.title || ""} ${leadTraveller.firstName || ""} ${leadTraveller.lastName || ""}`.trim()
      : "Traveller";

    const count = cancellation.travellerIds?.length || 0;

    const confirmed = window.confirm(
      `REJECT CANCELLATION?\n\n` +
        `TNR: ${cancellation.tnr}\n` +
        `Traveller: ${leadName}\n` +
        `Request for: ${count} traveller(s)\n\n` +
        `This will keep travellers in the tour and clear the request.\n\n` +
        `Are you sure you want to REJECT?`,
    );

    if (!confirmed) {
      showToast("info", "Rejection cancelled by admin");
      return;
    }

    setProcessingIds((s) => new Set([...s, cancellation._id]));

    try {
      const res = await rejectCancellation(
        cancellation.tnr,
        cancellation.travellerIds,
        cancellation._id,
      );

      showToast("success", res.message || "Cancellation request rejected");

      // Refresh the pending list
      await fetchPendingCancellations();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Reject failed");
    } finally {
      setProcessingIds((s) => {
        const ns = new Set(s);
        ns.delete(cancellation._id);
        return ns;
      });
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((s) => {
      const ns = new Set(s);
      ns.has(id) ? ns.delete(id) : ns.add(id);
      return ns;
    });
  };

  const copyTnr = (tnr) => {
    navigator.clipboard.writeText(tnr);
    toast.success("TNR copied!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <ClipLoader color="#3B82F6" size={60} />
        <p className="text-lg font-medium text-gray-700">
          Loading pending cancellations...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen relative">
      {/* Toast Queue */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
        {toastQueue.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-5 py-4 rounded-xl shadow-2xl text-white font-medium text-sm transition-all animate-slide-in-right border-l-4 ${
              t.type === "success"
                ? "bg-green-600 border-green-800"
                : t.type === "info"
                  ? "bg-blue-600 border-blue-800"
                  : "bg-red-600 border-red-800"
            }`}
          >
            <span className="mt-0.5">
              {t.type === "success"
                ? "Success"
                : t.type === "info"
                  ? "Info"
                  : "Error"}
            </span>
            <div className="flex-1 whitespace-pre-line leading-tight">
              {t.msg}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-800 text-center w-full">
          Cancellation Centre
        </h1>

        <button
          onClick={fetchPendingCancellations}
          disabled={refreshing || loading}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-lg text-white font-medium transition-all shadow-md w-full sm:w-auto min-w-[180px] ${
            refreshing || loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
          }`}
        >
          {refreshing || loading ? (
            <>
              <ClipLoader size={18} color="#fff" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw size={18} />
              Refresh Pending List
            </>
          )}
        </button>
      </div>

      {cancellations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md p-10 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">
            No Pending Cancellations
          </h2>
          <p className="text-gray-600 mb-4">
            There are currently no cancellation requests waiting for approval or
            rejection.
          </p>
          <p className="text-sm text-gray-500">
            • All requests have been processed or cleared
            <br />• Click "Refresh Pending List" to check again
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {cancellations.map((c) => {
            const isProcessing = processingIds.has(c._id);
            const isExpanded = expandedIds.has(c._id);

            const leadTraveller =
              c.booking?.travellers?.find((t) =>
                c.travellerIds?.includes(t._id.toString()),
              ) || c.booking?.travellers?.[0];

            const leadName = leadTraveller
              ? `${leadTraveller.title || ""} ${leadTraveller.firstName || ""} ${leadTraveller.lastName || ""}`.trim()
              : "Unknown Traveller";

            const mobile = c.booking?.contact?.mobile || "N/A";

            return (
              <div
                key={c.tnr || c._id}
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div
                  className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => toggleExpand(c._id)}
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 text-lg">
                      <span className="font-bold text-gray-900">
                        {leadName}
                      </span>
                      <span className="text-gray-500">•</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-700 tracking-wider font-mono text-base">
                          TNR: {c.tnr || "N/A"}
                        </span>
                        {c.tnr && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyTnr(c.tnr);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition"
                            title="Copy TNR"
                          >
                            <Copy size={18} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>
                        <strong>Mobile:</strong> {mobile}
                      </span>
                      <span>•</span>
                      <span>
                        <strong>Travellers:</strong>{" "}
                        {c.travellerIds?.length || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="text-xs">
                      {isExpanded ? "Collapse" : "Expand"}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-6 border-t border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5 text-sm">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">
                          Cancellation Summary
                        </h3>
                        <div className="space-y-2 text-gray-700">
                          <p>
                            <strong>Net Paid:</strong> ₹
                            {c.netAmountPaid?.toLocaleString() || 0}
                          </p>
                          <p>
                            <strong>GV Cancellation:</strong> ₹
                            {c.gvCancellationAmount?.toLocaleString() || 0}
                          </p>
                          <p>
                            <strong>IRCTC Cancellation:</strong> ₹
                            {c.irctcCancellationAmount?.toLocaleString() || 0}
                          </p>
                          <p>
                            <strong>Remarks Amount:</strong> ₹
                            {c.remarksAmount?.toLocaleString() || 0}
                          </p>
                          <p>
                            <strong>Total Deduction:</strong> ₹
                            {c.totalCancellationAmount?.toLocaleString() || 0}
                          </p>
                          <p>
                            <strong>Updated Balance:</strong> ₹
                            {c.updatedBalance?.toLocaleString() || 0}
                          </p>
                          <p className="text-green-600 font-semibold">
                            <strong>Refund Amount:</strong> ₹
                            {c.refundAmount?.toLocaleString() || 0}
                          </p>
                          {c.remarkText && (
                            <p className="text-xs italic text-gray-600 mt-2 border-l-4 border-gray-300 pl-3">
                              "{c.remarkText}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">
                          Travellers to Cancel ({c.travellerIds?.length || 0})
                        </h3>
                        <ul className="space-y-2">
                          {c.booking?.travellers
                            ?.filter((t) =>
                              c.travellerIds?.includes(t._id.toString()),
                            )
                            .map((t) => (
                              <li
                                key={t._id}
                                className="flex justify-between items-center bg-white px-4 py-2.5 rounded border shadow-sm"
                              >
                                <span className="font-medium">
                                  {t.title} {t.firstName} {t.lastName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {t.age} yrs • {t.gender}
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(c);
                        }}
                        disabled={isProcessing}
                        className={`min-w-[160px] px-6 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition shadow-md ${
                          isProcessing
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <ClipLoader size={18} color="#fff" />
                            Processing...
                          </>
                        ) : (
                          "Approve Cancellation"
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(c);
                        }}
                        disabled={isProcessing}
                        className={`min-w-[160px] px-6 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition shadow-md ${
                          isProcessing
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <ClipLoader size={18} color="#fff" />
                            Processing...
                          </>
                        ) : (
                          "Reject Request"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CancellationCentre;
