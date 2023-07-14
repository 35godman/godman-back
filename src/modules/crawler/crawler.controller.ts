import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlDto } from './dto/crawl.dto';
import { AuthJWTGuard } from '../../guards/auth.guard';
import { ChatbotOwnerGuard } from '../../guards/chatbot-owner.guard';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @UseGuards(AuthJWTGuard, ChatbotOwnerGuard)
  @Post('/crawl')
  crawlWeblink(@Body() crawlWeblink: CrawlDto) {
    return this.crawlerService.crawlWebLink(crawlWeblink);
  }
}
