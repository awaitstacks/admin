// /**
//  * Invoice.jsx
//  * --------------------------------------
//  * Standalone PAGE (own route) — /invoice/:tnr
//  *
//  * Route setup (in your router file, e.g. App.jsx):
//  *   import Invoice from "./pages/Invoice"; // adjust path
//  *   <Route path="/invoice/:tnr" element={<Invoice />} />
//  *
//  * Requires: npm install html2canvas jspdf
//  */

// import React, { useContext, useEffect, useRef, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { ArrowLeft, Download, Loader2, CheckCircle2, Clock, Pencil, Plus, Trash2, Save, X } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
// import { TourContext } from "../../context/TourContext"; // ← adjust path/name to your app's context
// import logo from "/src/assets/TM.png"; // ← adjust path to wherever you save the logo

// // ── Design tokens ─────────────────────────────────────────────────────────
// const TOKENS = {
//   ink: "#1E2A22",
//   inkSoft: "#5A6B5F",
//   teal: "#1B7A3D",
//   tealDeep: "#145C2E",
//   gold: "#C0392B",
//   emerald: "#1B7A3D",
//   parchment: "#FFFFFF",
//   page: "#F2FBF5",
//   line: "#D6EAD9",
//   lineSoft: "#E7F4EA",
// };

// const currency = (n) =>
//   `₹${Number(n || 0).toLocaleString("en-IN", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   })}`;

// const formatDate = (d) =>
//   d
//     ? new Date(d).toLocaleDateString("en-IN", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//       })
//     : "—";

// const StatusStamp = ({ isPaid }) => {
//   const color = isPaid ? TOKENS.emerald : TOKENS.gold;
//   const label = isPaid ? "PAID IN FULL" : "PART PAID";
//   return (
//     <div className="stamp-badge" style={{ borderColor: color, color }}>
//       <div className="stamp-inner" style={{ borderColor: color }}>
//         {isPaid ? (
//           <CheckCircle2 size={18} strokeWidth={2.25} />
//         ) : (
//           <Clock size={18} strokeWidth={2.25} />
//         )}
//         <span>{label}</span>
//       </div>
//     </div>
//   );
// };

// const Invoice = () => {
//   const { tnr } = useParams();
//   const navigate = useNavigate();
//   const { getBookingInvoice, updateBookingInvoice } = useContext(TourContext);

//   const [invoice, setInvoice] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [downloading, setDownloading] = useState(false);
//   const printRef = useRef(null);

//   // ── Edit mode state ──────────────────────────────────────────────────
//   const [isEditing, setIsEditing] = useState(false);
//   const [draft, setDraft] = useState(null); // working copy while editing
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     const fetchInvoice = async () => {
//       setLoading(true);
//       setError("");
//       try {
//         const response = await getBookingInvoice(tnr);
//         if (response.success && response.invoice) {
//           setInvoice(response.invoice);
//         } else {
//           setError(response.message || "Invoice not available yet");
//         }
//       } catch (err) {
//         console.error("Fetch invoice error:", err);
//         setError(err.message || "Failed to load invoice");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (tnr) fetchInvoice();
//   }, [tnr, getBookingInvoice]);

//   // ── Recalculation helpers (forward GST calc — admin enters ex-GST rate) ─
//   const round2 = (n) => Math.round(Number(n || 0) * 100) / 100;

//   const recalcItem = (item) => {
//     const qty = Number(item.quantity) || 0;
//     const rate = Number(item.rate) || 0;
//     const gstRate = Number(item.gstRate) || 0;
//     const amount = round2(qty * rate);
//     const gstTotal = round2((amount * gstRate) / 100);
//     const cgst = round2(gstTotal / 2);
//     const sgst = round2(gstTotal - cgst);
//     const total = round2(amount + cgst + sgst);
//     return { ...item, amount, cgst, sgst, total };
//   };

//   const recalcDraftTotals = (d) => {
//     const items = d.items || [];
//     const amountSum = round2(items.reduce((s, i) => s + Number(i.amount || 0), 0));
//     const cgstSum = round2(items.reduce((s, i) => s + Number(i.cgst || 0), 0));
//     const sgstSum = round2(items.reduce((s, i) => s + Number(i.sgst || 0), 0));
//     const roundOff = Number(d.totals?.roundOff || 0);
//     const grandTotal = round2(amountSum + cgstSum + sgstSum + roundOff);
//     const amountPaid = round2(d.amountPaid || 0);
//     const dueAmount = Math.max(0, round2(grandTotal - amountPaid));
//     return {
//       ...d,
//       totals: { amount: amountSum, cgst: cgstSum, sgst: sgstSum, roundOff, grandTotal },
//       dueAmount,
//     };
//   };

//   const startEditing = () => {
//     setDraft(JSON.parse(JSON.stringify(invoice))); // deep copy
//     setIsEditing(true);
//   };

//   const cancelEditing = () => {
//     setDraft(null);
//     setIsEditing(false);
//   };

//   const updateBilledTo = (field, value) => {
//     setDraft((prev) => ({
//       ...prev,
//       billedTo: { ...prev.billedTo, [field]: value },
//     }));
//   };

//   const updateItemField = (idx, field, value) => {
//     setDraft((prev) => {
//       const items = [...prev.items];
//       items[idx] = recalcItem({ ...items[idx], [field]: value });
//       return recalcDraftTotals({ ...prev, items });
//     });
//   };

//   const addItemRow = () => {
//     setDraft((prev) => {
//       const items = [
//         ...prev.items,
//         {
//           description: "New Item",
//           subDescription: "",
//           gstRate: 0,
//           quantity: 1,
//           rate: 0,
//           amount: 0,
//           cgst: 0,
//           sgst: 0,
//           total: 0,
//         },
//       ];
//       return recalcDraftTotals({ ...prev, items });
//     });
//   };

//   const removeItemRow = (idx) => {
//     setDraft((prev) => {
//       const items = prev.items.filter((_, i) => i !== idx);
//       return recalcDraftTotals({ ...prev, items });
//     });
//   };

//   const updateRoundOff = (value) => {
//     setDraft((prev) =>
//       recalcDraftTotals({
//         ...prev,
//         totals: { ...prev.totals, roundOff: Number(value) || 0 },
//       }),
//     );
//   };

//   const updateAmountPaid = (value) => {
//     setDraft((prev) => recalcDraftTotals({ ...prev, amountPaid: Number(value) || 0 }));
//   };

//   const updatePaymentField = (idx, field, value) => {
//     setDraft((prev) => {
//       const payments = [...prev.payments];
//       payments[idx] = { ...payments[idx], [field]: value };
//       return { ...prev, payments };
//     });
//   };

//   const addPaymentRow = () => {
//     setDraft((prev) => ({
//       ...prev,
//       payments: [...(prev.payments || []), { date: new Date(), amountReceived: 0 }],
//     }));
//   };

//   const removePaymentRow = (idx) => {
//     setDraft((prev) => ({
//       ...prev,
//       payments: prev.payments.filter((_, i) => i !== idx),
//     }));
//   };

//   const applyChanges = async () => {
//     if (!draft) return;
//     setSaving(true);
//     try {
//       const response = await updateBookingInvoice(tnr, draft);
//       if (response.success && response.invoice) {
//         setInvoice(response.invoice);
//         setIsEditing(false);
//         setDraft(null);
//         toast.success("Invoice saved");
//       } else {
//         toast.error(response.message || "Failed to save invoice");
//       }
//     } catch (err) {
//       console.error("Save invoice error:", err);
//       toast.error(err.message || "Failed to save invoice");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const isPaid = invoice?.status === "Paid";
//   const docLabel = isPaid ? "Invoice" : "Receipt";

//   const totalPaid = (invoice?.payments || []).reduce(
//     (sum, p) => sum + Number(p.amountReceived || 0),
//     0,
//   );

//   const handleDownload = async () => {
//     if (!printRef.current || !invoice) return;
//     setDownloading(true);
//     try {
//       const canvas = await html2canvas(printRef.current, {
//         scale: 2,
//         useCORS: true,
//         backgroundColor: TOKENS.parchment,
//       });
//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new jsPDF("p", "mm", "a4");
//       const pageWidth = pdf.internal.pageSize.getWidth();
//       const pageHeight = pdf.internal.pageSize.getHeight();
//       const imgWidth = pageWidth;
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;

//       let heightLeft = imgHeight;
//       let position = 0;

//       pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
//       heightLeft -= pageHeight;

//       while (heightLeft > 0) {
//         position = heightLeft - imgHeight;
//         pdf.addPage();
//         pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
//         heightLeft -= pageHeight;
//       }

//       pdf.save(`${docLabel}-${invoice.invoiceNumber}.pdf`);
//       toast.success(`${docLabel} downloaded`);
//     } catch (err) {
//       console.error("PDF download failed:", err);
//       toast.error("Failed to generate PDF");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   return (
//     <div className="invoice-page" style={{ background: TOKENS.page }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

//         .invoice-page {
//           min-height: 100vh;
//           padding: 20px 16px 60px;
//           font-family: 'Inter', -apple-system, sans-serif;
//           color: ${TOKENS.ink};
//         }
//         @media (min-width: 640px) {
//           .invoice-page { padding: 32px 24px 80px; }
//         }

//         .invoice-shell { max-width: 880px; margin: 0 auto; }

//         .invoice-topbar {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           gap: 12px;
//           margin-bottom: 18px;
//           flex-wrap: wrap;
//         }

//         .btn-ghost {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           padding: 9px 16px;
//           font-size: 13.5px;
//           font-weight: 500;
//           border-radius: 8px;
//           border: 1px solid ${TOKENS.line};
//           background: ${TOKENS.parchment};
//           color: ${TOKENS.inkSoft};
//           cursor: pointer;
//           transition: border-color 0.15s ease;
//         }
//         .btn-ghost:hover { border-color: ${TOKENS.teal}; color: ${TOKENS.teal}; }

//         .btn-download {
//           display: inline-flex;
//           align-items: center;
//           gap: 8px;
//           padding: 10px 20px;
//           font-size: 13.5px;
//           font-weight: 600;
//           letter-spacing: 0.01em;
//           border-radius: 8px;
//           border: none;
//           color: #fff;
//           background: ${TOKENS.tealDeep};
//           cursor: pointer;
//           transition: background 0.15s ease, transform 0.1s ease;
//         }
//         .btn-download:hover { background: ${TOKENS.teal}; }
//         .btn-download:active { transform: translateY(1px); }
//         .btn-download:disabled { opacity: 0.55; cursor: not-allowed; }

//         .doc-card {
//           background: ${TOKENS.parchment};
//           border: 1px solid ${TOKENS.line};
//           border-radius: 14px;
//           padding: 28px 20px;
//           box-shadow: 0 1px 3px rgba(21,35,34,0.06), 0 8px 24px rgba(21,35,34,0.05);
//         }
//         @media (min-width: 640px) {
//           .doc-card { padding: 44px 48px; }
//         }

//         .doc-header {
//           display: flex;
//           align-items: flex-start;
//           justify-content: space-between;
//           gap: 16px;
//           padding-bottom: 22px;
//           margin-bottom: 26px;
//           border-bottom: 1px solid ${TOKENS.line};
//           flex-wrap: wrap;
//         }

//         .doc-title {
//           font-family: 'Inter', sans-serif;
//           font-weight: 800;
//           font-size: 34px;
//           letter-spacing: -0.01em;
//           color: ${TOKENS.tealDeep};
//           margin: 0;
//         }
//         @media (min-width: 640px) {
//           .doc-title { font-size: 40px; }
//         }

//         .brand-block { text-align: right; }
//         .brand-logo {
//           height: 64px;
//           width: auto;
//           object-fit: contain;
//         }
//         @media (min-width: 640px) {
//           .brand-logo { height: 76px; }
//         }

//         .stamp-badge {
//           border: 2px dashed;
//           border-radius: 999px;
//           padding: 3px;
//           transform: rotate(-4deg);
//           display: inline-flex;
//         }
//         .stamp-inner {
//           border: 1px solid;
//           border-radius: 999px;
//           padding: 5px 14px 5px 12px;
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           font-size: 11.5px;
//           font-weight: 700;
//           letter-spacing: 0.06em;
//           white-space: nowrap;
//         }

//         .meta-strip {
//           display: flex;
//           flex-direction: column;
//           gap: 0;
//           margin-bottom: 26px;
//           padding: 4px 18px;
//           background: ${TOKENS.page};
//           border-radius: 10px;
//         }
//         .meta-item {
//           display: flex;
//           align-items: baseline;
//           justify-content: space-between;
//           gap: 16px;
//           padding: 12px 0;
//         }
//         .meta-item + .meta-item {
//           border-top: 1px solid ${TOKENS.lineSoft};
//         }
//         .meta-label {
//           font-size: 10.5px;
//           text-transform: uppercase;
//           letter-spacing: 0.08em;
//           color: ${TOKENS.inkSoft};
//           white-space: nowrap;
//         }
//         .meta-value {
//           font-size: 15px;
//           font-weight: 600;
//           color: ${TOKENS.ink};
//           text-align: right;
//         }

//         .party-grid {
//           display: grid;
//           grid-template-columns: 1fr;
//           gap: 18px;
//           margin-bottom: 24px;
//         }
//         @media (min-width: 640px) {
//           .party-grid { grid-template-columns: 1fr 1fr; }
//         }
//         .party-card {
//           border-left: 3px solid ${TOKENS.teal};
//           padding: 4px 0 4px 16px;
//         }
//         .party-label {
//           font-size: 10.5px;
//           text-transform: uppercase;
//           letter-spacing: 0.08em;
//           color: ${TOKENS.teal};
//           font-weight: 700;
//           margin-bottom: 6px;
//         }
//         .party-name { font-weight: 700; font-size: 15.5px; margin-bottom: 4px; }
//         .party-line { font-size: 13px; color: ${TOKENS.inkSoft}; line-height: 1.6; }
//         .party-detail { font-size: 13px; margin-top: 2px; }
//         .party-detail strong { color: ${TOKENS.ink}; font-weight: 600; }

//         .supply-row {
//           display: flex;
//           justify-content: space-between;
//           font-size: 12.5px;
//           color: ${TOKENS.inkSoft};
//           margin-bottom: 16px;
//           flex-wrap: wrap;
//           gap: 8px;
//         }
//         .supply-row strong { color: ${TOKENS.ink}; }

//         .items-scroll { overflow-x: auto; margin: 0 -4px 26px; padding: 0 4px; }
//         .items-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 620px; }
//         .items-table thead th {
//           background: ${TOKENS.tealDeep};
//           color: #fff;
//           text-align: left;
//           font-weight: 600;
//           font-size: 11.5px;
//           text-transform: uppercase;
//           letter-spacing: 0.04em;
//           padding: 11px 12px;
//         }
//         .items-table thead th:first-child { border-radius: 8px 0 0 8px; }
//         .items-table thead th:last-child { border-radius: 0 8px 8px 0; }
//         .items-table tbody tr:not(:last-child) { border-bottom: 1px solid ${TOKENS.lineSoft}; }
//         .items-table td { padding: 12px; vertical-align: top; }
//         .item-desc { font-weight: 600; color: ${TOKENS.ink}; }
//         .item-sub { font-size: 11.5px; color: ${TOKENS.inkSoft}; margin-top: 2px; }
//         .item-total { font-weight: 700; }

//         .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 22px; }
//         .totals-box { width: 100%; }
//         @media (min-width: 480px) { .totals-box { width: 300px; } }
//         .totals-row {
//           display: flex;
//           justify-content: space-between;
//           font-size: 13.5px;
//           padding: 6px 0;
//           color: ${TOKENS.inkSoft};
//         }
//         .totals-row.grand {
//           border-top: 1.5px solid ${TOKENS.ink};
//           margin-top: 4px;
//           padding-top: 10px;
//           font-weight: 700;
//           font-size: 16px;
//           color: ${TOKENS.ink};
//         }
//         .totals-row.paid { color: ${TOKENS.emerald}; font-weight: 600; }
//         .totals-row.due {
//           font-weight: 700;
//           color: #fff;
//           background: ${TOKENS.gold};
//           border-radius: 7px;
//           padding: 8px 10px;
//           margin-top: 8px;
//         }
//         .totals-row.due.settled { background: ${TOKENS.emerald}; }

//         .payments-title {
//           font-size: 11.5px;
//           text-transform: uppercase;
//           letter-spacing: 0.08em;
//           color: ${TOKENS.teal};
//           font-weight: 700;
//           margin-bottom: 10px;
//         }
//         .payments-table { width: 100%; border-collapse: collapse; font-size: 13px; }
//         .payments-table th {
//           text-align: left;
//           font-size: 11px;
//           text-transform: uppercase;
//           color: ${TOKENS.inkSoft};
//           padding: 6px 8px;
//           border-bottom: 1.5px solid ${TOKENS.line};
//         }
//         .payments-table td { padding: 8px; border-bottom: 1px solid ${TOKENS.lineSoft}; }
//         .payments-table tr.total-row td { border-bottom: none; font-weight: 700; padding-top: 10px; }

//         .state-card {
//           background: ${TOKENS.parchment};
//           border: 1px solid ${TOKENS.line};
//           border-radius: 14px;
//           padding: 60px 20px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 10px;
//           color: ${TOKENS.inkSoft};
//         }
//         .state-card.error { color: #A13B2E; }

//         /* ── Edit mode ── */
//         .edit-stack { display: flex; flex-direction: column; gap: 6px; }
//         .edit-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
//         .edit-input {
//           font-family: 'Inter', sans-serif;
//           font-size: 13px;
//           padding: 6px 8px;
//           border: 1px solid ${TOKENS.line};
//           border-radius: 6px;
//           background: #fff;
//           color: ${TOKENS.ink};
//           width: 100%;
//         }
//         .edit-input:focus {
//           outline: none;
//           border-color: ${TOKENS.teal};
//         }
//         .cell-input { min-width: 90px; }
//         .cell-num { text-align: right; }
//         .icon-btn {
//           border: none;
//           background: transparent;
//           cursor: pointer;
//           padding: 6px;
//           border-radius: 6px;
//           display: inline-flex;
//           color: ${TOKENS.inkSoft};
//         }
//         .icon-btn:hover { background: ${TOKENS.lineSoft}; }
//         .icon-btn.danger { color: #A13B2E; }
//         .icon-btn.danger:hover { background: #FBE9E7; }

//         .item-cards { display: flex; flex-direction: column; gap: 14px; margin-bottom: 26px; }
//         .item-edit-card {
//           border: 1px solid ${TOKENS.line};
//           border-radius: 10px;
//           padding: 14px;
//           background: #fff;
//         }
//         .item-edit-top {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           margin-bottom: 10px;
//         }
//         .item-edit-index {
//           font-size: 11px;
//           text-transform: uppercase;
//           letter-spacing: 0.06em;
//           color: ${TOKENS.inkSoft};
//           font-weight: 700;
//         }
//         .remove-item-btn {
//           display: inline-flex;
//           align-items: center;
//           gap: 5px;
//           font-size: 12.5px;
//           font-weight: 600;
//           color: #A13B2E;
//           background: #FBE9E7;
//           border: 1px solid #F0C7C0;
//           border-radius: 7px;
//           padding: 6px 10px;
//           cursor: pointer;
//           white-space: nowrap;
//         }
//         .remove-item-btn:hover { background: #F6D5D0; }
//         .item-edit-grid {
//           display: grid;
//           grid-template-columns: repeat(3, 1fr);
//           gap: 8px;
//           margin-top: 8px;
//         }
//         .item-edit-grid label {
//           font-size: 10.5px;
//           text-transform: uppercase;
//           letter-spacing: 0.05em;
//           color: ${TOKENS.inkSoft};
//           display: flex;
//           flex-direction: column;
//           gap: 3px;
//         }
//         .item-edit-summary {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 14px;
//           margin-top: 12px;
//           padding-top: 10px;
//           border-top: 1px dashed ${TOKENS.lineSoft};
//           font-size: 12.5px;
//           color: ${TOKENS.inkSoft};
//         }
//         .item-edit-total { font-weight: 700; color: ${TOKENS.ink}; }
//       `}</style>

//       <ToastContainer position="top-right" autoClose={3000} />

//       <div className="invoice-shell">
//         <div className="invoice-topbar">
//           <button onClick={() => navigate(-1)} className="btn-ghost">
//             <ArrowLeft size={15} /> Back
//           </button>

//           {invoice && !isEditing && (
//             <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
//               <button onClick={startEditing} className="btn-ghost">
//                 <Pencil size={15} /> Edit
//               </button>
//               <button
//                 onClick={handleDownload}
//                 disabled={downloading}
//                 className="btn-download"
//               >
//                 {downloading ? (
//                   <Loader2 size={15} className="animate-spin" />
//                 ) : (
//                   <Download size={15} />
//                 )}
//                 {downloading ? "Preparing…" : `Download ${docLabel}`}
//               </button>
//             </div>
//           )}

//           {isEditing && (
//             <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
//               <button onClick={cancelEditing} className="btn-ghost" disabled={saving}>
//                 <X size={15} /> Cancel
//               </button>
//               <button onClick={applyChanges} className="btn-download" disabled={saving}>
//                 {saving ? (
//                   <Loader2 size={15} className="animate-spin" />
//                 ) : (
//                   <Save size={15} />
//                 )}
//                 {saving ? "Saving…" : "Save Changes"}
//               </button>
//             </div>
//           )}
//         </div>

//         {loading && (
//           <div className="state-card">
//             <Loader2 className="animate-spin" size={18} />
//             Loading invoice…
//           </div>
//         )}

//         {!loading && error && <div className="state-card error">{error}</div>}

//         {!loading && !error && invoice && (
//           <div ref={printRef} className="doc-card">
//             {/* Header */}
//             <div className="doc-header">
//               <div>
//                 <h1 className="doc-title">{docLabel}</h1>
//                 <div style={{ marginTop: 10 }}>
//                   <StatusStamp isPaid={isPaid} />
//                 </div>
//               </div>
//               <div className="brand-block">
//                 <img src={logo} alt="GV - Tour Planners" className="brand-logo" />
//               </div>
//             </div>

//             {/* Meta */}
//             <div className="meta-strip">
//               <div className="meta-item">
//                 <p className="meta-label">{docLabel} No.</p>
//                 <p className="meta-value">{invoice.invoiceNumber}</p>
//               </div>
//               <div className="meta-item">
//                 <p className="meta-label">Purchase Date</p>
//                 <p className="meta-value">{formatDate(invoice.purchaseDate)}</p>
//               </div>
//               <div className="meta-item">
//                 <p className="meta-label">Due Date</p>
//                 <p className="meta-value">{formatDate(invoice.dueDate)}</p>
//               </div>
//               <div className="meta-item">
//                 <p className="meta-label">Tour Code</p>
//                 <p className="meta-value">{invoice.tourCode}</p>
//               </div>
//             </div>

//             {/* Billed By / Billed To */}
//             <div className="party-grid">
//               <div className="party-card">
//                 <p className="party-label">Billed By</p>
//                 <p className="party-name">{invoice.billedBy?.companyName}</p>
//                 <p className="party-line">
//                   {invoice.billedBy?.addressLine1}, {invoice.billedBy?.city}
//                   <br />
//                   {invoice.billedBy?.state}, {invoice.billedBy?.country} -{" "}
//                   {invoice.billedBy?.pincode}
//                 </p>
//                 <p className="party-detail">
//                   <strong>GSTIN</strong> {invoice.billedBy?.gstin}
//                 </p>
//                 <p className="party-detail">
//                   <strong>PAN</strong> {invoice.billedBy?.pan}
//                 </p>
//                 <p className="party-detail">
//                   <strong>Phone</strong> {invoice.billedBy?.phone}
//                 </p>
//                 <p className="party-detail">
//                   <strong>TAN</strong> {invoice.billedBy?.tan}
//                 </p>
//               </div>

//               <div className="party-card">
//                 <p className="party-label">Billed To</p>
//                 {isEditing ? (
//                   <div className="edit-stack">
//                     <input
//                       className="edit-input"
//                       value={draft.billedTo?.name || ""}
//                       placeholder="Name"
//                       onChange={(e) => updateBilledTo("name", e.target.value)}
//                     />
//                     <input
//                       className="edit-input"
//                       value={draft.billedTo?.addressLine1 || ""}
//                       placeholder="Address line 1"
//                       onChange={(e) => updateBilledTo("addressLine1", e.target.value)}
//                     />
//                     <input
//                       className="edit-input"
//                       value={draft.billedTo?.addressLine2 || ""}
//                       placeholder="Address line 2"
//                       onChange={(e) => updateBilledTo("addressLine2", e.target.value)}
//                     />
//                     <div className="edit-row-3">
//                       <input
//                         className="edit-input"
//                         value={draft.billedTo?.city || ""}
//                         placeholder="City"
//                         onChange={(e) => updateBilledTo("city", e.target.value)}
//                       />
//                       <input
//                         className="edit-input"
//                         value={draft.billedTo?.state || ""}
//                         placeholder="State"
//                         onChange={(e) => updateBilledTo("state", e.target.value)}
//                       />
//                       <input
//                         className="edit-input"
//                         value={draft.billedTo?.pincode || ""}
//                         placeholder="Pincode"
//                         onChange={(e) => updateBilledTo("pincode", e.target.value)}
//                       />
//                     </div>
//                     <input
//                       className="edit-input"
//                       value={draft.billedTo?.phone || ""}
//                       placeholder="Phone"
//                       onChange={(e) => updateBilledTo("phone", e.target.value)}
//                     />
//                   </div>
//                 ) : (
//                   <>
//                     <p className="party-name">{invoice.billedTo?.name}</p>
//                     <p className="party-line">
//                       {invoice.billedTo?.addressLine1}
//                       {invoice.billedTo?.addressLine2 && (
//                         <>, {invoice.billedTo.addressLine2}</>
//                       )}
//                       <br />
//                       {invoice.billedTo?.city}, {invoice.billedTo?.state},{" "}
//                       {invoice.billedTo?.country} - {invoice.billedTo?.pincode}
//                     </p>
//                     <p className="party-detail">
//                       <strong>Phone</strong> {invoice.billedTo?.phone}
//                     </p>
//                   </>
//                 )}
//               </div>
//             </div>

//             {(invoice.countryOfSupply || invoice.placeOfSupply) && (
//               <div className="supply-row">
//                 <span>
//                   <strong>Country of Supply</strong> {invoice.countryOfSupply}
//                 </span>
//                 <span>
//                   <strong>Place of Supply</strong> {invoice.placeOfSupply}
//                 </span>
//               </div>
//             )}

//             {/* Items */}
//             {isEditing ? (
//               <div className="item-cards">
//                 {draft.items.map((item, idx) => (
//                   <div key={idx} className="item-edit-card">
//                     <div className="item-edit-top">
//                       <span className="item-edit-index">Item {idx + 1}</span>
//                       <button
//                         type="button"
//                         className="remove-item-btn"
//                         onClick={() => removeItemRow(idx)}
//                       >
//                         <Trash2 size={14} /> Remove Item
//                       </button>
//                     </div>

//                     <input
//                       className="edit-input"
//                       value={item.description}
//                       placeholder="Description"
//                       onChange={(e) =>
//                         updateItemField(idx, "description", e.target.value)
//                       }
//                     />
//                     <input
//                       className="edit-input"
//                       style={{ marginTop: 6 }}
//                       value={item.subDescription || ""}
//                       placeholder="Sub-description (optional)"
//                       onChange={(e) =>
//                         updateItemField(idx, "subDescription", e.target.value)
//                       }
//                     />

//                     <div className="item-edit-grid">
//                       <label>
//                         GST %
//                         <input
//                           type="number"
//                           className="edit-input"
//                           value={item.gstRate}
//                           onChange={(e) =>
//                             updateItemField(idx, "gstRate", e.target.value)
//                           }
//                         />
//                       </label>
//                       <label>
//                         Qty
//                         <input
//                           type="number"
//                           className="edit-input"
//                           value={item.quantity}
//                           onChange={(e) =>
//                             updateItemField(idx, "quantity", e.target.value)
//                           }
//                         />
//                       </label>
//                       <label>
//                         Rate
//                         <input
//                           type="number"
//                           className="edit-input"
//                           value={item.rate}
//                           onChange={(e) =>
//                             updateItemField(idx, "rate", e.target.value)
//                           }
//                         />
//                       </label>
//                     </div>

//                     <div className="item-edit-summary">
//                       <span>Amount {currency(item.amount)}</span>
//                       <span>CGST {currency(item.cgst)}</span>
//                       <span>SGST {currency(item.sgst)}</span>
//                       <span className="item-edit-total">
//                         Total {currency(item.total)}
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//                 <button type="button" className="btn-ghost" onClick={addItemRow}>
//                   <Plus size={14} /> Add Item
//                 </button>
//               </div>
//             ) : (
//               <div className="items-scroll">
//                 <table className="items-table">
//                   <thead>
//                     <tr>
//                       <th>Item</th>
//                       <th>GST</th>
//                       <th>Qty</th>
//                       <th>Rate</th>
//                       <th>Amount</th>
//                       <th>CGST</th>
//                       <th>SGST</th>
//                       <th>Total</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {(invoice.items || []).map((item, idx) => (
//                       <tr key={idx}>
//                         <td>
//                           <p className="item-desc">{item.description}</p>
//                           {item.subDescription && (
//                             <p className="item-sub">{item.subDescription}</p>
//                           )}
//                         </td>
//                         <td>{item.gstRate}%</td>
//                         <td>{item.quantity}</td>
//                         <td>{currency(item.rate)}</td>
//                         <td>{currency(item.amount)}</td>
//                         <td>{currency(item.cgst)}</td>
//                         <td>{currency(item.sgst)}</td>
//                         <td className="item-total">{currency(item.total)}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}

//             {/* Totals */}
//             <div className="totals-wrap">
//               <div className="totals-box">
//                 <div className="totals-row">
//                   <span>Amount</span>
//                   <span>{currency((isEditing ? draft : invoice).totals?.amount)}</span>
//                 </div>
//                 <div className="totals-row">
//                   <span>CGST</span>
//                   <span>{currency((isEditing ? draft : invoice).totals?.cgst)}</span>
//                 </div>
//                 <div className="totals-row">
//                   <span>SGST</span>
//                   <span>{currency((isEditing ? draft : invoice).totals?.sgst)}</span>
//                 </div>
//                 <div className="totals-row">
//                   <span>Round off</span>
//                   {isEditing ? (
//                     <input
//                       type="number"
//                       className="edit-input cell-num"
//                       style={{ width: 90, textAlign: "right" }}
//                       value={draft.totals?.roundOff || 0}
//                       onChange={(e) => updateRoundOff(e.target.value)}
//                     />
//                   ) : (
//                     <span>({currency(invoice.totals?.roundOff)})</span>
//                   )}
//                 </div>
//                 <div className="totals-row grand">
//                   <span>Total (INR)</span>
//                   <span>{currency((isEditing ? draft : invoice).totals?.grandTotal)}</span>
//                 </div>
//                 <div className="totals-row paid">
//                   <span>Amount Paid</span>
//                   {isEditing ? (
//                     <input
//                       type="number"
//                       className="edit-input cell-num"
//                       style={{ width: 110, textAlign: "right" }}
//                       value={draft.amountPaid || 0}
//                       onChange={(e) => updateAmountPaid(e.target.value)}
//                     />
//                   ) : (
//                     <span>({currency(invoice.amountPaid)})</span>
//                   )}
//                 </div>
//                 {(isEditing ? draft.dueAmount > 0 : !isPaid) && (
//                   <div className="totals-row due">
//                     <span>Due Amount</span>
//                     <span>
//                       {currency((isEditing ? draft : invoice).dueAmount)}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Payments */}
//             {((isEditing ? draft.payments : invoice.payments) || []).length > 0 ||
//             isEditing ? (
//               <div>
//                 <p className="payments-title">Payments</p>
//                 <table className="payments-table">
//                   <thead>
//                     <tr>
//                       <th>Date</th>
//                       <th>Amount</th>
//                       {isEditing && <th></th>}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {(isEditing ? draft.payments : invoice.payments || []).map(
//                       (p, idx) =>
//                         isEditing ? (
//                           <tr key={idx}>
//                             <td>
//                               <input
//                                 type="date"
//                                 className="edit-input cell-input"
//                                 value={
//                                   p.date
//                                     ? new Date(p.date).toISOString().slice(0, 10)
//                                     : ""
//                                 }
//                                 onChange={(e) =>
//                                   updatePaymentField(idx, "date", e.target.value)
//                                 }
//                               />
//                             </td>
//                             <td>
//                               <input
//                                 type="number"
//                                 className="edit-input cell-input cell-num"
//                                 value={p.amountReceived}
//                                 onChange={(e) =>
//                                   updatePaymentField(
//                                     idx,
//                                     "amountReceived",
//                                     e.target.value,
//                                   )
//                                 }
//                               />
//                             </td>
//                             <td>
//                               <button
//                                 type="button"
//                                 className="remove-item-btn"
//                                 onClick={() => removePaymentRow(idx)}
//                               >
//                                 <Trash2 size={14} /> Remove
//                               </button>
//                             </td>
//                           </tr>
//                         ) : (
//                           <tr key={idx}>
//                             <td>{formatDate(p.date)}</td>
//                             <td>{currency(p.amountReceived)}</td>
//                           </tr>
//                         ),
//                     )}
//                     {!isEditing && (
//                       <tr className="total-row">
//                         <td>Total</td>
//                         <td>{currency(totalPaid)}</td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//                 {isEditing && (
//                   <button
//                     type="button"
//                     className="btn-ghost"
//                     style={{ marginTop: 10 }}
//                     onClick={addPaymentRow}
//                   >
//                     <Plus size={14} /> Add Payment
//                   </button>
//                 )}
//               </div>
//             ) : null}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Invoice;


/**
 * Invoice.jsx
 * --------------------------------------
 * Standalone PAGE (own route) — /invoice/:tnr
 *
 * Route setup (in your router file, e.g. App.jsx):
 *   import Invoice from "./pages/Invoice"; // adjust path
 *   <Route path="/invoice/:tnr" element={<Invoice />} />
 *
 * Requires: npm install html2canvas jspdf
 *
 * ── DESIGN NOTES ──────────────────────────────────────────────────────────
 * Direction: "travel ticket / boarding pass" — this is a tour operator's
 * receipt, so the signature element is a perforated stub divider (like
 * tearing a ticket) between the document header and the itemised body,
 * plus a corner ink-stamp for the paid/part-paid status. Palette stays in
 * the brand's deep pine-green family (matches the GV logo) with a brass
 * accent for the "paid" seal and a warm rust for outstanding dues — no
 * cream+serif+terracotta or dark+neon defaults.
 * Type: Fraunces (display, used only for the big "Invoice/Receipt" word
 * and amounts) + IBM Plex Sans (body/data — has clean tabular figures for
 * the money columns).
 */

// import React, { useContext, useEffect, useRef, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { ArrowLeft, Download, Loader2, CheckCircle2, Clock, Pencil, Plus, Trash2, Save, X, FileText, CalendarDays, Building2, User, Phone, Mail, Globe } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
// import { TourContext } from "../../context/TourContext"; // ← adjust path/name to your app's context
// import logo from "/src/assets/TM.png"; // ← adjust path to wherever you save the logo

// // ── Design tokens ─────────────────────────────────────────────────────────
// // Three-colour system: green (brand / paid), red (due / part-paid), blue
// // (informational — timestamps, generated-on line) — layered on the same
// // pine-green card structure as before, with solid filled status pills
// // (matching the reference invoice PDF) instead of dashed outline stamps.
// // Green (brand / icons / items table) + Red (due / part-paid) + Blue
// // (Payments section — kept visually distinct from the items table so
// // the reader can tell "what you owe" apart from "what's been received").
// const TOKENS = {
//   ink: "#152420",
//   inkSoft: "#5C6F63",
//   indigo: "#1F6E4A",
//   indigoDeep: "#123C29",
//   indigoSoft: "#E7F1EA",
//   indigoLine: "#DCE8DE",
//   blue: "#1D6FA3",
//   blueDeep: "#1309d3ff",
//   blueSoft: "#E7F1F8",
//   sand: "#F6F8F3",
//   rust: "#C0392B",
//   rustSoft: "#FBEAE9",
//   ok: "#1F6E4A",
//   okSoft: "#E7F1EA",
//   parchment: "#FFFFFF",
//   line: "#E4E1F0",
//   lineSoft: "#EDF4EE",
// };

// const currency = (n) =>
//   `₹${Number(n || 0).toLocaleString("en-IN", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   })}`;

// const formatDate = (d) =>
//   d
//     ? new Date(d).toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     })
//     : "—";

// // Date + time together — used for "Generated On" and payment timestamps.
// const formatDateTime = (d) =>
//   d
//     ? new Date(d).toLocaleString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     })
//     : "—";

// // Solid filled pill — matches the reference PDF's "Part Paid" badge style.
// const StatusStamp = ({ isPaid }) => {
//   const bg = isPaid ? TOKENS.ok : TOKENS.rust;
//   const label = isPaid ? "Paid" : "Part Paid";
//   return (
//     <div className="status-pill" style={{ background: bg }}>
//       {isPaid ? (
//         <CheckCircle2 size={11} strokeWidth={2.5} />
//       ) : (
//         <Clock size={11} strokeWidth={2.5} />
//       )}
//       <span>{label}</span>
//     </div>
//   );
// };

// const Invoice = () => {
//   const { tnr } = useParams();
//   const navigate = useNavigate();
//   const { getBookingInvoice, updateBookingInvoice } = useContext(TourContext);

//   const [invoice, setInvoice] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [downloading, setDownloading] = useState(false);
//   // True only for the brief moment html2canvas is snapshotting the DOM —
//   // swaps the title+pill row for a single plain text line ("Receipt -
//   // Part Paid"), since a pill's flex/margin alignment can render
//   // slightly differently in the canvas snapshot than on screen.
//   const [isCapturing, setIsCapturing] = useState(false);
//   const printRef = useRef(null);

//   // ── Edit mode state ──────────────────────────────────────────────────
//   const [isEditing, setIsEditing] = useState(false);
//   const [draft, setDraft] = useState(null); // working copy while editing
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     const fetchInvoice = async () => {
//       setLoading(true);
//       setError("");
//       try {
//         const response = await getBookingInvoice(tnr);
//         if (response.success && response.invoice) {
//           setInvoice(response.invoice);
//         } else {
//           setError(response.message || "Invoice not available yet");
//         }
//       } catch (err) {
//         console.error("Fetch invoice error:", err);
//         setError(err.message || "Failed to load invoice");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (tnr) fetchInvoice();
//   }, [tnr, getBookingInvoice]);

//   // ── Recalculation helpers (forward GST calc — admin enters ex-GST rate) ─
//   const round2 = (n) => Math.round(Number(n || 0) * 100) / 100;

//   const recalcItem = (item) => {
//     const qty = Number(item.quantity) || 0;
//     const rate = Number(item.rate) || 0;
//     const gstRate = Number(item.gstRate) || 0;
//     const amount = round2(qty * rate);
//     const gstTotal = round2((amount * gstRate) / 100);
//     const cgst = round2(gstTotal / 2);
//     const sgst = round2(gstTotal - cgst);
//     const total = round2(amount + cgst + sgst);
//     return { ...item, amount, cgst, sgst, total };
//   };

//   const recalcDraftTotals = (d) => {
//     const items = d.items || [];
//     const amountSum = round2(items.reduce((s, i) => s + Number(i.amount || 0), 0));
//     const cgstSum = round2(items.reduce((s, i) => s + Number(i.cgst || 0), 0));
//     const sgstSum = round2(items.reduce((s, i) => s + Number(i.sgst || 0), 0));
//     const roundOff = Number(d.totals?.roundOff || 0);
//     const grandTotal = round2(amountSum + cgstSum + sgstSum + roundOff);
//     const amountPaid = round2(d.amountPaid || 0);
//     const dueAmount = Math.max(0, round2(grandTotal - amountPaid));
//     return {
//       ...d,
//       totals: { amount: amountSum, cgst: cgstSum, sgst: sgstSum, roundOff, grandTotal },
//       dueAmount,
//     };
//   };

//   const startEditing = () => {
//     setDraft(JSON.parse(JSON.stringify(invoice))); // deep copy
//     setIsEditing(true);
//   };

//   const cancelEditing = () => {
//     setDraft(null);
//     setIsEditing(false);
//   };

//   const updateBilledTo = (field, value) => {
//     setDraft((prev) => ({
//       ...prev,
//       billedTo: { ...prev.billedTo, [field]: value },
//     }));
//   };

//   const updateItemField = (idx, field, value) => {
//     setDraft((prev) => {
//       const items = [...prev.items];
//       items[idx] = recalcItem({ ...items[idx], [field]: value });
//       return recalcDraftTotals({ ...prev, items });
//     });
//   };

//   const addItemRow = () => {
//     setDraft((prev) => {
//       const items = [
//         ...prev.items,
//         {
//           description: "New Item",
//           subDescription: "",
//           gstRate: 0,
//           quantity: 1,
//           rate: 0,
//           amount: 0,
//           cgst: 0,
//           sgst: 0,
//           total: 0,
//         },
//       ];
//       return recalcDraftTotals({ ...prev, items });
//     });
//   };

//   const removeItemRow = (idx) => {
//     setDraft((prev) => {
//       const items = prev.items.filter((_, i) => i !== idx);
//       return recalcDraftTotals({ ...prev, items });
//     });
//   };

//   const updateRoundOff = (value) => {
//     setDraft((prev) =>
//       recalcDraftTotals({
//         ...prev,
//         totals: { ...prev.totals, roundOff: Number(value) || 0 },
//       }),
//     );
//   };

//   const updateAmountPaid = (value) => {
//     setDraft((prev) => recalcDraftTotals({ ...prev, amountPaid: Number(value) || 0 }));
//   };

//   const updatePaymentField = (idx, field, value) => {
//     setDraft((prev) => {
//       const payments = [...prev.payments];
//       payments[idx] = { ...payments[idx], [field]: value };
//       return { ...prev, payments };
//     });
//   };

//   const addPaymentRow = () => {
//     setDraft((prev) => ({
//       ...prev,
//       payments: [...(prev.payments || []), { date: new Date(), amountReceived: 0 }],
//     }));
//   };

//   const removePaymentRow = (idx) => {
//     setDraft((prev) => ({
//       ...prev,
//       payments: prev.payments.filter((_, i) => i !== idx),
//     }));
//   };

//   const applyChanges = async () => {
//     if (!draft) return;
//     setSaving(true);
//     try {
//       const response = await updateBookingInvoice(tnr, draft);
//       if (response.success && response.invoice) {
//         setInvoice(response.invoice);
//         setIsEditing(false);
//         setDraft(null);
//         toast.success("Invoice saved");
//       } else {
//         toast.error(response.message || "Failed to save invoice");
//       }
//     } catch (err) {
//       console.error("Save invoice error:", err);
//       toast.error(err.message || "Failed to save invoice");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const isPaid = invoice?.status === "Paid";
//   const docLabel = isPaid ? "Invoice" : "Receipt";

//   const totalPaid = (invoice?.payments || []).reduce(
//     (sum, p) => sum + Number(p.amountReceived || 0),
//     0,
//   );

//   const handleDownload = async () => {
//     if (!printRef.current || !invoice) return;
//     setDownloading(true);
//     try {
//       // Swap the pill for plain combined text just for the snapshot, then
//       // let the re-render settle before html2canvas reads the DOM.
//       setIsCapturing(true);
//       await new Promise((resolve) => setTimeout(resolve, 80));

//       const canvas = await html2canvas(printRef.current, {
//         scale: 1.5,
//         useCORS: true,
//         backgroundColor: TOKENS.parchment,
//       });
//       setIsCapturing(false);

//       const pdf = new jsPDF("p", "mm", "a4");
//       const pageWidthMm = pdf.internal.pageSize.getWidth();
//       const pageHeightMm = pdf.internal.pageSize.getHeight();

//       // Canvas is rendered at scale:2, so this ratio converts canvas
//       // pixels <-> real-world mm consistently for every slice.
//       const pxPerMm = canvas.width / pageWidthMm;
//       const pageHeightPx = pageHeightMm * pxPerMm;

//       // Never let a page break fall in the middle of a section marked
//       // data-page-safe (Payments, etc.) — push the whole section to the
//       // next page instead of slicing through it.
//       const containerRect = printRef.current.getBoundingClientRect();
//       const breakEls = printRef.current.querySelectorAll("[data-page-safe]");
//       const breakPointsPx = Array.from(breakEls).map(
//         (el) =>
//           (el.getBoundingClientRect().top - containerRect.top) *
//           (canvas.width / containerRect.width),
//       );

//       let cursor = 0;
//       let pageIndex = 0;

//       while (cursor < canvas.height) {
//         let sliceHeight = Math.min(pageHeightPx, canvas.height - cursor);
//         const sliceEnd = cursor + sliceHeight;

//         for (const bp of breakPointsPx) {
//           if (bp > cursor + 50 && bp < sliceEnd) {
//             sliceHeight = bp - cursor;
//           }
//         }
//         // Safety net — never allow a near-zero sliver to stall the loop.
//         if (sliceHeight < 50) {
//           sliceHeight = Math.min(pageHeightPx, canvas.height - cursor);
//         }

//         const sliceCanvas = document.createElement("canvas");
//         sliceCanvas.width = canvas.width;
//         sliceCanvas.height = sliceHeight;
//         const ctx = sliceCanvas.getContext("2d");
//         ctx.fillStyle = "#FFFFFF";
//         ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
//         ctx.drawImage(
//           canvas,
//           0, cursor, canvas.width, sliceHeight,
//           0, 0, canvas.width, sliceHeight,
//         );

//         const sliceImgData = sliceCanvas.toDataURL("image/jpeg", 0.85);
//          const sliceHeightMm = sliceHeight / pxPerMm;

//         if (pageIndex > 0) pdf.addPage();
//         pdf.addImage(sliceImgData, "JPEG", 0, 0, pageWidthMm, sliceHeightMm);

//         cursor += sliceHeight;
//         pageIndex++;
//       }

//       pdf.save(`${docLabel}-${invoice.invoiceNumber}.pdf`);
//       toast.success(`${docLabel} downloaded`);
//     } catch (err) {
//       setIsCapturing(false);
//       console.error("PDF download failed:", err);
//       toast.error("Failed to generate PDF");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   const displayItems = isEditing ? draft?.items : invoice?.items;
//   const displayPayments = isEditing ? draft?.payments : invoice?.payments;
//   const displayTotals = isEditing ? draft?.totals : invoice?.totals;

//   return (
//     <div className="invoice-page">
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

//         :root {
//           --ink: ${TOKENS.ink};
//           --ink-soft: ${TOKENS.inkSoft};
//           --indigo: ${TOKENS.indigo};
//           --indigo-deep: ${TOKENS.indigoDeep};
//           --indigo-soft: ${TOKENS.indigoSoft};
//           --indigo-line: ${TOKENS.indigoLine};
//           --blue: ${TOKENS.blue};
//           --blue-deep: ${TOKENS.blueDeep};
//           --blue-soft: ${TOKENS.blueSoft};
//           --ok: ${TOKENS.ok};
//           --ok-soft: ${TOKENS.okSoft};
//           --rust: ${TOKENS.rust};
//           --rust-soft: ${TOKENS.rustSoft};
//           --line: ${TOKENS.line};
//           --line-soft: ${TOKENS.lineSoft};
//         }

//         .invoice-page {
//           min-height: 100vh;
//           padding: 20px 14px 60px;
//           font-family: 'IBM Plex Sans', -apple-system, sans-serif;
//           color: var(--ink);
//           background:
//             radial-gradient(circle at 12% 8%, rgba(31,110,74,0.07), transparent 42%),
//             radial-gradient(circle at 88% 92%, rgba(192,57,43,0.05), transparent 40%),
//             ${TOKENS.sand};
//         }
//         @media (min-width: 640px) {
//           .invoice-page { padding: 36px 24px 80px; }
//         }

//         .invoice-shell { max-width: 900px; margin: 0 auto; }

//         /* ── Top bar ── */
//         .invoice-topbar {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           gap: 12px;
//           margin-bottom: 20px;
//           flex-wrap: wrap;
//         }

//         .btn-ghost {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           padding: 10px 16px;
//           font-size: 13.5px;
//           font-weight: 600;
//           border-radius: 10px;
//           border: 1.5px solid var(--line);
//           background: #fff;
//           color: var(--ink-soft);
//           cursor: pointer;
//           transition: border-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
//         }
//         .btn-ghost:hover { border-color: var(--indigo); color: var(--indigo); }
//         .btn-ghost:active { transform: translateY(1px); }
//         .btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

//         .btn-solid {
//           display: inline-flex;
//           align-items: center;
//           gap: 8px;
//           padding: 10px 20px;
//           font-size: 13.5px;
//           font-weight: 700;
//           letter-spacing: 0.01em;
//           border-radius: 10px;
//           border: none;
//           color: #fff;
//           background: var(--indigo-deep);
//           cursor: pointer;
//           transition: background 0.15s ease, transform 0.1s ease;
//         }
//         .btn-solid:hover { background: var(--indigo); }
//         .btn-solid:active { transform: translateY(1px); }
//         .btn-solid:disabled { opacity: 0.55; cursor: not-allowed; }

//         /* ── Document shell — the "ticket" ── */
//         .doc-card {
//           background: #fff;
//           border: 1px solid var(--line);
//           border-radius: 20px;
//           overflow: hidden;
//           box-shadow: 0 2px 6px rgba(18,60,41,0.06), 0 18px 40px rgba(18,60,41,0.08);
//         }

//         /* ── Header — simple, plain white, no colour block. The unique
//            touch: small top-corner identifiers (generated timestamp on the
//            left, invoice#/customer on the right) frame the document like a
//            printed header, then the big title + pill sit directly on white. */
//         .doc-topline {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           gap: 12px;
//           padding: 16px 20px;
//           font-size: 11.5px;
//           color: var(--ink-soft);
//           border-bottom: 1px solid var(--line-soft);
//           flex-wrap: wrap;
//         }
//         @media (min-width: 640px) {
//           .doc-topline { padding: 18px 44px; }
//         }
//         .doc-topline strong { color: var(--ink); font-weight: 600; }

//         .doc-head {
//           position: relative;
//           padding: 26px 20px 22px;
//           display: flex;
//           align-items: flex-start;
//           justify-content: space-between;
//           gap: 16px;
//           flex-wrap: wrap;
//           overflow: hidden;
//         }
//         @media (min-width: 640px) {
//           .doc-head { padding: 34px 44px 28px; }
//         }
//         .doc-head::before {
//           content: "";
//           position: absolute;
//           top: -60px;
//           right: -60px;
//           width: 200px;
//           height: 200px;
//           border-radius: 50%;
//           background: linear-gradient(135deg, var(--indigo-deep), var(--indigo));
//           opacity: 0.08;
//         }

//         .doc-title-font {
//           font-family: 'Fraunces', serif;
//           font-weight: 600;
//           font-size: 36px;
//           line-height: 1;
//           letter-spacing: -0.01em;
//           margin: 0;
//           color: var(--blue-deep);
//         }
//         @media (min-width: 640px) {
//           .doc-title-font { font-size: 46px; }
//         }
//         .pdf-status-text {
//           display: inline-block;
//           position: relative;
//           top: 9px;
//           font-family: 'IBM Plex Sans', sans-serif;
//           font-size: 15px;
//           font-weight: 700;
//           letter-spacing: 0.02em;
//           text-transform: uppercase;
//         }
//         .doc-eyebrow {
//           font-size: 11px;
//           text-transform: uppercase;
//           letter-spacing: 0.16em;
//           color: var(--ink-soft);
//           margin: 0 0 8px;
//           font-weight: 600;
//         }
//         /* Fixed margin-top, no reliance on margin-collapsing with the
//            title above — this way the gap is identical whether the title
//            renders inside .title-row (browser, pill mode) or as a plain
//            sibling (PDF capture mode, combined text). */
//         .doc-tagline {
//           font-size: 12px;
//           font-style: italic;
//           color: #9a6f05ff;
//           margin: 20px 0 0;
//         }

//         .brand-logo-frame {
//           width: 108px;
//           height: 108px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-shrink: 0;
//         }
//         @media (min-width: 640px) {
//           .brand-logo-frame { width: 128px; height: 128px; }
//         }
//         .brand-logo-frame img {
//           width: 100%;
//           height: 100%;
//           object-fit: contain;
//         }

//         /* Fixed-offset positioning instead of flex vertical-centering —
//            flex align-items can render slightly differently in the browser
//            vs. the html2canvas PDF snapshot, so a deterministic px offset
//            keeps the pill in the same spot in both. */
//         .title-row {
//           display: flex;
//           align-items: flex-start;
//           gap: 8px;
//           flex-wrap: wrap;
//         }
//         .status-pill {
//           display: inline-flex;
//           align-items: center;
//           gap: 4px;
//           padding: 5px 11px;
//           border-radius: 999px;
//           font-size: 10px;
//           font-weight: 700;
//           letter-spacing: 0.05em;
//           line-height: 1;
//           color: #fff;
//           white-space: nowrap;
//           margin-top: 14px;
//         }
//         .status-pill svg { flex-shrink: 0; }

//         .doc-body { padding: 8px 18px 24px; }
//         @media (min-width: 640px) {
//           .doc-body { padding: 8px 44px 30px; }
//         }

//         /* Meta — icon-badge cards, matching the reference design's small
//            circular icon capsule next to each field. */
//         .meta-strip {
//           display: grid;
//           grid-template-columns: repeat(2, 1fr);
//           gap: 10px;
//           padding-bottom: 22px;
//           margin-bottom: 24px;
//           border-bottom: 1px dashed var(--line);
//         }
//         @media (min-width: 640px) {
//           .meta-strip { grid-template-columns: repeat(3, 1fr); }
//         }
//         .meta-field {
//           display: flex;
//           align-items: flex-start;
//           gap: 9px;
//           background: var(--line-soft);
//           border: 1px solid var(--line);
//           border-radius: 12px;
//           padding: 10px 12px;
//         }
//         .meta-icon {
//           width: 28px;
//           height: 28px;
//           border-radius: 50%;
//           background: var(--indigo);
//           color: #fff;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-shrink: 0;
//         }
//         .meta-label {
//           font-size: 9.5px;
//           text-transform: uppercase;
//           letter-spacing: 0.08em;
//           color: var(--ink-soft);
//           margin: 0 0 2px;
//         }
//         .meta-value {
//           font-family: 'IBM Plex Sans', sans-serif;
//           font-size: 13.5px;
//           font-weight: 700;
//           color: var(--ink);
//           margin: 0;
//           font-variant-numeric: tabular-nums;
//           line-height: 1.3;
//         }

//         /* Parties */
//         .party-grid {
//           display: grid;
//           grid-template-columns: 1fr;
//           gap: 16px;
//           margin-bottom: 26px;
//         }
//         @media (min-width: 640px) {
//           .party-grid { grid-template-columns: 1fr 1fr; }
//         }
//         .party-card {
//           background: var(--indigo-soft);
//           border: 1px solid var(--line);
//           border-radius: 14px;
//           padding: 18px 18px;
//         }
//         .party-label-row {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           margin: 0 0 10px;
//         }
//         .party-icon {
//           width: 24px;
//           height: 24px;
//           border-radius: 50%;
//           background: var(--indigo);
//           color: #fff;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-shrink: 0;
//         }
//         .party-label {
//           font-size: 10.5px;
//           text-transform: uppercase;
//           letter-spacing: 0.09em;
//           color: var(--indigo);
//           font-weight: 700;
//           margin: 0;
//         }
//         .party-name { font-weight: 700; font-size: 15.5px; margin: 0 0 4px; color: var(--ink); }
//         .party-line { font-size: 13px; color: var(--ink-soft); line-height: 1.65; margin: 0; }
//         .party-detail { font-size: 13px; margin-top: 6px; color: var(--ink-soft); }
//         .party-detail strong { color: var(--ink); font-weight: 600; }

//         .supply-row {
//           display: flex;
//           justify-content: space-between;
//           font-size: 12.5px;
//           color: var(--ink-soft);
//           margin-bottom: 20px;
//           flex-wrap: wrap;
//           gap: 8px;
//           padding-bottom: 18px;
//           border-bottom: 1px dashed var(--line);
//         }
//         .supply-row strong { color: var(--ink); }

//         /* ── Items — desktop table ── */
//         .items-table-wrap { display: none; margin-bottom: 24px; }
//         @media (min-width: 720px) {
//           .items-table-wrap { display: block; }
//         }
//         .items-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; }
//         .items-table thead th {
//           background: var(--indigo-deep);
//           color: #fff;
//           text-align: left;
//           font-weight: 600;
//           font-size: 11px;
//           text-transform: uppercase;
//           letter-spacing: 0.05em;
//           padding: 12px 14px;
//         }
//         .items-table thead th:first-child { border-radius: 10px 0 0 10px; }
//         .items-table thead th:last-child { border-radius: 0 10px 10px 0; }
//         .items-table tbody tr:nth-child(odd) { background: var(--line-soft); }
//         .items-table tbody tr:not(:last-child) { border-bottom: 1px solid var(--line-soft); }
//         .items-table td { padding: 13px 14px; vertical-align: top; font-variant-numeric: tabular-nums; }
//         .item-desc { font-weight: 600; color: var(--ink); font-variant-numeric: normal; }
//         .item-sub { font-size: 11.5px; color: var(--ink-soft); margin-top: 2px; font-variant-numeric: normal; }
//         .item-total { font-weight: 700; }

//         /* ── Items — mobile cards (fully responsive alternative to the table) ── */
//         .items-cards-mobile { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
//         @media (min-width: 720px) {
//           .items-cards-mobile { display: none; }
//         }
//         .item-mcard {
//           border: 1px solid var(--line);
//           border-radius: 12px;
//           padding: 14px;
//           background: var(--line-soft);
//         }
//         .item-mcard-head { margin-bottom: 10px; }
//         .item-mgrid {
//           display: grid;
//           grid-template-columns: repeat(2, 1fr);
//           gap: 8px 14px;
//           font-size: 12.5px;
//         }
//         .item-mgrid .mlabel {
//           font-size: 10px;
//           text-transform: uppercase;
//           letter-spacing: 0.06em;
//           color: var(--ink-soft);
//           display: block;
//         }
//         .item-mgrid .mvalue { font-weight: 600; color: var(--ink); font-variant-numeric: tabular-nums; }
//         .item-mtotal {
//           margin-top: 10px;
//           padding-top: 10px;
//           border-top: 1px dashed var(--line);
//           display: flex;
//           justify-content: space-between;
//           font-weight: 700;
//           font-size: 14px;
//         }

//         /* ── Totals ── */
//         .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 26px; margin-top: 6px; }
//         .totals-box {
//           position: relative;
//           width: 100%;
//           background: var(--line-soft);
//           border: 1px solid var(--line);
//           border-radius: 14px;
//           padding: 24px 20px 18px;
//         }
//         @media (min-width: 480px) { .totals-box { width: 320px; } }
//         .totals-badge {
//           position: absolute;
//           top: -16px;
//           left: 20px;
//           width: 34px;
//           height: 34px;
//           border-radius: 50%;
//           background: linear-gradient(135deg, var(--indigo-deep), var(--indigo));
//           color: #fff;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           box-shadow: 0 4px 10px rgba(76,63,191,0.35);
//         }
//         .totals-row {
//           display: flex;
//           justify-content: space-between;
//           font-size: 13.5px;
//           padding: 6px 0;
//           color: var(--ink-soft);
//         }
//         .totals-row.grand {
//           border-top: 1.5px solid var(--ink);
//           margin-top: 6px;
//           padding-top: 12px;
//           font-weight: 700;
//           font-size: 17px;
//           color: var(--ink);
//           font-family: 'Fraunces', serif;
//         }
//         .totals-row.paid { color: var(--blue); font-weight: 600; }
//         .totals-row.due {
//           font-weight: 700;
//           color: var(--rust);
//           margin-top: 6px;
//         }

//         /* ── Payments — styled like a real table, and deliberately blue
//            (not green like the items table) so money received reads as its
//            own category at a glance. ── */
//         .payments-title {
//           font-size: 11px;
//           text-transform: uppercase;
//           letter-spacing: 0.09em;
//           color: var(--blue);
//           font-weight: 700;
//           margin-bottom: 12px;
//         }
//         .payments-scroll {
//           overflow-x: auto;
//           border: 1px solid var(--line);
//           border-radius: 12px;
//         }
//         .payments-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 280px; }
//         .payments-table thead th {
//           text-align: left;
//           font-size: 10.5px;
//           text-transform: uppercase;
//           letter-spacing: 0.05em;
//           color: #fff;
//           background: var(--blue);
//           padding: 10px 14px;
//         }
//         .payments-table tbody tr:nth-child(odd) { background: var(--blue-soft); }
//         .payments-table tbody tr:not(:last-child) { border-bottom: 1px solid var(--line-soft); }
//         .payments-table td { padding: 11px 14px; font-variant-numeric: tabular-nums; }
//         .payments-table tr.total-row { background: transparent !important; }
//         .payments-table tr.total-row td { border-top: 1.5px solid var(--ink); font-weight: 700; padding-top: 12px; }

//         .doc-footer {
//           background: linear-gradient(135deg, var(--indigo-deep), var(--indigo) 140%);
//           color: rgba(255,255,255,0.92);
//           padding: 22px 18px;
//           text-align: center;
//         }
//         @media (min-width: 640px) { .doc-footer { padding: 26px 44px; } }
//         .doc-footer-thanks {
//           font-family: 'Fraunces', serif;
//           font-size: 16px;
//           font-weight: 600;
//           margin: 0 0 4px;
//         }
//         .doc-footer-sub {
//           font-size: 11.5px;
//           color: rgba(255,255,255,0.72);
//           margin: 0 0 14px;
//         }
//         .doc-footer-contacts {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 18px;
//           flex-wrap: wrap;
//           font-size: 11.5px;
//           color: rgba(255,255,255,0.85);
//         }
//         .doc-footer-contacts span {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//         }

//         /* ── Empty / loading / error states ── */
//         .state-card {
//           background: #fff;
//           border: 1px solid var(--line);
//           border-radius: 18px;
//           padding: 60px 20px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 10px;
//           color: var(--ink-soft);
//         }
//         .state-card.error { color: var(--rust); }

//         /* ── Edit mode ── */
//         .edit-stack { display: flex; flex-direction: column; gap: 6px; }
//         .edit-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
//         .edit-input {
//           font-family: 'IBM Plex Sans', sans-serif;
//           font-size: 13px;
//           padding: 7px 9px;
//           border: 1px solid var(--line);
//           border-radius: 8px;
//           background: #fff;
//           color: var(--ink);
//           width: 100%;
//         }
//         .edit-input:focus {
//           outline: none;
//           border-color: var(--indigo);
//           box-shadow: 0 0 0 3px rgba(31,110,74,0.12);
//         }
//         .cell-input { min-width: 90px; }
//         .cell-num { text-align: right; }

//         .item-cards { display: flex; flex-direction: column; gap: 14px; margin-bottom: 26px; }
//         .item-edit-card {
//           border: 1px solid var(--line);
//           border-radius: 12px;
//           padding: 16px;
//           background: #fff;
//         }
//         .item-edit-top {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           margin-bottom: 10px;
//         }
//         .item-edit-index {
//           font-size: 11px;
//           text-transform: uppercase;
//           letter-spacing: 0.06em;
//           color: var(--ink-soft);
//           font-weight: 700;
//         }
//         .remove-item-btn {
//           display: inline-flex;
//           align-items: center;
//           gap: 5px;
//           font-size: 12.5px;
//           font-weight: 600;
//           color: var(--rust);
//           background: var(--rust-soft);
//           border: 1px solid rgba(156,64,37,0.25);
//           border-radius: 8px;
//           padding: 6px 10px;
//           cursor: pointer;
//           white-space: nowrap;
//         }
//         .remove-item-btn:hover { filter: brightness(0.97); }
//         .item-edit-grid {
//           display: grid;
//           grid-template-columns: repeat(3, 1fr);
//           gap: 8px;
//           margin-top: 8px;
//         }
//         .item-edit-grid label {
//           font-size: 10.5px;
//           text-transform: uppercase;
//           letter-spacing: 0.05em;
//           color: var(--ink-soft);
//           display: flex;
//           flex-direction: column;
//           gap: 3px;
//         }
//         .item-edit-summary {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 14px;
//           margin-top: 12px;
//           padding-top: 10px;
//           border-top: 1px dashed var(--line-soft);
//           font-size: 12.5px;
//           color: var(--ink-soft);
//         }
//         .item-edit-total { font-weight: 700; color: var(--ink); }
//       `}</style>

//       <ToastContainer position="top-right" autoClose={3000} />

//       <div className="invoice-shell">
//         <div className="invoice-topbar">
//           <button onClick={() => navigate(-1)} className="btn-ghost">
//             <ArrowLeft size={15} /> Back
//           </button>

//           {invoice && !isEditing && (
//             <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
//               <button onClick={startEditing} className="btn-ghost">
//                 <Pencil size={15} /> Edit
//               </button>
//               <button onClick={handleDownload} disabled={downloading} className="btn-solid">
//                 {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
//                 {downloading ? "Preparing…" : `Download ${docLabel}`}
//               </button>
//             </div>
//           )}

//           {isEditing && (
//             <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
//               <button onClick={cancelEditing} className="btn-ghost" disabled={saving}>
//                 <X size={15} /> Cancel
//               </button>
//               <button onClick={applyChanges} className="btn-solid" disabled={saving}>
//                 {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
//                 {saving ? "Saving…" : "Save Changes"}
//               </button>
//             </div>
//           )}
//         </div>

//         {loading && (
//           <div className="state-card">
//             <Loader2 className="animate-spin" size={18} />
//             Loading invoice…
//           </div>
//         )}

//         {!loading && error && <div className="state-card error">{error}</div>}

//         {!loading && !error && invoice && (
//           <div ref={printRef} className="doc-card">
//             {/* Top-corner identifiers — generated timestamp left, doc ref right */}
//             <div className="doc-topline">
//               <span>Generated <strong>{formatDateTime(new Date())}</strong></span>
//               <span><strong>{invoice.invoiceNumber}</strong> · {invoice.billedTo?.name}</span>
//             </div>

//             {/* Header — plain white, title + pill, logo */}
//             <div className="doc-head">
//               <div style={{ position: "relative" }}>
//                 <p className="doc-eyebrow">GV — Tour Planners</p>
//                 {isCapturing ? (
//                   <h1 className="doc-title-font">
//                     {docLabel} <span className="pdf-status-text" style={{ color: isPaid ? TOKENS.ok : TOKENS.rust }}>
//                       - {isPaid ? "Full Paid" : "Part Paid"}
//                     </span>
//                   </h1>
//                 ) : (
//                   <div className="title-row">
//                     <h1 className="doc-title-font">{docLabel}</h1>
//                     <StatusStamp isPaid={isPaid} />
//                   </div>
//                 )}
//                 <p className="doc-tagline">Your Journey, Our Responsibility</p>
//               </div>
//               <div className="brand-logo-frame">
//                 <img src={logo} alt="GV - Tour Planners" />
//               </div>
//             </div>

//             <div className="doc-body">
//               {/* Meta */}
//               <div className="meta-strip">
//                 <div className="meta-field">
//                   <div className="meta-icon"><FileText size={14} /></div>
//                   <div>
//                     <p className="meta-label">{docLabel} No.</p>
//                     <p className="meta-value">{invoice.invoiceNumber}</p>
//                   </div>
//                 </div>
//                 <div className="meta-field">
//                   <div className="meta-icon"><CalendarDays size={14} /></div>
//                   <div>
//                     <p className="meta-label">Purchase Date</p>
//                     <p className="meta-value">{formatDate(invoice.purchaseDate)}</p>
//                   </div>
//                 </div>
//                 <div className="meta-field">
//                   <div className="meta-icon"><CalendarDays size={14} /></div>
//                   <div>
//                     <p className="meta-label">Due Date</p>
//                     <p className="meta-value">{formatDate(invoice.dueDate)}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Billed By / Billed To */}
//               <div className="party-grid">
//                 <div className="party-card">
//                   <div className="party-label-row">
//                     <div className="party-icon"><Building2 size={13} /></div>
//                     <p className="party-label">Billed By</p>
//                   </div>
//                   <p className="party-name">{invoice.billedBy?.companyName}</p>
//                   <p className="party-line">
//                     {invoice.billedBy?.addressLine1}, {invoice.billedBy?.city}
//                     <br />
//                     {invoice.billedBy?.state}, {invoice.billedBy?.country} - {invoice.billedBy?.pincode}
//                   </p>
//                   <p className="party-detail"><strong>GSTIN</strong> {invoice.billedBy?.gstin}</p>
//                   <p className="party-detail"><strong>PAN</strong> {invoice.billedBy?.pan}</p>
//                   <p className="party-detail"><strong>Phone</strong> {invoice.billedBy?.phone}</p>
//                   <p className="party-detail"><strong>TAN</strong> {invoice.billedBy?.tan}</p>
//                 </div>

//                 <div className="party-card">
//                   <div className="party-label-row">
//                     <div className="party-icon"><User size={13} /></div>
//                     <p className="party-label">Billed To</p>
//                   </div>
//                   {isEditing ? (
//                     <div className="edit-stack">
//                       <input
//                         className="edit-input"
//                         value={draft.billedTo?.name || ""}
//                         placeholder="Name"
//                         onChange={(e) => updateBilledTo("name", e.target.value)}
//                       />
//                       <input
//                         className="edit-input"
//                         value={draft.billedTo?.addressLine1 || ""}
//                         placeholder="Address line 1"
//                         onChange={(e) => updateBilledTo("addressLine1", e.target.value)}
//                       />
//                       <input
//                         className="edit-input"
//                         value={draft.billedTo?.addressLine2 || ""}
//                         placeholder="Address line 2"
//                         onChange={(e) => updateBilledTo("addressLine2", e.target.value)}
//                       />
//                       <div className="edit-row-3">
//                         <input
//                           className="edit-input"
//                           value={draft.billedTo?.city || ""}
//                           placeholder="City"
//                           onChange={(e) => updateBilledTo("city", e.target.value)}
//                         />
//                         <input
//                           className="edit-input"
//                           value={draft.billedTo?.state || ""}
//                           placeholder="State"
//                           onChange={(e) => updateBilledTo("state", e.target.value)}
//                         />
//                         <input
//                           className="edit-input"
//                           value={draft.billedTo?.pincode || ""}
//                           placeholder="Pincode"
//                           onChange={(e) => updateBilledTo("pincode", e.target.value)}
//                         />
//                       </div>
//                       <input
//                         className="edit-input"
//                         value={draft.billedTo?.phone || ""}
//                         placeholder="Phone"
//                         onChange={(e) => updateBilledTo("phone", e.target.value)}
//                       />
//                     </div>
//                   ) : (
//                     <>
//                       <p className="party-name">{invoice.billedTo?.name}</p>
//                       <p className="party-line">
//                         {invoice.billedTo?.addressLine1}
//                         {invoice.billedTo?.addressLine2 && <>, {invoice.billedTo.addressLine2}</>}
//                         <br />
//                         {invoice.billedTo?.city}, {invoice.billedTo?.state}, {invoice.billedTo?.country} - {invoice.billedTo?.pincode}
//                       </p>
//                       <p className="party-detail"><strong>Phone</strong> {invoice.billedTo?.phone}</p>
//                     </>
//                   )}
//                 </div>
//               </div>

//               {(invoice.countryOfSupply || invoice.placeOfSupply) && (
//                 <div className="supply-row">
//                   <span><strong>Country of Supply</strong> {invoice.countryOfSupply}</span>
//                   <span><strong>Place of Supply</strong> {invoice.placeOfSupply}</span>
//                 </div>
//               )}

//               {/* Items */}
//               {isEditing ? (
//                 <div className="item-cards">
//                   {draft.items.map((item, idx) => (
//                     <div key={idx} className="item-edit-card">
//                       <div className="item-edit-top">
//                         <span className="item-edit-index">Item {idx + 1}</span>
//                         <button type="button" className="remove-item-btn" onClick={() => removeItemRow(idx)}>
//                           <Trash2 size={14} /> Remove Item
//                         </button>
//                       </div>

//                       <input
//                         className="edit-input"
//                         value={item.description}
//                         placeholder="Description"
//                         onChange={(e) => updateItemField(idx, "description", e.target.value)}
//                       />
//                       <input
//                         className="edit-input"
//                         style={{ marginTop: 6 }}
//                         value={item.subDescription || ""}
//                         placeholder="Sub-description (optional)"
//                         onChange={(e) => updateItemField(idx, "subDescription", e.target.value)}
//                       />

//                       <div className="item-edit-grid">
//                         <label>
//                           GST %
//                           <input
//                             type="number"
//                             className="edit-input"
//                             value={item.gstRate}
//                             onChange={(e) => updateItemField(idx, "gstRate", e.target.value)}
//                           />
//                         </label>
//                         <label>
//                           Qty
//                           <input
//                             type="number"
//                             className="edit-input"
//                             value={item.quantity}
//                             onChange={(e) => updateItemField(idx, "quantity", e.target.value)}
//                           />
//                         </label>
//                         <label>
//                           Rate
//                           <input
//                             type="number"
//                             className="edit-input"
//                             value={item.rate}
//                             onChange={(e) => updateItemField(idx, "rate", e.target.value)}
//                           />
//                         </label>
//                       </div>

//                       <div className="item-edit-summary">
//                         <span>Amount {currency(item.amount)}</span>
//                         <span>CGST {currency(item.cgst)}</span>
//                         <span>SGST {currency(item.sgst)}</span>
//                         <span className="item-edit-total">Total {currency(item.total)}</span>
//                       </div>
//                     </div>
//                   ))}
//                   <button type="button" className="btn-ghost" onClick={addItemRow}>
//                     <Plus size={14} /> Add Item
//                   </button>
//                 </div>
//               ) : (
//                 <>
//                   {/* Desktop / tablet table */}
//                   <div className="items-table-wrap">
//                     <table className="items-table">
//                       <thead>
//                         <tr>
//                           <th>Item</th>
//                           <th>GST</th>
//                           <th>Qty</th>
//                           <th>Rate</th>
//                           <th>Amount</th>
//                           <th>CGST</th>
//                           <th>SGST</th>
//                           <th>Total</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {(displayItems || []).map((item, idx) => (
//                           <tr key={idx}>
//                             <td>
//                               <p className="item-desc">{item.description}</p>
//                               {item.subDescription && <p className="item-sub">{item.subDescription}</p>}
//                             </td>
//                             <td>{item.gstRate}%</td>
//                             <td>{item.quantity}</td>
//                             <td>{currency(item.rate)}</td>
//                             <td>{currency(item.amount)}</td>
//                             <td>{currency(item.cgst)}</td>
//                             <td>{currency(item.sgst)}</td>
//                             <td className="item-total">{currency(item.total)}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>

//                   {/* Mobile stacked cards — same data, fully responsive */}
//                   <div className="items-cards-mobile">
//                     {(displayItems || []).map((item, idx) => (
//                       <div key={idx} className="item-mcard">
//                         <div className="item-mcard-head">
//                           <p className="item-desc">{item.description}</p>
//                           {item.subDescription && <p className="item-sub">{item.subDescription}</p>}
//                         </div>
//                         <div className="item-mgrid">
//                           <div><span className="mlabel">GST</span><span className="mvalue">{item.gstRate}%</span></div>
//                           <div><span className="mlabel">Qty</span><span className="mvalue">{item.quantity}</span></div>
//                           <div><span className="mlabel">Rate</span><span className="mvalue">{currency(item.rate)}</span></div>
//                           <div><span className="mlabel">Amount</span><span className="mvalue">{currency(item.amount)}</span></div>
//                           <div><span className="mlabel">CGST</span><span className="mvalue">{currency(item.cgst)}</span></div>
//                           <div><span className="mlabel">SGST</span><span className="mvalue">{currency(item.sgst)}</span></div>
//                         </div>
//                         <div className="item-mtotal">
//                           <span>Total</span>
//                           <span>{currency(item.total)}</span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </>
//               )}

//               {/* Totals */}
//               <div className="totals-wrap">
//                 <div className="totals-box">
//                   <div className="totals-badge"><FileText size={15} /></div>
//                   <div className="totals-row">
//                     <span>Amount</span>
//                     <span>{currency(displayTotals?.amount)}</span>
//                   </div>
//                   <div className="totals-row">
//                     <span>CGST</span>
//                     <span>{currency(displayTotals?.cgst)}</span>
//                   </div>
//                   <div className="totals-row">
//                     <span>SGST</span>
//                     <span>{currency(displayTotals?.sgst)}</span>
//                   </div>
//                   <div className="totals-row">
//                     <span>Round off</span>
//                     {isEditing ? (
//                       <input
//                         type="number"
//                         className="edit-input cell-num"
//                         style={{ width: 90, textAlign: "right" }}
//                         value={draft.totals?.roundOff || 0}
//                         onChange={(e) => updateRoundOff(e.target.value)}
//                       />
//                     ) : (
//                       <span>({currency(invoice.totals?.roundOff)})</span>
//                     )}
//                   </div>
//                   <div className="totals-row grand">
//                     <span>Total (INR)</span>
//                     <span>{currency(displayTotals?.grandTotal)}</span>
//                   </div>
//                   <div className="totals-row paid">
//                     <span>Amount Paid</span>
//                     {isEditing ? (
//                       <input
//                         type="number"
//                         className="edit-input cell-num"
//                         style={{ width: 110, textAlign: "right" }}
//                         value={draft.amountPaid || 0}
//                         onChange={(e) => updateAmountPaid(e.target.value)}
//                       />
//                     ) : (
//                       <span>({currency(invoice.amountPaid)})</span>
//                     )}
//                   </div>
//                   {(isEditing ? draft.dueAmount > 0 : !isPaid) && (
//                     <div className="totals-row due">
//                       <span>Due Amount</span>
//                       <span>{currency(isEditing ? draft.dueAmount : invoice.dueAmount)}</span>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Payments */}
//               {(displayPayments || []).length > 0 || isEditing ? (
//                 <div data-page-safe>
//                   <p className="payments-title">Payments</p>
//                   <div className="payments-scroll">
//                     <table className="payments-table">
//                       <thead>
//                         <tr>
//                           <th>Date</th>
//                           <th>Amount</th>
//                           {isEditing && <th></th>}
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {(displayPayments || []).map((p, idx) =>
//                           isEditing ? (
//                             <tr key={idx}>
//                               <td>
//                                 <input
//                                   type="date"
//                                   className="edit-input cell-input"
//                                   value={p.date ? new Date(p.date).toISOString().slice(0, 10) : ""}
//                                   onChange={(e) => updatePaymentField(idx, "date", e.target.value)}
//                                 />
//                               </td>
//                               <td>
//                                 <input
//                                   type="number"
//                                   className="edit-input cell-input cell-num"
//                                   value={p.amountReceived}
//                                   onChange={(e) => updatePaymentField(idx, "amountReceived", e.target.value)}
//                                 />
//                               </td>
//                               <td>
//                                 <button type="button" className="remove-item-btn" onClick={() => removePaymentRow(idx)}>
//                                   <Trash2 size={14} /> Remove
//                                 </button>
//                               </td>
//                             </tr>
//                           ) : (
//                             <tr key={idx}>
//                               <td>{formatDateTime(p.date)}</td>
//                               <td>{currency(p.amountReceived)}</td>
//                             </tr>
//                           ),
//                         )}
//                         {!isEditing && (
//                           <tr className="total-row">
//                             <td>Total</td>
//                             <td>{currency(totalPaid)}</td>
//                           </tr>
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                   {isEditing && (
//                     <button type="button" className="btn-ghost" style={{ marginTop: 10 }} onClick={addPaymentRow}>
//                       <Plus size={14} /> Add Payment
//                     </button>
//                   )}
//                 </div>
//               ) : null}
//             </div>

//             <div className="doc-footer">
//               <p className="doc-footer-thanks">Thank you for your business!</p>
//               <p className="doc-footer-sub">We look forward to serving you again.</p>
//               <div className="doc-footer-contacts">
//                 {invoice.billedBy?.phone && (
//                   <span><Phone size={13} /> {invoice.billedBy.phone}</span>
//                 )}
//                 {/* ← placeholders: swap in your real email / website, or remove */}
//                 <span><Mail size={13} /> info@gvtourplanners.com</span>
//                 <span><Globe size={13} /> www.gvtourplanners.com</span>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Invoice;


// import React, { useContext, useEffect, useRef, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { ArrowLeft, Download, Loader2, CheckCircle2, Clock, Pencil, Plus, Trash2, Save, X, FileText, CalendarDays, Building2, User, Phone } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
// import { TourContext } from "../../context/TourContext"; // ← adjust path/name to your app's context
// import logo from "/src/assets/TM.png"; // ← adjust path to wherever you save the logo

// // ── Design tokens ─────────────────────────────────────────────────────────
// const TOKENS = {
//   ink: "#152420",
//   inkSoft: "#5C6F63",
//   indigo: "#1F6E4A",
//   indigoDeep: "#123C29",
//   indigoSoft: "#E7F1EA",
//   indigoLine: "#DCE8DE",
//   blue: "#1D6FA3",
//   blueDeep: "#1309d3ff",
//   blueSoft: "#E7F1F8",
//   sand: "#F6F8F3",
//   rust: "#C0392B",
//   rustSoft: "#FBEAE9",
//   ok: "#1F6E4A",
//   okSoft: "#E7F1EA",
//   parchment: "#FFFFFF",
//   line: "#E4E1F0",
//   lineSoft: "#EDF4EE",
// };

// const currency = (n) =>
//   `₹${Number(n || 0).toLocaleString("en-IN", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   })}`;

// const formatDate = (d) =>
//   d
//     ? new Date(d).toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     })
//     : "—";

// const formatDateTime = (d) =>
//   d
//     ? new Date(d).toLocaleString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     })
//     : "—";

// const StatusStamp = ({ isPaid }) => {
//   const bg = isPaid ? TOKENS.ok : TOKENS.rust;
//   const label = isPaid ? "Paid" : "Part Paid";
//   return (
//     <div className="status-pill" style={{ background: bg }}>
//       {isPaid ? (
//         <CheckCircle2 size={11} strokeWidth={2.5} />
//       ) : (
//         <Clock size={11} strokeWidth={2.5} />
//       )}
//       <span>{label}</span>
//     </div>
//   );
// };

// const Invoice = () => {
//   const { tnr } = useParams();
//   const navigate = useNavigate();
//   const { getBookingInvoice, updateBookingInvoice } = useContext(TourContext);

//   const [invoice, setInvoice] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [downloading, setDownloading] = useState(false);
//   const [isCapturing, setIsCapturing] = useState(false);
//   const printRef = useRef(null);

//   const [isEditing, setIsEditing] = useState(false);
//   const [draft, setDraft] = useState(null);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     const fetchInvoice = async () => {
//       setLoading(true);
//       setError("");
//       try {
//         const response = await getBookingInvoice(tnr);
//         if (response.success && response.invoice) {
//           setInvoice(response.invoice);
//         } else {
//           setError(response.message || "Invoice not available yet");
//         }
//       } catch (err) {
//         console.error("Fetch invoice error:", err);
//         setError(err.message || "Failed to load invoice");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (tnr) fetchInvoice();
//   }, [tnr, getBookingInvoice]);

//   const round2 = (n) => Math.round(Number(n || 0) * 100) / 100;

//   const recalcItem = (item) => {
//     const qty = Number(item.quantity) || 0;
//     const rate = Number(item.rate) || 0;
//     const gstRate = Number(item.gstRate) || 0;
//     const amount = round2(qty * rate);
//     const gstTotal = round2((amount * gstRate) / 100);
//     const cgst = round2(gstTotal / 2);
//     const sgst = round2(gstTotal - cgst);
//     const total = round2(amount + cgst + sgst);
//     return { ...item, amount, cgst, sgst, total };
//   };

//   const recalcDraftTotals = (d) => {
//     const items = d.items || [];
//     const amountSum = round2(items.reduce((s, i) => s + Number(i.amount || 0), 0));
//     const cgstSum = round2(items.reduce((s, i) => s + Number(i.cgst || 0), 0));
//     const sgstSum = round2(items.reduce((s, i) => s + Number(i.sgst || 0), 0));
//     const roundOff = Number(d.totals?.roundOff || 0);
//     const grandTotal = round2(amountSum + cgstSum + sgstSum + roundOff);
//     const amountPaid = round2(d.amountPaid || 0);
//     const dueAmount = Math.max(0, round2(grandTotal - amountPaid));
//     return {
//       ...d,
//       totals: { amount: amountSum, cgst: cgstSum, sgst: sgstSum, roundOff, grandTotal },
//       dueAmount,
//     };
//   };

//   const startEditing = () => {
//     setDraft(JSON.parse(JSON.stringify(invoice)));
//     setIsEditing(true);
//   };

//   const cancelEditing = () => {
//     setDraft(null);
//     setIsEditing(false);
//   };

//   const updateBilledTo = (field, value) => {
//     setDraft((prev) => ({
//       ...prev,
//       billedTo: { ...prev.billedTo, [field]: value },
//     }));
//   };

//   const updateItemField = (idx, field, value) => {
//     setDraft((prev) => {
//       const items = [...prev.items];
//       items[idx] = recalcItem({ ...items[idx], [field]: value });
//       return recalcDraftTotals({ ...prev, items });
//     });
//   };

//   const addItemRow = () => {
//     setDraft((prev) => {
//       const items = [
//         ...prev.items,
//         {
//           description: "New Item",
//           subDescription: "",
//           gstRate: 0,
//           quantity: 1,
//           rate: 0,
//           amount: 0,
//           cgst: 0,
//           sgst: 0,
//           total: 0,
//         },
//       ];
//       return recalcDraftTotals({ ...prev, items });
//     });
//   };

//   const removeItemRow = (idx) => {
//     setDraft((prev) => {
//       const items = prev.items.filter((_, i) => i !== idx);
//       return recalcDraftTotals({ ...prev, items });
//     });
//   };

//   const updateRoundOff = (value) => {
//     setDraft((prev) =>
//       recalcDraftTotals({
//         ...prev,
//         totals: { ...prev.totals, roundOff: Number(value) || 0 },
//       }),
//     );
//   };

//   const updateAmountPaid = (value) => {
//     setDraft((prev) => recalcDraftTotals({ ...prev, amountPaid: Number(value) || 0 }));
//   };

//   const updatePaymentField = (idx, field, value) => {
//     setDraft((prev) => {
//       const payments = [...prev.payments];
//       payments[idx] = { ...payments[idx], [field]: value };
//       return { ...prev, payments };
//     });
//   };

//   const addPaymentRow = () => {
//     setDraft((prev) => ({
//       ...prev,
//       payments: [...(prev.payments || []), { date: new Date(), amountReceived: 0 }],
//     }));
//   };

//   const removePaymentRow = (idx) => {
//     setDraft((prev) => ({
//       ...prev,
//       payments: prev.payments.filter((_, i) => i !== idx),
//     }));
//   };

//   const applyChanges = async () => {
//     if (!draft) return;
//     setSaving(true);
//     try {
//       const response = await updateBookingInvoice(tnr, draft);
//       if (response.success && response.invoice) {
//         setInvoice(response.invoice);
//         setIsEditing(false);
//         setDraft(null);
//         toast.success("Invoice saved");
//       } else {
//         toast.error(response.message || "Failed to save invoice");
//       }
//     } catch (err) {
//       console.error("Save invoice error:", err);
//       toast.error(err.message || "Failed to save invoice");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const isPaid = invoice?.status === "Paid";
//   const docLabel = isPaid ? "Invoice" : "Receipt";

//   const totalPaid = (invoice?.payments || []).reduce(
//     (sum, p) => sum + Number(p.amountReceived || 0),
//     0,
//   );

//   const handleDownload = async () => {
//     if (!printRef.current || !invoice) return;
//     setDownloading(true);
//     try {
//       setIsCapturing(true);
//       await new Promise((resolve) => setTimeout(resolve, 80));

//       const canvas = await html2canvas(printRef.current, {
//         scale: 1.5,
//         useCORS: true,
//         backgroundColor: TOKENS.parchment,
//       });
//       setIsCapturing(false);

//       const pdf = new jsPDF("p", "mm", "a4");
//       const pageWidthMm = pdf.internal.pageSize.getWidth();
//       const pageHeightMm = pdf.internal.pageSize.getHeight();

//       const pxPerMm = canvas.width / pageWidthMm;
//       const pageHeightPx = pageHeightMm * pxPerMm;

//       const containerRect = printRef.current.getBoundingClientRect();
//       const breakEls = printRef.current.querySelectorAll("[data-page-safe]");
//       const breakPointsPx = Array.from(breakEls).map(
//         (el) =>
//           (el.getBoundingClientRect().top - containerRect.top) *
//           (canvas.width / containerRect.width),
//       );

//       let cursor = 0;
//       let pageIndex = 0;

//       while (cursor < canvas.height) {
//         let sliceHeight = Math.min(pageHeightPx, canvas.height - cursor);
//         const sliceEnd = cursor + sliceHeight;

//         for (const bp of breakPointsPx) {
//           if (bp > cursor + 50 && bp < sliceEnd) {
//             sliceHeight = bp - cursor;
//           }
//         }
//         if (sliceHeight < 50) {
//           sliceHeight = Math.min(pageHeightPx, canvas.height - cursor);
//         }

//         const sliceCanvas = document.createElement("canvas");
//         sliceCanvas.width = canvas.width;
//         sliceCanvas.height = sliceHeight;
//         const ctx = sliceCanvas.getContext("2d");
//         ctx.fillStyle = "#FFFFFF";
//         ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
//         ctx.drawImage(
//           canvas,
//           0, cursor, canvas.width, sliceHeight,
//           0, 0, canvas.width, sliceHeight,
//         );

//         const sliceImgData = sliceCanvas.toDataURL("image/jpeg", 0.85);
//         const sliceHeightMm = sliceHeight / pxPerMm;

//         if (pageIndex > 0) pdf.addPage();
//         pdf.addImage(sliceImgData, "JPEG", 0, 0, pageWidthMm, sliceHeightMm);

//         cursor += sliceHeight;
//         pageIndex++;
//       }

//       pdf.save(`${docLabel}-${invoice.invoiceNumber}.pdf`);
//       toast.success(`${docLabel} downloaded`);
//     } catch (err) {
//       setIsCapturing(false);
//       console.error("PDF download failed:", err);
//       toast.error("Failed to generate PDF");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   const displayItems = isEditing ? draft?.items : invoice?.items;
//   const displayPayments = isEditing ? draft?.payments : invoice?.payments;
//   const displayTotals = isEditing ? draft?.totals : invoice?.totals;

//   return (
//     <div className="invoice-page">
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

//         :root {
//           --ink: ${TOKENS.ink};
//           --ink-soft: ${TOKENS.inkSoft};
//           --indigo: ${TOKENS.indigo};
//           --indigo-deep: ${TOKENS.indigoDeep};
//           --indigo-soft: ${TOKENS.indigoSoft};
//           --indigo-line: ${TOKENS.indigoLine};
//           --blue: ${TOKENS.blue};
//           --blue-deep: ${TOKENS.blueDeep};
//           --blue-soft: ${TOKENS.blueSoft};
//           --ok: ${TOKENS.ok};
//           --ok-soft: ${TOKENS.okSoft};
//           --rust: ${TOKENS.rust};
//           --rust-soft: ${TOKENS.rustSoft};
//           --line: ${TOKENS.line};
//           --line-soft: ${TOKENS.lineSoft};
//         }

//         .invoice-page {
//           min-height: 100vh;
//           padding: 20px 14px 60px;
//           font-family: 'IBM Plex Sans', -apple-system, sans-serif;
//           color: var(--ink);
//           background:
//             radial-gradient(circle at 12% 8%, rgba(31,110,74,0.07), transparent 42%),
//             radial-gradient(circle at 88% 92%, rgba(192,57,43,0.05), transparent 40%),
//             ${TOKENS.sand};
//         }
//         @media (min-width: 640px) {
//           .invoice-page { padding: 36px 24px 80px; }
//         }

//         .invoice-shell { max-width: 900px; margin: 0 auto; }

//         .invoice-topbar {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           gap: 12px;
//           margin-bottom: 20px;
//           flex-wrap: wrap;
//         }

//         .btn-ghost {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           padding: 10px 16px;
//           font-size: 13.5px;
//           font-weight: 600;
//           border-radius: 10px;
//           border: 1.5px solid var(--line);
//           background: #fff;
//           color: var(--ink-soft);
//           cursor: pointer;
//           transition: border-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
//         }
//         .btn-ghost:hover { border-color: var(--indigo); color: var(--indigo); }
//         .btn-ghost:active { transform: translateY(1px); }
//         .btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

//         .btn-solid {
//           display: inline-flex;
//           align-items: center;
//           gap: 8px;
//           padding: 10px 20px;
//           font-size: 13.5px;
//           font-weight: 700;
//           letter-spacing: 0.01em;
//           border-radius: 10px;
//           border: none;
//           color: #fff;
//           background: var(--indigo-deep);
//           cursor: pointer;
//           transition: background 0.15s ease, transform 0.1s ease;
//         }
//         .btn-solid:hover { background: var(--indigo); }
//         .btn-solid:active { transform: translateY(1px); }
//         .btn-solid:disabled { opacity: 0.55; cursor: not-allowed; }

//         .doc-card {
//           background: #fff;
//           border: 1px solid var(--line);
//           border-radius: 20px;
//           overflow: hidden;
//           box-shadow: 0 2px 6px rgba(18,60,41,0.06), 0 18px 40px rgba(18,60,41,0.08);
//         }
//           .doc-card.pdf-flat {
//   border-radius: 0;
//   box-shadow: none;
// }

//         .doc-topline {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           gap: 12px;
//           padding: 16px 20px;
//           font-size: 11.5px;
//           color: var(--ink-soft);
//           border-bottom: 1px solid var(--line-soft);
//           flex-wrap: wrap;
//         }
//         @media (min-width: 640px) {
//           .doc-topline { padding: 18px 44px; }
//         }
//         .doc-topline strong { color: var(--ink); font-weight: 600; }

//         .doc-head {
//           padding: 26px 20px 22px;
//           display: flex;
//           align-items: flex-start;
//           justify-content: space-between;
//           gap: 16px;
//           flex-wrap: wrap;
//         }
//         @media (min-width: 640px) {
//           .doc-head { padding: 34px 44px 28px; }
//         }

//         .doc-title-font {
//           font-family: 'Fraunces', serif;
//           font-weight: 600;
//           font-size: 36px;
//           line-height: 1;
//           letter-spacing: -0.01em;
//           margin: 0;
//           color: var(--blue-deep);
//         }
//         @media (min-width: 640px) {
//           .doc-title-font { font-size: 46px; }
//         }
//         .pdf-status-text {
//           display: inline-block;
//           position: relative;
//           top: 9px;
//           font-family: 'IBM Plex Sans', sans-serif;
//           font-size: 15px;
//           font-weight: 700;
//           letter-spacing: 0.02em;
//           text-transform: uppercase;
//         }
//         .doc-eyebrow {
//           font-size: 11px;
//           text-transform: uppercase;
//           letter-spacing: 0.16em;
//           color: var(--ink-soft);
//           margin: 0 0 8px;
//           font-weight: 600;
//         }

//         .brand-logo-frame {
//           width: 108px;
//           height: 108px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-shrink: 0;
//         }
//         @media (min-width: 640px) {
//           .brand-logo-frame { width: 128px; height: 128px; }
//         }
//         .brand-logo-frame img {
//           width: 100%;
//           height: 100%;
//           object-fit: contain;
//         }

//         .title-row {
//           display: flex;
//           align-items: flex-start;
//           gap: 8px;
//           flex-wrap: wrap;
//         }
//         .status-pill {
//           display: inline-flex;
//           align-items: center;
//           gap: 4px;
//           padding: 5px 11px;
//           border-radius: 999px;
//           font-size: 10px;
//           font-weight: 700;
//           letter-spacing: 0.05em;
//           line-height: 1;
//           color: #fff;
//           white-space: nowrap;
//           margin-top: 14px;
//         }
//         .status-pill svg { display: block; flex-shrink: 0; }

//         .doc-body { padding: 8px 18px 24px; }
//         @media (min-width: 640px) {
//           .doc-body { padding: 8px 44px 30px; }
//         }

//         .meta-strip {
//           display: grid;
//           grid-template-columns: repeat(2, 1fr);
//           gap: 10px;
//           padding-bottom: 22px;
//           margin-bottom: 24px;
//           border-bottom: 1px dashed var(--line);
//         }
//         @media (min-width: 640px) {
//           .meta-strip { grid-template-columns: repeat(3, 1fr); }
//         }
//         .meta-field {
//           display: flex;
//           align-items: flex-start;
//           gap: 9px;
//           background: var(--line-soft);
//           border: 1px solid var(--line);
//           border-radius: 12px;
//           padding: 10px 12px;
//         }
//         .meta-icon {
//           width: 28px;
//           height: 28px;
//           border-radius: 50%;
//           background: var(--indigo);
//           color: #fff;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-shrink: 0;
//         }
//         .meta-label {
//           font-size: 9.5px;
//           text-transform: uppercase;
//           letter-spacing: 0.08em;
//           color: var(--ink-soft);
//           margin: 0 0 2px;
//         }
//         .meta-value {
//           font-family: 'IBM Plex Sans', sans-serif;
//           font-size: 13.5px;
//           font-weight: 700;
//           color: var(--ink);
//           margin: 0;
//           font-variant-numeric: tabular-nums;
//           line-height: 1.3;
//         }

//         .party-grid {
//           display: grid;
//           grid-template-columns: 1fr;
//           gap: 16px;
//           margin-bottom: 26px;
//         }
//         @media (min-width: 640px) {
//           .party-grid { grid-template-columns: 1fr 1fr; }
//         }
//         .party-card {
//           background: var(--indigo-soft);
//           border: 1px solid var(--line);
//           border-radius: 14px;
//           padding: 18px 18px;
//         }
//         .party-label-row {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           margin: 0 0 10px;
//         }
//         .party-icon {
//           width: 24px;
//           height: 24px;
//           border-radius: 50%;
//           background: var(--indigo);
//           color: #fff;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-shrink: 0;
//         }
//         .party-label {
//           font-size: 10.5px;
//           text-transform: uppercase;
//           letter-spacing: 0.09em;
//           color: var(--indigo);
//           font-weight: 700;
//           margin: 0;
//         }
//         .party-name { font-weight: 700; font-size: 15.5px; margin: 0 0 4px; color: var(--ink); }
//         .party-line { font-size: 13px; color: var(--ink-soft); line-height: 1.65; margin: 0; }
//         .party-detail { font-size: 13px; margin-top: 6px; color: var(--ink-soft); }
//         .party-detail strong { color: var(--ink); font-weight: 600; }

//         .supply-row {
//           display: flex;
//           justify-content: space-between;
//           font-size: 12.5px;
//           color: var(--ink-soft);
//           margin-bottom: 20px;
//           flex-wrap: wrap;
//           gap: 8px;
//           padding-bottom: 18px;
//           border-bottom: 1px dashed var(--line);
//         }
//         .supply-row strong { color: var(--ink); }

//         .items-table-wrap { display: none; margin-bottom: 24px; }
//         @media (min-width: 720px) {
//           .items-table-wrap { display: block; }
//         }
//         .items-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; }
//         .items-table thead th {
//           background: var(--indigo-deep);
//           color: #fff;
//           text-align: left;
//           font-weight: 600;
//           font-size: 11px;
//           text-transform: uppercase;
//           letter-spacing: 0.05em;
//           padding: 12px 14px;
//         }
//         .items-table thead th:first-child { border-radius: 10px 0 0 10px; }
//         .items-table thead th:last-child { border-radius: 0 10px 10px 0; }
//         .items-table tbody tr:nth-child(odd) { background: var(--line-soft); }
//         .items-table tbody tr:not(:last-child) { border-bottom: 1px solid var(--line-soft); }
//         .items-table td { padding: 13px 14px; vertical-align: top; font-variant-numeric: tabular-nums; }
//         .item-desc { font-weight: 600; color: var(--ink); font-variant-numeric: normal; }
//         .item-sub {
//   font-size: 11.5px;
//   color: var(--ink-soft);
//   margin-top: 2px;
//   font-variant-numeric: normal;
//   white-space: pre-line;   /* ← ADD THIS */
// }
//         .item-total { font-weight: 700; }

//         .items-cards-mobile { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
//         @media (min-width: 720px) {
//           .items-cards-mobile { display: none; }
//         }
//         .item-mcard {
//           border: 1px solid var(--line);
//           border-radius: 12px;
//           padding: 14px;
//           background: var(--line-soft);
//         }
//         .item-mcard-head { margin-bottom: 10px; }
//         .item-mgrid {
//           display: grid;
//           grid-template-columns: repeat(2, 1fr);
//           gap: 8px 14px;
//           font-size: 12.5px;
//         }
//         .item-mgrid .mlabel {
//           font-size: 10px;
//           text-transform: uppercase;
//           letter-spacing: 0.06em;
//           color: var(--ink-soft);
//           display: block;
//         }
//         .item-mgrid .mvalue { font-weight: 600; color: var(--ink); font-variant-numeric: tabular-nums; }
//         .item-mtotal {
//           margin-top: 10px;
//           padding-top: 10px;
//           border-top: 1px dashed var(--line);
//           display: flex;
//           justify-content: space-between;
//           font-weight: 700;
//           font-size: 14px;
//         }

//         .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 26px; margin-top: 6px; }
//         .totals-box {
//           position: relative;
//           width: 100%;
//           background: var(--line-soft);
//           border: 1px solid var(--line);
//           border-radius: 14px;
//           padding: 24px 20px 18px;
//         }
//         @media (min-width: 480px) { .totals-box { width: 320px; } }
//         .totals-badge {
//           position: absolute;
//           top: -16px;
//           left: 20px;
//           width: 34px;
//           height: 34px;
//           border-radius: 50%;
//           background: linear-gradient(135deg, var(--indigo-deep), var(--indigo));
//           color: #fff;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           box-shadow: 0 4px 10px rgba(76,63,191,0.35);
//         }
//         .totals-row {
//           display: flex;
//           justify-content: space-between;
//           font-size: 13.5px;
//           padding: 6px 0;
//           color: var(--ink-soft);
//         }
//         .totals-row.grand {
//           border-top: 1.5px solid var(--ink);
//           margin-top: 6px;
//           padding-top: 12px;
//           font-weight: 700;
//           font-size: 17px;
//           color: var(--ink);
//           font-family: 'Fraunces', serif;
//         }
//         .totals-row.paid { color: var(--blue); font-weight: 600; }
//         .totals-row.due {
//           font-weight: 700;
//           color: var(--rust);
//           margin-top: 6px;
//         }

//         .payments-title {
//           font-size: 11px;
//           text-transform: uppercase;
//           letter-spacing: 0.09em;
//           color: var(--blue);
//           font-weight: 700;
//           margin-bottom: 12px;
//         }
//         .payments-scroll {
//           overflow-x: auto;
//           border: 1px solid var(--line);
//           border-radius: 12px;
//         }
//         .payments-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 280px; }
//         .payments-table thead th {
//           text-align: left;
//           font-size: 10.5px;
//           text-transform: uppercase;
//           letter-spacing: 0.05em;
//           color: #fff;
//           background: var(--blue);
//           padding: 10px 14px;
//         }
//         .payments-table tbody tr:nth-child(odd) { background: var(--blue-soft); }
//         .payments-table tbody tr:not(:last-child) { border-bottom: 1px solid var(--line-soft); }
//         .payments-table td { padding: 11px 14px; font-variant-numeric: tabular-nums; }
//         .payments-table tr.total-row { background: transparent !important; }
//         .payments-table tr.total-row td { border-top: 1.5px solid var(--ink); font-weight: 700; padding-top: 12px; }

//         .doc-footer {
//           background: linear-gradient(135deg, var(--indigo-deep), var(--indigo) 140%);
//           color: rgba(255,255,255,0.92);
//           padding: 22px 18px;
//           text-align: center;
//         }
//         @media (min-width: 640px) { .doc-footer { padding: 26px 44px; } }
//         .doc-footer-thanks {
//           font-family: 'Fraunces', serif;
//           font-size: 16px;
//           font-weight: 600;
//           margin: 0 0 4px;
//         }
//         .doc-footer-sub {
//           font-size: 11.5px;
//           color: rgba(255,255,255,0.72);
//           margin: 0 0 14px;
//         }
//         .doc-footer-contacts {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 18px;
//           flex-wrap: wrap;
//           font-size: 11.5px;
//           color: rgba(255,255,255,0.85);
//         }
//         .doc-footer-contacts span {
//   display: inline-flex;
//   align-items: center;
//   white-space: nowrap;
//   color: #fff;
// }
//         .footer-icon-white {
//           display: block;
//           flex-shrink: 0;
//           margin-right: 6px;
//           color: #fff;
//         }
//         .footer-emoji {
//           margin-right: 6px;
//         }

//         .state-card {
//           background: #fff;
//           border: 1px solid var(--line);
//           border-radius: 18px;
//           padding: 60px 20px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 10px;
//           color: var(--ink-soft);
//         }
//         .state-card.error { color: var(--rust); }

//         .edit-stack { display: flex; flex-direction: column; gap: 6px; }
//         .edit-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
//         .edit-input {
//           font-family: 'IBM Plex Sans', sans-serif;
//           font-size: 13px;
//           padding: 7px 9px;
//           border: 1px solid var(--line);
//           border-radius: 8px;
//           background: #fff;
//           color: var(--ink);
//           width: 100%;
//         }
//         .edit-input:focus {
//           outline: none;
//           border-color: var(--indigo);
//           box-shadow: 0 0 0 3px rgba(31,110,74,0.12);
//         }
//         .cell-input { min-width: 90px; }
//         .cell-num { text-align: right; }

//         .item-cards { display: flex; flex-direction: column; gap: 14px; margin-bottom: 26px; }
//         .item-edit-card {
//           border: 1px solid var(--line);
//           border-radius: 12px;
//           padding: 16px;
//           background: #fff;
//         }
//         .item-edit-top {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           margin-bottom: 10px;
//         }
//         .item-edit-index {
//           font-size: 11px;
//           text-transform: uppercase;
//           letter-spacing: 0.06em;
//           color: var(--ink-soft);
//           font-weight: 700;
//         }
//         .remove-item-btn {
//           display: inline-flex;
//           align-items: center;
//           gap: 5px;
//           font-size: 12.5px;
//           font-weight: 600;
//           color: var(--rust);
//           background: var(--rust-soft);
//           border: 1px solid rgba(156,64,37,0.25);
//           border-radius: 8px;
//           padding: 6px 10px;
//           cursor: pointer;
//           white-space: nowrap;
//         }
//         .remove-item-btn:hover { filter: brightness(0.97); }
//         .item-edit-grid {
//           display: grid;
//           grid-template-columns: repeat(3, 1fr);
//           gap: 8px;
//           margin-top: 8px;
//         }
//         .item-edit-grid label {
//           font-size: 10.5px;
//           text-transform: uppercase;
//           letter-spacing: 0.05em;
//           color: var(--ink-soft);
//           display: flex;
//           flex-direction: column;
//           gap: 3px;
//         }
//         .item-edit-summary {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 14px;
//           margin-top: 12px;
//           padding-top: 10px;
//           border-top: 1px dashed var(--line-soft);
//           font-size: 12.5px;
//           color: var(--ink-soft);
//         }
//         .item-edit-total { font-weight: 700; color: var(--ink); }
//       `}</style>

//       <ToastContainer position="top-right" autoClose={3000} />

//       <div className="invoice-shell">
//         <div className="invoice-topbar">
//           <button onClick={() => navigate(-1)} className="btn-ghost">
//             <ArrowLeft size={15} /> Back
//           </button>

//           {invoice && !isEditing && (
//             <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
//               <button onClick={startEditing} className="btn-ghost">
//                 <Pencil size={15} /> Edit
//               </button>
//               <button onClick={handleDownload} disabled={downloading} className="btn-solid">
//                 {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
//                 {downloading ? "Preparing…" : `Download ${docLabel}`}
//               </button>
//             </div>
//           )}

//           {isEditing && (
//             <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
//               <button onClick={cancelEditing} className="btn-ghost" disabled={saving}>
//                 <X size={15} /> Cancel
//               </button>
//               <button onClick={applyChanges} className="btn-solid" disabled={saving}>
//                 {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
//                 {saving ? "Saving…" : "Save Changes"}
//               </button>
//             </div>
//           )}
//         </div>

//         {loading && (
//           <div className="state-card">
//             <Loader2 className="animate-spin" size={18} />
//             Loading invoice…
//           </div>
//         )}

//         {!loading && error && <div className="state-card error">{error}</div>}

//         {!loading && !error && invoice && (
//           <div ref={printRef} className={`doc-card${isCapturing ? " pdf-flat" : ""}`}>
//             <div className="doc-topline">
//               <span>Generated <strong>{formatDateTime(new Date())}</strong></span>
//               <span><strong>{invoice.invoiceNumber}</strong> · {invoice.billedTo?.name}</span>
//             </div>

//             <div className="doc-head">
//               <div>
//                 <p className="doc-eyebrow">GV — Tour Planners</p>
//                 {isCapturing ? (
//                   <h1 className="doc-title-font">
//                     {docLabel} <span className="pdf-status-text" style={{ color: isPaid ? TOKENS.ok : TOKENS.rust }}>
//                       - {isPaid ? "Full Paid" : "Part Paid"}
//                     </span>
//                   </h1>
//                 ) : (
//                   <div className="title-row">
//                     <h1 className="doc-title-font">{docLabel}</h1>
//                     <StatusStamp isPaid={isPaid} />
//                   </div>
//                 )}
//               </div>
//               <div className="brand-logo-frame">
//                 <img src={logo} alt="GV - Tour Planners" />
//               </div>
//             </div>

//             <div className="doc-body">
//               <div className="meta-strip">
//                 <div className="meta-field">
//                   <div className="meta-icon"><FileText size={14} /></div>
//                   <div>
//                     <p className="meta-label">{docLabel} No.</p>
//                     <p className="meta-value">{invoice.invoiceNumber}</p>
//                   </div>
//                 </div>
//                 <div className="meta-field">
//                   <div className="meta-icon"><CalendarDays size={14} /></div>
//                   <div>
//                     <p className="meta-label">Purchase Date</p>
//                     <p className="meta-value">{formatDate(invoice.purchaseDate)}</p>
//                   </div>
//                 </div>
//                 <div className="meta-field">
//                   <div className="meta-icon"><CalendarDays size={14} /></div>
//                   <div>
//                     <p className="meta-label">Due Date</p>
//                     <p className="meta-value">{formatDate(invoice.dueDate)}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="party-grid">
//                 <div className="party-card">
//                   <div className="party-label-row">
//                     <div className="party-icon"><Building2 size={13} /></div>
//                     <p className="party-label">Billed By</p>
//                   </div>
//                   <p className="party-name">{invoice.billedBy?.companyName}</p>
//                   <p className="party-line">
//                     {invoice.billedBy?.addressLine1}, {invoice.billedBy?.city}
//                     <br />
//                     {invoice.billedBy?.state}, {invoice.billedBy?.country} - {invoice.billedBy?.pincode}
//                   </p>
//                   <p className="party-detail"><strong>GSTIN</strong> {invoice.billedBy?.gstin}</p>
//                   <p className="party-detail"><strong>PAN</strong> {invoice.billedBy?.pan}</p>
//                   <p className="party-detail"><strong>Phone</strong> {invoice.billedBy?.phone}</p>
//                   <p className="party-detail"><strong>TAN</strong> {invoice.billedBy?.tan}</p>
//                 </div>

//                 <div className="party-card">
//                   <div className="party-label-row">
//                     <div className="party-icon"><User size={13} /></div>
//                     <p className="party-label">Billed To</p>
//                   </div>
//                   {isEditing ? (
//                     <div className="edit-stack">
//                       <input
//                         className="edit-input"
//                         value={draft.billedTo?.name || ""}
//                         placeholder="Name"
//                         onChange={(e) => updateBilledTo("name", e.target.value)}
//                       />
//                       <input
//                         className="edit-input"
//                         value={draft.billedTo?.addressLine1 || ""}
//                         placeholder="Address line 1"
//                         onChange={(e) => updateBilledTo("addressLine1", e.target.value)}
//                       />
//                       <input
//                         className="edit-input"
//                         value={draft.billedTo?.addressLine2 || ""}
//                         placeholder="Address line 2"
//                         onChange={(e) => updateBilledTo("addressLine2", e.target.value)}
//                       />
//                       <div className="edit-row-3">
//                         <input
//                           className="edit-input"
//                           value={draft.billedTo?.city || ""}
//                           placeholder="City"
//                           onChange={(e) => updateBilledTo("city", e.target.value)}
//                         />
//                         <input
//                           className="edit-input"
//                           value={draft.billedTo?.state || ""}
//                           placeholder="State"
//                           onChange={(e) => updateBilledTo("state", e.target.value)}
//                         />
//                         <input
//                           className="edit-input"
//                           value={draft.billedTo?.pincode || ""}
//                           placeholder="Pincode"
//                           onChange={(e) => updateBilledTo("pincode", e.target.value)}
//                         />
//                       </div>
//                       <input
//                         className="edit-input"
//                         value={draft.billedTo?.phone || ""}
//                         placeholder="Phone"
//                         onChange={(e) => updateBilledTo("phone", e.target.value)}
//                       />
//                     </div>
//                   ) : (
//                     <>
//                       <p className="party-name">{invoice.billedTo?.name}</p>
//                       <p className="party-line">
//                         {invoice.billedTo?.addressLine1}
//                         {invoice.billedTo?.addressLine2 && <>, {invoice.billedTo.addressLine2}</>}
//                         <br />
//                         {invoice.billedTo?.city}, {invoice.billedTo?.state}, {invoice.billedTo?.country} - {invoice.billedTo?.pincode}
//                       </p>
//                       <p className="party-detail"><strong>Phone</strong> {invoice.billedTo?.phone}</p>
//                     </>
//                   )}
//                 </div>
//               </div>

//               {(invoice.countryOfSupply || invoice.placeOfSupply) && (
//                 <div className="supply-row">
//                   <span><strong>Country of Supply</strong> {invoice.countryOfSupply}</span>
//                   <span><strong>Place of Supply</strong> {invoice.placeOfSupply}</span>
//                 </div>
//               )}

//               {isEditing ? (
//                 <div className="item-cards">
//                   {draft.items.map((item, idx) => (
//                     <div key={idx} className="item-edit-card">
//                       <div className="item-edit-top">
//                         <span className="item-edit-index">Item {idx + 1}</span>
//                         <button type="button" className="remove-item-btn" onClick={() => removeItemRow(idx)}>
//                           <Trash2 size={14} /> Remove Item
//                         </button>
//                       </div>

//                       <input
//                         className="edit-input"
//                         value={item.description}
//                         placeholder="Description"
//                         onChange={(e) => updateItemField(idx, "description", e.target.value)}
//                       />
//                       <input
//                         className="edit-input"
//                         style={{ marginTop: 6 }}
//                         value={item.subDescription || ""}
//                         placeholder="Sub-description (optional)"
//                         onChange={(e) => updateItemField(idx, "subDescription", e.target.value)}
//                       />

//                       <div className="item-edit-grid">
//                         <label>
//                           GST %
//                           <input
//                             type="number"
//                             className="edit-input"
//                             value={item.gstRate}
//                             onChange={(e) => updateItemField(idx, "gstRate", e.target.value)}
//                           />
//                         </label>
//                         <label>
//                           Qty
//                           <input
//                             type="number"
//                             className="edit-input"
//                             value={item.quantity}
//                             onChange={(e) => updateItemField(idx, "quantity", e.target.value)}
//                           />
//                         </label>
//                         <label>
//                           Rate
//                           <input
//                             type="number"
//                             className="edit-input"
//                             value={item.rate}
//                             onChange={(e) => updateItemField(idx, "rate", e.target.value)}
//                           />
//                         </label>
//                       </div>

//                       <div className="item-edit-summary">
//                         <span>Amount {currency(item.amount)}</span>
//                         <span>CGST {currency(item.cgst)}</span>
//                         <span>SGST {currency(item.sgst)}</span>
//                         <span className="item-edit-total">Total {currency(item.total)}</span>
//                       </div>
//                     </div>
//                   ))}
//                   <button type="button" className="btn-ghost" onClick={addItemRow}>
//                     <Plus size={14} /> Add Item
//                   </button>
//                 </div>
//               ) : (
//                 <>
//                   <div className="items-table-wrap">
//                     <table className="items-table">
//                       <thead>
//                         <tr>
//                           <th>Item</th>
//                           <th>GST</th>
//                           <th>Qty</th>
//                           <th>Rate</th>
//                           <th>Amount</th>
//                           <th>CGST</th>
//                           <th>SGST</th>
//                           <th>Total</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {(displayItems || []).map((item, idx) => (
//                           <tr key={idx}>
//                             <td>
//                               <p className="item-desc">{item.description}</p>
//                               {item.subDescription && <p className="item-sub">{item.subDescription}</p>}
//                             </td>
//                             <td>{item.gstRate}%</td>
//                             <td>{item.quantity}</td>
//                             <td>{currency(item.rate)}</td>
//                             <td>{currency(item.amount)}</td>
//                             <td>{currency(item.cgst)}</td>
//                             <td>{currency(item.sgst)}</td>
//                             <td className="item-total">{currency(item.total)}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="items-cards-mobile">
//                     {(displayItems || []).map((item, idx) => (
//                       <div key={idx} className="item-mcard">
//                         <div className="item-mcard-head">
//                           <p className="item-desc">{item.description}</p>
//                           {item.subDescription && <p className="item-sub">{item.subDescription}</p>}
//                         </div>
//                         <div className="item-mgrid">
//                           <div><span className="mlabel">GST</span><span className="mvalue">{item.gstRate}%</span></div>
//                           <div><span className="mlabel">Qty</span><span className="mvalue">{item.quantity}</span></div>
//                           <div><span className="mlabel">Rate</span><span className="mvalue">{currency(item.rate)}</span></div>
//                           <div><span className="mlabel">Amount</span><span className="mvalue">{currency(item.amount)}</span></div>
//                           <div><span className="mlabel">CGST</span><span className="mvalue">{currency(item.cgst)}</span></div>
//                           <div><span className="mlabel">SGST</span><span className="mvalue">{currency(item.sgst)}</span></div>
//                         </div>
//                         <div className="item-mtotal">
//                           <span>Total</span>
//                           <span>{currency(item.total)}</span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </>
//               )}

//               <div className="totals-wrap">
//                 <div className="totals-box">
//                   <div className="totals-badge"><FileText size={15} /></div>
//                   <div className="totals-row">
//                     <span>Amount</span>
//                     <span>{currency(displayTotals?.amount)}</span>
//                   </div>
//                   <div className="totals-row">
//                     <span>CGST</span>
//                     <span>{currency(displayTotals?.cgst)}</span>
//                   </div>
//                   <div className="totals-row">
//                     <span>SGST</span>
//                     <span>{currency(displayTotals?.sgst)}</span>
//                   </div>
//                   <div className="totals-row">
//                     <span>Round off</span>
//                     {isEditing ? (
//                       <input
//                         type="number"
//                         className="edit-input cell-num"
//                         style={{ width: 90, textAlign: "right" }}
//                         value={draft.totals?.roundOff || 0}
//                         onChange={(e) => updateRoundOff(e.target.value)}
//                       />
//                     ) : (
//                       <span>({currency(invoice.totals?.roundOff)})</span>
//                     )}
//                   </div>
//                   <div className="totals-row grand">
//                     <span>Total (INR)</span>
//                     <span>{currency(displayTotals?.grandTotal)}</span>
//                   </div>
//                   <div className="totals-row paid">
//                     <span>Amount Paid</span>
//                     {isEditing ? (
//                       <input
//                         type="number"
//                         className="edit-input cell-num"
//                         style={{ width: 110, textAlign: "right" }}
//                         value={draft.amountPaid || 0}
//                         onChange={(e) => updateAmountPaid(e.target.value)}
//                       />
//                     ) : (
//                       <span>({currency(invoice.amountPaid)})</span>
//                     )}
//                   </div>
//                   {(isEditing ? draft.dueAmount > 0 : !isPaid) && (
//                     <div className="totals-row due">
//                       <span>Due Amount</span>
//                       <span>{currency(isEditing ? draft.dueAmount : invoice.dueAmount)}</span>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {(displayPayments || []).length > 0 || isEditing ? (
//                 <div data-page-safe>
//                   <p className="payments-title">Payments</p>
//                   <div className="payments-scroll">
//                     <table className="payments-table">
//                       <thead>
//                         <tr>
//                           <th>Date</th>
//                           <th>Amount</th>
//                           {isEditing && <th></th>}
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {(displayPayments || []).map((p, idx) =>
//                           isEditing ? (
//                             <tr key={idx}>
//                               <td>
//                                 <input
//                                   type="date"
//                                   className="edit-input cell-input"
//                                   value={p.date ? new Date(p.date).toISOString().slice(0, 10) : ""}
//                                   onChange={(e) => updatePaymentField(idx, "date", e.target.value)}
//                                 />
//                               </td>
//                               <td>
//                                 <input
//                                   type="number"
//                                   className="edit-input cell-input cell-num"
//                                   value={p.amountReceived}
//                                   onChange={(e) => updatePaymentField(idx, "amountReceived", e.target.value)}
//                                 />
//                               </td>
//                               <td>
//                                 <button type="button" className="remove-item-btn" onClick={() => removePaymentRow(idx)}>
//                                   <Trash2 size={14} /> Remove
//                                 </button>
//                               </td>
//                             </tr>
//                           ) : (
//                             <tr key={idx}>
//                               <td>{formatDateTime(p.date)}</td>
//                               <td>{currency(p.amountReceived)}</td>
//                             </tr>
//                           ),
//                         )}
//                         {!isEditing && (
//                           <tr className="total-row">
//                             <td>Total</td>
//                             <td>{currency(totalPaid)}</td>
//                           </tr>
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                   {isEditing && (
//                     <button type="button" className="btn-ghost" style={{ marginTop: 10 }} onClick={addPaymentRow}>
//                       <Plus size={14} /> Add Payment
//                     </button>
//                   )}
//                 </div>
//               ) : null}
//             </div>

//             <div className="doc-footer">
//               <p className="doc-footer-thanks">Thank you for your business!</p>
//               <p className="doc-footer-sub">We look forward to serving you again.</p>
//               <div className="doc-footer-contacts">
//                 {invoice.billedBy?.phone && (
//                   <span>☏ {invoice.billedBy.phone}</span>
//                 )}
//                 <span><span className="footer-emoji">✉️</span> info@gvtourplanners.com</span>
//                 <span><span className="footer-emoji">🌐</span> www.gvtourplanners.com</span>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Invoice;


import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Loader2, CheckCircle2, Clock, Pencil, Plus, Trash2, Save, X, FileText, CalendarDays, Building2, User, Phone } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { TourContext } from "../../context/TourContext"; // ← adjust path/name to your app's context
import logo from "/src/assets/TM.png"; // ← adjust path to wherever you save the logo

// ── Design tokens ─────────────────────────────────────────────────────────
const TOKENS = {
  ink: "#152420",
  inkSoft: "#5C6F63",
  indigo: "#1F6E4A",
  indigoDeep: "#123C29",
  indigoSoft: "#E7F1EA",
  indigoLine: "#DCE8DE",
  blue: "#1D6FA3",
  blueDeep: "#1309d3ff",
  blueSoft: "#E7F1F8",
  sand: "#F6F8F3",
  rust: "#C0392B",
  rustSoft: "#FBEAE9",
  ok: "#1F6E4A",
  okSoft: "#E7F1EA",
  parchment: "#FFFFFF",
  line: "#E4E1F0",
  lineSoft: "#EDF4EE",
};

const currency = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "—";

const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "—";

const StatusStamp = ({ isPaid }) => {
  const bg = isPaid ? TOKENS.ok : TOKENS.rust;
  const label = isPaid ? "Paid" : "Part Paid";
  return (
    <div className="status-pill" style={{ background: bg }}>
      {isPaid ? (
        <CheckCircle2 size={11} strokeWidth={2.5} />
      ) : (
        <Clock size={11} strokeWidth={2.5} />
      )}
      <span>{label}</span>
    </div>
  );
};

const Invoice = () => {
  const { tnr } = useParams();
  const navigate = useNavigate();
  const { getBookingInvoice, updateBookingInvoice } = useContext(TourContext);

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const printRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getBookingInvoice(tnr);
        if (response.success && response.invoice) {
          setInvoice(response.invoice);
        } else {
          setError(response.message || "Invoice not available yet");
        }
      } catch (err) {
        console.error("Fetch invoice error:", err);
        setError(err.message || "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    if (tnr) fetchInvoice();
  }, [tnr, getBookingInvoice]);

  const round2 = (n) => Math.round(Number(n || 0) * 100) / 100;

  const recalcItem = (item) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const gstRate = Number(item.gstRate) || 0;
    const amount = round2(qty * rate);
    const gstTotal = round2((amount * gstRate) / 100);
    const cgst = round2(gstTotal / 2);
    const sgst = round2(gstTotal - cgst);
    const total = round2(amount + cgst + sgst);
    return { ...item, amount, cgst, sgst, total };
  };

  const recalcDraftTotals = (d) => {
    const items = d.items || [];
    const amountSum = round2(items.reduce((s, i) => s + Number(i.amount || 0), 0));
    const cgstSum = round2(items.reduce((s, i) => s + Number(i.cgst || 0), 0));
    const sgstSum = round2(items.reduce((s, i) => s + Number(i.sgst || 0), 0));
    const roundOff = Number(d.totals?.roundOff || 0);
    const grandTotal = round2(amountSum + cgstSum + sgstSum + roundOff);
    const amountPaid = round2(d.amountPaid || 0);
    const dueAmount = Math.max(0, round2(grandTotal - amountPaid));
    return {
      ...d,
      totals: { amount: amountSum, cgst: cgstSum, sgst: sgstSum, roundOff, grandTotal },
      dueAmount,
    };
  };

  const startEditing = () => {
    setDraft(JSON.parse(JSON.stringify(invoice)));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(null);
    setIsEditing(false);
  };

  const updateBilledTo = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      billedTo: { ...prev.billedTo, [field]: value },
    }));
  };

  const updateItemField = (idx, field, value) => {
    setDraft((prev) => {
      const items = [...prev.items];
      items[idx] = recalcItem({ ...items[idx], [field]: value });
      return recalcDraftTotals({ ...prev, items });
    });
  };

  const addItemRow = () => {
    setDraft((prev) => {
      const items = [
        ...prev.items,
        {
          description: "New Item",
          subDescription: "",
          gstRate: 0,
          quantity: 1,
          rate: 0,
          amount: 0,
          cgst: 0,
          sgst: 0,
          total: 0,
        },
      ];
      return recalcDraftTotals({ ...prev, items });
    });
  };

  const removeItemRow = (idx) => {
    setDraft((prev) => {
      const items = prev.items.filter((_, i) => i !== idx);
      return recalcDraftTotals({ ...prev, items });
    });
  };

  const updateRoundOff = (value) => {
    setDraft((prev) =>
      recalcDraftTotals({
        ...prev,
        totals: { ...prev.totals, roundOff: Number(value) || 0 },
      }),
    );
  };

  const updateAmountPaid = (value) => {
    setDraft((prev) => recalcDraftTotals({ ...prev, amountPaid: Number(value) || 0 }));
  };

  const updatePaymentField = (idx, field, value) => {
    setDraft((prev) => {
      const payments = [...prev.payments];
      payments[idx] = { ...payments[idx], [field]: value };
      return { ...prev, payments };
    });
  };

  const addPaymentRow = () => {
    setDraft((prev) => ({
      ...prev,
      payments: [...(prev.payments || []), { date: new Date(), amountReceived: 0 }],
    }));
  };

  const removePaymentRow = (idx) => {
    setDraft((prev) => ({
      ...prev,
      payments: prev.payments.filter((_, i) => i !== idx),
    }));
  };

  const applyChanges = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const response = await updateBookingInvoice(tnr, draft);
      if (response.success && response.invoice) {
        setInvoice(response.invoice);
        setIsEditing(false);
        setDraft(null);
        toast.success("Invoice saved");
      } else {
        toast.error(response.message || "Failed to save invoice");
      }
    } catch (err) {
      console.error("Save invoice error:", err);
      toast.error(err.message || "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  const isPaid = invoice?.status === "Paid";
  const docLabel = isPaid ? "Invoice" : "Receipt";

  const totalPaid = (invoice?.payments || []).reduce(
    (sum, p) => sum + Number(p.amountReceived || 0),
    0,
  );

  const handleDownload = async () => {
    if (!printRef.current || !invoice) return;
    setDownloading(true);
    try {
      setIsCapturing(true);
      await new Promise((resolve) => setTimeout(resolve, 80));

      const canvas = await html2canvas(printRef.current, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: TOKENS.parchment,
      });
      setIsCapturing(false);

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidthMm = pdf.internal.pageSize.getWidth();
      const pageHeightMm = pdf.internal.pageSize.getHeight();

      const pxPerMm = canvas.width / pageWidthMm;
      const pageHeightPx = pageHeightMm * pxPerMm;

      const containerRect = printRef.current.getBoundingClientRect();
      const scaleFactor = canvas.width / containerRect.width;

      // Every atomic block — item rows/cards, the totals box, the payments
      // section — must never be visually CUT across a page boundary. But
      // they should NOT force a fresh page just because they start within
      // the current page's range; they only need to move to the next page
      // if they don't fully fit in what's left of THIS page.
      const atomicEls = printRef.current.querySelectorAll("[data-page-safe]");
      const atomicBounds = Array.from(atomicEls).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          top: (r.top - containerRect.top) * scaleFactor,
          bottom: (r.bottom - containerRect.top) * scaleFactor,
        };
      });

      let cursor = 0;
      let pageIndex = 0;

      while (cursor < canvas.height) {
        const naturalEnd = Math.min(cursor + pageHeightPx, canvas.height);
        let sliceEnd = naturalEnd;

        // Find the EARLIEST atomic block that would be sliced in half by this
        // page (starts before naturalEnd, ends after it). If found, and it
        // fits within a single page's height on its own, end this page right
        // before it starts instead — pushing the whole block to the next page.
        let cutBlock = null;
        for (const b of atomicBounds) {
          if (b.top < naturalEnd && b.bottom > naturalEnd && b.top >= cursor) {
            if (!cutBlock || b.top < cutBlock.top) cutBlock = b;
          }
        }

        if (cutBlock && cutBlock.bottom - cutBlock.top <= pageHeightPx) {
          sliceEnd = cutBlock.top;
        }

        let sliceHeight = sliceEnd - cursor;
        if (sliceHeight < 50) {
          sliceHeight = naturalEnd - cursor; // safety net, avoid infinite/zero pages
        }

        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeight;
        const ctx = sliceCanvas.getContext("2d");
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(
          canvas,
          0, cursor, canvas.width, sliceHeight,
          0, 0, canvas.width, sliceHeight,
        );

        const sliceImgData = sliceCanvas.toDataURL("image/jpeg", 0.85);
        const sliceHeightMm = sliceHeight / pxPerMm;

        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(sliceImgData, "JPEG", 0, 0, pageWidthMm, sliceHeightMm);

        cursor += sliceHeight;
        pageIndex++;
      }

      pdf.save(`${docLabel}-${invoice.invoiceNumber}.pdf`);
      toast.success(`${docLabel} downloaded`);
    } catch (err) {
      setIsCapturing(false);
      console.error("PDF download failed:", err);
      toast.error("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  const displayItems = isEditing ? draft?.items : invoice?.items;
  const displayPayments = isEditing ? draft?.payments : invoice?.payments;
  const displayTotals = isEditing ? draft?.totals : invoice?.totals;

  return (
    <div className="invoice-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

        :root {
          --ink: ${TOKENS.ink};
          --ink-soft: ${TOKENS.inkSoft};
          --indigo: ${TOKENS.indigo};
          --indigo-deep: ${TOKENS.indigoDeep};
          --indigo-soft: ${TOKENS.indigoSoft};
          --indigo-line: ${TOKENS.indigoLine};
          --blue: ${TOKENS.blue};
          --blue-deep: ${TOKENS.blueDeep};
          --blue-soft: ${TOKENS.blueSoft};
          --ok: ${TOKENS.ok};
          --ok-soft: ${TOKENS.okSoft};
          --rust: ${TOKENS.rust};
          --rust-soft: ${TOKENS.rustSoft};
          --line: ${TOKENS.line};
          --line-soft: ${TOKENS.lineSoft};
        }

        .invoice-page {
          min-height: 100vh;
          padding: 20px 14px 60px;
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          color: var(--ink);
          background:
            radial-gradient(circle at 12% 8%, rgba(31,110,74,0.07), transparent 42%),
            radial-gradient(circle at 88% 92%, rgba(192,57,43,0.05), transparent 40%),
            ${TOKENS.sand};
        }
        @media (min-width: 640px) {
          .invoice-page { padding: 36px 24px 80px; }
        }

        .invoice-shell { max-width: 900px; margin: 0 auto; }

        .invoice-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          font-size: 13.5px;
          font-weight: 600;
          border-radius: 10px;
          border: 1.5px solid var(--line);
          background: #fff;
          color: var(--ink-soft);
          cursor: pointer;
          transition: border-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
        }
        .btn-ghost:hover { border-color: var(--indigo); color: var(--indigo); }
        .btn-ghost:active { transform: translateY(1px); }
        .btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-solid {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: 0.01em;
          border-radius: 10px;
          border: none;
          color: #fff;
          background: var(--indigo-deep);
          cursor: pointer;
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .btn-solid:hover { background: var(--indigo); }
        .btn-solid:active { transform: translateY(1px); }
        .btn-solid:disabled { opacity: 0.55; cursor: not-allowed; }

        .doc-card {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 2px 6px rgba(18,60,41,0.06), 0 18px 40px rgba(18,60,41,0.08);
        }
          .doc-card.pdf-flat {
  border-radius: 0;
  box-shadow: none;
}

        .doc-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 20px;
          font-size: 11.5px;
          color: var(--ink-soft);
          border-bottom: 1px solid var(--line-soft);
          flex-wrap: wrap;
        }
        @media (min-width: 640px) {
          .doc-topline { padding: 18px 44px; }
        }
        .doc-topline strong { color: var(--ink); font-weight: 600; }

        .doc-head {
          padding: 26px 20px 22px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        @media (min-width: 640px) {
          .doc-head { padding: 34px 44px 28px; }
        }

        .doc-title-font {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: 36px;
          line-height: 1;
          letter-spacing: -0.01em;
          margin: 0;
          color: var(--blue-deep);
        }
        @media (min-width: 640px) {
          .doc-title-font { font-size: 46px; }
        }
        .pdf-status-text {
          display: inline-block;
          position: relative;
          top: 9px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }
        .doc-eyebrow {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: var(--ink-soft);
          margin: 0 0 8px;
          font-weight: 600;
        }

        .brand-logo-frame {
          width: 108px;
          height: 108px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        @media (min-width: 640px) {
          .brand-logo-frame { width: 128px; height: 128px; }
        }
        .brand-logo-frame img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .title-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          flex-wrap: wrap;
        }
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 11px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          line-height: 1;
          color: #fff;
          white-space: nowrap;
          margin-top: 14px;
        }
        .status-pill svg { display: block; flex-shrink: 0; }

        .doc-body { padding: 8px 18px 24px; }
        @media (min-width: 640px) {
          .doc-body { padding: 8px 44px 30px; }
        }

        .meta-strip {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          padding-bottom: 22px;
          margin-bottom: 24px;
          border-bottom: 1px dashed var(--line);
        }
        @media (min-width: 640px) {
          .meta-strip { grid-template-columns: repeat(3, 1fr); }
        }
        .meta-field {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          background: var(--line-soft);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 10px 12px;
        }
        .meta-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--indigo);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .meta-label {
          font-size: 9.5px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--ink-soft);
          margin: 0 0 2px;
        }
        .meta-value {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 700;
          color: var(--ink);
          margin: 0;
          font-variant-numeric: tabular-nums;
          line-height: 1.3;
        }

        .party-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-bottom: 26px;
        }
        @media (min-width: 640px) {
          .party-grid { grid-template-columns: 1fr 1fr; }
        }
        .party-card {
          background: var(--indigo-soft);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 18px 18px;
        }
        .party-label-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 10px;
        }
        .party-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--indigo);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .party-label {
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: var(--indigo);
          font-weight: 700;
          margin: 0;
        }
        .party-name { font-weight: 700; font-size: 15.5px; margin: 0 0 4px; color: var(--ink); }
        .party-line { font-size: 13px; color: var(--ink-soft); line-height: 1.65; margin: 0; }
        .party-detail { font-size: 13px; margin-top: 6px; color: var(--ink-soft); }
        .party-detail strong { color: var(--ink); font-weight: 600; }

        .supply-row {
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
          color: var(--ink-soft);
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 8px;
          padding-bottom: 18px;
          border-bottom: 1px dashed var(--line);
        }
        .supply-row strong { color: var(--ink); }

        .items-table-wrap { display: none; margin-bottom: 24px; }
        @media (min-width: 720px) {
          .items-table-wrap { display: block; }
        }
        .items-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; }
        .items-table thead th {
          background: var(--indigo-deep);
          color: #fff;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 12px 14px;
        }
        .items-table thead th:first-child { border-radius: 10px 0 0 10px; }
        .items-table thead th:last-child { border-radius: 0 10px 10px 0; }
        .items-table tbody tr:nth-child(odd) { background: var(--line-soft); }
        .items-table tbody tr:not(:last-child) { border-bottom: 1px solid var(--line-soft); }
        .items-table td { padding: 13px 14px; vertical-align: top; font-variant-numeric: tabular-nums; }
        .item-desc { font-weight: 600; color: var(--ink); font-variant-numeric: normal; }
        .item-sub {
          font-size: 11.5px;
          color: var(--ink-soft);
          margin-top: 2px;
          font-variant-numeric: normal;
          white-space: pre-line;
        }
        .item-total { font-weight: 700; }

        .items-cards-mobile { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
        @media (min-width: 720px) {
          .items-cards-mobile { display: none; }
        }
        .item-mcard {
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 14px;
          background: var(--line-soft);
        }
        .item-mcard-head { margin-bottom: 10px; }
        .item-mgrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px 14px;
          font-size: 12.5px;
        }
        .item-mgrid .mlabel {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--ink-soft);
          display: block;
        }
        .item-mgrid .mvalue { font-weight: 600; color: var(--ink); font-variant-numeric: tabular-nums; }
        .item-mtotal {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px dashed var(--line);
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          font-size: 14px;
        }

        .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 26px; margin-top: 6px; }
        .totals-box {
          position: relative;
          width: 100%;
          background: var(--line-soft);
          border: 1px solid var(--line);
          border-radius: 14px;
          /* extra top padding so the badge below sits fully INSIDE this
             box's own layout bounds — nothing overflows above the box's
             measured top edge, which is what the PDF page-slicer uses to
             decide where a safe page break is. An overflowing badge was
             getting orphaned on the previous page while the rest of the
             box moved to the next one. */
          padding: 40px 20px 18px;
        }
        @media (min-width: 480px) { .totals-box { width: 320px; } }
        .totals-badge {
          position: absolute;
          top: 10px;
          left: 20px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--indigo-deep), var(--indigo));
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(76,63,191,0.35);
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          font-size: 13.5px;
          padding: 6px 0;
          color: var(--ink-soft);
        }
        .totals-row.grand {
          border-top: 1.5px solid var(--ink);
          margin-top: 6px;
          padding-top: 12px;
          font-weight: 700;
          font-size: 17px;
          color: var(--ink);
          font-family: 'Fraunces', serif;
        }
        .totals-row.paid { color: var(--blue); font-weight: 600; }
        .totals-row.due {
          font-weight: 700;
          color: var(--rust);
          margin-top: 6px;
        }

        .payments-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: var(--blue);
          font-weight: 700;
          margin-bottom: 12px;
        }
        .payments-scroll {
          overflow-x: auto;
          border: 1px solid var(--line);
          border-radius: 12px;
        }
        .payments-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 280px; }
        .payments-table thead th {
          text-align: left;
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #fff;
          background: var(--blue);
          padding: 10px 14px;
        }
        .payments-table tbody tr:nth-child(odd) { background: var(--blue-soft); }
        .payments-table tbody tr:not(:last-child) { border-bottom: 1px solid var(--line-soft); }
        .payments-table td { padding: 11px 14px; font-variant-numeric: tabular-nums; }
        .payments-table tr.total-row { background: transparent !important; }
        .payments-table tr.total-row td { border-top: 1.5px solid var(--ink); font-weight: 700; padding-top: 12px; }

        .doc-footer {
          background: linear-gradient(135deg, var(--indigo-deep), var(--indigo) 140%);
          color: rgba(255,255,255,0.92);
          padding: 22px 18px;
          text-align: center;
        }
        @media (min-width: 640px) { .doc-footer { padding: 26px 44px; } }
        .doc-footer-thanks {
          font-family: 'Fraunces', serif;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px;
        }
        .doc-footer-sub {
          font-size: 11.5px;
          color: rgba(255,255,255,0.72);
          margin: 0 0 14px;
        }
        .doc-footer-contacts {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          flex-wrap: wrap;
          font-size: 11.5px;
          color: rgba(255,255,255,0.85);
        }
        .doc-footer-contacts span {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  color: #fff;
}
        .footer-icon-white {
          display: block;
          flex-shrink: 0;
          margin-right: 6px;
          color: #fff;
        }
        .footer-emoji {
          margin-right: 6px;
        }

        .state-card {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 60px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: var(--ink-soft);
        }
        .state-card.error { color: var(--rust); }

        .edit-stack { display: flex; flex-direction: column; gap: 6px; }
        .edit-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
        .edit-input {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 13px;
          padding: 7px 9px;
          border: 1px solid var(--line);
          border-radius: 8px;
          background: #fff;
          color: var(--ink);
          width: 100%;
        }
        .edit-input:focus {
          outline: none;
          border-color: var(--indigo);
          box-shadow: 0 0 0 3px rgba(31,110,74,0.12);
        }
        .cell-input { min-width: 90px; }
        .cell-num { text-align: right; }

        .item-cards { display: flex; flex-direction: column; gap: 14px; margin-bottom: 26px; }
        .item-edit-card {
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 16px;
          background: #fff;
        }
        .item-edit-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .item-edit-index {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--ink-soft);
          font-weight: 700;
        }
        .remove-item-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--rust);
          background: var(--rust-soft);
          border: 1px solid rgba(156,64,37,0.25);
          border-radius: 8px;
          padding: 6px 10px;
          cursor: pointer;
          white-space: nowrap;
        }
        .remove-item-btn:hover { filter: brightness(0.97); }
        .item-edit-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 8px;
        }
        .item-edit-grid label {
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--ink-soft);
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .item-edit-summary {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px dashed var(--line-soft);
          font-size: 12.5px;
          color: var(--ink-soft);
        }
        .item-edit-total { font-weight: 700; color: var(--ink); }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} />

      <div className="invoice-shell">
        <div className="invoice-topbar">
          <button onClick={() => navigate(-1)} className="btn-ghost">
            <ArrowLeft size={15} /> Back
          </button>

          {invoice && !isEditing && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={startEditing} className="btn-ghost">
                <Pencil size={15} /> Edit
              </button>
              <button onClick={handleDownload} disabled={downloading} className="btn-solid">
                {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                {downloading ? "Preparing…" : `Download ${docLabel}`}
              </button>
            </div>
          )}

          {isEditing && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={cancelEditing} className="btn-ghost" disabled={saving}>
                <X size={15} /> Cancel
              </button>
              <button onClick={applyChanges} className="btn-solid" disabled={saving}>
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {loading && (
          <div className="state-card">
            <Loader2 className="animate-spin" size={18} />
            Loading invoice…
          </div>
        )}

        {!loading && error && <div className="state-card error">{error}</div>}

        {!loading && !error && invoice && (
          <div ref={printRef} className={`doc-card${isCapturing ? " pdf-flat" : ""}`}>
            <div className="doc-topline">
              <span>Generated <strong>{formatDateTime(new Date())}</strong></span>
              <span><strong>{invoice.invoiceNumber}</strong> · {invoice.billedTo?.name}</span>
            </div>

            <div className="doc-head">
              <div>
                <p className="doc-eyebrow">GV — Tour Planners</p>
                {isCapturing ? (
                  <h1 className="doc-title-font">
                    {docLabel} <span className="pdf-status-text" style={{ color: isPaid ? TOKENS.ok : TOKENS.rust }}>
                      - {isPaid ? "Full Paid" : "Part Paid"}
                    </span>
                  </h1>
                ) : (
                  <div className="title-row">
                    <h1 className="doc-title-font">{docLabel}</h1>
                    <StatusStamp isPaid={isPaid} />
                  </div>
                )}
              </div>
              <div className="brand-logo-frame">
                <img src={logo} alt="GV - Tour Planners" />
              </div>
            </div>

            <div className="doc-body">
              <div className="meta-strip">
                <div className="meta-field">
                  <div className="meta-icon"><FileText size={14} /></div>
                  <div>
                    <p className="meta-label">{docLabel} No.</p>
                    <p className="meta-value">{invoice.invoiceNumber}</p>
                  </div>
                </div>
                <div className="meta-field">
                  <div className="meta-icon"><CalendarDays size={14} /></div>
                  <div>
                    <p className="meta-label">Purchase Date</p>
                    <p className="meta-value">{formatDate(invoice.purchaseDate)}</p>
                  </div>
                </div>
                <div className="meta-field">
                  <div className="meta-icon"><CalendarDays size={14} /></div>
                  <div>
                    <p className="meta-label">Due Date</p>
                    <p className="meta-value">{formatDate(invoice.dueDate)}</p>
                  </div>
                </div>
              </div>

              <div className="party-grid">
                <div className="party-card">
                  <div className="party-label-row">
                    <div className="party-icon"><Building2 size={13} /></div>
                    <p className="party-label">Billed By</p>
                  </div>
                  <p className="party-name">{invoice.billedBy?.companyName}</p>
                  <p className="party-line">
                    {invoice.billedBy?.addressLine1}, {invoice.billedBy?.city}
                    <br />
                    {invoice.billedBy?.state}, {invoice.billedBy?.country} - {invoice.billedBy?.pincode}
                  </p>
                  <p className="party-detail"><strong>GSTIN</strong> {invoice.billedBy?.gstin}</p>
                  <p className="party-detail"><strong>PAN</strong> {invoice.billedBy?.pan}</p>
                  <p className="party-detail"><strong>Phone</strong> {invoice.billedBy?.phone}</p>
                  <p className="party-detail"><strong>TAN</strong> {invoice.billedBy?.tan}</p>
                </div>

                <div className="party-card">
                  <div className="party-label-row">
                    <div className="party-icon"><User size={13} /></div>
                    <p className="party-label">Billed To</p>
                  </div>
                  {isEditing ? (
                    <div className="edit-stack">
                      <input
                        className="edit-input"
                        value={draft.billedTo?.name || ""}
                        placeholder="Name"
                        onChange={(e) => updateBilledTo("name", e.target.value)}
                      />
                      <input
                        className="edit-input"
                        value={draft.billedTo?.addressLine1 || ""}
                        placeholder="Address line 1"
                        onChange={(e) => updateBilledTo("addressLine1", e.target.value)}
                      />
                      <input
                        className="edit-input"
                        value={draft.billedTo?.addressLine2 || ""}
                        placeholder="Address line 2"
                        onChange={(e) => updateBilledTo("addressLine2", e.target.value)}
                      />
                      <div className="edit-row-3">
                        <input
                          className="edit-input"
                          value={draft.billedTo?.city || ""}
                          placeholder="City"
                          onChange={(e) => updateBilledTo("city", e.target.value)}
                        />
                        <input
                          className="edit-input"
                          value={draft.billedTo?.state || ""}
                          placeholder="State"
                          onChange={(e) => updateBilledTo("state", e.target.value)}
                        />
                        <input
                          className="edit-input"
                          value={draft.billedTo?.pincode || ""}
                          placeholder="Pincode"
                          onChange={(e) => updateBilledTo("pincode", e.target.value)}
                        />
                      </div>
                      <input
                        className="edit-input"
                        value={draft.billedTo?.phone || ""}
                        placeholder="Phone"
                        onChange={(e) => updateBilledTo("phone", e.target.value)}
                      />
                    </div>
                  ) : (
                    <>
                      <p className="party-name">{invoice.billedTo?.name}</p>
                      <p className="party-line">
                        {invoice.billedTo?.addressLine1}
                        {invoice.billedTo?.addressLine2 && <>, {invoice.billedTo.addressLine2}</>}
                        <br />
                        {invoice.billedTo?.city}, {invoice.billedTo?.state}, {invoice.billedTo?.country} - {invoice.billedTo?.pincode}
                      </p>
                      <p className="party-detail"><strong>Phone</strong> {invoice.billedTo?.phone}</p>
                    </>
                  )}
                </div>
              </div>

              {(invoice.countryOfSupply || invoice.placeOfSupply) && (
                <div className="supply-row">
                  <span><strong>Country of Supply</strong> {invoice.countryOfSupply}</span>
                  <span><strong>Place of Supply</strong> {invoice.placeOfSupply}</span>
                </div>
              )}

              {isEditing ? (
                <div className="item-cards">
                  {draft.items.map((item, idx) => (
                    <div key={idx} className="item-edit-card">
                      <div className="item-edit-top">
                        <span className="item-edit-index">Item {idx + 1}</span>
                        <button type="button" className="remove-item-btn" onClick={() => removeItemRow(idx)}>
                          <Trash2 size={14} /> Remove Item
                        </button>
                      </div>

                      <input
                        className="edit-input"
                        value={item.description}
                        placeholder="Description"
                        onChange={(e) => updateItemField(idx, "description", e.target.value)}
                      />
                      <input
                        className="edit-input"
                        style={{ marginTop: 6 }}
                        value={item.subDescription || ""}
                        placeholder="Sub-description (optional)"
                        onChange={(e) => updateItemField(idx, "subDescription", e.target.value)}
                      />

                      <div className="item-edit-grid">
                        <label>
                          GST %
                          <input
                            type="number"
                            className="edit-input"
                            value={item.gstRate}
                            onChange={(e) => updateItemField(idx, "gstRate", e.target.value)}
                          />
                        </label>
                        <label>
                          Qty
                          <input
                            type="number"
                            className="edit-input"
                            value={item.quantity}
                            onChange={(e) => updateItemField(idx, "quantity", e.target.value)}
                          />
                        </label>
                        <label>
                          Rate
                          <input
                            type="number"
                            className="edit-input"
                            value={item.rate}
                            onChange={(e) => updateItemField(idx, "rate", e.target.value)}
                          />
                        </label>
                      </div>

                      <div className="item-edit-summary">
                        <span>Amount {currency(item.amount)}</span>
                        <span>CGST {currency(item.cgst)}</span>
                        <span>SGST {currency(item.sgst)}</span>
                        <span className="item-edit-total">Total {currency(item.total)}</span>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn-ghost" onClick={addItemRow}>
                    <Plus size={14} /> Add Item
                  </button>
                </div>
              ) : (
                <>
                  <div className="items-table-wrap">
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>GST</th>
                          <th>Qty</th>
                          <th>Rate</th>
                          <th>Amount</th>
                          <th>CGST</th>
                          <th>SGST</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(displayItems || []).map((item, idx) => (
                          <tr key={idx} data-page-safe>
                            <td>
                              <p className="item-desc">{item.description}</p>
                              {item.subDescription && <p className="item-sub">{item.subDescription}</p>}
                            </td>
                            <td>{item.gstRate}%</td>
                            <td>{item.quantity}</td>
                            <td>{currency(item.rate)}</td>
                            <td>{currency(item.amount)}</td>
                            <td>{currency(item.cgst)}</td>
                            <td>{currency(item.sgst)}</td>
                            <td className="item-total">{currency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="items-cards-mobile">
                    {(displayItems || []).map((item, idx) => (
                      <div key={idx} className="item-mcard" data-page-safe>
                        <div className="item-mcard-head">
                          <p className="item-desc">{item.description}</p>
                          {item.subDescription && <p className="item-sub">{item.subDescription}</p>}
                        </div>
                        <div className="item-mgrid">
                          <div><span className="mlabel">GST</span><span className="mvalue">{item.gstRate}%</span></div>
                          <div><span className="mlabel">Qty</span><span className="mvalue">{item.quantity}</span></div>
                          <div><span className="mlabel">Rate</span><span className="mvalue">{currency(item.rate)}</span></div>
                          <div><span className="mlabel">Amount</span><span className="mvalue">{currency(item.amount)}</span></div>
                          <div><span className="mlabel">CGST</span><span className="mvalue">{currency(item.cgst)}</span></div>
                          <div><span className="mlabel">SGST</span><span className="mvalue">{currency(item.sgst)}</span></div>
                        </div>
                        <div className="item-mtotal">
                          <span>Total</span>
                          <span>{currency(item.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="totals-wrap">
                <div className="totals-box" data-page-safe>
                  <div className="totals-badge"><FileText size={15} /></div>
                  <div className="totals-row">
                    <span>Amount</span>
                    <span>{currency(displayTotals?.amount)}</span>
                  </div>
                  <div className="totals-row">
                    <span>CGST</span>
                    <span>{currency(displayTotals?.cgst)}</span>
                  </div>
                  <div className="totals-row">
                    <span>SGST</span>
                    <span>{currency(displayTotals?.sgst)}</span>
                  </div>
                  <div className="totals-row">
                    <span>Round off</span>
                    {isEditing ? (
                      <input
                        type="number"
                        className="edit-input cell-num"
                        style={{ width: 90, textAlign: "right" }}
                        value={draft.totals?.roundOff || 0}
                        onChange={(e) => updateRoundOff(e.target.value)}
                      />
                    ) : (
                      <span>({currency(invoice.totals?.roundOff)})</span>
                    )}
                  </div>
                  <div className="totals-row grand">
                    <span>Total (INR)</span>
                    <span>{currency(displayTotals?.grandTotal)}</span>
                  </div>
                  <div className="totals-row paid">
                    <span>Amount Paid</span>
                    {isEditing ? (
                      <input
                        type="number"
                        className="edit-input cell-num"
                        style={{ width: 110, textAlign: "right" }}
                        value={draft.amountPaid || 0}
                        onChange={(e) => updateAmountPaid(e.target.value)}
                      />
                    ) : (
                      <span>({currency(invoice.amountPaid)})</span>
                    )}
                  </div>
                  {(isEditing ? draft.dueAmount > 0 : !isPaid) && (
                    <div className="totals-row due">
                      <span>Due Amount</span>
                      <span>{currency(isEditing ? draft.dueAmount : invoice.dueAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {(displayPayments || []).length > 0 || isEditing ? (
                <div data-page-safe className="payments-block">
                  <p className="payments-title">Payments</p>
                  <div className="payments-scroll">
                    <table className="payments-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          {isEditing && <th></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {(displayPayments || []).map((p, idx) =>
                          isEditing ? (
                            <tr key={idx}>
                              <td>
                                <input
                                  type="date"
                                  className="edit-input cell-input"
                                  value={p.date ? new Date(p.date).toISOString().slice(0, 10) : ""}
                                  onChange={(e) => updatePaymentField(idx, "date", e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="edit-input cell-input cell-num"
                                  value={p.amountReceived}
                                  onChange={(e) => updatePaymentField(idx, "amountReceived", e.target.value)}
                                />
                              </td>
                              <td>
                                <button type="button" className="remove-item-btn" onClick={() => removePaymentRow(idx)}>
                                  <Trash2 size={14} /> Remove
                                </button>
                              </td>
                            </tr>
                          ) : (
                            <tr key={idx}>
                              <td>{formatDateTime(p.date)}</td>
                              <td>{currency(p.amountReceived)}</td>
                            </tr>
                          ),
                        )}
                        {!isEditing && (
                          <tr className="total-row">
                            <td>Total</td>
                            <td>{currency(totalPaid)}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {isEditing && (
                    <button type="button" className="btn-ghost" style={{ marginTop: 10 }} onClick={addPaymentRow}>
                      <Plus size={14} /> Add Payment
                    </button>
                  )}
                </div>
              ) : null}
            </div>

            <div className="doc-footer">
              <p className="doc-footer-thanks">Thank you for your business!</p>
              <p className="doc-footer-sub">We look forward to serving you again.</p>
              <div className="doc-footer-contacts">
                {invoice.billedBy?.phone && (
                  <span>☏ {invoice.billedBy.phone}</span>
                )}
                <span><span className="footer-emoji">✉️</span> info@gvtourplanners.com</span>
                <span><span className="footer-emoji">🌐</span> www.gvtourplanners.com</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoice;
