import { Controller, ForbiddenException, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditEntity } from './schema/audit-log.schema';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { JwtPayload } from 'jsonwebtoken';
import { isAuthorized } from 'src/utils/isAuthorizedId';
    

@Controller('audits')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @UseGuards(JwtAuthGuard)
  @Get('getOne/:idAudit')
  async getOneById(
    @Param('idAudit') idAudit: string,
    @Req() req: Request & { user: JwtPayload },
  ){

    const audit = await this.auditService.getOneById(idAudit);

    if (!isAuthorized(audit.receiverIds, req.user)) {
      throw new ForbiddenException('Non autorisé à consulter cet audit');
    }

    return audit;
  }

  @Get('getByEntintyObject/:entity/:idObject')
  listByEntityAndObject(@Param('entity') entity: AuditEntity, @Param('idObject') idObject: string) {
    return this.auditService.listByEntityAndObject(entity, idObject);
  }


}
