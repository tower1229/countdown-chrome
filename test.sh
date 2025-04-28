#!/bin/bash

# 检查是否安装了npm
if ! command -v npm &> /dev/null; then
    echo "错误: 需要npm但未安装。请安装Node.js和npm后再试。"
    exit 1
fi

# 安装依赖
echo "安装依赖..."
npm install

# 构建扩展
echo "构建扩展..."
npm run build

echo "构建完成！"
echo "请在Chrome中访问 chrome://extensions/ 并加载 dist 目录作为已解压的扩展程序"
echo "提示: 确保已开启开发者模式"