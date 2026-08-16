import { IsUUID } from 'class-validator';
import { IsPositiveDecimalString } from '../../../common/validation/decimal-string.decorator';

export class PrimaryOrderPreviewDto {
  @IsUUID()
  roundId!: string;

  @IsPositiveDecimalString()
  units!: string;
}