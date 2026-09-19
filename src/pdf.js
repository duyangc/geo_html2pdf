const path = require('path');
const logger = require('./logger');

/**
 * 加载页面、精准计算尺寸、并最终导出无边距的单页 PDF
 * @param {{browser: import('playwright').Browser, context: import('playwright').BrowserContext}} browserContext 
 * @param {string} inputPath 
 * @param {string} outputPath 
 */
async function exportToPdf({ context }, inputPath, outputPath) {
  logger.info('正在初始化新标签页...');
  const page = await context.newPage();
  
  // 使用 file:// 协议来加载纯本地 HTML 静态资源
  const fileUrl = `file://${inputPath}`;
  
  logger.info(`正在导航至本地文件资源: ${fileUrl}`);
  // 等待 load 事件触发，即初始 HTML 文档完全加载和解析完成，样式表和图像也完成加载
  await page.goto(fileUrl, { waitUntil: 'load' });
  logger.info('页面已触发 load 事件');

  logger.info('正在等待字体渲染完成 (document.fonts.ready)...');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  logger.info('字体资源准备就绪');

  logger.info('正在扫描并等待所有图片元素加载完毕...');
  await page.evaluate(async () => {
    const images = Array.from(document.images);
    await Promise.all(images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        // 无论加载成功还是失败，都 resolve 以保证主流程继续往下走
        img.onload = resolve;
        img.onerror = resolve; 
      });
    }));
  });
  logger.info('所有图片节点探测完毕');

  // 核心修复：注入打印分页中和样式，彻底消除 CSS 中的强制分页指令（page-break-* / break-*）
  // 避免 Chromium print 引擎将内容切为多页并导致正文丢失
  logger.info('正在注入分页中和样式，防止 CSS 强制分页导致单页截断...');
  await page.addStyleTag({
    content: `
      @media print, all {
        *, *::before, *::after {
          page-break-before: auto !important;
          page-break-after: auto !important;
          page-break-inside: auto !important;
          break-before: auto !important;
          break-after: auto !important;
          break-inside: auto !important;
        }
      }
    `
  });
  logger.info('分页中和样式注入完成');

  logger.info('正在计算页面文档实际高度以实现单页完美渲染...');
  // 计算文档的确切尺寸，确保内容没有任何裁剪
  const dimensions = await page.evaluate(() => {
    const docEl = document.documentElement;
    const body = document.body;
    return {
      width: Math.max(docEl.scrollWidth, body ? body.scrollWidth : 0),
      height: Math.max(docEl.scrollHeight, body ? body.scrollHeight : 0)
    };
  });
  logger.info('文档尺寸计算完成', { width: dimensions.width, height: dimensions.height });

  logger.info('调整视口(Viewport)大小以匹配计算尺寸，防止重排与滚动条出现...');
  // 将视口撑到全页面大小
  await page.setViewportSize({
    width: dimensions.width,
    height: dimensions.height
  });

  // 预留缓冲时间，确保视口尺寸突变引起的前端渲染布局（如某些动态图表、自适应 Canvas）能稳定下来
  logger.debug('预留缓冲时间 (500ms) 让前端渲染稳定...');
  await page.waitForTimeout(500);

  logger.info('执行 Playwright 打印引擎，正在生成高保真 PDF 字节流...');
  
  await page.pdf({
    path: outputPath,
    width: `${dimensions.width}px`,
    height: `${dimensions.height}px`,
    printBackground: true, // 核心配置：保留全部 CSS 渐变、背景色、阴影
    pageRanges: '1',       // 核心配置：只截取 1 页，绝不分页
    margin: {
      // 核心配置：彻底抹去系统的打印页边距
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  });

  logger.info('PDF 字节流已成功写入磁盘');
}

module.exports = {
  exportToPdf
};
