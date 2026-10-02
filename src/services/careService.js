import api from "../api/api";
import { isOnline } from "./networkService";

const CARE_STORAGE_KEY = "maia_today_care";

function getTodayKey() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createEmptyCareState(pregnancyWeek) {
  return {
    date: getTodayKey(),
    pregnancyWeek,
    completed: {},
  };
}

function normalizePregnancyWeek(pregnancyWeek) {
  if (pregnancyWeek === undefined || pregnancyWeek === null || pregnancyWeek === "") {
    return null;
  }

  const week = Number(pregnancyWeek);

  return Number.isFinite(week) ? week : null;
}

export function getTodayCareState() {
  try {
    const stored = localStorage.getItem(CARE_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setTodayCareFromSync(todayCare) {
  if (!todayCare) return;
  try {
    const data = {
      date: todayCare.date || getTodayKey(),
      pregnancyWeek: normalizePregnancyWeek(todayCare.pregnancyWeek),
      completed: todayCare.completed && typeof todayCare.completed === "object" ? todayCare.completed : {},
    };
    localStorage.setItem(CARE_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to set today's care from sync:", error);
  }
}

export function clearTodayCareState() {
  try {
    localStorage.removeItem(CARE_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear care state:", err);
  }
}

export function getTodayCare(pregnancyWeek) {
  const currentDate = getTodayKey();
  const currentWeek = normalizePregnancyWeek(pregnancyWeek);

  try {
    const stored = localStorage.getItem(CARE_STORAGE_KEY);

    if (!stored) {
      return createEmptyCareState(currentWeek);
    }

    const data = JSON.parse(stored);

    // Only reset when the calendar day changes.
    if (data.date !== currentDate) {
      return createEmptyCareState(currentWeek);
    }

    return {
      date: currentDate,
      pregnancyWeek: currentWeek ?? normalizePregnancyWeek(data.pregnancyWeek),
      completed:
        data.completed && typeof data.completed === "object"
          ? data.completed
          : {},
    };
  } catch (error) {
    console.error("Failed to load today's care:", error);

    return createEmptyCareState(currentWeek);
  }
}

export function saveTodayCare(completed, pregnancyWeek) {
  const currentWeek = normalizePregnancyWeek(pregnancyWeek);
  const currentDate = getTodayKey();
  const completedMap = completed && typeof completed === "object" ? completed : {};

  try {
    const data = {
      date: currentDate,
      pregnancyWeek: currentWeek,
      completed: completedMap,
    };

    localStorage.setItem(CARE_STORAGE_KEY, JSON.stringify(data));

    // Asynchronously push to backend if online
    const token = localStorage.getItem("token");
    if (token && isOnline()) {
      api.post("/dashboard/care", {
        date: currentDate,
        pregnancyWeek: currentWeek,
        completed: completedMap,
      }).catch((err) => {
        console.warn("⚠️ Background care sync to backend failed:", err?.message || err);
      });
    }
  } catch (error) {
    console.error("Failed to save today's care:", error);
  }
}