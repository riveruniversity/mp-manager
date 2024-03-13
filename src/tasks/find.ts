

import { getContact } from '../api/mp'
import { people } from '../data/attendees'
import { formatPhone, sleep } from '../utils';
import { Attendee, CarShowContact, EventContact } from '../types/MP';
import { Lib } from '../api/lib';
import { removeDuplicates } from '../services/filters';
import { attendeeToBulkTextFormat, contactToBulkTextFormat, filterByName } from '../services/converters';


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

  contactToBulkTextFormat(found, eventName);  // MP Contact Format
  attendeeToBulkTextFormat(notFound, eventName); // CSV (Eventbrite) Format

  await sleep(1000);
  Lib.updateCardIds(found, { prefix: 'C', onlyBlanks: true });
})()
