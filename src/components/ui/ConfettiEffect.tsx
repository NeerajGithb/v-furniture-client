"use client";

import { useEffect, useState } from "react";

export default function ConfettiEffect({
  duration = 3000,
}: {
  duration?: number;
}) {
  const [visible, setVisible] = useState(true);
  const [pieces, setPieces] = useState<
    Array<{ left: string; delay: string; size: string; color: string }>
  >([]);

  useEffect(() => {
    setPieces(
      Array.from({ length: 50 }, () => ({
        left: `${Math.random() * 100}vw`,
        delay: `${Math.random() * 2}s`,
        size: `${Math.random() * 8 + 6}px`,
        color: ["#22c55e", "#3b82f6", "#f43f5e", "#f59e0b", "#9333ea"][
          Math.floor(Math.random() * 5)
        ],
      })),
    );
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((piece, i) => {
        return (
          <span
            key={i}
            className="absolute top-0 animate-fall"
            style={{
              left: piece.left,
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              animationDelay: piece.delay,
              borderRadius: "2px",
              opacity: 0.9,
            }}
          />
        );
      })}
    </div>
  );
}
