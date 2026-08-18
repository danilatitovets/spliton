"use client";

import Link from "next/link";

import { useAuthUi } from "@/hooks/use-auth-ui";
import { ROUTES } from "@/constants/routes";

type DashboardRegisterOrCabinetLinkProps = {
  className?: string;
  guestLabel?: string;
  guestHref?: string;
  authLabel?: string;
  authHref?: string;
};

export function DashboardRegisterOrCabinetLink({
  className,
  guestLabel = "Регистрация",
  guestHref = ROUTES.register,
  authLabel = "К портфелю",
  authHref = ROUTES.dashboardOverview,
}: DashboardRegisterOrCabinetLinkProps) {
  const { pending, authenticated } = useAuthUi();

  if (pending) {
    return (
      <span className={className} aria-hidden>
        <span className="inline-block h-[1.1em] w-24 animate-pulse rounded bg-white/10" />
      </span>
    );
  }

  if (authenticated) {
    return (
      <Link href={authHref} className={className}>
        {authLabel}
      </Link>
    );
  }

  return (
    <Link href={guestHref} className={className}>
      {guestLabel}
    </Link>
  );
}
