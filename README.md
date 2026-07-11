# html2pdf-high-fidelity (高保真 HTML 转 PDF 导出工具)

一个基于 Node.js 和 Playwright 的命令行工具，专为 **高保真 HTML 渲染和 PDF 转换** 设计。
它可以生成一张 **单页不分页、无边距** 的全画幅 PDF，完全还原 Chrome 浏览器里的显示效果（包括复杂的 CSS 阴影、背景色和渐变），彻底解决系统自带打印强行分页断联、留白等痛点。

## 核心特性

- **绝对不分页**：最终输出的 PDF 文件永远只有 1 页，其高度自动对齐整个 HTML 网页的实际高度 (`scrollHeight`)。
- **零页边距**：系统自带打印通常会强制插入白边，本工具强制 `margin = 0`，让内容从左上角完美贴合画布。
- **高保真渲染**：完美保留字体、图片、SVG、CSS 变量以及背景底色（强行开启 `printBackground`）。
- **专为本地设计**：不需要依赖 Express 或任何 localhost Web 服务器，直接通过 `file://` 协议秒级加载本地静态文件。
- **资源完全就绪保障**：强制等待网络和内部事件 `waitUntil: 'load'`，并且探测所有 `<img>` 标签加载结束，以及 `document.fonts.ready` 确保字体应用无误。

## 安装指南

```bash
# 1. 切换到项目目录
cd html2pdf

# 2. 安装依赖包 (Playwright 及其配套的浏览器引擎)
npm install
```

*注：Playwright 会自动在后台为你下载并配置好专门用于无头渲染的 Chromium 内核。*

## 使用方法

### 基础调用

你可以直接通过 Node.js 执行命令行脚本：

```bash
# 1. 默认模式：会自动在输入文件的同级目录下，生成同名的 .pdf 文件
node bin/html2pdf.js /完整路径/到/你的/测试报告.html

# 2. 指定输出模式：手动指定要输出的路径
node bin/html2pdf.js /完整路径/到/你的/测试报告.html /指定的输出目录/最终的报告.pdf
```

### 全局命令（推荐配置）

如果你希望能随时随地在任何终端目录下使用，只需执行：

```bash
# 将该脚本注册为全局软链接
npm link

# 之后你就可以随意调用了
html2pdf /完整路径/到/你的/测试报告.html
```

## 执行流程解析

1. **环境校验**：严格验证目标路径的读写权限。
2. **内核启动**：拉起无头 Chromium 浏览器，放开本地跨域安全策略。
3. **加载追踪**：挂载 HTML，监控字体的 ready 状态以及遍历 DOM 数等待全部图片流完成。
4. **尺寸适配**：实时提取当前文档在渲染后的 `scrollWidth` 与 `scrollHeight`。
5. **视口锁定与捕获**：强行改变 Playwright 内部视口（Viewport）大小匹配目标分辨率，杜绝滚动条，剔除浏览器边距后写入字节流。

## 调试排错

本程序内置了企业级的日志系统。
如果你需要查看极为详尽的内部执行变量或对象，可以在运行时加入环境变量开启调试模式：

```bash
DEBUG=true node bin/html2pdf.js /测试路径.html
# 或者
DEBUG=true html2pdf /测试路径.html
```
