import fs from 'fs';

import { forEachDownloadImage } from './utils';

forEachDownloadImage(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')));
