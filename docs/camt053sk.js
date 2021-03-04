// CAMT.053-SK format parsing

/* eslint-disable import/extensions */
import {
  Ntry, findElement, getElement, getDate, stripCommasAndSpaces,
} from './util.js';

// default is mandatory, so I created unneded version property for that
const version = '0.1';
export default version;

function getDebitPayee(ntry) {
  const rltdpties = getElement('NtryDtls/TxDtls/RltdPties', ntry);
  if (!rltdpties) { return 'Bankove poplatky'; }

  const adrLineNode = getElement('NtryDtls/TxDtls/RltdAgts/Prtry/Agt/BrnchId/PstlAdr/AdrLine', ntry);
  let nameNode = getElement('TradgPty/Nm', rltdpties);
  if (!nameNode) { nameNode = getElement('Cdtr/Nm', rltdpties); }
  const name = nameNode ? stripCommasAndSpaces(nameNode.textContent) : '';
  const ibanNode = getElement('CdtrAcct/Id/IBAN', rltdpties);
  const iban = ibanNode ? stripCommasAndSpaces(ibanNode.textContent) : '';
  const divider1 = (nameNode && ibanNode) ? ' ' : '';
  const adrLine = adrLineNode ? adrLineNode.textContent : '';
  const divider2 = adrLineNode ? ' ' : '';
  return `${name}${divider1}${iban}${divider2}${adrLine}`;
}

function getDebitMemo(ntry) {
  const rltdpties = getElement('NtryDtls/TxDtls/RltdPties', ntry);
  if (!rltdpties) { return 'Bankove poplatky'; }

  let node = getElement('InitgPty/Nm', rltdpties);
  if (!node) { node = getElement('NtryDtls/TxDtls/RmtInf/Ustrd', ntry); }
  if (!node) { return ''; }

  let memo = node.textContent;
  const card = getElement('NtryDtls/TxDtls/Refs/ChqNb', ntry);
  if (card) { memo = `${memo} *${card.textContent.replace(/\*/g, '')}`; }
  return stripCommasAndSpaces(memo);
}

function getCreditMemo(ntry) {
  const rltdpties = getElement('NtryDtls/TxDtls/RltdPties', ntry);
  if (!rltdpties) { return 'Bankove poplatky'; }

  const node = getElement('TradgPty/Nm', rltdpties);
  if (!node) {
    const nm = getElement('Dbtr/Nm', rltdpties).textContent;
    const nodeIban = getElement('DbtrAcct/Id/IBAN', rltdpties);
    const memo = `${nm} ${nodeIban ? nodeIban.textContent : ''}`;
    return stripCommasAndSpaces(memo);
  }

  return stripCommasAndSpaces(node.textContent);
}

function getEntry(ntry) {
  const isDebit = findElement(ntry, 'CdtDbtInd') === 'DBIT';
  const amount = findElement(ntry, 'Amt');
  return new Ntry(
    getDate(ntry),
    isDebit ? getDebitPayee(ntry) : '', // if credit, I am payee
    isDebit ? getDebitMemo(ntry) : getCreditMemo(ntry),
    isDebit ? `-${amount}` : amount,
  );
}

export function xml2csv(xmlText) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'text/xml');
  const ntrys = xml.getElementsByTagName('Ntry');
  let csv = 'Date,Payee,Memo,Amount\n';
  for (let i = 0; i < ntrys.length; i += 1) {
    const ntry = getEntry(ntrys[i]);

    // DEBUG
    // console.log([ntry.date, ntry.payee, ntry.memo, ntry.amount].join(','));

    csv += [ntry.date, ntry.payee, ntry.memo, ntry.amount].join(',');
    csv += '\n';
  }
  return csv;
}
