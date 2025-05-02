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
    <form onSubmit={handleSubmit} className="space-y-2 w-full">
      <div className=" flex flex-col  space-y-4 chrome-border-bottom py-4">
        <div className="flex items-center">
          <div className="chrome-item-text flex-1">
            <label className="chrome-item-title" htmlFor="hours-input">
              Hours
            </label>
          </div>
          <div className="chrome-number-input w-[180px]">
            <button
              type="button"
              onClick={() => handleDecrement(setHours, hours)}
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
              className=""
            />
            <button
              type="button"
              onClick={() => handleIncrement(setHours, hours, 99)}
              aria-label="Increase hours"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <div className="chrome-item-text flex-1">
            <label className="chrome-item-title" htmlFor="minutes-input">
              Minutes
            </label>
          </div>
          <div className="chrome-number-input w-[180px]">
            <button
              type="button"
              onClick={() => handleDecrement(setMinutes, minutes)}
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
              className=""
            />
            <button
              type="button"
              onClick={() => handleIncrement(setMinutes, minutes, 59)}
              aria-label="Increase minutes"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <div className="chrome-item-text flex-1">
            <label className="chrome-item-title" htmlFor="seconds-input">
              Seconds
            </label>
          </div>
          <div className="chrome-number-input w-[180px]">
            <button
              type="button"
              onClick={() => handleDecrement(setSeconds, seconds)}
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
              className=""
            />
            <button
              type="button"
              onClick={() => handleIncrement(setSeconds, seconds, 59)}
              aria-label="Increase seconds"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Color picker section */}
      <div className="chrome-item chrome-border-bottom py-4">
        <div className="chrome-item-text">
          <div className="chrome-item-title">Color</div>
        </div>
        <div className="chrome-color-grid">
          {DEFAULT_COLORS.map((colorOption) => (
            <button
              key={colorOption}
              type="button"
              className={`chrome-color-option ${
                color === colorOption ? "selected" : ""
              }`}
              style={{ backgroundColor: colorOption }}
              onClick={() => setColor(colorOption)}
              aria-label={`Select ${colorOption} color`}
            />
          ))}
        </div>
      </div>

      {/* Sound selection */}
      <div className="chrome-item py-4">
        <div className="chrome-item-text mb-2">
          <div className="chrome-item-title">Sound</div>
        </div>
        <div>
          {DEFAULT_SOUNDS.map((soundOption) => (
            <div key={soundOption} className="chrome-sound-item">
              <input
                type="radio"
                id={`sound-${soundOption}`}
                name="sound"
                value={soundOption}
                checked={sound === soundOption}
                onChange={() => setSound(soundOption)}
                className="mr-2"
              />
              <label
                htmlFor={`sound-${soundOption}`}
                className="chrome-sound-item-label"
              >
                {soundOption.charAt(0).toUpperCase() + soundOption.slice(1)}
              </label>
              <button
                type="button"
                onClick={() => handlePreviewSound(soundOption)}
                className="chrome-sound-item-preview"
                aria-label="Preview sound"
                title="Preview sound"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="chrome-footer">
        <button
          type="button"
          onClick={onCancel}
          className="chrome-button chrome-button-outline"
        >
          Cancel
        </button>
        <button type="submit" className="chrome-button chrome-button-primary">
          Save
        </button>
      </div>
    </form>
  );
};

export default TimerForm;
