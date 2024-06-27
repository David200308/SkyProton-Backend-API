import { Module } from '@nestjs/common';
import { UserController } from './controllers/user';
import { UserServices } from './services/user';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './services/oauth/google/google.strategy';
import { FacebookStrategy } from "./services/oauth/facebook/facebook.strategy";

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  })],
  controllers: [UserController],
  providers: [UserServices, GoogleStrategy, FacebookStrategy],
})
export class AppModule {}
