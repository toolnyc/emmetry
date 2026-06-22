import { MONTH_NAMES } from "@/lib/dates";

interface DateFieldsProps {
  label: string;
  yearName: string;
  monthName: string;
  dayName: string;
  year?: string;
  month?: string;
  day?: string;
}

export function DateFields({
  label,
  yearName,
  monthName,
  dayName,
  year = "",
  month = "",
  day = "",
}: DateFieldsProps) {
  return (
    <div>
      <label
        className="block font-mono uppercase text-ghost-strong mb-2"
        style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-nav)" }}
      >
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          name={yearName}
          defaultValue={year}
          placeholder="YYYY"
          min={1600}
          max={2100}
          className="w-24 border border-rule bg-paper font-mono text-ink px-3 py-2 outline-none focus:border-ink"
          style={{ fontSize: "var(--text-body)" }}
        />
        <select
          name={monthName}
          defaultValue={month}
          className="border border-rule bg-paper font-mono text-ink px-3 py-2 outline-none focus:border-ink"
          style={{ fontSize: "var(--text-body)" }}
        >
          <option value="">Month</option>
          {MONTH_NAMES.map((m, i) => (
            <option key={m} value={String(i + 1).padStart(2, "0")}>
              {m}
            </option>
          ))}
        </select>
        <select
          name={dayName}
          defaultValue={day}
          className="w-20 border border-rule bg-paper font-mono text-ink px-3 py-2 outline-none focus:border-ink"
          style={{ fontSize: "var(--text-body)" }}
        >
          <option value="">Day</option>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
            <option key={d} value={String(d).padStart(2, "0")}>
              {d}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
