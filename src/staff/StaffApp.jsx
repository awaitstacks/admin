import { useContext, useMemo, useState } from "react";
import { Navigate, NavLink, Route, Routes, useMatch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Menu, X, UserCircle } from "lucide-react";

import NewLogo from "../assets/newlogo.png";
import { tourMenuItems, adminMenuItems } from "../components/TourSidebar";
import { appRoutes, STAFF_ALWAYS_ALLOWED } from "../TourApp";
import { StaffContext } from "./StaffContext";
import StaffLogin from "./StaffLogin";
import MyProfile from "./MyProfile";

// ══════════════════════════════════════════════════════════════════════════════
// STAFF SITE (staff.gvtourplanners.com) — role la irukura tabs mattum.
// Pages Admin / Tour Admin la irukura adhe component dhaan (appRoutes).
// ══════════════════════════════════════════════════════════════════════════════

const SidebarItem = ({ to, icon: Icon, label, onClick }) => {
  const match = useMatch({ path: to, end: true });
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={`flex w-full items-center gap-5 rounded-2xl px-1 py-2 text-base font-semibold tracking-wide transition-colors ${match ? "bg-green-600 text-white shadow-lg" : "text-gray-700 hover:bg-green-100 hover:text-green-800"
        }`}
    >
      <Icon size={26} className={match ? "text-white" : "text-gray-600"} />
      <span className="overflow-hidden text-ellipsis whitespace-nowrap">{label}</span>
    </NavLink>
  );
};

function SidebarNav({ groups, onItemClick }) {
  return (
    <nav className="space-y-5">
      <div className="space-y-3">
        <SidebarItem to="/my-profile" icon={UserCircle} label="My Profile" onClick={onItemClick} />
      </div>
      {groups.map((g) => (
        <div key={g.key} className="space-y-3">
          {groups.length > 1 && (
            <p className="px-1 text-[11.5px] font-bold uppercase tracking-wider text-gray-400">{g.label}</p>
          )}
          {g.items.map((item) => (
            <SidebarItem key={item.to} {...item} onClick={onItemClick} />
          ))}
        </div>
      ))}
    </nav>
  );
}

function StaffLayout() {
  const { staff, tabs, logout, loadingMe } = useContext(StaffContext);
  const [open, setOpen] = useState(false);

  // Role tabs mattum — sidebar order la
  const groups = useMemo(() => {
    const pick = (items) => items.filter((i) => tabs.includes(i.to));
    return [
      { key: "tour", label: "Tour Admin", items: pick(tourMenuItems) },
      { key: "admin", label: "Admin", items: pick(adminMenuItems) },
    ].filter((g) => g.items.length);
  }, [tabs]);

  const allowedPaths = useMemo(() => new Set([...tabs, ...STAFF_ALWAYS_ALLOWED]), [tabs]);
  const staffRoutes = useMemo(() => appRoutes.filter((r) => allowedPaths.has(r.path)), [allowedPaths]);
  const firstPath = groups[0]?.items[0]?.to || "/my-profile";

  if (!staff && loadingMe) {
    return <div className="grid min-h-screen place-items-center text-[14px] text-gray-500">Loading…</div>;
  }

  return (
    <div className="bg-[#F8F9FD] overflow-x-hidden">
      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <img src={NewLogo} alt="GV - Tour Planners" className="h-10 w-auto object-contain" />
          <span className="rounded-full border border-indigo-600 px-2.5 py-0.5 text-[12.5px] font-semibold text-indigo-700">
            {staff?.role?.name || "Staff"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-[14px] font-semibold text-gray-700 sm:inline">{staff?.fullName}</span>
          <button
            type="button"
            onClick={logout}
            className="rounded-full bg-green-600 px-5 py-2 text-[14px] font-semibold text-white hover:bg-green-700"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex min-h-screen pt-16">
        {/* Mobile */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="fixed left-4 top-20 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white shadow-2xl lg:hidden"
          aria-label="Menu"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
        <aside
          className={`fixed bottom-0 left-0 top-16 z-40 w-72 transform overflow-y-auto border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 lg:hidden ${open ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="px-6 pb-20 pt-20">
            <SidebarNav groups={groups} onItemClick={() => setOpen(false)} />
          </div>
        </aside>
        {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

        {/* Desktop */}
        <div className="hidden w-72 flex-shrink-0 lg:block" aria-hidden="true" />
        <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-72 overflow-y-auto border-r border-gray-200 bg-white lg:block">
          <div className="px-6 pb-20 pt-10">
            <SidebarNav groups={groups} />
          </div>
        </aside>

        <main className="min-h-screen min-w-0 flex-1 bg-[#F8F9FD]">
          <Routes>
            <Route path="/" element={<Navigate to={firstPath} replace />} />
            <Route path="/my-profile" element={<MyProfile />} />
            {staffRoutes.map((r) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
            {/* Role la illaadha tab URL type pannaa → first tab ku */}
            <Route path="*" element={<Navigate to={firstPath} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function StaffApp() {
  const { stoken } = useContext(StaffContext);
  return (
    <>
      <ToastContainer position="top-right" autoClose={2500} />
      {stoken ? <StaffLayout /> : <StaffLogin />}
    </>
  );
}
