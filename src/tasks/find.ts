import * as fs from 'fs'
import { getBlankCardIds, getFormResponses, getRiverMembers, getRiverStaff, getAllRiverMembers, putCardId, getImage, getContact, P } from '../api/mp'
import { people } from '../data/eventbrite'
import { filterByName, formatPhone, sleep } from '../utils';
import { CarShowContact } from '../types/MP';
import { Lib } from '../api/lib';


(async function findMPRecord() {

  var found: any[] = [];
  var notFound: any[] = [];
  var removed: any[] = [];

  for (const person of people) {

    // await getContact(`((${Field.First_Name}='${person.FirstName}' AND ${Field.Last_Name}='${person.LastName}') OR (Display_Name Like '${person.FirstName}%' AND Display_Name Like '${person.LastName}%') OR (${Field.Nickname}='${person.FirstName}' AND ${Field.Last_Name}='${person.LastName}'))`)
    // if (res.length) console.log(person.CellPhone + ': found by name ✅')
    var res: CarShowContact[] = [];

    if (person.CellPhone) {
      res = await getContact(`Contacts.Mobile_Phone='${formatPhone(person.CellPhone)}'`);
    }

    if (res?.length) {
      console.log(person.CellPhone + ': found by phone ✅', res.length);
    } else if (person.Email) {
      res = await getContact(`Contacts.Email_Address='${person.Email}'`);
      if (res?.length) {
        console.log(person.CellPhone + ': found by email ✅', res.length)
      }
    }

    if (res?.length) {
      const filtered = filterByName(res, person)
      if (filtered.length)
        found = found.concat(filtered)
      else 
        removed = removed.concat(res)
    } else {
      notFound = notFound.concat(person)
      console.log(person.CellPhone + ': not found ❌')
    }
  }

  await sleep(5000)

  console.log(found.length + ' people found');
  console.log(notFound.length + ' people not found');
  console.log(removed.length + ' people found by first name didn\'t match');

  fs.writeFileSync('./src/data/carShow/carShowOnMP.json', JSON.stringify(found, null, '\t'));
  fs.writeFileSync('./src/data/carShow/carShowNoMP.json', JSON.stringify(notFound, null, '\t'));

  Lib.updateCardIds(found, {prefix: 'C', onlyBlanks: true});

})()