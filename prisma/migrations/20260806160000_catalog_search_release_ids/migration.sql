-- Allow filtering catalog_search_releases by an explicit set of release UUIDs
-- (used for "favorites only" from the client watchlist).

DROP FUNCTION IF EXISTS catalog_search_releases(
  text, text, text[], text[], text[],
  numeric, numeric, numeric, numeric, numeric,
  boolean, boolean, uuid, text, integer, integer
);

CREATE OR REPLACE FUNCTION catalog_search_releases(
  p_search text DEFAULT NULL,
  p_kind text DEFAULT 'all',
  p_genres text[] DEFAULT NULL,
  p_round_statuses text[] DEFAULT NULL,
  p_catalog_statuses text[] DEFAULT NULL,
  p_price_min numeric DEFAULT NULL,
  p_price_max numeric DEFAULT NULL,
  p_min_yield numeric DEFAULT NULL,
  p_min_progress numeric DEFAULT NULL,
  p_min_liquidity numeric DEFAULT NULL,
  p_secondary_only boolean DEFAULT false,
  p_available_only boolean DEFAULT false,
  p_artist_id uuid DEFAULT NULL,
  p_sort text DEFAULT 'relevance',
  p_page integer DEFAULT 1,
  p_page_size integer DEFAULT 24,
  p_release_ids uuid[] DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  slug text,
  symbol text,
  title text,
  artist text,
  artists text,
  genre text,
  segment text,
  tags text[],
  cover_url text,
  short_description text,
  release_date date,
  release_status text,
  catalog_status text,
  status_label text,
  risk_label text,
  round_status text,
  purchase_state text,
  payout_freq text,
  total_units numeric,
  units_sold numeric,
  available_units numeric,
  primary_unit_price_usdt numeric,
  raise_target_usdt numeric,
  hard_cap_usdt numeric,
  raised_usdt numeric,
  goal_usdt numeric,
  progress_pct numeric,
  expected_yield_pct numeric,
  secondary_market_enabled boolean,
  active_secondary_listings_count integer,
  best_secondary_ask_price numeric,
  last_trade_price numeric,
  volume_24h_usdt numeric,
  volume_7d_usdt numeric,
  liquidity_score numeric,
  next_payout_date date,
  card_kind text,
  relevance_score numeric,
  total_count bigint
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_search text := NULLIF(BTRIM(p_search), '');
  v_kind text := COALESCE(NULLIF(BTRIM(p_kind), ''), 'all');
  v_sort text := COALESCE(NULLIF(BTRIM(p_sort), ''), 'relevance');
  v_page integer := GREATEST(COALESCE(p_page, 1), 1);
  v_page_size integer := LEAST(GREATEST(COALESCE(p_page_size, 24), 1), 100);
  v_offset integer := (GREATEST(COALESCE(p_page, 1), 1) - 1) * LEAST(GREATEST(COALESCE(p_page_size, 24), 1), 100);
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT
      c.*,
      CASE
        WHEN v_search IS NULL THEN 0::numeric
        ELSE GREATEST(
          similarity(lower(c.title), lower(v_search)),
          similarity(lower(c.symbol), lower(v_search)),
          similarity(lower(c.slug), lower(v_search)),
          similarity(lower(COALESCE(c.genre, '')), lower(v_search)),
          similarity(lower(COALESCE(c.artist, '')), lower(v_search))
        )::numeric
      END AS relevance_score,
      catalog_effective_price(
        c.card_kind,
        c.primary_unit_price_usdt,
        c.best_secondary_ask_price,
        c.last_trade_price
      ) AS effective_price
    FROM catalog_public_releases_v c
    WHERE
      (p_release_ids IS NULL OR c.id = ANY (p_release_ids))
      AND (v_search IS NULL OR (
        c.title ILIKE '%' || v_search || '%'
        OR c.symbol ILIKE '%' || v_search || '%'
        OR c.slug ILIKE '%' || v_search || '%'
        OR COALESCE(c.genre, '') ILIKE '%' || v_search || '%'
        OR COALESCE(c.artist, '') ILIKE '%' || v_search || '%'
        OR COALESCE(c.short_description, '') ILIKE '%' || v_search || '%'
        OR similarity(lower(c.title), lower(v_search)) > 0.15
        OR similarity(lower(c.symbol), lower(v_search)) > 0.2
      ))
      AND (
        p_genres IS NULL
        OR EXISTS (
          SELECT 1
          FROM unnest(p_genres) AS req(raw_genre)
          WHERE catalog_normalize_genre(c.genre) = catalog_normalize_genre(req.raw_genre)
             OR lower(BTRIM(c.genre)) = lower(BTRIM(req.raw_genre))
        )
      )
      AND (p_round_statuses IS NULL OR c.round_status = ANY (p_round_statuses))
      AND catalog_matches_phase_filter(p_catalog_statuses, v_kind, c.card_kind, c.catalog_status)
      AND (NOT p_available_only OR c.purchase_state = 'available')
      AND (NOT p_secondary_only OR c.active_secondary_listings_count > 0)
      AND (p_artist_id IS NULL OR EXISTS (
        SELECT 1 FROM release_artists ra
        WHERE ra.release_id = c.id AND ra.artist_id = p_artist_id
      ))
      AND (p_min_yield IS NULL OR COALESCE(c.expected_yield_pct, 0) >= p_min_yield)
      AND (p_min_progress IS NULL OR COALESCE(c.progress_pct, 0) >= p_min_progress)
      AND (p_min_liquidity IS NULL OR COALESCE(c.liquidity_score, 0) >= p_min_liquidity)
      AND catalog_matches_kind_filter(v_kind, c.card_kind)
      AND (
        p_price_min IS NULL AND p_price_max IS NULL
        OR (
          (p_price_min IS NULL OR catalog_effective_price(
            c.card_kind,
            c.primary_unit_price_usdt,
            c.best_secondary_ask_price,
            c.last_trade_price
          ) >= p_price_min)
          AND (p_price_max IS NULL OR catalog_effective_price(
            c.card_kind,
            c.primary_unit_price_usdt,
            c.best_secondary_ask_price,
            c.last_trade_price
          ) <= p_price_max)
        )
      )
  ),
  ranked AS (
    SELECT
      b.*,
      COUNT(*) OVER () AS total_count,
      CASE
        WHEN b.purchase_state = 'sold_out' THEN 'Раунд закрыт'
        WHEN b.purchase_state = 'paused' THEN 'Пауза'
        WHEN b.purchase_state = 'unavailable' THEN 'Недоступно'
        WHEN b.round_status <> 'live' THEN 'Нет активного раунда'
        WHEN COALESCE(b.liquidity_score, 0) < 0.35 THEN 'Низкая ликвидность'
        ELSE 'Стандартный'
      END AS risk_label
    FROM base b
  )
  SELECT
    r.id,
    r.slug,
    r.symbol,
    r.title,
    r.artist,
    r.artists,
    r.genre,
    r.segment,
    r.tags,
    r.cover_url,
    r.short_description,
    r.release_date,
    r.release_status::text,
    r.catalog_status,
    r.status_label,
    r.risk_label,
    r.round_status,
    r.purchase_state,
    r.payout_freq,
    r.total_units,
    r.units_sold,
    r.available_units,
    r.primary_unit_price_usdt,
    r.raise_target_usdt,
    r.hard_cap_usdt,
    r.raised_usdt,
    r.goal_usdt,
    r.progress_pct,
    r.expected_yield_pct,
    r.secondary_market_enabled,
    r.active_secondary_listings_count,
    r.best_secondary_ask_price,
    r.last_trade_price,
    r.volume_24h_usdt,
    r.volume_7d_usdt,
    r.liquidity_score,
    r.next_payout_date,
    CASE
      WHEN v_kind = 'secondary' THEN 'market'
      ELSE r.card_kind
    END AS card_kind,
    r.relevance_score::numeric,
    r.total_count
  FROM ranked r
  ORDER BY
    CASE WHEN v_sort = 'relevance' AND v_search IS NOT NULL THEN r.relevance_score END DESC NULLS LAST,
    CASE WHEN v_sort IN ('newest', 'catalog_order') THEN r.created_at END DESC NULLS LAST,
    CASE WHEN v_sort = 'title_asc' THEN lower(r.title) END ASC NULLS LAST,
    CASE WHEN v_sort IN ('progress_desc', 'popularity') THEN r.progress_pct END DESC NULLS LAST,
    CASE WHEN v_sort IN ('yield', 'yield_desc', 'expected_yield_desc') THEN r.expected_yield_pct END DESC NULLS LAST,
    CASE WHEN v_sort IN ('liquidity', 'liquidity_desc') THEN r.liquidity_score END DESC NULLS LAST,
    CASE WHEN v_sort IN ('volume24h', 'volume24h_desc') THEN r.volume_24h_usdt END DESC NULLS LAST,
    CASE WHEN v_sort IN ('volume7d', 'volume7d_desc') THEN r.volume_7d_usdt END DESC NULLS LAST,
    CASE WHEN v_sort = 'price_asc' THEN r.effective_price END ASC NULLS LAST,
    CASE WHEN v_sort = 'price_desc' THEN r.effective_price END DESC NULLS LAST,
    CASE WHEN v_sort = 'available_units' THEN r.available_units END DESC NULLS LAST,
    CASE WHEN v_sort = 'recently_traded' THEN r.last_trade_at END DESC NULLS LAST,
    CASE WHEN v_sort = 'closing_soon' THEN r.available_units END ASC NULLS LAST,
    r.created_at DESC
  LIMIT v_page_size
  OFFSET v_offset;
END;
$$;
