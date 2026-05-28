export type PatientSex = "Male" | "Female" | "Other";

export type SimulationProfile =
  | "healthy"
  | "feverish"
  | "hypertensive"
  | "athletic"
  | "tachycardia"
  | "bradycardia";

export interface VitalRanges {
  bp: { minSystolic: number; maxSystolic: number; minDiastolic: number; maxDiastolic: number } | null;
  hr: { min: number; max: number };
  rr: { min: number; max: number };
  temp: { min: number; max: number };
  height: { min: number; max: number };
  weight: { min: number; max: number };
}

export interface VitalRecord {
  id: string;
  fullName: string;
  age: number;
  sex: PatientSex;
  height: number; // in cm (represents recumbent length for ages 0-3)
  weight: number; // in kg
  bmi: number;
  bmiCategory: BMICategory;
  bpValue: string; // e.g. "120/80" or "N/A"
  systolic: number | null;
  diastolic: number | null;
  hr: number; // bpm
  rr: number; // cpm
  temp: number; // °C
  conditionProfile: SimulationProfile;
  generatedAt: string; // ISO String
  muac?: number; // Mid-Upper Arm Circumference (only for ages 0-3 in cm)
  length?: number; // Recumbent Length (only for ages 0-3 in cm)
  waist?: number; // Waist Circumference (only for ages 0-3 in cm)
}

export type BMICategory = "Underweight" | "Normal" | "Overweight" | "Obese";

export interface DashboardStats {
  totalRecords: number;
  maleCount: number;
  femaleCount: number;
  otherCount: number;
  avgAge: number;
  avgBmi: number;
  byAgeGroup: {
    infant: number;   // 0-1
    toddler: number;  // 2-3
    child: number;    // 4-12
    teen: number;     // 13-18
    adult: number;    // 19-64
    senior: number;   // 65+
  };
}
