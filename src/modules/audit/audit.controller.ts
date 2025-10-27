import { Controller, Get, Param } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditEntity } from './schema/audit-log.schema';

@Controller('audits')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('getOne/:idAudit')
      getOneById(@Param('idAudit') idAudit: string) {
        return this.auditService.getOneById(idAudit);
  }

  @Get('getByEntintyObject/:entity/:idObject')
  listByEntityAndObject(@Param('entity') entity: AuditEntity, @Param('idObject') idObject: string) {
    return this.auditService.listByEntityAndObject(entity, idObject);
  }


}
