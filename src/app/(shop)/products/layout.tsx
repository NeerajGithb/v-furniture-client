import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Furniture Products",
  description:
    "Shop our complete range of premium furniture. Filter by category, price, material and more. Free delivery available.",
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
