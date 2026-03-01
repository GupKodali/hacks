import { AvailabilityBlock, formatHour } from "@/app/dashboard/page"
import React from "react"

export function MiniAvailabilityGrid({
    disabled,
    availability,
    onToggle,
  }: {
    disabled: boolean
    availability: AvailabilityBlock[]
    onToggle: (day: number, hour: number) => void
  }) {
    const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const HOURS = [17, 18, 19, 20, 21]
  
    function isSelected(day: number, hour: number) {
      return availability.some((b) => b.day === day && b.hour === hour)
    }
  
    return (
      <div className="grid grid-cols-8 gap-2 text-xs">
        <div />
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center font-medium text-muted-foreground">
            {d}
          </div>
        ))}
  
        {HOURS.map((h) => (
          <React.Fragment key={h}>
            <div className="flex items-center justify-end pr-2 font-medium text-muted-foreground">
              {formatHour(h)}
            </div>
            {Array.from({ length: 7 }).map((_, day) => {
              const selected = isSelected(day, h)
              return (
                <button
                  key={`${day}-${h}`}
                  onClick={() => onToggle(day, h)}
                  className={`h-10 rounded-lg border transition ${
                    selected ? "bg-primary text-primary-foreground border-primary" : "bg-background"
                  }`}
                  aria-pressed={selected}
                  disabled={disabled}
                  title={`${DAY_LABELS[day]} ${formatHour(h)}`}
                >
                  {selected ? "✓" : ""}
                </button>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    )
  }