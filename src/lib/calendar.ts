const TZ = "Europe/Belgrade";
const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "maj",
  "jun",
  "jul",
  "avg",
  "sep",
  "okt",
  "nov",
  "dec",
];

export function calendarDay(value: Date | string = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(value));
}

export function shiftDay(day: string, amount: number) {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date + amount)).toISOString().slice(0, 10);
}

export function dayRange(end: string, length: number) {
  return Array.from({ length }, (_, index) =>
    shiftDay(end, -(length - 1 - index)),
  );
}

export function formatDayLabel(day: string) {
  const [, month, date] = day.split("-");
  return `${Number(date)}.${Number(month)}`;
}

export function monthStart(day: string) {
  return `${day.slice(0, 7)}-01`;
}

export function previousMonth(day: string) {
  const start = monthStart(day);
  const end = shiftDay(start, -1);
  return { start: monthStart(end), end };
}

export function isDay(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export function daysBetween(start: string, end: string) {
  const from = Date.parse(`${start}T00:00:00Z`);
  const to = Date.parse(`${end}T00:00:00Z`);
  return Math.round((to - from) / 86400000) + 1;
}

export function dayRangeInclusive(start: string, end: string) {
  return Array.from({ length: daysBetween(start, end) }, (_, index) =>
    shiftDay(start, index),
  );
}

export function monthEnd(day: string) {
  return shiftDay(monthStart(shiftDay(monthStart(day), 32)), -1);
}

export function shiftMonth(day: string, amount: number) {
  const [year, month] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + amount, 1)).toISOString().slice(0, 10);
}

export function formatLongDay(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return `${date}. ${MONTHS[month - 1]} ${year}`;
}

export function formatRangeLabel(from: string, to: string) {
  return `${formatLongDay(from)} – ${formatLongDay(to)}`;
}

export type DateRange = { from: string; to: string };

export function resolveDateRange(from?: string, to?: string): DateRange {
  const today = calendarDay();
  const min = shiftDay(today, -730);
  let end = isDay(to) && to <= today ? to : today;
  let start = isDay(from) ? from : shiftDay(end, -29);
  if (start > end) {
    const swap = start;
    start = end;
    end = swap;
  }
  if (start < min) start = min;
  if (end > today) end = today;
  return { from: start, to: end };
}

export function previousRange(range: DateRange): DateRange {
  const length = daysBetween(range.from, range.to);
  const to = shiftDay(range.from, -1);
  return { from: shiftDay(to, -(length - 1)), to };
}

export function lastMonths(end: string, count: number) {
  const origin = monthStart(end);
  return Array.from({ length: count }, (_, index) => {
    const start = shiftMonth(origin, -(count - 1 - index));
    const close = monthEnd(start);
    return {
      start,
      end: close > end ? end : close,
      key: start.slice(0, 7),
      label: MONTHS[Number(start.slice(5, 7)) - 1],
    };
  });
}
