import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom/client";
import "../utils/index.css";
import "../utils/global.css";
import { TimerState, CustomTimer, AppState, Route } from "../types";
import { calculateTotalSeconds } from "../utils/timer";
import {
  playNotificationSound,
  DEFAULT_NOTIFICATION_SOUND,
} from "../utils/audio";
import {
  getCustomTimers,
  deleteCustomTimer,
  saveCustomTimers,
  getAppState,
  saveAppState,
  saveCustomTimer,
} from "../utils/storage";
import TimerListPage from "./pages/TimerListPage";
import CountdownView from "./components/CountdownView";
import TimerEditPage from "./pages/TimerEditPage";

const Popup: React.FC = () => {
  // 通用状态
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentColor, setCurrentColor] = useState<string>("#3B82F6");

  // 定时器管理状态
  const [timers, setTimers] = useState<CustomTimer[]>([]);

  // 路由状态
  const [currentRoute, setCurrentRoute] = useState<Route>("timer-list");
  const [editingTimer, setEditingTimer] = useState<CustomTimer | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  const [isCountingDown, setIsCountingDown] = useState(false);

  // 加载应用状态和定时器列表
  useEffect(() => {
    const loadData = async () => {
      try {
        // 获取定时器列表
        const customTimers = await getCustomTimers();
        setTimers(customTimers);

        // 获取应用状态
        const appState = await getAppState();
        setCurrentRoute(appState.route);
        setEditingTimer(appState.editingTimer);
        setIsCreatingNew(appState.isCreatingNew);

        // 获取当前倒计时状态
        chrome.storage.local.get(["timerState"], (result) => {
          const state = result.timerState as TimerState | undefined;
          if (state && state.isCountingDown) {
            setIsCountingDown(true);
            setRemainingTime(state.endTime - Date.now());
            setTotalTime(state.totalSeconds * 1000);

            // 如果有当前计时器ID，查找并显示相关信息
            if (state.currentTimerId) {
              const currentTimer = customTimers.find(
                (t) => t.id === state.currentTimerId
              );
              if (currentTimer) {
                setHours(currentTimer.hours);
                setMinutes(currentTimer.minutes);
                setSeconds(currentTimer.seconds);
                setCurrentColor(currentTimer.color);
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
        setIsCountingDown(false);
        // 在popup中也尝试播放声音
        playNotificationSound(DEFAULT_NOTIFICATION_SOUND).catch(() => {
          // 忽略错误
        });
      } else if (message.type === "TIMER_CANCELLED") {
        setIsCountingDown(false);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  // 更新显示的剩余时间
  useEffect(() => {
    if (isCountingDown) {
      const interval = setInterval(() => {
        chrome.storage.local.get(["timerState"], (result) => {
          const state = result.timerState as TimerState | undefined;
          if (state && state.isCountingDown) {
            setRemainingTime(state.endTime - Date.now());
          } else {
            setIsCountingDown(false);
            clearInterval(interval);
          }
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isCountingDown]);

  // 开始计时
  const handleStart = useCallback(
    (customTimer?: CustomTimer) => {
      let timerHours, timerMinutes, timerSeconds, timerId;

      if (customTimer) {
        timerHours = customTimer.hours;
        timerMinutes = customTimer.minutes;
        timerSeconds = customTimer.seconds;
        timerId = customTimer.id;
        setCurrentColor(customTimer.color);
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
      const totalMs = totalSeconds * 1000;

      // 设置总时间
      setTotalTime(totalMs);

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

      setIsCountingDown(true);
      setRemainingTime(totalMs);
    },
    [hours, minutes, seconds]
  );

  // 取消计时
  const handleCancel = useCallback(() => {
    chrome.runtime.sendMessage({ type: "CANCEL_TIMER" });
    setIsCountingDown(false);
  }, []);

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
      setCurrentRoute("timer-edit");
      setEditingTimer(timer);
      setIsCreatingNew(false);
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
    setCurrentRoute("timer-edit");
    setEditingTimer(null);
    setIsCreatingNew(true);
    updateAppState({
      route: "timer-edit",
      editingTimer: null,
      isCreatingNew: true,
    });
  }, [updateAppState]);

  // 处理保存定时器
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

  // 重新排序定时器
  const handleReorderTimers = useCallback(async (newOrder: CustomTimer[]) => {
    try {
      await saveCustomTimers(newOrder);
      setTimers(newOrder);
    } catch (error) {
      console.error("更新定时器顺序失败:", error);
    }
  }, []);

  // 返回上一级
  const handleGoBack = useCallback(() => {
    setCurrentRoute("timer-list");
    updateAppState({ route: "timer-list" });
  }, []);

  useEffect(() => {
    // 初始获取倒计时状态
    chrome.runtime.sendMessage({ type: "GET_COUNTDOWN_STATUS" }, (res) => {
      if (res && typeof res.isCountingDown === "boolean")
        setIsCountingDown(res.isCountingDown);
    });
    // 监听 background 状态变更
    const handleMessage = (msg: any) => {
      if (msg.type === "COUNTDOWN_STATUS_CHANGED")
        setIsCountingDown(msg.isCountingDown);
    };
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  return (
    <div className="flex flex-col mx-auto min-h-screen px-0 pb-2 w-80">
      {!isLoading && (
        <div className="flex-grow">
          {isCountingDown ? (
            <CountdownView
              remainingTime={remainingTime}
              onCancel={handleCancel}
              color={currentColor}
              totalTime={totalTime}
            />
          ) : (
            <>
              {currentRoute === "timer-list" && (
                <TimerListPage
                  timers={timers}
                  onEditTimer={handleEditTimer}
                  onDeleteTimer={handleDeleteTimer}
                  onStartTimer={handleStart}
                  onCreateTimer={handleCreateTimer}
                  onReorderTimers={handleReorderTimers}
                  isCountingDown={isCountingDown}
                  onCancel={handleCancel}
                  remainingTime={remainingTime}
                />
              )}
              {currentRoute === "timer-edit" && (
                <TimerEditPage
                  timer={editingTimer}
                  onSave={handleSaveTimer}
                  onCancel={handleGoBack}
                  isCreatingNew={isCreatingNew}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// 渲染应用
const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(<Popup />);
}

export default Popup;
