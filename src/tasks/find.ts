import * as fs from 'fs'
import { json2csv, Json2CsvOptions } from 'json-2-csv';

import { getContact, C } from '../api/mp'
import { people } from '../data/attendees'
import { filterByName, formatPhone, groupBy, sleep } from '../utils';
import { Attendee, CarShowContact, EventContact } from '../types/MP';
import { Lib } from '../api/lib';
import { removeDuplicates } from '../services/filters';


// used to save json files
const eventName: string = 'carShow';


(async function findMPRecord() {

  var found: CarShowContact[] = [];
  var removed: CarShowContact[] = [];
  var notFound: Attendee[] = [];

  const ppl: Attendee[] = await people;

  for (const person of ppl) {

    // await getContact(`((${Field.First_Name}='${person.FirstName}' AND ${Field.Last_Name}='${person.LastName}') OR (Display_Name Like '${person.FirstName}%' AND Display_Name Like '${person.LastName}%') OR (${Field.Nickname}='${person.FirstName}' AND ${Field.Last_Name}='${person.LastName}'))`)
    // if (res.length) console.log(person.CellPhone + ': found by name ✅')
    var res: CarShowContact[] = [];

    if (person.CellPhone) {
      res = await getContact(`Contacts.Mobile_Phone='${formatPhone(person.CellPhone)}'`);
    }

    if (res?.length) {
      console.log(person.CellPhone || person.FirstName + ' ' + person.LastName, ': found by phone ✅', res.length);
    } else if (person.Email) {
      res = await getContact(`Contacts.Email_Address='${person.Email}'`);
      if (res?.length) {
        console.log(person.CellPhone || person.FirstName + ' ' + person.LastName, ': found by email ✅', res.length)
      }
    }

    if (res?.length) {
      const filtered = filterByName(res, person)
      if (filtered.length)
        found = found.concat({ ...filtered[0], ...person })
      else
        removed = removed.concat(res)
    } else {
      notFound = notFound.concat(person)
      console.log(person.CellPhone || person.FirstName, ': not found ❌')
    }
  }

  await sleep(5000)

  console.log(ppl.length, 'people listed');
  console.log(found.length, 'people found');
  // console.log(removed.length , ' people found by phone or email but first name didn\'t match');

  contactToBulkTextFormat(found);  // MP Contact Format
  attendeeToBulkTextFormat(notFound); // Eventbrite Format

  await sleep(1000);
  Lib.updateCardIds(found, { prefix: 'C', onlyBlanks: true });
})()



async function contactToBulkTextFormat(attendees: CarShowContact[], fileName: string = 'onMp') {

  const contacts: CarShowContact[] = await removeDuplicates(attendees as unknown as EventContact[], false) as unknown as CarShowContact[];

  const groupedByPhone = groupBy(contacts, 'Mobile_Phone');

  console.log('groupedByPhone', groupedByPhone);

  const bulkContacts = contacts.map((att, i) => ({
    first: att.Nickname || att.First_Name, last: att.Last_Name, email: att.Email_Address,
    phone: att.Mobile_Phone, barcode: att.ID_Card, fam: i > 0 && att.Mobile_Phone === contacts[i - 1].Mobile_Phone
  }))

  fs.writeFileSync(`src/data/${eventName}/${eventName}_${fileName}.json`, JSON.stringify(bulkContacts, null, '\t'));
  fs.writeFileSync(`./src/data/${eventName}/${eventName}_${fileName}.csv`, await json2csv(bulkContacts, { emptyFieldValue: '' })); // For Badge printing
}



async function attendeeToBulkTextFormat(attendees: Attendee[], fileName: string = 'notOnMp') {
  const bulkAttendees = attendees.map((att, i) => ({
    first: att.FirstName, last: att.LastName, email: att.Email, phone: att.CellPhone, barcode: att.ID, fam: i > 0 && att.CellPhone === attendees[i - 1].CellPhone
  }))


  fs.writeFileSync(`src/data/${eventName}/${eventName}_${fileName}.json`, JSON.stringify(bulkAttendees, null, '\t'));
  fs.writeFileSync(`./src/data/${eventName}/${eventName}_${fileName}.csv`, await json2csv(bulkAttendees, { emptyFieldValue: '' }));

  console.log(attendees.length, 'people not found');
}
