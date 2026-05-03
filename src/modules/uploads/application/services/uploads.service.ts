import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac, randomUUID } from 'crypto';

type UploadFileInput = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
};

type PresignedUpload = {
  storageKey: string;
  uploadUrl: string;
  publicUrl: string;
  expiresAt: string;
  headers: Record<string, string>;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
};

@Injectable()
export class UploadsService {
  constructor(private readonly config: ConfigService) {}

  createPresignedUploads(userId: number, files: UploadFileInput[]): PresignedUpload[] {
    const maxFiles = Number(this.config.get('UPLOAD_MAX_FILES') ?? 6);

    if (!Array.isArray(files) || files.length === 0) {
      throw new BadRequestException('Envie ao menos um arquivo.');
    }

    if (files.length > maxFiles) {
      throw new BadRequestException(`Máximo de ${maxFiles} arquivos por post.`);
    }

    const accessKeyId = this.requiredEnv('S3_ACCESS_KEY_ID');
    const secretAccessKey = this.requiredEnv('S3_SECRET_ACCESS_KEY');
    const bucket = this.requiredEnv('S3_BUCKET');
    const region = this.config.get<string>('S3_REGION') || 'us-east-1';
    const endpoint = this.normalizeEndpoint(this.requiredEnv('S3_ENDPOINT'));
    const publicBaseUrl = this.normalizePublicBaseUrl(
      this.config.get<string>('S3_PUBLIC_BASE_URL') || `${endpoint}/${bucket}`,
    );
    const endpointUrl = new URL(endpoint);
    const endpointBasePath = endpointUrl.pathname.replace(/\/+$/, '');

    return files.map((file, index) => {
      this.validateFile(file);

      const timestamp = new Date();
      const iso = this.toAmzDate(timestamp);
      const dateStamp = iso.slice(0, 8);
      const expiresIn = 900;
      const key = this.buildStorageKey(userId, file.fileName, index);

      const host = endpointUrl.host;
      const encodedKey = this.encodePathSegment(key);
      const objectPath = `/${bucket}/${encodedKey}`;
      const canonicalUri = `${endpointBasePath}${objectPath}`;
      const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
      const signedHeaders = 'host';
      const canonicalQuery = [
        ['X-Amz-Algorithm', 'AWS4-HMAC-SHA256'],
        ['X-Amz-Content-Sha256', 'UNSIGNED-PAYLOAD'],
        ['X-Amz-Credential', `${accessKeyId}/${credentialScope}`],
        ['X-Amz-Date', iso],
        ['X-Amz-Expires', String(expiresIn)],
        ['X-Amz-SignedHeaders', signedHeaders],
      ]
        .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
        .join('&');
      const canonicalHeaders = `host:${host}\n`;
      const canonicalRequest = [
        'PUT',
        canonicalUri,
        canonicalQuery,
        canonicalHeaders,
        signedHeaders,
        'UNSIGNED-PAYLOAD',
      ].join('\n');
      const stringToSign = [
        'AWS4-HMAC-SHA256',
        iso,
        credentialScope,
        this.sha256Hex(canonicalRequest),
      ].join('\n');
      const signingKey = this.getSignatureKey(secretAccessKey, dateStamp, region, 's3');
      const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');
      const uploadUrl = `${endpoint}${objectPath}?${canonicalQuery}&X-Amz-Signature=${signature}`;

      return {
        storageKey: key,
        uploadUrl,
        publicUrl: `${publicBaseUrl}/${encodedKey}`,
        expiresAt: new Date(timestamp.getTime() + expiresIn * 1000).toISOString(),
        headers: {
          'Content-Type': file.mimeType,
        },
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        width: file.width,
        height: file.height,
      };
    });
  }

  private validateFile(file: UploadFileInput) {
    const maxFileSize = Number(this.config.get('UPLOAD_MAX_FILE_SIZE_BYTES') ?? 8 * 1024 * 1024);
    const allowedMimeTypes = new Set(
      String(this.config.get('UPLOAD_ALLOWED_MIME_TYPES') ?? 'image/jpeg,image/png,image/webp')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    );

    if (!file.fileName || !file.mimeType || !file.sizeBytes) {
      throw new BadRequestException('Arquivo inválido para upload.');
    }

    if (!allowedMimeTypes.has(file.mimeType)) {
      throw new BadRequestException(`Tipo de arquivo não suportado: ${file.mimeType}.`);
    }

    if (file.sizeBytes <= 0 || file.sizeBytes > maxFileSize) {
      throw new BadRequestException(`Arquivo excede o limite de ${maxFileSize} bytes.`);
    }
  }

  private buildStorageKey(userId: number, fileName: string, index: number) {
    const safeFileName = fileName.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'image';
    return `mobile/posts/${userId}/${Date.now()}-${index}-${randomUUID()}-${safeFileName}`;
  }

  private normalizeEndpoint(value: string) {
    return value.replace(/\/+$/, '');
  }

  private normalizePublicBaseUrl(value: string) {
    return value.replace(/\/+$/, '');
  }

  private requiredEnv(name: string) {
    const value = this.config.get<string>(name);
    if (!value) {
      throw new BadRequestException(`Configuração ausente: ${name}`);
    }
    return value;
  }

  private encodePathSegment(value: string) {
    return value
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
  }

  private toAmzDate(date: Date) {
    return date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  }

  private sha256Hex(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }

  private hmac(key: Buffer | string, value: string) {
    return createHmac('sha256', key).update(value).digest();
  }

  private getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string) {
    const kDate = this.hmac(`AWS4${key}`, dateStamp);
    const kRegion = this.hmac(kDate, regionName);
    const kService = this.hmac(kRegion, serviceName);
    return this.hmac(kService, 'aws4_request');
  }
}
