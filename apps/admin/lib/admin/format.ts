const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  timeZone: "UTC",
  timeZoneName: "short",
  year: "numeric",
});

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
  year: "numeric",
});

export const formatDateTime = (value: string | null) =>
  value ? dateTimeFormatter.format(new Date(value)) : "Not available";

export const formatDate = (value: string | null) =>
  value ? dateFormatter.format(new Date(value)) : "Not available";

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en").format(value);

export const formatPercentage = (value: number) =>
  new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(value) + "%";

export const humanizeKey = (value: string) =>
  value
    .replaceAll("_", " ")
    .replaceAll(".", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

export const statusLabel = (value: string) => {
  if (value === "pending") return "Waiting";
  if (value === "converted") return "Joined";
  return humanizeKey(value);
};
