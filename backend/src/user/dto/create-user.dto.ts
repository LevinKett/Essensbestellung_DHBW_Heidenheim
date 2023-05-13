import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ required: true })
    email: string;
    @ApiProperty({ required: true })
    employeeNumber: Number;
    @ApiProperty({ required: true })
    password: string;

    @ApiProperty({ required: false })
    firstname?: string;
    @ApiProperty({ required: false })
    lastname?: string;
    @ApiProperty({ required: false })
    roles?: string[];
}
