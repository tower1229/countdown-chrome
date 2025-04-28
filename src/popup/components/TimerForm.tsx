import React, { useState, useEffect } from "react";
import { CustomTimer, DEFAULT_COLORS, DEFAULT_SOUNDS } from "../../types";
import TimeInput from "./TimeInput";

interface TimerFormProps {
  timer: CustomTimer | null;
  onSave: (timer: CustomTimer) => void;
  onCancel: () => void;
  isCreatingNew: boolean;
}

const TimerForm: React.FC<TimerFormProps> = ({ timer, onSave, onCancel }) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [color, setColor] = useState<string>(DEFAULT_COLORS[0]);
  const [sound, setSound] = useState<string>(DEFAULT_SOUNDS[0]);

  useEffect(() => {
    if (timer) {
      setHours(timer.hours);
      setMinutes(timer.minutes);
      setSeconds(timer.seconds);
      setColor(timer.color);
      setSound(timer.sound);
    } else {
      setHours(0);
      setMinutes(0);
      setSeconds(0);
      setColor(DEFAULT_COLORS[0]);
      setSound(DEFAULT_SOUNDS[0]);
    }
  }, [timer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (hours === 0 && minutes === 0 && seconds === 0) {
      alert("请设置时间");
      return;
    }

    const newTimer: CustomTimer = {
      id: timer?.id || crypto.randomUUID(),
      hours,
      minutes,
      seconds,
      color,
      sound,
      order: timer?.order || Date.now(),
    };

    onSave(newTimer);
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label
            className="font-medium text-sm text-gray-700 w-20"
            htmlFor="hours-input"
          >
            小时:
          </label>
          <div className="flex gap-1 items-center">
            <button
              type="button"
              onClick={() => handleDecrement(setHours, hours)}
              className="rounded-l-md bg-gray-200 py-1 px-2 hover:bg-gray-300 focus:outline-none"
              aria-label="减少小时"
            >
              -
            </button>
            <TimeInput
              id="hours-input"
              value={hours}
              onChange={setHours}
              min={0}
              max={99}
              label=""
              ariaLabel="小时输入框，0到99"
            />
            <button
              type="button"
              onClick={() => handleIncrement(setHours, hours, 99)}
              className="rounded-r-md bg-gray-200 py-1 px-2 hover:bg-gray-300 focus:outline-none"
              aria-label="增加小时"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label
            className="font-medium text-sm text-gray-700 w-20"
            htmlFor="minutes-input"
          >
            分钟:
          </label>
          <div className="flex gap-1 items-center">
            <button
              type="button"
              onClick={() => handleDecrement(setMinutes, minutes)}
              className="rounded-l-md bg-gray-200 py-1 px-2 hover:bg-gray-300 focus:outline-none"
              aria-label="减少分钟"
            >
              -
            </button>
            <TimeInput
              id="minutes-input"
              value={minutes}
              onChange={setMinutes}
              min={0}
              max={59}
              label=""
              ariaLabel="分钟输入框，0到59"
            />
            <button
              type="button"
              onClick={() => handleIncrement(setMinutes, minutes, 59)}
              className="rounded-r-md bg-gray-200 py-1 px-2 hover:bg-gray-300 focus:outline-none"
              aria-label="增加分钟"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label
            className="font-medium text-sm text-gray-700 w-20"
            htmlFor="seconds-input"
          >
            秒数:
          </label>
          <div className="flex gap-1 items-center">
            <button
              type="button"
              onClick={() => handleDecrement(setSeconds, seconds)}
              className="rounded-l-md bg-gray-200 py-1 px-2 hover:bg-gray-300 focus:outline-none"
              aria-label="减少秒数"
            >
              -
            </button>
            <TimeInput
              id="seconds-input"
              value={seconds}
              onChange={setSeconds}
              min={0}
              max={59}
              label=""
              ariaLabel="秒数输入框，0到59"
            />
            <button
              type="button"
              onClick={() => handleIncrement(setSeconds, seconds, 59)}
              className="rounded-r-md bg-gray-200 py-1 px-2 hover:bg-gray-300 focus:outline-none"
              aria-label="增加秒数"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="font-medium text-sm mb-1 text-gray-700 block">
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
        <label className="font-medium text-sm mb-1 text-gray-700 block">
          声音
        </label>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_SOUNDS.map((soundOption) => (
            <button
              key={soundOption}
              type="button"
              onClick={() => setSound(soundOption)}
              className={`px-3 py-1 rounded focus:outline-none border ${
                sound === soundOption
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
              aria-label={`声音: ${soundOption}`}
            >
              {soundOption.replace(".mp3", "")}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">
          保存
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          取消
        </button>
      </div>
    </form>
  );
};

export default TimerForm;
