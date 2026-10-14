"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function SiteChrome({ children, navigation, footer }: {
  children: ReactNode;
  navigation: ReactNode;
  footer: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === "/brief" || pathname.startsWith("/brief/")) {
    return <div id="main">{children}</div>;
  }
  return <>{navigation}<main id="main">{children}</main>{footer}</>;
}
