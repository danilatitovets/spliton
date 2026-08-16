import { PayoutsComparisonPageContent } from "@/components/dashboard/assets/payouts-comparison-page-content";
import { pageMeta } from "@/lib/i18n/page-metadata";

export const metadata = pageMeta("meta.payouts.comparison.title", "meta.payouts.comparison.description");

export default function AssetsPayoutsComparisonPage() {
  return (
    <div className="pb-8">
      <PayoutsComparisonPageContent />
    </div>
  );
}
