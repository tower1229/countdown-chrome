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
    <div className="timer-form-container">
      <h1 className="page-title">
        {isCreatingNew ? "Create Timer" : "Edit Timer"}
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
