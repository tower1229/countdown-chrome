export interface TimerState {
  isRunning: boolean;
  endTime: number;
  totalSeconds: number;
}

export interface TimerSettings {
  hours: number;
  minutes: number;
  seconds: number;
}
