// Prototype triage service for Maia.
// This is NOT a clinical protocol and requires validation before production use.
// The score below is a rule-match confidence score only, not a medical probability.

const TRIAGE_RULES = [
  {
    id: "EMERGENCY-01",
    classification: "emergency",
    priority: 100,
    triggers: ["severe_bleeding", "heavy_bleeding", "fainting", "severe_abdominal_pain", "chest_pain"],
    reasoning:
      "Severe bleeding, fainting, chest pain, or severe abdominal pain may indicate an urgent medical emergency and should be escalated immediately.",
  },
  {
    id: "EMERGENCY-02",
    classification: "emergency",
    priority: 100,
    triggers: ["shortness_of_breath", "trouble_breathing", "unconsciousness"],
    reasoning:
      "Breathing difficulty or unconsciousness is a high-priority emergency symptom and requires urgent assessed care.",
  },
  {
    id: "SEEK-CARE-SOON-01",
    classification: "seek-care-soon",
    priority: 75,
    triggers: ["persistent_vomiting", "vomiting_with_dehydration", "severe_headache", "vision_changes"],
    reasoning:
      "Persistent vomiting, dehydration, severe headache, or vision changes should be assessed promptly by a healthcare professional.",
  },
  {
    id: "SEEK-CARE-SOON-02",
    classification: "seek-care-soon",
    priority: 75,
    triggers: ["severe_nausea", "persistent_dizziness", "severe_mood_change"],
    reasoning:
      "Severe nausea, persistent dizziness, or marked mood changes warrant timely professional advice.",
  },
  {
    id: "MONITOR-01",
    classification: "monitor",
    priority: 50,
    triggers: ["mild_cramping", "mild_nausea", "fatigue", "mild_headache", "mild_dizziness"],
    reasoning:
      "Mild symptoms may be common during pregnancy, but they should be monitored and reassessed if they worsen.",
  },
  {
    id: "MONITOR-02",
    classification: "monitor",
    priority: 50,
    triggers: ["back_pain", "leg_cramps", "sleep_disturbance"],
    reasoning:
      "Common pregnancy discomforts may require monitoring and supportive care rather than emergency action.",
  },
];

const CLASSIFICATION_PRIORITY = {
  normal: 0,
  monitor: 1,
  "seek-care-soon": 2,
  emergency: 3,
};

const DEFAULT_RESULT = {
  classification: "normal",
  score: 0,
  triggeredRules: [],
  reasoning: "No predefined concerning symptom rule was triggered.",
};

function normalizeSymptoms(inputSymptoms) {
  if (!Array.isArray(inputSymptoms)) {
    return [];
  }

  return inputSymptoms
    .map((symptom) => (typeof symptom === "string" ? symptom.trim().toLowerCase() : ""))
    .filter(Boolean);
}

function computeScore(matchedRules) {
  if (!matchedRules.length) {
    return 0;
  }

  // Rule-match score only: it measures how strongly the known rule set matched the provided symptoms.
  // It is not a medical probability, diagnosis, or clinical safety estimate.
  const highestPriority = Math.max(...matchedRules.map((rule) => rule.priority));
  const matchedWeight = matchedRules.reduce((total, rule) => total + rule.priority, 0);

  return Math.min(100, Math.round((matchedWeight / (highestPriority * 2)) * 100));
}

export function triageSymptoms(symptomsInput) {
  const normalizedSymptoms = normalizeSymptoms(symptomsInput?.symptoms ?? symptomsInput ?? []);

  if (!normalizedSymptoms.length) {
    return { ...DEFAULT_RESULT };
  }

  const matchedRules = TRIAGE_RULES.filter((rule) =>
    rule.triggers.some((trigger) => normalizedSymptoms.includes(trigger))
  ).sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));

  if (!matchedRules.length) {
    return { ...DEFAULT_RESULT };
  }

  const winningRule = matchedRules[0];
  const winningClassification = winningRule.classification;

  const allTriggered = matchedRules.map((rule) => rule.id);
  const score = computeScore(matchedRules);

  const matchedSymptoms = normalizedSymptoms.filter((symptom) =>
    matchedRules.some((rule) => rule.triggers.includes(symptom))
  );

  const reasoning = `Flagged as ${winningClassification}: reported symptoms include ${matchedSymptoms.join(", ")}, matching protocol ${winningRule.id}.`;

  return {
    classification: winningClassification,
    score,
    triggeredRules: allTriggered,
    reasoning,
  };
}

export const TRIAGE_RULES_DATA = TRIAGE_RULES;
export const TRIAGE_CLASSIFICATIONS = Object.keys(CLASSIFICATION_PRIORITY);

export function triageSymptomsWithPriority(symptomsInput) {
  const result = triageSymptoms(symptomsInput);

  return {
    ...result,
    priority: CLASSIFICATION_PRIORITY[result.classification] ?? 0,
  };
}
