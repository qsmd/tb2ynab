// default is mandatory, so I created unneeded version property for that
const version = '0.1';
export default version;

export class Ntry {
  constructor(date, payee, memo, amount) {
    this.date = date;
    this.payee = payee;
    this.memo = memo;
    this.amount = amount;
  }
}

// Finds textContent of first element in hierarchy by tag name.
// Expects the element to exist, will crash otherwise - fail fast!
export function findElement(parent, tagName) {
  return parent.getElementsByTagName(tagName)[0].textContent;
}

// get first found child element on given xpath or null if not found
// TODO tests
export function getElement(xpath, parent) {
  const segments = xpath.split('/');
  let nodes = [parent];
  while (segments.length && nodes.length) {
    nodes = nodes[0].getElementsByTagName(segments.shift());
  }
  return nodes.length ? nodes[0] : null;
}

// TODO tests
export function getDate(ntry) {
  const txdttm = findElement(ntry, 'TxDtTm');
  const dt = txdttm.split('T')[0].split('-');
  return [dt[2], dt[1], dt[0]].join('.');
}

// TODO tests
export function stripCommasAndSpaces(text) {
  // https://blog.abelotech.com/posts/split-string-into-tokens-javascript/
  return text.replace(',', ' ').match(/\S+/g).join(' ');
}
