# Tab Countdown Timer

一个简单的 Chrome 浏览器倒计时扩展，允许用户设置特定的时间，在浏览器工具栏显示倒计时，并在倒计时结束时发出通知。

## 功能

- 设置小时、分钟、秒的倒计时
- 工具栏图标动态显示剩余时间
- 倒计时过程中可随时取消
- 倒计时结束时通知提醒

## 技术栈

- React
- TypeScript
- TailwindCSS
- Chrome Extension API (Manifest V3)

## 开发环境设置

1. 克隆仓库

```
git clone https://github.com/yourname/countdown-chrome.git
cd countdown-chrome
```

2. 安装依赖

```
npm install
```

3. 开发模式构建

```
npm run dev
```

4. 生产构建

```
npm run build
```

## 在 Chrome 中加载扩展

1. 打开 Chrome 浏览器，访问 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展"
4. 选择项目的 `dist` 目录

## 项目结构

```
├── public/
│   ├── manifest.json - 扩展清单文件
│   ├── icons/ - 扩展图标
├── src/
│   ├── popup/ - 弹出界面
│   ├── background/ - 后台服务脚本
│   ├── utils/ - 工具函数
│   └── types/ - 类型定义
```

## 上架前准备

1. 准备设计素材：

   - 各种尺寸的图标 (16px, 48px, 128px)
   - 上架商店的宣传图片 (1280 x 800 或 640 x 400)
   - 上架商店的小图标 (128 x 128)

2. 准备发布材料：
   - 完整的扩展描述
   - 隐私政策声明
   - 宣传视频(可选)

## 许可证

MIT
