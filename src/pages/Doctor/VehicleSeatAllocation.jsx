import { useContext, useEffect, useState } from "react";
import { TourContext } from "../../context/TourContext";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Changed this import

const VehicleSeatAllocation = () => {
  const {
    tourList,
    getTourList,
    currentTourId,
    setCurrentTourId,
    seatAllocation,
    seatAllocationLoading,
    seatAllocationError,
    getVehicleSeatAllocation,
  } = useContext(TourContext);

  const [selectedTourId, setSelectedTourId] = useState(currentTourId || "");

  // Load tour list once on mount if empty
  useEffect(() => {
    if (tourList.length === 0) {
      getTourList();
    }
  }, [tourList.length, getTourList]);

  // Sync with context + auto-fetch when tour changes
  useEffect(() => {
    if (selectedTourId && selectedTourId !== currentTourId) {
      setCurrentTourId(selectedTourId);
      getVehicleSeatAllocation(selectedTourId);
    }
  }, [
    selectedTourId,
    currentTourId,
    setCurrentTourId,
    getVehicleSeatAllocation,
  ]);

  const handleTourChange = (e) => {
    const tourId = e.target.value;
    setSelectedTourId(tourId);
  };

  const selectedTourName =
    tourList.find((t) => t._id === selectedTourId)?.title ||
    tourList.find((t) => t._id === selectedTourId)?.tourName ||
    "Select a tour";

  // ── PDF Download Function ──
  const downloadPdf = () => {
    if (!seatAllocation?.vehicles?.length) {
      toast.info("No data available to download");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let y = 15; // starting Y position

    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("Vehicle & Seat Allocation Report", 20, y);
    y += 10;

    // Tour name & stats
    doc.setFontSize(12);
    doc.text(`Tour: ${selectedTourName}`, 20, y);
    y += 7;
    doc.text(
      `Total seated travellers: ${seatAllocation.totalTravellers}`,
      20,
      y,
    );
    y += 7;
    doc.text(`Total bookings: ${seatAllocation.totalBookings}`, 20, y);
    y += 12;

    seatAllocation.vehicles.forEach((vehicle, index) => {
      // Vehicle header
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text(
        `${vehicle.vehicleName}${vehicle.capacity ? ` (${vehicle.capacity} seats)` : ""}`,
        20,
        y,
      );
      y += 8;

      if (vehicle.remainingSeats !== null) {
        doc.setFontSize(11);
        doc.setTextColor(vehicle.remainingSeats > 0 ? 0 : 180, 0, 0);
        doc.text(`${vehicle.remainingSeats} seats remaining`, 20, y);
        y += 10;
      }

      if (vehicle.travellers.length === 0) {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("No seated travellers in this vehicle", 20, y);
        y += 15;
      } else {
        // Sort by TNR
        const sorted = [...vehicle.travellers].sort((a, b) =>
          a.tnr.localeCompare(b.tnr),
        );

        const tableBody = sorted.map((t) => [
          t.tnr || "-",
          t.name || "-",
          t.seat || "-",
          t.locked || "No",
        ]);

        // FIX: Changed from doc.autoTable to autoTable(doc, ...)
        autoTable(doc, {
          startY: y,
          head: [["TNR", "Name", "Seat", "Locked"]],
          body: tableBody,
          theme: "grid",
          styles: { fontSize: 9, cellPadding: 3, overflow: "linebreak" },
          headStyles: {
            fillColor: [220, 220, 220],
            textColor: [0, 0, 0],
            fontStyle: "bold",
            halign: "left",
          },
          columnStyles: {
            0: { cellWidth: 35 }, // TNR
            1: { cellWidth: 70 }, // Name
            2: { cellWidth: 30 }, // Seat
            3: { cellWidth: 25 }, // Locked
          },
          margin: { left: 20, right: 20 },
          didParseCell(data) {
            if (data.column.index === 3 && data.cell.text[0] === "Yes") {
              data.cell.styles.fillColor = [255, 245, 157]; // light yellow
            }
          },
        });

        // Use doc.lastAutoTable.finalY to track the new Y position
        y = doc.lastAutoTable.finalY + 15;

        // Page break if needed
        if (y > 270 && index < seatAllocation.vehicles.length - 1) {
          doc.addPage();
          y = 15;
        }
      }
    });

    // Footer / timestamp
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Generated on ${new Date().toLocaleString()}`, 20, 290, {
        align: "left",
      });
      doc.text(`Page ${i} of ${pageCount}`, 190, 290, { align: "right" });
    }

    doc.save(`${selectedTourName.replace(/[^a-zA-Z0-9]/g, "-")}-SAM.pdf`);
    toast.success("PDF downloaded successfully");
  };

  return (
    <div className="p-4 sm:p-6 max-w-full md:max-w-7xl mx-auto">
      {/* Header + Tour Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center w-full">
          Vehicle & Seat Allocation
        </h1>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <label
              htmlFor="tour-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Tour
            </label>
            <select
              id="tour-select"
              value={selectedTourId}
              onChange={handleTourChange}
              className="w-full sm:w-72 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={tourList.length === 0}
            >
              <option value="">-- Choose a tour --</option>
              {tourList.map((tour) => (
                <option key={tour._id} value={tour._id}>
                  {tour.title || tour.tourName || "Untitled Tour"}{" "}
                  {tour.startDate && (
                    <span className="text-gray-500 text-sm">
                      ({new Date(tour.startDate).toLocaleDateString()})
                    </span>
                  )}
                </option>
              ))}
            </select>
          </div>

          {selectedTourId && (
            <div className="flex gap-3 w-full sm:w-auto justify-center">
              <button
                onClick={() => getVehicleSeatAllocation(selectedTourId)}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm text-sm"
              >
                Refresh
              </button>
              <button
                onClick={downloadPdf}
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm text-sm"
              >
                Download PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      {!selectedTourId ? (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow text-center text-gray-600">
          <p className="text-base sm:text-lg">
            Please select a tour from the dropdown above to view seat
            allocation.
          </p>
        </div>
      ) : seatAllocationLoading ? (
        <div className="bg-white p-8 sm:p-10 rounded-lg shadow text-center">
          <p className="text-base sm:text-lg text-gray-600">
            Loading seat allocation for <strong>{selectedTourName}</strong>...
          </p>
        </div>
      ) : seatAllocationError ? (
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
          <p className="text-red-700 mb-4 text-sm sm:text-base">
            Error: {seatAllocationError}
          </p>
          <button
            onClick={() => getVehicleSeatAllocation(selectedTourId)}
            className="px-4 sm:px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      ) : !seatAllocation?.vehicles?.length ? (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow text-center text-gray-600">
          <p className="text-base sm:text-lg">
            No seated travellers or vehicle allocations found for{" "}
            <strong>{selectedTourName}</strong>.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow mb-4 sm:mb-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
              <h2 className="text-lg sm:text-xl font-semibold">
                {selectedTourName}
              </h2>
              <div className="text-xs sm:text-sm text-gray-600">
                <span className="font-medium">
                  {seatAllocation.totalTravellers} seated traveller
                  {seatAllocation.totalTravellers !== 1 ? "s" : ""}
                </span>{" "}
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {seatAllocation.vehicles.map((vehicle) => (
              <div
                key={vehicle.vehicleId || "unassigned"}
                className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
              >
                <div className="px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h3 className="text-base sm:text-lg font-medium">
                    {vehicle.vehicleName}
                    {vehicle.capacity && (
                      <span className="text-gray-500 ml-2 text-sm sm:text-base">
                        ({vehicle.capacity} seats)
                      </span>
                    )}
                  </h3>

                  {vehicle.remainingSeats !== null && (
                    <span
                      className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full ${
                        vehicle.remainingSeats > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {vehicle.remainingSeats} remaining
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          TNR
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Seat
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Locked
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[...vehicle.travellers]
                        .sort((a, b) => a.tnr.localeCompare(b.tnr))
                        .map((t, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap font-medium text-gray-900 text-sm">
                              {t.tnr}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-700 text-sm">
                              {t.name}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-700 text-sm">
                              {t.seat}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <span
                                className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                                  t.locked === "Yes"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {t.locked}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {vehicle.travellers.length === 0 && (
                  <div className="p-4 sm:p-8 text-center text-gray-500 italic text-sm sm:text-base">
                    No seated travellers in this vehicle
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VehicleSeatAllocation;
