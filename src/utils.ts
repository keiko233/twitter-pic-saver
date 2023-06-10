import https from 'https';
import fs from 'fs';
import url from 'url';
import path from 'path';
import * as config from './config.json';

export function delay(time: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
};

export function mergeArray(array: Array<any>) {
  return [...new Set([].concat(...array))];
}

export function writeJson(array: Array<any>) {
  const filename = `pic_${(new Date()).toISOString().replace(/[-:.]/g, '_').replace('T', '_').split('.')[0]}.json`;
  fs.writeFile(filename, JSON.stringify(array), (err) => {
    if (err) throw err;
    console.log(filename + " is saved.");
  });
}

export function modifyParamsFromUrl(url: string, format: string, quality: string) {
  if (quality === "original") url = url.replace(/(\?|&)name=[^&]+/g, '');
  else url = url.replace(/(\?|&)name=[^&]+/g, '$1name=' + quality);
  url = url.replace(/(\?|&)format=jpg/g, '$1format=' + format);
  return url;
}

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
};

function downloadImage(urlString: string) {
  const imageUrl = new url.URL(urlString);
  const filename = imageUrl.pathname.split('/')[2] + '.png';
  const savePath = path.join(__dirname, config.saver.path, filename);

  ensureDirectoryExistence(savePath);

  https.get(urlString, function(response) {
    response.pipe(fs.createWriteStream(savePath)).on('close', function() {
      console.log(`Downloaded ${filename}`);
    });
  }).on('error', function(error) {
    console.error(`Error downloading ${urlString}: ${error.message}`);
  });
};

export function forEachDownloadImage(list: Array<any>) {
  for (let i = 0; i < list.length; i++) {
    const imageUrl = list[i];
    downloadImage(imageUrl);
  }
};
