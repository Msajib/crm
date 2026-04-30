import {
  IsString, IsOptional, IsEmail, IsEnum, IsArray, IsObject
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ example: ['vip', 'hot-lead'] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ example: 'website' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedTo?: string;
}

export class UpdateContactDto {
  @ApiPropertyOptional() @IsOptional() @IsString() firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() whatsapp?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() companyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() source?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() customFields?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsString() assignedTo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() jobTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
}

export class CreateDealDto {
  @ApiProperty({ example: 'Enterprise License Deal' })
  @IsString()
  title: string;

  @ApiPropertyOptional() @IsOptional() @IsString() contactId?: string;
  @ApiProperty() @IsString() pipelineId: string;
  @ApiProperty() @IsString() stageId: string;
  @ApiPropertyOptional() @IsOptional() value?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() currency?: string;
  @ApiPropertyOptional() @IsOptional() closeDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() assignedTo?: string;
}

export class UpdateDealDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() stageId?: string;
  @ApiPropertyOptional() @IsOptional() value?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() assignedTo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lostReason?: string;
}

export class CreatePipelineDto {
  @ApiProperty({ example: 'Sales Pipeline' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: [{ name: 'Qualified', order: 1, color: '#10b981', probability: 25 }] })
  @IsOptional()
  stages?: Array<{ name: string; order: number; color?: string; probability?: number }>;
}

export class CreateTaskDto {
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() assignedTo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() priority?: string;
  @ApiPropertyOptional() @IsOptional() dueDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() relatedTo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() relatedType?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() checklists?: any[];
}

export class UpdateTaskDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() assignedTo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() priority?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() dueDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() checklists?: any[];
}
export class CreateWebhookDto {
  @ApiProperty({ example: 'Slack Notification' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'https://hooks.slack.com/services/...' })
  @IsString()
  url: string;

  @ApiProperty({ example: ['deal.won', 'contact.created'] })
  @IsArray()
  events: string[];

  @ApiPropertyOptional()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secret?: string;
}

export class UpdateWebhookDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() url?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() events?: string[];
  @ApiPropertyOptional() @IsOptional() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() secret?: string;
}
