// import { CrawlDto } from "./dto/crawl.dto";
// import { CrawledLink, ReturnedToFrontUrl } from "./types/crawledLink.type";
// import { AutoscaledPool, PuppeteerCrawler } from "crawlee";
// import { HttpException, HttpStatus } from "@nestjs/common";
//
// async crawleeSetup(payload: CrawlDto, chatbot_id: string) {
//   const { weblink } = payload;
//
//   const urlsContent: CrawledLink[] = [];
//   let launchOptions = null;
//   if (process.env.NODE_ENV === 'production') {
//     launchOptions = {
//       headless: 'new',
//       //for ubuntu only
//       executablePath: '/usr/bin/chromium-browser',
//       args: ['--no-sandbox'],
//     };
//   } else {
//     launchOptions = {
//       headless: 'new',
//     };
//   }
//   // Create an instance of the PuppeteerCrawler class - a crawler
//   // that automatically loads the URLs in headless Chrome / Puppeteer.
//   try {
//     const crawler = new PuppeteerCrawler({
//       minConcurrency: 5,
//       maxRequestRetries: 5,
//       // Here you can set options that are passed to the launchPuppeteer() function.
//       launchContext: {
//         launchOptions,
//       },
//
//       // Stop crawling after several pages
//       maxRequestsPerCrawl: parseInt(process.env.CRAWL_LIMIT),
//       async requestHandler({ request, page, enqueueLinks, log }) {
//         log.info(`Processing ${request.url}...`);
//         const fileExtensionPattern = /\.[0-9a-z]+$/i; // regex pattern for file extension
//
//         // Ignore URLs containing a '?'
//         if (
//           request.url.includes('?') ||
//           request.url.includes('#') ||
//           fileExtensionPattern.test(request.url)
//         ) {
//           console.log('site url contains ?/# or FILE');
//           return;
//         }
//
//         const pageText = await page.evaluate(() => {
//           const blackListNodes = [
//             'data-phonemask-mask',
//             'data-phonemask-country-code',
//           ];
//
//           // This function checks if an element has any of the blacklisted tags.
//           const hasBlacklistedTag = (element) => {
//             return blackListNodes.some((tag) => element.hasAttribute(tag));
//           };
//
//           // Remove the div elements with blacklisted tags.
//           Array.from(document.querySelectorAll('div')).forEach((node) => {
//             if (hasBlacklistedTag(node)) {
//               node.remove();
//             }
//           });
//
//           // Remove all style and script tags.
//           Array.from(document.querySelectorAll('style, script')).forEach(
//             (node) => {
//               node.remove();
//             },
//           );
//
//           const nodes = Array.from(
//             document.querySelectorAll(
//               'p,h1,h2,h3,h4,h5,h6,span,a,li,strong,button,td,th,figcaption,label,title,option,blockquote,cite,em,b,i,mark,small,u,ins,del,s',
//             ),
//           );
//
//           const textNodes = nodes.map((node) => {
//             if (node.nodeName.toLowerCase() === 'div') {
//               // If this is a div, filter its childNodes to only take the Text nodes.
//               return Array.from(node.childNodes)
//                 .filter(
//                   (child) => (child as Node).nodeType === Node.TEXT_NODE,
//                 )
//                 .map((textNode) => (textNode as Text).textContent)
//                 .join('\n');
//             } else {
//               // If this is not a div, just take its textContent as before.
//               return node.textContent;
//             }
//           });
//
//           return textNodes.join('\n');
//         });
//
//         urlsContent.push({
//           url: request.url,
//           size: pageText.length,
//           content: pageText,
//         });
//
//         // Store the results to the default dataset.
//         //await Dataset.pushData(data);
//
//         // Find a link to the next page and enqueue it if it exists.
//         const infos = await enqueueLinks({
//           selector: 'a[href]',
//         });
//
//         if (infos.processedRequests.length === 0)
//           log.info(`${request.url} is the last page!`);
//       },
//
//       // This function is called if the page processing failed more than maxRequestRetries+1 times.
//       failedRequestHandler({ request, log }) {
//         log.error(`Request ${request.url} failed too many times.`);
//       },
//     });
//
//     await crawler.addRequests([weblink]);
//
//     // Run the crawler and wait for it to finish.
//     await crawler.run();
//
//     const returnedToFrontUrls: ReturnedToFrontUrl[] = [];
//
//     for (const url of urlsContent) {
//       const urlWithoutSlashes = url.url.replace(/\//g, '[]');
//       const uploadFilePayload = {
//         fileName: `${urlWithoutSlashes}.txt`,
//         data: url.content,
//         chatbot_id,
//         char_length: url.size,
//       };
//       try {
//         // const newSource = await this.fileUploadService.uploadSingleFile(
//         //   uploadFilePayload,
//         //   CategoryEnum.WEB,
//         // );
//         const linkCrawled = {
//           size: url.size,
//           url: url.url,
//           _id: 'newSource._id.toString()',
//         };
//         returnedToFrontUrls.push(linkCrawled);
//       } catch (e) {
//         console.error(e);
//         /**
//          * @COMMENT stop the loop if error occurs in fileUploadService
//          */
//         return;
//       }
//     }
//
//     console.log('Crawler finished.');
//     return returnedToFrontUrls;
//   } catch (e) {
//     console.error(e);
//     throw new HttpException('Error crawling', HttpStatus.SERVICE_UNAVAILABLE);
//   }
// }
//
// async startCrawlingPool(payload: CrawlDto, chatbot_id: string) {
//   const queue = openRe
//   const pool = new AutoscaledPool({
//     maxConcurrency: 5,
//     runTaskFunction: async () => {
//       await this.crawleeSetup(payload, chatbot_id);
//       // Run some resource-intensive asynchronous operation here.
//     },
//     isTaskReadyFunction: async () => {
//       console.log('is task ready?');
//       return Promise.resolve(true);
//     },
//     isFinishedFunction: async () => {
//       console.log('isFinishedFunction');
//       return Promise.resolve(true);
//     },
//   });
//
//   await pool.run();
// }
