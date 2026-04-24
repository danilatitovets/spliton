/** Декоративные мини-схемы для строк чеклиста (без данных — только визуальный якорь). */
export function GuideChecklistRowVisual({ index }: { index: number }) {
  const stroke = "rgba(161,161,170,0.35)";
  const accent = "#B7F500";
  const w = 200;
  const h = 112;

  if (index === 0) {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0 text-zinc-500" aria-hidden>
        <path d="M16 88 C52 28, 92 96, 184 24" fill="none" stroke={accent} strokeWidth="2.25" strokeLinecap="round" />
        <circle cx="16" cy="88" r="3" fill={accent} opacity="0.85" />
        <circle cx="184" cy="24" r="3" fill={accent} />
        <line x1="12" y1="96" x2="188" y2="96" stroke={stroke} strokeWidth="1" />
      </svg>
    );
  }

  if (index === 1) {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            x={28 + i * 30}
            y={32 + (i % 3) * 10}
            width="14"
            height={72 - i * 12}
            rx="3"
            fill={i === 2 ? accent : "rgba(255,255,255,0.08)"}
            opacity={i === 2 ? 0.95 : 1}
          />
        ))}
        <line x1="20" y1="96" x2="180" y2="96" stroke={stroke} strokeWidth="1" />
      </svg>
    );
  }

  if (index === 2) {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden>
        <path d="M100 20 A52 52 0 1 1 99.9 20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
        <path d="M100 20 A52 52 0 0 1 152 88" fill="none" stroke={accent} strokeWidth="14" strokeLinecap="round" />
        <circle cx="100" cy="72" r="5" fill="#fafafa" />
      </svg>
    );
  }

  if (index === 3) {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden>
        <rect x="24" y="28" width="152" height="52" rx="12" fill="rgba(255,255,255,0.06)" stroke={stroke} />
        <path d="M44 54 H156" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeDasharray="6 5" />
        <circle cx="56" cy="54" r="5" fill={accent} />
        <circle cx="112" cy="54" r="5" fill="rgba(56,189,248,0.9)" />
        <circle cx="156" cy="54" r="5" fill="rgba(244,244,245,0.35)" />
      </svg>
    );
  }

  if (index === 4) {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden>
        <path
          d="M20 72 Q60 40 100 72 T180 72"
          fill="none"
          stroke="rgba(56,189,248,0.55)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M24 88 L176 88" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.9" />
        <circle cx="52" cy="88" r="4" fill={accent} />
        <circle cx="148" cy="88" r="4" fill={accent} />
      </svg>
    );
  }

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden>
      <rect x="32" y="28" width="136" height="18" rx="6" fill="rgba(255,255,255,0.07)" />
      <rect x="32" y="54" width="96" height="18" rx="6" fill="rgba(255,255,255,0.05)" />
      <rect x="32" y="80" width="120" height="18" rx="6" fill={accent} opacity="0.22" />
      <line x1="32" y1="104" x2="168" y2="104" stroke={stroke} strokeWidth="1" />
    </svg>
  );
}
