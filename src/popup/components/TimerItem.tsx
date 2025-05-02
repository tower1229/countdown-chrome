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
        backgroundColor: "var(--chrome-bg-color)",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      }}
    >
      <div className="cursor-grab flex flex-1 items-center overflow-hidden">
        <div className="mr-3 flex-shrink-0">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center opacity-70"
            style={{ backgroundColor: color }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
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
      <div className="flex space-x-2 items-center flex-shrink-0">
        <button
          onClick={() => onStart(timer)}
          className="text-base flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Start timer"
          style={{ color: "var(--chrome-green)" }}
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
          className="text-sm py-1 px-4 rounded-full border border-var(--chrome-blue) cursor-pointer"
          aria-label="Edit timer"
          style={{
            color: "var(--chrome-blue)",
          }}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(timer.id)}
          className="text-sm py-1 px-4 rounded-full border border-var(--chrome-red) cursor-pointer"
          aria-label="Delete timer"
          style={{
            color: "var(--chrome-red)",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TimerItem;
