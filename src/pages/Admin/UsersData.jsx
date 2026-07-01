// import React, { useContext, useEffect, useState, useRef } from "react";
// import { TourAdminContext } from "../../context/TourAdminContext";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const formatDate = (iso) => {
//   if (!iso) return "—";
//   return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
// };
// const formatTime = (iso) => {
//   if (!iso) return "";
//   return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
// };
// const getInitial = (name) => (name?.[0] || "U").toUpperCase();
// const avatarColors = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#14b8a6"];
// const getAvatarColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

// const GenderBadge = ({ gender }) => {
//   const map = {
//     Male:         { bg: "#dbeafe", color: "#1d4ed8" },
//     Female:       { bg: "#fce7f3", color: "#9d174d" },
//     Other:        { bg: "#ccfbf1", color: "#0f766e" },
//     "Not Selected": { bg: "#f1f5f9", color: "#94a3b8" },
//   };
//   const s = map[gender] || { bg: "#f1f5f9", color: "#94a3b8" };
//   const label = gender === "Not Selected" ? "Not set" : (gender || "Not set");
//   return (
//     <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", display: "inline-block" }}>
//       {label}
//     </span>
//   );
// };

// const Avatar = ({ user }) => {
//   const [err, setErr] = useState(false);
//   if (user.image && user.image.startsWith("http") && !err) {
//     return <img src={user.image} alt={user.name} onError={() => setErr(true)}
//       style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "2px solid #e0e7ff", flexShrink: 0 }} />;
//   }
//   return (
//     <div style={{ width: 38, height: 38, borderRadius: "50%", background: getAvatarColor(user.name), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
//       {getInitial(user.name)}
//     </div>
//   );
// };

// const RESPONSIVE_CSS = `
//   .users-table-wrap { display: block; }
//   .users-cards-wrap { display: none; }

//   @media (max-width: 900px) {
//     .users-table-wrap { display: none !important; }
//     .users-cards-wrap { display: flex !important; flex-direction: column; gap: 10px; }
//   }
// `;

// export default function UsersData() {
//   const { allUsers, getAllUsers, aToken } = useContext(TourAdminContext);
//   const [search, setSearch]     = useState("");
//   const [gender, setGender]     = useState("all");
//   const [phone, setPhone]       = useState("");
//   const [genderOpen, setGenderOpen] = useState(false);
//   const [loading, setLoading]   = useState(true);
//   const [showLeave, setShowLeave] = useState(false);
//   const dropRef = useRef(null);

//   useEffect(() => {
//     const fn = e => { e.preventDefault(); e.returnValue = ""; };
//     window.addEventListener("beforeunload", fn);
//     return () => window.removeEventListener("beforeunload", fn);
//   }, []);

//   useEffect(() => {
//     window.history.pushState(null, null, window.location.href);
//     const fn = e => { e.preventDefault(); setShowLeave(true); };
//     window.addEventListener("popstate", fn);
//     return () => window.removeEventListener("popstate", fn);
//   }, []);

//   useEffect(() => {
//     if (aToken) {
//       setLoading(true);
//       getAllUsers().catch(() => toast.error("Failed to load users")).finally(() => setLoading(false));
//     }
//   }, [aToken]);

//   useEffect(() => {
//     const fn = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setGenderOpen(false); };
//     document.addEventListener("mousedown", fn);
//     return () => document.removeEventListener("mousedown", fn);
//   }, []);

//   const filtered = [...(allUsers || [])]
//     .filter(u => {
//       const q = search.toLowerCase();
//       return (!search || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
//         && (gender === "all" || u.gender === gender)
//         && (!phone || u.phone?.includes(phone));
//     })
//     .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

//   const hasFilters = search || gender !== "all" || phone;

//   const inp = {
//     padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: 9,
//     fontSize: 13, outline: "none", background: "#f8fafc", color: "#1e293b",
//     width: "100%", boxSizing: "border-box",
//   };

//   const thStyle = {
//     padding: "11px 14px", fontSize: 11, fontWeight: 700, color: "#64748b",
//     textTransform: "uppercase", letterSpacing: ".05em", whiteSpace: "nowrap",
//     background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left",
//   };

//   const tdStyle = {
//     padding: "12px 14px", fontSize: 13, color: "#334155",
//     verticalAlign: "middle", borderBottom: "1px solid #f1f5f9", textAlign: "left",
//   };

//   return (
//     <div style={{ padding: "20px 16px", background: "#f1f5f9", minHeight: "100vh", fontFamily: "inherit", boxSizing: "border-box" }}>
//       <style>{RESPONSIVE_CSS}</style>
//       <ToastContainer position="top-right" autoClose={3000} />

//       {/* Header */}
//       <div style={{ marginBottom: 18, textAlign: "center" }}>
//         <h1 style={{ fontSize: 29, fontWeight: 700, color: "#250fecff", margin: "0 0 4px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
//           👥 All Users
//         </h1>
//         <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
//           {allUsers?.length || 0} registered users · {new Date().toLocaleDateString("en-IN")}
//         </p>
//       </div>

//       {/* Filter bar */}
//       <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
//         <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
//           <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 160px", minWidth: 0 }}>
//             <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".04em" }}>Search</span>
//             <input style={inp} placeholder="Name or email..." value={search} onChange={e => setSearch(e.target.value)} />
//           </div>

//           <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 140px", minWidth: 0, position: "relative" }} ref={dropRef}>
//             <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".04em" }}>Gender</span>
//             <div onClick={() => setGenderOpen(p => !p)}
//               style={{ ...inp, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//               <span>{gender === "all" ? "All Genders" : (gender === "Not Selected" ? "Not set" : gender)}</span>
//               <span style={{ fontSize: 10, color: "#94a3b8", transition: ".15s", display: "inline-block", transform: genderOpen ? "rotate(180deg)" : "none" }}>▾</span>
//             </div>
//             {genderOpen && (
//               <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 9, zIndex: 50, boxShadow: "0 4px 16px rgba(0,0,0,.1)", overflow: "hidden" }}>
//                 {["all","Male","Female","Other","Not Selected"].map(opt => (
//                   <div key={opt} onClick={() => { setGender(opt); setGenderOpen(false); }}
//                     style={{ padding: "9px 14px", fontSize: 13, cursor: "pointer", background: gender === opt ? "#eff6ff" : "#fff", color: "#1e293b" }}>
//                     {opt === "all" ? "All Genders" : opt === "Not Selected" ? "Not set" : opt}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 140px", minWidth: 0 }}>
//             <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".04em" }}>Phone</span>
//             <input style={inp} placeholder="Search phone..." value={phone} onChange={e => setPhone(e.target.value)} />
//           </div>

//           {hasFilters && (
//             <button onClick={() => { setSearch(""); setGender("all"); setPhone(""); }}
//               style={{ padding: "8px 16px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", alignSelf: "flex-end" }}>
//               ✕ Clear
//             </button>
//           )}
//         </div>

//         {!loading && (
//           <div style={{ marginTop: 10, fontSize: 12, color: "#94a3b8" }}>
//             Showing <strong style={{ color: "#6366f1" }}>{filtered.length}</strong> of {allUsers?.length || 0} users
//           </div>
//         )}
//       </div>

//       {/* Loading / Empty */}
//       {loading ? (
//         <div style={{ textAlign: "center", padding: 48, color: "#94a3b8", fontSize: 15 }}>Loading users...</div>
//       ) : filtered.length === 0 ? (
//         <div style={{ textAlign: "center", padding: 48, background: "#fff", borderRadius: 14, color: "#94a3b8" }}>
//           <div style={{ fontSize: 40, marginBottom: 8 }}>👤</div>
//           <div style={{ fontWeight: 600, color: "#475569" }}>No users found</div>
//           <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters</div>
//         </div>
//       ) : (
//         <>
//           {/* ── DESKTOP TABLE (>900px) ── */}
//           <div className="users-table-wrap" style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden" }}>
//             <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
//               <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
//                 <thead>
//                   <tr>
//                     <th style={{ ...thStyle, width: 36, textAlign: "center" }}>S.No</th>
//                     <th style={{ ...thStyle, width: 44, textAlign: "center" }}>Photo</th>
//                     <th style={thStyle}>Name & Email</th>
//                     <th style={thStyle}>Phone</th>
//                     <th style={thStyle}>Gender</th>
//                     <th style={thStyle}>Address</th>
//                     <th style={thStyle}>Logged On</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filtered.map((user, idx) => (
//                     <tr key={user._id}
//                       style={{ background: idx % 2 === 0 ? "#fff" : "#fafbff", cursor: "default" }}
//                       onMouseEnter={e => e.currentTarget.style.background = "#f0f4ff"}
//                       onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafbff"}>

//                       <td style={{ ...tdStyle, textAlign: "center", color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>{idx + 1}</td>

//                       <td style={{ ...tdStyle, textAlign: "center" }}>
//                         <div style={{ display: "flex", justifyContent: "center" }}><Avatar user={user} /></div>
//                       </td>

//                       <td style={tdStyle}>
//                         <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>{user.name || "—"}</div>
//                         <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{user.email}</div>
//                       </td>

//                       <td style={{ ...tdStyle, color: "#475569", whiteSpace: "nowrap" }}>
//                         {user.phone || <span style={{ color: "#cbd5e1" }}>—</span>}
//                       </td>

//                       <td style={tdStyle}>
//                         <GenderBadge gender={user.gender} />
//                       </td>

//                       <td style={{ ...tdStyle, maxWidth: 160 }}>
//                         {user.address?.line1 || user.address?.line2
//                           ? <span style={{ fontSize: 12, color: "#475569" }}>{[user.address.line1, user.address.line2].filter(Boolean).join(", ")}</span>
//                           : <span style={{ color: "#cbd5e1", fontSize: 12 }}>—</span>}
//                       </td>

//                       <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
//                         <div style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{formatDate(user.createdAt)}</div>
//                         <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{formatTime(user.createdAt)}</div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* ── MOBILE / TAB CARDS (≤900px) ── */}
//           <div className="users-cards-wrap">
//             {filtered.map((user, idx) => (
//               <div key={user._id} style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden" }}>

//                 {/* Card header */}
//                 <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
//                   <div style={{ position: "relative", flexShrink: 0 }}>
//                     <Avatar user={user} />
//                     <span style={{ position: "absolute", bottom: -2, right: -2, background: "#6366f1", color: "#fff", borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, border: "2px solid #fff" }}>
//                       {idx + 1}
//                     </span>
//                   </div>
//                   <div style={{ flex: 1, minWidth: 0 }}>
//                     <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//                       {user.name || "Unknown"}
//                     </div>
//                     <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//                       {user.email}
//                     </div>
//                   </div>
//                   {/* Joined — always top-right */}
//                   <div style={{ textAlign: "right", flexShrink: 0 }}>
//                     <div style={{ fontSize: 10.75, fontWeight: 600, color: "#475569", whiteSpace: "nowrap" }}>{formatDate(user.createdAt)}</div>
//                     <div style={{ fontSize: 9.75, color: "#94a3b8", whiteSpace: "nowrap" }}>{formatTime(user.createdAt)}</div>
//                   </div>
//                 </div>

//                 {/* Card body — info rows */}
//                 <div style={{ padding: "10px 16px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
//                   {/* Phone + Gender side by side */}
//                   <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
//                     <span style={{ display: "flex", alignItems: "center", gap: 4, background: "#f1f5f9", borderRadius: 8, padding: "4px 10px", fontSize: 12, color: "#475569", whiteSpace: "nowrap" }}>
//                       📞 {user.phone || "No phone"}
//                     </span>
//                     <GenderBadge gender={user.gender} />
//                   </div>
//                   {/* Address */}
//                   <div style={{ display: "flex", alignItems: "flex-start", gap: 4, fontSize: 12, color: "#475569" }}>
//                     <span style={{ flexShrink: 0 }}>📍</span>
//                     <span>
//                       {user.address?.line1 || user.address?.line2
//                         ? [user.address.line1, user.address.line2].filter(Boolean).join(", ")
//                         : <span style={{ color: "#cbd5e1" }}>No address</span>}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </>
//       )}

//       {/* Leave confirm */}
//       {showLeave && (
//         <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
//           <div style={{ background: "#fff", borderRadius: 18, padding: 32, maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,.15)" }}>
//             <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
//             <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px", color: "#1e293b" }}>Leave this page?</h2>
//             <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>Active filters will be lost.</p>
//             <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
//               <button onClick={() => { setShowLeave(false); window.history.pushState(null, null, window.location.href); }}
//                 style={{ padding: "10px 24px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}>Stay</button>
//               <button onClick={() => { setShowLeave(false); window.history.back(); }}
//                 style={{ padding: "10px 24px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}>Leave</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useContext, useEffect, useState, useRef } from "react";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const formatTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
};
const getInitial = (name) => (name?.[0] || "U").toUpperCase();
const avatarColors = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#14b8a6"];
const getAvatarColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

const GenderBadge = ({ gender }) => {
  const map = {
    Male:         { bg: "#dbeafe", color: "#1d4ed8" },
    Female:       { bg: "#fce7f3", color: "#9d174d" },
    Other:        { bg: "#ccfbf1", color: "#0f766e" },
    "Not Selected": { bg: "#f1f5f9", color: "#94a3b8" },
  };
  const s = map[gender] || { bg: "#f1f5f9", color: "#94a3b8" };
  const label = gender === "Not Selected" ? "Not set" : (gender || "Not set");
  return (
    <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", display: "inline-block" }}>
      {label}
    </span>
  );
};

const Avatar = ({ user }) => {
  const [err, setErr] = useState(false);
  if (user.image && user.image.startsWith("http") && !err) {
    return <img src={user.image} alt={user.name} onError={() => setErr(true)}
      style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "2px solid #e0e7ff", flexShrink: 0 }} />;
  }
  return (
    <div style={{ width: 38, height: 38, borderRadius: "50%", background: getAvatarColor(user.name), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
      {getInitial(user.name)}
    </div>
  );
};

const RESPONSIVE_CSS = `
  .users-table-wrap { display: block; }
  .users-cards-wrap { display: none; }

  @media (max-width: 768px) {
    .users-table-wrap { display: none !important; }
    .users-cards-wrap { display: flex !important; flex-direction: column; gap: 10px; }
  }
`;

export default function UsersData() {
  const { allUsers, getAllUsers, aToken } = useContext(TourAdminContext);
  const [search, setSearch]     = useState("");
  const [gender, setGender]     = useState("all");
  const [phone, setPhone]       = useState("");
  const [genderOpen, setGenderOpen] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [showLeave, setShowLeave] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const fn = e => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, []);

  useEffect(() => {
    window.history.pushState(null, null, window.location.href);
    const fn = e => { e.preventDefault(); setShowLeave(true); };
    window.addEventListener("popstate", fn);
    return () => window.removeEventListener("popstate", fn);
  }, []);

  useEffect(() => {
    if (aToken) {
      setLoading(true);
      getAllUsers().catch(() => toast.error("Failed to load users")).finally(() => setLoading(false));
    }
  }, [aToken]);

  useEffect(() => {
    const fn = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setGenderOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const filtered = [...(allUsers || [])]
    .filter(u => {
      const q = search.toLowerCase();
      return (!search || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
        && (gender === "all" || u.gender === gender)
        && (!phone || u.phone?.includes(phone));
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const hasFilters = search || gender !== "all" || phone;

  const inp = {
    padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: 9,
    fontSize: 13, outline: "none", background: "#f8fafc", color: "#1e293b",
    width: "100%", boxSizing: "border-box",
  };

  const thStyle = {
    padding: "11px 14px", fontSize: 11, fontWeight: 700, color: "#64748b",
    textTransform: "uppercase", letterSpacing: ".05em", whiteSpace: "nowrap",
    background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left",
  };

  const tdStyle = {
    padding: "12px 14px", fontSize: 13, color: "#334155",
    verticalAlign: "middle", borderBottom: "1px solid #f1f5f9", textAlign: "left",
  };

  return (
    <div style={{ padding: "20px 16px", background: "#f1f5f9", minHeight: "100vh", fontFamily: "inherit", boxSizing: "border-box" }}>
      <style>{RESPONSIVE_CSS}</style>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div style={{ marginBottom: 18, textAlign: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1520eaff", margin: "0 0 4px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          👥 All Users
        </h1>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
          {allUsers?.length || 0} registered users · {new Date().toLocaleDateString("en-IN")}
        </p>
      </div>

      {/* Filter bar */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 160px", minWidth: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".04em" }}>Search</span>
            <input style={inp} placeholder="Name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 140px", minWidth: 0, position: "relative" }} ref={dropRef}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".04em" }}>Gender</span>
            <div onClick={() => setGenderOpen(p => !p)}
              style={{ ...inp, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{gender === "all" ? "All Genders" : (gender === "Not Selected" ? "Not set" : gender)}</span>
              <span style={{ fontSize: 10, color: "#94a3b8", transition: ".15s", display: "inline-block", transform: genderOpen ? "rotate(180deg)" : "none" }}>▾</span>
            </div>
            {genderOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 9, zIndex: 50, boxShadow: "0 4px 16px rgba(0,0,0,.1)", overflow: "hidden" }}>
                {["all","Male","Female","Other","Not Selected"].map(opt => (
                  <div key={opt} onClick={() => { setGender(opt); setGenderOpen(false); }}
                    style={{ padding: "9px 14px", fontSize: 13, cursor: "pointer", background: gender === opt ? "#eff6ff" : "#fff", color: "#1e293b" }}>
                    {opt === "all" ? "All Genders" : opt === "Not Selected" ? "Not set" : opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 140px", minWidth: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".04em" }}>Phone</span>
            <input style={inp} placeholder="Search phone..." value={phone} onChange={e => setPhone(e.target.value)} />
          </div>

          {hasFilters && (
            <button onClick={() => { setSearch(""); setGender("all"); setPhone(""); }}
              style={{ padding: "8px 16px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", alignSelf: "flex-end" }}>
              ✕ Clear
            </button>
          )}
        </div>

        {!loading && (
          <div style={{ marginTop: 10, fontSize: 12, color: "#94a3b8" }}>
            Showing <strong style={{ color: "#6366f1" }}>{filtered.length}</strong> of {allUsers?.length || 0} users
          </div>
        )}
      </div>

      {/* Loading / Empty */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "#94a3b8", fontSize: 15 }}>Loading users...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, background: "#fff", borderRadius: 14, color: "#94a3b8" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>👤</div>
          <div style={{ fontWeight: 600, color: "#475569" }}>No users found</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters</div>
        </div>
      ) : (
        <>
          {/* ── DESKTOP TABLE (>900px) ── */}
          <div className="users-table-wrap" style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: 32, textAlign: "center" }}>#</th>
                    <th style={{ ...thStyle, width: 44, textAlign: "center" }}>Photo</th>
                    <th style={{ ...thStyle, minWidth: 160 }}>Name & Email</th>
                    <th style={{ ...thStyle, minWidth: 110 }}>Phone</th>
                    <th style={{ ...thStyle, minWidth: 80 }}>Gender</th>
                    <th style={{ ...thStyle, minWidth: 100 }}>Address</th>
                    <th style={{ ...thStyle, minWidth: 110 }}>Logged On</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user, idx) => (
                    <tr key={user._id}
                      style={{ background: idx % 2 === 0 ? "#fff" : "#fafbff", cursor: "default" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f0f4ff"}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafbff"}>

                      <td style={{ ...tdStyle, textAlign: "center", color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>{idx + 1}</td>

                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}><Avatar user={user} /></div>
                      </td>

                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>{user.name || "—"}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{user.email}</div>
                      </td>

                      <td style={{ ...tdStyle, color: "#475569", whiteSpace: "nowrap" }}>
                        {user.phone || <span style={{ color: "#cbd5e1" }}>—</span>}
                      </td>

                      <td style={tdStyle}>
                        <GenderBadge gender={user.gender} />
                      </td>

                      <td style={{ ...tdStyle, maxWidth: 120, wordBreak: "break-word", whiteSpace: "normal" }}>
                        {user.address?.line1 || user.address?.line2
                          ? <span style={{ fontSize: 12, color: "#475569" }}>{[user.address.line1, user.address.line2].filter(Boolean).join(", ")}</span>
                          : <span style={{ color: "#cbd5e1", fontSize: 12 }}>—</span>}
                      </td>

                      <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{formatDate(user.createdAt)}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{formatTime(user.createdAt)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── MOBILE / TAB CARDS (≤900px) ── */}
          <div className="users-cards-wrap">
            {filtered.map((user, idx) => (
              <div key={user._id} style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden" }}>

                {/* Card header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <Avatar user={user} />
                    <span style={{ position: "absolute", bottom: -2, right: -2, background: "#6366f1", color: "#fff", borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, border: "2px solid #fff" }}>
                      {idx + 1}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user.name || "Unknown"}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user.email}
                    </div>
                  </div>
                  {/* Joined — always top-right */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#475569", whiteSpace: "nowrap" }}>{formatDate(user.createdAt)}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap" }}>{formatTime(user.createdAt)}</div>
                  </div>
                </div>

                {/* Card body — info rows */}
                <div style={{ padding: "10px 16px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* Phone + Gender side by side */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, background: "#f1f5f9", borderRadius: 8, padding: "4px 10px", fontSize: 12, color: "#475569", whiteSpace: "nowrap" }}>
                      📞 {user.phone || "No phone"}
                    </span>
                    <GenderBadge gender={user.gender} />
                  </div>
                  {/* Address */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 4, fontSize: 12, color: "#475569" }}>
                    <span style={{ flexShrink: 0 }}>📍</span>
                    <span>
                      {user.address?.line1 || user.address?.line2
                        ? [user.address.line1, user.address.line2].filter(Boolean).join(", ")
                        : <span style={{ color: "#cbd5e1" }}>No address</span>}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Leave confirm */}
      {showLeave && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 18, padding: 32, maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,.15)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px", color: "#1e293b" }}>Leave this page?</h2>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>Active filters will be lost.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => { setShowLeave(false); window.history.pushState(null, null, window.location.href); }}
                style={{ padding: "10px 24px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}>Stay</button>
              <button onClick={() => { setShowLeave(false); window.history.back(); }}
                style={{ padding: "10px 24px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}>Leave</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

