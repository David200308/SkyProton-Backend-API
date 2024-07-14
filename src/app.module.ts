import { Module } from '@nestjs/common';
import { UserController } from './controllers/user';
import { UserServices } from './services/user';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './services/oauth/google/google.strategy';
import { FacebookStrategy } from "./services/oauth/facebook/facebook.strategy";
import { PaymentController } from './controllers/payment';
import { PaymentServices } from './services/payment';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  })],
  controllers: [UserController, PaymentController],
  providers: [UserServices, GoogleStrategy, FacebookStrategy, PaymentServices],
})
export class AppModule {}
