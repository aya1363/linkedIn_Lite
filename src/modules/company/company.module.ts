import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { CompanyRepository } from '../../DB/Repository/company.repository';

import { CompanyModel } from '../../DB/Model/Company.model'
import { S3Service } from 'src/common';
@Module({
  imports: [CompanyModel],
  controllers: [CompanyController],
  providers: [CompanyService, CompanyRepository,
    S3Service
  ],
})
export class CompanyModule {}
