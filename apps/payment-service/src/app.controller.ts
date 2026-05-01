import { Controller, Get, Post, Body, Headers, HttpException, HttpStatus, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller()
export class AppController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  getHello(): string {
    return 'Payment Service is running!';
  }

  @Post('config')
  async saveConfig(@Body() body: any, @Headers('x-tenant-id') tenantId: string) {
    if (!body.gateway) throw new HttpException('Gateway is required', HttpStatus.BAD_REQUEST);
    return this.paymentService.saveConfig(tenantId || 'system', body);
  }

  @Get('configs')
  async getConfigs(@Headers('x-tenant-id') tenantId: string) {
    return this.paymentService.getConfigs(tenantId || 'system');
  }

  @Post('subscriptions')
  async createSubscription(
    @Body() body: any, 
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string
  ) {
    if (!body.planId || !body.planName) {
      throw new HttpException('planId and planName are required', HttpStatus.BAD_REQUEST);
    }
    
    return this.paymentService.createSubscription({
      tenantId: tenantId || body.tenantId,
      userId: userId || body.userId,
      userName: body.userName,
      userEmail: body.userEmail,
      planId: body.planId,
      planName: body.planName,
      amount: body.amount || 0,
      isTrial: body.isTrial || false,
    });
  }

  @Get('subscriptions')
  async getSubscriptions() {
    return this.paymentService.getAllSubscriptions();
  }

  @Get('invoices')
  async getInvoices() {
    return this.paymentService.getAllInvoices();
  }

  @Get('invoices/tenant')
  async getTenantInvoices(@Headers('x-tenant-id') tenantId: string) {
    return this.paymentService.getTenantInvoices(tenantId);
  }

  @Post('links')
  async createPaymentLink(@Headers('x-user-id') userId: string, @Body() body: any) {
    return this.paymentService.createPaymentLink(userId, body);
  }

  @Get('links')
  async getPaymentLinks() {
    return this.paymentService.getPaymentLinks();
  }

  @Get('links/:token/validate')
  async validatePaymentLink(@Param('token') token: string) {
    try {
      return await this.paymentService.validatePaymentLink(token);
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('links/:token/checkout')
  async checkoutPaymentLink(
    @Param('token') token: string,
    @Body() body: any
  ) {
    try {
      return await this.paymentService.usePaymentLink(token, body.customerData, body.paymentData);
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
