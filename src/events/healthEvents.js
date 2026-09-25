import { v4 as uuidv4 } from "uuid";


/*
 * Creates a symptom logging event.
 */
export function createSymptomLoggedEvent({
  symptom,
  severity,
  note = "",
}) {
  return {
    eventId: uuidv4(),
    type: "symptom_logged",
    createdAt: Date.now(),

    payload: {
      symptom,
      severity,
      note,
    },
  };
}

/*
 * Creates a water logging event.
 */
export function createWaterLoggedEvent(amount) {
  return {
    eventId: uuidv4(),
    type: "water_logged",
    createdAt: Date.now(),

    payload: {
      amount,
    },
  };
}

/*
 * Creates a sleep logging event.
 */
export function createSleepLoggedEvent(hours, quality = "") {
  return {
    eventId: uuidv4(),
    type: "sleep_logged",
    createdAt: Date.now(),

    payload: {
      hours: Number(hours) || 0,
      quality,
    },
  };
}

/*
 * Creates a walking logging event.
 */
export function createWalkingLoggedEvent(minutes) {
  return {
    eventId: uuidv4(),
    type: "walking_logged",
    createdAt: Date.now(),

    payload: {
      minutes: Number(minutes) || 0,
    },
  };
}

/*
 * Creates a blood pressure logging event.
 */
export function createBloodPressureLoggedEvent({ systolic, diastolic, status = "Normal" }) {
  return {
    eventId: uuidv4(),
    type: "blood_pressure_logged",
    createdAt: Date.now(),

    payload: {
      systolic: systolic !== undefined && systolic !== "" ? Number(systolic) : null,
      diastolic: diastolic !== undefined && diastolic !== "" ? Number(diastolic) : null,
      status,
    },
  };
}