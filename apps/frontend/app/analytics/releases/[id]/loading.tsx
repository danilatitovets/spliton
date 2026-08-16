import { SplitonLoadingView } from "@/components/ui/spliton-loader";

/** Content-only loader — header stays in page/layout (no remount). */
export default function AnalyticsReleaseDetailLoading() {
  return (
    <SplitonLoadingView
      variant="dark"
      size="lg"
      minHeight="min-h-[40vh]"
      labelKey="common.loading.releaseAnalytics"
      className="bg-black"
    />
  );
}
