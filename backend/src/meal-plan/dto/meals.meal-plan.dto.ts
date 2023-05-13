import { ApiProperty } from "@nestjs/swagger";

export class MealsMealPlanDto { 
    // mealType: Meal._id
    @ApiProperty()
    breakfast1?: string;
    @ApiProperty()
    breakfast2?: string;
    @ApiProperty()
    breakfast3?: string;
    @ApiProperty()
    breakfast4?: string;
    @ApiProperty()
    menu1?: string;
    @ApiProperty()
    menu2: string;
    @ApiProperty()
    menu2Vegetarian: string;
    @ApiProperty()
    dessert: string;
    @ApiProperty()
    soup?: string;
    @ApiProperty()
    salad?: string;
}
