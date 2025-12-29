import type { Request, Response } from 'express';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const type = host.getType<'http' | 'graphql'>();

    if (type === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();

      const { statusCode, message, stack } = this.formatException(exception);

      return response.status(statusCode).json({
        status: statusCode,
        message,
        path: request.url,
        timestamp: new Date().toISOString(),
        ...(stack && { stack }),
      });
    }

    if (type === 'graphql') {
      
      const { statusCode, message } = this.formatException(exception);

      throw new HttpException(message, statusCode);
    }
  }

  private formatException(exception: any): {
    statusCode: number;
    message: string;
    stack?: string;
  } {
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let stack: string | undefined;

    // NestJS HttpException
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : (res as any).message || exception.message;
      stack =
        process.env.NODE_ENV === 'development' ? exception.stack : undefined;
    }
    // Mongo duplicate key
    else if (exception?.code === 11000 && exception?.keyValue) {
      statusCode = HttpStatus.CONFLICT;
      const key = Object.keys(exception.keyValue)[0];
      const value = exception.keyValue[key];
      message = `Duplicated ${key} value: "${value}"`;
      stack =
        process.env.NODE_ENV === 'development' ? exception.stack : undefined;
    }
    // Generic JS Error
    else if (exception instanceof Error) {
      message = exception.message;
      stack =
        process.env.NODE_ENV === 'development' ? exception.stack : undefined;
    }
    // Plain object with message
    else if (
      typeof exception === 'object' &&
      exception !== null &&
      'message' in exception
    ) {
      message = exception.message;
    }

    return { statusCode, message, stack };
  }
}
