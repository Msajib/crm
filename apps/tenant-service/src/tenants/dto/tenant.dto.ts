import {
  IsString, IsOptional, IsEnum, IsUrl, IsHexColor
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'acme-corp' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 'UTC' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  locale?: string;
}

export class UpdateTenantDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  faviconUrl?: string;

  @ApiPropertyOptional({ example: '#6366f1' })
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#4f46e5' })
  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  @ApiPropertyOptional({ example: '#f59e0b' })
  @IsOptional()
  @IsHexColor()
  accentColor?: string;

  @ApiPropertyOptional({ example: 'crm.acme.com' })
  @IsOptional()
  @IsString()
  customDomain?: string;
}

export class UpdateSystemSettingsDto {
  @ApiPropertyOptional({ example: 'My Custom CRM' })
  @IsOptional()
  @IsString()
  systemName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  faviconUrl?: string;

  @ApiPropertyOptional({ example: '#6366f1' })
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#4f46e5' })
  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  @ApiPropertyOptional({ example: '#f59e0b' })
  @IsOptional()
  @IsHexColor()
  accentColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaDescription?: string;
}

export class ConnectSocialAccountDto {
  @ApiProperty({ enum: ['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'MARKETPLACE'] })
  @IsEnum(['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'MARKETPLACE'])
  platform: string;

  @ApiProperty()
  @IsString()
  accountName: string;

  @ApiProperty()
  @IsString()
  accountId: string;

  @ApiProperty()
  @IsString()
  accessToken: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class PaymentGatewayConfigDto {
  @ApiProperty({ example: 'STRIPE' })
  @IsString()
  gateway: string;

  @ApiProperty({ description: 'Gateway credentials (API keys etc.)' })
  credentials: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  currencies?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  isDefault?: boolean;
}
