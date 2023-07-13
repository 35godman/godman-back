import { Injectable } from '@nestjs/common';
import axios from 'axios';
import cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { URL } from 'url';
import { FileUploadService } from '../fileUpload/fileUpload.service';
import { CrawlDto } from './dto/crawl.dto';

@Injectable()
export class CrawlerService {
  constructor(private fileUploadService: FileUploadService) {}

  async crawlWebLink(payload: CrawlDto) {
    const { weblink, chatbot_id } = payload;
    const urlsCrawled = new Set();
    const urlsContent = {
      size: 0,
    };
    const crawlSite = async (siteUrl) => {
      const browser = await puppeteer.launch({
        headless: 'new',
      });
      const page = await browser.newPage();

      await page.goto(siteUrl);

      await page.waitForSelector('p');

      const pageText = await page.evaluate(() => {
        const textNodes = Array.from(
          document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span'),
        );
        return textNodes.map((node) => node.textContent).join(' ');
      });

      // urlsContent[siteUrl] = pageText;
      urlsContent.size = pageText.length;
      const urlWithoutSlashes = siteUrl.replace(/\//g, '');

      const uploadFilePayload = {
        fileName: `${urlWithoutSlashes}.txt`,
        data: pageText,
        chatbot_id,
      };
      await this.fileUploadService.uploadFile(uploadFilePayload);
      urlsCrawled.add(siteUrl);

      const linksOnPage: string[] = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href]'));
        return anchors.map((anchor: HTMLAnchorElement) => anchor.href);
      });

      await browser.close();

      for (let link of linksOnPage) {
        const url = new URL(link, siteUrl).href;

        if (url.includes(weblink) && !urlsCrawled.has(url) && url !== siteUrl) {
          await crawlSite(url);
        }
      }
    };

    await crawlSite(weblink);

    return urlsContent;
  }
}
