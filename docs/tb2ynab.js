// ESLint AirBnb rules are complaining about .js extension in imports, WTF.
/* eslint-disable import/extensions */

// https://medium.com/@mattlag/es6-modules-getting-started-gotchas-2ad154f38e2e
import { xml2csv } from './camt053sk.js';

// FIXME poor man's error handling
function error(text) {
  // eslint-disable-next-line no-console
  console.error(text);
}

function parse(xmlText, fileName) {
  const csv = xml2csv(xmlText);

  // https://code-maven.com/create-and-download-csv-with-javascript
  const hiddenElement = document.createElement('a');
  hiddenElement.href = `data:text/csv;charset=utf-8,${encodeURI(csv)}`;
  hiddenElement.target = '_blank';
  hiddenElement.download = fileName.replace('.xml', '.csv');
  hiddenElement.click();
}

// https://usefulangle.com/post/193/javascript-read-local-file
function fileListener() {
  const allFiles = this.files;
  if (allFiles.length === 0) { error('No file selected'); return; }

  const file = allFiles[0];
  if (file.type !== 'text/xml') { error('Incorrect file type'); return; }
  if (file.size > 2 * 1024 * 1024) { error('Exceeded size 2MB'); return; }

  const reader = new FileReader();
  reader.addEventListener('load', (e) => {
    parse(e.target.result, file.name);
  });
  reader.addEventListener('error', () => { error('Failed to read file'); });
  reader.readAsText(file);
}

// Listen on file input
document.querySelector('#file-input').addEventListener('change', fileListener);
