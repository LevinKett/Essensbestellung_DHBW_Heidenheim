import { ApiProperty } from "@nestjs/swagger";

export class MealsOrderDto {
    // mealType: qunatity
    @ApiProperty() 
    breakfast1: Number;
    @ApiProperty()
    breakfast2: Number;
    @ApiProperty()
    breakfast3: Number;
    @ApiProperty()
    breakfast4: Number;
    @ApiProperty()
    menu1: Number;
    @ApiProperty()
    menu2: Number;
    @ApiProperty()
    menu2Vegetarian: Number;
    @ApiProperty()
    dessert: Number;
    @ApiProperty()
    soup: Number;
    @ApiProperty()
    salad: Number;
}

