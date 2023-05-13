import { Controller, Get, Post, Body, Patch, Param, Request, UseGuards, ConflictException, UseInterceptors, UploadedFile, Req, Res, NotFoundException } from '@nestjs/common';
import { MealService } from './meal.service';
import { MealDto } from './dto/meal.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../user/role.enum';
import { CreateMealDto } from './dto/create-meal.dto';
import { PatchMealDto } from './dto/patch-meal.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MealDocument } from './meal.schema';

@Controller('meal')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MealController {
    constructor(private readonly mealService: MealService) {}

    @Roles(Role.Employee, Role.CafeteriaOperator)
    @Get(':mealId')
    @ApiResponse({ type: () => MealDto })
    @ApiParam({ name: 'mealId' })
    async getMeal(@Request() request, @Param('mealId') mealId: string) {
        const meal = await this.mealService.findMealById(mealId);
        return this.mealToRest(meal);
    }
    
    @Roles(Role.Employee, Role.CafeteriaOperator)
    @Get('picture/:mealId')
    @ApiParam({ name: 'mealId' })
    async getMealPicture(@Request() request, @Param('mealId') mealId: string, @Req() req, @Res() res) {
        const meal = await this.mealService.findMealById(mealId);
        if (meal.picture == undefined || meal.picture.data == undefined) {
            throw new NotFoundException({ mealId: meal._id, error: "Picture not found." },
                "Picture not found.",
            );
        }
        
        res.setHeader("Content-Type", meal.picture.contentType);
        return res.send(meal.picture.data.buffer);
    }

    @Roles(Role.Employee, Role.CafeteriaOperator)
    @Get('')
    @ApiResponse({ type: () => MealDto, isArray: true })
    async getMeals() {
        const meals = await this.mealService.findAllMeals();
        return meals.map((meal) => this.mealToRest(meal));
    }

    @Roles(Role.CafeteriaOperator)
    @Post('')
    @ApiResponse({ type: () => MealDto })
    @ApiBody({ type: () => CreateMealDto })
    @UseInterceptors(FileInterceptor('file'))
    async create(@Body() createMealDto: CreateMealDto, @UploadedFile() file: Express.Multer.File) {
        if (await this.mealService.hasMeal(createMealDto.name)) {
            throw new ConflictException({ name: createMealDto.name, error: "Meal already exists." },
                "Meal already exists.",
            );
        }

        const meal = await this.mealService.createMeal(createMealDto, file);
        return this.mealToRest(meal);
    }

    @Roles(Role.CafeteriaOperator)
    @Patch(':mealId')
    @ApiBody({ type: () => PatchMealDto })
    @ApiParam({ name: 'mealId' })
    @UseInterceptors(FileInterceptor('file'))
    async patchMeal(@Param('mealId') mealId: string, @Body() patchMealDto: PatchMealDto, @UploadedFile() file: Express.Multer.File) {
        const meal = await this.mealService.updateMeal(mealId, patchMealDto, file);
        return this.mealToRest(meal);
    }
    
    private mealToRest(meal: MealDocument) {
        const { picture, ...result } = meal.toJSON();
        return result;
    }
}
