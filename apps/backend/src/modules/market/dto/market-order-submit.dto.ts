import { IsIn, IsOptional, IsString } from 'class-validator';
import { IsPositiveDecimalString } from '../../../common/validation/decimal-string.decorator';

export class MarketOrderSubmitDto {
  @IsString()
  marketId!: string;

  @IsIn(['BUY', 'SELL', 'buy', 'sell'])
  side!: 'BUY' | 'SELL' | 'buy' | 'sell';

  @IsIn(['LIMIT', 'MARKET', 'limit', 'market'])
  type!: 'LIMIT' | 'MARKET' | 'limit' | 'market';

  @IsPositiveDecimalString({ optional: true })
  price?: string;

  @IsPositiveDecimalString({ optional: true })
  units?: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}