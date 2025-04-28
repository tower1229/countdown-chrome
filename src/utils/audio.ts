/**
 * 播放通知声音
 * @param soundPath 声音文件路径或URL
 * @param volume 音量，范围 0-1，默认为 1
 */
export const playNotificationSound = (
  soundPath: string,
  volume: number = 1.0
): Promise<void> => {
  // 检查是否在Service Worker环境中
  if (typeof window === "undefined" || typeof Audio === "undefined") {
    // Service Worker环境，使用offscreen document API播放音频
    return playWithOffscreenDocument(soundPath, volume);
  }

  // 浏览器环境中正常使用Audio API
  return new Promise((resolve, reject) => {
    try {
      const fullPath = chrome.runtime.getURL(getSoundPath(soundPath));
      const audio = new Audio(fullPath);
      audio.volume = volume;

      audio.onended = () => {
        resolve();
      };

      audio.onerror = (error) => {
        reject(error);
      };

      // 尝试播放音频
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // 音频开始播放
          })
          .catch((error) => {
            // 可能因用户未交互导致无法自动播放
            reject(error);
          });
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 使用离屏文档播放音频
 * @param soundPath 声音文件路径
 * @param volume 音量
 */
export const playWithOffscreenDocument = async (
  soundPath: string,
  volume: number = 1.0
): Promise<void> => {
  // 确保offscreen文档已创建
  await createOffscreenDocumentIfNeeded();

  // 发送消息到offscreen文档播放音频
  return new Promise<void>((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: "PLAY_SOUND",
        soundPath: getSoundPath(soundPath),
        volume,
      },
      (_response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      }
    );
  });
};

/**
 * 创建离屏文档（如果尚未创建）
 */
export const createOffscreenDocumentIfNeeded = async (): Promise<void> => {
  // 检查是否已存在离屏文档
  if (await hasOffscreenDocument()) {
    return;
  }

  // 创建新的离屏文档
  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["AUDIO_PLAYBACK"] as chrome.offscreen.Reason[],
    justification: "用于播放倒计时结束通知音效",
  });
};

/**
 * 检查离屏文档是否已存在
 */
export const hasOffscreenDocument = async (): Promise<boolean> => {
  // Chrome 116+支持getContexts API
  if ("getContexts" in chrome.runtime) {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"] as chrome.runtime.ContextType[],
      documentUrls: [chrome.runtime.getURL("offscreen.html")],
    });
    return contexts && contexts.length > 0;
  }
  // 兼容旧版本Chrome
  else {
    try {
      // 使用clients API (需要在service worker中)
      // @ts-ignore - TS可能不认识clients
      const allClients = await clients.matchAll();
      return allClients.some((client: any) =>
        client.url.includes(chrome.runtime.id + "/offscreen.html")
      );
    } catch (e) {
      // 如果不在service worker环境中，简单地尝试创建文档
      // 如果已存在，将会报错
      return false;
    }
  }
};

/**
 * 根据声音名称获取声音文件路径
 */
export const getSoundPath = (sound: string): string => {
  switch (sound) {
    case "bell":
      return SOUND_BELL;
    case "chime":
      return SOUND_CHIME;
    case "alarm":
      return SOUND_ALARM;
    case "default":
    default:
      return DEFAULT_NOTIFICATION_SOUND;
  }
};

// 声音文件路径定义
export const DEFAULT_NOTIFICATION_SOUND = "sounds/default.mp3";
export const SOUND_BELL = "sounds/bell.mp3";
export const SOUND_CHIME = "sounds/chime.mp3";
export const SOUND_ALARM = "sounds/alarm.mp3";
