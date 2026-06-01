"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "What exactly is Uncanned?",
    a: "Uncanned is a naturally uplifting, creatively refreshing soda — real ingredients, no pretence. Not coffee, not alcohol, not kombucha. "
  },
  {
    q: "What does becoming an Insider get me?",
    a: "Insiders get cans from the very first 500-can batch, a name in the run, and a direct line into how the next batch gets made."
  },
  {
    q: "When and where can I buy it?",
    a: "The first batch opens in 07.2026 in India. Insiders are served first; wider availability follows after the initial drop. "
  },
  {
    q: "Is it alcoholic? Caffeinated? Sugary?",
    a: "No alcohol. The full ingredient and nutrition breakdown — caffeine and sugar included — publishes ahead of the drop. "
  },
  {
    q: "How do I get in touch?",
    a: "Email hello@uncanned.in, or find us on Instagram and X. We read everything. "
  },
];

export default function FAQModal() {
  const [open, setOpen] =
    useState<number[]>([]);

  function toggle(i: number) {
    setOpen((prev) =>
      prev.includes(i)
        ? prev.filter(
            (x) => x !== i
          )
        : [...prev, i]
    );
  }

  return (
    <div className="faq-list">
      {FAQS.map((faq, i) => (
        <div
          key={i}
          className="faq-item"
        >
          <button
            className="faq-question"
            onClick={() =>
              toggle(i)
            }
          >
            {faq.q}

            <span className="faq-icon">
              {open.includes(i)
                ? "×"
                : "+"}
            </span>
          </button>

          {open.includes(i) && (
            <div className="faq-answer">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}