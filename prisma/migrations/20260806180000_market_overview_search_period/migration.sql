-- Wire p_period into market_overview_search (sparkline window + period volume sort)

DROP FUNCTION IF EXISTS market_overview_search(
  text, text, text, text, text, text, text, text, text, text, text, integer, integer
);

CREATE OR REPLACE FUNCTION market_overview_search(
  p_period text DEFAULT '7d',
  p_search text DEFAULT NULL,
  p_category text DEFAULT 'all',
  p_genre text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_payout_freq text DEFAULT NULL,
  p_liquidity text DEFAULT NULL,
  p_yield text DEFAULT NULL,
  p_availability text DEFAULT NULL,
  p_sort text DEFAULT 'activity',
  p_sort_dir text DEFAULT 'desc',
  p_page integer DEFAULT 1,
  p_page_size integer DEFAULT 24
)
RETURNS TABLE (
  id uuid,
  slug text,
  symbol text,
  title text,
  artist text,
  genre text,
  segment text,
  last_price_usdt numeric,
  volume_24h_usdt numeric,
  volume_7d_usdt numeric,
  volume_30d_usdt numeric,
  change_24h_pct numeric,
  change_7d_pct numeric,
  liquidity_tag text,
  liquidity_label_ru text,
  spread numeric,
  active_listings integer,
  yield_pct numeric,
  payouts_usdt numeric,
  activity_score numeric,
  available_units numeric,
  primary_unit_price_usdt numeric,
  secondary_label text,
  trend text,
  sparkline jsonb,
  status_label text,
  status_key text,
  payout_freq text,
  categories text[],
  risk_status text,
  total_count bigint
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_page integer := GREATEST(COALESCE(p_page, 1), 1);
  v_page_size integer := LEAST(GREATEST(COALESCE(p_page_size, 24), 1), 100);
  v_offset integer := (v_page - 1) * v_page_size;
  v_search text := NULLIF(BTRIM(p_search), '');
  v_sort text := COALESCE(NULLIF(BTRIM(p_sort), ''), 'activity');
  v_dir integer := CASE WHEN lower(COALESCE(p_sort_dir, 'desc')) = 'asc' THEN 1 ELSE -1 END;
  v_period text := lower(trim(COALESCE(p_period, '7d')));
  v_interval interval := market_period_interval(v_period);
  v_spark_limit integer := CASE
    WHEN lower(trim(COALESCE(p_period, '7d'))) = '24h' THEN 24
    WHEN lower(trim(COALESCE(p_period, '7d'))) = '7d' THEN 7
    WHEN lower(trim(COALESCE(p_period, '7d'))) = '30d' THEN 30
    ELSE 90
  END;
  v_spark_bucket text := CASE WHEN lower(trim(COALESCE(p_period, '7d'))) = '24h' THEN 'H1' ELSE 'D1' END;
BEGIN
  IF v_period NOT IN ('24h', '7d', '30d', '90d') THEN
    v_period := '7d';
    v_interval := market_period_interval('7d');
    v_spark_limit := 7;
    v_spark_bucket := 'D1';
  END IF;
  RETURN QUERY
  WITH base AS (
    SELECT
      m.*,
      COALESCE(m.last_trade_price, m.primary_unit_price_usdt) AS last_price,
      CASE
        WHEN COALESCE(m.best_secondary_ask_price, 0) > 0 AND COALESCE(m.last_trade_price, 0) > 0
        THEN m.best_secondary_ask_price - m.last_trade_price
        ELSE 0
      END AS spread_val,
      CASE
        WHEN m.deals_7d >= 8 OR m.volume_24h_usdt >= 5000 THEN 'Высокий'
        WHEN m.deals_7d >= 2 OR m.volume_24h_usdt >= 500 THEN 'Средний'
        WHEN m.deals_7d > 0 OR m.volume_24h_usdt > 0 THEN 'Низкий'
        ELSE '—'
      END AS sec_label,
      ARRAY_REMOVE(ARRAY[
        CASE WHEN m.created_at >= NOW() - INTERVAL '14 days' THEN 'new' END,
        CASE WHEN COALESCE(m.expected_yield_pct, 0) >= 12 THEN 'yield' END,
        CASE WHEN COALESCE(m.activity_score, 0) >= 50 AND m.deals_7d >= 2 THEN 'stable' END,
        CASE WHEN m.volume_7d_usdt >= 1000 OR m.deals_7d >= 5 THEN 'demand' END,
        CASE WHEN m.active_secondary_listings_count > 0 THEN 'secondary' END,
        CASE WHEN COALESCE(m.expected_yield_pct, 0) >= 15 AND m.liquidity_score >= 50 THEN 'premium' END,
        CASE WHEN m.release_status_enum IN ('SOLD_OUT', 'ARCHIVED') THEN 'archive' END
      ], NULL) AS cats,
      CASE
        WHEN m.release_status_enum = 'PAUSED' THEN 'paused'
        WHEN m.release_status_enum = 'SOLD_OUT' THEN 'closed'
        WHEN m.liquidity_tag = 'low' AND m.active_secondary_listings_count = 0 THEN 'thin'
        ELSE 'active'
      END AS risk_st,
      CASE
        WHEN v_period = '24h' THEN COALESCE(m.volume_24h_usdt, 0)
        WHEN v_period IN ('30d', '90d') THEN COALESCE(m.volume_30d_usdt, m.volume_7d_usdt, 0)
        ELSE COALESCE(m.volume_7d_usdt, m.volume_24h_usdt, 0)
      END AS period_volume,
      (
        SELECT COALESCE(jsonb_agg(ROUND(ph.close_price::numeric, 4) ORDER BY ph.ts), '[]'::jsonb)
        FROM (
          SELECT close_price, ts FROM price_history
          WHERE release_id = m.id
            AND bucket = v_spark_bucket
            AND ts >= NOW() - v_interval
          ORDER BY ts ASC
          LIMIT v_spark_limit
        ) ph
      ) AS spark
    FROM market_overview_releases_v m
    WHERE (
      v_search IS NULL
      OR lower(m.title) LIKE '%' || lower(v_search) || '%'
      OR lower(m.symbol) LIKE '%' || lower(v_search) || '%'
      OR lower(m.artist) LIKE '%' || lower(v_search) || '%'
    )
    AND (p_genre IS NULL OR p_genre = 'all' OR lower(m.genre) LIKE '%' || lower(p_genre) || '%' OR lower(m.segment) LIKE '%' || lower(p_genre) || '%')
    AND (p_status IS NULL OR p_status = 'all' OR m.status_key = p_status)
    AND (p_payout_freq IS NULL OR p_payout_freq = 'all' OR m.payout_freq = p_payout_freq)
    AND (
      p_liquidity IS NULL OR p_liquidity = 'all'
      OR (p_liquidity = 'deep' AND m.liquidity_tag = 'high')
      OR (p_liquidity = 'mid' AND m.liquidity_tag = 'med')
      OR (p_liquidity = 'thin' AND m.liquidity_tag = 'low')
    )
    AND (
      p_yield IS NULL OR p_yield = 'all'
      OR (p_yield = 'high' AND COALESCE(m.expected_yield_pct, 0) >= 12)
      OR (p_yield = 'mid' AND COALESCE(m.expected_yield_pct, 0) >= 8 AND COALESCE(m.expected_yield_pct, 0) < 12)
      OR (p_yield = 'low' AND COALESCE(m.expected_yield_pct, 0) < 8)
    )
    AND (
      p_availability IS NULL OR p_availability = 'all'
      OR (p_availability = 'tight' AND m.available_units > 0 AND m.available_units < 100000)
      OR (p_availability = 'wide' AND m.available_units > 200000)
    )
    AND (
      p_category IS NULL OR p_category = 'all'
      OR p_category = ANY(ARRAY_REMOVE(ARRAY[
        CASE WHEN m.created_at >= NOW() - INTERVAL '14 days' THEN 'new' END,
        CASE WHEN COALESCE(m.expected_yield_pct, 0) >= 12 THEN 'yield' END,
        CASE WHEN COALESCE(m.activity_score, 0) >= 50 AND m.deals_7d >= 2 THEN 'stable' END,
        CASE WHEN m.volume_7d_usdt >= 1000 OR m.deals_7d >= 5 THEN 'demand' END,
        CASE WHEN m.active_secondary_listings_count > 0 THEN 'secondary' END,
        CASE WHEN COALESCE(m.expected_yield_pct, 0) >= 15 AND m.liquidity_score >= 50 THEN 'premium' END,
        CASE WHEN m.release_status_enum IN ('SOLD_OUT', 'ARCHIVED') THEN 'archive' END
      ], NULL))
    )
  ),
  counted AS (
    SELECT b.*, COUNT(*) OVER () AS tc FROM base b
  )
  SELECT
    c.id,
    c.slug,
    c.symbol,
    c.title,
    c.artist,
    c.genre,
    c.segment,
    c.last_price,
    c.volume_24h_usdt,
    c.volume_7d_usdt,
    c.volume_30d_usdt,
    0::numeric AS change_24h_pct,
    0::numeric AS change_7d_pct,
    c.liquidity_tag,
    c.liquidity_label_ru,
    c.spread_val,
    c.active_secondary_listings_count,
    COALESCE(c.expected_yield_pct, 0),
    COALESCE(c.payouts_total, 0),
    COALESCE(c.activity_score, 0),
    c.available_units,
    c.primary_unit_price_usdt,
    c.sec_label,
    'flat'::text,
    c.spark,
    c.status_label,
    c.status_key,
    c.payout_freq,
    c.cats,
    c.risk_st,
    c.tc
  FROM counted c
  ORDER BY
    CASE WHEN v_sort = 'yield' AND v_dir = -1 THEN COALESCE(c.expected_yield_pct, 0) END DESC NULLS LAST,
    CASE WHEN v_sort = 'yield' AND v_dir = 1 THEN COALESCE(c.expected_yield_pct, 0) END ASC NULLS LAST,
    CASE WHEN v_sort = 'payouts' AND v_dir = -1 THEN COALESCE(c.payouts_total, 0) END DESC NULLS LAST,
    CASE WHEN v_sort = 'payouts' AND v_dir = 1 THEN COALESCE(c.payouts_total, 0) END ASC NULLS LAST,
    CASE WHEN v_sort = 'units' AND v_dir = -1 THEN c.available_units END DESC NULLS LAST,
    CASE WHEN v_sort = 'units' AND v_dir = 1 THEN c.available_units END ASC NULLS LAST,
    CASE WHEN v_sort = 'activity' AND v_dir = -1 THEN c.period_volume END DESC NULLS LAST,
    CASE WHEN v_sort = 'activity' AND v_dir = 1 THEN c.period_volume END ASC NULLS LAST,
    CASE WHEN v_sort = 'activity' AND v_dir = -1 THEN COALESCE(c.activity_score, 0) END DESC NULLS LAST,
    CASE WHEN v_sort = 'activity' AND v_dir = 1 THEN COALESCE(c.activity_score, 0) END ASC NULLS LAST,
    c.symbol ASC
  LIMIT v_page_size
  OFFSET v_offset;
END;
$$;

