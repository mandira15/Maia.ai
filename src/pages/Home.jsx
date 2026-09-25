import "./Home.css";
import { useEffect, useState, useMemo } from "react";
import { getUser } from "../services/cacheService";
import pregnancyWeeks from "../data/pregnancyWeeks.json";
import ChatBox from "../components/ChatBox/chatBox";
import HealthLogger from "../components/HealthLogger/HealthLogger";
import { saveHealthEvent, getHealthEvents } from "../events/eventStore";
import { projectHealthEvents } from "../events/projector";
import { createWaterLoggedEvent } from "../events/healthEvents";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { getTodayCare, saveTodayCare } from "../services/careService";

const DEFAULT_WATER_GOAL_ML = 3000;
const DEFAULT_SLEEP_GOAL_HOURS = 8;
const DEFAULT_WALKING_GOAL_MINS = 30;

function getLocalDateKey(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayDateKey() {
  return getLocalDateKey(Date.now());
}

function getWaterTargetLiters(waterIntake) {
  const match = String(waterIntake || "").match(/[\d.]+/);
  const target = match ? Number(match[0]) : null;
  return Number.isFinite(target) ? target : 3.0;
}

function getSleepTargetHours(sleepHoursStr) {
  const match = String(sleepHoursStr || "").match(/[\d.]+/);
  const target = match ? Number(match[0]) : null;
  return Number.isFinite(target) ? target : DEFAULT_SLEEP_GOAL_HOURS;
}

function formatRemainingWater(amountMilliliters) {
  if (amountMilliliters >= 1000) {
    const liters = amountMilliliters / 1000;
    return `${Number.isInteger(liters) ? liters : liters.toFixed(1)} L`;
  }
  return `${amountMilliliters} ml`;
}

/**
 * Calculates pregnancy timeline progression.
 * If user has an explicit timeline anchor (pregnancyWeekRecordedAt or anchorDate),
 * progression is calculated dynamically from the anchor date.
 * If only pregnancyWeek is present, preserves the user's recorded week without inventing dates.
 */
function calculatePregnancyInfo(user) {
  const rawWeek = Number(user?.pregnancyWeek);
  const baseWeek = Number.isFinite(rawWeek) && rawWeek >= 1 && rawWeek <= 42 ? rawWeek : 1;

  const anchorTimestamp = user?.pregnancyWeekRecordedAt || user?.anchorDate;
  if (!anchorTimestamp) {
    return {
      currentWeek: baseWeek,
      currentDay: 1,
      hasTimelineAnchor: false,
    };
  }

  const anchorTime = new Date(anchorTimestamp).getTime();
  if (Number.isNaN(anchorTime)) {
    return {
      currentWeek: baseWeek,
      currentDay: 1,
      hasTimelineAnchor: false,
    };
  }

  const now = Date.now();
  const diffDays = Math.max(0, Math.floor((now - anchorTime) / (1000 * 60 * 60 * 24)));
  const additionalWeeks = Math.floor(diffDays / 7);
  const dayInWeek = (diffDays % 7) + 1;

  const calculatedWeek = Math.min(42, Math.max(1, baseWeek + additionalWeeks));

  return {
    currentWeek: calculatedWeek,
    currentDay: dayInWeek,
    hasTimelineAnchor: true,
  };
}

/**
 * Finds the week data from pregnancyWeeks.json.
 * If the exact week does not exist, uses the nearest available reference week
 * for informational display without inventing developmental facts.
 */
function getReferenceWeekData(weekNumber) {
  if (!Array.isArray(pregnancyWeeks) || pregnancyWeeks.length === 0) {
    return null;
  }

  const exact = pregnancyWeeks.find((w) => w.week === weekNumber);
  if (exact) {
    return { data: exact, isExact: true };
  }

  // Find nearest available reference week
  let closest = pregnancyWeeks[0];
  let minDiff = Math.abs(pregnancyWeeks[0].week - weekNumber);

  for (let i = 1; i < pregnancyWeeks.length; i++) {
    const diff = Math.abs(pregnancyWeeks[i].week - weekNumber);
    if (diff < minDiff) {
      minDiff = diff;
      closest = pregnancyWeeks[i];
    }
  }

  return { data: closest, isExact: false };
}

/**
 * Builds dynamic Today's Care tasks reflecting current health values and week tips.
 */
function buildCareTasks(currentWeekData, water, sleep, walking, symptoms) {
  if (!currentWeekData) {
    return [];
  }

  const week = currentWeekData.week;
  const tasks = [];

  // 1. Water Goal Task
  const waterTargetL = getWaterTargetLiters(currentWeekData.waterIntake);
  const targetWaterMl = waterTargetL * 1000;
  if (water < targetWaterMl) {
    const remainingWater = Math.ceil(targetWaterMl - water);
    tasks.push({
      id: `care-water-${getTodayDateKey()}`,
      text: `Drink ${formatRemainingWater(remainingWater)} more to reach your ${waterTargetL}L water goal`,
      type: "water",
    });
  }

  // 2. Sleep Goal Task
  const sleepTarget = getSleepTargetHours(currentWeekData.sleepHours);
  if (sleep < sleepTarget) {
    const remainingSleep = Math.max(0, sleepTarget - sleep);
    tasks.push({
      id: `care-sleep-${getTodayDateKey()}`,
      text: `Rest well: aim for ${remainingSleep % 1 === 0 ? remainingSleep : remainingSleep.toFixed(1)} more hr${remainingSleep > 1 ? "s" : ""} of sleep`,
      type: "sleep",
    });
  }

  // 3. Walking / Activity Goal Task
  const walkingTarget = DEFAULT_WALKING_GOAL_MINS;
  if (walking < walkingTarget) {
    const remainingWalking = walkingTarget - walking;
    tasks.push({
      id: `care-walking-${getTodayDateKey()}`,
      text: `Aim for ${remainingWalking} more mins of gentle walking or stretching`,
      type: "walking",
    });
  }

  // 4. Symptom Monitoring Task (if any symptom logged today)
  if (symptoms && symptoms.length > 0) {
    tasks.push({
      id: `care-symptom-${getTodayDateKey()}`,
      text: `Monitor logged symptom${symptoms.length > 1 ? "s" : ""} (${symptoms.map((s) => s.symptom).join(", ")})`,
      type: "symptom",
    });
  }

  // 5. Week-specific pregnancy tips
  const tips = (currentWeekData.tips || []).filter(Boolean);
  tips.forEach((tip, idx) => {
    if (tasks.length < 5) {
      tasks.push({
        id: `care-tip-w${week}-${idx}`,
        text: tip,
        type: "tip",
      });
    }
  });

  return tasks.slice(0, 5);
}

function Home() {
  const [user, setUser] = useState(null);
  const [showLogger, setShowLogger] = useState(false);
  const [loggerMode, setLoggerMode] = useState("symptom");
  const [symptoms, setSymptoms] = useState([]);
  const [water, setWater] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [walking, setWalking] = useState(0);
  const [bloodPressure, setBloodPressure] = useState(null);
  const [showWaterOptions, setShowWaterOptions] = useState(false);
  const [careTasks, setCareTasks] = useState({});

  // 🌐 Detect actual browser connectivity
  const isOnline = useOnlineStatus();

  async function refreshHealthData() {
    try {
      const events = await getHealthEvents();
      const projected = projectHealthEvents(events, getTodayDateKey());

      setSymptoms(projected.symptoms || []);
      setWater(projected.water || 0);
      setSleep(projected.sleep || 0);
      setWalking(projected.walking || 0);
      setBloodPressure(projected.bloodPressure || null);
    } catch (err) {
      console.error("Failed to load health events:", err);
    }
  }

  // Initialize user and health data
  useEffect(() => {
    async function initialize() {
      try {
        const currentUser = await getUser();
        setUser(currentUser);
        await refreshHealthData();
      } catch (err) {
        console.error("Initialize Error:", err);
      }
    }

    initialize();
  }, []);

  // Calculate current pregnancy timeline
  const pregnancyInfo = useMemo(() => calculatePregnancyInfo(user), [user]);
  const currentWeek = pregnancyInfo.currentWeek;
  const currentDay = pregnancyInfo.currentDay;

  // Retrieve week specific reference data
  const weekRef = useMemo(() => getReferenceWeekData(currentWeek), [currentWeek]);
  const currentWeekData = weekRef?.data;

  // Load Today's Care state
  useEffect(() => {
    if (!user) return;

    function loadCareState() {
      const todayCare = getTodayCare(currentWeek);
      setCareTasks(todayCare.completed || {});
    }

    loadCareState();
  }, [user, currentWeek]);

  // 💧 Water event handler
  async function addWater(amount) {
    try {
      const event = createWaterLoggedEvent(amount);
      await saveHealthEvent(event);
      setWater((prev) => prev + amount);
      setShowWaterOptions(false);
    } catch (err) {
      console.error("Failed to save water:", err);
    }
  }

  function openLogger(mode = "symptom") {
    setLoggerMode(mode);
    setShowLogger(true);
  }

  function toggleCareTask(taskId) {
    const updated = {
      ...careTasks,
      [taskId]: !careTasks[taskId],
    };

    setCareTasks(updated);
    saveTodayCare(updated, currentWeek);
  }

  function closeHealthLogger() {
    setShowLogger(false);
    refreshHealthData().catch((err) => {
      console.error("Failed to refresh health data:", err);
    });
  }

  const todayCareTasks = useMemo(() => {
    return buildCareTasks(currentWeekData, water, sleep, walking, symptoms);
  }, [currentWeekData, water, sleep, walking, symptoms]);

  // 📊 Pregnancy progress percentage
  const progress = Math.min(100, Math.round((currentWeek / 40) * 100));

  const waterTargetL = currentWeekData ? getWaterTargetLiters(currentWeekData.waterIntake) : 3.0;
  const sleepTargetHours = currentWeekData ? getSleepTargetHours(currentWeekData.sleepHours) : DEFAULT_SLEEP_GOAL_HOURS;
  const walkingTargetMins = DEFAULT_WALKING_GOAL_MINS;

  return (
    <div className="home-container">
      {/* ================= HERO CARD ================= */}
      <div className="hero-card">
        <div className="hero-top">
          <div className="hero-heading-group">
            <h1>Good Morning, {user?.fullName || "Mother"} 🌸</h1>
            <p className="hero-subheading">
              <span className="hero-week-highlight">
                Week {currentWeek}
                {pregnancyInfo.hasTimelineAnchor ? `, Day ${currentDay}` : ""}
              </span>{" "}
              of 40 weeks
              {!weekRef?.isExact && (
                <span className="reference-tag"> • Ref: Week {currentWeekData?.week}</span>
              )}
            </p>
          </div>

          {/* 🌐 REAL CONNECTIVITY STATUS */}
          <div className={`status-badge ${isOnline ? "online" : "offline"}`}>
            <span className="status-dot" />
            <span className="status-label">{isOnline ? "Online Mode" : "Offline Mode"}</span>
          </div>
        </div>

        <div className="hero-progress-section">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="hero-progress-label">
            <span>{progress}% Pregnancy Journey Completed</span>
            <span className="trimester-badge">
              {currentWeek <= 12 ? "1st Trimester" : currentWeek <= 27 ? "2nd Trimester" : "3rd Trimester"}
            </span>
          </div>
        </div>

        <div className="hero-info">
          <div className="hero-info-card">
            <h3>👶 Baby</h3>
            <p>{currentWeekData?.babyDevelopment || "Your baby is growing and developing each day."}</p>
          </div>

          <div className="hero-info-card">
            <h3>🤰 Mother</h3>
            <p>{currentWeekData?.motherChanges || "Your body continues to adapt to support your growing baby."}</p>
          </div>
        </div>
      </div>

      {/* ================= DASHBOARD ================= */}
      <div className="dashboard-grid">
        {/* Today's Care */}
        <section className="care-section">
          <div className="section-header">
            <div>
              <h2>Today's Care 🌸</h2>
              <p>Small steps for you and your baby</p>
            </div>

            <div className="care-progress">
              {todayCareTasks.filter((task) => careTasks[task.id]).length}/
              {todayCareTasks.length}
            </div>
          </div>

          <div className="care-list">
            {todayCareTasks.length === 0 ? (
              <p className="empty-text">All daily goals and tips completed for today!</p>
            ) : (
              todayCareTasks.map((task) => {
                const completed = !!careTasks[task.id];

                return (
                  <label
                    key={task.id}
                    className={`care-item ${completed ? "completed" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={completed}
                      onChange={() => toggleCareTask(task.id)}
                    />

                    <span className="care-check">{completed && "✓"}</span>
                    <span className="care-text">{task.text}</span>
                  </label>
                );
              })
            )}
          </div>
        </section>

        {/* ================= TODAY'S HEALTH ================= */}
        <div className="home-card">
          <div className="section-header-simple">
            <div>
              <h3>📊 Today's Health</h3>
              <p className="card-subtitle">Track your daily vitals & activity</p>
            </div>
            <span className="health-date-badge">Today</span>
          </div>

          {/* WATER */}
          <div className="health-item-wrapper">
            <div className="health-item">
              <span className="health-label">💧 Water</span>

              <div className="health-right">
                <span className="health-val">
                  {(water / 1000).toFixed(1)} / {waterTargetL}L
                </span>

                <button
                  type="button"
                  className="health-add-btn"
                  title="Add Water"
                  onClick={() => setShowWaterOptions(!showWaterOptions)}
                >
                  +
                </button>
              </div>
            </div>

            {showWaterOptions && (
              <div className="water-options">
                <button type="button" onClick={() => addWater(250)}>+250 ml</button>
                <button type="button" onClick={() => addWater(500)}>+500 ml</button>
                <button type="button" onClick={() => addWater(1000)}>+1 L</button>
              </div>
            )}
          </div>

          {/* SLEEP */}
          <div className="health-item">
            <span className="health-label">😴 Sleep</span>

            <div className="health-right">
              <span className="health-val">
                {sleep} / {sleepTargetHours} hrs
              </span>

              <button
                type="button"
                className="health-add-btn"
                title="Log Sleep"
                onClick={() => openLogger("sleep")}
              >
                +
              </button>
            </div>
          </div>

          {/* WALKING */}
          <div className="health-item">
            <span className="health-label">🚶 Walking</span>

            <div className="health-right">
              <span className="health-val">
                {walking} / {walkingTargetMins} mins
              </span>

              <button
                type="button"
                className="health-add-btn"
                title="Log Walking"
                onClick={() => openLogger("walking")}
              >
                +
              </button>
            </div>
          </div>

          {/* BLOOD PRESSURE */}
          <div className="health-item">
            <span className="health-label">❤️ Blood Pressure</span>

            <div className="health-right">
              <span className="health-val">
                {bloodPressure
                  ? bloodPressure.systolic && bloodPressure.diastolic
                    ? `${bloodPressure.systolic}/${bloodPressure.diastolic} (${bloodPressure.status})`
                    : bloodPressure.status
                  : "Normal"}
              </span>

              <button
                type="button"
                className="health-add-btn"
                title="Log Blood Pressure"
                onClick={() => openLogger("blood_pressure")}
              >
                +
              </button>
            </div>
          </div>

          <hr className="health-divider" />

          {/* ================= SYMPTOMS ================= */}
          <div className="symptom-section">
            <div className="symptom-header">
              <div>
                <h4>📝 Symptoms Today</h4>
                <p className="symptom-subtitle">Monitor discomfort or changes</p>
              </div>
              {symptoms.length > 0 && (
                <span className="symptom-count">{symptoms.length} logged</span>
              )}
            </div>

            {symptoms.length === 0 ? (
              <p className="empty-text">No symptoms logged yet today.</p>
            ) : (
              <div className="symptoms-list">
                {symptoms.map((item, index) => (
                  <div className="symptom-item" key={item.logId || item.eventId || index}>
                    <div className="symptom-info">
                      <strong className="symptom-title">🤕 {item.symptom}</strong>
                      {item.note && <small className="symptom-note">{item.note}</small>}
                    </div>

                    <span className={`severity-tag severity-${String(item.severity).toLowerCase()}`}>
                      {item.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              className="log-symptom-btn"
              onClick={() => openLogger("symptom")}
            >
              + Log Symptom
            </button>
          </div>
        </div>
      </div>

      {/* ================= ASK MAIA ================= */}
      <div className="home-card chat-card-section">
        <div className="card-header-with-badge">
          <div>
            <h3>🤖 Ask Maia</h3>
            <p className="card-subtitle">Your personal maternal AI assistant (available 24/7 online & offline)</p>
          </div>
        </div>
        <ChatBox />
      </div>


      {/* ================= EMERGENCY ================= */}
      <div className="home-card emergency">
        <h3>🚨 Emergency</h3>

        <div className="emergency-buttons">
          <button type="button">SOS</button>
          <button type="button">Doctor</button>
          <button type="button">Emergency Contact</button>
        </div>
      </div>

      {/* ================= HEALTH LOGGER ================= */}
      <HealthLogger
        open={showLogger}
        onClose={closeHealthLogger}
        initialMode={loggerMode}
      />
    </div>
  );
}

export default Home;

