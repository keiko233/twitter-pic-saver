import fs from 'fs';

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
