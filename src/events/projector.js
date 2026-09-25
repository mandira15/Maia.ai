function getLocalDateKey(timestamp) {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function projectHealthEvents(events, targetDate = null) {
  const activeDate = targetDate || getLocalDateKey(Date.now());
  const symptomsMap = new Map();
  let water = 0;
  let sleep = 0;
  let walking = 0;
  let latestBloodPressure = null;

  // Sort events chronologically to properly apply updates
  const sortedEvents = [...(events || [])].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

  for (const event of sortedEvents) {
    if (!event || !event.type) continue;
    const eventDate = getLocalDateKey(event.createdAt);

    if (event.type === "symptom_logged") {
      // Only include symptoms logged on targetDate (today)
      if (eventDate === activeDate && event.payload?.symptom) {
        const symptomKey = String(event.payload.symptom).trim().toLowerCase();
        // Keep the latest entry for each distinct symptom name
        symptomsMap.set(symptomKey, {
          logId: event.logId || event.eventId,
          eventId: event.eventId,
          symptom: event.payload.symptom,
          severity: event.payload.severity || "Medium",
          note: event.payload.note || "",
          createdAt: event.createdAt,
        });
      }
    }

    if (event.type === "water_logged") {
      if (eventDate === activeDate) {
        water += Number(event.payload?.amount) || 0;
      }
    }

    if (event.type === "sleep_logged") {
      if (eventDate === activeDate) {
        sleep += Number(event.payload?.hours) || 0;
      }
    }

    if (event.type === "walking_logged") {
      if (eventDate === activeDate) {
        walking += Number(event.payload?.minutes) || 0;
      }
    }

    if (event.type === "blood_pressure_logged") {
      // Keep track of the latest blood pressure reading
      latestBloodPressure = {
        systolic: event.payload?.systolic ?? null,
        diastolic: event.payload?.diastolic ?? null,
        status: event.payload?.status || "Normal",
        createdAt: event.createdAt,
      };
    }
  }

  // Symptoms returned as an array, most recently logged first
  const symptoms = Array.from(symptomsMap.values()).sort(
    (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
  );

  return {
    symptoms,
    water,
    sleep,
    walking,
    bloodPressure: latestBloodPressure,
  };
}