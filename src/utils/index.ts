import { Attendee, CarShowContact, GroupContact } from "../types/MP";

export function groupBy(array: any[], key: string) {
  const participants: any[] = [];

  var outObject = array.reduce(function (a, e) {
    // GROUP BY estimated key (estKey), well, may be a just plain key
    // a -- Accumulator result object
    // e -- sequentially checked Element, the Element that is tested just at this iteration

    // new grouping name may be calculated, but must be based on real value of real field
    let estKey = (e[key]);

    (a[estKey] ? a[estKey] : (a[estKey] = null || [])).push(e);
    return a;
  }, {});

  for (var key in outObject) {
    participants.push(outObject[key]);
  }

  return participants;
}


export function sleep(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export function join(arr1: any[], arr2: any[]) {
  return arr1.map(participant => ({...participant, ...arr2.find(response => response.Contact_ID === participant.Contact_ID)!}))
}

export function joinParticipantInfo(eventParticipants: any[], formResponses: any[]) {
  return eventParticipants.map(response => ({...response, ...formResponses.find(participant => participant.Contact_ID === response.Contact_ID)!}))
}

export function filterByName(response: CarShowContact[], person: Attendee) {
  return response.filter(p => (p.Display_Name + ' ' + p.First_Name + ' ' + p.Nickname).toLowerCase().includes(person.FirstName.toLowerCase()))
}


export async function showPercent(i: string, arr: GroupContact[]): Promise<void> {
  const percent: string = ((+i + 1) / arr.length * 100).toFixed(1)
  console.log('🔔', `${+i + 1} (${percent}%)`, arr[+i].Contact_ID);
}


export function formatPhone(phone: string | number): string {
  return String(phone).replace(/^(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
}