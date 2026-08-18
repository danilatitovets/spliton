"use client";

import { LocalizedErrorScreen } from "@/components/i18n/localized-error-screen";

type RouteErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RouteErrorPage({ error, reset }: RouteErrorPageProps) {
  return <LocalizedErrorScreen error={error} reset={reset} />;
}
