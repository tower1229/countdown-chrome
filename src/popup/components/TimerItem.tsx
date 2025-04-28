import React from "react";
import { CustomTimer } from "../../types";
import { formatTimerItem } from "../../utils/timer";

interface TimerItemProps {
  timer: CustomTimer;
  onStart: (timer: CustomTimer) => void;
  onEdit: (timer: CustomTimer) => void;
  onDelete: (id: string) => void;
  index: number;
  isDragging: boolean;
}

const TimerItem: React.FC<TimerItemProps> = ({
  timer,
  onStart,
  onEdit,
  onDelete,
  isDragging,
}) => {
  const { hours, minutes, seconds, color } = timer;
  const duration = formatTimerItem(hours, minutes, seconds);

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border shadow-sm transition-all ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      style={{
        borderColor: color || "#3b82f6",
        backgroundColor: `${color}15` || "#3b82f610",
      }}
    >
      <div className="cursor-grab flex flex-1 items-center">
        <div className="mr-3 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="grip-icon"
          >
            <circle cx="8" cy="8" r="1" />
            <circle cx="8" cy="16" r="1" />
            <circle cx="16" cy="8" r="1" />
            <circle cx="16" cy="16" r="1" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="font-medium text-base" style={{ color }}>
            {duration}
          </div>
        </div>
      </div>
      <div className="flex space-x-3 items-center">
        <button
          onClick={() => onStart(timer)}
          className="rounded-full text-success p-2.5 transition-colors hover:bg-green-100"
          aria-label="启动定时器"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>
        <button
          onClick={() => onEdit(timer)}
          className="rounded-full text-info p-2.5 transition-colors hover:bg-blue-100"
          aria-label="编辑定时器"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </button>
        <button
          onClick={() => onDelete(timer.id)}
          className="rounded-full text-error p-2.5 transition-colors hover:bg-red-100"
          aria-label="删除定时器"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TimerItem;
