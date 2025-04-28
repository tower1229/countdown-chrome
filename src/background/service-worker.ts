import { TimerState } from "../types";
import { createIconText } from "../utils/timer";
import { setExtensionIcon, restoreDefaultIcon } from "../utils/icon-generator";
import {
  getTimerState,
  saveTimerState,
  clearTimerState,
} from "../utils/storage";
import {
  DEFAULT_NOTIFICATION_SOUND,
  playWithOffscreenDocument,
} from "../utils/audio";

// 更新图标和发送消息的间隔
const UPDATE_INTERVAL = 1000; // 1秒

// 计时器更新函数
const updateTimer = async () => {
  try {
    const state = await getTimerState();

    if (!state || !state.isRunning) {
      // 没有运行中的倒计时，确保恢复默认图标
      await restoreDefaultIcon();
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

    // 恢复默认图标
    await restoreDefaultIcon();

    // 发送消息给popup
    chrome.runtime.sendMessage({ type: "TIMER_COMPLETED" });

    // 显示通知
    showNotification("倒计时结束", "您设置的倒计时已经结束");

    // 使用离屏文档播放声音
    try {
      await playWithOffscreenDocument(DEFAULT_NOTIFICATION_SOUND, 0.8);
    } catch (error) {
      console.error("播放通知声音失败:", error);

      // 备选方案: 尝试通过内容脚本播放声音
      chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
          if (tab.id && tab.url?.startsWith("http")) {
            chrome.tabs.sendMessage(
              tab.id,
              {
                type: "PLAY_SOUND",
                soundPath: DEFAULT_NOTIFICATION_SOUND,
              },
              () => {
                // 忽略错误，chrome.runtime.lastError 会自动处理
              }
            );
          }
        }
      });
    }
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
        // 恢复默认图标
        restoreDefaultIcon();
        chrome.runtime.sendMessage({ type: "TIMER_CANCELLED" });
        sendResponse({ success: true });
      });

      return true; // 异步响应
    } else if (message.type === "AUDIO_ENDED") {
      // 可能需要在此处进行一些清理工作
      // 例如，在不再需要时关闭离屏文档
      console.log("音频播放完成");
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
  // 重置状态
  clearTimerState();
  // 确保使用默认图标
  restoreDefaultIcon();
});
