"use client";

import Navbar from "./Navbar";
import { useJokeSequence } from "@/hooks/useJokeSequence";
import HeroStamp from "./HeroStamp";
import JokeChat from "./JokeChat";
import { useState } from "react";
import Modal from "./Modal";
import FounderCounter from "./FounderCounter";
import FAQModal from "./FAQModal";
import WaitlistForm from "./WaitlistForm";
import { useRouter } from "next/navigation";
import StickerLayer from "./StickerLayer";

export default function Hero() {
  const router = useRouter();
  const {
    joke,
    visibleLines,
    typingSide,
    fizzed,
    revealed,
    heroReveal,
    showSkip,
    skip,
  } = useJokeSequence();

  const [modal, setModal] = useState<
  "un" | "faq" | "waitlist" | null
    >(null);

  return (
    <section
      className="hero"
      id="hero"
    >
      {/* <HeroVideoBackground /> */}
      <Navbar
    onUn={() => setModal("un")}
    onFaq={() => setModal("faq")}
     onAccess={() => setModal("waitlist")}
  />

      {/* BUBBLES */}

   <div className="ambient-bubbles">
  {[
    [12, 2, 14],
    [24, 6, 18],
    [35, 1, 12],
    [42, 4, 16],
    [51, 8, 20],
    [58, 3, 15],
    [64, 7, 19],
    [71, 5, 13],
    [78, 9, 21],
    [84, 2, 17],
    [90, 6, 14],
    [18, 8, 22],
    [47, 1, 16],
    [67, 5, 18],
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

      <div className="fizz-bubbles">
        {Array.from({
          length: 8,
        }).map((_, i) => (
          <div
            key={i}
            className="fizz-bub"
          />
        ))}
      </div>

      <button
      className={`
        hero-skip
        ${showSkip ? "show" : ""}
        ${heroReveal ? "gone" : ""}
      `}
      onClick={skip}
    >
      Skip the Joke →
    </button>

      {/* HERO */}

      <div className="hero-stage">

<JokeChat
  joke={joke}
  visibleLines={visibleLines}
  typingSide={typingSide}
  fizzed={fizzed}
  revealed={revealed}
/>

  {revealed && (
    <div className="hero-joke revealed">
      <h1
          id="hero-h"
          className="hero-joke-punch"
        >
          <span className="headline-line">
            Just like any good joke,
          </span>

          <br />

          <span className="headline-line">
  we need some time to get&nbsp;{" "}this
</span>

          <br />

          <span className="headline-line">
            <span className="accent">
              up and running.
            </span>
          </span>
        </h1>
    </div>
  )}

  {heroReveal && (
    <div className="hero-reveal show">
      <p className="hero-sub">
        in the meantime, join the first
        500 insiders. opening 07.2026.
      </p>

      <div className="hero-ctas">
            <button
        className="btn btn-primary"
        onClick={() =>
          router.push("/pilot")
        }
      >
        Become an Insider
      </button>
         {/* <FounderCounter /> */}
      </div>
    </div>
  )}

</div>

      {/* STAMP */}

<Modal
  open={modal === "un"}
  onClose={() => setModal(null)}
  title="What's an un?"
>
  <div className="modal-body">
    <p>
      Three un-things. They're how
      we tell the difference between
      us and most drinks.
    </p>

    <div className="un-point">
      <p>
        <strong>Un-complicated.</strong>
        {" "}
        Just the things that belong in a drink. Nothing that's there to make the label longer.
      </p>
    </div>

    <div className="un-point">
      <p>
        <strong>Un-apologetic.</strong>
        {" "}
        We don't pretend to be coffee. Or alcohol. Or kombucha. We're a soda. A good one.
      </p>
    </div>

    <div className="un-point">
      <p>
        <strong>Un-filtered.</strong>
        {" "}
        Real ingredients. Real taste. Real opinions about every other drink we've ever met.
      </p>
    </div>

    <div className="un-tagline">
      <span className="green">
        Less canned.
      </span>
      <span className="orange">
        More real.
      </span>
    </div>
  </div>
</Modal>

<Modal
  open={modal === "faq"}
  onClose={() => setModal(null)}
  title="Things you'll want to know."
>
  <FAQModal />
</Modal>

<Modal
  open={modal === "waitlist"}
  onClose={() => setModal(null)}
  title="Notify me when we're live"
>
  <WaitlistForm />
</Modal>
<StickerLayer visible={heroReveal} />
     <HeroStamp />
    </section>
  );
}