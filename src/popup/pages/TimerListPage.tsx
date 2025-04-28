import React from "react";
import { CustomTimer } from "../../types";
import TimerList from "../components/TimerList";

interface TimerListPageProps {
  timers: CustomTimer[];
  onCreateTimer: () => void;
  onStartTimer: (timer: CustomTimer) => void;
  onEditTimer: (timer: CustomTimer) => void;
  onDeleteTimer: (id: string) => void;
  onReorderTimers: (newOrder: CustomTimer[]) => void;
  isRunning: boolean;
  onCancel: () => void;
  remainingTime: number;
}

const TimerListPage: React.FC<TimerListPageProps> = ({
  timers,
  onCreateTimer,
  onStartTimer,
  onEditTimer,
  onDeleteTimer,
  onReorderTimers,
  isRunning,
  onCancel,
  remainingTime,
}) => {
  // 按照order字段排序定时器
  const sortedTimers = [...timers].sort((a, b) => a.order - b.order);

  // 格式化剩余时间
  const formatRemainingTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-center">Tab Countdown Timer</h1>
        <button
          onClick={onCreateTimer}
          className="p-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="新建定时器"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isRunning && (
        <div className="bg-blue-50 p-3 rounded-md mb-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-blue-600 font-medium">正在计时:</div>
              <div className="text-lg font-bold">
                {formatRemainingTime(remainingTime)}
              </div>
            </div>
            <button
              onClick={onCancel}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="取消计时"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <TimerList
          timers={sortedTimers}
          onStartTimer={onStartTimer}
          onEditTimer={onEditTimer}
          onDeleteTimer={onDeleteTimer}
          onReorderTimers={onReorderTimers}
        />
      </div>
    </div>
  );
};

export default TimerListPage;
