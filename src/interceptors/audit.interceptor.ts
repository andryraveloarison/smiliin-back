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
    const userId = req.user?.id || null; // si JWT Guard appliqué
    const method = req.method;
    const url = req.url;

    console.log('OKE');
    console.log('User:', userId);

    return next.handle().pipe(
      tap((result) => {
        // 🔹 Exécution asynchrone, mais on n'attend pas (fire & forget)
        (async () => {
          try {
            // Déterminer l’action
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

            // Identifier l’entité depuis l’URL
            const entity = url.split('/')[1] || 'Unknown';

            // Récupérer l’ID si dispo
            const entityId =
              result?.id || result?._id || req.params?.id || null;

            // 🔹 On log seulement si ce n’est pas un "Read"
            if (action !== 'Read') {
              await this.auditService.log(
                action,
                entity,
                entityId,
                userId,
                req,
              );
            }
          } catch (e) {
            console.error('Audit log failed:', e.message);
          }
        })();
      }),
    );
  }
}
