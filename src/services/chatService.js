import api from "../api/api";
import { isOnline } from "./networkService";

import {
  saveChat,
  queueOfflineRequest,
} from "./cacheService";

import { getUser } from "./cacheService";

import { localSemanticSearch } from "./localSemanticSearch";

// Minimum similarity required before Maia trusts an offline result.
// We can tune this after testing your actual retrieval scores.
const OFFLINE_CONFIDENCE_THRESHOLD = 0.6;

/**
 * Maia's main conversation service.
 *
 * Routing:
 *
 * ONLINE
 *   ↓
 * Backend /api/ai/guidance
 *   ↓
 * Gemini
 *
 * If backend fails:
 *   ↓
 * Local semantic search
 *
 * OFFLINE
 *   ↓
 * Local semantic search
 *
 * If no sufficiently relevant local answer:
 *   ↓
 * Offline queue
 */

export async function askMaia(question, pregnancyWeek) {
  const cleanQuestion = question.trim();

  // --------------------------------------------------
  // Empty question
  // --------------------------------------------------

  if (!cleanQuestion) {
    return {
      answer: "Please enter a question.",
      source: "error",
      confidence: 0,
    };
  }

  console.log("🤖 Maia received:", cleanQuestion);

  // Get locally cached user information
  let user = null;

  try {
    user = await getUser();
  } catch (err) {
    console.warn("⚠️ Could not load user profile:", err);
  }

  // --------------------------------------------------
  // 1. ONLINE → BACKEND → GEMINI
  // --------------------------------------------------

  if (isOnline()) {
    console.log("🟢 Maia is online. Connecting to Gemini...");

    try {
      const res = await api.post("/ai/guidance", {
        fullName: user?.fullName || "Mother",
        age: user?.age || "",
        pregnancyWeek: pregnancyWeek || user?.pregnancyWeek || 1,
        question: cleanQuestion,
      });

      // Backend returns { success, response }
      const answer = res.data?.response;

      if (!answer) {
        throw new Error("Backend returned an empty response.");
      }

      // Save successful Gemini conversation locally
      await saveChat({
        question: cleanQuestion,
        normalizedQuestion: cleanQuestion.toLowerCase(),
        answer,
        pregnancyWeek:
          pregnancyWeek || user?.pregnancyWeek || 1,
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

  // --------------------------------------------------
  // 2. OFFLINE → LOCAL SEMANTIC SEARCH
  // --------------------------------------------------

  try {
    console.log(
      "🔎 Searching Maia's offline knowledge..."
    );

    const results = await localSemanticSearch(
      cleanQuestion,
      1
    );

    if (results.length > 0) {
      const best = results[0];

      const score = Number(best.score);

      console.log(
        "📚 Best offline result score:",
        score
      );

      // Only trust sufficiently relevant results
      if (score >= OFFLINE_CONFIDENCE_THRESHOLD) {
        console.log(
          "✅ Relevant offline answer found."
        );

        return {
          answer: best.metadata.text,
          source: "offline",
          confidence: Number(score.toFixed(2)),
        };
      }

      console.warn(
        `⚠️ Offline result rejected. Score ${score.toFixed(
          2
        )} is below threshold ${OFFLINE_CONFIDENCE_THRESHOLD}.`
      );
    } else {
      console.log(
        "⚠️ No offline results found."
      );
    }

  } catch (err) {
    console.error(
      "❌ Offline semantic search failed:",
      err
    );
  }

  // --------------------------------------------------
  // 3. NO SAFE OFFLINE ANSWER → QUEUE
  // --------------------------------------------------

  try {
    await queueOfflineRequest({
      question: cleanQuestion,
      pregnancyWeek:
        pregnancyWeek || user?.pregnancyWeek || 1,
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

  // --------------------------------------------------
  // 4. QUEUED RESPONSE
  // --------------------------------------------------

  return {
    answer:
      "I couldn't find enough relevant information in Maia's offline knowledge. I've saved your question and it can be answered when an internet connection is available.",
    source: "queued",
    confidence: 0,
  };
}