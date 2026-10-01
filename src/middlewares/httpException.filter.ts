import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseSchema } from '@schemas/errorResponse.schema';

interface HttpExceptionBody {
  message?: string | string[];
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body: ErrorResponseSchema = {
      statusCode,
      error: this.extractError(exception, statusCode),
      message: this.extractMessage(exception),
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(body);
  }

  private extractMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      const message = this.isHttpExceptionBody(body) ? body.message : undefined;
      if (Array.isArray(message)) {
        return message.join(', ');
      }
      if (typeof message === 'string') {
        return message;
      }
      return exception.message;
    }

    return exception instanceof Error
      ? exception.message
      : 'Internal server error';
  }

  private extractError(exception: unknown, statusCode: number): string {
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      const error = this.isHttpExceptionBody(body) ? body.error : undefined;
      if (typeof error === 'string') {
        return error;
      }
    }

    return HttpStatus[statusCode] ?? 'Internal Server Error';
  }

  private isHttpExceptionBody(body: unknown): body is HttpExceptionBody {
    return typeof body === 'object' && body !== null;
  }
}
