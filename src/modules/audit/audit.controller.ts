import { Controller, Get, Param } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audits')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get(':entity/:idObject')
  listByEntityAndObject(@Param('entity') entity: any, @Param('idObject') idObject: string) {
    return this.auditService.listByEntityAndObject(entity, idObject);
  }
}
