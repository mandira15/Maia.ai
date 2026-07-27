import api from "../api/api";
import { isOnline } from "./networkService";
import {
  saveChat,
  getChats,
  queueOfflineRequest,
} from "./cacheService";

export async function askMaia(question, pregnancyWeek) {

  // Online
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

      return answer;

    } catch (err) {

      console.error(err);

    }

  }

  // Offline (temporary)

  const chats = await getChats();

  const found = chats.find(
    chat =>
      chat.normalizedQuestion ===
      question.toLowerCase().trim()
  );

  if (found)
    return found.answer;

  await queueOfflineRequest({
    question,
    pregnancyWeek,
  });

  return "I'm currently offline. I'll answer this once internet becomes available.";
}