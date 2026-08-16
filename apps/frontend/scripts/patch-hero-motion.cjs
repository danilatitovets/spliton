const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "../components/dashboard/dashboard-hero.tsx");
let s = fs.readFileSync(p, "utf8");
if (s.includes("HeroMotion")) {
  console.log("already");
  process.exit(0);
}
s = s.replace(
  "  const animateIn = mounted && !reduceMotion;\n\n  return (",
  '  const animateIn = mounted && !reduceMotion;\n  const HeroMotion = animateIn ? motion.div : "div";\n\n  return (',
);
s = s.replace(
  `<motion.div
          className="mx-auto flex max-w-[980px] flex-col items-center text-center"
          initial={animateIn ? { opacity: 0, y: 32 } : false}
          animate={animateIn ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.85, ease: easeOut }}
        >`,
  `<HeroMotion
          className="mx-auto flex max-w-[980px] flex-col items-center text-center"
          {...(animateIn
            ? {
                initial: { opacity: 0, y: 32 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.85, ease: easeOut },
              }
            : {})}
        >`,
);
// Replace the matching close tag for that wrapper — after logo strip section
// Find first </motion.div> that closes the hero motion wrapper (before product stage)
const marker = `<DashboardLandingLogoStrip className="mt-10 sm:mt-12" />
        </motion.div>`;
if (s.includes(marker)) {
  s = s.replace(
    marker,
    `<DashboardLandingLogoStrip className="mt-10 sm:mt-12" />
        </HeroMotion>`,
  );
} else {
  // try alternate
  const idx = s.indexOf("DashboardLandingLogoStrip");
  const close = s.indexOf("</motion.div>", idx);
  if (close >= 0) {
    s = s.slice(0, close) + "</HeroMotion>" + s.slice(close + "</motion.div>".length);
  }
}
fs.writeFileSync(p, s, "utf8");
console.log("hero patched", s.includes("HeroMotion"), s.includes("</HeroMotion>"));
