import type * as React from "react";

import { cn } from "@/lib/utils";

type AuthSplitLayoutProps = {
  brand: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function AuthSplitLayout({
  brand,
  children,
  className,
}: AuthSplitLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-dvh w-full bg-black lg:grid lg:min-h-dvh lg:grid-cols-2",
        className
      )}
    >
      <div className="min-h-0 lg:min-h-dvh">{brand}</div>

      <div className="flex min-h-[calc(100dvh-260px)] items-center justify-center bg-white px-6 py-10 sm:px-12 lg:min-h-dvh lg:px-16 lg:py-16">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
