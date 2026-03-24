import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Furniture Categories",
  description:
    "Browse all furniture categories – sofas, beds, dining, storage, outdoor and more. Find the perfect piece for every room.",
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
