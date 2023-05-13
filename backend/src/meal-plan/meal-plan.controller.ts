import { Body, ConflictException, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MealService } from '../meal/meal.service';
import { Role } from '../user/role.enum';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { MealPlanDto } from './dto/meal-plan.dto';
import { PatchMealPlanDto } from './dto/patch-meal-plan.dto';
import { MealPlanService } from './meal-plan.service';

@Controller('meal-plan')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MealPlanController {
    constructor(private readonly mealPlanService: MealPlanService,
                private readonly mealService: MealService
        ) {}

    @Roles(Role.Employee, Role.CafeteriaOperator)
    @Get('id/:mealPlanId')
    @ApiResponse({ type: () => MealPlanDto })
    @ApiParam({ name: 'mealPlanId' })
    async getMealPlan(@Request() request, @Param('mealPlanId') mealPlanId: string) {
        return (await this.mealPlanService.findMealPlanById(mealPlanId)).toJSON();
    }

    @Roles(Role.Employee, Role.CafeteriaOperator)
    @Get('date/:date')
    @ApiResponse({ type: () => MealPlanDto })
    @ApiParam({ name: 'date' })
    async getMealPlanByDate(@Request() request, @Param('date') date: string) {
        return await this.mealPlanService.findMealPlanByDate(new Date(date));
    }

    @Roles(Role.Employee, Role.CafeteriaOperator)
    @Get('')
    @ApiResponse({ type: () => MealPlanDto, isArray: true })
    async getMealPlans() {
        return await this.mealPlanService.findAllMealPlans();
    } 
    

    @Roles(Role.CafeteriaOperator)
    @Post('')
    @ApiResponse({ type: () => MealPlanDto })
    @ApiBody({ type: () => CreateMealPlanDto })
    async createMealPlan(@Body() createMealPlanDto: CreateMealPlanDto) {
        if (await this.mealPlanService.hasMealPlan(createMealPlanDto.date)) {
            throw new ConflictException({ date: createMealPlanDto.date, error: 'Meal plan already exists for this date' },
                'Meal plan already exists for this date',
            );
        }
        return (await this.mealPlanService.createMealPlan(createMealPlanDto)).toJSON(); 
    }

    @Roles(Role.CafeteriaOperator)
    @Patch('id/:mealPlanId')
    @ApiBody({ type: () => PatchMealPlanDto })
    @ApiParam({ name: 'mealPlan' })
    async patchMealPlan(@Param('mealPlanId') mealPlanId: string, @Body() patchMealPlanDto: PatchMealPlanDto) {
        return (await this.mealPlanService.updateMealPlan(mealPlanId, patchMealPlanDto)).toJSON();
    }

    @Roles(Role.Employee, Role.CafeteriaOperator)
    @Get('current-week')
    @ApiResponse({ type: () => MealPlanDto, isArray: true })
    async getMealPlansByWeekNumber() {
        return await this.mealPlanService.findCurrentMealPlan(new Date());
    } 
}
