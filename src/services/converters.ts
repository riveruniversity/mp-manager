import * as fs from 'fs'
import { json2csv, Json2CsvOptions } from 'json-2-csv';

import { Lib } from '../api/lib';
import { Attendee, CarShowContact, Contact, EventContact, EventParticipant, EventFormResponse, BulkAttendee } from "../types/MP";
import { removeDuplicates } from "./filters";

export async function contactToBulkTextFormat(attendees: CarShowContact[] | EventContact[], eventName: string, fileName: string = 'onMp'): Promise<BulkAttendee[]> {

  const contacts: CarShowContact[] = await removeDuplicates(attendees as unknown as EventContact[], false) as unknown as CarShowContact[];

  // const groupedByPhone = groupBy(contacts, 'Mobile_Phone');

  const bulkContacts: BulkAttendee[] = contacts.map((att, i) => ({
    first: att.Nickname || att.First_Name, last: att.Last_Name, email: att.Email_Address || '', phone: att.Mobile_Phone || '', 
    barcode: att.ID_Card || '', onMp: true, fam: i > 0 && att.Mobile_Phone === contacts[i - 1].Mobile_Phone
  }))

  fs.writeFileSync(`src/data/${eventName}/${eventName}_${fileName}.json`, JSON.stringify(bulkContacts, null, '\t'));
  fs.writeFileSync(`./src/data/${eventName}/${eventName}_${fileName}.csv`, await json2csv(bulkContacts, { emptyFieldValue: '' })); // For Badge printing

  return bulkContacts;
}



export async function attendeeToBulkTextFormat(attendees: Attendee[], eventName: string, fileName: string = 'notOnMp') {
  const bulkAttendees = attendees.map((att, i) => ({
    first: att.FirstName, last: att.LastName, email: att.Email, phone: att.CellPhone, 
    barcode: att.ID, onMp: false, fam: i > 0 && att.CellPhone === attendees[i - 1].CellPhone
  }))


  fs.writeFileSync(`./src/data/${eventName}/${eventName}_${fileName}.json`, JSON.stringify(bulkAttendees, null, '\t'));
  fs.writeFileSync(`./src/data/${eventName}/${eventName}_${fileName}.csv`, await json2csv(bulkAttendees, { emptyFieldValue: '' }));

  console.log(attendees.length, 'people not found');
}


export function joinParticipantInfo(formResponses: EventFormResponse[], eventParticipants: EventParticipant[]): EventContact[] {
  return formResponses
    .map(response => ({ ...response, ...eventParticipants.find(participant => participant.Contact_ID === response.Contact_ID)! }))
    .map(Lib.trimData)
}

export function filterByName(response: CarShowContact[] | Contact[], person: Attendee) {
  const fullName = (p: Contact | CarShowContact) => (p.Display_Name + ' ' + p.First_Name + ' ' + p.Nickname).toLowerCase()
  const firstName = person.FirstName.toLowerCase().split(' ')[0]
  const lastName = person.LastName.toLowerCase().split(' ')[0]
  return response.filter((p: Contact | CarShowContact) => fullName(p).includes(firstName) && fullName(p).includes(lastName)) // remove last name to get more results (but is more inaccurate)
}