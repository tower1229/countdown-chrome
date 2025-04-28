/**
 * 播放通知声音
 * @param soundPath 声音文件路径或URL
 * @param volume 音量，范围 0-1，默认为 1
 */
export const playNotificationSound = (
  soundPath: string,
  volume: number = 1.0
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(chrome.runtime.getURL(soundPath));
      audio.volume = volume;

      audio.onended = () => {
        resolve();
      };

      audio.onerror = (error) => {
        console.error("播放通知声音失败:", error);
        reject(error);
      };

      audio.play().catch((error) => {
        console.error("无法播放通知声音:", error);
        // 可能因用户未交互导致无法自动播放
        reject(error);
      });
    } catch (error) {
      console.error("创建音频对象失败:", error);
      reject(error);
    }
  });
};

// 默认通知声音路径
export const DEFAULT_NOTIFICATION_SOUND = "/sounds/notification.mp3";
