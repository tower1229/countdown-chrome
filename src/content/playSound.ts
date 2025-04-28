// src/content/playSound.ts
import {
  playNotificationSound,
  DEFAULT_NOTIFICATION_SOUND,
} from "../utils/audio";

// 监听来自 background 的消息
chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "PLAY_SOUND") {
    playNotificationSound(DEFAULT_NOTIFICATION_SOUND).catch((error) => {
      console.error("无法播放通知声音:", error);
    });
  }
});

console.log("Tab Countdown Timer: 声音播放模块已加载");
