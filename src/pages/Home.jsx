import "./Home.css";
import { useEffect, useState } from "react";
import { getUser } from "../services/cacheService";
import { isOnline } from "../services/networkService";
import pregnancyWeeks from "../data/pregnancyWeeks.json";

function Home() {
  const currentWeekData = pregnancyWeeks.find(
    (week) => week.week === user?.pregnancyWeek,
  );
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

  return (
    <div className="home-container">
      <div className="header">
        <h2>Hello {user?.fullName || "Mother"} 🌸</h2>

        <p>Week {user?.pregnancyWeek || "--"} Pregnancy</p>

        <p className={online ? "online" : "offline"}>
          {online ? "🟢 Online Mode" : "🔴 Offline Mode"}
        </p>
      </div>

      <div className="home-card">
        <h3>Today's Care Plan</h3>

        {currentWeekData ? (
          <>
            <p>
              <strong>Baby:</strong> {currentWeekData.babyDevelopment}
            </p>

            <p>
              <strong>Mother:</strong> {currentWeekData.motherChanges}
            </p>

            <h4>Today's Tips</h4>

            {currentWeekData.tips.map((tip, index) => (
              <p key={index}>✅ {tip}</p>
            ))}
          </>
        ) : (
          <p>No pregnancy data available.</p>
        )}
      </div>

      <div className="home-card">
        <h3>Ask Maia</h3>

        <input placeholder="Ask anything about your pregnancy..." />

        <button>Send</button>
      </div>

      <div className="home-card emergency">
        <h3>🚨 Emergency Help</h3>

        <p>Severe Pain</p>
        <p>Bleeding</p>

        <button>Send Alert</button>
      </div>
    </div>
  );
}

export default Home;
