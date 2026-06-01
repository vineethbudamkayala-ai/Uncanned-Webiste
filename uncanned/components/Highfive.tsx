"use client";

export default function HighFive() {
  return (
    <div className="highfive-doodle">
      <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">

        {/* ── LEFT PERSON ── */}
        <circle cx="32" cy="26" r="8" fill="#FFEDBB" />
        <path d="M32 34 L32 62" stroke="#FFEDBB" strokeWidth="3" strokeLinecap="round" />
        <path d="M32 42 L26 58" stroke="#FFEDBB" strokeWidth="3" strokeLinecap="round" />
        <path d="M32 80 L24 105" stroke="#FFEDBB" strokeWidth="3" strokeLinecap="round" />
        <path d="M32 80 L40 105" stroke="#FFEDBB" strokeWidth="3" strokeLinecap="round" />
        <path d="M32 62 L32 80" stroke="#FFEDBB" strokeWidth="3" strokeLinecap="round" />
        {/* left person arm raised — ends at hand */}
        <path d="M32 42 L68 24" stroke="#FFEDBB" strokeWidth="3" strokeLinecap="round" />
        {/* left hand — open palm, fingers pointing right-up */}
        <g className="hf-left-hand">
          <path d="M68 24 L72 18 M68 24 L74 22 M68 24 L74 27 M68 24 L72 31" stroke="#FFEDBB" strokeWidth="1.8" strokeLinecap="round" />
        </g>

        {/* ── RIGHT PERSON ── */}
        <circle cx="148" cy="26" r="8" fill="#FFEDBB" />
        <path d="M148 34 L148 62" stroke="#FFEDBB" strokeWidth="3" strokeLinecap="round" />
        <path d="M148 42 L154 58" stroke="#FFEDBB" strokeWidth="3" strokeLinecap="round" />
        <path d="M148 80 L140 105" stroke="#FFEDBB" strokeWidth="3" strokeLinecap="round" />
        <path d="M148 80 L156 105" stroke="#FFEDBB" strokeWidth="3" strokeLinecap="round" />
        <path d="M148 62 L148 80" stroke="#FFEDBB" strokeWidth="3" strokeLinecap="round" />
        {/* right person arm raised — ends at hand */}
        <path d="M148 42 L112 24" stroke="#FFEDBB" strokeWidth="3" strokeLinecap="round" />
        {/* right hand — open palm, fingers pointing left-up */}
        <g className="hf-right-hand">
          <path d="M112 24 L108 18 M112 24 L106 22 M112 24 L106 27 M112 24 L108 31" stroke="#FFEDBB" strokeWidth="1.8" strokeLinecap="round" />
        </g>

        {/* ── IMPACT SPARK ── */}
        <g className="hf-spark">
          <line x1="90" y1="17" x2="90" y2="8"  stroke="#FFEDBB" strokeWidth="2" strokeLinecap="round" />
          <line x1="83" y1="20" x2="77" y2="13" stroke="#FFEDBB" strokeWidth="2" strokeLinecap="round" />
          <line x1="97" y1="20" x2="103" y2="13" stroke="#FFEDBB" strokeWidth="2" strokeLinecap="round" />
          <line x1="80" y1="26" x2="73" y2="24" stroke="#FFEDBB" strokeWidth="2" strokeLinecap="round" />
          <line x1="100" y1="26" x2="107" y2="24" stroke="#FFEDBB" strokeWidth="2" strokeLinecap="round" />
        </g>

      </svg>
    </div>
  );
}