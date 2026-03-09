import React, { useState, useEffect, useContext } from "react";
import { TourContext } from "../../context/TourContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Copy, Share2, Loader2 } from "lucide-react";

const TermsAgreementPage = () => {
  const { tourList, getTourList, getBookings } = useContext(TourContext);

  const [selectedTourId, setSelectedTourId] = useState("");
  const [tourBookings, setTourBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedLinks, setGeneratedLinks] = useState([]);

  // Fixed base URL (no window.location.origin)
  const BASE_URL = "https://gvtourplanners.com";

  // Load tours on mount
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

  // Fetch bookings when tour is selected
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

  // Generate links + formatted copy text
  useEffect(() => {
    if (tourBookings.length > 0) {
      const links = tourBookings.map((booking) => {
        const leadTraveller = booking.travellers?.[0]; // first traveller = lead
        const title = leadTraveller?.title || "";
        const firstName = leadTraveller?.firstName || "";
        const lastName = leadTraveller?.lastName || "";

        const leadNameWithTitle = title
          ? `"${title}. ${firstName} ${lastName}"`
          : `"${firstName} ${lastName}"`;

        const cleanLeadName =
          (title ? `${title}. ` : "") + `${firstName} ${lastName}`;

        const agreementUrl = `${BASE_URL}/agree/${booking.tnr}`;

        // Exact text you want copied/shared
        const copyText = `Hi ${leadNameWithTitle} Please read and agree this terms and conditions for your TNR by clicking the below link\n\nlink: ${agreementUrl}`;

        return {
          tnr: booking.tnr,
          leadName: cleanLeadName || "Unknown Traveller",
          url: agreementUrl,
          copyText: copyText,
        };
      });

      setGeneratedLinks(links);
    }
  }, [tourBookings]);

  // Copy the formatted message
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Message & link copied!"))
      .catch(() => toast.error("Failed to copy"));
  };

  // Share → copies the message AND tries native share
  const shareLink = async (copyText, leadName) => {
    // First copy the message (as requested)
    copyToClipboard(copyText);

    // Then try native share
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
      // If share fails, user already has copied text
      console.error("Native share failed:", err);
      toast.info("Message copied — share not supported");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-6 sm:p-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Generate Terms Agreement Links
        </h1>

        {/* Tour Dropdown */}
        <div className="mb-8">
          <label className="block text-lg font-medium text-gray-700 mb-3">
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

        {/* Loading / Error */}
        {loading && (
          <div className="flex justify-center my-10">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Generated Links */}
        {generatedLinks.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Agreement Links ({generatedLinks.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generatedLinks.map((link) => (
                <div
                  key={link.tnr}
                  className="bg-gray-50 p-5 rounded-xl border border-gray-200 hover:shadow-md transition"
                >
                  <div className="font-medium text-lg text-gray-900 mb-2">
                    {link.leadName}
                  </div>
                  <div className="text-sm text-gray-600 mb-3 break-all">
                    {link.url}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => copyToClipboard(link.copyText)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      <Copy size={18} />
                      Copy Message
                    </button>

                    <button
                      onClick={() => shareLink(link.copyText, link.leadName)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <Share2 size={18} />
                      Share + Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && tourBookings.length === 0 && selectedTourId && (
          <p className="text-center text-gray-500 italic py-10">
            No bookings found for this tour.
          </p>
        )}
      </div>
    </div>
  );
};

export default TermsAgreementPage;
