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
        src="/images/LOGO/black-logo-nofon.png"
        alt="RevShare"
        width={430}
        height={90}
        className="h-10 w-auto object-contain sm:h-12 lg:h-14"
        priority
      />
    </Link>
  );
}
