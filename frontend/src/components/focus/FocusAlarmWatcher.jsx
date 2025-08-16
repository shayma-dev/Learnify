// src/components/focus/FocusAlarmWatcher.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createFocusSession } from "../../api/focusApi";

const ALARM_KEY = "focus.alarm";
const STATE_KEY = "focus.state"; // to clear stale timer if needed
const SUBJECT_KEY = "focus.selectedSubjectId";
const SOUND_SRC = "/sounds/chime.mp3";

function canNotify() {
  return "Notification" in window && Notification.permission === "granted";
}

function showNotification(title, body) {
  if (!canNotify()) return;
  try {
    new Notification(title, { body, tag: "focus-timer", renotify: true });
  } catch {
    // If notification fails (e.g. permission denied), we just ignore it
    // and let the chime play instead.
    console.warn("Notification failed:", title, body);
  }
}

// Very small audio player (same approach you used in FocusPage)
function useExternalChime(src = SOUND_SRC) {
  const ref = useRef(null);
  useEffect(() => {
    const a = new Audio(src);
    a.preload = "auto";
    a.crossOrigin = "anonymous";
    a.volume = 0.9;
    ref.current = a;
    return () => {
      try {
        a.pause();
      } catch {
        // Ignore errors if audio is already stopped
      }
      a.src = "";
      ref.current = null;
    };
  }, [src]);

  const play = useCallback(async () => {
    const a = ref.current;
    if (!a) return;
    try {
      a.currentTime = 0;
      await a.play();
    } catch {
      // Background tabs may block this; notification will still show
    }
  }, []);

  return play;
}

export default function FocusAlarmWatcher() {
  // eslint-disable-next-line no-unused-vars
  const [alarm, setAlarm] = useState(null);
  const timeoutRef = useRef(null);
  const playChime = useExternalChime();

  // Read alarm from localStorage
  const readAlarm = useCallback(() => {
    try {
      const raw = localStorage.getItem(ALARM_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // Set/reschedule timeout whenever alarm changes
  const schedule = useCallback(
    (a) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (!a || !a.endAt) return;

      const delay = Math.max(0, a.endAt - Date.now());
      timeoutRef.current = setTimeout(async () => {
        // Re-read to ensure it’s still valid
        const latest = readAlarm();
        if (!latest || latest.endAt !== a.endAt) return;

        // Save "work" session if subject exists and >= 1 min planned
        if (latest.mode === "work") {
          const minutes = Math.max(
            0,
            Math.floor(Number(latest.plannedMinutes) || 0)
          );
          const subjectId =
            latest.selectedSubjectId ??
            (() => {
              try {
                const raw = localStorage.getItem(SUBJECT_KEY);
                return raw ? JSON.parse(raw) : null;
              } catch {
                return null;
              }
            })();

          try {
            if (minutes >= 1 && subjectId != null) {
              await createFocusSession({
                subject_id: subjectId,
                duration: minutes,
              });
            }
          } catch {
            // Silently ignore; Focus page will refetch summary later
          }
        }

        // Try chime; if blocked (background), notification still appears
        playChime();
        showNotification(
          latest.mode === "work" ? "Work session complete" : "Break over",
          latest.mode === "work" ? "Time for a break." : "Back to work!"
        );

        // Clear alarm and stale state so Focus page starts fresh when opened
        try {
          localStorage.removeItem(ALARM_KEY);
        } catch {
          // Ignore errors if localStorage is not available
          console.warn("Failed to clear alarm from localStorage");
        }
        try {
          localStorage.removeItem(STATE_KEY);
        } catch {
          // Ignore errors if localStorage is not available
          console.warn("Failed to clear state from localStorage");
        }

        setAlarm(null);
      }, delay);
    },
    [playChime, readAlarm]
  );

  // Initial read on mount
  useEffect(() => {
    const a = readAlarm();
    setAlarm(a);
    schedule(a);
  }, [readAlarm, schedule]);

  // React to changes from other tabs or from FocusPage
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === ALARM_KEY) {
        const a = readAlarm();
        setAlarm(a);
        schedule(a);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [readAlarm, schedule]);

  // Also poll when returning to the tab (some browsers may defer timers)
  useEffect(() => {
    const onVis = () => {
      const a = readAlarm();
      setAlarm(a);
      schedule(a);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [readAlarm, schedule]);

  return null; // headless
}
