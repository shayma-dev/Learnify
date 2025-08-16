/* src/pages/FocusPage.jsx */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import FocusUI from "../components/focus/FocusUI.jsx";
import useFocusTimer from "../hooks/useFocusTimer.js";
import AppNav from "../components/common/AppNav";
import FocusAlarmWatcher from "../components/focus/FocusAlarmWatcher.jsx";
import {
  getFocusSummary,
  createFocusSession,
  normalizeFocusSummary,
  getFocusApiError,
} from "../api/focusApi.js";

const CONFIG_KEY = "focus.config";
const SOUND_KEY = "focus.sound";
const SUBJECT_KEY = "focus.selectedSubjectId";
const STATE_KEY = "focus.state"; // ephemeral (owned by hook)

/**
 * Place your chime file at: public/sounds/chime.mp3
 * Then it will be served at: /sounds/chime.mp3
 */

/** Helpers */

const ALARM_KEY = "focus.alarm";

function canNotify() {
  return "Notification" in window;
}

async function ensureNotifyPermission() {
  if (!canNotify()) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try {
    const res = await Notification.requestPermission();
    return res === "granted";
  } catch {
    return false;
  }
}

function showNotification(title, body) {
  if (!canNotify() || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, tag: "focus-timer", renotify: true });
  } catch {
    // ignore
  }
}

function formatMinutes(mm) {
  const m = Math.max(0, Math.floor(Number(mm) || 0));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h > 0) return `${h}h ${rem}m`;
  return `${rem}m`;
}

function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn(`Failed to set localStorage for ${key}`);
    }
  }, [key, value]);
  return [value, setValue];
}

/*
  External audio track approach (no WebAudio API):
  - Preload a single HTMLAudioElement
  - Provide unlock() that plays muted once on a user gesture (Start/Resume/Toggle) to satisfy autoplay policies
  - Provide beep() that plays the track from start
*/
function useAudioBeep(src = "/sounds/chime.mp3") {
  const audioRef = useRef(null);

  useEffect(() => {
    const a = new Audio(src);
    a.preload = "auto";
    a.crossOrigin = "anonymous";
    // Optional: adjust default volume (0.0 - 1.0)
    a.volume = 0.9;
    audioRef.current = a;

    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {
          console.warn("Failed to pause audio on cleanup");
        }
        // Clear src to allow GC in some browsers
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, [src]);

  // Unlock by playing muted once during a user gesture
  const unlock = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      a.muted = true;
      await a.play();
      a.pause();
      a.currentTime = 0;
      a.muted = false;
    } catch {
      // If blocked, the next gesture can try again
    }
  }, []);

  const beep = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      // Restart from beginning; if already playing, this snaps to start
      a.currentTime = 0;
      await a.play();
    } catch (err) {
      console.warn("Chime play failed:", err);
      // Likely blocked if unlock wasn't called by a gesture yet
      // Safe to ignore; next user gesture will unlock
      // console.warn("Chime play blocked:", err);
    }
  }, []);

  return { beep, unlock };
}

export default function FocusPage() {
  // Config (defaults)
  const [config, setConfig] = useLocalStorage(CONFIG_KEY, {
    workMinutes: 25,
    breakMinutes: 5,
  });

  // Sound
  const [soundEnabled, setSoundEnabled] = useLocalStorage(SOUND_KEY, true);
  const { beep, unlock } = useAudioBeep("/sounds/chime.mp3");

  const toggleSound = useCallback(() => {
    unlock(); // audio unlock
    ensureNotifyPermission(); // ask once
    setSoundEnabled((v) => !v);
  }, [unlock, setSoundEnabled]);

  // Summary data
  const [summary, setSummary] = useState({
    subjects: [],
    todayBySubject: [],
    todayTotalMinutes: 0,
    todaySessionsCount: 0,
    allTimePerSubject: [],
    allTimeTotalMinutes: 0,
  });
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    setErrorMessage(null);
    try {
      const raw = await getFocusSummary();
      const norm = normalizeFocusSummary(raw);
      const subjects = (norm.subjects || []).map((s) => ({
        id: s.id,
        name: s.name,
      }));
      const todayBySubject = norm.todaySessions || [];
      const todayTotalMinutes = norm.todayTotal || 0;
      const todaySessionsCount = norm.todaySessionsCount || 0;
      const allTimePerSubject = norm.totalFocus || [];
      const allTimeTotalMinutes = allTimePerSubject.reduce(
        (sum, s) => sum + (Number(s.total_focus) || 0),
        0
      );

      setSummary({
        subjects,
        todayBySubject,
        todayTotalMinutes,
        todaySessionsCount,
        allTimePerSubject,
        allTimeTotalMinutes,
      });
    } catch (err) {
      setErrorMessage(getFocusApiError(err));
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Selected subject (persist separately)
  const [selectedSubjectId, setSelectedSubjectId] = useLocalStorage(
    SUBJECT_KEY,
    null
  );

  // Reconcile selected subject with fetched list
  useEffect(() => {
    if (!summary.subjects?.length) {
      setSelectedSubjectId(null);
      return;
    }
    if (selectedSubjectId == null) return;
    const exists = summary.subjects.some(
      (s) => String(s.id) === String(selectedSubjectId)
    );
    if (!exists) setSelectedSubjectId(null);
  }, [summary.subjects, selectedSubjectId, setSelectedSubjectId]);

  // Timer hook
  const timer = useFocusTimer({
    initialMode: "work",
    initialTargetMinutes: config.workMinutes,
    storageKey: STATE_KEY,
    onComplete: async (mode) => {
      try {
        if (mode === "work") {
          // ... existing save logic ...
          timer.reset();
          timer.switchMode("break");
          if (soundEnabled) {
            if (document.visibilityState === "visible") {
              beep();
            } else {
              showNotification("Work session complete", "Time for a break.");
            }
          }
        } else if (mode === "break") {
          // ... existing switch logic ...
          timer.reset();
          timer.switchMode("work");
          if (soundEnabled) {
            if (document.visibilityState === "visible") {
              beep();
            } else {
              showNotification("Break over", "Back to work!");
            }
          }
        }
      } catch (err) {
        console.error("Error during timer completion:", err);
      } finally {
        setSaving(false);
      }
    },
  });

  // Mirror running session into a simple alarm for a global watcher
  useEffect(() => {
    if (timer.isRunning && !timer.isPaused) {
      const endAt = Date.now() + Math.max(0, timer.remainingSeconds) * 1000;
      const alarm = {
        mode: timer.mode, // "work" | "break"
        endAt, // absolute ms timestamp
        selectedSubjectId, // needed to save "work" session
        plannedMinutes: timer.targetMinutes, // fallback duration to save
      };
      try {
        localStorage.setItem(ALARM_KEY, JSON.stringify(alarm));
      } catch {
        console.warn(`Failed to set localStorage for ${ALARM_KEY}`);
      }
    } else {
      try {
        localStorage.removeItem(ALARM_KEY);
      } catch {
        console.warn(`Failed to clear localStorage for ${ALARM_KEY}`);
      }
    }
  }, [
    timer.isRunning,
    timer.isPaused,
    timer.remainingSeconds,
    timer.mode,
    timer.targetMinutes,
    selectedSubjectId,
  ]);
  // When mode changes and idle (not running + not paused), sync target to config
  useEffect(() => {
    if (!timer.isRunning && !timer.isPaused) {
      const next =
        timer.mode === "work" ? config.workMinutes : config.breakMinutes;
      timer.setTargetMinutes(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.mode, config.workMinutes, config.breakMinutes]);

  // Start rules
  const hasSubjects = summary.subjects.length > 0;
  const canStart =
    !timer.isRunning &&
    !timer.isPaused &&
    (timer.mode === "break" ||
      (timer.mode === "work" && hasSubjects && selectedSubjectId != null));

  // Stop & Save availability (>= 1 minute elapsed, running, Work mode)
  const canStopSave =
    timer.mode === "work" &&
    timer.isRunning &&
    !timer.isPaused &&
    timer.elapsedSeconds >= 60;

  // Handlers
  const onSelectSubject = useCallback(
    (id) => {
      if (timer.isRunning && timer.mode === "work") return; // locked during work session
      setSelectedSubjectId(id);
    },
    [setSelectedSubjectId, timer.isRunning, timer.mode]
  );

  const onChangeMode = useCallback(
    (next) => {
      if (timer.isRunning || timer.isPaused) return; // only idle
      if (next !== "work" && next !== "break") return;
      timer.switchMode(next);
      // target sync handled by effect
    },
    [timer]
  );

  const onChangeTargetMinutes = useCallback(
    (min) => {
      // allowed when paused or idle
      timer.setTargetMinutes(min);
    },
    [timer]
  );

  const onChangeCycleConfig = useCallback(
    (cfg) => {
      setConfig((prev) => ({
        ...prev,
        workMinutes: Math.max(
          1,
          Math.floor(cfg.workMinutes || prev.workMinutes)
        ),
        breakMinutes: Math.max(
          1,
          Math.floor(cfg.breakMinutes || prev.breakMinutes)
        ),
      }));
      // If idle, reflect immediately in target for current mode
      if (!timer.isRunning && !timer.isPaused) {
        const next = timer.mode === "work" ? cfg.workMinutes : cfg.breakMinutes;
        if (next != null) timer.setTargetMinutes(next);
      }
    },
    [setConfig, timer]
  );

  const onStart = useCallback(() => {
    if (!canStart) return;
    setErrorMessage(null);
    unlock();
    ensureNotifyPermission();
    timer.start();
  }, [canStart, timer, unlock]);

  const onPause = useCallback(() => {
    timer.pause();
  }, [timer]);

  const onResume = useCallback(() => {
    unlock();
    ensureNotifyPermission();
    timer.resume();
  }, [timer, unlock]);

  const onStopSave = useCallback(async () => {
    if (!canStopSave) return;
    try {
      setSaving(true);
      const minutes = timer.getElapsedWholeMinutes();
      if (minutes >= 1 && selectedSubjectId != null) {
        await createFocusSession({
          subject_id: selectedSubjectId,
          duration: minutes,
        });
        await fetchSummary();
      }
      // No chime for manual stop
      timer.reset();
      // Stay in Work ready state
    } catch (err) {
      setErrorMessage(getFocusApiError(err));
    } finally {
      setSaving(false);
    }
  }, [canStopSave, selectedSubjectId, timer, fetchSummary]);

  const onReset = useCallback(() => {
    // Discard partials; clear ephemeral state
    timer.reset();
    setErrorMessage(null);
    // Optionally clear focus.state to be safe (hook already maintains it)
    try {
      localStorage.removeItem(STATE_KEY);
    } catch {
      console.warn(`Failed to clear localStorage for ${STATE_KEY}`);
    }
  }, [timer]);

  const summaryProps = useMemo(
    () => ({
      todayTotalMinutes: summary.todayTotalMinutes,
      todaySessionsCount: summary.todaySessionsCount,
      todayBySubject: summary.todayBySubject,
      allTimePerSubject: summary.allTimePerSubject,
      allTimeTotalMinutes: summary.allTimeTotalMinutes,
    }),
    [summary]
  );

  const uiState = useMemo(
    () => ({
      loadingSummary,
      saving,
      errorMessage,
    }),
    [loadingSummary, saving, errorMessage]
  );

  return (
    <>
      <AppNav />
      <FocusAlarmWatcher />
      <FocusUI
        // Data
        subjects={summary.subjects}
        selectedSubjectId={selectedSubjectId}
        // Mode and cycle
        mode={timer.mode}
        cycleConfig={{
          workMinutes: config.workMinutes,
          breakMinutes: config.breakMinutes,
        }}
        targetMinutes={timer.targetMinutes}
        // Timer
        time={{
          display: timer.display,
          elapsedSeconds: timer.elapsedSeconds,
          remainingSeconds: timer.remainingSeconds,
        }}
        isRunning={timer.isRunning}
        isPaused={timer.isPaused}
        // Sound
        soundEnabled={soundEnabled}
        // Summary
        summary={summaryProps}
        // Derived states
        canStart={canStart}
        ui={uiState}
        // Callbacks
        onSelectSubject={onSelectSubject}
        onChangeMode={onChangeMode} // blocked while paused
        onChangeTargetMinutes={onChangeTargetMinutes} // allowed when paused or idle
        onChangeCycleConfig={onChangeCycleConfig}
        onStart={onStart}
        onPause={onPause}
        onResume={onResume}
        onStopSave={onStopSave}
        onReset={onReset}
        onToggleSound={toggleSound}
        // Additional derived for UI logic
        canStopSave={canStopSave}
        formatMinutes={formatMinutes}
        hasSubjects={hasSubjects}
      />
    </>
  );
}
