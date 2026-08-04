import api from "../api/api";
import { isOnline } from "./networkService";
import {
  saveChat,
  getChats,
  queueOfflineRequest,
} from "./cacheService";

import { localSemanticSearch } from "./localSemanticSearch";

export async function askMaia(question, pregnancyWeek) {

  // ==========================
  // ONLINE MODE
  // ==========================

  if (isOnline()) {
    try {
      const res = await api.post("/chat", {
        question,
        pregnancyWeek,
      });

      const answer = res.data.answer;

      await saveChat({
        question,
        normalizedQuestion: question.toLowerCase().trim(),
        answer,
        pregnancyWeek,
        source: "gemini",
        confidence: 100,
      });

      return {
        answer,
        source: "online",
        confidence: 1,
      };

    } catch (err) {
      console.log("⚠️ Online request failed. Falling back to offline.");
    }
  }

  // ==========================
  // OFFLINE SEMANTIC SEARCH
  // ==========================

  try {

    const results = await localSemanticSearch(question, 1);

    if (results.length > 0) {

      const best = results[0];

      return {
        answer: best.metadata.text,
        source: "offline",
        confidence: Number(best.score.toFixed(2)),
      };

    }

  } catch (err) {

    console.error("Offline semantic search failed:", err);

  }

  // ==========================
  // OFFLINE CHAT CACHE
  // ==========================

  try {

  const results = await localSemanticSearch(question, 1);

  if (results.length > 0) {

    const best = results[0];

    return {
      answer: best.metadata.text,
      source: "offline",
      confidence: Number(best.score.toFixed(2)),
    };

  }

} catch (err) {

  console.error("Offline semantic search failed:", err);

}

  // ==========================
  // OUTBOX QUEUE
  // ==========================

  await queueOfflineRequest({
    question,
    pregnancyWeek,
  });

  return {
    answer:
      "I couldn't find a relevant answer in my offline medical knowledge. Your question has been saved and will be answered when internet is available.",
    source: "queued",
    confidence: 0,
  };
}