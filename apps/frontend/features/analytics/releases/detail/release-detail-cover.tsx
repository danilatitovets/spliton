import { Play } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ReleaseDetailCover } from "@/types/analytics/release-detail";

export function ReleaseDetailCover({
  cover,
  releaseTitle,
}: {
  cover?: ReleaseDetailCover;
  releaseTitle: string;
}) {
  const videoSrc = cover?.videoSrc?.trim();
  const posterSrc = cover?.posterSrc?.trim();
  const caption = cover?.caption?.trim();

  return (
    <div className="mt-6">
      <div
        className={cn("relative aspect-video w-full overflow-hidden rounded-xl bg-[#111111]")}
      >
        {videoSrc ? (
          <video
            className="absolute inset-0 size-full object-cover"
            controls
            playsInline
            preload="metadata"
            poster={posterSrc || undefined}
            aria-label={`Видео-обложка релиза «${releaseTitle}»`}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : posterSrc ? (
          <img src={posterSrc} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#090909] px-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-white/10" aria-hidden>
                <Play className="ml-0.5 size-5 fill-white text-white" strokeWidth={1.5} />
              </div>
              <p className="text-[13px] text-zinc-500">Видео скоро появится</p>
              <p className="text-[11px] font-mono text-zinc-600">{releaseTitle}</p>
            </div>
          </div>
        )}
      </div>
      {caption ? <p className="mt-2.5 max-w-[70ch] text-[12px] leading-relaxed text-zinc-600">{caption}</p> : null}
    </div>
  );
}
