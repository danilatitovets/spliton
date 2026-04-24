import type { Metadata } from "next";

import { CalculatorPageContent } from "@/components/dashboard/assets/calculator-page-content";
import { PayoutsSubpageHero } from "@/components/dashboard/assets/payouts-subpage-hero";

export const metadata: Metadata = {
  title: "Калькулятор",
  description: "Инструменты RevShare: покупка и продажа units, вывод USDT (TRC20) и иллюстративная оценка начислений.",
};

export default function AssetsCalculatorPage() {
  return (
    <div className="space-y-8 pb-8 sm:space-y-10 sm:pb-10">
      <PayoutsSubpageHero
        eyebrow="RevShare · USDT · TRC20"
        title="Калькулятор"
        description="Сервисные сценарии по операциям в кабинете: оценка покупки units, вторичной продажи, вывода и пример распределения по введённым значениям. Расчёты ориентировочные."
      />

      <CalculatorPageContent />
    </div>
  );
}
