import type { Metadata } from "next";
import Image from "next/image";

import { UntExplainer } from "@/components/shared/unt-explainer";

export const metadata: Metadata = {
  title: "Что такое UNT",
  description: "Объяснение внутренней единицы UNT внутри Spliton.",
};

export default function AssetsUntPage() {
  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2">
      <div className="relative min-h-dvh bg-[#f5f5f5]">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(52vh,520px)] overflow-hidden" aria-hidden>
          <Image
            src="/images/fees/back.png"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-[1320px] px-4 pt-4 pb-8 sm:px-6 sm:pt-6 lg:px-8">
          <section className="scroll-mt-24">
            <UntExplainer />
          </section>
        </div>
      </div>
    </div>
  );
}

