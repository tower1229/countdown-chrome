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
  const { name, hours, minutes, seconds, color } = timer;
  const duration = formatTimerItem(hours, minutes, seconds);

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border-2 shadow-sm transition-all ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      style={{
        borderColor: color || "#3b82f6",
        backgroundColor: `${color}10` || "#3b82f680",
      }}
    >
      <div className="cursor-grab flex flex-1 items-center">
        <div className="mr-3 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="8" cy="8" r="1" />
            <circle cx="8" cy="16" r="1" />
            <circle cx="16" cy="8" r="1" />
            <circle cx="16" cy="16" r="1" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="font-medium">{name}</div>
          <div className="text-sm text-gray-500">{duration}</div>
        </div>
      </div>
      <div className="flex space-x-2 items-center">
        <button
          onClick={() => onStart(timer)}
          className="rounded-full p-2 text-green-600 hover:bg-green-100"
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
          className="rounded-full p-2 text-blue-600 hover:bg-blue-100"
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
          className="rounded-full p-2 text-red-600 hover:bg-red-100"
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
