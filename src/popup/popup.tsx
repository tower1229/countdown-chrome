import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom/client";
import "../utils/index.css";
import { TimerState } from "../types";

const Popup: React.FC = () => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 获取当前倒计时状态
    chrome.storage.local.get(["timerState"], (result) => {
      const state = result.timerState as TimerState | undefined;
      if (state && state.isRunning) {
        setIsRunning(true);
        setRemainingTime(state.endTime - Date.now());
      } else {
        // 加载上次设置的时间
        chrome.storage.local.get(["lastSettings"], (result) => {
          const settings = result.lastSettings;
          if (settings) {
            setHours(settings.hours || 0);
            setMinutes(settings.minutes || 0);
            setSeconds(settings.seconds || 0);
          }
          setIsLoading(false);
        });
      }
      setIsLoading(false);
    });

    // 监听状态变化
    const handleMessage = (message: any) => {
      if (message.type === "TIMER_UPDATE") {
        setRemainingTime(message.remainingTime);
      } else if (
        message.type === "TIMER_COMPLETED" ||
        message.type === "TIMER_CANCELLED"
      ) {
        setIsRunning(false);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  // 更新显示的剩余时间
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        chrome.storage.local.get(["timerState"], (result) => {
          const state = result.timerState as TimerState | undefined;
          if (state && state.isRunning) {
            setRemainingTime(state.endTime - Date.now());
          } else {
            setIsRunning(false);
            clearInterval(interval);
          }
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning]);

  const handleStart = useCallback(() => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds <= 0) return;

    const endTime = Date.now() + totalSeconds * 1000;

    // 保存上次设置
    chrome.storage.local.set({
      lastSettings: { hours, minutes, seconds },
    });

    // 发送消息给后台开始计时
    chrome.runtime.sendMessage({
      type: "START_TIMER",
      totalSeconds,
      endTime,
    });

    setIsRunning(true);
    setRemainingTime(totalSeconds * 1000);
  }, [hours, minutes, seconds]);

  const handleCancel = useCallback(() => {
    chrome.runtime.sendMessage({ type: "CANCEL_TIMER" });
    setIsRunning(false);
  }, []);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const value = parseInt(e.target.value) || 0;
    setter(Math.max(0, value));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!isRunning) {
        handleStart();
      } else {
        handleCancel();
      }
    }
  };

  // 增加和减少输入值的处理函数
  const handleIncrement = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    currentValue: number,
    max: number = Infinity
  ) => {
    setter(Math.min(max, currentValue + 1));
  };

  const handleDecrement = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    currentValue: number
  ) => {
    setter(Math.max(0, currentValue - 1));
  };

  if (isLoading) {
    return (
      <div className="w-64 p-4 bg-white flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 p-4 bg-white" onKeyDown={handleKeyDown} tabIndex={0}>
      <h1 className="text-xl font-bold mb-4 text-center">
        Tab Countdown Timer
      </h1>

      {!isRunning ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="hours-input" className="w-20">
              Hours:
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleDecrement(setHours, hours)}
                className="px-2 py-1 bg-gray-200 rounded-l-sm hover:bg-gray-300 focus:outline-none"
                aria-label="减少小时"
              >
                -
              </button>
              <input
                id="hours-input"
                type="number"
                min="0"
                value={hours}
                onChange={(e) => handleInputChange(e, setHours)}
                className="w-12 p-1 border text-center"
                aria-label="小时"
              />
              <button
                type="button"
                onClick={() => handleIncrement(setHours, hours)}
                className="px-2 py-1 bg-gray-200 rounded-r-sm hover:bg-gray-300 focus:outline-none"
                aria-label="增加小时"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="minutes-input" className="w-20">
              Minutes:
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleDecrement(setMinutes, minutes)}
                className="px-2 py-1 bg-gray-200 rounded-l-sm hover:bg-gray-300 focus:outline-none"
                aria-label="减少分钟"
              >
                -
              </button>
              <input
                id="minutes-input"
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => handleInputChange(e, setMinutes)}
                className="w-12 p-1 border text-center"
                aria-label="分钟"
              />
              <button
                type="button"
                onClick={() => handleIncrement(setMinutes, minutes, 59)}
                className="px-2 py-1 bg-gray-200 rounded-r-sm hover:bg-gray-300 focus:outline-none"
                aria-label="增加分钟"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="seconds-input" className="w-20">
              Seconds:
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleDecrement(setSeconds, seconds)}
                className="px-2 py-1 bg-gray-200 rounded-l-sm hover:bg-gray-300 focus:outline-none"
                aria-label="减少秒数"
              >
                -
              </button>
              <input
                id="seconds-input"
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => handleInputChange(e, setSeconds)}
                className="w-12 p-1 border text-center"
                aria-label="秒数"
              />
              <button
                type="button"
                onClick={() => handleIncrement(setSeconds, seconds, 59)}
                className="px-2 py-1 bg-gray-200 rounded-r-sm hover:bg-gray-300 focus:outline-none"
                aria-label="增加秒数"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full p-2 mt-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="开始倒计时"
          >
            Start Countdown
          </button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-2xl font-bold">{formatTime(remainingTime)}</p>
          <button
            onClick={handleCancel}
            className="w-full p-2 bg-red-500 text-white rounded-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label="取消倒计时"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
