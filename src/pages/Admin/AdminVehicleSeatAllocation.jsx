// src/pages/admin/AdminVehicleSeatAllocation.jsx
import { useContext, useEffect, useState } from "react";
import { TourContext } from "../../context/TourContext";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AdminVehicleSeatAllocation = () => {
  const { tourList, getTourList, currentTourId, setCurrentTourId } =
    useContext(TourContext);

  const {
    seatAllocation,
    seatAllocationLoading,
    seatAllocationError,
    adminGetVehicleSeatAllocation, // ← your admin function
  } = useContext(TourAdminContext);

  const [selectedTourId, setSelectedTourId] = useState(currentTourId || "");

  // Load tour list once if empty
  useEffect(() => {
    if (tourList.length === 0) {
      getTourList();
    }
  }, [tourList.length, getTourList]);

  // Auto-fetch when tour changes
  useEffect(() => {
    if (selectedTourId && selectedTourId !== currentTourId) {
      setCurrentTourId(selectedTourId);
      adminGetVehicleSeatAllocation(selectedTourId);
    }
  }, [
    selectedTourId,
    currentTourId,
    setCurrentTourId,
    adminGetVehicleSeatAllocation,
  ]);

  const handleTourChange = (e) => {
    setSelectedTourId(e.target.value);
  };

  const selectedTourName =
    tourList.find((t) => t._id === selectedTourId)?.title ||
    tourList.find((t) => t._id === selectedTourId)?.tourName ||
    "Select a tour";

  // ── PDF Download ───────────────────────────────────────────────
  const downloadPdf = () => {
    if (!seatAllocation?.vehicles?.length) {
      toast.info("No seat allocation data to export");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let y = 15;

    doc.setFontSize(18);
    doc.text("Admin Vehicle & Seat Allocation Report", 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Tour: ${selectedTourName}`, 20, y);
    y += 7;
    doc.text(`Total seated: ${seatAllocation.totalTravellers || 0}`, 20, y);
    y += 7;
    doc.text(`Total bookings: ${seatAllocation.totalBookings || 0}`, 20, y);
    y += 12;

    seatAllocation.vehicles.forEach((vehicle, idx) => {
      doc.setFontSize(14);
      doc.text(
        `${vehicle.vehicleName}${vehicle.capacity ? ` (${vehicle.capacity} seats)` : ""}`,
        20,
        y,
      );
      y += 8;

      if (vehicle.remainingSeats != null) {
        doc.setFontSize(11);
        doc.setTextColor(vehicle.remainingSeats > 0 ? 0 : 180, 0, 0);
        doc.text(`${vehicle.remainingSeats} seats remaining`, 20, y);
        y += 10;
      }

      if (!vehicle.travellers?.length) {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("No travellers assigned", 20, y);
        y += 15;
      } else {
        // Sort by seat number: C1 → C2 → C10 → D1 → D2 etc.
        const sorted = [...vehicle.travellers].sort((a, b) => {
          const getSeatParts = (seat) => {
            if (!seat || seat === "—") return ["ZZZ", Infinity];
            const match = seat.match(/^([A-Za-z]+)(\d+)$/);
            if (!match) return ["ZZZ", Infinity];
            const [, prefix, numStr] = match;
            return [prefix.toUpperCase(), parseInt(numStr, 10)];
          };

          const [prefixA, numA] = getSeatParts(a.seat);
          const [prefixB, numB] = getSeatParts(b.seat);

          if (prefixA !== prefixB) return prefixA.localeCompare(prefixB);
          return numA - numB;
        });

        const tableBody = sorted.map((t) => [
          t.tnr || "-",
          t.name || "-",
          t.seat || "-",
          t.locked ? "Yes" : "No",
        ]);

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
            1: { cellWidth: 75 }, // Name
            2: { cellWidth: 30 }, // Seat
            3: { cellWidth: 30 }, // Locked
          },
          margin: { left: 20, right: 20 },
          didParseCell: (data) => {
            if (data.column.index === 3 && data.cell.text[0] === "Yes") {
              data.cell.styles.fillColor = [255, 245, 157];
            }
          },
        });

        y = doc.lastAutoTable.finalY + 15;

        if (y > 270 && idx < seatAllocation.vehicles.length - 1) {
          doc.addPage();
          y = 15;
        }
      }
    });

    // Footer on every page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 20, 290);
      doc.text(`Page ${i} / ${pageCount}`, 190, 290, { align: "right" });
    }

    doc.save(
      `${selectedTourName.replace(/[^a-zA-Z0-9]/g, "-")}-Admin-Seat.pdf`,
    );
    toast.success("PDF downloaded");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-full lg:max-w-7xl mx-auto">
      {/* Header + Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Admin Vehicle & Seat Allocation
        </h1>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
          <div className="w-full sm:w-80 lg:w-96">
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
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              disabled={tourList.length === 0}
            >
              <option value="">-- Select a tour --</option>
              {tourList.map((tour) => (
                <option key={tour._id} value={tour._id}>
                  {tour.title || tour.tourName || "Untitled Tour"}{" "}
                  {tour.startDate && (
                    <span className="text-gray-500 text-xs md:text-sm">
                      ({new Date(tour.startDate).toLocaleDateString("en-IN")})
                    </span>
                  )}
                </option>
              ))}
            </select>
          </div>

          {selectedTourId && (
            <div className="flex flex-row gap-3 mt-4 md:mt-6 lg:mt-0">
              <button
                onClick={() => adminGetVehicleSeatAllocation(selectedTourId)}
                disabled={seatAllocationLoading}
                className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition text-sm md:text-base"
              >
                {seatAllocationLoading ? "Refreshing..." : "Refresh"}
              </button>

              <button
                onClick={downloadPdf}
                disabled={
                  seatAllocationLoading || !seatAllocation?.vehicles?.length
                }
                className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition text-sm md:text-base"
              >
                Download PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {!selectedTourId ? (
        <div className="bg-white p-6 md:p-10 rounded-xl shadow-lg text-center text-gray-600">
          <p className="text-lg md:text-xl">
            Please select a tour to view vehicle & seat allocation details.
          </p>
        </div>
      ) : seatAllocationLoading ? (
        <div className="bg-white p-10 rounded-xl shadow-lg text-center">
          <p className="text-lg md:text-xl text-gray-700 animate-pulse">
            Loading seat allocation data...
          </p>
        </div>
      ) : seatAllocationError ? (
        <div className="bg-red-50 border border-red-200 p-6 md:p-10 rounded-xl text-center">
          <p className="text-red-700 mb-6 text-base md:text-lg">
            {seatAllocationError}
          </p>
          <button
            onClick={() => adminGetVehicleSeatAllocation(selectedTourId)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      ) : !seatAllocation?.vehicles?.length ? (
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg text-center text-gray-600">
          <p className="text-lg md:text-xl">
            No vehicle or seated traveller data found for{" "}
            <strong>{selectedTourName}</strong>.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Card */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow mb-6 border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                {selectedTourName}
              </h2>
              <div className="text-sm md:text-base text-gray-600">
                <strong>{seatAllocation.totalTravellers || 0}</strong> seated
                traveller
                {seatAllocation.totalTravellers !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Vehicles Grid */}
          <div className="grid grid-cols-1 gap-6 md:gap-8">
            {seatAllocation.vehicles.map((vehicle) => (
              <div
                key={vehicle.vehicleId || vehicle.vehicleName}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
              >
                {/* Vehicle Header */}
                <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h3 className="text-lg md:text-xl font-medium text-gray-900">
                    {vehicle.vehicleName}
                    {vehicle.capacity && (
                      <span className="text-gray-600 ml-3 text-base md:text-lg">
                        ({vehicle.capacity} seats)
                      </span>
                    )}
                  </h3>

                  {vehicle.remainingSeats != null && (
                    <span
                      className={`px-3 py-1.5 rounded-full text-sm md:text-base font-medium ${
                        vehicle.remainingSeats > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {vehicle.remainingSeats} remaining
                    </span>
                  )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                          TNR
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Seat
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Locked
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {[...vehicle.travellers]
                        .sort((a, b) => {
                          const getSeatParts = (seat) => {
                            if (!seat || seat === "—") return ["ZZZ", Infinity];
                            const match = seat.match(/^([A-Za-z]+)(\d+)$/);
                            if (!match) return ["ZZZ", Infinity];
                            const [, prefix, numStr] = match;
                            return [prefix.toUpperCase(), parseInt(numStr, 10)];
                          };

                          const [prefixA, numA] = getSeatParts(a.seat);
                          const [prefixB, numB] = getSeatParts(b.seat);

                          if (prefixA !== prefixB)
                            return prefixA.localeCompare(prefixB);
                          return numA - numB;
                        })
                        .map((t, i) => (
                          <tr
                            key={i}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap font-medium text-gray-900 text-sm md:text-base">
                              {t.tnr || "-"}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-700 text-sm md:text-base">
                              {t.name || "-"}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-700 text-sm md:text-base">
                              {t.seat || "-"}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <span
                                className={`inline-block px-2.5 py-1 text-xs md:text-sm font-medium rounded-full ${
                                  t.locked === "Yes"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {t.locked ? "Yes" : "No"}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {vehicle.travellers.length === 0 && (
                  <div className="p-6 sm:p-10 text-center text-gray-500 italic text-sm md:text-base">
                    No travellers seated in this vehicle
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

export default AdminVehicleSeatAllocation;
