import api from "../api/api";
import { isOnline } from "./networkService";
import { getHealthEvents, saveHealthEvent, clearHealthEvents } from "../events/eventStore";
import { getTodayCare, saveTodayCare, getTodayCareState, setTodayCareFromSync, clearTodayCareState } from "./careService";
import { clearUser, getUser, saveUser } from "./cacheService";


function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Syncs local health events and care state to backend if online and token exists.
 */
export async function syncLocalDataToBackend() {
  const token = localStorage.getItem("token");
  if (!token || !isOnline()) {
    return;
  }

  try {
    // 1. Sync unpushed health events to backend
    const localEvents = await getHealthEvents();
    if (localEvents && localEvents.length > 0) {
      await api.post("/dashboard/health-events", { events: localEvents });
    }

    // 2. Sync care state to backend
    const currentCare = getTodayCareState();
    if (currentCare && currentCare.completed && Object.keys(currentCare.completed).length > 0) {
      await api.post("/dashboard/care", {
        date: currentCare.date || getTodayKey(),
        pregnancyWeek: currentCare.pregnancyWeek,
        completed: currentCare.completed,
      });
    }

    // 3. Sync offline pending emergency contact or doctor changes
    const pending = localStorage.getItem("pendingEmergencyContactSync");
    if (pending) {
      try {
        const contactData = JSON.parse(pending);
        await api.put("/dashboard/emergency-contact", contactData);
        localStorage.removeItem("pendingEmergencyContactSync");
      } catch (e) {
        console.warn("⚠️ Failed syncing pending emergency contact:", e);
      }
    }

    const pendingDoctor = localStorage.getItem("pendingDoctorSync");
    if (pendingDoctor) {
      try {
        const doctorData = JSON.parse(pendingDoctor);
        await api.put("/dashboard/doctor", doctorData);
        localStorage.removeItem("pendingDoctorSync");
      } catch (e) {
        console.warn("⚠️ Failed syncing pending doctor:", e);
      }
    }
  } catch (err) {
    console.warn("⚠️ Background sync to backend failed:", err?.message || err);
  }
}

/**
 * Downloads account-level dashboard data from backend and updates local IndexedDB and care state.
 * Called on login or initial dashboard mount for an authenticated user.
 */
export async function restoreAccountDashboardData(pregnancyWeek = null) {
  const token = localStorage.getItem("token");
  if (!token) {
    return { restored: false, reason: "no_token" };
  }

  if (!isOnline()) {
    return { restored: false, reason: "offline" };
  }

  try {
    const today = getTodayKey();
    const res = await api.get(`/dashboard/sync?date=${today}`);

    if (res.data?.success) {
      const { healthEvents, todayCare } = res.data;

      // 1. Merge or populate health events into IndexedDB
      if (Array.isArray(healthEvents)) {
        for (const ev of healthEvents) {
          await saveHealthEvent(ev);
        }
      }

      // 2. Populate Today's Care state
      if (todayCare && todayCare.date === today) {
        setTodayCareFromSync(todayCare);
      }

      // 3. Populate Doctor and Emergency Contact in cached user profile if present
      const cachedUser = await getUser();
      if (cachedUser) {
        const updated = { ...cachedUser };
        if (res.data.doctor !== undefined) {
          updated.doctor = res.data.doctor;
        }
        if (res.data.emergencyContact !== undefined) {
          updated.emergencyContact = res.data.emergencyContact;
        }
        await saveUser(updated);
      }

      return {
        restored: true,
        eventsCount: healthEvents?.length || 0,
        careRestored: !!(todayCare && todayCare.date === today),
        doctor: res.data.doctor || null,
        emergencyContact: res.data.emergencyContact || null,
      };
    }
  } catch (err) {
    console.warn("⚠️ Could not restore account dashboard data from backend:", err?.message || err);
  }


  return { restored: false, reason: "request_failed" };
}

/**
 * Clears current account local session data from IndexedDB and localStorage on logout or account switch.
 */
export async function clearAccountLocalData() {
  try {
    await clearHealthEvents();
    await clearUser();
    clearTodayCareState();
    localStorage.removeItem("token");
    localStorage.removeItem("currentUserPhone");
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("pendingEmergencyContactSync");
    localStorage.removeItem("pendingDoctorSync");
  } catch (err) {
    console.error("Failed to clear local account data:", err);
  }
}

