import { CrawlDto } from './dto/crawl.dto';
import { FileUploadService } from '../fileUpload/fileUpload.service';
import { CrawledLink, ReturnedToFrontUrl } from './types/crawledLink.type';
import puppeteer from 'puppeteer';
import { Injectable } from '@nestjs/common';
import { CategoryEnum } from '../../enum/category.enum';
import * as dotenv from 'dotenv';
import * as pLimit from 'p-limit';
import { waitTillHTMLRendered } from '../../utils/puppeteer/waitTillHtmlRendered.util';
import { blackListNodes } from './nodes/blackList.nodes';
import { parseFromNodes } from './nodes/parseFrom.nodes';
import { Dataset, PuppeteerCrawler } from 'crawlee';

dotenv.config();
@Injectable()
export class CrawlerService {
  constructor(private fileUploadService: FileUploadService) {}

  // async crawlWebLink(payload: CrawlDto, chatbot_id: string) {
  //   const { weblink } = payload;
  //   const urlsCrawled = new Set();
  //   const urlsContent: CrawledLink[] = [];
  //
  //   // Launch the Puppeteer browser instance once
  //   let browser = null;
  //   if (process.env.NODE_ENV === 'production') {
  //     browser = await puppeteer.launch({
  //       headless: 'new',
  //       //for ubuntu only
  //       executablePath: '/usr/bin/chromium-browser',
  //       args: ['--no-sandbox'],
  //     });
  //   } else {
  //     browser = await puppeteer.launch({
  //       headless: 'new',
  //     });
  //   }
  //   const limit = pLimit(30);
  //
  //   const crawlSite = async (siteUrl) => {
  //     // Check if the URL has already been crawled before visiting
  //     if (urlsCrawled.has(siteUrl)) {
  //       console.log('site url already crawled');
  //       return;
  //     }
  //     // Ignore URLs containing a '?'
  //     if (siteUrl.includes('?') || siteUrl.includes('#')) {
  //       console.log('site url contains');
  //       return;
  //     }
  //
  //     const page = await browser.newPage();
  //
  //     try {
  //       console.log('=>(crawler.service.ts:149) siteUrl', siteUrl);
  //       await page.goto(siteUrl, { timeout: 60000, waitUntil: 'load' });
  //       //await waitTillHTMLRendered(page);
  //     } catch (error) {
  //       console.log(`Timeout error on ${siteUrl}`);
  //     }
  //
  //     const pageText = await page.evaluate(() => {
  //       const blackListNodes = [
  //         'data-phonemask-mask',
  //         'data-phonemask-country-code',
  //       ];
  //
  //       // This function checks if an element has any of the blacklisted tags.
  //       const hasBlacklistedTag = (element) => {
  //         return blackListNodes.some((tag) => element.hasAttribute(tag));
  //       };
  //
  //       // Remove the div elements with blacklisted tags.
  //       Array.from(document.querySelectorAll('div')).forEach((node) => {
  //         if (hasBlacklistedTag(node)) {
  //           node.remove();
  //         }
  //       });
  //
  //       // Remove all style and script tags.
  //       Array.from(document.querySelectorAll('style, script')).forEach(
  //         (node) => {
  //           node.remove();
  //         },
  //       );
  //
  //       const nodes = Array.from(
  //         document.querySelectorAll(
  //           'p,h1,h2,h3,h4,h5,h6,span,a,li,strong,button,td,th,figcaption,label,title,option,blockquote,cite,em,b,i,mark,small,u,ins,del,s',
  //         ),
  //       );
  //
  //       const textNodes = nodes.map((node) => {
  //         if (node.nodeName.toLowerCase() === 'div') {
  //           // If this is a div, filter its childNodes to only take the Text nodes.
  //           return Array.from(node.childNodes)
  //             .filter((child) => (child as Node).nodeType === Node.TEXT_NODE)
  //             .map((textNode) => (textNode as Text).textContent)
  //             .join('\n');
  //         } else {
  //           // If this is not a div, just take its textContent as before.
  //           return node.textContent;
  //         }
  //       });
  //
  //       return textNodes.join('\n');
  //     });
  //
  //     const urlWithoutSlashes = siteUrl.replace(/\//g, '[]');
  //
  //     const uploadFilePayload = {
  //       fileName: `${urlWithoutSlashes}.txt`,
  //       data: pageText,
  //       chatbot_id,
  //       char_length: pageText.length,
  //     };
  //     const newSource = await this.fileUploadService.uploadSingleFile(
  //       uploadFilePayload,
  //       CategoryEnum.WEB,
  //     );
  //     urlsCrawled.add(siteUrl);
  //     const linkCrawled = {
  //       size: pageText.length,
  //       url: siteUrl,
  //       _id: newSource._id,
  //     };
  //     urlsContent.push(linkCrawled);
  //     const linksOnPage: string[] = await page.evaluate(() => {
  //       const anchors = Array.from(document.querySelectorAll('a[href]'));
  //       return anchors.map((anchor: HTMLAnchorElement) => anchor.href);
  //     });
  //
  //     await page.close();
  //
  //     const linksPromises = linksOnPage
  //       .map((link) => {
  //         const url = new URL(link, siteUrl).href;
  //         if (
  //           url.includes(weblink) &&
  //           !urlsCrawled.has(url) &&
  //           url !== siteUrl
  //         ) {
  //           // Wrap the call to crawlSite with limit
  //           return limit(() => crawlSite(url));
  //         }
  //       })
  //       .filter(Boolean);
  //
  //     // This will only run 10 promises at a time
  //     await Promise.all(linksPromises);
  //   };
  //
  //   await crawlSite(weblink);
  //
  //   await browser.close();
  //
  //   return urlsContent;
  // }
  async crawleeSetup(payload: CrawlDto, chatbot_id: string) {
    const { weblink } = payload;
    console.log('=>(crawler.service.ts:161) weblink', weblink);
    const urlsContent: CrawledLink[] = [];
    let launchOptions = null;
    if (process.env.NODE_ENV === 'production') {
      launchOptions = {
        headless: 'new',
        //for ubuntu only
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox'],
      };
    } else {
      launchOptions = {
        headless: 'new',
      };
      // Create an instance of the PuppeteerCrawler class - a crawler
      // that automatically loads the URLs in headless Chrome / Puppeteer.
      const crawler = new PuppeteerCrawler({
        // Here you can set options that are passed to the launchPuppeteer() function.
        launchContext: {
          launchOptions,
        },

        // Stop crawling after several pages
        maxRequestsPerCrawl: parseInt(process.env.CRAWL_LIMIT),
        async requestHandler({ request, page, enqueueLinks, log }) {
          log.info(`Processing ${request.url}...`);
          const fileExtensionPattern = /\.[0-9a-z]+$/i; // regex pattern for file extension

          // Ignore URLs containing a '?'
          if (
            request.url.includes('?') ||
            request.url.includes('#') ||
            fileExtensionPattern.test(request.url)
          ) {
            console.log('site url contains ?/# or FILE');
            return;
          }

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
                  .filter(
                    (child) => (child as Node).nodeType === Node.TEXT_NODE,
                  )
                  .map((textNode) => (textNode as Text).textContent)
                  .join('\n');
              } else {
                // If this is not a div, just take its textContent as before.
                return node.textContent;
              }
            });

            return textNodes.join('\n');
          });

          urlsContent.push({
            url: request.url,
            size: pageText.length,
            content: pageText,
          });

          // Store the results to the default dataset.
          //await Dataset.pushData(data);

          // Find a link to the next page and enqueue it if it exists.
          const infos = await enqueueLinks({
            selector: 'a[href]',
          });

          if (infos.processedRequests.length === 0)
            log.info(`${request.url} is the last page!`);
        },

        // This function is called if the page processing failed more than maxRequestRetries+1 times.
        failedRequestHandler({ request, log }) {
          log.error(`Request ${request.url} failed too many times.`);
        },
      });

      await crawler.addRequests([weblink]);

      // Run the crawler and wait for it to finish.
      await crawler.run();

      const returnedToFrontUrls: ReturnedToFrontUrl[] = [];

      for (const url of urlsContent) {
        const urlWithoutSlashes = url.url.replace(/\//g, '[]');
        const uploadFilePayload = {
          fileName: `${urlWithoutSlashes}.txt`,
          data: url.content,
          chatbot_id,
          char_length: url.size,
        };
        const newSource = await this.fileUploadService.uploadSingleFile(
          uploadFilePayload,
          CategoryEnum.WEB,
        );
        const linkCrawled = {
          size: url.size,
          url: url.url,
          _id: newSource._id.toString(),
        };
        returnedToFrontUrls.push(linkCrawled);
      }

      console.log('Crawler finished.');
      return returnedToFrontUrls;
    }
  }
}
