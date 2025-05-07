import { CustomTimer, SyncData } from "../types";
import { getCustomTimers, saveCustomTimers } from "./storage";

// 同步操作的键名
const SYNC_KEY = "syncData";

// 定义防抖延迟时间 (1分钟)
const DEBOUNCE_DELAY = 1 * 60 * 1000;
let syncDebounceTimer: number | null = null;

/**
 * 获取云端存储的同步数据
 */
export const getCloudData = (): Promise<SyncData | null> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get([SYNC_KEY], (result) => {
      if (!result[SYNC_KEY]) {
        console.log("未找到云端同步数据");
        resolve(null);
        return;
      }

      const syncData = result[SYNC_KEY] as SyncData;
      console.log(`找到云端同步数据，包含${syncData.timers.length}个定时器，最后更新时间: ${new Date(syncData.lastUpdated).toLocaleString()}`);
      resolve(syncData);
    });
  });
};

/**
 * 保存同步数据到云端
 */
export const saveToCloud = async (timers: CustomTimer[]): Promise<void> => {
  const now = Date.now();
  const syncData: SyncData = {
    timers: timers,
    lastUpdated: now
  };

  return new Promise((resolve) => {
    chrome.storage.sync.set(
      {
        [SYNC_KEY]: syncData,
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error("Cloud sync error:", chrome.runtime.lastError);
        } else {
          console.log(`成功同步${timers.length}个定时器到云端，同步时间: ${new Date(now).toLocaleString()}`);
        }
        resolve();
      }
    );
  });
};

/**
 * 触发带防抖的云端同步
 * 当定时器列表变化时调用，延迟后才真正同步到云端
 */
export const triggerCloudSync = async (): Promise<void> => {
  console.log("触发云端同步（带防抖）");
  // 清除现有的防抖计时器
  if (syncDebounceTimer !== null) {
    clearTimeout(syncDebounceTimer);
  }

  // 设置新的防抖计时器
  return new Promise((resolve) => {
    syncDebounceTimer = setTimeout(async () => {
      try {
        await syncWithCloud();
        console.log("云端同步成功");
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
 * 执行云端同步，比较时间戳并选择最新的数据
 */
export const syncWithCloud = async (): Promise<void> => {
  try {
    // 获取本地数据
    const localTimers = await getCustomTimers();
    
    // 获取云端数据
    const cloudData = await getCloudData();
    
    if (!cloudData) {
      // 如果云端没有数据，则将本地数据上传到云端
      console.log("云端无数据，上传本地数据");
      await saveToCloud(localTimers);
      return;
    }
    
    // 获取本地数据最后修改时间
    // 如果没有本地存储的最后修改时间，则使用云端数据
    const localLastUpdated = await getLocalLastUpdated();
    
    if (!localLastUpdated) {
      console.log("本地无最后更新时间记录，使用云端数据");
      await saveCustomTimers(cloudData.timers, false);
      await saveLocalLastUpdated(cloudData.lastUpdated);
      return;
    }
    
    // 比较本地和云端的最后更新时间，选择最新的数据
    if (cloudData.lastUpdated > localLastUpdated) {
      // 云端数据更新，使用云端数据
      console.log("云端数据更新，使用云端数据");
      await saveCustomTimers(cloudData.timers, false);
      await saveLocalLastUpdated(cloudData.lastUpdated);
    } else {
      // 本地数据更新，上传到云端
      console.log("本地数据更新，上传到云端");
      await saveToCloud(localTimers);
    }
  } catch (error) {
    console.error("同步过程中出错:", error);
    throw error;
  }
};

/**
 * 获取本地数据的最后更新时间
 */
export const getLocalLastUpdated = (): Promise<number | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["lastUpdated"], (result) => {
      resolve(result.lastUpdated || null);
    });
  });
};

/**
 * 保存本地数据的最后更新时间
 */
export const saveLocalLastUpdated = (timestamp: number): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ lastUpdated: timestamp }, () => {
      resolve();
    });
  });
};

/**
 * 初始化时检查并同步云端数据
 * 在扩展初始化时调用，基于时间戳合并本地和云端数据
 */
export const initializeCloudSync = async (): Promise<void> => {
  console.log("初始化云端同步...");
  try {
    await syncWithCloud();
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
    await syncWithCloud();
    console.log("强制云端同步完成");
  } catch (error) {
    console.error("强制云端同步错误:", error);
  }
};
