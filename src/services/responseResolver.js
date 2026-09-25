import { isOnline } from "./networkService";
import { localSemanticSearch } from "./localSemanticSearch";
import { embeddingsExist, getEmbeddings } from "./cacheService";
import { getStaticKnowledgeResponse } from "./staticKnowledgeService";

const OFFLINE_CONFIDENCE_THRESHOLD = 0.6;

export async function resolveResponse(query, options = {}) {
  const normalizedQuery = typeof query === "string" ? query.trim() : "";

  if (!normalizedQuery) {
    return {
      answer: null,
      tier: "unresolved",
      confidence: 0,
      shouldCallBackend: false,
    };
  }

  const browserOnline = isOnline();

  if (browserOnline) {
    return {
      tier: "online-gemini",
      shouldCallBackend: true,
    };
  }

  let kbAvailable = false;

  try {
    kbAvailable = await embeddingsExist();
    if (!kbAvailable) {
      const embeddings = await getEmbeddings();
      kbAvailable = Array.isArray(embeddings) && embeddings.length > 0;
    }
  } catch (error) {
    kbAvailable = false;
  }

  if (kbAvailable) {
    try {
      const results = await localSemanticSearch(normalizedQuery, 1);

      if (results && results.length > 0) {
        const best = results[0];
        const score = Number(best?.score);

        if (Number.isFinite(score) && score >= OFFLINE_CONFIDENCE_THRESHOLD) {
          return {
            answer: best?.metadata?.text || best?.text || null,
            tier: "offline-rag",
            confidence: Number(score.toFixed(2)),
            shouldCallBackend: false,
          };
        }
      }
    } catch (error) {
      // Fall through to static fallback when local retrieval is unavailable.
    }
  }

  const staticResponse = getStaticKnowledgeResponse(normalizedQuery);

  if (staticResponse) {
    return {
      ...staticResponse,
      tier: "cold-start-static",
      confidence: 1,
      shouldCallBackend: false,
    };
  }

  return {
    answer: null,
    tier: "unresolved",
    confidence: 0,
    shouldCallBackend: false,
  };
}
