// src/audit/audit.interceptor.ts
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable, tap } from 'rxjs';
import { AuditService } from 'src/modules/audit/audit.service';
  
  @Injectable()
  export class AuditInterceptor implements NestInterceptor {
    constructor(private readonly auditService: AuditService) {}
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

      const req = context.switchToHttp().getRequest();

      const userId = req.body.userId || null; // si JWT Guard appliqué
      const method = req.method;
      const url = req.url;
  
      return next.handle().pipe(
        tap(async (result) => {
          try {
            // Déterminer l’action en fonction de la méthode HTTP
            let action: string;
            switch (method) {
              case 'POST':
                action = 'Create';
                break;
              case 'PUT':
              case 'PATCH':
                action = 'Update';
                break;
              case 'DELETE':
                action = 'Delete';
                break;
              default:
                action = 'Read';
            }
  
            // Identifier la ressource depuis l’URL (ex: /publications/...)
            const entity = url.split('/')[1] || 'Unknown';
  
            // ID de la ressource si dispo (par ex. si result contient un id)
            const entityId =
              result?.id || result?._id || req.params?.id || null;
  
            // Log dans la DB via ton AuditService
            if(action != 'Read'){
                await this.auditService.log(
                    action,
                    entity,
                    entityId,
                    userId,
                    req,
                  );
            }

          } catch (e) {
            console.error('Audit log failed', e);
          }
        }),
      );
    }
  }
  