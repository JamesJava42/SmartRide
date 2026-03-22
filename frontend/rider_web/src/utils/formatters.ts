export function formatMiles(km: number) {
  return `${(km * 0.621371).toFixed(1)} mi`;
}

export function formatMinutes(durationSeconds: number) {
  return Math.round(durationSeconds / 60);
}

export function formatDate(isoString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoString)).replace(",", " ·");
}

export function formatDateShort(isoString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoString)).replace(",", " ·");
}

export function formatMonthYear(isoString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(isoString));
}

export function formatDateTime(value: string) {
  return formatDateShort(value);
}

export function formatCurrency(value: string | number | null | undefined) {
  const numeric = Number(value ?? 0);
  return `$${numeric.toFixed(2)}`;
}

export function shortAddress(address: string, maxLength = 25) {
  const trimmed = address.trim();
  if (!trimmed) return "—";
  if (/los angeles international airport/i.test(trimmed)) return "LAX Airport";
  if (/^home$/i.test(trimmed)) return "Home";
  const firstPart = trimmed.split(",")[0]?.trim() || trimmed;
  return firstPart.length > maxLength ? `${firstPart.slice(0, maxLength)}...` : firstPart;
}

export function getInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function titleizeStatus(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
