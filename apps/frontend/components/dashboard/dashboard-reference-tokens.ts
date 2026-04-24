/**
 * Цвета и обводки под референс-макет (каталог + колонка выплат).
 * Не смешивать с брендовым lime Tailwind — здесь фиксированные hex.
 */
export const DASH_REF = {
  canvas: "#000000",
  /** Карточки каталога и колонка «Последние выплаты» */
  card: "#161616",
  cardImageWell: "#141414",
  text: "#FFFFFF",
  muted: "#888888",
  mutedWeak: "#6B6B6B",
  line: "rgba(255,255,255,0.06)",
  ringCard: "rgba(255,255,255,0.06)",
  /** Акцент макета — «мятный» зелёный, не lime-400 из темы */
  accent: "#00FF7F",
  accentOnBadge: "#0A0A0A",
  progressTrack: "#2A2A2A",
  /** Синий прогресс как на макете (cerulean) */
  progressFill: "#38BDF8",
  button: "#262626",
  buttonHover: "#323232",
  playBg: "rgba(10, 10, 10, 0.55)",
  playRing: "rgba(255,255,255,0.16)",
  purpleBorder: "rgba(196, 181, 253, 0.45)",
  purpleBg: "rgba(76, 29, 149, 0.38)",
  purpleText: "#EDE9FE",
  thumb: "#222222",
} as const;
