export function titleizeStatus(value: string) {
  return value
    .toLowerCase()
    .replace(/-/g, " ")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatCurrency(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateShort(value: string | null | undefined) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date).replace(",", " ·");
}

export function formatMonthYear(value: string | null | undefined) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date).replace(",", " ·");
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatDistance(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }
  return `${value.toFixed(1)} mi`;
}

export function formatMiles(km: number | null | undefined) {
  if (km == null || Number.isNaN(km)) {
    return "—";
  }
  return `${(km * 0.621371).toFixed(1)} mi`;
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

export function formatDuration(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }
  if (value >= 60) {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${value} min`;
}
