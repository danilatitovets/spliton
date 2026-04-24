import { GUIDE_TOPIC_CARDS } from "@/constants/guide/selection";

import { GuideSectionHeader } from "../ui/guide-section-header";
import { GuideExchangeCard } from "../ui/guide-exchange-card";

export function GuideTopicGridSection() {
  return (
    <section id="topics" data-guide-section className="scroll-mt-28">
      <GuideSectionHeader title="Выберите раздел" align="center" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
        {GUIDE_TOPIC_CARDS.map((card) => (
          <GuideExchangeCard
            key={card.anchor}
            href={card.href ?? `#${card.anchor}`}
            topicImageFile={card.topicImageFile}
            title={card.title}
            description={card.description}
          />
        ))}
      </div>
    </section>
  );
}
