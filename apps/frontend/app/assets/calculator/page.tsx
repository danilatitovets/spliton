import { CalculatorPageContent } from "@/components/dashboard/assets/calculator-page-content";
import { CalculatorPageHero } from "@/components/dashboard/assets/calculator-page-hero";
import { pageMeta } from "@/lib/i18n/page-metadata";

export const metadata = pageMeta("meta.calculator.title", "meta.calculator.description");

export default function AssetsCalculatorPage() {
  return (
    <div className="space-y-4 pb-8 sm:space-y-5">
      <CalculatorPageHero />
      <CalculatorPageContent />
    </div>
  );
}
