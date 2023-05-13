import { ApiProperty } from '@nestjs/swagger';

export class CreateMealDto {
    @ApiProperty({ required: true })
    name: string;
    @ApiProperty({ required: true })
    price: Number;
}