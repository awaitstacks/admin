import axios from "axios";

// ══════════════════════════════════════════════════════════════════════════════
// Staff mode — `npm run dev:staff` / `npm run build:staff` (.env.staff → VITE_APP_MODE=staff)
// staff.gvtourplanners.com / localhost:5175 la mattum true.
// ══════════════════════════════════════════════════════════════════════════════
export const IS_STAFF = import.meta.env.VITE_APP_MODE === "staff";

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

  // Token expire / HR login OFF pannaa → login page ku
  axios.interceptors.response.use(
    (res) => res,
    (error) => {
      const status = error.response?.status;
      const hadToken = !!localStorage.getItem(STAFF_TOKEN_KEY);
      if (status === 401 && hadToken) {
        localStorage.removeItem(STAFF_TOKEN_KEY);
        window.location.href = "/";
      }
      return Promise.reject(error);
    }
  );
}