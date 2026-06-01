"use client";

type Props = {
  joke: [string, string][];
  visibleLines: number;
  typingSide: string | null;
  fizzed: boolean;
  revealed: boolean;
};

export default function JokeChat({
  joke,
  visibleLines,
  typingSide,
  fizzed,
  revealed,
}: Props) {
  return (
    <div
      className={`
        chat
        ${fizzed ? "fizz" : ""}
        ${revealed ? "chat-exit" : ""}
      `}
    >
      {joke
        .slice(0, visibleLines)
        .map((line, index) => (
          <div
            key={index}
            className={`
              bub
              bub-${line[0]}
              show
            `}
          >
            {line[1]}
          </div>
        ))}

      {typingSide && (
        <div
          className={`
            typing
            typing-${typingSide}
            show
          `}
        >
          <span />
          <span />
          <span />
        </div>
      )}
    </div>
  );
}