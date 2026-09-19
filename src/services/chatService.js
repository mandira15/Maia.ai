import api from "../api/api";
import { isOnline } from "./networkService";
import {
  saveChat,
  queueOfflineRequest,
} from "./cacheService";
import { localSemanticSearch } from "./localSemanticSearch";

/**
 * Maia's main conversation service.
 *
 * Routing priority:
 *
 * 1. Online + backend available → Gemini
 * 2. Offline OR backend unavailable → Local semantic search
 * 3. No relevant local answer → Offline queue
 */
export async function askMaia(question, pregnancyWeek) {
  const cleanQuestion = question.trim();

  if (!cleanQuestion) {
    return {
      answer: "Please enter a question.",
      source: "error",
      confidence: 0,
    };
  }

  console.log("🤖 Maia received question:", cleanQuestion);

  // =====================================================
  // 1. ONLINE → BACKEND → GEMINI
  // =====================================================

  if (isOnline()) {
    console.log("🟢 Maia is online. Trying Gemini...");

    try {
      const res = await api.post("/chat", {
        question: cleanQuestion,
        pregnancyWeek,
      });

      const answer = res.data?.answer;

      // Make sure backend actually returned an answer
      if (!answer) {
        throw new Error("Backend returned an empty answer.");
      }

      // Save successful online conversation locally
      await saveChat({
        question: cleanQuestion,
        normalizedQuestion: cleanQuestion.toLowerCase(),
        answer,
        pregnancyWeek,
        source: "gemini",
        confidence: 100,
      });

      console.log("✅ Gemini response received.");

      return {
        answer,
        source: "online",
        confidence: 1,
      };

    } catch (err) {
      console.warn(
        "⚠️ Gemini request failed. Falling back to offline knowledge.",
        err
      );
    }
  } else {
    console.log(
      "📴 Maia is offline. Using local knowledge."
    );
  }

  // =====================================================
  // 2. OFFLINE → LOCAL SEMANTIC SEARCH
  // =====================================================

  try {
    console.log("🔎 Searching Maia's offline knowledge...");

    const results = await localSemanticSearch(
      cleanQuestion,
      1
    );

    if (results.length > 0) {
      const best = results[0];

      console.log(
        "📚 Offline answer found.",
        "Score:",
        best.score
      );

      return {
        answer: best.metadata.text,
        source: "offline",
        confidence: Number(best.score.toFixed(2)),
      };
    }

    console.log(
      "⚠️ No relevant offline knowledge found."
    );

  } catch (err) {
    console.error(
      "❌ Offline semantic search failed:",
      err
    );
  }

  // =====================================================
  // 3. NO OFFLINE ANSWER → OUTBOX QUEUE
  // =====================================================

  try {
    await queueOfflineRequest({
      question: cleanQuestion,
      pregnancyWeek,
    });

    console.log(
      "📥 Question added to offline queue."
    );

  } catch (err) {
    console.error(
      "❌ Failed to queue offline request:",
      err
    );

    return {
      answer:
        "I couldn't process your question right now. Please try again.",
      source: "error",
      confidence: 0,
    };
  }

  // =====================================================
  // 4. QUEUED RESPONSE
  // =====================================================

  return {
    answer:
      "I couldn't find a relevant answer in my offline medical knowledge. Your question has been saved and will be answered when internet is available.",
    source: "queued",
    confidence: 0,
  };
}