import * as fs from 'fs'
import { getContact, C } from '../api/mp'
import { people } from '../data/attendees'
import { filterByName, formatPhone, sleep } from '../utils';
import { CarShowContact } from '../types/MP';
import { Lib } from '../api/lib';


// used to save json files
const eventName: string = 'carShow';


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

  fs.writeFileSync(`./src/data/${eventName}/${eventName}OnMP.json`, JSON.stringify(found, null, '\t'));
  fs.writeFileSync(`./src/data/${eventName}/${eventName}NoMP.json`, JSON.stringify(notFound, null, '\t'));
  fs.writeFileSync(`./src/data/${eventName}/${eventName}removedOnMP.json`, JSON.stringify(removed, null, '\t'));

  Lib.updateCardIds(found, {prefix: 'C', onlyBlanks: true});

})()