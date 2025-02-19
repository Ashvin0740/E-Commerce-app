import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import {
//   FastifyAdapter,
//   NestFastifyApplication,
// } from '@nestjs/platform-fastify';
import { NestExpressApplication } from '@nestjs/platform-express';
// import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

async function bootstrap() {
  //* start nest using Fastify
  // const app = await NestFactory.create<NestFastifyApplication>(
  //   AppModule,
  //   new FastifyAdapter(),
  // );

  /* LOGGER
  - 'log'
  - 'error'
  - 'warn'
  - 'debug'
  - 'verbose'
  */

  //* start nest using ExpressJS
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['warn', 'error'],
  });

  // Ensure JWT_SECRET is set
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  //* validation pipeline for validate incoming data
  app.useGlobalPipes(new ValidationPipe());

  //* morgan for logs
  app.use(morgan('dev')); // Use 'combined' instead of 'dev'

  //* user middleware as global
  // app.use(userAuth);

  // app.useGlobalGuards(new JwtAuthGuard());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription('API documentation for the E-Commerce application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  //* start nest server in port
  await app.listen(process.env.PORT || 3000);
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
}
bootstrap();
