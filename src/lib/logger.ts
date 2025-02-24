/**
 * @license
 * MIT License
 * Copyright (c) 2025 D8ger
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import dayjs from 'dayjs';

type LogLevel = 'info' | 'warn' | 'error'

interface LogEntry {
  data?: any
  error?: Error
}

export class Logger {
  private static formatLog(entry: LogEntry): string {
    return JSON.stringify({
      data: entry.data,
      error: entry.error ? {
        message: entry.error.message,
        stack: entry.error.stack
      } : undefined
    }, null, 2)
  }

  static log(level: LogLevel, message: string, data?: any, error?: Error, requestId?: any) {
    if (requestId === undefined || requestId === null) {
      requestId = 'UNKNOWN, PLEASE CHECK TRACE!'
    }
    const entry: LogEntry = {
      data,
      error
    }
    const timestamp =  dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS');
    // 在开发环境使用格式化输出
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${level}][${timestamp}][${requestId}][${message}]`, this.formatLog(entry))
    } else {
      // 在生产环境可以将日志发送到日志服务
      console.log(`[${level}][${timestamp}][${requestId}][${message}]`, this.formatLog(entry))
    }
  }

  static info(message: string, data?: any, requestId?: any) {
    this.log('info', message, data, undefined, requestId)
  }

  static warn(message: string, data?: any, error?: Error, requestId?: any) {
    this.log('warn', message, data, error, requestId)
  }

  static error(message: string, error: Error, data?: any, requestId?: any) {
    this.log('error', message, data, error, requestId)
  }
}