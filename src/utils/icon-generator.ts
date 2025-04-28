/**
 * 生成倒计时图标（Service Worker 兼容版本）
 */
export const generateTimerIcon = (
  text: string
): Promise<{ [key: number]: ImageData }> => {
  return new Promise((resolve) => {
    // Service Worker中不能使用DOM API，需要使用OffscreenCanvas
    const createImageData = (size: number): ImageData => {
      // 创建适合Service Worker的画布
      const canvas = new OffscreenCanvas(size, size);
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("无法获取canvas上下文");
      }

      // 清空画布
      context.clearRect(0, 0, size, size);

      // 绘制圆形背景
      context.fillStyle = "#2563EB"; // 蓝色背景
      context.beginPath();
      context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      context.fill();

      // 优化文本显示
      context.fillStyle = "#FFFFFF"; // 白色文本
      context.textAlign = "center";
      context.textBaseline = "middle";

      // 根据文本长度和图标大小调整字号，为不同长度的文本精确优化
      let fontSize;
      if (text.length === 1) {
        // 单个数字，使用最大字体
        fontSize = Math.floor(size * 0.85);
      } else if (text.length === 2) {
        // 两位数字，如"59"、"20"等
        fontSize = Math.floor(size * 0.75);
      } else if (text.length === 3) {
        // 三位数字或带单位的短文本，如"5m"、"2h"
        fontSize = Math.floor(size * 0.55);
      } else {
        // 更长的文本
        fontSize = Math.floor(size * 0.45);
      }

      context.font = `bold ${fontSize}px Arial`;

      // 精确计算文本的垂直位置
      const verticalOffset = size * 0.02;
      context.fillText(text, size / 2, size / 2 + verticalOffset);

      // 转换为ImageData
      return context.getImageData(0, 0, size, size);
    };

    // 创建不同尺寸的图标
    const iconData: { [key: number]: ImageData } = {};
    [16, 32, 48, 128].forEach((size) => {
      iconData[size] = createImageData(size);
    });

    resolve(iconData);
  });
};

/**
 * 设置扩展图标
 */
export const setExtensionIcon = async (text: string): Promise<void> => {
  try {
    const imageData = await generateTimerIcon(text);

    // 设置图标
    chrome.action.setIcon({ imageData });
  } catch (error) {
    console.error("设置图标失败:", error);
    // 错误处理：使用简单的文本徽章显示时间
    try {
      chrome.action.setBadgeText({ text });
      chrome.action.setBadgeBackgroundColor({ color: "#2563EB" });
    } catch (badgeError) {
      console.error("设置徽章失败:", badgeError);
    }
  }
};

/**
 * 恢复默认图标
 */
export const restoreDefaultIcon = async (): Promise<void> => {
  try {
    // 清除所有自定义图标和徽章
    await chrome.action.setIcon({
      path: {
        "16": "/icons/icon16.png",
        "48": "/icons/icon48.png",
        "128": "/icons/icon128.png",
      },
    });

    // 确保徽章也被清除
    await chrome.action.setBadgeText({ text: "" });
  } catch (error) {
    console.error("恢复默认图标失败:", error);
  }
};
