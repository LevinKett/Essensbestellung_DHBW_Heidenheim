import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { PictureMealDto } from './picture.meal.dto';

export class MealDto {
    @ApiProperty()
    _id: ObjectId;
    @ApiProperty()
    name: string;
    @ApiProperty()
    price: Number;
    @ApiProperty()
    picture: PictureMealDto;
}