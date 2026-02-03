import { useState, useEffect } from "react";

const PLACEHOLDERS = [
  "Search furniture, sofas, beds...",
  "Find dining sets, chairs...",
  "Discover office furniture...",
  "Explore home decor items...",
  "Search by brand, style, color...",
];

export const usePlaceholder = () => {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const phrase = PLACEHOLDERS[phraseIndex];

    const timeout = setTimeout(
      () => {
        if (isDeleting) {
          setText(phrase.substring(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);
        } else {
          setText(phrase.substring(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);
        }

        if (!isDeleting && charIndex === phrase.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }

        if (isDeleting && charIndex === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        }
      },
      isDeleting ? 40 : 100,
    );

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex]);

  return text;
};
