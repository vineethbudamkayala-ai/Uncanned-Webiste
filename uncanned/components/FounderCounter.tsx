"use client";

import { useEffect, useState } from "react";

const ENDPOINT =
  "https://script.google.com/macros/s/AKfycbwiUq0F0XaszN92aTVaOLwXR9VPh4MUKZN4eF42igu0IbwytKkrrFzP8LLf9wsCPLUaYA/exec";

export default function FounderCounter() {
  const [count, setCount] =
    useState<number | null>(null);

  const [total, setTotal] =
    useState<number>(500);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          ENDPOINT
        );

        const data =
          await res.json();
        //   console.log(data);

        if (
          typeof data?.founders ===
          "number"
        ) {
          setCount(data.founders);
        }

        if (
          typeof data?.total ===
          "number"
        ) {
          setTotal(data.total);
        }
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, []);

  if (count === null) return null;

 return (
  <p className="founder-count">
    {count} of {total} insiders in
  </p>
);
}