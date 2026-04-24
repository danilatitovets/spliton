"use client";

import { ReleaseParametersCardExplainer } from "./release-parameters-card-explainer";
import { ReleaseParametersExample } from "./release-parameters-example";
import { ReleaseParametersFaq } from "./release-parameters-faq";
import { ReleaseParametersGrid } from "./release-parameters-grid";
import { ReleaseParametersHero } from "./release-parameters-hero";
import { ReleaseParametersInPageNav } from "./release-parameters-in-page-nav";
import { ReleaseParametersPriority } from "./release-parameters-priority";

export function ReleaseParametersScreen() {
  return (
    <div className="h-full min-h-0 overflow-auto scroll-smooth bg-black font-sans tabular-nums">
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-24 pt-2 md:px-6 lg:px-8">
        <div className="flex gap-10 lg:gap-14 xl:gap-16">
          <div className="min-w-0 flex-1 space-y-16 md:space-y-20 lg:space-y-24">
            <ReleaseParametersHero />
            <ReleaseParametersCardExplainer />
            <ReleaseParametersGrid />
            <ReleaseParametersPriority />
            <ReleaseParametersExample />
            <ReleaseParametersFaq />
          </div>

          <aside className="hidden w-52 shrink-0 xl:block">
            <ReleaseParametersInPageNav />
          </aside>
        </div>
      </div>
    </div>
  );
}
