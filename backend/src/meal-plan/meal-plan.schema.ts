import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { MealPlanDto } from './dto/meal-plan.dto';
import { MealsMealPlanDto } from './dto/meals.meal-plan.dto';

export type MealPlanDocument = MealPlan & Document;

@Schema()
export class MealPlan extends MealPlanDto {
    _id: ObjectId;
    @Prop({ required: true, unique: true})
    date: Date;
    @Prop()
    meals: MealsMealPlanDto;

    toJSON: () => MealPlan;
}

export const MealPlanSchema = SchemaFactory.createForClass(MealPlan);

MealPlanSchema.pre('save', async function (next) {
    try {
        if(this.isModified('meals') || this.isNew) {
            // Saturdays, there are only menu2, menu2Vegetarian and a dessert
            if (this.date.getDay() === 6) { // 0: Sunday; 1: Monday; ... 6: Saturday
                this.meals = {
                    menu2: this.meals.menu2,
                    menu2Vegetarian: this.meals.menu2Vegetarian,
                    dessert: this.meals.dessert
                }
            }
        }
        next();
    } catch (error) {
        next(error);
    }
});
