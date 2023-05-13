import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export let app: INestApplication;
async function bootstrap() {
    app = await NestFactory.create(AppModule);
    app.enableCors();
    app.setGlobalPrefix('api');

    const config = new DocumentBuilder()
        .setTitle('Essensbestellung')
        .setDescription('API-Beschreibung für das Backend der Essensbestellung')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

    await app.listen(process.env.PORT || 3001, "0.0.0.0");
}
bootstrap();
