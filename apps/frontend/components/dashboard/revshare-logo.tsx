import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function RevShareLogo({ className }: { className?: string }) {
  return (
    <Link
      href={ROUTES.dashboard}
      className={cn(
        "inline-flex items-center overflow-visible",
        className,
      )}
      aria-label="RevShare"
    >
      <Image
        src="/images/LOGO/FULL-LOGO.png"
        alt="RevShare"
        width={320}
        height={76}
        className="h-10 w-auto origin-left scale-155 object-contain sm:h-11 sm:scale-165 lg:h-12 lg:scale-175"
        priority
      />
    </Link>
  );
}
