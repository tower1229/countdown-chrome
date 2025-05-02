import React from "react";
import { CustomTimer } from "../../types";
import TimerList from "../components/TimerList";
import ChromeLayout from "../components/ChromeLayout";

interface TimerListPageProps {
  timers: CustomTimer[];
  onCreateTimer: () => void;
  onStartTimer: (timer: CustomTimer) => void;
  onEditTimer: (timer: CustomTimer) => void;
  onDeleteTimer: (id: string) => void;
  onReorderTimers: (newOrder: CustomTimer[]) => void;
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
}) => {
  // Sort timers by the order field
  const sortedTimers = [...timers].sort((a, b) => a.order - b.order);

  const addButton = (
    <button
      onClick={onCreateTimer}
      className="chrome-button-primary rounded-full w-8 h-8 flex items-center justify-center"
      aria-label="Create new timer"
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
  );

  return (
    <ChromeLayout title="Countdown Timer" rightAction={addButton}>
      <div className="mt-4">
        <TimerList
          timers={sortedTimers}
          onStartTimer={onStartTimer}
          onEditTimer={onEditTimer}
          onDeleteTimer={onDeleteTimer}
          onReorderTimers={onReorderTimers}
        />
      </div>
    </ChromeLayout>
  );
};

export default TimerListPage;
