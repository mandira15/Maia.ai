export function projectHealthEvents(events) {
  const symptoms = [];

  for (const event of events) {
    if (event.type === "symptom_logged") {
      symptoms.push({
        logId: event.logId,
        symptom: event.payload.symptom,
        severity: event.payload.severity,
        note: event.payload.note,
        createdAt: event.createdAt,
      });
    }
  }

  return {
    symptoms,
  };
}