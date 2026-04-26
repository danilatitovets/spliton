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
        src="/images/LOGO/black-logo.png"
        alt="RevShare"
        width={204}
        height={42}
        className="h-7 w-auto object-contain sm:h-8 lg:h-9"
        priority
      />
    </Link>
  );
}
