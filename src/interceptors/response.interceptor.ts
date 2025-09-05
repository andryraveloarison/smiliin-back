import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { Observable, catchError, map, throwError } from 'rxjs';
  
  @Injectable()
  export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        map((data) => ({
          success: true,
          data,
        })),
        catchError((err) => {
          return throwError(() => ({
            success: false,
            message: err.message || 'An error occurred',
          }));
        }),
      );
    }
  }
  