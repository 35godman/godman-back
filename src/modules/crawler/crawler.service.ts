import { Cluster } from 'puppeteer-cluster';
import { CrawlDto } from './dto/crawl.dto';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as puppeteer from 'puppeteer';
import { FileUploadService } from '../FILES/fileUpload/fileUpload.service';
import { CrawledLink, ReturnedToFrontUrl } from './types/crawledLink.type';
import { checkIfFileUrlUtil } from '../../utils/urls/checkIfFileUrl.util';
import { CategoryEnum } from '../../enum/category.enum';
import { waitTillHTMLRendered } from '../../utils/puppeteer/waitTillHtmlRendered.util';
import { SourcesService } from '../chatbot/sources/sources.service';
import { convert } from 'html-to-text';
import { normalizeUrl } from '../../utils/urls/normalizeUrl.util';

dotenv.config();
@Injectable()
export class CrawlerService {
  constructor(
    private fileUploadService: FileUploadService,
    private chatbotSourceService: SourcesService,
  ) {}

  async startCrawling(payload: CrawlDto, chatbot_id: string) {
    const sources = await this.chatbotSourceService.findByChatbotId(chatbot_id);

    sources.crawling_status = 'PENDING';
    await sources.save();
    const visitedUrls = new Set<string>();
    const { weblink, filter, alreadyUploadedLinks } = payload;
    const onlyCrawledFileNames = alreadyUploadedLinks.map((url) => {
      return url.originalName.replace(/\[]/g, '/').replace('.txt', '');
    });
    if (
      !onlyCrawledFileNames.includes(weblink.replace(/\/$/, '')) &&
      !onlyCrawledFileNames.includes(weblink)
    ) {
      visitedUrls.add(weblink);
    }

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
      maxConcurrency: parseInt(process.env.MAX_CONCURRENCIES), // Number of parallel tasks
      puppeteerOptions: launchOptions,
    });

    await cluster.task(async ({ page, data: url }) => {
      urlCount++;
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await waitTillHTMLRendered(page);

      const content = await this.getPageContent(page); // Gets the HTML content of the page
      const size = content.length;

      //Extract new URLs from page and queue them
      const newUrls = await this.extractNewLinks(page);
      for (const url of newUrls) {
        if (
          checkIfFileUrlUtil(url) ||
          visitedUrls.has(url) ||
          onlyCrawledFileNames.includes(url.replace(/\/$/, '')) ||
          !this.checkValidUrl(url, filter)
        ) {
        } else {
          visitedUrls.add(url);
          if (visitedUrls.size <= parseInt(process.env.CRAWL_LIMIT)) {
            console.log(`queing task ${url}`);
            await cluster.queue(url);
          } else {
            // console.log('Task stopped successfully');
          }
        }
      }
      if (
        filter.some((filterString) =>
          url.toLowerCase().includes(filterString.toLowerCase()),
        )
      ) {
        const pageData = { url: url, size: size, content: content };
        crawledData.push(pageData);
      }
    });

    await cluster.queue(weblink);

    // Shutdown after everything is done
    await cluster.idle();
    await cluster.close();
    const returnedToFrontUrls: ReturnedToFrontUrl[] = [];
    const uniqueUrlsSet = new Set<string>();
    const uniqueCrawledData = crawledData.filter((data) => {
      // If the URL has not been seen before, add it to the set and keep the item
      if (!uniqueUrlsSet.has(normalizeUrl(data.url))) {
        uniqueUrlsSet.add(data.url);
        return true;
      }
      // If the URL has been seen before, filter out the item
      return false;
    });
    for (const data of uniqueCrawledData) {
      const urlWithoutSlashes = data.url.replace(/\//g, '[]');
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
        sources.crawling_status = 'FAILED';
        await sources.save();
        /**
         * @COMMENT stop the loop if error occurs in fileUploadService
         */
        return;
      }
    }
    sources.crawling_status = 'COMPLETED';
    await sources.save();
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
    const pureHtml = await page.content();
    const convertOptions = {
      selectors: [{ selector: 'a', format: 'skip' }],
    };
    return convert(pureHtml, convertOptions);
  }

  checkValidUrl(url: string, filter: string[]): boolean {
    if (url.includes('?')) return false;
    if (url.includes('#')) return false;
    if (!filter || filter.length === 0) return true;
    return true;
  }
}
