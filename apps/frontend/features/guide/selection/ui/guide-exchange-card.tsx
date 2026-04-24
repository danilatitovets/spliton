import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { guideTopicImageSrc } from "@/constants/guide/selection";
import { cn } from "@/lib/utils";

export function GuideExchangeCard({
  href,
  topicImageFile,
  title,
  description,
  className,
}: {
  href: string;
  topicImageFile: string;
  title: string;
  description: string;
  className?: string;
}) {
  const imageSrc = guideTopicImageSrc(topicImageFile);

  return (
    <Link
      href={href}
      className={cn(
        "group flex min-h-[260px] flex-col overflow-hidden rounded-2xl bg-[#121212] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.06] transition-[background-color,box-shadow,ring-color] duration-300 hover:bg-[#161616] hover:shadow-[0_22px_56px_rgba(0,0,0,0.5)] hover:ring-[#B7F500]/15 md:min-h-[280px] md:p-6",
        className,
      )}
    >
      <div
        className={cn(
          "relative isolate w-full overflow-hidden rounded-xl bg-[#080808]",
          "ring-1 ring-inset ring-white/[0.08]",
          "shadow-[0_4px_24px_rgba(0,0,0,0.65)]",
          "transition-[transform,box-shadow,ring-color] duration-300 ease-out",
          "group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.75)] group-hover:ring-[#B7F500]/20",
        )}
      >
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={imageSrc}
            alt=""
            width={720}
            height={540}
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 420px"
            unoptimized
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent"
            aria-hidden
          />
        </div>
      </div>

      <h3 className="mt-5 text-lg font-semibold leading-snug tracking-tight text-white md:text-xl">{title}</h3>
      <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-zinc-400 md:text-sm">{description}</p>
      <div className="mt-5 flex items-center gap-1 text-sm font-medium text-zinc-500 transition-colors group-hover:text-[#c4f570]">
        <span>Подробнее</span>
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </div>
    </Link>
  );
}
