import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  Auth,
  cloudFileUpload,
  fileValidation,
  
  RoleEnum,
  storageEnum,
  successResponse,
  User,
} from 'src/common';
import type { UserDocument } from 'src/DB/Model';
import { PreferredLanguageInterceptor } from 'src/common/interceptors';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type {  IResponse } from 'src/common/interfaces';
import { ProfileResponse } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserParamDto, UserParamsDto } from './dto/create-user.dto';
import { Types } from 'mongoose';
import { endPoint } from './user.authorization';


@UsePipes(new ValidationPipe({whitelist:true , forbidNonWhitelisted:true}))

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseInterceptors(PreferredLanguageInterceptor)
  @Auth([RoleEnum.admin, RoleEnum.superAdmin, RoleEnum.user])
  @Get('{/:userId}')
  async profile(
    @User() user: UserDocument,
    @Param() params: UserParamsDto,
  ): Promise<IResponse<ProfileResponse>> {
    const userIdObj = params.userId
      ? new Types.ObjectId(params.userId)
      : undefined;

    const profile = await this.userService.profile(user, userIdObj);

    return successResponse<ProfileResponse>({
      data: { user: profile },
    });
  }

  @Auth([RoleEnum.admin, RoleEnum.superAdmin, RoleEnum.user])
  @Patch()
  async updateProfile(
    @User() user: UserDocument,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<IResponse<ProfileResponse>> {
    console.log({ user });
    const updatedUser = await this.userService.update(user, updateUserDto);

    return successResponse<ProfileResponse>({ data: { user: updatedUser } });
  }

  @UseInterceptors(
    FileInterceptor(
      'attachment',
      cloudFileUpload({
        storageApproach: storageEnum.memory,
        validation: fileValidation.image,
        fileSize: 2,
      }),
    ),
  )
  @Auth(endPoint.all)
  @Patch('profile-image')
  async profileImage(
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
    @User() user: UserDocument,
  ): Promise<IResponse<{ profilePicture: string }>> {
    //  console.log({file});

    const profilePicture = await this.userService.profilePicture(file, user);

    return successResponse({ data: { profilePicture } });
  }

  @UseInterceptors(
    FilesInterceptor(
      'attachments',
      2,

      cloudFileUpload({
        validation: fileValidation.image,
        storageApproach: storageEnum.disk,
      }),
    ),
  )
  @Auth(endPoint.all)
  @Patch('cover-images')
  async coverImages(
    @User() user: UserDocument,
    @UploadedFiles(new ParseFilePipe({ fileIsRequired: true }))
    files: Express.Multer.File[],
  ): Promise<IResponse<{ coverPictures: string[] }>> {
    const coverPictures = await this.userService.coverPicture(files, user);
    console.log({ files });
    return successResponse({ data: { coverPictures } });
  }

  @Auth(endPoint.create)
  @Delete(':userId/freeze')
  async freeze(
    @Param() params: UserParamDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    const userIdObj = new Types.ObjectId(params.userId);
    await this.userService.freeze(userIdObj, user);
    return successResponse();
  }

  @Auth(endPoint.create)
  @Patch(':userId/restore')
  async restore(
    @Param() userParamDto: UserParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse<ProfileResponse>> {
    const userIdObj = new Types.ObjectId(userParamDto.userId);
    const profile = await this.userService.restore(userIdObj, user);
    return successResponse<ProfileResponse>({ data: { user: profile } });
  }

  @Auth(endPoint.create)
  @Delete(':userId/remove')
  async remove(
    @Param() params: UserParamDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    const userIdObj = new Types.ObjectId(params.userId);
    await this.userService.remove(userIdObj, user);
    return successResponse();
  }

  @Auth(endPoint.all)
  @Patch('delete-attachment')
  async DeleteAttachment(
    @User() user: UserDocument,
  ): Promise<IResponse> {
    await this.userService.DeleteAttachment(user);
    return successResponse();
  }
}
