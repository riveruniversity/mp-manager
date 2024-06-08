
import { getContact } from '../api/mp'
import { importCsv } from './import'
import { formatPhone, sleep } from '../utils';
import { Contact, EventContact } from '../types/MP';
import { Attendee } from '../types/Eventbrite';
import { Lib } from '../api/lib';
import { filterByName, removeDuplicates } from '../services/filters';
import { attendeeToBulkTextFormat, contactToBulkTextFormat } from '../services/converters';
import { saveAttendees, saveDevAttendees } from '../services/db';
import { getAttendees } from '../api/eventbrite';


// used to save json files
const eventName: string = 'carShow';
const eventbriteId: number = 905321108807;

(async function findMPRecord() {

  const people: Attendee[] = await getAttendees(eventbriteId);

  var found: Contact[] = [];
  var removed: Contact[] = [];
  var notFound: Attendee[] = [];

  for (const person of people) {

    // await getContact(`((${Field.First_Name}='${person.First_Name}' AND ${Field.Last_Name}='${person.Last_Name}') OR (Display_Name Like '${person.First_Name}%' AND Display_Name Like '${person.Last_Name}%') OR (${Field.Nickname}='${person.First_Name}' AND ${Field.Last_Name}='${person.Last_Name}'))`)
    // if (res.length) console.log(person.Mobile_Phone + ': found by name ✅')
    var res: Contact[] = [];

    if (person.Mobile_Phone) {
      res = await getContact(`Contacts.Mobile_Phone='${formatPhone(person.Mobile_Phone)}'`);
    }

    if (res?.length) {
      console.log(person.Mobile_Phone || person.First_Name + ' ' + person.Last_Name, ': found by phone ✅', res.length);
    } else if (person.Email_Address) {
      res = await getContact(`Contacts.Email_Address='${person.Email_Address}'`);
      if (res?.length) {
        console.log(person.Mobile_Phone || person.First_Name + ' ' + person.Last_Name, ': found by email ✅', res.length)
      }
    }

    if (res?.length) {
      const filtered = filterByName(res, person)
      if (filtered.length)
        found = found.concat(mergeContact(filtered, person))
      else
        removed = removed.concat(res)
    } else {
      notFound = notFound.concat(person)
      console.log(person.Mobile_Phone || person.First_Name, ': not found ❌')
    }
  }

  await sleep(5000)

  console.log(people.length, 'people listed');
  console.log(found.length, 'people found');
  // console.log(removed.length , ' people found by phone or email but first name didn\'t match');

  found = await removeDuplicates(found as unknown as EventContact[], false) as unknown as Contact[];

  // Don't save contacts if not all have a card_id / barcode
  if (found.some(c => c.ID_Card === null)) return Lib.updateCardIds(found, { prefix: 'C', onlyBlanks: true });
  
  const bulkContacts = await contactToBulkTextFormat(found, eventName);  // MP Contact Format
  saveAttendees(bulkContacts);

  const bulkAttendees = await attendeeToBulkTextFormat(notFound, eventName); // CSV (Eventbrite) Format
  saveAttendees(bulkAttendees);
  
  // saveDevAttendees();
})()

function mergeContact(filtered: Contact[], person: Attendee ) {
  const merged: Contact = {
    ...filtered[0],
    Email_Address: filtered[0].Email_Address || person.Email_Address || '',
    Mobile_Phone: filtered[0].Mobile_Phone || person.Mobile_Phone || '',
  }
  if (merged.Red_Flag_Notes) console.log('❗⛔', merged.Red_Flag_Notes)
  return merged;
}