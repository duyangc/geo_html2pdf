const { validateFiles } = require('./utils');
const { createBrowserContext, closeBrowserContext } = require('./browser');
const { exportToPdf } = require('./pdf');
const logger = require('./logger');

/**
 * 将 HTML 生成为 PDF 的主流程调度函数
 * @param {string} inputPath - 输入 HTML 文件的绝对路径
 * @param {string} outputPath - 输出 PDF 文件的绝对路径
 */
async function generatePdf(inputPath, outputPath) {
  let context = null;

  try {
    // 1. 校验文件和路径
    logger.info('开始校验文件输入/输出路径...');
    validateFiles(inputPath, outputPath);
    logger.info('文件校验通过');

    // 2. 启动浏览器上下文
    logger.info('准备启动 Chromium 浏览器内核...');
    context = await createBrowserContext();
    logger.info('浏览器内核启动成功');

    // 3. 执行核心 PDF 导出流程
    logger.info(`开始渲染并导出 PDF，目标文件: ${outputPath}`);
    await exportToPdf(context, inputPath, outputPath);

    logger.info('PDF 导出流程结束');
  } catch (error) {
    logger.error('生成 PDF 过程中发生未捕获的异常', error);
    throw error;
  } finally {
    // 4. 清理资源：关闭浏览器
    if (context) {
      logger.info('正在清理资源，关闭浏览器...');
      await closeBrowserContext(context);
      logger.info('浏览器资源已成功释放');
    }
  }
}

module.exports = {
  generatePdf
};
