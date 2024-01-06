// Account transactions CSV export format parsing

/* eslint-disable import/extensions */

import { stripCommasAndSpaces } from './util.js';

export function csv2csv(inputCSV) {
  // Split the input CSV into lines
  const lines = inputCSV.split('\n');
  lines.shift();

  // Process the CSV data
  const processedLines = lines.map(line => {
      const row = []
      const parts = csvToArray(line);

      if (parts.length > 0) {
        const infoColumnParts = parts[13].split(' ');
        let payee = null;
        let memo = getCard(infoColumnParts);
        if (memo !== null) {
          payee = getPayee(infoColumnParts);
        } else {
          payee = parts[8];
          memo = [parts[13], parts[12]].join(' ');
          if (isNullOrWhitespace(memo)) {
            memo = parts[14];
          }
        }
        row.push(parts[1]);
        row.push(stripCommasAndSpaces(payee));
        row.push(stripCommasAndSpaces(memo));
        row.push(getSign(parts[4]) + parts[2].replace(/,/g, '.'));
      }
      
      return row;
  });

  // Convert the processed lines back to a CSV string
  const processedCSV = processedLines.map(row => row.join(',')).join('\n');
  return 'Date,Payee,Memo,Amount\n' + processedCSV;
}

function getSign(operationType) {
  return operationType === "Debet" ? '-' : '';
}

function getCard(parts) {
  if (isValidCardFormat(parts[0])) {
    return parts[0];
  }
  return null;
}

function getPayee(parts) {
  const payee = []
  for (let i = parts.length - 1; i >= 0; i--) {
    if (isAmountWithCurrency(parts[i]) || isTime(parts[i]) || isDate(parts[i])) {
      return payee.join(' ');
    }
    payee.unshift(parts[i]);
  }
  return null;
}

function isValidCardFormat(str) {
    // Regex to match the pattern: starting with 6 digits, followed by 6 asterisks, and ending with 4 digits
    const regex = /^\d{6}\*{6}\d{4}$/;
    return regex.test(str);
}

function isAmountWithCurrency(str) {
    const regex = /^\d+(\.\d{1,2})?[A-Z]{3}$/;
    return regex.test(str);
}

function isTime(str) {
    const regex = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
    return regex.test(str);
}

function isDate(str) {
    // Check if the string length is 8 and all characters are digits
    if (str.length !== 8 || !/^\d+$/.test(str)) {
        return false;
    }

    // Extract year, month, and day from the string
    const year = parseInt(str.substring(0, 4), 10);
    const month = parseInt(str.substring(4, 6), 10) - 1; // Month is 0-indexed in JavaScript
    const day = parseInt(str.substring(6, 8), 10);

    // Create a date object
    const date = new Date(year, month, day);

    // Check if the date is valid and components match the input
    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
}

function isNullOrWhitespace(str) {
    return str == null || str.match(/^ *$/) !== null;
}

// https://stackoverflow.com/a/8497474
function csvToArray(text) {
    var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    // Return NULL if input string is not well formed CSV string.
    if (!re_valid.test(text)) return null;
    var a = [];                     // Initialize array to receive values.
    text.replace(re_value, // "Walk" the string using replace with callback.
        function(m0, m1, m2, m3) {
            // Remove backslash from \' in single quoted values.
            if      (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
            // Remove backslash from \" in double quoted values.
            else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
            else if (m3 !== undefined) a.push(m3);
            return ''; // Return empty string.
        });
    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push('');
    return a;
};
