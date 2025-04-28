# <img src="docs/440x280.png" alt="Countdown Timer Logo" width="440" height="280" style="display:block;margin:auto;" />

# Countdown Timer Chrome Extension

> **Multi-timer Chrome Extension for Focused Productivity**

## 🚀 What is Countdown Timer?

**Countdown Timer** is your all-in-one Chrome extension for managing multiple countdowns. Whether you’re working, studying, cooking, or taking breaks, set up custom timers, personalize them, and stay on track—all from your browser toolbar.

**Example use cases:**

- Pomodoro work sessions
- Study intervals
- Cooking reminders
- Exercise sets
- Quick breaks

---

## ✨ Features

- **Multiple Custom Timers:** Create, edit, delete, and save as many timers as you need.
- **Drag-and-Drop Sorting:** Organize your timers for quick access.
- **Color & Sound Customization:** Assign unique colors and notification sounds to each timer.
- **One-Click Start:** Instantly start any saved timer from the list.
- **Live Toolbar Countdown:** See remaining time directly on the Chrome toolbar icon.
- **Material Design UI:** Clean, modern, and intuitive interface.
- **Keyboard & Screen Reader Friendly:** Full accessibility support.
- **Privacy-First:** No tracking, no data collection, secure local storage.
- **Notification & Sound:** Get notified with your chosen sound when time’s up.

---

## 🛠️ How It Works

1. **Open the Extension**  
   Click the Countdown Timer icon to open the popup.
2. **Timer List View**  
   See all your saved timers. Drag to reorder, click to start, or edit/delete as needed.
3. **Create/Edit Timer**  
   Set hours, minutes, seconds, pick a color, and choose a sound. Save to add to your list.
4. **Start a Timer**  
   When a timer is running, only the countdown view is shown for focus. Toolbar icon updates every second.
5. **Get Notified**  
   When time’s up, receive a desktop notification and your selected sound. The list view returns automatically.

<div align="center">
<img src="docs/screen/Snipaste_2025-04-28_17-28-40.png" alt="Main UI Screenshot" width="400" />
  <img src="docs/screen/Snipaste_2025-04-28_17-28-12.png" alt="Set Timer Screenshot" width="400" />
  <img src="docs/screen/Snipaste_2025-04-28_17-27-53.png" alt="Toolbar Countdown Screenshot" width="400" />
  <img src="docs/screen/Snipaste_2025-04-28_17-26-36.png" alt="Notification Screenshot" width="400" />
</div>

---

## 🧩 Custom Timer Management

- **Save Your Favorites:** Store frequently used timers for instant access.
- **Drag-and-Drop:** Reorder timers to match your workflow.
- **Color & Sound:** Personalize each timer for easy recognition.
- **Quick Start:** Launch any timer with a single click.

---

## ♿ Accessibility & 🔒 Privacy

- **Accessibility:**
  - ARIA labels, keyboard navigation, and high-contrast color options
  - Fully screen reader compatible
- **Privacy & Security:**
  - No data collection, no analytics, no tracking
  - All data stored securely in your browser (chrome.storage.local)
  - Strict Content Security Policy (CSP)
  - Minimal permissions, secure messaging

Read our [Privacy Policy](docs/privacy-policy.md) for details.

---

## 📦 Installation

- **[Chrome Web Store – Coming Soon!](#)**
- Or, [install manually](#manual-install):
  1. Clone or download this repo
  2. Run `yarn install && yarn build`
  3. Go to `chrome://extensions/`, enable Developer Mode
  4. Click "Load unpacked" and select the `dist` folder

---

## ❓ FAQ / Troubleshooting

**Q: Why can’t I see the timer list when a timer is running?**  
A: For focus, only the countdown is shown during an active timer. The list returns when the countdown ends or is canceled.

**Q: How do I change the notification sound or color?**  
A: Edit your timer and select your preferred sound and color before saving.

**Q: How is my data stored?**  
A: All timer data is stored locally in your browser using `chrome.storage.local`. Nothing is sent to any server.

**Q: Can I use keyboard shortcuts?**  
A: Yes! All controls are keyboard accessible and support screen readers.

---

## 👩‍💻 For Developers

### 技术栈

- React
- TypeScript
- TailwindCSS
- Chrome Extension API (Manifest V3)

### 开发环境设置

1. 克隆仓库

```sh
git clone https://github.com/yourname/countdown-chrome.git
cd countdown-chrome
```

2. 安装依赖

```sh
yarn install
```

3. 开发模式构建

```sh
yarn dev
```

4. 生产构建

```sh
yarn build
```

### 在 Chrome 中加载扩展

1. 打开 Chrome 浏览器，访问 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展"
4. 选择项目的 `dist` 目录

### 主要文件结构

```
├── public/
│   ├── manifest.json
│   ├── icons/
│   ├── sounds/
├── src/
│   ├── popup/
│   ├── background/
│   ├── utils/
│   ├── contexts/
│   └── types/
├── package.json
├── tsconfig.json
└── webpack.config.js
```

---

## 许可证

MIT
