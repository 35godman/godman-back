import { Body, Controller, Post } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlDto } from './dto/crawl.dto';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Post('/crawl')
  crawlWeblink(@Body() crawlWeblink: CrawlDto) {
    return this.crawlerService.crawlWebLink(crawlWeblink);
  }
}
