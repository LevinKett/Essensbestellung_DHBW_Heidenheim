import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';
import { OrderDto } from './dto/order.dto';
import { MealService } from '../meal/meal.service';
import { MealsOrderDto } from './dto/meals.order.dto';
import { MealPlanService } from '../meal-plan/meal-plan.service';
import { app } from '../main';

export type OrderDocument = Order & Document;

@Schema()
export class Order extends OrderDto {
    _id: ObjectId;
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    employeeId: string; 
    @Prop({ required: true})
    date: Date;
    @Prop()
    totalPrice: Number;
    @Prop()
    meals: MealsOrderDto;

    toJSON: () => Order;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.pre('save', async function (next) {
    try {
        if(this.isModified('meals') || this.isModified("totalPrice") || this.isNew) {
            let mealPlanService: MealPlanService = app.get(MealPlanService);
            let mealService: MealService = app.get(MealService);
            this.totalPrice = 0;

            // get MealPlan object for the specific day
            let mealPlan = await mealPlanService.findMealPlanByDate(this.date);

            for await (var [mealType, quantity] of Object.entries(this.meals)) {
                console.log(`${mealType}: ${quantity}`);
                if (quantity == 0)
                    continue

                // get mealId from MealPlan via mealType (breakfast1, breakfast2, menu1, ...)
                let mealId = mealPlan.meals[mealType];

                // get meal with _id == mealId:
                let meal = await mealService.findMealById(mealId.toString());

                // ensure quantity has a legal value
                quantity = quantity < 0 ? 0 : Number(quantity.toFixed(0));

                // add up order positions
                this.totalPrice = Number(this.totalPrice) + Number(meal.price) * Number(quantity); // all casts are necessary ...
            };

            this.totalPrice = Number(this.totalPrice.toFixed(2));   // because of e. g. 12.400000000007 

        }
    } catch (error) {
        next(error);
    }
})
