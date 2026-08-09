import "./HealthLogger.css";
import { useState } from "react";
import { createSymptomLoggedEvent } from "../../events/healthEvents";
import { saveHealthEvent } from "../../events/eventStore";

function HealthLogger({ open, onClose }) {
  const [symptom, setSymptom] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [note, setNote] = useState("");

  if (!open) return null;

  async function handleSave() {
    if (!symptom.trim()) {
      alert("Please enter a symptom.");
      return;
    }

    try {
      // Create an event
      const event = createSymptomLoggedEvent({
        symptom: symptom.trim(),
        severity,
        note: note.trim(),
      });

      // Save event locally in IndexedDB
      await saveHealthEvent(event);

      console.log("✅ Health event saved:", event);

      // Clear form
      setSymptom("");
      setSeverity("Medium");
      setNote("");

      // Close modal
      onClose();

    } catch (error) {
      console.error("❌ Failed to save health event:", error);
      alert("Unable to save your symptom. Please try again.");
    }
  }

  return (
    <div className="modal-overlay">
      <div className="logger-modal">

        <h2>📝 Log Symptom</h2>

        <input
          type="text"
          placeholder="Symptom (e.g. Back Pain)"
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
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
          rows={4}
          placeholder="Notes (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="modal-buttons">

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="save-btn"
            onClick={handleSave}
          >
            Save
          </button>

        </div>

      </div>
    </div>
  );
}

export default HealthLogger;