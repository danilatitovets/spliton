import Image from "next/image";

const title = "Доли дохода треков в одном кабинете";
const description =
  "Каталог, выплаты в USDT (TRC20) и вторичный рынок. Revenue share без лишнего шума на экране.";

export function BrandPanel() {
  return (
    <div className="flex min-h-[300px] flex-1 flex-col bg-black px-8 py-10 text-white sm:min-h-[320px] sm:px-10 sm:py-12 lg:min-h-dvh lg:px-12 lg:py-14">
      <div className="max-w-lg font-sans">
        <h1 className="text-balance text-[1.75rem] font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-[2rem] lg:text-[2.25rem]">
          {title}
        </h1>
        <p className="mt-3 max-w-md text-base font-normal leading-[1.55] text-neutral-400">
          {description}
        </p>
      </div>

      <div className="-mt-4 flex flex-1 items-start justify-center pb-8 lg:-mt-6 lg:pb-10">
        <div className="relative mx-auto aspect-9/16 w-full max-w-[600px] min-h-[440px] max-h-[min(80dvh,1040px)] overflow-hidden rounded-2xl">
          <Image
            src="/images/loginphoto.png"
            alt=""
            fill
            className="object-contain object-center"
            sizes="(max-width: 1024px) 92vw, 600px"
            priority
          />
        </div>
      </div>
    </div>
  );
}
