"use client";

import { useEffect, useRef, useState } from "react";

type Speaker = "uncanned" | "you";

type JokeLine = [Speaker, string];

const JOKES: JokeLine[][] = [
  [
    ["uncanned", "knock, knock."],
    ["you", "who's there?"],
    ["uncanned", "un—"],
    ["you", "un who?"],
    ["uncanned", "exactly. that's kind of the problem."],
  ],
  [
    ["uncanned", "we built a soda."],
    ["you", "love that. can i buy one?"],
    ["uncanned", "that's the part we're still working on."],
  ],
  [
    ["uncanned", "ask us anything."],
    ["you", "when does it launch?"],
    ["uncanned", "anything except that."],
  ],
  [
    ["uncanned", "most cans tell you what's inside."],
    ["you", "and yours?"],
    ["uncanned", "ours mostly tells you what isn't."],
  ],
  [
    ["uncanned", "we ran a focus group."],
    ["you", "and?"],
    ["uncanned", "everyone agreed soda was a drink. we took notes."],
  ],
  [
    ["you", "so... what's an un?"],
    ["uncanned", "a no, said with hospitality."],
    ["you", "that's not an answer."],
    ["uncanned", "exactly."],
  ],
];

export function useJokeSequence() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [typingSide, setTypingSide] =
    useState<Speaker | null>(null);

  const [fizzed, setFizzed] = useState(false);

  const [revealed, setRevealed] =
    useState(false);

  const [heroReveal, setHeroReveal] =
    useState(false);

  const [showSkip, setShowSkip] =
    useState(false);

  const timers = useRef<number[]>([]);

  const [joke] = useState(() => {
    let idx = Math.floor(
      Math.random() * JOKES.length
    );

    try {
      const prev = Number(
        localStorage.getItem("unc_joke")
      );

      if (
        JOKES.length > 1 &&
        idx === prev
      ) {
        idx = (idx + 1) % JOKES.length;
      }

      localStorage.setItem(
        "unc_joke",
        String(idx)
      );
    } catch {}

    return JOKES[idx];
  });

  const skip = () => {
    timers.current.forEach(clearTimeout);

    setTypingSide(null);
    setVisibleLines(joke.length);

    // after final joke bubble

    setTimeout(() => {
      setFizzed(true);
    }, 3000);

    setTimeout(() => {
      setRevealed(true);
    }, 3000);

    setTimeout(() => {
      setHeroReveal(true);
    }, 3000);
  };

  useEffect(() => {
    let t = 450;

    const GAP = 1150;
    const TYPE = 720;

    joke.forEach((line, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setTypingSide(line[0]);
        }, t)
      );

      timers.current.push(
        window.setTimeout(() => {
          setTypingSide(null);

          setVisibleLines(i + 1);
        }, t + TYPE)
      );

      t += GAP;
    });

    const lastAt =
      t - GAP + TYPE;

    const fizzAt =
      lastAt + 3000;

    const punchAt =
      fizzAt + 1300;

    const revealAt =
      punchAt + 1400;

    timers.current.push(
      window.setTimeout(
        () => setShowSkip(true),
        950
      )
    );

    timers.current.push(
      window.setTimeout(
        () => setFizzed(true),
        fizzAt
      )
    );

    timers.current.push(
      window.setTimeout(
        () => setRevealed(true),
        punchAt
      )
    );

    timers.current.push(
      window.setTimeout(
        () => setHeroReveal(true),
        revealAt
      )
    );

    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, [joke]);

  return {
    joke,
    visibleLines,
    typingSide,
    fizzed,
    revealed,
    heroReveal,
    showSkip,
    skip,
  };
}