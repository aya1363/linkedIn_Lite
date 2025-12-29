import { Module } from '@nestjs/common';



import { OtpModel } from 'src/DB/Model';
import { OtpRepository } from 'src/DB/Repository';
import { SharedAuthenticationModule } from 'src/common/modules';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';

@Module({
  imports: [SharedAuthenticationModule, OtpModel],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, OtpRepository],
  exports: [SharedAuthenticationModule],
})
export class AuthenticationModule {}
