import { Controller, Post, Body, Get, HttpException, HttpStatus } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Controller()
export class MailerController {
  constructor(private readonly mailer: MailerService) {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Post('send')
  async send(@Body() payload: any) {
    const v = this.mailer.validate(payload);
    if (!v.ok) throw new HttpException({ error: v.error }, HttpStatus.BAD_REQUEST);

    const relayPayload = this.mailer.buildRelayPayload(payload);
    const res = await this.mailer.sendToRelay(relayPayload);
    if (res.accepted) return { status: 'accepted', details: res };

    throw new HttpException({ error: 'relay error', details: res }, HttpStatus.BAD_GATEWAY);
  }
}
