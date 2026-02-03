"use client";

import Image from "next/image";
import { memo, useCallback, useState } from "react";

interface AvatarProps {
  src?: string;
  alt?: string;
  fallbackText?: string;
}

export const Avatar = memo(({ src, alt, fallbackText }: AvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const handleError = useCallback(() => setImageError(true), []);

  if (!src || imageError) {
    return (
      <div className="w-8 h-8 min-h-8 min-w-8 bg-black dark:bg-white rounded-full flex items-center justify-center text-xs font-normal text-white dark:text-black">
        {fallbackText || "U"}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt || "Avatar"}
      width={28}
      height={28}
      className="w-7 min-h-7 min-w-7 h-7 rounded-full object-cover aspect-square"
      onError={handleError}
    />
  );
});

Avatar.displayName = "Avatar";
