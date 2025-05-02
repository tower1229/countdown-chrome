import React, { useEffect, useRef } from "react";
import ChromeLayout from "./ChromeLayout";

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
  color = "var(--chrome-blue)",
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
    <ChromeLayout title="Countdown in Progress">
      <div
        ref={containerRef}
        className="flex flex-col items-center justify-center py-6 w-full"
        tabIndex={0}
        aria-label="Countdown in progress"
        role="region"
      >
        <div
          className="font-bold mb-6 text-4xl"
          style={{ color }}
          aria-live="polite"
        >
          {formatTime(remainingTime)}
        </div>

        <div
          className="rounded-full h-2 mb-8 w-full max-w-full"
          style={{ backgroundColor: "#e8f0fe" }}
        >
          <div
            className="rounded-full h-2 transition-all ease-linear duration-1000"
            style={{
              backgroundColor: color,
              width: `${progressPercentage}%`,
            }}
          ></div>
        </div>

        <button
          className="chrome-button chrome-button-outline"
          onClick={onCancel}
          tabIndex={0}
          aria-label="Cancel countdown"
        >
          Cancel
        </button>
      </div>
    </ChromeLayout>
  );
};

export default CountdownView;
