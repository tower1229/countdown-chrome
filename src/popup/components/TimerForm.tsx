import React, { useState, useEffect } from "react";
import { CustomTimer, DEFAULT_COLORS, DEFAULT_SOUNDS } from "../../types";
import TimeInput from "./TimeInput";
import { playNotificationSound } from "../../utils/audio";

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
      alert("Please set a time");
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

  // Functions to increase and decrease input values
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

  // Preview sound
  const handlePreviewSound = (soundName: string) => {
    playNotificationSound(soundName);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center">
          <label
            className="font-medium flex-1 text-base text-gray-700 w-20"
            htmlFor="hours-input"
          >
            Hours:
          </label>
          <div className="join">
            <button
              type="button"
              onClick={() => handleDecrement(setHours, hours)}
              className="btn btn-square join-item"
              aria-label="Decrease hours"
            >
              −
            </button>
            <TimeInput
              id="hours-input"
              value={hours}
              onChange={setHours}
              min={0}
              max={99}
              label=""
              ariaLabel="Hours input, 0 to 99"
              className="join-item"
            />
            <button
              type="button"
              onClick={() => handleIncrement(setHours, hours, 99)}
              className="btn btn-square join-item"
              aria-label="Increase hours"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <label
            className="font-medium flex-1 text-base text-gray-700 w-20"
            htmlFor="minutes-input"
          >
            Minutes:
          </label>
          <div className="join">
            <button
              type="button"
              onClick={() => handleDecrement(setMinutes, minutes)}
              className="btn btn-square join-item"
              aria-label="Decrease minutes"
            >
              −
            </button>
            <TimeInput
              id="minutes-input"
              value={minutes}
              onChange={setMinutes}
              min={0}
              max={59}
              label=""
              ariaLabel="Minutes input, 0 to 59"
              className="join-item"
            />
            <button
              type="button"
              onClick={() => handleIncrement(setMinutes, minutes, 59)}
              className="btn btn-square join-item"
              aria-label="Increase minutes"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <label
            className="font-medium flex-1 text-base text-gray-700 w-20"
            htmlFor="seconds-input"
          >
            Seconds:
          </label>
          <div className="join">
            <button
              type="button"
              onClick={() => handleDecrement(setSeconds, seconds)}
              className="btn btn-square join-item"
              aria-label="Decrease seconds"
            >
              −
            </button>
            <TimeInput
              id="seconds-input"
              value={seconds}
              onChange={setSeconds}
              min={0}
              max={59}
              label=""
              ariaLabel="Seconds input, 0 to 59"
              className="join-item"
            />
            <button
              type="button"
              onClick={() => handleIncrement(setSeconds, seconds, 59)}
              className="btn btn-square join-item"
              aria-label="Increase seconds"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="font-medium text-sm mb-2 text-gray-700 block">
          Color
        </label>
        <div className="flex flex-nowrap mt-2 gap-2">
          {DEFAULT_COLORS.map((colorOption) => (
            <button
              key={colorOption}
              type="button"
              onClick={() => setColor(colorOption)}
              className={`btn btn-circle btn-sm ${
                color === colorOption ? "ring ring-offset-2" : "btn-ghost"
              }`}
              style={{ backgroundColor: colorOption }}
              aria-label={`Color: ${colorOption}`}
            />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="font-medium text-sm mb-2 text-gray-700 block">
          Sound
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {DEFAULT_SOUNDS.map((soundOption) => (
            <div key={soundOption} className="join">
              <button
                type="button"
                onClick={() => setSound(soundOption)}
                className={`btn btn-sm join-item ${
                  sound === soundOption ? "btn-primary" : "btn-outline"
                }`}
                aria-label={`Sound: ${soundOption}`}
              >
                {soundOption.split(".")[0]}
              </button>
              <button
                type="button"
                onClick={() => handlePreviewSound(soundOption)}
                className={`btn btn-sm join-item ${
                  sound === soundOption ? "btn-primary" : "btn-outline"
                }`}
                aria-label={`Preview: ${soundOption}`}
                title="Preview sound"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z"
                    clipRule="evenodd"
                  />
                  <path d="M14.243 5.757a1 1 0 10-1.414 1.414 4 4 0 010 5.657 1 1 0 001.414 1.414 6 6 0 000-8.485z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-4 justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-block btn-outline flex-1"
          aria-label="Cancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-block btn-primary flex-1"
          aria-label="Save"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default TimerForm;
