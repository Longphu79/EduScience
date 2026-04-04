"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { nprogress } from "@mantine/nprogress";

export function NavigationProgressListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleClick = (event) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const anchor = target.closest("a");
      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href");
      const targetAttr = anchor.getAttribute("target");

      if (!href || href.startsWith("#") || targetAttr === "_blank" || event.metaKey || event.ctrlKey) {
        return;
      }

      if (href.startsWith("/")) {
        nprogress.start();
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  useEffect(() => {
    nprogress.complete();
  }, [pathname, searchParams]);

  return null;
}
