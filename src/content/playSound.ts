// src/content/playSound.ts
const playNotificationSound = () => {
  const audio = new Audio(chrome.runtime.getURL("sounds/notification.mp3"));
  audio.volume = 1.0;
  audio.play().catch((error) => {
    console.error("无法播放通知声音:", error);
    // 可能因用户未交互导致无法自动播放
  });
};

// 监听来自 background 的消息
chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "PLAY_SOUND") {
    playNotificationSound();
  }
});

console.log("Tab Countdown Timer: 声音播放模块已加载");
