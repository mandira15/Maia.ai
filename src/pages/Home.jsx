import "./Home.css";
import { useEffect, useState } from "react";
import { getUser } from "../services/cacheService";
import { isOnline } from "../services/networkService";
import pregnancyWeeks from "../data/pregnancyWeeks.json";
import ChatBox from "../components/ChatBox/ChatBox";

function Home() {
  const [user, setUser] = useState(null);
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getUser();
      setUser(currentUser);
    }

    loadUser();

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
    (week) => week.week === (user?.pregnancyWeek || 1)
  );

  const progress = ((user?.pregnancyWeek || 1) / 40) * 100;

  return (
    <div className="home-container">

      {/* HERO CARD */}
      <div className="hero-card">

        <div className="hero-top">

          <div>
            <h1>Good Morning, {user?.fullName || "Mother" } 🌸 </h1>

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

      {/* TWO COLUMN SECTION */}

      <div className="dashboard-grid">

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

        <div className="home-card">

          <h3>📊 Today's Health</h3>

          <div className="health-item">
            <span>💧 Water</span>
            <span>2.1 / 3L</span>
          </div>

          <div className="health-item">
            <span>😴 Sleep</span>
            <span>7 / 8 hrs</span>
          </div>

          <div className="health-item">
            <span>🚶 Walking</span>
            <span>20 / 30 mins</span>
          </div>

          <div className="health-item">
            <span>❤️ Blood Pressure</span>
            <span>Normal</span>
          </div>

        </div>

      </div>

      {/* CHAT */}
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
  );
}

export default Home;