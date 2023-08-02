import { Cluster } from 'puppeteer-cluster';
import { CrawlDto } from './dto/crawl.dto';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as puppeteer from 'puppeteer';
import { FileUploadService } from '../fileUpload/fileUpload.service';
import { CrawledLink, ReturnedToFrontUrl } from './types/crawledLink.type';
import { checkIfFileUrlUtil } from '../../utils/urls/checkIfFileUrl.util';
import { CategoryEnum } from '../../enum/category.enum';
import { waitTillHTMLRendered } from '../../utils/puppeteer/waitTillHtmlRendered.util';

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
      maxConcurrency: 10, // Number of parallel tasks
      puppeteerOptions: launchOptions,
    });

    await cluster.task(async ({ page, data: url }) => {
      if (
        visitedUrls.has(url) ||
        urlCount >= 10 ||
        url.includes('?') ||
        url.includes('#') ||
        checkIfFileUrlUtil(url)
      ) {
        return;
      }
      visitedUrls.add(url);
      urlCount++;
      console.log('=>(crawler.service.ts:40) url', url);
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await waitTillHTMLRendered(page);

      const content = await this.getPageContent(page); // Gets the HTML content of the page
      const size = content.length;
      console.log('=>(crawler.service.ts:44) size', size);

      //Extract new URLs from page and queue them
      const newUrls = await this.extractNewLinks(page);
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
    const returnedToFrontUrls: ReturnedToFrontUrl[] = [];
    console.log('=>(crawler.service.ts:84) crawledData', crawledData);
    for (const data of crawledData) {
      const urlWithoutSlashes = data.url.replace(/\//g, '[]');
      console.log(
        '=>(crawler.service.ts:85) urlWithoutSlashes',
        urlWithoutSlashes,
      );
      const uploadFilePayload = {
        fileName: `${urlWithoutSlashes}.txt`,
        data: data.content,
        chatbot_id,
        char_length: data.size,
      };
      try {
        const newSource = await this.fileUploadService.uploadSingleFile(
          uploadFilePayload,
          CategoryEnum.WEB,
        );
        const linkCrawled = {
          size: data.size,
          url: data.url,
          _id: newSource._id.toString(),
        };
        returnedToFrontUrls.push(linkCrawled);
      } catch (e) {
        console.error(e);
        /**
         * @COMMENT stop the loop if error occurs in fileUploadService
         */
        return;
      }
    }
    return returnedToFrontUrls;
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
    const extractedText = await page.$eval('*', (el) => el.innerText);
    return extractedText;
    // return await page.evaluate(() => {
    //   const blackListNodes = [
    //     'data-phonemask-mask',
    //     'data-phonemask-country-code',
    //   ];
    //
    //   // This function checks if an element has any of the blacklisted tags.
    //   const hasBlacklistedTag = (element) => {
    //     return blackListNodes.some((tag) => element.hasAttribute(tag));
    //   };
    //
    //   // // Remove the div elements with blacklisted tags.
    //   // Array.from(document.querySelectorAll('div')).forEach((node) => {
    //   //   if (hasBlacklistedTag(node)) {
    //   //     node.remove();
    //   //   }
    //   // });
    //
    //   const extractedText = await page.$eval('*', (el) => el.innerText);
    //   console.log(extractedText);
    //
    //   const textNodes = nodes.map((node) => {
    //     if (node.nodeName.toLowerCase() === 'div') {
    //       // If this is a div, filter its childNodes to only take the Text nodes.
    //       return Array.from(node.childNodes)
    //         .filter((child) => (child as Node).nodeType === Node.TEXT_NODE)
    //         .map((textNode) => (textNode as Text).textContent)
    //         .join('\n');
    //     } else {
    //       // If this is not a div, just take its textContent as before.
    //       return node.textContent;
    //     }
    //   });
    //
    //   return textNodes.join('\n');
    // });
  }
}
