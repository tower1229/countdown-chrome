import React from "react";
import { CustomTimer } from "../../types";
import TimerForm from "../components/TimerForm";
import ChromeLayout from "../components/ChromeLayout";

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
    <ChromeLayout
      title={isCreatingNew ? "Create Timer" : "Edit Timer"}
      onBack={onCancel}
    >
      <TimerForm
        timer={timer}
        onSave={onSave}
        onCancel={onCancel}
        isCreatingNew={isCreatingNew}
      />
    </ChromeLayout>
  );
};

export default TimerEditPage;
