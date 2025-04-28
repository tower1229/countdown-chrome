import React from "react";
import { CustomTimer } from "../../types";
import TimerForm from "../components/TimerForm";

interface TimerEditPageProps {
  timer: CustomTimer | null;
  onSave: (timer: CustomTimer) => void;
  onCancel: () => void;
  isCreatingNew: boolean;
}

const TimerEditPage: React.FC<TimerEditPageProps> = ({
  timer,
  onSave,
  onCancel,
  isCreatingNew,
}) => {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4 text-center">
        {isCreatingNew ? "创建定时器" : "编辑定时器"}
      </h1>

      <TimerForm
        timer={timer}
        onSave={onSave}
        onCancel={onCancel}
        isCreatingNew={isCreatingNew}
      />
    </div>
  );
};

export default TimerEditPage;
