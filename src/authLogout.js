import axios from "axios";

// ══════════════════════════════════════════════════════════════════════════════
// Admin / Tour Admin — backend "login again" sonnaa (password maathinaa / token expire)
// andha token ah localStorage la irundhu eduthu login page ku anuppum.
// Staff site la idhu install aagaadhu (staffMode.js thaniyaa handle pannum).
// Request la endha token pochoo (atoken / ttoken) adha mattum thaan eduppom.
// ══════════════════════════════════════════════════════════════════════════════
const LOGOUT_MSG = /not authori[sz]ed|invalid or expired token|session has ended|jwt (expired|malformed)|invalid signature/i;

const headerOf = (headers, key) => {
  if (!headers) return "";
  if (typeof headers.get === "function") return headers.get(key) || "";
  return headers[key] || "";
};

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

// Page open / refresh / tab-ku thirumba vandha / page maarinaa → token innum valid ah nu check.
// (Sila routes ku auth illa — adhanaala adha mattum nambi irukka koodaadhu.)
let checking = false;
const checkSession = async () => {
  if (checking) return;
  checking = true;
  try {
    const aToken = localStorage.getItem("aToken");
    const ttoken = localStorage.getItem("ttoken");
    const calls = [];
    if (aToken) calls.push(axios.get(`${BACKEND}/api/touradmin/check-session`, { headers: { aToken, atoken: aToken } }).catch(() => {}));
    if (ttoken) calls.push(axios.get(`${BACKEND}/api/tour/check-session`, { headers: { ttoken } }).catch(() => {}));
    await Promise.all(calls);
  } finally {
    checking = false;
  }
};

let installed = false;
export function installAuthLogout() {
  if (installed) return;
  installed = true;

  const handle = (config, status, data) => {
    const msg = String(data?.message || "");
    if (!(status === 401 || (data && data.success === false)) || !LOGOUT_MSG.test(msg)) return;
    const sentAdmin = headerOf(config?.headers, "atoken") || headerOf(config?.headers, "aToken");
    const sentTour = headerOf(config?.headers, "ttoken");
    let cleared = false;
    if (sentAdmin && localStorage.getItem("aToken")) {
      localStorage.removeItem("aToken");
      cleared = true;
    }
    if (sentTour && localStorage.getItem("ttoken")) {
      localStorage.removeItem("ttoken");
      cleared = true;
    }
    if (cleared && !window.__authLogoutRedirect) {
      window.__authLogoutRedirect = true;
      window.location.replace("/"); // login page
    }
  };

  axios.interceptors.response.use(
    (res) => {
      handle(res.config, res.status, res.data);
      return res;
    },
    (error) => {
      handle(error.config, error.response?.status, error.response?.data);
      return Promise.reject(error);
    },
  );

  // Session check: open aanadhum, tab focus aanaa, page maarinaa (back/forward + link click)
  checkSession();
  window.addEventListener("focus", checkSession);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkSession();
  });
  window.addEventListener("popstate", checkSession);
  for (const fn of ["pushState", "replaceState"]) {
    const orig = history[fn];
    history[fn] = function (...args) {
      const r = orig.apply(this, args);
      setTimeout(checkSession, 0);
      return r;
    };
  }
}