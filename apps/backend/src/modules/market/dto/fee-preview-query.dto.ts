import { IsOptional, IsUUID } from 'class-validator';
import { IsPositiveDecimalString } from '../../../common/validation/decimal-string.decorator';

export class FeePreviewQueryDto {
  @IsOptional()
  @IsUUID()
  listingId?: string;

  @IsOptional()
  @IsUUID()
  releaseId?: string;

  @IsPositiveDecimalString({ optional: true })
  units?: string;

  @IsPositiveDecimalString({ optional: true })
  pricePerUnit?: string;
}