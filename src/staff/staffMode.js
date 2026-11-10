// import axios from "axios";

// // ══════════════════════════════════════════════════════════════════════════════
// // Staff mode — `npm run dev:staff` / `npm run build:staff` (.env.staff → VITE_APP_MODE=staff)
// // staff.gvtourplanners.com / localhost:5175 la mattum true.
// // ══════════════════════════════════════════════════════════════════════════════
// export const IS_STAFF = import.meta.env.VITE_APP_MODE === "staff";

// // Browser tab title — staff site la "Staff Panel" (Admin / Tour Admin la "Admin panel" apdiye)
// if (IS_STAFF && typeof document !== "undefined") document.title = "Staff Panel";

// export const STAFF_TOKEN_KEY = "stoken";

// // Staff mode la TourContext / TourAdminContext ttoken, aToken ku indha value.
// // Pages "if (ttoken) fetch()" maari check pannuradhu work aaga — aana backend ku
// // idhu pogaadhu, interceptor eduthutu stoken podum.
// export const STAFF_SENTINEL = "staff-session";

// const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

// const removeHeader = (headers, key) => {
//   if (!headers) return;
//   if (typeof headers.delete === "function") headers.delete(key);
//   else delete headers[key];
// };

// // ──────────────────────────────────────────────────────────────────────────────
// // Staff mode la ellaa backend API call kum:
// //   ttoken / aToken header remove → stoken add
// // Ella context function laiyum maatha vendaam.
// // ──────────────────────────────────────────────────────────────────────────────
// let installed = false;
// export function installStaffAxios() {
//   if (!IS_STAFF || installed) return;
//   installed = true;

//   axios.interceptors.request.use((config) => {
//     const url = config.url || "";
//     const toBackend = url.startsWith(backendUrl) || url.startsWith("/api/");
//     if (!toBackend) return config;

//     ["ttoken", "aToken", "atoken"].forEach((k) => removeHeader(config.headers, k));

//     const stoken = localStorage.getItem(STAFF_TOKEN_KEY);
//     if (stoken) {
//       if (typeof config.headers?.set === "function") config.headers.set("stoken", stoken);
//       else config.headers = { ...(config.headers || {}), stoken };
//     }
//     return config;
//   });

//   // Staff token unmaiyaave expire / HR login OFF pannaa mattum → login page ku.
//   // (Indha message ellaam backend authStaff.js staffGate la irundhu mattum varum.)
//   const STAFF_LOGOUT_MSG = /login is disabled or expired|invalid or expired token/i;

//   axios.interceptors.response.use(
//     (res) => res,
//     (error) => {
//       const status = error.response?.status;
//       const msg = error.response?.data?.message || "";
//       const url = error.config?.url || "";
//       const hadToken = !!localStorage.getItem(STAFF_TOKEN_KEY);

//       if (status === 401 && hadToken) {
//         if (STAFF_LOGOUT_MSG.test(msg)) {
//           localStorage.removeItem(STAFF_TOKEN_KEY);
//           window.location.href = "/";
//         } else {
//           // Vera 401 (staff ku open aagaadha route) → logout pannaadhu, endha API nu console la kaattum
//           console.warn("[staff] 401 — logout pannala. API:", url, "| message:", msg);
//         }
//       }
//       return Promise.reject(error);
//     }
//   );
// }

import axios from "axios";

// ══════════════════════════════════════════════════════════════════════════════
// Staff mode — `npm run dev:staff` / `npm run build:staff` (.env.staff → VITE_APP_MODE=staff)
// staff.gvtourplanners.com / localhost:5175 la mattum true.
// ══════════════════════════════════════════════════════════════════════════════
export const IS_STAFF = import.meta.env.VITE_APP_MODE === "staff";

// Browser tab title — staff site la "Staff Panel" (Admin / Tour Admin la "Admin panel" apdiye)
if (IS_STAFF && typeof document !== "undefined") document.title = "Staff Panel";

export const STAFF_TOKEN_KEY = "stoken";

// Staff mode la TourContext / TourAdminContext ttoken, aToken ku indha value.
// Pages "if (ttoken) fetch()" maari check pannuradhu work aaga — aana backend ku
// idhu pogaadhu, interceptor eduthutu stoken podum.
export const STAFF_SENTINEL = "staff-session";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const removeHeader = (headers, key) => {
  if (!headers) return;
  if (typeof headers.delete === "function") headers.delete(key);
  else delete headers[key];
};

// ──────────────────────────────────────────────────────────────────────────────
// Staff mode la ellaa backend API call kum:
//   ttoken / aToken header remove → stoken add
// Ella context function laiyum maatha vendaam.
// ──────────────────────────────────────────────────────────────────────────────
let installed = false;
export function installStaffAxios() {
  if (!IS_STAFF || installed) return;
  installed = true;

  axios.interceptors.request.use((config) => {
    const url = config.url || "";
    const toBackend = url.startsWith(backendUrl) || url.startsWith("/api/");
    if (!toBackend) return config;

    ["ttoken", "aToken", "atoken"].forEach((k) => removeHeader(config.headers, k));

    const stoken = localStorage.getItem(STAFF_TOKEN_KEY);
    if (stoken) {
      if (typeof config.headers?.set === "function") config.headers.set("stoken", stoken);
      else config.headers = { ...(config.headers || {}), stoken };
    }
    return config;
  });

  // ── fetch() kum adhe maadhiri — sila pages axios illaama fetch() la ttoken / aToken
  // nerla anuppudhu. Staff portal la adha eduthutu stoken podum, so puthu page la
  // fetch() use pannaalum staff ku automatic ah work aagum.
  if (typeof window !== "undefined" && window.fetch && !window.__staffFetchPatched) {
    window.__staffFetchPatched = true;
    const origFetch = window.fetch.bind(window);
    window.fetch = (input, init = {}) => {
      try {
        const url = typeof input === "string" ? input : input?.url || "";
        if (url.startsWith(backendUrl) || url.startsWith("/api/")) {
          const headers = new Headers(init.headers || (typeof input !== "string" ? input.headers : undefined) || {});
          ["ttoken", "aToken", "atoken"].forEach((k) => headers.delete(k));
          const st = localStorage.getItem(STAFF_TOKEN_KEY);
          if (st) headers.set("stoken", st);
          init = { ...init, headers };
        }
      } catch (err) {
        console.warn("[staff] fetch header patch failed:", err);
      }
      return origFetch(input, init);
    };
  }

  // Staff token unmaiyaave expire / HR login OFF pannaa mattum → login page ku.
  // (Indha message ellaam backend authStaff.js staffGate la irundhu mattum varum.)
  const STAFF_LOGOUT_MSG = /login is disabled or expired|invalid or expired token/i;

  axios.interceptors.response.use(
    (res) => res,
    (error) => {
      const status = error.response?.status;
      const msg = error.response?.data?.message || "";
      const url = error.config?.url || "";
      const hadToken = !!localStorage.getItem(STAFF_TOKEN_KEY);

      if (status === 401 && hadToken) {
        if (STAFF_LOGOUT_MSG.test(msg)) {
          localStorage.removeItem(STAFF_TOKEN_KEY);
          window.location.href = "/";
        } else {
          // Vera 401 (staff ku open aagaadha route) → logout pannaadhu, endha API nu console la kaattum
          console.warn("[staff] 401 — logout pannala. API:", url, "| message:", msg);
        }
      }
      return Promise.reject(error);
    }
  );
}