"use client";

import * as React from "react";

import { ProfileSectionSkeleton } from "@/components/dashboard/profile/profile-section-skeleton";
import { DashboardAppShell } from "@/components/layout/dashboard-app-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { formatDate } from "@/lib/i18n/formatters";
import { formatApiError } from "@/lib/i18n/format-api-error";
import { getPublicApiBaseUrl, isLiveAccountEnabled } from "@/lib/public-env";
import {
  DOCUMENTS_API_PATHS,
  downloadUserDocument,
  isDocumentReady,
  saveBlob,
  type UserDocument,
} from "@/services/documents.service";

const DOCUMENTS_HERO_VIDEO = "/videos/documents-hero.mp4";

function documentKindLabel(kind: string, t: (key: string) => string): string {
  const key = `documents.kind.${kind}`;
  const translated = t(key);
  return translated === key ? kind : translated;
}

export function DocumentsCenterContent() {
  const { accessToken, authorizedFetch, isAuthenticated } = useAuth();
  const { locale, t } = useI18n();
  const live = isLiveAccountEnabled() && isAuthenticated;
  const [items, setItems] = React.useState<UserDocument[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!live || !accessToken) {
      setLoading(false);
      return;
    }
    setError(null);
    void fetch(`${getPublicApiBaseUrl()}${DOCUMENTS_API_PATHS.list}`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw body;
        }
        return r.json();
      })
      .then((body: { items?: UserDocument[] }) => setItems(body.items ?? []))
      .catch((e) => setError(formatApiError(e, locale) || t("documents.loadError")))
      .finally(() => setLoading(false));
  }, [accessToken, live, locale, t]);

  async function handleDownload(id: string) {
    if (!live) return;
    setDownloadingId(id);
    try {
      const file = await downloadUserDocument(id, authorizedFetch);
      saveBlob(file.blob, file.filename);
    } catch (e) {
      setError(formatApiError(e, locale) || t("documents.downloadError"));
    } finally {
      setDownloadingId(null);
    }
  }

  if (!isAuthenticated) {
    return (
      <DashboardAppShell tone="dark" contentClassName="max-w-3xl">
        <p className="text-sm text-white/60">{t("documents.signInRequired")}</p>
      </DashboardAppShell>
    );
  }

  if (!live) {
    return (
      <DashboardAppShell tone="dark" contentClassName="max-w-3xl">
        <p className="text-sm text-amber-200/80">{t("documents.liveRequired")}</p>
      </DashboardAppShell>
    );
  }

  return (
    <DashboardAppShell tone="dark" contentClassName="max-w-3xl space-y-5 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px)]) sm:pb-10">
      <section className="relative isolate overflow-hidden rounded-2xl sm:rounded-[1.35rem]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <video
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-[12px] motion-reduce:hidden"
            src={DOCUMENTS_HERO_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/78 to-black" />
        </div>
        <div className="relative z-10 px-5 py-7 sm:px-6 sm:py-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{t("documents.page.title")}</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">{t("documents.page.subtitle")}</p>
        </div>
      </section>

      {loading ? <ProfileSectionSkeleton variant="list" rows={4} /> : null}
      {error ? (
        <p className="rounded-xl bg-red-950/80 px-4 py-3 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-10 text-center text-sm text-white/45">
          {t("documents.empty")}
        </p>
      ) : null}

      <ul className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
        {items.map((doc) => (
          <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div className="min-w-0">
              <p className="font-medium text-white">{documentKindLabel(doc.kind, t)}</p>
              <p className="text-xs text-white/45">
                {formatDate(doc.createdAt, locale)} / {doc.status}
              </p>
            </div>
            {isDocumentReady(doc.status) ? (
              <button
                type="button"
                disabled={downloadingId === doc.id}
                onClick={() => void handleDownload(doc.id)}
                className="shrink-0 text-sm font-medium text-white underline decoration-white/25 underline-offset-4 hover:decoration-white/60 disabled:opacity-50"
              >
                {downloadingId === doc.id ? t("documents.downloading") : t("documents.download")}
              </button>
            ) : (
              <span className="shrink-0 text-xs text-white/35">{doc.status}</span>
            )}
          </li>
        ))}
      </ul>
    </DashboardAppShell>
  );
}
