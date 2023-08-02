import { Cluster } from 'puppeteer-cluster';
import { CrawlDto } from './dto/crawl.dto';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as puppeteer from 'puppeteer';
import { FileUploadService } from '../fileUpload/fileUpload.service';
import { CrawledLink } from './types/crawledLink.type';

dotenv.config();
@Injectable()
export class CrawlerService {
  constructor(private fileUploadService: FileUploadService) {}

  async startCrawling(payload: CrawlDto, chatbot_id: string) {
    const visitedUrls = new Set<string>();
    const { weblink } = payload;
    let launchOptions = null;
    let urlCount = 0;
    const crawledData: CrawledLink[] = [];
    if (process.env.NODE_ENV === 'production') {
      launchOptions = {
        headless: 'new',
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox'],
      };
    } else {
      launchOptions = {
        headless: 'new',
      };
    }

    const cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 5, // Number of parallel tasks
      puppeteerOptions: launchOptions,
    });

    await cluster.task(async ({ page, data: url }) => {
      if (visitedUrls.has(url) || urlCount >= 10) {
        return;
      }
      visitedUrls.add(url);
      urlCount++;
      console.log('=>(crawler.service.ts:40) url', url);
      const responsePage = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      console.log('=>(crawler.service.ts:42) responsePage', responsePage);

      const content = await this.getPageContent(page); // Gets the HTML content of the page
      const size = content.length;
      console.log('=>(crawler.service.ts:44) size', size);

      //Extract new URLs from page and queue them
      const newUrls = await this.extractNewLinks(page);
      console.log('=>(crawler.service.ts:48) newUrls', newUrls);
      for (const url of newUrls) {
        await cluster.queue(url);
      }

      // File upload code here
      const urlWithoutSlashes = url.replace(/\//g, '[]');
      const uploadFilePayload = {
        fileName: `${urlWithoutSlashes}.txt`,
        data: content,
        chatbot_id,
        char_length: size,
      };
      // Continue here with the file upload code and other operations...
      const pageData = { url: url, size: size, content: content };
      crawledData.push(pageData);
    });

    await cluster.queue(weblink);

    // Shutdown after everything is done
    await cluster.idle();
    await cluster.close();
    return crawledData;
  }

  async extractNewLinks(page: puppeteer.Page): Promise<string[]> {
    const currentUrl = page.url();
    const domain = new URL(currentUrl).hostname;
    return await page.$$eval(
      'a[href]',
      (links, domain) =>
        links
          .map((a) => a.href)
          .filter((url) => {
            try {
              return new URL(url).hostname === domain;
            } catch (err) {
              // Ignore invalid URLs
              return false;
            }
          }),
      domain,
    );
  }

  async getPageContent(page): Promise<string> {
    console.log('scraping');
    return await page.evaluate(() => {
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
      Array.from(document.querySelectorAll('style, script')).forEach((node) => {
        node.remove();
      });

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
  }
}
