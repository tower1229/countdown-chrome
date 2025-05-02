import React, { useState, useRef } from "react";
import { CustomTimer } from "../../types";
import TimerItem from "./TimerItem";

interface TimerListProps {
  timers: CustomTimer[];
  onStartTimer: (timer: CustomTimer) => void;
  onEditTimer: (timer: CustomTimer) => void;
  onDeleteTimer: (id: string) => void;
  onReorderTimers: (newOrder: CustomTimer[]) => void;
}

const TimerList: React.FC<TimerListProps> = ({
  timers,
  onStartTimer,
  onEditTimer,
  onDeleteTimer,
  onReorderTimers,
}) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragItemRef = useRef<HTMLDivElement | null>(null);
  const dragItemIndex = useRef<number>(-1);
  const dragOverItemIndex = useRef<number>(-1);

  // 开始拖拽
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    dragItemRef.current = e.currentTarget;
    dragItemIndex.current = index;
    setDraggingId(timers[index].id);

    setTimeout(() => {
      if (dragItemRef.current) {
        dragItemRef.current.style.opacity = "0.5";
      }
    }, 0);
  };

  // 拖拽结束
  const handleDragEnd = () => {
    if (dragItemRef.current) {
      dragItemRef.current.style.opacity = "1";
    }

    if (
      dragItemIndex.current !== dragOverItemIndex.current &&
      dragOverItemIndex.current !== -1
    ) {
      const newTimers = [...timers];
      const draggedItem = newTimers[dragItemIndex.current];

      // 从数组中移除拖拽的项目
      newTimers.splice(dragItemIndex.current, 1);

      // 在新位置添加项目
      newTimers.splice(dragOverItemIndex.current, 0, draggedItem);

      // 更新顺序字段
      const reorderedTimers = newTimers.map((timer, index) => ({
        ...timer,
        order: index,
      }));

      onReorderTimers(reorderedTimers);
    }

    setDraggingId(null);
    dragItemIndex.current = -1;
    dragOverItemIndex.current = -1;
  };

  // 拖拽经过
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // 拖拽进入
  const handleDragEnter = (index: number) => {
    dragOverItemIndex.current = index;
  };

  if (timers.length === 0) {
    return (
      <div className="text-center py-6 text-chrome-secondary-text w-full">
        No timers, click "+" button to create one
      </div>
    );
  }

  return (
    <div className="space-y-2 w-full">
      {timers.map((timer, index) => (
        <div
          key={timer.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragEnter={() => handleDragEnter(index)}
          className="w-full"
        >
          <TimerItem
            timer={timer}
            onStart={onStartTimer}
            onEdit={onEditTimer}
            onDelete={onDeleteTimer}
            index={index}
            isDragging={timer.id === draggingId}
          />
        </div>
      ))}
    </div>
  );
};

export default TimerList;
