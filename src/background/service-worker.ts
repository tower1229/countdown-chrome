import { TimerState } from "../types";
import { createIconText } from "../utils/timer";
import { setExtensionIcon } from "../utils/icon-generator";
import {
  getTimerState,
  saveTimerState,
  clearTimerState,
} from "../utils/storage";
import {
  playNotificationSound,
  DEFAULT_NOTIFICATION_SOUND,
} from "../utils/audio";

// 更新图标和发送消息的间隔
const UPDATE_INTERVAL = 1000; // 1秒

// 重置图标显示的默认文本
const DEFAULT_ICON_TEXT = "0:00";

// 计时器更新函数
const updateTimer = async () => {
  try {
    const state = await getTimerState();

    if (!state || !state.isRunning) {
      return;
    }

    const now = Date.now();
    const remainingTime = state.endTime - now;

    // 发送更新消息给popup
    chrome.runtime.sendMessage({
      type: "TIMER_UPDATE",
      remainingTime,
    });

    // 更新图标显示
    const timeText = createIconText(remainingTime);
    await setExtensionIcon(timeText);

    // 检查倒计时是否结束
    if (remainingTime <= 0) {
      await completeTimer();
    }
  } catch (error) {
    console.error("计时器更新错误:", error);
  }
};

// 计时器完成函数
const completeTimer = async () => {
  try {
    // 清除计时器状态
    await clearTimerState();

    // 重置图标
    await setExtensionIcon(DEFAULT_ICON_TEXT);

    // 发送消息给popup
    chrome.runtime.sendMessage({ type: "TIMER_COMPLETED" });

    // 向所有打开的标签页发送播放声音的消息
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { type: "PLAY_SOUND" }, () => {
            // 忽略错误，chrome.runtime.lastError 会自动处理
            if (chrome.runtime.lastError) {
              // 消息发送失败，但这是正常的 - 有些标签页可能无法接收消息
            }
          });
        }
      }
    });

    // 播放通知声音
    playNotificationSound(DEFAULT_NOTIFICATION_SOUND).catch((error) => {
      console.error("播放通知失败:", error);
    });

    // 显示通知
    showNotification("倒计时结束", "您设置的倒计时已经结束");
  } catch (error) {
    console.error("计时器完成错误:", error);
  }
};

// 显示通知
const showNotification = (title: string, message: string) => {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "/icons/icon128.png",
    title,
    message,
    priority: 2,
  });
};

// 处理消息
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  try {
    if (message.type === "START_TIMER") {
      // 保存计时器状态
      const timerState: TimerState = {
        isRunning: true,
        endTime: message.endTime,
        totalSeconds: message.totalSeconds,
      };

      saveTimerState(timerState).then(() => {
        // 立即更新一次
        updateTimer();
        sendResponse({ success: true });
      });

      return true; // 异步响应
    } else if (message.type === "CANCEL_TIMER") {
      clearTimerState().then(() => {
        // 重置图标
        setExtensionIcon(DEFAULT_ICON_TEXT);
        chrome.runtime.sendMessage({ type: "TIMER_CANCELLED" });
        sendResponse({ success: true });
      });

      return true; // 异步响应
    }
  } catch (error) {
    console.error("消息处理错误:", error);
    sendResponse({ success: false, error: String(error) });
  }
});

// 定时更新计时器
setInterval(updateTimer, UPDATE_INTERVAL);

// 扩展安装或更新时初始化
chrome.runtime.onInstalled.addListener(() => {
  // 重置图标和状态
  setExtensionIcon(DEFAULT_ICON_TEXT);
  clearTimerState();
});
