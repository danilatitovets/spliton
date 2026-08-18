"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  type UIEvent,
} from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type AnimatedItemProps = {
  children: ReactNode;
  index: number;
  rootRef?: RefObject<HTMLDivElement | null>;
  onMouseEnter?: () => void;
  onClick?: () => void;
  divided?: boolean;
};

function AnimatedItem({ children, index, rootRef, onMouseEnter, onClick, divided }: AnimatedItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, {
    amount: 0.4,
    once: false,
    ...(rootRef ? { root: rootRef } : {}),
  });
  const visible = Boolean(reduceMotion || inView);

  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={false}
      animate={visible ? { scale: 1, opacity: 1 } : { scale: 0.88, opacity: 0.28 }}
      transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={cn("origin-center", divided && "border-b border-white/[0.06] last:border-b-0")}
    >
      {children}
    </motion.div>
  );
}

export type AnimatedListProps = {
  items?: string[];
  children?: ReactNode;
  onItemSelect?: (item: string, index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  className?: string;
  itemClassName?: string;
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
  /** Inner scroll. Viewport animation is used when this is unset. */
  maxHeightClassName?: string;
  gradientFrom?: string;
  divided?: boolean;
};

export function AnimatedList({
  items,
  children,
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = "",
  itemClassName = "",
  displayScrollbar = true,
  initialSelectedIndex = -1,
  maxHeightClassName,
  gradientFrom = "#111111",
  divided = false,
}: AnimatedListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(0);

  const nodes = items
    ? items.map((item, index) => (
        <div
          key={`${item}-${index}`}
          className={cn(
            "rounded-xl bg-white/[0.04] px-4 py-3.5 transition-colors duration-200",
            selectedIndex === index && "bg-white/[0.09]",
            itemClassName,
          )}
        >
          <p className="m-0 text-sm font-medium text-white">{item}</p>
        </div>
      ))
    : Children.toArray(children);

  const scrollable = Boolean(maxHeightClassName);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  };

  useEffect(() => {
    const el = listRef.current;
    if (!el || !showGradients) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  }, [nodes.length, scrollable, showGradients]);

  const selectIndex = useCallback(
    (index: number, fire = false) => {
      setSelectedIndex(index);
      if (!fire || !onItemSelect || !items) return;
      const item = items[index];
      if (item != null) onItemSelect(item, index);
    },
    [items, onItemSelect],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!enableArrowNavigation || nodes.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setKeyboardNav(true);
      setSelectedIndex((prev) => Math.min(prev < 0 ? 0 : prev + 1, nodes.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setKeyboardNav(true);
      setSelectedIndex((prev) => Math.max(prev < 0 ? 0 : prev - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      if (items) selectIndex(selectedIndex, true);
      else onItemSelect?.("", selectedIndex);
    }
  };

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const selectedItem = container.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null;
    if (selectedItem) {
      const extraMargin = 48;
      const top = selectedItem.offsetTop;
      const bottom = top + selectedItem.offsetHeight;
      if (top < container.scrollTop + extraMargin) {
        container.scrollTo({ top: top - extraMargin, behavior: "smooth" });
      } else if (bottom > container.scrollTop + container.clientHeight - extraMargin) {
        container.scrollTo({
          top: bottom - container.clientHeight + extraMargin,
          behavior: "smooth",
        });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  return (
    <div className={cn("relative w-full", className)}>
      <div
        ref={listRef}
        tabIndex={enableArrowNavigation ? 0 : undefined}
        onKeyDown={onKeyDown}
        onScroll={showGradients ? handleScroll : undefined}
        className={cn(
          "outline-none",
          scrollable ? cn("overflow-y-auto overscroll-contain", maxHeightClassName) : "overflow-visible",
          displayScrollbar
            ? "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-track]:bg-transparent"
            : "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
        style={
          displayScrollbar
            ? { scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.2) transparent" }
            : { scrollbarWidth: "none" }
        }
      >
        {nodes.map((node, index) => (
          <AnimatedItem
            key={index}
            index={index}
            rootRef={scrollable ? listRef : undefined}
            divided={divided}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => {
              setSelectedIndex(index);
              if (items) onItemSelect?.(items[index] ?? "", index);
              else onItemSelect?.("", index);
            }}
          >
            {node}
          </AnimatedItem>
        ))}
      </div>
      {showGradients ? (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b to-transparent transition-opacity duration-300"
            style={{ opacity: topGradientOpacity, backgroundImage: `linear-gradient(to bottom, ${gradientFrom}, transparent)` }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t to-transparent transition-opacity duration-300"
            style={{ opacity: bottomGradientOpacity, backgroundImage: `linear-gradient(to top, ${gradientFrom}, transparent)` }}
          />
        </>
      ) : null}
    </div>
  );
}

export default AnimatedList;
