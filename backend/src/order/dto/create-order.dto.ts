import { ApiProperty } from '@nestjs/swagger';
import { MealsOrderDto } from './meals.order.dto';

export class CreateOrderDto {
    @ApiProperty({ required: true })
    employeeId: string; 
    @ApiProperty({ required: true })
    date: Date;
    @ApiProperty({ required: false })
    meals: MealsOrderDto
}
