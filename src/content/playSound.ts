// src/content/playSound.ts
import {
  playNotificationSound,
  DEFAULT_NOTIFICATION_SOUND,
} from "../utils/audio";

// 监听来自 background 的消息
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "PLAY_SOUND") {
    // 使用消息中的声音路径，如果没有提供则使用默认路径
    const soundPath = message.soundPath || DEFAULT_NOTIFICATION_SOUND;

    // 在内容脚本环境中播放声音
    playNotificationSound(soundPath)
      .then(() => {
        if (sendResponse) sendResponse({ success: true });
      })
      .catch((error) => {
        if (sendResponse)
          sendResponse({ success: false, error: String(error) });
      });

    return true; // 保持消息通道开放以进行异步响应
  }
});
