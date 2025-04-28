export interface TimerState {
  isCountingDown: boolean;
  endTime: number;
  totalSeconds: number;
  currentTimerId?: string; // Reference to the current running timer ID
  sound?: string; // Sound to play when timer completes
}

export interface TimerSettings {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface CustomTimer {
  id: string;
  hours: number;
  minutes: number;
  seconds: number;
  color: string;
  sound: string;
  order: number;
}

export type Route = "timer-list" | "timer-edit";

export interface AppState {
  route: Route;
  editingTimer: CustomTimer | null;
  isCreatingNew: boolean;
}

export const DEFAULT_COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#6B7280", // Gray
  "#F97316", // Orange
];

export const DEFAULT_SOUNDS = ["default", "bell", "chime", "alarm"];
