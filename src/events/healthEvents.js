import { v4 as uuidv4 } from "uuid";

/*
  Creates a new symptom logging event.
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