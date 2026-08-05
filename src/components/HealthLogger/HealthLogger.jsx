import "./HealthLogger.css";
import { useState } from "react";

function HealthLogger({ open, onClose }) {
  const [symptom, setSymptom] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [note, setNote] = useState("");

  if (!open) return null;

  function handleSave() {
    console.log({
      symptom,
      severity,
      note,
    });

    setSymptom("");
    setSeverity("Medium");
    setNote("");

    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="logger-modal">

        <h2>📝 Log Symptom</h2>

        <input
          placeholder="Symptom"
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
        />

        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <textarea
          rows="4"
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