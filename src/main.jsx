// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import "./index.css";

// import { GoogleOAuthProvider } from "@react-oauth/google";
// import { BrowserRouter } from "react-router-dom";

// import TourApp from "./TourApp.jsx";

// import TourAppContextProvider from "./context/TourAppContext.jsx";
// import TourContextProvider from "./context/TourContext.jsx";
// import TourAdminContextProvider from "./context/TourAdminContext.jsx";

// createRoot(document.getElementById("root")).render(
//   <BrowserRouter>
//     <TourAdminContextProvider>
//       <TourContextProvider>
//         <TourAppContextProvider>
//           <TourApp />
//         </TourAppContextProvider>
//       </TourContextProvider>
//     </TourAdminContextProvider>
//   </BrowserRouter>
// );

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";

import TourApp from "./TourApp.jsx";

import TourAppContextProvider from "./context/TourAppContext.jsx";
import TourContextProvider from "./context/TourContext.jsx";
import TourAdminContextProvider from "./context/TourAdminContext.jsx";

// Staff site (staff.gvtourplanners.com) — npm run dev:staff / build:staff
import { IS_STAFF, installStaffAxios } from "./staff/staffMode.js";
import StaffContextProvider from "./staff/StaffContext.jsx";
import StaffApp from "./staff/StaffApp.jsx";

installStaffAxios(); // staff mode la mattum — API calls ku stoken podum

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <TourAdminContextProvider>
      <TourContextProvider>
        <TourAppContextProvider>
          {IS_STAFF ? (
            <StaffContextProvider>
              <StaffApp />
            </StaffContextProvider>
          ) : (
            <TourApp />
          )}
        </TourAppContextProvider>
      </TourContextProvider>
    </TourAdminContextProvider>
  </BrowserRouter>
);

