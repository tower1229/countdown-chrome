/**
 * Generate countdown icon (Service Worker compatible version)
 */
export const generateTimerIcon = (
  text: string
): Promise<{ [key: number]: ImageData }> => {
  return new Promise((resolve) => {
    // In Service Worker, we can't use DOM API, need to use OffscreenCanvas
    const createImageData = (size: number): ImageData => {
      // Create canvas suitable for Service Worker
      const canvas = new OffscreenCanvas(size, size);
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Cannot get canvas context");
      }

      // Clear canvas
      context.clearRect(0, 0, size, size);

      // Draw circular background
      context.fillStyle = "#2563EB"; // Blue background
      context.beginPath();
      context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      context.fill();

      // Optimize text display
      context.fillStyle = "#FFFFFF"; // White text
      context.textAlign = "center";
      context.textBaseline = "middle";

      // Adjust font size based on text length and icon size, optimized precisely for different text lengths
      let fontSize;
      if (text.length === 1) {
        // Single digit, use maximum font size
        fontSize = Math.floor(size * 0.85);
      } else if (text.length === 2) {
        // Two digits, like "59", "20", etc.
        fontSize = Math.floor(size * 0.75);
      } else if (text.length === 3) {
        // Three digits or short text with unit, like "5m", "2h"
        fontSize = Math.floor(size * 0.55);
      } else {
        // Longer text
        fontSize = Math.floor(size * 0.45);
      }

      context.font = `bold ${fontSize}px Arial`;

      // Precisely calculate vertical position of text
      const verticalOffset = size * 0.02;
      context.fillText(text, size / 2, size / 2 + verticalOffset);

      // Convert to ImageData
      return context.getImageData(0, 0, size, size);
    };

    // Create icons of different sizes
    const iconData: { [key: number]: ImageData } = {};
    [16, 32, 48, 128].forEach((size) => {
      iconData[size] = createImageData(size);
    });

    resolve(iconData);
  });
};

/**
 * Set extension icon
 */
export const setExtensionIcon = async (text: string): Promise<void> => {
  try {
    const imageData = await generateTimerIcon(text);

    // Set icon
    chrome.action.setIcon({ imageData });
  } catch (error) {
    console.error("Failed to set icon:", error);
    // Error handling: use simple badge text to display time
    try {
      chrome.action.setBadgeText({ text });
      chrome.action.setBadgeBackgroundColor({ color: "#2563EB" });
    } catch (badgeError) {
      console.error("Failed to set badge:", badgeError);
    }
  }
};

/**
 * Restore default icon
 */
export const restoreDefaultIcon = async (): Promise<void> => {
  try {
    // Clear all custom icons and badges
    await chrome.action.setIcon({
      path: {
        "16": "/icons/icon16.png",
        "48": "/icons/icon48.png",
        "128": "/icons/icon128.png",
      },
    });

    // Ensure badge is also cleared
    await chrome.action.setBadgeText({ text: "" });
  } catch (error) {
    console.error("Failed to restore default icon:", error);
  }
};
