import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactDOM from "react-dom/client";
import "../utils/index.css";
import "../utils/global.css";
import "../utils/chrome-theme.css";
import { TimerState, CustomTimer, AppState, Route } from "../types";
import { calculateTotalSeconds } from "../utils/timer";
import {
  playNotificationSound,
  DEFAULT_NOTIFICATION_SOUND,
} from "../utils/audio";
import {
  getCustomTimers,
  deleteCustomTimer,
  saveCustomTimers,
  getAppState,
  saveAppState,
  saveCustomTimer,
} from "../utils/storage";
import TimerListPage from "./pages/TimerListPage";
import CountdownView from "./components/CountdownView";
import TimerEditPage from "./pages/TimerEditPage";

const Popup: React.FC = () => {
  // General state
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentColor, setCurrentColor] = useState<string>("#3B82F6");

  // Timer management state
  const [timers, setTimers] = useState<CustomTimer[]>([]);

  // Route state
  const [currentRoute, setCurrentRoute] = useState<Route>("timer-list");
  const [editingTimer, setEditingTimer] = useState<CustomTimer | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  const [isCountingDown, setIsCountingDown] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Reset popup height
  const resetPopupHeight = useCallback(() => {
    document.documentElement.style.height = "";
    document.body.style.height = "";
  }, []);

  // Load app state and timer list
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get timer list
        const customTimers = await getCustomTimers();
        setTimers(customTimers);

        // Get app state
        const appState = await getAppState();
        setCurrentRoute(appState.route);
        setEditingTimer(appState.editingTimer);
        setIsCreatingNew(appState.isCreatingNew);

        // Get current countdown state
        chrome.storage.local.get(["timerState"], (result) => {
          const state = result.timerState as TimerState | undefined;
          if (state && state.isCountingDown) {
            setIsCountingDown(true);
            setRemainingTime(state.endTime - Date.now());
            setTotalTime(state.totalSeconds * 1000);

            // If there is a current timer ID, find and display related information
            if (state.currentTimerId) {
              const currentTimer = customTimers.find(
                (t) => t.id === state.currentTimerId
              );
              if (currentTimer) {
                setHours(currentTimer.hours);
                setMinutes(currentTimer.minutes);
                setSeconds(currentTimer.seconds);
                setCurrentColor(currentTimer.color);
              }
            }
          } else {
            // Load last settings
            chrome.storage.local.get(["lastSettings"], (result) => {
              const settings = result.lastSettings;
              if (settings) {
                setHours(settings.hours || 0);
                setMinutes(settings.minutes || 0);
                setSeconds(settings.seconds || 0);
              }
              setIsLoading(false);
            });
          }
          setIsLoading(false);
        });
      } catch (error) {
        console.error("Failed to load app data:", error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Monitor countdown state changes
  useEffect(() => {
    if (!isCountingDown) {
      // Reset height when countdown ends or is cancelled
      resetPopupHeight();

      // A small delay to ensure height is recalculated after DOM updates
      setTimeout(() => {
        resetPopupHeight();
      }, 50);
    }
  }, [isCountingDown, resetPopupHeight]);

  // Update app state
  const updateAppState = useCallback(async (newState: Partial<AppState>) => {
    try {
      const currentState = await getAppState();
      const updatedState = { ...currentState, ...newState };
      await saveAppState(updatedState);
    } catch (error) {
      console.error("Failed to save app state:", error);
    }
  }, []);

  // Listen for state changes
  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === "TIMER_UPDATE") {
        setRemainingTime(message.remainingTime);
      } else if (message.type === "TIMER_COMPLETED") {
        setIsCountingDown(false);
        // Try to play sound in popup as well
        playNotificationSound(DEFAULT_NOTIFICATION_SOUND).catch(() => {
          // Ignore errors
        });
      } else if (message.type === "TIMER_CANCELLED") {
        setIsCountingDown(false);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  // Update displayed remaining time
  useEffect(() => {
    if (isCountingDown) {
      const interval = setInterval(() => {
        chrome.storage.local.get(["timerState"], (result) => {
          const state = result.timerState as TimerState | undefined;
          if (state && state.isCountingDown) {
            setRemainingTime(state.endTime - Date.now());
          } else {
            setIsCountingDown(false);
            clearInterval(interval);
          }
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isCountingDown]);

  // Start timer
  const handleStart = useCallback(
    (customTimer?: CustomTimer) => {
      let timerHours, timerMinutes, timerSeconds, timerId;

      if (customTimer) {
        timerHours = customTimer.hours;
        timerMinutes = customTimer.minutes;
        timerSeconds = customTimer.seconds;
        timerId = customTimer.id;
        setCurrentColor(customTimer.color);
      } else {
        timerHours = hours;
        timerMinutes = minutes;
        timerSeconds = seconds;
      }

      const totalSeconds = calculateTotalSeconds(
        timerHours,
        timerMinutes,
        timerSeconds
      );
      if (totalSeconds <= 0) return;

      const endTime = Date.now() + totalSeconds * 1000;
      const totalMs = totalSeconds * 1000;

      // Set total time
      setTotalTime(totalMs);

      // Save last settings
      chrome.storage.local.set({
        lastSettings: {
          hours: timerHours,
          minutes: timerMinutes,
          seconds: timerSeconds,
        },
      });

      // Send message to background to start timer, including custom timer info
      chrome.runtime.sendMessage({
        type: "START_TIMER",
        totalSeconds,
        endTime,
        currentTimerId: timerId,
        sound: customTimer?.sound || DEFAULT_NOTIFICATION_SOUND,
      });

      setIsCountingDown(true);
      setRemainingTime(totalMs);
    },
    [hours, minutes, seconds]
  );

  // Cancel timer
  const handleCancel = useCallback(() => {
    chrome.runtime.sendMessage({ type: "CANCEL_TIMER" });
    setIsCountingDown(false);
  }, []);

  // Delete timer
  const handleDeleteTimer = useCallback(async (id: string) => {
    try {
      await deleteCustomTimer(id);
      const updatedTimers = await getCustomTimers();
      setTimers(updatedTimers);
    } catch (error) {
      console.error("Failed to delete timer:", error);
    }
  }, []);

  // Edit timer
  const handleEditTimer = useCallback(
    (timer: CustomTimer) => {
      setCurrentRoute("timer-edit");
      setEditingTimer(timer);
      setIsCreatingNew(false);
      updateAppState({
        route: "timer-edit",
        editingTimer: timer,
        isCreatingNew: false,
      });
      // When route changes, reset height
      resetPopupHeight();
    },
    [updateAppState, resetPopupHeight]
  );

  // Create new timer
  const handleCreateTimer = useCallback(() => {
    setCurrentRoute("timer-edit");
    setEditingTimer(null);
    setIsCreatingNew(true);
    updateAppState({
      route: "timer-edit",
      editingTimer: null,
      isCreatingNew: true,
    });
    // When route changes, reset height
    resetPopupHeight();
  }, [updateAppState, resetPopupHeight]);

  // Handle saving timer
  const handleSaveTimer = useCallback(
    async (timer: CustomTimer) => {
      try {
        await saveCustomTimer(timer);
        const updatedTimers = await getCustomTimers();
        setTimers(updatedTimers);
        setCurrentRoute("timer-list");
        updateAppState({
          route: "timer-list",
          editingTimer: null,
          isCreatingNew: false,
        });
        // When saving and returning to list, reset height
        resetPopupHeight();
      } catch (error) {
        console.error("Failed to save timer:", error);
      }
    },
    [updateAppState, resetPopupHeight]
  );

  // Reorder timers
  const handleReorderTimers = useCallback(async (newOrder: CustomTimer[]) => {
    try {
      await saveCustomTimers(newOrder);
      setTimers(newOrder);
    } catch (error) {
      console.error("Failed to update timer order:", error);
    }
  }, []);

  // Go back one level
  const handleGoBack = useCallback(() => {
    setCurrentRoute("timer-list");
    updateAppState({ route: "timer-list" });
    // When returning to list, reset height
    resetPopupHeight();
  }, [updateAppState, resetPopupHeight]);

  useEffect(() => {
    // Initial get countdown status
    chrome.runtime.sendMessage({ type: "GET_COUNTDOWN_STATUS" }, (res) => {
      if (res && typeof res.isCountingDown === "boolean")
        setIsCountingDown(res.isCountingDown);
    });
    // Listen for background status changes
    const handleMessage = (msg: any) => {
      if (msg.type === "COUNTDOWN_STATUS_CHANGED")
        setIsCountingDown(msg.isCountingDown);
    };
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  // Add logic to reset height when route changes
  useEffect(() => {
    resetPopupHeight();
  }, [currentRoute, resetPopupHeight]);

  return (
    <div
      ref={rootRef}
      className="flex flex-col mx-auto min-h-screen pb-2 rounded-lg overflow-hidden"
      style={{ width: "360px" }}
    >
      {!isLoading && (
        <div className="flex-grow">
          {isCountingDown ? (
            <CountdownView
              remainingTime={remainingTime}
              onCancel={handleCancel}
              color={currentColor}
              totalTime={totalTime}
            />
          ) : (
            <>
              {currentRoute === "timer-list" && (
                <TimerListPage
                  timers={timers}
                  onEditTimer={handleEditTimer}
                  onDeleteTimer={handleDeleteTimer}
                  onStartTimer={handleStart}
                  onCreateTimer={handleCreateTimer}
                  onReorderTimers={handleReorderTimers}
                  isCountingDown={isCountingDown}
                  onCancel={handleCancel}
                  remainingTime={remainingTime}
                />
              )}
              {currentRoute === "timer-edit" && (
                <TimerEditPage
                  timer={editingTimer}
                  onSave={handleSaveTimer}
                  onCancel={handleGoBack}
                  isCreatingNew={isCreatingNew}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Render application
const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <div style={{ width: "360px" }} className="rounded-lg overflow-hidden">
      <Popup />
    </div>
  );
}

export default Popup;
