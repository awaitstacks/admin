import React, { useState, useEffect, useContext } from "react";
import { TourContext } from "../../context/TourContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Copy, Share2, Loader2, CheckCircle } from "lucide-react";

const TermsAgreementPage = () => {
  const { tourList, getTourList, getBookings } = useContext(TourContext);

  const [selectedTourId, setSelectedTourId] = useState("");
  const [tourBookings, setTourBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedLinks, setGeneratedLinks] = useState([]);

  const BASE_URL = "https://gvtourplanners.com";

  useEffect(() => {
    const fetchTours = async () => {
      try {
        await getTourList();
      } catch (err) {
        toast.error("Failed to load tours");
      }
    };
    fetchTours();
  }, [getTourList]);

  const handleTourChange = async (e) => {
    const tourId = e.target.value;
    setSelectedTourId(tourId);
    setGeneratedLinks([]);
    setError("");

    if (!tourId) {
      setTourBookings([]);
      return;
    }

    setLoading(true);

    try {
      const result = await getBookings(tourId);
      if (result.success) {
        setTourBookings(result.bookings || []);
      } else {
        setError(result.message || "No bookings found for this tour");
        setTourBookings([]);
      }
    } catch (err) {
      setError("Failed to load bookings");
      toast.error("Error fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  // Helper: check if booking has at least one active (non-cancelled) traveller
  const hasActiveTraveller = (booking) => {
    if (!booking.travellers || booking.travellers.length === 0) return false;
    return booking.travellers.some(
      (t) => !(t.cancelled?.byTraveller || t.cancelled?.byAdmin),
    );
  };

  // Generate links only for bookings with at least one active traveller
  useEffect(() => {
    if (tourBookings.length > 0) {
      const links = tourBookings
        .filter((booking) => hasActiveTraveller(booking))
        .map((booking) => {
          const leadTraveller = booking.travellers?.[0] || {};
          const title = leadTraveller.title || "";
          const firstName = leadTraveller.firstName || "";
          const lastName = leadTraveller.lastName || "";

          const leadNameWithTitle = title
            ? `"${title}. ${firstName} ${lastName}"`
            : `"${firstName} ${lastName}"`;

          const cleanLeadName =
            (title ? `${title}. ` : "") + `${firstName} ${lastName}`;

          const agreementUrl = `${BASE_URL}/agree/${booking.tnr}`;

          const copyText = `Hi ${leadNameWithTitle} Please read and agree this terms and conditions for your TNR by clicking the below link\n\nlink: ${agreementUrl}`;

          const isAgreed = booking.termsAgreed === true;

          return {
            tnr: booking.tnr,
            leadName: cleanLeadName.trim() || "Unknown Traveller",
            url: agreementUrl,
            copyText,
            isAgreed,
          };
        });

      setGeneratedLinks(links);
    } else {
      setGeneratedLinks([]);
    }
  }, [tourBookings]);

  const copyToClipboard = (text, successMessage = "Copied!") => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(successMessage))
      .catch(() => toast.error("Failed to copy"));
  };

  const shareLink = async (copyText, leadName) => {
    copyToClipboard(copyText, "Message & link copied!");
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Terms Agreement for ${leadName}`,
          text: copyText,
        });
        toast.success("Shared successfully!");
      } else {
        toast.info("Message copied — share not supported on this device");
      }
    } catch (err) {
      console.error("Native share failed:", err);
      toast.info("Message copied — share not supported");
    }
  };

  // Summary counts
  const agreedCount = generatedLinks.filter((link) => link.isAgreed).length;
  const pendingCount = generatedLinks.length - agreedCount;
  const totalActive = generatedLinks.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8 lg:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center">
          Terms Agreement Links Generator
        </h1>

        {/* Summary Section */}
        {selectedTourId && !loading && generatedLinks.length > 0 && (
          <div className="mb-10 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-5 text-center">
              Current Tour Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6 text-center">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <p className="text-4xl font-bold text-indigo-600">
                  {totalActive}
                </p>
                <p className="text-gray-600 mt-2 font-medium">
                  Active Bookings
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <p className="text-4xl font-bold text-green-600">
                  {agreedCount}
                </p>
                <p className="text-gray-600 mt-2 font-medium">
                  Agreed / Submitted
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <p className="text-4xl font-bold text-amber-600">
                  {pendingCount}
                </p>
                <p className="text-gray-600 mt-2 font-medium">Pending</p>
              </div>
            </div>
          </div>
        )}

        {/* Tour Selector */}
        <div className="mb-10">
          <label className="block text-xl font-medium text-gray-700 mb-3">
            Select Tour
          </label>
          <select
            value={selectedTourId}
            onChange={handleTourChange}
            className="w-full px-5 py-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition shadow-sm"
          >
            <option value="">-- Select a Tour --</option>
            {tourList.map((tour) => (
              <option key={tour._id} value={tour._id}>
                {tour.title} ({tour.batch})
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="flex justify-center my-16">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-xl mb-8 text-center">
            {error}
          </div>
        )}

        {generatedLinks.length > 0 ? (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Agreement Links ({generatedLinks.length})
              </h2>
              {pendingCount > 0 && (
                <span className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 rounded-full font-medium text-sm">
                  {pendingCount} forms still pending
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedLinks.map((link) => (
                <div
                  key={link.tnr}
                  className={`p-6 rounded-xl border transition-all duration-200 ${
                    link.isAgreed
                      ? "bg-green-50 border-green-200 opacity-90"
                      : "bg-white border-gray-200 hover:shadow-lg hover:border-indigo-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-gray-900">
                        {link.leadName}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-sm text-gray-500 font-mono">
                          TNR: <strong>{link.tnr}</strong>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(link.tnr, "TNR copied!")
                          }
                          title="Copy TNR"
                          className="text-gray-500 hover:text-indigo-600 transition-colors p-1 rounded hover:bg-gray-100"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>

                    {link.isAgreed ? (
                      <div className="flex items-center gap-2 text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm font-medium shrink-0">
                        <CheckCircle size={18} />
                        Agreed
                      </div>
                    ) : (
                      <span className="text-amber-700 bg-amber-100 px-3 py-1 rounded-full text-sm font-medium shrink-0">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 mb-5 break-all font-mono bg-gray-50 p-3 rounded-lg">
                    {link.url}
                  </div>

                  {link.isAgreed ? (
                    <div className="bg-green-100 text-green-800 px-5 py-4 rounded-lg text-center font-medium">
                      Terms & Conditions Already Agreed
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() =>
                          copyToClipboard(
                            link.copyText,
                            "Message & link copied!",
                          )
                        }
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm"
                      >
                        <Copy size={18} />
                        Copy Message
                      </button>

                      <button
                        onClick={() => shareLink(link.copyText, link.leadName)}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium shadow-sm"
                      >
                        <Share2 size={18} />
                        Share
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          selectedTourId &&
          !loading &&
          !error && (
            <div className="text-center py-16 text-gray-500 italic text-lg">
              No bookings with active travellers found for this tour.
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default TermsAgreementPage;
