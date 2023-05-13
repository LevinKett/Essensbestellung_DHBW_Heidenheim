import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { MealDto } from './dto/meal.dto';
import { PictureMealDto } from './dto/picture.meal.dto';

export type MealDocument = Meal & Document;

@Schema()
export class Meal extends MealDto {
    _id: ObjectId;
    @Prop({ required: true, unique: true })
    name: string;
    @Prop({ required: true })
    price: Number;
    @Prop({ required: false })
    picture: PictureMealDto;

    toJSON: () => Meal;
}

export const MealSchema = SchemaFactory.createForClass(Meal);

MealSchema.pre('save', async function (next) {
    try {
        if(this.isModified('price') || this.isNew) {
            this.price = Number(this.price.toFixed(2));
            next();
        }  
    } catch (error) {
        next(error);
    }
})