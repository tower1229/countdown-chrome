import { TimerState } from "../types";
import { createIconText } from "../utils/timer";
import { setExtensionIcon, restoreDefaultIcon } from "../utils/icon-generator";
import {
  getTimerState,
  saveTimerState,
  clearTimerState,
} from "../utils/storage";
import {
  DEFAULT_NOTIFICATION_SOUND,
  playWithOffscreenDocument,
} from "../utils/audio";

// Interval for updating the icon and sending messages
const UPDATE_INTERVAL = 1000; // 1 second

let isCountingDown = false;
// Track known active content scripts
const activeContentScriptTabs = new Set<number>();

// Handle content script status
chrome.runtime.onMessage.addListener((message, sender) => {
  const tabId = sender.tab?.id;
  if (message.type === "CONTENT_SCRIPT_LOADED" && typeof tabId === "number") {
    console.debug(`Content script loaded in tab ${tabId}`);
    activeContentScriptTabs.add(tabId);
  }
});

// Detect tab close, remove from active content scripts set
chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeContentScriptTabs.has(tabId)) {
    activeContentScriptTabs.delete(tabId);
    console.debug(
      `Tab ${tabId} closed, removed from active content scripts set`
    );
  }
});

// Timer update function
const updateTimer = async () => {
  try {
    const state = await getTimerState();

    if (!state || !state.isCountingDown) {
      // No active countdown, ensure default icon is restored
      isCountingDown = false;
      await restoreDefaultIcon();
      return;
    }

    isCountingDown = true;

    const now = Date.now();
    const remainingTime = state.endTime - now;

    // Send update message to popup
    try {
      chrome.runtime.sendMessage({
        type: "TIMER_UPDATE",
        remainingTime,
      });
    } catch (error) {
      console.debug(
        "Failed to send TIMER_UPDATE message, possibly no active receivers"
      );
    }

    // Update icon display
    const timeText = createIconText(remainingTime);
    await setExtensionIcon(timeText);

    // Check if countdown is finished
    if (remainingTime <= 0) {
      await completeTimer();
    }
  } catch (error) {
    console.error("Timer update error:", error);
  }
};

// Get current timer sound setting
const getCurrentTimerSound = async (): Promise<string> => {
  const state = await getTimerState();
  return state?.sound || DEFAULT_NOTIFICATION_SOUND;
};

// Timer completion function
const completeTimer = async () => {
  try {
    // Get current timer sound setting
    const sound = await getCurrentTimerSound();

    // Clear timer state
    await clearTimerState();

    // Restore default icon
    await restoreDefaultIcon();

    // Send message to popup (if exists)
    try {
      chrome.runtime.sendMessage({ type: "TIMER_COMPLETED" });
    } catch (error) {
      // Ignore errors, may be due to no active receivers
      console.debug(
        "Failed to send TIMER_COMPLETED message, possibly no active receivers"
      );
    }

    // Show notification
    showNotification("Countdown Finished", "Your countdown timer has finished");

    // Play sound using offscreen document
    try {
      await playWithOffscreenDocument(sound, 0.8);
    } catch (error) {
      console.debug("Failed to play sound using offscreen document:", error);
      // Fallback: attempt to play sound via content scripts

      // First check our known active content scripts
      let soundPlayed = false;
      if (activeContentScriptTabs.size > 0) {
        for (const tabId of activeContentScriptTabs) {
          try {
            chrome.tabs.sendMessage(
              tabId,
              {
                type: "PLAY_SOUND",
                soundPath: sound,
              },
              (response) => {
                if (chrome.runtime.lastError) {
                  console.debug(
                    `Unable to play sound in tab ${tabId}:`,
                    chrome.runtime.lastError.message
                  );
                  activeContentScriptTabs.delete(tabId); // Remove non-responsive tab
                } else if (response?.success) {
                  console.debug(`Successfully played sound in tab ${tabId}`);
                  soundPlayed = true;
                }
              }
            );
          } catch (error) {
            console.debug(`Error sending message to tab ${tabId}:`, error);
          }
        }
      }

      // If we didn't successfully play through known tabs, try querying all tabs
      if (!soundPlayed) {
        chrome.tabs.query({}, (tabs) => {
          for (const tab of tabs) {
            const tabId = tab.id;
            if (
              typeof tabId === "number" &&
              tab.url?.startsWith("http") &&
              !activeContentScriptTabs.has(tabId)
            ) {
              chrome.tabs.sendMessage(
                tabId,
                {
                  type: "PLAY_SOUND",
                  soundPath: sound,
                },
                (response) => {
                  if (chrome.runtime.lastError) {
                    console.debug(
                      `Unable to play sound in tab ${tabId}:`,
                      chrome.runtime.lastError.message
                    );
                  } else if (response?.success) {
                    console.debug(`Successfully played sound in tab ${tabId}`);
                    activeContentScriptTabs.add(tabId); // Add to known active tabs
                  }
                }
              );
            }
          }
        });
      }
    }
  } catch (error) {
    console.error("Timer completion error:", error);
  }
};

// Show notification
const showNotification = (title: string, message: string) => {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "/icons/icon128.png",
    title,
    message,
    priority: 2,
  });
};

// Handle messages
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  try {
    if (message.type === "GET_COUNTDOWN_STATUS") {
      sendResponse({ isCountingDown });
      return true;
    }
    if (message.type === "START_TIMER") {
      // Save timer state
      const timerState: TimerState = {
        isCountingDown: true,
        endTime: message.endTime,
        totalSeconds: message.totalSeconds,
        currentTimerId: message.currentTimerId, // Save current timer ID
        sound: message.sound || DEFAULT_NOTIFICATION_SOUND, // Save sound setting
      };

      saveTimerState(timerState).then(() => {
        // Update immediately once
        updateTimer();
        sendResponse({ success: true });
      });

      return true; // Asynchronous response
    } else if (message.type === "CANCEL_TIMER") {
      clearTimerState().then(() => {
        // Restore default icon
        restoreDefaultIcon();
        // Try to send message, but ignore errors
        try {
          chrome.runtime.sendMessage({ type: "TIMER_CANCELLED" });
        } catch (error) {
          console.debug(
            "Failed to send TIMER_CANCELLED message, possibly no active receivers"
          );
        }
        sendResponse({ success: true });
      });

      return true; // Asynchronous response
    } else if (message.type === "AUDIO_ENDED") {
      // May need to do some cleanup here
      // For example, close the offscreen document when no longer needed
      console.log("Audio playback completed");
    }
  } catch (error) {
    console.error("Message handling error:", error);
    sendResponse({ success: false, error: String(error) });
  }
});

// Update timer at regular intervals
setInterval(updateTimer, UPDATE_INTERVAL);

// Initialize on extension installation or update
chrome.runtime.onInstalled.addListener(() => {
  // Reset state
  clearTimerState();
  // Ensure default icon is used
  restoreDefaultIcon();
});
