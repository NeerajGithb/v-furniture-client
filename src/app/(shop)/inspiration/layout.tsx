import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Room Inspirations",
  description:
    "Discover curated room inspirations and complete furniture looks you can shop instantly. Get inspired for your living room, bedroom, dining room and more.",
};

export default function InspirationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
