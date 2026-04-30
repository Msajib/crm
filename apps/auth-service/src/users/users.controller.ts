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

  @Get('me/notifications')
  @ApiOperation({ summary: 'Get current user notifications' })
  async getNotifications(@Request() req: any) {
    return this.usersService.getNotifications(req.user.userId, req.user.tenantId);
  }

  @Patch('me/notifications/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllNotificationsRead(@Request() req: any) {
    return this.usersService.markAllNotificationsRead(req.user.userId, req.user.tenantId);
  }

  @Delete('me/notifications')
  @ApiOperation({ summary: 'Clear all notifications' })
  async clearAllNotifications(@Request() req: any) {
    return this.usersService.clearAllNotifications(req.user.userId, req.user.tenantId);
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
    return this.usersService.listStaff(req.user.tenantId, req.user.userId, +page, +limit, search);
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

  @Post('staff/:id/reset-password')
  @ApiOperation({ summary: 'Reset staff member password (Admin only)' })
  async resetPassword(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { password: string },
  ) {
    return this.usersService.resetPassword(id, req.user.tenantId, body.password);
  }

  @Delete('staff/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a staff member' })
  async deactivate(@Request() req: any, @Param('id') id: string) {
    return this.usersService.deactivate(id, req.user.tenantId);
  }

  @Delete('staff/:id/permanent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete a staff member' })
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.usersService.remove(id, req.user.tenantId);
  }

  @Get('internal/staff-counts')
  @ApiOperation({ summary: 'Get staff counts for all tenants (Super Admin/Internal)' })
  async getStaffCounts() {
    return this.usersService.getStaffCounts();
  }

  @Get('internal/all-admins')
  @ApiOperation({ summary: 'Get all admin users across all tenants (Internal)' })
  async getAllAdmins() {
    return this.usersService.getAllAdmins();
  }

  @Post('internal/notify-super-admin')
  @ApiOperation({ summary: 'Internal: Notify all Super Admins' })
  async internalNotify(@Body() body: { title: string; message: string; type: string }) {
    if (!body.title || !body.message) {
      return { success: false, error: 'Missing title or message' };
    }
    return this.usersService.notifySuperAdmin(body.title, body.message, body.type || 'SYSTEM');
  }
}
