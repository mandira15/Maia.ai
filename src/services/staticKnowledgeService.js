export const STATIC_KNOWLEDGE_RULES = [
  {
    priority: 100,
    keywords: [
      "emergency",
      "severe pain",
      "heavy bleeding",
      "bleeding",
      "shortness of breath",
      "chest pain",
      "severe headache",
      "faint",
      "fainting",
      "unconscious",
      "severe symptoms"
    ],
    answer:
      "If you have severe pain, heavy bleeding, fainting, chest pain, severe shortness of breath, or other alarming symptoms, seek urgent medical care or emergency help right away. Maia can share general information, but this is not a diagnosis."
  },
  {
    priority: 90,
    keywords: ["water", "hydration", "dehydration", "dehydrated", "drink", "fluids"],
    answer:
      "Staying hydrated is important in pregnancy. Sip water regularly and choose fluids that you tolerate well. If you are vomiting a lot, unable to keep fluids down, or feel dizzy, seek urgent professional medical care."
  },
  {
    priority: 80,
    keywords: ["nausea", "morning sickness", "vomit", "vomiting", "sick", "queasy"],
    answer:
      "Mild nausea can happen during pregnancy. Try small, frequent meals, bland foods, and sipping fluids slowly. If you cannot keep fluids down, feel very dehydrated, or have severe vomiting, seek urgent professional medical care."
  },
  {
    priority: 70,
    keywords: ["rest", "sleep", "tired", "fatigue", "exhausted"],
    answer:
      "Rest and sleep are important during pregnancy. Try to listen to your body, take breaks, and create a calm routine. If you feel very faint, short of breath, or have chest pain, seek urgent professional medical care."
  },
  {
    priority: 60,
    keywords: ["walk", "walking", "exercise", "physical activity", "movement"],
    answer:
      "Gentle movement like walking can help many pregnant people feel better, but it should feel comfortable and safe for you. Stop and get medical help if you have pain, bleeding, dizziness, or severe discomfort."
  },
  {
    priority: 50,
    keywords: ["nutrition", "food", "eat", "meal", "healthy eating", "diet"],
    answer:
      "Balanced meals with protein, fruits, vegetables, and regular snacks can help support pregnancy nutrition. Try to eat when you can and speak with a healthcare professional if you are struggling to keep food down or are losing weight."
  },
  {
    priority: 40,
    keywords: ["prenatal vitamin", "prenatal vitamins", "vitamin", "prenatal"],
    answer:
      "Prenatal vitamins are often recommended during pregnancy, but the right choice and timing should be guided by a healthcare professional. Avoid taking extra supplements without checking first."
  }
];

function normalizeQuery(query) {
  if (query === null || query === undefined) {
    return "";
  }

  return String(query)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildKeywordPattern(keyword) {
  const cleanedKeyword = normalizeQuery(keyword);

  if (!cleanedKeyword) {
    return null;
  }

  const words = cleanedKeyword.split(/\s+/);
  const patternText = words.map((word) => `\\b${word}\\b`).join("\\s+");

  return new RegExp(patternText, "i");
}

export function getStaticKnowledgeResponse(query) {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return null;
  }

  const matchedRule = [...STATIC_KNOWLEDGE_RULES]
    .sort((a, b) => b.priority - a.priority)
    .find((rule) =>
      rule.keywords
        .map(buildKeywordPattern)
        .filter(Boolean)
        .some((pattern) => pattern.test(normalizedQuery))
    );

  if (!matchedRule) {
    return null;
  }

  return {
    answer: matchedRule.answer,
    tier: "cold-start-static",
    confidence: 1
  };
}
