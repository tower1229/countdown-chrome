import React, { useState, useEffect } from "react";

type TimeInputProps = {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  label: string;
  ariaLabel: string;
  id: string;
};

const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 59,
  label,
  ariaLabel,
  id,
}) => {
  const [inputValue, setInputValue] = useState<string>(String(value));

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  // 只允许数字，去除前导零，限制范围
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ""); // 只保留数字
    if (val.length > 1) val = val.replace(/^0+/, ""); // 去除前导零
    if (val === "") val = "0";
    let num = Number(val);
    if (num > max) num = max;
    if (num < min) num = min;
    setInputValue(String(num));
    onChange(num);
  };

  // 失焦时修正
  const handleInputBlur = () => {
    let num = Number(inputValue.replace(/\D/g, ""));
    if (isNaN(num) || inputValue === "") num = 0;
    if (num > max) num = max;
    if (num < min) num = min;
    setInputValue(String(num));
    onChange(num);
  };

  return (
    <div className="flex flex-col items-center">
      <label className="text-sm mb-1" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className="w-12 text-center border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        aria-label={ariaLabel}
        tabIndex={0}
        maxLength={2}
      />
    </div>
  );
};

export default TimeInput;
