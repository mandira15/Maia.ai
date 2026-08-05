import { openDB } from "idb";

const DB_NAME = "MaiaDB";
const DB_VERSION = 2;

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {

    // User Profile
    if (!db.objectStoreNames.contains("user")) {
      db.createObjectStore("user", {
        keyPath: "id",
      });
    }

    // AI Chat History
    if (!db.objectStoreNames.contains("chatHistory")) {
      const chatStore = db.createObjectStore("chatHistory", {
        keyPath: "chatId",
        autoIncrement: true,
      });

      chatStore.createIndex("timestamp", "timestamp");
      chatStore.createIndex("week", "pregnancyWeek");
      chatStore.createIndex("question", "normalizedQuestion");
    }

    // Health Logs
    if (!db.objectStoreNames.contains("healthEvents")) {
      const eventStore = db.createObjectStore("healthEvents", {
        keyPath: "eventId",
      });

      eventStore.createIndex("type", "type");
      eventStore.createIndex("createdAt", "createdAt");
      eventStore.createIndex("logId", "logId");
    }

    // Offline Queue
    if (!db.objectStoreNames.contains("outbox")) {
      const outboxStore = db.createObjectStore("outbox", {
        keyPath: "id",
        autoIncrement: true,
      });

      outboxStore.createIndex("status", "status");
      outboxStore.createIndex("createdAt", "createdAt");
    }

    // App Settings
    if (!db.objectStoreNames.contains("settings")) {
      db.createObjectStore("settings", {
        keyPath: "key",
      });
    }
    // Semantic Search Embeddings
    if (!db.objectStoreNames.contains("embeddings")) {
      const embeddingStore = db.createObjectStore("embeddings", {
        keyPath: "id",
      });

      embeddingStore.createIndex("category", "metadata.category");
    }

  },
});