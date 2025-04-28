import { TimerState, TimerSettings, CustomTimer, AppState } from "../types";

/**
 * 获取计时器状态
 */
export const getTimerState = (): Promise<TimerState | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["timerState"], (result) => {
      resolve(result.timerState || null);
    });
  });
};

/**
 * 保存计时器状态
 */
export const saveTimerState = (state: TimerState): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ timerState: state }, () => {
      resolve();
    });
  });
};

/**
 * 清除计时器状态
 */
export const clearTimerState = (): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.remove(["timerState"], () => {
      resolve();
    });
  });
};

/**
 * 获取上次设置
 */
export const getLastSettings = (): Promise<TimerSettings | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["lastSettings"], (result) => {
      resolve(result.lastSettings || null);
    });
  });
};

/**
 * 保存上次设置
 */
export const saveLastSettings = (settings: TimerSettings): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ lastSettings: settings }, () => {
      resolve();
    });
  });
};

/**
 * 获取所有自定义定时器
 */
export const getCustomTimers = (): Promise<CustomTimer[]> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["customTimers"], (result) => {
      resolve(result.customTimers || []);
    });
  });
};

/**
 * 保存所有自定义定时器
 */
export const saveCustomTimers = (timers: CustomTimer[]): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ customTimers: timers }, () => {
      resolve();
    });
  });
};

/**
 * 获取单个自定义定时器
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
 * 保存单个自定义定时器
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
 * 删除自定义定时器
 */
export const deleteCustomTimer = async (id: string): Promise<void> => {
  const timers = await getCustomTimers();
  const filteredTimers = timers.filter((t) => t.id !== id);
  return saveCustomTimers(filteredTimers);
};

/**
 * 获取应用状态
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
 * 保存应用状态
 */
export const saveAppState = (state: AppState): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ appState: state }, () => {
      resolve();
    });
  });
};
