/**
 * 专业日志模块
 * 提供格式化输出：[时间戳] [日志级别] [进程ID] - 消息
 * 包含 INFO, ERROR, WARN, DEBUG 等级别
 */

function formatMessage(level, message, meta) {
  const now = new Date();
  // 格式化时间，例如: 2026-07-11 17:17:56.123
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
  
  let formattedMeta = '';
  if (meta !== undefined) {
    if (meta instanceof Error) {
      formattedMeta = `\n堆栈信息:\n${meta.stack}`;
    } else if (typeof meta === 'object') {
      formattedMeta = ` \n附加数据: ${JSON.stringify(meta, null, 2)}`;
    } else {
      formattedMeta = ` - ${meta}`;
    }
  }
  
  return `[${timestamp}] [${level}] [PID:${process.pid}] - ${message}${formattedMeta}`;
}

const logger = {
  info: (message, meta) => {
    console.log(formatMessage('INFO', message, meta));
  },
  warn: (message, meta) => {
    console.warn(formatMessage('WARN', message, meta));
  },
  error: (message, meta) => {
    console.error(formatMessage('ERROR', message, meta));
  },
  debug: (message, meta) => {
    // 只有在环境变量设置了 DEBUG=true 时才会打印调试日志
    if (process.env.DEBUG === 'true') {
      console.log(formatMessage('DEBUG', message, meta));
    }
  }
};

module.exports = logger;
