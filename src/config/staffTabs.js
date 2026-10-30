// Sidebar la irundhe tabs edukkudhu — sidebar la puthu tab add panna,
// Staff Roles page la thaana varum. Inga edhuvum maatha vendaam.
import { tourMenuItems, adminMenuItems } from "../components/TourSidebar";

// Staff ku kudukka koodaadha tabs (HR / IT mattum)
const HIDDEN_TABS = ["/staff-profile", "/staff-roles", "/db-migration"];

const toTabs = (items) =>
  items
    .filter((item) => !HIDDEN_TABS.includes(item.to))
    .map((item) => ({ key: item.to, label: item.label }));

export const STAFF_TAB_GROUPS = [
  { key: "tour", label: "Tour Admin", icon: "🧭", tabs: toTabs(tourMenuItems) },
  { key: "admin", label: "Admin", icon: "🛡️", tabs: toTabs(adminMenuItems) },
];

export const STAFF_TABS = STAFF_TAB_GROUPS.flatMap((g) =>
  g.tabs.map((t) => ({ ...t, group: g.key, groupLabel: g.label }))
);

export const STAFF_TAB_LABEL = Object.fromEntries(STAFF_TABS.map((t) => [t.key, t.label]));
export const STAFF_TAB_GROUP = Object.fromEntries(STAFF_TABS.map((t) => [t.key, t.group]));