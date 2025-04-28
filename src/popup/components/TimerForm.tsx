import React, { useState, useEffect } from "react";
import { CustomTimer, DEFAULT_COLORS, DEFAULT_SOUNDS } from "../../types";

interface TimerFormProps {
  timer: CustomTimer | null;
  onSave: (timer: CustomTimer) => void;
  onCancel: () => void;
  isCreatingNew: boolean;
}

const TimerForm: React.FC<TimerFormProps> = ({
  timer,
  onSave,
  onCancel,
  isCreatingNew,
}) => {
  const [name, setName] = useState<string>("");
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [color, setColor] = useState<string>(DEFAULT_COLORS[0]);
  const [sound, setSound] = useState<string>(DEFAULT_SOUNDS[0]);

  useEffect(() => {
    if (timer) {
      setName(timer.name);
      setHours(timer.hours);
      setMinutes(timer.minutes);
      setSeconds(timer.seconds);
      setColor(timer.color);
      setSound(timer.sound);
    } else {
      setName("");
      setHours(0);
      setMinutes(0);
      setSeconds(0);
      setColor(DEFAULT_COLORS[0]);
      setSound(DEFAULT_SOUNDS[0]);
    }
  }, [timer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim() === "") {
      alert("请输入定时器名称");
      return;
    }

    if (hours === 0 && minutes === 0 && seconds === 0) {
      alert("请设置时间");
      return;
    }

    const newTimer: CustomTimer = {
      id: timer?.id || crypto.randomUUID(),
      name,
      hours,
      minutes,
      seconds,
      color,
      sound,
      order: timer?.order || Date.now(),
    };

    onSave(newTimer);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const value = parseInt(e.target.value) || 0;
    setter(Math.max(0, value));
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <label
          htmlFor="timer-name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          名称
        </label>
        <input
          id="timer-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="输入定时器名称"
          aria-label="定时器名称"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label
            htmlFor="hours-input"
            className="w-20 text-sm font-medium text-gray-700"
          >
            小时:
          </label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleDecrement(setHours, hours)}
              className="px-2 py-1 bg-gray-200 rounded-l-md hover:bg-gray-300 focus:outline-none"
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
              className="w-12 p-1 border text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label="小时"
            />
            <button
              type="button"
              onClick={() => handleIncrement(setHours, hours)}
              className="px-2 py-1 bg-gray-200 rounded-r-md hover:bg-gray-300 focus:outline-none"
              aria-label="增加小时"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label
            htmlFor="minutes-input"
            className="w-20 text-sm font-medium text-gray-700"
          >
            分钟:
          </label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleDecrement(setMinutes, minutes)}
              className="px-2 py-1 bg-gray-200 rounded-l-md hover:bg-gray-300 focus:outline-none"
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
              className="w-12 p-1 border text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label="分钟"
            />
            <button
              type="button"
              onClick={() => handleIncrement(setMinutes, minutes, 59)}
              className="px-2 py-1 bg-gray-200 rounded-r-md hover:bg-gray-300 focus:outline-none"
              aria-label="增加分钟"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label
            htmlFor="seconds-input"
            className="w-20 text-sm font-medium text-gray-700"
          >
            秒数:
          </label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleDecrement(setSeconds, seconds)}
              className="px-2 py-1 bg-gray-200 rounded-l-md hover:bg-gray-300 focus:outline-none"
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
              className="w-12 p-1 border text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label="秒数"
            />
            <button
              type="button"
              onClick={() => handleIncrement(setSeconds, seconds, 59)}
              className="px-2 py-1 bg-gray-200 rounded-r-md hover:bg-gray-300 focus:outline-none"
              aria-label="增加秒数"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          颜色
        </label>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_COLORS.map((colorOption) => (
            <button
              key={colorOption}
              type="button"
              onClick={() => setColor(colorOption)}
              className={`w-6 h-6 rounded-full focus:outline-none ${
                color === colorOption
                  ? "ring-2 ring-offset-2 ring-gray-400"
                  : ""
              }`}
              style={{ backgroundColor: colorOption }}
              aria-label={`颜色: ${colorOption}`}
            />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="sound-select"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          提醒声音
        </label>
        <select
          id="sound-select"
          value={sound}
          onChange={(e) => setSound(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="提醒声音"
        >
          {DEFAULT_SOUNDS.map((soundOption) => (
            <option key={soundOption} value={soundOption}>
              {soundOption.charAt(0).toUpperCase() + soundOption.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          aria-label="取消"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="保存"
        >
          {isCreatingNew ? "创建" : "保存"}
        </button>
      </div>
    </form>
  );
};

export default TimerForm;
