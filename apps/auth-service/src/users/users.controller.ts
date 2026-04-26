import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, UseGuards, Request,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@Request() req: any) {
    return this.usersService.findOne(req.user.userId, req.user.tenantId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@Request() req: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, req.user.tenantId, dto);
  }

  @Post('staff')
  @ApiOperation({ summary: 'Create a new staff member (Admin only)' })
  async createStaff(@Request() req: any, @Body() dto: CreateUserDto) {
    return this.usersService.createStaff(req.user.tenantId, dto);
  }

  @Get('staff')
  @ApiOperation({ summary: 'List all staff in tenant' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async listStaff(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.usersService.listStaff(req.user.tenantId, +page, +limit, search);
  }

  @Get('staff/:id')
  @ApiOperation({ summary: 'Get a single staff member' })
  async getOne(@Request() req: any, @Param('id') id: string) {
    return this.usersService.findOne(id, req.user.tenantId);
  }

  @Put('staff/:id')
  @ApiOperation({ summary: 'Update staff member details' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, req.user.tenantId, dto);
  }

  @Patch('staff/:id/permissions')
  @ApiOperation({ summary: 'Update staff member permissions' })
  async updatePermissions(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { permissions: string[] },
  ) {
    return this.usersService.updatePermissions(id, req.user.tenantId, body.permissions);
  }

  @Delete('staff/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a staff member' })
  async deactivate(@Request() req: any, @Param('id') id: string) {
    return this.usersService.deactivate(id, req.user.tenantId);
  }
}
