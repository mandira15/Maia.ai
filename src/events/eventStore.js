import { dbPromise } from "../db/indexedDB";
import api from "../api/api";
import { isOnline } from "../services/networkService";

/*
 * Save a new health event locally in IndexedDB and attempt immediate backend sync if online.
 */
export async function saveHealthEvent(event) {
  const db = await dbPromise;
  await db.put("healthEvents", event);

  // Background push to backend if logged in and online
  const token = localStorage.getItem("token");
  if (token && isOnline()) {
    api.post("/dashboard/health-events", { events: [event] }).catch((err) => {
      console.warn("⚠️ Background event sync failed:", err?.message || err);
    });
  }
}

/*
 * Get all health events from local IndexedDB
 */
export async function getHealthEvents() {
  const db = await dbPromise;
  return await db.getAll("healthEvents");
}

/*
 * Delete all events (Testing or Account switch)
 */
export async function clearHealthEvents() {
  const db = await dbPromise;
  await db.clear("healthEvents");
}