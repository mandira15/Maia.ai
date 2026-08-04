import { useEffect, useRef, useState } from "react";
import { askMaia } from "../../services/chatService";
import { getUser, getChats } from "../../services/cacheService";
import "./ChatBox.css";

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
          source: chat.source || "cache",
          confidence:
            chat.confidence !== undefined
              ? chat.confidence / 100
              : 1,
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

    try {
      const user = await getUser();

      const response = await askMaia(
        currentQuestion,
        user?.pregnancyWeek || 1
      );

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: response.answer,   
          source: response.source,
          confidence: response.confidence,
        },
      ]);
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Something went wrong while processing your question.",
          source: "error",
          confidence: 0,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chatbox">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={msg.type}>
            <p>{msg.text}</p>

            {msg.type === "bot" && msg.source && (
              <small className="message-meta">
                {msg.source === "online" && "🟢 Live AI"}

                {msg.source === "offline" &&
                  "🟡 Offline Knowledge"}

                {msg.source === "cache" &&
                  "🟣 Cached Conversation"}

                {msg.source === "queued" &&
                  "⚪ Waiting for Internet"}

                {msg.source === "error" &&
                  "🔴 Error"}

                {msg.confidence !== undefined &&
                  ` • Confidence ${Math.round(
                    msg.confidence * 100
                  )}%`}
              </small>
            )}
          </div>
        ))}

        {loading && (
          <div className="bot">
            Maia is thinking...
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>

      <div className="chat-input">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask Maia anything..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        />

        <button
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default ChatBox;