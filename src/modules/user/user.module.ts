import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PreAuth } from 'src/common/middleware/authentication.middleware';
import { S3Service } from 'src/common';
import { UsersResolver } from './user.resolver';
import { CompanyModel, CompanyRepository } from 'src/DB';

@Module({
  imports: [CompanyModel],
  controllers: [UserController],
  providers: [UserService, S3Service,
    UsersResolver,
    CompanyRepository

  ],
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PreAuth).forRoutes(UserController);
  }
}
