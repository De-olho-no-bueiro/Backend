import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { CreateUploadUrlDto } from './application/dtos/create-upload-url.dto';
import { UploadsService } from './application/services/uploads.service';

@ApiTags('mobile-uploads')
@ApiBearerAuth()
@Controller('mobile/v1/uploads')
export class MobileUploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presign')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Gerar URLs assinadas para upload de imagens do mobile' })
  @ApiBody({ type: CreateUploadUrlDto })
  createPresignedUploads(@Body() dto: CreateUploadUrlDto, @Req() req: any) {
    return {
      uploads: this.uploadsService.createPresignedUploads(req.user.userId, dto.files || []),
    };
  }
}
