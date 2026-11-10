// // Sidebar la irundhe tabs edukkudhu — sidebar la puthu tab add panna,
// // Staff Roles page la thaana varum. Inga edhuvum maatha vendaam.
// import { tourMenuItems, adminMenuItems } from "../components/TourSidebar";

// // Staff ku kudukka koodaadha tabs (HR / IT mattum)
// const HIDDEN_TABS = ["/staff-profile", "/staff-roles", "/db-migration"];

// const toTabs = (items) =>
//   items
//     .filter((item) => !HIDDEN_TABS.includes(item.to))
//     .map((item) => ({ key: item.to, label: item.label }));

// export const STAFF_TAB_GROUPS = [
//   { key: "tour", label: "Tour Admin", icon: "🧭", tabs: toTabs(tourMenuItems) },
//   { key: "admin", label: "Admin", icon: "🛡️", tabs: toTabs(adminMenuItems) },
// ];

// export const STAFF_TABS = STAFF_TAB_GROUPS.flatMap((g) =>
//   g.tabs.map((t) => ({ ...t, group: g.key, groupLabel: g.label }))
// );

// export const STAFF_TAB_LABEL = Object.fromEntries(STAFF_TABS.map((t) => [t.key, t.label]));
// export const STAFF_TAB_GROUP = Object.fromEntries(STAFF_TABS.map((t) => [t.key, t.group]));

// ══════════════════════════════════════════════════════════════════════════════
// Staff Roles la HR select panna mudiyura tabs — 2 group:
//   🧭 Tour Admin  → Tour Admin sidebar (tourMenuItems)
//   🛡️ Admin       → Admin sidebar (adminMenuItems)
// key = route path. Backend role.tabs la indha key dhaan save aagum,
// staff sidebar um idha vachu filter aagum.
//
// Sidebar (TourSidebar.jsx) la irundhu THAANA edukkudhu — sidebar la puthu tab
// add pannaa inga um automatic ah varum, thaniya add panna venaam.
// Staff-Profile, Staff Roles um ippo irukku (HR team ku kudukkalaam).
// DB Migration centre mattum illa — adhu IT ku mattum, staff ku kudukka koodaadhu.
// ══════════════════════════════════════════════════════════════════════════════
import { tourMenuItems, adminMenuItems } from "../components/TourSidebar";

const NEVER_FOR_STAFF = new Set(["/db-migration"]);

const toTabs = (items) =>
  items
    .filter((i) => i?.to && !NEVER_FOR_STAFF.has(i.to))
    .map((i) => ({ key: i.to, label: i.label }));

export const STAFF_TAB_GROUPS = [
  { key: "tour", label: "Tour Admin", icon: "🧭", tabs: toTabs(tourMenuItems) },
  { key: "admin", label: "Admin", icon: "🛡️", tabs: toTabs(adminMenuItems) },
];

// Flat list (sidebar order) — save panna, filter panna
export const STAFF_TABS = STAFF_TAB_GROUPS.flatMap((g) =>
  g.tabs.map((t) => ({ ...t, group: g.key, groupLabel: g.label }))
);

export const STAFF_TAB_LABEL = Object.fromEntries(STAFF_TABS.map((t) => [t.key, t.label]));
export const STAFF_TAB_GROUP = Object.fromEntries(STAFF_TABS.map((t) => [t.key, t.group]));