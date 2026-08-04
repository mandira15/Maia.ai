export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB) {
    return 0;
  }

  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same dimension.");
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}