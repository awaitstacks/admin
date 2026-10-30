import { useContext, useState } from "react";
import { toast } from "react-toastify";
import NewLogo from "../assets/newlogo.png";
import { StaffContext } from "./StaffContext";

// Staff login — Admin login maari same GV design. Username + password + forgot password.
export default function StaffLogin() {
  const { login, forgotPassword } = useContext(StaffContext);

  const [view, setView] = useState("login"); // "login" | "forgot" | "sent"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cleanUsername = username.trim().toLowerCase();

  async function onLogin(e) {
    e.preventDefault();
    if (!cleanUsername || !password) {
      setError("Enter your username and password.");
      return;
    }
    setSubmitting(true);
    setError("");
    const result = await login(cleanUsername, password);
    setSubmitting(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    toast.success("Welcome!");
  }

  async function onForgot(e) {
    e.preventDefault();
    if (!cleanUsername) {
      setError("Enter your username.");
      return;
    }
    setSubmitting(true);
    setError("");
    const result = await forgotPassword(cleanUsername);
    setSubmitting(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setView("sent");
  }

  function switchView(next) {
    setView(next);
    setError("");
    setPassword("");
  }

  const inputClass = (bad) =>
    `w-full px-4 py-3.5 rounded-xl border text-base transition-all outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${bad ? "border-red-500 ring-2 ring-red-200" : "border-gray-300"
    }`;

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
        <svg className="absolute bottom-0 left-0 right-0 h-80 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path
            fill="rgba(16, 185, 129, 0.1)"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L0,320Z"
          />
        </svg>
      </div>

      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 p-8 sm:p-10">
          <div className="text-center mb-8">
            <img
              src={NewLogo}
              alt="GV - Tour Planners"
              className="mx-auto w-48 sm:w-56 md:w-64 h-auto object-contain drop-shadow-2xl -mb-6 sm:-mb-8"
            />
            <h1 className="mt-10 sm:mt-12 text-2xl sm:text-3xl font-bold text-gray-800">
              <span className="text-indigo-600">Staff</span> {view === "login" ? "Login" : "Password Help"}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 font-medium">
              {view === "login" && "Welcome back! Please log in to continue."}
              {view === "forgot" && "Enter your username. HR will reset your password."}
              {view === "sent" && "Request sent."}
            </p>
          </div>

          {view === "login" && (
            <form onSubmit={onLogin} className="space-y-5" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  placeholder="e.g. priya.s"
                  className={inputClass(!!error)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={inputClass(!!error)}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 text-sm text-center font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold text-lg rounded-xl shadow-lg transition-all"
              >
                {submitting ? "Logging in..." : "Login"}
              </button>

              <p className="text-center text-sm text-gray-600">
                Forgot password?{" "}
                <button type="button" onClick={() => switchView("forgot")} className="text-indigo-600 font-bold underline hover:text-indigo-700">
                  Click here
                </button>
              </p>
            </form>
          )}

          {view === "forgot" && (
            <form onSubmit={onForgot} className="space-y-5" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoCapitalize="none"
                  placeholder="e.g. priya.s"
                  className={inputClass(!!error)}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 text-sm text-center font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold text-lg rounded-xl shadow-lg transition-all"
              >
                {submitting ? "Sending..." : "Send reset request"}
              </button>

              <p className="text-center text-sm text-gray-600">
                Remembered it?{" "}
                <button type="button" onClick={() => switchView("login")} className="text-indigo-600 font-bold underline hover:text-indigo-700">
                  Back to login
                </button>
              </p>
            </form>
          )}

          {view === "sent" && (
            <div className="space-y-5 text-center">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-[15px] font-semibold text-emerald-800">Your request has been sent to HR.</p>
                <p className="mt-1 text-sm text-emerald-700">They will share a new password with you by email.</p>
              </div>
              <button
                type="button"
                onClick={() => switchView("login")}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-lg"
              >
                Back to login
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
