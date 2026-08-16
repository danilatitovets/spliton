import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class BuyTradeDto {
  @IsUUID()
  listingId!: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  idempotencyKey?: string;
}
