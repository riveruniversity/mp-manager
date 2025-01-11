export function capitalizeAll(str: string) {

  str = str.replaceAll(/\W/g, '|');

  const nonWordRegex = /[^\w\sA-zÀ-ÿĹ\p{L}`]/gu;
  // const nonWordRegex = XRegExp("[^\w\sA-zÀ-ÿĹ\p{L}]", 'g'); // both works
  const nonWordChar = str.match(nonWordRegex);

  if (str.match(/-/)) {

    let splitString = str.split('-');
    str = splitString.map(s => capitalizeAll(s)).join('-');
  }
  else if (nonWordChar) {
    let splitString = str.split(nonWordChar[0]);
    str = splitString.map(s => capitalizeAll(s)).join(' ');
  }
  else
    str = str && str[0].toUpperCase() + str.slice(1).toLowerCase();

  return str;
}

export function camelize(str: string) {
  str = capitalizeAll(str);
  str = str.replaceAll(/\W/g, '');
  return str.length && str[0].toLowerCase() + str.slice(1);
}

export function camelizeObj(obj: Partial<{}>) {
  return Object.entries(obj).reduce((acc, [key, value]) => ({ ...acc, [camelize(key)]: value }), {});
}


export function cleanPhoneNumber(num?: string | number | null) {

  if (!num) return num;

  const cleaned = String(num).trim()
    .replace(/(?<!^)\+|[^\d+]+/g, '')  // Remove non digits and keep the +
    .replace(/^00/, '+')               // Remove preceding '00'
    .replace(/^\+?1(?=\d{10})/, '');    // Remove preceding '+1' or '1' for American numbers     

  return cleaned;
}