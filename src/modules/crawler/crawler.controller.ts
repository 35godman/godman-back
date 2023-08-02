import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlDto } from './dto/crawl.dto';
import { AuthJWTGuard } from '../../guards/auth.guard';
import { ChatbotOwnerGuard } from '../../guards/chatbot-owner.guard';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @UseGuards(AuthJWTGuard)
  @Post('/crawl')
  crawlWeblink(
    @Body() crawlWeblink: CrawlDto,
    @Query('chatbot_id') chatbot_id: string,
  ) {
    return this.crawlerService.crawleeSetup(crawlWeblink, chatbot_id);
  }
}
