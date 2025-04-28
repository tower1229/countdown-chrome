import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom/client";
import "../utils/index.css";
import { TimerState, CustomTimer, AppState, Route } from "../types";
import { calculateTotalSeconds } from "../utils/timer";
import {
  playNotificationSound,
  DEFAULT_NOTIFICATION_SOUND,
} from "../utils/audio";
import {
  getCustomTimers,
  saveCustomTimer,
  deleteCustomTimer,
  saveCustomTimers,
  getAppState,
  saveAppState,
} from "../utils/storage";
import TimerListPage from "./pages/TimerListPage";
import TimerEditPage from "./pages/TimerEditPage";

const Popup: React.FC = () => {
  // 通用状态
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 定时器管理状态
  const [timers, setTimers] = useState<CustomTimer[]>([]);
  const [currentRoute, setCurrentRoute] = useState<Route>("timer-list");
  const [editingTimer, setEditingTimer] = useState<CustomTimer | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // 加载应用状态和定时器列表
  useEffect(() => {
    const loadData = async () => {
      try {
        // 获取应用状态
        const appState = await getAppState();
        setCurrentRoute(appState.route);
        setEditingTimer(appState.editingTimer);
        setIsCreatingNew(appState.isCreatingNew);

        // 获取定时器列表
        const customTimers = await getCustomTimers();
        setTimers(customTimers);

        // 获取当前倒计时状态
        chrome.storage.local.get(["timerState"], (result) => {
          const state = result.timerState as TimerState | undefined;
          if (state && state.isRunning) {
            setIsRunning(true);
            setRemainingTime(state.endTime - Date.now());

            // 如果有当前计时器ID，查找并显示相关信息
            if (state.currentTimerId) {
              const currentTimer = customTimers.find(
                (t) => t.id === state.currentTimerId
              );
              if (currentTimer) {
                setHours(currentTimer.hours);
                setMinutes(currentTimer.minutes);
                setSeconds(currentTimer.seconds);
              }
            }
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
      } catch (error) {
        console.error("加载应用数据失败:", error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 更新应用状态
  const updateAppState = useCallback(async (newState: Partial<AppState>) => {
    try {
      const currentState = await getAppState();
      const updatedState = { ...currentState, ...newState };
      await saveAppState(updatedState);
    } catch (error) {
      console.error("保存应用状态失败:", error);
    }
  }, []);

  // 监听状态变化
  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === "TIMER_UPDATE") {
        setRemainingTime(message.remainingTime);
      } else if (message.type === "TIMER_COMPLETED") {
        setIsRunning(false);
        // 在popup中也尝试播放声音
        playNotificationSound(DEFAULT_NOTIFICATION_SOUND).catch(() => {
          // 忽略错误
        });
      } else if (message.type === "TIMER_CANCELLED") {
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

  // 开始计时
  const handleStart = useCallback(
    (customTimer?: CustomTimer) => {
      let timerHours, timerMinutes, timerSeconds, timerId;

      if (customTimer) {
        timerHours = customTimer.hours;
        timerMinutes = customTimer.minutes;
        timerSeconds = customTimer.seconds;
        timerId = customTimer.id;
      } else {
        timerHours = hours;
        timerMinutes = minutes;
        timerSeconds = seconds;
      }

      const totalSeconds = calculateTotalSeconds(
        timerHours,
        timerMinutes,
        timerSeconds
      );
      if (totalSeconds <= 0) return;

      const endTime = Date.now() + totalSeconds * 1000;

      // 保存上次设置
      chrome.storage.local.set({
        lastSettings: {
          hours: timerHours,
          minutes: timerMinutes,
          seconds: timerSeconds,
        },
      });

      // 发送消息给后台开始计时，包含自定义定时器信息
      chrome.runtime.sendMessage({
        type: "START_TIMER",
        totalSeconds,
        endTime,
        currentTimerId: timerId,
        sound: customTimer?.sound || DEFAULT_NOTIFICATION_SOUND,
      });

      setIsRunning(true);
      setRemainingTime(totalSeconds * 1000);
    },
    [hours, minutes, seconds]
  );

  // 取消计时
  const handleCancel = useCallback(() => {
    chrome.runtime.sendMessage({ type: "CANCEL_TIMER" });
    setIsRunning(false);
  }, []);

  // 保存定时器
  const handleSaveTimer = useCallback(
    async (timer: CustomTimer) => {
      try {
        await saveCustomTimer(timer);
        const updatedTimers = await getCustomTimers();
        setTimers(updatedTimers);
        setCurrentRoute("timer-list");
        updateAppState({
          route: "timer-list",
          editingTimer: null,
          isCreatingNew: false,
        });
      } catch (error) {
        console.error("保存定时器失败:", error);
      }
    },
    [updateAppState]
  );

  // 删除定时器
  const handleDeleteTimer = useCallback(async (id: string) => {
    try {
      await deleteCustomTimer(id);
      const updatedTimers = await getCustomTimers();
      setTimers(updatedTimers);
    } catch (error) {
      console.error("删除定时器失败:", error);
    }
  }, []);

  // 编辑定时器
  const handleEditTimer = useCallback(
    (timer: CustomTimer) => {
      setEditingTimer(timer);
      setIsCreatingNew(false);
      setCurrentRoute("timer-edit");
      updateAppState({
        route: "timer-edit",
        editingTimer: timer,
        isCreatingNew: false,
      });
    },
    [updateAppState]
  );

  // 创建新定时器
  const handleCreateTimer = useCallback(() => {
    setEditingTimer(null);
    setIsCreatingNew(true);
    setCurrentRoute("timer-edit");
    updateAppState({
      route: "timer-edit",
      editingTimer: null,
      isCreatingNew: true,
    });
  }, [updateAppState]);

  // 取消编辑/创建
  const handleCancelEdit = useCallback(() => {
    setCurrentRoute("timer-list");
    updateAppState({
      route: "timer-list",
      editingTimer: null,
      isCreatingNew: false,
    });
  }, [updateAppState]);

  // 重新排序定时器
  const handleReorderTimers = useCallback(async (newOrder: CustomTimer[]) => {
    try {
      await saveCustomTimers(newOrder);
      setTimers(newOrder);
    } catch (error) {
      console.error("更新定时器顺序失败:", error);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white flex h-32 p-4 w-80 items-center justify-center">
        <div className="text-center">
          <div className="rounded-full mx-auto border-b-2 border-blue-500 h-8 animate-spin w-8"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 w-80">
      {currentRoute === "timer-list" ? (
        <TimerListPage
          timers={timers}
          onCreateTimer={handleCreateTimer}
          onStartTimer={handleStart}
          onEditTimer={handleEditTimer}
          onDeleteTimer={handleDeleteTimer}
          onReorderTimers={handleReorderTimers}
          isRunning={isRunning}
          onCancel={handleCancel}
          remainingTime={remainingTime}
        />
      ) : (
        <TimerEditPage
          timer={editingTimer}
          onSave={handleSaveTimer}
          onCancel={handleCancelEdit}
          isCreatingNew={isCreatingNew}
        />
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
