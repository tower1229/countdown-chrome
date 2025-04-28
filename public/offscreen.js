// Listen for messages from the extension's service worker
chrome.runtime.onMessage.addListener((message) => {
  // Check if this is a play sound message
  if (message.type === "PLAY_SOUND") {
    const { soundPath, volume = 1.0 } = message;

    // Get the full URL to the sound file
    const soundUrl = chrome.runtime.getURL(soundPath);

    // Play the sound
    playAudio(soundUrl, volume);
  }
});

/**
 * Play an audio file with the specified volume
 * @param {string} soundUrl - URL to the sound file
 * @param {number} volume - Volume level (0.0 to 1.0)
 */
function playAudio(soundUrl, volume) {
  try {
    const audio = new Audio(soundUrl);
    audio.volume = volume;

    // When the audio ends, let the service worker know (for potential cleanup)
    audio.onended = () => {
      chrome.runtime.sendMessage({ type: "AUDIO_ENDED" });
    };

    // If there's an error, report it
    audio.onerror = (error) => {
      console.error("Error playing audio:", error);
      chrome.runtime.sendMessage({
        type: "AUDIO_ERROR",
        error: error.toString(),
      });
    };

    // Play the audio
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("Audio playback failed:", error);
      });
    }
  } catch (error) {
    console.error("Error setting up audio playback:", error);
  }
}
