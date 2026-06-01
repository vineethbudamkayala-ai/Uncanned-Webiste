"use client";
import { useState } from "react";

const ENDPOINT = "";

export default function NotifyForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const handleSubmit = async () => {
    const newErrors: Record<string, boolean> = {};
    if (!name.trim()) newErrors.name = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = true;
    if (!phone.trim() || phone.length < 10) newErrors.phone = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://script.google.com/macros/s/AKfycbwiUq0F0XaszN92aTVaOLwXR9VPh4MUKZN4eF42igu0IbwytKkrrFzP8LLf9wsCPLUaYA/exec", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ type: "claim", name, email, phone, ref: "", website: "" }),
      });
      const d = await res.json();

      if (d?.existing) {
        setStatusMsg("you're already an insider. patience pays.");
      } else if (d?.closed) {
        setStatusMsg("all 500 insider seats are taken. waitlist opens at launch.");
      } else if (typeof d?.number !== "undefined") {
        setStatusMsg(`you're insider #${d.number} of ${d.total}. cans incoming 07.2026.`);
      } else {
        setStatusMsg("something odd happened. try again?");
      }
      setDone(true);
    } catch {
      setStatusMsg("couldn't reach the door. check your connection.");
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notify-form">
      <p className="modal-sub">500 cans. 500 insiders. Then we close the door.</p>

      {!done ? (
        <>
          <input
            className="field"
            type="text"
            placeholder="your name"
            autoComplete="name"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors(p => ({...p, name: false})); }}
            style={{ borderColor: errors.name ? "#c0392b" : undefined }}
          />
          <input
            className="field"
            type="email"
            placeholder="your email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors(p => ({...p, email: false})); }}
            style={{ borderColor: errors.email ? "#c0392b" : undefined }}
          />
          <input
            className="field"
            type="tel"
            placeholder="your whatsapp number"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, ''));
              setErrors(p => ({...p, phone: false}));
            }}
            style={{ borderColor: errors.phone ? "#c0392b" : undefined }}
          />
          <button className="btn-count" onClick={handleSubmit} disabled={loading}>
            {loading ? "knocking…" : "Count me in"}
          </button>
          <p className="f-fine">No spam. One message when the door closes.</p>
        </>
      ) : (
        <>
          <p className="f-status">{statusMsg}</p>
          <button className="btn btn-ghost f-done" onClick={onClose}>Close</button>
        </>
      )}
    </div>
  );
}