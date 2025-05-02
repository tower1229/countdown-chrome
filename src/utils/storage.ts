import { TimerState, TimerSettings, CustomTimer, AppState } from "../types";
import { triggerCloudSync } from "./sync-manager";

/**
 * Get timer state
 */
export const getTimerState = (): Promise<TimerState | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["timerState"], (result) => {
      resolve(result.timerState || null);
    });
  });
};

/**
 * Save timer state
 */
export const saveTimerState = (state: TimerState): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ timerState: state }, () => {
      resolve();
    });
  });
};

/**
 * Clear timer state
 */
export const clearTimerState = (): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.remove(["timerState"], () => {
      resolve();
    });
  });
};

/**
 * Get last settings
 */
export const getLastSettings = (): Promise<TimerSettings | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["lastSettings"], (result) => {
      resolve(result.lastSettings || null);
    });
  });
};

/**
 * Save last settings
 */
export const saveLastSettings = (settings: TimerSettings): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ lastSettings: settings }, () => {
      resolve();
    });
  });
};

/**
 * Get all custom timers
 */
export const getCustomTimers = (): Promise<CustomTimer[]> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["customTimers"], (result) => {
      resolve(result.customTimers || []);
    });
  });
};

/**
 * Save all custom timers
 */
export const saveCustomTimers = (timers: CustomTimer[]): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ customTimers: timers }, () => {
      triggerCloudSync().catch((err) =>
        console.error("Cloud sync error:", err)
      );
      resolve();
    });
  });
};

/**
 * Get single custom timer
 */
export const getCustomTimer = (id: string): Promise<CustomTimer | null> => {
  return new Promise((resolve) => {
    getCustomTimers().then((timers) => {
      const timer = timers.find((t) => t.id === id);
      resolve(timer || null);
    });
  });
};

/**
 * Save single custom timer
 */
export const saveCustomTimer = async (timer: CustomTimer): Promise<void> => {
  const timers = await getCustomTimers();
  const index = timers.findIndex((t) => t.id === timer.id);

  if (index >= 0) {
    timers[index] = timer;
  } else {
    timers.push(timer);
  }

  return saveCustomTimers(timers);
};

/**
 * Delete custom timer
 */
export const deleteCustomTimer = async (id: string): Promise<void> => {
  const timers = await getCustomTimers();
  const filteredTimers = timers.filter((t) => t.id !== id);
  return saveCustomTimers(filteredTimers);
};

/**
 * Get app state
 */
export const getAppState = (): Promise<AppState> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["appState"], (result) => {
      resolve(
        result.appState || {
          route: "timer-list",
          editingTimer: null,
          isCreatingNew: false,
        }
      );
    });
  });
};

/**
 * Save app state
 */
export const saveAppState = (state: AppState): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ appState: state }, () => {
      resolve();
    });
  });
};
