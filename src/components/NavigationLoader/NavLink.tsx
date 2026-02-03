"use client";

import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { navigationLoader } from "./navigationLoader";

interface NavLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const NavLink = ({
  href,
  children,
  onClick,
  ...props
}: NavLinkProps) => {
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const targetUrl = typeof href === "string" ? href : href.pathname || "";
    const currentUrl = pathname;

    if (
      targetUrl !== currentUrl &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.shiftKey &&
      e.button === 0
    ) {
      navigationLoader.start();
    }

    onClick?.(e);
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
};
