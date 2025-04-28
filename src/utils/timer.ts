/**
 * 从毫秒转换为总秒数
 */
export const millisecondsToSeconds = (milliseconds: number): number => {
  return Math.max(0, Math.floor(milliseconds / 1000));
};

/**
 * 计算小时、分钟和秒
 */
export const calculateTimeUnits = (
  totalSeconds: number
): {
  hours: number;
  minutes: number;
  seconds: number;
} => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds };
};

/**
 * 计算总秒数
 */
export const calculateTotalSeconds = (
  hours: number,
  minutes: number,
  seconds: number
): number => {
  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * 格式化倒计时时间为字符串
 */
export const formatTime = (milliseconds: number): string => {
  const totalSeconds = millisecondsToSeconds(milliseconds);
  const { hours, minutes, seconds } = calculateTimeUnits(totalSeconds);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * 创建图标显示的倒计时文本
 */
export const createIconText = (milliseconds: number): string => {
  const totalSeconds = millisecondsToSeconds(milliseconds);

  // 如果时间超过1小时，显示小时:分钟
  if (totalSeconds >= 3600) {
    const { hours, minutes } = calculateTimeUnits(totalSeconds);
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  }

  // 如果时间小于1小时，显示分钟:秒
  const { minutes, seconds } = calculateTimeUnits(totalSeconds);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
