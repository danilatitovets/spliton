import { GUIDE_TOPIC_CARDS } from "@/constants/guide/selection";

import { GuideSectionHeader } from "../ui/guide-section-header";
import { GuideExchangeCard } from "../ui/guide-exchange-card";

export function GuideTopicGridSection() {
  return (
    <section id="topics" data-guide-section className="scroll-mt-24">
      <GuideSectionHeader title="Выберите раздел" align="center" />
      <div className="mt-3 grid gap-2 sm:grid-cols-2 md:gap-3 xl:grid-cols-3">
        {GUIDE_TOPIC_CARDS.map((card) => (
          <GuideExchangeCard
            key={card.anchor}
            href={card.href ?? `#${card.anchor}`}
            icon={card.icon}
            title={card.title}
            description={card.description}
          />
        ))}
      </div>
    </section>
  );
}
