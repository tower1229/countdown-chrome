import React from "react";

interface CountdownViewProps {
  remainingTime: number;
  onCancel: () => void;
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
}) => {
  return (
    <div
      className="flex flex-col w-full p-6 items-center justify-center"
      tabIndex={0}
      aria-label="倒计时进行中"
      role="region"
    >
      <h2 className="font-medium text-lg mb-2 text-gray-600">正在倒计时</h2>
      <div className="font-bold mb-8 text-5xl text-blue-600" aria-live="polite">
        {formatTime(remainingTime)}
      </div>
      <div className="rounded-full max-w-xs bg-blue-100 h-4 mb-8 w-full">
        <div
          className="rounded-full bg-blue-500 h-4 transition-all ease-linear duration-1000"
          style={{
            width: `${
              (remainingTime / (Math.ceil(remainingTime / 1000) * 1000)) * 100
            }%`,
          }}
        ></div>
      </div>
      <button
        className="btn btn-error"
        onClick={onCancel}
        tabIndex={0}
        aria-label="取消倒计时"
      >
        取消
      </button>
    </div>
  );
};

export default CountdownView;
