import { Attendee, CarShowContact, Contact, GroupContact, EventContact, EventParticipant, EventFormResponse } from "../types/MP";

export function groupBy<T>(array: T[], groupKey: keyof T)  {

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


export function sleep(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export function join(arr1: any[], arr2: any[]) {
  return arr1.map(participant => ({ ...participant, ...arr2.find(response => response.Contact_ID === participant.Contact_ID)! }))
}

export function joinParticipantInfo(formResponses: EventFormResponse[], eventParticipants: EventParticipant[]): EventContact[] {
  return formResponses.map(response => ({ ...response, ...eventParticipants.find(participant => participant.Contact_ID === response.Contact_ID)! }))
}

export function filterByName(response: CarShowContact[] | Contact[], person: Attendee) {
  const fullName = (p: Contact | CarShowContact) => (p.Display_Name + ' ' + p.First_Name + ' ' + p.Nickname).toLowerCase()
  const firstName = person.FirstName.toLowerCase().split(' ')[0]
  const lastName = person.LastName.toLowerCase().split(' ')[0]
  return response.filter((p: Contact | CarShowContact) => fullName(p).includes(firstName) && fullName(p).includes(lastName)) // remove last name to get more results (but is more inaccurate)
}


export async function showPercent(i: string, arr: GroupContact[]): Promise<void> {
  const percent: string = ((+i + 1) / arr.length * 100).toFixed(1)
  console.log('🔔', `${+i + 1} (${percent}%)`, arr[+i].Contact_ID);
}


export function formatPhone(phone: string | number): string {
  return String(phone).replace(/^(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
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