import React, { useState } from "react";

// ─── Bank dropdown (payment screenshot) — list la illana "Other" select panni type pannalaam ───
const BANKS = [
  "SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "Indian Bank", "Indian Overseas Bank",
  "Canara Bank", "Bank of Baroda", "Union Bank of India", "Punjab National Bank", "Bank of India", "IDFC FIRST Bank",
  "IndusInd Bank", "Yes Bank", "Federal Bank", "Karur Vysya Bank", "City Union Bank", "Tamilnad Mercantile Bank",
  "South Indian Bank", "Equitas Small Finance Bank", "AU Small Finance Bank", "Cash",
];
const BankSelect = ({ value, onChange, disabled, className }) => {
  const v = value || "";
  const inList = BANKS.includes(v);
  const [other, setOther] = useState(!!v && !inList);
  const showOther = other || (!!v && !inList);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <select
          aria-label="Bank"
          aria-required="true"
          value={showOther ? "__other" : v}
          onChange={(e) => {
            const nv = e.target.value;
            if (nv === "__other") { setOther(true); onChange(""); return; }
            setOther(false);
            onChange(nv);
          }}
          disabled={disabled}
          className={`${className} cursor-pointer ${!v && !showOther ? "text-gray-400" : ""}`}
        >
          <option value="">Select bank</option>
          {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
          <option value="__other">Other…</option>
        </select>
        {/* Red star — mandatory (select option kulla color poda mudiyaadhu, adhaan mela overlay) */}
        {!v && !showOther && (
          <span aria-hidden="true" className="pointer-events-none absolute left-[11px] top-1/2 -translate-y-1/2 text-xs whitespace-nowrap">
            <span className="invisible">Select bank</span>
            <span className="text-red-500 font-bold ml-0.5">*</span>
          </span>
        )}
      </div>
      {showOther && (
        <input
          type="text"
          autoFocus
          placeholder="Type bank name"
          value={v}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={className}
        />
      )}
    </div>
  );
};

export { BANKS };
export default BankSelect;
