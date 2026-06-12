import { useContext, useEffect, useState } from "react";
import { TourContext } from "../../context/TourContext";

// ─────────────────────────────────────────────
// CONFIRM MODAL (Accept / Reject / Delete)
// ─────────────────────────────────────────────
const ConfirmModal = ({ open, type, name, fitCode, onConfirm, onCancel }) => {
    const [salesValue, setSalesValue] = useState("");
    const [fitStates, setFitStates] = useState([]);
    const [pickupDate, setPickupDate] = useState("");
    const [pickupTime, setPickupTime] = useState("");
    const [pickupPlace, setPickupPlace] = useState("");
    useEffect(() => {
        if (open) {
            setSalesValue(""); setFitStates([]);
            setPickupDate(""); setPickupTime(""); setPickupPlace("");
        }
    }, [open]);

    if (!open) return null;

    const allStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
    const toggleState = (s) => setFitStates((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

    const cfg = {
        accept: { iconBg: "#EAF3DE", iconColor: "#3B6D11", title: "Accept Enquiry", btnBg: "#3B6D11", lbl: "✓ Confirm Accept" },
        reject: { icon: "✕", iconBg: "#FCEBEB", iconColor: "#A32D2D", title: "Reject Enquiry?", sub: "This will mark the enquiry as rejected.", btnBg: "#A32D2D", lbl: "Yes, Reject" },
        delete: { icon: "🗑", iconBg: "#FCEBEB", iconColor: "#A32D2D", title: "Delete Enquiry?", sub: "This action cannot be undone.", btnBg: "#A32D2D", lbl: "Yes, Delete" },
    };
    const c = cfg[type] || cfg.delete;

    const isAcceptDisabled = type === "accept" && (
        fitStates.length === 0 ||
        !salesValue || Number(salesValue) <= 0 ||
        !pickupDate || !pickupTime || !pickupPlace.trim()
    );

    const handleConfirm = () => {
        if (type === "accept") onConfirm({ salesValue: Number(salesValue), fitStates, pickupDate, pickupTime, pickupPlace });
        else onConfirm({});
    };

    const inpStyle = { width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "8px", padding: "9px 10px", fontSize: "13px", color: "#1e293b", outline: "none", background: "#f8fafc", boxSizing: "border-box" };
    const lblStyle = { fontSize: "12px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: type === "accept" ? "500px" : "320px", border: "0.5px solid #e2e8f0", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}>

                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: c.iconBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: "20px", color: c.iconColor, fontWeight: 700 }}>
                    {type === "accept" ? "✓" : c.icon}
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", textAlign: "center", marginBottom: "4px" }}>{c.title}</h3>
                <p style={{ fontSize: "13px", color: "#64748b", textAlign: "center", marginBottom: "18px" }}>
                    <strong style={{ color: "#1e293b" }}>{name}</strong>
                </p>

                {type === "accept" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "18px" }}>

                        {/* FIT Code */}
                        <div style={{ background: "#E6F1FB", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "12px", color: "#0C447C", fontWeight: 500 }}>🏷 FIT Code</span>
                            <span style={{ fontSize: "14px", fontWeight: 800, color: "#0C447C", background: "#fff", padding: "4px 12px", borderRadius: "6px", letterSpacing: "1px", fontFamily: "monospace" }}>
                                {fitCode || "—"}
                            </span>
                        </div>

                        {/* FIT States */}
                        <div>
                            <label style={lblStyle}>
                                🗺 FIT States <span style={{ color: "#ef4444" }}>*</span>
                                <span style={{ float: "right", fontSize: "11px", fontWeight: 600, background: fitStates.length > 0 ? "#EAF3DE" : "#f1f5f9", color: fitStates.length > 0 ? "#3B6D11" : "#94a3b8", padding: "2px 8px", borderRadius: "10px" }}>
                                    {fitStates.length} selected
                                </span>
                            </label>
                            <div style={{ maxHeight: "160px", overflowY: "auto", display: "flex", flexWrap: "wrap", gap: "6px", padding: "10px", background: "#f8fafc", borderRadius: "10px", border: `1.5px solid ${fitStates.length === 0 ? "#fca5a5" : "#e2e8f0"}` }}>
                                {allStates.map((state) => (
                                    <button key={state} type="button" onClick={() => toggleState(state)}
                                        style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 500, cursor: "pointer", border: fitStates.includes(state) ? "none" : "1px solid #e2e8f0", background: fitStates.includes(state) ? "#0C447C" : "#fff", color: fitStates.includes(state) ? "#fff" : "#475569", whiteSpace: "nowrap" }}>
                                        {fitStates.includes(state) ? "✓ " : ""}{state}
                                    </button>
                                ))}
                            </div>
                            {fitStates.length === 0 && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>⚠ Select at least one state</p>}
                        </div>

                        {/* Sales Value */}
                        <div>
                            <label style={lblStyle}>💰 Sales Value (₹) <span style={{ color: "#ef4444" }}>*</span></label>
                            <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "#94a3b8" }}>₹</span>
                                <input type="number" min="1" placeholder="e.g. 25000" value={salesValue} onChange={(e) => setSalesValue(e.target.value)}
                                    style={{ ...inpStyle, paddingLeft: "28px", border: `1.5px solid ${!salesValue || Number(salesValue) <= 0 ? "#fca5a5" : "#e2e8f0"}` }} />
                            </div>
                            {(!salesValue || Number(salesValue) <= 0) && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>⚠ Enter a valid sales value</p>}
                        </div>

                        {/* Pickup Date + Time */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div>
                                <label style={lblStyle}>📅 Pickup Date <span style={{ color: "#ef4444" }}>*</span></label>
                                <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)}
                                    style={{ ...inpStyle, border: `1.5px solid ${!pickupDate ? "#fca5a5" : "#e2e8f0"}` }} />
                                {!pickupDate && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>⚠ Required</p>}
                            </div>
                            <div>
                                <label style={lblStyle}>🕐 Pickup Time <span style={{ color: "#ef4444" }}>*</span></label>
                                <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}
                                    style={{ ...inpStyle, border: `1.5px solid ${!pickupTime ? "#fca5a5" : "#e2e8f0"}` }} />
                                {!pickupTime && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>⚠ Required</p>}
                            </div>
                        </div>

                        {/* Pickup Place */}
                        <div>
                            <label style={lblStyle}>📍 Pickup Place <span style={{ color: "#ef4444" }}>*</span></label>
                            <input type="text" placeholder="e.g. Chennai Airport, T2" value={pickupPlace} onChange={(e) => setPickupPlace(e.target.value)}
                                style={{ ...inpStyle, border: `1.5px solid ${!pickupPlace.trim() ? "#fca5a5" : "#e2e8f0"}` }} />
                            {!pickupPlace.trim() && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>⚠ Required</p>}
                        </div>
                    </div>
                )}

                {type !== "accept" && (
                    <p style={{ fontSize: "13px", color: "#64748b", textAlign: "center", marginBottom: "18px" }}>{c.sub}</p>
                )}

                <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={onCancel} style={{ flex: 1, padding: "10px", border: "0.5px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc", color: "#64748b", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}>Cancel</button>
                    <button onClick={handleConfirm} disabled={isAcceptDisabled}
                        style={{ flex: 1, padding: "10px", border: "none", borderRadius: "10px", background: isAcceptDisabled ? "#cbd5e1" : c.btnBg, color: "#fff", fontSize: "13px", cursor: isAcceptDisabled ? "not-allowed" : "pointer", fontWeight: 700 }}>
                        {c.lbl}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// EDIT ENQUIRY MODAL
// ─────────────────────────────────────────────
const EditEnquiryModal = ({ open, data, onClose, onSave }) => {
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [counts, setCounts] = useState({ a: 1, c: 0, i: 0 });
    const [fitStates, setFitStates] = useState([]);

    useEffect(() => {
        if (open && data) {
            setForm({
                fullName: data.fullName || "",
                mobileNumber: data.mobileNumber || "",
                email: data.email || "",
                city: data.city || "",
                destination: data.destination || "",
                tourType: data.tourType || "",
                preferredTravelDate: data.preferredTravelDate ? new Date(data.preferredTravelDate).toISOString().split("T")[0] : "",
                numberOfDays: data.numberOfDays || "",
                numberOfNights: data.numberOfNights || "",
                specialRequests: data.specialRequests || "",
                source: data.source || "",
                status: data.status || "pending",
                salesValue: data.salesValue || "",
                pickupDate: data.pickupDate ? new Date(data.pickupDate).toISOString().split("T")[0] : "",
                pickupTime: data.pickupTime || "",
                pickupPlace: data.pickupPlace || "",
            });
            setCounts({ a: data.adults || 1, c: data.children || 0, i: data.infants || 0 });
            setFitStates(data.fitStates || []);
        }
    }, [open, data]);

    if (!open) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => {
            const updated = { ...p, [name]: value };
            if (name === "numberOfDays") {
                const days = Number(value);
                updated.numberOfNights = days > 0 ? String(days - 1) : "";
            }
            return updated;
        });
    };

    // original values store
    const original = {
        fullName: data?.fullName || "", mobileNumber: data?.mobileNumber || "",
        email: data?.email || "", city: data?.city || "",
        destination: data?.destination || "", tourType: data?.tourType || "",
        preferredTravelDate: data?.preferredTravelDate ? new Date(data.preferredTravelDate).toISOString().split("T")[0] : "",
        numberOfDays: String(data?.numberOfDays || ""), numberOfNights: String(data?.numberOfNights || ""),
        specialRequests: data?.specialRequests || "", source: data?.source || "",
        status: data?.status || "pending", salesValue: String(data?.salesValue || ""),
        pickupDate: data?.pickupDate ? new Date(data.pickupDate).toISOString().split("T")[0] : "",
        pickupTime: data?.pickupTime || "", pickupPlace: data?.pickupPlace || "",
    };

    const changeCount = (key, delta) => {
        setCounts((prev) => {
            const u = { ...prev, [key]: Math.max(0, prev[key] + delta) };
            if (key === "a" && u[key] < 1) u[key] = 1;
            return u;
        });
    };

    const toggleState = (s) => setFitStates((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

    const handleSave = async () => {
        setSaving(true);
        const result = await onSave(data._id, {
            ...form,
            adults: counts.a,
            children: counts.c,
            infants: counts.i,
            numberOfDays: Number(form.numberOfDays),
            numberOfNights: Number(form.numberOfNights),
            salesValue: form.salesValue ? Number(form.salesValue) : null,
            fitStates,
        });
        setSaving(false);
        if (result?.success) onClose();
    };

    const allStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];

    const inp = { width: "100%", border: "0.5px solid #e2e8f0", borderRadius: "8px", padding: "11px 12px", fontSize: "14px", color: "#1e293b", outline: "none", background: "#f8fafc", boxSizing: "border-box", height: "44px" }; const lbl = { fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "5px" };
    const sec = { fontSize: "13px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #f1f5f9" };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            <style>{`
            .eq-edit-add { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 600px) { .eq-edit-add { grid-template-columns: 1fr !important; } }
    .eq-edit-grid2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; }
    .eq-edit-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .eq-edit-grid2c { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; margin-bottom: 12px; }
    .eq-edit-grid3t { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
    @media (max-width: 600px) {
        .eq-edit-grid2  { grid-template-columns: 1fr !important; }
        .eq-edit-grid3  { grid-template-columns: 1fr !important; }
        .eq-edit-grid2c { grid-template-columns: 1fr !important; }
        .eq-edit-grid3t { grid-template-columns: 1fr !important; }
    }
`}</style>
            <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "700px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>

                {/* Header */}
                <div style={{ position: "sticky", top: 0, background: "#1e293b", padding: "16px 20px", borderRadius: "16px 16px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
                    <div>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>✎ Edit Enquiry</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{data?.fitCode} — {data?.fullName}</div>
                    </div>
                    <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", fontSize: "16px" }}>✕</button>
                </div>

                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>

                    {/* Personal Details */}
                    <div>
                        <div style={sec}><span style={{ background: "#dbeafe", borderRadius: "6px", padding: "4px 8px" }}>👤</span> Personal Details</div>
                        <div className="eq-edit-grid2">                            {[
                            { label: "Full Name", name: "fullName", placeholder: "Full name" },
                            { label: "Mobile Number", name: "mobileNumber", placeholder: "+91 XXXXX XXXXX" },
                            { label: "Email", name: "email", placeholder: "email@example.com", type: "email" },
                            { label: "City", name: "city", placeholder: "e.g. Chennai" },
                        ].map((f) => (
                            <div key={f.name}>
                                <label style={lbl}>{f.label}</label>
                                <input name={f.name} value={form[f.name] || ""} onChange={handleChange} type={f.type || "text"} placeholder={f.placeholder} style={inp} />
                            </div>
                        ))}
                        </div>
                    </div>

                    {/* Tour Details */}
                    <div>
                        <div style={sec}><span style={{ background: "#d1fae5", borderRadius: "6px", padding: "4px 8px" }}>🗺️</span> Tour Details</div>
                        <div className="eq-edit-grid2c">                            <div>
                            <label style={lbl}>Destination</label>
                            <input name="destination" value={form.destination || ""} onChange={handleChange} placeholder="e.g. Kerala" style={inp} />
                        </div>
                            <div>
                                <label style={lbl}>Tour Type</label>
                                <select name="tourType" value={form.tourType || ""} onChange={handleChange} style={{ ...inp, appearance: "none" }}>
                                    <option value="">Select type</option>
                                    <option>Group tour(fixed departure)</option>
                                    <option>Customized/Private tour</option>
                                    <option>Friends</option><option>Family</option>
                                    <option>Corporate/Team Outing</option>
                                    <option>Honeymoon</option>
                                    <option>pilgrimage tour</option>
                                    <option>Others</option>
                                </select>
                            </div>
                        </div>
                        <div className="eq-edit-grid3">
                            <div>
                                <label style={lbl}>Travel Date</label>
                                <input type="date" name="preferredTravelDate" value={form.preferredTravelDate || ""} onChange={handleChange}
                                    min={new Date().toISOString().split("T")[0]}
                                    style={inp} />

                            </div>
                            <div>
                                <label style={lbl}>No. of Days</label>
                                <input type="number" name="numberOfDays" value={form.numberOfDays || ""} onChange={handleChange} min="1" placeholder="5" style={inp} />
                            </div>
                            <div>
                                <label style={lbl}>No. of Nights</label>
                                <input type="number" name="numberOfNights" value={form.numberOfNights || ""} onChange={handleChange} min="0" placeholder="4" style={inp} />
                            </div>
                        </div>
                    </div>

                    {/* Travellers */}
                    <div>
                        <div style={sec}><span style={{ background: "#ede9fe", borderRadius: "6px", padding: "4px 8px" }}>👥</span> Travellers</div>
                        <div className="eq-edit-grid3t">                            {[
                            { key: "a", label: "Adults", color: "#2563eb", bg: "#dbeafe" },
                            { key: "c", label: "Children (6–10)", color: "#ec4899", bg: "#fce7f3" },
                            { key: "i", label: "Infants (0–5)", color: "#f97316", bg: "#ffedd5" },
                        ].map((t) => (
                            <div key={t.key} style={{ background: "#f8fafc", border: "0.5px solid #e2e8f0", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                                <div style={{ fontSize: "12px", fontWeight: 600, color: t.color, marginBottom: "8px" }}>{t.label}</div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                    <button type="button" onClick={() => changeCount(t.key, -1)} style={{ width: "30px", height: "30px", borderRadius: "6px", background: t.bg, border: "none", color: t.color, fontSize: "18px", cursor: "pointer" }}>−</button>
                                    <span style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", minWidth: "24px" }}>{counts[t.key]}</span>
                                    <button type="button" onClick={() => changeCount(t.key, 1)} style={{ width: "30px", height: "30px", borderRadius: "6px", background: t.bg, border: "none", color: t.color, fontSize: "18px", cursor: "pointer" }}>+</button>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>

                    {/* Status & Sales */}
                    {/* Status & Sales */}
                    {data?.status === "accepted" && <div>
                        <div style={sec}><span style={{ background: "#fef3c7", borderRadius: "6px", padding: "4px 8px" }}>📊</span> Status & Sales</div>
                        <div className="eq-edit-grid2">                            <div>
                            <label style={lbl}>Status</label>
                            <select name="status" value={form.status || ""} onChange={handleChange} style={{ ...inp, appearance: "none" }}>
                                <option value="pending">Pending</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                            <div>
                                <label style={lbl}>Sales Value (₹)</label>
                                <input type="number" name="salesValue" value={form.salesValue || ""} onChange={handleChange} min="0" placeholder="e.g. 25000" style={inp} />
                            </div>
                        </div>
                    </div>}

                    {/* Pickup Details */}
                    {/* Pickup Details */}
                    {data?.status === "accepted" && <div>
                        <div style={sec}><span style={{ background: "#ffedd5", borderRadius: "6px", padding: "4px 8px" }}>🚐</span> Pickup Details</div>
                        <div className="eq-edit-grid2c">                            <div>
                            <label style={lbl}>Pickup Date</label>
                            <input type="date" name="pickupDate" value={form.pickupDate || ""} onChange={handleChange} style={inp} />
                        </div>
                            <div>
                                <label style={lbl}>Pickup Time</label>
                                <input type="time" name="pickupTime" value={form.pickupTime || ""} onChange={handleChange} style={inp} />
                            </div>
                        </div>
                        <div>
                            <label style={lbl}>Pickup Place</label>
                            <input type="text" name="pickupPlace" value={form.pickupPlace || ""} onChange={handleChange} placeholder="e.g. Chennai Airport T2" style={inp} />
                        </div>
                    </div>}

                    {/* FIT States */}
                    {/* FIT States */}
                    {data?.status === "accepted" && <div>
                        <div style={sec}>
                            <span style={{ background: "#E6F1FB", borderRadius: "6px", padding: "4px 8px" }}>🗺</span> FIT States
                            <span style={{ marginLeft: "auto", fontSize: "11px", background: fitStates.length > 0 ? "#EAF3DE" : "#f1f5f9", color: fitStates.length > 0 ? "#3B6D11" : "#94a3b8", padding: "2px 8px", borderRadius: "10px" }}>
                                {fitStates.length} selected
                            </span>
                        </div>
                        <div style={{ maxHeight: "150px", overflowY: "auto", display: "flex", flexWrap: "wrap", gap: "6px", padding: "10px", background: "#f8fafc", borderRadius: "10px", border: "0.5px solid #e2e8f0" }}>
                            {allStates.map((state) => (
                                <button key={state} type="button" onClick={() => toggleState(state)}
                                    style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 500, cursor: "pointer", border: fitStates.includes(state) ? "none" : "1px solid #e2e8f0", background: fitStates.includes(state) ? "#0C447C" : "#fff", color: fitStates.includes(state) ? "#fff" : "#475569", whiteSpace: "nowrap" }}>
                                    {fitStates.includes(state) ? "✓ " : ""}{state}
                                </button>
                            ))}
                        </div>
                    </div>}

                    {/* Additional Info */}
                    <div>
                        <div style={sec}><span style={{ background: "#ffedd5", borderRadius: "6px", padding: "4px 8px" }}>💬</span> Additional Info</div>
                        <div className="eq-edit-add">                            <div>
                            <label style={lbl}>Special Requests</label>
                            <textarea name="specialRequests" value={form.specialRequests || ""} onChange={handleChange} rows={3}
                                placeholder="e.g. vegetarian meals..."
                                style={{ ...inp, height: "auto", resize: "none" }} />
                        </div>
                            <div>
                                <label style={lbl}>Source</label>
                                <select name="source" value={form.source || ""} onChange={handleChange} style={{ ...inp, appearance: "none" }}>
                                    <option value="">Select source</option>
                                    <option value="Regular">Regular</option>
                                    <option value="Google">Google</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="YouTube">YouTube</option>
                                    <option value="Friends & Family">Friends & Family</option>
                                    <option value="Whatsapp/Referral">Whatsapp/Referral</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ position: "sticky", bottom: 0, background: "#fff", borderTop: "0.5px solid #e2e8f0", padding: "14px 20px", display: "flex", gap: "10px", borderRadius: "0 0 16px 16px" }}>
                    <button onClick={onClose} style={{ flex: 1, padding: "11px", border: "0.5px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc", color: "#64748b", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}>Cancel</button>
                    <button onClick={handleSave} disabled={saving}
                        style={{ flex: 2, padding: "11px", border: "none", borderRadius: "10px", background: saving ? "#93c5fd" : "#2563eb", color: "#fff", fontSize: "13px", cursor: saving ? "not-allowed" : "pointer", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        {saving
                            ? <><div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Saving...</>
                            : "💾 Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// ADMIN ENQUIRY FORM (Raise Enquiry tab)
// ─────────────────────────────────────────────
const AdminEnquiryForm = ({ onSuccess }) => {
    const { adminCreateEnquiry, enquiryLoading } = useContext(TourContext);
    const [submitted, setSubmitted] = useState(null);
    const [formData, setFormData] = useState({
        fullName: "", mobileNumber: "", email: "", city: "",
        destination: "", tourType: "", preferredTravelDate: "",
        numberOfDays: "", numberOfNights: "", specialRequests: "", source: "admin",
    });
    const [counts, setCounts] = useState({ a: 1, c: 0, i: 0 });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => {
            const updated = { ...p, [name]: value };
            if (name === "numberOfDays") {
                const days = Number(value);
                updated.numberOfNights = days > 0 ? String(days - 1) : "";
            }
            return updated;
        });
    };

    const changeCount = (key, delta) => {
        setCounts((prev) => { const u = { ...prev, [key]: Math.max(0, prev[key] + delta) }; if (key === "a" && u[key] < 1) u[key] = 1; return u; });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        const result = await adminCreateEnquiry({ ...formData, adults: counts.a, children: counts.c, infants: counts.i, numberOfDays: Number(formData.numberOfDays), numberOfNights: Number(formData.numberOfNights) });
        if (result.success) {
            setSubmitted(result.fitCode);
            setFormData({ fullName: "", mobileNumber: "", email: "", city: "", destination: "", tourType: "", preferredTravelDate: "", numberOfDays: "", numberOfNights: "", specialRequests: "", source: "admin" });
            setCounts({ a: 1, c: 0, i: 0 });
            setTimeout(() => { setSubmitted(null); if (onSuccess) onSuccess(); }, 3000);
        }
    };

    const inp = { width: "100%", border: "0.5px solid #e2e8f0", borderRadius: "8px", padding: "10px 12px 10px 36px", fontSize: "13px", color: "#1e293b", outline: "none", background: "#f8fafc", boxSizing: "border-box", height: "46px" };
    const lbl = { fontSize: "14px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "5px" };
    const sec = { fontSize: "14px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" };

    return (
        <div>
            <style>{`
                @keyframes spin { to { transform:rotate(360deg); } }
                .aeq-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
                .aeq-trav { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
                .aeq-add  { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
                .aeq-tour-r1 { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
                .aeq-tour-r2 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; }
                @media (max-width:1024px) { .aeq-trav { grid-template-columns:repeat(2,1fr) !important; } }
                @media (max-width:640px) {
                    .aeq-grid    { grid-template-columns:1fr !important; gap:10px !important; }
                    .aeq-trav    { grid-template-columns:1fr !important; gap:10px !important; }
                    .aeq-add     { grid-template-columns:1fr !important; gap:10px !important; }
                    .aeq-tour-r1 { grid-template-columns:1fr !important; gap:10px !important; }
                    .aeq-tour-r2 { grid-template-columns:1fr !important; gap:10px !important; }
                    .aeq-inp     { height:50px !important; font-size:14px !important; padding:12px 12px 12px 36px !important; }
                    .aeq-lbl     { font-size:13px !important; margin-bottom:5px !important; }
                }
            `}</style>

            {submitted && (
                <div style={{ background: "#0C447C", borderRadius: "14px", padding: "20px 24px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#1e6db5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>✅</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "13px", color: "#93c5fd", marginBottom: "4px" }}>Enquiry created successfully!</div>
                            <div style={{ fontSize: "12px", color: "#bfdbfe" }}>FIT Code assigned:</div>
                            <div style={{ fontSize: "28px", fontWeight: 800, color: "#fff", letterSpacing: "2px", fontFamily: "monospace" }}>{submitted}</div>
                            <div style={{ fontSize: "11px", color: "#93c5fd", marginTop: "4px" }}>Switching to All Enquiries in 3 seconds...</div>
                        </div>
                        <button onClick={() => { setSubmitted(null); if (onSuccess) onSuccess(); }} style={{ padding: "8px 16px", background: "transparent", border: "1px solid #3b82f6", borderRadius: "8px", color: "#93c5fd", fontSize: "12px", cursor: "pointer" }}>View Now →</button>
                    </div>
                </div>
            )}

            <div style={{ background: "#E6F1FB", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #bfdbfe" }}>
                <span style={{ fontSize: "20px" }}>🏷</span>
                <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#0C447C" }}>FIT Code Auto-Generation</div>
                    <div style={{ fontSize: "11px", color: "#1e40af" }}>A unique FIT Code will be automatically assigned when submitted.</div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ background: "#fff", borderRadius: "14px", border: "0.5px solid #e2e8f0", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div>
                        <div style={sec}><span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>👤</span>Personal Details</div>
                        <div className="aeq-grid">
                            {[
                                { label: "Full Name *", name: "fullName", placeholder: "Enter full name", required: true },
                                { label: "Mobile Number *", name: "mobileNumber", placeholder: "+91 XXXXX XXXXX", required: true },
                                { label: "Email Address", name: "email", placeholder: "email@example.com", type: "email" },
                                { label: "City / Location", name: "city", placeholder: "e.g. Chennai" },
                            ].map((f) => (
                                <div key={f.name}>
                                    <label className="aeq-lbl" style={lbl}>{f.label}</label>
                                    <input className="aeq-inp" name={f.name} value={formData[f.name]} onChange={handleChange} required={f.required} type={f.type || "text"} placeholder={f.placeholder} style={{ ...inp, paddingLeft: "12px" }} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div style={sec}><span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center" }}>🗺️</span>Tour Details</div>
                        <div className="aeq-tour-r1">
                            <div>
                                <label className="aeq-lbl" style={lbl}>Destination *</label>
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", zIndex: 1 }}>🌍</span>
                                    <input className="aeq-inp" name="destination" value={formData.destination} onChange={(e) => { const v = e.target.value; setFormData(p => ({ ...p, destination: v.charAt(0).toUpperCase() + v.slice(1) })); }} required placeholder="e.g. Kerala" style={inp} />
                                </div>
                            </div>
                            <div>
                                <label className="aeq-lbl" style={lbl}>Tour Type *</label>
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", zIndex: 1 }}>🏷️</span>
                                    <select className="aeq-inp" name="tourType" value={formData.tourType} onChange={handleChange} required style={{ ...inp, appearance: "none" }}>
                                        <option value="">Select type</option>
                                        <option>Group tour(fixed departure)</option><option>Customized/Private tour</option>
                                        <option>Friends</option><option>Family</option><option>Corporate/Team Outing</option>
                                        <option>Honeymoon</option><option>pilgrimage tour</option><option>Others</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="aeq-tour-r2">
                            <div>
                                <label className="aeq-lbl" style={lbl}>Travel Date</label>
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}>📅</span>
                                    <input className="aeq-inp" name="preferredTravelDate" value={formData.preferredTravelDate} onChange={handleChange} type="date" min={new Date().toISOString().split("T")[0]} style={inp} />
                                </div>
                            </div>
                            <div>
                                <label className="aeq-lbl" style={lbl}>No. of Days</label>
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}>🌤️</span>
                                    <input className="aeq-inp" name="numberOfDays" value={formData.numberOfDays} onChange={handleChange} type="number" min="1" placeholder="5" style={inp} />
                                </div>
                            </div>
                            <div>
                                <label className="aeq-lbl" style={lbl}>No. of Nights</label>
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}>🌙</span>
                                    <input className="aeq-inp" name="numberOfNights" value={formData.numberOfNights} onChange={handleChange} type="number" min="0" placeholder="4" style={inp} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div style={sec}><span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center" }}>👥</span>Travellers</div>
                        <div className="aeq-trav">
                            {[
                                { key: "a", label: "Adults", color: "#2563eb", bg: "#dbeafe" },
                                { key: "c", label: "Children (6–10)", color: "#ec4899", bg: "#fce7f3" },
                                { key: "i", label: "Infants (0–5)", color: "#f97316", bg: "#ffedd5" },
                            ].map((t) => (
                                <div key={t.key} style={{ background: "#f8fafc", border: "0.5px solid #e2e8f0", borderRadius: "10px", padding: "12px" }}>
                                    <div style={{ fontSize: "12px", fontWeight: 600, color: t.color, marginBottom: "10px" }}>{t.label}</div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "8px" }}>
                                        <button type="button" onClick={() => changeCount(t.key, -1)} style={{ height: "36px", borderRadius: "8px", background: t.bg, border: "none", color: t.color, fontSize: "20px", cursor: "pointer" }}>−</button>
                                        <span style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", textAlign: "center", minWidth: "28px" }}>{counts[t.key]}</span>
                                        <button type="button" onClick={() => changeCount(t.key, 1)} style={{ height: "36px", borderRadius: "8px", background: t.bg, border: "none", color: t.color, fontSize: "20px", cursor: "pointer" }}>+</button>
                                    </div>
                                </div>
                            ))}
                            <div style={{ background: "#eff6ff", border: "0.5px solid #bfdbfe", borderRadius: "10px", padding: "12px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                                <div style={{ fontSize: "12px", color: "#2563eb", fontWeight: 600, marginBottom: "4px" }}>Total Pax</div>
                                <div style={{ fontSize: "32px", fontWeight: 800, color: "#2563eb" }}>{counts.a + counts.c + counts.i}</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div style={sec}><span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#ffedd5", display: "flex", alignItems: "center", justifyContent: "center" }}>💬</span>Additional Info</div>
                        <div className="aeq-add">
                            <div>
                                <label style={lbl}>Special Requests</label>
                                <textarea name="specialRequests" value={formData.specialRequests} onChange={handleChange} rows={3} placeholder="e.g. vegetarian meals..." style={{ ...inp, height: "auto", resize: "none" }} />
                            </div>
                            <div>
                                <label style={lbl}>Source</label>
                                <select name="source" value={formData.source} onChange={handleChange} style={inp}>
                                    <option value="">Select Source</option>
                                    <option value="Regular">Regular</option>
                                    <option value="Google">Google</option><option value="Facebook">Facebook</option>
                                    <option value="Instagram">Instagram</option><option value="YouTube">YouTube</option>
                                    <option value="Friends & Family">Friends & Family</option>
                                    <option value="Whatsapp/Referral">Whatsapp/Referral</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <button type="submit" disabled={enquiryLoading}
                    style={{ width: "100%", marginTop: "16px", padding: "14px", background: enquiryLoading ? "#93c5fd" : "#2563eb", color: "#fff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: enquiryLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    {enquiryLoading
                        ? <><div style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Creating Enquiry...</>
                        : "✈️ Create Enquiry"}
                </button>
            </form>
        </div>
    );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const TripEnquiries = () => {
    const { getAllEnquiries, enquiries, enquiryLoading, acceptEnquiry, rejectEnquiry, updateEnquiry } = useContext(TourContext); const [activeTab, setActiveTab] = useState("all");
    const [filters, setFilters] = useState({ search: "", destination: "", tourType: "", status: "pending", fromDate: "", toDate: "", raisedBy: "", fitCode: "" });
    const [expandedId, setExpandedId] = useState(null);
    const [modal, setModal] = useState({ open: false, type: "", id: "", name: "", fitCode: "" });
    const [editModal, setEditModal] = useState({ open: false, data: null });
    const [loadingId, setLoadingId] = useState(null);
    const [lastEditedId, setLastEditedId] = useState(() => localStorage.getItem("gv_lastEditedId") || null);
    const [lastEditedFields, setLastEditedFields] = useState(() => {
        try { return JSON.parse(localStorage.getItem("gv_lastEditedFields") || "{}"); } catch { return {}; }
    }); useEffect(() => { getAllEnquiries(); }, []);

    const handleFilter = (e) => { const { name, value } = e.target; setFilters((p) => ({ ...p, [name]: value })); };
    const clearFilters = () => setFilters({ search: "", destination: "", tourType: "", status: "pending", fromDate: "", toDate: "", raisedBy: "", fitCode: "" });
    const filtered = (enquiries || []).filter((e) => {
        const s = filters.search.toLowerCase();
        return (
            (!s || e.fullName?.toLowerCase().includes(s) || e.mobileNumber?.includes(s) || e.email?.toLowerCase().includes(s)) &&
            (!filters.destination || e.destination?.toLowerCase().includes(filters.destination.toLowerCase())) &&
            (!filters.fitCode || e.fitCode?.toLowerCase().includes(filters.fitCode.toLowerCase())) &&
            (!filters.tourType || e.tourType === filters.tourType) &&
            (!filters.status || e.status === filters.status) &&
            (!filters.raisedBy || e.raisedBy === filters.raisedBy) &&
            (!filters.fromDate || new Date(e.createdAt) >= new Date(filters.fromDate)) &&
            (!filters.toDate || new Date(e.createdAt) <= new Date(filters.toDate))
        );
    }).sort((a, b) => {
        // accepted filter → pickup date wise (earliest first)
        if (filters.status === "accepted") {
            const da = a.pickupDate ? new Date(a.pickupDate) : new Date(0);
            const db = b.pickupDate ? new Date(b.pickupDate) : new Date(0);
            return da - db;
        }
        // default → fitCode ascending (GVFIT0001 first)
        const numA = parseInt(a.fitCode?.replace(/\D/g, "") || "0");
        const numB = parseInt(b.fitCode?.replace(/\D/g, "") || "0");
        return numA - numB;
    });

    const openModal = (type, id, name, fitCode = "") => setModal({ open: true, type, id, name, fitCode });
    const closeModal = () => setModal({ open: false, type: "", id: "", name: "", fitCode: "" });

    const handleConfirm = async (extraData = {}) => {
        const { type, id } = modal;
        closeModal();
        setLoadingId(id + "_" + type);
        try {
            if (type === "accept") await acceptEnquiry(id, extraData);
            else if (type === "reject") await rejectEnquiry(id);
        } catch (err) {
            console.error("Accept/Reject Error:", err);
        }
        setLoadingId(null);
        await getAllEnquiries();
    };

    const statusConfig = {
        pending: { bg: "#FAEEDA", color: "#633806", dot: "#EF9F27", label: "Pending" },
        accepted: { bg: "#EAF3DE", color: "#27500A", dot: "#639922", label: "Accepted" },
        rejected: { bg: "#FCEBEB", color: "#501313", dot: "#E24B4A", label: "Rejected" },
    };

    const col = "36px 1.5fr 1fr 1fr 0.9fr 1fr 0.8fr 0.9fr 88px";
    const headers = ["S.No", "Name", "FIT Code", "Destination", "Travel Date", "Enquired On", "Raised By", "Status", "Actions"];
    const fInp = { border: "0.5px solid #e2e8f0", borderRadius: "8px", padding: "7px 10px", fontSize: "12px", outline: "none", background: "#f8fafc", color: "#1e293b", height: "34px", width: "100%" };
    const destFmt = (d) => d ? d.charAt(0).toUpperCase() + d.slice(1).toLowerCase() : "—";
    const P = "11px 11px";

    return (
        <div style={{ padding: "16px 20px", background: "white", minHeight: "100vh", width: "100%", boxSizing: "border-box" }}>
            <style>{`
                @keyframes spin { to { transform:rotate(360deg); } }
                @media (max-width:1000px) { .eq-desk { display:none !important; } }
                @media (min-width:1001px) { .eq-mob  { display:none !important; } }
                .eq-stats { display:grid; gap:10px; grid-template-columns:repeat(6,1fr); }
                @media (max-width:1100px) { .eq-stats { grid-template-columns:repeat(3,1fr) !important; } }
                @media (max-width:600px)  { .eq-stats { grid-template-columns:repeat(2,1fr) !important; } }
                .eq-flt-desk { display:flex; flex-direction:column; gap:10px; }
                @media (max-width:900px) { .eq-flt-mob { display:block !important; } .eq-flt-desk { display:none !important; } }
            `}</style>

            <ConfirmModal open={modal.open} type={modal.type} name={modal.name} fitCode={modal.fitCode} onConfirm={handleConfirm} onCancel={closeModal} />

            <EditEnquiryModal
                open={editModal.open}
                data={editModal.data}
                onClose={() => setEditModal({ open: false, data: null })}
                onSave={async (id, savedData) => {
                    const original = editModal.data;
                    const changed = {};
                    Object.keys(savedData).forEach((key) => {
                        if (String(savedData[key] ?? "") !== String(original[key] ?? "")) {
                            changed[key] = true;
                        }
                    });
                    const result = await updateEnquiry(id, savedData);
                    if (result?.success) {
                        setLastEditedId(id);
                        setLastEditedFields(changed);
                        localStorage.setItem("gv_lastEditedId", String(id));
                        localStorage.setItem("gv_lastEditedFields", JSON.stringify(changed));
                        await getAllEnquiries();
                    }
                    return result;
                }}
            
            />

            {/* Tabs */}
            <div style={{ marginBottom: "16px", textAlign: "center" }}>
                <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a", margin: "0 0 14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>✈️ FIT Enquiries</h1><br />
                <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", borderRadius: "10px", padding: "4px", width: "fit-content", margin: "0 auto" }}>
                    {[{ key: "all", label: "📋 All Enquiries" }, { key: "raise", label: "➕ Raise Enquiry" }].map((t) => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)}
                            style={{ padding: "7px 18px", borderRadius: "7px", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", background: activeTab === t.key ? "#fff" : "transparent", color: activeTab === t.key ? "#0f172a" : "#64748b", boxShadow: activeTab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === "raise" && <AdminEnquiryForm onSuccess={() => { setActiveTab("all"); setFilters(p => ({ ...p, status: "pending" })); getAllEnquiries(); }} />}
            {activeTab === "all" && (
                <>
                    {/* Stats */}
                    <div className="eq-stats" style={{ marginBottom: "14px" }}>
                        {[
                            { label: "Total", count: (enquiries || []).length, bg: "#E6F1FB", color: "#0C447C", icon: "📋" },
                            { label: "Pending", count: (enquiries || []).filter(e => e.status === "pending").length, bg: "#FAEEDA", color: "#633806", icon: "⏳" },
                            { label: "Accepted", count: (enquiries || []).filter(e => e.status === "accepted").length, bg: "#EAF3DE", color: "#27500A", icon: "✅" },
                            { label: "Rejected", count: (enquiries || []).filter(e => e.status === "rejected").length, bg: "#FCEBEB", color: "#501313", icon: "❌" },
                            { label: "By Admin", count: (enquiries || []).filter(e => e.raisedBy === "admin").length, bg: "#FFF7ED", color: "#92400e", icon: "🔧" },
                            { label: "By User", count: (enquiries || []).filter(e => e.raisedBy === "user").length, bg: "#EEEDFE", color: "#26215C", icon: "🌐" },
                        ].map((s, i) => (
                            <div key={i} style={{ background: s.bg, borderRadius: "12px", padding: "12px 14px", position: "relative", overflow: "hidden", minHeight: "70px" }}>
                                <div style={{ position: "absolute", right: "-6px", top: "-6px", fontSize: "40px", opacity: 0.12 }}>{s.icon}</div>
                                <div style={{ fontSize: "24px", fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.count}</div>
                                <div style={{ fontSize: "11px", fontWeight: 500, color: s.color, opacity: 0.85, marginTop: "4px" }}>{s.icon} {s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Filters */}
                    <div className="eq-flt-desk" style={{ background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>SEARCH</label>
                                <input name="search" value={filters.search} onChange={handleFilter} placeholder="Name / mobile / email" style={fInp} />
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>FIT CODE</label>
                                <input name="fitCode" value={filters.fitCode} onChange={handleFilter} placeholder="GVFIT0001" style={fInp} />
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>DESTINATION</label>
                                <input name="destination" value={filters.destination} onChange={handleFilter} placeholder="e.g. Manali" style={fInp} />
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>TOUR TYPE</label>
                                <select name="tourType" value={filters.tourType} onChange={handleFilter} style={fInp}>
                                    <option value="">All types</option>
                                    <option>Group tour(fixed departure)</option>
                                    <option>Customized/Private tour</option>
                                    <option>Friends</option><option>Family</option>
                                    <option>Corporate/Team Outing</option>
                                    <option>Honeymoon</option>
                                    <option>pilgrimage tour</option>
                                    <option>Others</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>STATUS</label>
                                <select name="status" value={filters.status} onChange={handleFilter} style={fInp}>
                                    <option value="">All</option>
                                    <option value="pending">Pending</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>RAISED BY</label>
                                <select name="raisedBy" value={filters.raisedBy} onChange={handleFilter} style={fInp}>
                                    <option value="">All</option>
                                    <option value="user">🌐 User</option>
                                    <option value="admin">🔧 Admin</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>FROM</label>
                                <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilter} style={fInp} />
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>TO</label>
                                <input type="date" name="toDate" value={filters.toDate} onChange={handleFilter} style={fInp} />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                            <button onClick={clearFilters} style={{ padding: "10px 28px", background: "royalblue", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "white", cursor: "pointer" }}>Clear Filters</button>
                            <button onClick={getAllEnquiries} style={{ padding: "10px 24px", background: "royalblue", border: "0.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "whitesmoke", cursor: "pointer" }}>🔄 Refresh</button>
                        </div>
                    </div>

                    {/* Mobile Filters */}
                    <div className="eq-flt-mob" style={{ display: "none" }}>
                        <div style={{ background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                {[
                                    { label: "Search", name: "search", placeholder: "Name / mobile", type: "text" },
                                    { label: "FIT Code", name: "fitCode", placeholder: "GVFIT0001", type: "text" },
                                    { label: "Destination", name: "destination", placeholder: "e.g. Manali", type: "text" },
                                ].map((f) => (
                                    <div key={f.name}>
                                        <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "6px", display: "block" }}>{f.label}</label>
                                        <input name={f.name} value={filters[f.name]} onChange={handleFilter} placeholder={f.placeholder} style={fInp} />
                                    </div>
                                ))}
                                <div>
                                    <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "6px", display: "block" }}>Tour Type</label>
                                    <select name="tourType" value={filters.tourType} onChange={handleFilter} style={fInp}>
                                        <option value="">All types</option>
                                        <option>Group tour(fixed departure)</option>
                                        <option>Customized/Private tour</option>
                                        <option>Friends</option><option>Family</option>
                                        <option>Corporate/Team Outing</option>
                                        <option>Honeymoon</option>
                                        <option>pilgrimage tour</option>
                                        <option>Others</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "6px", display: "block" }}>Status</label>
                                    <select name="status" value={filters.status} onChange={handleFilter} style={fInp}>
                                        <option value="">All</option>
                                        <option value="pending">Pending</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "6px", display: "block" }}>Raised By</label>
                                    <select name="raisedBy" value={filters.raisedBy} onChange={handleFilter} style={fInp}>
                                        <option value="">All</option>
                                        <option value="user">🌐 User</option>
                                        <option value="admin">🔧 Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                                <div>
                                    <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "6px", display: "block" }}>From Date</label>
                                    <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilter} style={fInp} />
                                </div>
                                <div>
                                    <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "6px", display: "block" }}>To Date</label>
                                    <input type="date" name="toDate" value={filters.toDate} onChange={handleFilter} style={fInp} />
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                                <button onClick={clearFilters} style={{ flex: 1, padding: "11px", background: "royalblue", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "white", cursor: "pointer" }}>Clear Filters</button>
                                <button onClick={getAllEnquiries} style={{ flex: 1, padding: "11px", background: "royalblue", border: "0.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "whitesmoke", cursor: "pointer" }}>🔄 Refresh</button>
                            </div>
                        </div>
                    </div>

                    {/* ── MOBILE VIEW ── */}
                    <div className="eq-mob">
                        <div style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #e2e8f0", overflow: "hidden" }}>
                            {enquiryLoading ? (
                                <div style={{ padding: "40px", textAlign: "center" }}>
                                    <div style={{ width: "28px", height: "28px", border: "3px solid #e2e8f0", borderTop: "3px solid #2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
                                    <p style={{ color: "#94a3b8", fontSize: "13px" }}>Loading...</p>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div style={{ padding: "40px", textAlign: "center" }}>
                                    <div style={{ fontSize: "36px", marginBottom: "8px" }}>📭</div>
                                    <p style={{ color: "#94a3b8", fontSize: "14px" }}>No enquiries found</p>
                                </div>
                            ) : filtered.map((e, i) => {
                                const sc = statusConfig[e.status] || statusConfig.pending;
                                const isDone = e.status !== "pending";
                                const isEditBlocked = e.status === "rejected";
                                const isExp = expandedId === e._id;           // ← இது இருக்கா confirm பண்ணுங்க
                                const total = (e.adults || 0) + (e.children || 0) + (e.infants || 0); return (
                                    <div key={e._id} style={{ borderBottom: "0.5px solid #f1f5f9" }}>
                                        <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: isExp ? "#f8fafc" : e.status === "accepted" ? "#f0fdf4" : "#fff" }}
                                            onClick={() => setExpandedId(isExp ? null : e._id)}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                                                <span style={{ minWidth: "22px", height: "22px", borderRadius: "6px", background: "#e2e8f0", color: "#475569", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <p style={{ fontWeight: 600, color: "#0f172a", margin: 0, fontSize: "14px", wordBreak: "break-word", lineHeight: "1.3" }}>{e.fullName}</p>
                                                    <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>{e.destination}</p>
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                                                <span style={{ background: sc.bg, color: sc.color, padding: "3px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: 600 }}>{sc.label}</span>
                                                <span style={{ transform: isExp ? "rotate(90deg)" : "none", transition: "0.2s" }}>▶</span>
                                            </div>
                                        </div>

                                        {isExp && (
                                            <div style={{ padding: "16px", background: "#f8fafc" }}>
                                                {e.fitCode && (
                                                    <div style={{ background: "#E6F1FB", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px" }}>
                                                        <span style={{ fontSize: "13px", color: "#0C447C" }}>FIT Code: </span>
                                                        <span style={{ fontSize: "15px", fontWeight: 800, color: "#0C447C" }}>{e.fitCode}</span>
                                                    </div>
                                                )}
                                                {/* Contact */}
                                                <div style={{ background: "#fff", borderRadius: "10px", padding: "14px", border: "0.5px solid #e2e8f0", marginBottom: "12px" }}>
                                                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0ea5e9", marginBottom: "10px" }}>Contact Details</div>
                                                    <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}>📞 {e.mobileNumber}</div>
                                                    {e.email && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}>✉ {e.email}</div>}
                                                    {e.city && <div style={{ padding: "6px 0" }}>📍 {e.city}</div>}
                                                </div>
                                                {/* Trip */}
                                                <div style={{ background: "#fff", borderRadius: "10px", padding: "14px", border: "0.5px solid #e2e8f0", marginBottom: "12px" }}>
                                                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#059669", marginBottom: "10px" }}>Trip Details</div>
                                                    <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Destination:</strong> {e.destination}</div>
                                                    <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Tour Type:</strong> {e.tourType}</div>
                                                    <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Travel Date:</strong> {e.preferredTravelDate ? new Date(e.preferredTravelDate).toLocaleDateString("en-IN") : "—"}</div>
                                                    {/* Pickup date in red below travel date */}
                                                    {e.pickupDate && (
                                                        <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}>
                                                            <strong style={{ color: "#dc2626" }}>🚐 Pickup:</strong>
                                                            <span style={{ color: "#dc2626", fontWeight: 600, marginLeft: "6px" }}>
                                                                {new Date(e.pickupDate).toLocaleDateString("en-IN")}{e.pickupTime ? ` ${e.pickupTime}` : ""}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div style={{ padding: "6px 0" }}><strong>Duration:</strong> {e.numberOfDays || 0}D / {e.numberOfNights || 0}N</div>
                                                </div>
                                                {/* Travellers */}
                                                <div style={{ background: "#fff", borderRadius: "10px", padding: "14px", border: "0.5px solid #e2e8f0", marginBottom: "12px" }}>
                                                    <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "10px" }}>Travellers ({total} pax)</div>
                                                    <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}>Adults: {e.adults || 0}</div>
                                                    {(e.children || 0) > 0 && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}>Children: {e.children}</div>}
                                                    {(e.infants || 0) > 0 && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}>Infants: {e.infants}</div>}
                                                    {e.source && <div style={{ padding: "6px 0" }}>Source: {e.source}</div>}
                                                </div>
                                                {/* Acceptance Details */}
                                                {e.status === "accepted" && (
                                                    <div style={{ background: "#fff", borderRadius: "10px", padding: "14px", border: "0.5px solid #e2e8f0", marginBottom: "12px" }}>
                                                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#3B6D11", marginBottom: "10px" }}>✅ Acceptance Details</div>
                                                        {e.salesValue && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Sales Value:</strong> ₹{e.salesValue.toLocaleString("en-IN")}</div>}
                                                        {e.pickupDate && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Pickup Date:</strong> {new Date(e.pickupDate).toLocaleDateString("en-IN")}</div>}
                                                        {e.pickupTime && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Pickup Time:</strong> {e.pickupTime}</div>}
                                                        {e.pickupPlace && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Pickup Place:</strong> {e.pickupPlace}</div>}
                                                        {e.fitStates?.length > 0 && (
                                                            <div style={{ marginTop: "10px" }}>
                                                                <div style={{ fontSize: "13px", marginBottom: "6px" }}>FIT States:</div>
                                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                                                    {e.fitStates.map((s, idx) => <span key={idx} style={{ background: "#E6F1FB", color: "#0C447C", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>{s}</span>)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {/* Special Requests */}
                                                {e.specialRequests && (
                                                    <div style={{ background: "#fff", borderRadius: "10px", padding: "14px", border: "0.5px solid #e2e8f0", marginBottom: "16px" }}>
                                                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#7c3aed", marginBottom: "8px" }}>Special Requests</div>
                                                        <div style={{ fontStyle: "italic", color: "#475569" }}>"{e.specialRequests}"</div>
                                                    </div>
                                                )}
                                                {/* Enquired info */}
                                                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
                                                    Enquired on: {new Date(e.createdAt).toLocaleDateString("en-IN")} {new Date(e.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                                    <span style={{ marginLeft: "8px", background: e.raisedBy === "admin" ? "#FFF7ED" : "#EDE9FE", color: e.raisedBy === "admin" ? "#9A3412" : "#5B21B6", padding: "2px 8px", borderRadius: "20px", fontSize: "11px" }}>
                                                        {e.raisedBy === "admin" ? "🔧 Admin" : "🌐 User"}
                                                    </span>
                                                </div>
                                                {/* Action Buttons */}
                                                <div style={{ display: "flex", gap: "10px" }}>
                                                    <button onClick={(ev) => { ev.stopPropagation(); if (!isEditBlocked) setEditModal({ open: true, data: e }); }}
                                                        disabled={isEditBlocked}
                                                        style={{ flex: 1, padding: "12px", background: isEditBlocked ? "#f1f5f9" : "#EEF2FF", color: isEditBlocked ? "#cbd5e1" : "#4338CA", border: "none", borderRadius: "10px", fontWeight: 600, cursor: isEditBlocked ? "not-allowed" : "pointer" }}>
                                                        ✎ Edit
                                                    </button>
                                                    <button onClick={(ev) => { ev.stopPropagation(); !isDone && openModal("accept", e._id, e.fullName, e.fitCode || ""); }} disabled={isDone}
                                                        style={{ flex: 1, padding: "12px", background: isDone ? "#f1f5f9" : "#EAF3DE", color: isDone ? "#cbd5e1" : "#3B6D11", border: "none", borderRadius: "10px", fontWeight: 600, cursor: isDone ? "not-allowed" : "pointer" }}>
                                                        ✓ Accept
                                                    </button>
                                                    <button onClick={(ev) => { ev.stopPropagation(); !isDone && openModal("reject", e._id, e.fullName); }} disabled={isDone}
                                                        style={{ flex: 1, padding: "12px", background: isDone ? "#f1f5f9" : "#FCEBEB", color: isDone ? "#cbd5e1" : "#A32D2D", border: "none", borderRadius: "10px", fontWeight: 600, cursor: isDone ? "not-allowed" : "pointer" }}>
                                                        ✕ Reject
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center", paddingTop: "8px" }}>
                            Showing <strong>{filtered.length}</strong> of <strong>{(enquiries || []).length}</strong> enquiries
                        </div>
                    </div>

                    {/* ── DESKTOP + TAB TABLE ── */}
                    <div className="eq-desk" style={{ width: "100%" }}>
                        <div style={{ background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "14px", overflow: "hidden" }}>
                            <div style={{ display: "grid", gridTemplateColumns: col, background: "#e3effaff", borderBottom: "0.5px solid #e2e8f0" }}>
                                {headers.map((h) => (
                                    <div key={h} style={{ padding: P, fontSize: "11px", fontWeight: 700, color: "#616975ff", letterSpacing: "0.04em", textTransform: h === "S.No" ? "none" : "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h}</div>
                                ))}
                            </div>

                            {enquiryLoading ? (
                                <div style={{ padding: "50px", textAlign: "center" }}>
                                    <div style={{ width: "28px", height: "28px", border: "3px solid #e2e8f0", borderTop: "3px solid #2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
                                    <p style={{ color: "#94a3b8", fontSize: "13px" }}>Loading...</p>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div style={{ padding: "50px", textAlign: "center" }}>
                                    <div style={{ fontSize: "36px", marginBottom: "8px" }}>📭</div>
                                    <p style={{ color: "#94a3b8", fontSize: "14px" }}>No enquiries found</p>
                                </div>
                            ) : filtered.map((e, i) => {
                                const sc = statusConfig[e.status] || statusConfig.pending;
                                const isDone = e.status !== "pending";
                                const isEditBlocked = e.status === "rejected";
                                const isExp = expandedId === e._id;
                                const total = (e.adults || 0) + (e.children || 0) + (e.infants || 0);
                                const isLoading = loadingId === e._id + "_accept" || loadingId === e._id + "_reject";
                                return (
                                    <div key={e._id} style={{ borderBottom: "0.5px solid #f1f5f9" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: col, alignItems: "center", background: isExp ? "#f8fafc" : e.status === "accepted" ? "#f0fdf4" : "#fff", transition: "background 0.1s", cursor: "pointer" }}
                                            onMouseEnter={(ev) => { if (!isExp) ev.currentTarget.style.background = e.status === "accepted" ? "#f0fdf4" : "#f8fafc"; }}
                                            onMouseLeave={(ev) => { if (!isExp) ev.currentTarget.style.background = e.status === "accepted" ? "#f0fdf4" : "#fff"; }}
                                            onClick={() => setExpandedId(isExp ? null : e._id)}>

                                            <div style={{ padding: P, display: "flex", alignItems: "center", gap: "4px" }}>
                                                <span style={{ fontSize: "9px", color: isExp ? "#2563eb" : "#cbd5e1", display: "inline-block", transform: isExp ? "rotate(90deg)" : "none", transition: "transform 0.2s", fontWeight: 700 }}>▶</span>
                                                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>{i + 1}</span>
                                            </div>
                                            <div style={{ padding: P, overflow: "hidden" }}>
                                                <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.fullName}</div>
                                                <div style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>📞 {e.mobileNumber}</div>
                                            </div>
                                            <div style={{ padding: P, overflow: "visible" }}>
                                                {e.fitCode
                                                    ? <span style={{ background: "#E6F1FB", color: "#0C447C", padding: "3px 7px", borderRadius: "5px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.3px", whiteSpace: "nowrap", display: "inline-block" }}>{e.fitCode}</span>
                                                    : <span style={{ color: "#cbd5e1", fontSize: "12px" }}>—</span>}
                                            </div>
                                            <div style={{ padding: P, overflow: "hidden" }}>
                                                <div style={{ fontSize: "13px", fontWeight: 600, color: "#711c66ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{destFmt(e.destination)}</div>
                                                <div style={{ fontSize: "11px", color: "#94a3b8" }}>{e.numberOfDays || 0}D/{e.numberOfNights || 0}N</div>                                            </div>
                                            {/* Travel date + pickup date in red below */}
                                            <div style={{ padding: P, overflow: "hidden" }}>
                                                <div style={{ fontSize: "12px", color: "#475569", whiteSpace: "nowrap" }}>
                                                    {e.preferredTravelDate ? new Date(e.preferredTravelDate).toLocaleDateString("en-IN") : "—"}
                                                </div>
                                                {e.pickupDate && (
                                                    <div style={{ fontSize: "11px", color: "#dc2626", fontWeight: 600, whiteSpace: "nowrap" }}>
                                                        🚐 {new Date(e.pickupDate).toLocaleDateString("en-IN")}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ padding: P, overflow: "hidden" }}>
                                                <div style={{ fontSize: "12px", color: "#475569", fontWeight: 500, whiteSpace: "nowrap" }}>{new Date(e.createdAt).toLocaleDateString("en-IN")}</div>
                                                <div style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>{new Date(e.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                                            </div>
                                            <div style={{ padding: P, overflow: "hidden" }}>
                                                <span style={{ background: e.raisedBy === "admin" ? "#FFF7ED" : "#EDE9FE", color: e.raisedBy === "admin" ? "#9A3412" : "#5B21B6", padding: "3px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap" }}>
                                                    {e.raisedBy === "admin" ? "🔧 Admin" : "🌐 User"}
                                                </span>
                                            </div>
                                            <div style={{ padding: P, overflow: "hidden" }}>
                                                <span style={{ background: sc.bg, color: sc.color, padding: "3px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "3px", whiteSpace: "nowrap" }}>
                                                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: sc.dot, display: "inline-block", flexShrink: 0 }} />{sc.label}
                                                </span>
                                            </div>
                                            <div style={{ padding: P }}>
                                                {isLoading ? (
                                                    <div style={{ width: "14px", height: "14px", border: "2px solid #e2e8f0", borderTop: "2px solid #2563eb", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                                                ) : (
                                                    <div style={{ display: "flex", gap: "3px" }}>
                                                        {/* Edit — blocked when accepted/rejected */}
                                                        <button onClick={(ev) => { ev.stopPropagation(); if (!isEditBlocked) setEditModal({ open: true, data: e }); }}
                                                            disabled={isEditBlocked} title="Edit"
                                                            style={{ width: "26px", height: "26px", borderRadius: "6px", border: "none", background: isEditBlocked ? "#f1f5f9" : "#EEF2FF", color: isEditBlocked ? "#cbd5e1" : "#4338CA", cursor: isEditBlocked ? "not-allowed" : "pointer", opacity: isEditBlocked ? 0.4 : 1, fontSize: "13px" }}>✎</button>
                                                        <button onClick={(ev) => { ev.stopPropagation(); !isDone && openModal("accept", e._id, e.fullName, e.fitCode || ""); }} disabled={isDone}
                                                            style={{ width: "26px", height: "26px", borderRadius: "6px", border: "none", background: isDone ? "#f1f5f9" : "#EAF3DE", color: isDone ? "#cbd5e1" : "#3B6D11", cursor: isDone ? "not-allowed" : "pointer", opacity: isDone ? 0.4 : 1, fontSize: "12px" }}>✓</button>
                                                        <button onClick={(ev) => { ev.stopPropagation(); !isDone && openModal("reject", e._id, e.fullName); }} disabled={isDone}
                                                            style={{ width: "26px", height: "26px", borderRadius: "6px", border: "none", background: isDone ? "#f1f5f9" : "#FCEBEB", color: isDone ? "#cbd5e1" : "#A32D2D", cursor: isDone ? "not-allowed" : "pointer", opacity: isDone ? 0.4 : 1, fontSize: "12px" }}>✕</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded Row */}
                                        {isExp && (
                                            <div style={{ background: "#f8fafc", borderTop: "0.5px solid #e2e8f0", padding: "12px 24px" }}>
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }}>
                                                    {[
                                                        {
                                                            head: "📞 Contact", color: "#0ea5e9",
                                                            rows: [["Full name", e.fullName], ["Mobile", e.mobileNumber], ["Email", e.email || "—"], ["City", e.city || "—"], ["FIT Code", e.fitCode || "—"]],
                                                        },
                                                        {
                                                            head: "✈️ Trip", color: "#059669",
                                                            rows: [["Destination", destFmt(e.destination)], ["Tour type", e.tourType], ["Travel date", e.preferredTravelDate ? new Date(e.preferredTravelDate).toLocaleDateString("en-IN") : "—"], ["Duration", `${e.numberOfDays || 0}D/${e.numberOfNights || 0}N`], ["Pax", `${total}(${e.adults || 0}A ${e.children || 0}C ${e.infants || 0}I)`]],
                                                            pickupDate: e.pickupDate,
                                                            pickupTime: e.pickupTime,
                                                        },
                                                        {
                                                            head: e.status === "accepted" ? "✅ Acceptance" : "👥 More Info", color: e.status === "accepted" ? "#3B6D11" : "#7c3aed",
                                                            rows: e.status === "accepted"
                                                                ? [["Sales Value", e.salesValue ? `₹${e.salesValue.toLocaleString("en-IN")}` : "—"], ["Pickup Date", e.pickupDate ? new Date(e.pickupDate).toLocaleDateString("en-IN") : "—"], ["Pickup Time", e.pickupTime || "—"], ["Pickup Place", e.pickupPlace || "—"], ["Source", e.source || "—"], ["Raised By", e.raisedBy === "admin" ? "🔧 Admin" : "🌐 User"]]
                                                                : [["Adults", `${e.adults || 0}`], ["Children", `${e.children || 0}`], ["Infants", `${e.infants || 0}`], ["Source", e.source || "—"], ["Raised By", e.raisedBy === "admin" ? "🔧 Admin" : "🌐 User"]],
                                                            extra: e.specialRequests,
                                                            fitStates: e.status === "accepted" ? e.fitStates : null,
                                                        },
                                                    ].map((card) => (
                                                        <div key={card.head} style={{ background: "#fff", borderRadius: "10px", padding: "12px 14px", border: "0.5px solid #e2e8f0" }}>
                                                            <div style={{ fontSize: "11px", fontWeight: 700, color: card.color, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>{card.head}</div>
                                                            {card.rows.map(([k, v]) => (
                                                                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "0.5px solid #f8fafc" }}>
                                                                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>{k}</span>
                                                                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#1e293b", textAlign: "right", maxWidth: "60%", wordBreak: "break-word" }}>{v}</span>
                                                                </div>
                                                            ))}
                                                            {/* Pickup date in red under Trip card */}
                                                            {card.head.includes("Trip") && card.pickupDate && (
                                                                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "0.5px solid #f8fafc" }}>
                                                                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>Pickup date</span>
                                                                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#dc2626" }}>
                                                                        🚐 {new Date(card.pickupDate).toLocaleDateString("en-IN")}{card.pickupTime ? ` ${card.pickupTime}` : ""}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {card.fitStates?.length > 0 && (
                                                                <div style={{ marginTop: "6px" }}>
                                                                    <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "5px" }}>FIT STATES</div>
                                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                                                        {card.fitStates.map(s => <span key={s} style={{ background: "#E6F1FB", color: "#0C447C", padding: "3px 9px", borderRadius: "10px", fontSize: "11px", fontWeight: 500 }}>{s}</span>)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {card.extra && (
                                                                <div style={{ marginTop: "6px", background: "#f8fafc", borderRadius: "6px", padding: "6px 8px" }}>
                                                                    <div style={{ fontSize: "10px", color: "#eb3d09ff", marginBottom: "2px" }}>Special requests</div>
                                                                    <div style={{ fontSize: "11px", color: "#885dabff", fontStyle: "italic" }}>"{card.extra}"</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <div style={{ padding: "8px 12px", borderTop: "0.5px solid #f1f5f9", fontSize: "11px", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
                                <span>Showing <strong>{filtered.length}</strong> of <strong>{(enquiries || []).length}</strong> enquiries</span>
                                <span>▶ click row to expand</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TripEnquiries;


