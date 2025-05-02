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
      className={`flex items-center justify-between p-3 rounded-lg border transition-all w-full ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      style={{
        borderColor: "var(--chrome-border-color)",
        backgroundColor: color ? `${color}10` : "var(--chrome-bg-color)",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      }}
    >
      <div className="cursor-grab flex flex-1 items-center overflow-hidden">
        <div className="mr-3 text-gray-400 flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="grip-icon"
            style={{ color: "var(--chrome-secondary-text-color)" }}
          >
            <circle cx="8" cy="8" r="1" />
            <circle cx="8" cy="16" r="1" />
            <circle cx="16" cy="8" r="1" />
            <circle cx="16" cy="16" r="1" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="font-medium text-sm truncate"
            style={{ color: "var(--chrome-text-color)" }}
          >
            {duration}
          </div>
        </div>
      </div>
      <div className="flex space-x-1 items-center flex-shrink-0">
        <button
          onClick={() => onStart(timer)}
          className="rounded-full p-2 transition-colors hover:bg-gray-100"
          aria-label="Start timer"
          style={{ color: "var(--chrome-green)" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
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
          className="rounded-full p-2 transition-colors hover:bg-gray-100"
          aria-label="Edit timer"
          style={{ color: "var(--chrome-blue)" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
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
          className="rounded-full p-2 transition-colors hover:bg-gray-100"
          aria-label="Delete timer"
          style={{ color: "var(--chrome-red)" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
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
