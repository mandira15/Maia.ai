import { generateEmbedding } from "./embeddingService";
import { getEmbeddings } from "./cacheService";
import { cosineSimilarity } from "../utils/cosineSimilarity";

export async function localSemanticSearch(query, k = 1) {
    const queryVector = await generateEmbedding(query);

    const corpus = await getEmbeddings();

    const scored = corpus
        .map(doc => ({
            ...doc,
            score: cosineSimilarity(queryVector, doc.embedding)
        }))
        .sort((a, b) => b.score - a.score);

    return scored.slice(0, k);
}