/**
 * Нижний декор футера: пунктирные дуги + лаймовый «сигнал» — читается как движение музыки, без столбиков EQ.
 */
export function FooterSoundtrack() {
  return (
    <div className="relative w-full overflow-hidden bg-black" aria-hidden>
      <div className="relative z-0 mx-auto max-w-[1600px] px-0">
        <svg
          className="block h-[64px] w-full sm:h-[76px] md:h-[88px]"
          viewBox="0 0 1440 96"
          preserveAspectRatio="xMidYMax meet"
          role="presentation"
        >
          <defs>
            <linearGradient id="revshare-footer-arc-accent" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#bef264" stopOpacity="0" />
              <stop offset="38%" stopColor="#bef264" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#d9f99d" stopOpacity="0.75" />
              <stop offset="62%" stopColor="#bef264" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#bef264" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Базовые дуги — чуть ярче + очень медленный дрейф пунктира */}
            <path
              d="M0 92 Q420 -14 780 54"
              className="animate-revshare-footer-track-base-drift stroke-white/16"
              strokeWidth={1}
              strokeDasharray="1.5 6.5"
            />
            <path
              d="M1440 92 Q1020 -12 660 54"
              className="animate-revshare-footer-track-base-drift-reverse stroke-white/16"
              strokeWidth={1}
              strokeDasharray="1.5 6.5"
            />
            <path
              d="M0 90 Q300 22 700 68"
              className="stroke-white/11"
              strokeWidth={0.8}
              strokeDasharray="1 5.5"
            />
            <path
              d="M1440 90 Q1140 26 740 68"
              className="stroke-white/11"
              strokeWidth={0.8}
              strokeDasharray="1 5.5"
            />
            <path
              d="M0 94 Q220 48 520 80"
              className="stroke-white/8"
              strokeWidth={0.7}
              strokeDasharray="1 7"
            />
            <path
              d="M1440 94 Q1220 50 920 80"
              className="stroke-white/8"
              strokeWidth={0.7}
              strokeDasharray="1 7"
            />
            <path
              d="M200 88 Q720 36 1240 88"
              className="stroke-white/7"
              strokeWidth={0.65}
              strokeDasharray="0.8 8"
            />
            {/* Лайм: быстрее «бежит» пунктир + лёгкий пульс «громкости» */}
            <g className="animate-revshare-footer-track-breathe">
              <path
                d="M-20 93 Q480 -8 720 50"
                stroke="url(#revshare-footer-arc-accent)"
                strokeWidth={1.15}
                strokeDasharray="3 11"
                className="animate-revshare-footer-track-accent"
              />
              <path
                d="M1460 93 Q960 -6 720 50"
                stroke="url(#revshare-footer-arc-accent)"
                strokeWidth={1.15}
                strokeDasharray="3 11"
                className="animate-revshare-footer-track-accent-reverse"
              />
            </g>
          </g>
        </svg>
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-1 bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,transparent_12%,transparent_88%,rgba(0,0,0,0.72)_100%),linear-gradient(180deg,rgba(0,0,0,0.4)_0%,transparent_38%)]"
        aria-hidden
      />
    </div>
  );
}
