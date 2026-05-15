/** Remaining time until `targetIso` (ISO 8601). */
export function getCountdownParts(
  targetIso: string,
  now: number = Date.now(),
): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
} {
  const target = Date.parse(targetIso);
  if (Number.isNaN(target)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  let diff = target - now;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const days = Math.floor(diff / 86400000);
  diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000);
  diff -= hours * 3600000;
  const minutes = Math.floor(diff / 60000);
  diff -= minutes * 60000;
  const seconds = Math.floor(diff / 1000);
  return { days, hours, minutes, seconds, expired: false };
}

/** Full / half / empty star counts for a 0–max rating (half when fractional part ≥ 0.5). */
export function starSegments(
  rating: number,
  maxStars: number,
): { full: number; half: boolean; empty: number } {
  const max = Math.max(1, Math.min(10, maxStars));
  const r = Math.min(max, Math.max(0, rating));
  let full = Math.floor(r + 1e-9);
  const remainder = r - full;
  const half = remainder >= 0.5 && full < max;
  if (half) full = Math.min(full, max - 1);
  const empty = max - full - (half ? 1 : 0);
  return { full, half, empty };
}

export function isoToDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

export function datetimeLocalToIso(local: string): string {
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}
