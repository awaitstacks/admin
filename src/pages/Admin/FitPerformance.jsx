// ════════════════════════════════════════════════════════════════
//  FitPerformance.jsx — Admin panel: FIT Enquiries employee performance (thani page / thani tab)
//  Oru oru employee: Raised · Picked up · Rate shared · Accepted · Sales value · Closed · Cancelled …
//  Employee Performance page oda adhe screen, FIT mattum. API: /api/touradmin/fit-performance
// ════════════════════════════════════════════════════════════════
import React from "react";
import EmployeePerformance from "./EmployeePerformance"; // ⚙️ adhe folder la vainga

const FitPerformance = () => (
  <EmployeePerformance
    tabs={["fit"]}
    api="fit-performance"
    title="FIT Performance"
    subtitle="All FIT enquiries — pick one employee to see only theirs."
  />
);

export default FitPerformance;
