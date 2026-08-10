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