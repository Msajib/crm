import {
  IsEmail, IsString, IsOptional, IsBoolean,
  IsEnum, IsArray, MinLength
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRoleDto {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export class CreateUserDto {
  @ApiProperty({ example: 'staff@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'TempPass@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Jane' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: '+8801712345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'uuid-of-custom-role' })
  @IsOptional()
  @IsString()
  customRoleId?: string;

  @ApiPropertyOptional({ enum: UserRoleDto })
  @IsOptional()
  @IsEnum(UserRoleDto)
  role?: UserRoleDto;

  @ApiPropertyOptional({
    example: ['contacts:view', 'deals:view'],
    isArray: true,
    type: String,
  })
  @IsOptional()
  @IsArray()
  permissions?: string[];
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customRoleId?: string;

  @ApiPropertyOptional({ enum: UserRoleDto })
  @IsOptional()
  @IsEnum(UserRoleDto)
  role?: UserRoleDto;

  @ApiPropertyOptional({ isArray: true, type: String })
  @IsOptional()
  @IsArray()
  permissions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;
}
