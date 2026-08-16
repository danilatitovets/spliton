"use client";

/** Soft content transition without remounting the whole admin section on every tab. */
export default function AdminPortalTemplate({ children }: { children: React.ReactNode }) {
  return <div className="min-h-full animate-in fade-in duration-200">{children}</div>;
}
