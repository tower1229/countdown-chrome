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
  // TODO: 这里可集成 context 或 props 获取剩余时间和取消方法
  // 这里只做静态展示，后续可集成实际倒计时逻辑
  return (
    <div
      className="flex flex-col items-center justify-center h-full bg-white p-4 w-80"
      tabIndex={0}
      aria-label="倒计时进行中"
      role="region"
    >
      <span className="text-4xl font-bold text-primary mb-4" aria-live="polite">
        {formatTime(remainingTime)}
      </span>
      <button
        className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 focus:outline-none"
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
