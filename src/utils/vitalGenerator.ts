import { VitalRecord, PatientSex, SimulationProfile, BMICategory, VitalRanges } from "../types";

// Random number utility helpers
export function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomDecimalInRange(min: number, max: number, decimals: number = 1): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

// Age Category Detector
export function getAgeCategory(age: number): "infant" | "toddler" | "child" | "teen" | "adult" | "senior" {
  if (age <= 1) return "infant";
  if (age <= 3) return "toddler";
  if (age <= 12) return "child";
  if (age <= 18) return "teen";
  if (age <= 64) return "adult";
  return "senior";
}

// Human-friendly description of Age Categories
export function getAgeCategoryLabel(age: number): string {
  if (age <= 1) return "Infant (0-1 yr)";
  if (age <= 3) return "Toddler (1-3 yrs)";
  if (age <= 12) return "Child (4-12 yrs)";
  if (age <= 18) return "Teenager (13-18 yrs)";
  if (age <= 64) return "Adult (19-64 yrs)";
  return "Senior (65+ yrs)";
}

// Generate Realistic Height based on age and sex (if missing) - Calibrated for Asian demographics
export function generateHeight(age: number, sex: PatientSex): number {
  const cat = getAgeCategory(age);
  switch (cat) {
    case "infant":
      return randomInRange(48, 72);
    case "toddler":
      return randomInRange(75, 96);
    case "child":
      return randomInRange(90, 135);
    case "teen":
      if (sex === "Female") return randomInRange(140, 165);
      if (sex === "Male") return randomInRange(148, 176);
      return randomInRange(142, 170);
    case "adult":
    case "senior":
    default:
      if (sex === "Female") return randomInRange(145, 168);
      if (sex === "Male") return randomInRange(156, 180);
      return randomInRange(150, 174);
  }
}

// Generate Realistic Weight based on age and sex (if missing) - Calibrated for Asian demographics
export function generateWeight(age: number, sex: PatientSex): number {
  const cat = getAgeCategory(age);
  switch (cat) {
    case "infant":
      return randomDecimalInRange(2.8, 9.5, 1);
    case "toddler":
      return randomDecimalInRange(9.0, 15.0, 1);
    case "child":
      return randomDecimalInRange(12.0, 38.5, 1);
    case "teen":
      if (sex === "Female") return randomDecimalInRange(38.0, 58.0, 1);
      if (sex === "Male") return randomDecimalInRange(42.0, 68.0, 1);
      return randomDecimalInRange(40.0, 63.0, 1);
    case "adult":
    case "senior":
    default:
      if (sex === "Female") return randomDecimalInRange(42.0, 70.0, 1);
      if (sex === "Male") return randomDecimalInRange(52.0, 85.0, 1);
      return randomDecimalInRange(47.0, 78.0, 1);
  }
}

// Generate Mid-Upper Arm Circumference (MUAC) for age 0 to 3 in cm
export function generateMUAC(age: number): number {
  if (age <= 0.5) {
    // 0 to 6 months: typically 9.5 to 13 cm
    return randomDecimalInRange(9.5, 13.0, 1);
  } else if (age <= 1) {
    // 6 to 12 months: typically 11.0 to 14.5 cm
    return randomDecimalInRange(11.0, 14.5, 1);
  } else if (age <= 2) {
    // 1 to 2 yrs: 12 to 15.5 cm
    return randomDecimalInRange(12.0, 15.5, 1);
  } else {
    // 2 to 3 yrs: 12.5 to 16.5 cm
    return randomDecimalInRange(12.5, 16.5, 1);
  }
}

// Generate Waist Circumference (Waist) for age 0 to 3 in cm
export function generateWaist(age: number): number {
  if (age <= 0.5) {
    // 0 to 6 months: typically 32.0 to 44.0 cm
    return randomDecimalInRange(32.0, 44.0, 1);
  } else if (age <= 1) {
    // 6 to 12 months: typically 36.0 to 47.0 cm
    return randomDecimalInRange(36.0, 47.0, 1);
  } else if (age <= 2) {
    // 1 to 2 yrs: 38.0 to 50.0 cm
    return randomDecimalInRange(38.0, 50.0, 1);
  } else {
    // 2 to 3 yrs: 40.0 to 52.0 cm
    return randomDecimalInRange(40.0, 52.0, 1);
  }
}

// Calculate BMI
export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: BMICategory } {
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(2));
  
  let category: BMICategory = "Normal";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25.0) category = "Normal";
  else if (bmi < 30.0) category = "Overweight";
  else category = "Obese";

  return { bmi, category };
}

// Healthy Baseline Ranges by Age
export function getStandardHealthyRanges(age: number): VitalRanges {
  const cat = getAgeCategory(age);
  
  // Blood pressure setup
  let bp: { minSystolic: number; maxSystolic: number; minDiastolic: number; maxDiastolic: number } | null = null;
  if (age > 3) {
    if (age <= 12) {
      bp = { minSystolic: 90, maxSystolic: 110, minDiastolic: 60, maxDiastolic: 75 };
    } else if (age <= 18) {
      bp = { minSystolic: 100, maxSystolic: 120, minDiastolic: 65, maxDiastolic: 80 };
    } else if (age <= 64) {
      bp = { minSystolic: 110, maxSystolic: 130, minDiastolic: 70, maxDiastolic: 85 };
    } else {
      bp = { minSystolic: 115, maxSystolic: 145, minDiastolic: 70, maxDiastolic: 90 };
    }
  }

  // Heart Rate Setup
  let hr = { min: 60, max: 100 };
  if (age <= 1) hr = { min: 100, max: 160 };
  else if (age <= 3) hr = { min: 90, max: 150 };
  else if (age <= 5) hr = { min: 80, max: 140 };
  else if (age <= 12) hr = { min: 70, max: 120 };
  else if (age > 64) hr = { min: 55, max: 95 }; // Seniors slightly lower baseline

  // Respiratory Rate Setup
  let rr = { min: 12, max: 20 };
  if (age <= 1) rr = { min: 30, max: 60 };
  else if (age <= 2) rr = { min: 24, max: 40 };
  else if (age <= 5) rr = { min: 22, max: 34 };
  else if (age <= 12) rr = { min: 18, max: 30 };

  // Temperature Setup
  const temp = { min: 36.0, max: 37.5 };

  // Height Weight (Clean reference ranges calibrated for Asian demographics)
  let height = { min: 145, max: 180 };
  let weight = { min: 40, max: 85 };
  if (cat === "infant") {
    height = { min: 48, max: 72 };
    weight = { min: 2.8, max: 9.5 };
  } else if (cat === "toddler" || cat === "child") {
    height = { min: 75, max: 135 };
    weight = { min: 9.0, max: 38.5 };
  } else if (cat === "teen") {
    height = { min: 140, max: 176 };
    weight = { min: 38, max: 68 };
  }

  return { bp, hr, rr, temp, height, weight };
}

// Generate the full vital signs package
export function generateVitalRecord(params: {
  fullName: string;
  age: number;
  sex: PatientSex;
  height?: number;
  weight?: number;
  muac?: number;
  length?: number;
  waist?: number;
  conditionProfile: SimulationProfile;
}): VitalRecord {
  const { fullName, age, sex, conditionProfile } = params;
  
  // 1. Establish height/weight (generate if empty)
  const finalHeight = params.height && params.height > 0 ? params.height : generateHeight(age, sex);
  const finalWeight = params.weight && params.weight > 0 ? params.weight : generateWeight(age, sex);
  
  // 1b. MUAC, Length, and Waist (if child 0-3 years old)
  let finalMuac: number | undefined = undefined;
  let finalLength: number | undefined = undefined;
  let finalWaist: number | undefined = undefined;
  if (age <= 3) {
    finalMuac = params.muac && params.muac > 0 ? params.muac : generateMUAC(age);
    finalLength = params.length && params.length > 0 ? params.length : parseFloat((finalHeight + randomDecimalInRange(1.0, 2.5, 1)).toFixed(1));
    finalWaist = params.waist && params.waist > 0 ? params.waist : generateWaist(age);
  }
  
  // 2. BMI
  const { bmi, category: bmiCategory } = calculateBMI(finalWeight, finalHeight);

  // 3. Obtain basic range
  const ranges = getStandardHealthyRanges(age);

  // 4. Synthesize BP, HR, RR, and Temp based on profile condition rules
  let systolic: number | null = null;
  let diastolic: number | null = null;
  let bpValue = "N/A";
  let hr = 75;
  let rr = 16;
  let temp = 36.6;

  // Temperature logic
  if (conditionProfile === "feverish") {
    temp = randomDecimalInRange(38.1, 39.8, 1);
  } else if (conditionProfile === "athletic") {
    temp = randomDecimalInRange(36.1, 36.9, 1);
  } else {
    temp = randomDecimalInRange(36.0, 37.5, 1);
  }

  // Heart Rate (HR) logic
  const normalHRMin = ranges.hr.min;
  const normalHRMax = ranges.hr.max;
  if (conditionProfile === "feverish") {
    // fever increases metabolic rate / hr
    hr = randomInRange(Math.floor(normalHRMax * 0.9), Math.floor(normalHRMax * 1.25));
  } else if (conditionProfile === "athletic") {
    // lower resting heart rate in athletes
    const athleteFactor = age <= 12 ? 0.8 : 0.7; // infants/kids don't go down as much
    hr = randomInRange(Math.max(40, Math.floor(normalHRMin * athleteFactor)), Math.floor(normalHRMin * 1.05));
  } else if (conditionProfile === "tachycardia") {
    // High HR state
    const tachyMin = Math.max(101, normalHRMax + 5);
    hr = randomInRange(tachyMin, Math.floor(tachyMin * 1.4));
  } else if (conditionProfile === "bradycardia") {
    // Low HR state
    const bradyMax = Math.min(59, normalHRMin - 5);
    hr = randomInRange(38, Math.max(45, bradyMax));
  } else {
    // normal/healthy or default
    hr = randomInRange(normalHRMin, normalHRMax);
  }

  // Respiratory Rate (RR) logic
  const normalRRMin = ranges.rr.min;
  const normalRRMax = ranges.rr.max;
  if (conditionProfile === "feverish") {
    // rapid breathing due to metabolic demand
    rr = randomInRange(Math.floor(normalRRMax * 1.1), Math.floor(normalRRMax * 1.5));
  } else if (conditionProfile === "athletic") {
    // more efficient slow breathing
    rr = randomInRange(Math.max(10, Math.floor(normalRRMin * 0.85)), Math.floor(normalRRMin * 1.05));
  } else if (conditionProfile === "tachycardia" || conditionProfile === "hypertensive") {
    rr = randomInRange(Math.floor(normalRRMin * 1.1), Math.floor(normalRRMax * 1.2));
  } else {
    rr = randomInRange(normalRRMin, normalRRMax);
  }

  // Blood pressure (BP) logic (No BP for ages 0 to 3)
  if (age > 3 && ranges.bp) {
    let sMin = ranges.bp.minSystolic;
    let sMax = ranges.bp.maxSystolic;
    let dMin = ranges.bp.minDiastolic;
    let dMax = ranges.bp.maxDiastolic;

    if (conditionProfile === "hypertensive") {
      sMin += randomInRange(25, 40);
      sMax += randomInRange(35, 55);
      dMin += randomInRange(15, 25);
      dMax += randomInRange(20, 35);
    } else if (conditionProfile === "athletic") {
      sMin -= randomInRange(5, 12);
      sMax -= randomInRange(5, 10);
      dMin -= randomInRange(3, 8);
      dMax -= randomInRange(3, 8);
    } else if (conditionProfile === "feverish") {
      // fever increases heart function, might slightly elevate BP
      sMax += randomInRange(5, 12);
      dMax += randomInRange(2, 6);
    }

    systolic = randomInRange(sMin, sMax);
    diastolic = randomInRange(dMin, dMax);
    bpValue = `${systolic}/${diastolic}`;
  } else {
    bpValue = "N/A";
  }

  return {
    id: `REC-${Date.now()}-${randomInRange(100, 999)}`,
    fullName: fullName.trim() || generateRandomName(sex),
    age,
    sex,
    height: finalHeight,
    weight: finalWeight,
    bmi,
    bmiCategory,
    bpValue,
    systolic,
    diastolic,
    hr,
    rr,
    temp,
    conditionProfile,
    generatedAt: new Date().toISOString(),
    muac: finalMuac,
    length: finalLength,
    waist: finalWaist
  };
}

// Quick Names for Random Patient Generator
export function generateRandomName(sex: PatientSex): string {
  const maleFirsts = [
    "Juan", "James", "Alexander", "Liam", "Michael", "Ethan", "David", "Carlos", 
    "Kenji", "Mateo", "Oliver", "Noah", "Leo", "William", "Lucas", "Benjamin"
  ];
  const femaleFirsts = [
    "Maria", "Emma", "Olivia", "Sophia", "Isabella", "Mia", "Amelia", "Yuki", 
    "Sofia", "Camila", "Elena", "Ava", "Charlotte", "Amara", "Aria", "Harper"
  ];
  const otherFirsts = [
    "Alex", "Jordan", "Taylor", "Sam", "Morgan", "Robin", "Charlie", "Avery",
    "Casey", "Jamie", "Riley", "Skyler", "Finley", "Jesse", "Reese", "Hayden"
  ];

  const lasts = [
    "Dela Cruz", "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", 
    "Miller", "Davis", "Rodriguez", "Martinez", "Tanaka", "Silva", "Santos", 
    "Nguyen", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor"
  ];

  let first = "";
  if (sex === "Male") first = maleFirsts[randomInRange(0, maleFirsts.length - 1)];
  else if (sex === "Female") first = femaleFirsts[randomInRange(0, femaleFirsts.length - 1)];
  else first = otherFirsts[randomInRange(0, otherFirsts.length - 1)];

  const last = lasts[randomInRange(0, lasts.length - 1)];
  return `${first} ${last}`;
}

// Human readable simulation profile name
export function getProfileLabel(profile: SimulationProfile): string {
  switch (profile) {
    case "healthy": return "Normal / Healthy";
    case "feverish": return "Feverish / Infectious";
    case "hypertensive": return "Hypertensive (High BP)";
    case "athletic": return "Athletic (Low Resting Vitals)";
    case "tachycardia": return "Tachycardia (High Heart Rate)";
    case "bradycardia": return "Bradycardia (Low Heart Rate)";
    default: return "Normal";
  }
}

// Human readable simulation profile styling
export function getProfileStyles(profile: SimulationProfile): { bg: string; text: string; border: string; iconBg: string } {
  switch (profile) {
    case "healthy": 
      return { bg: "bg-emerald-50 dark:bg-emerald-950/20", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-900/40", iconBg: "bg-emerald-100 dark:bg-emerald-900/50" };
    case "feverish": 
      return { bg: "bg-amber-50 dark:bg-amber-950/20", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-900/40", iconBg: "bg-amber-100 dark:bg-amber-900/50" };
    case "hypertensive": 
      return { bg: "bg-red-50 dark:bg-red-950/20", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-900/40", iconBg: "bg-red-100 dark:bg-red-900/50" };
    case "athletic": 
      return { bg: "bg-blue-50 dark:bg-blue-950/20", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-900/40", iconBg: "bg-blue-100 dark:bg-blue-900/50" };
    case "tachycardia": 
      return { bg: "bg-orange-50 dark:bg-orange-950/20", text: "text-orange-700 dark:text-orange-400", border: "border-orange-200 dark:border-orange-900/40", iconBg: "bg-orange-100 dark:bg-orange-900/50" };
    case "bradycardia": 
      return { bg: "bg-indigo-50 dark:bg-indigo-950/20", text: "text-indigo-700 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-900/40", iconBg: "bg-indigo-100 dark:bg-indigo-900/50" };
    default: 
      return { bg: "bg-slate-50 dark:bg-slate-900", text: "text-slate-700 dark:text-slate-300", border: "border-slate-200", iconBg: "bg-slate-100" };
  }
}
