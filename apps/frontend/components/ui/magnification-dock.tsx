"use client";

/**
 * MagnificationDock — macOS-style dock with spring magnification.
 * Adapted for Spliton dark cabinet surfaces.
 */

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
} from "framer-motion";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

export type DockItemData = {
  icon: ReactNode;
  label: ReactNode;
  onClick: () => void;
  className?: string;
  active?: boolean;
};

export type MagnificationDockProps = {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
  ariaLabel?: string;
};

const DockHoverContext = createContext<MotionValue<number> | null>(null);

type DockItemProps = {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  distance: number;
  baseItemSize: number;
  magnification: number;
  active?: boolean;
};

function DockItem({
  children,
  className = "",
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  active = false,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize,
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize],
  );
  const size = useSpring(targetSize, spring);

  return (
    <DockHoverContext.Provider value={isHovered}>
      <motion.div
        ref={ref}
        style={{ width: size, height: size }}
        onHoverStart={() => isHovered.set(1)}
        onHoverEnd={() => isHovered.set(0)}
        onFocus={() => isHovered.set(1)}
        onBlur={() => isHovered.set(0)}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
        className={cn(
          "relative inline-flex cursor-pointer items-center justify-center rounded-full outline-none",
          "bg-white/[0.06] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]",
          "transition-[box-shadow,background-color] duration-200",
          "hover:bg-white/[0.1] focus-visible:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35),0_0_0_2px_rgba(183,245,0,0.35)]",
          active && "bg-white text-black shadow-none hover:bg-[#e8e8e8]",
          className,
        )}
        tabIndex={0}
        role="button"
        aria-current={active ? "page" : undefined}
      >
        {children}
      </motion.div>
    </DockHoverContext.Provider>
  );
}

function DockLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  const isHovered = useContext(DockHoverContext);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on("change", (latest) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "absolute -top-8 left-1/2 z-10 w-fit -translate-x-1/2 whitespace-nowrap rounded-md",
            "bg-[#171717] px-2.5 py-1 text-[11px] font-medium tracking-tight text-white",
            "shadow-[0_8px_24px_rgba(0,0,0,0.45)]",
            className,
          )}
          role="tooltip"
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function DockIcon({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex items-center justify-center", className)}>{children}</div>;
}

export function MagnificationDock({
  items,
  className = "",
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 64,
  dockHeight = 256,
  baseItemSize = 50,
  ariaLabel = "Application dock",
}: MagnificationDockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [dockHeight, magnification],
  );
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <motion.div
      style={{ height, scrollbarWidth: "none" }}
      className="flex max-w-full items-center justify-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={cn(
          "flex w-fit items-end gap-2.5 rounded-3xl px-3 pb-2 shadow-xl sm:gap-3 sm:px-4",
          "bg-[#0c0c0c]/90 backdrop-blur-md",
          "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),0_16px_48px_-20px_rgba(0,0,0,0.85)]",
          className,
        )}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label={ariaLabel}
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
            active={item.active}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}

export default MagnificationDock;
