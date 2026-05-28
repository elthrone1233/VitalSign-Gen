import React from "react";

interface RangeVisualizerProps {
  label: string;
  value: number;
  minNormal: number;
  maxNormal: number;
  unit: string;
  lowAlarm?: number; // threshold under which it is critical
  highAlarm?: number; // threshold over which it is critical
}

export default function RangeVisualizer({
  label,
  value,
  minNormal,
  maxNormal,
  unit,
  lowAlarm,
  highAlarm
}: RangeVisualizerProps) {
  // Define bounds for the visualization bar
  const rangeSpan = maxNormal - minNormal;
  const lowerBound = lowAlarm ?? Math.max(0, minNormal - rangeSpan * 0.5);
  const upperBound = highAlarm ?? (maxNormal + rangeSpan * 0.5);
  
  // Calculate percentage of value position
  const totalSpan = upperBound - lowerBound;
  let percentage = ((value - lowerBound) / totalSpan) * 100;
  percentage = Math.max(0, Math.min(100, percentage)); // Clamp 0-100

  // Standard thresholds logic
  let status: "low" | "normal" | "high" = "normal";
  if (value < minNormal) status = "low";
  else if (value > maxNormal) status = "high";

  // Visual styling based on status
  const getStatusColor = () => {
    if (status === "low") return "bg-indigo-500 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40";
    if (status === "high") return "bg-rose-500 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40";
    return "bg-emerald-500 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40";
  };

  const getStatusLabel = () => {
    if (status === "low") return "Low Range";
    if (status === "high") return "Elevated";
    return "Normal";
  };

  return (
    <div className="space-y-1.5" id={`visualizer-group-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}>
      <div className="flex justify-between items-center text-xs">
        <span className="font-medium text-slate-500 dark:text-slate-400">{label} Status</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status === "normal" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200/50" : status === "low" ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 border-indigo-200/50" : "bg-rose-50 dark:bg-rose-950/20 text-rose-600 border-rose-200/50"}`}>
          {getStatusLabel()}
        </span>
      </div>

      <div className="relative w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex" id={`meter-bar-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}>
        {/* Under range indicator */}
        <div className="h-full bg-slate-200 dark:bg-slate-700/60" style={{ width: "25%" }}></div>
        {/* Normal range indicator */}
        <div className="h-full bg-emerald-100 dark:bg-emerald-950/40 border-x border-slate-200 dark:border-slate-800" style={{ width: "50%" }}></div>
        {/* Over range indicator */}
        <div className="h-full bg-slate-200 dark:bg-slate-700/60" style={{ width: "25%" }}></div>

        {/* Current Value Marker Indicator */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-md transform -translate-x-1/2 transition-all duration-500 ease-out"
          style={{ 
            left: `${percentage}%`,
            background: status === "normal" ? "#10b981" : status === "low" ? "#6366f1" : "#f43f5e"
          }}
          title={`${value} ${unit} (Normal ${minNormal}-${maxNormal})`}
        />
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-mono">
        <span>Min: {minNormal}{unit}</span>
        <span className="font-semibold text-slate-600 dark:text-slate-300">{value} {unit}</span>
        <span>Max: {maxNormal}{unit}</span>
      </div>
    </div>
  );
}
