// // ════════════════════════════════════════════════════════════════
// //  TicketLanding.jsx — TOUR ADMIN side  (tourController → /api/tour/...)
// //  Queries list + filters, Pickup / Processing / Close / Reject,
// //  replies (add / edit / delete)
// //
// //  API calls ellam context/TourContext.jsx la "ticketApi" kulla irukku
// // ════════════════════════════════════════════════════════════════
// import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
// import { toast } from "react-toastify";
// import { TourContext } from "../../context/TourContext"; // ⚙️ path check pannunga
// import useStaffSelf from "../../staff/useStaffSelf"; // staff site la login aana staff (admin site la null)
// import { ColumnFilter, ActiveFilterChips, buildColumnFilters } from "../../components/TicketFilters";
// import { roleName, SourceBadge, isMyReply, replyLabel, replyName, StaffOptions, TnrInfo, teamsFromStaff, isTeamOpen, toName, toSub, ToModeSwitch } from "../../staff/ticketWho";

// const ME = "touradmin"; // replies la "from" — indha side (Ticket Landing)
// const OTHER_NAME = "Admin";
// const SYNC_EVERY_MS = 10000;

// // ════════════════════════════════════════════════════════════════
// //  Helpers
// // ════════════════════════════════════════════════════════════════
// const STATUS = {
//   open: { label: "Open", pill: "bg-blue-50 text-blue-700", dot: "bg-blue-600" },
//   pickup: { label: "Picked up", pill: "bg-violet-50 text-violet-700", dot: "bg-violet-600" },
//   processing: { label: "Processing", pill: "bg-amber-50 text-amber-800", dot: "bg-amber-600" },
//   close: { label: "Closed", pill: "bg-green-50 text-green-700", dot: "bg-green-600" },
//   reject: { label: "Rejected", pill: "bg-red-50 text-red-700", dot: "bg-red-600" },
// };

// const CARDS = [
//   { key: "", label: "Total", bar: "bg-slate-700", tint: "bg-slate-50", ring: "ring-slate-400", num: "text-slate-900", icon: "M4 6h16M4 12h16M4 18h10" },
//   { key: "open", label: "Open", bar: "bg-sky-500", tint: "bg-sky-50", ring: "ring-sky-400", num: "text-sky-900", icon: "M12 5v14M5 12h14" },
//   { key: "pickup", label: "Picked up", bar: "bg-violet-500", tint: "bg-violet-50", ring: "ring-violet-400", num: "text-violet-900", icon: "M7 11V7a5 5 0 0 1 10 0v4M5 11h14v9H5z" },
//   { key: "processing", label: "Processing", bar: "bg-amber-500", tint: "bg-amber-50", ring: "ring-amber-400", num: "text-amber-900", icon: "M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
//   { key: "close", label: "Closed", bar: "bg-green-600", tint: "bg-green-50", ring: "ring-green-500", num: "text-green-900", icon: "m5 13 4 4L19 7" },
//   { key: "reject", label: "Rejected", bar: "bg-red-500", tint: "bg-red-50", ring: "ring-red-400", num: "text-red-900", icon: "M6 6l12 12M18 6 6 18" },
// ];

// // Status ku row / card la left side color line
// const STATUS_BAR = {
//   open: "border-l-sky-500",
//   pickup: "border-l-violet-500",
//   processing: "border-l-amber-500",
//   close: "border-l-green-600",
//   reject: "border-l-red-500",
// };

// // Spinner konja neram theriyanum — romba fast ah mudinjaalum kammiyaa 1.2 sec
// const minDelay = (promise, ms = 1200) =>
//   Promise.all([promise, new Promise((r) => setTimeout(r, ms))]).then(([v]) => v);

// // Initials for chat avatar
// const initials = (name = "") =>
//   name
//     .split(" ")
//     .filter(Boolean)
//     .slice(0, 2)
//     .map((w) => w[0].toUpperCase())
//     .join("") || "?";

// // Page open aagum bodhum, "Clear Filters" pannum bodhum Open dhaan default
// const EMPTY_FILTERS = {
//   search: "", ticketNo: "", subject: "", queryType: "", status: "open",
//   raisedBy: "", raisedByDept: "", raisedTo: "", raisedToDept: "", fromDate: "", toDate: "",
// };

// // Ovvoru status la endha buttons varanum (backend rules same)
// const ACTIONS = [
//   { key: "pickup", label: "Pickup", from: ["open"], cls: "bg-violet-600 text-white hover:bg-violet-700" },
//   { key: "processing", label: "Processing", from: ["open", "pickup"], cls: "bg-amber-600 text-white hover:bg-amber-700" },
//   { key: "close", label: "Close", from: ["open", "pickup", "processing"], cls: "bg-green-600 text-white hover:bg-green-700" },
//   { key: "reject", label: "Reject", from: ["open", "pickup", "processing"], cls: "border border-red-300 bg-white text-red-700 hover:bg-red-50" },
// ];
// const DONE_TEXT = {
//   pickup: "Query picked up",
//   processing: "Query moved to processing",
//   close: "Query closed",
//   reject: "Query rejected",
// };
// const BUSY_TEXT = { pickup: "Picking up…", processing: "Updating…", close: "Closing…", reject: "Rejecting…" };

// const staffName = (s) => s?.name || s?.fullName || s?.staffName || "—";
// const staffRole = (s) => roleName(s) || s?.designation || ""; // role ObjectId kaattaama, role name
// const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");
// const fmtTime = (d) =>
//   d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "";
// const fmtSize = (b) => (!b ? "" : b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

// // ════════════════════════════════════════════════════════════════
// //  Small pieces
// // ════════════════════════════════════════════════════════════════
// const StatusPill = ({ status }) => {
//   const s = STATUS[status] || STATUS.open;
//   return (
//     <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.pill}`}>
//       <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
//       {s.label}
//     </span>
//   );
// };

// const FileChip = ({ file, onRemove, removed }) => {
//   const isPdf = file.fileType === "pdf" || file.type === "application/pdf";
//   const saved = Boolean(file.url); // DB la irukura file (Cloudinary url irukku)
//   return (
//     <div className={`flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-lg border px-2.5 py-2 ${removed ? "border-red-200 bg-red-50 opacity-60" : "border-gray-200 bg-white"}`}>
//       {saved && !isPdf ? (
//         // Image na chinna preview — click pannuna full size pudhu tab la
//         <a href={file.url} target="_blank" rel="noreferrer" className="flex-shrink-0" aria-label={`Open ${file.fileName || "image"}`}>
//           <img src={file.url} alt="" className="h-12 w-12 rounded-md border border-gray-200 object-cover" loading="lazy" />
//         </a>
//       ) : (
//         <span
//           className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md text-xs font-bold ${isPdf ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
//             }`}
//         >
//           {isPdf ? "PDF" : "IMG"}
//         </span>
//       )}
//       <div className="min-w-0 flex-1">
//         <p className="truncate text-sm font-medium text-gray-900">{file.fileName || file.name || "Attachment"}</p>
//         <p className="text-xs text-gray-500">{fmtSize(file.size)}</p>
//       </div>
//       {saved && !onRemove && (
//         <a
//           href={file.url}
//           target="_blank"
//           rel="noreferrer"
//           className="flex-shrink-0 whitespace-nowrap rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
//         >
//           {isPdf ? "Open PDF" : "View"}
//         </a>
//       )}
//       {onRemove && (
//         <button
//           type="button"
//           onClick={onRemove}
//           className="flex-shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
//         >
//           {removed ? "Undo" : "Remove"}
//         </button>
//       )}
//     </div>
//   );
// };

// // ─── Reply thread (chat) ─────────────────────────────────────────
// // ─── Spinner (button la loading) ───
// const Spinner = ({ className = "h-4 w-4" }) => (
//   <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`animate-spin ${className}`}>
//     <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
//     <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
//   </svg>
// );

// // Attachments ah set set ah: [[1, [...]], [2, [...]]]
// const groupBySet = (list = []) => {
//   const map = new Map();
//   list.forEach((a) => {
//     const k = a.set || 1;
//     if (!map.has(k)) map.set(k, []);
//     map.get(k).push(a);
//   });
//   return [...map.entries()].sort((x, y) => x[0] - y[0]);
// };

// // "Attachment 1", "Attachment 2" nu set set ah
// const AttachmentSets = ({ files, renderFile }) => (
//   <div className="grid grid-cols-1 gap-3">
//     {groupBySet(files).map(([set, list]) => (
//       <div key={set} className="min-w-0">
//         <p className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
//           <span className="rounded-md bg-blue-600 px-1.5 py-0.5 font-semibold text-white">Attachment {set}</span>
//           {set === 1 ? "Added with the query" : "Added on edit"}
//         </p>
//         <div className="grid grid-cols-1 gap-2">{list.map(renderFile)}</div>
//       </div>
//     ))}
//   </div>
// );

// // ─── Action icons (FIT Enquiries page madhiri chinna icon buttons) ───
// const ACT_ICON = {
//   view: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
//   hide: "m3 3 18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.2A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6C3.9 8.4 2 12 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1",
//   edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
//   delete: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6",
//   reopen: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5",
//   pickup: "M22 12h-6l-2 3h-4l-2-3H2M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z",
//   processing: "M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
//   close: "M20 6 9 17l-5-5",
//   reject: "M18 6 6 18M6 6l12 12",
// };

// const ACT_TONE = {
//   view: "bg-gray-50 text-gray-700 ring-gray-200 hover:bg-gray-100",
//   edit: "bg-indigo-50 text-indigo-700 ring-indigo-200 hover:bg-indigo-100",
//   delete: "bg-red-50 text-red-600 ring-red-200 hover:bg-red-100",
//   reopen: "bg-blue-50 text-blue-700 ring-blue-200 hover:bg-blue-100",
//   pickup: "bg-violet-50 text-violet-700 ring-violet-200 hover:bg-violet-100",
//   processing: "bg-amber-50 text-amber-700 ring-amber-300 hover:bg-amber-100",
//   close: "bg-green-50 text-green-700 ring-green-300 hover:bg-green-100",
//   reject: "bg-red-50 text-red-600 ring-red-200 hover:bg-red-100",
// };

// // Periya screen (table) la icon mattum + hover tooltip.
// // Mobile / tablet la icon keela chinna label — touch la enna button nu theriyanum.
// const IconAction = ({ kind, icon, label, short, onClick, busy, disabled, busyText, expanded }) => (
//   <button
//     type="button"
//     onClick={onClick}
//     disabled={disabled || busy}
//     aria-label={label}
//     aria-busy={busy || undefined}
//     aria-expanded={expanded}
//     className={`group relative flex min-w-[4.25rem] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-2 ring-1 ring-inset transition disabled:cursor-not-allowed disabled:opacity-60 xl:h-8 xl:w-8 xl:min-w-0 xl:flex-none xl:p-0 ${ACT_TONE[kind]}`}
//   >
//     {busy ? (
//       <Spinner className="h-[18px] w-[18px]" />
//     ) : (
//       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden="true">
//         <path d={ACT_ICON[icon || kind]} />
//       </svg>
//     )}
//     <span className="max-w-full truncate text-[10px] font-semibold leading-none min-[400px]:text-[11px] xl:hidden">{busy ? "…" : short || label}</span>
//     {/* tooltip — periya screen la mattum */}
//     <span className="pointer-events-none absolute -top-8 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow transition group-hover:opacity-100 group-focus-visible:opacity-100 xl:block">
//       {busy ? busyText : label}
//     </span>
//   </button>
// );

// const ReplyThread = ({ queryId, api, onChanged }) => {
//   const me = useStaffSelf(); // staff site: en reply mattum "You"
//   const [data, setData] = useState(null);
//   const [text, setText] = useState("");
//   const [sending, setSending] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [editText, setEditText] = useState("");
//   const versionRef = useRef(null);
//   const endRef = useRef(null);

//   const load = useCallback(
//     async (silent = false) => {
//       try {
//         const res = await api.getReplies(queryId);
//         if (res.version !== versionRef.current) {
//           versionRef.current = res.version;
//           setData(res);
//         }
//       } catch (err) {
//         if (!silent) toast.error(err.message);
//       }
//     },
//     [api, queryId],
//   );

//   useEffect(() => {
//     load();
//     const t = setInterval(() => load(true), 5000);
//     return () => clearInterval(t);
//   }, [load]);

//   useEffect(() => {
//     endRef.current?.scrollIntoView({ block: "nearest" });
//   }, [data?.replies?.length]);

//   const send = async () => {
//     const message = text.trim();
//     if (!message) return;
//     setSending(true);
//     try {
//       await api.addReply(queryId, message);
//       setText("");
//       await load();
//       onChanged?.();
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setSending(false);
//     }
//   };

//   const saveEdit = async (replyId) => {
//     const message = editText.trim();
//     if (!message) return;
//     try {
//       await api.editReply(queryId, replyId, message);
//       setEditingId(null);
//       toast.success("Reply updated");
//       load();
//     } catch (err) {
//       toast.error(err.message);
//     }
//   };

//   const remove = async (replyId) => {
//     if (!window.confirm("Delete this reply?")) return;
//     try {
//       await api.deleteReply(queryId, replyId);
//       toast.success("Reply deleted");
//       await load();
//       onChanged?.();
//     } catch (err) {
//       toast.error(err.message);
//     }
//   };

//   if (!data) return <p className="text-sm text-gray-500">Loading replies…</p>;

//   return (
//     <div className="flex flex-col gap-3">
//       <div className="flex max-h-96 flex-col gap-3 overflow-y-auto rounded-2xl border border-gray-100 bg-gradient-to-b from-gray-50 to-white p-3">
//         {data.replies.length === 0 && <p className="py-4 text-center text-sm text-gray-500">No replies yet. Start the conversation below.</p>}
//         {data.replies.map((r) => {
//           const mine = isMyReply(r, ME, me);
//           return (
//             <div key={r._id} className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
//               <span
//                 className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${mine ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
//                   }`}
//                 aria-hidden="true"
//               >
//                 {mine ? "You".slice(0, 1) : initials(replyName(r) || OTHER_NAME)}
//               </span>
//               <div className={`max-w-[85%] break-words rounded-2xl sm:max-w-[75%] px-3.5 py-2.5 ${mine ? "rounded-br-sm bg-green-600 text-white" : "rounded-bl-sm border border-gray-200 bg-white"}`}>
//                 <p className={`mb-0.5 text-xs font-semibold ${mine ? "text-green-100" : "text-gray-500"}`}>
//                   {mine ? "You" : replyLabel(r)}
//                 </p>
//                 {editingId === r._id ? (
//                   <div className="flex flex-col gap-2">
//                     <textarea
//                       value={editText}
//                       onChange={(e) => setEditText(e.target.value)}
//                       rows={2}
//                       maxLength={2000}
//                       className="w-full min-w-[12rem] rounded-lg p-2 text-sm text-gray-900"
//                       aria-label="Edit reply"
//                     />
//                     <div className="flex gap-2">
//                       <button onClick={() => saveEdit(r._id)} className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-green-700">
//                         Save
//                       </button>
//                       <button onClick={() => setEditingId(null)} className="rounded-md px-2.5 py-1 text-xs font-semibold text-green-50">
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <p className="whitespace-pre-line text-sm">{r.message}</p>
//                 )}
//                 <div className={`mt-1 flex items-center gap-3 text-[11px] ${mine ? "text-green-100" : "text-gray-400"}`}>
//                   <span>
//                     {fmtDate(r.createdAt)} {fmtTime(r.createdAt)}
//                     {r.editedAt ? " (edited)" : ""}
//                   </span>
//                   {mine && data.canReply && editingId !== r._id && (
//                     <>
//                       <button
//                         onClick={() => {
//                           setEditingId(r._id);
//                           setEditText(r.message);
//                         }}
//                         className="font-semibold underline-offset-2 hover:underline"
//                       >
//                         Edit
//                       </button>
//                       <button onClick={() => remove(r._id)} className="font-semibold underline-offset-2 hover:underline">
//                         Delete
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//         <div ref={endRef} />
//       </div>

//       {data.canReply ? (
//         <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
//           <textarea
//             value={text}
//             onChange={(e) => setText(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter" && !e.shiftKey) {
//                 e.preventDefault();
//                 send();
//               }
//             }}
//             rows={2}
//             maxLength={2000}
//             placeholder="Write a reply… (Enter to send, Shift+Enter for new line)"
//             aria-label="Reply message"
//             className="w-full flex-1 rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
//           />
//           <button
//             onClick={send}
//             disabled={sending || !text.trim()}
//             className="h-11 rounded-xl bg-green-600 px-5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
//           >
//             {sending ? "Sending…" : "Send"}
//           </button>
//         </div>
//       ) : (
//         <p className="text-sm text-gray-500">This Ticket is {data.status === "close" ? "closed" : "rejected"}, so replies are turned off.</p>
//       )}
//     </div>
//   );
// };

// // ════════════════════════════════════════════════════════════════
// //  Reject modal
// // ════════════════════════════════════════════════════════════════
// const RejectModal = ({ query, onCancel, onConfirm, busy }) => {
//   const [reason, setReason] = useState("");
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="reject-title">
//       <div className="w-full max-w-md rounded-2xl bg-white p-6">
//         <h2 id="reject-title" className="text-lg font-bold">Reject this query?</h2>
//         <p className="mt-1 text-sm text-gray-600">{query.subject}</p>
//         <label htmlFor="reject-reason" className="mb-1.5 mt-4 block text-sm font-semibold text-gray-600">
//           Reason (optional)
//         </label>
//         <textarea
//           id="reject-reason"
//           rows={3}
//           value={reason}
//           onChange={(e) => setReason(e.target.value)}
//           placeholder="Tell the admin why"
//           className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
//         />
//         <p className="mt-2 text-xs text-gray-500">Rejected queries can't be edited or replied to.</p>
//         <div className="mt-5 flex justify-end gap-3">
//           <button onClick={onCancel} className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700">
//             Cancel
//           </button>
//           <button
//             onClick={() => onConfirm(reason.trim())}
//             disabled={busy}
//             className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
//           >
//             {busy && <Spinner />}
//             {busy ? "Rejecting…" : "Reject query"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ════════════════════════════════════════════════════════════════
// //  Page
// // ════════════════════════════════════════════════════════════════
// // ─── Raise form (admin page la irukura adhe) ───
// const EMPTY_FORM = { queryType: "", subject: "", description: "", raisedBy: "", raisedTo: "", tnr: "" };
// const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
// const MAX_FILES = 5;
// const MAX_SIZE = 5 * 1024 * 1024;

// // Phone photos (3–8 MB) ah 1600px ku resize → 300–600 KB. PDF ah touch pannadhu.
// const compressImage = (file) =>
//   new Promise((resolve) => {
//     if (!file.type.startsWith("image/") || file.size < 300 * 1024) return resolve(file);
//     const url = URL.createObjectURL(file);
//     const img = new Image();
//     img.onload = () => {
//       const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
//       const canvas = document.createElement("canvas");
//       canvas.width = Math.round(img.width * scale);
//       canvas.height = Math.round(img.height * scale);
//       canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
//       canvas.toBlob(
//         (blob) => {
//           URL.revokeObjectURL(url);
//           if (!blob || blob.size >= file.size) return resolve(file); // chinnadha aagalana original
//           const name = file.name.replace(/\.(png|webp|jpe?g)$/i, "") + ".jpg";
//           resolve(new File([blob], name, { type: "image/jpeg", lastModified: Date.now() }));
//         },
//         "image/jpeg",
//         0.72,
//       );
//     };
//     img.onerror = () => {
//       URL.revokeObjectURL(url);
//       resolve(file);
//     };
//     img.src = url;
//   });

// const TicketLanding = () => {
//   const { ticketApi: api } = useContext(TourContext);
//   const me = useStaffSelf(); // staff site: "Raised by" lock

//   // ─── TNR → booking eduththa staff "Raised to" la auto (maathalaam) ───
//   const [tnrInfo, setTnrInfo] = useState(null);
//   const [tnrLoading, setTnrLoading] = useState(false);
//   // TNR la booking eduththa staff kandupidichaa → "Raised to" lock (avangaluku dhaan pogum)
//   // TNR → booking eduththa staff default ah varum; vendumna vera person / team ku maathalaam
//   const tnrSuggested = !!(tnrInfo?.staff?._id && tnrInfo.staff.active && !tnrInfo.selfBooked);
//   // Staff site: "Raised to" — oru Person ku, illa oru Team (department) ku.
//   // Team ku na andha team la ellarukkum theriyum; oruthar pick pannuna micha per list la irundhu maraiyum.
//   const [toMode, setToMode] = useState("person");
//   const [toTeam, setToTeam] = useState("");
//   const teamMode = !!me && toMode === "team";
//   const changeToMode = (m) => {
//     setToMode(m);
//     // TNR potta, booking eduththavanga team ah default ah select
//     if (m === "team" && !toTeam && tnrInfo?.staff?.role?._id) setToTeam(String(tnrInfo.staff.role._id));
//   };
//   const findTnr = async () => {
//     const tnr = (form.tnr || "").trim().toUpperCase();
//     if (!tnr) return;
//     if (!api.lookupTnr) return toast.error("TNR lookup not set up — add lookupTnr in ticketApi");
//     setTnrLoading(true);
//     try {
//       const info = await api.lookupTnr(tnr);
//       setTnrInfo(info);
//       const s = info.staff;
//       if (s?._id && s.active) {
//         // Raise panravangale booking eduththavanga na "Raised to" maathaadhu
//         const byId = me ? me._id : form.raisedBy;
//         if (String(s._id) === String(byId)) {
//           setTnrInfo({ ...info, selfBooked: true });
//           toast("You booked this TNR yourself — choose who to raise it to.");
//         } else {
//           setForm((f) => ({ ...f, raisedTo: s._id }));
//           toast.success(`Raised to: ${s.fullName} (booked this TNR) — you can change it`);
//         }
//         // Dropdown la illaadha staff ah list la serkka
//         setStaff((list) => (list.some((x) => String(x._id) === String(s._id)) ? list : [...list, s]));
//       }
//     } catch (err) {
//       setTnrInfo({ error: err.message });
//     } finally {
//       setTnrLoading(false);
//     }
//   };

//   const [queries, setQueries] = useState([]);
//   const [counts, setCounts] = useState({ open: 0, pickup: 0, processing: 0, close: 0, reject: 0 });
//   const [total, setTotal] = useState(0);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [filters, setFilters] = useState(EMPTY_FILTERS);
//   const lastOpenCount = useRef(null); // Open la puthusa ethavadhu vandhucha nu paakka
//   const [types, setTypes] = useState([]);

//   // ─── Raise query (tour admin um raise pannalam) ───
//   const [tab, setTab] = useState("list"); // list | form
//   const [staff, setStaff] = useState([]);
//   const [staffError, setStaffError] = useState("");
//   const [form, setForm] = useState(EMPTY_FORM);
//   const [files, setFiles] = useState([]);
//   const [saving, setSaving] = useState(false);
//   const [progress, setProgress] = useState(null); // upload %
//   const imageInputRef = useRef(null);
//   const pdfInputRef = useRef(null);
//   // Edit — tour admin raise panna ticket ah mattum
//   const [editing, setEditing] = useState(null); // edit panra ticket
//   const [removeIds, setRemoveIds] = useState([]); // edit la remove panna pazhaya files
//   const [deletingId, setDeletingId] = useState(null);
//   const keptCount = (editing?.attachments?.length || 0) - removeIds.length;
//   // Type chips la × pannuna suggestion la irundhu maraiyum — DB la illa, indha browser la mattum
//   const HIDDEN_TYPES_KEY = "gv-hidden-query-types";
//   const [hiddenTypes, setHiddenTypes] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem(HIDDEN_TYPES_KEY) || "[]");
//     } catch {
//       return [];
//     }
//   });
//   const saveHidden = (list) => {
//     setHiddenTypes(list);
//     try {
//       localStorage.setItem(HIDDEN_TYPES_KEY, JSON.stringify(list));
//     } catch {
//       /* private mode la storage illana paravaillai */
//     }
//   };
//   const hideType = (name) => saveHidden([...new Set([...hiddenTypes, name.toLowerCase()])]);
//   const unhideType = (name) => saveHidden(hiddenTypes.filter((n) => n !== name.toLowerCase()));
//   const [expandedId, setExpandedId] = useState(null);
//   const [busyId, setBusyId] = useState(null); // button click pannura query
//   const [busyAction, setBusyAction] = useState(null); // endha button (spinner ku)
//   const [rejecting, setRejecting] = useState(null); // reject modal query
//   const syncRef = useRef(null);

//   // ─── Loaders ───
//   const fetchQueries = useCallback(
//     async (silent = false) => {
//       if (!silent) setLoading(true);
//       try {
//         const data = await api.getQueries({ ...filters, page, limit: 20 });
//         setQueries(data.queries);
//         setCounts(data.statusCounts);
//         // Admin puthu ticket raise / reopen pannaa Open count koodum —
//         // vera tab la irundhaalum udane Open tab ku poyidum
//         const openNow = data.statusCounts?.open ?? 0;
//         if (lastOpenCount.current !== null && openNow > lastOpenCount.current && filters.status !== "open") {
//           setPage(1);
//           setFilters((f) => ({ ...f, status: "open" }));
//         }
//         lastOpenCount.current = openNow;
//         setTotal(data.total);
//         setTotalPages(data.totalPages);
//         // Type filter dropdown ku — backend ellaa types um anuppum (admin page madhiriye)
//         if (Array.isArray(data.queryTypes)) {
//           setTypes(data.queryTypes);
//         } else {
//           setTypes((prev) => {
//             const names = new Set(prev.map((t) => t.name));
//             data.queries.forEach((q) => q.queryType && names.add(q.queryType));
//             return [...names].sort().map((name) => ({ name }));
//           });
//         }
//       } catch (err) {
//         if (!silent) toast.error(err.message);
//       } finally {
//         if (!silent) setLoading(false);
//       }
//     },
//     [api, filters, page],
//   );

//   useEffect(() => {
//     const t = setTimeout(() => fetchQueries(), filters.search ? 400 : 0);
//     return () => clearTimeout(t);
//   }, [fetchQueries]); // eslint-disable-line react-hooks/exhaustive-deps

//   // ─── Auto-sync: admin raise / edit / delete / reply pannalum inga update aagum ───
//   useEffect(() => {
//     const check = async () => {
//       try {
//         const data = await api.sync();
//         if (syncRef.current && syncRef.current !== data.version) fetchQueries(true);
//         syncRef.current = data.version;
//       } catch {
//         /* next round la try pannum */
//       }
//     };
//     check();
//     const t = setInterval(check, SYNC_EVERY_MS);
//     return () => clearInterval(t);
//   }, [api, fetchQueries]);

//   const setFilter = (key, value) => {
//     setPage(1);
//     setFilters((f) => ({ ...f, [key]: value }));
//   };
//   // Column filter Apply / chip ✕ — pala keys ore thadava
//   const applyFilters = (patch) => {
//     setPage(1);
//     setFilters((f) => ({ ...f, ...patch }));
//   };

//   // ─── Raise helpers ───
//   const fetchStaff = useCallback(async () => {
//     try {
//       const list = await api.getStaff();
//       setStaff(list);
//       setStaffError(list.length ? "" : "No active staff found. Add staff in Staff Profiles first.");
//     } catch (err) {
//       setStaff([]);
//       setStaffError(`Couldn't load staff: ${err.message}`);
//     }
//   }, [api]);

//   useEffect(() => {
//     if (!staff.length) fetchStaff(); // column filters ku um venum
//   }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

//   const openRaise = () => {
//     setEditing(null);
//     setRemoveIds([]);
//     setForm(me ? { ...EMPTY_FORM, raisedBy: me._id } : EMPTY_FORM);
//     setToMode("person");
//     setToTeam("");
//     setTnrInfo(null);
//     setFiles([]);
//     setTab("form");
//   };

//   // Tour admin raise panna ticket ah mattum edit / delete panna mudiyum
//   // Staff site la: avanga raise panna ticket mattum
//   const isMine = (q) =>
//     me
//       ? String(q.raisedBy?._id || q.raisedBy) === String(me._id) // Raised by = naan
//       : q.raisedVia === "touradmin"; // Tour admin: pazhaya maari

//   const openEdit = (q) => {
//     setEditing(q);
//     setRemoveIds([]);
//     setFiles([]);
//     setForm({
//       queryType: q.queryType || "",
//       subject: q.subject || "",
//       description: q.description || "",
//       raisedBy: q.raisedBy?._id || q.raisedBy || "",
//       raisedTo: q.raisedTo?._id || q.raisedTo || "",
//       tnr: q.tnr || "",
//     });
//     setToMode(q.raisedToRole ? "team" : "person");
//     setToTeam(q.raisedToRole?._id || q.raisedToRole || "");
//     setTnrInfo(null);
//     setTab("form");
//   };

//   const deleteQuery = async (q) => {
//     if (!window.confirm(`Delete "${q.subject}"? This can't be undone.`)) return;
//     setDeletingId(q._id);
//     try {
//       await minDelay(api.deleteQuery(q._id));
//       toast.success("Ticket deleted");
//       if (expandedId === q._id) setExpandedId(null);
//       fetchQueries(true);
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   // Open tab ku kondu pogum (already Open la irundha list mattum refresh)
//   const goToOpen = () => {
//     if (filters.status === "open" && page === 1) fetchQueries(true);
//     else {
//       setPage(1);
//       setFilters((f) => ({ ...f, status: "open" }));
//     }
//   };

//   const pickFiles = async (e) => {
//     const raw = Array.from(e.target.files || []);
//     e.target.value = "";
//     const bad = raw.find((f) => !ALLOWED.includes(f.type));
//     if (bad) return toast.error(`${bad.name} is not allowed. Use JPG, PNG, WEBP or PDF.`);
//     if (keptCount + files.length + raw.length > MAX_FILES) return toast.error(`You can attach up to ${MAX_FILES} files.`);
//     // Periya phone photos ah chinnadha aakkurom — upload romba fast aagum
//     const picked = await Promise.all(raw.map(compressImage));
//     const big = picked.find((f) => f.size > MAX_SIZE);
//     if (big) return toast.error(`${big.name} is larger than 5 MB.`);
//     setFiles((prev) => [...prev, ...picked]);
//   };

//   const submitForm = async (e) => {
//     e.preventDefault();
//     if (me && form.raisedBy !== me._id) form.raisedBy = me._id; // staff site: eppavume login staff
//     // TNR potta Find pannirukkanum — booking eduththa staff ku dhaan pogum
//     if ((form.tnr || "").trim() && !tnrInfo) return toast.error("Click Find for the TNR first.");
//     if (tnrInfo?.error) return toast.error("Fix the TNR or clear it.");
//     const { queryType, subject, raisedBy, raisedTo } = form;
//     if (teamMode && !toTeam) return toast.error("Choose a team to raise this ticket to.");
//     if (!queryType.trim() || !subject.trim() || !raisedBy || (!teamMode && !raisedTo)) {
//       return toast.error("Fill in query type, subject, raised by and raised to.");
//     }
//     if (!teamMode && raisedBy === raisedTo) return toast.error("Raised by and raised to must be different staff.");

//     const fd = new FormData();
//     Object.entries(form).forEach(([k, v]) => {
//       if (teamMode && k === "raisedTo") return; // Team ku na — pick pannuravanga dhaan "Raised to"
//       fd.append(k, typeof v === "string" ? v.trim() : v);
//     });
//     if (me) fd.append("raisedToRole", teamMode ? toTeam : ""); // "" = Person
//     files.forEach((f) => fd.append("attachments", f));
//     if (editing && removeIds.length) fd.append("removeAttachmentIds", JSON.stringify(removeIds));

//     const typed = form.queryType.trim();
//     if (hiddenTypes.includes(typed.toLowerCase())) unhideType(typed);
//     setSaving(true);
//     setProgress(files.length ? 0 : null);
//     const onProgress = (ev) => ev.total && setProgress(Math.round((ev.loaded * 100) / ev.total));
//     try {
//       const wasEditing = editing;
//       const res = wasEditing ? await api.updateQuery(wasEditing._id, fd, onProgress) : await api.raiseQuery(fd, onProgress);
//       toast.success(res?.noChange ? "Nothing changed" : wasEditing ? "Ticket updated" : "Ticket raised");
//       setEditing(null);
//       setRemoveIds([]);
//       setForm(EMPTY_FORM);
//       setToMode("person");
//       setToTeam("");
//       setFiles([]);
//       setTab("list");
//       if (wasEditing) fetchQueries(true); // edit na adhe tab la irukkattum
//       else goToOpen(); // puthu query → Open tab la theriyum
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setProgress(null);
//       setSaving(false);
//     }
//   };

//   const typedLower = form.queryType.trim().toLowerCase();
//   const isNewType = typedLower && !types.some((t) => t.name.toLowerCase() === typedLower);

//   // "Clear all" — ellaa column filters um + status um (ellaa tickets um varum)
//   const clearFilters = () => {
//     setPage(1);
//     setFilters({ ...EMPTY_FILTERS, status: "" });
//   };

//   // ─── Column filters (header la funnel) ───
//   const colFilters = React.useMemo(
//     () =>
//       buildColumnFilters({
//         types,
//         staff,
//         statuses: CARDS.filter((c) => c.key).map((c) => ({ key: c.key, label: c.label })),
//       }),
//     [types, staff],
//   );
//   const filterColumns = [
//     { id: "ticketNo", label: "Ticket no", fields: colFilters.ticketNo },
//     { id: "ticket", label: "Ticket", fields: colFilters.ticket },
//     { id: "raisedBy", label: "Raised by", fields: colFilters.raisedBy },
//     { id: "raisedTo", label: "Raised to", fields: colFilters.raisedTo },
//     { id: "date", label: "Raised on", fields: colFilters.date },
//     { id: "status", label: "Status", fields: colFilters.status },
//   ];
//   const colHead = (id) => {
//     const c = filterColumns.find((x) => x.id === id);
//     return <ColumnFilter label={c.label} fields={c.fields} filters={filters} onApply={applyFilters} />;
//   };

//   // ─── Status buttons ───
//   const changeStatus = async (q, action, reason) => {
//     setBusyId(q._id);
//     setBusyAction(action);
//     try {
//       // minDelay: spinner kammiyaa 900ms theriyum, takkunu maraiyadhu
//       if (action === "reject") await minDelay(api.reject(q._id, reason));
//       else await minDelay(api[action](q._id)); // pickup / processing / close
//       toast.success(DONE_TEXT[action]);
//       setRejecting(null);
//       fetchQueries(true);
//     } catch (err) {
//       toast.error(err.message);
//       fetchQueries(true); // vera yaaravadhu maathirundha latest kaatum
//     } finally {
//       setBusyId(null);
//       setBusyAction(null);
//     }
//   };

//   const onAction = (q, action) => {
//     if (action === "reject") return setRejecting(q);
//     return changeStatus(q, action);
//   };


//   // ─── Row pieces (table + mobile cards rendu kum same) ───
//   const toggleOpen = (q) => setExpandedId((id) => (id === q._id ? null : q._id));

//   const renderTitle = (q, open, wrap = false) => (
//     <button
//       onClick={() => toggleOpen(q)}
//       aria-expanded={open}
//       className={`block max-w-full text-left font-semibold text-gray-900 hover:text-blue-700 ${wrap ? "break-words" : "truncate"}`}
//     >
//       {q.subject}
//     </button>
//   );

//   const renderMeta = (q) => {
//     const fromThem = q.lastReplyFrom && q.lastReplyFrom !== ME;
//     const ico = "h-3.5 w-3.5";
//     return (
//       <>
//         <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
//           <span className="rounded bg-gray-100 px-1.5 py-0.5 font-semibold text-gray-700">{q.queryType}</span>
//           {q.tnr && <span className="rounded bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-800">TNR {q.tnr}</span>}
//           {q.attachments?.length > 0 && (
//             <span className="inline-flex items-center gap-1" title={`${q.attachments.length} files`}>
//               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={ico} aria-hidden="true">
//                 <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
//               </svg>
//               {q.attachments.length}
//             </span>
//           )}
//           {q.replyCount > 0 && (
//             <span className={`inline-flex items-center gap-1 ${fromThem ? "font-semibold text-green-700" : ""}`} title={`${q.replyCount} replies`}>
//               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={ico} aria-hidden="true">
//                 <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
//               </svg>
//               {q.replyCount}
//               {fromThem && <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-label="New reply" />}
//             </span>
//           )}
//           {q.editCount > 0 && (
//             <span className="inline-flex items-center gap-1" title={`Edited ${q.editCount} time${q.editCount > 1 ? "s" : ""}`}>
//               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={ico} aria-hidden="true">
//                 <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
//               </svg>
//               {q.editCount}
//             </span>
//           )}
//           {q.reopenCount > 0 && (
//             <span className="inline-flex items-center gap-1 text-amber-700" title={`Reopened ${q.reopenCount} time${q.reopenCount > 1 ? "s" : ""}`}>
//               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={ico} aria-hidden="true">
//                 <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />
//               </svg>
//               {q.reopenCount > 1 ? q.reopenCount : ""}
//             </span>
//           )}
//         </div>
//         {q.tnrInfo && (
//           // Ore line, neelamaa irundha "…" — mouse vechaa full ah theriyum
//           <span
//             className="block mt-1 min-w-0 max-w-full truncate text-[12px] leading-5 text-gray-500"
//             title={[q.tnrInfo.tourTitle, q.tnrInfo.travellerName].filter(Boolean).join(" · ")}
//           >
//             {[q.tnrInfo.tourTitle, q.tnrInfo.travellerName].filter(Boolean).join(" · ")}
//           </span>
//         )}
//       </>
//     );
//   };

//   // Endha page la irundhu raise aachu — Raised by column la, person keela
//   const renderVia = (q) => <SourceBadge q={q} />; // Admin / Tour admin / Staff portal

//   const renderDetail = (q) => (
//     <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
//       <div className="min-w-0 xl:col-span-2">
//         {q.tnr && (
//           <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2.5 text-sm">
//             <p className="font-semibold text-amber-900">Booking · TNR {q.tnr}</p>
//             {q.tnrInfo?.tourTitle && <p className="text-gray-700">{q.tnrInfo.tourTitle}</p>}
//             {q.tnrInfo?.travellerName && <p className="text-gray-600">Traveller: {q.tnrInfo.travellerName}</p>}
//           </div>
//         )}
//         <p className="mb-1 text-sm font-semibold text-gray-600">Description</p>
//         <p className="mb-4 whitespace-pre-line break-words text-sm text-gray-800">{q.description || "No description"}</p>
//         {q.status === "reject" && q.rejectReason && (
//           <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
//             <span className="font-semibold">Reject reason: </span>
//             {q.rejectReason}
//           </div>
//         )}
//         <p className="mb-2 text-sm font-semibold text-gray-600">Attachments</p>
//         {q.attachments?.length ? (
//           <AttachmentSets files={q.attachments} renderFile={(a) => <FileChip key={a._id} file={a} />} />
//         ) : (
//           <p className="text-sm text-gray-500">No files attached</p>
//         )}
//       </div>
//       <div className="min-w-0 xl:col-span-3">
//         <p className="mb-2 text-sm font-semibold text-gray-600">Replies</p>
//         <ReplyThread queryId={q._id} api={api} onChanged={() => fetchQueries(true)} />
//       </div>
//     </div>
//   );

//   // Row / card la enga touch pannalum View / Hide — buttons, links, chat thavira
//   const onRowClick = (e, q) => {
//     if (e.target.closest("button, a, input, textarea, select, label, [data-no-toggle]")) return;
//     toggleOpen(q);
//   };

//   const renderActions = (q, open) => {
//     const busy = busyId === q._id;
//     return (
//       <div className="flex w-full items-center gap-1.5 xl:w-auto">
//         {/* Icons — table la oru row ku 3 (periya screen la 6), mela irundha 2nd row — cut aagadhu */}
//         <div className="flex flex-1 flex-wrap items-stretch gap-1.5 xl:grid xl:flex-none xl:grid-cols-3 xl:gap-1 2xl:grid-cols-6">
//           {/* Close / Reject aana apram View mattum */}
//           {/* Team ku naan raise panna ticket — team la vera yaaravadhu dhaan pick pannanum */}
//           {!(me && isTeamOpen(q) && isMine(q)) && ACTIONS.filter((a) => a.from.includes(q.status)).map((a) => (
//             <IconAction
//               key={a.key}
//               kind={a.key}
//               label={a.label}
//               short={a.key === "processing" ? "Process" : undefined}
//               busyText={BUSY_TEXT[a.key]}
//               busy={busy && busyAction === a.key}
//               disabled={busy && busyAction !== a.key}
//               onClick={() => onAction(q, a.key)}
//             />
//           ))}
//           {/* Tour admin raise panna ticket — admin page madhiriye Edit / Delete */}
//           {isMine(q) && ["open", "pickup"].includes(q.status) && (<>
//             <IconAction kind="edit" label="Edit" disabled={busy} onClick={() => openEdit(q)} />
//             <IconAction
//               kind="delete"
//               label="Delete"
//               busyText="Deleting…"
//               busy={deletingId === q._id}
//               disabled={busy}
//               onClick={() => deleteQuery(q)}
//             />
//           </>
//           )}
//         </div>
//         {/* Touch pannuna open / close nu kaatura arrow */}
//         <span className="ml-auto flex h-9 w-7 flex-shrink-0 items-center justify-center self-center text-gray-400 xl:ml-1" aria-hidden="true">
//           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 transition ${open ? "rotate-180 text-green-600" : ""}`}>
//             <path d="m6 9 6 6 6-6" />
//           </svg>
//         </span>
//       </div>
//     );
//   };

//   const cardCount = (key) => (key ? counts[key] || 0 : Object.values(counts).reduce((a, b) => a + b, 0));
//   const inputCls =
//     "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100";
//   const labelCls = "mb-1.5 block text-sm font-semibold text-gray-600";

//   // ════════════════════════════════════════════════════════════════
//   return (
//         <div className="w-full min-w-0 max-w-7xl flex-1 p-3 pt-16 sm:p-5 sm:pt-16 lg:pt-5">
//       <div className="mb-5 text-center sm:mb-6">
//         <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Raise / View Tickets</h1>
//         <p className="mt-1 text-sm text-gray-500">Tickets from admin land here. Pick them up, reply, close them, or raise your own.</p>
//         <span className="mx-auto mt-3 block h-1 w-14 rounded-full bg-green-500" aria-hidden="true" />
//       </div>


//       {/* Tabs */}
//       <div className="mb-6 flex justify-center">
//         <div className="flex w-full gap-1 rounded-2xl bg-gray-100 p-1 sm:inline-flex sm:w-auto" role="tablist">
//           <button
//             role="tab"
//             aria-selected={tab === "list"}
//             onClick={() => {
//               if (tab !== "list") goToOpen();
//               setEditing(null);
//               setTab("list");
//             }}
//             className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition sm:flex-none sm:px-5 sm:text-sm ${tab === "list" ? "bg-white text-green-700 shadow" : "text-gray-600 hover:text-gray-900"}`}
//           >
//             All Tickets
//           </button>
//           <button
//             role="tab"
//             aria-selected={tab === "form"}
//             onClick={() => (editing && tab === "form" ? null : openRaise())}
//             className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition sm:flex-none sm:px-5 sm:text-sm ${tab === "form" ? "bg-white text-green-700 shadow" : "text-gray-600 hover:text-gray-900"}`}
//           >
//             {editing && tab === "form" ? "Edit Ticket" : "+ Raise Ticket"}
//           </button>
//         </div>
//       </div>

//       {/* ═══════════ FORM (raise / edit) ═══════════ */}
//       {tab === "form" && (
//         <form onSubmit={submitForm} className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
//           <h2 className="mb-5 text-xl font-bold">{editing ? `Edit Ticket` : "Raise a Ticket"}</h2>

//           <div className="mb-4">
//             <label htmlFor="bb-type" className={labelCls}>Ticket type</label>
//             <input
//               id="bb-type"
//               value={form.queryType}
//               onChange={(e) => setForm({ ...form, queryType: e.target.value })}
//               placeholder="Pick below or type a new one"
//               className={inputCls}
//             />
//             <div className="mt-2 flex flex-wrap gap-2">
//               {types
//                 .filter((t) => !hiddenTypes.includes(t.name.toLowerCase()))
//                 .map((t) => {
//                   const active = t.name.toLowerCase() === typedLower;
//                   return (
//                     <span
//                       key={t.name}
//                       className={`inline-flex items-center overflow-hidden rounded-full border text-sm ${active ? "border-green-600 bg-green-600 font-semibold text-white" : "border-gray-200 bg-gray-50 text-gray-700"
//                         }`}
//                     >
//                       <button
//                         type="button"
//                         onClick={() => setForm({ ...form, queryType: t.name })}
//                         aria-pressed={active}
//                         className={`py-1.5 pl-3 pr-1.5 ${active ? "" : "hover:bg-gray-100"}`}
//                       >
//                         {t.name}
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => {
//                           hideType(t.name);
//                           if (active) setForm({ ...form, queryType: "" });
//                         }}
//                         aria-label={`Remove ${t.name} from suggestions`}
//                         title="Remove from suggestions"
//                         className={`flex h-full items-center py-1.5 pl-1 pr-2.5 ${active ? "text-green-100 hover:text-white" : "text-gray-400 hover:text-red-600"}`}
//                       >
//                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3.5 w-3.5" aria-hidden="true">
//                           <path d="M18 6 6 18M6 6l12 12" />
//                         </svg>
//                       </button>
//                     </span>
//                   );
//                 })}
//               {hiddenTypes.length > 0 && (
//                 <button type="button" onClick={() => saveHidden([])} className="px-1 text-xs font-semibold text-blue-700 hover:underline">
//                   Show removed ({hiddenTypes.length})
//                 </button>
//               )}
//             </div>
//             {isNewType && <p className="mt-2 text-sm text-green-700">"{form.queryType.trim()}" is a new type. It will be saved with this query.</p>}
//           </div>

//           {/* ── Booking TNR (optional) — booking eduththa staff "Raised to" la auto ── */}
//           <div className="mb-4">
//             <label htmlFor="bb-tnr" className={labelCls}>Booking TNR (optional)</label>
//             <div className="flex gap-2">
//               <input
//                 id="bb-tnr"
//                 value={form.tnr || ""}
//                 onChange={(e) => {
//                   setForm({ ...form, tnr: e.target.value.toUpperCase().replace(/\s/g, "") });
//                   setTnrInfo(null);
//                 }}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") {
//                     e.preventDefault();
//                     findTnr();
//                   }
//                 }}
//                 placeholder="e.g. KD74PX"
//                 maxLength={12}
//                 className={inputCls + " uppercase"}
//               />
//               <button
//                 type="button"
//                 onClick={findTnr}
//                 disabled={tnrLoading || !(form.tnr || "").trim()}
//                 className="shrink-0 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
//               >
//                 {tnrLoading ? "Finding…" : "Find"}
//               </button>
//             </div>
//             <TnrInfo info={tnrInfo} />
//           </div>

//           <div className="mb-4 grid gap-4 sm:grid-cols-2">
//             <div>
//               <label htmlFor="bb-by" className={labelCls}>Raised by</label>
//               <select
//                 id="bb-by"
//                 value={me ? me._id : form.raisedBy}
//                 onChange={(e) => setForm({ ...form, raisedBy: e.target.value })}
//                 disabled={!!me}
//                 className={inputCls + (me ? " cursor-not-allowed bg-gray-100" : "")}
//               >
//                 <option value="">Choose staff</option>
//                 {/* Staff site: login aana staff list la illaadhaalum kaattanum */}
//                 {me && !staff.some((s) => String(s._id) === String(me._id)) && (
//                   <option value={me._id}>{me.fullName}</option>
//                 )}
//                 <StaffOptions staff={staff} />
//               </select>
//               {me && <p className="mt-1 text-xs text-gray-500">🔒 Auto-filled with your login</p>}
//             </div>
//             <div>
//               <div className="mb-1.5 flex items-center justify-between gap-2">
//                 <label htmlFor="bb-to" className="block text-sm font-semibold text-gray-600">Raised to</label>
//                 {me && <ToModeSwitch value={toMode} onChange={changeToMode} />}
//               </div>
//               {teamMode ? (
//                 <>
//                   <select id="bb-to" value={toTeam} onChange={(e) => setToTeam(e.target.value)} className={inputCls}>
//                     <option value="">Choose team</option>
//                     {teamsFromStaff(staff).map((t) => (
//                       <option key={t._id} value={t._id}>
//                         {t.name} team ({t.count} {t.count === 1 ? "member" : "members"})
//                       </option>
//                     ))}
//                   </select>
//                   <p className="mt-1 text-xs text-gray-500">👥 Everyone in this team sees it. Whoever picks it up gets it.</p>
//                 </>
//               ) : (
//                 <>
//                   <select
//                     id="bb-to"
//                     value={form.raisedTo}
//                     onChange={(e) => setForm({ ...form, raisedTo: e.target.value })}
//                     className={inputCls}
//                   >
//                     <option value="">Choose staff</option>
//                     <StaffOptions staff={staff} exclude={me ? me._id : form.raisedBy} />
//                   </select>
//                   {tnrSuggested && String(form.raisedTo) === String(tnrInfo.staff._id) && (
//                     <p className="mt-1 text-xs text-gray-500">Booked this TNR — you can change it</p>
//                   )}
//                 </>
//               )}
//             </div>
//           </div>
//           {staffError && (
//             <div className="-mt-2 mb-4 flex flex-wrap items-center gap-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800" role="alert">
//               <span>{staffError}</span>
//               <button type="button" onClick={fetchStaff} className="font-semibold underline underline-offset-2">
//                 Try again
//               </button>
//             </div>
//           )}

//           <div className="mb-4">
//             <label htmlFor="bb-subject" className={labelCls}>Subject *</label>
//             <input
//               id="bb-subject"
//               value={form.subject}
//               onChange={(e) => setForm({ ...form, subject: e.target.value })}
//               placeholder="e.g. Advance not reflecting for TNR KP48RT"
//               className={inputCls}
//             />
//           </div>

//           <div className="mb-4">
//             <label htmlFor="bb-desc" className={labelCls}>Description</label>
//             <textarea
//               id="bb-desc"
//               rows={4}
//               value={form.description}
//               onChange={(e) => setForm({ ...form, description: e.target.value })}
//               placeholder="What happened, and what needs to be done"
//               className={inputCls}
//             />
//           </div>

//           <div className="mb-6">
//             <p className={labelCls}>Attachments</p>
//             <div className="grid gap-3 sm:grid-cols-2">
//               <button
//                 type="button"
//                 onClick={() => imageInputRef.current?.click()}
//                 className="flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-left hover:border-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
//               >
//                 <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700" aria-hidden="true">
//                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                     <rect x="3" y="3" width="18" height="18" rx="2" />
//                     <circle cx="8.5" cy="8.5" r="1.5" />
//                     <polyline points="21 15 16 10 5 21" />
//                   </svg>
//                 </span>
//                 <span>
//                   <span className="block text-sm font-semibold text-blue-700">Add image</span>
//                   <span className="block text-xs text-gray-500">JPG, PNG or WEBP</span>
//                 </span>
//               </button>
//               <button
//                 type="button"
//                 onClick={() => pdfInputRef.current?.click()}
//                 className="flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-left hover:border-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
//               >
//                 <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-700" aria-hidden="true">
//                   PDF
//                 </span>
//                 <span>
//                   <span className="block text-sm font-semibold text-red-700">Add PDF</span>
//                   <span className="block text-xs text-gray-500">Bills, letters, statements</span>
//                 </span>
//               </button>
//             </div>
//             <p className="mt-2 text-xs text-gray-500">
//               Images and PDFs together, up to {MAX_FILES} files, 5 MB each. {keptCount + files.length}/{MAX_FILES} added.
//             </p>
//             <input ref={imageInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={pickFiles} className="hidden" />
//             <input ref={pdfInputRef} type="file" multiple accept="application/pdf,.pdf" onChange={pickFiles} className="hidden" />

//             {editing?.attachments?.length > 0 && (
//               <div className="mt-3">
//                 <AttachmentSets
//                   files={editing.attachments}
//                   renderFile={(a) => {
//                     const removed = removeIds.includes(a._id);
//                     return (
//                       <FileChip
//                         key={a._id}
//                         file={a}
//                         removed={removed}
//                         onRemove={() => setRemoveIds((ids) => (removed ? ids.filter((id) => id !== a._id) : [...ids, a._id]))}
//                       />
//                     );
//                   }}
//                 />
//               </div>
//             )}
//             {files.length > 0 && (
//               <div className="mt-3">
//                 <p className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
//                   <span className="rounded-md bg-green-600 px-1.5 py-0.5 font-semibold text-white">
//                     Attachment {editing ? Math.max(0, ...(editing.attachments || []).map((a) => a.set || 1)) + 1 : 1}
//                   </span>
//                   New, uploads when you save
//                 </p>
//                 <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
//                   {files.map((f, i) => (
//                     <FileChip key={`${f.name}-${i}`} file={f} onRemove={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))} />
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="grid grid-cols-2 gap-3 sm:flex">
//             <button
//               type="submit"
//               disabled={saving}
//               className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
//             >
//               {saving && <Spinner />}
//               {saving
//                 ? progress !== null && progress < 100
//                   ? `Uploading ${progress}%`
//                   : editing
//                     ? "Saving…"
//                     : "Raising…"
//                 : editing
//                   ? "Save changes"
//                   : "Raise query"}
//             </button>
//             <button
//               type="button"
//               onClick={() => {
//                 setEditing(null);
//                 setTab("list");
//               }}
//               className="h-11 rounded-xl border border-gray-300 px-6 text-sm font-semibold text-gray-700 hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       )}

//       {tab === "list" && (
//         <>
//           {/* Cards */}
//           <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
//             {CARDS.map((c) => {
//               const active = filters.status === c.key;
//               return (
//                 <button
//                   key={c.label}
//                   onClick={() => setFilter("status", c.key)}
//                   aria-pressed={active}
//                   className={`group relative overflow-hidden rounded-2xl border p-3 text-left transition sm:p-4 ${active ? `${c.tint} border-transparent ring-2 ${c.ring} shadow-sm` : "border-gray-200 bg-white hover:-translate-y-0.5 hover:shadow-md"
//                     }`}
//                 >
//                   <span className={`absolute inset-y-0 left-0 w-1 ${c.bar}`} aria-hidden="true" />
//                   <div className="flex items-start justify-between gap-2">
//                     <p className={`text-2xl font-bold tabular-nums sm:text-3xl ${c.num}`}>{cardCount(c.key)}</p>
//                     <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-white ${c.bar}`} aria-hidden="true">
//                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
//                         <path d={c.icon} />
//                       </svg>
//                     </span>
//                   </div>
//                   <p className="mt-1 text-sm font-medium text-gray-600">{c.label}</p>
//                 </button>
//               );
//             })}
//           </div>

//           {/* Column filters — table header la funnel; inga active filters + Clear all */}
//           <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
//             <div className="min-w-0 flex-1">
//               {/* Mobile / tablet la table header illa — filter buttons inga */}
//               <div className="mb-2 flex flex-wrap gap-2 xl:hidden">
//                 {filterColumns.map((c) => (
//                   <ColumnFilter key={c.id} variant="chip" label={c.label} fields={c.fields} filters={filters} onApply={applyFilters} />
//                 ))}
//               </div>
//               <ActiveFilterChips columns={filterColumns} filters={filters} onApply={applyFilters} onClearAll={clearFilters} />
//             </div>
//             <button
//               onClick={() => fetchQueries()}
//               className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
//             >
//               Refresh
//             </button>
//           </div>

//           {/* Table (big screens) + cards (mobile / tablet) */}
//           <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
//             {loading && <p className="px-4 py-10 text-center text-sm text-gray-500 xl:hidden">Loading queries…</p>}
//             {!loading && queries.length === 0 && (
//               <div className="px-4 py-12 text-center xl:hidden">
//                 <p className="font-semibold text-gray-800">No tickets here</p>
//                 <p className="mt-1 text-sm text-gray-500">New tickets from admin will show up here automatically.</p>
//               </div>
//             )}

//             {(
//               <>
//                 {/* ── Big screens: table ── */}
//                 <div className="hidden overflow-x-auto xl:block">
//                   <table className="w-full min-w-[960px] text-left">
//                     <thead className="bg-blue-50 text-sm text-gray-600">
//                       <tr>
//                         <th className="whitespace-nowrap px-4 py-3 font-semibold">{colHead("ticketNo")}</th>
//                         <th className="whitespace-nowrap px-4 py-3 font-semibold">{colHead("ticket")}</th>
//                         <th className="whitespace-nowrap px-4 py-3 font-semibold">{colHead("raisedBy")}</th>
//                         <th className="whitespace-nowrap px-4 py-3 font-semibold">{colHead("raisedTo")}</th>
//                         <th className="whitespace-nowrap px-4 py-3 font-semibold">{colHead("date")}</th>
//                         <th className="whitespace-nowrap px-4 py-3 font-semibold">{colHead("status")}</th>
//                         <th className="whitespace-nowrap px-4 py-3 font-semibold">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {(loading || queries.length === 0) && (
//                         <tr>
//                           <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
//                             {loading ? (
//                               "Loading tickets…"
//                             ) : (
//                               <>
//                                 <p className="font-semibold text-gray-800">No tickets match these filters</p>
//                                 <button type="button" onClick={clearFilters} className="mt-2 font-semibold text-blue-600 hover:underline">
//                                   Clear all filters
//                                 </button>
//                               </>
//                             )}
//                           </td>
//                         </tr>
//                       )}
//                       {!loading &&
//                         queries.map((q, i) => {
//                         const open = expandedId === q._id;
//                         return (
//                           <React.Fragment key={q._id}>
//                             <tr onClick={(e) => onRowClick(e, q)} className={`cursor-pointer border-t border-gray-100 transition ${open ? "bg-blue-50/40" : "hover:bg-gray-50"}`}>
//                               <td className={`whitespace-nowrap border-l-4 px-4 py-3 ${STATUS_BAR[q.status] || "border-l-transparent"}`}>
//                                 <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold tracking-wide text-blue-800">{q.ticketNo || "—"}</span>
//                               </td>
//                               <td className="max-w-[13rem] px-4 py-3 2xl:max-w-xs">
//                                 {renderTitle(q, open)}
//                                 {renderMeta(q)}
//                               </td>
//                               <td className="px-4 py-3 text-sm">
//                                 <p className="font-medium">{staffName(q.raisedBy)}</p>
//                                 <p className="text-xs text-gray-500">{staffRole(q.raisedBy)}</p>
//                                 {renderVia(q)}
//                               </td>
//                               <td className="px-4 py-3 text-sm">
//                                 <p className="font-medium">{toName(q, staffName)}</p>
//                                 <p className="text-xs text-gray-500">{toSub(q, staffRole)}</p>
//                               </td>
//                               <td className="whitespace-nowrap px-4 py-3 text-sm">
//                                 <p>{fmtDate(q.createdAt)}</p>
//                                 <p className="text-xs text-gray-500">{fmtTime(q.createdAt)}</p>
//                               </td>
//                               <td className="px-4 py-3">
//                                 <StatusPill status={q.status} />
//                               </td>
//                               <td className="px-3 py-3">{renderActions(q, open)}</td>
//                             </tr>
//                             {open && (
//                               <tr className="border-t border-gray-100 bg-blue-50/40">
//                                 <td colSpan={7} className="px-4 pb-5 pt-2">
//                                   {renderDetail(q)}
//                                 </td>
//                               </tr>
//                             )}
//                           </React.Fragment>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* ── Mobile / tablet / small laptop: cards ── */}
//                 {!loading && queries.length > 0 && (
//                 <ul className="divide-y divide-gray-100 xl:hidden">
//                   {queries.map((q, i) => {
//                     const open = expandedId === q._id;
//                     return (
//                       <li
//                         key={q._id}
//                         onClick={(e) => onRowClick(e, q)}
//                         className={`cursor-pointer border-l-4 p-4 transition ${STATUS_BAR[q.status] || "border-l-transparent"} ${open ? "bg-blue-50/40" : "active:bg-gray-50"}`}
//                       >
//                         <div className="flex items-start justify-between gap-3">
//                           <div className="min-w-0 flex-1">
//                             <p className="mb-1 inline-block rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold tracking-wide text-blue-800">{q.ticketNo || "—"}</p>
//                             {renderTitle(q, open, true)}
//                             {renderMeta(q)}
//                           </div>
//                           <div className="flex-shrink-0">
//                             <StatusPill status={q.status} />
//                           </div>
//                         </div>
//                         <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
//                           <div className="min-w-0">
//                             <dt className="text-xs text-gray-500">Raised by</dt>
//                             <dd className="truncate font-medium">{staffName(q.raisedBy)}</dd>
//                             <dd className="truncate text-xs text-gray-500">{staffRole(q.raisedBy)}</dd>
//                             <dd>{renderVia(q)}</dd>
//                           </div>
//                           <div className="min-w-0">
//                             <dt className="text-xs text-gray-500">Raised to</dt>
//                             <dd className="truncate font-medium">{toName(q, staffName)}</dd>
//                             <dd className="truncate text-xs text-gray-500">{toSub(q, staffRole)}</dd>
//                           </div>
//                           <div className="col-span-2 sm:col-span-1">
//                             <dt className="text-xs text-gray-500">Raised on</dt>
//                             <dd>
//                               {fmtDate(q.createdAt)} <span className="text-xs text-gray-500">{fmtTime(q.createdAt)}</span>
//                             </dd>
//                           </div>
//                         </dl>
//                         <div className="mt-3">{renderActions(q, open)}</div>
//                         {open && (
//                           <div data-no-toggle className="mt-4 cursor-auto border-t border-gray-200 pt-4">
//                             {renderDetail(q)}
//                           </div>
//                         )}
//                       </li>
//                     );
//                   })}
//                 </ul>
//                 )}
//               </>
//             )}

//             <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
//               <span>
//                 Showing <b>{queries.length}</b> of <b>{total}</b> queries
//               </span>
//               <div className="flex items-center justify-between gap-2 sm:justify-end">
//                 <button
//                   onClick={() => setPage((p) => Math.max(1, p - 1))}
//                   disabled={page <= 1}
//                   className="rounded-lg border border-gray-200 px-3 py-2 font-semibold disabled:opacity-40"
//                 >
//                   Previous
//                 </button>
//                 <span className="whitespace-nowrap">
//                   Page {page} of {totalPages}
//                 </span>
//                 <button
//                   onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                   disabled={page >= totalPages}
//                   className="rounded-lg border border-gray-200 px-3 py-2 font-semibold disabled:opacity-40"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </div>

//         </>
//       )}

//       {rejecting && (
//         <RejectModal
//           query={rejecting}
//           busy={busyId === rejecting._id}
//           onCancel={() => setRejecting(null)}
//           onConfirm={(reason) => changeStatus(rejecting, "reject", reason)}
//         />
//       )}
//     </div>
//   );
// };

// export default TicketLanding;


// ════════════════════════════════════════════════════════════════
//  TicketLanding.jsx — TOUR ADMIN side  (tourController → /api/tour/...)
//  Queries list + filters, stage wise buttons (Pickup → Processing → Close / Reject),
//  Forward (delegate) with reason, Reopen, "Assigned to me" / "Raised by me" views,
//  replies (add / edit / delete)
//
//  API calls ellam context/TourContext.jsx la "ticketApi" kulla irukku
// ════════════════════════════════════════════════════════════════
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { TourContext } from "../../context/TourContext"; // ⚙️ path check pannunga
import useStaffSelf from "../../staff/useStaffSelf"; // staff site la login aana staff (admin site la null)
import { ColumnFilter, ActiveFilterChips, buildColumnFilters } from "../../components/TicketFilters";
import { roleName, SourceBadge, isMyReply, replyLabel, replyName, StaffOptions, TnrInfo, teamsFromStaff, isTeamOpen, toName, toSub, ToModeSwitch } from "../../staff/ticketWho";

const ME = "touradmin"; // replies la "from" — indha side (Ticket Landing)
const OTHER_NAME = "Admin";
const SYNC_EVERY_MS = 10000;

// ════════════════════════════════════════════════════════════════
//  Helpers
// ════════════════════════════════════════════════════════════════
const STATUS = {
  open: { label: "Open", pill: "bg-blue-50 text-blue-700", dot: "bg-blue-600" },
  pickup: { label: "Picked up", pill: "bg-violet-50 text-violet-700", dot: "bg-violet-600" },
  processing: { label: "Processing", pill: "bg-amber-50 text-amber-800", dot: "bg-amber-600" },
  close: { label: "Closed", pill: "bg-green-50 text-green-700", dot: "bg-green-600" },
  reject: { label: "Rejected", pill: "bg-red-50 text-red-700", dot: "bg-red-600" },
};

const CARDS = [
  { key: "", label: "Total", bar: "bg-slate-700", tint: "bg-slate-50", ring: "ring-slate-400", num: "text-slate-900", icon: "M4 6h16M4 12h16M4 18h10" },
  { key: "open", label: "Open", bar: "bg-sky-500", tint: "bg-sky-50", ring: "ring-sky-400", num: "text-sky-900", icon: "M12 5v14M5 12h14" },
  { key: "pickup", label: "Picked up", bar: "bg-violet-500", tint: "bg-violet-50", ring: "ring-violet-400", num: "text-violet-900", icon: "M7 11V7a5 5 0 0 1 10 0v4M5 11h14v9H5z" },
  { key: "processing", label: "Processing", bar: "bg-amber-500", tint: "bg-amber-50", ring: "ring-amber-400", num: "text-amber-900", icon: "M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
  { key: "close", label: "Closed", bar: "bg-green-600", tint: "bg-green-50", ring: "ring-green-500", num: "text-green-900", icon: "m5 13 4 4L19 7" },
  { key: "reject", label: "Rejected", bar: "bg-red-500", tint: "bg-red-50", ring: "ring-red-400", num: "text-red-900", icon: "M6 6l12 12M18 6 6 18" },
];

// Status ku row / card la left side color line
const STATUS_BAR = {
  open: "border-l-sky-500",
  pickup: "border-l-violet-500",
  processing: "border-l-amber-500",
  close: "border-l-green-600",
  reject: "border-l-red-500",
};

// Spinner konja neram theriyanum — romba fast ah mudinjaalum kammiyaa 1.2 sec
const minDelay = (promise, ms = 1200) =>
  Promise.all([promise, new Promise((r) => setTimeout(r, ms))]).then(([v]) => v);

// Initials for chat avatar
const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

// Page open aagum bodhum, "Clear Filters" pannum bodhum Open dhaan default
const EMPTY_FILTERS = {
  search: "", ticketNo: "", subject: "", queryType: "", status: "open",
  raisedBy: "", raisedByDept: "", raisedTo: "", raisedToDept: "", fromDate: "", toDate: "",
  mine: "", // "" = All | assigned | raised | delegated
};

// Mela irukura view switch — All / Assigned to me / Raised by me / Forwarded by me
const MINE_VIEWS = [
  { key: "", label: "All tickets" },
  { key: "assigned", label: "Assigned to me" }, // ivai moonum staff site la mattum
  { key: "raised", label: "Raised by me" },
  { key: "delegated", label: "Forwarded by me" },
];

// Stage wise — ovvoru status la adutha stage button mattum (backend rules same)
//   Open → Pickup | Picked up → Processing | Processing → Close / Reject | Reject → Reopen (Close aanadhu mudinjadhu)
const ACTIONS = [
  { key: "pickup", label: "Pickup", from: ["open"], cls: "bg-violet-600 text-white hover:bg-violet-700" },
  { key: "processing", label: "Processing", from: ["pickup"], cls: "bg-amber-600 text-white hover:bg-amber-700" },
  { key: "close", label: "Close", from: ["processing"], cls: "bg-green-600 text-white hover:bg-green-700" },
  { key: "reject", label: "Reject", from: ["processing"], cls: "border border-red-300 bg-white text-red-700 hover:bg-red-50" },
];
const ACTIVE_STATUSES = ["open", "pickup", "processing"];
const DONE_TEXT = {
  pickup: "Ticket picked up",
  processing: "Ticket moved to processing",
  close: "Ticket closed",
  reject: "Ticket rejected",
  reopen: "Ticket reopened",
};
const BUSY_TEXT = { pickup: "Picking up…", processing: "Updating…", close: "Closing…", reject: "Rejecting…", reopen: "Reopening…" };

const staffName = (s) => s?.name || s?.fullName || s?.staffName || "—";
const staffRole = (s) => roleName(s) || s?.designation || ""; // role ObjectId kaattaama, role name
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");
const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "";
const fmtSize = (b) => (!b ? "" : b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

// ════════════════════════════════════════════════════════════════
//  Small pieces
// ════════════════════════════════════════════════════════════════
const StatusPill = ({ status }) => {
  const s = STATUS[status] || STATUS.open;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const FileChip = ({ file, onRemove, removed }) => {
  const isPdf = file.fileType === "pdf" || file.type === "application/pdf";
  const saved = Boolean(file.url); // DB la irukura file (Cloudinary url irukku)
  return (
    <div className={`flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-lg border px-2.5 py-2 ${removed ? "border-red-200 bg-red-50 opacity-60" : "border-gray-200 bg-white"}`}>
      {saved && !isPdf ? (
        // Image na chinna preview — click pannuna full size pudhu tab la
        <a href={file.url} target="_blank" rel="noreferrer" className="flex-shrink-0" aria-label={`Open ${file.fileName || "image"}`}>
          <img src={file.url} alt="" className="h-12 w-12 rounded-md border border-gray-200 object-cover" loading="lazy" />
        </a>
      ) : (
        <span
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md text-xs font-bold ${isPdf ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
            }`}
        >
          {isPdf ? "PDF" : "IMG"}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{file.fileName || file.name || "Attachment"}</p>
        <p className="text-xs text-gray-500">{fmtSize(file.size)}</p>
      </div>
      {saved && !onRemove && (
        <a
          href={file.url}
          target="_blank"
          rel="noreferrer"
          className="flex-shrink-0 whitespace-nowrap rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
        >
          {isPdf ? "Open PDF" : "View"}
        </a>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="flex-shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          {removed ? "Undo" : "Remove"}
        </button>
      )}
    </div>
  );
};

// ─── Reply thread (chat) ─────────────────────────────────────────
// ─── Spinner (button la loading) ───
const Spinner = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`animate-spin ${className}`}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// Attachments ah set set ah: [[1, [...]], [2, [...]]]
const groupBySet = (list = []) => {
  const map = new Map();
  list.forEach((a) => {
    const k = a.set || 1;
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(a);
  });
  return [...map.entries()].sort((x, y) => x[0] - y[0]);
};

// "Attachment 1", "Attachment 2" nu set set ah
const AttachmentSets = ({ files, renderFile }) => (
  <div className="grid grid-cols-1 gap-3">
    {groupBySet(files).map(([set, list]) => (
      <div key={set} className="min-w-0">
        <p className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="rounded-md bg-blue-600 px-1.5 py-0.5 font-semibold text-white">Attachment {set}</span>
          {set === 1 ? "Added with the query" : "Added on edit"}
        </p>
        <div className="grid grid-cols-1 gap-2">{list.map(renderFile)}</div>
      </div>
    ))}
  </div>
);

// ─── Action icons (FIT Enquiries page madhiri chinna icon buttons) ───
const ACT_ICON = {
  view: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  hide: "m3 3 18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.2A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6C3.9 8.4 2 12 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  delete: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6",
  reopen: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5",
  delegate: "M15 3h6v6M21 3l-9 9M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5",
  pickup: "M22 12h-6l-2 3h-4l-2-3H2M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z",
  processing: "M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  close: "M20 6 9 17l-5-5",
  reject: "M18 6 6 18M6 6l12 12",
};

const ACT_TONE = {
  view: "bg-gray-50 text-gray-700 ring-gray-200 hover:bg-gray-100",
  edit: "bg-indigo-50 text-indigo-700 ring-indigo-200 hover:bg-indigo-100",
  delete: "bg-red-50 text-red-600 ring-red-200 hover:bg-red-100",
  reopen: "bg-blue-50 text-blue-700 ring-blue-200 hover:bg-blue-100",
  delegate: "bg-cyan-50 text-cyan-700 ring-cyan-200 hover:bg-cyan-100",
  pickup: "bg-violet-50 text-violet-700 ring-violet-200 hover:bg-violet-100",
  processing: "bg-amber-50 text-amber-700 ring-amber-300 hover:bg-amber-100",
  close: "bg-green-50 text-green-700 ring-green-300 hover:bg-green-100",
  reject: "bg-red-50 text-red-600 ring-red-200 hover:bg-red-100",
};

// Periya screen (table) la icon mattum + hover tooltip.
// Mobile / tablet la icon keela chinna label — touch la enna button nu theriyanum.
const IconAction = ({ kind, icon, label, short, onClick, busy, disabled, busyText, expanded }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled || busy}
    aria-label={label}
    aria-busy={busy || undefined}
    aria-expanded={expanded}
    className={`group relative flex min-w-[4.25rem] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-2 ring-1 ring-inset transition disabled:cursor-not-allowed disabled:opacity-60 xl:h-8 xl:w-8 xl:min-w-0 xl:flex-none xl:p-0 ${ACT_TONE[kind]}`}
  >
    {busy ? (
      <Spinner className="h-[18px] w-[18px]" />
    ) : (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden="true">
        <path d={ACT_ICON[icon || kind]} />
      </svg>
    )}
    <span className="max-w-full truncate text-[10px] font-semibold leading-none min-[400px]:text-[11px] xl:hidden">{busy ? "…" : short || label}</span>
    {/* tooltip — periya screen la mattum */}
    <span className="pointer-events-none absolute -top-8 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow transition group-hover:opacity-100 group-focus-visible:opacity-100 xl:block">
      {busy ? busyText : label}
    </span>
  </button>
);

const ReplyThread = ({ queryId, api, onChanged }) => {
  const me = useStaffSelf(); // staff site: en reply mattum "You"
  const [data, setData] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const versionRef = useRef(null);
  const endRef = useRef(null);

  const load = useCallback(
    async (silent = false) => {
      try {
        const res = await api.getReplies(queryId);
        if (res.version !== versionRef.current) {
          versionRef.current = res.version;
          setData(res);
        }
      } catch (err) {
        if (!silent) toast.error(err.message);
      }
    },
    [api, queryId],
  );

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 5000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [data?.replies?.length]);

  const send = async () => {
    const message = text.trim();
    if (!message) return;
    setSending(true);
    try {
      await api.addReply(queryId, message);
      setText("");
      await load();
      onChanged?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const saveEdit = async (replyId) => {
    const message = editText.trim();
    if (!message) return;
    try {
      await api.editReply(queryId, replyId, message);
      setEditingId(null);
      toast.success("Reply updated");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (replyId) => {
    if (!window.confirm("Delete this reply?")) return;
    try {
      await api.deleteReply(queryId, replyId);
      toast.success("Reply deleted");
      await load();
      onChanged?.();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!data) return <p className="text-sm text-gray-500">Loading replies…</p>;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex max-h-96 flex-col gap-3 overflow-y-auto rounded-2xl border border-gray-100 bg-gradient-to-b from-gray-50 to-white p-3">
        {data.replies.length === 0 && <p className="py-4 text-center text-sm text-gray-500">No replies yet. Start the conversation below.</p>}
        {data.replies.map((r) => {
          const mine = isMyReply(r, ME, me);
          return (
            <div key={r._id} className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${mine ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                  }`}
                aria-hidden="true"
              >
                {mine ? "You".slice(0, 1) : initials(replyName(r) || OTHER_NAME)}
              </span>
              <div className={`max-w-[85%] break-words rounded-2xl sm:max-w-[75%] px-3.5 py-2.5 ${mine ? "rounded-br-sm bg-green-600 text-white" : "rounded-bl-sm border border-gray-200 bg-white"}`}>
                <p className={`mb-0.5 text-xs font-semibold ${mine ? "text-green-100" : "text-gray-500"}`}>
                  {mine ? "You" : replyLabel(r)}
                </p>
                {editingId === r._id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      maxLength={2000}
                      className="w-full min-w-[12rem] rounded-lg p-2 text-sm text-gray-900"
                      aria-label="Edit reply"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(r._id)} className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-green-700">
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="rounded-md px-2.5 py-1 text-xs font-semibold text-green-50">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-line text-sm">{r.message}</p>
                )}
                <div className={`mt-1 flex items-center gap-3 text-[11px] ${mine ? "text-green-100" : "text-gray-400"}`}>
                  <span>
                    {fmtDate(r.createdAt)} {fmtTime(r.createdAt)}
                    {r.editedAt ? " (edited)" : ""}
                  </span>
                  {mine && data.canReply && editingId !== r._id && (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(r._id);
                          setEditText(r.message);
                        }}
                        className="font-semibold underline-offset-2 hover:underline"
                      >
                        Edit
                      </button>
                      <button onClick={() => remove(r._id)} className="font-semibold underline-offset-2 hover:underline">
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {data.canReply ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            maxLength={2000}
            placeholder="Write a reply… (Enter to send, Shift+Enter for new line)"
            aria-label="Reply message"
            className="w-full flex-1 rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <button
            onClick={send}
            disabled={sending || !text.trim()}
            className="h-11 rounded-xl bg-green-600 px-5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500">This Ticket is {data.status === "close" ? "closed" : "rejected"}, so replies are turned off.</p>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
//  Reject modal
// ════════════════════════════════════════════════════════════════
const RejectModal = ({ query, onCancel, onConfirm, busy }) => {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="reject-title">
      <div className="w-full max-w-md rounded-2xl bg-white p-6">
        <h2 id="reject-title" className="text-lg font-bold">Reject this query?</h2>
        <p className="mt-1 text-sm text-gray-600">{query.subject}</p>
        <label htmlFor="reject-reason" className="mb-1.5 mt-4 block text-sm font-semibold text-gray-600">
          Reason (optional)
        </label>
        <textarea
          id="reject-reason"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Tell the admin why"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
        />
        <p className="mt-2 text-xs text-gray-500">Rejected queries can't be edited or replied to.</p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onCancel} className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason.trim())}
            disabled={busy}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {busy && <Spinner />}
            {busy ? "Rejecting…" : "Reject query"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
//  Reopen modal — reason optional (kuduththaa raise pannavangaluku theriyum)
// ════════════════════════════════════════════════════════════════
const ReopenModal = ({ query, onCancel, onConfirm, busy }) => {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="reopen-title">
      <div className="w-full max-w-md rounded-2xl bg-white p-6">
        <h2 id="reopen-title" className="text-lg font-bold">Reopen this ticket?</h2>
        <p className="mt-1 text-sm text-gray-600">
          <span className="font-semibold text-blue-800">{query.ticketNo}</span> · {query.subject}
        </p>
        <p className="mt-1 text-xs text-gray-500">It goes back to Open and continues Pickup → Processing → Close.</p>
        <label htmlFor="reopen-reason" className="mb-1.5 mt-4 block text-sm font-semibold text-gray-600">
          Reason (optional)
        </label>
        <textarea
          id="reopen-reason"
          rows={3}
          value={reason}
          maxLength={1000}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Got the missing details — working on it again"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <p className="mt-2 text-xs text-gray-500">If you add a reason, the person who raised this ticket will see it.</p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onCancel} className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason.trim())}
            disabled={busy}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {busy && <Spinner />}
            {busy ? "Reopening…" : "Reopen ticket"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
//  Forward (delegate) modal — vera aal / team ku, reason kandippaa
// ════════════════════════════════════════════════════════════════
const DelegateModal = ({ query, staff, exclude = [], onCancel, onConfirm, busy }) => {
  const [mode, setMode] = useState("person");
  const [toStaff, setToStaff] = useState("");
  const [toTeam, setToTeam] = useState("");
  const [reason, setReason] = useState("");
  const skip = new Set(exclude.filter(Boolean).map(String));
  const people = (staff || []).filter((s) => !skip.has(String(s._id)));
  const teams = teamsFromStaff(people); // ticket-a forward panravangala thavira matha active members irukkura team mattum
  const ready = reason.trim() && (mode === "person" ? toStaff : toTeam);
  const submit = () => {
    if (!ready) return;
    onConfirm(mode === "person" ? { toStaff, reason: reason.trim() } : { toTeam, reason: reason.trim() });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="delegate-title">
      <div className="w-full max-w-md rounded-2xl bg-white p-6">
        <h2 id="delegate-title" className="text-lg font-bold">Forward this ticket</h2>
        <p className="mt-1 text-sm text-gray-600">
          <span className="font-semibold text-blue-800">{query.ticketNo}</span> · {query.subject}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          It stays at <b>{STATUS[query.status]?.label || query.status}</b> — the new person continues from the next step.
          For a team, whoever in the team clicks the next step first gets it.
        </p>

        <div className="mb-1.5 mt-4 flex items-center justify-between gap-2">
          <label htmlFor="dl-to" className="block text-sm font-semibold text-gray-600">Forward to</label>
          <ToModeSwitch value={mode} onChange={setMode} />
        </div>
        {mode === "person" ? (
          <select id="dl-to" value={toStaff} onChange={(e) => setToStaff(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100">
            <option value="">Choose staff</option>
            <StaffOptions staff={people} />
          </select>
        ) : (
          <select id="dl-to" value={toTeam} onChange={(e) => setToTeam(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100">
            <option value="">Choose team</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} team ({t.count} {t.count === 1 ? "member" : "members"})
              </option>
            ))}
          </select>
        )}

        <label htmlFor="dl-reason" className="mb-1.5 mt-4 block text-sm font-semibold text-gray-600">
          Reason <span className="text-red-600">*</span>
        </label>
        <textarea
          id="dl-reason"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={1000}
          placeholder="e.g. Payment verified — please send the receipt"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onCancel} className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy || !ready}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-cyan-700 px-4 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-50"
          >
            {busy && <Spinner />}
            {busy ? "Forwarding…" : "Forward ticket"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Forward history — yaar kitta irundhu yaar ku, en
const whoText = (p) => (p ? `${p.name || "—"}${p.type === "team" ? " team" : ""}` : "—");
const DelegationHistory = ({ list = [] }) =>
  list.length ? (
    <div className="mb-4">
      <p className="mb-2 text-sm font-semibold text-gray-600">Forward history</p>
      <ol className="space-y-2">
        {[...list].reverse().map((d, i) => (
          <li key={i} className="rounded-lg border border-cyan-100 bg-cyan-50/50 px-3 py-2 text-sm">
            <p className="font-medium text-gray-800">
              {whoText(d.from)} <span className="text-cyan-700">→</span> {whoText(d.to)}
            </p>
            <p className="whitespace-pre-line break-words text-gray-700">{d.reason}</p>
            <p className="mt-0.5 text-xs text-gray-500">
              by {d.by?.name || "—"}
              {d.by?.type === "touradmin" ? " (Tour admin)" : ""} · {fmtDate(d.at)} {fmtTime(d.at)}
              {d.fromStatus ? ` · was ${STATUS[d.fromStatus]?.label || d.fromStatus}` : ""}
            </p>
          </li>
        ))}
      </ol>
    </div>
  ) : null;

// ════════════════════════════════════════════════════════════════
//  Page
// ════════════════════════════════════════════════════════════════
// ─── Raise form (admin page la irukura adhe) ───
const EMPTY_FORM = { queryType: "", subject: "", description: "", raisedBy: "", raisedTo: "", tnr: "" };
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_FILES = 5;
const MAX_SIZE = 5 * 1024 * 1024;

// Phone photos (3–8 MB) ah 1600px ku resize → 300–600 KB. PDF ah touch pannadhu.
const compressImage = (file) =>
  new Promise((resolve) => {
    if (!file.type.startsWith("image/") || file.size < 300 * 1024) return resolve(file);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob || blob.size >= file.size) return resolve(file); // chinnadha aagalana original
          const name = file.name.replace(/\.(png|webp|jpe?g)$/i, "") + ".jpg";
          resolve(new File([blob], name, { type: "image/jpeg", lastModified: Date.now() }));
        },
        "image/jpeg",
        0.72,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });

const TicketLanding = () => {
  const { ticketApi: api } = useContext(TourContext);
  const me = useStaffSelf(); // staff site: "Raised by" lock

  // ─── TNR → booking eduththa staff "Raised to" la auto (maathalaam) ───
  const [tnrInfo, setTnrInfo] = useState(null);
  const [tnrLoading, setTnrLoading] = useState(false);
  // TNR la booking eduththa staff kandupidichaa → "Raised to" lock (avangaluku dhaan pogum)
  // TNR → booking eduththa staff default ah varum; vendumna vera person / team ku maathalaam
  const tnrSuggested = !!(tnrInfo?.staff?._id && tnrInfo.staff.active && !tnrInfo.selfBooked);
  // Staff site: "Raised to" — oru Person ku, illa oru Team (department) ku.
  // Team ku na andha team la ellarukkum theriyum; oruthar pick pannuna micha per list la irundhu maraiyum.
  const [toMode, setToMode] = useState("person");
  const [toTeam, setToTeam] = useState("");
  const teamMode = !!me && toMode === "team";
  const changeToMode = (m) => {
    setToMode(m);
    // TNR potta, booking eduththavanga team ah default ah select
    if (m === "team" && !toTeam && tnrInfo?.staff?.role?._id) setToTeam(String(tnrInfo.staff.role._id));
  };
  const findTnr = async () => {
    const tnr = (form.tnr || "").trim().toUpperCase();
    if (!tnr) return;
    if (!api.lookupTnr) return toast.error("TNR lookup not set up — add lookupTnr in ticketApi");
    setTnrLoading(true);
    try {
      const info = await api.lookupTnr(tnr);
      setTnrInfo(info);
      const s = info.staff;
      if (s?._id && s.active) {
        // Raise panravangale booking eduththavanga na "Raised to" maathaadhu
        const byId = me ? me._id : form.raisedBy;
        if (String(s._id) === String(byId)) {
          setTnrInfo({ ...info, selfBooked: true });
          toast("You booked this TNR yourself — choose who to raise it to.");
        } else {
          setForm((f) => ({ ...f, raisedTo: s._id }));
          toast.success(`Raised to: ${s.fullName} (booked this TNR) — you can change it`);
        }
        // Dropdown la illaadha staff ah list la serkka
        setStaff((list) => (list.some((x) => String(x._id) === String(s._id)) ? list : [...list, s]));
      }
    } catch (err) {
      setTnrInfo({ error: err.message });
    } finally {
      setTnrLoading(false);
    }
  };

  const [queries, setQueries] = useState([]);
  const [counts, setCounts] = useState({ open: 0, pickup: 0, processing: 0, close: 0, reject: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  // Staff login: page open aagumbodhu "Assigned to me" + Open — enakku enna ticket vandhirukku nu udane theriyum
  const [filters, setFilters] = useState(() => (me ? { ...EMPTY_FILTERS, mine: "assigned" } : EMPTY_FILTERS));
  const defaultViewSet = useRef(!!me);
  useEffect(() => {
    // Staff details konjam late ah vandhaalum ore oru thadava "Assigned to me" ku
    if (me && !defaultViewSet.current) {
      defaultViewSet.current = true;
      setFilters((f) => (f.mine ? f : { ...f, mine: "assigned" }));
    }
  }, [me]);
  const lastOpenCount = useRef(null); // Open la puthusa ethavadhu vandhucha nu paakka
  // View (All / Assigned / Raised) maathuna Open count compare pudhusaa — illana thaanaa Open tab ku jump aagum
  useEffect(() => {
    lastOpenCount.current = null;
  }, [filters.mine]);
  const [types, setTypes] = useState([]);

  // ─── Raise query (tour admin um raise pannalam) ───
  const [tab, setTab] = useState("list"); // list | form
  const [staff, setStaff] = useState([]);
  const [staffError, setStaffError] = useState("");
  // Ticket raise / forward ku — Active + login ON staff mattum (velaya vittu ponavanga / login off ku ticket illa).
  // Column filters la ellaa staff um (pazhaya tickets paakka).
  const activeStaff = React.useMemo(
    () => (staff || []).filter((s) => s.status !== "Inactive" && s.loginEnabled !== false),
    [staff],
  );
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(null); // upload %
  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  // Edit — tour admin raise panna ticket ah mattum
  const [editing, setEditing] = useState(null); // edit panra ticket
  const [removeIds, setRemoveIds] = useState([]); // edit la remove panna pazhaya files
  const [deletingId, setDeletingId] = useState(null);
  const keptCount = (editing?.attachments?.length || 0) - removeIds.length;
  // Type chips la × pannuna suggestion la irundhu maraiyum — DB la illa, indha browser la mattum
  const HIDDEN_TYPES_KEY = "gv-hidden-query-types";
  const [hiddenTypes, setHiddenTypes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(HIDDEN_TYPES_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const saveHidden = (list) => {
    setHiddenTypes(list);
    try {
      localStorage.setItem(HIDDEN_TYPES_KEY, JSON.stringify(list));
    } catch {
      /* private mode la storage illana paravaillai */
    }
  };
  const hideType = (name) => saveHidden([...new Set([...hiddenTypes, name.toLowerCase()])]);
  const unhideType = (name) => saveHidden(hiddenTypes.filter((n) => n !== name.toLowerCase()));
  const [expandedId, setExpandedId] = useState(null);
  const [busyId, setBusyId] = useState(null); // button click pannura query
  const [busyAction, setBusyAction] = useState(null); // endha button (spinner ku)
  const [rejecting, setRejecting] = useState(null); // reject modal query
  const [delegating, setDelegating] = useState(null); // forward modal query
  const [reopening, setReopening] = useState(null); // reopen modal query (reason)
  const syncRef = useRef(null);

  // ─── Loaders ───
  const fetchQueries = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const data = await api.getQueries({ ...filters, page, limit: 20 });
        setQueries(data.queries);
        setCounts(data.statusCounts);
        // Admin puthu ticket raise / reopen pannaa Open count koodum —
        // vera tab la irundhaalum udane Open tab ku poyidum
        const openNow = data.statusCounts?.open ?? 0;
        if (lastOpenCount.current !== null && openNow > lastOpenCount.current && filters.status !== "open") {
          setPage(1);
          setFilters((f) => ({ ...f, status: "open" }));
        }
        lastOpenCount.current = openNow;
        setTotal(data.total);
        setTotalPages(data.totalPages);
        // Type filter dropdown ku — backend ellaa types um anuppum (admin page madhiriye)
        if (Array.isArray(data.queryTypes)) {
          setTypes(data.queryTypes);
        } else {
          setTypes((prev) => {
            const names = new Set(prev.map((t) => t.name));
            data.queries.forEach((q) => q.queryType && names.add(q.queryType));
            return [...names].sort().map((name) => ({ name }));
          });
        }
      } catch (err) {
        if (!silent) toast.error(err.message);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [api, filters, page],
  );

  useEffect(() => {
    const t = setTimeout(() => fetchQueries(), filters.search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchQueries]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Auto-sync: admin raise / edit / delete / reply pannalum inga update aagum ───
  useEffect(() => {
    const check = async () => {
      try {
        const data = await api.sync();
        if (syncRef.current && syncRef.current !== data.version) fetchQueries(true);
        syncRef.current = data.version;
      } catch {
        /* next round la try pannum */
      }
    };
    check();
    const t = setInterval(check, SYNC_EVERY_MS);
    return () => clearInterval(t);
  }, [api, fetchQueries]);

  const setFilter = (key, value) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };
  // Column filter Apply / chip ✕ — pala keys ore thadava
  const applyFilters = (patch) => {
    setPage(1);
    setFilters((f) => ({ ...f, ...patch }));
  };

  // ─── Raise helpers ───
  const fetchStaff = useCallback(async () => {
    try {
      const list = await api.getStaff();
      setStaff(list);
      const usable = list.filter((s) => s.status !== "Inactive" && s.loginEnabled !== false);
      setStaffError(usable.length ? "" : "No active staff with login found. Turn on login in Staff Profiles first.");
    } catch (err) {
      setStaff([]);
      setStaffError(`Couldn't load staff: ${err.message}`);
    }
  }, [api]);

  useEffect(() => {
    if (!staff.length) fetchStaff(); // column filters ku um venum
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const openRaise = () => {
    setEditing(null);
    setRemoveIds([]);
    setForm(me ? { ...EMPTY_FORM, raisedBy: me._id } : EMPTY_FORM);
    setToMode("person");
    setToTeam("");
    setTnrInfo(null);
    setFiles([]);
    setTab("form");
  };

  // Tour admin raise panna ticket ah mattum edit / delete panna mudiyum
  // Staff site la: avanga raise panna ticket mattum
  const isMine = (q) =>
    me
      ? String(q.raisedBy?._id || q.raisedBy) === String(me._id) // Raised by = naan
      : q.raisedVia === "touradmin" && !q.raisedByStaffLogin; // Tour admin: Tour admin page la raise pannadhu mattum (staff portal ticket illa)

  // Assign aana aal (Raised to = naan). Tour admin ku "assignee" illa — supervisor.
  const isAssignee = (q) => !!me && String(q.raisedTo?._id || q.raisedTo || "") === String(me._id);
  // Status maathura vela yaar pannalaam:
  //   staff: assign aana aal; Team ku vandha (yaarum edukkaadha) ticket — team la yaar mudhalla
  //          adutha stage button click pannaangalo avangaluku (matha team members ku maraiyum)
  //   tour admin: avanga raise pannadhu thavira ellaam
  //   tour admin: status buttons illa — assign aana staff dhaan pannanum (Tour admin paakka mattum)
  const canWork = (q) => (me ? isAssignee(q) || (isTeamOpen(q) && !isMine(q)) : false);
  // Assign aana staff velaya vittu poitaanga — Inactive / login off / delete (Raised to "—")
  const assigneeGone = (q) =>
    !q.raisedToRole && (!q.raisedTo || q.raisedTo.status === "Inactive" || q.raisedTo.loginEnabled === false);
  // Forward — Close / Reject aana apram illa
  //   staff: assign aana aal; ILLA assign aana aal poitaanga na raise pannavanga
  //   tour admin: assign aana aal poitaanga / yaarukkum assign illa na mattum
  const canDelegate = (q) =>
    ACTIVE_STATUSES.includes(q.status) &&
    (me ? isAssignee(q) || (isMine(q) && assigneeGone(q)) : assigneeGone(q));
  // Reopen: Reject aana ticket mattum (Close aanadhu mudinjadhu — reopen illa)
  //   staff — reject panna assign aana aal mattum (raise pannavangaluku illa) | Tour admin — ellaam
  const canReopen = (q) => q.status === "reject" && (me ? isAssignee(q) : true);

  const openEdit = (q) => {
    setEditing(q);
    setRemoveIds([]);
    setFiles([]);
    setForm({
      queryType: q.queryType || "",
      subject: q.subject || "",
      description: q.description || "",
      raisedBy: q.raisedBy?._id || q.raisedBy || "",
      raisedTo: q.raisedTo?._id || q.raisedTo || "",
      tnr: q.tnr || "",
    });
    setToMode(q.raisedToRole ? "team" : "person");
    setToTeam(q.raisedToRole?._id || q.raisedToRole || "");
    setTnrInfo(null);
    setTab("form");
  };

  const deleteQuery = async (q) => {
    if (!window.confirm(`Delete "${q.subject}"? This can't be undone.`)) return;
    setDeletingId(q._id);
    try {
      await minDelay(api.deleteQuery(q._id));
      toast.success("Ticket deleted");
      if (expandedId === q._id) setExpandedId(null);
      fetchQueries(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Open tab ku kondu pogum (already Open la irundha list mattum refresh)
  const goToOpen = () => {
    if (filters.status === "open" && page === 1) fetchQueries(true);
    else {
      setPage(1);
      setFilters((f) => ({ ...f, status: "open" }));
    }
  };

  const pickFiles = async (e) => {
    const raw = Array.from(e.target.files || []);
    e.target.value = "";
    const bad = raw.find((f) => !ALLOWED.includes(f.type));
    if (bad) return toast.error(`${bad.name} is not allowed. Use JPG, PNG, WEBP or PDF.`);
    if (keptCount + files.length + raw.length > MAX_FILES) return toast.error(`You can attach up to ${MAX_FILES} files.`);
    // Periya phone photos ah chinnadha aakkurom — upload romba fast aagum
    const picked = await Promise.all(raw.map(compressImage));
    const big = picked.find((f) => f.size > MAX_SIZE);
    if (big) return toast.error(`${big.name} is larger than 5 MB.`);
    setFiles((prev) => [...prev, ...picked]);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (me && form.raisedBy !== me._id) form.raisedBy = me._id; // staff site: eppavume login staff
    // TNR potta Find pannirukkanum — booking eduththa staff ku dhaan pogum
    if ((form.tnr || "").trim() && !tnrInfo) return toast.error("Click Find for the TNR first.");
    if (tnrInfo?.error) return toast.error("Fix the TNR or clear it.");
    const { queryType, subject, raisedBy, raisedTo } = form;
    if (teamMode && !toTeam) return toast.error("Choose a team to raise this ticket to.");
    if (!queryType.trim() || !subject.trim() || !raisedBy || (!teamMode && !raisedTo)) {
      return toast.error("Fill in query type, subject, raised by and raised to.");
    }
    if (!teamMode && raisedBy === raisedTo) return toast.error("Raised by and raised to must be different staff.");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (teamMode && k === "raisedTo") return; // Team ku na — pick pannuravanga dhaan "Raised to"
      fd.append(k, typeof v === "string" ? v.trim() : v);
    });
    if (me) fd.append("raisedToRole", teamMode ? toTeam : ""); // "" = Person
    files.forEach((f) => fd.append("attachments", f));
    if (editing && removeIds.length) fd.append("removeAttachmentIds", JSON.stringify(removeIds));

    const typed = form.queryType.trim();
    if (hiddenTypes.includes(typed.toLowerCase())) unhideType(typed);
    setSaving(true);
    setProgress(files.length ? 0 : null);
    const onProgress = (ev) => ev.total && setProgress(Math.round((ev.loaded * 100) / ev.total));
    try {
      const wasEditing = editing;
      const res = wasEditing ? await api.updateQuery(wasEditing._id, fd, onProgress) : await api.raiseQuery(fd, onProgress);
      toast.success(res?.noChange ? "Nothing changed" : wasEditing ? "Ticket updated" : "Ticket raised");
      setEditing(null);
      setRemoveIds([]);
      setForm(EMPTY_FORM);
      setToMode("person");
      setToTeam("");
      setFiles([]);
      setTab("list");
      if (wasEditing) fetchQueries(true); // edit na adhe tab la irukkattum
      else goToOpen(); // puthu query → Open tab la theriyum
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProgress(null);
      setSaving(false);
    }
  };

  const typedLower = form.queryType.trim().toLowerCase();
  const isNewType = typedLower && !types.some((t) => t.name.toLowerCase() === typedLower);

  // "Clear all" — ellaa column filters um + status um (ellaa tickets um varum)
  const clearFilters = () => {
    setPage(1);
    setFilters((f) => ({ ...EMPTY_FILTERS, status: "", mine: f.mine })); // view (Assigned / Raised) apdiye
  };

  // ─── Column filters (header la funnel) ───
  const colFilters = React.useMemo(
    () =>
      buildColumnFilters({
        types,
        staff,
        statuses: CARDS.filter((c) => c.key).map((c) => ({ key: c.key, label: c.label })),
      }),
    [types, staff],
  );
  const filterColumns = [
    { id: "ticketNo", label: "Ticket no", fields: colFilters.ticketNo },
    { id: "ticket", label: "Ticket", fields: colFilters.ticket },
    { id: "raisedBy", label: "Raised by", fields: colFilters.raisedBy },
    { id: "raisedTo", label: "Raised to", fields: colFilters.raisedTo },
    { id: "date", label: "Raised on", fields: colFilters.date },
    { id: "status", label: "Status", fields: colFilters.status },
  ];
  const colHead = (id) => {
    const c = filterColumns.find((x) => x.id === id);
    return <ColumnFilter label={c.label} fields={c.fields} filters={filters} onApply={applyFilters} />;
  };

  // ─── Status buttons ───
  const changeStatus = async (q, action, reason) => {
    setBusyId(q._id);
    setBusyAction(action);
    try {
      // minDelay: spinner kammiyaa 900ms theriyum, takkunu maraiyadhu
      if (action === "reject") await minDelay(api.reject(q._id, reason));
      else if (action === "reopen") {
        if (!api.reopen) throw new Error("Reopen not set up — add reopen in ticketApi (TourContext)");
        await minDelay(api.reopen(q._id, reason));
        setReopening(null);
      } else await minDelay(api[action](q._id)); // pickup / processing / close
      toast.success(DONE_TEXT[action]);
      setRejecting(null);
      fetchQueries(true);
    } catch (err) {
      toast.error(err.message);
      fetchQueries(true); // vera yaaravadhu maathirundha latest kaatum
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  };

  const onAction = (q, action) => {
    if (action === "reject") return setRejecting(q);
    if (action === "reopen") return setReopening(q); // reason kekkum
    return changeStatus(q, action);
  };

  // Forward (delegate) — reason oda vera aal / team ku
  const delegateTicket = async (q, payload) => {
    if (!api.delegate) return toast.error("Forward not set up — add delegate in ticketApi (TourContext)");
    setBusyId(q._id);
    setBusyAction("delegate");
    try {
      const res = await minDelay(api.delegate(q._id, payload));
      toast.success(res?.message || "Ticket forwarded");
      setDelegating(null);
      fetchQueries(true);
    } catch (err) {
      toast.error(err.message);
      fetchQueries(true);
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  };


  // ─── Row pieces (table + mobile cards rendu kum same) ───
  const toggleOpen = (q) => setExpandedId((id) => (id === q._id ? null : q._id));

  const renderTitle = (q, open, wrap = false) => (
    <button
      onClick={() => toggleOpen(q)}
      aria-expanded={open}
      className={`block max-w-full text-left font-semibold text-gray-900 hover:text-blue-700 ${wrap ? "break-words" : "truncate"}`}
    >
      {q.subject}
    </button>
  );

  const renderMeta = (q) => {
    const fromThem = q.lastReplyFrom && q.lastReplyFrom !== ME;
    const ico = "h-3.5 w-3.5";
    return (
      <>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span className="rounded bg-gray-100 px-1.5 py-0.5 font-semibold text-gray-700">{q.queryType}</span>
          {q.tnr && <span className="rounded bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-800">TNR {q.tnr}</span>}
          {q.attachments?.length > 0 && (
            <span className="inline-flex items-center gap-1" title={`${q.attachments.length} files`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={ico} aria-hidden="true">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              {q.attachments.length}
            </span>
          )}
          {q.replyCount > 0 && (
            <span className={`inline-flex items-center gap-1 ${fromThem ? "font-semibold text-green-700" : ""}`} title={`${q.replyCount} replies`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={ico} aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {q.replyCount}
              {fromThem && <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-label="New reply" />}
            </span>
          )}
          {q.editCount > 0 && (
            <span className="inline-flex items-center gap-1" title={`Edited ${q.editCount} time${q.editCount > 1 ? "s" : ""}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={ico} aria-hidden="true">
                <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
              </svg>
              {q.editCount}
            </span>
          )}
          {q.reopenCount > 0 && (
            <span className="inline-flex items-center gap-1 text-amber-700" title={`Reopened ${q.reopenCount} time${q.reopenCount > 1 ? "s" : ""}${q.reopenReason ? ` — ${q.reopenReason}` : ""}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={ico} aria-hidden="true">
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />
              </svg>
              {q.reopenCount > 1 ? q.reopenCount : ""}
            </span>
          )}
        </div>
        {q.tnrInfo && (
          // Ore line, neelamaa irundha "…" — mouse vechaa full ah theriyum
          <span
            className="block mt-1 min-w-0 max-w-full truncate text-[12px] leading-5 text-gray-500"
            title={[q.tnrInfo.tourTitle, q.tnrInfo.travellerName].filter(Boolean).join(" · ")}
          >
            {[q.tnrInfo.tourTitle, q.tnrInfo.travellerName].filter(Boolean).join(" · ")}
          </span>
        )}
      </>
    );
  };

  // Team ku vandhu yaarum innum edukkala — stage paththi sollum
  const toSubText = (q) => {
    if (q.raisedTo && ACTIVE_STATUSES.includes(q.status) && assigneeGone(q)) return "Inactive / login off — forward this ticket";
    return isTeamOpen(q) && q.status !== "open" ? `Waiting for a team member · ${STATUS[q.status]?.label || q.status}` : toSub(q, staffRole);
  };

  // Endha page la irundhu raise aachu — Raised by column la, person keela
  const renderVia = (q) => <SourceBadge q={q} />; // Admin / Tour admin / Staff portal

  const renderDetail = (q) => (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
      <div className="min-w-0 xl:col-span-2">
        {q.tnr && (
          <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2.5 text-sm">
            <p className="font-semibold text-amber-900">Booking · TNR {q.tnr}</p>
            {q.tnrInfo?.tourTitle && <p className="text-gray-700">{q.tnrInfo.tourTitle}</p>}
            {q.tnrInfo?.travellerName && <p className="text-gray-600">Traveller: {q.tnrInfo.travellerName}</p>}
          </div>
        )}
        <DelegationHistory list={q.delegations} />
        <p className="mb-1 text-sm font-semibold text-gray-600">Description</p>
        <p className="mb-4 whitespace-pre-line break-words text-sm text-gray-800">{q.description || "No description"}</p>
        {q.reopenReason && q.status !== "reject" && (
          <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
            <span className="font-semibold">Reopened{q.reopens?.length ? ` by ${q.reopens[q.reopens.length - 1]?.by?.name || "—"}` : ""}: </span>
            {q.reopenReason}
            {q.reopenedAt ? <span className="block text-xs text-blue-700">{fmtDate(q.reopenedAt)} {fmtTime(q.reopenedAt)}</span> : null}
          </div>
        )}
        {q.status === "reject" && q.rejectReason && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            <span className="font-semibold">Reject reason: </span>
            {q.rejectReason}
          </div>
        )}
        <p className="mb-2 text-sm font-semibold text-gray-600">Attachments</p>
        {q.attachments?.length ? (
          <AttachmentSets files={q.attachments} renderFile={(a) => <FileChip key={a._id} file={a} />} />
        ) : (
          <p className="text-sm text-gray-500">No files attached</p>
        )}
      </div>
      <div className="min-w-0 xl:col-span-3">
        <p className="mb-2 text-sm font-semibold text-gray-600">Replies</p>
        <ReplyThread queryId={q._id} api={api} onChanged={() => fetchQueries(true)} />
      </div>
    </div>
  );

  // Row / card la enga touch pannalum View / Hide — buttons, links, chat thavira
  const onRowClick = (e, q) => {
    if (e.target.closest("button, a, input, textarea, select, label, [data-no-toggle]")) return;
    toggleOpen(q);
  };

  const renderActions = (q, open) => {
    const busy = busyId === q._id;
    return (
      <div className="flex w-full items-center gap-1.5 xl:w-auto">
        {/* Icons — table la oru row ku 3 (periya screen la 6), mela irundha 2nd row — cut aagadhu */}
        <div className="flex flex-1 flex-wrap items-stretch gap-1.5 xl:grid xl:flex-none xl:grid-cols-3 xl:gap-1 2xl:grid-cols-6">
          {/* Stage wise — assign aana aal ku adutha stage button mattum.
              Raise pannavanga ku status mattum (buttons illa). */}
          {canWork(q) && ACTIONS.filter((a) => a.from.includes(q.status)).map((a) => (
            <IconAction
              key={a.key}
              kind={a.key}
              label={a.label}
              short={a.key === "processing" ? "Process" : undefined}
              busyText={BUSY_TEXT[a.key]}
              busy={busy && busyAction === a.key}
              disabled={busy && busyAction !== a.key}
              onClick={() => onAction(q, a.key)}
            />
          ))}
          {/* Forward — Open / Picked up / Processing la; Close / Reject aanadhum illa */}
          {canDelegate(q) && (
            <IconAction
              kind="delegate"
              label="Forward"
              busyText="Forwarding…"
              busy={busy && busyAction === "delegate"}
              disabled={busy && busyAction !== "delegate"}
              onClick={() => setDelegating(q)}
            />
          )}
          {/* Close / Reject aana apram — raise pannavanga (illa Tour admin) Reopen */}
          {canReopen(q) && (
            <IconAction
              kind="reopen"
              label="Reopen"
              busyText={BUSY_TEXT.reopen}
              busy={busy && busyAction === "reopen"}
              disabled={busy && busyAction !== "reopen"}
              onClick={() => onAction(q, "reopen")}
            />
          )}
          {/* Raise pannavanga — Open la irukkum varai Edit / Delete */}
          {isMine(q) && ["open", "pickup"].includes(q.status) && (<>
            <IconAction kind="edit" label="Edit" disabled={busy} onClick={() => openEdit(q)} />
            <IconAction
              kind="delete"
              label="Delete"
              busyText="Deleting…"
              busy={deletingId === q._id}
              disabled={busy}
              onClick={() => deleteQuery(q)}
            />
          </>
          )}
        </div>
        {/* Touch pannuna open / close nu kaatura arrow */}
        <span className="ml-auto flex h-9 w-7 flex-shrink-0 items-center justify-center self-center text-gray-400 xl:ml-1" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 transition ${open ? "rotate-180 text-green-600" : ""}`}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </div>
    );
  };

  const cardCount = (key) => (key ? counts[key] || 0 : Object.values(counts).reduce((a, b) => a + b, 0));
  const inputCls =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100";
  const labelCls = "mb-1.5 block text-sm font-semibold text-gray-600";

  // ════════════════════════════════════════════════════════════════
  return (
    <div className="w-full min-w-0 max-w-7xl flex-1 p-3 pt-16 sm:p-5 sm:pt-16 lg:pt-5">
      <div className="mb-5 text-center sm:mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Raise / View Tickets</h1>
        <p className="mt-1 text-sm text-gray-500">
          {me
            ? "Raise a ticket, see what's assigned to you, and move each one to its next step."
            : "Every ticket in one place. Raise a ticket and follow it until it's closed."}
        </p>
        <span className="mx-auto mt-3 block h-1 w-14 rounded-full bg-green-500" aria-hidden="true" />
      </div>


      {/* Tabs — ore bar: ticket views + Raise (pala "All tickets" illa) */}
      <div className="mb-6 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center">
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-gray-100 p-1 sm:inline-flex sm:grid-cols-none" role="tablist" aria-label="Ticket views">
          {/* Tour admin ku "All tickets" mattum — Assigned / Raised / Forwarded staff login la mattum */}
          {MINE_VIEWS.filter((v) => me || v.key === "").map((v) => {
            const active = tab === "list" && filters.mine === v.key;
            return (
              <button
                key={v.key || "all"}
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setEditing(null);
                  setTab("list");
                  if (filters.mine !== v.key) setFilter("mine", v.key);
                }}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${active ? "bg-white text-green-700 shadow" : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                {v.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => (editing && tab === "form" ? null : openRaise())}
          aria-pressed={tab === "form"}
          className={`inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition ${tab === "form" ? "bg-green-700 text-white ring-2 ring-green-300" : "bg-green-600 text-white hover:bg-green-700"
            }`}
        >
          {editing && tab === "form" ? "Editing ticket" : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Raise Ticket
            </>
          )}
        </button>
      </div>

      {/* ═══════════ FORM (raise / edit) ═══════════ */}
      {tab === "form" && (
        <form onSubmit={submitForm} className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
          <h2 className="mb-5 text-xl font-bold">{editing ? `Edit Ticket` : "Raise a Ticket"}</h2>

          <div className="mb-4">
            <label htmlFor="bb-type" className={labelCls}>Ticket type</label>
            <input
              id="bb-type"
              value={form.queryType}
              onChange={(e) => setForm({ ...form, queryType: e.target.value })}
              placeholder="Pick below or type a new one"
              className={inputCls}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {types
                .filter((t) => !hiddenTypes.includes(t.name.toLowerCase()))
                .map((t) => {
                  const active = t.name.toLowerCase() === typedLower;
                  return (
                    <span
                      key={t.name}
                      className={`inline-flex items-center overflow-hidden rounded-full border text-sm ${active ? "border-green-600 bg-green-600 font-semibold text-white" : "border-gray-200 bg-gray-50 text-gray-700"
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, queryType: t.name })}
                        aria-pressed={active}
                        className={`py-1.5 pl-3 pr-1.5 ${active ? "" : "hover:bg-gray-100"}`}
                      >
                        {t.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          hideType(t.name);
                          if (active) setForm({ ...form, queryType: "" });
                        }}
                        aria-label={`Remove ${t.name} from suggestions`}
                        title="Remove from suggestions"
                        className={`flex h-full items-center py-1.5 pl-1 pr-2.5 ${active ? "text-green-100 hover:text-white" : "text-gray-400 hover:text-red-600"}`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3.5 w-3.5" aria-hidden="true">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  );
                })}
              {hiddenTypes.length > 0 && (
                <button type="button" onClick={() => saveHidden([])} className="px-1 text-xs font-semibold text-blue-700 hover:underline">
                  Show removed ({hiddenTypes.length})
                </button>
              )}
            </div>
            {isNewType && <p className="mt-2 text-sm text-green-700">"{form.queryType.trim()}" is a new type. It will be saved with this query.</p>}
          </div>

          {/* ── Booking TNR (optional) — booking eduththa staff "Raised to" la auto ── */}
          <div className="mb-4">
            <label htmlFor="bb-tnr" className={labelCls}>Booking TNR (optional)</label>
            <div className="flex gap-2">
              <input
                id="bb-tnr"
                value={form.tnr || ""}
                onChange={(e) => {
                  setForm({ ...form, tnr: e.target.value.toUpperCase().replace(/\s/g, "") });
                  setTnrInfo(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    findTnr();
                  }
                }}
                placeholder="e.g. KD74PX"
                maxLength={12}
                className={inputCls + " uppercase"}
              />
              <button
                type="button"
                onClick={findTnr}
                disabled={tnrLoading || !(form.tnr || "").trim()}
                className="shrink-0 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                {tnrLoading ? "Finding…" : "Find"}
              </button>
            </div>
            <TnrInfo info={tnrInfo} />
          </div>

          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="bb-by" className={labelCls}>Raised by</label>
              <select
                id="bb-by"
                value={me ? me._id : form.raisedBy}
                onChange={(e) => setForm({ ...form, raisedBy: e.target.value })}
                disabled={!!me}
                className={inputCls + (me ? " cursor-not-allowed bg-gray-100" : "")}
              >
                <option value="">Choose staff</option>
                {/* Staff site: login aana staff list la illaadhaalum kaattanum */}
                {me && !activeStaff.some((s) => String(s._id) === String(me._id)) && (
                  <option value={me._id}>{me.fullName}</option>
                )}
                <StaffOptions staff={activeStaff} />
              </select>
              {me && <p className="mt-1 text-xs text-gray-500">🔒 Auto-filled with your login</p>}
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label htmlFor="bb-to" className="block text-sm font-semibold text-gray-600">Raised to</label>
                {me && <ToModeSwitch value={toMode} onChange={changeToMode} />}
              </div>
              {teamMode ? (
                <>
                  <select id="bb-to" value={toTeam} onChange={(e) => setToTeam(e.target.value)} className={inputCls}>
                    <option value="">Choose team</option>
                    {teamsFromStaff(activeStaff.filter((s) => String(s._id) !== String(me ? me._id : form.raisedBy))).map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} team ({t.count} {t.count === 1 ? "member" : "members"})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">👥 Everyone in this team sees it. Whoever picks it up gets it.</p>
                </>
              ) : (
                <>
                  <select
                    id="bb-to"
                    value={form.raisedTo}
                    onChange={(e) => setForm({ ...form, raisedTo: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">Choose staff</option>
                    <StaffOptions staff={activeStaff} exclude={me ? me._id : form.raisedBy} />
                  </select>
                  {tnrSuggested && String(form.raisedTo) === String(tnrInfo.staff._id) && (
                    <p className="mt-1 text-xs text-gray-500">Booked this TNR — you can change it</p>
                  )}
                </>
              )}
            </div>
          </div>
          {staffError && (
            <div className="-mt-2 mb-4 flex flex-wrap items-center gap-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800" role="alert">
              <span>{staffError}</span>
              <button type="button" onClick={fetchStaff} className="font-semibold underline underline-offset-2">
                Try again
              </button>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="bb-subject" className={labelCls}>Subject *</label>
            <input
              id="bb-subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g. Advance not reflecting for TNR KP48RT"
              className={inputCls}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="bb-desc" className={labelCls}>Description</label>
            <textarea
              id="bb-desc"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What happened, and what needs to be done"
              className={inputCls}
            />
          </div>

          <div className="mb-6">
            <p className={labelCls}>Attachments</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-left hover:border-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </span>
                <span>
                  <span className="block text-sm font-semibold text-blue-700">Add image</span>
                  <span className="block text-xs text-gray-500">JPG, PNG or WEBP</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                className="flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-left hover:border-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-700" aria-hidden="true">
                  PDF
                </span>
                <span>
                  <span className="block text-sm font-semibold text-red-700">Add PDF</span>
                  <span className="block text-xs text-gray-500">Bills, letters, statements</span>
                </span>
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Images and PDFs together, up to {MAX_FILES} files, 5 MB each. {keptCount + files.length}/{MAX_FILES} added.
            </p>
            <input ref={imageInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={pickFiles} className="hidden" />
            <input ref={pdfInputRef} type="file" multiple accept="application/pdf,.pdf" onChange={pickFiles} className="hidden" />

            {editing?.attachments?.length > 0 && (
              <div className="mt-3">
                <AttachmentSets
                  files={editing.attachments}
                  renderFile={(a) => {
                    const removed = removeIds.includes(a._id);
                    return (
                      <FileChip
                        key={a._id}
                        file={a}
                        removed={removed}
                        onRemove={() => setRemoveIds((ids) => (removed ? ids.filter((id) => id !== a._id) : [...ids, a._id]))}
                      />
                    );
                  }}
                />
              </div>
            )}
            {files.length > 0 && (
              <div className="mt-3">
                <p className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span className="rounded-md bg-green-600 px-1.5 py-0.5 font-semibold text-white">
                    Attachment {editing ? Math.max(0, ...(editing.attachments || []).map((a) => a.set || 1)) + 1 : 1}
                  </span>
                  New, uploads when you save
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {files.map((f, i) => (
                    <FileChip key={`${f.name}-${i}`} file={f} onRemove={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {saving && <Spinner />}
              {saving
                ? progress !== null && progress < 100
                  ? `Uploading ${progress}%`
                  : editing
                    ? "Saving…"
                    : "Raising…"
                : editing
                  ? "Save changes"
                  : "Raise query"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setTab("list");
              }}
              className="h-11 rounded-xl border border-gray-300 px-6 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {tab === "list" && (
        <>
          {filters.mine === "raised" && (
            <p className="-mt-2 mb-4 text-center text-xs text-gray-500">
              Tickets you raised — you see the status here. Reply or edit while it's open. If it's reopened, you'll see the reason inside the ticket.
            </p>
          )}

          {/* Cards */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {CARDS.map((c) => {
              const active = filters.status === c.key;
              return (
                <button
                  key={c.label}
                  onClick={() => setFilter("status", c.key)}
                  aria-pressed={active}
                  className={`group relative overflow-hidden rounded-2xl border p-3 text-left transition sm:p-4 ${active ? `${c.tint} border-transparent ring-2 ${c.ring} shadow-sm` : "border-gray-200 bg-white hover:-translate-y-0.5 hover:shadow-md"
                    }`}
                >
                  <span className={`absolute inset-y-0 left-0 w-1 ${c.bar}`} aria-hidden="true" />
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-2xl font-bold tabular-nums sm:text-3xl ${c.num}`}>{cardCount(c.key)}</p>
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-white ${c.bar}`} aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d={c.icon} />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-600">{c.label}</p>
                </button>
              );
            })}
          </div>

          {/* Column filters — table header la funnel; inga active filters + Clear all */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              {/* Mobile / tablet la table header illa — filter buttons inga */}
              <div className="mb-2 flex flex-wrap gap-2 xl:hidden">
                {filterColumns.map((c) => (
                  <ColumnFilter key={c.id} variant="chip" label={c.label} fields={c.fields} filters={filters} onApply={applyFilters} />
                ))}
              </div>
              <ActiveFilterChips columns={filterColumns} filters={filters} onApply={applyFilters} onClearAll={clearFilters} />
            </div>
            <button
              onClick={() => fetchQueries()}
              className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          {/* Table (big screens) + cards (mobile / tablet) */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {loading && <p className="px-4 py-10 text-center text-sm text-gray-500 xl:hidden">Loading queries…</p>}
            {!loading && queries.length === 0 && (
              <div className="px-4 py-12 text-center xl:hidden">
                <p className="font-semibold text-gray-800">No tickets here</p>
                <p className="mt-1 text-sm text-gray-500">New tickets from admin will show up here automatically.</p>
              </div>
            )}

            {(
              <>
                {/* ── Big screens: table ── */}
                <div className="hidden overflow-x-auto xl:block">
                  <table className="w-full min-w-[960px] text-left">
                    <thead className="bg-blue-50 text-sm text-gray-600">
                      <tr>
                        <th className="whitespace-nowrap px-4 py-3 font-semibold">{colHead("ticketNo")}</th>
                        <th className="whitespace-nowrap px-4 py-3 font-semibold">{colHead("ticket")}</th>
                        <th className="whitespace-nowrap px-4 py-3 font-semibold">{colHead("raisedBy")}</th>
                        <th className="whitespace-nowrap px-4 py-3 font-semibold">{colHead("raisedTo")}</th>
                        <th className="whitespace-nowrap px-4 py-3 font-semibold">{colHead("date")}</th>
                        <th className="whitespace-nowrap px-4 py-3 font-semibold">{colHead("status")}</th>
                        <th className="whitespace-nowrap px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(loading || queries.length === 0) && (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                            {loading ? (
                              "Loading tickets…"
                            ) : (
                              <>
                                <p className="font-semibold text-gray-800">No tickets match these filters</p>
                                <button type="button" onClick={clearFilters} className="mt-2 font-semibold text-blue-600 hover:underline">
                                  Clear all filters
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      )}
                      {!loading &&
                        queries.map((q, i) => {
                          const open = expandedId === q._id;
                          return (
                            <React.Fragment key={q._id}>
                              <tr onClick={(e) => onRowClick(e, q)} className={`cursor-pointer border-t border-gray-100 transition ${open ? "bg-blue-50/40" : "hover:bg-gray-50"}`}>
                                <td className={`whitespace-nowrap border-l-4 px-4 py-3 ${STATUS_BAR[q.status] || "border-l-transparent"}`}>
                                  <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold tracking-wide text-blue-800">{q.ticketNo || "—"}</span>
                                </td>
                                <td className="max-w-[13rem] px-4 py-3 2xl:max-w-xs">
                                  {renderTitle(q, open)}
                                  {renderMeta(q)}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <p className="font-medium">{staffName(q.raisedBy)}</p>
                                  <p className="text-xs text-gray-500">{staffRole(q.raisedBy)}</p>
                                  {renderVia(q)}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <p className="font-medium">{toName(q, staffName)}</p>
                                  <p className="text-xs text-gray-500">{toSubText(q)}</p>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm">
                                  <p>{fmtDate(q.createdAt)}</p>
                                  <p className="text-xs text-gray-500">{fmtTime(q.createdAt)}</p>
                                </td>
                                <td className="px-4 py-3">
                                  <StatusPill status={q.status} />
                                </td>
                                <td className="px-3 py-3">{renderActions(q, open)}</td>
                              </tr>
                              {open && (
                                <tr className="border-t border-gray-100 bg-blue-50/40">
                                  <td colSpan={7} className="px-4 pb-5 pt-2">
                                    {renderDetail(q)}
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* ── Mobile / tablet / small laptop: cards ── */}
                {!loading && queries.length > 0 && (
                  <ul className="divide-y divide-gray-100 xl:hidden">
                    {queries.map((q, i) => {
                      const open = expandedId === q._id;
                      return (
                        <li
                          key={q._id}
                          onClick={(e) => onRowClick(e, q)}
                          className={`cursor-pointer border-l-4 p-4 transition ${STATUS_BAR[q.status] || "border-l-transparent"} ${open ? "bg-blue-50/40" : "active:bg-gray-50"}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="mb-1 inline-block rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold tracking-wide text-blue-800">{q.ticketNo || "—"}</p>
                              {renderTitle(q, open, true)}
                              {renderMeta(q)}
                            </div>
                            <div className="flex-shrink-0">
                              <StatusPill status={q.status} />
                            </div>
                          </div>
                          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                            <div className="min-w-0">
                              <dt className="text-xs text-gray-500">Raised by</dt>
                              <dd className="truncate font-medium">{staffName(q.raisedBy)}</dd>
                              <dd className="truncate text-xs text-gray-500">{staffRole(q.raisedBy)}</dd>
                              <dd>{renderVia(q)}</dd>
                            </div>
                            <div className="min-w-0">
                              <dt className="text-xs text-gray-500">Raised to</dt>
                              <dd className="truncate font-medium">{toName(q, staffName)}</dd>
                              <dd className="truncate text-xs text-gray-500">{toSubText(q)}</dd>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <dt className="text-xs text-gray-500">Raised on</dt>
                              <dd>
                                {fmtDate(q.createdAt)} <span className="text-xs text-gray-500">{fmtTime(q.createdAt)}</span>
                              </dd>
                            </div>
                          </dl>
                          <div className="mt-3">{renderActions(q, open)}</div>
                          {open && (
                            <div data-no-toggle className="mt-4 cursor-auto border-t border-gray-200 pt-4">
                              {renderDetail(q)}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}

            <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing <b>{queries.length}</b> of <b>{total}</b> queries
              </span>
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-gray-200 px-3 py-2 font-semibold disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="whitespace-nowrap">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-gray-200 px-3 py-2 font-semibold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

        </>
      )}

      {reopening && (
        <ReopenModal
          query={reopening}
          busy={busyId === reopening._id}
          onCancel={() => setReopening(null)}
          onConfirm={(reason) => changeStatus(reopening, "reopen", reason)}
        />
      )}

      {delegating && (
        <DelegateModal
          query={delegating}
          staff={activeStaff}
          exclude={[delegating.raisedTo?._id || delegating.raisedTo, me?._id]}
          busy={busyId === delegating._id}
          onCancel={() => setDelegating(null)}
          onConfirm={(payload) => delegateTicket(delegating, payload)}
        />
      )}

      {rejecting && (
        <RejectModal
          query={rejecting}
          busy={busyId === rejecting._id}
          onCancel={() => setRejecting(null)}
          onConfirm={(reason) => changeStatus(rejecting, "reject", reason)}
        />
      )}
    </div>
  );
};

export default TicketLanding;
