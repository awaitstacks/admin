import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";

import TourNavbar from "./components/TourNavbar.jsx";
import TourSidebar from "./components/TourSidebar.jsx";
import TourLogin from "./pages/TourLogin.jsx";

import { TourAdminContext } from "./context/TourAdminContext.jsx";
import { TourContext } from "./context/TourContext.jsx";

import TourAdminDashboard from "./pages/Admin/TourAdminDashboard.jsx";
import Analytics from "./pages/Admin/Analytics.jsx";
import AllBookings from "./pages/Admin/AllBookings.jsx";
import AddTour from "./pages/Admin/AddTour.jsx";
import ToursList from "./pages/Admin/ToursList.jsx";
import CancelRule from "./pages/Admin/CancelRule.jsx";
import CancellationCentre from "./pages/Admin/CancellationCentre.jsx";
import DBMigrationCenter from "./pages/Admin/DBMigrationCenter.jsx";
import BookingApprovals from "./pages/Admin/BookingApprovals.jsx";
import UsersData from "./pages/Admin/UsersData.jsx";
import GetBookings from "./pages/Admin/GetBookings.jsx";
import AdminNameList from "./pages/Admin/AdminNameList.jsx";
import AdminRoomList from "./pages/Admin/AdminRoomList.jsx";
import TermsPage from "./pages/Admin/TermsPage.jsx";
import TourDashboard from "./pages/Doctor/TourDashboard.jsx";
import TourBookings from "./pages/Doctor/TourBookings.jsx";
import TourProfile from "./pages/Doctor/TourProfile.jsx";
import TourNameList from "./pages/Doctor/TourNameList.jsx";
import BookingControls from "./pages/Doctor/BookingControls.jsx";
import CancellationControls from "./pages/Doctor/CancellationControls.jsx";
import ManageBooking from "./pages/Doctor/ManageBooking.jsx";
import TourRoomList from "./pages/Doctor/TourRoomList.jsx";
import AllTourBookings from "./pages/Doctor/AllTourBookings.jsx";
import TaskDashboard from "./pages/Doctor/TaskDashboard.jsx";
import AddTourDetail from "./pages/Doctor/AddTourDetail.jsx";
import TernsAgreement from "./pages/Doctor/TernsAgreement.jsx";
import TourVehicles from "./pages/Doctor/TourVehicles.jsx";
import AdminTourVehicles from "./pages/Admin/AdminTourVehicles.jsx";
import PaymentDetails from "./pages/Doctor/PaymentDetails.jsx";
import PaymentDetailsAdmin from "./pages/Admin/PaymentDetailsAdmin.jsx";
import VehicleSeatAllocation from "./pages/Doctor/VehicleSeatAllocation.jsx";
import AdminVehicleSeatAllocation from "./pages/Doctor/AdminVehicleSeatAllocation.jsx";
import BalanceUpdate from "./pages/Doctor/BalanceUpdate.jsx";
import TripEnquiries from "./pages/Doctor/TripEnquiries.jsx";
import Invoice from "./pages/Doctor/Invoice.jsx";
import AdminProfile from "./pages/Doctor/AdminProfile.jsx";
import TicketLanding from "./pages/Doctor/TicketLanding.jsx";
import RaiseTicket from "./pages/Admin/RaiseTicket.jsx";
import AadhaarUpload from "./pages/Doctor/AadhaarUpload.jsx";
import CreateBooking from "./pages/Doctor/CreateBooking.jsx";
import AdminCreatedBooking from "./pages/Doctor/AdminCreatedBooking.jsx";
import PaymentTasks from "./pages/Doctor/PaymentTasks.jsx";
import PaymentTasksAdmin from "./pages/Admin/PaymentTasksAdmin.jsx";
import PaymentRecords from "./pages/Doctor/PaymentRecords.jsx";
import StaffRoles from "./pages/Doctor/StaffRoles.jsx";
import FitEnquiry from "./pages/Admin/FitEnquiry.jsx";
import StaffProfile from "./pages/Admin/StaffProfile.jsx";
import EmployeePerformance from "./pages/Admin/EmployeePerformance.jsx";
import FitPerformance from "./pages/Admin/FitPerformance.jsx";
import WebsiteTraffic from "./pages/Admin/WebsiteTraffic.jsx";
import CancellationAnalytics from "./pages/Admin/CancellationAnalytics.jsx";

export const appRoutes = [
  { path: "/admin-dashboard", element: <TourAdminDashboard /> },
  { path: "/tour-analytics", element: <Analytics /> },
  { path: "/cancellation-analytics", element: <CancellationAnalytics /> },
  { path: "/website-traffic", element: <WebsiteTraffic /> },
  { path: "/admin-staff-view", element: <StaffProfile /> },
  { path: "/employee-performance", element: <EmployeePerformance /> },
  { path: "/fit-performance", element: <FitPerformance /> },
  { path: "/admin-enquiries-view", element: <FitEnquiry /> },
  { path: "/admin-payment-tasks", element: <PaymentTasksAdmin /> },
  { path: "/all-bookings", element: <AllBookings /> },
  { path: "/ticket-launching", element: <RaiseTicket /> },
  { path: "/get-bookings", element: <GetBookings /> },
  { path: "/add-tour", element: <AddTour /> },
  { path: "/tour-list", element: <ToursList /> },
  { path: "/cancel-rule", element: <CancelRule /> },
  { path: "/cancel-centre", element: <CancellationCentre /> },
  { path: "/db-migration", element: <DBMigrationCenter /> },
  { path: "/booking-approvals", element: <BookingApprovals /> },
  { path: "/admin-roomlist", element: <AdminRoomList /> },
  { path: "/admin-namelist", element: <AdminNameList /> },
  { path: "/all-users", element: <UsersData /> },
  { path: "/terms", element: <TermsPage /> },
  { path: "/admin-vehicles", element: <AdminTourVehicles /> },
  { path: "/admin-payment-details", element: <PaymentDetailsAdmin /> },
  { path: "/admin-seat-allocation-details", element: <AdminVehicleSeatAllocation /> },
  { path: "/task-dashboard", element: <TaskDashboard /> },
  { path: "/tour-dashboard", element: <TourDashboard /> },
  { path: "/payment-tasks", element: <PaymentTasks /> },
  { path: "/staff-profile", element: <AdminProfile /> },
  { path: "/staff-roles", element: <StaffRoles /> },
  { path: "/tour-profile", element: <TourProfile /> },
  { path: "/ticket-landing", element: <TicketLanding /> },
  { path: "/aadhaar-upload", element: <AadhaarUpload /> },
  { path: "/creat-bookings", element: <CreateBooking /> },
  { path: "/tour-bookings", element: <TourBookings /> },
  { path: "/payment-records", element: <PaymentRecords /> },
  { path: "/admin-bookings", element: <AdminCreatedBooking /> },
  { path: "/tour-enquiries", element: <TripEnquiries /> },
  { path: "/invoice/:tnr", element: <Invoice /> },
  { path: "/tour-namelist", element: <TourNameList /> },
  { path: "/tour-roomlist", element: <TourRoomList /> },
  { path: "/tour-updateBalance", element: <BookingControls /> },
  { path: "/tour-cancelTraveller", element: <CancellationControls /> },
  { path: "/tour-allbookings", element: <AllTourBookings /> },
  { path: "/tour-managebooking", element: <ManageBooking /> },
  { path: "/tour-termspage", element: <TernsAgreement /> },
  { path: "/tour-balancepage", element: <BalanceUpdate /> },
  { path: "/payment-details", element: <PaymentDetails /> },
  { path: "/add-tourDetail", element: <AddTourDetail /> },
  { path: "/vehicles", element: <TourVehicles /> },
  { path: "/seat-allocation-data", element: <VehicleSeatAllocation /> },
];

// Staff site: role tab illaama kooda allow aagura routes (bookings la irundhu invoice open panna)
export const STAFF_ALWAYS_ALLOWED = ["/invoice/:tnr"];

// ══════════════════════════════════════════════════════════════════════════════
// Puthu page add panna: mela import + appRoutes la { path, element } + TourSidebar la menu item.
// Avlo dhaan — Staff Roles checkbox, staff sidebar, staff routes ellam thaana varum.
// ══════════════════════════════════════════════════════════════════════════════

const TourApp = () => {
  const { aToken } = useContext(TourAdminContext);
  const { ttoken } = useContext(TourContext);

  return aToken || ttoken ? (
    <div className="bg-[#F8F9FD] overflow-x-hidden">
      <TourNavbar />
      <div className="flex min-h-screen pt-16">
        <TourSidebar />
        <main className="flex-1 min-w-0 min-h-screen bg-[#F8F9FD]">
          <Routes>
            <Route path="/" element={<></>} />
            {appRoutes.map((r) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
          </Routes>
        </main>
      </div>
    </div>
  ) : (
    <TourLogin />
  );
};

export default TourApp;
