import puppeteer from 'puppeteer';
import { delay, mergeArray, writeJson, forEachDownloadImage } from './utils';
import * as config from './config.json';

puppeteer.launch({
  // @ts-ignore
  headless: config.puppeteer.headless,
  devtools: config.puppeteer.devtools,
  args: config.puppeteer.args
}).then(async browser => {
  const page = await browser.newPage();
  await page.setViewport({
    width: config.puppeteer.viewport.width,
    height: config.puppeteer.viewport.height
  });
  await page.goto(`https://twitter.com/${config.username}/${config.type[0]}`);
  await page.waitForSelector('div[data-testid="cellInnerDiv"]');

  let frequency = 0;
  let mergedArray = [];
  
  while (true) {
    if (frequency === config.frequency) {
      mergedArray = mergeArray(mergedArray);
      console.log(mergedArray);
      writeJson(mergedArray);
      if (config.autosave) forEachDownloadImage(mergedArray);
      break;
    } else {
      await delay(config.load_delay);

      let result = await page.evaluate(async (config, frequency) => {
        var modifiedUrls = [];

        window.scrollTo(0, frequency * config.scroll);

        function modifyParamsFromUrl(url: string, format: string, quality: string) {
          if (quality === "original") url = url.replace(/(\?|&)name=[^&]+/g, '');
          else url = url.replace(/(\?|&)name=[^&]+/g, '$1name=' + quality);
          url = url.replace(/(\?|&)format=jpg/g, '$1format=' + format);
          return url;
        }

        const tweetElements = document.querySelectorAll('div[data-testid="cellInnerDiv"]');

        tweetElements.forEach(function (tweetElement) {
          const imgElements = tweetElement.querySelectorAll('article img');

          imgElements.forEach(function (imgElement) {
            const src = imgElement.getAttribute('src');

            const emojiRegex = /emoji/g;
            const profileImagesRegex = /profile_images/g;
            const cardImagesRegex = /card_img/g;
            const extTwVideoThumbRegex = /ext_tw_video_thumb/g;
            const tweetVideoThumbRegex = /tweet_video_thumb/g;
            const amplifyVideoThumbRegex = /amplify_video_thumb/g;

            if (
              !profileImagesRegex.test(src) &&
              !emojiRegex.test(src) &&
              !cardImagesRegex.test(src) &&
              !extTwVideoThumbRegex.test(src) &&
              !tweetVideoThumbRegex.test(src) &&
              !amplifyVideoThumbRegex.test(src)
            ) {
              modifiedUrls.push(modifyParamsFromUrl(src, config.format, config.quality));
            }
          });
        });

        return modifiedUrls;
      }, config, frequency);

      console.log(frequency);
      console.log(result);
      mergedArray.push(result);
      frequency++;
    }
  }

  await browser.close();
});
