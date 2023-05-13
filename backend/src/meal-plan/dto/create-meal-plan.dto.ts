import { ApiProperty } from '@nestjs/swagger';
import { MealsMealPlanDto } from './meals.meal-plan.dto';

export class CreateMealPlanDto {
    @ApiProperty({ required: true })
    date: Date;
    @ApiProperty({ required: false })
    meals: MealsMealPlanDto;
}
