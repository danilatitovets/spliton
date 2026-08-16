import { IsIn, IsOptional, IsString } from 'class-validator';
import { IsPositiveDecimalString } from '../../../common/validation/decimal-string.decorator';

export class MarketOrderPreviewDto {
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

  @IsPositiveDecimalString({ optional: true })
  amount?: string;

  @IsPositiveDecimalString({ optional: true })
  tickSize?: string;

  @IsOptional()
  @IsString()
  releaseId?: string;
}