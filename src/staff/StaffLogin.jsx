// import { useContext, useState } from "react";
// import { toast } from "react-toastify";
// import NewLogo from "../assets/newlogo.png";
// import { StaffContext } from "./StaffContext";

// // Staff login — Admin login maari same GV design. Username + password + forgot password.
// export default function StaffLogin() {
//   const { login, forgotPassword } = useContext(StaffContext);

//   const [view, setView] = useState("login"); // "login" | "forgot" | "sent"
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const cleanUsername = username.trim().toLowerCase();

//   async function onLogin(e) {
//     e.preventDefault();
//     if (!cleanUsername || !password) {
//       setError("Enter your username and password.");
//       return;
//     }
//     setSubmitting(true);
//     setError("");
//     const result = await login(cleanUsername, password);
//     setSubmitting(false);
//     if (!result.success) {
//       setError(result.message);
//       return;
//     }
//     toast.success("Welcome!");
//   }

//   async function onForgot(e) {
//     e.preventDefault();
//     if (!cleanUsername) {
//       setError("Enter your username.");
//       return;
//     }
//     setSubmitting(true);
//     setError("");
//     const result = await forgotPassword(cleanUsername);
//     setSubmitting(false);
//     if (!result.success) {
//       setError(result.message);
//       return;
//     }
//     setView("sent");
//   }

//   function switchView(next) {
//     setView(next);
//     setError("");
//     setPassword("");
//   }

//   const inputClass = (bad) =>
//     `w-full px-4 py-3.5 rounded-xl border text-base transition-all outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${bad ? "border-red-500 ring-2 ring-red-200" : "border-gray-300"
//     }`;

//   return (
//     <>
//       <div className="fixed inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
//         <svg className="absolute bottom-0 left-0 right-0 h-80 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
//           <path
//             fill="rgba(16, 185, 129, 0.1)"
//             d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L0,320Z"
//           />
//         </svg>
//       </div>

//       <div className="min-h-screen flex items-center justify-center px-4 py-12">
//         <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 p-8 sm:p-10">
//           <div className="text-center mb-8">
//             <img
//               src={NewLogo}
//               alt="GV - Tour Planners"
//               className="mx-auto w-48 sm:w-56 md:w-64 h-auto object-contain drop-shadow-2xl -mb-6 sm:-mb-8"
//             />
//             <h1 className="mt-10 sm:mt-12 text-2xl sm:text-3xl font-bold text-gray-800">
//               <span className="text-indigo-600">Staff</span> {view === "login" ? "Login" : "Password Help"}
//             </h1>
//             <p className="mt-2 text-sm sm:text-base text-gray-600 font-medium">
//               {view === "login" && "Welcome back! Please log in to continue."}
//               {view === "forgot" && "Enter your username. HR will reset your password."}
//               {view === "sent" && "Request sent."}
//             </p>
//           </div>

//           {view === "login" && (
//             <form onSubmit={onLogin} className="space-y-5" noValidate>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
//                 <input
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   autoComplete="username"
//                   autoCapitalize="none"
//                   placeholder="e.g. priya.s"
//                   className={inputClass(!!error)}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
//                 <input
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   autoComplete="current-password"
//                   placeholder="••••••••"
//                   className={inputClass(!!error)}
//                 />
//               </div>

//               {error && (
//                 <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
//                   <p className="text-red-700 text-sm text-center font-medium">{error}</p>
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold text-lg rounded-xl shadow-lg transition-all"
//               >
//                 {submitting ? "Logging in..." : "Login"}
//               </button>

//               <p className="text-center text-sm text-gray-600">
//                 Forgot password?{" "}
//                 <button type="button" onClick={() => switchView("forgot")} className="text-indigo-600 font-bold underline hover:text-indigo-700">
//                   Click here
//                 </button>
//               </p>
//             </form>
//           )}

//           {view === "forgot" && (
//             <form onSubmit={onForgot} className="space-y-5" noValidate>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
//                 <input
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   autoCapitalize="none"
//                   placeholder="e.g. priya.s"
//                   className={inputClass(!!error)}
//                 />
//               </div>

//               {error && (
//                 <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
//                   <p className="text-red-700 text-sm text-center font-medium">{error}</p>
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold text-lg rounded-xl shadow-lg transition-all"
//               >
//                 {submitting ? "Sending..." : "Send reset request"}
//               </button>

//               <p className="text-center text-sm text-gray-600">
//                 Remembered it?{" "}
//                 <button type="button" onClick={() => switchView("login")} className="text-indigo-600 font-bold underline hover:text-indigo-700">
//                   Back to login
//                 </button>
//               </p>
//             </form>
//           )}

//           {view === "sent" && (
//             <div className="space-y-5 text-center">
//               <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
//                 <p className="text-[15px] font-semibold text-emerald-800">Your request has been sent to HR.</p>
//                 <p className="mt-1 text-sm text-emerald-700">They will share a new password with you by email.</p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => switchView("login")}
//                 className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-lg"
//               >
//                 Back to login
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }


import { useContext, useState } from "react";
import { toast } from "react-toastify";
import NewLogo from "../assets/newlogo.png";
import { StaffContext } from "./StaffContext";

// ══════════════════════════════════════════════════════════════════════════════
// Background illustrations — staff desk la computer, odura train, aeroplane, clock, train ticket.
// Ellaam background la mattum (click / typing ku thadai illa). Mobile la sila maraiyum.
// ══════════════════════════════════════════════════════════════════════════════
const StaffBackdrop = () => (
  <div className="sb-root" aria-hidden="true">
    <style>{`
      .sb-root { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
      /* Admin login maadhiri light, konjam blur — background la amaidhiya */
      .sb-soft { opacity: .5; filter: saturate(.85) blur(.6px); }
      .sb-soft.sb-plane { opacity: .6; }
      .sb-desk { position: absolute; left: 4%; bottom: 7%; width: 300px; }
      .sb-clock { position: absolute; right: 7%; top: 9%; width: 130px; }
      .sb-track { position: absolute; left: 0; right: 0; bottom: 2.5%; height: 70px; }
      .sb-rail { position: absolute; left: 0; right: 0; bottom: 6px; height: 3px; background: rgba(13,148,136,0.25); border-radius: 2px; }
      .sb-train { position: absolute; bottom: 4px; width: 300px; animation: sbTrain 26s linear infinite; }
      .sb-plane { position: absolute; right: 9%; bottom: 22%; width: 150px; animation: sbFly 7s ease-in-out infinite; }
      .sb-ticket { position: absolute; left: 8%; top: 13%; width: 180px; animation: sbTicket 8s ease-in-out infinite; }
      @keyframes sbFly { 0%,100% { transform: translate(0,0) } 50% { transform: translate(-8px,-12px) } }
      @keyframes sbTicket { 0%,100% { transform: rotate(-8deg) translateY(0) } 50% { transform: rotate(-5deg) translateY(-8px) } }
      .sb-hand-m { transform-origin: 60px 60px; animation: sbSpin 12s linear infinite; }
      .sb-hand-h { transform-origin: 60px 60px; animation: sbSpin 144s linear infinite; }
      .sb-screen { animation: sbBlink 3s ease-in-out infinite; }
      .sb-smoke { animation: sbSmoke 2.4s ease-out infinite; }
      @keyframes sbTrain { from { left: -320px; } to { left: 100%; } }
      @keyframes sbSpin { to { transform: rotate(360deg); } }
      @keyframes sbFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
      @keyframes sbBlink { 0%,100% { opacity: 1 } 50% { opacity: .75 } }
      @keyframes sbSmoke { 0% { opacity: .55; transform: translate(0,0) scale(.6) } 100% { opacity: 0; transform: translate(-14px,-22px) scale(1.4) } }
      @media (max-width: 1023px) { .sb-desk { width: 210px; left: 2%; } .sb-ticket { width: 130px; left: 3%; } .sb-plane { width: 110px; } }
      @media (max-width: 767px) { .sb-desk, .sb-ticket { display: none; } .sb-plane { width: 80px; right: 4%; bottom: 14%; } .sb-clock { width: 80px; right: 4%; top: 4%; } .sb-train { width: 220px; } }
      @media (prefers-reduced-motion: reduce) { .sb-train, .sb-hand-m, .sb-hand-h, .sb-plane, .sb-ticket, .sb-screen, .sb-smoke { animation: none; } .sb-train { left: 60%; } }
    `}</style>

    {/* Clock — mela right */}
    <svg className="sb-clock sb-soft" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="52" fill="#ffffff" fillOpacity="0.55" stroke="#99d8cf" strokeWidth="7" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => (
        <line key={a} x1="60" y1="14" x2="60" y2={a % 90 === 0 ? 22 : 18} stroke="#7cc9bd" strokeWidth={a % 90 === 0 ? 4 : 2.5} strokeLinecap="round" transform={`rotate(${a} 60 60)`} />
      ))}
      <line className="sb-hand-h" x1="60" y1="60" x2="60" y2="36" stroke="#5aa99d" strokeWidth="5" strokeLinecap="round" />
      <line className="sb-hand-m" x1="60" y1="60" x2="60" y2="24" stroke="#4f46e5" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="60" cy="60" r="5" fill="#4f46e5" />
    </svg>

    {/* Train ticket — mela left */}
    <svg className="sb-ticket sb-soft" viewBox="0 0 180 96">
      <path d="M8 4 H172 a4 4 0 0 1 4 4 V36 a12 12 0 0 0 0 24 V88 a4 4 0 0 1 -4 4 H8 a4 4 0 0 1 -4 -4 V60 a12 12 0 0 0 0 -24 V8 a4 4 0 0 1 4 -4 Z"
        fill="#ffffff" stroke="#5eada1" strokeWidth="2.5" />
      <path d="M8 4 H128 V24 H4 V8 a4 4 0 0 1 4 -4 Z" fill="#4f46e5" />
      <text x="16" y="18" fontSize="9" fontWeight="700" fill="#ffffff" fontFamily="sans-serif" letterSpacing="1">TRAIN TICKET</text>
      <line x1="128" y1="8" x2="128" y2="88" stroke="#99d8cf" strokeWidth="2" strokeDasharray="4 4" />
      <rect x="16" y="34" width="34" height="8" rx="4" fill="#5eada1" />
      <path d="M56 38 H78 M72 33 L78 38 L72 43" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="84" y="34" width="34" height="8" rx="4" fill="#5eada1" />
      <rect x="16" y="52" width="102" height="5" rx="2.5" fill="#cbeee8" />
      <rect x="16" y="64" width="70" height="5" rx="2.5" fill="#cbeee8" />
      <rect x="16" y="76" width="40" height="7" rx="3.5" fill="#fbbf24" />
      {[0, 6, 10, 16, 20, 24, 30, 34].map((x) => (
        <rect key={x} x={140 + x} y="22" width={x % 3 === 0 ? 3 : 2} height="52" fill="#1e293b" opacity="0.7" />
      ))}
    </svg>

    {/* Aeroplane — keezha right */}
    <svg className="sb-plane sb-soft" viewBox="0 0 160 120">
      <path d="M8 112 C40 104 70 92 96 70" stroke="#99d8cf" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" fill="none" />
      <g transform="translate(112 44) rotate(-38)">
        <path d="M-40 -5 H28 C38 -5 44 -2 44 0 C44 2 38 5 28 5 H-40 Z" fill="#4f46e5" />
        <path d="M4 -4 L-14 -36 H-4 L20 -4 Z" fill="#6366f1" />
        <path d="M4 4 L-14 36 H-4 L20 4 Z" fill="#4338ca" />
        <path d="M-34 -4 L-42 -18 H-36 L-26 -4 Z" fill="#6366f1" />
        <path d="M-34 4 L-42 18 H-36 L-26 4 Z" fill="#4338ca" />
        {[-24, -14, -4, 6, 16].map((x) => <circle key={x} cx={x} cy="0" r="1.6" fill="#e0e7ff" />)}
      </g>
    </svg>

    {/* Staff desk la computer — keezha left */}
    <svg className="sb-desk sb-soft" viewBox="0 0 320 260">
      {/* floor shadow */}
      <ellipse cx="160" cy="246" rx="140" ry="10" fill="#0d9488" opacity="0.08" />
      {/* chair */}
      <rect x="44" y="126" width="16" height="72" rx="8" fill="#99d8cf" />
      <rect x="40" y="168" width="70" height="12" rx="6" fill="#99d8cf" />
      <rect x="70" y="180" width="6" height="44" fill="#7cc9bd" />
      <rect x="50" y="222" width="46" height="6" rx="3" fill="#7cc9bd" />
      {/* person — body */}
      <path d="M60 172 C58 140 66 120 92 116 C112 113 122 126 124 146 L126 172 Z" fill="#4f46e5" />
      {/* arm to keyboard */}
      <path d="M112 132 C130 140 146 146 166 150" stroke="#4f46e5" strokeWidth="13" strokeLinecap="round" fill="none" />
      <circle cx="168" cy="150" r="6.5" fill="#f2c9a5" />
      {/* legs */}
      <path d="M78 172 L140 172 L142 214" stroke="#334155" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="134" y="210" width="26" height="9" rx="4.5" fill="#1e293b" />
      {/* head + hair */}
      <circle cx="98" cy="92" r="18" fill="#f2c9a5" />
      <path d="M80 90 C79 72 94 66 106 70 C116 73 118 82 116 90 C110 82 98 80 80 90 Z" fill="#1e293b" />
      {/* desk */}
      <rect x="132" y="156" width="176" height="10" rx="4" fill="#5eada1" />
      <rect x="292" y="166" width="9" height="72" fill="#7cc9bd" />
      <rect x="140" y="166" width="9" height="72" fill="#7cc9bd" />
      {/* keyboard */}
      <rect x="160" y="149" width="54" height="7" rx="2" fill="#cbd5e1" />
      {/* monitor */}
      <rect x="186" y="78" width="104" height="66" rx="7" fill="#1e293b" />
      <rect className="sb-screen" x="192" y="84" width="92" height="54" rx="3" fill="#e0f2f1" />
      <rect x="200" y="92" width="44" height="6" rx="3" fill="#4f46e5" opacity="0.8" />
      <rect x="200" y="104" width="70" height="5" rx="2.5" fill="#99d8cf" />
      <rect x="200" y="114" width="58" height="5" rx="2.5" fill="#99d8cf" />
      <rect x="200" y="124" width="36" height="5" rx="2.5" fill="#99d8cf" />
      <rect x="232" y="144" width="12" height="12" fill="#334155" />
      {/* mug */}
      <rect x="264" y="138" width="16" height="18" rx="3" fill="#ffffff" stroke="#7cc9bd" strokeWidth="2" />
      <path d="M280 142 C288 142 288 152 280 152" stroke="#7cc9bd" strokeWidth="2" fill="none" />
    </svg>

    {/* Railway track + odura train — keezha */}
    <div className="sb-track sb-soft">
      <div className="sb-rail" />
      <svg className="sb-train" viewBox="0 0 300 60">
        {/* smoke */}
        <circle className="sb-smoke" cx="262" cy="8" r="6" fill="#99d8cf" />
        {/* engine (right side, moving right) */}
        <rect x="222" y="16" width="62" height="30" rx="6" fill="#4f46e5" />
        <path d="M284 22 L296 30 L296 46 L284 46 Z" fill="#4338ca" />
        <rect x="230" y="22" width="18" height="12" rx="2" fill="#e0f2f1" />
        <rect x="256" y="8" width="10" height="10" rx="2" fill="#334155" />
        {/* coaches */}
        {[150, 78, 6].map((x) => (
          <g key={x}>
            <rect x={x} y="18" width="66" height="28" rx="5" fill="#5eada1" />
            {[8, 26, 44].map((w) => (
              <rect key={w} x={x + w} y="24" width="12" height="9" rx="2" fill="#e0f2f1" />
            ))}
            <rect x={x + 66} y="34" width="6" height="4" fill="#334155" />
          </g>
        ))}
        {/* wheels */}
        {[18, 56, 90, 128, 162, 200, 236, 270].map((cx) => (
          <circle key={cx} cx={cx} cy="49" r="5.5" fill="#334155" stroke="#e0f2f1" strokeWidth="1.5" />
        ))}
      </svg>
    </div>
  </div>
);

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
        <StaffBackdrop />
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
