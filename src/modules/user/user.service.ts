import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { DoneMessage, FolderEnum, RoleEnum, S3Service } from 'src/common';
import {  encrypt } from 'src/common/utils/security/cypto.security';
import { CompanyRepository, UserRepository } from 'src/DB';
import type { UserDocument } from 'src/DB/Model';
import { UpdateUserDto } from './dto/update-user.dto';
import { Lean } from 'src/DB/Repository/database.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly companyRepository: CompanyRepository,

    private readonly s3Service: S3Service,
  ) {}
  async profilePicture(
    file: Express.Multer.File,
    user: UserDocument,
  ): Promise<string> {
    const profilePicture = await this.s3Service.uploadFile({
      file,
      path: `${FolderEnum.User}/${user._id.toString()}`,
    });
    const updatedUser = await this.userRepository.findOneAndUpdate({
      filter: { _id: user._id },
      update: {
        profilePicture,
      },
    });

    if (!updatedUser) {
      throw new BadRequestException('Fail to provide a profile picture');
    }
    return profilePicture;
  }

  async profile(
    user: UserDocument,
    userId?: Types.ObjectId,
  ): Promise<Partial<UserDocument | Lean<UserDocument>>> {
    const profile = (await this.userRepository.findOne({
      filter: {
        _id: userId || user._id,
      },
    })) as UserDocument;
    if (!profile) {
      throw new NotFoundException('User not found');
    }

    const partialProfile: Partial<UserDocument> = {
      userName: profile.userName,
      phoneNumber: profile.phoneNumber,
      profilePicture: profile.profilePicture,
      coverPictures: profile.coverPictures,
    };

    if (userId && !user._id.equals(userId)) {
      return partialProfile;
    }
    return profile;
  }

  async coverPicture(
    files: Express.Multer.File[],
    user: UserDocument,
  ): Promise<string[]> {
    const urls = await this.s3Service.uploadFiles({
      files,
      path: `${FolderEnum.User}/${user._id.toString()}/cover`,
    });
    const updatedUser = await this.userRepository.findOneAndUpdate({
      filter: { _id: user._id },
      update: {
        coverPictures: urls,
      },
    });

    if (!updatedUser) {
      throw new BadRequestException(
        'fail to update user profile cover images ',
      );
    }
    if (user?.coverPictures) {
      await this.s3Service.DeleteFiles({ urls: user.coverPictures });
    }

    return urls;
  }

  async update(
    user: UserDocument,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument | Lean<UserDocument>> {
    console.log(user);
    const updatePayload: any = { ...updateUserDto };
    console.log(updatePayload);

    if (updateUserDto.phoneNumber) {
      updatePayload.phoneNumber = await encrypt(updateUserDto.phoneNumber);
    }
    const updatedUser = await this.userRepository.findOneAndUpdate({
      filter: {
        _id: user._id,
        bannedAt: { $exists: false },
      },
      update: updatePayload,
    });

    if (!updatedUser) {
      throw new BadRequestException('fail to update user instance');
    }

    return updatedUser;
  }

  async DeleteAttachment(user: UserDocument) {
    const User = await this.userRepository.findOne({
      filter: { _id: user._id },
    });
    if (!User) {
      throw new NotFoundException('fail to find user instance');
    }

    if (!User.profilePicture) {
      throw new NotFoundException('No attachment found to delete');
    }

    await this.s3Service.deleteFile({
      Key: User.profilePicture,
    });

    User.profilePicture = undefined;
    await User.save();

    return DoneMessage;
  }

  async freeze(userId: Types.ObjectId, user: UserDocument): Promise<string> {
    if (userId && user.role !== RoleEnum.admin) {
      throw new ForbiddenException('not authorized user');
    }
    const profile = await this.userRepository.findOneAndUpdate({
      filter: { _id: userId  },
      update: {
        deletedAt: new Date(),
        $unset: { restoredAt: '' },
        updatedBy: user._id,
        changeCredentialTime: new Date(),
      },
      options: { new: true },
    });

    if (!profile) {
      throw new NotFoundException('Fail to find matching user instance');
    }

    return DoneMessage;
  }

  async restore(
    userId: Types.ObjectId,
    user: UserDocument,
  ): Promise<UserDocument | Lean<UserDocument>> {
    if (userId && user.role !== RoleEnum.admin) {
      throw new ForbiddenException('not authorized user');
    }
    const profile = await this.userRepository.findOneAndUpdate({
      filter: {
        _id: userId || user._id,
        deletedAt: { $exists: true },
        paranoid: false,
      },
      update: {
        restoredAt: new Date(),
        $unset: { deletedAt: '' },
        updatedBy: user._id,
        changeCredentialTime: 1,
      },
      options: { new: true },
    });

    if (!profile) {
      throw new NotFoundException('Fail to restore matching profile instance');
    }

    return profile;
  }

  async remove(userId: Types.ObjectId, user: UserDocument): Promise<string> {

    const profile = await this.userRepository.findOneAndDelete({
      filter: {
        _id: userId,
        deletedAt: { $exists: true },
        paranoid: false,
      },
    });
    if (!profile) {
      throw new NotFoundException('fail to find matching  profile instance ');
    }
    await this.s3Service.deleteListFolderByPrefix({
      path: `${FolderEnum.User}/${user._id.toString()}`,
    });
    return DoneMessage;
  }

  //GraphQL

  async Dashboard({ page = 1, limit = 10 } = {}) {
    const users = await this.userRepository.find({
      filter: {},
      options: {
        skip: (page - 1) * limit,
        limit,
        sort: { createdAt: -1 },
      },
    });

    const companies = await this.companyRepository.find({
      filter: {},
      options: {
        skip: (page - 1) * limit,
        limit,
        sort: { createdAt: -1 },
      },
    });
    return {companies,users}
  }
}

