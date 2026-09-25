// Prototype symptom/tag extractor for Maia.
// This is intentionally deterministic and narrow to avoid false positives.
// The final triage decision remains in triageService.js.

const SYMPTOM_TAGS = [
  {
    tag: "severe_bleeding",
    keywords: [
      "severe bleeding",
      "heavy bleeding",
      "bleeding heavily",
      "lots of bleeding",
      "gushing bleeding",
    ],
  },
  {
    tag: "heavy_bleeding",
    keywords: [
      "heavy bleeding",
      "bleeding a lot",
      "excessive bleeding",
      "profuse bleeding",
    ],
  },
  {
    tag: "severe_abdominal_pain",
    keywords: [
      "severe abdominal pain",
      "severe stomach pain",
      "intense abdominal pain",
      "severe belly pain",
      "sharp abdominal pain",
    ],
  },
  {
    tag: "chest_pain",
    keywords: [
      "chest pain",
      "severe chest pain",
      "pain in my chest",
    ],
  },
  {
    tag: "fainting",
    keywords: [
      "fainting",
      "passed out",
      "i fainted",
      "I blacked out",
      "felt faint",
    ],
  },
  {
    tag: "shortness_of_breath",
    keywords: [
      "shortness of breath",
      "trouble breathing",
      "difficulty breathing",
      "can’t breathe",
      "can't breathe",
      "struggling to breathe",
    ],
  },
  {
    tag: "persistent_vomiting",
    keywords: [
      "persistent vomiting",
      "vomiting repeatedly",
      "can’t keep fluids down",
      "can't keep fluids down",
      "throwing up repeatedly",
    ],
  },
  {
    tag: "vomiting_with_dehydration",
    keywords: [
      "vomiting and dehydrated",
      "vomiting and unable to drink",
      "throwing up and dehydrated",
    ],
  },
  {
    tag: "severe_headache",
    keywords: [
      "severe headache",
      "worst headache",
      "throbbing headache",
      "bad headache",
    ],
  },
  {
    tag: "vision_changes",
    keywords: [
      "vision changes",
      "blurry vision",
      "vision is blurry",
      "double vision",
      "seeing spots",
    ],
  },
  {
    tag: "severe_nausea",
    keywords: [
      "severe nausea",
      "intense nausea",
      "constant nausea",
      "nausea is severe",
    ],
  },
  {
    tag: "persistent_dizziness",
    keywords: [
      "persistent dizziness",
      "dizzy all day",
      "constant dizziness",
      "feeling dizzy repeatedly",
    ],
  },
  {
    tag: "mild_cramping",
    keywords: [
      "mild cramping",
      "light cramping",
      "minor cramps",
      "slight cramps",
    ],
  },
  {
    tag: "mild_nausea",
    keywords: [
      "mild nausea",
      "slight nausea",
      "some nausea",
      "nausea a little",
    ],
  },
  {
    tag: "fatigue",
    keywords: [
      "fatigue",
      "very tired",
      "exhausted",
      "feeling tired",
    ],
  },
  {
    tag: "mild_headache",
    keywords: [
      "mild headache",
      "minor headache",
      "small headache",
    ],
  },
  {
    tag: "mild_dizziness",
    keywords: [
      "mild dizziness",
      "slight dizziness",
      "light dizziness",
    ],
  },
  {
    tag: "back_pain",
    keywords: [
      "back pain",
      "lower back pain",
      "back ache",
    ],
  },
  {
    tag: "leg_cramps",
    keywords: [
      "leg cramps",
      "calf cramps",
      "cramps in my legs",
    ],
  },
  {
    tag: "sleep_disturbance",
    keywords: [
      "sleep disturbance",
      "trouble sleeping",
      "can't sleep",
      "can't sleep well",
    ],
  },
];

function normalizeInput(rawText) {
  if (typeof rawText !== "string") {
    return "";
  }

  return rawText
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractSymptoms(message) {
  const normalized = normalizeInput(message);

  if (!normalized) {
    return {
      symptoms: [],
      matchedTerms: [],
    };
  }

  const symptoms = [];
  const matchedTerms = [];

  for (const mapping of SYMPTOM_TAGS) {
    for (const keyword of mapping.keywords) {
      const normalizedKeyword = normalizeInput(keyword);

      if (!normalizedKeyword) {
        continue;
      }

      const isExactPhraseMatch = normalized.includes(normalizedKeyword);
      if (!isExactPhraseMatch) {
        continue;
      }

      if (!symptoms.includes(mapping.tag)) {
        symptoms.push(mapping.tag);
      }

      if (!matchedTerms.some((term) => term.tag === mapping.tag && term.term === keyword)) {
        matchedTerms.push({
          tag: mapping.tag,
          term: keyword,
        });
      }
    }
  }

  return {
    symptoms,
    matchedTerms,
  };
}

export const SYMPTOM_TAG_MAP = SYMPTOM_TAGS;

export function extractSymptomsFromText(message) {
  return extractSymptoms(message);
}
