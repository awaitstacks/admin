import React, { useContext, useEffect, useState } from "react";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ToursList = () => {
  const {
    tours,
    bookings,
    getAllTours,
    getAllBookings,
    changeTourAvailablity,
  } = useContext(TourAdminContext);

  const [filterText, setFilterText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [toursResponse, bookingsResponse] = await Promise.all([
          getAllTours(),
          getAllBookings(),
        ]);
        console.log("Tours fetched:", toursResponse.tours);
        console.log("Bookings fetched:", bookingsResponse.bookings);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        toast.error("Failed to fetch tours or bookings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper: Get valid travellers for a tour (strict rules)
  const getValidTravellers = (tourId) => {
    if (!tourId) {
      console.warn("Invalid tourId:", tourId);
      return [];
    }

    const validBookings = bookings.filter((b) => {
      const isValid =
        b.tourId?.toString() === tourId.toString() &&
        b.payment?.advance?.paid === true &&
        b.payment?.balance?.paid === true &&
        b.isBookingCompleted === true;
      if (!isValid) {
        console.log(`Booking ${b._id} filtered out for tour ${tourId}`, {
          tourIdMatch: b.tourId?.toString() === tourId.toString(),
          advancePaid: b.payment?.advance?.paid,
          balancePaid: b.payment?.balance?.paid,
          isBookingCompleted: b.isBookingCompleted,
        });
      }
      return isValid;
    });

    const travellers = validBookings.flatMap((b) => {
      const validTravellers = (b.travellers || []).filter(
        (t) =>
          t.cancelled?.byTraveller !== true && t.cancelled?.byAdmin !== true,
      );
      console.log(`Travellers for booking ${b._id}:`, validTravellers);
      return validTravellers;
    });

    console.log(`Valid travellers for tour ${tourId}:`, travellers);
    return travellers;
  };

  // Count functions
  const getTravellerCount = (tourId) => {
    const count = getValidTravellers(tourId).length;
    console.log(`Traveller count for tour ${tourId}: ${count}`);
    return count;
  };

  const getCancellationCount = (tourId) => {
    const count = bookings
      .filter(
        (b) =>
          b.tourId?.toString() === tourId.toString() &&
          b.isBookingCompleted === true,
      )
      .reduce((count, b) => {
        const cancelledTravellers = (b.travellers || []).filter(
          (t) =>
            t.cancelled?.byTraveller === true && t.cancelled?.byAdmin === true,
        );
        return count + cancelledTravellers.length;
      }, 0);
    console.log(`Cancellation count for tour ${tourId}: ${count}`);
    return count;
  };

  const getDoubleSharingCount = (tourId) => {
    const count = getValidTravellers(tourId).filter(
      (t) => t.sharingType === "double" && t.sharingType !== "withBerth",
    ).length;
    console.log(`Double sharing count for tour ${tourId}: ${count}`);
    return count;
  };

  const getTripleSharingCount = (tourId) => {
    const count = getValidTravellers(tourId).filter(
      (t) => t.sharingType === "triple" && t.sharingType !== "withBerth",
    ).length;
    console.log(`Triple sharing count for tour ${tourId}: ${count}`);
    return count;
  };

  const getChildAndWithBerthCount = (tourId) => {
    const travellers = getValidTravellers(tourId);
    const count = travellers.filter(
      (t) =>
        t.sharingType === "withBerth" || t.gender?.toLowerCase() === "other",
    ).length;
    console.log(`Child count for tour ${tourId}: ${count}`, {
      withBerth: travellers.filter((t) => t.sharingType === "withBerth").length,
      children: travellers.filter(
        (t) =>
          t.gender?.toLowerCase() === "other" && t.sharingType !== "withBerth",
      ).length,
    });
    return count;
  };

  const getMaleCount = (tourId) => {
    const count = getValidTravellers(tourId).filter(
      (t) =>
        t.gender?.toLowerCase() === "male" && t.sharingType !== "withBerth",
    ).length;
    console.log(`Male count for tour ${tourId}: ${count}`);
    return count;
  };

  const getFemaleCount = (tourId) => {
    const count = getValidTravellers(tourId).filter(
      (t) =>
        t.gender?.toLowerCase() === "female" && t.sharingType !== "withBerth",
    ).length;
    console.log(`Female count for tour ${tourId}: ${count}`);
    return count;
  };

  // Filter tours by title
  const filteredTours = tours.filter(
    (tour) =>
      tour?.title?.toLowerCase()?.includes(filterText.toLowerCase()) ?? false,
  );

  // Export filtered tours to PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Tours Summary", 14, 15);

    const tableColumn = [
      "S.No",
      "Tour Title",
      "Travellers",
      "Cancellations",
      "Double",
      "Triple",
      "Male",
      "Female",
      "Child",
      "Availability",
    ];

    const tableRows = filteredTours.map((tour, index) => {
      const row = [
        index + 1,
        tour.title || "Unknown",
        getTravellerCount(tour._id),
        getCancellationCount(tour._id),
        getDoubleSharingCount(tour._id),
        getTripleSharingCount(tour._id),
        getMaleCount(tour._id),
        getFemaleCount(tour._id),
        getChildAndWithBerthCount(tour._id),
        tour.available ? "Available" : "Unavailable",
      ];
      console.log(`PDF row for tour ${tour._id}:`, row);
      return row;
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("Tours_Summary.pdf");
  };

  // Handle tour availability change
  const handleChangeAvailability = async (tourId) => {
    const confirm = window.confirm(
      "Are you sure you want to change the tour availability?",
    );
    if (!confirm) return;

    setIsLoading(true);
    try {
      const response = await changeTourAvailablity(tourId);
      if (response.success) {
        toast.success("Tour availability changed successfully");
        await getAllTours(); // Refresh tours after availability change
      } else {
        toast.error(response.message || "Failed to change tour availability");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to change tour availability",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center lg:text-left w-full">
          Tours Controls
        </h1>

        <button
          onClick={exportPDF}
          disabled={isLoading}
          className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition shadow-sm disabled:opacity-60 text-sm sm:text-base"
        >
          {isLoading ? "Processing..." : "Export PDF"}
        </button>
      </div>

      <input
        type="text"
        placeholder="Filter by Tour Title..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        disabled={isLoading}
        className="w-full max-w-lg mb-6 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-60"
      />

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading tours...</div>
      ) : filteredTours.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No tours found</div>
      ) : (
        <>
          {/* DESKTOP TABLE - visible from md+ */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider w-12">
                    S.No
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Tour Title
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
                    Travellers
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
                    Cancellations
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
                    Double
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
                    Triple
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
                    Male
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
                    Female
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
                    Child
                  </th>
                  <th className="px-6 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTours.map((tour, index) => (
                  <tr key={tour._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-center font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {tour.title || "Unknown"}
                    </td>
                    <td className="px-4 py-4 text-center font-semibold">
                      {getTravellerCount(tour._id)}
                    </td>
                    <td className="px-4 py-4 text-center text-red-600">
                      {getCancellationCount(tour._id)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {getDoubleSharingCount(tour._id)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {getTripleSharingCount(tour._id)}
                    </td>
                    <td className="px-4 py-4 text-center text-blue-600">
                      {getMaleCount(tour._id)}
                    </td>
                    <td className="px-4 py-4 text-center text-pink-600">
                      {getFemaleCount(tour._id)}
                    </td>
                    <td className="px-4 py-4 text-center text-purple-600">
                      {getChildAndWithBerthCount(tour._id)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleChangeAvailability(tour._id)}
                        disabled={isLoading}
                        className={`px-5 py-2 rounded-lg text-white text-sm font-medium min-w-[120px] transition ${
                          tour.available
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700"
                        } disabled:opacity-60`}
                      >
                        {tour.available ? "Available" : "Unavailable"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS - visible below md */}
          <div className="md:hidden space-y-5">
            {filteredTours.map((tour, index) => (
              <div
                key={tour._id}
                className="bg-white border border-gray-200 rounded-xl shadow overflow-hidden"
              >
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="font-semibold text-base leading-tight line-clamp-2">
                      {tour.title || "Unknown Tour"}
                    </h3>
                    <span className="text-xs text-gray-500 font-medium shrink-0">
                      #{index + 1}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-4 text-center text-sm">
                  <div>
                    <div className="text-gray-500 text-xs mb-1">Travellers</div>
                    <div className="font-bold text-lg">
                      {getTravellerCount(tour._id)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">
                      Cancellations
                    </div>
                    <div className="font-bold text-lg text-red-600">
                      {getCancellationCount(tour._id)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">Child</div>
                    <div className="font-bold text-lg">
                      {getChildAndWithBerthCount(tour._id)}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-500 text-xs mb-1">Double</div>
                    <div className="font-bold text-lg">
                      {getDoubleSharingCount(tour._id)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">Triple</div>
                    <div className="font-bold text-lg">
                      {getTripleSharingCount(tour._id)}
                    </div>
                  </div>
                  <div className="col-span-3 mt-2">
                    <div className="flex justify-center gap-8">
                      <div>
                        <div className="text-gray-500 text-xs">Male</div>
                        <div className="font-bold text-blue-600">
                          {getMaleCount(tour._id)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Female</div>
                        <div className="font-bold text-pink-600">
                          {getFemaleCount(tour._id)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-4 bg-gray-50 border-t flex justify-center">
                  <button
                    onClick={() => handleChangeAvailability(tour._id)}
                    disabled={isLoading}
                    className={`px-8 py-3 rounded-xl text-white font-medium min-w-[160px] transition shadow-sm ${
                      tour.available
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    } disabled:opacity-60`}
                  >
                    {tour.available ? "Available" : "Unavailable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ToursList;
