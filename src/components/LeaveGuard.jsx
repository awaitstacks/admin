import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

/*
  Leave confirmation popup — ella page layum use pannalaam.

  Usage (page kulla, return la enga venaalum):
    <LeaveGuard when={shouldProtect} />
    <LeaveGuard when={shouldProtect} message={<>Custom message…</>} />

  `when` true aa irukkumbodhu mattum:
    1. Reload / tab close        → browser "Leave site?" dialog
    2. Back button / swipe back  → indha popup
    3. Sidebar / page la ulla link click → indha popup
*/
const LeaveGuard = ({
  when,
  title = "Leave this page?",
  message = (
    <>
      The details you entered on this page are not saved yet.
      <br />
      Leaving will clear them.
      <br />
      Are you sure you want to leave?
    </>
  ),
  stayLabel = "Cancel (Stay)",
  leaveLabel = "Yes, Leave",
}) => {
  const [open, setOpen] = useState(false);
  const pending = useRef(null); // { type: "back" } | { type: "link", to }
  const leaving = useRef(false);
  const navigate = useNavigate();

  // 1. Reload / close tab
  useEffect(() => {
    if (!when) return undefined;
    const onBeforeUnload = (e) => {
      if (leaving.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [when]);

  // 2. Back button / mobile swipe back
  // Chrome rule: page la user oru thadava kooda click / type pannalana, namma
  // dummy history entry-a back button skip pannidum. Adhanaala user mudhal
  // click / key press pannumbodhu thaan dummy entry podrom.
  useEffect(() => {
    if (!when) return undefined;
    let armed = false;
    const arm = () => {
      if (armed) return;
      armed = true;
      // Already dummy entry la irundhaa thirumba podaadha — illana rendu / moonu dummy
      // serndhu "Yes, Leave" adichaalum popup thirumba varum
      if (window.history.state && window.history.state.__leaveGuard) return;
      window.history.pushState({ ...(window.history.state || {}), __leaveGuard: true }, "", window.location.href);
    };
    const onPopState = () => {
      if (leaving.current) return;
      pending.current = { type: "back" };
      setOpen(true);
    };
    if (navigator.userActivation?.hasBeenActive) arm();
    window.addEventListener("pointerdown", arm, true);
    window.addEventListener("keydown", arm, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("pointerdown", arm, true);
      window.removeEventListener("keydown", arm, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, [when]);

  // 3. Sidebar / in-page link click (<a> / <Link> / <NavLink>)
  useEffect(() => {
    if (!when) return undefined;
    const onClick = (e) => {
      if (leaving.current || e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // new tab — ok
      const a = e.target.closest ? e.target.closest("a[href]") : null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      e.preventDefault();
      e.stopPropagation();
      pending.current = { type: "link", to: url.pathname + url.search + url.hash };
      setOpen(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [when]);

  // Popup close aanaa thirumba guard on (adutha page la irundhu varumbodhu)
  useEffect(() => {
    leaving.current = false;
  }, [when]);

  const stay = () => {
    setOpen(false);
    if (pending.current?.type === "back" && !(window.history.state && window.history.state.__leaveGuard)) {
      window.history.pushState({ ...(window.history.state || {}), __leaveGuard: true }, "", window.location.href);
    }
    pending.current = null;
  };

  const leave = () => {
    const p = pending.current;
    leaving.current = true;
    setOpen(false);
    pending.current = null;
    if (p?.type === "link") navigate(p.to);
    else window.history.back();
  };

  if (!open) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "16px",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "440px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "16px", color: "#111827" }}>{title}</h2>
        <p style={{ color: "#4b5563", marginBottom: "24px", lineHeight: "1.6" }}>{message}</p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={stay}
            style={{ padding: "12px 28px", backgroundColor: "#e5e7eb", color: "#1f2937", borderRadius: "8px", fontWeight: "600", border: "none", cursor: "pointer" }}
          >
            {stayLabel}
          </button>
          <button
            type="button"
            onClick={leave}
            style={{ padding: "12px 28px", backgroundColor: "#dc2626", color: "white", borderRadius: "8px", fontWeight: "600", border: "none", cursor: "pointer" }}
          >
            {leaveLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default LeaveGuard;
