const puppeteer = require('puppeteer');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
};

puppeteer.launch({
  headless: config.puppeteer.headless,
  devtools: config.puppeteer.devtools
}).then(async browser => {
  const page = await browser.newPage();
  await page.setViewport({ width: 720, height: 1200 });
  await page.goto(`https://twitter.com/${config.username}/${config.type[0]}`);
  await page.waitForSelector('div[data-testid="cellInnerDiv"]');
  let frequency = 0;

  let mergedArray = [];

  while (1) {
    await delay(1000);

    let result = await page.evaluate(async (config, frequency) => {
      window.scrollTo(0, frequency * 1200);

      function modifyParamsFromUrl(url, format, quality) {
        if (quality === "original") url = url.replace(/(\?|&)name=[^&]+/g, '');
        else url = url.replace(/(\?|&)name=[^&]+/g, '$1name=' + quality);
        url = url.replace(/(\?|&)format=jpg/g, '$1format=' + format);
        return url;
      }

      const divElements = document.querySelectorAll('div[data-testid="cellInnerDiv"]');
      var modifiedUrls = [];

      divElements.forEach(function (divElement) {
        const imgElements = divElement.querySelectorAll('article img');

        imgElements.forEach(function (imgElement) {
          const src = imgElement.getAttribute('src');

          const emojiRegex = /emoji/g;
          const profileImagesRegex = /profile_images/g;
          const cardImagesRegex = /card_img/g;

          if (!profileImagesRegex.test(src) && !emojiRegex.test(src) && !cardImagesRegex.test(src)) {
            modifiedUrls.push(modifyParamsFromUrl(src, config.format, config.quality));
          }
        });
      });

      return modifiedUrls;
    }, config, frequency);

    console.log(frequency);
    if (frequency === 100) {
      mergedArray = [].concat(...mergedArray);

      let uniqueArray = [...new Set(mergedArray)];
      console.log(uniqueArray);

      fs.writeFile(`pic_${(new Date()).toISOString().replace(/[-:.]/g, '_').replace('T', '_').split('.')[0]}.json`, JSON.stringify(uniqueArray), (err) => {
        if (err) throw err;
        console.log("JSON data is saved.");
      });

      frequency = 0;
      mergedArray = [];
    } else {
      frequency++;
      mergedArray.push(result);
      console.log(mergedArray);
    }

  }
});
