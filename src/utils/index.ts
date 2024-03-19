import XRegExp from "xregexp";
import { GroupContact } from "../types/MP";

export function fixNumber(num: string | null, { addDashes } = { addDashes: true }) {

  if (!num) return ''

  const cleaned = String(num).trim()
    .replace(/(?<!^)\+|[^\d+]+/g, '')  // Remove non digits and keep the +
    .replace(/^00/, '+')               // Remove preceding '00'
    .replace(/^\+?1(?=\d{10})/, '')    // Remove preceding '+1' or '1' for American numbers     


  if (cleaned.length == 10) {
    if (addDashes)
      return cleaned.replace(/^(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
    else
      return cleaned
  }
  else if (cleaned.includes('+')) {
    return ''
  }
  else {
    return ''
  }
}


export function trimString(val: any) {
  if (typeof val === 'string') return val.trim().replaceAll('  ', ' ')
  else return val
}


export function groupBy<T>(array: T[], groupKey: keyof T) {

  const keys = []

  const outObject = array.reduce(function (a: any, c: T, i: number) {

    // if no value, assign current index to ensure distinction
    let keyVal = cleanedKey(c[groupKey]?.toString() || i);
    keys.push(keyVal);


    (a[keyVal] ? a[keyVal] : (a[keyVal] = [])).push(c);
    return a;
  }, {});

  return outObject;
}

export function groupArrayBy<T>(array: T[], groupKey: keyof T, returnDuplicatesOnly: boolean = false): Array<T[]> {
  const outObject = groupBy<T>(array, groupKey);

  const participants: any[] = [];
  for (let key of Object.keys(outObject)) {
    if (returnDuplicatesOnly) {
      if (outObject[key].length > 1) participants.push(outObject[key]);
    }
    else {
      participants.push(outObject[key]);
    }
  }

  return participants;
}


export function groupOrderedArrayBy<T>(array: T[], key: keyof T): Array<T[]> {
  const keys: string[] = [];
  const output: any = {};

  array.forEach((item: T) => {
    const keyIndex: number = keys.indexOf(String(item[key]));

    if (keyIndex < 0) {
      const newIndex = keys.push(String(item[key])) - 1;
      output[newIndex] = [item];
    }
    else {
      output[keyIndex] = [...output[keyIndex], item]
    }
  })
  return Object.values(output);;
};



export function sleep(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export function join(arr1: any[], arr2: any[]) {
  return arr1.map(participant => ({ ...participant, ...arr2.find(response => response.Contact_ID === participant.Contact_ID)! }))
}

export async function showPercent(i: string, arr: GroupContact[]): Promise<void> {
  const percent: string = ((+i + 1) / arr.length * 100).toFixed(1)
  console.log('🔔', `${+i + 1} (${percent}%)`, arr[+i].Contact_ID);
}


export function formatPhone(phone: string | number): string {
  return String(phone).replace(/^(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
}

export function parseCsv(csv: string) {
  const headers = csv.match(/.*(?=\r|\n^)/m)![0].split(',');
  let rows: string[] = csv.split('\r\n').filter(row => row.split(',').length == headers.length);
  let data: (string | number)[][] = rows.map(row => row.split(',').map(col => toNum(col)));
  // data = data.map(row => row.includes('\r') ? row.split(',') : (row + '\r').split(','));
  return data;
}


function cleanedKey(keyVal: string | number) {
  if (typeof keyVal == 'number') return keyVal;

  const regexTitles: RegExp = /^ps|^pastor|^pst|^rev|^reverend|^dr|^apostle|^prophet|^prophetess|^bishop|^minister|^ev\.|^evangelist|^mr|^mrs/;
  const [first, second, third] = keyVal.toLowerCase().split(' ')

  if (second) {

    // remove possible titles (pastor, pst, ...)
    if (regexTitles.test(first)) keyVal = second;

    // remove initials if used before first name (L. Winston Frickley)
    else if (/^.{2}$/.test(first)) keyVal = second;

    else keyVal = first
  }

  // take email plus '@' plus first char after the '@' if email address
  keyVal = keyVal.split(/(?<=@.)/)[0]
  return keyVal
}


export function cleanName(str: string) {

  var regex: RegExp;

  // Remove nicknames like: “Marty” and (Patty)
  str = str.replace(/(“|”|"|\().*(“|”|"|\))/g, '').replace('  ', ' ').replace(' -', '-').replace('- ', '-');

  // Remove titles
  regex = /(^ps|pastor|^pst|^rev|reverend|apostle|prophet|prophetess|bishop|minister|missionary|^ev\.|evangelist|^mr|^mrs|^ms|^sister|^sis\.)(\.? ?)/i;
  str = str.replace(regex, '');

  // Remove any non-word chars but keep Dr. or hyphenated names like Tony-Ann
  // remove initials if used before first name (L. Winston Frickley)
  // regex = /[\pL'’`-]{2,}/g
  regex = XRegExp("[\\p{L}A-zÀ-ÿ'’`-]{2,}", 'g');
  str = (str.match(regex) || [str]).map(capitalize).join(' ');

  return str
}

// O’Brien-Thomas
export function capitalize(str: string) {

  const nonWordRegex = /[^\w\sA-zÀ-ÿĹ\p{L}]/g;
  // const nonWordRegex = XRegExp("[^\w\sA-zÀ-ÿĹ\p{L}]", 'g'); // both works
  const nonWordChar = str.match(nonWordRegex);

  if (str.match(/-/)) {

    let splitString = str.split('-');
    str = splitString.map(s => capitalize(s)).join('-')
  }
  else if (nonWordChar) {
    let splitString = str.split(nonWordChar[0]);
    str = splitString.map(s => capitalize(s)).join(nonWordChar[0]);

    if (nonWordChar.length > 1) console.log('⚠️ more than 1 substring', str)
  }
  else
    str = str && str[0].toUpperCase() + str.slice(1).toLowerCase();

  return str
}


export function isNum(val: string | number) {
  return !isNaN(Number(val));
}

export function toNum(val: string | number) {
  const numVal = Number(val);
  return !isNaN(numVal) ? numVal : val;
}