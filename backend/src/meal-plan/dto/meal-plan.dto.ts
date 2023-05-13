import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { MealsMealPlanDto } from './meals.meal-plan.dto';

export class MealPlanDto {
    @ApiProperty()
    _id: ObjectId;
    @ApiProperty()
    date: Date;
    @ApiProperty()
    meals: MealsMealPlanDto;
}
