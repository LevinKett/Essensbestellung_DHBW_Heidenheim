import { Module, UnsupportedMediaTypeException } from '@nestjs/common';
import { MealService } from './meal.service';
import { MealController } from './meal.controller';
import { Meal, MealSchema } from './meal.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';

const pictureFilter = function (req, file: Express.Multer.File, callback: Function) {
    // accept pictures only
    if (!file.originalname.match(/.(jpg|jpeg|png)$/)) {
        callback(new UnsupportedMediaTypeException({ filetype: extname(file.originalname), error: 'Unsupported file type.' }), false);
    }
    callback(null, true);
};

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Meal.name, schema: MealSchema }]),
        MulterModule.registerAsync({
          useFactory: () => ({
            fileFilter: pictureFilter
          }),
        }),
    ],
    controllers: [MealController],
    providers: [MealService],
    exports: [MealService]
})
export class MealModule {}
