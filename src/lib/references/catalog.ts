export type LabCode = {
  id: string;
  loinc: string;
  topic: string;
  loincName: string;
  verifiedFrom: string;
};

/**
 * Codes were read from loinc.org on 2026-11-03. MedlinePlus Connect also
 * returned a topic title for each code on that date. Do not add a code
 * that has not been checked the same way.
 */
export const LAB_CODES: readonly LabCode[] = [
  {
    id: "hba1c",
    loinc: "4548-4",
    topic: "HbA1c",
    loincName: "Hemoglobin A1c/Hemoglobin.total in Blood",
    verifiedFrom: "https://loinc.org/4548-4",
  },
  {
    id: "glucose",
    loinc: "2345-7",
    topic: "Blood glucose",
    loincName: "Glucose [Mass/volume] in Serum or Plasma",
    verifiedFrom: "https://loinc.org/2345-7",
  },
  {
    id: "fasting-glucose",
    loinc: "1558-6",
    topic: "Fasting blood glucose",
    loincName: "Fasting glucose [Mass/volume] in Serum or Plasma",
    verifiedFrom: "https://loinc.org/1558-6",
  },
  {
    id: "cholesterol",
    loinc: "2093-3",
    topic: "Total cholesterol",
    loincName: "Cholesterol [Mass/volume] in Serum or Plasma",
    verifiedFrom: "https://loinc.org/2093-3",
  },
  {
    id: "ldl",
    loinc: "2089-1",
    topic: "LDL cholesterol",
    loincName: "Cholesterol in LDL [Mass/volume] in Serum or Plasma",
    verifiedFrom: "https://loinc.org/2089-1",
  },
  {
    id: "ldl-calculated",
    loinc: "13457-7",
    topic: "LDL cholesterol, calculated",
    loincName: "Cholesterol in LDL [Mass/volume] in Serum or Plasma by calculation",
    verifiedFrom: "https://loinc.org/13457-7",
  },
  {
    id: "hdl",
    loinc: "2085-9",
    topic: "HDL cholesterol",
    loincName: "Cholesterol in HDL [Mass/volume] in Serum or Plasma",
    verifiedFrom: "https://loinc.org/2085-9",
  },
  {
    id: "triglycerides",
    loinc: "2571-8",
    topic: "Triglycerides",
    loincName: "Triglyceride [Mass/volume] in Serum or Plasma",
    verifiedFrom: "https://loinc.org/2571-8",
  },
] as const;

const BY_LOINC = new Map(LAB_CODES.map((code) => [code.loinc, code]));

export function findLabCode(loinc: string): LabCode | null {
  return BY_LOINC.get(loinc.trim()) ?? null;
}
