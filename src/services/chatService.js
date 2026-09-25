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
  // 1. CHECK BROWSER CONNECTIVITY
  // --------------------------------------------------

  const browserOnline = isOnline();

  console.log(
    `🌐 Maia network status: ${browserOnline ? "ONLINE" : "OFFLINE"
    }`
  );

  // --------------------------------------------------
  // 2. ONLINE → BACKEND → GEMINI
  // --------------------------------------------------

  if (browserOnline) {
    console.log(
      "🟢 Network available → contacting Maia backend..."
    );

    try {
      const res = await api.post("/ai/guidance", {
        fullName: user?.fullName || "Mother",
        age: user?.age || "",
        pregnancyWeek:
          pregnancyWeek ||
          user?.pregnancyWeek ||
          1,
        question: cleanQuestion,
      });

      // Backend returns:
      // { success: true, response: "..." }

      const answer = res.data?.response;

      if (!answer || !answer.trim()) {
        throw new Error(
          "Backend returned an empty AI response."
        );
      }

      // ----------------------------------------------
      // Gemini succeeded
      // ----------------------------------------------

      console.log(
        "✅ Maia backend → Gemini response received."
      );

      await saveChat({
        question: cleanQuestion,
        normalizedQuestion:
          cleanQuestion.toLowerCase(),

        answer,

        pregnancyWeek:
          pregnancyWeek ||
          user?.pregnancyWeek ||
          1,

        source: "gemini",
        confidence: 100,
      });

      return {
        answer,
        source: "online",
        confidence: 1,
      };

    } catch (err) {

      // ----------------------------------------------
      // Backend/Gemini unavailable
      // ----------------------------------------------

      console.warn(
        "⚠️ Maia backend/Gemini unavailable.",
        err?.response?.data ||
        err?.message ||
        err
      );

      console.log(
        "🔄 Falling back to Maia's local knowledge..."
      );
    }

  } else {

    // ----------------------------------------------
    // TRUE OFFLINE
    // ----------------------------------------------

    console.log(
      "📴 No internet connection."
    );

    console.log(
      "📚 Using Maia's local knowledge..."
    );
  }


  // --------------------------------------------------
  // 3. LOCAL SEMANTIC SEARCH
  // --------------------------------------------------

  try {

    console.log(
      "🔎 Searching Maia's offline knowledge..."
    );

    const results = await localSemanticSearch(
      cleanQuestion,
      1
    );

    if (results?.length > 0) {

      const best = results[0];

      const score = Number(best.score);

      console.log(
        `📚 Best local match: ${score.toFixed(3)}`
      );

      // ----------------------------------------------
      // SAFE LOCAL MATCH
      // ----------------------------------------------

      if (
        Number.isFinite(score) &&
        score >= OFFLINE_CONFIDENCE_THRESHOLD
      ) {

        console.log(
          "✅ Relevant local knowledge found."
        );

        return {
          answer: best.metadata.text,
          source: browserOnline
            ? "fallback"
            : "offline",
          confidence: Number(
            score.toFixed(2)
          ),
        };
      }

      // ----------------------------------------------
      // WEAK LOCAL MATCH
      // ----------------------------------------------

      console.warn(
        `⚠️ Local result rejected. ` +
        `Score ${score.toFixed(3)} < ` +
        `threshold ${OFFLINE_CONFIDENCE_THRESHOLD}`
      );

    } else {

      console.log(
        "⚠️ No local knowledge matched the question."
      );
    }

  } catch (err) {

    console.error(
      "❌ Local semantic search failed:",
      err
    );
  }


  // --------------------------------------------------
  // 4. NO SAFE ANSWER → QUEUE
  // --------------------------------------------------

  try {

    await queueOfflineRequest({
      question: cleanQuestion,

      pregnancyWeek:
        pregnancyWeek ||
        user?.pregnancyWeek ||
        1,
    });

    console.log(
      "📥 Question saved to Maia's offline queue."
    );

  } catch (err) {

    console.error(
      "❌ Failed to queue question:",
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
  // 5. QUEUED RESPONSE
  // --------------------------------------------------

  return {
    answer:
      browserOnline
        ? "Maia's AI service is temporarily unavailable, and I couldn't find enough relevant information in my offline knowledge. I've saved your question and it can be answered when the AI service is available again."
        : "I couldn't find enough relevant information in Maia's offline knowledge. I've saved your question and it can be answered when an internet connection is available.",

    source: "queued",
    confidence: 0,
  };
}