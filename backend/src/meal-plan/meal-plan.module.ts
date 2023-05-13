import { Module } from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import { MealPlanController } from './meal-plan.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MealPlan, MealPlanSchema } from './meal-plan.schema';
import { MealModule } from '../meal/meal.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: MealPlan.name, schema: MealPlanSchema }]),
        MealModule
    ],
    controllers: [MealPlanController],
    providers: [MealPlanService],
    exports: [MealPlanService]
})
export class MealPlanModule {}
