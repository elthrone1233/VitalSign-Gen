import React, { useState } from "react";
import { VitalRecord } from "../types";
import { 
  Search, Trash2, ArrowUpDown, Download, Database, RefreshCw, Eye 
} from "lucide-react";
import { getProfileLabel, getProfileStyles } from "../utils/vitalGenerator";

interface HistoryTableProps {
  records: VitalRecord[];
  onSelectRecord: (record: VitalRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

export default function HistoryTable({
  records,
  onSelectRecord,
  onDeleteRecord,
  onClearAll,
}: HistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sexFilter, setSexFilter] = useState<string>("All");
  const [profileFilter, setProfileFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"generatedAt" | "fullName" | "age" | "bmi">("generatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter records
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.age.toString().includes(searchTerm) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      record.bmiCategory.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSex = sexFilter === "All" || record.sex === sexFilter;
    const matchesProfile = profileFilter === "All" || record.conditionProfile === profileFilter;

    return matchesSearch && matchesSex && matchesProfile;
  });

  // Sort records
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    let rawA = a[sortBy];
    let rawB = b[sortBy];

    if (rawA === null || rawA === undefined) return 1;
    if (rawB === null || rawB === undefined) return -1;

    if (typeof rawA === "string") {
      rawA = rawA.toLowerCase();
      rawB = (rawB as string).toLowerCase();
    }

    if (rawA < rawB) return sortOrder === "asc" ? -1 : 1;
    if (rawA > rawB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Handle Sort Trigger
  const toggleSort = (field: "generatedAt" | "fullName" | "age" | "bmi") => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Export History as CSV File
  const exportToCSV = () => {
    if (records.length === 0) return;
    
    const headers = [
      "Record ID",
      "Full Name",
      "Age",
      "Assigned Sex",
      "Height (cm)",
      "Weight (kg)",
      "Blood Pressure (mmHg)",
      "Heart Rate (bpm)",
      "Respiratory Rate (breaths/min)",
      "Temperature (C)",
      "BMI",
      "BMI Category",
      "Simulation Profile",
      "Timestamp Generated"
    ];

    const rows = records.map(r => [
      r.id,
      `"${r.fullName.replace(/"/g, '""')}"`,
      r.age,
      r.sex,
      r.height,
      r.weight,
      r.bpValue,
      r.hr,
      r.rr,
      r.temp,
      r.bmi,
      r.bmiCategory,
      r.conditionProfile,
      r.generatedAt
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\r\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `clinical-vitals-history-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export History as JSON Package
  const exportToJSON = () => {
    if (records.length === 0) return;
    const jsonStr = JSON.stringify(records, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `clinical-vitals-history-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800/85 rounded-2xl shadow-sm overflow-hidden space-y-4 p-5" id="history-section">
      
      {/* Search and Database Info Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4" id="history-control-header">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-sky-50 dark:bg-sky-950/40 rounded-lg text-sky-600 dark:text-sky-400">
            <Database className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Patient Case Logs</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Search and manage stored patient cases offline</p>
          </div>
        </div>

        {/* Database Quick Utilities */}
        <div className="flex space-x-2 items-center" id="history-action-utility-group">
          {records.length > 0 && (
            <>
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-650 dark:text-slate-350 cursor-pointer active:scale-95 transition-all"
                title="Export entire case history database to CSV spreadsheet"
                id="btn-csv-history"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>

              <button
                onClick={exportToJSON}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-650 dark:text-slate-350 cursor-pointer active:scale-95 transition-all"
                title="Backup database history as raw JSON"
                id="btn-json-history"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>

              <button
                onClick={() => {
                  if (confirm("Are you absolutely sure you want to completely erase the simulator clinical history? This is irreversible.")) {
                    onClearAll();
                  }
                }}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-rose-100 dark:border-rose-950/20 bg-rose-50/50 dark:bg-rose-950/10 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[11px] font-semibold text-rose-650 dark:text-rose-450 cursor-pointer active:scale-95 transition-all"
                id="btn-erase-history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge Node</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Advanced Query / Live Filter Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3" id="filters-container">
        {/* Search Input */}
        <div className="relative col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, age, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-sans"
          />
        </div>

        {/* Biological sex filter */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Sex Filter:</span>
          <select
            value={sexFilter}
            onChange={(e) => setSexFilter(e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg text-xs text-slate-700 dark:text-slate-300 font-sans cursor-pointer focus:outline-hidden"
          >
            <option value="All">All Biological Sexes</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Simulation profile filter */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Profile:</span>
          <select
            value={profileFilter}
            onChange={(e) => setProfileFilter(e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg text-xs text-slate-700 dark:text-slate-300 font-sans cursor-pointer focus:outline-hidden"
          >
            <option value="All">All Condition Profiles</option>
            <option value="healthy">Healthy Reference Only</option>
            <option value="feverish">Feverish / Infectious Only</option>
            <option value="hypertensive">Hypertensive Only</option>
            <option value="athletic">Athletic Only</option>
            <option value="tachycardia">Tachycardia Only</option>
            <option value="bradycardia">Bradycardia Only</option>
          </select>
        </div>
      </div>

      {/* Main Database Table Output */}
      {sortedRecords.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-800/10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center" id="history-empty-status">
          <Database className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400">No Patient Records Found</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Adjust your active filters or generate a case above to record and track simulator history logs.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800" id="case-logs-table-scroller">
          <table className="w-full text-left text-xs border-collapse" id="history-datatable">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">
                  <button onClick={() => toggleSort("fullName")} className="flex items-center space-x-1 hover:text-sky-600 cursor-pointer">
                    <span>Patient Profile</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3">
                  <button onClick={() => toggleSort("age")} className="flex items-center space-x-1 hover:text-sky-600 cursor-pointer">
                    <span>Age/Sex</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3">Vitals (BP/HR/RR/Temp)</th>
                <th className="py-2.5 px-3">
                  <button onClick={() => toggleSort("bmi")} className="flex items-center space-x-1 hover:text-sky-600 cursor-pointer">
                    <span>BMI Category</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3">Condition Profile</th>
                <th className="py-2.5 px-3">
                  <button onClick={() => toggleSort("generatedAt")} className="flex items-center space-x-1 hover:text-sky-600 cursor-pointer">
                    <span>Generated</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedRecords.map((record) => {
                const badgeStyle = getProfileStyles(record.conditionProfile);
                return (
                  <tr 
                    key={record.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-all font-sans"
                    id={`row-${record.id}`}
                  >
                    {/* Patient identity details */}
                    <td className="py-3 px-3 font-medium">
                      <div className="space-y-0.5">
                        <span className="text-slate-800 dark:text-slate-200 block font-semibold">{record.fullName}</span>
                        <span className="text-[10px] text-slate-400 font-mono select-all block">{record.id}</span>
                      </div>
                    </td>

                    {/* Age and assigned sex */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5 text-slate-600 dark:text-slate-400">
                        <span>{record.age} yrs</span>
                        <span className="text-[10.5px] border border-slate-200 dark:border-slate-800 text-slate-450 dark:text-slate-550 px-1 py-0.2 rounded-sm ml-1.5">{record.sex}</span>
                      </div>
                    </td>

                    {/* Vitals snapshot */}
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-650 dark:text-slate-350">
                      <div className="space-y-0.5">
                        <div>BP: <span className="font-bold text-slate-800 dark:text-slate-200">{record.bpValue}</span></div>
                        <div className="flex flex-wrap gap-x-2 text-[10px] text-slate-400">
                          <span>HR: <span className="text-slate-600 dark:text-slate-300 font-semibold">{record.hr}</span></span>
                          <span>RR: <span className="text-slate-600 dark:text-slate-300 font-semibold">{record.rr}</span></span>
                          <span>T: <span className="text-slate-600 dark:text-slate-300 font-semibold">{record.temp}°C</span></span>
                        </div>
                      </div>
                    </td>

                    {/* BMI category */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <span className="font-semibold block">{record.bmi}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          record.bmiCategory === "Normal" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30" :
                          record.bmiCategory === "Underweight" ? "bg-sky-50 text-sky-600 dark:bg-sky-900/30" :
                          record.bmiCategory === "Overweight" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30" :
                          "bg-rose-50 text-rose-600 dark:bg-rose-900/30"
                        }`}>
                          {record.bmiCategory}
                        </span>
                      </div>
                    </td>

                    {/* Simulated Scenario */}
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                        {getProfileLabel(record.conditionProfile)}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-3 text-slate-400 dark:text-slate-500 text-[10.5px] whitespace-nowrap">
                      {new Date(record.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      <span className="block text-[9.5px] opacity-80">{new Date(record.generatedAt).toLocaleDateString()}</span>
                    </td>

                    {/* Action Panel */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => onSelectRecord(record)}
                          className="p-1 px-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-sky-600 dark:text-sky-400 cursor-pointer"
                          title="View complete clinical chart/ticket on monitor"
                          id={`btn-view-${record.id}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteRecord(record.id)}
                          className="p-1 px-1.5 rounded-md border border-rose-100 dark:border-rose-950/40 hover:bg-rose-50 dark:hover:bg-rose-950/25 text-rose-500 cursor-pointer"
                          title="Delete case log"
                          id={`btn-del-${record.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
