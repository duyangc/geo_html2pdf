const { chromium } = require('playwright');
const logger = require('./logger');

/**
 * 创建并返回 Playwright 浏览器和上下文对象
 * @returns {Promise<{browser: import('playwright').Browser, context: import('playwright').BrowserContext}>}
 */
async function createBrowserContext() {
  logger.info('正在尝试拉起无头 Chromium 浏览器进程...');
  try {
    const browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-web-security', // 放开本地文件读取跨域限制
        '--no-sandbox',           // 提升部分环境（如 Docker、Linux）下的兼容性
        '--disable-setuid-sandbox'
      ]
    });
    const context = await browser.newContext();
    logger.debug('浏览器上下文创建成功');
    return { browser, context };
  } catch (error) {
    logger.error('拉起无头浏览器失败！请检查系统是否正确安装了 Playwright 的 Chromium 依赖。', error);
    throw new Error(`无法启动浏览器: ${error.message}`);
  }
}

/**
 * 安全关闭浏览器上下文和实例
 * @param {{browser: import('playwright').Browser, context: import('playwright').BrowserContext}} contextObj
 */
async function closeBrowserContext({ browser, context }) {
  try {
    if (context) {
      await context.close();
      logger.debug('Browser context 已关闭');
    }
    if (browser) {
      await browser.close();
      logger.debug('Browser 实例已关闭');
    }
  } catch (error) {
    logger.warn('关闭浏览器时遇到异常，可能会导致僵尸进程', error);
  }
}

module.exports = {
  createBrowserContext,
  closeBrowserContext
};
