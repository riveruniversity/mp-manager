import * as fs from 'fs'
import { json2csv, Json2CsvOptions } from 'json-2-csv';

import { Lib } from '../api/lib';
import { CarShowContact, EventContact, EventParticipant, FormResponseRecord, BulkAttendee, Contact, YouthWeekParticipant } from "../types/MP";
import { Attendee } from '../types/Eventbrite';

// Contact[] | CarShowContact[] | EventContact[] | YouthWeekParticipant[]
export async function contactToBulkTextFormat(contacts: Contact[] | CarShowContact[] | EventContact[] | YouthWeekParticipant[], eventName: string, fileName: string = 'onMp'): Promise<BulkAttendee[]> {

  const bulkContacts: BulkAttendee[] = contacts.map((att, i) => ({
    first: att.Nickname || att.First_Name, 
    last: att.Last_Name, 
    email: att.Email_Address || '', 
    phone: att.Mobile_Phone || '',
    barcode: att.ID_Card || 'C' + att.Contact_ID, 
    onMp: true, 
    fam: i > 0 && att.Mobile_Phone === contacts[i - 1].Mobile_Phone,
    // type: att.Type NEEDED FOR YOUTH WEEK
  }))

  fs.writeFileSync(`src/data/${eventName}_${fileName}.json`, JSON.stringify(bulkContacts, null, '\t'));
  fs.writeFileSync(`./src/data/${eventName}_${fileName}.csv`, await json2csv(bulkContacts, { emptyFieldValue: '' })); // For Badge printing

  return bulkContacts;
}

 

export async function attendeeToBulkTextFormat(attendees: Attendee[], eventName: string, fileName: string = 'notOnMp') {
  const bulkAttendees: BulkAttendee[] = attendees.map((att, i) => ({
    first: att.First_Name, 
    last: att.Last_Name, 
    email: att.Email_Address || '', 
    phone: att.Mobile_Phone || '',
    barcode: att.Contact_ID, 
    onMp: false, fam: i > 0 && att.Mobile_Phone === attendees[i - 1].Mobile_Phone
  }))

  fs.writeFileSync(`./src/data/${eventName}_${fileName}.json`, JSON.stringify(bulkAttendees, null, '\t'));
  fs.writeFileSync(`./src/data/${eventName}_${fileName}.csv`, await json2csv(bulkAttendees, { emptyFieldValue: '' }));

  console.log(attendees.length, 'people not found');
  return bulkAttendees;
}


export function joinParticipantInfo(formResponses: FormResponseRecord[], eventParticipants: EventParticipant[]): EventContact[] {
  const eventContacts: EventContact[] | any = formResponses.map((response: FormResponseRecord) => ({ ...response, ...eventParticipants.find((participant: EventParticipant) => participant.Contact_ID === response.Contact_ID)! }))
  return eventContacts
    .map(Lib.trimData)
    .map(Lib.fixValues)
}