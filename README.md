# FINTAX Portal — `dsh-fintax` 交互式演示与文档门户

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![DSH Plugin](https://img.shields.io/badge/Plugin-dsh--fintax-4fc3f7)](https://github.com/fleekelon/dsh-fintax)

> 🌐 **在线交互演示**：https://fleekelon.github.io/fintax-portal/  
> 🧩 **核心插件仓库**：https://github.com/fleekelon/dsh-fintax  
> 📦 **npm 包地址**：https://www.npmjs.com/package/dsh-fintax

面向开源插件 [`dsh-fintax`](https://github.com/fleekelon/dsh-fintax)（DeepSeek Harness 跨境财税工作台）的 **WebGL2 3D 空间精密仪表风交互门户**，使用 Vite + TypeScript + React 构建并部署于 GitHub Pages。

## 核心模块
- **全屏 WebGL2 64 格实景矩阵**：实时展示插件工作台截图、系统架构图与政策对照卡片。
- **光学折射 120 刻度交互圆盘**：串联离线账单初筛、确定性算税引擎、知识库引证与双轨核对流程，支持实时 3D 阵型切换与时间轴浏览。
- **交互式 FinTax 试算预览台**：直接在浏览器中拖动参数体验一般纳税人 500 万阈值、核定小微临界点与月度四层口径差额桥接。
- **插件安装指引与隐私声明**：提供 `dsh plugin --profile desktop add dsh-fintax` 一键复制命令与独立《合规边界与离线隐私声明》说明。

## 本地运行
```bash
npm install
npm run dev
```
默认监听 `http://127.0.0.1:5174/`。

## 开源协议
本项目采用 [MIT License](LICENSE) 开源。
