import React, { useState, useEffect } from "react";
import { VitalRecord } from "../types";
import { 
  FileText, Printer, Download, Volume2, VolumeX, Shield, Info, Scale, Ruler, Calendar 
} from "lucide-react";
import { jsPDF } from "jspdf";
import RangeVisualizer, {  } from "./RangeVisualizer";
import { getAgeCategoryLabel, getStandardHealthyRanges, getProfileLabel, getProfileStyles } from "../utils/vitalGenerator";

interface VitalsCardProps {
  record: VitalRecord | null;
}

export default function VitalsCard({ record }: VitalsCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop reading if patient changes
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [record]);

  if (!record) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center space-y-3" id="empty-report-screen">
        <div className="w-12 h-12 rounded-full bg-slate-150 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-500">
          <FileText className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300">No Patient Record Active</h3>
          <p className="text-xs text-slate-400 max-w-xs leading-normal">Fill out the intake form or click "Quick Patient" to generate a set of randomized clinical vital signs instantly.</p>
        </div>
      </div>
    );
  }

  // Fetch healthy ranges for visualizations
  const healthyThresholds = getStandardHealthyRanges(record.age);

  // Text-To-Speech function
  const toggleSpeech = () => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const isPediatric = record.age <= 3;
    const heightLabel = isPediatric 
      ? `Height is ${record.height} centimeters. Recumbent length is ${record.length ?? record.height} centimeters.` 
      : `Height is ${record.height} centimeters.`;
    const muacSpeech = record.muac !== undefined ? `Mid-upper arm circumference is ${record.muac} centimeters. ` : "";
    const waistSpeech = record.waist !== undefined ? `Abdominal waist circumference is ${record.waist} centimeters. ` : "";

    const bpText = record.bpValue === "N/A" 
      ? "Blood pressure is Not Applicable for toddler age." 
      : `Blood pressure is ${record.systolic} over ${record.diastolic} millimeters of mercury.`;

    const textPayload = `
      Patient report for ${record.fullName}.
      Age is ${record.age} years old.
      Sex assigned is ${record.sex}.
      ${heightLabel} Weight is ${record.weight} kilograms. ${muacSpeech}${waistSpeech}
      Computed BMI is ${record.bmi}, which is classified as ${record.bmiCategory}.
      Vitals measurements:
      ${bpText}
      Heart rate is ${record.hr} beats per minute.
      Respiratory rate is ${record.rr} breaths per minute.
      Body temperature is ${record.temp} degrees Celsius.
      Simulation condition profile set to ${getProfileLabel(record.conditionProfile)}.
      Report verification completed.
    `;

    const utterance = new SpeechSynthesisUtterance(textPayload);
    utterance.rate = 0.95; // Professional medical clarity speed
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Trigger browser print for a specialized layout
  const handlePrint = () => {
    // Generate specialized print code or just trigger window.print
    // Since print works best on the entire window, we can set up a nice responsive CSS print stylesheet in index.css that cleans up page elements
    window.print();
  };

  // Perform PDF Generation using jsPDF
  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // 1. Decorative Medical Border/Header Accent
    doc.setFillColor(3, 115, 189); // Sky Medical Blue
    doc.rect(0, 0, 210, 8, "F");

    // 2. Official Medical Letterhead
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(33, 43, 54);
    doc.text("RANDOM VITAL SIGNS SIMULATOR", 15, 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 120, 130);
    doc.text("Clinical Patient Simulation Node • Asian Demographic Calibration Record", 15, 27);
    
    // Draw horizontal line
    doc.setDrawColor(220, 225, 230);
    doc.setLineWidth(0.4);
    doc.line(15, 31, 195, 31);

    // 3. Patient Information Card Layout
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(15, 36, 180, 42, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(3, 115, 189);
    doc.text("PATIENT DEMOGRAPHIC PROFILE (ASIAN DEMOGRAPHICS)", 20, 42);

    doc.setFontSize(10);
    doc.setTextColor(50, 60, 70);
    
    // Two column demographic labels
    doc.setFont("helvetica", "bold");
    doc.text("Full Name:", 20, 50);
    doc.setFont("helvetica", "normal");
    doc.text(record.fullName, 45, 50);

    doc.setFont("helvetica", "bold");
    doc.text("Age / Group:", 20, 56);
    doc.setFont("helvetica", "normal");
    doc.text(`${record.age} yrs (${getAgeCategoryLabel(record.age)})`, 45, 56);

    doc.setFont("helvetica", "bold");
    doc.text("Assigned Sex:", 20, 62);
    doc.setFont("helvetica", "normal");
    doc.text(record.sex, 45, 62);

    doc.setFont("helvetica", "bold");
    doc.text("Condition Profile:", 20, 68);
    doc.setFont("helvetica", "normal");
    doc.text(getProfileLabel(record.conditionProfile), 55, 68);

    // Right side items
    const isPediatric = record.age <= 3;

    if (isPediatric) {
      doc.setFont("helvetica", "bold");
      doc.text("Height:", 120, 50);
      doc.setFont("helvetica", "normal");
      doc.text(`${record.height} cm`, 148, 50);

      doc.setFont("helvetica", "bold");
      doc.text("Length:", 120, 56);
      doc.setFont("helvetica", "normal");
      doc.text(`${record.length ?? record.height} cm`, 148, 56);

      doc.setFont("helvetica", "bold");
      doc.text("Weight:", 120, 62);
      doc.setFont("helvetica", "normal");
      doc.text(`${record.weight} kg`, 148, 62);

      doc.setFont("helvetica", "bold");
      doc.text("Computed BMI:", 120, 68);
      doc.setFont("helvetica", "normal");
      doc.text(`${record.bmi} (${record.bmiCategory})`, 152, 68);

      let currentY = 74;
      if (record.muac !== undefined) {
        doc.setFont("helvetica", "bold");
        doc.text("MUAC:", 120, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(`${record.muac} cm`, 148, currentY);
        currentY += 6;
      }

      if (record.waist !== undefined) {
        doc.setFont("helvetica", "bold");
        doc.text("Waist Circ:", 120, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(`${record.waist} cm`, 148, currentY);
        currentY += 6;
      }

      doc.setFont("helvetica", "bold");
      doc.text("Record ID:", 120, currentY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(record.id, 140, currentY);
    } else {
      doc.setFont("helvetica", "bold");
      doc.text("Height:", 120, 50);
      doc.setFont("helvetica", "normal");
      doc.text(`${record.height} cm`, 148, 50);

      doc.setFont("helvetica", "bold");
      doc.text("Weight:", 120, 56);
      doc.setFont("helvetica", "normal");
      doc.text(`${record.weight} kg`, 148, 56);

      doc.setFont("helvetica", "bold");
      doc.text("Computed BMI:", 120, 62);
      doc.setFont("helvetica", "normal");
      doc.text(`${record.bmi} (${record.bmiCategory})`, 152, 62);

      doc.setFont("helvetica", "bold");
      doc.text("Record ID:", 120, 68);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(record.id, 140, 68);
    }

    // 4. Vital Signs Table Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(33, 43, 54);
    doc.text("CLINICAL VITAL SIGNS MEASUREMENTS", 15, 92);

    doc.setDrawColor(200, 205, 210);
    doc.setFillColor(235, 240, 245);
    doc.roundedRect(15, 96, 180, 8, 1, 1, "FD");

    doc.setFontSize(9);
    doc.setTextColor(50, 60, 70);
    doc.text("Vital Parameter", 20, 101.5);
    doc.text("Synthesized Value", 80, 101.5);
    doc.text("Healthy Reference Range", 130, 101.5);

    // Grid Row Helpers
    const drawRow = (y: number, param: string, val: string, range: string, lightBg: boolean) => {
      if (lightBg) {
        doc.setFillColor(250, 252, 254);
        doc.rect(15, y, 180, 10, "F");
      }
      doc.setDrawColor(235, 240, 245);
      doc.line(15, y + 10, 195, y + 10);
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 50, 60);
      doc.text(param, 20, y + 6);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(3, 115, 189);
      doc.text(val, 80, y + 6);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 110, 120);
      doc.text(range, 130, y + 6);
    };

    let startY = 104;
    // Row 1: BP
    const bpRangeStr = healthyThresholds.bp 
      ? `${healthyThresholds.bp.minSystolic}/${healthyThresholds.bp.minDiastolic} - ${healthyThresholds.bp.maxSystolic}/${healthyThresholds.bp.maxDiastolic} mmHg`
      : "Not Screened (Age <= 3)";
    drawRow(startY, "Blood Pressure (BP)", record.bpValue === "N/A" ? "N/A" : `${record.bpValue} mmHg`, bpRangeStr, false);

    // Row 2: Heart Rate
    const hrRangeStr = `${healthyThresholds.hr.min} - ${healthyThresholds.hr.max} bpm`;
    drawRow(startY + 10, "Heart Rate (HR)", `${record.hr} bpm`, hrRangeStr, true);

    // Row 3: Respiratory Rate
    const rrRangeStr = `${healthyThresholds.rr.min} - ${healthyThresholds.rr.max} breaths/min`;
    drawRow(startY + 20, "Respiratory Rate (RR)", `${record.rr} cpm`, rrRangeStr, false);

    // Row 4: Temperature
    const tempRangeStr = "36.0 - 37.5 °C";
    drawRow(startY + 30, "Body Temperature", `${record.temp} °C`, tempRangeStr, true);

    // 5. Medical Statement / Analysis Note
    doc.setFillColor(254, 252, 243);
    doc.setDrawColor(253, 236, 174);
    doc.roundedRect(15, 154, 180, 28, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(174, 110, 4);
    doc.text("Clinical Advisory & Verification Disclaimer", 20, 160);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(120, 100, 60);
    
    const lines = [
      "This electronic document represents a simulated randomized clinical scenario generated programmatically based on",
      "established physiological criteria calibrated specifically for Asian demographics. It is built strictly for simulation, instruction,",
      "engineering, and testing purposes, and MUST NOT be used for real diagnosis, clinical therapy, or official medical certification."
    ];
    doc.text(lines[0], 20, 166);
    doc.text(lines[1], 20, 171);
    doc.text(lines[2], 20, 176);

    // 6. Signature section
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(130, 140, 150);
    doc.text("Simulation Authenticator Code:", 15, 196);
    doc.setFont("courier", "normal");
    doc.text(`HASH-${record.id.replace("REC-", "")}`, 62, 196);

    doc.setFont("helvetica", "normal");
    doc.text("Generated by: amaranmorito@gmail.com", 15, 202);
    
    // Virtual Stamp
    doc.setDrawColor(3, 115, 189);
    doc.roundedRect(145, 190, 42, 18, 1, 1);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(3, 115, 189);
    doc.setFontSize(8);
    doc.text("VERIFIED SIMULATION", 148, 196);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text("AUTO-SECURE ENGINE", 151, 201);
    doc.text(`UTC ${new Date().toISOString().substring(0, 10)}`, 151, 205);

    // Footer lines
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Random Vital Signs Generator • All rights reserved.", 15, 275);
    doc.text(`Document Signature State: Signed and Cryptographically Generated • Date: ${new Date(record.generatedAt).toLocaleString()}`, 15, 280);

    // Save PDF
    doc.save(`clinical-simulation-${record.fullName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
  };

  const profileStyle = getProfileStyles(record.conditionProfile);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md overflow-hidden flex flex-col h-full print:border-none print:shadow-none" id="vitals-report-card">
      {/* Clinician Title Ribbon */}
      <div className="bg-sky-600 dark:bg-sky-500 text-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 print:hidden" id="report-ribbon">
        <div className="flex items-center space-x-2.5">
          <Shield className="w-5 h-5 text-sky-200 animate-pulse" />
          <div>
            <span className="text-[10px] font-bold tracking-widest text-sky-100 uppercase block leading-none">Vitals Simulated Result</span>
            <span className="text-sm font-bold block mt-0.5">Clinical Case Sheet</span>
          </div>
        </div>
        
        {/* Profile Mode Indicator Badge */}
        <div className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${profileStyle.bg} ${profileStyle.text} ${profileStyle.border} flex items-center space-x-1`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
          <span>{getProfileLabel(record.conditionProfile)}</span>
        </div>
      </div>

      {/* Sheet Content starts */}
      <div className="p-6 space-y-6 flex-1 print:p-0" id="case-sheet-body">
        {/* Header - shown only during print / pdf */}
        <div className="hidden print:block border-b border-slate-300 pb-3 mb-4 text-slate-800">
          <h1 className="text-xl font-bold uppercase tracking-wide">Random Vital Signs Simulator Report</h1>
          <p className="text-xs text-slate-500">Official Patient Clinical State Generation Node</p>
        </div>

        {/* Patient Demographic Bar */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-3" id="patient-card-demographics">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2.5">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-tight">Patient Full Name</span>
              <span className="text-base font-bold text-slate-800 dark:text-sky-400">{record.fullName}</span>
            </div>
            <div className="flex space-x-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-tight">Age</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{record.age} years</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-tight">Assigned Sex</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{record.sex}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-150 dark:border-slate-800" id="body-metrics-row">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tight flex items-center gap-1">Height</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{record.height} <span className="text-[10px] font-normal text-slate-400">cm</span></span>
            </div>
            {record.length !== undefined && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tight flex items-center gap-1 text-sky-600 dark:text-sky-400">Length</span>
                <span className="text-sm font-bold text-sky-600 dark:text-sky-400">{record.length} <span className="text-[10px] font-normal text-sky-500/80">cm</span></span>
              </div>
            )}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tight flex items-center gap-1">Weight</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{record.weight} <span className="text-[10px] font-normal text-slate-400">kg</span></span>
            </div>
            {record.waist !== undefined && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-450 tracking-tight flex items-center gap-1 text-sky-600 dark:text-sky-400">Waist Circ</span>
                <span className="text-sm font-bold text-sky-600 dark:text-sky-400">{record.waist} <span className="text-[10px] font-normal text-sky-500/80">cm</span></span>
              </div>
            )}
            {record.muac !== undefined && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-450 tracking-tight flex items-center gap-1 text-sky-600 dark:text-sky-400">MUAC</span>
                <span className="text-sm font-bold text-sky-600 dark:text-sky-400">{record.muac} <span className="text-[10px] font-normal text-sky-500/80">cm</span></span>
              </div>
            )}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tight">BMI / Category</span>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{record.bmi}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                  record.bmiCategory === "Normal" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30" :
                  record.bmiCategory === "Underweight" ? "bg-sky-50 text-sky-600 dark:bg-sky-900/30" :
                  record.bmiCategory === "Overweight" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30" :
                  "bg-rose-50 text-rose-600 dark:bg-rose-900/30"
                }`}>
                  {record.bmiCategory}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Vitals Metric Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="vitals-dashboard-bento-grid">
          
          {/* BP Parameter Box */}
          <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/40 relative group hover:border-sky-300 dark:hover:border-sky-900/60 transition-all flex flex-col justify-between" id="metric-bp-housing">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Blood Pressure</span>
              <span className="text-[9px] text-slate-400 font-mono">mmHg</span>
            </div>
            <div className="my-2.5">
              <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                {record.bpValue}
              </span>
            </div>
            {healthyThresholds.bp && record.systolic && record.diastolic ? (
              <div className="space-y-1.5 mt-2">
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Systolic Reference: {healthyThresholds.bp.minSystolic}-{healthyThresholds.bp.maxSystolic}</span>
                  <span>Diastolic: {healthyThresholds.bp.minDiastolic}-{healthyThresholds.bp.maxDiastolic}</span>
                </div>
                <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div className={`h-full ${record.systolic > healthyThresholds.bp.maxSystolic ? "bg-rose-500" : record.systolic < healthyThresholds.bp.minSystolic ? "bg-indigo-400" : "bg-emerald-400"}`} style={{ width: "50%" }}></div>
                  <div className={`h-full ${record.diastolic > healthyThresholds.bp.maxDiastolic ? "bg-rose-500" : record.diastolic < healthyThresholds.bp.minDiastolic ? "bg-indigo-400" : "bg-emerald-400"}`} style={{ width: "50%" }}></div>
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/40 p-1.5 rounded-md mt-1 italic leading-snug">
                Not simulated. Blood Pressure is clinically omitted for infants and children aged 0 to 3 years old.
              </div>
            )}
          </div>

          {/* HR Parameter Box */}
          <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/40 relative hover:border-sky-300 dark:hover:border-sky-900/60 transition-all" id="metric-hr-housing">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Heart Rate</span>
              <span className="text-[9px] text-rose-500 font-mono animate-pulse">bpm</span>
            </div>
            <div className="my-2.5 flex items-baseline space-x-1.5">
              <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                {record.hr}
              </span>
            </div>
            <RangeVisualizer 
              label="Pulse Rate"
              value={record.hr}
              minNormal={healthyThresholds.hr.min}
              maxNormal={healthyThresholds.hr.max}
              unit="bpm"
            />
          </div>

          {/* RR Parameter Box */}
          <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/40 relative hover:border-sky-300 dark:hover:border-sky-900/60 transition-all" id="metric-rr-housing">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Respiratory Rate</span>
              <span className="text-[9px] text-slate-400 font-mono">breaths/min</span>
            </div>
            <div className="my-2.5">
              <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                {record.rr}
              </span>
            </div>
            <RangeVisualizer 
              label="Respiratory"
              value={record.rr}
              minNormal={healthyThresholds.rr.min}
              maxNormal={healthyThresholds.rr.max}
              unit="cpm"
            />
          </div>

          {/* Temp Parameter Box */}
          <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/40 relative hover:border-sky-300 dark:hover:border-sky-900/60 transition-all" id="metric-temp-housing">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Temperature</span>
              <span className="text-[9px] text-slate-400 font-mono">°C</span>
            </div>
            <div className="my-2.5">
              <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                {record.temp}
              </span>
            </div>
            <RangeVisualizer 
              label="Body Temp"
              value={record.temp}
              minNormal={36.0}
              maxNormal={37.5}
              unit="°C"
            />
          </div>

        </div>

        {/* Advisory / Timestamp verification banner */}
        <div className="p-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/60 dark:border-amber-900/30 rounded-xl flex items-start space-x-2.5 text-slate-650 dark:text-slate-400" id="advisory-panel">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-[10px] leading-relaxed">
            <span className="font-semibold block text-amber-800 dark:text-amber-400">Simulation Node Verified Logs</span>
            These values are synthesized for patient demographic age profiles under academic simulation standards. All signatures are secure. Generated at {new Date(record.generatedAt).toLocaleString()}.
          </div>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/50 grid grid-cols-3 gap-2 flex-wrap print:hidden" id="report-utility-panel">
        
        {/* TTS Button */}
        <button
          onClick={toggleSpeech}
          className={`py-2 px-2.5 rounded-xl border font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95 transition-all ${
            isSpeaking 
              ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40 text-rose-600"
              : "bg-slate-100 dark:bg-slate-800 border-slate-250 dark:border-slate-850 text-slate-700 dark:text-slate-300"
          }`}
          title="Voice reading of vital signs generated results"
          id="btn-voice-readout"
        >
          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span>{isSpeaking ? "Stop Voice" : "Voice Read"}</span>
        </button>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="col-span-1 py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95 transition-all"
          title="Print case receipt"
          id="btn-print"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Card</span>
        </button>

        {/* PDF Export Button */}
        <button
          onClick={handleExportPDF}
          className="col-span-1 py-2 px-2.5 rounded-xl bg-sky-600 text-white hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-450 font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95 transition-all shadow-xs"
          title="Download official PDF copy"
          id="btn-export-pdf"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export PDF</span>
        </button>
      </div>
    </div>
  );
}
