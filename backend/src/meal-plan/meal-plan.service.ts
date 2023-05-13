import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { MealPlanDto } from './dto/meal-plan.dto';
import { PatchMealPlanDto } from './dto/patch-meal-plan.dto';
import { MealPlan, MealPlanDocument } from './meal-plan.schema';

@Injectable()
export class MealPlanService {
    constructor(@InjectModel(MealPlan.name) private mealPlanModel: Model<MealPlanDocument>) {}

    findAllMealPlans() {
        return this.mealPlanModel.find({});
    }

    async findMealPlanByDate(date: Date): Promise<MealPlanDocument | undefined> { 
        const mealPlan = await this.mealPlanModel.findOne({ date: date });
        if (!mealPlan) {
            throw new NotFoundException({
                date: date,
                error: 'Meal plan not found.'
            });
        }
        return mealPlan;
    }

    getWeekNumber(date: Date): Number {
        var start = new Date(date.getFullYear(), 0, 1); // January 1st of given year
        var days = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
        return Math.ceil(days / 7);;
    }

    //Returns dates of all days of current week. Note: Calling method for a sunday will return upcoming week only.
    getWeekDates(date: Date): Date[] {

        const msPerDay = 24 * 60 * 60 * 1000;
        var daysOfWeek: Date[] = [];

        var c = 0; //used to count backwards till Monday

        while((new Date(date.getTime() - c* msPerDay).getUTCDay() > 0)) {
            daysOfWeek.push(new Date(date.getTime() - c * msPerDay))
            c++;
        }
        c = 1;
        while(7-c >= date.getUTCDay()) {
            daysOfWeek.push(new Date(date.getTime() + c * msPerDay))
            //console.log(new Date(date.getTime() + c* msPerDay).getUTCDay())
            c++;
        }

        return daysOfWeek;
    }

    async findCurrentMealPlan(date: Date) {

        var days = this.getWeekDates(date)

        var mealPlans: MealPlanDto[] = []

        for await (var day of days) {
            
            var year = day.getFullYear();
            var month;
            var dayOfMonth;
    
            if((day.getUTCMonth()+1) < 10) {
                month = "0" + (day.getUTCMonth()+1)
            }
            else {
                month = day.getUTCMonth()+1
            }
                
            if(day.getDate() < 10) {
                dayOfMonth = "0" + (day.getDate())
            }
            else {
                dayOfMonth = day.getDate()
            }
            
            let mealPlan

            try {
                mealPlan = await this.findMealPlanByDate(new Date(`${year}-${month}-${dayOfMonth}`))
            }
            catch (error) {
                console.log(`No Meal-Plan for date:  + ${year}-${month}-${dayOfMonth}`)
            }

            if (mealPlan) {
                mealPlans.push(mealPlan)
            }
            
            
            console.log(`${year}-${month}-${dayOfMonth}`)
        }
        return mealPlans
    }

    async findMealPlanById(mealPlanId: string): Promise<MealPlanDocument | undefined> {
        const mealPlan = await this.mealPlanModel.findOne({ _id: this.castToObjectId(mealPlanId) });
        if (!mealPlan) {
            throw new NotFoundException({
                mealPlanId: mealPlanId,
                error: 'Meal plan not found.'
            });
        }
        return mealPlan;
    }

    async hasMealPlan(date: Date) {
        try {
            await this.findMealPlanByDate(date);
            return true;
        } catch (NotFoundEception) {
            return false;
        }
    }

    async createMealPlan(createMealPlanDto: CreateMealPlanDto) {
        const mealPlanDocument = new this.mealPlanModel(createMealPlanDto);
        await mealPlanDocument.save();
        return mealPlanDocument;
    }

    async updateMealPlan(mealPlanId: string, patchMealPlanDto: PatchMealPlanDto) {
        const mealPlan = await this.findMealPlanById(mealPlanId);
        Object.assign(mealPlan, patchMealPlanDto);
        await mealPlan.save();
        return mealPlan;
    }

    async deleteMealPlan(mealPlanId: string) {
        await this.mealPlanModel.deleteOne({ _id: this.castToObjectId(mealPlanId) });
    }

    castToObjectId(id: string) {
        try {
            return new mongoose.Types.ObjectId(id);
        } catch {
            throw new UnprocessableEntityException({
                id,
                error: 'Given id is not a valid mealPlanId',
            });
        }
    }
}
