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
  isCountingDown: boolean;
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
  isCountingDown,
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
    <div className="timer-list-container">
      <div className="flex mb-6 justify-between items-center">
        <h1 className="page-title">New Countdown Timer</h1>
        <button
          onClick={onCreateTimer}
          className="btn btn-sm btn-square btn-primary"
          aria-label="新建定时器"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
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

      {isCountingDown && (
        <div className="rounded-lg bg-blue-50 shadow-sm mb-4 p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-sm text-blue-600">正在计时:</div>
              <div className="font-bold text-lg">
                {formatRemainingTime(remainingTime)}
              </div>
            </div>
            <button
              onClick={onCancel}
              className="bg-red-500 btn btn-primary hover:bg-red-600"
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
