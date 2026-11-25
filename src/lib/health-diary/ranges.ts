import { msg } from "@/lib/i18n/translate";
import type { BloodPressureReading, CholesterolReading, GlucoseReading, HealthReading, NewReading } from "./types";

/**
 * General reference ranges copied from public guidance, for comparison only.
 * They are not a diagnosis and not personal targets: a doctor may set
 * different targets for a person. The diary shows the source next to them.
 * Nothing here gives treatment advice.
 */
export type Tone = "ok" | "watch" | "high" | "urgent" | "low";

export type Comparison = { label: string; tone: Tone };

export type Source = { title: string; href: string; publisher: string };

export const SOURCES = {
  bp: {
    title: msg("Understanding blood pressure readings"),
    href: "https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings",
    publisher: "American Heart Association",
  },
  bpHome: {
    title: msg("Monitoring your blood pressure at home"),
    href: "https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings/monitoring-your-blood-pressure-at-home",
    publisher: "American Heart Association",
  },
  glucoseTargets: {
    title: msg("Checking your blood sugar"),
    href: "https://diabetes.org/living-with-diabetes/treatment-care/checking-your-blood-sugar",
    publisher: "American Diabetes Association",
  },
  glucoseLow: {
    title: msg("Hypoglycemia (low blood glucose)"),
    href: "https://diabetes.org/living-with-diabetes/treatment-care/hypoglycemia-low-blood-glucose",
    publisher: "American Diabetes Association",
  },
  glucoseDiagnosis: {
    title: msg("Diabetes diagnosis and tests"),
    href: "https://diabetes.org/about-diabetes/diagnosis",
    publisher: "American Diabetes Association",
  },
  glucoseTesting: {
    title: msg("Diabetes testing"),
    href: "https://www.cdc.gov/diabetes/diabetes-testing/index.html",
    publisher: "U.S. Centers for Disease Control and Prevention",
  },
  cholesterol: {
    title: msg("Cholesterol levels: what you need to know"),
    href: "https://medlineplus.gov/cholesterollevelswhatyouneedtoknow.html",
    publisher: "MedlinePlus (U.S. National Library of Medicine)",
  },
} satisfies Record<string, Source>;

/** Blood pressure categories for adults (American Heart Association). */
export function compareBloodPressure(reading: Pick<BloodPressureReading, "systolic" | "diastolic">): Comparison {
  const { systolic, diastolic } = reading;
  if (systolic > 180 || diastolic > 120) return { label: msg("Severely high: see the safety note"), tone: "urgent" };
  if (systolic >= 140 || diastolic >= 90) return { label: msg("Stage 2 high blood pressure range"), tone: "high" };
  if (systolic >= 130 || diastolic >= 80) return { label: msg("Stage 1 high blood pressure range"), tone: "high" };
  if (systolic >= 120) return { label: msg("Elevated range"), tone: "watch" };
  if (systolic < 90 || diastolic < 60) return { label: msg("Lower than the usual range"), tone: "low" };
  return { label: msg("Normal range"), tone: "ok" };
}

/**
 * Glucose in mg/dL compared with the ADA low blood glucose level (below 70)
 * and, for fasting readings, the ADA and CDC fasting ranges (below 100,
 * 100 to 125, 126 or higher). Those fasting numbers are for a lab test after
 * at least 8 hours without food; a diagnosis needs a doctor and a lab test.
 */
export function compareGlucose(reading: Pick<GlucoseReading, "glucose" | "context">): Comparison | null {
  const { glucose, context } = reading;
  if (glucose < 70) return { label: msg("Low: see the safety note"), tone: "low" };
  if (context !== "fasting") return null;
  if (glucose < 100) return { label: msg("Within the usual fasting range"), tone: "ok" };
  if (glucose < 126) return { label: msg("Above the usual fasting range"), tone: "watch" };
  return { label: msg("Well above the usual fasting range"), tone: "high" };
}

export type LipidComparison = { part: "total" | "ldl" | "hdl" | "triglycerides"; comparison: Comparison };

/**
 * Each typed number compared with the MedlinePlus ranges for adults 20 and
 * older: total below 200, LDL below 100, HDL 60 or more is best and low is
 * under 40 for men or under 50 for women, triglycerides below 150 normal,
 * 150 to 199 borderline high, 200 or more high.
 */
export function compareCholesterol(reading: Pick<CholesterolReading, "total" | "ldl" | "hdl" | "triglycerides">): LipidComparison[] {
  const out: LipidComparison[] = [];
  const ok = (label: string): Comparison => ({ label, tone: "ok" });
  const watch = (label: string): Comparison => ({ label, tone: "watch" });
  const high = (label: string): Comparison => ({ label, tone: "high" });
  if (reading.total !== null)
    out.push({ part: "total", comparison: reading.total < 200 ? ok(msg("Within the general range")) : high(msg("Above the general range")) });
  if (reading.ldl !== null)
    out.push({ part: "ldl", comparison: reading.ldl < 100 ? ok(msg("Within the general range")) : high(msg("Above the general range")) });
  if (reading.hdl !== null)
    out.push({
      part: "hdl",
      comparison:
        reading.hdl >= 60
          ? ok(msg("In the best range"))
          : reading.hdl >= 50
            ? ok(msg("Not low"))
            : reading.hdl >= 40
              ? watch(msg("Low for women, not low for men"))
              : { label: msg("Low"), tone: "low" },
    });
  if (reading.triglycerides !== null)
    out.push({
      part: "triglycerides",
      comparison: reading.triglycerides < 150 ? ok(msg("Within the general range")) : reading.triglycerides < 200 ? watch(msg("Borderline high")) : high(msg("Above the general range")),
    });
  return out;
}

export type SafetyNote = { title: string; body: string; emergency: boolean };

/**
 * A safety note for a reading that public guidance says needs attention.
 * It never says what treatment to take: only to measure again, follow the
 * plan from their own doctor, and when to call for help.
 */
export function safetyNoteFor(reading: HealthReading | NewReading): SafetyNote | null {
  if (reading.kind === "blood_pressure") {
    if (reading.systolic > 180 || reading.diastolic > 120)
      return {
        title: msg("This blood pressure reading is very high"),
        body: msg(
          "Wait one minute and measure again. If it is still this high and you have chest pain, shortness of breath, back pain, numbness, weakness, a change in vision, or trouble speaking, call your local emergency number now. If you have none of these, contact your doctor right away.",
        ),
        emergency: true,
      };
    if (reading.systolic < 90 || reading.diastolic < 60)
      return {
        title: msg("This blood pressure reading is low"),
        body: msg("Low readings can be normal for some people. If you feel dizzy, faint, confused, or unwell, contact your doctor. If someone faints and does not wake up, call your local emergency number."),
        emergency: false,
      };
    return null;
  }
  if (reading.kind === "glucose" && reading.glucose < 70)
    return {
      title: msg("This blood sugar reading is low"),
      body: msg(
        "Follow the low blood sugar plan your doctor gave you. If you feel shaky, sweaty, confused, or weak and it does not get better, get help. If someone cannot eat or drink safely, has a seizure, or passes out, call your local emergency number.",
      ),
      emergency: false,
    };
  return null;
}
