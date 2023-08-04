import { Cluster } from 'puppeteer-cluster';
import { CrawlDto } from './dto/crawl.dto';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as puppeteer from 'puppeteer';
import { FileUploadService } from '../FILES/fileUpload/fileUpload.service';
import { CrawledLink } from './types/crawledLink.type';
import { checkIfFileUrlUtil } from '../../utils/urls/checkIfFileUrl.util';
import { CategoryEnum } from '../../enum/category.enum';
import { waitTillHTMLRendered } from '../../utils/puppeteer/waitTillHtmlRendered.util';
import { ChatbotSourcesService } from '../chatbot/chatbotSources.service';
import { convert } from 'html-to-text';
import * as pMap from 'p-map';

dotenv.config();
@Injectable()
export class CrawlerService {
  constructor(
    private fileUploadService: FileUploadService,
    private chatbotSourceService: ChatbotSourcesService,
  ) {}

  async startCrawling(payload: CrawlDto, chatbot_id: string) {
    const sources = await this.chatbotSourceService.findByChatbotId(chatbot_id);
    const onlyCrawledFileNames = sources.website.map(
      (item) => item.originalName,
    );
    sources.crawling_status = 'PENDING';
    await sources.save();
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
      retryLimit: 5,
      maxConcurrency: parseInt(process.env.MAX_CONCURRENCIES), // Number of parallel tasks
      puppeteerOptions: launchOptions,
    });

    await cluster.task(async ({ page, data: url }) => {
      if (
        visitedUrls.has(url) ||
        onlyCrawledFileNames.includes(url) ||
        urlCount >= parseInt(process.env.CRAWL_LIMIT) ||
        url.includes('?') ||
        url.includes('#') ||
        checkIfFileUrlUtil(url)
      ) {
        return;
      }
      visitedUrls.add(url);
      urlCount++;
      console.log('=>(crawler.service.ts:40) url', url);
      console.log(visitedUrls.size);
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await waitTillHTMLRendered(page);

      const content = await this.getPageContent(page); // Gets the HTML content of the page
      const size = content.length;

      //Extract new URLs from page and queue them
      const newUrls = await this.extractNewLinks(page);
      for (const url of newUrls) {
        await cluster.queue(url);
      }

      const pageData = { url: url, size: size, content: content };
      crawledData.push(pageData);
    });

    await cluster.queue(weblink);

    // Shutdown after everything is done
    await cluster.idle();
    await cluster.close();
    console.log('=>(crawler.service.ts:90) crawledData', crawledData);
    const mapper = async (data) => {
      const urlWithoutSlashes = data.url.replace(/\//g, '[]');
      const uploadFilePayload = {
        fileName: `${urlWithoutSlashes}.txt`,
        data: data.content,
        chatbot_id,
        char_length: data.size,
      };
      console.log('=>(crawler.service.ts:97) uploadFilePayload', data);
      try {
        const newSource = await this.fileUploadService.uploadSingleFile(
          uploadFilePayload,
          CategoryEnum.WEB,
        );
        return {
          size: data.size,
          url: data.url,
          _id: newSource._id.toString(),
        };
      } catch (e) {
        console.error(e);
        sources.crawling_status = 'FAILED';
        await sources.save();
        throw e; // propagate the error so p-map can stop
      }
    };
    sources.crawling_status = 'COMPLETED';
    await sources.save();
    return await pMap(crawledData, mapper, {
      concurrency: 10,
    });
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
      wordwrap: 130,
    };
    return convert(pureHtml, convertOptions);
  }
}
