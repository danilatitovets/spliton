import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { IsPositiveDecimalString } from '../../../common/validation/decimal-string.decorator';

export class CreatePrimaryOrderDto {
  @IsUUID()
  roundId!: string;

  @IsPositiveDecimalString()
  units!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  idempotencyKey!: string;
}