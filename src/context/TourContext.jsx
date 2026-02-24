import { useState, useCallback, createContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// eslint-disable-next-line react-refresh/only-export-components
export const TourContext = createContext();

const TourContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [ttoken, setttoken] = useState(
    localStorage.getItem("ttoken") ? localStorage.getItem("ttoken") : "",
  );

  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [profileData, setProfileData] = useState(false);
  const [tourList, setTourList] = useState([]);
  const [advanceDetails, setAdvanceDetails] = useState(null);
  const [balanceDetails, setBalanceDetails] = useState(null);
  const [singleBooking, setSingleBooking] = useState(null);
  const [managedBookingsHistory, setManagedBookingsHistory] = useState([]);
  const [roomAllocation, setRoomAllocation] = useState(null);
  const [roomAllocationLoading, setRoomAllocationLoading] = useState(false);
  const [roomAllocationError, setRoomAllocationError] = useState(null);

  // ==================== GET ALL BOOKINGS ====================
  const getAllBookings = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/tour/bookings-all`, {
        headers: { ttoken },
      });

      if (data.success) {
        setAllBookings(data.bookings || []);

        return { success: true, bookings: data.bookings, stats: data };
      } else {
        setAllBookings([]);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("getAllBookings error:", error);
      setAllBookings([]);
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || "Network error",
      };
    }
  }, [backendUrl, ttoken]);

  // 1. taskMarkAdvanceReceiptSent
  const taskMarkAdvanceReceiptSent = async (tnr) => {
    try {
      if (!tnr) {
        toast.error("TNR is missing – cannot mark receipt");
        return { success: false, message: "TNR is required" };
      }

      const { data } = await axios.put(
        `${backendUrl}/api/tour/task/mark-advance-receipt-sent`,
        { tnr }, // ← changed from bookingId → tnr
        {
          headers: { ttoken },
          timeout: 10000,
        },
      );

      if (data.success) {
        // Update state using tnr instead of _id
        setAllBookings((prev) =>
          prev.map((b) =>
            b.tnr === tnr
              ? {
                  ...b,
                  receipts: {
                    ...b.receipts,
                    advanceReceiptSent: true,
                    advanceReceiptSentAt: new Date(),
                  },
                }
              : b,
          ),
        );

        setBookings((prev) =>
          prev.map((b) =>
            b.tnr === tnr
              ? {
                  ...b,
                  receipts: {
                    ...b.receipts,
                    advanceReceiptSent: true,
                    advanceReceiptSentAt: new Date(),
                  },
                }
              : b,
          ),
        );
      }

      return data;
    } catch (error) {
      console.error("taskMarkAdvanceReceiptSent ERROR:", error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to mark advance receipt as sent";

      toast.error(errMsg);
      return {
        success: false,
        message: errMsg,
      };
    }
  };

  // 2. taskMarkBalanceReceiptSent
  const taskMarkBalanceReceiptSent = async (tnr) => {
    try {
      if (!tnr) {
        toast.error("TNR is missing – cannot mark balance receipt");
        return { success: false, message: "TNR is required" };
      }

      const { data } = await axios.put(
        `${backendUrl}/api/tour/task/mark-balance-receipt-sent`,
        { tnr }, // ← changed from bookingId → tnr
        {
          headers: { ttoken },
          timeout: 10000,
        },
      );

      if (data.success) {
        // Update both allBookings and bookings using tnr
        setAllBookings((prev) =>
          prev.map((b) =>
            b.tnr === tnr
              ? {
                  ...b,
                  receipts: {
                    ...b.receipts,
                    balanceReceiptSent: true,
                    balanceReceiptSentAt: new Date(),
                  },
                }
              : b,
          ),
        );

        setBookings((prev) =>
          prev.map((b) =>
            b.tnr === tnr
              ? {
                  ...b,
                  receipts: {
                    ...b.receipts,
                    balanceReceiptSent: true,
                    balanceReceiptSentAt: new Date(),
                  },
                }
              : b,
          ),
        );
      }

      return data;
    } catch (error) {
      console.error("taskMarkBalanceReceiptSent ERROR:", error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to mark balance receipt as sent";

      toast.error(errMsg);
      return {
        success: false,
        message: errMsg,
      };
    }
  };

  // 3. taskMarkModifyReceipt
  const taskMarkModifyReceipt = async (tnr) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/tour/task/modify-receipt`,
        { tnr }, // ← changed from bookingId → tnr
        {
          headers: { ttoken },
          timeout: 10000,
        },
      );

      if (data.success) {
        setAllBookings((prev) =>
          prev.map((b) =>
            b.tnr === tnr ? { ...b, isTripCompleted: false } : b,
          ),
        );
        setBookings((prev) =>
          prev.map((b) =>
            b.tnr === tnr ? { ...b, isTripCompleted: false } : b,
          ),
        );
      }
      return data;
    } catch (error) {
      console.error("taskMarkModifyReceipt ERROR:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || "Network error",
      };
    }
  };

  const taskCompleteBooking = async (tnr) => {
    try {
      if (!tnr) {
        toast.error("TNR is missing – cannot complete booking");
        return { success: false, message: "TNR is required" };
      }

      const { data } = await axios.put(
        `${backendUrl}/api/tour/task/complete-booking`,
        { tnr }, // ← changed from bookingId to tnr
        {
          headers: { ttoken },
          timeout: 10000,
        },
      );

      if (data.success) {
        // Update both allBookings and bookings using tnr
        setAllBookings((prev) =>
          prev.map((b) =>
            b.tnr === tnr
              ? {
                  ...b,
                  isBookingCompleted: true,
                  bookingCompletedAt: new Date(),
                }
              : b,
          ),
        );

        setBookings((prev) =>
          prev.map((b) =>
            b.tnr === tnr
              ? {
                  ...b,
                  isBookingCompleted: true,
                  bookingCompletedAt: new Date(),
                }
              : b,
          ),
        );
      }

      return data;
    } catch (error) {
      console.error("taskCompleteBooking ERROR:", error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to complete booking";

      toast.error(errMsg);
      return {
        success: false,
        message: errMsg,
      };
    }
  };
  const taskMarkCancellationReceiptSent = async (tnr) => {
    try {
      if (!tnr || typeof tnr !== "string" || tnr.trim().length !== 6) {
        toast.error("Valid 6-character TNR is required");
        return { success: false, message: "Valid 6-character TNR is required" };
      }

      const normalizedTnr = tnr.trim().toUpperCase();

      const { data } = await axios.put(
        `${backendUrl}/api/tour/task/mark-cancellation-receipt-sent`, // ← static URL (no /:tnr)
        { tnr: normalizedTnr }, // ← send tnr in body
        {
          headers: { ttoken },
          timeout: 10000,
        },
      );

      if (data.success) {
        setAllBookings((prev) =>
          prev.map((b) =>
            b.tnr === normalizedTnr ? { ...b, cancellationReceipt: true } : b,
          ),
        );

        setBookings((prev) =>
          prev.map((b) =>
            b.tnr === normalizedTnr ? { ...b, cancellationReceipt: true } : b,
          ),
        );

        if (singleBooking?.tnr === normalizedTnr) {
          setSingleBooking((prev) => ({
            ...prev,
            cancellationReceipt: true,
          }));
        }
      }

      return data;
    } catch (error) {
      console.error("taskMarkCancellationReceiptSent ERROR:", error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to mark cancellation receipt";

      toast.error(errMsg);
      return {
        success: false,
        message: errMsg,
      };
    }
  };
  // 6. taskMarkManageBookingReceiptSent
  const taskMarkManageBookingReceiptSent = async (tnr) => {
    try {
      if (!tnr || typeof tnr !== "string" || tnr.trim().length !== 6) {
        toast.error("Valid 6-character TNR is required");
        return { success: false, message: "Valid 6-character TNR is required" };
      }

      const normalizedTnr = tnr.trim().toUpperCase();

      console.log("Sending request to mark manage booking receipt sent:", {
        tnr: normalizedTnr,
      });

      const { data } = await axios.put(
        `${backendUrl}/api/tour/task/mark-managebooking-receipt-sent`, // ← Static URL (NO /${tnr})
        { tnr: normalizedTnr }, // ← tnr in body
        {
          headers: { ttoken },
          timeout: 10000,
        },
      );

      if (data.success) {
        setAllBookings((prev) =>
          prev.map((b) =>
            b.tnr === normalizedTnr ? { ...b, manageBookingReceipt: true } : b,
          ),
        );

        setBookings((prev) =>
          prev.map((b) =>
            b.tnr === normalizedTnr ? { ...b, manageBookingReceipt: true } : b,
          ),
        );

        if (singleBooking?.tnr === normalizedTnr) {
          setSingleBooking((prev) => ({
            ...prev,
            manageBookingReceipt: true,
          }));
        }
      } else {
        toast.error(data.message || "Failed to mark receipt");
      }

      return data;
    } catch (error) {
      console.error("taskMarkManageBookingReceiptSent ERROR:", error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Network/server error";

      toast.error(errMsg);
      return {
        success: false,
        message: errMsg,
      };
    }
  };

  // ==================== Existing Functions ====================

  const getTourList = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/tour/list`, {
        headers: { ttoken },
      });
      if (data.success) {
        setTourList(data.tours);
      }
      return data;
    } catch (error) {
      console.error("getTourList error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }, [backendUrl, ttoken]);

  const getBookings = useCallback(
    async (tourId) => {
      try {
        if (!tourId) {
          setBookings([]);
          return { success: true, bookings: [] };
        }
        const { data } = await axios.get(
          `${backendUrl}/api/tour/bookings-tour/${tourId}`,
          { headers: { ttoken } },
        );
        if (data.success) {
          setBookings(data.bookings);
        }
        return data;
      } catch (error) {
        console.error("getBookings error:", error);
        return {
          success: false,
          message: error.response?.data?.message || error.message,
        };
      }
    },
    [backendUrl, ttoken],
  );

  const getDashData = useCallback(
    async (tourId) => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/tour/tour-dashboard/${tourId}`,
          { headers: { ttoken } },
        );
        if (data.success) {
          setDashData(data.data);
        }
        return data;
      } catch (error) {
        console.error("getDashData error:", error);
        return {
          success: false,
          message: error.response?.data?.message || error.message,
        };
      }
    },
    [backendUrl, ttoken],
  );

  const viewBooking = useCallback(
    async (tnr) => {
      if (!tnr || typeof tnr !== "string" || tnr.trim().length !== 6) {
        toast.error("Valid 6-character TNR is required");
        return { success: false, message: "Valid 6-character TNR is required" };
      }

      try {
        const normalizedTnr = tnr.trim().toUpperCase();

        const { data } = await axios.get(
          `${backendUrl}/api/tour/view-booking-cancel/${normalizedTnr}`,
          { headers: { ttoken } },
        );

        if (data.success) {
          setSingleBooking(data.data);

          return { success: true, booking: data.data };
        } else {
          return { success: false, message: data.message };
        }
      } catch (error) {
        console.error("viewBooking ERROR:", error);
        console.error("Error response:", error.response?.data);
        console.error("Status:", error.response?.status);

        const message =
          error.response?.data?.message ||
          error.message ||
          "Network error while fetching booking";

        toast.error(message);
        return { success: false, message };
      }
    },
    [backendUrl, ttoken],
  );
  const updateTravellerDetails = async (
    bookingId,
    travellerId,
    travellerData,
  ) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/tour/update-traveller`,
        { bookingId, travellerId, ...travellerData },
        { headers: { ttoken } },
      );
      return data;
    } catch (error) {
      console.error("updateTravellerDetails error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update traveller details",
      };
    }
  };

  const markAdvancePaid = async (tnr, tourId) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/tour/mark-advancepaid`,
        { tnr, tourId },
        { headers: { ttoken } },
      );
      if (data.success) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.tnr === tnr
              ? {
                  ...booking,
                  payment: {
                    ...booking.payment,
                    advance: {
                      ...booking.payment.advance,
                      paid: true,
                      paymentVerified: true,
                      paidAt: new Date(),
                    },
                  },
                }
              : booking,
          ),
        );
      }
      return data;
    } catch (error) {
      console.error("markAdvancePaid error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  const markBalancePaid = async (tnr, tourId) => {
    try {
      if (!tnr) {
        return {
          success: false,
          message: "TNR is required",
        };
      }

      const { data } = await axios.put(
        `${backendUrl}/api/tour/mark-balancepaid`,
        { tnr, tourId }, // ← changed from bookingId → tnr
        { headers: { ttoken } },
      );

      if (data.success) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.tnr === tnr
              ? {
                  ...booking,
                  payment: {
                    ...booking.payment,
                    balance: {
                      ...booking.payment.balance,
                      paid: true,
                      paymentVerified: true,
                      paidAt: new Date(),
                    },
                  },
                }
              : booking,
          ),
        );
      }

      return data;
    } catch (error) {
      console.error("markBalancePaid error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to mark balance paid",
      };
    }
  };

  const completeBooking = async (tnr, tourId) => {
    try {
      if (!tnr) {
        toast.error("TNR is missing – cannot complete booking");
        return { success: false, message: "TNR is required" };
      }

      const { data } = await axios.post(
        `${backendUrl}/api/tour/complete-bookingtour`,
        { tnr, tourId }, // ← changed from bookingId to tnr
        { headers: { ttoken } },
      );

      if (data.success) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.tnr === tnr
              ? {
                  ...booking,
                  isBookingCompleted: true,
                  bookingCompletedAt: new Date(),
                }
              : booking,
          ),
        );

        // If you also maintain allBookings state
        setAllBookings?.((prev) =>
          prev.map((b) =>
            b.tnr === tnr
              ? {
                  ...b,
                  isBookingCompleted: true,
                  bookingCompletedAt: new Date(),
                }
              : b,
          ),
        );
      }

      return data;
    } catch (error) {
      console.error("completeBooking error:", error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to complete booking";

      toast.error(errMsg);
      return {
        success: false,
        message: errMsg,
      };
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/tour/cancel-bookingtour`,
        { bookingId },
        { headers: { ttoken } },
      );
      return data;
    } catch (error) {
      console.error("cancelBooking error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  const getProfileData = async (tourId) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/tour/tour-profile/${tourId}`,
        { headers: { ttoken } },
      );
      if (data.success) {
        setProfileData(data.tourProfileData);
      } else {
        setProfileData(null);
      }
      return data;
    } catch (error) {
      console.error("getProfileData error:", error);
      setProfileData(null);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  const markAdvanceReceiptSent = async (tnr, tourId) => {
    try {
      if (!tnr) {
        toast.error("TNR is missing – cannot mark advance receipt");
        return { success: false, message: "TNR is required" };
      }

      const { data } = await axios.put(
        `${backendUrl}/api/tour/mark-advance-receipt`,
        { tnr, tourId }, // ← changed from bookingId → tnr
        { headers: { ttoken } },
      );

      if (data.success) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.tnr === tnr
              ? {
                  ...booking,
                  receipts: {
                    ...booking.receipts,
                    advanceReceiptSent: true,
                    advanceReceiptSentAt: new Date(),
                  },
                }
              : booking,
          ),
        );

        // Optional: if you maintain allBookings state too
        setAllBookings?.((prev) =>
          prev.map((b) =>
            b.tnr === tnr
              ? {
                  ...b,
                  receipts: {
                    ...b.receipts,
                    advanceReceiptSent: true,
                    advanceReceiptSentAt: new Date(),
                  },
                }
              : b,
          ),
        );
      }

      return data;
    } catch (error) {
      console.error("markAdvanceReceiptSent error:", error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to mark advance receipt";

      toast.error(errMsg);
      return {
        success: false,
        message: errMsg,
      };
    }
  };

  const markBalanceReceiptSent = async (tnr, tourId) => {
    try {
      if (!tnr) {
        toast.error("TNR is missing – cannot mark balance receipt");
        return { success: false, message: "TNR is required" };
      }

      const { data } = await axios.put(
        `${backendUrl}/api/tour/mark-balance-receipt`,
        { tnr, tourId }, // ← changed from bookingId → tnr
        { headers: { ttoken } },
      );

      if (data.success) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.tnr === tnr
              ? {
                  ...booking,
                  receipts: {
                    ...booking.receipts,
                    balanceReceiptSent: true,
                    balanceReceiptSentAt: new Date(),
                  },
                }
              : booking,
          ),
        );

        // Optional: if you maintain allBookings state
        setAllBookings?.((prev) =>
          prev.map((b) =>
            b.tnr === tnr
              ? {
                  ...b,
                  receipts: {
                    ...b.receipts,
                    balanceReceiptSent: true,
                    balanceReceiptSentAt: new Date(),
                  },
                }
              : b,
          ),
        );
      }

      return data;
    } catch (error) {
      console.error("markBalanceReceiptSent error:", error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to mark balance receipt";

      toast.error(errMsg);
      return {
        success: false,
        message: errMsg,
      };
    }
  };

  const viewTourAdvance = async (tnr) => {
    try {
      if (!tnr || typeof tnr !== "string" || tnr.trim().length !== 6) {
        toast.error("Valid 6-character TNR is required");
        return { success: false, message: "Valid 6-character TNR is required" };
      }

      const normalizedTnr = tnr.trim().toUpperCase();

      const { data } = await axios.get(
        `${backendUrl}/api/tour/view-tour-advance/${normalizedTnr}`,
        { headers: { ttoken } },
      );

      if (data.success) {
        setAdvanceDetails(data.data);
        toast.success("Advance details loaded successfully");
      } else {
        toast.error(data.message || "Failed to load advance details");
      }

      return data;
    } catch (error) {
      console.error("viewTourAdvance error:", error);
      const msg =
        error.response?.data?.message || error.message || "Network error";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };
  const updateTourAdvance = async (tnr, updates) => {
    try {
      if (!tnr || typeof tnr !== "string" || tnr.trim().length !== 6) {
        toast.error("Valid 6-character TNR is required");
        return { success: false, message: "Valid 6-character TNR is required" };
      }

      if (!Array.isArray(updates) || updates.length === 0) {
        toast.error("Updates array is required and cannot be empty");
        return { success: false, message: "Updates array is required" };
      }

      const normalizedTnr = tnr.trim().toUpperCase();

      const { data } = await axios.post(
        `${backendUrl}/api/tour/update-tour-advance/${normalizedTnr}`,
        { updates },
        { headers: { ttoken } },
      );

      if (data.success) {
        const updatedData = data.data;

        setAdvanceDetails(updatedData);

        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.tnr === normalizedTnr
              ? {
                  ...booking,
                  payment: {
                    ...booking.payment,
                    advance: {
                      ...booking.payment.advance,
                      amount: updatedData.updatedAdvanceAmount,
                    },
                    balance: {
                      ...booking.payment.balance,
                      amount: updatedData.updatedBalanceAmount,
                      paid: false,
                      paymentVerified: false,
                    },
                  },
                  advanceAdminRemarks: updatedData.advanceAdminRemarks,
                  isTripCompleted: true,
                }
              : booking,
          ),
        );

        // Update allBookings if you maintain it
        setAllBookings?.((prev) =>
          prev.map((b) =>
            b.tnr === normalizedTnr
              ? {
                  ...b,
                  payment: {
                    ...b.payment,
                    advance: {
                      ...b.payment.advance,
                      amount: updatedData.updatedAdvanceAmount,
                    },
                    balance: {
                      ...b.payment.balance,
                      amount: updatedData.updatedBalanceAmount,
                      paid: false,
                      paymentVerified: false,
                    },
                  },
                  advanceAdminRemarks: updatedData.advanceAdminRemarks,
                  isTripCompleted: true,
                }
              : b,
          ),
        );

        // Update singleBooking if open
        if (singleBooking?.tnr === normalizedTnr) {
          setSingleBooking((prev) => ({
            ...prev,
            payment: {
              ...prev.payment,
              advance: {
                ...prev.payment.advance,
                amount: updatedData.updatedAdvanceAmount,
              },
              balance: {
                ...prev.payment.balance,
                amount: updatedData.updatedBalanceAmount,
                paid: false,
                paymentVerified: false,
              },
            },
            advanceAdminRemarks: updatedData.advanceAdminRemarks,
            isTripCompleted: true,
          }));
        }
      } else {
        toast.error(data.message || "Failed to update advance");
      }

      return data;
    } catch (error) {
      console.error("updateTourAdvance error:", error.response?.data || error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to update advance";

      return { success: false, message: msg };
    }
  };

  const updateTourBalance = async (tnr, updates) => {
    try {
      if (!tnr || typeof tnr !== "string" || tnr.trim().length !== 6) {
        return { success: false, message: "Valid 6-character TNR is required" };
      }

      if (!Array.isArray(updates) || updates.length === 0) {
        return {
          success: false,
          message: "Updates array is required and cannot be empty",
        };
      }

      const normalizedTnr = tnr.trim().toUpperCase();

      const { data } = await axios.post(
        `${backendUrl}/api/tour/update-tour-balance/${normalizedTnr}`,
        { updates },
        { headers: { ttoken } },
      );

      if (data.success) {
        setBalanceDetails(data.data);

        const updateFn = (prev) =>
          prev.map((booking) =>
            booking.tnr === normalizedTnr
              ? {
                  ...booking,
                  payment: {
                    ...booking.payment,
                    balance: {
                      ...booking.payment.balance,
                      amount: data.data.updatedBalance,
                    },
                  },
                  adminRemarks: data.data.adminRemarks,
                  isTripCompleted: data.data.isTripCompleted,
                }
              : booking,
          );

        setBookings(updateFn);
        setAllBookings(updateFn);

        if (singleBooking?.tnr === normalizedTnr) {
          setSingleBooking((prev) => ({
            ...prev,
            payment: {
              ...prev.payment,
              balance: {
                ...prev.payment.balance,
                amount: data.data.updatedBalance,
              },
            },
            adminRemarks: data.data.adminRemarks,
            isTripCompleted: data.data.isTripCompleted,
          }));
        }
      }

      return data;
    } catch (error) {
      console.error("updateTourBalance error:", error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  const viewTourBalance = async (tnr) => {
    try {
      if (!tnr || typeof tnr !== "string" || tnr.trim().length !== 6) {
        return { success: false, message: "Valid 6-character TNR is required" };
      }

      const normalizedTnr = tnr.trim().toUpperCase();

      const { data } = await axios.get(
        `${backendUrl}/api/tour/view-tour-balance/${normalizedTnr}`,
        { headers: { ttoken } },
      );

      if (data.success) {
        toast.success("Balance details loaded successfully");
        setBalanceDetails(data.data);
      }

      return data;
    } catch (error) {
      console.error("viewTourBalance error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  const markModifyReceipt = async (tnr, tourId) => {
    try {
      if (!tnr) {
        toast.error("TNR is missing – cannot mark modify receipt");
        return { success: false, message: "TNR is required" };
      }

      const { data } = await axios.put(
        `${backendUrl}/api/tour/mark-modify-receipt`,
        { tnr, tourId }, // ← changed from bookingId to tnr
        { headers: { ttoken } },
      );

      if (data.success) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.tnr === tnr
              ? {
                  ...booking,
                  isTripCompleted: false,
                }
              : booking,
          ),
        );

        // If you also maintain allBookings state
        setAllBookings?.((prev) =>
          prev.map((b) =>
            b.tnr === tnr ? { ...b, isTripCompleted: false } : b,
          ),
        );
      }

      return data;
    } catch (error) {
      console.error("markModifyReceipt error:", error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to mark modify receipt";

      toast.error(errMsg);
      return {
        success: false,
        message: errMsg,
      };
    }
  };
  const calculateCancelBooking = async ({
    tnr,
    cancellationDate,
    cancelledTravellerIndexes,
    extraRemarkAmount = 0,
    remark = "",
    irctcCancellationAmount = 0,
  }) => {
    try {
      if (!tnr || typeof tnr !== "string" || tnr.trim().length !== 6) {
        toast.error("Valid 6-character TNR is required");
        return { success: false, message: "Valid 6-character TNR is required" };
      }

      if (!cancellationDate) {
        return { success: false, message: "Cancellation date is required" };
      }

      if (
        !Array.isArray(cancelledTravellerIndexes) ||
        cancelledTravellerIndexes.length === 0
      ) {
        return {
          success: false,
          message: "cancelledTravellerIndexes (array) is required",
        };
      }

      const normalizedTnr = tnr.trim().toUpperCase();

      const payload = {
        tnr: normalizedTnr, // ← Added for backend
        cancellationDate,
        cancelledTravellerIndexes,
        extraRemarkAmount,
        remark,
        irctcCancellationAmount,
      };

      const { data } = await axios.post(
        `${backendUrl}/api/tour/bookings/${normalizedTnr}/cancel`,
        payload,
        { headers: { ttoken } },
      );

      if (data && data.message === "Cancellation processed") {
        await getBookings(/* current tourId if available */);
      }

      return data;
    } catch (error) {
      console.error("calculateCancelBooking error:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Network error during cancellation";

      toast.error(msg);
      return { success: false, message: msg };
    }
  };
  const fetchCancellationsByBooking = async (tnr, limit = 20) => {
    try {
      if (!tnr || typeof tnr !== "string" || tnr.trim().length !== 6) {
        toast.error("Valid 6-character TNR is required");
        return { success: false, message: "Valid 6-character TNR is required" };
      }

      const normalizedTnr = tnr.trim().toUpperCase();

      const { data } = await axios.get(
        `${backendUrl}/api/tour/cancelled-bookings/${normalizedTnr}?limit=${limit}`,
        { headers: { ttoken } },
      );

      return data;
    } catch (error) {
      console.error("fetchCancellationsByBooking error:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Network error while fetching cancellations";

      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const getManagedBookingsHistory = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/tour/managed-bookings/history`,
        { headers: { ttoken } },
      );

      if (data.success) {
        setManagedBookingsHistory(data.data || []);
        return { success: true, data: data.data, count: data.count };
      } else {
        setManagedBookingsHistory([]);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("getManagedBookingsHistory error:", error);
      setManagedBookingsHistory([]);
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || "Network error",
      };
    }
  }, [backendUrl, ttoken]);

  const getRoomAllocation = useCallback(
    async (tourId) => {
      if (!tourId) {
        setRoomAllocation(null);
        setRoomAllocationError("Tour ID is required");
        return { success: false, message: "Tour ID is required" };
      }

      setRoomAllocationLoading(true);
      setRoomAllocationError(null);

      try {
        const { data } = await axios.get(
          `${backendUrl}/api/tour/allot-rooms/${tourId}`,
          { headers: { ttoken } },
        );

        if (data.saved || data.roomAllocations) {
          setRoomAllocation(data);

          return { success: true, data };
        } else {
          setRoomAllocation(null);
          setRoomAllocationError(
            data.message || "Failed to load room allocation",
          );
          return { success: false, message: data.message };
        }
      } catch (error) {
        console.error("getRoomAllocation error:", error);
        const message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch room allocation";

        setRoomAllocationError(message);
        setRoomAllocation(null);

        return { success: false, message };
      } finally {
        setRoomAllocationLoading(false);
      }
    },
    [backendUrl, ttoken],
  );

  // ==================== Context Value ====================
  const value = {
    ttoken,
    setttoken,
    backendUrl,
    bookings,
    setBookings,
    getBookings,
    allBookings,
    getAllBookings,
    dashData,
    setDashData,
    getDashData,
    profileData,
    setProfileData,
    getProfileData,
    updateTravellerDetails,
    tourList,
    getTourList,
    updateTourAdvance,
    advanceDetails,
    setAdvanceDetails,
    viewTourAdvance,
    updateTourBalance,
    viewTourBalance,
    balanceDetails,
    setBalanceDetails,
    markModifyReceipt,
    singleBooking,
    setSingleBooking,
    viewBooking,
    calculateCancelBooking,
    fetchCancellationsByBooking,
    managedBookingsHistory,
    setManagedBookingsHistory,
    getManagedBookingsHistory,
    roomAllocation,
    setRoomAllocation,
    roomAllocationLoading,
    roomAllocationError,
    getRoomAllocation,

    // Existing mark functions (unchanged)
    markAdvancePaid,
    markBalancePaid,
    completeBooking,
    cancelBooking,
    markAdvanceReceiptSent,
    markBalanceReceiptSent,

    // NEW: Task Dashboard Actions
    taskCompleteBooking,
    taskMarkModifyReceipt,
    taskMarkAdvanceReceiptSent,
    taskMarkBalanceReceiptSent,
    taskMarkCancellationReceiptSent,
    taskMarkManageBookingReceiptSent,
  };

  return (
    <TourContext.Provider value={value}>{props.children}</TourContext.Provider>
  );
};

export default TourContextProvider;
