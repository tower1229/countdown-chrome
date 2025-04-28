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
 * 格式化时间为字符串 (用于TimerItem组件)
 */
export const formatTimerItem = (
  hours: number,
  minutes: number,
  seconds: number
): string => {
  const parts = [];

  if (hours > 0) {
    parts.push(`${hours}小时`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}分钟`);
  }

  if (seconds > 0 || (hours === 0 && minutes === 0)) {
    parts.push(`${seconds}秒`);
  }

  return parts.join(" ");
};

/**
 * 格式化定时器时间显示 (比较友好的格式)
 */
export const formatTimerDisplay = (
  hours: number,
  minutes: number,
  seconds: number
): string => {
  const parts = [];

  if (hours > 0) {
    parts.push(`${hours}小时`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}分钟`);
  }

  if (seconds > 0 || (hours === 0 && minutes === 0)) {
    parts.push(`${seconds}秒`);
  }

  return parts.join(" ");
};

/**
 * 创建图标显示的倒计时文本
 * 优化显示格式：
 * - 大于1小时: 显示小时数，例如 "1 h"
 * - 大于1分钟: 显示分钟数，例如 "1 m"
 * - 小于1分钟: 只显示秒数，例如 "59"
 */
export const createIconText = (milliseconds: number): string => {
  const totalSeconds = millisecondsToSeconds(milliseconds);
  const { hours, minutes, seconds } = calculateTimeUnits(totalSeconds);

  // 如果时间超过1小时，只显示小时数和h
  if (hours > 0) {
    return `${hours}h`;
  }

  // 如果时间超过1分钟，只显示分钟数和m
  if (minutes > 0) {
    return `${minutes}m`;
  }

  // 如果时间小于1分钟，只显示秒数
  return `${seconds}`;
};
