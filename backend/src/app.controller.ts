import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';
import { PRIVACY_POLICY_HTML } from './legal/privacy.html';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Política de privacidad pública (requerida por Google Play).
  @Get('privacy')
  @Header('Content-Type', 'text/html; charset=utf-8')
  privacy(): string {
    return PRIVACY_POLICY_HTML;
  }
}
