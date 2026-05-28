import React from "react";
import { VitalRecord, DashboardStats } from "../types";
import { Activity, Users, Award, TrendingUp, Sparkles } from "lucide-react";

interface DashboardStatsProps {
  records: VitalRecord[];
}

export default function DashboardStatsComponent({ records }: DashboardStatsProps) {
  // Compute Stats
  const total = records.length;
  const maleCount = records.filter(r => r.sex === "Male").length;
  const femaleCount = records.filter(r => r.sex === "Female").length;
  const otherCount = records.filter(r => r.sex === "Other").length;
  
  const avgAge = total > 0 
    ? parseFloat((records.reduce((sum, r) => sum + r.age, 0) / total).toFixed(1)) 
    : 0;

  const avgBmi = total > 0 
    ? parseFloat((records.reduce((sum, r) => sum + r.bmi, 0) / total).toFixed(1)) 
    : 0;

  // Age distribution calculation
  const ageGroups = {
    infant: records.filter(r => r.age <= 1).length,
    toddler: records.filter(r => r.age > 1 && r.age <= 3).length,
    child: records.filter(r => r.age > 3 && r.age <= 12).length,
    teen: records.filter(r => r.age > 12 && r.age <= 18).length,
    adult: records.filter(r => r.age > 18 && r.age <= 64).length,
    senior: records.filter(r => r.age > 64).length,
  };

  // BMI Category Distribution
  const bmiGroups = {
    Underweight: records.filter(r => r.bmiCategory === "Underweight").length,
    Normal: records.filter(r => r.bmiCategory === "Normal").length,
    Overweight: records.filter(r => r.bmiCategory === "Overweight").length,
    Obese: records.filter(r => r.bmiCategory === "Obese").length,
  };

  // Find max value in groups for scaling graphs
  const maxAgeGroupVal = Math.max(...Object.values(ageGroups), 1);
  const maxBmiGroupVal = Math.max(...Object.values(bmiGroups), 1);

  return (
    <div className="space-y-6" id="dashboard-analytics-section">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between" id="stat-card-total">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Generated</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 font-sans">{total}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Cumulative patient cases</p>
          </div>
          <div className="p-2.5 bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 rounded-lg">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Gender Demographics Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between" id="stat-card-gender">
          <div className="space-y-1 w-full">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Demographics</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-bold text-sky-600 dark:text-sky-400 font-sans">{maleCount}M</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-lg font-bold text-rose-500 dark:text-rose-400 font-sans">{femaleCount}F</span>
              {otherCount > 0 && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="text-lg font-bold text-teal-600 dark:text-teal-400 font-sans">{otherCount}O</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Distribution by biological sex</p>
          </div>
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Average Age Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between" id="stat-card-avg-age">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Mean Age</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 font-sans">{avgAge} <span className="text-xs font-medium text-slate-400">yrs</span></p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Mean age profile of history</p>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Average BMI Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between" id="stat-card-avg-bmi">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Mean BMI</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 font-sans">{avgBmi}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Body Mass Index average</p>
          </div>
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {total === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center" id="stat-empty-notice">
          <Sparkles className="w-7 h-7 mx-auto mb-2.5 text-slate-300 dark:text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Analytical Insights Offline</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Generate several sets of vital signs to see dynamic demographic charts and statistical metrics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="stats-data-analytics-row">
          {/* Age Distribution Custom Bar Diagram */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Patient Distribution by Age Group</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Frequency mapping per clinical age range</p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Infants (0-1 yr)", val: ageGroups.infant, color: "bg-sky-400 dark:bg-sky-500" },
                { label: "Toddlers (2-3 yrs)", val: ageGroups.toddler, color: "bg-teal-400 dark:bg-teal-500" },
                { label: "Children (4-12 yrs)", val: ageGroups.child, color: "bg-emerald-400 dark:bg-emerald-500" },
                { label: "Teens (13-18 yrs)", val: ageGroups.teen, color: "bg-indigo-400 dark:bg-indigo-500" },
                { label: "Adults (19-64 yrs)", val: ageGroups.adult, color: "bg-violet-400 dark:bg-violet-500" },
                { label: "Seniors (65+ yrs)", val: ageGroups.senior, color: "bg-pink-400 dark:bg-pink-500" },
              ].map((item, idx) => {
                const percentage = total > 0 ? (item.val / total) * 100 : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>{item.label}</span>
                      <span className="font-semibold">{item.val} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${total > 0 ? (item.val / maxAgeGroupVal) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BMI Category Composition */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Body Mass Index (BMI) Profiles</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Classification distribution among simulated subjects</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3" id="bmi-classification-dashboard-grid">
              {[
                { label: "Underweight (<18.5)", count: bmiGroups.Underweight, bg: "bg-sky-50 dark:bg-sky-950/20", border: "border-sky-100 dark:border-sky-900/40", text: "text-sky-700 dark:text-sky-300" },
                { label: "Normal (18.5-24.9)", count: bmiGroups.Normal, bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-100 dark:border-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300" },
                { label: "Overweight (25-29.9)", count: bmiGroups.Overweight, bg: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-100 dark:border-amber-900/40", text: "text-amber-700 dark:text-amber-300" },
                { label: "Obese (30.0+)", count: bmiGroups.Obese, bg: "bg-rose-50 dark:bg-rose-950/20", border: "border-rose-100 dark:border-rose-900/40", text: "text-rose-700 dark:text-rose-300" },
              ].map((item, idx) => {
                const percentage = total > 0 ? (item.count / total) * 100 : 0;
                return (
                  <div key={idx} className={`${item.bg} ${item.border} border p-3 rounded-lg flex flex-col justify-between h-20`}>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-tight">{item.label}</span>
                    <div className="flex justify-between items-baseline">
                      <span className={`text-xl font-bold ${item.text}`}>{item.count}</span>
                      <span className="text-xs font-mono opacity-80">{percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Visual Vector BMI Proportion bar */}
            <div className="space-y-1 pt-2">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Cumulative BMI Density Map</span>
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden flex">
                {bmiGroups.Underweight > 0 && (
                  <div 
                    style={{ width: `${(bmiGroups.Underweight / total) * 100}%` }} 
                    className="h-full bg-sky-400" 
                    title={`Underweight: ${bmiGroups.Underweight}`}
                  />
                )}
                {bmiGroups.Normal > 0 && (
                  <div 
                    style={{ width: `${(bmiGroups.Normal / total) * 100}%` }} 
                    className="h-full bg-emerald-400" 
                    title={`Normal: ${bmiGroups.Normal}`}
                  />
                )}
                {bmiGroups.Overweight > 0 && (
                  <div 
                    style={{ width: `${(bmiGroups.Overweight / total) * 100}%` }} 
                    className="h-full bg-amber-400" 
                    title={`Overweight: ${bmiGroups.Overweight}`}
                  />
                )}
                {bmiGroups.Obese > 0 && (
                  <div 
                    style={{ width: `${(bmiGroups.Obese / total) * 100}%` }} 
                    className="h-full bg-rose-400" 
                    title={`Obese: ${bmiGroups.Obese}`}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
