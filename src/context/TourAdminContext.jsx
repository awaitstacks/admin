/* eslint-disable no-unused-vars */

/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useState, useCallback, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const TourAdminContext = createContext();

const TourAdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : "",
  );
  const [tours, setTours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingsStats, setBookingsStats] = useState(null);
  const [tourBookings, setTourBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);

  const [dashData, setDashData] = useState(false);
  const [cancelRule, setCancelRule] = useState(null);
  const [cancelBookings, setCancelBookings] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedTourId, setSelectedTourId] = useState("");
  const [roomAllocation, setRoomAllocation] = useState(null);
  const [localRoomAllocation, setLocalRoomAllocation] = useState(null);
  const [roomAllocationLoading, setRoomAllocationLoading] = useState(false);
  const [roomAllocationError, setRoomAllocationError] = useState(null);

  const [termsLoading, setTermsLoading] = useState(false);
  const [termsError, setTermsError] = useState(null);
  const [currentTermsVersion, setCurrentTermsVersion] = useState(null);
  const [tourVehicles, setTourVehicles] = useState([]); // list of vehicles for current tour
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehiclesError, setVehiclesError] = useState(null);
  const [currentTourId, setCurrentTourId] = useState(null);

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  // === VALIDATE API RESPONSE ===
  const validateApiResponse = useCallback((data, errorMessage) => {
    console.log(
      "API Response:",
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      data,
    );
    if (data && typeof data === "object" && "success" in data) return data;
    throw new Error(data?.message || errorMessage || "Invalid response");
  }, []);

  const handleApiError = (error, defaultMsg = "Operation failed") => {
    const msg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      defaultMsg;
    console.error("API Error:", msg, error);
    toast.error(msg);
    return msg;
  };

  // ─── Auth persistence ──────────────────────────────────────────────
  useEffect(() => {
    if (aToken) {
      localStorage.setItem("aToken", aToken);
    } else {
      localStorage.removeItem("aToken");
    }
  }, [aToken]);

  // ─── NEW FUNCTION: Fetch & trigger room allotment ──────────────────
  const fetchRoomAllocation = useCallback(
    async (tourId) => {
      if (!tourId || !/^[0-9a-fA-F]{24}$/.test(tourId)) {
        toast.error("Invalid tour ID format");
        return null;
      }

      setRoomAllocationLoading(true);
      setRoomAllocationError(null);
      setRoomAllocation(null);

      try {
        const { data } = await axios.get(
          `${backendUrl}/api/touradmin/adminallot-rooms/${tourId}`,
          { headers: { aToken } },
        );

        console.log("RAW axios response.data =", data);

        let allocationData = data;

        if (data?.success && data?.data) {
          allocationData = data.data;
        }

        console.log("Final allocation data going to state =", allocationData);

        setRoomAllocation(allocationData);

        const count =
          allocationData.totalRooms ||
          allocationData.roomAllocations?.length ||
          0;
        toast.success(`Room allocation loaded (${count} rooms)`);

        return allocationData;
      } catch (err) {
        const msg =
          err.response?.data?.message || "Failed to load room allocation";
        setRoomAllocationError(msg);
        toast.error(msg);
        console.error("Room allocation fetch error:", err);
        return null;
      } finally {
        setRoomAllocationLoading(false);
      }
    },
    [aToken, backendUrl],
  );

  useEffect(() => {
    if (selectedTourId) {
      fetchRoomAllocation(selectedTourId).then((data) => {
        setLocalRoomAllocation(data);
      });
    } else {
      setLocalRoomAllocation(null);
    }
  }, [selectedTourId, fetchRoomAllocation]);

  const fetchAllBookings = useCallback(async () => {
    setIsLoadingBookings(true);
    setBookingsError(null);

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/touradmin/get-bookings`,
        {
          headers: { aToken },
        },
      );

      const validated = validateApiResponse(data, "Failed to fetch bookings");

      setBookings(validated.bookings || []);

      setBookingsStats({
        totalBookings: validated.totalBookings || validated.total || 0,
        totalEarnings: validated.totalEarnings || 0,
        completedBookings: validated.completedBookings || 0,
        pendingBookings: validated.pendingBookings || 0,
      });

      toast.success(`Loaded ${validated.bookings?.length || 0} bookings`);
      return validated;
    } catch (error) {
      console.error("fetchAllBookings error:", error);
      const msg = error.response?.data?.message || "Failed to load bookings";
      setBookingsError(msg);
      toast.error(msg);
      throw error;
    } finally {
      setIsLoadingBookings(false);
    }
  }, [aToken, backendUrl, validateApiResponse]);

  const getAllBookings = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/touradmin/bookings`, {
        headers: { aToken },
      });
      const validated = validateApiResponse(data, "Failed to fetch bookings");
      setBookings(validated.bookings);
      return validated;
    } catch (error) {
      console.error("Fetch bookings error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch bookings",
      );
    }
  }, [aToken, backendUrl, validateApiResponse]);

  const getAllUsers = useCallback(async () => {
    try {
      console.log("Fetching all registered users...");
      const { data } = await axios.get(
        `${backendUrl}/api/touradmin/alluser-profile`,
        { headers: { aToken } },
      );

      const validated = validateApiResponse(data, "Failed to fetch users");

      setAllUsers(validated.users || []);
      toast.success(`Loaded ${validated.users?.length || 0} users`);

      return validated;
    } catch (error) {
      console.error("Fetch all users error:", error);
      const msg = error.response?.data?.message || "Failed to load users";
      toast.error(msg);
      throw error;
    }
  }, [aToken, backendUrl, validateApiResponse]);

  const addMissingFields = useCallback(async () => {
    try {
      console.log("Adding missing fields to all bookings...");
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/add-missing-fields`,
        {},
        { headers: { aToken } },
      );

      const validated = validateApiResponse(
        data,
        "Failed to add missing fields",
      );

      return validated;
    } catch (error) {
      console.error("Add missing fields error:", error);
      throw error;
    }
  }, [aToken, backendUrl, validateApiResponse]);

  const getCancelRule = useCallback(async () => {
    try {
      console.log("Fetching cancellation chart...");
      const response = await axios.get(
        `${backendUrl}/api/touradmin/touradmingetcancelrule`,
        { headers: { aToken } },
      );

      const validated = validateApiResponse(
        response.data,
        "Failed to fetch chart",
      );
      setCancelRule(validated.data);
      return validated;
    } catch (error) {
      console.error("Fetch error:", error);
      const msg = error.response?.data?.message || "Failed to load chart";
      toast.error(msg);
      throw error;
    }
  }, [aToken, backendUrl, validateApiResponse]);

  const updateCancelRule = async (payload) => {
    try {
      console.log("Updating chart:", payload);
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/touradmincancelrule`,
        payload,
        {
          headers: {
            aToken,
            "Content-Type": "application/json",
          },
        },
      );

      const validated = validateApiResponse(data, "Failed to update chart");
      if (validated.success) {
        setCancelRule(validated.data);
        toast.success("Cancellation rule updated");
        return validated;
      }
    } catch (error) {
      console.error("Update error:", error);
      const msg = error.response?.data?.message || "Update failed";
      toast.error(msg);
      throw error;
    }
  };

  const getAllTours = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/all-tours`,
        {},
        { headers: { aToken } },
      );
      const validated = validateApiResponse(data, "Failed to fetch tours");
      setTours(validated.tours);
      return validated;
    } catch (error) {
      console.error("Fetch tours error:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch tours");
    }
  };

  const changeTourAvailablity = async (tourId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/change-touravailablity`,
        { tourId },
        { headers: { aToken } },
      );
      const validated = validateApiResponse(
        data,
        "Failed to change availability",
      );
      await getAllTours();
      return validated;
    } catch (error) {
      console.error("Change availability error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to change availability",
      );
    }
  };

  const getAdminDashData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/touradmin/touradmindashboard`,
        { headers: { aToken } },
      );
      const validated = validateApiResponse(data, "Failed to fetch dashboard");
      setDashData(validated.dashData);
      return validated;
    } catch (error) {
      console.error("Fetch dashboard error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch dashboard",
      );
    }
  };
  const rejectBooking = async (tnr, travellerIds) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/reject-bookingadmin`,
        { tnr, travellerIds },
        { headers: { aToken } },
      );

      const validated = validateApiResponse(data, "Failed to reject booking");

      // Refresh bookings after successful rejection
      await getAllBookings();

      return validated;
    } catch (error) {
      console.error("Reject booking error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to reject booking",
      );
    }
  };

  const releaseBooking = async (tnr, travellerIds) => {
    try {
      if (!tnr || typeof tnr !== "string" || tnr.trim().length !== 6) {
        throw new Error("Valid 6-character TNR is required");
      }

      if (!Array.isArray(travellerIds) || travellerIds.length === 0) {
        throw new Error("travellerIds must be a non-empty array");
      }

      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/release-bookingadmin`,
        {
          tnr: tnr.trim().toUpperCase(), // normalize TNR
          travellerIds,
        },
        { headers: { aToken } },
      );

      const validated = validateApiResponse(data, "Failed to release booking");

      // Refresh bookings list after success
      await getAllBookings();

      return validated;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to release booking";

      console.error("Release booking error:", error); // keep this for debugging (you can remove later)
      toast.error(msg);

      throw new Error(msg);
    }
  };

  const getCancellations = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/touradmin/touradmingetcancellations`,
        { headers: { aToken } },
      );

      const validated = validateApiResponse(
        data,
        "Failed to fetch cancellations",
      );

      if (validated.success) {
        // Optional: sort by createdAt descending
        const sorted = (validated.data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setCancelBookings(sorted);
      } else {
        toast.error(validated.message || "Failed to load cancellations");
      }

      return validated;
    } catch (error) {
      console.error("getCancellations error:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch cancellations",
      );
      throw error;
    }
  }, [aToken, backendUrl, validateApiResponse]);

  const approveCancellation = async (
    tnr, // ← Changed from bookingId to tnr
    travellerIds,
    cancellationId,
  ) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/approvecancellation`,
        { tnr, travellerIds, cancellationId }, // ← Now sends tnr
        { headers: { aToken } },
      );

      const validated = validateApiResponse(data, "Failed to approve");

      // Refresh the list after approval
      await getCancellations();

      return validated;
    } catch (error) {
      console.error("approveCancellation error:", error);
      throw error;
    }
  };

  const rejectCancellation = async (tnr, travellerIds, cancellationId) => {
    try {
      const payload = { tnr, travellerIds };
      if (cancellationId) payload.cancellationId = cancellationId;

      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/rejectcancellation`,
        payload,
        {
          headers: { aToken },
        },
      );

      const validated = validateApiResponse(
        data,
        "Failed to reject cancellation",
      );

      // Optional: refresh after success
      await getAllBookings();

      return validated;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to reject cancellation request";
      toast.error(msg);
      throw error;
    }
  };
  const getPendingApprovals = useCallback(async () => {
    try {
      console.log("Fetching pending manage-booking approvals...");
      const { data } = await axios.get(
        `${backendUrl}/api/touradmin/pending-approvals`,
        {
          headers: { aToken },
        },
      );

      const validated = validateApiResponse(
        data,
        "Failed to fetch pending approvals",
      );

      setPendingApprovals(validated.data);

      return validated;
    } catch (error) {
      console.error("getPendingApprovals error:", error);
      throw error;
    }
  }, [aToken, backendUrl, validateApiResponse]);

  const approveBookingUpdate = async (bookingId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/approvebookingupdate`,
        { bookingId },
        {
          headers: { aToken },
        },
      );

      const validated = validateApiResponse(
        data,
        "Failed to approve booking update",
      );

      if (validated.success) {
        await getPendingApprovals();
        await getAllBookings();
      }

      return validated;
    } catch (error) {
      console.error("Approve update error:", error);
      const msg = error.response?.data?.message || "Failed to approve update";

      throw error;
    }
  };

  const rejectBookingUpdate = async (bookingId, remark = "") => {
    try {
      console.log("Rejecting booking update for:", bookingId);
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/rejectbookingupdate`,
        { bookingId, remark },
        {
          headers: { aToken },
        },
      );

      const validated = validateApiResponse(
        data,
        "Failed to reject booking update",
      );

      if (validated.success) {
        await getPendingApprovals();
        await getAllBookings();
      }

      return validated;
    } catch (error) {
      console.error("Reject update error:", error);
      const msg = error.response?.data?.message || "Failed to reject update";

      throw error;
    }
  };

  const fetchToursList = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/touradmin/tourlist`, {
        headers: { aToken },
      });
      const validated = validateApiResponse(data, "Failed to load tours");
      setTours(validated.tours || []);

      return validated;
    } catch (err) {
      toast.error(err.message || "Failed to load tours");
      throw err;
    }
  }, [aToken, backendUrl, validateApiResponse]);

  const fetchBookingsOfTour = useCallback(
    async (tourId) => {
      if (!tourId) return null;

      setIsLoadingBookings(true);
      setBookingsError(null);

      try {
        const { data } = await axios.get(
          `${backendUrl}/api/touradmin/adminbookings-tour/${tourId}`,
          { headers: { aToken } },
        );

        const validated = validateApiResponse(
          data,
          "Failed to load tour bookings",
        );

        setTourBookings(validated.bookings || []);

        toast.success("Bookings fetched successfully", {
          toastId: "namelist-success",
          autoClose: 2500,
        });

        return validated;
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to load bookings";
        toast.error(msg);
        throw err;
      } finally {
        setIsLoadingBookings(false);
      }
    },
    [aToken, backendUrl, validateApiResponse],
  );

  // ────────────────────────────────────────────────────────────────
  //  NEW FUNCTION ADDED: generate missing TNRs
  // ────────────────────────────────────────────────────────────────
  const generateMissingTNRs = useCallback(async () => {
    try {
      toast.info("Generating missing TNRs... This may take a moment.");

      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/generate-missing-tnrs`,
        {},
        { headers: { aToken } },
      );

      const validated = validateApiResponse(
        data,
        "Failed to generate missing TNRs",
      );

      if (validated.success) {
        const { summary, failedBookings } = validated;

        toast.success(validated.message || "TNR generation completed");

        console.log("TNR generation summary:", summary);

        if (failedBookings?.length > 0) {
          console.warn("Some bookings failed to get TNR:", failedBookings);
          toast.warn(
            `${failedBookings.length} bookings could not be processed`,
          );
        }

        // Optional: refresh bookings list after successful generation
        await fetchAllBookings();

        return validated;
      }

      return validated;
    } catch (error) {
      console.error("generateMissingTNRs error:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to generate missing TNRs";
      toast.error(msg);
      throw error;
    }
  }, [aToken, backendUrl, validateApiResponse, fetchAllBookings]);

  useEffect(() => {
    if (aToken) {
      fetchToursList();
    }
  }, [aToken, fetchToursList]);
  const addTermsPoints = useCallback(
    async (pointsArray) => {
      if (!Array.isArray(pointsArray) || pointsArray.length === 0) {
        toast.error("Please provide at least one terms point");
        return { success: false, message: "Invalid input" };
      }

      setTermsLoading(true);
      setTermsError(null);

      try {
        const payload = { points: pointsArray }; // can be strings or {text, internalNote}

        const { data } = await axios.post(
          `${backendUrl}/api/touradmin/terms/add-points`,
          payload,
          {
            headers: {
              aToken,
              "Content-Type": "application/json",
            },
          },
        );

        if (!data?.success) {
          throw new Error(data?.message || "Failed to add terms points");
        }

        // Optional: update local state if you want to show latest version immediately
        if (data.data?.version) {
          setCurrentTermsVersion(data.data.version);
        }

        return data;
      } catch (error) {
        const msg =
          error.response?.data?.message ||
          error.message ||
          "Failed to add terms points";
        console.error("addTermsPoints error:", error);
        setTermsError(msg);

        return { success: false, message: msg };
      } finally {
        setTermsLoading(false);
      }
    },
    [aToken, backendUrl],
  );

  const fetchCurrentTerms = useCallback(async () => {
    setTermsLoading(true);
    setTermsError(null);

    try {
      // ─── CHANGED: use the correct protected path ───
      const { data } = await axios.get(
        `${backendUrl}/api/touradmin/terms/current`,
        { headers: { aToken } }, // ← add auth header since it's protected
      );

      const validated = validateApiResponse(
        data,
        "Failed to fetch current terms",
      );

      if (validated.success && validated.data) {
        if (validated.data.version) {
          setCurrentTermsVersion(validated.data.version);
        }
        toast.success("Current terms loaded", {
          toastId: "terms-fetch-success",
          autoClose: 2000,
        });
        return validated.data;
      }

      return null;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load current terms";
      console.error("fetchCurrentTerms error:", error);
      setTermsError(msg);

      return null;
    } finally {
      setTermsLoading(false);
    }
  }, [backendUrl, validateApiResponse, aToken]); // ← added aToken to deps

  const deleteTermsPoint = useCallback(
    async (pointId) => {
      if (!pointId) {
        return { success: false, message: "Point ID required" };
      }

      setTermsLoading(true);
      setTermsError(null);

      try {
        const { data } = await axios.delete(
          `${backendUrl}/api/touradmin/terms/points/${pointId}`,
          {
            headers: {
              aToken,
              "Content-Type": "application/json",
            },
          },
        );

        const validated = validateApiResponse(
          data,
          "Failed to delete terms point",
        );

        if (validated.success) {
          // Optional: refresh current terms after deletion
          const updatedTerms = await fetchCurrentTerms();
          return { success: true, data: updatedTerms };
        }

        return { success: false, message: validated.message };
      } catch (error) {
        const msg =
          error.response?.data?.message ||
          error.message ||
          "Failed to deactivate point";
        console.error("deleteTermsPoint error:", error);
        setTermsError(msg);

        return { success: false, message: msg };
      } finally {
        setTermsLoading(false);
      }
    },
    [aToken, backendUrl, validateApiResponse, fetchCurrentTerms],
  );

  const getTourVehicles = useCallback(
    async (tourId) => {
      if (!tourId) {
        toast.error("Tour ID is required");
        return { success: false, message: "Tour ID required" };
      }

      setVehiclesLoading(true);
      setVehiclesError(null);

      try {
        const { data } = await axios.get(
          `${backendUrl}/api/touradmin/${tourId}/vehicles`,
          { headers: { aToken }, timeout: 12000 },
        );

        if (data.success) {
          setTourVehicles(data.vehicles || []);
          if (tourId !== currentTourId) setCurrentTourId(tourId);
          return { success: true, vehicles: data.vehicles, count: data.count };
        } else {
          setTourVehicles([]);
          setVehiclesError(data.message || "Failed to load vehicles");
          toast.error(data.message || "Could not fetch vehicles");
          return { success: false, message: data.message };
        }
      } catch (error) {
        console.error("getTourVehicles error:", error);
        const msg =
          error.response?.data?.message || error.message || "Network error";
        setVehiclesError(msg);
        toast.error(msg);
        setTourVehicles([]);
        return { success: false, message: msg };
      } finally {
        setVehiclesLoading(false);
      }
    },
    [backendUrl, aToken, currentTourId],
  );

  const createTourVehicle = async (tourId, vehiclePayload) => {
    if (!tourId) return { success: false, message: "Tour ID required" };
    if (!vehiclePayload?.vehicleName?.trim()) {
      toast.error("Vehicle name is required");
      return { success: false, message: "Vehicle name required" };
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/${tourId}/vehicles`,
        vehiclePayload,
        { headers: { aToken }, timeout: 10000 },
      );

      if (data.success) {
        // Optimistic update – add to list if we're viewing this tour
        if (tourId === currentTourId) {
          setTourVehicles((prev) => [...prev, data.data || data.vehicle]);
        }
        toast.success("Vehicle created successfully");
        return { success: true, vehicle: data.data || data.vehicle };
      } else {
        toast.error(data.message || "Failed to create vehicle");
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("createTourVehicle error:", error);
      const msg =
        error.response?.data?.message || error.message || "Server error";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const updateTourVehicle = async (tourId, vehicleId, updates) => {
    if (!tourId || !vehicleId)
      return { success: false, message: "Missing IDs" };

    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/touradmin/${tourId}/vehicles/${vehicleId}`,
        updates,
        { headers: { aToken }, timeout: 10000 },
      );

      if (data.success) {
        // Update in list if loaded
        if (tourId === currentTourId) {
          setTourVehicles((prev) =>
            prev.map((v) =>
              v._id === vehicleId ? { ...v, ...data.vehicle } : v,
            ),
          );
        }
        toast.success("Vehicle updated");
        return { success: true, vehicle: data.vehicle };
      } else {
        toast.error(data.message || "Update failed");
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("updateTourVehicle error:", error);
      const msg = error.response?.data?.message || error.message;
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const toggleSeatSelection = async (tourId, vehicleId, allow) => {
    if (!tourId || !vehicleId)
      return { success: false, message: "Missing IDs" };
    if (typeof allow !== "boolean") {
      toast.error("allowSeatSelection must be true or false");
      return { success: false, message: "Invalid value" };
    }

    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/touradmin/${tourId}/vehicles/${vehicleId}/toggle-seat-selection`,
        { allowSeatSelection: allow },
        { headers: { aToken }, timeout: 8000 },
      );

      if (data.success) {
        if (tourId === currentTourId) {
          setTourVehicles((prev) =>
            prev.map((v) =>
              v._id === vehicleId ? { ...v, allowSeatSelection: allow } : v,
            ),
          );
        }
        toast.success(`Seat selection ${allow ? "enabled" : "disabled"}`);
        return { success: true, vehicle: data.vehicle };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("toggleSeatSelection error:", error);
      const msg = error.response?.data?.message || error.message;
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const deleteTourVehicle = async (tourId, vehicleId) => {
    if (!tourId || !vehicleId) {
      toast.error("Missing IDs");
      return { success: false, message: "Missing IDs" };
    }

    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/touradmin/${tourId}/vehicles/${vehicleId}`,
        { headers: { aToken }, timeout: 10000 },
      );

      if (data.success) {
        if (tourId === currentTourId) {
          setTourVehicles((prev) => prev.filter((v) => v._id !== vehicleId));
        }
        toast.success("Vehicle deleted");
        return { success: true };
      } else {
        toast.error(data.message || "Cannot delete vehicle");
        return { success: false, message: data.message };
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || // ← Use backend message first
        error.message ||
        "Failed to delete vehicle";

      // Special handling for 403 (optional - but now uses real message)
      if (error.response?.status === 403) {
        const bookedCount = error.response?.data?.bookedSeatsCount || 0;
        toast.error(
          bookedCount > 0
            ? `Cannot delete — ${bookedCount} seat(s) already booked`
            : "Cannot delete vehicle (seats booked)",
        );
      } else {
        toast.error(msg);
      }

      console.error("deleteTourVehicle error:", error);
      return { success: false, message: msg, status: error.response?.status };
    }
  };

  const value = {
    aToken,
    setAToken,
    backendUrl,
    tours,
    setTours,
    getAllTours,
    changeTourAvailablity,
    bookings,
    bookingsStats,
    isLoadingBookings,
    bookingsError,
    tourBookings,
    setTourBookings,
    fetchAllBookings,
    getAllBookings,

    dashData,
    setDashData,
    cancelRule,
    setCancelRule,
    cancelBookings,
    setCancelBookings,
    pendingApprovals,
    setPendingApprovals,
    allUsers,
    getAllUsers,

    addMissingFields,
    getCancelRule,
    updateCancelRule,
    getCancellations,
    approveCancellation,
    rejectCancellation,

    rejectBooking,
    releaseBooking,
    getPendingApprovals,
    approveBookingUpdate,
    rejectBookingUpdate,
    getAdminDashData,

    fetchToursList,
    fetchBookingsOfTour,

    selectedTourId,
    setSelectedTourId,

    roomAllocation,
    setRoomAllocation,
    roomAllocationLoading,
    roomAllocationError,
    setRoomAllocationError,
    fetchRoomAllocation,

    generateMissingTNRs,
    termsLoading,
    termsError,
    currentTermsVersion,
    addTermsPoints,
    deleteTermsPoint,
    fetchCurrentTerms,
    tourVehicles,
    vehiclesLoading,
    vehiclesError,
    getTourVehicles,
    createTourVehicle,
    updateTourVehicle,
    toggleSeatSelection,
    deleteTourVehicle,
  };

  return (
    <TourAdminContext.Provider value={value}>
      {props.children}
    </TourAdminContext.Provider>
  );
};

export default TourAdminContextProvider;
