import { dbPromise } from "../db/indexedDB";

/*
 * Save a new health event
 */
export async function saveHealthEvent(event) {
  const db = await dbPromise;
  await db.put("healthEvents", event);
}

/*
 * Get all health events
 */
export async function getHealthEvents() {
  const db = await dbPromise;
  return await db.getAll("healthEvents");
}

/*
 * Delete all events (Testing)
 */
export async function clearHealthEvents() {
  const db = await dbPromise;
  await db.clear("healthEvents");
}