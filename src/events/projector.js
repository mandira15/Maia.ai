export function projectHealthEvents(events) {
  const symptoms = [];
  let water = 0;

  for (const event of events) {
    if (event.type === "symptom_logged") {
      symptoms.push({
        logId: event.logId,
        eventId: event.eventId,
        symptom: event.payload.symptom,
        severity: event.payload.severity,
        note: event.payload.note,
        createdAt: event.createdAt,
      });
    }

    if (event.type === "water_logged") {
      water += Number(event.payload.amount) || 0;
    }
  }

  return {
    symptoms,
    water,
  };
}