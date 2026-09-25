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

export function getTodayCare(pregnancyWeek) {
  const currentDate = getTodayKey();
  const currentWeek = normalizePregnancyWeek(pregnancyWeek);

  try {
    const stored = localStorage.getItem(CARE_STORAGE_KEY);

    if (!stored) {
      return createEmptyCareState(currentWeek);
    }

    const data = JSON.parse(stored);

    if (
      data.date !== currentDate ||
      normalizePregnancyWeek(data.pregnancyWeek) !== currentWeek
    ) {
      return createEmptyCareState(currentWeek);
    }

    return {
      date: currentDate,
      pregnancyWeek: currentWeek,
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

  try {
    const data = {
      date: getTodayKey(),
      pregnancyWeek: currentWeek,
      completed:
        completed && typeof completed === "object" ? completed : {},
    };

    localStorage.setItem(CARE_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save today's care:", error);
  }
}