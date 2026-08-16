import { Suspense } from "react";

import { AssetsPositionDetailContent } from "@/components/dashboard/assets/assets-position-detail-content";
import { assetsPositionDetailPath } from "@/constants/routes";
import { getReleaseDetailPageData } from "@/lib/analytics/release-detail";
import { getHoldingPreviewForCatalogReleaseId } from "@/lib/assets/holdings";
import { pageMetaAsync, pageMetaTfAsync } from "@/lib/i18n/page-metadata";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const holding = getHoldingPreviewForCatalogReleaseId(id);
  const release = getReleaseDetailPageData(holding?.catalogReleaseId ?? id);
  if (release) {
    const meta = await pageMetaTfAsync(
      "meta.positionDetail.titleWithRelease",
      "meta.positionDetail.descriptionWithRelease",
      { title: release.row.release, artist: release.row.artist ?? "" },
    );
    return { ...meta, alternates: { canonical: assetsPositionDetailPath(id) } };
  }
  return pageMetaAsync("meta.positionDetail.title", "meta.positionDetail.description");
}

function PositionDetailFallback() {
  return (
    <div className="min-h-[70vh] bg-black">
      <div className="mx-auto max-w-[1200px] space-y-4 px-4 py-8 sm:px-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-white/10" />
        <div className="h-64 animate-pulse rounded-2xl bg-white/10" />
        <div className="h-40 animate-pulse rounded-2xl bg-white/10" />
      </div>
    </div>
  );
}

export default async function AssetsPositionDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<PositionDetailFallback />}>
      <AssetsPositionDetailContent id={id} />
    </Suspense>
  );
}
