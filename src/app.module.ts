import { Module } from '@nestjs/common';
import { UserController } from './controllers/user';
import { UserServices } from './services/user';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './services/google.strategy';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  })],
  controllers: [UserController],
  providers: [UserServices, GoogleStrategy],
})
export class AppModule {}
