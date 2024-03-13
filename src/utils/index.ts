import { GroupContact } from "../types/MP";

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

  const regexTitles: RegExp = /^ps|^pastor|^pst|^rev|^dr|^apostle|^prophet|^prophetess|^bishop|^minister|^ev|^evangelist|^mr|^mrs/;
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

export function isNum(val: string | number) {
  return !isNaN(Number(val));
}

export function toNum(val: string | number) {
  const numVal = Number(val);
  return !isNaN(numVal) ? numVal : val;
}
