import React, { useState, useEffect, useContext } from "react";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Plus,
  Trash2,
  Save,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

const TermsPage = () => {
  const {
    addTermsPoints,
    deleteTermsPoint,
    fetchCurrentTerms,
    termsLoading,
    termsError,
    currentTermsVersion,
  } = useContext(TourAdminContext);

  const [newPoints, setNewPoints] = useState([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [currentTerms, setCurrentTerms] = useState(null);
  const [isLoadingTerms, setIsLoadingTerms] = useState(true);

  // Fetch current terms on mount
  useEffect(() => {
    const loadTerms = async () => {
      setIsLoadingTerms(true);
      const data = await fetchCurrentTerms();
      if (data) {
        setCurrentTerms(data);
      }
      setIsLoadingTerms(false);
    };
    loadTerms();
  }, [fetchCurrentTerms]);

  // Add new point field
  const addPointField = () => {
    setNewPoints([...newPoints, ""]);
  };

  // Remove new point field
  const removeNewPoint = (index) => {
    if (newPoints.length === 1) {
      toast.warn("At least one point is required");
      return;
    }
    setNewPoints(newPoints.filter((_, i) => i !== index));
  };

  // Update new point text
  const updateNewPoint = (index, value) => {
    const updated = [...newPoints];
    updated[index] = value;
    setNewPoints(updated);
  };

  // Submit new points
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validPoints = newPoints
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (validPoints.length === 0) {
      toast.error("Please add at least one valid terms point");
      return;
    }

    const tooShort = validPoints.some((p) => p.length < 10);
    if (
      tooShort &&
      !window.confirm(
        "Some points are shorter than 10 characters.\nContinue anyway?",
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMsg("");

    try {
      const result = await addTermsPoints(validPoints);

      if (result?.success) {
        toast.success(result.message || `Added ${validPoints.length} point(s)`);
        setSuccessMsg(`Successfully added ${validPoints.length} new point(s)`);
        setNewPoints([""]);

        // Refresh current terms
        const updated = await fetchCurrentTerms();
        if (updated) {
          setCurrentTerms(updated);
        }
      }
    } catch (err) {
      // error handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  // Deactivate point + refresh
  const handleDeletePoint = async (pointId, currentIndex) => {
    if (!window.confirm(`Deactivate point #${currentIndex + 1}?`)) return;

    // Optimistic UI update: remove from array
    setCurrentTerms((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        points: prev.points.filter((p) => p._id !== pointId),
        totalActivePoints: prev.totalActivePoints - 1,
      };
    });

    try {
      const result = await deleteTermsPoint(pointId);

      if (result?.success) {
        toast.success("Point deactivated successfully");

        // Refresh from server
        const updated = await fetchCurrentTerms();
        if (updated) {
          setCurrentTerms(updated);
        }
      } else {
        // Rollback
        const refreshed = await fetchCurrentTerms();
        if (refreshed) setCurrentTerms(refreshed);
        toast.error(result?.message || "Failed to deactivate");
      }
    } catch (err) {
      // Rollback
      const refreshed = await fetchCurrentTerms();
      if (refreshed) setCurrentTerms(refreshed);
    }
  };

  // Get filtered active points (already active ones)
  const activePoints = currentTerms?.points || [];

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
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
        theme="light"
      />

      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Terms & Conditions Management
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            View and update current active version
          </p>
        </div>

        {/* Messages */}
        {termsError && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50/80 p-5 flex items-start gap-3 shadow-sm">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{termsError}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-8 rounded-xl border border-green-200 bg-green-50/80 p-5 text-sm text-green-700 shadow-sm">
            {successMsg}
          </div>
        )}

        {/* Current Terms Section */}
        <div className="mb-12 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Current Active Version
                {currentTermsVersion && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    v{currentTermsVersion}
                  </span>
                )}
              </h2>

              <button
                onClick={async () => {
                  setIsLoadingTerms(true);
                  const data = await fetchCurrentTerms();
                  if (data) setCurrentTerms(data);
                  setIsLoadingTerms(false);
                }}
                disabled={isLoadingTerms}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition w-full sm:w-auto"
              >
                <RefreshCw
                  size={16}
                  className={isLoadingTerms ? "animate-spin" : ""}
                />
                Refresh Terms
              </button>
            </div>
          </div>

          <div className="p-6 lg:p-8">
            {isLoadingTerms ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Loader2 size={32} className="mb-3 animate-spin" />
                <p>Loading current terms...</p>
              </div>
            ) : activePoints.length > 0 ? (
              <ol className="space-y-5 text-gray-800">
                {activePoints.map((point, index) => (
                  <li
                    key={point._id}
                    className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 py-4 border-b last:border-b-0 group hover:bg-gray-50 transition rounded-lg px-3 -mx-3"
                  >
                    <div className="flex gap-4 flex-1">
                      <span className="font-semibold text-indigo-600 min-w-[2rem] text-right text-lg">
                        {index + 1}.
                      </span>
                      <p className="flex-1 leading-relaxed text-gray-800">
                        {point.text}
                      </p>
                    </div>

                    {/* Deactivate Button */}
                    <button
                      onClick={() => handleDeletePoint(point._id, index)}
                      disabled={termsLoading}
                      className="self-start sm:self-center mt-2 sm:mt-0 flex items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100 disabled:opacity-50 transition"
                      title="Deactivate this point"
                    >
                      <Trash2 size={16} />
                      Deactivate
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-xl font-medium">No terms defined yet</p>
                <p className="mt-2 text-gray-600">
                  Add your first points using the form below
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add New Points Section */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-800">
              Add New Points
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              New points will be appended instantly to the list above.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 lg:p-8">
            <div className="space-y-7">
              {newPoints.map((point, index) => (
                <div key={index} className="group relative">
                  <label
                    htmlFor={`point-${index}`}
                    className={`absolute left-4 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform cursor-text bg-white px-2 text-sm font-medium text-gray-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-indigo-600 ${
                      point.trim().length > 0
                        ? "top-2 -translate-y-4 scale-75 px-2"
                        : ""
                    }`}
                  >
                    Point {index + 1}{" "}
                    {point.trim().length > 0 &&
                      `(${point.trim().length} chars)`}
                  </label>

                  <div className="flex items-start gap-3">
                    <textarea
                      id={`point-${index}`}
                      value={point}
                      onChange={(e) => updateNewPoint(index, e.target.value)}
                      placeholder="Enter terms & conditions point..."
                      rows={3}
                      className="peer block w-full rounded-xl border border-gray-300 bg-gray-50/50 px-4 pt-6 pb-2 text-sm text-gray-900 shadow-sm outline-none ring-0 transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200/50 disabled:opacity-60"
                      minLength={10}
                      required
                      disabled={isSubmitting || termsLoading}
                    />

                    <button
                      type="button"
                      onClick={() => removeNewPoint(index)}
                      disabled={
                        newPoints.length === 1 || isSubmitting || termsLoading
                      }
                      className="mt-2 flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                      title="Remove this point"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={addPointField}
                disabled={isSubmitting || termsLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 w-full sm:w-auto"
              >
                <Plus size={18} />
                Add Another Point
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  termsLoading ||
                  newPoints.every((p) => p.trim() === "")
                }
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-base font-semibold text-white shadow transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed w-full sm:w-auto ${
                  isSubmitting || termsLoading
                    ? "bg-indigo-400"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                }`}
              >
                {isSubmitting || termsLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save New Points
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Footer */}
        <div className="mt-10 rounded-xl border border-blue-100 bg-blue-50/60 p-6 text-sm text-blue-800">
          <div className="flex items-center gap-2 mb-3 font-medium">
            <AlertCircle size={18} />
            <span>Quick Notes</span>
          </div>
          <ul className="ml-6 list-disc space-y-1.5 text-blue-700">
            <li>Points are displayed in the order they appear (1, 2, 3...)</li>
            <li>Deactivated points are hidden from users but preserved</li>
            <li>Minimum 10 characters per point</li>
            <li>New points are appended at the end</li>
            <li>Changes reflect immediately after saving</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
