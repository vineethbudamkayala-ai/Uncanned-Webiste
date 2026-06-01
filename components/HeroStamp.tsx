"use client";

import { useEffect, useState } from "react";

const WORDS = [
  "COOKING",
  "THINKING",
  "DELAYING",
  "FIGURING IT OUT",
  "TRYING",
  "WORKING ON IT",
];

export default function HeroStamp() {
  const [word, setWord] =
    useState(WORDS[0]);

  const [restamp, setRestamp] =
    useState(false);

  useEffect(() => {
    const interval =
      setInterval(() => {
        setRestamp(true);

        setTimeout(() => {
          setWord((prev) => {
            const idx =
              WORDS.indexOf(prev);

            return WORDS[
              (idx + 1) %
                WORDS.length
            ];
          });
        }, 350);

        setTimeout(() => {
          setRestamp(false);
        }, 1000);
      }, 9000);

    return () =>
      clearInterval(interval);
  }, []);

  return (
    <svg
      className={`hero-stamp ${
        restamp
          ? "restamp"
          : ""
      }`}
      viewBox="0 0 300 150"
    >
      <rect
        x="10"
        y="10"
        width="280"
        height="130"
        fill="none"
        stroke="#BD6537"
        strokeWidth="4"
      />

      <text
        x="150"
        y="55"
        textAnchor="middle"
        fill="#BD6537"
        fontSize="24"
      >
        STILL
      </text>

      <text
        id="stamp-word"
        x="150"
        y="95"
        textAnchor="middle"
        fill="#BD6537"
        fontSize="24"
      >
        {word}
      </text>
    </svg>
  );
}