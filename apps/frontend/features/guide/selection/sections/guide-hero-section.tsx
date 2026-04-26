import Image from "next/image";

export function GuideHeroSection() {
  return (
    <section id="guide-top" data-guide-section className="scroll-mt-24 pt-2 md:pt-4">
      <div className="relative isolate min-h-[160px] w-full overflow-hidden rounded-2xl ring-1 ring-white/10 md:min-h-[min(26vh,220px)]">
        <Image
          src="/images/catalogbuy/2.png"
          alt=""
          fill
          className="object-cover object-center"
          sizes="(max-width: 1400px) 100vw, 1400px"
          priority
        />
        <div className="pointer-events-none absolute inset-0 z-1 bg-gradient-to-r from-black/65 via-black/40 to-transparent" aria-hidden />
        <div className="relative z-10 flex min-h-[160px] flex-col items-center justify-center px-4 py-6 md:min-h-[min(26vh,220px)] md:px-6 md:py-8">
          <h1 className="max-w-4xl text-center text-xl font-semibold leading-tight tracking-tight text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.55)] md:text-2xl lg:text-3xl">
            Гид по выбору релиза
          </h1>
        </div>
      </div>
    </section>
  );
}
