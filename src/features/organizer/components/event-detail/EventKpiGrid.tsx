import type { EventMetric } from "@/src/features/organizer/types/organizer";
import { EventMetricCard } from "./EventMetricCard";

type EventKpiGridProps = {
  metrics: EventMetric[];
};

export function EventKpiGrid({ metrics }: EventKpiGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      {metrics.map((metric) => (
        <EventMetricCard
          key={metric.label}
          label={metric.label}
          value={metric.value}
          helper={metric.helper}
          tone={metric.tone}
        />
      ))}
    </div>
  );
}
