import { ApiProperty } from '@nestjs/swagger';

export class PatchUserDto {
    @ApiProperty({ required: false })
    firstname?: string;
    @ApiProperty({ required: false })
    lastname?: string;
    @ApiProperty({ required: false })
    roles?: string[];
}
