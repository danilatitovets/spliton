import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ConsentSource } from '@prisma/client';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user.type';
import { requestMeta } from '../admin/common/admin-http.util';
import { LegalConsentsService } from './legal-consents.service';
import { LegalPoliciesService } from './legal-policies.service';
import { AcceptConsentsDto } from './dto/accept-consents.dto';

@Controller('api/v1/legal')
@UseGuards(JwtAuthGuard)
export class UserLegalController {
  constructor(
    private readonly consents: LegalConsentsService,
    private readonly policies: LegalPoliciesService,
  ) {}

  @Get('center')
  async legalCenter(@CurrentUser() user: AuthUser) {
    const [active, accepted, missingMap] = await Promise.all([
      this.policies.listActivePublic(),
      this.consents.listUserConsents(user.id),
      this.consents.getMissingConsentsForSources(user.id, [
        ConsentSource.PRIMARY_PURCHASE,
        ConsentSource.SECONDARY_TRADE,
        ConsentSource.WITHDRAWAL,
      ]),
    ]);
    return {
      activePolicies: active,
      acceptedConsents: accepted,
      missingConsents: {
        primaryPurchase: missingMap.get(ConsentSource.PRIMARY_PURCHASE) ?? [],
        secondaryTrade: missingMap.get(ConsentSource.SECONDARY_TRADE) ?? [],
        withdrawal: missingMap.get(ConsentSource.WITHDRAWAL) ?? [],
      },
      lawyerReviewRequired: true,
    };
  }

  @Get('consents')
  listConsents(@CurrentUser() user: AuthUser) {
    return this.consents.listUserConsents(user.id);
  }

  @Post('consents')
  accept(
    @CurrentUser() user: AuthUser,
    @Body() dto: AcceptConsentsDto,
    @Req() req: Request,
  ) {
    const meta = requestMeta(req);
    return this.consents.acceptPolicies(user.id, dto.policyIds, dto.source, meta);
  }

}
