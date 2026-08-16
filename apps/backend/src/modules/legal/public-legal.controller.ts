import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { LegalPolicyType } from '@prisma/client';
import { throwAdminError } from '../admin/common/admin-http.util';
import { LegalPoliciesService } from './legal-policies.service';

function normalizeLegalTypeParam(type: string): LegalPolicyType | null {
  const raw = type.trim().toLowerCase().replace(/-/g, '_');
  let normalized = type.trim().toUpperCase().replace(/-/g, '_');
  if (raw === 'terms' || raw === 'tos' || raw === 'terms_of_service') {
    normalized = 'TERMS_OF_SERVICE';
  } else if (raw === 'privacy' || raw === 'privacy_policy') {
    normalized = 'PRIVACY_POLICY';
  } else if (raw === 'risk' || raw === 'risk_disclosure' || raw === 'risk_disclosures') {
    normalized = 'RISK_DISCLOSURE';
  }
  return (Object.values(LegalPolicyType) as string[]).includes(normalized)
    ? (normalized as LegalPolicyType)
    : null;
}

@Controller('api/v1/legal')
export class PublicLegalController {
  constructor(private readonly policies: LegalPoliciesService) {}

  @Get('policies/active')
  listActive() {
    return this.policies.listActivePublic();
  }

  @Get('policies/:type/active')
  activeByType(@Param('type') type: string) {
    const normalized = normalizeLegalTypeParam(type);
    if (!normalized) {
      throwAdminError('POLICY_NOT_FOUND', 'Active policy not found', HttpStatus.NOT_FOUND);
    }
    return this.policies.getActiveByType(normalized);
  }
}