import { KycLevel } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ApproveKycDto {
  @IsOptional()
  @IsEnum(KycLevel)
  level?: KycLevel;
}

export class RejectKycDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}
