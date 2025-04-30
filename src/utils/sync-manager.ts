import { CustomTimer } from "../types";
import { getCustomTimers, saveCustomTimers } from "./storage";

// 同步操作的键名
const SYNC_KEY = "syncedTimers";

// 定义防抖延迟时间 (10分钟)
const DEBOUNCE_DELAY = 10 * 60 * 1000;
let syncDebounceTimer: number | null = null;

/**
 * 获取云端存储的定时器数据
 */
export const getCloudTimers = (): Promise<CustomTimer[] | null> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get([SYNC_KEY], (result) => {
      if (!result[SYNC_KEY]) {
        resolve(null);
        return;
      }

      resolve(result[SYNC_KEY] || []);
    });
  });
};

/**
 * 保存定时器数据到云端
 */
export const saveToCloud = async (timers: CustomTimer[]): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.sync.set(
      {
        [SYNC_KEY]: timers,
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error("Cloud sync error:", chrome.runtime.lastError);
        } else {
          console.log("Timers synced to cloud successfully");
        }
        resolve();
      }
    );
  });
};

/**
 * 触发带防抖的云端同步
 * 当定时器列表变化时调用，10分钟后才真正同步到云端
 */
export const triggerCloudSync = async (): Promise<void> => {
  // 清除现有的防抖计时器
  if (syncDebounceTimer !== null) {
    clearTimeout(syncDebounceTimer);
  }

  // 设置新的防抖计时器
  return new Promise((resolve) => {
    syncDebounceTimer = setTimeout(async () => {
      try {
        const timers = await getCustomTimers();
        await saveToCloud(timers);
      } catch (error) {
        console.error("Error in triggerCloudSync:", error);
      } finally {
        syncDebounceTimer = null;
        resolve();
      }
    }, DEBOUNCE_DELAY) as unknown as number;
  });
};

/**
 * 初始化时检查并同步云端数据
 * 在扩展初始化时调用，如果有云端数据则直接下载使用
 */
export const initializeCloudSync = async (): Promise<void> => {
  try {
    // 获取云端数据
    const cloudTimers = await getCloudTimers();

    // 如果没有云端数据，不执行任何操作
    if (!cloudTimers) {
      console.log("No cloud data found, skipping sync");
      return;
    }

    // 获取本地数据
    const localTimers = await getCustomTimers();

    // 如果本地没有数据或者有云端数据，直接使用云端数据（覆盖模式）
    if (localTimers.length === 0 || cloudTimers.length > 0) {
      console.log(`Using cloud data: ${cloudTimers.length} timers`);
      await saveCustomTimers(cloudTimers);
      return;
    }

    console.log("No changes needed during cloud sync");
  } catch (error) {
    console.error("Error in initializeCloudSync:", error);
  }
};

/**
 * 强制执行云端同步，不等待防抖
 * 可用于插件卸载前或用户手动触发同步
 */
export const forceSyncToCloud = async (): Promise<void> => {
  try {
    // 清除任何现有的防抖计时器
    if (syncDebounceTimer !== null) {
      clearTimeout(syncDebounceTimer);
      syncDebounceTimer = null;
    }

    // 立即执行同步
    const timers = await getCustomTimers();
    await saveToCloud(timers);
    console.log("Force sync to cloud completed");
  } catch (error) {
    console.error("Error in forceSyncToCloud:", error);
  }
};
