export type FundingCard = {
  kind: "funding";
  id: string;
  title: string;
  artist: string;
  genre: string;
  status: "open" | "payouts";
  raised: string;
  goal: string;
  pct: number;
  availablePct: string;
  forecastYield: string;
};

export type MarketCard = {
  kind: "market";
  id: string;
  title: string;
  artist: string;
  genre: string;
  sharePrice: string;
  sharePriceChange: string;
  lastMonthPayout: string;
};

export type CatalogItem = FundingCard | MarketCard;

export const catalogItems: CatalogItem[] = [
  {
    kind: "funding",
    id: "1",
    title: "Midnight Drive",
    artist: "Luna Pulse",
    genre: "Electronic",
    status: "open",
    raised: "28 450",
    goal: "50 000",
    pct: 57,
    availablePct: "12%",
    forecastYield: "8,7%",
  },
  {
    kind: "funding",
    id: "2",
    title: "Glass Echo",
    artist: "North Tide",
    genre: "Indie",
    status: "payouts",
    raised: "41 200",
    goal: "60 000",
    pct: 69,
    availablePct: "9,2%",
    forecastYield: "8,1%",
  },
  {
    kind: "market",
    id: "3",
    title: "City Lights",
    artist: "Neon District",
    genre: "Electronic",
    sharePrice: "245,50",
    sharePriceChange: "+2,18%",
    lastMonthPayout: "12,46",
  },
  {
    kind: "market",
    id: "7",
    title: "Velvet Line",
    artist: "Kairo West",
    genre: "Hip-hop",
    sharePrice: "189,20",
    sharePriceChange: "−0,42%",
    lastMonthPayout: "9,88",
  },
  {
    kind: "market",
    id: "8",
    title: "Blue Hour",
    artist: "Nora Keys",
    genre: "Jazz",
    sharePrice: "312,00",
    sharePriceChange: "+1,05%",
    lastMonthPayout: "15,02",
  },
  {
    kind: "funding",
    id: "4",
    title: "Amber Static",
    artist: "Velvet Wire",
    genre: "Pop",
    status: "open",
    raised: "12 100",
    goal: "40 000",
    pct: 30,
    availablePct: "18%",
    forecastYield: "10,2%",
  },
  {
    kind: "funding",
    id: "5",
    title: "Riverbed",
    artist: "Cold Atlas",
    genre: "Rock",
    status: "open",
    raised: "33 900",
    goal: "55 000",
    pct: 62,
    availablePct: "7%",
    forecastYield: "9,4%",
  },
  {
    kind: "funding",
    id: "6",
    title: "Paper Moon",
    artist: "June & Co",
    genre: "Indie",
    status: "payouts",
    raised: "52 000",
    goal: "52 000",
    pct: 100,
    availablePct: "0%",
    forecastYield: "6,8%",
  },
];
