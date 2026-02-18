import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const { status, body } = this.buildResponse(exception);

        response.status(status).json(body);
    }

    private buildResponse(exception: unknown): {
        status: number;
        body: Record<string, unknown>;
    } {
        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            const body =
                typeof exceptionResponse === 'string'
                    ? { statusCode: status, message: exceptionResponse }
                    : (exceptionResponse as Record<string, unknown>);

            if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
                this.logger.error(`${status} ${exception.message}`, exception.stack);
            } else {
                this.logger.warn(`${status} ${exception.message}`);
            }

            return { status, body };
        }

        this.logger.error(
            'Unhandled exception',
            exception instanceof Error ? exception.stack : String(exception),
        );

        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            body: {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
            },
        };
    }
}
