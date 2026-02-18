import { format, parseISO, startOfMonth, endOfMonth, subMonths, isValid } from "date-fns";

export function formatDate(date: string | Date, pattern: string = "d MMM yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return isValid(d) ? format(d, pattern) : "";
}

export function formatDateShort(date: string | Date): string {
  return formatDate(date, "d MMM");
}

export function formatMonthYear(date: string | Date): string {
  return formatDate(date, "MMM yyyy");
}

export function formatISO(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function getMonthRange(date: Date) {
  return {
    start: formatISO(startOfMonth(date)),
    end: formatISO(endOfMonth(date)),
  };
}

export function getLastNMonths(n: number): { start: string; end: string; label: string }[] {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const date = subMonths(now, i);
    return {
      ...getMonthRange(date),
      label: formatMonthYear(date),
    };
  }).reverse();
}

export function toDateInputValue(date?: string | Date): string {
  if (!date) return formatISO(new Date());
  const d = typeof date === "string" ? parseISO(date) : date;
  return isValid(d) ? formatISO(d) : formatISO(new Date());
}
