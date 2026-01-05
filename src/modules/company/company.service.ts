import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
//import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyDocument, CompanyRepository, UserRepository, type UserDocument } from '../../DB';
import { DoneMessage, emailEvent, FolderEnum, RoleEnum, S3Service } from 'src/common';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Lean } from 'src/DB/Repository/database.repository';


@Injectable()
export class CompanyService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly s3Service: S3Service,
    private readonly userRepository: UserRepository,
  ) {}
  async create(
    createCompanyDto: CreateCompanyDto,
    user: UserDocument,
    file: Express.Multer.File,
  ): Promise<CompanyDocument | Lean<CompanyDocument>> {
    const checkCompanyDuplicate = await this.companyRepository.findOne({
      filter: {
        $or: [
          { email: createCompanyDto.email },
          { name: createCompanyDto.name },
        ],
        paranoid: false,
      },
    });
    if (checkCompanyDuplicate) {
      throw new ConflictException('duplicated company data ');
    }
    const hrs: Types.ObjectId[] = [...new Set(createCompanyDto.hrs)];
    if (
      hrs &&
      (await this.userRepository.find({ filter: { _id: { $in: hrs } } }))
        .length != hrs.length
    ) {
      throw new NotFoundException('some of mentioned hrs are not found');
    }
    const assetFolderId = randomUUID();
    const legalAttachment = await this.s3Service.uploadFile({
      file,
      path: `${FolderEnum.Company}/${assetFolderId}/legalAttachment`,
    });

    const [company] = await this.companyRepository.create({
      data: [
        {
          assetFolderId,
          legalAttachment,
          ...createCompanyDto,
          createdBy: user._id,
          hrs: hrs.map((hr) => {
            return Types.ObjectId.createFromHexString(hr as unknown as string);
          }),
        },
      ],
    });

    if (!company) {
      await this.s3Service.deleteFile({
        Key: legalAttachment,
      });
      throw new BadRequestException('fail to create company instance');
    }

    return company;
  }

  async approveCompany(
    companyId: Types.ObjectId,
    user: UserDocument,
  ): Promise<string> {
    if (user.role != RoleEnum.admin) {
      throw new ForbiddenException('not authorized to get this end point');
    }

    const company = await this.companyRepository.findOneAndUpdate({
      filter: {
        _id: companyId,
        legalAttachment: { $exists: true },
        approvedByAdmin: { $ne: true },
      },
      update: {
        approvedByAdmin: true,
      },
    });
    if (!company) {
      throw new NotFoundException('Company not found or already approved');
    }

    emailEvent.emit('Company-Approval', {
      to: company.email,
    });
    return DoneMessage;
  }

  async update(
    updateCompanyDto: UpdateCompanyDto,
    companyId: Types.ObjectId,
    user: UserDocument,
  ): Promise<CompanyDocument | Lean<CompanyDocument>> {
    const company = await this.companyRepository.findOne({
      filter: { _id: companyId },
    });
    if (!company?.createdBy.equals(user._id)) {
      throw new UnauthorizedException('Unauthorized user');
    }
    if (updateCompanyDto.name) {
      updateCompanyDto.name = updateCompanyDto.name.trim().toLowerCase();
    }

    if (updateCompanyDto.name) {
      const existingCompany = await this.companyRepository.findOne({
        filter: { name: updateCompanyDto.name, paranoid: false },
      });
      if (existingCompany) {
        throw new ConflictException('Company name already exists');
      }
    }

    const hrs: Types.ObjectId[] = [...new Set(updateCompanyDto.hrs)];
    if (
      hrs &&
      (await this.userRepository.find({ filter: { _id: { $in: hrs } } }))
        .length != hrs.length
    ) {
      throw new NotFoundException('some of mentioned hrs are not found');
    }
    const removedHrs = updateCompanyDto.removedHrs ?? [];
    delete updateCompanyDto.removedHrs;
    const updatedCompany = await this.companyRepository.findOneAndUpdate({
      filter: { _id: companyId },
      update: [
        {
          $set: {
            ...updateCompanyDto,
            updatedBy: user._id,
            hrs: {
              $setUnion: [
                {
                  $setDifference: [
                    '$hrs',
                    (removedHrs || []).map((hr) => {
                      return Types.ObjectId.createFromHexString(
                        hr as unknown as string,
                      );
                    }),
                  ],
                },
                (hrs || []).map((hr) => {
                  return Types.ObjectId.createFromHexString(
                    hr as unknown as string,
                  );
                }),
              ],
            },
          },
        },
      ],
    });
    if (!updatedCompany) {
      throw new NotFoundException('fail to find matching  Company instance ');
    }

    return updatedCompany;
  }

  async updateAsset(
    companyId: Types.ObjectId,
    user: UserDocument,
    file: Express.Multer.File,
    type: 'coverImage' | 'logo',
  ): Promise<CompanyDocument | Lean<CompanyDocument>> {
    const company = await this.companyRepository.findOne({
      filter: { _id: companyId, createdBy: user._id },
    });
    if (!company) throw new UnauthorizedException('Unauthorized user');

    const path = `${FolderEnum.Company}/${company.assetFolderId}/${type}`;
    const uploadedFile = await this.s3Service.uploadFile({ file, path });

    const updatedCompany = await this.companyRepository.findOneAndUpdate({
      filter: { _id: companyId },
      update: {
        [type]: uploadedFile,
        updatedBy: user._id,
      },
    });

    if (!updatedCompany) {
      await this.s3Service.deleteFile({ Key: uploadedFile });
      throw new NotFoundException(`Failed to update company ${type}`);
    }

    if (company[type]) {
      await this.s3Service.deleteFile({ Key: company[type] });
    }

    return updatedCompany;
  }

  async banCompany(companyId: Types.ObjectId, user: UserDocument):Promise<string>{
    if (user.role !== RoleEnum.admin) {
      throw new ForbiddenException('Only admin can ban company');
    }

    const company = await this.companyRepository.findOneAndUpdate({
      filter: {
        _id: companyId,
        bannedAt: { $exists: false },
        paranoid: false,
      },
      update: {
        bannedAt: new Date(),
        bannedBy: user._id,
      },
    });
    
    if (!company) {
      throw new BadRequestException('fail to Ban company instance');
    }

    return DoneMessage;
  }

  async unBanCompany(companyId: Types.ObjectId, user: UserDocument) {
    if (user.role !== RoleEnum.admin) {
      throw new ForbiddenException('Only admin can un ban company');
    }

    const company = await this.companyRepository.findOneAndUpdate({
      filter: {
        _id: companyId, bannedAt: { $exists: true },
        paranoid: false
      },
      update: {
        $unset: {
          bannedAt: 1,
          bannedBy: 1,
        },
      },
    });
    if (!company) {
      throw new BadRequestException('fail to un Ban company instance');
    }

    return company;
  }

  async findOne(companyId: Types.ObjectId, user: UserDocument) {
    if (user.role !== RoleEnum.admin) {
      throw new ForbiddenException('Only admin can un ban company');
    }

    const company = await this.companyRepository.findOne({
      filter: { _id: companyId },
    
    });
    if (!company) {
      throw new BadRequestException('fail to find company instance');
    }

    return company;
  }
  async remove(companyId: Types.ObjectId, user: UserDocument) {
    if (user.role !== RoleEnum.admin) {
      throw new ForbiddenException('Only admin can remove company');
    }

    const company = await this.companyRepository.findOneAndDelete({
      filter: {
        _id: companyId,
        bannedAt: { $exists: true },
        deletedAt: { $exists: false },
      },
    });

    if (!company) {
      throw new BadRequestException('Company not found or not banned');
    }

    await this.s3Service.deleteListFolderByPrefix({
      path: `${FolderEnum.Company}/${company.assetFolderId}`,
    });

    return DoneMessage;
  }
}
