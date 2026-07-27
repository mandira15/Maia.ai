import { useEffect, useState } from "react";
import { askMaia } from "../../services/chatService";
import { getUser, getChats } from "../../services/cacheService";
import "./ChatBox.css";
import { useRef } from "react";

function ChatBox() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Load previous chats
  useEffect(() => {
    async function loadChats() {
      const chats = await getChats();

      const formatted = [];

      chats.forEach((chat) => {
        formatted.push({
          type: "user",
          text: chat.question,
        });

        formatted.push({
          type: "bot",
          text: chat.answer,
        });
      });

      setMessages(formatted);
    }

    loadChats();
  }, []);

  async function handleSend() {
    if (!question.trim()) return;

    const currentQuestion = question;

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: currentQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    const user = await getUser();

    const answer = await askMaia(currentQuestion, user?.pregnancyWeek || 1);

    setMessages((prev) => [
      ...prev,
      {
        type: "bot",
        text: answer,
      },
    ]);

    setLoading(false);
  }

  return (
    <div className="chatbox">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={msg.type}>
            {msg.text}
          </div>
        ))}

        {loading && <div className="bot">Maia is thinking...</div>}
        <div ref={bottomRef}></div>
      </div>

      <div className="chat-input">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask Maia anything..."
        />

        <button onClick={handleSend} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
