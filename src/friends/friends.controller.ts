import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { RespondFriendRequestDto } from './dto/respond-friend-request.dto';

@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  async listFriends(
    @GetUser() user: any,
    @Query('status') status?: 'pending' | 'accepted' | 'declined',
  ) {
    return this.friendsService.listFriendships(String(user._id), status);
  }

  @Get('requests/incoming')
  async listIncoming(@GetUser() user: any) {
    return this.friendsService.listPendingIncoming(String(user._id));
  }

  @Post('requests/:userId')
  async sendRequest(@GetUser() user: any, @Param('userId') userId: string) {
    return this.friendsService.sendFriendRequest(String(user._id), userId);
  }

  @Patch('requests/:id')
  async respond(
    @GetUser() user: any,
    @Param('id') friendshipId: string,
    @Body() dto: RespondFriendRequestDto,
  ) {
    return this.friendsService.respondToRequest(
      String(user._id),
      friendshipId,
      dto,
    );
  }

  @Delete(':userId')
  async remove(@GetUser() user: any, @Param('userId') otherUserId: string) {
    return this.friendsService.removeFriend(String(user._id), otherUserId);
  }
}
