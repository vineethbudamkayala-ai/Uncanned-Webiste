"use client";

import Image from "next/image";
import Link from 'next/link';
import { useState } from "react";


const questions = [
  {
    id: "sodaChoice",
    title: "Which would you rather buy?",
    options: [
      "Regular Soda",
      "Zero Sugar",
      "I don't care",
    ],
  },
  {
    id: "interest",
    title:
      "How interested would you be in trying different flavoured zero-sugar sodas and giving honest feedback?",
    options: [
      "Very interested",
      "Maybe",
      "Not at all",
    ],
  },
  {
    id: "market",
    title:
      "Do you wish the Indian soda market had more options?",
    options: [
      "Yes",
      "Maybe",
      "I'm good thanks",
    ],
  },
  {
    id: "functional",
    title:
      "Have you tried functional beverages or low-sugar drinks before?",
    options: [
      "Yes",
      "I want to but haven't",
      "No",
    ],
  },
  {
    id: "flavour",
    title:
      "Which flavour sounds most interesting?",
    options: [
      "Orange",
      "Lemon",
      "Mango",
    ],
  },
];

export default function PilotPage() {

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [answers, setAnswers] = useState({
    sodaChoice: "",
    interest: "",
    market: "",
    functional: "",
    flavour: "",
  });

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async () => {

    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!phone.trim()) {
      alert(
        "Please enter your phone number"
      );
      return;
    }

    if (
      !answers.sodaChoice ||
      !answers.interest ||
      !answers.market ||
      !answers.functional ||
      !answers.flavour
    ) {
      alert(
        "Please answer all questions"
      );
      return;
    }

    setLoading(true);

    try {

      console.log({
      type: "pilot",
      name,
      email,
      phone,
      sodaChoice: answers.sodaChoice,
      interest: answers.interest,
      market: answers.market,
      functional: answers.functional,
      flavour: answers.flavour,
    });

     await fetch("https://script.google.com/macros/s/AKfycbwiUq0F0XaszN92aTVaOLwXR9VPh4MUKZN4eF42igu0IbwytKkrrFzP8LLf9wsCPLUaYA/exec", {
      method: "POST",
      mode: "no-cors",
      headers: {
    "Content-Type": "text/plain",
  },
      body: JSON.stringify({
        type: "pilot",
        name,
        email,
        phone,
        sodaChoice: answers.sodaChoice,
        interest: answers.interest,
        market: answers.market,
        functional: answers.functional,
        flavour: answers.flavour,
      }),
    });

      alert("Thanks for joining!");

    } catch (err) {

      alert(
        "Something went wrong."
      );

      console.error(err);

    } finally {

      setLoading(false);

    }
  };
  return (
    <main className="pilot-page">

      {/* Ambient bubbles */}
      <div className="ambient-bubbles">
        {[
          [8, 3, 22], [18, 7, 26], [28, 1, 20],
          [38, 5, 24], [52, 9, 28], [63, 2, 21],
          [72, 6, 25], [82, 4, 23], [91, 8, 27],
        ].map(([left, delay, duration], i) => (
          <span
            key={i}
            className="ambient-bubble"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        ))}
      </div>

   <div className="pilot-nav">

      <Image
        src="/images/Deep-Green.png"
        alt="Uncanned"
        width={180}
        height={50}
        priority
      />

      <Link
        href="/"
        className="pilot-back"
      >
        ← Back
      </Link>

    </div>

      <div className="pilot-card">

        <h1 className="pilot-title">
          Become an Insider
        </h1>

        <p className="pilot-subtitle">
          Help us build a soda people actually want by answering just 5 questions.
        </p>

        {questions.map((q) => (
          <div
            key={q.id}
            className="pilot-question"
          >
            <h2>{q.title}</h2>

            <div className="pilot-options">
              {q.options.map((option) => (
                <label
                  key={option}
                  className="pilot-option"
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={option}
                    checked={
                      answers[
                        q.id as keyof typeof answers
                      ] === option
                    }
                    onChange={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [q.id]: option,
                      }))
                    }
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
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <input
            type="tel"
          placeholder="Phone Number *"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
        />

         <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

         <button
  className="pilot-submit"
  onClick={handleSubmit}
>
  Become an Insider.
</button>
        </section>

      </div>
    </main>
  );
}




