"use client";

import { useEffect, useState } from "react";

import { useAuthUi } from "@/hooks/use-auth-ui";
import { useI18n } from "@/components/providers/i18n-provider";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { ROUTES } from "@/constants/routes";
import { tf } from "@/lib/i18n/financial-messages";

export function FooterRegisterQr() {
  const { authenticated, pending, user } = useAuthUi();
  const { t } = useI18n();
  const [qrTargetUrl, setQrTargetUrl] = useState<string>(ROUTES.register);

  useEffect(() => {
    if (pending) return;
    const path = authenticated ? ROUTES.dashboard : ROUTES.register;
    setQrTargetUrl(`${window.location.origin}${path}`);
  }, [authenticated, pending]);

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrTargetUrl)}`;

  const displayName = user?.profile?.displayName?.trim();
  const greeting = displayName
    ? tf(t("footer.qr.authenticated.greetingNamed"), { name: displayName })
    : t("footer.qr.authenticated.greeting");

  if (pending) {
    return (
      <div className="flex min-h-[22rem] flex-col items-stretch rounded-2xl bg-[#0a0a0a] p-6 sm:p-8 lg:max-w-[320px] lg:justify-self-end" aria-busy="true">
        <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
        <div className="mt-4 h-8 w-48 animate-pulse rounded bg-white/10" />
        <div className="mt-3 h-12 w-full animate-pulse rounded bg-white/10" />
        <div className="mt-6 h-12 w-full animate-pulse rounded-full bg-white/10" />
      </div>
    );
  }

  if (authenticated) {
    return (
      <div className="flex flex-col items-stretch rounded-2xl bg-[#0a0a0a] p-6 sm:p-8 lg:max-w-[320px] lg:justify-self-end">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          {t("footer.qr.authenticated.eyebrow")}
        </p>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">{greeting}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          {t("footer.qr.authenticated.description")}
        </p>
        <SplitonCtaPill href={ROUTES.dashboard} tone="onDark" className="mt-6 h-12 w-full">
          {t("footer.qr.authenticated.cta")}
        </SplitonCtaPill>
        <div className="mt-8 flex justify-center rounded-xl bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- внешний QR */}
          <img
            src={qrSrc}
            alt={t("footer.qr.authenticated.qrAlt")}
            width={168}
            height={168}
            className="size-[168px]"
          />
        </div>
        <p className="mt-4 text-center text-[11px] leading-snug text-zinc-600">
          {t("footer.qr.authenticated.qrHint")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-stretch rounded-2xl bg-[#0a0a0a] p-6 sm:p-8 lg:max-w-[320px] lg:justify-self-end">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
        {t("footer.qr.guest.eyebrow")}
      </p>
      <h3 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
        {t("footer.qr.guest.title")}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">{t("footer.qr.guest.description")}</p>
      <SplitonCtaPill href={ROUTES.register} tone="onDark" className="mt-6 h-12 w-full">
        {t("footer.qr.guest.cta")}
      </SplitonCtaPill>
      <div className="mt-8 flex justify-center rounded-xl bg-white p-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- внешний QR */}
        <img src={qrSrc} alt={t("footer.qr.guest.qrAlt")} width={168} height={168} className="size-[168px]" />
      </div>
      <p className="mt-4 text-center text-[11px] leading-snug text-zinc-600">{t("footer.qr.guest.qrHint")}</p>
    </div>
  );
}
