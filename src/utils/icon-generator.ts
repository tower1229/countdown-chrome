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

      // 绘制文本
      context.fillStyle = "#FFFFFF"; // 白色文本
      context.textAlign = "center";
      context.textBaseline = "middle";

      // 根据文本长度和图标大小调整字号
      const fontSize =
        text.length > 4 ? Math.floor(size / 4) : Math.floor(size / 2.5);
      context.font = `bold ${fontSize}px Arial`;
      context.fillText(text, size / 2, size / 2);

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
