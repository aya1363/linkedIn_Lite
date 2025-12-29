import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, UsePipes, ValidationPipe, Patch } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { Auth, cloudFileUpload, fileValidation, IResponse, successResponse, User } from 'src/common';
import type{ UserDocument } from 'src/DB';
import { endPoint } from './company.authorization';
import { FileInterceptor } from '@nestjs/platform-express';
import { ICompanyResponse } from './entities/company.entity';
import { CompanyParamsDto, UpdateCompanyDto } from './dto/update-company.dto';
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @UseInterceptors(
    FileInterceptor(
      'LegalAttachment',
      cloudFileUpload({ validation: fileValidation.document }),
    ))
  @Auth(endPoint.create)
  @Post()
  async create(
    @UploadedFile(new ParseFilePipe()) file: Express.Multer.File,
    @Body() createCompanyDto: CreateCompanyDto,
    @User() user: UserDocument,
  ): Promise<IResponse<ICompanyResponse>> {
    const company = await this.companyService.create(
      createCompanyDto,
      user,
      file,
    );
    return successResponse<ICompanyResponse>({ data: { company } });
  }
  @Auth(endPoint.approve)
  @Patch(':companyId/approve-company')
  async approveCompany(
    @User() user: UserDocument,
    @Param() companyParamsDto: CompanyParamsDto,
  ) {
    await this.companyService.approveCompany(companyParamsDto.companyId, user);
    return successResponse();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(+id);
  }

  @Auth(endPoint.create)
  @Patch(':companyId')
  async updateCompany(
    @User() user: UserDocument,
    @Param() companyParamsDto: CompanyParamsDto,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<IResponse<ICompanyResponse>> {
    const company = await this.companyService.update(
      updateCompanyDto,
      companyParamsDto.companyId,
      user,
    );
    return successResponse<ICompanyResponse>({ data: { company } });
  }

  @UseInterceptors(
    FileInterceptor(
      'attachment',
      cloudFileUpload({ validation: fileValidation.image }),
    ),
  )
  @Auth(endPoint.create)
  @Patch(':companyId/coverImage')
  async updateAsset(
    @UploadedFile(new ParseFilePipe()) file: Express.Multer.File,
    @Param() params: CompanyParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse<ICompanyResponse>> {
    const company = await this.companyService.updateAsset(params.companyId, user, file, 'coverImage');

    return successResponse<ICompanyResponse>({ data: { company } });
  }

  @UseInterceptors(
    FileInterceptor(
      'attachment',
      cloudFileUpload({ validation: fileValidation.image }),
    ),
  )
  @Auth(endPoint.create)
  @Patch(':companyId/logo')
  async updateLogo(
    @UploadedFile(new ParseFilePipe()) file: Express.Multer.File,
    @Param() params: CompanyParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse<ICompanyResponse>> {
    const company = await this.companyService.updateAsset(params.companyId, user, file, 'logo');

    return successResponse<ICompanyResponse>({ data: { company } });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyService.remove(+id);
  }
}
