import { ApiProperty } from '@nestjs/swagger';

export class PatchMealDto {
    @ApiProperty({ required: true })
    name: string;
    @ApiProperty({ required: true })
    price: Number;
}