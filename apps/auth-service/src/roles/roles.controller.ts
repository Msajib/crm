import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesService } from './roles.service';

@ApiTags('roles')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a custom role' })
  create(@Request() req: any, @Body() data: { name: string; description?: string; permissions: string[] }) {
    return this.rolesService.create(req.user.tenantId, data);
  }

  @Get()
  @ApiOperation({ summary: 'List all custom roles' })
  findAll(@Request() req: any) {
    return this.rolesService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by ID' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.rolesService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a role' })
  update(
    @Request() req: any, 
    @Param('id') id: string, 
    @Body() data: { name?: string; description?: string; permissions?: string[] }
  ) {
    return this.rolesService.update(id, req.user.tenantId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.rolesService.remove(id, req.user.tenantId);
  }
}
