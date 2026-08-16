import { RELEASE_DETAIL_ANALYTICS_ICONS } from "@/constants/analytics/release-detail-analytics-icons";

/**
 * Situational empty-state illustrations for light Assets surfaces.
 * Reuses the Spliton analytics icon pack (black-plate PNGs -> render on a dark inset).
 */
export const ASSETS_EMPTY_SITUATIONS = {
  /** Accrued vs paid / payouts not started yet */
  payoutsPending: RELEASE_DETAIL_ANALYTICS_ICONS.payoutsEmpty,
  /** Charts with no series yet */
  chartEmpty: RELEASE_DETAIL_ANALYTICS_ICONS.chartEmpty,
  /** Single sparse datapoint / early portfolio */
  chartSparse: RELEASE_DETAIL_ANALYTICS_ICONS.chartOnePoint,
  /** No positions / empty portfolio CTA */
  portfolioEmpty: RELEASE_DETAIL_ANALYTICS_ICONS.guestPulse,
  /** Secondary / listings empty */
  secondaryEmpty: RELEASE_DETAIL_ANALYTICS_ICONS.secondaryEmpty,
  /** Documents / data room empty */
  dataEmpty: RELEASE_DETAIL_ANALYTICS_ICONS.dataRoomEmpty,
  /** Activity / history empty */
  activityEmpty: RELEASE_DETAIL_ANALYTICS_ICONS.holderPulse,
} as const;

export type AssetsEmptySituation = keyof typeof ASSETS_EMPTY_SITUATIONS;
