// // ════════════════════════════════════════════════════════════════
// //  TicketLaunching.jsx — ADMIN side  (tourAdminController → /api/touradmin/...)
// //  Queries raise, list + filters, edit, delete, replies (add / edit / delete)
// //
// //  API calls ellam context/TourAdminContext.jsx la "ticketApi" kulla irukku
// // ════════════════════════════════════════════════════════════════
// import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
// import { toast } from "react-toastify";
// import { TourAdminContext } from "../../context/TourAdminContext"; // ⚙️ path check pannunga

// const ME = "touradmin"; // replies la "from" — indha side
// const OTHER_NAME = "Tour admin";
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
// const EMPTY_FILTERS = { search: "", queryType: "", status: "open", fromDate: "", toDate: "" };
// const EMPTY_FORM = { queryType: "", subject: "", description: "", raisedBy: "", raisedTo: "" };
// const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
// const MAX_FILES = 5;
// const MAX_SIZE = 5 * 1024 * 1024;

// const staffName = (s) => s?.name || s?.fullName || s?.staffName || "—";
// const staffRole = (s) => s?.role || s?.designation || "";
// const isLocked = (q) => q?.status === "close" || q?.status === "reject";
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
//           className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md text-xs font-bold ${
//             isPdf ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
//           }`}
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
//     className={`group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-2 ring-1 ring-inset transition disabled:cursor-not-allowed disabled:opacity-60 xl:h-9 xl:w-9 xl:flex-none xl:p-0 ${ACT_TONE[kind]}`}
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
//           const mine = r.from === ME;
//           return (
//             <div key={r._id} className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
//               <span
//                 className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
//                   mine ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
//                 }`}
//                 aria-hidden="true"
//               >
//                 {mine ? "You".slice(0, 1) : initials(r.staff ? staffName(r.staff) : OTHER_NAME)}
//               </span>
//               <div className={`max-w-[85%] break-words rounded-2xl sm:max-w-[75%] px-3.5 py-2.5 ${mine ? "rounded-br-sm bg-green-600 text-white" : "rounded-bl-sm border border-gray-200 bg-white"}`}>
//                 <p className={`mb-0.5 text-xs font-semibold ${mine ? "text-green-100" : "text-gray-500"}`}>
//                   {mine ? "You" : "Tour admin"}
//                   {r.staff ? ` · ${staffName(r.staff)}` : ""}
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
//         <p className="text-sm text-gray-500">This query is {data.status === "close" ? "closed" : "rejected"}, so replies are turned off.</p>
//       )}
//     </div>
//   );
// };

// // ════════════════════════════════════════════════════════════════
// //  Edit history (before / after)
// // ════════════════════════════════════════════════════════════════
// // History la enna madhiri edit
// const HISTORY_KIND = {
//   query: { label: "Query edited", cls: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
//   "reply-edit": { label: "Reply edited", cls: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
//   "reply-delete": { label: "Reply deleted", cls: "bg-red-100 text-red-800", dot: "bg-red-500" },
// };

// const EditHistory = ({ api }) => {
//   const [data, setData] = useState(null);
//   const [page, setPage] = useState(1);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [closedIds, setClosedIds] = useState([]); // collapse panna tickets

//   const load = useCallback(async () => {
//     setLoading(true);
//     try {
//       setData(await api.getEditHistory({ page, limit: 10, search }));
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [api, page, search]);

//   useEffect(() => {
//     const t = setTimeout(load, search ? 400 : 0);
//     return () => clearTimeout(t);
//   }, [load]); // eslint-disable-line react-hooks/exhaustive-deps

//   const toggle = (id) => setClosedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

//   return (
//     <div>
//       <div className="mb-5 flex gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
//         <input
//           type="search"
//           value={search}
//           onChange={(e) => {
//             setPage(1);
//             setSearch(e.target.value);
//           }}
//           placeholder="Search by ticket no (GVTKT001) or subject"
//           aria-label="Search edit history"
//           className="w-full flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
//         />
//         <button
//           onClick={load}
//           className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
//         >
//           {loading && <Spinner />}
//           Refresh
//         </button>
//       </div>

//       {!data ? (
//         <p className="py-10 text-center text-sm text-gray-500">Loading edit history…</p>
//       ) : data.items.length === 0 ? (
//         <div className="rounded-2xl border border-gray-200 bg-white px-4 py-12 text-center">
//           <p className="font-semibold text-gray-800">No edits yet</p>
//           <p className="mt-1 text-sm text-gray-500">Query edits, reply edits and deleted replies from both sides show up here.</p>
//         </div>
//       ) : (
//         <div className="grid gap-4">
//           {data.items.map((t) => {
//             const open = !closedIds.includes(String(t.queryId));
//             return (
//               <div key={t.queryId} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
//                 {/* ── Ticket header ── */}
//                 <button
//                   onClick={() => toggle(String(t.queryId))}
//                   aria-expanded={open}
//                   className="flex w-full flex-col gap-2 bg-blue-50 px-4 py-3 text-left hover:bg-blue-100/60 sm:flex-row sm:items-center sm:justify-between"
//                 >
//                   <div className="min-w-0">
//                     <div className="flex flex-wrap items-center gap-2">
//                       <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold tracking-wide text-blue-800">{t.ticketNo || "—"}</span>
//                       <StatusPill status={t.status} />
//                       <span className="rounded bg-white px-1.5 py-0.5 text-xs font-semibold text-gray-700">
//                         {t.editCount} {t.editCount === 1 ? "edit" : "edits"}
//                       </span>
//                     </div>
//                     <p className="mt-1 break-words font-semibold text-gray-900">{t.subject}</p>
//                   </div>
//                   <div className="flex flex-shrink-0 items-center gap-3 text-sm text-gray-600">
//                     <span>
//                       Last edit {fmtDate(t.lastEditedAt)} <span className="text-xs text-gray-500">{fmtTime(t.lastEditedAt)}</span>
//                     </span>
//                     <span className="text-xs font-semibold text-blue-700">{open ? "Hide" : "Show"}</span>
//                   </div>
//                 </button>

//                 {/* ── Ellaa edits um timeline ah, puthusu mudhal la ── */}
//                 {open && (
//                   <ol className="px-4 py-4 sm:px-5">
//                     {t.edits.map((e, idx) => {
//                       const kind = HISTORY_KIND[e.kind] || HISTORY_KIND.query;
//                       const last = idx === t.edits.length - 1;
//                       return (
//                         <li key={e.id || idx} className="relative flex gap-3 sm:gap-4">
//                           {/* timeline line + dot */}
//                           <div className="flex flex-col items-center" aria-hidden="true">
//                             <span className={`mt-1.5 h-3 w-3 flex-shrink-0 rounded-full ring-4 ring-white ${kind.dot}`} />
//                             {!last && <span className="w-px flex-1 bg-gray-200" />}
//                           </div>

//                           <div className={`min-w-0 flex-1 ${last ? "" : "pb-6"}`}>
//                             <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
//                               <span className="text-sm font-semibold text-gray-900">Edit {e.editNo}</span>
//                               <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${kind.cls}`}>{kind.label}</span>
//                               <span className="text-xs text-gray-600">
//                                 by <b>{e.by === "admin" ? "Tour admin" : "Admin"}</b>
//                               </span>
//                               <span className="text-xs text-gray-500">
//                                 {fmtDate(e.editedAt)} {fmtTime(e.editedAt)}
//                               </span>
//                             </div>

//                             <div className="mt-2 grid gap-2">
//                               {e.changes.map((c) => (
//                                 <div
//                                   key={c.field}
//                                   className="grid grid-cols-1 gap-2 rounded-xl border border-gray-100 p-3 sm:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)] sm:gap-3"
//                                 >
//                                   <p className="text-sm font-semibold text-gray-700">{c.label}</p>
//                                   <div className="min-w-0 rounded-lg bg-red-50 p-2.5">
//                                     <p className="mb-0.5 text-xs font-semibold text-red-700">Before</p>
//                                     <p className="whitespace-pre-line break-words text-sm text-gray-800">{c.before || "Empty"}</p>
//                                   </div>
//                                   <div className="min-w-0 rounded-lg bg-green-50 p-2.5">
//                                     <p className="mb-0.5 text-xs font-semibold text-green-700">After</p>
//                                     <p className="whitespace-pre-line break-words text-sm text-gray-800">
//                                       {c.after || (e.kind === "reply-delete" ? "Deleted" : "Empty")}
//                                     </p>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         </li>
//                       );
//                     })}
//                   </ol>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {data && data.items.length > 0 && (
//         <div className="mt-4 flex flex-col gap-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
//           <span>
//             Showing <b>{data.items.length}</b> of <b>{data.total}</b> tickets
//           </span>
//           <div className="flex items-center justify-between gap-2 sm:justify-end">
//             <button
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               disabled={page <= 1}
//               className="rounded-lg border border-gray-200 bg-white px-3 py-2 font-semibold disabled:opacity-40"
//             >
//               Previous
//             </button>
//             <span className="whitespace-nowrap">
//               Page {page} of {data.totalPages}
//             </span>
//             <button
//               onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
//               disabled={page >= data.totalPages}
//               className="rounded-lg border border-gray-200 bg-white px-3 py-2 font-semibold disabled:opacity-40"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ════════════════════════════════════════════════════════════════
// //  Page
// // ════════════════════════════════════════════════════════════════
// const TicketLaunching = () => {
//   const { ticketApi: api } = useContext(TourAdminContext);

//   const [tab, setTab] = useState("list"); // list | form | history
//   const [deletingId, setDeletingId] = useState(null);
//   const [reopeningId, setReopeningId] = useState(null);
//   const [queries, setQueries] = useState([]);
//   const [counts, setCounts] = useState({ open: 0, pickup: 0, processing: 0, close: 0, reject: 0 });
//   const [total, setTotal] = useState(0);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [filters, setFilters] = useState(EMPTY_FILTERS);
//   const [types, setTypes] = useState([]);
//   const [staff, setStaff] = useState([]);
//   const [staffError, setStaffError] = useState("");
//   const [expandedId, setExpandedId] = useState(null);

//   // Form (raise + edit)
//   const [editing, setEditing] = useState(null); // query being edited, or null
//   const [form, setForm] = useState(EMPTY_FORM);
//   const [files, setFiles] = useState([]);
//   const [removeIds, setRemoveIds] = useState([]);
//   const [saving, setSaving] = useState(false);

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
//   const [progress, setProgress] = useState(null); // upload %
//   const imageInputRef = useRef(null);
//   const pdfInputRef = useRef(null);
//   const syncRef = useRef(null);

//   // ─── Loaders ───
//   const fetchQueries = useCallback(
//     async (silent = false) => {
//       if (!silent) setLoading(true);
//       try {
//         const data = await api.getQueries({ ...filters, page, limit: 20 });
//         setQueries(data.queries);
//         setCounts(data.statusCounts);
//         setTotal(data.total);
//         setTotalPages(data.totalPages);
//       } catch (err) {
//         if (!silent) toast.error(err.message);
//       } finally {
//         if (!silent) setLoading(false);
//       }
//     },
//     [api, filters, page],
//   );

//   const fetchTypes = useCallback(async () => {
//     try {
//       setTypes(await api.getTypes());
//     } catch {
//       /* dropdown empty ah irukum */
//     }
//   }, [api]);

//   const fetchStaff = useCallback(async () => {
//     try {
//       const list = await api.getStaff();
//       setStaff(list);
//       setStaffError(list.length ? "" : "No active staff found. Add staff in Staff Profiles first.");
//     } catch (err) {
//       setStaff([]);
//       // Actual reason kaatum — 404 na route illa, 401 na token issue
//       setStaffError(`Couldn't load staff: ${err.message}`);
//     }
//   }, [api]);

//   // Search type panna 400ms wait panni fetch
//   useEffect(() => {
//     const t = setTimeout(() => fetchQueries(), filters.search ? 400 : 0);
//     return () => clearTimeout(t);
//   }, [fetchQueries]); // eslint-disable-line react-hooks/exhaustive-deps

//   useEffect(() => {
//     fetchTypes();
//     fetchStaff();
//   }, [fetchTypes, fetchStaff]);

//   // ─── Auto-sync: tour admin enna pannalum inga update aagum ───
//   useEffect(() => {
//     const check = async () => {
//       try {
//         const data = await api.sync();
//         if (syncRef.current && syncRef.current !== data.version) {
//           fetchQueries(true);
//           fetchTypes();
//         }
//         syncRef.current = data.version;
//       } catch {
//         /* next round la try pannum */
//       }
//     };
//     check();
//     const t = setInterval(check, SYNC_EVERY_MS);
//     return () => clearInterval(t);
//   }, [api, fetchQueries, fetchTypes]);

//   // ─── Filters ───
//   const setFilter = (key, value) => {
//     setPage(1);
//     setFilters((f) => ({ ...f, [key]: value }));
//   };
//   const clearFilters = () => {
//     setPage(1);
//     setFilters(EMPTY_FILTERS);
//   };

//   // ─── Form helpers ───
//   const openRaise = () => {
//     setEditing(null);
//     setForm(EMPTY_FORM);
//     setFiles([]);
//     setRemoveIds([]);
//     setTab("form");
//   };

//   const openEdit = (q) => {
//     setEditing(q);
//     setForm({
//       queryType: q.queryType || "",
//       subject: q.subject || "",
//       description: q.description || "",
//       raisedBy: q.raisedBy?._id || q.raisedBy || "",
//       raisedTo: q.raisedTo?._id || q.raisedTo || "",
//     });
//     setFiles([]);
//     setRemoveIds([]);
//     setTab("form");
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const keptCount = (editing?.attachments?.length || 0) - removeIds.length;

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
//     const { queryType, subject, raisedBy, raisedTo } = form;
//     if (!queryType.trim() || !subject.trim() || !raisedBy || !raisedTo) {
//       return toast.error("Fill in query type, subject, raised by and raised to.");
//     }
//     if (raisedBy === raisedTo) return toast.error("Raised by and raised to must be different staff.");

//     const fd = new FormData();
//     Object.entries(form).forEach(([k, v]) => fd.append(k, typeof v === "string" ? v.trim() : v));
//     files.forEach((f) => fd.append("attachments", f));
//     if (editing && removeIds.length) fd.append("removeAttachmentIds", JSON.stringify(removeIds));

//     const typed = form.queryType.trim();
//     if (hiddenTypes.includes(typed.toLowerCase())) unhideType(typed);
//     setSaving(true);
//     setProgress(files.length ? 0 : null);
//     const onProgress = (ev) => ev.total && setProgress(Math.round((ev.loaded * 100) / ev.total));
//     try {
//       const res = await (editing ? api.updateQuery(editing._id, fd, onProgress) : api.raiseQuery(fd, onProgress));
//       toast.success(res?.noChange ? "Nothing changed" : editing ? "Query updated" : "Query raised");
//       setEditing(null);
//       setForm(EMPTY_FORM);
//       setFiles([]);
//       setRemoveIds([]);
//       setTab("list");
//       if (editing) fetchQueries(true); // edit na adhe tab la irukkattum
//       else goToOpen(); // puthu query → Open tab la theriyum
//       fetchTypes();
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setProgress(null);
//       setSaving(false);
//     }
//   };

//   const deleteQuery = async (q) => {
//     if (!window.confirm(`Delete "${q.subject}"? Its replies and files will be removed too.`)) return;
//     setDeletingId(q._id);
//     try {
//       await minDelay(api.deleteQuery(q._id));
//       toast.success("Query deleted");
//       if (expandedId === q._id) setExpandedId(null);
//       fetchQueries();
//       fetchTypes();
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   // Close aana query → thirumba Open (files, replies, history ellam apdiye)
//   // Open tab ku kondu pogum (already Open la irundha list mattum refresh)
//   const goToOpen = () => {
//     if (filters.status === "open" && page === 1) fetchQueries(true);
//     else {
//       setPage(1);
//       setFilters((f) => ({ ...f, status: "open" }));
//     }
//   };

//   const reopenQuery = async (q) => {
//     if (!window.confirm(`Reopen "${q.subject}"? It goes back to Open. Files and replies stay as they are.`)) return;
//     setReopeningId(q._id);
//     try {
//       await minDelay(api.reopenQuery(q._id));
//       toast.success("Query reopened, it's Open again");
//       goToOpen();
//     } catch (err) {
//       toast.error(err.message);
//       fetchQueries(true);
//     } finally {
//       setReopeningId(null);
//     }
//   };

//   const typedLower = form.queryType.trim().toLowerCase();
//   const isNewType = typedLower && !types.some((t) => t.name.toLowerCase() === typedLower);

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
//     return (
//       <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
//         <span className="rounded bg-gray-100 px-1.5 py-0.5 font-semibold text-gray-700">{q.queryType}</span>
//         {q.attachments?.length > 0 && <span>📎 {q.attachments.length}</span>}
//         {q.replyCount > 0 && (
//           <span className={fromThem ? "font-semibold text-green-700" : ""}>
//             💬 {q.replyCount}
//             {fromThem ? " · new reply" : ""}
//           </span>
//         )}
//         {q.editCount > 0 && (
//           <span className="rounded bg-blue-50 px-1.5 py-0.5 font-semibold text-blue-700">Edited{q.editCount > 1 ? ` ${q.editCount}x` : ""}</span>
//         )}
//         {q.reopenCount > 0 && (
//           <span className="rounded bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-800">Reopened{q.reopenCount > 1 ? ` ${q.reopenCount}x` : ""}</span>
//         )}
//       </div>
//     );
//   };

//   const renderDetail = (q) => (
//     <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
//       <div className="min-w-0 xl:col-span-2">
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

//   const renderActions = (q, open) => (
//     <div className="flex w-full items-stretch gap-1.5 xl:w-auto xl:items-center">
//       {/* Closed / Rejected → Reopen */}
//       {isLocked(q) && (
//         <IconAction kind="reopen" label="Reopen" busyText="Reopening…" busy={reopeningId === q._id} onClick={() => reopenQuery(q)} />
//       )}
//       {!isLocked(q) && (
//         <>
//           <IconAction kind="edit" label="Edit" onClick={() => openEdit(q)} />
//           <IconAction kind="delete" label="Delete" busyText="Deleting…" busy={deletingId === q._id} onClick={() => deleteQuery(q)} />
//         </>
//       )}
//       {/* Touch pannuna open / close nu kaatura arrow */}
//       <span className="ml-auto flex h-9 w-7 flex-shrink-0 items-center justify-center self-center text-gray-400 xl:ml-1" aria-hidden="true">
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 transition ${open ? "rotate-180 text-green-600" : ""}`}>
//           <path d="m6 9 6 6 6-6" />
//         </svg>
//       </span>
//     </div>
//   );

//   const cardCount = (key) => (key ? counts[key] || 0 : Object.values(counts).reduce((a, b) => a + b, 0));
//   const inputCls =
//     "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100";
//   const labelCls = "mb-1.5 block text-sm font-semibold text-gray-600";

//   // ════════════════════════════════════════════════════════════════
//   return (
//     <div className="w-full min-w-0 max-w-7xl flex-1 p-3 sm:p-5">
//       <div className="mb-5 text-center sm:mb-6">
//         <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Ticket Launching</h1>
//         <p className="mt-1 text-sm text-gray-500">Raise a ticket, follow the replies, and see it through to closed.</p>
//         <span className="mx-auto mt-3 block h-1 w-14 rounded-full bg-green-500" aria-hidden="true" />
//       </div>

//       {/* Tabs */}
//       <div className="mb-6 flex justify-center">
//         <div className="flex w-full gap-1 rounded-2xl bg-gray-100 p-1 sm:inline-flex sm:w-auto" role="tablist">
//           <button
//             role="tab"
//             aria-selected={tab === "list"}
//             onClick={() => {
//               setEditing(null);
//               if (tab !== "list") goToOpen(); // Raise / History la irundhu vandha Open la kaatum
//               setTab("list");
//             }}
//             className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition sm:flex-none sm:px-5 sm:text-sm ${tab === "list" ? "bg-white text-green-700 shadow" : "text-gray-600 hover:text-gray-900"}`}
//           >
//             All Tickets
//           </button>
//           <button
//             role="tab"
//             aria-selected={tab === "form"}
//             onClick={openRaise}
//             className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition sm:flex-none sm:px-5 sm:text-sm ${tab === "form" && !editing ? "bg-white text-green-700 shadow" : "text-gray-600 hover:text-gray-900"}`}
//           >
//             + Raise Ticket
//           </button>
//           <button
//             role="tab"
//             aria-selected={tab === "history"}
//             onClick={() => {
//               setEditing(null);
//               setTab("history");
//             }}
//             className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition sm:flex-none sm:px-5 sm:text-sm ${tab === "history" ? "bg-white text-green-700 shadow" : "text-gray-600 hover:text-gray-900"}`}
//           >
//             Edit History
//           </button>
//         </div>
//       </div>

//       {tab === "history" && <EditHistory api={api} />}

//       {/* ═══════════ FORM (raise / edit) ═══════════ */}
//       {tab === "form" && (
//         <form onSubmit={submitForm} className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
//           <h2 className="mb-5 text-xl font-bold">{editing ? `Edit query` : "Raise a Ticket"}</h2>

//           <div className="mb-4">
//             <label htmlFor="bb-type" className={labelCls}>Query type</label>
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
//                       className={`inline-flex items-center overflow-hidden rounded-full border text-sm ${
//                         active ? "border-green-600 bg-green-600 font-semibold text-white" : "border-gray-200 bg-gray-50 text-gray-700"
//                       }`}
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

//           <div className="mb-4 grid gap-4 sm:grid-cols-2">
//             <div>
//               <label htmlFor="bb-by" className={labelCls}>Raised by</label>
//               <select id="bb-by" value={form.raisedBy} onChange={(e) => setForm({ ...form, raisedBy: e.target.value })} className={inputCls}>
//                 <option value="">Choose staff</option>
//                 {staff.map((s) => (
//                   <option key={s._id} value={s._id}>
//                     {staffName(s)} {staffRole(s) ? `(${staffRole(s)})` : ""}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label htmlFor="bb-to" className={labelCls}>Raised to</label>
//               <select id="bb-to" value={form.raisedTo} onChange={(e) => setForm({ ...form, raisedTo: e.target.value })} className={inputCls}>
//                 <option value="">Choose staff</option>
//                 {staff.map((s) => (
//                   <option key={s._id} value={s._id}>
//                     {staffName(s)} {staffRole(s) ? `(${staffRole(s)})` : ""}
//                   </option>
//                 ))}
//               </select>
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
//             <label htmlFor="bb-subject" className={labelCls}>Subject</label>
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

//       {/* ═══════════ LIST ═══════════ */}
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
//                   className={`group relative overflow-hidden rounded-2xl border p-3 text-left transition sm:p-4 ${
//                     active ? `${c.tint} border-transparent ring-2 ${c.ring} shadow-sm` : "border-gray-200 bg-white hover:-translate-y-0.5 hover:shadow-md"
//                   }`}
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

//           {/* Filters */}
//           <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
//             <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
//               <div className="col-span-2 md:col-span-3 xl:col-span-2">
//                 <label htmlFor="bb-f-search" className={labelCls}>Search</label>
//                 <input
//                   id="bb-f-search"
//                   type="search"
//                   value={filters.search}
//                   onChange={(e) => setFilter("search", e.target.value)}
//                   placeholder="Ticket no (GVTKT001), subject or description"
//                   className={inputCls}
//                 />
//               </div>
//               <div className="col-span-2 md:col-span-1">
//                 <label htmlFor="bb-f-type" className={labelCls}>Query type</label>
//                 <select id="bb-f-type" value={filters.queryType} onChange={(e) => setFilter("queryType", e.target.value)} className={inputCls}>
//                   <option value="">All types</option>
//                   {types.map((t) => (
//                     <option key={t.name} value={t.name}>
//                       {t.name} ({t.count})
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label htmlFor="bb-f-from" className={labelCls}>From</label>
//                 <input id="bb-f-from" type="date" value={filters.fromDate} onChange={(e) => setFilter("fromDate", e.target.value)} className={inputCls} />
//               </div>
//               <div>
//                 <label htmlFor="bb-f-to" className={labelCls}>To</label>
//                 <input id="bb-f-to" type="date" value={filters.toDate} onChange={(e) => setFilter("toDate", e.target.value)} className={inputCls} />
//               </div>
//             </div>
//             <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:justify-end">
//               <button onClick={clearFilters} className="h-11 rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
//                 Clear Filters
//               </button>
//               <button onClick={() => fetchQueries()} className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700">
//                 Refresh
//               </button>
//             </div>
//           </div>

//       {/* Table (big screens) + cards (mobile / tablet) */}
//       <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
//         {loading && <p className="px-4 py-10 text-center text-sm text-gray-500">Loading queries…</p>}
//         {!loading && queries.length === 0 && (
//           <div className="px-4 py-12 text-center">
//             <p className="font-semibold text-gray-800">No queries here</p>
//             <p className="mt-1 text-sm text-gray-500">Clear the filters or raise a new query.</p>
//           </div>
//         )}

//         {!loading && queries.length > 0 && (
//           <>
//             {/* ── Big screens: table ── */}
//             <div className="hidden overflow-x-auto xl:block">
//               <table className="w-full min-w-[960px] text-left">
//                 <thead className="bg-blue-50 text-sm text-gray-600">
//                   <tr>
//                     <th className="whitespace-nowrap px-4 py-3 font-semibold">Ticket no</th>
//                     <th className="whitespace-nowrap px-4 py-3 font-semibold">Query</th>
//                     <th className="whitespace-nowrap px-4 py-3 font-semibold">Raised by</th>
//                     <th className="whitespace-nowrap px-4 py-3 font-semibold">Raised to</th>
//                     <th className="whitespace-nowrap px-4 py-3 font-semibold">Raised on</th>
//                     <th className="whitespace-nowrap px-4 py-3 font-semibold">Status</th>
//                     <th className="whitespace-nowrap px-4 py-3 font-semibold">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {queries.map((q, i) => {
//                     const open = expandedId === q._id;
//                     return (
//                       <React.Fragment key={q._id}>
//                         <tr onClick={(e) => onRowClick(e, q)} className={`cursor-pointer border-t border-gray-100 transition ${open ? "bg-blue-50/40" : "hover:bg-gray-50"}`}>
//                           <td className={`whitespace-nowrap border-l-4 px-4 py-3 ${STATUS_BAR[q.status] || "border-l-transparent"}`}>
//                             <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold tracking-wide text-blue-800">{q.ticketNo || "—"}</span>
//                           </td>
//                           <td className="max-w-xs px-4 py-3">
//                             {renderTitle(q, open)}
//                             {renderMeta(q)}
//                           </td>
//                           <td className="px-4 py-3 text-sm">
//                             <p className="font-medium">{staffName(q.raisedBy)}</p>
//                             <p className="text-xs text-gray-500">{staffRole(q.raisedBy)}</p>
//                           </td>
//                           <td className="px-4 py-3 text-sm">
//                             <p className="font-medium">{staffName(q.raisedTo)}</p>
//                             <p className="text-xs text-gray-500">{staffRole(q.raisedTo)}</p>
//                           </td>
//                           <td className="whitespace-nowrap px-4 py-3 text-sm">
//                             <p>{fmtDate(q.createdAt)}</p>
//                             <p className="text-xs text-gray-500">{fmtTime(q.createdAt)}</p>
//                           </td>
//                           <td className="px-4 py-3">
//                             <StatusPill status={q.status} />
//                           </td>
//                           <td className="px-4 py-3">{renderActions(q, open)}</td>
//                         </tr>
//                         {open && (
//                           <tr className="border-t border-gray-100 bg-blue-50/40">
//                             <td colSpan={7} className="px-4 pb-5 pt-2">
//                               {renderDetail(q)}
//                             </td>
//                           </tr>
//                         )}
//                       </React.Fragment>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             {/* ── Mobile / tablet / small laptop: cards ── */}
//             <ul className="divide-y divide-gray-100 xl:hidden">
//               {queries.map((q, i) => {
//                 const open = expandedId === q._id;
//                 return (
//                   <li
//                     key={q._id}
//                     onClick={(e) => onRowClick(e, q)}
//                     className={`cursor-pointer border-l-4 p-4 transition ${STATUS_BAR[q.status] || "border-l-transparent"} ${open ? "bg-blue-50/40" : "active:bg-gray-50"}`}
//                   >
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="min-w-0 flex-1">
//                         <p className="mb-1 inline-block rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold tracking-wide text-blue-800">{q.ticketNo || "—"}</p>
//                         {renderTitle(q, open, true)}
//                         {renderMeta(q)}
//                       </div>
//                       <div className="flex-shrink-0">
//                         <StatusPill status={q.status} />
//                       </div>
//                     </div>
//                     <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
//                       <div className="min-w-0">
//                         <dt className="text-xs text-gray-500">Raised by</dt>
//                         <dd className="truncate font-medium">{staffName(q.raisedBy)}</dd>
//                         <dd className="truncate text-xs text-gray-500">{staffRole(q.raisedBy)}</dd>
//                       </div>
//                       <div className="min-w-0">
//                         <dt className="text-xs text-gray-500">Raised to</dt>
//                         <dd className="truncate font-medium">{staffName(q.raisedTo)}</dd>
//                         <dd className="truncate text-xs text-gray-500">{staffRole(q.raisedTo)}</dd>
//                       </div>
//                       <div className="col-span-2 sm:col-span-1">
//                         <dt className="text-xs text-gray-500">Raised on</dt>
//                         <dd>
//                           {fmtDate(q.createdAt)} <span className="text-xs text-gray-500">{fmtTime(q.createdAt)}</span>
//                         </dd>
//                       </div>
//                     </dl>
//                     <div className="mt-3">{renderActions(q, open)}</div>
//                     {open && (
//                       <div data-no-toggle className="mt-4 cursor-auto border-t border-gray-200 pt-4">
//                         {renderDetail(q)}
//                       </div>
//                     )}
//                   </li>
//                 );
//               })}
//             </ul>
//           </>
//         )}

//         <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
//           <span>
//             Showing <b>{queries.length}</b> of <b>{total}</b> queries
//           </span>
//           <div className="flex items-center justify-between gap-2 sm:justify-end">
//             <button
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               disabled={page <= 1}
//               className="rounded-lg border border-gray-200 px-3 py-2 font-semibold disabled:opacity-40"
//             >
//               Previous
//             </button>
//             <span className="whitespace-nowrap">
//               Page {page} of {totalPages}
//             </span>
//             <button
//               onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//               disabled={page >= totalPages}
//               className="rounded-lg border border-gray-200 px-3 py-2 font-semibold disabled:opacity-40"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default TicketLaunching;


// ════════════════════════════════════════════════════════════════
//  TicketLaunching.jsx — ADMIN side  (tourAdminController → /api/touradmin/...)
//  Queries raise, list + filters, edit, delete, replies (add / edit / delete)
//
//  API calls ellam context/TourAdminContext.jsx la "ticketApi" kulla irukku
// ════════════════════════════════════════════════════════════════
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { TourAdminContext } from "../../context/TourAdminContext"; // ⚙️ path check pannunga

const ME = "admin"; // replies la "from" — indha side (Ticket Launching)
const OTHER_NAME = "Tour admin";
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
const EMPTY_FILTERS = { search: "", queryType: "", status: "open", fromDate: "", toDate: "" };
const EMPTY_FORM = { queryType: "", subject: "", description: "", raisedBy: "", raisedTo: "" };
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_FILES = 5;
const MAX_SIZE = 5 * 1024 * 1024;

const staffName = (s) => s?.name || s?.fullName || s?.staffName || "—";
const staffRole = (s) => s?.role || s?.designation || "";
const isLocked = (q) => q?.status === "close" || q?.status === "reject";
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
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md text-xs font-bold ${
            isPdf ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
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

// ─── Action icons (FIT Enquiries page madhiri chinna icon buttons) ───
const ACT_ICON = {
  view: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  hide: "m3 3 18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.2A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6C3.9 8.4 2 12 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  delete: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6",
  reopen: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5",
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
    className={`group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-2 ring-1 ring-inset transition disabled:cursor-not-allowed disabled:opacity-60 xl:h-9 xl:w-9 xl:flex-none xl:p-0 ${ACT_TONE[kind]}`}
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
          const mine = r.from === ME;
          return (
            <div key={r._id} className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  mine ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                }`}
                aria-hidden="true"
              >
                {mine ? "You".slice(0, 1) : initials(r.staff ? staffName(r.staff) : OTHER_NAME)}
              </span>
              <div className={`max-w-[85%] break-words rounded-2xl sm:max-w-[75%] px-3.5 py-2.5 ${mine ? "rounded-br-sm bg-green-600 text-white" : "rounded-bl-sm border border-gray-200 bg-white"}`}>
                <p className={`mb-0.5 text-xs font-semibold ${mine ? "text-green-100" : "text-gray-500"}`}>
                  {mine ? "You" : "Tour admin"}
                  {r.staff ? ` · ${staffName(r.staff)}` : ""}
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
        <p className="text-sm text-gray-500">This query is {data.status === "close" ? "closed" : "rejected"}, so replies are turned off.</p>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
//  Edit history (before / after)
// ════════════════════════════════════════════════════════════════
// History la enna madhiri edit
const HISTORY_KIND = {
  query: { label: "Query edited", cls: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
  "reply-edit": { label: "Reply edited", cls: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  "reply-delete": { label: "Reply deleted", cls: "bg-red-100 text-red-800", dot: "bg-red-500" },
};

const EditHistory = ({ api }) => {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [closedIds, setClosedIds] = useState([]); // collapse panna tickets

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api.getEditHistory({ page, limit: 10, search }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [api, page, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [load]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id) => setClosedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  return (
    <div>
      <div className="mb-5 flex gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search by ticket no (GVTKT001) or subject"
          aria-label="Search edit history"
          className="w-full flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <button
          onClick={load}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {loading && <Spinner />}
          Refresh
        </button>
      </div>

      {!data ? (
        <p className="py-10 text-center text-sm text-gray-500">Loading edit history…</p>
      ) : data.items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-12 text-center">
          <p className="font-semibold text-gray-800">No edits yet</p>
          <p className="mt-1 text-sm text-gray-500">Query edits, reply edits and deleted replies from both sides show up here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {data.items.map((t) => {
            const open = !closedIds.includes(String(t.queryId));
            return (
              <div key={t.queryId} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                {/* ── Ticket header ── */}
                <button
                  onClick={() => toggle(String(t.queryId))}
                  aria-expanded={open}
                  className="flex w-full flex-col gap-2 bg-blue-50 px-4 py-3 text-left hover:bg-blue-100/60 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold tracking-wide text-blue-800">{t.ticketNo || "—"}</span>
                      <StatusPill status={t.status} />
                      <span className="rounded bg-white px-1.5 py-0.5 text-xs font-semibold text-gray-700">
                        {t.editCount} {t.editCount === 1 ? "edit" : "edits"}
                      </span>
                    </div>
                    <p className="mt-1 break-words font-semibold text-gray-900">{t.subject}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3 text-sm text-gray-600">
                    <span>
                      Last edit {fmtDate(t.lastEditedAt)} <span className="text-xs text-gray-500">{fmtTime(t.lastEditedAt)}</span>
                    </span>
                    <span className="text-xs font-semibold text-blue-700">{open ? "Hide" : "Show"}</span>
                  </div>
                </button>

                {/* ── Ellaa edits um timeline ah, puthusu mudhal la ── */}
                {open && (
                  <ol className="px-4 py-4 sm:px-5">
                    {t.edits.map((e, idx) => {
                      const kind = HISTORY_KIND[e.kind] || HISTORY_KIND.query;
                      const last = idx === t.edits.length - 1;
                      return (
                        <li key={e.id || idx} className="relative flex gap-3 sm:gap-4">
                          {/* timeline line + dot */}
                          <div className="flex flex-col items-center" aria-hidden="true">
                            <span className={`mt-1.5 h-3 w-3 flex-shrink-0 rounded-full ring-4 ring-white ${kind.dot}`} />
                            {!last && <span className="w-px flex-1 bg-gray-200" />}
                          </div>

                          <div className={`min-w-0 flex-1 ${last ? "" : "pb-6"}`}>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="text-sm font-semibold text-gray-900">Edit {e.editNo}</span>
                              <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${kind.cls}`}>{kind.label}</span>
                              <span className="text-xs text-gray-600">
                                by <b>{e.by === "touradmin" ? "Tour admin" : "Admin"}</b>
                              </span>
                              <span className="text-xs text-gray-500">
                                {fmtDate(e.editedAt)} {fmtTime(e.editedAt)}
                              </span>
                            </div>

                            <div className="mt-2 grid gap-2">
                              {e.changes.map((c) => (
                                <div
                                  key={c.field}
                                  className="grid grid-cols-1 gap-2 rounded-xl border border-gray-100 p-3 sm:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)] sm:gap-3"
                                >
                                  <p className="text-sm font-semibold text-gray-700">{c.label}</p>
                                  <div className="min-w-0 rounded-lg bg-red-50 p-2.5">
                                    <p className="mb-0.5 text-xs font-semibold text-red-700">Before</p>
                                    <p className="whitespace-pre-line break-words text-sm text-gray-800">{c.before || "Empty"}</p>
                                  </div>
                                  <div className="min-w-0 rounded-lg bg-green-50 p-2.5">
                                    <p className="mb-0.5 text-xs font-semibold text-green-700">After</p>
                                    <p className="whitespace-pre-line break-words text-sm text-gray-800">
                                      {c.after || (e.kind === "reply-delete" ? "Deleted" : "Empty")}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            );
          })}
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing <b>{data.items.length}</b> of <b>{data.total}</b> tickets
          </span>
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <span className="whitespace-nowrap">
              Page {page} of {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
//  Page
// ════════════════════════════════════════════════════════════════
const TicketLaunching = () => {
  const { ticketApi: api } = useContext(TourAdminContext);

  const [tab, setTab] = useState("list"); // list | form | history
  const [deletingId, setDeletingId] = useState(null);
  const [reopeningId, setReopeningId] = useState(null);
  const [queries, setQueries] = useState([]);
  const [counts, setCounts] = useState({ open: 0, pickup: 0, processing: 0, close: 0, reject: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [types, setTypes] = useState([]);
  const [staff, setStaff] = useState([]);
  const [staffError, setStaffError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  // Form (raise + edit)
  const [editing, setEditing] = useState(null); // query being edited, or null
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState([]);
  const [removeIds, setRemoveIds] = useState([]);
  const [saving, setSaving] = useState(false);

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
  const [progress, setProgress] = useState(null); // upload %
  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const syncRef = useRef(null);

  // ─── Loaders ───
  const fetchQueries = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const data = await api.getQueries({ ...filters, page, limit: 20 });
        setQueries(data.queries);
        setCounts(data.statusCounts);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (err) {
        if (!silent) toast.error(err.message);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [api, filters, page],
  );

  const fetchTypes = useCallback(async () => {
    try {
      setTypes(await api.getTypes());
    } catch {
      /* dropdown empty ah irukum */
    }
  }, [api]);

  const fetchStaff = useCallback(async () => {
    try {
      const list = await api.getStaff();
      setStaff(list);
      setStaffError(list.length ? "" : "No active staff found. Add staff in Staff Profiles first.");
    } catch (err) {
      setStaff([]);
      // Actual reason kaatum — 404 na route illa, 401 na token issue
      setStaffError(`Couldn't load staff: ${err.message}`);
    }
  }, [api]);

  // Search type panna 400ms wait panni fetch
  useEffect(() => {
    const t = setTimeout(() => fetchQueries(), filters.search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchQueries]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchTypes();
    fetchStaff();
  }, [fetchTypes, fetchStaff]);

  // ─── Auto-sync: tour admin enna pannalum inga update aagum ───
  useEffect(() => {
    const check = async () => {
      try {
        const data = await api.sync();
        if (syncRef.current && syncRef.current !== data.version) {
          fetchQueries(true);
          fetchTypes();
        }
        syncRef.current = data.version;
      } catch {
        /* next round la try pannum */
      }
    };
    check();
    const t = setInterval(check, SYNC_EVERY_MS);
    return () => clearInterval(t);
  }, [api, fetchQueries, fetchTypes]);

  // ─── Filters ───
  const setFilter = (key, value) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };
  const clearFilters = () => {
    setPage(1);
    setFilters(EMPTY_FILTERS);
  };

  // ─── Form helpers ───
  const openRaise = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFiles([]);
    setRemoveIds([]);
    setTab("form");
  };

  const openEdit = (q) => {
    setEditing(q);
    setForm({
      queryType: q.queryType || "",
      subject: q.subject || "",
      description: q.description || "",
      raisedBy: q.raisedBy?._id || q.raisedBy || "",
      raisedTo: q.raisedTo?._id || q.raisedTo || "",
    });
    setFiles([]);
    setRemoveIds([]);
    setTab("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const keptCount = (editing?.attachments?.length || 0) - removeIds.length;

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
    const { queryType, subject, raisedBy, raisedTo } = form;
    if (!queryType.trim() || !subject.trim() || !raisedBy || !raisedTo) {
      return toast.error("Fill in query type, subject, raised by and raised to.");
    }
    if (raisedBy === raisedTo) return toast.error("Raised by and raised to must be different staff.");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, typeof v === "string" ? v.trim() : v));
    files.forEach((f) => fd.append("attachments", f));
    if (editing && removeIds.length) fd.append("removeAttachmentIds", JSON.stringify(removeIds));

    const typed = form.queryType.trim();
    if (hiddenTypes.includes(typed.toLowerCase())) unhideType(typed);
    setSaving(true);
    setProgress(files.length ? 0 : null);
    const onProgress = (ev) => ev.total && setProgress(Math.round((ev.loaded * 100) / ev.total));
    try {
      const res = await (editing ? api.updateQuery(editing._id, fd, onProgress) : api.raiseQuery(fd, onProgress));
      toast.success(res?.noChange ? "Nothing changed" : editing ? "Query updated" : "Query raised");
      setEditing(null);
      setForm(EMPTY_FORM);
      setFiles([]);
      setRemoveIds([]);
      setTab("list");
      if (editing) fetchQueries(true); // edit na adhe tab la irukkattum
      else goToOpen(); // puthu query → Open tab la theriyum
      fetchTypes();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProgress(null);
      setSaving(false);
    }
  };

  const deleteQuery = async (q) => {
    if (!window.confirm(`Delete "${q.subject}"? Its replies and files will be removed too.`)) return;
    setDeletingId(q._id);
    try {
      await minDelay(api.deleteQuery(q._id));
      toast.success("Query deleted");
      if (expandedId === q._id) setExpandedId(null);
      fetchQueries();
      fetchTypes();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Close aana query → thirumba Open (files, replies, history ellam apdiye)
  // Open tab ku kondu pogum (already Open la irundha list mattum refresh)
  const goToOpen = () => {
    if (filters.status === "open" && page === 1) fetchQueries(true);
    else {
      setPage(1);
      setFilters((f) => ({ ...f, status: "open" }));
    }
  };

  const reopenQuery = async (q) => {
    if (!window.confirm(`Reopen "${q.subject}"? It goes back to Open. Files and replies stay as they are.`)) return;
    setReopeningId(q._id);
    try {
      await minDelay(api.reopenQuery(q._id));
      toast.success("Query reopened, it's Open again");
      goToOpen();
    } catch (err) {
      toast.error(err.message);
      fetchQueries(true);
    } finally {
      setReopeningId(null);
    }
  };

  const typedLower = form.queryType.trim().toLowerCase();
  const isNewType = typedLower && !types.some((t) => t.name.toLowerCase() === typedLower);

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
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
        <span className="rounded bg-gray-100 px-1.5 py-0.5 font-semibold text-gray-700">{q.queryType}</span>
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
          <span className="inline-flex items-center gap-1 text-amber-700" title={`Reopened ${q.reopenCount} time${q.reopenCount > 1 ? "s" : ""}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={ico} aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />
            </svg>
            {q.reopenCount > 1 ? q.reopenCount : ""}
          </span>
        )}
      </div>
    );
  };

  // Endha page la irundhu raise aachu — Raised by column la, person keela
  const renderVia = (q) =>
    q.raisedVia === "touradmin" ? (
      <span className="mt-1 inline-block rounded bg-violet-50 px-1.5 py-0.5 text-[11px] font-semibold text-violet-700">Tour admin</span>
    ) : (
      <span className="mt-1 inline-block rounded bg-sky-50 px-1.5 py-0.5 text-[11px] font-semibold text-sky-700">Admin</span>
    );

  const renderDetail = (q) => (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
      <div className="min-w-0 xl:col-span-2">
        <p className="mb-1 text-sm font-semibold text-gray-600">Description</p>
        <p className="mb-4 whitespace-pre-line break-words text-sm text-gray-800">{q.description || "No description"}</p>
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

  const renderActions = (q, open) => (
    <div className="flex w-full items-stretch gap-1.5 xl:w-auto xl:items-center">
      {/* Closed / Rejected → Reopen */}
      {isLocked(q) && (
        <IconAction kind="reopen" label="Reopen" busyText="Reopening…" busy={reopeningId === q._id} onClick={() => reopenQuery(q)} />
      )}
      {!isLocked(q) && (
        <>
          <IconAction kind="edit" label="Edit" onClick={() => openEdit(q)} />
          <IconAction kind="delete" label="Delete" busyText="Deleting…" busy={deletingId === q._id} onClick={() => deleteQuery(q)} />
        </>
      )}
      {/* Touch pannuna open / close nu kaatura arrow */}
      <span className="ml-auto flex h-9 w-7 flex-shrink-0 items-center justify-center self-center text-gray-400 xl:ml-1" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 transition ${open ? "rotate-180 text-green-600" : ""}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </div>
  );

  const cardCount = (key) => (key ? counts[key] || 0 : Object.values(counts).reduce((a, b) => a + b, 0));
  const inputCls =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100";
  const labelCls = "mb-1.5 block text-sm font-semibold text-gray-600";

  // ════════════════════════════════════════════════════════════════
  return (
    <div className="w-full min-w-0 max-w-7xl flex-1 p-3 sm:p-5">
      <div className="mb-5 text-center sm:mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Ticket Launching</h1>
        <p className="mt-1 text-sm text-gray-500">Raise a ticket, follow the replies, and see it through to closed.</p>
        <span className="mx-auto mt-3 block h-1 w-14 rounded-full bg-green-500" aria-hidden="true" />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex justify-center">
        <div className="flex w-full gap-1 rounded-2xl bg-gray-100 p-1 sm:inline-flex sm:w-auto" role="tablist">
          <button
            role="tab"
            aria-selected={tab === "list"}
            onClick={() => {
              setEditing(null);
              if (tab !== "list") goToOpen(); // Raise / History la irundhu vandha Open la kaatum
              setTab("list");
            }}
            className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition sm:flex-none sm:px-5 sm:text-sm ${tab === "list" ? "bg-white text-green-700 shadow" : "text-gray-600 hover:text-gray-900"}`}
          >
            All Queries
          </button>
          <button
            role="tab"
            aria-selected={tab === "form"}
            onClick={openRaise}
            className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition sm:flex-none sm:px-5 sm:text-sm ${tab === "form" && !editing ? "bg-white text-green-700 shadow" : "text-gray-600 hover:text-gray-900"}`}
          >
            + Raise Query
          </button>
          <button
            role="tab"
            aria-selected={tab === "history"}
            onClick={() => {
              setEditing(null);
              setTab("history");
            }}
            className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition sm:flex-none sm:px-5 sm:text-sm ${tab === "history" ? "bg-white text-green-700 shadow" : "text-gray-600 hover:text-gray-900"}`}
          >
            Edit History
          </button>
        </div>
      </div>

      {tab === "history" && <EditHistory api={api} />}

      {/* ═══════════ FORM (raise / edit) ═══════════ */}
      {tab === "form" && (
        <form onSubmit={submitForm} className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
          <h2 className="mb-5 text-xl font-bold">{editing ? `Edit query` : "Raise a query"}</h2>

          <div className="mb-4">
            <label htmlFor="bb-type" className={labelCls}>Query type</label>
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
                      className={`inline-flex items-center overflow-hidden rounded-full border text-sm ${
                        active ? "border-green-600 bg-green-600 font-semibold text-white" : "border-gray-200 bg-gray-50 text-gray-700"
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

          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="bb-by" className={labelCls}>Raised by</label>
              <select id="bb-by" value={form.raisedBy} onChange={(e) => setForm({ ...form, raisedBy: e.target.value })} className={inputCls}>
                <option value="">Choose staff</option>
                {staff.map((s) => (
                  <option key={s._id} value={s._id}>
                    {staffName(s)} {staffRole(s) ? `(${staffRole(s)})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="bb-to" className={labelCls}>Raised to</label>
              <select id="bb-to" value={form.raisedTo} onChange={(e) => setForm({ ...form, raisedTo: e.target.value })} className={inputCls}>
                <option value="">Choose staff</option>
                {staff.map((s) => (
                  <option key={s._id} value={s._id}>
                    {staffName(s)} {staffRole(s) ? `(${staffRole(s)})` : ""}
                  </option>
                ))}
              </select>
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
            <label htmlFor="bb-subject" className={labelCls}>Subject</label>
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

      {/* ═══════════ LIST ═══════════ */}
      {tab === "list" && (
        <>
          {/* Cards */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {CARDS.map((c) => {
              const active = filters.status === c.key;
              return (
                <button
                  key={c.label}
                  onClick={() => setFilter("status", c.key)}
                  aria-pressed={active}
                  className={`group relative overflow-hidden rounded-2xl border p-3 text-left transition sm:p-4 ${
                    active ? `${c.tint} border-transparent ring-2 ${c.ring} shadow-sm` : "border-gray-200 bg-white hover:-translate-y-0.5 hover:shadow-md"
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

          {/* Filters */}
          <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
              <div className="col-span-2 md:col-span-3 xl:col-span-2">
                <label htmlFor="bb-f-search" className={labelCls}>Search</label>
                <input
                  id="bb-f-search"
                  type="search"
                  value={filters.search}
                  onChange={(e) => setFilter("search", e.target.value)}
                  placeholder="Ticket no (GVTKT001), subject or description"
                  className={inputCls}
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="bb-f-type" className={labelCls}>Query type</label>
                <select id="bb-f-type" value={filters.queryType} onChange={(e) => setFilter("queryType", e.target.value)} className={inputCls}>
                  <option value="">All types</option>
                  {types.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name} ({t.count})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="bb-f-from" className={labelCls}>From</label>
                <input id="bb-f-from" type="date" value={filters.fromDate} onChange={(e) => setFilter("fromDate", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="bb-f-to" className={labelCls}>To</label>
                <input id="bb-f-to" type="date" value={filters.toDate} onChange={(e) => setFilter("toDate", e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:justify-end">
              <button onClick={clearFilters} className="h-11 rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Clear Filters
              </button>
              <button onClick={() => fetchQueries()} className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700">
                Refresh
              </button>
            </div>
          </div>

      {/* Table (big screens) + cards (mobile / tablet) */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading && <p className="px-4 py-10 text-center text-sm text-gray-500">Loading queries…</p>}
        {!loading && queries.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="font-semibold text-gray-800">No queries here</p>
            <p className="mt-1 text-sm text-gray-500">Clear the filters or raise a new query.</p>
          </div>
        )}

        {!loading && queries.length > 0 && (
          <>
            {/* ── Big screens: table ── */}
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full min-w-[960px] text-left">
                <thead className="bg-blue-50 text-sm text-gray-600">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Ticket no</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Query</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Raised by</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Raised to</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Raised on</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Status</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queries.map((q, i) => {
                    const open = expandedId === q._id;
                    return (
                      <React.Fragment key={q._id}>
                        <tr onClick={(e) => onRowClick(e, q)} className={`cursor-pointer border-t border-gray-100 transition ${open ? "bg-blue-50/40" : "hover:bg-gray-50"}`}>
                          <td className={`whitespace-nowrap border-l-4 px-4 py-3 ${STATUS_BAR[q.status] || "border-l-transparent"}`}>
                            <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold tracking-wide text-blue-800">{q.ticketNo || "—"}</span>
                          </td>
                          <td className="max-w-xs px-4 py-3">
                            {renderTitle(q, open)}
                            {renderMeta(q)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <p className="font-medium">{staffName(q.raisedBy)}</p>
                            <p className="text-xs text-gray-500">{staffRole(q.raisedBy)}</p>
                            {renderVia(q)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <p className="font-medium">{staffName(q.raisedTo)}</p>
                            <p className="text-xs text-gray-500">{staffRole(q.raisedTo)}</p>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <p>{fmtDate(q.createdAt)}</p>
                            <p className="text-xs text-gray-500">{fmtTime(q.createdAt)}</p>
                          </td>
                          <td className="px-4 py-3">
                            <StatusPill status={q.status} />
                          </td>
                          <td className="px-4 py-3">{renderActions(q, open)}</td>
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
                        <dd className="truncate font-medium">{staffName(q.raisedTo)}</dd>
                        <dd className="truncate text-xs text-gray-500">{staffRole(q.raisedTo)}</dd>
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
    </div>
  );
};

export default TicketLaunching;
