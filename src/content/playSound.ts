// src/content/playSound.ts
import {
  playNotificationSound,
  DEFAULT_NOTIFICATION_SOUND,
} from "../utils/audio";

// 记录内容脚本已加载
console.debug("倒计时扩展内容脚本已加载");

// 监听来自 background 的消息
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "PLAY_SOUND") {
    console.debug("内容脚本收到播放声音请求:", message);

    // 使用消息中的声音路径，如果没有提供则使用默认路径
    const soundPath = message.soundPath || DEFAULT_NOTIFICATION_SOUND;

    // 在内容脚本环境中播放声音
    playNotificationSound(soundPath)
      .then(() => {
        console.debug("内容脚本成功播放声音");
        if (sendResponse) sendResponse({ success: true });
      })
      .catch((error) => {
        console.debug("内容脚本播放声音失败:", error);
        if (sendResponse)
          sendResponse({ success: false, error: String(error) });
      });

    return true; // 保持消息通道开放以进行异步响应
  }

  // 添加一个消息处理器，用于检查内容脚本是否在线
  if (message?.type === "CONTENT_SCRIPT_CHECK") {
    console.debug("收到内容脚本检查请求");
    if (sendResponse) sendResponse({ alive: true });
    return true;
  }
});

// 向background script发送一个初始化消息，表明内容脚本已加载
try {
  chrome.runtime.sendMessage({ type: "CONTENT_SCRIPT_LOADED" });
} catch (error) {
  console.debug("无法向background发送加载消息:", error);
}
