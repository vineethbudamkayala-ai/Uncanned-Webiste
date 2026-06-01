"use client";

export default function Footer() {
  return (
    <footer className="strip">
      <span className="strip-left">
        © 2026 Uncanned · Opening 07.2026 · India
      </span>

      <span className="strip-right">
        <a
          href="https://www.instagram.com/drinkuncanned"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram
        </a>

        <span className="dot">·</span>

        <a
          href="https://x.com/drink_uncanned"
          target="_blank"
          rel="noopener noreferrer"
        >
          X
        </a>

        <span className="dot">·</span>

        <button
          type="button"
          onClick={() =>
            document.dispatchEvent(
              new CustomEvent(
                "openPrivacy"
              )
            )
          }
        >
          Privacy
        </button>

        <span className="dot">·</span>

        <button
          type="button"
          onClick={() =>
            document.dispatchEvent(
              new CustomEvent(
                "openTerms"
              )
            )
          }
        >
          Terms
        </button>

        <span className="dot">·</span>

        <a href="mailto:hello@uncanned.in">
          hello@uncanned.in
        </a>
      </span>
    </footer>
  );
}