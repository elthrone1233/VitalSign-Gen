import React, { useState } from "react";
import { PatientSex, SimulationProfile } from "../types";
import { User, ShieldAlert, Sparkles, RotateCcw, Activity } from "lucide-react";
import { generateRandomName, randomInRange } from "../utils/vitalGenerator";

interface VitalFormProps {
  onGenerate: (data: {
    fullName: string;
    age: number;
    sex: PatientSex;
    height: number | "";
    weight: number | "";
    conditionProfile: SimulationProfile;
  }) => void;
  onReset: () => void;
}

export default function VitalForm({ onGenerate, onReset }: VitalFormProps) {
  // Local form states
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [sex, setSex] = useState<PatientSex>("Male");
  const [height, setHeight] = useState<number | "">("");
  const [weight, setWeight] = useState<number | "">("");
  const [conditionProfile, setConditionProfile] = useState<SimulationProfile>("healthy");

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Age
    const parsedAge = age === "" ? 25 : Number(age);
    if (parsedAge < 0 || parsedAge > 125) {
      alert("Please enter a valid age between 0 and 125.");
      return;
    }

    onGenerate({
      fullName: fullName,
      age: parsedAge,
      sex,
      height,
      weight,
      conditionProfile
    });
  };

  // Quick feature: Autofill Random Patient Identity
  const handleRandomizeAndGenerate = () => {
    // Randomize Age 0 to 90
    const randAge = randomInRange(0, 88);
    
    // Randomize Sex
    const sexes: PatientSex[] = ["Male", "Female", "Other"];
    const randSex = sexes[randomInRange(0, sexes.length - 1)];

    // Randomize Name
    const randName = generateRandomName(randSex);

    // Randomize profile
    const profiles: SimulationProfile[] = ["healthy", "feverish", "hypertensive", "athletic", "tachycardia", "bradycardia"];
    let randProfile = profiles[randomInRange(0, profiles.length - 1)];
    
    // BP rule: 0-3 years old cannot have hypertensive BP because they don't have BP.
    if (randAge <= 3 && randProfile === "hypertensive") {
      randProfile = "feverish"; // switch to feverish if toddler
    }

    // Set values in state
    setFullName(randName);
    setAge(randAge);
    setSex(randSex);
    setHeight(""); // Let generator compute realistic values
    setWeight(""); // Let generator compute realistic values
    setConditionProfile(randProfile);

    // Generate immediately
    onGenerate({
      fullName: randName,
      age: randAge,
      sex: randSex,
      height: "",
      weight: "",
      conditionProfile: randProfile
    });
  };

  // Perform Form Reset
  const handleReset = () => {
    setFullName("");
    setAge("");
    setSex("Male");
    setHeight("");
    setWeight("");
    setConditionProfile("healthy");
    onReset();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm p-5 space-y-5" id="patient-vital-form-wrapper">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3" id="form-header-container">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-sky-400">Patient Intake Form</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Enter details to synthesize clinical vitals (Asian baseline)</p>
          </div>
        </div>

        {/* Dynamic Preset Generator Button */}
        <button
          type="button"
          onClick={handleRandomizeAndGenerate}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-sky-200 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 text-xs font-semibold hover:bg-sky-50 dark:hover:bg-sky-950/65 cursor-pointer transition-all duration-200 shadow-2xs"
          title="Instantly generate a customized random patient"
          id="btn-quick-fill-random"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Patient</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" id="intake-form">
        {/* Full Name Input */}
        <div className="space-y-1">
          <label htmlFor="fullName" className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            Patient Full Name <span className="text-slate-400">(Optional)</span>
          </label>
          <input
            type="text"
            id="fullName"
            placeholder="e.g. Juan Dela Cruz"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-sans"
          />
          <p className="text-[10px] text-slate-400">Generates realistic random name if left blank.</p>
        </div>

        {/* Age and Sex Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="age" className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Age <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              id="age"
              required
              min="0"
              max="125"
              placeholder="e.g. 25"
              value={age}
              onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-sans"
            />
            <p className="text-[10px] text-slate-400">Age defines normal thresholds.</p>
          </div>

          <div className="space-y-1">
            <label htmlFor="sex" className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Assigned Sex <span className="text-rose-500">*</span>
            </label>
            <select
              id="sex"
              value={sex}
              onChange={(e) => setSex(e.target.value as PatientSex)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-850 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-sans cursor-pointer"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <p className="text-[10px] text-slate-400">Used for body dimensions.</p>
          </div>
        </div>

        {/* Height and Weight Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="height" className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Height <span className="text-slate-400">(cm)</span>
            </label>
            <input
              type="number"
              id="height"
              min="30"
              max="250"
              step="any"
              placeholder="Auto-generate"
              value={height}
              onChange={(e) => setHeight(e.target.value === "" ? "" : Number(e.target.value))}
              className="placeholder-slate-400/90 w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-sans"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="weight" className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Weight <span className="text-slate-400">(kg)</span>
            </label>
            <input
              type="number"
              id="weight"
              min="1"
              max="400"
              step="any"
              placeholder="Auto-generate"
              value={weight}
              onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
              className="placeholder-slate-400/90 w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-sans"
            />
          </div>
        </div>
        <p className="text-[10px] text-slate-400 -mt-2">Leave height/weight blank to generate realistic weight/height relative to age, calibrated for Asian standards.</p>

        {/* Advanced Feature: Condition Simulation Profile */}
        <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center space-x-1">
            <ShieldAlert className="w-3.5 h-3.5 text-sky-600 dark:text-sky-450" />
            <label htmlFor="conditionProfile" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Vitals Simulation Profile
            </label>
          </div>
          <select
            id="conditionProfile"
            value={conditionProfile}
            onChange={(e) => setConditionProfile(e.target.value as SimulationProfile)}
            className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer font-sans"
          >
            <option value="healthy">Standard / Healthy Reference (Ideal Vitals)</option>
            <option value="feverish">Feverish / Infectious (High Temp, Elevated HR/RR)</option>
            <option value="hypertensive" disabled={age !== "" && Number(age) <= 3}>
              Hypertensive State {age !== "" && Number(age) <= 3 ? "(Disabled for Age ≤ 3)" : "(High BP)"}
            </option>
            <option value="athletic">Athletic Training (Efficiently Low HR & RR)</option>
            <option value="tachycardia">Tachycardia / Hyperactive (Rapid HR & RR)</option>
            <option value="bradycardia">Bradycardia / Depressed (Substantially Low HR)</option>
          </select>
          <p className="text-[10px] text-slate-400/90 leading-tight">Simulates dynamic physiological anomalies within strict clinical constraints.</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2.5 pt-2" id="form-action-buttons-group">
          <button
            type="button"
            onClick={handleReset}
            className="col-span-1 py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-150 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all active:scale-95 flex items-center justify-center space-x-1 cursor-pointer"
            id="btn-reset-form"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="submit"
            className="col-span-2 py-2 px-4 rounded-xl font-bold bg-sky-600 text-white hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-450 text-xs shadow-md shadow-sky-500/10 hover:shadow-sky-500/20 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-1.5 active:translate-y-0 active:scale-97 cursor-pointer"
            id="btn-generate-vital-signs"
          >
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Generate Vitals</span>
          </button>
        </div>
      </form>
    </div>
  );
}
