"use client";

import Image from "next/image";

type NavbarProps = {
  onUn: () => void;
  onFaq: () => void;
  onAccess: () => void;
};

export default function Navbar({
  onUn,
  onFaq,
  onAccess,
}: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo">
          <Image
            src="/images/uncanned-logo.png"
            alt="Uncanned"
            width={140}
            height={40}
            priority
          />
        </div>

        <div className="navbar-actions">
          <button
            className="nav-pill"
            onClick={onUn}
          >
            What's an un?
          </button>

          <button
            className="nav-pill"
            onClick={onFaq}
          >
            FAQ
          </button>

          <button
            className="nav-pill nav-pill-primary"
            onClick={onAccess}
          >
            Early Access
          </button>
        </div>
      </div>
    </nav>
  );
}