from pathlib import Path
p = Path("apps/frontend/features/catalog/ui/catalog-market-instrument-row.tsx")
text = p.read_text(encoding="utf-8")

old = '''  return (
    <Link
      href={href}
      className="flex items-center gap-3 border-b border-white/[0.04] py-3.5 transition-colors active:bg-white/[0.03]"
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOptimistic(!shownFavorite);
          onToggleFavorite?.();
        }}
        className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-md text-zinc-600 hover:bg-white/[0.04] hover:text-[#B7F500]"
        aria-label={shownFavorite ? t("catalog.favorite.remove") : t("catalog.favorite.add")}
        aria-pressed={shownFavorite}
      >
        <Star
          className={cn(
            "size-4 transition-colors",
            shownFavorite ? "fill-[#B7F500] text-[#B7F500]" : "fill-transparent text-zinc-600",
          )}
          strokeWidth={1.75}
        />
      </button>
      <CoverThumb symbol={symbol} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold leading-snug text-white">{symbol}</p>
        <p className="truncate text-[12px] text-zinc-500">
          {item.title} · {item.artist}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-mono text-[14px] font-semibold tabular-nums text-white">{price}</p>
        <p
          className={cn(
            "font-mono text-[11px] tabular-nums",
            positive === true && "text-[#B7F500]",
            positive === false && "text-fuchsia-300",
            positive === null && "text-zinc-500",
          )}
        >
          {change}
        </p>
      </div>
    </Link>
  );'''

new = '''  return (
    <div className="flex items-center gap-2 border-b border-white/[0.04] py-3.5 transition-colors hover:bg-white/[0.02]">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOptimistic(!shownFavorite);
          onToggleFavorite?.();
        }}
        className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-md text-zinc-600 hover:bg-white/[0.04] hover:text-[#B7F500]"
        aria-label={shownFavorite ? t("catalog.favorite.remove") : t("catalog.favorite.add")}
        aria-pressed={shownFavorite}
      >
        <Star
          className={cn(
            "size-4 transition-colors",
            shownFavorite ? "fill-[#B7F500] text-[#B7F500]" : "fill-transparent text-zinc-600",
          )}
          strokeWidth={1.75}
        />
      </button>
      <Link href={href} className="flex min-w-0 flex-1 items-center gap-3 active:bg-white/[0.03]">
        <CoverThumb symbol={symbol} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-snug text-white">{symbol}</p>
          <p className="truncate text-[12px] text-zinc-500">
            {item.title} · {item.artist}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-[14px] font-semibold tabular-nums text-white">{price}</p>
          <p
            className={cn(
              "font-mono text-[11px] tabular-nums",
              positive === true && "text-[#B7F500]",
              positive === false && "text-fuchsia-300",
              positive === null && "text-zinc-500",
            )}
          >
            {change}
          </p>
        </div>
      </Link>
    </div>
  );'''

if old not in text:
    raise SystemExit("row block not found")
p.write_text(text.replace(old, new), encoding="utf-8")
print("row ok")