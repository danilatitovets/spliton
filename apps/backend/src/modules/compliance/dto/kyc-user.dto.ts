import { IsIn, IsOptional, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';

export const KYC_DOCUMENT_TYPES = ['passport', 'id_card'] as const;
export type KycDocumentType = (typeof KYC_DOCUMENT_TYPES)[number];

export class StartKycDto {
  @IsOptional()
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Za-z]{2}$/)
  countryCode?: string;
}

export class SaveKycDetailsDto {
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Za-z]{2}$/)
  countryCode!: string;

  @IsIn(KYC_DOCUMENT_TYPES)
  documentType!: KycDocumentType;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  documentReference!: string;
}

export class SubmitKycManualDto {
  @IsOptional()
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Za-z]{2}$/)
  countryCode?: string;

  @IsOptional()
  @IsIn(KYC_DOCUMENT_TYPES)
  documentType?: KycDocumentType;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  documentReference?: string;
}

export class SaveKycAddressDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  city!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  street!: string;

  @IsString()
  @MaxLength(16)
  postalCode!: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Za-z]{2}$/)
  countryCode?: string;
}

export class UploadKycDocumentDto {
  @IsIn(['identity', 'address', 'selfie'])
  docType!: string;
}
