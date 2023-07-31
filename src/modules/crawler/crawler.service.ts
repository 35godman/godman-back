import { CrawlDto } from './dto/crawl.dto';
import { FileUploadService } from '../fileUpload/fileUpload.service';
import { CrawledLink } from './types/crawledLink.type';
import puppeteer from 'puppeteer';
import { Injectable } from '@nestjs/common';
import { CategoryEnum } from '../../enum/category.enum';

@Injectable()
export class CrawlerService {
  constructor(private fileUploadService: FileUploadService) {}

  async crawlWebLink(payload: CrawlDto) {
    const { weblink, chatbot_id } = payload;
    const urlsCrawled = new Set();
    const urlsContent: CrawledLink[] = [];

    // Launch the Puppeteer browser instance once

    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/usr/bin/chromium-browser',
    });

    const crawlSite = async (siteUrl) => {
      // Check if the URL has already been crawled before visiting
      if (urlsCrawled.has(siteUrl) || urlsCrawled.size >= 100) {
        return;
      }
      // Ignore URLs containing a '?'
      if (siteUrl.includes('?') || siteUrl.includes('#')) {
        return;
      }

      const page = await browser.newPage();

      await page.goto(siteUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });

      await page.waitForSelector('a');

      const pageText = await page.evaluate(() => {
        const textNodes = Array.from(
          document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span'),
        );
        return textNodes.map((node) => node.textContent).join(' ');
      });

      const urlWithoutSlashes = siteUrl.replace(/\//g, '[]');

      const uploadFilePayload = {
        fileName: `${urlWithoutSlashes}.txt`,
        data: pageText,
        chatbot_id,
        char_length: pageText.length,
      };
      const newSource = await this.fileUploadService.uploadSingleFile(
        uploadFilePayload,
        CategoryEnum.WEB,
      );
      urlsCrawled.add(siteUrl);
      const linkCrawled = {
        size: pageText.length,
        url: siteUrl,
        _id: newSource._id,
      };
      urlsContent.push(linkCrawled);
      const linksOnPage: string[] = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href]'));
        return anchors.map((anchor: HTMLAnchorElement) => anchor.href);
      });

      await page.close();

      // Use p-map to crawl links concurrently
      for (let link of linksOnPage) {
        const url = new URL(link, siteUrl).href;

        if (url.includes(weblink) && !urlsCrawled.has(url) && url !== siteUrl) {
          await crawlSite(url);
        }
      }
    };

    await crawlSite(weblink);

    await browser.close();

    return urlsContent;
  }
}
