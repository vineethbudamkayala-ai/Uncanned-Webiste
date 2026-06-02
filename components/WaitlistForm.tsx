"use client";

import { useState } from "react";
import { APPS_SCRIPT_URL } from "@/lib/appsScript";

type WaitlistFormProps = {
  onSuccess?: () => void;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WaitlistForm({
  onSuccess,
}: WaitlistFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!EMAIL_RE.test(email.trim())) {
      setError("Please enter a valid email.");
      return;
    }

    if (phone.replace(/[^\d]/g, "").length < 7) {
      setError("Please enter a valid phone number.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify({
          type: "waitlist",
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      });

      setDone(true);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="waitlist-done">
        <p className="waitlist-done-title">
          You&rsquo;re on the list.
        </p>
        <p className="waitlist-done-sub">
          We&rsquo;ll email you the moment we&rsquo;re live.
        </p>
      </div>
    );
  }

  return (
    <div className="waitlist-form">
      <p className="waitlist-intro">
        Drop your details and we&rsquo;ll be the first to ping you when
        uncanned hits the shelves.
      </p>

      <input
        type="text"
        placeholder="Name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email *"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="tel"
        placeholder="Phone Number *"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      {error && (
        <p className="waitlist-error">{error}</p>
      )}

      <button
        className="waitlist-submit"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Adding you…" : "Notify me when we're live"}
      </button>
    </div>
  );
}
