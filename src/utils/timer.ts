/**
 * Convert milliseconds to total seconds
 */
export const millisecondsToSeconds = (milliseconds: number): number => {
  return Math.max(0, Math.floor(milliseconds / 1000));
};

/**
 * Calculate hours, minutes and seconds
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
 * Calculate total seconds
 */
export const calculateTotalSeconds = (
  hours: number,
  minutes: number,
  seconds: number
): number => {
  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Format countdown time as string
 */
export const formatTime = (milliseconds: number): string => {
  const totalSeconds = millisecondsToSeconds(milliseconds);
  const { hours, minutes, seconds } = calculateTimeUnits(totalSeconds);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Format time as string (for TimerItem component)
 */
export const formatTimerItem = (
  hours: number,
  minutes: number,
  seconds: number
): string => {
  const parts = [];

  if (hours > 0) {
    parts.push(`${hours} hr`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} min`);
  }

  if (seconds > 0 || (hours === 0 && minutes === 0)) {
    parts.push(`${seconds} sec`);
  }

  return parts.join(" ");
};

/**
 * Format timer time display (user-friendly format)
 */
export const formatTimerDisplay = (
  hours: number,
  minutes: number,
  seconds: number
): string => {
  const parts = [];

  if (hours > 0) {
    parts.push(`${hours} hr`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} min`);
  }

  if (seconds > 0 || (hours === 0 && minutes === 0)) {
    parts.push(`${seconds} sec`);
  }

  return parts.join(" ");
};

/**
 * Create countdown text for icon display
 * Optimized display format:
 * - Greater than 1 hour: show hour count, e.g. "1 h"
 * - Greater than 1 minute: show minute count, e.g. "1 m"
 * - Less than 1 minute: show seconds only, e.g. "59"
 */
export const createIconText = (milliseconds: number): string => {
  // Round to full seconds to match CountdownView behavior
  // This ensures icon and UI display the same value
  const totalSeconds = millisecondsToSeconds(milliseconds);
  const { hours, minutes, seconds } = calculateTimeUnits(totalSeconds);

  // If time is over 1 hour, only show hour count and 'h'
  if (hours > 0) {
    return `${hours}h`;
  }

  // If time is over 1 minute, only show minute count and 'm'
  if (minutes > 0) {
    return `${minutes}m`;
  }

  // If time is less than 1 minute, only show seconds
  return `${seconds}`;
};
