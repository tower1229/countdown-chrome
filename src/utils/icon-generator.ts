/**
 * 生成倒计时图标
 */
export const generateTimerIcon = (text: string): Promise<ImageData> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("无法获取canvas上下文");
    }

    // 清空画布
    context.clearRect(0, 0, 128, 128);

    // 绘制圆形背景
    context.fillStyle = "#2563EB"; // 蓝色背景
    context.beginPath();
    context.arc(64, 64, 64, 0, Math.PI * 2);
    context.fill();

    // 绘制文本
    context.fillStyle = "#FFFFFF"; // 白色文本
    context.textAlign = "center";
    context.textBaseline = "middle";

    // 根据文本长度调整字号
    const fontSize = text.length > 4 ? 32 : 48;
    context.font = `bold ${fontSize}px Arial`;
    context.fillText(text, 64, 64);

    // 转换为ImageData
    resolve(context.getImageData(0, 0, 128, 128));
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
  }
};
