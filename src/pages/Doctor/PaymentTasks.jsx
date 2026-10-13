// Tour Admin side — "Payment Tasks" page. A brand-new, separate page from
// the existing Task Dashboard (TaskDashboard.jsx) — that file is never
// touched or read from here.
//
// All the rendering/behaviour lives in the shared PaymentTasksView
// component so this side and the Admin side show the EXACT same UI —
// this file only wires up TourContext's getPaymentTasks/markPaymentTaskDone.
//
// Adjust the two import paths below to match your project's actual
// folder structure if they differ (same relative depth as TaskDashboard.jsx
// uses for "../../context/TourContext").
import React, { useContext, useCallback } from "react";
import { TourContext } from "../../context/TourContext";
import PaymentTasksView from "../../components/PaymentTasksView";

const PaymentTasks = () => {
  const { ttoken, getPaymentTasks, markPaymentTaskDone } = useContext(TourContext);

  const fetchTasks = useCallback(() => getPaymentTasks(), [getPaymentTasks]);
  const markTaskDone = useCallback(
    (docId) => markPaymentTaskDone(docId),
    [markPaymentTaskDone],
  );

  return (
    <PaymentTasksView
      isAuthed={!!ttoken}
      fetchTasks={fetchTasks}
      markTaskDone={markTaskDone}
    />
  );
};

export default PaymentTasks;
