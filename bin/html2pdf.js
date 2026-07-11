#!/usr/bin/env node

const path = require('path');
const { generatePdf } = require('../src/index');
const logger = require('../src/logger');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    console.log(`
用法: html2pdf <输入.html> [输出.pdf]

一个基于 Playwright 的命令行工具，用于将本地 HTML 转换为高保真、单页、无边距的 PDF。

参数说明:
  输入.html    (必填) 本地 HTML 文件的路径。
  输出.pdf     (可选) 输出的 PDF 文件路径。如果不填，默认会在相同目录下生成同名 PDF 文件。
    `);
    process.exit(0);
  }

  const inputHtml = args[0];
  let outputPdf = args[1];

  try {
    logger.info('正在初始化 HTML 转 PDF 任务', { input: inputHtml });
    
    // 解析绝对路径
    const inputPath = path.resolve(process.cwd(), inputHtml);
    
    if (!outputPdf) {
      // 默认输出路径：与输入文件同目录，同名但后缀为 .pdf
      const parsedPath = path.parse(inputPath);
      outputPdf = path.join(parsedPath.dir, `${parsedPath.name}.pdf`);
    } else {
      outputPdf = path.resolve(process.cwd(), outputPdf);
    }

    logger.debug('路径解析完成', { inputPath, outputPdf });

    // 开始执行生成任务
    await generatePdf(inputPath, outputPdf);
    
    logger.info(`任务执行成功！PDF 已保存至: ${outputPdf}`);
  } catch (error) {
    logger.error('任务执行失败', error);
    process.exit(1);
  }
}

main();
