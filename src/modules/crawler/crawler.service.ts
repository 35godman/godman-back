import { CrawlDto } from './dto/crawl.dto';
import { FileUploadService } from '../fileUpload/fileUpload.service';
import { CrawledLink } from './types/crawledLink.type';
import puppeteer from 'puppeteer';
import { Injectable } from '@nestjs/common';
import { CategoryEnum } from '../../enum/category.enum';
import * as dotenv from 'dotenv';
import { waitTillHTMLRendered } from '../../utils/puppeteer/waitTillHtmlRendered.util';

dotenv.config();
@Injectable()
export class CrawlerService {
  constructor(private fileUploadService: FileUploadService) {}

  async crawlWebLink(payload: CrawlDto, chatbot_id: string) {
    const { weblink } = payload;
    const urlsCrawled = new Set();
    const urlsContent: CrawledLink[] = [];

    // Launch the Puppeteer browser instance once
    let browser = null;
    if (process.env.NODE_ENV === 'production') {
      browser = await puppeteer.launch({
        headless: 'new',
        //for ubuntu only
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox'],
      });
    } else {
      browser = await puppeteer.launch({
        headless: 'new',
      });
    }

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

      await page.goto(siteUrl, { timeout: 60000, waitUntil: 'load' });
      await waitTillHTMLRendered(page);

      await page.waitForSelector('a');

      const pageText = await page.evaluate(() => {
        const nodes = Array.from(
          document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, div'),
        );

        const textNodes = nodes.map((node) => {
          if (node.nodeName.toLowerCase() === 'div') {
            // If this is a div, filter its childNodes to only take the Text nodes.
            return Array.from(node.childNodes)
              .filter((child) => child.nodeType === Node.TEXT_NODE)
              .map((textNode) => textNode.textContent)
              .join(' ');
          } else {
            // If this is not a div, just take its textContent as before.
            return node.textContent;
          }
        });

        const textContent = textNodes.join(' ');
        return textContent.replace(/ {2,}/g, ' ');
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
      console.log('=>(crawler.service.ts:82) linksOnPage', linksOnPage);

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
