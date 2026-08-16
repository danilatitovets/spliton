import { PayoutsOverviewPageContent } from "@/components/dashboard/assets/payouts-overview-page-content";
import { pageMetaAsync } from "@/lib/i18n/page-metadata";

export async function generateMetadata() {
  return pageMetaAsync("meta.payouts.title", "meta.payouts.description");
}

export default function AssetsPayoutsPage() {
  return <PayoutsOverviewPageContent />;
}
