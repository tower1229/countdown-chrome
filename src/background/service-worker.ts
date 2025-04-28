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

let isCountingDown = false;
// 追踪已知活跃的内容脚本
const activeContentScriptTabs = new Set<number>();

// 添加内容脚本状态处理
chrome.runtime.onMessage.addListener((message, sender) => {
  const tabId = sender.tab?.id;
  if (message.type === "CONTENT_SCRIPT_LOADED" && typeof tabId === "number") {
    console.debug(`内容脚本已在标签页 ${tabId} 加载`);
    activeContentScriptTabs.add(tabId);
  }
});

// 检测标签页关闭，从活跃内容脚本集合中移除
chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeContentScriptTabs.has(tabId)) {
    activeContentScriptTabs.delete(tabId);
    console.debug(`标签页 ${tabId} 已关闭，从活跃内容脚本集合中移除`);
  }
});

// 计时器更新函数
const updateTimer = async () => {
  try {
    const state = await getTimerState();

    if (!state || !state.isCountingDown) {
      // 没有运行中的倒计时，确保恢复默认图标
      isCountingDown = false;
      await restoreDefaultIcon();
      return;
    }

    isCountingDown = true;

    const now = Date.now();
    const remainingTime = state.endTime - now;

    // 发送更新消息给popup
    try {
      chrome.runtime.sendMessage({
        type: "TIMER_UPDATE",
        remainingTime,
      });
    } catch (error) {
      console.debug("发送TIMER_UPDATE消息失败，可能没有活跃的接收方");
    }

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

// 获取当前计时器的声音设置
const getCurrentTimerSound = async (): Promise<string> => {
  const state = await getTimerState();
  return state?.sound || DEFAULT_NOTIFICATION_SOUND;
};

// 计时器完成函数
const completeTimer = async () => {
  try {
    // 获取当前计时器的声音设置
    const sound = await getCurrentTimerSound();

    // 清除计时器状态
    await clearTimerState();

    // 恢复默认图标
    await restoreDefaultIcon();

    // 发送消息给popup（如果存在）
    try {
      chrome.runtime.sendMessage({ type: "TIMER_COMPLETED" });
    } catch (error) {
      // 忽略错误，可能是因为没有活跃的接收方
      console.debug("发送TIMER_COMPLETED消息失败，可能没有活跃的接收方");
    }

    // 显示通知
    showNotification("倒计时结束", "您设置的倒计时已经结束");

    // 使用离屏文档播放声音
    try {
      await playWithOffscreenDocument(sound, 0.8);
    } catch (error) {
      console.debug("使用离屏文档播放声音失败:", error);
      // 备选方案: 尝试通过内容脚本播放声音

      // 首先检查我们已知的活跃内容脚本
      let soundPlayed = false;
      if (activeContentScriptTabs.size > 0) {
        for (const tabId of activeContentScriptTabs) {
          try {
            chrome.tabs.sendMessage(
              tabId,
              {
                type: "PLAY_SOUND",
                soundPath: sound,
              },
              (response) => {
                if (chrome.runtime.lastError) {
                  console.debug(
                    `无法在标签页 ${tabId} 播放声音:`,
                    chrome.runtime.lastError.message
                  );
                  activeContentScriptTabs.delete(tabId); // 移除无响应的标签页
                } else if (response?.success) {
                  console.debug(`成功在标签页 ${tabId} 播放声音`);
                  soundPlayed = true;
                }
              }
            );
          } catch (error) {
            console.debug(`向标签页 ${tabId} 发送消息时出错:`, error);
          }
        }
      }

      // 如果没有成功通过已知标签页播放，尝试查询所有标签页
      if (!soundPlayed) {
        chrome.tabs.query({}, (tabs) => {
          for (const tab of tabs) {
            const tabId = tab.id;
            if (
              typeof tabId === "number" &&
              tab.url?.startsWith("http") &&
              !activeContentScriptTabs.has(tabId)
            ) {
              chrome.tabs.sendMessage(
                tabId,
                {
                  type: "PLAY_SOUND",
                  soundPath: sound,
                },
                (response) => {
                  if (chrome.runtime.lastError) {
                    console.debug(
                      `无法在标签页 ${tabId} 播放声音:`,
                      chrome.runtime.lastError.message
                    );
                  } else if (response?.success) {
                    console.debug(`成功在标签页 ${tabId} 播放声音`);
                    activeContentScriptTabs.add(tabId); // 添加到已知活跃标签页
                  }
                }
              );
            }
          }
        });
      }
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
    if (message.type === "GET_COUNTDOWN_STATUS") {
      sendResponse({ isCountingDown });
      return true;
    }
    if (message.type === "START_TIMER") {
      // 保存计时器状态
      const timerState: TimerState = {
        isCountingDown: true,
        endTime: message.endTime,
        totalSeconds: message.totalSeconds,
        currentTimerId: message.currentTimerId, // 保存当前定时器ID
        sound: message.sound || DEFAULT_NOTIFICATION_SOUND, // 保存声音设置
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
        // 尝试发送消息，但忽略错误
        try {
          chrome.runtime.sendMessage({ type: "TIMER_CANCELLED" });
        } catch (error) {
          console.debug("发送TIMER_CANCELLED消息失败，可能没有活跃的接收方");
        }
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
