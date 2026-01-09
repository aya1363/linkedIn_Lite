import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { CompanyModel, CompanyRepository, JobModel, JobRepository } from 'src/DB';

@Module({
  imports:[JobModel,CompanyModel],
  controllers: [JobController],
  providers: [JobService, JobRepository,
    CompanyRepository
  ],
})
export class JobModule {}
