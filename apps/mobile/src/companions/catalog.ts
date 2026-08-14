export const COMPANION_IDS = ["mori", "lumi", "piko"] as const;

export type CompanionId = (typeof COMPANION_IDS)[number];

export interface CompanionCatalogEntry {
  id: CompanionId;
  name: string;
  kind: string;
  flavor: string;
  accessibilityLabel: string;
}

export const COMPANION_CATALOG = [
  {
    id: "mori",
    name: "Mori",
    kind: "Meadow companion",
    flavor: "Calm and thoughtful",
    accessibilityLabel: "Mori, a calm mint seedling companion",
  },
  {
    id: "lumi",
    name: "Lumi",
    kind: "Starlight companion",
    flavor: "Warm and curious",
    accessibilityLabel: "Lumi, a curious lavender starlight companion",
  },
  {
    id: "piko",
    name: "Piko",
    kind: "Sunrise companion",
    flavor: "Bright and motivating",
    accessibilityLabel: "Piko, a bright peach sunrise companion",
  },
] as const satisfies readonly CompanionCatalogEntry[];

export const getCompanionDefinition = (id: CompanionId) =>
  COMPANION_CATALOG.find((companion) => companion.id === id) ??
  COMPANION_CATALOG[0];
