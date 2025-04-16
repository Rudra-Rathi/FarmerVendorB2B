import { forwardRef, useMemo } from "react";
import { cn } from "@/lib/utils";

export function Legend({ className, items }: { className?: string; items: { name: string; value: string; color: string }[] }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4 text-sm", className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <div>
            {item.name}
            {item.value && <span className="font-medium ml-1">{item.value}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

const Chart = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    chartData?: any;
    chartOptions?: any;
    chartType?: string;
    legend?: { name: string; value: string; color: string }[];
    showLegend?: boolean;
    height?: number;
  }
>(
  (
    {
      className,
      chartData,
      chartOptions,
      chartType = "line",
      legend,
      showLegend = true,
      height = 250,
      ...props
    },
    ref
  ) => {
    // This component is a placeholder. In a real implementation,
    // you would render the chart library of your choice.
    // For this prototype, we are using Recharts in PriceChart.tsx
    
    return (
      <div
        ref={ref}
        className={cn("relative", className)}
        style={{ height: `${height}px` }}
        {...props}
      >
        {/* Chart implementation should go here */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* This would be replaced by the actual chart render */}
          <p className="text-muted-foreground">Chart Placeholder</p>
        </div>
        {showLegend && legend && <Legend items={legend} className="mt-4" />}
      </div>
    );
  }
);

Chart.displayName = "Chart";

export default Chart;
