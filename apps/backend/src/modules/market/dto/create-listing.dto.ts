import { IsOptional, IsString, IsUUID } from 'class-validator';
import { IsPositiveDecimalString } from '../../../common/validation/decimal-string.decorator';

export class CreateListingDto {
  @IsUUID()
  releaseId!: string;

  @IsPositiveDecimalString()
  units!: string;

  @IsPositiveDecimalString()
  pricePerUnit!: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}