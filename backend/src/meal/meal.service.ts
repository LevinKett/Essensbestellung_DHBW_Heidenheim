import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateMealDto } from './dto/create-meal.dto';
import { PatchMealDto } from './dto/patch-meal.dto';
import { Meal, MealDocument } from './meal.schema';

@Injectable()
export class MealService {
    constructor(@InjectModel(Meal.name) private mealModel: Model<MealDocument>) {}

    findAllMeals() {
        return this.mealModel.find({}, { picture: 0 });
    }

    async findMealByName(name: string): Promise<MealDocument | undefined> {
        return await this.mealModel.findOne({ name }, { picture: 0 });
    }

    async findMealById(mealId: string): Promise<MealDocument | undefined> {
        const meal = await this.mealModel.findOne({ _id: this.castToObjectId(mealId) });
        if (!meal) {
            throw new NotFoundException({
                mealId: mealId,
                error: 'Meal not found.'
            });
        }
        return meal;
    }

    async hasMeal(name: string) {
        return !!(await this.findMealByName(name));
    }

    async ensureMeal(createMealDto: CreateMealDto, file: Express.Multer.File) {
        if (await this.hasMeal(createMealDto.name)) {
            return;
        }
        await this.createMeal(createMealDto, file);
    }

    async createMeal(createMealDto: CreateMealDto, file: Express.Multer.File) {
        const meal = new this.mealModel(createMealDto);
        if (file != null) {
            meal.picture = { 
                data: file.buffer, 
                contentType: file.mimetype 
            };
        }
        
        await meal.save();
        return meal;
    }

    async updateMeal(mealId: string, updateMealDto: PatchMealDto, file: Express.Multer.File) {
        const meal = await this.findMealById(mealId);
        Object.assign(meal, updateMealDto);
        if (file != null) {
            meal.picture = { 
                data: file.buffer, 
                contentType: file.mimetype 
            };
        }

        await meal.save();
        return meal;
    }

    async deleteMeal(mealId: string) {
        await this.mealModel.deleteOne({ _id: this.castToObjectId(mealId) });
    }

    castToObjectId(id: string) {
        try {
            return new mongoose.Types.ObjectId(id);
        } catch {
            throw new UnprocessableEntityException({
                id,
                error: 'Given id is not a valid mealId',
            });
        }
    }
}