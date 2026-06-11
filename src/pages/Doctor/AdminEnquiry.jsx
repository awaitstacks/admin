// import { useContext, useState } from "react";
// import { TourContext } from "../../context/TourContext";

// const AdminEnquiryForm = () => {
//     const { adminCreateEnquiry, enquiryLoading } = useContext(TourContext);
//     const [submitted, setSubmitted] = useState(null);
//     const [formData, setFormData] = useState({
//         fullName: "", mobileNumber: "", email: "", city: "",
//         destination: "", tourType: "", preferredTravelDate: "",
//         numberOfDays: "", specialRequests: "", source: "admin",
//     });
//     const [counts, setCounts] = useState({ a: 1, c: 0, i: 0 });

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };

//     const changeCount = (key, delta) => {
//         setCounts((prev) => {
//             const updated = { ...prev, [key]: Math.max(0, prev[key] + delta) };
//             if (key === "a" && updated[key] < 1) updated[key] = 1;
//             return updated;
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const result = await adminCreateEnquiry({
//             ...formData,
//             adults: counts.a,
//             children: counts.c,
//             infants: counts.i,
//         });
//         if (result.success) {
//             setSubmitted(result.fitCode);
//             setFormData({ fullName: "", mobileNumber: "", email: "", city: "", destination: "", tourType: "", preferredTravelDate: "", numberOfDays: "", specialRequests: "", source: "admin" });
//             setCounts({ a: 1, c: 0, i: 0 });
//         }
//     };

//     const inp = {
//         width: "100%", border: "0.5px solid #e2e8f0", borderRadius: "8px",
//         padding: "9px 12px", fontSize: "13px", color: "#1e293b",
//         outline: "none", background: "#f8fafc", boxSizing: "border-box"
//     };
//     const lbl = { fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "5px" };
//     const sec = {
//         fontSize: "14px", fontWeight: 700, color: "#1e293b",
//         display: "flex", alignItems: "center", gap: "8px",
//         marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9"
//     };

//     return (
//         <div style={{ padding: "24px 28px", background: "#f8fafc", minHeight: "100vh" }}>
//             <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

//             {/* Header */}
//             <div style={{ marginBottom: "20px" }}>
//                 <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>➕ Raise New Enquiry</h1>
//                 <p style={{ fontSize: "13px", color: "#64748b", marginTop: "3px" }}>Create enquiry on behalf of customer — Admin side</p>
//             </div>

//             {/* Success Banner */}
//             {submitted && (
//                 <div style={{ background: "#EAF3DE", border: "1px solid #6ee7b7", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
//                     <span style={{ fontSize: "24px" }}>✅</span>
//                     <div>
//                         <div style={{ fontSize: "14px", fontWeight: 700, color: "#065f46" }}>Enquiry created successfully!</div>
//                         <div style={{ fontSize: "13px", color: "#047857" }}>FIT Code assigned: <strong style={{ fontSize: "16px" }}>{submitted}</strong></div>
//                     </div>
//                     <button onClick={() => setSubmitted(null)}
//                         style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#064e3b", fontSize: "20px", cursor: "pointer" }}>✕</button>
//                 </div>
//             )}

//             <form onSubmit={handleSubmit}>
//                 <div style={{ background: "#fff", borderRadius: "14px", border: "0.5px solid #e2e8f0", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>

//                     {/* Section 1 — Personal */}
//                     <div>
//                         <div style={sec}>
//                             <span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>👤</span>
//                             Personal Details
//                         </div>
//                         <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px" }}>
//                             {[
//                                 { label: "Full Name *", name: "fullName", placeholder: "Enter full name", required: true },
//                                 { label: "Mobile Number *", name: "mobileNumber", placeholder: "+91 98765 43210", required: true },
//                                 { label: "Email Address *", name: "email", placeholder: "email@example.com", type: "email", required: true },
//                                 { label: "City / Location", name: "city", placeholder: "e.g. Chennai" },
//                             ].map((f) => (
//                                 <div key={f.name}>
//                                     <label style={lbl}>{f.label}</label>
//                                     <input name={f.name} value={formData[f.name]} onChange={handleChange}
//                                         required={f.required} type={f.type || "text"} placeholder={f.placeholder} style={inp} />
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Section 2 — Tour */}
//                     <div>
//                         <div style={sec}>
//                             <span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center" }}>🗺️</span>
//                             Tour Details
//                         </div>
//                         <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px" }}>
//                             <div>
//                                 <label style={lbl}>Destination *</label>
//                                 <input name="destination" value={formData.destination} onChange={handleChange}
//                                     required placeholder="e.g. Kerala" style={inp} />
//                             </div>
//                             <div>
//                                 <label style={lbl}>Tour Type *</label>
//                                 <select name="tourType" value={formData.tourType} onChange={handleChange} required style={inp}>
//                                     <option value="">Select type</option>
//                                     <option>Group tour(fixed departure)</option>
//                                     <option>Customized/Private tour</option>
//                                     <option>Friends</option>
//                                     <option>Family</option>
//                                     <option>Corporate/Team Outing</option>
//                                     <option>Honeymoon</option>
//                                     <option>pilgrimage tour</option>
//                                     <option>Others</option>
//                                 </select>
//                             </div>
//                             <div>
//                                 <label style={lbl}>Travel Date *</label>
//                                 <input name="preferredTravelDate" value={formData.preferredTravelDate}
//                                     onChange={handleChange} required type="date" style={inp} />
//                             </div>
//                             <div>
//                                 <label style={lbl}>No. of Days *</label>
//                                 <input name="numberOfDays" value={formData.numberOfDays} onChange={handleChange}
//                                     required type="number" min="1" placeholder="5" style={inp} />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Section 3 — Travellers */}
//                     <div>
//                         <div style={sec}>
//                             <span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center" }}>👥</span>
//                             Travellers
//                         </div>
//                         <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px" }}>
//                             {[
//                                 { key: "a", label: "Adults", color: "#2563eb", bg: "#dbeafe" },
//                                 { key: "c", label: "Children (5–12)", color: "#ec4899", bg: "#fce7f3" },
//                                 { key: "i", label: "Infants (0–4)", color: "#f97316", bg: "#ffedd5" },
//                             ].map((t) => (
//                                 <div key={t.key} style={{ background: "#f8fafc", border: "0.5px solid #e2e8f0", borderRadius: "10px", padding: "12px" }}>
//                                     <div style={{ fontSize: "12px", fontWeight: 600, color: t.color, marginBottom: "10px" }}>{t.label}</div>
//                                     <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "8px" }}>
//                                         <button type="button" onClick={() => changeCount(t.key, -1)}
//                                             style={{ height: "36px", borderRadius: "8px", background: t.bg, border: "none", color: t.color, fontSize: "20px", cursor: "pointer" }}>−</button>
//                                         <span style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", textAlign: "center", minWidth: "28px" }}>{counts[t.key]}</span>
//                                         <button type="button" onClick={() => changeCount(t.key, 1)}
//                                             style={{ height: "36px", borderRadius: "8px", background: t.bg, border: "none", color: t.color, fontSize: "20px", cursor: "pointer" }}>+</button>
//                                     </div>
//                                 </div>
//                             ))}
//                             <div style={{ background: "#eff6ff", border: "0.5px solid #bfdbfe", borderRadius: "10px", padding: "12px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
//                                 <div style={{ fontSize: "12px", color: "#2563eb", fontWeight: 600, marginBottom: "4px" }}>Total Pax</div>
//                                 <div style={{ fontSize: "32px", fontWeight: 800, color: "#2563eb" }}>{counts.a + counts.c + counts.i}</div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Section 4 — Additional */}
//                     <div>
//                         <div style={sec}>
//                             <span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#ffedd5", display: "flex", alignItems: "center", justifyContent: "center" }}>💬</span>
//                             Additional Info
//                         </div>
//                         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
//                             <div>
//                                 <label style={lbl}>Special Requests</label>
//                                 <textarea name="specialRequests" value={formData.specialRequests} onChange={handleChange}
//                                     rows={3} placeholder="e.g. vegetarian meals, wheelchair access..."
//                                     style={{ ...inp, resize: "none", height: "auto" }} />
//                             </div>
//                             <div>
//                                 <label style={lbl}>Source</label>
//                                 <select name="source" value={formData.source} onChange={handleChange} style={inp}>
//                                     <option value="admin">Admin (Walk-in / Phone)</option>
//                                     <option value="Google">Google</option>
//                                     <option value="Facebook">Facebook</option>
//                                     <option value="Instagram">Instagram</option>
//                                     <option value="YouTube">YouTube</option>
//                                     <option value="Friends & Family">Friends & Family</option>
//                                     <option value="Whatsapp/Referral">Whatsapp/Referral</option>
//                                     <option value="Others">Others</option>
//                                 </select>
//                             </div>
//                         </div>
//                     </div>

//                 </div>

//                 {/* Submit */}
//                 <button type="submit" disabled={enquiryLoading}
//                     style={{ width: "100%", marginTop: "16px", padding: "14px", background: enquiryLoading ? "#93c5fd" : "#2563eb", color: "#fff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: enquiryLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
//                     {enquiryLoading ? (
//                         <>
//                             <div style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
//                             Creating...
//                         </>
//                     ) : "➕ Create Enquiry"}
//                 </button>
//             </form>
//         </div>
//     );
// };

// export default AdminEnquiryForm;