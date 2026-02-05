// /* eslint-disable no-useless-catch */
// /* eslint-disable react-refresh/only-export-components */

// import { createContext, useState, useCallback } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";

// export const TourAdminContext = createContext();

// const TourAdminContextProvider = (props) => {
//   const [aToken, setAToken] = useState(
//     localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
//   );
//   const [tours, setTours] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [dashData, setDashData] = useState(false);
//   const [cancelRule, setCancelRule] = useState(null);
//   const [cancelBookings, setCancelBookings] = useState([]);
//   const [pendingApprovals, setPendingApprovals] = useState([]);
//   const [allUsers, setAllUsers] = useState([]); // Store all users here

//   const backendUrl =
//     import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

//   // === VALIDATE API RESPONSE ===
//   const validateApiResponse = useCallback((data, errorMessage) => {
//     console.log(
//       "API Response:",
//       new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
//       data
//     );
//     if (data && typeof data === "object" && "success" in data) return data;
//     throw new Error(data?.message || errorMessage || "Invalid response");
//   }, []);

//   // === GET ALL REGISTERED USERS (FIXED ROUTE) ===
//   const getAllUsers = useCallback(async () => {
//     try {
//       console.log("Fetching all registered users...");
//       const { data } = await axios.get(
//         `${backendUrl}/api/touradmin/alluser-profile`,  // ← Correct route name
//         {
//           headers: { aToken },
//         }
//       );

//       const validated = validateApiResponse(data, "Failed to fetch users");

//       setAllUsers(validated.users || []); // Assuming backend returns { success: true, total: X, users: [...] }
//       toast.success(`Loaded ${validated.total || validated.users?.length || 0} users`);

//       return validated;
//     } catch (error) {
//       console.error("Fetch all users error:", error);
//       const msg = error.response?.data?.message || "Failed to load users";
//       toast.error(msg);
//       throw error;
//     }
//   }, [aToken, backendUrl, validateApiResponse]);

//   // === OTHER EXISTING FUNCTIONS (kept as-is for completeness) ===
//   const addMissingFields = useCallback(async () => {
//     try {
//       console.log("Adding missing fields to all bookings...");
//       const { data } = await axios.post(
//         `${backendUrl}/api/touradmin/add-missing-fields`,
//         {},
//         { headers: { aToken } }
//       );

//       const validated = validateApiResponse(
//         data,
//         "Failed to add missing fields"
//       );

//       return validated;
//     } catch (error) {
//       console.error("Add missing fields error:", error);
//       throw error;
//     }
//   }, [aToken, backendUrl, validateApiResponse]);

//   const getCancelRule = useCallback(async () => {
//     try {
//       console.log("Fetching cancellation chart...");
//       const response = await axios.get(
//         `${backendUrl}/api/touradmin/touradmingetcancelrule`,
//         { headers: { aToken } }
//       );

//       const validated = validateApiResponse(
//         response.data,
//         "Failed to fetch chart"
//       );
//       setCancelRule(validated.data);
//       return validated;
//     } catch (error) {
//       console.error("Fetch error:", error);
//       const msg = error.response?.data?.message || "Failed to load chart";
//       toast.error(msg);
//       throw error;
//     }
//   }, [aToken, backendUrl, validateApiResponse]);

//   const updateCancelRule = async (payload) => {
//     try {
//       console.log("Updating chart:", payload);
//       const { data } = await axios.post(
//         `${backendUrl}/api/touradmin/touradmincancelrule`,
//         payload,
//         {
//           headers: {
//             aToken,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const validated = validateApiResponse(data, "Failed to update chart");
//       if (validated.success) {
//         setCancelRule(validated.data);
//         toast.success("Cancellation rule updated");
//         return validated;
//       }
//     } catch (error) {
//       console.error("Update error:", error);
//       const msg = error.response?.data?.message || "Update failed";
//       toast.error(msg);
//       throw error;
//     }
//   };

//   const getAllTours = async () => {
//     try {
//       const { data } = await axios.post(
//         `${backendUrl}/api/touradmin/all-tours`,
//         {},
//         { headers: { aToken } }
//       );
//       const validated = validateApiResponse(data, "Failed to fetch tours");
//       setTours(validated.tours);
//       return validated;
//     } catch (error) {
//       console.error("Fetch tours error:", error);
//       throw new Error(error.response?.data?.message || "Failed to fetch tours");
//     }
//   };

//   const changeTourAvailablity = async (tourId) => {
//     try {
//       const { data } = await axios.post(
//         `${backendUrl}/api/touradmin/change-touravailablity`,
//         { tourId },
//         { headers: { aToken } }
//       );
//       const validated = validateApiResponse(
//         data,
//         "Failed to change availability"
//       );
//       await getAllTours();
//       return validated;
//     } catch (error) {
//       console.error("Change availability error:", error);
//       throw new Error(
//         error.response?.data?.message || "Failed to change availability"
//       );
//     }
//   };

//   const getAllBookings = useCallback(async () => {
//     try {
//       const { data } = await axios.get(`${backendUrl}/api/touradmin/bookings`, {
//         headers: { aToken },
//       });
//       const validated = validateApiResponse(data, "Failed to fetch bookings");
//       setBookings(validated.bookings);
//       return validated;
//     } catch (error) {
//       console.error("Fetch bookings error:", error);
//       throw new Error(
//         error.response?.data?.message || "Failed to fetch bookings"
//       );
//     }
//   }, [aToken, backendUrl, validateApiResponse]);

//   const getAdminDashData = async () => {
//     try {
//       const { data } = await axios.get(
//         `${backendUrl}/api/touradmin/touradmindashboard`,
//         { headers: { aToken } }
//       );
//       const validated = validateApiResponse(data, "Failed to fetch dashboard");
//       setDashData(validated.dashData);
//       return validated;
//     } catch (error) {
//       console.error("Fetch dashboard error:", error);
//       throw new Error(
//         error.response?.data?.message || "Failed to fetch dashboard"
//       );
//     }
//   };

//   const cancelBooking = async (tourBookingId, travellerIds) => {
//     try {
//       const { data } = await axios.post(
//         `${backendUrl}/api/touradmin/cancel-bookingadmin`,
//         { tourBookingId, travellerIds },
//         { headers: { aToken } }
//       );
//       const validated = validateApiResponse(data, "Failed to cancel booking");
//       await getAllBookings();
//       return validated;
//     } catch (error) {
//       console.error("Cancel booking error:", error);
//       throw new Error(
//         error.response?.data?.message || "Failed to cancel booking"
//       );
//     }
//   };

//   const rejectBooking = async (tourBookingId, travellerIds) => {
//     try {
//       const { data } = await axios.post(
//         `${backendUrl}/api/touradmin/reject-bookingadmin`,
//         { tourBookingId, travellerIds },
//         { headers: { aToken } }
//       );
//       const validated = validateApiResponse(data, "Failed to reject booking");
//       await getAllBookings();
//       return validated;
//     } catch (error) {
//       console.error("Reject booking error:", error);
//       throw new Error(
//         error.response?.data?.message || "Failed to reject booking"
//       );
//     }
//   };

//   const releaseBooking = async (tourBookingId, travellerIds) => {
//     try {
//       const { data } = await axios.post(
//         `${backendUrl}/api/touradmin/release-bookingadmin`,
//         { tourBookingId, travellerIds },
//         { headers: { aToken } }
//       );
//       const validated = validateApiResponse(data, "Failed to release booking");
//       await getAllBookings();
//       return validated;
//     } catch (error) {
//       console.error("Release booking error:", error);
//       throw new Error(
//         error.response?.data?.message || "Failed to release booking"
//       );
//     }
//   };

//   const getCancellations = useCallback(async () => {
//     try {
//       const { data } = await axios.get(
//         `${backendUrl}/api/touradmin/touradmingetcancellations`,
//         { headers: { aToken } }
//       );
//       const validated = validateApiResponse(
//         data,
//         "Failed to fetch cancellations"
//       );
//       setCancelBookings(validated.data);
//       return validated;
//     } catch (error) {
//       throw error;
//     }
//   }, [aToken, backendUrl, validateApiResponse]);

//   const approveCancellation = async (
//     bookingId,
//     travellerIds,
//     cancellationId
//   ) => {
//     try {
//       const { data } = await axios.post(
//         `${backendUrl}/api/touradmin/approvecancellation`,
//         { bookingId, travellerIds, cancellationId },
//         { headers: { aToken } }
//       );
//       const validated = validateApiResponse(data, "Failed to approve");
//       await getCancellations();
//       return validated;
//     } catch (error) {
//       throw error;
//     }
//   };

//   const rejectCancellation = async (
//     bookingId,
//     travellerIds,
//     cancellationId
//   ) => {
//     try {
//       const { data } = await axios.post(
//         `${backendUrl}/api/touradmin/rejectcancellation`,
//         { bookingId, travellerIds, cancellationId },
//         { headers: { aToken } }
//       );
//       const validated = validateApiResponse(data, "Failed to reject");
//       await getCancellations();
//       return validated;
//     } catch (error) {
//       throw error;
//     }
//   };

//   const getPendingApprovals = useCallback(async () => {
//     try {
//       console.log("Fetching pending manage-booking approvals...");
//       const { data } = await axios.get(
//         `${backendUrl}/api/touradmin/pending-approvals`,
//         {
//           headers: { aToken },
//         }
//       );

//       const validated = validateApiResponse(
//         data,
//         "Failed to fetch pending approvals"
//       );

//       setPendingApprovals(validated.data);

//       return validated;
//     } catch (error) {
//       console.error("getPendingApprovals error:", error);
//       throw error;
//     }
//   }, [aToken, backendUrl, validateApiResponse]);

//   const approveBookingUpdate = async (bookingId) => {
//     try {
//       console.log("Approving booking update for:", bookingId);
//       const { data } = await axios.post(
//         `${backendUrl}/api/touradmin/approvebookingupdate`,
//         { bookingId },
//         {
//           headers: { aToken },
//         }
//       );

//       const validated = validateApiResponse(
//         data,
//         "Failed to approve booking update"
//       );

//       if (validated.success) {
//         toast.success("Booking update approved!");
//         await getPendingApprovals();
//         await getAllBookings();
//       }

//       return validated;
//     } catch (error) {
//       console.error("Approve update error:", error);
//       const msg = error.response?.data?.message || "Failed to approve update";
//       toast.error(msg);
//       throw error;
//     }
//   };

//   const rejectBookingUpdate = async (bookingId, remark = "") => {
//     try {
//       console.log("Rejecting booking update for:", bookingId);
//       const { data } = await axios.post(
//         `${backendUrl}/api/touradmin/rejectbookingupdate`,
//         { bookingId, remark },
//         {
//           headers: { aToken },
//         }
//       );

//       const validated = validateApiResponse(
//         data,
//         "Failed to reject booking update"
//       );

//       if (validated.success) {
//         toast.success("Booking update rejected!");
//         await getPendingApprovals();
//         await getAllBookings();
//       }

//       return validated;
//     } catch (error) {
//       console.error("Reject update error:", error);
//       const msg = error.response?.data?.message || "Failed to reject update";
//       toast.error(msg);
//       throw error;
//     }
//   };

//   // === FINAL CONTEXT VALUE ===
//   const value = {
//     aToken,
//     setAToken,
//     backendUrl,
//     tours,
//     setTours,
//     getAllTours,
//     changeTourAvailablity,
//     bookings,
//     setBookings,
//     getAllBookings,
//     cancelBooking,
//     rejectBooking,
//     releaseBooking,
//     dashData,
//     setDashData,
//     getAdminDashData,
//     cancelRule,
//     setCancelRule,
//     getCancelRule,
//     updateCancelRule,
//     getCancellations,
//     approveCancellation,
//     rejectCancellation,
//     cancelBookings,
//     setCancelBookings,
//     addMissingFields,
//     getPendingApprovals,
//     pendingApprovals,
//     setPendingApprovals,
//     approveBookingUpdate,
//     rejectBookingUpdate,

//     // All Users – now correctly linked
//     allUsers,
//     getAllUsers,
//   };

//   return (
//     <TourAdminContext.Provider value={value}>
//       {props.children}
//     </TourAdminContext.Provider>
//   );
// };

// export default TourAdminContextProvider;


/* eslint-disable no-useless-catch */
/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useState, useCallback, useEffect } from "react"; import axios from "axios";
import { toast } from "react-toastify";

export const TourAdminContext = createContext();

const TourAdminContextProvider = (props) => {
  // const [aToken, setAToken] = useState(
  //   localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  // );

  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [tours, setTours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingsStats, setBookingsStats] = useState(null); // new: stores stats from /get-bookings
  const [tourBookings, setTourBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);

  const [dashData, setDashData] = useState(false);
  const [cancelRule, setCancelRule] = useState(null);
  const [cancelBookings, setCancelBookings] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedTourId, setSelectedTourId] = useState(""); // ← இது முக்கியம் (crash fix)
  const [roomAllocation, setRoomAllocation] = useState(null);
  const [localRoomAllocation, setLocalRoomAllocation] = useState(null);
  const [roomAllocationLoading, setRoomAllocationLoading] = useState(false);
  const [roomAllocationError, setRoomAllocationError] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  // === VALIDATE API RESPONSE ===
  const validateApiResponse = useCallback((data, errorMessage) => {
    console.log(
      "API Response:",
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      data
    );
    if (data && typeof data === "object" && "success" in data) return data;
    throw new Error(data?.message || errorMessage || "Invalid response");
  }, []);

  const handleApiError = (error, defaultMsg = "Operation failed") => {
    const msg = error.response?.data?.error || error.response?.data?.message || error.message || defaultMsg;
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
  const fetchRoomAllocation = useCallback(async (tourId) => {
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
        { headers: { aToken } }
      );

      console.log("RAW axios response.data =", data); // ← மிக முக்கியம்

      // Try these variations one by one (comment others)
      let allocationData = data;

      // Option A - most common in your case
      if (data?.success && data?.data) {
        allocationData = data.data;
      }

      // Option B - if nested even deeper
      // if (data?.success && data?.data?.roomAllocation) {
      //   allocationData = data.data.roomAllocation;
      // }

      console.log("Final allocation data going to state =", allocationData);

      // const validated = validateApiResponse(allocationData, "Failed to get room allocation");

      setRoomAllocation(allocationData);

      const count = validated.totalRooms || validated.roomAllocations?.length || 0;
      toast.success(`Room allocation loaded (${count} rooms)`);

      return validated;
    } catch (err) {
      // ... existing error handling

    } finally {
      setRoomAllocationLoading(false);
    }
  }, [aToken, backendUrl, validateApiResponse]);

  // Optional: auto-fetch allocation when selectedTourId changes
  useEffect(() => {
    if (selectedTourId) {
      fetchRoomAllocation(selectedTourId).then((data) => {
        setLocalRoomAllocation(data);
      });
    } else {
      setLocalRoomAllocation(null);
    }
  }, [selectedTourId]);

  // === NEW FUNCTION to fetch from your latest route (/api/touradmin/get-bookings) ===
  const fetchAllBookings = useCallback(async () => {
    setIsLoadingBookings(true);
    setBookingsError(null);

    try {
      const { data } = await axios.get(`${backendUrl}/api/touradmin/get-bookings`, {
        headers: { aToken },
      });

      const validated = validateApiResponse(data, "Failed to fetch bookings");

      // Store bookings array
      setBookings(validated.bookings || []);

      // Store stats if available
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

  // === YOUR ORIGINAL getAllBookings FUNCTION (unchanged as requested) ===
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
        error.response?.data?.message || "Failed to fetch bookings"
      );
    }
  }, [aToken, backendUrl, validateApiResponse]);

  // === GET ALL REGISTERED USERS ===
  const getAllUsers = useCallback(async () => {
    try {
      console.log("Fetching all registered users...");
      const { data } = await axios.get(
        `${backendUrl}/api/touradmin/alluser-profile`,
        { headers: { aToken } }
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

  // === ALL YOUR OTHER EXISTING FUNCTIONS (unchanged) ===
  const addMissingFields = useCallback(async () => {
    try {
      console.log("Adding missing fields to all bookings...");
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/add-missing-fields`,
        {},
        { headers: { aToken } }
      );

      const validated = validateApiResponse(
        data,
        "Failed to add missing fields"
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
        { headers: { aToken } }
      );

      const validated = validateApiResponse(
        response.data,
        "Failed to fetch chart"
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
        }
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
        { headers: { aToken } }
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
        { headers: { aToken } }
      );
      const validated = validateApiResponse(
        data,
        "Failed to change availability"
      );
      await getAllTours();
      return validated;
    } catch (error) {
      console.error("Change availability error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to change availability"
      );
    }
  };

  const getAdminDashData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/touradmin/touradmindashboard`,
        { headers: { aToken } }
      );
      const validated = validateApiResponse(data, "Failed to fetch dashboard");
      setDashData(validated.dashData);
      return validated;
    } catch (error) {
      console.error("Fetch dashboard error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch dashboard"
      );
    }
  };

  const cancelBooking = async (tourBookingId, travellerIds) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/cancel-bookingadmin`,
        { tourBookingId, travellerIds },
        { headers: { aToken } }
      );
      const validated = validateApiResponse(data, "Failed to cancel booking");
      await getAllBookings();
      return validated;
    } catch (error) {
      console.error("Cancel booking error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to cancel booking"
      );
    }
  };

  const rejectBooking = async (tourBookingId, travellerIds) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/reject-bookingadmin`,
        { tourBookingId, travellerIds },
        { headers: { aToken } }
      );
      const validated = validateApiResponse(data, "Failed to reject booking");
      await getAllBookings();
      return validated;
    } catch (error) {
      console.error("Reject booking error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to reject booking"
      );
    }
  };

  const releaseBooking = async (tourBookingId, travellerIds) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/release-bookingadmin`,
        { tourBookingId, travellerIds },
        { headers: { aToken } }
      );
      const validated = validateApiResponse(data, "Failed to release booking");
      await getAllBookings();
      return validated;
    } catch (error) {
      console.error("Release booking error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to release booking"
      );
    }
  };

  const getCancellations = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/touradmin/touradmingetcancellations`,
        { headers: { aToken } }
      );
      const validated = validateApiResponse(
        data,
        "Failed to fetch cancellations"
      );
      setCancelBookings(validated.data);
      return validated;
    } catch (error) {
      throw error;
    }
  }, [aToken, backendUrl, validateApiResponse]);

  const approveCancellation = async (
    bookingId,
    travellerIds,
    cancellationId
  ) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/approvecancellation`,
        { bookingId, travellerIds, cancellationId },
        { headers: { aToken } }
      );
      const validated = validateApiResponse(data, "Failed to approve");
      await getCancellations();
      return validated;
    } catch (error) {
      throw error;
    }
  };

  const rejectCancellation = async (
    bookingId,
    travellerIds,
    cancellationId
  ) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/rejectcancellation`,
        { bookingId, travellerIds, cancellationId },
        { headers: { aToken } }
      );
      const validated = validateApiResponse(data, "Failed to reject");
      await getCancellations();
      return validated;
    } catch (error) {
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
        }
      );

      const validated = validateApiResponse(
        data,
        "Failed to fetch pending approvals"
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
      console.log("Approving booking update for:", bookingId);
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/approvebookingupdate`,
        { bookingId },
        {
          headers: { aToken },
        }
      );

      const validated = validateApiResponse(
        data,
        "Failed to approve booking update"
      );

      if (validated.success) {
        toast.success("Booking update approved!");
        await getPendingApprovals();
        await getAllBookings();
      }

      return validated;
    } catch (error) {
      console.error("Approve update error:", error);
      const msg = error.response?.data?.message || "Failed to approve update";
      toast.error(msg);
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
        }
      );

      const validated = validateApiResponse(
        data,
        "Failed to reject booking update"
      );

      if (validated.success) {
        toast.success("Booking update rejected!");
        await getPendingApprovals();
        await getAllBookings();
      }

      return validated;
    } catch (error) {
      console.error("Reject update error:", error);
      const msg = error.response?.data?.message || "Failed to reject update";
      toast.error(msg);
      throw error;
    }
  };


  // Fetch all tours
  const fetchToursList = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/touradmin/tourlist`, {
        headers: { aToken },
      });
      const validated = validateApiResponse(data, "Failed to load tours");
      setTours(validated.tours || []);
      toast.success(`Loaded ${validated.tours?.length || 0} tours`);
      return validated;
    } catch (err) {
      toast.error(err.message || "Failed to load tours");
      throw err;
    }
  }, [aToken, backendUrl, validateApiResponse]);

  // Fetch bookings for a specific tour
  // Inside TourAdminContext.jsx
  const fetchBookingsOfTour = useCallback(async (tourId) => {
    if (!tourId) return null;

    setIsLoadingBookings(true);
    setBookingsError(null); // if you have error state

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/touradmin/adminbookings-tour/${tourId}`,
        { headers: { aToken } }
      );

      const validated = validateApiResponse(data, "Failed to load tour bookings");

      setTourBookings(validated.bookings || []);

      // ─── Only this toast ───────────────────────────────────────
      toast.success("Bookings fetched successfully", {
        toastId: "namelist-success",      // prevents duplicate toasts
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
  }, [aToken, backendUrl, validateApiResponse]);

  // Update single traveller
  const updateSingleTraveller = useCallback(async ({
    bookingId,
    travellerId,
    trainSeats,
    flightSeats,
    staffRemarks,
  }) => {
    if (!bookingId || !travellerId) {
      toast.error("Booking ID and Traveller ID are required");
      return null;
    }

    try {
      const payload = {
        bookingId,
        travellerId,
        ...(trainSeats !== undefined && { trainSeats: Number(trainSeats) }),
        ...(flightSeats !== undefined && { flightSeats: Number(flightSeats) }),
        ...(staffRemarks !== undefined && { staffRemarks: String(staffRemarks).trim() }),
      };

      const { data } = await axios.put(
        `${backendUrl}/api/touradmin/adminupdate-traveller`,
        payload,
        { headers: { aToken } }
      );

      const validated = validateApiResponse(data, "Failed to update traveller");
      toast.success("Traveller details updated");

      // Auto-refresh current tour bookings
      if (selectedTourId) { // selectedTourId இப்போ context-ல இருக்கு
        await fetchBookingsOfTour(selectedTourId);
      }

      return validated;
    } catch (err) {
      const msg = err.response?.data?.message || "Update failed";
      toast.error(msg);
      throw err;
    }
  }, [aToken, backendUrl, validateApiResponse, selectedTourId, fetchBookingsOfTour]);

  // Auto-load tours when token changes
  useEffect(() => {
    if (aToken) {
      fetchToursList();
    }
  }, [aToken, fetchToursList]);

  // === FINAL CONTEXT VALUE ===
  const value = {
    aToken,
    setAToken,
    backendUrl,
    tours,
    setTours,
    getAllTours,
    changeTourAvailablity,
    bookings,
    bookingsStats,           // new: totalBookings, totalEarnings, etc.
    isLoadingBookings,
    bookingsError,
    tourBookings,
    setTourBookings,
    fetchAllBookings,        // new function linked to /api/touradmin/get-bookings
    getAllBookings,          // your original function (unchanged)

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
    cancelBooking,
    rejectBooking,
    releaseBooking,
    getPendingApprovals,
    approveBookingUpdate,
    rejectBookingUpdate,
    getAdminDashData,

    // ─── NEW FUNCTIONS ───────────────────────────────
    fetchToursList,
    fetchBookingsOfTour,
    updateSingleTraveller,
    selectedTourId,
    setSelectedTourId,

    // Room allocation
    roomAllocation,
    setRoomAllocation,               // ← இதை add பண்ணு (useState இருந்தா auto available)
    roomAllocationLoading,
    roomAllocationError,
    setRoomAllocationError,
    fetchRoomAllocation,
  };

  return (
    <TourAdminContext.Provider value={value}>
      {props.children}
    </TourAdminContext.Provider>
  );
};

export default TourAdminContextProvider;