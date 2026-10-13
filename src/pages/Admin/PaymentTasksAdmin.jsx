// Admin side (different login) — "Payment Tasks" page. Same shared
// PaymentTasksView component as the Tour Admin side's PaymentTasks.jsx,
// wired to TourAdminContext instead — EXCEPT this side passes
// canMarkDone={false}, so Partial/Balance show no "Mark Done" button here
// (read-only, like TaskDashboard/TourAdminDashboard's own relationship) —
// they only clear once marked done on the Tour Admin side's own Payment
// Tasks page, since both read the same backend data.
//
// Adjust the two import paths below to match your project's actual
// folder structure if they differ (same relative depth as
// TourAdminDashboard.jsx uses for "../../context/TourAdminContext").
import React, { useContext, useCallback } from "react";
import { TourAdminContext } from "../../context/TourAdminContext";
import PaymentTasksView from "../../components/PaymentTasksView";

const PaymentTasksAdmin = () => {
  const { aToken, getPaymentTasks, markPaymentTaskDone, markAdvanceTaskDone } =
    useContext(TourAdminContext);

  const fetchTasks = useCallback(() => getPaymentTasks(), [getPaymentTasks]);
  const markTaskDone = useCallback(
    (docId) => markPaymentTaskDone(docId),
    [markPaymentTaskDone],
  );
  const markAdvanceDone = useCallback(
    (tnr) => markAdvanceTaskDone(tnr),
    [markAdvanceTaskDone],
  );

  return (
    <PaymentTasksView
      isAuthed={!!aToken}
      fetchTasks={fetchTasks}
      markTaskDone={markTaskDone}
      markAdvanceDone={markAdvanceDone}
      canMarkDone={false}
    />
  );
};

export default PaymentTasksAdmin;
