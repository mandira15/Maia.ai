import "./HealthLogger.css";
import { useState, useEffect } from "react";
import {
  createSymptomLoggedEvent,
  createSleepLoggedEvent,
  createWalkingLoggedEvent,
  createBloodPressureLoggedEvent,
} from "../../events/healthEvents";
import { saveHealthEvent } from "../../events/eventStore";

function HealthLogger({ open, onClose, initialMode = "symptom" }) {
  const [mode, setMode] = useState(initialMode);

  // Symptom state
  const [symptom, setSymptom] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [note, setNote] = useState("");

  // Sleep state
  const [sleepHours, setSleepHours] = useState(8);

  // Walking state
  const [walkingMinutes, setWalkingMinutes] = useState(30);

  // Blood Pressure state
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [bpStatus, setBpStatus] = useState("Normal");

  useEffect(() => {
    if (open) {
      setMode(initialMode || "symptom");
    }
  }, [open, initialMode]);

  if (!open) return null;

  async function handleSave() {
    try {
      if (mode === "symptom") {
        if (!symptom.trim()) {
          alert("Please enter a symptom.");
          return;
        }
        const event = createSymptomLoggedEvent({
          symptom: symptom.trim(),
          severity,
          note: note.trim(),
        });
        await saveHealthEvent(event);
        setSymptom("");
        setSeverity("Medium");
        setNote("");
      } else if (mode === "sleep") {
        const hours = Number(sleepHours);
        if (Number.isNaN(hours) || hours <= 0) {
          alert("Please enter a valid number of sleep hours.");
          return;
        }
        const event = createSleepLoggedEvent(hours);
        await saveHealthEvent(event);
      } else if (mode === "walking") {
        const minutes = Number(walkingMinutes);
        if (Number.isNaN(minutes) || minutes <= 0) {
          alert("Please enter valid walking minutes.");
          return;
        }
        const event = createWalkingLoggedEvent(minutes);
        await saveHealthEvent(event);
      } else if (mode === "blood_pressure") {
        const event = createBloodPressureLoggedEvent({
          systolic: systolic ? Number(systolic) : null,
          diastolic: diastolic ? Number(diastolic) : null,
          status: bpStatus,
        });
        await saveHealthEvent(event);
      }

      onClose();
    } catch (error) {
      console.error("Failed to save health event:", error);
      alert("Unable to save. Please try again.");
    }
  }

  return (
    <div className="modal-overlay">
      <div className="logger-modal">
        <div className="logger-mode-tabs">
          <button
            type="button"
            className={`tab-btn ${mode === "symptom" ? "active" : ""}`}
            onClick={() => setMode("symptom")}
          >
            Symptom
          </button>
          <button
            type="button"
            className={`tab-btn ${mode === "sleep" ? "active" : ""}`}
            onClick={() => setMode("sleep")}
          >
            Sleep
          </button>
          <button
            type="button"
            className={`tab-btn ${mode === "walking" ? "active" : ""}`}
            onClick={() => setMode("walking")}
          >
            Walking
          </button>
          <button
            type="button"
            className={`tab-btn ${mode === "blood_pressure" ? "active" : ""}`}
            onClick={() => setMode("blood_pressure")}
          >
            BP
          </button>
        </div>

        {mode === "symptom" && (
          <>
            <h2>📝 Log Symptom</h2>
            <input
              type="text"
              placeholder="Symptom (e.g. Back Pain, Nausea)"
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              autoFocus
            />
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="Low">🟢 Low</option>
              <option value="Medium">🟡 Medium</option>
              <option value="High">🔴 High</option>
            </select>
            <textarea
              rows={3}
              placeholder="Notes or context (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </>
        )}

        {mode === "sleep" && (
          <>
            <h2>😴 Log Sleep</h2>
            <label className="input-label">Hours Slept Today</label>
            <input
              type="number"
              min="0.5"
              max="24"
              step="0.5"
              placeholder="e.g. 7.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              autoFocus
            />
          </>
        )}

        {mode === "walking" && (
          <>
            <h2>🚶 Log Walking</h2>
            <label className="input-label">Minutes Walked Today</label>
            <input
              type="number"
              min="1"
              max="300"
              step="5"
              placeholder="e.g. 30"
              value={walkingMinutes}
              onChange={(e) => setWalkingMinutes(e.target.value)}
              autoFocus
            />
          </>
        )}

        {mode === "blood_pressure" && (
          <>
            <h2>❤️ Log Blood Pressure</h2>
            <div className="bp-inputs">
              <div>
                <label className="input-label">Systolic</label>
                <input
                  type="number"
                  placeholder="120"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                />
              </div>
              <span className="bp-slash">/</span>
              <div>
                <label className="input-label">Diastolic</label>
                <input
                  type="number"
                  placeholder="80"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                />
              </div>
            </div>
            <label className="input-label">Status</label>
            <select
              value={bpStatus}
              onChange={(e) => setBpStatus(e.target.value)}
            >
              <option value="Normal">🟢 Normal</option>
              <option value="Elevated">🟡 Elevated</option>
              <option value="High (Consult Doctor)">🔴 High (Consult Doctor)</option>
              <option value="Low">🔵 Low</option>
            </select>
          </>
        )}

        <div className="modal-buttons">
          <button className="cancel-btn" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave} type="button">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default HealthLogger;