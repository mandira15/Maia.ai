import "./Home.css";
import { useEffect, useState } from "react";
import { getUser } from "../services/cacheService";
import { isOnline } from "../services/networkService";
import pregnancyWeeks from "../data/pregnancyWeeks.json";
import ChatBox from "../components/ChatBox/ChatBox";
import evaluateRetrieval from "../evaluation/evaluateRetrieval";
import HealthLogger from "../components/HealthLogger/HealthLogger";
import { getHealthEvents } from "../events/eventStore";
import { projectHealthEvents } from "../events/projector";

function Home() {
  const [user, setUser] = useState(null);
  const [online, setOnline] = useState(isOnline());
  const [showLogger, setShowLogger] = useState(false);
  const [symptoms, setSymptoms] = useState([]);

  useEffect(() => {
    async function initialize() {
      try {
        const currentUser = await getUser();
        setUser(currentUser);

        const events = await getHealthEvents();

        const projected = projectHealthEvents(events);

        setSymptoms(projected.symptoms);

        await evaluateRetrieval();
      } catch (err) {
        console.error("Initialize Error:", err);
      }
    }

    initialize();

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const currentWeekData = pregnancyWeeks.find(
    (week) => week.week === (user?.pregnancyWeek || 1),
  );

  const progress = ((user?.pregnancyWeek || 1) / 40) * 100;

  return (
    <div className="home-container">
      {/* HERO CARD */}
      <div className="hero-card">
        <div className="hero-top">
          <div>
            <h1>Good Morning, {user?.fullName || "Mother"} 🌸</h1>

            <p>Week {user?.pregnancyWeek || 1} of 40</p>
          </div>

          <span className={online ? "online" : "offline"}>
            {online ? "🟢 Online" : "🔴 Offline"}
          </span>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <p>{Math.round(progress)}% Pregnancy Journey Completed</p>

        <div className="hero-info">
          <div>
            <h3>👶 Baby</h3>
            <p>{currentWeekData?.babyDevelopment}</p>
          </div>

          <div>
            <h3>🤰 Mother</h3>
            <p>{currentWeekData?.motherChanges}</p>
          </div>
        </div>
      </div>

      {/* DASHBOARD */}
      <div className="dashboard-grid">
        {/* TODAY'S CARE */}
        <div className="home-card">
          <h3>📅 Today's Care</h3>

          {currentWeekData?.tips.map((tip, index) => (
            <label key={index} className="tip-item">
              <input type="checkbox" />
              {tip}
            </label>
          ))}
        </div>

        {/* TODAY'S HEALTH */}
        <div className="home-card">
          <h3>📊 Today's Health</h3>

          <div className="health-item">
            <span>💧 Water</span>

            <div className="health-right">
              <span>2.1 / 3L</span>
              <button className="health-add-btn">+</button>
            </div>
          </div>

          <div className="health-item">
            <span>😴 Sleep</span>

            <div className="health-right">
              <span>7 / 8 hrs</span>
              <button className="health-add-btn">+</button>
            </div>
          </div>

          <div className="health-item">
            <span>🚶 Walking</span>

            <div className="health-right">
              <span>20 / 30 mins</span>
              <button className="health-add-btn">+</button>
            </div>
          </div>

          <div className="health-item">
            <span>❤️ Blood Pressure</span>

            <div className="health-right">
              <span>Normal</span>
              <button className="health-add-btn">+</button>
            </div>
          </div>

          <hr className="health-divider" />

          {/* SYMPTOMS */}
          <div className="symptom-section">
            <h4>📝 Symptoms Today</h4>

            {symptoms.length === 0 ? (
              <p className="empty-text">No symptoms logged yet.</p>
            ) : (
              <div className="symptoms-list">
                {symptoms.map((item, index) => (
                  <div className="symptom-item" key={item.logId || index}>
                    <div>
                      <strong>🤕 {item.symptom}</strong>
                      <small>{item.note}</small>
                    </div>

                    <span>{item.severity}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              className="log-symptom-btn"
              onClick={() => setShowLogger(true)}
            >
              + Log Symptom
            </button>
          </div>
        </div>
      </div>

      {/* ASK MAIA */}
      <br />

      <div className="home-card">
        <h3>🤖 Ask Maia</h3>

        <ChatBox />
      </div>

      {/* EMERGENCY */}
      <div className="home-card emergency">
        <h3>🚨 Emergency</h3>

        <div className="emergency-buttons">
          <button>SOS</button>

          <button>Doctor</button>

          <button>Emergency Contact</button>
        </div>
      </div>

      {/* HEALTH LOGGER MODAL */}
      <HealthLogger open={showLogger} onClose={() => setShowLogger(false)} />
    </div>
  );
}

export default Home;
