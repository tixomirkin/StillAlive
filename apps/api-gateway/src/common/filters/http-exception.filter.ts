import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    
    let errorMsg = typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any).message;
    if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg.join(', ');
    }

    response.status(status).json({
      statusCode: status,
      message: errorMsg || exception.message,
      error: typeof exceptionResponse === 'object' ? (exceptionResponse as any).error : undefined,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
