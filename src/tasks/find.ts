
import { getContact } from '../api/mp'
import { importCsv } from './import'
import { formatPhone, sleep } from '../utils';
import { Attendee, CarShowContact, EventContact } from '../types/MP';
import { Lib } from '../api/lib';
import { filterByName, removeDuplicates } from '../services/filters';
import { attendeeToBulkTextFormat, contactToBulkTextFormat } from '../services/converters';
import { saveAttendees, saveDevAttendees } from '../services/db';


// used to save json files
const eventName: string = 'carShow';

(async function findMPRecord() {

  const people: Attendee[] = await importCsv(`eventbrite.csv`);

  var found: CarShowContact[] = [];
  var removed: CarShowContact[] = [];
  var notFound: Attendee[] = [];

  for (const person of people) {

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

  console.log(people.length, 'people listed');
  console.log(found.length, 'people found');
  // console.log(removed.length , ' people found by phone or email but first name didn\'t match');

  found = await removeDuplicates(found as unknown as EventContact[], false) as unknown as CarShowContact[];
  const bulkContacts = await contactToBulkTextFormat(found, eventName);  // MP Contact Format
  saveAttendees(bulkContacts);

  const bulkAttendees = await attendeeToBulkTextFormat(notFound, eventName); // CSV (Eventbrite) Format
  saveAttendees(bulkAttendees);
  
  // saveDevAttendees();

  await sleep(1000);
  Lib.updateCardIds(found, { prefix: 'C', onlyBlanks: true });
})()
