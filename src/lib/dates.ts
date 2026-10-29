export function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function localDateISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function monthPrefix(year: number, monthIndex: number): string {
  return `${year}-${pad(monthIndex + 1)}`;
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function monthLabel(year: number, monthIndex: number): string {
  const names = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${names[monthIndex]} ${year}`;
}

export function shiftMonth(
  year: number,
  monthIndex: number,
  delta: number,
): { year: number; monthIndex: number } {
  const next = new Date(year, monthIndex + delta, 1);
  return { year: next.getFullYear(), monthIndex: next.getMonth() };
}

export function isValidDateISO(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return false;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function compareDateISO(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}
