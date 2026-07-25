import { dbPromise } from "../db/indexedDB";

/* ===========================
   USER
=========================== */

export async function saveUser(user) {
  const db = await dbPromise;

  await db.put("user", {
    id: "currentUser",
    ...user,
  });
}

export async function getUser() {
  const db = await dbPromise;
  return await db.get("user", "currentUser");
}

/* ===========================
   CHAT
=========================== */

export async function saveChat(chat) {
  const db = await dbPromise;
  await db.add("chatHistory", {
    ...chat,
    timestamp: Date.now(),
    synced: false,
  });
}

export async function getChats() {
  const db = await dbPromise;
  return await db.getAll("chatHistory");
}

/* ===========================
   HEALTH LOGS
=========================== */

export async function saveHealthLog(log) {
  const db = await dbPromise;
  await db.add("healthLogs", {
    ...log,
    timestamp: Date.now(),
  });
}

export async function getHealthLogs() {
  const db = await dbPromise;
  return await db.getAll("healthLogs");
}

/* ===========================
   OFFLINE QUEUE
=========================== */

export async function queueOfflineRequest(request) {
  const db = await dbPromise;

  await db.add("outbox", {
    ...request,
    status: "pending",
    createdAt: Date.now(),
  });
}

export async function getPendingRequests() {
  const db = await dbPromise;
  return await db.getAll("outbox");
}