const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * 校验输入输出文件路径的合法性和权限
 * @param {string} inputPath 
 * @param {string} outputPath 
 */
function validateFiles(inputPath, outputPath) {
  logger.debug(`正在验证输入文件路径: ${inputPath}`);
  
  if (!fs.existsSync(inputPath)) {
    throw new Error(`找不到输入文件: ${inputPath}`);
  }

  const stat = fs.statSync(inputPath);
  if (!stat.isFile()) {
    throw new Error(`输入的路径不是一个合法的文件: ${inputPath}`);
  }

  if (stat.size === 0) {
    throw new Error(`输入的 HTML 文件是空的，拒绝处理: ${inputPath}`);
  }

  logger.debug('输入文件校验通过。');

  const outputDir = path.dirname(outputPath);
  logger.debug(`正在验证输出目录: ${outputDir}`);

  if (!fs.existsSync(outputDir)) {
    throw new Error(`目标输出目录不存在: ${outputDir}`);
  }

  try {
    // 检查目录的可写权限
    fs.accessSync(outputDir, fs.constants.W_OK);
  } catch (err) {
    throw new Error(`没有足够的文件系统权限，无法在目录中写入数据: ${outputDir}`);
  }

  logger.debug('输出目录校验通过。');
}

module.exports = {
  validateFiles
};
