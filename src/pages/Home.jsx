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
 * Explicitly supports:
 * - LMP (Last Menstrual Period): current gestational age is days since LMP.
 * - EDD (Estimated Due Date): standard pregnancy is 280 days; current days = 280 - (EDD - today).
 * - pregnancyWeekRecordedAt / anchorDate / pregnancyStartDate: progression advances from recorded date.
 *
 * CRITICAL RULE:
 * Never calculate pregnancy progression from user.createdAt or user.lastUpdated.
 * If the user only has pregnancyWeek and no valid timeline anchor, preserve the stored pregnancyWeek
 * and currentDay = 1 without inventing a date.
 */
function calculatePregnancyInfo(user) {
  const rawWeek = Number(user?.pregnancyWeek);
  const baseWeek = Number.isFinite(rawWeek) && rawWeek >= 1 && rawWeek <= 42 ? rawWeek : 1;

  const lmpVal = user?.lmp || user?.lmpDate || user?.lastMenstrualPeriod;
  const eddVal = user?.edd || user?.dueDate || user?.estimatedDueDate;
  const anchorVal = user?.pregnancyWeekRecordedAt || user?.anchorDate || user?.pregnancyStartDate;

  const now = Date.now();

  // 1. Check LMP Anchor
  if (lmpVal) {
    const lmpTime = new Date(lmpVal).getTime();
    if (!Number.isNaN(lmpTime)) {
      const diffDays = Math.floor((now - lmpTime) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 300) {
        const week = Math.min(42, Math.max(1, Math.floor(diffDays / 7) + 1));
        const day = (diffDays % 7) + 1;
        return {
          currentWeek: week,
          currentDay: day,
          hasTimelineAnchor: true,
          anchorType: "LMP",
        };
      }
    }
  }

  // 2. Check EDD Anchor
  if (eddVal) {
    const eddTime = new Date(eddVal).getTime();
    if (!Number.isNaN(eddTime)) {
      const remainingDays = Math.floor((eddTime - now) / (1000 * 60 * 60 * 24));
      const elapsedDays = 280 - remainingDays;
      if (elapsedDays >= 0 && elapsedDays <= 300) {
        const week = Math.min(42, Math.max(1, Math.floor(elapsedDays / 7) + 1));
        const day = (elapsedDays % 7) + 1;
        return {
          currentWeek: week,
          currentDay: day,
          hasTimelineAnchor: true,
          anchorType: "EDD",
        };
      }
    }
  }

  // 3. Check pregnancyWeekRecordedAt / anchorDate Anchor
  if (anchorVal) {
    const anchorTime = new Date(anchorVal).getTime();
    if (!Number.isNaN(anchorTime)) {
      const diffDays = Math.max(0, Math.floor((now - anchorTime) / (1000 * 60 * 60 * 24)));
      const additionalWeeks = Math.floor(diffDays / 7);
      const dayInWeek = (diffDays % 7) + 1;
      const calculatedWeek = Math.min(42, Math.max(1, baseWeek + additionalWeeks));
      return {
        currentWeek: calculatedWeek,
        currentDay: dayInWeek,
        hasTimelineAnchor: true,
        anchorType: "recordedAt",
      };
    }
  }

  // 4. Default: User has stored pregnancyWeek and no valid timeline anchor
  // Preserve stored pregnancyWeek without fabricating progression
  return {
    currentWeek: baseWeek,
    currentDay: 1,
    hasTimelineAnchor: false,
    anchorType: null,
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
      id: "care-water",
      text: `Drink ${formatRemainingWater(
        remainingWater
      )} more to reach your ${waterTargetL}L water goal`,
      type: "water",
    });
  }

  // 2. Sleep Goal Task
  const sleepTarget = getSleepTargetHours(currentWeekData.sleepHours);

  if (sleep < sleepTarget) {
    const remainingSleep = Math.max(0, sleepTarget - sleep);

    tasks.push({
      id: "care-sleep",
      text: `Rest well: aim for ${
        remainingSleep % 1 === 0
          ? remainingSleep
          : remainingSleep.toFixed(1)
      } more hr${remainingSleep > 1 ? "s" : ""} of sleep`,
      type: "sleep",
    });
  }

  // 3. Walking / Activity Goal Task
  const walkingTarget = DEFAULT_WALKING_GOAL_MINS;

  if (walking < walkingTarget) {
    const remainingWalking = walkingTarget - walking;

    tasks.push({
      id: "care-walking",
      text: `Aim for ${remainingWalking} more mins of gentle walking or stretching`,
      type: "walking",
    });
  }

  // 4. Symptom Monitoring Task
  if (symptoms && symptoms.length > 0) {
    tasks.push({
      id: "care-symptom",
      text: `Monitor logged symptom${
        symptoms.length > 1 ? "s" : ""
      } (${symptoms.map((s) => s.symptom).join(", ")})`,
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
  const [careTasks, setCareTasks] = useState(() => {
    try {
      const initialCare = getTodayCare();
      return initialCare.completed || {};
    } catch {
      return {};
    }
  });

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

  // Load Today's Care state for current user and week
  useEffect(() => {
    function loadCareState() {
      const todayCare = getTodayCare(currentWeek);
      setCareTasks(todayCare.completed || {});
    }

    loadCareState();
  }, [currentWeek]);



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
  // If timeline anchor is present, include the days elapsed for accurate daily progression
  const totalDays = pregnancyInfo.hasTimelineAnchor
    ? (currentWeek - 1) * 7 + currentDay
    : currentWeek * 7;
  const progress = Math.min(100, Math.max(1, Math.round((totalDays / 280) * 100)));

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
          <div className="health-item-wrapper health-stat-row">
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
          <div className="health-item health-stat-row">
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
          <div className="health-item health-stat-row">
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
          <div className="health-item health-stat-row">
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

