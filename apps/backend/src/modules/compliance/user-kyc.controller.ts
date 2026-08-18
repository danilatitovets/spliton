import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user.type';
import { USER_DOCUMENT_LIMITS } from '../admin/common/media-storage.constants';
import { UserKycService } from './user-kyc.service';
import {
  SaveKycAddressDto,
  SaveKycDetailsDto,
  StartKycDto,
  SubmitKycManualDto,
  UploadKycDocumentDto,
} from './dto/kyc-user.dto';

@Controller('api/v1/kyc')
@UseGuards(JwtAuthGuard)
export class UserKycController {
  constructor(private readonly kyc: UserKycService) {}

  @Get('status')
  status(@CurrentUser() user: AuthUser) {
    return this.kyc.getStatus(user.id);
  }

  @Post('start')
  start(@CurrentUser() user: AuthUser, @Body() body: StartKycDto) {
    return this.kyc.start(user.id, body.countryCode);
  }

  @Post('details')
  saveDetails(@CurrentUser() user: AuthUser, @Body() body: SaveKycDetailsDto) {
    return this.kyc.saveDetails(user.id, body);
  }

  @Post('submit-manual')
  submitManual(@CurrentUser() user: AuthUser, @Body() body: SubmitKycManualDto) {
    return this.kyc.submitManual(user.id, body);
  }

  @Post('address')
  saveAddress(@CurrentUser() user: AuthUser, @Body() body: SaveKycAddressDto) {
    return this.kyc.saveAddress(user.id, body);
  }

  @Post('documents')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: USER_DOCUMENT_LIMITS.maxBytes },
    }),
  )
  uploadDocument(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: UploadKycDocumentDto,
  ) {
    return this.kyc.uploadDocument(user.id, body.docType, {
      buffer: file?.buffer ?? Buffer.alloc(0),
      mimetype: file?.mimetype ?? '',
      size: file?.size ?? 0,
      originalname: file?.originalname ?? 'document',
    });
  }
}
