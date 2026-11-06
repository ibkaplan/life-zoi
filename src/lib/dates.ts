export function localISODate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isRealISODate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function formatMonth(isoMonth: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(isoMonth);
  if (!match) return isoMonth;
  const year = Number(match[1]);
  const month = Number(match[2]);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function formatLongDate(isoDate: string): string {
  if (!isRealISODate(isoDate)) return isoDate;
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatTimestamp(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

export function isFutureDate(isoDate: string, today: string): boolean {
  return isoDate > today;
}

export function mondayOf(isoDate: string): string {
  if (!isRealISODate(isoDate)) return "";
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay();
  const back = weekday === 0 ? 6 : weekday - 1;
  date.setUTCDate(date.getUTCDate() - back);
  return date.toISOString().slice(0, 10);
}

export function addIsoDays(isoDate: string, days: number): string {
  if (!isRealISODate(isoDate) || !Number.isInteger(days)) return "";
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function daysBetween(earlier: string, later: string): number | null {
  if (!isRealISODate(earlier) || !isRealISODate(later)) return null;
  const [startYear, startMonth, startDay] = earlier.split("-").map(Number);
  const [endYear, endMonth, endDay] = later.split("-").map(Number);
  const ms = Date.UTC(endYear, endMonth - 1, endDay) - Date.UTC(startYear, startMonth - 1, startDay);
  return Math.round(ms / 86_400_000);
}
