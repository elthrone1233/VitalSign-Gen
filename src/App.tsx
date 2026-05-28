import React, { useState, useEffect } from "react";
import { VitalRecord, PatientSex, SimulationProfile } from "./types";
import { generateVitalRecord, getAgeCategoryLabel } from "./utils/vitalGenerator";
import VitalForm from "./components/VitalForm";
import VitalsCard from "./components/VitalsCard";
import DashboardStatsComponent from "./components/DashboardStats";
import HistoryTable from "./components/HistoryTable";
import { Activity, Sun, Moon, Info, Heart, Award, ShieldAlert, Sparkles } from "lucide-react";

export default function App() {
  // 1. Theme Configuration State (defaults to prefers-color-scheme)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("vital_sim_dark_mode");
    if (saved) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Apply dark class on state changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("vital_sim_dark_mode", String(isDark));
  }, [isDark]);

  // 2. Patient Database History States
  const [records, setRecords] = useState<VitalRecord[]>(() => {
    const stored = localStorage.getItem("vital_sim_records");
    return stored ? JSON.parse(stored) : [];
  });

  // Track the currently highlighted record on monitor
  const [activeRecord, setActiveRecord] = useState<VitalRecord | null>(() => {
    const stored = localStorage.getItem("vital_sim_records");
    if (stored) {
      const parsed = JSON.parse(stored) as VitalRecord[];
      if (parsed.length > 0) return parsed[0]; // fallback top record
    }
    return null;
  });

  // Auto-sync history database back to localstorage
  useEffect(() => {
    localStorage.setItem("vital_sim_records", JSON.stringify(records));
  }, [records]);

  // 3. Form action handlers
  const handleGenerateVitals = (formPayload: {
    fullName: string;
    age: number;
    sex: PatientSex;
    height: number | "";
    weight: number | "";
    conditionProfile: SimulationProfile;
  }) => {
    // Invoke scientific generator with payload parameters
    const newRecord = generateVitalRecord({
      fullName: formPayload.fullName,
      age: formPayload.age,
      sex: formPayload.sex,
      height: formPayload.height === "" ? undefined : formPayload.height,
      weight: formPayload.weight === "" ? undefined : formPayload.weight,
      conditionProfile: formPayload.conditionProfile,
    });

    // Save record to DB history
    setRecords((prev) => [newRecord, ...prev]);
    // Load as active focus on screen
    setActiveRecord(newRecord);
  };

  const handleResetForm = () => {
    // Wipe active record from monitor but preserve the database log history
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      // If the deleted record was active, load the next item or clear active
      if (activeRecord?.id === id) {
        setActiveRecord(updated.length > 0 ? updated[0] : null);
      }
      return updated;
    });
  };

  const handleClearAllRecords = () => {
    setRecords([]);
    setActiveRecord(null);
  };

  const handleSelectRecordFromHistory = (record: VitalRecord) => {
    setActiveRecord(record);
    // Smooth scroll to active monitor on small terminals
    const monitorElement = document.getElementById("vitals-report-card");
    if (monitorElement) {
      monitorElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200" id="application-container">
      
      {/* Clinicial Working Header Section */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 p-4 transition-colors sticky top-0 z-40 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand/Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 dark:bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/15 animate-pulse">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                Random Vital Signs Generator
              </h1>
              <p className="text-[11px] text-slate-450 dark:text-slate-400 font-mono leading-none">
                Interactive Medical Simulation Tool • V1.4
              </p>
            </div>
          </div>

          {/* Tools Panel */}
          <div className="flex items-center space-x-3.5">
            {/* Dark mode switch */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-855 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all shadow-3xs cursor-pointer"
              title="Toggle application style preset between Light and Dark themes"
              id="theme-toggle-btn"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-7">
        
        {/* Dynamic Vitals Workbenches */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="main-grid">
          
          {/* LEFT: Intake controls and Profile definitions (5-span width in 12-column grid) */}
          <div className="col-span-1 lg:col-span-5 space-y-6">
            <VitalForm 
              onGenerate={handleGenerateVitals} 
              onReset={handleResetForm} 
            />

            {/* Quick Helper Reference Panel */}
            <div className="bg-slate-100 dark:bg-slate-900/30 rounded-2xl p-4.5 border border-slate-200/80 dark:border-slate-850/80 space-y-3.5" id="referential-ranges-cheatsheet">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-sky-650 dark:text-sky-400 shrink-0" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide">Physiological Range Cheat Sheet</h4>
              </div>

              <div className="text-[11px] text-slate-500 space-y-2 max-h-56 overflow-y-auto pr-1">
                <p className="leading-relaxed">Below are some of the active scientific thresholds referenced by our deterministic randomization engines:</p>
                <div className="space-y-1.5 font-mono text-[10.5px]">
                  <div className="border-b border-dashed border-slate-200 dark:border-slate-800 pb-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Blood Pressure (BP) Rules:</span>
                    <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-525 dark:text-slate-425">
                      <li>Age 0–3: bp is omitted (N/A)</li>
                      <li>Age 4–12: 90/60 – 110/75 mmHg</li>
                      <li>Age 13–18: 100/65 – 120/80 mmHg</li>
                      <li>Adult 19–64: 110/70 – 130/85 mmHg</li>
                      <li>Senior 65+: 115/70 – 145/90 mmHg</li>
                    </ul>
                  </div>

                  <div className="border-b border-dashed border-slate-200 dark:border-slate-800 pb-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Normal Heart Rates (HR):</span>
                    <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-525 dark:text-slate-425">
                      <li>Infant (0–1): 100–160 bpm</li>
                      <li>Toddler (1–3): 90–150 bpm</li>
                      <li>Preschool (4–5): 80–140 bpm</li>
                      <li>School Child: 70–120 bpm</li>
                      <li>Teen & Adult: 60–100 bpm</li>
                      <li>Senior (65+): 55–95 bpm</li>
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Normal Respiratory (RR):</span>
                    <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-525 dark:text-slate-425">
                      <li>Infant: 30–60 cpm</li>
                      <li>Toddler: 24–40 cpm</li>
                      <li>Preschool: 22–34 cpm</li>
                      <li>School Age: 18–30 cpm</li>
                      <li>Teen & Adult: 12–20 cpm</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Real-time Monitor Display (7-span width) */}
          <div className="col-span-1 lg:col-span-7">
            <VitalsCard record={activeRecord} />
          </div>

        </div>

        {/* Dynamic Analytics dashboard */}
        <DashboardStatsComponent records={records} />

        {/* Database Search & Logs Management table */}
        <HistoryTable 
          records={records}
          onSelectRecord={handleSelectRecordFromHistory}
          onDeleteRecord={handleDeleteRecord}
          onClearAll={handleClearAllRecords}
        />

      </main>

      {/* Footer Details */}
      <footer className="border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-450 dark:text-slate-500 transition-colors print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center justify-center gap-1">
            Build with absolute <Heart className="w-3.5 h-3.5 text-rose-500 fill-current animate-pulse" /> for medical education and clinic research simulation nodes.
          </p>
          <div className="flex space-x-4">
            <span>Offline Simulator DB</span>
            <span>•</span>
            <span>Signed Secure Node</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
