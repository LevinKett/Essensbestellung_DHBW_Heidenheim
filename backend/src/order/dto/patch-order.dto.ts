import { ApiProperty } from '@nestjs/swagger';
import { MealsOrderDto } from './meals.order.dto';

export class PatchOrderDto {
    @ApiProperty({ required: false })
    meals: MealsOrderDto
}
