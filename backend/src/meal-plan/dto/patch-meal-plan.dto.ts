import { ApiProperty } from '@nestjs/swagger';
import { MealsMealPlanDto } from './meals.meal-plan.dto';

export class PatchMealPlanDto {
    @ApiProperty({ required: false })
    meals: MealsMealPlanDto;
}
