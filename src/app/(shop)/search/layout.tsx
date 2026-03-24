import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Furniture",
  description: "Search our full range of premium furniture. Find sofas, beds, tables, chairs and more.",
  robots: { index: false, follow: false },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
