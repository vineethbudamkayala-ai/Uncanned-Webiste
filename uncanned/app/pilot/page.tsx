"use client";

import Image from "next/image";
import Link from 'next/link';
import { useState } from "react";
import { useRouter } from "next/navigation";

const questions = [
  {
    id: "sodaChoice",
    title: "Which would you rather buy?",
    options: ["Regular Soda", "Zero Sugar", "I don't care"],
  },
  {
    id: "interest",
    title: "How interested would you be in trying different flavoured zero-sugar sodas and giving honest feedback?",
    options: ["Very interested", "Maybe", "Not at all"],
  },
  {
    id: "market",
    title: "Do you wish the Indian soda market had more options?",
    options: ["Yes", "Maybe", "I'm good thanks"],
  },
  {
    id: "functional",
    title: "Have you tried functional beverages or low-sugar drinks before?",
    options: ["Yes", "I want to but haven't", "No"],
  },
  {
    id: "flavour",
    title: "Which flavour sounds most interesting?",
    options: ["Orange", "Lemon", "Mango"],
  },
];

export default function PilotPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pincode, setPincode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const [answers, setAnswers] = useState({
    sodaChoice: "",
    interest: "",
    market: "",
    functional: "",
    flavour: "",
  });

  const clearError = (key: string) =>
    setErrors(p => ({ ...p, [key]: false }));

  const handleSubmit = async () => {
    const newErrors: Record<string, boolean> = {};

    if (!name.trim()) newErrors.name = true;
    if (!phone.trim() || phone.length < 10) newErrors.phone = true;
    if (!pincode.trim() || pincode.length !== 6) newErrors.pincode = true;
    if (!answers.sodaChoice || !answers.interest || !answers.market || !answers.functional || !answers.flavour)
      newErrors.questions = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await fetch("https://script.google.com/macros/s/AKfycbwiUq0F0XaszN92aTVaOLwXR9VPh4MUKZN4eF42igu0IbwytKkrrFzP8LLf9wsCPLUaYA/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          type: "pilot", name, email, phone, pincode,
          sodaChoice: answers.sodaChoice,
          interest: answers.interest,
          market: answers.market,
          functional: answers.functional,
          flavour: answers.flavour,
        }),
      });
      setSubmitted(true);
      setTimeout(() => router.push("/"), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pilot-page">

      <div className="ambient-bubbles">
        {[
          [8,3,22],[18,7,26],[28,1,20],[38,5,24],
          [52,9,28],[63,2,21],[72,6,25],[82,4,23],[91,8,27],
        ].map(([left, delay, duration], i) => (
          <span key={i} className="ambient-bubble" style={{
            left: `${left}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
          }} />
        ))}
      </div>

      <div className="pilot-nav">
        <Image src="/images/Deep-Green.png" alt="Uncanned" width={180} height={50} priority />
        <Link href="/" className="pilot-back">← Back</Link>
      </div>

      <div className="pilot-card">
        <h1 className="pilot-title">Become an Insider</h1>
        <p className="pilot-subtitle">
          Help us build a soda people actually want by answering just 5 questions.
        </p>

        {errors.questions && (
          <p className="pilot-error">please answer all questions before submitting.</p>
        )}

        {questions.map((q) => (
          <div key={q.id} className="pilot-question">
            <h2>{q.title}</h2>
            <div className="pilot-options">
              {q.options.map((option) => (
                <label key={option} className="pilot-option">
                  <input
                    type="radio"
                    name={q.id}
                    value={option}
                    checked={answers[q.id as keyof typeof answers] === option}
                    onChange={() => {
                      setAnswers(prev => ({ ...prev, [q.id]: option }));
                      clearError("questions");
                    }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <section className="pilot-contact">
          <h2>Almost done.</h2>

          <input
            type="text"
            placeholder="Name *"
            value={name}
            onChange={(e) => { setName(e.target.value); clearError("name"); }}
            style={{ borderColor: errors.name ? '#c0392b' : undefined }}
          />
          {errors.name && <p className="pilot-error">please enter your name.</p>}

          <input
            type="tel"
            placeholder="WhatsApp Number * (we'll send your details here)"
            value={phone}
            inputMode="numeric"
            maxLength={10}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, ''));
              clearError("phone");
            }}
            style={{ borderColor: errors.phone ? '#c0392b' : undefined }}
          />
          {errors.phone && <p className="pilot-error">please enter a valid 10-digit number.</p>}

          <input
            type="text"
            placeholder="Pincode *"
            value={pincode}
            inputMode="numeric"
            maxLength={6}
            onChange={(e) => {
              setPincode(e.target.value.replace(/\D/g, ''));
              clearError("pincode");
            }}
            style={{ borderColor: errors.pincode ? '#c0392b' : undefined }}
          />
          {errors.pincode && <p className="pilot-error">please enter a valid 6-digit pincode.</p>}

          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="pilot-submit" onClick={handleSubmit}>
            {loading ? "Submitting..." : "Become an Insider."}
          </button>
        </section>
      </div>

      {submitted && (
        <div className="modal-overlay" onClick={() => setSubmitted(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSubmitted(false)}>×</button>
            <h2 className="modal-title">You're in the queue.</h2>
            <p style={{ color: 'var(--green)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '1rem', lineHeight: 1.6, marginTop: '16px' }}>
              Turn on your WhatsApp chime — our message drops soon. 🥤
            </p>
          </div>
        </div>
      )}
    </main>
  );
}