/**
 * Play notification sound
 * @param soundPath Sound file path or URL
 * @param volume Volume, range 0-1, default is 1
 */
export const playNotificationSound = (
  soundPath: string,
  volume: number = 1.0
): Promise<void> => {
  // Check if in Service Worker environment
  if (typeof window === "undefined" || typeof Audio === "undefined") {
    // Service Worker environment, use offscreen document API to play audio
    return playWithOffscreenDocument(soundPath, volume);
  }

  // Use Audio API normally in browser environment
  return new Promise((resolve, reject) => {
    try {
      const fullPath = chrome.runtime.getURL(getSoundPath(soundPath));
      const audio = new Audio(fullPath);
      audio.volume = volume;

      audio.onended = () => {
        resolve();
      };

      audio.onerror = (error) => {
        reject(error);
      };

      // Try to play audio
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Audio starts playing
          })
          .catch((error) => {
            // May fail to autoplay due to user not interacting
            reject(error);
          });
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Play audio using offscreen document
 * @param soundPath Sound file path
 * @param volume Volume
 */
export const playWithOffscreenDocument = async (
  soundPath: string,
  volume: number = 1.0
): Promise<void> => {
  try {
    // Ensure offscreen document is created
    await createOffscreenDocumentIfNeeded();

    // Add small delay to ensure offscreen document is fully initialized
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Send message to offscreen document to play audio
    return new Promise<void>((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: "PLAY_SOUND",
          soundPath: getSoundPath(soundPath),
          volume,
        },
        (_response) => {
          if (chrome.runtime.lastError) {
            console.debug(
              "Offscreen document communication error:",
              chrome.runtime.lastError.message
            );
            // Try to create offscreen document again
            createOffscreenDocumentIfNeeded()
              .then(() => {
                // Try sending message again
                chrome.runtime.sendMessage(
                  {
                    type: "PLAY_SOUND",
                    soundPath: getSoundPath(soundPath),
                    volume,
                  },
                  (_retryResponse) => {
                    if (chrome.runtime.lastError) {
                      reject(chrome.runtime.lastError);
                    } else {
                      resolve();
                    }
                  }
                );
              })
              .catch(reject);
          } else {
            resolve();
          }
        }
      );
    });
  } catch (error) {
    console.error("Error occurred while playing audio:", error);
    throw error;
  }
};

/**
 * Create offscreen document (if not created yet)
 */
export const createOffscreenDocumentIfNeeded = async (): Promise<void> => {
  try {
    // Check if offscreen document already exists
    if (await hasOffscreenDocument()) {
      return;
    }

    // Create new offscreen document
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"] as chrome.offscreen.Reason[],
      justification: "For playing countdown completion notification sounds",
    });

    // Wait a short time to ensure offscreen document is fully loaded
    await new Promise((resolve) => setTimeout(resolve, 200));
  } catch (error) {
    console.error("Error occurred while creating offscreen document:", error);
    throw error;
  }
};

/**
 * Check if offscreen document already exists
 */
export const hasOffscreenDocument = async (): Promise<boolean> => {
  // Chrome 116+ supports getContexts API
  if ("getContexts" in chrome.runtime) {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"] as chrome.runtime.ContextType[],
      documentUrls: [chrome.runtime.getURL("offscreen.html")],
    });
    return contexts && contexts.length > 0;
  }
  // Compatible with older Chrome versions
  else {
    try {
      // Use clients API (needs to be in service worker)
      // @ts-ignore - TS may not recognize clients
      const allClients = await clients.matchAll();
      return allClients.some((client: any) =>
        client.url.includes(chrome.runtime.id + "/offscreen.html")
      );
    } catch (e) {
      // If not in service worker environment, simply try to create document
      // If it already exists, it will throw an error
      return false;
    }
  }
};

/**
 * Get sound file path from sound name
 */
export const getSoundPath = (fileName: string): string => {
  return `sounds/${fileName}`;
};

// Default notification sound path
export const DEFAULT_NOTIFICATION_SOUND = "default.mp3";
