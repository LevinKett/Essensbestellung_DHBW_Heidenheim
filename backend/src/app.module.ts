import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SharedModule, LoggerService } from './shared/shared.module';
import { MealModule } from './meal/meal.module';
import { OrderModule } from './order/order.module';
import { MealPlanModule } from './meal-plan/meal-plan.module';

@Module({
  imports: [
      SharedModule,
      ConfigModule.forRoot(),
      MongooseModule.forRootAsync({
          imports: [ConfigModule, SharedModule],
          inject: [ConfigService, LoggerService],
          useFactory: async (configService: ConfigService, logger: LoggerService): Promise<MongooseModuleOptions> => {
              logger.setContext("MongooseModule.factory")
              const uri = configService.get<string>('MONGODB_URI')
              logger.log((`Use Mongodb uri: ${uri}`));
              return {
                  uri,
                  user: configService.get < string > ('MONGODB_USER'),
                  pass: configService.get < string > ('MONGODB_PASS'),
              };
          },
      }),
      AuthModule,
      UserModule,
      MealModule,
      OrderModule,
      MealPlanModule,
  ],
  controllers: [],
  providers: [MealModule],
})
export class AppModule {}
