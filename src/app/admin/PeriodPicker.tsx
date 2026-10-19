import {
  calendarDay,
  daysBetween,
  lastMonths,
  monthStart,
  shiftDay,
  type DateRange,
} from "@/lib/calendar";

function hrefFor(from: string, to: string) {
  return `/admin?from=${from}&to=${to}`;
}

export function PeriodPicker({ range }: { range: DateRange }) {
  const today = calendarDay();
  const months = lastMonths(today, 12);
  const spanStart = months[0]?.start || range.from;
  const spanDays = Math.max(1, daysBetween(spanStart, today) - 1);
  const left = Math.max(
    0,
    Math.min(100, (daysBetween(spanStart, range.from) - 1) / spanDays * 100),
  );
  const width = Math.max(
    3,
    Math.min(100 - left, daysBetween(range.from, range.to) / (spanDays + 1) * 100),
  );

  const presets = [
    { label: "Danas", from: today, to: today },
    { label: "7 dana", from: shiftDay(today, -6), to: today },
    { label: "30 dana", from: shiftDay(today, -29), to: today },
    { label: "Ovaj mesec", from: monthStart(today), to: today },
    { label: "90 dana", from: shiftDay(today, -89), to: today },
    { label: "Ova godina", from: `${today.slice(0, 4)}-01-01`, to: today },
  ];

  return (
    <section className="rounded-3xl border border-ink/8 bg-white/90 p-5 shadow-[0_18px_50px_-32px_rgba(20,17,16,0.55)] md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-muted uppercase">
            Period
          </p>
          <p className="mt-1 font-serif text-2xl md:text-3xl">
            {range.from === range.to
              ? "Jedan dan"
              : `${daysBetween(range.from, range.to)} dana`}
          </p>
        </div>
        <form action="/admin" method="get" className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-muted">
            Od
            <input
              type="date"
              name="from"
              defaultValue={range.from}
              max={today}
              min={shiftDay(today, -730)}
              className="ml-2 rounded-full border border-ink/10 bg-cream px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </label>
          <span className="text-muted">→</span>
          <label className="text-xs text-muted">
            Do
            <input
              type="date"
              name="to"
              defaultValue={range.to}
              max={today}
              min={shiftDay(today, -730)}
              className="ml-2 rounded-full border border-ink/10 bg-cream px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </label>
          <button type="submit" className="rounded-full bg-ink px-4 py-2 text-xs tracking-wide text-cream uppercase">
            Prikaži
          </button>
        </form>
      </div>

      <div className="mt-5">
        <div className="relative h-2 overflow-hidden rounded-full bg-ink/8">
          <div
            className="absolute inset-y-0 rounded-full bg-ink"
            style={{ left: `${left}%`, width: `${width}%` }}
          />
        </div>
        <div className="mt-3 grid grid-cols-6 gap-1 sm:grid-cols-12">
          {months.map((month) => {
            const active = month.end >= range.from && month.start <= range.to;
            return (
              <a
                key={month.key}
                href={hrefFor(month.start, month.end)}
                className={`rounded-full px-1 py-2 text-center text-[10px] tracking-wide uppercase ${
                  active ? "bg-ink text-cream" : "bg-cream text-ink/60 hover:bg-ink/8"
                }`}
              >
                {month.label.replace(".", "")}
              </a>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {presets.map((preset) => {
          const active = preset.from === range.from && preset.to === range.to;
          return (
            <a
              key={preset.label}
              href={hrefFor(preset.from, preset.to)}
              className={`rounded-full px-3 py-1.5 text-xs ${
                active
                  ? "bg-ink text-cream"
                  : "border border-ink/10 text-ink/70 hover:border-ink/30"
              }`}
            >
              {preset.label}
            </a>
          );
        })}
      </div>
    </section>
  );
}
