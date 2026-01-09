import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { resolve } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedAuthenticationModule } from './common/modules';
import { GlobalExceptionFilter, S3Service } from './common';
import { APP_FILTER, RouterModule } from '@nestjs/core';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { UserModule } from './modules/user/user.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CompanyModule } from './modules/company/company.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TestResolver } from './graphql/test.resolver';
import { JobModule } from './modules/job/job.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve('./config/.env.development'),
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI as string, {
      serverSelectionTimeoutMS: 30000,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 40,
        },
      ],
    }),
    RouterModule.register([
      {
        path: 'company/:companyId',
        children: [
          {
            path: 'jobs',
            module: JobModule,
          },
        ],
      },
    ]),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      playground: true,
    }),
    SharedAuthenticationModule,
    AuthenticationModule,
    UserModule,
    CompanyModule,
    JobModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    S3Service,
    TestResolver,

    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
