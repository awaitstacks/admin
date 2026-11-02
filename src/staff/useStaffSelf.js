import { useContext } from "react";
import { StaffContext } from "./StaffContext";
import { IS_STAFF } from "./staffMode";

// Staff site la login aana staff ({ _id, fullName, employeeId, ... }).
// Admin / Tour Admin site la eppavume null — adhanaala anga edhuvum maaraadhu.
export default function useStaffSelf() {
  const ctx = useContext(StaffContext);
  return IS_STAFF ? ctx?.staff || null : null;
}