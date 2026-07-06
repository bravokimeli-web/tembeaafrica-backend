import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { MessagingService } from './messaging.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('messaging')
@Controller('messaging')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagingController {
  constructor(private messagingService: MessagingService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations for current user' })
  getConversations(@CurrentUser() user: { userId: string }) {
    return this.messagingService.getConversations(user.userId)
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Start a new conversation' })
  startConversation(
    @CurrentUser() user: { userId: string },
    @Body('topic') topic: string,
    @Body('relatedBooking') relatedBooking?: string,
  ) {
    return this.messagingService.startConversation(user.userId, topic, relatedBooking)
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  getMessages(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Query('page') page?: number,
  ) {
    return this.messagingService.getMessages(id, user.userId, page)
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message in a conversation' })
  sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body('content') content: string,
    @Body('attachments') attachments?: string[],
  ) {
    return this.messagingService.sendMessage(id, user.userId, content, attachments)
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  getUnreadCount(@CurrentUser() user: { userId: string }) {
    return this.messagingService.getUnreadCount(user.userId)
  }
}
