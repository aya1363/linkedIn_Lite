import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CompanyParamsDto } from '../company/dto/update-company.dto';
import { Auth, IResponse, RoleEnum, successResponse, User } from 'src/common';
import type{ UserDocument } from 'src/DB';
import { IJobResponse } from './entities/job.entity';

@UsePipes(new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true }))
@Controller()
export class JobController {
  constructor(private readonly jobService: JobService) {}
@Auth([RoleEnum.user])
  @Post()
async create(
  @Body() createJobDto: CreateJobDto,
  @Param() companyParamsDto: CompanyParamsDto,
  @User() user: UserDocument,
):Promise<IResponse<IJobResponse>> {
  const job = await this.jobService.create(createJobDto, companyParamsDto.companyId, user);
  return successResponse<IJobResponse>({data:{job},status:201})
}

  @Get()
  findAll() {
    return this.jobService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobService.update(+id, updateJobDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobService.remove(+id);
  }
}
