import { Module } from '@nestjs/common';
import { UserController } from './controllers/user';
import { UserServices } from './services/user';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './services/oauth/google/google.strategy';
import { FacebookStrategy } from "./services/oauth/facebook/facebook.strategy";
import { PaymentController } from './controllers/payment';
import { PaymentServices } from './services/payment';
import { PointsServices } from './services/points';
import { PointsController } from './controllers/points';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  })],
  controllers: [UserController, PaymentController, PointsController],
  providers: [UserServices, GoogleStrategy, FacebookStrategy, PaymentServices, PointsServices],
})
export class AppModule {}
