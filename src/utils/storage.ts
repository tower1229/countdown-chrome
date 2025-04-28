import { TimerState, TimerSettings } from "../types";

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
