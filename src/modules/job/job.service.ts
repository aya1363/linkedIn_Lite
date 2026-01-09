import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CompanyRepository, JobDocument, JobRepository,type UserDocument, UserRepository } from 'src/DB';
import { Types } from 'mongoose';

@Injectable()
export class JobService {
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly userRepository: UserRepository,
  ) {}
 async create(createJobDto: CreateJobDto,
    companyId: Types.ObjectId,
    user:UserDocument
  ):Promise<JobDocument>{
    console.log(createJobDto);
    const company = await this.companyRepository.findOne({
      filter: {
        _id: companyId, paranoid: false,
        approvedByAdmin: true,
        hrs: { $in: [user._id] },
        bannedAt: { $exists: false },
      }
    })
   if (!company ) {
   throw new ForbiddenException(
     'You are not authorized to add jobs for this company',
   );   }
   const existingJob = await this.jobRepository.findOne({
     filter: {
       companyId: new Types.ObjectId(companyId),
       jobTitle: createJobDto.jobTitle,
       closed: false,
     },
   });

   if (existingJob) {
     throw new ConflictException('Job already exists for this company');
   }
    const [job] = await this.jobRepository.create({
      data: 
       [ {
          ...createJobDto,
          addedBy: user._id,
          companyId: new Types.ObjectId(companyId),
        }],
      
    });
   if (!job) {
    throw new BadRequestException('fail to create job instance')
   }
    
    return job;
  }

  findAll() {
    return `This action returns all job`;
  }

  findOne(id: number) {
    return `This action returns a #${id} job`;
  }

  update(id: number, updateJobDto: UpdateJobDto) {
    console.log(updateJobDto);
    
    return `This action updates a #${id} job`;
  }

  remove(id: number) {
    return `This action removes a #${id} job`;
  }
}
