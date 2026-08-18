"use client";

import * as React from "react";
import Image from "next/image";

import { Copy, Minus, Plus, Share2, X } from "@/lib/lucide";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { BRAND } from "@/constants/brand";
import { cn } from "@/lib/utils";

import "./cursor-wander-card.css";

const CARD_LOGO_SRC = "/images/LOGO/black-logo-nofon.png";

export type CursorWanderCardProps = {
  cardholderName?: string;
  holderEmail?: string | null;
  holderId?: string | null;
  networkLabel?: string;
  paymentLabel?: string;
  paymentValue?: string;
  tierLabel?: string;
  loyaltyLabel?: string;
  className?: string;
  height?: string | number;
  width?: string | number;
  interactive?: boolean;
  showControls?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onShare?: () => void | Promise<void>;
  flipBackLabel?: string;
  flipFrontLabel?: string;
  shareLabel?: string;
  closeLabel?: string;
  copyIdLabel?: string;
  emailLabel?: string;
  idLabel?: string;
};

function CardLayers() {
  return (
    <>
      <div className="cursor-wander-card__marble absolute inset-0" aria-hidden />
      <div className="cursor-wander-card__marble-scrim absolute inset-0" aria-hidden />
      <div className="cursor-wander-card__sheen absolute inset-0" aria-hidden />
    </>
  );
}

export function CursorWanderCard({
  cardholderName = "Spliton",
  holderEmail = null,
  holderId = null,
  networkLabel = "USDT",
  paymentLabel = "Оценка",
  paymentValue = "0 USDT",
  tierLabel = "Premium",
  loyaltyLabel: _loyaltyLabel = "Loyalty",
  className,
  height,
  width = "100%",
  interactive = true,
  showControls = false,
  onClick,
  onClose,
  onShare,
  flipBackLabel = "Back",
  flipFrontLabel = "Front",
  shareLabel = "Share",
  closeLabel = "Close",
  copyIdLabel = "Copy ID",
  emailLabel = "Email",
  idLabel = "ID",
}: CursorWanderCardProps) {
  const tiltRef = React.useRef<HTMLDivElement>(null);
  const animationRef = React.useRef<number>(0);
  const rotationRef = React.useRef({ x: 5, y: -7, z: 0 });
  const rotationSpeedRef = React.useRef({ x: 0.08, y: 0.12, z: 0.02 });
  const [isHovered, setIsHovered] = React.useState(false);
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const [flipped, setFlipped] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const applyTilt = React.useCallback((x: number, y: number, z = 0) => {
    const node = tiltRef.current;
    if (!node) return;
    node.style.transform = `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`;
  }, []);

  const animate = React.useCallback(() => {
    if (isHovered || reduceMotion || flipped) return;

    rotationRef.current.x += rotationSpeedRef.current.x;
    rotationRef.current.y += rotationSpeedRef.current.y;
    rotationRef.current.z += rotationSpeedRef.current.z;

    if (Math.abs(rotationRef.current.x) > 7) rotationSpeedRef.current.x *= -1;
    if (Math.abs(rotationRef.current.y) > 9) rotationSpeedRef.current.y *= -1;
    if (Math.abs(rotationRef.current.z) > 2) rotationSpeedRef.current.z *= -1;

    applyTilt(rotationRef.current.x, rotationRef.current.y, rotationRef.current.z);
    animationRef.current = window.requestAnimationFrame(animate);
  }, [applyTilt, flipped, isHovered, reduceMotion]);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  React.useEffect(() => {
    const node = tiltRef.current;
    if (!node || !interactive) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (reduceMotion) return;
      const rect = node.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angleX = ((event.clientY - centerY) / (rect.height / 2)) * 22;
      const angleY = (-(event.clientX - centerX) / (rect.width / 2)) * 22;
      applyTilt(angleX, angleY);
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
      window.cancelAnimationFrame(animationRef.current);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      if (!reduceMotion && !flipped) {
        animationRef.current = window.requestAnimationFrame(animate);
      } else {
        applyTilt(0, 0, 0);
      }
    };

    node.addEventListener("mouseenter", handleMouseEnter);
    node.addEventListener("mousemove", handleMouseMove);
    node.addEventListener("mouseleave", handleMouseLeave);

    if (!reduceMotion && !flipped) {
      animationRef.current = window.requestAnimationFrame(animate);
    }

    return () => {
      window.cancelAnimationFrame(animationRef.current);
      node.removeEventListener("mouseenter", handleMouseEnter);
      node.removeEventListener("mousemove", handleMouseMove);
      node.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [animate, applyTilt, flipped, interactive, reduceMotion]);

  React.useEffect(() => {
    if (!interactive || isHovered) return;
    applyTilt(0, 0, 0);
  }, [applyTilt, flipped, interactive, isHovered]);

  const handleCopyId = React.useCallback(async () => {
    if (!holderId) return;
    const result = await copyTextToClipboard(holderId);
    if (result === "ok") {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  }, [holderId]);

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "cursor-wander-card mx-auto w-full max-w-[580px]",
        onClick && "cursor-pointer border-0 bg-transparent p-0 text-left",
        !interactive && "cursor-wander-card--flat",
        className,
      )}
    >
      <div
        ref={tiltRef}
        className={cn("cursor-wander-card__tilt relative mx-auto aspect-[1.586/1]", interactive && "hover:scale-[1.02]")}
        style={{
          width,
          height: height ?? undefined,
          maxWidth: "100%",
          transform: interactive ? undefined : "none",
        }}
      >
        <div className={cn("cursor-wander-card__flip h-full w-full", flipped && "cursor-wander-card__flip--back")}>
          <div className="cursor-wander-card__face cursor-wander-card__face--front absolute inset-0">
            <div className="cursor-wander-card__surface absolute inset-0 overflow-hidden rounded-[1.25rem] sm:rounded-[1.35rem]">
              <CardLayers />

              <div className="relative flex h-full flex-col px-5 py-5 sm:px-6 sm:py-6">
                <div className="flex items-start justify-between gap-3">
                  <Image
                    src={CARD_LOGO_SRC}
                    alt="Spliton"
                    width={248}
                    height={64}
                    className="h-12 w-auto shrink-0 object-contain object-left brightness-0 invert sm:h-16"
                    unoptimized
                  />
                  {onClose ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onClose();
                      }}
                      className="cursor-wander-card__control inline-flex size-8 items-center justify-center rounded-full"
                      aria-label={closeLabel}
                    >
                      <X className="size-3.5" />
                    </button>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
                  <p className="text-[13px] font-medium text-white/60">{paymentLabel}</p>
                  <p className="cursor-wander-card__hero-value mt-2 text-[clamp(1.65rem,7vw,2.4rem)] font-semibold leading-none tracking-[-0.02em] text-white">
                    {paymentValue}
                  </p>
                  <p className="mt-2 text-[13px] font-medium text-white/45">{networkLabel}</p>
                </div>

                <div className="pointer-events-none select-none text-center leading-[0.82]">
                  <p
                    className="cursor-wander-card__wordmark inline-block font-bold"
                    aria-hidden
                  >
                    {BRAND.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="cursor-wander-card__face cursor-wander-card__face--back absolute inset-0">
            <div className="cursor-wander-card__surface absolute inset-0 overflow-hidden rounded-[1.25rem] sm:rounded-[1.35rem]">
              <CardLayers />

              <div className="relative flex h-full flex-col justify-between px-5 py-5 sm:px-6 sm:py-6">
                <div className="flex items-start justify-between gap-3">
                  <Image
                    src={CARD_LOGO_SRC}
                    alt="Spliton"
                    width={248}
                    height={64}
                    className="h-12 w-auto shrink-0 object-contain object-left brightness-0 invert sm:h-16"
                    unoptimized
                  />
                  {onClose ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onClose();
                      }}
                      className="cursor-wander-card__control inline-flex size-8 items-center justify-center rounded-full"
                      aria-label={closeLabel}
                    >
                      <X className="size-3.5" />
                    </button>
                  ) : null}
                </div>

                <div className="space-y-4 px-1 py-2">
                  <div>
                    <p className="text-[12px] font-medium text-white/50">Holder</p>
                    <p className="mt-1 truncate text-lg font-semibold text-white">{cardholderName}</p>
                  </div>
                  {holderEmail ? (
                    <div>
                      <p className="text-[12px] font-medium text-white/50">{emailLabel}</p>
                      <p className="mt-1 truncate text-[14px] font-medium text-white/72">{holderEmail}</p>
                    </div>
                  ) : null}
                  {holderId ? (
                    <div>
                      <p className="text-[12px] font-medium text-white/50">{idLabel}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="cursor-wander-card__back-id min-w-0 truncate text-[13px] text-white/72">
                          {holderId}
                        </span>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleCopyId();
                          }}
                          className="cursor-wander-card__control inline-flex size-8 shrink-0 items-center justify-center rounded-full"
                          aria-label={copyIdLabel}
                        >
                          <Copy className="size-3.5" />
                        </button>
                      </div>
                      {copied ? (
                        <p className="mt-1 text-[12px] font-medium text-white/55">{copyIdLabel}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="pointer-events-none select-none text-center leading-[0.82]">
                  <p className="cursor-wander-card__wordmark inline-block font-bold" aria-hidden>
                    {BRAND.name}
                  </p>
                  {tierLabel ? (
                    <p className="cursor-wander-card__tier mt-2 text-[12px] font-medium">{tierLabel}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showControls ? (
        <div className="relative z-30 mt-4 flex justify-center">
          <div className="cursor-wander-card__toolbar flex items-center gap-2 rounded-full border border-white/12 bg-black/80 p-1.5 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setFlipped(true)}
              aria-pressed={flipped}
              className={cn(
                "cursor-wander-card__control inline-flex size-10 items-center justify-center rounded-full",
                flipped && "cursor-wander-card__control--active",
              )}
              aria-label={flipBackLabel}
            >
              <Minus className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setFlipped(false)}
              aria-pressed={!flipped}
              className={cn(
                "cursor-wander-card__control inline-flex size-10 items-center justify-center rounded-full",
                !flipped && "cursor-wander-card__control--active",
              )}
              aria-label={flipFrontLabel}
            >
              <Plus className="size-4" />
            </button>
            {onShare ? (
              <button
                type="button"
                onClick={() => void onShare()}
                className="cursor-wander-card__control cursor-wander-card__control--accent inline-flex size-10 items-center justify-center rounded-full"
                aria-label={shareLabel}
              >
                <Share2 className="size-4" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </Wrapper>
  );
}

export default CursorWanderCard;
