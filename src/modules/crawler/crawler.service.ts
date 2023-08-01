import { CrawlDto } from './dto/crawl.dto';
import { FileUploadService } from '../fileUpload/fileUpload.service';
import { CrawledLink } from './types/crawledLink.type';
import puppeteer from 'puppeteer';
import { Injectable } from '@nestjs/common';
import { CategoryEnum } from '../../enum/category.enum';
import * as dotenv from 'dotenv';
import { waitTillHTMLRendered } from '../../utils/puppeteer/waitTillHtmlRendered.util';
import { blackListNodes } from './nodes/blackList.nodes';
import { parseFromNodes } from './nodes/parseFrom.nodes';

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
        const blackListNodes = [
          'data-phonemask-mask',
          'data-phonemask-country-code',
        ];

        // This function checks if an element has any of the blacklisted tags.
        const hasBlacklistedTag = (element) => {
          return blackListNodes.some((tag) => element.hasAttribute(tag));
        };

        // Remove the div elements with blacklisted tags.
        Array.from(document.querySelectorAll('div')).forEach((node) => {
          if (hasBlacklistedTag(node)) {
            node.remove();
          }
        });

        // Remove all style and script tags.
        Array.from(document.querySelectorAll('style, script')).forEach(
          (node) => {
            node.remove();
          },
        );

        const nodes = Array.from(
          document.querySelectorAll(
            'p,h1,h2,h3,h4,h5,h6,span,a,li,strong,button,td,th,figcaption,label,title,option,blockquote,cite,em,b,i,mark,small,u,ins,del,s',
          ),
        );

        const textNodes = nodes.map((node) => {
          if (node.nodeName.toLowerCase() === 'div') {
            // If this is a div, filter its childNodes to only take the Text nodes.
            return Array.from(node.childNodes)
              .filter((child) => (child as Node).nodeType === Node.TEXT_NODE)
              .map((textNode) => (textNode as Text).textContent)
              .join('\n');
          } else {
            // If this is not a div, just take its textContent as before.
            return node.textContent;
          }
        });

        return textNodes.join('\n');
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
