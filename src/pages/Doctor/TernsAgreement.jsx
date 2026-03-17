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

  const hasActiveTraveller = (booking) => {
    if (!booking.travellers || booking.travellers.length === 0) return false;
    return booking.travellers.some(
      (t) => !(t.cancelled?.byTraveller || t.cancelled?.byAdmin),
    );
  };

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

  const agreedCount = generatedLinks.filter((link) => link.isAgreed).length;
  const pendingCount = generatedLinks.length - agreedCount;
  const totalActive = generatedLinks.length;

  return (
    <div className="min-h-screen w-full bg-gray-50 py-4 px-2 sm:px-4 md:py-8 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-4 sm:p-6 lg:p-10">
        {/* Responsive Header */}
        <header className="mb-6 sm:mb-10 text-center">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Terms Agreement Links
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-500">
            Generate and share agreement links for your active bookings.
          </p>
        </header>

        {/* Responsive Summary Section */}
        {selectedTourId && !loading && generatedLinks.length > 0 && (
          <div className="mb-8 bg-indigo-50/50 p-4 sm:p-6 rounded-2xl border border-indigo-100">
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100 flex flex-col items-center justify-center">
                <span className="text-xl sm:text-3xl font-bold text-indigo-600">
                  {totalActive}
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-gray-500 mt-1">
                  Total
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100 flex flex-col items-center justify-center">
                <span className="text-xl sm:text-3xl font-bold text-green-600">
                  {agreedCount}
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-gray-500 mt-1">
                  Agreed
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 flex flex-col items-center justify-center">
                <span className="text-xl sm:text-3xl font-bold text-amber-600">
                  {pendingCount}
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-gray-500 mt-1">
                  Pending
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Select Tour Input */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
            Select Tour Batch
          </label>
          <select
            value={selectedTourId}
            onChange={handleTourChange}
            className="w-full px-4 py-3.5 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
              backgroundSize: "1em",
            }}
          >
            <option value="">Choose a tour...</option>
            {tourList.map((tour) => (
              <option key={tour._id} value={tour._id}>
                {tour.title} — {tour.batch}
              </option>
            ))}
          </select>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
            <p className="text-gray-500 animate-pulse">Fetching bookings...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-xl text-center font-medium">
            {error}
          </div>
        ) : generatedLinks.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-bold text-gray-800">Bookings List</h2>
              <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-600">
                {generatedLinks.length} Items
              </span>
            </div>

            {/* Responsive Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {generatedLinks.map((link) => (
                <div
                  key={link.tnr}
                  className={`relative flex flex-col h-full rounded-2xl border transition-all ${
                    link.isAgreed
                      ? "bg-green-50/30 border-green-100"
                      : "bg-white border-gray-100 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="p-5 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="max-w-[70%]">
                        <h3 className="font-bold text-gray-900 leading-tight truncate">
                          {link.leadName}
                        </h3>
                        <div className="flex items-center gap-1 mt-1 text-gray-500">
                          <span className="text-xs font-mono">{link.tnr}</span>
                          <button
                            onClick={() => copyToClipboard(link.tnr)}
                            className="hover:text-indigo-600"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </div>

                      {link.isAgreed ? (
                        <div className="flex items-center gap-1 text-green-600 bg-green-100/80 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle size={12} />
                          <span>Agreed</span>
                        </div>
                      ) : (
                        <div className="text-amber-600 bg-amber-100/80 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                          Pending
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-[11px] font-mono text-gray-500 break-all line-clamp-2">
                        {link.url}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 pt-0 mt-auto">
                    {link.isAgreed ? (
                      <div className="w-full py-3 text-center text-green-700 bg-green-100/50 rounded-xl text-sm font-semibold border border-green-200">
                        Completed
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => copyToClipboard(link.copyText)}
                          className="flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors text-sm font-bold"
                        >
                          <Copy size={16} /> Copy
                        </button>
                        <button
                          onClick={() =>
                            shareLink(link.copyText, link.leadName)
                          }
                          className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-sm transition-all text-sm font-bold"
                        >
                          <Share2 size={16} /> Share
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : selectedTourId ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">
              No active bookings found for this batch.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TermsAgreementPage;
