import { ApiProperty } from '@nestjs/swagger';

export class PictureMealDto {
    @ApiProperty()
    data: Buffer;
    @ApiProperty()
    contentType: string;
}