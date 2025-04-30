import { CustomTimer } from "../types";
import { getCustomTimers, saveCustomTimers } from "./storage";

// 同步操作的键名
const SYNC_KEY = "syncedTimers";

// 定义防抖延迟时间 (1分钟)
const DEBOUNCE_DELAY = 1 * 60 * 1000;
let syncDebounceTimer: number | null = null;

/**
 * 获取云端存储的定时器数据
 */
export const getCloudTimers = (): Promise<CustomTimer[] | null> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get([SYNC_KEY], (result) => {
      if (!result[SYNC_KEY]) {
        console.log("未找到云端定时器数据");
        resolve(null);
        return;
      }

      console.log(`找到${result[SYNC_KEY].length}个云端定时器`);
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
          console.log(`成功同步${timers.length}个定时器到云端`);
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
      console.log("防抖结束，执行云端同步");
      try {
        const timers = await getCustomTimers();
        await saveToCloud(timers);
      } catch (error) {
        console.error("云端同步错误:", error);
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
  console.log("初始化云端同步...");
  try {
    // 获取云端数据
    const cloudTimers = await getCloudTimers();

    // 如果没有云端数据，不执行任何操作
    if (!cloudTimers) {
      console.log("未找到云端数据，跳过同步");
      return;
    }

    // 获取本地数据
    const localTimers = await getCustomTimers();
    console.log(
      `本地有${localTimers.length}个定时器，云端有${cloudTimers.length}个定时器`
    );

    // 如果本地没有数据或者有云端数据，直接使用云端数据（覆盖模式）
    if (localTimers.length === 0 || cloudTimers.length > 0) {
      console.log(`使用云端数据覆盖本地`);
      await saveCustomTimers(cloudTimers);
      return;
    }
  } catch (error) {
    console.error("初始化云端同步错误:", error);
  }
};

/**
 * 强制执行云端同步，不等待防抖
 * 可用于插件卸载前或用户手动触发同步
 */
export const forceSyncToCloud = async (): Promise<void> => {
  console.log("执行强制云端同步");
  try {
    // 清除任何现有的防抖计时器
    if (syncDebounceTimer !== null) {
      clearTimeout(syncDebounceTimer);
      syncDebounceTimer = null;
    }

    // 立即执行同步
    const timers = await getCustomTimers();
    await saveToCloud(timers);
    console.log("强制云端同步完成");
  } catch (error) {
    console.error("强制云端同步错误:", error);
  }
};
