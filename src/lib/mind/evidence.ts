/** How strong the research behind a statement or practice is, in LifeZoi Mind's own words. */
export type EvidenceLevel = "established" | "evidence-informed" | "emerging" | "preliminary" | "unproven";

export const EVIDENCE_LABELS: Record<EvidenceLevel, { label: string; meaning: string }> = {
  established: {
    label: "Established evidence",
    meaning: "Supported by many studies and by major health organizations.",
  },
  "evidence-informed": {
    label: "Evidence-informed practice",
    meaning: "Drawn from approaches with good research support, adapted here for self-help. The exact self-help version has not been tested on its own.",
  },
  emerging: {
    label: "Emerging research",
    meaning: "Promising results from a growing number of studies, but findings are still being confirmed.",
  },
  preliminary: {
    label: "Preliminary findings",
    meaning: "Early or small studies only. Treat as interesting, not settled.",
  },
  unproven: {
    label: "Unproven",
    meaning: "Popular claims without good research support.",
  },
};
