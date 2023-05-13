import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { MealsOrderDto } from './meals.order.dto';

export class OrderDto {
    @ApiProperty()
    _id: ObjectId;
    @ApiProperty()
    employeeId: string;
    @ApiProperty()
    date: Date;
    @ApiProperty()
    totalPrice: Number;
    @ApiProperty()
    meals: MealsOrderDto;
}
