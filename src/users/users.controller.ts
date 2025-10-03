import { Controller, Get, Patch, UseGuards, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@GetUser() user) {
    return this.usersService.findById(user._id);
  }

  @Patch('me')
  updateMe(@GetUser() user, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user._id, dto);
  }

  // example set subscription endpoint
  @Patch('me/subscription')
  setSubscription(@GetUser() user, @Body('months') months: number = 1) {
    return this.usersService.setSubscription(user._id, new Date(), months);
  }
}
