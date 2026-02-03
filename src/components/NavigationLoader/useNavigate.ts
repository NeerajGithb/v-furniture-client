import { useRouter, usePathname } from "next/navigation";
import { navigationLoader } from "./navigationLoader";

export const useNavigate = () => {
  const router = useRouter();
  const pathname = usePathname();

  const push = (href: string, options?: { scroll?: boolean }) => {
    if (href !== pathname) {
      navigationLoader.start();
    }
    router.push(href, options);
  };

  const replace = (href: string, options?: { scroll?: boolean }) => {
    if (href !== pathname) {
      navigationLoader.start();
    }
    router.replace(href, options);
  };

  const back = () => {
    navigationLoader.start();
    router.back();
  };

  const forward = () => {
    navigationLoader.start();
    router.forward();
  };

  return {
    push,
    replace,
    back,
    forward,
    refresh: router.refresh,
    prefetch: router.prefetch,
  };
};
