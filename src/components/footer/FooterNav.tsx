"use client";

import { useState } from "react";
import { NavLink } from "@/components/NavigationLoader";
import {
  ChevronDown,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Tag,
  Gift,
  Phone,
  Truck,
  RotateCcw,
  ShieldCheck,
  Ruler,
  HelpCircle,
} from "lucide-react";
import { Category } from "@/types/Product";

interface Props {
  categories: Category[];
  loading: boolean;
}

const SHOP_LINKS = [
  { label: "All Products", href: "/products", icon: ShoppingBag },
  { label: "New Arrivals", href: "/products/new", icon: Sparkles },
  { label: "Best Sellers", href: "/products/best", icon: TrendingUp },
  { label: "Sale", href: "/products/sale", icon: Tag },
  { label: "Gift Cards", href: "/gift-cards", icon: Gift },
];

const CARE_LINKS = [
  { label: "Contact Us", href: "/contact", icon: Phone },
  { label: "Track Order", href: "/track-order", icon: Truck },
  { label: "Returns", href: "/returns", icon: RotateCcw },
  { label: "Shipping", href: "/shipping", icon: Truck },
  { label: "Warranty", href: "/warranty", icon: ShieldCheck },
  { label: "Size Guide", href: "/size-guide", icon: Ruler },
  { label: "FAQs", href: "/faqs", icon: HelpCircle },
];

export const FooterNav = ({ categories, loading }: Props) => {
  const [expanded, setExpanded] = useState({
    shop: false,
    categories: false,
    care: false,
  });

  const toggle = (key: keyof typeof expanded) => {
    setExpanded({
      shop: false,
      categories: false,
      care: false,
      [key]: !expanded[key],
    });
  };

  const visibleCategories = categories.slice(0, 5);
  const remaining = categories.length - visibleCategories.length;

  /* ===== PREMIUM HIGH-CONTRAST STYLES ===== */
  const linkBase =
    "group flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors";

  const iconBase =
    "w-3.5 h-3.5 text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors";

  return (
    <>
      {/* ================= DESKTOP ================= */}
      <div className="hidden lg:grid grid-cols-3 gap-10">
        {/* Categories */}
        <div>
          <h3 className="mb-3 text-xs font-semibold tracking-wide text-black dark:text-white uppercase">
            Categories
          </h3>
          <ul className="space-y-2">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <li
                  key={i}
                  className="h-3 w-24 rounded bg-gray-300 dark:bg-gray-700 animate-pulse"
                />
              ))
            ) : (
              <>
                {visibleCategories.map((cat) => (
                  <li key={cat._id}>
                    <NavLink
                      href={`/${cat.slug}`}
                      className="text-xs text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                      {cat.name}
                    </NavLink>
                  </li>
                ))}

                {remaining > 0 && (
                  <li className="pt-1">
                    <NavLink
                      href="/products"
                      className="text-xs font-semibold text-black dark:text-white hover:underline"
                    >
                      View all ({remaining})
                    </NavLink>
                  </li>
                )}
              </>
            )}
          </ul>
        </div>

        {/* Shop */}
        <div>
          <h3 className="mb-3 text-xs font-semibold tracking-wide text-black dark:text-white uppercase">
            Shop
          </h3>
          <ul className="space-y-2">
            {SHOP_LINKS.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <NavLink href={href} className={linkBase}>
                  <Icon className={iconBase} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h3 className="mb-3 text-xs font-semibold tracking-wide text-black dark:text-white uppercase">
            Customer Care
          </h3>
          <ul className="space-y-2">
            {CARE_LINKS.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <NavLink href={href} className={linkBase}>
                  <Icon className={iconBase} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="lg:hidden divide-y divide-gray-300 dark:divide-gray-700">
        {[
          { key: "shop", title: "Shop", items: SHOP_LINKS },
          {
            key: "categories",
            title: "Categories",
            items: visibleCategories.map((c) => ({
              label: c.name,
              href: `/${c.slug}`,
            })),
          },
          { key: "care", title: "Customer Care", items: CARE_LINKS },
        ].map((section) => {
          const isOpen = expanded[section.key as keyof typeof expanded];

          return (
            <div key={section.key} className="py-3">
              <button
                onClick={() => toggle(section.key as keyof typeof expanded)}
                className="flex w-full items-center justify-between"
              >
                <span className="text-xs font-semibold text-black dark:text-white uppercase">
                  {section.title}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-black dark:text-white transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100 mt-3"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <ul className="overflow-hidden space-y-2">
                  {section.items.map((item: any) => (
                    <li key={item.label}>
                      <NavLink
                        href={item.href}
                        className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                      >
                        {item.icon && (
                          <item.icon className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                        )}
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
