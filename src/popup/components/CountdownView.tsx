import React, { useEffect, useRef } from "react";

interface CountdownViewProps {
  remainingTime: number;
  onCancel: () => void;
  color?: string;
  totalTime?: number;
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((v) => v.toString().padStart(2, "0"))
    .join(":");
};

const CountdownView: React.FC<CountdownViewProps> = ({
  remainingTime,
  onCancel,
  color = "#3B82F6",
  totalTime,
}) => {
  const actualTotalTime = totalTime || remainingTime;
  const containerRef = useRef<HTMLDivElement>(null);

  const progressPercentage = Math.min(
    100,
    Math.max(0, (remainingTime / actualTotalTime) * 100)
  );

  // Dynamically adjust popup height
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        const height = containerRef.current.offsetHeight;
        document.documentElement.style.height = `${height}px`;
        document.body.style.height = `${height}px`;
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      // Reset height when component unmounts
      document.documentElement.style.height = "";
      document.body.style.height = "";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full p-4 items-center justify-center"
      tabIndex={0}
      aria-label="Countdown in progress"
      role="region"
    >
      <h2 className="font-medium text-base mb-1 text-gray-600">
        Counting down
      </h2>
      <div
        className="font-bold mb-4 text-5xl"
        style={{ color }}
        aria-live="polite"
      >
        {formatTime(remainingTime)}
      </div>
      <div
        className="rounded-full max-w-xs h-3 mb-4 w-full"
        style={{ backgroundColor: `${color}15` }}
      >
        <div
          className="rounded-full h-3 transition-all ease-linear duration-1000"
          style={{
            backgroundColor: color,
            width: `${progressPercentage}%`,
          }}
        ></div>
      </div>
      <button
        className="btn"
        onClick={onCancel}
        tabIndex={0}
        aria-label="Cancel countdown"
      >
        Cancel
      </button>
    </div>
  );
};

export default CountdownView;
