import * as React from "react";

import { cn } from "@/lib/utils";

import { GuideSectionHeader } from "./guide-section-header";

export function GuideSectionShell({
  id,
  title,
  subtitle,
  headerAlign = "center",
  children,
  className,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  headerAlign?: "center" | "left";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} data-guide-section className={cn("scroll-mt-24", className)}>
      <GuideSectionHeader title={title} subtitle={subtitle} align={headerAlign} />
      <div className="mt-3 md:mt-4">{children}</div>
    </section>
  );
}
