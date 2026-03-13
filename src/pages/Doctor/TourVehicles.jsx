import React, { useState, useEffect, useContext } from "react";
import { TourContext } from "../../context/TourContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Edit, Trash2, X, Bus, User } from "lucide-react";

// ─── Helpers (Logic Untouched) ──────────────────────────────────────────────
const getLeftCount = (seatsCount) => {
  const s = Number(seatsCount);
  if (s <= 0) return 0;
  return s <= 3 ? 1 : 2;
};

const buildLayout = (rowsCount, seatsCount) => {
  const rows = Math.min(11, Math.max(0, Number(rowsCount)));
  const seats = Math.min(5, Math.max(0, Number(seatsCount)));

  if (rows === 0 || seats === 0) return [];

  const leftCount = getLeftCount(seats);
  const rightCount = seats - leftCount;

  const lsRow = [];
  for (let i = 0; i < leftCount; i++) lsRow.push(`LS${i + 1}`);
  for (let i = 0; i < rightCount; i++) lsRow.push(`LS${leftCount + i + 1}`);

  const passengerRows = Array.from({ length: rows }, (_, rowIdx) => {
    const row = [];
    for (let i = 0; i < leftCount; i++)
      row.push(`C${rowIdx * leftCount + i + 1}`);
    for (let i = 0; i < rightCount; i++)
      row.push(`D${rowIdx * rightCount + i + 1}`);
    return row;
  });

  return [lsRow, ...passengerRows];
};

// ─── Responsive Seat Component ──────────────────────────────────────────────
const SeatItem = ({ label, isLeader, positionInfo }) => (
  <div
    className={`flex flex-col items-center justify-center rounded-md sm:rounded-lg border-[1.5px] sm:border-2 shadow-sm transition-all 
      w-full aspect-square max-w-[44px]
      ${
        isLeader
          ? "bg-[#A32E25] text-white border-[#80241D]"
          : "bg-white border-slate-200 text-slate-700"
      }`}
  >
    <span className="text-[8px] sm:text-[10px] md:text-xs font-bold uppercase leading-none">
      {label}
    </span>
    <span
      className={`text-[6px] sm:text-[8px] font-black opacity-60 mt-0.5 ${isLeader ? "text-red-200" : "text-indigo-500"}`}
    >
      {positionInfo}
    </span>
  </div>
);

// ─── Responsive Seat Layout Preview ──────────────────────────────────────────
const SeatLayoutPreview = ({ previewLayout, seatsPerRow }) => {
  const leftCount = getLeftCount(seatsPerRow);
  const rightCount = seatsPerRow - leftCount;

  if (!previewLayout || previewLayout.length === 0) {
    return (
      <div className="bg-slate-50 rounded-2xl p-10 border-2 border-dashed border-slate-200 flex flex-col items-center">
        <Bus className="text-slate-300 mb-2" size={32} />
        <p className="text-center text-slate-400 font-medium text-sm">
          Enter configuration to see bus preview
        </p>
      </div>
    );
  }

  const lsSeats = previewLayout[0] || [];
  const passengerRows = previewLayout.slice(1);

  const getPosLabel = (idx, len, side) => {
    if (side === "left") return idx === 0 ? "W" : "A";
    return idx === len - 1 ? "W" : idx === 0 ? "A" : "M";
  };

  return (
    <div className="bg-slate-100 rounded-3xl p-2 sm:p-4 md:p-8 flex justify-center items-center overflow-hidden">
      <div className="relative bg-white border-2 border-slate-200 rounded-[30px] sm:rounded-[50px] p-4 sm:p-8 md:p-10 shadow-xl w-full max-w-[280px] sm:max-w-[340px] md:max-w-[400px]">
        <div className="flex justify-between items-start mb-6 border-b border-dashed border-slate-200 pb-4">
          <div className="uppercase text-[7px] sm:text-[8px] font-black tracking-[0.2em] text-slate-300 [writing-mode:vertical-lr] rotate-180">
            Front
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
              <User size={18} />
            </div>
            <span className="text-[7px] sm:text-[9px] font-black text-amber-800 mt-1 uppercase">
              Driver
            </span>
          </div>
        </div>

        <div className="absolute -left-1 top-16 w-1.5 h-8 bg-slate-800 rounded-l" />
        <div className="absolute -right-1 top-16 w-1.5 h-8 bg-slate-800 rounded-r" />
        <div className="absolute -left-1 bottom-16 w-1.5 h-8 bg-slate-800 rounded-l" />
        <div className="absolute -right-1 bottom-16 w-1.5 h-8 bg-slate-800 rounded-r" />

        <div className="flex flex-col gap-3 sm:gap-4">
          {[lsSeats, ...passengerRows].map((row, rIdx) => (
            <div
              key={rIdx}
              className="grid items-center gap-1 sm:gap-2"
              style={{
                gridTemplateColumns: `repeat(${leftCount}, minmax(0, 1fr)) 20px repeat(${rightCount}, minmax(0, 1fr))`,
              }}
            >
              {row.slice(0, leftCount).map((seat, i) => (
                <SeatItem
                  key={`left-${i}`}
                  label={seat}
                  isLeader={rIdx === 0}
                  positionInfo={getPosLabel(i, leftCount, "left")}
                />
              ))}

              <div className="flex justify-center">
                <div className="h-full w-[1px] bg-slate-100" />
              </div>

              {row.slice(leftCount).map((seat, i) => (
                <SeatItem
                  key={`right-${i}`}
                  label={seat}
                  isLeader={rIdx === 0}
                  positionInfo={getPosLabel(i, rightCount, "right")}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-dashed border-slate-200 text-center uppercase text-[7px] sm:text-[8px] font-black tracking-[0.2em] text-slate-300">
          Rear Side
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TourVehicles = () => {
  const {
    tourList,
    getTourList,
    tourVehicles,
    getTourVehicles,
    createTourVehicle,
    updateTourVehicle,
    toggleSeatSelection,
    deleteTourVehicle,
  } = useContext(TourContext);

  const [selectedTourId, setSelectedTourId] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [formData, setFormData] = useState({
    vehicleName: "",
    registrationNumber: "",
    passengerRows: 4,
    seatsPerRow: 4,
    allowSeatSelection: false,
  });

  const [previewLayout, setPreviewLayout] = useState([]);

  useEffect(() => {
    if (tourList.length === 0) getTourList();
  }, [tourList.length, getTourList]);

  useEffect(() => {
    if (selectedTourId) getTourVehicles(selectedTourId);
  }, [selectedTourId, getTourVehicles]);

  useEffect(() => {
    if (showCreateModal || showEditModal) {
      setPreviewLayout(
        buildLayout(formData.passengerRows, formData.seatsPerRow),
      );
    }
  }, [
    formData.passengerRows,
    formData.seatsPerRow,
    showCreateModal,
    showEditModal,
  ]);

  const handleTourChange = (e) => setSelectedTourId(e.target.value);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;

    if (name === "passengerRows" || name === "seatsPerRow") {
      newValue = Number(value);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const validateForm = () => {
    if (!formData.vehicleName.trim()) {
      toast.error("Please enter a Bus Name");
      return false;
    }
    if (!formData.registrationNumber.trim()) {
      toast.error("Please enter a Registration Number");
      return false;
    }
    if (!selectedTourId) {
      toast.error("Please select a tour first");
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    const layout = buildLayout(formData.passengerRows, formData.seatsPerRow);
    const payload = {
      vehicleName: formData.vehicleName.trim(),
      registrationNumber: formData.registrationNumber.trim(),
      leaderRow: layout[0],
      passengerRows: layout.slice(1),
      allowSeatSelection: formData.allowSeatSelection,
    };

    const result = await createTourVehicle(selectedTourId, payload);
    if (result.success) closeModals();
  };

  const handleUpdate = async () => {
    if (!selectedVehicle || !validateForm()) return;

    const layout = buildLayout(formData.passengerRows, formData.seatsPerRow);
    const updates = {
      vehicleName: formData.vehicleName.trim(),
      registrationNumber: formData.registrationNumber.trim(),
      allowSeatSelection: formData.allowSeatSelection,
      leaderRow: layout[0],
      passengerRows: layout.slice(1),
    };

    const result = await updateTourVehicle(
      selectedTourId,
      selectedVehicle._id,
      updates,
    );
    if (result.success) closeModals();
  };

  const handleToggleSeatSelection = async (vehicle) => {
    if (!selectedTourId) return;
    await toggleSeatSelection(
      selectedTourId,
      vehicle._id,
      !vehicle.allowSeatSelection,
    );
  };

  const handleDelete = async (vehicle) => {
    if (!selectedTourId) return;

    const bookedCount = vehicle.bookedSeatsCount || 0;

    let confirmMessage = "Are you sure you want to delete this vehicle?";

    if (bookedCount > 0) {
      confirmMessage = `This vehicle has ${bookedCount} booked seat(s). Deleting it may affect bookings. Are you sure you want to proceed?`;
    }

    if (!window.confirm(confirmMessage)) return;

    const result = await deleteTourVehicle(selectedTourId, vehicle._id);
    if (result.success) {
      await getTourVehicles(selectedTourId);
    }
  };

  const openEditModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      vehicleName: vehicle.vehicleName || "",
      registrationNumber: vehicle.registrationNumber || "",
      passengerRows: vehicle.passengerRowCount || 0,
      seatsPerRow: vehicle.seatsPerRow || 0,
      allowSeatSelection: !!vehicle.allowSeatSelection,
    });
    setShowEditModal(true);
  };

  const openCreateModal = () => {
    setFormData({
      vehicleName: "",
      registrationNumber: "",
      passengerRows: 4,
      seatsPerRow: 4,
      allowSeatSelection: false,
    });
    setShowCreateModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedVehicle(null);
  };

  return (
    <>
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
        theme="light"
      />

      <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-12 mb-8 sm:mt-0 sm:mb-8 text-center uppercase tracking-tight">
          Seat allocation management (SAM)
        </h1>

        {/* Tour Selection */}
        <div className="mb-10 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 mx-auto max-w-2xl">
          <label className="block text-sm font-black text-slate-500 mb-3 uppercase tracking-widest text-center">
            Select Tour
          </label>
          <select
            value={selectedTourId}
            onChange={handleTourChange}
            className="w-full px-4 sm:px-6 py-4 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 bg-slate-50 text-slate-700 font-bold outline-none transition-all"
          >
            <option value="">-- Choose a Tour --</option>
            {tourList.map((tour) => (
              <option key={tour._id} value={tour._id}>
                {tour.tourName || tour.title}
              </option>
            ))}
          </select>
        </div>

        {!selectedTourId ? (
          <div className="py-20 text-center">
            <Bus size={64} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest">
              Select a tour to start
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4 px-2">
              <h2 className="text-2xl font-black text-slate-800 uppercase">
                Available Vehicles
              </h2>
              <button
                onClick={openCreateModal}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest transition shadow-lg shadow-indigo-100"
              >
                <Plus size={20} /> Add Bus
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tourVehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="bg-white border-2 border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="p-6 lg:p-8 flex-grow">
                    <div className="flex justify-between items-start mb-6">
                      <div className="truncate pr-2">
                        <h3 className="font-black text-xl text-slate-800 uppercase tracking-tight truncate">
                          {vehicle.vehicleName}
                        </h3>
                        <p className="text-xs font-bold text-slate-400 tracking-widest mt-1">
                          {vehicle.registrationNumber || "NO REG #"}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => openEditModal(vehicle)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">
                          Capacity
                        </span>
                        <span className="font-black text-2xl text-slate-800">
                          {vehicle.totalSeats}
                        </span>
                      </div>
                      <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                        <span className="text-[10px] font-black text-red-400 uppercase block mb-1">
                          Booked
                        </span>
                        <span className="font-black text-2xl text-red-600">
                          {vehicle.bookedSeatsCount || 0}
                        </span>
                      </div>
                    </div>

                    {/* Booked Seats List - Only shown if there are bookings */}
                    <div className="mb-6">
                      <span className="text-[10px] font-black text-slate-500 uppercase block mb-2">
                        Booked Seats
                      </span>
                      {vehicle.bookedSeatsCount > 0 ? (
                        <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-sm text-red-700">
                          {vehicle.bookedSeats &&
                          vehicle.bookedSeats.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {vehicle.bookedSeats
                                .map((bs) => bs.seatNumber)
                                .filter(Boolean)
                                .map((seat, i) => (
                                  <span
                                    key={i}
                                    className="bg-red-100 px-2.5 py-1 rounded-full text-xs font-medium"
                                  >
                                    {seat}
                                  </span>
                                ))}
                            </div>
                          ) : (
                            "Seats booked but numbers not available"
                          )}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm italic">
                          No seats booked
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <span className="text-[10px] font-black text-slate-400 uppercase">
                        Seat Selection
                      </span>
                      <button
                        onClick={() => handleToggleSeatSelection(vehicle)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all
                          ${vehicle.allowSeatSelection ? "bg-green-50 text-green-600 border-green-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}
                      >
                        {vehicle.allowSeatSelection ? "Live" : "Disabled"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* MODAL */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-[30px] sm:rounded-[40px] w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl">
              <div className="p-6 sm:p-8 lg:p-12">
                <div className="flex justify-between items-center mb-6 sm:mb-10">
                  <h2 className="text-xl sm:text-3xl font-black text-slate-800 uppercase tracking-tighter">
                    {showCreateModal ? "New Configuration" : "Update Setup"}
                  </h2>
                  <button
                    onClick={closeModals}
                    className="p-2 sm:p-3 bg-slate-100 rounded-2xl hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                  {/* Form Side */}
                  <div className="space-y-6 sm:space-y-8">
                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase mb-2 tracking-widest">
                          Bus Name
                        </label>
                        <input
                          type="text"
                          name="vehicleName"
                          value={formData.vehicleName}
                          onChange={handleInputChange}
                          className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-sm sm:text-base"
                          placeholder="e.g. Bus No 1"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase mb-2 tracking-widest">
                          Registration No
                        </label>
                        <input
                          type="text"
                          name="registrationNumber"
                          value={formData.registrationNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-sm sm:text-base"
                          placeholder="XX 00 XX 0000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase mb-2 tracking-widest">
                          Rows (Max 11)
                        </label>
                        <input
                          type="number"
                          name="passengerRows"
                          value={formData.passengerRows}
                          onChange={handleInputChange}
                          min="1"
                          max="11"
                          className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase mb-2 tracking-widest">
                          Seats/Row (Max 5)
                        </label>
                        <input
                          type="number"
                          name="seatsPerRow"
                          value={formData.seatsPerRow}
                          onChange={handleInputChange}
                          min="2"
                          max="5"
                          className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div className="p-4 sm:p-6 bg-indigo-50 rounded-[24px] flex items-center gap-4">
                      <input
                        type="checkbox"
                        name="allowSeatSelection"
                        checked={formData.allowSeatSelection}
                        onChange={handleInputChange}
                        className="w-5 h-5 sm:w-6 sm:h-6 accent-indigo-600"
                        id="selection-check"
                      />
                      <label
                        htmlFor="selection-check"
                        className="text-[11px] sm:text-sm font-bold text-indigo-900 cursor-pointer"
                      >
                        Enable Seat Selection for Customers
                      </label>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={showCreateModal ? handleCreate : handleUpdate}
                        className="flex-1 bg-indigo-600 text-white py-4 sm:py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition text-sm sm:text-base"
                      >
                        {showCreateModal
                          ? "Initialize Bus"
                          : "Refresh Configuration"}
                      </button>
                    </div>
                  </div>

                  {/* Preview Side */}
                  <div className="bg-slate-50 rounded-[30px] sm:rounded-[40px] p-2 flex flex-col">
                    <div className="text-center py-4">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                        Live Preview
                      </span>
                    </div>
                    <SeatLayoutPreview
                      previewLayout={previewLayout}
                      seatsPerRow={formData.seatsPerRow}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TourVehicles;
