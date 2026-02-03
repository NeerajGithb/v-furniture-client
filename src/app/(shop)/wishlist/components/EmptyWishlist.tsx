"use client";

import { Heart } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmptyWishlistProps } from "@/types/wishlist";

export const EmptyWishlist = ({ loading }: EmptyWishlistProps) => {
  return (
    <EmptyState
      icon={Heart}
      title="Your wishlist is empty"
      description="Save items you love to easily find them later."
      actionLabel="Start Shopping"
      actionHref="/products"
      loading={loading}
    />
  );
};
