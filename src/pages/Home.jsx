import "./Home.css";
import { useEffect, useState } from "react";
import { getUser } from "../services/cacheService";
import { isOnline } from "../services/networkService";
import pregnancyWeeks from "../data/pregnancyWeeks.json";
import ChatBox from "../components/ChatBox/ChatBox";
// import { localSemanticSearch } from "../services/localSemanticSearch";
import evaluateRetrieval from "../evaluation/evaluateRetrieval";
import { createSymptomLoggedEvent } from "../events/healthEvents";
import { saveHealthEvent, getHealthEvents } from "../events/eventStore";
import HealthLogger from "../components/HealthLogger/HealthLogger";

function Home() {
  const [user, setUser] = useState(null);
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    async function initialize() {
      try {
        const currentUser = await getUser();
        setUser(currentUser);

        // Temporary testing
        const event = createSymptomLoggedEvent({
          symptom: "Back Pain",
          severity: "High",
          note: "Started after walking",
        });

        console.log("Created Event:", event);

        await saveHealthEvent(event);
        console.log("Event saved successfully");

        const events = await getHealthEvents();
        console.log("Stored Events:", events);

        // Temporary evaluation
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

  const [showLogger, setShowLogger] = useState(false);

  return (
    <div className="home-container">

      {/* HERO CARD */}
      <div className="hero-card">

        <div className="hero-top">
          <div>
            <h1>
              Good Morning, {user?.fullName || "Mother"} 🌸
            </h1>

            <p>Week {user?.pregnancyWeek || 1} of 40</p>
          </div>

          <span className={online ? "online" : "offline"}>
            {online ? "🟢 Online" : "🔴 Offline"}
          </span>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p>
          {Math.round(progress)}% Pregnancy Journey Completed
        </p>

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

        {/* Today's Care */}

        <div className="home-card">

          <h3>📅 Today's Care</h3>

          {currentWeekData?.tips.map((tip, index) => (
            <label
              key={index}
              className="tip-item"
            >
              <input type="checkbox" />
              {tip}
            </label>
          ))}

        </div>

        {/* Today's Health */}

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

          <div className="symptom-section">

            <h4>📝 Symptoms Today</h4>

            <p className="empty-text">
              No symptoms logged yet.
            </p>

            <button className="log-symptom-btn">
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

    </div>
  )};

export default Home;
